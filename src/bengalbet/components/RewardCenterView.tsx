// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Copy, 
  Check, 
  Ticket, 
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  PackageOpen,
  CalendarCheck2,
  HeartHandshake,
  Tag,
  Gift,
  ShieldCheck,
  Coins,
  UserPlus,
  Percent,
  Award,
  Crown,
  Pencil,
  CheckSquare,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, RescueTierRecord, PromoCodeRecord, UserTicketRecord } from '../types';
import { api } from '../services/api';
import { refreshSettledReward } from '../services/settledReward';
import { mayClaimMemberTask } from '../services/memberTaskState';
import { memberTaskLabel } from '../services/memberTaskConfig';
import { MysteryRewardModal } from './MysteryRewardModal';

interface RewardCenterViewProps {
  user: UserAccount;
  initialRightView?: 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records';
  initialSigninTab?: 'new_member' | 'daily_signin';
  onOpenSuperValueReward: () => void;
  onOpenGoldenEgg: () => void;
  onOpenSpin?: () => void;
  onOpenRedEnvelope?: () => void;
  onOpenMysteryReward?: () => void;
  onClaimCoupon?: (couponId: number, name: string) => void;
  onClaimSuccess?: (amount: number, title: string) => void;
  onSettledReward?: () => void;
  onOpenInvite?: () => void;
  onOpenVip?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

interface TicketRecordItem {
  id: string;
  name: string;
  type: string;
  usedTime: string;
  productName: string;
  redeemCode: string;
  amount: string;
  status: 'claimed' | 'used' | 'active';
  dateCategory: 'today' | 'yesterday' | '7days';
}

interface ClaimedPromoItem {
  id: string;
  code: string;
  title: string;
  bonusAmount: string;
  claimedAt: string;
  source: string;
  status?: string;
}



export const RewardCenterView: React.FC<RewardCenterViewProps> = ({
  user,
  initialRightView = 'coupons',
  initialSigninTab = 'new_member',
  onOpenSuperValueReward,
  onOpenGoldenEgg,
  onOpenSpin,
  onOpenRedEnvelope,
  onOpenMysteryReward,
  onClaimCoupon,
  onClaimSuccess,
  onSettledReward,
  onOpenInvite,
  onOpenVip,
  onBack,
  onClose
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMysteryModalOpen, setIsMysteryModalOpen] = useState(false);
  const [mysteryStatus, setMysteryStatus] = useState<any>(null);
  const bnNum = (n: number) => Number(n || 0).toLocaleString('en-IN').replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  const mCfg = mysteryStatus?.config || {};
  const mDayBn = bnNum(mCfg.triggerDayOfMonth ?? 23);
  const mHourNum = Number(mCfg.triggerHour ?? 18);
  const mHourBn = `${mHourNum >= 17 ? 'সন্ধ্যা' : mHourNum >= 12 ? 'দুপুর/বিকাল' : 'সকাল'} ${bnNum(mHourNum % 12 === 0 ? 12 : mHourNum % 12)}টা`;
  const mRangeBn = `৳${bnNum(mCfg.minBonusAmount ?? 1000)}–৳${bnNum(mCfg.maxBonusAmount ?? 50000)}`;
  
  // Active main view mode on the right panel
  // 'coupons' | 'temu_chest' (Capture 1) | 'signin' (Capture 2 & 5) | 'rescue' (Capture 3) | 'promo' (Capture 4) | 'ticket_records'
  const [activeRightView, setActiveRightView] = useState<'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records'>(
    initialRightView === 'temu_chest' ? 'coupons' : initialRightView
  );
  
  // Mobile sub-view: 'overview' (2x3 grid from Capture.PNG & c2.PNG) or specific subview
  const [mobileView, setMobileView] = useState<'overview' | 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records'>('overview');
  
  // Bornona (Description) Modal state matching image.png
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  // Sign-in task tab: 'new_member' (Capture 2) vs 'daily_signin' (Capture 5)
  const [signinTab, setSigninTab] = useState<'new_member' | 'daily_signin'>(initialSigninTab);

  useEffect(() => {
    if (initialRightView && typeof initialRightView === 'string') {
      const validViews = ['coupons', 'temu_chest', 'signin', 'rescue', 'promo', 'ticket_records'];
      const resolved = validViews.includes(initialRightView) ? initialRightView : 'coupons';
      const targetView = resolved === 'temu_chest' ? 'coupons' : (resolved as any);
      setActiveRightView(targetView);
      if (resolved === 'coupons' || resolved === 'temu_chest') {
        setMobileView('overview');
      } else {
        setMobileView(resolved as any);
      }
    } else {
      setMobileView('overview');
      setActiveRightView('coupons');
    }
  }, [initialRightView]);

  useEffect(() => {
    if (initialSigninTab) {
      setSigninTab(initialSigninTab);
    }
  }, [initialSigninTab]);
  // Ref to automatically scroll mobile container to top and focus when view changes
  const mobileContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mobileContainerRef.current) {
        mobileContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        mobileContainerRef.current.focus({ preventScroll: true });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [mobileView]);

