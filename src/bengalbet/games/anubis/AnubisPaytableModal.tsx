// @ts-nocheck
import React from 'react';
import { X, Trophy, Flame, Sparkles } from 'lucide-react';
import { ANUBIS_SYMBOLS_META, AnubisSymbolType } from './anubisTypes';

interface AnubisPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const AnubisPaytableModal: React.FC<AnubisPaytableModalProps> = ({
  language,
  onClose
}) => {
  const highSymbols: AnubisSymbolType[] = ['anubis', 'scarab', 'eye', 'ankh', 'bastet'];
  const lowSymbols: AnubisSymbolType[] = ['a', 'k', 'q', 'j'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-black text-cyan-300">
              {language === 'bn' ? 'আনুবিস এর ক্রোধ - নিয়ম ও পে-টেবিল' : 'Anubis Wrath - Rules & Paytable'}
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
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <Flame className="w-4 h-4" />
                <span>{language === 'bn' ? 'আনুবিস ক্রোধ গুণক' : 'Wrath Multipliers'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'প্রতিটি ক্রমান্বয়ে জয়ের সাথে গুণক ১x থেকে ২x, ৩x, ৫x, ১০x পর্যন্ত বৃদ্ধি পায়।'
                  : 'Multipliers escalate on every cascade up to 10X (and uncapped in Free Spins)!'}
              </p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{language === 'bn' ? 'ওয়াইল্ড ফারাও' : 'Wild Transformations'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? 'ওয়াইল্ড চিহ্ন স্ক্যাটার ছাড়া সব চিহ্নের বিকল্প হিসেবে কাজ করে।'
                  : 'Wild symbol substitutes for all regular symbols to form maximum win ways.'}
              </p>
            </div>

            <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                <Trophy className="w-4 h-4" />
                <span>{language === 'bn' ? '১২ ফ্রি স্পিন' : '12 Free Spins'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {language === 'bn'
                  ? '৩ বা ততোধিক পিরামিড স্ক্যাটার ১২টি ফ্রি স্পিন সক্রিয় করে যেখানে গুণক রিসেট হয় না।'
                  : '3+ Scatters award 12 Free Spins where accumulated multipliers persist across spins.'}
              </p>
            </div>
          </div>

          {/* High Payout Symbols */}
          <div>
            <h4 className="font-bold text-cyan-300 mb-3 flex items-center gap-1.5">
              <span>{language === 'bn' ? 'উচ্চ মানের প্রতীক' : 'High Paying Symbols'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {highSymbols.map(type => {
                const meta = ANUBIS_SYMBOLS_META[type];
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
                const meta = ANUBIS_SYMBOLS_META[type];
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
