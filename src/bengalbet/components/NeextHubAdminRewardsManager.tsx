// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck2, 
  ShieldAlert, 
  Tag, 
  Ticket, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Coins, 
  Sparkles, 
  UserCheck, 
  DollarSign, 
  Check, 
  Copy, 
  Filter, 
  Sliders, 
  Award,
  ChevronRight,
  Shield,
  Send,
  Zap,
  RotateCcw
} from 'lucide-react';
import { 
  DailySignInConfig, 
  DailySignInRecord, 
  RescueTierRecord, 
  RescueClaimRecord, 
  PromoCodeRecord, 
  PromoRedemptionRecord, 
  UserTicketRecord, 
  UserAccount,
  MysteryRewardConfig,
  MysteryCashCardRecord
} from '../types';
import { api } from '../services/api';
import { AdminMemberTasks } from './AdminMemberTasks';
import { AdminChanceRewards } from './AdminChanceRewards';
import { AdminPromoRules } from './AdminPromoRules';
import { AdminPromoContent } from './AdminPromoContent';

interface NeextHubAdminRewardsManagerProps {
  language: 'bn' | 'en';
  users?: UserAccount[];
  onRefreshUsers?: () => void;
  onRefreshSiteUser?: () => void;
}

type RewardSubTab = 'signin' | 'rescue' | 'promos' | 'tickets' | 'mystery';

