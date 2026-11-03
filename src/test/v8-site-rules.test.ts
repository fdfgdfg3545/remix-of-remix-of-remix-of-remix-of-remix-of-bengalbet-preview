import { describe, expect, it, vi } from 'vitest';
vi.mock('../bengalbet/data/promotions', () => ({ PROMOTIONS_DATA: [] }));
vi.mock('../bengalbet/services/api', () => ({ api: { settings: { getPublicSettings: async () => ({}) } } }));
import { PROMO_RULE_DEFAULTS, validatePromoRules } from '../bengalbet/services/promoRules';
import { bannerMatchesLive } from '../bengalbet/services/promoContent';
import { liveRulesFor, toBnDigits } from '../bengalbet/services/promoLive';

const live: any = {
  promoRules: PROMO_RULE_DEFAULTS,
  depositOffer: { enabled: true, firstDepositOnly: true, bonusPercent: 47, maxBonus: 20000, minDepositForBonus: 500 },
  referral: { enabled: true, instantBonusPerFriend: 300 },
  mystery: { enabled: true, triggerDayOfMonth: 23 },
  chance: { golden_egg: { max: 18222 }, red_envelope: { max: 77777 }, spin: { max: 150000 } },
  rescueTiers: [], vipTiers: [], limits: { minDeposit: 200, maxDeposit: 50000 },
};

describe('v8 site-based amounts', () => {
  it('rebate default is the 3% printed on the site rebate pictures', () => {
    expect(validatePromoRules(PROMO_RULE_DEFAULTS).rebate.ratePercent).toBe(3);
  });
  it('monthly VIP card hour defaults to 15:00 and rejects 24', () => {
    expect(validatePromoRules(PROMO_RULE_DEFAULTS).vip.monthlyHour).toBe(15);
    expect(() => validatePromoRules({ ...PROMO_RULE_DEFAULTS, vip: { ...PROMO_RULE_DEFAULTS.vip, monthlyHour: 24 } })).toThrow();
  });
  it('rebate banner (3%) shows only while the live rebate is 3%', () => {
    expect(bannerMatchesLive('rebate', live)).toBe(true);
    expect(bannerMatchesLive('rebate', { ...live, promoRules: { ...PROMO_RULE_DEFAULTS, rebate: { enabled: true, ratePercent: 1 } } })).toBe(false);
  });
  it('first deposit banner (47%) hides when the live bonus is 50%', () => {
    expect(bannerMatchesLive('deposit', live)).toBe(true);
    expect(bannerMatchesLive('deposit', { ...live, depositOffer: { ...live.depositOffer, bonusPercent: 50 } })).toBe(false);
  });
  it('member rule lines use Bengali digits only', () => {
    const lines = liveRulesFor('rebate', live);
    expect(lines[0]).toContain('৩%');
    expect(lines.join(' ')).not.toMatch(/[0-9]/);
    expect(toBnDigits('৳1,000 at 18:00')).toBe('৳১,০০০ at ১৮:০০');
  });
});
