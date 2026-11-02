// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Check, 
  ThumbsUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Copy,
  X,
  Phone,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { api } from '../services/api';
import { DEFAULT_DEPOSIT_OFFER, depositBonus, depositLimitError } from '../services/depositOffer';

interface DepositSectionViewProps {
  user?: UserAccount;
  onOpenAccountRecord?: (tab?: 'transaction' | 'deposit' | 'withdraw') => void;
  onDepositSuccess?: (amount: number, bonus: number, method: string) => void;
  onOpenWithdraw?: () => void;
}

type DepositMethod = 'nagad' | 'bkash' | 'rocket';

interface GatewayChannel {
  id: string;
  name: string;
}

const GATEWAYS: GatewayChannel[] = [
  { id: 'gbkpay', name: 'পরিশোধ-GBKPAY' },
  { id: 'inru', name: 'পরিশোধ-INRU' },
  { id: 'cow', name: 'পরিশোধ-COW' },
  { id: 'bmx', name: 'পরিশোধ-BMX' },
  { id: 'tiger', name: 'পরিশোধ-tiger' },
  { id: 'd7pay', name: 'পরিশোধ-D7pay' },
  { id: 'pass', name: 'পরিশোধ-PASS' },
  { id: 'dk', name: 'পরিশোধ-DK' },
  { id: 'saflopay', name: 'পরিশোধ-Saflopay' },
  { id: 'megi', name: 'পরিশোধ-MEGI' },
  { id: 'axis', name: 'পরিশোধ-AXIS' },
];

const AMOUNT_OPTIONS = [100, 200, 500, 1000, 3000, 5000, 10000, 25000, 50000].map((amount) => ({ amount }));

