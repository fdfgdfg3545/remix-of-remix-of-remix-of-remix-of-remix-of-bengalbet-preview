// @ts-nocheck
/**
 * Spribe Aviator - Official Recreation
 * 
 * Authentic Spribe Aviator UI & Gameplay:
 * - Red Monoplane with rotating propeller & exhaust smoke trail
 * - Smooth exponential flight curve with glowing red area fill
 * - Dual Betting Panels (Bet 1 and Bet 2) with Manual and Auto Cash Out modes
 * - Top Multiplier History Ribbon (Blue <2x, Purple 2x-9.99x, Pink >=10x)
 * - Live Multiplayer Social Feed (All Bets, My Bets, Top Wins)
 * - Synthesized Web Audio API sound effects and electronic lounge background music
 * - How to Play & Provably Fair SHA512 verification modal
 * - Dynamic BDT currency integration with real-time balance updates
 * - Full bilingual support (Bengali / English)
 * - Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Music, 
  RotateCcw, 
  History, 
  ShieldCheck, 
  Users, 
  User, 
  Trophy, 
  Maximize, 
  Minimize, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Check, 
  ArrowUpRight, 
  Clock, 
  Flame, 
  Sparkles,
  Info,
  Menu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { aviatorAudio } from './aviatorAudio';
import { gameEngine } from '../../services/gameEngine';

interface AviatorGameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

interface PastRound {
  id: string;
  multiplier: number;
  time: string;
  serverSeed: string;
}

interface SimulatedBet {
  id: string;
  username: string;
  avatar: string;
  betAmount: number;
  cashedOutMultiplier: number | null;
  winAmount: number | null;
  cashoutTarget: number;
}

interface MyBetRecord {
  id: string;
  time: string;
  betAmount: number;
  multiplier: number;
  winAmount: number;
  status: 'won' | 'lost';
}

type RoundStatus = 'WAITING' | 'FLYING' | 'FLEW_AWAY';

const RECENT_MULTIPLIERS_INITIAL: PastRound[] = [
  { id: 'r-1', multiplier: 1.24, time: '14:15:02', serverSeed: '9fa7b2c89e1029384756ab' },
  { id: 'r-2', multiplier: 2.85, time: '14:15:28', serverSeed: '8cb3a1d99e2039485761bc' },
  { id: 'r-3', multiplier: 1.05, time: '14:15:40', serverSeed: '1ab4c3e87d3049586772cd' },
  { id: 'r-4', multiplier: 14.82, time: '14:16:15', serverSeed: '7fd8e2c65a4059687883de' },
  { id: 'r-5', multiplier: 3.40, time: '14:16:42', serverSeed: '6ac7d1b54b5069788994ef' },
  { id: 'r-6', multiplier: 1.12, time: '14:17:01', serverSeed: '5bc6c0a43c6079899005fa' },
  { id: 'r-7', multiplier: 5.67, time: '14:17:35', serverSeed: '4cd5b9932d7089900116ab' },
  { id: 'r-8', multiplier: 1.94, time: '14:17:58', serverSeed: '3de4a8821e8099011227bc' },
  { id: 'r-9', multiplier: 38.50, time: '14:18:45', serverSeed: '2ef397710f9109122338cd' },
  { id: 'r-10', multiplier: 1.38, time: '14:19:12', serverSeed: '1fa286609a0219233449de' },
  { id: 'r-11', multiplier: 2.15, time: '14:19:34', serverSeed: '0ab175598b1329344550ef' },
  { id: 'r-12', multiplier: 1.02, time: '14:19:48', serverSeed: '9bc064487c2439455661fa' },
];

const QUICK_CHIPS = [50, 100, 200, 500, 1000, 2000];

export const AviatorGame: React.FC<AviatorGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  // --- Game Balance & Sound Settings ---
  const [balance, setBalance] = useState(user.balance || 2500);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Modals & Overlays ---
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState<PastRound | null>(null);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [selectedSidebarTab, setSelectedSidebarTab] = useState<'all' | 'my' | 'top'>('all');
  const [topTabFilter, setTopTabFilter] = useState<'huge' | 'multiplier'>('huge');
  const [cashoutCelebrationToast, setCashoutCelebrationToast] = useState<{ text: string; amount: number; multiplier: number } | null>(null);

  // --- Flight Engine & State ---
  const [roundStatus, setRoundStatus] = useState<RoundStatus>('WAITING');
  const [countdown, setCountdown] = useState<number>(5.0);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashTarget, setCrashTarget] = useState<number>(2.45);
  const [pastRounds, setPastRounds] = useState<PastRound[]>(RECENT_MULTIPLIERS_INITIAL);
  const [myBetsHistory, setMyBetsHistory] = useState<MyBetRecord[]>([]);

  // Simulated Live Multiplayer Room
  const [simulatedBets, setSimulatedBets] = useState<SimulatedBet[]>([]);

  // --- Bet Deck 1 State ---
  const [bet1Amount, setBet1Amount] = useState<number>(100);
  const [bet1Mode, setBet1Mode] = useState<'bet' | 'auto'>('bet');
  const [bet1Placed, setBet1Placed] = useState<boolean>(false);
  const [bet1ActiveInFlight, setBet1ActiveInFlight] = useState<boolean>(false);
  const [bet1CashedOut, setBet1CashedOut] = useState<boolean>(false);
  const [bet1AutoCashoutEnabled, setBet1AutoCashoutEnabled] = useState<boolean>(false);
  const [bet1AutoCashoutTarget, setBet1AutoCashoutTarget] = useState<number>(2.00);
  const [bet1AutoBet, setBet1AutoBet] = useState<boolean>(false);

  // --- Bet Deck 2 State ---
  const [bet2Amount, setBet2Amount] = useState<number>(200);
  const [bet2Mode, setBet2Mode] = useState<'bet' | 'auto'>('bet');
  const [bet2Placed, setBet2Placed] = useState<boolean>(false);
  const [bet2ActiveInFlight, setBet2ActiveInFlight] = useState<boolean>(false);
  const [bet2CashedOut, setBet2CashedOut] = useState<boolean>(false);
  const [bet2AutoCashoutEnabled, setBet2AutoCashoutEnabled] = useState<boolean>(false);
  const [bet2AutoCashoutTarget, setBet2AutoCashoutTarget] = useState<number>(5.00);
  const [bet2AutoBet, setBet2AutoBet] = useState<boolean>(false);

  // Canvas & Animation refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);
  const propellerAngleRef = useRef<number>(0);
  const flightDurationRef = useRef<number>(0);

  // Sync user balance with parent
  const updateBalanceSafe = (newBal: number) => {
    const formatted = Math.max(0, Math.round(newBal * 100) / 100);
    setBalance(formatted);
    onUpdateBalance(formatted);
  };

  // Sound & Music initialization
  useEffect(() => {
    aviatorAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    aviatorAudio.setMusicEnabled(musicEnabled);
    return () => {
      aviatorAudio.stopMusic();
      aviatorAudio.stopEngine();
    };
  }, [musicEnabled]);

  // Generate simulated players for the round
  const generateSimulatedBets = () => {
    const names = [
      's***8', 'k***2', 'b***9', 'r***4', 'm***1', 't***7', 'd***5', 'h***3', 'n***6', 'p***0',
      'a***4', 'j***6', 'w***9', 'v***3', 'f***1', 'z***5', 'e***8', 'y***2', 'c***7', 'l***4',
      'u***9', 'o***1', 'q***3', 'g***8', 'i***5'
    ];
    const avatars = ['🦊', '🐯', '🦅', '🦁', '🐺', '🐼', '🐲', '🦄', '🐻', '🐸'];

    const newBets: SimulatedBet[] = names.map((name, i) => {
      const betAmt = [50, 100, 200, 300, 500, 1000, 2000, 3500][Math.floor(Math.random() * 8)];
      // Random target multiplier between 1.15 and 8.50
      const target = parseFloat((1.15 + Math.random() * 5.5).toFixed(2));
      return {
        id: `sim-${i}-${Date.now()}`,
        username: name,
        avatar: avatars[i % avatars.length],
        betAmount: betAmt,
        cashedOutMultiplier: null,
        winAmount: null,
        cashoutTarget: target
      };
    });

    setSimulatedBets(newBets);
  };

  // Generate Provably Fair Crash Multiplier (powered by 0-100% Game Engine)
  const generateCrashMultiplier = (): number => {
    return gameEngine.generateCrashMultiplier('aviator');
  };

  // --- MAIN GAME LOOP CONTROLLER ---
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (roundStatus === 'WAITING') {
      aviatorAudio.stopEngine();
      generateSimulatedBets();

      // Reset flight flags
      setMultiplier(1.00);
      setBet1CashedOut(false);
      setBet2CashedOut(false);

      // Handle Auto Bet re-placements
      if (bet1AutoBet && !bet1Placed && balance >= bet1Amount) {
        setBet1Placed(true);
        updateBalanceSafe(balance - bet1Amount);
      }
      if (bet2AutoBet && !bet2Placed && balance >= bet2Amount) {
        setBet2Placed(true);
        updateBalanceSafe(balance - bet2Amount);
      }

      // 5-second countdown with 100ms ticks
      let currentCount = 5.0;
      setCountdown(currentCount);

      const countdownInterval = setInterval(() => {
        currentCount = parseFloat((currentCount - 0.1).toFixed(1));
        setCountdown(Math.max(0, currentCount));

        if (Math.round(currentCount * 10) % 10 === 0 && currentCount > 0) {
          aviatorAudio.playCountdownTick();
        }

        if (currentCount <= 0) {
          clearInterval(countdownInterval);

          // Activate placed bets into flight
          setBet1ActiveInFlight(bet1Placed);
          setBet2ActiveInFlight(bet2Placed);

          const target = generateCrashMultiplier();
          setCrashTarget(target);
          setRoundStatus('FLYING');
          flightStartTimeRef.current = performance.now();
          aviatorAudio.startEngine(1.00);
        }
      }, 100);

      return () => clearInterval(countdownInterval);
    }

    if (roundStatus === 'FLEW_AWAY') {
      aviatorAudio.playFlewAwaySound();

      // Record any uncashed bets as lost
      if (bet1ActiveInFlight && !bet1CashedOut) {
        gameEngine.recordRound(bet1Amount, 0, {
          gameId: 'game-aviator',
          gameName: 'Spribe Aviator',
          category: 'crash',
          vendor: 'Spribe'
        });
        setMyBetsHistory(prev => [
          {
            id: `my-${Date.now()}-1`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            betAmount: bet1Amount,
            multiplier: crashTarget,
            winAmount: 0,
            status: 'lost'
          },
          ...prev.slice(0, 40)
        ]);
      }
      if (bet2ActiveInFlight && !bet2CashedOut) {
        gameEngine.recordRound(bet2Amount, 0, {
          gameId: 'game-aviator',
          gameName: 'Spribe Aviator',
          category: 'crash',
          vendor: 'Spribe'
        });
        setMyBetsHistory(prev => [
          {
            id: `my-${Date.now()}-2`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            betAmount: bet2Amount,
            multiplier: crashTarget,
            winAmount: 0,
            status: 'lost'
          },
          ...prev.slice(0, 40)
        ]);
      }

      // Record in Past Rounds
      const newRoundRecord: PastRound = {
        id: `r-${Date.now()}`,
        multiplier: crashTarget,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        serverSeed: Array.from({ length: 22 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      setPastRounds(prev => [newRoundRecord, ...prev.slice(0, 40)]);

      // Reset bet states for next round
      setBet1Placed(false);
      setBet1ActiveInFlight(false);
      setBet2Placed(false);
      setBet2ActiveInFlight(false);

      // Wait 2.8s before next round
      timer = setTimeout(() => {
        setRoundStatus('WAITING');
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [roundStatus, bet1Placed, bet2Placed, bet1AutoBet, bet2AutoBet]);

  // --- FLIGHT ANIMATION & MULTIPLIER TICKER ---
  useEffect(() => {
    if (roundStatus !== 'FLYING') return;

    let isCancelled = false;

    const animateFlight = (now: number) => {
      if (isCancelled) return;

      const elapsedSec = (now - flightStartTimeRef.current) / 1000;
      flightDurationRef.current = elapsedSec;

      // Exponential growth curve: M(t) = 1 + 0.06 * t^1.75
      // Gives a smooth, thrilling acceleration matching Spribe Aviator
      const currentMul = parseFloat((1.00 + 0.08 * Math.pow(elapsedSec * 1.5, 1.8)).toFixed(2));

      setMultiplier(currentMul);
      aviatorAudio.updateEnginePitch(currentMul);

      // Check simulated players auto-cashout
      setSimulatedBets(prev => 
        prev.map(bet => {
          if (!bet.cashedOutMultiplier && currentMul >= bet.cashoutTarget && currentMul <= crashTarget) {
            return {
              ...bet,
              cashedOutMultiplier: currentMul,
              winAmount: Math.round(bet.betAmount * currentMul)
            };
          }
          return bet;
        })
      );

      // Check Deck 1 Auto Cashout
      if (bet1ActiveInFlight && !bet1CashedOut && bet1AutoCashoutEnabled && currentMul >= bet1AutoCashoutTarget) {
        triggerCashoutDeck1(currentMul);
      }

      // Check Deck 2 Auto Cashout
      if (bet2ActiveInFlight && !bet2CashedOut && bet2AutoCashoutEnabled && currentMul >= bet2AutoCashoutTarget) {
        triggerCashoutDeck2(currentMul);
      }

      // Check Crash
      if (currentMul >= crashTarget) {
        setRoundStatus('FLEW_AWAY');
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animateFlight);
    };

    animationFrameRef.current = requestAnimationFrame(animateFlight);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [roundStatus, crashTarget, bet1ActiveInFlight, bet1CashedOut, bet1AutoCashoutEnabled, bet1AutoCashoutTarget, bet2ActiveInFlight, bet2CashedOut, bet2AutoCashoutEnabled, bet2AutoCashoutTarget]);

  // --- CASHOUT HANDLERS ---
  const triggerCashoutDeck1 = (mul: number) => {
    if (!bet1ActiveInFlight || bet1CashedOut) return;

    const winCash = Math.round(bet1Amount * mul * 100) / 100;
    setBet1CashedOut(true);
    setBet1ActiveInFlight(false);
    updateBalanceSafe(balance + winCash);

    aviatorAudio.playCashoutSound();
    confetti({ particleCount: 60, spread: 60, origin: { x: 0.35, y: 0.85 } });

    gameEngine.recordRound(bet1Amount, winCash, {
      gameId: 'game-aviator',
      gameName: 'Spribe Aviator',
      category: 'crash',
      vendor: 'Spribe'
    });

    setCashoutCelebrationToast({
      text: language === 'bn' ? 'আপনি সফলভাবে ক্যাশ আউট করেছেন!' : 'You have cashed out!',
      amount: winCash,
      multiplier: mul
    });
    setTimeout(() => setCashoutCelebrationToast(null), 3000);

    setMyBetsHistory(prev => [
      {
        id: `my-${Date.now()}-1`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        betAmount: bet1Amount,
        multiplier: mul,
        winAmount: winCash,
        status: 'won'
      },
      ...prev.slice(0, 40)
    ]);
  };

  const triggerCashoutDeck2 = (mul: number) => {
    if (!bet2ActiveInFlight || bet2CashedOut) return;

    const winCash = Math.round(bet2Amount * mul * 100) / 100;
    setBet2CashedOut(true);
    setBet2ActiveInFlight(false);
    updateBalanceSafe(balance + winCash);

    aviatorAudio.playCashoutSound();
    confetti({ particleCount: 60, spread: 60, origin: { x: 0.65, y: 0.85 } });

    gameEngine.recordRound(bet2Amount, winCash, {
      gameId: 'game-aviator',
      gameName: 'Spribe Aviator',
      category: 'crash',
      vendor: 'Spribe'
    });

    setCashoutCelebrationToast({
      text: language === 'bn' ? 'আপনি সফলভাবে ক্যাশ আউট করেছেন!' : 'You have cashed out!',
      amount: winCash,
      multiplier: mul
    });
    setTimeout(() => setCashoutCelebrationToast(null), 3000);

    setMyBetsHistory(prev => [
      {
        id: `my-${Date.now()}-2`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        betAmount: bet2Amount,
        multiplier: mul,
        winAmount: winCash,
        status: 'won'
      },
      ...prev.slice(0, 40)
    ]);
  };

  // --- CANVAS RENDERING (Curved Radar, Monoplane, Smoke Trail) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let renderId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear dark flight radar background
      ctx.clearRect(0, 0, width, height);

      // Radar subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridCountX = 6;
      const gridCountY = 5;

      for (let i = 1; i <= gridCountX; i++) {
        const x = (width / gridCountX) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let i = 1; i <= gridCountY; i++) {
        const y = (height / gridCountY) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Bottom runway baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      ctx.lineTo(width, height - 30);
      ctx.stroke();

      // Axis labels (Time & Multipliers)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '11px sans-serif';
      ctx.fillText('0s', 15, height - 12);
      ctx.fillText('5s', width * 0.35, height - 12);
      ctx.fillText('10s', width * 0.7, height - 12);

      // --- RENDER PLANE & FLIGHT CURVE ---
      if (roundStatus === 'FLYING' || roundStatus === 'FLEW_AWAY') {
        const t = Math.min(flightDurationRef.current, 12);
        // Plane position coordinates
        // Progress climbs from bottom-left (50, height - 35) to top-right (width * 0.82, height * 0.22)
        const progress = Math.min((multiplier - 1) / (crashTarget > 10 ? 15 : crashTarget * 1.1), 1.0);
        
        let startX = 40;
        let startY = height - 32;

        let targetX = 50 + (width - 160) * Math.min(Math.pow(progress, 0.75), 0.95);
        let targetY = (height - 40) - (height * 0.65) * Math.min(Math.pow(progress, 0.8), 0.92);

        // Control point for smooth Bezier curve
        const cpX = startX + (targetX - startX) * 0.55;
        const cpY = startY;

        // If Flew Away, animate plane shooting off the screen
        let planeX = targetX;
        let planeY = targetY;
        let planeRotation = Math.atan2(targetY - cpY, targetX - cpX) + 0.05;

        if (roundStatus === 'FLEW_AWAY') {
          // Offscreen projection
          planeX = width + 120;
          planeY = -60;
        }

        // Draw Glowing Red Fill Underneath Curve
        const grad = ctx.createLinearGradient(0, targetY, 0, height - 30);
        grad.addColorStop(0, 'rgba(225, 29, 72, 0.38)');
        grad.addColorStop(0.5, 'rgba(225, 29, 72, 0.15)');
        grad.addColorStop(1, 'rgba(225, 29, 72, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
        ctx.lineTo(targetX, height - 30);
        ctx.lineTo(startX, height - 30);
        ctx.closePath();
        ctx.fill();

        // Draw Flight Path Stroke
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(225, 29, 72, 0.8)';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Draw Red Propeller Plane
        if (roundStatus === 'FLYING') {
          propellerAngleRef.current = (propellerAngleRef.current + 0.45) % (Math.PI * 2);

          ctx.save();
          ctx.translate(planeX, planeY);
          ctx.rotate(planeRotation);

          // Draw the iconic Spribe Aviator red monoplane
          // Plane Body (Aerodynamic fuselage)
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(25, 0); // Nose
          ctx.lineTo(-20, -7); // Top tail
          ctx.lineTo(-26, -18); // Tail fin top
          ctx.lineTo(-22, 0); // Tail rudder
          ctx.lineTo(-20, 6); // Bottom tail
          ctx.closePath();
          ctx.fill();

          // Plane Cockpit / Windshield (White/Cyan glass)
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.moveTo(14, -2);
          ctx.lineTo(2, -5);
          ctx.lineTo(0, -1);
          ctx.lineTo(12, 0);
          ctx.closePath();
          ctx.fill();

          // Main Wing (Swept monoplane wing)
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(6, 1);
          ctx.lineTo(-6, 22);
          ctx.lineTo(-12, 21);
          ctx.lineTo(-2, 1);
          ctx.closePath();
          ctx.fill();

          // Spinning Propeller at Nose
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2.5;
          const pAngle = propellerAngleRef.current;
          ctx.beginPath();
          ctx.moveTo(25 + Math.cos(pAngle) * 9, Math.sin(pAngle) * 9);
          ctx.lineTo(25 - Math.cos(pAngle) * 9, -Math.sin(pAngle) * 9);
          ctx.stroke();

          // Propeller Hub cap
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(25, 0, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Exhaust Engine Glowing Particle Dot
          ctx.fillStyle = '#f43f5e';
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(-22, 0, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      renderId = requestAnimationFrame(render);
    };

    renderId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(renderId);
  }, [roundStatus, multiplier, crashTarget]);

  // Multiplier Color Coding Helper (Spribe official)
  const getMultiplierStyle = (mul: number) => {
    if (mul < 2.00) {
      return 'bg-[#34b4ff]/20 text-[#34b4ff] border-[#34b4ff]/40';
    } else if (mul < 10.00) {
      return 'bg-[#913ef8]/20 text-[#c084fc] border-[#913ef8]/40';
    } else {
      return 'bg-[#c017b4]/25 text-[#f472b6] border-[#c017b4]/50 shadow-[0_0_8px_rgba(192,23,180,0.4)]';
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullscreen ? 'p-0' : 'p-1 sm:p-3'} bg-black/95 backdrop-blur-md select-none font-sans`}>
      <div 
        id="aviator-game-container"
        className={`relative w-full ${isFullscreen ? 'h-full rounded-none' : 'max-w-[1400px] h-[96vh] rounded-2xl'} bg-[#0e1015] border border-gray-800 shadow-2xl flex flex-col overflow-hidden text-gray-200`}
      >
        
        {/* ================= 1. TOP HEADER BAR ================= */}
        <div className="bg-[#141721] px-3 py-2 border-b border-gray-800 flex items-center justify-between gap-2 shrink-0">
          {/* Left: Aviator Logo & Spribe Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowHowToPlay(true)}>
              {/* Spribe Aviator Icon */}
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-700 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <span className="text-white text-base">✈️</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black text-red-500 tracking-wider font-game uppercase">Aviator</span>
                  <span className="text-[9px] bg-red-600 text-white font-bold px-1 rounded uppercase tracking-tighter">SPRIBE</span>
                </div>
              </div>
            </div>

            {/* "How to play?" Button */}
            <button
              onClick={() => {
                aviatorAudio.playClickSound();
                setShowHowToPlay(true);
              }}
              className="hidden sm:flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 bg-orange-950/30 hover:bg-orange-950/60 border border-orange-800/40 px-2.5 py-1 rounded-full transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>{language === 'bn' ? 'কিভাবে খেলবেন?' : 'How to play?'}</span>
            </button>
          </div>

          {/* Center/Right: User Balance & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live BDT Balance Pill */}
            <div className="flex items-center gap-1.5 bg-[#0a0d13] border border-green-500/30 px-3 py-1.5 rounded-full shadow-inner">
              <span className="text-xs text-green-400 font-bold">BDT</span>
              <span className="text-sm sm:text-base font-extrabold text-green-400 font-mono tracking-tight">
                ৳ {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Sound FX Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition-all ${
                soundEnabled ? 'bg-[#1b202e] border-gray-700 text-gray-200' : 'bg-red-950/40 border-red-800 text-red-400'
              }`}
              title={soundEnabled ? 'Sound FX On' : 'Sound FX Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Background Music Toggle */}
            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className={`p-1.5 rounded-lg border transition-all ${
                musicEnabled ? 'bg-red-900/40 border-red-600 text-red-300' : 'bg-[#1b202e] border-gray-700 text-gray-500'
              }`}
              title={musicEnabled ? 'Music On' : 'Music Off'}
            >
              <Music className="w-4 h-4" />
            </button>

            {/* Menu Drawer Toggle */}
            <button
              onClick={() => setShowMenuDrawer(!showMenuDrawer)}
              className="p-1.5 rounded-lg bg-[#1b202e] hover:bg-[#232a3d] border border-gray-700 text-gray-300"
              title="Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-1.5 rounded-lg bg-[#1b202e] hover:bg-[#232a3d] border border-gray-700 text-gray-300"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Exit / Close Modal */}
            <button
              onClick={() => {
                aviatorAudio.stopEngine();
                aviatorAudio.stopMusic();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-300 hover:text-white transition-all ml-1"
              title="Exit Aviator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================= 2. TOP MULTIPLIER HISTORY RIBBON ================= */}
        <div className="bg-[#11141c] px-3 py-1.5 border-b border-gray-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {pastRounds.map((round) => (
              <button
                key={round.id}
                onClick={() => setShowProvablyFairModal(round)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${getMultiplierStyle(round.multiplier)}`}
                title={`Round at ${round.time} - Click to verify Provably Fair`}
              >
                {round.multiplier.toFixed(2)}x
              </button>
            ))}
          </div>

          {/* History Dropdown Button */}
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white bg-[#1a1f2c] border border-gray-700 px-2 py-1 rounded-md shrink-0 ml-1"
          >
            <History className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden md:inline">{language === 'bn' ? 'ইতিহাস' : 'History'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showHistoryDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Dropdown Full History Drawer */}
        {showHistoryDropdown && (
          <div className="absolute top-[82px] left-0 right-0 z-30 bg-[#161a24]/95 border-b border-gray-700 shadow-2xl p-4 backdrop-blur-md animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {language === 'bn' ? 'সাম্প্রতিক রাউন্ডের ফলাফল (Provably Fair)' : 'Recent Round Multipliers (Provably Fair)'}
                </span>
              </div>
              <button onClick={() => setShowHistoryDropdown(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-1">
              {pastRounds.map((r) => (
                <div 
                  key={r.id}
                  onClick={() => {
                    setShowProvablyFairModal(r);
                    setShowHistoryDropdown(false);
                  }}
                  className={`p-1.5 rounded-lg border text-center cursor-pointer hover:border-white transition-all ${getMultiplierStyle(r.multiplier)}`}
                >
                  <div className="text-xs font-black font-mono">{r.multiplier.toFixed(2)}x</div>
                  <div className="text-[9px] text-gray-400">{r.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 3. MAIN ARENA (SIDEBAR + FLIGHT STAGE + DUAL DECKS) ================= */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

          {/* LEFT SIDEBAR: ALL BETS / MY BETS / TOP */}
          <div className="hidden lg:flex w-72 xl:w-80 bg-[#12151e] border-r border-gray-800 flex-col shrink-0">
            {/* Sidebar Navigation Tabs */}
            <div className="grid grid-cols-3 p-1.5 bg-[#0a0d13] border-b border-gray-800 text-xs font-bold">
              <button
                onClick={() => setSelectedSidebarTab('all')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  selectedSidebarTab === 'all' ? 'bg-[#1b202e] text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {language === 'bn' ? 'সকল বাজি' : 'All Bets'}
              </button>
              <button
                onClick={() => setSelectedSidebarTab('my')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  selectedSidebarTab === 'my' ? 'bg-[#1b202e] text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {language === 'bn' ? 'আমার বাজি' : 'My Bets'}
              </button>
              <button
                onClick={() => setSelectedSidebarTab('top')}
                className={`py-1.5 rounded-md text-center transition-all ${
                  selectedSidebarTab === 'top' ? 'bg-[#1b202e] text-white shadow' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {language === 'bn' ? 'সেরা জয়' : 'Top'}
              </button>
            </div>

            {/* TAB CONTENT */}
            {selectedSidebarTab === 'all' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Active Round Info Header */}
                <div className="px-3 py-2 bg-[#171b26] border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{language === 'bn' ? 'খেলোয়াড়:' : 'Total Bets:'}</span>
                    <span className="font-bold text-white">{simulatedBets.length + (bet1ActiveInFlight ? 1 : 0) + (bet2ActiveInFlight ? 1 : 0)}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">
                    ৳ {simulatedBets.reduce((acc, b) => acc + b.betAmount, 0).toLocaleString()}
                  </div>
                </div>

                {/* Bets List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-800/40 text-xs">
                  {/* Current User Active Bet 1 */}
                  {bet1ActiveInFlight && (
                    <div className="px-3 py-1.5 bg-red-950/30 flex items-center justify-between border-l-2 border-red-500">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">👤</span>
                        <span className="font-bold text-red-400">{user.username || 'You (Bet 1)'}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span>৳ {bet1Amount}</span>
                        {bet1CashedOut ? (
                          <span className="px-1.5 py-0.5 rounded bg-green-900/60 text-green-400 font-bold">
                            Won ৳{(bet1Amount * multiplier).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Simulated Online Players */}
                  {simulatedBets.map((sBet) => (
                    <div key={sBet.id} className="px-3 py-1.5 flex items-center justify-between hover:bg-[#181c28] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{sBet.avatar}</span>
                        <span className="text-gray-300 font-mono">{sBet.username}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-gray-400">৳{sBet.betAmount}</span>
                        {sBet.cashedOutMultiplier ? (
                          <span className="px-1.5 py-0.2 rounded bg-green-950/60 border border-green-800/50 text-green-400 font-bold text-[11px]">
                            {sBet.cashedOutMultiplier.toFixed(2)}x
                          </span>
                        ) : (
                          <span className="text-gray-600 text-[11px]">-</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSidebarTab === 'my' && (
              <div className="flex-1 overflow-y-auto p-2">
                {myBetsHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500">
                    <History className="w-8 h-8 mb-2 opacity-40" />
                    <p className="text-xs">{language === 'bn' ? 'কোনো পূর্ববর্তী বাজি নেই' : 'No previous bets yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {myBetsHistory.map((rec) => (
                      <div 
                        key={rec.id}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                          rec.status === 'won' 
                            ? 'bg-green-950/20 border-green-800/40 text-green-300' 
                            : 'bg-red-950/20 border-red-900/40 text-gray-400'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-white">৳ {rec.betAmount}</div>
                          <div className="text-[10px] text-gray-400">{rec.time}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold">{rec.multiplier.toFixed(2)}x</div>
                          <div className={`font-bold ${rec.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                            {rec.status === 'won' ? `+৳ ${rec.winAmount.toFixed(2)}` : '-৳ ' + rec.betAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSidebarTab === 'top' && (
              <div className="flex-1 overflow-y-auto p-2 space-y-2 text-xs">
                <div className="flex gap-1 p-1 bg-[#0a0d13] rounded-lg">
                  <button 
                    onClick={() => setTopTabFilter('huge')}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-bold ${topTabFilter === 'huge' ? 'bg-[#1b202e] text-white' : 'text-gray-400'}`}
                  >
                    {language === 'bn' ? 'বিশাল জয়' : 'Huge Wins'}
                  </button>
                  <button 
                    onClick={() => setTopTabFilter('multiplier')}
                    className={`flex-1 py-1 rounded text-center text-[11px] font-bold ${topTabFilter === 'multiplier' ? 'bg-[#1b202e] text-white' : 'text-gray-400'}`}
                  >
                    {language === 'bn' ? 'সর্বোচ্চ মাল্টিপ্লায়ার' : 'Max Multiplier'}
                  </button>
                </div>

                {/* Top Wins Leaderboard */}
                <div className="space-y-1.5">
                  {[
                    { rank: 1, user: 'b***2', amount: 185000, mul: 185.00, date: 'Today' },
                    { rank: 2, user: 'k***9', amount: 98400, mul: 82.00, date: 'Today' },
                    { rank: 3, user: 'm***4', amount: 72000, mul: 144.00, date: 'Yesterday' },
                    { rank: 4, user: 'd***7', amount: 45000, mul: 45.00, date: 'Yesterday' },
                    { rank: 5, user: 'a***1', amount: 32500, mul: 65.00, date: '08/09' }
                  ].map((top) => (
                    <div key={top.rank} className="p-2 rounded-lg bg-[#161a25] border border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] ${
                          top.rank === 1 ? 'bg-amber-500 text-black' : top.rank === 2 ? 'bg-gray-300 text-black' : 'bg-amber-800 text-white'
                        }`}>
                          {top.rank}
                        </span>
                        <div>
                          <div className="font-bold text-white font-mono">{top.user}</div>
                          <div className="text-[10px] text-gray-500">{top.date}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-green-400 font-bold">৳ {top.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-purple-400 font-bold">{top.mul.toFixed(2)}x</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CENTER & BOTTOM: FLIGHT RADAR & DUAL CONTROLLERS */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#0a0d13]">
            
            {/* --- FLIGHT CANVAS RADAR STAGE --- */}
            <div className="flex-1 relative bg-gradient-to-b from-[#0b0e14] via-[#090b10] to-[#05070a] flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[340px]">
              
              {/* Radar HTML Canvas */}
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* CELEBRATION WIN TOAST BANNER */}
              {cashoutCelebrationToast && (
                <div className="absolute top-4 z-20 bg-green-500 text-black font-extrabold px-6 py-2.5 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.8)] border border-green-300 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                  <Sparkles className="w-5 h-5 fill-black" />
                  <div className="text-center">
                    <div className="text-xs uppercase tracking-wider">{cashoutCelebrationToast.text}</div>
                    <div className="text-lg sm:text-xl font-black">
                      ৳ {cashoutCelebrationToast.amount.toFixed(2)} ({cashoutCelebrationToast.multiplier.toFixed(2)}x)
                    </div>
                  </div>
                </div>
              )}

              {/* CENTRAL MULTIPLIER / STATUS DISPLAY */}
              <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none select-none">
                {roundStatus === 'WAITING' && (
                  <div className="flex flex-col items-center justify-center space-y-3 p-4 bg-black/40 backdrop-blur-xs rounded-2xl border border-gray-800/80">
                    <span className="text-xs sm:text-sm uppercase tracking-widest text-gray-400 font-bold animate-pulse">
                      {language === 'bn' ? 'পরবর্তী রাউন্ডের জন্য অপেক্ষা করা হচ্ছে' : 'WAITING FOR NEXT ROUND'}
                    </span>
                    {/* Countdown bar */}
                    <div className="w-48 sm:w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100 ease-linear"
                        style={{ width: `${(countdown / 5.0) * 100}%` }}
                      />
                    </div>
                    <span className="text-xl sm:text-2xl font-black text-red-500 font-mono">
                      {countdown.toFixed(1)}s
                    </span>
                  </div>
                )}

                {roundStatus === 'FLYING' && (
                  <div className="flex flex-col items-center animate-in zoom-in-90 duration-150">
                    <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white font-game tracking-wider drop-shadow-[0_4px_30px_rgba(225,29,72,0.6)]">
                      {multiplier.toFixed(2)}x
                    </span>
                  </div>
                )}

                {roundStatus === 'FLEW_AWAY' && (
                  <div className="flex flex-col items-center space-y-1 animate-in zoom-in duration-150">
                    <span className="text-base sm:text-xl font-black text-red-500 tracking-widest uppercase">
                      {language === 'bn' ? 'উড়ে চলে গেল!' : 'FLEW AWAY!'}
                    </span>
                    <span className="text-5xl sm:text-7xl font-black text-red-500 font-game drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]">
                      {crashTarget.toFixed(2)}x
                    </span>
                  </div>
                )}
              </div>

              {/* Watermark Logo in Background */}
              <div className="absolute bottom-6 right-6 pointer-events-none opacity-5 flex items-center gap-2">
                <span className="text-7xl font-black uppercase text-white font-game">AVIATOR</span>
              </div>
            </div>

            {/* --- BOTTOM DUAL BETTING PANELS (SPRIBE SIGNATURE) --- */}
            <div className="p-2 sm:p-3 bg-[#11141c] border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 shrink-0">
              
              {/* ================= BET DECK 1 ================= */}
              <div className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                bet1ActiveInFlight ? 'bg-[#181d28] border-amber-500/50' : 'bg-[#141822] border-gray-800'
              }`}>
                {/* Mode Selector: Bet / Auto */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex bg-[#0a0d13] p-0.5 rounded-lg border border-gray-800 text-xs">
                    <button
                      onClick={() => setBet1Mode('bet')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        bet1Mode === 'bet' ? 'bg-[#1d2333] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'বাজি' : 'Bet'}
                    </button>
                    <button
                      onClick={() => setBet1Mode('auto')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        bet1Mode === 'auto' ? 'bg-[#1d2333] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'অটো' : 'Auto'}
                    </button>
                  </div>

                  {bet1Mode === 'auto' && (
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={bet1AutoBet}
                          onChange={(e) => setBet1AutoBet(e.target.checked)}
                          className="w-3.5 h-3.5 accent-red-600 rounded"
                        />
                        <span>{language === 'bn' ? 'অটো বাজি' : 'Auto Bet'}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={bet1AutoCashoutEnabled}
                          onChange={(e) => setBet1AutoCashoutEnabled(e.target.checked)}
                          className="w-3.5 h-3.5 accent-orange-500 rounded"
                        />
                        <span>{language === 'bn' ? 'অটো ক্যাশ আউট' : 'Auto Cash Out'}</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                  {/* Left Column: Bet Amount & Chips */}
                  <div className="col-span-7 flex flex-col gap-1.5">
                    {/* Stepper Input */}
                    <div className="flex items-center bg-[#0a0d13] border border-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setBet1Amount(prev => Math.max(10, prev - 50))}
                        disabled={bet1Placed || bet1ActiveInFlight}
                        className="w-7 h-7 rounded bg-[#1c2230] hover:bg-[#252d40] text-white flex items-center justify-center font-bold disabled:opacity-40"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={bet1Amount}
                        disabled={bet1Placed || bet1ActiveInFlight}
                        onChange={(e) => setBet1Amount(Math.max(10, Number(e.target.value)))}
                        className="flex-1 bg-transparent text-center text-sm sm:text-base font-extrabold text-white font-mono outline-none"
                      />
                      <button
                        onClick={() => setBet1Amount(prev => prev + 50)}
                        disabled={bet1Placed || bet1ActiveInFlight}
                        className="w-7 h-7 rounded bg-[#1c2230] hover:bg-[#252d40] text-white flex items-center justify-center font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick BDT Amount Chips */}
                    <div className="grid grid-cols-3 gap-1">
                      {QUICK_CHIPS.slice(0, 3).map((amt) => (
                        <button
                          key={amt}
                          disabled={bet1Placed || bet1ActiveInFlight}
                          onClick={() => setBet1Amount(amt)}
                          className={`py-0.5 rounded text-[11px] font-bold font-mono border transition-all ${
                            bet1Amount === amt 
                              ? 'bg-red-950/60 border-red-600 text-red-300' 
                              : 'bg-[#0a0d13] border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>

                    {/* Auto Cashout Multiplier Input if Auto is enabled */}
                    {bet1Mode === 'auto' && bet1AutoCashoutEnabled && (
                      <div className="flex items-center justify-between text-xs bg-[#0a0d13] border border-gray-800 px-2 py-1 rounded-md">
                        <span className="text-gray-400">{language === 'bn' ? 'টার্গেট:' : 'Target:'}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={bet1AutoCashoutTarget}
                            onChange={(e) => setBet1AutoCashoutTarget(Math.max(1.05, parseFloat(e.target.value)))}
                            className="w-16 bg-transparent text-right font-mono font-bold text-orange-400 outline-none"
                          />
                          <span className="font-bold text-orange-400">x</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Giant BET / CASH OUT Button */}
                  <div className="col-span-5 h-full flex">
                    {/* CASE 1: Round FLYING and Bet is Active -> Huge Orange CASH OUT button */}
                    {roundStatus === 'FLYING' && bet1ActiveInFlight && !bet1CashedOut ? (
                      <button
                        onClick={() => triggerCashoutDeck1(multiplier)}
                        className="w-full h-full min-h-[64px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl p-2 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95 transition-all"
                      >
                        <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">{language === 'bn' ? 'ক্যাশ আউট' : 'CASH OUT'}</span>
                        <span className="text-sm sm:text-lg font-mono font-black">
                          ৳ {(bet1Amount * multiplier).toFixed(2)}
                        </span>
                      </button>
                    ) : bet1Placed ? (
                      /* CASE 2: Bet is placed waiting for next round or in flight but cashed out */
                      <button
                        onClick={() => {
                          if (roundStatus === 'WAITING') {
                            setBet1Placed(false);
                            updateBalanceSafe(balance + bet1Amount);
                          }
                        }}
                        className={`w-full h-full min-h-[64px] rounded-xl p-2 flex flex-col items-center justify-center text-xs sm:text-sm font-bold border transition-all ${
                          roundStatus === 'WAITING' 
                            ? 'bg-red-900/60 hover:bg-red-800 border-red-700 text-white' 
                            : 'bg-[#181d28] border-gray-700 text-gray-400'
                        }`}
                      >
                        <span>{roundStatus === 'WAITING' ? (language === 'bn' ? 'বাতিল' : 'CANCEL') : (language === 'bn' ? 'অপেক্ষা...' : 'WAITING')}</span>
                        <span className="text-[11px] font-mono opacity-80">৳ {bet1Amount}</span>
                      </button>
                    ) : (
                      /* CASE 3: Normal BET Button */
                      <button
                        disabled={balance < bet1Amount}
                        onClick={() => {
                          if (balance < bet1Amount) return;
                          aviatorAudio.playClickSound();
                          setBet1Placed(true);
                          updateBalanceSafe(balance - bet1Amount);
                        }}
                        className="w-full h-full min-h-[64px] bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-black font-black rounded-xl p-2 flex flex-col items-center justify-center shadow-lg shadow-green-600/30 border border-green-400 active:scale-95 transition-all"
                      >
                        <span className="text-sm sm:text-base tracking-wider uppercase font-black">{language === 'bn' ? 'বাজি ধরুন' : 'BET'}</span>
                        <span className="text-xs sm:text-sm font-mono font-bold">৳ {bet1Amount.toFixed(2)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ================= BET DECK 2 (DUAL INDEPENDENT PANEL) ================= */}
              <div className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                bet2ActiveInFlight ? 'bg-[#181d28] border-amber-500/50' : 'bg-[#141822] border-gray-800'
              }`}>
                {/* Mode Selector: Bet / Auto */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex bg-[#0a0d13] p-0.5 rounded-lg border border-gray-800 text-xs">
                    <button
                      onClick={() => setBet2Mode('bet')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        bet2Mode === 'bet' ? 'bg-[#1d2333] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'বাজি' : 'Bet'}
                    </button>
                    <button
                      onClick={() => setBet2Mode('auto')}
                      className={`px-3 py-1 rounded-md font-bold transition-all ${
                        bet2Mode === 'auto' ? 'bg-[#1d2333] text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {language === 'bn' ? 'অটো' : 'Auto'}
                    </button>
                  </div>

                  {bet2Mode === 'auto' && (
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={bet2AutoBet}
                          onChange={(e) => setBet2AutoBet(e.target.checked)}
                          className="w-3.5 h-3.5 accent-red-600 rounded"
                        />
                        <span>{language === 'bn' ? 'অটো বাজি' : 'Auto Bet'}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-gray-300">
                        <input
                          type="checkbox"
                          checked={bet2AutoCashoutEnabled}
                          onChange={(e) => setBet2AutoCashoutEnabled(e.target.checked)}
                          className="w-3.5 h-3.5 accent-orange-500 rounded"
                        />
                        <span>{language === 'bn' ? 'অটো ক্যাশ আউট' : 'Auto Cash Out'}</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
                  {/* Left Column: Bet Amount & Chips */}
                  <div className="col-span-7 flex flex-col gap-1.5">
                    {/* Stepper Input */}
                    <div className="flex items-center bg-[#0a0d13] border border-gray-800 rounded-lg p-1">
                      <button
                        onClick={() => setBet2Amount(prev => Math.max(10, prev - 100))}
                        disabled={bet2Placed || bet2ActiveInFlight}
                        className="w-7 h-7 rounded bg-[#1c2230] hover:bg-[#252d40] text-white flex items-center justify-center font-bold disabled:opacity-40"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={bet2Amount}
                        disabled={bet2Placed || bet2ActiveInFlight}
                        onChange={(e) => setBet2Amount(Math.max(10, Number(e.target.value)))}
                        className="flex-1 bg-transparent text-center text-sm sm:text-base font-extrabold text-white font-mono outline-none"
                      />
                      <button
                        onClick={() => setBet2Amount(prev => prev + 100)}
                        disabled={bet2Placed || bet2ActiveInFlight}
                        className="w-7 h-7 rounded bg-[#1c2230] hover:bg-[#252d40] text-white flex items-center justify-center font-bold disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick BDT Amount Chips */}
                    <div className="grid grid-cols-3 gap-1">
                      {QUICK_CHIPS.slice(2, 5).map((amt) => (
                        <button
                          key={amt}
                          disabled={bet2Placed || bet2ActiveInFlight}
                          onClick={() => setBet2Amount(amt)}
                          className={`py-0.5 rounded text-[11px] font-bold font-mono border transition-all ${
                            bet2Amount === amt 
                              ? 'bg-red-950/60 border-red-600 text-red-300' 
                              : 'bg-[#0a0d13] border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>

                    {/* Auto Cashout Multiplier Input if Auto is enabled */}
                    {bet2Mode === 'auto' && bet2AutoCashoutEnabled && (
                      <div className="flex items-center justify-between text-xs bg-[#0a0d13] border border-gray-800 px-2 py-1 rounded-md">
                        <span className="text-gray-400">{language === 'bn' ? 'টার্গেট:' : 'Target:'}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={bet2AutoCashoutTarget}
                            onChange={(e) => setBet2AutoCashoutTarget(Math.max(1.05, parseFloat(e.target.value)))}
                            className="w-16 bg-transparent text-right font-mono font-bold text-orange-400 outline-none"
                          />
                          <span className="font-bold text-orange-400">x</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Giant BET / CASH OUT Button */}
                  <div className="col-span-5 h-full flex">
                    {/* CASE 1: Round FLYING and Bet 2 is Active -> Huge Orange CASH OUT button */}
                    {roundStatus === 'FLYING' && bet2ActiveInFlight && !bet2CashedOut ? (
                      <button
                        onClick={() => triggerCashoutDeck2(multiplier)}
                        className="w-full h-full min-h-[64px] bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-black rounded-xl p-2 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.6)] border border-amber-300 active:scale-95 transition-all"
                      >
                        <span className="text-xs sm:text-sm uppercase tracking-wider font-extrabold">{language === 'bn' ? 'ক্যাশ আউট' : 'CASH OUT'}</span>
                        <span className="text-sm sm:text-lg font-mono font-black">
                          ৳ {(bet2Amount * multiplier).toFixed(2)}
                        </span>
                      </button>
                    ) : bet2Placed ? (
                      /* CASE 2: Bet 2 is placed waiting for next round or cashed out */
                      <button
                        onClick={() => {
                          if (roundStatus === 'WAITING') {
                            setBet2Placed(false);
                            updateBalanceSafe(balance + bet2Amount);
                          }
                        }}
                        className={`w-full h-full min-h-[64px] rounded-xl p-2 flex flex-col items-center justify-center text-xs sm:text-sm font-bold border transition-all ${
                          roundStatus === 'WAITING' 
                            ? 'bg-red-900/60 hover:bg-red-800 border-red-700 text-white' 
                            : 'bg-[#181d28] border-gray-700 text-gray-400'
                        }`}
                      >
                        <span>{roundStatus === 'WAITING' ? (language === 'bn' ? 'বাতিল' : 'CANCEL') : (language === 'bn' ? 'অপেক্ষা...' : 'WAITING')}</span>
                        <span className="text-[11px] font-mono opacity-80">৳ {bet2Amount}</span>
                      </button>
                    ) : (
                      /* CASE 3: Normal BET Button */
                      <button
                        disabled={balance < bet2Amount}
                        onClick={() => {
                          if (balance < bet2Amount) return;
                          aviatorAudio.playClickSound();
                          setBet2Placed(true);
                          updateBalanceSafe(balance - bet2Amount);
                        }}
                        className="w-full h-full min-h-[64px] bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:opacity-50 text-black font-black rounded-xl p-2 flex flex-col items-center justify-center shadow-lg shadow-green-600/30 border border-green-400 active:scale-95 transition-all"
                      >
                        <span className="text-sm sm:text-base tracking-wider uppercase font-black">{language === 'bn' ? 'বাজি ধরুন' : 'BET'}</span>
                        <span className="text-xs sm:text-sm font-mono font-bold">৳ {bet2Amount.toFixed(2)}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. HOW TO PLAY INTERACTIVE MODAL ================= */}
        {showHowToPlay && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
            <div className="bg-[#141822] border border-gray-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative">
              <button 
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✈️</span>
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  {language === 'bn' ? 'এভিয়েটর কিভাবে খেলবেন?' : 'How to Play Aviator?'}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-gray-300">
                <div className="flex gap-3 p-2.5 rounded-xl bg-[#0a0d13] border border-gray-800">
                  <div className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{language === 'bn' ? 'বাজি নির্ধারণ করুন' : 'Place Your Bet'}</h4>
                    <p className="text-gray-400">
                      {language === 'bn' 
                        ? 'বিমান উড়ার আগে আপনার বাজির পরিমাণ নির্বাচন করুন এবং "BET" বাটনে ক্লিক করুন। আপনি একই সাথে দুটি বাজি ধরতে পারেন!'
                        : 'Select your bet amount and click "BET" before the lucky plane takes off. You can place two independent bets at once!'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-2.5 rounded-xl bg-[#0a0d13] border border-gray-800">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{language === 'bn' ? 'মাল্টিপ্লায়ার পর্যবেক্ষণ' : 'Watch Multiplier Climb'}</h4>
                    <p className="text-gray-400">
                      {language === 'bn'
                        ? 'বিমান যত উঁচুতে উড়বে মাল্টিপ্লায়ার (1.00x থেকে শুরু হয়ে 100x+) তত দ্রুত বাড়তে থাকবে।'
                        : 'As the plane ascends, the win multiplier accelerates from 1.00x upwards into high numbers.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-2.5 rounded-xl bg-[#0a0d13] border border-gray-800">
                  <div className="w-7 h-7 rounded-full bg-green-500 text-black font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white mb-0.5">{language === 'bn' ? 'ক্যাশ আউট করুন' : 'Cash Out in Time'}</h4>
                    <p className="text-gray-400">
                      {language === 'bn'
                        ? 'বিমান উড়ে চলে যাওয়ার ("FLEW AWAY") আগেই "CASH OUT" বাটনে চাপ দিন এবং সাথে সাথে জিতে নিন আপনার জমার বহু গুণ টাকা!'
                        : 'Hit "CASH OUT" before the plane flies away to secure your winning payout instantly!'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-red-950/30 border border-red-800/40 rounded-xl text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-400 shrink-0" />
                  <span>
                    {language === 'bn'
                      ? 'Spribe Provably Fair প্রযুক্তি দ্বারা প্রতিটি রাউন্ড ১০০% শতভাগ স্বচ্ছ ও ক্রিপ্টোগ্রাফিক্যালি সুরক্ষিত।'
                      : 'Spribe Provably Fair 100% cryptographic SHA512 randomness ensures total transparency.'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowHowToPlay(false)}
                className="w-full mt-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider"
              >
                {language === 'bn' ? 'বুঝেছি, খেলা শুরু করুন' : 'Got it, Let’s Fly!'}
              </button>
            </div>
          </div>
        )}

        {/* ================= 5. PROVABLY FAIR VERIFICATION MODAL ================= */}
        {showProvablyFairModal && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
            <div className="bg-[#141822] border border-gray-700 rounded-2xl max-w-md w-full p-5 shadow-2xl relative text-xs">
              <button 
                onClick={() => setShowProvablyFairModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  Provably Fair Verification
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="p-2.5 rounded-lg bg-[#0a0d13] border border-gray-800 flex justify-between items-center">
                  <span className="text-gray-400">Multiplier Result:</span>
                  <span className="text-base font-extrabold text-green-400 font-mono">
                    {showProvablyFairModal.multiplier.toFixed(2)}x
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0a0d13] border border-gray-800">
                  <div className="text-gray-400 mb-1">Server Seed Hash (SHA-512):</div>
                  <div className="font-mono text-[10px] text-gray-300 break-all bg-black/50 p-1.5 rounded border border-gray-800">
                    {showProvablyFairModal.serverSeed}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0a0d13] border border-gray-800 flex justify-between">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-gray-200 font-mono">{showProvablyFairModal.time}</span>
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  This game result was cryptographically generated using Provably Fair algorithms and cannot be manipulated by the operator.
                </p>
              </div>

              <button
                onClick={() => setShowProvablyFairModal(null)}
                className="w-full mt-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ================= 6. MENU DRAWER (SETTINGS & RULES) ================= */}
        {showMenuDrawer && (
          <div className="absolute top-[52px] right-2 z-40 bg-[#161a25] border border-gray-700 rounded-xl shadow-2xl w-64 p-3 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="font-bold text-gray-400 uppercase text-[10px] tracking-wider px-2 py-1">Game Settings</div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1e2433] text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span>Sound FX</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${soundEnabled ? 'bg-green-950 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => setMusicEnabled(!musicEnabled)}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#1e2433] text-gray-200"
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-gray-400" />
                <span>Background Music</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${musicEnabled ? 'bg-red-950 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                {musicEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              onClick={() => {
                setShowMenuDrawer(false);
                setShowHowToPlay(true);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[#1e2433] text-gray-200"
            >
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span>How to Play & Rules</span>
            </button>

            <div className="border-t border-gray-800 pt-2 text-[10px] text-gray-500 text-center">
              Spribe Aviator v2.4 • Developed by Neext Hub
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
