// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserAccount } from '../../types';
import { 
  SlotCell, 
  MultiplierReelItem, 
  PaylineWin, 
  SpinResult, 
  FORTUNE_SYMBOLS 
} from './fortuneGemsTypes';
import { generateSpinResult } from './fortuneGemsEngine';
import { fortuneGemsAudio } from './fortuneGemsAudio';
import { FortuneSymbolView } from './FortuneSymbolView';
import { FortuneMultiplierReel } from './FortuneMultiplierReel';
import { FortuneWheelModal } from './FortuneWheelModal';
import { FortunePaytableModal } from './FortunePaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface FortuneGems3GameProps {
  language: 'en' | 'bn';
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
  onSwitchToSuperAce?: () => void;
}

const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000, 2500];

export const FortuneGems3Game: React.FC<FortuneGems3GameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance,
  onSwitchToSuperAce
}) => {
  // Edition: 3 (Split Symbols), 2 (Wheel focus), 1 (Classic)
  const [edition, setEdition] = useState<'gems3' | 'gems2' | 'gems1'>('gems3');

  // Player Financial state
  const [balance, setBalance] = useState<number>(() => user.balance || 2500);
  const [baseBet, setBaseBet] = useState<number>(50);
  const [extraBet, setExtraBet] = useState<boolean>(true); // Default ON for Fortune Gems 3!

  // The actual cost per spin = baseBet * (extraBet ? 1.5 : 1)
  const totalBet = extraBet ? baseBet * 1.5 : baseBet;

  // Sound and speed settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turboMode, setTurboMode] = useState(false);

  // Auto-spin state
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isAutoSpinActive, setIsAutoSpinActive] = useState<boolean>(false);
  const [showAutoSpinMenu, setShowAutoSpinMenu] = useState<boolean>(false);

  // Modals
  const [showPaytable, setShowPaytable] = useState(false);
  const [showWheelModal, setShowWheelModal] = useState(false);

  // Game Engine & Visual State
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelsSpinning, setReelsSpinning] = useState<boolean[]>([false, false, false, false]);

  // Initial 3x3 Grid
  const [grid, setGrid] = useState<SlotCell[][]>(() => {
    return [
      [
        { id: 'c-0-0', symbol: 'WILD', splitCount: 1 },
        { id: 'c-0-1', symbol: 'RED_GEM', splitCount: 1 },
        { id: 'c-0-2', symbol: 'BLUE_GEM', splitCount: 1 }
      ],
      [
        { id: 'c-1-0', symbol: 'GREEN_GEM', splitCount: 1 },
        { id: 'c-1-1', symbol: 'WILD', splitCount: 2 },
        { id: 'c-1-2', symbol: 'ACE', splitCount: 1 }
      ],
      [
        { id: 'c-2-0', symbol: 'KING', splitCount: 1 },
        { id: 'c-2-1', symbol: 'QUEEN', splitCount: 1 },
        { id: 'c-2-2', symbol: 'JACK', splitCount: 1 }
      ]
    ];
  });

  // Initial Multiplier Reel
  const [multiplierReel, setMultiplierReel] = useState<MultiplierReelItem[]>([
    { type: 'multiplier', value: 2 },
    { type: 'multiplier', value: 5 },
    { type: 'multiplier', value: 10 }
  ]);

  // Last Spin Wins
  const [activeWins, setActiveWins] = useState<PaylineWin[]>([]);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [currentWinDisplay, setCurrentWinDisplay] = useState<number>(0);

  // Big Win celebration overlay
  const [celebrationTier, setCelebrationTier] = useState<'big' | 'mega' | 'super' | null>(null);

  // Sync balance with external
  useEffect(() => {
    onUpdateBalance(balance);
  }, [balance, onUpdateBalance]);

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    fortuneGemsAudio.setMuted(!next);
  };

  // Toggle Extra Bet
  const handleToggleExtraBet = () => {
    if (isSpinning) return;
    const next = !extraBet;
    setExtraBet(next);
    fortuneGemsAudio.playExtraBetToggle(next);
  };

  // Switch Edition
  const handleSwitchEdition = (ed: 'gems3' | 'gems2' | 'gems1') => {
    if (isSpinning) return;
    fortuneGemsAudio.playButtonClick();
    setEdition(ed);
    if (ed === 'gems1') {
      setExtraBet(false);
    }
  };

  // Spin core function
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    if (balance < totalBet) {
      setIsAutoSpinActive(false);
      setAutoSpinCount(0);
      return;
    }

    // Deduct bet
    onUpdateBalance(balance - totalBet);
    setBalance(prev => prev - totalBet);
    setIsSpinning(true);
    setActiveWins([]);
    setLastWinAmount(0);
    setCurrentWinDisplay(0);
    setCelebrationTier(null);

    // Audio start
    fortuneGemsAudio.playSpinStart();

    // Set all reels to spinning
    setReelsSpinning([true, true, true, true]);

    // Generate result using slot engine
    const forceWheel = edition === 'gems2' && Math.random() < 0.12;
    const spinResult = generateSpinResult(
      baseBet,
      edition === 'gems3' ? extraBet : false,
      undefined,
      forceWheel
    );

    // In edition 1 or 2, force split count to 1 (pure classic)
    if (edition !== 'gems3') {
      spinResult.grid.forEach(row => {
        row.forEach(cell => {
          cell.splitCount = 1;
        });
      });
    }

    // Reel stop delays
    const spinDuration = turboMode ? 250 : 600;
    const stagger = turboMode ? 150 : 300;

    // Reel 0 stop
    setTimeout(() => {
      setReelsSpinning(prev => [false, prev[1], prev[2], prev[3]]);
      fortuneGemsAudio.playReelStop(0);
    }, spinDuration);

    // Reel 1 stop
    setTimeout(() => {
      setReelsSpinning(prev => [false, false, prev[2], prev[3]]);
      fortuneGemsAudio.playReelStop(1);
    }, spinDuration + stagger);

    // Reel 2 stop
    setTimeout(() => {
      setReelsSpinning(prev => [false, false, false, prev[3]]);
      fortuneGemsAudio.playReelStop(2);
    }, spinDuration + stagger * 2);

    // Reel 3 (Multiplier reel) stop & finalize
    setTimeout(() => {
      setReelsSpinning([false, false, false, false]);
      setGrid(spinResult.grid);
      setMultiplierReel(spinResult.multiplierReel);

      const activeMult = spinResult.activeMultiplier;
      fortuneGemsAudio.playMultiplierLock(activeMult.value);

      // Check if any split symbol landed
      if (edition === 'gems3') {
        const hasSplits = spinResult.grid.some(r => r.some(c => c.splitCount > 1));
        if (hasSplits) {
          fortuneGemsAudio.playSplitSymbolTrigger();
        }
      }

      // Check for Wheel Bonus
      if (spinResult.hasWheelBonus) {
        setTimeout(() => {
          setShowWheelModal(true);
        }, 500);
      } else {
        // Evaluate Normal Payline Wins
        if (spinResult.wins.length > 0) {
          setActiveWins(spinResult.wins);
          setLastWinAmount(spinResult.totalWin);
          setCurrentWinDisplay(spinResult.totalWin);
          setBalance(prev => {
            const next = prev + spinResult.totalWin;
            onUpdateBalance(next);
            return next;
          });

          gameEngine.recordRound(totalBet, spinResult.totalWin, {
            gameId: 'game-fortune-gems-3',
            gameName: 'Fortune Gems 3',
            category: 'slot',
            vendor: 'JILI'
          });

          fortuneGemsAudio.playLineWin(spinResult.activeMultiplier.value);

          // Big Win celebrations
          const winRatio = spinResult.totalWin / totalBet;
          if (winRatio >= 70) {
            setCelebrationTier('super');
            fortuneGemsAudio.playBigWinCelebration('super');
          } else if (winRatio >= 35) {
            setCelebrationTier('mega');
            fortuneGemsAudio.playBigWinCelebration('mega');
          } else if (winRatio >= 15) {
            setCelebrationTier('big');
            fortuneGemsAudio.playBigWinCelebration('big');
          }
        } else {
          gameEngine.recordRound(totalBet, 0, {
            gameId: 'game-fortune-gems-3',
            gameName: 'Fortune Gems 3',
            category: 'slot',
            vendor: 'JILI'
          });
        }
      }

      setIsSpinning(false);

      // Handle Auto Spin decrement
      if (isAutoSpinActive) {
        if (autoSpinCount > 1) {
          setAutoSpinCount(prev => prev - 1);
        } else if (autoSpinCount === 1) {
          setAutoSpinCount(0);
          setIsAutoSpinActive(false);
        }
      }
    }, spinDuration + stagger * 3);
  }, [
    isSpinning,
    balance,
    totalBet,
    baseBet,
    extraBet,
    turboMode,
    edition,
    isAutoSpinActive,
    autoSpinCount
  ]);

  // Trigger next auto-spin
  useEffect(() => {
    if (isAutoSpinActive && !isSpinning && autoSpinCount > 0 && !showWheelModal) {
      const timer = setTimeout(() => {
        handleSpin();
      }, turboMode ? 400 : 900);
      return () => clearTimeout(timer);
    }
  }, [isAutoSpinActive, isSpinning, autoSpinCount, handleSpin, turboMode, showWheelModal]);

  // Spacebar to spin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpinning && !showWheelModal && !showPaytable) {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSpin, isSpinning, showWheelModal, showPaytable]);

  // Claim Wheel Bonus win
  const handleWheelClaim = (amount: number) => {
    setBalance(prev => {
      const next = prev + amount;
      onUpdateBalance(next);
      return next;
    });
    setLastWinAmount(amount);
    setCurrentWinDisplay(amount);
    setShowWheelModal(false);
    gameEngine.recordRound(totalBet, amount, {
      gameId: 'game-fortune-gems-3',
      gameName: 'Fortune Gems 3 (Wheel Bonus)',
      category: 'slot',
      vendor: 'JILI'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden select-none">
      {/* Container simulating JILI slot cabinet */}
      <div className="relative w-full max-w-4xl h-full max-h-[96vh] flex flex-col bg-gradient-to-b from-[#1c0e2a] via-[#11071c] to-[#08030e] text-white rounded-2xl border-2 border-yellow-600/70 shadow-[0_0_50px_rgba(202,138,4,0.3)] overflow-hidden">
        
        {/* ================= TOP HEADER BAR ================= */}
        <div className="w-full px-3 py-2 bg-gradient-to-r from-[#2a133d] via-[#1a0b27] to-[#2a133d] border-b border-amber-900/60 flex items-center justify-between z-30">
          {/* Left: Brand & Game Edition Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl drop-shadow">🦅</span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
                    {edition === 'gems3'
                      ? (language === 'bn' ? 'ফরচুন জেমস ৩' : 'FORTUNE GEMS 3')
                      : edition === 'gems2'
                      ? (language === 'bn' ? 'ফরচুন জেমস ২' : 'FORTUNE GEMS 2')
                      : (language === 'bn' ? 'ফরচুন জেমস ১' : 'FORTUNE GEMS 1')}
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 border border-yellow-500/50 text-[9px] font-bold text-yellow-300 rounded">
                    JILI
                  </span>
                </div>
                <div className="text-[10px] text-amber-300/70 hidden sm:block">
                  {edition === 'gems3'
                    ? (language === 'bn' ? 'স্প্লিট সিম্বল + মাল্টিপ্লায়ার রিল' : 'Split Symbols ⚡ + Multiplier Reel')
                    : (language === 'bn' ? 'গরুড়া বোনাস হুইল' : 'Garuda Bonus Wheel Feature')}
                </div>
              </div>
            </div>

            {/* Switch Edition Buttons */}
            <div className="flex items-center gap-1 ml-1 sm:ml-3">
              <button
                onClick={() => handleSwitchEdition('gems3')}
                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-black transition cursor-pointer border ${
                  edition === 'gems3'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.7)]'
                    : 'bg-black/40 text-amber-300/70 border-amber-900/40 hover:text-white'
                }`}
              >
                GEMS 3
              </button>
              <button
                onClick={() => handleSwitchEdition('gems2')}
                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-black transition cursor-pointer border ${
                  edition === 'gems2'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.7)]'
                    : 'bg-black/40 text-amber-300/70 border-amber-900/40 hover:text-white'
                }`}
              >
                GEMS 2
              </button>
              <button
                onClick={() => handleSwitchEdition('gems1')}
                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-black transition cursor-pointer border ${
                  edition === 'gems1'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-yellow-200 shadow-[0_0_8px_rgba(234,179,8,0.7)]'
                    : 'bg-black/40 text-amber-300/70 border-amber-900/40 hover:text-white'
                }`}
              >
                GEMS 1
              </button>
            </div>
          </div>

          {/* Right: Sound, Paytable, Super Ace Jump, Close */}
          <div className="flex items-center gap-2">
            {onSwitchToSuperAce && (
              <button
                onClick={onSwitchToSuperAce}
                className="px-2 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-[10px] sm:text-xs font-bold text-indigo-300 hover:bg-indigo-900 transition flex items-center gap-1 cursor-pointer"
                title="Switch to Super Ace"
              >
                <span>♠</span>
                <span className="hidden sm:inline">Super Ace</span>
              </button>
            )}

            <button
              onClick={() => setShowPaytable(true)}
              className="px-2 py-1 rounded-lg bg-amber-950/80 border border-yellow-600/60 text-[10px] sm:text-xs font-bold text-yellow-300 hover:bg-amber-900 transition flex items-center gap-1 cursor-pointer"
            >
              <span>ℹ️</span>
              <span className="hidden sm:inline">{language === 'bn' ? 'নিয়মাবলী' : 'Rules'}</span>
            </button>

            <button
              onClick={toggleSound}
              className="w-8 h-8 rounded-lg bg-black/50 border border-amber-900/60 text-amber-300 flex items-center justify-center text-sm cursor-pointer hover:bg-black/80"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-600/60 text-red-300 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-red-900"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================= MIDDLE GAME PLAY AREA ================= */}
        <div className="flex-1 flex flex-col items-center justify-between p-2 sm:p-4 relative overflow-hidden">
          {/* Temple Aztec decorative background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#f59e0b_0,transparent_70%)] pointer-events-none" />

          {/* Upper Info Row: Jackpot Bar & Extra Bet Feature Banner */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 max-w-2xl px-2">
            {/* Grand Jackpot Meter */}
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-950/80 via-black to-amber-950/80 border border-yellow-500/60 rounded-xl shadow">
              <span className="text-sm">👑</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                GRAND JACKPOT
              </span>
              <span className="text-xs sm:text-sm font-black text-yellow-300 font-mono">
                ৳ 4,950,000.00
              </span>
            </div>

            {/* Extra Bet Toggle Banner (For Fortune Gems 3) */}
            {edition === 'gems3' && (
              <button
                onClick={handleToggleExtraBet}
                disabled={isSpinning}
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border transition-all duration-200 cursor-pointer ${
                  extraBet
                    ? 'bg-gradient-to-r from-red-600/30 via-amber-500/30 to-yellow-500/30 border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-black/40 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                <span className={`text-base ${extraBet ? 'animate-bounce' : 'opacity-50'}`}>
                  🔥
                </span>
                <div className="text-left">
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1 text-yellow-300">
                    <span>{language === 'bn' ? 'এক্সট্রা বেট (+৫০%)' : 'EXTRA BET (+50%)'}</span>
                    <span className={`text-[9px] px-1 rounded font-bold ${extraBet ? 'bg-yellow-400 text-black' : 'bg-zinc-700 text-white'}`}>
                      {extraBet ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div className="text-[9px] text-amber-200/80">
                    {language === 'bn' ? '১x রিল বাদ ও স্প্লিট বুস্ট!' : '1X Removed & Boosted Splits!'}
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Main Slot Stage: 3x3 Grid + 4th Multiplier Reel */}
          <div className="relative flex items-center justify-center gap-2 sm:gap-4 my-auto p-2 sm:p-4 rounded-2xl bg-gradient-to-b from-[#180a24] via-[#0d0515] to-[#180a24] border-2 border-yellow-500/60 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            {/* Payline markers column (Left) */}
            <div className="flex flex-col justify-around h-60 sm:h-72 py-2">
              {[2, 1, 3].map(lineNum => (
                <div
                  key={lineNum}
                  className="w-5 h-5 rounded-full bg-amber-950/80 border border-yellow-500/50 text-yellow-300 font-bold text-[10px] flex items-center justify-center shadow"
                >
                  {lineNum}
                </div>
              ))}
            </div>

            {/* 3x3 Main Reels Grid */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 w-60 sm:w-80 h-60 sm:h-72">
              {grid.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isReelSpinning = reelsSpinning[colIdx];

                  return (
                    <div
                      key={cell.id}
                      className={`relative w-full h-full transition-transform duration-200 ${
                        isReelSpinning ? 'animate-pulse blur-[1px]' : ''
                      }`}
                    >
                      <FortuneSymbolView
                        symbol={cell.symbol}
                        splitCount={edition === 'gems3' ? cell.splitCount : 1}
                        isWinning={cell.isWinning}
                        size="md"
                      />
                    </div>
                  );
                })
              )}
            </div>

            {/* 4th Special Multiplier Reel */}
            <div className="h-60 sm:h-72">
              <FortuneMultiplierReel
                items={multiplierReel}
                isSpinning={reelsSpinning[3]}
                extraBet={edition === 'gems3' ? extraBet : false}
                language={language}
              />
            </div>

            {/* Payline markers column (Right) */}
            <div className="flex flex-col justify-around h-60 sm:h-72 py-2">
              {[4, 1, 5].map(lineNum => (
                <div
                  key={lineNum}
                  className="w-5 h-5 rounded-full bg-amber-950/80 border border-yellow-500/50 text-yellow-300 font-bold text-[10px] flex items-center justify-center shadow"
                >
                  {lineNum}
                </div>
              ))}
            </div>
          </div>

          {/* Win Status Ribbon */}
          <div className="w-full max-w-xl min-h-[36px] flex items-center justify-center px-4 py-1 rounded-xl bg-black/60 border border-amber-900/60 text-center">
            {activeWins.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 animate-in zoom-in-95 duration-200">
                <span className="text-yellow-300 font-black text-xs uppercase tracking-wider">
                  {language === 'bn' ? 'জয়!' : 'WIN!'}
                </span>
                <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  ৳{currentWinDisplay.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {activeWins.map((w, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded border border-yellow-500/40"
                  >
                    Line {w.lineId}: {FORTUNE_SYMBOLS[w.symbol].name} × {w.totalMultiplier}X
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-amber-200/60 font-medium">
                {language === 'bn'
                  ? '৩টি মিলে জয় পান! ৪র্থ রিল গুণক প্রয়োগ করবে।'
                  : 'Match 3 identical symbols! 4th reel multiplies all line wins.'}
              </span>
            )}
          </div>
        </div>

        {/* ================= BOTTOM CONTROL DASHBOARD ================= */}
        <div className="w-full p-3 sm:p-4 bg-gradient-to-t from-black via-[#160a22] to-[#1c0d2b] border-t-2 border-yellow-600/50 flex flex-col gap-2 z-30">
          {/* Financials & Bet Level Bar */}
          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Player Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-amber-900/60">
              <span className="text-amber-400 font-bold">
                {language === 'bn' ? 'ব্যালেন্স:' : 'BALANCE:'}
              </span>
              <span className="text-sm font-black text-white font-mono">
                ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Quick Bet Buttons (Min / Presets / Max) */}
            <div className="hidden sm:flex items-center gap-1.5">
              {BET_OPTIONS.slice(0, 5).map(amt => (
                <button
                  key={amt}
                  onClick={() => {
                    fortuneGemsAudio.playButtonClick();
                    setBaseBet(amt);
                  }}
                  disabled={isSpinning}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                    baseBet === amt
                      ? 'bg-yellow-500 text-black border-yellow-200 font-black'
                      : 'bg-black/50 text-zinc-300 border-zinc-700 hover:border-yellow-500/50'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>

            {/* Total Bet Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 border border-amber-900/60">
              <span className="text-amber-400 font-bold">
                {language === 'bn' ? 'মোট বাজি:' : 'TOTAL BET:'}
              </span>
              <span className="text-sm font-black text-yellow-300 font-mono">
                ৳{totalBet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Interactive Spin Controls Row */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mt-1">
            {/* Bet - / + Step Controls */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-amber-900/60">
              <button
                onClick={() => {
                  fortuneGemsAudio.playButtonClick();
                  const idx = BET_OPTIONS.indexOf(baseBet);
                  if (idx > 0) setBaseBet(BET_OPTIONS[idx - 1]);
                }}
                disabled={isSpinning || baseBet <= BET_OPTIONS[0]}
                className="w-8 h-8 rounded-lg bg-amber-950/80 border border-yellow-600/50 text-yellow-300 font-black text-lg flex items-center justify-center cursor-pointer hover:bg-amber-900 disabled:opacity-40"
              >
                −
              </button>

              <div className="px-3 text-center min-w-[70px]">
                <span className="text-[9px] text-amber-300/80 block font-bold uppercase">
                  {language === 'bn' ? 'বেস বাজি' : 'BASE BET'}
                </span>
                <span className="text-sm font-black text-white font-mono">
                  ৳{baseBet}
                </span>
              </div>

              <button
                onClick={() => {
                  fortuneGemsAudio.playButtonClick();
                  const idx = BET_OPTIONS.indexOf(baseBet);
                  if (idx < BET_OPTIONS.length - 1) setBaseBet(BET_OPTIONS[idx + 1]);
                }}
                disabled={isSpinning || baseBet >= BET_OPTIONS[BET_OPTIONS.length - 1]}
                className="w-8 h-8 rounded-lg bg-amber-950/80 border border-yellow-600/50 text-yellow-300 font-black text-lg flex items-center justify-center cursor-pointer hover:bg-amber-900 disabled:opacity-40"
              >
                +
              </button>
            </div>

            {/* Turbo Mode Toggle */}
            <button
              onClick={() => {
                fortuneGemsAudio.playButtonClick();
                setTurboMode(!turboMode);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer border flex items-center gap-1.5 ${
                turboMode
                  ? 'bg-amber-500/20 text-yellow-300 border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                  : 'bg-black/50 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span className="hidden sm:inline">TURBO</span>
            </button>

            {/* Big Center Golden Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || balance < totalBet}
              className={`flex-1 max-w-[200px] sm:max-w-[240px] py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${
                isSpinning
                  ? 'bg-gradient-to-r from-amber-700 to-yellow-600 text-yellow-200'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black animate-pulse'
              }`}
            >
              <span>{isSpinning ? '🌀' : '🦅'}</span>
              <span>
                {isSpinning
                  ? (language === 'bn' ? 'স্পিন হচ্ছে...' : 'SPINNING...')
                  : (language === 'bn' ? 'স্পিন' : 'SPIN')}
              </span>
            </button>

            {/* Auto Spin Button & Dropdown */}
            <div className="relative">
              {isAutoSpinActive ? (
                <button
                  onClick={() => {
                    fortuneGemsAudio.playButtonClick();
                    setIsAutoSpinActive(false);
                    setAutoSpinCount(0);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-red-600 border border-red-300 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow animate-pulse"
                >
                  <span>⏹</span>
                  <span>STOP ({autoSpinCount})</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAutoSpinMenu(!showAutoSpinMenu)}
                  disabled={isSpinning}
                  className="px-3 py-2.5 rounded-xl bg-black/60 border border-amber-900/60 text-amber-300 hover:text-yellow-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">AUTO</span>
                </button>
              )}

              {/* Auto Spin count popover */}
              {showAutoSpinMenu && !isAutoSpinActive && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1b0d28] border-2 border-yellow-500/70 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col gap-1 z-40 min-w-[120px]">
                  <span className="text-[10px] text-amber-300/80 font-bold uppercase text-center pb-1 border-b border-amber-900/60">
                    {language === 'bn' ? 'অটো স্পিন সংখ্যা' : 'Auto Spins'}
                  </span>
                  {[10, 25, 50, 100].map(cnt => (
                    <button
                      key={cnt}
                      onClick={() => {
                        fortuneGemsAudio.playButtonClick();
                        setAutoSpinCount(cnt);
                        setIsAutoSpinActive(true);
                        setShowAutoSpinMenu(false);
                        handleSpin();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-yellow-500 hover:text-black text-xs font-bold text-zinc-200 transition cursor-pointer text-center"
                    >
                      {cnt} Spins
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= BIG WIN CELEBRATION OVERLAY ================= */}
        {celebrationTier && (
          <div
            onClick={() => setCelebrationTier(null)}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md cursor-pointer animate-in zoom-in-90 duration-300 select-none"
          >
            <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-[#2d1442] via-[#1b0a2c] to-[#0d0516] border-4 border-yellow-400 shadow-[0_0_80px_rgba(250,204,21,0.8)] max-w-sm sm:max-w-md w-full mx-4">
              <span className="text-5xl sm:text-6xl animate-bounce block mb-2">
                {celebrationTier === 'super' ? '👑' : celebrationTier === 'mega' ? '💎' : '🔥'}
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-300 drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)] uppercase tracking-wider">
                {celebrationTier === 'super'
                  ? (language === 'bn' ? 'সুপার উইন!' : 'SUPER WIN!')
                  : celebrationTier === 'mega'
                  ? (language === 'bn' ? 'মেগা উইন!' : 'MEGA WIN!')
                  : (language === 'bn' ? 'বিগ উইন!' : 'BIG WIN!')}
              </h2>

              <div className="text-4xl sm:text-5xl font-black text-white font-mono mt-3 text-yellow-300 drop-shadow">
                ৳{lastWinAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              <p className="text-xs text-amber-200/80 mt-4">
                {language === 'bn' ? 'চালিয়ে যেতে ক্লিক করুন' : 'Tap anywhere to continue'}
              </p>
            </div>
          </div>
        )}

        {/* ================= MODALS ================= */}
        <FortunePaytableModal
          isOpen={showPaytable}
          language={language}
          onClose={() => setShowPaytable(false)}
        />

        <FortuneWheelModal
          isOpen={showWheelModal}
          betAmount={totalBet}
          language={language}
          onClaim={handleWheelClaim}
          onClose={() => setShowWheelModal(false)}
        />
      </div>
    </div>
  );
};
