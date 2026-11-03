// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Copy, 
  Check, 
  QrCode, 
  ChevronRight, 
  Calendar, 
  ChevronDown, 
  Award, 
  Gift, 
  Coins, 
  Share2,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  UserCheck,
  Search,
  Zap,
  Lock,
  Unlock,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { InviteFriendsMobileView } from './InviteFriendsMobileView';
import { useReferralBoard } from '../services/referralBoard';
import { api } from '../services/api';
import referRewardsBannerImg from '../assets/images/bengalbet_refer_rewards_banner_1790186975892.jpg';

interface ReferSectionViewProps {
  user: UserAccount;
  onClose?: () => void;
}

export interface InstantBonusRangeItem {
  id: string | number;
  minCount: number;
  maxCount: number;
  instantBonus: number;
  label?: string;
  desc?: string;
}

export interface PoroskarLevelItem {
  id: string | number;
  level: number;
  requiredCount: number;
  rewardAmount: number;
  name: string;
  badge?: string;
  desc?: string;
  isClaimed?: boolean;
  isEligible?: boolean;
  isLocked?: boolean;
  isCurrentActive?: boolean;
  progress?: number;
  progressPercent?: number;
  friendsNeeded?: number;
  formattedReward?: string;
}

// 15 Reward Tiers matching Capture10.PNG & Capture11.PNG
interface InviteTier {
  id: number;
  target: number;
  bonus: number;
  bonusDisplay: string;
  type: 'medal-red' | 'medal-green' | 'medal-blue' | 'medal-gold' | 'star' | 'trophy' | 'diamond' | 'crown';
  progress: number;
  claimed: boolean;
}

/** Server pays one instant bonus per qualified friend (auto-credited); there is no larger milestone ladder. */
const TIER_TYPES: InviteTier['type'][] = ['medal-red', 'medal-green', 'medal-blue', 'medal-gold', 'star'];
const buildInviteTiers = (bonus: number, qualified: number): InviteTier[] => TIER_TYPES.map((type, i) => ({
  id: i + 1, target: i + 1, bonus, bonusDisplay: bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  type, progress: Math.min(qualified, i + 1), claimed: qualified >= i + 1,
}));
const INITIAL_INVITE_TIERS: InviteTier[] = buildInviteTiers(0, 0);

// Live stream payout events pool for dynamic 1-by-1 live updates
interface LiveRewardItem {
  id: string;
  phone: string;
  amount: string;
  timeAgo: string;
}


// Sample Records Data
interface ReferralRecord {
  id: string;
  date: string;
  username: string;
  type: 'আমন্ত্রণ পুরস্কার' | 'জমা রিবেট' | 'বেটিং রিবেট';
  amount: number;
}


// Sample Invited Friends Data
interface InvitedFriend {
  id: string;
  regDate: string;
  username: string;
  status: 'সক্রিয়' | 'নিষ্ক্রিয়';
  depositAmount: number;
  betAmount: number;
  period: 'today' | 'yesterday' | '7days';
}


