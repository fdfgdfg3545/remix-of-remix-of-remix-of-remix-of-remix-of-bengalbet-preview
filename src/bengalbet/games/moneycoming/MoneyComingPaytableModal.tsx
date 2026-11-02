// @ts-nocheck
import React from 'react';
import { X, HelpCircle, Sparkles, Trophy, Disc, RotateCcw } from 'lucide-react';
import { Language } from '../../types';

interface PaytableProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const MoneyComingPaytableModal: React.FC<PaytableProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#241300] via-[#140b00] to-[#0a0500] border-2 border-yellow-400/80 rounded-2xl p-4 sm:p-5 text-gray-200 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-yellow-500/30">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            <h3 className="font-game text-xl font-bold text-yellow-400 tracking-wider">
              {language === 'bn' ? 'মানি কামিং নিয়মাবলী ও পেটেবিল' : 'Money Coming Paytable & Rules'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-yellow-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div className="bg-yellow-950/40 p-3 rounded-xl border border-yellow-500/30">
            <h4 className="font-bold text-yellow-300 mb-1 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {language === 'bn' ? '১. নম্বর গঠন পে-মেকানিক্স' : '1. Number Formation Mechanics'}
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {language === 'bn'
                ? '১ম, ২য় এবং ৩য় রিলের মাঝখানের পেলাইনে যে নম্বরগুলো পাশাপাশি বসে, তাই সরাসরি বিজয়ী ক্যাশ নির্ধারণ করে! যেমন: ১০ + ০ + ০ = ১,০০০X, ৫ + ০ = ৫০X।'
                : 'Numbers appearing horizontally across the middle payline form the direct winning amount! For example: 10 + 0 + 0 = 1,000X, 5 + 0 = 50X.'}
            </p>
          </div>

          <div className="bg-yellow-950/40 p-3 rounded-xl border border-yellow-500/30">
            <h4 className="font-bold text-yellow-300 mb-1 flex items-center gap-1.5 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              {language === 'bn' ? '২. ৪র্থ স্পেশাল রিল ফিচার' : '2. 4th Special Reel Feature'}
            </h4>
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                <span className="font-bold text-yellow-300">2X / 5X / 10X</span>
                <span className="text-gray-300">
                  {language === 'bn' ? 'বিজয়ী ক্যাশের উপর সরাসরি গুণক!' : 'Direct multiplier applied to payline cash!'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" /> RESPIN
                </span>
                <span className="text-gray-300">
                  {language === 'bn' ? 'নিশ্চিত উইন সহ ফ্রি রিস্পিন প্রদান করে।' : 'Awards free respin with high win rate.'}
                </span>
              </div>
              <div className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                <span className="font-bold text-orange-400 flex items-center gap-1">
                  <Disc className="w-4 h-4" /> WHEEL BONUS
                </span>
                <span className="text-gray-300">
                  {language === 'bn' ? '১০,০০০X পর্যন্ত সুপার লাকি হুইল ট্রিগার করে!' : 'Triggers Super Lucky Wheel up to 10,000X!'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold font-game text-lg tracking-wider"
        >
          {language === 'bn' ? 'ঠিক আছে' : 'GOT IT'}
        </button>
      </div>
    </div>
  );
};
