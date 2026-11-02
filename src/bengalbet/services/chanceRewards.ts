export type ChanceType = 'spin' | 'golden_egg' | 'red_envelope';
export type ChancePrize = { label: string; amount: number; weight: number };
export type ChanceConfig = Record<ChanceType, ChancePrize[]>;

/** Mirrors the server limits so the admin sees errors before saving. */
export function validateChanceConfig(config: ChanceConfig): string | null {
  for (const type of ['spin', 'golden_egg', 'red_envelope'] as ChanceType[]) {
    const rows = config?.[type];
    if (!Array.isArray(rows) || rows.length > 20) return `${type}: ০–২০টি পুরস্কার রাখা যায়।`;
    for (const [i, r] of rows.entries()) {
      if (!Number.isFinite(r.amount) || r.amount < 0 || r.amount > 150000) return `${type} #${i + 1}: টাকা ০–১,৫০,০০০ হতে হবে।`;
      if (!Number.isFinite(r.weight) || r.weight <= 0) return `${type} #${i + 1}: ভার ০-এর বেশি হতে হবে।`;
    }
  }
  return null;
}

/** Expected payout per play for the given table. */
export function chanceAverage(rows: ChancePrize[]): number {
  const total = rows.reduce((s, r) => s + (r.weight > 0 ? r.weight : 0), 0);
  return total > 0 ? rows.reduce((s, r) => s + r.amount * (r.weight > 0 ? r.weight : 0), 0) / total : 0;
}
