// @ts-nocheck
import React from 'react';
import { Smartphone, QrCode, Download } from 'lucide-react';
import { Language } from '../types';

interface AppDownloadSectionProps {
  language: Language;
  onOpenAppModal?: () => void;
}

export const AppDownloadSection: React.FC<AppDownloadSectionProps> = ({
  language,
  onOpenAppModal
}) => {
  return (
    <div 
      id="bengalbet-app-download-promo-section"
      className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-[#032317] via-[#083a28] to-[#04261a] border border-[#145d40] p-2.5 sm:p-4 lg:p-5 shadow-xl my-2.5 sm:my-3 select-none"
    >
      {/* Subtle Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-36 h-36 sm:w-48 sm:h-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5 lg:gap-6">
        
        {/* Left Column: Heading, Slogan, QR Codes & Compact Guide */}
        <div className="flex-1 space-y-2 sm:space-y-3 text-center md:text-left w-full">
          
          {/* Main Title & Subtitle */}
          <div>
            <h2 className="text-sm sm:text-base lg:text-lg font-black text-white tracking-wide font-bengali">
              {language === 'bn' ? 'যেকোনো সময়, যেকোনো জায়গায় গেম খেলুন' : 'Play Games Anytime, Anywhere'}
            </h2>
            <p className="text-[10px] sm:text-xs text-emerald-200/90 font-medium mt-0.5">
              {language === 'bn' 
                ? 'সবুজ মাঠে পেছনে ধাওয়া করাই মূল থিম, অনুপ্রেরণা চারদিকে ছড়িয়ে আছে BengalBet' 
                : 'Chase the dream on the green field, inspiration spreads everywhere with BengalBet'}
            </p>
          </div>

          {/* QR Code & App Download Options Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 pt-0.5">
            
            {/* Android APP Card */}
            <div 
              onClick={onOpenAppModal}
              className="bg-[#052b1d]/90 hover:bg-[#073625] border border-[#1a6e4d] hover:border-yellow-400/80 rounded-lg p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shadow-md transition-all duration-150 hover:scale-[1.02] cursor-pointer group"
            >
              {/* Android Robot Icon & Label */}
              <div className="flex flex-col items-center gap-0.5 text-center min-w-[55px] sm:min-w-[65px]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#3ddc84]/20 border border-[#3ddc84]/40 flex items-center justify-center text-[#3ddc84] group-hover:scale-105 transition-transform">
                  <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-200">Android APP</span>
              </div>

              {/* QR Code Box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white p-0.5 rounded border border-emerald-400/50 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://bengalbet.app/download/android" 
                  alt="Android APK QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* iOS Lite App Card */}
            <div 
              onClick={onOpenAppModal}
              className="bg-[#052b1d]/90 hover:bg-[#073625] border border-[#1a6e4d] hover:border-yellow-400/80 rounded-lg p-2 sm:p-2.5 flex items-center gap-2 sm:gap-2.5 shadow-md transition-all duration-150 hover:scale-[1.02] cursor-pointer group"
            >
              {/* Apple Icon & Label */}
              <div className="flex flex-col items-center gap-0.5 text-center min-w-[55px] sm:min-w-[65px]">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white/20 border border-white/40 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.87-.9.04-1.99.6-2.63 1.35-.58.67-.99 1.74-.86 2.78 1.01.08 2.05-.51 2.56-1.26z"/>
                  </svg>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-gray-200">IOS LITE-APP</span>
              </div>

              {/* QR Code Box */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white p-0.5 rounded border border-emerald-400/50 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://bengalbet.app/download/ios" 
                  alt="iOS Lite App QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

          </div>

          {/* Bengali Guide Text - Compact low gap box */}
          <div className="text-[10px] sm:text-[11px] text-emerald-200/80 bg-[#031d13]/70 border border-[#0d4f35] rounded-lg p-2 sm:p-2.5 max-w-xl space-y-0.5">
            <p className="font-bold text-yellow-300 flex items-center gap-1">
              <QrCode className="w-3 h-3 text-yellow-400 shrink-0" />
              <span>{language === 'bn' ? 'ডাউনলোড করতে QR কোডটি স্ক্যান করুন' : 'Scan QR code to download app'}</span>
            </p>
            <p className="text-[9.5px] sm:text-[10.5px] leading-snug text-gray-300">
              {language === 'bn' 
                ? 'আইওএস ব্যবহারকারীদের জন্য, অনুগ্রহ করে Safari ব্রাউজার ব্যবহার করে পৃষ্ঠাটি খুলে ডাউনলোড করুন।' 
                : 'For iOS users, please open the page using Safari browser to download.'}
            </p>
          </div>

        </div>

        {/* Right Column: Compact Mobile Phone Mockup */}
        <div className="shrink-0 relative flex items-center justify-center">
          
          {/* Subtle Glowing Aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/15 via-emerald-400/15 to-transparent rounded-full blur-xl animate-pulse" />

          {/* Phone Mockup Frame - Reduced size on both desktop and mobile */}
          <div className="relative w-32 sm:w-36 lg:w-40 aspect-[9/15] bg-gradient-to-b from-[#1c2e26] via-[#0d2119] to-black rounded-[1.5rem] sm:rounded-[1.75rem] p-1.5 shadow-xl border-2 sm:border-3 border-yellow-400/70 transform hover:scale-[1.03] transition-transform duration-200">
            
            {/* Phone Speaker Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-2 bg-black rounded-full z-20" />

            {/* Inner Screen Display */}
            <div className="w-full h-full bg-[#073625] rounded-[1.2rem] sm:rounded-[1.4rem] overflow-hidden flex flex-col relative border border-[#166245]">
              
              {/* App Screen Header */}
              <div className="bg-[#05261a] p-1.5 text-center border-b border-[#145d40] pt-3.5">
                <span className="text-[9px] sm:text-[10px] font-black text-yellow-400 tracking-wider">BengalBet PRO</span>
                <div className="text-[7.5px] sm:text-[8px] text-emerald-300">Official Mobile App</div>
              </div>

              {/* App Screen Content: Compact Mascot */}
              <div className="flex-1 p-2 flex flex-col items-center justify-between text-center relative overflow-hidden bg-gradient-to-b from-[#083c2a] via-[#05291c] to-[#02170f]">
                
                {/* Floating Coins Effect */}
                <div className="absolute top-1 left-1.5 text-yellow-300 text-xs animate-bounce">🪙</div>
                <div className="absolute top-4 right-1.5 text-yellow-400 text-[10px] animate-pulse">✨</div>

                {/* Golden Bunny Mascot Graphic */}
                <div className="my-auto relative flex flex-col items-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-yellow-300 via-amber-500 to-yellow-600 p-0.5 shadow-md flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#083625] flex flex-col items-center justify-center overflow-hidden">
                      <span className="text-xl sm:text-2xl">🐰</span>
                      <span className="text-[7px] font-black text-yellow-300">BengalBet</span>
                    </div>
                  </div>
                  <div className="mt-1 text-[8px] sm:text-[8.5px] font-bold text-yellow-300 bg-black/60 px-1.5 py-0.2 rounded-full border border-yellow-400/50">
                    ৳৫২ বোনাস
                  </div>
                </div>

                {/* Bottom Install Button inside mockup */}
                <button 
                  onClick={onOpenAppModal}
                  className="w-full py-1 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-black font-black text-[9px] sm:text-[10px] rounded-lg shadow border border-yellow-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>{language === 'bn' ? 'ইনস্টল করুন' : 'Install'}</span>
                </button>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
