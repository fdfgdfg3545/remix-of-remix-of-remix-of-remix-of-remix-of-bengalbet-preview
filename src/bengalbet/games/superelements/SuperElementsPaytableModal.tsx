// @ts-nocheck
import React from 'react';
import { X, Sparkles, Zap, Flame, Crown, Atom, Radio } from 'lucide-react';
import { ELEMENT_SYMBOLS } from './superElementsTypes';

interface SuperElementsPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const SuperElementsPaytableModal: React.FC<SuperElementsPaytableModalProps> = ({
  language,
  onClose
}) => {
  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] max-h-[90vh] overflow-y-auto text-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Atom className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 tracking-wide">
              {isBn ? 'সুপার এলিমেন্টস ২ - গেমের নিয়মাবলী ও পে-টেবিল' : 'Super Elements 2 - Paytable & Rules'}
            </h2>
            <p className="text-xs text-cyan-400 font-mono">
              FA CHAI Gaming (FC) • 6 Reels × 5 Rows • 3,600 Ways
            </p>
          </div>
        </div>

        {/* Feature 1: Multiplier Ladder */}
        <div className="mb-6 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
          <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            {isBn ? 'ক্যাসকেডিং মাল্টিপ্লায়ার (Win Up to 10X / 20X)' : 'Cascading Elimination Multipliers (Up to 10X / 20X)'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            {isBn
              ? 'প্রতিটি ধারাবাহিক জয়ে প্রতীকগুলো বিস্ফোরিত হয়ে ওপর থেকে নতুন প্রতীক পড়ে। প্রতিটি ধাপে মাল্টিপ্লায়ার বৃদ্ধি পায়:'
              : 'Every winning cascade eliminates matched symbols and drops new ones. Each consecutive cascade increases your payout multiplier:'}
          </p>
          <div className="grid grid-cols-5 gap-2 text-center font-mono">
            <div className="p-2 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs">
              <div className="text-[10px] text-slate-400">Step 1</div>
              <div className="font-bold text-cyan-400">1X</div>
            </div>
            <div className="p-2 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs">
              <div className="text-[10px] text-slate-400">Step 2</div>
              <div className="font-bold text-teal-400">2X</div>
            </div>
            <div className="p-2 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs">
              <div className="text-[10px] text-slate-400">Step 3</div>
              <div className="font-bold text-amber-400">3X</div>
            </div>
            <div className="p-2 rounded bg-slate-900/90 border border-slate-700 text-slate-300 text-xs">
              <div className="text-[10px] text-slate-400">Step 4</div>
              <div className="font-bold text-orange-400">5X</div>
            </div>
            <div className="p-2 rounded bg-amber-950/50 border border-amber-400/60 text-amber-300 text-xs shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <div className="text-[10px] text-amber-300">Max Base</div>
              <div className="font-bold text-amber-300">10X</div>
            </div>
          </div>
        </div>

        {/* Feature 2: Golden Symbols to Wild */}
        <div className="mb-6 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {isBn ? 'গোল্ডেন প্রতীক ওয়াইল্ড রূপান্তর (Golden Symbols to Wild)' : 'Golden Symbols Turn to WILD'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isBn
              ? 'রিল ২, ৩, ৪ ও ৫ এ গোল্ডেন বর্ডারযুক্ত প্রতীক আসতে পারে। যখন একটি গোল্ডেন প্রতীক কোনো জয়ে যুক্ত থাকে, তখন এটি অপসারিত হওয়ার বদলে তাৎক্ষণিকভাবে একটি WILD প্রতীকে রূপান্তরিত হয়ে পরবর্তী ক্যাসকেড কন্টিনিউ করে!'
              : 'Golden-framed symbols can appear on reels 2, 3, 4, and 5. When a Golden symbol forms a winning combo, instead of being removed, it transforms into a persistent WILD symbol for subsequent cascades!'}
          </p>
        </div>

        {/* Feature 3: Free Spins */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
          <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            {isBn ? 'ফ্রি গেম রাউন্ড (Free Spins Reactor)' : 'Free Spins Bonus Round'}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {isBn
              ? 'যেকোনো জায়গায় ৩ বা ততোধিক বোনাস রিঅ্যাক্টর (Scatter) প্রতীক আসলে ১০টি ফ্রি স্পিন সক্রিয় হয়। ফ্রি গেমে প্রতিটি মাল্টিপ্লায়ার দ্বিগুণ হয়ে শুরু হয় (২X, ৪X, ৬X, ১০X, ২০X পর্যন্ত) এবং গোল্ডেন সিম্বলের পরিমাণ বহুগুণ বেড়ে যায়!'
              : 'Landing 3 or more Scatter Reactors anywhere triggers 10 Free Spins (+2 spins for each extra scatter). During Free Spins, the starting multiplier is boosted (2X, 4X, 6X, 10X, up to 20X) with significantly more Golden symbols!'}
          </p>
        </div>

        {/* Symbol Payouts */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 mb-3">
            {isBn ? 'প্রতীকের পে-আউট রেট (Ways Multipliers)' : 'Symbol Payouts (Ways Multipliers)'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {Object.entries(ELEMENT_SYMBOLS).map(([key, sym]) => {
              if (key === 'wild' || key === 'scatter') return null;
              return (
                <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
                  <div className="font-bold flex items-center justify-between" style={{ color: sym.color }}>
                    <span>{isBn ? sym.nameBn : sym.nameEn}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5 mt-1">
                    <div>6 Matches: <span className="text-slate-200 font-bold">{sym.basePayouts[6]}x</span></div>
                    <div>5 Matches: <span className="text-slate-200 font-bold">{sym.basePayouts[5]}x</span></div>
                    <div>4 Matches: <span className="text-slate-200 font-bold">{sym.basePayouts[4]}x</span></div>
                    <div>3 Matches: <span className="text-slate-200 font-bold">{sym.basePayouts[3]}x</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isBn ? 'সর্বোচ্চ সম্ভাব্য জয়: ১০,০০০ গুণ বেট • RTP: ৯৬.৫০%' : 'Maximum Win Potential: 10,000X Bet • RTP: 96.50%'}
        </div>
      </div>
    </div>
  );
};
