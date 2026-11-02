// @ts-nocheck
import React, { useState } from 'react';
import { X, Download, Gift } from 'lucide-react';
import { Language } from '../types';

interface MobileTopDownloadBarProps {
  language: Language;
  onDownloadApp: () => void;
}

export const MobileTopDownloadBar: React.FC<MobileTopDownloadBarProps> = ({
  language,
  onDownloadApp
}) => {
  // Always shown on page load - not limited or blocked by sessionStorage
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  if (isDismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
  };

  return (
    <div 
      id="top-app-download-bar"
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#11331f] via-[#1a4b2a] to-[#11331f] border-b border-[#25633a] shadow-xs px-2 sm:px-4 py-1 select-none transition-all duration-200"
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Golden Treasure Chest Graphic & Text */}
        <div 
          onClick={onDownloadApp}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer flex-1 min-w-0"
        >
          <div className="relative shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
            {/* Treasure chest emoji */}
            <span className="text-base sm:text-lg filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] animate-bounce">
              🎁
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 text-[9px] sm:text-[10px]">💰</span>
          </div>

          {/* Text: Compact typography with reduced height and low gap */}
          <div className="flex items-center gap-1 sm:gap-2 truncate leading-tight">
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight drop-shadow font-bengali whitespace-nowrap">
              {language === 'bn' ? 'ডাউনলোড বোনাস' : 'Download Bonus'}
            </span>
            <span className="text-[11px] sm:text-xs font-black text-yellow-300 font-bengali drop-shadow bg-[#082819] px-1.5 py-0.2 rounded border border-yellow-400/40 whitespace-nowrap">
              {language === 'bn' ? 'সর্বোচ্চ ৳৫২' : 'Up to ৳52'}
            </span>
            <span className="hidden md:inline-block text-[11px] text-emerald-200/90 font-medium truncate">
              {language === 'bn' 
                ? '| BengalBet অফিসিয়াল মোবাইল অ্যাপ ইন্সটল করে উপভোগ করুন আল্ট্রা-ফাস্ট গেমিং' 
                : '| Install official BengalBet Mobile App for ultra-fast gameplay'}
            </span>
          </div>
        </div>

        {/* Right: Gold Download Button & Circular Close Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            id="top-download-btn"
            onClick={onDownloadApp}
            className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 text-black font-black text-[11px] sm:text-xs shadow-xs border border-yellow-200/80 active:scale-95 transition-transform cursor-pointer flex items-center gap-1"
          >
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{language === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
          </button>

          {/* Circular Grey Close Button */}
          <button
            id="top-download-close-btn"
            onClick={handleDismiss}
            className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-gray-600/80 hover:bg-gray-500 text-white flex items-center justify-center text-xs shadow-xs cursor-pointer transition-colors"
            aria-label="Close download bar"
            title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
