import { describe, expect, it } from 'vitest';
import { mayClaimMysteryReward } from '../bengalbet/services/rewardEligibility';

describe('Mystery reward claim eligibility', () => {
  it('rejects missing eligibility data rather than granting demo eligibility', () => {
    expect(mayClaimMysteryReward(null)).toBe(false);
    expect(mayClaimMysteryReward({})).toBe(false);
  });
  it('rejects ineligible, locked, already claimed and disabled rewards', () => {
    const valid = { isEligible: true, isUnlocked: true, hasClaimed: false, is23rdToday: true, isPast6PM: true };
    expect(mayClaimMysteryReward({ ...valid, isEligible: false })).toBe(false);
    expect(mayClaimMysteryReward({ ...valid, isUnlocked: false })).toBe(false);
    expect(mayClaimMysteryReward({ ...valid, hasClaimed: true })).toBe(false);
    expect(mayClaimMysteryReward({ ...valid, config: { enabled: false } })).toBe(false);
  });
  it('permits only confirmed available rewards while idle', () => {
    const valid = { isEligible: true, isUnlocked: true, hasClaimed: false, is23rdToday: true, isPast6PM: true };
    expect(mayClaimMysteryReward(valid)).toBe(true);
    expect(mayClaimMysteryReward(valid, true)).toBe(false);
  });
  it('requires the server-confirmed 23rd and opening time, regardless of client clock', () => {
    const valid = { isEligible: true, isUnlocked: true, hasClaimed: false, is23rdToday: true, isPast6PM: true };
    expect(mayClaimMysteryReward({ ...valid, is23rdToday: false })).toBe(false);
    expect(mayClaimMysteryReward({ ...valid, isPast6PM: false })).toBe(false);
    expect(mayClaimMysteryReward({ isEligible: true, isUnlocked: true, hasClaimed: false })).toBe(false);
  });
});