export interface MysteryClaimStatus {
  isEligible?: boolean;
  isUnlocked?: boolean;
  hasClaimed?: boolean;
  is23rdToday?: boolean;
  isPast6PM?: boolean;
  config?: { enabled?: boolean };
}

/** Missing or failed eligibility reads must never enable a reward claim. */
export function mayClaimMysteryReward(status: MysteryClaimStatus | null, busy = false): boolean {
  return !busy && status?.isEligible === true && status.isUnlocked === true &&
    status.hasClaimed === false && status.config?.enabled !== false &&
    status.is23rdToday === true && status.isPast6PM === true;
}