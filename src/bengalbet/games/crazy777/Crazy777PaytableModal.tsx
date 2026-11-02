// @ts-nocheck
import React from 'react';
import { X, Sparkles, Zap, RotateCcw } from 'lucide-react';

interface Crazy777PaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const Crazy777PaytableModal: React.FC<Crazy777PaytableModalProps> = ({
  language,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#350711] via-[#1a0208] to-[#0d0104] border-2 border-yellow-400 rounded-2xl p-6 text-white shadow-2xl sidebar-scroll">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-yellow-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            {language === 'bn' ? 'ক্রেজি ৭৭৭ - পে-টেবিল ও গেমের নিয়ম' : 'Crazy 777 - Paytable & Rules'}
          </h2>
          <p className="text-xs text-amber-200/70 mt-1">
            {language === 'bn'
              ? '৩টি মূল রিল + ১ম স্পেশাল ৪র্থ রিল • ১০X মাল্টিপ্লায়ার • ৫০X বোনাস ক্যাশ • ৫টি রিস্পিন'
              : '3 Classic Reels + 4th Special Bonus Reel • 10X Multipliers • 50X Bonus Cash • 5 Respins'}
          </p>
        </div>

        {/* 4th Special Reel Feature Highlight */}
        <div className="bg-gradient-to-r from-red-950 via-amber-950/80 to-red-950 border border-yellow-400/50 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <h4 className="text-base font-black text-yellow-300 uppercase tracking-wider">
              {language === 'bn' ? '৪র্থ স্পেশাল রিল মেকানিজম' : '4th Special Bonus Reel'}
            </h4>
          </div>
          <p className="text-xs text-amber-100/80 leading-relaxed mb-3">
            {language === 'bn'
              ? 'বামপাশের ৩টি রিলে পে-লাইনে জয় হলে ৪র্থ স্পেশাল রিল সরাসরি পুরস্কারকে বুস্ট করে!'
              : 'When any win lands on the center payline across reels 1 to 3, the 4th Special Reel immediately boosts the prize!'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-black/50 border border-yellow-500/30 p-2 rounded-lg">
              <span className="font-black text-yellow-400 block text-sm">2X, 5X, 10X</span>
              <span className="text-[11px] text-amber-200/70">
                {language === 'bn' ? 'মোট পে-আউট গুন হয়' : 'Multiplies Total Win'}
              </span>
            </div>
            <div className="bg-black/50 border border-emerald-500/30 p-2 rounded-lg">
              <span className="font-black text-emerald-400 block text-sm">+5X, +20X, +50X</span>
              <span className="text-[11px] text-emerald-200/70">
                {language === 'bn' ? 'অতিরিক্ত নগদ বোনাস' : 'Instant Cash Bonus'}
              </span>
            </div>
            <div className="bg-black/50 border border-cyan-500/30 p-2 rounded-lg">
              <span className="font-black text-cyan-400 block text-sm">1, 2, 5 Respins</span>
              <span className="text-[11px] text-cyan-200/70">
                {language === 'bn' ? 'বিনামূল্যে অতিরিক্ত স্পিন' : 'Extra Respin Rounds'}
              </span>
            </div>
          </div>
        </div>

        {/* Payout Table */}
        <h4 className="text-sm font-bold text-yellow-300 mb-3 uppercase tracking-wider">
          {language === 'bn' ? 'পে-আউট হার (মূল বাজি গুনিতক)' : 'Base Reel Payouts (Bet Multiplier)'}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-yellow-300">Triple 777 (Red)</span>
            <span className="text-base font-black text-yellow-400">100X</span>
          </div>
          <div className="bg-black/40 border border-orange-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-orange-300">Double 77 (Orange)</span>
            <span className="text-base font-black text-orange-400">40X</span>
          </div>
          <div className="bg-black/40 border border-blue-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-blue-300">Single 7 (Blue)</span>
            <span className="text-base font-black text-blue-400">20X</span>
          </div>
          <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-yellow-200">Golden Bells 🔔</span>
            <span className="text-base font-black text-yellow-400">15X</span>
          </div>
          <div className="bg-black/40 border border-amber-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-amber-200">Any 3 Mixed 7s</span>
            <span className="text-base font-black text-amber-400">10X</span>
          </div>
          <div className="bg-black/40 border border-red-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-red-300">Triple BAR</span>
            <span className="text-base font-black text-red-400">8X</span>
          </div>
          <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-cyan-300">Double BAR</span>
            <span className="text-base font-black text-cyan-400">5X</span>
          </div>
          <div className="bg-black/40 border border-emerald-500/20 rounded-lg p-2.5 flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-300">Single BAR</span>
            <span className="text-base font-black text-emerald-400">2X</span>
          </div>
          <div className="bg-black/40 border border-slate-500/20 rounded-lg p-2.5 flex items-center justify-between sm:col-span-2">
            <span className="text-sm font-bold text-slate-300">Any 3 Mixed BARs</span>
            <span className="text-base font-black text-slate-200">1X</span>
          </div>
        </div>
      </div>
    </div>
  );
};
