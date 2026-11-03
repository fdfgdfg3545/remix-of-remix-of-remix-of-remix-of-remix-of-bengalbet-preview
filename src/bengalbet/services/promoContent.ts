/**
 * Promotion pages shown to members: the admin-edited server list when present, else the built-in list.
 * Banner images may be "asset:<key>" (a bundled site image) or an https URL.
 */
import { useEffect, useState } from 'react';
import { PROMOTIONS_DATA } from '../data/promotions';
import { loadPromoLive, liveRulesFor, type LiveRules } from './promoLive';

const ICON_TO_ASSET: Record<string, string> = {
  mystery: 'mystery', referral: 'referral', deposit: 'first_deposit', vip: 'vip', slot: 'daily_slot', app: 'app',
  cashback: 'rescue', golden_egg: 'golden_egg', red_packet: 'red_packet', iphone: 'iphone', member_day: 'member_day', rebate: 'rebate',
};
/** Bundled banner images by key, taken from the built-in promotion list. */
export const PROMO_ASSETS: Record<string, string> = Object.fromEntries(
  PROMOTIONS_DATA.filter((p: any) => p.bannerImage && ICON_TO_ASSET[p.iconType]).map((p: any) => [ICON_TO_ASSET[p.iconType], p.bannerImage]),
);

export function resolveBanner(img: string | undefined): string {
  if (!img) return '';
  if (img.startsWith('asset:')) return PROMO_ASSETS[img.slice(6)] || '';
  return /^https:\/\//i.test(img) ? img : '';
}

/** Built-in list converted to the server's storable shape (banner as asset key). */
export function builtinPromotionsForServer(): any[] {
  return PROMOTIONS_DATA.map((p: any) => {
    const key = ICON_TO_ASSET[p.iconType];
    return { ...p, enabled: true, bannerImage: p.bannerImage && key ? `asset:${key}` : '' };
  });
}

export function mergeServerPromotions(server: any[] | null | undefined): any[] {
  if (!Array.isArray(server)) return PROMOTIONS_DATA as any[];
  return server.filter((p) => p && p.enabled !== false).map((p) => ({ ...p, bannerImage: resolveBanner(p.bannerImage) }));
}

/**
 * Site banners carry printed numbers. A bundled banner is shown on the offers page only while
 * the live server value equals the printed one; otherwise the card falls back to text only.
 */
export function bannerMatchesLive(iconType: string, live: LiveRules | null | undefined): boolean {
  if (!live) return false;
  const r = live.promoRules || {};
  switch (iconType) {
    case 'deposit': return !!live.depositOffer?.enabled && Number(live.depositOffer?.bonusPercent) === 47;
    case 'referral': return !!live.referral?.enabled && Number(live.referral?.instantBonusPerFriend) === 300;
    case 'app': return !!r.appBonus?.enabled && Number(r.appBonus?.amount) === 52;
    case 'golden_egg': return Number(live.chance?.golden_egg?.max) === 18222;
    case 'red_packet': return !!r.redPacket?.enabled && Number(live.chance?.red_envelope?.max) === 77777;
    case 'rebate': return !!r.rebate?.enabled && Number(r.rebate?.ratePercent) === 3;
    case 'mystery': return !!live.mystery?.enabled && Number(live.mystery?.triggerDayOfMonth) === 23;
    case 'member_day': return !!r.memberDay?.enabled && Number(r.memberDay?.day) === 13;
    case 'iphone': case 'vip': case 'slot': case 'cashback': return true;
    default: return false;
  }
}

export function usePromotions(): any[] {
  const [list, setList] = useState<any[]>(PROMOTIONS_DATA as any[]);
  useEffect(() => { let on = true; loadPromoLive().then((r) => { if (on) setList(mergeServerPromotions(r.promotions).map(p => {
    const lines = liveRulesFor(p.iconType, r.live);
    // Live server copy is the text; the site banner stays while its printed numbers equal live values.
    const banner = bannerMatchesLive(p.iconType, r.live) ? p.bannerImage : '';
    return lines.length ? { ...p, titleBn: lines[0], titleEn: '', subtitleBn: lines[1] || '', subtitleEn: '', requirementsBn: lines, rulesBn: lines, bannerImage: banner, highlightNumber: '', claimableAmount: '', validUntil: '', badge: '', badgeBn: '' } : p;
  })); }); return () => { on = false; }; }, []);
  return list;
}
