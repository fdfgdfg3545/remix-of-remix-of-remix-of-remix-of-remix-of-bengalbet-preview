/**
 * Payout math for server-decided game rounds. Mirrors server/dbserver/api/game_rounds.php
 * so admins can see the real hit chance; the server alone picks results.
 */
export const GAME_POOLS: Record<string, [number, number[]]> = {
  low: [0.42, [1.1, 1.3, 1.6, 2.2, 3.5, 6.0]],
  medium: [0.28, [1.2, 1.5, 2.0, 3.0, 5.0, 10.0, 25.0]],
  high: [0.18, [1.5, 2.5, 5.0, 12.0, 30.0, 75.0, 150.0]],
  extreme: [0.10, [2.0, 5.0, 15.0, 50.0, 150.0, 500.0, 1000.0]],
};

export function gameRtp(engine: any, gameId: string, category: string): number {
  const clean = gameId.toLowerCase().replace(/^(game-|slot-)/, '');
  const rtp = engine?.gameRtp?.[clean] ?? engine?.gameRtp?.[gameId] ?? engine?.categoryRtp?.[category] ?? engine?.globalRtp ?? 96.5;
  return Math.max(0, Math.min(99.5, Number(rtp)));
}

export function gamePlan(engine: any, rtp: number): { mults: number[]; hit: number } {
  const vol = GAME_POOLS[engine?.volatility] ? engine.volatility : 'medium';
  const cap = Math.max(1.1, Number(engine?.maxMultiplierCap ?? 5000));
  const pool = GAME_POOLS[vol] ?? GAME_POOLS['medium']!;
  let mults = pool[1].filter((m) => m <= cap);
  if (!mults.length) mults = [Math.min(cap, 1.1)];
  const mean = mults.reduce((a, b) => a + b, 0) / mults.length;
  return { mults, hit: Math.min(0.95, rtp / 100 / mean) };
}

/** Expected return per ৳1 bet for the plan; equals RTP/100 unless the hit chance is capped. */
export function expectedReturn(plan: { mults: number[]; hit: number }): number {
  const mean = plan.mults.reduce((a, b) => a + b, 0) / plan.mults.length;
  return plan.hit * mean;
}
