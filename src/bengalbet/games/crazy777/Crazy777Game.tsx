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
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { 
  Crazy777Cell, 
  Crazy777SpecialCell, 
  Crazy777Win, 
  YOUTUBE_VIDEO_CRAZY_777 
} from './crazy777Types';
import { 
  generateCrazy777Reels, 
  evaluateCrazy777 
} from './crazy777Engine';
import { crazy777Audio } from './crazy777Audio';
import { 
  Crazy777RegularSymbolView, 
  Crazy777SpecialSymbolView 
} from './Crazy777SymbolView';
import { Crazy777PaytableModal } from './Crazy777PaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface Crazy777GameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const Crazy777Game: React.FC<Crazy777GameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const balance = user?.balance ?? 5000;
  const [bet, setBet] = useState<number>(20);

  // Initial Reels (3x3 regular reels + 1x3 special reel)
  const [reelsData, setReelsData] = useState(() => generateCrazy777Reels(false));
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false]);

  // Win State
  const [currentWin, setCurrentWin] = useState<Crazy777Win | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Respins State
  const [respinsRemaining, setRespinsRemaining] = useState<number>(0);

  // Modals & Controls
  const [isMuted, setIsMuted] = useState<boolean>(crazy777Audio.getMuted());
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [showBigWinModal, setShowBigWinModal] = useState<boolean>(false);
  const [bigWinAmount, setBigWinAmount] = useState<number>(0);

  const BET_PRESETS = [10, 20, 50, 100, 250, 500];

  const toggleSound = () => {
    const muted = crazy777Audio.toggleMute();
    setIsMuted(muted);
  };

  const handleSpin = async (customBet?: number, forceBonus: boolean = false) => {
    const activeBet = customBet ?? bet;
    const isRespin = respinsRemaining > 0;

    if (!isRespin && !forceBonus && balance < activeBet) {
      setStatusMessage(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient Balance!');
      setIsAutoSpin(false);
      return;
    }

    if (!isRespin && forceBonus && balance < activeBet * 50) {
      setStatusMessage(language === 'bn' ? 'বোনাস ক্রয়ের জন্য অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient balance for Buy Feature!');
      return;
    }

    setIsSpinning(true);
    setCurrentWin(null);
    setLastWinAmount(0);
    setStatusMessage('');

    // Deduct bet if not a free respin
    const cost = isRespin ? 0 : (forceBonus ? activeBet * 50 : activeBet);
    if (!isRespin) {
      onUpdateBalance(balance - cost);
    }

    crazy777Audio.playSpin();

    // Start all 4 reels spinning
    setSpinningReels([true, true, true, true]);
    const delay = isTurbo ? 140 : 280;

    // Generate outcome
    const outcome = generateCrazy777Reels(forceBonus);

    // Stop Reels 1, 2, 3 sequentially
    for (let c = 0; c < 3; c++) {
      await new Promise(r => setTimeout(r, delay));
      crazy777Audio.playReelStop(c);
      setSpinningReels(prev => {
        const next = [...prev];
        next[c] = false;
        return next;
      });
    }

    // Stop 4th Special Reel with accent
    await new Promise(r => setTimeout(r, delay * 1.2));
    const winResult = evaluateCrazy777(outcome.reels, outcome.specialReel, activeBet);
    const hasSpecialTrigger = winResult && (winResult.multiplier > 1 || winResult.bonusCash > 0 || winResult.respinsAwarded > 0);
    crazy777Audio.playSpecialReelStop(!!hasSpecialTrigger);

    setSpinningReels([false, false, false, false]);
    setReelsData(outcome);

    // Process Win
    if (winResult && winResult.totalPayout > 0) {
      setCurrentWin(winResult);
      setLastWinAmount(winResult.totalPayout);
      onUpdateBalance(balance + winResult.totalPayout);

      gameEngine.recordRound(cost, winResult.totalPayout, {
        gameId: 'game-crazy-777',
        gameName: 'Crazy 777',
        category: 'slot',
        vendor: 'JILI'
      });

      if (winResult.totalPayout >= activeBet * 15) {
        setBigWinAmount(winResult.totalPayout);
        setShowBigWinModal(true);
        crazy777Audio.playCrazy777Siren();
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else {
        crazy777Audio.playBellWin();
      }

      // Check for Respin award
      if (winResult.respinsAwarded > 0) {
        setRespinsRemaining(prev => prev + winResult.respinsAwarded);
        crazy777Audio.playRespinTrigger();
        setStatusMessage(
          language === 'bn'
            ? `🎉 ${winResult.respinsAwarded}টি ফ্রি রিস্পিন অর্জিত!`
            : `🎉 ${winResult.respinsAwarded} Free Respins Awarded!`
        );
      }
    } else {
      gameEngine.recordRound(cost, 0, {
        gameId: 'game-crazy-777',
        gameName: 'Crazy 777',
        category: 'slot',
        vendor: 'JILI'
      });

      if (isRespin) {
        setRespinsRemaining(prev => Math.max(0, prev - 1));
      }
    }

    if (isRespin && (!winResult || winResult.respinsAwarded === 0)) {
      setRespinsRemaining(prev => Math.max(0, prev - 1));
    }

    setIsSpinning(false);
  };

  // Auto-spin & Respin handling
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning && !showBigWinModal) {
      if (respinsRemaining > 0) {
        timer = setTimeout(() => {
          handleSpin();
        }, isTurbo ? 600 : 1000);
      } else if (isAutoSpin) {
        timer = setTimeout(() => {
          if (balance >= bet) {
            handleSpin();
          } else {
            setIsAutoSpin(false);
          }
        }, isTurbo ? 600 : 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoSpin, isSpinning, respinsRemaining, balance, bet, showBigWinModal]);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-[#3d0714] via-[#20030a] to-[#0c0104] flex flex-col overflow-hidden select-none">
      {/* Game Frame */}
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-gradient-to-r from-red-950 via-[#32040e] to-red-950 border-b border-yellow-500/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-yellow-400 to-red-600 flex items-center justify-center shadow">
              <Flame className="w-5 h-5 text-white fill-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm md:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
                  {language === 'bn' ? 'ক্রেজি ৭৭৭' : 'Crazy 777'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600/30 text-yellow-300 border border-yellow-400/40">
                  JILI
                </span>
              </div>
              <p className="text-[10px] text-amber-200/70 hidden sm:block">
                3 Classic Reels + 4th Special Multiplier Reel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Video Tips & Super Win Walkthrough Button */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
              title="Watch Crazy 777 Super Win Tips on YouTube"
            >
              <Youtube className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">{language === 'bn' ? 'টিপস ও ট্রিক্স ভিডিও' : 'Super Win Video'}</span>
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

        {/* Respins Alert Banner */}
        {respinsRemaining > 0 && (
          <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 py-1.5 px-4 flex items-center justify-between text-xs font-black tracking-wider text-white shadow-md animate-pulse">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 animate-spin" />
              {language === 'bn' ? 'ফ্রি রিস্পিন রাউন্ড চলছে!' : 'FREE RESPIN ACTIVE! (GUARANTEED MULTIPLIER CHANCE)'}
            </span>
            <span>
              {language === 'bn' ? 'বাকি রিস্পিন:' : 'Respins Left:'} <strong className="text-base text-yellow-300 underline">{respinsRemaining}</strong>
            </span>
          </div>
        )}

        {/* Main Slot Cabinet Area */}
        <div className="relative p-3 md:p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#3a0614] via-[#1c0209] to-[#0a0104] flex-1 flex flex-col items-center justify-center">
          
          {/* Top Marquee Header */}
          <div className="w-full max-w-xl flex items-center justify-between px-3 py-1.5 mb-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-500/20 border border-yellow-400/40 rounded-xl text-center">
            <span className="text-[10px] md:text-xs font-black tracking-widest text-yellow-300 uppercase">
              REELS 1-3: PAYLINE
            </span>
            <span className="text-[10px] md:text-xs font-black tracking-widest text-rose-300 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              REEL 4: SPECIAL MULTIPLIER
            </span>
          </div>

          {/* Machine Grid */}
          <div className="relative w-full max-w-xl bg-black/75 p-3 rounded-2xl border-2 border-yellow-500/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
            
            {/* Center Active Payline Guide Markers */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3 z-30 flex items-center">
              <div className="w-4 h-6 bg-yellow-400 rounded-r-md flex items-center justify-center shadow-[0_0_10px_#facc15]">
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 font-black" />
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -right-3 z-30 flex items-center">
              <div className="w-4 h-6 bg-yellow-400 rounded-l-md flex items-center justify-center shadow-[0_0_10px_#facc15]">
                <ChevronRight className="w-3.5 h-3.5 text-slate-950 font-black rotate-180" />
              </div>
            </div>

            {/* Glowing Payline Center Indicator Line */}
            <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-24 md:h-28 border-y-2 border-yellow-400/50 bg-yellow-400/5 pointer-events-none rounded-lg" />

            {/* Reels Columns Layout: 3 Base Reels + Separator + 4th Reel */}
            <div className="grid grid-cols-4 gap-2 relative z-10">
              
              {/* Reels 1, 2, 3 */}
              {[0, 1, 2].map(colIdx => (
                <div key={colIdx} className="flex flex-col gap-2">
                  {reelsData.reels[colIdx].map((cell, rowIdx) => {
                    const isCenter = rowIdx === 1;
                    const isWinning = currentWin !== null && isCenter;

                    return (
                      <div key={cell.id} className="h-20 sm:h-24 md:h-28">
                        <Crazy777RegularSymbolView
                          type={cell.type}
                          isCenter={isCenter}
                          isWinning={isWinning}
                          isSpinning={spinningReels[colIdx]}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* 4th Special Reel (Special golden border) */}
              <div className="flex flex-col gap-2 pl-1 border-l-2 border-dashed border-yellow-400/50">
                {reelsData.specialReel.map((cell, rowIdx) => {
                  const isCenter = rowIdx === 1;
                  const isWinning = currentWin !== null && isCenter && (currentWin.multiplier > 1 || currentWin.bonusCash > 0 || currentWin.respinsAwarded > 0);

                  return (
                    <div key={cell.id} className="h-20 sm:h-24 md:h-28">
                      <Crazy777SpecialSymbolView
                        type={cell.type}
                        isCenter={isCenter}
                        isWinning={isWinning}
                        isSpinning={spinningReels[3]}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Win Status Ribbon */}
          {currentWin ? (
            <div className="mt-3 py-1.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-yellow-100 font-black text-xs md:text-sm shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center gap-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200" />
              <span>
                {language === 'bn' ? currentWin.nameBn : currentWin.nameEn}
                {currentWin.multiplier > 1 && ` • ${currentWin.multiplier}X MULTIPLIER`}
                {currentWin.bonusCash > 0 && ` • +৳${currentWin.bonusCash.toLocaleString()} CASH`}
                {currentWin.respinsAwarded > 0 && ` • +${currentWin.respinsAwarded} RESPINS`}
              </span>
            </div>
          ) : statusMessage ? (
            <div className="mt-3 text-xs font-bold text-yellow-300 animate-pulse">
              {statusMessage}
            </div>
          ) : (
            <div className="mt-3 text-[11px] text-amber-200/60 font-semibold">
              {language === 'bn' ? 'কেন্দ্রীয় পে-লাইনে মেলান এবং ৪র্থ রিলের মেগা গুণক জিতুন' : 'Match across center payline to trigger Reel 4 multiplier'}
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="bg-gradient-to-b from-[#25040d] to-[#120106] p-3 md:p-4 border-t border-yellow-500/30 flex flex-col gap-3">
          
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
                ৳{lastWinAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Bet Presets & Buy Feature */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              <span className="text-[10px] text-amber-200/60 font-bold uppercase mr-1">
                {language === 'bn' ? 'বাজি:' : 'Bet:'}
              </span>
              {BET_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setBet(preset)}
                  disabled={isSpinning || respinsRemaining > 0}
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

            {/* Buy Feature (50X for 777 + 10X Super Win) */}
            <button
              onClick={() => handleSpin(bet, true)}
              disabled={isSpinning || respinsRemaining > 0}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-700 hover:brightness-110 active:scale-95 text-yellow-100 border border-yellow-400 text-xs font-black shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{language === 'bn' ? 'সুপার ৭৭৭ বোনাস কিনুন' : 'Buy 777 Super Bonus'}</span>
              <span className="text-[10px] text-yellow-200 font-normal">({bet * 50}৳)</span>
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
                  : respinsRemaining > 0 
                  ? (language === 'bn' ? `রিস্পিন (${respinsRemaining})` : `RESPIN (${respinsRemaining})`)
                  : (language === 'bn' ? 'স্পিন' : 'SPIN')}
              </span>
            </button>

            {/* Auto Spin */}
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
        <Crazy777PaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* Big Win Modal */}
      {showBigWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="relative w-full max-w-md bg-gradient-to-b from-red-600 via-amber-600 to-red-950 border-4 border-yellow-300 rounded-3xl p-6 text-center shadow-[0_0_60px_rgba(250,204,21,0.8)]">
            <span className="text-6xl animate-bounce block mb-2">🎰</span>
            <h3 className="text-3xl font-black text-yellow-200 uppercase tracking-widest drop-shadow">
              CRAZY 777 SUPER WIN!
            </h3>
            <p className="text-sm text-yellow-100/90 font-bold mt-1">
              {language === 'bn' ? '১০X মাল্টিপ্লায়ার মেগা প্রাইজ!' : '10X Multiplier Mega Payout!'}
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

      {/* Embedded YouTube Video Modal (Requested link: https://www.youtube.com/watch?v=H27uuoIDue4) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-red-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-red-950/60 border-b border-red-500/30">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {YOUTUBE_VIDEO_CRAZY_777.title}
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
                src={YOUTUBE_VIDEO_CRAZY_777.embedUrl}
                title={YOUTUBE_VIDEO_CRAZY_777.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? 'জিলি ক্রেজি ৭৭৭ সেরা সুপার উইন টিপস ও ট্রিক্স' : 'JILI Crazy 777 Super Win Tips & Tricks Gameplay Recording'}</span>
              <a
                href={YOUTUBE_VIDEO_CRAZY_777.url}
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
