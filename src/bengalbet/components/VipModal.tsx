// @ts-nocheck
/**
 * BengalBet VIP Loyalty Club Modal
 * Features:
 * - Dynamic VIP tier hierarchy loaded from backend
 * - Upgrade bonuses, weekly/monthly rewards, and game rebate scales
 * - Experience points progress bar towards next level
 * - Instant claim action for available bonuses
 * - Dynamic mobile view adapter (VipMobileView)
 * - Full bilingual support (Bengali / English)
 * - Admin managed and synchronized
 */

import React, { useState, useEffect } from 'react';
import { X, Crown, Sparkles, Shield, Gift, Zap, ChevronRight, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language, UserAccount, VipTierConfig } from '../types';
import { VipMobileView } from './VipMobileView';
import { api } from '../services/api';

interface VipModalProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onRefreshUser?: () => void;
}

const DEFAULT_VIP_TIERS: VipTierConfig[] = [
  { level: 0, name: 'VIP0 Base', badgeType: 'bronze', targetBet: 2000, targetBetDisplay: '2,000.00', depositTarget: 500, upgradeBonus: 0, weeklyBonus: 0, monthlyBonus: 0, slotRebate: 0.2, liveRebate: 0.1, status: 'active', description: 'বেস মেম্বারশিপ' },
  { level: 1, name: 'VIP1 Bronze', badgeType: 'silver', targetBet: 20000, targetBetDisplay: '20,000.00', depositTarget: 2000, upgradeBonus: 50, weeklyBonus: 20, monthlyBonus: 50, slotRebate: 0.4, liveRebate: 0.3, status: 'active', description: 'সিলভার সদস্য' },
  { level: 2, name: 'VIP2 Silver', badgeType: 'silver', targetBet: 100000, targetBetDisplay: '100,000.00', depositTarget: 10000, upgradeBonus: 180, weeklyBonus: 60, monthlyBonus: 150, slotRebate: 0.6, liveRebate: 0.4, status: 'active', description: 'সিলভার স্টার' },
  { level: 3, name: 'VIP3 Gold', badgeType: 'gold', targetBet: 500000, targetBetDisplay: '500,000.00', depositTarget: 50000, upgradeBonus: 588, weeklyBonus: 188, monthlyBonus: 500, slotRebate: 0.8, liveRebate: 0.5, status: 'active', description: 'গোল্ড সদস্য' },
  { level: 4, name: 'VIP4 Platinum', badgeType: 'gold', targetBet: 2000000, targetBetDisplay: '2,000,000.00', depositTarget: 200000, upgradeBonus: 1888, weeklyBonus: 588, monthlyBonus: 1500, slotRebate: 1.0, liveRebate: 0.7, status: 'active', description: 'গোল্ড মাস্টার' },
  { level: 5, name: 'VIP5 Diamond', badgeType: 'platinum', targetBet: 5000000, targetBetDisplay: '5,000,000.00', depositTarget: 500000, upgradeBonus: 5888, weeklyBonus: 1888, monthlyBonus: 5000, slotRebate: 1.2, liveRebate: 0.9, status: 'active', description: 'প্লাটিনাম এলিট' },
  { level: 6, name: 'VIP6 Master', badgeType: 'platinum', targetBet: 10000000, targetBetDisplay: '10,000,000.00', depositTarget: 1000000, upgradeBonus: 12888, weeklyBonus: 3888, monthlyBonus: 10000, slotRebate: 1.5, liveRebate: 1.1, status: 'active', description: 'প্লাটিনাম কিং' },
  { level: 7, name: 'VIP7 Grand Master', badgeType: 'diamond', targetBet: 25000000, targetBetDisplay: '25,000,000.00', depositTarget: 2500000, upgradeBonus: 28888, weeklyBonus: 8888, monthlyBonus: 25000, slotRebate: 1.8, liveRebate: 1.3, status: 'active', description: 'ডায়মন্ড প্রিভিলেজ' },
  { level: 8, name: 'VIP8 Elite', badgeType: 'diamond', targetBet: 50000000, targetBetDisplay: '50,000,000.00', depositTarget: 5000000, upgradeBonus: 58888, weeklyBonus: 18888, monthlyBonus: 50000, slotRebate: 2.2, liveRebate: 1.6, status: 'active', description: 'ডায়মন্ড রয়্যাল' },
  { level: 9, name: 'VIP9 Crown', badgeType: 'crown', targetBet: 100000000, targetBetDisplay: '100,000,000.00', depositTarget: 10000000, upgradeBonus: 128888, weeklyBonus: 38888, monthlyBonus: 100000, slotRebate: 2.6, liveRebate: 1.8, status: 'active', description: 'ক্রাউন সুপার' },
  { level: 10, name: 'VIP10 Legend', badgeType: 'crown', targetBet: 200000000, targetBetDisplay: '200,000,000.00', depositTarget: 20000000, upgradeBonus: 300000, weeklyBonus: 88888, monthlyBonus: 200000, slotRebate: 3.0, liveRebate: 2.0, status: 'active', description: 'রয়্যাল অ্যাম্বাসেডর' }
];

