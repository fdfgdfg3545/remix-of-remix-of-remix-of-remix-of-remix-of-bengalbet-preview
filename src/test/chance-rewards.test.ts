import { describe, expect, it } from 'vitest';
import { chanceAverage, validateChanceConfig } from '../bengalbet/services/chanceRewards';

const ok = { spin: [{ label: 'a', amount: 100, weight: 3 }, { label: 'b', amount: 0, weight: 1 }], golden_egg: [], red_envelope: [] };

describe('chance rewards', () => {
  it('rejects a prize above ৳1,50,000 (iPhone cash value)', () => {
    expect(validateChanceConfig({ ...ok, spin: [{ label: 'x', amount: 150001, weight: 1 }] })).not.toBeNull();
  });
  it('accepts the promo jackpots: egg ৳18,222 and red packet ৳77,777', () => {
    expect(validateChanceConfig({ ...ok, golden_egg: [{ label: 'j', amount: 18222, weight: 0.5 }], red_envelope: [{ label: 'm', amount: 77777, weight: 0.1 }] })).toBeNull();
  });
  it('rejects a zero weight', () => {
    expect(validateChanceConfig({ ...ok, spin: [{ label: 'x', amount: 5, weight: 0 }] })).not.toBeNull();
  });
  it('accepts a valid table and computes the weighted average', () => {
    expect(validateChanceConfig(ok)).toBeNull();
    expect(chanceAverage(ok.spin)).toBe(75);
  });
});
