<?php
/**
 * Games & Bets REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$input = Database::getJsonInput();
// Public: latest real big wins from server bet records (names masked, no ids/balances).
if ($action === 'big-wins') {
    $rows = Database::fetchAll("SELECT b.game_name, b.vendor, b.reward, b.time, u.username FROM bets b JOIN users u ON u.id = b.user_id WHERE b.reward >= ? AND b.reward > b.bet_amount ORDER BY b.time DESC LIMIT 12", [500]);
    $sum = Database::fetchOne("SELECT COALESCE(SUM(bet_amount),0) s FROM bets");
    $mask = function ($s) { $s = (string)$s; $n = mb_strlen($s); return $n <= 3 ? mb_substr($s, 0, 1) . '**' : mb_substr($s, 0, 2) . '*****' . mb_substr($s, -1); };
    $wins = array_map(fn($r) => ['gameName' => $r['game_name'], 'vendor' => $r['vendor'], 'amount' => (float)$r['reward'], 'time' => $r['time'], 'user' => $mask($r['username'])], $rows ?: []);
    Database::jsonResponse(['success' => true, 'wins' => $wins, 'totalBets' => (float)($sum['s'] ?? 0)]);
}
$userId = Database::requireUser();

require __DIR__.'/game_rounds.php';
if($action==='bet')Database::errorResponse('Client game payouts are disabled; trusted server rounds are required.',409);
switch ($action) {
    case 'bet':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
        $category = trim($input['category'] ?? 'slot');
        $vendor = trim($input['vendor'] ?? 'JILI');
        $gameName = trim($input['gameName'] ?? 'সুপার এস');
        $betAmount = (float)($input['betAmount'] ?? 0);
        $reward = (float)($input['reward'] ?? 0);
        $gameRound = trim($input['gameRound'] ?? ('#R' . rand(1000, 9999)));

        if ($betAmount <= 0) {
            Database::errorResponse('বেট পরিমাণ ০-এর বেশি হতে হবে।', 400);
        }

        if ($reward < 0) $reward = 0;
        if ($betAmount > 100000) Database::errorResponse('সর্বোচ্চ বেট ৳১,০০,০০০', 400);
        if ($reward > $betAmount * 5000) Database::errorResponse('অবৈধ গেম ফলাফল।', 400);
        $user = Database::fetchOne("SELECT * FROM `users` WHERE `id` = ?", [$userId]);
        if (!$user) Database::errorResponse('User not found', 404);

        if ((float)$user['balance'] < $betAmount) {
            Database::errorResponse('পর্যাপ্ত ব্যালেন্স নেই!', 400);
        }

        $profit = round($reward - $betAmount, 2);
        $newBalance = round((float)$user['balance'] - $betAmount + $reward, 2);
        $now = date('Y-m-d H:i:s');
        $today = date('Y-m-d');
        $orderNo = 'B' . date('YmdHis') . rand(100, 999);

        $betId = 'bet-' . uniqid();
        $betData = [
            'id' => $betId,
            'user_id' => $userId,
            'order_no' => $orderNo,
            'category' => $category,
            'vendor' => $vendor,
            'game_name' => $gameName,
            'game_round' => $gameRound,
            'bet_amount' => $betAmount,
            'valid_bet' => $betAmount,
            'reward' => $reward,
            'profit' => $profit,
            'time' => $now,
            'date' => $today
        ];

        Database::insert('bets', $betData);

        // Update user balance and VIP exp
        $expGain = (int)$betAmount;
        Database::update('users', [
            'balance' => $newBalance,
            'vip_exp' => (int)$user['vip_exp'] + $expGain
        ], "`id` = ?", [$userId]);

        // Referral commission on bet turnover (1.00%)
        $ref = Database::fetchOne("SELECT * FROM `referrals` WHERE `referred_user_id` = ?", [$userId]);
        if ($ref) {
            $betCommission = round($betAmount * 0.01, 2);
            Database::update('referrals', [
                'total_bet' => (float)$ref['total_bet'] + $betAmount,
                'bet_commission' => (float)$ref['bet_commission'] + $betCommission,
                'total_commission_earned' => (float)$ref['total_commission_earned'] + $betCommission
            ], "`id` = ?", [$ref['id']]);

            Database::execute("UPDATE `users` SET `balance` = `balance` + ?, `total_earnings` = `total_earnings` + ? WHERE `id` = ?", [$betCommission, $betCommission, $ref['referrer_id']]);
        }

        Database::jsonResponse([
            'success' => true,
            'bet' => $betData,
            'newBalance' => $newBalance,
            'profit' => $profit
        ]);
        break;

    case 'records':
        $category = $_GET['category'] ?? '';
        $date = $_GET['date'] ?? '';

        $sql = "SELECT * FROM `bets` WHERE `user_id` = ?";
        $params = [$userId];

        if (!empty($category) && $category !== 'all') {
            $sql .= " AND `category` = ?";
            $params[] = $category;
        }
        if (!empty($date)) {
            $sql .= " AND `date` = ?";
            $params[] = $date;
        }

        $sql .= " ORDER BY `time` DESC LIMIT 100";
        $bets = Database::fetchAll($sql, $params);

        $totalBet = 0;
        $validBet = 0;
        $totalReward = 0;
        $totalProfit = 0;

        foreach ($bets as $b) {
            $totalBet += (float)$b['bet_amount'];
            $validBet += (float)$b['valid_bet'];
            $totalReward += (float)$b['reward'];
            $totalProfit += (float)$b['profit'];
        }

        Database::jsonResponse([
            'success' => true,
            'count' => count($bets),
            'bets' => $bets,
            'summary' => [
                'totalBet' => round($totalBet, 2),
                'validBet' => round($validBet, 2),
                'totalReward' => round($totalReward, 2),
                'totalProfit' => round($totalProfit, 2)
            ]
        ]);
        break;

    case 'profit-loss':
        $bets = Database::fetchAll("SELECT `category`, `bet_amount`, `reward`, `profit` FROM `bets` WHERE `user_id` = ?", [$userId]);

        $totalBet = 0;
        $validBet = 0;
        $payout = 0;
        $netProfit = 0;
        $byCategory = [];

        foreach ($bets as $b) {
            $cat = $b['category'];
            if (!isset($byCategory[$cat])) {
                $byCategory[$cat] = ['totalBet' => 0, 'payout' => 0, 'netProfit' => 0];
            }
            $betAmt = (float)$b['bet_amount'];
            $rewAmt = (float)$b['reward'];
            $profAmt = (float)$b['profit'];

            $totalBet += $betAmt;
            $validBet += $betAmt;
            $payout += $rewAmt;
            $netProfit += $profAmt;

            $byCategory[$cat]['totalBet'] += $betAmt;
            $byCategory[$cat]['payout'] += $rewAmt;
            $byCategory[$cat]['netProfit'] += $profAmt;
        }

        Database::jsonResponse([
            'success' => true,
            'totalBet' => round($totalBet, 2),
            'validBet' => round($validBet, 2),
            'payout' => round($payout, 2),
            'netProfit' => round($netProfit, 2),
            'byCategory' => $byCategory
        ]);
        break;

    default:
        Database::errorResponse("Unknown games action: {$action}", 404);
        break;
}
