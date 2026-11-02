// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Gift,
  Settings,
  Share2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Percent,
  Download,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  History,
  Eye,
  ShieldAlert,
  Sparkles,
  FileText,
  Trash2,
  Plus,
  RotateCcw,
  Save,
  Pencil,
  X,
  Sliders,
  Calculator,
  Check,
  Layers,
  Zap,
  Trophy,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export interface InstantBonusRangeItem {
  id: number;
  minCount: number;
  maxCount: number;
  instantBonus: number;
  label?: string;
  desc?: string;
}

export const DEFAULT_INSTANT_BONUS_RANGES: InstantBonusRangeItem[] = [
  { id: 1, minCount: 1, maxCount: 5, instantBonus: 300, label: '১ - ৫ জন বন্ধু', desc: 'প্রতি রেফারে তাৎক্ষণিক ৩০০ টাকা' },
  { id: 2, minCount: 6, maxCount: 10, instantBonus: 1500, label: '৬ - ১০ জন বন্ধু', desc: 'প্রতি রেফারে তাৎক্ষণিক ১৫০০ টাকা' },
  { id: 3, minCount: 11, maxCount: 20, instantBonus: 3000, label: '১১ - ২০ জন বন্ধু', desc: 'প্রতি রেফারে তাৎক্ষণিক ৩০০০ টাকা' },
  { id: 4, minCount: 21, maxCount: 50, instantBonus: 5000, label: '২১ - ৫০ জন বন্ধু', desc: 'প্রতি রেফারে তাৎক্ষণিক ৫০০০ টাকা' },
  { id: 5, minCount: 51, maxCount: 999999, instantBonus: 10000, label: '৫১+ জন বন্ধু', desc: 'প্রতি রেফারে তাৎক্ষণিক ১০,০০০ টাকা' },
];

export interface PoroskarLevelItem {
  id: number;
  level: number;
  requiredCount: number;
  rewardAmount: number;
  name?: string;
  badge?: string;
  desc?: string;
}

export const DEFAULT_POROSKAR_LEVELS: PoroskarLevelItem[] = [
  { id: 1, level: 1, requiredCount: 2, rewardAmount: 1, name: 'লেভেল ১ - সূচনা পদক', badge: 'ব্রোঞ্জ', desc: '২ জন বন্ধু কোটা পূরণ' },
  { id: 2, level: 2, requiredCount: 4, rewardAmount: 150, name: 'লেভেল ২ - রৌপ্য পদক', badge: 'সিলভার', desc: '৪ জন বন্ধু কোটা পূরণ' },
  { id: 3, level: 3, requiredCount: 8, rewardAmount: 350, name: 'লেভেল ৩ - স্বর্ণ পদক', badge: 'গোল্ড', desc: '৮ জন বন্ধু কোটা পূরণ' },
  { id: 4, level: 4, requiredCount: 15, rewardAmount: 800, name: 'লেভেল ৪ - প্লাটিনাম পদক', badge: 'প্লাটিনাম', desc: '১৫ জন বন্ধু কোটা পূরণ' },
  { id: 5, level: 5, requiredCount: 30, rewardAmount: 2000, name: 'লেভেল ৫ - ডায়মন্ড পদক', badge: 'ডায়মন্ড', desc: '৩০ জন বন্ধু কোটা পূরণ' },
  { id: 6, level: 6, requiredCount: 60, rewardAmount: 5000, name: 'লেভেল ৬ - ক্রাউন পদক', badge: 'ক্রাউন', desc: '৬০ জন বন্ধু কোটা পূরণ' },
  { id: 7, level: 7, requiredCount: 100, rewardAmount: 12000, name: 'লেভেল ৭ - মাস্টার পদক', badge: 'মাস্টার', desc: '১০০ জন বন্ধু কোটা পূরণ' },
  { id: 8, level: 8, requiredCount: 250, rewardAmount: 35000, name: 'লেভেল ৮ - গ্র্যান্ড মাস্টার পদক', badge: 'গ্র্যান্ডমাস্টার', desc: '২৫০ জন বন্ধু কোটা পূরণ' },
  { id: 9, level: 9, requiredCount: 500, rewardAmount: 80000, name: 'লেভেল ৯ - লিজেন্ড পদক', badge: 'লিজেন্ড', desc: '৫০০ জন বন্ধু কোটা পূরণ' },
  { id: 10, level: 10, requiredCount: 1000, rewardAmount: 200000, name: 'লেভেল ১০ - রয়্যাল সম্রাট পদক', badge: 'সম্রাট', desc: '১০০০ জন বন্ধু কোটা পূরণ' },
];

const DEFAULT_LADDER_TIERS = [
  { id: 1, count: 1, bonus: 300, desc: '১ম বন্ধু আমন্ত্রণ' },
  { id: 2, count: 2, bonus: 300, desc: '২য় বন্ধু আমন্ত্রণ' },
  { id: 3, count: 3, bonus: 300, desc: '৩য় বন্ধু আমন্ত্রণ' },
  { id: 4, count: 4, bonus: 300, desc: '৪র্থ বন্ধু আমন্ত্রণ' },
  { id: 5, count: 5, bonus: 300, desc: '৫ম বন্ধু আমন্ত্রণ' },
  { id: 6, count: 10, bonus: 1500, desc: '১০ জন বন্ধু মেগা রিওয়ার্ড' },
  { id: 7, count: 15, bonus: 1500, desc: '১৫ জন বন্ধু মেগা রিওয়ার্ড' },
  { id: 8, count: 20, bonus: 1500, desc: '২০ জন বন্ধু মেগা রিওয়ার্ড' },
  { id: 9, count: 30, bonus: 3000, desc: '৩০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 10, count: 40, bonus: 3000, desc: '৪০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 11, count: 50, bonus: 3000, desc: '৫০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 12, count: 60, bonus: 3000, desc: '৬০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 13, count: 70, bonus: 3000, desc: '৭০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 14, count: 80, bonus: 3000, desc: '৮০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 15, count: 90, bonus: 3000, desc: '৯০ জন বন্ধু সুপার রিওয়ার্ড' },
  { id: 16, count: 100, bonus: 5000, desc: '১০০ জন বন্ধু কিং রিওয়ার্ড' },
  { id: 17, count: 35000, bonus: 1500000, desc: '৩৫,০০০ জন বন্ধু গ্র্যান্ড রিওয়ার্ড' },
  { id: 18, count: 40000, bonus: 1500000, desc: '৪০,০০০ জন বন্ধু গ্র্যান্ড রিওয়ার্ড' },
  { id: 19, count: 50000, bonus: 3000000, desc: '৫০,০০০ জন বন্ধু আলটিমেট বোনাস' },
  { id: 20, count: 60000, bonus: 3000000, desc: '৬০,০০০ জন বন্ধু আলটিমেট বোনাস' },
  { id: 21, count: 70000, bonus: 3000000, desc: '৭০,০০০ জন বন্ধু আলটিমেট বোনাস' },
  { id: 22, count: 80000, bonus: 3000000, desc: '৮০,০০০ জন বন্ধু আলটিমেট বোনাস' },
  { id: 23, count: 90000, bonus: 3000000, desc: '৯০,০০০ জন বন্ধু আলটিমেট বোনাস' },
  { id: 24, count: 100000, bonus: 3000000, desc: '১,০০,০০০ জন বন্ধু আলটিমেট বোনাস' },
];

interface NeextHubAdminReferralsManagerProps {
  onRefresh?: () => void;
  showToast?: (msg: string) => void;
  onOpenUserDetail?: (userId: string) => void;
}

