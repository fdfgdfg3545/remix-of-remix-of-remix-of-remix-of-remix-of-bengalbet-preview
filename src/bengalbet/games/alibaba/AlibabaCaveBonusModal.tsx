// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles, Trophy, Gift, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { alibabaAudio } from './alibabaAudio';

interface AlibabaCaveBonusModalProps {
  language: 'en' | 'bn';
  betAmount: number;
  onComplete: (wonAmount: number) => void;
}

export const AlibabaCaveBonusModal: React.FC<AlibabaCaveBonusModalProps> = ({
  language,
  betAmount,
  onComplete
}) => {
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [revealedPrizes, setRevealedPrizes] = useState<number[]>([]);
  const [isDone, setIsDone] = useState<boolean>(false);

  // Available multipliers in the cave urns
  const potentialPrizes = [25, 50, 100, 250, 500];

  const handlePickUrn = (index: number) => {
    if (pickedIndex !== null) return;

    setPickedIndex(index);
    alibabaAudio.playCascadeWin();

    // Assign randomized multiplier to picked urn, ensuring a good win
    const luckyPrize = [50, 100, 250, 500][Math.floor(Math.random() * 4)];
    const otherPrizes = potentialPrizes.filter(p => p !== luckyPrize).sort(() => 0.5 - Math.random());

    const result: number[] = [];
    let otherIdx = 0;
    for (let i = 0; i < 3; i++) {
      if (i === index) {
        result.push(luckyPrize);
      } else {
        result.push(otherPrizes[otherIdx++]);
      }
    }

    setRevealedPrizes(result);
    const winCash = luckyPrize * betAmount;

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 }
    });

    alibabaAudio.playBigWin();

    setTimeout(() => {
      setIsDone(true);
    }, 1200);
  };

  const wonMultiplier = pickedIndex !== null && revealedPrizes[pickedIndex] ? revealedPrizes[pickedIndex] : 50;
  const wonCash = wonMultiplier * betAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#2a134d] via-[#1b0c33] to-[#0d0519] border-2 border-amber-400 rounded-3xl p-6 text-white text-center shadow-[0_0_50px_rgba(234,179,8,0.4)]">
        {/* Glow & Sparkles */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 text-slate-950 font-black px-6 py-1.5 rounded-full uppercase tracking-widest text-sm shadow-xl flex items-center gap-2 border border-yellow-100">
          <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900 animate-spin" />
          {language === 'bn' ? 'আলী বাবার গুহার গুপ্তধন' : "Ali Baba's Cave Bonus"}
        </div>

        <h3 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 mt-4 mb-2">
          {language === 'bn' ? 'একটি জাদুর কলস বেছে নিন!' : 'Pick a Magic Treasure Urn!'}
        </h3>
        <p className="text-xs text-amber-200/80 mb-6">
          {language === 'bn'
            ? '৪০ চোরের গোপন ধনাগার থেকে আপনার উপহার পান'
            : 'Reveal the secret wealth of the 40 Thieves cave'}
        </p>

        {/* 3 Interactive Urns */}
        <div className="grid grid-cols-3 gap-3 my-6">
          {[0, 1, 2].map(idx => {
            const isSelected = pickedIndex === idx;
            const isRevealed = revealedPrizes.length > 0;
            const mult = revealedPrizes[idx];

            return (
              <button
                key={idx}
                onClick={() => handlePickUrn(idx)}
                disabled={pickedIndex !== null}
                className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-b from-amber-500 to-yellow-600 border-yellow-200 shadow-[0_0_25px_rgba(250,204,21,0.9)] scale-105'
                    : isRevealed
                    ? 'bg-slate-900/60 border-amber-500/20 opacity-60'
                    : 'bg-gradient-to-b from-purple-900/70 to-indigo-950/80 border-purple-400/50 hover:border-amber-400 hover:scale-105 cursor-pointer shadow-lg'
                }`}
              >
                <span className="text-5xl my-2 filter drop-shadow group-hover:scale-110 transition-transform">
                  🏺
                </span>

                {isRevealed ? (
                  <div className="mt-2">
                    <span className="text-xl font-black text-yellow-300 drop-shadow">
                      {mult}X
                    </span>
                    <p className="text-[10px] text-amber-200 font-bold">
                      ৳{(mult * betAmount).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-300 mt-1 uppercase tracking-wider">
                    {language === 'bn' ? 'খুলুন' : 'OPEN'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Revealed Win Announcement */}
        {isDone && (
          <div className="mt-6 pt-4 border-t border-amber-500/30 animate-in slide-in-from-bottom">
            <p className="text-xs text-amber-300 uppercase tracking-widest font-bold">
              {language === 'bn' ? 'মোট বোনাস জয়' : 'Total Cave Treasure'}
            </p>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 my-1">
              ৳{wonCash.toLocaleString()} <span className="text-base text-yellow-300">({wonMultiplier}X)</span>
            </div>

            <button
              onClick={() => onComplete(wonCash)}
              className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-amber-950 font-black text-base shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span>{language === 'bn' ? 'পুরস্কার গ্রহণ করুন' : 'Collect Treasure'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
