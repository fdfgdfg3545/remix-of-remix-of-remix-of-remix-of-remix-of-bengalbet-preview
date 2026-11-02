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
  Crosshair, 
  Target,
  Award,
  DollarSign
} from 'lucide-react';
import { UserAccount } from '../../types';
import { 
  BountyCell, 
  BountyWaysWin, 
  REEL_ROW_COUNTS, 
  BOUNTY_SYMBOLS 
} from './wildBountyTypes';
import { 
  createInitialBountyGrid, 
  generateBountySpinGrid, 
  evaluateBountyWaysWins, 
  cascadeBountyGrid, 
  countBountyScatters 
} from './wildBountyEngine';
import { wildBountyAudio } from './wildBountyAudio';
import { WildBountySymbolView } from './WildBountySymbolView';
import wildBountyThumb from '../../assets/images/wild_bounty_showdown_1789326457687.jpg';
import { gameEngine } from '../../services/gameEngine';

interface WildBountyGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const WildBountyGame: React.FC<WildBountyGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  // Balance & Betting
  const balance = user?.balance ?? 5000;
  const [bet, setBet] = useState<number>(20);

  // Reel Grid & Animation State
  const [grid, setGrid] = useState<BountyCell[][]>(() => createInitialBountyGrid());
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false, false]);

  // Progressive Doubling Multiplier (1X -> 2X -> 4X -> 8X -> ... up to 1024X)
  const [multiplier, setMultiplier] = useState<number>(1);
  const [lastSpinWin, setLastSpinWin] = useState<number>(0);
  const [roundTotalWin, setRoundTotalWin] = useState<number>(0);
  const [winningWays, setWinningWays] = useState<BountyWaysWin[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Free Spins State
  const [isFreeSpinsMode, setIsFreeSpinsMode] = useState<boolean>(false);
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);

  // Settings
  const [isMuted, setIsMuted] = useState<boolean>(wildBountyAudio.getMuted());
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showBigWinModal, setShowBigWinModal] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number>(0);

  // Bet Chip presets
  const BET_PRESETS = [10, 20, 50, 100, 200, 500];

  // Sounds Toggle
  const toggleSound = () => {
    const muted = wildBountyAudio.toggleMute();
    setIsMuted(muted);
  };

  // Trigger Spin logic
  const handleSpin = async (customBet?: number, triggerBonus: boolean = false) => {
    const activeBet = customBet ?? bet;
    const isFree = isFreeSpinsMode && freeSpinsRemaining > 0;

    if (!isFree && !triggerBonus && balance < activeBet) {
      setStatusMessage(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient Balance!');
      setIsAutoSpin(false);
      return;
    }

    if (!isFree && triggerBonus && balance < activeBet * 75) {
      setStatusMessage(language === 'bn' ? 'বোনাস ক্রয়ের জন্য অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient balance to Buy Feature!');
      return;
    }

    setIsSpinning(true);
    setStatusMessage('');
    setWinningWays([]);
    setLastSpinWin(0);

    // Deduct bet if normal spin or bonus buy
    const cost = triggerBonus ? activeBet * 75 : activeBet;
    if (!isFree) {
      onUpdateBalance(balance - cost);
    }

    wildBountyAudio.playSpin();

    // Start with 1X multiplier in base game, or 8X in free spins!
    let currentMultiplier = isFree ? 8 : 1;
    setMultiplier(currentMultiplier);

    // Reel spin animation
    setSpinningCols([true, true, true, true, true, true]);
    const spinDelay = isTurbo ? 250 : 500;

    for (let c = 0; c < 6; c++) {
      await new Promise(r => setTimeout(r, spinDelay / 4));
      wildBountyAudio.playReelStop(c);
      setSpinningCols(prev => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
    }

    // Generate outcome
    let currentGrid = generateBountySpinGrid(isFree || triggerBonus);

    // If Buy Feature was bought, force 3 scatters
    if (triggerBonus) {
      currentGrid[0][0].type = 'scatter';
      currentGrid[2][1].type = 'scatter';
      currentGrid[4][1].type = 'scatter';
    }

    setGrid(currentGrid);

    // Check for Scatters
    const scatterCount = countBountyScatters(currentGrid);
    if (scatterCount >= 3) {
      wildBountyAudio.playScatterDrop();
    }

    // Cascading sequence with doubling multiplier (1X -> 2X -> 4X -> 8X -> 16X -> 32X -> 64X -> ... 1024X)
    let roundWin = 0;
    let cascadeCount = 0;
    let keepCascading = true;

    while (keepCascading) {
      const { wins, totalPayout } = evaluateBountyWaysWins(currentGrid, activeBet);

      if (wins.length > 0) {
        // Multiplier doubles on consecutive cascades!
        if (cascadeCount > 0) {
          currentMultiplier = Math.min(currentMultiplier * 2, 1024);
          setMultiplier(currentMultiplier);
          wildBountyAudio.playGunshotRicochet(currentMultiplier);
        }

        const multipliedPayout = totalPayout * currentMultiplier;
        roundWin += multipliedPayout;
        setWinningWays(wins);
        setLastSpinWin(roundWin);

        // Highlight winning cells
        const allWinningCoords = wins.flatMap(w => w.coordinates);
        const highlightedGrid = currentGrid.map((col, cIdx) =>
          col.map((cell, rIdx) => ({
            ...cell,
            winHighlight: allWinningCoords.some(pt => pt.col === cIdx && pt.row === rIdx)
          }))
        );
        setGrid(highlightedGrid);

        // Check if any winning cell was a gold frame turning to wild
        const hasGoldTransform = allWinningCoords.some(
          pt => currentGrid[pt.col][pt.row].isGolden
        );
        if (hasGoldTransform) {
          wildBountyAudio.playSheriffWildTransform();
        }

        await new Promise(r => setTimeout(r, isTurbo ? 400 : 700));

        // Mark cells as eliminating
        const eliminatingGrid = currentGrid.map((col, cIdx) =>
          col.map((cell, rIdx) => ({
            ...cell,
            isEliminating: allWinningCoords.some(pt => pt.col === cIdx && pt.row === rIdx)
          }))
        );
        setGrid(eliminatingGrid);

        await new Promise(r => setTimeout(r, isTurbo ? 250 : 350));

        // Drop next cascading symbols
        currentGrid = cascadeBountyGrid(currentGrid, allWinningCoords, isFree);
        setGrid(currentGrid);
        cascadeCount++;

        await new Promise(r => setTimeout(r, isTurbo ? 300 : 450));
      } else {
        keepCascading = false;
      }
    }

    // Payout to balance
    if (roundWin > 0) {
      onUpdateBalance(balance + roundWin);
      setRoundTotalWin(prev => prev + roundWin);

      if (!isFree) {
        gameEngine.recordRound(cost, roundWin, {
          gameId: 'game-wild-bounty',
          gameName: 'Wild Bounty Showdown',
          category: 'slot',
          vendor: 'PG Soft'
        });
      }

      if (roundWin >= activeBet * 15) {
        wildBountyAudio.playBigWin();
        setBigWinAmount(roundWin);
        setShowBigWinModal(true);
      }
    } else {
      if (!isFree) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-wild-bounty',
          gameName: 'Wild Bounty Showdown',
          category: 'slot',
          vendor: 'PG Soft'
        });
      }
    }

    // Trigger Free Spins if 3+ scatters and not already in free spins
    if (scatterCount >= 3 && !isFree) {
      wildBountyAudio.playFreeSpinsFanfare();
      const awardedSpins = 10 + (scatterCount - 3) * 2;
      setIsFreeSpinsMode(true);
      setFreeSpinsRemaining(awardedSpins);
      setMultiplier(8);
      setStatusMessage(
        language === 'bn' 
          ? `অভিনন্দন! ${awardedSpins} টি ফ্রি স্পিন শুরু হচ্ছে (৮X মাল্টিপ্লায়ার)!` 
          : `SHOWDOWN! ${awardedSpins} Free Spins with 8X Starting Multiplier!`
      );
    } else if (isFree) {
      const remaining = freeSpinsRemaining - 1;
      setFreeSpinsRemaining(remaining);
      setFreeSpinsTotalWon(prev => prev + roundWin);

      if (remaining <= 0) {
        setIsFreeSpinsMode(false);
        setMultiplier(1);
        setStatusMessage(
          language === 'bn'
            ? `ফ্রি স্পিন সমাপ্ত! মোট জয়: ৳${(freeSpinsTotalWon + roundWin).toFixed(2)}`
            : `Free Spins Completed! Total Bounty Won: ৳${(freeSpinsTotalWon + roundWin).toFixed(2)}`
        );
      }
    }

    setIsSpinning(false);
  };

  // Buy Feature (75X bet for 10 Free Spins with 8X base)
  const handleBuyFeature = () => {
    const cost = bet * 75;
    if (balance < cost) {
      setStatusMessage(
        language === 'bn'
          ? `বোনাস ক্রয়ের জন্য ৳${cost.toLocaleString()} প্রয়োজন`
          : `Need ৳${cost.toLocaleString()} to Buy Bonus Feature`
      );
      return;
    }
    handleSpin(bet, true);
  };

  // Auto-Spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoSpin && !isSpinning && (isFreeSpinsMode || balance >= bet)) {
      timer = setTimeout(() => {
        handleSpin();
      }, isTurbo ? 600 : 1200);
    } else if (isAutoSpin && balance < bet && !isFreeSpinsMode) {
      setIsAutoSpin(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, balance, bet, isFreeSpinsMode]);

  // Spacebar quick spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !showPaytable && !showBigWinModal) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, showPaytable, showBigWinModal, bet, balance, isFreeSpinsMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-1 md:p-4 overflow-y-auto">
      {/* Game Outer Shell */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#1c120c] via-[#120a06] to-black rounded-2xl md:rounded-3xl border border-amber-800/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col my-auto">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-amber-700/40">
          <div className="flex items-center space-x-2">
            <img 
              src={wildBountyThumb} 
              alt="Wild Bounty Showdown" 
              className="w-9 h-9 rounded-lg border border-amber-500/60 object-cover shadow"
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm md:text-base font-black text-amber-300 font-serif tracking-wide drop-shadow">
                  {language === 'bn' ? 'ওয়াইল্ড বাউন্টি শোডাউন' : 'WILD BOUNTY SHOWDOWN'}
                </span>
                <span className="text-[10px] bg-amber-500 text-black font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                  PG SOFT
                </span>
              </div>
              <div className="text-[10px] text-amber-400/80 font-mono">
                3,600 WAYS • MULTIPLIER UP TO 1024X
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-300 border border-amber-600/40 transition"
              title="Paytable"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-300 border border-amber-600/40 transition"
              title="Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-700/50 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Free Spins Banner (if active) */}
        {isFreeSpinsMode && (
          <div className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-600 px-4 py-1.5 flex items-center justify-between text-black font-black shadow-lg animate-pulse">
            <div className="flex items-center space-x-2 text-xs md:text-sm uppercase tracking-wider font-serif">
              <Flame className="w-4 h-4 text-yellow-200" />
              <span>{language === 'bn' ? 'ফ্রি স্পিন শোডাউন সক্রিয়!' : 'FREE SPINS SHOWDOWN ACTIVE!'}</span>
            </div>
            <div className="text-xs md:text-sm font-mono bg-black text-amber-300 px-2.5 py-0.5 rounded-full border border-yellow-400">
              {freeSpinsRemaining} SPINS LEFT • WON: ৳{freeSpinsTotalWon.toFixed(2)}
            </div>
          </div>
        )}

        {/* Dynamic Multiplier Bar (1X -> 2X -> 4X -> 8X -> 16X -> 32X -> 64X -> 128X -> 256X -> 512X -> 1024X) */}
        <div className="px-3 py-2 bg-gradient-to-b from-stone-950 via-stone-900 to-[#170e08] border-b border-amber-900/60 flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Multiplier Display */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center space-x-1.5 bg-amber-950/90 border border-amber-500/60 px-3 py-1 rounded-xl shadow-inner">
              <Target className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-wider">
                {language === 'bn' ? 'মাল্টিপ্লায়ার' : 'MULTIPLIER'}
              </span>
              <span className={`text-base md:text-xl font-black font-mono transition-all duration-300 ${
                multiplier > 1 
                  ? 'text-yellow-300 scale-110 drop-shadow-[0_0_10px_#facc15]' 
                  : 'text-amber-200'
              }`}>
                {multiplier}X
              </span>
            </div>

            {/* Quick ladder visual */}
            <div className="flex items-center space-x-1 overflow-x-auto text-[10px] font-mono font-bold">
              {[1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].map(step => (
                <div
                  key={step}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    multiplier === step
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black scale-110 shadow-[0_0_8px_#f59e0b]'
                      : multiplier > step
                      ? 'bg-amber-950/60 text-amber-400/80 border border-amber-800/40'
                      : 'bg-stone-900/80 text-stone-500'
                  }`}
                >
                  {step}X
                </div>
              ))}
            </div>
          </div>

          {/* Win Status / Feedback */}
          <div className="flex items-center space-x-2 text-xs md:text-sm font-mono">
            {lastSpinWin > 0 ? (
              <div className="flex items-center space-x-1 text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-3 py-0.5 rounded-lg animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-bold">
                  {language === 'bn' ? 'মোট জয়:' : 'WIN:'} ৳{lastSpinWin.toFixed(2)}
                </span>
              </div>
            ) : statusMessage ? (
              <span className="text-amber-400 font-serif italic text-xs">
                {statusMessage}
              </span>
            ) : (
              <span className="text-stone-400 text-[11px] font-serif italic">
                {language === 'bn' ? '৩ বা তার বেশি সংলগ্ন প্রতীকে জয়' : '3+ Adjacent Symbols Win Left-to-Right'}
              </span>
            )}
          </div>
        </div>

        {/* 6-Reel Grid Area (Authentic PG Soft 3-4-5-5-4-3 Shaped Saloon Chamber) */}
        <div className="p-2 md:p-4 flex justify-center items-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-950 to-black">
          {/* Western Wanted Poster & Bullet Hole Ambience */}
          <div className="absolute inset-0 bg-repeat opacity-5 pointer-events-none" />

          {/* 6-Reel Columns Container */}
          <div className="grid grid-cols-6 gap-1 md:gap-2 w-full max-w-2xl bg-black/60 p-2 md:p-3 rounded-2xl border border-amber-900/60 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)]">
            {grid.map((colCells, colIdx) => (
              <div
                key={colIdx}
                className="flex flex-col justify-center space-y-1 md:space-y-1.5 transition-all"
              >
                {/* Reel Header indicator */}
                <div className="text-[9px] font-mono text-center font-bold text-amber-500/70 uppercase">
                  R{colIdx + 1}
                </div>

                {colCells.map((cell, rowIdx) => (
                  <WildBountySymbolView key={cell.id} cell={cell} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Winning Ways breakdown indicator (if active) */}
        {winningWays.length > 0 && (
          <div className="px-3 py-1 bg-amber-950/40 border-t border-amber-900/30 flex items-center justify-center space-x-2 text-xs font-mono text-amber-300">
            <span>
              {winningWays.length} {language === 'bn' ? 'জয়ের পথ সংযোগ!' : 'Winning Combinations!'}
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-yellow-400 font-bold">
              {winningWays.reduce((acc, w) => acc + w.ways, 0)} {language === 'bn' ? 'উপায়ে জয়' : 'Ways'}
            </span>
          </div>
        )}

        {/* Bottom Betting & Controls Bar */}
        <div className="p-2 md:p-3 bg-gradient-to-t from-black via-stone-950 to-stone-900 border-t border-amber-800/40 flex flex-col gap-2">
          {/* Bet Chips Presets & Buy Bonus Button */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-tighter mr-1 hidden sm:inline">
                {language === 'bn' ? 'বাজি চিপ:' : 'BET:'}
              </span>
              {BET_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBet(preset)}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition ${
                    bet === preset
                      ? 'bg-amber-500 text-black shadow-[0_0_8px_#f59e0b]'
                      : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  }`}
                >
                  ৳{preset}
                </button>
              ))}
            </div>

            {/* Feature Buy Button (PG Soft signature) */}
            <button
              onClick={handleBuyFeature}
              disabled={isSpinning || isFreeSpinsMode}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-black uppercase tracking-tight flex items-center space-x-1 shadow-[0_0_12px_rgba(239,68,68,0.5)] border border-yellow-400/50 transition disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'ফিচার কিনুন' : 'BUY FEATURE'}</span>
              <span className="bg-black/40 px-1 py-0.5 rounded text-[10px] font-mono text-yellow-200">
                ৳{(bet * 75).toLocaleString()}
              </span>
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            {/* Balance & Win displays */}
            <div className="flex items-center space-x-2">
              <div className="bg-stone-900/90 border border-stone-700/80 px-2.5 py-1 rounded-xl">
                <div className="text-[9px] text-stone-400 font-mono uppercase">
                  {language === 'bn' ? 'ব্যালেন্স' : 'BALANCE'}
                </div>
                <div className="text-xs md:text-sm font-black text-amber-300 font-mono">
                  ৳{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-stone-900/90 border border-amber-600/40 px-2.5 py-1 rounded-xl">
                <div className="text-[9px] text-amber-400/80 font-mono uppercase">
                  {language === 'bn' ? 'মোট বাজি' : 'TOTAL BET'}
                </div>
                <div className="text-xs md:text-sm font-black text-yellow-400 font-mono">
                  ৳{bet.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Spin Controls */}
            <div className="flex items-center space-x-1.5 md:space-x-3">
              {/* Turbo Toggle */}
              <button
                onClick={() => setIsTurbo(!isTurbo)}
                className={`p-2 rounded-xl border transition flex items-center space-x-1 text-xs font-mono font-bold ${
                  isTurbo 
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.4)]' 
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
                title="Turbo Spin Mode"
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px] hidden md:inline">TURBO</span>
              </button>

              {/* Auto Spin Toggle */}
              <button
                onClick={() => setIsAutoSpin(!isAutoSpin)}
                disabled={isSpinning && !isAutoSpin}
                className={`p-2 rounded-xl border transition flex items-center space-x-1 text-xs font-mono font-bold ${
                  isAutoSpin 
                    ? 'bg-red-500/20 text-red-300 border-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' 
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
                title="Auto Spin"
              >
                <RotateCcw className={`w-4 h-4 ${isAutoSpin ? 'animate-spin' : ''}`} />
                <span className="text-[10px] hidden md:inline">
                  {isAutoSpin ? 'STOP' : 'AUTO'}
                </span>
              </button>

              {/* Main SPUR / REVOLVER SPIN BUTTON */}
              <button
                onClick={() => handleSpin()}
                disabled={isSpinning}
                className={`px-5 md:px-8 py-2 md:py-2.5 rounded-2xl font-serif font-black text-base md:text-lg flex items-center space-x-2 transition-all transform active:scale-95 shadow-xl ${
                  isSpinning
                    ? 'bg-stone-700 text-stone-400 cursor-not-allowed opacity-60'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-yellow-200'
                }`}
              >
                <Crosshair className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                <span className="tracking-wider">
                  {isSpinning 
                    ? (language === 'bn' ? 'ঘুরছে...' : 'SPINNING') 
                    : (language === 'bn' ? 'স্পিন' : 'SPIN')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paytable & Rules Modal */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-stone-950 border border-amber-600/60 rounded-2xl p-5 text-stone-200 shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowPaytable(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-black text-amber-300 mb-3 flex items-center space-x-2">
              <Crosshair className="w-5 h-5 text-amber-400" />
              <span>{language === 'bn' ? 'পে-টেবিল ও গেমের নিয়মাবলী' : 'Paytable & Game Rules'}</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Multiplier Rule */}
              <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-600/40">
                <div className="font-bold text-amber-300 mb-1 text-sm">
                  {language === 'bn' ? 'দ্বিগুণ মাল্টিপ্লায়ার (১X থেকে ১০২৪X)' : 'Doubling Multiplier (1X to 1024X)'}
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {language === 'bn'
                    ? 'প্রতিটি সফল ক্যাসকেডের সাথে মূল মাল্টিপ্লায়ার দ্বিগুণ হয়ে যায় (১X, ২X, ৪X, ৮X... ১০২৪X পর্যন্ত)। ফ্রি স্পিন মোডে মাল্টিপ্লায়ার শুরুই হয় ৮X দিয়ে!'
                    : 'Each winning cascade doubles the current win multiplier (1X, 2X, 4X, 8X... up to 1024X). In Free Spins, the round starts with an 8X multiplier!'}
                </p>
              </div>

              {/* Gold Frame Wild Rule */}
              <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-600/40">
                <div className="font-bold text-yellow-400 mb-1 text-sm">
                  {language === 'bn' ? 'গোল্ড-ফ্রেম থেকে ওয়াইল্ড রূপান্তর' : 'Gold-Framed Wild Transformation'}
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {language === 'bn'
                    ? 'রিল ৩ এবং ৪-এ গোল্ডেন ফ্রেমযুক্ত প্রতীক আসতে পারে। যখন এগুলো কোনো জয়ের অংশ হয়, তখন এগুলো হারিয়ে না গিয়ে শেরিফ স্টার ওয়াইল্ডে রূপান্তরিত হয়!'
                    : 'Symbols on Reels 3 & 4 may appear with a Gold Frame. When involved in a winning combination, they transform into Sheriff Star Wild symbols instead of vanishing!'}
                </p>
              </div>

              {/* Free Spins Feature */}
              <div className="bg-amber-950/50 p-3 rounded-xl border border-amber-600/40">
                <div className="font-bold text-amber-300 mb-1 text-sm">
                  {language === 'bn' ? 'ফ্রি স্পিন শোডাউন (৩+ স্কেটার)' : 'Free Spins Showdown (3+ Scatters)'}
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {language === 'bn'
                    ? '৩টি বা তার বেশি গোল্ড ইনগট স্কেটার প্রতীক ১০টি ফ্রি স্পিন সক্রিয় করে। ফ্রি স্পিন শুরু হয় ৮X মাল্টিপ্লায়ার দিয়ে এবং প্রতিটি ক্যাসকেডে দ্বিগুণ হয়!'
                    : '3 or more Gold Ingot Scatter symbols trigger 10 Free Spins. Starts with an 8X multiplier, doubling with every cascade!'}
                </p>
              </div>

              {/* Symbols payout list */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {Object.entries(BOUNTY_SYMBOLS).map(([key, sym]) => {
                  if (key === 'wild' || key === 'scatter') return null;
                  return (
                    <div key={key} className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-amber-200">
                          {language === 'bn' ? sym.nameBn : sym.nameEn}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          6x: {sym.basePayouts[6]}x • 5x: {sym.basePayouts[5]}x
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-yellow-400">
                        {sym.basePayouts[6]}X
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Big Win Celebration Modal */}
      {showBigWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative text-center max-w-sm w-full p-6 rounded-3xl bg-gradient-to-b from-amber-900 via-stone-950 to-black border-2 border-yellow-400 shadow-[0_0_60px_rgba(250,204,21,0.8)] animate-in fade-in zoom-in duration-300">
            <div className="text-4xl md:text-5xl mb-2 animate-bounce">
              🤠🏆
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-yellow-300 uppercase tracking-wider drop-shadow-[0_0_12px_#facc15]">
              {language === 'bn' ? 'বিগ বাউন্টি জয়!' : 'BIG BOUNTY WIN!'}
            </h2>
            <div className="text-3xl md:text-4xl font-mono font-black text-amber-400 my-4 drop-shadow-[0_0_15px_#f59e0b]">
              ৳{bigWinAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button
              onClick={() => setShowBigWinModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-serif font-black text-base uppercase tracking-wider shadow-lg hover:from-amber-400 hover:to-yellow-300 transition"
            >
              {language === 'bn' ? 'সংগ্রহ করুন' : 'COLLECT BOUNTY'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
