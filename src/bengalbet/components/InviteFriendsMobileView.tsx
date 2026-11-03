// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Copy, 
  Check, 
  Gift, 
  Calendar, 
  ChevronDown, 
  Share2, 
  Users, 
  Award, 
  Download,
  Info,
  DollarSign,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  ArrowUpRight,
  Link,
  Plus,
  Lock,
  Unlock,
  Trophy,
  Zap,
  Layers,
  CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { useReferralBoard } from '../services/referralBoard';
import { api } from '../services/api';
import referRewardsBannerImg from '../assets/images/bengalbet_refer_rewards_banner_1790186975892.jpg';

interface InviteFriendsMobileViewProps {
  user: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
}

// 15 Invite Tasks for Tab 2 (পুরস্কার)
interface InviteTask {
  id: number;
  count: number;
  bonus: number;
  bonusDisplay: string;
  color: 'gold' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';
  currentProgress: number;
  claimed: boolean;
}

/** Server pays one instant bonus per qualified friend (auto-credited); there is no larger milestone ladder. */
const TASK_COLORS: InviteTask['color'][] = ['gold', 'emerald', 'blue', 'purple', 'rose'];
const buildInviteTasks = (bonus: number, qualified: number): InviteTask[] => TASK_COLORS.map((color, i) => ({
  id: i + 1, count: i + 1, bonus, bonusDisplay: bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  color, currentProgress: Math.min(qualified, i + 1), claimed: qualified >= i + 1,
}));
const INITIAL_INVITE_TASKS: InviteTask[] = buildInviteTasks(0, 0);

// Live stream payout records pool matching Capture9.PNG
const LIVE_PAYOUTS = [
  { id: '1', phone: '17*******5', status: 'গৃহীত', amount: '৳ 300.00', time: '১ মিনিট আগে' },
  { id: '2', phone: '18*******3', status: 'গৃহীত', amount: '৳ 1,500.00', time: '২ মিনিট আগে' },
  { id: '3', phone: '19*******7', status: 'গৃহীত', amount: '৳ 300.00', time: '৩ মিনিট আগে' },
  { id: '4', phone: '16*******2', status: 'গৃহীত', amount: '৳ 3,000.00', time: '৪ মিনিট আগে' },
  { id: '5', phone: '13*******8', status: 'গৃহীত', amount: '৳ 1,500.00', time: '৫ মিনিট আগে' },
  { id: '6', phone: '18*******4', status: 'গৃহীত', amount: '৳ 300.00', time: '৬ মিনিট আগে' },
  { id: '7', phone: '17*******9', status: 'গৃহীত', amount: '৳ 5,000.00', time: '৭ মিনিট আগে' },
  { id: '8', phone: '15*******1', status: 'গৃহীত', amount: '৳ 300.00', time: '৮ মিনিট আগে' },
];

// Rich Sample Records Data for Tab 4
interface ReferralRecordItem {
  id: string;
  regDate: string;
  username: string;
  category: string;
  amount: string;
  status: 'সফল' | 'প্রক্রিয়াধীন';
}


// Rich Sample Invited Friends Data for Tab 5
interface InvitedFriendItem {
  id: string;
  username: string;
  regDate: string;
  phone: string;
  isQualified: boolean;
  depositAmount: number;
  betAmount: number;
  commission: number;
  period: 'today' | 'yesterday' | 'month';
}


/* ========================================================================= */
/* PREMIUM VECTOR GRAPHICS & ICONS COMPONENTS                               */
/* ========================================================================= */

// 1. Premium 3D Golden Trophy
const PremiumTrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="trophyGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stopColor="#fff8db" />
        <stop offset="50%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#d97706" />
      </radialGradient>
      <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="30%" stopColor="#fbbf24" />
        <stop offset="70%" stopColor="#b45309" />
        <stop offset="100%" stopColor="#78350f" />
      </linearGradient>
      <linearGradient id="cupBase" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#92400e" />
      </linearGradient>
      <filter id="trophyShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.3" />
      </filter>
    </defs>
    
    {/* Radial Aura Glow */}
    <circle cx="50" cy="45" r="42" fill="url(#trophyGlow)" opacity="0.25" />
    
    {/* Base Pedestal */}
    <path d="M 28 84 L 72 84 L 68 76 L 32 76 Z" fill="url(#cupBase)" filter="url(#trophyShadow)" />
    <rect x="22" y="84" width="56" height="8" rx="3" fill="#78350f" />
    <rect x="24" y="85" width="52" height="3" rx="1.5" fill="#fde047" opacity="0.6" />
    
    {/* Pedestal Stem */}
    <path d="M 44 64 L 56 64 L 54 76 L 46 76 Z" fill="url(#cupBase)" />
    <ellipse cx="50" cy="64" rx="8" ry="3" fill="#fef08a" />

    {/* Trophy Cup Body */}
    <path d="M 30 20 Q 30 58 50 64 Q 70 58 70 20 Z" fill="url(#goldShine)" filter="url(#trophyShadow)" />
    <ellipse cx="50" cy="20" rx="20" ry="6" fill="#fef08a" />
    <ellipse cx="50" cy="20" rx="17" ry="4" fill="#92400e" />

    {/* Left Handle */}
    <path d="M 30 24 C 12 24 10 46 32 48" stroke="url(#cupBase)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
    {/* Right Handle */}
    <path d="M 70 24 C 88 24 90 46 68 48" stroke="url(#cupBase)" strokeWidth="5.5" strokeLinecap="round" fill="none" />

    {/* Star Emboss on Cup */}
    <polygon points="50,30 53,38 61,38 55,43 57,51 50,46 43,51 45,43 39,38 47,38" fill="#ffffff" opacity="0.9" />

    {/* Top Sparkles */}
    <path d="M 20 14 L 22 18 L 26 20 L 22 22 L 20 26 L 18 22 L 14 20 L 18 18 Z" fill="#ffffff" />
    <path d="M 78 12 L 79.5 15 L 82.5 16.5 L 79.5 18 L 78 21 L 76.5 18 L 73.5 16.5 L 76.5 15 Z" fill="#fef08a" />
  </svg>
);

// 2. Premium 3D Medal Icon
const PremiumMedalIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ribbonLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="ribbonRight" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>
      <radialGradient id="medalGold" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fffbeb" />
        <stop offset="35%" stopColor="#fbbf24" />
        <stop offset="85%" stopColor="#d97706" />
        <stop offset="100%" stopColor="#92400e" />
      </radialGradient>
      <filter id="medalShadow" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Ribbons */}
    <path d="M 32 10 L 46 54 L 30 54 L 18 10 Z" fill="url(#ribbonLeft)" />
    <path d="M 68 10 L 54 54 L 70 54 L 82 10 Z" fill="url(#ribbonRight)" />
    <path d="M 42 10 L 58 10 L 50 48 Z" fill="#ffffff" opacity="0.4" />

    {/* Outer Medal Circle */}
    <circle cx="50" cy="62" r="30" fill="url(#medalGold)" filter="url(#medalShadow)" />
    <circle cx="50" cy="62" r="25" stroke="#fef08a" strokeWidth="2.5" strokeDasharray="3 2" fill="none" opacity="0.8" />
    <circle cx="50" cy="62" r="22" fill="#d97706" opacity="0.3" />

    {/* Inner Star */}
    <polygon points="50,45 54,56 65,56 56,63 59,74 50,67 41,74 44,63 35,56 46,56" fill="#ffffff" />
    <circle cx="50" cy="62" r="4" fill="#fbbf24" />
  </svg>
);

// 3. Premium 3D Money Bag Icon
const PremiumMoneyBagIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="emeraldBag" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="40%" stopColor="#10b981" />
        <stop offset="90%" stopColor="#047857" />
        <stop offset="100%" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="bagRope" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
    </defs>

    {/* Gold Coins behind bag */}
    <ellipse cx="68" cy="78" rx="14" ry="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
    <ellipse cx="68" cy="75" rx="14" ry="7" fill="#fbbf24" />
    
    <ellipse cx="32" cy="80" rx="14" ry="7" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
    <ellipse cx="32" cy="77" rx="14" ry="7" fill="#fbbf24" />

    {/* Bag Top Pleats */}
    <path d="M 36 28 C 30 16, 42 12, 50 16 C 58 12, 70 16, 64 28 Z" fill="#10b981" />
    <path d="M 38 27 C 44 20, 56 20, 62 27" stroke="#047857" strokeWidth="2" fill="none" />

    {/* Gold Tie String */}
    <rect x="34" y="27" width="32" height="7" rx="3.5" fill="url(#bagRope)" />
    <circle cx="50" cy="30.5" r="4.5" fill="#fde047" stroke="#b45309" strokeWidth="1" />

    {/* Hanging Tassels */}
    <path d="M 48 34 Q 45 42 42 46" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
    <path d="M 52 34 Q 55 42 58 46" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

    {/* Main Bag Body */}
    <path d="M 35 32 C 16 42 12 76 26 86 C 36 93 64 93 74 86 C 88 76 84 42 65 32 Z" fill="url(#emeraldBag)" />

    {/* Specular Highlight Curve */}
    <path d="M 30 46 C 24 54 24 68 32 78" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" opacity="0.6" fill="none" />

    {/* Golden Currency Emblem on Bag */}
    <circle cx="50" cy="62" r="14" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
    <circle cx="50" cy="62" r="11" fill="#fef08a" />
    <text x="50" y="68" textAnchor="middle" fill="#78350f" fontSize="16" fontWeight="900" fontFamily="sans-serif">৳</text>
  </svg>
);

