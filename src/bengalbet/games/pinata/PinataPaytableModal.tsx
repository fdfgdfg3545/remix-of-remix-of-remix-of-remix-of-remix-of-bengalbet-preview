// @ts-nocheck
import React from 'react';
import { X, Trophy, Star, Sparkles, PartyPopper } from 'lucide-react';
import { PINATA_SYMBOLS_META, PinataSymbolType } from './pinataTypes';

interface PinataPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const PinataPaytableModal: React.FC<PinataPaytableModalProps> = ({
  language,
  onClose
}) => {
  const highSymbols: PinataSymbolType[] = ['donkey', 'skull', 'maracas', 'taco', 'guitar'];
  const lowSymbols: PinataSymbolType[] = ['a', 'k', 'q', 'j'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-pink-500/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-950 via-purple-900 to-slate-900 border-b border-pink-500/30">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-black text-pink-300">
              {language === 'bn' ? 'পিনাটা উইনস - নিয়ম ও পে-টেবিল' : 'Piñata Wins - Rules & Paytable'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm text-slate-200">
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-pink-950/40 border border-pink-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                <Star className="w-4 h-4" />
                <span>{language === 'bn' ? 'পিনাটা মাল্টিপ্লায়ার' : 'Piñata Multipliers'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'স্টার পিনাটায় ২x থেকে ১০০x পর্যন্ত গুণক প্রদর্শিত হয়। মোট জয়ে সমস্ত গুণক যোগ হয়ে বহুগুণে বৃদ্ধি পায়।'
                  : 'Star symbols contain 2X to 100X multipliers! All multipliers on winning spins combine to boost payouts.'}
              </p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'bn' ? 'সোনার ফ্রেম ও ওয়াইল্ড' : 'Gold Frames to Wild'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'রিল ২, ৩ ও ৪-এ সোনার ফ্রেমযুক্ত প্রতীক জয়লাভ করলে পরবর্তী ড্রপে ওয়াইল্ডে রূপান্তরিত হয়।'
                  : 'Gold-framed symbols in reels 2-4 transform into Wilds when participating in a winning line!'}
              </p>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <Trophy className="w-4 h-4" />
                <span>{language === 'bn' ? '১৫ ফ্রি স্পিন' : '15 Free Spins'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? '৩ বা ততোধিক স্টার পিনাটা স্ক্যাটার ১৫টি ফ্রি স্পিন দেয় যেখানে গুণক রিসেট হয় না।'
                  : '3+ Scatters unlock 15 Free Spins where collected multipliers remain sticky across all spins!'}
              </p>
            </div>
          </div>

          {/* High Payout Symbols */}
          <div>
            <h4 className="font-bold text-pink-300 mb-3 flex items-center gap-1.5">
              <span>{language === 'bn' ? 'উচ্চ মানের প্রতীক' : 'High Paying Symbols'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {highSymbols.map(type => {
                const meta = PINATA_SYMBOLS_META[type];
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white text-sm">
                        {language === 'bn' ? meta.nameBn : meta.nameEn}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
                      <span>5: <b className="text-amber-300">{meta.payouts[5]}x</b></span>
                      <span>4: <b className="text-slate-300">{meta.payouts[4]}x</b></span>
                      <span>3: <b className="text-slate-400">{meta.payouts[3]}x</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Payout Symbols */}
          <div>
            <h4 className="font-bold text-slate-300 mb-3">
              {language === 'bn' ? 'নিম্ন মানের প্রতীক' : 'Low Paying Symbols'}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {lowSymbols.map(type => {
                const meta = PINATA_SYMBOLS_META[type];
                return (
                  <div
                    key={type}
                    className="p-2 bg-slate-800/40 rounded-xl border border-slate-700/40 text-center"
                  >
                    <span className="font-black text-lg text-slate-200">
                      {type.toUpperCase()}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 space-y-0.5 font-mono">
                      <div>5: {meta.payouts[5]}x</div>
                      <div>4: {meta.payouts[4]}x</div>
                      <div>3: {meta.payouts[3]}x</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
