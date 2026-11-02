// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Zap, 
  HelpCircle, 
  Play, 
  Sparkles, 
  Youtube,
  ChevronRight,
  Coins,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { 
  SevenCoinsCell, 
  SevenCoinsPaylineWin, 
  YOUTUBE_VIDEO_777_COINS 
} from './sevenCoinsTypes';
import { 
  generateSevenCoinsGrid, 
  evaluatePaylines, 
  evaluateCollectFeature, 
  checkHoldAndWinTrigger 
} from './sevenCoinsEngine';
import { sevenCoinsAudio } from './sevenCoinsAudio';
import { SevenCoinsSymbolView } from './SevenCoinsSymbolView';
import { SevenCoinsHoldAndWinModal } from './SevenCoinsHoldAndWinModal';
import { SevenCoinsPaytableModal } from './SevenCoinsPaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface SevenCoinsGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const SevenCoinsGame: React.FC<SevenCoinsGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const balance = user?.balance ?? 5000;
  const [bet, setBet] = useState<number>(20);

  // 3x3 Grid
  const [grid, setGrid] = useState<SevenCoinsCell[][]>(() => generateSevenCoinsGrid(false));
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);

  // Wins
  const [paylineWins, setPaylineWins] = useState<SevenCoinsPaylineWin[]>([]);
  const [collectWin, setCollectWin] = useState<{ amount: number; count: number } | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Hold & Win Bonus Modal
  const [showHoldAndWin, setShowHoldAndWin] = useState<boolean>(false);
  const [bonusTriggerCoinsCount, setBonusTriggerCoinsCount] = useState<number>(3);

  // Modals & Controls
  const [isMuted, setIsMuted] = useState<boolean>(sevenCoinsAudio.getMuted());
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showBigWinModal, setShowBigWinModal] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number>(0);

  const BET_PRESETS = [10, 20, 50, 100, 250, 500];

  const toggleSound = () => {
    const muted = sevenCoinsAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleSpin = async (customBet?: number, forceBonus: boolean = false) => {
    const activeBet = customBet ?? bet;
    const cost = forceBonus ? activeBet * 30 : activeBet;

    if (balance < cost) {
      setStatusMessage(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient Balance!');
      setIsAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setPaylineWins([]);
    setCollectWin(null);
    setLastWinAmount(0);
    setStatusMessage('');

    onUpdateBalance(balance - cost);
    sevenCoinsAudio.playSpin();

    setSpinningReels([true, true, true]);
    const delay = isTurbo ? 130 : 260;

    const outcome = generateSevenCoinsGrid(forceBonus);

    // Stop Reels sequentially
    for (let c = 0; c < 3; c++) {
      await new Promise(r => setTimeout(r, delay));
      sevenCoinsAudio.playReelStop(c);
      setSpinningReels(prev => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
    }

    setSpinningReels([false, false, false]);
    setGrid(outcome);

    // 1. Check Collect feature on reel 2
    const collectResult = evaluateCollectFeature(outcome, activeBet);
    let totalSpinPayout = 0;

    if (collectResult.hasCollect && collectResult.totalCollectedCash > 0) {
      sevenCoinsAudio.playCollectSwoosh();
      setCollectWin({
        amount: collectResult.totalCollectedCash,
        count: collectResult.collectedCoins.length
      });
      totalSpinPayout += collectResult.totalCollectedCash;
    }

    // 2. Check Paylines
    const lineWins = evaluatePaylines(outcome, activeBet);
    if (lineWins.length > 0) {
      sevenCoinsAudio.playLineWin();
      setPaylineWins(lineWins);
      const linesCash = lineWins.reduce((sum, w) => sum + w.payout, 0);
      totalSpinPayout += linesCash;
    }

    // Apply immediate cash wins if any
    if (totalSpinPayout > 0) {
      setLastWinAmount(totalSpinPayout);
      onUpdateBalance(balance + totalSpinPayout);

      gameEngine.recordRound(cost, totalSpinPayout, {
        gameId: 'game-777-coins',
        gameName: '777 Coins Hold & Win',
        category: 'slot',
        vendor: '3 Oaks'
      });

      if (totalSpinPayout >= activeBet * 15) {
        setBigWinAmount(totalSpinPayout);
        setShowBigWinModal(true);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    }

    // 3. Check Hold and Win Trigger
    const isBonusTriggered = checkHoldAndWinTrigger(outcome);
    if (isBonusTriggered) {
      let coinCount = 0;
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < 3; r++) {
          if (outcome[c][r].type === 'bonus_coin' || outcome[c][r].type === 'collect_coin') {
            coinCount++;
          }
        }
      }
      setBonusTriggerCoinsCount(coinCount);
      sevenCoinsAudio.playBonusTrigger();
      await new Promise(r => setTimeout(r, 600));
      setShowHoldAndWin(true);
    } else if (totalSpinPayout === 0) {
      gameEngine.recordRound(cost, 0, {
        gameId: 'game-777-coins',
        gameName: '777 Coins Hold & Win',
        category: 'slot',
        vendor: '3 Oaks'
      });
    }

    setIsSpinning(false);
  };

  const handleCompleteHoldAndWin = (bonusPayout: number) => {
    setShowHoldAndWin(false);
    if (bonusPayout > 0) {
      onUpdateBalance(balance + bonusPayout);
      setLastWinAmount(prev => prev + bonusPayout);
      setBigWinAmount(bonusPayout);
      setShowBigWinModal(true);
      gameEngine.recordRound(bet, bonusPayout, {
        gameId: 'game-777-coins',
        gameName: '777 Coins (Hold & Win Bonus)',
        category: 'slot',
        vendor: '3 Oaks'
      });
    }
  };

  // Auto-spin handling
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning && !showHoldAndWin && !showBigWinModal && isAutoSpin) {
      timer = setTimeout(() => {
        if (balance >= bet) {
          handleSpin();
        } else {
          setIsAutoSpin(false);
        }
      }, isTurbo ? 600 : 1200);
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, showHoldAndWin, showBigWinModal, balance, bet]);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#1c1236] via-[#0f091f] to-[#080512] flex flex-col overflow-hidden select-none">
      {/* Game Cabinet */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-gradient-to-r from-[#2a174d] via-[#1c1236] to-[#2a174d] border-b border-yellow-500/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center shadow">
              <Coins className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {language === 'bn' ? '777 কয়েন' : '777 Coins'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-600/40 text-purple-200 border border-purple-400/40">
                  3 OAKS / BNG
                </span>
              </div>
              <p className="text-[10px] text-amber-200/70 hidden sm:block">
                Hold & Win • Instant Collect • 2,000X Grand Jackpot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Video Tips / Gameplay Button */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Watch 777 Coins Gameplay & Bonus Video on YouTube"
            >
              <Youtube className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">{language === 'bn' ? 'গেমপ্লে ভিডিও' : 'Bonus Video'}</span>
            </button>

            {/* Paytable */}
            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300 transition-all"
              title="Rules & Paytable"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Mute */}
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

        {/* Jackpots Top Banner */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 px-3 py-1.5 border-b border-yellow-500/20 grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-yellow-400 uppercase">GRAND</span>
            <span className="text-xs font-black text-white">৳{(bet * 2000).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-rose-400 uppercase">MAJOR</span>
            <span className="text-xs font-black text-white">৳{(bet * 150).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-blue-400 uppercase">MINOR</span>
            <span className="text-xs font-black text-white">৳{(bet * 50).toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-emerald-400 uppercase">MINI</span>
            <span className="text-xs font-black text-white">৳{(bet * 25).toLocaleString()}</span>
          </div>
        </div>

        {/* Main Slot Grid Area */}
        <div className="relative p-3 md:p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#241344] via-[#120a24] to-[#07040e] flex-1 flex flex-col items-center justify-center">
          
          {/* Reel Frame */}
          <div className="relative w-full max-w-lg bg-black/80 p-3.5 rounded-2xl border-2 border-yellow-500/50 shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]">
            <div className="grid grid-cols-3 gap-2.5 relative z-10">
              {[0, 1, 2].map(colIdx => (
                <div key={colIdx} className="flex flex-col gap-2.5">
                  {grid[colIdx].map((cell, rowIdx) => {
                    const isWinning = paylineWins.some(pw =>
                      pw.coordinates.some(coord => coord.col === colIdx && coord.row === rowIdx)
                    );

                    return (
                      <div key={cell.id} className="h-20 sm:h-24 md:h-28">
                        <SevenCoinsSymbolView
                          type={cell.type}
                          coinValue={cell.coinValue}
                          jackpotTier={cell.jackpotTier}
                          isWinning={isWinning}
                          isSpinning={spinningReels[colIdx]}
                          betAmount={bet}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Win Status Banner */}
          {collectWin ? (
            <div className="mt-3 py-1 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-black text-xs md:text-sm shadow-[0_0_15px_rgba(6,182,212,0.7)] flex items-center gap-2 animate-bounce">
              <Coins className="w-4 h-4 text-cyan-200" />
              <span>
                {language === 'bn' ? `কালেক্ট কয়েন ${collectWin.count}টি কয়েন সংগ্রহ করেছে: +৳${collectWin.amount.toLocaleString()}` : `COLLECT COIN GATHERED ${collectWin.count} COINS: +৳${collectWin.amount.toLocaleString()}`}
              </span>
            </div>
          ) : paylineWins.length > 0 ? (
            <div className="mt-3 py-1 px-4 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 font-black text-xs md:text-sm shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>
                {language === 'bn' ? `${paylineWins.length}টি লাইনে জয়!` : `${paylineWins.length} PAYLINE WIN(S)!`}
              </span>
            </div>
          ) : statusMessage ? (
            <div className="mt-3 text-xs font-bold text-yellow-300 animate-pulse">
              {statusMessage}
            </div>
          ) : (
            <div className="mt-3 text-[11px] text-amber-200/60 font-semibold">
              {language === 'bn' ? 'রিল ২-এ কালেক্ট কয়েন দিয়ে কয়েন সংগ্রহ করুন বা ৩টি কয়েন দিয়ে হোল্ড অ্যান্ড উইন শুরু করুন' : 'Collect Coins on Reel 2 or land 3 Coins for Hold & Win'}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-gradient-to-b from-[#180e2f] to-[#090514] p-3 md:p-4 border-t border-yellow-500/30 flex flex-col gap-3">
          
          {/* Balance & Win Summary */}
          <div className="flex items-center justify-between text-xs md:text-sm font-bold px-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-300">{language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'}</span>
              <span className="text-yellow-300 text-sm md:text-base font-black">
                ৳{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-300">{language === 'bn' ? 'মোট জয়:' : 'Win:'}</span>
              <span className="text-emerald-400 text-sm md:text-base font-black">
                ৳{lastWinAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Bet Presets & Buy Feature */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">
                {language === 'bn' ? 'বাজি:' : 'Bet:'}
              </span>
              {BET_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBet(preset)}
                  disabled={isSpinning}
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

            {/* Buy Feature (30X for Guaranteed Hold & Win) */}
            <button
              onClick={() => handleSpin(bet, true)}
              disabled={isSpinning}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 hover:brightness-110 active:scale-95 text-yellow-200 border border-yellow-400/80 text-xs font-black shadow flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'হোল্ড অ্যান্ড উইন কিনুন' : 'Buy Hold & Win'}</span>
              <span className="text-[10px] text-yellow-300 font-normal">({bet * 30}৳)</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-yellow-500/20">
            {/* Turbo */}
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
              <span>
                {isSpinning 
                  ? (language === 'bn' ? 'ঘুরছে...' : 'Spinning...') 
                  : (language === 'bn' ? 'স্পিন' : 'SPIN')}
              </span>
            </button>

            {/* Auto Spin */}
            <button
              onClick={() => setIsAutoSpin(prev => !prev)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isAutoSpin
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse'
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
        <SevenCoinsPaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Hold & Win Bonus Modal */}
      {showHoldAndWin && (
        <SevenCoinsHoldAndWinModal
          language={language}
          betAmount={bet}
          initialCoinsCount={bonusTriggerCoinsCount}
          onComplete={handleCompleteHoldAndWin}
        />
      )}

      {/* Big Win Modal */}
      {showBigWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="relative w-full max-w-md bg-gradient-to-b from-purple-700 via-indigo-700 to-purple-950 border-4 border-yellow-300 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.8)]">
            <span className="text-6xl animate-bounce block mb-2">🪙</span>
            <h3 className="text-3xl font-black text-yellow-200 uppercase tracking-widest drop-shadow">
              777 COINS BIG WIN!
            </h3>
            <p className="text-sm text-yellow-100/90 font-bold mt-1">
              {language === 'bn' ? 'কয়েন জ্যাকপট নগদ পুরস্কার!' : 'Coins Jackpot Cash Prize!'}
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

      {/* Embedded YouTube Video Modal (Requested link: https://www.youtube.com/watch?v=yYbPGNCS4zk) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-purple-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-purple-950/60 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {YOUTUBE_VIDEO_777_COINS.title}
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="w-full h-full"
                src={YOUTUBE_VIDEO_777_COINS.embedUrl}
                title={YOUTUBE_VIDEO_777_COINS.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? '777 কয়েন স্লট গেমপ্লে এবং বোনাস ফিচার' : '777 Coins slot by 3 Oaks Gaming | Gameplay + Bonus Feature'}</span>
              <a
                href={YOUTUBE_VIDEO_777_COINS.url}
                target="_blank"
                rel="noreferrer"
                className="text-yellow-400 hover:underline flex items-center gap-1 font-bold"
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
