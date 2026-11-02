// @ts-nocheck
/**
 * BengalBet Casino Lobby
 * Features:
 * - Multi-slide automated banner carousel with high-resolution graphics
 * - Category navigation pills with emojis & smooth scroll/filter actions
 * - Jackpot Winners live rolling marquee ticker
 * - Categorized game rows (Hot Games, Slots, Live Casino, Fishing, Poker, Sports, Cockfight, Lottery)
 * - Game Providers Showcase & Official App Download section
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  Play, 
  Trophy, 
  Gamepad2, 
  Radio, 
  Dice5, 
  Fish, 
  TrendingUp, 
  Heart, 
  Volume2,
  ChevronLeft,
  ChevronRight,
  Gift,
  Zap,
  Users,
  Layers,
  ArrowRight,
  Crosshair,
  Swords
} from 'lucide-react';
import { GameItem, GameCategory, Language, UserAccount } from '../types';
import { GAMES_DATA, AVIATOR_GAME } from '../data/games';
import { getProviderInfo } from '../data/providers';
import { JackpotWinnersSection } from './JackpotWinnersSection';
import { GameProvidersSection } from './GameProvidersSection';
import { AppDownloadSection } from './AppDownloadSection';
import { useFavorites } from '../hooks/useFavorites';
import firstDepositBanner from '../assets/images/bengal_deposit_banner_1790008299014.jpg';
import vipExclusiveBanner from '../assets/images/bengal_vip_banner_1790008315416.jpg';
import inviteFriendsBanner from '../assets/images/bengal_invite_banner_1790008327090.jpg';

interface CasinoLobbyProps {
  language: Language;
  user: UserAccount;
  favorites?: string[];
  onToggleFavorite?: (gameId: string, e?: React.MouseEvent) => void;
  onLaunchGame: (game: GameItem) => void;
  onSelectCategory?: (category: GameCategory) => void;
  onOpenPromotions: () => void;
  onOpenSpin: () => void;
  onOpenDeposit: () => void;
  onOpenShare: () => void;
  onOpenVip: () => void;
  onOpenNotice?: () => void;
  onOpenAppDownload?: () => void;
  onOpenDailySignIn?: () => void;
}

interface CategoryConfig {
  id: GameCategory;
  labelBn: string;
  labelEn: string;
  icon: string;
  color: string;
}

const CATEGORY_TABS: CategoryConfig[] = [
  { id: 'hot', labelBn: 'গরম খেলা', labelEn: 'Hot Games', icon: '🔥', color: '#ef4444' },
  { id: 'crash', labelBn: 'এভিয়েটর', labelEn: 'Aviator', icon: '✈️', color: '#e11d48' },
  { id: 'slot', labelBn: 'স্লট', labelEn: 'Slot', icon: '🎰', color: '#eab308' },
  { id: 'fishing', labelBn: 'ফিশিং', labelEn: 'Fishing', icon: '🐟', color: '#06b6d4' },
  { id: 'live', labelBn: 'লাইভ', labelEn: 'Live', icon: '🃏', color: '#ec4899' },
  { id: 'poker', labelBn: 'পোকার', labelEn: 'Poker', icon: '♠️', color: '#8b5cf6' },
  { id: 'cockfight', labelBn: 'লাল মোরগ', labelEn: 'Cockfight', icon: '🐓', color: '#f97316' },
  { id: 'sports', labelBn: 'স্পোর্টস', labelEn: 'Sports', icon: '🏏', color: '#10b981' },
  { id: 'esports', labelBn: 'ই-স্পোর্টস', labelEn: 'E-Sports', icon: '🎮', color: '#3b82f6' },
  { id: 'lottery', labelBn: 'লটারি', labelEn: 'Lottery', icon: '🎲', color: '#14b8a6' }
];

export const CasinoLobby: React.FC<CasinoLobbyProps> = ({
  language,
  user,
  favorites: propFavorites,
  onToggleFavorite: propToggleFavorite,
  onLaunchGame,
  onSelectCategory,
  onOpenPromotions,
  onOpenSpin,
  onOpenDeposit,
  onOpenShare,
  onOpenVip,
  onOpenNotice,
  onOpenAppDownload,
  onOpenDailySignIn
}) => {
  const { favorites: hookFavorites, toggleFavorite: hookToggleFavorite } = useFavorites();
  const favorites = propFavorites || hookFavorites;
  const toggleFavorite = (gameId: string, e: React.MouseEvent) => {
    if (propToggleFavorite) {
      propToggleFavorite(gameId, e);
    } else {
      hookToggleFavorite(gameId, e);
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});

  const bannerImages = [
    {
      id: 1,
      image: firstDepositBanner,
      action: onOpenDeposit,
      alt: 'First Deposit Bonus Up to 47%',
      titleBn: 'প্রথম জমা বোনাস',
      subBn: 'সর্বোচ্চ ৪৭% পর্যন্ত',
      pillsBn: ['একটি অনন্য সুযোগ'],
      titleEn: 'First Deposit Bonus',
      subEn: 'Up to 47% Maximum',
      pillsEn: ['Exclusive Offer'],
      type: 'deposit'
    },
    {
      id: 2,
      image: vipExclusiveBanner,
      action: onOpenVip,
      alt: 'VIP Exclusive Benefits',
      titleBn: 'ভিআইপি এক্সক্লুসিভ সুবিধা',
      subBn: '',
      pillsBn: ['লেভেল আপগ্রেড', 'সাপ্তাহিক', 'মাসিক'],
      titleEn: 'VIP Exclusive Privileges',
      subEn: '',
      pillsEn: ['Level Upgrade', 'Weekly Rebate', 'Monthly Bonus'],
      type: 'vip'
    },
    {
      id: 3,
      image: inviteFriendsBanner,
      action: onOpenShare,
      alt: 'Invite Friends 3 Rewards',
      titleBn: '৩টি সুবিধা পেতে বন্ধুদের আমন্ত্রণ জানান',
      subBn: '',
      pillsBn: ['৳ ৩০০ প্রতিটি আমন্ত্রণে উপার্জন', '০.৭% প্রতিটি জমার মাধ্যমে উপার্জন', '১% প্রতিটি বাজিতে উপার্জন'],
      titleEn: 'Invite Friends to Get 3 Benefits',
      subEn: '',
      pillsEn: ['৳ 300 Per Invitation', '0.7% on Every Deposit', '1% on Every Bet'],
      type: 'share'
    }
  ];

  const [slidesToShow, setSlidesToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else {
        setSlidesToShow(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allSlides = [...bannerImages, ...bannerImages, ...bannerImages];

  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % bannerImages.length);
    }, 3500);
    return () => clearInterval(bannerTimer);
  }, [bannerImages.length]);

  const handleCategoryPillClick = (catId: GameCategory) => {
    setSelectedCategory(catId);
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      const targetElement = document.getElementById(`section-${catId}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLoadMoreForSection = (catId: string) => {
    if (onSelectCategory) {
      onSelectCategory(catId as GameCategory);
      return;
    }
    setLoadingCategory(catId);
    setTimeout(() => {
      setExpandedCategories(prev => ({
        ...prev,
        [catId]: !prev[catId]
      }));
      setLoadingCategory(null);
    }, 300);
  };

  // Group games by their respective categories
  const hotGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'hot' || g.isHot).slice(0, 14), []);
  const slotGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'slot'), []);
  const liveGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'live'), []);
  const fishingGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'fishing'), []);
  const pokerGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'poker' || g.category === 'table'), []);
  const sportsGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'sports'), []);
  const esportsGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'esports'), []);
  const cockfightGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'cockfight'), []);
  const lotteryGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'lottery'), []);
  const crashGames = useMemo(() => GAMES_DATA.filter(g => g.category === 'crash' || g.id === 'game-aviator'), []);

  // Section list matching the exact structure and visual appearance of screenshot
  const sections = [
    {
      id: 'hot',
      nameBn: 'গরম খেলা',
      nameEn: 'Hot Games',
      icon: '🔥',
      games: hotGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'crash',
      nameBn: 'এভিয়েটর ও ক্র্যাশ গেম',
      nameEn: 'Aviator & Crash',
      icon: '✈️',
      games: crashGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'slot',
      nameBn: 'স্লট',
      nameEn: 'Slot',
      icon: '🎰',
      games: slotGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'live',
      nameBn: 'লাইভ',
      nameEn: 'Live Casino',
      icon: '🃏',
      games: liveGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'fishing',
      nameBn: 'ফিশিং',
      nameEn: 'Fishing',
      icon: '🐟',
      games: fishingGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'poker',
      nameBn: 'পোকার',
      nameEn: 'Poker & Table',
      icon: '♠️',
      games: pokerGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'sports',
      nameBn: 'স্পোর্টস',
      nameEn: 'Sports',
      icon: '🏏',
      games: sportsGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'esports',
      nameBn: 'ই-স্পোর্টস',
      nameEn: 'E-Sports',
      icon: '🎮',
      games: esportsGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'cockfight',
      nameBn: 'মুরগির যুদ্ধ',
      nameEn: 'Cockfight',
      icon: '🐓',
      games: cockfightGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    },
    {
      id: 'lottery',
      nameBn: 'লটারি',
      nameEn: 'Lottery',
      icon: '🎲',
      games: lotteryGames,
      cols: 'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7'
    }
  ];

  return (
    <div id="casino-lobby-container" className="w-full max-w-[1440px] mx-auto px-1.5 sm:px-3 py-1 sm:py-2 space-y-2.5 sm:space-y-3.5">
      
      {/* 1. Top Multi-Banner Carousel - 3 Images in One View Sliding 1-by-1 */}
      <div 
        id="lobby-top-banner-carousel"
        className="relative w-full overflow-hidden group py-0.5"
      >
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-2.5"
          style={{
            transform: `translateX(calc(-${currentBannerIndex} * (100% + 10px) / ${slidesToShow}))`
          }}
        >
          {allSlides.map((b, idx) => (
            <div
              key={`${b.id}-${idx}`}
              onClick={b.action}
              style={{
                width: `calc((100% - ${(slidesToShow - 1) * 10}px) / ${slidesToShow})`
              }}
              className="shrink-0 relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border-2 border-yellow-500/60 hover:border-yellow-400 shadow-xl group/item transition-all duration-300 hover:scale-[1.01] bg-[#073625] aspect-[16/9]"
            >
              <img
                src={b.image}
                alt={b.alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-fill aspect-[16/9] transition-transform duration-300 group-hover/item:scale-[1.02]"
              />
            </div>
          ))}
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          id="banner-prev-btn"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentBannerIndex(prev => (prev === 0 ? bannerImages.length - 1 : prev - 1));
          }}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-xl z-20 border border-yellow-500/40"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 text-yellow-300" />
        </button>

        <button
          id="banner-next-btn"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentBannerIndex(prev => (prev + 1) % bannerImages.length);
          }}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-xl z-20 border border-yellow-500/40"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 text-yellow-300" />
        </button>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2 pb-0.5">
          {bannerImages.map((b, idx) => (
            <button
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentBannerIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentBannerIndex === idx 
                  ? 'w-6 bg-yellow-400 shadow-[0_0_8px_#facc15]' 
                  : 'w-2 bg-yellow-400/30 hover:bg-yellow-400/60'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Marquee Announcement Bar with Running Text Animation matching Screenshot */}
      <div 
        id="lobby-announcement-bar"
        className="flex items-center gap-2 bg-[#073c2a] hover:bg-[#0a4833] border border-[#166245] hover:border-yellow-400/60 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 text-xs overflow-hidden shadow-inner transition-colors group"
      >
        <div 
          onClick={onOpenNotice}
          className="flex items-center gap-1.5 text-cyan-300 font-bold whitespace-nowrap shrink-0 z-10 bg-[#073c2a] pr-1.5 shadow-sm cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-cyan-300 animate-pulse" />
        </div>
        
        {/* Infinite Running Marquee Text Track */}
        <div 
          onClick={onOpenNotice}
          className="overflow-hidden relative w-full flex items-center cursor-pointer"
        >
          <div className="animate-marquee-infinite flex gap-12 items-center shrink-0 text-emerald-100 text-[11px] sm:text-xs">
            <span className="whitespace-nowrap font-medium">
              {language === 'bn' 
                ? '👑 বেঙ্গলবেটে ১ জনকে আমন্ত্রণ জানালেই ৩০০ টাকা ক্যাশ বোনাস 👑' 
                : '👑 Welcome to BengalBet: Invite 1 friend & earn ৳300 instant cash reward 👑'}
            </span>
            <span className="whitespace-nowrap text-yellow-300 font-bold">
              🎉 {language === 'bn' ? 'প্রতিদিন ডিপোজিটে ক্যাশব্যাক ও ফ্রি স্পিন ড্রপ!' : 'Daily Free Spin & Cashback Drops!'}
            </span>
            <span className="whitespace-nowrap text-cyan-300 font-bold">
              ⚡ {language === 'bn' ? 'রিয়েল টাইম ৩% রিবেট স্বয়ংক্রিয়ভাবে প্রদান করা হয়' : 'Real-time 3% instant rebate cashback'}
            </span>
            <span className="whitespace-nowrap text-amber-200 font-semibold">
              🏆 {language === 'bn' ? 'বেঙ্গলবেট ভিআইপি মেম্বারশিপে এক্সক্লুসিভ রিওয়ার্ড ও সাপ্তাহিক বোনাস' : 'BengalBet VIP Membership Exclusive Rewards & Weekly Drops'}
            </span>
          </div>

          {/* Duplicate loop sequence for seamless infinite running text */}
          <div className="animate-marquee-infinite flex gap-12 items-center shrink-0 text-emerald-100 text-[11px] sm:text-xs" aria-hidden="true">
            <span className="whitespace-nowrap font-medium">
              {language === 'bn' 
                ? '👑 বেঙ্গলবেটে ১ জনকে আমন্ত্রণ জানালেই ৩০০ টাকা ক্যাশ বোনাস 👑' 
                : '👑 Welcome to BengalBet: Invite 1 friend & earn ৳300 instant cash reward 👑'}
            </span>
            <span className="whitespace-nowrap text-yellow-300 font-bold">
              🎉 {language === 'bn' ? 'প্রতিদিন ডিপোজিটে ক্যাশব্যাক ও ফ্রি স্পিন ড্রপ!' : 'Daily Free Spin & Cashback Drops!'}
            </span>
            <span className="whitespace-nowrap text-cyan-300 font-bold">
              ⚡ {language === 'bn' ? 'রিয়েল টাইম ৩% রিবেট স্বয়ংক্রিয়ভাবে প্রদান করা হয়' : 'Real-time 3% instant rebate cashback'}
            </span>
            <span className="whitespace-nowrap text-amber-200 font-semibold">
              🏆 {language === 'bn' ? 'বেঙ্গলবেট ভিআইপি মেম্বারশিপে এক্সক্লুসিভ রিওয়ার্ড ও সাপ্তাহিক বোনাস' : 'BengalBet VIP Membership Exclusive Rewards & Weekly Drops'}
            </span>
          </div>
        </div>

        {/* Right APP Download Floating Badge Button (as shown in Capture.PNG & Capture2.PNG) */}
        {onOpenAppDownload && (
          <button
            id="marquee-app-download-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAppDownload();
            }}
            className="shrink-0 relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#fff37a] via-[#fbbf24] to-[#d97706] hover:from-[#fff799] hover:to-[#f59e0b] text-black border-2 border-yellow-200 shadow-[0_0_14px_rgba(250,204,21,0.75),0_3px_8px_rgba(0,0,0,0.6)] transition-all active:scale-95 cursor-pointer z-10 animate-sweetfun-btn group"
            title={language === 'bn' ? 'অ্যাপ ডাউনলোড করুন' : 'Download App'}
          >
            {/* SweetFun light beam shimmer sheen */}
            <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent animate-sweetfun-shimmer" />
            </span>

            {/* Sparkle ping dot */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_6px_#facc15] animate-ping pointer-events-none" />

            <div className="relative flex flex-col items-center justify-center leading-none pointer-events-none">
              <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-tighter text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] font-game">APP</span>
              <span className="text-[10px] sm:text-[11px] font-black -mt-0.5 leading-none text-black animate-sweetfun-arrow">↓</span>
            </div>
          </button>
        )}
      </div>

      {/* 2.5 Horizontal Category Bar on Mobile (matching Capture.PNG) */}
      <div 
        id="lobby-category-scroll-bar"
        className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 select-none"
      >
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryPillClick(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black border-yellow-300 font-black shadow-md scale-102'
                : 'bg-[#083c2a] hover:bg-[#0c4e37] text-emerald-100 border-[#145d40] hover:border-emerald-400/50'
            }`}
          >
            <span className="text-sm">{cat.icon}</span>
            <span className="whitespace-nowrap font-bengali">
              {language === 'bn' ? cat.labelBn : cat.labelEn}
            </span>
          </button>
        ))}
      </div>

      {/* 2.8 Aviator Special Featured Spotlight Card */}
      <div 
        id="lobby-aviator-spotlight-card"
        onClick={() => onLaunchGame(AVIATOR_GAME)}
        className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a050f] via-[#2d0918] to-[#140611] border-2 border-red-500/60 hover:border-red-400 p-3 sm:p-4 shadow-xl hover:shadow-red-900/40 cursor-pointer group transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-red-600/20 rounded-full blur-2xl pointer-events-none group-hover:bg-red-500/30 transition-all" />
        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-black/60 border border-red-500/50 shrink-0 shadow-md">
              <img 
                src="https://images.33089393.com/TCG_GAME_ICONS/SPB/EN/SPB002.avif"
                alt="Aviator Spribe"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute top-1 left-1 bg-red-600 text-white text-[7px] sm:text-[8px] font-black px-1 rounded uppercase tracking-wider">
                LIVE
              </span>
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                  <span className="text-red-500">✈️</span>
                  <span>Aviator</span>
                  <span className="text-[10px] sm:text-xs bg-red-950/80 text-red-400 border border-red-700/50 px-2 py-0.5 rounded-full font-mono font-bold">
                    Spribe
                  </span>
                </h4>
                <span className="hidden sm:inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                  ⭐ 97.0% RTP
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-300 font-medium">
                {language === 'bn' 
                  ? 'প্লেন ক্র্যাশ হওয়ার আগেই ক্যাশআউট করুন! ১০০ গুণ পর্যন্ত প্রফিট।' 
                  : 'Cash out before the plane flies away! Multiply your bet up to 100x+.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="aviator-spotlight-play-btn"
              className="px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-red-600/40 border border-red-400/80 flex items-center gap-1.5 sm:gap-2 group-hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              <span>{language === 'bn' ? 'খেলুন' : 'PLAY NOW'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. First Section: 🔥 গরম খেলা (Hot Games) */}
      <section id="section-hot" className="space-y-2.5">
        <div className="flex items-center justify-between pt-1 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-bengali">
              {language === 'bn' ? 'গরম খেলা' : 'Hot Games'}
            </h3>
          </div>

          <button
            onClick={() => handleLoadMoreForSection('hot')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#073c2a] hover:bg-[#0b4d36] text-white border border-[#1a704e] shadow hover:scale-102 active:scale-98"
          >
            {loadingCategory === 'hot' ? (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <span>{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
              </span>
            ) : (
              <>
                <span>{language === 'bn' ? 'সব' : 'All'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
              </>
            )}
          </button>
        </div>

        {/* 3 Columns on Mobile, 7 Columns on Desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5">
          {hotGames.map((game) => {
            const isFav = favorites.includes(game.id);
            const providerInfo = getProviderInfo(game.provider);
            return (
              <div
                key={game.id}
                id={`game-card-${game.id}`}
                onClick={() => onLaunchGame(game)}
                className="group relative bg-[#073625] rounded-xl overflow-hidden border border-[#166245] hover:border-yellow-400 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#041a12]">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback gracefully to default card visual if network fails
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85';
                    }}
                  />
                  
                  {/* Real Provider Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs border border-white/20 text-[9px] font-black shadow-md flex items-center gap-1 text-white">
                    <img 
                      src={providerInfo.logo} 
                      alt={providerInfo.name} 
                      className="w-3 h-3 object-contain shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span style={{ color: providerInfo.color || '#ffd200' }} className="truncate max-w-[55px] font-bold">
                      {providerInfo.name}
                    </span>
                  </div>

                  {/* Hot/New Tag if available */}
                  {game.isHot && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[8px] font-black tracking-wider uppercase shadow flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                      <span>HOT</span>
                    </div>
                  )}

                  {/* Favorite Toggle Heart */}
                  <button
                    onClick={(e) => toggleFavorite(game.id, e)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10"
                    aria-label="Add to favorites"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="py-2 px-1.5 bg-[#093c28] text-center">
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors truncate">
                    {language === 'bn' && game.nameBn ? game.nameBn : game.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Quick Category Navigation Pills Bar exact to Screenshot */}
      <div 
        id="lobby-category-pills-bar"
        className="w-full bg-[#052b1d] border border-[#145d40] rounded-2xl p-2 sm:p-2.5 flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar shadow-lg my-2"
      >
        {CATEGORY_TABS.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryPillClick(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-black scale-105' 
                  : 'bg-[#083c2a] hover:bg-[#0c4e37] text-emerald-100 hover:text-white border border-[#145d40]'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{language === 'bn' ? cat.labelBn : cat.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 5. All Categorized Sections Stacked exact to Screenshot */}
      {sections.slice(1).map((sec) => (
        <section 
          key={sec.id} 
          id={`section-${sec.id}`} 
          className="space-y-2.5 pt-2"
        >
          {/* Section Header with Bengali Title and Load More Button */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">{sec.icon}</span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide font-bengali">
                {language === 'bn' ? sec.nameBn : sec.nameEn}
              </h3>
            </div>

            <button
              onClick={() => handleLoadMoreForSection(sec.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-[#073c2a] hover:bg-[#0b4d36] text-white border border-[#1a704e] shadow hover:scale-102 active:scale-98"
            >
              {loadingCategory === sec.id ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}</span>
                </span>
              ) : (
                <>
                  <span>{language === 'bn' ? 'সব' : 'All'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />
                </>
              )}
            </button>
          </div>

          {/* 7 Columns Game Matrix for this Category */}
          <div className={`grid ${sec.cols} gap-2 sm:gap-2.5`}>
            {sec.games.map((game) => {
              const isFav = favorites.includes(game.id);
              const providerInfo = getProviderInfo(game.provider);
              return (
                <div
                  key={game.id}
                  id={`game-card-${game.id}`}
                  onClick={() => onLaunchGame(game)}
                  className="group relative bg-[#073625] rounded-xl overflow-hidden border border-[#166245] hover:border-yellow-400 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col"
                >
                  {/* Game Thumbnail */}
                  <div className="relative aspect-square w-full overflow-hidden bg-[#041a12]">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85';
                      }}
                    />
                    
                    {/* Real Provider Badge Pill */}
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs border border-white/20 text-[9px] font-black shadow-md flex items-center gap-1 text-white">
                      <img 
                        src={providerInfo.logo} 
                        alt={providerInfo.name} 
                        className="w-3 h-3 object-contain shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span style={{ color: providerInfo.color || '#ffd200' }} className="truncate max-w-[55px] font-bold">
                        {providerInfo.name}
                      </span>
                    </div>

                    {/* Hot/New Tag if available */}
                    {game.isHot && (
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[8px] font-black tracking-wider uppercase shadow flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                        <span>HOT</span>
                      </div>
                    )}

                    {/* Favorite Toggle */}
                    <button
                      onClick={(e) => toggleFavorite(game.id, e)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10"
                      aria-label="Add to favorites"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>

                    {/* Play Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="py-2 px-1.5 bg-[#093c28] text-center">
                    <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors truncate">
                      {language === 'bn' && game.nameBn ? game.nameBn : game.name}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* 6. Progressive Jackpot & Live Winners Feed matching Capture.PNG */}
      <JackpotWinnersSection
        language={language}
        onLaunchGame={onLaunchGame}
      />

      {/* 7. Game Providers Showcase with all 70+ Official Vendor Logos */}
      <GameProvidersSection
        language={language}
        onSelectProvider={(p) => {
          // If the user clicks on a provider, scroll to relevant category
          if (p.category.toLowerCase().includes('slot')) {
            handleCategoryPillClick('slot');
          } else if (p.category.toLowerCase().includes('live')) {
            handleCategoryPillClick('live');
          } else if (p.category.toLowerCase().includes('fish')) {
            handleCategoryPillClick('fishing');
          } else if (p.category.toLowerCase().includes('sport')) {
            handleCategoryPillClick('sports');
          }
        }}
      />

      {/* 8. Mobile App Download Promo Section with QR Codes & Phone Mockup matching Screenshot */}
      <AppDownloadSection
        language={language}
        onOpenAppModal={onOpenAppDownload}
      />

    </div>
  );
};
