import { describe, expect, it } from 'vitest';
import { canSubmitWithdrawal, withdrawalLimits } from '../bengalbet/services/withdrawalState';

describe('authoritative withdrawal prerequisites', () => {
  it('uses configured 500–100000 limits on either form', () => {
    const limits = withdrawalLimits({ minWithdraw: 500, maxWithdraw: 100000 });
    expect(limits).toEqual({ min: 500, max: 100000 });
    expect(canSubmitWithdrawal(499, limits, 0, 'own-account')).toBe(false);
    expect(canSubmitWithdrawal(500, limits, 0, 'own-account')).toBe(true);
    expect(canSubmitWithdrawal(100000, limits, 0, 'own-account')).toBe(true);
    expect(canSubmitWithdrawal(100001, limits, 0, 'own-account')).toBe(false);
  });
  it('blocks missing server data and missing own payout account', () => {
    expect(withdrawalLimits({})).toBeNull();
    expect(canSubmitWithdrawal(500, null, 0, 'own-account')).toBe(false);
    expect(canSubmitWithdrawal(500, { min: 500, max: 100000 }, null, 'own-account')).toBe(false);
    expect(canSubmitWithdrawal(500, { min: 500, max: 100000 }, 0, undefined)).toBe(false);
    expect(canSubmitWithdrawal(500, { min: 500, max: 100000 }, 1, 'own-account')).toBe(false);
  });
});