export const NeextHubAdminRewardsManager: React.FC<NeextHubAdminRewardsManagerProps> = ({
  language,
  users = [],
  onRefreshUsers,
  onRefreshSiteUser
}) => {
  const [activeSubTab, setActiveSubTab] = useState<RewardSubTab>('signin');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // 1. DAILY SIGN-IN STATE & HANDLERS
  // =========================================================================
  const [signinConfig, setSigninConfig] = useState<DailySignInConfig | null>(null);
  const [signinRecords, setSigninRecords] = useState<DailySignInRecord[]>([]);
  const [signinSearch, setSigninSearch] = useState('');
  const [signinDateFilter, setSigninDateFilter] = useState('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isManualCreditModalOpen, setIsManualCreditModalOpen] = useState(false);
  
  // Manual Credit Form
  const [manualCreditUserId, setManualCreditUserId] = useState('');
  const [manualCreditDay, setManualCreditDay] = useState(1);
  const [manualCreditBonus, setManualCreditBonus] = useState(10);
  const [manualCreditNote, setManualCreditNote] = useState('অ্যাডমিন বিশেষ সাইন-ইন রিওয়ার্ড');

  const loadSignInData = async () => {
    setIsLoading(true);
    try {
      const [cfgRes, recRes] = await Promise.all([
        api.dailySignIn.getAdminConfig(),
        api.dailySignIn.getAdminRecords(signinSearch, signinDateFilter)
      ]);
      if (cfgRes.success) setSigninConfig(cfgRes.config);
      if (recRes.success) setSigninRecords(recRes.records);
    } catch (e: any) {
      setSigninConfig(null);
      setSigninRecords([]);
      showToast('সাইন-ইনের সেটিংস ও রেকর্ড লোড হয়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSignInConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signinConfig) return;
    try {
      const res = await api.dailySignIn.updateAdminConfig(signinConfig);
      if (res.success) {
        showToast('সাইন-ইন কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
        setIsConfigModalOpen(false);
        loadSignInData();
      }
    } catch (e: any) {
      alert(e.message || 'কনফিগ সেভ করতে ব্যর্থ');
    }
  };

  const handleManualCreditSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCreditUserId) {
      alert('ইউজার নির্বাচন করুন');
      return;
    }
    try {
      const res = await api.dailySignIn.adminManualCredit(
        manualCreditUserId,
        Number(manualCreditDay),
        Number(manualCreditBonus),
        manualCreditNote
      );
      if (res.success) {
        showToast('সফলভাবে সাইন-ইন বোনাস ক্রেডিট হয়েছে!');
        setIsManualCreditModalOpen(false);
        loadSignInData();
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'ক্রেডিট করতে ব্যর্থ');
    }
  };

  const handleResetStreak = async (userId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ইউজারের সাইন-ইন স্ট্রিক রিসেট করতে চান?')) return;
    try {
      const res = await api.dailySignIn.adminResetStreak(userId);
      if (res.success) {
        showToast('স্ট্রিক সফলভাবে রিসেট করা হয়েছে');
        loadSignInData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // =========================================================================
  // 2. RESCUE FUND (উদ্ধার তহবিল) STATE & HANDLERS
  // =========================================================================
  const [rescueTiers, setRescueTiers] = useState<RescueTierRecord[]>([]);
  const [rescueClaims, setRescueClaims] = useState<RescueClaimRecord[]>([]);
  const [rescueStatusFilter, setRescueStatusFilter] = useState('all');
  const [rescueSearch, setRescueSearch] = useState('');
  
  // Tier Modal State
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<RescueTierRecord | null>(null);
  const [tierMinLoss, setTierMinLoss] = useState(500);
  const [tierPercentage, setTierPercentage] = useState(3.0);
  const [tierMaxBonus, setTierMaxBonus] = useState(150);
  const [tierStatus, setTierStatus] = useState<'active' | 'inactive'>('active');

  // Direct Grant Modal
  const [isRescueGrantModalOpen, setIsRescueGrantModalOpen] = useState(false);
  const [grantUserId, setGrantUserId] = useState('');
  const [grantAmount, setGrantAmount] = useState(100);
  const [grantNote, setGrantNote] = useState('বিশেষ লস রেসকিউ অনুদান');

  const loadRescueData = async () => {
    setIsLoading(true);
    try {
      const [tiersRes, claimsRes] = await Promise.all([
        api.rescue.getTiers(),
        api.rescue.getClaims(rescueStatusFilter, rescueSearch)
      ]);
      if (tiersRes.success) setRescueTiers(tiersRes.tiers);
      if (claimsRes.success) setRescueClaims(claimsRes.claims);
    } catch (e: any) {
      setRescueTiers([]);
      setRescueClaims([]);
      showToast('রেসকিউ সেটিংস ও রেকর্ড লোড হয়নি। আবার চেষ্টা করুন।');
      console.error('Rescue load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: Partial<RescueTierRecord> = {
        minLoss: Number(tierMinLoss),
        percentage: Number(tierPercentage),
        maxBonus: Number(tierMaxBonus),
        status: tierStatus
      };
      if (editingTier) {
        data.id = editingTier.id;
      }
      const res = await api.rescue.saveTier(data);
      if (res.success) {
        showToast(editingTier ? 'রেসকিউ টিয়ার আপডেট হয়েছে!' : 'নতুন রেসকিউ টিয়ার যোগ করা হয়েছে!');
        setIsTierModalOpen(false);
        setEditingTier(null);
        loadRescueData();
      }
    } catch (e: any) {
      alert(e.message || 'টিয়ার সংরক্ষণ ব্যর্থ');
    }
  };

  const handleDeleteTier = async (id: number) => {
    if (!confirm('এই রেসকিউ টিয়ারটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.rescue.deleteTier(id);
      if (res.success) {
        showToast('টিয়ার মুছে ফেলা হয়েছে');
        loadRescueData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReviewClaim = async (claimId: string, status: 'approved' | 'rejected') => {
    const adminNote = prompt('অ্যাডমিন নোট লিখুন (ঐচ্ছিক):') || undefined;
    try {
      const res = await api.rescue.reviewClaim(claimId, status, adminNote);
      if (res.success) {
        showToast(`দাবি '${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}' হয়েছে!`);
        loadRescueData();
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleManualGrantRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId) {
      alert('ইউজার নির্বাচন করুন');
      return;
    }
    try {
      const res = await api.rescue.manualGrant(grantUserId, Number(grantAmount), grantNote);
      if (res.success) {
        showToast(`৳${grantAmount} রেসকিউ ফান্ড সফলভাবে ব্যবহারকারীর অ্যাকাউন্টে জমা হয়েছে!`);
        setIsRescueGrantModalOpen(false);
        loadRescueData();
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // =========================================================================
  // 3. PROCHAR CODE / PROMO CODE STATE & HANDLERS
  // =========================================================================
  const [promos, setPromos] = useState<PromoCodeRecord[]>([]);
  const [promoRedemptions, setPromoRedemptions] = useState<PromoRedemptionRecord[]>([]);
  const [promoSearch, setPromoSearch] = useState('');
  const [promoStatusFilter, setPromoStatusFilter] = useState('all');
  const [promoActiveTab, setPromoActiveTab] = useState<'codes' | 'audit'>('codes');

  // Promo Code Modal
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCodeRecord | null>(null);
  const [formPromoCode, setFormPromoCode] = useState('');
  const [formPromoTitle, setFormPromoTitle] = useState('');
  const [formPromoAmount, setFormPromoAmount] = useState(100);
  const [formPromoType, setFormPromoType] = useState<'fixed_cash' | 'percentage' | 'free_spins'>('fixed_cash');
  const [formPromoMinVip, setFormPromoMinVip] = useState(0);
  const [formPromoMaxUsage, setFormPromoMaxUsage] = useState(1000);
  const [formPromoExpires, setFormPromoExpires] = useState('');
  const [formPromoStatus, setFormPromoStatus] = useState<'active' | 'inactive' | 'expired'>('active');
  const [formPromoDesc, setFormPromoDesc] = useState('');

  const loadPromoData = async () => {
    setIsLoading(true);
    try {
      const [promosRes, redRes] = await Promise.all([
        api.promos.getAdminPromos(promoStatusFilter, promoSearch),
        api.promos.getAdminRedemptions(promoSearch)
      ]);
      if (promosRes.success) setPromos(promosRes.promos);
      if (redRes.success) setPromoRedemptions(redRes.redemptions);
    } catch (e: any) {
      setPromos([]);
      setPromoRedemptions([]);
      showToast('প্রোমো সেটিংস ও রেকর্ড লোড হয়নি। আবার চেষ্টা করুন।');
      console.error('Promo load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreatePromo = () => {
    setEditingPromo(null);
    setFormPromoCode(`PROMO${Math.floor(1000 + Math.random() * 9000)}`);
    setFormPromoTitle('বিশেষ ক্যাশব্যাক প্রচার কোড');
    setFormPromoAmount(100);
    setFormPromoType('fixed_cash');
    setFormPromoMinVip(0);
    setFormPromoMaxUsage(500);
    setFormPromoExpires('2026-12-31');
    setFormPromoStatus('active');
    setFormPromoDesc('BengalBet এক্সক্লুসিভ রিডিম কোড');
    setIsPromoModalOpen(true);
  };

  const handleOpenEditPromo = (promo: PromoCodeRecord) => {
    setEditingPromo(promo);
    setFormPromoCode(promo.code);
    setFormPromoTitle(promo.title);
    setFormPromoAmount(promo.amount);
    setFormPromoType(promo.type);
    setFormPromoMinVip(promo.minVipLevel);
    setFormPromoMaxUsage(promo.maxUsageCount || 1000);
    setFormPromoExpires(promo.expiresAt || '');
    setFormPromoStatus(promo.status);
    setFormPromoDesc(promo.description || '');
    setIsPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<PromoCodeRecord> = {
        code: formPromoCode.trim().toUpperCase(),
        title: formPromoTitle.trim(),
        amount: Number(formPromoAmount),
        type: formPromoType,
        minVipLevel: Number(formPromoMinVip),
        maxUsageCount: Number(formPromoMaxUsage),
        expiresAt: formPromoExpires || undefined,
        status: formPromoStatus,
        description: formPromoDesc.trim()
      };

      if (editingPromo) {
        const res = await api.promos.updatePromo(editingPromo.id, payload);
        if (res.success) {
          showToast('প্রচার কোড সফলভাবে আপডেট করা হয়েছে!');
          setIsPromoModalOpen(false);
          loadPromoData();
        }
      } else {
        const res = await api.promos.createPromo(payload);
        if (res.success) {
          showToast(`প্রচার কোড "${res.promo?.code}" সফলভাবে তৈরি হয়েছে!`);
          setIsPromoModalOpen(false);
          loadPromoData();
        }
      }
    } catch (e: any) {
      alert(e.message || 'প্রচার কোড সংরক্ষণ ব্যর্থ');
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('আপনি কি এই প্রচার কোডটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.promos.deletePromo(id);
      if (res.success) {
        showToast('প্রচার কোড মুছে ফেলা হয়েছে');
        loadPromoData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // =========================================================================
  // 4. TICKET RECORD STATE & HANDLERS
  // =========================================================================
  const [tickets, setTickets] = useState<UserTicketRecord[]>([]);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState('all');

  // Create Ticket Modal
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketUserId, setTicketUserId] = useState('');
  const [ticketName, setTicketName] = useState('সুপার ভ্যালু রিওয়ার্ড টিকিট');
  const [ticketType, setTicketType] = useState('কুপন ভাউচার');
  const [ticketAmount, setTicketAmount] = useState(100);
  const [ticketAction, setTicketAction] = useState('temu_chest');
  const [ticketStatus, setTicketStatus] = useState<'active' | 'claimed' | 'used'>('active');

  const loadTicketData = async () => {
    setIsLoading(true);
    try {
      const res = await api.tickets.getAdminTickets(ticketSearch, ticketStatusFilter, ticketTypeFilter);
      if (res.success) setTickets(res.tickets);
    } catch (e: any) {
      console.error('Ticket load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketUserId) {
      alert('ব্যবহারকারী নির্বাচন করুন');
      return;
    }
    try {
      const res = await api.tickets.createTicket({
        userId: ticketUserId,
        name: ticketName,
        type: ticketType,
        amount: `৳ ${Number(ticketAmount).toFixed(2)}`,
        amountNumber: Number(ticketAmount),
        targetAction: ticketAction,
        status: ticketStatus,
        dateCategory: 'today'
      });
      if (res.success) {
        showToast('টিকিট সফলভাবে তৈরি ও প্রদান করা হয়েছে!');
        setIsTicketModalOpen(false);
        loadTicketData();
      }
    } catch (e: any) {
      alert(e.message || 'টিকিট তৈরি করতে ব্যর্থ');
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.tickets.updateTicketStatus(id, newStatus);
      if (res.success) {
        showToast('টিকিট স্ট্যাটাস আপডেট হয়েছে');
        loadTicketData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm('আপনি কি এই টিকিট রেকর্ড মুছে ফেলতে চান?')) return;
    try {
      const res = await api.tickets.deleteTicket(id);
      if (res.success) {
        showToast('টিকিট মুছে ফেলা হয়েছে');
        loadTicketData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // =========================================================================
  // 5. MYSTERY REWARD (২৩ তারিখ রহস্যময় পুরস্কার) STATE & HANDLERS
  // =========================================================================
  const [mysteryConfig, setMysteryConfig] = useState<MysteryRewardConfig | null>(null);
  const [mysteryCards, setMysteryCards] = useState<MysteryCashCardRecord[]>([]);
  const [mysterySearch, setMysterySearch] = useState('');
  const [mysteryStatusFilter, setMysteryStatusFilter] = useState('all');
  const [mysteryMonthFilter, setMysteryMonthFilter] = useState('all');
  const [isTriggeringDrop, setIsTriggeringDrop] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  // Config Form
  const [cfgEnabled, setCfgEnabled] = useState(true);
  const [cfgMinBonus, setCfgMinBonus] = useState(1000);
  const [cfgMaxBonus, setCfgMaxBonus] = useState(50000);
  const [cfgTriggerDay, setCfgTriggerDay] = useState(23);
  const [cfgTriggerHour, setCfgTriggerHour] = useState(18);
  const [cfgMinBet, setCfgMinBet] = useState(500);
  const [cfgPromoCode, setCfgPromoCode] = useState('BENGALBETVIP');
  const [cfgTurnover, setCfgTurnover] = useState(1);
  const [cfgAutoCredit, setCfgAutoCredit] = useState(true);

  // Manual Issue Modal
  const [isManualMysteryModalOpen, setIsManualMysteryModalOpen] = useState(false);
  const [manualMysteryUserId, setManualMysteryUserId] = useState('');
  const [manualMysteryBonus, setManualMysteryBonus] = useState(5000);
  const [manualMysteryNote, setManualMysteryNote] = useState('অ্যাডমিন ম্যানুয়াল ভিআইপি ক্যাশ কার্ড');

  const loadMysteryData = async () => {
    setIsLoading(true);
    try {
      const [cfgRes, cardsRes] = await Promise.all([
        api.mysteryReward.getAdminConfig(),
        api.mysteryReward.getAdminCards(mysterySearch, mysteryStatusFilter, mysteryMonthFilter)
      ]);
      if (cfgRes.success && cfgRes.config) {
        setMysteryConfig(cfgRes.config);
        setCfgEnabled(cfgRes.config.enabled);
        setCfgMinBonus(cfgRes.config.minBonusAmount);
        setCfgMaxBonus(cfgRes.config.maxBonusAmount);
        setCfgTriggerDay(cfgRes.config.triggerDayOfMonth);
        setCfgTriggerHour(cfgRes.config.triggerHour);
        setCfgMinBet(cfgRes.config.minBetRequired);
        setCfgPromoCode(cfgRes.config.promoCode);
        setCfgTurnover(cfgRes.config.wageringTurnover);
        setCfgAutoCredit(cfgRes.config.autoCreditEnabled);
      }
      if (cardsRes.success && cardsRes.cards) {
        setMysteryCards(cardsRes.cards);
      }
    } catch (e: any) {
      setMysteryConfig(null);
      setMysteryCards([]);
      showToast('মিস্ট্রি পুরস্কারের সেটিংস ও রেকর্ড লোড হয়নি। আবার চেষ্টা করুন।');
      console.error('Mystery reward load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMysteryConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.mysteryReward.updateAdminConfig({
        enabled: cfgEnabled,
        minBonusAmount: Number(cfgMinBonus),
        maxBonusAmount: Number(cfgMaxBonus),
        triggerDayOfMonth: Number(cfgTriggerDay),
        triggerHour: Number(cfgTriggerHour),
        minBetRequired: Number(cfgMinBet),
        promoCode: cfgPromoCode.trim().toUpperCase(),
        wageringTurnover: Number(cfgTurnover),
        autoCreditEnabled: cfgAutoCredit
      });
      if (res.success) {
        showToast('২৩ তারিখ রহস্যময় পুরস্কার কনফিগারেশন সফলভাবে আপডেট হয়েছে!');
        setIsEditingConfig(false);
        loadMysteryData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTriggerAutoDrop = async () => {
    if (!confirm('আপনি কি এখনই সকল যোগ্য প্লেয়ারের অ্যাকাউন্টে ২৩ তারিখ রহস্যময় ক্যাশ কার্ড ড্রপ রান করতে চান?')) return;
    setIsTriggeringDrop(true);
    try {
      const res = await api.mysteryReward.triggerAdminDrop();
      if (res.success) {
        showToast(res.message);
        loadMysteryData();
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'ড্রপ সম্পন্ন করতে ব্যর্থ');
    } finally {
      setIsTriggeringDrop(false);
    }
  };

  const handleManualIssueMysteryCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualMysteryUserId) {
      alert('অনুগ্রহ করে একজন ব্যবহারকারী নির্বাচন করুন');
      return;
    }
    try {
      const res = await api.mysteryReward.manualIssueCard({
        userId: manualMysteryUserId,
        bonusAmount: Number(manualMysteryBonus),
        note: manualMysteryNote
      });
      if (res.success) {
        showToast(res.message);
        setIsManualMysteryModalOpen(false);
        loadMysteryData();
        if (onRefreshUsers) onRefreshUsers();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Initial load depending on subTab
  useEffect(() => {
    if (activeSubTab === 'signin') loadSignInData();
    else if (activeSubTab === 'rescue') loadRescueData();
    else if (activeSubTab === 'promos') loadPromoData();
    else if (activeSubTab === 'tickets') loadTicketData();
    else if (activeSubTab === 'mystery') loadMysteryData();
  }, [activeSubTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-black font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0a3523] via-[#0e4b32] to-[#125c3e] border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 -bottom-6 w-48 h-48 rounded-full bg-yellow-400/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>রিওয়ার্ড ও প্রচার কন্ট্রোল সেন্টার</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black uppercase">
                    CRUD MODULE
                  </span>
                </h2>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  দৈনিক সাইন-ইন কাজ, লস রেসকিউ ফান্ড, প্রচার কোড (প্রোমো কোড), টিকিট রেকর্ড ও ২৩ তারিখ রহস্যময় পুরস্কার কন্ট্রোল
                </p>
              </div>
            </div>
          </div>

          {/* Quick Refresh */}
          <button
            onClick={() => {
              if (activeSubTab === 'signin') loadSignInData();
              else if (activeSubTab === 'rescue') loadRescueData();
              else if (activeSubTab === 'promos') loadPromoData();
              else if (activeSubTab === 'tickets') loadTicketData();
              else if (activeSubTab === 'mystery') loadMysteryData();
            }}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 border border-emerald-500/40 text-xs font-bold text-white flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-yellow-300' : ''}`} />
            <span>তথ্য রিফ্রেশ</span>
          </button>
        </div>

        {/* 5 SUB TABS (DESKTOP & MOBILE RESPONSIVE) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-emerald-700/40">
          <button
            onClick={() => setActiveSubTab('signin')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'signin'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 font-black'
                : 'bg-black/20 text-emerald-200 hover:bg-white/5 border-emerald-600/30'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4 shrink-0" />
            <span className="truncate">১. সাইন-ইন</span>
          </button>

          <button
            onClick={() => setActiveSubTab('rescue')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'rescue'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 font-black'
                : 'bg-black/20 text-emerald-200 hover:bg-white/5 border-emerald-600/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="truncate">২. রেসকিউ ফান্ড</span>
          </button>

          <button
            onClick={() => setActiveSubTab('promos')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'promos'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 font-black'
                : 'bg-black/20 text-emerald-200 hover:bg-white/5 border-emerald-600/30'
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">৩. প্রচার কোড</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tickets')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'tickets'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 font-black'
                : 'bg-black/20 text-emerald-200 hover:bg-white/5 border-emerald-600/30'
            }`}
          >
            <Ticket className="w-4 h-4 shrink-0" />
            <span className="truncate">৪. টিকিট রেকর্ড</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mystery')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeSubTab === 'mystery'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-lg shadow-yellow-500/20 font-black'
                : 'bg-purple-950/40 text-amber-300 hover:bg-white/5 border-amber-500/40'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">৫. ২৩ তারিখ রহস্যময়</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DAILY SIGN-IN TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'signin' && (
        <div className="space-y-4">
          <AdminPromoContent />
          <AdminPromoRules />
          <AdminChanceRewards />
          <AdminMemberTasks />
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ইউজারনেম বা আইডি দিয়ে খুঁজুন..."
                  value={signinSearch}
                  onChange={e => setSigninSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadSignInData()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-yellow-400"
                />
              </div>
              <input
                type="date"
                value={signinDateFilter}
                onChange={e => setSigninDateFilter(e.target.value)}
                className="py-1.5 px-2 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs focus:outline-hidden focus:border-yellow-400"
              />
              <button
                onClick={loadSignInData}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 cursor-pointer"
              >
                ফিল্টার
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#0e3c29] hover:bg-[#145239] border border-emerald-500/40 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                <Sliders className="w-3.5 h-3.5 text-yellow-400" />
                <span>কনফিগারেশন সেটিং</span>
              </button>

              <button
                onClick={() => setIsManualCreditModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-yellow-500/20"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>ম্যানুয়াল ক্রেডিট</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#072418] border border-emerald-700/40 p-3.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-medium">মোট সাইন-ইন রেকর্ড</span>
              <p className="text-xl font-black text-white mt-1">{signinRecords.length} বার</p>
            </div>
            <div className="bg-[#072418] border border-emerald-700/40 p-3.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-medium">মোট বোনাস বিতরণ</span>
              <p className="text-xl font-black text-yellow-400 mt-1">
                ৳ {signinRecords.reduce((acc, r) => acc + (r.bonus || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-[#072418] border border-emerald-700/40 p-3.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-medium">আজকের ক্লেইম</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {signinRecords.filter(r => r.date === new Date().toISOString().slice(0, 10)).length} জন
              </p>
            </div>
            <div className="bg-[#072418] border border-emerald-700/40 p-3.5 rounded-xl">
              <span className="text-[11px] text-gray-400 font-medium">সিস্টেম স্ট্যাটাস</span>
              <p className="text-xs font-bold text-emerald-300 mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {signinConfig?.enabled ? 'স্বয়ংক্রিয় সাইন-ইন সক্রিয়' : 'নিষ্ক্রিয়'}
              </p>
            </div>
          </div>

          {/* Records Table / Mobile Card View */}
          <div className="bg-[#072418] border border-emerald-700/40 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-800/40 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-yellow-400" />
                <span>দৈনিক সাইন-ইন ক্লেইম ইতিহাস</span>
              </h3>
              <span className="text-[11px] text-emerald-300/80 font-mono">মোট {signinRecords.length} টি</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#04160e] text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-emerald-800/40">
                  <tr>
                    <th className="px-4 py-3">ইউজারনেম</th>
                    <th className="px-4 py-3">দিন (Day)</th>
                    <th className="px-4 py-3">বোনাস (৳)</th>
                    <th className="px-4 py-3">স্ট্রিক</th>
                    <th className="px-4 py-3">তারিখ ও সময়</th>
                    <th className="px-4 py-3">নোট / গুণক</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/30">
                  {signinRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-medium">
                        কোনো সাইন-ইন রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    signinRecords.map(r => (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <div>{r.username}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{r.userId}</div>
                        </td>
                        <td className="px-4 py-3 font-black text-yellow-400">
                          দিন {r.day}
                        </td>
                        <td className="px-4 py-3 font-black text-emerald-400">
                          +৳{r.bonus.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-200">
                          🔥 {r.streak} দিন
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                          {r.claimedAt.replace('T', ' ').slice(0, 19)}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-300">
                          {r.note || (r.vipMultiplier ? `VIP +${r.vipMultiplier}%` : 'স্বাভাবিক')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleResetStreak(r.userId)}
                            title="স্ট্রিক রিসেট করুন"
                            className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold cursor-pointer"
                          >
                            স্ট্রিক রিসেট
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-emerald-900/30">
              {signinRecords.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">কোনো রেকর্ড পাওয়া যায়নি</div>
              ) : (
                signinRecords.map(r => (
                  <div key={r.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{r.username}</span>
                      <span className="font-black text-emerald-400 text-xs">+৳{r.bonus.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>দিন: <strong className="text-yellow-400">{r.day}</strong></span>
                      <span>স্ট্রিক: <strong className="text-white">{r.streak} দিন</strong></span>
                      <span>{r.date}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-gray-400 truncate max-w-[200px]">{r.note || 'স্বাভাবিক ক্লেইম'}</span>
                      <button
                        onClick={() => handleResetStreak(r.userId)}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        রিসেট
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RESCUE FUND TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'rescue' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ইউজারনেম বা আইডি দিয়ে খুঁজুন..."
                  value={rescueSearch}
                  onChange={e => setRescueSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadRescueData()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-yellow-400"
                />
              </div>
              <select
                value={rescueStatusFilter}
                onChange={e => {
                  setRescueStatusFilter(e.target.value);
                  setTimeout(loadRescueData, 50);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs focus:outline-hidden focus:border-yellow-400"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="approved">অনুমোদিত (Approved)</option>
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingTier(null);
                  setTierMinLoss(500);
                  setTierPercentage(3.0);
                  setTierMaxBonus(150);
                  setTierStatus('active');
                  setIsTierModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#0e3c29] hover:bg-[#145239] border border-emerald-500/40 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-yellow-400" />
                <span>নতুন টিয়ার তৈরি</span>
              </button>

              <button
                onClick={() => setIsRescueGrantModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-yellow-500/20"
              >
                <Coins className="w-3.5 h-3.5 stroke-[3]" />
                <span>বিশেষ উদ্ধার অনুদান</span>
              </button>
            </div>
          </div>

          {/* Rescue Tiers Grid (CRUD) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span>রেসকিউ ফান্ড লেভেল ও অনুদান শতাংশ (Tiers)</span>
              </h3>
              <span className="text-[11px] text-emerald-300/80">{rescueTiers.length} টি স্তর কনফিগার করা</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {rescueTiers.map(t => (
                <div
                  key={t.id}
                  className="bg-[#072418] border border-emerald-700/40 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-gray-400">টিয়ার #{t.id}</span>
                      <h4 className="text-base font-black text-yellow-400 mt-0.5">
                        {t.percentage}% রেসকিউ
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {t.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </span>
                  </div>

                  <div className="my-3 space-y-1.5 text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ন্যূনতম দৈনিক লস:</span>
                      <span className="font-bold text-white">৳{t.minLoss.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">সর্বোচ্চ বোনাস:</span>
                      <span className="font-bold text-emerald-400">৳{t.maxBonus.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-800/40">
                    <button
                      onClick={() => {
                        setEditingTier(t);
                        setTierMinLoss(t.minLoss);
                        setTierPercentage(t.percentage);
                        setTierMaxBonus(t.maxBonus);
                        setTierStatus(t.status);
                        setIsTierModalOpen(true);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTier(t.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Claims History & Approvals */}
          <div className="bg-[#072418] border border-emerald-700/40 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-800/40 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-400" />
                <span>প্লেয়ারদের রেসকিউ দাবি ও অনুমোদন লগ</span>
              </h3>
              <span className="text-[11px] text-emerald-300/80 font-mono">মোট {rescueClaims.length} টি</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#04160e] text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-emerald-800/40">
                  <tr>
                    <th className="px-4 py-3">ইউজার</th>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">মোট বাজি</th>
                    <th className="px-4 py-3">নিট লস</th>
                    <th className="px-4 py-3">শতাংশ (%)</th>
                    <th className="px-4 py-3">বোনাস (৳)</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/30">
                  {rescueClaims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-medium">
                        কোনো রেসকিউ ক্লেইম রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    rescueClaims.map(c => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <div>{c.username}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{c.userId}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-mono">{c.date}</td>
                        <td className="px-4 py-3 text-gray-300">৳{c.totalBet.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-red-400">৳{c.netLoss.toLocaleString()}</td>
                        <td className="px-4 py-3 font-bold text-yellow-400">{c.percentage}%</td>
                        <td className="px-4 py-3 font-black text-emerald-400">+৳{c.bonusAmount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            c.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {c.status === 'approved' ? 'অনুমোদিত' : c.status === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {c.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleReviewClaim(c.id, 'approved')}
                                className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                অনুমোদন
                              </button>
                              <button
                                onClick={() => handleReviewClaim(c.id, 'rejected')}
                                className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-400">{c.adminNote || 'নিষ্পন্ন'}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-emerald-900/30">
              {rescueClaims.map(c => (
                <div key={c.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{c.username}</span>
                    <span className="font-black text-emerald-400 text-xs">+৳{c.bonusAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>লস: <strong className="text-red-400">৳{c.netLoss}</strong></span>
                    <span>হার: <strong className="text-yellow-400">{c.percentage}%</strong></span>
                    <span>{c.date}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400">{c.status}</span>
                    {c.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewClaim(c.id, 'approved')}
                          className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold"
                        >
                          অনুমোদন
                        </button>
                        <button
                          onClick={() => handleReviewClaim(c.id, 'rejected')}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold"
                        >
                          বাতিল
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PROCHAR CODE / PROMO CODE TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'promos' && (
        <div className="space-y-4">
          {/* Sub Switch: Active Codes vs Redemptions Audit */}
          <div className="flex items-center justify-between bg-[#072418] p-3 rounded-xl border border-emerald-700/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPromoActiveTab('codes')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  promoActiveTab === 'codes'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                প্রচার কোড তালিকা ({promos.length})
              </button>
              <button
                onClick={() => setPromoActiveTab('audit')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  promoActiveTab === 'audit'
                    ? 'bg-yellow-400 text-black shadow-md'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                রিডিম অডিট লগ ({promoRedemptions.length})
              </button>
            </div>

            <button
              onClick={handleOpenCreatePromo}
              className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-yellow-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>নতুন প্রচার কোড তৈরি</span>
            </button>
          </div>

          {promoActiveTab === 'codes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {promos.map(p => (
                <div
                  key={p.id}
                  className="bg-[#072418] border border-emerald-700/40 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/60 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-yellow-400" />
                        <span className="font-mono font-black text-base tracking-wider text-yellow-400">
                          {p.code}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        p.status === 'expired' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {p.status === 'active' ? 'সক্রিয়' : p.status === 'expired' ? 'মেয়াদোত্তীর্ণ' : 'নিষ্ক্রিয়'}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs mt-2">{p.title}</h4>
                    {p.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{p.description}</p>
                    )}

                    <div className="my-3 space-y-1 text-xs text-gray-300 pt-2 border-t border-emerald-800/40">
                      <div className="flex justify-between">
                        <span className="text-gray-400">পুরস্কার বোনাস:</span>
                        <span className="font-black text-emerald-400">৳{p.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ন্যূনতম VIP:</span>
                        <span className="font-bold text-white">VIP {p.minVipLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ব্যবহারিত / সীমা:</span>
                        <span className="font-mono text-gray-200">
                          {p.currentUsageCount || 0} / {p.maxUsageCount || 'সীমাহীন'}
                        </span>
                      </div>
                      {p.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">মেয়াদ:</span>
                          <span className="font-mono text-[11px] text-gray-400">{p.expiresAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-800/40">
                    <button
                      onClick={() => handleOpenEditPromo(p)}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(p.code);
                        showToast(`কোড "${p.code}" কপি করা হয়েছে!`);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-300 cursor-pointer"
                      title="কোড কপি করুন"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePromo(p.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Promo Redemptions Audit Log */
            <div className="bg-[#072418] border border-emerald-700/40 rounded-xl overflow-hidden">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#04160e] text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-emerald-800/40">
                    <tr>
                      <th className="px-4 py-3">কোড (Code)</th>
                      <th className="px-4 py-3">ব্যবহারকারী</th>
                      <th className="px-4 py-3">বোনাস (৳)</th>
                      <th className="px-4 py-3">রিডিম তারিখ ও সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-900/30">
                    {promoRedemptions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400 font-medium">
                          কোনো প্রচার কোড রিডিম হিস্ট্রি পাওয়া যায়নি
                        </td>
                      </tr>
                    ) : (
                      promoRedemptions.map(r => (
                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-mono font-black text-yellow-400">{r.code}</td>
                          <td className="px-4 py-3 font-bold text-white">
                            <div>{r.username}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{r.userId}</div>
                          </td>
                          <td className="px-4 py-3 font-black text-emerald-400">+৳{r.bonusAmount.toFixed(2)}</td>
                          <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">{r.redeemedAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-emerald-900/30">
                {promoRedemptions.map(r => (
                  <div key={r.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-black text-yellow-400 text-xs">{r.code}</div>
                      <div className="text-gray-300 text-xs font-bold mt-0.5">{r.username}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{r.redeemedAt}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-xs">+৳{r.bonusAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TICKET RECORD TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'tickets' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ইউজার, টিকিট নাম বা কোড দিয়ে খুঁজুন..."
                  value={ticketSearch}
                  onChange={e => setTicketSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadTicketData()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs placeholder:text-gray-400 focus:outline-hidden focus:border-yellow-400"
                />
              </div>

              <select
                value={ticketStatusFilter}
                onChange={e => {
                  setTicketStatusFilter(e.target.value);
                  setTimeout(loadTicketData, 50);
                }}
                className="py-1.5 px-2.5 rounded-lg bg-black/40 border border-emerald-600/40 text-white text-xs focus:outline-hidden focus:border-yellow-400"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="active">সক্রিয় (Active)</option>
                <option value="claimed">দাবি করা (Claimed)</option>
                <option value="used">ব্যবহৃত (Used)</option>
              </select>
            </div>

            <button
              onClick={() => {
                setTicketUserId('');
                setTicketName('সুপার ভ্যালু রিওয়ার্ড টিকিট');
                setTicketType('কুপন ভাউচার');
                setTicketAmount(100);
                setTicketAction('temu_chest');
                setTicketStatus('active');
                setIsTicketModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-yellow-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>নতুন টিকিট ইস্যু করুন</span>
            </button>
          </div>

          {/* Tickets Table / Cards */}
          <div className="bg-[#072418] border border-emerald-700/40 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-emerald-800/40 flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-yellow-400" />
                <span>সকল ইস্যু করা টিকিট রেকর্ড</span>
              </h3>
              <span className="text-[11px] text-emerald-300/80 font-mono">মোট {tickets.length} টি</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#04160e] text-[11px] uppercase tracking-wider text-gray-400 font-semibold border-b border-emerald-800/40">
                  <tr>
                    <th className="px-4 py-3">ইউজারনেম</th>
                    <th className="px-4 py-3">টিকিট নাম</th>
                    <th className="px-4 py-3">ধরন</th>
                    <th className="px-4 py-3">রিডিম কোড</th>
                    <th className="px-4 py-3">মূল্যমান</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3">ব্যবহার/ইস্যু সময়</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/30">
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400 font-medium">
                        কোনো টিকিট রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    tickets.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-bold text-white">
                          <div>{t.username}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{t.userId}</div>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-200">{t.name}</td>
                        <td className="px-4 py-3 text-gray-400">{t.type}</td>
                        <td className="px-4 py-3 font-mono font-bold text-yellow-300">{t.redeemCode}</td>
                        <td className="px-4 py-3 font-black text-emerald-400">{t.amount}</td>
                        <td className="px-4 py-3">
                          <select
                            value={t.status}
                            onChange={e => handleUpdateTicketStatus(t.id, e.target.value)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 border cursor-pointer ${
                              t.status === 'active' ? 'text-amber-300 border-amber-500/40' :
                              t.status === 'claimed' ? 'text-emerald-300 border-emerald-500/40' :
                              'text-gray-400 border-gray-600'
                            }`}
                          >
                            <option value="active">সক্রিয় (Active)</option>
                            <option value="claimed">দাবি করা (Claimed)</option>
                            <option value="used">ব্যবহৃত (Used)</option>
                            <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                          {t.usedTime || t.createdAt}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-emerald-900/30">
              {tickets.map(t => (
                <div key={t.id} className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-xs">{t.name}</span>
                      <div className="text-[10px] text-gray-400">{t.username}</div>
                    </div>
                    <span className="font-black text-emerald-400 text-xs">{t.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-yellow-300 font-bold">{t.redeemCode}</span>
                    <span className="text-gray-400 text-[10px]">{t.usedTime || t.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'active' ? 'bg-amber-500/20 text-amber-300' :
                      t.status === 'claimed' ? 'bg-emerald-500/20 text-emerald-300' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {t.status}
                    </span>
                    <button
                      onClick={() => handleDeleteTicket(t.id)}
                      className="text-red-400 text-[11px] hover:underline"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MYSTERY REWARD (প্রতি মাসের ২৩ তারিখ রহস্যময় পুরস্কার) TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'mystery' && (
        <div className="space-y-4">
          {/* Top Summary Stat Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-300/80 font-bold">সর্বোচ্চ বোনাস রেঞ্জ</span>
              <div className="text-base sm:text-lg font-black text-yellow-400 font-mono mt-1">
                ৳ {cfgMinBonus.toLocaleString()} - ৳ {cfgMaxBonus.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1">অটো-ড্রপ বা ম্যানুয়াল</span>
            </div>

            <div className="bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-300/80 font-bold">অটো-ড্রপ সময়সূচী</span>
              <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                প্রতি মাসের {cfgTriggerDay} তারিখ
              </div>
              <span className="text-[10px] text-amber-300 mt-1">সন্ধ্যা {cfgTriggerHour}:০০ টায় স্বয়ংক্রিয়</span>
            </div>

            <div className="bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-300/80 font-bold">প্রোমোকোড ও ভেগারিং</span>
              <div className="text-base sm:text-lg font-black text-yellow-300 font-mono mt-1">
                {cfgPromoCode}
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1">মাত্র {cfgTurnover} গুণ (1x) ভেগারিং</span>
            </div>

            <div className="bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-300/80 font-bold">অংশগ্রহণের যোগ্যতা</span>
              <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                ন্যূনতম ৳ {cfgMinBet.toLocaleString()}
              </div>
              <span className="text-[10px] text-purple-300 mt-1">১ থেকে ২২ তারিখ পর্যন্ত মোট বেট</span>
            </div>

            <div className="bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40 flex flex-col justify-between col-span-2 lg:col-span-1">
              <span className="text-[11px] text-emerald-300/80 font-bold">মোট ইস্যুকৃত কার্ড</span>
              <div className="text-base sm:text-lg font-black text-emerald-300 font-mono mt-1">
                {mysteryCards.length} টি
              </div>
              <span className="text-[10px] text-emerald-400/80 mt-1">
                দাবি: {mysteryCards.filter(c => c.status === 'claimed').length} | প্রস্তুত: {mysteryCards.filter(c => c.status === 'unlocked').length}
              </span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#072418] p-3.5 rounded-xl border border-emerald-700/40">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTriggerAutoDrop}
                disabled={isTriggeringDrop}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isTriggeringDrop ? 'animate-spin' : ''}`} />
                <span>{isTriggeringDrop ? 'অটো-ড্রপ চলছে...' : '🚀 এখনই ২৩ তারিখ অটো-ড্রপ রান করুন'}</span>
              </button>

              <button
                onClick={() => {
                  setManualMysteryUserId(users[0]?.id || '');
                  setManualMysteryBonus(5000);
                  setManualMysteryNote('অ্যাডমিন ম্যানুয়াল ভিআইপি ক্যাশ কার্ড');
                  setIsManualMysteryModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-700/50 hover:bg-purple-700 border border-purple-500/50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-yellow-400" />
                <span>ম্যানুয়ালি ক্যাশ কার্ড ইস্যু</span>
              </button>

              <button
                onClick={() => setIsEditingConfig(!isEditingConfig)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isEditingConfig
                    ? 'bg-yellow-400 text-black border-yellow-300 shadow-md font-black'
                    : 'bg-white/5 hover:bg-white/10 text-emerald-200 border-emerald-600/40'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isEditingConfig ? 'কনফিগারেশন বন্ধ' : '⚙️ কনফিগারেশন এডিট'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="ইউজারনেম বা কার্ড কোড..."
                  value={mysterySearch}
                  onChange={e => setMysterySearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadMysteryData()}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs placeholder-gray-400 focus:outline-hidden focus:border-yellow-400"
                />
              </div>

              <select
                value={mysteryStatusFilter}
                onChange={e => {
                  setMysteryStatusFilter(e.target.value);
                  setTimeout(() => loadMysteryData(), 50);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold focus:outline-hidden"
              >
                <option value="all">সমস্ত স্ট্যাটাস</option>
                <option value="unlocked">প্রস্তুত / আনলকড (Unlocked)</option>
                <option value="claimed">দাবি সম্পন্ন (Claimed)</option>
                <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
              </select>
            </div>
          </div>

          {/* Collapsible Configuration Form Panel */}
          {isEditingConfig && (
            <div className="bg-gradient-to-br from-[#062417] via-[#083020] to-[#041d12] p-5 rounded-2xl border-2 border-yellow-400/50 shadow-2xl animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-base font-black text-white">
                    ২৩ তারিখ রহস্যময় ক্যাশ কার্ড সিস্টেম রুলস ও কনফিগারেশন
                  </h3>
                </div>
                <span className="text-xs text-yellow-300 font-bold bg-yellow-400/10 px-2.5 py-1 rounded-full border border-yellow-400/30">
                  অফিশিয়াল পলিসি
                </span>
              </div>

              <form onSubmit={handleSaveMysteryConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/60">
                    <label className="block text-xs font-bold text-gray-300 mb-1">ইভেন্ট স্ট্যাটাস</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={cfgEnabled}
                        onChange={e => setCfgEnabled(e.target.checked)}
                        className="w-4 h-4 text-yellow-400 rounded accent-yellow-400 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white">
                        {cfgEnabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Inactive)'}
                      </span>
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/60">
                    <label className="block text-xs font-bold text-gray-300 mb-1">অটো-ক্রেডিট ফিচার</label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={cfgAutoCredit}
                        onChange={e => setCfgAutoCredit(e.target.checked)}
                        className="w-4 h-4 text-yellow-400 rounded accent-yellow-400 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-white">
                        ২৩ তারিখ সন্ধ্যা ৬টায় অটো ক্রেডিট
                      </span>
                    </label>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-emerald-800/60">
                    <label className="block text-xs font-bold text-gray-300 mb-1">প্রোমোকোড</label>
                    <input
                      type="text"
                      value={cfgPromoCode}
                      onChange={e => setCfgPromoCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-emerald-700 text-yellow-300 font-mono text-xs font-black uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">সর্বনিম্ন বোনাস (৳)</label>
                    <input
                      type="number"
                      min="100"
                      value={cfgMinBonus}
                      onChange={e => setCfgMinBonus(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">সর্বোচ্চ বোনাস (৳)</label>
                    <input
                      type="number"
                      min="500"
                      value={cfgMaxBonus}
                      onChange={e => setCfgMaxBonus(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ড্রপ দিন (তারিখ)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={cfgTriggerDay}
                      onChange={e => setCfgTriggerDay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">ড্রপ সময় (ঘন্টা 0-23)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={cfgTriggerHour}
                      onChange={e => setCfgTriggerHour(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ১-২২ তারিখ ন্যূনতম প্রয়োজনীয় বাজি (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cfgMinBet}
                      onChange={e => setCfgMinBet(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      ভেগারিং টার্নওভার (গুণ / Multiplier)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={cfgTurnover}
                      onChange={e => setCfgTurnover(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                  <button
                    type="button"
                    onClick={() => setIsEditingConfig(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    কনফিগারেশন সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cards Ledger Table */}
          <div className="bg-[#072418] border border-emerald-700/40 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3.5 border-b border-emerald-800/60 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                <span>২৩ তারিখ রহস্যময় ক্যাশ কার্ড হিস্ট্রি ও লেজার</span>
              </h3>
              <span className="text-xs text-gray-400 font-mono">মোট {mysteryCards.length} টি রেকর্ড</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/30 border-b border-emerald-800/60 text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                    <th className="px-4 py-3">ব্যবহারকারী</th>
                    <th className="px-4 py-3">কার্ড কোড</th>
                    <th className="px-4 py-3">প্রোমোকোড</th>
                    <th className="px-4 py-3">বোনাস পরিমাণ</th>
                    <th className="px-4 py-3">টার্নওভার</th>
                    <th className="px-4 py-3">মাস / বছর</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3">দাবির সময়</th>
                    <th className="px-4 py-3">টিকিট কোড</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-900/30 text-xs">
                  {mysteryCards.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                        কোনো রহস্যময় ক্যাশ কার্ড পাওয়া যায়নি। উপরে '🚀 এখনই ২৩ তারিখ অটো-ড্রপ রান করুন' অথবা 'ম্যানুয়ালি ক্যাশ কার্ড ইস্যু' করুন।
                      </td>
                    </tr>
                  ) : (
                    mysteryCards.map(c => (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{c.username}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {c.userId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-700/60 text-purple-300 font-mono font-bold text-[11px]">
                            {c.cardCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-yellow-300 text-[11px]">
                          {c.voucherCode}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-amber-400 font-mono text-sm">
                            ৳ {c.bonusAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-emerald-300 font-bold">
                          {c.turnoverMultiplier}x (১ গুণ)
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-300 text-[11px]">
                          {c.month}/{c.year}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            c.status === 'unlocked'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                              : c.status === 'claimed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border border-red-500/40'
                          }`}>
                            {c.status === 'unlocked' ? 'প্রস্তুত / আনলকড' : c.status === 'claimed' ? 'দাবি সম্পন্ন' : 'মেয়াদ শেষ'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-gray-400 font-mono">
                          {c.claimedAt || 'দাবি করা হয়নি'}
                        </td>
                        <td className="px-4 py-3 font-mono text-purple-300 text-[11px]">
                          {c.ticketCode || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-emerald-900/30">
              {mysteryCards.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs">
                  কোনো রহস্যময় ক্যাশ কার্ড পাওয়া যায়নি
                </div>
              ) : (
                mysteryCards.map(c => (
                  <div key={c.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-xs">{c.username}</span>
                        <div className="text-[10px] text-purple-300 font-mono">{c.cardCode}</div>
                      </div>
                      <span className="font-black text-amber-400 font-mono text-sm">
                        ৳ {c.bonusAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-300">
                      <span className="font-mono text-yellow-300 font-bold">{c.voucherCode}</span>
                      <span>{c.month}/{c.year} • {c.turnoverMultiplier}x বাজি</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'unlocked' ? 'bg-amber-500/20 text-amber-300' :
                        c.status === 'claimed' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {c.status === 'unlocked' ? 'আনলকড ক্যাশ কার্ড' : c.status === 'claimed' ? 'দাবি সম্পন্ন' : 'এক্সপায়ার্ড'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {c.claimedAt ? `ক্লেইম: ${c.claimedAt.slice(0, 10)}` : 'অপেক্ষমান'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SIGN-IN CONFIG MODAL */}
      {/* ========================================================================= */}
      {isConfigModalOpen && signinConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-2xl p-5 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <span>দৈনিক সাইন-ইন গ্লোবাল কনফিগারেশন</span>
              </h3>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSignInConfig} className="space-y-4 mt-4">
              <div className="flex items-center justify-between bg-black/30 p-3 rounded-xl border border-emerald-800/40">
                <div>
                  <label className="font-bold text-xs text-white">স্বয়ংক্রিয় সাইন-ইন সিস্টেম চালু</label>
                  <p className="text-[11px] text-gray-400">খেলোয়াড়দের প্রতিদিন চেক-ইন বোনাস চালু বা বন্ধ করুন</p>
                </div>
                <input
                  type="checkbox"
                  checked={signinConfig.enabled}
                  onChange={e => setSigninConfig({ ...signinConfig, enabled: e.target.checked })}
                  className="w-5 h-5 accent-yellow-400 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">সাইকেল দিন (Cycle Days)</label>
                  <input
                    type="number"
                    value={signinConfig.cycleDays || 30}
                    onChange={e => setSigninConfig({ ...signinConfig, cycleDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">দৈনিক ন্যূনতম বেট শর্ত (৳)</label>
                  <input
                    type="number"
                    value={signinConfig.dailyRequiredBet || 0}
                    onChange={e => setSigninConfig({ ...signinConfig, dailyRequiredBet: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Day-by-Day Bonus Configuration (First 7 days preview / edit) */}
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5">
                  প্রতিদিনের বোনাসের পরিমাণ (৳):
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-2 bg-black/30 rounded-xl border border-emerald-800/40">
                  {(signinConfig.days || []).map((d, idx) => (
                    <div key={d.day} className="bg-emerald-950/60 p-2 rounded-lg border border-emerald-800/30 text-center">
                      <span className="text-[10px] text-gray-400 font-mono block">দিন {d.day}</span>
                      <input
                        type="number"
                        step="0.5"
                        value={d.bonus}
                        onChange={e => {
                          const newDays = [...(signinConfig.days || [])];
                          newDays[idx] = { ...newDays[idx], bonus: Number(e.target.value) };
                          setSigninConfig({ ...signinConfig, days: newDays });
                        }}
                        className="w-full mt-1 px-1 py-0.5 text-center bg-black/60 border border-emerald-600/40 text-yellow-300 font-bold text-xs rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  কনফিগারেশন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL CREDIT SIGN-IN MODAL */}
      {/* ========================================================================= */}
      {isManualCreditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <span>ম্যানুয়াল সাইন-ইন বোনাস ক্রেডিট</span>
              </h3>
              <button
                onClick={() => setIsManualCreditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualCreditSignIn} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">ব্যবহারকারী নির্বাচন করুন</label>
                <select
                  value={manualCreditUserId}
                  onChange={e => setManualCreditUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold focus:outline-hidden focus:border-yellow-400"
                  required
                >
                  <option value="">-- ইউজার বেছে নিন --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} (ব্যালেন্স: ৳{u.balance} | VIP {u.vipLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">দিন নম্বর (Day #)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={manualCreditDay}
                    onChange={e => setManualCreditDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">বোনাস পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="1"
                    value={manualCreditBonus}
                    onChange={e => setManualCreditBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">অ্যাডমিন নোট / বার্তা</label>
                <input
                  type="text"
                  value={manualCreditNote}
                  onChange={e => setManualCreditNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsManualCreditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  ক্রেডিট নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: RESCUE TIER ADD/EDIT MODAL */}
      {/* ========================================================================= */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>{editingTier ? 'রেসকিউ টিয়ার এডিট করুন' : 'নতুন রেসকিউ টিয়ার তৈরি'}</span>
              </h3>
              <button
                onClick={() => setIsTierModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTier} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">ন্যূনতম দৈনিক লস (৳)</label>
                <input
                  type="number"
                  value={tierMinLoss}
                  onChange={e => setTierMinLoss(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">উদ্ধার হার (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tierPercentage}
                    onChange={e => setTierPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">সর্বোচ্চ বোনাস (৳)</label>
                  <input
                    type="number"
                    value={tierMaxBonus}
                    onChange={e => setTierMaxBonus(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-emerald-300 text-xs font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">স্ট্যাটাস</label>
                <select
                  value={tierStatus}
                  onChange={e => setTierStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsTierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: RESCUE MANUAL GRANT MODAL */}
      {/* ========================================================================= */}
      {isRescueGrantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <span>সরাসরি রেসকিউ অনুদান ক্রেডিট</span>
              </h3>
              <button
                onClick={() => setIsRescueGrantModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualGrantRescue} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">ব্যবহারকারী নির্বাচন করুন</label>
                <select
                  value={grantUserId}
                  onChange={e => setGrantUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold focus:outline-hidden focus:border-yellow-400"
                  required
                >
                  <option value="">-- ইউজার বেছে নিন --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} (ব্যালেন্স: ৳{u.balance} | VIP {u.vipLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">রেসকিউ অনুদানের পরিমাণ (৳)</label>
                <input
                  type="number"
                  min="10"
                  value={grantAmount}
                  onChange={e => setGrantAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-emerald-300 text-xs font-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">অনুদানের কারণ / নোট</label>
                <input
                  type="text"
                  value={grantNote}
                  onChange={e => setGrantNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsRescueGrantModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  অনুদান সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PROMO CODE CREATE/EDIT MODAL */}
      {/* ========================================================================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                <span>{editingPromo ? 'প্রচার কোড এডিট করুন' : 'নতুন প্রচার কোড তৈরি'}</span>
              </h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-3.5 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">কোড (Code)</label>
                  <input
                    type="text"
                    value={formPromoCode}
                    onChange={e => setFormPromoCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 font-mono text-xs font-black tracking-wider uppercase"
                    placeholder="e.g. VIP500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">বোনাস পরিমাণ (৳)</label>
                  <input
                    type="number"
                    min="1"
                    value={formPromoAmount}
                    onChange={e => setFormPromoAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-emerald-300 text-xs font-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">শিরোনাম</label>
                <input
                  type="text"
                  value={formPromoTitle}
                  onChange={e => setFormPromoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  placeholder="e.g. স্পেশাল ডিপোজিট বোনাস"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">ন্যূনতম VIP</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formPromoMinVip}
                    onChange={e => setFormPromoMinVip(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">সর্বোচ্চ ব্যবহার</label>
                  <input
                    type="number"
                    min="1"
                    value={formPromoMaxUsage}
                    onChange={e => setFormPromoMaxUsage(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">স্ট্যাটাস</label>
                  <select
                    value={formPromoStatus}
                    onChange={e => setFormPromoStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  >
                    <option value="active">সক্রিয়</option>
                    <option value="inactive">নিষ্ক্রিয়</option>
                    <option value="expired">মেয়াদ শেষ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">মেয়াদ শেষ হওয়ার তারিখ</label>
                <input
                  type="date"
                  value={formPromoExpires}
                  onChange={e => setFormPromoExpires(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">বিবরণ / নিয়মাবলী</label>
                <textarea
                  rows={2}
                  value={formPromoDesc}
                  onChange={e => setFormPromoDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs"
                  placeholder="কোডের নিয়মাবলী লিখুন..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ISSUE TICKET MODAL */}
      {/* ========================================================================= */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-emerald-600/40 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span>নতুন টিকিট / ভাউচার ইস্যু করুন</span>
              </h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTicket} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">ব্যবহারকারী</label>
                <select
                  value={ticketUserId}
                  onChange={e => setTicketUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold focus:outline-hidden focus:border-yellow-400"
                  required
                >
                  <option value="">-- ইউজার নির্বাচন করুন --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} (VIP {u.vipLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">টিকিটের নাম</label>
                <input
                  type="text"
                  value={ticketName}
                  onChange={e => setTicketName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">ধরন (Type)</label>
                  <select
                    value={ticketType}
                    onChange={e => setTicketType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  >
                    <option value="কুপন ভাউচার">কুপন ভাউচার</option>
                    <option value="চেক-ইন রিওয়ার্ড">চেক-ইন রিওয়ার্ড</option>
                    <option value="ক্ষতিপূরণ ফান্ড">ক্ষতিপূরণ ফান্ড</option>
                    <option value="প্রচার কোড">প্রচার কোড</option>
                    <option value="বিশেষ ইভেন্ট">বিশেষ ইভেন্ট</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">মূল্যমান (৳)</label>
                  <input
                    type="number"
                    min="1"
                    value={ticketAmount}
                    onChange={e => setTicketAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-emerald-300 text-xs font-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">টার্গেট অ্যাকশন</label>
                  <select
                    value={ticketAction}
                    onChange={e => setTicketAction(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  >
                    <option value="temu_chest">সুপার ভ্যালু চেস্ট</option>
                    <option value="signin">দৈনিক সাইন-ইন</option>
                    <option value="rescue">উদ্ধার তহবিল</option>
                    <option value="golden_egg">গোল্ডেন এগ</option>
                    <option value="spin">লাকি স্পিন</option>
                    <option value="red_envelope">রেড এনভেলপ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">স্ট্যাটাস</label>
                  <select
                    value={ticketStatus}
                    onChange={e => setTicketStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="claimed">দাবি সম্পন্ন (Claimed)</option>
                    <option value="used">ব্যবহৃত (Used)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black cursor-pointer shadow-lg"
                >
                  ইস্যু সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: MANUAL ISSUE MYSTERY CASH CARD MODAL */}
      {/* ========================================================================= */}
      {isManualMysteryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#072418] border border-amber-500/50 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-yellow-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>ম্যানুয়াল রহস্যময় ক্যাশ কার্ড ইস্যু</span>
              </h3>
              <button
                onClick={() => setIsManualMysteryModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualIssueMysteryCard} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  প্রাপক ব্যবহারকারী নির্বাচন করুন
                </label>
                <select
                  value={manualMysteryUserId}
                  onChange={e => setManualMysteryUserId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs font-bold focus:outline-hidden focus:border-yellow-400"
                  required
                >
                  <option value="">-- ইউজার বেছে নিন --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} (ব্যালেন্স: ৳{u.balance} | VIP {u.vipLevel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  বোনাস পরিমাণ (৳ ১,০০০ - ৳ ৫০,০০০)
                </label>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="100"
                  value={manualMysteryBonus}
                  onChange={e => setManualMysteryBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-yellow-300 text-sm font-black font-mono focus:outline-hidden focus:border-yellow-400"
                  required
                />
                <div className="flex gap-2 mt-1.5">
                  {[1000, 2500, 5000, 10000, 25000, 50000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setManualMysteryBonus(amt)}
                      className="px-2 py-0.5 rounded-md bg-emerald-900/50 hover:bg-emerald-800 text-[10px] font-mono text-emerald-200 border border-emerald-700/60 cursor-pointer"
                    >
                      ৳{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  প্রোমোকোড ও টার্নওভার
                </label>
                <div className="p-2.5 rounded-xl bg-black/30 border border-emerald-800/60 flex items-center justify-between text-xs">
                  <span className="font-mono text-yellow-300 font-bold">BENGALBETVIP</span>
                  <span className="text-emerald-300 font-bold">১ গুণ (1x) ভেগারিং</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  অ্যাডমিন নোট / মন্তব্য
                </label>
                <input
                  type="text"
                  value={manualMysteryNote}
                  onChange={e => setManualMysteryNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-emerald-600/40 text-white text-xs"
                  placeholder="e.g. VIP মেম্বারশিপ স্পেশাল ড্রপ"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setIsManualMysteryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-black cursor-pointer shadow-lg active:scale-95 transition-all"
                >
                  ক্যাশ কার্ড প্রদান করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};