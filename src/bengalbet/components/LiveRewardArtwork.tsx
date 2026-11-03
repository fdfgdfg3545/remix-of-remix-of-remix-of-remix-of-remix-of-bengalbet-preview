import artwork from '@/assets/bengal-rewards-neutral.jpg';
import { liveRulesFor, useLiveRules } from '../services/promoLive';

export function LiveRewardArtwork({ type, title, compact = false }: { type: string; title: string; compact?: boolean }) {
  const live = useLiveRules();
  const lines = liveRulesFor(type, live);
  return <div className="relative isolate overflow-hidden bg-primary text-primary-foreground min-h-40">
    <img src={artwork} alt="BengalBet" width={1536} height={864} loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
    <div className={`relative w-3/4 p-4 sm:p-5 ${compact ? 'min-h-40' : 'min-h-48'}`}>
      <h3 className="text-base font-bold">{title}</h3>
      <div className="mt-2 space-y-1 text-xs leading-relaxed break-words">
        {(lines.length ? lines.slice(0, compact ? 1 : 4) : ['বর্তমান অফারের তথ্য পাওয়া যাচ্ছে না।']).map(line => <p key={line}>{line}</p>)}
      </div>
    </div>
  </div>;
}