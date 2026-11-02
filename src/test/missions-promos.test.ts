import { describe, expect, it } from 'vitest';
import { PROMO_RULE_DEFAULTS, validatePromoRules } from '../bengalbet/services/promoRules';
import { mergeServerPromotions, resolveBanner } from '../bengalbet/services/promoContent';
import { secondsUntil } from '../bengalbet/services/missions';

describe('missions, referral levels and promotion list', () => {
  it('mission plan: 26 tiers, first ৳1,000 bet → ৳3, last ৳200,000,000 → ৳300,000', () => {
    const m = validatePromoRules(PROMO_RULE_DEFAULTS).missions;
    expect(m.tiers).toHaveLength(26);
    expect(m.tiers[0]).toEqual({ bet: 1000, bonus: 3 });
    expect(m.tiers[25]).toEqual({ bet: 200000000, bonus: 300000 });
  });
  it('referral medal levels: 10 levels, level 2 needs 4 friends for ৳150', () => {
    const l = validatePromoRules(PROMO_RULE_DEFAULTS).referralLevels;
    expect(l.tiers).toHaveLength(10);
    expect(l.tiers[1]).toEqual({ friends: 4, bonus: 150 });
  });
  it('rejects mission tiers out of ascending order', () => {
    const bad = { ...PROMO_RULE_DEFAULTS, missions: { ...PROMO_RULE_DEFAULTS.missions, tiers: [{ bet: 5000, bonus: 1 }, { bet: 1000, bonus: 2 }] } };
    expect(() => validatePromoRules(bad)).toThrow();
  });
  it('hides promotions the admin turned off', () => {
    const list = mergeServerPromotions([{ id: 'a', titleBn: 'A', enabled: true, bannerImage: '' }, { id: 'b', titleBn: 'B', enabled: false, bannerImage: '' }]);
    expect(list.map((p) => p.id)).toEqual(['a']);
  });
  it('only allows bundled or https banner images', () => {
    expect(resolveBanner('http://x.com/a.jpg')).toBe('');
    expect(resolveBanner('https://x.com/a.jpg')).toBe('https://x.com/a.jpg');
    expect(resolveBanner('asset:nope')).toBe('');
  });
  it('mission countdown runs to the server reset time', () => {
    expect(secondsUntil('2026-11-03 00:00:00', '2026-11-02 23:00:00')).toBe(3600);
  });
});
