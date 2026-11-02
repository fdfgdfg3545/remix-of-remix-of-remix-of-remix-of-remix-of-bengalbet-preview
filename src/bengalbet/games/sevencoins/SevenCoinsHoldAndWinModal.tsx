// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Sparkles, Coins, Trophy, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sevenCoinsAudio } from './sevenCoinsAudio';
import { JackpotTier } from './sevenCoinsTypes';

interface BonusCell {
  id: string;
  hasCoin: boolean;
  value: number; // multiplier of bet
  tier?: JackpotTier;
  isCollect?: boolean;
}

interface SevenCoinsHoldAndWinModalProps {
  language: 'en' | 'bn';
  betAmount: number;
  initialCoinsCount: number;
  onComplete: (totalWinAmount: number) => void;
}

export const SevenCoinsHoldAndWinModal: React.FC<SevenCoinsHoldAndWinModalProps> = ({
  language,
  betAmount,
  initialCoinsCount,
  onComplete
}) => {
  const [respins, setRespins] = useState<number>(3);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Initialize 3x3 grid with initial coins
  const [cells, setCells] = useState<BonusCell[]>(() => {
    const arr: BonusCell[] = [];
    for (let i = 0; i < 9; i++) {
      const isInitial = i < Math.min(initialCoinsCount, 3);
      arr.push({
        id: `bonus-cell-${i}`,
        hasCoin: isInitial,
        value: isInitial ? [2, 5, 10][i] : 0,
        tier: i === 2 ? 'mini' : undefined,
        isCollect: i === 1
      });
    }
    return arr;
  });

  const filledCount = cells.filter(c => c.hasCoin).length;
  const isGrandJackpot = filledCount === 9;

  // Calculate current accumulated total win
  const totalMultipliers = cells.reduce((acc, c) => (c.hasCoin ? acc + (c.tier === 'major' ? 150 : c.tier === 'minor' ? 50 : c.tier === 'mini' ? 25 : c.value) : acc), 0);
  const grandBonus = isGrandJackpot ? 2000 : 0;
  const totalWinAmount = (totalMultipliers + grandBonus) * betAmount;

  const handleRespin = async () => {
    if (isSpinning || respins <= 0 || isFinished) return;
    setIsSpinning(true);
    sevenCoinsAudio.playSpin();

    await new Promise(r => setTimeout(r, 600));

    let landedNewCoin = false;
    const nextCells = [...cells];

    nextCells.forEach((cell, idx) => {
      if (!cell.hasCoin && Math.random() < 0.28) {
        landedNewCoin = true;
        const rand = Math.random();
        let tier: JackpotTier | undefined;
        let value = 1;

        if (rand < 0.03) {
          tier = 'major';
          value = 150;
        } else if (rand < 0.08) {
          tier = 'minor';
          value = 50;
        } else if (rand < 0.16) {
          tier = 'mini';
          value = 25;
        } else {
          value = [1, 2, 3, 5, 8, 10, 15][Math.floor(Math.random() * 7)];
        }

        cell.hasCoin = true;
        cell.value = value;
        cell.tier = tier;
        sevenCoinsAudio.playCoinDrop();
      }
    });

    setCells(nextCells);

    const newFilledCount = nextCells.filter(c => c.hasCoin).length;

    if (newFilledCount === 9) {
      // Grand Jackpot!
      sevenCoinsAudio.playGrandJackpot();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      setIsFinished(true);
      setIsSpinning(false);
      return;
    }

    if (landedNewCoin) {
      setRespins(3);
    } else {
      const nextRespins = respins - 1;
      setRespins(nextRespins);
      if (nextRespins <= 0) {
        setIsFinished(true);
        sevenCoinsAudio.playBonusTrigger();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }

    setIsSpinning(false);
  };

  // Auto-play respins smoothly
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isSpinning && !isFinished && respins > 0) {
      timer = setTimeout(() => {
        handleRespin();
      }, 900);
    }
    return () => clearTimeout(timer);
  }, [respins, isSpinning, isFinished]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 md:p-6 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#190d2e] via-[#0f091f] to-[#080512] border-2 border-yellow-400 rounded-3xl p-5 md:p-6 text-white shadow-[0_0_60px_rgba(168,85,247,0.5)] flex flex-col items-center">
        
        {/* Jackpot Header Indicators */}
        <div className="w-full grid grid-cols-4 gap-1.5 mb-4 text-center">
          <div className="bg-yellow-950/60 border border-yellow-500/40 rounded-lg p-1.5">
            <span className="text-[9px] font-black text-yellow-400 block uppercase">GRAND</span>
            <span className="text-xs font-black text-white">2000X</span>
          </div>
          <div className="bg-red-950/60 border border-red-500/40 rounded-lg p-1.5">
            <span className="text-[9px] font-black text-red-400 block uppercase">MAJOR</span>
            <span className="text-xs font-black text-white">150X</span>
          </div>
          <div className="bg-blue-950/60 border border-blue-500/40 rounded-lg p-1.5">
            <span className="text-[9px] font-black text-blue-400 block uppercase">MINOR</span>
            <span className="text-xs font-black text-white">50X</span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-lg p-1.5">
            <span className="text-[9px] font-black text-emerald-400 block uppercase">MINI</span>
            <span className="text-xs font-black text-white">25X</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 uppercase tracking-widest text-center flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          {language === 'bn' ? 'হোল্ড অ্যান্ড উইন বোনাস' : 'HOLD AND WIN BONUS'}
        </h3>

        {/* Respins Meter */}
        <div className="my-3 flex items-center gap-3 bg-black/60 px-4 py-1.5 rounded-full border border-yellow-500/30">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {language === 'bn' ? 'বাকি রিস্পিন:' : 'RESPINS REMAINING:'}
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(dot => (
              <div
                key={dot}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  dot <= respins
                    ? 'bg-yellow-400 shadow-[0_0_8px_#facc15] scale-110'
                    : 'bg-zinc-700/60 scale-90'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-sm p-3 bg-black/70 rounded-2xl border border-yellow-500/30 my-2">
          {cells.map(cell => (
            <div
              key={cell.id}
              className="h-20 sm:h-24 rounded-xl flex items-center justify-center bg-[#151226] border border-indigo-900/50 relative overflow-hidden"
            >
              {cell.hasCoin ? (
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-2 animate-in zoom-in-50 ${
                  cell.tier === 'major'
                    ? 'bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-300 border-red-300 shadow-[0_0_15px_rgba(239,68,68,0.9)]'
                    : cell.tier === 'minor'
                    ? 'bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-300 border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.9)]'
                    : cell.tier === 'mini'
                    ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-300 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.9)]'
                    : 'bg-gradient-to-tr from-amber-600 via-yellow-400 to-yellow-200 border-yellow-100 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                }`}>
                  {cell.tier ? (
                    <>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-950">
                        {cell.tier}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {cell.tier === 'major' ? '150X' : cell.tier === 'minor' ? '50X' : '25X'}
                      </span>
                    </>
                  ) : cell.isCollect ? (
                    <>
                      <Coins className="w-4 h-4 text-slate-900" />
                      <span className="text-[8px] font-black uppercase text-slate-900">COLLECT</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-black text-slate-950 drop-shadow">
                        {cell.value}X
                      </span>
                      <span className="text-[8px] font-bold text-amber-950">
                        ৳{(betAmount * cell.value).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-3 h-3 rounded-full bg-slate-700/30" />
              )}
            </div>
          ))}
        </div>

        {/* Current Total Win */}
        <div className="mt-3 text-center">
          <span className="text-xs text-slate-300 font-bold uppercase block">
            {language === 'bn' ? 'বর্তমান অর্জিত বোনাস জয়:' : 'CURRENT TOTAL BONUS WIN:'}
          </span>
          <span className="text-2xl md:text-3xl font-black text-yellow-300 drop-shadow-[0_2px_10px_rgba(250,204,21,0.8)]">
            ৳{totalWinAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {isGrandJackpot && (
            <span className="text-xs font-black text-rose-400 uppercase tracking-widest block animate-bounce mt-1">
              🏆 GRAND JACKPOT UNLOCKED (+2,000X)!
            </span>
          )}
        </div>

        {/* Bottom Button */}
        {isFinished ? (
          <button
            onClick={() => onComplete(totalWinAmount)}
            className="mt-4 px-8 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-xl hover:brightness-110 active:scale-95 transition-all"
          >
            {language === 'bn' ? 'পুরস্কার সংগ্রহ করুন' : 'Collect Winnings'}
          </button>
        ) : (
          <button
            onClick={handleRespin}
            disabled={isSpinning}
            className="mt-4 px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-yellow-500/30 text-yellow-300 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? (language === 'bn' ? 'ঘুরছে...' : 'Spinning...') : (language === 'bn' ? 'রিস্পিন' : 'Respin Now')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
