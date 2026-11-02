// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  X, 
  Rocket, 
  Clock, 
  Hand, 
  Banknote,
  Flame,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { useServerMissions } from '../services/missions';

interface MissionMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  onClaimReward?: (amount: number, title: string) => void;
  showToast?: (msg: string) => void;
}

// 26 Milestone Tiers matching BengalBet system in screenshots
interface MilestoneItem {
  id: number;
  betTarget: number;
  betTargetDisplay: string;
  bonus: number;
  bonusDisplay: string;
}



// Custom 3D Bronze/Gold Star Medal Icon matching Capture11.PNG & Capture12.PNG
const MissionMedalGraphic: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {/* Blue & Yellow Striped Ribbon Gradient */}
      <linearGradient id="ribbonBlueStripe" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1e40af" />
        <stop offset="25%" stopColor="#2563eb" />
        <stop offset="25.1%" stopColor="#facc15" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="50.1%" stopColor="#1e40af" />
        <stop offset="75%" stopColor="#2563eb" />
        <stop offset="75.1%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      {/* Bronze/Gold Medallion Gradients */}
      <radialGradient id="medalFace" cx="45%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="40%" stopColor="#fb923c" />
        <stop offset="85%" stopColor="#c2410c" />
        <stop offset="100%" stopColor="#7c2d12" />
      </radialGradient>
      <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="35%" stopColor="#fef08a" />
        <stop offset="70%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#b45309" />
      </linearGradient>
      <filter id="medalDropShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
      </filter>
    </defs>

    {/* Top Hanging Ribbon Straps */}
    <rect x="36" y="4" width="28" height="24" rx="2" fill="url(#ribbonBlueStripe)" />
    <polygon points="36,4 40,4 38,28 34,28" fill="#1e3a8a" opacity="0.4" />
    <polygon points="64,4 60,4 62,28 66,28" fill="#1e3a8a" opacity="0.4" />

    {/* Star Points Outer Rosette */}
    <g filter="url(#medalDropShadow)">
      <polygon 
        points="50,22 58,34 72,30 72,45 84,53 76,65 82,78 68,80 62,94 50,88 38,94 32,80 18,78 24,65 16,53 28,45 28,30 42,34" 
        fill="#ea580c" 
        stroke="#9a3412" 
        strokeWidth="1.5"
      />
    </g>

    {/* Center Circular Medallion */}
    <circle cx="50" cy="58" r="23" fill="url(#medalFace)" stroke="#ffedd5" strokeWidth="1.5" />
    <circle cx="50" cy="58" r="19" fill="#9a3412" opacity="0.25" />
    <circle cx="50" cy="58" r="17" stroke="#fdba74" strokeWidth="1" strokeDasharray="2 1.5" fill="none" />

    {/* 3D Center Star */}
    <polygon 
      points="50,44 54,53 64,53 56,60 59,70 50,64 41,70 44,60 36,53 46,53" 
      fill="url(#starGold)" 
      stroke="#7c2d12" 
      strokeWidth="0.8"
    />
  </svg>
);