export const ReferSectionView: React.FC<ReferSectionViewProps> = ({ user, onClose }) => {
  // Top 5 tabs matching screenshots
  const [activeTab, setActiveTab] = useState<'summary' | 'rewards' | 'income' | 'records' | 'invitedList'>('summary');
  
  // Share & Copy state
  const referralLink = `https://www.bengalbet.com/?r=${user.referralCode || 'BDT888'}`;
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Invite Tiers state
  const [inviteTiers, setInviteTiers] = useState<InviteTier[]>(INITIAL_INVITE_TIERS);

  // Poroskar Levels & Instant Bonus Ranges State
  const [poroskarLevels, setPoroskarLevels] = useState<PoroskarLevelItem[]>([]);
  const [instantBonusRanges, setInstantBonusRanges] = useState<InstantBonusRangeItem[]>([]);
  const [claimingLevel, setClaimingLevel] = useState<number | null>(null);
  const [claimFeedback, setClaimFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [simulatedFriendCount, setSimulatedFriendCount] = useState<number>(5);

  // Live Stats
  const [liveStats, setLiveStats] = useState({
    totalFriends: user.referredFriendsCount || 0,
    totalEarnings: user.totalEarnings || 0,
    todayCommission: 0,
    yesterdayCommission: 0,
    qualifiedFriends: 0,
    depositedFriends: 0,
    breakdown: { instantRewardTotal: 0, milestoneRewardTotal: 0, depositCommissionTotal: 0, betRebateTotal: 0 } as any,
    referralCode: user.referralCode || '',
    commissionRates: {
      instantBonus: 0,
      depositRate: 0,
      betRate: 0
    }
  });

  // Live Friends & Records
  const [liveFriends, setLiveFriends] = useState<InvitedFriend[]>([]);
  const [liveRecords, setLiveRecords] = useState<ReferralRecord[]>([]);

  // Bind Inviter Code Modal State
  const [isBindModalOpen, setIsBindModalOpen] = useState(false);
  const [bindCodeInput, setBindCodeInput] = useState('');
  const [isBinding, setIsBinding] = useState(false);
  const [bindFeedback, setBindFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live Payout Ticker State (changes 1-by-1 randomly)
  const board = useReferralBoard();
  const displayedRewards = board.recent.slice(0, 3) as any[];
  const setDisplayedRewards = (_: any) => {};
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);


  // Filters for Records & Invited List
  const [recordType, setRecordType] = useState<string>('সব');
  const [dateFilter, setDateFilter] = useState('আজকের দিন');
  const [invitedDateTab, setInvitedDateTab] = useState<'today' | 'yesterday' | '7days'>('today');
  const [invitedStatusFilter, setInvitedStatusFilter] = useState<string>('সব');
  const [decimalPointEnabled, setDecimalPointEnabled] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Load All Data from API
  const loadAllReferralData = async () => {
    try {
      const [statsRes, friendsRes, recordsRes] = await Promise.all([
        api.referral.getStats(),
        api.referral.getFriends().catch(() => ({ success: false, friends: [] })),
        api.referral.getRecords().catch(() => ({ success: false, records: [] }))
      ]);

      if (statsRes.success) {
        setLiveStats({
          totalFriends: Number(statsRes.totalFriends ?? 0),
          totalEarnings: Number(statsRes.totalEarnings ?? 0),
          todayCommission: Number(statsRes.todayCommission ?? 0),
          yesterdayCommission: Number((statsRes as any).yesterdayCommission ?? 0),
          qualifiedFriends: Number((statsRes as any).qualifiedFriends ?? 0),
          depositedFriends: Number((statsRes as any).depositedFriends ?? 0),
          breakdown: (statsRes as any).breakdown || {},
          referralCode: statsRes.referralCode || user.referralCode || '',
          commissionRates: statsRes.commissionRates || { instantBonus: 0, depositRate: 0, betRate: 0 }
        });

        if (statsRes.poroskarLevels && statsRes.poroskarLevels.length > 0) {
          setPoroskarLevels(statsRes.poroskarLevels);
        }

        if (statsRes.instantBonusRanges && statsRes.instantBonusRanges.length > 0) {
          setInstantBonusRanges(statsRes.instantBonusRanges);
        }

        setInviteTiers(buildInviteTiers(Number(statsRes.commissionRates?.instantBonus ?? 0), Number((statsRes as any).qualifiedFriends ?? 0)));
        if (statsRes.tiers && statsRes.tiers.length > 0) {
          const typeList: Array<InviteTier['type']> = ['medal-red', 'medal-green', 'medal-blue', 'medal-gold', 'star', 'trophy', 'diamond', 'crown'];
          setInviteTiers(statsRes.tiers.map((at: any, idx: number) => ({
            id: at.id,
            target: at.count,
            bonus: at.bonus,
            bonusDisplay: at.bonusDisplay || at.bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            type: typeList[idx % typeList.length],
            progress: at.currentProgress,
            claimed: at.isClaimed
          })));
        }
      }

      if (friendsRes.success && friendsRes.friends && friendsRes.friends.length > 0) {
        const mapped: InvitedFriend[] = friendsRes.friends.map((f: any) => ({
          id: f.id,
          regDate: f.joinedAt || '2026-08-29 14:00',
          username: f.referredUsername || 'player',
          status: f.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়',
          depositAmount: f.totalDeposit || 0,
          betAmount: f.totalBet || 0,
          period: 'today'
        }));
        setLiveFriends(mapped);
      }

      if (recordsRes.success && recordsRes.records && recordsRes.records.length > 0) {
        const mapped: ReferralRecord[] = recordsRes.records.map((r: any) => ({
          id: r.id,
          date: r.createdAt || r.claimedAt || '2026-08-29 14:15:32',
          username: r.referredUsername || user.username,
          type: r.type === 'deposit_commission' ? 'জমা রিবেট' : r.type === 'bet_rebate' ? 'বেটিং রিবেট' : 'আমন্ত্রণ পুরস্কার',
          amount: Number(r.amount) || 0
        }));
        setLiveRecords(mapped);
      }
    } catch (e) {
      console.error('Failed to load referral data in desktop refer section', e);
    }
  };

  useEffect(() => {
    loadAllReferralData();
  }, []);

  // Handle Bind Inviter Code
  const handleBindCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bindCodeInput.trim()) return;
    setIsBinding(true);
    setBindFeedback(null);
    try {
      const res = await api.referral.bindCode(bindCodeInput.trim());
      if (res.success) {
        setBindFeedback({ type: 'success', message: res.message || 'আমন্ত্রক সফলভাবে যুক্ত হয়েছে!' });
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          setIsBindModalOpen(false);
          setBindFeedback(null);
          setBindCodeInput('');
        }, 1500);
        loadAllReferralData();
      } else {
        setBindFeedback({ type: 'error', message: res.message || 'কোড যাচাই করা যায়নি' });
      }
    } catch (err: any) {
      setBindFeedback({ type: 'error', message: err.message || 'কোড বাইন্ড করতে সমস্যা হয়েছে' });
    } finally {
      setIsBinding(false);
    }
  };

  const handleClaimTier = async (tier: InviteTier) => {
    if (tier.claimed) return;
    try {
      const res = await api.referral.claimTier(tier.id);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
        setInviteTiers(prev => prev.map(t => t.id === tier.id ? { ...t, claimed: true } : t));
        loadAllReferralData();
      }
    } catch (e) {
      console.error('Claim tier error', e);
    }
  };

  const handleClaimPoroskar = async (lvl: PoroskarLevelItem) => {
    if (lvl.isClaimed || lvl.isLocked || !lvl.isEligible) return;
    setClaimingLevel(lvl.level);
    setClaimFeedback(null);
    try {
      const res = await api.referral.claimPoroskarLevel(lvl.level);
      if (res.success) {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });
        setClaimFeedback({
          type: 'success',
          message: res.message || `লেভেল ${lvl.level} পুরস্কার সফলভাবে গ্রহণ করা হয়েছে! ৳${lvl.rewardAmount} অ্যাকাউন্টে যুক্ত হয়েছে।`
        });
        await loadAllReferralData();
      } else {
        setClaimFeedback({
          type: 'error',
          message: res.message || 'দাবি সম্পন্ন করা সম্ভব হয়নি।'
        });
      }
    } catch (err: any) {
      setClaimFeedback({
        type: 'error',
        message: err.message || 'দাবি প্রক্রিয়াকরণে সমস্যা হয়েছে।'
      });
    } finally {
      setClaimingLevel(null);
    }
  };

  const renderLevelBadgeIcon = (levelNum: number, _badge?: string) => {
    if (levelNum === 1) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 border border-amber-300 shrink-0 shadow-xs">
          <Award className="w-5 h-5 fill-amber-500 text-amber-600" />
        </div>
      );
    }
    if (levelNum === 2) {
      return (
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-300 shrink-0 shadow-xs">
          <Award className="w-5 h-5 fill-slate-400 text-slate-600" />
        </div>
      );
    }
    if (levelNum <= 4) {
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 border border-yellow-300 shrink-0 shadow-xs">
          <Trophy className="w-5 h-5 fill-yellow-500 text-yellow-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 border border-emerald-300 shrink-0 shadow-xs">
        <Gift className="w-5 h-5 text-emerald-600" />
      </div>
    );
  };

  // Export Invited Friends CSV
  const handleExportFriendsCSV = () => {
    if (liveFriends.length === 0) return;
    const headers = ['নিবন্ধনের তারিখ', 'ব্যবহারকারীর নাম', 'মোট ডিপোজিট', 'মোট বাজি', 'অবস্থা'];
    const rows = liveFriends.map(f => [
      f.regDate,
      f.username,
      f.depositAmount,
      f.betAmount,
      f.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bengalbet_referral_friends_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered records
  const filteredRecords = liveRecords.filter(record => {
    if (recordType !== 'সব' && record.type !== recordType) return false;
    return true;
  });

  const totalRecordAmount = filteredRecords.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Filtered invited friends
  const filteredInvitedFriends = liveFriends.filter(friend => {
    if (invitedDateTab === 'today' && friend.period !== 'today') return false;
    if (invitedDateTab === 'yesterday' && friend.period !== 'yesterday') return false;
    if (invitedDateTab === '7days' && !['today', 'yesterday', '7days'].includes(friend.period)) return false;
    if (invitedStatusFilter !== 'সব' && friend.status !== invitedStatusFilter) return false;
    return true;
  });

  const renderTierIcon = (type: InviteTier['type']) => {
    switch (type) {
      case 'medal-red':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 border border-red-200 shrink-0">
            <Award className="w-6 h-6 fill-red-500 text-red-500" />
          </div>
        );
      case 'medal-green':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
            <Award className="w-6 h-6 fill-emerald-500 text-emerald-500" />
          </div>
        );
      case 'medal-blue':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200 shrink-0">
            <Award className="w-6 h-6 fill-blue-500 text-blue-500" />
          </div>
        );
      case 'medal-gold':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
            <Award className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
        );
      case 'star':
        return (
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 border border-yellow-200 shrink-0">
            <Sparkles className="w-6 h-6 fill-yellow-500 text-yellow-500" />
          </div>
        );
      case 'trophy':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200 shrink-0">
            <Trophy className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
        );
      case 'diamond':
        return (
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 border border-cyan-200 shrink-0">
            <span className="text-xl">💎</span>
          </div>
        );
      case 'crown':
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200 shrink-0">
            <span className="text-xl">👑</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* Mobile Dedicated View matching screenshots */}
      <div className="block md:hidden h-full w-full">
        <InviteFriendsMobileView
          user={user}
          onBack={onClose || (() => {})}
          onClose={onClose}
        />
      </div>

      {/* Desktop Responsive View */}
      <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-white text-gray-800">
      {/* ========================================================================= */}
      {/* TOP SUB-TAB BAR: সারসংক্ষেপ | পুরস্কার | আয় | রেকর্ড | আমন্ত্রিতদের তালিকা */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-200 px-4 sm:px-6 pt-3 flex items-center gap-6 sm:gap-8 bg-white shrink-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'summary'
              ? 'text-red-600 font-extrabold border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          সারসংক্ষেপ
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={`pb-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'rewards'
              ? 'text-red-600 font-extrabold border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          পুরস্কার
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`pb-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'text-red-600 font-extrabold border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          আয়
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`pb-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'records'
              ? 'text-red-600 font-extrabold border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          রেকর্ড
        </button>

        <button
          onClick={() => setActiveTab('invitedList')}
          className={`pb-2.5 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'invitedList'
              ? 'text-red-600 font-extrabold border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          আমন্ত্রিতদের তালিকা
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 scrollbar-thin">
        
        {/* ===================================================================== */}
        {/* VIEW 1: সারসংক্ষেপ (Overview Summary) - Capture9.PNG */}
        {/* ===================================================================== */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            
            {/* Top Row: Blue Trophy Banner (Left) & 4 Stat Cards (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Blue Trophy Banner */}
              <div className="lg:col-span-7 rounded-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-indigo-500 text-white p-5 flex items-center justify-between shadow-md relative overflow-hidden">
                <div className="z-10">
                  <h2 className="text-xl sm:text-2xl font-black italic tracking-wide drop-shadow">
                    BengalBet সম্পদের শুরু
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100 mt-2 font-medium">
                    একটি আমন্ত্রণ, আজীবন সুবিধা
                  </p>
                </div>

                <div className="flex items-center gap-3 z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/20 rounded-full flex items-center justify-center p-2 backdrop-blur-xs">
                    <Trophy className="w-12 h-12 text-amber-300 drop-shadow-md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl sm:text-3xl font-black font-game text-yellow-300">৳ {Number(liveStats.commissionRates.instantBonus || 0).toFixed(2)}</span>
                      <span className="text-[10px] bg-white/30 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">?</span>
                    </div>
                    <p className="text-[11px] text-blue-100 font-medium mt-0.5">একটি আমন্ত্রণ, আজীবন সুবিধা</p>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              </div>

              {/* 4 Pastel Stat Cards (2x2 Grid) with dynamic values */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {/* 1. আজকের আয় */}
                <div className="rounded-xl bg-[#bae6fd]/70 p-3 flex flex-col justify-between shadow-xs border border-sky-200">
                  <span className="text-xs text-sky-900 font-bold">আজকের আয়</span>
                  <span className="text-lg sm:text-xl font-black font-game text-sky-950 mt-1">
                    ৳ {Number(liveStats.todayCommission || 0).toFixed(2)}
                  </span>
                </div>

                {/* 2. গতকালের আয় */}
                <div className="rounded-xl bg-[#e9d5ff]/70 p-3 flex flex-col justify-between shadow-xs border border-purple-200">
                  <span className="text-xs text-purple-900 font-bold">গতকালের আয়</span>
                  <span className="text-lg sm:text-xl font-black font-game text-purple-950 mt-1">
                    ৳ {Number(liveStats.yesterdayCommission || 0).toFixed(2)}
                  </span>
                </div>

                {/* 3. সূচিপত্রধারী */}
                <div className="rounded-xl bg-[#e9d5ff]/70 p-3 flex flex-col justify-between shadow-xs border border-purple-200">
                  <span className="text-xs text-purple-900 font-bold">সূচিপত্রধারী</span>
                  <span className="text-lg sm:text-xl font-black font-game text-purple-950 mt-1">
                    {liveStats.totalFriends}
                  </span>
                </div>

                {/* 4. যোগ্য পরিচয়করা */}
                <div className="rounded-xl bg-[#bae6fd]/70 p-3 flex flex-col justify-between shadow-xs border border-sky-200">
                  <span className="text-xs text-sky-900 font-bold">যোগ্য পরিচয়করা</span>
                  <span className="text-lg sm:text-xl font-black font-game text-sky-950 mt-1">
                    {liveStats.qualifiedFriends}
                  </span>
                </div>
              </div>

            </div>

            {/* Middle Row: Leaderboard + Recent Claimers (Left) & Share + Referral Link (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Box (div 2): Top 3 Leaderboard & Live Rotating Claimers */}
              <div id="refer-live-rewards-section" className="lg:col-span-7 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-4 flex flex-col gap-3">
                {/* Top 3 Avatars with Medals */}
                <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-indigo-100/80">
                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-amber-400 bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-sm shadow">
                        <img 
                          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80" 
                          alt="1st avatar" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold text-[9px] shadow">
                        1st
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 mt-1">{board.slot(0).name}</span>
                    <span className="text-xs font-black text-amber-700 font-game">{board.slot(0).amount}</span>
                  </div>

                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-cyan-400 bg-cyan-100 flex items-center justify-center font-bold text-cyan-800 text-sm shadow">
                        <img 
                          src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80" 
                          alt="2nd avatar" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-white font-bold text-[9px] shadow">
                        2nd
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 mt-1">{board.slot(1).name}</span>
                    <span className="text-xs font-black text-cyan-800 font-game">{board.slot(1).amount}</span>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full border-2 border-orange-400 bg-orange-100 flex items-center justify-center font-bold text-orange-800 text-sm shadow">
                        <img 
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" 
                          alt="3rd avatar" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -left-1 px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-bold text-[9px] shadow">
                        3rd
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 mt-1">{board.slot(2).name}</span>
                    <span className="text-xs font-black text-orange-800 font-game">{board.slot(2).amount}</span>
                  </div>
                </div>

                {/* Live Rotating Claimers List: "যারা পুরস্কার পেয়েছেন" (Changes 1-by-1 randomly) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>যারা পুরস্কার পেয়েছেন</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                      লাইভ আপডেট
                    </span>
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    {displayedRewards.map((item, idx) => (
                      <div 
                        key={item.id}
                        className={`h-8 px-4 rounded-full bg-white/95 border border-indigo-100 flex items-center justify-between text-xs text-gray-700 shadow-2xs transition-all duration-500 ${
                          idx === animatingIndex ? 'scale-102 bg-amber-50 border-amber-300' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-gray-800">{item.phone}</span>
                        </div>
                        <span className="text-gray-500 text-[11px] font-medium">প্রাপ্ত</span>
                        <span className="font-bold text-emerald-700 font-mono">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Box: Commission Promo strip & Share Card */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {/* Purple Circular Promo strip */}
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-purple-900 leading-snug">
                    ১ জনকে আমন্ত্রণ করুন, আয় করুন ৩০০ টাকা। এজেন্ট কমিশন আজীবন ১.০%
                  </p>
                </div>

                {/* "বন্ধুদের শেয়ার করুন" (Share with friends) Card */}
                <div className="rounded-xl border border-gray-200 p-3.5 bg-white shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-800">বন্ধুদের শেয়ার করুন</h4>

                  {/* QR & Referral URL row */}
                  <div className="flex items-center gap-3">
                    {/* QR Code */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded p-1 flex items-center justify-center cursor-pointer hover:border-emerald-500" onClick={() => setShowQrModal(true)}>
                        <QrCode className="w-14 h-14 text-gray-800" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 cursor-pointer hover:underline" onClick={() => setShowQrModal(true)}>
                        কোড সংরক্ষণ
                      </span>
                    </div>

                    {/* Copy Link Input Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center rounded-lg border border-gray-300 overflow-hidden bg-gray-50 p-1">
                        <input
                          type="text"
                          readOnly
                          value={referralLink}
                          className="flex-1 bg-transparent text-[11px] font-mono text-gray-700 px-1 outline-none truncate"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="p-1.5 rounded-md bg-purple-700 hover:bg-purple-800 text-white transition-colors cursor-pointer shrink-0"
                          title="কপি করুন"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Social Share Icon Buttons matching Capture9.PNG */}
                  <div className="grid grid-cols-7 gap-1.5 pt-1">
                    {/* Facebook */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-[#1877f2] hover:opacity-90 text-white flex items-center justify-center cursor-pointer font-bold text-xs shadow-2xs"
                      title="Facebook"
                    >
                      f
                    </button>
                    {/* X (Twitter) */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-black hover:opacity-90 text-white flex items-center justify-center cursor-pointer font-bold text-xs shadow-2xs"
                      title="X"
                    >
                      𝕏
                    </button>
                    {/* Telegram */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-[#229ed9] hover:opacity-90 text-white flex items-center justify-center cursor-pointer text-xs shadow-2xs"
                      title="Telegram"
                    >
                      ✈
                    </button>
                    {/* WhatsApp */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-[#25d366] hover:opacity-90 text-white flex items-center justify-center cursor-pointer text-xs shadow-2xs font-bold"
                      title="WhatsApp"
                    >
                      ✆
                    </button>
                    {/* WeChat / Chat */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-[#07c160] hover:opacity-90 text-white flex items-center justify-center cursor-pointer text-xs shadow-2xs font-bold"
                      title="WeChat"
                    >
                      💬
                    </button>
                    {/* LINE */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-[#06c755] hover:opacity-90 text-white flex items-center justify-center cursor-pointer text-[10px] shadow-2xs font-bold"
                      title="LINE"
                    >
                      LINE
                    </button>
                    {/* Native Share */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-8 rounded-lg bg-blue-600 hover:opacity-90 text-white flex items-center justify-center cursor-pointer text-xs shadow-2xs"
                      title="Share"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bind Inviter Code Quick Action */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">অন্য কারও রেফারেল কোড আছে?</span>
                    <button
                      type="button"
                      onClick={() => setIsBindModalOpen(true)}
                      className="text-purple-700 hover:text-purple-900 font-bold text-[11px] underline flex items-center gap-1 cursor-pointer"
                    >
                      <Gift className="w-3 h-3 text-purple-600" />
                      <span>আমন্ত্রক কোড বাইন্ড করুন</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Instant Referral Bonus Range Scale (Desktop View matching Mobile functionality) */}
            <div className="pt-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4 text-amber-950 fill-amber-950" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-gray-900 leading-tight">
                        আমন্ত্রণ সংখ্যা অনুযায়ী তাৎক্ষণিক বোনাস স্কেল
                      </h3>
                      <span className="text-[11px] text-gray-500">ইনস্ট্যান্ট রেফারেল ক্যাশ রিওয়ার্ড (রেঞ্জ বৃদ্ধি বোনাস)</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 animate-pulse">
                    তাৎক্ষণিক বোনাস
                  </span>
                </div>

                {/* Dynamic User Progress Box */}
                <div className="rounded-xl bg-gradient-to-r from-[#0d4f3b] to-[#175345] p-3.5 text-white shadow-xs border border-emerald-400/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-200 block font-medium">আপনার বর্তমান অগ্রগতি</span>
                    <span className="text-lg font-black text-white font-game">
                      {liveStats.totalFriends} <span className="text-xs font-normal text-emerald-200">জন বন্ধু</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-emerald-200 block font-medium">বর্তমান সক্রিয় তাৎক্ষণিক রেট</span>
                    {(() => {
                      const userCount = liveStats.totalFriends;
                      const activeRange = { instantBonus: Number(liveStats.commissionRates?.instantBonus ?? 0) };

                      return (
                        <span className="text-base sm:text-lg font-black text-yellow-300 font-mono">
                          ৳ {activeRange.instantBonus.toLocaleString()} / রেফারে
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Ranges Scale Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="py-2 px-3 text-center">ক্রম</th>
                        <th className="py-2 px-3">সফল বন্ধু রেঞ্জ</th>
                        <th className="py-2 px-3 font-mono">প্রতি রেফারে তাৎক্ষণিক বোনাস</th>
                        <th className="py-2 px-3 text-right">বর্তমান অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {([{ id: 'flat', minCount: 1, maxCount: 999999, instantBonus: Number(liveStats.commissionRates?.instantBonus ?? 0), label: 'প্রতিটি যোগ্য বন্ধু' }]).map((range, idx) => {
                        const userCount = liveStats.totalFriends;
                        const isCurrentActive = userCount >= range.minCount && (range.maxCount >= 999999 ? true : userCount <= range.maxCount);
                        const isCompleted = userCount > range.maxCount && range.maxCount < 999999;

                        return (
                          <tr key={range.id || idx} className={isCurrentActive ? 'bg-amber-50/80 font-bold' : ''}>
                            <td className="py-2 px-3 text-center">{idx + 1}</td>
                            <td className="py-2 px-3">
                              {range.label || `${range.minCount} - ${range.maxCount >= 999999 ? 'অসীম' : range.maxCount} জন`}
                            </td>
                            <td className="py-2 px-3 font-mono font-black text-emerald-700">
                              ৳ {range.instantBonus.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isCurrentActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                                  বর্তমান সক্রিয়
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[11px] font-bold text-emerald-700">
                                  ✓ সম্পন্ন
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-400">
                                  আর {Math.max(0, range.minCount - userCount)} জন
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Interactive Simulator & Rule explanation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-gray-100 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>💡 বন্ধু ৳{Number((liveStats.commissionRates as any).minDeposit ?? 500).toLocaleString('en-US')} জমা ও ৳{Number((liveStats.commissionRates as any).minTurnover ?? 2000).toLocaleString('en-US')} বাজি করলে প্রতি বন্ধুতে ৳{Number(liveStats.commissionRates.instantBonus || 0).toLocaleString('en-US')} (একবার)।</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-medium">সিমুলেটর:</span>
                    {[1, 5, 10, 20, 50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSimulatedFriendCount(val)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          simulatedFriendCount === val ? 'bg-[#175345] text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {val} জন
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: এখন পর্যন্ত প্রাপ্ত পুরস্কার (Total Platform Rewards Distributed) */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-gray-900 mb-2.5">এখন পর্যন্ত প্রাপ্ত পুরস্কার</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. সাফল্য পুরস্কার */}
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">সাফল্য পুরস্কার</span>
                    <p className="text-sm sm:text-base font-black font-game text-gray-900 mt-0.5">৳ {Number(liveStats.breakdown?.milestoneRewardTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    
                  </div>
                </div>

                {/* 2. ডিপোজিট রিবেট */}
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Coins className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">ডিপোজিট রিবেট</span>
                    <p className="text-sm sm:text-base font-black font-game text-gray-900 mt-0.5">৳ {Number(liveStats.breakdown?.depositCommissionTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    
                  </div>
                </div>

                {/* 3. বেটিং রিবেট */}
                <div className="rounded-xl border border-gray-200 bg-white p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                    <Gift className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-medium">বেটিং রিবেট</span>
                    <p className="text-sm sm:text-base font-black font-game text-gray-900 mt-0.5">৳ {Number(liveStats.breakdown?.betRebateTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 2: পুরস্কার (Rewards Milestone Tiers) - Capture10.PNG & Capture11.PNG */}
        {/* ===================================================================== */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            
            {/* Top Banner (div 1): Using requested Bengali content banner with BengalBet site name */}
            <div 
              id="refer-rewards-top-banner"
              className="rounded-2xl overflow-hidden shadow-lg border border-emerald-700/60 relative bg-emerald-950 w-full"
            >
              <img 
                src={referRewardsBannerImg} 
                alt="BengalBet Refer Rewards Banner"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[220px] object-cover sm:object-contain sm:bg-[#07392a] mx-auto block"
              />
            </div>

            {/* Feedback Alert if claimed or error */}
            {claimFeedback && (
              <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                claimFeedback.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' 
                  : 'bg-red-50 text-red-800 border border-red-300'
              }`}>
                {claimFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
                <span>{claimFeedback.message}</span>
              </div>
            )}

            {/* Sub-header: স্থায়ী */}
            <div className="flex justify-between items-center pr-1">
              <span className="text-xs font-bold text-gray-500">
                ধারাবাহিক পুরস্কার লেভেল মাইলস্টোন (Sequential Levels)
              </span>
              <span className="text-xs font-bold text-gray-500">স্থায়ী</span>
            </div>

            {/* 3-Column Tier Cards Grid matching Capture11.PNG */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(poroskarLevels.length > 0 ? poroskarLevels : inviteTiers).map((tierItem: any) => {
                const isPoroskar = 'level' in tierItem;
                const id = isPoroskar ? tierItem.id || tierItem.level : tierItem.id;
                const target = isPoroskar ? tierItem.requiredCount : tierItem.target;
                const bonusDisplay = isPoroskar ? (tierItem.formattedReward || `৳${tierItem.rewardAmount.toLocaleString()}`) : `৳ ${tierItem.bonusDisplay}`;
                const progress = isPoroskar ? (tierItem.progress ?? Math.min(liveStats.totalFriends, target)) : tierItem.progress;
                const isClaimed = isPoroskar ? tierItem.isClaimed : tierItem.claimed;
                const isLocked = isPoroskar ? tierItem.isLocked : false;
                const isEligible = isPoroskar ? tierItem.isEligible : (progress >= target);
                const isClaiming = isPoroskar ? claimingLevel === tierItem.level : false;

                return (
                  <div 
                    key={id}
                    className={`rounded-xl border bg-white p-3.5 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 ${
                      isPoroskar && tierItem.isCurrentActive
                        ? 'border-yellow-400/90 ring-2 ring-yellow-400/30'
                        : isLocked
                        ? 'border-gray-200 opacity-80'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isPoroskar 
                        ? renderLevelBadgeIcon(tierItem.level, tierItem.badge)
                        : renderTierIcon(tierItem.type)
                      }
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isPoroskar && (
                            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              L{tierItem.level}
                            </span>
                          )}
                          <p className="text-xs font-bold text-gray-800">
                            মোট {target} টির বেশি বৈধ আমন্ত্রিত।
                          </p>
                        </div>
                        <p className="text-xs font-bold text-gray-600 font-mono mt-0.5">
                          🪙 {bonusDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-indigo-900 font-mono">
                        {progress}/{target}
                      </span>
                      <button
                        onClick={() => isPoroskar ? handleClaimPoroskar(tierItem) : handleClaimTier(tierItem)}
                        disabled={isClaimed || isLocked || !isEligible || isClaiming}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors shadow-2xs ${
                          isClaimed
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : isClaiming
                            ? 'bg-amber-300 text-gray-900 cursor-wait'
                            : isLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed text-[10px]'
                            : isEligible
                            ? 'bg-amber-400 hover:bg-amber-500 text-gray-900 animate-bounce cursor-pointer'
                            : 'bg-[#bfdbfe] hover:bg-[#93c5fd] text-[#1e40af] cursor-not-allowed'
                        }`}
                      >
                        {isClaimed 
                          ? 'দাবীকৃত' 
                          : isClaiming
                          ? 'দাবি হচ্ছে...'
                          : isLocked
                          ? `লেভেল ${tierItem.level - 1} সম্পন্ন করুন`
                          : isEligible 
                          ? 'দাবী করুন' 
                          : isPoroskar && tierItem.friendsNeeded
                          ? `আর ${tierItem.friendsNeeded} জন`
                          : 'উপলব্ধ'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 3: আয় (Income Breakdown) - Capture12.PNG */}
        {/* ===================================================================== */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            
            {/* Block 1: Period Overview with Sample Data */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/50 to-white p-5 shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <span className="text-xs text-gray-600 font-medium">আমন্ত্রণ পুরস্কার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.instantRewardTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">অসুধ পুরস্কার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.milestoneRewardTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">জমা রিবেট</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.depositCommissionTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">বেটিং রিবেট</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.betRebateTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">সূচিপত্রধারী</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.totalFriends}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mt-6 pt-4 border-t border-indigo-100/60">
                <div>
                  <span className="text-xs text-gray-600 font-medium">যোগ্য পরিচয়করা</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.qualifiedFriends}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">জমাদানদার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.depositedFriends}</p>
                </div>
              </div>
            </div>

            {/* Block 2: মোট আয়: ৳ 6,470.00 with Sample Breakdown */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm sm:text-base font-black text-gray-900 mb-4 flex items-center gap-1.5">
                <span>মোট আয়:</span>
                <span className="text-emerald-700 font-game text-lg">৳ {Number(liveStats.totalEarnings || 0).toFixed(2)}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
                <div>
                  <span className="text-xs text-gray-600 font-medium">আমন্ত্রণ পুরস্কার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.instantRewardTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">অসুধ পুরস্কার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.milestoneRewardTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">জমা রিবেট</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.depositCommissionTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">বেটিং রিবেট</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">৳ {Number(liveStats.breakdown.betRebateTotal || 0).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">সূচিপত্রধারী</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.totalFriends}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center mt-6 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-600 font-medium">যোগ্য পরিচয়করা</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.qualifiedFriends}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-600 font-medium">জমাদানদার</span>
                  <p className="text-base sm:text-lg font-black font-game text-indigo-950 mt-1">{liveStats.depositedFriends}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 4: রেকর্ড (Records / Transaction Log) with Sample Data */}
        {/* ===================================================================== */}
        {activeTab === 'records' && (
          <div className="flex flex-col h-full space-y-3">
            
            {/* Top Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">প্রকার:</span>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="সব">সব</option>
                  <option value="আমন্ত্রণ পুরস্কার">আমন্ত্রণ পুরস্কার</option>
                  <option value="জমা রিবেট">জমা রিবেট</option>
                  <option value="বেটিং রিবেট">বেটিং রিবেট</option>
                </select>
              </div>

              {/* Date range picker bar */}
              <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-mono text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{dateFilter}</span>
              </div>

              {/* Red search button: অন্যান্য */}
              <button 
                onClick={() => {}}
                className="h-8 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>অন্যান্য</span>
              </button>
            </div>

            {/* Table Area with Sample Rows */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[300px] bg-white">
              <div className="h-9 bg-gray-100/90 border-b border-gray-200 grid grid-cols-4 text-xs font-bold text-gray-700 items-center px-4">
                <div className="flex items-center gap-1">
                  <span>নিবন্ধনের তারিখ</span>
                  <span>⇅</span>
                </div>
                <div className="text-center">প্রকার</div>
                <div className="text-center">ব্যবহারকারীর নাম</div>
                <div className="text-right">পরিমাণ</div>
              </div>

              {/* Sample Data Table Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[360px] scrollbar-thin">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((item) => (
                    <div 
                      key={item.id}
                      className="grid grid-cols-4 items-center px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-mono text-gray-500 text-[11px]">{item.date}</div>
                      <div className="text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === 'আমন্ত্রণ পুরস্কার' 
                            ? 'bg-amber-100 text-amber-800'
                            : item.type === 'জমা রিবেট'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <div className="text-center font-mono font-medium text-gray-800">{item.username}</div>
                      <div className="text-right font-mono font-bold text-emerald-700">
                        +৳ {decimalPointEnabled ? (Number(item.amount) || 0).toFixed(2) : (Number(item.amount) || 0).toFixed(0)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400 text-xs">
                    কোন মিলিয়ে সংমিশ্রণ ডেটা পাওয়া যায়নি
                  </div>
                )}
              </div>

              {/* Bottom Table Total Bar with Decimal Point Toggle */}
              <div className="h-9 bg-gray-100/80 border-t border-gray-200 px-4 flex items-center justify-between text-xs text-gray-700">
                <div className="flex items-center gap-8 font-mono">
                  <span>মোট</span>
                  <span className="font-bold text-emerald-700">
                    ৳ {decimalPointEnabled ? (Number(totalRecordAmount) || 0).toFixed(2) : (Number(totalRecordAmount) || 0).toFixed(0)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-[11px]">ডেসিমাল পয়েন্ট</span>
                  <button
                    onClick={() => setDecimalPointEnabled(prev => !prev)}
                    className={`w-8 h-4.5 rounded-full p-0.5 transition-colors cursor-pointer ${
                      decimalPointEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      decimalPointEnabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ===================================================================== */}
        {/* VIEW 5: আমন্ত্রিতদের তালিকা (Invited Users List) with Sample Data */}
        {/* ===================================================================== */}
        {activeTab === 'invitedList' && (
          <div className="flex flex-col h-full space-y-3">
            
            {/* Top Radio Filters Bar matching Capture14.PNG */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="invitedDate"
                  checked={invitedDateTab === 'today'}
                  onChange={() => setInvitedDateTab('today')}
                  className="accent-red-600 cursor-pointer"
                />
                <span>আজ</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="invitedDate"
                  checked={invitedDateTab === 'yesterday'}
                  onChange={() => setInvitedDateTab('yesterday')}
                  className="accent-red-600 cursor-pointer"
                />
                <span>গতকাল</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="invitedDate"
                  checked={invitedDateTab === '7days'}
                  onChange={() => setInvitedDateTab('7days')}
                  className="accent-red-600 cursor-pointer"
                />
                <span>৭ দিন</span>
              </label>

              {/* Date range picker bar */}
              <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-mono text-gray-700">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span>{dateFilter}</span>
              </div>

              {/* Dropdown 'সব ⌄' */}
              <select
                value={invitedStatusFilter}
                onChange={(e) => setInvitedStatusFilter(e.target.value)}
                className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="সব">সব</option>
                <option value="সক্রিয়">সক্রিয়</option>
                <option value="নিষ্ক্রিয়">নিষ্ক্রিয়</option>
              </select>

              {/* Red search button: অন্যান্য */}
              <button className="h-8 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs">
                অন্যান্য
              </button>

              {/* CSV Export Button */}
              <button
                type="button"
                onClick={handleExportFriendsCSV}
                className="h-8 px-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                title="আমন্ত্রিত বন্ধুদের তালিকা এক্সপোর্ট করুন"
              >
                <span>CSV এক্সপোর্ট</span>
              </button>
            </div>

            {/* Table Area with Sample Data */}
            <div className="rounded-xl border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-[300px] bg-white">
              <div className="h-9 bg-gray-100/90 border-b border-gray-200 grid grid-cols-4 text-xs font-bold text-gray-700 items-center px-4">
                <div>নিবন্ধনের তারিখ</div>
                <div className="text-center">ব্যবহারকারীর নাম</div>
                <div className="text-center">মোট জমা / বাজি</div>
                <div className="text-right">অবস্থা</div>
              </div>

              {/* Sample Data Rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[360px] scrollbar-thin">
                {filteredInvitedFriends.length > 0 ? (
                  filteredInvitedFriends.map((friend) => (
                    <div 
                      key={friend.id}
                      className="grid grid-cols-4 items-center px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-mono text-gray-500 text-[11px]">{friend.regDate}</div>
                      <div className="text-center font-mono font-medium text-gray-800">{friend.username}</div>
                      <div className="text-center text-[11px] font-mono text-gray-600">
                        ৳{friend.depositAmount} / ৳{friend.betAmount}
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          friend.status === 'সক্রিয়'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {friend.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex-1 flex items-center justify-center p-12 text-center text-gray-400 text-xs">
                    কোন মিলিয়ে সংমিশ্রণ ডেটা পাওয়া যায়নি
                  </div>
                )}
              </div>

              {/* Bottom Count Indicator */}
              <div className="h-9 bg-gray-100/80 border-t border-gray-200 px-4 flex items-center justify-between text-xs text-gray-700">
                <div className="flex items-center gap-2 font-mono">
                  <span>মোট আমন্ত্রিত:</span>
                  <span className="font-bold text-indigo-900">{filteredInvitedFriends.length} জন</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  সক্রিয়: {filteredInvitedFriends.filter(f => f.status === 'সক্রিয়').length} জন
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* QR Code Big Preview Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in" onClick={() => setShowQrModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-base">আপনার রেফারেল QR কোড</h3>
            <div className="w-48 h-48 bg-gray-50 border-2 border-emerald-600 rounded-xl p-3 flex items-center justify-center">
              <QrCode className="w-40 h-40 text-gray-800" />
            </div>
            <p className="text-xs text-gray-500">স্ক্যান করে সরাসরি রেজিস্ট্রেশন করুন</p>
            <button
              onClick={handleCopyLink}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {copied ? 'লিঙ্ক কপি হয়েছে!' : 'রেফারেল লিঙ্ক কপি করুন'}
            </button>
            <button
              onClick={() => setShowQrModal(false)}
              className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer pt-1"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}

      {/* Bind Inviter Code Modal */}
      {isBindModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in" onClick={() => setIsBindModalOpen(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl flex flex-col gap-4 border border-purple-100" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-gray-900 text-base">আমন্ত্রক কোড বাইন্ড করুন</h3>
              <p className="text-xs text-gray-500 mt-1">
                আপনার বন্ধুর রেফারেল কোড লিখুন এবং বিশেষ সাইনআপ ওয়েলকাম সুবিধা লাভ করুন
              </p>
            </div>

            <form onSubmit={handleBindCode} className="space-y-3">
              <input
                type="text"
                required
                value={bindCodeInput}
                onChange={(e) => setBindCodeInput(e.target.value.toUpperCase())}
                placeholder="রেফারেল কোড (যেমন: BDT888)"
                className="w-full text-center font-mono font-bold tracking-wider py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:border-purple-600 focus:outline-none uppercase"
              />

              {bindFeedback && (
                <div className={`text-xs p-2 rounded-xl font-medium ${
                  bindFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {bindFeedback.message}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBindModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isBinding}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-black text-xs cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isBinding ? 'বাইন্ডিং...' : 'কোড নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
