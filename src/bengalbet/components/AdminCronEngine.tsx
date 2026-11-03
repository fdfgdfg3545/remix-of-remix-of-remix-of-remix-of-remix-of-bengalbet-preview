import { useEffect, useState } from 'react';
import { Copy, Play, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { api, REST_API_CONFIG } from '../services/api';

type State = { enabled: boolean; httpKeyConfigured: boolean; lastStarted: string | null; lastSuccess: string | null; status: string; processed: number; cycleComplete: boolean; salaryPendingJobs?: number; mysteryPendingJobs?: number; lastError: string | null; windows: Record<string, unknown>; serverTime: string; stale: boolean; cliPath: string; };
export function AdminCronEngine() {
  const [state, setState] = useState<State | null>(null);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const url = `${REST_API_CONFIG.baseUrl.replace(/\/$/, '')}/cron.php`;
  const load = async () => {
    setBusy(true);
    try { const r = await api.cron.status(); if (!r.success) throw new Error('ক্রনের অবস্থা পাওয়া যায়নি'); setState(r.state); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'সংযোগ ব্যর্থ'); }
    finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, []);
  const save = async () => {
    if (!state) return;
    setBusy(true); setMessage('');
    try {
      const r = await api.cron.configure({ enabled: state.enabled, ...(key ? { key } : {}) });
      if (!r.success) throw new Error('সংরক্ষণ হয়নি');
      const back = await api.cron.status();
      if (!back.success || back.state.enabled !== state.enabled || (key && !back.state.httpKeyConfigured)) throw new Error('সংরক্ষণ যাচাই হয়নি');
      setKey(''); setState(back.state); setMessage('ক্রন সেটিং আবার পড়ে যাচাই হয়েছে।');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'সংরক্ষণ ব্যর্থ'); }
    finally { setBusy(false); }
  };
  const run = async () => {
    setBusy(true); setMessage('');
    try { const r = await api.cron.run(); if (!r.success) throw new Error('ক্রন চালানো যায়নি'); const back = await api.cron.status(); if (!back.success || !back.state) throw new Error('ক্রন চলেছে, কিন্তু সর্বশেষ অবস্থা যাচাই হয়নি।'); setState(back.state); setMessage(`ফলাফল: ${r.status}; এই ডাকে পরীক্ষা: ${r.processedThisCall ?? 0}`); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'ক্রন চালানো ব্যর্থ'); }
    finally { setBusy(false); }
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setMessage('কপি হয়েছে'); }
    catch { setMessage('কপি করা যায়নি'); }
  };
  return <section aria-label="প্রতি মিনিটের ক্রন" className="border-t border-border pt-5 space-y-4">
    <header className="flex flex-wrap justify-between items-center gap-3"><h3 className="text-lg font-semibold">প্রতি মিনিটের ক্রন</h3>
      <div className="flex gap-2"><Button variant="outline" size="icon" aria-label="ক্রনের অবস্থা আবার পড়ুন" onClick={load} disabled={busy}><RefreshCw /></Button><Button variant="outline" onClick={run} disabled={busy || !state?.enabled}><Play />এখন চালান</Button></div>
    </header>
    <div className="flex gap-2 items-center"><Input aria-label="ক্রন URL" readOnly value={url} /><Button variant="outline" size="icon" aria-label="ক্রন URL কপি" onClick={() => copy(url)}><Copy /></Button></div>
    {state && <>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div><dt className="text-muted-foreground">অবস্থা</dt><dd>{state.status}{state.stale ? ' · নিয়মিত ডাক পাওয়া যাচ্ছে না' : ''}</dd></div>
        <div><dt className="text-muted-foreground">শেষ সফল ডাক</dt><dd>{state.lastSuccess || 'এখনো নেই'}</dd></div>
        <div><dt className="text-muted-foreground">এই চক্রে সদস্য পরীক্ষা</dt><dd>{state.processed} · {state.cycleComplete ? 'শেষ' : 'পরের ডাকে চলবে'}</dd></div>
        <div><dt className="text-muted-foreground">অসমাপ্ত VIP বেতনের কাজ</dt><dd>{state.salaryPendingJobs ?? 'অজানা'}</dd></div>
        <div><dt className="text-muted-foreground">অসমাপ্ত রহস্য কার্ডের কাজ</dt><dd>{state.mysteryPendingJobs ?? 'অজানা'}</dd></div>
        <div><dt className="text-muted-foreground">বাংলাদেশ সার্ভার সময়</dt><dd>{state.serverTime}</dd></div>
      </dl>
      {state.lastError && <p role="alert" className="text-destructive">{state.lastError}</p>}
      <div className="flex flex-wrap items-center gap-3"><Switch aria-label="ক্রন চালু" checked={state.enabled} onCheckedChange={enabled => setState({ ...state, enabled })} />ক্রন চালু
        <Input type="password" autoComplete="new-password" aria-label="আলাদা ক্রন কী" placeholder="আলাদা ক্রন কী (৩২–২৫৬ অক্ষর)" className="max-w-sm" value={key} onChange={e => setKey(e.target.value)} />
        <Button disabled={busy || (key.length > 0 && key.length < 32)} onClick={save}><Save />ক্রন সেটিং সংরক্ষণ</Button>
      </div>
      <p className="text-sm text-muted-foreground">HTTP কী: {state.httpKeyConfigured ? 'সেট করা আছে' : 'সেট করা নেই'} · মাস্টার কী ব্যবহার করবেন না।</p>
      {/^[A-Za-z]:[\\/]/.test(state.cliPath) ? <div className="space-y-2 text-sm"><h4 className="font-semibold">Windows Task Scheduler · প্রতি ১ মিনিট</h4><p>প্রোগ্রাম: সার্ভারের যাচাইকৃত php.exe</p><pre className="whitespace-pre-wrap break-all border border-border rounded-md p-3 bg-muted">{`"${state.cliPath}"`}</pre><p>একই কাজ একসাথে আবার শুরু না করার সেটিং রাখুন। স্বয়ংক্রিয় ডাক এখনও আলাদাভাবে স্থাপন করতে হবে।</p></div> : <div className="space-y-2 text-sm"><h4 className="font-semibold">cPanel · প্রতি মিনিট · * * * * *</h4>
        <pre className="whitespace-pre-wrap break-all border border-border rounded-md p-3 bg-muted">{`/usr/local/bin/php ${state.cliPath} >> /home/CPANEL_USER/bengalbet-cron.log 2>&1`}</pre>
        <pre className="whitespace-pre-wrap break-all border border-border rounded-md p-3 bg-muted">{`curl --fail --silent --show-error --max-time 50 --config /home/CPANEL_USER/.bengalbet-cron.conf '${url}' >> /home/CPANEL_USER/bengalbet-cron.log 2>&1`}</pre>
        <p className="text-muted-foreground">HTTP ব্যবহার করলে ব্যক্তিগত .conf ফাইলে header = "X-Cron-Key: YOUR_DEDICATED_KEY" রাখুন; অনুমতি 600। CPANEL_USER নিজের অ্যাকাউন্টের নামে বদলান। URL-এ কী দেবেন না।</p>
      </div>}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">{Object.entries(state.windows || {}).filter(([k]) => !['serverTime', 'timezone'].includes(k)).map(([k,v]) => <span key={k}>{k}: {v ? 'সময় খোলা' : 'সময় বন্ধ'}</span>)}</div>
      <p className="text-sm text-muted-foreground">নির্ধারিত দিনে VIP বেতনের নগদ কার্ড টিকিটে আসে; কার্ড গ্রহণের আগে ব্যালেন্স বাড়ে না। অসমাপ্ত কাজ পরের ডাকে চলবে।</p>
    </>}
    <p role="status" className="text-sm">{message}</p>
  </section>;
}