  const [signedDays, setSignedDays] = useState<number[]>([]);
  const [signinStreak, setSigninStreak] = useState(0);
  const [signinTotalBonus, setSigninTotalBonus] = useState(0);
  const [hasSignedToday, setHasSignedToday] = useState(false);
  const [signinDay, setSigninDay] = useState<number | null>(null);
  const [signinEligible, setSigninEligible] = useState(false);
  const [signinBusy, setSigninBusy] = useState(false);
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinDaysData, setSigninDaysData] = useState<{ day: number; bonus: number }[]>([]);

  // Promo Code State (Capture 4)
  const [promoInput, setPromoInput] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<string | null>(null);
  const [claimedPromos, setClaimedPromos] = useState<ClaimedPromoItem[]>([]);
  const [activePromosList, setActivePromosList] = useState<PromoCodeRecord[]>([]);
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);

  // Rescue Fund State (Capture 3)
  const [rescueClaimed, setRescueClaimed] = useState(false);
  const [rescueFeedback, setRescueFeedback] = useState<string | null>(null);
  const [rescueNetLoss, setRescueNetLoss] = useState(0);
  const [rescuePercentage, setRescuePercentage] = useState(3.0);
  const [rescueEligibleBonus, setRescueEligibleBonus] = useState(0);
  const [rescueTiersList, setRescueTiersList] = useState<RescueTierRecord[]>([]);

  // Ticket Records filter state
  const [recordDateFilter, setRecordDateFilter] = useState<'today' | 'yesterday' | '7days' | 'all'>('all');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<string>('all');
  const [copiedRecordCode, setCopiedRecordCode] = useState<string | null>(null);
  const [realTickets, setRealTickets] = useState<UserTicketRecord[]>([]);

  // Load Real Backend Data for All 4 Modules
  const loadRewardBackendData = async () => {
    try {
      const [signRes, rescueRes, promoRes, myPromoRes, ticketRes, mysteryRes, memberRes] = await Promise.all([
        api.dailySignIn.getStatus().catch(() => null),
        api.rescue.getStatus().catch(() => null),
        api.promos.getActivePromos().catch(() => null),
        api.promos.getMyRedemptions().catch(() => null),
        api.tickets.getMyTickets().catch(() => null),
        api.mysteryReward.getStatus().catch(() => null),
        api.newMember.getStatus().catch(() => null),
      ]);

      setMemberTasks(memberRes?.success ? memberRes.tasks : []);
      if (signRes && signRes.success) {
        const signData = (signRes as any).status || signRes;
        setSigninStreak(signData.currentStreak || signData.streak || 0);
        setSigninTotalBonus(signData.totalClaimedBonus || signData.totalBonus || 0);
        setHasSignedToday(signData.hasSignedToday);
        setSigninDay(signData.todayDayNumber ?? null);
        setSigninEligible(signData.isEligible === true);
        setSignedDays([]);
        if (signData.history && signData.history.length > 0) {
          const days = signData.history.map((h: any) => h.day);
          setSignedDays(Array.from(new Set([...days])));
        }
        if (signData.config && signData.config.days) {
          setSigninDaysData(signData.config.days);
        }
      }

      if (!signRes?.success) { setSigninEligible(false); setSigninDay(null); setSigninDaysData([]); }

      if (rescueRes && rescueRes.success) {
        const rescueData = (rescueRes as any).status || rescueRes;
        setRescueClaimed(rescueData.hasClaimedToday);
        setRescueNetLoss(rescueData.netLoss || 0);
        setRescuePercentage(rescueData.percentage || 3.0);
        setRescueEligibleBonus(rescueData.eligibleBonus || 0);
        if (rescueData.tiers && rescueData.tiers.length > 0) {
          setRescueTiersList(rescueData.tiers);
        }
      }

      if (promoRes && promoRes.success && promoRes.promos) {
        setActivePromosList(promoRes.promos);
      }

      if (mysteryRes && mysteryRes.success) {
        setMysteryStatus(mysteryRes);
        if (mysteryRes.hasClaimed) {
          setClaimedCouponIds(prev => prev.includes(6) ? prev : [...prev, 6]);
        }
      }

      if (myPromoRes && myPromoRes.success && myPromoRes.redemptions && myPromoRes.redemptions.length > 0) {
        const formatted = myPromoRes.redemptions.map((r: any) => ({
          id: r.id,
          code: r.code,
          title: `প্রচার কোড (${r.code}) বোনাস`,
          bonusAmount: `৳ ${r.bonusAmount.toFixed(2)}`,
          claimedAt: r.redeemedAt,
          source: 'সিস্টেম ভাউচার',
          status: 'claimed' as const,
        }));
        setClaimedPromos(formatted);
      }

      if (ticketRes && ticketRes.success && ticketRes.tickets && ticketRes.tickets.length > 0) {
        setRealTickets(ticketRes.tickets);
      }
    } catch (e) {
      console.warn('Backend rewards sync warning:', e);
    }
  };

  useEffect(() => {
    loadRewardBackendData();
  }, [user.id]);

  // Live countdowns matching Capture.PNG and Capture2.PNG
  const [timeRemaining1, setTimeRemaining1] = useState({ days: 2, hours: 20, minutes: 12, seconds: 25 });
  const [timeRemaining2, setTimeRemaining2] = useState({ days: 26, hours: 16, minutes: 22, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining1(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
      setTimeRemaining2(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(user.username || '1615249856');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const [claimedCouponIds, setClaimedCouponIds] = useState<number[]>([]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await api.auth.getMe();
    } catch {
      // Ignore network errors on refresh
    }
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleClaimCoupon = async (id: number, type: string) => {
    const isFirstClaim = !claimedCouponIds.includes(id);
    const bonusAmount = id === 4 ? 150 : id === 5 ? 188 : 100;
    const bonusTitle = id === 1 ? 'BengalBet সুপার ভ্যালু রিওয়ার্ড'
      : id === 2 ? 'দৈনিক সাইন-ইন টিকিট'
      : id === 3 ? 'গোল্ডেন এগ ভাঙার টিকিট'
      : id === 4 ? 'লাকি স্পিন ফ্রি টিকিট'
      : 'লাল খামের বৃষ্টি টিকিট';

    if (isFirstClaim) {
      setClaimedCouponIds(prev => [...prev, id]);
      if (onClaimSuccess) {
        onClaimSuccess(bonusAmount, `${bonusTitle} (+৳${bonusAmount})`);
      }
      try {
        await api.rewards.claim('mission', bonusAmount, `${bonusTitle} (+৳${bonusAmount})`);
      } catch (e) {
        console.warn('Could not sync coupon claim with backend:', e);
      }
      if (onClaimCoupon) {
        onClaimCoupon(id, type);
      }
      confetti({
        particleCount: 60,
        spread: 65,
        origin: { y: 0.6 }
      });
    }

    const delay = isFirstClaim ? 300 : 50;

    // Immediately trigger open for the requested reward section / modal!
    if (type === 'temu_chest' || id === 1) {
      setTimeout(() => {
        if (onOpenSuperValueReward) {
          onOpenSuperValueReward();
        }
      }, delay);
    } else if (type === 'signin' || id === 2) {
      setActiveRightView('signin');
      setMobileView('signin');
    } else if (type === 'golden_egg' || id === 3) {
      setTimeout(() => {
        if (onOpenGoldenEgg) {
          onOpenGoldenEgg();
        }
      }, delay);
    } else if (type === 'spin' || id === 4) {
      setTimeout(() => {
        if (onOpenSpin) {
          onOpenSpin();
        }
      }, delay);
    } else if (type === 'red_envelope' || id === 5) {
      setTimeout(() => {
        if (onOpenRedEnvelope) {
          onOpenRedEnvelope();
        }
      }, delay);
    } else if (type === 'mystery' || id === 6) {
      setTimeout(() => {
        setIsMysteryModalOpen(true);
        if (onOpenMysteryReward) {
          onOpenMysteryReward();
        }
      }, delay);
    }
  };

  const handleUseTicketRecord = async (item: any) => {
    if (item.status === 'active') {
      try {
        await api.tickets.useTicket(item.id);
        loadRewardBackendData();
      } catch (e) {
        console.warn('Could not mark ticket as used:', e);
      }
    }

    const action = item.targetAction;
    if (action === 'temu_chest' || item.name?.includes('সুপার ভ্যালু') || item.productName?.includes('সুপার ভ্যালু') || item.id === 'tr-1') {
      if (onOpenSuperValueReward) onOpenSuperValueReward();
    } else if (action === 'signin' || item.name?.includes('সাইন-ইন') || item.type?.includes('চেক-ইন') || item.id === 'tr-2') {
      setActiveRightView('signin');
      setMobileView('signin');
    } else if (action === 'golden_egg' || item.name?.includes('গোল্ডেন এগ') || item.productName?.includes('সোনার ডিম') || item.id === 'tr-4') {
      if (onOpenGoldenEgg) onOpenGoldenEgg();
    } else if (action === 'spin' || item.name?.includes('স্পিন') || item.productName?.includes('স্পিন') || item.id === 'tr-3') {
      if (onOpenSpin) onOpenSpin();
    } else if (action === 'red_envelope' || item.name?.includes('রেড এনভেলপ') || item.name?.includes('লাল') || item.id === 'tr-5') {
      if (onOpenRedEnvelope) onOpenRedEnvelope();
    } else if (action === 'rescue' || item.name?.includes('রেসকিউ') || item.type?.includes('ক্ষতিপূরণ') || item.id === 'tr-7') {
      setActiveRightView('rescue');
      setMobileView('rescue');
    } else if (action === 'mystery' || item.name?.includes('রহস্যময়') || item.type?.includes('mystery') || item.productName?.includes('রহস্যময়')) {
      setIsMysteryModalOpen(true);
    } else {
      if (onOpenSuperValueReward) onOpenSuperValueReward();
    }
  };

  // 12-Day New Member Action
  const [memberTasks, setMemberTasks] = useState<any[]>([]);
  const [memberBusy, setMemberBusy] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const handleSignIn12Day = async (day: number, _bonus: number, _task: string) => {
    if (!mayClaimMemberTask(memberTasks, day, memberBusy)) return;
    setMemberBusy(true); setMemberError(null);
    try {
      const result = await api.newMember.claim(day);
      await refreshSettledReward(result, onSettledReward);
      await loadRewardBackendData();
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 } });
    } catch (error: any) {
      setMemberError(error.message || 'কাজের পুরস্কার গ্রহণ করা যায়নি।');
      await loadRewardBackendData();
    } finally { setMemberBusy(false); }
  };

  // 30-Day Daily Sign-in action
  const handleSignInDay = async (day: number, _bonus: number) => {
    if (signinBusy || !signinEligible || hasSignedToday || day !== signinDay) return;
    setSigninBusy(true);
    setSigninError(null);
    try {
      const res = await api.dailySignIn.claim();
      if (!res.success || typeof res.bonus !== 'number') throw new Error('দৈনিক পুরস্কার নিশ্চিত হয়নি।');
      setHasSignedToday(true);
      setSigninEligible(false);
      setSignedDays(prev => Array.from(new Set([...prev, res.dayNumber])));
      setSigninStreak(res.streak);
      await refreshSettledReward(res, onSettledReward);
      await loadRewardBackendData();
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.5 } });
    } catch (e: any) {
      setSigninError(e.message || 'দৈনিক পুরস্কার গ্রহণ করা যায়নি।');
      await loadRewardBackendData();
    } finally { setSigninBusy(false); }
  };

  const signin12DaysData = memberTasks.map(task => ({ ...task, icon: task.requirementType === 'deposit' ? '💰' : task.requirementType === 'bet' ? '🎲' : '🧧', task: memberTaskLabel(task) }));

  const signin30DaysData = signinDaysData;

  // Promo code redemption
  const handleApplyPromo = async (codeToRedeem?: string) => {
    const code = (codeToRedeem || promoInput).trim().toUpperCase();
    if (!code) {
      setPromoFeedback('অনুগ্রহ করে একটি বৈধ প্রচার কোড প্রবেশ করান');
      return;
    }

    try {
      const res = await api.promos.redeem(code);
      if (res && res.success) {
        setPromoFeedback(`অভিনন্দন! কোড "${code}" সফলভাবে রিডিম হয়েছে। ৳ ${res.bonusAmount.toFixed(2)} বোনাস আপনার অ্যাকাউন্টে যোগ হয়েছে।`);
        await refreshSettledReward(res, onSettledReward);
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.5 }
        });
        setPromoInput('');
        loadRewardBackendData();
        return;
      }
    } catch (e: any) {
      setPromoFeedback(e.message || 'প্রচার কোড যাচাইকরণ ব্যর্থ হয়েছে');
      return;
    }
  };

  const handleRedeemPromo = () => handleApplyPromo();

  // Rescue fund claim
  const handleClaimRescue = async () => {
    if (rescueClaimed) return;
    try {
      const res = await api.rescue.claim();
      if (res && res.success) {
        setRescueClaimed(true);
        setRescueFeedback(`অভিনন্দন! ৳ ${res.claim.bonusAmount.toFixed(2)} উদ্ধার তহবিল সফলভাবে আপনার ব্যালেন্সে যোগ হয়েছে।`);
        await refreshSettledReward(res, onSettledReward);
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.5 }
        });
        loadRewardBackendData();
        return;
      }
    } catch (e: any) {
      setRescueFeedback(e.message || 'আজকের উদ্ধার তহবিল দাবি ব্যর্থ হয়েছে');
      return;
    }
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  // ---------------------------------------------------------------------------
  // HELPER VIEW RENDER FUNCTIONS
  // ---------------------------------------------------------------------------

  // VIEW 0: MAIN COUPONS LIST (DEFAULT)
  const renderCouponsContent = () => (
    <div className="p-3 sm:p-5 flex flex-col flex-1">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        {/* Left: | প্রাপ্তি সেন্টার 6 */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-[#7c3aed] rounded-full" />
          <h2 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
            প্রাপ্তি সেন্টার
          </h2>
          <span className="w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center">
            {Math.max(0, 6 - claimedCouponIds.length)}
          </span>
        </div>

        {/* Right: 🎟️ টিকিটের রেকর্ড */}
        <button 
          onClick={() => {
            setActiveRightView('ticket_records');
            setMobileView('ticket_records');
          }}
          className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold font-bengali flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
        >
          <Ticket className="w-3.5 h-3.5 text-purple-600" />
          <span>টিকিটের রেকর্ড</span>
        </button>
      </div>

      {/* Coupons List matching Capture.PNG */}
      <div className="space-y-3.5 flex-1">
        
        {/* COUPON CARD 1: BengalBet সুপার ভ্যালু রিওয়ার্ড */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#fef08a]/40 via-[#fef9c3]/50 to-white border border-yellow-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden group hover:border-yellow-400 transition-all">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-gray-700/80 pl-1">
              1
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
                BengalBet সুপার ভ্যালু রিওয়ার্ড
              </h3>
              <button 
                onClick={() => setIsDescriptionOpen(true)}
                className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 hover:text-amber-600 font-bengali transition-colors cursor-pointer group/btn"
              >
                <span className="px-2 py-0.5 rounded-full bg-[#fde047]/30 border border-amber-200/90 text-[11px] font-bold text-gray-700 group-hover/btn:bg-amber-100 transition-colors flex items-center gap-1">
                  <span>বর্ণনা</span>
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] text-white text-[8px] font-black flex items-center justify-center">i</span>
                </span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleClaimCoupon(1, 'temu_chest')}
            className="flex items-stretch shadow-md rounded-xl overflow-hidden border border-amber-300 w-full sm:w-auto max-w-[340px] cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group/ticket"
            title="সুপার ভ্যালু রিওয়ার্ড দাবি ও খুলুন"
          >
            <div className="bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white px-4 py-2.5 flex flex-col justify-center min-w-[150px] group-hover/ticket:brightness-105 transition-all">
              <span className="text-[10px] font-medium text-yellow-200 font-bengali">কুপন</span>
              <span className="text-sm sm:text-base font-black font-bengali tracking-wide leading-tight">
                টেমু টিকিট
              </span>
              <span className="text-[9px] text-yellow-100 font-bengali mt-0.5">
                শেষ তারিখ: ২০২৬-০৯-০১
              </span>
            </div>
            <div className="bg-[#fffbeb] px-3.5 py-2.5 flex flex-col items-center justify-center border-l-2 border-dashed border-amber-300 min-w-[120px]">
              <span className="text-[11px] font-black font-bengali text-amber-600 leading-tight">
                {claimedCouponIds.includes(1) ? 'সক্রিয় টিকিট' : 'উপলব্ধ'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimCoupon(1, 'temu_chest');
                }}
                className="mt-1 px-3 py-1.5 rounded-full text-white font-black text-[11px] font-bengali shadow-sm transition-all cursor-pointer bg-gradient-to-r from-[#ea580c] to-[#f97316] hover:from-orange-600 hover:to-orange-700 active:scale-95 flex items-center justify-center gap-1"
              >
                {claimedCouponIds.includes(1) ? 'সুপার ভ্যালু খুলুন ›' : 'দাবি করুন'}
              </button>
            </div>
          </div>
        </div>

        {/* COUPON CARD 2: সাইন-ইন পুরস্কার */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#e0e7ff]/40 via-[#eef2ff]/50 to-white border border-indigo-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-gray-700/80 pl-1">
              2
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
                দৈনিক সাইন-ইন পুরস্কার
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionOpen(true);
                }}
                className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 hover:text-indigo-600 font-bengali transition-colors cursor-pointer group/btn"
              >
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-gray-700 group-hover/btn:bg-indigo-100 transition-colors flex items-center gap-1">
                  <span>বর্ণনা</span>
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] text-white text-[8px] font-black flex items-center justify-center">i</span>
                </span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleClaimCoupon(2, 'signin')}
            className="flex items-stretch shadow-md rounded-xl overflow-hidden border border-indigo-300 w-full sm:w-auto max-w-[340px] cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group/ticket"
            title="সাইন ইন পেজে যান"
          >
            <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-4 py-2.5 flex flex-col justify-center min-w-[150px] group-hover/ticket:brightness-105 transition-all">
              <span className="text-[10px] font-medium text-indigo-200 font-bengali">কুপন</span>
              <span className="text-sm sm:text-base font-black font-bengali tracking-wide leading-tight">
                সাইন-ইন টিকিট
              </span>
              <span className="text-[9px] text-indigo-100 font-bengali mt-0.5">
                মেয়াদ: দৈনিক নবায়ন
              </span>
            </div>
            <div className="bg-[#eef2ff] px-3.5 py-2.5 flex flex-col items-center justify-center border-l-2 border-dashed border-indigo-300 min-w-[120px]">
              <span className="text-[11px] font-black font-bengali text-indigo-600 leading-tight">
                {claimedCouponIds.includes(2) ? 'সক্রিয় টিকিট' : 'উপলব্ধ'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimCoupon(2, 'signin');
                }}
                className="mt-1 px-3 py-1.5 rounded-full text-white font-black text-[11px] font-bengali shadow-sm transition-all cursor-pointer bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-95 flex items-center justify-center gap-1"
              >
                {claimedCouponIds.includes(2) ? 'সাইন ইন পেজ ›' : 'দাবি করুন'}
              </button>
            </div>
          </div>
        </div>

        {/* COUPON CARD 3: গোল্ডেন এগ ফ্রিম্যাচ টিকিট */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#fef3c7]/40 via-[#fffbeb]/50 to-white border border-amber-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-gray-700/80 pl-1">
              3
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
                গোল্ডেন এগ ফ্রিম্যাচ টিকিট
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionOpen(true);
                }}
                className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 hover:text-amber-600 font-bengali transition-colors cursor-pointer group/btn"
              >
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-gray-700 group-hover/btn:bg-amber-100 transition-colors flex items-center gap-1">
                  <span>বর্ণনা</span>
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] text-white text-[8px] font-black flex items-center justify-center">i</span>
                </span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleClaimCoupon(3, 'golden_egg')}
            className="flex items-stretch shadow-md rounded-xl overflow-hidden border border-yellow-400 w-full sm:w-auto max-w-[340px] cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group/ticket"
            title="সোনার ডিম ভাঙুন ও বোনাস পান"
          >
            <div className="bg-gradient-to-r from-[#d97706] to-[#f59e0b] text-white px-4 py-2.5 flex flex-col justify-center min-w-[150px] group-hover/ticket:brightness-105 transition-all">
              <span className="text-[10px] font-medium text-yellow-100 font-bengali">কুপন</span>
              <span className="text-sm sm:text-base font-black font-bengali tracking-wide leading-tight">
                গোল্ডেন এগ
              </span>
              <span className="text-[9px] text-yellow-100 font-bengali mt-0.5">
                লটারির সুযোগ পান
              </span>
            </div>
            <div className="bg-[#fffbeb] px-3.5 py-2.5 flex flex-col items-center justify-center border-l-2 border-dashed border-yellow-300 min-w-[120px]">
              <span className="text-[11px] font-black font-bengali text-amber-600 leading-tight">
                {claimedCouponIds.includes(3) ? 'সক্রিয় টিকিট' : 'উপলব্ধ'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimCoupon(3, 'golden_egg');
                }}
                className="mt-1 px-3 py-1.5 rounded-full text-white font-black text-[11px] font-bengali shadow-sm transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 active:scale-95 flex items-center justify-center gap-1"
              >
                {claimedCouponIds.includes(3) ? 'সোনার ডিম খুলুন ›' : 'দাবি করুন'}
              </button>
            </div>
          </div>
        </div>

        {/* COUPON CARD 4: লাকি হুইল স্পিন ভাউচার */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#ffe4e6]/40 via-[#fff1f2]/50 to-white border border-rose-200/80 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-gray-700/80 pl-1">
              4
            </span>
            <div className="flex flex-col">
              <h3 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
                লাকি স্পিন ফ্রি টিকিট
              </h3>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionOpen(true);
                }}
                className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 hover:text-rose-600 font-bengali transition-colors cursor-pointer group/btn"
              >
                <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-gray-700 group-hover/btn:bg-rose-100 transition-colors flex items-center gap-1">
                  <span>বর্ণনা</span>
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] text-white text-[8px] font-black flex items-center justify-center">i</span>
                </span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleClaimCoupon(4, 'spin')}
            className="flex items-stretch shadow-md rounded-xl overflow-hidden border border-rose-300 w-full sm:w-auto max-w-[340px] cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group/ticket"
            title="লাকি স্পিন হুইল খুলুন"
          >
            <div className="bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white px-4 py-2.5 flex flex-col justify-center min-w-[150px] group-hover/ticket:brightness-105 transition-all">
              <span className="text-[10px] font-medium text-rose-200 font-bengali">কুপন</span>
              <span className="text-sm sm:text-base font-black font-bengali tracking-wide leading-tight">
                লাকি স্পিন
              </span>
              <span className="text-[9px] text-rose-100 font-bengali mt-0.5">
                পুরস্কার: ৳৫–৳১,৫০,০০০ বা iPhone
              </span>
            </div>
            <div className="bg-[#fff1f2] px-3.5 py-2.5 flex flex-col items-center justify-center border-l-2 border-dashed border-rose-300 min-w-[120px]">
              <span className="text-[11px] font-black font-bengali text-rose-600 leading-tight">
                {claimedCouponIds.includes(4) ? 'সক্রিয় টিকিট' : 'উপলব্ধ'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimCoupon(4, 'spin');
                }}
                className="mt-1 px-3 py-1.5 rounded-full text-white font-black text-[11px] font-bengali shadow-sm transition-all cursor-pointer bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 active:scale-95 flex items-center justify-center gap-1"
              >
                {claimedCouponIds.includes(4) ? 'লাকি স্পিন খুলুন ›' : 'দাবি করুন'}
              </button>
            </div>
          </div>
        </div>

        {/* COUPON CARD 5: লাল খামের বৃষ্টি টিকিট */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#ffe4e6]/50 via-[#fef2f2]/60 to-white border border-rose-200/90 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <span className="text-3xl sm:text-4xl font-black italic font-mono text-gray-700/80 pl-1">
              5
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-gray-900 font-bengali">
                  লাল খামের বৃষ্টি টিকিট
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 border border-red-200 animate-pulse">
                  বৃষ্টি ড্রপ
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold text-amber-700 font-bengali">
                  সর্বোচ্চ বোনাস: ৳৭৭,৭৭৭
                </span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-500 font-bengali">
                  ৫ সেকেন্ড কাউন্টডাউন
                </span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionOpen(true);
                }}
                className="flex items-center gap-1 mt-1 text-[11px] text-gray-500 hover:text-red-600 font-bengali transition-colors cursor-pointer group/btn"
              >
                <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[11px] font-bold text-gray-700 group-hover/btn:bg-red-100 transition-colors flex items-center gap-1">
                  <span>বর্ণনা</span>
                  <span className="w-3 h-3 rounded-full bg-[#f43f5e] text-white text-[8px] font-black flex items-center justify-center">i</span>
                </span>
              </button>
            </div>
          </div>

          <div 
            onClick={() => handleClaimCoupon(5, 'red_envelope')}
            className="flex items-stretch shadow-md rounded-xl overflow-hidden border border-red-400 w-full sm:w-auto max-w-[340px] cursor-pointer hover:shadow-lg transition-all active:scale-[0.99] group/ticket"
            title="লাল খামের বৃষ্টি শুরু করুন"
          >
            <div className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white px-4 py-2.5 flex flex-col justify-center min-w-[150px] group-hover/ticket:brightness-105 transition-all">
              <span className="text-[10px] font-medium text-yellow-200 font-bengali">কুপন</span>
              <span className="text-sm sm:text-base font-black font-bengali tracking-wide leading-tight">
                লাল খামের বৃষ্টি
              </span>
              <span className="text-[9px] text-red-100 font-bengali mt-0.5">
                বৃষ্টির খাম ফাটিয়ে উপহার
              </span>
            </div>
            <div className="bg-[#fff1f2] px-3.5 py-2.5 flex flex-col items-center justify-center border-l-2 border-dashed border-red-300 min-w-[120px]">
              <span className="text-[11px] font-black font-bengali text-red-600 leading-tight">
                {claimedCouponIds.includes(5) ? 'সক্রিয় টিকিট' : 'উপলব্ধ'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimCoupon(5, 'red_envelope');
                }}
                className="mt-1 px-3 py-1.5 rounded-full text-white font-black text-[11px] font-bengali shadow-sm transition-all cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 flex items-center justify-center gap-1"
              >
                {claimedCouponIds.includes(5) ? 'বৃষ্টি শুরু করুন ›' : 'দাবি ও বৃষ্টি শুরু'}
              </button>
            </div>
          </div>
        </div>

        {/* COUPON CARD 6: প্রতি মাসের ২৩ তারিখ রহস্যময় পুরস্কার (VIP Mystery Cash Card) */}
        <div 
          onClick={() => handleClaimCoupon(6, 'mystery')}
          className="border-2 border-amber-400/80 hover:border-amber-500 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all flex flex-col sm:flex-row bg-gradient-to-r from-[#180a2b] via-[#24103e] to-[#120520] cursor-pointer group relative"
        >
          {/* VIP Ribbon badge */}
          <div className="absolute top-2 right-2 sm:right-auto sm:left-2 z-10 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-[9.5px] uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-900" />
            <span>VIP {mDayBn} তারিখ ক্যাশ ড্রপ</span>
          </div>

          {/* Left / Main Section */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between pt-7 sm:pt-4 sm:pl-32">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-900/80 text-purple-200 text-[10px] font-bold border border-purple-500/40">
                  ক্যাশ কার্ড কুপন
                </span>
                {mCfg.promoCode ? <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40">কোড: {mCfg.promoCode}</span> : null}
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  ১ গুণ (1x) ভেগারিং
                </span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-yellow-300 font-bengali mt-1.5 group-hover:text-yellow-200 transition-colors flex items-center gap-1.5">
                <span>রহস্যময় পুরস্কার প্রতি মাসের {mDayBn} তারিখ</span>
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              </h3>

              <p className="text-[11px] text-purple-200/90 font-bengali mt-1 leading-relaxed">
                সর্বোচ্চ বোনাস <strong className="text-yellow-400 font-mono font-bold text-xs">{mRangeBn}</strong> •
                {mDayBn} তারিখ {mHourBn} থেকে দাবি করা যায় (সার্ভার পরিমাণ বাছে, মাসে একবার)
              </p>
            </div>

            {/* Bottom Requirements Checklist & Description */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-purple-900/60 text-[10px]">
              <div className="flex items-center gap-3 text-purple-300">
                <span>• এই মাসে ন্যূনতম ৳{bnNum(mCfg.minBetRequired ?? 500)} বাজি</span>
                
                <span>• সমস্ত স্লট ও লাইভ গেমসে প্রযোজ্য</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMysteryModalOpen(true);
                }}
                className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer underline"
              >
                <span>বিস্তারিত নিয়মাবলী ›</span>
              </button>
            </div>
          </div>

          {/* Right Action / Voucher Stamp Section */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              handleClaimCoupon(6, 'mystery');
            }}
            className="group/ticket flex flex-row sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l-2 border-dashed border-amber-400/40 bg-gradient-to-b from-[#2e144f] to-[#1a0830] px-4 py-3 sm:min-w-[140px] text-center"
            title="রহস্যময় ক্যাশ কার্ড খুলুন"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-amber-300 font-bengali uppercase tracking-wider">
                {mysteryStatus?.hasClaimed ? 'দাবি সম্পন্ন' : mysteryStatus?.isUnlocked ? 'আনলকড ক্যাশ কার্ড' : `${mDayBn} তারিখ ড্রপ`}
              </span>
              <span className="text-sm sm:text-base font-black font-mono text-yellow-400 mt-0.5">
                {mysteryStatus?.card?.bonusAmount ? `৳ ${mysteryStatus.card.bonusAmount.toLocaleString()}` : mRangeBn}
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClaimCoupon(6, 'mystery');
              }}
              className="mt-2 px-3 py-1.5 rounded-full text-black font-black text-[11px] font-bengali shadow-md transition-all cursor-pointer bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 active:scale-95 flex items-center justify-center gap-1"
            >
              <Gift className="w-3.5 h-3.5 text-black" />
              <span>{mysteryStatus?.hasClaimed ? 'কার্ড দেখুন ›' : 'ক্যাশ কার্ড খুলুন ›'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  // VIEW 1: TEMU CHEST
  const renderTemuChestContent = () => (
    <div className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden bg-[#fdfbf7]">
      {/* Red Circular Close Button (X) */}
      <button
        onClick={() => {
          setActiveRightView('coupons');
          setMobileView('overview');
        }}
        className="absolute top-2.5 left-2.5 z-40 w-7 h-7 rounded-full bg-[#e53935] hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white"
        title="বন্ধ করুন"
      >
        <X className="w-4 h-4 text-white stroke-[3]" />
      </button>

      {/* Glowing Golden Treasure Chest Panel */}
      <div className="w-full bg-gradient-to-b from-[#fffbeb] via-[#fff7ed] to-white flex flex-col relative min-h-full">
        <div className="p-4 sm:p-6 flex flex-col items-center text-center relative z-10 border-b border-amber-100">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-bengali tracking-tight">
              টেমু টিকিট বুক
            </h2>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 font-bengali max-w-md">
            ট্যাক্স ফ্রি কুপন এবং বিশেষ অফারসমূহ সংগ্রহ করুন। দৈনিক টিকিট ব্যবহার করে দুর্দান্ত সব উপহার জিতুন!
          </p>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-400/20 blur-xl absolute" />
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 flex items-center justify-center shadow-xl border-2 border-yellow-200 relative group cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onOpenSuperValueReward()}
            >
              <PackageOpen className="w-14 h-14 sm:w-18 sm:h-18 text-white filter drop-shadow-md" />
              <span className="absolute -bottom-2.5 px-3 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black font-bengali shadow-md">
                খুলুন
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenSuperValueReward()}
            className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black font-bengali shadow-md active:scale-95 transition-all cursor-pointer"
          >
            BengalBet রিওয়ার্ড আনলক করুন
          </button>
        </div>

        {/* Claims Info List */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col">
          <h3 className="text-xs sm:text-sm font-black text-gray-800 font-bengali mb-3 flex items-center gap-2">
            <span className="w-1 h-3.5 bg-amber-500 rounded-full" />
            <span>উপলব্ধ টেমু কুপন তালিকা</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-bengali">৳৫০ ক্যাশব্যাক টিকিট</h4>
                  <span className="text-[10px] text-gray-500 font-bengali">মেয়াদ: ৩ দিন</span>
                </div>
              </div>
              <button 
                onClick={() => handleClaimCoupon(1, 'temu_chest')}
                className="px-3 py-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold font-bengali cursor-pointer active:scale-95"
              >
                দাবি
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 font-bengali">ডিপোজিট বোনাস কুপন</h4>
                  <span className="text-[10px] text-gray-500 font-bengali">১০০% ম্যাচিং</span>
                </div>
              </div>
              <button 
                onClick={() => onOpenSuperValueReward()}
                className="px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold font-bengali cursor-pointer active:scale-95"
              >
                ব্যবহার
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // VIEW 2A: DESKTOP SIGN-IN (Exact same premium 3D banknote stacks & isometric gift visuals as mobile)
  const renderDesktopSigninContent = () => (
    <div className="flex-1 flex flex-col md:flex-row h-full relative overflow-hidden bg-[#fdfbf7]">
      {/* Left Column: Premium Mascot Banner + Streak Stats + Rules + Condition Card */}
      <div className="w-full md:w-[42%] lg:w-[38%] p-4 sm:p-5 flex flex-col gap-3.5 border-r border-gray-200 bg-[#fdfbf7] justify-between overflow-y-auto">
        {/* Banner with Mascot and Glossy Spheres */}
        <div className="w-full rounded-2xl bg-gradient-to-br from-[#f97316] via-[#fb923c] to-[#f59e0b] text-white p-4 shadow-sm relative overflow-hidden">
          {/* Background circles */}
          <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute top-2 right-12 w-8 h-8 rounded-full bg-yellow-300/30 pointer-events-none" />

          <div className="relative z-10 flex flex-col">
            <span className="text-[10px] font-bold text-yellow-200 font-bengali uppercase">
              দৈনিক পুরস্কার সেন্টার
            </span>
            <h3 className="text-base sm:text-lg font-black font-bengali tracking-tight mt-0.5">
              প্রতিদিন সাইন ইন করুন
            </h3>
            <p className="text-[11px] text-orange-100 font-bengali mt-1 max-w-[220px]">
              প্রতিদিন লগইন করুন এবং নগদ বোনাস ও মেগা লাকি টিকিট সংগ্রহ করুন।
            </p>
          </div>
          <CalendarCheck2 className="w-16 h-16 text-white/25 absolute -right-1 -bottom-2 z-0" />
        </div>

        {/* 3D Isometric Gift Box & Status Header */}
        <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-xs flex items-center gap-3">
          <div className="relative w-13 h-13 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="dkPinkTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id="dkPinkLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
                <linearGradient id="dkPinkRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="dkRibbonWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fecdd3" />
                </linearGradient>
                <linearGradient id="dkGoldCoinTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="dkGoldCoinSide" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
              </defs>
              <polygon points="50,22 78,35 50,48 22,35" fill="url(#dkPinkTop)" />
              <polygon points="22,35 50,48 50,78 22,65" fill="url(#dkPinkLeft)" />
              <polygon points="50,48 78,35 78,65 50,78" fill="url(#dkPinkRight)" />
              <polygon points="46,24 54,27 54,46 46,43" fill="url(#dkRibbonWhite)" />
              <polygon points="34,30 66,43 62,45 30,32" fill="url(#dkRibbonWhite)" />
              <polygon points="34,41 38,43 38,73 34,71" fill="url(#dkRibbonWhite)" />
              <polygon points="62,43 66,41 66,71 62,73" fill="url(#dkRibbonWhite)" />
              <ellipse cx="44" cy="18" rx="8" ry="4" fill="#ffffff" transform="rotate(-25 44 18)" />
              <ellipse cx="56" cy="18" rx="8" ry="4" fill="#ffe4e6" transform="rotate(25 56 18)" />
              <circle cx="50" cy="20" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
              <g transform="translate(8, 62)">
                <ellipse cx="14" cy="10" rx="11" ry="5.5" fill="url(#dkGoldCoinSide)" />
                <rect x="3" y="6" width="22" height="4" fill="url(#dkGoldCoinSide)" />
                <ellipse cx="14" cy="6" rx="11" ry="5.5" fill="url(#dkGoldCoinTop)" stroke="#fef08a" strokeWidth="0.5" />
              </g>
              <g transform="translate(8, 56)">
                <ellipse cx="14" cy="10" rx="11" ry="5.5" fill="url(#dkGoldCoinSide)" />
                <rect x="3" y="6" width="22" height="4" fill="url(#dkGoldCoinSide)" />
                <ellipse cx="14" cy="6" rx="11" ry="5.5" fill="url(#dkGoldCoinTop)" stroke="#fef08a" strokeWidth="0.5" />
                <text x="14" y="8" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#854d0e">৳</text>
              </g>
            </svg>
          </div>

          <div className="flex flex-col">
            <h3 className="text-xs sm:text-sm font-bold text-[#dc2626] font-bengali leading-tight">
              {signinTab === 'new_member' ? 'নতুন সদস্য বৃদ্ধির পরিকল্পনা' : 'দৈনিক সাইন-ইন পুরস্কার'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-bold text-[#dc2626] font-bengali">
                {signedDays.includes(1) ? 'আজকের চেক-ইন সম্পন্ন' : 'আজও চেক ইন করা হয়নি'}
              </span>
              <button
                onClick={() => setIsDescriptionOpen(true)}
                className="w-3.5 h-3.5 rounded-full bg-[#881337] text-white flex items-center justify-center text-[9px] font-bold cursor-pointer hover:bg-red-900 transition-colors"
                title="শর্তাবলী"
              >
                ?
              </button>
            </div>
          </div>
        </div>

        {/* Deposit, Bet & Total Loss Condition Box */}
        <div className="bg-[#fff9f5] rounded-xl p-2.5 border border-orange-100/80 grid grid-cols-3 gap-1.5 text-xs font-bengali shadow-2xs">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-gray-600 font-medium text-[10.5px]">ডিপোজিট শর্ত :</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 100.00</span>
          </div>
          <div className="flex flex-col items-start gap-0.5 border-x border-orange-100/80 px-1.5">
            <span className="text-gray-600 font-medium text-[10.5px]">বেটিং শর্ত :</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 300.00</span>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-gray-600 font-medium text-[10.5px]">মোট ক্ষতি :</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 0.00</span>
          </div>
        </div>

        {/* 2 Stats Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-500 font-bengali">চলমান স্ট্রিক</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#2563eb]">
              {signinStreak} দিন
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col items-center text-center">
            <span className="text-[10px] text-gray-500 font-bengali">মোট সাইন-ইন বোনাস</span>
            <span className="text-lg sm:text-xl font-black font-mono text-[#dc2626]">
              ৳ {signinTotalBonus.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rules Box */}
        <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100/90 text-xs text-gray-700 font-bengali space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-orange-900 text-[11px]">কার্যক্রমের নিয়মাবলী:</span>
            <button
              onClick={() => setIsDescriptionOpen(true)}
              className="text-[10px] text-orange-600 underline font-semibold cursor-pointer"
            >
              বিস্তারিত বর্ণনা
            </button>
          </div>
          <p className="text-[10.5px] leading-relaxed text-gray-600">১. প্রতিদিন সাইন ইন করে তাৎক্ষণিক নগদ বোনাস জিতে নিন।</p>
          <p className="text-[10.5px] leading-relaxed text-gray-600">২. টানা সাইন ইন করলে বিশেষ মেগা পুরস্কার প্রদান করা হবে।</p>
        </div>
      </div>

      {/* Right Column: 12-Day Milestones OR 30-Day Grid */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col bg-[#fdfbf7] overflow-y-auto">
        {/* Top Tabs */}
        <div className="flex items-center gap-4 mb-3.5 border-b border-gray-200 pb-2">
          <button
            onClick={() => setSigninTab('new_member')}
            className={`pb-1.5 text-xs font-bold font-bengali transition-all border-b-2 cursor-pointer ${
              signinTab === 'new_member'
                ? 'text-[#2563eb] border-[#2563eb]'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            নতুন সদস্যদের জন্য বৃদ্ধি পরিকল্পনা
          </button>
          <button
            onClick={() => setSigninTab('daily_signin')}
            className={`pb-1.5 text-xs font-bold font-bengali transition-all border-b-2 cursor-pointer ${
              signinTab === 'daily_signin'
                ? 'text-[#2563eb] border-[#2563eb]'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            প্রতিদিন সাইন ইন করে বোনাস
          </button>
        </div>

        {signinTab === 'new_member' ? (
          /* 12-Day Milestone Tasks */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
            {memberError && <p role="alert" className="text-destructive col-span-full">{memberError}</p>}
            {signin12DaysData.map((item) => {
              const state = memberTasks.find(t => t.day === item.day);
              const isClaimed = state?.claimed === true;
              const isUnlocked = state?.eligible === true;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl border p-3.5 flex flex-col justify-between bg-white transition-all shadow-xs ${
                    isClaimed
                      ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20'
                      : isUnlocked
                        ? 'border-blue-400 ring-2 ring-blue-300/40 shadow-sm'
                        : 'border-gray-200 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10.5px] font-black font-bengali px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        দিন {item.day}
                      </span>
                      <span className="text-2xl">{item.icon}</span>
                    </div>

                    <div className="my-2.5">
                      <h4 className="text-xs font-bold text-gray-800 font-bengali leading-snug">
                        {item.task}
                      </h4>
                      <span className="text-sm font-black font-mono text-[#dc2626] mt-1 block">
                        +৳ {item.bonus.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    aria-label={`নতুন সদস্য দিন ${item.day} পুরস্কার দাবি`}
                    disabled={isClaimed || !isUnlocked || memberBusy}
                    onClick={() => handleSignIn12Day(item.day, item.bonus, item.task)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold font-bengali transition-all cursor-pointer ${
                      isClaimed
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isUnlocked
                          ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 text-white shadow-xs active:scale-95'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'দাবি সম্পন্ন ✓' : isUnlocked ? 'দাবি করুন' : 'লক করা'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* 30-Day Cards Grid with identical 3D Banknote Stacks as Mobile */
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 flex-1">
            {signinError && <p role="alert" className="text-destructive col-span-full text-sm">{signinError}</p>}
            {signin30DaysData.map((item) => {
              const isClaimed = hasSignedToday && item.day === signinDay;
              const isTodayActive = signinEligible && item.day === signinDay;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl border flex flex-col overflow-hidden bg-white transition-all shadow-xs ${
                    isClaimed
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : isTodayActive
                        ? 'border-blue-400 ring-2 ring-blue-300/50 shadow-md'
                        : 'border-sky-100/80 hover:border-sky-300'
                  }`}
                >
                  {/* Blue Top Header Ribbon */}
                  <div className="bg-[#2563eb] text-white text-center py-0.5 text-[11px] font-bold font-bengali tracking-tight">
                    দিন {item.day}
                  </div>

                  {/* Card Body with Sunburst Rays & 3D Cash Bills Stack */}
                  <div className="bg-gradient-to-b from-[#fffef0] via-[#fefee9] to-white p-2 flex flex-col items-center justify-center relative overflow-hidden flex-1">
                    {/* Subtle Sunburst Radial Rays SVG */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                      <circle cx="50" cy="50" r="50" fill="#fef08a" />
                      <g fill="#fef08a" opacity="0.3">
                        <polygon points="50,50 42,0 58,0" />
                        <polygon points="50,50 92,20 100,35" />
                        <polygon points="50,50 92,80 100,65" />
                        <polygon points="50,50 42,100 58,100" />
                        <polygon points="50,50 8,80 0,65" />
                        <polygon points="50,50 8,20 0,35" />
                      </g>
                    </svg>

                    {/* 3D Banknotes Stack SVG */}
                    <svg viewBox="0 0 110 75" className="w-14 h-10 my-0.5 filter drop-shadow-md relative z-10">
                      <defs>
                        <linearGradient id={`cashFace-dk-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#bbf7d0" />
                          <stop offset="40%" stopColor="#86efac" />
                          <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                        <linearGradient id={`cashSideL-dk-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#166534" />
                          <stop offset="100%" stopColor="#14532d" />
                        </linearGradient>
                        <linearGradient id={`cashSideR-dk-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#15803d" />
                          <stop offset="100%" stopColor="#166534" />
                        </linearGradient>
                        <linearGradient id={`strapGrad-dk-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffedd5" />
                          <stop offset="50%" stopColor="#fed7aa" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                      </defs>

                      {/* Bottom Layer 3 */}
                      <g transform="translate(0, 16)">
                        <polygon points="18,22 68,6 94,18 44,34" fill="#15803d" />
                        <polygon points="18,22 44,34 44,40 18,28" fill="#14532d" />
                        <polygon points="44,34 94,18 94,24 44,40" fill="#166534" />
                      </g>

                      {/* Layer 2 */}
                      <g transform="translate(0, 8)">
                        <polygon points="15,18 65,2 91,14 41,30" fill="#22c55e" />
                        <polygon points="15,18 41,30 41,36 15,24" fill={`url(#cashSideL-dk-${item.day})`} />
                        <polygon points="41,30 91,14 91,20 41,36" fill={`url(#cashSideR-dk-${item.day})`} />
                      </g>

                      {/* Top Banknote Bundle */}
                      <polygon points="12,14 62,-2 88,10 38,26" fill={`url(#cashFace-dk-${item.day})`} stroke="#16a34a" strokeWidth="0.75" />
                      <polygon points="12,14 38,26 38,32 12,20" fill={`url(#cashSideL-dk-${item.day})`} />
                      <polygon points="38,26 88,10 88,16 38,32" fill={`url(#cashSideR-dk-${item.day})`} />

                      {/* Delicate Banknote Border and Watermark details */}
                      <polygon points="17,13.5 60,0 83,9.5 40,23" fill="none" stroke="#15803d" strokeWidth="0.6" strokeDasharray="2 1" />
                      <ellipse cx="50" cy="11.5" rx="10" ry="5" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.6" />
                      <text x="50" y="13.2" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#15803d">৳</text>

                      {/* Realistic Currency Wrapper/Strap */}
                      <polygon points="45,4 55,0.5 63,5 53,8.5" fill={`url(#strapGrad-dk-${item.day})`} stroke="#ea580c" strokeWidth="0.4" />
                      <polygon points="53,8.5 63,5 63,20 53,23.5" fill="#f97316" />
                      <polygon points="45,4 53,8.5 53,23.5 45,19" fill="#ea580c" />
                    </svg>

                    {/* Bonus Value Badge */}
                    <span className="text-[11px] font-black font-mono text-[#dc2626] mt-0.5">
                      ৳ {item.bonus.toFixed(2)}
                    </span>
                  </div>

                  {/* Claim Button */}
                  <div className="p-1 bg-white border-t border-gray-100">
                    <button
                      aria-label={`দিন ${item.day} দৈনিক পুরস্কার দাবি`}
                      disabled={isClaimed || !isTodayActive || signinBusy}
                      onClick={() => handleSignInDay(item.day, item.bonus)}
                      className={`w-full py-1 rounded-lg text-[10.5px] font-bold font-bengali transition-all cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-600 text-white cursor-default'
                          : isTodayActive
                            ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 text-white shadow-xs active:scale-95'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      {isClaimed ? 'সম্পন্ন ✓' : 'দাবি করুন'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // VIEW 2B: MOBILE SIGN-IN (Exact match to Capture.PNG & Capture2.PNG)
  const renderMobileSigninContent = () => (
    <div className="flex-1 flex flex-col min-h-full bg-white text-gray-800 select-none pb-8">
      {/* Top Bar Header matching Capture2.PNG: Dark Green #05281d with < arrow and centered "সাইন ইন" */}
      <div className="bg-[#05281d] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md sticky top-0 z-30">
        <button
          onClick={() => {
            setMobileView('overview');
          }}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-white active:scale-90 transition-transform cursor-pointer"
          title="পিছনে যান"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white font-bengali tracking-wide text-center">
          সাইন ইন
        </h1>

        <div className="w-8" />
      </div>

      {/* Hero Profile Banner matching Capture.PNG */}
      <div className="relative bg-gradient-to-br from-[#f97316] via-[#fb923c] to-[#f59e0b] px-4 pt-6 pb-20 overflow-hidden shadow-xs">
        {/* 3D Glossy Spheres in background matching Capture.PNG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="glossySphere1" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#fde047" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="glossySphere2" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#fde047" stopOpacity="0.85" />
              <stop offset="90%" stopColor="#ca8a04" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a16207" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="glossySphere3" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="75%" stopColor="#eab308" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.1" />
            </radialGradient>
          </defs>
          {/* Sphere 1: Top-middle small */}
          <circle cx="40%" cy="20%" r="18" fill="url(#glossySphere1)" />
          {/* Sphere 2: Top-right medium */}
          <circle cx="64%" cy="18%" r="22" fill="url(#glossySphere2)" />
          {/* Sphere 3: Middle-right large */}
          <circle cx="85%" cy="48%" r="38" fill="url(#glossySphere3)" />
        </svg>

        <div className="relative z-10 flex items-center gap-3.5 pl-1">
          <div className="relative shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Profile"
              className="w-18 h-18 rounded-full object-cover border-[3.5px] border-[#38bdf8] shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col text-white">
            <span className="text-sm font-semibold tracking-wide text-white drop-shadow-xs">
              {user.username || '1752348921'}
            </span>
            <span className="text-3xl font-black font-mono tracking-tight mt-0.5 drop-shadow-xs">
              ৳ {user.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Stats Card positioned overlapping banner */}
      <div className="px-4 relative z-20 -mt-10">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 py-3.5 px-4 grid grid-cols-2 divide-x divide-gray-100">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-[#2563eb] font-mono leading-none">
              {signedDays.length}
            </span>
            <span className="text-xs text-gray-500 font-bengali mt-1.5 font-medium">
              চেক-ইন দিন
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-[#ef4444] font-mono leading-none">
              {signinTotalBonus.toFixed(0)}
            </span>
            <span className="text-xs text-gray-500 font-bengali mt-1.5 font-medium">
              সাইন ইন মোট পুরস্কার
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="mt-2.5 bg-white border-b border-gray-100 flex items-center px-4 gap-6 text-xs sm:text-sm font-bengali">
        <button
          onClick={() => setSigninTab('new_member')}
          className={`pb-2 font-bold transition-all border-b-2 cursor-pointer ${
            signinTab === 'new_member'
              ? 'text-[#2563eb] border-[#2563eb]'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          নতুন সদস্য বৃদ্ধির পরিকল্পনা
        </button>
        <button
          onClick={() => setSigninTab('daily_signin')}
          className={`pb-2 font-bold transition-all border-b-2 cursor-pointer ${
            signinTab === 'daily_signin'
              ? 'text-[#2563eb] border-[#2563eb]'
              : 'text-gray-600 border-transparent hover:text-gray-800'
          }`}
        >
          প্রতিদিন সাইন ইন করে বো...
        </button>
      </div>

      {/* Requirement Info Card matching Capture.PNG */}
      <div className="px-4 py-3 bg-white flex flex-col gap-2.5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Premium 3D Isometric Pink Gift Box with Gold Coins SVG matching Capture.PNG */}
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
              <defs>
                <linearGradient id="pinkTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
                <linearGradient id="pinkLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
                <linearGradient id="pinkRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="ribbonWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#fecdd3" />
                </linearGradient>
                <linearGradient id="goldCoinTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
                <linearGradient id="goldCoinSide" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
              </defs>

              {/* Gift Box Base */}
              {/* Top Face */}
              <polygon points="50,22 78,35 50,48 22,35" fill="url(#pinkTop)" />
              {/* Left Face */}
              <polygon points="22,35 50,48 50,78 22,65" fill="url(#pinkLeft)" />
              {/* Right Face */}
              <polygon points="50,48 78,35 78,65 50,78" fill="url(#pinkRight)" />

              {/* White Ribbon */}
              {/* Top ribbon vertical */}
              <polygon points="46,24 54,27 54,46 46,43" fill="url(#ribbonWhite)" />
              {/* Top ribbon horizontal */}
              <polygon points="34,30 66,43 62,45 30,32" fill="url(#ribbonWhite)" />
              {/* Left Face Ribbon */}
              <polygon points="34,41 38,43 38,73 34,71" fill="url(#ribbonWhite)" />
              {/* Right Face Ribbon */}
              <polygon points="62,43 66,41 66,71 62,73" fill="url(#ribbonWhite)" />

              {/* Big Bow on Top */}
              <ellipse cx="44" cy="18" rx="8" ry="4" fill="#ffffff" transform="rotate(-25 44 18)" />
              <ellipse cx="56" cy="18" rx="8" ry="4" fill="#ffe4e6" transform="rotate(25 56 18)" />
              <circle cx="50" cy="20" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />

              {/* Stack of Gold Coins in Front Left */}
              {/* Coin 1 bottom */}
              <g transform="translate(8, 62)">
                <ellipse cx="14" cy="10" rx="11" ry="5.5" fill="url(#goldCoinSide)" />
                <rect x="3" y="6" width="22" height="4" fill="url(#goldCoinSide)" />
                <ellipse cx="14" cy="6" rx="11" ry="5.5" fill="url(#goldCoinTop)" stroke="#fef08a" strokeWidth="0.5" />
              </g>
              {/* Coin 2 top */}
              <g transform="translate(8, 56)">
                <ellipse cx="14" cy="10" rx="11" ry="5.5" fill="url(#goldCoinSide)" />
                <rect x="3" y="6" width="22" height="4" fill="url(#goldCoinSide)" />
                <ellipse cx="14" cy="6" rx="11" ry="5.5" fill="url(#goldCoinTop)" stroke="#fef08a" strokeWidth="0.5" />
                <ellipse cx="14" cy="6" rx="8" ry="3.8" fill="none" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="1.5 1" />
                <text x="14" y="8" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#854d0e">৳</text>
              </g>

              {/* Small Gold Coin in Front Right */}
              <g transform="translate(24, 68)">
                <ellipse cx="10" cy="8" rx="8" ry="4" fill="url(#goldCoinSide)" />
                <rect x="2" y="5" width="16" height="3" fill="url(#goldCoinSide)" />
                <ellipse cx="10" cy="5" rx="8" ry="4" fill="url(#goldCoinTop)" stroke="#fef08a" strokeWidth="0.5" />
                <text x="10" y="6.5" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#854d0e">৳</text>
              </g>
            </svg>
          </div>

          <div className="flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-[#dc2626] font-bengali leading-snug">
              নতুন সদস্য বৃদ্ধির পরিকল্পনা
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-[#dc2626] font-bengali">
                আজও চেক ইন করা হয়নি
              </span>
              <button
                onClick={() => setIsDescriptionOpen(true)}
                className="w-4 h-4 rounded-full bg-[#881337] text-white flex items-center justify-center text-[10px] font-bold cursor-pointer hover:bg-red-900 transition-colors"
                title="শর্তাবলী"
              >
                ?
              </button>
            </div>
          </div>
        </div>

        {/* Peach Condition Box matching Capture.PNG */}
        <div className="bg-[#fff9f5] rounded-xl p-3 border border-orange-100/80 grid grid-cols-3 gap-2 text-xs font-bengali shadow-2xs">
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-gray-700 font-medium text-[11px]">ডিপোজিট শর্ত</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 100.00</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center border-x border-orange-100/80 px-1">
            <span className="text-gray-700 font-medium text-[11px]">বেটিং শর্ত</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 300.00</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center">
            <span className="text-gray-700 font-medium text-[11px]">মোট ক্ষতি</span>
            <span className="text-[#dc2626] font-bold font-mono text-xs">৳ 0.00</span>
          </div>
        </div>
      </div>

      {/* 12-Day Milestones OR 30-Day Grid Cards matching Capture.PNG & Capture2.PNG */}
      <div className="px-3 sm:px-4 py-3 bg-[#fdfbf7]">
        {signinTab === 'new_member' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {memberError && <p role="alert" className="text-destructive col-span-full">{memberError}</p>}
            {signin12DaysData.map((item) => {
              const state = memberTasks.find(t => t.day === item.day);
              const isClaimed = state?.claimed === true;
              const isUnlocked = state?.eligible === true;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl border p-3 flex items-center justify-between bg-white transition-all shadow-xs ${
                    isClaimed
                      ? 'border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50/20'
                      : isUnlocked
                        ? 'border-blue-400 ring-2 ring-blue-300/40 shadow-xs'
                        : 'border-gray-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black font-bengali px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          দিন {item.day}
                        </span>
                        <span className="text-xs font-bold text-gray-800 font-bengali">
                          {item.task}
                        </span>
                      </div>
                      <span className="text-xs font-black font-mono text-[#dc2626] mt-0.5">
                        +৳ {item.bonus.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    aria-label={`নতুন সদস্য দিন ${item.day} পুরস্কার দাবি`}
                    disabled={isClaimed || !isUnlocked || memberBusy}
                    onClick={() => handleSignIn12Day(item.day, item.bonus, item.task)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-bengali transition-all shrink-0 cursor-pointer ${
                      isClaimed
                        ? 'bg-emerald-600 text-white cursor-default'
                        : isUnlocked
                          ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-blue-700 hover:to-blue-600 text-white shadow-xs active:scale-95'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isClaimed ? 'সম্পন্ন ✓' : isUnlocked ? 'দাবি করুন' : 'লক করা'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {signinError && <p role="alert" className="text-destructive col-span-full text-sm">{signinError}</p>}
            {signin30DaysData.map((item) => {
              const isClaimed = hasSignedToday && item.day === signinDay;
              const isTodayActive = signinEligible && item.day === signinDay;

              return (
                <div
                  key={item.day}
                  className={`rounded-2xl border flex flex-col overflow-hidden bg-white transition-all shadow-xs ${
                    isClaimed
                      ? 'border-emerald-300 ring-1 ring-emerald-200'
                      : isTodayActive
                        ? 'border-blue-400 ring-2 ring-blue-300/50 shadow-md'
                        : 'border-sky-100/80 hover:border-sky-300'
                  }`}
                >
                  {/* Blue Top Header Ribbon matching Capture.PNG */}
                  <div className="bg-[#2563eb] text-white text-center py-1 text-xs font-bold font-bengali tracking-tight">
                    দিন {item.day}
                  </div>

                  {/* Card Body with Sunburst Rays & 3D Cash Bills Stack */}
                  <div className="bg-gradient-to-b from-[#fffef0] via-[#fefee9] to-white p-2 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Subtle Sunburst Radial Rays SVG */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                      <defs>
                        <radialGradient id={`sunRay-${item.day}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
                          <stop offset="60%" stopColor="#fef9c3" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      <circle cx="50" cy="50" r="50" fill={`url(#sunRay-${item.day})`} />
                      <g fill="#fef08a" opacity="0.3">
                        <polygon points="50,50 42,0 58,0" />
                        <polygon points="50,50 92,20 100,35" />
                        <polygon points="50,50 92,80 100,65" />
                        <polygon points="50,50 42,100 58,100" />
                        <polygon points="50,50 8,80 0,65" />
                        <polygon points="50,50 8,20 0,35" />
                      </g>
                    </svg>

                    {/* 3D Banknotes Stack SVG - High Fidelity Premium Isometric Bills */}
                    <svg viewBox="0 0 110 75" className="w-18 h-13 my-0.5 filter drop-shadow-md relative z-10">
                      <defs>
                        <linearGradient id={`cashFace-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#bbf7d0" />
                          <stop offset="40%" stopColor="#86efac" />
                          <stop offset="100%" stopColor="#4ade80" />
                        </linearGradient>
                        <linearGradient id={`cashSideL-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#166534" />
                          <stop offset="100%" stopColor="#14532d" />
                        </linearGradient>
                        <linearGradient id={`cashSideR-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#15803d" />
                          <stop offset="100%" stopColor="#166534" />
                        </linearGradient>
                        <linearGradient id={`strapGrad-${item.day}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ffedd5" />
                          <stop offset="50%" stopColor="#fed7aa" />
                          <stop offset="100%" stopColor="#fb923c" />
                        </linearGradient>
                      </defs>

                      {/* Bottom Layer 3 */}
                      <g transform="translate(0, 16)">
                        <polygon points="18,22 68,6 94,18 44,34" fill="#15803d" />
                        <polygon points="18,22 44,34 44,40 18,28" fill="#14532d" />
                        <polygon points="44,34 94,18 94,24 44,40" fill="#166534" />
                      </g>

                      {/* Layer 2 */}
                      <g transform="translate(0, 8)">
                        <polygon points="15,18 65,2 91,14 41,30" fill="#22c55e" />
                        <polygon points="15,18 41,30 41,36 15,24" fill={`url(#cashSideL-${item.day})`} />
                        <polygon points="41,30 91,14 91,20 41,36" fill={`url(#cashSideR-${item.day})`} />
                      </g>

                      {/* Top Banknote Bundle */}
                      <polygon points="12,14 62,-2 88,10 38,26" fill={`url(#cashFace-${item.day})`} stroke="#16a34a" strokeWidth="0.75" />
                      <polygon points="12,14 38,26 38,32 12,20" fill={`url(#cashSideL-${item.day})`} />
                      <polygon points="38,26 88,10 88,16 38,32" fill={`url(#cashSideR-${item.day})`} />

                      {/* Delicate Banknote Border and Watermark details */}
                      <polygon points="17,13.5 60,0 83,9.5 40,23" fill="none" stroke="#15803d" strokeWidth="0.6" strokeDasharray="2 1" />
                      <ellipse cx="50" cy="11.5" rx="10" ry="5" fill="#dcfce7" stroke="#16a34a" strokeWidth="0.6" />
                      <text x="50" y="13.2" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#15803d">৳</text>

                      {/* Realistic Currency Wrapper/Strap */}
                      <polygon points="45,4 55,0.5 63,5 53,8.5" fill={`url(#strapGrad-${item.day})`} stroke="#ea580c" strokeWidth="0.4" />
                      <polygon points="53,8.5 63,5 63,20 53,23.5" fill="#f97316" />
                      <polygon points="45,4 53,8.5 53,23.5 45,19" fill="#ea580c" />
                    </svg>

                    {/* Bonus Row matching Capture.PNG */}
                    <div className="flex items-center justify-between w-full text-[11px] font-bengali text-gray-700 mt-1 z-10 px-0.5">
                      <span className="text-gray-500 font-medium">বোনাস</span>
                      <span className="font-bold font-mono text-gray-900">৳ {item.bonus.toFixed(2)}</span>
                    </div>

                    {/* Sign-in Pill Button matching Capture2.PNG */}
                    <button
                      aria-label={`দিন ${item.day} দৈনিক পুরস্কার দাবি`}
                      disabled={isClaimed || !isTodayActive || signinBusy}
                      onClick={() => handleSignInDay(item.day, item.bonus)}
                      className={`w-full mt-2 py-1 rounded-full text-xs font-bold font-bengali transition-all shadow-xs cursor-pointer ${
                        isClaimed
                          ? 'bg-emerald-600 text-white cursor-default'
                          : isTodayActive
                            ? 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-xs active:scale-95'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:brightness-105 active:scale-95'
                      }`}
                    >
                      {isClaimed ? 'সম্পন্ন ✓' : 'সাইন ইন'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Section matching Capture.PNG */}
      <div className="px-4 py-4 bg-white border-t border-gray-100 font-bengali space-y-2">
        <h3 className="text-sm sm:text-base font-bold text-[#dc2626]">
          সাইন-ইন নিয়ম
        </h3>
        <h4 className="text-xs sm:text-sm font-bold text-gray-900">
          অফার বিস্তারিত
        </h4>
        <div className="space-y-1.5 text-xs text-gray-800 leading-relaxed">
          <p>
            * খুব কম প্রয়োজনীয়তা, আপনি প্রতিদিন ড্র এবং অতিরিক্ত পুরস্কারগুলিতে অংশগ্রহণ করতে পারেন এবং আপনি একদিনে বিনামূল্যে <span className="text-[#f59e0b] font-bold font-mono">১০,০০০</span> টাকা পর্যন্ত পেতে পারেন।
          </p>
          <p>
            * ইভেন্টটি <span className="text-[#f59e0b] font-bold font-mono">BengalBet</span> এর সকল সদস্যের জন্য প্রযোজ্য
          </p>
        </div>
      </div>
    </div>
  );

  // VIEW 3: RESCUE FUND
  const renderRescueContent = () => (
    <div className="flex-1 flex flex-col md:flex-row min-h-full md:h-full relative overflow-y-auto md:overflow-hidden bg-white">
      {/* Red Circular Close Button (X) - Desktop only */}
      <button
        onClick={() => {
          setActiveRightView('coupons');
          setMobileView('overview');
        }}
        className="hidden md:flex absolute top-2.5 left-2.5 z-40 w-7 h-7 rounded-full bg-[#e53935] hover:bg-red-700 text-white items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white"
        title="বন্ধ করুন"
      >
        <X className="w-4 h-4 text-white stroke-[3]" />
      </button>

      {/* Left Column: Mascot, Shield, and Claim Button */}
      <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col gap-3.5 border-b md:border-b-0 md:border-r border-gray-200 bg-[#fdfbf7] md:overflow-y-auto shrink-0 md:shrink">
        
        {/* Banner with Safe Mascot */}
        <div className="w-full rounded-2xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#fb923c] text-white p-4 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col">
            <span className="text-[10px] font-bold text-yellow-200 font-bengali uppercase">
              নিরাপত্তা নিশ্চয়তা
            </span>
            <h3 className="text-base sm:text-lg font-black font-bengali tracking-tight mt-0.5">
              রেসকিউ ফান্ড - সুরক্ষা তহবিল
            </h3>
            <p className="text-[11px] text-orange-100 font-bengali mt-1 max-w-[200px]">
              আপনার প্রতিদিনের ক্ষতির ওপর ভিত্তি করে বিশেষ ক্ষতিপূরণ বোনাস দাবি করুন।
            </p>
          </div>
          <ShieldCheck className="w-18 h-18 text-white/20 absolute -right-2 -bottom-2 z-0" />
        </div>

        {/* Claim Box */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col items-center text-center gap-2">
          <span className="text-xs text-gray-500 font-bengali">আজকের উপলব্ধ উদ্ধার তহবিল</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-orange-600">
            ৳ {rescueEligibleBonus.toFixed(2)}
          </span>
          <div className="flex items-center gap-2 text-xs font-bengali bg-orange-50/80 px-3 py-1 rounded-lg border border-orange-100">
            <span className="text-gray-600 font-medium">মোট ক্ষতি :</span>
            <span className="text-[#dc2626] font-bold font-mono">৳ {rescueNetLoss.toFixed(2)}</span>
            <span className="text-gray-400 font-mono text-[10px]">({rescuePercentage}%)</span>
          </div>
          <p className="text-[11px] text-gray-500 font-bengali">
            (গতকাল এবং আজকের নেট ক্ষতির পরিমাণের ওপর ভিত্তি করে গণনা করা হয়)
          </p>

          <button
            onClick={handleClaimRescue}
            disabled={rescueClaimed || rescueEligibleBonus <= 0}
            className={`w-full max-w-[240px] py-2 rounded-full font-black text-xs font-bengali shadow-md transition-all cursor-pointer mt-1 ${
              rescueClaimed
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : rescueEligibleBonus > 0
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white active:scale-95 animate-pulse'
                  : 'bg-orange-400 text-white opacity-90'
            }`}
          >
            {rescueClaimed ? 'ইতিমধ্যে দাবি করা হয়েছে' : rescueEligibleBonus > 0 ? 'উদ্ধার তহবিল সংগ্রহ করুন' : 'দাবি করার মত ক্ষতি নেই'}
          </button>

          {rescueFeedback && (
            <span className="text-[11px] font-bold text-amber-700 font-bengali mt-1 animate-in fade-in">
              {rescueFeedback}
            </span>
          )}
        </div>

        {/* Safe Description text */}
        <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 text-[11px] text-gray-600 font-bengali space-y-1">
          <span className="font-bold text-orange-800">নিয়মাবলী:</span>
          <p>• প্রতিটি সদস্য দিনে একবার রেসকিউ ফান্ড ক্লেইম করতে পারবেন।</p>
          <p>• প্রাপ্ত বোনাস সরাসরি আপনার মূল অ্যাকাউন্টে যুক্ত হবে।</p>
        </div>

      </div>

      {/* Right Column: Rescue Levels Table */}
      <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col bg-white md:overflow-y-auto pb-16 md:pb-5">
        <h4 className="text-xs sm:text-sm font-black text-gray-900 font-bengali mb-3 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-orange-600" />
          <span>রেসকিউ ফান্ডের অনুপাত ও স্তর</span>
        </h4>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-2xs">
          <table className="w-full text-[11px] text-left text-gray-700 font-bengali">
            <thead className="bg-[#f8fafc] text-gray-900 border-b border-gray-200">
              <tr>
                <th className="p-2.5">ক্ষতির পরিমাণ (৳)</th>
                <th className="p-2.5 text-center">বোনাসের হার</th>
                <th className="p-2.5 text-right">সর্বোচ্চ বোনাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(rescueTiersList && rescueTiersList.length > 0 ? rescueTiersList : [
                { id: '1', minLoss: 1000, maxBonus: 150, percentage: 3.0, nameBn: '১,০০০ - ৫,০০০' },
                { id: '2', minLoss: 5001, maxBonus: 800, percentage: 4.0, nameBn: '৫,০০১ - ২০,০০০' },
                { id: '3', minLoss: 20001, maxBonus: 2500, percentage: 5.0, nameBn: '২০,০০১ - ৫০,০০০' },
                { id: '4', minLoss: 50001, maxBonus: 10000, percentage: 6.0, nameBn: '৫০,০০১+' }
              ]).map((tier, idx) => (
                <tr key={tier.id || idx}>
                  <td className="p-2.5 font-mono">{tier.nameBn || `৳ ${tier.minLoss}+`}</td>
                  <td className="p-2.5 text-center font-bold text-orange-600">{tier.percentage}%</td>
                  <td className="p-2.5 text-right font-mono font-bold">৳{tier.maxBonus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-bengali space-y-1">
          <span className="font-bold text-gray-800">বিবরণ:</span>
          <p>• প্রতিদিন রাত ১২:০০ টার পর পূর্ববর্তী ২৪ ঘণ্টার হিসাব অনুযায়ী রেসকিউ ফান্ড প্রদান করা হয়।</p>
          <p>• বোনাসের ওপর মাত্র ১ গুণ টার্নওভারের শর্ত প্রযোজ্য।</p>
        </div>
      </div>
    </div>
  );

  // VIEW 4: PROMO CODE REDEEM
  const renderPromoContent = () => {
    const handleCopyPromoCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedPromoCode(code);
      setTimeout(() => setCopiedPromoCode(null), 2500);
    };

    return (
      <div className="flex-1 flex flex-col md:flex-row min-h-full md:h-full relative overflow-y-auto md:overflow-hidden bg-white">
        {/* Red Circular Close Button (X) - Desktop only */}
        <button
          onClick={() => {
            setActiveRightView('coupons');
            setMobileView('overview');
          }}
          className="hidden md:flex absolute top-2.5 left-2.5 z-40 w-7 h-7 rounded-full bg-[#e53935] hover:bg-red-700 text-white items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer ring-2 ring-white"
          title="বন্ধ করুন"
        >
          <X className="w-4 h-4 text-white stroke-[3]" />
        </button>

        {/* Left Column: Input Box and Banner */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-200 bg-[#fdfbf7] md:overflow-y-auto shrink-0 md:shrink">
          
          {/* Banner */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white p-4 shadow-sm relative overflow-hidden">
            <div className="relative z-10 flex flex-col">
              <span className="text-[10px] font-bold text-cyan-100 font-bengali uppercase">
                গিফট ভাউচার
              </span>
              <h3 className="text-base sm:text-lg font-black font-bengali tracking-tight mt-0.5">
                প্রচার কোড রিডিম করুন
              </h3>
              <p className="text-[11px] text-cyan-100 font-bengali mt-1 max-w-[200px]">
                আপনার রিডেম্পশন কোডটি প্রবেশ করিয়ে তাত্ক্ষণিক বোনাস এবং উপহার গ্রহণ করুন।
              </p>
            </div>
            <Tag className="w-18 h-18 text-white/20 absolute -right-2 -bottom-2 z-0" />
          </div>

          {/* Input Card */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs flex flex-col gap-3">
            <label className="text-xs font-bold text-gray-700 font-bengali">
              প্রচার কোড লিখুন:
            </label>
            <div className="relative">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="যেমন: VIPBONUS, TELEGRAM100"
                className="w-full pl-3.5 pr-20 py-2.5 rounded-lg border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-hidden text-sm font-mono uppercase font-bold"
              />
              {promoInput && (
                <button
                  onClick={() => setPromoInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Demo & Active Code Suggestion Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-bengali">উপলব্ধ কোড:</span>
              {activePromosList.length === 0 && <span className="text-[10px] text-gray-400 font-bengali">এখন কোনো কোড চালু নেই</span>}
              {activePromosList.map((p) => p.code).map((demoCode) => (
                <button
                  key={demoCode}
                  type="button"
                  onClick={() => setPromoInput(demoCode)}
                  className="px-2 py-0.5 rounded-md bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-mono text-[10px] font-bold border border-cyan-200 cursor-pointer transition-colors"
                >
                  +{demoCode}
                </button>
              ))}
            </div>

            <button
              onClick={handleRedeemPromo}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-black text-xs font-bengali shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>রিডিম করুন</span>
            </button>

            {promoFeedback && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold font-bengali text-center animate-in fade-in flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{promoFeedback}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-gray-600 font-bengali space-y-1">
            <span className="font-bold text-blue-800">সহায়তা:</span>
            <p>• প্রতিটি প্রচার কোড শুধুমাত্র একবার ব্যবহার করা যাবে।</p>
            <p>• অফিসিয়াল টেলিগ্রাম এবং সোশ্যাল মিডিয়া থেকে নতুন কোড সংগ্রহ করুন।</p>
          </div>

        </div>

        {/* Right Column: Claimed Promo Codes History */}
        <div className="w-full md:w-1/2 p-4 sm:p-5 flex flex-col bg-white md:overflow-y-auto pb-16 md:pb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-black text-gray-900 font-bengali flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-600" />
              <span>রিডিম করা কোডের ইতিহাস</span>
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-bengali text-[11px] font-bold">
              {claimedPromos.length}টি কোড
            </span>
          </div>

          {/* Overview summary card */}
          <div className="p-3 rounded-xl bg-gradient-to-r from-sky-900 via-cyan-900 to-blue-900 text-white mb-3 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-cyan-300 shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-cyan-200 font-bengali block">মোট রিডিমকৃত বোনাস</span>
                <span className="text-sm sm:text-base font-black font-mono text-yellow-300">৳ ১,০৩৮.০০</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-bengali text-cyan-200">
              <span className="block text-[10px]">সফল রিডিমশন</span>
              <span className="font-bold text-white">{claimedPromos.length}টি সম্পন্ন</span>
            </div>
          </div>

          {/* Copy toast */}
          {copiedPromoCode && (
            <div className="mb-2 px-3 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-bengali font-bold flex items-center justify-center gap-1 shadow-2xs animate-fade-in">
              <Check className="w-3 h-3" />
              <span>কোড {copiedPromoCode} কপি করা হয়েছে!</span>
            </div>
          )}

          {claimedPromos.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Tag className="w-12 h-12 stroke-1 mb-2 text-gray-300" />
              <p className="text-xs font-bengali text-gray-500">এখনো কোনো কোড রিডিম করা হয়নি</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {claimedPromos.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-xl bg-[#f8fafc] border border-gray-200 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all flex flex-col gap-1.5 shadow-2xs"
                >
                  {/* Top Row: Code Pill + Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPromoCode(item.code)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-cyan-100 text-cyan-800 font-mono font-black text-xs border border-cyan-200 cursor-pointer transition-colors shadow-2xs"
                        title="কোড কপি করুন"
                      >
                        <span>{item.code}</span>
                        <Copy className="w-2.5 h-2.5 text-cyan-600" />
                      </button>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bengali font-medium">
                        {item.source}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-black font-mono text-emerald-600">
                      +{item.bonusAmount}
                    </span>
                  </div>

                  {/* Middle Row: Title */}
                  <div className="text-xs font-bold text-gray-800 font-bengali">
                    {item.title}
                  </div>

                  {/* Bottom Row: Timestamp and Status */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-dashed border-gray-200">
                    <span className="font-mono text-[10px] text-gray-400">
                      {item.claimedAt}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 font-bengali">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>দাবি সম্পন্ন</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // VIEW 5: TICKET RECORDS VIEW
  const renderTicketRecordsContent = () => {
    const activeList = realTickets;
    const filteredRecords = activeList.filter(record => {
      // Date filter
      if (recordDateFilter !== 'all' && record.dateCategory !== recordDateFilter) {
        return false;
      }
      // Type filter
      if (ticketTypeFilter !== 'all' && record.type !== ticketTypeFilter) {
        return false;
      }
      return true;
    });

    const handleCopyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedRecordCode(code);
      setTimeout(() => setCopiedRecordCode(null), 2500);
    };

    return (
      <div className="flex-1 bg-[#f8fafc] flex flex-col min-h-full overflow-y-auto">
        {/* Top Header & Filter Bar */}
        <div className="bg-white px-4 py-3.5 border-b border-gray-200 shadow-2xs sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-5 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full" />
              <h2 className="text-sm sm:text-base font-black text-gray-900 font-bengali flex items-center gap-2">
                <span>টিকিটের রেকর্ড</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[11px] font-bold">
                  {filteredRecords.length}টি
                </span>
              </h2>
            </div>

            <button
              onClick={() => {
                setActiveRightView('coupons');
                setMobileView('overview');
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold font-bengali cursor-pointer transition-colors flex items-center gap-1 active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ফিরে যান</span>
            </button>
          </div>

          {/* Date Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setRecordDateFilter('all')}
              className={`px-3 py-1.5 rounded-full font-bengali font-bold transition-all cursor-pointer shrink-0 ${
                recordDateFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              সকল রেকর্ড
            </button>
            <button
              onClick={() => setRecordDateFilter('today')}
              className={`px-3 py-1.5 rounded-full font-bengali font-bold transition-all cursor-pointer shrink-0 ${
                recordDateFilter === 'today'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              আজ
            </button>
            <button
              onClick={() => setRecordDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-full font-bengali font-bold transition-all cursor-pointer shrink-0 ${
                recordDateFilter === 'yesterday'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              গতকাল
            </button>
            <button
              onClick={() => setRecordDateFilter('7days')}
              className={`px-3 py-1.5 rounded-full font-bengali font-bold transition-all cursor-pointer shrink-0 ${
                recordDateFilter === '7days'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              গত ৭ দিন
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar text-[11px]">
            {['all', 'কুপন ভাউচার', 'চেক-ইন রিওয়ার্ড', 'বিশেষ ইভেন্ট', 'লটারি ড্র', 'ক্যাশব্যাক'].map((cat) => (
              <button
                key={cat}
                onClick={() => setTicketTypeFilter(cat)}
                className={`px-2.5 py-1 rounded-md font-bengali transition-colors cursor-pointer shrink-0 ${
                  ticketTypeFilter === cat
                    ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat === 'all' ? 'সব ধরন' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stat Strip */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 text-white mx-3 sm:mx-4 mt-3 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-purple-200 font-bengali block">মোট অর্জিত বোনাস মান</span>
              <span className="text-sm sm:text-base font-black font-mono text-yellow-300">৳ ১,২৭০.০০</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bengali">
            <div className="text-right">
              <span className="text-purple-200 text-[10px] block">সক্রিয় ভাউচার</span>
              <span className="font-bold text-emerald-300">১টি ভাউচার</span>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-right">
              <span className="text-purple-200 text-[10px] block">দাবি সম্পন্ন</span>
              <span className="font-bold text-yellow-300">৬টি টিকিট</span>
            </div>
          </div>
        </div>

        {/* Copy Toast Alert */}
        {copiedRecordCode && (
          <div className="mx-4 mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bengali font-bold flex items-center justify-center gap-1.5 shadow-sm animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>কোড {copiedRecordCode} সফলভাবে কপি করা হয়েছে!</span>
          </div>
        )}

        {/* Records Container */}
        <div className="p-3 sm:p-4 flex-1">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center text-center shadow-2xs">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-2xl text-purple-400 mb-3">
                <Ticket className="w-8 h-8 text-purple-300" />
              </div>
              <p className="text-sm font-bold text-gray-700 font-bengali mb-1">
                এই ফিল্টারে কোনো টিকিটের রেকর্ড পাওয়া যায়নি
              </p>
              <p className="text-xs text-gray-500 font-bengali mb-4">
                অন্য ফিল্টার নির্বাচন করুন বা সকল রেকর্ড দেখুন
              </p>
              <button
                onClick={() => {
                  setRecordDateFilter('all');
                  setTicketTypeFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold font-bengali transition-colors cursor-pointer shadow-xs"
              >
                সকল রেকর্ড দেখুন
              </button>
            </div>
          ) : (
            <>
              {/* 💻 DESKTOP TABLE VIEW (md:block) */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs font-bengali">
                  <thead className="bg-[#f8fafc] text-gray-700 border-b border-gray-200">
                    <tr>
                      <th className="p-3.5 font-bold">টিকিটের নাম ও বিবরণ</th>
                      <th className="p-3.5 font-bold">ধরন</th>
                      <th className="p-3.5 font-bold">ক্যাম্পেইন / পণ্য</th>
                      <th className="p-3.5 font-bold">মূল্য / পরিমাণ</th>
                      <th className="p-3.5 font-bold">কোড</th>
                      <th className="p-3.5 font-bold">সময়</th>
                      <th className="p-3.5 font-bold text-right">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRecords.map((item) => (
                      <tr key={item.id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <Ticket className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-medium">
                            {item.type}
                          </span>
                        </td>
                        <td className="p-3.5 text-gray-600 font-medium">
                          {item.productName}
                        </td>
                        <td className="p-3.5 font-black font-mono text-purple-700 text-sm">
                          {item.amount}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleCopyCode(item.redeemCode)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 font-mono text-xs font-bold transition-colors cursor-pointer border border-gray-200"
                            title="কোড কপি করুন"
                          >
                            <span>{item.redeemCode}</span>
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                        </td>
                        <td className="p-3.5 text-gray-500 font-mono text-[11px]">
                          {item.usedTime}
                        </td>
                        <td className="p-3.5 text-right">
                          {item.status === 'claimed' && (
                            <button
                              onClick={() => handleUseTicketRecord(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[11px] cursor-pointer transition-all active:scale-95 shadow-2xs"
                              title="ব্যবহার করতে ক্লিক করুন"
                            >
                              <Check className="w-3 h-3" />
                              দাবি সম্পন্ন (খুলুন ›)
                            </button>
                          )}
                          {item.status === 'used' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 font-bold text-[11px]">
                              ব্যবহৃত
                            </span>
                          )}
                          {item.status === 'active' && (
                            <button
                              onClick={() => handleUseTicketRecord(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 font-bold text-[11px] animate-pulse cursor-pointer transition-all active:scale-95 shadow-2xs"
                              title="ব্যবহার করতে ক্লিক করুন"
                            >
                              <Sparkles className="w-3 h-3" />
                              সক্রিয় (ব্যবহার করুন ›)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 📱 MOBILE CARDS VIEW (block md:hidden) */}
              <div className="block md:hidden space-y-3 pb-20">
                {filteredRecords.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-purple-100 p-3.5 shadow-2xs flex flex-col gap-2.5 relative overflow-hidden"
                  >
                    {/* Top Row: Name and Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 font-bengali leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-bengali block">
                            {item.productName}
                          </span>
                        </div>
                      </div>

                      <span className="text-sm font-black font-mono text-purple-700 shrink-0">
                        {item.amount}
                      </span>
                    </div>

                    {/* Middle Row: Type Badge and Status */}
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-dashed border-gray-200">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bengali text-[10px] font-medium">
                        {item.type}
                      </span>

                      {item.status === 'claimed' && (
                        <button
                          onClick={() => handleUseTicketRecord(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px] font-bengali cursor-pointer active:scale-95 transition-all shadow-2xs"
                        >
                          <Check className="w-3 h-3" />
                          দাবি সম্পন্ন (খুলুন ›)
                        </button>
                      )}
                      {item.status === 'used' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 font-bold text-[10px] font-bengali">
                          ব্যবহৃত
                        </span>
                      )}
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleUseTicketRecord(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 font-bold text-[10px] font-bengali cursor-pointer active:scale-95 transition-all shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3" />
                          সক্রিয় (ব্যবহার করুন ›)
                        </button>
                      )}
                    </div>

                    {/* Bottom Row: Code and Timestamp */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                      <button
                        onClick={() => handleCopyCode(item.redeemCode)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 hover:bg-purple-50 text-gray-700 font-mono font-bold text-[10px] border border-gray-200"
                      >
                        <span>{item.redeemCode}</span>
                        <Copy className="w-2.5 h-2.5 text-gray-400" />
                      </button>
                      <span>{item.usedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Active Subview Resolver
  const renderActiveSubView = (view: 'coupons' | 'temu_chest' | 'signin' | 'rescue' | 'promo' | 'ticket_records') => {
    switch (view) {
      case 'coupons':
      case 'temu_chest':
        return renderCouponsContent();
      case 'signin':
        return renderDesktopSigninContent();
      case 'rescue':
        return renderRescueContent();
      case 'promo':
        return renderPromoContent();
      case 'ticket_records':
        return renderTicketRecordsContent();
      default:
        return renderCouponsContent();
    }
  };

  return (
    <main className="flex-1 bg-[#f8fafc] flex flex-col overflow-hidden text-gray-800 select-none relative h-full">
      
      {/* ========================================================================= */}
      {/* 📱 MOBILE VIEW: EXACT REWARD CENTER DASHBOARD (Capture.PNG & c2.PNG) 📱 */}
      {/* ========================================================================= */}
      <div 
        ref={mobileContainerRef} 
        tabIndex={-1} 
        className="md:hidden flex flex-col flex-1 bg-[#f8fafc] overflow-y-auto min-h-full outline-hidden"
      >
        {mobileView === 'overview' ? (
          <div className="flex flex-col flex-1 pb-6 animate-in fade-in duration-200">
            
            {/* Top Radiant Orange/Coral Hero Header */}
            <div className="relative bg-gradient-to-b from-[#ff5722] via-[#fa6432] to-[#ff8a3d] px-4 pt-3 pb-12 overflow-hidden shadow-sm">
              
              {/* Floating Bokeh Bubbles / Glowing Orbs */}
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/20 blur-md pointer-events-none" />
              <div className="absolute top-10 right-4 w-16 h-16 rounded-full bg-yellow-300/25 blur-sm pointer-events-none" />
              <div className="absolute -bottom-4 right-1/4 w-20 h-20 rounded-full bg-white/15 blur-sm pointer-events-none" />
              <div className="absolute top-2 left-1/3 w-10 h-10 rounded-full bg-yellow-200/20 pointer-events-none" />

              {/* Large Semi-Transparent Background Watermark: REWARD */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-white/15 text-5xl sm:text-6xl font-black tracking-widest uppercase font-sans">
                  REWARD
                </span>
              </div>

              {/* Top Header Navigation Bar */}
              <div className="relative z-10 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (onClose) onClose();
                    else if (onBack) onBack();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="ফিরে যান"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>

                <h1 className="text-lg sm:text-xl font-black text-white font-bengali tracking-tight">
                  পুরস্কার সেন্টার
                </h1>

                <button
                  onClick={() => {
                    if (onClose) onClose();
                    else if (onBack) onBack();
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Floating Profile & VIP Card (overlapping the orange header) */}
            <div className="px-4 -mt-9 relative z-20">
              <div className="bg-[#eef2f6] rounded-2xl border border-slate-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-3.5 relative overflow-hidden text-slate-800">
                
                {/* Watermark Star Award Medal stamped on right */}
                <Award className="absolute right-0 -bottom-2 w-28 h-28 text-slate-300/35 pointer-events-none stroke-1 transform rotate-6" />

                {/* Red Top-Right Ribbon: '☑ সাইন ইন >' */}
                <button
                  onClick={() => {
                    setMobileView('signin');
                    setActiveRightView('signin');
                  }}
                  className="absolute top-0 right-0 bg-[#d32f2f] hover:bg-red-700 active:scale-95 text-white text-[11px] font-bold font-bengali px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow flex items-center gap-1 cursor-pointer transition-all z-10"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>সাইন ইন</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* User Info Row: Avatar, Username, Nickname, Balance */}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full border-2 border-[#eab308] object-cover shadow-sm bg-white"
                    />
                  </div>

                  <div className="flex flex-col flex-1 pr-14">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm sm:text-base font-mono text-slate-900 tracking-wide">
                        {user.username || '1752348921'}
                      </span>
                      <button
                        onClick={handleCopyUsername}
                        className="p-1 text-slate-600 hover:text-slate-900 active:scale-90 transition-transform cursor-pointer"
                        title="কপি করুন"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bengali mt-0.5">
                      <span>ডাকনাম:</span>
                      <span className="font-mono text-slate-700">{user.username || '1752348921'}</span>
                      <Pencil className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600" />
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                        ৳ {user.balance ? user.balance.toFixed(2) : '0.00'}
                      </span>
                      <button
                        onClick={handleRefresh}
                        className="p-1 text-slate-600 hover:text-slate-900 active:rotate-180 transition-transform cursor-pointer"
                        title="রিফ্রেশ করুন"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIP Status Row & Progress Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 relative z-10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 font-extrabold text-slate-800">
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>VIP{user.vipLevel ?? 0}</span>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenVip) onOpenVip();
                      }}
                      className="flex items-center gap-0.5 text-xs font-bold text-slate-700 hover:text-amber-600 font-bengali cursor-pointer transition-colors"
                    >
                      <span>সুবিধা</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-400/30 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                        ›
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-300 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: '15%' }} />
                    </div>
                    <span className="text-[11px] font-bold font-mono text-slate-500">
                      0 / 1
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Mobile Mystery Reward Quick VIP Banner */}
            <div className="px-4 pt-3">
              <div 
                onClick={() => setIsMysteryModalOpen(true)}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-[#210936] via-[#3b1259] to-[#1a052c] border-2 border-amber-400/80 shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition-all relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5 z-10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-purple-950 font-black shadow-sm shrink-0">
                    <Gift className="w-6 h-6 text-purple-950" />
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-yellow-300 font-bengali">
                        {mDayBn} তারিখ রহস্যময় পুরস্কার
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-amber-400 text-black">
                        1x বাজি
                      </span>
                    </div>
                    <span className="text-[10px] text-purple-200 font-bengali font-semibold mt-0.5">
                      {mRangeBn} • {mHourBn} থেকে
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-[11px] font-black font-bengali shadow-md shrink-0 z-10"
                >
                  খুলুন ›
                </button>
              </div>
            </div>

            {/* 2x3 Colorful Feature Cards Grid Matching Capture.PNG & c2.PNG */}
            <div className="grid grid-cols-2 gap-3.5 sm:gap-4 p-4 pt-3">
              
              {/* CARD 1: দাবি করা */}
              <div
                onClick={() => {
                  setMobileView('coupons');
                  setActiveRightView('coupons');
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22c55e] via-[#10b981] to-[#059669] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(16,185,129,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-2 left-2 w-8 h-2 bg-white/20 rounded-full -rotate-45 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/10 rounded-full pointer-events-none" />
                <div className="absolute top-8 right-2 w-2 h-2 bg-white/30 rounded-full pointer-events-none" />
                
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <Gift className="w-7 h-7 text-[#10b981]" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    {Math.max(0, 6 - claimedCouponIds.length)}
                  </span>
                </div>

                <span className="text-sm sm:text-base font-black text-white tracking-wide mt-2.5 font-bengali drop-shadow-xs">
                  দাবি করা
                </span>
                <span className="text-[10px] text-emerald-100 font-bold font-bengali">
                  প্রাপ্তি সেন্টার
                </span>
              </div>

              {/* CARD 2: সাইন ইন */}
              <div
                onClick={() => {
                  setMobileView('signin');
                  setActiveRightView('signin');
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#38bdf8] via-[#3b82f6] to-[#4f46e5] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(59,130,246,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-3 left-4 text-white/30 text-sm font-black pointer-events-none">+</div>
                <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full border border-white/40 pointer-events-none" />
                <div className="absolute top-4 right-3 text-white/20 text-xs pointer-events-none">✦</div>
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/10 rounded-full pointer-events-none" />

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <CalendarCheck2 className="w-7 h-7 text-[#2563eb]" />
                </div>

                <span className="text-sm sm:text-base font-black text-white tracking-wide mt-2.5 font-bengali drop-shadow-xs">
                  সাইন ইন
                </span>
              </div>

              {/* CARD 3: উদ্ধার তহবিল */}
              <div
                onClick={() => {
                  setMobileView('rescue');
                  setActiveRightView('rescue');
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbbf24] via-[#f59e0b] to-[#ea580c] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-2 left-3 w-8 h-8 rounded-full bg-white/20 blur-xs pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <Coins className="w-7 h-7 text-[#f59e0b]" />
                </div>

                <span className="text-sm sm:text-base font-black text-white tracking-wide mt-2.5 font-bengali drop-shadow-xs">
                  উদ্ধার তহবিল
                </span>
              </div>

              {/* CARD 4: বন্ধুদের আমন্ত্রণ জানান */}
              <div
                onClick={() => {
                  if (onOpenInvite) {
                    onOpenInvite();
                  } else {
                    setMobileView('coupons');
                    setActiveRightView('coupons');
                  }
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fb7185] via-[#f43f5e] to-[#e11d48] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(244,63,94,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-2.5 right-3 text-white/30 text-xs font-black tracking-tighter pointer-events-none">&gt;&gt;&gt;</div>
                <div className="absolute bottom-2.5 left-3 text-white/30 text-xs font-black tracking-tighter pointer-events-none">&gt;&gt;&gt;</div>
                <div className="absolute bottom-2 right-2 w-10 h-10 bg-white/10 rounded-full pointer-events-none" />

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <UserPlus className="w-7 h-7 text-[#e11d48]" />
                </div>

                <span className="text-xs sm:text-sm font-black text-white tracking-wide mt-2.5 font-bengali text-center leading-tight drop-shadow-xs">
                  বন্ধুদের আমন্ত্রণ জানান
                </span>
              </div>

              {/* CARD 5: প্রচার কোড */}
              <div
                onClick={() => {
                  setMobileView('promo');
                  setActiveRightView('promo');
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06b6d4] via-[#0ea5e9] to-[#0284c7] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-3 left-3 text-white/30 text-xs font-black pointer-events-none">+</div>
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/15 pointer-events-none" />
                <div className="absolute top-2 right-4 w-1.5 h-1.5 rounded-full bg-white/40 pointer-events-none" />

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <Percent className="w-7 h-7 text-[#0284c7]" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    1
                  </span>
                </div>

                <span className="text-sm sm:text-base font-black text-white tracking-wide mt-2.5 font-bengali drop-shadow-xs">
                  প্রচার কোড
                </span>
              </div>

              {/* CARD 6: টিকিটের রেকর্ড */}
              <div
                onClick={() => {
                  setMobileView('ticket_records');
                  setActiveRightView('ticket_records');
                }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#4338ca] p-4 flex flex-col items-center justify-center min-h-[145px] shadow-[0_4px_14px_rgba(109,40,217,0.35)] hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
              >
                <div className="absolute top-3 left-3 text-white/30 text-xs pointer-events-none">✦</div>
                <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute top-2 right-2 w-10 h-10 rounded-full border border-white/20 pointer-events-none" />

                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md relative group-hover:scale-105 transition-transform shrink-0">
                  <Ticket className="w-7 h-7 text-[#6d28d9]" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                    7
                  </span>
                </div>

                <span className="text-sm sm:text-base font-black text-white tracking-wide mt-2.5 font-bengali drop-shadow-xs">
                  টিকিটের রেকর্ড
                </span>
                <span className="text-[10px] text-purple-200 font-bold font-bengali">
                  টেমু টিকিট রেকর্ড দেখুন
                </span>
              </div>

            </div>

          </div>
        ) : mobileView === 'signin' ? (
          /* Dedicated Full Page Sign-in on Mobile matching Capture.PNG & Capture2.PNG */
          <div className="flex flex-col flex-1 bg-white min-h-full">
            {renderMobileSigninContent()}
          </div>
        ) : (
          /* Subview on Mobile */
          <div className="flex flex-col flex-1 bg-white min-h-full">
            <div className="bg-gradient-to-r from-[#ff5722] via-[#fa6432] to-[#ff8a3d] text-white px-3 py-2.5 flex items-center justify-between shrink-0 shadow-xs sticky top-0 z-30">
              <button
                onClick={() => setMobileView('overview')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold font-bengali active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 stroke-[3]" />
                <span>পুরস্কার সেন্টার</span>
              </button>

              <h2 className="text-sm font-black text-white font-bengali">
                {(mobileView === 'coupons' || mobileView === 'temu_chest') && 'প্রাপ্তি সেন্টার'}
                {mobileView === 'rescue' && 'উদ্ধার তহবিল'}
                {mobileView === 'promo' && 'প্রচার কোড'}
                {mobileView === 'ticket_records' && 'টিকিটের রেকর্ড'}
              </h2>

              {(mobileView === 'coupons' || mobileView === 'temu_chest') ? (
                <button
                  onClick={() => {
                    setMobileView('ticket_records');
                    setActiveRightView('ticket_records');
                  }}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold font-bengali flex items-center gap-1 cursor-pointer"
                >
                  <Ticket className="w-3 h-3" />
                  <span>রেকর্ড</span>
                </button>
              ) : (
                <div className="w-16" />
              )}
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col">
              {renderActiveSubView(mobileView)}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP VIEW: SPLIT 2-COLUMN LAYOUT (LEFT MENU + RIGHT DETAILS) 💻 */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-1 flex-row h-full overflow-hidden">
        
        {/* LEFT SUB-COLUMN: PROFILE & 4 REWARD FEATURE BUTTONS (~20-22% WIDTH) */}
        <div className="w-56 lg:w-60 bg-white p-3 border-r border-gray-200 flex flex-col gap-2.5 shrink-0 shadow-2xs overflow-y-auto">
          
          {/* User Card with Purple Geometric Gradient */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#381197] via-[#5b1fd3] to-[#8338ec] text-white p-3 shadow-sm flex flex-col justify-between">
            
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rotate-45 transform translate-x-8 -translate-y-8 rounded-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rotate-45 transform -translate-x-6 translate-y-6 rounded-xl pointer-events-none" />

            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt="User"
                    className="w-9 h-9 rounded-full border-2 border-white/80 object-cover shadow-xs"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs font-mono text-white tracking-wide">
                      {user.username || '1615249856'}
                    </span>
                    <span className="text-[9px] text-yellow-300">✏️</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[8.5px] text-purple-200 font-bengali">ব্যবহারকারীর : নাম</span>
                    <button
                      onClick={handleCopyUsername}
                      className="px-1.5 py-0.2 rounded bg-white/20 hover:bg-white/30 text-[8.5px] text-white font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      title="কপি করুন"
                    >
                      <span>{user.username || '1615249856'}</span>
                      {isCopied ? <Check className="w-2.5 h-2.5 text-green-300" /> : <Copy className="w-2.5 h-2.5 text-gray-200" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRefresh}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-transform active:rotate-180 cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="relative z-10 mt-2.5 pt-1.5 border-t border-white/15 flex flex-col items-center">
              <span className="text-[10px] text-purple-200 font-bengali">প্রাপ্ত হিসাব</span>
              <span className="text-lg font-black font-mono tracking-tight text-white mt-0.5">
                ৳ {user.balance ? user.balance.toFixed(2) : '0.00'}
              </span>
            </div>

          </div>

          {/* 4 Reward Feature Navigation Cards */}
          <div className="flex flex-col gap-2 mt-0.5">
            
            {/* DIV 1: টেমু টিকিট (প্রাপ্তি সেন্টার) */}
            <div 
              onClick={() => setActiveRightView('coupons')}
              className={`w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group ${
                activeRightView === 'coupons' || activeRightView === 'temu_chest'
                  ? 'bg-amber-50/70 border-amber-500 shadow-xs ring-1 ring-amber-400' 
                  : 'bg-white border-gray-200 hover:border-amber-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-2xs text-white shrink-0">
                  <PackageOpen className="w-5 h-5 text-white filter drop-shadow-xs" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-[#ea580c] transition-colors">
                    টেমু টিকিট
                  </h4>
                  <span className="text-[9.5px] text-amber-600 font-bengali font-semibold">প্রাপ্তি সেন্টার</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors ${
                activeRightView === 'coupons' || activeRightView === 'temu_chest'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500'
              }`}>
                দেখুন
              </span>
            </div>

            {/* DIV 2: সাইন-ইন কাজ */}
            <div 
              onClick={() => setActiveRightView('signin')}
              className={`w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group ${
                activeRightView === 'signin' 
                  ? 'bg-blue-50/70 border-blue-500 shadow-xs ring-1 ring-blue-400' 
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#38bdf8] via-[#3b82f6] to-[#4f46e5] flex items-center justify-center shadow-2xs text-white shrink-0">
                  <CalendarCheck2 className="w-5 h-5 text-white filter drop-shadow-xs" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-[#2563eb] transition-colors">
                    সাইন-ইন কাজ
                  </h4>
                  <span className="text-[9.5px] text-[#2563eb] font-bengali font-semibold">একটি কাজ চলমান</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors ${
                activeRightView === 'signin'
                  ? 'bg-[#2563eb] text-white border-[#2563eb]'
                  : 'bg-gray-50 border-gray-300 text-gray-700 group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb]'
              }`}>
                দেখুন
              </span>
            </div>

            {/* DIV 3: রেসকিউ ফান্ড */}
            <div 
              onClick={() => setActiveRightView('rescue')}
              className={`w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group ${
                activeRightView === 'rescue' 
                  ? 'bg-pink-50/70 border-pink-500 shadow-xs ring-1 ring-pink-400' 
                  : 'bg-white border-gray-200 hover:border-pink-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-pink-500 via-rose-500 to-red-500 flex items-center justify-center shadow-2xs text-white shrink-0">
                  <HeartHandshake className="w-5 h-5 text-white filter drop-shadow-xs" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-pink-600 transition-colors">
                    রেসকিউ ফান্ড
                  </h4>
                  <span className="text-[9.5px] text-gray-500 font-bengali">পুনর্জন্মে সাহায্য করুন</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors ${
                activeRightView === 'rescue'
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700 group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-500'
              }`}>
                দেখুন
              </span>
            </div>

            {/* DIV 4: প্রচার কোড */}
            <div 
              onClick={() => setActiveRightView('promo')}
              className={`w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group ${
                activeRightView === 'promo' 
                  ? 'bg-yellow-50/70 border-yellow-500 shadow-xs ring-1 ring-yellow-400' 
                  : 'bg-white border-gray-200 hover:border-yellow-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xs text-white shrink-0">
                  <Tag className="w-5 h-5 text-white filter drop-shadow-xs" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                    1
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-amber-600 transition-colors">
                    প্রচার কোড
                  </h4>
                  <span className="text-[9.5px] text-gray-500 font-bengali">যাও</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors ${
                activeRightView === 'promo'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-gray-50 border-gray-300 text-gray-700 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500'
              }`}>
                দেখুন
              </span>
            </div>

            {/* DIV 5: টিকিটের রেকর্ড */}
            <div 
              onClick={() => setActiveRightView('ticket_records')}
              className={`w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group ${
                activeRightView === 'ticket_records' 
                  ? 'bg-purple-50/70 border-purple-500 shadow-xs ring-1 ring-purple-400' 
                  : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-700 flex items-center justify-center shadow-2xs text-white shrink-0">
                  <Ticket className="w-5 h-5 text-white filter drop-shadow-xs" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[8px] font-bold flex items-center justify-center border border-white">
                    7
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-purple-600 transition-colors">
                    টিকিটের রেকর্ড
                  </h4>
                  <span className="text-[9.5px] text-purple-600 font-bengali">টেমু রেকর্ড</span>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors ${
                activeRightView === 'ticket_records'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-50 border-gray-300 text-gray-700 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600'
              }`}>
                দেখুন
              </span>
            </div>

            {/* DIV 6: ২৩ তারিখ রহস্যময় পুরস্কার (ক্যাশ কার্ড) */}
            <div 
              onClick={() => setIsMysteryModalOpen(true)}
              className="w-full p-2 rounded-xl border shadow-2xs transition-all flex items-center justify-between cursor-pointer group bg-gradient-to-r from-purple-950/20 via-purple-900/10 to-purple-950/20 border-amber-500/40 hover:border-amber-500 hover:shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-lg bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-2xs text-white shrink-0">
                  <Gift className="w-5 h-5 text-yellow-300 filter drop-shadow-xs" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                <div className="flex flex-col text-left">
                  <h4 className="text-xs font-bold text-gray-900 font-bengali group-hover:text-amber-600 transition-colors flex items-center gap-1">
                    <span>{mDayBn} তারিখ ড্রপ</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </h4>
                  <span className="text-[9.5px] text-purple-700 font-bengali font-bold">
                    {mysteryStatus?.card?.bonusAmount ? `৳ ${mysteryStatus.card.bonusAmount.toLocaleString()}` : mRangeBn}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold font-bengali transition-colors bg-gradient-to-r from-yellow-400 to-amber-400 text-black border-amber-400 shadow-xs">
                {mysteryStatus?.hasClaimed ? 'দেখা' : 'খুলুন'}
              </span>
            </div>

          </div>

        </div>

        {/* RIGHT MAIN PANEL: RENDER SELECTED VIEW */}
        <div className="flex-1 min-w-0 bg-white flex flex-col overflow-y-auto relative h-full">
          {renderActiveSubView(activeRightView)}
        </div>

      </div>
      {/* ============================================================= */}
      {/* 🔴 BORNONA (DESCRIPTION) MODAL MATCHING image.png 🔴 */}
      {/* ============================================================= */}
      {isDescriptionOpen && (
        <div 
          onClick={() => setIsDescriptionOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[340px] sm:max-w-[380px] bg-[#292a2d] text-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/10 flex flex-col relative overflow-hidden"
          >
            
            {/* Scrollable Rules Container */}
            <div className="max-h-[380px] overflow-y-auto pr-1 space-y-2.5 text-xs sm:text-[13px] text-gray-200 font-bengali leading-relaxed text-left custom-scrollbar">
              <p className="flex items-start gap-1">
                <span>১.</span>
                <span>সফলভাবে নিবন্ধনের পর নতুন সদস্যরা বিনামূল্যে কুপন পেতে পারেন।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>২.</span>
                <span>সংশ্লিষ্ট লটারির সুযোগ পেতে প্রাসঙ্গিক কাজগুলি সম্পন্ন করুন।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>৩.</span>
                <span>
                  প্রতিটি কুপন উত্তোলনের আগে অবশ্যই <strong className="text-amber-400 font-bold">৳৩০০</strong> পৌঁছাতে হবে।
                </span>
              </p>
              <p className="flex items-start gap-1">
                <span>৪.</span>
                <span>সফলভাবে পুরস্কার দাবি করার পরে, কুপনটি অবৈধ হয়ে যাবে।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>৫.</span>
                <span>প্রতিটি কুপন ৩ দিনের জন্য বৈধ এবং মেয়াদ শেষ হওয়ার পরে অবৈধ হয়ে যাবে।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>৬.</span>
                <span>এই ইভেন্টে শুধুমাত্র অ্যাপ লগইনের মাধ্যমে অংশগ্রহণ করা যাবে।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>৭.</span>
                <span>মিনিমাম ১ রাউন্ড বেট ধরার পর বোনাস উত্তোলন করতে পারবেন।</span>
              </p>
              <p className="flex items-start gap-1">
                <span>৮.</span>
                <span>
                  <strong className="text-[#f97316] font-bold">BengalBet</strong> এই ইভেন্টের চূড়ান্ত ব্যাখ্যার অধিকার সংরক্ষণ করে।
                </span>
              </p>
            </div>

            {/* Red Understood Button matching image.png: বুঝেছি */}
            <div className="mt-4 pt-2 border-t border-white/10 flex justify-center">
              <button
                onClick={() => setIsDescriptionOpen(false)}
                className="w-28 py-1.5 rounded-lg bg-gradient-to-r from-[#e53935] to-[#d32f2f] hover:from-red-600 hover:to-red-700 text-white font-black text-xs font-bengali shadow-md active:scale-95 transition-all cursor-pointer tracking-wide"
              >
                বুঝেছি
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 🔴 ২৩ তারিখ রহস্যময় পুরস্কার (MYSTERY REWARD CASH CARD) MODAL 🔴 */}
      {/* ============================================================= */}
      <MysteryRewardModal
        isOpen={isMysteryModalOpen}
        onClose={() => setIsMysteryModalOpen(false)}
        user={user}
        onClaimSuccess={(amount, note) => {
          if (onSettledReward) onSettledReward();
          loadRewardBackendData();
        }}
      />

    </main>
  );
};
