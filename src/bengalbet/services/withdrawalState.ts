import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export type WithdrawalLimits = { min: number; max: number };
export function withdrawalLimits(settings: any): WithdrawalLimits | null {
  const min = Number(settings?.minWithdraw);
  const max = Number(settings?.maxWithdraw);
  return Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min ? { min, max } : null;
}
export function canSubmitWithdrawal(amount: number, limits: WithdrawalLimits | null, remaining: number | null, account: string | undefined): boolean {
  return !!limits && remaining === 0 && !!account && Number.isFinite(amount) && amount >= limits.min && amount <= limits.max;
}
export function useWithdrawalState() {
  const [limits, setLimits] = useState<WithdrawalLimits | null>(null);
  const [remainingTurnover, setRemainingTurnover] = useState<number | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    setError('');
    setRemainingTurnover(null);
    setLimits(null);
    try {
      const [settings, turnover] = await Promise.all([api.settings.getPublicSettings(), api.wallet.getTurnover()]);
      const next = withdrawalLimits(settings.success ? settings.settings : null);
      if (!next || !turnover.success || !Number.isFinite(turnover.remaining) || turnover.remaining < 0) throw new Error('উত্তোলনের সীমা ও বাজির তথ্য পাওয়া যায়নি। আবার চেষ্টা করুন।');
      setLimits(next);
      setRemainingTurnover(turnover.remaining);
    } catch (e) { setError(e instanceof Error ? e.message : 'উত্তোলনের তথ্য পাওয়া যায়নি।'); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return { limits, remainingTurnover, error, refresh };
}