// Runner Icon in Circle matching Capture11.PNG
const RunnerIcon: React.FC<{ active?: boolean; className?: string }> = ({ active = false, className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="14" cy="5" r="2" />
    <path d="M15 8c-1.1 0-2.1.5-2.8 1.3L10 11.5l-2.5-1.2c-.4-.2-.8-.1-1.1.2l-1.5 1.5c-.3.3-.3.8 0 1.1l3 3c.3.3.7.4 1.1.3l2.8-.7 1.7 4.8c.2.6.8 1 1.4 1h3.1c.6 0 1-.4 1-1s-.4-1-1-1h-2.3l-1.4-4 2.3-2.3c.6-.6 1.4-.9 2.3-.9h.5c.6 0 1-.4 1-1s-.4-1-1-1h-.5z" />
  </svg>
);

export const MissionMobileView: React.FC<MissionMobileViewProps> = ({
  user,
  onBack,
  onClose,
  onClaimReward,
  showToast = () => {}
}) => {
  // 3 Tabs matching Capture11.PNG & Capture12.PNG
  const [activeTab, setActiveTab] = useState<'running' | 'upcoming' | 'finished'>('running');
  const [showRulesModal, setShowRulesModal] = useState(false);

  const missions = useServerMissions(onClaimReward ? () => onClaimReward(0, 'mission') : undefined, showToast);
  const countdown = missions.countdown;

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Format dynamic dates
  const formatDateStr = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  };

  const handleClaim = async (tier: any) => {
    if (await missions.claim(tier)) confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const username = user?.phone || user?.username || '1752348921';
  const balance = user?.balance !== undefined ? user.balance.toFixed(2) : '0.00';
  const userAvatar = user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

  return (
    <div 
      id="mission-mobile-full-view"
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

        <h1 className="text-base sm:text-lg font-extrabold text-white tracking-wide font-bengali">
          মিশন
        </h1>

        {/* Right Help / Rules trigger */}
        <button
          type="button"
          onClick={() => setShowRulesModal(true)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-yellow-300 font-bold text-xs cursor-pointer active:scale-95"
          title="নিয়মাবলী"
        >
          ?
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. PROFILE HERO BANNER: Neon Gradient with Glowing 3D Rings */}
      {/* ========================================================================= */}
      <div className="relative bg-gradient-to-r from-[#00d2ff] via-[#3a40c9] to-[#d924ca] px-4 pt-4 pb-7 text-white shadow-md shrink-0 overflow-hidden">
        {/* Background Glowing 3D Neon Rings SVG matching Capture11.PNG */}
        <div className="absolute right-0 top-0 bottom-0 w-52 pointer-events-none overflow-hidden opacity-90">
          <svg viewBox="0 0 200 160" className="w-full h-full">
            <defs>
              <linearGradient id="ringNeon1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff2a85" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <linearGradient id="ringNeon2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="60%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <filter id="glowBlur">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Orb 1 */}
            <circle cx="160" cy="110" r="48" stroke="url(#ringNeon1)" strokeWidth="12" fill="none" opacity="0.8" filter="url(#glowBlur)" />
            <circle cx="140" cy="40" r="32" stroke="url(#ringNeon2)" strokeWidth="8" fill="none" opacity="0.6" />
            <ellipse cx="150" cy="80" rx="60" ry="25" stroke="#f472b6" strokeWidth="6" fill="none" opacity="0.5" transform="rotate(-25 150 80)" />
          </svg>
        </div>

        {/* Avatar + Info Container */}
        <div className="relative z-10 flex items-center gap-3.5">
          {/* Avatar with thick white circular border */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-lg bg-white/20">
            <img 
              src={userAvatar}
              alt={username}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* User ID & Balance */}
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-extrabold tracking-wide text-white drop-shadow-sm font-mono">
              {username}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-game text-white tracking-wide drop-shadow-md">
                ৳ {balance}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FLOATING TOP TABS: চলমান | শীঘ্রই আসছে | শেষ */}
      {/* ========================================================================= */}
      <div className="px-3 -mt-3.5 z-20 shrink-0">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1 flex items-center">
          {/* Tab 1: চলমান (Ongoing) */}
          <button
            type="button"
            onClick={() => setActiveTab('running')}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-lg relative ${
              activeTab === 'running'
                ? 'text-red-600 font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Rocket className={`w-4 h-4 ${activeTab === 'running' ? 'text-red-600 fill-red-600' : 'text-gray-500'}`} />
            <span>চলমান</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Tab 2: শীঘ্রই আসছে (Coming Soon) */}
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-lg relative ${
              activeTab === 'upcoming'
                ? 'text-red-600 font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'upcoming' ? 'text-red-600 fill-red-600 text-white' : 'text-gray-500'}`} />
            <span>শীঘ্রই আসছে</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200" />

          {/* Tab 3: শেষ (Finished) */}
          <button
            type="button"
            onClick={() => setActiveTab('finished')}
            className={`flex-1 py-2.5 px-2 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer rounded-lg relative ${
              activeTab === 'finished'
                ? 'text-red-600 font-black'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Hand className={`w-4 h-4 ${activeTab === 'finished' ? 'text-red-600 fill-red-600' : 'text-gray-500'}`} />
            <span>শেষ</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN SCROLLABLE CONTENT */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#f8fafc]">
        
        {/* ======================================================================= */}
        {/* TAB 1: চলমান (Ongoing Mission - Capture11.PNG) */}
        {/* ======================================================================= */}
        {activeTab === 'running' && (
          <div className="space-y-4 max-w-lg mx-auto animate-in fade-in duration-200">
            
            {/* Mission Hero Card matching Capture11.PNG */}
            <div className="rounded-2xl bg-gradient-to-b from-[#e2ecf5] via-[#d6e3ee] to-[#c8d8e6] p-4 shadow-sm border border-white/70 relative overflow-hidden">
              {/* Background translucent star watermark */}
              <div className="absolute right-3 -bottom-6 text-white/30 text-8xl font-black pointer-events-none select-none">
                ★
              </div>

              <div className="relative z-10 flex items-start gap-3">
                {/* Left Column: Medal Graphic & 0% */}
                <div className="flex flex-col items-center shrink-0 w-16">
                  <MissionMedalGraphic className="w-14 h-14 drop-shadow-sm" />
                  <span className="text-base sm:text-lg font-black text-gray-800 mt-1 font-game">
                    0<span className="text-xs">%</span>
                  </span>
                </div>

                {/* Right Column: Title, Rules button, Dates, Countdown, Target */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                      স্লট মেশিন বেটিং ফান্ড
                    </h2>

                    {/* নিয়ম Pill Button */}
                    <button
                      type="button"
                      onClick={() => setShowRulesModal(true)}
                      className="px-3 py-0.5 rounded-full bg-white/70 hover:bg-white text-gray-700 border border-gray-400/60 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      নিয়ম
                    </button>
                  </div>

                  {/* Details List */}
                  <div className="mt-1 space-y-0.5 text-xs text-gray-700 font-medium">
                    <p>
                      তারিখ: <span className="font-mono text-gray-800">{formatDateStr(-1)}~{formatDateStr(0)}</span>
                    </p>
                    <p>
                      অবশিষ্ট: <span className="font-mono font-bold text-gray-800">{pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}</span>
                    </p>
                    <p>
                      লক্ষ্য: <span className="font-bold text-gray-800">0/26</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom White Progress Bar matching screenshot */}
              <div className="mt-3.5 w-full h-2.5 rounded-full bg-white shadow-inner overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-0" />
              </div>
            </div>

            {/* Section Header: অসম্পূর্ণ লক্ষ্য (26) */}
            <div className="pt-1">
              <h3 className="text-sm sm:text-base font-black text-gray-900 flex items-center gap-1.5 font-bengali">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>অসম্পূর্ণ লক্ষ্য (26)</span>
              </h3>
            </div>

            {/* 26 Milestone Timeline Step List matching Capture11.PNG */}
            <div className="relative pl-4 space-y-3 pb-6">
              {/* Continuous vertical timeline connector line */}
              <div className="absolute left-[27px] top-4 bottom-6 w-0.5 bg-gray-200 -z-0" />

              {missions.tiers.map((tier, idx) => {
                const isFirst = idx === 0;
                const isClaimed = tier.claimed;

                return (
                  <div key={tier.id} className="relative flex items-start gap-3 z-10 group">
                    
                    {/* Left Icon: Orange for step 1, Grey for others matching Capture11.PNG */}
                    <div 
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs mt-3 ${
                        isFirst 
                          ? 'bg-amber-400 text-white shadow-amber-200' 
                          : isClaimed
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-300 text-white'
                      }`}
                    >
                      {isClaimed ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <RunnerIcon className="w-4 h-4" />
                      )}
                    </div>

                    {/* Right Card Container matching Capture11.PNG */}
                    <div className="flex-1 bg-white rounded-xl border border-gray-200/80 shadow-xs p-3.5 flex flex-col gap-2.5 transition-all hover:border-blue-200">
                      
                      {/* Top Line: বৈধ বেট: & ৳ 0 / 1,000.00 */}
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-extrabold text-gray-900">
                          বৈধ বেট:
                        </span>
                        <span className="font-bold text-gray-700 font-game">
                          ৳ {missions.turnoverDisplay} / {tier.betTargetDisplay}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="w-full h-px bg-gray-100" />

                      {/* Bottom Line: Blue Pill with Banknote & Bonus */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0284c7] text-xs font-black shadow-2xs">
                          <Banknote className="w-4 h-4 text-[#0284c7]" />
                          <span>বোনাস : ৳ {tier.bonusDisplay}</span>
                        </div>

                        {/* Interactive Claim / Target button */}
                        {isClaimed ? (
                          <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            গৃহীত ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleClaim(tier)}
                            className="text-[11px] font-extrabold text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded transition-all cursor-pointer"
                          >
                            {tier.eligible ? 'দাবি করুন' : `অগ্রগতি: ${Math.min(100, Math.floor(missions.turnover * 100 / tier.betTarget))}%`}
                          </button>
                        )}
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: শীঘ্রই আসছে (Coming Soon - Capture12.PNG) */}
        {/* ======================================================================= */}
        {activeTab === 'upcoming' && (
          <div className="space-y-3.5 max-w-lg mx-auto animate-in fade-in duration-200">
            {[
              { id: 1, dateStr: `${formatDateStr(0)}~${formatDateStr(1)}` },
              { id: 2, dateStr: `${formatDateStr(1)}~${formatDateStr(2)}` },
              { id: 3, dateStr: `${formatDateStr(2)}~${formatDateStr(3)}` },
              { id: 4, dateStr: `${formatDateStr(3)}~${formatDateStr(4)}` },
            ].map((item) => (
              <div 
                key={item.id}
                className="rounded-2xl bg-gradient-to-b from-[#e2ecf5] via-[#d6e3ee] to-[#c8d8e6] p-4 shadow-sm border border-white/70 relative overflow-hidden"
              >
                {/* Background watermark */}
                <div className="absolute right-3 -bottom-6 text-white/30 text-8xl font-black pointer-events-none select-none">
                  ★
                </div>

                <div className="relative z-10 flex items-start gap-3">
                  {/* Left: Medal Graphic & 0% */}
                  <div className="flex flex-col items-center shrink-0 w-16">
                    <MissionMedalGraphic className="w-14 h-14 drop-shadow-sm opacity-90" />
                    <span className="text-base sm:text-lg font-black text-gray-800 mt-1 font-game">
                      0<span className="text-xs">%</span>
                    </span>
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h2 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                        স্লট মেশিন বেটিং ফান্ড
                      </h2>

                      <button
                        type="button"
                        onClick={() => setShowRulesModal(true)}
                        className="px-3 py-0.5 rounded-full bg-white/70 hover:bg-white text-gray-700 border border-gray-400/60 text-xs font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        নিয়ম
                      </button>
                    </div>

                    <div className="mt-1 space-y-0.5 text-xs text-gray-700 font-medium">
                      <p>
                        তারিখ: <span className="font-mono text-gray-800">{item.dateStr}</span>
                      </p>
                      <p>
                        অবশিষ্ট: <span className="font-mono font-bold text-gray-600">----</span>
                      </p>
                      <p>
                        লক্ষ্য: <span className="font-bold text-gray-800">0/26</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* White Progress Bar */}
                <div className="mt-3.5 w-full h-2.5 rounded-full bg-white shadow-inner overflow-hidden p-0.5">
                  <div className="h-full rounded-full bg-gray-300 w-0" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: শেষ (Finished / History) */}
        {/* ======================================================================= */}
        {activeTab === 'finished' && (
          <div className="space-y-3.5 max-w-lg mx-auto animate-in fade-in duration-200">
            {/* Previous finished event card */}
            <div className="rounded-2xl bg-gradient-to-b from-[#e8edf2] via-[#dee5ec] to-[#d2dbe4] p-4 shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="relative z-10 flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0 w-16 opacity-75">
                  <MissionMedalGraphic className="w-14 h-14 drop-shadow-sm grayscale-30" />
                  <span className="text-base sm:text-lg font-black text-gray-700 mt-1 font-game">
                    100<span className="text-xs">%</span>
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-sm sm:text-base font-black text-gray-900 leading-tight">
                      স্লট মেশিন বেটিং ফান্ড
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 font-bold text-[10px]">
                      মেয়াদ শেষ
                    </span>
                  </div>

                  <div className="mt-1 space-y-0.5 text-xs text-gray-700 font-medium">
                    <p>তারিখ: <span className="font-mono text-gray-800">{formatDateStr(-2)}~{formatDateStr(-1)}</span></p>
                    <p>অবশিষ্ট: <span className="font-mono font-bold text-gray-600">00:00:00</span></p>
                    <p>লক্ষ্য: <span className="font-bold text-emerald-700">26/26 সম্পন্ন</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 w-full h-2.5 rounded-full bg-white shadow-inner overflow-hidden p-0.5">
                <div className="h-full rounded-full bg-emerald-500 w-full" />
              </div>
            </div>

            {/* Empty Note */}
            <p className="text-center text-xs text-gray-500 pt-3 font-medium">
              আর কোনো সমাপ্ত ইভেন্ট পাওয়া যায়নি
            </p>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 5. RULES POPUP MODAL (নিয়মাবলী) */}
      {/* ========================================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 relative overflow-hidden animate-in zoom-in-95">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 font-bengali">
                ইভেন্টের নিয়মাবলী
              </h3>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-gray-700 leading-relaxed font-bengali max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                <p className="font-bold text-emerald-900 mb-1">১. ইভেন্টের সময়:</p>
                <p className="text-gray-600 text-xs">প্রতিদিন 00:00:00 থেকে 23:59:59 পর্যন্ত প্রযোজ্য।</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                <p className="font-bold text-emerald-900 mb-1">২. অংশগ্রহণমূলক গেম:</p>
                <p className="text-gray-600 text-xs">সকল স্লট মেশিন গেমের বৈধ বেট এই ইভেন্টে গণনা করা হবে।</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                <p className="font-bold text-emerald-900 mb-1">৩. বোনাস পাওয়ার শর্ত:</p>
                <p className="text-gray-600 text-xs">প্রতিটি টার্গেট স্তরে পৌঁছানোর সাথে সাথে সংশ্লিষ্ট বোনাস স্বয়ংক্রিয়ভাবে সক্রিয় হবে।</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/80">
                <p className="font-bold text-emerald-900 mb-1">৪. টার্নওভার নিয়ম:</p>
                <p className="text-gray-600 text-xs">দাবিকৃত বোনাস যেকোনো গেমে ১ গুণ (1x) খেলার পর সরাসরি উত্তোলন করা যাবে।</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#0b3327] hover:bg-[#124d3c] text-white font-black text-sm transition-transform active:scale-95 shadow cursor-pointer"
            >
              বুঝেছি
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
