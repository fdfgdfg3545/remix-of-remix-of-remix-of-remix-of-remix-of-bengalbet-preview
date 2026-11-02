// @ts-nocheck
/**
 * BengalBet Missions & User Center Modal
 * Features:
 * - Daily missions, weekly goals, and special tasks with instant reward claiming
 * - Unified navigation tabs (Mission, Reward Center, Messages, Invite, Account Records, Bet Records, Profit & Loss)
 * - Dynamic mobile view adapters & desktop sidebar layouts
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RefreshCw, 
  Award, 
  Flame, 
  Ticket, 
  User, 
  CreditCard, 
  ArrowDownToLine, 
  ClipboardList, 
  FileText, 
  PieChart, 
  Star, 
  Users, 
  Gift, 
  Mail,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle2,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../types';
import { InternalMessagesView } from './InternalMessagesView';
import { ReferSectionView } from './ReferSectionView';
import { RewardCenterView } from './RewardCenterView';
import { ProfitLossView } from './ProfitLossView';
import { AccountRecordView } from './AccountRecordView';
import { BetRecordView } from './BetRecordView';
import { WithdrawSectionView } from './WithdrawSectionView';
import { DepositSectionView } from './DepositSectionView';
import { MyAccountSectionView } from './MyAccountSectionView';
import { VipSectionView } from './VipSectionView';
import { DepositWithdrawRecordView } from './DepositWithdrawRecordView';
import { MissionMobileView } from './MissionMobileView';
import { useServerMissions } from '../services/missions';
import { MailMobileView } from './MailMobileView';
import { FeedbackMobileView } from './FeedbackMobileView';
import { HelpCenterMobileView } from './HelpCenterMobileView';
import { RebateMobileView } from './RebateMobileView';
import { DepositMobileView } from './DepositMobileView';
import { WithdrawMobileView } from './WithdrawMobileView';
import { VipMobileView } from './VipMobileView';

interface MissionsModalProps {
  language: Language;
  user: UserAccount;
  initialMenu?: 'mission' | 'messages' | 'reward_center' | string;
  initialRewardCenterTab?: 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records';
  initialSigninSubTab?: 'new_member' | 'daily_signin';
  onClose: () => void;
  onClaimMission?: (amount: number, title: string) => void;
  onSettledReward?: () => void;
  onDepositSuccess?: (amount: number) => void;
  onWithdrawSuccess?: (amount: number) => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenMyAccount?: () => void;
  onOpenShare?: () => void;
  onOpenVip?: () => void;
  onOpenSupport?: () => void;
  onOpenSuperValueReward?: () => void;
  onOpenEgg?: () => void;
  onOpenSpin?: () => void;
  onOpenRedEnvelope?: () => void;
  onOpenAppDownload?: () => void;
  onLogout?: () => void;
  onUpdateUsername?: (newUsername: string) => void;
}

// 26 Milestone Tiers matching BengalBet system in screenshots
interface MilestoneItem {
  id: number;
  betTarget: number;
  betTargetDisplay: string;
  bonus: number;
  bonusDisplay: string;
}

const MILESTONES_DATA: MilestoneItem[] = [
  { id: 1, betTarget: 1000, betTargetDisplay: '1,000.00', bonus: 3.00, bonusDisplay: '3.00' },
  { id: 2, betTarget: 3000, betTargetDisplay: '3,000.00', bonus: 8.00, bonusDisplay: '8.00' },
  { id: 3, betTarget: 5000, betTargetDisplay: '5,000.00', bonus: 12.00, bonusDisplay: '12.00' },
  { id: 4, betTarget: 10000, betTargetDisplay: '10,000.00', bonus: 18.00, bonusDisplay: '18.00' },
  { id: 5, betTarget: 20000, betTargetDisplay: '20,000.00', bonus: 56.00, bonusDisplay: '56.00' },
  { id: 6, betTarget: 50000, betTargetDisplay: '50,000.00', bonus: 128.00, bonusDisplay: '128.00' },
  { id: 7, betTarget: 100000, betTargetDisplay: '100,000.00', bonus: 268.00, bonusDisplay: '268.00' },
  { id: 8, betTarget: 200000, betTargetDisplay: '200,000.00', bonus: 588.00, bonusDisplay: '588.00' },
  { id: 9, betTarget: 500000, betTargetDisplay: '500,000.00', bonus: 1288.00, bonusDisplay: '1,288.00' },
  { id: 10, betTarget: 1000000, betTargetDisplay: '1,000,000.00', bonus: 2888.00, bonusDisplay: '2,888.00' },
  { id: 11, betTarget: 2000000, betTargetDisplay: '2,000,000.00', bonus: 5888.00, bonusDisplay: '5,888.00' },
  { id: 12, betTarget: 5000000, betTargetDisplay: '5,000,000.00', bonus: 12888.00, bonusDisplay: '12,888.00' },
  { id: 13, betTarget: 10000000, betTargetDisplay: '10,000,000.00', bonus: 17777.00, bonusDisplay: '17,777.00' },
  { id: 14, betTarget: 15000000, betTargetDisplay: '15,000,000.00', bonus: 22888.00, bonusDisplay: '22,888.00' },
  { id: 15, betTarget: 20000000, betTargetDisplay: '20,000,000.00', bonus: 28888.00, bonusDisplay: '28,888.00' },
  { id: 16, betTarget: 25000000, betTargetDisplay: '25,000,000.00', bonus: 35888.00, bonusDisplay: '35,888.00' },
  { id: 17, betTarget: 30000000, betTargetDisplay: '30,000,000.00', bonus: 42888.00, bonusDisplay: '42,888.00' },
  { id: 18, betTarget: 40000000, betTargetDisplay: '40,000,000.00', bonus: 55888.00, bonusDisplay: '55,888.00' },
  { id: 19, betTarget: 50000000, betTargetDisplay: '50,000,000.00', bonus: 68888.00, bonusDisplay: '68,888.00' },
  { id: 20, betTarget: 60000000, betTargetDisplay: '60,000,000.00', bonus: 82888.00, bonusDisplay: '82,888.00' },
  { id: 21, betTarget: 70000000, betTargetDisplay: '70,000,000.00', bonus: 98888.00, bonusDisplay: '98,888.00' },
  { id: 22, betTarget: 80000000, betTargetDisplay: '80,000,000.00', bonus: 118888.00, bonusDisplay: '118,888.00' },
  { id: 23, betTarget: 90000000, betTargetDisplay: '90,000,000.00', bonus: 138888.00, bonusDisplay: '138,888.00' },
  { id: 24, betTarget: 100000000, betTargetDisplay: '100,000,000.00', bonus: 168888.00, bonusDisplay: '168,888.00' },
  { id: 25, betTarget: 150000000, betTargetDisplay: '150,000,000.00', bonus: 218888.00, bonusDisplay: '218,888.00' },
  { id: 26, betTarget: 200000000, betTargetDisplay: '200,000,000.00', bonus: 300000.00, bonusDisplay: '300,000.00' }
];

export const MissionsModal: React.FC<MissionsModalProps> = ({
  language,
  user,
  initialMenu = 'mission',
  initialRewardCenterTab,
  initialSigninSubTab,
  onClose,
  onClaimMission,
  onSettledReward,
  onDepositSuccess,
  onWithdrawSuccess,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenMyAccount,
  onOpenShare,
  onOpenVip,
  onOpenSupport,
  onOpenSuperValueReward,
  onOpenEgg,
  onOpenSpin,
  onOpenRedEnvelope,
  onOpenAppDownload,
  onLogout,
  onUpdateUsername
}) => {
  // Navigation tabs matching Capture9.PNG & Capture10.PNG & Capture11.PNG
  const [activeStatusTab, setActiveStatusTab] = useState<'running' | 'upcoming' | 'finished'>('running');
  const [activeSubTab, setActiveSubTab] = useState<'milestone' | 'rules'>('milestone');
  const [activeSidebarMenu, setActiveSidebarMenu] = useState<string>(initialMenu);
  const [rewardCenterTab, setRewardCenterTab] = useState<'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records'>(initialRewardCenterTab || 'coupons');
  const [signinSubTab, setSigninSubTab] = useState<'new_member' | 'daily_signin'>(initialSigninSubTab || 'new_member');
  const [unreadCount, setUnreadCount] = useState<number>(12);
  const [accountRecordTab, setAccountRecordTab] = useState<'transaction' | 'deposit' | 'withdraw'>('transaction');

  // Pagination for upcoming missions (Capture10.PNG)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  // Countdown timer state for active mission (Capture9.PNG)
  const missions = useServerMissions(() => onSettledReward?.());
  const countdown = missions.countdown;
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Claimed milestones state
  const [claimedIds, setClaimedIds] = useState<number[]>([]);

  // Ref to automatically scroll and focus active tab into view on mobile
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (initialMenu) {
      setActiveSidebarMenu(initialMenu);
    }
  }, [initialMenu]);

  // Scroll active tab into view when active tab changes or modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTabRef.current) {
        activeTabRef.current.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
        activeTabRef.current.focus({ preventScroll: true });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [activeSidebarMenu]);

  useEffect(() => {
    if (initialRewardCenterTab) {
      setRewardCenterTab(initialRewardCenterTab);
    }
  }, [initialRewardCenterTab]);

  useEffect(() => {
    if (initialSigninSubTab) {
      setSigninSubTab(initialSigninSubTab);
    }
  }, [initialSigninSubTab]);

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleClaimMilestone = async (item: any) => {
    if (await missions.claim(item)) confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const padTime = (num: number) => num.toString().padStart(2, '0');

  // Format today & yesterday dates in YYYY.MM.DD
  const formatDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  const isFullMobileView = 
    activeSidebarMenu === 'vip' ||
    activeSidebarMenu === 'mission' ||
    activeSidebarMenu === 'reward_center' || 
    activeSidebarMenu === 'my_account' || 
    activeSidebarMenu === 'bet_record' || 
    activeSidebarMenu === 'profit_loss' || 
    activeSidebarMenu === 'deposit_record' || 
    activeSidebarMenu === 'withdraw_record' || 
    activeSidebarMenu === 'account_record' || 
    activeSidebarMenu === 'deposit' || 
    activeSidebarMenu === 'withdraw' ||
    activeSidebarMenu === 'invite' ||
    activeSidebarMenu === 'share' ||
    activeSidebarMenu === 'messages' ||
    activeSidebarMenu === 'feedback' ||
    activeSidebarMenu === 'help' ||
    activeSidebarMenu === 'rebate';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullMobileView ? 'p-0 md:p-5 bg-[#f8fafc] md:bg-black/85' : 'p-3 sm:p-5 bg-black/85'} backdrop-blur-xs animate-in fade-in`}>
      {/* Modal Container */}
      <div 
        id="personal-center-mission-modal"
        className={`relative w-full max-w-7xl ${isFullMobileView ? 'h-full md:h-[94vh] max-h-none md:max-h-[820px]' : 'h-[94vh] max-h-[820px]'}`}
      >
        {/* Yellow/Gold Top-Right Corner Close Button taking half up/outside and half inside */}
        <button
          onClick={onClose}
          className={`${isFullMobileView ? 'hidden md:flex' : 'flex'} absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ffc800] hover:bg-[#ffe066] border-2 border-white text-[#05281d] shadow-xl items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer`}
          title="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Modal Inner Shell */}
        <div className={`w-full h-full bg-white ${isFullMobileView ? 'rounded-none md:rounded-2xl border-0 md:border md:border-emerald-800' : 'rounded-2xl border border-emerald-800'} shadow-2xl overflow-hidden flex flex-col md:flex-row`}>

        {/* ========================================================================= */}
        {/* LEFT COLUMN: 'ব্যক্তিগত কেন্দ্র' (Personal Center) DARK GREEN SIDEBAR */}
        {/* ========================================================================= */}
        <aside className={`w-full md:w-56 lg:w-64 bg-[#05281d] text-white ${isFullMobileView ? 'hidden md:flex' : 'flex'} flex-row md:flex-col shrink-0 border-b md:border-b-0 md:border-r border-[#0d3f2f] select-none`}>
          {/* Header Title */}
          <div className="hidden md:block p-4 sm:p-5 pb-3 border-b border-[#0e4433]">
            <h1 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-tight text-center sm:text-left">
              ব্যক্তিগত কেন্দ্র
            </h1>
          </div>

          {/* Navigation Links with Icons & Notification Badges */}
          <div className="flex-1 flex md:flex-col overflow-x-auto md:overflow-y-auto py-2 px-2 md:px-0 space-x-1.5 md:space-x-0 md:space-y-0.5 scrollbar-none whitespace-nowrap scroll-smooth">
            {/* 1. আমার অ্যাকাউন্ট */}
            <button
              id="personal-center-tab-my-account"
              ref={activeSidebarMenu === 'my_account' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('my_account')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'my_account' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <User className={`w-4 h-4 ${activeSidebarMenu === 'my_account' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>আমার অ্যাকাউন্ট</span>
            </button>

            {/* VIP Tab */}
            <button
              id="personal-center-tab-vip"
              ref={activeSidebarMenu === 'vip' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('vip')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'vip' 
                  ? 'bg-[#104e38] text-yellow-300 font-bold shadow-inner border border-yellow-400/50 md:border-transparent ring-1 ring-yellow-400/30 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>ভিআইপি ক্লাব</span>
            </button>

            {/* 2. ডিপোজিট */}
            <button
              id="personal-center-tab-deposit"
              ref={activeSidebarMenu === 'deposit' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('deposit')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'deposit' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <CreditCard className={`w-4 h-4 ${activeSidebarMenu === 'deposit' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>ডিপোজিট</span>
            </button>

            {/* 3. উত্তোলন */}
            <button
              id="personal-center-tab-withdraw"
              ref={activeSidebarMenu === 'withdraw' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('withdraw')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'withdraw' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <ArrowDownToLine className={`w-4 h-4 ${activeSidebarMenu === 'withdraw' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>উত্তোলন</span>
            </button>

            {/* 4. বেটিং রেকর্ড */}
            <button
              id="personal-center-tab-bet-record"
              ref={activeSidebarMenu === 'bet_record' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('bet_record')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'bet_record' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <ClipboardList className={`w-4 h-4 ${activeSidebarMenu === 'bet_record' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>বেটিং রেকর্ড</span>
            </button>

            {/* 5. অ্যাকাউন্ট রেকর্ড */}
            <button
              id="personal-center-tab-account-record"
              ref={activeSidebarMenu === 'account_record' ? activeTabRef : null}
              onClick={() => {
                setAccountRecordTab('transaction');
                setActiveSidebarMenu('account_record');
              }}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'account_record' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeSidebarMenu === 'account_record' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>অ্যাকাউন্ট রেকর্ড</span>
            </button>

            {/* 6. লাভ ও ক্ষতি */}
            <button
              id="personal-center-tab-profit-loss"
              ref={activeSidebarMenu === 'profit_loss' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('profit_loss')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'profit_loss' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <PieChart className={`w-4 h-4 ${activeSidebarMenu === 'profit_loss' ? 'text-emerald-300' : 'text-gray-300'}`} />
              <span>লাভ ও ক্ষতি</span>
            </button>

            {/* 7. পুরস্কার কেন্দ্র (Badge: 3) */}
            <button
              id="personal-center-tab-reward-center"
              ref={activeSidebarMenu === 'reward_center' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('reward_center')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center justify-between gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'reward_center' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Star className="w-4 h-4 text-yellow-300" />
                <span>পুরস্কার কেন্দ্র</span>
              </div>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ml-1.5 shadow">
                3
              </span>
            </button>

            {/* 8. বন্ধুদের আমন্ত্রণ করুন (Share / Refer & Earn) */}
            <button
              id="personal-center-tab-invite"
              ref={activeSidebarMenu === 'invite' || activeSidebarMenu === 'share' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('invite')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'invite' || activeSidebarMenu === 'share'
                  ? 'bg-[#104e38] text-yellow-300 font-bold shadow-inner border border-yellow-400/60 ring-2 ring-yellow-400/40 md:border-transparent md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <Users className={`w-4 h-4 ${activeSidebarMenu === 'invite' || activeSidebarMenu === 'share' ? 'text-yellow-400' : 'text-gray-300'}`} />
              <span>বন্ধুদের আমন্ত্রণ করুন</span>
            </button>

            {/* 9. মিশন (ACTIVE with Badge: 1) */}
            <button
              id="personal-center-tab-mission"
              ref={activeSidebarMenu === 'mission' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('mission')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center justify-between gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'mission' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Gift className="w-4 h-4 text-yellow-300" />
                <span>মিশন</span>
              </div>
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center ml-1.5 shadow">
                1
              </span>
            </button>

            {/* 10. অভ্যন্তরীণ বার্তা (Badge: unreadCount) */}
            <button
              id="personal-center-tab-messages"
              ref={activeSidebarMenu === 'messages' ? activeTabRef : null}
              onClick={() => setActiveSidebarMenu('messages')}
              className={`px-3 md:px-4 py-2 md:py-2.5 flex items-center justify-between gap-2 md:gap-3 text-xs sm:text-sm font-semibold rounded-lg md:rounded-none transition-all shrink-0 cursor-pointer ${
                activeSidebarMenu === 'messages' 
                  ? 'bg-[#104e38] text-white font-bold shadow-inner border border-emerald-400/40 md:border-transparent ring-1 ring-emerald-400/20 md:ring-0' 
                  : 'text-gray-300 hover:bg-[#093527] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <Mail className="w-4 h-4 text-gray-300" />
                <span>অভ্যন্তরীণ বার্তা</span>
              </div>
              {unreadCount > 0 && (
                <span className="w-4.5 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center px-1 ml-1.5 shadow">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT MAIN AREA: REWARD CENTER / MESSAGES / REFER / MISSIONS DASHBOARD */}
        {/* ========================================================================= */}
        {activeSidebarMenu === 'my_account' ? (
          <MyAccountSectionView
            user={user}
            onOpenDeposit={() => setActiveSidebarMenu('deposit')}
            onOpenWithdraw={() => setActiveSidebarMenu('withdraw')}
            onOpenDailySignIn={() => {
              setRewardCenterTab('signin');
              setSigninSubTab('daily_signin');
              setActiveSidebarMenu('reward_center');
            }}
            onOpenVip={() => setActiveSidebarMenu('vip')}
            onOpenRewardCenter={() => {
              setRewardCenterTab('coupons');
              setActiveSidebarMenu('reward_center');
            }}
            onOpenSuperValueReward={() => {
              onClose();
              if (onOpenSuperValueReward) onOpenSuperValueReward();
            }}
            onOpenBetRecord={() => setActiveSidebarMenu('bet_record')}
            onOpenProfitLoss={() => setActiveSidebarMenu('profit_loss')}
            onOpenDepositRecord={() => {
              setActiveSidebarMenu('deposit_record');
            }}
            onOpenWithdrawRecord={() => {
              setActiveSidebarMenu('withdraw_record');
            }}
            onOpenAccountRecord={() => {
              setAccountRecordTab('transaction');
              setActiveSidebarMenu('account_record');
            }}
            onOpenInvite={() => setActiveSidebarMenu('invite')}
            onOpenMissions={() => setActiveSidebarMenu('mission')}
            onOpenRebate={() => setActiveSidebarMenu('rebate')}
            onOpenMessages={() => setActiveSidebarMenu('messages')}
            onOpenAppDownload={() => {
              onClose();
              if (onOpenAppDownload) onOpenAppDownload();
            }}
            onOpenCustomerService={() => {
              onClose();
              if (onOpenSupport) onOpenSupport();
            }}
            onLogout={() => {
              onClose();
              if (onLogout) onLogout();
            }}
            onUpdateUsername={onUpdateUsername}
            onClose={onClose}
            onBack={() => {
              onClose();
            }}
          />
        ) : activeSidebarMenu === 'vip' ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Dedicated Mobile View matching screenshots */}
            <div className="block md:hidden w-full h-full">
              <VipMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'vip') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
                onRefreshUser={() => {
                  if (onClaimMission) onClaimMission(0, 'ভিআইপি আপডেট');
                }}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex flex-1 w-full h-full">
              <VipSectionView 
                user={user} 
                onClaimSuccess={(amt, title) => {
                  if (onClaimMission) onClaimMission(amt, title);
                }}
                onRefreshUser={() => {
                  if (onClaimMission) onClaimMission(0, 'ভিআইপি আপডেট');
                }}
              />
            </div>
          </div>
        ) : activeSidebarMenu === 'reward_center' ? (
          <RewardCenterView
            onSettledReward={onSettledReward}
            user={user}
            initialRightView={rewardCenterTab}
            initialSigninTab={signinSubTab}
            onOpenSuperValueReward={() => {
              onClose();
              if (onOpenSuperValueReward) onOpenSuperValueReward();
            }}
            onOpenGoldenEgg={() => {
              onClose();
              if (onOpenEgg) onOpenEgg();
            }}
            onOpenSpin={() => {
              onClose();
              if (onOpenSpin) onOpenSpin();
            }}
            onOpenRedEnvelope={() => {
              onClose();
              if (onOpenRedEnvelope) onOpenRedEnvelope();
            }}
            onClaimCoupon={(couponId, name) => {
              if (onClaimMission) {
                const bonusAmount = couponId === 4 ? 150 : couponId === 5 ? 188 : 100;
                const bonusTitle = couponId === 4 ? 'লাকি স্পিন ফ্রি টিকিট দাবি সফল!' : couponId === 5 ? 'লাল খামের বৃষ্টি টিকিট দাবি সফল!' : 'কুপন দাবি সফল!';
                onClaimMission(bonusAmount, `${bonusTitle} (+৳${bonusAmount})`);
              }
            }}
            onClaimSuccess={(amt, title) => {
              if (onClaimMission) {
                onClaimMission(amt, title);
              }
            }}
            onOpenInvite={() => setActiveSidebarMenu('invite')}
            onOpenVip={() => setActiveSidebarMenu('vip')}
            onBack={() => {
              if (initialMenu === 'reward_center') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'deposit' ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile View matching Screenshot_2026.08.30_20.33.45.751.png & Screenshot_2026.08.30_20.34.55.374.png */}
            <div className="block md:hidden w-full h-full">
              <DepositMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'deposit') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
                onOpenDepositRecord={() => {
                  setActiveSidebarMenu('deposit_record');
                }}
                onOpenCustomerService={() => {
                  onClose();
                  if (onOpenSupport) onOpenSupport();
                }}
                onOpenSupportTicket={() => {
                  setActiveSidebarMenu('feedback');
                }}
                onDepositSuccess={() => {
                  // Deposit is only a pending request; refresh the real wallet, never credit locally
                  if (onDepositSuccess) onDepositSuccess(0);
                }}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex flex-1 w-full h-full">
              <DepositSectionView
                user={user}
                onOpenAccountRecord={(tab) => {
                  setAccountRecordTab(tab || 'deposit');
                  setActiveSidebarMenu('account_record');
                }}
                onDepositSuccess={() => {
                  // Deposit is only a pending request; refresh the real wallet, never credit locally
                  if (onDepositSuccess) onDepositSuccess(0);
                }}
                onOpenWithdraw={() => setActiveSidebarMenu('withdraw')}
              />
            </div>
          </div>
        ) : activeSidebarMenu === 'withdraw' ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile View matching Screenshot_2026.08.30_20.37.33.408.png & Screenshot_2026.08.30_20.37.37.971.png */}
            <div className="block md:hidden w-full h-full">
              <WithdrawMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'withdraw') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
                onOpenWithdrawRecord={() => {
                  setActiveSidebarMenu('withdraw_record');
                }}
                onOpenCustomerService={() => {
                  onClose();
                  if (onOpenSupport) onOpenSupport();
                }}
                onOpenSupportTicket={() => {
                  setActiveSidebarMenu('feedback');
                }}
                onWithdrawSuccess={(amt) => {
                  if (onWithdrawSuccess) {
                    onWithdrawSuccess(amt);
                  }
                  if (onClaimMission) {
                    onClaimMission(-amt, 'উত্তোলন');
                  }
                }}
              />
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex flex-1 w-full h-full">
              <WithdrawSectionView 
                user={user} 
                onWithdrawSuccess={(amt) => {
                  if (onWithdrawSuccess) {
                    onWithdrawSuccess(amt);
                  }
                  if (onClaimMission) {
                    onClaimMission(-amt, 'উত্তোলন');
                  }
                }}
              />
            </div>
          </div>
        ) : activeSidebarMenu === 'profit_loss' ? (
          <ProfitLossView 
            user={user} 
            onBack={() => {
              if (initialMenu === 'profit_loss') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'deposit_record' ? (
          <DepositWithdrawRecordView 
            user={user}
            initialType="deposit"
            onBack={() => {
              if (initialMenu === 'deposit_record') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'withdraw_record' ? (
          <DepositWithdrawRecordView 
            user={user}
            initialType="withdraw"
            onBack={() => {
              if (initialMenu === 'withdraw_record') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'account_record' ? (
          <AccountRecordView 
            user={user} 
            initialTab={accountRecordTab}
            onBack={() => {
              if (initialMenu === 'account_record') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'bet_record' ? (
          <BetRecordView 
            user={user} 
            onBack={() => {
              if (initialMenu === 'bet_record') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'messages' ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile View: Dedicated Mail Mobile View matching Capture15.PNG */}
            <div className="block md:hidden w-full h-full">
              <MailMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'messages') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
              />
            </div>
            {/* Desktop View: InternalMessagesView */}
            <div className="hidden md:flex flex-1 w-full h-full">
              <InternalMessagesView onUnreadCountChange={setUnreadCount} />
            </div>
          </div>
        ) : activeSidebarMenu === 'feedback' ? (
          <FeedbackMobileView
            user={user}
            onBack={() => {
              if (initialMenu === 'feedback') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'help' ? (
          <HelpCenterMobileView
            user={user}
            onBack={() => {
              if (initialMenu === 'help') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
            onOpenCustomerService={() => {
              setActiveSidebarMenu('feedback');
            }}
          />
        ) : activeSidebarMenu === 'rebate' ? (
          <RebateMobileView
            user={user}
            onSettled={() => onSettledReward?.()}
            onBack={() => {
              if (initialMenu === 'rebate') {
                onClose();
              } else {
                setActiveSidebarMenu('my_account');
              }
            }}
            onClose={onClose}
          />
        ) : activeSidebarMenu === 'invite' || activeSidebarMenu === 'share' ? (
          <ReferSectionView user={user} onClose={onClose} />
        ) : activeSidebarMenu === 'messages' ? (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile View: Dedicated Mail Mobile Layout matching Capture15.PNG */}
            <div className="block md:hidden w-full h-full">
              <MailMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'messages') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
                onClaimBonus={onClaimMission}
                onUnreadCountChange={setUnreadCount}
              />
            </div>

            {/* Desktop View: Full screen Internal Messages Split Pane matching Capture13.PNG & Capture14.PNG */}
            <div className="hidden md:flex flex-1 w-full h-full overflow-hidden">
              <InternalMessagesView
                user={user}
                onClaimBonus={onClaimMission}
                onUnreadCountChange={setUnreadCount}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full h-full flex flex-col overflow-hidden">
            {/* Mobile View: Dedicated Mission Mobile Layout matching Capture11.PNG & Capture12.PNG */}
            <div className="block md:hidden w-full h-full">
              <MissionMobileView
                user={user}
                onBack={() => {
                  if (initialMenu === 'mission') {
                    onClose();
                  } else {
                    setActiveSidebarMenu('my_account');
                  }
                }}
                onClose={onClose}
                onClaimReward={() => onSettledReward?.()}
              />
            </div>

            {/* Desktop View */}
            <main className="hidden md:flex flex-1 bg-[#ffffff] flex-col overflow-hidden text-gray-800">
          
          {/* TOP TAB BAR */}
          <div className="border-b border-gray-200 px-4 sm:px-6 pt-3 flex items-center justify-between bg-white shrink-0">
            {/* Left Status Tabs: চলমান | শীঘ্রই আসছে | শেষ হয়ে গিয়েছে */}
            <div className="flex items-center gap-6 sm:gap-8">
              <button
                onClick={() => setActiveStatusTab('running')}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeStatusTab === 'running'
                    ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                চলমান
              </button>

              <button
                onClick={() => setActiveStatusTab('upcoming')}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeStatusTab === 'upcoming'
                    ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                শীঘ্রই আসছে
              </button>

              <button
                onClick={() => setActiveStatusTab('finished')}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                  activeStatusTab === 'finished'
                    ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                শেষ হয়ে গিয়েছে
              </button>
            </div>

            {/* Right Sub-Tabs: মাইলস্টোন | নিয়ম */}
            <div className="flex items-center gap-6 pr-8">
              <button
                onClick={() => setActiveSubTab('milestone')}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubTab === 'milestone'
                    ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                মাইলস্টোন
              </button>

              <button
                onClick={() => setActiveSubTab('rules')}
                className={`pb-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubTab === 'rules'
                    ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                নিয়ম
              </button>
            </div>
          </div>

          {/* MAIN CONTENT SPLIT VIEW */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col md:flex-row gap-5">
            
            {/* ------------------------------------------------------------- */}
            {/* LEFT SUB-COLUMN: NEON BALANCE CARD & EVENT CARDS */}
            {/* ------------------------------------------------------------- */}
            <div className="w-full md:w-64 lg:w-72 flex flex-col gap-4 shrink-0">
              
              {/* Vibrant Neon Glow Balance Card (Purple / Blue Gradient) */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2563eb] via-[#7c3aed] to-[#c026d3] text-white p-4 shadow-lg flex flex-col justify-between min-h-[140px]">
                {/* Decorative neon background ambient circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-cyan-400/30 blur-xl pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-pink-500/30 blur-xl pointer-events-none" />

                {/* Top Avatar & Phone Number & Refresh Icon */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                      alt={user.username || "User Avatar"}
                      className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow"
                    />
                    <span className="font-extrabold text-sm sm:text-base tracking-wide font-mono text-white drop-shadow">
                      {user.phone || user.username || '1615249856'}
                    </span>
                  </div>

                  <button
                    onClick={handleRefreshBalance}
                    className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                    title="Refresh Balance"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Received Total Amount Display */}
                <div className="mt-4 z-10">
                  <p className="text-xs text-blue-100 font-medium font-bengali">
                    প্রাপ্ত হিসাব
                  </p>
                  <p className="text-2xl sm:text-3xl font-black font-game text-white tracking-wide flex items-center gap-1 mt-0.5">
                    <span className="text-xl">৳</span> 0.00
                  </p>
                </div>
              </div>

              {/* MISSION EVENT CARDS LIST */}
              {activeStatusTab === 'running' && (
                /* Ongoing Event Card matching Capture9.PNG */
                <div className="rounded-xl border border-gray-200 bg-white shadow-xs p-3.5 flex flex-col gap-2.5">
                  <div className="flex items-start gap-3">
                    {/* Golden Medal Ribbon Badge */}
                    <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-600 shadow-xs shrink-0 mt-0.5">
                      <Award className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                        স্লট মেশিন বেটিং ফান্ড
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1">
                        তারিখ: <span className="font-mono text-gray-700">{formatDate(0)}~{formatDate(1)}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        অবশিষ্ট: <span className="font-mono text-rose-600 font-bold">{padTime(countdown.hours)}:{padTime(countdown.minutes)}:{padTime(countdown.seconds)}</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        মাইলস্টোন: <span className="font-bold text-gray-700">0/26</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar with 0% */}
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-600">0%</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-0" />
                    </div>
                  </div>
                </div>
              )}

              {activeStatusTab === 'upcoming' && (
                /* Upcoming Events List matching Capture10.PNG */
                <div className="flex flex-col gap-3">
                  {/* Future Card 1 */}
                  <div className="rounded-xl border border-gray-200 bg-white shadow-xs p-3 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-600 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-gray-900">স্লট মেশিন বেটিং ফান্ড</h4>
                        <p className="text-[11px] text-gray-500">তারিখ: <span className="font-mono">{formatDate(1)}~{formatDate(2)}</span></p>
                        <p className="text-[11px] text-gray-500">অবশিষ্ট: ----</p>
                        <p className="text-[11px] text-gray-500">মাইলস্টোন: 0/26</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-gray-100 pt-1">
                      <span className="text-xs font-bold text-gray-500">0%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
                    </div>
                  </div>

                  {/* Future Card 2 */}
                  <div className="rounded-xl border border-gray-200 bg-white shadow-xs p-3 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-600 shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <h4 className="font-bold text-gray-900">স্লট মেশিন বেটিং ফান্ড</h4>
                        <p className="text-[11px] text-gray-500">তারিখ: <span className="font-mono">{formatDate(2)}~{formatDate(3)}</span></p>
                        <p className="text-[11px] text-gray-500">অবশিষ্ট: ----</p>
                        <p className="text-[11px] text-gray-500">মাইলস্টোন: 0/26</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 border-t border-gray-100 pt-1">
                      <span className="text-xs font-bold text-gray-500">0%</span>
                      <div className="flex-1 h-1.5 rounded-full bg-gray-200" />
                    </div>
                  </div>

                  {/* Pagination bar matching Capture10.PNG */}
                  <div className="flex items-center justify-between text-[11px] text-gray-600 pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-1">
                      <button className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronsLeft className="w-3.5 h-3.5" /></button>
                      <button className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                      <span className="w-5 h-5 rounded-full bg-gray-700 text-white font-bold flex items-center justify-center text-[10px]">1</span>
                      <span className="cursor-pointer hover:text-gray-900 px-1">2</span>
                      <span className="cursor-pointer hover:text-gray-900 px-1">3</span>
                      <span>...</span>
                      <span className="cursor-pointer hover:text-gray-900 px-1">43</span>
                      <button className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
                      <button className="p-1 text-gray-600 hover:text-gray-900 cursor-pointer"><ChevronsRight className="w-3.5 h-3.5" /></button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="w-7 h-5 text-center border border-gray-300 rounded text-[10px]"
                      />
                      <button className="px-2 py-0.5 rounded bg-gray-500 hover:bg-gray-600 text-white text-[10px] font-bold cursor-pointer">
                        নিশ্চিত করুন
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeStatusTab === 'finished' && (
                /* Finished Event History */
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-center">
                  <p className="text-xs text-gray-500 font-medium">তারিখ: ২০২৬.০৮.২৭~২০২৬.০৮.২৮</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">সব মাইলস্টোন সম্পন্ন হয়েছে</p>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT SUB-COLUMN: MILESTONE LIST OR RULES ACCORDING TO SUBTAB */}
            {/* ------------------------------------------------------------- */}
            <div className="flex-1 flex flex-col md:border-l md:border-gray-200 md:pl-5 overflow-hidden">
              
              {/* ========================================================= */}
              {/* SUB-VIEW 1: MILESTONE STEP TIMELINE (Capture9.PNG & Capture10.PNG) */}
              {/* ========================================================= */}
              {activeSubTab === 'milestone' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header Title */}
                  <div className="pb-3 border-b border-gray-100">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 font-bengali">
                      স্লট মেশিন বেটিং ফান্ড
                    </h2>
                    <p className="text-xs text-orange-600 font-bold flex items-center gap-1 mt-0.5">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                      <span>অসম্পূর্ণ মাইলস্টোন ({missions.tiers.filter(t => !t.claimed).length})</span>
                    </p>
                  </div>

                  {/* Scrollable Milestone Steps List */}
                  <div className="flex-1 overflow-y-auto py-3 pr-2 space-y-4">
                    {missions.tiers.map((item, index) => {
                      const isFirst = index === 0;
                      const isClaimed = item.claimed;

                      return (
                        <div key={item.id} className="relative flex items-start gap-4 group">
                          
                          {/* Continuous Vertical Connecting Line */}
                          {index < missions.tiers.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300 -mb-4 z-0" />
                          )}

                          {/* Runner Icon Circle (Orange for first active step, Gray for others) */}
                          <div className="relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${
                              isFirst 
                                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-200' 
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {/* Runner SVG / Icon */}
                              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7-1.6 8.1-4.2-.9-.4 2 6.3 1.3z" />
                              </svg>
                            </div>
                          </div>

                          {/* Milestone Step Card */}
                          <div className="flex-1 bg-white border border-gray-200/90 hover:border-emerald-300 rounded-xl p-3 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                                বৈধ বেট <span className="font-mono text-gray-900 font-bold">৳ {missions.turnoverDisplay}/{item.betTargetDisplay}</span>
                              </p>
                            </div>

                            {/* Light Blue Pill Button / Tag: 'বোনাস : ৳ X.XX' */}
                            <div>
                              {isClaimed ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>গৃহীত</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleClaimMilestone(item)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#1d4ed8] hover:text-[#1e40af] text-xs font-bold transition-all cursor-pointer shadow-xs border border-blue-200 hover:scale-105 active:scale-95"
                                >
                                  <Ticket className="w-3.5 h-3.5" />
                                  <span>বোনাস : ৳ {item.bonusDisplay}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* SUB-VIEW 2: RULES VIEW (Capture11.PNG & Capture12.PNG) */}
              {/* ========================================================= */}
              {activeSubTab === 'rules' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 font-bengali pb-2.5 border-b border-gray-100">
                    প্রতিদিন স্লট বাজির বোনাস
                  </h2>

                  {/* Dark Green Styled Rules Card Container */}
                  <div className="flex-1 overflow-y-auto mt-3 bg-[#053d2d] text-white p-4 sm:p-5 rounded-2xl border border-[#14593e] space-y-4 text-xs sm:text-sm font-bengali shadow-inner">
                    
                    {/* Header Banner */}
                    <div className="border-b border-[#0d4f3b] pb-3">
                      <h3 className="text-base sm:text-lg font-extrabold text-yellow-300">
                        প্রতিদিন স্লট বাজির বোনাস
                      </h3>
                      <p className="text-emerald-200 text-xs mt-1">
                        কার্যকলাপের লক্ষ্য: সকল সদস্য এই ইভেন্টে অংশগ্রহণ করতে পারবেন।
                      </p>
                    </div>

                    {/* Example Breakdown */}
                    <div className="space-y-1.5 text-gray-200 leading-relaxed text-xs sm:text-[13px]">
                      <p className="font-bold text-yellow-300">উদাহরণ:</p>
                      <p>
                        বেটিং বোনাস: প্রতিদিন স্লটে বাজি ধরে এবং <strong className="text-yellow-400 font-bold font-mono">২০,০০০</strong> টাকার বেশি বৈধ বাজি সম্পূর্ণ করলে <strong className="text-yellow-400 font-bold font-mono">৳৫৬</strong> (৩+৮+১২+১৫+১৮=৫৬) বোনাস পাবেন। আপনার বাজি যত বেশি হবে, আপনার বোনাস তত বেশি হবে। <strong className="text-yellow-400 font-bold font-mono">৳৩৬,৯২৮</strong> পর্যন্ত দৈনিক বেটিং বোনাস উপভোগ করতে এবং আরও উত্তেজনা অনুভব করতে এখনই যোগদান করুন।
                      </p>
                    </div>

                    {/* Milestone Target & Bonus Table */}
                    <div className="overflow-x-auto rounded-xl border border-emerald-600/50 shadow-md">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr className="bg-[#03291e] text-yellow-300 font-bold border-b border-emerald-600/50">
                            <th className="py-2.5 px-3 border-r border-emerald-600/50">মোট বৈধ বাজি</th>
                            <th className="py-2.5 px-3">বোনাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-700/40 text-emerald-100 font-mono text-xs">
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">১,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳৩</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">৩,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳৮</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">৫,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳১২</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">১০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳১৫</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">২০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳১৮</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">৫০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳৫০</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">১,০০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳১০০</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">৫,০০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳৬০০</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">১০,০০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳১,৫০০</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30">
                            <td className="py-2 px-3 border-r border-emerald-600/50">৫০,০০,০০০</td>
                            <td className="py-2 px-3 font-bold text-yellow-300">৳৮,০০০</td>
                          </tr>
                          <tr className="hover:bg-emerald-800/30 bg-emerald-950/60 font-bold">
                            <td className="py-2 px-3 border-r border-emerald-600/50 text-white">১,০০,০০,০০০</td>
                            <td className="py-2 px-3 text-yellow-400">৳১৭,৭৭৭</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* কিভাবে দাবি করবেন (How to claim) */}
                    <div className="space-y-1.5 pt-2 border-t border-[#0d4f3b]">
                      <h4 className="font-bold text-yellow-300">কিভাবে দাবি করবেন</h4>
                      <p className="text-gray-200">১. মাইলস্টোন বাজি সম্পন্ন করুন।</p>
                      <p className="text-gray-200">২. বোনাস পুনরায় জারি করুন – হোমপেজ এবং উপরের ডান পাশে গ্রহণ করা এ ক্লিক করুন।</p>
                      <p className="text-gray-300 text-xs">
                        নিচের চেকবাক্স বাজি আপডেট হতে বিলম্ব হতে পারে, তাই বাজি ধরার ৩০ মিনিট পর বোনাস দাবি করার পরামর্শ দেয়া হচ্ছে।
                      </p>
                    </div>

                    {/* কার্যকলাপের নিয়ম (Rules) */}
                    <div className="space-y-1.5 pt-2 border-t border-[#0d4f3b]">
                      <h4 className="font-bold text-yellow-300">কার্যকলাপের নিয়ম:</h4>
                      <p className="text-gray-200">১. বোনাস পেতে, আপনাকে অবশ্যই ১ টার্নওভার এর প্রয়োজনীয়তা পূরণ করতে হবে।</p>
                      <p className="text-gray-200">২. রিডেম্পশনের সময়কাল: ২৪ ঘণ্টার মধ্যে বোনাস দাবি করতে হবে। যদি সময়সীমার মধ্যে দাবি না করা হয়, তাহলে বোনাস স্বয়ংক্রিয়ভাবে শেষ হয়ে যাবে।</p>
                      <p className="text-gray-200">
                        ৩. আপনি যদি আপনার অ্যাকাউন্ট-উপসেসের পাসওয়ার্ড ভুলে যান, তাহলে আপনার অ্যাকাউন্টের তথ্য পুনঃপ্রাপ্ত করতে সাহায্য করার জন্য <strong className="text-yellow-300">"২৪-ঘণ্টা অনলাইন গ্রাহক পরিষেবা"</strong> এ যোগাযোগ করুন।
                      </p>
                      <p className="text-gray-200">
                        ৪. <strong className="text-yellow-400">BengalBet</strong> যেকোনো সময় এই প্রচারটি পরিবর্তন, স্থগিত বা বাতিল করার অধিকার সংরক্ষণ করে।
                      </p>
                    </div>

                  </div>
                </div>
              )}
            </div>

            </div>
          </main>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};
