// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  Zap,
  RotateCw,
  Sparkles,
  Flame,
  Gift,
  Plus,
  Minus,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { SweetCell, SweetSymbolType, SWEET_PAYTABLE, TumbleWinGroup } from './sweetBonanzaTypes';
import { sweetAudio } from './sweetBonanzaAudio';
import sweetBonanzaIcon from '../../assets/images/sweet_bonanza_icon_1789330361177.jpg';
import { gameEngine } from '../../services/gameEngine';

interface SweetBonanzaGameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const ROWS = 5;
const COLS = 6;
const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];
const BOMB_VALUES = [2, 3, 5, 8, 10, 15, 20, 25, 50, 100];

const REGULAR_SYMBOLS: SweetSymbolType[] = [
  'banana', 'banana', 'banana',
  'grape', 'grape', 'grape',
  'watermelon', 'watermelon',
  'plum', 'plum',
  'apple', 'apple',
  'blue_oval', 'blue_oval',
  'green_pent',
  'purple_sq',
  'heart'
];

function getRandomSymbol(isFreeSpins = false): { type: SweetSymbolType; bombValue?: number } {
  // Chance for Lollipop scatter
  if (Math.random() < 0.04) {
    return { type: 'lollipop' };
  }
  // Chance for Multiplier Bomb during Free Spins
  if (isFreeSpins && Math.random() < 0.12) {
    const val = BOMB_VALUES[Math.floor(Math.random() * BOMB_VALUES.length)];
    return { type: 'bomb', bombValue: val };
  }
  const sym = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
  return { type: sym };
}

