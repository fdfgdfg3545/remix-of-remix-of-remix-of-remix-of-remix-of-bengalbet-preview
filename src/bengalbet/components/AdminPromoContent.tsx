import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2, RotateCcw, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api } from '../services/api';
import { builtinPromotionsForServer, resolveBanner, PROMO_ASSETS } from '../services/promoContent';
import { loadPromoLive } from '../services/promoLive';

const CATS = ['hot', 'new_member', 'deposit', 'rebate', 'app_download'];
const ACTIONS = ['claim', 'deposit', 'spin', 'invite', 'download', 'view'];
const ICONS = ['mystery', 'referral', 'deposit', 'vip', 'slot', 'app', 'cashback', 'golden_egg', 'red_packet', 'iphone', 'member_day', 'rebate', 'terms'];
const lines = (v: string) => v.split('\n').map(s => s.trim()).filter(Boolean);
const same = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

/** Admin: add, edit, reorder, turn on/off and delete promotion pages stored on the server. */
export function AdminPromoContent() {
  const [list, setList] = useState<any[] | null>(null);
  const [fromServer, setFromServer] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    setBusy(true); setMessage('');
    try {
      const r = await api.promoContent.get();
      if (!r.success) throw new Error('প্রোমোশন তালিকা পাওয়া যায়নি।');
      setFromServer(Array.isArray(r.promotions));
      setList(Array.isArray(r.promotions) ? r.promotions : builtinPromotionsForServer());
    } catch (e) { setList(null); setMessage(e instanceof Error ? e.message : 'লোড হয়নি।'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const save = async () => {
    if (!list) return;
    setBusy(true); setMessage('');
    try {
      const w = await api.promoContent.save(list);
      if (!w.success) throw new Error('সংরক্ষণ হয়নি।');
      const back = await api.promoContent.get();
      if (!Array.isArray(back.promotions) || back.promotions.length !== list.length || !same(back.promotions.map(p => p.id), list.map(p => p.id))) throw new Error('সার্ভারে সংরক্ষণ নিশ্চিত হয়নি।');
      setList(back.promotions); setFromServer(true); void loadPromoLive(true);
      setMessage('সার্ভার থেকে আবার পড়ে সংরক্ষণ নিশ্চিত হয়েছে। সদস্যরা এখন এই তালিকা দেখবে।');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ হয়নি।'); }
    finally { setBusy(false); }
  };
  const reset = async () => {
    if (!window.confirm('সার্ভারের তালিকা মুছে সাইটের মূল প্রোমোশন তালিকায় ফিরবেন?')) return;
    setBusy(true);
    try { await api.promoContent.reset(); void loadPromoLive(true); await load(); setMessage('মূল তালিকায় ফিরিয়ে দেওয়া হয়েছে।'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'ফেরানো যায়নি।'); setBusy(false); }
  };
  const upd = (i: number, patch: any) => setList(l => l!.map((p, k) => k === i ? { ...p, ...patch } : p));
  const move = (i: number, d: number) => setList(l => { const c = [...l!]; const j = i + d; if (j < 0 || j >= c.length) return c; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const add = () => { setList(l => [...(l || []), { id: `promo-${Date.now()}`, enabled: false, titleBn: 'নতুন প্রোমোশন', titleEn: '', subtitleBn: '', subtitleEn: '', category: 'hot', badgeBn: '', bannerImage: '', iconType: 'terms', accentColor: '#f59e0b', highlightNumber: '', validUntil: '', claimableAmount: '', requirementsBn: [], requirementsEn: [], rulesBn: [], rulesEn: [], actionTextBn: 'বিস্তারিত', actionTextEn: 'Details', actionType: 'view' }]); setOpen(list?.length ?? 0); };
  const del = (i: number) => { if (window.confirm(`"${list![i].titleBn}" মুছে ফেলবেন?`)) { setList(l => l!.filter((_, k) => k !== i)); setOpen(null); } };
  const txt = (label: string, i: number, key: string) => (
    <label className="block text-sm space-y-1"><span>{label}</span><Input aria-label={label} value={list![i][key] ?? ''} onChange={e => upd(i, { [key]: e.target.value })} /></label>
  );
  const area = (label: string, i: number, key: string) => (
    <label className="block text-sm space-y-1 sm:col-span-2"><span>{label} (প্রতি লাইনে একটি)</span>
      <textarea aria-label={label} className="w-full min-h-20 rounded-md border border-input bg-background p-2 text-sm" value={(list![i][key] || []).join('\n')} onChange={e => upd(i, { [key]: lines(e.target.value) })} /></label>
  );
  const sel = (label: string, i: number, key: string, opts: string[]) => (
    <label className="block text-sm space-y-1"><span>{label}</span>
      <select aria-label={label} className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm" value={list![i][key]} onChange={e => upd(i, { [key]: e.target.value })}>{opts.map(o => <option key={o} value={o}>{o}</option>)}</select></label>
  );
  return <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 space-y-4" aria-label="প্রোমোশন পেইজ এডিটর">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div>
        <h2 className="text-lg font-bold">প্রোমোশন পেইজ এডিটর</h2>
        <p className="text-sm text-muted-foreground">{fromServer ? 'সদস্যরা সার্ভারের এই তালিকা দেখছে।' : 'এখন সাইটের মূল তালিকা চলছে; সংরক্ষণ করলে সার্ভারের তালিকা চালু হবে।'} নিয়মের অংকগুলো সার্ভারের আসল নিয়ম থেকে নিজে দেখানো হয়।</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={busy || !list} onClick={add}><Plus />নতুন</Button>
        <Button variant="outline" size="icon" title="মূল তালিকায় ফেরান" aria-label="মূল তালিকায় ফেরান" disabled={busy} onClick={reset}><RotateCcw /></Button>
        <Button variant="outline" size="icon" title="আবার লোড করুন" aria-label="আবার লোড করুন" disabled={busy} onClick={load}><RefreshCw /></Button>
      </div>
    </header>
    {list && <fieldset disabled={busy} className="space-y-2">
      {list.map((p, i) => <div key={p.id + i} className="border border-border rounded-md">
        <div className="flex items-center gap-2 p-2">
          {resolveBanner(p.bannerImage) ? <img src={resolveBanner(p.bannerImage)} alt="" className="w-16 h-8 object-cover rounded" /> : <div className="w-16 h-8 rounded bg-muted" />}
          <button type="button" className="flex-1 text-left text-sm font-semibold truncate" onClick={() => setOpen(open === i ? null : i)}>{p.titleBn}</button>
          <Switch aria-label={`${p.titleBn} চালু`} checked={p.enabled !== false} onCheckedChange={enabled => upd(i, { enabled })} />
          <Button variant="ghost" size="icon" aria-label="উপরে" onClick={() => move(i, -1)}><ArrowUp /></Button>
          <Button variant="ghost" size="icon" aria-label="নিচে" onClick={() => move(i, 1)}><ArrowDown /></Button>
          <Button variant="ghost" size="icon" aria-label="মুছুন" onClick={() => del(i)}><Trash2 /></Button>
        </div>
        {open === i && <div className="grid gap-3 sm:grid-cols-2 p-3 border-t border-border">
          {txt('আইডি', i, 'id')}{txt('শিরোনাম (বাংলা)', i, 'titleBn')}{txt('শিরোনাম (English)', i, 'titleEn')}
          {txt('উপশিরোনাম (বাংলা)', i, 'subtitleBn')}{txt('ব্যাজ (বাংলা)', i, 'badgeBn')}{txt('বড় সংখ্যা', i, 'highlightNumber')}
          {txt('মেয়াদ', i, 'validUntil')}{txt('বোতামের লেখা', i, 'actionTextBn')}
          <label className="block text-sm space-y-1 sm:col-span-2"><span>ব্যানার ছবি: সাইটের ছবি ({Object.keys(PROMO_ASSETS).map(k => `asset:${k}`).join(', ')}) অথবা https লিংক</span>
            <Input aria-label="ব্যানার ছবি" value={p.bannerImage || ''} onChange={e => upd(i, { bannerImage: e.target.value.trim() })} />
            <input type="file" accept="image/png,image/jpeg,image/webp" aria-label="ব্যানার ছবি আপলোড" className="text-xs" onChange={async e => {
              const f = e.target.files?.[0]; e.target.value = '';
              if (!f) return;
              if (f.size > 2 * 1024 * 1024) { setMessage('ছবি সর্বোচ্চ ২ MB'); return; }
              const dataUrl: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f); });
              try { const r: any = await api.promoContent.uploadImage(dataUrl); if (r?.url) { upd(i, { bannerImage: r.url }); setMessage('ছবি আপলোড হয়েছে, এবার সেভ করুন'); } else setMessage(r?.message || 'আপলোড হয়নি'); }
              catch (err: any) { setMessage(err?.message || 'আপলোড হয়নি'); }
            }} /></label>
          {sel('বিভাগ', i, 'category', CATS)}{sel('অফারের ধরন (আসল নিয়ম)', i, 'iconType', ICONS)}{sel('বোতামের কাজ', i, 'actionType', ACTIONS)}
          {area('শর্তাবলী', i, 'requirementsBn')}{area('নিয়ম (সার্ভারের নিয়ম না থাকলে দেখাবে)', i, 'rulesBn')}
        </div>}
      </div>)}
    </fieldset>}
    <footer className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm break-words">{message}</p>
      <Button disabled={busy || !list} onClick={save}>{busy ? <Loader2 className="animate-spin" /> : <Save />}তালিকা সংরক্ষণ</Button></footer>
  </section>;
}
