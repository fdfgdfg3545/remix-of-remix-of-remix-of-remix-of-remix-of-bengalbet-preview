/**
 * Live promotion data from the server (public settings): admin-edited promotion pages and the
 * rule values the server enforces. Promotion pages show rule lines built here, never typed copy.
 */
import { api } from './api';

export type LiveRules = {
  promoRules: any; depositOffer: any; referral: any; mystery: any;
  chance: Record<'spin' | 'golden_egg' | 'red_envelope', { min: number; max: number; count: number }>;
  rescueTiers: { minLoss: number; percentage: number; maxBonus: number }[];
  vipTiers: { level: number; name: string; targetBet: number; depositTarget: number; upgradeBonus: number; weeklyBonus: number; monthlyBonus: number; birthdayBonus: number }[];
  limits: { minDeposit: number; maxDeposit: number; minWithdraw: number; maxWithdraw: number };
};

let cache: Promise<{ promotions: any[] | null; live: LiveRules | null }> | null = null;
export function loadPromoLive(force = false) {
  if (!cache || force) {
    cache = api.settings.getPublicSettings()
      .then((r: any) => ({ promotions: Array.isArray(r?.settings?.promotions) ? r.settings.promotions : null, live: r?.settings?.live ?? null }))
      .catch(() => ({ promotions: null, live: null }));
  }
  return cache;
}

