import { describe, expect, it } from 'vitest';
import { mayClaimMysteryReward } from '../bengalbet/services/rewardEligibility';

// Pure member-UI rule simulation only: no production registrations, money,
// referral payouts, server clock changes or server claim/ledger verification.
describe('Requested daily referred and non-referred cohort schedule', () => {
  for (const days of [30, 60]) {
    it(`${days} days: 100 referred + 100 direct joins daily remain gated by server event status`, () => {
      const users: { id: string; referred: boolean }[] = [];
      let checked = 0;
      let violations = 0;
      for (let day = 0; day < days; day++) {
        for (const referred of [true, false]) {
          for (let i = 0; i < 100; i++) users.push({ id: `${day}-${referred}-${i}`, referred });
        }
        const date = new Date(Date.UTC(2026, 10, 2 + day));
        const open = date.getUTCDate() === 23;
        for (const user of users) {
          const status = { isEligible: true, isUnlocked: true, hasClaimed: false, is23rdToday: open, isPast6PM: true };
          if (mayClaimMysteryReward(status) !== open) violations++;
          if (mayClaimMysteryReward({ ...status, isPast6PM: false })) violations++;
          if (mayClaimMysteryReward({ ...status, hasClaimed: true })) violations++;
          if (mayClaimMysteryReward({ ...status, isEligible: false })) violations++;
          checked++;
        }
      }
      expect(users.filter(user => user.referred)).toHaveLength(days * 100);
      expect(users.filter(user => !user.referred)).toHaveLength(days * 100);
      expect(new Set(users.map(user => user.id)).size).toBe(days * 200);
      expect(checked).toBe(100 * days * (days + 1));
      expect(violations).toBe(0);
    });
  }
});