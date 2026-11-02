// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fortuneTreeAudio } from './fortuneTreeAudio';

interface FortuneTreeBonusModalProps {
  language: 'en' | 'bn';
  betAmount: number;
  onComplete: (wonAmount: number) => void;
}

export const FortuneTreeBonusModal: React.FC<FortuneTreeBonusModalProps> = ({
  language,
  betAmount,
  onComplete
}) => {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [revealedPrizes, setRevealedPrizes] = useState<number[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);

  const potentialPrizes = [30, 60, 100, 200, 500];

  const handlePickHongbao = (index: number) => {
    if (pickedIndex !== null) return;

    setPickedIndex(index);
    fortuneTreeAudio.playHongbaoPop();

    // Determine won prize
    const luckyPrize = [50, 88, 188, 388, 888][Math.floor(Math.random() * 5)];
    const otherPrizes = [28, 58, 128, 288, 588].filter(p => p !== luckyPrize);

    const result: number[] = [];
    let otherIdx = 0;
    for (let i = 0; i < 5; i++) {
      if (i === index) {
        result.push(luckyPrize);
      } else {
        result.push(otherPrizes[otherIdx++ % otherPrizes.length]);
      }
    }

    setRevealedPrizes(result);
    const winCash = luckyPrize * betAmount;

    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 }
    });

    fortuneTreeAudio.playBigWin();

    setTimeout(() => {
      setIsDone(true);
    }, 1300);
  };

  const wonMultiplier = pickedIndex !== null && revealedPrizes[pickedIndex] ? revealedPrizes[pickedIndex] : 88;
  const wonCash = wonMultiplier * betAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#420917] via-[#24040c] to-[#120105] border-2 border-yellow-400 rounded-3xl p-6 text-white text-center shadow-[0_0_50px_rgba(234,179,8,0.5)]">
        
        {/* Header Tag */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-yellow-100 font-black px-6 py-1.5 rounded-full uppercase tracking-widest text-sm shadow-xl flex items-center gap-2 border border-yellow-300">
          <Sparkles className="w-4 h-4 text-yellow-200 fill-yellow-200 animate-spin" />
          {language === 'bn' ? 'স্বর্ণবৃক্ষের লাল খাম বোনাস' : 'Fortune Tree Hongbao Bonus'}
        </div>

        {/* Tree Visual */}
        <div className="flex flex-col items-center justify-center my-3">
          <span className="text-6xl filter drop-shadow animate-pulse">🌳</span>
          <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 mt-2">
            {language === 'bn' ? 'একটি লাল খাম (Hongbao) বেছে নিন!' : 'Pick a Lucky Red Envelope!'}
          </h3>
          <p className="text-xs text-amber-200/80">
            {language === 'bn'
              ? 'ফরচুন ট্রি-এর ডালে ঝুলন্ত খাম থেকে ৮৮৮X পর্যন্ত মেগা বোনাস জিতুন'
              : 'Shaken from the branches of the Golden Tree up to 888X multiplier'}
          </p>
        </div>

        {/* 5 Hanging Red Packets */}
        <div className="grid grid-cols-5 gap-2 my-5">
          {[0, 1, 2, 3, 4].map(idx => {
            const isSelected = pickedIndex === idx;
            const isRevealed = revealedPrizes.length > 0;
            const mult = revealedPrizes[idx];

            return (
              <button
                key={idx}
                onClick={() => handlePickHongbao(idx)}
                disabled={pickedIndex !== null}
                className={`relative group flex flex-col items-center justify-center py-4 px-1 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-b from-yellow-400 via-amber-500 to-red-600 border-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.9)] scale-110 z-10'
                    : isRevealed
                    ? 'bg-red-950/40 border-amber-500/20 opacity-50'
                    : 'bg-gradient-to-b from-red-600 to-red-900 border-yellow-400/60 hover:border-yellow-300 hover:scale-105 cursor-pointer shadow-lg'
                }`}
              >
                <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                  🧧
                </span>

                {isRevealed ? (
                  <div className="mt-1.5">
                    <span className="text-sm font-black text-yellow-300 drop-shadow block">
                      {mult}X
                    </span>
                    <span className="text-[9px] text-amber-200 font-bold block">
                      ৳{(mult * betAmount).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-yellow-200 mt-1 uppercase">
                    {language === 'bn' ? 'খুলুন' : 'OPEN'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Result & Collect */}
        {isDone && (
          <div className="mt-5 pt-4 border-t border-yellow-500/30 animate-in slide-in-from-bottom">
            <p className="text-xs text-amber-300 uppercase tracking-widest font-bold">
              {language === 'bn' ? 'মোট অর্জিত সম্পদ' : 'Total Hongbao Treasure'}
            </p>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 my-1">
              ৳{wonCash.toLocaleString()} <span className="text-base text-yellow-300">({wonMultiplier}X)</span>
            </div>

            <button
              onClick={() => onComplete(wonCash)}
              className="mt-3 px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-amber-950 font-black text-base shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span>{language === 'bn' ? 'পুরস্কার গ্রহণ করুন' : 'Collect Fortune'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
