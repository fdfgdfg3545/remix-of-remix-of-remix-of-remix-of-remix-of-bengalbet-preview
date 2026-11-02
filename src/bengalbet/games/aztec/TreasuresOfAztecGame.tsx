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
import { AztecCell, AztecSymbolType, AZTEC_PAYTABLE, FrameType } from './aztecTypes';
import { aztecAudio } from './aztecAudio';
import aztecIcon from '../../assets/images/treasures_aztec_icon_1789330776428.jpg';
import { gameEngine } from '../../services/gameEngine';

interface Props {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const REELS = 6;
const ROWS = 5;
const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

const REGULAR_SYMBOLS: AztecSymbolType[] = [
  'ten', 'ten', 'ten',
  'jack', 'jack', 'jack',
  'queen', 'queen',
  'king', 'king',
  'ace', 'ace',
  'green_mask', 'green_mask',
  'blue_mask',
  'purple_mask',
  'pink_mask',
  'gold_mask'
];

function getRandomCell(isReelMiddle = false): AztecCell {
  // Scatter chance (Pyramid)
  if (Math.random() < 0.045) {
    return {
      id: Math.random().toString(36).substring(2, 8),
      type: 'scatter',
      frame: 'none'
    };
  }

  const type = REGULAR_SYMBOLS[Math.floor(Math.random() * REGULAR_SYMBOLS.length)];
  let frame: FrameType = 'none';

  // Wilds on the Way: silver frame can appear on reels 2,3,4,5
  if (isReelMiddle && Math.random() < 0.18) {
    frame = 'silver';
  }

  return {
    id: Math.random().toString(36).substring(2, 8),
    type,
    frame
  };
}

function generateInitialGrid(): { mainGrid: AztecCell[][]; topReel: AztecCell[] } {
  const mainGrid: AztecCell[][] = [];
  for (let c = 0; c < REELS; c++) {
    const col: AztecCell[] = [];
    const isMiddle = c >= 1 && c <= 4;
    for (let r = 0; r < ROWS; r++) {
      col.push(getRandomCell(isMiddle));
    }
    mainGrid.push(col);
  }

  // Top reel across reels 2, 3, 4, 5
  const topReel: AztecCell[] = [];
  for (let i = 0; i < 4; i++) {
    topReel.push(getRandomCell(true));
  }

  return { mainGrid, topReel };
}

export const TreasuresOfAztecGame: React.FC<Props> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const [balance, setBalance] = useState<number>(user.balance);
  const [betIndex, setBetIndex] = useState<number>(2); // 50 BDT
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [gridData, setGridData] = useState(() => generateInitialGrid());
  const [multiplier, setMultiplier] = useState<number>(1);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [cascadeCount, setCascadeCount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'ট্রেজার্স অফ আজটেক-এ স্বাগতম!' : 'Welcome to Treasures of Aztec!'
  );
  const [isSoundOn, setIsSoundOn] = useState<boolean>(true);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideo, setShowVideo] = useState<boolean>(false);
  const [showBigWin, setShowBigWin] = useState<boolean>(false);

  const currentBet = BET_OPTIONS[betIndex];

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const next = !isSoundOn;
    setIsSoundOn(next);
    aztecAudio.enabled = next;
  };

  const changeBet = (delta: number) => {
    if (isSpinning) return;
    const next = Math.max(0, Math.min(BET_OPTIONS.length - 1, betIndex + delta));
    setBetIndex(next);
  };

  // Main spin flow
  const handleSpin = async (isBuyFeature = false) => {
    if (isSpinning) return;

    let cost = 0;
    if (isBuyFeature) {
      cost = currentBet * 75;
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
    aztecAudio.playThud();

    let curMult = isFreeSpinsActive ? multiplier : 1;
    if (isBuyFeature) {
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(10);
      curMult = 2;
      setMultiplier(2);
      setStatusMessage(language === 'bn' ? '🏛️ ১০টি ফ্রি স্পিন বোনাস সক্রিয়!' : '🏛️ 10 Free Spins Bonus Activated!');
    } else if (!isFreeSpinsActive) {
      setMultiplier(1);
    }

    let { mainGrid, topReel } = generateInitialGrid();
    setGridData({ mainGrid, topReel });

    // Count scatters
    let scatters = 0;
    mainGrid.forEach(col => col.forEach(c => { if (c.type === 'scatter') scatters++; }));
    topReel.forEach(c => { if (c.type === 'scatter') scatters++; });

    if (scatters >= 4) {
      aztecAudio.playScatter();
      const extraSpins = 10 + (scatters - 4) * 2;
      if (!isFreeSpinsActive && !isBuyFeature) {
        setIsFreeSpinsActive(true);
        setFreeSpinsLeft(extraSpins);
        curMult = 2;
        setMultiplier(2);
        setStatusMessage(
          language === 'bn'
            ? `🏛️ ${scatters}টি স্ক্যাটার! ${extraSpins}টি ফ্রি স্পিন লাভ!`
            : `🏛️ ${scatters} SCATTERS! Won ${extraSpins} Free Spins!`
        );
      } else if (isFreeSpinsActive) {
        setFreeSpinsLeft(prev => prev + 4);
      }
    }

    // Cascade Evaluation Loop
    let accumulatedRoundWin = 0;
    let cascades = 0;
    let hasWins = true;

    while (hasWins) {
      cascades++;
      setCascadeCount(cascades);

      // Evaluate matching ways (adjacent reels from left to right)
      // Check each candidate regular symbol
      const winCandidates = Object.keys(AZTEC_PAYTABLE).filter(
        k => k !== 'wild' && k !== 'scatter'
      ) as AztecSymbolType[];

      let stepWin = 0;
      const winningCellIds = new Set<string>();

      for (const sym of winCandidates) {
        // Build reel symbol counts: reel 0 to 5
        const reelMatches: number[] = [];
        const matchedIdsPerReel: string[][] = [];

        for (let col = 0; col < REELS; col++) {
          const matchingCells: AztecCell[] = [];

          // Check main grid
          mainGrid[col].forEach(cell => {
            if (cell.type === sym || cell.type === 'wild') {
              matchingCells.push(cell);
            }
          });

          // Check top reel (sits on cols 1, 2, 3, 4)
          if (col >= 1 && col <= 4) {
            const topCell = topReel[col - 1];
            if (topCell && (topCell.type === sym || topCell.type === 'wild')) {
              matchingCells.push(topCell);
            }
          }

          if (matchingCells.length > 0) {
            reelMatches.push(matchingCells.length);
            matchedIdsPerReel.push(matchingCells.map(c => c.id));
          } else {
            break; // Must be consecutive from reel 0
          }
        }

        const matchLength = reelMatches.length;
        if (matchLength >= 3) {
          // Calculate ways
          const ways = reelMatches.reduce((acc, count) => acc * count, 1);
          const basePayout = AZTEC_PAYTABLE[sym].payouts[matchLength - 3] || 1;
          const payoutForSym = Math.round((currentBet * basePayout * ways) / 20);
          stepWin += payoutForSym;

          // Record winning IDs
          matchedIdsPerReel.forEach(ids => ids.forEach(id => winningCellIds.add(id)));
        }
      }

      if (stepWin > 0) {
        accumulatedRoundWin += stepWin * curMult;
        aztecAudio.playCascadeWin(curMult);

        // Advance multiplier
        if (isFreeSpinsActive || isBuyFeature) {
          curMult += 2; // +2 per cascade in free spins
        } else {
          curMult += 1; // +1 per cascade in base game
        }
        setMultiplier(curMult);

        // Highlight winning cells and apply Wilds on the Way transformations
        // Silver frame -> Gold frame, Gold frame -> Wild!
        let hadWildTransform = false;

        const updatedMain = mainGrid.map(col =>
          col.map(cell => {
            if (winningCellIds.has(cell.id)) {
              if (cell.frame === 'silver') {
                hadWildTransform = true;
                return { ...cell, frame: 'gold' as FrameType, isWinning: false };
              } else if (cell.frame === 'gold') {
                hadWildTransform = true;
                return { ...cell, type: 'wild' as AztecSymbolType, frame: 'none' as FrameType, isWinning: false };
              }
              return { ...cell, isWinning: true };
            }
            return cell;
          })
        );

        const updatedTop = topReel.map(cell => {
          if (winningCellIds.has(cell.id)) {
            if (cell.frame === 'silver') {
              hadWildTransform = true;
              return { ...cell, frame: 'gold' as FrameType, isWinning: false };
            } else if (cell.frame === 'gold') {
              hadWildTransform = true;
              return { ...cell, type: 'wild' as AztecSymbolType, frame: 'none' as FrameType, isWinning: false };
            }
            return { ...cell, isWinning: true };
          }
          return cell;
        });

        if (hadWildTransform) {
          aztecAudio.playWildUpgrade();
        }

        setGridData({ mainGrid: updatedMain, topReel: updatedTop });
        await new Promise(r => setTimeout(r, isTurbo ? 250 : 450));

        // Collapse winning cells and tumble new ones down
        const collapsedMain: AztecCell[][] = [];
        for (let col = 0; col < REELS; col++) {
          const surviving = updatedMain[col].filter(c => !c.isWinning);
          const needed = ROWS - surviving.length;
          const fresh: AztecCell[] = [];
          for (let i = 0; i < needed; i++) {
            fresh.push(getRandomCell(col >= 1 && col <= 4));
          }
          collapsedMain.push([...fresh, ...surviving]);
        }

        // Top reel horizontal shift
        const collapsedTop: AztecCell[] = updatedTop.map(c => {
          if (c.isWinning) {
            return getRandomCell(true);
          }
          return c;
        });

        mainGrid = collapsedMain;
        topReel = collapsedTop;
        setGridData({ mainGrid, topReel });
        aztecAudio.playThud();

        await new Promise(r => setTimeout(r, isTurbo ? 200 : 350));
      } else {
        hasWins = false;
      }
    }

    // Finalize win
    if (accumulatedRoundWin > 0) {
      setLastWin(accumulatedRoundWin);
      setRoundWin(accumulatedRoundWin);
      updateBalance(balance + accumulatedRoundWin);
      gameEngine.recordRound(cost, accumulatedRoundWin, {
        gameId: 'game-treasures-aztec',
        gameName: 'Treasures of Aztec',
        category: 'slot',
        vendor: 'PG Soft'
      });

      if (accumulatedRoundWin >= currentBet * 10) {
        setShowBigWin(true);
        aztecAudio.playBigWin();
        confetti({ particleCount: 80, spread: 85, origin: { y: 0.6 } });
        setTimeout(() => setShowBigWin(false), 2600);
      }

      setStatusMessage(
        language === 'bn'
          ? `🎉 আজটেক জয়: ৳ ${accumulatedRoundWin.toLocaleString()}! (${cascades - 1} ক্যাসকেড, ${curMult}X মাল্টিপ্লায়ার)`
          : `🎉 AZTEC WIN: ৳ ${accumulatedRoundWin.toLocaleString()}! (${cascades - 1} Cascades at ${curMult}X)`
      );
    } else {
      if (!isFreeSpinsActive) {
        gameEngine.recordRound(cost, 0, {
          gameId: 'game-treasures-aztec',
          gameName: 'Treasures of Aztec',
          category: 'slot',
          vendor: 'PG Soft'
        });
      }
      setStatusMessage(language === 'bn' ? 'স্পিন করুন ও আজটেক ধন খুঁজে নিন!' : 'Spin to uncover ancient Aztec treasures!');
    }

    // Free Spins counter decrement
    if (isFreeSpinsActive && freeSpinsLeft > 0) {
      setFreeSpinsLeft(prev => {
        const next = prev - 1;
        if (next === 0) {
          setIsFreeSpinsActive(false);
          setMultiplier(1);
          setStatusMessage(language === 'bn' ? 'আজটেক ফ্রি স্পিন সমাপ্ত!' : 'Aztec Free Spins Completed!');
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
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#141208] via-[#211b0b] to-[#0c0a04] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      
      {/* 1. HEADER BAR */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#1a1508]/95 border-b border-amber-500/40 flex items-center justify-between shrink-0 shadow-lg z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95"
            title="Exit Game"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবি' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={aztecIcon}
              alt="Treasures of Aztec"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-amber-400/60 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
                  {language === 'bn' ? 'ট্রেজার্স অফ আজটেক' : 'Treasures of Aztec'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/40">
                  PG Soft
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live BDT Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0e0c05] border border-amber-400/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-amber-400 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action icons: Video tutorial, rules, sound */}
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
            className="p-1.5 sm:p-2 rounded-lg bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-bold transition-all ${
              isSoundOn
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. GAME STAGE */}
      <div className="relative flex-1 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-[#1b1506] to-[#0a0803]">
        
        {/* Top Status & Multiplier Meter */}
        <div className="w-full max-w-2xl flex items-center justify-between gap-2 px-2 py-1 bg-black/50 rounded-xl border border-amber-500/40 backdrop-blur-xs">
          <div className="flex items-center gap-2 truncate">
            {isFreeSpinsActive ? (
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs animate-pulse shadow-md">
                🏛️ FREE SPINS: {freeSpinsLeft}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-400/40">
                32,400 WAYS
              </span>
            )}
            <span className="text-xs text-yellow-200 font-bold truncate">{statusMessage}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-md shrink-0">
            <Flame className="w-3.5 h-3.5" />
            <span>{multiplier}X MULTIPLIER</span>
          </div>
        </div>

        {/* AZTEC SLOT CABINET */}
        <div className="relative w-full max-w-2xl flex-1 max-h-[58vh] sm:max-h-[62vh] my-1 p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#2a1d08] via-[#1c1406] to-[#120d03] border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col justify-between">
          
          {/* TOP HORIZONTAL REEL (Spanning across reels 2, 3, 4, 5) */}
          <div className="w-full flex items-center justify-center mb-1.5">
            <div className="w-[66.66%] grid grid-cols-4 gap-1 sm:gap-1.5 p-1 bg-black/60 rounded-xl border border-amber-500/40 shadow-inner">
              {gridData.topReel.map((cell) => {
                const payDef = AZTEC_PAYTABLE[cell.type];
                return (
                  <div
                    key={cell.id}
                    className={`relative h-10 sm:h-12 rounded-lg flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                      cell.isWinning
                        ? 'ring-2 ring-yellow-300 scale-105 bg-yellow-400/40 animate-pulse'
                        : cell.frame === 'silver'
                        ? 'border-2 border-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.7)] bg-gradient-to-b from-slate-700 to-slate-900'
                        : cell.frame === 'gold'
                        ? 'border-2 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.8)] bg-gradient-to-b from-amber-600 to-yellow-800'
                        : `bg-gradient-to-b ${payDef.bgGrad} border border-white/10`
                    }`}
                  >
                    <span className="text-lg sm:text-xl">{payDef.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN 6-REEL GRID */}
          <div className="grid grid-cols-6 gap-1 sm:gap-1.5 flex-1 w-full">
            {gridData.mainGrid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1 sm:gap-1.5 h-full justify-between">
                {col.map((cell) => {
                  const payDef = AZTEC_PAYTABLE[cell.type];
                  return (
                    <div
                      key={cell.id}
                      className={`relative flex-1 rounded-xl flex items-center justify-center p-1 transition-all duration-200 shadow-md ${
                        cell.isWinning
                          ? 'ring-2 ring-yellow-300 scale-105 z-10 bg-yellow-400/40 animate-pulse'
                          : cell.frame === 'silver'
                          ? 'border-2 border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.6)] bg-gradient-to-b from-slate-700 to-slate-900'
                          : cell.frame === 'gold'
                          ? 'border-2 border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)] bg-gradient-to-b from-amber-600 to-yellow-800'
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

          {/* Winning Overlay Popup */}
          {roundWin > 0 && (
            <div className="absolute inset-x-4 bottom-2 py-1 px-3 bg-black/85 rounded-xl border border-yellow-400/80 flex items-center justify-between text-xs font-bold text-yellow-300 shadow-2xl animate-in fade-in">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{language === 'bn' ? 'আজটেক জয়!' : 'AZTEC CASCADE WIN!'}</span>
              </span>
              <span className="font-black text-emerald-400">+৳ {roundWin.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* 3. CONTROL PANEL */}
        <div className="w-full max-w-2xl bg-[#1c1406]/95 border border-amber-500/40 rounded-2xl p-2 sm:p-3 shadow-xl flex flex-col gap-2 shrink-0">
          
          {/* Feature Buy & Multiplier Ladder Row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 text-[11px] text-amber-300/80">
              <span>{language === 'bn' ? 'ওয়াইল্ডস-অন-দ্য-ওয়ে: সিলভার ➜ গোল্ড ➜ ওয়াইল্ড' : 'Wilds-on-the-Way: Silver ➜ Gold ➜ Wild'}</span>
            </div>

            <button
              onClick={() => !isSpinning && handleSpin(true)}
              disabled={isSpinning || isFreeSpinsActive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 border border-yellow-300 text-black font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <span>{language === 'bn' ? `ফ্রি স্পিন কিনুন (৳ ${(currentBet * 75).toLocaleString()})` : `BUY BONUS (৳ ${(currentBet * 75).toLocaleString()})`}</span>
            </button>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2">
            
            {/* Bet Step */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-amber-500/30">
              <button
                onClick={() => changeBet(-1)}
                disabled={isSpinning || betIndex === 0}
                className="w-8 h-8 rounded-lg bg-amber-950/60 hover:bg-amber-800 text-amber-200 flex items-center justify-center font-black disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="px-2 text-center min-w-[70px]">
                <div className="text-[9px] text-amber-300 font-bold uppercase">{language === 'bn' ? 'বাজি' : 'Bet'}</div>
                <div className="text-sm font-black text-yellow-300">৳ {currentBet}</div>
              </div>
              <button
                onClick={() => changeBet(1)}
                disabled={isSpinning || betIndex === BET_OPTIONS.length - 1}
                className="w-8 h-8 rounded-lg bg-amber-950/60 hover:bg-amber-800 text-amber-200 flex items-center justify-center font-black disabled:opacity-30"
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
                      : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/50'
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
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
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
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
              <span>{isAutoSpin ? `${autoSpinsLeft}` : 'Auto'}</span>
            </button>

            {/* Giant Aztec Spin Button */}
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning}
              className="px-6 sm:px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm sm:text-base tracking-wider uppercase shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-yellow-200 active:scale-95 transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5"
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
          <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-yellow-500 via-amber-600 to-amber-950 border-4 border-yellow-300 shadow-[0_0_80px_rgba(250,204,21,0.9)] max-w-sm">
            <h2 className="text-3xl font-black text-yellow-200 animate-bounce tracking-widest drop-shadow-md">
              🏛️ AZTEC MEGA WIN! 🏛️
            </h2>
            <div className="my-4 text-4xl sm:text-5xl font-black text-white font-game drop-shadow-lg">
              ৳ {lastWin.toLocaleString()}
            </div>
            <p className="text-sm font-bold text-yellow-200">
              {language === 'bn' ? 'প্রাচীন আজটেক ধন জয়!' : 'Ancient Aztec Treasure Unlocked!'}
            </p>
          </div>
        </div>
      )}

      {/* 5. PAYTABLE MODAL */}
      {showPaytable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3">
          <div className="relative w-full max-w-lg bg-[#1a1406] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/40">
              <div className="flex items-center gap-2">
                <img
                  src={aztecIcon}
                  alt="Treasures of Aztec"
                  className="w-7 h-7 rounded-md object-cover"
                />
                <h3 className="font-game text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'পে-টেবিল ও গেমের নিয়ম' : 'Paytable & Rules'}
                </h3>
              </div>
              <button
                onClick={() => setShowPaytable(false)}
                className="p-1 rounded-lg bg-amber-900/60 text-amber-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '🏛️ ওয়াইল্ডস-অন-দ্য-ওয়ে (Wilds-on-the-Way)' : '🏛️ Wilds-on-the-Way'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'রিল ২, ৩, ৪, বা ৫-এ রূপালী ফ্রেমযুক্ত প্রতীক যদি কোনো জয়ের অংশ হয়, তবে তা সোনার ফ্রেমে রূপান্তরিত হবে। সোনার ফ্রেমযুক্ত প্রতীক পুনরায় জিতলে তা ওয়াইল্ড প্রতীকে পরিণত হবে!'
                    : 'Silver-framed symbols involved in a win transform into gold-framed symbols on the next cascade. Gold-framed symbols that win transform into Wilds!'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30">
                <h4 className="font-bold text-yellow-300 mb-1">
                  {language === 'bn' ? '🔥 প্রোগ্রেসিভ মাল্টিপ্লায়ার' : '🔥 Progressive Multiplier'}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {language === 'bn'
                    ? 'মূল খেলায় প্রতিটি ক্যাসকেড জয়ের সাথে মাল্টিপ্লায়ার +১ বাড়ে। ফ্রি স্পিন রাউন্ডে মাল্টিপ্লায়ার ২X থেকে শুরু হয় এবং প্রতিটি ক্যাসকেডে +২ বৃদ্ধি পায় এবং কখনো রিসেট হয় না!'
                    : 'In base game, each cascade win increases multiplier by +1. In Free Spins, multiplier starts at 2X and increments by +2 with every cascade, never resetting!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.values(AZTEC_PAYTABLE).filter(s => s.type !== 'wild' && s.type !== 'scatter').map(s => (
                  <div key={s.type} className="p-2 rounded-lg bg-black/40 border border-amber-500/20 flex items-center gap-2">
                    <span className="text-2xl">{s.emoji}</span>
                    <div>
                      <div className="font-bold text-amber-200">{language === 'bn' ? s.nameBn : s.name}</div>
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
          <div className="relative w-full max-w-2xl bg-[#140f04] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/40 mb-3">
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-red-500" />
                <h3 className="font-game text-base sm:text-lg font-black text-yellow-300">
                  {language === 'bn' ? 'ট্রেজার্স অফ আজটেক গেমপ্লে ওয়াকথ্রু' : 'Treasures of Aztec Gameplay Walkthrough'}
                </h3>
              </div>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1 rounded-lg bg-amber-900/60 text-amber-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-amber-500/30">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/videoseries?list=PL_fake_aztec"
                title="Treasures of Aztec Gameplay"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-3 text-xs text-amber-200/80 text-center">
              {language === 'bn'
                ? 'ভিডিওতে দেখুন কীভাবে ওয়াইল্ডস-অন-দ্য-ওয়ে এবং ফ্রি স্পিন মাল্টিপ্লায়ার বিশাল জয় আনে!'
                : 'Watch how Wilds-on-the-Way and Free Spins progressive multipliers unlock maximum payouts!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
