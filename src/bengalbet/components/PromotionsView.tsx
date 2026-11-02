// @ts-nocheck
/**
 * BengalBet Promotions View
 * Features:
 * - Category filter tabs (All, Hot, New Member, Deposit, Bet Rebate, App Download)
 * - Search bar for instant filtering in Bengali & English
 * - 2-column responsive promotion cards with high-contrast badge tags
 * - Seamless modal opener for detailed promotion terms
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Flame, 
  Gift, 
  Coins, 
  Smartphone, 
  Sparkles, 
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Promotion, Language } from '../types';
import { usePromotions } from '../services/promoContent';

interface PromotionsViewProps {
  language: Language;
  onSelectPromotion: (promo: Promotion) => void;
  onBackToLobby: () => void;
}

type PromoCategoryFilter = 'all' | 'hot' | 'new_member' | 'deposit' | 'rebate' | 'app_download';

export const PromotionsView: React.FC<PromotionsViewProps> = ({
  language,
  onSelectPromotion,
  onBackToLobby
}) => {
  const [activeCategory, setActiveCategory] = useState<PromoCategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { id: PromoCategoryFilter; labelBn: string; labelEn: string; icon?: string }[] = [
    { id: 'all', labelBn: 'সমস্ত বিভাগ', labelEn: 'All Categories' },
    { id: 'hot', labelBn: '🔥হট🔥', labelEn: '🔥 Hot 🔥' },
    { id: 'new_member', labelBn: '🎁নতুন সদস্য🎁', labelEn: '🎁 New Member 🎁' },
    { id: 'deposit', labelBn: '🔥ডিপোজিট🔥', labelEn: '🔥 Deposit 🔥' },
    { id: 'rebate', labelBn: '💰বেট রিবেট💰', labelEn: '💰 Bet Rebate 💰' },
    { id: 'app_download', labelBn: '📱অ্যাপ ডাউনলোড📱', labelEn: '📱 App Download 📱' }
  ];

  const promotions = usePromotions();
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const matchesCategory = activeCategory === 'all' || promo.category === activeCategory;
      const matchesQuery = 
        promo.titleBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        promo.subtitleBn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery, promotions]);

  return (
    <div id="bengalbet-promotions-page" className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
      {/* Top Header / Breadcrumb exactly as screenshot */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          id="promo-back-btn"
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-base sm:text-lg font-bold text-[#86efac] hover:text-yellow-400 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-yellow-400" />
          <span>{language === 'bn' ? 'অফার' : 'Offers'}</span>
        </button>

        {/* Small search filter input */}
        <div className="relative max-w-xs hidden sm:block">
          <input 
            type="text"
            placeholder={language === 'bn' ? 'অফার সার্চ করুন...' : 'Search offers...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 lg:w-64 pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#051c13] border border-[#14593e] text-emerald-100 placeholder-emerald-500/60 focus:outline-none focus:border-yellow-400 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-emerald-500 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs Bar (Horizontal pill scroller matching screenshot) */}
      <div 
        id="promotions-filter-tabs"
        className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 mb-5 sm:mb-7 scrollbar-none select-none"
      >
        {filterTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              id={`promo-tab-${tab.id}`}
              onClick={() => setActiveCategory(tab.id)}
              className={`
                px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer
                ${isActive
                  ? 'bg-[#0e432f] text-yellow-400 border border-yellow-400/80 shadow-md scale-[1.02]'
                  : 'bg-[#072418] text-[#86efac]/80 hover:bg-[#0c3927] hover:text-white border border-[#14593e]'
                }
              `}
            >
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          );
        })}
      </div>

      {/* Promotions Cards Grid (2 Columns as per screenshot) */}
      <div 
        id="promotions-grid"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {filteredPromotions.map((promo) => (
          <div
            key={promo.id}
            id={`promo-card-${promo.id}`}
            onClick={() => onSelectPromotion(promo)}
            className="group cursor-pointer flex flex-col bg-[#072418] rounded-2xl overflow-hidden border border-[#176647] hover:border-yellow-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(255,190,26,0.25)] transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Banner Graphic Thumbnail Frame (aspect-16/9 for exact X/Y fit) */}
            <div className="relative aspect-[16/9] w-full bg-[#051c13] overflow-hidden">
              {promo.bannerImage ? (
                <>
                  <img
                    src={promo.bannerImage}
                    alt={language === 'bn' ? promo.titleBn : promo.titleEn}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Gradient Overlay for Badge Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Badge Tag in Top Right */}
                  {promo.badge && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg border border-red-400/80 uppercase tracking-wider">
                        {language === 'bn' ? promo.badgeBn || promo.badge : promo.badge}
                      </span>
                    </div>
                  )}

                  {/* Highlight Tag in Bottom Left of image */}
                  {promo.highlightNumber && (
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-black bg-black/75 text-yellow-300 border border-yellow-500/50 backdrop-blur-xs shadow-md">
                        {promo.highlightNumber}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                /* Terms & Policy Card Display (No promotional banner image needed) */
                <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-br from-[#0c3928] via-[#072418] to-[#04160f] relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />
                  
                  {/* Top header row */}
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-950/90 border border-emerald-500/50 flex items-center justify-center text-sm shadow">
                        🛡️
                      </div>
                      <span className="text-xs font-black text-emerald-300 tracking-wider">
                        BengalBet Policy
                      </span>
                    </div>
                    {promo.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow border border-emerald-400/50 uppercase tracking-wider">
                        {language === 'bn' ? promo.badgeBn || promo.badge : promo.badge}
                      </span>
                    )}
                  </div>

                  {/* Center message */}
                  <div className="relative z-10 my-auto py-1">
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-yellow-300 transition-colors leading-snug">
                      {language === 'bn' ? promo.titleBn : promo.titleEn}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-emerald-200/80 mt-1 line-clamp-2">
                      {language === 'bn' 
                        ? 'সকল অফার, ডিপোজিট বোনাস ও ক্যাশব্যাকের অফিশিয়াল নীতিমালা, ভেগারিং নিয়ম এবং ফেয়ার প্লে শর্তাবলী।'
                        : 'Universal rules, wagering guidelines, and fair play terms for all BengalBet promotions.'}
                    </p>
                  </div>

                  {/* Bottom indicators */}
                  <div className="flex items-center justify-between text-[11px] text-yellow-300/90 font-medium relative z-10 pt-2 border-t border-emerald-800/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      ১৮+ দায়িত্বশীল গেমিং
                    </span>
                    <span className="px-2 py-0.5 rounded bg-black/50 border border-yellow-500/40 text-yellow-300 font-mono text-[10px]">
                      {promo.highlightNumber}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Card Title & Subtitle exact to BengalBet design */}
            <div className="p-3.5 sm:p-4 bg-[#072418] flex items-center justify-between border-t border-[#14593e]/80 group-hover:bg-[#0b3323] transition-colors">
              <div className="flex flex-col pr-2">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-1">
                  {language === 'bn' ? promo.titleBn : promo.titleEn}
                </h3>
                <span className="text-[11px] text-[#86efac]/80 line-clamp-1 mt-0.5 font-medium">
                  {language === 'bn' ? promo.subtitleBn : promo.subtitleEn} • <strong className="text-yellow-400">{promo.claimableAmount}</strong>
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#0e432f] group-hover:bg-yellow-400 group-hover:text-black text-emerald-300 flex items-center justify-center transition-all shadow-md shrink-0">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-16 bg-[#072418] rounded-xl border border-[#14593e] my-4">
          <Layers className="w-12 h-12 text-emerald-600 mx-auto mb-3 animate-pulse" />
          <p className="text-base text-gray-300 font-semibold">
            {language === 'bn' ? 'কোনো অফার পাওয়া যায়নি' : 'No promotions found in this category'}
          </p>
          <button
            onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
            className="mt-3 px-4 py-1.5 rounded-md bg-[#0e432f] text-yellow-400 text-xs font-bold hover:bg-[#155e42]"
          >
            {language === 'bn' ? 'সমস্ত অফার দেখুন' : 'View All Offers'}
          </button>
        </div>
      )}
    </div>
  );
};
