// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Crown, Trophy, Award, Star, Plus, Edit3, Trash2, RotateCcw, 
  Search, ShieldCheck, DollarSign, Users, Gift, CheckCircle2, 
  AlertCircle, X, ChevronRight, Filter, Clock, Sparkles, UserCheck
} from 'lucide-react';
import { VipTierConfig, VipRewardRecord, UserAccount } from '../types';
import { api } from '../services/api';

interface NeextHubAdminVipManagerProps {
  language: 'bn' | 'en';
  users?: UserAccount[];
  onRefreshUsers?: () => void;
  onRefreshSiteUser?: () => void;
}

const DEFAULT_TIERS: VipTierConfig[] = [
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

export const NeextHubAdminVipManager: React.FC<NeextHubAdminVipManagerProps> = ({
  language,
  users = [],
  onRefreshUsers,
  onRefreshSiteUser
}) => {
  const [tiers, setTiers] = useState<VipTierConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'add' | 'edit' | 'delete' | 'user_override' | 'claims_log' | null>(null);
  
  // Selected items for modal
  const [selectedTier, setSelectedTier] = useState<VipTierConfig | null>(null);
  const [tierToDelete, setTierToDelete] = useState<VipTierConfig | null>(null);
  
  // Form State for Add / Edit
  const [formLevel, setFormLevel] = useState<number>(0);
  const [formName, setFormName] = useState<string>('');
  const [formBadgeType, setFormBadgeType] = useState<VipTierConfig['badgeType']>('silver');
  const [formTargetBet, setFormTargetBet] = useState<number>(0);
  const [formDepositTarget, setFormDepositTarget] = useState<number>(0);
  const [formUpgradeBonus, setFormUpgradeBonus] = useState<number>(0);
  const [formWeeklyBonus, setFormWeeklyBonus] = useState<number>(0);
  const [formMonthlyBonus, setFormMonthlyBonus] = useState<number>(0);
  const [formSlotRebate, setFormSlotRebate] = useState<number>(0.5);
  const [formLiveRebate, setFormLiveRebate] = useState<number>(0.3);
  const [formDescription, setFormDescription] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  // User Override Modal State
  const [overrideUserId, setOverrideUserId] = useState<string>('');
  const [overrideVipLevel, setOverrideVipLevel] = useState<number>(1);
  const [overrideVipExp, setOverrideVipExp] = useState<string>('');
  const [overrideBonusAmount, setOverrideBonusAmount] = useState<string>('0');
  const [overrideAdminNote, setOverrideAdminNote] = useState<string>('অ্যাডমিন অনুমোদিত ভিআইপি স্তর উন্নয়ন');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');

  // Claims Audit State
  const [claimsList, setClaimsList] = useState<VipRewardRecord[]>([]);
  const [claimsFilter, setClaimsFilter] = useState<'all' | 'upgrade' | 'weekly' | 'monthly'>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load VIP Tiers
  const loadTiers = async () => {
    setIsLoading(true);
    try {
      const res = await api.vip.getAdminTiers();
      if (res.success && Array.isArray(res.tiers)) {
        setTiers(res.tiers);
      } else {
        throw new Error('VIP তালিকা পাওয়া যায়নি।');
      }
    } catch (e) {
      setTiers([]);
      showToast('error', language === 'bn' ? 'VIP তালিকা লোড হয়নি। আবার চেষ্টা করুন।' : 'VIP tiers could not be loaded. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTiers();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const nextLevel = tiers.length > 0 ? Math.max(...tiers.map(t => t.level)) + 1 : 1;
    setFormLevel(nextLevel);
    setFormName(`VIP${nextLevel}`);
    setFormBadgeType(nextLevel <= 2 ? 'silver' : nextLevel <= 4 ? 'gold' : nextLevel <= 6 ? 'platinum' : nextLevel <= 8 ? 'diamond' : 'crown');
    setFormTargetBet(250000000);
    setFormDepositTarget(25000000);
    setFormUpgradeBonus(150000);
    setFormWeeklyBonus(45000);
    setFormMonthlyBonus(120000);
    setFormSlotRebate(3.2);
    setFormLiveRebate(2.2);
    setFormDescription(`নতুন VIP ${nextLevel} প্রিমিয়াম মেম্বারশিপ লেভেল`);
    setFormStatus('active');
    setSelectedTier(null);
    setActiveModal('add');
  };

  // Open Edit Modal
  const handleOpenEdit = (tier: VipTierConfig) => {
    setSelectedTier(tier);
    setFormLevel(tier.level);
    setFormName(tier.name);
    setFormBadgeType(tier.badgeType || 'silver');
    setFormTargetBet(tier.targetBet || 0);
    setFormDepositTarget(tier.depositTarget || 0);
    setFormUpgradeBonus(tier.upgradeBonus || 0);
    setFormWeeklyBonus(tier.weeklyBonus || 0);
    setFormMonthlyBonus(tier.monthlyBonus || 0);
    setFormSlotRebate(tier.slotRebate ?? 0.5);
    setFormLiveRebate(tier.liveRebate ?? 0.3);
    setFormDescription(tier.description || '');
    setFormStatus(tier.status || 'active');
    setActiveModal('edit');
  };

  // Save Tier (Add or Edit)
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tierData: Partial<VipTierConfig> = {
        level: Number(formLevel),
        name: formName.trim() || `VIP${formLevel}`,
        badgeType: formBadgeType,
        targetBet: Number(formTargetBet),
        targetBetDisplay: Number(formTargetBet).toLocaleString('en-US', { minimumFractionDigits: 2 }),
        depositTarget: Number(formDepositTarget),
        upgradeBonus: Number(formUpgradeBonus),
        weeklyBonus: Number(formWeeklyBonus),
        monthlyBonus: Number(formMonthlyBonus),
        slotRebate: Number(formSlotRebate),
        liveRebate: Number(formLiveRebate),
        description: formDescription.trim(),
        status: formStatus
      };

      const res = await api.vip.saveTier(tierData);
      if (res.success) {
        showToast('success', res.message || 'VIP লেভেল সফলভাবে সংরক্ষণ করা হয়েছে!');
        setActiveModal(null);
        await loadTiers();
      } else {
        showToast('error', res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast('error', err.message || 'সার্ভার ত্রুটি');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (tier: VipTierConfig) => {
    if (tier.level === 0) {
      showToast('error', 'VIP0 বেস লেভেল মোছা সম্ভব নয়!');
      return;
    }
    setTierToDelete(tier);
    setActiveModal('delete');
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!tierToDelete) return;
    setIsSubmitting(true);
    try {
      const res = await api.vip.deleteTier(tierToDelete.level);
      if (res.success) {
        showToast('success', res.message || `VIP ${tierToDelete.level} মোছা হয়েছে!`);
        setActiveModal(null);
        setTierToDelete(null);
        await loadTiers();
      } else {
        showToast('error', res.message || 'মুছতে ব্যর্থ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'ত্রুটি ঘটেছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে সকল ভিআইপি টিয়ার ডিফল্ট BengalBet সেটিংসে রিসেট করতে চান?')) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.vip.resetTiers();
      if (res.success) {
        showToast('success', 'সকল VIP লেভেল সফলভাবে রিসেট করা হয়েছে!');
        await loadTiers();
      } else {
        showToast('error', res.message || 'রিসেট ব্যর্থ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'ত্রুটি ঘটেছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open User Override Modal
  const handleOpenUserOverride = () => {
    if (users.length > 0) {
      setOverrideUserId(users[0].id || '');
      setOverrideVipLevel(users[0].vipLevel || 0);
      setOverrideVipExp(String(users[0].vipExp || 0));
    }
    setOverrideBonusAmount('0');
    setOverrideAdminNote('অ্যাডমিন ভিআইপি আপগ্রেড অনুমোদন');
    setActiveModal('user_override');
  };

  // Submit User Override
  const handleSubmitUserOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideUserId) {
      showToast('error', 'দয়া করে একজন প্লেয়ার নির্বাচন করুন');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.vip.overrideUser(
        overrideUserId,
        Number(overrideVipLevel),
        overrideVipExp ? Number(overrideVipExp) : undefined,
        Number(overrideBonusAmount || 0),
        overrideAdminNote
      );
      if (res.success) {
        showToast('success', res.message || 'প্লেয়ারের VIP লেভেল সফলভাবে আপডেট হয়েছে!');
        setActiveModal(null);
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      } else {
        showToast('error', res.message || 'আপডেট ব্যর্থ');
      }
    } catch (err: any) {
      showToast('error', err.message || 'ত্রুটি ঘটেছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Claims Log Modal
  const handleOpenClaimsLog = async () => {
    setActiveModal('claims_log');
    try {
      const res = await api.vip.getAdminClaims();
      if (res.success && res.claims) {
        setClaimsList(res.claims);
      }
    } catch (e) {
      console.error('Error fetching claims:', e);
    }
  };

  // Calculate VIP stats
  const totalTiersCount = tiers.length;
  const activeTiersCount = tiers.filter(t => t.status !== 'inactive').length;
  const usersWithVip = users.filter(u => (u.vipLevel || 0) > 0).length;

  const filteredUsers = users.filter(u => 
    (u.username && u.username.toLowerCase().includes(userSearchTerm.toLowerCase())) || 
    (u.phone && u.phone.includes(userSearchTerm)) ||
    (u.id && u.id.includes(userSearchTerm))
  );

  const filteredClaims = claimsList.filter(c => {
    if (claimsFilter === 'all') return true;
    return c.type === claimsFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold shadow-lg transition-all animate-in slide-in-from-top duration-200 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                ভিআইপি ক্লাব ম্যানেজার
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                  VIP Club Admin
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                BengalBet ভিআইপি স্তরসমূহ, বাজি শর্ত, আপগ্রেড বোনাস, সাপ্তাহিক ও মাসিক স্যালারি নিয়ন্ত্রণ করুন
              </p>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>নতুন লেভেল যোগ করুন</span>
            </button>

            <button
              type="button"
              onClick={handleOpenUserOverride}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-transform cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              <span>প্লেয়ার VIP পরিবর্তন</span>
            </button>

            <button
              type="button"
              onClick={handleOpenClaimsLog}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 active:scale-95 transition-transform cursor-pointer"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>ক্লেইম হিস্টোরি</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              title="ডিফল্ট সেটিংসে রিসেট"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">মোট ভিআইপি টিয়ার</div>
              <div className="text-xl font-black text-white mt-0.5">{totalTiersCount} টি স্তর</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">সক্রিয় ভিআইপি লেভেল</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{activeTiersCount} টি সক্রিয়</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">ভিআইপি স্ট্যাটাসপ্রাপ্ত প্লেয়ার</div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">{usersWithVip} জন</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400 font-medium">সর্বোচ্চ আপগ্রেড বোনাস</div>
              <div className="text-xl font-black text-amber-400 mt-0.5 font-mono">
                ৳{Math.max(...tiers.map(t => t.upgradeBonus || 0)).toLocaleString()}
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main VIP Tiers Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-amber-500 rounded-xs inline-block" />
            <h3 className="text-base font-bold text-white">সকল ভিআইপি স্তরের তালিকা ও শর্তাবলী</h3>
            <span className="text-xs text-slate-400 font-mono">({tiers.length})</span>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>সিস্টেম লাইভ: মোবাইল ও ডেস্কটপ ক্লায়েন্টে তাৎক্ষণিক কার্যকর</span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">স্তর / নাম</th>
                <th className="py-3.5 px-4">ব্যাজ ধরন</th>
                <th className="py-3.5 px-4 text-right">প্রয়োজনীয় বাজি (৳)</th>
                <th className="py-3.5 px-4 text-right">প্রয়োজনীয় ডিপোজিট (৳)</th>
                <th className="py-3.5 px-4 text-right text-amber-400">আপগ্রেড বোনাস</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">সাপ্তাহিক বেতন</th>
                <th className="py-3.5 px-4 text-right text-cyan-400">মাসিক বেতন</th>
                <th className="py-3.5 px-4 text-center">রিবেট (স্লট / লাইভ)</th>
                <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>ভিআইপি টিয়ারসমূহ লোড হচ্ছে...</span>
                    </div>
                  </td>
                </tr>
              ) : tiers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    কোন ভিআইপি স্তর পাওয়া যায়নি। "নতুন লেভেল যোগ করুন" অথবা "ডিফল্ট রিসেট" চাপুন।
                  </td>
                </tr>
              ) : (
                tiers.map((tier) => {
                  const badgeIcon = tier.level === 0 ? (
                    <Award className="w-4 h-4 text-slate-400" />
                  ) : tier.level <= 2 ? (
                    <Award className="w-4 h-4 text-slate-300" />
                  ) : tier.level <= 4 ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : tier.level <= 6 ? (
                    <Trophy className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Crown className="w-4 h-4 text-amber-300" />
                  );

                  return (
                    <tr 
                      key={tier.level}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Level & Name */}
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {badgeIcon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-amber-400">{tier.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-slate-800 text-slate-400">
                              Lvl {tier.level}
                            </span>
                          </div>
                          {tier.description && (
                            <div className="text-[10px] text-slate-400 font-normal truncate max-w-[140px]">
                              {tier.description}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Badge Type */}
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700">
                          {tier.badgeType || 'silver'}
                        </span>
                      </td>

                      {/* Target Bet */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                        ৳{tier.targetBet.toLocaleString()}
                      </td>

                      {/* Deposit Target */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-slate-200">
                        ৳{tier.depositTarget.toLocaleString()}
                      </td>

                      {/* Upgrade Bonus */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        {tier.upgradeBonus > 0 ? `+৳${tier.upgradeBonus.toLocaleString()}` : '—'}
                      </td>

                      {/* Weekly Bonus */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                        {tier.weeklyBonus > 0 ? `৳${tier.weeklyBonus.toLocaleString()}` : '—'}
                      </td>

                      {/* Monthly Bonus */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-cyan-400">
                        {tier.monthlyBonus > 0 ? `৳${tier.monthlyBonus.toLocaleString()}` : '—'}
                      </td>

                      {/* Rebates */}
                      <td className="py-3 px-4 text-center font-mono text-[11px]">
                        <span className="text-amber-300">{tier.slotRebate ?? 0.5}%</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className="text-blue-300">{tier.liveRebate ?? 0.3}%</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tier.status !== 'inactive' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {tier.status !== 'inactive' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tier)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {tier.level !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(tier)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                              title="মুছুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT VIP TIER */}
      {/* ========================================================================= */}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {activeModal === 'add' ? 'নতুন ভিআইপি লেভেল যোগ করুন' : `ভিআইপি লেভেল পরিবর্তন: ${formName}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    শর্ত ও বোনাস নির্ধারণ করুন, পরিবর্তন তাৎক্ষণিক কার্যকর হবে
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveTier} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    লেভেল নম্বর (Level Number)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formLevel}
                    onChange={(e) => setFormLevel(parseInt(e.target.value, 10) || 0)}
                    disabled={activeModal === 'edit' && formLevel === 0}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    স্তরের নাম (Tier Name)
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="যেমন: VIP1, VIP2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ব্যাজ স্টাইল (Badge Type)
                  </label>
                  <select
                    value={formBadgeType}
                    onChange={(e) => setFormBadgeType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="bronze">Bronze (ব্রোঞ্জ)</option>
                    <option value="silver">Silver (সিলভার)</option>
                    <option value="gold">Gold (গোল্ড)</option>
                    <option value="platinum">Platinum (প্লাটিনাম)</option>
                    <option value="diamond">Diamond (ডায়মন্ড)</option>
                    <option value="crown">Crown (ক্রাউন রয়্যাল)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    স্ট্যাটাস (Status)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    প্রয়োজনীয় মোট বাজি (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formTargetBet}
                    onChange={(e) => setFormTargetBet(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    টাকা: ৳{Number(formTargetBet).toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    প্রয়োজনীয় মোট ডিপোজিট (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={formDepositTarget}
                    onChange={(e) => setFormDepositTarget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    টাকা: ৳{Number(formDepositTarget).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bonus Fields */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" />
                  <span>ভিআইপি বোনাস ও রিওয়ার্ড পরিমাণ</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      আপগ্রেড বোনাস (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formUpgradeBonus}
                      onChange={(e) => setFormUpgradeBonus(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 text-xs font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      সাপ্তাহিক বেতন (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formWeeklyBonus}
                      onChange={(e) => setFormWeeklyBonus(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      মাসিক বেতন (৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMonthlyBonus}
                      onChange={(e) => setFormMonthlyBonus(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Rebate Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    স্লট ক্যাশব্যাক রিবেট (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={formSlotRebate}
                    onChange={(e) => setFormSlotRebate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    লাইভ ক্যাসিনো রিবেট (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={formLiveRebate}
                    onChange={(e) => setFormLiveRebate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  বিবরণ (Description / Note)
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="যেমন: বেঙ্গলবেট এক্সক্লুসিভ রয়্যাল সুবিধা..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE CONFIRMATION */}
      {/* ========================================================================= */}
      {activeModal === 'delete' && tierToDelete && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">ভিআইপি লেভেল মুছে ফেলবেন?</h3>
              <p className="text-xs text-slate-400">
                আপনি কি নিশ্চিত যে <span className="text-amber-400 font-bold">{tierToDelete.name}</span> (Lvl {tierToDelete.level}) মুছে ফেলতে চান?
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, মুছুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PLAYER VIP OVERRIDE & SPECIAL BONUS */}
      {/* ========================================================================= */}
      {activeModal === 'user_override' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">প্লেয়ার ভিআইপি পরিবর্তন ও ক্রেডিট</h3>
                  <p className="text-xs text-slate-400">যেকোনো সদস্যকে সরাসরি VIP আপগ্রেড বা বোনাস প্রদান করুন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUserOverride} className="p-5 space-y-4">
              {/* User Search & Select */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  প্লেয়ার খুঁজুন / নির্বাচন করুন
                </label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="ইউজারনেম বা ফোন নম্বর লিখুন..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>

                <select
                  value={overrideUserId}
                  onChange={(e) => {
                    setOverrideUserId(e.target.value);
                    const matched = users.find(u => u.id === e.target.value);
                    if (matched) {
                      setOverrideVipLevel(matched.vipLevel || 0);
                      setOverrideVipExp(String(matched.vipExp || 0));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                  required
                >
                  {filteredUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.phone || u.id}) — বর্তমান: VIP{u.vipLevel || 0} (ব্যালেন্স: ৳{u.balance})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target VIP Tier */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    নতুন VIP স্তর
                  </label>
                  <select
                    value={overrideVipLevel}
                    onChange={(e) => setOverrideVipLevel(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs focus:border-cyan-500 outline-none"
                  >
                    {tiers.map(t => (
                      <option key={t.level} value={t.level}>
                        {t.name} (Lvl {t.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    কাস্টম বাজি EXP (ঐচ্ছিক)
                  </label>
                  <input
                    type="number"
                    value={overrideVipExp}
                    onChange={(e) => setOverrideVipExp(e.target.value)}
                    placeholder="টার্নওভার পয়েন্ট"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              {/* Instant Bonus */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  তাত্ক্ষণিক বিশেষ ভিআইপি বোনাস (৳)
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={overrideBonusAmount}
                  onChange={(e) => setOverrideBonusAmount(e.target.value)}
                  placeholder="0 (ঐচ্ছিক)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-mono font-bold text-xs focus:border-cyan-500 outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  প্লেয়ারের অ্যাকাউন্টে সরাসরি যোগ হবে এবং ইনবক্সে নোটিফিকেশন যাবে
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  অ্যাডমিন নোট
                </label>
                <input
                  type="text"
                  value={overrideAdminNote}
                  onChange={(e) => setOverrideAdminNote(e.target.value)}
                  placeholder="অ্যাডমিন অনুমোদিত স্তর উন্নয়ন"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'আপডেট হচ্ছে...' : 'আপডেট প্রয়োগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLAIMS AUDIT LOG */}
      {/* ========================================================================= */}
      {activeModal === 'claims_log' && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ভিআইপি বোনাস দাবি ও অডিট লগ</h3>
                  <p className="text-xs text-slate-400">সকল সদস্যদের ক্লেইমকৃত আপগ্রেড, সাপ্তাহিক ও মাসিক বোনাস রেকর্ড</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2">
              <span className="text-xs text-slate-400 mr-2">ফিল্টার:</span>
              {(['all', 'upgrade', 'weekly', 'monthly'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setClaimsFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    claimsFilter === f 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'সকল ক্লেইম' : f === 'upgrade' ? 'আপগ্রেড বোনাস' : f === 'weekly' ? 'সাপ্তাহিক বেতন' : 'মাসিক বেতন'}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">তারিখ / সময়</th>
                    <th className="py-2.5 px-4">ব্যবহারকারী</th>
                    <th className="py-2.5 px-4">স্তর</th>
                    <th className="py-2.5 px-4">ইভেন্টের নাম</th>
                    <th className="py-2.5 px-4 text-right">বোনাস (৳)</th>
                    <th className="py-2.5 px-4">টিকিট</th>
                    <th className="py-2.5 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500">
                        কোনো বোনাস দাবির ইতিহাস পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-mono text-slate-400">
                          {claim.date} <span className="text-[10px] text-slate-500">({new Date(claim.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                        </td>
                        <td className="py-2.5 px-4 font-bold text-white">
                          {claim.username || claim.userId}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-amber-400">
                          VIP{claim.level}
                        </td>
                        <td className="py-2.5 px-4">
                          {claim.eventName}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-400">
                          +৳{claim.bonus.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                          {claim.ticketName}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                            সফল
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>মোট রেকর্ড: {filteredClaims.length} টি</span>
              <span className="font-mono text-emerald-400 font-bold">
                মোট বিতরণ: ৳{filteredClaims.reduce((acc, curr) => acc + (curr.bonus || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
