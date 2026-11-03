import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api } from '../services/api';
import { depositBonus, saveDepositOffer, validateDepositOffer, DEFAULT_DEPOSIT_OFFER, type DepositOffer } from '../services/depositOffer';

/** Admin editor for the one server deposit offer used by member pages and the deposit endpoint. */
export function AdminDepositOffer() {
  const [offer, setOffer] = useState<DepositOffer | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    setBusy(true); setMessage('');
    try {
      const result = await api.depositOffer.getOffer();
      if (!result.success || !result.offer) throw new Error('অফারের তথ্য পাওয়া যায়নি।');
      setOffer(result.offer);
    } catch (e) { setOffer(null); setMessage(e instanceof Error ? e.message : 'অফার লোড হয়নি।'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const set = (values: Partial<DepositOffer>) => { if (offer) { setOffer({ ...offer, ...values }); setMessage(''); } };
  const save = async () => {
    if (!offer) return;
    setBusy(true); setMessage('');
    try { setOffer(await saveDepositOffer(offer, api.depositOffer)); setMessage('সার্ভার থেকে আবার পড়ে অফার সংরক্ষণ নিশ্চিত হয়েছে।'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ হয়নি।'); }
    finally { setBusy(false); }
  };
  const num = (key: 'bonusPercent' | 'maxBonus' | 'minDepositForBonus', label: string) => (
    <label className="block text-sm space-y-1">
      <span>{label}</span>
      <Input type="number" min={0} aria-label={label} value={offer?.[key] ?? 0} onChange={e => set({ [key]: Number(e.target.value) } as Partial<DepositOffer>)} />
    </label>
  );
  return <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 space-y-4 rounded-2xl border border-border" aria-label="জমা বোনাস অফার">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-bold">জমা বোনাস অফার</h2>
        <p className="text-sm text-muted-foreground">সদস্যদের জমা পেইজ ও সার্ভার একই নিয়ম ব্যবহার করে। বোনাস শুধু অ্যাডমিন অনুমোদনের পর যোগ হয়।</p>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="deposit-offer-enabled">চালু</label>
        <Switch id="deposit-offer-enabled" disabled={busy || !offer} checked={offer?.enabled ?? false} onCheckedChange={enabled => set({ enabled })} />
        <Button variant="outline" size="icon" title="সেটিং মুছে মূল নিয়মে ফেরান" aria-label="সেটিং মুছে মূল নিয়মে ফেরান" disabled={busy} onClick={async () => {
          if (!window.confirm('জমা অফারের সেটিং মুছে মূল নিয়মে ফেরাবেন?')) return;
          setBusy(true); setMessage('');
          try {
            if (!(await api.depositOffer.resetOffer()).success) throw new Error('সেটিং ফেরানো যায়নি।');
            const r = await api.depositOffer.getOffer();
            if (!r.success || !r.offer) throw new Error('ফেরানোর পর অফারের তথ্য যাচাই করা যায়নি।');
            const clean = validateDepositOffer(r.offer);
            if (Object.entries(DEFAULT_DEPOSIT_OFFER).some(([key, value]) => clean[key as keyof DepositOffer] !== value)) throw new Error('সার্ভারের অফার মূল নিয়মের সঙ্গে মিলছে না।');
            setOffer(clean); setMessage('সেটিং মুছে মূল নিয়মে ফেরানো নিশ্চিত হয়েছে।');
          }
          catch (e) { setMessage(e instanceof Error ? e.message : 'ফেরানো যায়নি।'); }
          finally { setBusy(false); }
        }}><RotateCcw /></Button>
        <Button variant="outline" size="icon" title="অফার আবার লোড করুন" aria-label="অফার আবার লোড করুন" disabled={busy} onClick={load}><RefreshCw /></Button>
      </div>
    </header>
    {offer && <fieldset disabled={busy} className="grid gap-3 md:grid-cols-4">
      {num('bonusPercent', 'বোনাস শতাংশ (%)')}
      {num('maxBonus', 'সর্বোচ্চ বোনাস ৳ (০ = সীমা নেই)')}
      {num('minDepositForBonus', 'বোনাসের জন্য ন্যূনতম জমা ৳')}
      <label className="flex items-center gap-3 text-sm pt-6">
        <Switch id="deposit-offer-first" checked={offer.firstDepositOnly} onCheckedChange={firstDepositOnly => set({ firstDepositOnly })} />
        <span>শুধু প্রথম জমায়</span>
      </label>
    </fieldset>}
    {offer && <p className="text-sm text-muted-foreground">উদাহরণ: ৳১,০০০ জমায় বোনাস ৳{depositBonus(offer, 1000, true, false).toLocaleString()}</p>}
    <div className="flex items-center gap-3">
      <Button disabled={busy || !offer} onClick={save}>{busy ? <Loader2 className="animate-spin" /> : <Save />} সংরক্ষণ</Button>
      {message && <p role="status" className="text-sm">{message}</p>}
    </div>
  </section>;
}
