<?php
/**
 * Server-decided game rounds. The member sends only the game and the bet;
 * the server picks the result from the admin game-engine settings (RTP, volatility, max multiplier),
 * then debits the bet, credits the win, records the bet, VIP EXP and referral turnover in one transaction.
 * Keep the payout math identical to src/bengalbet/services/gameRounds.ts.
 */
require_once __DIR__ . '/reward_grants.php';
require_once __DIR__ . '/vip_progress.php';
require_once __DIR__.'/withdraw_activation.php';
if (!function_exists('bbGamePools')) {
function bbGamePools(): array {
    return [
        'low' => [0.42, [1.1, 1.3, 1.6, 2.2, 3.5, 6.0]],
        'medium' => [0.28, [1.2, 1.5, 2.0, 3.0, 5.0, 10.0, 25.0]],
        'high' => [0.18, [1.5, 2.5, 5.0, 12.0, 30.0, 75.0, 150.0]],
        'extreme' => [0.10, [2.0, 5.0, 15.0, 50.0, 150.0, 500.0, 1000.0]],
    ];
}
function bbGameEngine(): array {
    $row = Database::fetchOne('SELECT game_engine_json FROM site_settings WHERE id = 1');
    $e = $row ? (json_decode($row['game_engine_json'] ?? '{}', true) ?: []) : [];
    return $e;
}
/** RTP for one game: game override, then category, then global. Always 0..99.5. */
function bbGameRtp(array $e, string $gameId, string $category): float {
    $clean = preg_replace('/^(game-|slot-)/', '', strtolower($gameId));
    $rtp = $e['gameRtp'][$clean] ?? $e['gameRtp'][$gameId] ?? $e['categoryRtp'][$category] ?? $e['globalRtp'] ?? 96.5;
    return max(0.0, min(99.5, (float)$rtp));
}
/** Multipliers usable under the cap and the hit chance that makes the expected return equal the RTP. */
function bbGamePlan(array $e, float $rtp): array {
    $pools = bbGamePools(); $vol = $e['volatility'] ?? 'medium'; if (!isset($pools[$vol])) $vol = 'medium';
    $cap = max(1.1, (float)($e['maxMultiplierCap'] ?? 5000));
    $mults = array_values(array_filter($pools[$vol][1], fn($m) => $m <= $cap)); if (!$mults) $mults = [min($cap, 1.1)];
    $mean = array_sum($mults) / count($mults);
    $hit = min(0.95, ($rtp / 100) / $mean);
    return ['mults' => $mults, 'hit' => $hit];
}
}
if ($action === 'round') {
    if ($method !== 'POST') Database::errorResponse('Method Not Allowed', 405);
    $bet = round((float)($input['betAmount'] ?? 0), 2);
    $category = strtolower(trim((string)($input['category'] ?? 'slot')));
    $allowed = ['slot', 'fishing', 'live', 'crash', 'table', 'arcade', 'poker', 'sports', 'esports', 'lottery', 'hot'];
    if (!in_array($category, $allowed, true)) $category = 'slot';
    $gameId = substr(preg_replace('/[^a-z0-9_-]/i', '', (string)($input['gameId'] ?? 'game')), 0, 60);
    $gameName = mb_substr(trim((string)($input['gameName'] ?? $gameId)), 0, 80);
    $vendor = mb_substr(trim((string)($input['vendor'] ?? 'BengalBet')), 0, 40);
    if (!is_finite($bet) || $bet < 1) Database::errorResponse('বেট কমপক্ষে ৳১ হতে হবে।', 400);
    if ($bet > 100000) Database::errorResponse('সর্বোচ্চ বেট ৳১,০০,০০০', 400);

    $e = bbGameEngine(); $rtp = bbGameRtp($e, $gameId, $category); $plan = bbGamePlan($e, $rtp);
    $win = (random_int(1, 1000000) / 1000000) <= $plan['hit'];
    $mult = $win ? $plan['mults'][random_int(0, count($plan['mults']) - 1)] : 0.0;
    $payout = round($bet * $mult, 2);

    $pdo = Database::getConnection();
    try {
        $pdo->beginTransaction();
        $user = Database::fetchOne('SELECT * FROM users WHERE id = ? FOR UPDATE', [$userId]);
        if (!$user || $user['status'] !== 'active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
        bbActivationCheck($user);
        if ((float)$user['balance'] < $bet) throw new RuntimeException('পর্যাপ্ত ব্যালেন্স নেই!');
        $now = date('Y-m-d H:i:s');
        $betRow = ['id' => 'bet-' . bin2hex(random_bytes(8)), 'user_id' => $userId, 'order_no' => 'B' . date('YmdHis') . random_int(100, 999), 'category' => $category, 'vendor' => $vendor, 'game_name' => $gameName, 'game_round' => '#S' . bin2hex(random_bytes(4)), 'bet_amount' => $bet, 'valid_bet' => $bet, 'reward' => $payout, 'profit' => round($payout - $bet, 2), 'time' => $now, 'date' => date('Y-m-d')];
        Database::insert('bets', $betRow);
        Database::execute('UPDATE users SET balance = balance - ? + ?, vip_exp = vip_exp + ? WHERE id = ?', [$bet, $payout, (int)floor($bet), $userId]);
        $ref = Database::fetchOne('SELECT * FROM referrals WHERE referred_user_id = ? FOR UPDATE', [$userId]);
        if ($ref) {
            $rs = bbReferralSettings();
            Database::fetchOne('SELECT id FROM users WHERE id=? FOR UPDATE',[$ref['referrer_id']]);
            $c = !empty($rs['enabled']) && bbHasLifetimeDeposit($ref['referrer_id']) ? round($bet * (float)$rs['betTurnoverRebateRate'] / 100, 2) : 0.0;
            Database::update('referrals', ['total_bet' => (float)$ref['total_bet'] + $bet, 'bet_commission' => (float)$ref['bet_commission'] + $c, 'total_commission_earned' => (float)$ref['total_commission_earned'] + $c], 'id = ?', [$ref['id']]);
            if ($c > 0) Database::execute('UPDATE users SET balance = balance + ?, total_earnings = total_earnings + ? WHERE id = ?', [$c, $c, $ref['referrer_id']]);
            bbLogReferralCommission($ref['referrer_id'], $c, "রেফারেল বাজি কমিশন: {$ref['referred_username']}");
            bbReferralQualify($userId);
        }
        $pdo->commit();
        bbVipSync($userId);
    } catch (Throwable $ex) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        Database::errorResponse($ex instanceof RuntimeException && !($ex instanceof PDOException) ? $ex->getMessage() : 'গেম রাউন্ড সম্পন্ন হয়নি', 400);
    }
    $u = Database::fetchOne('SELECT balance, vip_exp FROM users WHERE id = ?', [$userId]);
    Database::jsonResponse(['success' => true, 'round' => ['isWin' => $win, 'multiplier' => $mult, 'payout' => $payout, 'bet' => $bet, 'isJackpot' => $mult >= 50, 'rtp' => $rtp], 'bet' => $betRow, 'newBalance' => (float)$u['balance'], 'vipExp' => (int)$u['vip_exp']]);
}
