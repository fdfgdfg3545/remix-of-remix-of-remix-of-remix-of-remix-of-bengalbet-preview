/**
 * Deposit offer rules. Must stay identical to server/dbserver/api/deposit_offer_rules.php:
 * the server computes the authoritative bonus; this copy only previews it.
 */
export interface DepositOffer {
  enabled: boolean;
  bonusPercent: number;
  maxBonus: number; // 0 = no cap
  firstDepositOnly: boolean;
  minDepositForBonus: number;
}

// Plan default from the promo page: first deposit 47%, min ৳500, max bonus ৳20,000
export const DEFAULT_DEPOSIT_OFFER: DepositOffer = {
  enabled: true,
  bonusPercent: 47,
  maxBonus: 20000,
  firstDepositOnly: true,
  minDepositForBonus: 500,
};

const LIMITS: Record<'bonusPercent' | 'maxBonus' | 'minDepositForBonus', number> = {
  bonusPercent: 100,
  maxBonus: 100000000,
  minDepositForBonus: 100000000,
};

export function validateDepositOffer(offer: DepositOffer): DepositOffer {
  if (!offer || typeof offer.enabled !== 'boolean' || typeof offer.firstDepositOnly !== 'boolean') {
    throw new Error('ডিপোজিট অফারের তথ্য সঠিক নয়।');
  }
  const out = { enabled: offer.enabled, firstDepositOnly: offer.firstDepositOnly } as DepositOffer;
  (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).forEach((key) => {
    const v = offer[key];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > LIMITS[key]) {
      throw new Error('ডিপোজিট অফারের সংখ্যা সঠিক নয়।');
    }
    out[key] = Math.round(v * 100) / 100;
  });
  return out;
}

/** Bonus for one deposit request. Unknown/invalid offer data fails closed to zero. */
export function depositBonus(offer: DepositOffer | null | undefined, amount: number, optIn: boolean, hasPriorDeposit: boolean): number {
  if (!offer || !offer.enabled || !optIn || !Number.isFinite(amount) || amount <= 0) return 0;
  if (amount < offer.minDepositForBonus) return 0;
  if (offer.firstDepositOnly && hasPriorDeposit) return 0;
  let bonus = Math.round(amount * offer.bonusPercent) / 100;
  if (offer.maxBonus > 0) bonus = Math.min(bonus, offer.maxBonus);
  return Math.round(bonus * 100) / 100;
}

export function depositLimitError(amount: number, min: number, max: number): string | null {
  if (!Number.isFinite(amount) || amount < min || amount > max) {
    return `অনুগ্রহ করে ৳${min.toLocaleString('en-US')} থেকে ৳${max.toLocaleString('en-US')} এর মধ্যে সঠিক পরিমাণ লিখুন।`;
  }
  return null;
}

export async function saveDepositOffer(offer: DepositOffer, service: {
  updateOffer: (offer: DepositOffer) => Promise<{ success: boolean }>;
  getOffer: () => Promise<{ success: boolean; offer: DepositOffer }>;
}) {
  const clean = validateDepositOffer(offer);
  if (!(await service.updateOffer(clean)).success) throw new Error('ডিপোজিট অফার সংরক্ষণ হয়নি।');
  const readback = await service.getOffer();
  const keys = Object.keys(clean) as (keyof DepositOffer)[];
  if (!readback.success || !readback.offer || keys.some((k) => readback.offer[k] !== clean[k])) {
    throw new Error('সার্ভারে সংরক্ষিত অফার মিলছে না।');
  }
  return readback.offer;
}
