// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Gift, CheckCircle2, AlertCircle, Clock, 
  Copy, Check, ShieldCheck, Flame, ArrowRight, Wallet,
  Calendar, Award, Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, UserMysteryRewardStatus } from '../types';
import { api } from '../services/api';
import { mayClaimMysteryReward } from '../services/rewardEligibility';

interface MysteryRewardModalProps {
  isOpen: boolean;
  user: UserAccount;
  onClose: () => void;
  onClaimSuccess?: (amount: number, message: string) => void;
  onOpenTicketRecords?: () => void;
}

export const MysteryRewardModal: React.FC<MysteryRewardModalProps> = ({
  isOpen,
  user,
  onClose,
  onClaimSuccess,
  onOpenTicketRecords
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<UserMysteryRewardStatus | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealedBonus, setRevealedBonus] = useState<number | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'card' | 'terms'>('card');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setStatus(null);
      const res = await api.mysteryReward.getStatus();
      if (res.success) {
        setStatus(res as any);
        setPromoCodeInput(res.config?.promoCode ?? '');
        if (res.hasClaimed && res.claimedCard) {
          setRevealedBonus(res.claimedCard.bonusAmount);
        }
      } else {
        throw new Error('পুরস্কারের তথ্য পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setStatus(null);
      setClaimError('পুরস্কারের যোগ্যতা যাচাই হয়নি। আবার খুলে চেষ্টা করুন।');
      console.error('Failed to load mystery reward status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setRevealedBonus(null);
      fetchStatus();
      setClaimError(null);
    }
  }, [isOpen]);

  const handleCopyPromo = () => {
    if (!status?.config?.promoCode) return;
    navigator.clipboard.writeText(status.config.promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaimReward = async () => {
    if (!mayClaimMysteryReward(status, revealing || loading) || revealedBonus !== null) return;
    try {
      setRevealing(true);
      setClaimError(null);

      const res = await api.mysteryReward.claim(promoCodeInput);

      if (res.success) {
        setRevealedBonus(res.bonusAmount);
        // Confetti explosion
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        if (onClaimSuccess) {
          onClaimSuccess(res.bonusAmount, res.message);
        }
        // Refresh status
        fetchStatus();
      }
    } catch (err: any) {
      setClaimError(err.message || 'দাবি করতে সমস্যা হয়েছে');
    } finally {
      setRevealing(false);
    }
  };

  if (!isOpen) return null;

  const config = status?.config;
  const isEligible = status?.isEligible === true;
  const isUnlocked = status?.isUnlocked === true;
  const hasClaimed = status?.hasClaimed || Boolean(revealedBonus);
  const userBet = status?.userBetTotal ?? 0;
  const minBet = config?.minBetRequired ?? status?.minBetRequired ?? 0;
  const betProgressPercent = minBet > 0 ? Math.min(100, Math.round((userBet / minBet) * 100)) : 0;
  const claimDisabled = !mayClaimMysteryReward(status, revealing || loading) || hasClaimed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1e1435] via-[#160d29] to-[#0c0817] rounded-3xl border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-white flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Top Ambient Accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 bg-gradient-to-b from-amber-500/30 to-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500" />

        {/* Modal Header */}
        <div className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-purple-950 font-black">
              <Gift className="w-5 h-5 text-purple-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-purple-950 font-sans">
                  VIP ক্যাশ কার্ড ড্রপ
                </span>
                <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                  প্রতি মাসের ২৩ তারিখ
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-bengali text-white tracking-wide">
                ২৩ তারিখ রহস্যময় পুরস্কার
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs: Card vs Terms */}
        <div className="px-5 pt-2 flex gap-2 border-b border-purple-900/40 bg-purple-950/20">
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-3 text-xs font-black font-bengali transition-all relative cursor-pointer ${
              activeTab === 'card' 
                ? 'text-amber-300 border-b-2 border-amber-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            🎁 রহস্যময় ক্যাশ কার্ড
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-black font-bengali transition-all relative cursor-pointer ${
              activeTab === 'terms' 
                ? 'text-amber-300 border-b-2 border-amber-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            📜 শর্তাবলী ও টার্নওভার
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
          {activeTab === 'card' ? (
            <>
              {/* THE MYSTERY CASH CARD (VIP Luxury Visual) */}
              <div className="relative rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#2a1b4e] via-[#1f1338] to-[#120a24] border-2 border-amber-400/50 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden group">
                {/* Holographic Sheen Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase">
                      BENGALBET VIP CASH CARD
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-900/80 border border-purple-400/30 text-purple-200">
                    ২৩ তারিখ সন্ধ্যা ৬টা
                  </span>
                </div>

                {/* Main Bonus Display */}
                <div className="my-4 text-center">
                  <span className="text-xs font-bold text-amber-200/90 font-bengali">
                    সর্বোচ্চ মিস্ট্রি বোনাস ড্রপ
                  </span>
                  
                  {hasClaimed ? (
                    <div className="mt-1 flex flex-col items-center">
                      <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-100 font-mono tracking-tight drop-shadow-md animate-in zoom-in-95 duration-300">
                        ৳ {revealedBonus?.toLocaleString('en-US')}.০০
                      </div>
                      <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold font-bengali">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        অ্যাকাউন্টে সফলভাবে যোগ হয়েছে
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-baseline justify-center gap-1.5">
                      <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-100 font-mono tracking-tight">
                        ৳ ১,০০০ - ৳ ৫০,০০০
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-purple-200/70 font-bengali mt-1">
                    {hasClaimed 
                      ? 'মাত্র ১ গুণ (1x) ভেগারিং টার্নওভার সম্পন্ন করে ক্যাশআউট করুন।' 
                      : 'প্রতি মাসের ২৩ তারিখ অটোমেটিক অ্যাকাউন্টে ক্রেডিট বা ক্যাশ কার্ড হিসেবে জমা।'}
                  </p>
                </div>

                {/* Card Bottom Meta */}
                <div className="pt-3 border-t border-purple-800/40 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bengali">প্রোমোকোড:</span>
                    <button
                      onClick={handleCopyPromo}
                      className="px-2 py-0.5 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      title="কোড কপি করুন"
                    >
                      <span>{config?.promoCode || '—'}</span>
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="text-amber-400 font-mono font-bold">
                    1x টার্নওভার
                  </div>
                </div>
              </div>

              {/* Status / Claim Error */}
              {claimError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs font-bengali flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              {/* User Qualification Tracker */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 font-bengali flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    আপনার যোগ্যতা যাচাই
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isEligible 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {isEligible ? '✓ যোগ্য সদস্য' : 'শর্ত পূরণ বাকি'}
                  </span>
                </div>

                {/* 1. Monthly Bet Progress */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1 font-bengali">
                    <span className="text-gray-300">১-২২ তারিখ মোট বাজি:</span>
                    <span className="font-mono font-bold text-amber-300">
                      ৳{userBet.toLocaleString('en-US')} / ৳{minBet.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-purple-900/60 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                      style={{ width: `${betProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* 2. Verification Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-900/30 border border-purple-800/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-gray-300 font-bengali">{status?.isPhoneVerified ? 'মোবাইল ভেরিফাইড' : 'মোবাইল যাচাই বাকি'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-900/30 border border-purple-800/30">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-gray-300 font-bengali">{status?.isEmailVerified ? 'ইমেল ভেরিফাইড' : 'ইমেল যাচাই বাকি'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                {hasClaimed ? (
                  <div className="space-y-2">
                    <button
                      onClick={onOpenTicketRecords || onClose}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm font-bengali shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>দাবি সম্পন্ন! টিকিটের রেকর্ড দেখুন</span>
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bengali">
                      ক্যাশ কার্ড বোনাসটি আপনার প্রধান অ্যাকাউন্টে যুক্ত রয়েছে
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleClaimReward}
                    disabled={claimDisabled}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm font-bengali shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                      claimDisabled
                        ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-purple-950 hover:brightness-110 shadow-amber-500/30 animate-pulse'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {revealing ? 'রহস্যময় ক্যাশ কার্ড খোলা হচ্ছে...' : 'রহস্যময় ক্যাশ কার্ড খুলুন ও বোনাস নিন'}
                    </span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* TERMS & CONDITIONS TAB */
            <div className="space-y-4 text-xs font-bengali text-gray-300">
              {/* Rules 1: Participation */}
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>অংশগ্রহণের শর্তাবলী</span>
                </div>
                <ul className="space-y-2 text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>মাসের ১ তারিখ থেকে ২২ তারিখ পর্যন্ত মোট ন্যূনতম ৫০০ টাকা বাজি ধরতে হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>অ্যাকাউন্টে মোবাইল নম্বর ও ইমেল ভেরিফাইড থাকতে হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>২৩ তারিখ সন্ধ্যা ৬টায় অটোমেটিক অ্যাকাউন্টে ক্রেডিট করা হবে বা রিওয়ার্ড সেন্টারে ক্যাশ কার্ড ওপেন করা যাবে।</span>
                  </li>
                </ul>
              </div>

              {/* Rules 2: Turnover and Withdrawal */}
              <div className="p-4 rounded-2xl bg-purple-950/50 border border-purple-800/40 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>উত্তোলন ও বাজি টার্নওভার নিয়ম</span>
                </div>
                <ul className="space-y-2 text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>বোনাসটির সাথে মাত্র ১ গুণ (1x) ভেগারিং টার্নওভার প্রযোজ্য।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>কোনো অতিরিক্ত রেজিস্ট্রেশন বা ডিপোজিট স্লিপ লাগবে না।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>সমস্ত স্লট ও লাইভ ক্যাসিনো গেমসে ব্যবহারযোগ্য।</span>
                  </li>
                </ul>
              </div>

              {/* Promo Code Info */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-amber-200 font-bold">বিশেষ ভিআইপি প্রোমোকোড:</div>
                  <div className="text-sm font-mono font-black text-amber-300 tracking-wider">{config?.promoCode || '—'}</div>
                </div>
                <button
                  onClick={handleCopyPromo}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-purple-900/40 bg-purple-950/30 flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-bengali">BengalBet VIP এক্সক্লুসিভ রিওয়ার্ড</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-bengali transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
