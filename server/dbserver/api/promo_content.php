<?php
/**
 * Admin-editable promotion pages (title, banner, texts, order, on/off) and the live rule data
 * every promotion page shows. Stored as one JSON list; an empty store means "use the site's built-in list".
 */
if (!function_exists('bbPromoContent')) {
function bbPromoText($v, int $max): string { return mb_substr(trim((string)$v), 0, $max); }
function bbPromoLines($v): array {
    if (!is_array($v)) return [];
    $out = []; foreach (array_slice($v, 0, 12) as $l) { $t = bbPromoText($l, 300); if ($t !== '') $out[] = $t; } return $out;
}
function bbValidatePromoContent($list): array {
    if (!is_array($list) || count($list) > 40) throw new InvalidArgumentException('Invalid promotion list');
    $cats = ['all', 'hot', 'new_member', 'deposit', 'rebate', 'app_download'];
    $actions = ['claim', 'deposit', 'spin', 'invite', 'download', 'view'];
    $out = []; $ids = [];
    foreach (array_values($list) as $p) {
        if (!is_array($p)) throw new InvalidArgumentException('Invalid promotion');
        $id = preg_replace('/[^a-z0-9_-]/i', '', (string)($p['id'] ?? ''));
        if ($id === '' || isset($ids[$id])) throw new InvalidArgumentException('Each promotion needs a unique id');
        $ids[$id] = true;
        $img = trim((string)($p['bannerImage'] ?? ''));
        if ($img !== '' && !preg_match('#^(asset:[a-z0-9_-]+|https://[^\s"<>]+)$#i', $img)) throw new InvalidArgumentException("Invalid banner for $id");
        $title = bbPromoText($p['titleBn'] ?? '', 160);
        if ($title === '') throw new InvalidArgumentException("Title required for $id");
        $out[] = [
            'id' => $id, 'enabled' => !array_key_exists('enabled', $p) || $p['enabled'] === true,
            'titleBn' => $title, 'titleEn' => bbPromoText($p['titleEn'] ?? '', 160),
            'subtitleBn' => bbPromoText($p['subtitleBn'] ?? '', 200), 'subtitleEn' => bbPromoText($p['subtitleEn'] ?? '', 200),
            'category' => in_array($p['category'] ?? '', $cats, true) ? $p['category'] : 'hot',
            'badge' => bbPromoText($p['badge'] ?? '', 30), 'badgeBn' => bbPromoText($p['badgeBn'] ?? '', 30),
            'bannerImage' => $img, 'bannerGradient' => bbPromoText($p['bannerGradient'] ?? '', 120),
            'iconType' => bbPromoText($p['iconType'] ?? 'terms', 30), 'accentColor' => preg_match('/^#[0-9a-f]{3,8}$/i', (string)($p['accentColor'] ?? '')) ? $p['accentColor'] : '#f59e0b',
            'highlightNumber' => bbPromoText($p['highlightNumber'] ?? '', 80), 'validUntil' => bbPromoText($p['validUntil'] ?? '', 80), 'claimableAmount' => bbPromoText($p['claimableAmount'] ?? '', 80),
            'requirementsBn' => bbPromoLines($p['requirementsBn'] ?? []), 'requirementsEn' => bbPromoLines($p['requirementsEn'] ?? []),
            'rulesBn' => bbPromoLines($p['rulesBn'] ?? []), 'rulesEn' => bbPromoLines($p['rulesEn'] ?? []),
            'actionTextBn' => bbPromoText($p['actionTextBn'] ?? '', 60), 'actionTextEn' => bbPromoText($p['actionTextEn'] ?? '', 60),
            'actionType' => in_array($p['actionType'] ?? '', $actions, true) ? $p['actionType'] : 'view',
        ];
    }
    return $out;
}
function bbPromoContent(): ?array {
    $row = Database::fetchOne('SELECT config_json FROM promo_content_config WHERE id = 1');
    if (!$row) return null;
    try { return bbValidatePromoContent(json_decode($row['config_json'], true)); } catch (InvalidArgumentException $e) { return null; }
}
/** Everything a promotion page needs to show the rules the server actually enforces. */
function bbPromoLiveRules(): array {
    require_once __DIR__ . '/promo_rules.php';
    require_once __DIR__ . '/deposit_offer_rules.php';
    require_once __DIR__ . '/reward_grants.php';
    $chance = []; $f = __DIR__ . '/../data/chance_rewards.json';
    $cfg = is_file($f) ? (json_decode((string)file_get_contents($f), true) ?: []) : [];
    foreach (['spin', 'golden_egg', 'red_envelope'] as $t) {
        $amts = array_map(fn($r) => (float)($r['amount'] ?? 0), $cfg[$t] ?? []);
        $chance[$t] = ['min' => $amts ? min($amts) : 0, 'max' => $amts ? max($amts) : 0, 'count' => count($amts)];
    }
    $mrow = Database::fetchOne('SELECT config_json FROM mystery_reward_config WHERE id=1');
    $mystery = array_merge(['enabled' => true, 'minBonusAmount' => 1000, 'maxBonusAmount' => 50000, 'triggerDayOfMonth' => 23, 'triggerHour' => 18, 'minBetRequired' => 500, 'wageringTurnover' => 1], $mrow ? (json_decode($mrow['config_json'], true) ?: []) : []);
    $rescue = Database::fetchAll("SELECT min_loss, percentage, max_bonus FROM rescue_tiers WHERE status='active' ORDER BY min_loss ASC");
    $vip = Database::fetchAll("SELECT level, name, target_bet, deposit_target, upgrade_bonus, weekly_bonus, monthly_bonus, birthday_bonus FROM vip_tiers WHERE status='active' ORDER BY level ASC");
    $limits = Database::fetchOne('SELECT min_deposit, max_deposit, min_withdraw, max_withdraw FROM site_settings WHERE id=1') ?: [];
    return [
        'promoRules' => bbPromoRules(), 'depositOffer' => bbDepositOffer(), 'referral' => bbReferralSettings(),
        'chance' => $chance, 'mystery' => $mystery,
        'rescueTiers' => array_map(fn($r) => ['minLoss' => (float)$r['min_loss'], 'percentage' => (float)$r['percentage'], 'maxBonus' => (float)$r['max_bonus']], $rescue),
        'vipTiers' => array_map(fn($r) => ['level' => (int)$r['level'], 'name' => $r['name'], 'targetBet' => (float)$r['target_bet'], 'depositTarget' => (float)$r['deposit_target'], 'upgradeBonus' => (float)$r['upgrade_bonus'], 'weeklyBonus' => (float)$r['weekly_bonus'], 'monthlyBonus' => (float)$r['monthly_bonus'], 'birthdayBonus' => (float)$r['birthday_bonus']], $vip),
        'limits' => ['minDeposit' => (float)($limits['min_deposit'] ?? 200), 'maxDeposit' => (float)($limits['max_deposit'] ?? 50000), 'minWithdraw' => (float)($limits['min_withdraw'] ?? 500), 'maxWithdraw' => (float)($limits['max_withdraw'] ?? 100000)],
    ];
}
}
