/**
 * Daily betting missions from the server: tiers, today's bets and claim state come from the server,
 * claims are settled by the server once per tier per day. The page never credits money itself.
 */
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export type MissionTier = { id: number; betTarget: number; betTargetDisplay: string; bonus: number; bonusDisplay: string; claimed: boolean; eligible: boolean };
const fmt = (n: number) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Seconds left until the server's daily reset, from server time strings (Bangladesh time). */
export function secondsUntil(resetsAt: string, serverTime: string): number {
  const a = Date.parse(resetsAt.replace(' ', 'T') + 'Z'); const b = Date.parse(serverTime.replace(' ', 'T') + 'Z');
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.round((a - b) / 1000)) : 0;
}

export function useServerMissions(onSettled?: () => void, showToast?: (m: string) => void) {
  const [tiers, setTiers] = useState<MissionTier[]>([]);
  const [turnover, setTurnover] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);
  const load = useCallback(async () => {
    try {
      const r: any = await api.rewards.missionsStatus();
      if (!r?.success) throw new Error();
      const m = r.missions;
      setEnabled(!!m.enabled); setTurnover(Number(m.turnover || 0));
      setTiers(m.tiers.map((t: any) => ({ id: t.id, betTarget: t.bet, betTargetDisplay: fmt(t.bet), bonus: t.bonus, bonusDisplay: fmt(t.bonus), claimed: !!t.claimed, eligible: !!t.eligible })));
      setSecondsLeft(secondsUntil(m.resetsAt, r.serverTime));
    } catch { setTiers([]); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000); return () => clearInterval(t); }, []);
  const claim = useCallback(async (t: MissionTier) => {
    if (busy || t.claimed) return false;
    if (!t.eligible) { showToast?.(`আজ আরও ৳${fmt(Math.max(0, t.betTarget - turnover))} বাজি দরকার।`); return false; }
    setBusy(t.id);
    try {
      const r: any = await api.rewards.claimMission(t.id);
      if (!r?.success) throw new Error(r?.message || 'দাবি হয়নি।');
      showToast?.(`মিশন ${t.id} সম্পন্ন! ৳${fmt(r.amount)} যোগ হয়েছে।`);
      onSettled?.(); await load(); return true;
    } catch (e: any) { showToast?.(e?.message || 'দাবি হয়নি।'); await load(); return false; }
    finally { setBusy(null); }
  }, [busy, turnover, load, onSettled, showToast]);
  const countdown = { hours: Math.floor(secondsLeft / 3600), minutes: Math.floor((secondsLeft % 3600) / 60), seconds: secondsLeft % 60 };
  return { tiers, turnover, turnoverDisplay: fmt(turnover), enabled, loaded, countdown, busy, claim, reload: load };
}
