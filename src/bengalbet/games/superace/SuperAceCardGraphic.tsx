// @ts-nocheck
import React from 'react';
import { SymbolType } from './SuperAceGame';

interface CardGraphicProps {
  type: SymbolType;
  isGolden: boolean;
  isSpinning?: boolean;
}

export const SuperAceCardGraphic: React.FC<CardGraphicProps> = ({ type, isGolden }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-1 sm:p-1.5 select-none overflow-hidden">
      {/* 24K Golden Foil Shimmer Effect for Golden Cards */}
      {isGolden && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,245,157,0.7)_0%,_rgba(245,158,11,0.25)_60%,_rgba(180,83,9,0.4)_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.15)_6px,rgba(255,255,255,0.15)_12px)] pointer-events-none" />
          {/* Golden Badge Header */}
          <div className="absolute top-0 right-0 px-1 py-0.2 bg-gradient-to-l from-yellow-300 via-amber-400 to-yellow-500 text-black text-[7px] sm:text-[8px] font-black rounded-bl tracking-tighter uppercase shadow">
            GOLD
          </div>
        </>
      )}

      {/* SYMBOL-SPECIFIC RENDERING */}
      {type === 'SCATTER' ? (
        // SCATTER (FREE GAME) - Royal Golden Shield with Wings & Crown
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            {/* Ambient gold glow */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-md animate-pulse" />
            
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <defs>
                <linearGradient id="scatterGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff7ed" />
                  <stop offset="25%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="85%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#713f12" />
                </linearGradient>
                <linearGradient id="scatterRuby" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fda4af" />
                  <stop offset="50%" stopColor="#e11d48" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
              </defs>

              {/* Majestic Wings */}
              <path
                d="M 12 35 C 22 28 35 32 45 42 C 38 48 25 50 12 35 Z"
                fill="url(#scatterGold)"
                stroke="#854d0e"
                strokeWidth="1.5"
              />
              <path
                d="M 88 35 C 78 28 65 32 55 42 C 62 48 75 50 88 35 Z"
                fill="url(#scatterGold)"
                stroke="#854d0e"
                strokeWidth="1.5"
              />

              {/* Golden Shield Base */}
              <path
                d="M 28 25 Q 50 18 72 25 Q 75 58 50 82 Q 25 58 28 25 Z"
                fill="url(#scatterGold)"
                stroke="#713f12"
                strokeWidth="2.5"
              />

              {/* Inner Ruby Medallion */}
              <path
                d="M 33 29 Q 50 24 67 29 Q 70 55 50 75 Q 30 55 33 29 Z"
                fill="url(#scatterRuby)"
                stroke="#fde047"
                strokeWidth="1.5"
              />

              {/* Royal Crown on Top */}
              <path
                d="M 36 22 L 40 28 L 50 16 L 60 28 L 64 22 L 62 30 L 38 30 Z"
                fill="url(#scatterGold)"
                stroke="#713f12"
                strokeWidth="1"
              />
              <circle cx="40" cy="19" r="2" fill="#fff" />
              <circle cx="50" cy="14" r="2.5" fill="#fde047" stroke="#854d0e" />
              <circle cx="60" cy="19" r="2" fill="#fff" />

              {/* Central Golden Star / Jewel */}
              <polygon
                points="50,34 54,44 64,46 56,53 59,63 50,57 41,63 44,53 36,46 46,44"
                fill="url(#scatterGold)"
                stroke="#fff"
                strokeWidth="1"
              />
            </svg>

            {/* Bottom "FREE GAME" ribbon */}
            <div className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-yellow-300 font-black text-[7px] sm:text-[8px] uppercase tracking-wider border border-yellow-300 shadow-md font-mono whitespace-nowrap">
              FREE GAME
            </div>
          </div>
        </div>
      ) : type === 'LITTLE_JOKER' ? (
        // LITTLE JOKER (WILD) - Playful Mask with 3-Point Jester Hat
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-rose-950 via-red-900 to-black rounded-md p-1 border border-yellow-400/80 shadow-inner">
          <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              <defs>
                <linearGradient id="jesterHatLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id="jesterHatMid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="jesterHatRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
              </defs>

              {/* Jester Hat - Left Point with Bell */}
              <path d="M 40 45 C 30 30 15 32 10 40 C 15 50 35 50 40 45 Z" fill="url(#jesterHatLeft)" stroke="#fef08a" strokeWidth="1" />
              <circle cx="10" cy="40" r="3.5" fill="#fde047" stroke="#713f12" strokeWidth="1" />

              {/* Jester Hat - Middle Point with Bell */}
              <path d="M 38 45 C 45 20 55 20 62 45 Z" fill="url(#jesterHatMid)" stroke="#fef08a" strokeWidth="1" />
              <circle cx="50" cy="18" r="4" fill="#fde047" stroke="#713f12" strokeWidth="1" />

              {/* Jester Hat - Right Point with Bell */}
              <path d="M 60 45 C 70 30 85 32 90 40 C 85 50 65 50 60 45 Z" fill="url(#jesterHatRight)" stroke="#fef08a" strokeWidth="1" />
              <circle cx="90" cy="40" r="3.5" fill="#fde047" stroke="#713f12" strokeWidth="1" />

              {/* Face Mask Base */}
              <path d="M 35 48 C 35 45 65 45 65 48 C 65 72 50 82 35 48 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Smiling Eyes */}
              <path d="M 40 56 Q 44 52 48 56" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 52 56 Q 56 52 60 56" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

              {/* Rosy Cheeks */}
              <circle cx="39" cy="62" r="2.5" fill="#f87171" opacity="0.8" />
              <circle cx="61" cy="62" r="2.5" fill="#f87171" opacity="0.8" />

              {/* Wide Grinning Mouth */}
              <path d="M 43 65 Q 50 74 57 65 Q 50 70 43 65 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="0.8" />
            </svg>

            {/* WILD Banner */}
            <div className="absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-black font-black text-[8px] sm:text-[9px] uppercase tracking-wider border border-white shadow-lg font-mono">
              WILD
            </div>
          </div>
        </div>
      ) : type === 'BIG_JOKER' ? (
        // BIG JOKER (GRAND WILD) - Royal Crowned Lightning Joker
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-950 via-yellow-950 to-black rounded-md p-1 border-2 border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)] overflow-hidden">
          {/* Animated Electric Rays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(250,204,21,0.3)_0%,_transparent_70%)] animate-pulse pointer-events-none" />

          <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_8px_rgba(250,204,21,0.9)]">
              <defs>
                <linearGradient id="bigJokerGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="40%" stopColor="#fde047" />
                  <stop offset="80%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>

              {/* Radiant Electric Corona */}
              <path d="M 50 5 L 54 22 L 68 12 L 62 26 L 80 24 L 68 35 L 85 45 L 68 50 L 80 65 L 63 62 L 68 80 L 53 68 L 50 90 L 47 68 L 32 80 L 37 62 L 20 65 L 32 50 L 15 45 L 32 35 L 20 24 L 38 26 L 32 12 L 46 22 Z"
                fill="url(#bigJokerGold)"
                opacity="0.85"
              />

              {/* Royal Crowned Mask */}
              <path d="M 33 42 C 33 38 67 38 67 42 C 67 70 50 82 33 42 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="2" />

              {/* Crown on Mask */}
              <path d="M 35 34 L 40 40 L 50 28 L 60 40 L 65 34 L 62 42 L 38 42 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />

              {/* Glowing Eyes */}
              <circle cx="43" cy="52" r="3" fill="#ef4444" />
              <circle cx="57" cy="52" r="3" fill="#ef4444" />
              <circle cx="43" cy="52" r="1.2" fill="#fff" />
              <circle cx="57" cy="52" r="1.2" fill="#fff" />

              {/* Grand Smirk */}
              <path d="M 42 63 Q 50 72 58 63 Q 50 68 42 63 Z" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1" />
            </svg>

            {/* BIG JOKER Banner */}
            <div className="absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-yellow-500 to-amber-600 text-black font-black text-[7px] sm:text-[8px] uppercase tracking-tighter border border-white shadow-lg font-mono whitespace-nowrap">
              BIG JOKER
            </div>
          </div>
        </div>
      ) : type === 'A' ? (
        // ACE (A) - Stylized Grand Spade Crest with Crown & Filigree Wings
        <div className="w-full h-full flex flex-col items-center justify-between">
          {/* Top-Left Corner Pip */}
          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 text-neutral-900">
            <span className="font-serif">A</span>
            <span className="text-[9px] sm:text-[10px]">♠</span>
          </div>

          {/* Center Ornate Ace of Spades */}
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              <defs>
                <linearGradient id="aceSpadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#374151" />
                  <stop offset="40%" stopColor="#1f2937" />
                  <stop offset="100%" stopColor="#030712" />
                </linearGradient>
                <linearGradient id="aceGoldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
              </defs>

              {/* Spade Body */}
              <path
                d="M 50 16 C 50 16 18 48 18 64 C 18 76 30 84 42 78 C 45 76 47 72 48 70 L 44 86 L 56 86 L 52 70 C 53 72 55 76 58 78 C 70 84 82 76 82 64 C 82 48 50 16 50 16 Z"
                fill={isGolden ? "url(#aceGoldTrim)" : "url(#aceSpadeGrad)"}
                stroke="url(#aceGoldTrim)"
                strokeWidth="2.5"
              />

              {/* Filigree Crown inside Ace */}
              <path
                d="M 40 44 L 43 50 L 50 40 L 57 50 L 60 44 L 58 53 L 42 53 Z"
                fill="url(#aceGoldTrim)"
              />
              <circle cx="50" cy="38" r="1.5" fill="#ffffff" />

              {/* Letter A in center */}
              <text x="50" y="65" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="serif">
                A
              </text>
            </svg>
          </div>

          {/* Bottom-Right Corner Pip */}
          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 rotate-180 text-neutral-900">
            <span className="font-serif">A</span>
            <span className="text-[9px] sm:text-[10px]">♠</span>
          </div>
        </div>
      ) : type === 'K' ? (
        // KING (K) - Crowned Monarch Medallion with Crimson Trim
        <div className="w-full h-full flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 text-red-700">
            <span className="font-serif">K</span>
            <span className="text-[9px] sm:text-[10px]">👑</span>
          </div>

          <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
              <defs>
                <linearGradient id="kingGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#ca8a04" />
                  <stop offset="100%" stopColor="#854d0e" />
                </linearGradient>
                <linearGradient id="kingCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="60%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>
              </defs>

              {/* Medallion Frame */}
              <circle cx="50" cy="50" r="40" fill="url(#kingCrimson)" stroke="url(#kingGold)" strokeWidth="3" />

              {/* Golden Crown */}
              <path d="M 28 35 L 34 45 L 50 26 L 66 45 L 72 35 L 68 48 L 32 48 Z" fill="url(#kingGold)" stroke="#713f12" strokeWidth="1" />
              <circle cx="50" cy="24" r="2.5" fill="#fde047" />

              {/* King's Majestic Beard & Robe */}
              <path d="M 36 50 Q 50 48 64 50 Q 66 75 50 82 Q 34 75 36 50 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
              <path d="M 42 56 Q 50 62 58 56 Q 50 72 42 56 Z" fill="#78350f" />
              <circle cx="44" cy="54" r="1.5" fill="#1e293b" />
              <circle cx="56" cy="54" r="1.5" fill="#1e293b" />

              {/* Golden Letter K */}
              <text x="50" y="78" textAnchor="middle" fill="#ca8a04" fontSize="12" fontWeight="900" fontFamily="serif">
                KING
              </text>
            </svg>
          </div>

          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 rotate-180 text-red-700">
            <span className="font-serif">K</span>
            <span className="text-[9px] sm:text-[10px]">👑</span>
          </div>
        </div>
      ) : type === 'Q' ? (
        // QUEEN (Q) - Royal Tiara Medallion with Purple & Gold Trim
        <div className="w-full h-full flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 text-purple-800">
            <span className="font-serif">Q</span>
            <span className="text-[9px] sm:text-[10px]">🌹</span>
          </div>

          <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
              <defs>
                <linearGradient id="queenPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="60%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>
              </defs>

              <circle cx="50" cy="50" r="40" fill="url(#queenPurple)" stroke="#fde047" strokeWidth="3" />

              {/* Queen's Tiara */}
              <path d="M 32 36 L 40 44 L 50 30 L 60 44 L 68 36 L 64 48 L 36 48 Z" fill="#fde047" stroke="#854d0e" strokeWidth="1" />
              <circle cx="50" cy="28" r="2.5" fill="#ec4899" />
              <circle cx="38" cy="34" r="1.5" fill="#38bdf8" />
              <circle cx="62" cy="34" r="1.5" fill="#38bdf8" />

              {/* Queen's Face & Hair */}
              <path d="M 36 50 Q 50 48 64 50 Q 64 74 50 80 Q 36 74 36 50 Z" fill="#fff1f2" />
              <path d="M 34 50 Q 32 68 40 74 Q 38 58 36 50 Z" fill="#d97706" />
              <path d="M 66 50 Q 68 68 60 74 Q 62 58 64 50 Z" fill="#d97706" />

              {/* Elegant Eyes & Red Lips */}
              <path d="M 43 55 Q 46 53 48 55" stroke="#4c1d95" strokeWidth="1.5" fill="none" />
              <path d="M 52 55 Q 54 53 57 55" stroke="#4c1d95" strokeWidth="1.5" fill="none" />
              <path d="M 47 64 Q 50 67 53 64" stroke="#e11d48" strokeWidth="2" fill="none" />

              <text x="50" y="78" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="900" fontFamily="serif">
                QUEEN
              </text>
            </svg>
          </div>

          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 rotate-180 text-purple-800">
            <span className="font-serif">Q</span>
            <span className="text-[9px] sm:text-[10px]">🌹</span>
          </div>
        </div>
      ) : type === 'J' ? (
        // JACK (J) - Royal Knight Medallion with Cobalt Blue & Gold Trim
        <div className="w-full h-full flex flex-col items-center justify-between">
          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 text-blue-800">
            <span className="font-serif">J</span>
            <span className="text-[9px] sm:text-[10px]">⚓</span>
          </div>

          <div className="relative w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
              <defs>
                <linearGradient id="jackBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="60%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#172554" />
                </linearGradient>
              </defs>

              <circle cx="50" cy="50" r="40" fill="url(#jackBlue)" stroke="#fde047" strokeWidth="3" />

              {/* Knight Helmet with Feather Plume */}
              <path d="M 38 24 Q 45 16 58 20 Q 52 30 46 32 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
              <path d="M 34 36 Q 50 32 66 36 L 68 56 Q 50 68 32 56 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
              <rect x="40" y="44" width="20" height="4" rx="2" fill="#0f172a" />

              {/* Golden Visor Shield */}
              <circle cx="50" cy="54" r="3" fill="#fde047" />

              <text x="50" y="78" textAnchor="middle" fill="#fde047" fontSize="11" fontWeight="900" fontFamily="serif">
                JACK
              </text>
            </svg>
          </div>

          <div className="w-full flex justify-between items-center text-[10px] sm:text-xs font-black leading-none px-0.5 rotate-180 text-blue-800">
            <span className="font-serif">J</span>
            <span className="text-[9px] sm:text-[10px]">⚓</span>
          </div>
        </div>
      ) : type === 'SPADE' ? (
        // SPADE (♠) - 3D Beveled Royal Purple/Black Spade with Gold Highlights
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="suitSpadeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="50%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#090514" />
                </linearGradient>
              </defs>
              <path
                d="M 50 14 C 50 14 20 46 20 62 C 20 74 30 82 42 76 C 45 74 47 70 48 68 L 44 86 L 56 86 L 52 68 C 53 70 55 74 58 76 C 70 82 80 74 80 62 C 80 46 50 14 50 14 Z"
                fill="url(#suitSpadeGrad)"
                stroke="#a855f7"
                strokeWidth="2.5"
              />
              {/* Glossy inner bevel highlight */}
              <path
                d="M 50 20 C 50 20 28 48 28 60 C 28 68 34 72 40 70 Q 48 64 48 56 Z"
                fill="rgba(255,255,255,0.25)"
              />
            </svg>
          </div>
        </div>
      ) : type === 'HEART' ? (
        // HEART (♥) - 3D Beveled Crimson Ruby Heart with Gold Highlights
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="suitHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>
              </defs>
              <path
                d="M 50 84 C 50 84 16 56 16 34 C 16 20 28 14 38 18 C 44 20 48 26 50 30 C 52 26 56 20 62 18 C 72 14 84 20 84 34 C 84 56 50 84 50 84 Z"
                fill="url(#suitHeartGrad)"
                stroke="#fde047"
                strokeWidth="2.5"
              />
              <path
                d="M 38 22 C 30 22 22 28 22 36 C 22 50 44 70 48 74 Q 44 56 42 42 Z"
                fill="rgba(255,255,255,0.3)"
              />
            </svg>
          </div>
        </div>
      ) : type === 'DIAMOND' ? (
        // DIAMOND (♦) - 3D Crystal Azure Blue Diamond
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="suitDiamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#082f49" />
                </linearGradient>
              </defs>
              <polygon
                points="50,14 84,50 50,86 16,50"
                fill="url(#suitDiamondGrad)"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              <polygon
                points="50,22 74,50 50,54 26,50"
                fill="rgba(255,255,255,0.35)"
              />
            </svg>
          </div>
        </div>
      ) : (
        // CLUB (♣) - 3D Emerald Green Club
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="suitClubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="50%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#052e16" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="34" r="16" fill="url(#suitClubGrad)" stroke="#fde047" strokeWidth="2" />
              <circle cx="34" cy="54" r="16" fill="url(#suitClubGrad)" stroke="#fde047" strokeWidth="2" />
              <circle cx="66" cy="54" r="16" fill="url(#suitClubGrad)" stroke="#fde047" strokeWidth="2" />
              <path d="M 46 54 L 43 84 L 57 84 L 54 54 Z" fill="url(#suitClubGrad)" stroke="#fde047" strokeWidth="2" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
