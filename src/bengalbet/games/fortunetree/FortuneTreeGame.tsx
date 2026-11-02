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
  Award,
  Youtube,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { 
  FortuneTreeCell, 
  FortuneTreePaylineWin, 
  FORTUNE_TREE_COLS, 
  FORTUNE_TREE_ROWS,
  YOUTUBE_VIDEO_FORTUNE_TREE 
} from './fortuneTreeTypes';
import { 
  createInitialFortuneTreeGrid, 
  generateFortuneTreeGrid, 
  shouldTriggerTreeShake, 
  applyTreeShakeWilds, 
  evaluateFortuneTreeWins, 
  countFortuneTreeScatters,
  countFortuneTreeHongbao
} from './fortuneTreeEngine';
import { fortuneTreeAudio } from './fortuneTreeAudio';
import { FortuneTreeSymbolView } from './FortuneTreeSymbolView';
import { FortuneTreeBonusModal } from './FortuneTreeBonusModal';
import { FortuneTreePaytableModal } from './FortuneTreePaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface FortuneTreeGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const FortuneTreeGame: React.FC<FortuneTreeGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  // Balance & Betting
  const balance = user?.balance ?? 5000;
  const [bet, setBet] = useState<number>(30);

  // Reel Grid & Animation State
  const [grid, setGrid] = useState<FortuneTreeCell[][]>(() => createInitialFortuneTreeGrid());
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);

  // Tree Shake & Effects State
  const [isTreeShaking, setIsTreeShaking] = useState<boolean>(false);
  const [shakenWildsCount, setShakenWildsCount] = useState<number>(0);

  // Win State
  const [lastSpinWin, setLastSpinWin] = useState<number>(0);
  const [roundTotalWin, setRoundTotalWin] = useState<number>(0);
  const [winningLines, setWinningLines] = useState<FortuneTreePaylineWin[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Free Spins State
  const [isFreeSpinsMode, setIsFreeSpinsMode] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);

  // Hongbao Pick Bonus State
  const [showHongbaoBonus, setShowHongbaoBonus] = useState<boolean>(false);

  // Settings & Modals
  const [isMuted, setIsMuted] = useState<boolean>(fortuneTreeAudio.getMuted());
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showBigWinModal, setShowBigWinModal] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number>(0);

  const BET_PRESETS = [15, 30, 60, 150, 300, 600];

  const toggleSound = () => {
    const muted = fortuneTreeAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleSpin = async (customBet?: number, triggerBonus: boolean = false) => {
    const activeBet = customBet ?? bet;
    const isFree = isFreeSpinsMode && freeSpinsRemaining > 0;

    if (!isFree && !triggerBonus && balance < activeBet) {
      setStatusMessage(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient Balance!');
      setIsAutoSpin(false);
      return;
    }

    if (!isFree && triggerBonus && balance < activeBet * 60) {
      setStatusMessage(language === 'bn' ? 'বোনাস ক্রয়ের জন্য অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient balance for Buy Feature!');
      return;
    }

    setIsSpinning(true);
    setStatusMessage('');
    setWinningLines([]);
    setLastSpinWin(0);
    setIsTreeShaking(false);
    setShakenWildsCount(0);

    // Deduct cost
    const cost = triggerBonus ? activeBet * 60 : activeBet;
    if (!isFree) {
      onUpdateBalance(balance - cost);
    }

    fortuneTreeAudio.playSpin();

    // Start reel spin
    setSpinningCols([true, true, true, true, true]);
    const spinDelay = isTurbo ? 180 : 380;

    for (let c = 0; c < FORTUNE_TREE_COLS; c++) {
      await new Promise(r => setTimeout(r, spinDelay / 3));
      fortuneTreeAudio.playReelStop(c);
      setSpinningCols(prev => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
    }

    // Generate base outcome grid
    let currentGrid = generateFortuneTreeGrid(isFree || triggerBonus);

    // If Buy Feature was activated, guarantee at least 3 Scatters
    if (triggerBonus) {
      currentGrid[0][0].type = 'scatter';
      currentGrid[2][1].type = 'scatter';
      currentGrid[4][2].type = 'scatter';
    }

    // Check Tree Shake Trigger (Golden Tree Shakes & drops Wilds!)
    const willShake = shouldTriggerTreeShake(isFree);
    if (willShake) {
      setIsTreeShaking(true);
      fortuneTreeAudio.playTreeShake();
      await new Promise(r => setTimeout(r, 600));

      const { newGrid, wildCount } = applyTreeShakeWilds(currentGrid);
      currentGrid = newGrid;
      setShakenWildsCount(wildCount);
      fortuneTreeAudio.playGoldenBell();
      await new Promise(r => setTimeout(r, 400));
      setIsTreeShaking(false);
    }

    setGrid(currentGrid);

    // Check for Scatters & Hongbao
    const scatterCount = countFortuneTreeScatters(currentGrid);
    const hongbaoCount = countFortuneTreeHongbao(currentGrid);

    if (scatterCount >= 3) {
      fortuneTreeAudio.playScatterDrop();
    }
    if (hongbaoCount >= 3) {
      fortuneTreeAudio.playHongbaoPop();
    }

    // Evaluate 30 Payline Wins
    const { wins, totalPayout } = evaluateFortuneTreeWins(currentGrid, activeBet);

    if (wins.length > 0) {
      setWinningLines(wins);
      setLastSpinWin(totalPayout);
      setRoundTotalWin(prev => prev + totalPayout);
      onUpdateBalance(balance + totalPayout);
      fortuneTreeAudio.playLineWin();

      if (!isFree) {
        gameEngine.recordRound(cost, totalPayout, {
          gameId: 'game-fortune-tree',
          gameName: 'Fortune Tree',
          category: 'slot',
          vendor: 'JILI'
        });
      }

      if (totalPayout >= activeBet * 12) {
        setBigWinAmount(totalPayout);
        setShowBigWinModal(true);
        fortuneTreeAudio.playBigWin();
        confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
      }
    } else {
      if (!isFree && hongbaoCount < 3) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-fortune-tree',
          gameName: 'Fortune Tree',
          category: 'slot',
          vendor: 'JILI'
        });
      }
    }

    setIsSpinning(false);

    // Handle Hongbao Bonus Pick trigger
    if (hongbaoCount >= 3) {
      setTimeout(() => {
        setShowHongbaoBonus(true);
      }, 500);
      return;
    }

    // Handle Free Spins trigger
    if (scatterCount >= 3 && !isFreeSpinsMode) {
      fortuneTreeAudio.playBigWin();
      confetti({ particleCount: 90, spread: 75 });
      setIsFreeSpinsMode(true);
      setFreeSpinsRemaining(10);
      setFreeSpinsTotalWon(totalPayout);
      setStatusMessage(language === 'bn' ? '🎉 ফরচুন ট্রি! ১০টি ফ্রি স্পিন সক্রিয়!' : '🎉 Fortune Tree! 10 Free Spins Activated!');
      return;
    }

    // Handle ongoing Free Spins count down
    if (isFreeSpinsMode) {
      setFreeSpinsTotalWon(prev => prev + totalPayout);
      const remaining = freeSpinsRemaining - 1;
      setFreeSpinsRemaining(remaining);

      if (remaining <= 0) {
        setIsFreeSpinsMode(false);
        setStatusMessage(
          language === 'bn'
            ? `ফ্রি স্পিন সমাপ্ত! মোট জয়: ৳${(freeSpinsTotalWon + totalPayout).toLocaleString()}`
            : `Free Spins Complete! Total Won: ৳${(freeSpinsTotalWon + totalPayout).toLocaleString()}`
        );
      }
    }
  };

  // Handle Hongbao bonus completion
  const handleHongbaoComplete = (wonCash: number) => {
    setShowHongbaoBonus(false);
    onUpdateBalance(balance + wonCash);
    setLastSpinWin(wonCash);
    setRoundTotalWin(prev => prev + wonCash);
    gameEngine.recordRound(bet, wonCash, {
      gameId: 'game-fortune-tree',
      gameName: 'Fortune Tree (Hongbao Bonus)',
      category: 'slot',
      vendor: 'JILI'
    });
    setStatusMessage(
      language === 'bn'
        ? `লাল খাম থেকে ৳${wonCash.toLocaleString()} জিতেছেন!`
        : `Won ৳${wonCash.toLocaleString()} from Fortune Tree Hongbao!`
    );
  };

  // Auto spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning && !showHongbaoBonus && !showBigWinModal) {
      timer = setTimeout(() => {
        if (balance >= bet || (isFreeSpinsMode && freeSpinsRemaining > 0)) {
          handleSpin();
        } else {
          setIsAutoSpin(false);
        }
      }, isTurbo ? 600 : 1200);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, balance, bet, isFreeSpinsMode, freeSpinsRemaining, showHongbaoBonus, showBigWinModal]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-1 md:p-4 overflow-y-auto">
      {/* Game Frame */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#380712] via-[#20030a] to-[#0e0104] border-2 border-yellow-400/90 rounded-2xl md:rounded-3xl shadow-[0_0_60px_rgba(250,204,21,0.3)] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-gradient-to-r from-red-950 via-[#2f040d] to-red-950 border-b border-yellow-500/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow">
              <span className="text-xl">🌳</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {language === 'bn' ? 'ফরচুন ট্রি' : 'Fortune Tree'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
                  JILI
                </span>
              </div>
              <p className="text-[10px] text-amber-200/70 hidden sm:block">
                30 Paylines • Tree Shake Wilds • Hongbao Bonus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Watch 15K Win Gameplay Video Button */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Watch 15K Win Video on YouTube"
            >
              <Youtube className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">{language === 'bn' ? 'ভিডিও দেখুন (১৫K Win)' : 'Watch Video (15K Win)'}</span>
            </button>

            {/* Paytable */}
            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300 transition-all"
              title="Paytable & Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300 transition-all"
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
          <div className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 py-1.5 px-4 flex items-center justify-between text-xs font-black tracking-wider text-slate-950 shadow-md">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
              {language === 'bn' ? 'ফরচুন ট্রি ফ্রি স্পিন চলছে (গাছ কাঁপুনি বুস্ট!)' : 'FORTUNE TREE FREE SPINS ACTIVE (50% TREE SHAKE BOOST!)'}
            </span>
            <span>
              {language === 'bn' ? 'বাকি স্পিন:' : 'Spins Left:'} <span className="text-base text-red-950 font-black underline">{freeSpinsRemaining}</span>
            </span>
          </div>
        )}

        {/* Interactive Golden Tree Crown Area */}
        <div className="relative bg-gradient-to-b from-[#400612] via-[#24030a] to-[#140105] py-2 md:py-3 px-4 border-b border-yellow-500/30 flex items-center justify-between overflow-hidden">
          
          {/* Shaking Coins Animation */}
          {isTreeShaking && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-around z-20">
              <span className="text-2xl animate-bounce">🪙</span>
              <span className="text-xl animate-bounce delay-100">🧧</span>
              <span className="text-2xl animate-bounce delay-200">🪙</span>
              <span className="text-xl animate-bounce delay-300">✨</span>
              <span className="text-2xl animate-bounce delay-150">🪙</span>
            </div>
          )}

          {/* Golden Bonsai Tree Hero Element */}
          <div className="flex items-center gap-3">
            <div
              className={`relative text-4xl md:text-5xl transition-transform duration-200 ${
                isTreeShaking ? 'scale-125 animate-wiggle rotate-6 filter drop-shadow-[0_0_20px_#facc15]' : 'scale-100'
              }`}
            >
              🌳
              <span className="absolute -top-1 -right-1 text-sm animate-ping">✨</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-black text-yellow-300 tracking-wider uppercase">
                  {language === 'bn' ? 'ফরচুন ট্রি স্বর্ণবৃক্ষ' : 'Golden Fortune Tree'}
                </span>
                {shakenWildsCount > 0 && (
                  <span className="bg-yellow-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow">
                    +{shakenWildsCount} WILDS!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-200/80">
                {isTreeShaking
                  ? (language === 'bn' ? '⚡ স্বর্ণবৃক্ষ কাঁপছে! ওয়াইল্ড নেমে আসছে...' : '⚡ Tree is Shaking! Showering Wilds...')
                  : (language === 'bn' ? 'স্বর্ণবৃক্ষ যেকোনো স্পিনে ওয়াইল্ড ও মাল্টিপ্লায়ার বর্ষণ করে' : 'Shakes randomly to award Golden Wilds & Multipliers')}
              </p>
            </div>
          </div>

          {/* Top Jackpot Badge */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              GRAND JACKPOT
            </span>
            <span className="text-base md:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
              ৳5,100,000
            </span>
          </div>
        </div>

        {/* 5x3 Slot Reels Grid */}
        <div className="relative p-2 md:p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a0614] via-[#1a0208] to-[#0a0104] flex-1 flex items-center justify-center">
          
          {/* Status Message Overlay */}
          {statusMessage && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-950/90 border border-yellow-400 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-bounce">
              {statusMessage}
            </div>
          )}

          {/* Slot Frame */}
          <div className="w-full max-w-2xl bg-black/60 p-2 md:p-3 rounded-2xl border border-yellow-500/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            <div className="grid grid-cols-5 gap-1.5 md:gap-2">
              {grid.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5 md:gap-2">
                  {col.map((cell, rowIdx) => {
                    const isWinning = winningLines.some(line =>
                      line.coordinates.some(coord => coord.col === colIdx && coord.row === rowIdx)
                    );
                    return (
                      <div key={cell.id} className="h-20 sm:h-24 md:h-28">
                        <FortuneTreeSymbolView
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
        <div className="bg-gradient-to-b from-[#24030b] to-[#120105] p-3 md:p-4 border-t border-yellow-500/30 flex flex-col gap-3">
          
          {/* Balance & Win Summary */}
          <div className="flex items-center justify-between text-xs md:text-sm font-bold px-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-200/70">{language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'}</span>
              <span className="text-yellow-300 text-sm md:text-base font-black">
                ৳{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-200/70">{language === 'bn' ? 'মোট জয়:' : 'Win:'}</span>
              <span className="text-emerald-400 text-sm md:text-base font-black">
                ৳{lastSpinWin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Bet Presets & Feature Buy */}
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    bet === preset
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-yellow-200 border border-yellow-500/20'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>

            {/* Buy Feature (60X) */}
            <button
              onClick={() => handleSpin(bet, true)}
              disabled={isSpinning || isFreeSpinsMode}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:brightness-110 active:scale-95 text-yellow-100 border border-yellow-400 text-xs font-black shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'ফ্রি স্পিন কিনুন' : 'Buy Free Spins'}</span>
              <span className="text-[10px] text-yellow-200 font-normal">({bet * 60}৳)</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-yellow-500/20">
            {/* Turbo Toggle */}
            <button
              onClick={() => setIsTurbo(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isTurbo
                  ? 'bg-yellow-400 text-slate-950 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
                  : 'bg-white/5 hover:bg-white/10 text-yellow-200 border border-yellow-500/20'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'fill-current' : ''}`} />
              <span>{language === 'bn' ? 'টার্বো' : 'Turbo'}</span>
            </button>

            {/* Main Spin Button */}
            <button
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className="flex-1 max-w-xs py-3 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 text-slate-950 font-black text-base md:text-lg shadow-[0_0_25px_rgba(250,204,21,0.6)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border border-yellow-100"
            >
              <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? (language === 'bn' ? 'ঘুরছে...' : 'Spinning...') : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>

            {/* Auto Spin Toggle */}
            <button
              onClick={() => setIsAutoSpin(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isAutoSpin
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 text-yellow-200 border border-yellow-500/20'
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
        <FortuneTreePaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Hongbao Pick Bonus Modal */}
      {showHongbaoBonus && (
        <FortuneTreeBonusModal
          language={language}
          betAmount={bet}
          onComplete={handleHongbaoComplete}
        />
      )}

      {/* Big Win Modal */}
      {showBigWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="relative w-full max-w-md bg-gradient-to-b from-red-600 via-amber-600 to-red-950 border-4 border-yellow-300 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.8)]">
            <span className="text-6xl animate-bounce block mb-2">🌳</span>
            <h3 className="text-3xl font-black text-yellow-200 uppercase tracking-widest drop-shadow">
              SUPER WIN!
            </h3>
            <p className="text-sm text-yellow-100/90 font-bold mt-1">
              {language === 'bn' ? 'স্বর্ণবৃক্ষের মেগা প্রাইজ!' : 'Fortune Tree 15K Win!'}
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

      {/* Embedded YouTube Video Modal (Requested link: https://www.youtube.com/watch?v=Ja9CBKaCbs4) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-red-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Video Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-red-950/60 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {YOUTUBE_VIDEO_FORTUNE_TREE.title}
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
                src={YOUTUBE_VIDEO_FORTUNE_TREE.embedUrl}
                title={YOUTUBE_VIDEO_FORTUNE_TREE.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Video Info Footer */}
            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? 'জিলির ১৫,০০০ টাকা জয়ের লাইভ ভিডিও গেমপ্লে' : 'JILI Fortune Tree 15K Win Gameplay Recording'}</span>
              <a
                href={YOUTUBE_VIDEO_FORTUNE_TREE.url}
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
