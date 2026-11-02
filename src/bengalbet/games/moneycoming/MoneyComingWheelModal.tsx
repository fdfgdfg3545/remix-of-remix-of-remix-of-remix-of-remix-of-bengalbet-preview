// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, Disc } from 'lucide-react';
import confetti from 'canvas-confetti';
import { moneyComingAudio } from './moneyComingAudio';
import { Language } from '../../types';

interface WheelModalProps {
  isOpen: boolean;
  bet: number;
  language: Language;
  onClose: () => void;
  onWin: (amount: number) => void;
}

const WHEEL_PRIZES = [
  { multiplier: 25, label: '25X', color: '#f59e0b' },
  { multiplier: 50, label: '50X', color: '#10b981' },
  { multiplier: 100, label: '100X', color: '#ef4444' },
  { multiplier: 200, label: '200X', color: '#8b5cf6' },
  { multiplier: 500, label: '500X', color: '#06b6d4' },
  { multiplier: 1000, label: '1,000X', color: '#ec4899' },
  { multiplier: 2000, label: '2,000X', color: '#eab308' },
  { multiplier: 10000, label: '10,000X', color: '#f97316' }
];

export const MoneyComingWheelModal: React.FC<WheelModalProps> = ({
  isOpen,
  bet,
  language,
  onClose,
  onWin
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<{ multiplier: number; amount: number } | null>(null);
  const hasSpunRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasSpunRef.current) {
      hasSpunRef.current = true;
      startWheelSpin();
    }
  }, [isOpen]);

  const startWheelSpin = () => {
    setIsSpinning(true);
    setWonPrize(null);

    // Pick weighted winner
    const rand = Math.random();
    let winnerIndex = 0;
    if (rand < 0.45) winnerIndex = 0; // 25x
    else if (rand < 0.75) winnerIndex = 1; // 50x
    else if (rand < 0.90) winnerIndex = 2; // 100x
    else if (rand < 0.96) winnerIndex = 3; // 200x
    else if (rand < 0.985) winnerIndex = 4; // 500x
    else if (rand < 0.995) winnerIndex = 5; // 1000x
    else if (rand < 0.999) winnerIndex = 6; // 2000x
    else winnerIndex = 7; // 10,000x jackpot!

    const sliceAngle = 360 / WHEEL_PRIZES.length;
    // Extra rotations for speed + target angle
    const extraRotations = 360 * 5;
    const targetAngle = extraRotations + (360 - (winnerIndex * sliceAngle + sliceAngle / 2));

    setRotation(targetAngle);

    // Sound ticking loop
    const tickInterval = setInterval(() => {
      moneyComingAudio.playWheelTick();
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);

      const prize = WHEEL_PRIZES[winnerIndex];
      const winAmount = bet * prize.multiplier;
      setWonPrize({ multiplier: prize.multiplier, amount: winAmount });

      moneyComingAudio.playBigWin();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });

      onWin(winAmount);
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/90 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#291300] via-[#1a0c00] to-[#0d0600] border-2 border-yellow-400 rounded-3xl p-5 text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] flex flex-col items-center">
        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
          <h2 className="text-xl sm:text-2xl font-black font-game tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
            {language === 'bn' ? 'সুপার লাকি হুইল বোনাস' : 'SUPER LUCKY WHEEL BONUS'}
          </h2>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" />
        </div>

        <p className="text-xs text-yellow-200/80 mb-4 font-semibold">
          {language === 'bn' ? '১০,০০০X পর্যন্ত নিশ্চিত বিশাল মেগা জ্যাকপট' : 'Win up to 10,000X Instant Mega Jackpot!'}
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute top-0 z-20 -mt-2">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-300 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] animate-bounce" />
          </div>

          {/* Rotating Wheel Circle */}
          <div
            className="w-full h-full rounded-full border-4 border-yellow-400 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.7)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none'
            }}
          >
            {WHEEL_PRIZES.map((item, idx) => {
              const rotate = idx * (360 / WHEEL_PRIZES.length);
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full top-0 left-0 flex items-start justify-center pt-3 origin-center"
                  style={{ transform: `rotate(${rotate}deg)` }}
                >
                  <div
                    className="w-0.5 h-1/2 absolute top-0 bg-yellow-300/40"
                    style={{ transform: 'translateX(-50%)' }}
                  />
                  <span
                    className="font-game text-sm sm:text-base font-black px-1.5 py-0.5 rounded shadow text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Cap */}
          <div className="absolute z-10 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-600 via-amber-300 to-yellow-500 border-2 border-white shadow-xl flex items-center justify-center">
            <Disc className="w-8 h-8 text-amber-950 animate-spin-slow" />
          </div>
        </div>

        {/* Won Prize Announcement */}
        {wonPrize && (
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-yellow-900/60 via-amber-600/40 to-yellow-900/60 border border-yellow-400 animate-in zoom-in-95">
            <div className="text-xs text-yellow-300 font-bold uppercase tracking-wider">
              {language === 'bn' ? 'অভিনন্দন! আপনি জিতেছেন' : 'CONGRATULATIONS! YOU WON'}
            </div>
            <div className="text-2xl sm:text-3xl font-black font-game text-white tracking-widest my-1 drop-shadow-md">
              ৳ {wonPrize.amount.toLocaleString()} ({wonPrize.multiplier}X)
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-5 w-full">
          {wonPrize ? (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-amber-950 font-black font-game text-xl tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {language === 'bn' ? 'পুরস্কার সংগ্রহ করুন' : 'COLLECT PRIZE'}
            </button>
          ) : (
            <div className="text-xs font-bold text-yellow-300/80 animate-pulse">
              {language === 'bn' ? 'চাকা ঘুরছে...' : 'Wheel is spinning...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
