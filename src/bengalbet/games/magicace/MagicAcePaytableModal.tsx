// @ts-nocheck
import React from 'react';
import { X, HelpCircle, Lock, Sparkles, Zap, Trophy } from 'lucide-react';
import { Language } from '../../types';

interface PaytableProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const MagicAcePaytableModal: React.FC<PaytableProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1b082e] via-[#10031c] to-[#08010d] border-2 border-purple-500/80 rounded-2xl p-4 sm:p-5 text-gray-200 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/30">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-purple-400" />
            <h3 className="font-game text-xl font-bold text-purple-300 tracking-wider">
              {language === 'bn' ? 'ম্যাজিক এস নিয়মাবলী ও পেটেবিল' : 'Magic Ace Rules & Paytable'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-purple-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Wild Lock Feature */}
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
            <h4 className="font-bold text-purple-300 mb-1 flex items-center gap-1.5 text-sm">
              <Lock className="w-4 h-4 text-yellow-300" />
              {language === 'bn' ? '১. ম্যাজিক এস ওয়াইল্ড লক (Wild Lock)' : '1. Magic Ace Wild Lock Feature'}
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {language === 'bn'
                ? 'ওয়াইল্ড লক রিলগুলোতে তালাবদ্ধ হয়ে থাকে এবং পরপর ক্যাসকেডিং ড্রপে স্থায়ী থেকে টানা একাধিক বিজয় নিশ্চিত করে!'
                : 'Wild Lock locks onto the reels with a padlock and remains sticky across cascading drops to guarantee multiple successive wins!'}
            </p>
          </div>

          {/* Golden Cards Transformation */}
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
            <h4 className="font-bold text-yellow-300 mb-1 flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {language === 'bn' ? '২. গোল্ডেন কার্ড রূপান্তর (Golden Cards)' : '2. Golden Card Transformation'}
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {language === 'bn'
                ? '২, ৩ এবং ৪ নম্বর রিলের সোনালী কার্ডগুলো বিজয়ী হলে বিস্ফোরণের পর সরাসরি ওয়াইল্ড বা ওয়াইল্ড লকে রূপান্তরিত হয়!'
                : 'Golden cards on reels 2, 3, and 4 that participate in a win explode and transform directly into Wilds or Wild Locks!'}
            </p>
          </div>

          {/* Elimination Multipliers */}
          <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
            <h4 className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5 text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              {language === 'bn' ? '৩. ক্যাসকেডিং এলিমিনেশন মাল্টিপ্লায়ার' : '3. Cascading Elimination Multipliers'}
            </h4>
            <div className="space-y-1.5 mt-2">
              <div className="flex justify-between bg-black/40 p-2 rounded-lg">
                <span>{language === 'bn' ? 'স্বাভাবিক খেলা (Base Game)' : 'Base Game'}:</span>
                <span className="font-black text-yellow-400">1X ➔ 2X ➔ 3X ➔ 5X</span>
              </div>
              <div className="flex justify-between bg-black/40 p-2 rounded-lg">
                <span>{language === 'bn' ? 'ফ্রি স্পিন (Free Spins)' : 'Free Spins'}:</span>
                <span className="font-black text-pink-400">2X ➔ 4X ➔ 6X ➔ 10X</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-game text-lg tracking-wider hover:brightness-110 active:scale-95"
        >
          {language === 'bn' ? 'ঠিক আছে' : 'GOT IT'}
        </button>
      </div>
    </div>
  );
};
