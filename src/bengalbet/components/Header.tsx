// @ts-nocheck
import React, { useState } from 'react';
import { 
  Menu, 
  Search, 
  User, 
  Wallet, 
  PlusCircle, 
  ArrowDownToLine, 
  Bell, 
  Crown, 
  RefreshCw, 
  Globe, 
  LogOut,
  Target,
  Mail,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Users,
  X,
  Heart
} from 'lucide-react';
import { UserAccount, Language } from '../types';
import tigerFilledFace from '../assets/images/tiger_filled_face.jpg';

interface HeaderProps {
  user: UserAccount;
  language: Language;
  isSidebarCollapsed?: boolean;
  isSidebarOpen?: boolean;
  onNavigateLobby?: () => void;
  onOpenFavorites?: () => void;
  onToggleSidebar: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenVIP: () => void;
  onOpenMyAccount?: () => void;
  onOpenMissions?: () => void;
  onOpenMessages?: () => void;
  onOpenInvite?: () => void;
  onOpenNotice?: () => void;
  onOpenSearch: () => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  onRefreshBalance: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  language,
  isSidebarCollapsed = false,
  isSidebarOpen = false,
  onNavigateLobby,
  onOpenFavorites,
  onToggleSidebar,
  onOpenLogin,
  onOpenRegister,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenVIP,
  onOpenMyAccount,
  onOpenMissions,
  onOpenMessages,
  onOpenInvite,
  onOpenNotice,
  onOpenSearch,
  onToggleLanguage,
  onLogout,
  onRefreshBalance
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Menu is open on mobile when isSidebarOpen is true, or on desktop when !isSidebarCollapsed
  const isMobileMenuOpen = Boolean(isSidebarOpen);

