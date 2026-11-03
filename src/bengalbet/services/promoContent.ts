/**
 * Promotion pages shown to members: the admin-edited server list when present, else the built-in list.
 * Banner images may be "asset:<key>" (a bundled site image) or an https URL.
 */
import { useEffect, useState } from 'react';
import { PROMOTIONS_DATA } from '../data/promotions';
import { loadPromoLive, liveRulesFor } from './promoLive';

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

export function usePromotions(): any[] {
  const [list, setList] = useState<any[]>(PROMOTIONS_DATA as any[]);
  useEffect(() => { let on = true; loadPromoLive().then((r) => { if (on) setList(mergeServerPromotions(r.promotions).map(p => {
    const lines = liveRulesFor(p.iconType, r.live);
    // Printed banner numbers cannot track admin changes. Keep originals in the editor,
    // but show current server copy to members instead of incompatible printed terms.
    return lines.length ? { ...p, titleBn: lines[0], subtitleBn: lines[1] || '', requirementsBn: lines, rulesBn: lines, bannerImage: '' } : p;
  })); }); return () => { on = false; }; }, []);
  return list;
}
