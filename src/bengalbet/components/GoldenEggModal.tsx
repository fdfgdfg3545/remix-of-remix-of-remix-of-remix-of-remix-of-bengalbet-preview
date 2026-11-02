// @ts-nocheck
/**
 * BengalBet Golden Egg Smash Modal
 * Features:
 * - 8 golden eggs grid with interactive smash animation & hammer strike
 * - Instant surprise jackpot rewards (৳888, ৳1888, ৳3888) with confetti
 * - Live rolling winners ticker
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Trophy, ChevronRight, Sparkles, Check, Gift, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Language, UserAccount } from '../types';
import { 
  getGoldenEggRenewTime, 
  setGoldenEggRenew, 
  getGoldenEggLastPrize, 
  clearGoldenEggRenew 
} from '../utils/goldenEggRenew';

interface GoldenEggModalProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onEggSmashed?: (amount: number, message: string) => void;
  /** Server already credited the egg prize; parent only refreshes the wallet. */
  onSettled?: (result: any) => void;
  onBackToReward?: (tab?: string) => void;
}

interface EggItem {
  id: number;
  isSmashed: boolean;
  isUserChosen: boolean;
  prizeAmount: number;
}

interface WinnerLog {
  id: string;
  username: string;
  amount: string;
}

const PRESET_PRIZES = [888, 1888, 888, 3888, 888, 1888, 888, 888];

const INITIAL_WINNERS: WinnerLog[] = [
  { id: '1', username: 'rh***r', amount: '৳ 888.00' },
  { id: '2', username: 'rd*****s', amount: '৳ 1,888.00' },
  { id: '3', username: 'ps*****r', amount: '৳ 888.00' },
  { id: '4', username: 'md*****9', amount: '৳ 888.00' },
  { id: '5', username: 'sh*****2', amount: '৳ 1,888.00' },
  { id: '6', username: 'ak*****7', amount: '৳ 888.00' },
  { id: '7', username: 'bd*****1', amount: '৳ 3,888.00' },
  { id: '8', username: 'ka*****5', amount: '৳ 888.00' },
];

