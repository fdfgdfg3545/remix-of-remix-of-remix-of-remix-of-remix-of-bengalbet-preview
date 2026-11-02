<?php
/**
 * Bonus/deposit wagering requirement before withdrawal (admin promo rules -> withdrawal).
 * Counts approved deposits, their bonus and other credited bonuses since the member's last
 * non-rejected withdrawal, and the valid bets placed in that same period.
 */
require_once __DIR__ . '/promo_rules.php';
if (!function_exists('bbTurnoverStatus')) {
function bbTurnoverStatus(string $uid): array {
    $w = bbPromoRules()['withdrawal'];
    $last = Database::fetchOne("SELECT MAX(created_at) AS m FROM transactions WHERE user_id=? AND type='withdraw' AND status IN ('pending','success')", [$uid])['m'] ?? null;
    $since = $last ?: '1970-01-01 00:00:00';
    $dep = Database::fetchOne("SELECT COALESCE(SUM(amount),0) a, COALESCE(SUM(bonus),0) b FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND COALESCE(processed_at, created_at) > ?", [$uid, $since]);
    $other = (float)Database::fetchOne("SELECT COALESCE(SUM(amount),0) a FROM transactions WHERE user_id=? AND type='bonus' AND status='success' AND created_at > ?", [$uid, $since])['a'];
    $bets = (float)Database::fetchOne('SELECT COALESCE(SUM(valid_bet),0) t FROM bets WHERE user_id=? AND `time` > ?', [$uid, $since])['t'];
    $required = empty($w['enabled']) ? 0.0 : round((float)$dep['a'] * (float)$w['depositTurnover'] + (float)$dep['b'] * (float)$w['depositBonusTurnover'] + $other * (float)$w['otherBonusTurnover'], 2);
    return ['enabled' => !empty($w['enabled']), 'since' => $last, 'deposits' => (float)$dep['a'], 'depositBonus' => (float)$dep['b'], 'otherBonus' => $other, 'required' => $required, 'completed' => $bets, 'remaining' => max(0.0, round($required - $bets, 2)), 'rules' => $w];
}
}
if ($action === 'turnover' && $method === 'GET') Database::jsonResponse(['success' => true] + bbTurnoverStatus($userId));
if ($action === 'withdraw' && $method === 'POST') {
    $t = bbTurnoverStatus($userId);
    if ($t['remaining'] > 0) Database::errorResponse('উত্তোলনের আগে আরও ৳' . number_format($t['remaining'], 2) . ' বাজি সম্পন্ন করতে হবে।', 409, ['turnover' => $t]);
}
