// @ts-nocheck
import React from 'react';
import { X, Sparkles, Coins, Trophy } from 'lucide-react';
import { SEVEN_COINS_PAYOUTS } from './sevenCoinsTypes';

interface SevenCoinsPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const SevenCoinsPaytableModal: React.FC<SevenCoinsPaytableModalProps> = ({
  language,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1c1236] via-[#0f0a1f] to-[#080512] border-2 border-yellow-400 rounded-2xl p-6 text-white shadow-2xl sidebar-scroll">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-yellow-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            {language === 'bn' ? '777 কয়েন - পে-টেবিল ও নিয়ম' : '777 Coins - Paytable & Rules'}
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === 'bn'
              ? '৩x৩ রিল • ৫টি ফিক্সড পে-লাইন • ইনস্ট্যান্ট কয়েন কালেক্ট • হোল্ড অ্যান্ড উইন বোনাস'
              : '3x3 Grid • 5 Fixed Paylines • Instant Coin Collect • Hold and Win Bonus'}
          </p>
        </div>

        {/* Bonus Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="bg-black/50 border border-cyan-500/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Coins className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-black text-cyan-300 uppercase">
                {language === 'bn' ? 'কালেক্ট ফিচার (রিল ২)' : 'Collect Feature (Reel 2)'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'রিল ২-এ কালেক্ট কয়েন পড়লে তা সঙ্গে সঙ্গে রিল ১ এবং ৩-এ থাকা সব কয়েনের মূল্য সংগ্রহ করে তাৎক্ষণিক ক্যাশ প্রদান করে!'
                : 'When a Collect Coin lands on Reel 2, it instantly gathers all coin values appearing on Reels 1 and 3 for immediate cash!'}
            </p>
          </div>

          <div className="bg-black/50 border border-yellow-500/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h4 className="text-sm font-black text-yellow-300 uppercase">
                {language === 'bn' ? 'হোল্ড অ্যান্ড উইন (৩+ কয়েন)' : 'Hold & Win (3+ Coins)'}
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn'
                ? 'স্ক্রিনে ৩টি কয়েন আসলে হোল্ড অ্যান্ড উইন বোনাস শুরু হয়! ৩টি রিস্পিন থাকে, প্রতিটি নতুন কয়েন রিস্পিন ৩-এ রিসেট করে। সব ৯টি ঘরে কয়েন আসলে গ্র্যান্ড জ্যাকপট (২,০০০X) পাওয়া যায়!'
                : '3+ Coins trigger the Hold & Win Bonus! 3 Respins reset every time a coin drops. Fill all 9 positions for the Grand Jackpot (2,000X)!'}
            </p>
          </div>
        </div>

        {/* Jackpots */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-xs">
          <div className="bg-yellow-950/60 border border-yellow-500/40 p-2 rounded-lg">
            <span className="font-bold text-yellow-400 block">GRAND</span>
            <span className="font-black text-white text-sm">2,000X</span>
          </div>
          <div className="bg-red-950/60 border border-red-500/40 p-2 rounded-lg">
            <span className="font-bold text-red-400 block">MAJOR</span>
            <span className="font-black text-white text-sm">150X</span>
          </div>
          <div className="bg-blue-950/60 border border-blue-500/40 p-2 rounded-lg">
            <span className="font-bold text-blue-400 block">MINOR</span>
            <span className="font-black text-white text-sm">50X</span>
          </div>
          <div className="bg-emerald-950/60 border border-emerald-500/40 p-2 rounded-lg">
            <span className="font-bold text-emerald-400 block">MINI</span>
            <span className="font-black text-white text-sm">25X</span>
          </div>
        </div>

        {/* Symbol Paytable */}
        <h4 className="text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider">
          {language === 'bn' ? 'সিম্বল পে-আউট (৩টি মেলালে)' : 'Symbol Payouts (Match 3 on Payline)'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-black/40 border border-red-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-red-400 block">Triple 777</span>
            <span className="text-base font-black text-yellow-400">50X</span>
          </div>
          <div className="bg-black/40 border border-yellow-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-yellow-300 block">Golden Bell 🔔</span>
            <span className="text-base font-black text-yellow-400">30X</span>
          </div>
          <div className="bg-black/40 border border-amber-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-amber-300 block">Golden BAR</span>
            <span className="text-base font-black text-yellow-400">15X</span>
          </div>
          <div className="bg-black/40 border border-emerald-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-emerald-300 block">Watermelon 🍉</span>
            <span className="text-base font-black text-yellow-400">8X</span>
          </div>
          <div className="bg-black/40 border border-purple-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-purple-300 block">Grapes 🍇</span>
            <span className="text-base font-black text-yellow-400">5X</span>
          </div>
          <div className="bg-black/40 border border-indigo-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-indigo-300 block">Plum 🫐</span>
            <span className="text-base font-black text-yellow-400">3X</span>
          </div>
          <div className="bg-black/40 border border-orange-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-orange-300 block">Orange 🍊</span>
            <span className="text-base font-black text-yellow-400">2X</span>
          </div>
          <div className="bg-black/40 border border-rose-500/30 p-2.5 rounded-lg text-center">
            <span className="text-sm font-bold text-rose-300 block">Cherry 🍒</span>
            <span className="text-base font-black text-yellow-400">1X</span>
          </div>
        </div>
      </div>
    </div>
  );
};
