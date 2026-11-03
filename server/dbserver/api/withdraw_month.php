<?php
/** Deposit activation is separate from wagering and uses Bangladesh approval months. */
function bbWithdrawalMonthBounds(?DateTimeImmutable $now=null): array {
    $now=($now??new DateTimeImmutable('now',new DateTimeZone('Asia/Dhaka')))->setTimezone(new DateTimeZone('Asia/Dhaka'));
    $start=$now->modify('first day of this month')->setTime(0,0,0);
    return [$start->format('Y-m-d H:i:s'),$start->modify('+1 month')->format('Y-m-d H:i:s')];
}
function bbWithdrawalHasMonthlyDeposit(string $uid): bool {
    [$start,$end]=bbWithdrawalMonthBounds();
    return (bool)Database::fetchOne("SELECT id FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND amount>0 AND COALESCE(processed_at,created_at)>=? AND COALESCE(processed_at,created_at)<? LIMIT 1",[$uid,$start,$end]);
}