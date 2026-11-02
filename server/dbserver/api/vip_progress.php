<?php
/**
 * VIP level from the plan: the highest active vip_tiers level whose bet target AND deposit target
 * the member has reached (lifetime valid bets and approved deposits). Levels only go up here;
 * admin can still set a level manually. Upgrade/weekly/monthly rewards are claimed separately.
 */
if (!function_exists('bbVipSync')) {
function bbVipSync(string $uid): int {
    $u = Database::fetchOne('SELECT vip_level FROM users WHERE id=?', [$uid]);
    if (!$u) return 0;
    $bet = (float)Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) t FROM bets WHERE user_id=?', [$uid])['t'];
    $dep = (float)Database::fetchOne("SELECT COALESCE(SUM(amount),0) t FROM transactions WHERE user_id=? AND type='deposit' AND status='success'", [$uid])['t'];
    $row = Database::fetchOne("SELECT MAX(level) l FROM vip_tiers WHERE status='active' AND target_bet<=? AND deposit_target<=?", [$bet, $dep]);
    $earned = (int)($row['l'] ?? 0); $cur = (int)$u['vip_level'];
    if ($earned > $cur) { Database::execute('UPDATE users SET vip_level=? WHERE id=? AND vip_level<?', [$earned, $uid, $earned]); return $earned; }
    return $cur;
}
}
if (!function_exists('bbVipSyncWithPending')) {
/** Same as bbVipSync, counting the deposit being approved now exactly once (callers update its status before or after). */
function bbVipSyncWithPending(string $uid, float $extraDeposit, string $txId): int {
    $u = Database::fetchOne('SELECT vip_level FROM users WHERE id=?', [$uid]);
    if (!$u) return 0;
    $bet = (float)Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) t FROM bets WHERE user_id=?', [$uid])['t'];
    $dep = $extraDeposit + (float)Database::fetchOne("SELECT COALESCE(SUM(amount),0) t FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND id<>?", [$uid, $txId])['t'];
    $earned = (int)(Database::fetchOne("SELECT MAX(level) l FROM vip_tiers WHERE status='active' AND target_bet<=? AND deposit_target<=?", [$bet, $dep])['l'] ?? 0);
    if ($earned > (int)$u['vip_level']) Database::execute('UPDATE users SET vip_level=? WHERE id=? AND vip_level<?', [$earned, $uid, $earned]);
    return max($earned, (int)$u['vip_level']);
}
}
