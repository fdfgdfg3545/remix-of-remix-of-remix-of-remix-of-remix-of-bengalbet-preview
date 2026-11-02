// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  ClipboardList, 
  Headphones, 
  Plus, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Check, 
  CreditCard, 
  User, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Wallet,
  ShieldCheck,
  Clock,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { DepositWithdrawRecordView } from './DepositWithdrawRecordView';
import { CustomerServiceModal } from './CustomerServiceModal';
import { LiveChatWidget } from './LiveChatWidget';
import { api } from '../services/api';

interface RegisteredWallet {
  id: string;
  type: 'Rocket' | 'Nagad' | 'BKash';
  accountName: string;
  accountNumber: string;
  createdAt: string;
  isDefault: boolean;
}

interface WithdrawMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  onOpenWithdrawRecord?: () => void;
  onOpenCustomerService?: () => void;
  onOpenSupportTicket?: () => void;
  onWithdrawSuccess?: (amount: number) => void;
  showToast?: (msg: string) => void;
}

export const WithdrawMobileView: React.FC<WithdrawMobileViewProps> = ({
  user,
  onBack,
  onClose,
  onOpenWithdrawRecord,
  onOpenCustomerService,
  onOpenSupportTicket,
  onWithdrawSuccess,
  showToast
}) => {
  // Navigation View State: 'withdraw' | 'bind_wallet' | 'record'
  const [currentView, setCurrentView] = useState<'withdraw' | 'bind_wallet' | 'record'>('withdraw');

  // Customer support & Live chat modal states
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  // Bound E-Wallets (Showing all 3 wallets: Rocket, Nagad, BKash)
  const [wallets, setWallets] = useState<RegisteredWallet[]>([
    {
      id: 'w-1',
      type: 'Rocket',
      accountName: 'P*****',
      accountNumber: '01766808921',
      createdAt: '2026-08-30 15:30:58',
      isDefault: true
    },
    {
      id: 'w-2',
      type: 'Nagad',
      accountName: 'P*****',
      accountNumber: '01844295318',
      createdAt: '2026-08-29 18:14:22',
      isDefault: false
    },
    {
      id: 'w-3',
      type: 'BKash',
      accountName: 'P*****',
      accountNumber: '01912345678',
      createdAt: '2026-08-28 11:05:40',
      isDefault: false
    }
  ]);

  const [selectedWalletId, setSelectedWalletId] = useState<string>('w-1');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.wallet.getCards().then(res => {
      if (res.success && res.wallets && res.wallets.length > 0) {
        const mapped: RegisteredWallet[] = res.wallets.map((w: any) => ({
          id: w.id,
          type: w.type,
          accountName: w.accountName,
          accountNumber: w.fullNumber || w.accountNumber,
          createdAt: w.createdAt,
          isDefault: w.isDefault
        }));
        setWallets(mapped);
        setSelectedWalletId(mapped[0].id);
      }
    }).catch(err => console.warn('Could not fetch mobile cards:', err));
  }, []);

  // Turnover State (Remaining turnover required before withdraw matching desktop view)
  const [remainingTurnover, setRemainingTurnover] = useState<number>(0);
  const loadTurnover = React.useCallback(() => {
    api.wallet.getTurnover().then(r => { if (r && typeof r.remaining === 'number') setRemainingTurnover(r.remaining); }).catch(() => {});
  }, []);
  React.useEffect(() => { loadTurnover(); }, [loadTurnover]);

  // Withdraw form inputs matching Screenshot 3
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawPassword, setWithdrawPassword] = useState<string>('');
  const [showWithdrawPass, setShowWithdrawPass] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Quick Turnover Completion (Interactive Simulation for user)
  const handleCompleteTurnover = () => {
    loadTurnover();
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 }
    });
    triggerToast('টার্নওভার সফলভাবে ১০০% সম্পন্ন হয়েছে! এখন উত্তোলনের পরিমাণ লিখে জমা দিন।');
  };

  const handleResetTurnover = () => {
    loadTurnover();
    triggerToast('টার্নওভার রিসেট করা হয়েছে');
  };

  // Bind Wallet Form States matching Screenshot 1
  const [bindGroup, setBindGroup] = useState<'ec'>('ec');
  const [bindWalletType, setBindWalletType] = useState<'Rocket' | 'Nagad' | 'BKash'>('Rocket');
  const [bindAccountName, setBindAccountName] = useState<string>('P*****');
  const [bindAccountNumber, setBindAccountNumber] = useState<string>('');
  const [bindPassword, setBindPassword] = useState<string>('');
  const [showBindPass, setShowBindPass] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast('ব্যালেন্স আপডেট করা হয়েছে');
    }, 600);
  };

  const handleBindWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bindAccountNumber.trim() || bindAccountNumber.length < 11) {
      triggerToast('অনুগ্রহ করে সঠিক ১১ সংখ্যার অ্যাকাউন্ট নম্বর লিখুন');
      return;
    }
    if (!bindPassword.trim()) {
      triggerToast('অনুগ্রহ করে লেনদেন পাসওয়ার্ড লিখুন');
      return;
    }

    try {
      const res = await api.wallet.addCard(bindWalletType, bindAccountName || user?.username || 'সদস্য', bindAccountNumber.trim());
      if (res.success && res.wallet) {
        const newWallet: RegisteredWallet = {
          id: res.wallet.id,
          type: res.wallet.type,
          accountName: res.wallet.accountName,
          accountNumber: res.wallet.accountNumber,
          createdAt: res.wallet.createdAt,
          isDefault: wallets.length === 0
        };
        setWallets(prev => [newWallet, ...prev]);
        setSelectedWalletId(newWallet.id);
        setBindAccountNumber('');
        setBindPassword('');
        setCurrentView('withdraw');
        triggerToast(`${bindWalletType} ওয়ালেট সফলভাবে আবদ্ধ করা হয়েছে!`);
      } else {
        triggerToast(res.message || 'ওয়ালেট সংরক্ষণ করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      triggerToast(err.message || 'ওয়ালেট সংরক্ষণ ব্যর্থ হয়েছে! ডাটাবেস সার্ভারে সংযোগ চেক করুন।');
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (remainingTurnover > 0) {
      triggerToast('অপূর্ণ প্রয়োজনীয় টার্নওভার আছে, উত্তোলনের অনুরোধ অনুমোদিত হতে পারে না।');
      return;
    }

    const amt = parseFloat(withdrawAmount);

    if (isNaN(amt) || amt < 100 || amt > 25000) {
      triggerToast('অনুগ্রহ করে ১০০ থেকে ২৫,০০০ টাকার মধ্যে সঠিক পরিমাণ লিখুন');
      return;
    }

    const userBal = user?.balance || 0;
    if (amt > userBal) {
      triggerToast('দুঃখিত! আপনার প্রধান ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই');
      return;
    }

    if (!withdrawPassword.trim()) {
      triggerToast('অনুগ্রহ করে লেনদেন পাসওয়ার্ড দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.wallet.withdraw(amt, selectedWallet?.type || 'Rocket', selectedWallet?.accountNumber || user?.phone || '');
      setIsSubmitting(false);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      triggerToast(res.message || `৳${amt.toLocaleString()} উত্তোলনের আবেদন সফল হয়েছে!`);
      if (onWithdrawSuccess) {
        onWithdrawSuccess(amt);
      }
      setWithdrawAmount('');
      setWithdrawPassword('');
    } catch (err: any) {
      setIsSubmitting(false);
      triggerToast(err.message || 'উত্তোলন প্রক্রিয়া ব্যর্থ হয়েছে! ডাটাবেস সার্ভারে সংযোগ চেক করুন।');
    }
  };

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];
  const userBalance = user?.balance || 0;
  const numAmount = parseFloat(withdrawAmount);
  const isValidWithdraw = !isNaN(numAmount) && numAmount >= 100 && numAmount <= 25000 && withdrawPassword.trim().length >= 4;

  // Mask Account Number like *******8921
  const getMaskedNumber = (accNum?: string) => {
    if (!accNum) return '*******8921';
    if (accNum.length > 4) {
      return `*******${accNum.slice(-4)}`;
    }
    return accNum;
  };

  // ---------------------------------------------------------------------------
  // SUB-VIEW: RECORD HISTORY
  // ---------------------------------------------------------------------------
  if (currentView === 'record') {
    return (
      <DepositWithdrawRecordView
        user={user}
        initialType="withdraw"
        onBack={() => setCurrentView('withdraw')}
        onClose={onClose || onBack}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW: BIND E-WALLET (ই-ওয়ালেট বাঁধুন) matching Screenshot_2026.08.30_20.37.46.208.png
  // ---------------------------------------------------------------------------
  if (currentView === 'bind_wallet') {
    return (
      <div 
        id="mobile-bind-wallet-view"
        className="w-full h-full min-h-screen bg-[#f4f6f8] flex flex-col font-bengali select-none animate-in fade-in relative"
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b3323] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header matching Screenshot 1 */}
        <header className="bg-[#0b3323] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentView('withdraw')}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-lg font-bold text-white tracking-wide pr-8">
            ই-ওয়ালেট বাঁধুন
          </h1>

          <div className="w-4" />
        </header>

        {/* Main Form Body */}
        <form onSubmit={handleBindWalletSubmit} className="flex-1 overflow-y-auto px-4 py-4 pb-8 space-y-4 max-w-lg mx-auto w-full">
          
          {/* Section 1: ই-ওয়ালেট গ্রুপ নির্বাচন করুন matching Screenshot 1 */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-700">
              ই-ওয়ালেট গ্রুপ নির্বাচন করুন
            </h2>

            <div className="inline-block">
              <button
                type="button"
                onClick={() => setBindGroup('ec')}
                className="px-4 h-12 rounded-xl bg-white border-2 border-[#ef4444] flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {/* Sweet & Luxury 3D E-Wallet Icon Badge */}
                <div className="relative flex items-center justify-center">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#ff007a] via-[#e2136e] to-[#88003a] p-[1.5px] shadow-sm flex items-center justify-center">
                    <div className="w-full h-full rounded-[9px] bg-gradient-to-b from-white/25 to-black/20 flex items-center justify-center">
                      <span className="text-white text-xs font-black tracking-tighter">ec</span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white flex items-center justify-center">
                    <Sparkles className="w-1.5 h-1.5 text-amber-950 stroke-[3]" />
                  </div>
                </div>
                <span className="text-xs font-black text-gray-800">E-Wallet</span>
              </button>
            </div>
          </div>

          {/* Section 2: ই-ওয়ালেট প্রকার Container Card matching Screenshot 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3.5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-700">
              ই-ওয়ালেট প্রকার
            </h3>

            {/* 3 Wallet Type Buttons: Rocket, Nagad, BKash */}
            <div className="grid grid-cols-3 gap-2.5">
              {(['Rocket', 'Nagad', 'BKash'] as const).map((type) => {
                const isSelected = bindWalletType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBindWalletType(type)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#ef4444] text-gray-900 bg-red-50/30 shadow-xs'
                        : 'border border-gray-200 text-gray-800 bg-white hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Input 1: P***** (Account Name) Container */}
            <div className="flex items-center bg-[#d1d5db]/40 rounded-xl px-3.5 py-3 gap-3 border border-gray-200">
              <User className="w-5 h-5 text-gray-500 stroke-[2]" />
              <input
                type="text"
                value={bindAccountName}
                onChange={(e) => setBindAccountName(e.target.value)}
                placeholder="P*****"
                className="w-full bg-transparent text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-hidden"
              />
            </div>

            {/* Input 2: Account Number Input matching Screenshot 1 */}
            <div className="flex items-center bg-[#d1d5db]/40 rounded-xl px-3.5 py-3 gap-3 border border-gray-200">
              <CreditCard className="w-5 h-5 text-gray-500 stroke-[2]" />
              <input
                type="tel"
                inputMode="numeric"
                value={bindAccountNumber}
                onChange={(e) => setBindAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={`* অনুগ্রহ করে ${bindWalletType} অ্যাকাউন্ট নম্বর পূরণ করুন`}
                className="w-full bg-transparent text-xs sm:text-sm font-bold text-gray-800 placeholder:text-gray-500 placeholder:font-normal focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3: Transaction Password Container matching Screenshot 1 */}
          <div className="flex items-center bg-white rounded-2xl px-4 py-3.5 gap-3 border border-gray-200 shadow-xs">
            <Lock className="w-5 h-5 text-gray-500 stroke-[2]" />
            <input
              type={showBindPass ? 'text' : 'password'}
              value={bindPassword}
              onChange={(e) => setBindPassword(e.target.value)}
              placeholder="* লেনদেন পাসওয়ার্ড"
              className="w-full bg-transparent text-sm font-bold text-gray-800 placeholder:text-gray-500 placeholder:font-normal focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowBindPass(!showBindPass)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              {showBindPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Section 4: Bottom Button: জমা দিন matching Screenshot 1 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!bindAccountNumber.trim() || !bindPassword.trim()}
              className={`w-full py-4 rounded-xl text-center font-bold text-base sm:text-lg tracking-wide transition-all shadow-sm ${
                bindAccountNumber.trim() && bindPassword.trim()
                  ? 'bg-[#0b824c] hover:bg-[#096e40] text-white active:scale-98 cursor-pointer shadow-md'
                  : 'bg-[#d1d5db] text-gray-700 cursor-not-allowed'
              }`}
            >
              জমা দিন
            </button>
          </div>

        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN VIEW: WITHDRAWAL (উত্তোলন) matching Screenshot 2 & 3
  // ---------------------------------------------------------------------------
  return (
    <div 
      id="mobile-withdraw-full-view"
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none animate-in fade-in relative"
    >
      {/* Customer Service Selection Modal */}
      <CustomerServiceModal
        isOpen={isCustomerServiceOpen}
        onClose={() => setIsCustomerServiceOpen(false)}
        onOpenLiveChat={() => {
          setIsCustomerServiceOpen(false);
          setIsLiveChatOpen(true);
        }}
        onOpenSupportTicket={() => {
          setIsCustomerServiceOpen(false);
          if (onOpenSupportTicket) onOpenSupportTicket();
        }}
        showToast={triggerToast}
      />

      {/* 24/7 VIP Live Chat Floating Widget */}
      <LiveChatWidget
        isOpen={isLiveChatOpen}
        language="bn"
        onClose={() => setIsLiveChatOpen(false)}
        onOpenSupportTicket={() => {
          setIsLiveChatOpen(false);
          if (onOpenSupportTicket) onOpenSupportTicket();
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b3323] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 1. TOP HEADER matching Screenshot 2 & 3 */}
      {/* ======================================================================= */}
      <header className="bg-[#0b3323] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <h1 className="text-lg font-bold text-white tracking-wide">
          উত্তোলন
        </h1>

        {/* Right Header Action Icons: Withdrawal Record & Customer Service */}
        <div className="flex items-center gap-3">
          {/* Withdraw Record Icon (Clipboard with downward arrow) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenWithdrawRecord) {
                onOpenWithdrawRecord();
              } else {
                setCurrentView('record');
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="উত্তোলন রেকর্ড"
          >
            <div className="relative">
              <ClipboardList className="w-6 h-6 stroke-[2]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white text-[#0b3323] rounded-full flex items-center justify-center text-[8px] font-black">
                ↓
              </div>
            </div>
          </button>

          {/* 24/7 Customer Service Icon */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCustomerService) {
                onOpenCustomerService();
              } else {
                setIsCustomerServiceOpen(true);
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="কাস্টমার সার্ভিস"
          >
            <div className="relative">
              <Headphones className="w-6 h-6 stroke-[2]" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
            </div>
          </button>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* MAIN BODY CONTENT */}
      {/* ======================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 pb-8 space-y-4 max-w-lg mx-auto w-full">

        {/* --------------------------------------------------------------------- */}
        {/* SECTION: আবদ্ধ E wallet (3/3) & 3-CARD SWIPEABLE CAROUSEL */}
        {/* --------------------------------------------------------------------- */}
        <div className="space-y-3">
          {/* Header row with count and active status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-gray-800">
                আবদ্ধ E wallet ({wallets.length}/3)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                সক্রিয় ওয়ালেট
              </span>
            </div>
            <span className="text-[11px] font-medium text-gray-400">
              সোয়াইপ করুন
            </span>
          </div>

          {/* Quick 1-Tap Wallet Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            {wallets.map((wallet) => {
              const isSelected = selectedWalletId === wallet.id;
              const providerColor = 
                wallet.type === 'Rocket' ? 'text-purple-700' :
                wallet.type === 'Nagad' ? 'text-orange-600' : 'text-pink-600';

              return (
                <button
                  key={wallet.id}
                  type="button"
                  onClick={() => {
                    setSelectedWalletId(wallet.id);
                    triggerToast(`${wallet.type} ওয়ালেট নির্বাচন করা হয়েছে`);
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80 scale-[1.02]' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-gray-300'}`} />
                  <span className={isSelected ? providerColor : ''}>{wallet.type}</span>
                </button>
              );
            })}
          </div>

          {/* 3-Card 1-by-1 Swipeable Horizontal Carousel Container */}
          <div 
            ref={scrollContainerRef}
            className="w-full flex gap-3.5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 pt-0.5 no-scrollbar px-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {wallets.map((wallet) => {
              const isSelected = selectedWalletId === wallet.id;
              
              // Premium luxury gradient theme & textures based on wallet type
              const gradientClass = 
                wallet.type === 'Rocket'
                  ? 'from-[#6c1d73] via-[#8c3494] to-[#38bdf8]'
                  : wallet.type === 'Nagad'
                  ? 'from-[#c2410c] via-[#ea580c] to-[#eab308]'
                  : 'from-[#be185d] via-[#db2777] to-[#f43f5e]';

              const logoUrl = WALLET_LOGOS[wallet.type as keyof typeof WALLET_LOGOS] || WALLET_LOGOS.rocket;

              return (
                <div
                  key={wallet.id}
                  onClick={() => {
                    setSelectedWalletId(wallet.id);
                    triggerToast(`${wallet.type} ওয়ালেট নির্বাচন করা হয়েছে`);
                  }}
                  className={`w-full min-w-full snap-center relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${gradientClass} text-white shadow-xl cursor-pointer transition-all duration-200 active:scale-[0.99] border ${
                    isSelected 
                      ? 'border-white/80 ring-3 ring-[#0b824c] ring-offset-2 ring-offset-white shadow-2xl scale-[1.00]' 
                      : 'border-white/20 opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Luxury Background Shimmer Pattern & Wave */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)] pointer-events-none" />
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 opacity-15 pointer-events-none">
                    <Wallet className="w-full h-full text-white stroke-[1.5]" />
                  </div>

                  {/* Top Bar: Brand Badge, Chip Graphic, and Radio Selector */}
                  <div className="relative z-10 flex items-center justify-between">
                    {/* Brand Badge & Type */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white p-1 shadow-md flex items-center justify-center overflow-hidden border border-white/40">
                        <img 
                          src={logoUrl} 
                          alt={wallet.type} 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="font-black text-base sm:text-lg tracking-wide drop-shadow-xs leading-none">
                          {wallet.type}
                        </div>
                        <span className="text-[10px] text-white/80 font-semibold">
                          E-Wallet
                        </span>
                      </div>
                    </div>

                    {/* Radio Select Pill */}
                    <div className="flex items-center gap-1.5">
                      {wallet.isDefault && (
                        <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          ডিফল্ট
                        </span>
                      )}
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-[#0b824c] border-white shadow-md text-white' 
                          : 'border-white/60 bg-black/20 hover:border-white'
                      }`}>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: EMV Metallic Chip Graphic */}
                  <div className="relative z-10 my-3 flex items-center justify-between">
                    {/* Realistic Gold EMV Smart Chip */}
                    <div className="w-9 h-7 rounded-md bg-gradient-to-br from-[#f6d365] via-[#fda085] to-[#f6d365] border border-amber-300/80 p-0.5 shadow-sm flex flex-col justify-between overflow-hidden">
                      <div className="h-[1px] w-full bg-amber-900/30" />
                      <div className="flex justify-between px-0.5">
                        <div className="w-1.5 h-3 border border-amber-900/40 rounded-xs" />
                        <div className="w-1.5 h-3 border border-amber-900/40 rounded-xs" />
                      </div>
                      <div className="h-[1px] w-full bg-amber-900/30" />
                    </div>

                    {/* Contactless Wi-Fi Waves */}
                    <div className="text-white/70 rotate-90 scale-75">
                      <div className="w-4 h-4 border-r-2 border-white/60 rounded-full" />
                    </div>
                  </div>

                  {/* Account Number & Timestamp Details */}
                  <div className="relative z-10 space-y-1">
                    {/* Account Number Display */}
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white drop-shadow-md">
                        {getMaskedNumber(wallet.accountNumber)}
                      </div>

                      {/* Tap to Select Indicator */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected 
                          ? 'bg-white/20 text-white backdrop-blur-xs' 
                          : 'bg-black/20 text-white/80'
                      }`}>
                        {isSelected ? '✓ নির্বাচিত' : 'ট্যাপ করুন'}
                      </span>
                    </div>

                    {/* Account Name & Timestamp */}
                    <div className="flex items-center justify-between text-[11px] text-white/90 font-medium font-mono pt-1 border-t border-white/20">
                      <span>{wallet.accountName}</span>
                      <span>{wallet.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5">
            {wallets.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => setSelectedWalletId(wallet.id)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedWalletId === wallet.id
                    ? 'w-6 bg-[#0b824c]'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                title={`Select ${wallet.type}`}
              />
            ))}
          </div>

          {/* ======================================================================= */}
          {/* WALLET ADD OPTION BELOW CARD SECTION */}
          {/* ======================================================================= */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setCurrentView('bind_wallet')}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-red-400/90 bg-gradient-to-r from-red-50/90 via-pink-50/50 to-amber-50/40 hover:from-red-100/90 hover:to-amber-100/70 text-gray-800 flex items-center justify-between shadow-xs hover:shadow-sm active:scale-[0.99] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                {/* 3D Plus Icon Badge */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ef4444] to-[#b91c1c] text-white flex items-center justify-center shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>

                <div className="text-left">
                  <div className="text-xs sm:text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <span>নতুন E-Wallet যুক্ত করুন</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-600">
                      +{wallets.length}/3
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    bKash, Nagad, Rocket অ্যাকাউন্ট বাঁধুন
                  </div>
                </div>
              </div>

              {/* Right Action Indicator */}
              <div className="flex items-center gap-1 text-red-600 font-bold text-xs">
                <span>যোগ করুন</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SECTION: NOTICE TEXT BLOCK matching Screenshot 2 & 3 */}
        {/* --------------------------------------------------------------------- */}
        <div className="space-y-2 pt-1">
          <div className="text-xs text-gray-500 font-medium">
            উত্তোলন সময়: <span className="font-bold text-gray-700">24 ঘন্টা</span>
          </div>

          <div className="space-y-2 text-xs sm:text-[13px] text-gray-900 leading-relaxed">
            <p className="font-black text-sm">
              প্রিয় সদস্য, শুভেচ্ছা! 😊
            </p>

            <p className="font-extrabold text-gray-900">
              আপনার <span className="text-[#0b824c] font-black">BengalBet</span> অ্যাকাউন্ট থেকে টাকা উত্তোলনের আগে দয়া করে নিশ্চিত করুন যে আপনার ওয়ালেট (<span className="text-[#ef4444] font-black">bKash, Nagad, Rocket</span> ইত্যাদি) সঠিকভাবে সংযুক্ত আছে 💸
            </p>

            <p className="font-bold text-gray-900">
              ভুল ওয়ালেট তথ্যের কারণে টাকা ট্রান্সফারে দেরি বা ব্যর্থতা হতে পারে। ⚠️
            </p>

            <p className="font-bold text-gray-900">
              🔍 অনুগ্রহ করে আবার যাচাই করুন এবং নিরাপদে আপনার উত্তোলন সম্পন্ন করুন। ধন্যবাদ! 🙏
            </p>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SECTION: STATS & BALANCE DISPLAY matching Screenshot 3 */}
        {/* --------------------------------------------------------------------- */}
        <div className="space-y-1.5 pt-2 text-xs sm:text-[13px] text-gray-600 font-medium">
          <div>
            দৈনিক উত্তোলন 15 (বার), অবশিষ্ট উত্তোলন 15 (বার)
          </div>
          <div>
            প্রধান ওয়ালেট :৳ {userBalance.toFixed(2)}
          </div>
          <div>
            উপলব্ধ পরিমাণ : ৳ {userBalance.toFixed(2)}
          </div>

          {/* Light Blue Pill Refresh Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleRefreshBalance}
              className="w-full py-2.5 px-4 rounded-xl bg-[#dbeafe] hover:bg-[#bfdbfe] text-[#2563eb] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>আপনার ব্যালেন্স রিফ্রেশ করুন</span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SECTION: TURNOVER STATUS (Matching Desktop View Turnover System)      */}
        {/* --------------------------------------------------------------------- */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="text-xs sm:text-sm font-bold text-gray-800">
              উত্তোলনের জন্য প্রাথমিক পরিমাণ সম্পূর্ণ করুন।
            </div>
            {remainingTurnover === 0 && (
              <button
                type="button"
                onClick={handleResetTurnover}
                className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer"
                title="পুনরায় পরীক্ষা করুন"
              >
                রিসেট
              </button>
            )}
          </div>

          {remainingTurnover > 0 ? (
            <div className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 flex items-start gap-2 leading-snug">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>অপূর্ণ প্রয়োজনীয় টার্নওভার আছে, উত্তোলনের অনুরোধ অনুমোদিত হতে পারে না।</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>টার্নওভার ১০০% সম্পূর্ণ! আপনি এখন উত্তোলন করতে পারেন।</span>
            </div>
          )}

          {/* Turnover Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200 text-xs">
            <div className="grid grid-cols-2 bg-[#f0f2f5] text-[11px] font-bold text-gray-600 py-2 px-3">
              <div>খেলার ধরন</div>
              <div className="text-right">অবশিষ্ট টার্নওভার</div>
            </div>
            <div className="grid grid-cols-2 bg-white text-xs py-2.5 px-3 border-t border-gray-100 items-center">
              <div className="font-semibold text-gray-800">স্লট বা মাছ</div>
              <div className={`text-right font-mono font-bold ${remainingTurnover > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {remainingTurnover.toFixed(2)} BDT
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------------- */}
        {/* SECTION: WITHDRAWAL FORM (AMOUNT & SUBMIT) - SHOWN AFTER TURNOVER COMPLETE */}
        {/* --------------------------------------------------------------------- */}
        {remainingTurnover === 0 ? (
          <form onSubmit={handleWithdrawSubmit} className="space-y-3 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                উত্তোলন পরিমান:
              </h3>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>উত্তোলন আনলক হয়েছে</span>
              </span>
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="grid grid-cols-5 gap-1.5">
              {[500, 1000, 2000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setWithdrawAmount(amt.toString())}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                    withdrawAmount === amt.toString()
                      ? 'bg-red-50 border-red-500 text-red-600 font-extrabold shadow-2xs'
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Box 1: পরিমাণ & Input 100 ~ 25,000 */}
            <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
              <span className="text-xs sm:text-sm font-bold text-gray-900 w-24 shrink-0">
                পরিমাণ
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="100 ~ 25,000"
                className="w-full bg-transparent text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
              />
              {withdrawAmount && (
                <button
                  type="button"
                  onClick={() => setWithdrawAmount('')}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Box 2: লেনদেন পাসওয়ার্ড & Input Password with Eye Toggle */}
            <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
              <span className="text-xs sm:text-sm font-bold text-gray-900 w-28 shrink-0">
                লেনদেন পাসওয়ার্ড
              </span>
              <input
                type={showWithdrawPass ? 'text' : 'password'}
                value={withdrawPassword}
                onChange={(e) => setWithdrawPassword(e.target.value)}
                placeholder="লেনদেন পাসওয়ার্ড (123456)"
                className="w-full bg-transparent text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowWithdrawPass(!showWithdrawPass)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                {showWithdrawPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Bottom Submit Button: জমা দিন */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !isValidWithdraw}
                className={`w-full py-3.5 rounded-xl text-center font-black text-base sm:text-lg tracking-wide transition-all shadow-md ${
                  isValidWithdraw && !isSubmitting
                    ? 'bg-[#0b824c] hover:bg-[#096e40] text-white active:scale-98 cursor-pointer'
                    : 'bg-[#cbd5e1] text-white/90 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>প্রক্রিয়াধীন...</span>
                  </div>
                ) : (
                  <span>জমা দিন</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 text-center space-y-2 text-gray-500 text-xs">
            <div className="w-9 h-9 rounded-full bg-gray-200/80 text-gray-600 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <p className="font-bold text-gray-800 text-xs sm:text-sm">
              উত্তোলনের পরিমাণ ও সাবমিট ফর্ম লক করা আছে
            </p>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
              উত্তোলন করতে অনুগ্রহ করে উপরের <span className="font-bold text-emerald-700">"টার্নওভার সম্পূর্ণ করুন"</span> বাটনে ক্লিক করুন।
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
