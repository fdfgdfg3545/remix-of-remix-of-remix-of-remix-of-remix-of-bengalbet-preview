import { describe, expect, it } from 'vitest';
import { DEFAULT_DEPOSIT_OFFER, depositBonus, depositLimitError, saveDepositOffer, validateDepositOffer } from '../bengalbet/services/depositOffer';

const firstOnly47 = { enabled: true, bonusPercent: 47, maxBonus: 17777, firstDepositOnly: true, minDepositForBonus: 500 };

describe('deposit offer', () => {
  it('plan default: first deposit 47%, nothing on later deposits, cap ৳20,000', () => {
    expect(depositBonus(DEFAULT_DEPOSIT_OFFER, 1000, true, false)).toBe(470);
    expect(depositBonus(DEFAULT_DEPOSIT_OFFER, 1000, true, true)).toBe(0);
    expect(depositBonus(DEFAULT_DEPOSIT_OFFER, 50000, true, false)).toBe(20000);
  });
  it('member who chooses no bonus gets zero', () => {
    expect(depositBonus(DEFAULT_DEPOSIT_OFFER, 1000, false, false)).toBe(0);
  });
  it('first-deposit-only offer gives nothing on a later deposit', () => {
    expect(depositBonus(firstOnly47, 1000, true, true)).toBe(0);
    expect(depositBonus(firstOnly47, 1000, true, false)).toBe(470);
  });
  it('deposit below the bonus minimum gets zero', () => {
    expect(depositBonus(firstOnly47, 499, true, false)).toBe(0);
  });
  it('bonus is capped at the maximum', () => {
    expect(depositBonus(firstOnly47, 50000, true, false)).toBe(17777);
  });
  it('disabled or missing offer gives zero', () => {
    expect(depositBonus({ ...firstOnly47, enabled: false }, 1000, true, false)).toBe(0);
    expect(depositBonus(null, 1000, true, false)).toBe(0);
  });
  it('rejects percent above 100 and negative values', () => {
    expect(() => validateDepositOffer({ ...firstOnly47, bonusPercent: 101 })).toThrow();
    expect(() => validateDepositOffer({ ...firstOnly47, maxBonus: -1 })).toThrow();
  });
  it('deposit limits use the server min and max', () => {
    expect(depositLimitError(199, 200, 50000)).not.toBeNull();
    expect(depositLimitError(200, 200, 50000)).toBeNull();
    expect(depositLimitError(50001, 200, 50000)).not.toBeNull();
  });
  it('save fails when the server readback differs', async () => {
    await expect(saveDepositOffer(firstOnly47, {
      updateOffer: async () => ({ success: true }),
      getOffer: async () => ({ success: true, offer: { ...firstOnly47, bonusPercent: 5 } }),
    })).rejects.toThrow();
  });
});
