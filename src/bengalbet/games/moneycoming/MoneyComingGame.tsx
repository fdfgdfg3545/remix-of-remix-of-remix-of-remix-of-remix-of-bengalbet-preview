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
  Trophy,
  Coins,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserAccount } from '../../types';
import {
  MoneyComingCell,
  MoneyComingSpecialCell,
  MoneyComingSpinResult
} from './moneyComingTypes';
import {
  generateInitialReels,
  evaluateMoneyComingSpin
} from './moneyComingEngine';
import { moneyComingAudio } from './moneyComingAudio';
import {
  MoneyComingNumberView,
  MoneyComingSpecialView
} from './MoneyComingSymbolView';
import { MoneyComingWheelModal } from './MoneyComingWheelModal';
import { MoneyComingPaytableModal } from './MoneyComingPaytableModal';
import { MoneyComingVideoModal } from './MoneyComingVideoModal';
import moneyComingIcon from '../../assets/images/money_coming_icon_1789330321878.jpg';
import { gameEngine } from '../../services/gameEngine';

interface GameProps {
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

const BET_OPTIONS = [10, 20, 50, 100, 200, 500, 1000];

export const MoneyComingGame: React.FC<GameProps> = ({
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
  const [showWheelModal, setShowWheelModal] = useState<boolean>(false);

  // Reel State
  const initial = useRef(generateInitialReels());
  const [reels, setReels] = useState<[MoneyComingCell[], MoneyComingCell[], MoneyComingCell[]]>(initial.current.reels);
  const [specialReel, setSpecialReel] = useState<MoneyComingSpecialCell[]>(initial.current.specialReel);

  // Last win & messages
  const [lastWin, setLastWin] = useState<number>(0);
  const [winMultiplier, setWinMultiplier] = useState<number>(1);
  const [formedNumber, setFormedNumber] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>(
    language === 'bn' ? 'স্পিন চাপুন এবং জ্যাকপট জিতুন!' : 'Press SPIN to start winning!'
  );
  const [respinsLeft, setRespinsLeft] = useState<number>(0);

  // Keep parent balance in sync
  const updateBalance = (newBal: number) => {
    setBalance(newBal);
    onUpdateBalance(newBal);
  };

  const toggleSound = () => {
    const muted = moneyComingAudio.toggleMute();
    setIsMuted(muted);
  };

  // Perform Spin
  const handleSpin = (isFreeRespin: boolean = false) => {
    if (isSpinning) return;

    if (!isFreeRespin && balance < bet) {
      setStatusMessage(
        language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স! অনুগ্রহ করে ডিপোজিট করুন।' : 'Insufficient balance! Please deposit.'
      );
      setIsAutoSpin(false);
      return;
    }

    const cost = isFreeRespin ? 0 : bet;
    if (!isFreeRespin) {
      updateBalance(balance - bet);
    }

    setIsSpinning(true);
    setLastWin(0);
    moneyComingAudio.playSpin();

    setStatusMessage(
      isFreeRespin
        ? (language === 'bn' ? '⚡ ফ্রি রিস্পিন চলছে...' : '⚡ Free Respin in progress...')
        : (language === 'bn' ? 'রিল ঘুরছে...' : 'Reels spinning...')
    );

    // Calculate result
    const result: MoneyComingSpinResult = evaluateMoneyComingSpin(bet, isFreeRespin);

    const spinTime = isTurbo ? 600 : 1200;

    setTimeout(() => {
      moneyComingAudio.playReelStop(0);
      setReels(prev => [result.reels[0], prev[1], prev[2]]);
    }, spinTime * 0.4);

    setTimeout(() => {
      moneyComingAudio.playReelStop(1);
      setReels(prev => [result.reels[0], result.reels[1], prev[2]]);
    }, spinTime * 0.7);

    setTimeout(() => {
      moneyComingAudio.playReelStop(2);
      setReels(result.reels);
    }, spinTime * 0.9);

    setTimeout(() => {
      moneyComingAudio.playSpecialStop(result.hasWheelBonus || result.hasRespin);
      setSpecialReel(result.specialReel);
      setIsSpinning(false);

      // Handle payout
      setFormedNumber(result.formedNumber);
      setWinMultiplier(result.multiplier);

      if (result.totalWin > 0) {
        setLastWin(result.totalWin);
        updateBalance(balance - (isFreeRespin ? 0 : bet) + result.totalWin);
        gameEngine.recordRound(cost, result.totalWin, {
          gameId: 'game-money-coming',
          gameName: 'Money Coming',
          category: 'slot',
          vendor: 'JILI'
        });

        if (result.totalWin >= bet * 10) {
          moneyComingAudio.playBigWin();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setStatusMessage(
            language === 'bn'
              ? `🔥 মেগা উইন! ৳ ${result.totalWin.toLocaleString()} (${result.formedNumber} x ${result.multiplier}X)`
              : `🔥 MEGA WIN! ৳ ${result.totalWin.toLocaleString()} (${result.formedNumber} x ${result.multiplier}X)`
          );
        } else {
          moneyComingAudio.playCoinWin();
          setStatusMessage(
            language === 'bn'
              ? `🎉 আপনি জিতেছেন ৳ ${result.totalWin.toLocaleString()}!`
              : `🎉 You won ৳ ${result.totalWin.toLocaleString()}!`
          );
        }
      } else {
        if (!result.hasWheelBonus && !result.hasRespin) {
          gameEngine.recordRound(cost, 0, {
            gameId: 'game-money-coming',
            gameName: 'Money Coming',
            category: 'slot',
            vendor: 'JILI'
          });
          setStatusMessage(
            language === 'bn' ? 'পরবর্তী স্পিনে চেষ্টা করুন!' : 'Better luck next spin!'
          );
        }
      }

      // Check Wheel Bonus
      if (result.hasWheelBonus) {
        setStatusMessage(
          language === 'bn' ? '✨ সুপার লাকি হুইল বোনাস সক্রিয়!' : '✨ SUPER LUCKY WHEEL TRIGGERED!'
        );
        setTimeout(() => {
          setShowWheelModal(true);
        }, 600);
      }

      // Check Respin
      if (result.hasRespin) {
        setRespinsLeft(prev => prev + 1);
        setStatusMessage(
          language === 'bn' ? '🔄 ১টি ফ্রি রিস্পিন বোনাস অর্জিত!' : '🔄 1 FREE RESPIN AWARDED!'
        );
      }
    }, spinTime);
  };

  // Respin & Auto spin loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning && !showWheelModal) {
      if (respinsLeft > 0) {
        timer = setTimeout(() => {
          setRespinsLeft(prev => Math.max(0, prev - 1));
          handleSpin(true);
        }, isTurbo ? 600 : 1200);
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
  }, [isSpinning, respinsLeft, isAutoSpin, autoSpinCount, showWheelModal]);

  const handleWheelWin = (bonusAmount: number) => {
    setLastWin(bonusAmount);
    updateBalance(balance + bonusAmount);
    gameEngine.recordRound(0, bonusAmount, {
      gameId: 'game-money-coming',
      gameName: 'Money Coming (Lucky Wheel)',
      category: 'slot',
      vendor: 'JILI'
    });
    setStatusMessage(
      language === 'bn'
        ? `🏆 লাকি হুইল বোনাস উইন: ৳ ${bonusAmount.toLocaleString()}!`
        : `🏆 LUCKY WHEEL WIN: ৳ ${bonusAmount.toLocaleString()}!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#1c0c00] via-[#0d0500] to-[#040200] flex flex-col overflow-hidden select-none font-sans text-gray-100">
      {/* 1. TOP CASINO BAR (Game System Header) */}
      <header className="h-12 sm:h-14 px-3 sm:px-4 bg-[#140800]/95 border-b border-yellow-500/30 flex items-center justify-between shrink-0 shadow-lg z-20">
        {/* Left: Back to Lobby & Game Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold transition-all active:scale-95"
            title="Exit Game & Return to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'bn' ? 'লবিতে ফিরুন' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2">
            <img
              src={moneyComingIcon}
              alt="Money Coming"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover border border-yellow-400/50 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-game text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
                  {language === 'bn' ? 'মানি কামিং' : 'Money Coming'}
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                  JILI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live BDT Balance */}
        <div className="flex items-center gap-2">
          <div className="bg-[#241200] border border-yellow-500/40 px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-2 shadow-inner">
            <span className="text-[10px] sm:text-xs text-yellow-400 font-bold uppercase">BDT</span>
            <span className="text-xs sm:text-sm font-black font-game text-yellow-300 tracking-wider">
              ৳ {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: Actions (Video, Paytable, Sound) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* YouTube Video Walkthrough button */}
          <button
            onClick={() => setShowVideoModal(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all active:scale-95 shadow"
            title="Watch 3 Money Coming Win Strategies Video"
          >
            <Youtube className="w-4 h-4 text-white fill-white" />
            <span className="hidden md:inline">{language === 'bn' ? 'ভিডিও টিপস' : 'Video'}</span>
          </button>

          {/* Paytable */}
          <button
            onClick={() => setShowPaytable(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-300 border border-yellow-500/20"
            title="Paytable & Rules"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-yellow-300 border border-yellow-500/20"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN CASINO STAGE (Non-scrolling, adaptive flex arena) */}
      <main className="flex-1 w-full min-h-0 flex flex-col items-center justify-between p-2 sm:p-4 overflow-hidden relative">
        {/* Status Ticker Banner */}
        <div className="w-full max-w-xl py-1.5 px-3 rounded-full bg-gradient-to-r from-yellow-900/30 via-yellow-600/20 to-yellow-900/30 border border-yellow-500/30 flex items-center justify-center text-center shadow-md">
          <span className="text-xs sm:text-sm font-bold text-yellow-300 font-game tracking-wider truncate">
            {statusMessage}
          </span>
        </div>

        {/* Casino Machine Stage / Reels Cabinet */}
        <div className="relative w-full max-w-2xl my-auto flex flex-col items-center">
          {/* Top Marquee Bar */}
          <div className="w-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 rounded-t-2xl p-1.5 sm:p-2 border-2 border-b-0 border-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-950 font-game uppercase tracking-widest px-2">
              <Sparkles className="w-3.5 h-3.5" /> 10,000X JACKPOT
            </div>
            {formedNumber > 0 && (
              <div className="text-xs sm:text-sm font-black font-game text-amber-950 px-2 bg-yellow-200/90 rounded-md">
                NUMBER: {formedNumber} {winMultiplier > 1 ? `x ${winMultiplier}X` : ''}
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-amber-950 font-game uppercase tracking-widest px-2">
              SPECIAL REEL <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Reels Arena Frame */}
          <div className="relative w-full bg-[#0d0500] border-2 border-yellow-400 p-2 sm:p-4 rounded-b-2xl shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-between gap-1.5 sm:gap-3">
            {/* Payline Pointer Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10">
              <ChevronRight className="w-6 h-6 text-yellow-400 animate-pulse fill-yellow-400" />
            </div>

            {/* Payline Center Horizontal Glowing Line */}
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-14 sm:h-16 border-y-2 border-yellow-400/80 bg-yellow-400/10 pointer-events-none rounded-lg z-0" />

            {/* Reel 1 (Number) */}
            <div className="flex-1 bg-[#1a0c00] border border-yellow-500/30 rounded-xl overflow-hidden h-44 sm:h-52 md:h-56 flex flex-col justify-between py-1 shadow-inner relative z-10">
              {reels[0].map((cell, idx) => (
                <div key={cell.id} className="flex-1 flex items-center justify-center">
                  <MoneyComingNumberView value={cell.value} isPayline={idx === 1} isWin={cell.isWin} />
                </div>
              ))}
            </div>

            {/* Reel 2 (Number) */}
            <div className="flex-1 bg-[#1a0c00] border border-yellow-500/30 rounded-xl overflow-hidden h-44 sm:h-52 md:h-56 flex flex-col justify-between py-1 shadow-inner relative z-10">
              {reels[1].map((cell, idx) => (
                <div key={cell.id} className="flex-1 flex items-center justify-center">
                  <MoneyComingNumberView value={cell.value} isPayline={idx === 1} isWin={cell.isWin} />
                </div>
              ))}
            </div>

            {/* Reel 3 (Number) */}
            <div className="flex-1 bg-[#1a0c00] border border-yellow-500/30 rounded-xl overflow-hidden h-44 sm:h-52 md:h-56 flex flex-col justify-between py-1 shadow-inner relative z-10">
              {reels[2].map((cell, idx) => (
                <div key={cell.id} className="flex-1 flex items-center justify-center">
                  <MoneyComingNumberView value={cell.value} isPayline={idx === 1} isWin={cell.isWin} />
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="w-1 h-36 sm:h-44 bg-gradient-to-b from-yellow-600 via-amber-300 to-yellow-600 rounded-full shadow z-10" />

            {/* 4th Reel (Special Multiplier / Feature Reel) */}
            <div className="flex-1 bg-gradient-to-b from-[#240e00] to-[#120600] border-2 border-yellow-400/90 rounded-xl overflow-hidden h-44 sm:h-52 md:h-56 flex flex-col justify-between py-1 shadow-[0_0_20px_rgba(234,179,8,0.3)] relative z-10">
              {specialReel.map((cell, idx) => (
                <div key={cell.id} className="flex-1 flex items-center justify-center">
                  <MoneyComingSpecialView value={cell.value} isPayline={idx === 1} isWin={cell.isWin} />
                </div>
              ))}
            </div>

            {/* Payline Pointer Right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10">
              <ChevronLeft className="w-6 h-6 text-yellow-400 animate-pulse fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Win Display Plate */}
        {lastWin > 0 && (
          <div className="w-full max-w-sm py-1.5 px-4 rounded-xl bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-600 border border-yellow-200 text-amber-950 font-black text-center shadow-lg animate-in zoom-in-95">
            <div className="text-[10px] font-bold uppercase tracking-wider">
              {language === 'bn' ? 'সর্বশেষ উইন' : 'LAST WIN'}
            </div>
            <div className="text-xl sm:text-2xl font-game tracking-widest font-black">
              ৳ {lastWin.toLocaleString()}
            </div>
          </div>
        )}

        {/* 3. BOTTOM CONTROL DECK (Fixed height, perfectly visible on all screens) */}
        <div className="w-full max-w-2xl bg-[#140800]/90 border border-yellow-500/30 rounded-2xl p-2 sm:p-3 flex items-center justify-between gap-2 sm:gap-4 shadow-xl shrink-0">
          {/* Bet Controls */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-yellow-400/80 font-bold uppercase tracking-wider">
              {language === 'bn' ? 'বাজি' : 'BET'}
            </span>
            <div className="flex items-center gap-1.5 bg-[#241200] border border-yellow-500/40 px-2 py-1 rounded-xl">
              <button
                onClick={() => {
                  const idx = BET_OPTIONS.indexOf(bet);
                  if (idx > 0) setBet(BET_OPTIONS[idx - 1]);
                }}
                disabled={isSpinning}
                className="w-6 h-6 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 font-bold flex items-center justify-center disabled:opacity-40"
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
                disabled={isSpinning}
                className="w-6 h-6 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 font-bold flex items-center justify-center disabled:opacity-40"
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
                : 'bg-[#241200] border-yellow-500/20 text-gray-400'
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
            className={`flex flex-col items-center justify-center px-2.5 py-1.5 rounded-xl border transition-all ${
              isAutoSpin
                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 animate-spin-slow'
                : 'bg-[#241200] border-yellow-500/20 text-gray-400'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-0.5">
              {isAutoSpin ? `${autoSpinCount}` : 'AUTO'}
            </span>
          </button>

          {/* Big Golden SPIN Button */}
          <button
            onClick={() => handleSpin(false)}
            disabled={isSpinning}
            className="flex-1 max-w-[140px] sm:max-w-[180px] h-12 sm:h-14 rounded-2xl bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 border-2 border-yellow-200 text-amber-950 font-black font-game text-xl sm:text-2xl tracking-widest shadow-[0_0_25px_rgba(234,179,8,0.6)] hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isSpinning ? (
              <RotateCw className="w-6 h-6 animate-spin text-amber-950" />
            ) : (
              language === 'bn' ? 'স্পিন' : 'SPIN'
            )}
          </button>
        </div>
      </main>

      {/* Bonus Modals */}
      <MoneyComingWheelModal
        isOpen={showWheelModal}
        bet={bet}
        language={language}
        onClose={() => setShowWheelModal(false)}
        onWin={handleWheelWin}
      />

      <MoneyComingPaytableModal
        isOpen={showPaytable}
        language={language}
        onClose={() => setShowPaytable(false)}
      />

      <MoneyComingVideoModal
        isOpen={showVideoModal}
        language={language}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  );
};