// 4. Premium 3D Betting Rebate Icon (Soccer + Cash)
const PremiumRebateIcon: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ballBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="cashGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="60%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
    </defs>

    {/* Stack of Cash Behind */}
    <rect x="36" y="20" width="48" height="30" rx="5" fill="#0284c7" transform="rotate(18 60 35)" stroke="#e0f2fe" strokeWidth="1.5" />
    <rect x="34" y="22" width="48" height="30" rx="5" fill="#38bdf8" transform="rotate(8 58 37)" stroke="#ffffff" strokeWidth="1.5" />
    
    {/* Dollar on Cash */}
    <circle cx="62" cy="38" r="7" fill="#ffffff" opacity="0.8" />
    <text x="62" y="42" textAnchor="middle" fill="#0369a1" fontSize="10" fontWeight="bold">$</text>

    {/* Soccer Ball in Foreground */}
    <circle cx="42" cy="58" r="26" fill="url(#ballBg)" stroke="#334155" strokeWidth="2" />

    {/* Soccer Pentagons Pattern */}
    <polygon points="42,48 50,54 47,63 37,63 34,54" fill="#0f172a" />
    <line x1="42" y1="48" x2="42" y2="34" stroke="#0f172a" strokeWidth="2" />
    <line x1="50" y1="54" x2="62" y2="52" stroke="#0f172a" strokeWidth="2" />
    <line x1="47" y1="63" x2="56" y2="76" stroke="#0f172a" strokeWidth="2" />
    <line x1="37" y1="63" x2="28" y2="76" stroke="#0f172a" strokeWidth="2" />
    <line x1="34" y1="54" x2="20" y2="52" stroke="#0f172a" strokeWidth="2" />

    {/* Shiny Gold Badge in Bottom Right */}
    <circle cx="72" cy="72" r="16" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
    <circle cx="72" cy="72" r="13" fill="#fde047" />
    <text x="72" y="77" textAnchor="middle" fill="#78350f" fontSize="12" fontWeight="900">%</text>
  </svg>
);

// 5. Stylized QR Code with Center Badge
const PremiumQRCode: React.FC<{ value: string; className?: string }> = ({ value, className = 'w-28 h-28' }) => (
  <div className={`relative bg-white rounded-xl p-2 border border-gray-300 shadow-sm flex items-center justify-center ${className}`}>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect width="100" height="100" fill="#ffffff" />
      {/* Top Left Marker */}
      <rect x="6" y="6" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="10" y="10" width="18" height="18" fill="#ffffff" rx="2" />
      <rect x="14" y="14" width="10" height="10" fill="#0284c7" rx="2" />

      {/* Top Right Marker */}
      <rect x="68" y="6" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="72" y="10" width="18" height="18" fill="#ffffff" rx="2" />
      <rect x="76" y="14" width="10" height="10" fill="#0284c7" rx="2" />

      {/* Bottom Left Marker */}
      <rect x="6" y="68" width="26" height="26" fill="#0f172a" rx="4" />
      <rect x="10" y="72" width="18" height="18" fill="#ffffff" rx="2" />
      <rect x="14" y="76" width="10" height="10" fill="#0284c7" rx="2" />

      {/* Data Pixels Matrix */}
      <rect x="38" y="8" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="52" y="8" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="38" y="20" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="48" y="26" width="8" height="6" fill="#1e293b" rx="1" />

      <rect x="8" y="38" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="20" y="38" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="36" y="38" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="58" y="38" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="74" y="38" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="86" y="38" width="6" height="6" fill="#1e293b" rx="1" />

      <rect x="38" y="52" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="54" y="52" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="68" y="52" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="84" y="52" width="6" height="6" fill="#1e293b" rx="1" />

      <rect x="38" y="68" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="54" y="68" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="72" y="68" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="86" y="68" width="6" height="6" fill="#1e293b" rx="1" />

      <rect x="38" y="84" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="50" y="80" width="8" height="6" fill="#1e293b" rx="1" />
      <rect x="68" y="84" width="6" height="6" fill="#1e293b" rx="1" />
      <rect x="82" y="80" width="8" height="6" fill="#1e293b" rx="1" />
    </svg>

    {/* Center Brand Badge */}
    <div className="absolute inset-0 m-auto w-7 h-7 rounded-md bg-[#0b3327] border-2 border-white flex items-center justify-center shadow-md">
      <span className="text-[8px] font-black text-[#facc15] tracking-tighter">222</span>
    </div>
  </div>
);

