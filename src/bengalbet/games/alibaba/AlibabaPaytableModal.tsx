// @ts-nocheck
import React from 'react';
import { X, Sparkles, Trophy, HelpCircle, Shield, Flame, Key } from 'lucide-react';
import { ALIBABA_SYMBOLS, AlibabaSymbolType } from './alibabaTypes';

interface AlibabaPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const AlibabaPaytableModal: React.FC<AlibabaPaytableModalProps> = ({
  language,
  onClose
}) => {
  const regularSymbols: AlibabaSymbolType[] = [
    'alibaba',
    'morgiana',
    'treasure_chest',
    'magic_carpet',
    'scimitar',
    'ace',
    'king',
    'queen',
    'jack',
    'ten'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1c1236] to-[#0d071d] border-2 border-amber-400 rounded-2xl p-6 text-white shadow-2xl sidebar-scroll">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-amber-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500">
            {language === 'bn' ? "আলিবাবা'স কেভ অফ ফরচুন - পে-টেবিল ও নিয়ম" : "Alibaba's Cave of Fortune - Paytable & Rules"}
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === 'bn' ? '১০২৪ ওয়েজ • ক্যাসকেডিং জয় • ওপেন সিসিম ফ্রি স্পিন' : '1024 Ways • Cascading Wins • Open Sesame Free Spins'}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-yellow-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🪔</span>
            </div>
            <h4 className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'ম্যাজিক ল্যাম্প ওয়াইল্ড' : 'Genie Lamp Wild'}
            </h4>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {language === 'bn'
                ? 'স্কেটার ও বোনাস ছাড়া সমস্ত চিহ্নের বিকল্প হিসেবে কাজ করে।'
                : 'Substitutes for all symbols except Scatter and Bonus urns.'}
            </p>
          </div>

          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-red-500/20 text-yellow-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🚪</span>
            </div>
            <h4 className="font-bold text-sm text-yellow-300">
              {language === 'bn' ? 'ওপেন সিসিম স্কেটার' : 'Open Sesame Free Spins'}
            </h4>
            <p className="text-[11px] text-amber-200/80 mt-1">
              {language === 'bn'
                ? '৩ বা ততোধিক স্কেটার ১০টি ফ্রি স্পিন সক্রিয় করে ৩X প্রারম্ভিক মাল্টিপ্লায়ার সহ!'
                : '3+ Scatters trigger 10 Free Spins with a starting 3X multiplier up to 30X!'}
            </p>
          </div>

          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-300 mx-auto flex items-center justify-center mb-2">
              <span className="text-2xl">🏺</span>
            </div>
            <h4 className="font-bold text-sm text-purple-300">
              {language === 'bn' ? 'গুহার গুপ্তধন বোনাস' : 'Cave Urn Bonus'}
            </h4>
            <p className="text-[11px] text-purple-200/80 mt-1">
              {language === 'bn'
                ? '৩টি ম্যাজিক কলস থেকে বেছে নিয়ে সর্বোচ্চ ৫০০X পর্যন্ত নগদ পুরস্কার জিতুন।'
                : 'Pick from enchanted urns in the 40 Thieves cave for up to 500X prizes!'}
            </p>
          </div>
        </div>

        {/* Multiplier Ladder Explanation */}
        <div className="bg-gradient-to-r from-amber-900/40 via-yellow-900/30 to-amber-900/40 border border-amber-400/40 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-bold text-yellow-300 mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {language === 'bn' ? 'ক্যাসকেডিং প্রগতিশীল মাল্টিপ্লায়ার' : 'Cascading Progressive Multipliers'}
          </h4>
          <p className="text-xs text-amber-100/80 mb-2">
            {language === 'bn'
              ? 'প্রতিটি ধারাবাহিক ক্যাসকেডিং জয় মাল্টিপ্লায়ার বাড়িয়ে দেয়:'
              : 'Each consecutive win cascade advances the cave multiplier:'}
          </p>
          <div className="flex items-center justify-between text-xs font-bold text-center gap-2">
            <div className="flex-1 bg-amber-950/60 p-2 rounded border border-amber-500/30">
              <span className="text-amber-300 text-base block">1X</span>
              <span className="text-[10px] text-amber-200/60">{language === 'bn' ? '১ম জয়' : '1st Win'}</span>
            </div>
            <span className="text-amber-400">➔</span>
            <div className="flex-1 bg-amber-950/60 p-2 rounded border border-amber-500/30">
              <span className="text-amber-300 text-base block">2X</span>
              <span className="text-[10px] text-amber-200/60">{language === 'bn' ? '২য় জয়' : '2nd Win'}</span>
            </div>
            <span className="text-amber-400">➔</span>
            <div className="flex-1 bg-amber-950/60 p-2 rounded border border-amber-500/30">
              <span className="text-amber-300 text-base block">3X</span>
              <span className="text-[10px] text-amber-200/60">{language === 'bn' ? '৩য় জয়' : '3rd Win'}</span>
            </div>
            <span className="text-amber-400">➔</span>
            <div className="flex-1 bg-amber-950/60 p-2 rounded border border-amber-500/30">
              <span className="text-amber-300 text-base block">5X</span>
              <span className="text-[10px] text-amber-200/60">{language === 'bn' ? '৪র্থ জয়' : '4th Win'}</span>
            </div>
            <span className="text-amber-400">➔</span>
            <div className="flex-1 bg-yellow-500/20 p-2 rounded border border-yellow-400">
              <span className="text-yellow-300 text-base font-black block">10X</span>
              <span className="text-[10px] text-yellow-200">{language === 'bn' ? '৫ম+ জয়' : '5th+ Win'}</span>
            </div>
          </div>
          <p className="text-[11px] text-yellow-300/80 mt-2 font-semibold">
            {language === 'bn'
              ? 'ফ্রি স্পিনে মাল্টিপ্লায়ার ৩X, ৬X, ৯X, ১৫X থেকে ৩০X পর্যন্ত পৌঁছে!'
              : 'During Free Spins, multipliers boost to 3X, 6X, 9X, 15X, up to 30X!'}
          </p>
        </div>

        {/* Symbol Payouts Table */}
        <h4 className="text-sm font-bold text-yellow-300 mb-3">
          {language === 'bn' ? 'চিহ্নের পে-আউট (১০২৪ ওয়েজ)' : 'Symbol Payouts (1024 Ways)'}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {regularSymbols.map(symKey => {
            const config = ALIBABA_SYMBOLS[symKey];
            return (
              <div
                key={symKey}
                className="bg-black/40 border border-amber-500/20 rounded-lg p-2 flex flex-col items-center text-center"
              >
                <span className="text-xl mb-1">
                  {symKey === 'alibaba' ? '👳‍♂️' :
                   symKey === 'morgiana' ? '🧕' :
                   symKey === 'treasure_chest' ? '💎' :
                   symKey === 'magic_carpet' ? '🧞' :
                   symKey === 'scimitar' ? '🗡️' : config.nameEn}
                </span>
                <span className="text-xs font-bold text-amber-200">{config.nameEn}</span>
                <div className="text-[10px] text-amber-100/70 mt-1 space-y-0.5">
                  <div>5: <span className="text-yellow-300 font-bold">{config.basePayouts[5]}x</span></div>
                  <div>4: <span className="text-yellow-300 font-bold">{config.basePayouts[4]}x</span></div>
                  <div>3: <span className="text-yellow-300 font-bold">{config.basePayouts[3]}x</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
