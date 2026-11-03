<?php
/**
 * One-time reward grants that follow the promotion plan:
 * - daily login: 1 golden-egg hammer per day
 * - approved deposit: +1 golden egg each, up to 3 per day; approved deposit >= 1000: 1 lucky-wheel ticket per day
 * - referral: 300 once when the friend has approved deposits >= 500 and turnover >= 2000
 * - red packet rain: admin rounds (plan: 00/12/16/20 for 30 minutes), 1 per member, first N members
 * All grants are idempotent through reward_grants (user_id, grant_key).
 */
require_once __DIR__ . '/promo_rules.php';
require_once __DIR__.'/bonus_eligibility.php';
if (!function_exists('bbGrantOnce')) {
function bbGrantOnce(string $uid, string $key): bool {
    bbRequireBonusDeposit($uid);
    return Database::execute('INSERT IGNORE INTO reward_grants (user_id, grant_key, created_at) VALUES (?,?,?)', [$uid, substr($key, 0, 64), date('Y-m-d H:i:s')]) === 1;
}
function bbDailyLoginEgg(string $uid): bool {
    if(!bbHasLifetimeDeposit($uid))return false;
    $n = (int)bbPromoRules()['loginHammerPerDay'];
    if ($n <= 0 || !bbGrantOnce($uid, 'login_egg:' . date('Y-m-d'))) return false;
    Database::execute('UPDATE users SET golden_eggs_available = golden_eggs_available + ? WHERE id = ?', [$n, $uid]);
    return true;
}
function bbDepositGrants(string $uid, float $amount): void {
    $day = date('Y-m-d'); $r = bbPromoRules();
    for ($i = 1; $i <= (int)$r['depositEggsPerDay']; $i++) {
        if (bbGrantOnce($uid, "deposit_egg:$day:$i")) { Database::execute('UPDATE users SET golden_eggs_available = golden_eggs_available + 1 WHERE id = ?', [$uid]); break; }
    }
    if ($amount >= (float)$r['wheelTicketMinDeposit']) {
        for ($i = 1; $i <= (int)$r['wheelTicketsPerDay']; $i++) {
            if (bbGrantOnce($uid, "deposit_spin:$day:$i")) { Database::execute('UPDATE users SET free_spins = free_spins + 1 WHERE id = ?', [$uid]); break; }
        }
    }
}
function bbReferralSettings(): array {
    $defaults = ['enabled' => true, 'instantBonusPerFriend' => 300, 'minDepositToQualify' => 500, 'minBetTurnoverToQualify' => 2000, 'depositRebateRate' => 0.70, 'betTurnoverRebateRate' => 1.00, 'maxBonusCap' => 100000, 'autoCreditInstantBonus' => true];
    $file = __DIR__ . '/../data/referral_settings.json';
    $cur = is_file($file) ? (json_decode((string)file_get_contents($file), true) ?: []) : [];
    if (!isset($cur['minBetTurnoverToQualify']) && isset($cur['minTurnoverToQualify'])) $cur['minBetTurnoverToQualify'] = $cur['minTurnoverToQualify'];
    $out = array_merge($defaults, array_intersect_key($cur, $defaults));
    foreach (['instantBonusPerFriend','minDepositToQualify','minBetTurnoverToQualify','depositRebateRate','betTurnoverRebateRate','maxBonusCap'] as $k) $out[$k] = is_numeric($out[$k]) && $out[$k] >= 0 ? (float)$out[$k] : (float)$defaults[$k];
    foreach (['enabled','autoCreditInstantBonus'] as $k) $out[$k] = (bool)$out[$k];
    return $out;
}
/** Logs a referral commission as a bonus transaction so it counts toward the withdrawal wagering rule. */
function bbLogReferralCommission(string $referrerId, float $amount, string $desc): void {
    if ($amount <= 0) return;
    $r = Database::fetchOne('SELECT username, phone FROM users WHERE id = ?', [$referrerId]);
    if (!$r) return;
    Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $referrerId, 'username' => $r['username'], 'user_phone' => $r['phone'], 'type' => 'bonus', 'amount' => $amount, 'channel' => 'system', 'trx_id' => 'RFC' . date('YmdHis') . random_int(100, 999), 'status' => 'success', 'description' => $desc, 'created_at' => date('Y-m-d H:i:s')]);
}

/** Pays the referrer's instant bonus once when the referred friend qualifies. Call inside a DB transaction. */
function bbReferralQualify(string $referredUid): float {
    $s = bbReferralSettings();
    if (empty($s['enabled']) || empty($s['autoCreditInstantBonus'])) return 0.0;
    $ref = Database::fetchOne('SELECT * FROM referrals WHERE referred_user_id = ? FOR UPDATE', [$referredUid]);
    if (!$ref || (int)$ref['instant_bonus_paid'] === 1) return 0.0;
    if ((float)$ref['total_deposit'] < (float)$s['minDepositToQualify'] || (float)$ref['total_bet'] < (float)$s['minBetTurnoverToQualify']) return 0.0;
    $bonus = round(min((float)$s['instantBonusPerFriend'], (float)$s['maxBonusCap']), 2);
    if ($bonus <= 0) return 0.0;
    $referrer = Database::fetchOne('SELECT id, username, phone FROM users WHERE id = ? FOR UPDATE', [$ref['referrer_id']]);
    if (!$referrer || !bbHasLifetimeDeposit($referrer['id'])) return 0.0;
    Database::update('referrals', ['instant_bonus_paid' => 1, 'instant_bonus_amount' => $bonus, 'status' => 'active', 'total_commission_earned' => (float)$ref['total_commission_earned'] + $bonus], 'id = ?', [$ref['id']]);
    Database::execute('UPDATE users SET balance = balance + ?, total_earnings = total_earnings + ? WHERE id = ?', [$bonus, $bonus, $referrer['id']]);
    Database::insert('transactions', ['id' => 'tx-' . bin2hex(random_bytes(8)), 'user_id' => $referrer['id'], 'username' => $referrer['username'], 'user_phone' => $referrer['phone'], 'type' => 'bonus', 'amount' => $bonus, 'channel' => 'system', 'trx_id' => 'REF' . date('YmdHis') . random_int(100, 999), 'status' => 'success', 'description' => "রেফারেল বোনাস: {$ref['referred_username']} যোগ্য হয়েছেন", 'created_at' => date('Y-m-d H:i:s')]);
    return $bonus;
}
function bbPacketWindow(?int $ts = null): ?string {
    $ts = $ts ?? time(); $p = bbPromoRules()['redPacket'];
    if (empty($p['enabled'])) return null;
    $h = (int)date('G', $ts); $m = (int)date('i', $ts);
    return in_array($h, $p['hours'], true) && $m < (int)$p['durationMinutes'] ? date('Y-m-d', $ts) . '-' . $h : null;
}
function bbPacketLimit(): int { return (int)bbPromoRules()['redPacket']['perRoundLimit']; }
function bbPacketHoursText(): string {
    $p = bbPromoRules()['redPacket'];
    return implode(', ', array_map(fn($h) => sprintf('%02d:00', $h), $p['hours'])) . ' (' . (int)$p['durationMinutes'] . ' মিনিট)';
}
}
