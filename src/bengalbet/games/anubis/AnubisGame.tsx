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
  Flame,
  ChevronRight,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../../types';
import { 
  AnubisCell, 
  AnubisWinLine, 
  YOUTUBE_VIDEO_ANUBIS 
} from './anubisTypes';
import { 
  generateAnubisGrid, 
  evaluateAnubisWins 
} from './anubisEngine';
import { anubisAudio } from './anubisAudio';
import { AnubisSymbolView } from './AnubisSymbolView';
import { AnubisPaytableModal } from './AnubisPaytableModal';
import { gameEngine } from '../../services/gameEngine';

interface AnubisGameProps {
  language: 'en' | 'bn';
  user: UserAccount | null;
  onClose: () => void;
  onUpdateBalance: (newBalance: number) => void;
}

export const AnubisGame: React.FC<AnubisGameProps> = ({
  language,
  user,
  onClose,
  onUpdateBalance
}) => {
  const [balance, setBalance] = useState<number>(user?.balance ?? 5000);
  const [betAmount, setBetAmount] = useState<number>(20);
  const [grid, setGrid] = useState<AnubisCell[][]>(() => generateAnubisGrid());
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [lastWin, setLastWin] = useState<number>(0);
  const [winLines, setWinLines] = useState<AnubisWinLine[]>([]);
  const [wrathActive, setWrathActive] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    anubisAudio.setMuted(next);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    const isFree = freeSpinsLeft > 0;
    if (!isFree && balance < betAmount) {
      alert(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স!' : 'Insufficient balance!');
      setAutoSpinsLeft(0);
      return;
    }

    if (!isFree) {
      const newBal = balance - betAmount;
      setBalance(newBal);
      onUpdateBalance(newBal);
    } else {
      setFreeSpinsLeft(prev => prev - 1);
    }

    setIsSpinning(true);
    setWinLines([]);
    setLastWin(0);
    anubisAudio.playSpin();

    // Determine wrath mode surge chance
    const isWrath = isFree || Math.random() < 0.22;
    setWrathActive(isWrath);
    if (isWrath) {
      anubisAudio.playWrathRoar();
    }

    const spinDuration = isTurbo ? 400 : 800;

    setTimeout(() => {
      const newGrid = generateAnubisGrid(isWrath);
      setGrid(newGrid);

      // Evaluate wins
      const evalResult = evaluateAnubisWins(newGrid, betAmount);

      // Sound per column stop
      [0, 1, 2, 3, 4].forEach(colIdx => {
        setTimeout(() => anubisAudio.playReelStop(colIdx), colIdx * 60);
      });

      setTimeout(() => {
        setIsSpinning(false);

        if (evalResult.scatterCount >= 3) {
          anubisAudio.playScatterTrigger();
          setFreeSpinsLeft(prev => prev + 12);
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 }
          });
        }

        if (evalResult.totalWin > 0) {
          const currentMultiplier = isFree ? multiplier + 1 : (isWrath ? 3 : 2);
          setMultiplier(currentMultiplier);

          const finalWin = evalResult.totalWin * currentMultiplier;
          setLastWin(finalWin);
          setWinLines(evalResult.winLines);
          anubisAudio.playWin();

          setBalance(prev => {
            const updated = prev + finalWin;
            onUpdateBalance(updated);
            return updated;
          });

          if (!isFree) {
            gameEngine.recordRound(betAmount, finalWin, {
              gameId: 'game-anubis',
              gameName: 'Anubis Wrath',
              category: 'slot',
              vendor: 'PG Soft'
            });
          }

          if (finalWin >= betAmount * 10) {
            confetti({
              particleCount: 100,
              spread: 90,
              origin: { y: 0.5 }
            });
          }
        } else {
          if (!isFree) {
            setMultiplier(1);
            gameEngine.recordRound(betAmount, 0, {
              gameId: 'game-anubis',
              gameName: 'Anubis Wrath',
              category: 'slot',
              vendor: 'PG Soft'
            });
          }
        }

        // Auto spin progression
        if (autoSpinsLeft > 0) {
          setAutoSpinsLeft(prev => prev - 1);
        }
      }, 350);
    }, spinDuration);
  };

  useEffect(() => {
    if (!isSpinning && autoSpinsLeft > 0) {
      const timer = setTimeout(() => {
        handleSpin();
      }, isTurbo ? 500 : 1000);
      return () => clearTimeout(timer);
    }
  }, [isSpinning, autoSpinsLeft]);

  return (
    <div className="fixed inset-0 z-50 w-full h-[100dvh] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col overflow-hidden select-none">
      <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-slate-950/80 border-b border-cyan-500/30">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl">🐺</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-base font-black text-cyan-300 tracking-wide uppercase">
                  {language === 'bn' ? 'আনুবিস এর ক্রোধ' : 'Anubis Wrath'}
                </h2>
                <span className="text-[10px] bg-cyan-900/60 text-cyan-200 border border-cyan-500/40 px-1.5 py-0.5 rounded font-bold">
                  PG SOFT
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400">
                {language === 'bn' ? 'মাল্টিপ্লায়ার ও আনলিমিটেড ক্যাসকেড' : 'Egyptian Underworld Multiplier Slot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Watch YouTube Video Button */}
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all active:scale-95 border border-red-400"
              title="Watch Gameplay Video on YouTube"
            >
              <Youtube className="w-4 h-4 text-white fill-white" />
              <span className="hidden sm:inline">YouTube</span>
            </button>

            {/* Paytable */}
            <button
              onClick={() => setShowPaytable(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
              title="Rules & Paytable"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Sound */}
            <button
              onClick={toggleSound}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white shadow-md transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Anubis Underworld Status Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-indigo-950/80 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 border ${
              wrathActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <Flame className="w-3.5 h-3.5 text-cyan-400" />
              <span>{wrathActive ? (language === 'bn' ? 'আনুবিস ক্রোধ সক্রিয়!' : 'WRATH OF ANUBIS!') : (language === 'bn' ? 'স্বাভাবিক মোড' : 'Standard Mode')}</span>
            </div>

            {freeSpinsLeft > 0 && (
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 font-bold animate-bounce">
                🎉 {language === 'bn' ? `ফ্রি স্পিন বাকি: ${freeSpinsLeft}` : `Free Spins: ${freeSpinsLeft}`}
              </div>
            )}
          </div>

          {/* Current Multiplier */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-xl border border-cyan-500/40">
            <span className="text-slate-400 text-[11px] uppercase font-bold">Multiplier:</span>
            <span className="text-base font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
              {multiplier}X
            </span>
          </div>
        </div>

        {/* Main 5x4 Slot Matrix */}
        <div className="p-3 sm:p-5 flex-1 flex flex-col justify-center items-center bg-radial from-slate-900 to-black">
          <div className="w-full max-w-2xl bg-slate-950/90 border-2 border-cyan-500/50 rounded-2xl p-2 sm:p-3.5 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
              {grid.map((column, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5 sm:gap-2">
                  {column.map((cell, rowIdx) => {
                    const isWinning = winLines.some(line =>
                      line.positions.some(pos => pos.col === colIdx && pos.row === rowIdx)
                    );
                    return (
                      <div
                        key={cell.id}
                        className={`aspect-square rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 border ${
                          isWinning
                            ? 'border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                            : 'border-slate-700/60'
                        } p-1 flex items-center justify-center transition-all`}
                      >
                        <AnubisSymbolView
                          type={cell.type}
                          isWrathCharged={cell.isWrathCharged}
                          winHighlight={isWinning}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Winning Display Banner */}
          {lastWin > 0 && (
            <div className="mt-3 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400 rounded-xl text-center animate-pulse">
              <span className="text-xs text-amber-200 font-bold uppercase tracking-wider mr-1.5">
                {language === 'bn' ? 'বিজয়ী লাভ:' : 'WIN AMOUNT:'}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-mono">
                ৳{lastWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        {/* Dashboard Controls */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-cyan-500/30 flex flex-wrap items-center justify-between gap-2.5">
          {/* Balance & Bet Stats */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                {language === 'bn' ? 'ব্যালেন্স' : 'Balance'}
              </span>
              <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono">
                ৳{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">
                {language === 'bn' ? 'বাজি' : 'Bet'}
              </span>
              <div className="flex items-center gap-1">
                {[10, 20, 50, 100, 200].map(amt => (
                  <button
                    key={amt}
                    disabled={isSpinning}
                    onClick={() => setBetAmount(amt)}
                    className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold rounded-lg transition-colors ${
                      betAmount === amt
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ৳{amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Turbo Toggle */}
            <button
              onClick={() => setIsTurbo(prev => !prev)}
              className={`p-2 rounded-xl border transition-colors ${
                isTurbo
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Turbo Spin"
            >
              <Zap className="w-5 h-5" />
            </button>

            {/* Auto Spin */}
            <button
              onClick={() => setAutoSpinsLeft(prev => (prev > 0 ? 0 : 25))}
              disabled={isSpinning}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                autoSpinsLeft > 0
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {autoSpinsLeft > 0 ? `AUTO (${autoSpinsLeft})` : 'AUTO'}
            </button>

            {/* Main Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 ${
                isSpinning
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 hover:from-cyan-400 hover:to-teal-300 text-slate-950 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.6)]'
              }`}
            >
              <RotateCcw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? (language === 'bn' ? 'ঘুরছে...' : 'SPINNING') : (language === 'bn' ? 'স্পিন' : 'SPIN')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paytable Modal */}
      {showPaytable && (
        <AnubisPaytableModal
          language={language}
          onClose={() => setShowPaytable(false)}
        />
      )}

      {/* YouTube Gameplay Modal (Requested link: https://www.youtube.com/watch?v=bEqdGU1MBzk) */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6">
          <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-cyan-500/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-cyan-950/60 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500 fill-red-500" />
                <h3 className="text-sm md:text-base font-bold text-white truncate">
                  {YOUTUBE_VIDEO_ANUBIS.title}
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
                src={YOUTUBE_VIDEO_ANUBIS.embedUrl}
                title={YOUTUBE_VIDEO_ANUBIS.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs text-slate-300">
              <span>{language === 'bn' ? 'আনুবিস এর ক্রোধ - পিজি সফট গেমপ্লে ভিডিও' : 'Anubis Wrath slot by PG Soft | Gameplay & Big Win'}</span>
              <a
                href={YOUTUBE_VIDEO_ANUBIS.url}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
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
