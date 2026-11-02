// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  HelpCircle,
  Youtube,
  Zap,
  RotateCw,
  Sparkles,
  ShoppingBag,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import { MagicAceCard, MagicAceCascadeResult } from './magicAceTypes';
import {
  generateInitialGrid,
  evaluateMagicAceCascades,
  applyEliminationAndDrops,
  BASE_MULTIPLIERS,
  FREE_SPIN_MULTIPLIERS
} from './magicAceEngine';
import { magicAceAudio } from './magicAceAudio';
import { MagicAceCardView } from './MagicAceCardView';
import { MagicAcePaytableModal } from './MagicAcePaytableModal';
import { MagicAceVideoModal } from './MagicAceVideoModal';
import magicAceIcon from '../../assets/images/magic_ace_icon_1789330338430.jpg';
import { gameEngine } from '../../services/gameEngine';

interface GameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const MagicAceGame: React.FC<GameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  // State
  const [balance, setBalance] = useState<number>(user.balance || 5000);
  const [bet, setBet] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);

  // Free Game Mode
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const isFreeSpins = freeSpinsLeft > 0;

  // Grid & Multiplier step (0 to 3)
  const initial = useRef(generateInitialGrid());
  const [grid, setGrid] = useState<MagicAceCard[][]>(initial.current);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Win and message
  const [roundTotalWin, setRoundTotalWin] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'ম্যাজিক এস ওয়াইল্ড লকে স্বাগতম!' : 'Welcome to Magic Ace Wild Lock!'
  );

  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const muted = magicAceAudio.toggleMute();
    setIsMuted(muted);
  };

  // Perform cascading round
  const handleSpin = (isFreeRound: boolean = isFreeSpins) => {
    if (isSpinning) return;

    if (!isFreeRound && balance < bet) {
      setStatusMessage(
        language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স! ডিপোজিট করুন।' : 'Insufficient balance! Please deposit.'
      );
      setIsAutoSpin(false);
      return;
    }

    const cost = isFreeRound ? 0 : bet;
    if (!isFreeRound) {
      updateBalance(balance - bet);
    } else {
      setFreeSpinsLeft(prev => Math.max(0, prev - 1));
    }

    setIsSpinning(true);
    setRoundTotalWin(0);
    setStepIndex(0);
    magicAceAudio.playSpin();

    setStatusMessage(
      isFreeRound
        ? (language === 'bn' ? `🎩 ফ্রি স্পিন চলছে (বাকি: ${freeSpinsLeft - 1})` : `🎩 Free Spin running (${freeSpinsLeft - 1} left)`)
        : (language === 'bn' ? 'কার্ড ডিল হচ্ছে...' : 'Cards dealing...')
    );

    // Initial drop
    const newGrid = generateInitialGrid(isFreeRound);
    setGrid(newGrid);

    const speed = isTurbo ? 400 : 700;

    // Start cascading chain
    let currentStep = 0;
    let accumulatedWin = 0;
    let workingGrid = newGrid;

    const runCascadeStep = () => {
      const cascade: MagicAceCascadeResult = evaluateMagicAceCascades(
        workingGrid,
        currentStep,
        bet,
        isFreeRound
      );

      setGrid(cascade.grid);
      setStepIndex(currentStep);

      if (cascade.wins.length > 0) {
        accumulatedWin += cascade.stepWin;
        setRoundTotalWin(accumulatedWin);
        setLastWin(accumulatedWin);

        magicAceAudio.playElimination(currentStep);

        setStatusMessage(
          language === 'bn'
            ? `✨ জয়! ৳ ${accumulatedWin.toLocaleString()} (${cascade.stepMultiplier}X মাল্টিপ্লায়ার)`
            : `✨ WIN! ৳ ${accumulatedWin.toLocaleString()} (${cascade.stepMultiplier}X Multiplier)`
        );

        // Next cascade after delay
        setTimeout(() => {
          const { nextGrid, newWildLocks } = applyEliminationAndDrops(cascade.grid, isFreeRound);
          workingGrid = nextGrid;
          setGrid(nextGrid);

          if (newWildLocks > 0) {
            magicAceAudio.playWildLock();
          }

          currentStep = Math.min(currentStep + 1, 3);
          setTimeout(runCascadeStep, speed);
        }, speed);
      } else {
        // Cascade finished
        setIsSpinning(false);

        if (accumulatedWin > 0) {
          updateBalance(balance - (isFreeRound ? 0 : bet) + accumulatedWin);
          gameEngine.recordRound(cost, accumulatedWin, {
            gameId: 'game-magic-ace',
            gameName: 'Magic Ace',
            category: 'slot',
            vendor: 'JILI'
          });

          if (accumulatedWin >= bet * 10) {
            magicAceAudio.playBigWin();
            confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
            setStatusMessage(
              language === 'bn'
                ? `🔥 মেগা ম্যাজিক উইন! ৳ ${accumulatedWin.toLocaleString()}`
                : `🔥 MEGA MAGIC WIN! ৳ ${accumulatedWin.toLocaleString()}`
            );
          }
        } else {
          if (!isFreeRound) {
            gameEngine.recordRound(cost, 0, {
              gameId: 'game-magic-ace',
              gameName: 'Magic Ace',
              category: 'slot',
              vendor: 'JILI'
            });
          }
          setStatusMessage(
            language === 'bn' ? 'পরবর্তী স্পিনে আবার চেষ্টা করুন!' : 'Better luck next spin!'
          );
        }

        // Award Free Spins if 3+ Scatters
        if (cascade.freeSpinsAwarded > 0) {
          magicAceAudio.playFreeSpinsTrigger();
          setFreeSpinsLeft(prev => prev + cascade.freeSpinsAwarded);
          confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 } });
          setStatusMessage(
            language === 'bn'
              ? `🎉 অভিনন্দন! ${cascade.freeSpinsAwarded}টি ফ্রি স্পিন অর্জিত!`
              : `🎉 CONGRATULATIONS! ${cascade.freeSpinsAwarded} FREE SPINS AWARDED!`
          );
        }
      }
    };

    setTimeout(runCascadeStep, speed);
  };

  // Buy Feature Handler
  const handleBuyBonus = () => {
    const cost = bet * 50;
    if (balance < cost) {
      setStatusMessage(
        language === 'bn' ? 'ফিচার বাই করার জন্য পর্যাপ্ত ব্যালেন্স নেই!' : 'Insufficient balance to Buy Feature!'
      );
      return;
    }

    updateBalance(balance - cost);
    setShowBuyModal(false);
    setFreeSpinsLeft(10);
    magicAceAudio.playFreeSpinsTrigger();
    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });

    setStatusMessage(
      language === 'bn'
        ? '👑 ১০টি ফ্রি গেমস আনলক হয়েছে (ওয়াইল্ড লক সহ)!'
        : '👑 10 Free Games Unlocked with Wild Locks!'
    );
  };

  // Auto spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning) {
      if (freeSpinsLeft > 0) {
        timer = setTimeout(() => {
          handleSpin(true);
        }, isTurbo ? 500 : 1000);
      } else if (isAutoSpin && autoSpinCount > 0) {
        timer = setTimeout(() => {
          setAutoSpinCount(prev => prev - 1);
          handleSpin(false);
        }, isTurbo ? 600 : 1200);
      } else if (isAutoSpin && autoSpinCount === 0) {
        setIsAutoSpin(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isSpinning, freeSpinsLeft, isAutoSpin, autoSpinCount]);

  const activeMultipliers = isFreeSpins ? FREE_SPIN_MULTIPLIERS : BASE_MULTIPLIERS;

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#140321] via-[#090112] to-[#030006] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      {/* 1. TOP CASINO BAR (Game System Header) */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#0d0217]/95 border-b border-purple-500/30 flex items-center justify-between shrink-0 shadow-lg z-20">
        {/* Left: Back & Game Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all active:scale-95"
            title="Exit Game & Return to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবিতে ফিরুন' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={magicAceIcon}
              alt="Magic Ace"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-purple-400/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-300">
                  {language === 'bn' ? 'ম্যাজিক এস' : 'Magic Ace'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                  JILI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#1f0730] border border-purple-500/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-purple-300 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Free Spins Badge */}
          {freeSpinsLeft > 0 && (
            <div className="px-2.5 py-1 rounded-full bg-pink-500/30 border border-pink-400 text-pink-300 font-game text-xs font-black animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FREE: {freeSpinsLeft}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Buy Feature Button (Features Buy Today from YouTube Video!) */}
          <button
            onClick={() => setShowBuyModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 text-xs font-black font-game tracking-wider shadow-md hover:brightness-110 active:scale-95"
            title="Buy Free Spins Feature"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'bn' ? 'ফিচার কিনুন' : 'BUY FEATURE'}</span>
          </button>

          {/* YouTube Video Walkthrough button */}
          <button
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all active:scale-95 shadow"
            title="Watch Magic Ace Wild Lock Highlights Video"
          >
            <Youtube className="w-4 h-4 text-white fill-white" />
            <span className="hidden md:inline">{language === 'bn' ? 'ভিডিও টিপস' : 'Video'}</span>
          </button>

          {/* Paytable */}
          <button
            onClick={() => setShowPaytable(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/20"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 border border-purple-500/20"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN CASINO STAGE (Non-scrolling, adaptive flex arena) */}
      <main className="flex-1 w-full min-h-0 flex flex-col items-center justify-between p-2 sm:p-3 overflow-hidden relative">
        {/* Elimination Multiplier Meter on Top */}
        <div className="w-full max-w-lg flex items-center justify-between gap-1.5 bg-[#170526]/80 p-1.5 rounded-2xl border border-purple-500/40 shadow-md">
          {activeMultipliers.map((mult, idx) => {
            const isActive = stepIndex === idx;
            return (
              <div
                key={mult}
                className={`flex-1 py-1 sm:py-1.5 rounded-xl text-center font-game font-black text-sm sm:text-base tracking-wider transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 scale-105 shadow-[0_0_15px_rgba(234,179,8,0.7)]'
                    : 'bg-[#260a3d]/60 text-purple-300/60'
                }`}
              >
                {mult}X
              </div>
            );
          })}
        </div>

        {/* Status Message Ticker */}
        <div className="py-1 px-4 text-center">
          <span className="text-xs sm:text-sm font-bold text-yellow-300 font-game tracking-wider">
            {statusMessage}
          </span>
        </div>

        {/* 5x4 Grid Cards Cabinet */}
        <div className="relative w-full max-w-2xl my-auto flex items-center justify-center p-1 sm:p-2 bg-[#0d0117] border-2 border-purple-500/60 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)]">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full aspect-[5/4] max-h-[52vh]">
            {grid.map((reel, rIdx) => (
              <div key={rIdx} className="flex flex-col gap-1.5 sm:gap-2 h-full">
                {reel.map((card) => (
                  <div key={card.id} className="flex-1 min-h-0">
                    <MagicAceCardView card={card} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Win Plate */}
        {roundTotalWin > 0 && (
          <div className="w-full max-w-xs py-1 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 border border-pink-400 text-white font-black text-center shadow-lg animate-in zoom-in-95">
            <div className="text-[9px] uppercase tracking-wider text-pink-200">
              {language === 'bn' ? 'বর্তমান জয়' : 'WIN'}
            </div>
            <div className="text-lg sm:text-xl font-game tracking-widest font-black">
              ৳ {roundTotalWin.toLocaleString()}
            </div>
          </div>
        )}

        {/* 3. BOTTOM CONTROL DECK */}
        <div className="w-full max-w-2xl bg-[#0f021a]/95 border border-purple-500/30 rounded-2xl p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-4 shadow-xl shrink-0">
          {/* Bet Controls */}
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              {language === 'bn' ? 'বাজি' : 'BET'}
            </span>
            <div className="flex items-center gap-1.5 bg-[#1e0730] border border-purple-500/40 px-2 py-1 rounded-xl">
              <button
                onClick={() => {
                  const idx = BET_OPTIONS.indexOf(bet);
                  if (idx > 0) setBet(BET_OPTIONS[idx - 1]);
                }}
                disabled={isSpinning || isFreeSpins}
                className="w-6 h-6 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 font-bold flex items-center justify-center disabled:opacity-40"
              >
                -
              </button>
              <span className="font-game text-sm sm:text-base font-black text-yellow-300 min-w-[40px] text-center">
                ৳ {bet}
              </span>
              <button
                onClick={() => {
                  const idx = BET_OPTIONS.indexOf(bet);
                  if (idx < BET_OPTIONS.length - 1) setBet(BET_OPTIONS[idx + 1]);
                }}
                disabled={isSpinning || isFreeSpins}
                className="w-6 h-6 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 font-bold flex items-center justify-center disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Turbo Toggle */}
          <button
            onClick={() => setIsTurbo(!isTurbo)}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border transition-all ${
              isTurbo
                ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                : 'bg-[#1e0730] border-purple-500/20 text-gray-400'
            }`}
          >
            <Zap className={`w-4 h-4 ${isTurbo ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="text-[9px] font-bold mt-0.5">TURBO</span>
          </button>

          {/* Auto Spin Toggle */}
          <button
            onClick={() => {
              if (isAutoSpin) {
                setIsAutoSpin(false);
                setAutoSpinCount(0);
              } else {
                setIsAutoSpin(true);
                setAutoSpinCount(20);
              }
            }}
            disabled={isFreeSpins}
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border transition-all ${
              isAutoSpin
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 animate-spin-slow'
                : 'bg-[#1e0730] border-purple-500/20 text-gray-400'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">
              {isAutoSpin ? `${autoSpinCount}` : 'AUTO'}
            </span>
          </button>

          {/* Big Glowing SPIN Button */}
          <button
            onClick={() => handleSpin(isFreeSpins)}
            disabled={isSpinning}
            className="flex-1 max-w-[140px] sm:max-w-[180px] h-12 sm:h-14 rounded-2xl bg-gradient-to-b from-fuchsia-500 via-purple-600 to-indigo-800 border-2 border-fuchsia-300 text-white font-black font-game text-xl sm:text-2xl tracking-widest shadow-[0_0_25px_rgba(217,70,239,0.6)] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isSpinning ? (
              <RotateCw className="w-6 h-6 animate-spin text-white" />
            ) : isFreeSpins ? (
              `${language === 'bn' ? 'ফ্রি' : 'FREE'} (${freeSpinsLeft})`
            ) : (
              language === 'bn' ? 'স্পিন' : 'SPIN'
            )}
          </button>
        </div>
      </main>

      {/* Buy Feature Modal (50x Bet for 10 Free Spins with Wild Locks) */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-sm select-none">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#250838] to-[#100319] border-2 border-amber-400 rounded-3xl p-5 text-center shadow-2xl">
            <h3 className="font-game text-2xl font-black text-yellow-300 tracking-wider">
              {language === 'bn' ? 'ফিচার বাই (১০টি ফ্রি স্পিন)' : 'BUY FEATURE (10 FREE SPINS)'}
            </h3>
            <p className="text-xs text-purple-200 mt-2">
              {language === 'bn'
                ? 'গ্যারান্টিযুক্ত ওয়াইল্ড লক এবং দ্বিগুণ মাল্টিপ্লায়ার (১০X পর্যন্ত) সহ সরাসরি ফ্রি গেম খেলুন!'
                : 'Play Free Games immediately with guaranteed Wild Locks and doubled multipliers up to 10X!'}
            </p>
            <div className="my-4 py-3 bg-black/40 rounded-2xl border border-purple-500/40">
              <span className="text-xs text-gray-400 block">COST</span>
              <span className="font-game text-2xl font-black text-amber-300">
                ৳ {(bet * 50).toLocaleString()}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBuyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-sm"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleBuyBonus}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 font-black font-game text-lg tracking-wider hover:brightness-110 active:scale-95 shadow-lg"
              >
                {language === 'bn' ? 'কিনুন' : 'BUY NOW'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paytable & Video Modals */}
      <MagicAcePaytableModal
        isOpen={showPaytable}
        language={language}
        onClose={() => setShowPaytable(false)}
      />

      <MagicAceVideoModal
        isOpen={showVideoModal}
        language={language}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
};
