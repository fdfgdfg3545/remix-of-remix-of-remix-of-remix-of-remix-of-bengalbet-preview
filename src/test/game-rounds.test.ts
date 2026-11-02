import { describe, expect, it } from 'vitest';
import { expectedReturn, gamePlan, gameRtp } from '../bengalbet/services/gameRounds';

const engine = { globalRtp: 96.5, volatility: 'medium', maxMultiplierCap: 5000, categoryRtp: { crash: 97, slot: 96.5 }, gameRtp: { aviator: 97.2 } };

describe('server game rounds', () => {
  it('expected return equals the admin RTP (96.5% slot)', () => {
    const plan = gamePlan(engine, gameRtp(engine, 'game-x', 'slot'));
    expect(expectedReturn(plan)).toBeCloseTo(0.965, 6);
  });
  it('per-game RTP overrides category, category overrides global', () => {
    expect(gameRtp(engine, 'game-aviator', 'crash')).toBe(97.2);
    expect(gameRtp(engine, 'other', 'crash')).toBe(97);
    expect(gameRtp(engine, 'other', 'live')).toBe(96.5);
  });
  it('RTP can never be set to pay more than it takes (max 99.5%)', () => {
    expect(gameRtp({ globalRtp: 150 }, 'x', 'slot')).toBe(99.5);
  });
  it('max multiplier cap removes bigger wins', () => {
    expect(Math.max(...gamePlan({ ...engine, volatility: 'extreme', maxMultiplierCap: 100 }, 96.5).mults)).toBe(50);
  });
});
