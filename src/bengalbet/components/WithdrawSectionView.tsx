// @ts-nocheck
import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Info, 
  Check, 
  Trash2, 
  Edit3, 
  Plus, 
  Clock, 
  ShieldCheck, 
  ChevronDown,
  X,
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { api } from '../services/api';

interface RegisteredWallet {
  id: string;
  type: 'Rocket' | 'Nagad' | 'BKash';
  accountName: string;
  accountNumber: string;
  createdAt: string;
  isDefault: boolean;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  walletType: string;
  accountNumber: string;
  date: string;
  status: 'pending' | 'success' | 'processing';
}

interface WithdrawSectionViewProps {
  user?: UserAccount;
  onWithdrawSuccess?: (amount: number) => void;
}

export const WithdrawSectionView: React.FC<WithdrawSectionViewProps> = ({
  user,
  onWithdrawSuccess
}) => {
  // Top Tabs: 'withdraw' (উত্তোলন) | 'account_mgmt' (অ্যাকাউন্ট ব্যবস্থাপনা)
  const [activeTab, setActiveTab] = useState<'withdraw' | 'account_mgmt'>('withdraw');

  // Withdrawal guidelines modal
  const [showGuidelines, setShowGuidelines] = useState(false);

  // Registered Wallets State (pre-populated with sample data for Rocket, Nagad, bKash)
  const [registeredWallets, setRegisteredWallets] = useState<RegisteredWallet[]>([
    {
      id: 'w-1',
      type: 'Rocket',
      accountName: 'BDT_King88',
      accountNumber: '01766800076',
      createdAt: '2026-08-30 00:59:50',
      isDefault: true
    },
    {
      id: 'w-2',
      type: 'Nagad',
      accountName: 'BDT_King88',
      accountNumber: '01822334455',
      createdAt: '2026-08-29 18:40:12',
      isDefault: false
    },
    {
      id: 'w-3',
      type: 'BKash',
      accountName: 'BDT_King88',
      accountNumber: '01911223344',
      createdAt: '2026-08-28 14:15:30',
      isDefault: false
    }
  ]);

  React.useEffect(() => {
    api.wallet.getCards().then(res => {
      if (res.success && res.wallets && res.wallets.length > 0) {
        setRegisteredWallets(res.wallets.map(w => ({
          id: w.id,
          type: w.type as any,
          accountName: w.accountName,
          accountNumber: w.fullNumber || w.accountNumber,
          createdAt: w.createdAt,
          isDefault: w.isDefault
        })));
        setSelectedWalletId(res.wallets[0].id);
      }
    }).catch(err => console.warn('Could not fetch backend cards:', err));

    api.wallet.getTransactions('withdraw').then(res => {
      if (res.success && Array.isArray(res.transactions)) {
        setRecentWithdrawals(res.transactions.map((t: any) => ({
          id: t.id || t.trxId,
          amount: Number(t.amount || 0),
          walletType: t.channel === 'nagad' ? 'Nagad' : t.channel === 'bkash' ? 'BKash' : 'Rocket',
          accountNumber: t.accountNumber || '017XXXXXXXX',
          date: (t.createdAt || '').slice(5, 16),
          status: t.status === 'success' ? 'success' : 'processing'
        })));
      }
    }).catch(err => console.warn('Could not fetch recent withdrawals:', err));
  }, []);

  const [selectedWalletId, setSelectedWalletId] = useState<string>('w-1');

  // Turnover State (Remaining turnover required before withdraw)
  const [remainingTurnover, setRemainingTurnover] = useState<number>(0);
  const loadTurnover = React.useCallback(() => {
    api.wallet.getTurnover().then(r => { if (r && typeof r.remaining === 'number') setRemainingTurnover(r.remaining); }).catch(() => {});
  }, []);
  React.useEffect(() => { loadTurnover(); }, [loadTurnover]);

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawPass, setWithdrawPass] = useState<string>('');
  const [showWithdrawPass, setShowWithdrawPass] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Recent Withdrawals Records State (Loaded strictly from REST API)
  const [recentWithdrawals, setRecentWithdrawals] = useState<WithdrawalRecord[]>([]);

  // Account Management Form State
  const [mgmtAccountName, setMgmtAccountName] = useState<string>('P*****');
  const [mgmtWalletType, setMgmtWalletType] = useState<'Rocket' | 'Nagad' | 'BKash'>('Rocket');
  const [mgmtWalletNumber, setMgmtWalletNumber] = useState<string>('01766800076');
  const [mgmtTxPassword, setMgmtTxPassword] = useState<string>('123456');
  const [mgmtConfirmPassword, setMgmtConfirmPassword] = useState<string>('123456');
  const [showMgmtPassword, setShowMgmtPassword] = useState<boolean>(false);
  const [mgmtSuccessMsg, setMgmtSuccessMsg] = useState<string | null>(null);

  // Selected wallet object
  const activeWallet = registeredWallets.find(w => w.id === selectedWalletId) || registeredWallets[0];

  // Mask wallet number helper
  const maskNumber = (num: string) => {
    if (!num || num.length < 4) return num;
    const last4 = num.slice(-4);
    return `********${last4}`;
  };

  // Quick Amount preset buttons
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  // Handle Quick Turnover Completion (Interactive Simulation for user)
  const handleCompleteTurnover = () => {
    loadTurnover();
    confetti({ particleCount: 50, spread: 60 });
  };

  // Handle Add/Save Wallet in Account Management
  const handleSaveWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mgmtWalletNumber || mgmtWalletNumber.length < 10) {
      alert('সঠিক মোবাইল নম্বর প্রদান করুন');
      return;
    }
    if (!mgmtTxPassword || mgmtTxPassword.length < 6) {
      alert('লেনদেন পাসওয়ার্ড নূন্যতম ৬ সংখ্যার হতে হবে');
      return;
    }
    if (mgmtTxPassword !== mgmtConfirmPassword) {
      alert('পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    try {
      const res = await api.wallet.addCard(mgmtWalletType, mgmtAccountName || 'সদস্য', mgmtWalletNumber);
      if (res.success && res.wallet) {
        const newWallet: RegisteredWallet = {
          id: res.wallet.id,
          type: res.wallet.type,
          accountName: res.wallet.accountName,
          accountNumber: res.wallet.fullNumber || res.wallet.accountNumber,
          createdAt: res.wallet.createdAt,
          isDefault: registeredWallets.length === 0
        };
        setRegisteredWallets(prev => [newWallet, ...prev.slice(0, 2)]);
        setSelectedWalletId(newWallet.id);
        setMgmtSuccessMsg('ই-ওয়ালেট সফলভাবে সংরক্ষণ করা হয়েছে!');
        setTimeout(() => setMgmtSuccessMsg(null), 3000);
      } else {
        alert(res.message || 'ওয়ালেট সংরক্ষণ করা সম্ভব হয়নি।');
      }
    } catch (err: any) {
      alert(err.message || 'ই-ওয়ালেট সংরক্ষণ করা সম্ভব হয়নি। ডাটাবেস সার্ভারে সংযোগ চেক করুন।');
    }
  };

  // Handle Delete Wallet
  const handleDeleteWallet = async (id: string) => {
    try {
      await api.wallet.deleteCard(id);
    } catch {}
    setRegisteredWallets(prev => prev.filter(w => w.id !== id));
    if (selectedWalletId === id) {
      const remaining = registeredWallets.filter(w => w.id !== id);
      if (remaining.length > 0) setSelectedWalletId(remaining[0].id);
    }
  };

  // Handle Withdrawal Submission
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (registeredWallets.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'অনুগ্রহ করে প্রথমে অ্যাকাউন্ট ব্যবস্থাপনা থেকে একটি ই-ওয়ালেট যোগ করুন।'
      });
      return;
    }

    if (remainingTurnover > 0) {
      setStatusMessage({
        type: 'error',
        text: `অপূর্ণ প্রয়োজনীয় টার্নওভার আছে (${remainingTurnover.toFixed(2)} BDT), উত্তোলনের অনুরোধ অনুমোদিত হতে পারে না।`
      });
      return;
    }

    const amt = parseFloat(withdrawAmount);
    if (!amt || isNaN(amt) || amt < 500) {
      setStatusMessage({
        type: 'error',
        text: 'নূন্যতম উত্তোলনের পরিমাণ ৫০০ BDT।'
      });
      return;
    }

    const currentBalance = user?.balance ?? 5000;
    if (amt > currentBalance) {
      setStatusMessage({
        type: 'error',
        text: `পর্যাপ্ত ব্যালেন্স নেই! আপনার কেন্দ্রীয় ওয়ালেট ব্যালেন্স ৳ ${currentBalance.toFixed(2)}`
      });
      return;
    }

    if (!withdrawPass) {
      setStatusMessage({
        type: 'error',
        text: 'অনুগ্রহ করে আপনার লেনদেন পাসওয়ার্ড প্রদান করুন।'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.wallet.withdraw(amt, activeWallet?.type || 'Rocket', activeWallet?.accountNumber || user?.phone || '');
      setIsProcessing(false);

      const newRecord: WithdrawalRecord = {
        id: res.transaction?.id || `W${Date.now().toString().slice(-8)}`,
        amount: amt,
        walletType: activeWallet?.type || 'Rocket',
        accountNumber: activeWallet?.accountNumber || '01766800076',
        date: new Date().toLocaleDateString('bn-BD', { month: '2-digit', day: '2-digit' }),
        status: 'processing'
      };

      setRecentWithdrawals(prev => [newRecord, ...prev]);
      setStatusMessage({
        type: 'success',
        text: res.message || `৳ ${amt.toLocaleString()} উত্তোলনের অনুরোধ সফলভাবে জমা হয়েছে!`
      });
      setWithdrawAmount('');
      setWithdrawPass('');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onWithdrawSuccess) {
        onWithdrawSuccess(amt);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'উত্তোলন প্রক্রিয়া ব্যর্থ হয়েছে। ডাটাবেস সার্ভার সংযোগ চেক করুন।'
      });
    }
  };

  const userBalance = user?.balance ?? 5000;
  const parsedWithdrawAmount = parseFloat(withdrawAmount) || 0;

  // Card gradient depending on wallet type
  const getCardGradient = (type?: string) => {
    switch(type) {
      case 'BKash':
        return 'from-[#be123c] via-[#e11d48] to-[#f43f5e]';
      case 'Nagad':
        return 'from-[#ea580c] via-[#f97316] to-[#fb923c]';
      case 'Rocket':
      default:
        return 'from-[#7487f7] via-[#5dbdf2] to-[#1fe3be]';
    }
  };

  return (
    <main className="flex-1 bg-white flex flex-col overflow-hidden text-gray-800 font-bengali select-none">
      
      {/* ========================================================================= */}
      {/* TOP TAB BAR (উত্তোলন | অ্যাকাউন্ট ব্যবস্থাপনা | প্রত্যাহারের নির্দেশিকা) */}
      {/* ========================================================================= */}
      <div className="border-b border-gray-200 px-4 sm:px-6 pt-3 flex items-center justify-between bg-white shrink-0">
        {/* Main Tabs */}
        <div className="flex items-center gap-8 sm:gap-10">
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'withdraw'
                ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            উত্তোলন
          </button>

          <button
            onClick={() => setActiveTab('account_mgmt')}
            className={`pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
              activeTab === 'account_mgmt'
                ? 'text-red-600 font-extrabold border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            অ্যাকাউন্ট ব্যবস্থাপনা
          </button>
        </div>

        {/* Top Right: ℹ️ প্রত্যাহারের নির্দেশিকা (Matching Capture.PNG / Capture5.PNG) */}
        <button
          onClick={() => setShowGuidelines(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-full text-xs font-bold transition-colors cursor-pointer mb-2"
        >
          <Info className="w-3.5 h-3.5" />
          <span>প্রত্যাহারের নির্দেশিকা</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB CONTENT 1: উত্তোলন (WITHDRAWAL VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'withdraw' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT & CENTER COLUMN (9 Cols on LG) */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* LEFT SUB-COLUMN: E-wallet card & Amount Input (6 Cols on MD) */}
            <div className="md:col-span-6 flex flex-col space-y-4">
              
              {/* Top Card Selector Pill matching Capture.PNG [ 💳 E wallet ] + Green Edit Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {registeredWallets.map((wallet) => {
                    const isSelected = wallet.id === selectedWalletId;
                    return (
                      <button
                        key={wallet.id}
                        type="button"
                        onClick={() => setSelectedWalletId(wallet.id)}
                        className={`px-3 py-1.5 rounded-lg border-2 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50 text-gray-900 shadow-xs ring-1 ring-pink-400'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="w-5 h-5 rounded-md bg-white p-0.5 shadow-2xs flex items-center justify-center overflow-hidden shrink-0">
                          <img 
                            src={WALLET_LOGOS[wallet.type]} 
                            alt={wallet.type} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span>{wallet.type}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveTab('account_mgmt')}
                  className="w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer shrink-0"
                  title="ওয়ালেট ব্যবস্থাপনা"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Graphic */}
              {activeWallet ? (
                /* Bound Card (Matching Capture3.PNG - Cyan / Brand Gradient Card) */
                <div className={`relative w-full h-40 sm:h-44 rounded-2xl p-4 sm:p-5 text-white shadow-lg overflow-hidden bg-gradient-to-br ${getCardGradient(activeWallet.type)} flex flex-col justify-between group transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white p-1 shadow-md flex items-center justify-center overflow-hidden">
                        <img 
                          src={WALLET_LOGOS[activeWallet.type]} 
                          alt={activeWallet.type} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                        {activeWallet.type}
                      </span>
                    </div>
                    <span className="text-[11px] bg-white/25 px-2 py-0.5 rounded-full font-mono font-semibold">
                      নিবন্ধিত
                    </span>
                  </div>

                  <div className="font-mono text-base sm:text-lg font-extrabold tracking-widest text-white/95 drop-shadow-xs">
                    {maskNumber(activeWallet.accountNumber)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-white/85">
                    <span>{activeWallet.createdAt}</span>
                    <span className="font-sans font-bold">{activeWallet.accountName}</span>
                  </div>

                  {/* Red active dot indicator matching Capture3.PNG */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-red-500 shadow-xs" />
                </div>
              ) : (
                /* Empty Card (Matching Capture.PNG - Gray Card with + Button) */
                <div className="w-full h-40 sm:h-44 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-12 rounded-lg bg-gray-200/80 mb-2 flex items-center justify-center text-gray-400">
                    <CreditCard className="w-8 h-8 opacity-60" />
                  </div>
                  <div className="text-xs font-bold text-gray-500 mb-2">খালি ই-ওয়ালেট</div>
                  <button
                    onClick={() => setActiveTab('account_mgmt')}
                    className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ওয়ালেট যোগ করুন</span>
                  </button>
                </div>
              )}

              {/* Wallet Balances (Matching Capture.PNG) */}
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">কেন্দ্রীয় ওয়ালেট :</span>
                  <span className="font-mono font-extrabold text-blue-600 text-sm">
                    {userBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-semibold">প্রাপ্ত পরিমাণ :</span>
                  <span className="font-mono font-extrabold text-gray-900 text-sm">
                    {parsedWithdrawAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Withdrawal Amount Input & Quick Chips */}
              <form onSubmit={handleWithdrawSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    উত্তোলনের পরিমাণ (BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">৳</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="নূন্যতম ৫০০"
                      className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                </div>

                {/* Quick amount buttons */}
                <div className="grid grid-cols-5 gap-1">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className={`py-1 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                        withdrawAmount === amt.toString()
                          ? 'bg-red-50 border-red-500 text-red-600 font-extrabold'
                          : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>

                {/* Transaction Password Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    লেনদেন পাসওয়ার্ড
                  </label>
                  <div className="relative">
                    <input
                      type={showWithdrawPass ? 'text' : 'password'}
                      value={withdrawPass}
                      onChange={(e) => setWithdrawPass(e.target.value)}
                      placeholder="৬ সংখ্যার লেনদেন পাসওয়ার্ড (123456)"
                      className="w-full px-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWithdrawPass(!showWithdrawPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showWithdrawPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Status Message Alert */}
                {statusMessage && (
                  <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span className="font-medium">{statusMessage.text}</span>
                  </div>
                )}

                {/* Submit Action Button matching Capture.PNG [ OK ] */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-full bg-[#f5222d] hover:bg-red-700 active:scale-95 disabled:opacity-50 text-white text-sm font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>প্রক্রিয়াকরণ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>OK</span>
                  )}
                </button>
              </form>

            </div>

            {/* CENTER SUB-COLUMN: Instructions & Turnover Requirements (6 Cols on MD) */}
            <div className="md:col-span-6 flex flex-col space-y-4">
              
              {/* Peach/Warm Info Card matching Capture.PNG */}
              <div className="bg-[#fff3e8] border border-[#fedec2] rounded-2xl p-4 sm:p-5 text-gray-800 space-y-2.5 shadow-2xs">
                <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#ffe0c4] text-[#d4560a] text-[11px] font-bold">
                  উত্তোলন সময়: <span className="font-extrabold">24 ঘণ্টা</span>
                </div>

                <div className="text-xs leading-relaxed space-y-2 text-gray-800">
                  <p className="font-bold text-gray-900">
                    প্রিয় সদস্য, শুভেচ্ছা! 😊
                  </p>
                  <p>
                    আপনার <span className="font-bold text-emerald-700 font-mono">BengalBet</span> অ্যাকাউন্ট থেকে টাকা উত্তোলনের আগে দয়া করে নিশ্চিত করুন যে আপনার ওয়ালেট (<span className="text-red-600 font-bold">bKash, Nagad, Rocket</span> ইত্যাদি) সঠিকভাবে সংযুক্ত আছে 💸
                  </p>
                  <p>
                    ভুল ওয়ালেট তথ্যের কারণে টাকা ট্রান্সফারে দেরি বা ব্যর্থতা হতে পারে। ⚠️
                  </p>
                  <p>
                    🔍 অনুগ্রহ করে আবার যাচাই করুন এবং নিরাপদে আপনার উত্তোলন সম্পন্ন করুন। ধন্যবাদ! 🙏
                  </p>
                </div>
              </div>

              {/* Turnover Status Section matching Capture.PNG */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3 shadow-2xs">
                <div className="text-xs font-bold text-gray-700">
                  উত্তোলনের জন্য প্রাথমিক পরিমাণ কমপূর্ণ করুন।
                </div>

                {remainingTurnover > 0 ? (
                  <div className="text-xs font-bold text-red-600 leading-snug">
                    অপূর্ণ প্রয়োজনীয় টার্নওভার আছে, উত্তোলনের অনুরোধ অনুমোদিত হতে পারে না।
                  </div>
                ) : (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>টার্নওভার ১০০% সম্পূর্ণ! আপনি এখন উত্তোলন করতে পারেন।</span>
                  </div>
                )}

                {/* Turnover Table */}
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <div className="grid grid-cols-2 bg-[#f0f2f5] text-[11px] font-bold text-gray-600 py-1.5 px-3">
                    <div>খেলার ধরন</div>
                    <div className="text-right">অবশিষ্ট টার্নওভার</div>
                  </div>
                  <div className="grid grid-cols-2 bg-white text-xs py-2 px-3 border-t border-gray-100">
                    <div className="font-semibold text-gray-800">স্লট বা মাছ</div>
                    <div className="text-right font-mono font-bold text-red-600">
                      {remainingTurnover.toFixed(2)}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: সাম্প্রতিক উত্তোলন (Recent Withdrawals - 4 Cols on LG) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                সাম্প্রতিক উত্তোলন
              </h3>
            </div>

            <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-4 min-h-[300px] flex flex-col items-center justify-start">
              {recentWithdrawals.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center text-center space-y-3 my-auto">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-gray-300">
                    <CreditCard className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-medium text-gray-400">
                    উত্তোলনের অনুরোধ পাওয়া যায়নি
                  </div>
                  <span className="px-4 py-0.5 rounded-full bg-white border border-gray-200 text-gray-400 text-[11px] font-semibold">
                    ফাঁকা
                  </span>
                </div>
              ) : (
                /* List of recent withdrawal transactions */
                <div className="w-full space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
                  {recentWithdrawals.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-white p-0.5 shadow-2xs flex items-center justify-center overflow-hidden">
                            <img 
                              src={(WALLET_LOGOS as Record<string, string>)[item.walletType] || WALLET_LOGOS.Rocket} 
                              alt={item.walletType} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-gray-500">{item.id}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status === 'processing' ? 'প্রক্রিয়াকরণ' : 'সফল'}</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-gray-800">{item.walletType} ({maskNumber(item.accountNumber)})</span>
                        <span className="font-mono text-red-600 text-sm">৳ {item.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono text-right">
                        {item.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT 2: অ্যাকাউন্ট ব্যবস্থাপনা (ACCOUNT MANAGEMENT VIEW) */}
      {/* ========================================================================= */}
      {activeTab === 'account_mgmt' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT FORM (5 Cols on LG - matching Capture5.PNG / Capture3.PNG) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6">
            
            {/* E-wallet pill selector */}
            <div className="inline-block">
              <div className="px-4 py-1 rounded-lg border border-red-500 text-red-600 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs">
                <span>ই-ওয়ালেট</span>
              </div>
            </div>

            <form onSubmit={handleSaveWallet} className="space-y-3.5 text-xs">
              
              {/* ই-ওয়ালেট Dropdown */}
              <div className="flex items-center gap-3">
                <label className="w-24 text-gray-700 font-bold shrink-0">ই-ওয়ালেট :</label>
                <div className="flex-1 relative">
                  <select className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-semibold appearance-none focus:outline-none focus:border-red-500">
                    <option>E wallet (Rocket / Nagad / bKash)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* কার্ডের নাম */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <label className="w-24 text-gray-700 font-bold shrink-0">কার্ডের নাম :</label>
                  <input
                    type="text"
                    value={mgmtAccountName}
                    onChange={(e) => setMgmtAccountName(e.target.value)}
                    placeholder="প্রাপ্তি কারীর পূর্ণ নাম প্রবেশ করুন"
                    className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:border-red-500"
                  />
                </div>
                {/* Red warning note matching Capture4.PNG */}
                <div className="pl-24 text-[10px] text-red-600 font-semibold leading-tight">
                  আপনার আপলোড করা জাতীয় পরিচয়পত্রের সাথে সামঞ্জস্যপূর্ণ নামটি পূরণ করতে ভুলবেন না, অন্যথায় প্রত্যাহার ব্যর্থ হতে পারে।
                </div>
              </div>

              {/* ই-ওয়ালেট প্রকার (Rocket | Nagad | BKash) with Official Logos */}
              <div className="flex items-start gap-3 pt-1">
                <label className="w-24 text-gray-700 font-bold shrink-0 mt-1.5">ই-ওয়ালেট প্রকার :</label>
                <div className="flex-1 flex flex-col gap-1.5">
                  {(['Rocket', 'Nagad', 'BKash'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMgmtWalletType(type)}
                      className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-colors border flex items-center justify-between cursor-pointer ${
                        mgmtWalletType === type
                          ? 'border-red-500 text-red-600 bg-red-50/40 shadow-2xs ring-1 ring-red-400'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded bg-white p-0.5 shadow-2xs flex items-center justify-center overflow-hidden">
                          <img 
                            src={WALLET_LOGOS[type]} 
                            alt={type} 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span>{type}</span>
                      </div>
                      {mgmtWalletType === type && <Check className="w-4 h-4 text-red-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* ওয়ালেট ঠিকানা */}
              <div className="flex items-center gap-3">
                <label className="w-24 text-gray-700 font-bold shrink-0">ওয়ালেট ঠিকানা :</label>
                <input
                  type="text"
                  value={mgmtWalletNumber}
                  onChange={(e) => setMgmtWalletNumber(e.target.value)}
                  placeholder={`অনুগ্রহ করে ${mgmtWalletType} অ্যাকাউন্ট নম্বর পূরণ করুন`}
                  className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-gray-800 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* আপনার লেন-দেন পাসওয়ার্ড সেট করুন */}
              <div className="pt-2">
                <div className="text-red-600 font-bold text-xs mb-2">
                  আপনার লেন-দেন পাসওয়ার্ড সেট করুন।
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-gray-700 font-bold shrink-0">লেনদেন পাসওয়ার্ড :</label>
                    <div className="flex-1 relative">
                      <input
                        type={showMgmtPassword ? 'text' : 'password'}
                        value={mgmtTxPassword}
                        onChange={(e) => setMgmtTxPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMgmtPassword(!showMgmtPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showMgmtPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-24 text-gray-700 font-bold shrink-0">পাসওয়ার্ড নিশ্চিত করুন :</label>
                    <div className="flex-1 relative">
                      <input
                        type={showMgmtPassword ? 'text' : 'password'}
                        value={mgmtConfirmPassword}
                        onChange={(e) => setMgmtConfirmPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3 pr-8 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMgmtPassword(!showMgmtPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showMgmtPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {mgmtSuccessMsg && (
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{mgmtSuccessMsg}</span>
                </div>
              )}

              {/* Submit Button matching Capture3.PNG [ জমা দিন ] */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  জমা দিন
                </button>
              </div>

            </form>

          </div>

          {/* MIDDLE: নিবন্ধিত ই-ওয়ালেট (4 Cols on LG - matching Capture5.PNG) */}
          <div className="lg:col-span-4 flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-red-600 rounded-full" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                নিবন্ধিত ই-ওয়ালেট ({registeredWallets.length}/3)
              </h3>
            </div>

            <div className="space-y-3">
              {registeredWallets.length === 0 ? (
                /* Empty state matching Capture4.PNG */
                <div className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-14 h-10 rounded-lg bg-gray-200/80 mb-2 flex items-center justify-center text-gray-400">
                    <CreditCard className="w-6 h-6 opacity-60" />
                  </div>
                  <div className="text-xs font-bold text-gray-400">খালি ই-ওয়ালেট</div>
                </div>
              ) : (
                registeredWallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    onClick={() => setSelectedWalletId(wallet.id)}
                    className={`relative rounded-2xl p-3.5 bg-[#fff3e8] border transition-all cursor-pointer flex items-center justify-between ${
                      selectedWalletId === wallet.id
                        ? 'border-red-500 shadow-sm ring-1 ring-red-400'
                        : 'border-[#fedec2] hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white p-1 shadow-xs border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img 
                          src={WALLET_LOGOS[wallet.type]} 
                          alt={wallet.type} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-gray-900">{wallet.type}</span>
                          {wallet.isDefault && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-100 text-red-600 font-bold">ডিফল্ট</span>
                          )}
                        </div>
                        <div className="font-mono text-xs font-extrabold text-gray-800">{maskNumber(wallet.accountNumber)}</div>
                        <div className="font-mono text-[10px] text-gray-400">{wallet.createdAt}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWallet(wallet.id);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* RIGHT: সাম্প্রতিক উত্তোলন (3 Cols on LG) */}
          <div className="lg:col-span-3 flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <h3 className="font-bold text-xs sm:text-sm text-gray-900">
                সাম্প্রতিক উত্তোলন
              </h3>
            </div>

            <div className="bg-gray-50/70 border border-gray-200 rounded-2xl p-3 max-h-[380px] overflow-y-auto space-y-2">
              {recentWithdrawals.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-white p-0.5 shadow-2xs flex items-center justify-center overflow-hidden">
                        <img 
                          src={(WALLET_LOGOS as Record<string, string>)[item.walletType] || WALLET_LOGOS.Rocket} 
                          alt={item.walletType} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="font-mono text-[9px] text-gray-400">{item.id}</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700">
                      সফল
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="text-gray-800">{item.walletType}</span>
                    <span className="font-mono text-red-600">৳ {item.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono text-right">
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* WITHDRAWAL GUIDELINES MODAL (প্রত্যাহারের নির্দেশিকা) */}
      {/* ========================================================================= */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900">প্রত্যাহারের নির্দেশিকা</h3>
              </div>
              <button
                onClick={() => setShowGuidelines(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900">১. উত্তোলনের সময় ও সীমা:</div>
                <p>আমাদের প্ল্যাটফর্মে ২৪ ঘণ্টা উত্তোলন সেবা চালু থাকে। নূন্যতম উত্তোলনের পরিমাণ ৫০০ BDT এবং সর্বোচ্চ একক লেনদেনে ৫০,০০০ BDT।</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900">২. টার্নওভার শর্তাবলী:</div>
                <p>উত্তোলন করার পূর্বে ডিপোজিট বা বোনাসের প্রয়োজনীয় টার্নওভার অবশ্যই ১০০% পূরণ করতে হবে। অপূর্ণ টার্নওভার থাকলে স্বয়ংক্রিয়ভাবে অনুরোধ মুলতুবি থাকবে।</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900">৩. ই-ওয়ালেট তথ্য যাচাই:</div>
                <p>বিকাশ, নগদ বা রকেট অ্যাকাউন্ট নম্বর এবং কার্ডধারীর নাম নিবন্ধনের সময় দেওয়া তথ্যের সাথে মিল থাকতে হবে। অন্যথায় নিরাপত্তা জনিত কারণে উত্তোলন বাতিল হতে পারে।</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="font-bold text-gray-900">৪. লেনদেন পাসওয়ার্ড:</div>
                <p>আপনার তহবিলের সুরক্ষার জন্য প্রতিটি উত্তোলনে ৬ সংখ্যার গোপন লেনদেন পাসওয়ার্ড প্রয়োজন হবে।</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuidelines(false)}
                className="px-5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};
