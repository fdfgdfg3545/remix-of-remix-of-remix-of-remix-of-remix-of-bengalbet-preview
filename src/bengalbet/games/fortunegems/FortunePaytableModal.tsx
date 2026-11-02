// @ts-nocheck
import React from 'react';
import { FORTUNE_SYMBOLS, FORTUNE_PAYLINES } from './fortuneGemsTypes';
import { FortuneSymbolView } from './FortuneSymbolView';

interface FortunePaytableModalProps {
  isOpen: boolean;
  language: 'en' | 'bn';
  onClose: () => void;
}

export const FortunePaytableModal: React.FC<FortunePaytableModalProps> = ({
  isOpen,
  language,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#21142f] via-[#150a22] to-[#0d0617] border-2 border-yellow-600/70 rounded-2xl p-5 shadow-[0_0_40px_rgba(202,138,4,0.4)] text-white select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦅</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500">
                {language === 'bn' ? 'ফরচুন জেমস ৩: পে-টেবিল ও নিয়ম' : 'Fortune Gems 3: Paytable & Rules'}
              </h2>
              <p className="text-[11px] text-amber-300/70">
                {language === 'bn' ? 'JILI খাঁটি মেকানিক্স ও পে-আউট রেট' : 'Authentic JILI Slot Mechanics & Multipliers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-950/80 border border-yellow-600/60 text-yellow-300 hover:bg-amber-900 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-5 text-xs text-zinc-300">
          {/* Section 1: Split Symbols Mechanic */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-yellow-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider">
                {language === 'bn' ? 'স্প্লিট সিম্বল মেকানিক (ফরচুন জেমস ৩)' : 'Split Symbol Feature (Fortune Gems 3)'}
              </h3>
            </div>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'ফরচুন জেমস ৩-এ প্রতিটি সিম্বল ১x, ২x বা ৩x স্প্লিট হিসেবে আবির্ভূত হতে পারে! যখন একটি পে-লাইনে একাধিক স্প্লিট সিম্বল সংযুক্ত হয়, তখন তাদের মান পরস্পরের সাথে গুণ হয় (যেমন ২x * ৩x = ৬x), এবং এরপর ৪র্থ রিলের গুণক দ্বারা গুণিত হয়!'
                : 'In Fortune Gems 3, symbols can land as 1X, 2X, or 3X split symbols! When connected on a payline, their split values multiply together (e.g. 2X * 3X = 6X line boost) and then get multiplied by the 4th Reel Multiplier!'}
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-black/40 border border-amber-900/40">
                <span className="block text-amber-400 font-bold text-xs">1X Normal</span>
                <span className="text-[10px] text-zinc-400">Single Symbol</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-amber-500/40">
                <span className="block text-yellow-300 font-bold text-xs">2X Split ⚡</span>
                <span className="text-[10px] text-zinc-400">Counts as 2 Symbols</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-red-500/40">
                <span className="block text-red-400 font-bold text-xs">3X Split 🔥</span>
                <span className="text-[10px] text-zinc-400">Counts as 3 Symbols</span>
              </div>
            </div>
          </div>

          {/* Section 2: 4th Multiplier Reel */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🎡</span>
              <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wider">
                {language === 'bn' ? '৪র্থ মাল্টিপ্লায়ার রিল ও বোনাস হুইল' : '4th Multiplier Reel & Bonus Wheel'}
              </h3>
            </div>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'ডানপাশের ৪র্থ রিলটি প্রতি স্পিনে বিভিন্ন গুণক প্রদর্শন করে: ১x, ২x, ৩x, ৫x, ১০x, ১৫x, ২০x এবং হুইল বোনাস। সেন্ট্রাল মার্কারের গুণকটি ওই স্পিনের সমস্ত পে-লাইন জয়ে কার্যকর হয়!'
                : 'The 4th reel on the right exclusively spins multipliers: 1X, 2X, 3X, 5X, 10X, 15X, 20X, and the Garuda Wheel Bonus. The multiplier locked in the center frame boosts all line wins!'}
            </p>
          </div>

          {/* Section 3: Extra Bet (+50%) */}
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🔥</span>
              <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider">
                {language === 'bn' ? 'এক্সট্রা বেট মোড (+৫০% বাজি)' : 'Extra Bet Mode (+50% Bet)'}
              </h3>
            </div>
            <p className="leading-relaxed">
              {language === 'bn'
                ? 'এক্সট্রা বেট অন করলে ৪র্থ রিল থেকে ১x সম্পূর্ণ অপসারিত হয়! শুধুমাত্র ২x থেকে ২০x গুণক এবং বোনাস হুইল সক্রিয় থাকে, এবং স্প্লিট সিম্বল আসার সম্ভাবনা অনেক বৃদ্ধি পায়।'
                : 'Activating Extra Bet (+50% bet) completely removes the 1X multiplier from the 4th reel! Only 2X to 20X multipliers and the Bonus Wheel remain, plus split symbol frequency is greatly enhanced.'}
            </p>
          </div>

          {/* Section 4: Paytable Symbols */}
          <div>
            <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider mb-2">
              {language === 'bn' ? 'সিম্বল পে-টেবিল (৩টি মিলে)' : 'Symbol Paytable (3-of-a-kind)'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(FORTUNE_SYMBOLS) as (keyof typeof FORTUNE_SYMBOLS)[]).map(key => {
                const sym = FORTUNE_SYMBOLS[key];
                return (
                  <div
                    key={key}
                    className="p-2 rounded-xl bg-black/50 border border-amber-900/40 flex flex-col items-center text-center gap-1.5"
                  >
                    <div className="w-12 h-12">
                      <FortuneSymbolView symbol={sym.id} size="sm" />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-200 text-xs block truncate max-w-[100px]">
                        {language === 'bn' ? sym.nameBn : sym.name}
                      </span>
                      <span className="text-amber-400 font-black text-xs">
                        {sym.payout3}X Bet
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: 5 Fixed Paylines */}
          <div>
            <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider mb-2">
              {language === 'bn' ? '৫টি নির্দিষ্ট পে-লাইন' : '5 Fixed Paylines'}
            </h3>
            <div className="grid grid-cols-5 gap-2 text-center">
              {FORTUNE_PAYLINES.map(line => (
                <div
                  key={line.id}
                  className="p-2 rounded-lg bg-black/40 border border-yellow-500/30 flex flex-col items-center"
                >
                  <span className="w-5 h-5 rounded-full bg-yellow-500 text-black font-black text-xs flex items-center justify-center mb-1">
                    {line.id}
                  </span>
                  <span className="text-[10px] text-zinc-300 truncate max-w-[65px]">
                    {language === 'bn' ? line.nameBn : line.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-amber-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs uppercase cursor-pointer hover:from-amber-400 hover:to-yellow-300"
          >
            {language === 'bn' ? 'বুঝেছি' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