function generateInitialGrid(isFreeSpins = false): SweetCell[][] {
  const grid: SweetCell[][] = [];
  for (let c = 0; c < COLS; c++) {
    const col: SweetCell[] = [];
    for (let r = 0; r < ROWS; r++) {
      const { type, bombValue } = getRandomSymbol(isFreeSpins);
      col.push({
        id: `c${c}-r${r}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        bombValue
      });
    }
    grid.push(col);
  }
  return grid;
}

export const SweetBonanzaGame: React.FC<SweetBonanzaGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const [balance, setBalance] = useState<number>(user.balance);
  const [betIndex, setBetIndex] = useState<number>(2); // 50 BDT
  const [anteBetEnabled, setAnteBetEnabled] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [grid, setGrid] = useState<SweetCell[][]>(() => generateInitialGrid(false));
  const [lastWin, setLastWin] = useState<number>(0);
  const [totalRoundWin, setTotalRoundWin] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [tumbleCount, setTumbleCount] = useState<number>(0);
  const [winningGroups, setWinningGroups] = useState<TumbleWinGroup[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'সুইট বোনানজা ক্যান্ডি স্লটে স্বাগতম!' : 'Welcome to Sweet Bonanza Candy Wonderland!'
  );
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showBigWin, setShowBigWin] = useState<boolean>(false);
  const [scatterCount, setScatterCount] = useState<number>(0);

  const baseBet = BET_OPTIONS[betIndex];
  const actualBet = anteBetEnabled ? Math.round(baseBet * 1.25) : baseBet;

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    sweetAudio.enabled = next;
  };

  const changeBet = (delta: number) => {
    if (isSpinning) return;
    const next = Math.max(0, Math.min(BET_OPTIONS.length - 1, betIndex + delta));
    setBetIndex(next);
  };

  // Main spin handler
  const handleSpin = async (isBuyFeature = false) => {
    if (isSpinning) return;

    let cost = 0;
    if (isBuyFeature) {
      cost = baseBet * 100;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient Balance for Feature Buy!');
        return;
      }
      updateBalance(balance - cost);
    } else if (!isFreeSpinsActive) {
      cost = actualBet;
      if (balance < cost) {
        setStatusMessage(language === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই! ডিপোজিট করুন।' : 'Insufficient Balance! Please deposit.');
        setIsAutoSpin(false);
        return;
      }
      updateBalance(balance - cost);
    }

    setIsSpinning(true);
    setWinningGroups([]);
    setTotalRoundWin(0);
    setCurrentMultiplier(1);
    sweetAudio.playPop(1);

    if (isBuyFeature) {
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(10);
      setStatusMessage(language === 'bn' ? '🍭 ১০টি ফ্রি স্পিন সক্রিয় করা হয়েছে!' : '🍭 10 Free Spins Activated via Feature Buy!');
    }

    // Generate fresh columns
    let currentGrid = generateInitialGrid(isFreeSpinsActive || isBuyFeature);
    setGrid(currentGrid);

    // Count scatters
    let scatters = 0;
    currentGrid.forEach(col => {
      col.forEach(cell => {
        if (cell.type === 'lollipop') scatters++;
      });
    });
    setScatterCount(scatters);

    let roundWin = 0;
    let bombSum = 0;
    let tumbles = 0;

    // Tumble sequence loop
    let hasWins = true;
    while (hasWins) {
      tumbles++;
      setTumbleCount(tumbles);

      // 1. Evaluate scatter pays (8+ identical symbols anywhere)
      const counts: Record<string, number> = {};
      currentGrid.forEach(col => {
        col.forEach(cell => {
          if (cell.type !== 'lollipop' && cell.type !== 'bomb') {
            counts[cell.type] = (counts[cell.type] || 0) + 1;
          }
        });
      });

      const wins: TumbleWinGroup[] = [];
      const winningTypes = new Set<string>();

      Object.entries(counts).forEach(([type, count]) => {
        if (count >= 8) {
          winningTypes.add(type);
          const payDef = SWEET_PAYTABLE[type as SweetSymbolType];
          let mult = payDef.payouts.min8;
          if (count >= 12) mult = payDef.payouts.min12;
          else if (count >= 10) mult = payDef.payouts.min10;

          const winAmount = Math.round(baseBet * mult);
          wins.push({ type: type as SweetSymbolType, count, payout: winAmount });
          roundWin += winAmount;
        }
      });

      // Scatter payout check on first drop
      if (tumbles === 1 && scatters >= 4) {
        sweetAudio.playScatterLand();
        const scatterMult = scatters >= 6 ? 100 : scatters === 5 ? 5 : 3;
        const scatterWin = Math.round(baseBet * scatterMult);
        roundWin += scatterWin;
        wins.push({ type: 'lollipop', count: scatters, payout: scatterWin });

        if (!isFreeSpinsActive && !isBuyFeature) {
          setIsFreeSpinsActive(true);
          setFreeSpinsLeft(prev => prev + 10);
        } else if (isFreeSpinsActive) {
          setFreeSpinsLeft(prev => prev + 5);
        }
      }

      if (wins.length > 0) {
        setWinningGroups(wins);
        sweetAudio.playWinChime(wins.length);

        // Mark winning cells for highlight
        const markedGrid = currentGrid.map(col =>
          col.map(cell => ({
            ...cell,
            isWinning: winningTypes.has(cell.type)
          }))
        );
        setGrid(markedGrid);

        // Delay for explosion animation
        await new Promise(r => setTimeout(r, isTurbo ? 250 : 500));

        // Drop down remaining and fill from top
        const newGrid: SweetCell[][] = [];
        for (let c = 0; c < COLS; c++) {
          const surviving = markedGrid[c].filter(cell => !cell.isWinning);
          const needed = ROWS - surviving.length;
          const fresh: SweetCell[] = [];
          for (let i = 0; i < needed; i++) {
            const { type, bombValue } = getRandomSymbol(isFreeSpinsActive || isBuyFeature);
            fresh.push({
              id: `c${c}-r${i}-${Math.random().toString(36).substring(2, 7)}`,
              type,
              bombValue
            });
          }
          newGrid.push([...fresh, ...surviving]);
        }
        currentGrid = newGrid;
        setGrid(currentGrid);
        sweetAudio.playPop(1.1);

        await new Promise(r => setTimeout(r, isTurbo ? 200 : 350));
      } else {
        hasWins = false;
      }
    }

    // In Free Spins, sum up Multiplier Candy Bombs on screen
    if (isFreeSpinsActive || isBuyFeature) {
      currentGrid.forEach(col => {
        col.forEach(cell => {
          if (cell.type === 'bomb' && cell.bombValue) {
            bombSum += cell.bombValue;
          }
        });
      });

      if (bombSum > 0 && roundWin > 0) {
        sweetAudio.playBombExplode(bombSum);
        setCurrentMultiplier(bombSum);
        roundWin = Math.round(roundWin * bombSum);
      }
    }

    // Finalize win
    if (roundWin > 0) {
      setLastWin(roundWin);
      setTotalRoundWin(roundWin);
      updateBalance(balance + roundWin);
      gameEngine.recordRound(cost, roundWin, {
        gameId: 'game-sweet-bonanza',
        gameName: 'Sweet Bonanza',
        category: 'slot',
        vendor: 'Pragmatic Play'
      });

      if (roundWin >= baseBet * 10) {
        setShowBigWin(true);
        sweetAudio.playBigWin();
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        setTimeout(() => setShowBigWin(false), 2500);
      }

      setStatusMessage(
        language === 'bn'
          ? `🎉 ক্যান্ডি জয়: ৳ ${roundWin.toLocaleString()}! (${tumbles - 1} টাম্বল)`
          : `🎉 CANDY WIN: ৳ ${roundWin.toLocaleString()}! (${tumbles - 1} Tumbles)`
      );
    } else {
      if (!isFreeSpinsActive) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-sweet-bonanza',
          gameName: 'Sweet Bonanza',
          category: 'slot',
          vendor: 'Pragmatic Play'
        });
      }
      setStatusMessage(language === 'bn' ? 'পরবর্তী স্পিনে চেষ্টা করুন!' : 'No wins. Spin again for sweet treats!');
    }

    // Decrement free spins if active
    if (isFreeSpinsActive && freeSpinsLeft > 0) {
      setFreeSpinsLeft(prev => {
        const next = prev - 1;
        if (next === 0) {
          setIsFreeSpinsActive(false);
          setStatusMessage(language === 'bn' ? 'ফ্রি স্পিন রাউন্ড সমাপ্ত!' : 'Free Spins Complete!');
        }
        return next;
      });
    }

    setIsSpinning(false);
  };

  // Auto spin loop
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
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#4a044e] via-[#3b0764] to-[#1e1b4b] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      
      {/* 1. TOP HEADER BAR */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#2e0854]/95 border-b border-pink-500/40 flex items-center justify-between shrink-0 shadow-lg z-20">
        {/* Left: Back & Game Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold transition-all active:scale-95"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবি' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={sweetBonanzaIcon}
              alt="Sweet Bonanza"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-pink-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-yellow-300">
                  {language === 'bn' ? 'সুইট বোনানজা' : 'Sweet Bonanza'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-200 border border-pink-500/40">
                  Pragmatic Play
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live BDT Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#1f0338] border border-pink-400/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-pink-400 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right: Sound, Rules */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPaytable(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-pink-900/40 hover:bg-pink-800/60 text-pink-300 border border-pink-500/30 text-xs font-bold transition-all"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all ${
              isSoundOn
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN CANDY STAGE */}
      <div className="relative flex-1 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-950/40 via-[#2a0438] to-[#12011c]">
        
        {/* Top Feature Banners: Free Spins Banner & Status Message */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-2 px-2 py-1 bg-black/40 rounded-xl border border-pink-500/30 backdrop-blur-xs">
          <div className="flex items-center gap-2 truncate">
            {isFreeSpinsActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs animate-pulse shadow-md">
                🍭 FREE SPINS: {freeSpinsLeft}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-pink-500/30 text-pink-300 font-bold text-[11px] border border-pink-400/40">
                SCATTER PAYS (8+)
              </span>
            )}
            <span className="text-xs text-yellow-200 font-bold truncate">{statusMessage}</span>
          </div>

          {currentMultiplier > 1 && (
            <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs shadow-lg animate-bounce shrink-0">
              💣 {currentMultiplier}X BOMB!
            </div>
          )}
        </div>

        {/* 6x5 CANDY GRID CABINET */}
        <div className="relative w-full max-w-2xl flex-1 max-h-[56vh] sm:max-h-[62vh] my-1 p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-purple-900/60 via-pink-950/70 to-purple-950/80 border-2 border-pink-400/60 shadow-[0_0_40px_rgba(236,72,153,0.3)] flex flex-col justify-center">
          
          {/* Scatter counter watermark */}
          <div className="absolute top-2 right-3 text-[10px] font-black text-pink-300/80 bg-black/40 px-2 py-0.5 rounded-full border border-pink-500/30">
            🍭 SCATTERS: {scatterCount}/4
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-6 gap-1 sm:gap-2 h-full w-full">
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1 sm:gap-2 h-full justify-between">
                {col.map((cell) => {
                  const payDef = SWEET_PAYTABLE[cell.type];
                  return (
                    <div
                      key={cell.id}
                      className={`relative flex-1 rounded-xl flex flex-col items-center justify-center p-1 transition-all duration-300 shadow-md ${
                        cell.isWinning
                          ? 'ring-4 ring-yellow-300 scale-105 z-10 animate-pulse bg-yellow-400/40'
                          : `bg-gradient-to-b ${payDef.bgGrad} border border-white/20 hover:scale-[1.02]`
                      }`}
                    >
                      {/* Emoji / Symbol Icon */}
                      <span className="text-2xl sm:text-3xl filter drop-shadow-md select-none">
                        {payDef.emoji}
                      </span>

                      {/* Bomb multiplier badge */}
                      {cell.type === 'bomb' && cell.bombValue && (
                        <div className="absolute bottom-0.5 px-1 rounded-full bg-yellow-400 text-black font-black text-[9px] sm:text-[11px] shadow-md border border-white">
                          {cell.bombValue}X
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Winning Overlay Popup */}
          {winningGroups.length > 0 && (
            <div className="absolute inset-x-4 bottom-2 py-1 px-3 bg-black/85 rounded-xl border border-yellow-400/80 flex items-center justify-around text-xs font-bold text-yellow-300 shadow-2xl animate-in fade-in">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>
                  {winningGroups.map(w => `${w.count}x ${SWEET_PAYTABLE[w.type].emoji}`).join('  ')}
                </span>
              </div>
              <span className="font-black text-emerald-400">+৳ {winningGroups.reduce((acc, w) => acc + w.payout, 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 3. CONTROL CONSOLE */}
        <div className="w-full max-w-2xl bg-[#24043b]/95 border border-pink-500/40 rounded-2xl p-2 sm:p-3 shadow-xl flex flex-col gap-2 shrink-0">
          
          {/* Control Row: Ante Bet & Buy Free Spins */}
          <div className="flex items-center justify-between gap-2 text-xs">
            {/* Ante Bet Toggle */}
            <button
              onClick={() => !isSpinning && setAnteBetEnabled(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
                anteBetEnabled
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300 text-white shadow-md'
                  : 'bg-purple-950/60 border-purple-500/40 text-purple-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'ডাবল চান্স (+২৫%)' : '2X Chance (+25%)'}</span>
            </button>

            {/* Buy Feature Button */}
            <button
              onClick={() => !isSpinning && handleSpin(true)}
              disabled={isSpinning || isFreeSpinsActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 border border-yellow-300 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Gift className="w-3.5 h-3.5 text-yellow-200" />
              <span>{language === 'bn' ? `ফ্রি স্পিন কিনুন (৳ ${(baseBet * 100).toLocaleString()})` : `BUY FREE SPINS (৳ ${(baseBet * 100).toLocaleString()})`}</span>
            </button>
          </div>

          {/* Main Action Bar: Bet Controls, Turbo, Auto, and Giant Spin Button */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Bet Step Controls */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-pink-500/30">
              <button
                onClick={() => changeBet(-1)}
                disabled={isSpinning || betIndex === 0}
                className="w-8 h-8 rounded-lg bg-pink-900/60 hover:bg-pink-800 text-pink-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-2 text-center min-w-[70px]">
                <div className="text-[9px] text-pink-300 font-bold uppercase">{language === 'bn' ? 'বাজি' : 'Bet'}</div>
                <div className="text-sm font-black text-yellow-300">৳ {actualBet}</div>
              </div>
              <button
                onClick={() => changeBet(1)}
                disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
                className="w-8 h-8 rounded-lg bg-pink-900/60 hover:bg-pink-800 text-pink-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Multipliers / Presets */}
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
                      : 'bg-pink-950/40 border-pink-500/30 text-pink-300 hover:bg-pink-900/50'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Turbo Toggle */}
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all ${
                isTurbo
                  ? 'bg-amber-500 text-black border-yellow-200 font-black shadow-md'
                  : 'bg-pink-950/40 border-pink-500/30 text-pink-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Turbo</span>
            </button>

            {/* Auto Spin Toggle */}
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
                  : 'bg-pink-950/40 border-pink-500/30 text-pink-300'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              <span>{isAutoSpin ? `${autoSpinsLeft}` : 'Auto'}</span>
            </button>

            {/* Giant Candy Spin Button */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-400 hover:from-pink-400 hover:to-yellow-300 text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(236,72,153,0.6)] border-2 border-yellow-200 active:scale-95 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>{isSpinning ? '...' : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BIG WIN CELEBRATION MODAL */}
      {showBigWin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs animate-in zoom-in-95">
          <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-yellow-500 via-pink-600 to-purple-900 border-4 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.9)] max-w-sm">
            <h2 className="text-3xl font-black text-yellow-200 animate-bounce tracking-widest drop-shadow-md">
              🍬 BIG CANDY WIN! 🍬
            </h2>
            <div className="my-4 text-4xl sm:text-5xl font-black text-white font-game drop-shadow-lg">
              ৳ {lastWin.toLocaleString()}
            </div>
            <p className="text-sm font-bold text-yellow-200">
              {language === 'bn' ? 'অসাধারণ মিষ্টি জয়!' : 'Sweet Delicious Payout!'}
            </p>
          </div>
        </div>
      )}

      {/* 5. PAYTABLE & RULES MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-lg bg-[#25053d] border-2 border-pink-400 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-pink-500/40">
              <div className="flex items-center gap-2">
                <img
                  src={sweetBonanzaIcon}
                  alt="Sweet Bonanza"
                  className="w-7 h-7 rounded-md object-cover"
                />
                <h3 className="font-game text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'পে-টেবিল ও গেমের নিয়ম' : 'Paytable & Rules'}
                </h3>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-lg bg-pink-900/60 text-pink-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-pink-500/30">
                <h4 className="font-bold text-pink-200 mb-1">
                  {language === 'bn' ? '🍭 স্ক্যাটার পে সিস্টেম (Scatter Pays)' : '🍭 Scatter Pays System'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'যেকোনো স্থানে ৮ বা ততোধিক একই প্রতীক দেখা দিলে আপনি জিতবেন! বিজয়ী প্রতীক বিস্ফোরিত হয় এবং নতুন প্রতীক উপরে থেকে পড়ে (টাম্বল ফিচার)।'
                    : 'Match 8 or more identical symbols anywhere on the screen to win! Winning symbols explode and trigger tumbles, dropping new candies from above.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-pink-500/30">
                <h4 className="font-bold text-pink-200 mb-1">
                  {language === 'bn' ? '💣 মাল্টিপ্লায়ার বোমা (Free Spins Bombs)' : '💣 Multiplier Candy Bombs'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'ফ্রি স্পিন চলাকালীন ২x থেকে ১০০x পর্যন্ত রেইনবো বোমা আসতে পারে। টাম্বল শেষ হলে সমস্ত বোমার মান যোগ হয়ে মোট জয়ের সাথে গুণ হয়!'
                    : 'During Free Spins, rainbow multiplier bombs from 2X up to 100X can land. When all tumbles finish, all bomb values are summed and multiply your round win!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(SWEET_PAYTABLE).filter(s => s.type !== 'bomb').map(s => (
                  <div key={s.type} className="p-2 rounded-lg bg-black/40 border border-pink-500/20 flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-pink-200">{language === 'bn' ? s.nameBn : s.name}</div>
                      <div className="text-[10px] text-gray-400">
                        8+: {s.payouts.min8}x | 10+: {s.payouts.min10}x | 12+: {s.payouts.min12}x
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
