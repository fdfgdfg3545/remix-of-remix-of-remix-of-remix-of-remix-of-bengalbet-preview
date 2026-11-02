// @ts-nocheck
/**
 * BengalBet Golden Egg Renewal & State Helper
 * - Manages 24-hour cycle or custom renew duration
 * - Checks whether Golden Egg is currently in renew cooldown
 * - Stores prize and renew expiration in localStorage
 */

export const GOLDEN_EGG_STORAGE_KEYS = {
  RENEW_TIME: 'bdt222_golden_egg_renew_time',
  LAST_PRIZE: 'bdt222_golden_egg_last_prize',
  CHOSEN_EGG: 'bdt222_golden_egg_chosen_id'
} as const;

export const RENEW_DURATION_MS = 24 * 60 * 60 * 1000; // 24-hour renew cycle

export const getGoldenEggRenewTime = (): number | null => {
  try {
    const raw = localStorage.getItem(GOLDEN_EGG_STORAGE_KEYS.RENEW_TIME);
    if (!raw) return null;
    const renewTime = parseInt(raw, 10);
    if (isNaN(renewTime)) return null;

    if (renewTime > Date.now()) {
      return renewTime;
    } else {
      // Renew time has arrived! Clear so user can open again
      clearGoldenEggRenew();
      return null;
    }
  } catch {
    return null;
  }
};

export const isGoldenEggInRenew = (): boolean => {
  return getGoldenEggRenewTime() !== null;
};

export const setGoldenEggRenew = (prize: number, eggId?: number, customDurationMs: number = RENEW_DURATION_MS): number => {
  const renewUntil = Date.now() + customDurationMs;
  try {
    localStorage.setItem(GOLDEN_EGG_STORAGE_KEYS.RENEW_TIME, String(renewUntil));
    localStorage.setItem(GOLDEN_EGG_STORAGE_KEYS.LAST_PRIZE, String(prize));
    if (eggId !== undefined) {
      localStorage.setItem(GOLDEN_EGG_STORAGE_KEYS.CHOSEN_EGG, String(eggId));
    }
  } catch (e) {
    console.error('Failed to set golden egg renew in localStorage', e);
  }
  return renewUntil;
};

export const getGoldenEggLastPrize = (): number | null => {
  try {
    const raw = localStorage.getItem(GOLDEN_EGG_STORAGE_KEYS.LAST_PRIZE);
    if (raw) {
      const prize = parseInt(raw, 10);
      return isNaN(prize) ? null : prize;
    }
  } catch {}
  return null;
};

export const clearGoldenEggRenew = (): void => {
  try {
    localStorage.removeItem(GOLDEN_EGG_STORAGE_KEYS.RENEW_TIME);
    localStorage.removeItem(GOLDEN_EGG_STORAGE_KEYS.LAST_PRIZE);
    localStorage.removeItem(GOLDEN_EGG_STORAGE_KEYS.CHOSEN_EGG);
  } catch {}
};