const tk = (n: number) => `৳${Number(n || 0).toLocaleString('en-US')}`;
const pct = (n: number) => `${Number(n || 0)}%`;
const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;
const DAYS = ['', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার', 'রবিবার'];

/** Rule lines the server actually enforces for a promotion type (iconType). Empty when unknown. */
export function liveRulesFor(iconType: string, live: LiveRules | null | undefined): string[] {
  if (!live) return [];
  const r = live.promoRules || {};
  const w = r.withdrawal;
  const wager = (x: number) => (w?.enabled ? `বোনাস তোলার আগে বোনাসের ${x} গুণ বাজি লাগবে।` : 'বোনাসে বাজির শর্ত নেই।');
  switch (iconType) {
    case 'deposit': {
      const o = live.depositOffer || {};
      if (!o.enabled) return ['এখন কোনো জমা বোনাস চালু নেই।'];
      return [
        `${o.firstDepositOnly ? 'শুধু প্রথম জমায়' : 'প্রতিটি জমায়'} ${pct(o.bonusPercent)} বোনাস${o.maxBonus > 0 ? `, সর্বোচ্চ ${tk(o.maxBonus)}` : ''}।`,
        `বোনাসের জন্য ন্যূনতম জমা ${tk(o.minDepositForBonus)}; জমার সীমা ${tk(live.limits.minDeposit)}–${tk(live.limits.maxDeposit)}।`,
        'জমা পেইজে বোনাস বেছে নিন; অ্যাডমিন জমা অনুমোদন করলে বোনাস যোগ হয়।',
        w?.enabled ? `তোলার আগে জমার ${w.depositTurnover} গুণ ও বোনাসের ${w.depositBonusTurnover} গুণ বাজি লাগবে।` : 'তোলার আগে বাজির শর্ত নেই।',
      ];
    }
    case 'referral': {
      const s = live.referral || {};
      if (!s.enabled) return ['রেফার প্রোগ্রাম এখন বন্ধ।'];
      return [
        `বন্ধু ${tk(s.minDepositToQualify)} জমা ও ${tk(s.minBetTurnoverToQualify)} বাজি করলে আপনি ${tk(s.instantBonusPerFriend)} পাবেন (প্রতি বন্ধু একবার)।`,
        `বন্ধুর প্রতিটি অনুমোদিত জমায় ${pct(s.depositRebateRate)} কমিশন।`,
        `বন্ধুর প্রতিটি বাজিতে ${pct(s.betTurnoverRebateRate)} কমিশন সাথে সাথে।`,
      ];
    }
    case 'mystery': {
      const m = live.mystery || {};
      if (!m.enabled) return ['রহস্যময় পুরস্কার এখন বন্ধ।'];
      return [
        `মাসের ১ থেকে ${Math.max(1, m.triggerDayOfMonth - 1)} তারিখে মোট ${tk(m.minBetRequired)} বাজি করলে যোগ্য।`,
        `প্রতি মাসের ${m.triggerDayOfMonth} তারিখ ${hh(m.triggerHour)} থেকে দাবি করুন: ${tk(m.minBonusAmount)}–${tk(m.maxBonusAmount)}।`,
        wager(r.withdrawal?.otherBonusTurnover ?? 1),
      ];
    }
    case 'vip': {
      const t = (live.vipTiers || []).filter((x) => x.level > 0);
      const top = t.reduce((a, b) => Math.max(a, b.upgradeBonus, b.monthlyBonus), 0);
      return [
        `প্রতি ৳১ বাজিতে ১ ভিআইপি পয়েন্ট; লেভেল ${t[0]?.level ?? 1}–${t[t.length - 1]?.level ?? 10}।`,
        `সাপ্তাহিক বোনাস প্রতি ${DAYS[r.vip?.weeklyClaimDay] || 'সোমবার'}, মাসিক বোনাস মাসের ${r.vip?.monthlyClaimDay ?? 1} তারিখে।`,
        top > 0 ? `সর্বোচ্চ লেভেল-আপ/মাসিক বোনাস ${tk(top)}।` : 'ভিআইপি বোনাস অ্যাডমিন ঠিক করেন।',
      ];
    }
    case 'slot': {
      const c = r.slotDaily || {};
      if (!c.enabled) return ['দৈনিক স্লট বোনাস এখন বন্ধ।'];
      return [`গতকাল স্লটে ${tk(c.minBet)} বা বেশি বাজি করলে ${pct(c.ratePercent)} বোনাস, সর্বোচ্চ ${tk(c.maxBonus)}।`, `প্রতিদিন ${hh(c.claimFromHour)} থেকে রিবেট পেইজে দাবি করুন।`, wager(r.withdrawal?.otherBonusTurnover ?? 1)];
    }
    case 'app': {
      const a = r.appBonus || {};
      return a.enabled ? [`অ্যাপ ডাউনলোড বোনাস ${tk(a.amount)}, প্রতি অ্যাকাউন্টে একবার।`, wager(r.withdrawal?.otherBonusTurnover ?? 1)] : ['অ্যাপ বোনাস এখন বন্ধ।'];
    }
    case 'cashback': {
      const c = r.rescue || {};
      if (!c.enabled) return ['উদ্ধার তহবিল এখন বন্ধ।'];
      return [
        ...(live.rescueTiers || []).map((t) => `গতকালের লস ${tk(t.minLoss)}+ → ${pct(t.percentage)} (সর্বোচ্চ ${tk(t.maxBonus)})`),
        `গেম: ${(c.categories || []).join(', ')}; পরদিন ${hh(c.claimDeadlineHour)} এর মধ্যে দাবি করুন।`,
      ];
    }
    case 'golden_egg': {
      const ch = live.chance?.golden_egg;
      return [`দিনের প্রথম লগইনে ${r.loginHammerPerDay} হাতুড়ি; প্রতিটি অনুমোদিত জমায় ১টি (দিনে সর্বোচ্চ ${r.depositEggsPerDay})।`, ch?.count ? `পুরস্কার ${tk(ch.min)}–${tk(ch.max)}, সার্ভার বেছে দেয়।` : 'পুরস্কার তালিকা এখনো ঠিক হয়নি।'];
    }
    case 'red_packet': {
      const p = r.redPacket || {}; const ch = live.chance?.red_envelope;
      if (!p.enabled) return ['রেড প্যাকেট এখন বন্ধ।'];
      return [`রাউন্ড: ${(p.hours || []).map(hh).join(', ')} (প্রতিটি ${p.durationMinutes} মিনিট)।`, `প্রতি রাউন্ডে প্রথম ${p.perRoundLimit} জন, সদস্যপ্রতি ১টি।`, ch?.count ? `পুরস্কার ${tk(ch.min)}–${tk(ch.max)}।` : 'পুরস্কার তালিকা এখনো ঠিক হয়নি।'];
    }
    case 'iphone': {
      const ch = live.chance?.spin;
      return [`দিনে ${tk(r.wheelTicketMinDeposit)} বা বেশি অনুমোদিত জমায় ${r.wheelTicketsPerDay}টি হুইল টিকিট।`, ch?.count ? `হুইলের পুরস্কার ${tk(ch.min)}–${tk(ch.max)}।` : 'পুরস্কার তালিকা এখনো ঠিক হয়নি।'];
    }
    case 'member_day': {
      const c = r.memberDay || {};
      if (!c.enabled) return ['সদস্য দিবস এখন বন্ধ।'];
      return [`প্রতি মাসের ${c.day} তারিখে দাবি করুন।`, `১ থেকে ${c.day - 1} তারিখে ${tk(c.minBet)} বা বেশি বাজি করলে ${pct(c.ratePercent)} বোনাস, সর্বোচ্চ ${tk(c.maxBonus)}।`];
    }
    case 'rebate': {
      const c = r.rebate || {};
      return c.enabled ? [`সব বাজিতে ${pct(c.ratePercent)} রিবেট, যেকোনো সময় রিবেট পেইজে দাবি করুন।`, wager(r.withdrawal?.otherBonusTurnover ?? 1)] : ['রিবেট এখন বন্ধ।'];
    }
    default:
      return [];
  }
}

/** React hook: live server rules (null until loaded). */
import { useEffect as _ue, useState as _us } from 'react';
export function useLiveRules(): LiveRules | null {
  const [live, setLive] = _us<LiveRules | null>(null);
  _ue(() => { let on = true; loadPromoLive().then((r) => { if (on) setLive(r.live); }); return () => { on = false; }; }, []);
  return live;
}
export const weekdayName = (d?: number) => DAYS[d || 1] || 'সোমবার';
