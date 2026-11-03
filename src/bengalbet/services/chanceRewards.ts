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

export async function saveVerifiedChanceConfig(config: ChanceConfig, service: {
  saveChanceConfig: (c: ChanceConfig) => Promise<{ success: boolean }>;
  getChanceConfig: () => Promise<{ success: boolean; configured: boolean; config: Record<string, ChancePrize[]> }>;
}) {
  const error = validateChanceConfig(config);
  if (error) throw new Error(error);
  if (!(await service.saveChanceConfig(config)).success) throw new Error('পুরস্কার তালিকা সংরক্ষণ হয়নি।');
  const back = await service.getChanceConfig();
  const restored: ChanceConfig = { spin: back.config['spin'] ?? [], golden_egg: back.config['golden_egg'] ?? [], red_envelope: back.config['red_envelope'] ?? [] };
  if (!back.success || !back.configured || validateChanceConfig(restored)) throw new Error('সার্ভারের পুরস্কার তালিকা যাচাই করা যায়নি।');
  for (const type of ['spin', 'golden_egg', 'red_envelope'] as ChanceType[]) {
    if (JSON.stringify(restored[type]) !== JSON.stringify(config[type])) throw new Error('সার্ভারে সংরক্ষিত পুরস্কার তালিকা মিলছে না।');
  }
  return restored;
}
