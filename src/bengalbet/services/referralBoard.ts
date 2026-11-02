/** Referral leaderboard (this month's top referral earners) and latest referral payouts from the server; names arrive masked. */
import { useEffect, useState } from 'react';
import { api } from './api';

export const fmtTk = (n: number) => `৳ ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export function useReferralBoard() {
  const [top, setTop] = useState<{ name: string; amount: number }[]>([]);
  const [recent, setRecent] = useState<{ id: string; phone: string; amount: string; status: string }[]>([]);
  useEffect(() => {
    let on = true;
    api.referral.leaderboard().then((r: any) => {
      if (!on || !r?.success) return;
      setTop(r.leaderboard || []);
      setRecent((r.recentRewards || []).map((x: any, i: number) => ({ id: `${i}-${x.at}`, phone: x.name, amount: fmtTk(x.amount), status: 'প্রাপ্ত' })));
    }).catch(() => {});
    return () => { on = false; };
  }, []);
  const slot = (i: number) => top[i] ? { name: top[i].name, amount: fmtTk(top[i].amount) } : { name: '—', amount: '৳ 0.00' };
  return { top, recent, slot };
}
