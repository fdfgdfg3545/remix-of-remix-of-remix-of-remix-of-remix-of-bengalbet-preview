// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { FORTUNE_WHEEL_SLICES } from './fortuneGemsEngine';
import { fortuneGemsAudio } from './fortuneGemsAudio';

interface FortuneWheelModalProps {
  isOpen: boolean;
  betAmount: number;
  language: 'en' | 'bn';
  onClaim: (winAmount: number) => void;
  onClose: () => void;
}

export const FortuneWheelModal: React.FC<FortuneWheelModalProps> = ({
  isOpen,
  betAmount,
  language,
  onClaim,
  onClose
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonSlice, setWonSlice] = useState<typeof FORTUNE_WHEEL_SLICES[0] | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const audioTickIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setRotation(0);
      setWonSlice(null);
      setHasSpun(false);
      setIsSpinning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpinWheel = () => {
    if (isSpinning || hasSpun) return;

    fortuneGemsAudio.playButtonClick();
    setIsSpinning(true);

    // Pick winning slice
    // Random slice with weighted probabilities
    const rand = Math.random() * 100;
    let targetIndex = 0;
    if (rand < 25) targetIndex = 0; // 50X
    else if (rand < 48) targetIndex = 4; // 60X
    else if (rand < 68) targetIndex = 2; // 80X
    else if (rand < 82) targetIndex = 1; // 100X
    else if (rand < 91) targetIndex = 6; // 150X
    else if (rand < 96) targetIndex = 3; // 200X
    else if (rand < 98.8) targetIndex = 5; // 300X
    else targetIndex = 7; // 1000X Jackpot!

    const sliceAngle = 360 / FORTUNE_WHEEL_SLICES.length;
    // Calculate final rotation so the top pointer (0 deg) points to target slice
    // Target slice center angle = (targetIndex * sliceAngle) + (sliceAngle / 2)
    const extraRounds = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetAngle = 360 - (targetIndex * sliceAngle + sliceAngle / 2);
    const finalRotation = extraRounds * 360 + targetAngle;

    setRotation(finalRotation);

    // Sound ticks
    let tickCount = 0;
    audioTickIntervalRef.current = setInterval(() => {
      tickCount++;
      if (tickCount < 30) {
        fortuneGemsAudio.playWheelTick();
      }
    }, 120);

    // After 4.5s animation
    setTimeout(() => {
      clearInterval(audioTickIntervalRef.current);
      setIsSpinning(false);
      setHasSpun(true);
      const selected = FORTUNE_WHEEL_SLICES[targetIndex];
      setWonSlice(selected);

      fortuneGemsAudio.playBigWinCelebration(selected.multiplier >= 200 ? 'super' : 'big');
    }, 4500);
  };

  const handleCollect = () => {
    if (!wonSlice) return;
    const winAmount = betAmount * wonSlice.multiplier;
    onClaim(winAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#241335] via-[#150a22] to-[#0d0615] border-2 border-yellow-500 rounded-3xl p-5 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex flex-col items-center select-none animate-in fade-in zoom-in-95">
        {/* Garuda Emblem Header */}
        <div className="text-center mb-3">
          <span className="text-xs font-black tracking-widest text-amber-300 uppercase px-3 py-1 bg-amber-950/80 rounded-full border border-yellow-500/50">
            {language === 'bn' ? 'গরুড়া বোনাস হুইল' : 'GARUDA BONUS WHEEL'}
          </span>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mt-1 drop-shadow">
            {language === 'bn' ? '১,০০০X পর্যন্ত জয়!' : 'WIN UP TO 1,000X!'}
          </h2>
          <p className="text-xs text-amber-200/70">
            {language === 'bn'
              ? `বর্তমান বাজি: ৳${betAmount.toFixed(2)}`
              : `Current Bet: ৳${betAmount.toFixed(2)}`}
          </p>
        </div>

        {/* Wheel Assembly */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <div className="w-0 h-0 border-x-[12px] border-x-transparent border-t-[20px] border-t-yellow-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce" />
            <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-yellow-300 -mt-1 shadow" />
          </div>

          {/* Outer glowing rim */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400/80 shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-pulse" />

          {/* Rotating SVG Wheel */}
          <div
            className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4500ms] ease-out shadow-inner"
            style={{
              transform: `rotate(${rotation}deg)`
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {FORTUNE_WHEEL_SLICES.map((slice, i) => {
                const totalSlices = FORTUNE_WHEEL_SLICES.length;
                const angle = 360 / totalSlices;
                const startAngle = i * angle;
                const endAngle = startAngle + angle;

                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);

                const midAngle = startAngle + angle / 2;
                const midRad = ((midAngle - 90) * Math.PI) / 180;
                const textX = 100 + 65 * Math.cos(midRad);
                const textY = 100 + 65 * Math.sin(midRad);

                const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;

                return (
                  <g key={i}>
                    <path
                      d={pathData}
                      fill={slice.color}
                      stroke="#CA8A04"
                      strokeWidth="2"
                    />
                    <text
                      x={textX}
                      y={textY}
                      fill={slice.text}
                      fontSize={slice.isJackpot ? "14" : "13"}
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      className="drop-shadow"
                    >
                      {slice.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Garuda Gold Medallion */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 border-2 border-yellow-100 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center z-20">
            <span className="text-xl">🦅</span>
            <span className="text-[7px] font-black text-black tracking-tighter uppercase -mt-1">
              JILI
            </span>
          </div>
        </div>

        {/* Status / Won Banner */}
        <div className="w-full mt-3 min-h-[70px] flex flex-col items-center justify-center">
          {wonSlice ? (
            <div className="text-center animate-in zoom-in-90 duration-300">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                {language === 'bn' ? 'অভিনন্দন! আপনি জিতেছেন' : 'CONGRATULATIONS! YOU WON'}
              </span>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
                ৳{(betAmount * wonSlice.multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs font-bold text-emerald-400">
                ({wonSlice.multiplier}X Multiplier!)
              </span>
            </div>
          ) : (
            <p className="text-xs text-amber-200/80 text-center">
              {language === 'bn'
                ? 'হুইল ঘুরিয়ে মেগা পুরষ্কার জিতুন!'
                : 'Spin the wheel for an instant massive payout!'}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="w-full mt-2">
          {!hasSpun ? (
            <button
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className="w-full py-3 rounded-xl font-black text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.6)] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-black active:scale-95 disabled:opacity-50"
            >
              {isSpinning
                ? (language === 'bn' ? 'ঘুরছে...' : 'SPINNING...')
                : (language === 'bn' ? 'হুইল ঘোরান 🎡' : 'SPIN WHEEL 🎡')}
            </button>
          ) : (
            <button
              onClick={handleCollect}
              className="w-full py-3 rounded-xl font-black text-base uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.7)] bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 hover:from-emerald-400 hover:to-green-300 text-black active:scale-95 animate-pulse"
            >
              {language === 'bn' ? 'পুরষ্কার সংগ্রহ করুন 💰' : 'COLLECT WIN 💰'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
