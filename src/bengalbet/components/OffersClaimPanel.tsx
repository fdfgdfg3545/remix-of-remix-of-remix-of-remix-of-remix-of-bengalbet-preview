import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';

type OfferId = 'slot_daily' | 'rebate' | 'member_day';
type OfferState = { label: string; turnover: number; bonus: number; claimed: boolean; open: boolean; eligible: boolean; day?: number };

const HINT: Record<OfferId, string> = {
  slot_daily: 'গতকালের স্লট বাজি থেকে',
  rebate: 'শেষ দাবির পর থেকে সব বাজি থেকে',
  member_day: 'মাসের শুরু থেকে সদস্য দিবসের আগ পর্যন্ত বাজি থেকে',
};

/** Member claim buttons for turnover offers; amounts and eligibility always come from the server. */
export function OffersClaimPanel({ onSettled }: { onSettled?: (newBalance: number) => void }) {
  const [offers, setOffers] = useState<Record<OfferId, OfferState> | null>(null);
  const [busy, setBusy] = useState<OfferId | null>(null);
  const [message, setMessage] = useState('');
  const load = () => api.rewards.offersStatus().then(r => setOffers(r.offers as any)).catch(() => setOffers(null));
  useEffect(() => { void load(); }, []);
  const claim = async (id: OfferId) => {
    setBusy(id); setMessage('');
    try {
      const r = await api.rewards.claimOffer(id);
      setMessage(`৳${r.amount} আপনার ব্যালেন্সে যোগ হয়েছে।`);
      onSettled?.(r.newBalance);
      await load();
    } catch (e: any) { setMessage(e?.message || 'দাবি করা যায়নি।'); }
    finally { setBusy(null); }
  };
  if (!offers) return null;
  return (
    <section aria-label="বাজির বোনাস" className="m-3 rounded-xl border border-border bg-card text-card-foreground p-3 space-y-2 font-bengali">
      {(Object.keys(HINT) as OfferId[]).map(id => {
        const o = offers[id];
        if (!o) return null;
        const status = o.claimed ? 'নেওয়া হয়েছে' : !o.open ? (id === 'member_day' ? `শুধু মাসের ${o.day} তারিখে` : 'এখন বন্ধ') : o.bonus > 0 ? `৳${o.bonus}` : 'শর্ত পূরণ হয়নি';
        return (
          <div key={id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold">{o.label}</p>
              <p className="text-xs text-muted-foreground">{HINT[id]}: ৳{Number(o.turnover).toLocaleString()} বাজি · {status}</p>
            </div>
            <button type="button" disabled={!o.eligible || busy !== null} onClick={() => claim(id)}
              className="shrink-0 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-xs font-bold disabled:opacity-40">
              {busy === id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'দাবি করুন'}
            </button>
          </div>
        );
      })}
      {message && <p role="status" className="text-xs font-bold">{message}</p>}
    </section>
  );
}
