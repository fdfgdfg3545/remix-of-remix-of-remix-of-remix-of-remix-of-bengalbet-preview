// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar, 
  X, 
  Shield, 
  ArrowRight,
  Sparkles,
  Gift,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Crown
} from 'lucide-react';
import { UserAccount, VipTierConfig, VipRewardRecord } from '../types';
import { api } from '../services/api';
import { useLiveRules, weekdayName } from '../services/promoLive';

interface VipMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  onGoToGames?: () => void;
  onRefreshUser?: () => void;
}

const DEFAULT_VIP_TIERS: VipTierConfig[] = [
  { level: 0, name: 'VIP0', badgeType: 'bronze', targetBet: 2000, targetBetDisplay: '2,000.00', depositTarget: 500, upgradeBonus: 0, weeklyBonus: 0, monthlyBonus: 0, slotRebate: 0.2, liveRebate: 0.1, status: 'active', description: 'নতুন সদস্য বেস লেভেল' },
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

/**
 * Reusable Silver Medal Ribbon vector graphic matching screenshot
 */
const SilverMedalGraphic: React.FC<{ className?: string; size?: number; badgeType?: string }> = ({ 
  className = 'w-12 h-12', 
  size = 48,
  badgeType = 'silver'
}) => {
  const isGold = badgeType === 'gold';
  const isCrown = badgeType === 'crown' || badgeType === 'diamond';

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} shrink-0 drop-shadow-sm`}
      width={size} 
      height={size}
    >
      <defs>
        <linearGradient id={`ribbonGrad_${badgeType}`} x1="0%" y1="0%" x2="100%" y2="0%">
          {isGold ? (
            <>
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#d97706" />
            </>
          ) : isCrown ? (
            <>
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#4f46e5" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#a0bad2" />
              <stop offset="50%" stopColor="#dce8f2" />
              <stop offset="100%" stopColor="#9bb6ce" />
            </>
          )}
        </linearGradient>

        <linearGradient id={`starGrad_${badgeType}`} x1="0%" y1="0%" x2="100%" y2="100%">
          {isGold ? (
            <>
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="50%" stopColor="#fcd34d" />
              <stop offset="100%" stopColor="#b45309" />
            </>
          ) : isCrown ? (
            <>
              <stop offset="0%" stopColor="#eef2ff" />
              <stop offset="50%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#4338ca" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#d5e1eb" />
              <stop offset="70%" stopColor="#a9c1d6" />
              <stop offset="100%" stopColor="#8fa9c2" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* Hanging top ribbons */}
      <path d="M30 0 L42 0 L42 42 L30 36 Z" fill={`url(#ribbonGrad_${badgeType})`} opacity="0.9" />
      <path d="M70 0 L58 0 L58 42 L70 36 Z" fill={`url(#ribbonGrad_${badgeType})`} opacity="0.9" />
      <path d="M42 0 L58 0 L58 38 L42 38 Z" fill={isGold ? "#fcd34d" : isCrown ? "#c7d2fe" : "#b4cee3"} opacity="0.75" />
      
      {/* Outer 8-point ray star */}
      <g transform="translate(50,52)">
        <polygon 
          points="0,-32 9,-22 23,-23 22,-9 32,0 22,9 23,23 9,22 0,32 -9,22 -23,23 -22,9 -32,0 -22,-9 -23,-23 -9,-22" 
          fill={`url(#starGrad_${badgeType})`} 
          stroke={isGold ? "#d97706" : isCrown ? "#4f46e5" : "#9eb9d1"} 
          strokeWidth="1"
        />
        {/* Outer circular bezel */}
        <circle cx="0" cy="0" r="24" fill="#ffffff" stroke={isGold ? "#fbbf24" : isCrown ? "#818cf8" : "#bed3e4"} strokeWidth="2.5" />
        <circle cx="0" cy="0" r="20" fill={`url(#starGrad_${badgeType})`} stroke="#ffffff" strokeWidth="1" />
        {/* Crown in center */}
        <path 
          d="M-9 7 L-10 -4 L-4 0 L0 -7 L4 0 L10 -4 L9 7 Z" 
          fill="#ffffff" 
          opacity="0.95"
        />
        <circle cx="0" cy="7" r="1.5" fill="#ffffff" />
        <circle cx="-5" cy="7" r="1.5" fill="#ffffff" />
        <circle cx="5" cy="7" r="1.5" fill="#ffffff" />
      </g>
    </svg>
  );
};

