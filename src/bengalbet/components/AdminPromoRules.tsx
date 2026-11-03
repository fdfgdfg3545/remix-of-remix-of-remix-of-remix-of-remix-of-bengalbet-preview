import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api } from '../services/api';
import { AdminCronEngine } from './AdminCronEngine';
import { GAME_CATEGORIES, savePromoRules, validatePromoRules, PROMO_RULE_DEFAULTS, type PromoRules } from '../services/promoRules';

const DAYS = ['', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার'];
const CAT_LABEL: Record<string, string> = { slot: 'স্লট', fishing: 'ফিশিং', live: 'লাইভ', crash: 'ক্র্যাশ', table: 'টেবিল', arcade: 'আর্কেড', poker: 'পোকার', sports: 'স্পোর্টস', esports: 'ই-স্পোর্টস', lottery: 'লটারি' };

/** One admin page for every promotion timing/grant rule the server enforces. */
export function AdminPromoRules() {
  const [rules, setRules] = useState<PromoRules | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [newHour, setNewHour] = useState('');
  const load = async () => {
    setBusy(true); setMessage('');
    try { const r = await api.promoRules.getRules(); if (!r.success) throw new Error('নিয়ম পাওয়া যায়নি।'); setRules(r.rules); }
    catch (e) { setRules(null); setMessage(e instanceof Error ? e.message : 'নিয়ম লোড হয়নি।'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const save = async () => {
    if (!rules) return;
    setBusy(true); setMessage('');
    try { setRules(await savePromoRules(rules, api.promoRules)); setMessage('সার্ভার থেকে আবার পড়ে নিয়ম সংরক্ষণ নিশ্চিত হয়েছে।'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ হয়নি।'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm('সব প্রোমোশন নিয়ম প্রোমো পেইজের মূল প্ল্যানে ফিরিয়ে দেবেন?')) return;
    setBusy(true); setMessage('');
    try {
      if (!(await api.promoRules.resetRules()).success) throw new Error('মূল প্ল্যানে ফেরানো যায়নি।');
      const r = await api.promoRules.getRules();
      if (!r.success || !r.rules) throw new Error('ফেরানোর পর নিয়ম যাচাই করা যায়নি।');
      const clean = validatePromoRules(r.rules);
      if (JSON.stringify(clean) !== JSON.stringify(validatePromoRules(PROMO_RULE_DEFAULTS))) throw new Error('সার্ভারের নিয়ম মূল প্ল্যানের সঙ্গে মিলছে না।');
      setRules(clean); setMessage('মূল প্ল্যানে ফেরানো নিশ্চিত হয়েছে।');
    }
    catch (e) { setMessage(e instanceof Error ? e.message : 'ফেরানো যায়নি।'); }
    finally { setBusy(false); }
  };
  const num = (label: string, value: number, onChange: (n: number) => void) => (
    <label className="block text-sm space-y-1"><span>{label}</span>
      <Input type="number" min={0} aria-label={label} value={value} onChange={e => onChange(Number(e.target.value))} />
    </label>
  );
  const r = rules;
  return <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 space-y-4" aria-label="প্রোমোশনের নিয়ম">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-bold">প্রোমোশনের নিয়ম ও সময়</h2>
        <p className="text-sm text-muted-foreground">হাতুড়ি, স্পিন টিকিট, রেড প্যাকেট, উদ্ধার তহবিল, ভিআইপি দিন ও অ্যাপ বোনাস — সার্ভার এই নিয়মই মানে।</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" title="মূল প্ল্যানে ফেরান" aria-label="মূল প্ল্যানে ফেরান" disabled={busy} onClick={reset}><RotateCcw /></Button>
        <Button variant="outline" size="icon" title="আবার লোড করুন" aria-label="আবার লোড করুন" disabled={busy} onClick={load}><RefreshCw /></Button>
      </div>
    </header>
    {r && <fieldset disabled={busy} className="grid gap-4 lg:grid-cols-2">
      <div className="border border-border rounded-md p-3 space-y-3">
        <h3 className="font-semibold">সোনার ডিম ও লাকি হুইল</h3>
        <div className="grid grid-cols-2 gap-3">
          {num('দৈনিক লগইনে হাতুড়ি', r.loginHammerPerDay, n => setRules({ ...r, loginHammerPerDay: n }))}
          {num('জমায় ডিম (দিনে সর্বোচ্চ)', r.depositEggsPerDay, n => setRules({ ...r, depositEggsPerDay: n }))}
          {num('হুইল টিকিটের ন্যূনতম জমা ৳', r.wheelTicketMinDeposit, n => setRules({ ...r, wheelTicketMinDeposit: n }))}
          {num('দিনে হুইল টিকিট', r.wheelTicketsPerDay, n => setRules({ ...r, wheelTicketsPerDay: n }))}
        </div>
      </div>
      <div className="border border-border rounded-md p-3 space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-semibold">রেড প্যাকেট বৃষ্টি</h3>
          <Switch aria-label="রেড প্যাকেট চালু" checked={r.redPacket.enabled} onCheckedChange={enabled => setRules({ ...r, redPacket: { ...r.redPacket, enabled } })} /></div>
        <div className="flex flex-wrap gap-2 items-center">
          {r.redPacket.hours.map(h => <span key={h} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm">{String(h).padStart(2, '0')}:00
            <button type="button" aria-label={`${h}টার রাউন্ড মুছুন`} onClick={() => setRules({ ...r, redPacket: { ...r.redPacket, hours: r.redPacket.hours.filter(x => x !== h) } })}><X className="w-3 h-3" /></button></span>)}
          <Input className="w-20" type="number" min={0} max={23} placeholder="ঘণ্টা" aria-label="নতুন রাউন্ডের ঘণ্টা" value={newHour} onChange={e => setNewHour(e.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={() => { const h = Number(newHour); if (newHour !== '' && Number.isInteger(h) && h >= 0 && h <= 23) { setRules({ ...r, redPacket: { ...r.redPacket, hours: [...new Set([...r.redPacket.hours, h])].sort((a, b) => a - b) } }); setNewHour(''); } }}><Plus />রাউন্ড যোগ</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {num('প্রতি রাউন্ড কত মিনিট', r.redPacket.durationMinutes, n => setRules({ ...r, redPacket: { ...r.redPacket, durationMinutes: n } }))}
          {num('প্রতি রাউন্ডে কতজন', r.redPacket.perRoundLimit, n => setRules({ ...r, redPacket: { ...r.redPacket, perRoundLimit: n } }))}
        </div>
      </div>
      <div className="border border-border rounded-md p-3 space-y-3">
        <div className="flex items-center justify-between"><h3 className="font-semibold">উদ্ধার তহবিল (গতকালের লস)</h3>
          <Switch aria-label="উদ্ধার তহবিল চালু" checked={r.rescue.enabled} onCheckedChange={enabled => setRules({ ...r, rescue: { ...r.rescue, enabled } })} /></div>
        {num('দাবির শেষ সময় (ঘণ্টা, ২৪ ঘণ্টা)', r.rescue.claimDeadlineHour, n => setRules({ ...r, rescue: { ...r.rescue, claimDeadlineHour: n } }))}
        <div className="flex flex-wrap gap-3 text-sm">
          {GAME_CATEGORIES.map(c => <label key={c} className="flex items-center gap-1.5"><input type="checkbox" checked={r.rescue.categories.includes(c)} onChange={e => setRules({ ...r, rescue: { ...r.rescue, categories: e.target.checked ? [...r.rescue.categories, c] : r.rescue.categories.filter(x => x !== c) } })} />{CAT_LABEL[c]}</label>)}
        </div>
        <p className="text-xs text-muted-foreground">লসের ধাপ ও শতাংশ "উদ্ধার তহবিল" ট্যাবে এডিট/মুছুন।</p>
      </div>
      <div className="border border-border rounded-md p-3 space-y-3">
        <h3 className="font-semibold">ভিআইপি দিন ও অ্যাপ বোনাস</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm space-y-1"><span>সাপ্তাহিক বোনাসের দিন</span>
            <select aria-label="সাপ্তাহিক বোনাসের দিন" className="w-full h-9 rounded-md border border-input bg-background px-2" value={r.vip.weeklyClaimDay} onChange={e => setRules({ ...r, vip: { ...r.vip, weeklyClaimDay: Number(e.target.value) } })}>
              {DAYS.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}
            </select></label>
          {num('মাসিক বোনাসের তারিখ (১–২৮)', r.vip.monthlyClaimDay, n => setRules({ ...r, vip: { ...r.vip, monthlyClaimDay: n } }))}
          {num('মাসিক নগদ কার্ডের সময় (ঘণ্টা ০–২৩)', r.vip.monthlyHour ?? 15, n => setRules({ ...r, vip: { ...r.vip, monthlyHour: n } }))}
          {num('অ্যাপ বোনাস ৳', r.appBonus.amount, n => setRules({ ...r, appBonus: { ...r.appBonus, amount: n } }))}
          <label className="flex items-center gap-2 text-sm pt-6"><Switch aria-label="অ্যাপ বোনাস চালু" checked={r.appBonus.enabled} onCheckedChange={enabled => setRules({ ...r, appBonus: { ...r.appBonus, enabled } })} />অ্যাপ বোনাস চালু</label>
        </div>
      </div>
      <div className="border border-border rounded-md p-3 space-y-3 lg:col-span-2">
        <h3 className="font-semibold">বাজির বোনাস</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold"><Switch aria-label="দৈনিক স্লট বোনাস চালু" checked={r.slotDaily.enabled} onCheckedChange={enabled => setRules({ ...r, slotDaily: { ...r.slotDaily, enabled } })} />দৈনিক স্লট বোনাস</label>
            {num('ন্যূনতম গতকালের স্লট বাজি ৳', r.slotDaily.minBet, n => setRules({ ...r, slotDaily: { ...r.slotDaily, minBet: n } }))}
            {num('বোনাস %', r.slotDaily.ratePercent, n => setRules({ ...r, slotDaily: { ...r.slotDaily, ratePercent: n } }))}
            {num('সর্বোচ্চ বোনাস ৳', r.slotDaily.maxBonus, n => setRules({ ...r, slotDaily: { ...r.slotDaily, maxBonus: n } }))}
            {num('দাবি শুরুর ঘণ্টা', r.slotDaily.claimFromHour, n => setRules({ ...r, slotDaily: { ...r.slotDaily, claimFromHour: n } }))}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold"><Switch aria-label="রিয়েল টাইম রিবেট চালু" checked={r.rebate.enabled} onCheckedChange={enabled => setRules({ ...r, rebate: { ...r.rebate, enabled } })} />রিয়েল টাইম রিবেট</label>
            {num('রিবেট % (সর্বোচ্চ ৩)', r.rebate.ratePercent, n => setRules({ ...r, rebate: { ...r.rebate, ratePercent: n } }))}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold"><Switch aria-label="সদস্য দিবস চালু" checked={r.memberDay.enabled} onCheckedChange={enabled => setRules({ ...r, memberDay: { ...r.memberDay, enabled } })} />সদস্য দিবস</label>
            {num('মাসের তারিখ (২–২৮)', r.memberDay.day, n => setRules({ ...r, memberDay: { ...r.memberDay, day: n } }))}
            {num('ন্যূনতম বাজি ৳', r.memberDay.minBet, n => setRules({ ...r, memberDay: { ...r.memberDay, minBet: n } }))}
            {num('বোনাস %', r.memberDay.ratePercent, n => setRules({ ...r, memberDay: { ...r.memberDay, ratePercent: n } }))}
            {num('সর্বোচ্চ বোনাস ৳', r.memberDay.maxBonus, n => setRules({ ...r, memberDay: { ...r.memberDay, maxBonus: n } }))}
          </div>
        </div>
      </div>
      {([['missions', 'bet', 'দৈনিক মিশন (আজকের বাজি → বোনাস)', 'বাজি ৳'], ['referralLevels', 'friends', 'রেফার লেভেল-পদক (যোগ্য বন্ধু → পুরস্কার)', 'বন্ধু']] as const).map(([k, key, title, unit]) => {
        const m: any = (r as any)[k];
        const setM = (patch: any) => setRules({ ...r, [k]: { ...m, ...patch } } as any);
        const setT = (i: number, patch: any) => setM({ tiers: m.tiers.map((t: any, j: number) => j === i ? { ...t, ...patch } : t) });
        return <div key={k} className="border border-border rounded-md p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 font-semibold"><Switch aria-label={`${title} চালু`} checked={m.enabled} onCheckedChange={enabled => setM({ enabled })} />{title}</label>
            {k === 'missions' && <select aria-label="মিশনের গেম ধরন" className="h-8 rounded-md border border-input bg-background px-2 text-sm" value={m.category} onChange={e => setM({ category: e.target.value })}>{['all', ...GAME_CATEGORIES].map(c => <option key={c} value={c}>{c === 'all' ? 'সব গেম' : CAT_LABEL[c] || c}</option>)}</select>}
          </div>
          <div className="max-h-72 overflow-auto space-y-1">
            {m.tiers.map((t: any, i: number) => <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-6 text-muted-foreground">{i + 1}</span>
              <Input type="number" aria-label={`ধাপ ${i + 1} ${unit}`} value={t[key]} onChange={e => setT(i, { [key]: Number(e.target.value) })} />
              <Input type="number" aria-label={`ধাপ ${i + 1} বোনাস`} value={t.bonus} onChange={e => setT(i, { bonus: Number(e.target.value) })} />
              <Button variant="ghost" size="icon" aria-label={`ধাপ ${i + 1} মুছুন`} onClick={() => setM({ tiers: m.tiers.filter((_: any, j: number) => j !== i) })}><X /></Button>
            </div>)}
          </div>
          <Button variant="outline" size="sm" onClick={() => { const last = m.tiers[m.tiers.length - 1]; setM({ tiers: [...m.tiers, { [key]: (last?.[key] || 0) * 2 || 1, bonus: last?.bonus || 0 }] }); }}><Plus />ধাপ যোগ</Button>
          <p className="text-xs text-muted-foreground">বাম ঘর: {unit}, ডান ঘর: বোনাস ৳। ধাপগুলো ছোট থেকে বড় ক্রমে রাখুন।</p>
        </div>;
      })}
      <div className="border border-border rounded-md p-3 space-y-3 lg:col-span-2">
        <label className="flex items-center gap-2 font-semibold"><Switch aria-label="উত্তোলনের বাজির শর্ত চালু" checked={r.withdrawal.enabled} onCheckedChange={enabled => setRules({ ...r, withdrawal: { ...r.withdrawal, enabled } })} />উত্তোলনের আগে বাজির শর্ত</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {num('সব নতুন জমা ও বোনাসের সাধারণ গুণ', r.withdrawal.depositTurnover, n => setRules({ ...r, withdrawal: { ...r.withdrawal, depositTurnover: n, otherBonusTurnover: n } }))}
          {num('প্রথম জমা বোনাসের অতিরিক্ত গুণ', r.withdrawal.depositBonusTurnover, n => setRules({ ...r, withdrawal: { ...r.withdrawal, depositBonusTurnover: n } }))}
        </div>
        <p className="text-sm text-muted-foreground">প্রথম জমা বোনাসে মোট {r.withdrawal.depositTurnover + r.withdrawal.depositBonusTurnover}×; অন্য নতুন অর্থে {r.withdrawal.depositTurnover}×। গেমের জয় ও আটকে রাখা অর্থ ফেরতে নতুন শর্ত নয়।</p>
      </div>
    </fieldset>}
    <footer className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm break-words">{message}</p>
      <Button disabled={busy || !rules} onClick={save}>{busy ? <Loader2 className="animate-spin" /> : <Save />}নিয়ম সংরক্ষণ</Button></footer>
    <AdminCronEngine />
  </section>;
}
