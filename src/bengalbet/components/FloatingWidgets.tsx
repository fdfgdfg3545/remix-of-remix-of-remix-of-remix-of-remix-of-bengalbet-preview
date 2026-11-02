// @ts-nocheck
/**
 * BengalBet Floating Quick Actions & Widgets
 * Features:
 * - Floating side dock with quick triggers (24/7 Live Support, Golden Egg, Lucky Spin, Daily Missions)
 * - Draggable/dockable interface with minimizer and quick navigation
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Headphones, 
  MessageCircle,
  Ticket,
  Sparkles,
  Trophy,
  Send,
  Facebook,
  ChevronDown,
  ChevronUp,
  Check,
  Percent,
  Gift,
  Coins,
  Crown
} from 'lucide-react';
import { Language } from '../types';

interface FloatingWidgetsProps {
  language: Language;
  activeView?: 'lobby' | 'promotions' | 'category' | 'favorites';
  onOpenSupport: () => void;
  onOpenVIP: () => void;
  onOpenSpin?: () => void;
  onOpenTicket?: () => void;
  onOpenSuperValueReward?: () => void;
  onOpenMissions?: () => void;
  onOpenEgg?: () => void;
  onOpenPromotions?: () => void;
  onOpenFeaturedGames: () => void;
  onLaunchHotGame?: () => void;
}

export const FloatingWidgets: React.FC<FloatingWidgetsProps> = ({
  language,
  activeView = 'lobby',
  onOpenSupport,
  onOpenVIP,
  onOpenSpin,
  onOpenTicket,
  onOpenSuperValueReward,
  onOpenMissions,
  onOpenEgg,
  onOpenPromotions,
  onOpenFeaturedGames,
  onLaunchHotGame
}) => {
  const [isDockExpanded, setIsDockExpanded] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isSupportMenuOpen, setIsSupportMenuOpen] = useState(false);
  const [isOfferWidgetHidden, setIsOfferWidgetHidden] = useState(false);

  const supportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle through items 1 by 1 when collapsed
  useEffect(() => {
    if (isDockExpanded || isOfferWidgetHidden) return;
    const interval = setInterval(() => {
      setActiveItemIndex((prev) => (prev + 1) % 7);
    }, 2600);

    return () => clearInterval(interval);
  }, [isDockExpanded, isOfferWidgetHidden]);

  // Support menu hover handlers
  const handleSupportMouseEnter = () => {
    if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
    setIsSupportMenuOpen(true);
  };

  const handleSupportMouseLeave = () => {
    supportTimeoutRef.current = setTimeout(() => {
      setIsSupportMenuOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (supportTimeoutRef.current) clearTimeout(supportTimeoutRef.current);
    };
  }, []);

  // Items definition matching Capture9.PNG & Capture10.PNG
  const dockItems = [
    {
      id: 'dock-vip-club',
      nameBn: 'ভিআইপি ক্লাব ও সুবিধা',
      nameEn: 'VIP Club & Rewards',
      badge: 'VIP',
      action: () => {
        if (onOpenVIP) onOpenVIP();
      },
      renderIcon: () => (
        <div 
          id="dock-icon-vip"
          className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_12px_rgba(250,204,21,0.65)] group-hover:scale-115 transition-all duration-200"
        >
          {/* Circular backdrop glow with gold neon border */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#451e04] via-[#241002] to-[#0a0401] border-2 border-yellow-400/95 shadow-[0_0_15px_rgba(250,204,21,0.6),inset_0_1px_3px_rgba(255,255,255,0.4)] flex flex-col items-center justify-center relative overflow-visible">
            {/* Ambient Radial Golden Shimmer */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_30%,rgba(253,224,71,0.45),transparent_70%)] pointer-events-none" />
            
            {/* 3D Golden Crown with Star Sparkles */}
            <Crown className="w-5.5 h-5.5 text-yellow-300 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.95)] animate-pulse" />
            
            {/* Sparkling Crown Diamond on top right */}
            <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-yellow-100 absolute -top-1.5 right-0 animate-spin" style={{ animationDuration: '6s' }} />

            {/* Glowing Golden-Black VIP Ribbon Banner */}
            <div className="absolute -bottom-1.5 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-2 py-0.2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 text-black text-[7.5px] font-black tracking-wider uppercase rounded-full border border-yellow-100 shadow-[0_2px_5px_rgba(0,0,0,0.85)] leading-tight whitespace-nowrap font-game">
                VIP
              </span>
            </div>
          </div>

          {/* Floating LV badge / Royal Jewel */}
          <div className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border border-white text-black text-[6.5px] font-black flex items-center justify-center shadow-md">
            LV
          </div>
        </div>
      )
    },
    {
      id: 'mission-trophy',
      nameBn: 'দৈনিক মিশন ও টাস্ক',
      nameEn: 'Daily Missions',
      badge: 'HOT',
      action: () => {
        if (onOpenMissions) onOpenMissions();
      },
      renderIcon: () => (
        <div 
          id="dock-icon-mission-trophy"
          className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(250,204,21,0.5)] group-hover:scale-115 transition-all duration-200"
        >
          {/* Circular backdrop glow with gold neon border */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#0e4834] via-[#062e20] to-[#021810] border-2 border-yellow-400/90 shadow-[0_0_12px_rgba(250,204,21,0.45)] flex flex-col items-center justify-center relative overflow-visible">
            {/* Ambient Radial Golden Shimmer */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_35%,rgba(253,224,71,0.35),transparent_70%)] pointer-events-none" />
            
            {/* Golden Trophy Cup with Star */}
            <Trophy className="w-6 h-6 text-yellow-300 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(253,224,71,0.9)] animate-pulse" />
            
            {/* Sparkling Top Star */}
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 fill-yellow-100 absolute -top-1.5 right-0.5 animate-spin" style={{ animationDuration: '6s' }} />

            {/* Glowing Red-Gold 'MISSION' / 'মিশন' Ribbon Banner */}
            <div className="absolute -bottom-1.5 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-1.5 py-0.2 bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 text-white text-[7.5px] font-black tracking-wider uppercase rounded-full border border-yellow-300 shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-tight whitespace-nowrap">
                {language === 'bn' ? 'মিশন' : 'MISSION'}
              </span>
            </div>
          </div>

          {/* Glowing Red Notification / Claimable Badge */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 border border-white text-white text-[7px] font-black flex items-center justify-center shadow animate-bounce">
            1
          </span>
        </div>
      )
    },
    {
      id: 'discount-rebate',
      nameBn: 'ক্যাশব্যাক ও ভাউচার ডিসকাউন্ট',
      nameEn: 'Discount & Rebates',
      action: () => {
        if (onOpenPromotions) onOpenPromotions();
      },
      renderIcon: () => (
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          {/* 3D Coupon Ticket */}
          <div className="relative w-10 h-7 rounded-lg bg-gradient-to-br from-[#d97706] via-[#f59e0b] to-[#b45309] border-2 border-yellow-200 shadow flex items-center justify-between px-1.5 transform -rotate-6">
            <span className="text-[10px] font-black text-black bg-yellow-200 px-1 py-0.2 rounded shadow-inner">%</span>
            <div className="w-3 h-3 rounded-full bg-red-600 border border-white flex items-center justify-center">
              <span className="text-[6px] font-bold text-white">৳</span>
            </div>
          </div>
          {/* Background layered ticket & chips */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            <div className="w-8 h-6 bg-red-700/80 rounded-md rotate-12 border border-amber-400/60" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 border border-white" />
          </div>
        </div>
      )
    },
    {
      id: 'treasure-chest',
      nameBn: 'BengalBet সুপার ভ্যালু রিওয়ার্ড',
      nameEn: 'Super Value Reward',
      badge: 'GIFT',
      action: () => {
        if (onOpenSuperValueReward) {
          onOpenSuperValueReward();
        } else if (onOpenTicket) {
          onOpenTicket();
        }
      },
      renderIcon: () => (
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          {/* 3D Radiant Red & Gold Chest */}
          <div className="relative w-10 h-8 rounded-t-lg rounded-b-md bg-gradient-to-b from-[#b91c1c] via-[#dc2626] to-[#7f1d1d] border-2 border-yellow-400 shadow-md flex flex-col items-center justify-center overflow-hidden">
            {/* Golden Rim Lock */}
            <div className="w-full h-2 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600 border-y border-amber-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 border border-black/40 flex items-center justify-center my-0.5 shadow">
              <span className="w-1 h-1 rounded-full bg-black/80" />
            </div>
            {/* Chest base straps */}
            <div className="w-full flex justify-between px-1.5 pb-0.5">
              <span className="w-1 h-2 bg-yellow-400" />
              <span className="w-1 h-2 bg-yellow-400" />
            </div>
          </div>
          {/* Glowing overflowing gold & pearls */}
          <div className="absolute -bottom-1 inset-x-0 flex justify-center items-center gap-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-600 shadow-sm animate-pulse" />
            <span className="w-3 h-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border border-white shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 border border-amber-600 shadow-sm" />
          </div>
        </div>
      )
    },
    {
      id: 'golden-egg-stage',
      nameBn: 'সোনার ডিম ভাঙুন ও স্পিন',
      nameEn: 'Golden Egg & Spin',
      action: () => {
        if (onOpenEgg) {
          onOpenEgg();
        } else if (onOpenSpin) {
          onOpenSpin();
        }
      },
      renderIcon: () => (
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          {/* Purple Neon Arch Stage */}
          <div className="relative w-10 h-10 rounded-t-full bg-gradient-to-b from-[#6b21a8] via-[#581c87] to-[#3b0764] border-2 border-fuchsia-400/90 flex flex-col items-center justify-end pb-1 shadow-lg overflow-hidden">
            {/* Neon Dots Arch */}
            <div className="absolute top-1 inset-x-0 flex justify-center gap-1 pointer-events-none">
              <span className="w-1 h-1 rounded-full bg-yellow-300 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-cyan-300" />
              <span className="w-1 h-1 rounded-full bg-yellow-300 animate-ping" />
            </div>
            {/* Glossy 3D Golden Egg with wobble and shine */}
            <div className="relative w-5 h-6 flex items-center justify-center animate-egg-wobble filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <svg viewBox="0 0 100 125" className="w-full h-full">
                <defs>
                  <radialGradient id="dockEggGlow" cx="34%" cy="30%" r="72%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="25%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="85%" stopColor="#b45309" />
                    <stop offset="100%" stopColor="#451a03" />
                  </radialGradient>
                </defs>
                <path
                  d="M 50,4 C 22,4 6,44 6,76 C 6,108 24,122 50,122 C 76,122 94,108 94,76 C 94,44 78,4 50,4 Z"
                  fill="url(#dockEggGlow)"
                  stroke="#ca8a04"
                  strokeWidth="1.5"
                />
                {/* Specular gloss crescent */}
                <path
                  d="M 37,14 C 27,24 19,42 21,64 C 22,68 18,66 17,60 C 15,41 23,21 34,11 C 36,9 38,11 37,14 Z"
                  fill="#ffffff"
                  opacity="0.85"
                />
              </svg>
              <Sparkles className="absolute -top-1 -right-1 w-2.5 h-2.5 text-yellow-200 fill-white animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
            </div>
            {/* Stage Pedestal */}
            <div className="w-8 h-1.5 bg-gradient-to-r from-fuchsia-600 via-purple-400 to-fuchsia-600 rounded-full border border-purple-300 mt-0.5" />
          </div>
        </div>
      )
    },
    {
      id: 'featured-games-bubble',
      nameBn: 'ফিচার্ড ক্যাসিনো গেমস',
      nameEn: 'Featured Games',
      hasRedDot: true,
      action: () => {
        onOpenFeaturedGames();
      },
      renderIcon: () => (
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          {/* 3D Glossy Blue Circular Bubble */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#1e40af] via-[#0284c7] to-[#0f172a] border-2 border-sky-300 shadow-lg flex flex-col items-center justify-center overflow-hidden">
            {/* Light reflection gloss */}
            <div className="absolute top-0.5 left-1 w-4 h-2 bg-white/40 rounded-full blur-[1px]" />
            <span className="text-[7.5px] font-black text-white leading-tight uppercase text-center tracking-tighter drop-shadow">
              FEATURED<br/><span className="text-yellow-300">GAMES</span>
            </span>
          </div>
          {/* Red Notification Dot */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white ring-2 ring-rose-950 animate-pulse" />
        </div>
      )
    },
    {
      id: 'olympus-hot-slot',
      nameBn: 'অলিম্পাস স্লট (হট)',
      nameEn: 'Gates of Olympus',
      hasRedDot: true,
      hasPromoBadge: true,
      action: () => {
        if (onLaunchHotGame) {
          onLaunchHotGame();
        } else {
          onOpenFeaturedGames();
        }
      },
      renderIcon: () => (
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform">
          {/* 3D Zeus Avatar Circle with Gold Border */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#78350f] via-[#b45309] to-[#451a03] border-2 border-yellow-300 shadow-lg flex flex-col items-center justify-center overflow-hidden">
            {/* Zeus Face Illustration */}
            <div className="w-full h-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-amber-700 to-amber-950">
              <span className="text-[14px]">⚡</span>
              <span className="text-[6.5px] font-black text-yellow-300 -mt-1 tracking-tighter">OLYMPUS</span>
            </div>
          </div>
          {/* Crown */}
          <Crown className="w-3 h-3 text-amber-300 fill-yellow-400 absolute -top-1 left-0 transform -rotate-12" />
          {/* Red "প্রচারণা" badge */}
          <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[7px] font-black rounded border border-yellow-200 shadow">
            {language === 'bn' ? 'প্রচারণা' : 'HOT'}
          </span>
          {/* Red Notification Dot */}
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border border-white ring-1 ring-rose-900 animate-pulse" />
        </div>
      )
    }
  ];

  const currentItem = dockItems[activeItemIndex];

  return (
    <>
      {/* ========================================================================= */}
      {/* 0. LEFT-SIDE FLOATING SOCIAL DOCK (Only displayed on Home Lobby Tab) */}
      {/* ========================================================================= */}
      {activeView === 'lobby' && (
        <div 
          id="left-floating-social-stack"
          className="md:hidden fixed left-2 sm:left-3.5 bottom-20 z-40 flex flex-col items-center gap-2 select-none animate-in fade-in duration-200"
        >
          {/* Facebook (Golden Yellow circle) */}
          <a
            href="https://facebook.com/bengalbetofficial"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#ca8a04] via-[#eab308] to-[#facc15] hover:brightness-110 text-white flex items-center justify-center shadow-[0_3px_10px_rgba(234,179,8,0.5)] border-2 border-yellow-200 hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
            title={language === 'bn' ? 'ফেসবুক গ্রুপ' : 'Facebook Group'}
          >
            <Facebook className="w-4 h-4 text-blue-950 fill-blue-950" />
            <span className="absolute left-full ml-2 px-2 py-0.5 bg-[#051a38]/95 text-yellow-300 border border-yellow-400/40 rounded text-[10px] font-bold whitespace-nowrap shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:inline-block">
              {language === 'bn' ? 'ফেসবুক' : 'Facebook'}
            </span>
          </a>

          {/* Telegram (Cyan Blue circle) */}
          <a
            href="https://t.me/bengalbet_official"
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:brightness-110 text-white flex items-center justify-center shadow-[0_3px_10px_rgba(14,165,233,0.5)] border-2 border-cyan-200 hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
            title={language === 'bn' ? 'অফিসিয়াল টেলিগ্রাম' : 'Official Telegram'}
          >
            <Send className="w-4 h-4 text-white fill-white transform -translate-x-0.5 translate-y-0.5" />
            <span className="absolute left-full ml-2 px-2 py-0.5 bg-[#041e2e]/95 text-sky-300 border border-sky-400/40 rounded text-[10px] font-bold whitespace-nowrap shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:inline-block">
              {language === 'bn' ? 'টেলিগ্রাম' : 'Telegram'}
            </span>
          </a>

          {/* Live Chat (Blue circle) */}
          <button
            onClick={onOpenSupport}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] hover:brightness-110 text-white flex items-center justify-center shadow-[0_3px_10px_rgba(37,99,235,0.5)] border-2 border-blue-200 hover:scale-110 active:scale-95 transition-all cursor-pointer group relative"
            title={language === 'bn' ? '২৪/৭ লাইভ চ্যাট' : '24/7 Live Chat'}
          >
            <Headphones className="w-4 h-4 text-yellow-300" />
            <span className="absolute left-full ml-2 px-2 py-0.5 bg-[#073c2a]/95 text-emerald-300 border border-emerald-400/40 rounded text-[10px] font-bold whitespace-nowrap shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:inline-block">
              {language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIGHT-SIDE FLOATING CONTROLS (Clears Mobile Bottom Navigation Bar) */}
      {/* ========================================================================= */}
      <aside 
        id="bengalbet-floating-controls"
        aria-label="Quick Actions"
        className="fixed right-2 sm:right-3.5 bottom-20 md:bottom-5 z-40 flex flex-col items-center gap-2 pointer-events-none select-none"
      >
      {/* ========================================================================= */}
      {/* 1. EXTENDABLE 3D ACTIVITIES & BADGES DOCK */}
      {/* ========================================================================= */}
      {!isOfferWidgetHidden && (
        <div className="pointer-events-auto flex flex-col items-center">
          
          {/* State A: EXPANDED VERTICAL DOCK PILL TRAY */}
          {isDockExpanded ? (
            <div 
              id="floating-extended-dock"
              className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 select-none"
            >
              {/* Top Collapse Button with Down Arrow when expanded */}
              <button
                onClick={() => setIsDockExpanded(false)}
                className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-white hover:bg-yellow-300 text-black flex items-center justify-center shadow-lg border border-gray-300 mb-1 hover:scale-110 transition-all cursor-pointer z-10"
                title={language === 'bn' ? 'সংকোচন করুন' : 'Collapse dock'}
              >
                <ChevronDown className="w-3 h-3 stroke-[3] text-gray-900" />
              </button>

              {/* Dark Green Capsule Container */}
              <div className="w-13 sm:w-14 bg-[#052317]/95 border-2 border-[#12583d] rounded-[24px] shadow-[0_8px_25px_rgba(0,0,0,0.8)] backdrop-blur-md py-2.5 px-1 flex flex-col items-center gap-3 relative max-h-[70vh] overflow-y-auto scrollbar-none">
                
                {/* Close button to hide entire offer widget */}
                <button
                  onClick={() => setIsOfferWidgetHidden(true)}
                  className="absolute top-1.5 right-1 w-3.5 h-3.5 rounded-full bg-black/60 hover:bg-rose-600 text-gray-300 hover:text-white flex items-center justify-center text-[8px] cursor-pointer transition-colors"
                  title={language === 'bn' ? 'অফার বন্ধ করুন' : 'Close offer'}
                >
                  <X className="w-2 h-2" />
                </button>

                {/* Stacked 3D Icons List */}
                {dockItems.map((item) => (
                  <div key={item.id} className="relative group/dockitem flex items-center">
                    <button
                      onClick={() => {
                        item.action();
                      }}
                      className="cursor-pointer transition-transform duration-150 focus:outline-none"
                      title={language === 'bn' ? item.nameBn : item.nameEn}
                    >
                      {item.renderIcon()}
                    </button>

                    {/* Left Side Tooltip Label */}
                    <span className="absolute right-full mr-2 px-2 py-1 bg-[#041d13]/95 text-yellow-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/dockitem:opacity-100 transition-opacity pointer-events-none z-50">
                      {language === 'bn' ? item.nameBn : item.nameEn}
                    </span>
                  </div>
                ))}

                {/* Bottom Collapse Arrow button */}
                <button
                  onClick={() => setIsDockExpanded(false)}
                  className="w-4.5 h-4.5 rounded-full bg-white/90 hover:bg-yellow-300 text-black flex items-center justify-center shadow mt-1 hover:scale-110 transition-transform cursor-pointer"
                  title="Collapse"
                >
                  <ChevronDown className="w-2.5 h-2.5 stroke-[3] text-gray-900" />
                </button>
              </div>
            </div>
          ) : (
            /* State B: COLLAPSED MODE - Reduced Orange Arrow + 1-by-1 Changing Circle with Close Icon */
            <div className="flex flex-col items-center gap-1.5 animate-in fade-in duration-200 relative">
              
              {/* Button 1: Reduced Size Orange Arrow Button */}
              <button
                onClick={() => setIsDockExpanded(true)}
                className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-b from-[#ff6b00] to-[#e64a00] hover:from-[#ff7a1a] hover:to-[#f05a10] text-white flex items-center justify-center shadow-[0_2px_6px_rgba(230,74,0,0.5)] border border-[#ffaa66] transition-transform hover:scale-110 cursor-pointer"
                title={language === 'bn' ? 'মেনু প্রসারিত করুন' : 'Expand full menu'}
              >
                <ChevronUp className="w-3 h-3 stroke-[3] text-white" />
              </button>

              {/* 1-by-1 Changing Circle Container with Close Button */}
              <div className="relative group/circle flex items-center justify-center">
                {/* Close Icon - Clicking hides both offer circle & arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOfferWidgetHidden(true);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/85 hover:bg-rose-600 text-gray-200 hover:text-white flex items-center justify-center border border-white/50 shadow-md cursor-pointer transition-all z-30 hover:scale-110"
                  title={language === 'bn' ? 'অফার বন্ধ করুন' : 'Close offer'}
                  aria-label="Close offer"
                >
                  <X className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>

                {/* Dark Green Capsule Base */}
                <div 
                  onClick={() => {
                    currentItem.action();
                  }}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#052317] border-2 border-yellow-400/80 hover:border-yellow-300 shadow-[0_4px_16px_rgba(0,0,0,0.7)] flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                >
                  {/* Currently Active Item Icon with Transition */}
                  <div 
                    key={activeItemIndex}
                    className="animate-in fade-in zoom-in-90 duration-300 flex items-center justify-center"
                  >
                    {currentItem.renderIcon()}
                  </div>
                </div>

                {/* Tooltip on hover */}
                <span className="absolute right-full mr-2.5 px-2 py-1 bg-[#041d13]/95 text-yellow-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/circle:opacity-100 transition-opacity pointer-events-none z-50">
                  {language === 'bn' ? currentItem.nameBn : currentItem.nameEn}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUPPORT & SOCIAL FLOATING HUB */}
      {/* ========================================================================= */}
      <div 
        id="floating-customer-support"
        className="hidden md:flex relative pointer-events-auto flex-col items-center mt-1"
        onMouseEnter={handleSupportMouseEnter}
        onMouseLeave={handleSupportMouseLeave}
      >
        {/* Support tray */}
        {isSupportMenuOpen && (
          <div 
            id="floating-support-expanded-menu"
            className="absolute bottom-full mb-2.5 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-200 z-50 pointer-events-auto"
          >
            {/* Circle 1: Live Chat */}
            <div className="relative group/chat flex items-center">
              <button
                onClick={() => {
                  setIsSupportMenuOpen(false);
                  onOpenSupport();
                }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#053c29] to-[#0fa871] hover:from-[#095a3e] hover:to-[#12c485] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(16,185,129,0.5)] border-2 border-emerald-300 hover:scale-115 transition-all cursor-pointer"
                title={language === 'bn' ? '২৪/৭ লাইভ চ্যাট' : '24/7 Live Chat'}
              >
                <MessageCircle className="w-4 h-4 text-yellow-300 fill-emerald-950/40 animate-pulse" />
              </button>
              <span className="absolute right-full mr-2 px-2 py-1 bg-[#052b1d]/95 text-[#86efac] border border-emerald-500/40 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/chat:opacity-100 transition-opacity pointer-events-none">
                {language === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
              </span>
            </div>

            {/* Circle 2: Telegram */}
            <div className="relative group/tele flex items-center">
              <a
                href="https://t.me/bengalbet_official"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#1d77a6] to-[#29b6f6] hover:from-[#19648c] hover:to-[#4fc3f7] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(41,182,246,0.5)] border-2 border-sky-300 hover:scale-115 transition-all cursor-pointer"
                title="Telegram Channel"
              >
                <Send className="w-4 h-4 text-white fill-white transform -translate-x-0.5 translate-y-0.5" />
              </a>
              <span className="absolute right-full mr-2 px-2 py-1 bg-[#041e2e]/95 text-sky-300 border border-sky-500/40 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/tele:opacity-100 transition-opacity pointer-events-none">
                {language === 'bn' ? 'টেলিগ্রাম' : 'Telegram'}
              </span>
            </div>

            {/* Circle 3: Facebook */}
            <div className="relative group/fb flex items-center">
              <a
                href="https://facebook.com/bengalbetofficial"
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsSupportMenuOpen(false)}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-[#1554a8] to-[#1877f2] hover:from-[#114285] hover:to-[#3b82f6] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(24,119,242,0.5)] border-2 border-blue-300 hover:scale-115 transition-all cursor-pointer"
                title="Facebook Group"
              >
                <Facebook className="w-4 h-4 text-white fill-white" />
              </a>
              <span className="absolute right-full mr-2 px-2 py-1 bg-[#051a38]/95 text-blue-300 border border-blue-500/40 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-xl opacity-0 group-hover/fb:opacity-100 transition-opacity pointer-events-none">
                {language === 'bn' ? 'ফেসবুক' : 'Facebook'}
              </span>
            </div>
          </div>
        )}

        {/* Support Base Trigger */}
        <button
          onClick={() => {
            setIsSupportMenuOpen(prev => !prev);
          }}
          className={`hidden md:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full text-yellow-400 items-center justify-center shadow-xl transition-all duration-200 cursor-pointer ${
            isSupportMenuOpen 
              ? 'bg-[#0f6e4e] scale-110 border-2 border-yellow-400 shadow-[0_0_12px_rgba(255,210,0,0.6)]' 
              : 'bg-[#0b6748] hover:bg-[#0e7b57] border-2 border-emerald-400/80 hover:scale-110'
          }`}
          title={language === 'bn' ? 'কাস্টমার সাপোর্ট' : 'Support'}
        >
          <Headphones className="w-4 h-4 text-yellow-300" />
        </button>
      </div>
    </aside>
  </>
  );
};
