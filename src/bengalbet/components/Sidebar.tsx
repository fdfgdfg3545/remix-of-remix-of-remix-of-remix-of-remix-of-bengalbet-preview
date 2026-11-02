// @ts-nocheck
/**
 * BengalBet Left Navigation Sidebar
 * Features:
 * - Desktop sticky sidebar with smooth independent scrolling
 * - Mobile responsive drawer with sliding animation & backdrop
 * - Collapsible mini mode (icon bar) and full expanded mode
 * - 3D Golden Pills (Offers, Missions, Lucky Spin, Red Packet Rain, VIP Bonus, Share & Earn)
 * - Quick action icons (Home, Favorites, Profile)
 * - Accordion menus for Customer Support & Language Selector (Bengali / English)
 * - UI Developer credit: The UI Developed by Neext Hub (https://neexthub.ai.studio/)
 * - Full bilingual support (Bengali / English)
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Smartphone, 
  Headphones, 
  ChevronDown, 
  X,
  Gift,
  Trophy,
  Award,
  Share2,
  Globe,
  Code,
  ExternalLink
} from 'lucide-react';
import { Language } from '../types';

interface SidebarProps {
  language: Language;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
  activeView: 'lobby' | 'promotions' | 'category' | 'favorites';
  onClose: () => void;
  onNavigate: (view: 'lobby' | 'promotions' | 'favorites') => void;
  onOpenSpin: () => void;
  onOpenRedEnvelope: () => void;
  onOpenGoldenEgg?: () => void;
  onOpenMissions: () => void;
  onOpenRewardCenter?: (tab?: 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records') => void;
  onOpenVip: () => void;
  onOpenShare: () => void;
  onOpenMyAccount: () => void;
  onOpenAppDownload: () => void;
  onOpenSupport: () => void;
  onOpenSupportTicket?: () => void;
  onOpenDeposit?: () => void;
  onToggleLanguage: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  language,
  isOpen,
  isCollapsed,
  onToggleCollapse,
  activeView,
  onClose,
  onNavigate,
  onOpenSpin,
  onOpenRedEnvelope,
  onOpenGoldenEgg,
  onOpenMissions,
  onOpenRewardCenter,
  onOpenVip,
  onOpenShare,
  onOpenMyAccount,
  onOpenAppDownload,
  onOpenSupport,
  onOpenSupportTicket,
  onToggleLanguage
}) => {
  const [supportExpanded, setSupportExpanded] = useState(false);
  const [langExpanded, setLangExpanded] = useState(false);

  // Prevent background body scrolling while mobile drawer is open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 6 Golden pills for expanded view with 3D mini icons
  const mainPills = [
    {
      id: 'offers',
      labelBn: 'অফার',
      labelEn: 'Offers & Promos',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-gift-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="60%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="pill-gift-red" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          <rect x="4" y="11" width="16" height="10" rx="2" fill="url(#pill-gift-gold)" stroke="#854d0e" strokeWidth="0.6" />
          <rect x="3" y="8" width="18" height="4" rx="1.5" fill="url(#pill-gift-gold)" stroke="#a16207" strokeWidth="0.6" />
          <rect x="10" y="8" width="4" height="13" fill="url(#pill-gift-red)" />
          <rect x="3" y="9.5" width="18" height="1.5" fill="url(#pill-gift-red)" />
          <path d="M12 8 C9 5 5 5 7 8 Z" fill="url(#pill-gift-red)" />
          <path d="M12 8 C15 5 19 5 17 8 Z" fill="url(#pill-gift-red)" />
          <circle cx="12" cy="8" r="1.5" fill="#ef4444" />
        </svg>
      ),
      onClick: () => { onNavigate('promotions'); onClose(); },
      isActive: activeView === 'promotions'
    },
    {
      id: 'missions',
      labelBn: 'মিশন',
      labelEn: 'Missions & Tasks',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-trophy-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10.5" fill="#1e3a8a" stroke="#facc15" strokeWidth="1" />
          <path d="M8 7 L16 7 C16 12 14 14 12 14 C10 14 8 12 8 7 Z" fill="url(#pill-trophy-gold)" stroke="#78350f" strokeWidth="0.5" />
          <path d="M8 8.5 C6 8.5 6 12 8 12" fill="none" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M16 8.5 C18 8.5 18 12 16 12" fill="none" stroke="#facc15" strokeWidth="1.2" strokeLinecap="round" />
          <rect x="11" y="14" width="2" height="3" fill="#a16207" />
          <rect x="9" y="17" width="6" height="2" rx="0.5" fill="url(#pill-trophy-gold)" stroke="#78350f" strokeWidth="0.5" />
          <polygon points="12,8.5 12.6,9.8 14,10 13,11 13.3,12.3 12,11.6 10.7,12.3 11,11 10,10 11.4,9.8" fill="#ffffff" />
        </svg>
      ),
      onClick: () => { onOpenMissions(); onClose(); }
    },
    {
      id: 'spin',
      labelBn: 'লাকি স্পিন',
      labelEn: 'Lucky Spin Wheel',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <circle cx="12" cy="12" r="10.5" fill="#18181b" stroke="#facc15" strokeWidth="1.2" />
          <path d="M12 12 L12 2 A10 10 0 0 1 20.66 7 Z" fill="#ef4444" />
          <path d="M12 12 L20.66 7 A10 10 0 0 1 20.66 17 Z" fill="#f59e0b" />
          <path d="M12 12 L20.66 17 A10 10 0 0 1 12 22 Z" fill="#10b981" />
          <path d="M12 12 L12 22 A10 10 0 0 1 3.34 17 Z" fill="#3b82f6" />
          <path d="M12 12 L3.34 17 A10 10 0 0 1 3.34 7 Z" fill="#8b5cf6" />
          <path d="M12 12 L3.34 7 A10 10 0 0 1 12 2 Z" fill="#ec4899" />
          <circle cx="12" cy="12" r="3.5" fill="#facc15" stroke="#78350f" strokeWidth="0.8" />
          <circle cx="12" cy="12" r="1.5" fill="#dc2626" />
          <polygon points="12,1 10,4.5 14,4.5" fill="#fde047" stroke="#78350f" strokeWidth="0.6" />
        </svg>
      ),
      onClick: () => { 
        onOpenSpin();
        onClose(); 
      }
    },
    {
      id: 'redpacket',
      labelBn: 'লাল খামের বৃষ্টি',
      labelEn: 'Red Packet Rain',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-packet-red" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="gold-foil-trim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect x="5" y="3.5" width="14" height="17.5" rx="2.5" fill="url(#pill-packet-red)" stroke="#b91c1c" strokeWidth="0.8" />
          <rect x="6.2" y="4.7" width="11.6" height="15.1" rx="1.5" fill="none" stroke="url(#gold-foil-trim)" strokeWidth="0.5" strokeOpacity="0.8" />
          <path d="M5 4 C8 10 16 10 19 4" fill="#ef4444" stroke="url(#gold-foil-trim)" strokeWidth="1.2" />
          <rect x="11" y="9.5" width="2" height="10" fill="url(#gold-foil-trim)" />
          <polygon points="12,8.5 13.5,10 12,11.5 10.5,10" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
          <circle cx="8" cy="18" r="0.8" fill="#fde047" />
          <circle cx="16" cy="18" r="0.8" fill="#fde047" />
        </svg>
      ),
      onClick: () => { 
        onOpenRedEnvelope();
        onClose(); 
      }
    },
    {
      id: 'vip',
      labelBn: 'ভিআইপি বোনাস',
      labelEn: 'VIP Rewards',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-vip-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M5 8 L8 12 L12 6 L16 12 L19 8 L20 17 L4 17 Z" fill="url(#pill-vip-gold)" stroke="#78350f" strokeWidth="0.7" />
          <circle cx="12" cy="5.5" r="1.2" fill="#ef4444" />
          <circle cx="5" cy="7.5" r="0.9" fill="#3b82f6" />
          <circle cx="19" cy="7.5" r="0.9" fill="#10b981" />
          <rect x="4" y="17" width="16" height="2" rx="0.5" fill="#b45309" />
          <circle cx="8" cy="15" r="0.8" fill="#ffffff" />
          <circle cx="12" cy="14" r="0.8" fill="#ffffff" />
          <circle cx="16" cy="15" r="0.8" fill="#ffffff" />
        </svg>
      ),
      onClick: () => { onOpenVip(); onClose(); }
    },
    {
      id: 'reward_center',
      labelBn: 'পুরস্কার কেন্দ্র',
      labelEn: 'Reward Center',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-rwd-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M12 2 L15 8 L21 9 L17 14 L18 20 L12 17 L6 20 L7 14 L3 9 L9 8 Z" fill="url(#pill-rwd-gold)" stroke="#78350f" strokeWidth="0.8" />
          <circle cx="12" cy="11" r="2" fill="#ef4444" />
        </svg>
      ),
      onClick: () => { 
        if (onOpenRewardCenter) onOpenRewardCenter();
        else onOpenMissions();
        onClose(); 
      }
    },
    {
      id: 'share',
      labelBn: 'শেয়ার ও আয়',
      labelEn: 'Share & Earn',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5 filter drop-shadow-sm shrink-0">
          <defs>
            <linearGradient id="pill-share-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <rect x="3" y="6" width="18" height="12" rx="2" fill="url(#pill-share-gold)" stroke="#78350f" strokeWidth="0.7" />
          <line x1="8" y1="6" x2="8" y2="18" stroke="#854d0e" strokeWidth="0.8" strokeDasharray="1.2 1.2" />
          <line x1="16" y1="9.5" x2="12" y2="12" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="16" y1="14.5" x2="12" y2="12" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="11.5" cy="12" r="2" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.5" />
          <circle cx="16.5" cy="9" r="1.7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="0.5" />
          <circle cx="16.5" cy="15" r="1.7" fill="#10b981" stroke="#047857" strokeWidth="0.5" />
        </svg>
      ),
      onClick: () => { onOpenShare(); onClose(); }
    }
  ];

  return (
    <>
      {/* Backdrop overlay ONLY on mobile when drawer is open */}
      <div 
        id="sidebar-mobile-backdrop"
        className={`fixed inset-0 top-[48px] sm:top-[53px] lg:hidden bg-black/80 backdrop-blur-xs z-45 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="bengalbet-left-sidebar"
        className={`
          fixed lg:sticky top-[48px] sm:top-[53px] lg:top-[57px] bottom-0 lg:bottom-auto left-0 z-50 lg:z-10
          h-[calc(100vh-48px)] sm:h-[calc(100vh-53px)] lg:h-[calc(100vh-57px)]
          h-[calc(100dvh-48px)] sm:h-[calc(100dvh-53px)] lg:max-h-[calc(100vh-57px)]
          bg-gradient-to-b from-[#06291d] via-[#041d14] to-[#02140d]
          border-r border-[#0e5439]/70 shadow-[6px_0_28px_rgba(0,0,0,0.7)] lg:shadow-none
          transition-all duration-300 ease-in-out
          overflow-y-auto overscroll-contain touch-pan-y sidebar-scroll
          ${isOpen 
            ? 'translate-x-0 pointer-events-auto w-[275px] sm:w-72 max-w-[85vw] pt-2.5 pb-28 sm:pb-32 lg:pb-16 px-2.5 sm:px-3' 
            : '-translate-x-full lg:translate-x-0 pointer-events-none lg:pointer-events-auto'}
          ${isCollapsed ? 'lg:w-[68px] lg:py-2.5 lg:px-1.5' : 'lg:w-60 xl:w-68 lg:py-2.5 lg:px-2'}
        `}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* If Desktop is Collapsed, Render the Mini Icon Bar */}
        {isCollapsed ? (
          <div className="hidden lg:flex flex-col min-h-full justify-between items-center gap-1.5 pb-12">
            <div className="flex flex-col items-center gap-1.5 w-full">
              {/* Home Icon */}
              <button
                id="sidebar-mini-home"
                onClick={() => onNavigate('lobby')}
                title={language === 'bn' ? 'হোম লবি' : 'Home Lobby'}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                  activeView === 'lobby'
                    ? 'bg-gradient-to-b from-[#167852] to-[#0a452e] border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                    : 'bg-[#0b442e] border border-[#1d7754] hover:border-yellow-400/80 hover:bg-[#12583e]'
                }`}
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5 filter drop-shadow-md">
                  <path d="M16 3 L29 14 L26 15.5 L16 7.5 L6 15.5 L3 14 Z" fill="#facc15" />
                  <rect x="6" y="14" width="20" height="14" rx="2" fill="#34d399" stroke="#042f22" strokeWidth="0.8" />
                  <path d="M12 28 L12 18 C12 15.5 20 15.5 20 18 L20 28 Z" fill="#ca8a04" />
                </svg>
                <span className="text-[9px] font-bold text-emerald-200 mt-0.5 leading-none">
                  {language === 'bn' ? 'হোম' : 'Home'}
                </span>
              </button>

              {/* Favorites Heart */}
              <button
                id="sidebar-mini-favs"
                onClick={() => onNavigate('favorites')}
                title={language === 'bn' ? 'আমার সংগ্রহ' : 'Favorites'}
                className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                  activeView === 'favorites'
                    ? 'bg-gradient-to-b from-[#70163e] to-[#450a24] border-2 border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.45)]'
                    : 'bg-[#0b442e] border border-[#1d7754] hover:border-pink-400 hover:bg-[#12583e]'
                }`}
              >
                <svg viewBox="0 0 32 32" className="w-5 h-5 filter drop-shadow-md">
                  <path d="M16 27.5 C9.2 21.5 4 16.8 4 10.8 C4 6.8 7.4 4 11.5 4 C13.8 4 15.4 5.2 16 6 C16.6 5.2 18.2 4 20.5 4 C24.6 4 28 6.8 28 10.8 C28 16.8 22.8 21.5 16 27.5 Z" fill="#e11d48" stroke="#9f1239" strokeWidth="0.8" />
                </svg>
                <span className="text-[9px] font-bold text-pink-200 mt-0.5 leading-none">
                  {language === 'bn' ? 'সংগ্রহ' : 'Favs'}
                </span>
              </button>

              {/* Account/Profile Coin */}
              <button
                id="sidebar-mini-profile"
                onClick={onOpenMyAccount}
                title={language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                className="w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-[#0b442e] border border-[#1d7754] hover:border-yellow-400 hover:bg-[#12583e] transition-all cursor-pointer"
              >
                <User className="w-5 h-5 text-yellow-400" />
                <span className="text-[9px] font-bold text-yellow-200 mt-0.5 leading-none">
                  {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                </span>
              </button>

              {/* 6 Golden Mini Buttons */}
              <div className="w-full flex flex-col items-center gap-1.5 pt-1.5 border-t border-[#146344]">
                {mainPills.map(pill => (
                  <button
                    key={pill.id}
                    onClick={pill.onClick}
                    title={language === 'bn' ? pill.labelBn : pill.labelEn}
                    className="w-11 h-10 flex items-center justify-center rounded-lg btn-bdt-gold cursor-pointer transition-transform hover:scale-105 shadow-sm"
                  >
                    {pill.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Tools on Mini Sidebar */}
            <div className="flex flex-col items-center gap-1.5 w-full pt-2 border-t border-[#146344]">
              <button
                id="sidebar-mini-app-btn"
                onClick={onOpenAppDownload}
                title={language === 'bn' ? 'অ্যাপ্লিকেশন ডাউনলোড' : 'Download App'}
                className="w-11 h-10 flex flex-col items-center justify-center rounded-xl bg-[#0b442e] border border-[#1d7754] text-emerald-300 hover:text-yellow-300 hover:bg-[#0e583e] transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                id="sidebar-mini-support-btn"
                onClick={onOpenSupport}
                title={language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Support'}
                className="w-11 h-10 flex flex-col items-center justify-center rounded-xl bg-[#0b442e] border border-[#1d7754] text-emerald-300 hover:text-yellow-300 hover:bg-[#0e583e] transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
              </button>
              {/* Vasa / Language Button for Mini Sidebar */}
              <button
                id="sidebar-mini-language-btn"
                onClick={onToggleLanguage}
                title={language === 'bn' ? 'ভাষা পরিবর্তন করুন (বাংলা / English)' : 'Switch Language (Bengali / English)'}
                className="w-11 h-11 flex flex-col items-center justify-center rounded-xl bg-[#0b442e] border border-[#1d7754] hover:border-yellow-400 hover:bg-[#12583e] text-emerald-200 hover:text-yellow-300 transition-all cursor-pointer group"
              >
                <Globe className="w-4 h-4 text-emerald-300 group-hover:text-yellow-300 transition-colors" />
                <span className="text-[9px] font-black text-yellow-300 mt-0.5 leading-none">
                  {language === 'bn' ? 'ভাষা' : 'Lang'}
                </span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Expanded View: shown on mobile drawer OR when desktop is expanded (!isCollapsed) */}
        <div className={`flex flex-col gap-3 pb-16 sm:pb-20 lg:pb-12 ${isCollapsed ? 'lg:hidden' : 'flex'}`}>
          <div className="flex flex-col gap-2.5 shrink-0">
            {/* Desktop Top Header Bar: Language ("ভাষা") Quick Bar */}
            <div 
              id="sidebar-desktop-language-bar"
              className="flex items-center justify-between px-2.5 py-1.5 bg-gradient-to-r from-[#052b1e] via-[#08422e] to-[#052b1e] rounded-xl border border-[#17734e]/80 shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-200">
                <Globe className="w-3.5 h-3.5 text-yellow-400" />
                <span className="tracking-wide">{language === 'bn' ? 'ভাষা নির্বাচন:' : 'Language:'}</span>
              </div>
              <div className="flex items-center bg-[#021d13] p-0.5 rounded-lg border border-[#146344]">
                <button
                  type="button"
                  id="sidebar-quick-lang-bn"
                  onClick={() => { if (language !== 'bn') onToggleLanguage(); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'bn'
                      ? 'bg-gradient-to-r from-[#1b8058] to-[#12583c] text-yellow-300 shadow-xs border border-yellow-400/50'
                      : 'text-emerald-300 hover:text-white'
                  }`}
                  title="বাংলা নির্বাচন করুন"
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  id="sidebar-quick-lang-en"
                  onClick={() => { if (language !== 'en') onToggleLanguage(); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-[#1b8058] to-[#12583c] text-yellow-300 shadow-xs border border-yellow-400/50'
                      : 'text-emerald-300 hover:text-white'
                  }`}
                  title="Select English"
                >
                  English
                </button>
              </div>
            </div>

            {/* Top 3 Quick Icon Bar (Home, Favorite Heart, Coin Profile) */}
            <div 
              id="sidebar-top-icons"
              className="grid grid-cols-3 gap-1.5 p-1.5 bg-gradient-to-b from-[#063323] via-[#04281b] to-[#021d13] rounded-xl border border-[#17734e]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)]"
            >
              {/* 1. Home Palace Icon */}
              <button
                id="sidebar-home-btn"
                onClick={() => { onNavigate('lobby'); onClose(); }}
                className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeView === 'lobby' 
                    ? 'bg-gradient-to-b from-[#167852] via-[#105e40] to-[#0a452e] border-2 border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)] scale-102' 
                    : 'bg-gradient-to-b from-[#0d4c34] to-[#062c1e] border border-[#1d7754] hover:border-yellow-400/80 hover:shadow-md hover:scale-105'
                }`}
                title={language === 'bn' ? 'হোম লবি' : 'Home Lobby'}
              >
                <svg viewBox="0 0 32 32" className="w-6 h-6 filter drop-shadow-md transition-transform group-hover:scale-110">
                  <defs>
                    <linearGradient id="exp-home-roof" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="45%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="exp-home-wall" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>
                    <linearGradient id="exp-home-door" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                  </defs>
                  <path d="M16 3 L29 14 L26 15.5 L16 7.5 L6 15.5 L3 14 Z" fill="url(#exp-home-roof)" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.5))" />
                  <rect x="6" y="14" width="20" height="14" rx="2" fill="url(#exp-home-wall)" stroke="#042f22" strokeWidth="0.8" />
                  <path d="M12 28 L12 18 C12 15.5 20 15.5 20 18 L20 28 Z" fill="url(#exp-home-door)" stroke="#78350f" strokeWidth="0.6" />
                  <circle cx="13.5" cy="22.5" r="0.8" fill="#78350f" />
                  <rect x="8" y="17" width="2.5" height="3.5" rx="0.5" fill="#fef08a" stroke="#047857" strokeWidth="0.4" />
                  <rect x="21.5" y="17" width="2.5" height="3.5" rx="0.5" fill="#fef08a" stroke="#047857" strokeWidth="0.4" />
                  <polygon points="16,1 17,2.8 19,3.2 17.5,4.5 18,6.2 16,5.2 14,6.2 14.5,4.5 13,3.2 15,2.8" fill="#ffffff" />
                </svg>
                <span className={`text-[10px] font-black mt-1 leading-none transition-colors ${activeView === 'lobby' ? 'text-yellow-300 font-extrabold' : 'text-emerald-200 group-hover:text-yellow-300'}`}>
                  {language === 'bn' ? 'হোম' : 'Home'}
                </span>
              </button>

              {/* 2. Favorite Faceted Ruby Heart Icon */}
              <button
                id="sidebar-favorites-btn"
                onClick={() => { onNavigate('favorites'); onClose(); }}
                className={`group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                  activeView === 'favorites'
                    ? 'bg-gradient-to-b from-[#70163e] via-[#5c1033] to-[#450a24] border-2 border-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.45)] scale-102'
                    : 'bg-gradient-to-b from-[#0d4c34] to-[#062c1e] border border-[#1d7754] hover:border-pink-400/80 hover:shadow-md hover:scale-105'
                }`}
                title={language === 'bn' ? 'আমার সংগ্রহ' : 'Favorites'}
              >
                <svg viewBox="0 0 32 32" className="w-6 h-6 filter drop-shadow-md transition-transform group-hover:scale-110">
                  <defs>
                    <linearGradient id="exp-heart-ruby" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="35%" stopColor="#e11d48" />
                      <stop offset="85%" stopColor="#be123c" />
                      <stop offset="100%" stopColor="#881337" />
                    </linearGradient>
                    <linearGradient id="exp-heart-facet" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M16 29 C8.5 22.5 3 17.5 3 10.8 C3 6.2 6.8 3 11.5 3 C14 3 15.8 4.2 16 5 C16.2 4.2 18 3 20.5 3 C25.2 3 29 6.2 29 10.8 C29 17.5 23.5 22.5 16 29 Z" 
                    fill="#fbbf24" 
                    opacity="0.35"
                  />
                  <path 
                    d="M16 27.5 C9.2 21.5 4 16.8 4 10.8 C4 6.8 7.4 4 11.5 4 C13.8 4 15.4 5.2 16 6 C16.6 5.2 18.2 4 20.5 4 C24.6 4 28 6.8 28 10.8 C28 16.8 22.8 21.5 16 27.5 Z" 
                    fill="url(#exp-heart-ruby)" 
                    stroke="#9f1239" 
                    strokeWidth="0.8" 
                  />
                  <path 
                    d="M11.5 5.5 C8 5.5 6 7.8 6 10.8 C6 13 7.5 15.8 11.5 19 C10.5 16 9 13 10 9 C10.5 7.5 11.5 6 11.5 5.5 Z" 
                    fill="url(#exp-heart-facet)" 
                  />
                  <circle cx="9.5" cy="8" r="1.3" fill="#ffffff" opacity="0.9" />
                  <polygon points="23,5 24,7 26,7.5 24,8.5 24.5,10.5 23,9.5 21.5,10.5 22,8.5 20,7.5 22,7" fill="#ffffff" />
                </svg>
                <span className={`text-[10px] font-black mt-1 leading-none transition-colors ${activeView === 'favorites' ? 'text-pink-300 font-extrabold' : 'text-emerald-200 group-hover:text-pink-300'}`}>
                  {language === 'bn' ? 'সংগ্রহ' : 'Favs'}
                </span>
              </button>

              {/* 3. 3D Thick Gold Coin Profile Icon */}
              <button
                id="sidebar-golden-egg-btn"
                onClick={() => { 
                  onOpenMyAccount(); 
                  onClose(); 
                }}
                className="group flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 cursor-pointer bg-gradient-to-b from-[#0d4c34] to-[#062c1e] border border-[#1d7754] hover:border-yellow-400 hover:shadow-[0_0_14px_rgba(250,204,21,0.5)] hover:scale-105 active:scale-95"
                title={language === 'bn' ? 'আমার অ্যাকাউন্ট (প্রোফাইল)' : 'My Account (Profile & Coins)'}
              >
                <svg viewBox="0 0 32 32" className="w-6 h-6 filter drop-shadow-md transition-transform group-hover:scale-110">
                  <defs>
                    <linearGradient id="exp-coin-edge" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ca8a04" />
                      <stop offset="50%" stopColor="#78350f" />
                      <stop offset="100%" stopColor="#451a03" />
                    </linearGradient>
                    <linearGradient id="exp-coin-face" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="25%" stopColor="#fde047" />
                      <stop offset="60%" stopColor="#eab308" />
                      <stop offset="90%" stopColor="#ca8a04" />
                      <stop offset="100%" stopColor="#854d0e" />
                    </linearGradient>
                    <linearGradient id="exp-coin-rim" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fef9c3" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="16" cy="18" rx="13" ry="11.5" fill="url(#exp-coin-edge)" />
                  <path d="M3 15 L3 18 M6 20 L6 22 M10 24 L10 26 M16 26.5 L16 29.5 M22 24 L22 26 M26 20 L26 22 M29 15 L29 18" stroke="#facc15" strokeWidth="1" strokeLinecap="round" />
                  <ellipse cx="16" cy="15" rx="13" ry="11.5" fill="url(#exp-coin-face)" stroke="#fef08a" strokeWidth="0.8" />
                  <ellipse cx="16" cy="15" rx="10.5" ry="9" fill="none" stroke="url(#exp-coin-rim)" strokeWidth="0.8" strokeDasharray="1.5 1.2" />
                  <g transform="translate(16, 15) scale(0.95) translate(-16, -15)">
                    <text x="16.5" y="19" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="sans-serif" fill="#78350f">৳</text>
                    <text x="16" y="18" textAnchor="middle" fontSize="13" fontWeight="900" fontFamily="sans-serif" fill="#fef9c3">৳</text>
                  </g>
                  <path d="M7 12 C9 8.5 14 7 19 8" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
                  <polygon points="24,7 25,9 27,9.5 25,10.5 25.5,12 24,11 22.5,12 23,10.5 21,9.5 23,9" fill="#ffffff" />
                </svg>
                <span className="text-[10px] font-black mt-1 leading-none text-emerald-200 group-hover:text-yellow-300 transition-colors">
                  {language === 'bn' ? 'প্রোফাইল' : 'Profile'}
                </span>
              </button>
            </div>

            {/* The 6 Golden 3D Buttons */}
            <nav id="sidebar-main-nav" className="flex flex-col gap-1.5 pt-0.5">
              {mainPills.map((pill) => (
                <button
                  key={pill.id}
                  id={`sidebar-pill-${pill.id}`}
                  onClick={pill.onClick}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-[13px] font-black btn-bdt-gold cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                >
                  <span className="shrink-0 text-base">{pill.icon}</span>
                  <span className="font-extrabold tracking-wide text-stone-900 drop-shadow-xs">
                    {language === 'bn' ? pill.labelBn : pill.labelEn}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Secondary Navigation Section */}
          <div id="sidebar-secondary-nav" className="flex flex-col gap-1 pt-3 border-t border-[#146344] shrink-0">
            {/* My Account */}
            <button
              id="sidebar-my-account-btn"
              onClick={() => { onOpenMyAccount(); onClose(); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-100 hover:bg-[#0e583e] hover:text-yellow-300 transition-colors text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-emerald-300" />
              <span>{language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}</span>
            </button>

            {/* Reward Center */}
            <button
              id="sidebar-reward-center-menu-btn"
              onClick={() => { 
                if (onOpenRewardCenter) onOpenRewardCenter();
                else onOpenMissions();
                onClose(); 
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-yellow-200 bg-gradient-to-r from-emerald-950/60 via-[#104e38] to-transparent hover:bg-[#0e583e] hover:text-yellow-300 transition-all text-left cursor-pointer border border-emerald-500/30"
            >
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-amber-300" />
                <span>{language === 'bn' ? 'পুরস্কার কেন্দ্র' : 'Reward Center'}</span>
              </div>
              <span className="text-[10px] font-black text-rose-200 bg-rose-900/80 px-1.5 py-0.5 rounded border border-rose-400/40">
                {language === 'bn' ? '৩টি নতুন' : '3 New'}
              </span>
            </button>

            {/* Golden Egg Button */}
            {onOpenGoldenEgg && (
              <button
                id="sidebar-golden-egg-menu-btn"
                onClick={() => { onOpenGoldenEgg(); onClose(); }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-yellow-200 bg-gradient-to-r from-amber-950/40 via-[#114b35] to-transparent hover:bg-[#0e583e] hover:text-yellow-300 transition-all text-left cursor-pointer border border-amber-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm leading-none">🥚</span>
                  <span>{language === 'bn' ? 'সোনার ডিম পুরস্কার' : 'Golden Egg Bonus'}</span>
                </div>
                <span className="text-[10px] font-black text-amber-300 bg-amber-900/80 px-1.5 py-0.5 rounded border border-amber-400/40">
                  {language === 'bn' ? '৳১৮,২২২' : '৳18,222'}
                </span>
              </button>
            )}

            {/* Download Application */}
            <button
              id="sidebar-download-app-btn"
              onClick={() => { onOpenAppDownload(); onClose(); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-100 hover:bg-[#0e583e] hover:text-yellow-300 transition-colors text-left cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>{language === 'bn' ? 'অ্যাপ্লিকেশন ডাউনলোড' : 'Download Application'}</span>
            </button>

            {/* Customer Service Accordion */}
            <div className="flex flex-col">
              <button
                id="sidebar-support-accordion-btn"
                onClick={() => setSupportExpanded(!supportExpanded)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-100 hover:bg-[#0e583e] hover:text-yellow-300 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className="w-4 h-4 text-emerald-300" />
                  <span>{language === 'bn' ? 'গ্রাহক সেবা' : 'Customer Service'}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${supportExpanded ? 'rotate-180' : ''}`} />
              </button>

              {supportExpanded && (
                <div className="pl-6 pr-2 py-1.5 flex flex-col gap-1 text-[11px] text-emerald-200 bg-[#052b1e] rounded-lg my-1 border border-[#146344]">
                  <button
                    onClick={() => { onOpenSupport(); onClose(); }}
                    className="text-left py-1 hover:text-yellow-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{language === 'bn' ? '২৪/৭ লাইভ চ্যাট' : '24/7 Live Support'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onOpenSupportTicket) {
                        onOpenSupportTicket();
                      } else {
                        onOpenSupport();
                      }
                      onClose();
                    }}
                    className="text-left py-1 hover:text-yellow-300 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      <span>{language === 'bn' ? 'সাপোর্ট ও অভিযোগ টিকিট' : 'Support Tickets'}</span>
                    </div>
                    <span className="text-[9px] bg-yellow-400 text-black px-1 rounded font-bold">২৪/৭</span>
                  </button>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noreferrer"
                    className="py-1 hover:text-yellow-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{language === 'bn' ? 'টেলিগ্রাম অফিসিয়াল চ্যানেল' : 'Telegram Official Channel'}</span>
                  </a>
                </div>
              )}
            </div>

            {/* Language Selector ("ভাষা / Language") */}
            <div className="flex flex-col">
              <button
                id="sidebar-language-accordion-btn"
                onClick={() => setLangExpanded(!langExpanded)}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-bold text-emerald-100 hover:bg-[#0e583e] hover:text-yellow-300 transition-colors text-left cursor-pointer border border-[#146344]/60 bg-[#05281b]/70"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-yellow-400" />
                  <span className="font-extrabold">{language === 'bn' ? 'ভাষা পরিবর্তন' : 'Change Language'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#031d14] border border-[#166d4a] text-yellow-300 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${language === 'bn' ? 'bg-red-500' : 'bg-blue-400'}`} />
                    {language === 'bn' ? 'বাংলা' : 'English'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${langExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {langExpanded && (
                <div className="p-1.5 flex flex-col gap-1 text-[11px] bg-[#052b1e] rounded-lg my-1 border border-[#146344]">
                  <button
                    onClick={() => { if (language !== 'bn') onToggleLanguage(); setLangExpanded(false); }}
                    className={`text-left py-1.5 px-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                      language === 'bn' 
                        ? 'bg-[#0a4630] text-yellow-300 font-extrabold border border-yellow-500/40' 
                        : 'text-emerald-200 hover:bg-[#093d2a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" />
                      <span>বাংলা (Bengali)</span>
                    </div>
                    {language === 'bn' && <span className="text-xs text-yellow-300 font-black">✓</span>}
                  </button>
                  <button
                    onClick={() => { if (language !== 'en') onToggleLanguage(); setLangExpanded(false); }}
                    className={`text-left py-1.5 px-2 rounded flex items-center justify-between cursor-pointer transition-colors ${
                      language === 'en' 
                        ? 'bg-[#0a4630] text-yellow-300 font-extrabold border border-yellow-500/40' 
                        : 'text-emerald-200 hover:bg-[#093d2a] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
                      <span>English</span>
                    </div>
                    {language === 'en' && <span className="text-xs text-yellow-300 font-black">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Developer Credit Footer Badge in Sidebar */}
            <div className="mt-2 pt-2 border-t border-[#146344]/50 flex items-center justify-between px-2 text-[10px] text-emerald-400/70">
              <span className="flex items-center gap-1">
                <Code className="w-3 h-3 text-yellow-400" />
                <span>Neext Hub UI</span>
              </span>
              <a
                href="https://neexthub.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400/90 hover:text-yellow-300 underline font-semibold flex items-center gap-0.5"
              >
                <span>neexthub</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

