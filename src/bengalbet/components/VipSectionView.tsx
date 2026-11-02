// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Crown, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Trophy,
  Gift,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { UserAccount, VipTierConfig, VipRewardRecord } from '../types';
import { api } from '../services/api';
import { useLiveRules, weekdayName } from '../services/promoLive';

interface VipSectionViewProps {
  user: UserAccount;
  initialTab?: 'promotion' | 'rules' | 'history';
  onClaimSuccess?: (amount: number, title: string) => void;
  onRefreshUser?: () => void;
}

const DEFAULT_VIP_LEVELS: VipTierConfig[] = [
  { level: 0, name: 'VIP0', badgeType: 'bronze', targetBet: 2000, targetBetDisplay: '2,000.00', depositTarget: 500, upgradeBonus: 0, weeklyBonus: 0, monthlyBonus: 0, slotRebate: 0.2, liveRebate: 0.1, status: 'active', description: 'বেস মেম্বারশিপ' },
  { level: 1, name: 'VIP1', badgeType: 'silver', targetBet: 20000, targetBetDisplay: '20,000.00', depositTarget: 2000, upgradeBonus: 50, weeklyBonus: 20, monthlyBonus: 50, slotRebate: 0.4, liveRebate: 0.3, status: 'active', description: 'সিলভার ভিআইপি সদস্য' },
  { level: 2, name: 'VIP2', badgeType: 'silver', targetBet: 100000, targetBetDisplay: '100,000.00', depositTarget: 10000, upgradeBonus: 180, weeklyBonus: 60, monthlyBonus: 150, slotRebate: 0.6, liveRebate: 0.4, status: 'active', description: 'সিলভার স্টার সদস্য' },
  { level: 3, name: 'VIP3', badgeType: 'gold', targetBet: 500000, targetBetDisplay: '500,000.00', depositTarget: 50000, upgradeBonus: 588, weeklyBonus: 188, monthlyBonus: 500, slotRebate: 0.8, liveRebate: 0.5, status: 'active', description: 'গোল্ড ভিআইপি সদস্য' },
  { level: 4, name: 'VIP4', badgeType: 'gold', targetBet: 2000000, targetBetDisplay: '2,000,000.00', depositTarget: 200000, upgradeBonus: 1888, weeklyBonus: 588, monthlyBonus: 1500, slotRebate: 1.0, liveRebate: 0.7, status: 'active', description: 'গোল্ড মাস্টার সদস্য' },
  { level: 5, name: 'VIP5', badgeType: 'platinum', targetBet: 5000000, targetBetDisplay: '5,000,000.00', depositTarget: 500000, upgradeBonus: 5888, weeklyBonus: 1888, monthlyBonus: 5000, slotRebate: 1.2, liveRebate: 0.9, status: 'active', description: 'প্লাটিনাম এলিট সদস্য' },
  { level: 6, name: 'VIP6', badgeType: 'platinum', targetBet: 10000000, targetBetDisplay: '10,000,000.00', depositTarget: 1000000, upgradeBonus: 12888, weeklyBonus: 3888, monthlyBonus: 10000, slotRebate: 1.5, liveRebate: 1.1, status: 'active', description: 'প্লাটিনাম কিং সদস্য' },
  { level: 7, name: 'VIP7', badgeType: 'diamond', targetBet: 25000000, targetBetDisplay: '25,000,000.00', depositTarget: 2500000, upgradeBonus: 28888, weeklyBonus: 8888, monthlyBonus: 25000, slotRebate: 1.8, liveRebate: 1.3, status: 'active', description: 'ডায়মন্ড প্রিভিলেজ সদস্য' },
  { level: 8, name: 'VIP8', badgeType: 'diamond', targetBet: 50000000, targetBetDisplay: '50,000,000.00', depositTarget: 5000000, upgradeBonus: 58888, weeklyBonus: 18888, monthlyBonus: 50000, slotRebate: 2.2, liveRebate: 1.6, status: 'active', description: 'ডায়মন্ড রয়্যাল সদস্য' },
  { level: 9, name: 'VIP9', badgeType: 'crown', targetBet: 100000000, targetBetDisplay: '100,000,000.00', depositTarget: 10000000, upgradeBonus: 128888, weeklyBonus: 38888, monthlyBonus: 100000, slotRebate: 2.6, liveRebate: 1.8, status: 'active', description: 'ক্রাউন সুপার ভিআইপি' },
  { level: 10, name: 'VIP10', badgeType: 'crown', targetBet: 200000000, targetBetDisplay: '200,000,000.00', depositTarget: 20000000, upgradeBonus: 300000, weeklyBonus: 88888, monthlyBonus: 200000, slotRebate: 3.0, liveRebate: 2.0, status: 'active', description: 'রয়্যাল অ্যাম্বাসেডর কিং' }
];

