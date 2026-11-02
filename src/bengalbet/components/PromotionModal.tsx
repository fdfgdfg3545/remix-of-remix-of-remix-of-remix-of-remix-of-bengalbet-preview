// @ts-nocheck
import { useLiveRules, liveRulesFor } from '../services/promoLive';
import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  Sparkles, 
  AlertCircle, 
  Share2, 
  ArrowRight, 
  Copy, 
  Check, 
  Gift, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
// import confetti from 'canvas-confetti';
import { Promotion, Language, UserAccount } from '../types';

interface PromotionModalProps {
  promotion: Promotion | null;
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onClaimSuccess: (amount: number, message: string) => void;
  onOpenDeposit: () => void;
  onOpenSpin: () => void;
  onOpenShare: () => void;
  onOpenAppDownload: () => void;
  onOpenMenu?: (menu: string, tab?: string) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  promotion,
  language,
  user,
  onClose,
  onClaimSuccess,
  onOpenDeposit,
  onOpenSpin,
  onOpenShare,
  onOpenAppDownload
}) => {
  const [claimed, setClaimed] = useState(false);
  const live = useLiveRules();
  const liveLines = liveRulesFor(promotion.iconType, live);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!promotion) return null;

  const handleAction = () => {
    if (promotion.actionType === 'deposit') {
      onClose();
      onOpenDeposit();
      return;
    }
    if (promotion.actionType === 'spin') {
      onClose();
      onOpenSpin();
      return;
    }
    if (promotion.actionType === 'invite') {
      onClose();
      onOpenShare();
      return;
    }
    if (promotion.actionType === 'download') {
      onClose();
      onOpenAppDownload();
      return;
    }
    if (promotion.actionType === 'claim') {
      // Claims are settled only on the real offer page by the server.
      onClose();
      const t = promotion.iconType;
      if (t === 'cashback') onOpenMenu?.('reward_center', 'rescue');
      else if (t === 'mystery') onOpenMenu?.('reward_center', 'promo');
      else onOpenMenu?.('rebate');
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="promotion-detail-modal"
        className="relative w-full max-w-2xl bg-[#082a1d] border border-yellow-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with image & gradient banner or Official Policy Header */}
        {promotion.bannerImage ? (
          <div className="relative aspect-[16/7] sm:aspect-[16/6.5] w-full bg-[#04160f] overflow-hidden border-b border-[#14593e]">
            <img
              src={promotion.bannerImage}
              alt={language === 'bn' ? promotion.titleBn : promotion.titleEn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#082a1d] via-[#082a1d]/40 to-transparent pointer-events-none" />

            {/* Close button top right */}
            <button
              id="close-promo-modal-btn"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-200 hover:text-white transition-colors shadow-lg border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title and badges over banner bottom */}
            <div className="absolute bottom-3 left-4 right-4 z-10">
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-red-600 to-amber-600 text-white mb-1 shadow border border-red-400/70 uppercase">
                {language === 'bn' ? promotion.badgeBn || 'অফার' : promotion.badge || 'PROMO'}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {language === 'bn' ? promotion.titleBn : promotion.titleEn}
              </h2>
            </div>
          </div>
        ) : (
          <div className="relative p-5 sm:p-6 bg-gradient-to-br from-[#0c3928] via-[#082a1d] to-[#04160f] border-b border-[#14593e]">
            {/* Close button top right */}
            <button
              id="close-promo-modal-btn"
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 text-gray-200 hover:text-white transition-colors shadow-lg border border-white/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-lg shadow">
                🛡️
              </div>
              <div>
                <span className="text-xs font-black text-emerald-300 tracking-wider block">
                  BengalBet Official Policy & Rules
                </span>
                <span className="text-[10px] text-gray-300">
                  ১৮+ দায়িত্বশীল গেমিং ও স্বচ্ছ লেনদেন পলিসি
                </span>
              </div>
            </div>

            <h2 className="text-lg sm:text-2xl font-bold text-white leading-tight mt-2">
              {language === 'bn' ? promotion.titleBn : promotion.titleEn}
            </h2>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-emerald-100">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#051c13] border border-[#14593e]">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium">
                {language === 'bn' ? 'সর্বোচ্চ বোনাস' : 'Max Bonus'}
              </span>
              <span className="text-sm sm:text-base font-bold text-yellow-400 font-game">
                {promotion.claimableAmount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-medium">
                {language === 'bn' ? 'মেয়াদ' : 'Validity'}
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                {promotion.validUntil || 'সর্বদা সক্রিয়'}
              </span>
            </div>
            <div className="flex flex-col col-span-2 sm:col-span-1">
              <span className="text-[10px] text-gray-400 font-medium">
                {language === 'bn' ? 'প্রোমোকোড' : 'Promo Code'}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-yellow-300">BENGALBETVIP</span>
                <button
                  onClick={() => copyPromoCode('BENGALBETVIP')}
                  className="p-0.5 text-gray-400 hover:text-yellow-400"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'অংশগ্রহণের শর্তাবলী' : 'Eligibility & Requirements'}</span>
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(language === 'bn' ? promotion.requirementsBn : promotion.requirementsEn).map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-300">
                  <span className="text-yellow-400 font-bold">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Rules and Wagering Section */}
          <div className="space-y-2 pt-2 border-t border-[#14593e]/60">
            <h4 className="text-xs sm:text-sm font-bold text-yellow-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{language === 'bn' ? 'উত্তোলন ও বাজি টার্নওভার নিয়ম' : 'Wagering & Cashout Rules'}</span>
            </h4>
            <ul className="space-y-1.5 pl-2">
              {(liveLines.length ? liveLines : (language === 'bn' ? promotion.rulesBn : promotion.rulesEn)).map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-[#051c13] border-t border-[#14593e] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0e432f] hover:bg-[#155e42] text-xs sm:text-sm font-bold text-gray-300"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>

          <button
            id="promo-modal-action-btn"
            onClick={handleAction}
            disabled={claimed}
            className={`
              btn-bdt-gold px-6 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg
              ${claimed ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
            `}
          >
            {claimed ? (
              <>
                <Check className="w-4 h-4" />
                <span>{language === 'bn' ? 'ক্লেইম করা হয়েছে!' : 'Claimed Successfully!'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>{language === 'bn' ? promotion.actionTextBn : promotion.actionTextEn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
