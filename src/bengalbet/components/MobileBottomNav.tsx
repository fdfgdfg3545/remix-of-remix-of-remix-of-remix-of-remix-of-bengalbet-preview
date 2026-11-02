// @ts-nocheck
import React from 'react';
import { Home, Gift, Trophy, User, Share2 } from 'lucide-react';
import { Language, UserAccount } from '../types';

interface MobileBottomNavProps {
  language: Language;
  activeView: 'lobby' | 'promotions' | 'category' | 'favorites';
  user: UserAccount;
  onNavigateLobby: () => void;
  onOpenPromotions: () => void;
  onOpenShare: () => void;
  onOpenRewards: () => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  activeView,
  user,
  onNavigateLobby,
  onOpenPromotions,
  onOpenShare,
  onOpenRewards,
  onOpenAccount
}) => {
  return (
    <nav 
      id="mobile-bottom-navigation-bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#073022] border-t border-[#12583d] px-2 py-1 flex items-center justify-around select-none shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 6px)' }}
    >
      {/* 1. হোম (Home) */}
      <button
        id="mobile-nav-home"
        onClick={() => {
          onNavigateLobby();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
          activeView === 'lobby' || activeView === 'category'
            ? 'text-yellow-400'
            : 'text-emerald-200/80 hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${activeView === 'lobby' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] font-bold font-bengali mt-0.5">
          {language === 'bn' ? 'হোম' : 'Home'}
        </span>
      </button>

      {/* 2. প্রমোশন (Promotions) */}
      <button
        id="mobile-nav-promotions"
        onClick={onOpenPromotions}
        className={`flex-1 flex flex-col items-center justify-center py-1 cursor-pointer transition-colors ${
          activeView === 'promotions'
            ? 'text-yellow-400'
            : 'text-emerald-200/80 hover:text-white'
        }`}
      >
        <Gift className={`w-5 h-5 ${activeView === 'promotions' ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[11px] font-bold font-bengali mt-0.5">
          {language === 'bn' ? 'প্রমোশন' : 'Promotions'}
        </span>
      </button>

      {/* 3. সেন্টার এলিভেটেড শেয়ার বাটন (Elevated Big Center Share Button matching Screenshot) */}
      <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
        <button
          id="mobile-nav-share"
          onClick={onOpenShare}
          className="relative w-14 h-14 rounded-full bg-gradient-to-b from-[#22c55e] via-[#0f7a50] to-[#043421] border-[2.5px] border-emerald-300 shadow-[0_0_20px_rgba(34,197,94,0.65),0_8px_20px_rgba(0,0,0,0.85)] flex flex-col items-center justify-center text-white active:scale-95 transition-transform cursor-pointer group animate-sweetfun-share"
          title={language === 'bn' ? 'বন্ধুদের আমন্ত্রণ করুন ও আয় করুন' : 'Share and Earn'}
        >
          {/* SweetFun light sweep sheen effect */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-sweetfun-shimmer" />
          </span>

          {/* Mini Gold Bonus Tag */}
          <span className="absolute -top-1.5 px-1.5 py-0.2 bg-gradient-to-r from-amber-400 to-yellow-300 text-black text-[7.5px] font-black rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.6)] border border-yellow-100 tracking-wider pointer-events-none uppercase">
            {language === 'bn' ? 'বোনাস' : 'HOT'}
          </span>

          {/* SweetFun Playful swinging Share Icon */}
          <div className="relative pointer-events-none">
            <Share2 className="w-5.5 h-5.5 text-yellow-300 stroke-[2.5] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-sweetfun-icon" />
          </div>

          <span className="text-[10px] font-black text-white font-bengali tracking-tight -mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none">
            {language === 'bn' ? 'শেয়ার' : 'Share'}
          </span>
        </button>
      </div>

      {/* 4. পুরস্কার (Rewards / Missions) */}
      <button
        id="mobile-nav-rewards"
        onClick={() => onOpenRewards()}
        className="flex-1 flex flex-col items-center justify-center py-1 text-emerald-200/80 hover:text-white cursor-pointer transition-colors"
      >
        <Trophy className="w-5 h-5 stroke-2" />
        <span className="text-[11px] font-bold font-bengali mt-0.5">
          {language === 'bn' ? 'পুরস্কার' : 'Rewards'}
        </span>
      </button>

      {/* 5. সদস্য (Account / Profile / Login) */}
      <button
        id="mobile-nav-account"
        onClick={onOpenAccount}
        className="flex-1 flex flex-col items-center justify-center py-1 text-emerald-200/80 hover:text-white cursor-pointer transition-colors"
      >
        <User className="w-5 h-5 stroke-2" />
        <span className="text-[11px] font-bold font-bengali mt-0.5">
          {language === 'bn' ? 'সদস্য' : 'Member'}
        </span>
      </button>
    </nav>
  );
};
