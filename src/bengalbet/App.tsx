// @ts-nocheck
/**
 * BengalBet Casino & Gaming Portal
 * 
 * Core Application Hub:
 * - Dynamic View Switching (Lobby, Promotions, Category Games, Favorites)
 * - Centralized Authentication, Balance, and VIP tier persistence in localStorage
 * - Interactive Modals (Lucky Wheel Spin, Golden Egg Smash, Red Envelope Rain, Super Value Rewards, Missions & User Center)
 * - Mobile-first responsive header, desktop scrollable sidebar, and mobile bottom navigation
 * - Full bilingual support (Bengali / English) with dynamic instant toggling
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect } from 'react';
import { Language, UserAccount, Promotion, GameItem, SpinPrize, GameCategory } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromotionsView } from './components/PromotionsView';
import { PromotionModal } from './components/PromotionModal';
import { CasinoLobby } from './components/CasinoLobby';
import { CategoryGamesView, CATEGORY_META } from './components/CategoryGamesView';
import { LuckySpinModal } from './components/LuckySpinModal';
import { RedEnvelopeModal } from './components/RedEnvelopeModal';
import { GoldenEggModal } from './components/GoldenEggModal';
import { MissionsModal } from './components/MissionsModal';
import { VipModal } from './components/VipModal';
import { ShareModal } from './components/ShareModal';
import { AuthModals } from './components/AuthModals';
import { GamePlayerModal } from './components/GamePlayerModal';
import { LiveChatWidget } from './components/LiveChatWidget';
import { Footer } from './components/Footer';
import { FloatingWidgets } from './components/FloatingWidgets';
import { SearchModal } from './components/SearchModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { MyAccountModal } from './components/MyAccountModal';
import { api } from './services/api';
import { normalizeServerUser } from './services/userMapping';
import { BrandLoadingOverlay } from './components/BrandLoadingOverlay';
import { NoticeAnnouncementModal } from './components/NoticeAnnouncementModal';
import { SuperValueRewardModal } from './components/SuperValueRewardModal';
import { FavoritesView } from './components/FavoritesView';
import { MobileTopDownloadBar } from './components/MobileTopDownloadBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { NeextHubAdminView } from './components/NeextHubAdminView';
import { GlobalDatabaseErrorBanner } from './components/GlobalDatabaseErrorBanner';
import { useFavorites } from './hooks/useFavorites';
import { isGoldenEggInRenew } from './utils/goldenEggRenew';
import { auth, onAuthStateChanged, formatUserData, signOutFirebase } from './services/firebase';
import { GAMES_DATA, AVIATOR_GAME, SUPER_ACE_GAME, FORTUNE_TREE_GAME, ALIBABA_CAVE_GAME, CRAZY_777_GAME, SEVEN_COINS_GAME, ANUBIS_GAME, PINATA_WINS_GAME, MONEY_COMING_GAME, MAGIC_ACE_GAME, SWEET_BONANZA_GAME, TREASURES_OF_AZTEC_GAME, GATES_OF_OLYMPUS_GAME, CIRCUS_JOKER_GAME } from './data/games';

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [activeView, setActiveView] = useState<'lobby' | 'promotions' | 'category' | 'favorites' | 'admin'>('lobby');
  const [activeCategory, setActiveCategory] = useState<GameCategory>('slot');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bengalbet_sidebar_collapsed') || localStorage.getItem('bengalbet_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarCollapsed(prev => {
        const next = !prev;
        try {
          localStorage.setItem('bengalbet_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    } else {
      setSidebarOpen(prev => !prev);
    }
  };

  const { favorites, toggleFavorite } = useFavorites();

  // Brand Loading States
  const [isBrandLoading, setIsBrandLoading] = useState(false);
  const [brandLoadingMessage, setBrandLoadingMessage] = useState<string | undefined>(undefined);

  // Official Notice Announcement Modal State (Auto-pops up on initial visit unless dismissed today)
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [shouldOpenEggAfterNotice, setShouldOpenEggAfterNotice] = useState(false);

  // URL Path Synchronization & Initial Load Handling
  useEffect(() => {
    const parseUrlAndSetView = () => {
      const rawPath = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      if (rawPath === '/aviator' || rawPath === '/crash') {
        setActiveGame(AVIATOR_GAME);
      } else if (rawPath === '/superace' || rawPath === '/super-ace') {
        setActiveGame(SUPER_ACE_GAME);
      } else if (rawPath === '/fortune-tree' || rawPath === '/fortunetree') {
        setActiveGame(FORTUNE_TREE_GAME);
      } else if (rawPath === '/alibaba' || rawPath === '/alibaba-cave') {
        setActiveGame(ALIBABA_CAVE_GAME);
      } else if (rawPath === '/crazy-777' || rawPath === '/crazy777') {
        setActiveGame(CRAZY_777_GAME);
      } else if (rawPath === '/777-coins' || rawPath === '/777coins' || rawPath === '/sevencoins') {
        setActiveGame(SEVEN_COINS_GAME);
      } else if (rawPath === '/anubis' || rawPath === '/anubis-wrath' || rawPath === '/anubiswrath') {
        setActiveGame(ANUBIS_GAME);
      } else if (rawPath === '/pinata' || rawPath === '/pinata-wins' || rawPath === '/pinatawins') {
        setActiveGame(PINATA_WINS_GAME);
      } else if (rawPath === '/money-coming' || rawPath === '/moneycoming') {
        setActiveGame(MONEY_COMING_GAME);
      } else if (rawPath === '/magic-ace' || rawPath === '/magicace') {
        setActiveGame(MAGIC_ACE_GAME);
      } else if (rawPath === '/sweet-bonanza' || rawPath === '/sweetbonanza' || rawPath === '/sweet') {
        setActiveGame(SWEET_BONANZA_GAME);
      } else if (rawPath === '/aztec' || rawPath === '/treasures-aztec' || rawPath === '/treasuresofaztec') {
        setActiveGame(TREASURES_OF_AZTEC_GAME);
      } else if (rawPath === '/olympus' || rawPath === '/gates-of-olympus' || rawPath === '/gatesofolympus') {
        setActiveGame(GATES_OF_OLYMPUS_GAME);
      } else if (rawPath === '/circus' || rawPath === '/circus-joker' || rawPath === '/circusjoker') {
        setActiveGame(CIRCUS_JOKER_GAME);
      } else if (rawPath === '/promotions') {
        setActiveView('promotions');
      } else if (rawPath === '/rng' || rawPath === '/slot') {
        setActiveCategory('slot');
        setActiveView('category');
      } else if (rawPath === '/live') {
        setActiveCategory('live');
        setActiveView('category');
      } else if (rawPath === '/fishing') {
        setActiveCategory('fishing');
        setActiveView('category');
      } else if (rawPath === '/poker' || rawPath === '/table') {
        setActiveCategory('poker');
        setActiveView('category');
      } else if (rawPath === '/sports') {
        setActiveCategory('sports');
        setActiveView('category');
      } else if (rawPath === '/esports') {
        setActiveCategory('esports');
        setActiveView('category');
      } else if (rawPath === '/cockfight') {
        setMissionsInitialMenu('reward_center');
        setRewardCenterInitialTab('coupons');
        setIsMissionsOpen(true);
      } else if (rawPath === '/neexthubadmin' || rawPath === '/admin' || rawPath === '/neext-hub-admin') {
        setActiveView('admin');
        setIsNoticeOpen(false);
      } else if (rawPath === '/favorites' || rawPath === '/my-collection') {
        setActiveView('favorites');
      } else if (rawPath === '/lottery') {
        setActiveCategory('lottery');
        setActiveView('category');
      } else if (rawPath === '/hot') {
        setActiveCategory('hot');
        setActiveView('category');
      } else {
        setActiveView('lobby');
      }
    };

    // Parse URL on first load
    parseUrlAndSetView();

    // Listen for browser navigation (back/forward)
    window.addEventListener('popstate', parseUrlAndSetView);

    // Initial Entrance Animation & Auto-Open Notice Popup
    setIsBrandLoading(true);
    setBrandLoadingMessage(language === 'bn' ? 'বেঙ্গলবেট ক্যাসিনো লোড হচ্ছে...' : 'Welcome to BengalBet Mega Casino...');
    
    const timer = setTimeout(() => {
      setIsBrandLoading(false);

      // Check whether user is authenticated in stored session
      let isAuthUser = false;
      try {
        const cached = localStorage.getItem('bengalbet_user_session') || localStorage.getItem('bengalbet_user_session');
        if (cached) {
          const parsed = JSON.parse(cached);
          isAuthUser = Boolean(parsed?.isLoggedIn);
        }
      } catch {}

      // Notice Announcement Modal shows for BOTH authenticated & non-authenticated users
      const hideDate = localStorage.getItem('bengalbet_hide_notice_today') || localStorage.getItem('bengalbet_hide_notice_today');
      const today = new Date().toDateString();
      if (hideDate !== today) {
        setIsNoticeOpen(true);
        // Only queue Golden Egg & Super Value sequence if user is already authenticated
        if (isAuthUser) {
          const isEggRenewing = isGoldenEggInRenew();
          if (!isEggRenewing) {
            setShouldOpenEggAfterNotice(true);
            setShouldOpenSuperValueAfterEgg(true);
          } else {
            // Golden egg is in renew cooldown, skip egg and queue super value reward directly
            setShouldOpenEggAfterNotice(false);
            setShouldOpenSuperValueAfterEgg(true);
          }
        } else {
          setShouldOpenEggAfterNotice(false);
          setShouldOpenSuperValueAfterEgg(false);
        }
      } else {
        // If notice was dismissed today, trigger Golden Egg only for authenticated users if not in renew cooldown
        if (isAuthUser) {
          const isEggRenewing = isGoldenEggInRenew();
          if (!isEggRenewing) {
            setIsGoldenEggOpen(true);
            setShouldOpenSuperValueAfterEgg(true);
          } else {
            // Golden egg in renew cooldown: open super value reward directly
            setIsSuperValueRewardOpen(true);
          }
        }
      }
    }, 700);

    return () => {
      window.removeEventListener('popstate', parseUrlAndSetView);
      clearTimeout(timer);
    };
  }, []);

  // User State Initialization from localStorage cache
  const DEFAULT_USER: UserAccount = {
    id: 'usr-889922',
    username: 'BDT_King88',
    phone: '01615249856',
    balance: 5420.50,
    vipLevel: 2,
    vipExp: 8450,
    vipMaxExp: 15000,
    freeSpins: 3,
    redPacketsAvailable: 2,
    goldenEggsAvailable: 2,
    unreadNotifications: 3,
    referralCode: 'BDT888',
    isLoggedIn: false,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    referredFriendsCount: 6,
    totalEarnings: 3250
  };

  const [user, setUser] = useState<UserAccount>(() => {
    try {
      const cached = localStorage.getItem('bengalbet_user_session') || localStorage.getItem('bengalbet_user_session');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return { ...DEFAULT_USER, ...parsed };
        }
      }
    } catch (e) {
      console.error('Error loading user from localStorage cache', e);
    }
    return DEFAULT_USER;
  });

  // Signed-in members always read their wallet and reward counts from the server on open
  useEffect(() => {
    if (!user.isLoggedIn) return;
    api.auth.getMe()
      .then((res) => { if (res?.success && res.user) setUser(prev => ({ ...prev, ...normalizeServerUser(res.user), isLoggedIn: true })); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Automatically sync user session changes to localStorage cache
  useEffect(() => {
    try {
      if (user.isLoggedIn) {
        localStorage.setItem('bengalbet_user_session', JSON.stringify(user));
        localStorage.setItem('bengalbet_user_session', JSON.stringify(user));
      } else {
        localStorage.removeItem('bengalbet_user_session');
        localStorage.removeItem('bengalbet_auth_token');
      }
    } catch (e) {
      console.error('Error saving user to localStorage cache', e);
    }
  }, [user]);

  // Sync authenticated user balance and status from REST API
  useEffect(() => {
    if (user.isLoggedIn) {
      api.wallet.getBalance().then(res => {
        if (res.success) {
          setUser(prev => ({
            ...prev,
            balance: res.balance,
            vipLevel: res.vipLevel,
            vipExp: res.vipExp
          }));
        }
      }).catch(console.warn);
    }
  }, [user.isLoggedIn]);

  // Listen to Google Auth state for profile synchronization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const formatted = formatUserData(fbUser);
          setUser(prev => ({
            ...prev,
            ...formatted,
            isLoggedIn: true
          }));
        } catch (e) {
          console.warn('Auth state restore error:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Modal States
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [activeGame, setActiveGame] = useState<GameItem | null>(null);
  const [pendingGame, setPendingGame] = useState<GameItem | null>(null);
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isRedPacketOpen, setIsRedPacketOpen] = useState(false);
  const [isGoldenEggOpen, setIsGoldenEggOpen] = useState(false);
  const [isSuperValueRewardOpen, setIsSuperValueRewardOpen] = useState(false);
  const [shouldOpenSuperValueAfterEgg, setShouldOpenSuperValueAfterEgg] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [missionsInitialMenu, setMissionsInitialMenu] = useState<'mission' | 'messages' | 'invite' | 'withdraw' | 'reward_center' | 'profit_loss' | 'account_record' | 'bet_record' | string>('mission');
  const [rewardCenterInitialTab, setRewardCenterInitialTab] = useState<'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records'>('coupons');
  const [signinSubTab, setSigninSubTab] = useState<'new_member' | 'daily_signin'>('daily_signin');
  const [isVipOpen, setIsVipOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [isMyAccountOpen, setIsMyAccountOpen] = useState(false);

  // Switch to main views (lobby / promotions / favorites / admin) with URL update
  const handleNavigateView = (view: 'lobby' | 'promotions' | 'favorites' | 'admin') => {
    if (view === activeView) return;
    const targetPath = view === 'lobby' ? '/' : view === 'promotions' ? '/promotions' : view === 'favorites' ? '/favorites' : '/neexthubadmin';
    window.history.pushState({ view }, '', targetPath);

    if (view === 'admin') {
      setActiveView('admin');
      setIsNoticeOpen(false);
      return;
    }

    setIsBrandLoading(true);
    setBrandLoadingMessage(
      view === 'lobby' 
        ? (language === 'bn' ? 'বেঙ্গলবেট হোম ও গেমিং লবি লোড হচ্ছে...' : 'Opening BengalBet Home Lobby...')
        : view === 'favorites'
        ? (language === 'bn' ? 'আমার সংগ্রহ ও প্রিয় গেম লোড হচ্ছে...' : 'Loading My Collection / Favorites...')
        : (language === 'bn' ? 'প্রমোশন ও বোনাস অফার লোড হচ্ছে...' : 'Loading Promotions & VIP Offers...')
    );
    setTimeout(() => {
      setActiveView(view);
      setIsBrandLoading(false);
    }, 350);
  };

  // Switch to dedicated Category Games Page (e.g. /rng or /slot or /live)
  const handleNavigateCategory = (cat: GameCategory) => {
    if (cat === 'cockfight') {
      handleOpenRewardCenter('coupons');
      return;
    }
    const targetPath = cat === 'slot' ? '/rng' : `/${cat}`;
    window.history.pushState({ view: 'category', category: cat }, '', targetPath);

    setIsBrandLoading(true);
    const catTitle = CATEGORY_META[cat]?.bn || cat;
    setBrandLoadingMessage(
      language === 'bn' 
        ? `${catTitle} গেম পেজ লোড হচ্ছে...` 
        : `Opening ${cat.toUpperCase()} Game Lobby...`
    );

    setTimeout(() => {
      setActiveCategory(cat);
      setActiveView('category');
      setIsBrandLoading(false);
    }, 350);
  };

  // Launch Game with BengalBet Game Server Connection Screen
  const handleLaunchGame = (game: GameItem) => {
    setPendingGame(game);
    setIsBrandLoading(true);
    setBrandLoadingMessage(
      language === 'bn'
        ? `${game.nameBn || game.name} (${game.provider}) গেমিং সার্ভার প্রস্তুত হচ্ছে...`
        : `Connecting to ${game.name} (${game.provider}) Game Server...`
    );

    setTimeout(() => {
      setIsBrandLoading(false);
      setActiveGame(game);
      setPendingGame(null);
    }, 650);
  };

  // User Action Handlers
  const handleOpenDeposit = () => {
    setMissionsInitialMenu('deposit');
    setIsMissionsOpen(true);
  };

  const handleOpenWithdraw = () => {
    setMissionsInitialMenu('withdraw');
    setIsMissionsOpen(true);
  };

  const handleOpenMyAccount = () => {
    setMissionsInitialMenu('my_account');
    setIsMissionsOpen(true);
  };

  const handleOpenRewardCenter = (tab?: 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records' | any) => {
    const validTabs = ['coupons', 'temu_chest', 'signin', 'rescue', 'promo', 'ticket_records'];
    const resolvedTab = (typeof tab === 'string' && validTabs.includes(tab)) ? tab : 'coupons';
    setMissionsInitialMenu('reward_center');
    setRewardCenterInitialTab(resolvedTab as any);
    setIsMissionsOpen(true);
  };

  const [spinOrigin, setSpinOrigin] = useState<'reward_center' | 'other'>('other');
  const [redPacketOrigin, setRedPacketOrigin] = useState<'reward_center' | 'other'>('other');
  const [goldenEggOrigin, setGoldenEggOrigin] = useState<'reward_center' | 'other'>('other');

  const handleOpenSpin = (origin: 'reward_center' | 'other' = 'other') => {
    setSpinOrigin(origin);
    setIsSpinOpen(true);
  };

  const handleOpenRedEnvelope = (origin: 'reward_center' | 'other' = 'other') => {
    setRedPacketOrigin(origin);
    setIsRedPacketOpen(true);
  };

  const handleOpenGoldenEgg = (origin: 'reward_center' | 'other' = 'other') => {
    if (!user.isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    setGoldenEggOrigin(origin);
    setIsGoldenEggOpen(true);
  };

  const handleOpenSuperValueReward = () => {
    if (!user.isLoggedIn) {
      setAuthMode('login');
      setIsAuthOpen(true);
      return;
    }
    setIsSuperValueRewardOpen(true);
  };

  const handleOpenSupportTicket = () => {
    setMissionsInitialMenu('feedback');
    setIsMissionsOpen(true);
  };

  const handleCloseSpin = () => {
    setIsSpinOpen(false);
    if (spinOrigin === 'reward_center') {
      handleOpenRewardCenter('coupons');
    }
  };

  const handleCloseRedEnvelope = () => {
    setIsRedPacketOpen(false);
    if (redPacketOrigin === 'reward_center') {
      handleOpenRewardCenter('coupons');
    }
  };

  const handleCloseGoldenEgg = () => {
    setIsGoldenEggOpen(false);
    if (shouldOpenSuperValueAfterEgg && user.isLoggedIn) {
      setIsSuperValueRewardOpen(true);
      setShouldOpenSuperValueAfterEgg(false);
    } else {
      setShouldOpenSuperValueAfterEgg(false);
      if (goldenEggOrigin === 'reward_center') {
        handleOpenRewardCenter('coupons');
      }
    }
  };

  const handleBackToReward = (tab?: string) => {
    setIsRedPacketOpen(false);
    setIsSpinOpen(false);
    setIsGoldenEggOpen(false);
    setIsSuperValueRewardOpen(false);
    const validTabs: Array<'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records'> = [
      'coupons', 'temu_chest', 'signin', 'rescue', 'promo', 'ticket_records'
    ];
    const targetTab = (tab && validTabs.includes(tab as any)) ? (tab as any) : 'coupons';
    handleOpenRewardCenter(targetTab);
  };

  const handleClaimCash = async (amount: number, reason: string) => {
    try {
      let type: 'spin' | 'golden_egg' | 'red_envelope' | 'mission' | 'promo' | 'signin' = 'mission';
      const r = (reason || '').toLowerCase();
      if (r.includes('egg') || r.includes('ডিম')) type = 'golden_egg';
      else if (r.includes('envelope') || r.includes('red') || r.includes('খাম')) type = 'red_envelope';
      else if (r.includes('spin') || r.includes('চাকা')) type = 'spin';
      else if (r.includes('sign') || r.includes('হাজিরা')) type = 'signin';
      else if (r.includes('promo') || r.includes('অফার')) type = 'promo';

      const res = await api.rewards.claim(type, amount, reason);
      if (res.success && res.newBalance !== undefined) {
        setUser(prev => ({
          ...prev,
          balance: res.newBalance,
          freeSpins: res.user?.free_spins ?? prev.freeSpins,
          goldenEggsAvailable: res.user?.golden_eggs_available ?? prev.goldenEggsAvailable,
          redPacketsAvailable: res.user?.red_packets_available ?? prev.redPacketsAvailable
        }));
      }
    } catch (e) {
      console.warn('Reward claim db sync note:', e);
    }
  };

  // Server-settled egg / red packet: reflect the returned wallet and hammer counts only.
  const handleChanceSettled = (result?: any) => {
    if (result?.success && result.newBalance !== undefined) {
      setUser(prev => ({
        ...prev,
        balance: result.newBalance,
        goldenEggsAvailable: result.user?.golden_eggs_available ?? prev.goldenEggsAvailable,
        redPacketsAvailable: result.user?.red_packets_available ?? prev.redPacketsAvailable,
      }));
    }
  };

  // The server already settled the spin; only reflect its returned wallet state.
  const handleSpinWin = (_prize: SpinPrize, result?: any) => {
    if (result?.success && result.newBalance !== undefined) {
      setUser(prev => ({ ...prev, balance: result.newBalance, freeSpins: result.user?.free_spins ?? prev.freeSpins }));
    }
  };

  // A deposit is a pending request until an admin approves it: only read back the server wallet
  const handleDepositSuccess = async (_amount?: number) => {
    try {
      const res = await api.wallet.getBalance();
      if (res.success) {
        setUser(prev => ({
          ...prev,
          balance: res.balance,
          vipLevel: res.vipLevel,
          vipExp: res.vipExp
        }));
      }
    } catch {}
  };

  const handleWithdrawSuccess = async (amount: number) => {
    setUser(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount)
    }));
    try {
      const res = await api.wallet.getBalance();
      if (res.success) {
        setUser(prev => ({
          ...prev,
          balance: res.balance,
          vipLevel: res.vipLevel,
          vipExp: res.vipExp
        }));
      }
    } catch {}
  };

  const handleClaimPromo = async (promo: Promotion) => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + 100
    }));
    try {
      const res = await api.rewards.claim('promo', 100, promo.titleBn || promo.titleEn);
      if (res.success && res.newBalance !== undefined) {
        setUser(prev => ({ ...prev, balance: res.newBalance }));
      }
    } catch (e) {
      console.warn('Promo claim db note:', e);
    }
  };

  // App bonus is decided and credited once by the server; the site only shows the result
  const handleClaimAppBonus = async () => {
    try {
      const res = await api.rewards.appBonus();
      if (res.success && res.newBalance !== undefined) {
        setUser(prev => ({ ...prev, balance: res.newBalance }));
        return `৳${res.amount} অ্যাপ বোনাস আপনার ব্যালেন্সে যোগ হয়েছে!`;
      }
      return 'অ্যাপ বোনাস নেওয়া যায়নি।';
    } catch (e: any) {
      return e?.message || 'অ্যাপ বোনাস নেওয়া যায়নি।';
    }
  };

  const handleLoginSuccess = (userData: Partial<UserAccount>) => {
    setUser(prev => ({
      ...prev,
      ...normalizeServerUser(userData as any),
      isLoggedIn: true
    }));
    setIsAuthOpen(false);
    // User is now authenticated:
    // If golden egg is not in renew cooldown, open it; otherwise open Super Value Reward directly
    if (!isGoldenEggInRenew()) {
      setIsGoldenEggOpen(true);
      setShouldOpenSuperValueAfterEgg(true);
    } else {
      setIsSuperValueRewardOpen(true);
    }
  };

  const handleLogout = () => {
    signOutFirebase().catch(console.warn);
    setUser(prev => ({
      ...prev,
      isLoggedIn: false
    }));
    setIsGoldenEggOpen(false);
    setIsSuperValueRewardOpen(false);
    setShouldOpenEggAfterNotice(false);
    setShouldOpenSuperValueAfterEgg(false);
  };

  const handleToggleLanguage = () => {
    setLanguage(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  // Full-Screen All-Device Screen-Friendly Neext Hub Admin View
  if (activeView === 'admin') {
    return (
      <div className="min-h-screen bg-[#02130c] text-white flex flex-col font-sans">
        <GlobalDatabaseErrorBanner onOpenAdminSettings={() => {}} />
        <NeextHubAdminView
          language={language}
          onExitAdmin={() => handleNavigateView('lobby')}
          onRefreshSiteUser={async () => {
            try {
              const res = await api.auth.getMe();
              if (res.success && res.user) {
                setUser(prev => ({ ...prev, ...normalizeServerUser(res.user) }));
              }
            } catch {}
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#051d14] text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-black pb-16 md:pb-0">
      
      {/* Global Database Connection Error Banner */}
      <GlobalDatabaseErrorBanner
        onOpenAdminSettings={() => {
          setActiveView('admin');
        }}
      />

      {/* Mobile Sticky Top Download Banner with Golden Chest & ৳52 bonus matching mobile screenshots */}
      <MobileTopDownloadBar
        language={language}
        onDownloadApp={() => setIsAppDownloadOpen(true)}
      />

      {/* Top Header */}
      <Header
        language={language}
        user={user}
        isSidebarCollapsed={isSidebarCollapsed}
        isSidebarOpen={sidebarOpen}
        onNavigateLobby={() => handleNavigateView('lobby')}
        onOpenFavorites={() => handleNavigateView('favorites')}
        onToggleSidebar={handleToggleSidebar}
        onOpenLogin={() => { setAuthMode('login'); setIsAuthOpen(true); }}
        onOpenRegister={() => { setAuthMode('register'); setIsAuthOpen(true); }}
        onOpenDeposit={handleOpenDeposit}
        onOpenWithdraw={handleOpenWithdraw}
        onOpenVIP={() => { setMissionsInitialMenu('vip'); setIsMissionsOpen(true); }}
        onOpenMyAccount={handleOpenMyAccount}
        onOpenMissions={() => handleOpenRewardCenter('coupons')}
        onOpenMessages={() => { setMissionsInitialMenu('messages'); setIsMissionsOpen(true); }}
        onOpenInvite={() => { setMissionsInitialMenu('invite'); setIsMissionsOpen(true); }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotice={() => setIsNoticeOpen(true)}
        onToggleLanguage={handleToggleLanguage}
        onLogout={handleLogout}
        onRefreshBalance={() => {
          setUser(prev => ({ ...prev, balance: prev.balance + Math.floor(Math.random() * 20) }));
        }}
      />

      {/* Main Body Layout with Sidebar & Content */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto pt-0.5">
        {/* Sidebar */}
        <Sidebar
          language={language}
          isOpen={sidebarOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => {
            setIsSidebarCollapsed(prev => {
              const next = !prev;
              try {
                localStorage.setItem('bengalbet_sidebar_collapsed', String(next));
              } catch {}
              return next;
            });
          }}
          activeView={activeView}
          onClose={() => setSidebarOpen(false)}
          onNavigate={handleNavigateView}
          onOpenSpin={handleOpenSpin}
          onOpenRedEnvelope={handleOpenRedEnvelope}
          onOpenRewardCenter={handleOpenRewardCenter}
          onOpenGoldenEgg={() => { setIsGoldenEggOpen(true); setSidebarOpen(false); }}
          onOpenMissions={() => { handleOpenRewardCenter('coupons'); setSidebarOpen(false); }}
          onOpenVip={() => { setMissionsInitialMenu('vip'); setIsMissionsOpen(true); setSidebarOpen(false); }}
          onOpenShare={() => { setMissionsInitialMenu('invite'); setIsMissionsOpen(true); setSidebarOpen(false); }}
          onOpenMyAccount={() => { handleOpenMyAccount(); setSidebarOpen(false); }}
          onOpenAppDownload={() => { setIsAppDownloadOpen(true); setSidebarOpen(false); }}
          onOpenSupport={() => { setIsLiveChatOpen(true); setSidebarOpen(false); }}
          onOpenSupportTicket={() => { handleOpenSupportTicket(); setSidebarOpen(false); }}
          onOpenDeposit={handleOpenDeposit}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 min-w-0 px-1.5 sm:px-3 py-1 sm:py-1.5">
          {activeView === 'promotions' ? (
            <PromotionsView
              language={language}
              onSelectPromotion={(promo) => setSelectedPromo(promo)}
              onBackToLobby={() => handleNavigateView('lobby')}
            />
          ) : activeView === 'favorites' ? (
            <FavoritesView
              language={language}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onLaunchGame={handleLaunchGame}
              onBackToLobby={() => handleNavigateView('lobby')}
            />
          ) : activeView === 'category' ? (
            <CategoryGamesView
              category={activeCategory}
              language={language}
              user={user}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onBack={() => handleNavigateView('lobby')}
              onLaunchGame={handleLaunchGame}
              onCategoryChange={handleNavigateCategory}
            />
          ) : (
            <CasinoLobby
              language={language}
              user={user}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onLaunchGame={handleLaunchGame}
              onSelectCategory={handleNavigateCategory}
              onOpenPromotions={() => handleNavigateView('promotions')}
              onOpenSpin={handleOpenSpin}
              onOpenDeposit={handleOpenDeposit}
              onOpenShare={() => { setMissionsInitialMenu('invite'); setIsMissionsOpen(true); }}
              onOpenVip={() => setIsVipOpen(true)}
              onOpenNotice={() => setIsNoticeOpen(true)}
              onOpenAppDownload={() => setIsAppDownloadOpen(true)}
              onOpenDailySignIn={() => {
                handleOpenRewardCenter('signin');
                setSigninSubTab('daily_signin');
              }}
            />
          )}
        </main>
      </div>

      {/* Global Footer */}
      <Footer
        language={language}
        onOpenAppDownload={() => setIsAppDownloadOpen(true)}
        onOpenSupport={() => setIsLiveChatOpen(true)}
        onOpenPromoTerms={() => handleNavigateView('promotions')}
        onOpenAdmin={() => handleNavigateView('admin')}
      />

      {/* Floating Action Buttons on the right (Dock, Live chat, VIP, Featured games, Scroll top) */}
      <FloatingWidgets
        language={language}
        activeView={activeView}
        onOpenSupport={() => setIsLiveChatOpen(true)}
        onOpenVIP={() => {
          setMissionsInitialMenu('vip');
          setIsMissionsOpen(true);
        }}
        onOpenSpin={handleOpenSpin}
        onOpenTicket={handleOpenRedEnvelope}
        onOpenSuperValueReward={handleOpenSuperValueReward}
        onOpenMissions={() => {
          setMissionsInitialMenu('mission');
          setIsMissionsOpen(true);
        }}
        onOpenEgg={() => handleOpenGoldenEgg('other')}
        onOpenPromotions={() => handleNavigateView('promotions')}
        onOpenFeaturedGames={() => {
          handleNavigateView('lobby');
          const topGame = GAMES_DATA[0];
          if (topGame) {
            handleLaunchGame(topGame);
          }
        }}
        onLaunchHotGame={() => {
          const hotGame = GAMES_DATA.find(g => g.id.includes('gates') || g.id.includes('olympus') || g.name.toLowerCase().includes('olympus')) || GAMES_DATA[0];
          if (hotGame) {
            handleLaunchGame(hotGame);
          }
        }}
      />

      {/* Brand Loading Overlay with Glowing BengalBet Typography & Casino Chip Animation */}
      <BrandLoadingOverlay
        isVisible={isBrandLoading}
        language={language}
        customMessage={brandLoadingMessage}
      />

      {/* Official Multi-Notice Announcement Popup matching Screenshot */}
      <NoticeAnnouncementModal
        isOpen={isNoticeOpen}
        language={language}
        onClose={() => {
          setIsNoticeOpen(false);
          // Only show Golden Egg after notice if user is authenticated and not in renew cooldown!
          if (user.isLoggedIn) {
            if (shouldOpenEggAfterNotice && !isGoldenEggInRenew()) {
              setIsGoldenEggOpen(true);
              setShouldOpenEggAfterNotice(false);
            } else if (shouldOpenSuperValueAfterEgg) {
              // Egg is in renew cooldown, open Super Value Reward directly
              setIsSuperValueRewardOpen(true);
              setShouldOpenSuperValueAfterEgg(false);
              setShouldOpenEggAfterNotice(false);
            }
          } else {
            setShouldOpenEggAfterNotice(false);
            setShouldOpenSuperValueAfterEgg(false);
          }
        }}
        onOpenDeposit={handleOpenDeposit}
        onOpenVip={() => setIsVipOpen(true)}
        onOpenSpin={handleOpenSpin}
        onOpenEgg={() => { setIsNoticeOpen(false); handleOpenGoldenEgg(); }}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Promotion Details Modal */}
      {selectedPromo && (
        <PromotionModal
          promotion={selectedPromo}
          language={language}
          user={user}
          onClose={() => setSelectedPromo(null)}
          onClaimSuccess={() => {}}
          onOpenDeposit={handleOpenDeposit}
          onOpenSpin={handleOpenSpin}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenAppDownload={() => setIsAppDownloadOpen(true)}
          onOpenMenu={(menu, tab) => { if (tab) setRewardCenterInitialTab(tab as any); setMissionsInitialMenu(menu); setIsMissionsOpen(true); }}
        />
      )}

      {/* Lucky Spin Modal */}
      {isSpinOpen && (
        <LuckySpinModal
          language={language}
          user={user}
          onClose={handleCloseSpin}
          onSpinWin={handleSpinWin}
          onBackToReward={handleBackToReward}
        />
      )}

      {/* Red Packet Modal */}
      {isRedPacketOpen && (
        <RedEnvelopeModal
          language={language}
          user={user}
          onClose={handleCloseRedEnvelope}
          onSettled={handleChanceSettled}
          onBackToReward={handleBackToReward}
          onOpenSpin={() => {
            setIsRedPacketOpen(false);
            handleOpenSpin(redPacketOrigin);
          }}
          onOpenGoldenEgg={() => {
            setIsRedPacketOpen(false);
            handleOpenGoldenEgg(redPacketOrigin);
          }}
          onOpenSuperValueReward={() => {
            setIsRedPacketOpen(false);
            handleOpenSuperValueReward();
          }}
        />
      )}

      {/* Golden Egg Modal - ONLY for authenticated users */}
      {isGoldenEggOpen && user.isLoggedIn && (
        <GoldenEggModal
          language={language}
          user={user}
          onClose={handleCloseGoldenEgg}
          onSettled={handleChanceSettled}
          onBackToReward={handleBackToReward}
        />
      )}

      {/* BengalBet Super Value Reward Modal - ONLY for authenticated users */}
      {isSuperValueRewardOpen && user.isLoggedIn && (
        <SuperValueRewardModal
          isOpen={isSuperValueRewardOpen && user.isLoggedIn}
          language={language}
          user={user}
          onClose={() => setIsSuperValueRewardOpen(false)}
          onOpenShareModal={() => {
            setIsSuperValueRewardOpen(false);
            setIsShareOpen(true);
          }}
          onBonusClaimed={handleClaimCash}
        />
      )}

      {/* Missions Modal */}
      {isMissionsOpen && (
        <MissionsModal
          language={language}
          user={user}
          initialMenu={missionsInitialMenu}
          initialRewardCenterTab={rewardCenterInitialTab}
          initialSigninSubTab={signinSubTab}
          onClose={() => setIsMissionsOpen(false)}
          onClaimMission={handleClaimCash}
          onSettledReward={async () => {
            const result = await api.wallet.getBalance();
            if (result.success) setUser(prev => ({ ...prev, balance: result.balance }));
          }}
          onDepositSuccess={handleDepositSuccess}
          onWithdrawSuccess={handleWithdrawSuccess}
          onOpenDeposit={handleOpenDeposit}
          onOpenWithdraw={handleOpenWithdraw}
          onOpenMyAccount={handleOpenMyAccount}
          onOpenShare={() => setIsShareOpen(true)}
          onOpenVip={() => setIsVipOpen(true)}
          onOpenSupport={() => setIsLiveChatOpen(true)}
          onOpenSuperValueReward={handleOpenSuperValueReward}
          onOpenEgg={() => handleOpenGoldenEgg('reward_center')}
          onOpenSpin={() => handleOpenSpin('reward_center')}
          onOpenRedEnvelope={() => handleOpenRedEnvelope('reward_center')}
          onOpenAppDownload={() => setIsAppDownloadOpen(true)}
          onLogout={handleLogout}
          onUpdateUsername={(newU) => setUser(prev => ({ ...prev, username: newU }))}
        />
      )}

      {/* VIP Modal */}
      {isVipOpen && (
        <VipModal
          language={language}
          user={user}
          onClose={() => setIsVipOpen(false)}
          onRefreshUser={async () => {
            try {
              const res = await api.auth.getMe();
              if (res.success && res.user) {
                setUser(prev => ({ ...prev, ...normalizeServerUser(res.user) }));
              }
            } catch {}
          }}
        />
      )}

      {/* Share / Refer & Earn Modal */}
      {isShareOpen && (
        <ShareModal
          language={language}
          user={user}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* Auth Login / Register Modals */}
      <AuthModals
        isOpen={isAuthOpen}
        initialMode={authMode}
        language={language}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenSupport={() => setIsLiveChatOpen(true)}
      />

      {/* Playable Casino Game Modal */}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          language={language}
          user={user}
          onClose={() => {
            setActiveGame(null);
            if (user.isLoggedIn) {
              api.wallet.getBalance().then(res => {
                if (res.success) {
                  setUser(prev => ({
                    ...prev,
                    balance: res.balance,
                    vipLevel: res.vipLevel,
                    vipExp: res.vipExp
                  }));
                }
              }).catch(() => {});
            }
          }}
          onUpdateBalance={() => { /* Client game outcomes must not modify the cash wallet. */ }}
          onWalletSettled={(newBalance) => setUser(prev => ({ ...prev, balance: newBalance }))}
        />
      )}

      {/* 24/7 Bengali VIP Live Support Chat */}
      <LiveChatWidget
        isOpen={isLiveChatOpen}
        language={language}
        onClose={() => setIsLiveChatOpen(false)}
        onOpenSupportTicket={handleOpenSupportTicket}
        onOpenDeposit={handleOpenDeposit}
        onOpenWithdraw={handleOpenWithdraw}
        onOpenPromotions={() => handleNavigateView('promotions')}
      />

      {/* Game & Promo Search Modal */}
      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          language={language}
          onClose={() => setIsSearchOpen(false)}
          onSelectGame={(g) => handleLaunchGame(g)}
          onSelectPromotion={(p) => setSelectedPromo(p)}
        />
      )}

      {/* Mobile App Download ৳52 Modal */}
      <AppDownloadModal
        isOpen={isAppDownloadOpen}
        language={language}
        onClose={() => setIsAppDownloadOpen(false)}
        onClaimAppBonus={handleClaimAppBonus}
      />

      {/* User Profile / Account Modal */}
      <MyAccountModal
        isOpen={isMyAccountOpen}
        language={language}
        user={user}
        onClose={() => setIsMyAccountOpen(false)}
        onOpenDeposit={handleOpenDeposit}
        onOpenWithdraw={handleOpenWithdraw}
        onOpenVIP={() => {
          setIsMyAccountOpen(false);
          setMissionsInitialMenu('vip');
          setIsMissionsOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdmin={() => handleNavigateView('admin')}
        onOpenSupportTicket={handleOpenSupportTicket}
      />

      {/* Persistent Mobile Bottom Navigation Bar matching Mobile Screenshots */}
      <MobileBottomNav
        language={language}
        activeView={activeView}
        user={user}
        onNavigateLobby={() => handleNavigateView('lobby')}
        onOpenPromotions={() => handleNavigateView('promotions')}
        onOpenShare={() => {
          setMissionsInitialMenu('invite');
          setIsMissionsOpen(true);
        }}
        onOpenRewards={handleOpenRewardCenter}
        onOpenAccount={() => {
          if (user.isLoggedIn) {
            handleOpenMyAccount();
          } else {
            setAuthMode('login');
            setIsAuthOpen(true);
          }
        }}
      />
    </div>
  );
}
