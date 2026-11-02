// @ts-nocheck
/**
 * BengalBet Red Envelope (Red Packet) Rain Modal
 * Features:
 * - Animated falling envelopes canvas with dynamic speed and scaling
 * - 5-second countdown intro with instant grab interactivity
 * - Bursting packet animations with celebratory audio and balance credits
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, Sparkles, Trophy, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { Language, UserAccount } from '../types';

interface RedEnvelopeModalProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onClaimCash?: (amount: number, message: string) => void;
  /** Server already credited the packet; parent only refreshes the wallet. */
  onSettled?: (result: any) => void;
  onBackToReward?: (tab?: string) => void;
  onOpenSpin?: () => void;
  onOpenGoldenEgg?: () => void;
  onOpenSuperValueReward?: () => void;
}

interface FallingEnvelope {
  id: number;
  leftPercent: number;
  durationSec: number;
  delaySec: number;
  scale: number;
  rotationDeg: number;
}

export const RedEnvelopeModal: React.FC<RedEnvelopeModalProps> = ({
  language,
  user,
  onClose,
  onSettled,
}) => {
  const [round, setRound] = useState<{ open: boolean; remaining: number; claimed: boolean; schedule?: string } | null>(null);
  const [packetError, setPacketError] = useState('');
  useEffect(() => {
    api.rewards.packetRound().then(setRound).catch(() => setRound({ open: false, remaining: 0, claimed: false }));
  }, []);
  // Flow phases:
  // 'countdown' (5s countdown with skip) -> 'raining' (rain of packets) -> 'zooming' & 'bursting' (bursts open) -> 'revealed' (Step 2: prize display)
  const [phase, setPhase] = useState<'countdown' | 'raining' | 'zooming' | 'bursting' | 'revealed'>('countdown');
  const [countdown, setCountdown] = useState<number>(5);
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [displayAmount, setDisplayAmount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [caughtCount, setCaughtCount] = useState<number>(0);
  const isSelectingRef = useRef<boolean>(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard Escape listener to close cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Synthesized Web Audio Sound Effects
  const playSound = (type: 'beep' | 'start' | 'swoosh' | 'burst' | 'win', freqMultiplier = 1) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 * freqMultiplier, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'start') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
        });
      } else if (type === 'swoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === 'burst') {
        // Crisp explosive pop sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  // Phase 1: 5-Second Countdown Logic
  useEffect(() => {
    if (phase !== 'countdown') return;

    setCountdown(5);
    playSound('beep', 1);

    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          playSound('start');
          setPhase('raining');
          return 0;
        }
        playSound('beep', (6 - prev) * 0.15 + 1);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [phase]);

  // Rain Envelopes Generator - High density & smooth falling tracks
  const [envelopes, setEnvelopes] = useState<FallingEnvelope[]>([]);

  useEffect(() => {
    if (phase !== 'raining') return;

    const generated: FallingEnvelope[] = [];
    const totalEnvelopes = 42;

    for (let i = 0; i < totalEnvelopes; i++) {
      const leftPercent = 3 + (i % 14) * 6.8 + (Math.random() * 4 - 2);
      const durationSec = 2.4 + Math.random() * 1.6;
      const delaySec = (i * 0.22) + Math.random() * 0.35;
      const scale = 0.85 + Math.random() * 0.35;
      const rotationDeg = Math.floor(Math.random() * 32) - 16;

      generated.push({
        id: i + 1,
        leftPercent: Math.min(93, Math.max(3, leftPercent)),
        durationSec,
        delaySec,
        scale,
        rotationDeg,
      });
    }

    setEnvelopes(generated);
  }, [phase]);

  // INSTANT TAP / CLICK HANDLER - NO LONG CLICK, NO DELAY
  const handleSelectEnvelope = async () => {
    if (phase !== 'raining' || isSelectingRef.current) return;
    isSelectingRef.current = true;
    setPacketError('');
    // The server picks the prize and credits it; nothing is decided in the browser
    let result: any;
    try {
      result = await api.rewards.playChance('red_envelope');
    } catch (e: any) {
      isSelectingRef.current = false;
      setPacketError(e?.message || 'রেড প্যাকেট এখন নেওয়া যায়নি।');
      return;
    }
    const prize = Number(result?.prize?.amount) || 0;
    setRound(prev => prev ? { ...prev, open: false, claimed: true } : prev);
    onSettled?.(result);

    setPhase('zooming');
    playSound('swoosh');
    setRewardAmount(prize);
    setCaughtCount(prev => prev + 1);

    // Fast, crisp animation sequence:
    // 1. Zooms up to center (220ms)
    setTimeout(() => {
      // 2. "tiket faita jabe" (burst animation ~ 220ms)
      setPhase('bursting');
      playSound('burst');

      // Confetti burst
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.45 },
        colors: ['#ef4444', '#f59e0b', '#fbbf24', '#ffffff', '#e11d48', '#10b981']
      });

      // Directly reveals prize (Step 2 of the flow)
      setTimeout(() => {
        setPhase('revealed');
        isSelectingRef.current = false;
        playSound('win');

        // Fast number count-up animation
        let current = 0;
        const step = Math.max(1, Math.floor(prize / 18));
        const countUpInterval = setInterval(() => {
          current += step;
          if (current >= prize) {
            current = prize;
            clearInterval(countUpInterval);
          }
          setDisplayAmount(current);
        }, 16);

      }, 220);
    }, 220);
  };

  // Skip countdown directly to rain
  const handleSkipCountdown = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(0);
    playSound('start');
    setPhase('raining');
  };

  const handleCloseModal = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in select-none overflow-y-auto overflow-x-hidden touch-manipulation"
      style={{ WebkitUserSelect: 'none', touchAction: 'manipulation' }}
    >
      {/* Scoped CSS animations for 60fps rain and burst */}
      <style>{`
        @keyframes rainFallFast {
          0% {
            transform: translateY(-130px) rotate(var(--rot-deg));
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            transform: translateY(106vh) rotate(calc(var(--rot-deg) + 22deg));
            opacity: 0;
          }
        }
        @keyframes sunburstSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tearFlapLeftFast {
          0% { transform: rotate(0deg) translate(0, 0); opacity: 1; }
          100% { transform: rotate(-60deg) translate(-95px, -70px); opacity: 0; }
        }
        @keyframes tearFlapRightFast {
          0% { transform: rotate(0deg) translate(0, 0); opacity: 1; }
          100% { transform: rotate(60deg) translate(95px, -70px); opacity: 0; }
        }
        @keyframes shockwavePulseFast {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(3.2); opacity: 0; }
        }
      `}</style>

      {/* Background Ambience: Deep Asian Crimson Palace & Golden Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/60 via-red-950/90 to-black" />

      {/* Floating Gold Lanterns / Festive Bokeh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-10 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      </div>

      {/* Top Floating Control Bar: Clean title, sound, and single Exit/Close X button */}
      <div className="fixed top-3 inset-x-3 sm:inset-x-6 z-50 flex items-center justify-between max-w-5xl mx-auto pointer-events-auto">
        {/* Left Title Badge */}
        <div className="flex items-center gap-2 bg-black/65 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/40 shadow-lg">
          <Flame className="w-4 h-4 text-yellow-400 fill-amber-400 animate-bounce" />
          <span className="text-xs sm:text-sm font-black font-bengali text-yellow-300 tracking-wide">
            {language === 'bn' ? 'লাল খামের বৃষ্টি • BengalBet' : 'Red Packet Rain • BengalBet'}
          </span>
          {caughtCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold">
              {caughtCount}টি ধৃত
            </span>
          )}
        </div>

        {/* Right Controls: Sound & Close X */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full bg-black/70 hover:bg-black/90 text-yellow-400 border border-yellow-500/40 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
            title={isMuted ? 'সাউন্ড চালু করুন' : 'মিউট করুন'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Clean old exit/close button */}
          <button
            id="close-red-packet-rain-btn"
            onClick={handleCloseModal}
            className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg ring-2 ring-yellow-400/80 transition-transform active:scale-95 cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STEP 1: COUNTDOWN 5s (কাউন্টডাউন ৫ সেকেন্ড) */}
      {/* ============================================================ */}
      {phase === 'countdown' && (
        <div className="relative z-30 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-lg uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>RED PACKET RAIN EVENT</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-bengali drop-shadow-md mb-2">
            {language === 'bn' ? 'লাল খামের বৃষ্টি শুরু হচ্ছে!' : 'Red Packet Rain Starting!'}
          </h1>
          <p className="text-xs sm:text-sm text-yellow-200/90 font-bengali max-w-xs mb-6">
            {language === 'bn' 
              ? 'যেকোনো একটি উড়ন্ত লাল খাম স্পর্শ করে সাথে সাথে নগদ বোনাস জিতুন!' 
              : 'Tap any falling red envelope to burst and win instant cash!'}
          </p>
          <p className="text-[11px] sm:text-xs text-yellow-100/80 font-bengali max-w-xs mb-4" role="status">
            {round === null ? 'রাউন্ডের তথ্য দেখা হচ্ছে…'
              : round.claimed ? `এই রাউন্ডের প্যাকেট আপনি নিয়েছেন। রাউন্ডের সময়: ${round.schedule || ''}`
              : round.open ? `রাউন্ড চলছে — আর ${round.remaining}টি প্যাকেট বাকি।`
              : `রেড প্যাকেট বৃষ্টির সময়: ${round.schedule || ''}`}
          </p>

          {/* Glowing 3D Countdown Circle */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-yellow-400 bg-gradient-to-tr from-red-800 via-rose-700 to-amber-600 flex items-center justify-center shadow-[0_0_50px_rgba(250,204,21,0.6)] mb-6 animate-pulse">
            <div className="text-7xl sm:text-8xl font-black text-yellow-300 font-game drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              {countdown}
            </div>
            <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-black/80 border border-yellow-400/60 text-[11px] font-bold text-yellow-300 font-bengali">
              সেকেন্ড বাকি
            </div>
          </div>

          {/* Quick Skip Button */}
          <button
            onClick={handleSkipCountdown}
            className="px-6 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs sm:text-sm font-bengali shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            {language === 'bn' ? 'সরাসরি শুরু করুন ›' : 'Skip & Start Now ›'}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: RAIN OF RED PACKETS (লাল খামের বৃষ্টি) */}
      {/* ============================================================ */}
      {phase === 'raining' && (
        <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden select-none">
          {/* Instruction Ribbon */}
          <div className="fixed top-18 inset-x-0 z-40 flex justify-center pointer-events-none">
            <div className="px-4 py-1.5 rounded-full bg-black/80 border-2 border-yellow-400/80 text-yellow-300 text-xs sm:text-sm font-black font-bengali shadow-2xl flex items-center gap-2 animate-pulse">
              <span>👇 যেকোনো একটি লাল খাম স্পর্শ করুন (এক ক্লিকে খুলুন)</span>
            </div>
          </div>
          {packetError && (
            <div className="fixed top-28 inset-x-0 z-40 flex justify-center pointer-events-none" role="alert">
              <div className="px-4 py-2 rounded-xl bg-black/90 border border-red-400 text-red-200 text-xs sm:text-sm font-bold font-bengali max-w-sm text-center">{packetError}</div>
            </div>
          )}

          {/* 42 Falling Envelopes with Premium Luxury Hongbao Aesthetic */}
          {envelopes.map((env) => (
            <div
              key={env.id}
              onClick={handleSelectEnvelope}
              onTouchStart={handleSelectEnvelope}
              style={{
                position: 'absolute',
                top: 0,
                left: `${env.leftPercent}%`,
                animation: `rainFallFast ${env.durationSec}s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
                animationDelay: `${env.delaySec}s`,
                ['--rot-deg' as string]: `${env.rotationDeg}deg`,
                cursor: 'pointer',
                zIndex: 25,
                transformOrigin: 'center center',
                touchAction: 'manipulation'
              }}
              className="group/envelope p-2 cursor-pointer transition-transform duration-100 active:scale-95 pointer-events-auto"
            >
              {/* Premium Luxury Red Envelope Graphic (No cheap middle circle) */}
              <div 
                style={{ transform: `scale(${env.scale})` }}
                className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-gradient-to-b from-red-600 via-rose-700 to-red-900 border-2 border-yellow-400 shadow-[0_8px_20px_rgba(0,0,0,0.7)] flex flex-col items-center justify-between p-1.5 group-hover/envelope:ring-4 group-hover/envelope:ring-yellow-300 group-hover/envelope:shadow-[0_0_30px_rgba(253,224,71,0.9)] transition-all pointer-events-auto overflow-hidden"
              >
                {/* Gold foil perimeter inset */}
                <div className="absolute inset-1 rounded-lg border border-yellow-400/50 pointer-events-none" />

                {/* Curved Envelope Flap with Gold Latch */}
                <div className="relative w-full h-5 rounded-b-xl bg-gradient-to-b from-red-500 via-rose-600 to-red-700 border-b-2 border-yellow-300 shadow-md flex items-center justify-center">
                  <div className="w-4 h-1.5 rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 shadow-xs border border-yellow-100" />
                </div>

                {/* Vertical Luxury Gold Foil Ribbon (Clean premium motif, NO middle circle) */}
                <div className="relative flex flex-col items-center justify-center my-auto">
                  <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-sm" />
                  <div className="absolute w-4 h-4 rotate-45 bg-gradient-to-tr from-yellow-400 to-amber-300 border border-yellow-100 shadow-xs flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-800" />
                  </div>
                </div>

                {/* Bottom Gold Foil Typography */}
                <div className="relative w-full flex justify-between items-center px-1 text-[9px] text-yellow-300 font-extrabold tracking-wider">
                  <span>৳</span>
                  <span className="text-[8px] text-yellow-200/90 font-mono font-bold">BengalBet</span>
                  <span>৳</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* ZOOMING GO UP -> TIKET FAITA JABE -> REVEALED (Step 2 Prize) */}
      {/* ============================================================ */}
      {(phase === 'zooming' || phase === 'bursting' || phase === 'revealed') && (
        <div className="relative z-30 flex flex-col items-center justify-center w-full min-h-screen py-16 px-4 pointer-events-auto">
          {/* Rotating Sunburst Light Rays */}
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[750px] sm:h-[750px] pointer-events-none opacity-70"
            style={{ animation: 'sunburstSpin 25s linear infinite' }}
          >
            <div className="w-full h-full bg-[radial-gradient(circle,_rgba(251,191,36,0.35)_0%,_rgba(239,68,68,0.15)_45%,_transparent_70%)]" />
          </div>

          {/* ZOOMING GO UP STAGE (envelope floats and zooms upward into center focus) */}
          {phase === 'zooming' && (
            <div 
              className="relative flex flex-col items-center animate-in zoom-in-50 duration-200 ease-out"
              style={{ transform: 'translateY(-15px)' }}
            >
              <div className="absolute inset-0 bg-yellow-400/30 rounded-3xl blur-2xl animate-pulse" />

              <div className="relative w-56 h-80 sm:w-64 sm:h-92 rounded-3xl bg-gradient-to-b from-red-600 via-rose-700 to-red-950 border-4 border-yellow-400 shadow-[0_0_50px_rgba(239,68,68,0.9)] flex flex-col items-center justify-between p-5 ring-4 ring-amber-300/50 overflow-hidden">
                {/* Gold foil inset border */}
                <div className="absolute inset-2 rounded-2xl border-2 border-yellow-400/60 pointer-events-none" />

                {/* Flap with gold trim */}
                <div className="relative w-full h-16 rounded-b-[36px] bg-gradient-to-b from-red-500 to-rose-700 border-b-2 border-yellow-300 shadow-md flex items-center justify-center">
                  <div className="w-10 h-3 rounded-full bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 shadow border border-white/60" />
                </div>

                {/* Vertical Luxury Gold Foil Ribbon (NO middle circle!) */}
                <div className="relative flex flex-col items-center justify-center my-auto">
                  <div className="w-3 h-24 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-500 shadow-lg" />
                  <div className="absolute w-12 h-12 rotate-45 bg-gradient-to-tr from-yellow-400 via-amber-300 to-yellow-500 border-2 border-yellow-100 shadow-md flex items-center justify-center">
                    <span className="text-sm font-black text-red-900 font-game -rotate-45">
                      BDT
                    </span>
                  </div>
                </div>

                <div className="relative text-center">
                  <span className="text-base font-black font-bengali text-yellow-300 tracking-wider">
                    BengalBet লাকি খাম
                  </span>
                  <div className="text-xs text-white/90 font-bengali animate-pulse mt-0.5">
                    খামটি খুলছে...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BURSTING STAGE: "tiket faita jabe" (burst / exploding tear animation) */}
          {phase === 'bursting' && (
            <div className="relative flex flex-col items-center">
              {/* Expanding Shockwave ring */}
              <div 
                className="absolute top-1/2 left-1/2 rounded-full border-8 border-yellow-300 bg-amber-400/30 blur-xs pointer-events-none"
                style={{ animation: 'shockwavePulseFast 0.25s ease-out forwards', width: '320px', height: '320px' }}
              />

              {/* Bursting Envelope halves tearing apart */}
              <div className="relative w-64 h-80 flex items-center justify-center">
                <div 
                  className="absolute w-32 h-80 rounded-l-3xl bg-gradient-to-b from-red-600 to-red-950 border-y-4 border-l-4 border-yellow-400 shadow-2xl"
                  style={{ animation: 'tearFlapLeftFast 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
                />

                <div 
                  className="absolute w-32 h-80 rounded-r-3xl bg-gradient-to-b from-red-600 to-red-950 border-y-4 border-r-4 border-yellow-400 shadow-2xl"
                  style={{ animation: 'tearFlapRightFast 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards' }}
                />

                {/* Flying Golden Sparks & Coins */}
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-2 border-white font-black text-black text-[11px] flex items-center justify-center shadow-lg animate-ping"
                    style={{
                      transform: `rotate(${i * 26}deg) translate(${85 + (i % 3) * 30}px) rotate(-${i * 26}deg)`,
                      animationDuration: '0.35s'
                    }}
                  >
                    ৳
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PRIZE SHOW - Clean, focused, high-impact winning card without 3rd step */}
          {phase === 'revealed' && (
            <div className="relative flex flex-col items-center max-w-md w-full bg-gradient-to-b from-red-950 via-[#3b0808] to-[#1a0505] border-3 border-yellow-400/90 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.8)] p-6 sm:p-7 text-center animate-in zoom-in-95 duration-250 my-auto">
              {/* Trophy Header */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 border-2 border-white flex items-center justify-center shadow-xl -mt-14 mb-2">
                <Trophy className="w-9 h-9 text-red-900 fill-amber-300 animate-bounce" />
              </div>

              {/* Congratulatory Tag */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-yellow-400 text-black text-xs font-black shadow mb-2">
                <Sparkles className="w-3.5 h-3.5 fill-black" />
                <span>লাল খাম ফাটার জ্যাকপট</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white font-bengali">
                {language === 'bn' ? 'অভিনন্দন! আপনি জিতেছেন' : 'Congratulations! You Won'}
              </h2>

              {/* Emerging Cash Stack & Animated Amount */}
              <div className="my-4 py-4 px-6 w-full rounded-2xl bg-gradient-to-r from-red-900/90 via-rose-900/90 to-red-900/90 border-2 border-yellow-400/80 shadow-inner flex flex-col items-center justify-center">
                <span className="text-xs text-yellow-200 font-bengali font-bold">
                  নগদ ক্যাশ পুরষ্কার
                </span>
                <div className="text-4xl sm:text-5xl font-black font-game text-yellow-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] tracking-wider mt-0.5">
                  ৳ {displayAmount.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-emerald-300 font-bengali font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>সরাসরি মূল ওয়ালেটে যোগ করা হয়েছে</span>
                </div>
              </div>

              {/* User Balance Info */}
              <div className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-black/50 border border-yellow-500/20 text-xs mb-5 font-bengali">
                <span className="text-gray-300">বর্তমান ওয়ালেট ব্যালেন্স:</span>
                <span className="font-mono font-bold text-yellow-300 text-sm">
                  ৳ {(user.balance).toFixed(2)}
                </span>
              </div>

              {/* Single Clean Claim Button (Calls onClose and returns) */}
              <div className="w-full">
                <button
                  id="claim-red-packet-cash-btn"
                  onClick={handleCloseModal}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-black font-black text-sm sm:text-base font-bengali shadow-[0_0_30px_rgba(250,204,21,0.6)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 fill-black text-yellow-400" />
                  <span>{language === 'bn' ? 'টাকা সংগ্রহ করুন' : 'Claim Cash'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
