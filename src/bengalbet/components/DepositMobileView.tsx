// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ClipboardList, 
  Headphones, 
  Check, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  ThumbsUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { DepositWithdrawRecordView } from './DepositWithdrawRecordView';
import { CustomerServiceModal } from './CustomerServiceModal';
import { LiveChatWidget } from './LiveChatWidget';
import { api } from '../services/api';
import { DEFAULT_DEPOSIT_OFFER, depositBonus, depositLimitError } from '../services/depositOffer';

interface DepositMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  onOpenDepositRecord?: () => void;
  onOpenCustomerService?: () => void;
  onOpenSupportTicket?: () => void;
  onDepositSuccess?: (amount: number, bonus: number, method: string) => void;
  showToast?: (msg: string) => void;
}

type DepositModeId = 'nagad' | 'rocket' | 'bkash';

interface ChannelItem {
  id: string;
  name: string;
}

const CHANNELS: ChannelItem[] = [
  { id: 'dk', name: 'পরিশোধ-DK' },
  { id: 'gbkpay', name: 'পরিশোধ-GBKPAY' },
  { id: 'axis', name: 'পরিশোধ-AXIS' },
  { id: 'tk', name: 'পরিশোধ-TK' },
];

const PRESET_AMOUNTS = [
  200, 500, 1000, 3000, 5000,
  10000, 25000, 50000
];

