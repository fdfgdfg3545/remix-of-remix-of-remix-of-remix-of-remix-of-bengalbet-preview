// @ts-nocheck
/**
 * BengalBet Main Application Footer
 * Features:
 * - Brand information and quick navigation
 * - Help Center & AML-KYC legal policies
 * - Game providers logo showcase
 * - Certified payment methods & authorized gaming licenses
 * - Developer branding: The UI Developed by Neext Hub (https://neexthub.ai.studio/)
 * - Full bilingual support (Bengali / English)
 */

import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Smartphone, Sparkles, Code } from 'lucide-react';
import { Language } from '../types';
import { GAME_PROVIDERS } from '../data/providers';
import tigerFilledFace from '../assets/images/tiger_filled_face.jpg';

interface FooterProps {
  language: Language;
  onOpenAppDownload: () => void;
  onOpenSupport: () => void;
  onOpenPromoTerms: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenAppDownload,
  onOpenSupport,
  onOpenPromoTerms,
  onOpenAdmin
}) => {
  return (
    <footer id="bengalbet-main-footer" className="w-full bg-[#031810] border-t border-[#0e5439] text-emerald-300 text-xs py-8 px-4 sm:px-8 mt-12 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Main Footer Links & Providers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Brand & Quick Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 mr-2 shrink-0 flex items-center justify-center">
                    <div 
                      className="relative w-full h-full rounded-full p-[1.5px] bg-gradient-to-tr from-[#ffe082] via-[#ff9800] to-[#d84315] shadow-[0_0_5px_rgba(255,170,0,0.2),0_0_10px_rgba(255,80,0,0.1)]"
                      style={{
                        animation: 'tigerFilledIconPulse 3s ease-in-out infinite'
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
                      </div>
                    </div>
                  </div>
                  <span className="text-xl font-black font-sans text-white tracking-tight">
                    Bengal<span className="bg-gradient-to-b from-[#fff59d] via-[#ffca28] to-[#ff6f00] text-transparent bg-clip-text">Bet</span>
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-r from-red-600 to-amber-500 text-white shadow border border-white/20">
                  {language === 'bn' ? 'অফিসিয়াল' : 'OFFICIAL'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed mb-3">
                {language === 'bn' 
                  ? 'বাংলাদেশের শীর্ষস্থানীয় এবং বিশ্বস্ত অনলাইন গেমিং ও বিনোদন প্ল্যাটফর্ম।' 
                  : 'Leading and trusted online gaming & entertainment portal in Bangladesh.'}
              </p>
              <ul className="space-y-2 text-[11px]">
                <li>
                  <button 
                    onClick={onOpenAppDownload}
                    className="hover:text-yellow-400 transition-colors flex items-center gap-1.5 font-semibold text-emerald-200 cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{language === 'bn' ? 'মোবাইল অ্যাপ ডাউনলোড (৳৫২ বোনাস)' : 'Download Mobile App (৳52 Bonus)'}</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Help Center Navigation Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-2.5 font-bengali flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'সাহায্য ও নিরাপত্তা কেন্দ্র' : 'Help & Security Center'}</span>
              </h4>
              <ul className="space-y-1.5 text-[11px] text-emerald-300/80">
                <li>
                  <button onClick={onOpenSupport} className="hover:text-yellow-400 transition-colors cursor-pointer text-left">
                    {language === 'bn' ? 'আমাদের সম্পর্কে ও যোগাযোগ' : 'About Us & Contact'}
                  </button>
                </li>
                <li>
                  <button onClick={onOpenPromoTerms} className="hover:text-yellow-400 transition-colors cursor-pointer text-left">
                    {language === 'bn' ? 'এন্টি মানি লন্ডারিং (AML-KYC)' : 'Anti-Money Laundering (AML-KYC)'}
                  </button>
                </li>
                <li>
                  <button onClick={onOpenPromoTerms} className="hover:text-yellow-400 transition-colors cursor-pointer text-left">
                    {language === 'bn' ? 'উত্তোলন ও অর্থ জমা নীতিমালার শর্ত' : 'Deposit & Withdrawal Terms'}
                  </button>
                </li>
                <li>
                  <button onClick={onOpenPromoTerms} className="hover:text-yellow-400 transition-colors cursor-pointer text-left">
                    {language === 'bn' ? 'গোপনীয়তা নীতি ও অ্যাকাউন্ট নিরাপত্তা' : 'Privacy Policy & Account Security'}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Certified Game Providers Showcase */}
          <div id="footer-game-providers-container" className="lg:col-span-9 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white font-bengali flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>{language === 'bn' ? 'অনুমোদিত আন্তর্জাতিক গেম প্রোভাইডার' : 'Certified Global Game Providers'}</span>
              </h4>
              <span className="text-[10px] text-emerald-400/90 font-mono bg-[#032015] px-2 py-0.5 rounded border border-[#14593e]">
                {language === 'bn' ? '৭০+ সার্টিফাইড স্টুডিও' : '70+ Certified Studios'}
              </span>
            </div>

            {/* Providers Logo / Badge Matrix */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 max-h-56 overflow-y-auto pr-1 no-scrollbar">
              {GAME_PROVIDERS.map((provider) => (
                <div
                  key={provider.id + provider.name}
                  className="bg-[#092c1e] hover:bg-[#104832] border border-[#14593e]/60 hover:border-yellow-400/60 rounded p-1 flex flex-col items-center justify-center text-center transition-all duration-150 group cursor-default shadow-xs"
                >
                  <div className="w-full h-6 flex items-center justify-center overflow-hidden mb-0.5">
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-300 group-hover:text-yellow-300 tracking-tight truncate w-full">
                    {provider.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banking and Regulatory Licenses Row */}
        <div className="pt-6 border-t border-[#14593e]/80 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Supported Banks / Payment Methods */}
          <div className="space-y-2 text-center md:text-left flex flex-col items-center md:items-start">
            <span className="text-xs font-bold text-gray-300 block">
              {language === 'bn' ? 'সমর্থিত পেমেন্ট চ্যানেল (বিকাশ, নগদ, রকেট, USDT)' : 'Supported Payment Methods (bKash, Nagad, Rocket, USDT)'}
            </span>
            <div className="w-full sm:w-auto bg-[#052b1d] border border-[#145d40] rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-inner max-w-xs sm:max-w-md">
              <img
                src="https://plain-apac-prod-public.komododecks.com/202608/29/k7fmCMmFNf1R3kSasgkm/image.png"
                alt="Supported Payment Methods & Banks"
                referrerPolicy="no-referrer"
                className="w-full max-h-12 object-contain filter drop-shadow brightness-105"
              />
            </div>
          </div>

          {/* Licenses & Compliance Seals with image banner div */}
          <div className="space-y-2 text-center md:text-right flex flex-col items-center md:items-end">
            <span className="text-xs font-bold text-gray-300 block">
              {language === 'bn' ? 'লাইসেন্স ও দায়িত্বশীল গেমিং সনদ' : 'Gaming Licenses & Responsible Gaming Compliance'}
            </span>
            <div className="w-full sm:w-auto bg-[#052b1d] border border-[#145d40] rounded-xl p-2 flex items-center justify-center overflow-hidden shadow-inner max-w-xs sm:max-w-md">
              <img
                src="https://plain-apac-prod-public.komododecks.com/202608/29/r2wETt9MwmuXB2qG9iaS/image.png"
                alt="Authorized Gaming Licenses & Responsible Gaming"
                referrerPolicy="no-referrer"
                className="w-full max-h-12 object-contain filter drop-shadow brightness-105"
              />
            </div>
          </div>
        </div>

        {/* Developer Credit & Copyright Section */}
        <div className="pt-6 border-t border-[#14593e]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-gray-400">
          <div>
            <p>
              {language === 'bn' 
                ? 'কপিরাইট © BengalBet (বেঙ্গলবেট) সমস্ত অধিকার সংরক্ষিত।' 
                : 'Copyright © BengalBet. All rights reserved.'}
            </p>
          </div>

          {/* UI Developer Credit: Neext Hub & Admin Access */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-[#032014] px-3 py-1.5 rounded-full border border-yellow-500/30 text-emerald-200">
              <Code className="w-3.5 h-3.5 text-yellow-400" />
              <span>
                {language === 'bn' ? 'ইউআই ডিজাইন ও ডেভেলপমেন্ট: ' : 'The UI Developed by '}
              </span>
              <a 
                href="https://neexthub.ai.studio/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-yellow-400 hover:text-yellow-300 font-extrabold underline decoration-yellow-400/60 hover:decoration-yellow-300 inline-flex items-center gap-1 transition-colors"
              >
                <span>Neext Hub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-900/60 hover:bg-yellow-400/20 text-emerald-300 hover:text-yellow-300 border border-emerald-600/40 hover:border-yellow-400/40 text-[10px] font-bold transition-colors cursor-pointer"
                title="Neext Hub Master Admin Dashboard"
              >
                <Lock className="w-2.5 h-2.5 text-yellow-400" />
                <span>NeextHub Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
