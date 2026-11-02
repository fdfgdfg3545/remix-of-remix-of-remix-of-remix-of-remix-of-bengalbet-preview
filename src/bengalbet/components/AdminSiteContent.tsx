import { useState } from 'react';
import { Bell, ImageOff, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import type { SiteNotice } from '../services/settingsPersistence';

interface Props {
  notice: SiteNotice;
  onChange: (notice: SiteNotice) => void;
  onSave: () => void;
  busy: boolean;
  ready: boolean;
  error: string | null;
  saved: boolean;
}

export function AdminSiteContent({ notice, onChange, onSave, busy, ready, error, saved }: Props) {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [brokenImage, setBrokenImage] = useState(false);
  const titleKey = language === 'bn' ? 'titleBn' : 'titleEn';
  const bodyKey = language === 'bn' ? 'contentBn' : 'contentEn';
  const update = <K extends keyof SiteNotice>(key: K, value: SiteNotice[K]) => onChange({ ...notice, [key]: value });

  return (
    <section className="admin-content-theme bg-background text-foreground p-4 sm:p-6 rounded-lg" aria-label="সাইটের নোটিশ সেটিংস">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="size-5 text-primary" />সাইটের নোটিশ</h2>
        <div className="flex items-center gap-3">
          <label htmlFor="notice-enabled" className="text-sm">প্রদর্শন চালু</label>
          <Switch id="notice-enabled" checked={notice.enabled} disabled={!ready || busy} onCheckedChange={value => update('enabled', value)} />
        </div>
      </header>
      {!ready && <p role="alert" className="text-destructive mt-4 text-sm">সার্ভারের সেটিংস পাওয়া যায়নি। রিফ্রেশ করে আবার চেষ্টা করুন।</p>}
      <div className="grid gap-6 lg:grid-cols-2 pt-5">
        <fieldset disabled={!ready || busy} className="space-y-5 min-w-0">
          <div className="flex gap-1 border-b border-border pb-3" aria-label="নোটিশের ভাষা">
            <Button type="button" variant={language === 'bn' ? 'default' : 'ghost'} onClick={() => setLanguage('bn')} aria-pressed={language === 'bn'}>বাংলা</Button>
            <Button type="button" variant={language === 'en' ? 'default' : 'ghost'} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>English</Button>
          </div>
          <div className="space-y-2"><label htmlFor="notice-title" className="text-sm font-medium">শিরোনাম</label><Input id="notice-title" value={notice[titleKey]} onChange={e => update(titleKey, e.target.value)} /></div>
          <div className="space-y-2"><label htmlFor="notice-body" className="text-sm font-medium">বিস্তারিত</label><Textarea id="notice-body" rows={6} value={notice[bodyKey]} onChange={e => update(bodyKey, e.target.value)} /></div>
          <div className="space-y-2"><label htmlFor="notice-image" className="text-sm font-medium">ব্যানার ছবির ঠিকানা</label><Input id="notice-image" type="url" value={notice.bannerImage} onChange={e => { setBrokenImage(false); update('bannerImage', e.target.value); }} /></div>
        </fieldset>
        <div className="min-w-0 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">পূর্বরূপ</h3>
          <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {notice.bannerImage && !brokenImage ? <img src={notice.bannerImage} alt="নোটিশ ব্যানারের পূর্বরূপ" className="w-full h-full object-contain" onError={() => setBrokenImage(true)} /> : <ImageOff className="size-8 text-muted-foreground" />}
          </div>
          <h3 className="text-lg font-semibold break-words">{notice[titleKey]}</h3>
          <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">{notice[bodyKey]}</p>
        </div>
      </div>
      <footer className="flex flex-wrap justify-between items-center gap-4 mt-6 pt-4 border-t border-border">
        <div role="status" className={error ? 'text-destructive text-sm' : 'text-primary text-sm'}>{error || (saved ? 'সার্ভার থেকে আবার পড়ে সংরক্ষণ নিশ্চিত হয়েছে।' : '')}</div>
        <Button disabled={!ready || busy} onClick={onSave}>{busy ? <Loader2 className="animate-spin" /> : <Save />} {busy ? 'সংরক্ষণ চলছে' : 'নোটিশ সংরক্ষণ'}</Button>
      </footer>
    </section>
  );
}