  // Consistent 9-digit account ID
  const nineDigitId = user.id ? user.id.replace(/\D/g, '').padStart(9, '8').slice(-9) : '892740156';

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(nineDigitId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleBalanceRefresh = () => {
    setIsRefreshing(true);
    onRefreshBalance();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-50 bg-gradient-to-r from-[#031c13] via-[#063424] to-[#031c13] border-b border-[#0d593a] shadow-[0_4px_20px_rgba(0,0,0,0.6)] px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 flex items-center justify-between transition-all"
    >
      {/* Left side: Hamburger / Close X & BengalBet Brand with Tiger Face Logo */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className={`p-1 sm:p-1.5 rounded-lg transition-all focus:outline-none cursor-pointer flex items-center justify-center shrink-0 ${
            isMobileMenuOpen 
              ? 'bg-[#0f4d34] text-yellow-400 border border-yellow-400/40 shadow-inner' 
              : 'text-white/90 hover:text-white hover:bg-[#0c442e]'
          }`}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Toggle menu'}
          aria-expanded={isMobileMenuOpen || !isSidebarCollapsed}
          title={
            isMobileMenuOpen 
              ? (language === 'bn' ? 'মেনু বন্ধ করুন' : 'Close Menu') 
              : (language === 'bn' ? 'মেনু খুলুন/সংকুচিত করুন' : 'Toggle Menu')
          }
        >
          {isMobileMenuOpen ? (
            /* Close X icon when mobile menu is open */
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 stroke-[2.5] transition-transform animate-in fade-in zoom-in-75 duration-200" />
          ) : (
            /* 3-bar hamburger matching screenshot when menu is closed */
            <div className="flex flex-col justify-between w-4.5 h-3.5 sm:w-5.5 sm:h-4.5 transition-transform animate-in fade-in duration-200">
              <span className="w-full h-0.75 sm:h-1 bg-[#f0fdf4] rounded-full"></span>
              <span className="w-full h-0.75 sm:h-1 bg-[#f0fdf4] rounded-full"></span>
              <span className="w-full h-0.75 sm:h-1 bg-[#f0fdf4] rounded-full"></span>
            </div>
          )}
        </button>

        {/* Brand Logo: Direct Tiger Face Mascot + Site Name */}
        <div 
          id="brand-logo-container"
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          onClick={() => {
            if (onNavigateLobby) {
              onNavigateLobby();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="BengalBet"
          role="button"
          aria-label="BengalBet Home"
        >
          {/* Filled Premium Tiger Mascot Icon - Zero Empty PNG Space, 100% Solid Filled with Vibrant Color Glow */}
          <div className="relative w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 shrink-0 flex items-center justify-center">
            <div 
              className="relative w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-[#ffe082] via-[#ff9800] to-[#d84315] shadow-[0_0_6px_rgba(255,170,0,0.22),0_0_12px_rgba(255,80,0,0.12)] group-hover:scale-105 transition-transform"
              style={{
                animation: 'tigerFilledIconPulse 3s ease-in-out infinite'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#02130c] relative flex items-center justify-center">
                <img 
                  src={tigerFilledFace}
                  alt="BengalBet Tiger Mascot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none pointer-events-none group-hover:scale-115 transition-transform duration-300"
                  style={{
                    animation: 'tigerFaceZoomBreathe 3.6s ease-in-out infinite'
                  }}
                />
                {/* Sunlight reflection shimmer */}
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/25 to-transparent pointer-events-none mix-blend-overlay"
                  style={{
                    animation: 'realTigerShimmer 3s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Site Name: Bengal in Diamond White + Bet in Golden Gradient */}
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-baseline font-black tracking-tight text-lg xs:text-xl sm:text-2xl md:text-[25px] leading-none">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans font-black tracking-tight">
                Bengal
              </span>
              <span className="bg-gradient-to-b from-[#fff59d] via-[#ffca28] to-[#ff6f00] text-transparent bg-clip-text font-sans font-black tracking-tight drop-shadow-[0_2px_6px_rgba(255,160,0,0.5)] ml-0.5">
                Bet
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-300/85 font-bold tracking-wider hidden sm:block">
              {language === 'bn' ? 'বেঙ্গলবেট গেমিং পোর্টাল' : 'Official Gaming Portal'}
            </span>
          </div>
        </div>
      </div>

      {/* Center/Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notice / Announcement Button - Hidden on mobile, shown on desktop for guest */}
        {!user.isLoggedIn && onOpenNotice && (
          <button
            id="header-notice-btn"
            onClick={onOpenNotice}
            className="hidden md:flex relative p-2 rounded-full bg-[#0e432f] hover:bg-[#155e42] text-yellow-400 border border-[#1b6b4c] transition-colors cursor-pointer"
            title={language === 'bn' ? 'অফিসিয়াল ঘোষণা' : 'Official Announcements'}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-bounce" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-[#0a3524] animate-pulse" />
          </button>
        )}

        {/* Search button - Desktop only in header */}
        <button
          id="header-search-btn"
          onClick={onOpenSearch}
          className="hidden md:flex p-2 rounded-full bg-[#0e432f] hover:bg-[#155e42] text-yellow-400 border border-[#1b6b4c] transition-colors"
          title={language === 'bn' ? 'গেম খুঁজুন' : 'Search Games'}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Language switch - Desktop (বাংলা / EN) */}
        <button
          id="header-language-btn"
          onClick={onToggleLanguage}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0e432f] hover:bg-[#155e42] text-xs font-bold text-[#86efac] hover:text-yellow-300 border border-[#1b6b4c] transition-colors cursor-pointer"
          title={language === 'bn' ? 'ভাষা পরিবর্তন করুন (বাংলা/English)' : 'Change Language (Bengali/English)'}
        >
          <Globe className="w-3.5 h-3.5 text-yellow-400" />
          <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
        </button>

        {user.isLoggedIn ? (
          /* Logged In State */
          <>
            {/* MOBILE LOGGED-IN VIEW EXACTLY AS IN Capture8.PNG */}
            <div className="flex md:hidden items-center gap-1.5 xs:gap-2 shrink-0">
              {/* Balance + Refresh Arrow */}
              <div 
                id="mobile-logged-in-balance"
                className="flex items-center gap-1 text-white cursor-pointer select-none shrink-0"
                onClick={handleBalanceRefresh}
              >
                {/* Currency Symbol + Amount */}
                <div className="flex items-baseline gap-0.5 xs:gap-1">
                  <span className="text-white font-bold text-xs xs:text-sm font-bengali">৳</span>
                  <span className="text-white font-black text-xs xs:text-sm tracking-tight font-sans">
                    {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Golden Refresh Arrow */}
                <button
                  id="mobile-header-refresh-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBalanceRefresh();
                  }}
                  className="text-[#ffd200] hover:text-yellow-200 transition-colors p-0.5 cursor-pointer shrink-0"
                  title={language === 'bn' ? 'ব্যালেন্স রিফ্রেশ করুন' : 'Refresh balance'}
                >
                  <RefreshCw className={`w-3 h-3 xs:w-3.5 xs:h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Deposit Quick Action: Yellow Rounded Square with Wallet+ Icon */}
              <button
                id="mobile-header-deposit-btn"
                onClick={onOpenDeposit}
                className="w-7 h-7 xs:w-7.5 xs:h-7.5 rounded-md bg-gradient-to-b from-[#ffd84d] via-[#f5be18] to-[#e6a800] hover:brightness-110 active:scale-95 text-black shadow-sm flex items-center justify-center cursor-pointer transition-all border border-yellow-200/60 shrink-0"
                title={language === 'bn' ? 'ডিপোজিট করুন' : 'Deposit Money'}
              >
                {/* Custom SVG: Black Wallet with Plus Sign matching screenshot */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-black" fill="currentColor">
                  {/* Top strap */}
                  <rect x="4" y="3.5" width="16" height="3" rx="1.5" fill="currentColor" />
                  {/* Middle flap */}
                  <rect x="3" y="7.5" width="18" height="3.5" rx="1" fill="currentColor" />
                  {/* Bottom pouch */}
                  <path d="M3 12h18c.55 0 1 .45 1 1v5c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-5c0-.55.45-1 1-1z" fill="currentColor" />
                  {/* Plus badge on bottom-left */}
                  <circle cx="8" cy="15.5" r="4.2" fill="#f5be18" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M8 13.5v4M6 15.5h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  {/* Wallet gold clip */}
                  <rect x="16" y="14" width="4.5" height="2.2" rx="0.5" fill="#f5be18" />
                </svg>
              </button>

              {/* Withdraw Quick Action: Yellow Rounded Square with Hand holding Coin Icon */}
              <button
                id="mobile-header-withdraw-btn"
                onClick={onOpenWithdraw}
                className="w-7 h-7 xs:w-7.5 xs:h-7.5 rounded-md bg-gradient-to-b from-[#ffd84d] via-[#f5be18] to-[#e6a800] hover:brightness-110 active:scale-95 text-black shadow-sm flex items-center justify-center cursor-pointer transition-all border border-yellow-200/60 shrink-0"
                title={language === 'bn' ? 'উত্তোলন করুন' : 'Withdraw Money'}
              >
                {/* Custom SVG: Hand holding Coin with Dollar/Taka sign */}
                <svg viewBox="0 0 24 24" className="w-4 h-4 xs:w-4.5 xs:h-4.5 text-black" fill="none">
                  {/* Coin with dollar */}
                  <circle cx="16" cy="6.5" r="4" fill="currentColor" />
                  <path d="M16 4.3v4.4M17.2 5.5c0-.6-.5-1-1.2-1s-1.2.4-1.2 1 .5.8 1.2 1c.7.2 1.2.4 1.2 1s-.5 1-1.2 1-1.2-.4-1.2-1" stroke="#f5be18" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Receiving hand */}
                  <path d="M3 18h5l3.5 2.5a2 2 0 0 0 1.2.5h6.3a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2h-5l-3-2H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" />
                  <path d="M3 14.5v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* DESKTOP LOGGED-IN VIEW */}
            <div className="hidden md:flex items-center gap-3">
              {/* Balance Pill */}
              <div 
                id="user-wallet-pill"
                className="flex items-center gap-2 bg-[#062016] border border-[#ffd200]/40 px-3 py-1 rounded-full shadow-inner"
              >
                <Wallet className="w-3.5 h-3.5 text-yellow-400" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[9px] text-[#86efac] font-medium">
                    {language === 'bn' ? 'মূল ব্যালেন্স' : 'Balance'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#ffd200] font-game tracking-wide">
                    ৳ {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button 
                  id="refresh-balance-btn"
                  onClick={handleBalanceRefresh}
                  className="p-1 text-emerald-400 hover:text-yellow-400 transition-colors cursor-pointer"
                  title="Refresh balance"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-yellow-400' : ''}`} />
                </button>
              </div>

              {/* Quick Deposit Button */}
              <button
                id="header-deposit-btn"
                onClick={onOpenDeposit}
                className="btn-bdt-green px-3.5 py-1.5 rounded-md text-xs sm:text-sm flex items-center gap-1 shadow-sm font-semibold cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিপোজিট' : 'Deposit'}</span>
              </button>

              {/* Withdraw Quick Button */}
              <button
                id="header-withdraw-btn"
                onClick={onOpenWithdraw}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#0e432f] hover:bg-[#155e42] text-xs font-semibold text-[#86efac] border border-[#1b6b4c] transition-colors cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 text-yellow-400" />
                <span>{language === 'bn' ? 'উত্তোলন' : 'Withdraw'}</span>
              </button>

              {/* Profile Dropdown / Trigger */}
              <div className="relative">
                <button
                  id="header-user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-full bg-[#12533a] border border-[#22c55e]/40 hover:border-yellow-400 transition-all cursor-pointer"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover border border-yellow-400/50"
                  />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-64 bg-[#072a1d] border border-[#ffd200]/40 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 backdrop-blur-md"
                  >
                    {/* Profile Header */}
                    <div 
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onOpenMyAccount) onOpenMyAccount();
                      }}
                      className="px-3 py-2.5 bg-[#051f15] hover:bg-[#0a3525] transition-colors border border-[#14593e] rounded-xl mb-2 flex items-center gap-3 cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black rounded-full shadow border border-black/50">
                          VIP{user.vipLevel}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white truncate">{user.username}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowUserMenu(false); onOpenVIP(); }}
                            className="text-[10px] font-black text-amber-300 hover:text-yellow-200 bg-[#0e432f] px-1.5 py-0.5 rounded border border-yellow-400/30 flex items-center gap-0.5 cursor-pointer"
                          >
                            <Crown className="w-2.5 h-2.5 text-yellow-400" />
                            <span>VIP {user.vipLevel}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-emerald-300 font-mono mt-0.5">{user.phone || '+880 1712-345678'}</p>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#124b35]">
                          <span className="text-[10px] text-gray-400">
                            {language === 'bn' ? 'আইডি:' : 'ID:'} <span className="font-mono text-yellow-400 font-bold tracking-wider">{nineDigitId}</span>
                          </span>
                          <button
                            onClick={(e) => handleCopyId(e)}
                            className="text-[10px] text-emerald-300 hover:text-yellow-300 flex items-center gap-0.5 p-0.5 rounded transition-colors"
                            title="Copy 9 Digit ID"
                          >
                            {copiedId ? (
                              <>
                                <Check className="w-3 h-3 text-green-400" />
                                <span className="text-[9px] text-green-400 font-bold">{language === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-emerald-400" />
                                <span className="text-[9px]">{language === 'bn' ? 'কপি' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-1">
                      <button
                        onClick={() => { setShowUserMenu(false); if (onOpenMyAccount) onOpenMyAccount(); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold text-yellow-300">{language === 'bn' ? 'আমার অ্যাকাউন্ট (ব্যক্তিগত কেন্দ্র)' : 'My Account'}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-300 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      {onOpenFavorites && (
                        <button
                          onClick={() => { setShowUserMenu(false); onOpenFavorites(); }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                              <Heart className="w-4 h-4 fill-rose-500/40 text-rose-400" />
                            </div>
                            <span className="font-bengali font-bold text-rose-200">{language === 'bn' ? 'আমার সংগ্রহ' : 'My Collection'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-300 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      )}

                      <button
                        onClick={() => { setShowUserMenu(false); onOpenDeposit(); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <PlusCircle className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold">{language === 'bn' ? 'ডিপোজিট' : 'Deposit'}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-300 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => { setShowUserMenu(false); onOpenWithdraw(); }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <ArrowDownToLine className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold">{language === 'bn' ? 'উত্তোলন' : 'Withdraw'}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-300 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <button
                        onClick={() => { 
                          setShowUserMenu(false); 
                          if (onOpenInvite) onOpenInvite(); 
                          else if (onOpenMissions) onOpenMissions();
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold">{language === 'bn' ? 'বন্ধুদের আমন্ত্রণ করুন' : 'Invite Friends'}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-300 font-black border border-emerald-400/30">
                          ৳300
                        </span>
                      </button>

                      <button
                        onClick={() => { 
                          setShowUserMenu(false); 
                          if (onOpenMissions) onOpenMissions(); 
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <Target className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold">{language === 'bn' ? 'মিশন' : 'Mission'}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-yellow-400/20 text-yellow-300 font-black border border-yellow-400/30">
                          {language === 'bn' ? 'নতুন' : 'NEW'}
                        </span>
                      </button>

                      <button
                        onClick={() => { 
                          setShowUserMenu(false); 
                          if (onOpenMessages) {
                            onOpenMessages();
                          } else if (onOpenNotice) {
                            onOpenNotice();
                          }
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-gray-200 hover:text-white bg-[#0a3525] hover:bg-[#0f4d36] rounded-xl flex items-center justify-between border border-[#166043] transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="font-bengali font-bold">{language === 'bn' ? 'অভ্যন্তরীণ বার্তা' : 'Internal Messages'}</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      </button>
                    </div>

                    <div className="my-1.5 border-t border-[#14593e]" />

                    <button
                      onClick={() => { setShowUserMenu(false); onLogout(); }}
                      className="w-full text-left px-3 py-2 text-xs font-black text-rose-300 hover:text-white hover:bg-rose-950/60 rounded-xl flex items-center gap-2.5 transition-colors border border-rose-800/30 cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-bengali">{language === 'bn' ? 'সাইন আউট (লগআউট)' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Guest State: Mobile vs Desktop */
          <>
            {/* Mobile View Buttons matching Capture.PNG */}
            <div className="flex md:hidden items-center gap-1 xs:gap-1.5 shrink-0">
              {/* Quick Google Login Icon */}
              <button
                id="header-mobile-google-btn"
                onClick={onOpenLogin}
                className="w-6.5 h-6.5 xs:w-7 xs:h-7 rounded-full bg-white flex items-center justify-center shadow-xs border border-gray-200 active:scale-95 transition-transform shrink-0 cursor-pointer"
                title={language === 'bn' ? 'Google দিয়ে সাইন ইন করুন' : 'Sign in with Google'}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </button>

              {/* Teal Pill Register Button with anchored 3D Gift emoji */}
              <button
                id="header-mobile-register-btn"
                onClick={onOpenRegister}
                className="relative px-2.5 py-1 xs:px-3 rounded-full bg-gradient-to-r from-[#0d6e4f] to-[#128a64] hover:from-[#117f5c] hover:to-[#179f74] border border-[#20a37b] text-white text-[11px] xs:text-xs font-black shadow-md flex items-center gap-1 active:scale-95 transition-transform shrink-0 whitespace-nowrap"
              >
                <span className="text-[11px] xs:text-xs">🎁</span>
                <span>{language === 'bn' ? 'নিবন্ধন' : 'Sign Up'}</span>
              </button>

              {/* Gold Pill Login Button */}
              <button
                id="header-mobile-login-btn"
                onClick={onOpenLogin}
                className="px-2.5 py-1 xs:px-3.5 rounded-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-black text-[11px] xs:text-xs font-black shadow-md border border-yellow-200 active:scale-95 transition-transform shrink-0 whitespace-nowrap"
              >
                {language === 'bn' ? 'লগইন' : 'Login'}
              </button>
            </div>

            {/* Desktop View Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                id="header-google-login-btn"
                onClick={onOpenLogin}
                className="px-2.5 py-1 sm:py-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-bold border border-gray-300 shadow-sm transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title={language === 'bn' ? 'Google দিয়ে লগইন করুন' : 'Sign in with Google'}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="hidden xl:inline">{language === 'bn' ? 'Google লগইন' : 'Google'}</span>
              </button>

              <button
                id="header-login-btn"
                onClick={onOpenLogin}
                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-md bg-[#166534] hover:bg-[#15803d] text-white text-xs sm:text-sm font-semibold border border-[#22c55e]/40 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {language === 'bn' ? 'লগইন' : 'Login'}
              </button>
              <button
                id="header-register-btn"
                onClick={onOpenRegister}
                className="btn-bdt-gold px-3 sm:px-4 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {language === 'bn' ? 'নিবন্ধন করুন' : 'Sign Up'}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