export const InviteFriendsMobileView: React.FC<InviteFriendsMobileViewProps> = ({
  user,
  onBack,
  showToast = () => {}
}) => {
  // 5 Main Tabs matching screenshots
  const [activeTab, setActiveTab] = useState<'summary' | 'rewards' | 'income' | 'records' | 'invitedList'>('summary');
  
  // Real Backend State
  const [liveStats, setLiveStats] = useState<any>(null);
  const [liveFriends, setLiveFriends] = useState<any[]>([]);
  const [liveRecords, setLiveRecords] = useState<any[]>([]);
  const [isLoadingRealData, setIsLoadingRealData] = useState(false);
  const [isBindingModalOpen, setIsBindingModalOpen] = useState(false);
  const [bindReferralCodeInput, setBindReferralCodeInput] = useState('');
  const [isSubmittingBind, setIsSubmittingBind] = useState(false);

  // Link & Code
  const referralCode = liveStats?.referralCode || user?.referralCode || 'wcc4192';
  const referralLink = `http://www.bengalbet.vip/?r=${referralCode}`;
  const [copied, setCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Revenue Estimator Slider State
  const [calculatorUsers, setCalculatorUsers] = useState<number>(1);
  const [simulatedRangeCount, setSimulatedRangeCount] = useState<number>(5);

  // Live Payout Ticker State
  const board = useReferralBoard();
  const liveList = board.recent.slice(0, 4);

  // Records Filter State
  const [recordCategory, setRecordCategory] = useState<string>('সব');
  const [isRecordDropdownOpen, setIsRecordDropdownOpen] = useState(false);
  const [useSampleDataInRecords, setUseSampleDataInRecords] = useState(true);

  // Invited List Filter State
  const [invitedFilter, setInvitedFilter] = useState<string>('সব');
  const [isInvitedDropdownOpen, setIsInvitedDropdownOpen] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday' | 'month'>('today');
  const [useSampleDataInInvited, setUseSampleDataInInvited] = useState(true);
  const [searchInvitedQuery, setSearchInvitedQuery] = useState('');

  // Tasks state
  const [tasks, setTasks] = useState<InviteTask[]>(INITIAL_INVITE_TASKS);

  // Load real referral data from API
  const loadRealData = async () => {
    setIsLoadingRealData(true);
    try {
      const [statsRes, friendsRes, recordsRes] = await Promise.all([
        api.referral.getStats(),
        api.referral.getFriends(),
        api.referral.getRecords()
      ]);

      if (statsRes.success) {
        setLiveStats(statsRes);
        setTasks(buildInviteTasks(Number(statsRes.commissionRates?.instantBonus ?? 0), Number((statsRes as any).qualifiedFriends ?? 0)));
        if (statsRes.tiers && statsRes.tiers.length > 0) {
          const colorList: Array<'gold' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber'> = [
            'gold', 'emerald', 'blue', 'purple', 'rose', 'amber'
          ];
          setTasks(statsRes.tiers.map((t, idx) => ({
            id: t.id,
            count: t.count,
            bonus: t.bonus,
            bonusDisplay: t.bonusDisplay || t.bonus.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            color: colorList[idx % colorList.length],
            currentProgress: t.currentProgress,
            claimed: t.isClaimed
          })));
        }
      }

      if (friendsRes.success && friendsRes.friends) {
        setLiveFriends(friendsRes.friends);
      }

      if (recordsRes.success && recordsRes.records) {
        setLiveRecords(recordsRes.records);
      }
    } catch (err) {
      console.error('Failed to load referral live stats', err);
    } finally {
      setIsLoadingRealData(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('রেফারেল লিংক কপি করা হয়েছে!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveQrCode = () => {
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 }
    });
    showToast('QR কোড সফলভাবে ডিভাইসে সংরক্ষিত হয়েছে!');
  };

  const handleSocialShare = (platform: string) => {
    showToast(`${platform} এ রেফারেল লিংক শেয়ার করা হচ্ছে...`);
    const shareUrl = encodeURIComponent(referralLink);
    const text = encodeURIComponent('BengalBet এ যোগ দিন এবং ৩০০ টাকা রেফারেল বোনাস পান!');
    
    let target = '';
    if (platform === 'facebook') target = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    else if (platform === 'twitter') target = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${text}`;
    else if (platform === 'telegram') target = `https://t.me/share/url?url=${shareUrl}&text=${text}`;
    else if (platform === 'whatsapp') target = `https://api.whatsapp.com/send?text=${text}%20${shareUrl}`;
    
    if (target) {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClaimTask = async (task: InviteTask) => {
    if (task.claimed) return;
    try {
      const res = await api.referral.claimTier(task.id);
      if (res.success) {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 }
        });
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, claimed: true } : t));
        showToast(res.message || `টাস্ক ${task.count} সম্পন্ন! ৳${task.bonusDisplay} বোনাস সফলভাবে গৃহীত হয়েছে!`);
        loadRealData();
      } else {
        showToast(res.message || 'বোনাস দাবি করা সম্ভব হয়নি');
      }
    } catch (err: any) {
      showToast(err.message || 'দাবিতে ত্রুটি হয়েছে');
    }
  };

  const [isClaimingPoroskarLevel, setIsClaimingPoroskarLevel] = useState<number | null>(null);

  const handleClaimPoroskarLevel = async (level: number) => {
    if (isClaimingPoroskarLevel !== null) return;
    setIsClaimingPoroskarLevel(level);
    try {
      const res = await api.referral.claimPoroskarLevel(level);
      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 85,
          origin: { y: 0.6 }
        });
        showToast(res.message || `লেভেল ${level} পুরস্কার সফলভাবে গৃহীত হয়েছে!`);
        await loadRealData();
      } else {
        showToast(res.message || 'পুরস্কার দাবি করা সম্ভব হয়নি');
      }
    } catch (err: any) {
      showToast(err.message || 'দাবিতে ত্রুটি হয়েছে');
    } finally {
      setIsClaimingPoroskarLevel(null);
    }
  };

  const handleBindReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bindReferralCodeInput.trim()) {
      showToast('রেফারেল কোড প্রদান করুন');
      return;
    }
    setIsSubmittingBind(true);
    try {
      const res = await api.referral.bindCode(bindReferralCodeInput.trim().toUpperCase());
      if (res.success) {
        confetti({ particleCount: 50, spread: 60 });
        showToast(res.message || 'রেফারেল কোড সফলভাবে যুক্ত হয়েছে!');
        setIsBindingModalOpen(false);
        setBindReferralCodeInput('');
        loadRealData();
      } else {
        showToast(res.message || 'কোড যুক্ত করা যায়নি');
      }
    } catch (err: any) {
      showToast(err.message || 'কোড যাচাই ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingBind(false);
    }
  };

  // Calculate estimated income based on slider
  const calculateRevenue = (count: number) => {
    if (count <= 1) return '300.00';
    if (count < 5) return (count * 300).toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (count < 10) return (count * 300 + 500).toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (count < 20) return (count * 300 + 1500).toLocaleString('en-US', { minimumFractionDigits: 2 });
    if (count < 50) return (count * 300 + 4500).toLocaleString('en-US', { minimumFractionDigits: 2 });
    return (count * 300 + 15000).toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  // Dynamic Records for Tab 4
  const displayRecords = useMemo(() => {
    if (liveRecords && liveRecords.length > 0) {
      return liveRecords.map(r => ({
        id: r.id,
        regDate: r.regDate || r.createdAt || '2026-08-30 14:00:00',
        username: r.username || (r.referredUsername ? r.referredUsername.replace(/(.{2})(.*)(.{2})/, '$1***$3') : 'player_***'),
        category: r.category || (r.type === 'deposit_commission' ? 'জমা ছাড়া' : r.type === 'bet_rebate' ? 'বেটিং রিবেট' : 'আমন্ত্রণ পুরস্কার'),
        amount: typeof r.amount === 'number' ? r.amount.toFixed(2) : (r.amount || '300.00'),
        status: (r.status === 'success' || r.status === 'সফল') ? ('সফল' as const) : ('প্রক্রিয়াধীন' as const)
      }));
    }
    return [];
  }, [liveRecords]);

  // Filtered records for Tab 4
  const filteredRecords = useMemo(() => {
    if (!useSampleDataInRecords && (!liveRecords || liveRecords.length === 0)) return [];
    if (recordCategory === 'সব') return displayRecords;
    return displayRecords.filter(r => r.category === recordCategory || recordCategory.includes(r.category));
  }, [recordCategory, useSampleDataInRecords, displayRecords, liveRecords]);

  // Total sum for Tab 4 records
  const recordsTotalSum = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => {
      const num = parseFloat(curr.amount.replace(/,/g, '')) || 0;
      return acc + num;
    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }, [filteredRecords]);

  // Dynamic Invited Friends for Tab 5
  const displayFriends = useMemo(() => {
    if (liveFriends && liveFriends.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      return liveFriends.map(f => {
        const isToday = f.joinedAt && f.joinedAt.startsWith(todayStr);
        const isYesterday = f.joinedAt && f.joinedAt.startsWith(yesterdayStr);
        const period: 'today' | 'yesterday' | 'month' = isToday ? 'today' : (isYesterday ? 'yesterday' : 'month');
        const minDep = liveStats?.commissionRates?.minDeposit ?? 500;
        return {
          id: f.id,
          username: f.referredUsername || 'user_***',
          regDate: f.joinedAt || '2026-08-30 14:00:00',
          phone: f.referredPhone ? f.referredPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '017****0000',
          isQualified: f.status === 'active' || (f.totalDeposit || 0) >= minDep,
          depositAmount: f.totalDeposit || 0,
          betAmount: f.totalBet || 0,
          commission: f.totalCommissionEarned || 0,
          period
        };
      });
    }
    return [];
  }, [liveFriends, liveStats]);

  // Filtered invited friends for Tab 5
  const filteredInvitedFriends = useMemo(() => {
    if (!useSampleDataInInvited && (!liveFriends || liveFriends.length === 0)) return [];
    return displayFriends.filter(friend => {
      if (activeDateTab !== 'month' && friend.period !== activeDateTab) return false;
      if (invitedFilter === 'সক্রিয়' && !friend.isQualified) return false;
      if (invitedFilter === 'নিষ্ক্রিয়' && friend.isQualified) return false;
      if (searchInvitedQuery && !friend.username.toLowerCase().includes(searchInvitedQuery.toLowerCase())) return false;
      return true;
    });
  }, [useSampleDataInInvited, activeDateTab, invitedFilter, searchInvitedQuery, displayFriends, liveFriends]);

  // Empty state illustration matching Capture5.PNG and Capture8.PNG
  const renderEmptyBox = (message = 'কোন ডেটা নেই') => (
    <div className="py-12 flex flex-col items-center justify-center text-center select-none animate-in fade-in">
      <div className="relative w-44 h-36 flex items-center justify-center">
        {/* Sparkles / Dots */}
        <div className="absolute top-2 left-6 text-sky-400 text-sm animate-pulse">✦</div>
        <div className="absolute top-10 left-3 w-1.5 h-1.5 rounded-full bg-sky-400" />
        <div className="absolute top-12 left-10 text-sky-400 text-xs">✦</div>
        <div className="absolute bottom-6 left-8 w-2 h-2 rounded-full bg-sky-400" />

        <div className="absolute top-3 right-10 text-sky-400 text-xs">✦</div>
        <div className="absolute top-14 right-4 text-sky-400 text-base animate-pulse">✦</div>
        <div className="absolute top-8 right-16 w-2 h-2 rounded-full bg-sky-400" />

        {/* Paper airplane flying out with dashed trail */}
        <div className="absolute top-3 right-8 w-12 h-12 text-sky-500 animate-bounce">
          <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>

        {/* Dashed flight loop */}
        <svg className="absolute top-6 left-12 w-24 h-16 pointer-events-none" viewBox="0 0 100 60">
          <path
            d="M 20,50 Q 30,20 50,35 T 80,10"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        </svg>

        {/* Tray / Inbox Box matching screenshot */}
        <div className="absolute bottom-0 w-32 h-20">
          <svg viewBox="0 0 120 80" className="w-full h-full" fill="none">
            {/* Box Lid / Top Opening */}
            <path
              d="M 15 25 L 105 25 L 90 70 L 30 70 Z"
              fill="#ffffff"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Front cutout */}
            <path
              d="M 15 45 L 45 45 Q 60 65 75 45 L 105 45"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <p className="mt-4 text-base sm:text-lg font-bold text-[#0072b2] font-bengali tracking-wide">
        {message}
      </p>
    </div>
  );

  return (
    <div 
      id="invite-friends-mobile-full-view"
      className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER: Dark Green Bar matching screenshots (#0b3327) */}
      {/* ========================================================================= */}
      <header className="bg-[#0b3327] text-white px-3 py-3 flex items-center justify-between shadow-md shrink-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center text-white/90 hover:text-white active:scale-90 transition-transform cursor-pointer rounded-full"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base sm:text-lg font-extrabold text-white tracking-wide font-bengali flex items-center gap-1.5">
          <span>বন্ধুদের আমন্ত্রণ জানান</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </h1>

        {/* Action icons right */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={loadRealData}
            disabled={isLoadingRealData}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-300 font-bold text-xs cursor-pointer active:scale-95 transition-transform"
            title="লাইভ ডেটা রিফ্রেশ করুন"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingRealData ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-yellow-300 font-bold text-xs cursor-pointer active:scale-95"
            title="নিয়মাবলী"
          >
            ?
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. TOP SUB-TABS: 5 Horizontally scrollable tabs matching screenshots */}
      {/* ========================================================================= */}
      <nav className="bg-white border-b border-gray-200 px-2 flex items-center justify-between shrink-0 overflow-x-auto scrollbar-none shadow-xs z-20">
        {[
          { id: 'summary', label: 'সংক্ষিপ্ত বর্ণনা' },
          { id: 'rewards', label: 'পুরস্কার' },
          { id: 'income', label: 'আয়' },
          { id: 'records', label: 'রেকর্ডস' },
          { id: 'invitedList', label: 'আমন্ত্রিতদের তালিকা' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer relative ${
              activeTab === tab.id
                ? 'text-[#0284c7] font-black border-b-[3px] border-[#0284c7]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* ========================================================================= */}
      {/* 3. SCROLLABLE TAB CONTENT BODY */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] pb-12">
        
        {/* ======================================================================= */}
        {/* TAB 1: সংক্ষিপ্ত বর্ণনা (Summary & Complete Overview) */}
        {/* ======================================================================= */}
        {activeTab === 'summary' && (
          <div className="p-3.5 space-y-4 max-w-lg mx-auto animate-in fade-in duration-200">
            
            {/* 1. 2x2 Grid Stats Cards matching Capture.PNG */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: আজকের আয় (Sky blue) */}
              <div className="rounded-xl bg-gradient-to-br from-[#8fd3fc] via-[#60b6fa] to-[#3b82f6] p-3 text-center text-white shadow-sm flex flex-col justify-center min-h-[76px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/15 rounded-full blur-xs" />
                <span className="text-[12px] font-bold opacity-95">আজকের আয়</span>
                <span className="text-xl sm:text-2xl font-black font-game tracking-wide mt-0.5 drop-shadow-xs">
                  ৳ {(liveStats?.todayCommission !== undefined ? liveStats.todayCommission : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Card 2: গতকালের আয় (Purple) */}
              <div className="rounded-xl bg-gradient-to-br from-[#c084fc] via-[#a855f7] to-[#7e22ce] p-3 text-center text-white shadow-sm flex flex-col justify-center min-h-[76px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/15 rounded-full blur-xs" />
                <span className="text-[12px] font-bold opacity-95">গতকালের আয়</span>
                <span className="text-xl sm:text-2xl font-black font-game tracking-wide mt-0.5 drop-shadow-xs">
                  ৳ {(liveStats?.yesterdayCommission !== undefined ? liveStats.yesterdayCommission : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Card 3: সূচিপত্রধারী (Purple) */}
              <div className="rounded-xl bg-gradient-to-br from-[#b395f8] via-[#916df0] to-[#6d28d9] p-3 text-center text-white shadow-sm flex flex-col justify-center min-h-[76px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/15 rounded-full blur-xs" />
                <span className="text-[12px] font-bold opacity-95">সূচিপত্রধারী</span>
                <span className="text-xl sm:text-2xl font-black font-game tracking-wide mt-0.5 drop-shadow-xs">
                  {liveStats?.totalFriends !== undefined ? liveStats.totalFriends : 14}
                </span>
              </div>

              {/* Card 4: যোগ্য পরিচয়করা (Sky blue) */}
              <div className="rounded-xl bg-gradient-to-br from-[#67e8f9] via-[#06b6d4] to-[#0284c7] p-3 text-center text-white shadow-sm flex flex-col justify-center min-h-[76px] relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/15 rounded-full blur-xs" />
                <span className="text-[12px] font-bold opacity-95">যোগ্য পরিচয়করা</span>
                <span className="text-xl sm:text-2xl font-black font-game tracking-wide mt-0.5 drop-shadow-xs">
                  {liveStats?.qualifiedFriends !== undefined ? liveStats.qualifiedFriends : 8}
                </span>
              </div>
            </div>

            {/* 2. Royal Blue Hero Trophy Banner matching Capture.PNG */}
            <div className="rounded-2xl bg-gradient-to-r from-[#507bf8] via-[#436bf0] to-[#2563eb] text-white p-4 shadow-md flex items-center gap-3.5 relative overflow-hidden border border-blue-400/30">
              {/* Background ambient radial highlight */}
              <div className="absolute -left-10 -top-10 w-36 h-36 bg-blue-300/20 rounded-full blur-xl pointer-events-none" />

              {/* Golden Trophy graphic on left */}
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-1 flex items-center justify-center shrink-0 shadow-lg relative">
                <div className="w-full h-full rounded-xl bg-gradient-to-b from-[#873e04] to-[#451e01] flex items-center justify-center overflow-hidden">
                  <PremiumTrophyIcon className="w-14 h-14 drop-shadow-md" />
                </div>
              </div>

              {/* Middle Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight drop-shadow">
                    BengalBet সম্পদের শুরু
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-yellow-400 text-amber-950 font-black text-[9px] uppercase">
                    PRO
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#ffea79] font-game drop-shadow-sm">
                    ৳ {(liveStats?.commissionRates?.instantBonus || 300).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="w-5 h-5 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center text-white text-xs font-bold cursor-pointer"
                    title="সহায়তা"
                  >
                    ?
                  </button>
                </div>

                <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                  একটি আমন্ত্রণ, আজীবন সুবিধা
                </p>
              </div>
            </div>

            {/* 3. Section Title: প্রাপ্ত পুরস্কার matching Capture.PNG */}
            <div className="pt-1">
              <h3 className="text-base font-black text-gray-900 text-center font-bengali mb-2.5 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>প্রাপ্ত পুরস্কার</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>

              {/* 3 Received Rewards Cards matching Capture.PNG & Capture2.PNG */}
              <div className="space-y-2.5">
                {/* Card 1: সাফল্য পুরস্কার */}
                <div className="rounded-xl bg-white p-3.5 flex items-center gap-3.5 border border-[#e0ebf3] shadow-xs hover:border-blue-300 transition-colors">
                  <div className="w-13 h-13 flex items-center justify-center shrink-0">
                    <PremiumMedalIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-600 font-bold block">সাফল্য পুরস্কার</span>
                    <span className="text-base sm:text-lg font-black text-[#2e3e78] font-game">
                      ৳ {(liveStats?.breakdown?.milestoneRewardTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* Card 2: জমা ছাড়া */}
                <div className="rounded-xl bg-white p-3.5 flex items-center gap-3.5 border border-[#e0ebf3] shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="w-13 h-13 flex items-center justify-center shrink-0">
                    <PremiumMoneyBagIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-600 font-bold block">জমা ছাড়া</span>
                    <span className="text-base sm:text-lg font-black text-[#2e3e78] font-game">
                      ৳ {(liveStats?.breakdown?.depositCommissionTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* Card 3: বেটিং রিবেট */}
                <div className="rounded-xl bg-white p-3.5 flex items-center gap-3.5 border border-[#e0ebf3] shadow-xs hover:border-sky-300 transition-colors">
                  <div className="w-13 h-13 flex items-center justify-center shrink-0">
                    <PremiumRebateIcon className="w-12 h-12" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs text-gray-600 font-bold block">বেটিং রিবেট</span>
                    <span className="text-base sm:text-lg font-black text-[#2e3e78] font-game">
                      ৳ {(liveStats?.breakdown?.betRebateTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* 4. Sub-banner: 1 জনকে আমন্ত্রণ করুন matching Capture2.PNG */}
            <div className="pt-2 text-center bg-emerald-50/80 rounded-xl p-3 border border-emerald-200">
              <h4 className="text-sm sm:text-base font-extrabold text-emerald-950 leading-snug">
                ১ জনকে আমন্ত্রণ করুন, আয় করুন <span className="text-emerald-700 font-black">{liveStats?.commissionRates?.instantBonus || 300} টাকা</span>।<br />
                এজেন্ট কমিশন আজীবন <span className="text-amber-600 font-black">{liveStats?.commissionRates?.betRate || 1.0}%</span>
              </h4>
            </div>

            {/* 5. আমন্ত্রণ বোনাস টেবিল matching Capture2.PNG */}
            <div className="pt-1">
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Gift className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-base font-black text-[#155e4b] font-bengali">
                  আমন্ত্রণ বোনাস টেবিল
                </h3>
              </div>
              <p className="text-[11px] text-gray-600 text-center px-4 leading-relaxed mb-3">
                নিচের টেবিলটি বিভিন্ন আমন্ত্রণ স্তর অনুযায়ী বোনাসের পরিমাণ দেখায়। আপনি যত সংখ্যক সদস্য আমন্ত্রণ করবেন, ততই বোনাস পাবেন।
              </p>

              {/* Table 1 */}
              <div className="rounded-xl overflow-hidden border border-[#1b6b55] shadow-xs bg-white">
                <table className="w-full text-center text-xs">
                  <thead className="bg-[#175345] text-white font-bold">
                    <tr>
                      <th className="py-2.5 px-1 border-r border-[#266858]">ডিপোজিট পরিমাণ</th>
                      <th className="py-2.5 px-1 border-r border-[#266858]">বৈধ বাজি</th>
                      <th className="py-2.5 px-1">আমন্ত্রণ বোনাস</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-gray-800">
                    <tr className="border-b border-gray-200">
                      <td className="py-2.5 border-r border-gray-200">৳{liveStats?.commissionRates?.minDeposit ?? 500} এর বেশি</td>
                      <td className="py-2.5 border-r border-gray-200 font-game text-gray-700">৳{(liveStats?.commissionRates?.minTurnover || 3000).toLocaleString()}</td>
                      <td className="py-2.5 font-game text-[#175345] font-black">৳{liveStats?.commissionRates?.instantBonus || 300}</td>
                    </tr>
                    <tr className="bg-[#f2faf7]">
                      <td colSpan={3} className="py-2 font-extrabold text-[#155e4b] text-xs">
                        সর্বোচ্চ বোনাস: {(liveStats?.commissionRates?.maxBonusCap || 3000000).toLocaleString()} টাকা
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. ক্যাশব্যাক হার টেবিল matching Capture3.PNG */}
            <div className="pt-1">
              <div className="rounded-xl overflow-hidden border border-[#1b6b55] shadow-xs bg-white">
                <table className="w-full text-center text-xs">
                  <thead className="bg-[#175345] text-[#ffe66d] font-extrabold">
                    <tr>
                      <th className="py-2.5 px-2 border-r border-[#266858]">ক্যাশব্যাক হার</th>
                      <th className="py-2.5 px-2">স্লট মেশিন ও ফিশিং</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-gray-800">
                    <tr>
                      <td className="py-2.5 border-r border-gray-200">{liveStats?.commissionRates?.betRate || 1.0}%</td>
                      <td className="py-2.5 text-[#175345] font-black">{liveStats?.commissionRates?.betRate || 1.0}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. বৈধ আমন্ত্রণ অনুযায়ী বোনাস স্কেল (রেঞ্জ বৃদ্ধি বোনাস) - Distinct instant bonus scale based on user count */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-4 h-4 text-amber-950 fill-amber-950" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#155e4b] font-bengali leading-tight">
                      আমন্ত্রণ সংখ্যা অনুযায়ী তাৎক্ষণিক বোনাস স্কেল
                    </h3>
                    <span className="text-[10px] text-gray-500 font-medium">ইনস্ট্যান্ট রেফারেল ক্যাশ রিওয়ার্ড (বৃদ্ধি রেঞ্জ)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300 animate-pulse">
                  তাৎক্ষণিক বোনাস
                </span>
              </div>

              {/* Dynamic User Progress Header Box */}
              <div className="mb-3 rounded-xl bg-gradient-to-r from-[#0d4f3b] to-[#175345] p-3 text-white shadow-xs border border-emerald-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-emerald-200 block font-medium">আপনার বর্তমান অগ্রগতি</span>
                    <span className="text-lg font-black text-white font-game">
                      {liveStats?.totalFriends || 0} <span className="text-xs font-normal text-emerald-200">জন বন্ধু</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-emerald-200 block font-medium">বর্তমান সক্রিয় তাৎক্ষণিক রেট</span>
                    <span className="text-lg font-black text-[#ffea79] font-game">
                      ৳ {(liveStats?.currentInstantRate || ((liveStats?.totalFriends || 0) >= 10 ? 1500 : 300)).toLocaleString()} <span className="text-[10px] font-normal text-yellow-200">/প্রতি বন্ধু</span>
                    </span>
                  </div>
                </div>

                {/* Progress helper text */}
                <div className="mt-2 pt-2 border-t border-emerald-600/50 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-100">
                    {(liveStats?.totalFriends || 0) < 5 
                      ? `আর মাত্র ${5 - (liveStats?.totalFriends || 0)} জন হলে পরবর্তী উচ্চতর রেঞ্জে পৌঁছাবেন`
                      : (liveStats?.totalFriends || 0) < 10 
                        ? `আর মাত্র ${10 - (liveStats?.totalFriends || 0)} জন হলে ১০ কাউন্টে পৌঁছে পাবেন ৳১,৫০০/বন্ধু!`
                        : '🔥 আপনি সর্বোচ্চ তাৎক্ষণিক রেঞ্জ সুবিধা উপভোগ করছেন!'}
                  </span>
                  <span className="font-bold text-yellow-300">স্বয়ংক্রিয় জমা</span>
                </div>
              </div>

              {/* Range Scale Table */}
              <div className="rounded-xl overflow-hidden border border-[#1b6b55] shadow-xs bg-white">
                <table className="w-full text-center text-xs">
                  <thead className="bg-[#175345] text-[#ffe66d] font-extrabold">
                    <tr>
                      <th className="py-2.5 px-2 border-r border-[#266858]">আমন্ত্রণ স্কেল রেঞ্জ</th>
                      <th className="py-2.5 px-2 border-r border-[#266858]">প্রতি রেফারে তাৎক্ষণিক বোনাস</th>
                      <th className="py-2.5 px-2">অগ্রগতি / স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-gray-800 divide-y divide-gray-100">
                    {([{ id: 1, minCount: 1, maxCount: 999999, instantBonus: Number(liveStats?.commissionRates?.instantBonus ?? 0), label: 'প্রতিটি যোগ্য বন্ধু' }]).map((range: any, idx: number) => {
                      const userCount = liveStats?.totalFriends || 0;
                      const isRowCurrent = range.isCurrent !== undefined 
                        ? range.isCurrent 
                        : (userCount >= range.minCount && (range.maxCount >= 999999 ? true : userCount <= range.maxCount));
                      const isRowPassed = range.isPassed !== undefined
                        ? range.isPassed
                        : (userCount > range.maxCount && range.maxCount < 999999);

                      return (
                        <tr 
                          key={range.id || idx} 
                          className={`transition-colors ${
                            isRowCurrent 
                              ? 'bg-amber-50/90 font-extrabold text-gray-900 border-l-4 border-l-amber-500' 
                              : isRowPassed
                                ? 'bg-emerald-50/40 text-gray-600'
                                : idx % 2 === 1 ? 'bg-[#f7fbf9]' : 'bg-white'
                          }`}
                        >
                          <td className="py-2.5 px-2 border-r border-gray-200">
                            <div className="flex items-center justify-center gap-1">
                              <span>{range.label || `${range.minCount} - ${range.maxCount >= 999999 ? 'অসীম' : range.maxCount} জন`}</span>
                              {isRowCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 border-r border-gray-200 text-[#155e4b] font-game font-black text-xs sm:text-sm">
                            {range.formattedBonus || `৳${range.instantBonus.toLocaleString()}`}
                          </td>
                          <td className="py-2.5 px-2 text-[11px]">
                            {isRowCurrent ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold shadow-2xs">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>বর্তমান স্তর</span>
                              </span>
                            ) : isRowPassed ? (
                              <span className="text-emerald-700 font-bold flex items-center justify-center gap-0.5">
                                <Check className="w-3 h-3" />
                                <span>সম্পন্ন</span>
                              </span>
                            ) : (
                              <span className="text-gray-400 font-medium">
                                আর {Math.max(0, range.minCount - userCount)} জন
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Clear Rule Explanation Note matching User Specification */}
              <div className="mt-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-200/80 shadow-2xs">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-950 space-y-1">
                    <p className="font-extrabold text-xs text-amber-900">
                      💡 তাৎক্ষণিক বোনাস বৃদ্ধির নিয়মাবলী (সারসংক্ষেপ ট্যাব):
                    </p>
                    <p className="leading-relaxed">
                      • আমন্ত্রিত বন্ধুর সংখ্যা যত বৃদ্ধি পাবে, আপনার প্রতিটি পরবর্তী সফল আমন্ত্রণের তাৎক্ষণিক বোনাস স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে।
                    </p>
                    <p className="leading-relaxed">
                      • <span className="font-bold text-amber-900">বাস্তব উদাহরণ:</span> আপনি যদি ১-৫ জন বন্ধুকে আমন্ত্রণ জানান, তবে প্রতি রেফারে তাৎক্ষণিকভাবে <span className="font-bold text-emerald-800">৳৩০০</span> বোনাস পাবেন। এরপর যখন আপনার আমন্ত্রিত সংখ্যা <span className="font-bold text-amber-900">১০ জনে পৌঁছাবে</span>, তখন পরবর্তী প্রতিটি রেফারের জন্য প্রতিবারে সরাসরি <span className="font-bold text-emerald-800">৳১,৫০০</span> তাৎক্ষণিক বোনাস পাবেন!
                    </p>
                    <p className="text-[10px] text-amber-800/90 italic">
                      * এই তাৎক্ষণিক বোনাস ছাড়া অতিরিক্ত ধারাবাহিক লেভেল মাইলস্টোন উপহার পেতে "পুরস্কার" ট্যাব পরিদর্শন করুন।
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Calculator */}
              <div className="mt-2.5 bg-white rounded-xl p-3 border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-800">তাৎক্ষণিক বোনাস ক্যালকুলেটর</span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {simulatedRangeCount} জন বন্ধু
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 mb-2.5">
                  {[1, 5, 10, 20, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSimulatedRangeCount(num)}
                      className={`py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        simulatedRangeCount === num
                          ? 'bg-[#175345] text-white shadow-xs scale-102'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {num} জন
                    </button>
                  ))}
                </div>

                <div className="bg-[#f2faf7] rounded-lg p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-600 block text-[11px]">প্রতি রেফারে তাৎক্ষণিক রেট:</span>
                    <span className="font-black text-[#175345] text-sm font-game">
                      ৳ {Number(liveStats?.commissionRates?.instantBonus ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600 block text-[11px]">মোট সম্ভাব্য তাৎক্ষণিক বোনাস:</span>
                    <span className="font-black text-amber-600 text-sm font-game">
                      ৳ {(
                        simulatedRangeCount * Number(liveStats?.commissionRates?.instantBonus ?? 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 8. আপনার বন্ধুদের সাথে ভাগ করুন (Share Box) matching Capture10.PNG */}
            <div className="pt-2">
              <div className="rounded-2xl bg-gradient-to-b from-[#f0f6ff] to-[#e4effc] border border-[#d0e2f5] p-4 shadow-sm">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 mb-3 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>আপনার বন্ধুদের সাথে ভাগ করুন</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-3.5">
                  {/* Left QR Code Box */}
                  <div className="flex flex-col items-center shrink-0">
                    <PremiumQRCode value={referralLink} className="w-28 h-28" />
                    <button
                      type="button"
                      onClick={handleSaveQrCode}
                      className="mt-2 w-28 py-1.5 bg-[#47347a] hover:bg-[#392864] text-white text-[11px] font-bold rounded-lg shadow-xs active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>কোড সংরক্ষণ</span>
                    </button>
                  </div>

                  {/* Right Input and Social Buttons */}
                  <div className="flex-1 w-full space-y-2.5">
                    {/* Link Bar with copy button */}
                    <div className="flex items-center bg-white rounded-xl border border-gray-300 overflow-hidden shadow-2xs">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 px-3 py-2 text-xs text-gray-700 font-mono outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3.5 py-2.5 bg-blue-50 text-[#47347a] hover:bg-blue-100 active:scale-95 transition-transform cursor-pointer font-bold flex items-center gap-1 border-l border-gray-200"
                        title="কপি করুন"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] text-emerald-700">কপি!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-[10px]">কপি</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Social Media Share Icons Grid matching Capture10.PNG */}
                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      {/* Facebook */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('facebook')}
                        className="w-9 h-9 rounded-xl bg-[#1877f2] text-white flex items-center justify-center font-bold text-sm shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="Facebook"
                      >
                        f
                      </button>

                      {/* X / Twitter */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('twitter')}
                        className="w-9 h-9 rounded-xl bg-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="X"
                      >
                        𝕏
                      </button>

                      {/* Telegram */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('telegram')}
                        className="w-9 h-9 rounded-xl bg-[#24a1de] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="Telegram"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('whatsapp')}
                        className="w-9 h-9 rounded-xl bg-[#25d366] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="WhatsApp"
                      >
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                      </button>

                      {/* Messenger */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('messenger')}
                        className="w-9 h-9 rounded-xl bg-[#0084ff] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="Messenger"
                      >
                        💬
                      </button>

                      {/* LINE */}
                      <button
                        type="button"
                        onClick={() => handleSocialShare('line')}
                        className="w-9 h-9 rounded-xl bg-[#06c755] text-white flex items-center justify-center font-bold text-[10px] shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="LINE"
                      >
                        LINE
                      </button>

                      {/* Direct Share */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-9 h-9 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer hover:opacity-90"
                        title="Share"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bind Referrer Code Prompt */}
                    <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500 font-medium">অন্য কারো রেফারেল কোড আছে?</span>
                      <button
                        type="button"
                        onClick={() => setIsBindingModalOpen(true)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Link className="w-3 h-3" />
                        <span>কোড যুক্ত করুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 9. লিডারবোর্ড (Leaderboard) matching Capture10.PNG & Capture9.PNG */}
            <div className="pt-2">
              <h3 className="text-base font-black text-gray-900 text-center font-bengali mb-3 flex items-center justify-center gap-1.5">
                <span>🏆 লিডারবোর্ড 🏆</span>
              </h3>

              {/* Podium Gradient Card */}
              <div className="rounded-2xl bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] p-4 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                {/* 3 Podium Avatars */}
                <div className="flex items-end justify-center gap-4 pt-3 pb-2">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <span className="absolute -top-3 left-0 bg-white text-gray-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">2nd</span>
                      <div className="w-16 h-16 rounded-full border-2 border-slate-200 bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center overflow-hidden shadow-md">
                        <span className="text-2xl">👦</span>
                      </div>
                    </div>
                  </div>

                  {/* 1st Place (Elevated center) */}
                  <div className="flex flex-col items-center -mt-5">
                    <div className="relative">
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
                        👑 1st
                      </span>
                      <div className="w-20 h-20 rounded-full border-3 border-amber-300 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-amber-300/30">
                        <span className="text-3xl">🧑</span>
                      </div>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <span className="absolute -top-3 left-0 bg-amber-700 text-amber-100 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">3rd</span>
                      <div className="w-16 h-16 rounded-full border-2 border-amber-500 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center overflow-hidden shadow-md">
                        <span className="text-2xl">👩</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Earnings matching Capture9.PNG */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 text-center font-mono text-[10px] sm:text-xs">
                  <div className="bg-white/20 backdrop-blur-xs py-1.5 px-1 rounded-xl">
                    <div className="font-bold text-blue-100">{board.slot(1).name}</div>
                    <div className="font-black text-[#ffea79]">{board.slot(1).amount}</div>
                  </div>
                  <div className="bg-white/30 backdrop-blur-xs py-2 px-1 rounded-xl border border-amber-300/50 shadow-inner">
                    <div className="font-black text-white">{board.slot(0).name}</div>
                    <div className="font-black text-yellow-300 text-xs sm:text-sm">{board.slot(0).amount}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-xs py-1.5 px-1 rounded-xl">
                    <div className="font-bold text-blue-100">{board.slot(2).name}</div>
                    <div className="font-black text-[#ffea79]">{board.slot(2).amount}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 10. যে ব্যক্তি পুরস্কৃত হয়েছে (Live Winner Feed) matching Capture9.PNG */}
            <div className="pt-2">
              <div className="rounded-2xl bg-gradient-to-b from-[#6b42c8] via-[#843ab7] to-[#b32b9c] p-4 text-white shadow-md">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Flame className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-black text-center text-white">
                    যে ব্যক্তি পুরস্কৃত হয়েছে
                  </h3>
                </div>

                <div className="space-y-2">
                  {liveList.length === 0 && <div className="text-center text-xs text-white/80">এখনো কোনো রেফার পুরস্কার নেই</div>}
                  {liveList.map((item) => (
                    <div 
                      key={item.id}
                      className="bg-white/95 text-gray-900 rounded-full px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs transition-all animate-in fade-in"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span className="font-mono text-gray-700">{item.phone}</span>
                      </div>
                      <span className="text-emerald-700 font-extrabold px-2 py-0.5 bg-emerald-50 rounded-full text-[11px]">{item.status}</span>
                      <span className="text-gray-900 font-game font-black">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 11. আয় হিসাবনিকেতন (Interactive Calculator) matching Capture9.PNG */}
            <div className="pt-2">
              <div className="rounded-2xl bg-gradient-to-r from-[#d94186] via-[#7d39b8] to-[#2a45b8] p-4 sm:p-5 text-white shadow-md">
                <div className="flex items-center gap-3.5 mb-2">
                  {/* Envelope with Dollar Bill graphic */}
                  <div className="w-14 h-14 bg-amber-400 rounded-2xl p-1.5 shadow flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-emerald-600 rounded-xl flex items-center justify-center text-yellow-300 font-black text-2xl border border-yellow-300 shadow-inner">
                      $
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      আয় হিসাবনিকেতন
                    </h3>
                    <div className="text-2xl sm:text-3xl font-black text-[#ffea79] font-game mt-0.5">
                      ৳ {calculateRevenue(calculatorUsers)}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-blue-100 font-medium mt-2">
                  <span className="font-bold text-yellow-300">{calculatorUsers}</span> কুশল ব্যবহারকারী আমন্ত্রণ করুন, প্রত্যাশিত রাজস্ব
                </p>

                {/* Slider bar */}
                <div className="mt-3.5">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={calculatorUsers}
                    onChange={(e) => setCalculatorUsers(parseInt(e.target.value, 10))}
                    className="w-full h-2.5 bg-blue-950/70 rounded-lg appearance-none cursor-pointer accent-teal-300"
                  />
                  <div className="flex justify-between text-[10px] text-blue-200 mt-1 font-mono">
                    <span>১ জন</span>
                    <span>৫০ জন</span>
                    <span>১০০ জন</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: পুরস্কার (Sequential Poroskar Level Milestones) matching user spec */}
        {/* ======================================================================= */}
        {activeTab === 'rewards' && (
          <div className="p-3.5 space-y-4 max-w-lg mx-auto animate-in fade-in duration-200">
            
            {/* Top Banner (div 1): Using requested Bengali content banner with BengalBet site name */}
            <div 
              id="mobile-refer-rewards-top-banner"
              className="rounded-2xl overflow-hidden shadow-lg border border-emerald-700/60 relative bg-emerald-950 w-full"
            >
              <img 
                src={referRewardsBannerImg} 
                alt="BengalBet Refer Rewards Banner"
                referrerPolicy="no-referrer"
                className="w-full h-auto max-h-[190px] object-cover sm:object-contain sm:bg-[#07392a] mx-auto block"
              />
            </div>

            {/* Active Working Level Spotlight Hero Card */}
            {(() => {
              const poroskarList = liveStats?.poroskarLevels || [
                { id: 1, level: 1, requiredCount: 2, rewardAmount: 1, name: 'লেভেল ১ - সূচনা পদক', isClaimed: false, isEligible: (liveStats?.totalFriends || 0) >= 2, isLocked: false, isCurrentActive: true, progress: Math.min(liveStats?.totalFriends || 0, 2), progressPercent: Math.min(100, Math.round(((liveStats?.totalFriends || 0) / 2) * 100)), friendsNeeded: Math.max(0, 2 - (liveStats?.totalFriends || 0)), formattedReward: '৳১.০০' },
                { id: 2, level: 2, requiredCount: 4, rewardAmount: 150, name: 'লেভেল ২ - রৌপ্য পদক', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: Math.min(liveStats?.totalFriends || 0, 4), progressPercent: Math.min(100, Math.round(((liveStats?.totalFriends || 0) / 4) * 100)), friendsNeeded: Math.max(0, 4 - (liveStats?.totalFriends || 0)), formattedReward: '৳১৫০.০০' },
                { id: 3, level: 3, requiredCount: 8, rewardAmount: 350, name: 'লেভেল ৩ - স্বর্ণ পদক', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: Math.min(liveStats?.totalFriends || 0, 8), progressPercent: 0, friendsNeeded: 8, formattedReward: '৳৩৫০.০০' },
              ];

              const currentTarget = liveStats?.nextPoroskarLevel || poroskarList.find((p: any) => !p.isClaimed && !p.isLocked) || poroskarList[0];
              const allDone = poroskarList.every((p: any) => p.isClaimed);

              if (allDone) {
                return (
                  <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white text-center shadow-md">
                    <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-300 animate-bounce" />
                    <h4 className="text-base font-black">🎉 অবিশ্বাস্য অর্জন!</h4>
                    <p className="text-xs text-emerald-100 mt-1">আপনি সকল পুরস্কার লেভেল সফলভাবে সম্পন্ন ও দাবি করেছেন!</p>
                  </div>
                );
              }

              if (!currentTarget) return null;

              const isClaimable = currentTarget.isEligible || (
                (liveStats?.totalFriends || 0) >= currentTarget.requiredCount && !currentTarget.isClaimed && !currentTarget.isLocked
              );

              return (
                <div className="rounded-2xl bg-gradient-to-b from-white to-amber-50/60 border-2 border-amber-300 p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-200/40 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs">
                        L{currentTarget.level}
                      </span>
                      <div>
                        <span className="text-[10px] text-amber-800 font-extrabold uppercase tracking-wider block">বর্তমান সক্রিয় পুরস্কার স্তর</span>
                        <h4 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                          {currentTarget.name || `লেভেল ${currentTarget.level} মাইলস্টোন`}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">স্তর পুরস্কার</span>
                      <span className="text-base sm:text-lg font-black text-emerald-700 font-game">
                        {currentTarget.formattedReward || `৳${currentTarget.rewardAmount}`}
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                      <span>আমন্ত্রিত বন্ধু অগ্রগতি: <span className="font-game text-emerald-700">{Math.min(liveStats?.totalFriends || 0, currentTarget.requiredCount)}</span> / {currentTarget.requiredCount} জন</span>
                      <span className="text-amber-700">{Math.min(100, Math.round(((Math.min(liveStats?.totalFriends || 0, currentTarget.requiredCount)) / currentTarget.requiredCount) * 100))}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500 shadow-inner"
                        style={{ width: `${Math.min(100, Math.round(((Math.min(liveStats?.totalFriends || 0, currentTarget.requiredCount)) / currentTarget.requiredCount) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Claim Button */}
                  <div className="mt-3.5 pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-600 font-medium">
                      {isClaimable 
                        ? '✨ লক্ষ্যমাত্রা অর্জিত হয়েছে! এখনই ক্লেইম করুন' 
                        : `আর মাত্র ${Math.max(0, currentTarget.requiredCount - (liveStats?.totalFriends || 0))} জন বন্ধু আমন্ত্রণ বাকি`}
                    </span>

                    <button
                      type="button"
                      disabled={!isClaimable || isClaimingPoroskarLevel === currentTarget.level}
                      onClick={() => handleClaimPoroskarLevel(currentTarget.level)}
                      className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isClaimable 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 ring-2 ring-yellow-400/60 animate-pulse' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isClaimingPoroskarLevel === currentTarget.level ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>যাচাই হচ্ছে...</span>
                        </>
                      ) : isClaimable ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>লেভেল {currentTarget.level} দাবি করুন</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>লক্ষ্য পূরণ করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Explanatory Rules Card */}
            <div className="rounded-xl bg-blue-50/80 border border-blue-200 p-3 text-blue-950 text-xs shadow-2xs">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h5 className="font-extrabold text-blue-900 text-xs">
                    📌 ধারাবাহিক পুরস্কার নিয়মনীতি (Poroskar Rules):
                  </h5>
                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    ১. এটি একটি ধারাবাহিক লেভেল-ভিত্তিক মাইলস্টোন সিস্টেম। আপনি সরাসরি পরের লেভেলে যেতে পারবেন না।
                  </p>
                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    ২. <span className="font-bold">বাস্তব নিয়ম:</span> উদাহরণস্বরূপ, আপনি যখন <span className="font-bold text-blue-950">২ জন বন্ধু</span> আমন্ত্রণ করবেন, তখন <span className="font-bold text-emerald-800">লেভেল ১</span> সম্পন্ন হবে এবং পুরস্কার দাবি করতে পারবেন।
                  </p>
                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    ৩. লেভেল ১ দাবি সম্পন্ন হওয়ার সাথে সাথে <span className="font-bold text-blue-950">লেভেল ২ শুরু হবে</span> এবং যখন আপনার মোট আমন্ত্রিত সংখ্যা <span className="font-bold text-blue-950">৪ জনে পৌঁছাবে</span>, তখন পরবর্তী লেভেল ২-এর নির্ধারিত পুরস্কার দাবি করতে পারবেন!
                  </p>
                </div>
              </div>
            </div>

            {/* Level Milestones Ladder Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>ধারাবাহিক লেভেল মাইলস্টোন তালিকা</span>
              </div>
              <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                ১০টি সক্রিয় লেভেল
              </span>
            </div>

            {/* Sequential Level Ladder Cards List */}
            <div className="space-y-2.5">
              {((liveStats?.poroskarLevels && liveStats.poroskarLevels.length > 0)
                ? liveStats.poroskarLevels
                : [
                  { id: 1, level: 1, requiredCount: 2, rewardAmount: 1, name: 'লেভেল ১ - সূচনা পদক', badge: 'ব্রোঞ্জ', isClaimed: false, isEligible: (liveStats?.totalFriends || 0) >= 2, isLocked: false, isCurrentActive: true, progress: Math.min(liveStats?.totalFriends || 0, 2), progressPercent: Math.min(100, Math.round(((liveStats?.totalFriends || 0) / 2) * 100)), friendsNeeded: Math.max(0, 2 - (liveStats?.totalFriends || 0)), formattedReward: '৳১.০০' },
                  { id: 2, level: 2, requiredCount: 4, rewardAmount: 150, name: 'লেভেল ২ - রৌপ্য পদক', badge: 'সিলভার', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: Math.min(liveStats?.totalFriends || 0, 4), progressPercent: 0, friendsNeeded: 4, formattedReward: '৳১৫০.০০' },
                  { id: 3, level: 3, requiredCount: 8, rewardAmount: 350, name: 'লেভেল ৩ - স্বর্ণ পদক', badge: 'গোল্ড', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: Math.min(liveStats?.totalFriends || 0, 8), progressPercent: 0, friendsNeeded: 8, formattedReward: '৳৩৫০.০০' },
                  { id: 4, level: 4, requiredCount: 15, rewardAmount: 800, name: 'লেভেল ৪ - প্লাটিনাম পদক', badge: 'প্লাটিনাম', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 15, formattedReward: '৳৮০০.০০' },
                  { id: 5, level: 5, requiredCount: 30, rewardAmount: 2000, name: 'লেভেল ৫ - ডায়মন্ড পদক', badge: 'ডায়মন্ড', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 30, formattedReward: '৳২,০০০.০০' },
                  { id: 6, level: 6, requiredCount: 60, rewardAmount: 5000, name: 'লেভেল ৬ - ক্রাউন পদক', badge: 'ক্রাউন', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 60, formattedReward: '৳৫,০০০.০০' },
                  { id: 7, level: 7, requiredCount: 100, rewardAmount: 12000, name: 'লেভেল ৭ - মাস্টার পদক', badge: 'মাস্টার', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 100, formattedReward: '৳১২,০০০.০০' },
                  { id: 8, level: 8, requiredCount: 250, rewardAmount: 35000, name: 'লেভেল ৮ - গ্র্যান্ড মাস্টার পদক', badge: 'গ্র্যান্ডমাস্টার', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 250, formattedReward: '৳৩৫,০০০.০০' },
                  { id: 9, level: 9, requiredCount: 500, rewardAmount: 80000, name: 'লেভেল ৯ - লিজেন্ড পদক', badge: 'লিজেন্ড', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 500, formattedReward: '৳৮০,০০০.০০' },
                  { id: 10, level: 10, requiredCount: 1000, rewardAmount: 200000, name: 'লেভেল ১০ - রয়্যাল সম্রাট পদক', badge: 'সম্রাট', isClaimed: false, isEligible: false, isLocked: true, isCurrentActive: false, progress: 0, progressPercent: 0, friendsNeeded: 1000, formattedReward: '৳২,০০,০০০.০০' },
                ]
              ).map((lvl: any) => {
                const userCount = liveStats?.totalFriends || 0;
                const isClaimed = lvl.isClaimed;
                const isLocked = lvl.isLocked;
                const isEligible = lvl.isEligible;
                const isCurrentActive = lvl.isCurrentActive;

                return (
                  <div
                    key={lvl.id || lvl.level}
                    className={`rounded-2xl border p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs transition-all ${
                      isClaimed 
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-85'
                        : isEligible
                          ? 'bg-gradient-to-r from-amber-50 to-yellow-50/70 border-amber-300 ring-2 ring-amber-300/40'
                          : isCurrentActive
                            ? 'bg-white border-blue-300 ring-1 ring-blue-300/50'
                            : 'bg-gray-50/80 border-gray-200 text-gray-400'
                    }`}
                  >
                    {/* Left Icon / Level Badge */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black shadow-xs ${
                        isClaimed
                          ? 'bg-emerald-600 text-white'
                          : isEligible
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-300'
                            : isCurrentActive
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                      }`}>
                        <span className="text-[9px] uppercase tracking-tighter opacity-80">LEVEL</span>
                        <span className="text-sm leading-none font-game">{lvl.level}</span>
                      </div>
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs sm:text-sm font-black block leading-tight ${
                          isClaimed ? 'text-emerald-950 line-through opacity-70' : isLocked ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {lvl.name || `লেভেল ${lvl.level}`}
                        </span>
                        {lvl.badge && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                            isClaimed 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : isEligible 
                                ? 'bg-amber-200 text-amber-950 font-black' 
                                : 'bg-gray-200 text-gray-600'
                          }`}>
                            {lvl.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="text-gray-500 text-[11px]">
                          লক্ষ্যমাত্রা: <span className="font-bold text-gray-800">{lvl.requiredCount} জন</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="font-black text-[#155e4b] font-game">
                          {lvl.formattedReward || `৳${lvl.rewardAmount}`}
                        </span>
                      </div>

                      {/* Next level clue */}
                      {!isClaimed && (
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                          {isEligible 
                            ? '🎉 ক্লেইম করলে পরবর্তী লেভেল শুরু হবে' 
                            : isLocked 
                              ? `🔒 লেভেল ${lvl.level - 1} দাবি করার পর এটি শুরু হবে`
                              : `চলমান: আর ${Math.max(0, lvl.requiredCount - userCount)} জন বাকি`}
                        </span>
                      )}
                    </div>

                    {/* Right Action / Status Badge */}
                    <div className="flex flex-col items-end shrink-0 gap-1">
                      {isClaimed ? (
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>গৃহীত</span>
                        </div>
                      ) : isEligible ? (
                        <button
                          type="button"
                          disabled={isClaimingPoroskarLevel === lvl.level}
                          onClick={() => handleClaimPoroskarLevel(lvl.level)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 text-xs font-black shadow-xs active:scale-95 transition-all cursor-pointer ring-2 ring-yellow-400/50 flex items-center gap-1"
                        >
                          {isClaimingPoroskarLevel === lvl.level ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>দাবি করুন</span>
                        </button>
                      ) : isCurrentActive ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            চলমান ({Math.min(userCount, lvl.requiredCount)}/{lvl.requiredCount})
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400 text-[11px] font-bold">
                          <Lock className="w-3 h-3" />
                          <span>লক করা</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: আয় (Income Breakdown) matching Capture4.PNG & Capture6.PNG */}
        {/* ======================================================================= */}
        {activeTab === 'income' && (
          <div className="p-3.5 space-y-4 max-w-lg mx-auto animate-in fade-in duration-200">
            
            {/* Card 1: আজকের আয় matching Capture6.PNG */}
            <div className="rounded-2xl bg-white border border-[#dce9f2] p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                  আজকের আয়: <span className="text-[#0284c7] font-black font-game">৳ {(liveStats?.todayCommission !== undefined ? liveStats.todayCommission : 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  সক্রিয়
                </span>
              </div>

              <div className="pt-3 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-gray-700">
                  <span>আমন্ত্রণ পুরস্কার</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.todayInstantReward ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>সাফল্য পুরস্কার</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.todayMilestoneReward ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>জমা ছাড়া</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.todayDepositCommission ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>বেটিং রিবেট</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.todayBetRebate ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>সূচিপত্রধারী</span>
                  <span className="font-bold text-gray-800 font-game">{liveStats?.todayFriendsCount !== undefined ? liveStats.todayFriendsCount : 4}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>যোগ্য পরিচয়করা</span>
                  <span className="font-bold text-gray-800 font-game">{Math.ceil((liveStats?.todayFriendsCount || 4) / 2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>জমাদানকারী</span>
                  <span className="font-bold text-gray-800 font-game">{Math.ceil((liveStats?.todayFriendsCount || 4) / 2)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: মোট আয় matching Capture4.PNG */}
            <div className="rounded-2xl bg-white border border-[#dce9f2] p-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                  মোট আয়: <span className="text-[#0284c7] font-black font-game">৳ {Number(liveStats?.totalEarnings ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  সর্বমোট
                </span>
              </div>

              <div className="pt-3 space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-gray-700">
                  <span>আমন্ত্রণ পুরস্কার</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.instantRewardTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>সাফল্য পুরস্কার</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.milestoneRewardTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>জমা ছাড়া</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.depositCommissionTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>বেটিং রিবেট</span>
                  <span className="font-black text-[#2e3e78] font-game">৳ {(liveStats?.breakdown?.betRebateTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>সূচিপত্রধারী</span>
                  <span className="font-bold text-gray-800 font-game">{liveStats?.totalFriends !== undefined ? liveStats.totalFriends : 14}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>যোগ্য পরিচয়করা</span>
                  <span className="font-bold text-gray-800 font-game">{liveStats?.qualifiedFriends !== undefined ? liveStats.qualifiedFriends : 8}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <span>জমাদানকারী</span>
                  <span className="font-bold text-gray-800 font-game">{liveStats?.depositedFriends !== undefined ? liveStats.depositedFriends : 6}</span>
                </div>
              </div>
            </div>

            {/* Bottom Note matching screenshot */}
            <p className="text-xs text-gray-500 text-center pt-1">
              নোট: সিস্টেমটি তথ্যগুলি ১৫ মিনিটে পর্যন্ত আপডেট করে।
            </p>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: রেকর্ডস (Records) matching Capture5.PNG */}
        {/* ======================================================================= */}
        {activeTab === 'records' && (
          <div className="flex flex-col min-h-[500px] animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="p-3 flex items-center justify-between gap-2 max-w-lg mx-auto w-full">
              {/* Category Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsRecordDropdownOpen(!isRecordDropdownOpen)}
                  className="px-3 py-1.5 rounded-xl border border-sky-400 bg-white text-xs font-bold text-[#0284c7] flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>{recordCategory}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isRecordDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-xs divide-y divide-gray-100">
                    {['আমন্ত্রণ পুরস্কার', 'সাফল্য পুরস্কার', 'জমা ছাড়া', 'বেটিং রিবেট', 'সব'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setRecordCategory(opt);
                          setIsRecordDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-sky-50 text-gray-800 font-medium cursor-pointer"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample Data Toggle / Date Range Pill */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUseSampleDataInRecords(!useSampleDataInRecords)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                    useSampleDataInRecords ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                  title="নমুনা ডেটা টগল"
                >
                  {useSampleDataInRecords ? 'নমুনা ডেটা: চালু' : 'খালি ভিউ'}
                </button>

                <div className="px-3 py-1.5 rounded-xl border border-sky-400 bg-white text-xs font-bold text-[#0284c7] flex items-center gap-1.5 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-mono">08/30- 08/30</span>
                </div>
              </div>
            </div>

            {/* Table Header Bar */}
            <div className="bg-[#f4f7fa] border-y border-gray-200 px-4 py-2.5 grid grid-cols-3 text-center text-xs font-bold text-gray-700 max-w-lg mx-auto w-full">
              <span>নিবন্ধনের তারিখ</span>
              <span>ব্যবহারকারীর নাম</span>
              <span>পরিমাণ</span>
            </div>

            {/* List / Empty State Body */}
            <div className="flex-1 max-w-lg mx-auto w-full">
              {filteredRecords.length > 0 ? (
                <div className="divide-y divide-gray-100 bg-white">
                  {filteredRecords.map((item) => (
                    <div 
                      key={item.id}
                      className="px-4 py-3 grid grid-cols-3 items-center text-center text-xs hover:bg-sky-50/50 transition-colors"
                    >
                      <div className="flex flex-col text-left pl-1">
                        <span className="font-mono text-gray-700 text-[11px]">{item.regDate.split(' ')[0]}</span>
                        <span className="font-mono text-gray-500 text-[10px]">{item.regDate.split(' ')[1]}</span>
                      </div>
                      <div className="font-mono font-bold text-gray-800 truncate px-1">
                        {item.username}
                      </div>
                      <div className="text-right pr-1">
                        <span className="font-game font-black text-[#155e4b]">৳ {item.amount}</span>
                        <span className="block text-[9px] text-emerald-600 font-bold">{item.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8">
                  {renderEmptyBox()}
                </div>
              )}
            </div>

            {/* Bottom Summary Bar */}
            <div className="mt-auto border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between text-sm font-bold text-gray-800 max-w-lg mx-auto w-full shadow-xs">
              <span>মোট</span>
              <span className="font-mono text-base font-black text-[#0284c7]">
                ৳ {recordsTotalSum}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 5: আমন্ত্রিতদের তালিকা (Invited Friends List) matching Capture8.PNG */}
        {/* ======================================================================= */}
        {activeTab === 'invitedList' && (
          <div className="p-3.5 space-y-3.5 max-w-lg mx-auto animate-in fade-in duration-200">
            
            {/* Top Stats Split Card matching Capture8.PNG */}
            <div className="rounded-2xl border border-[#d2e4f5] overflow-hidden flex shadow-sm bg-white">
              {/* Left Panel (Light blue) */}
              <div className="flex-1 bg-gradient-to-b from-[#e6f3ff] to-[#d8ecfc] p-3.5 border-r border-[#d2e4f5] flex flex-col justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-xs">
                    💎
                  </div>
                  <span className="text-xs font-black text-[#0284c7] italic tracking-wide">Default Tier</span>
                </div>

                <div className="space-y-1.5 mt-3 text-xs">
                  <div className="flex items-center justify-between text-gray-700 font-bold">
                    <span>সূচিপত্রধারী</span>
                    <span className="font-game font-black text-gray-900">{liveStats?.totalFriends !== undefined ? liveStats.totalFriends : 14}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700 font-bold">
                    <span>যোগ্য পরিচয়করা</span>
                    <span className="font-game font-black text-emerald-700">{liveStats?.qualifiedFriends !== undefined ? liveStats.qualifiedFriends : 8}</span>
                  </div>
                </div>
              </div>

              {/* Right Panel (Light warm cream) */}
              <div className="w-40 bg-[#fff9ee] p-3.5 flex flex-col justify-between text-xs space-y-2 font-bold">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-amber-800">আজ</span>
                  <span className="text-emerald-700 font-mono font-black">+{liveStats?.todayFriendsCount !== undefined ? liveStats.todayFriendsCount : 2}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-amber-800">গতকাল</span>
                  <span className="text-emerald-700 font-mono font-black">+{liveStats?.yesterdayFriendsCount !== undefined ? liveStats.yesterdayFriendsCount : 3}</span>
                </div>
                <div className="flex items-center justify-between text-gray-700">
                  <span className="text-amber-800">বর্তমান মাস</span>
                  <span className="text-emerald-700 font-mono font-black">+{liveStats?.thisMonthFriendsCount !== undefined ? liveStats.thisMonthFriendsCount : 14}</span>
                </div>
              </div>
            </div>

            {/* Filter Controls Row matching Capture8.PNG */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Dropdown: সব ⌄ */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsInvitedDropdownOpen(!isInvitedDropdownOpen)}
                      className="px-3 py-1.5 rounded-xl border border-sky-400 bg-white text-xs font-bold text-[#0284c7] flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <span>{invitedFilter}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {isInvitedDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-40 py-1 text-xs">
                        {['সব', 'সক্রিয়', 'নিষ্ক্রিয়'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setInvitedFilter(opt);
                              setIsInvitedDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-sky-50 text-gray-800 font-medium cursor-pointer"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date Tabs: আজ / গতকাল / বর্তমান মাস */}
                  <div className="flex bg-gray-100 p-0.5 rounded-xl border border-gray-200 text-xs font-bold">
                    {(['today', 'yesterday', 'month'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setActiveDateTab(t)}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          activeDateTab === t ? 'bg-sky-500 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {t === 'today' ? 'আজ' : t === 'yesterday' ? 'গতকাল' : 'মাস'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sample Toggle */}
                <button
                  type="button"
                  onClick={() => setUseSampleDataInInvited(!useSampleDataInInvited)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                    useSampleDataInInvited ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
                >
                  {useSampleDataInInvited ? 'নমুনা: চালু' : 'খালি'}
                </button>
              </div>

              {/* Search Bar */}
              {useSampleDataInInvited && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="আমন্ত্রিত বন্ধুর নাম অনুসন্ধান করুন..."
                    value={searchInvitedQuery}
                    onChange={(e) => setSearchInvitedQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 outline-none focus:border-sky-400 shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              )}
            </div>

            {/* Invited Friends List or Empty State */}
            {filteredInvitedFriends.length > 0 ? (
              <div className="space-y-2.5">
                {filteredInvitedFriends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="bg-white rounded-2xl p-3.5 border border-gray-200/90 shadow-2xs flex flex-col gap-2 hover:border-sky-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-gray-900 text-xs">{friend.username}</div>
                          <div className="text-[10px] text-gray-500 font-mono">{friend.regDate}</div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        friend.isQualified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {friend.isQualified ? 'যোগ্য পরিচয়' : 'অপেক্ষমান'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-center bg-gray-50/80 rounded-xl p-2 text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">ডিপোজিট</span>
                        <span className="font-game font-bold text-gray-800">৳ {friend.depositAmount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">মোট বাজি</span>
                        <span className="font-game font-bold text-gray-800">৳ {friend.betAmount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">কমিশন লাভ</span>
                        <span className="font-game font-black text-emerald-700">৳ {(Number(friend.commission) || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-6">
                {renderEmptyBox('কোন আমন্ত্রিত বন্ধু পাওয়া যায়নি')}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-gray-800 space-y-3.5 text-xs sm:text-sm border border-gray-100">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-base text-[#0b3327] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>আমন্ত্রণ বোনাস নিয়মাবলী</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 leading-relaxed space-y-1.5">
              <span className="block">১. বন্ধুদের আপনার রেফারেল লিংক বা QR কোডের মাধ্যমে আমন্ত্রণ জানান।</span>
              <span className="block">২. আপনার আমন্ত্রিত বন্ধু ডিপোজিট ও বেটিং সম্পন্ন করলে তাৎক্ষণিকভাবে ৳৩০০ বোনাস পাবেন।</span>
              <span className="block">৩. প্রতিটি বৈধ বেটিং থেকে আজীবন ১.০% এজেন্ট কমিশন আপনার অ্যাকাউন্টে জমা হবে।</span>
              <span className="block">৪. বোনাস অবিলম্বে মূল ওয়ালেটে যুক্ত হবে এবং তাৎক্ষণিকভাবে উত্তোলনযোগ্য।</span>
            </p>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#0b3327] hover:bg-[#07241b] text-white font-bold rounded-xl shadow cursor-pointer mt-2"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

      {/* Bind Referral Code Modal */}
      {isBindingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl text-gray-800 space-y-4 text-xs border border-gray-100">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-black text-base text-[#0b3327] flex items-center gap-1.5">
                <Link className="w-4 h-4 text-blue-600" />
                <span>আমন্ত্রক কোড যুক্ত করুন</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsBindingModalOpen(false)}
                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              আপনার আমন্ত্রকের রেফারেল কোড প্রবেশ করান। কোড যুক্ত হওয়ার সাথে সাথে আপনি এবং আপনার আমন্ত্রক উভয়েই বিশেষ রেফারেল সুবিধা পাবেন।
            </p>

            <form onSubmit={handleBindReferralCode} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">রেফারেল কোড:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BDT452, wcc4192..."
                  value={bindReferralCodeInput}
                  onChange={(e) => setBindReferralCodeInput(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-sm uppercase font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBindingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBind}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingBind ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>যাচাই হচ্ছে...</span>
                    </>
                  ) : (
                    <span>নিশ্চিত করুন</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
