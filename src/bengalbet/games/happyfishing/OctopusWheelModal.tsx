// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Award } from 'lucide-react';

interface OctopusWheelModalProps {
  betAmount: number;
  language: 'en' | 'bn';
  onCollect: (totalWin: number) => void;
}

const WHEEL_MULTIPLIERS = [100, 150, 200, 300, 450, 600, 750, 950];

export const OctopusWheelModal: React.FC<OctopusWheelModalProps> = ({
  betAmount,
  language,
  onCollect
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number | null>(null);

  useEffect(() => {
    // Automatically trigger the wheel spin
    setIsSpinning(true);
    const chosenIndex = Math.floor(Math.random() * WHEEL_MULTIPLIERS.length);
    const chosenMult = WHEEL_MULTIPLIERS[chosenIndex];

    const segmentAngle = 360 / WHEEL_MULTIPLIERS.length;
    const finalRot = 360 * 5 + (360 - chosenIndex * segmentAngle - segmentAngle / 2);
    setRotation(finalRot);

    const timer = setTimeout(() => {
      setIsSpinning(false);
      setSelectedMultiplier(chosenMult);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const totalWon = (selectedMultiplier || 100) * betAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative flex flex-col items-center text-center p-6 md:p-8 rounded-3xl bg-gradient-to-b from-purple-950 via-slate-900 to-black border-2 border-yellow-400 shadow-[0_0_80px_rgba(168,85,247,0.7)] max-w-md w-full">
        <div className="text-4xl mb-2 animate-bounce">🐙👑</div>
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 uppercase tracking-tight drop-shadow-[0_0_15px_#facc15]">
          {language === 'bn' ? 'মেগা অক্টোপাস হুইল!' : 'MEGA OCTOPUS WHEEL!'}
        </h2>
        <p className="text-xs text-purple-300 font-mono mt-1 mb-4">
          {language === 'bn' ? '৯৫০X পর্যন্ত জ্যাকপট পুরস্কার!' : 'WIN UP TO 950X MEGA MULTIPLIER!'}
        </p>

        {/* The Animated Spinning Wheel */}
        <div className="relative w-64 h-64 my-4 flex items-center justify-center">
          {/* Wheel Pointer */}
          <div className="absolute -top-3 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-[0_0_8px_#facc15]" />

          <div
            className="w-full h-full rounded-full border-4 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.6)] relative overflow-hidden transition-all duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {WHEEL_MULTIPLIERS.map((mult, idx) => {
              const deg = idx * (360 / WHEEL_MULTIPLIERS.length);
              const isHigh = mult >= 600;
              return (
                <div
                  key={idx}
                  className={`absolute w-full h-full flex justify-center items-start pt-3 font-mono font-black text-sm ${
                    isHigh ? 'text-yellow-300' : 'text-purple-200'
                  }`}
                  style={{
                    transform: `rotate(${deg}deg)`,
                    transformOrigin: '50% 50%'
                  }}
                >
                  <span className="bg-black/60 px-2 py-0.5 rounded-full border border-yellow-400/40">
                    {mult}X
                  </span>
                </div>
              );
            })}
          </div>

          {/* Central Gem */}
          <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-600 border-2 border-white shadow-xl flex items-center justify-center font-black text-slate-950 text-xs">
            JILI
          </div>
        </div>

        {/* Won result */}
        {selectedMultiplier && (
          <div className="my-3 p-3 bg-black/60 rounded-2xl border border-yellow-400/60 w-full animate-in zoom-in-90">
            <div className="text-xs text-yellow-300 uppercase font-mono">
              {language === 'bn' ? 'মাল্টিপ্লায়ার জয়:' : 'MULTIPLIER AWARDED:'} {selectedMultiplier}X
            </div>
            <div className="text-3xl font-black text-yellow-400 font-mono drop-shadow-[0_0_10px_#facc15]">
              ৳{totalWon.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        )}

        <button
          onClick={() => onCollect(totalWon)}
          disabled={isSpinning}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 disabled:opacity-50 transition"
        >
          {isSpinning 
            ? (language === 'bn' ? 'হুইল ঘুরছে...' : 'SPINNING WHEEL...') 
            : (language === 'bn' ? 'পুরস্কার গ্রহণ করুন' : 'COLLECT PRIZE')}
        </button>
      </div>
    </div>
  );
};