export const DepositMobileView: React.FC<DepositMobileViewProps> = ({
  user,
  onBack,
  onClose,
  onOpenDepositRecord,
  onOpenCustomerService,
  onOpenSupportTicket,
  onDepositSuccess,
  showToast
}) => {
  // Navigation sub-view state
  const [activeSubView, setActiveSubView] = useState<'record' | null>(null);
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);

  // Selected States matching Screenshot 1 & Screenshot 2
  const [selectedMode, setSelectedMode] = useState<DepositModeId>('nagad');
  const [selectedChannel, setSelectedChannel] = useState<string>('dk');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPromo, setSelectedPromo] = useState<'bonus' | 'none'>('none');

  // Step 2 Modal / Confirmation Sheet State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Deposit offer and limits come from the server settings
  const [depositOffer, setDepositOffer] = useState(DEFAULT_DEPOSIT_OFFER);
  const [depositLimits, setDepositLimits] = useState({ min: 200, max: 50000 });
  const offerLabel = depositOffer.enabled
    ? `${depositOffer.firstDepositOnly ? 'প্রথম জমায়' : 'প্রতিটি জমায়'} ${depositOffer.bonusPercent}% বোনাস${depositOffer.maxBonus > 0 ? ` (সর্বোচ্চ ৳${depositOffer.maxBonus.toLocaleString()})` : ''}${depositOffer.minDepositForBonus > 0 ? `, ন্যূনতম ৳${depositOffer.minDepositForBonus.toLocaleString()}` : ''}`
    : 'এখন কোনো জমা বোনাস নেই';
  const previewBonus = (amt: number) => depositBonus(depositOffer, amt, true, false);

  // Active Amount resolution
  const activeAmount = customAmount ? parseFloat(customAmount) : (selectedAmount || 0);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSelectPreset = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setSelectedAmount(parsed);
    } else {
      setSelectedAmount(null);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    triggerToast('নম্বর কপি করা হয়েছে!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Merchant Account numbers loaded dynamically
  const [merchantNumbers, setMerchantNumbers] = useState<Record<DepositModeId, { number: string; type: string }>>({
    nagad: { number: '01798321045', type: 'নগদ এজেন্ট / মার্চেন্ট' },
    rocket: { number: '01984210982-4', type: 'রকেট পার্সোনাল / এজেন্ট' },
    bkash: { number: '01874928172', type: 'বিকাশ মার্চেন্ট' }
  });

  useEffect(() => {
    api.settings.getPublicSettings().then(res => {
      if (res.success && res.settings) {
        if (res.settings.depositOffer) setDepositOffer(res.settings.depositOffer);
        if (res.settings.minDeposit > 0 && res.settings.maxDeposit >= res.settings.minDeposit) {
          setDepositLimits({ min: res.settings.minDeposit, max: res.settings.maxDeposit });
        }
        setMerchantNumbers({
          nagad: { number: res.settings.nagadNumber || '01798321045', type: 'নগদ এজেন্ট / মার্চেন্ট' },
          rocket: { number: res.settings.rocketNumber || '01984210982-4', type: 'রকেট পার্সোনাল / এজেন্ট' },
          bkash: { number: res.settings.bkashNumber || '01874928172', type: 'বিকাশ মার্চেন্ট' }
        });
      }
    }).catch(() => {});
  }, []);

  const currentMerchant = merchantNumbers[selectedMode];

  const handleProceedNext = () => {
    const limitError = depositLimitError(activeAmount, depositLimits.min, depositLimits.max);
    if (limitError) {
      triggerToast(limitError);
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const handleCompleteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim() || trxId.trim().length < 6) {
      triggerToast('অনুগ্রহ করে সঠিক ৮-১০ সংখ্যার Transaction ID (TrxID) দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.wallet.deposit(activeAmount, selectedMode, selectedChannel, user?.phone, trxId.trim(), selectedPromo === 'bonus');
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Bonus is decided by the server and only credited after admin approval
      const bonusEarned = Number(res.bonusAdded) || 0;
      triggerToast(res.message || `৳${activeAmount.toLocaleString()} ডিপোজিট সফলভাবে জমা হয়েছে!`);

      if (onDepositSuccess) {
        onDepositSuccess(activeAmount, bonusEarned, selectedMode.toUpperCase());
      }

      setTrxId('');
    } catch (err: any) {
      setIsSubmitting(false);
      setIsConfirmModalOpen(false);
      triggerToast(err.message || 'ডিপোজিট সম্পন্ন করা যায়নি! ডাটাবেস সার্ভারে সংযোগ চেক করুন।');
    }
  };

  // 1. If user clicked on Deposit Records
  if (activeSubView === 'record') {
    return (
      <DepositWithdrawRecordView
        user={user}
        initialType="deposit"
        onBack={() => setActiveSubView(null)}
        onClose={onClose || onBack}
      />
    );
  }

  return (
    <div 
      id="mobile-deposit-full-view"
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none animate-in fade-in relative pb-20"
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

      {/* ========================================================================= */}
      {/* 1. TOP HEADER matching Screenshot 1 & Screenshot 2 */}
      {/* Dark Forest Green Background (#0b3323) + Back Arrow + Centered Title: জমা দিন + Right Icons */}
      {/* ========================================================================= */}
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
          জমা দিন
        </h1>

        {/* Right Header Action Icons matching Screenshot 1 & 2 */}
        <div className="flex items-center gap-3">
          {/* Deposit Record Icon */}
          <button
            type="button"
            onClick={() => {
              if (onOpenDepositRecord) {
                onOpenDepositRecord();
              } else {
                setActiveSubView('record');
              }
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="জমা রেকর্ড"
          >
            <div className="relative">
              <ClipboardList className="w-6 h-6 stroke-[2]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white text-[#0b3323] rounded-full flex items-center justify-center text-[8px] font-black">
                ↑
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

      {/* ========================================================================= */}
      {/* MAIN BODY CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-5 max-w-lg mx-auto w-full">

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 1: আমানতের মোড (Deposit Mode) matching Screenshot 1 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f97316]" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
              আমানতের মোড
            </h2>
          </div>

          {/* Mode Cards: NAGAD, ROCKET & BKASH */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* NAGAD Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('nagad')}
              className={`relative p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedMode === 'nagad'
                  ? 'border-2 border-[#ef4444] bg-white shadow-xs'
                  : 'border border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Nagad circular flame logo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#fff4ed] flex items-center justify-center p-1 border border-orange-100 overflow-hidden">
                <img 
                  src={WALLET_LOGOS.nagad} 
                  alt="Nagad" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-xs sm:text-sm font-black text-[#ef4444] tracking-tight">
                নগদ
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-[#ef4444] font-mono tracking-wider -mt-0.5">
                NAGAD
              </span>

              {/* Red checkmark corner badge when selected matching Screenshot 1 */}
              {selectedMode === 'nagad' && (
                <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[16px] sm:border-t-[18px] border-t-transparent border-r-[16px] sm:border-r-[18px] border-r-[#ef4444] rounded-br-[10px]">
                  <Check className="w-2.5 h-2.5 text-white absolute -top-2.5 right-[-15px] sm:right-[-17px] stroke-[3]" />
                </div>
              )}
            </button>

            {/* ROCKET Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('rocket')}
              className={`relative p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedMode === 'rocket'
                  ? 'border-2 border-[#ef4444] bg-white shadow-xs'
                  : 'border border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Rocket purple logo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8c3494] flex items-center justify-center p-1 overflow-hidden shadow-xs">
                <img 
                  src={WALLET_LOGOS.rocket} 
                  alt="Rocket" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-xs sm:text-sm font-black text-[#8c3494] tracking-tight">
                রকেট
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-gray-800 font-mono tracking-wider -mt-0.5">
                ROCKET
              </span>

              {/* Red checkmark corner badge when selected */}
              {selectedMode === 'rocket' && (
                <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[16px] sm:border-t-[18px] border-t-transparent border-r-[16px] sm:border-r-[18px] border-r-[#ef4444] rounded-br-[10px]">
                  <Check className="w-2.5 h-2.5 text-white absolute -top-2.5 right-[-15px] sm:right-[-17px] stroke-[3]" />
                </div>
              )}
            </button>

            {/* BKASH Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('bkash')}
              className={`relative p-2.5 sm:p-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedMode === 'bkash'
                  ? 'border-2 border-[#ef4444] bg-white shadow-xs'
                  : 'border border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* bKash pink logo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#fdf2f7] flex items-center justify-center p-1 border border-pink-200 overflow-hidden shadow-xs">
                <img 
                  src={WALLET_LOGOS.bkash} 
                  alt="bKash" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <span className="text-xs sm:text-sm font-black text-[#e2136e] tracking-tight">
                বিকাশ
              </span>
              <span className="text-[10px] sm:text-[11px] font-black text-[#e2136e] font-mono tracking-wider -mt-0.5">
                BKASH
              </span>

              {/* Red checkmark corner badge when selected */}
              {selectedMode === 'bkash' && (
                <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[16px] sm:border-t-[18px] border-t-transparent border-r-[16px] sm:border-r-[18px] border-r-[#ef4444] rounded-br-[10px]">
                  <Check className="w-2.5 h-2.5 text-white absolute -top-2.5 right-[-15px] sm:right-[-17px] stroke-[3]" />
                </div>
              )}
            </button>
          </div>

          {/* Warning Message matching Screenshot 1 */}
          <div className="pt-1">
            <p className="text-[12px] sm:text-[13px] text-[#ef4444] font-bold leading-relaxed">
              আপনি যদি রিচার্জের জন্য {selectedMode.toUpperCase()} বাছাই করেছেন, অনুগ্রহ করে মানিটি ট্রান্সফার করার জন্য {selectedMode.toUpperCase()} ব্যবহার করুন। যদি আপনি ভুল মানিব্যাগ/ব্যাংক বাছাই করেন, তাহলে রিচার্জ জমা হবে না।
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 2: পেমেন্ট চ্যানেল (Payment Channel) matching Screenshot 1 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
              পেমেন্ট চ্যানেল
            </h2>
          </div>

          {/* 4 Gateway Channel Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CHANNELS.map((ch) => {
              const isSelected = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`relative py-3.5 px-3 rounded-xl text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#ef4444] text-[#ef4444] bg-white shadow-xs'
                      : 'border border-gray-200 text-gray-800 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Top-left Thumbs Up Badge matching Screenshot 1 */}
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-tl-lg bg-[#f97316] text-white flex items-center justify-center text-[9px] shadow-xs">
                    👍
                  </div>

                  <span className="block truncate px-1">
                    {ch.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 3: জমা পরিমাণ (Deposit Amount) matching Screenshot 1 & 2 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#fb7185]" />
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
                জমা পরিমাণ
              </h2>
            </div>
            {selectedPromo === 'bonus' && (
              <span className="text-[11px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {depositOffer.enabled ? `+${depositOffer.bonusPercent}% বোনাস প্রযোজ্য` : 'বোনাস বন্ধ'}
              </span>
            )}
          </div>

          {/* Quick Preset Buttons (5 top, 3 bottom) */}
          <div className="grid grid-cols-5 gap-2 pt-1">
            {PRESET_AMOUNTS.map((amt) => {
              const isSelected = activeAmount === amt;
              const bonusAmt = previewBonus(amt);
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className={`relative py-2.5 px-1 rounded-xl text-center font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#ef4444] text-[#ef4444] bg-white shadow-xs'
                      : 'border border-gray-200 text-gray-800 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Top corner bonus amount when promo is selected */}
                  {selectedPromo === 'bonus' && bonusAmt > 0 && (
                    <span className="absolute -top-2.5 -right-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs border border-white tracking-tight leading-none z-10 animate-in zoom-in-75">
                      +৳{bonusAmt >= 1000 ? `${(bonusAmt / 1000).toFixed(bonusAmt % 1000 === 0 ? 0 : 1)}k` : bonusAmt}
                    </span>
                  )}

                  <span className="block truncate">
                    {amt >= 1000 ? amt.toLocaleString() : amt}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input Box matching Screenshot 2 */}
          <div className="relative flex items-center bg-white border border-gray-300 rounded-xl px-3.5 py-3 shadow-xs focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 transition-all">
            <span className="text-lg font-black text-gray-900 mr-2 select-none">
              ৳
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={customAmount}
              onChange={handleCustomInputChange}
              placeholder={`${depositLimits.min.toLocaleString()} - ${depositLimits.max.toLocaleString()}`}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
            />
            {customAmount && (
              <button
                type="button"
                onClick={() => { setCustomAmount(''); setSelectedAmount(null); }}
                className="text-xs font-bold text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Dynamic Bonus Preview when promo is selected and amount entered */}
          {selectedPromo === 'bonus' && previewBonus(activeAmount) > 0 && (
            <div className="flex items-center justify-between text-xs bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl px-3.5 py-2 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>বোনাস পাবেন ({depositOffer.bonusPercent}%{depositOffer.firstDepositOnly ? ', প্রথম জমা হলে' : ''}):</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-black text-[#ef4444]">
                  +৳{previewBonus(activeAmount).toLocaleString()}
                </span>
                <span className="text-[11px] text-gray-500 font-bold">
                  (অনুমোদনের পর মোট: ৳{(activeAmount + previewBonus(activeAmount)).toLocaleString()})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* SECTION 4: কার্যক্রম (Promotion Activity) matching Screenshot 2 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900 tracking-tight">
              কার্যক্রম
            </h2>
          </div>

          {/* Option 1: Promotion Option */}
          <button
            type="button"
            onClick={() => setSelectedPromo('bonus')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedPromo === 'bonus'
                ? 'border-[#ef4444] bg-[#fff5f5] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 pr-2">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                selectedPromo === 'bonus' ? 'border-[#ef4444]' : 'border-gray-400'
              }`}>
                {selectedPromo === 'bonus' && (
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                )}
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-gray-800 leading-snug line-clamp-1">
                {offerLabel}
              </span>
            </div>

            <span className="text-xs font-bold text-gray-400 font-mono shrink-0">
              {(depositOffer.minDepositForBonus || depositLimits.min).toFixed(2)}
            </span>
          </button>

          {/* Option 2: No Promotion Option matching Screenshot 2 (Selected by default) */}
          <button
            type="button"
            onClick={() => setSelectedPromo('none')}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              selectedPromo === 'none'
                ? 'border-[#ef4444] bg-[#fff5f5] shadow-xs'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                selectedPromo === 'none' ? 'border-[#ef4444]' : 'border-gray-400'
              }`}>
                {selectedPromo === 'none' && (
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                )}
              </div>
              <span className="text-xs sm:text-[13px] font-bold text-gray-900">
                কোনও প্রচারে অংশ নেওয়া যায় না
              </span>
            </div>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM STICKY ACTION BUTTON: পরবর্তী (Next) matching Screenshot 1 & 2 */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#e2e8f0] p-0 z-20">
        <button
          type="button"
          onClick={handleProceedNext}
          disabled={!activeAmount || activeAmount < 100}
          className={`w-full py-4 text-center font-black text-base sm:text-lg tracking-wide transition-all ${
            activeAmount >= 100
              ? 'bg-[#0b824c] hover:bg-[#096e40] text-white active:scale-[0.99] cursor-pointer shadow-lg'
              : 'bg-[#cbd5e1] text-white/90 cursor-not-allowed'
          }`}
        >
          পরবর্তী
        </button>
      </footer>

      {/* ========================================================================= */}
      {/* 6. STEP 2 PAYMENT DETAILS & CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  ৳
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    {selectedMode.toUpperCase()} ক্যাশ-আউট / পেমেন্ট
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    পরিমাণ: ৳{activeAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Merchant Account Details Box */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">
                  {currentMerchant.type} নম্বর:
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  ● সক্রিয় ও তাৎক্ষণিক
                </span>
              </div>

              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="font-mono text-base font-black text-gray-900 tracking-wider">
                  {currentMerchant.number}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyText(currentMerchant.number)}
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg font-bold text-xs hover:bg-amber-600 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                * অনুগ্রহ করে আপনার <strong>{selectedMode.toUpperCase()}</strong> অ্যাপ থেকে ওপরের নম্বরে ঠিক <strong>৳{activeAmount}</strong> ক্যাশ-আউট করুন এবং নিচের বক্সে TrxID লিখুন।
              </p>
            </div>

            {/* TrxID Form */}
            <form onSubmit={handleCompleteDeposit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-gray-800">
                  ট্রানজেকশন আইডি (TrxID) দিন:
                </label>
                <input
                  type="text"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  placeholder="যেমন: BL87X92QA"
                  className="w-full px-3.5 py-3 rounded-xl border border-gray-300 font-mono text-sm font-bold text-gray-900 focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !trxId.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all ${
                  trxId.trim() && !isSubmitting
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>পেমেন্ট নিশ্চিত করুন</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