export const GoldenEggModal: React.FC<GoldenEggModalProps> = ({
  language,
  user,
  onClose,
  onSettled,
  onBackToReward
}) => {
  const [eggError, setEggError] = useState('');
  const [eggsLeft, setEggsLeft] = useState<number>(Number(user?.goldenEggsAvailable) || 0);
  // A member with server-granted hammers left is never blocked by an old browser cooldown
  if ((Number(user?.goldenEggsAvailable) || 0) > 0 && getGoldenEggRenewTime()) clearGoldenEggRenew();
  const [activeTab, setActiveTab] = useState<'fortune' | 'recharge'>('fortune');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check persistent renew cooldown
  const [renewTimestamp, setRenewTimestamp] = useState<number | null>(() => getGoldenEggRenewTime());
  const [lastClaimedPrize, setLastClaimedPrize] = useState<number | null>(() => getGoldenEggLastPrize());
  const isCurrentlyInRenew = Boolean(renewTimestamp && renewTimestamp > Date.now());

  const [hasSmashedAny, setHasSmashedAny] = useState<boolean>(() => isCurrentlyInRenew);
  const [chosenEggId, setChosenEggId] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('bengalbet_golden_egg_chosen_id');
      return stored ? parseInt(stored, 10) : null;
    } catch {
      return null;
    }
  });
  const [wonPrize, setWonPrize] = useState<number | null>(() => getGoldenEggLastPrize());
  const [showPrizeAlert, setShowPrizeAlert] = useState(false);
  const [hasCollectedPrize, setHasCollectedPrize] = useState<boolean>(() => isCurrentlyInRenew);

  const handleModalClose = () => {
    // If egg was smashed but prize was not collected yet, ensure it is added to balance before closing
    if (wonPrize && !hasCollectedPrize) setHasCollectedPrize(true);
    if (onBackToReward) {
      onBackToReward('coupons');
    } else {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) {
        handleModalClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProcessing, wonPrize, hasCollectedPrize]);

  // 8 Golden Eggs in 2-3-3 formation
  const [eggs, setEggs] = useState<EggItem[]>(() => {
    const defaultEggs: EggItem[] = [
      { id: 1, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
      { id: 2, isSmashed: false, isUserChosen: false, prizeAmount: 1888 },
      { id: 3, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
      { id: 4, isSmashed: false, isUserChosen: false, prizeAmount: 3888 },
      { id: 5, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
      { id: 6, isSmashed: false, isUserChosen: false, prizeAmount: 1888 },
      { id: 7, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
      { id: 8, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
    ];
    if (isCurrentlyInRenew) {
      const chosen = chosenEggId || 1;
      return defaultEggs.map(e => ({
        ...e,
        isSmashed: true,
        isUserChosen: e.id === chosen,
        prizeAmount: e.id === chosen && lastClaimedPrize ? lastClaimedPrize : e.prizeAmount
      }));
    }
    return defaultEggs;
  });

  // Dynamic live countdown timer ticking down to renew timestamp
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>(() => {
    // Plan: hammers renew at 00:00 Bangladesh time (UTC+6)
    const bdNow = Date.now() + 6 * 3600 * 1000;
    const target = renewTimestamp || (bdNow - (bdNow % 86400000) + 86400000 - 6 * 3600 * 1000);
    const diff = Math.max(0, target - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const activeRenew = getGoldenEggRenewTime();
      if (activeRenew) {
        const diff = activeRenew - Date.now();
        if (diff <= 0) {
          // Renew time arrived! Reset eggs to fresh unsmashed state
          clearGoldenEggRenew();
          setRenewTimestamp(null);
          setHasSmashedAny(false);
          setChosenEggId(null);
          setWonPrize(null);
          setHasCollectedPrize(false);
          setEggs([
            { id: 1, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
            { id: 2, isSmashed: false, isUserChosen: false, prizeAmount: 1888 },
            { id: 3, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
            { id: 4, isSmashed: false, isUserChosen: false, prizeAmount: 3888 },
            { id: 5, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
            { id: 6, isSmashed: false, isUserChosen: false, prizeAmount: 1888 },
            { id: 7, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
            { id: 8, isSmashed: false, isUserChosen: false, prizeAmount: 888 },
          ]);
        } else {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          });
        }
      } else {
        // Standard countdown before smash
        setTimeLeft(prev => {
          if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
          if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
          if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Rotating winner ticker
  const [winners, setWinners] = useState<WinnerLog[]>(INITIAL_WINNERS.slice(0, 3));

  useEffect(() => {
    const ticker = setInterval(() => {
      setWinners(prev => {
        const randomNew = INITIAL_WINNERS[Math.floor(Math.random() * INITIAL_WINNERS.length)];
        return [
          { ...randomNew, id: `w-${Date.now()}` },
          prev[0],
          prev[1]
        ];
      });
    }, 2800);

    return () => clearInterval(ticker);
  }, []);

  // When user clicks 1 egg: break, award prize, and prepare permanent close for renew time
  const handleSmashEgg = async (clickedId: number) => {
    if (isProcessing || hasSmashedAny || isCurrentlyInRenew) return;
    setEggError('');
    if (eggsLeft <= 0) {
      setEggError('আপনার কোনো হাতুড়ি নেই। প্রতিদিন লগইনে ১টি এবং প্রতিটি অনুমোদিত জমায় ১টি (দিনে সর্বোচ্চ ৩টি) পাবেন।');
      return;
    }
    setIsProcessing(true);
    // The server picks the prize from the admin prize table and credits it once
    let result: any;
    try {
      result = await api.rewards.playChance('golden_egg');
    } catch (e: any) {
      setIsProcessing(false);
      setEggError(e?.message || 'সোনার ডিম এখন ভাঙা যায়নি।');
      return;
    }
    onSettled?.(result);
    const left = Number(result?.user?.golden_eggs_available ?? 0);
    setEggsLeft(left);
    setHasSmashedAny(true);
    setChosenEggId(clickedId);

    const prize = Number(result?.prize?.amount) || 0;
    setWonPrize(prize);
    setHasCollectedPrize(true);
    setLastClaimedPrize(prize);

    // Only show the renew countdown when no hammers are left
    if (left <= 0) {
      const renewUntil = setGoldenEggRenew(prize, clickedId);
      setRenewTimestamp(renewUntil);
    }

    // 1. Break the selected egg immediately
    setEggs(prev => prev.map(e => e.id === clickedId ? { ...e, isSmashed: true, isUserChosen: true, prizeAmount: prize } : e));

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 }
    });

    // 2. Cascade break all other eggs sequentially
    const otherEggIds = eggs.filter(e => e.id !== clickedId).map(e => e.id);
    
    otherEggIds.forEach((eggId, index) => {
      setTimeout(() => {
        setEggs(prev => prev.map(e => e.id === eggId ? { ...e, isSmashed: true, isUserChosen: false } : e));

        // When the final egg breaks, fire celebration and open prize alert
        if (index === otherEggIds.length - 1) {
          setTimeout(() => {
            setIsProcessing(false);
            setShowPrizeAlert(true);
            confetti({
              particleCount: 130,
              spread: 90,
              origin: { y: 0.5 }
            });
          }, 400);
        }
      }, (index + 1) * 140);
    });
  };

  // Collect reward and CLOSE PERMANENTLY for renew time!
  const handleCollectPrize = () => {
    if (wonPrize && !hasCollectedPrize) setHasCollectedPrize(true);
    setShowPrizeAlert(false);
    // Close permanent for renew time!
    onClose();
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      {/* Outer Container with perfectly centered scaling and scroll safe bounds */}
      <div className="relative w-full max-w-[390px] sm:max-w-[420px] my-auto flex flex-col items-center select-none pt-6 pb-2">
        
        {/* ========================================================================= */}
        {/* TOP ORNAMENT: Crown, Golden Trumpet Horns, and Red Ribbon Header */}
        {/* ========================================================================= */}
        <div className="relative z-20 w-full flex flex-col items-center -mb-4 sm:-mb-5 pointer-events-none">
          {/* Golden Crown & Horns */}
          <div className="relative flex items-center justify-center">
            {/* Left Trumpet */}
            <div className="text-3xl sm:text-4xl transform -rotate-45 -mr-2 drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]">
              📯
            </div>

            {/* Center Royal Jeweled Crown */}
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-12 sm:w-20 sm:h-14 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(255,215,0,0.8)]">
                <span className="text-4xl sm:text-5xl">👑</span>
              </div>
            </div>

            {/* Right Trumpet */}
            <div className="text-3xl sm:text-4xl transform rotate-45 -ml-2 drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]">
              📯
            </div>
          </div>

          {/* 3D Red Ribbon Banner: "পুরস্কার" */}
          <div className="relative -mt-2">
            {/* Ribbon Left Tail */}
            <div className="absolute -left-4 top-1 w-6 h-9 bg-[#b91c1c] rounded-l-md transform -skew-y-12 shadow-md" />
            
            {/* Ribbon Main Body */}
            <div className="relative px-12 sm:px-14 py-1.5 bg-gradient-to-b from-[#ef4444] via-[#dc2626] to-[#991b1b] border-y-2 border-yellow-300 rounded-md shadow-2xl flex items-center justify-center">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider font-bengali drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {language === 'bn' ? 'পুরস্কার' : 'REWARDS'}
              </h1>
            </div>

            {/* Ribbon Right Tail */}
            <div className="absolute -right-4 top-1 w-6 h-9 bg-[#b91c1c] rounded-r-md transform skew-y-12 shadow-md" />
          </div>
        </div>

        {/* Top Floating Controls: Clean Exit Close Button X */}
        <div className="absolute top-2 right-2 sm:right-0 z-30 flex items-center justify-end pointer-events-auto">
          <button
            id="close-golden-egg-modal-btn"
            onClick={handleModalClose}
            className="w-8 h-8 rounded-full border-2 border-white/90 bg-black/70 hover:bg-black/95 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN MODAL CARD BODY (Dark Rich Gradient, Golden Egg Stage) */}
        {/* ========================================================================= */}
        <div 
          id="golden-egg-modal-content"
          className="relative w-full rounded-3xl bg-gradient-to-b from-[#2d1b06] via-[#1a0f02] to-[#0d0701] border-2 border-amber-500/70 shadow-[0_0_50px_rgba(245,158,11,0.3)] pt-7 sm:pt-8 pb-4 px-3 sm:px-4 flex flex-col items-center overflow-hidden"
        >

          {/* Renew Cooldown Notice Banner if already claimed in this cycle */}
          {isCurrentlyInRenew && (
            <div className="w-full bg-gradient-to-r from-amber-950/95 via-[#451a03] to-amber-950/95 border-2 border-yellow-500/80 rounded-2xl p-3 text-center mb-3 shadow-[0_4px_15px_rgba(0,0,0,0.8)] z-20 animate-in fade-in">
              <div className="flex items-center justify-center gap-1.5 text-yellow-300 font-black text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'bn' ? 'সোনার ডিমের রিওয়ার্ড সম্পন্ন হয়েছে!' : "Golden Egg Reward Claimed!"}
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 mt-1">
                {language === 'bn'
                  ? `আপনি ৳ ${(lastClaimedPrize || wonPrize || 888)}.00 বোনাস গ্রহণ করেছেন। রিনিউ সময় পর্যন্ত ডিম বন্ধ থাকবে:`
                  : `You claimed ৳ ${(lastClaimedPrize || wonPrize || 888)}.00. Eggs remain closed until renew time:`}
              </p>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 rounded-full border border-yellow-400/50 text-yellow-300 font-mono text-xs font-black">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>
                  {padZero(timeLeft.days)}d : {padZero(timeLeft.hours)}h : {padZero(timeLeft.minutes)}m : {padZero(timeLeft.seconds)}s
                </span>
              </div>
              <div className="mt-2 flex justify-center">
                <button
                  onClick={handleModalClose}
                  className="px-5 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-amber-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {language === 'bn' ? 'রিনিউ সময় পর্যন্ত বন্ধ রাখুন' : 'Close (Renewing...)'}
                </button>
              </div>
            </div>
          )}
          
          {/* Sub-tabs row matching capture 2.PNG */}
          <div className="w-full flex items-center justify-center gap-2 mb-2 z-10">
            {/* Tab 1: 1-সোনালী ডিমের সৌভাগ্য */}
            <button
              onClick={() => setActiveTab('fortune')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                activeTab === 'fortune'
                  ? 'bg-[#4b5563]/90 text-white border border-gray-400'
                  : 'bg-[#374151]/60 text-gray-300 hover:text-white'
              }`}
            >
              1-সোনালী ডিমের সৌভাগ্য
            </button>

            {/* Tab 2: মোট রিচার্জের পরিমাণ ৫০০ with orange arrow */}
            <button
              onClick={() => setActiveTab('recharge')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md ${
                activeTab === 'recharge'
                  ? 'bg-[#4b5563]/90 text-white border border-gray-400'
                  : 'bg-[#374151]/60 text-gray-300 hover:text-white'
              }`}
            >
              <span>জমায় +১ হাতুড়ি (দিনে ৩)</span>
              <span className="text-amber-400 text-xs">▶</span>
            </button>
          </div>

          {/* Heading: 1-সোনালী ডিমের সৌভাগ্য */}
          <h2 className="text-base sm:text-lg font-black text-amber-300 tracking-wide font-bengali text-center drop-shadow-sm mb-1.5 z-10">
            1-সোনালী ডিমের সৌভাগ্য
          </h2>

          {/* Countdown Timer Row matching capture 2.PNG */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-amber-100 mb-3 z-10">
            <div className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center text-amber-400">
              <Clock className="w-3 h-3" />
            </div>
            <span className="font-bold text-amber-200 text-[11px] sm:text-xs">অবশিষ্ট সময়</span>

            {/* Time boxes */}
            <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
              <div className="flex flex-col items-center">
                <span className="px-1.5 py-0.5 bg-[#374151] rounded border border-gray-500 text-white">
                  {padZero(timeLeft.days)}
                </span>
                <span className="text-[8px] text-gray-400">দিন</span>
              </div>
              <span className="text-white pb-2">:</span>

              <div className="flex flex-col items-center">
                <span className="px-1.5 py-0.5 bg-[#374151] rounded border border-gray-500 text-white">
                  {padZero(timeLeft.hours)}
                </span>
                <span className="text-[8px] text-gray-400">ঘণ্টা</span>
              </div>
              <span className="text-white pb-2">:</span>

              <div className="flex flex-col items-center">
                <span className="px-1.5 py-0.5 bg-[#374151] rounded border border-gray-500 text-white">
                  {padZero(timeLeft.minutes)}
                </span>
                <span className="text-[8px] text-gray-400">মিনিট</span>
              </div>
              <span className="text-white pb-2">:</span>

              <div className="flex flex-col items-center">
                <span className="px-1.5 py-0.5 bg-[#374151] rounded border border-gray-500 text-white">
                  {padZero(timeLeft.seconds)}
                </span>
                <span className="text-[8px] text-gray-400">সেকেন্ড</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          <div className="w-full px-3 pb-1 text-center font-bengali" role="status">
            <span className="text-[11px] sm:text-xs font-bold text-yellow-200">বাকি হাতুড়ি: {eggsLeft}</span>
            {eggError && <p role="alert" className="mt-1 text-[11px] sm:text-xs font-bold text-red-300">{eggError}</p>}
          </div>
          {/* EGG STAGE: Golden Treasure Chest Background & 8 Golden Eggs (2-3-3) */}
          {/* ===================================================================== */}
          <div className="relative w-full py-1 flex flex-col items-center justify-center">
            
            {/* Treasure Chest Glow Graphic in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
              <div className="w-56 h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/40 via-yellow-600/10 to-transparent blur-xl" />
            </div>

            {/* Instruction tooltip */}
            {!hasSmashedAny && (
              <div className="mb-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold animate-pulse flex items-center gap-1 z-20">
                <span>👉 যেকোনো ১টি সোনার ডিম বেছে নিন ও ভাঙুন!</span>
              </div>
            )}

            {/* Row 1: 2 Golden Eggs */}
            <div className="flex items-center justify-center gap-6 sm:gap-8 relative z-10 mb-2">
              {[eggs[0], eggs[1]].map((egg) => (
                <EggComponent 
                  key={egg.id} 
                  egg={egg} 
                  isChosen={chosenEggId === egg.id}
                  onClick={() => handleSmashEgg(egg.id)} 
                />
              ))}
            </div>

            {/* Row 2: 3 Golden Eggs */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 relative z-10 mb-2">
              {[eggs[2], eggs[3], eggs[4]].map((egg) => (
                <EggComponent 
                  key={egg.id} 
                  egg={egg} 
                  isChosen={chosenEggId === egg.id}
                  onClick={() => handleSmashEgg(egg.id)} 
                />
              ))}
            </div>

            {/* Row 3: 3 Golden Eggs */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 relative z-10">
              {[eggs[5], eggs[6], eggs[7]].map((egg) => (
                <EggComponent 
                  key={egg.id} 
                  egg={egg} 
                  isChosen={chosenEggId === egg.id}
                  onClick={() => handleSmashEgg(egg.id)} 
                />
              ))}
            </div>

          </div>

          {/* ===================================================================== */}
          {/* CLAIM BUTTON & PROGRESS BAR (100% sample for 500 recharge) */}
          {/* ===================================================================== */}
          <div className="w-full max-w-[280px] sm:max-w-[300px] flex flex-col items-center mt-2.5 z-10">
            {/* Golden Action Button */}
            <button
              onClick={() => {
                if (!hasSmashedAny) {
                  // Pick random egg if user clicks button directly
                  const firstEgg = eggs[Math.floor(Math.random() * eggs.length)];
                  handleSmashEgg(firstEgg.id);
                } else if (wonPrize) {
                  setShowPrizeAlert(true);
                }
              }}
              disabled={isProcessing}
              className={`w-full py-2.5 rounded-full border-2 font-black text-sm sm:text-base font-bengali shadow-[0_4px_15px_rgba(234,179,8,0.5)] transition-all transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                hasSmashedAny
                  ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-700 text-white border-emerald-300 hover:from-emerald-300'
                  : 'bg-gradient-to-b from-[#fde047] via-[#eab308] to-[#ca8a04] hover:from-[#fef08a] hover:to-[#a16207] border-yellow-200 text-amber-950'
              }`}
            >
              <Sparkles className="w-4 h-4 text-inherit fill-current" />
              <span>{hasSmashedAny ? 'পুরস্কার সংগৃহীত (৳ ' + (wonPrize || 888) + ')' : 'দাবি করুন'}</span>
            </button>

            <span className="text-[10px] text-amber-200/80 font-bold mt-2 text-center">
              {language === 'bn' ? `বাকি হাতুড়ি: ${eggsLeft} · প্রতিদিন লগইনে ১টি, প্রতিটি অনুমোদিত জমায় +১ (দিনে সর্বোচ্চ ৩)` : `Hammers left: ${eggsLeft} · 1 per daily login, +1 per approved deposit (max 3/day)`}
            </span>
          </div>

          {/* ===================================================================== */}
          {/* BOTTOM MARQUEE: Golden Frame with Glowing Bulbs & Live Winners */}
          {/* ===================================================================== */}
          <div className="w-full mt-3 relative z-10">
            {/* Outer Marquee Box with Glowing Bulbs Border matching Capture.PNG */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#141b0b] to-[#0c1006] border-2 border-amber-400/80 p-2.5 pt-3 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
              
              {/* Glowing Bulbs Top & Bottom simulation */}
              <div className="absolute -top-1.5 left-6 right-6 flex justify-between pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047] border border-yellow-500 animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                ))}
              </div>

              <div className="absolute -bottom-1.5 left-6 right-6 flex justify-between pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047] border border-yellow-500 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>

              {/* Golden Trophy on top left with pink ribbon */}
              <div className="absolute -top-3 -left-2 w-10 h-10 flex items-center justify-center drop-shadow-md z-20">
                <span className="text-3xl">🏆</span>
              </div>

              {/* Winners 3-row List */}
              <div className="pl-6 space-y-1">
                <div className="text-xs py-1 text-yellow-100/90 font-bold">
                  {language === 'bn' ? 'পুরস্কার ৳২০ – ৳১৮,২২২ · সার্ভার বাছাই করে, সঙ্গে সঙ্গে ব্যালেন্সে' : 'Prize ৳20 – ৳18,222 · picked by the server, credited instantly'}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Prize Revealed Alert Overlay */}
        {showPrizeAlert && wonPrize && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/80 rounded-3xl animate-in zoom-in-95 backdrop-blur-xs">
            <div className="bg-gradient-to-b from-[#451a03] via-[#78350f] to-[#451a03] border-2 border-yellow-400 rounded-2xl p-5 text-center shadow-2xl flex flex-col items-center w-full max-w-[320px]">
              <span className="text-5xl animate-bounce">🎉</span>
              <h3 className="text-xl font-black text-yellow-300 mt-2 font-bengali">
                অভিনন্দন!
              </h3>
              <p className="text-xs text-amber-100 mt-1">
                আপনি সোনার ডিম ভেঙে জিতেছেন:
              </p>
              <div className="my-2.5 px-4 py-1.5 rounded-xl bg-black/40 border border-yellow-400/50">
                <p className="text-3xl font-black text-yellow-400 font-game drop-shadow-md">
                  ৳ {wonPrize}.00
                </p>
              </div>
              <p className="text-[11px] text-amber-200/80 mb-3">
                পুরস্কার আপনার প্রধান ব্যালেন্সে যোগ করা হবে।
              </p>
              <button
                onClick={handleCollectPrize}
                className="w-full py-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-amber-950 font-black text-sm cursor-pointer shadow-lg transform active:scale-95"
              >
                সংগ্রহ করুন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// =========================================================================
// Single Golden Egg with Ultra-Glossy 3D Finish & Rich Animations
// =========================================================================
interface EggComponentProps {
  egg: EggItem;
  isChosen: boolean;
  onClick: () => void;
}

const EggComponent: React.FC<EggComponentProps> = ({ egg, isChosen, onClick }) => {
  // Stagger animation timing per egg so each moves naturally
  const staggerDelay = `${((egg.id * 370) % 1800)}ms`;
  const glossDelay = `${((egg.id * 520) % 2500)}ms`;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col items-center cursor-pointer transition-all duration-300 group select-none
        ${egg.isSmashed ? 'scale-95' : 'hover:scale-115 active:scale-95'}
      `}
      title={egg.isSmashed ? `পুরস্কার: ৳ ${egg.prizeAmount}` : 'সোনার ডিম ভাঙতে ক্লিক করুন'}
    >
      {/* 1. Golden Radiating Sunburst & Pulsing Aura */}
      {!egg.isSmashed && (
        <div className="absolute -top-4 inset-x-0 bottom-1 flex items-center justify-center pointer-events-none">
          {/* Pulsing ambient amber glow */}
          <div 
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-400/35 to-amber-300/15 blur-lg group-hover:bg-yellow-400/60 transition-all duration-300 animate-egg-aura pointer-events-none" 
            style={{ animationDelay: staggerDelay }}
          />
          {/* Sharp radial starburst halo on hover */}
          <div className="absolute w-24 h-24 rounded-full bg-[radial-gradient(circle,_rgba(253,224,71,0.4)_0%,_rgba(245,158,11,0.15)_45%,_transparent_75%)] opacity-70 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 pointer-events-none" />
        </div>
      )}

      {/* 2. Golden Egg Body / Smashed State with TK Amount revealed */}
      <div className="relative z-10 flex flex-col items-center">
        {egg.isSmashed ? (
          <div className={`w-13 h-15 sm:w-15 sm:h-17 flex flex-col items-center justify-center animate-in zoom-in duration-300 ${isChosen ? 'ring-2 ring-yellow-400 rounded-xl bg-yellow-400/15 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : ''}`}>
            {/* Smashed Egg Shell & Cash Burst */}
            <div className="relative flex items-center justify-center">
              <span className="text-3xl sm:text-4xl animate-bounce filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">💥</span>
              <span className="absolute -top-1 -right-1 text-xs">✨</span>
            </div>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-black via-[#1c1917] to-black border border-yellow-400 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              <span className="text-[11px] sm:text-xs font-black text-yellow-300 font-game whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                ৳ {egg.prizeAmount}
              </span>
            </div>
            {isChosen && (
              <span className="text-[8px] font-black text-amber-300 mt-0.5 tracking-tight px-1.5 py-0.2 rounded-full bg-amber-950/80 border border-amber-500/50">
                আপনার পছন্দ
              </span>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* ULTRA-GLOSSY 3D GOLDEN EGG WITH LIGHT SWEEP, SPECULAR HIGHLIGHTS & WOBBLE */
          /* ========================================================================= */
          <div 
            className="w-13 h-15 sm:w-15 sm:h-17 relative flex items-center justify-center filter drop-shadow-[0_10px_16px_rgba(0,0,0,0.85)] animate-egg-wobble group-hover:animate-egg-wobble-fast"
            style={{ animationDelay: staggerDelay }}
          >
            <svg viewBox="0 0 100 125" className="w-full h-full overflow-visible">
              <defs>
                {/* 1. Base 3D Radial Gold Gradient (High contrast metallic 24K Gold) */}
                <radialGradient id={`eggGlow-${egg.id}`} cx="34%" cy="30%" r="72%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="10%" stopColor="#fff9c4" />
                  <stop offset="24%" stopColor="#fef08a" />
                  <stop offset="46%" stopColor="#facc15" />
                  <stop offset="68%" stopColor="#eab308" />
                  <stop offset="84%" stopColor="#b45309" />
                  <stop offset="96%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#451a03" />
                </radialGradient>

                {/* 2. Secondary 3D Ambient Bottom-Right Rim Light (bounce illumination) */}
                <linearGradient id={`eggRim-${egg.id}`} x1="100%" y1="100%" x2="40%" y2="40%">
                  <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ca8a04" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
                </linearGradient>

                {/* 3. Glass Specular Crescent Gradient */}
                <linearGradient id={`eggGlassGloss-${egg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#fffbeb" stopOpacity="0.75" />
                  <stop offset="70%" stopColor="#fef08a" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                </linearGradient>

                {/* 4. Moving Liquid Gold Shimmer Beam Gradient */}
                <linearGradient id={`eggSweepGrad-${egg.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.75" />
                  <stop offset="65%" stopColor="#ffffff" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* 5. Golden Egg Silhouette Clip Path */}
                <clipPath id={`eggClip-${egg.id}`}>
                  <path d="M 50,4 C 22,4 6,44 6,76 C 6,108 24,122 50,122 C 76,122 94,108 94,76 C 94,44 78,4 50,4 Z" />
                </clipPath>

                {/* 6. Soft Deep Shadow Filter */}
                <filter id={`eggShadow-${egg.id}`} x="-20%" y="-15%" width="140%" height="135%">
                  <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.75"/>
                </filter>
              </defs>

              {/* Base Egg 3D Shell */}
              <path
                d="M 50,4 C 22,4 6,44 6,76 C 6,108 24,122 50,122 C 76,122 94,108 94,76 C 94,44 78,4 50,4 Z"
                fill={`url(#eggGlow-${egg.id})`}
                filter={`url(#eggShadow-${egg.id})`}
                stroke="#ca8a04"
                strokeWidth="1.2"
              />

              {/* 3D Ambient Bottom-Right Rim Light */}
              <path
                d="M 50,4 C 22,4 6,44 6,76 C 6,108 24,122 50,122 C 76,122 94,108 94,76 C 94,44 78,4 50,4 Z"
                fill={`url(#eggRim-${egg.id})`}
                style={{ mixBlendMode: 'screen' }}
              />

              {/* Animated Glossy Sheen Sweep (Liquid Gold Mirror Reflection) */}
              <g clipPath={`url(#eggClip-${egg.id})`}>
                <rect
                  x="-80"
                  y="-20"
                  width="70"
                  height="160"
                  fill={`url(#eggSweepGrad-${egg.id})`}
                  className="animate-egg-gloss pointer-events-none"
                  style={{ animationDelay: glossDelay }}
                />
              </g>

              {/* Glossy Specular Crescent Pill Highlight (Upper-Left Reflection) */}
              <path
                d="M 37,14 C 27,24 19,42 21,64 C 22,68 18,66 17,60 C 15,41 23,21 34,11 C 36,9 38,11 37,14 Z"
                fill={`url(#eggGlassGloss-${egg.id})`}
                style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}
              />

              {/* Apex Specular Hotspot (Top Gloss Highlight) */}
              <ellipse
                cx="46"
                cy="14"
                rx="9"
                ry="4"
                transform="rotate(-22 46 14)"
                fill="#ffffff"
                opacity="0.85"
                style={{ filter: 'blur(0.6px)' }}
              />

              {/* Secondary delicate glassy rim highlight on left edge */}
              <path
                d="M 32,18 C 24,30 18,50 20,68"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
                opacity="0.75"
              />

              {/* Bottom Subtle Golden Glow Reflex */}
              <ellipse
                cx="50"
                cy="114"
                rx="24"
                ry="4"
                fill="#fde047"
                opacity="0.4"
                style={{ filter: 'blur(1.5px)' }}
              />
            </svg>

            {/* Sparkle Star 1: Upper-left hot specular twinkle */}
            <div 
              className="absolute top-1 left-2 pointer-events-none animate-egg-sparkle"
              style={{ animationDelay: staggerDelay }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white text-yellow-200 filter drop-shadow-[0_0_4px_#fff]">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
              </svg>
            </div>

            {/* Sparkle Star 2: Upper-right golden sparkle */}
            <div 
              className="absolute top-3 right-2 pointer-events-none animate-egg-sparkle"
              style={{ animationDelay: `${((egg.id * 600) % 2000)}ms` }}
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-yellow-200 text-amber-300 filter drop-shadow-[0_0_3px_#fde047]">
                <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
              </svg>
            </div>
          </div>
        )}

        {/* 3D Red Velvet Pedestal Platform matching Royal Casino Stage */}
        <div className="relative -mt-2 z-20 flex flex-col items-center pointer-events-none">
          {/* Top golden lip of pedestal */}
          <div className="w-10 sm:w-12 h-1 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-600 rounded-t-xs shadow-[0_1px_3px_rgba(0,0,0,0.8)] border-b border-amber-700" />
          {/* Top red velvet cushion */}
          <div className="w-10 sm:w-12 h-2.5 bg-gradient-to-r from-[#b91c1c] via-[#ef4444] to-[#991b1b] shadow-inner flex items-center justify-center overflow-hidden">
            {/* Velvet center shimmer sheen */}
            <div className="w-5 h-full bg-white/20 blur-xs" />
          </div>
          {/* Golden bevel divider */}
          <div className="w-12 sm:w-14 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border-t border-yellow-200 shadow-sm" />
          {/* Pedestal Base with deep rich wood/velvet depth */}
          <div className="w-13 sm:w-15 h-2 bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#450a0a] rounded-b-md border-b-2 border-black/80 shadow-[0_4px_10px_rgba(0,0,0,0.9)]" />
        </div>
      </div>
    </div>
  );
};

