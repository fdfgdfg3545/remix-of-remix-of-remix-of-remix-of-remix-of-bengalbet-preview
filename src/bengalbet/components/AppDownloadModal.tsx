// @ts-nocheck
import React from 'react';
import { X, Smartphone, Download, QrCode, ShieldCheck, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';

interface AppDownloadModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onClaimAppBonus: () => Promise<string | void> | void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  language,
  onClose,
  onClaimAppBonus
}) => {
  if (!isOpen) return null;

  const handleDownload = async (platform: 'android' | 'ios') => {
    confetti({ particleCount: 60, spread: 50 });
    const result = await onClaimAppBonus();
    alert(`${language === 'bn' ? `BengalBet ${platform === 'android' ? 'Android APK' : 'iOS PWA'} ডাউনলোড শুরু হয়েছে।` : `BengalBet ${platform === 'android' ? 'Android APK' : 'iOS Web App'} download started.`}${result ? `
${result}` : ''}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div 
        id="app-download-dialog"
        className="relative w-full max-w-md bg-[#082a1d] border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0e432f] hover:bg-[#155e42] text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-yellow-300 flex items-center justify-center shadow-xl border border-yellow-400/60 mb-3">
          <Smartphone className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black mb-2 shadow">
          {language === 'bn' ? 'ফ্রি নগদ বোনাস: ৳৫২' : 'FREE INSTALL BONUS: ৳52'}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-game tracking-wider">
          BengalBet OFFICIAL MOBILE APP
        </h2>
        <p className="text-xs text-emerald-200 mt-1 max-w-xs">
          {language === 'bn' 
            ? 'হাই স্পিড লোডিং, অ্যান্টি-ব্লকিং সিস্টেম এবং ইনস্ট্যান্ট ডিপোজিট সহ মোবাইলে স্মুথ গেমিং অভিজ্ঞতা।'
            : 'Experience ultra-fast gameplay, 100% secure anti-block network and instant ৳52 reward.'}
        </p>

        {/* Download Buttons */}
        <div className="w-full space-y-2.5 my-5">
          <button
            onClick={() => handleDownload('android')}
            className="w-full btn-bdt-gold py-3 rounded-xl font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'bn' ? 'অ্যান্ড্রয়েড APK ডাউনলোড করুন (v4.2)' : 'Download Android APK (v4.2)'}</span>
          </button>

          <button
            onClick={() => handleDownload('ios')}
            className="w-full py-2.5 rounded-xl bg-[#0e432f] hover:bg-[#155e42] text-emerald-200 text-xs font-bold border border-[#1b6b4c] flex items-center justify-center gap-2 transition-colors"
          >
            <span>{language === 'bn' ? 'iOS অ্যাপ ও ওয়েব ভার্সন' : 'iOS / Safari Web App'}</span>
          </button>
        </div>

        <div className="w-full pt-3 border-t border-[#14593e] flex items-center justify-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>100% Virus Free</span>
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-yellow-400" />
            <span>Instant ৳52</span>
          </span>
        </div>
      </div>
    </div>
  );
};
