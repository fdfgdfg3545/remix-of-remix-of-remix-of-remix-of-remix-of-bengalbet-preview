// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Zap, 
  HelpCircle, 
  Play, 
  Sparkles, 
  Flame, 
  Award,
  DollarSign,
  Youtube,
  Key,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { 
  AlibabaCell, 
  AlibabaWinWay, 
  ALIBABA_COLS, 
  ALIBABA_ROWS,
  YOUTUBE_VIDEO_ALIBABA 
} from './alibabaTypes';
import { 
  createInitialAlibabaGrid, 
  generateAlibabaSpinGrid, 
  evaluateAlibabaWaysWins, 
  cascadeAlibabaGrid, 
  countAlibabaScatters,
  countAlibabaBonusUrns
} from './alibabaEngine';
import { alibabaAudio } from './alibabaAudio';
import { AlibabaSymbolView } from './AlibabaSymbolView';
import { AlibabaCaveBonusModal } from './AlibabaCaveBonusModal';
import { AlibabaPaytableModal } from './AlibabaPaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface AlibabaGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const AlibabaGame: React.FC<AlibabaGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  // Balance & Betting
  const balance = user?.balance ?? 5000;
  const [bet, setBet] = useState<number>(20);

  // Reel Grid & Animation State
  const [grid, setGrid] = useState<AlibabaCell[][]>(() => createInitialAlibabaGrid());
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);

  // Progressive Multiplier (1X, 2X, 3X, 5X, 10X in base; 3X, 6X, 9X, 15X, 30X in Free Spins)
  const [multiplier, setMultiplier] = useState<number>(1);
  const [lastSpinWin, setLastSpinWin] = useState<number>(0);
  const [roundTotalWin, setRoundTotalWin] = useState<number>(0);
  const [winningWays, setWinningWays] = useState<AlibabaWinWay[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Free Spins State
  const [isFreeSpinsMode, setIsFreeSpinsMode] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);

  // Cave Bonus Urn Pick State
  const [showCaveBonus, setShowCaveBonus] = useState<boolean>(false);

  // Modals & Controls
  const [isMuted, setIsMuted] = useState<boolean>(alibabaAudio.getMuted());
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showBigWinModal, setShowBigWinModal] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number>(0);

  const BET_PRESETS = [10, 20, 50, 100, 200, 500];

  const toggleSound = () => {
    const muted = alibabaAudio.toggleMute();
    setIsMuted(muted);
  };

  const getMultiplierLadder = () => {
    return isFreeSpinsMode ? [3, 6, 9, 15, 30] : [1, 2, 3, 5, 10];
  };

  const handleSpin = async (customBet?: number, triggerBonus: boolean = false) => {
    const activeBet = customBet ?? bet;
    const isFree = isFreeSpinsMode && freeSpinsRemaining > 0;

    if (!isFree && !triggerBonus && balance < activeBet) {
      setStatusMessage(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient Balance!');
      setIsAutoSpin(false);
      return;
    }

    if (!isFree && triggerBonus && balance < activeBet * 75) {
      setStatusMessage(language === 'bn' ? 'বোনাস ক্রয়ের জন্য অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient balance for Buy Feature!');
      return;
    }

    setIsSpinning(true);
    setStatusMessage('');
    setWinningWays([]);
    setLastSpinWin(0);

    // Deduct balance
    const cost = triggerBonus ? activeBet * 75 : activeBet;
    if (!isFree) {
      onUpdateBalance(balance - cost);
    }

    alibabaAudio.playSpin();

    const ladder = isFree ? [3, 6, 9, 15, 30] : [1, 2, 3, 5, 10];
    let multStep = 0;
    setMultiplier(ladder[multStep]);

    // Reel spin animation
    setSpinningCols([true, true, true, true, true]);
    const spinDelay = isTurbo ? 200 : 400;

    for (let c = 0; c < ALIBABA_COLS; c++) {
      await new Promise(r => setTimeout(r, spinDelay / 3));
      alibabaAudio.playReelStop(c);
      setSpinningCols(prev => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
    }

    // Generate outcome grid
    let currentGrid = generateAlibabaSpinGrid(isFree || triggerBonus);

    // If Buy Feature was activated, ensure at least 3 scatters
    if (triggerBonus) {
      currentGrid[0][1].type = 'scatter';
      currentGrid[2][2].type = 'scatter';
      currentGrid[4][1].type = 'scatter';
    }

    setGrid(currentGrid);

    // Check for Scatters
    const scatterCount = countAlibabaScatters(currentGrid);
    if (scatterCount >= 3) {
      alibabaAudio.playScatterHit();
    }

    // Check for Cave Bonus Urns
    const urnCount = countAlibabaBonusUrns(currentGrid);

    // Cascading sequence with progressive multiplier
    let roundWin = 0;
    let keepCascading = true;

    while (keepCascading) {
      const { wins, totalPayout } = evaluateAlibabaWaysWins(currentGrid, activeBet);

      if (wins.length > 0) {
        const currentMult = ladder[Math.min(multStep, ladder.length - 1)];
        const cascadeWin = totalPayout * currentMult;
        roundWin += cascadeWin;

        setWinningWays(wins);
        setLastSpinWin(roundWin);
        alibabaAudio.playCascadeWin();

        // Highlight winning cells
        const winningCoords: { col: number; row: number }[] = [];
        wins.forEach(w => winningCoords.push(...w.coordinates));

        // Advance multiplier ladder
        multStep = Math.min(multStep + 1, ladder.length - 1);
        setMultiplier(ladder[multStep]);
        alibabaAudio.playMultiplierUpgrade(ladder[multStep]);

        await new Promise(r => setTimeout(r, isTurbo ? 350 : 700));

        // Cascade down and refill
        const { nextGrid } = cascadeAlibabaGrid(currentGrid, winningCoords);
        currentGrid = nextGrid;
        setGrid(currentGrid);

        await new Promise(r => setTimeout(r, isTurbo ? 250 : 500));
      } else {
        keepCascading = false;
      }
    }

    // Payout if any win
    if (roundWin > 0) {
      onUpdateBalance(balance + roundWin);
      setRoundTotalWin(prev => prev + roundWin);

      if (!isFree) {
        gameEngine.recordRound(cost, roundWin, {
          gameId: 'game-alibaba',
          gameName: "Alibaba's Cave of Fortune",
          category: 'slot',
          vendor: 'JDB'
        });
      }

      if (roundWin >= activeBet * 15) {
        setBigWinAmount(roundWin);
        setShowBigWinModal(true);
        alibabaAudio.playBigWin();
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } else {
      if (!isFree && urnCount < 3) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-alibaba',
          gameName: "Alibaba's Cave of Fortune",
          category: 'slot',
          vendor: 'JDB'
        });
      }
    }

    setIsSpinning(false);

    // Handle Urn Bonus Game trigger
    if (urnCount >= 3) {
      setTimeout(() => {
        setShowCaveBonus(true);
      }, 500);
      return;
    }

    // Handle Free Spins trigger
    if (scatterCount >= 3 && !isFreeSpinsMode) {
      alibabaAudio.playOpenSesameFanfare();
      confetti({ particleCount: 90, spread: 75 });
      setIsFreeSpinsMode(true);
      setFreeSpinsRemaining(10);
      setFreeSpinsTotalWon(roundWin);
      setStatusMessage(language === 'bn' ? '🎉 ওপেন সিসিম! ১০টি ফ্রি স্পিন শুরু!' : '🎉 Open Sesame! 10 Free Spins Activated!');
      return;
    }

    // Handle ongoing Free Spins count down
    if (isFreeSpinsMode) {
      setFreeSpinsTotalWon(prev => prev + roundWin);
      const remaining = freeSpinsRemaining - 1;
      setFreeSpinsRemaining(remaining);

      if (remaining <= 0) {
        setIsFreeSpinsMode(false);
        setStatusMessage(
          language === 'bn'
            ? `ফ্রি স্পিন সমাপ্ত! মোট জয়: ৳${(freeSpinsTotalWon + roundWin).toLocaleString()}`
            : `Free Spins Complete! Total Won: ৳${(freeSpinsTotalWon + roundWin).toLocaleString()}`
        );
      }
    }
  };

  // Handle Cave Urn bonus completion
  const handleCaveBonusComplete = (wonCash: number) => {
    setShowCaveBonus(false);
    onUpdateBalance(balance + wonCash);
    setLastSpinWin(wonCash);
    setRoundTotalWin(prev => prev + wonCash);
    gameEngine.recordRound(bet, wonCash, {
      gameId: 'game-alibaba',
      gameName: "Alibaba's Cave Bonus",
      category: 'slot',
      vendor: 'JDB'
    });
    setStatusMessage(
      language === 'bn'
        ? `গুহার গুপ্তধন থেকে ৳${wonCash.toLocaleString()} জিতেছেন!`
        : `Revealed ৳${wonCash.toLocaleString()} from the 40 Thieves cave!`
    );
  };

  // Auto-spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning && !showCaveBonus && !showBigWinModal) {
      timer = setTimeout(() => {
        if (balance >= bet || (isFreeSpinsMode && freeSpinsRemaining > 0)) {
          handleSpin();
        } else {
          setIsAutoSpin(false);
        }
      }, isTurbo ? 600 : 1200);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, balance, bet, isFreeSpinsMode, freeSpinsRemaining, showCaveBonus, showBigWinModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-1 md:p-4 overflow-y-auto">
      {/* Game Outer Shell */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#1a0f30] via-[#100922] to-[#080412] border-2 border-amber-400/80 rounded-2xl md:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-gradient-to-r from-purple-950 via-[#1e1038] to-purple-950 border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow">
              <span className="text-lg">🪔</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {language === 'bn' ? "আলিবাবা'স কেভ অফ ফরচুন" : "Alibaba's Cave of Fortune"}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-yellow-300 border border-amber-400/30">
                  PG Soft
                </span>
              </div>
              <p className="text-[10px] text-amber-200/70 hidden sm:block">
                1024 Ways • Open Sesame • Cave Treasure Urns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Watch Gameplay Video Button */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Watch Gameplay Video on YouTube"
            >
              <Youtube className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ভিডিও দেখুন' : 'Watch Gameplay'}</span>
            </button>

            {/* Paytable */}
            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition-all"
              title="Paytable & Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-amber-300 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Spins Banner (if active) */}
        {isFreeSpinsMode && (
          <div className="bg-gradient-to-r from-red-700 via-amber-600 to-red-700 py-1.5 px-4 flex items-center justify-between text-xs font-black tracking-wider text-yellow-200 shadow-md">
            <span className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-yellow-200 animate-spin" />
              {language === 'bn' ? 'ওপেন সিসিম ফ্রি স্পিন চলছে' : 'OPEN SESAME FREE SPINS ACTIVE'}
            </span>
            <span>
              {language === 'bn' ? 'বাকি স্পিন:' : 'Spins Left:'} <span className="text-base text-white underline">{freeSpinsRemaining}</span>
            </span>
          </div>
        )}

        {/* Cave Multiplier Ladder Bar */}
        <div className="bg-gradient-to-r from-[#1c0e35] via-[#2d1252] to-[#1c0e35] py-2 px-3 md:px-6 border-b border-amber-500/30 flex items-center justify-between gap-1 md:gap-3">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest hidden sm:inline">
            {language === 'bn' ? 'গুহার মাল্টিপ্লায়ার:' : 'Cave Multiplier:'}
          </span>
          <div className="flex-1 flex items-center justify-around gap-1 md:gap-2">
            {getMultiplierLadder().map((val, idx) => {
              const isActive = multiplier === val;
              return (
                <div
                  key={idx}
                  className={`flex-1 py-1 rounded-lg text-center font-black transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-slate-950 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.9)] border border-yellow-100'
                      : 'bg-slate-900/60 text-amber-200/50 border border-amber-500/20 text-xs'
                  }`}
                >
                  <span className="text-xs md:text-sm">{val}X</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5x4 Slot Grid */}
        <div className="relative p-2 md:p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2a134d] via-[#150a29] to-[#0b0517] flex-1 flex items-center justify-center">
          
          {/* Status Message Overlay */}
          {statusMessage && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-amber-950/90 border border-yellow-400 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-bounce">
              {statusMessage}
            </div>
          )}

          {/* Slot Reels Container */}
          <div className="w-full max-w-2xl bg-black/60 p-2 md:p-3 rounded-2xl border border-amber-500/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {grid.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5 md:gap-2">
                  {col.map((cell, rowIdx) => {
                    const isWinning = winningWays.some(w =>
                      w.coordinates.some(coord => coord.col === colIdx && coord.row === rowIdx)
                    );
                    return (
                      <div key={cell.id} className="h-16 sm:h-20 md:h-24">
                        <AlibabaSymbolView
                          cell={cell}
                          isWinning={isWinning}
                          isSpinning={spinningCols[colIdx]}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Control Dashboard */}
        <div className="bg-gradient-to-b from-[#180d2e] to-[#0e071c] p-3 md:p-4 border-t border-amber-500/30 flex flex-col gap-3">
          
          {/* Win & Balance Bar */}
          <div className="flex items-center justify-between text-xs md:text-sm font-bold px-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-200/70">{language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'}</span>
              <span className="text-yellow-300 text-sm md:text-base font-black">
                ৳{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-200/70">{language === 'bn' ? 'শেষ জয়:' : 'Win:'}</span>
              <span className="text-emerald-400 text-sm md:text-base font-black">
                ৳{lastSpinWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Bet Chips & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Bet Presets */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] text-amber-200/60 font-bold uppercase mr-1">
                {language === 'bn' ? 'বাজি:' : 'Bet:'}
              </span>
              {BET_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBet(preset)}
                  disabled={isSpinning || isFreeSpinsMode}
                  className={`px-2 py-1 rounded-lg text-xs font-black transition-all ${
                    bet === preset
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-amber-200 border border-amber-500/20'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>

            {/* Buy Feature Button (75X) */}
            <button
              onClick={() => handleSpin(bet, true)}
              disabled={isSpinning || isFreeSpinsMode}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:brightness-110 active:scale-95 text-yellow-200 border border-purple-400 text-xs font-black shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'ফিচার কিনুন' : 'Buy Feature'}</span>
              <span className="text-[10px] text-yellow-300 font-normal">({bet * 75}৳)</span>
            </button>
          </div>

          {/* Main Action Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-500/20">
            {/* Turbo Toggle */}
            <button
              onClick={() => setIsTurbo(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isTurbo
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-amber-200 border border-amber-500/20'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'fill-current' : ''}`} />
              <span>{language === 'bn' ? 'টার্বো' : 'Turbo'}</span>
            </button>

            {/* Big Spin Button */}
            <button
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className="flex-1 max-w-xs py-3 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-600 text-slate-950 font-black text-base md:text-lg shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-yellow-200"
            >
              <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? (language === 'bn' ? 'ঘুরছে...' : 'Spinning...') : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>

            {/* Auto Spin Toggle */}
            <button
              onClick={() => setIsAutoSpin(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isAutoSpin
                  ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-amber-200 border border-amber-500/20'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isAutoSpin ? 'fill-current' : ''}`} />
              <span>{isAutoSpin ? (language === 'bn' ? 'অটো বন্ধ' : 'Stop Auto') : (language === 'bn' ? 'অটো' : 'Auto')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <AlibabaPaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Cave Mystery Urn Bonus Modal */}
      {showCaveBonus && (
        <AlibabaCaveBonusModal
          language={language}
          betAmount={bet}
          onComplete={handleCaveBonusComplete}
        />
      )}

      {/* Big Win Modal */}
      {showBigWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="relative w-full max-w-md bg-gradient-to-b from-amber-600 via-yellow-700 to-amber-950 border-4 border-yellow-300 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.8)]">
            <span className="text-6xl animate-bounce block mb-2">💎</span>
            <h3 className="text-3xl font-black text-yellow-200 uppercase tracking-widest drop-shadow">
              MEGA WIN!
            </h3>
            <p className="text-sm text-yellow-100/90 font-bold mt-1">
              {language === 'bn' ? 'আলী বাবার অসাধারণ জয়!' : "Ali Baba's Cave of Fortune!"}
            </p>
            <div className="text-4xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] my-4">
              ৳{bigWinAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button
              onClick={() => setShowBigWinModal(false)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-300 to-amber-400 text-slate-950 font-black text-base shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              {language === 'bn' ? 'চালিয়ে যান' : 'Continue'}
            </button>
          </div>
        </div>
      )}

      {/* Embedded YouTube Video Modal (Requested link: https://www.youtube.com/watch?v=f-oaBELcUg4) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-red-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Video Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-950/60 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {YOUTUBE_VIDEO_ALIBABA.title}
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Embed */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={YOUTUBE_VIDEO_ALIBABA.embedUrl}
                title={YOUTUBE_VIDEO_ALIBABA.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Info Footer */}
            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? 'গেমপ্লে ও ফ্রি গেম পর্যালোচনা' : 'Official Main Game + Free Game Walkthrough'}</span>
              <a
                href={YOUTUBE_VIDEO_ALIBABA.url}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-bold"
              >
                {language === 'bn' ? 'ইউটিউবে খুলুন' : 'Open in YouTube'}
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
