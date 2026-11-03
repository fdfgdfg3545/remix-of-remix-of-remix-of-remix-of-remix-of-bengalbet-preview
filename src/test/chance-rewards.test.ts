import { describe, expect, it, vi } from 'vitest';
import { chanceAverage, validateChanceConfig, saveVerifiedChanceConfig } from '../bengalbet/services/chanceRewards';

const ok = { spin: [{ label: 'a', amount: 100, weight: 3 }, { label: 'b', amount: 0, weight: 1 }], golden_egg: [], red_envelope: [] };

describe('chance rewards', () => {
  it('rejects a valid but different saved prize amount', async () => {
    const service = { saveChanceConfig: vi.fn().mockResolvedValue({ success: true }), getChanceConfig: vi.fn().mockResolvedValue({ success: true, configured: true, config: { ...ok, spin: [{ label: 'a', amount: 52, weight: 3 }] } }) };
    await expect(saveVerifiedChanceConfig(ok, service)).rejects.toThrow();
    service.getChanceConfig.mockResolvedValue({ success: true, configured: true, config: ok });
    await expect(saveVerifiedChanceConfig(ok, service)).resolves.toEqual(ok);
  });
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
