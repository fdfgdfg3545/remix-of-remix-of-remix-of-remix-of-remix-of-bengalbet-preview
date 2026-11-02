<?php
/**
 * Rescue Fund (Loss Rescue) REST API Endpoint
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/promo_rules.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'status';
$userId = Database::requireUser();
$input = Database::getJsonInput();
$targetDate = date('Y-m-d', strtotime('-1 day')); // plan: yesterday's loss, claim until 10:00

$rewardModule='rescue'; require __DIR__.'/reward_settlement.php';
switch ($action) {
    case 'status':
        $rr = bbPromoRules()['rescue'];
        $catIn = implode(',', array_fill(0, count($rr['categories']), '?'));
        $bets = Database::fetchAll("SELECT `bet_amount`, `reward` FROM `bets` WHERE `user_id` = ? AND `date` = ? AND `category` IN ($catIn)", array_merge([$userId, $targetDate], $rr['categories']));
        $totalBet = 0;
        $totalWin = 0;
        foreach ($bets as $b) {
            $totalBet += (float)$b['bet_amount'];
            $totalWin += (float)$b['reward'];
        }
        $netLoss = max(0, $totalBet - $totalWin);

        $tiers = Database::fetchAll("SELECT * FROM `rescue_tiers` WHERE `status` = 'active' ORDER BY `min_loss` DESC");
        $matchedTier = null;
        foreach ($tiers as $t) {
            if ($netLoss >= (float)$t['min_loss']) {
                $matchedTier = $t;
                break;
            }
        }

        $percentage = $matchedTier ? (float)$matchedTier['percentage'] : 3.0;
        $eligibleBonus = 0.00;
        if ($matchedTier && $netLoss > 0) {
            $eligibleBonus = min((float)$matchedTier['max_bonus'], round($netLoss * ($percentage / 100), 2));
        }

        $claim = Database::fetchOne("SELECT * FROM `rescue_claims` WHERE `user_id` = ? AND `date` = ?", [$userId, $targetDate]);

        Database::jsonResponse([
            'success' => true,
            'date' => $targetDate,
            'totalBet' => round($totalBet, 2),
            'totalWin' => round($totalWin, 2),
            'netLoss' => round($netLoss, 2),
            'percentage' => $percentage,
            'eligibleBonus' => $eligibleBonus,
            'matchedTier' => $matchedTier,
            'hasClaimedToday' => (bool)$claim,
            'claimOpen' => !empty($rr['enabled']) && (int)date('G') < (int)$rr['claimDeadlineHour'],
            'claimDeadline' => date('Y-m-d') . sprintf(' %02d:00:00', min(23, (int)$rr['claimDeadlineHour'])),
            'categories' => $rr['categories'],
            'claimRecord' => $claim,
            'tiers' => $tiers,
            'history' => Database::fetchAll("SELECT * FROM `rescue_claims` WHERE `user_id` = ? ORDER BY `claimed_at` DESC LIMIT 15", [$userId])
        ]);
        break;

    case 'claim':
        if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);

        $already = Database::fetchOne("SELECT `id` FROM `rescue_claims` WHERE `user_id` = ? AND `date` = ?", [$userId, $targetDate]);
        if ($already) {
            Database::errorResponse('আপনি আজকের উদ্ধার তহবিল ইতিমধ্যে দাবি করেছেন!', 400);
        }

        $bets = Database::fetchAll("SELECT `bet_amount`, `reward` FROM `bets` WHERE `user_id` = ? AND `date` = ?", [$userId, $targetDate]);
        $totalBet = 0;
        $totalWin = 0;
        foreach ($bets as $b) {
            $totalBet += (float)$b['bet_amount'];
            $totalWin += (float)$b['reward'];
        }
        $netLoss = max(0, $totalBet - $totalWin);

        $tiers = Database::fetchAll("SELECT * FROM `rescue_tiers` WHERE `status` = 'active' ORDER BY `min_loss` DESC");
        $matchedTier = null;
        foreach ($tiers as $t) {
            if ($netLoss >= (float)$t['min_loss']) {
                $matchedTier = $t;
                break;
            }
        }

        $percentage = $matchedTier ? (float)$matchedTier['percentage'] : 3.0;
        $bonus = $matchedTier ? min((float)$matchedTier['max_bonus'], round($netLoss * ($percentage / 100), 2)) : 0.00;

        if ($bonus <= 0) {
            // Minimum guaranteed consolation bonus if loss was experienced
            $bonus = $netLoss > 0 ? min(50.00, round($netLoss * 0.03, 2)) : 10.00;
        }

        $user = Database::fetchOne("SELECT `username`, `balance` FROM `users` WHERE `id` = ?", [$userId]);
        $username = $user ? $user['username'] : 'Player';

        $claimId = 'resc-' . uniqid();
        Database::insert('rescue_claims', [
            'id' => $claimId,
            'user_id' => $userId,
            'username' => $username,
            'date' => $targetDate,
            'total_bet' => $totalBet,
            'total_win' => $totalWin,
            'net_loss' => $netLoss,
            'percentage' => $percentage,
            'bonus_amount' => $bonus,
            'status' => 'approved',
            'claimed_at' => date('Y-m-d H:i:s')
        ]);

        Database::execute("UPDATE `users` SET `balance` = `balance` + ? WHERE `id` = ?", [$bonus, $userId]);

        // Transaction record
        Database::insert('transactions', [
            'id' => 'tx-' . uniqid(),
            'user_id' => $userId,
            'type' => 'bonus',
            'amount' => $bonus,
            'channel' => 'system',
            'trx_id' => 'RSC' . date('YmdHis') . rand(100, 999),
            'status' => 'success',
            'description' => "লস রেসকিউ তহবিল ক্যাশব্যাক (৳{$bonus})",
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $newBal = (float)$user['balance'] + $bonus;

        Database::jsonResponse([
            'success' => true,
            'message' => "৳{$bonus} লস রেসকিউ ক্যাশব্যাক সফলভাবে জমা হয়েছে!",
            'bonusAmount' => $bonus,
            'newBalance' => $newBal
        ]);
        break;

    default:
        Database::errorResponse("Unknown rescue action: {$action}", 404);
        break;
}
