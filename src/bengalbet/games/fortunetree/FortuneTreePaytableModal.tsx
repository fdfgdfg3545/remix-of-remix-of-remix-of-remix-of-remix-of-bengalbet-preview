// @ts-nocheck
import React from 'react';
import { X, Sparkles, Trophy, HelpCircle } from 'lucide-react';
import { FORTUNE_TREE_SYMBOLS, FortuneTreeSymbolType, FORTUNE_TREE_PAYLINES } from './fortuneTreeTypes';

interface FortuneTreePaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const FortuneTreePaytableModal: React.FC<FortuneTreePaytableModalProps> = ({
  language,
  onClose
}) => {
  const regularSymbols: FortuneTreeSymbolType[] = [
    'golden_tree',
    'jin_chan',
    'sycee',
    'jade_carp',
    'red_lantern',
    'ace',
    'king',
    'queen',
    'jack'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#2e0912] to-[#120206] border-2 border-yellow-400 rounded-2xl p-6 text-white shadow-2xl sidebar-scroll">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-yellow-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
            {language === 'bn' ? 'ফরচুন ট্রি - পে-টেবিল ও গেমের নিয়ম' : 'Fortune Tree - Paytable & Game Rules'}
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === 'bn' ? '৩০ পে-লাইন • স্বর্ণবৃক্ষ কম্পন • লাল খাম বোনাস • ফ্রি গেম' : '30 Paylines • Golden Tree Shake • Red Envelope Hongbao • Free Games'}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-950/40 border border-yellow-500/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🌳</span>
            </div>
            <h4 className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'স্বর্ণবৃক্ষ ঝাঁকুনি (Tree Shake)' : 'Tree Shake Feature'}
            </h4>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {language === 'bn'
                ? 'যেকোনো স্পিনে গাছটি কেঁপে উঠে রিলে ২ থেকে ৪টি ওয়াইল্ড অথবা ২X/৩X মাল্টিপ্লায়ার ওয়াইল্ড ফেলে দেয়!'
                : 'On any spin, the Golden Tree shakes and showers 2 to 4 Wilds or 2X/3X Multiplier Wilds onto the reels!'}
            </p>
          </div>

          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-yellow-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🏺</span>
            </div>
            <h4 className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'ফরচুন পট ফ্রি স্পিন' : 'Fortune Pot Free Spins'}
            </h4>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {language === 'bn'
                ? '৩ বা ততোধিক ফরচুন পট স্কেটার ১০টি ফ্রি স্পিন সক্রিয় করে যেখানে গাছটি ৫০% বেশি সময় কাঁপে!'
                : '3+ Scatters trigger 10 Free Spins with 50% higher Tree Shake trigger rates and multiplier boosts!'}
            </p>
          </div>

          <div className="bg-red-900/40 border border-yellow-400/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-red-600/30 text-yellow-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🧧</span>
            </div>
            <h4 className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'হংবাও পিক বোনাস' : 'Hongbao Pick Bonus'}
            </h4>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {language === 'bn'
                ? '৩টি লাল খাম (Hongbao) সরাসরি পিক বোনাস ট্রিগার করে যেখানে সর্বোচ্চ ৮৮৮X পর্যন্ত পুরস্কার পাওয়া যায়।'
                : '3 Red Packets trigger the Hongbao pick round with instant multipliers up to 888X!'}
            </p>
          </div>
        </div>

        {/* 30 Paylines Information */}
        <div className="bg-gradient-to-r from-red-950/50 via-amber-950/40 to-red-950/50 border border-yellow-500/30 rounded-xl p-3.5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-yellow-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {language === 'bn' ? '৩০টি নির্ধারিত পে-লাইন' : '30 Fixed Paylines'}
            </h4>
            <span className="text-[11px] text-yellow-200/70 font-semibold">
              {language === 'bn' ? 'বাম থেকে ডান ক্রম' : 'Left to Right Paylines'}
            </span>
          </div>
          <p className="text-xs text-amber-100/75 leading-relaxed">
            {language === 'bn'
              ? 'সকল পে-লাইন বামদিকের ১ম রিল থেকে শুরু হয়ে ক্রমানুসারে মেলানো হয়। লাইন প্রতি সর্বোচ্চ জয় প্রদান করা হয়।'
              : 'All line wins pay from left to right on adjacent reels starting with the leftmost reel. Highest win paid per line.'}
          </p>
        </div>

        {/* Symbol Payouts */}
        <h4 className="text-sm font-bold text-yellow-300 mb-3">
          {language === 'bn' ? 'চিহ্নের পে-আউট তালিকা' : 'Symbol Paytable'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {regularSymbols.map(symKey => {
            const config = FORTUNE_TREE_SYMBOLS[symKey];
            return (
              <div
                key={symKey}
                className="bg-black/40 border border-yellow-500/20 rounded-lg p-2.5 flex items-center gap-3"
              >
                <span className="text-3xl">
                  {symKey === 'golden_tree' ? '🌳' :
                   symKey === 'jin_chan' ? '🐸' :
                   symKey === 'sycee' ? '🟡' :
                   symKey === 'jade_carp' ? '🐟' :
                   symKey === 'red_lantern' ? '🏮' : config.nameEn}
                </span>
                <div className="flex-1">
                  <span className="text-xs font-bold text-yellow-200 block truncate">{config.nameEn}</span>
                  <div className="text-[10px] text-amber-100/70 mt-0.5 space-x-2">
                    <span>5: <strong className="text-yellow-400">{config.basePayouts[5]}x</strong></span>
                    <span>4: <strong className="text-yellow-400">{config.basePayouts[4]}x</strong></span>
                    <span>3: <strong className="text-yellow-400">{config.basePayouts[3]}x</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
