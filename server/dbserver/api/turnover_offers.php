<?php
/**
 * Turnover offers from the promotion plan, all read from admin promo rules:
 * - slot_daily: yesterday's slot valid bets >= minBet -> ratePercent (capped), claim from claimFromHour
 * - rebate: real-time rebate on valid bets since the last rebate claim (max 3%)
 * - member_day: on the member-day date, bets from the 1st up to the day before >= minBet -> ratePercent (capped)
 * Included by rewards.php after the member is authenticated ($userId).
 */
require_once __DIR__ . '/reward_grants.php';
if (!function_exists('bbTurnoverBonus')) {
function bbTurnoverBonus(float $turnover, float $minBet, float $rate, float $max): float {
    if ($turnover <= 0 || $turnover < $minBet) return 0.0;
    $b = round($turnover * $rate) / 100;
    return round($max > 0 ? min($b, $max) : $b, 2);
}
function bbOfferState(string $uid, string $offer): array {
    $r = bbPromoRules(); $now = time();
    if ($offer === 'slot_daily') {
        $c = $r['slotDaily']; $date = date('Y-m-d', strtotime('-1 day'));
        $t = (float)Database::fetchOne("SELECT COALESCE(SUM(valid_bet),0) AS t FROM bets WHERE user_id=? AND date=? AND category='slot'", [$uid, $date])['t'];
        $bonus = bbTurnoverBonus($t, (float)$c['minBet'], (float)$c['ratePercent'], (float)$c['maxBonus']);
        $claimed = (bool)Database::fetchOne('SELECT 1 AS x FROM reward_grants WHERE user_id=? AND grant_key=?', [$uid, 'slot_daily:' . $date]);
        $open = !empty($c['enabled']) && (int)date('G', $now) >= (int)$c['claimFromHour'];
        return ['offer' => $offer, 'turnover' => $t, 'bonus' => $bonus, 'claimed' => $claimed, 'open' => $open, 'eligible' => $open && !$claimed && $bonus > 0, 'key' => 'slot_daily:' . $date, 'label' => 'দৈনিক স্লট বোনাস'];
    }
    if ($offer === 'rebate') {
        $c = $r['rebate'];
        $last = Database::fetchOne("SELECT MAX(created_at) AS m FROM reward_grants WHERE user_id=? AND grant_key LIKE 'rebate:%'", [$uid])['m'] ?? null;
        $t = (float)Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) AS t FROM bets WHERE user_id=? AND `time` > ?', [$uid, $last ?: '1970-01-01 00:00:00'])['t'];
        $bonus = bbTurnoverBonus($t, 0.0, (float)$c['ratePercent'], 0.0);
        return ['offer' => $offer, 'turnover' => $t, 'bonus' => $bonus, 'claimed' => false, 'open' => !empty($c['enabled']), 'eligible' => !empty($c['enabled']) && $bonus >= 0.01, 'key' => 'rebate:' . date('YmdHis') . bin2hex(random_bytes(3)), 'since' => $last, 'label' => 'রিয়েল টাইম রিবেট'];
    }
    if ($offer === 'member_day') {
        $c = $r['memberDay']; $day = (int)$c['day']; $month = date('Y-m');
        $from = $month . '-01'; $to = $month . '-' . sprintf('%02d', $day - 1);
        $t = (float)Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) AS t FROM bets WHERE user_id=? AND date BETWEEN ? AND ?', [$uid, $from, $to])['t'];
        $bonus = bbTurnoverBonus($t, (float)$c['minBet'], (float)$c['ratePercent'], (float)$c['maxBonus']);
        $claimed = (bool)Database::fetchOne('SELECT 1 AS x FROM reward_grants WHERE user_id=? AND grant_key=?', [$uid, 'member_day:' . $month]);
        $open = !empty($c['enabled']) && (int)date('j', $now) === $day;
        return ['offer' => $offer, 'turnover' => $t, 'bonus' => $bonus, 'claimed' => $claimed, 'open' => $open, 'eligible' => $open && !$claimed && $bonus > 0, 'key' => 'member_day:' . $month, 'day' => $day, 'label' => 'সদস্য দিবস'];
    }
    throw new RuntimeException('Unknown offer');
}
}
if (($_GET['action'] ?? '') === 'offers-status' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $out = [];
    foreach (['slot_daily', 'rebate', 'member_day'] as $o) { $s = bbOfferState($userId, $o); unset($s['key']); $out[$o] = $s; }
    Database::jsonResponse(['success' => true, 'offers' => $out, 'serverTime' => date('Y-m-d H:i:s')]);
}
if (($_GET['action'] ?? '') === 'offer-claim' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $offer = (string)($input['offer'] ?? '');
    if (!in_array($offer, ['slot_daily', 'rebate', 'member_day'], true)) Database::errorResponse('Unknown offer', 400);
    $pdo = Database::getConnection();
    try {
        $pdo->beginTransaction();
        $user = Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE', [$userId]);
        if (!$user || $user['status'] !== 'active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
        $st = bbOfferState($userId, $offer);
        if (!$st['open']) throw new RuntimeException($st['label'] . ' এখন দাবি করা যায় না।');
        if ($st['claimed']) throw new RuntimeException($st['label'] . ' ইতিমধ্যে নেওয়া হয়েছে।');
        if ($st['bonus'] <= 0) throw new RuntimeException($st['label'] . ' এর শর্ত পূরণ হয়নি।');
        if (!bbGrantOnce($userId, $st['key'])) throw new RuntimeException($st['label'] . ' ইতিমধ্যে নেওয়া হয়েছে।');
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?', [$st['bonus'], $userId]);
        Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $userId, 'username' => $user['username'], 'user_phone' => $user['phone'], 'type' => 'bonus', 'amount' => $st['bonus'], 'channel' => 'system', 'trx_id' => 'OFR' . date('YmdHis') . random_int(100, 999), 'status' => 'success', 'description' => $st['label'] . ' ৳' . $st['bonus'], 'created_at' => date('Y-m-d H:i:s')]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'Bonus could not be processed', 400);
    }
    $bal = (float)Database::fetchOne('SELECT balance FROM users WHERE id=?', [$userId])['balance'];
    Database::jsonResponse(['success' => true, 'offer' => $offer, 'amount' => $st['bonus'], 'newBalance' => $bal]);
}
/** Daily betting missions: today's valid bets (mission category) unlock each tier once per day. */
if (!function_exists('bbMissionState')) {
function bbMissionState(string $uid): array {
    $c = bbPromoRules()['missions']; $date = date('Y-m-d');
    $sql = 'SELECT COALESCE(SUM(valid_bet),0) AS t FROM bets WHERE user_id=? AND date=?' . ($c['category'] === 'all' ? '' : ' AND category=?');
    $args = $c['category'] === 'all' ? [$uid, $date] : [$uid, $date, $c['category']];
    $t = (float)Database::fetchOne($sql, $args)['t'];
    $claimed = array_column(Database::fetchAll("SELECT grant_key FROM reward_grants WHERE user_id=? AND grant_key LIKE ?", [$uid, "mission:$date:%"]), 'grant_key');
    $tiers = [];
    foreach ($c['tiers'] as $i => $x) {
        $key = "mission:$date:" . ($i + 1); $done = in_array($key, $claimed, true);
        $tiers[] = ['id' => $i + 1, 'bet' => $x['bet'], 'bonus' => $x['bonus'], 'claimed' => $done, 'eligible' => !empty($c['enabled']) && !$done && $t >= $x['bet'], 'key' => $key];
    }
    return ['enabled' => !empty($c['enabled']), 'category' => $c['category'], 'turnover' => $t, 'date' => $date, 'resetsAt' => date('Y-m-d 00:00:00', strtotime('+1 day')), 'tiers' => $tiers];
}
}
if (($_GET['action'] ?? '') === 'missions-status' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $s = bbMissionState($userId); foreach ($s['tiers'] as &$x) unset($x['key']); unset($x);
    Database::jsonResponse(['success' => true, 'missions' => $s, 'serverTime' => date('Y-m-d H:i:s')]);
}
if (($_GET['action'] ?? '') === 'mission-claim' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $tierId = (int)($input['tier'] ?? 0);
    $pdo = Database::getConnection();
    try {
        $pdo->beginTransaction();
        $user = Database::fetchOne('SELECT * FROM users WHERE id=? FOR UPDATE', [$userId]);
        if (!$user || $user['status'] !== 'active') throw new RuntimeException('সক্রিয় সদস্য অ্যাকাউন্ট প্রয়োজন।');
        $s = bbMissionState($userId);
        if (!$s['enabled']) throw new RuntimeException('মিশন এখন বন্ধ।');
        $tier = $s['tiers'][$tierId - 1] ?? null;
        if (!$tier) throw new RuntimeException('মিশন পাওয়া যায়নি।');
        if ($tier['claimed']) throw new RuntimeException('এই মিশন আজ নেওয়া হয়েছে।');
        if (!$tier['eligible']) throw new RuntimeException('মিশনের বাজি এখনো পূরণ হয়নি।');
        if (!bbGrantOnce($userId, $tier['key'])) throw new RuntimeException('এই মিশন আজ নেওয়া হয়েছে।');
        Database::execute('UPDATE users SET balance=balance+? WHERE id=?', [$tier['bonus'], $userId]);
        Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $userId, 'username' => $user['username'], 'user_phone' => $user['phone'], 'type' => 'bonus', 'amount' => $tier['bonus'], 'channel' => 'system', 'trx_id' => 'MSN' . date('YmdHis') . random_int(100, 999), 'status' => 'success', 'description' => "মিশন {$tierId} বোনাস ৳{$tier['bonus']}", 'created_at' => date('Y-m-d H:i:s')]);
        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        Database::errorResponse($e instanceof RuntimeException && !($e instanceof PDOException) ? $e->getMessage() : 'Mission could not be processed', 400);
    }
    $bal = (float)Database::fetchOne('SELECT balance FROM users WHERE id=?', [$userId])['balance'];
    Database::jsonResponse(['success' => true, 'tier' => $tierId, 'amount' => $tier['bonus'], 'newBalance' => $bal]);
}
