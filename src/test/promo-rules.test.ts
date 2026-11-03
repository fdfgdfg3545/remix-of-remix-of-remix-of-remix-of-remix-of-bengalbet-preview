import { describe, expect, it } from 'vitest';
import { PROMO_RULE_DEFAULTS, packetRound, savePromoRules, turnoverBonus, remainingTurnover, validatePromoRules } from '../bengalbet/services/promoRules';

describe('promotion rules', () => {
  it('plan defaults: 1 login hammer, 3 deposit eggs, wheel ticket at ৳1,000, ৳52 app bonus', () => {
    const r = validatePromoRules(PROMO_RULE_DEFAULTS);
    expect(r.loginHammerPerDay).toBe(1);
    expect(r.depositEggsPerDay).toBe(3);
    expect(r.wheelTicketMinDeposit).toBe(1000);
    expect(r.appBonus.amount).toBe(52);
  });
  it('red packet rounds open at 12/16/20/00 for 30 minutes only', () => {
    expect(packetRound(PROMO_RULE_DEFAULTS, 16, 29)).toBe(16);
    expect(packetRound(PROMO_RULE_DEFAULTS, 16, 30)).toBeNull();
    expect(packetRound(PROMO_RULE_DEFAULTS, 14, 0)).toBeNull();
    expect(packetRound(PROMO_RULE_DEFAULTS, 0, 5)).toBe(0);
  });
  it('rescue claim deadline is 10:00 for slot and fishing', () => {
    expect(PROMO_RULE_DEFAULTS.rescue.claimDeadlineHour).toBe(10);
    expect(PROMO_RULE_DEFAULTS.rescue.categories).toEqual(['slot', 'fishing']);
  });
  it('rejects an hour of 24, no packet times, or an unknown game type', () => {
    expect(() => validatePromoRules({ ...PROMO_RULE_DEFAULTS, redPacket: { ...PROMO_RULE_DEFAULTS.redPacket, hours: [24] } })).toThrow();
    expect(() => validatePromoRules({ ...PROMO_RULE_DEFAULTS, redPacket: { ...PROMO_RULE_DEFAULTS.redPacket, hours: [] } })).toThrow();
    expect(() => validatePromoRules({ ...PROMO_RULE_DEFAULTS, rescue: { ...PROMO_RULE_DEFAULTS.rescue, categories: ['casino'] } })).toThrow();
  });
  it('save fails when server readback differs', async () => {
    await expect(savePromoRules(PROMO_RULE_DEFAULTS, {
      updateRules: async () => ({ success: true }),
      getRules: async () => ({ success: true, rules: { ...PROMO_RULE_DEFAULTS, loginHammerPerDay: 2 } }),
    })).rejects.toThrow();
  });
  it('daily slot bonus: nothing under ৳2,000 slot bets, 1% above, capped at ৳18,888', () => {
    const d = PROMO_RULE_DEFAULTS.slotDaily;
    expect(turnoverBonus(1999, d.minBet, d.ratePercent, d.maxBonus)).toBe(0);
    expect(turnoverBonus(5000, d.minBet, d.ratePercent, d.maxBonus)).toBe(50);
    expect(turnoverBonus(5000000, d.minBet, d.ratePercent, d.maxBonus)).toBe(18888);
  });
  it('real-time rebate cannot be set above 3%', () => {
    expect(() => validatePromoRules({ ...PROMO_RULE_DEFAULTS, rebate: { enabled: true, ratePercent: 3.5 } })).toThrow();
    expect(validatePromoRules({ ...PROMO_RULE_DEFAULTS, rebate: { enabled: true, ratePercent: 3 } }).rebate.ratePercent).toBe(3);
  });
  it('member day is the 13th by default', () => {
    expect(PROMO_RULE_DEFAULTS.memberDay.day).toBe(13);
  });
  it('first-deposit bonus adds base 1x plus extra 8x, total 9x', () => {
    const w = PROMO_RULE_DEFAULTS.withdrawal;
    expect(remainingTurnover(w, 1000, 470, 0, 0)).toBe(5230);
    expect(remainingTurnover(w, 1000, 470, 0, 5230)).toBe(0);
    expect(remainingTurnover({ ...w, enabled: false }, 1000, 470, 0, 0)).toBe(0);
  });
  it('every new ordinary bonus or deposit adds base 1x, later deposit bonus has no extra 8x', () => {
    expect(remainingTurnover(PROMO_RULE_DEFAULTS.withdrawal, 500, 50, 100, 0, 0)).toBe(650);
  });
  it('admin controls base and additional multipliers independently', () => {
    const w = validatePromoRules({ ...PROMO_RULE_DEFAULTS, withdrawal: { ...PROMO_RULE_DEFAULTS.withdrawal, depositTurnover: 2, depositBonusTurnover: 3 } }).withdrawal;
    expect(w.otherBonusTurnover).toBe(2);
    expect(remainingTurnover(w, 1000, 470, 100, 0)).toBe(4550);
  });
});
