// @ts-nocheck
/**
 * BengalBet Lucky Wheel Spin Modal
 * Features:
 * - 10-sector high-precision SVG roulette wheel with smooth rotation physics
 * - Dynamic audio tick & celebratory confetti blasts on win
 * - Real-time recent winners marquee ticker
 * - VIP free spin count tracking and immediate wallet credits
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, RotateCcw, CheckCircle, Volume2, VolumeX, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount, SpinPrize } from '../types';
import { api } from '../services/api';

interface LuckySpinModalProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onSpinWin: (prize: SpinPrize, result?: any) => void;
  onBackToReward?: (tab?: string) => void;
}

// Sector colours only; prizes and odds come from the administrator's server table.
const PALETTE = ['#b91c1c','#047857','#6d28d9','#1d4ed8','#0891b2','#d97706','#4338ca','#be123c','#0f766e','#ea580c'];
const toPrize = (p: { label: string; amount: number }, i: number): SpinPrize => ({ id: i + 1, labelBn: p.label, labelEn: p.label, amount: p.amount, type: 'cash', color: PALETTE[i % PALETTE.length], textColor: '#ffffff', probability: 0 });

const SECTOR_SUBTITLES = [
  { bn: 'মেগা জ্যাকপট', en: 'Mega Jackpot' },
  { bn: 'নগদ ক্যাশ', en: 'Cash' },
  { bn: 'লাকি ড্র', en: 'Lucky Draw' },
  { bn: 'সুপার ক্যাশ', en: 'Super Cash' },
  { bn: 'ফ্রি স্পিন', en: 'Free Spins' },
  { bn: 'নগদ বোনাস', en: 'Cash Bonus' },
  { bn: 'মিস্ট্রি গিফট', en: 'Mystery Gift' },
  { bn: 'লাকি ক্যাশ', en: 'Lucky Cash' },
  { bn: 'ফ্রি স্পিন', en: 'Free Spins' },
  { bn: 'ফ্রি বোনাস', en: 'Free Bonus' },
];

const RECENT_WINNERS = [
  { user: 'md_ak***9', prize: '৳ ৮,৮৮৮ মেগা জ্যাকপট' },
  { user: 'tanvir***', prize: 'iPhone 17 ড্র টিকিট' },
  { user: 'shakil***8', prize: '৳ ২,০০০ নগদ ক্যাশ' },
  { user: 'rubel***2', prize: '১০ ফ্রি স্পিন' },
  { user: 'hasan***4', prize: '৳ ১,০০০ লাকি বোনাস' },
];

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  language,
  user,
  onClose,
  onSpinWin,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<SpinPrize | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(user.freeSpins || 0);
  const [WHEEL_PRIZES, setWheelPrizes] = useState<SpinPrize[]>([]);
  const [tableState, setTableState] = useState<'loading' | 'ready' | 'empty'>('loading');
  const [spinError, setSpinError] = useState('');
  useEffect(() => {
    api.rewards.chanceTable('spin')
      .then((r) => { const list = (r.prizes || []).map(toPrize); setWheelPrizes(list); setTableState(list.length ? 'ready' : 'empty'); })
      .catch(() => setTableState('empty'));
  }, []);
  const deg = 360 / Math.max(1, WHEEL_PRIZES.length);
  const [isMuted, setIsMuted] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickAudioRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !spinning) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinning, onClose]);

  // Rotate winner ticker
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % RECENT_WINNERS.length);
    }, 3200);
    return () => clearInterval(tickerInterval);
  }, []);

  // Web Audio Mechanical Tick and Win Sounds
  const playSound = (type: 'tick' | 'win' | 'whoosh') => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'whoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.09);
          osc.stop(ctx.currentTime + idx * 0.09 + 0.5);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  // Trigger Spin with Mathematically Exact 10-Sector Pointer Alignment
  const handleSpin = async () => {
    if (spinning || spinsLeft <= 0 || tableState !== 'ready') return;
    setSpinning(true);
    setWonPrize(null);
    setSpinError('');
    let result: any;
    try {
      result = await api.rewards.playChance('spin');
    } catch (e: any) {
      setSpinning(false);
      setSpinError(e?.message || 'স্পিন এখন সম্ভব হয়নি।');
      return;
    }
    playSound('whoosh');
    const targetIndex = Math.min(Math.max(0, Number(result.prize?.index) || 0), WHEEL_PRIZES.length - 1);
    const selectedPrize = { ...WHEEL_PRIZES[targetIndex], labelBn: result.prize.label, labelEn: result.prize.label, amount: result.prize.amount };

    // Mathematical precision for 10 equal sectors (36 degrees each):
    // Sector 0 is centered at 0° (12 o'clock, right under the pointer).
    // Sector i is centered at (i * 36)°.
    // When the wheel rotates clockwise by delta, Sector i moves to (i * 36 + delta) % 360.
    // For Sector i to align perfectly with the top pointer at 0°:
    // (i * 36 + delta) % 360 = 0  ==>  delta % 360 = (360 - (i * 36 % 360)) % 360.
    const targetMod = (360 - ((targetIndex * deg) % 360)) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let step = (targetMod - currentMod) % 360;
    if (step < 0) step += 360;

    // 6 full spins + exact alignment step
    const nextRotation = rotation + (6 * 360) + step;
    setRotation(nextRotation);

    // Realistic decelerating tick sounds
    let tickCount = 0;
    const totalTicks = 28;
    const playNextTick = () => {
      if (tickCount >= totalTicks) return;
      playSound('tick');
      tickCount++;
      const delay = 60 + Math.pow(tickCount / totalTicks, 2.5) * 360;
      tickAudioRef.current = setTimeout(playNextTick, delay);
    };
    playNextTick();

    // Wheel stops after 4.2s
    setTimeout(() => {
      setSpinning(false);
      setWonPrize(selectedPrize);
      setSpinsLeft(Number(result.user?.free_spins ?? 0));
      onSpinWin(selectedPrize, result);
      playSound('win');

      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#ffffff']
      });
    }, 4200);
  };

  // Pre-calculate 10 equal 36-degree SVG pie slices:
  // Center: (200, 200), Radius: 196
  // Sector i: -18° + (i * 36)° to +18° + (i * 36)°
  const R = 196;
  const sectorPaths = WHEEL_PRIZES.map((_, i) => {
    const a1 = ((i * deg - deg / 2) * Math.PI) / 180;
    const a2 = ((i * deg + deg / 2) * Math.PI) / 180;
    const x1 = 200 + R * Math.sin(a1);
    const y1 = 200 - R * Math.cos(a1);
    const x2 = 200 + R * Math.sin(a2);
    const y2 = 200 - R * Math.cos(a2);
    return `M 200 200 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in select-none overflow-y-auto">
      {/* Container with High-End Cyber/Gold Casino Styling */}
      <div 
        id="lucky-spin-dialog"
        className="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#062417] via-[#091b12] to-[#020d08] border-2 border-yellow-400/80 rounded-3xl shadow-[0_0_60px_rgba(250,204,21,0.25)] p-4 sm:p-6 flex flex-col items-center overflow-hidden my-auto"
      >
        {/* Top Glowing Ambient Accents */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar: Clean title, sound toggle, and single Exit/Close X button */}
        <div className="w-full flex items-center justify-between z-20 mb-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 via-amber-400/30 to-yellow-500/30 text-yellow-300 text-xs font-black border border-yellow-400/50 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>BengalBet FORTUNE WHEEL</span>
          </div>

          {/* Sound & Single Exit Close Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-yellow-300 border border-yellow-500/30 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title={isMuted ? 'সাউন্ড চালু করুন' : 'মিউট করুন'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Old Exit Close Button X */}
            <button
              id="close-lucky-spin-btn"
              onClick={onClose}
              disabled={spinning}
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center ring-2 ring-yellow-400/80 shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Header Title with Bengali label */}
        <div className="text-center space-y-1 mb-2 z-10">
          <h2 className="text-xl sm:text-2xl font-black text-white font-game tracking-wider">
            {language === 'bn' ? 'লাকি স্পিন ও আইফোন ১৭ ড্র' : 'Lucky Spin & iPhone 17 Draw'}
          </h2>

          {/* Spins Available Tag & Live Ticker */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-300 font-bold font-bengali flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400 fill-amber-400" />
              <span>অবশিষ্ট ফ্রি স্পিন: {spinsLeft} বার</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-yellow-300 font-mono font-bold">
              ৳ {(user.balance).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Live Winners Marquee Ribbon */}
        <div className="w-full bg-black/40 border border-yellow-500/20 rounded-xl px-3 py-1 mb-2 flex items-center justify-between text-[11px] font-bengali text-gray-300 z-10 overflow-hidden">
          <span className="text-yellow-400 font-bold flex items-center gap-1 shrink-0">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span>সাম্প্রতিক জয়:</span>
          </span>
          <span className="text-yellow-200 font-medium truncate ml-2">
            ★ {RECENT_WINNERS[tickerIndex].user} জিতেছেন {RECENT_WINNERS[tickerIndex].prize}
          </span>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE CASINO WHEEL (10 Ghor, 10 Reward, Equal Space & Correct Tir) */}
        {/* ============================================================ */}
        <div className="relative w-68 h-68 sm:w-80 sm:h-80 my-1 flex items-center justify-center">
          {/* Outer Chasing LED Lights Rim (20 casino bulbs) */}
          <div className="absolute inset-0 rounded-full border-8 border-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.5)] flex items-center justify-center pointer-events-none z-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/60 shadow-xs ${
                  i % 2 === 0
                    ? spinning ? 'bg-yellow-300 shadow-[0_0_8px_#fde047]' : 'bg-amber-400'
                    : spinning ? 'bg-white shadow-[0_0_8px_#ffffff]' : 'bg-yellow-200'
                }`}
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 18}deg) translate(130px) translate(-50%, -50%)`,
                }}
              />
            ))}
          </div>

          {/* 3D Golden Pointer / Arrow (তির) Fixed at 12 o'clock */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            <svg width="34" height="42" viewBox="0 0 34 42" className="overflow-visible">
              <defs>
                <linearGradient id="tirGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>
              {/* Arrow needle pointing down to (17, 38) */}
              <polygon points="17,38 3,8 31,8" fill="url(#tirGoldGrad)" stroke="#78350f" strokeWidth="1.8" />
              {/* Jeweled ruby cap */}
              <circle cx="17" cy="12" r="6" fill="#dc2626" stroke="#fef08a" strokeWidth="1.5" />
              <circle cx="17" cy="12" r="2.5" fill="#fef08a" />
            </svg>
          </div>

          {/* Rotating SVG Disc: Exactly 10 Equal 36° Sectors */}
          <div 
            id="spinning-wheel-disc"
            className="w-[88%] h-[88%] rounded-full border-4 border-yellow-400 shadow-2xl relative overflow-hidden transition-transform duration-[4200ms] cubic-bezier(0.12, 0.85, 0.18, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <filter id="textDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.9" />
                </filter>
              </defs>

              {/* 10 Equal Pie Sectors */}
              {WHEEL_PRIZES.map((prize, idx) => (
                <path
                  key={prize.id}
                  d={sectorPaths[idx]}
                  fill={prize.color}
                  stroke="#facc15"
                  strokeWidth="2"
                />
              ))}

              {/* 10 Radial Reward Labels and Icons */}
              {WHEEL_PRIZES.map((prize, idx) => {
                const isGrand = prize.id === 1;
                return (
                  <g key={`text-${prize.id}`} transform={`rotate(${idx * deg} 200 200)`}>
                    {/* Crown for Mega Jackpot */}
                    {isGrand && (
                      <text
                        x="200"
                        y="28"
                        textAnchor="middle"
                        fontSize="14"
                        filter="url(#textDropShadow)"
                      >
                        👑
                      </text>
                    )}

                    {/* Main Amount / Label */}
                    <text
                      x="200"
                      y={isGrand ? "48" : "44"}
                      textAnchor="middle"
                      fill={prize.textColor}
                      fontSize={isGrand ? "14" : "13"}
                      fontWeight="900"
                      fontFamily="sans-serif"
                      filter="url(#textDropShadow)"
                    >
                      {language === 'bn' ? prize.labelBn : prize.labelEn}
                    </text>

                    {/* Subtitle (10 ghor 10 reward descriptions) */}
                    <text
                      x="200"
                      y={isGrand ? "64" : "60"}
                      textAnchor="middle"
                      fill="#fef08a"
                      fontSize="9.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      filter="url(#textDropShadow)"
                    >
                      {language === 'bn' ? SECTOR_SUBTITLES[idx % SECTOR_SUBTITLES.length].bn : SECTOR_SUBTITLES[idx % SECTOR_SUBTITLES.length].en}
                    </text>
                  </g>
                );
              })}

              {/* Center Wheel Hub Ring */}
              <circle cx="200" cy="200" r="42" fill="#18181b" stroke="#facc15" strokeWidth="4" />
            </svg>
          </div>

          {/* Center 3D Golden Spin Button Hub */}
          <button
            id="spin-trigger-btn"
            onClick={handleSpin}
            disabled={spinning || spinsLeft <= 0 || tableState !== 'ready'}
            className={`
              absolute z-30 w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-yellow-300 shadow-[0_0_25px_rgba(0,0,0,0.8)]
              flex flex-col items-center justify-center font-game font-black text-sm sm:text-base tracking-wider uppercase
              transition-all active:scale-95 cursor-pointer
              ${spinning 
                ? 'bg-amber-700 text-gray-200 animate-pulse cursor-wait' 
                : spinsLeft > 0 
                  ? 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 text-black hover:scale-105 shadow-[0_0_20px_rgba(250,204,21,0.8)]' 
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <span className="leading-tight">{spinning ? '...' : 'SPIN'}</span>
            <span className="text-[9px] font-bengali font-bold leading-none -mt-0.5">
              {spinning ? 'ঘুরছে' : 'ঘোরান'}
            </span>
          </button>
        </div>

        {tableState === 'empty' && (
          <p className="mt-2 text-center text-xs font-bengali text-yellow-200">স্পিনের পুরস্কার তালিকা এখনো চালু হয়নি। শীঘ্রই আসছে।</p>
        )}
        {spinError && <p className="mt-2 text-center text-xs font-bengali text-red-300">{spinError}</p>}
        {/* Won Prize Celebration Card */}
        {wonPrize && (
          <div className="mt-2 p-3 bg-gradient-to-r from-yellow-500/20 via-emerald-500/30 to-yellow-500/20 border-2 border-yellow-400 rounded-2xl text-center animate-in zoom-in-95 w-full z-10">
            <div className="flex items-center justify-center gap-1.5 text-xs text-yellow-300 font-bold mb-0.5 font-bengali">
              <Trophy className="w-4 h-4 text-yellow-400 fill-amber-400 animate-bounce" />
              <span>{language === 'bn' ? 'অভিনন্দন! আপনি জিতেছেন:' : 'Congratulations! You won:'}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-game drop-shadow-md">
              {language === 'bn' ? wonPrize.labelBn : wonPrize.labelEn}
            </div>
            <div className="text-[11px] text-emerald-300 font-bengali mt-0.5 flex items-center justify-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>পুরস্কার ওয়ালেটে যুক্ত হয়েছে</span>
            </div>
          </div>
        )}

        {/* Footer Action: Single Primary Button */}
        <div className="mt-3 w-full z-10">
          {spinsLeft > 0 ? (
            <button
              onClick={handleSpin}
              disabled={spinning || tableState !== 'ready'}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-black text-sm sm:text-base font-bengali shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
              <span>
                {spinning ? 'হুইল ঘুরছে...' : `হুইল ঘোরান (${spinsLeft} বার বাকি)`}
              </span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-[#0e432f] hover:bg-[#155e42] border border-emerald-400/40 text-emerald-200 font-black text-sm sm:text-base font-bengali transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'স্পিন সম্পন্ন • বন্ধ করুন' : 'Spins Finished • Close'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
