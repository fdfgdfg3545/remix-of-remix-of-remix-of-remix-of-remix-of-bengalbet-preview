<?php
/** A pending/rejected deposit or another member's deposit is never bonus eligibility. */
function bbHasLifetimeDeposit(string $uid): bool {
    return (bool)Database::fetchOne("SELECT id FROM transactions WHERE user_id=? AND type='deposit' AND status='success' AND amount>0 LIMIT 1",[$uid]);
}
function bbRequireBonusDeposit(string $uid): void {
    if(!bbHasLifetimeDeposit($uid))throw new RuntimeException('বোনাস পেতে আগে একটি জমা অনুমোদিত হতে হবে।');
}