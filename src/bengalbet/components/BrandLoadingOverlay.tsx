// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Language } from '../types';
import tigerFilledFace from '../assets/images/tiger_filled_face.jpg';

interface BrandLoadingOverlayProps {
  isVisible: boolean;
  language?: Language;
  customMessage?: string;
  onFinish?: () => void;
  duration?: number;
}

export const BrandLoadingOverlay: React.FC<BrandLoadingOverlayProps> = ({
  isVisible,
  language = 'bn',
  customMessage,
  onFinish,
  duration = 800
}) => {
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isVisible) {
      setProgress(15);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          if (onFinish) {
            setTimeout(onFinish, 150);
          }
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, duration / 5);

    return () => clearInterval(interval);
  }, [isVisible, duration, onFinish]);

  if (!isVisible) return null;

  const defaultMsgBn = 'বেঙ্গলবেট সুরক্ষিত গেমিং সংযোগ প্রস্তুত হচ্ছে...';
  const defaultMsgEn = 'Connecting to BengalBet Secure Gaming Servers...';

  return (
    <div 
      id="bengalbet-brand-loading-overlay"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#02140d]/95 backdrop-blur-md transition-all duration-300 animate-in fade-in"
    >
      {/* Background radial gold/emerald glow */}
      <div className="absolute w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/25 via-emerald-600/15 to-transparent blur-3xl pointer-events-none animate-pulse" />

      {/* Main Container Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md px-6 text-center">
        
        {/* Animated Casino Roulette Ring & Gold Zoomed Mascot */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-6 flex items-center justify-center">
          {/* Radar ping wave */}
          <div className="absolute inset-2 rounded-full border border-yellow-400/40 animate-ping pointer-events-none" />

          {/* Outer rotating glowing dashed ring */}
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-400/90 animate-[spin_4s_linear_infinite] filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          
          {/* Inner pulsating reverse ring */}
          <div className="absolute inset-2 rounded-full border-2 border-emerald-400/70 animate-[spin_6s_linear_infinite_reverse]" />
          
          {/* Center glowing filled tiger face mascot - Animated with Color Shadow Effect */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <div 
              className="relative w-full h-full rounded-full p-[2.5px] bg-gradient-to-tr from-[#ffe082] via-[#ff9800] to-[#d84315] shadow-[0_0_12px_rgba(255,170,0,0.28),0_0_22px_rgba(255,80,0,0.18)]"
              style={{
                animation: 'tigerFilledLoaderPulse 2.8s ease-in-out infinite'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#02130c] relative flex items-center justify-center">
                <img 
                  src={tigerFilledFace} 
                  alt="BengalBet Tiger Mascot" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none pointer-events-none"
                  style={{
                    animation: 'tigerFaceZoomBreathe 3.6s ease-in-out infinite'
                  }}
                />
                {/* Sunlight reflection shimmer */}
                <div 
                  className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-200/30 to-transparent pointer-events-none mix-blend-overlay"
                  style={{
                    animation: 'realTigerShimmer 3s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Floating particle sparkles */}
          <Sparkles className="absolute -top-1.5 right-1 w-6 h-6 text-yellow-300 animate-bounce filter drop-shadow-[0_0_6px_#fde047]" />
          <Zap className="absolute -bottom-1.5 left-1 w-5 h-5 text-emerald-400 animate-pulse filter drop-shadow-[0_0_6px_#34d399]" />
        </div>

        {/* Brand Display Typography */}
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight drop-shadow-[0_2px_12px_rgba(250,204,21,0.5)]">
            <span className="text-white">Bengal</span>
            <span className="bg-gradient-to-b from-[#fff59d] via-[#ffca28] to-[#ff6f00] text-transparent bg-clip-text ml-0.5">Bet</span>
          </h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-red-600 to-amber-500 text-white shadow border border-white/20 animate-pulse">
            OFFICIAL
          </span>
        </div>

        <p className="text-xs sm:text-sm text-yellow-300 font-semibold mb-4 tracking-wide flex items-center justify-center gap-1.5">
          <span>{customMessage || (language === 'bn' ? defaultMsgBn : defaultMsgEn)}</span>
          <span className="inline-flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce" />
          </span>
        </p>

        {/* High-tech Progress Bar */}
        <div className="w-full bg-[#051c13] border border-[#14593e] rounded-full h-3.5 p-0.5 overflow-hidden shadow-inner mb-3">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-amber-500 rounded-full transition-all duration-200 relative overflow-hidden shadow-[0_0_12px_rgba(250,204,21,0.8)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/35 animate-[shimmer_1.5s_infinite] skew-x-12" />
          </div>
        </div>

        {/* Security & License Badges */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-300 font-medium">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-yellow-300 font-mono font-bold tracking-wider">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
};
