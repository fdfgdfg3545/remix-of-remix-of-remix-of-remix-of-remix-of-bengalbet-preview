// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  Zap,
  RotateCw,
  Sparkles,
  Flame,
  Plus,
  Minus,
  X,
  Tv
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { CircusCell, CircusSymbolType, CIRCUS_PAYTABLE } from './circusTypes';
import { circusAudio } from './circusAudio';
import circusIcon from '../../assets/images/circus_joker_icon_1789330788237.jpg';
import { gameEngine } from '../../services/gameEngine';

interface Props {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const REELS = 6;
const ROWS = 4;
const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];
const WHEEL_MULTIPLIERS = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

const REGULAR_SYMBOLS: CircusSymbolType[] = [
  'ten', 'ten', 'ten',
  'jack', 'jack', 'jack',
  'queen', 'queen',
  'king', 'king',
  'ace', 'ace',
  'popcorn', 'popcorn',
  'pins',
  'hat',
  'lion',
  'ringmaster'
];

function getRandomCell(colIndex: number): CircusCell {
  // Scatter chance
  if (Math.random() < 0.04) {
    return {
      id: Math.random().toString(36).substring(2, 8),
      type: 'scatter'
    };
  }

  // Wild on reels 2 to 6
  if (colIndex >= 1 && Math.random() < 0.08) {
    return {
      id: Math.random().toString(36).substring(2, 8),
      type: 'wild'
    };
  }

  const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
  return {
    id: Math.random().toString(36).substring(2, 8),
    type
  };
}

function generateInitialGrid(): CircusCell[][] {
  const grid: CircusCell[][] = [];
  for (let c = 0; c < REELS; c++) {
    const col: CircusCell[] = [];
    for (let r = 0; r < ROWS; r++) {
      col.push(getRandomCell(c));
    }
    grid.push(col);
  }
  return grid;
}