export const VipModal: React.FC<VipModalProps> = ({
  language,
  user,
  onClose,
  onRefreshUser
}) => {
  const [tiers, setTiers] = useState<VipTierConfig[]>(DEFAULT_VIP_TIERS);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const res = await api.vip.getTiers();
        if (res.success && res.tiers && res.tiers.length > 0) {
          setTiers(res.tiers);
        }
      } catch (e) {
        console.warn('Using default VIP tiers in modal:', e);
      }
    };
    fetchTiers();
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const currentTier = tiers.find(t => t.level === user.vipLevel) || tiers[0] || DEFAULT_VIP_TIERS[0];
  const nextTier = tiers.find(t => t.level === user.vipLevel + 1) || currentTier;

  const targetBet = nextTier.targetBet || 10000;
  const progressPercent = Math.min(100, Math.round(((user.vipExp || 0) / targetBet) * 100));

  const handleClaim = async (type: 'upgrade' | 'weekly' | 'monthly') => {
    setIsClaiming(true);
    try {
      const res = await api.vip.claim(type, user.vipLevel);
      if (res.success) {
        showToast(res.message, 'success');
        if (onRefreshUser) onRefreshUser();
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'দাবি করা সম্ভব হয়নি', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <>
      {/* Mobile View matching screenshots */}
      <div className="block md:hidden fixed inset-0 z-50 bg-[#f5f7fa] overflow-y-auto">
        <VipMobileView
          user={user}
          onBack={onClose}
          onClose={onClose}
          onRefreshUser={onRefreshUser}
        />
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
        <div 
          id="vip-club-dialog"
          className="relative w-full max-w-3xl bg-[#082a1d] border-2 border-yellow-400 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Toast */}
          {toast && (
            <div className={`absolute top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in slide-in-from-top ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{toast.text}</span>
            </div>
          )}

          {/* VIP Banner */}
          <div className="relative p-5 sm:p-6 bg-gradient-to-r from-amber-950 via-[#3a2007] to-[#072418] border-b border-[#14593e] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg border border-yellow-200">
                <Crown className="w-8 h-8 text-black fill-black" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-black text-white font-game tracking-wide">
                    BengalBet VIP CLUB
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-400 text-black shadow-sm">
                    VIP {user.vipLevel}
                  </span>
                </div>
                <p className="text-xs text-amber-200 mt-0.5">
                  {currentTier.name} • {language === 'bn' ? 'এক্সক্লুসিভ লাইফটাইম প্রিভিলেজ' : 'Exclusive Lifetime Privileges'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            {/* Level Progress */}
            <div className="bg-[#051c13] border border-yellow-500/40 rounded-2xl p-4.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-yellow-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  {language === 'bn' ? `বর্তমান লেভেল: VIP ${user.vipLevel}` : `Current Level: VIP ${user.vipLevel}`}
                </span>
                <span className="text-gray-300 font-mono">
                  টার্নওভার: ৳{(user.vipExp || 0).toLocaleString()} / ৳{targetBet.toLocaleString()}
                </span>
              </div>
              <div className="h-3.5 rounded-full bg-[#0e3b2a] overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-yellow-300 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-emerald-400">
                  {language === 'bn' 
                    ? `পরবর্তী VIP ${nextTier.level} এ আপগ্রেড করতে আরও ৳ ${Math.max(0, targetBet - (user.vipExp || 0)).toLocaleString()} বাজি প্রয়োজন।`
                    : `Wager ৳ ${Math.max(0, targetBet - (user.vipExp || 0)).toLocaleString()} more to unlock VIP ${nextTier.level}.`}
                </span>
                <span className="font-mono font-bold text-yellow-400">{progressPercent}%</span>
              </div>
            </div>

            {/* VIP Privileges Cards with Quick Claims */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Card 1: Upgrade Bonus */}
              <div className="p-3.5 bg-[#051c13] border border-[#14593e] hover:border-yellow-500/50 rounded-2xl text-center flex flex-col justify-between">
                <div>
                  <Gift className="w-5 h-5 text-yellow-400 mx-auto mb-1.5" />
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'লেভেল আপগ্রেড' : 'Level Bonus'}</span>
                  <span className="text-sm sm:text-base font-black text-yellow-300 font-mono mt-0.5 block">৳ {currentTier.upgradeBonus}</span>
                </div>
                {user.vipLevel > 0 && currentTier.upgradeBonus > 0 && (
                  <button
                    type="button"
                    disabled={isClaiming}
                    onClick={() => handleClaim('upgrade')}
                    className="mt-2.5 w-full py-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[11px] cursor-pointer"
                  >
                    দাবি করুন
                  </button>
                )}
              </div>

              {/* Card 2: Weekly Bonus */}
              <div className="p-3.5 bg-[#051c13] border border-[#14593e] hover:border-emerald-500/50 rounded-2xl text-center flex flex-col justify-between">
                <div>
                  <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'সাপ্তাহিক রিলোড' : 'Weekly Bonus'}</span>
                  <span className="text-sm sm:text-base font-black text-emerald-300 font-mono mt-0.5 block">৳ {currentTier.weeklyBonus}</span>
                </div>
                {user.vipLevel > 0 && currentTier.weeklyBonus > 0 && (
                  <button
                    type="button"
                    disabled={isClaiming}
                    onClick={() => handleClaim('weekly')}
                    className="mt-2.5 w-full py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] cursor-pointer"
                  >
                    বেতন তুলুন
                  </button>
                )}
              </div>

              {/* Card 3: Monthly Bonus */}
              <div className="p-3.5 bg-[#051c13] border border-[#14593e] hover:border-cyan-500/50 rounded-2xl text-center flex flex-col justify-between">
                <div>
                  <Award className="w-5 h-5 text-cyan-400 mx-auto mb-1.5" />
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'মাসিক বেতন' : 'Monthly Salary'}</span>
                  <span className="text-sm sm:text-base font-black text-cyan-300 font-mono mt-0.5 block">৳ {currentTier.monthlyBonus}</span>
                </div>
                {user.vipLevel > 0 && currentTier.monthlyBonus > 0 && (
                  <button
                    type="button"
                    disabled={isClaiming}
                    onClick={() => handleClaim('monthly')}
                    className="mt-2.5 w-full py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] cursor-pointer"
                  >
                    মাসিক তুলুন
                  </button>
                )}
              </div>

              {/* Card 4: Rebate scale */}
              <div className="p-3.5 bg-[#051c13] border border-[#14593e] rounded-2xl text-center flex flex-col justify-between">
                <div>
                  <Sparkles className="w-5 h-5 text-rose-400 mx-auto mb-1.5" />
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'গেম রিবেট' : 'Rebate'}</span>
                  <span className="text-sm sm:text-base font-black text-rose-300 font-mono mt-0.5 block">
                    {currentTier.slotRebate}% / {currentTier.liveRebate}%
                  </span>
                </div>
                <span className="mt-2.5 text-[10px] text-gray-400 block">স্লট / লাইভ</span>
              </div>
            </div>

            {/* VIP Tiers Table */}
            <div className="border border-[#14593e] rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-[#0e432f] px-4 py-2.5 text-xs font-bold text-yellow-300 flex items-center justify-between">
                <span>{language === 'bn' ? 'সমস্ত ভিআইপি লেভেলের তালিকা ও সুবিধা' : 'VIP Tiers Breakdown'}</span>
                <span className="text-[11px] text-emerald-300 font-normal">অ্যাডমিন সিঙ্ক সক্রিয়</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] text-emerald-200">
                  <thead className="bg-[#051c13] text-gray-400 border-b border-[#14593e]">
                    <tr>
                      <th className="p-2.5">লেভেল</th>
                      <th className="p-2.5">টার্গেট বাজি</th>
                      <th className="p-2.5">আপগ্রেড বোনাস</th>
                      <th className="p-2.5">সাপ্তাহিক বেতন</th>
                      <th className="p-2.5">মাসিক বেতন</th>
                      <th className="p-2.5">রিবেট (Slot/Live)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14593e]/50">
                    {tiers.map(t => (
                      <tr key={t.level} className={t.level === user.vipLevel ? 'bg-yellow-500/15 font-bold' : 'hover:bg-white/5'}>
                        <td className="p-2.5 text-yellow-400">
                          {t.name}
                          {t.level === user.vipLevel && (
                            <span className="ml-1.5 text-[9px] bg-yellow-400 text-black px-1.5 py-0.2 rounded-xs font-black">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono">৳{t.targetBetDisplay || t.targetBet.toLocaleString()}</td>
                        <td className="p-2.5 text-emerald-300 font-mono font-bold">৳{t.upgradeBonus.toLocaleString()}</td>
                        <td className="p-2.5 font-mono">৳{t.weeklyBonus.toLocaleString()}</td>
                        <td className="p-2.5 font-mono">৳{t.monthlyBonus.toLocaleString()}</td>
                        <td className="p-2.5 text-yellow-300 font-mono">{t.slotRebate}% / {t.liveRebate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
