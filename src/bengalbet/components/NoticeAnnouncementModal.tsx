// @ts-nocheck
/**
 * BengalBet Official Announcement & Notice Modal
 * Features:
 * - Tabbed carousel for system announcements, promotion highlights, and VIP updates
 * - Swipe gestures for mobile & auto-cycling timer with pause control
 * - "Don't show today" persistence in local storage
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronRight, ChevronLeft, Bell, Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { Language } from '../types';

import noticeOfficial from '../assets/images/bn_notice_official_1790010513305.jpg';
import noticeRebate from '../assets/images/bn_notice_rebate_1790010529061.jpg';
import noticeMemberDay from '../assets/images/bn_notice_member_day_1790010543368.jpg';
import noticeVipClub from '../assets/images/bn_notice_vip_club_1790010555851.jpg';
import noticePartner from '../assets/images/bn_notice_partner_1790010575654.jpg';
import noticeMystery from '../assets/images/bn_notice_mystery_1790010600259.jpg';
import noticeDailyLogin from '../assets/images/bn_notice_daily_login_1790010613724.jpg';
import { api } from '../services/api';
import { LiveRewardArtwork } from './LiveRewardArtwork';

interface NoticeAnnouncementModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onOpenDeposit?: () => void;
  onOpenVip?: () => void;
  onOpenSpin?: () => void;
  onOpenShare?: () => void;
}

interface NoticeItem {
  id: string;
  shortBn: string;
  shortEn: string;
  titleBn: string;
  titleEn: string;
  imageUrl: string;
  bodyBn?: string;
  bodyEn?: string;
  badgeBn?: string;
  badgeEn?: string;
  actionTextBn?: string;
  actionTextEn?: string;
  onAction?: () => void;
}

export const NoticeAnnouncementModal: React.FC<NoticeAnnouncementModalProps> = ({
  isOpen,
  language,
  onClose,
  onOpenDeposit,
  onOpenVip,
  onOpenSpin,
  onOpenShare
}) => {
  const [selectedNoticeId, setSelectedNoticeId] = useState<string>('bengalbet-announcement');
  const [adminNotice, setAdminNotice] = useState<any>(null);
  useEffect(() => {
    if (!isOpen) return;
    let alive = true;
    api.settings.getPublicSettings().then((r: any) => {
      const n = r?.settings?.siteNotice;
      if (!alive || !n) return;
      setAdminNotice(n);
      if (n.enabled && (n.titleBn || n.titleEn)) setSelectedNoticeId('admin-notice');
    }).catch(() => {});
    return () => { alive = false; };
  }, [isOpen]);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Responsive window resize tracker
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
      localStorage.setItem('bengalbet_hide_notice_today', new Date().toDateString());
    }
    onClose();
  };

  const notices: NoticeItem[] = [
    {
      id: 'bengalbet-announcement',
      shortBn: '📢 বেঙ্গলবেট অফিশিয়াল নোটিশ',
      shortEn: '📢 BengalBet Official Notice',
      titleBn: '📢 বেঙ্গলবেট অফিশিয়াল নোটিশ ও জরুরি আপডেট',
      titleEn: '📢 BengalBet Official Platform Notice & Update',
      badgeBn: 'গুরুত্বপূর্ণ',
      badgeEn: 'OFFICIAL',
      imageUrl: noticeOfficial,
      actionTextBn: 'ডিপোজিট করুন',
      actionTextEn: 'Deposit Now',
      onAction: onOpenDeposit
    },
    {
      id: 'realtime-rebate',
      shortBn: '⚡ রিয়েল-টাইম রিবেট',
      shortEn: '⚡ Real-Time Rebate',
      titleBn: '⚡ প্রতিটি বাজিতে রিয়েল-টাইম রিবেট, যতবার খুশি দাবি',
      titleEn: '⚡ Real-Time Rebate on Every Bet, Claim Anytime',
      badgeBn: 'হট বোনাস',
      badgeEn: 'HOT',
      imageUrl: noticeRebate,
      actionTextBn: 'এখনই খেলুন ও রিবেট পান',
      actionTextEn: 'Play Now & Earn Rebate',
      onAction: onClose
    },
    {
      id: 'member-day',
      shortBn: '👑 সদস্য দিবস',
      shortEn: '👑 Member Day',
      titleBn: '👑 সদস্য দিবস বোনাস',
      titleEn: '👑 Member Day Bonus',
      badgeBn: 'মেম্বার ডে',
      badgeEn: 'MEMBER DAY',
      imageUrl: noticeMemberDay,
      actionTextBn: 'ভিআইপি সেন্টারে যান',
      actionTextEn: 'Go to VIP Center',
      onAction: onOpenVip
    },
    {
      id: 'vip-members',
      shortBn: '💎 ভিআইপি ক্লাব সুবিধা',
      shortEn: '💎 VIP Club Privileges',
      titleBn: '💎 ভিআইপি ক্লাব এক্সক্লুসিভ সুযোগ-সুবিধা ও লাক্সারি প্রাইজ',
      titleEn: '💎 Exclusive VIP Club Privileges & Luxury Rewards',
      badgeBn: 'ভিআইপি ক্লাব',
      badgeEn: 'VIP CLUB',
      imageUrl: noticeVipClub,
      actionTextBn: 'ভিআইপি লেভেল দেখুন',
      actionTextEn: 'Check VIP Level',
      onAction: onOpenVip
    },
    {
      id: 'partner-reward',
      shortBn: '🤝 এজেন্ট ও পার্টনার কমিশন',
      shortEn: '🤝 Agent & Partner Commission',
      titleBn: '🤝 এজেন্ট ও পার্টনার আজীবন আকর্ষণীয় কমিশন',
      titleEn: '🤝 Lifetime Agent & Partner Commissions',
      badgeBn: 'আজীবন কমিশন',
      badgeEn: 'PARTNER',
      imageUrl: noticePartner,
      actionTextBn: 'বন্ধুদের ইনভাইট করুন',
      actionTextEn: 'Invite Friends Now',
      onAction: onOpenShare
    },
    {
      id: 'mystery-bonus',
      shortBn: '🎁 মাসিক রহস্যময় পুরস্কার',
      shortEn: '🎁 Monthly Mystery Reward',
      titleBn: '🎁 প্রতি মাসে একবার রহস্যময় নগদ পুরস্কার',
      titleEn: '🎁 Once-a-Month Mystery Cash Reward',
      badgeBn: 'মাসিক',
      badgeEn: 'MYSTERY',
      imageUrl: noticeMystery,
      actionTextBn: 'ডিপোজিট করে যোগ্যতা অর্জন করুন',
      actionTextEn: 'Deposit to Qualify',
      onAction: onOpenDeposit
    },
    {
      id: 'daily-login',
      shortBn: '🔥 দৈনিক লগইন হাতুড়ি',
      shortEn: '🔥 Daily Login Hammer',
      titleBn: '🔥 দৈনিক লগইন হাতুড়ি ও সোনার ডিম',
      titleEn: '🔥 Daily Login Hammer & Golden Eggs',
      badgeBn: 'দৈনিক',
      badgeEn: 'DAILY',
      imageUrl: noticeDailyLogin,
      actionTextBn: 'ডিপোজিট করে যোগ্যতা অর্জন করুন',
      actionTextEn: 'Deposit to Qualify',
      onAction: onOpenDeposit
    }
  ];
  // Admin-edited notice (Site Notice tab) is shown first when enabled
  if (adminNotice?.enabled && (adminNotice.titleBn || adminNotice.titleEn)) {
    notices.unshift({
      id: 'admin-notice',
      shortBn: adminNotice.titleBn || adminNotice.titleEn,
      shortEn: adminNotice.titleEn || adminNotice.titleBn,
      titleBn: adminNotice.titleBn || adminNotice.titleEn,
      titleEn: adminNotice.titleEn || adminNotice.titleBn,
      bodyBn: adminNotice.contentBn || '',
      bodyEn: adminNotice.contentEn || '',
      badgeBn: 'নতুন', badgeEn: 'NEW',
      imageUrl: adminNotice.bannerImage || noticeOfficial,
      actionTextBn: 'ডিপোজিট করুন', actionTextEn: 'Deposit Now',
      onAction: onOpenDeposit,
    });
  }

  const currentIndex = notices.findIndex(n => n.id === selectedNoticeId);
  const activeNotice = notices[currentIndex !== -1 ? currentIndex : 0];

  const handlePrevNotice = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    const prevIdx = currentIndex <= 0 ? notices.length - 1 : currentIndex - 1;
    setSelectedNoticeId(notices[prevIdx].id);
  };

  const handleNextNotice = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    const nextIdx = currentIndex >= notices.length - 1 ? 0 : currentIndex + 1;
    setSelectedNoticeId(notices[nextIdx].id);
  };

  // Auto-slide effect for mobile view
  useEffect(() => {
    if (!isOpen || !isMobile || isPaused) return;

    const intervalTime = 4000; // 4 seconds auto slide
    const timer = setInterval(() => {
      setSelectedNoticeId((prevId) => {
        const idx = notices.findIndex((n) => n.id === prevId);
        const nextIdx = idx >= notices.length - 1 ? 0 : (idx === -1 ? 0 : idx + 1);
        return notices[nextIdx].id;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isMobile, isPaused, selectedNoticeId, notices.length]);

  // Touch gestures for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartXRef.current - endX;
    const diffY = (touchStartYRef.current ?? endY) - endY;

    // Horizontal swipe threshold
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        handleNextNotice();
      } else {
        handlePrevNotice();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  if (!isOpen) return null;

  return (
    <div 
      id="notice-announcement-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 xs:p-3 sm:p-5 bg-black/85 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        id="notice-announcement-modal-dialog"
        className="relative w-full max-w-[860px] bg-gradient-to-b from-[#072f20] via-[#052317] to-[#031910] border-2 border-[#1c6b4d] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Clean, elegant casino styling matching screenshot */}
        <div className="relative px-3.5 sm:px-6 py-3 bg-gradient-to-r from-[#031d13] via-[#062c1e] to-[#031d13] border-b border-[#165e41] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black italic text-white font-serif tracking-wider drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)] truncate">
              {language === 'bn' ? 'ঘোষণা' : 'Announcement'}
            </h2>
            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-yellow-500 to-amber-400 text-black shadow font-sans tracking-wide shrink-0">
              BENGALBET OFFICIAL
            </span>
          </div>

          <button
            id="close-notice-announcement-btn"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#083524] hover:bg-[#0f4e35] border border-emerald-500/40 text-emerald-300 hover:text-yellow-300 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
            aria-label="Close Notice Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body: Dual-column Layout for Desktop, Streamlined View for Mobile */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Notice List Sidebar (Desktop) / Mobile 1-by-1 Switcher Controller */}
          <div 
            id="notice-sidebar-list"
            className="w-full md:w-64 lg:w-72 bg-[#041a12] md:border-r border-b md:border-b-0 border-[#14593e] shrink-0 flex flex-col"
          >
            {/* Mobile View: 1-by-1 Switcher Controller Header */}
            <div className="flex md:hidden items-center justify-between px-3 py-2 bg-[#052317] gap-2 border-b border-[#14593e]/70">
              <button
                id="notice-mobile-prev-btn"
                type="button"
                onClick={(e) => handlePrevNotice(e)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0a3f2b] hover:bg-[#0e5238] border border-[#27a877] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer shrink-0 shadow"
                aria-label="Previous notice"
              >
                <ChevronLeft className="w-4 h-4 text-yellow-400" />
                <span className="font-bengali text-[11px]">{language === 'bn' ? 'আগের' : 'Prev'}</span>
              </button>

              <div className="flex flex-col items-center justify-center min-w-0 px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-400">
                  <span>{currentIndex + 1} / {notices.length}</span>
                  {!isPaused && (
                    <span className="flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping inline-block" />
                      AUTO
                    </span>
                  )}
                </div>
                {/* Dots indicator for 1-by-1 notices */}
                <div className="flex items-center gap-1 mt-1">
                  {notices.map((n, idx) => (
                    <button
                      key={n.id}
                      onClick={() => setSelectedNoticeId(n.id)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentIndex
                          ? 'w-5 bg-gradient-to-r from-yellow-400 to-amber-300 shadow-[0_0_6px_#facc15]'
                          : 'w-1.5 bg-emerald-700/80 hover:bg-emerald-500'
                      }`}
                      aria-label={`Go to notice ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <button
                id="notice-mobile-next-btn"
                type="button"
                onClick={(e) => handleNextNotice(e)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0a3f2b] hover:bg-[#0e5238] border border-[#27a877] text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform cursor-pointer shrink-0 shadow"
                aria-label="Next notice"
              >
                <span className="font-bengali text-[11px]">{language === 'bn' ? 'পরের' : 'Next'}</span>
                <ChevronRight className="w-4 h-4 text-yellow-400" />
              </button>
            </div>

            {/* Desktop View: Full Vertical Sidebar List of Notices */}
            <div className="hidden md:flex md:flex-col p-2.5 sm:p-3 overflow-y-auto no-scrollbar gap-1.5 max-h-[520px]">
              <div className="px-1.5 py-1 text-[11px] font-bold text-emerald-400/80 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-yellow-400" />
                <span>{language === 'bn' ? 'সকল নোটিশ সমূহ' : 'All Announcements'}</span>
              </div>

              {notices.map((item, idx) => {
                const isSelected = item.id === selectedNoticeId;
                return (
                  <button
                    key={item.id}
                    id={`notice-item-${item.id}`}
                    onClick={() => setSelectedNoticeId(item.id)}
                    className={`
                      relative w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between group
                      ${isSelected
                        ? 'bg-gradient-to-r from-[#0d4f36] to-[#093726] text-white border border-[#2ec98e]/70 shadow-lg shadow-emerald-950/80 font-bold'
                        : 'text-emerald-200/80 hover:bg-[#072a1e] hover:text-white border border-transparent'
                      }
                    `}
                  >
                    {/* Left Golden Indicator Bar if active */}
                    {isSelected && (
                      <span className="absolute left-1 top-2 bottom-2 w-1.5 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-full shadow-[0_0_8px_#facc15]" />
                    )}

                    <div className={`min-w-0 flex-1 ${isSelected ? 'pl-2' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[11px] leading-tight truncate ${isSelected ? 'text-yellow-300 font-bold' : 'group-hover:text-white'}`}>
                          {language === 'bn' ? item.shortBn : item.shortEn}
                        </span>
                      </div>
                      {item.badgeBn && (
                        <span className={`text-[9px] font-semibold mt-0.5 inline-block ${isSelected ? 'text-emerald-300' : 'text-emerald-500'}`}>
                          {language === 'bn' ? item.badgeBn : item.badgeEn}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 pl-1">
                      {isSelected ? (
                        <ChevronRight className="w-4 h-4 text-yellow-400 animate-pulse" />
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold">#{idx + 1}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area: Banner Display with Perfect X & Y Fit */}
          <div 
            id="notice-content-area"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 p-3 sm:p-5 overflow-y-auto no-scrollbar flex flex-col justify-between space-y-3 relative select-none bg-[#031910]"
          >
            <div className="space-y-3">
              {/* Mobile Auto-Slide Progress Bar */}
              {isMobile && (
                <div 
                  className="w-full h-1 bg-[#02110b] rounded-full overflow-hidden border border-emerald-900/60"
                  title={isPaused ? 'Auto-slide paused' : 'Auto-sliding'}
                >
                  <div 
                    key={`${selectedNoticeId}-${isPaused}`}
                    className={`h-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 rounded-full ${
                      !isPaused ? 'animate-notice-progress' : 'w-full opacity-60'
                    }`}
                  />
                </div>
              )}

              {/* Notice Title Header with Badge and Play/Pause */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-black text-yellow-400 tracking-wide flex items-center gap-2 truncate">
                  <Bell className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span className="truncate">{language === 'bn' ? activeNotice.titleBn : activeNotice.titleEn}</span>
                </h3>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mobile Play / Pause toggle button */}
                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setIsPaused(!isPaused)}
                      className="px-1.5 py-0.5 rounded-md bg-emerald-900/80 border border-emerald-600/50 text-[10px] font-bold text-yellow-300 flex items-center gap-1 cursor-pointer hover:bg-emerald-800 active:scale-95 transition-transform"
                      title={isPaused ? 'Resume Auto-Slide' : 'Pause Auto-Slide'}
                    >
                      {isPaused ? (
                        <>
                          <Play className="w-2.5 h-2.5 fill-yellow-300" />
                          <span className="text-[9px]">{language === 'bn' ? 'চালু' : 'Play'}</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-2.5 h-2.5 fill-yellow-300" />
                          <span className="text-[9px]">{language === 'bn' ? 'পজ' : 'Pause'}</span>
                        </>
                      )}
                    </button>
                  )}

                  {activeNotice.badgeBn && (
                    <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded bg-gradient-to-r from-yellow-400 to-amber-400 text-black shadow-md tracking-wider">
                      {language === 'bn' ? activeNotice.badgeBn : activeNotice.badgeEn}
                    </span>
                  )}
                </div>
              </div>

              {/* Main Official Announcement Graphic Image - 100% Fit on X & Y */}
              <div 
                id="notice-banner-wrapper"
                onClick={() => {
                  if (activeNotice.onAction) {
                    handleClose();
                    activeNotice.onAction();
                  }
                }}
                className={`relative w-full max-h-[460px] aspect-[16/10] sm:aspect-[16/10] rounded-xl overflow-hidden border border-emerald-500/50 shadow-2xl bg-black flex items-center justify-center ${
                  activeNotice.onAction ? 'cursor-pointer group' : ''
                }`}
                title={language === 'bn' ? 'ক্লিক করে অফার উপভোগ করুন' : 'Click to claim offer'}
              >
                {/* Desktop & Mobile overlay floating cycling arrows */}
                <button
                  type="button"
                  onClick={(e) => handlePrevNotice(e)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center border border-yellow-400/50 shadow-xl active:scale-95 z-20 cursor-pointer transition-all hover:border-yellow-400"
                  aria-label="Previous notice"
                >
                  <ChevronLeft className="w-5 h-5 text-yellow-400" />
                </button>

                {/* Banner Graphic Image: Fits completely on both X & Y axis without cutting Bengali text */}
                {activeNotice.id === 'admin-notice' ? <img
                  key={activeNotice.id}
                  id={`notice-image-${activeNotice.id}`}
                  src={activeNotice.imageUrl}
                  alt={language === 'bn' ? activeNotice.titleBn : activeNotice.titleEn}
                  className="w-full h-full object-contain block select-none transition-all duration-300 animate-in fade-in"
                  loading="eager"
                  style={{ maxHeight: '460px' }}
                /> : <LiveRewardArtwork type={({ 'realtime-rebate': 'rebate', 'member-day': 'member_day', 'vip-members': 'vip', 'partner-reward': 'referral', 'mystery-bonus': 'mystery', 'daily-login': 'golden_egg' } as Record<string, string>)[activeNotice.id] || 'deposit'} title={language === 'bn' ? activeNotice.titleBn : activeNotice.titleEn} />}

                <button
                  type="button"
                  onClick={(e) => handleNextNotice(e)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/75 hover:bg-black/95 text-white flex items-center justify-center border border-yellow-400/50 shadow-xl active:scale-95 z-20 cursor-pointer transition-all hover:border-yellow-400"
                  aria-label="Next notice"
                >
                  <ChevronRight className="w-5 h-5 text-yellow-400" />
                </button>

                {/* Bottom-right slide counter pill */}
                <div className="absolute bottom-2.5 right-2.5 bg-black/80 px-2 py-0.5 rounded-md border border-emerald-500/40 text-[10px] font-bold text-yellow-300 pointer-events-none z-10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>{currentIndex + 1} / {notices.length}</span>
                </div>
              </div>
            </div>
            {(activeNotice.bodyBn || activeNotice.bodyEn) && (
              <p className="text-sm text-emerald-100 whitespace-pre-wrap break-words">{language === 'bn' ? (activeNotice.bodyBn || activeNotice.bodyEn) : (activeNotice.bodyEn || activeNotice.bodyBn)}</p>
            )}

            {/* Action Buttons & Don't Show Again Footer */}
            <div className="pt-3 border-t border-[#14593e]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 text-emerald-200 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="w-4 h-4 rounded accent-yellow-400 bg-[#051c13] border-gray-600 cursor-pointer"
                />
                <span>{language === 'bn' ? 'আজ আর দেখাবেন না' : "Don't show again today"}</span>
              </label>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {activeNotice.onAction && activeNotice.actionTextBn && (
                  <button
                    id="notice-action-btn"
                    onClick={() => {
                      handleClose();
                      activeNotice.onAction?.();
                    }}
                    className="flex-1 sm:flex-initial btn-bdt-gold px-4 py-2 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
                  >
                    <span>{language === 'bn' ? activeNotice.actionTextBn : activeNotice.actionTextEn}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id="notice-dismiss-btn"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-[#083524] hover:bg-[#0e4e35] text-emerald-200 hover:text-white font-bold border border-[#1b6b4c] text-xs cursor-pointer active:scale-95 transition-all"
                >
                  {language === 'bn' ? 'ঠিক আছে' : 'Got it'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

