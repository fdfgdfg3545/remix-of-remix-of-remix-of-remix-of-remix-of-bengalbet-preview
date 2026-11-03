<?php
/** Admin-editable promotion rules. Keep identical to src/bengalbet/services/promoRules.ts. */
if (!function_exists('bbPromoRulesDefaults')) {
function bbPromoRulesDefaults(): array {
    return [
        'loginHammerPerDay' => 1,
        'depositEggsPerDay' => 3,
        'wheelTicketMinDeposit' => 1000,
        'wheelTicketsPerDay' => 1,
        'redPacket' => ['enabled' => true, 'hours' => [0, 12, 16, 20], 'durationMinutes' => 30, 'perRoundLimit' => 50],
        'rescue' => ['enabled' => true, 'claimDeadlineHour' => 10, 'categories' => ['slot', 'fishing']],
        'vip' => ['weeklyClaimDay' => 1, 'monthlyClaimDay' => 1, 'monthlyHour' => 15],
        'appBonus' => ['enabled' => true, 'amount' => 52],
        'slotDaily' => ['enabled' => true, 'minBet' => 2000, 'ratePercent' => 1, 'maxBonus' => 18888, 'claimFromHour' => 9],
        'rebate' => ['enabled' => true, 'ratePercent' => 3],
        'memberDay' => ['enabled' => true, 'day' => 13, 'minBet' => 1000, 'ratePercent' => 1, 'maxBonus' => 100000],
        'withdrawal' => ['enabled' => true, 'depositTurnover' => 1, 'depositBonusTurnover' => 8, 'otherBonusTurnover' => 1],
        'missions' => ['enabled' => true, 'category' => 'slot', 'tiers' => [['bet' => 1000, 'bonus' => 3], ['bet' => 3000, 'bonus' => 8], ['bet' => 5000, 'bonus' => 12], ['bet' => 10000, 'bonus' => 18], ['bet' => 20000, 'bonus' => 56], ['bet' => 50000, 'bonus' => 128], ['bet' => 100000, 'bonus' => 268], ['bet' => 200000, 'bonus' => 588], ['bet' => 500000, 'bonus' => 1288], ['bet' => 1000000, 'bonus' => 2888], ['bet' => 2000000, 'bonus' => 5888], ['bet' => 5000000, 'bonus' => 12888], ['bet' => 10000000, 'bonus' => 17777], ['bet' => 15000000, 'bonus' => 22888], ['bet' => 20000000, 'bonus' => 28888], ['bet' => 25000000, 'bonus' => 35888], ['bet' => 30000000, 'bonus' => 42888], ['bet' => 40000000, 'bonus' => 55888], ['bet' => 50000000, 'bonus' => 68888], ['bet' => 60000000, 'bonus' => 82888], ['bet' => 70000000, 'bonus' => 98888], ['bet' => 80000000, 'bonus' => 118888], ['bet' => 90000000, 'bonus' => 138888], ['bet' => 100000000, 'bonus' => 168888], ['bet' => 150000000, 'bonus' => 218888], ['bet' => 200000000, 'bonus' => 300000]]],
        'referralLevels' => ['enabled' => true, 'tiers' => [['friends' => 2, 'bonus' => 1], ['friends' => 4, 'bonus' => 150], ['friends' => 8, 'bonus' => 350], ['friends' => 15, 'bonus' => 800], ['friends' => 30, 'bonus' => 2000], ['friends' => 60, 'bonus' => 5000], ['friends' => 100, 'bonus' => 12000], ['friends' => 250, 'bonus' => 35000], ['friends' => 500, 'bonus' => 80000], ['friends' => 1000, 'bonus' => 200000]]],
    ];
}
function bbPromoNum($v, float $min, float $max, string $name): float {
    if (!is_int($v) && !is_float($v) && !is_numeric($v)) throw new InvalidArgumentException("Invalid $name");
    $v = (float)$v; if (!is_finite($v) || $v < $min || $v > $max) throw new InvalidArgumentException("Invalid $name"); return round($v, 2);
}
function bbPromoInt($v, int $min, int $max, string $name): int {
    if (!is_int($v) && !(is_numeric($v) && (string)(int)$v === (string)$v)) throw new InvalidArgumentException("Invalid $name");
    $v = (int)$v; if ($v < $min || $v > $max) throw new InvalidArgumentException("Invalid $name"); return $v;
}
function bbPromoBool($v, string $name): bool { if (!is_bool($v)) throw new InvalidArgumentException("Invalid $name"); return $v; }
function bbPromoTiers($t, string $countKey, string $name, int $maxCount): array {
    if (!is_array($t) || count($t) < 1 || count($t) > 40) throw new InvalidArgumentException("Invalid $name");
    $out = []; $prev = -1;
    foreach (array_values($t) as $x) {
        if (!is_array($x)) throw new InvalidArgumentException("Invalid $name");
        $n = bbPromoNum($x[$countKey] ?? null, 1, $maxCount, "$name.$countKey");
        if ($n <= $prev) throw new InvalidArgumentException("$name must be in ascending order");
        $out[] = [$countKey => $n, 'bonus' => bbPromoNum($x['bonus'] ?? null, 0, 10000000, "$name.bonus")]; $prev = $n;
    }
    return $out;
}
function bbValidatePromoRules($c): array {
    if (!is_array($c)) throw new InvalidArgumentException('Invalid promotion rules');
    $d = bbPromoRulesDefaults();
    if (!isset($c['missions'])) $c['missions'] = $d['missions'];
    if (!isset($c['referralLevels'])) $c['referralLevels'] = $d['referralLevels'];
    foreach (['redPacket', 'rescue', 'vip', 'appBonus', 'slotDaily', 'rebate', 'memberDay', 'withdrawal'] as $k) if (!isset($c[$k]) || !is_array($c[$k])) throw new InvalidArgumentException("Invalid $k");
    $hours = $c['redPacket']['hours'] ?? null;
    if (!is_array($hours) || count($hours) < 1 || count($hours) > 24) throw new InvalidArgumentException('Invalid redPacket.hours');
    $h = []; foreach ($hours as $x) $h[] = bbPromoInt($x, 0, 23, 'redPacket.hours');
    $h = array_values(array_unique($h)); sort($h);
    $cats = $c['rescue']['categories'] ?? null;
    $allowed = ['slot', 'fishing', 'live', 'crash', 'table', 'arcade', 'poker', 'sports', 'esports', 'lottery'];
    if (!is_array($cats) || !count($cats)) throw new InvalidArgumentException('Invalid rescue.categories');
    $cs = []; foreach ($cats as $x) { if (!in_array($x, $allowed, true)) throw new InvalidArgumentException('Invalid rescue.categories'); $cs[] = $x; }
    $cs = array_values(array_unique($cs));
    $amount = $c['appBonus']['amount'] ?? null;
    if (!is_numeric($amount) || $amount < 0 || $amount > 100000) throw new InvalidArgumentException('Invalid appBonus.amount');
    return [
        'loginHammerPerDay' => bbPromoInt($c['loginHammerPerDay'] ?? null, 0, 10, 'loginHammerPerDay'),
        'depositEggsPerDay' => bbPromoInt($c['depositEggsPerDay'] ?? null, 0, 20, 'depositEggsPerDay'),
        'wheelTicketMinDeposit' => bbPromoInt($c['wheelTicketMinDeposit'] ?? null, 0, 10000000, 'wheelTicketMinDeposit'),
        'wheelTicketsPerDay' => bbPromoInt($c['wheelTicketsPerDay'] ?? null, 0, 10, 'wheelTicketsPerDay'),
        'redPacket' => [
            'enabled' => bbPromoBool($c['redPacket']['enabled'] ?? null, 'redPacket.enabled'),
            'hours' => $h,
            'durationMinutes' => bbPromoInt($c['redPacket']['durationMinutes'] ?? null, 1, 59, 'redPacket.durationMinutes'),
            'perRoundLimit' => bbPromoInt($c['redPacket']['perRoundLimit'] ?? null, 1, 100000, 'redPacket.perRoundLimit'),
        ],
        'rescue' => [
            'enabled' => bbPromoBool($c['rescue']['enabled'] ?? null, 'rescue.enabled'),
            'claimDeadlineHour' => bbPromoInt($c['rescue']['claimDeadlineHour'] ?? null, 1, 24, 'rescue.claimDeadlineHour'),
            'categories' => $cs,
        ],
        'vip' => [
            'weeklyClaimDay' => bbPromoInt($c['vip']['weeklyClaimDay'] ?? null, 1, 7, 'vip.weeklyClaimDay'),
            'monthlyClaimDay' => bbPromoInt($c['vip']['monthlyClaimDay'] ?? null, 1, 28, 'vip.monthlyClaimDay'),
            'monthlyHour' => bbPromoInt($c['vip']['monthlyHour'] ?? 15, 0, 23, 'vip.monthlyHour'),
        ],
        'appBonus' => ['enabled' => bbPromoBool($c['appBonus']['enabled'] ?? null, 'appBonus.enabled'), 'amount' => round((float)$amount, 2)],
        'slotDaily' => [
            'enabled' => bbPromoBool($c['slotDaily']['enabled'] ?? null, 'slotDaily.enabled'),
            'minBet' => bbPromoNum($c['slotDaily']['minBet'] ?? null, 0, 100000000, 'slotDaily.minBet'),
            'ratePercent' => bbPromoNum($c['slotDaily']['ratePercent'] ?? null, 0, 100, 'slotDaily.ratePercent'),
            'maxBonus' => bbPromoNum($c['slotDaily']['maxBonus'] ?? null, 0, 100000000, 'slotDaily.maxBonus'),
            'claimFromHour' => bbPromoInt($c['slotDaily']['claimFromHour'] ?? null, 0, 23, 'slotDaily.claimFromHour'),
        ],
        'rebate' => [
            'enabled' => bbPromoBool($c['rebate']['enabled'] ?? null, 'rebate.enabled'),
            'ratePercent' => bbPromoNum($c['rebate']['ratePercent'] ?? null, 0, 3, 'rebate.ratePercent'),
        ],
        'memberDay' => [
            'enabled' => bbPromoBool($c['memberDay']['enabled'] ?? null, 'memberDay.enabled'),
            'day' => bbPromoInt($c['memberDay']['day'] ?? null, 2, 28, 'memberDay.day'),
            'minBet' => bbPromoNum($c['memberDay']['minBet'] ?? null, 0, 100000000, 'memberDay.minBet'),
            'ratePercent' => bbPromoNum($c['memberDay']['ratePercent'] ?? null, 0, 100, 'memberDay.ratePercent'),
            'maxBonus' => bbPromoNum($c['memberDay']['maxBonus'] ?? null, 0, 100000000, 'memberDay.maxBonus'),
        ],
        'withdrawal' => [
            'enabled' => bbPromoBool($c['withdrawal']['enabled'] ?? null, 'withdrawal.enabled'),
            'depositTurnover' => bbPromoNum($c['withdrawal']['depositTurnover'] ?? null, 0, 50, 'withdrawal.depositTurnover'),
            'depositBonusTurnover' => bbPromoNum($c['withdrawal']['depositBonusTurnover'] ?? null, 0, 50, 'withdrawal.depositBonusTurnover'),
            'otherBonusTurnover' => bbPromoNum($c['withdrawal']['depositTurnover'] ?? null, 0, 50, 'withdrawal.depositTurnover'),
        ],
        'missions' => [
            'enabled' => bbPromoBool($c['missions']['enabled'] ?? null, 'missions.enabled'),
            'category' => in_array($c['missions']['category'] ?? '', array_merge(['all'], $allowed), true) ? $c['missions']['category'] : throw new InvalidArgumentException('Invalid missions.category'),
            'tiers' => bbPromoTiers($c['missions']['tiers'] ?? null, 'bet', 'missions.tiers', 10000000000),
        ],
        'referralLevels' => [
            'enabled' => bbPromoBool($c['referralLevels']['enabled'] ?? null, 'referralLevels.enabled'),
            'tiers' => bbPromoTiers($c['referralLevels']['tiers'] ?? null, 'friends', 'referralLevels.tiers', 100000),
        ],
    ];
}
function bbPromoRules(): array {
    static $cache = null; if ($cache !== null) return $cache;
    $row = Database::fetchOne('SELECT config_json FROM promo_rules_config WHERE id = 1');
    if (!$row) return $cache = bbPromoRulesDefaults();
    try { return $cache = bbValidatePromoRules(json_decode($row['config_json'], true)); }
    catch (InvalidArgumentException $e) { return $cache = bbPromoRulesDefaults(); }
}
}
