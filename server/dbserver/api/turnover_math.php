<?php
/** New credits require a common base; only first-deposit bonus adds the extra multiplier. */
function bbTurnoverRequired(array $w, float $deposits, float $depositBonus, float $firstBonus, float $other): float {
    if (empty($w['enabled'])) return 0.0;
    return round(($deposits + $depositBonus + $other) * (float)$w['depositTurnover'] + $firstBonus * (float)$w['depositBonusTurnover'], 2);
}
function bbBalanceAdjustment(float $current, float $amount, string $type): array {
    if (!is_finite($amount) || $amount < 0 || !in_array($type, ['add','deduct','set'], true)) throw new InvalidArgumentException('Invalid balance adjustment');
    $next = round($type === 'set' ? $amount : ($type === 'add' ? $current + $amount : max(0, $current - $amount)), 2);
    $delta = round($next - $current, 2);
    return ['balance' => $next, 'amount' => abs($delta), 'type' => $delta > 0 ? 'bonus' : 'adjustment'];
}