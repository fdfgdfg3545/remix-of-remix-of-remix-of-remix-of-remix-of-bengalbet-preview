// @ts-nocheck
/**
 * BengalBet Refer & Earn Share Modal
 * Features:
 * - Unique referral link & QR code generator with single-click clipboard copying
 * - Multi-tier commission calculation simulator
 * - Social direct sharing (WhatsApp, Telegram, Facebook)
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  DollarSign, 
  QrCode, 
  Sparkles, 
  Send, 
  MessageCircle, 
  Calculator, 
  Award, 
  ShieldCheck, 
  ExternalLink,
  Gift,
  Flame,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../types';

interface ShareModalProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  language,
  user,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'tiers' | 'calc' | 'team'>('invite');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Calculator state
  const [calcInvitedFriends, setCalcInvitedFriends] = useState(10);
  const [calcAvgDeposit, setCalcAvgDeposit] = useState(3000);
  const [calcAvgBet, setCalcAvgBet] = useState(15000);

  const referralUrl = `https://www.bengalbet.com/register?ref=${user.referralCode || 'BDT888'}`;
  const shareText = language === 'bn' 
    ? `🎁 BengalBet এ যোগ দিয়ে ফ্রি ৳৩০০ বোনাস নিন! প্রতিদিন আনলিমিটেড স্পিন ও রিয়েল ক্যাশ রিওয়ার্ড। কোড: ${user.referralCode || 'BDT888'}\n${referralUrl}`
    : `🎁 Join BengalBet and claim instant ৳300 bonus! Daily free spins, live casino & cashback. Referral code: ${user.referralCode || 'BDT888'}\n${referralUrl}`;

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#ffffff']
    });
  };

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    triggerCelebration();
    if (isCode) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BengalBet Casino & Gaming Referral',
          text: shareText,
          url: referralUrl,
        });
      } catch {
        copyToClipboard(referralUrl);
      }
    } else {
      copyToClipboard(referralUrl);
    }
  };

  // Commission Calculations
  // Instant signup bonus: 300 per friend
  const instantBonus = calcInvitedFriends * 300;
  // 0.7% deposit share
  const depositCommission = calcInvitedFriends * calcAvgDeposit * 0.007;
  // 1% turnover/bet commission
  const turnoverCommission = calcInvitedFriends * calcAvgBet * 0.01;
  const estimatedMonthlyIncome = instantBonus + (depositCommission * 4) + (turnoverCommission * 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div 
        id="share-referral-dialog"
        className="relative w-full max-w-2xl bg-[#082a1d] border-2 border-yellow-400/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header Banner */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-[#0a462e] to-teal-950 border-b border-[#14593e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 text-black flex items-center justify-center shadow-lg font-black">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-game tracking-wide">
                  {language === 'bn' ? 'রেফারেল প্রোগ্রাম ও সুপার এজেন্ট' : 'Referral & Super Agent'}
                </h2>
                <span className="bg-yellow-400/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-400/30">
                  {language === 'bn' ? 'লাইফটাইম আয়' : 'Lifetime'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-yellow-300 font-semibold">
                {language === 'bn' ? '১ জন আমন্ত্রণে ৳ ৩০০ ক্যাশ + ০.৭% ডিপোজিট + ১% বাজি কমিশন' : 'Invite 1 Friend: ৳300 Cash + 0.7% Deposit + 1.0% Bet Commission'}
              </p>
            </div>
          </div>

          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#051c13] border-b border-[#14593e] px-2 pt-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            id="share-tab-invite"
            onClick={() => setActiveTab('invite')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'invite'
                ? 'bg-[#082a1d] text-yellow-300 border-t-2 border-x border-[#14593e] border-t-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            {language === 'bn' ? 'আমন্ত্রণ ও শেয়ার' : 'Invite & Share'}
          </button>

          <button
            id="share-tab-tiers"
            onClick={() => setActiveTab('tiers')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'bg-[#082a1d] text-yellow-300 border-t-2 border-x border-[#14593e] border-t-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            {language === 'bn' ? 'কমিশন টিয়ার' : 'Commission Tiers'}
          </button>

          <button
            id="share-tab-calc"
            onClick={() => setActiveTab('calc')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calc'
                ? 'bg-[#082a1d] text-yellow-300 border-t-2 border-x border-[#14593e] border-t-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ইনকাম ক্যালকুলেটর' : 'Income Calculator'}
          </button>

          <button
            id="share-tab-team"
            onClick={() => setActiveTab('team')}
            className={`px-3 sm:px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'team'
                ? 'bg-[#082a1d] text-yellow-300 border-t-2 border-x border-[#14593e] border-t-yellow-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            {language === 'bn' ? 'আমার টিম ও আয়' : 'My Team'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* TAB 1: INVITE & SHARE */}
          {activeTab === 'invite' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Quick Summary Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 sm:p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'আমন্ত্রিত বন্ধু' : 'Referred'}</span>
                  <span className="text-base sm:text-lg font-black text-yellow-400 font-game">{user.referredFriendsCount || 4} জন</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'মোট কমিশন আয়' : 'Total Earnings'}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-game">৳ {(user.totalEarnings || 1850).toLocaleString()}</span>
                </div>
                <div className="p-2.5 sm:p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'এজেন্ট লেভেল' : 'Agent Level'}</span>
                  <span className="text-xs sm:text-sm font-bold text-amber-300 mt-1 block">VIP Gold</span>
                </div>
              </div>

              {/* Referral Link & Code Box */}
              <div className="bg-[#051c13] border border-yellow-500/40 rounded-xl p-3.5 sm:p-4 space-y-3 shadow-inner">
                {/* Link */}
                <div>
                  <label className="text-[11px] font-bold text-gray-300 flex items-center justify-between mb-1">
                    <span>{language === 'bn' ? 'আপনার ইউনিক রেফারেল ইনভাইট লিংক' : 'Your Unique Referral Link'}</span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {language === 'bn' ? 'স্বয়ংক্রিয় ট্র্যাকিং সক্রিয়' : 'Auto-tracking active'}
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralUrl}
                      className="flex-1 bg-[#092c1e] border border-[#14593e] text-emerald-100 text-xs px-3 py-2.5 rounded-lg font-mono truncate select-all focus:outline-none focus:border-yellow-400"
                    />
                    <button
                      id="copy-referral-link-btn"
                      onClick={() => copyToClipboard(referralUrl)}
                      className="btn-bdt-gold px-3.5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow cursor-pointer transition-transform active:scale-95"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                      <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (language === 'bn' ? 'লিংক কপি' : 'Copy Link')}</span>
                    </button>
                  </div>
                </div>

                {/* Code & QR Trigger */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-[#14593e]/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-300 font-bold">{language === 'bn' ? 'রেফারেল কোড:' : 'Code:'}</span>
                    <span className="bg-[#092c1e] border border-[#14593e] text-yellow-400 text-xs font-mono font-bold px-3 py-1 rounded-md">
                      {user.referralCode || 'BDT888'}
                    </span>
                    <button
                      id="copy-referral-code-btn"
                      onClick={() => copyToClipboard(user.referralCode || 'BDT888', true)}
                      className="px-2.5 py-1 rounded-md bg-[#0e432f] hover:bg-[#155e42] text-[11px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কোড কপি' : 'Copy Code')}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="toggle-qr-code-btn"
                      onClick={() => setShowQr(!showQr)}
                      className="px-3 py-1.5 rounded-lg bg-[#0e432f] hover:bg-[#155e42] text-xs font-bold text-yellow-300 flex items-center gap-1.5 border border-yellow-500/20 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{showQr ? (language === 'bn' ? 'QR বন্ধ করুন' : 'Hide QR') : (language === 'bn' ? 'QR কোড দেখুন' : 'Show QR')}</span>
                    </button>

                    <button
                      id="native-share-btn"
                      onClick={handleNativeShare}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* QR Code Viewer Section */}
                {showQr && (
                  <div className="mt-3 p-4 bg-[#092c1e] border border-yellow-400/40 rounded-xl flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                    <div className="p-3 bg-white rounded-xl shadow-lg inline-block mb-2">
                      {/* Stylized QR placeholder SVG with BengalBet brand in center */}
                      <svg className="w-32 h-32 text-black" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zm5 5h20v20H5zm3 3h14v14H8zM70 0h30v30H70zm5 5h20v20H75zm3 3h14v14H78zM0 70h30v30H0zm5 5h20v20H5zm3 3h14v14H8zM40 10h10v10H40zm10 20h10v10H50zm-20 20h10v10H30zm30 0h10v10H60zm20 10h10v10H80zm-40 20h10v10H40zm20 0h10v10H60zm-30 10h10v10H30zm40 10h10v10H70z" />
                        <rect x="42" y="42" width="16" height="16" rx="3" fill="#047857" />
                        <text x="50" y="53" fill="#facc15" fontSize="6" fontWeight="bold" textAnchor="middle">BDT</text>
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-yellow-300 mb-0.5">
                      {language === 'bn' ? 'স্ক্যান করে সরাসরি রেজিস্ট্রেশন করুন' : 'Scan to Register Directly'}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      {language === 'bn' ? 'যেকোনো মোবাইল ক্যামেরা বা bKash/Nagad অ্যাপ দিয়ে স্ক্যান করুন' : 'Scan with mobile camera or scanner app'}
                    </p>
                  </div>
                )}
              </div>

              {/* Social Channels Quick Share */}
              <div>
                <p className="text-xs font-bold text-gray-300 mb-2">
                  {language === 'bn' ? 'সরাসরি সোশ্যাল মিডিয়ায় শেয়ার করুন:' : 'One-Click Social Share:'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#128C7E]/20 hover:bg-[#128C7E]/35 border border-[#128C7E]/40 rounded-xl flex items-center gap-2 text-white text-xs font-bold transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <span>WhatsApp</span>
                  </a>

                  {/* Telegram */}
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#0088cc]/20 hover:bg-[#0088cc]/35 border border-[#0088cc]/40 rounded-xl flex items-center gap-2 text-white text-xs font-bold transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#0088cc] text-white flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                    <span>Telegram</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/35 border border-[#1877F2]/40 rounded-xl flex items-center gap-2 text-white text-xs font-bold transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-xs">
                      f
                    </div>
                    <span>Facebook</span>
                  </a>

                  {/* Messenger */}
                  <a
                    href={`fb-messenger://share/?link=${encodeURIComponent(referralUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#00B2FF]/20 hover:bg-[#00B2FF]/35 border border-[#00B2FF]/40 rounded-xl flex items-center gap-2 text-white text-xs font-bold transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#00B2FF] to-[#006AFF] text-white flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>Messenger</span>
                  </a>
                </div>
              </div>

              {/* Quick Step Rules */}
              <div className="p-3.5 bg-[#051c13] border border-[#14593e] rounded-xl space-y-1.5 text-[11px] text-emerald-200">
                <h4 className="font-bold text-yellow-400 text-xs flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'bn' ? 'সহজ ৩ ধাপে আয় শুরু করুন:' : 'Earn in 3 Simple Steps:'}
                </h4>
                <p>1. <strong>লিংক শেয়ার করুন:</strong> বন্ধুদের ফেসবুক, হোয়াটসঅ্যাপ বা টেলিগ্রামে ইনভাইট লিংক পাঠান।</p>
                <p>2. <strong>বন্ধু সাইন আপ:</strong> বন্ধু রেজিস্ট্রেশন করে ডিপোজিট করলেই পাবেন সাথে সাথে ৳ ৩০০ ফিক্সড ক্যাশ।</p>
                <p>3. <strong>দৈনিক আনলিমিটেড কমিশন:</strong> বন্ধুর ডিপোজিটে ০.৭% এবং প্রতিটি বাজিতে ১% লাইফটাইম কমিশন উপভোগ করুন।</p>
              </div>
            </div>
          )}

          {/* TAB 2: COMMISSION TIERS */}
          {activeTab === 'tiers' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="bg-[#051c13] border border-yellow-500/30 rounded-xl p-4 text-center">
                <h3 className="text-sm sm:text-base font-black text-yellow-400 font-game mb-1">
                  {language === 'bn' ? '৩-লেভেল মাল্টি-টিয়ার এজেন্ট কমিশন' : '3-Tier Multi-Level Agent Commissions'}
                </h3>
                <p className="text-xs text-emerald-200">
                  {language === 'bn' 
                    ? 'আপনার রেফার করা বন্ধুরা যখন অন্য বন্ধুদের রেফার করবে, তাদের থেকেও কমিশন পাবেন!' 
                    : 'Earn commissions not only from your direct invites, but from sub-referrals as well!'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Level 1 */}
                <div className="p-3.5 bg-[#051c13] border-2 border-yellow-400/80 rounded-xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                    DIRECT
                  </div>
                  <h4 className="font-black text-yellow-300 text-sm">Level 1 (সরাসরি বন্ধু)</h4>
                  <ul className="space-y-1.5 text-xs text-gray-200">
                    <li className="flex items-center gap-1.5 font-bold text-white">
                      <Gift className="w-3.5 h-3.5 text-yellow-400" />
                      <span>৳ ৩০০ ইনস্ট্যান্ট ক্যাশ</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>০.৭% ডিপোজিট শেয়ার</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>১.০% বেট টার্নওভার</span>
                    </li>
                  </ul>
                </div>

                {/* Level 2 */}
                <div className="p-3.5 bg-[#051c13] border border-[#14593e] rounded-xl space-y-2 relative">
                  <div className="absolute top-0 right-0 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                    TIER 2
                  </div>
                  <h4 className="font-black text-emerald-300 text-sm">Level 2 (বন্ধুর বন্ধু)</h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    <li className="flex items-center gap-1.5 font-bold text-white">
                      <Gift className="w-3.5 h-3.5 text-yellow-400" />
                      <span>৳ ৫০ বোনাস</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>০.৩% ডিপোজিট শেয়ার</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>০.৩% বেট টার্নওভার</span>
                    </li>
                  </ul>
                </div>

                {/* Level 3 */}
                <div className="p-3.5 bg-[#051c13] border border-[#14593e] rounded-xl space-y-2 relative">
                  <div className="absolute top-0 right-0 bg-teal-800 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                    TIER 3
                  </div>
                  <h4 className="font-black text-teal-300 text-sm">Level 3 (সাব-এজেন্ট)</h4>
                  <ul className="space-y-1.5 text-xs text-gray-300">
                    <li className="flex items-center gap-1.5 font-bold text-white">
                      <Gift className="w-3.5 h-3.5 text-yellow-400" />
                      <span>৳ ২০ বোনাস</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>০.১% ডিপোজিট শেয়ার</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>০.১% বেট টার্নওভার</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Payout Information */}
              <div className="p-3.5 bg-[#092c1e] border border-[#14593e] rounded-xl flex items-start gap-3 text-xs text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-300 mb-0.5">
                    {language === 'bn' ? 'দৈনিক স্বয়ংক্রিয় সেটেলমেন্ট ও উইথড্রয়াল' : 'Daily Automatic Settlement & Withdraw'}
                  </p>
                  <p className="text-[11px] text-gray-300">
                    {language === 'bn'
                      ? 'প্রতিদিন রাত ১২:০০ টায় আপনার রেফারেল কমিশন সরাসরি ওয়ালেটে যোগ হয়। bKash, Nagad বা Rocket এ কোনো চার্জ ছাড়াই সাথে সাথে তুলে নিতে পারবেন।'
                      : 'Commission is settled every midnight into your wallet. Withdraw immediately via bKash, Nagad or Rocket with 0 fee.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSION CALCULATOR */}
          {activeTab === 'calc' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-[#051c13] border border-yellow-500/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-yellow-400 text-sm flex items-center gap-1.5">
                    <Calculator className="w-4 h-4" />
                    {language === 'bn' ? 'সম্ভাব্য মাসিক ইনকাম ক্যালকুলেটর' : 'Estimated Monthly Income Calculator'}
                  </h4>
                  <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                    Live Projection
                  </span>
                </div>

                {/* Slider 1: Number of friends */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{language === 'bn' ? 'আমন্ত্রিত সক্রিয় বন্ধু সংখ্যা:' : 'Active Referred Friends:'}</span>
                    <span className="font-bold text-yellow-300">{calcInvitedFriends} জন</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calcInvitedFriends}
                    onChange={(e) => setCalcInvitedFriends(Number(e.target.value))}
                    className="w-full accent-yellow-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>১ জন</span>
                    <span>৫০ জন</span>
                    <span>১০০ জন</span>
                  </div>
                </div>

                {/* Slider 2: Average Deposit */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{language === 'bn' ? 'প্রতি বন্ধুর মাসিক গড় ডিপোজিট:' : 'Avg. Monthly Deposit per Friend:'}</span>
                    <span className="font-bold text-emerald-400">৳ {calcAvgDeposit.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={calcAvgDeposit}
                    onChange={(e) => setCalcAvgDeposit(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Slider 3: Average Bet Volume */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{language === 'bn' ? 'প্রতি বন্ধুর মাসিক বেট টার্নওভার:' : 'Avg. Monthly Bet Turnover:'}</span>
                    <span className="font-bold text-amber-300">৳ {calcAvgBet.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="200000"
                    step="1000"
                    value={calcAvgBet}
                    onChange={(e) => setCalcAvgBet(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Result Box */}
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 via-emerald-900/40 to-teal-900/40 border-2 border-yellow-400 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div>
                  <span className="text-xs text-yellow-300 font-bold block">
                    {language === 'bn' ? 'আপনার আনুমানিক সম্ভাব্য মাসিক আয়:' : 'Your Estimated Monthly Earnings:'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-yellow-400 font-game mt-0.5">
                    ৳ {Math.round(estimatedMonthlyIncome).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-gray-300">
                    ৳ {instantBonus.toLocaleString()} (সাইন-আপ বোনাস) + ৳ {Math.round(depositCommission * 4).toLocaleString()} (ডিপোজিট শেয়ার) + ৳ {Math.round(turnoverCommission * 4).toLocaleString()} (টার্নওভার)
                  </span>
                </div>

                <button
                  id="calc-copy-share-btn"
                  onClick={() => copyToClipboard(referralUrl)}
                  className="btn-bdt-gold px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg whitespace-nowrap cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'bn' ? 'এখনই ইনভাইট করুন' : 'Invite Now'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MY TEAM & STATS */}
          {activeTab === 'team' && (
            <div className="space-y-3.5 animate-in fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'টিম সাইজ' : 'Team Size'}</span>
                  <span className="text-lg font-black text-white font-game">{user.referredFriendsCount || 4} জন</span>
                </div>
                <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'সক্রিয় মেম্বার' : 'Active Members'}</span>
                  <span className="text-lg font-black text-emerald-400 font-game">3 জন</span>
                </div>
                <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'আজকের কমিশন' : 'Today Commission'}</span>
                  <span className="text-lg font-black text-yellow-400 font-game">৳ 320</span>
                </div>
                <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl text-center">
                  <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'মোট উইথড্র' : 'Total Withdrawn'}</span>
                  <span className="text-lg font-black text-teal-300 font-game">৳ 1,500</span>
                </div>
              </div>

              {/* Recent Referrals List */}
              <div className="bg-[#051c13] border border-[#14593e] rounded-xl p-3.5 space-y-2">
                <h4 className="font-bold text-yellow-400 text-xs flex items-center justify-between">
                  <span>{language === 'bn' ? 'সাম্প্রতিক আমন্ত্রিত মেম্বারদের তালিকা' : 'Recent Invited Members'}</span>
                  <span className="text-[10px] text-gray-400">{language === 'bn' ? 'সর্বশেষ ৪ জন' : 'Latest 4'}</span>
                </h4>
                
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-[#092c1e] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">017****8832</span>
                      <span className="text-[10px] text-gray-400 block">Level 1 • আজ ১২:৪০ PM</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">+৳ 300</span>
                      <span className="text-[10px] text-yellow-300 block">ডিপোজিট সম্পন্ন</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#092c1e] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">018****4491</span>
                      <span className="text-[10px] text-gray-400 block">Level 1 • গতকাল ৫:১৫ PM</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">+৳ 450</span>
                      <span className="text-[10px] text-yellow-300 block">টার্নওভার বোনাস</span>
                    </div>
                  </div>

                  <div className="p-2 bg-[#092c1e] rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">019****1104</span>
                      <span className="text-[10px] text-gray-400 block">Level 2 • ২ দিন আগে</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-400">+৳ 120</span>
                      <span className="text-[10px] text-emerald-300 block">সাব-টিয়ার শেয়ার</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Action */}
        <div className="p-3 sm:p-4 bg-[#051c13] border-t border-[#14593e] flex items-center justify-between gap-2">
          <div className="text-[11px] text-gray-400 hidden sm:block">
            {language === 'bn' ? 'যেকোনো প্রশ্নে ২৪/৭ লাইভ চ্যাট সাপোর্ট সক্রিয়' : '24/7 Live Chat Support Available'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <button
              onClick={() => copyToClipboard(referralUrl)}
              className="btn-bdt-gold px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'লিংক শেয়ার করুন' : 'Share Referral'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