export const CircusJokerGame: React.FC<Props> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const [balance, setBalance] = useState<number>(user.balance);
  const [betIndex, setBetIndex] = useState<number>(2); // 50 BDT
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [grid, setGrid] = useState<CircusCell[][]>(() => generateInitialGrid());
  const [wheelIndex, setWheelIndex] = useState<number>(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'সার্কাস জোকার ৪০৯৬-এ স্বাগতম!' : 'Welcome to Circus Joker 4096!'
  );
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showBigWin, setShowBigWin] = useState<boolean>(false);

  const currentBet = BET_OPTIONS[betIndex];
  const activeMultiplier = WHEEL_MULTIPLIERS[wheelIndex];

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    circusAudio.enabled = next;
  };

  const changeBet = (delta: number) => {
    if (isSpinning) return;
    const next = Math.max(0, Math.min(BET_OPTIONS.length - 1, betIndex + delta));
    setBetIndex(next);
  };

  // Spin Multiplier Wheel animation
  const spinWheel = async (targetIdx: number) => {
    setIsWheelSpinning(true);
    let current = 0;
    const totalSteps = 12 + targetIdx;
    for (let i = 0; i < totalSteps; i++) {
      current = (current + 1) % WHEEL_MULTIPLIERS.length;
      setWheelIndex(current);
      circusAudio.playWheelTick();
      await new Promise(r => setTimeout(r, 40 + i * 15));
    }
    setWheelIndex(targetIdx);
    setIsWheelSpinning(false);
  };

  // Main spin handler
  const handleSpin = async (isBuyFeature = false) => {
    if (isSpinning) return;

    let cost = 0;
    if (isBuyFeature) {
      cost = currentBet * 50;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'ফিচার কেনার পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient Balance for Feature Buy!');
        return;
      }
      updateBalance(balance - cost);
    } else if (!isFreeSpinsActive) {
      cost = currentBet;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করুন।' : 'Insufficient Balance! Please deposit.');
        setIsAutoSpin(false);
        return;
      }
      updateBalance(balance - cost);
    }

    setIsSpinning(true);
    setRoundWin(0);
    circusAudio.playClack();

    if (isBuyFeature) {
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(10);
      setWheelIndex(1); // 2X start
      setStatusMessage(language === 'bn' ? '🎪 ১০টি সার্কাস ফ্রি স্পিন শুরু!' : '🎪 10 CIRCUS FREE SPINS ACTIVATED!');
    }

    const newGrid = generateInitialGrid();
    setGrid(newGrid);

    // Check scatters
    let scatterCount = 0;
    let hasJoker = false;
    newGrid.forEach(col => col.forEach(c => {
      if (c.type === 'scatter') scatterCount++;
      if (c.type === 'wild') hasJoker = true;
    }));

    if (hasJoker) {
      circusAudio.playJokerLaugh();
    }

    if (scatterCount >= 3) {
      if (!isFreeSpinsActive && !isBuyFeature) {
        setIsFreeSpinsActive(true);
        setFreeSpinsLeft(10);
        setStatusMessage(
          language === 'bn'
            ? `🎪 ${scatterCount}টি তাঁবু স্ক্যাটার! ১০টি ফ্রি স্পিন লাভ!`
            : `🎪 ${scatterCount} SCATTERS! 10 Free Spins Won!`
        );
      } else if (isFreeSpinsActive) {
        setFreeSpinsLeft(prev => prev + 5);
      }
    }

    // Evaluate 4,096 Ways to win (adjacent matching from left to right)
    const candidateSymbols = Object.keys(CIRCUS_PAYTABLE).filter(
      k => k !== 'wild' && k !== 'scatter'
    ) as CircusSymbolType[];

    let baseWin = 0;
    const winningIds = new Set<string>();

    for (const sym of candidateSymbols) {
      const matchCountsPerReel: number[] = [];
      const matchedIdsPerReel: string[][] = [];

      for (let col = 0; col < REELS; col++) {
        const matchingCells: CircusCell[] = [];
        newGrid[col].forEach(cell => {
          if (cell.type === sym || cell.type === 'wild') {
            matchingCells.push(cell);
          }
        });

        if (matchingCells.length > 0) {
          matchCountsPerReel.push(matchingCells.length);
          matchedIdsPerReel.push(matchingCells.map(c => c.id));
        } else {
          break; // Must be consecutive from reel 0
        }
      }

      const matchLength = matchCountsPerReel.length;
      if (matchLength >= 3) {
        const ways = matchCountsPerReel.reduce((acc, c) => acc * c, 1);
        const payoutUnit = CIRCUS_PAYTABLE[sym].payouts[matchLength - 3] || 1;
        const lineWin = Math.round((currentBet * payoutUnit * ways) / 30);
        baseWin += lineWin;
        matchedIdsPerReel.forEach(ids => ids.forEach(id => winningIds.add(id)));
      }
    }

    if (baseWin > 0) {
      // Pick multiplier from wheel
      const targetWheelIdx = Math.floor(Math.random() * (isFreeSpinsActive ? 7 : 5)) + 1; // 2x to 64x
      await spinWheel(targetWheelIdx);

      const finalMult = WHEEL_MULTIPLIERS[targetWheelIdx];
      const finalRoundWin = baseWin * finalMult;

      circusAudio.playWinChime(finalMult);

      // Highlight winning symbols
      const highlighted = newGrid.map(col =>
        col.map(cell => (winningIds.has(cell.id) ? { ...cell, isWinning: true } : cell))
      );
      setGrid(highlighted);

      setLastWin(finalRoundWin);
      setRoundWin(finalRoundWin);
      updateBalance(balance + finalRoundWin);
      gameEngine.recordRound(cost, finalRoundWin, {
        gameId: 'game-circus-joker',
        gameName: 'Circus Joker 4096',
        category: 'slot',
        vendor: 'JILI'
      });

      if (finalRoundWin >= currentBet * 12) {
        setShowBigWin(true);
        confetti({ particleCount: 85, spread: 85, origin: { y: 0.6 } });
        setTimeout(() => setShowBigWin(false), 2600);
      }

      setStatusMessage(
        language === 'bn'
          ? `🎪 সার্কাস জয়: ৳ ${finalRoundWin.toLocaleString()}! (${finalMult}X মাল্টিপ্লায়ার)`
          : `🎪 CIRCUS 4096 WIN: ৳ ${finalRoundWin.toLocaleString()}! (${finalMult}X Wheel Multiplier)`
      );
    } else {
      if (!isFreeSpinsActive) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-circus-joker',
          gameName: 'Circus Joker 4096',
          category: 'slot',
          vendor: 'JILI'
        });
        setWheelIndex(0); // reset to 1x
      }
      setStatusMessage(language === 'bn' ? 'স্পিন করুন ও জোকার হুইল ঘুরান!' : 'Spin for the 4096 Ways & Multiplier Wheel!');
    }

    // Free Spins counter decrement
    if (isFreeSpinsActive && freeSpinsLeft > 0) {
      setFreeSpinsLeft(prev => {
        const next = prev - 1;
        if (next === 0) {
          setIsFreeSpinsActive(false);
          setWheelIndex(0);
          setStatusMessage(language === 'bn' ? 'ফ্রি স্পিন সমাপ্ত!' : 'Circus Free Spins Completed!');
        }
        return next;
      });
    }

    setIsSpinning(false);
  };

  // Auto-spin timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning) {
      if (freeSpinsLeft > 0) {
        timer = setTimeout(() => handleSpin(false), isTurbo ? 400 : 800);
      } else if (autoSpinsLeft > 0) {
        timer = setTimeout(() => {
          setAutoSpinsLeft(prev => prev - 1);
          handleSpin(false);
        }, isTurbo ? 500 : 1000);
      } else {
        setIsAutoSpin(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, autoSpinsLeft, freeSpinsLeft]);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#240a17] via-[#330f21] to-[#12040b] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      
      {/* 1. HEADER BAR */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#2b0c1c]/95 border-b border-rose-500/40 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-xs font-bold transition-all active:scale-95"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবি' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={circusIcon}
              alt="Circus Joker 4096"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-300 to-amber-400">
                  {language === 'bn' ? 'সার্কাস জোকার ৪০৯৬' : 'Circus Joker 4096'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  JILI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live BDT Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#17050e] border border-rose-400/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-rose-300 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowVideo(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-300 border border-red-500/30 text-xs font-bold transition-all"
            title="YouTube Video Guide"
          >
            <Tv className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowPaytable(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-rose-900/40 hover:bg-rose-800/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all ${
              isSoundOn
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. GAME STAGE */}
      <div className="relative flex-1 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/40 via-[#220917] to-[#0c0308]">
        
        {/* Top Status Banner */}
        <div className="w-full max-w-3xl flex items-center justify-between gap-2 px-2.5 py-1.5 bg-black/60 rounded-xl border border-rose-500/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 truncate">
            {isFreeSpinsActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs animate-pulse shadow-md">
                🎪 FREE SPINS: {freeSpinsLeft}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-rose-500/30 text-rose-200 font-bold text-[11px] border border-rose-400/40">
                4,096 WAYS TO WIN
              </span>
            )}
            <span className="text-xs text-yellow-200 font-bold truncate">{statusMessage}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 text-black font-black text-xs shadow-md shrink-0">
            <Flame className="w-3.5 h-3.5" />
            <span>WHEEL: {activeMultiplier}X</span>
          </div>
        </div>

        {/* CABINET WITH MULTIPLIER WHEEL */}
        <div className="relative w-full max-w-3xl flex-1 max-h-[58vh] sm:max-h-[62vh] my-1 p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#380e25] via-[#240817] to-[#14040c] border-2 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.3)] flex flex-col sm:flex-row gap-2 justify-between">
          
          {/* Main 6x4 Grid */}
          <div className="grid grid-cols-6 gap-1 sm:gap-1.5 flex-1 w-full">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1 sm:gap-1.5 h-full justify-between">
                {col.map((cell) => {
                  const payDef = CIRCUS_PAYTABLE[cell.type];
                  return (
                    <div
                      key={cell.id}
                      className={`relative flex-1 rounded-xl flex items-center justify-center p-1 transition-all duration-200 shadow-md ${
                        cell.isWinning
                          ? 'ring-2 ring-yellow-300 scale-105 z-10 bg-yellow-400/40 animate-pulse'
                          : cell.type === 'wild'
                          ? 'border-2 border-amber-300 bg-gradient-to-b from-amber-500 via-rose-600 to-purple-800 shadow-[0_0_15px_rgba(245,158,11,0.8)]'
                          : cell.type === 'scatter'
                          ? 'border-2 border-yellow-300 bg-gradient-to-b from-red-600 to-amber-700 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                          : `bg-gradient-to-b ${payDef.bgGrad} border border-white/10`
                      }`}
                    >
                      <span className="text-xl sm:text-2xl filter drop-shadow-md select-none">
                        {payDef.emoji}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* MULTIPLIER WHEEL STRIP (Right sidebar on desktop, bottom strip on mobile) */}
          <div className="sm:w-28 flex sm:flex-col items-center justify-between p-2 rounded-xl bg-black/60 border border-rose-500/40 overflow-hidden shrink-0">
            <div className="text-[10px] sm:text-xs font-black text-rose-300 uppercase tracking-wider text-center mb-1 hidden sm:block">
              WHEEL
            </div>
            <div className="flex sm:flex-col gap-1 w-full overflow-x-auto sm:overflow-y-hidden justify-center items-center py-1 sm:py-0">
              {WHEEL_MULTIPLIERS.slice(0, 8).map((m, idx) => (
                <div
                  key={m}
                  className={`px-2 py-0.5 sm:py-1 rounded-lg text-center font-black text-[10px] sm:text-xs transition-all w-full ${
                    wheelIndex === idx
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-[0_0_12px_rgba(250,204,21,0.9)] scale-105 ring-2 ring-white'
                      : 'bg-rose-950/40 text-rose-200/60 border border-rose-500/20'
                  }`}
                >
                  {m}X
                </div>
              ))}
            </div>
          </div>

          {/* Win Ticker */}
          {roundWin > 0 && (
            <div className="absolute inset-x-4 bottom-2 py-1 px-3 bg-black/85 rounded-xl border border-yellow-400/80 flex items-center justify-between text-xs font-bold text-yellow-300 shadow-2xl animate-in fade-in z-20">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{language === 'bn' ? 'সার্কাস জয়!' : 'CIRCUS 4096 WIN!'}</span>
              </span>
              <span className="font-black text-emerald-400">+৳ {roundWin.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 3. CONTROL PANEL */}
        <div className="w-full max-w-3xl bg-[#2b0c1c]/95 border border-rose-500/40 rounded-2xl p-2 sm:p-3 shadow-xl flex flex-col gap-2 shrink-0">
          
          {/* Feature Buy Bar */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-rose-200/80 font-bold">
              {language === 'bn' ? '৪,০৯৬ ওয়েস টু উইন | জোকার ওয়াইল্ডস' : '4,096 Ways | Joker Wilds on Reels 2-6'}
            </span>

            <button
              onClick={() => !isSpinning && handleSpin(true)}
              disabled={isSpinning || isFreeSpinsActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 border border-yellow-300 text-black font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{language === 'bn' ? `ফ্রি স্পিন কিনুন (৳ ${(currentBet * 50).toLocaleString()})` : `BUY BONUS (৳ ${(currentBet * 50).toLocaleString()})`}</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Bet Step */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-rose-500/30">
              <button
                onClick={() => changeBet(-1)}
                disabled={isSpinning || betIndex === 0}
                className="w-8 h-8 rounded-lg bg-rose-950/60 hover:bg-rose-800 text-rose-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-2 text-center min-w-[70px]">
                <div className="text-[9px] text-rose-300 font-bold uppercase">{language === 'bn' ? 'বাজি' : 'Bet'}</div>
                <div className="text-sm font-black text-yellow-300">৳ {currentBet}</div>
              </div>
              <button
                onClick={() => changeBet(1)}
                disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
                className="w-8 h-8 rounded-lg bg-rose-950/60 hover:bg-rose-800 text-rose-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick chips */}
            <div className="hidden sm:flex items-center gap-1">
              {[20, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    const idx = BET_OPTIONS.indexOf(amt);
                    if (idx !== -1 && !isSpinning) setBetIndex(idx);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                    BET_OPTIONS[betIndex] === amt
                      ? 'bg-yellow-400 text-black border-yellow-300 font-black'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-200 hover:bg-rose-900/50'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Turbo */}
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isTurbo
                  ? 'bg-amber-500 text-black border-yellow-200 font-black shadow-md'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Turbo</span>
            </button>

            {/* Auto */}
            <button
              onClick={() => {
                if (isAutoSpin) {
                  setIsAutoSpin(false);
                  setAutoSpinsLeft(0);
                } else {
                  setIsAutoSpin(true);
                  setAutoSpinsLeft(20);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isAutoSpin
                  ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
                  : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              <span>{isAutoSpin ? `${autoSpinsLeft}` : 'Auto'}</span>
            </button>

            {/* Spin Button */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-300 to-rose-500 hover:from-yellow-300 hover:to-rose-400 text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(244,63,94,0.6)] border-2 border-yellow-200 active:scale-95 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>{isSpinning ? '...' : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BIG WIN MODAL */}
      {showBigWin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs animate-in zoom-in-95">
          <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-yellow-500 via-rose-600 to-amber-950 border-4 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.9)] max-w-sm">
            <h2 className="text-3xl font-black text-yellow-200 animate-bounce tracking-widest drop-shadow-md">
              🎪 CIRCUS MEGA WIN! 🎪
            </h2>
            <div className="my-4 text-4xl sm:text-5xl font-black text-white font-game drop-shadow-lg">
              ৳ {lastWin.toLocaleString()}
            </div>
            <p className="text-sm font-bold text-yellow-200">
              {language === 'bn' ? 'সার্কাস জোকারের বিশাল জয়!' : 'Circus Joker 4096 Win!'}
            </p>
          </div>
        </div>
      )}

      {/* 5. PAYTABLE MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-lg bg-[#270b1b] border-2 border-rose-400 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/40">
              <div className="flex items-center gap-2">
                <img
                  src={circusIcon}
                  alt="Circus Joker 4096"
                  className="w-7 h-7 rounded-md object-cover"
                />
                <h3 className="font-game text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'সার্কাস জোকার পে-টেবিল' : 'Circus Joker Paytable'}
                </h3>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-lg bg-rose-900/60 text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '🎪 ৪,০৯৬ ওয়েস টু উইন' : '🎪 4,096 Ways to Win'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? '১ম রিল থেকে শুরু করে পাশাপাশি রিলে ৩ বা ততোধিক প্রতীক পেলেই জয় হয়। জোকার প্রতীক যেকোনো সাধারণ প্রতীকের বিকল্প হিসেবে কাজ করে।'
                    : 'Matching 3 or more symbols on adjacent reels starting from Reel 1 awards a win across 4,096 combinations.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '🎡 মাল্টিপ্লায়ার হুইল (১X - ৪০৯৬X)' : '🎡 Multiplier Wheel (1X - 4096X)'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'প্রতিটি জয়ে মাল্টিপ্লায়ার হুইল ঘোরে এবং ১X থেকে ৪০৯৬X পর্যন্ত গুণিতক পুরস্কার প্রদান করে!'
                    : 'On every winning spin, the Multiplier Wheel spins and awards up to 4,096X on top of line pays!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(CIRCUS_PAYTABLE).filter(s => s.type !== 'wild' && s.type !== 'scatter').map(s => (
                  <div key={s.type} className="p-2 rounded-lg bg-black/40 border border-rose-500/20 flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-rose-200">{language === 'bn' ? s.nameBn : s.name}</div>
                      <div className="text-[10px] text-gray-400">
                        3x: {s.payouts[0]} | 4x: {s.payouts[1]} | 5x: {s.payouts[2]} | 6x: {s.payouts[3]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. YOUTUBE WALKTHROUGH VIDEO MODAL */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-2xl bg-[#1f0714] border-2 border-rose-400 rounded-2xl p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/40 mb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                <h3 className="font-game text-base sm:text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'সার্কাস জোকার ৪০৯৬ গেমপ্লে ওয়াকথ্রু' : 'Circus Joker 4096 Gameplay Walkthrough'}
                </h3>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1 rounded-lg bg-rose-900/60 text-rose-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-rose-500/30">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/videoseries?list=PL_fake_circus"
                title="Circus Joker 4096 Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-xs text-rose-200/80 text-center">
              {language === 'bn'
                ? 'ভিডিওতে দেখুন কীভাবে ৪০৯৬ ওয়েস এবং মাল্টিপ্লায়ার হুইল বিশাল জ্যাকপট দেয়!'
                : 'Watch how 4,096 ways and the multiplier wheel spin to award mega jackpot multipliers!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
