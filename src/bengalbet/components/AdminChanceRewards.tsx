import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '../services/api';
import { chanceAverage, validateChanceConfig, saveVerifiedChanceConfig, type ChanceConfig, type ChanceType } from '../services/chanceRewards';

const TYPES: { id: ChanceType; label: string }[] = [
  { id: 'spin', label: 'লাকি স্পিন' },
  { id: 'golden_egg', label: 'সোনার ডিম' },
  { id: 'red_envelope', label: 'লাল খাম' },
];

/** Admin editor for server-settled chance prizes; saves are confirmed by reading the table back. */
export function AdminChanceRewards() {
  const [config, setConfig] = useState<ChanceConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    setBusy(true); setMessage('');
    try {
      const r = await api.rewards.getChanceConfig();
      setConfig({ spin: r.config['spin'] || [], golden_egg: r.config['golden_egg'] || [], red_envelope: r.config['red_envelope'] || [] });
      if (!r.configured) setMessage('এখনো কোনো পুরস্কার তালিকা অনুমোদিত হয়নি; সদস্যরা দাবি করতে পারবে না।');
    } catch (e) { setConfig(null); setMessage(e instanceof Error ? e.message : 'তালিকা লোড হয়নি।'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const edit = (type: ChanceType, i: number, values: Record<string, unknown>) => config && setConfig({ ...config, [type]: config[type].map((r, j) => j === i ? { ...r, ...values } : r) });
  const save = async () => {
    if (!config) return;
    const error = validateChanceConfig(config);
    if (error) { setMessage(error); return; }
    setBusy(true); setMessage('');
    try {
      setConfig(await saveVerifiedChanceConfig(config, api.rewards));
      setMessage('সার্ভার থেকে আবার পড়ে তালিকা সংরক্ষণ নিশ্চিত হয়েছে।');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ হয়নি।'); }
    finally { setBusy(false); }
  };
  return <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 space-y-4" aria-label="স্পিন, ডিম ও খামের পুরস্কার">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <h2 className="text-lg font-bold">স্পিন, ডিম ও খামের পুরস্কার তালিকা</h2>
      <Button variant="outline" size="icon" title="আবার লোড করুন" aria-label="আবার লোড করুন" disabled={busy} onClick={load}><RefreshCw /></Button>
    </header>
    {config && <fieldset disabled={busy} className="grid gap-4 lg:grid-cols-3">
      {TYPES.map(t => <div key={t.id} className="border border-border rounded-md p-3 space-y-2">
        <div className="flex items-center justify-between"><h3 className="font-semibold">{t.label}</h3><span className="text-xs text-muted-foreground">গড়ে প্রতি বার ৳{chanceAverage(config[t.id]).toFixed(2)}</span></div>
        {config[t.id].map((r, i) => <div key={i} className="grid grid-cols-[1fr_5rem_4rem_auto] gap-1 items-center">
          <Input aria-label={`${t.label} ${i + 1} নাম`} placeholder="নাম" value={r.label} onChange={e => edit(t.id, i, { label: e.target.value })} />
          <Input aria-label={`${t.label} ${i + 1} টাকা`} type="number" min="0" max="150000" value={r.amount} onChange={e => edit(t.id, i, { amount: Number(e.target.value) })} />
          <Input aria-label={`${t.label} ${i + 1} ভার`} type="number" min="0" value={r.weight} onChange={e => edit(t.id, i, { weight: Number(e.target.value) })} />
          <Button variant="ghost" size="icon" aria-label="মুছুন" onClick={() => setConfig({ ...config, [t.id]: config[t.id].filter((_, j) => j !== i) })}><Trash2 /></Button>
        </div>)}
        <p className="text-xs text-muted-foreground">টাকা: ০–১,৫০,০০০ · ভার যত বেশি, তত বেশি পড়ে।</p>
        <Button variant="outline" size="sm" disabled={config[t.id].length >= 20} onClick={() => setConfig({ ...config, [t.id]: [...config[t.id], { label: '', amount: 0, weight: 1 }] })}><Plus />পুরস্কার যোগ</Button>
      </div>)}
    </fieldset>}
    <footer className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm break-words">{message}</p><Button disabled={busy || !config} onClick={save}>{busy ? <Loader2 className="animate-spin" /> : <Save />}তালিকা সংরক্ষণ</Button></footer>
  </section>;
}