export const VipMobileView: React.FC<VipMobileViewProps> = ({
  user,
  onBack,
  onClose,
  onGoToGames,
  onRefreshUser
}) => {
  // Screens: 'main' (VIP Dashboard) | 'rules' (নিয়ম) | 'history' (পুরস্কারের ইতিহাস)
  const [currentScreen, setCurrentScreen] = useState<'main' | 'rules' | 'history'>('main');

  // Dynamic Tiers
  const liveRules = useLiveRules();
  const [tiers, setTiers] = useState<VipTierConfig[]>(DEFAULT_VIP_TIERS);
  const [claimsHistory, setClaimsHistory] = useState<VipRewardRecord[]>([]);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Upgrade Dialog
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [selectedLevelForUpgrade, setSelectedLevelForUpgrade] = useState<VipTierConfig>(DEFAULT_VIP_TIERS[0]);

  // History Tab Filter
  const [historyFilterDays, setHistoryFilterDays] = useState<'1' | '7' | '30'>('1');

  // Fetch Tiers & Claims
  useEffect(() => {
    const fetchVIPData = async () => {
      try {
        const res = await api.vip.getTiers();
        if (res.success && res.tiers && res.tiers.length > 0) {
          setTiers(res.tiers);
        }
      } catch (err) {
        console.warn('Could not fetch VIP tiers, using default:', err);
      }

      try {
        const hRes = await api.vip.getHistory();
        if (hRes.success && hRes.history) {
          setClaimsHistory(hRes.history);
        }
      } catch (err) {
        console.warn('Could not fetch VIP history:', err);
      }
    };

    fetchVIPData();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Format today's date in MM/DD - MM/DD
  const getFormattedDateRange = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${mm}/${dd}- ${mm}/${dd}`;
  };

  const userVipLevel = user?.vipLevel ?? 0;
  const userBet = user?.vipExp || 0;
  const currentTier = tiers.find(t => t.level === userVipLevel) || tiers[0] || DEFAULT_VIP_TIERS[0];
  const nextTier = tiers.find(t => t.level === userVipLevel + 1) || currentTier;

  // Handle Bonus Claim
  const handleClaim = async (type: 'upgrade' | 'weekly' | 'monthly', level?: number) => {
    setIsClaiming(true);
    try {
      const res = await api.vip.claim(type, level ?? userVipLevel);
      if (res.success) {
        showToast(res.message, 'success');
        // Refresh claims
        const hRes = await api.vip.getHistory();
        if (hRes.success && hRes.history) {
          setClaimsHistory(hRes.history);
        }
        if (onRefreshUser) onRefreshUser();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'ক্লেইম করতে ব্যর্থ', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  // Check if upgrade bonus already claimed for user's level
  const isUpgradeClaimed = claimsHistory.some(c => c.type === 'upgrade' && c.level === userVipLevel);

  // Filtered History
  const filteredClaims = claimsHistory.filter(c => {
    const days = parseInt(historyFilterDays, 10);
    const timeLimit = Date.now() - days * 24 * 60 * 60 * 1000;
    return c.timestamp >= timeLimit;
  });

  // =========================================================================
  // SCREEN 3: পুরস্কারের ইতিহাস (Screenshot 3)
  // =========================================================================
  if (currentScreen === 'history') {
    return (
      <div 
        id="vip-reward-history-mobile-view"
        className="flex flex-col h-full min-h-screen bg-[#f8fafc] text-gray-900 font-bengali select-none animate-in fade-in"
      >
        {/* Top Header matching Screenshot 3 */}
        <header className="bg-[#084e36] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-8">
            পুরস্কারের ইতিহাস
          </h1>
        </header>

        {/* Filter Bar matching Screenshot 3 */}
        <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between shadow-2xs">
          {/* Day pills: 1 দিন | 7 দিন | 30 দিন */}
          <div className="flex items-center gap-1.5">
            {(['1', '7', '30'] as const).map((days) => {
              const isSelected = historyFilterDays === days;
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setHistoryFilterDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#c5d8ea] text-[#1c4b75] shadow-xs'
                      : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {days} দিন
                </button>
              );
            })}
          </div>

          {/* Date Picker Button: 📅 08/30- 08/30 */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-mono font-bold bg-white hover:bg-gray-50 shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>{getFormattedDateRange()}</span>
          </button>
        </div>

        {/* History List or Empty State */}
        {filteredClaims.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900">{claim.eventName}</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold">
                      VIP{claim.level}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {claim.ticketName} • {claim.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600 font-mono">
                    +৳{claim.bonus.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500">
                    ক্লেইম সফল
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State matching Screenshot 3: Blue line-art inbox with paper airplane */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-48 h-48 relative flex items-center justify-center mb-2">
              <svg viewBox="0 0 200 200" className="w-full h-full text-[#0284c7]" fill="none">
                <path 
                  d="M50 100 L150 100 L165 150 L35 150 Z" 
                  stroke="#0284c7" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M35 150 L35 165 C35 170 40 175 45 175 L155 175 C160 175 165 170 165 165 L165 150" 
                  stroke="#0284c7" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M75 150 C75 162 85 168 100 168 C115 168 125 162 125 150" 
                  stroke="#0284c7" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M95 145 C80 135 70 115 95 100 C115 88 125 110 105 118 C90 123 110 90 135 75" 
                  stroke="#0284c7" 
                  strokeWidth="2.5" 
                  strokeDasharray="4 4" 
                  strokeLinecap="round" 
                />
                <g transform="translate(130, 60) rotate(-15)">
                  <path 
                    d="M0 0 L30 -15 L10 25 L5 10 Z" 
                    fill="#0284c7" 
                    stroke="#0284c7" 
                    strokeWidth="2" 
                    strokeLinejoin="round" 
                  />
                  <path 
                    d="M0 0 L30 -15 L5 10 Z" 
                    fill="#38bdf8" 
                  />
                </g>
                <path d="M60 70 L62 66 L66 64 L62 62 L60 58 L58 62 L54 64 L58 66 Z" fill="#0284c7" />
                <path d="M150 90 L151 87 L154 86 L151 85 L150 82 L149 85 L146 86 L149 87 Z" fill="#0284c7" />
                <circle cx="80" cy="80" r="2" fill="#0284c7" />
                <circle cx="130" cy="75" r="2" fill="#0284c7" />
                <circle cx="65" cy="100" r="2.5" fill="#0284c7" />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#0284c7] tracking-wide">
              কোন ডেটা নেই
            </h2>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: নিয়ম (VIP Rules - Screenshot 4 & 5)
  // =========================================================================
  if (currentScreen === 'rules') {
    return (
      <div 
        id="vip-rules-mobile-view"
        className="flex flex-col h-full min-h-screen bg-[#f8fafc] text-gray-900 font-bengali select-none animate-in fade-in"
      >
        {/* Top Header matching Screenshot 4 */}
        <header className="bg-[#084e36] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentScreen('main')}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-8">
            নিয়ম
          </h1>
        </header>

        {/* Rules Content matching Screenshot 4 & 5 */}
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full space-y-6 text-xs sm:text-sm text-gray-600 leading-relaxed">
          
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-gray-900 text-sm mb-1">
                I. ভিআইপি স্তরসমূহ পয়েন্ট জুমা:
              </h3>
              <p>
                VIP স্তরের জমাকৃত পয়েন্টগুলি VIP প্রোগ্রামের শুরুর সময় থেকে গণনা করা হয়।
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">
                VIP স্তর উন্নীতকরণ:
              </h4>
              <p>
                সিস্টেম প্রতি ঘণ্টায় স্বয়ংক্রিয়ভাবে পর্যবেক্ষণ ও স্তর আপডেট করে।
              </p>
              <p className="mt-1">
                যখন সদস্য বৈধ বেটিং পরিমাণ এবং নির্দিষ্ট ভিআইপি স্তরের ডিপোজিট শর্ত পূরণ করেন, তখন তাকে সঙ্গে সঙ্গে উন্নীত করা হয়।
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">
                ভিআইপি স্তর সংরক্ষণ:
              </h4>
              <p>
                ভিআইপি স্তর এবং ভিআইপি পুরস্কারের সুবিধা স্থায়ীভাবে সংরক্ষিত থাকে। স্তর কমানো হয় না এবং কোনো রক্ষণাবেক্ষণের শর্ত প্রয়োজন হয় না।
              </p>
            </div>

            <div>
              <h3 className="font-black text-gray-900 text-sm mb-1">
                II. ভিআইপি উন্নীতকরণ বোনাস:
              </h3>
              <p>
                স্তর উন্নীত হওয়ার সঙ্গে সঙ্গে স্বয়ংক্রিয়ভাবে ক্লেইমের জন্য আনলক হয়।
              </p>
              <p className="mt-1">
                প্রতিটি VIP স্তরের জন্য কেবল একবারই উন্নীতকরণ বোনাস প্রযোজ্য।
              </p>
            </div>

            <div>
              <p>
                <strong className="text-gray-800">সাপ্তাহিক বোনাস:</strong> প্রতি {weekdayName(liveRules?.promoRules?.vip?.weeklyClaimDay)} দাবি করা যায়; মাসিক বোনাস মাসের {liveRules?.promoRules?.vip?.monthlyClaimDay ?? 1} তারিখে (বাংলাদেশ সময়)।
              </p>
              <p className="mt-1">
                <strong className="text-gray-800">মাসিক বোনাস:</strong> প্রতি মাসের ১ তারিখ এ বাংলাদেশে সময় দুপুর ৩টার আগে প্রদান করা হয়।
              </p>
              <p className="mt-1">
                <strong className="text-gray-800">বোনাস প্রাপ্তির পদ্ধতি:</strong> সদস্যদের তাদের অ্যাকাউন্টে লগইন করে বোনাস সংগ্রহ করতে হবে।
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">
                কার্যকারিতার সময়সীমা:
              </h4>
              <p>মাসিক ভিআইপি প্রমোশন: ৭ দিন</p>
              <p>সাপ্তাহিক ভিআইপি প্রমোশন: ৩ দিন</p>
              <p className="mt-1">উক্ত সময়সীমা শেষ হলে প্রমোশনটি স্বয়ংক্রিয়ভাবে অকার্যকর হবে।</p>
            </div>

            <div>
              <p>
                <strong className="text-gray-800">জন্মদিন বোনাস:</strong> দয়া করে ২৪/৭ কাস্টমার সার্ভিসের সাথে যোগাযোগ করুন এবং উভয় দিকের আইডি কার্ড জমা দিন জন্মদিন বোনাস পাওয়ার জন্য।
              </p>
              <p className="mt-2">
                <strong className="text-gray-800">উত্তোলন শর্ত:</strong> বোনাস উত্তোলনের জন্য শুধুমাত্র ১ গুণ বেট সম্পন্ন করলেই যথেষ্ট।
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: প্রধান ভিআইপি ড্যাশবোর্ড (Screenshot 1 & 2)
  // =========================================================================
  return (
    <div 
      id="vip-mobile-view"
      className="flex flex-col h-full min-h-screen bg-[#f5f7fa] text-gray-900 font-bengali select-none animate-in fade-in relative pb-16"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-3.5 rounded-xl text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in slide-in-from-top ${
          toastMessage.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header matching Screenshot 1 */}
      <header className="bg-[#084e36] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Right Action: "নিয়ম" */}
        <button
          type="button"
          onClick={() => setCurrentScreen('rules')}
          className="text-base sm:text-lg font-black text-white hover:text-emerald-200 tracking-wide cursor-pointer transition-colors px-2 py-1"
        >
          নিয়ম
        </button>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-6">
        
        {/* Top VIP Banner Card matching Screenshot 1 */}
        <div className="rounded-2xl bg-gradient-to-r from-[#d9e2ec] via-[#f0f4f8] to-[#e1e9f0] p-4.5 flex items-center justify-between shadow-xs border border-white/90 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />

          {/* Left: Medal Graphic + "VIP Level" */}
          <div className="flex items-center gap-3 relative z-10">
            <SilverMedalGraphic size={54} className="w-14 h-14" badgeType={currentTier.badgeType} />
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight">
                VIP{userVipLevel}
              </h2>
              <span className="text-[11px] text-gray-600 font-medium">
                {currentTier.name}
              </span>
            </div>
          </div>

          {/* Right: "আপগ্রেড করুন ➔" Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedLevelForUpgrade(nextTier);
              setIsUpgradeModalOpen(true);
            }}
            className="bg-[#e4ebf2] hover:bg-[#d8e2eb] active:scale-95 text-gray-800 font-black text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs border border-white/80 cursor-pointer transition-all relative z-10"
          >
            <span>আপগ্রেড করুন</span>
            <ArrowRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Section 1: বেতন ও বোনাস (Salary & Bonus Claim Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#e52836] rounded-xs inline-block" />
              <h3 className="text-base font-bold text-gray-900">
                বেতন ও বোনাস সুবিধা
              </h3>
            </div>

            {/* "🕒 ইতিহাস" Button */}
            <button
              type="button"
              onClick={() => setCurrentScreen('history')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#dbe4ec]/80 hover:bg-[#d0dde7] text-gray-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span>ইতিহাস</span>
            </button>
          </div>

          {/* 3 Interactive Cards for Salary & Rewards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Level Upgrade Bonus */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                  <span>লেভেল আপগ্রেড বোনাস</span>
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-lg font-black text-amber-600 font-mono mt-1">
                  ৳{currentTier.upgradeBonus.toLocaleString()}
                </div>
              </div>

              <div className="mt-3">
                {userVipLevel === 0 ? (
                  <span className="text-[11px] text-gray-400">VIP 1 এ আনলক হবে</span>
                ) : isUpgradeClaimed ? (
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full block text-center">
                    সংগৃহীত
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isClaiming || currentTier.upgradeBonus <= 0}
                    onClick={() => handleClaim('upgrade')}
                    className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'প্রসেসিং...' : 'দাবি করুন'}
                  </button>
                )}
              </div>
            </div>

            {/* 2. Weekly Salary */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                  <span>সাপ্তাহিক বেতন</span>
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-lg font-black text-emerald-600 font-mono mt-1">
                  ৳{currentTier.weeklyBonus.toLocaleString()}
                </div>
              </div>

              <div className="mt-3">
                {userVipLevel < 1 ? (
                  <span className="text-[11px] text-gray-400">VIP 1 এ আনলক হবে</span>
                ) : (
                  <button
                    type="button"
                    disabled={isClaiming || currentTier.weeklyBonus <= 0}
                    onClick={() => handleClaim('weekly')}
                    className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'প্রসেসিং...' : 'বেতন তুলুন'}
                  </button>
                )}
              </div>
            </div>

            {/* 3. Monthly Salary */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
                  <span>মাসিক বেতন</span>
                  <Crown className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <div className="text-lg font-black text-cyan-600 font-mono mt-1">
                  ৳{currentTier.monthlyBonus.toLocaleString()}
                </div>
              </div>

              <div className="mt-3">
                {userVipLevel < 1 ? (
                  <span className="text-[11px] text-gray-400">VIP 1 এ আনলক হবে</span>
                ) : (
                  <button
                    type="button"
                    disabled={isClaiming || currentTier.monthlyBonus <= 0}
                    onClick={() => handleClaim('monthly')}
                    className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isClaiming ? 'প্রসেসিং...' : 'বেতন তুলুন'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: লেভেল আপ প্রয়োজনীয়তা (Level Up Requirements) matching Screenshot 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#e52836] rounded-xs inline-block" />
            <h3 className="text-base font-bold text-gray-900">
              লেভেল আপ প্রয়োজনীয়তা
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            সমতল করার জন্য, যেকোনো শর্ত পূরণ করতে হবে
          </p>

          {/* Table Container Card matching Screenshot 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 flex overflow-hidden relative">
            
            {/* Left Fixed Column: মোট বাজি */}
            <div className="w-24 shrink-0 flex flex-col justify-center border-r border-gray-100 pr-2">
              <span className="text-xs sm:text-sm font-bold text-gray-800">
                মোট বাজি
              </span>
            </div>

            {/* Right Sliding Levels List */}
            <div className="flex-1 overflow-x-auto pl-3 scrollbar-none flex gap-6 items-center">
              {tiers.map((tier) => {
                const targetBet = tier.targetBet || 1;
                const progressPct = Math.min(100, Math.round((userBet / targetBet) * 100));
                const isCurrent = tier.level === userVipLevel;

                return (
                  <div
                    key={tier.level}
                    onClick={() => {
                      setSelectedLevelForUpgrade(tier);
                      setIsUpgradeModalOpen(true);
                    }}
                    className="flex flex-col items-center min-w-[120px] text-center cursor-pointer group"
                  >
                    {/* Medal Graphic */}
                    <SilverMedalGraphic size={36} className="w-9 h-9 mb-1" badgeType={tier.badgeType} />

                    {/* Level Title */}
                    <span className={`text-xs font-bold ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                      {tier.name}
                    </span>

                    {/* Value */}
                    <div className="text-[11px] font-mono mt-1 text-gray-400">
                      <span className="font-semibold text-gray-600">
                        {userBet > 0 ? (userBet >= targetBet ? tier.targetBetDisplay : userBet.toLocaleString()) : '0.00'}
                      </span>
                      <div className="text-[10px]">/{tier.targetBetDisplay || tier.targetBet.toLocaleString()}</div>
                    </div>

                    {/* Percentage */}
                    <div className="mt-4 text-[11px] font-bold text-gray-600 font-mono">
                      {progressPct}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination dots matching Screenshot 1 */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* UPGRADE MODAL DIALOG matching Screenshot 2 */}
      {/* ========================================================================= */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 bg-black/65 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          
          {/* Modal Container */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-xs sm:max-w-sm mx-auto mb-4 animate-in zoom-in-95 duration-200">
            
            {/* Header Banner with Medal Graphic on Right */}
            <div className="bg-gradient-to-r from-[#e3eaf2] via-[#dce7f0] to-[#cfe0ee] p-4 flex items-center justify-between border-b border-white/70 relative">
              <div className="space-y-1 pr-3">
                <h3 className="text-base sm:text-lg font-black text-gray-900">
                  {selectedLevelForUpgrade.name} আপগ্রেড
                </h3>
                <p className="text-[11px] text-gray-600 leading-tight">
                  সমতল করার জন্য, যেকোনো শর্ত পূরণ করতে হবে
                </p>
              </div>

              {/* Large Medal graphic on top right */}
              <SilverMedalGraphic size={64} className="w-16 h-16 shrink-0" badgeType={selectedLevelForUpgrade.badgeType} />
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="text-xs font-bold text-gray-700">
                মোট বাজি
              </div>

              {/* Value */}
              <div className="text-sm font-black text-gray-900 font-mono">
                ৳ {userBet.toLocaleString()} /{selectedLevelForUpgrade.targetBetDisplay || selectedLevelForUpgrade.targetBet.toLocaleString()}
              </div>

              {/* Progress & 'যাও' button */}
              <div className="flex items-center gap-3 pt-1">
                {/* Progress bar */}
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all" 
                    style={{ width: `${Math.min(100, Math.round((userBet / (selectedLevelForUpgrade.targetBet || 1)) * 100))}%` }}
                  />
                </div>

                <span className="text-xs font-bold text-gray-600 font-mono">
                  {Math.min(100, Math.round((userBet / (selectedLevelForUpgrade.targetBet || 1)) * 100))}%
                </span>

                {/* 'যাও' Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsUpgradeModalOpen(false);
                    if (onGoToGames) {
                      onGoToGames();
                    } else if (onBack) {
                      onBack();
                    }
                  }}
                  className="px-5 py-1.5 rounded-full bg-[#2c333a] hover:bg-[#1a2026] text-white font-bold text-xs shadow-xs active:scale-95 transition-transform cursor-pointer"
                >
                  যাও
                </button>
              </div>

              {/* Upgrade Bonus Preview */}
              {selectedLevelForUpgrade.upgradeBonus > 0 && (
                <div className="pt-2 border-t border-gray-100 text-xs text-gray-600 flex justify-between items-center">
                  <span>আপগ্রেড বোনাস পুরস্কার:</span>
                  <span className="font-bold text-amber-600 font-mono">+৳{selectedLevelForUpgrade.upgradeBonus.toLocaleString()}</span>
                </div>
              )}
            </div>

          </div>

          {/* Close button with circular white style matching Screenshot 2 */}
          <button
            type="button"
            onClick={() => setIsUpgradeModalOpen(false)}
            className="w-10 h-10 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-2xl hover:bg-gray-100 active:scale-95 transition-transform cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

        </div>
      )}

    </div>
  );
};
