import { useEffect, useState } from 'react';
import { RefreshCw, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api } from '../services/api';
import { saveMemberTaskConfig, type MemberTaskConfig, type MemberTaskDefinition } from '../services/memberTaskConfig';

export function AdminMemberTasks() {
  const [config, setConfig] = useState<MemberTaskConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const load = async () => {
    setBusy(true); setMessage('');
    try { const result = await api.newMember.getConfig(); if (!result.success) throw new Error('কাজের তথ্য পাওয়া যায়নি।'); setConfig(result.config); }
    catch (e) { setConfig(null); setMessage(e instanceof Error ? e.message : 'কাজ লোড হয়নি।'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const update = (index: number, values: Partial<MemberTaskDefinition>) => {
    if (!config) return;
    setConfig({ ...config, days: config.days.map((day, i) => i === index ? { ...day, ...values } : day) });
    setMessage('');
  };
  const save = async () => {
    if (!config) return;
    setBusy(true); setMessage('');
    try { setConfig(await saveMemberTaskConfig(config, api.newMember)); setMessage('সার্ভার থেকে আবার পড়ে কাজের সংরক্ষণ নিশ্চিত হয়েছে।'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ হয়নি।'); }
    finally { setBusy(false); }
  };
  return <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 space-y-4" aria-label="নতুন সদস্যের ১২ দিনের কাজ">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <h2 className="text-lg font-bold">নতুন সদস্যের ১২ দিনের কাজ</h2>
      <div className="flex items-center gap-3"><label htmlFor="member-tasks-enabled">চালু</label><Switch id="member-tasks-enabled" disabled={busy || !config} checked={config?.enabled ?? false} onCheckedChange={enabled => config && setConfig({ ...config, enabled })} /><Button variant="outline" size="icon" title="কাজ আবার লোড করুন" aria-label="কাজ আবার লোড করুন" disabled={busy} onClick={load}><RefreshCw /></Button></div>
    </header>
    {config && <fieldset disabled={busy} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {config.days.map((day, index) => <div key={day.day} className="border border-border rounded-md p-3 space-y-3">
        <h3 className="font-semibold">দিন {day.day}</h3>
        <label className="block text-sm space-y-1"><span>শর্ত</span><select className="w-full h-9 rounded-md border border-input bg-background px-2" aria-label={`দিন ${day.day} শর্ত`} value={day.requirementType} onChange={e => update(index, { requirementType: e.target.value as MemberTaskDefinition['requirementType'], ...(e.target.value === 'login' ? { requiredAmount: 0 } : {}) })}><option value="login">লগইন</option><option value="bet">বৈধ বাজি</option><option value="deposit">অনুমোদিত জমা</option></select></label>
        <div className="grid grid-cols-2 gap-2"><label className="text-sm space-y-1"><span>প্রয়োজন ৳</span><Input aria-label={`দিন ${day.day} প্রয়োজন`} type="number" min="0" max="100000000" step="0.01" disabled={day.requirementType === 'login'} value={day.requiredAmount} onChange={e => update(index, { requiredAmount: Number(e.target.value) })} /></label><label className="text-sm space-y-1"><span>পুরস্কার ৳</span><Input aria-label={`দিন ${day.day} পুরস্কার`} type="number" min="0" max="100000000" step="0.01" value={day.bonus} onChange={e => update(index, { bonus: Number(e.target.value) })} /></label></div>
      </div>)}
    </fieldset>}
    <footer className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm break-words">{message}</p><Button disabled={busy || !config} onClick={save}>{busy ? <Loader2 className="animate-spin" /> : <Save />}কাজ সংরক্ষণ</Button></footer>
  </section>;
}