export const NeextHubAdminReferralsManager: React.FC<NeextHubAdminReferralsManagerProps> = ({
  onRefresh,
  showToast = () => {},
  onOpenUserDetail
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'top' | 'ranges' | 'poroskar' | 'tiers' | 'settings' | 'claims'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Stats & Data
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalBonusPaid: 0,
    activeReferrers: 0,
    totalDepositsGenerated: 0,
    totalTurnoverGenerated: 0,
    instantBonusPerFriend: 300,
    depositCommissionRate: 0.70,
    betRebateRate: 1.00
  });

  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [claimsSearch, setClaimsSearch] = useState('');

  // Settings State (Single Generation: 0.7% deposit rebate, 1.0% bet rebate)
  const [settings, setSettings] = useState({
    enabled: true,
    instantBonusPerFriend: 300,
    minDepositToQualify: 300,
    minBetTurnoverToQualify: 3000,
    depositRebateRate: 0.70,
    betTurnoverRebateRate: 1.00,
    maxBonusCap: 3000000,
    autoCreditInstantBonus: true
  });

  // Dynamic Tiers & Range Management State
  const [customTiers, setCustomTiers] = useState<Array<{ id: number; count: number; bonus: number; desc?: string }>>(DEFAULT_LADDER_TIERS);
  const [isSavingTiers, setIsSavingTiers] = useState(false);
  const [hasTiersChanged, setHasTiersChanged] = useState(false);

  // Instant Bonus Ranges State (User-count based instant referral cash scale)
  const [instantBonusRanges, setInstantBonusRanges] = useState<InstantBonusRangeItem[]>(DEFAULT_INSTANT_BONUS_RANGES);
  const [isSavingRanges, setIsSavingRanges] = useState(false);
  const [hasRangesChanged, setHasRangesChanged] = useState(false);
  const [isAddRangeModalOpen, setIsAddRangeModalOpen] = useState(false);
  const [rangeMinInput, setRangeMinInput] = useState('');
  const [rangeMaxInput, setRangeMaxInput] = useState('');
  const [rangeBonusInput, setRangeBonusInput] = useState('');
  const [rangeLabelInput, setRangeLabelInput] = useState('');
  const [rangeDescInput, setRangeDescInput] = useState('');
  const [selectedRangeForEdit, setSelectedRangeForEdit] = useState<InstantBonusRangeItem | null>(null);
  const [selectedRangeForDelete, setSelectedRangeForDelete] = useState<InstantBonusRangeItem | null>(null);
  const [simulatedFriendCount, setSimulatedFriendCount] = useState<string>('10');

  // Poroskar Levels State (Sequential level milestones with claim prerequisite)
  const [poroskarLevels, setPoroskarLevels] = useState<PoroskarLevelItem[]>(DEFAULT_POROSKAR_LEVELS);
  const [isSavingPoroskar, setIsSavingPoroskar] = useState(false);
  const [hasPoroskarChanged, setHasPoroskarChanged] = useState(false);
  const [isAddLevelModalOpen, setIsAddLevelModalOpen] = useState(false);
  const [levelNumInput, setLevelNumInput] = useState('');
  const [levelCountInput, setLevelCountInput] = useState('');
  const [levelAmountInput, setLevelAmountInput] = useState('');
  const [levelNameInput, setLevelNameInput] = useState('');
  const [levelBadgeInput, setLevelBadgeInput] = useState('ব্রোঞ্জ');
  const [selectedLevelForEdit, setSelectedLevelForEdit] = useState<PoroskarLevelItem | null>(null);
  const [selectedLevelForDelete, setSelectedLevelForDelete] = useState<PoroskarLevelItem | null>(null);

  // New Tier form inputs / Add Modal State
  const [isAddTierModalOpen, setIsAddTierModalOpen] = useState(false);
  const [newTierCount, setNewTierCount] = useState('');
  const [newTierBonus, setNewTierBonus] = useState('');
  const [newTierDesc, setNewTierDesc] = useState('');

  // Edit Tier Modal State
  const [selectedTierForEdit, setSelectedTierForEdit] = useState<{ id: number; count: number; bonus: number; desc?: string } | null>(null);
  const [editTierCount, setEditTierCount] = useState('');
  const [editTierBonus, setEditTierBonus] = useState('');
  const [editTierDesc, setEditTierDesc] = useState('');

  // Delete Tier Modal State
  const [selectedTierForDelete, setSelectedTierForDelete] = useState<{ id: number; count: number; bonus: number; desc?: string } | null>(null);

  // Invite-based Increaser Generator State
  const [isIncreaserModalOpen, setIsIncreaserModalOpen] = useState(false);
  const [increaserBaseBonus, setIncreaserBaseBonus] = useState('300');
  const [increaserMultiplier, setIncreaserMultiplier] = useState<'standard' | 'aggressive' | 'custom'>('standard');
  const [tiersViewMode, setTiersViewMode] = useState<'table' | 'cards'>('table');
  const [tiersSearchTerm, setTiersSearchTerm] = useState('');
  const [testFriendsCount, setTestFriendsCount] = useState<string>('10');

  // Manual Bonus Modal State
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [bonusAmount, setBonusAmount] = useState('500');
  const [bonusNote, setBonusNote] = useState('স্পেশাল ভিআইপি এজেন্ট বোনাস');
  const [isSubmittingBonus, setIsSubmittingBonus] = useState(false);

  // Selected Referral Details Modal
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Load All Data
  const loadReferralData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, listRes, settingsRes, claimsRes] = await Promise.all([
        api.admin.referrals.getStats(),
        api.admin.referrals.getList(searchQuery, statusFilter),
        api.admin.referrals.getSettings(),
        api.admin.referrals.getClaims()
      ]);

      if (statsRes.success) {
        setStats(statsRes.stats);
        setTopReferrers(statsRes.topReferrers || []);
      }

      if (listRes.success) {
        setReferrals(listRes.referrals || []);
      }

      if (settingsRes.success && settingsRes.settings) {
        const s = settingsRes.settings as any;
        setSettings({
          enabled: s.enabled ?? true,
          instantBonusPerFriend: s.instantBonusPerFriend ?? 300,
          minDepositToQualify: s.minDepositToQualify ?? 300,
          minBetTurnoverToQualify: s.minBetTurnoverToQualify ?? 3000,
          depositRebateRate: s.depositRebateRate ?? s.tier1DepositCommissionRate ?? 0.70,
          betTurnoverRebateRate: s.betTurnoverRebateRate ?? 1.00,
          maxBonusCap: s.maxBonusCap ?? 3000000,
          autoCreditInstantBonus: s.autoCreditInstantBonus ?? true
        });

        if (s.instantBonusRanges && Array.isArray(s.instantBonusRanges) && s.instantBonusRanges.length > 0) {
          setInstantBonusRanges(s.instantBonusRanges);
        } else {
          setInstantBonusRanges(DEFAULT_INSTANT_BONUS_RANGES);
        }

        if (s.poroskarLevels && Array.isArray(s.poroskarLevels) && s.poroskarLevels.length > 0) {
          setPoroskarLevels(s.poroskarLevels);
        } else {
          setPoroskarLevels(DEFAULT_POROSKAR_LEVELS);
        }

        if (s.customTiers && Array.isArray(s.customTiers) && s.customTiers.length > 0) {
          setCustomTiers(s.customTiers);
        } else {
          setCustomTiers(DEFAULT_LADDER_TIERS);
        }
      }

      if (claimsRes.success && claimsRes.claims) {
        setClaims(claimsRes.claims);
      }
    } catch (err: any) {
      console.error('Failed to load referral data', err);
      showToast('রেফারেল ডেটা লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferralData();
  }, [searchQuery, statusFilter]);

  // Handle Referral Status Update
  const handleUpdateReferralStatus = async (id: string, newStatus: 'active' | 'pending_first_deposit' | 'frozen') => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.admin.referrals.updateStatus(id, newStatus);
      if (res.success) {
        showToast(res.message);
        if (selectedReferral && selectedReferral.id === id) {
          setSelectedReferral({ ...selectedReferral, status: newStatus });
        }
        loadReferralData();
      }
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await api.admin.referrals.updateSettings(settings);
      if (res.success) {
        showToast('রেফারেল ও কমিশন পলিসি সফলভাবে সংরক্ষিত হয়েছে!');
        loadReferralData();
      }
    } catch (err: any) {
      showToast(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Manual Bonus Payout
  const handleManualBonusPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      showToast('ইউজার আইডি বা ব্যবহারকারী আবশ্যক');
      return;
    }
    const num = parseFloat(bonusAmount);
    if (isNaN(num) || num <= 0) {
      showToast('সঠিক বোনাস পরিমাণ লিখুন');
      return;
    }

    setIsSubmittingBonus(true);
    try {
      const res = await api.admin.referrals.manualBonusPayout(targetUserId, num, bonusNote);
      if (res.success) {
        showToast(res.message);
        setIsBonusModalOpen(false);
        setBonusAmount('500');
        loadReferralData();
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      showToast(err.message || 'বোনাস প্রদানে ত্রুটি হয়েছে');
    } finally {
      setIsSubmittingBonus(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (referrals.length === 0) {
      showToast('এক্সপোর্ট করার মতো কোনো ডেটা নেই');
      return;
    }

    const headers = ['আইডি', 'আমন্ত্রক', 'রেফারেল কোড', 'আমন্ত্রিত বন্ধু', 'ফোন নম্বর', 'তারিখ', 'মোট ডিপোজিট', 'মোট টার্নওভার', 'অর্জিত কমিশন', 'স্ট্যাটাস'];
    const rows = referrals.map(r => [
      r.id,
      r.referrerUsername,
      r.referrerCode,
      r.referredUsername,
      r.referredPhone,
      r.joinedAt,
      r.totalDeposit || 0,
      r.totalBet || 0,
      r.totalCommissionEarned || 0,
      r.status === 'active' ? 'সক্রিয়' : r.status === 'frozen' ? 'স্থগিত' : 'অপেক্ষমান'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bengalbet_referrals_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('রেফারেল রিপোর্ট CSV সফলভাবে ডাউনলোড হয়েছে!');
  };

  // Export Claims CSV
  const handleExportClaimsCSV = () => {
    if (claims.length === 0) {
      showToast('দাবি সংক্রান্ত কোনো ডেটা নেই');
      return;
    }

    const headers = ['দাবি আইডি', 'ইউজার আইডি', 'ইউজারনেম', 'ফোন নম্বর', 'মাইলস্টোন স্তর', 'প্রয়োজনীয় বন্ধু', 'বোনাস পরিমাণ', 'Trx ID', 'দাবির সময়'];
    const rows = claims.map(c => [
      c.id,
      c.userId,
      c.username,
      c.phone,
      `স্তর ${c.tierId}`,
      c.requiredCount,
      c.bonusAmount,
      c.trxId,
      c.claimedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bengalbet_referral_claims_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('দাবি অডিট রিপোর্ট CSV ডাউনলোড হয়েছে!');
  };

  // Tier Management Handlers (Add, Edit, Delete, Increaser)
  const handleAddTier = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(newTierCount, 10);
    const bonus = parseFloat(newTierBonus);

    if (isNaN(count) || count <= 0) {
      showToast('অনুগ্রহ করে সঠিক বন্ধু সংখ্যার কোটা লক্ষ্যমাত্রা প্রদান করুন (যেমন: ৫, ১০, ১০০)');
      return;
    }
    if (isNaN(bonus) || bonus <= 0) {
      showToast('অনুগ্রহ করে সঠিক বোনাসের পরিমাণ প্রদান করুন');
      return;
    }

    if (customTiers.some(t => t.count === count)) {
      showToast(`${count} জন বন্ধুর জন্য স্তর ইতিমধ্যে তালিকায় রয়েছে!`);
      return;
    }

    const newTier = {
      id: Date.now(),
      count,
      bonus,
      desc: newTierDesc.trim() || `${count} জন বন্ধু বিশেষ আমন্ত্রণ বোনাস`
    };

    const updated = [...customTiers, newTier].sort((a, b) => a.count - b.count);
    setCustomTiers(updated);
    setNewTierCount('');
    setNewTierBonus('');
    setNewTierDesc('');
    setIsAddTierModalOpen(false);
    setHasTiersChanged(true);
    showToast(`নতুন স্তর (${count} জন বন্ধু -> ৳${bonus.toLocaleString()}) যুক্ত হয়েছে! সংরক্ষণ বাটনে ক্লিক করে কার্যকর করুন।`);
  };

  const handleOpenEditTier = (tier: { id: number; count: number; bonus: number; desc?: string }) => {
    setSelectedTierForEdit(tier);
    setEditTierCount(tier.count.toString());
    setEditTierBonus(tier.bonus.toString());
    setEditTierDesc(tier.desc || '');
  };

  const handleSaveEditTier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTierForEdit) return;

    const count = parseInt(editTierCount, 10);
    const bonus = parseFloat(editTierBonus);

    if (isNaN(count) || count <= 0) {
      showToast('অনুগ্রহ করে সঠিক বন্ধু সংখ্যার কোটা লক্ষ্যমাত্রা প্রদান করুন');
      return;
    }
    if (isNaN(bonus) || bonus <= 0) {
      showToast('অনুগ্রহ করে সঠিক বোনাসের পরিমাণ প্রদান করুন');
      return;
    }

    if (customTiers.some(t => t.id !== selectedTierForEdit.id && t.count === count)) {
      showToast(`${count} জন বন্ধুর জন্য আরেকটি স্তর ইতিমধ্যে বিদ্যমান!`);
      return;
    }

    const updated = customTiers.map(t => {
      if (t.id === selectedTierForEdit.id) {
        return {
          ...t,
          count,
          bonus,
          desc: editTierDesc.trim() || `${count} জন বন্ধু বিশেষ আমন্ত্রণ বোনাস`
        };
      }
      return t;
    }).sort((a, b) => a.count - b.count);

    setCustomTiers(updated);
    setSelectedTierForEdit(null);
    setHasTiersChanged(true);
    showToast(`স্তর সফলভাবে এডিট হয়েছে (${count} বন্ধু -> ৳${bonus.toLocaleString()})! পরিবর্তন সংরক্ষণ করুন।`);
  };

  const handleOpenDeleteTier = (tier: { id: number; count: number; bonus: number; desc?: string }) => {
    setSelectedTierForDelete(tier);
  };

  const handleConfirmDeleteTier = () => {
    if (!selectedTierForDelete) return;
    const tier = selectedTierForDelete;
    const updated = customTiers.filter(t => t.id !== tier.id);
    setCustomTiers(updated);
    setSelectedTierForDelete(null);
    setHasTiersChanged(true);
    showToast(`স্তর (${tier.count} বন্ধু -> ৳${tier.bonus.toLocaleString()}) মুছে ফেলা হয়েছে! পরিবর্তন সংরক্ষণ করুন।`);
  };

  const handleApplyIncreaser = () => {
    const base = parseFloat(increaserBaseBonus) || 300;
    let newLadder: Array<{ id: number; count: number; bonus: number; desc?: string }> = [];

    if (increaserMultiplier === 'aggressive') {
      newLadder = [
        { id: 1, count: 1, bonus: base, desc: '১ম বন্ধু আমন্ত্রণ' },
        { id: 2, count: 2, bonus: base, desc: '২য় বন্ধু আমন্ত্রণ' },
        { id: 3, count: 3, bonus: base, desc: '৩য় বন্ধু আমন্ত্রণ' },
        { id: 4, count: 4, bonus: base, desc: '৪র্থ বন্ধু আমন্ত্রণ' },
        { id: 5, count: 5, bonus: base * 1.5, desc: '৫ম বন্ধু আমন্ত্রণ (১.৫x)' },
        { id: 6, count: 10, bonus: base * 6, desc: '১০ জন বন্ধু মেগা রিওয়ার্ড' },
        { id: 7, count: 15, bonus: base * 7, desc: '১৫ জন বন্ধু মেগা রিওয়ার্ড' },
        { id: 8, count: 20, bonus: base * 8, desc: '২০ জন বন্ধু মেগা রিওয়ার্ড' },
        { id: 9, count: 30, bonus: base * 15, desc: '৩০ জন বন্ধু সুপার রিওয়ার্ড' },
        { id: 10, count: 50, bonus: base * 20, desc: '৫০ জন বন্ধু সুপার রিওয়ার্ড' },
        { id: 11, count: 100, bonus: base * 35, desc: '১০০ জন বন্ধু কিং রিওয়ার্ড' },
        { id: 12, count: 35000, bonus: base * 6000, desc: '৩৫,০০০ জন বন্ধু গ্র্যান্ড রিওয়ার্ড' },
        { id: 13, count: 50000, bonus: base * 12000, desc: '৫০,০০০ জন বন্ধু আলটিমেট বোনাস' }
      ];
    } else {
      // Standard scaled ladder
      const scale = base / 300;
      newLadder = DEFAULT_LADDER_TIERS.map(t => ({
        ...t,
        bonus: Math.round(t.bonus * scale)
      }));
    }

    setCustomTiers(newLadder);
    setIsIncreaserModalOpen(false);
    setHasTiersChanged(true);
    showToast(`ইনভাইট ভিত্তিক বোনাস বৃদ্ধি জেনারেট হয়েছে (${newLadder.length} টি স্তর)! পরিবর্তন সংরক্ষণ করুন।`);
  };

  const getTierLevelBadge = (count: number) => {
    if (count >= 50000) return { label: 'আলটিমেট (Ultimate)', bg: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (count >= 35000) return { label: 'গ্র্যান্ড (Grand)', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (count >= 100) return { label: 'কিং (King)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (count >= 30) return { label: 'সুপার (Super)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (count >= 10) return { label: 'মেগা (Mega)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    return { label: 'স্ট্যান্ডার্ড (Standard)', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
  };

  const calculatePreviewBonus = (count: number) => {
    if (!count || count <= 0) return 0;
    const exact = customTiers.find(t => t.count === count);
    if (exact) return exact.bonus;
    const sorted = [...customTiers].sort((a, b) => b.count - a.count);
    const matched = sorted.find(t => count >= t.count);
    return matched ? matched.bonus : 300;
  };

  const handleUpdateTierField = (id: number, field: 'count' | 'bonus' | 'desc', val: any) => {
    const updated = customTiers.map(t => {
      if (t.id === id) {
        return { ...t, [field]: field === 'desc' ? val : Number(val) || 0 };
      }
      return t;
    });
    setCustomTiers(updated);
    setHasTiersChanged(true);
  };

  const handleSaveTiers = async () => {
    setIsSavingTiers(true);
    try {
      const sorted = [...customTiers]
        .filter(t => t.count > 0 && t.bonus > 0)
        .sort((a, b) => a.count - b.count)
        .map((t, index) => ({
          ...t,
          id: t.id || (index + 1)
        }));

      const res = await api.admin.referrals.updateSettings({
        ...settings,
        customTiers: sorted
      });

      if (res.success) {
        showToast('আমন্ত্রণ বোনাস রেঞ্জ ও স্তর সফলভাবে সংরক্ষিত হয়েছে!');
        setHasTiersChanged(false);
        loadReferralData();
      } else {
        showToast(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast('রেঞ্জ ও স্তর সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingTiers(false);
    }
  };

  const handleResetDefaultTiers = () => {
    setCustomTiers(DEFAULT_LADDER_TIERS);
    setHasTiersChanged(true);
    showToast('ডিফল্ট ২৪টি স্তরে রিসেট করা হয়েছে। স্থায়ী করতে সংরক্ষণ করুন।');
  };

  // INSTANT BONUS RANGES HANDLERS (User-count based instant referral bonus scale)
  const handleSaveRanges = async () => {
    setIsSavingRanges(true);
    try {
      const sanitized = [...instantBonusRanges]
        .filter(r => r && Number(r.minCount) > 0 && Number(r.instantBonus) > 0)
        .sort((a, b) => Number(a.minCount) - Number(b.minCount))
        .map((r, index) => ({
          ...r,
          id: r.id || (index + 1),
          minCount: Number(r.minCount),
          maxCount: Number(r.maxCount),
          instantBonus: Number(r.instantBonus)
        }));

      const res = await api.admin.referrals.updateSettings({
        ...settings,
        instantBonusRanges: sanitized
      });

      if (res.success) {
        showToast('তাৎক্ষণিক বোনাস স্কেল রেঞ্জ সফলভাবে সংরক্ষিত হয়েছে!');
        setHasRangesChanged(false);
        loadReferralData();
      } else {
        showToast(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast('তাৎক্ষণিক বোনাস স্কেল সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingRanges(false);
    }
  };

  const handleResetDefaultRanges = () => {
    setInstantBonusRanges(DEFAULT_INSTANT_BONUS_RANGES);
    setHasRangesChanged(true);
    showToast('ডিফল্ট ৫টি তাৎক্ষণিক বোনাস স্কেলে রিসেট করা হয়েছে। স্থায়ী করতে সংরক্ষণ করুন।');
  };

  const handleApplyUserRequestedRanges = () => {
    setInstantBonusRanges([
      { id: 1, minCount: 1, maxCount: 5, instantBonus: 300, label: '১ - ৫ জন বন্ধু', desc: '১ থেকে ৫ জন পর্যন্ত প্রতি রেফারে তাৎক্ষণিক ৩০০ টাকা' },
      { id: 2, minCount: 6, maxCount: 10, instantBonus: 1500, label: '৬ - ১০ জন বন্ধু', desc: '১০ কাউন্টে পৌঁছে পরবর্তী প্রতি রেফারে তাৎক্ষণিক ১৫০০ টাকা' },
      { id: 3, minCount: 11, maxCount: 20, instantBonus: 3000, label: '১১ - ২০ জন বন্ধু', desc: '১১ থেকে ২০ জন পর্যন্ত প্রতি রেফারে তাৎক্ষণিক ৩০০০ টাকা' },
      { id: 4, minCount: 21, maxCount: 50, instantBonus: 5000, label: '২১ - ৫০ জন বন্ধু', desc: '২১ থেকে ৫০ জন পর্যন্ত প্রতি রেফারে তাৎক্ষণিক ৫০০০ টাকা' },
      { id: 5, minCount: 51, maxCount: 999999, instantBonus: 10000, label: '৫১+ জন বন্ধু', desc: 'সর্বোচ্চ স্তরে প্রতি রেফারে তাৎক্ষণিক ১০,০০০ টাকা' },
    ]);
    setHasRangesChanged(true);
    showToast('ইউজারের স্পেসিফিকেশন স্কেল (১-৫: ৩০০, ৬-১০: ১৫০০, ইত্যাদি) প্রয়োগ করা হয়েছে!');
  };

  const handleOpenAddRange = () => {
    const nextMin = instantBonusRanges.length > 0 
      ? Math.max(...instantBonusRanges.map(r => r.maxCount < 999999 ? r.maxCount + 1 : r.minCount + 10))
      : 1;
    setRangeMinInput(nextMin.toString());
    setRangeMaxInput((nextMin + 4).toString());
    setRangeBonusInput('1500');
    setRangeLabelInput(`${nextMin} - ${nextMin + 4} জন`);
    setRangeDescInput(`প্রতি রেফারে তাৎক্ষণিক ৳১৫০০ বোনাস`);
    setIsAddRangeModalOpen(true);
  };

  const handleConfirmAddRange = () => {
    const min = parseInt(rangeMinInput, 10);
    const max = parseInt(rangeMaxInput, 10);
    const bonus = parseFloat(rangeBonusInput);

    if (isNaN(min) || min <= 0 || isNaN(max) || max < min || isNaN(bonus) || bonus <= 0) {
      showToast('সঠিক মিনিমাম, ম্যাক্সিমাম এবং বোনাস পরিমাণ প্রদান করুন');
      return;
    }

    const newId = Date.now();
    const newRange: InstantBonusRangeItem = {
      id: newId,
      minCount: min,
      maxCount: max,
      instantBonus: bonus,
      label: rangeLabelInput || `${min} - ${max >= 999999 ? 'অসীম' : max} জন`,
      desc: rangeDescInput || `প্রতি রেফারে তাৎক্ষণিক ৳${bonus} বোনাস`
    };

    const updated = [...instantBonusRanges, newRange].sort((a, b) => a.minCount - b.minCount);
    setInstantBonusRanges(updated);
    setHasRangesChanged(true);
    setIsAddRangeModalOpen(false);
    showToast('নতুন তাৎক্ষণিক বোনাস স্কেল যুক্ত হয়েছে! সংরক্ষণ করতে ভুলবেন না।');
  };

  const handleOpenEditRange = (range: InstantBonusRangeItem) => {
    setSelectedRangeForEdit(range);
    setRangeMinInput(range.minCount.toString());
    setRangeMaxInput(range.maxCount.toString());
    setRangeBonusInput(range.instantBonus.toString());
    setRangeLabelInput(range.label || '');
    setRangeDescInput(range.desc || '');
  };

  const handleConfirmEditRange = () => {
    if (!selectedRangeForEdit) return;
    const min = parseInt(rangeMinInput, 10);
    const max = parseInt(rangeMaxInput, 10);
    const bonus = parseFloat(rangeBonusInput);

    if (isNaN(min) || min <= 0 || isNaN(max) || max < min || isNaN(bonus) || bonus <= 0) {
      showToast('সঠিক মিনিমাম, ম্যাক্সিমাম এবং বোনাস পরিমাণ লিখুন');
      return;
    }

    const updated = instantBonusRanges.map(r => {
      if (r.id === selectedRangeForEdit.id) {
        return {
          ...r,
          minCount: min,
          maxCount: max,
          instantBonus: bonus,
          label: rangeLabelInput || `${min} - ${max >= 999999 ? 'অসীম' : max} জন`,
          desc: rangeDescInput || `প্রতি রেফারে তাৎক্ষণিক ৳${bonus} বোনাস`
        };
      }
      return r;
    }).sort((a, b) => a.minCount - b.minCount);

    setInstantBonusRanges(updated);
    setHasRangesChanged(true);
    setSelectedRangeForEdit(null);
    showToast('তাৎক্ষণিক বোনাস স্কেল আপডেট করা হয়েছে!');
  };

  const handleConfirmDeleteRange = () => {
    if (!selectedRangeForDelete) return;
    const updated = instantBonusRanges.filter(r => r.id !== selectedRangeForDelete.id);
    setInstantBonusRanges(updated);
    setHasRangesChanged(true);
    setSelectedRangeForDelete(null);
    showToast('রেঞ্জ স্কেল মুছে ফেলা হয়েছে!');
  };

  // POROSKAR LEVELS HANDLERS (Sequential claim ladder)
  const handleSavePoroskarLevels = async () => {
    setIsSavingPoroskar(true);
    try {
      const sanitized = [...poroskarLevels]
        .filter(l => l && Number(l.level) > 0 && Number(l.requiredCount) > 0 && Number(l.rewardAmount) > 0)
        .sort((a, b) => Number(a.level) - Number(b.level))
        .map((l, index) => ({
          ...l,
          id: l.id || (index + 1),
          level: Number(l.level),
          requiredCount: Number(l.requiredCount),
          rewardAmount: Number(l.rewardAmount)
        }));

      const res = await api.admin.referrals.updateSettings({
        ...settings,
        poroskarLevels: sanitized
      });

      if (res.success) {
        showToast('পুরস্কার ধারাবাহিক লেভেল মাইলস্টোন সফলভাবে সংরক্ষিত হয়েছে!');
        setHasPoroskarChanged(false);
        loadReferralData();
      } else {
        showToast(res.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast('পুরস্কার লেভেল সংরক্ষণ করতে সমস্যা হয়েছে');
    } finally {
      setIsSavingPoroskar(false);
    }
  };

  const handleResetDefaultPoroskar = () => {
    setPoroskarLevels(DEFAULT_POROSKAR_LEVELS);
    setHasPoroskarChanged(true);
    showToast('ডিফল্ট ১০টি পুরস্কার লেভেলে রিসেট করা হয়েছে। স্থায়ী করতে সংরক্ষণ করুন।');
  };

  const handleApplyUserRequestedPoroskar = () => {
    setPoroskarLevels([
      { id: 1, level: 1, requiredCount: 2, rewardAmount: 1, name: 'লেভেল ১ - সূচনা পদক', badge: 'ব্রোঞ্জ', desc: '২ জন বন্ধু সফল আমন্ত্রণ ও প্রথম ডিপোজিট' },
      { id: 2, level: 2, requiredCount: 4, rewardAmount: 150, name: 'লেভেল ২ - রৌপ্য পদক', badge: 'সিলভার', desc: '৪ জন বন্ধু কোটা পূরণ (লেভেল ১ ক্লেইম করার পর সক্রিয়)' },
      { id: 3, level: 3, requiredCount: 8, rewardAmount: 350, name: 'লেভেল ৩ - স্বর্ণ পদক', badge: 'গোল্ড', desc: '৮ জন বন্ধু কোটা পূরণ' },
      { id: 4, level: 4, requiredCount: 15, rewardAmount: 800, name: 'লেভেল ৪ - প্লাটিনাম পদক', badge: 'প্লাটিনাম', desc: '১৫ জন বন্ধু কোটা পূরণ' },
      { id: 5, level: 5, requiredCount: 30, rewardAmount: 2000, name: 'লেভেল ৫ - ডায়মন্ড পদক', badge: 'ডায়মন্ড', desc: '৩০ জন বন্ধু কোটা পূরণ' },
      { id: 6, level: 6, requiredCount: 60, rewardAmount: 5000, name: 'লেভেল ৬ - ক্রাউন পদক', badge: 'ক্রাউন', desc: '৬০ জন বন্ধু কোটা পূরণ' },
      { id: 7, level: 7, requiredCount: 100, rewardAmount: 12000, name: 'লেভেল ৭ - মাস্টার পদক', badge: 'মাস্টার', desc: '১০০ জন বন্ধু কোটা পূরণ' },
      { id: 8, level: 8, requiredCount: 250, rewardAmount: 35000, name: 'লেভেল ৮ - গ্র্যান্ড মাস্টার পদক', badge: 'গ্র্যান্ডমাস্টার', desc: '২৫০ জন বন্ধু কোটা পূরণ' },
      { id: 9, level: 9, requiredCount: 500, rewardAmount: 80000, name: 'লেভেল ৯ - লিজেন্ড পদক', badge: 'লিজেন্ড', desc: '৫০০ জন বন্ধু কোটা পূরণ' },
      { id: 10, level: 10, requiredCount: 1000, rewardAmount: 200000, name: 'লেভেল ১০ - রয়্যাল সম্রাট পদক', badge: 'সম্রাট', desc: '১০০০ জন বন্ধু কোটা পূরণ' },
    ]);
    setHasPoroskarChanged(true);
    showToast('ইউজারের স্পেসিফিকেশন ধারাবাহিক পুরস্কার লেভেল (২ ফ্রেন্ড = ১ টাকা, ৪ ফ্রেন্ড = ১৫০ টাকা...) সফলভাবে প্রয়োগ করা হয়েছে!');
  };

  const handleOpenAddLevel = () => {
    const nextLevel = poroskarLevels.length > 0 ? Math.max(...poroskarLevels.map(l => l.level)) + 1 : 1;
    const lastCount = poroskarLevels.length > 0 ? Math.max(...poroskarLevels.map(l => l.requiredCount)) : 0;
    const nextCount = lastCount > 0 ? Math.round(lastCount * 2) : 2;
    setLevelNumInput(nextLevel.toString());
    setLevelCountInput(nextCount.toString());
    setLevelAmountInput('500');
    setLevelNameInput(`লেভেল ${nextLevel} পুরস্কার`);
    setLevelBadgeInput('গোল্ড');
    setIsAddLevelModalOpen(true);
  };

  const handleConfirmAddLevel = () => {
    const lvl = parseInt(levelNumInput, 10);
    const count = parseInt(levelCountInput, 10);
    const amount = parseFloat(levelAmountInput);

    if (isNaN(lvl) || lvl <= 0 || isNaN(count) || count <= 0 || isNaN(amount) || amount <= 0) {
      showToast('সঠিক লেভেল নম্বর, প্রয়োজনীয় বন্ধু ও পুরস্কার পরিমাণ লিখুন');
      return;
    }

    const newLevel: PoroskarLevelItem = {
      id: Date.now(),
      level: lvl,
      requiredCount: count,
      rewardAmount: amount,
      name: levelNameInput || `লেভেল ${lvl} পুরস্কার`,
      badge: levelBadgeInput || 'গোল্ড',
      desc: `${count} জন বন্ধু সফল আমন্ত্রণ ও প্রথম ডিপোজিট`
    };

    const updated = [...poroskarLevels, newLevel].sort((a, b) => a.level - b.level);
    setPoroskarLevels(updated);
    setHasPoroskarChanged(true);
    setIsAddLevelModalOpen(false);
    showToast(`লেভেল ${lvl} যুক্ত হয়েছে! পরিবর্তন কার্যকর করতে সংরক্ষণ করুন।`);
  };

  const handleOpenEditLevel = (level: PoroskarLevelItem) => {
    setSelectedLevelForEdit(level);
    setLevelNumInput(level.level.toString());
    setLevelCountInput(level.requiredCount.toString());
    setLevelAmountInput(level.rewardAmount.toString());
    setLevelNameInput(level.name || '');
    setLevelBadgeInput(level.badge || 'গোল্ড');
  };

  const handleConfirmEditLevel = () => {
    if (!selectedLevelForEdit) return;
    const lvl = parseInt(levelNumInput, 10);
    const count = parseInt(levelCountInput, 10);
    const amount = parseFloat(levelAmountInput);

    if (isNaN(lvl) || lvl <= 0 || isNaN(count) || count <= 0 || isNaN(amount) || amount <= 0) {
      showToast('সঠিক লেভেল নম্বর, প্রয়োজনীয় বন্ধু ও পুরস্কার পরিমাণ লিখুন');
      return;
    }

    const updated = poroskarLevels.map(l => {
      if (l.id === selectedLevelForEdit.id) {
        return {
          ...l,
          level: lvl,
          requiredCount: count,
          rewardAmount: amount,
          name: levelNameInput || `লেভেল ${lvl} পুরস্কার`,
          badge: levelBadgeInput || l.badge || 'গোল্ড',
          desc: `${count} জন বন্ধু কোটা পূরণ`
        };
      }
      return l;
    }).sort((a, b) => a.level - b.level);

    setPoroskarLevels(updated);
    setHasPoroskarChanged(true);
    setSelectedLevelForEdit(null);
    showToast(`লেভেল ${lvl} সফলভাবে আপডেট করা হয়েছে!`);
  };

  const handleConfirmDeleteLevel = () => {
    if (!selectedLevelForDelete) return;
    const updated = poroskarLevels.filter(l => l.id !== selectedLevelForDelete.id);
    setPoroskarLevels(updated);
    setHasPoroskarChanged(true);
    setSelectedLevelForDelete(null);
    showToast('পুরস্কার লেভেল মুছে ফেলা হয়েছে!');
  };

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    if (!claimsSearch.trim()) return claims;
    const q = claimsSearch.toLowerCase();
    return claims.filter(c => 
      c.username?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.trxId?.toLowerCase().includes(q) ||
      c.userId?.toLowerCase().includes(q)
    );
  }, [claims, claimsSearch]);

  const conversionRate = stats.totalReferrals > 0 
    ? ((referrals.filter(r => r.status === 'active').length / stats.totalReferrals) * 100).toFixed(1)
    : '0.0';

  const avgEarningPerReferrer = stats.activeReferrers > 0
    ? (stats.totalBonusPaid / stats.activeReferrers).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0a2e1d] via-[#0d3b25] to-[#082417] p-5 sm:p-6 rounded-2xl border border-emerald-700/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
              <Share2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                রেফারেল ও এজেন্ট নেটওয়ার্ক
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  লাইভ সিস্টেম v4.2
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/70 mt-0.5">
                সরাসরি রেফারেল ট্র্যাকিং, ৩-টায়ার কমিশন ক্যালকুলেটর ও এজেন্ট পেআউট অ্যাডমিন কন্ট্রোল
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={loadReferralData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/50 text-emerald-100 text-xs font-bold border border-emerald-600/40 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTargetUserId('');
              setTargetUsername('');
              setIsBonusModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-black shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>ম্যানুয়াল বোনাস দিন</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-600/50 text-white text-xs font-bold border border-emerald-500/40 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV এক্সপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Referrals */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">মোট আমন্ত্রিত</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1.5">
            {stats.totalReferrals.toLocaleString('bn-BD')}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
            <span>{stats.activeReferrers} সক্রিয় আমন্ত্রক</span>
          </div>
        </div>

        {/* Card 2: Total Bonus Paid */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">প্রদত্ত বোনাস</span>
            <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-yellow-400 mt-1.5">
            ৳{stats.totalBonusPaid.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-yellow-300/80 font-medium mt-1">
            <span>ইনস্ট্যান্ট + কমিশন</span>
          </div>
        </div>

        {/* Card 3: Deposits Generated */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">ডিপোজিট ভলিউম</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1.5">
            ৳{stats.totalDepositsGenerated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-blue-300 font-semibold mt-1">
            <span>কমিশন: {stats.depositCommissionRate}%</span>
          </div>
        </div>

        {/* Card 4: Turnover Generated */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">টার্নওভার ভলিউম</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1.5">
            ৳{stats.totalTurnoverGenerated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-purple-300 font-semibold mt-1">
            <span>রিবেট: {stats.betRebateRate}%</span>
          </div>
        </div>

        {/* Card 5: Conversion Rate */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">সক্রিয়তার হার</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1.5">
            {conversionRate}%
          </div>
          <div className="text-[10px] text-emerald-300/80 font-medium mt-1">
            <span>সফল রূপান্তর</span>
          </div>
        </div>

        {/* Card 6: Average Payout Per Referrer */}
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-300/80">গড় উপার্জন/এজেন্ট</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1.5">
            ৳{avgEarningPerReferrer}
          </div>
          <div className="text-[10px] text-amber-300/80 font-medium mt-1">
            <span>সক্রিয় আমন্ত্রক প্রতি</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-emerald-800/50 pb-2 overflow-x-auto">
        {[
          { id: 'list', label: `রেফারেল তালিকা (${referrals.length})`, icon: Users },
          { id: 'top', label: `টপ আমন্ত্রক লিডারবোর্ড (${topReferrers.length})`, icon: Award },
          { id: 'ranges', label: `⚡ তাৎক্ষণিক বোনাস স্কেল (${instantBonusRanges.length})`, icon: Zap },
          { id: 'poroskar', label: `🏆 পুরস্কার লেভেল মাইলস্টোন (${poroskarLevels.length})`, icon: Trophy },
          { id: 'tiers', label: `ইনস্ট্যান্ট টায়ার স্তর (${customTiers.length})`, icon: Gift },
          { id: 'settings', label: 'কমিশন পলিসি ও সেটিংস', icon: Settings },
          { id: 'claims', label: `দাবি ও লেনদেন অডিট লগ (${claims.length})`, icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                  : 'bg-[#072418] text-emerald-300 hover:bg-emerald-800/40 hover:text-white border border-emerald-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: REFERRALS LIST TABLE */}
      {activeSubTab === 'list' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="আমন্ত্রক, কোড বা বন্ধুর ফোন নম্বর দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#041910] border border-emerald-700/50 rounded-xl text-xs text-white placeholder-emerald-400/50 focus:outline-none focus:border-yellow-400 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#041910] border border-emerald-700/50 rounded-xl text-xs text-white focus:outline-none focus:border-yellow-400 cursor-pointer"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয় (Active)</option>
                <option value="pending_first_deposit">ডিপোজিট অপেক্ষমান</option>
                <option value="frozen">স্থগিত (Frozen)</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-xl border border-emerald-800/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#041910] text-emerald-300/80 font-bold uppercase tracking-wider text-[11px] border-b border-emerald-800/60">
                <tr>
                  <th className="py-3 px-4">আমন্ত্রক (Referrer)</th>
                  <th className="py-3 px-4">রেফারেল কোড</th>
                  <th className="py-3 px-4">আমন্ত্রিত সদস্য</th>
                  <th className="py-3 px-4">নিবন্ধন তারিখ</th>
                  <th className="py-3 px-4">ডিপোজিট</th>
                  <th className="py-3 px-4">টার্নওভার</th>
                  <th className="py-3 px-4">মোট কমিশন</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/40 font-medium">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-emerald-400/60">
                      কোনো রেফারেল তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  referrals.map((r) => (
                    <tr key={r.id} className="hover:bg-emerald-800/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-700/50 flex items-center justify-center text-yellow-400 font-bold text-xs">
                            {r.referrerUsername?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{r.referrerUsername}</span>
                            <span className="text-[10px] text-emerald-400/70 font-mono">ID: {r.referrerId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-yellow-400/10 text-yellow-300 font-mono font-bold text-[11px] border border-yellow-400/20">
                          {r.referrerCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white block">{r.referredUsername}</span>
                        <span className="text-[10px] text-emerald-300/60 font-mono">{r.referredPhone}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
                        {r.joinedAt}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ৳{(r.totalDeposit || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-300">
                        ৳{(r.totalBet || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-yellow-400">
                        ৳{(r.totalCommissionEarned || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status === 'active' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                          {r.status === 'active' ? 'সক্রিয়' : 'অপেক্ষমান'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReferral(r)}
                            className="p-1 rounded-lg bg-blue-900/40 hover:bg-blue-800 text-blue-200 transition-all cursor-pointer"
                            title="রেফারেল বিস্তারিত ও স্ট্যাটাস পরিচালনা"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetUserId(r.referrerId);
                              setTargetUsername(r.referrerUsername);
                              setIsBonusModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-black font-bold text-[11px] transition-all cursor-pointer"
                            title="আমন্ত্রককে অতিরিক্ত বোনাস দিন"
                          >
                            +বোনাস
                          </button>
                          {onOpenUserDetail && (
                            <button
                              type="button"
                              onClick={() => onOpenUserDetail(r.referrerId)}
                              className="p-1 rounded-lg bg-emerald-800/40 hover:bg-emerald-700 text-emerald-200 transition-all cursor-pointer"
                              title="প্লেয়ার প্রোফাইল খুলুন"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TOP REFERRERS LEADERBOARD */}
      {activeSubTab === 'top' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              সেরা আমন্ত্রক লিডারবোর্ড (Top 10 Referrers)
            </h3>
            <span className="text-xs text-emerald-300/70">মোট উপার্জনের ভিত্তিতে সাজানো</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topReferrers.map((tr, index) => (
              <div
                key={tr.userId}
                className="bg-[#041910] border border-emerald-800/60 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-yellow-400/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-black shadow-lg shadow-yellow-500/30' :
                    index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-400 text-black' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-emerald-800/50 text-emerald-200'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      {tr.username}
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 font-mono font-bold">
                        {tr.code}
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-400/70 font-mono">{tr.phone || 'ফোন গোপনীয়'}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-yellow-400">
                    ৳{tr.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-emerald-300/80 font-bold">
                    {tr.friendsCount} জন বন্ধু আমন্ত্রিত
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetUserId(tr.userId);
                      setTargetUsername(tr.username);
                      setIsBonusModalOpen(true);
                    }}
                    className="mt-1 text-[11px] font-bold text-yellow-400 hover:underline cursor-pointer"
                  >
                    +বোনাস প্রদান
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: COMMISSION POLICIES & SETTINGS */}
      {activeSubTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                রেফারেল সিস্টেম রুলস ও কমিশন পলিসি
              </h3>
              <p className="text-xs text-emerald-200/70 mt-0.5">
                সদস্যদের জন্য তাত্ক্ষণিক রিওয়ার্ড, ৩-স্তর মাল্টি-টায়ার কমিশন ও ডিপোজিট শর্তাবলী নিয়ন্ত্রণ করুন
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
                <span>রেফারেল ফিচার সক্রিয়:</span>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="w-4 h-4 accent-yellow-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Setting 1: Instant Friend Bonus */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>তাৎক্ষণিক বন্ধু আমন্ত্রণ বোনাস (Instant Bonus)</span>
                <span className="text-yellow-400 font-mono">৳{settings.instantBonusPerFriend}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={settings.instantBonusPerFriend}
                  onChange={(e) => setSettings({ ...settings, instantBonusPerFriend: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  min="0"
                  step="50"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                নতুন বন্ধু রেজিস্ট্রেশন করার সাথে সাথে আমন্ত্রকের ওয়ালেটে সরাসরি যোগ হবে।
              </p>
            </div>

            {/* Setting 2: Min Deposit to Qualify */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>ন্যূনতম কোয়ালিফাইং ডিপোজিট (Min Qualifying Deposit)</span>
                <span className="text-yellow-400 font-mono">৳{settings.minDepositToQualify}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={settings.minDepositToQualify}
                  onChange={(e) => setSettings({ ...settings, minDepositToQualify: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  min="100"
                  step="100"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                আমন্ত্রিত সদস্য ন্যূনতম এই পরিমাণ জমা করলে পূর্ণাঙ্গ কমিশন সক্রিয় হবে।
              </p>
            </div>

            {/* Setting 3: Direct Deposit Rebate Rate (0.7%) */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>জমার উপর রিবেট কমিশন (Deposit Rebate Rate)</span>
                <span className="text-yellow-400 font-mono">{settings.depositRebateRate ?? 0.7}%</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.depositRebateRate ?? 0.7}
                  onChange={(e) => setSettings({ ...settings, depositRebateRate: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  step="0.05"
                  min="0"
                  max="10"
                />
                <span className="text-xs font-bold text-gray-400">%</span>
              </div>
              <p className="text-[11px] text-gray-400">
                ১ম জেনারেশন সরাসরি আমন্ত্রিত বন্ধুর প্রতিটি সফল জমার উপর ০.৭% রিবেট কমিশন।
              </p>
            </div>

            {/* Setting 4: Betting Turnover Rebate Rate (1.0%) */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>বেটিং টার্নওভার রিবেট কমিশন (Bet Rebate Rate)</span>
                <span className="text-yellow-400 font-mono">{settings.betTurnoverRebateRate ?? 1.0}%</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.betTurnoverRebateRate ?? 1.0}
                  onChange={(e) => setSettings({ ...settings, betTurnoverRebateRate: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  step="0.1"
                  min="0"
                  max="10"
                />
                <span className="text-xs font-bold text-gray-400">%</span>
              </div>
              <p className="text-[11px] text-gray-400">
                আমন্ত্রিত সদস্যের সকল বাজি/টার্নওভারের (স্লট, ফিশিং, ক্যাসিনো) উপর ১.০% আজীবন রিবেট।
              </p>
            </div>

            {/* Setting 5: Min Qualifying Bet Turnover */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>ন্যূনতম কোয়ালিফাইং বেটিং টার্নওভার (Min Bet Turnover)</span>
                <span className="text-yellow-400 font-mono">৳{settings.minBetTurnoverToQualify || 3000}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={settings.minBetTurnoverToQualify || 3000}
                  onChange={(e) => setSettings({ ...settings, minBetTurnoverToQualify: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  min="500"
                  step="500"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                আমন্ত্রিত বন্ধু বৈধ সদস্য হিসেবে গণ্য হতে মোট এই পরিমাণ বাজি সম্পন্ন করতে হবে।
              </p>
            </div>

            {/* Setting 6: Max Bonus Cap */}
            <div className="bg-[#041910] p-4 rounded-xl border border-emerald-800/50 space-y-2">
              <label className="text-xs font-bold text-emerald-200 flex items-center justify-between">
                <span>সর্বোচ্চ বোনাস সীমা (Max Bonus Cap)</span>
                <span className="text-yellow-400 font-mono">৳{(settings.maxBonusCap || 3000000).toLocaleString()}</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">৳</span>
                <input
                  type="number"
                  value={settings.maxBonusCap || 3000000}
                  onChange={(e) => setSettings({ ...settings, maxBonusCap: Number(e.target.value) })}
                  className="w-full p-2 bg-[#072418] border border-emerald-700 rounded-lg text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  min="100000"
                  step="100000"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                রেফারেল প্রোগ্রাম থেকে একজন ইউজার সর্বোচ্চ ৩০,০০,০০০ টাকা পর্যন্ত বোনাস অর্জন করতে পারে।
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-800/50 flex justify-end">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>কমিশন সেটিংস সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB: TAATKHONIK (INSTANT) BONUS SCALE BY USER COUNT RANGE */}
      {activeSubTab === 'ranges' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
          {/* Header & Quick Action Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>তাৎক্ষণিক বোনাস স্কেল (রেঞ্জ বৃদ্ধি ব্যবস্থাপনা)</span>
                <span className="text-xs font-bold text-yellow-300 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
                  {instantBonusRanges.length} টি সক্রিয় স্কেল রেঞ্জ
                </span>
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1">
                আমন্ত্রিত সদস্য সংখ্যা বৃদ্ধির সাথে সাথে প্রতি রেফারে তাৎক্ষণিক বোনাস বৃদ্ধির স্কেল (যেমন: ১-৫ জন বন্ধু = ৩০০ টাকা, ১০ জনে পৌঁছালে পরবর্তী রেফারে ১৫০০ টাকা)।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleOpenAddRange}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন রেঞ্জ যোগ</span>
              </button>

              <button
                type="button"
                onClick={handleApplyUserRequestedRanges}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#041910] text-amber-300 hover:text-white hover:bg-emerald-900/50 border border-amber-500/40 transition-all cursor-pointer"
                title="ইউজারের রিকোয়েস্টেড স্কেল (১-৫: ৩০০, ৬-১০: ১৫০০...) প্রয়োগ করুন"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>ইউজার স্কেল প্রিসেট</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultRanges}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#041910] text-emerald-300 hover:text-white hover:bg-emerald-900/50 border border-emerald-800/60 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট রিসেট</span>
              </button>

              <button
                type="button"
                onClick={handleSaveRanges}
                disabled={isSavingRanges}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black shadow-md transition-all cursor-pointer ml-auto sm:ml-0"
              >
                {isSavingRanges ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>

          {/* Logic & Rule Explainer Box */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-xl p-3.5 sm:p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-emerald-100">
                <span className="font-bold text-yellow-300 block text-sm">
                  ⚡ তাৎক্ষণিক রেফারেল বোনাস স্কেল নিয়মাবলী:
                </span>
                <p className="text-gray-300 leading-relaxed">
                  • একজন আমন্ত্রক যত বেশি বন্ধু আমন্ত্রণ করবেন, তার প্রতিটি নতুন সফল রেফারে ইনস্ট্যান্ট ক্যাশ বোনাসের রেঞ্জ তত বৃদ্ধি পাবে।
                </p>
                <p className="text-yellow-200/90 leading-relaxed font-mono">
                  • বাস্তব নিয়ম: ১-৫ জন আমন্ত্রণ করলে প্রতি রেফারে ৳৩০০ ইনস্ট্যান্ট বোনাস। কিন্তু যখনই আমন্ত্রক ১০ কাউন্টে পৌঁছাবে, তখন পরবর্তী প্রতি রেফারে সরাসরি ৳১,৫০০ ইনস্ট্যান্ট বোনাস পাবে!
                </p>
                <p className="text-emerald-300/80 text-[11px] italic">
                  * এই তাৎক্ষণিক ক্যাশ সরাসরি এজেন্টের ব্যালেন্সে স্বয়ংক্রিয়ভাবে ক্রেডিট হয়। এছাড়া মাইলস্টোন উপহারের জন্য "পুরস্কার" ট্যাব আলাদাভাবে কার্যকর থাকে।
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Live Simulator */}
          <div className="bg-[#041910] border border-emerald-800/80 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-white">লাইভ বোনাস রেঞ্জ সিমুলেটর</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 5, 8, 10, 15, 25, 60].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimulatedFriendCount(val.toString())}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all ${
                      simulatedFriendCount === val.toString()
                        ? 'bg-yellow-400 text-black shadow-xs font-black'
                        : 'bg-[#072418] text-gray-400 hover:text-white border border-emerald-800/60'
                    }`}
                  >
                    {val} জন
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">আমন্ত্রিত মোট সফল বন্ধু:</label>
                <input
                  type="number"
                  min="0"
                  value={simulatedFriendCount}
                  onChange={(e) => setSimulatedFriendCount(e.target.value)}
                  className="w-full bg-[#072418] border border-emerald-700 rounded-lg px-3 py-2 text-sm text-white font-bold focus:border-yellow-400 focus:outline-none"
                  placeholder="যেমন: ১০"
                />
              </div>

              {(() => {
                const count = parseInt(simulatedFriendCount, 10) || 0;
                const sorted = [...instantBonusRanges].sort((a, b) => a.minCount - b.minCount);
                const active = sorted.find(r => count >= r.minCount && (r.maxCount >= 999999 ? true : count <= r.maxCount)) 
                  || (count === 0 ? sorted[0] : sorted[sorted.length - 1]);
                return (
                  <>
                    <div className="bg-[#072418] border border-emerald-800 rounded-lg p-3">
                      <span className="text-[11px] text-gray-400 block">সক্রিয় স্কেল স্তর:</span>
                      <span className="text-xs font-black text-white flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {active ? active.label || `${active.minCount}-${active.maxCount} জন` : 'নির্ধারিত নয়'}
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/40 rounded-lg p-3">
                      <span className="text-[11px] text-yellow-300 font-medium block">পরবর্তী প্রতি রেফারে ইনস্ট্যান্ট বোনাস:</span>
                      <span className="text-base font-black text-yellow-400 font-mono mt-0.5 block">
                        ৳ {active ? active.instantBonus.toLocaleString() : 0} টাকা
                      </span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Ranges Table */}
          <div className="overflow-x-auto rounded-xl border border-emerald-800/40 bg-[#041910]">
            <table className="w-full text-left text-xs text-emerald-100">
              <thead className="bg-[#082a1c] text-[11px] uppercase tracking-wider text-emerald-300/80 border-b border-emerald-800/50">
                <tr>
                  <th className="py-3 px-4 text-center">ক্রম</th>
                  <th className="py-3 px-4">স্কেল রেঞ্জ (বন্ধু সংখ্যা)</th>
                  <th className="py-3 px-4 text-center">সর্বনিম্ন (Min)</th>
                  <th className="py-3 px-4 text-center">সর্বোচ্চ (Max)</th>
                  <th className="py-3 px-4 font-mono text-yellow-400">প্রতি রেফারে তাৎক্ষণিক বোনাস</th>
                  <th className="py-3 px-4">বিবরণ / শর্ত</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40">
                {instantBonusRanges.map((range, index) => (
                  <tr key={range.id || index} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-300 font-black flex items-center justify-center mx-auto text-xs border border-yellow-400/30">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{range.label || `${range.minCount} - ${range.maxCount >= 999999 ? 'অসীম' : range.maxCount} জন`}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-300">
                      {range.minCount} জন
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-gray-300">
                      {range.maxCount >= 999999 ? 'অসীম (∞)' : `${range.maxCount} জন`}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-sm text-yellow-400">
                      ৳{range.instantBonus.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-emerald-200/70 text-[11px]">
                      {range.desc || `প্রতি রেফারে তাৎক্ষণিক ৳${range.instantBonus} বোনাস`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditRange(range)}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-all cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedRangeForDelete(range)}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save notification */}
          {hasRangesChanged && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-yellow-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                আপনি তাৎক্ষণিক বোনাস স্কেলে পরিবর্তন করেছেন। ইউজারদের জন্য কার্যকর করতে সংরক্ষণ করুন।
              </span>
              <button
                type="button"
                onClick={handleSaveRanges}
                disabled={isSavingRanges}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: DHARABAHIK (SEQUENTIAL) POROSKAR LEVEL MILESTONES */}
      {activeSubTab === 'poroskar' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
          {/* Header & Quick Action Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span>ধারাবাহিক পুরস্কার লেভেল মাইলস্টোন (Sequential Levels)</span>
                <span className="text-xs font-bold text-yellow-300 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
                  {poroskarLevels.length} টি লেভেল
                </span>
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1">
                ধারাবাহিক আনলক পুরস্কার সিস্টেম — ইউজার লেভেল ১ (২ জন বন্ধু = ১ টাকা) ক্লেইম করার পরই লেভেল ২ (৪ জন বন্ধু = ১৫০ টাকা) শুরু হবে এবং ক্লেইম করা যাবে।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={handleOpenAddLevel}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন লেভেল যোগ</span>
              </button>

              <button
                type="button"
                onClick={handleApplyUserRequestedPoroskar}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#041910] text-amber-300 hover:text-white hover:bg-emerald-900/50 border border-amber-500/40 transition-all cursor-pointer"
                title="ইউজারের রিকোয়েস্টেড লেভেল (২ ফ্রেন্ড = ১ টাকা, ৪ ফ্রেন্ড = ১৫০ টাকা...) প্রয়োগ করুন"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>ইউজার লেভেল প্রিসেট</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultPoroskar}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#041910] text-emerald-300 hover:text-white hover:bg-emerald-900/50 border border-emerald-800/60 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট রিসেট</span>
              </button>

              <button
                type="button"
                onClick={handleSavePoroskarLevels}
                disabled={isSavingPoroskar}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-black shadow-md transition-all cursor-pointer ml-auto sm:ml-0"
              >
                {isSavingPoroskar ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          </div>

          {/* Sequential Rule Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-[#0a3320] to-[#041910] border border-emerald-600/50 rounded-xl p-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center shrink-0 border border-yellow-400/30">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1 text-emerald-100">
                <span className="font-bold text-yellow-300 block text-sm">
                  📌 ধারাবাহিক আনলক সিস্টেমের কার্যপ্রণালী (Sequential Lock Logic):
                </span>
                <p className="text-gray-200 leading-relaxed">
                  ১. খেলোয়াড় সরাসরি পরবর্তী কোনো লেভেল দাবি করতে পারবে না।
                </p>
                <p className="text-gray-200 leading-relaxed">
                  ২. প্রথমে <span className="font-bold text-yellow-300">লেভেল ১ (২ জন বন্ধু)</span> এর কোটা পূর্ণ করে ক্লেইম বাটন চাপতে হবে। ১ টাকা ব্যালেন্সে যোগ হবে এবং লেভেল ১ সম্পন্ন চিহ্নিত হবে।
                </p>
                <p className="text-gray-200 leading-relaxed">
                  ৩. লেভেল ১ ক্লেইম হওয়ার পরই <span className="font-bold text-yellow-300">লেভেল ২ (৪ জন বন্ধু)</span> আনলক হবে। খেলোয়াড়ের ৪ জন বন্ধু পূর্ণ হলে তিনি ১৫০ টাকা পুরস্কার ক্লেইম করতে পারবেন।
                </p>
                <p className="text-gray-200 leading-relaxed">
                  ৪. প্রতিটি লেভেল ধারাবাহিকভাবে একটির পর একটি আনলক হয়ে খেলোয়াড়কে উচ্চ স্তরে নিয়ে যাবে।
                </p>
              </div>
            </div>
          </div>

          {/* Roadmap Ladder Cards Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-300 block">লেভেল আনলক রোডম্যাপ প্রিভিউ:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {poroskarLevels.map((lvl, idx) => (
                <div 
                  key={lvl.id || idx}
                  className="bg-[#041910] border border-emerald-800/80 rounded-xl p-3 flex flex-col justify-between gap-2 shadow-xs hover:border-yellow-400/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      লেভেল {lvl.level}
                    </span>
                    <span className="text-xs">
                      {lvl.level >= 9 ? '👑' : lvl.level >= 7 ? '💎' : lvl.level >= 5 ? '🥇' : lvl.level >= 3 ? '🥈' : '🥉'}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-black text-yellow-400 font-mono block">
                      ৳{lvl.rewardAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {lvl.requiredCount} জন বন্ধু কোটা
                    </span>
                  </div>

                  <div className="pt-1.5 border-t border-emerald-900/60 flex items-center justify-between text-[10px] text-emerald-300/80">
                    <span>{lvl.badge || 'পদক'}</span>
                    <span className="text-gray-500">#{lvl.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Poroskar Levels Table */}
          <div className="overflow-x-auto rounded-xl border border-emerald-800/40 bg-[#041910]">
            <table className="w-full text-left text-xs text-emerald-100">
              <thead className="bg-[#082a1c] text-[11px] uppercase tracking-wider text-emerald-300/80 border-b border-emerald-800/50">
                <tr>
                  <th className="py-3 px-4 text-center">লেভেল</th>
                  <th className="py-3 px-4">পুরস্কারের নাম ও পদক</th>
                  <th className="py-3 px-4 text-center">প্রয়োজনীয় বন্ধু সংখ্যা</th>
                  <th className="py-3 px-4 font-mono text-yellow-400">পুরস্কার বোনাস (টাকা)</th>
                  <th className="py-3 px-4">বিবরণ / শর্ত</th>
                  <th className="py-3 px-4 text-center">আনলক পূর্বশর্ত</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40">
                {poroskarLevels.map((lvl, index) => (
                  <tr key={lvl.id || index} className="hover:bg-emerald-900/20 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-300 font-black flex items-center justify-center mx-auto text-xs border border-yellow-400/30">
                        L{lvl.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span>{lvl.name || `লেভেল ${lvl.level} পুরস্কার`}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                          {lvl.badge || 'পদক'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-white">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                        {lvl.requiredCount} জন
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-sm text-yellow-400">
                      ৳{lvl.rewardAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-emerald-200/70 text-[11px]">
                      {lvl.desc || `${lvl.requiredCount} জন সফল বন্ধু কোটা পূরণ`}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {lvl.level === 1 ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <Unlock className="w-3 h-3" />
                          <span>শুরু থেকেই সক্রিয়</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-amber-300/80 flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          <span>লেভেল {lvl.level - 1} ক্লেইম আবশ্যক</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLevel(lvl)}
                          className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 transition-all cursor-pointer"
                          title="এডিট করুন"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedLevelForDelete(lvl)}
                          className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Save notification */}
          {hasPoroskarChanged && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-yellow-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                আপনি পুরস্কার লেভেল মাইলস্টোনে পরিবর্তন করেছেন। কার্যকর করতে সংরক্ষণ করুন।
              </span>
              <button
                type="button"
                onClick={handleSavePoroskarLevels}
                disabled={isSavingPoroskar}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DYNAMIC INSTANT BONUS RANGE & TIERS (ADD/EDIT/DELETE/INCREASER) */}
      {activeSubTab === 'tiers' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-5 shadow-xl">
          {/* Header & Quick Actions */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-emerald-800/60">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                <span>ইনস্ট্যান্ট বোনাস রেঞ্জ ও স্তর ব্যবস্থাপনা (Add / Edit / Delete)</span>
                <span className="text-xs font-bold text-yellow-300 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20">
                  {customTiers.length} টি সক্রিয় স্তর
                </span>
              </h3>
              <p className="text-xs text-emerald-200/70 mt-1">
                আমন্ত্রিত বন্ধুদের সংখ্যার ভিত্তিতে ইনস্ট্যান্ট বোনাস বৃদ্ধি কনফিগারেশন — নতুন বোনাস যোগ, এডিট, ডিলিট এবং স্বয়ংক্রিয় বৃদ্ধি সিঁড়ি নিয়ন্ত্রণ করুন।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsAddTierModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black shadow-md shadow-yellow-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ নতুন বোনাস যোগ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsIncreaserModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#041910] text-amber-300 hover:text-white hover:bg-emerald-900/50 border border-amber-500/40 transition-all cursor-pointer"
                title="স্বয়ংক্রিয় বোনাস সিঁড়ি বৃদ্ধি জেনারেট করুন"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>বোনাস বৃদ্ধি সিঁড়ি</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultTiers}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#041910] text-emerald-300 hover:text-white hover:bg-emerald-900/50 border border-emerald-800/60 transition-all cursor-pointer"
                title="ইমেজের অফিসিয়াল রেঞ্জে রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ডিফল্ট রিসেট</span>
              </button>

              <button
                type="button"
                onClick={handleSaveTiers}
                disabled={isSavingTiers}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
                  hasTiersChanged
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black animate-pulse shadow-emerald-500/30'
                    : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-800/30'
                }`}
              >
                {isSavingTiers ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>সংরক্ষণ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>সংরক্ষণ করুন {hasTiersChanged && '●'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Tools: Search, View Switcher & Live Simulator */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-[#041910] border border-emerald-800/70 rounded-xl p-3">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="স্তর বা বন্ধু সংখ্যা খুঁজুন..."
                value={tiersSearchTerm}
                onChange={e => setTiersSearchTerm(e.target.value)}
                className="w-full bg-[#072418] border border-emerald-700/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-emerald-600 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* View Mode Switcher */}
            <div className="md:col-span-3 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTiersViewMode('table')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  tiersViewMode === 'table'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-[#072418] text-emerald-300 hover:bg-emerald-800/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>টেবিল ভিউ</span>
              </button>
              <button
                type="button"
                onClick={() => setTiersViewMode('cards')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  tiersViewMode === 'cards'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-[#072418] text-emerald-300 hover:bg-emerald-800/50'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>কার্ড ভিউ</span>
              </button>
            </div>

            {/* Live Bonus Simulator */}
            <div className="md:col-span-5 flex items-center justify-between sm:justify-end gap-2 bg-[#072418] px-3 py-1.5 rounded-lg border border-emerald-800">
              <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-yellow-400" />
                টেস্ট ক্যালকুলেটর:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={testFriendsCount}
                  onChange={e => setTestFriendsCount(e.target.value)}
                  placeholder="বন্ধু সংখ্যা"
                  className="w-16 bg-[#041910] border border-emerald-700 rounded px-2 py-0.5 text-xs text-white font-bold text-center"
                />
                <span className="text-xs text-yellow-400 font-black font-mono">
                  → ৳{calculatePreviewBonus(parseInt(testFriendsCount, 10) || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Add Bar */}
          <div className="bg-[#041910] border border-yellow-400/30 rounded-xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>দ্রুত নতুন ইনস্ট্যান্ট বোনাস স্তর যুক্ত করুন:</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddTierModalOpen(true)}
                className="text-[11px] text-yellow-300 hover:underline cursor-pointer"
              >
                বড় ফর্মে খুলুন ↗
              </button>
            </div>

            <form onSubmit={handleAddTier} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-emerald-300 mb-0.5">
                  বন্ধু সংখ্যা কোটা (Target Count)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="যেমন: 5, 25, 100"
                  value={newTierCount}
                  onChange={e => setNewTierCount(e.target.value)}
                  className="w-full bg-[#072418] border border-emerald-700/70 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-emerald-300 mb-0.5">
                  বোনাস পরিমাণ (Bonus ৳)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-yellow-400">৳</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="যেমন: 300, 1500"
                    value={newTierBonus}
                    onChange={e => setNewTierBonus(e.target.value)}
                    className="w-full bg-[#072418] border border-emerald-700/70 rounded-lg pl-6 pr-2.5 py-1.5 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-yellow-400 font-bold"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold text-emerald-300 mb-0.5">
                  স্তরের শিরোনাম বা বিবরণ (Description)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ৫ জন বন্ধু বিশেষ আমন্ত্রণ বোনাস"
                  value={newTierDesc}
                  onChange={e => setNewTierDesc(e.target.value)}
                  className="w-full bg-[#072418] border border-emerald-700/70 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs py-1.5 px-3 rounded-lg transition-all shadow-md shadow-yellow-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ যোগ করুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* TABLE VIEW: Displays all tiers with Edit (pencil) & Delete (trash) buttons */}
          {tiersViewMode === 'table' ? (
            <div className="overflow-x-auto rounded-xl border border-emerald-800/80 bg-[#041910]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#072418] text-emerald-300 border-b border-emerald-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">#</th>
                    <th className="py-3 px-3">আমন্ত্রিত বন্ধু লক্ষ্যমাত্রা (Invites)</th>
                    <th className="py-3 px-3">ইনস্ট্যান্ট বোনাস (৳ BDT)</th>
                    <th className="py-3 px-3">বোনাস বৃদ্ধি লেভেল</th>
                    <th className="py-3 px-3">বিবরণ / শর্ত</th>
                    <th className="py-3 px-3 text-center w-28">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/60 text-gray-200 font-medium">
                  {customTiers
                    .filter(t => 
                      !tiersSearchTerm ||
                      t.count.toString().includes(tiersSearchTerm) ||
                      (t.desc && t.desc.toLowerCase().includes(tiersSearchTerm.toLowerCase()))
                    )
                    .map((tier, index) => {
                      const badge = getTierLevelBadge(tier.count);
                      return (
                        <tr key={tier.id || index} className="hover:bg-emerald-950/60 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold text-gray-400">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-extrabold text-white text-sm">
                              {tier.count.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-emerald-400 ml-1">জন বন্ধু</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-black text-yellow-400 font-mono text-sm">
                              ৳{tier.bonus.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-emerald-200/80 text-xs">
                            {tier.desc || `${tier.count} জন বন্ধু আমন্ত্রণ বোনাস`}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Tier Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditTier(tier)}
                                className="p-1.5 rounded-lg bg-emerald-700/30 hover:bg-emerald-600/50 text-emerald-300 hover:text-white transition-all cursor-pointer"
                                title="সম্পাদনা (Edit)"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Tier Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteTier(tier)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                                title="মুছে ফেলুন (Delete)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {customTiers
                .filter(t => 
                  !tiersSearchTerm ||
                  t.count.toString().includes(tiersSearchTerm) ||
                  (t.desc && t.desc.toLowerCase().includes(tiersSearchTerm.toLowerCase()))
                )
                .map((t, index) => {
                  const badge = getTierLevelBadge(t.count);
                  return (
                    <div
                      key={t.id || index}
                      className="bg-[#041910] border border-emerald-800/60 hover:border-emerald-700 rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center text-xs font-black border border-yellow-400/30">
                            {index + 1}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditTier(t)}
                            className="w-7 h-7 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 flex items-center justify-center transition-all cursor-pointer"
                            title="এডিট করুন"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteTier(t)}
                            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-all cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-emerald-400/70 block mb-0.5">বন্ধু লক্ষ্য</span>
                          <input
                            type="number"
                            min="1"
                            value={t.count}
                            onChange={e => handleUpdateTierField(t.id, 'count', e.target.value)}
                            className="w-full bg-[#072418] border border-emerald-800 rounded-lg px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-400/70 block mb-0.5">বোনাস (৳)</span>
                          <input
                            type="number"
                            min="1"
                            value={t.bonus}
                            onChange={e => handleUpdateTierField(t.id, 'bonus', e.target.value)}
                            className="w-full bg-[#072418] border border-emerald-800 rounded-lg px-2 py-1 text-xs text-yellow-400 font-extrabold focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-emerald-400/70 block mb-0.5">বিবরণ / শর্ত</span>
                        <input
                          type="text"
                          value={t.desc || ''}
                          onChange={e => handleUpdateTierField(t.id, 'desc', e.target.value)}
                          placeholder="যেমন: ১ম বন্ধু আমন্ত্রণ"
                          className="w-full bg-[#072418] border border-emerald-800 rounded-lg px-2 py-1 text-xs text-emerald-100 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Bottom Save Notification Reminder */}
          {hasTiersChanged && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-yellow-300 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                আপনি স্তর তালিকায় পরিবর্তন করেছেন। ইউজারদের জন্য কার্যকর করতে সংরক্ষণ বাটনে ক্লিক করুন।
              </span>
              <button
                type="button"
                onClick={handleSaveTiers}
                disabled={isSavingTiers}
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
              >
                <Save className="w-3.5 h-3.5" />
                <span>সংরক্ষণ করুন</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: CLAIMS & REWARDS AUDIT LEDGER */}
      {activeSubTab === 'claims' && (
        <div className="bg-[#072418] border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
          {/* Header & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-yellow-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  মাইলস্টোন দাবি ও কমিশন অডিট লগ
                </h3>
                <span className="text-xs text-emerald-300/70">
                  সর্বমোট {claims.length}টি পুরস্কার দাবির অপরিবর্তনীয় সিস্টেম রেকর্ড
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ইউজার, ফোন বা Trx ID খুঁজুন..."
                  value={claimsSearch}
                  onChange={(e) => setClaimsSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#041910] border border-emerald-700/60 rounded-xl text-xs text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none w-56"
                />
              </div>

              <button
                type="button"
                onClick={handleExportClaimsCSV}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-700/40 hover:bg-emerald-600/50 text-emerald-100 text-xs font-bold border border-emerald-500/40 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-emerald-800/40 bg-[#041910]">
            <table className="w-full text-left text-xs text-emerald-100">
              <thead className="bg-[#082a1c] text-[11px] uppercase tracking-wider text-emerald-300/80 border-b border-emerald-800/50">
                <tr>
                  <th className="py-3 px-4">Trx ID / দাবি আইডি</th>
                  <th className="py-3 px-4">ব্যবহারকারী</th>
                  <th className="py-3 px-4">মাইলস্টোন স্তর</th>
                  <th className="py-3 px-4">প্রয়োজনীয় বন্ধু</th>
                  <th className="py-3 px-4">বোনাস ক্রেডিট</th>
                  <th className="py-3 px-4">দাবির সময়</th>
                  <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-900/40">
                {filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      কোনো মাইলস্টোন দাবি রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-emerald-900/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-yellow-400">
                        {claim.trxId || claim.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{claim.username}</div>
                        <span className="text-[10px] text-emerald-300/60 font-mono">{claim.phone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30">
                          স্তর #{claim.tierId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-300">
                        {claim.requiredCount} জন
                      </td>
                      <td className="py-3 px-4 font-bold text-yellow-400 font-mono text-sm">
                        +৳{Number(claim.bonusAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
                        {claim.claimedAt}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ক্যাশড ইন
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetUserId(claim.userId);
                              setTargetUsername(claim.username);
                              setIsBonusModalOpen(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400 text-yellow-300 hover:text-black font-bold text-[11px] transition-all cursor-pointer"
                            title="অতিরিক্ত বোনাস দিন"
                          >
                            +বোনাস
                          </button>
                          {onOpenUserDetail && (
                            <button
                              type="button"
                              onClick={() => onOpenUserDetail(claim.userId)}
                              className="p-1 rounded-lg bg-emerald-800/40 hover:bg-emerald-700 text-emerald-200 cursor-pointer"
                              title="ইউজার প্রোফাইল খুলুন"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REFERRAL INSPECTOR MODAL */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#09291b] border border-emerald-600/70 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    রেফারেল ইনস্পেক্টর ও নেটওয়ার্ক অডিট
                  </h3>
                  <span className="text-xs text-emerald-300/70 font-mono">ID: {selectedReferral.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Inviter & Invitee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Inviter Box */}
              <div className="bg-[#041910] border border-emerald-800/60 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-yellow-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  আমন্ত্রক (Referrer)
                </span>
                <p className="text-sm font-black text-white">{selectedReferral.referrerUsername}</p>
                <div className="text-[11px] text-gray-300 font-mono">
                  কোড: <span className="text-yellow-300 font-bold">{selectedReferral.referrerCode}</span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  ইউজার আইডি: {selectedReferral.referrerId}
                </div>
                {onOpenUserDetail && (
                  <button
                    type="button"
                    onClick={() => onOpenUserDetail(selectedReferral.referrerId)}
                    className="mt-2 text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>আমন্ত্রকের সম্পূর্ণ প্রোফাইল</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Referred User Box */}
              <div className="bg-[#041910] border border-emerald-800/60 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  আমন্ত্রিত সদস্য (Referred Friend)
                </span>
                <p className="text-sm font-black text-white">{selectedReferral.referredUsername}</p>
                <div className="text-[11px] text-gray-300 font-mono">
                  ফোন: <span className="text-emerald-300">{selectedReferral.referredPhone}</span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  যোগদান: {selectedReferral.joinedAt}
                </div>
                {onOpenUserDetail && (
                  <button
                    type="button"
                    onClick={() => onOpenUserDetail(selectedReferral.referredUserId)}
                    className="mt-2 text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>আমন্ত্রিত বন্ধুর সম্পূর্ণ প্রোফাইল</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Financials Breakdown */}
            <div className="bg-[#041910] border border-emerald-800/60 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-yellow-400" />
                আর্থিক উপাত্ত ও কমিশন লেনদেন
              </span>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-[#072418] p-2.5 rounded-lg border border-emerald-900">
                  <span className="text-[10px] text-gray-400 block">মোট জমা (Deposit)</span>
                  <span className="text-sm font-bold text-white font-mono">৳{(selectedReferral.totalDeposit || 0).toLocaleString()}</span>
                </div>
                <div className="bg-[#072418] p-2.5 rounded-lg border border-emerald-900">
                  <span className="text-[10px] text-gray-400 block">মোট বাজি (Bet)</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">৳{(selectedReferral.totalBet || 0).toLocaleString()}</span>
                </div>
                <div className="bg-[#072418] p-2.5 rounded-lg border border-emerald-900">
                  <span className="text-[10px] text-gray-400 block">মোট অর্জিত কমিশন</span>
                  <span className="text-sm font-bold text-yellow-400 font-mono">৳{(selectedReferral.totalCommissionEarned || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status Management Bar */}
            <div className="bg-[#041910] border border-emerald-800/60 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">বর্তমান স্ট্যাটাস পরিচালনা</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedReferral.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : selectedReferral.status === 'frozen'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}>
                  {selectedReferral.status === 'active' ? 'সক্রিয়' : selectedReferral.status === 'frozen' ? 'স্থগিত' : 'অপেক্ষমান'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedReferral.status === 'active'}
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'active')}
                  className="flex-1 py-2 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  সক্রিয় করুন
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedReferral.status === 'pending_first_deposit'}
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'pending_first_deposit')}
                  className="flex-1 py-2 rounded-xl bg-yellow-600/60 hover:bg-yellow-500 text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  অপেক্ষমান রাখুন
                </button>
                <button
                  type="button"
                  disabled={isUpdatingStatus || selectedReferral.status === 'frozen'}
                  onClick={() => handleUpdateReferralStatus(selectedReferral.id, 'frozen')}
                  className="flex-1 py-2 rounded-xl bg-red-700/60 hover:bg-red-600 text-white font-bold text-xs transition-all disabled:opacity-40 cursor-pointer"
                >
                  স্থগিত করুন
                </button>
              </div>
            </div>

            {/* Direct Bonus Trigger */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTargetUserId(selectedReferral.referrerId);
                  setTargetUsername(selectedReferral.referrerUsername);
                  setSelectedReferral(null);
                  setIsBonusModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>আমন্ত্রককে বোনাস দিন</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL BONUS PAYOUT MODAL */}
      {isBonusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-yellow-400/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-400" />
                ম্যানুয়াল রেফারেল বোনাস প্রদান
              </h3>
              <button
                type="button"
                onClick={() => setIsBonusModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualBonusPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  টার্গেট ইউজার আইডি (User ID):
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: usr-889922"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white font-mono focus:border-yellow-400 focus:outline-none"
                />
                {targetUsername && (
                  <span className="text-[11px] text-yellow-300 mt-1 block">
                    সদস্যের নাম: {targetUsername}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  বোনাস পরিমাণ (BDT):
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(e.target.value)}
                    className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold text-base focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  বোনাসের কারণ ও নোট:
                </label>
                <input
                  type="text"
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  placeholder="যেমন: বিশেষ এজেন্ট কমিশন / মেগা রেফারেল প্রাইজ"
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBonusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBonus}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingBonus ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>প্রদান হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>বোনাস অনুমোদন করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD INSTANT BONUS TIER MODAL */}
      {isAddTierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#09291b] border border-yellow-400/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-yellow-400" />
                <span>নতুন ইনস্ট্যান্ট বোনাস স্তর তৈরি করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTierModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTier} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  আমন্ত্রিত বন্ধু সংখ্যা কোটা (Target Invites Count):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="যেমন: 5, 10, 25, 100, 35000"
                  value={newTierCount}
                  onChange={(e) => setNewTierCount(e.target.value)}
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold text-sm focus:border-yellow-400 focus:outline-none"
                />
                <span className="text-[11px] text-emerald-400/80 mt-1 block">
                  আমন্ত্রক যখন এই সংখ্যক বন্ধু যুক্ত করবে, তখন সে এই স্তরের ইনস্ট্যান্ট বোনাস পাবে।
                </span>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  ইনস্ট্যান্ট বোনাসের পরিমাণ (Bonus ৳ BDT):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-yellow-400 text-sm">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    placeholder="যেমন: 300, 1500, 3000, 3000000"
                    value={newTierBonus}
                    onChange={(e) => setNewTierBonus(e.target.value)}
                    className="w-full pl-8 p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  স্তরের নাম ও বিবরণ (Description):
                </label>
                <input
                  type="text"
                  value={newTierDesc}
                  onChange={(e) => setNewTierDesc(e.target.value)}
                  placeholder="যেমন: ৫ জন বন্ধু বিশেষ আমন্ত্রণ বোনাস"
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>তালিকায় যোগ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT INSTANT BONUS TIER MODAL */}
      {selectedTierForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-emerald-400" />
                <span>ইনস্ট্যান্ট বোনাস স্তর সম্পাদনা (Edit Tier)</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTierForEdit(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTier} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  বন্ধু সংখ্যা কোটা (Target Invites Count):
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={editTierCount}
                  onChange={(e) => setEditTierCount(e.target.value)}
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold text-sm focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  ইনস্ট্যান্ট বোনাস (Bonus ৳ BDT):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-yellow-400 text-sm">৳</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={editTierBonus}
                    onChange={(e) => setEditTierBonus(e.target.value)}
                    className="w-full pl-8 p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-base focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  বিবরণ / শর্ত (Description):
                </label>
                <input
                  type="text"
                  value={editTierDesc}
                  onChange={(e) => setEditTierDesc(e.target.value)}
                  placeholder="যেমন: ১০ জন বন্ধু মেগা রিওয়ার্ড"
                  className="w-full p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTierForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>আপডেট নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE TIER CONFIRMATION MODAL */}
      {selectedTierForDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/40">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                <span>ইনস্ট্যান্ট বোনাস স্তর মুছে ফেলুন?</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTierForDelete(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#041910] border border-red-900/50 rounded-xl p-4 space-y-2 text-xs">
              <p className="text-gray-300">
                আপনি কি নিশ্চিতভাবে নিম্নলিখিত বোনাস স্তরটি স্থায়ীভাবে তালিকা থেকে মুছে ফেলতে চান?
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-emerald-900/40">
                <span className="text-gray-400">টার্গেট বন্ধু সংখ্যা:</span>
                <span className="text-white font-extrabold">{selectedTierForDelete.count} জন বন্ধু</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">বোনাসের পরিমাণ:</span>
                <span className="text-yellow-400 font-black">৳{selectedTierForDelete.bonus.toLocaleString()}</span>
              </div>
              {selectedTierForDelete.desc && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">বিবরণ:</span>
                  <span className="text-emerald-300">{selectedTierForDelete.desc}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTierForDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTier}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INVITE-BASED BONUS INCREASER GENERATOR MODAL */}
      {isIncreaserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#09291b] border border-yellow-400/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-400" />
                <span>ইনভাইট ভিত্তিক ইনস্ট্যান্ট বোনাস বৃদ্ধি জেনারেটর</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsIncreaserModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-emerald-200/80">
                এই টুলের মাধ্যমে আপনি এক ক্লিকেই ইনভাইট সংখ্যার ভিত্তিতে ধাপে ধাপে প্রগতিশীল ইনস্ট্যান্ট বোনাস সিঁড়ি বৃদ্ধি (Ladder Progression) তৈরি করতে পারেন।
              </p>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  প্রাথমিক বেস বোনাস (Base Bonus প্রতি বন্ধু):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-yellow-400 text-sm">৳</span>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={increaserBaseBonus}
                    onChange={(e) => setIncreaserBaseBonus(e.target.value)}
                    className="w-full pl-8 p-2.5 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  বোনাস বৃদ্ধির মডেল (Progression Scale):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIncreaserMultiplier('standard')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      increaserMultiplier === 'standard'
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                        : 'border-emerald-800 bg-[#041910] text-gray-300'
                    }`}
                  >
                    <span className="font-bold block text-sm">স্ট্যান্ডার্ড গ্রোথ</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      অফিসিয়াল ২৪টি স্তরের অনুপাত অনুযায়ী বৃদ্ধি
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIncreaserMultiplier('aggressive')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      increaserMultiplier === 'aggressive'
                        ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                        : 'border-emerald-800 bg-[#041910] text-gray-300'
                    }`}
                  >
                    <span className="font-bold block text-sm">হাই-রিওয়ার্ড বৃদ্ধি</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      উচ্চ মাইলস্টোনে গুণক আকারে সুপার বোনাস
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-[#041910] border border-emerald-800/80 rounded-xl p-3 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 block">
                  প্রিভিউ উদাহরণ (বেস ৳{increaserBaseBonus}):
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
                  <div>১ম বন্ধু: ৳{increaserBaseBonus}</div>
                  <div>৫ম বন্ধু: ৳{Math.round(parseFloat(increaserBaseBonus) * (increaserMultiplier === 'aggressive' ? 1.5 : 1))}</div>
                  <div>১০ জন বন্ধু: ৳{Math.round(parseFloat(increaserBaseBonus) * (increaserMultiplier === 'aggressive' ? 6 : 5))}</div>
                  <div>১০০ জন বন্ধু: ৳{Math.round(parseFloat(increaserBaseBonus) * (increaserMultiplier === 'aggressive' ? 35 : 16.6))}</div>
                  <div>৩৫,০০০ বন্ধু: ৳{Math.round(parseFloat(increaserBaseBonus) * 5000).toLocaleString()}</div>
                  <div>৫০,০০০ বন্ধু: ৳{Math.round(parseFloat(increaserBaseBonus) * 10000).toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncreaserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleApplyIncreaser}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Sliders className="w-4 h-4" />
                  <span>সিঁড়ি জেনারেট ও প্রতিস্থাপন করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD INSTANT BONUS RANGE */}
      {isAddRangeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-emerald-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">নতুন তাৎক্ষণিক বোনাস স্কেল যোগ</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRangeModalOpen(false)}
                className="p-1 rounded-lg bg-emerald-900/40 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">সর্বনিম্ন বন্ধু (Min):</label>
                  <input
                    type="number"
                    min="1"
                    value={rangeMinInput}
                    onChange={(e) => setRangeMinInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                    placeholder="১"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">সর্বোচ্চ বন্ধু (Max):</label>
                  <input
                    type="number"
                    min="1"
                    value={rangeMaxInput}
                    onChange={(e) => setRangeMaxInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                    placeholder="৫"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">প্রতি রেফারে তাৎক্ষণিক বোনাস (টাকা):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    value={rangeBonusInput}
                    onChange={(e) => setRangeBonusInput(e.target.value)}
                    className="w-full pl-7 p-2 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-sm focus:border-yellow-400 focus:outline-none"
                    placeholder="৩০০"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">লেবেল (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={rangeLabelInput}
                  onChange={(e) => setRangeLabelInput(e.target.value)}
                  className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                  placeholder="১ - ৫ জন বন্ধু"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">বিবরণ (ঐচ্ছিক):</label>
                <input
                  type="text"
                  value={rangeDescInput}
                  onChange={(e) => setRangeDescInput(e.target.value)}
                  className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                  placeholder="প্রতি রেফারে তাৎক্ষণিক ৩০০ টাকা"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRangeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddRange}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>স্কেল যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INSTANT BONUS RANGE */}
      {selectedRangeForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-emerald-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">তাৎক্ষণিক বোনাস স্কেল সম্পাদনা</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRangeForEdit(null)}
                className="p-1 rounded-lg bg-emerald-900/40 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">সর্বনিম্ন বন্ধু (Min):</label>
                  <input
                    type="number"
                    min="1"
                    value={rangeMinInput}
                    onChange={(e) => setRangeMinInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">সর্বোচ্চ বন্ধু (Max):</label>
                  <input
                    type="number"
                    min="1"
                    value={rangeMaxInput}
                    onChange={(e) => setRangeMaxInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">প্রতি রেফারে তাৎক্ষণিক বোনাস (টাকা):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="1"
                    value={rangeBonusInput}
                    onChange={(e) => setRangeBonusInput(e.target.value)}
                    className="w-full pl-7 p-2 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">লেবেল:</label>
                <input
                  type="text"
                  value={rangeLabelInput}
                  onChange={(e) => setRangeLabelInput(e.target.value)}
                  className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">বিবরণ:</label>
                <input
                  type="text"
                  value={rangeDescInput}
                  onChange={(e) => setRangeDescInput(e.target.value)}
                  className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRangeForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEditRange}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>আপডেট সম্পন্ন করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE RANGE CONFIRM */}
      {selectedRangeForDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-red-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">স্কেল মুছে ফেলবেন?</h4>
              <p className="text-gray-300 mt-1">
                আপনি কি নিশ্চিত যে <span className="text-yellow-400 font-bold">{selectedRangeForDelete.label || `${selectedRangeForDelete.minCount}-${selectedRangeForDelete.maxCount} জন`}</span> স্কেলটি ডিলিট করতে চান?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRangeForDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRange}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD POROSKAR LEVEL */}
      {isAddLevelModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-emerald-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">নতুন পুরস্কার ধারাবাহিক লেভেল যোগ</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddLevelModalOpen(false)}
                className="p-1 rounded-lg bg-emerald-900/40 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">লেভেল নম্বর (#):</label>
                  <input
                    type="number"
                    min="1"
                    value={levelNumInput}
                    onChange={(e) => setLevelNumInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                    placeholder="১"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">প্রয়োজনীয় বন্ধু সংখ্যা:</label>
                  <input
                    type="number"
                    min="1"
                    value={levelCountInput}
                    onChange={(e) => setLevelCountInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                    placeholder="২"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">পুরস্কার বোনাস (টাকা):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="0.1"
                    step="1"
                    value={levelAmountInput}
                    onChange={(e) => setLevelAmountInput(e.target.value)}
                    className="w-full pl-7 p-2 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-sm focus:border-yellow-400 focus:outline-none"
                    placeholder="১"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">পুরস্কারের নাম:</label>
                  <input
                    type="text"
                    value={levelNameInput}
                    onChange={(e) => setLevelNameInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                    placeholder="লেভেল ১ - সূচনা পদক"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">পদক / ব্যাজ:</label>
                  <select
                    value={levelBadgeInput}
                    onChange={(e) => setLevelBadgeInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none cursor-pointer"
                  >
                    <option value="ব্রোঞ্জ">ব্রোঞ্জ</option>
                    <option value="সিলভার">সিলভার</option>
                    <option value="গোল্ড">গোল্ড</option>
                    <option value="প্লাটিনাম">প্লাটিনাম</option>
                    <option value="ডায়মন্ড">ডায়মন্ড</option>
                    <option value="ক্রাউন">ক্রাউন</option>
                    <option value="মাস্টার">মাস্টার</option>
                    <option value="গ্র্যান্ডমাস্টার">গ্র্যান্ডমাস্টার</option>
                    <option value="লিজেন্ড">লিজেন্ড</option>
                    <option value="সম্রাট">সম্রাট</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLevelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddLevel}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>লেভেল যোগ করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT POROSKAR LEVEL */}
      {selectedLevelForEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-emerald-700/80 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-yellow-400" />
                <h4 className="text-sm font-bold text-white">পুরস্কার লেভেল সম্পাদনা</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLevelForEdit(null)}
                className="p-1 rounded-lg bg-emerald-900/40 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">লেভেল নম্বর (#):</label>
                  <input
                    type="number"
                    min="1"
                    value={levelNumInput}
                    onChange={(e) => setLevelNumInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">প্রয়োজনীয় বন্ধু সংখ্যা:</label>
                  <input
                    type="number"
                    min="1"
                    value={levelCountInput}
                    onChange={(e) => setLevelCountInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">পুরস্কার বোনাস (টাকা):</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">৳</span>
                  <input
                    type="number"
                    min="0.1"
                    step="1"
                    value={levelAmountInput}
                    onChange={(e) => setLevelAmountInput(e.target.value)}
                    className="w-full pl-7 p-2 bg-[#041910] border border-emerald-700 rounded-xl text-yellow-400 font-black text-sm focus:border-yellow-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">পুরস্কারের নাম:</label>
                  <input
                    type="text"
                    value={levelNameInput}
                    onChange={(e) => setLevelNameInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">পদক / ব্যাজ:</label>
                  <select
                    value={levelBadgeInput}
                    onChange={(e) => setLevelBadgeInput(e.target.value)}
                    className="w-full p-2 bg-[#041910] border border-emerald-700 rounded-xl text-white font-bold focus:border-yellow-400 focus:outline-none cursor-pointer"
                  >
                    <option value="ব্রোঞ্জ">ব্রোঞ্জ</option>
                    <option value="সিলভার">সিলভার</option>
                    <option value="গোল্ড">গোল্ড</option>
                    <option value="প্লাটিনাম">প্লাটিনাম</option>
                    <option value="ডায়মন্ড">ডায়মন্ড</option>
                    <option value="ক্রাউন">ক্রাউন</option>
                    <option value="মাস্টার">মাস্টার</option>
                    <option value="গ্র্যান্ডমাস্টার">গ্র্যান্ডমাস্টার</option>
                    <option value="লিজেন্ড">লিজেন্ড</option>
                    <option value="সম্রাট">সম্রাট</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLevelForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEditLevel}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>আপডেট সম্পন্ন করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE POROSKAR LEVEL CONFIRM */}
      {selectedLevelForDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#072418] border border-red-700/80 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 text-xs text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">লেভেল মুছে ফেলবেন?</h4>
              <p className="text-gray-300 mt-1">
                আপনি কি নিশ্চিত যে লেভেল {selectedLevelForDelete.level} ({selectedLevelForDelete.name}) ডিলিট করতে চান?
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedLevelForDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLevel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-md cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