export const DepositSectionView: React.FC<DepositSectionViewProps> = ({
  user,
  onOpenAccountRecord,
  onDepositSuccess,
  onOpenWithdraw,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod>('nagad');
  const [selectedGateway, setSelectedGateway] = useState<string>('gbkpay');
  const [selectedAmount, setSelectedAmount] = useState<number>(200);
  const [customAmountInput, setCustomAmountInput] = useState<string>('200');
  const [depositOffer, setDepositOffer] = useState(DEFAULT_DEPOSIT_OFFER);
  const [depositLimits, setDepositLimits] = useState({ min: 200, max: 50000 });
  const [selectedPromo, setSelectedPromo] = useState<'bonus' | 'none'>('bonus');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Merchant numbers loaded from backend settings
  const [gatewayNumbers, setGatewayNumbers] = useState<{ bkash: string; nagad: string; rocket: string }>({
    bkash: '01874928172',
    nagad: '01798321045',
    rocket: '01984210982'
  });

  // Step 2 Payment Transfer & TrxID Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [senderPhoneInput, setSenderPhoneInput] = useState(user?.phone || '');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    api.settings.getPublicSettings().then(res => {
      if (res.success && res.settings) {
        if (res.settings.depositOffer) setDepositOffer(res.settings.depositOffer);
        if (res.settings.minDeposit > 0 && res.settings.maxDeposit >= res.settings.minDeposit) {
          setDepositLimits({ min: res.settings.minDeposit, max: res.settings.maxDeposit });
        }
        setGatewayNumbers({
          bkash: res.settings.bkashNumber || '01874928172',
          nagad: res.settings.nagadNumber || '01798321045',
          rocket: res.settings.rocketNumber || '01984210982'
        });
      }
    }).catch(() => {});
  }, []);

  // Preview only; the server decides the bonus and credits it after admin approval
  const previewBonus = (amt: number) => depositBonus(depositOffer, amt, true, false);
  const bonusVal = selectedPromo === 'bonus' ? previewBonus(selectedAmount) : 0;
  const offerLabel = depositOffer.enabled
    ? `${depositOffer.firstDepositOnly ? 'প্রথম জমায়' : 'প্রতিটি জমায়'} ${depositOffer.bonusPercent}% বোনাস${depositOffer.maxBonus > 0 ? ` (সর্বোচ্চ ৳${depositOffer.maxBonus.toLocaleString()})` : ''}`
    : 'এখন কোনো জমা বোনাস নেই';

  const handleSelectAmount = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmountInput(amt.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmountInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setSelectedAmount(parsed);
    }
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenPaymentModal = () => {
    const amt = parseFloat(customAmountInput);
    const limitError = depositLimitError(amt, depositLimits.min, depositLimits.max);
    if (limitError) {
      setStatusMessage({
        type: 'error',
        text: limitError
      });
      return;
    }
    setStatusMessage(null);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmDepositWithTrx = async () => {
    const amt = parseFloat(customAmountInput);
    const limitError = depositLimitError(amt, depositLimits.min, depositLimits.max);
    if (limitError) {
      setStatusMessage({
        type: 'error',
        text: limitError
      });
      setIsPaymentModalOpen(false);
      return;
    }

    if (!trxIdInput.trim() || trxIdInput.trim().length < 6) {
      setStatusMessage({
        type: 'error',
        text: 'অনুগ্রহ করে সঠিক ৮-১০ সংখ্যার Transaction ID (TrxID) প্রদান করুন।'
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const methodName = selectedMethod === 'nagad' ? 'Nagad' : selectedMethod === 'bkash' ? 'bKash' : 'Rocket';
    const sender = senderPhoneInput.trim() || user?.phone || '017XXXXXXXX';

    try {
      const res = await api.wallet.deposit(amt, selectedMethod, selectedGateway, sender, trxIdInput.trim(), selectedPromo === 'bonus');
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onDepositSuccess) {
        onDepositSuccess(amt, Number(res.bonusAdded) || 0, methodName);
      }

      setStatusMessage({
        type: 'success',
        text: res.message || `৳ ${amt.toLocaleString()} ডিপোজিট সফল হয়েছে! TrxID: ${trxIdInput.trim()}`
      });

      setTrxIdInput('');
    } catch (err: any) {
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'ডিপোজিট প্রক্রিয়া ব্যর্থ হয়েছে। ডাটাবেস সার্ভারে সংযোগ চেক করুন।'
      });
    }
  };

  return (
    <main className="flex-1 bg-white flex flex-col overflow-hidden text-gray-800 font-bengali select-none">
      
      {/* Toast Alert */}
      {statusMessage && (
        <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs' 
            : 'bg-red-50 text-red-800 border border-red-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button 
            onClick={() => setStatusMessage(null)}
            className="text-gray-400 hover:text-gray-600 text-xs px-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Body Grid: Left Payment Methods | Right Deposit Form matching Capture.PNG */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col md:flex-row gap-5">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PAYMENT METHOD SELECTORS (NAGAD / BKASH / ROCKET) */}
        {/* ========================================================================= */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-3">
          
          {/* 1. NAGAD */}
          <button
            type="button"
            onClick={() => setSelectedMethod('nagad')}
            className={`relative w-full p-3.5 rounded-2xl bg-white border-2 transition-all flex items-center gap-3.5 shadow-xs cursor-pointer text-left overflow-hidden ${
              selectedMethod === 'nagad'
                ? 'border-red-500 ring-2 ring-red-400/30'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-2xs border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={WALLET_LOGOS.Nagad} 
                alt="Nagad" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-gray-900 tracking-wide">NAGAD</span>
              <span className="text-[11px] text-gray-400 font-semibold">নগদ ওয়ালেট</span>
            </div>

            {/* Bottom-right red triangle checkmark when selected */}
            {selectedMethod === 'nagad' && (
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-b-red-600 border-l-[20px] border-l-transparent">
                <Check className="w-2.5 h-2.5 text-white absolute -bottom-[19px] -right-[1px]" strokeWidth={3.5} />
              </div>
            )}
          </button>

          {/* 2. BKASH */}
          <button
            type="button"
            onClick={() => setSelectedMethod('bkash')}
            className={`relative w-full p-3.5 rounded-2xl bg-white border-2 transition-all flex items-center gap-3.5 shadow-xs cursor-pointer text-left overflow-hidden ${
              selectedMethod === 'bkash'
                ? 'border-red-500 ring-2 ring-red-400/30'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-2xs border border-pink-100 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={WALLET_LOGOS.BKash} 
                alt="bKash" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-gray-900 tracking-wide">Bkash</span>
              <span className="text-[11px] text-gray-400 font-semibold">বিকাশ ওয়ালেট</span>
            </div>

            {/* Bottom-right red triangle checkmark when selected */}
            {selectedMethod === 'bkash' && (
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-b-red-600 border-l-[20px] border-l-transparent">
                <Check className="w-2.5 h-2.5 text-white absolute -bottom-[19px] -right-[1px]" strokeWidth={3.5} />
              </div>
            )}
          </button>

          {/* 3. ROCKET */}
          <button
            type="button"
            onClick={() => setSelectedMethod('rocket')}
            className={`relative w-full p-3.5 rounded-2xl bg-white border-2 transition-all flex items-center gap-3.5 shadow-xs cursor-pointer text-left overflow-hidden ${
              selectedMethod === 'rocket'
                ? 'border-purple-600 ring-2 ring-purple-400/30'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-2xs border border-purple-100 flex items-center justify-center overflow-hidden shrink-0">
              <img 
                src={WALLET_LOGOS.Rocket} 
                alt="Rocket" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-gray-900 tracking-wide">ROCKET</span>
              <span className="text-[11px] text-gray-400 font-semibold">রকেট ওয়ালেট</span>
            </div>

            {/* Bottom-right purple triangle checkmark when selected */}
            {selectedMethod === 'rocket' && (
              <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-b-purple-600 border-l-[20px] border-l-transparent">
                <Check className="w-2.5 h-2.5 text-white absolute -bottom-[19px] -right-[1px]" strokeWidth={3.5} />
              </div>
            )}
          </button>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: DEPOSIT FORM (জমার তথ্য) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col space-y-4">
          
          {/* Header Row: [ | জমার তথ্য ] and Right Button [ 📋 জমা রেকর্ড ] */}
          <div className="flex items-center justify-between pb-1 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full inline-block"></span>
              <h2 className="text-sm sm:text-base font-extrabold text-gray-900">জমার তথ্য</h2>
            </div>

            {/* জমা রেকর্ড Button (Opens Account Record with Deposit tab active) */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAccountRecord) {
                  onOpenAccountRecord('deposit');
                }
              }}
              className="px-3.5 py-1 rounded-full border border-blue-400/80 bg-blue-50/80 hover:bg-blue-100 text-blue-600 flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs cursor-pointer group hover:scale-[1.02]"
            >
              <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:rotate-6 transition-transform" />
              <span>জমা রেকর্ড</span>
            </button>
          </div>

          {/* Notice / Warning Box matching Capture.PNG */}
          <div className="p-3 rounded-xl bg-[#fff2e8] border border-[#ffdec6] text-[#ff4d29] text-xs leading-relaxed font-medium">
            আপনি যদি রিচার্জের জন্য {selectedMethod === 'nagad' ? 'NAGAD' : selectedMethod === 'bkash' ? 'BKASH' : 'ROCKET'} বাছাই করেছেন, অনুগ্রহ করে মানিটি ট্রান্সফার করার জন্য {selectedMethod === 'nagad' ? 'NAGAD' : selectedMethod === 'bkash' ? 'BKASH' : 'ROCKET'} ব্যবহার করুন। যদি আপনি ভুল মানিব্যাগ/ব্যাংক বাছাই করেন, তাহলে রিচার্জ জমা হবে না।
          </div>

          {/* Payment Gateways / Channels (পরিশোধ-GBKPAY, ইত্যাদি - Displaying Full Name) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {GATEWAYS.map((gw) => {
              const isSelected = gw.id === selectedGateway;
              return (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setSelectedGateway(gw.id)}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap overflow-visible ${
                    isSelected
                      ? 'border-red-500 bg-white text-red-600 ring-1 ring-red-400'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-orange-500 text-xs shrink-0">👍</span>
                  <span className="font-semibold tracking-tight">{gw.name}</span>
                </button>
              );
            })}
          </div>

          {/* Amount Selection Section */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-gray-800">জমার পরিমাণ:</div>
            
            {/* Amount Chips with Bonus Tags matching Capture2.PNG & Capture3.PNG */}
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
              {AMOUNT_OPTIONS.filter((opt) => opt.amount >= depositLimits.min && opt.amount <= depositLimits.max).map((opt) => {
                const isSelected = opt.amount === selectedAmount;
                return (
                  <button
                    key={opt.amount}
                    type="button"
                    onClick={() => handleSelectAmount(opt.amount)}
                    className={`relative py-2.5 px-1 rounded-lg border text-xs font-extrabold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-red-500 bg-white text-red-600 ring-1 ring-red-400 shadow-2xs'
                        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {/* Top Right Red Gradient Bonus Tag matching Screenshot - Only show when bonus promo is selected */}
                    {selectedPromo === 'bonus' && previewBonus(opt.amount) > 0 && (
                      <span className="absolute -top-1.5 right-0 px-1 py-0.2 rounded-t-sm rounded-br-sm bg-gradient-to-r from-red-500 to-rose-600 text-white text-[8px] font-extrabold tracking-tight scale-90 origin-top-right shadow-2xs">
                        +{previewBonus(opt.amount).toLocaleString()}
                      </span>
                    )}
                    
                    <span className="font-mono">{opt.amount.toLocaleString()}</span>

                    {/* Bottom-right red triangle checkmark when selected */}
                    {isSelected && (
                      <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[14px] border-b-red-600 border-l-[14px] border-l-transparent">
                        <Check className="w-2 h-2 text-white absolute -bottom-[13px] -right-[1px]" strokeWidth={3.5} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Input Box with top-right bonus pill */}
            <div className="relative pt-1">
              <div className="relative max-w-sm">
                <input
                  type="text"
                  value={customAmountInput}
                  onChange={handleCustomInputChange}
                  placeholder={String(depositLimits.min)}
                  className="w-full px-3 py-2 bg-gray-100/90 border border-gray-300 rounded-lg text-xs sm:text-sm font-extrabold text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white"
                />
                {bonusVal > 0 && (
                  <span className="absolute top-1/2 -translate-y-1/2 right-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold">
                    +৳ {bonusVal.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="text-[11px] font-semibold text-red-600 pt-1">
                জমা সীমা: ৳ {depositLimits.min.toLocaleString()} - ৳ {depositLimits.max.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Promotion Selection (প্রচার নির্বাচন করুন) matching Capture.PNG */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-gray-800">প্রচার নির্বাচন করুন:</div>

            {/* Option 1: Bonus Promo Card */}
            <div 
              onClick={() => setSelectedPromo('bonus')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer space-y-2 bg-white ${
                selectedPromo === 'bonus'
                  ? 'border-red-400 ring-1 ring-red-300 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedPromo === 'bonus' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}>
                    {selectedPromo === 'bonus' && <div className="w-2 h-2 rounded-full bg-red-600" />}
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                    {offerLabel}
                  </span>
                </div>
                <span className="font-bold text-xs sm:text-sm text-red-600 font-mono shrink-0">
                  ≥৳ {(depositOffer.minDepositForBonus || depositLimits.min).toFixed(2)}
                </span>
              </div>

              {/* Promo description */}
              <div className="pl-6 space-y-1 text-xs text-gray-700">
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✅</span>
                  <p>{depositOffer.enabled ? `${offerLabel}। অ্যাডমিন জমা যাচাই ও অনুমোদন করার পর বোনাস অ্যাকাউন্টে যোগ হবে।` : "এখন কোনো জমা বোনাস চালু নেই।"}</p>
                </div>
                <p className="text-[11px] text-gray-500 italic">
                  *মনে রাখা: এই তথ্য যারা যাচাই করেননি, তাদের বোনাস প্রাপ্ত হবে না।
                </p>
              </div>

              {/* Linked Button inside Card: উত্তোলনের অ্যাকাউন্ট সংযুক্ত করুন ✅ */}
              <div className="pl-6 pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenWithdraw) {
                      onOpenWithdraw();
                    }
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-4 border border-emerald-300/60 shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <span>উত্তোলনের অ্যাকাউন্ট সংযুক্ত করুন</span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                </button>
              </div>
            </div>

            {/* Option 2: No Promo Option */}
            <div
              onClick={() => setSelectedPromo('none')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 bg-white ${
                selectedPromo === 'none'
                  ? 'border-red-400 ring-1 ring-red-300 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedPromo === 'none' ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}>
                {selectedPromo === 'none' && <div className="w-2 h-2 rounded-full bg-red-600" />}
              </div>
              <span className="font-bold text-xs text-gray-800">
                যেকোনো প্রচারে অংশগ্রহণ করবেন না
              </span>
            </div>

          </div>

          {/* Payment Summary matching Capture.PNG */}
          <div className="pt-2 space-y-1.5 text-xs text-gray-800">
            <div className="font-bold text-gray-900 pb-1">পেমেন্ট বিবরণ:</div>
            
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-gray-600 font-medium">জমার পরিমান</span>
              <span className="font-mono font-bold text-gray-900">
                {parseFloat(customAmountInput || '0').toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 bg-gray-50/80 px-2 rounded-lg">
              <span className="text-gray-700 font-bold">প্রকৃত পেমেন্ট পরিমাণ</span>
              <span className="font-mono font-extrabold text-red-600 text-sm">
                {parseFloat(customAmountInput || '0').toFixed(2)}
              </span>
            </div>
          </div>

          {/* Submit Action Button matching Capture.PNG */}
          <div className="pt-2 pb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleOpenPaymentModal}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>জমার জন্য আবেদন করুন</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {onOpenAccountRecord && (
              <button
                type="button"
                onClick={() => onOpenAccountRecord('deposit')}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span>জমা রেকর্ড দেখুন</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* STEP 2 MODAL: OFFICIAL PAYMENT NUMBER & TrxID VERIFICATION               */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">
                    পেমেন্ট সম্পন্নকরণ ও TrxID প্রদান
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    অফিসিয়াল নম্বরে টাকা পাঠিয়ে নিচে TrxID দিন
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Official Number Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {selectedMethod.toUpperCase()} অফিসিয়াল নম্বর
                </span>
                <span className="text-[10px] font-semibold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-full">
                  ক্যাশআউট / সেন্ডমানি
                </span>
              </div>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/80 shadow-2xs">
                <span className="font-mono text-base font-extrabold text-gray-900 tracking-wider">
                  {gatewayNumbers[selectedMethod] || '01798321045'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(gatewayNumbers[selectedMethod] || '01798321045')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                </button>
              </div>
              <p className="text-[11px] text-amber-800 leading-tight">
                আপনার {selectedMethod === 'nagad' ? 'Nagad' : selectedMethod === 'bkash' ? 'bKash' : 'Rocket'} অ্যাপ থেকে মোট <b>৳{parseFloat(customAmountInput || '0').toFixed(2)}</b> পাঠিয়ে লেনদেনটি সম্পন্ন করুন।
              </p>
            </div>

            {/* Step 2: Form Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  আপনার প্রেরক মোবাইল নম্বর (Sender Phone)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={senderPhoneInput}
                    onChange={(e) => setSenderPhoneInput(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 focus:bg-white focus:border-red-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ট্রানজেকশন আইডি (Transaction ID / TrxID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={trxIdInput}
                  onChange={(e) => setTrxIdInput(e.target.value.toUpperCase())}
                  placeholder="যেমন: 8K2L9901M"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-gray-900 tracking-wider focus:bg-white focus:border-red-500 focus:outline-none uppercase"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  পেমেন্ট মেসেজ বা অ্যাপ স্টেটমেন্টে পাওয়া ৮-১০ সংখ্যার TrxID লিখুন।
                </p>
              </div>

              {/* Summary of Deposit Amount + Promo */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-500 block text-[11px]">জমা পরিমাণ</span>
                  <span className="font-extrabold text-gray-900">৳ {parseFloat(customAmountInput || '0').toLocaleString()}</span>
                </div>
                {bonusVal > 0 && (
                  <div className="text-right">
                    <span className="text-emerald-600 block text-[11px] font-bold">বোনাস যোগ হবে</span>
                    <span className="font-extrabold text-emerald-600">+৳ {bonusVal.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDepositWithTrx}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>যাচাই হচ্ছে...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>পেমেন্ট নিশ্চিত করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};