export const VipSectionView: React.FC<VipSectionViewProps> = ({
  user,
  initialTab = 'promotion',
  onClaimSuccess,
  onRefreshUser
}) => {
  const [activeTab, setActiveTab] = useState<'promotion' | 'rules' | 'history'>(initialTab);
  const [historyFilter, setHistoryFilter] = useState<'today' | 'yesterday' | '7days'>('today');
  const [showDecimal, setShowDecimal] = useState<boolean>(true);
  const [carouselPage, setCarouselPage] = useState<number>(0);

  // Dynamic Tiers & History
  const liveRules = useLiveRules();
  const [tiers, setTiers] = useState<VipTierConfig[]>(DEFAULT_VIP_LEVELS);
  const [historyClaims, setHistoryClaims] = useState<VipRewardRecord[]>([]);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch dynamic VIP data
  useEffect(() => {
    const loadVIPData = async () => {
      try {
        const res = await api.vip.getTiers();
        if (res.success && res.tiers && res.tiers.length > 0) {
          setTiers(res.tiers);
        }
      } catch (err) {
        console.warn('Could not load VIP tiers:', err);
      }

      try {
        const hRes = await api.vip.getHistory();
        if (hRes.success && hRes.history) {
          setHistoryClaims(hRes.history);
        }
      } catch (err) {
        console.warn('Could not load VIP history:', err);
      }
    };

    loadVIPData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ text, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Pagination for VIP cards (3 cards visible at a time on desktop)
  const itemsPerPage = 3;
  const totalPages = Math.ceil(tiers.length / itemsPerPage);
  const visibleLevels = tiers.slice(carouselPage * itemsPerPage, (carouselPage + 1) * itemsPerPage);

  const getTodayDateString = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
  };

  const todayStr = getTodayDateString();

  const userVipLevel = user.vipLevel || 0;
  const userBet = user.vipExp || 0;
  const currentTier = tiers.find(t => t.level === userVipLevel) || tiers[0] || DEFAULT_VIP_LEVELS[0];

  // Check if upgrade bonus already claimed for user's level
  const isUpgradeClaimed = historyClaims.some(c => c.type === 'upgrade' && c.level === userVipLevel);

  // Handle Reward Claim
  const handleClaimReward = async (type: 'upgrade' | 'weekly' | 'monthly') => {
    setIsClaiming(true);
    try {
      const res = await api.vip.claim(type, userVipLevel);
      if (res.success) {
        showToast(res.message, 'success');
        if (onClaimSuccess) onClaimSuccess(res.claim?.bonus || 0, res.message);
        // Refresh claim history
        const hRes = await api.vip.getHistory();
        if (hRes.success && hRes.history) {
          setHistoryClaims(hRes.history);
        }
        if (onRefreshUser) onRefreshUser();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'দাবি প্রক্রিয়া সম্পন্ন করা যায়নি', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  // Filter Claims
  const filteredClaims = historyClaims.filter(claim => {
    if (historyFilter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      return claim.timestamp >= startOfDay.getTime();
    }
    if (historyFilter === 'yesterday') {
      const startOfYesterday = new Date();
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date();
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);
      return claim.timestamp >= startOfYesterday.getTime() && claim.timestamp <= endOfYesterday.getTime();
    }
    if (historyFilter === '7days') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return claim.timestamp >= sevenDaysAgo;
    }
    return true;
  });

  const totalBonusSum = filteredClaims.reduce((acc, curr) => acc + curr.bonus, 0);

  return (
    <main className="flex-1 bg-white flex flex-col overflow-hidden text-gray-800 font-sans relative">
      {/* Toast */}
      {feedbackToast && (
        <div className={`absolute top-3 right-6 z-50 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in slide-in-from-top ${
          feedbackToast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {feedbackToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedbackToast.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER TAB BAR: পদোন্নতি | নিয়ম | পুরস্কারের ইতিহাস */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-200 px-6 pt-3.5 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-8 sm:gap-10">
          <button
            type="button"
            onClick={() => setActiveTab('promotion')}
            className={`pb-2.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'promotion'
                ? 'text-red-600 font-black border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            পদোন্নতি
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'rules'
                ? 'text-red-600 font-black border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            নিয়ম
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
              activeTab === 'history'
                ? 'text-red-600 font-black border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            পুরস্কারের ইতিহাস
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: পদোন্নতি (PROMOTION & LEVEL UP PROGRESS) */}
      {/* ========================================================================= */}
      {activeTab === 'promotion' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fdfdfd] space-y-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
            
            {/* LEFT PROFILE CARD (Avatar + VIP Level + ID + Balance) */}
            <div className="w-full lg:w-72 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 pt-2 pb-6 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-8">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
                    alt={user.username || 'VIP Member'}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h3 className="text-3xl sm:text-4xl font-black italic tracking-wider text-gray-800 font-serif">
                    VIP{userVipLevel}
                  </h3>
                  <span className="text-xs font-bold text-amber-600">
                    {currentTier.name}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500 font-mono font-medium">
                <span>ID: {user.id ? String(user.id).padStart(9, '0').slice(-10) : '1615249856'}</span>
              </div>

              <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900">
                ৳ {(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>বর্তমান টার্নওভার: ৳{userBet.toLocaleString()}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: লেভেল আপ শর্তাবলী (Level Up Requirements) */}
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-4.5 bg-red-600 rounded-xs shrink-0" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  লেভেল আপ শর্তাবলী
                </h2>
              </div>
              <p className="text-xs text-gray-500 mb-6 pl-3.5">
                সমতল করার জন্য, যেকোনো শর্ত পূরণ করতে হবে
              </p>

              {/* Total Bet Label and Level Cards Carousel */}
              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                <div className="text-xs text-gray-600 font-medium whitespace-nowrap pt-3">
                  মোট বাজি
                </div>

                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {visibleLevels.map((lvl) => {
                      const target = lvl.targetBet || 1;
                      const progressPct = Math.min(100, Math.round((userBet / target) * 100));

                      return (
                        <div
                          key={lvl.level}
                          className={`bg-white rounded-xl p-4 flex flex-col items-center text-center border shadow-xs hover:shadow-sm transition-all relative overflow-hidden ${
                            lvl.level === userVipLevel ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-100'
                          }`}
                        >
                          {lvl.level === userVipLevel && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                              বর্তমান
                            </span>
                          )}

                          <div className="w-14 h-14 mb-2 flex items-center justify-center relative">
                            {lvl.level === 0 ? (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 p-0.5 shadow-md flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center border border-white">
                                  <Award className="w-6 h-6 text-slate-600 stroke-[2.2]" />
                                </div>
                              </div>
                            ) : lvl.level <= 4 ? (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 flex items-center justify-center border border-yellow-200">
                                  <Trophy className="w-6 h-6 text-amber-800 stroke-[2.2]" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-b from-cyan-200 via-blue-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-100 to-blue-200 flex items-center justify-center border border-white">
                                  <Crown className="w-6 h-6 text-indigo-800 stroke-[2.2]" />
                                </div>
                              </div>
                            )}
                          </div>

                          <h4 className="text-sm font-black text-gray-800 tracking-wide mb-1">
                            {lvl.name}
                          </h4>
                          <span className="text-[11px] text-gray-400 mb-2">{lvl.description}</span>

                          <div className="text-xs text-gray-500 font-mono font-medium">
                            <span className="text-blue-600 font-bold">
                              {userBet > 0 ? (userBet >= target ? lvl.targetBetDisplay : userBet.toLocaleString()) : '0.00'}
                            </span>
                            <span> / {lvl.targetBetDisplay}</span>
                          </div>

                          <div className="text-xs font-bold text-gray-500 mt-0.5">
                            {progressPct}%
                          </div>

                          <div className="w-full h-1.5 rounded-full bg-gray-100 mt-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Carousel Pagination */}
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCarouselPage(idx)}
                        className={`transition-all cursor-pointer rounded-full ${
                          carouselPage === idx
                            ? 'w-3 h-3 bg-slate-400'
                            : 'w-2 h-2 bg-slate-200 hover:bg-slate-300'
                        }`}
                        title={`Page ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* VIP PRIVILEGES & SALARY CLAIM DASHBOARD                                   */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4.5 bg-red-600 rounded-xs shrink-0" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                ভিআইপি স্তর সুবিধা ও বেতন সংগ্রহ (Claim Privileges)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Upgrade Bonus */}
              <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 rounded-2xl p-5 border border-amber-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">লেভেল আপগ্রেড বোনাস</span>
                    <Trophy className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 font-mono mt-2">
                    ৳ {Number(currentTier.upgradeBonus ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-amber-800/80 mt-1">
                    লেভেল অর্জনের পর এককালীন পুরস্কার
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-200/60">
                  {userVipLevel === 0 ? (
                    <span className="text-xs text-gray-400 block text-center py-2">
                      VIP 1 এ পৌঁছালে ক্লেইম করা যাবে
                    </span>
                  ) : isUpgradeClaimed ? (
                    <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs text-center">
                      ✓ সংগৃহীত
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isClaiming || currentTier.upgradeBonus <= 0}
                      onClick={() => handleClaimReward('upgrade')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isClaiming ? 'প্রসেসিং...' : 'বোনাস ক্লেইম করুন'}
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Weekly Salary */}
              <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 rounded-2xl p-5 border border-emerald-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">সাপ্তাহিক বেতন (Weekly Salary)</span>
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 font-mono mt-2">
                    ৳ {Number(currentTier.weeklyBonus ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-800/80 mt-1">
                    প্রতি {weekdayName(liveRules?.promoRules?.vip?.weeklyClaimDay)} দাবি করা যায়
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200/60">
                  {userVipLevel < 1 ? (
                    <span className="text-xs text-gray-400 block text-center py-2">
                      VIP 1 এ পৌঁছালে ক্লেইম করা যাবে
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isClaiming || currentTier.weeklyBonus <= 0}
                      onClick={() => handleClaimReward('weekly')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isClaiming ? 'প্রসেসিং...' : 'সাপ্তাহিক বেতন তুলুন'}
                    </button>
                  )}
                </div>
              </div>

              {/* Card 3: Monthly Salary */}
              <div className="bg-gradient-to-br from-indigo-50/60 to-blue-50/40 rounded-2xl p-5 border border-indigo-200 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">মাসিক বেতন (Monthly Salary)</span>
                    <Crown className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-700 font-mono mt-2">
                    ৳ {Number(currentTier.monthlyBonus ?? 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-indigo-800/80 mt-1">
                    প্রতি মাসের ১ তারিখ দুপুর ৩টায় প্রদান করা হয়
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-200/60">
                  {userVipLevel < 1 ? (
                    <span className="text-xs text-gray-400 block text-center py-2">
                      VIP 1 এ পৌঁছালে ক্লেইম করা যাবে
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isClaiming || currentTier.monthlyBonus <= 0}
                      onClick={() => handleClaimReward('monthly')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs shadow-md shadow-indigo-600/20 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isClaiming ? 'প্রসেসিং...' : 'মাসিক বেতন তুলুন'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Rebate scales banner */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-600 gap-3">
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>রিয়েল-টাইম রিবেট:</span>
                <span className="font-bold text-gray-900">প্রতিটি নতুন বাজির উপর, যতবার খুশি দাবি</span>
                <span>•</span>
                <span className="font-bold text-gray-900">হার রিবেট পেইজে দেখুন</span>
              </div>
              <div className="text-emerald-700 font-bold">
                ✓ ১ গুণ বেট সম্পন্ন করে অবিলম্বে প্রত্যাহারযোগ্য
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: নিয়ম (RULES & TERMS) */}
      {/* ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#fdfdfd]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4.5 bg-red-600 rounded-xs shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              নিয়ম
            </h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-7 text-xs sm:text-sm text-gray-700 leading-relaxed space-y-4 shadow-2xs max-w-4xl">
            <div className="font-bold text-gray-900 text-sm sm:text-base">
              <span className="text-amber-600 font-extrabold">BengalBet</span>-এর ভিআইপি প্রোগ্রামের নিয়মাবলী
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-bold text-gray-900">I. ভিআইপি স্তরসমূহ পয়েন্ট জুমা:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  VIP স্তরের জমাকৃত পয়েন্টগুলি VIP প্রোগ্রামের শুরুর সময় থেকে গণনা করা হয়।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">VIP স্তর উন্নীতকরণ:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  সিস্টেম স্বয়ংক্রিয়ভাবে পর্যবেক্ষণ ও স্তর আপডেট করে।
                </p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  যখন সদস্য বৈধ বেটিং পরিমাণ এবং নির্দিষ্ট ভিআইপি স্তরের ডিপোজিট শর্ত পূরণ করেন, তখন তাকে সঙ্গে সঙ্গে উন্নীত করা হয়।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">ভিআইপি স্তর সংরক্ষণ:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  ভিআইপি স্তর এবং ভিআইপি পুরস্কারের সুবিধা স্থায়ীভাবে সংরক্ষিত থাকে। স্তর কমানো হয় না এবং কোনো রক্ষণাবেক্ষণের শর্ত প্রয়োজন হয় না।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">II. ভিআইপি উন্নীতকরণ বোনাস:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  স্তর উন্নীত হওয়ার সঙ্গে সঙ্গে বোনাস আনলক হয়।
                </p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  প্রতিটি VIP স্তরের জন্য কেবল একবারই উন্নীতকরণ বোনাস প্রযোজ্য।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">সাপ্তাহিক বোনাস:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  প্রতি {weekdayName(liveRules?.promoRules?.vip?.weeklyClaimDay)} দাবি করা যায়; মাসিক বোনাস মাসের {liveRules?.promoRules?.vip?.monthlyClaimDay ?? 1} তারিখে (বাংলাদেশ সময়)।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">মাসিক বোনাস:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  প্রতি মাসের ১ তারিখ এ বাংলাদেশে সময় দুপুর ৩টার আগে প্রদান করা হয়।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">কার্যকারিতার সময়সীমা:</p>
                <p className="text-gray-600 pl-4 mt-0.5">মাসিক ভিআইপি প্রমোশন: ৭ দিন</p>
                <p className="text-gray-600 pl-4 mt-0.5">সাপ্তাহিক ভিআইপি প্রমোশন: ৩ দিন</p>
              </div>

              <div>
                <p className="font-bold text-gray-900">জন্মদিন বোনাস:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  দয়া করে ২৪/৭ কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন এবং উভয় দিকের আইডি কার্ড জমা দিন জন্মদিন বোনাস পাওয়ার জন্য।
                </p>
              </div>

              <div>
                <p className="font-bold text-gray-900">উত্তোলন শর্ত:</p>
                <p className="text-gray-600 pl-4 mt-0.5">
                  বোনাস উত্তোলনের জন্য শুধুমাত্র ১ গুণ বেট সম্পন্ন করলেই যথেষ্ট।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: পুরস্কারের ইতিহাস (REWARD HISTORY) */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#fdfdfd]">
          {/* Filter Bar */}
          <div className="p-4 sm:px-6 bg-white border-b border-gray-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${historyFilter === 'today' ? 'border-red-600' : 'border-gray-300'}`}>
                {historyFilter === 'today' && <span className="w-2 h-2 rounded-full bg-red-600" />}
              </span>
              <input
                type="radio"
                name="history_filter"
                className="hidden"
                checked={historyFilter === 'today'}
                onChange={() => setHistoryFilter('today')}
              />
              <span>আজ</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${historyFilter === 'yesterday' ? 'border-red-600' : 'border-gray-300'}`}>
                {historyFilter === 'yesterday' && <span className="w-2 h-2 rounded-full bg-red-600" />}
              </span>
              <input
                type="radio"
                name="history_filter"
                className="hidden"
                checked={historyFilter === 'yesterday'}
                onChange={() => setHistoryFilter('yesterday')}
              />
              <span>গতকাল</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${historyFilter === '7days' ? 'border-red-600' : 'border-gray-300'}`}>
                {historyFilter === '7days' && <span className="w-2 h-2 rounded-full bg-red-600" />}
              </span>
              <input
                type="radio"
                name="history_filter"
                className="hidden"
                checked={historyFilter === '7days'}
                onChange={() => setHistoryFilter('7days')}
              />
              <span>৭ দিন</span>
            </label>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 font-mono">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>{todayStr}~{todayStr}</span>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-5 bg-gray-100/90 text-gray-600 font-semibold text-xs py-2.5 px-4 sm:px-6 border-b border-gray-200">
              <div>তারিখ</div>
              <div>ইভেন্ট নাম</div>
              <div className="text-center">বোনাস</div>
              <div className="text-center">পয়েন্ট</div>
              <div className="text-right">টিকিটের নাম</div>
            </div>

            {/* Table Records Body */}
            {filteredClaims.length > 0 ? (
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <div key={claim.id} className="grid grid-cols-5 py-3 px-4 sm:px-6 text-xs text-gray-700 hover:bg-gray-50 items-center">
                    <div className="font-mono text-gray-500">{claim.date}</div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{claim.eventName}</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-amber-100 text-amber-800 text-[10px] font-bold">
                        VIP{claim.level}
                      </span>
                    </div>
                    <div className="text-center font-mono font-bold text-emerald-600">
                      +৳{showDecimal ? claim.bonus.toFixed(2) : Math.round(claim.bonus)}
                    </div>
                    <div className="text-center font-mono text-gray-400">
                      {showDecimal ? '0.00' : '0'}
                    </div>
                    <div className="text-right font-mono text-gray-500">
                      {claim.ticketName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-gray-400">
                কোন মিলিয়ে সংমিশ্রণ ডেটা পাওয়া যায়নি
              </div>
            )}

            {/* Table Total Row */}
            <div className="grid grid-cols-5 bg-gray-100/90 text-gray-700 font-bold text-xs py-2.5 px-4 sm:px-6 border-t border-gray-200">
              <div>মোট</div>
              <div></div>
              <div className="text-center font-mono text-emerald-600">
                ৳{showDecimal ? totalBonusSum.toFixed(2) : Math.round(totalBonusSum)}
              </div>
              <div className="text-center font-mono text-gray-400">0.00</div>
              <div></div>
            </div>
          </div>

          {/* Footer Note & Decimal Point Toggle */}
          <div className="p-3 sm:px-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="text-red-500 font-medium">
              মন্তব্য: উপরের তথ্য গ্রীনউইচ মান প্রভৃতি ভিত্তিতে
            </div>

            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <span>ডেসিমাল পয়েন্ট</span>
              <button
                type="button"
                onClick={() => setShowDecimal(!showDecimal)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  showDecimal ? 'bg-red-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                    showDecimal ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
