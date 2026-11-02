// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { X, Clock, Sparkles, Share2, ArrowRight, Trophy, Users, Award, Gift, Gem, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../types';

interface SuperValueRewardModalProps {
  isOpen: boolean;
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onOpenShareModal: () => void;
  onBonusClaimed?: (amount: number, message: string) => void;
}

const STORAGE_KEY_UNLOCKED = 'bengalbet_super_value_unlocked';

export const SuperValueRewardModal: React.FC<SuperValueRewardModalProps> = ({
  isOpen,
  language: _language,
  user: _user,
  onClose,
  onOpenShareModal,
  onBonusClaimed
}) => {
  // Check if previously unlocked from localStorage
  const isAlreadyUnlocked = () => {
    try {
      return localStorage.getItem(STORAGE_KEY_UNLOCKED) === 'true';
    } catch {
      return false;
    }
  };

  // Modal Stages:
  // 1: 'chest-unopened' -> Initial unlock step (shows ONE time on first interaction)
  // 2: 'congratulations' -> celebratory reward pop when unlocked
  // 3: 'dashboard' -> Opened condition (shown for next times)
  const [stage, setStage] = useState<'chest-unopened' | 'congratulations' | 'dashboard'>(() => {
    return isAlreadyUnlocked() ? 'dashboard' : 'chest-unopened';
  });

  const [activeTab, setActiveTab] = useState<'tasks' | 'description' | 'details'>('tasks');

  // Balance & Targets
  const currentAmount = 278.74;
  const targetAmount = 300.00;
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  const progressPercent = Math.min(100, (currentAmount / targetAmount) * 100);

  // Sync state whenever modal opens: if already unlocked, ensure it shows in opened condition
  useEffect(() => {
    if (isOpen && isAlreadyUnlocked()) {
      setStage('dashboard');
    }
  }, [isOpen]);

  // Countdown timer: 02 days : 23 hours : 39 minutes : 43 seconds
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 23,
    minutes: 39,
    seconds: 43
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  // Handler for one-time unlock action
  const handleOpenChest = () => {
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED, 'true');
    } catch {}

    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.5 }
    });
    setStage('congratulations');
    if (onBonusClaimed) {
      onBonusClaimed(278.74, 'সুপার ভ্যালু রিওয়ার্ড: আপনি ৳ ২৭৮.৭৪ ফ্রি বোনাস পেয়েছেন!');
    }
  };

  const handleProceedToTasks = () => {
    try {
      localStorage.setItem(STORAGE_KEY_UNLOCKED, 'true');
    } catch {}
    setStage('dashboard');
  };

  // Optional reset for testing the one-time unlock flow again
  const handleResetForTesting = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem(STORAGE_KEY_UNLOCKED);
    } catch {}
    setStage('chest-unopened');
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in select-none">
      
      {/* ========================================================================= */}
      {/* STAGE 1: RADIANT OPEN TREASURE CHEST (Matching Screenshot_2026.08.30_20.42.31.756.png) */}
      {/* ========================================================================= */}
      {stage === 'chest-unopened' && (
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] my-auto flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          {/* Floating Gold Stars & Coin Particles in background */}
          <div className="absolute -inset-10 pointer-events-none overflow-hidden -z-10">
            {/* Top Stars with Glowing Halos */}
            <div className="absolute top-2 left-6 text-amber-200 text-3xl animate-pulse filter drop-shadow-[0_0_14px_rgba(251,191,36,0.95)]">★</div>
            <div className="absolute top-8 right-12 text-yellow-300 text-4xl animate-bounce duration-1000 filter drop-shadow-[0_0_16px_rgba(253,224,71,0.95)]">★</div>
            <div className="absolute top-20 left-10 text-amber-300 text-2xl animate-ping duration-1000">✦</div>
            <div className="absolute top-24 right-5 text-yellow-200 text-xl animate-pulse">✦</div>
            
            {/* Floating Gold Coins */}
            <div className="absolute top-14 left-2 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-100 shadow-[0_0_14px_rgba(245,158,11,0.85)] rotate-12 transform -translate-y-2"></div>
            <div className="absolute top-18 right-2 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-100 shadow-[0_0_14px_rgba(245,158,11,0.85)] -rotate-12 transform translate-y-1"></div>
            <div className="absolute top-28 left-4 w-4 h-4 rounded-full bg-amber-400 border border-yellow-100 shadow-md"></div>
            <div className="absolute top-32 right-4 w-5 h-5 rounded-full bg-amber-400 border border-yellow-100 shadow-md"></div>
          </div>

          {/* Card Container */}
          <div className="relative w-full rounded-[34px] bg-gradient-to-b from-[#fffbf4] via-[#fdf5ea] to-[#fbeadc] border-[2.5px] border-[#fcd34d] shadow-[0_0_50px_rgba(245,158,11,0.35)] pt-6 pb-8 px-4 sm:px-6 flex flex-col items-center">
            
            {/* Top Arched Ribbon Banner with Side Wings */}
            <div className="relative w-[108%] -mt-9 mb-1 flex items-center justify-center">
              
              {/* Left Ribbon Wing Fold */}
              <div className="relative -mr-3 z-10">
                <svg width="42" height="60" viewBox="0 0 42 60" fill="none" className="drop-shadow-md">
                  <path d="M40 8 C30 14 10 18 2 34 C-4 44 8 52 14 56 C24 48 28 32 40 28 Z" fill="url(#leftRibbonGrad)" stroke="#fef08a" strokeWidth="1.5" />
                  <path d="M40 28 C34 32 30 40 40 46 Z" fill="#9a3412" opacity="0.7" />
                  <defs>
                    <linearGradient id="leftRibbonGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#c2410c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Main Arched Center Banner */}
              <div className="relative z-20 flex-1 px-4 py-2.5 bg-gradient-to-r from-[#ea580c] via-[#ff7a00] to-[#ea580c] border-2 border-yellow-200 rounded-[22px] shadow-[0_8px_20px_rgba(234,88,12,0.55)] flex items-center justify-center">
                {/* Top golden highlight line */}
                <div className="absolute top-1 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-yellow-200/80 to-transparent rounded-full pointer-events-none" />
                <h2 className="text-base sm:text-[17px] font-black text-white tracking-wide font-bengali drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] whitespace-nowrap">
                  BengalBet সুপার ভ্যালু রিওয়ার্ড
                </h2>
              </div>

              {/* Right Ribbon Wing Fold */}
              <div className="relative -ml-3 z-10">
                <svg width="42" height="60" viewBox="0 0 42 60" fill="none" className="drop-shadow-md">
                  <path d="M2 8 C12 14 32 18 40 34 C46 44 34 52 28 56 C18 48 14 32 2 28 Z" fill="url(#rightRibbonGrad)" stroke="#fef08a" strokeWidth="1.5" />
                  <path d="M2 28 C8 32 12 40 2 46 Z" fill="#9a3412" opacity="0.7" />
                  <defs>
                    <linearGradient id="rightRibbonGrad" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#c2410c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

            </div>

            {/* Glowing Sunburst & 3D Rich Open Treasure Chest Art */}
            <div className="relative w-full py-3 sm:py-4 flex flex-col items-center justify-center">
              
              {/* Radial warm glow background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-amber-400/40 via-yellow-400/20 to-transparent blur-xl animate-pulse" />
              </div>

              {/* Clickable 3D Overflowing Treasure Chest SVG Graphic */}
              <div 
                className="relative z-10 w-full max-w-[270px] sm:max-w-[290px] h-[220px] sm:h-[240px] flex items-center justify-center cursor-pointer group transform hover:scale-105 active:scale-95 transition-transform duration-300" 
                onClick={handleOpenChest}
                title="ফ্রি বোনাস দাবি করতে ক্লিক করুন"
              >
                <svg viewBox="0 0 320 280" className="w-full h-full drop-shadow-[0_18px_25px_rgba(0,0,0,0.35)]">
                  <defs>
                    {/* Gold Metal Gradient */}
                    <linearGradient id="goldBright" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="30%" stopColor="#fde047" />
                      <stop offset="70%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>

                    {/* Dark Gold Gradient */}
                    <linearGradient id="goldDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#ca8a04" />
                      <stop offset="100%" stopColor="#854d0e" />
                    </linearGradient>

                    {/* Mahogany Wood Gradient */}
                    <linearGradient id="mahoganyWood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b91c1c" />
                      <stop offset="50%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>

                    {/* Chest Interior Red Satin */}
                    <radialGradient id="chestInterior" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="60%" stopColor="#991b1b" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </radialGradient>

                    {/* Gem Gradients */}
                    <linearGradient id="pinkGem" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbcfe8" />
                      <stop offset="40%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#be123c" />
                    </linearGradient>
                    <linearGradient id="blueGem" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#bae6fd" />
                      <stop offset="50%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>
                    <linearGradient id="purpleGem" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#e9d5ff" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6b21a8" />
                    </linearGradient>
                    <linearGradient id="pearlWhite" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#f1f5f9" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                  </defs>

                  {/* 1. BACK OPEN LID */}
                  <g id="chestLid">
                    <path d="M 60,110 C 60,40 260,40 260,110 L 250,115 C 250,55 70,55 70,115 Z" fill="url(#chestInterior)" stroke="url(#goldBright)" strokeWidth="4" />
                    <path d="M 80,110 C 80,60 120,60 120,110" stroke="url(#goldBright)" strokeWidth="6" fill="none" />
                    <path d="M 200,110 C 200,60 240,60 240,110" stroke="url(#goldBright)" strokeWidth="6" fill="none" />
                    <rect x="148" y="44" width="24" height="18" rx="4" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <circle cx="160" cy="53" r="3" fill="#854d0e" />
                  </g>

                  {/* 2. GLOW & LIGHT BURST FROM INSIDE CHEST */}
                  <ellipse cx="160" cy="120" rx="90" ry="40" fill="#fef08a" opacity="0.65" className="animate-pulse" />

                  {/* 3. GOLDEN TROPHY CUP INSIDE CHEST */}
                  <g id="trophyCup" transform="translate(162, 75) scale(0.95)">
                    <path d="M 20,25 Q 20,50 40,55 L 40,65 L 28,68 L 28,75 L 52,75 L 52,68 L 40,65 Q 60,50 60,25 Z" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="2" />
                    <path d="M 20,30 Q 8,30 8,42 Q 8,50 22,48" fill="none" stroke="url(#goldBright)" strokeWidth="3" />
                    <path d="M 60,30 Q 72,30 72,42 Q 72,50 58,48" fill="none" stroke="url(#goldBright)" strokeWidth="3" />
                    <path d="M 40,34 L 42,39 L 47,39 L 43,42 L 45,47 L 40,44 L 35,47 L 37,42 L 33,39 L 38,39 Z" fill="#ffffff" />
                  </g>

                  {/* 4. HEAPS OF GOLD COINS & GEMS PILED HIGH */}
                  <g id="coinPileBack">
                    <circle cx="110" cy="115" r="14" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <circle cx="132" cy="108" r="15" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <circle cx="155" cy="104" r="16" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <circle cx="178" cy="108" r="15" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <circle cx="205" cy="115" r="14" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <circle cx="225" cy="122" r="13" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                  </g>

                  {/* Sparkly Gemstones */}
                  <polygon points="120,105 132,95 144,105 132,120" fill="url(#pinkGem)" stroke="#fff" strokeWidth="1.5" />
                  <polygon points="190,102 200,94 212,104 202,116" fill="url(#purpleGem)" stroke="#fff" strokeWidth="1.5" />
                  <polygon points="145,115 155,106 168,116 157,128" fill="url(#blueGem)" stroke="#fff" strokeWidth="1.5" />

                  {/* 5. CHEST FRONT BASE */}
                  <g id="chestFrontBase">
                    <path d="M 50,125 L 270,125 L 255,200 L 65,200 Z" fill="url(#mahoganyWood)" stroke="#7f1d1d" strokeWidth="3" />
                    <line x1="53" y1="150" x2="267" y2="150" stroke="#7f1d1d" strokeWidth="2.5" />
                    <line x1="58" y1="175" x2="262" y2="175" stroke="#7f1d1d" strokeWidth="2.5" />
                    <rect x="46" y="120" width="228" height="12" rx="4" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="2" />

                    <rect x="95" y="120" width="16" height="80" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <circle cx="103" cy="138" r="2.5" fill="#713f12" />
                    <circle cx="103" cy="162" r="2.5" fill="#713f12" />
                    <circle cx="103" cy="186" r="2.5" fill="#713f12" />

                    <rect x="145" y="124" width="30" height="38" rx="6" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="2" />
                    <circle cx="160" cy="138" r="6" fill="#713f12" />
                    <rect x="157.5" y="138" width="5" height="12" fill="#713f12" />

                    <rect x="209" y="120" width="16" height="80" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <circle cx="217" cy="138" r="2.5" fill="#713f12" />
                    <circle cx="217" cy="162" r="2.5" fill="#713f12" />
                    <circle cx="217" cy="186" r="2.5" fill="#713f12" />

                    <polygon points="50,122 75,122 50,147" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1" />
                    <polygon points="270,122 245,122 270,147" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1" />
                    <polygon points="65,200 85,200 65,180" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1" />
                    <polygon points="255,200 235,200 255,180" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1" />
                  </g>

                  {/* 6. OVERFLOWING COIN SPILLAGE OVER THE FRONT */}
                  <g id="coinSpillFront">
                    <ellipse cx="80" cy="135" rx="12" ry="7" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="115" cy="132" rx="14" ry="8" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="138" cy="130" rx="15" ry="8.5" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="182" cy="130" rx="15" ry="8.5" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="205" cy="133" rx="14" ry="8" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="238" cy="136" rx="13" ry="7" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                  </g>

                  {/* 7. DRAPING PEARL NECKLACE */}
                  <g id="pearlNecklace">
                    <circle cx="140" cy="136" r="4.5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="146" cy="144" r="4.5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="152" cy="152" r="4.8" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="160" cy="158" r="5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="168" cy="153" r="4.8" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="174" cy="145" r="4.5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="180" cy="137" r="4.5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                    <circle cx="184" cy="130" r="4.5" fill="url(#pearlWhite)" stroke="#94a3b8" strokeWidth="0.8" />
                  </g>

                  {/* 8. GOLD COINS HEAP ON THE GROUND IN FRONT */}
                  <g id="groundCoinsHeap">
                    <ellipse cx="80" cy="205" rx="20" ry="10" fill="url(#goldDark)" stroke="#854d0e" strokeWidth="1.5" />
                    <ellipse cx="115" cy="208" rx="24" ry="11" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <ellipse cx="160" cy="212" rx="28" ry="12" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <ellipse cx="205" cy="209" rx="25" ry="11" fill="url(#goldBright)" stroke="#854d0e" strokeWidth="1.5" />
                    <ellipse cx="240" cy="205" rx="20" ry="10" fill="url(#goldDark)" stroke="#854d0e" strokeWidth="1.5" />

                    <ellipse cx="100" cy="212" rx="16" ry="8" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="135" cy="216" rx="18" ry="8.5" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="175" cy="217" rx="18" ry="8.5" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />
                    <ellipse cx="215" cy="213" rx="17" ry="8" fill="url(#goldBright)" stroke="#a16207" strokeWidth="1.5" />

                    <polygon points="65,208 73,200 81,208 73,218" fill="url(#pinkGem)" stroke="#fff" strokeWidth="1" />
                    <polygon points="245,210 253,202 261,210 253,220" fill="url(#purpleGem)" stroke="#fff" strokeWidth="1" />
                  </g>

                  {/* 9. SHINING STARS & SPARKLE BURSTS */}
                  <g transform="translate(150, 90) scale(1.4)">
                    <path d="M 10,0 L 12,7 L 19,7 L 14,11 L 16,18 L 10,14 L 4,18 L 6,11 L 1,7 L 8,7 Z" fill="#ffffff" className="animate-pulse" />
                  </g>
                  <g transform="translate(75, 80) scale(0.9)">
                    <path d="M 10,0 L 12,7 L 19,7 L 14,11 L 16,18 L 10,14 L 4,18 L 6,11 L 1,7 L 8,7 Z" fill="#fde047" />
                  </g>
                  <g transform="translate(230, 85) scale(0.9)">
                    <path d="M 10,0 L 12,7 L 19,7 L 14,11 L 16,18 L 10,14 L 4,18 L 6,11 L 1,7 L 8,7 Z" fill="#fde047" />
                  </g>
                </svg>
              </div>

            </div>

            {/* Glowing Big Red-Orange Capsule Button: "ফ্রি বোনাস পাওয়া" */}
            <div className="w-full flex justify-center mt-2">
              <button
                onClick={handleOpenChest}
                className="relative w-full max-w-[290px] sm:max-w-[310px] py-3.5 sm:py-4 rounded-full bg-gradient-to-b from-[#ff5722] via-[#ff3d00] to-[#e64a19] hover:from-[#f4511e] hover:to-[#d84315] border-2 border-yellow-200 text-white font-black text-base sm:text-lg font-bengali shadow-[0_8px_30px_rgba(255,87,34,0.65)] ring-4 ring-orange-400/40 transform hover:scale-102 active:scale-95 transition-all cursor-pointer flex items-center justify-center overflow-hidden group gap-2"
              >
                {/* Top Glass Highlight Reflection */}
                <div className="absolute top-0.5 left-4 right-4 h-3 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
                
                <Sparkles className="w-5 h-5 text-yellow-200 animate-spin duration-3000" />
                <span className="relative z-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] tracking-wide">
                  ফ্রি বোনাস পাওয়া
                </span>
                <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
              </button>
            </div>

          </div>

          {/* Bottom Floating Circular Close X */}
          <button
            onClick={onClose}
            className="mt-4 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl border-2 border-gray-300 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.8]" />
          </button>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: CHEST OPENED / CONGRATULATIONS */}
      {/* ========================================================================= */}
      {stage === 'congratulations' && (
        <div className="relative w-full max-w-[360px] sm:max-w-[390px] my-auto flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          <div className="relative w-full rounded-[34px] bg-gradient-to-b from-[#fffbf4] via-[#fdf5ea] to-[#fbeadc] border-[2.5px] border-[#fcd34d] shadow-[0_0_50px_rgba(245,158,11,0.35)] pt-6 pb-7 px-4 sm:px-6 flex flex-col items-center overflow-hidden">
            
            {/* Top Crown & Opened Treasure Chest overflowing with Gold & Trophies */}
            <div className="relative w-full flex flex-col items-center justify-center mb-2">
              <div className="relative w-44 h-32 flex items-center justify-center">
                {/* Glowing Crown Trophy Composite */}
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_10px_25px_rgba(245,158,11,0.5)] border-2 border-yellow-100 transform rotate-3 hover:rotate-0 transition-transform">
                  <Trophy className="w-14 h-14 text-yellow-900 drop-shadow-md" />
                </div>
                <div className="absolute -top-2 text-3xl animate-bounce">
                  👑
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white text-xs font-black shadow-md">
                  <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                </div>
              </div>
            </div>

            {/* Heading: অভিনন্দন! */}
            <div className="relative -mt-2 mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#ea580c] tracking-wide font-bengali drop-shadow-sm text-center flex items-center justify-center gap-2">
                <span>অভিনন্দন!</span>
                <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
              </h2>
            </div>

            {/* Subtitle: ফ্রি পুরস্কার জিতেছি */}
            <p className="text-base font-bold text-gray-800 font-bengali text-center mt-1 flex items-center justify-center gap-1">
              <Gift className="w-4 h-4 text-red-500" />
              <span>ফ্রি পুরস্কার জিতেছি</span>
            </p>

            {/* Amount: ৳ 278.74 */}
            <div className="my-2 text-center">
              <span className="text-4xl sm:text-5xl font-black text-[#dc2626] font-mono tracking-tight drop-shadow-sm">
                ৳ 278<span className="text-3xl sm:text-4xl">.74</span>
              </span>
            </div>

            {/* Note: একবার ৳ 300 পর্যন্ত জমা হলে দাবি করা যাবে */}
            <p className="text-xs font-semibold text-gray-600 text-center font-bengali px-2 mb-6">
              একবার ৳ 300 পর্যন্ত জমা হলে দাবি করা যাবে
            </p>

            {/* Red Pill Button: বোনাস দাবি করার জন্য কাজ সম্পূর্ণ করুন */}
            <button
              onClick={handleProceedToTasks}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ef4444] via-[#f97316] to-[#ef4444] hover:from-[#dc2626] hover:to-[#ea580c] border-2 border-yellow-200 text-white font-black text-sm sm:text-base font-bengali shadow-[0_8px_25px_rgba(239,68,68,0.6)] transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-yellow-200" />
              <span>বোনাস দাবি করার জন্য কাজ সম্পূর্ণ করুন</span>
              <ArrowRight className="w-4 h-4 text-white stroke-[3]" />
            </button>

          </div>

          {/* Bottom Floating Circular Close X */}
          <button
            onClick={onClose}
            className="mt-4 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-2xl border-2 border-gray-300 hover:scale-110 transition-transform cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.8]" />
          </button>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: FULL SUPER VALUE REWARD DASHBOARD (OPENED CONDITION) */}
      {/* ========================================================================= */}
      {stage === 'dashboard' && (
        <div className="relative w-full max-w-[390px] sm:max-w-[430px] my-auto flex flex-col items-center animate-in zoom-in-95 duration-300">
          
          {/* Top Right Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-3 right-0 sm:-right-2 z-30 w-8 h-8 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-xl border-2 border-gray-300 hover:scale-110 transition-transform cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Main Card Container (Opened Condition) */}
          <div className="relative w-full rounded-[28px] bg-gradient-to-b from-[#ffeedb] via-[#fffdf9] to-[#fed7aa] border-2 border-amber-300 shadow-[0_0_60px_rgba(249,115,22,0.4)] pt-5 pb-4 px-3 sm:px-4 flex flex-col items-center overflow-hidden">
            
            {/* Top Status & Brand Header */}
            <div className="w-full flex items-center justify-between gap-2 mb-1 px-1">
              <h1 className="text-lg sm:text-xl font-black text-[#ea580c] tracking-wide font-bengali drop-shadow-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>BengalBet সুপার ভ্যালু রিওয়ার্ড</span>
              </h1>

              {/* Opened Condition Status Badge */}
              <div className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-black font-bengali flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>উন্মুক্ত ও সক্রিয়</span>
              </div>
            </div>

            {/* Premium 3D Opened Treasure Chest & Trophy Hero in Opened Condition */}
            <div className="relative w-full flex flex-col items-center justify-center mt-1 mb-2">
              <div className="w-40 h-28 relative flex items-center justify-center">
                {/* SVG Opened Chest Mini Illustration */}
                <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]">
                  <defs>
                    <linearGradient id="miniGold" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#a16207" />
                    </linearGradient>
                    <linearGradient id="miniWood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b91c1c" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <radialGradient id="miniGlow" cx="50%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                  </defs>

                  {/* Open Back Lid */}
                  <path d="M 30,55 C 30,20 130,20 130,55 L 125,58 C 125,28 35,28 35,58 Z" fill="#991b1b" stroke="url(#miniGold)" strokeWidth="2.5" />
                  <ellipse cx="80" cy="55" rx="45" ry="18" fill="url(#miniGlow)" opacity="0.8" className="animate-pulse" />

                  {/* Golden Trophy Inside Open Chest */}
                  <g transform="translate(68, 25) scale(0.6)">
                    <path d="M 12,15 Q 12,32 25,35 L 25,42 L 18,44 L 18,48 L 32,48 L 32,44 L 25,42 Q 38,32 38,15 Z" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1.5" />
                    <path d="M 12,18 Q 5,18 5,26 Q 5,30 14,29" fill="none" stroke="url(#miniGold)" strokeWidth="2" />
                    <path d="M 38,18 Q 45,18 45,26 Q 45,30 36,29" fill="none" stroke="url(#miniGold)" strokeWidth="2" />
                  </g>

                  {/* Chest Front Base */}
                  <path d="M 25,60 L 135,60 L 128,100 L 32,100 Z" fill="url(#miniWood)" stroke="#7f1d1d" strokeWidth="2" />
                  <rect x="23" y="57" width="114" height="6" rx="2" fill="url(#miniGold)" />
                  <rect x="48" y="57" width="8" height="42" fill="url(#miniGold)" />
                  <rect x="104" y="57" width="8" height="42" fill="url(#miniGold)" />
                  <rect x="74" y="60" width="12" height="18" rx="2" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1" />
                  <circle cx="80" cy="67" r="2" fill="#713f12" />

                  {/* Heaps of Overflowing Gold Coins & Gems */}
                  <circle cx="58" cy="58" r="7" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1" />
                  <circle cx="72" cy="55" r="8" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1" />
                  <circle cx="88" cy="55" r="8" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1" />
                  <circle cx="102" cy="58" r="7" fill="url(#miniGold)" stroke="#854d0e" strokeWidth="1" />
                  <polygon points="62,52 68,46 74,52 68,58" fill="#f43f5e" stroke="#fff" strokeWidth="1" />
                  <polygon points="90,51 96,45 102,51 96,57" fill="#0ea5e9" stroke="#fff" strokeWidth="1" />
                </svg>

                <div className="absolute -top-1 right-8 text-lg animate-pulse">✨</div>
                <div className="absolute top-0 left-8 text-sm animate-bounce">👑</div>
              </div>

              {/* Pedestal with Claim Banner */}
              <div className="relative -mt-1 px-5 py-1 rounded-xl bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] text-white font-black text-xs font-bengali shadow-md border border-yellow-200 flex items-center justify-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-yellow-200" />
                <span>৳ ২৭৮.৭৪ আনলক ও জমা হয়েছে</span>
              </div>
            </div>

            {/* Inner Dashboard Card (Cream Background) */}
            <div className="w-full rounded-2xl bg-[#fffaf0] border border-amber-200/80 shadow-md p-3 sm:p-4 flex flex-col items-center">
              
              {/* Countdown Ribbon: ⏱ 02 দিন 23:39:43 শেষ */}
              <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#ea580c] via-[#dc2626] to-[#ea580c] text-white text-[11px] sm:text-xs font-bold font-mono shadow flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-yellow-200" />
                <span>
                  {padZero(timeLeft.days)} দিন {padZero(timeLeft.hours)}:{padZero(timeLeft.minutes)}:{padZero(timeLeft.seconds)} শেষ
                </span>
              </div>

              {/* Balance Row with Speech Bubble Badge */}
              <div className="relative w-full flex items-center justify-center gap-2 my-1">
                {/* Big Amount: ৳ 278.74 */}
                <div className="text-3xl sm:text-4xl font-black text-[#dc2626] font-mono tracking-tight">
                  ৳ {currentAmount.toFixed(2)}
                </div>

                {/* Speech Bubble Badge: শীঘ্রই দাবি করা হবে */}
                <div className="relative px-2.5 py-1 rounded-lg bg-[#ea580c] text-white text-[10px] sm:text-[11px] font-black font-bengali shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-200" />
                  <span>শীঘ্রই দাবি করা হবে</span>
                  <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-[#ea580c] rotate-45" />
                </div>
              </div>

              {/* Orange Progress Bar (278.74 / 300 = ~92.9%) */}
              <div className="w-full h-4 rounded-full bg-gray-200 border border-gray-300 mt-2 relative overflow-hidden shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#ea580c] to-[#f97316] transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Subtext: দাবির জন্য ৳ 21.26 মাত্র দূরে */}
              <p className="text-xs font-bold text-gray-700 font-bengali mt-1.5 mb-2.5 text-center">
                দাবির জন্য <span className="text-[#dc2626] font-mono font-bold">৳ {remainingAmount.toFixed(2)}</span> মাত্র দূরে
              </p>

              {/* Pulsing Action Button: "বন্ধুদের আমন্ত্রণ জানিয়ে দাবি দ্রুত করুন" */}
              <button
                onClick={() => {
                  onOpenShareModal();
                }}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#ea580c] hover:from-[#c2410c] hover:to-[#ea580c] text-white font-black text-xs sm:text-sm font-bengali shadow-[0_4px_16px_rgba(234,88,12,0.5)] border-2 border-yellow-200 transform active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Share2 className="w-3.5 h-3.5 text-white" />
                </div>
                <span>বন্ধুদের আমন্ত্রণ জানিয়ে দাবি দ্রুত করুন</span>
                <span className="text-lg animate-bounce pointer-events-none">👉</span>
              </button>

            </div>

            {/* 3 BOTTOM TABS: কাজ (Tasks) | বর্ণনা (Description) | কাজের বিস্তারিত (Details) */}
            <div className="w-full mt-3 rounded-2xl bg-[#ffedd5]/80 border border-amber-300 p-1 flex flex-col">
              
              {/* Tab Navigation Header */}
              <div className="w-full grid grid-cols-3 gap-1">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center font-bengali flex items-center justify-center gap-1 ${
                    activeTab === 'tasks'
                      ? 'bg-[#ffffff] text-[#ea580c] shadow-sm'
                      : 'text-gray-700 hover:text-[#ea580c]'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>কাজ</span>
                </button>

                <button
                  onClick={() => setActiveTab('description')}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center font-bengali flex items-center justify-center gap-1 ${
                    activeTab === 'description'
                      ? 'bg-[#ffffff] text-[#ea580c] shadow-sm'
                      : 'text-gray-700 hover:text-[#ea580c]'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>বর্ণনা</span>
                </button>

                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer text-center font-bengali flex items-center justify-center gap-1 ${
                    activeTab === 'details'
                      ? 'bg-[#ffffff] text-[#ea580c] shadow-sm'
                      : 'text-gray-700 hover:text-[#ea580c]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>কাজের বিস্তারিত</span>
                </button>
              </div>

              {/* Tab Body */}
              <div className="w-full p-2 mt-1">
                
                {/* TAB 1: কাজ (Tasks) */}
                {activeTab === 'tasks' && (
                  <div className="w-full space-y-2 animate-in fade-in duration-200">
                    
                    {/* Task Card 1: 5 Qualified Friends */}
                    <div className="w-full p-2.5 rounded-xl bg-[#fffaf0] border border-amber-200 flex items-center justify-between gap-2 shadow-xs hover:border-amber-400 transition-colors">
                      <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 border border-yellow-200 shadow-sm">
                        <Users className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>

                      <div className="flex-1 text-left">
                        <h4 className="text-[11px] sm:text-xs font-black text-gray-900 font-bengali leading-tight">
                          নির্দিষ্ট অর্জন - বন্ধুদের নিবন্ধনে আমন্ত্রণ
                        </h4>
                        <p className="text-[10px] text-gray-600 font-bengali leading-tight mt-0.5">
                          খেলোয়াড় প্রাথমিক পয়েন্ট দাবি করার পর, <span className="text-[#ea580c] font-bold">5 যোগ্য বন্ধু</span> আমন্ত্রণ জানিয়ে 1 র‍্যান্ডম পুরস্কার দাবি করতে পারেন।
                        </p>
                      </div>

                      <button
                        onClick={onOpenShareModal}
                        className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white flex items-center justify-center shadow-md border border-yellow-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="আমন্ত্রণ জানান"
                      >
                        <Share2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Task Card 2: Every 1 Qualified Friend */}
                    <div className="w-full p-2.5 rounded-xl bg-[#fffaf0] border border-amber-200 flex items-center justify-between gap-2 shadow-xs hover:border-amber-400 transition-colors">
                      <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-amber-300 border border-yellow-200 shadow-sm">
                        <Users className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>

                      <div className="flex-1 text-left">
                        <h4 className="text-[11px] sm:text-xs font-black text-gray-900 font-bengali leading-tight">
                          নির্দিষ্ট অর্জন - বন্ধুদের নিবন্ধনে আমন্ত্রণ
                        </h4>
                        <p className="text-[10px] text-gray-600 font-bengali leading-tight mt-0.5">
                          খেলোয়াড় প্রাথমিক পয়েন্ট দাবি করার পর, প্রতি <span className="text-[#ea580c] font-bold">1 যোগ্য বন্ধু</span> আমন্ত্রণ জানালে, খেলোয়াড় 1 র‍্যান্ডম পুরস্কার দাবি করতে পারেন।
                        </p>
                      </div>

                      <button
                        onClick={onOpenShareModal}
                        className="w-9 h-9 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white flex items-center justify-center shadow-md border border-yellow-200 cursor-pointer transition-all hover:scale-105 active:scale-95"
                        title="আমন্ত্রণ জানান"
                      >
                        <Share2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>

                  </div>
                )}

                {/* TAB 2: বর্ণনা (Description / Rules) */}
                {activeTab === 'description' && (
                  <div className="w-full text-[11px] text-gray-800 space-y-1.5 font-bengali text-left leading-relaxed bg-[#fffaf0] p-2.5 rounded-xl border border-amber-200 animate-in fade-in duration-200">
                    <p>১. সফলভাবে নিবন্ধনের পর নতুন সদস্যরা বিনামূল্যে কুপন পেতে পারেন।</p>
                    <p>২. সংশ্লিষ্ট লটারির সুযোগ পেতে প্রাসঙ্গিক কাজগুলি সম্পন্ন করুন।</p>
                    <p>৩. প্রতিটি কুপন উত্তোলনের আগে অবশ্যই <span className="text-[#ea580c] font-bold">৳৩০০</span> পৌঁছাতে হবে।</p>
                    <p>৪. সফলভাবে পুরস্কার দাবি করার পরে, কুপনটি অবৈধ হয়ে যাবে।</p>
                    <p>৫. প্রতিটি কুপন ৩ দিনের জন্য বৈধ এবং মেয়াদ শেষ হওয়ার পরে অবৈধ হয়ে যাবে।</p>
                    <p>৬. এই ইভেন্টে শুধুমাত্র অ্যাপ লগইনের মাধ্যমে অংশগ্রহণ করা যাবে।</p>
                    <p>৭. মিনিমাম ১ রাউন্ড বেট ধরার পর বোনাস উত্তোলন করতে পারবেন।</p>
                    <p>৮. <span className="font-bold text-[#ea580c]">BengalBet</span> এই ইভেন্টের চূড়ান্ত ব্যাখ্যার অধিকার সংরক্ষণ করে।</p>
                  </div>
                )}

                {/* TAB 3: কাজের বিস্তারিত (Details) */}
                {activeTab === 'details' && (
                  <div className="w-full overflow-hidden rounded-xl border border-amber-200 bg-[#fffaf0] animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 bg-[#ffedd5] p-2 text-xs font-bold text-[#9a3412] font-bengali text-center border-b border-amber-200">
                      <span>শর্ত</span>
                      <span>যোগ করা পরিমাণ</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5 text-xs text-gray-800 font-bengali text-center items-center">
                      <span className="font-medium text-left pl-2">প্রাথমিক পয়েন্ট দাবি করুন</span>
                      <span className="font-black text-emerald-600 font-mono">+ 278.74</span>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Discreet Testing Switch to re-test One-Time Unlock flow */}
            <div className="w-full flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={handleResetForTesting}
                className="text-[10px] text-amber-700/60 hover:text-amber-900 underline transition-colors cursor-pointer"
                title="Reset to test the 1-time unlock screen again"
              >
                {_language === 'bn' ? '🔄 আবার ১-বার আনলক দেখতে রিসেট করুন' : '🔄 Reset to view 1-time unlock screen'}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
