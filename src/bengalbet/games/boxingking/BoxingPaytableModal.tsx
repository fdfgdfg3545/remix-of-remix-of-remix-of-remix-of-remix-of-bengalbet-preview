// @ts-nocheck
import React from 'react';
import { X, Info, Flame, Award, Zap } from 'lucide-react';
import { BOXING_SYMBOLS, BASE_MULTIPLIER_LADDER, FREE_SPINS_MULTIPLIER_LADDER } from './boxingKingTypes';
import { BoxingSymbolView } from './BoxingSymbolView';

interface BoxingPaytableModalProps {
  language: 'en' | 'bn';
  onClose: () => void;
}

export const BoxingPaytableModal: React.FC<BoxingPaytableModalProps> = ({
  language,
  onClose
}) => {
  const isBn = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e0a19] border-2 border-red-600/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-[#1a112c] to-red-950 border-b border-red-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black shadow-lg">
              🥊
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-yellow-300">
                {isBn ? 'বক্সিং কিং খেলার নিয়ম ও পে-টেবিল' : 'BOXING KING RULES & PAYTABLE'}
              </h2>
              <p className="text-xs text-red-200">
                {isBn ? 'JILI Games • ক্যাসকেডিং জয় • ৮৮ পে-লাইন' : 'JILI Games • Cascading Elimination • 88 Ways'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-zinc-800 hover:bg-red-600 transition text-zinc-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Combo Multiplier Meter Section */}
          <div className="p-3 bg-gradient-to-r from-red-950/60 via-zinc-900 to-red-950/60 rounded-xl border border-red-500/40">
            <h3 className="font-bold text-yellow-400 flex items-center gap-1.5 mb-2">
              <Zap className="w-4 h-4 text-amber-400" />
              {isBn ? 'ক্যাসকেডিং কম্বো গুণক (Combo Multipliers)' : 'CASCADING COMBO MULTIPLIER LADDER'}
            </h3>
            <p className="text-zinc-300 text-xs mb-2">
              {isBn 
                ? 'যেকোনো জয়ের পর বিজয়ী প্রতীকগুলো ফেটে বিলুপ্ত হয় এবং ওপর থেকে নতুন প্রতীক নেমে আসে। প্রতিটি ধারাবাহিক জয়ে গুণক বৃদ্ধি পায়!'
                : 'Every winning match eliminates winning symbols and drops new ones from the top. Consecutive cascades climb the multiplier meter!'}
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-black/40 rounded-lg border border-red-800/40">
                <span className="text-[11px] text-red-300 font-bold block mb-1">
                  {isBn ? 'মূল খেলা (Base Game)' : 'BASE GAME LADDER'}
                </span>
                <div className="flex gap-1.5">
                  {BASE_MULTIPLIER_LADDER.map((m, idx) => (
                    <span key={idx} className="flex-1 text-center py-1 bg-zinc-800 font-black text-amber-400 rounded text-xs">
                      {m}X
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-2 bg-black/40 rounded-lg border border-yellow-500/40">
                <span className="text-[11px] text-yellow-300 font-bold block mb-1">
                  {isBn ? 'ফ্রি স্পিন মোড (Free Spins)' : 'FREE SPINS LADDER'}
                </span>
                <div className="flex gap-1.5">
                  {FREE_SPINS_MULTIPLIER_LADDER.map((m, idx) => (
                    <span key={idx} className="flex-1 text-center py-1 bg-red-950 font-black text-yellow-300 rounded text-xs border border-yellow-500/50">
                      {m}X
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Free Spins Feature */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-yellow-600/40">
            <h3 className="font-bold text-yellow-400 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              {isBn ? 'বক্সিং বেল ফ্রি স্পিন (Free Spins Round)' : 'CHAMPIONSHIP FREE SPINS'}
            </h3>
            <div className="space-y-1.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between p-1.5 bg-black/30 rounded">
                <span>{isBn ? '৩টি বক্সিং বেল স্ক্যাটার' : '3 Boxing Bell Scatters'}</span>
                <span className="font-bold text-yellow-400">{isBn ? '৮টি ফ্রি স্পিন' : '8 Free Spins'}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-black/30 rounded">
                <span>{isBn ? '৪টি বক্সিং বেল স্ক্যাটার' : '4 Boxing Bell Scatters'}</span>
                <span className="font-bold text-yellow-400">{isBn ? '১২টি ফ্রি স্পিন' : '12 Free Spins'}</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-black/30 rounded">
                <span>{isBn ? '৫টি বক্সিং বেল স্ক্যাটার' : '5 Boxing Bell Scatters'}</span>
                <span className="font-bold text-yellow-400">{isBn ? '২০টি ফ্রি স্পিন' : '20 Free Spins'}</span>
              </div>
            </div>
          </div>

          {/* ExMATCH Feature (Title Match Sequel mechanic) */}
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-blue-600/40">
            <h3 className="font-bold text-blue-400 flex items-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              {isBn ? 'ExMATCH বৈশিষ্ট্য (Title Match Mode)' : 'ExMATCH ROW WILD FEATURE'}
            </h3>
            <p className="text-xs text-zinc-300">
              {isBn
                ? 'যখন লাল চ্যাম্পিয়ন এবং নীল বক্সার একই সারির রিল ১ ও রিল ৫-এ মুখোমুখি আসে, সেই সম্পূর্ণ সারি ওয়াইল্ড বেল্টে রূপান্তর হয়ে বিশাল জয় উপহার দেয়!'
                : 'When Red Champion and Blue Boxer appear on Reel 1 and Reel 5 in the exact same row, the entire row transforms into Wilds!'}
            </p>
          </div>

          {/* Symbol Paytable */}
          <div>
            <h3 className="font-bold text-zinc-300 mb-2">
              {isBn ? 'প্রতীক ও পে-আউট মান (Bet Multiplier)' : 'SYMBOL PAYOUT VALUES'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(BOXING_SYMBOLS).map((sym) => (
                <div
                  key={sym.id}
                  className="p-2 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center gap-2"
                >
                  <div className="w-10 h-10 shrink-0">
                    <BoxingSymbolView symbol={sym.id} size="sm" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-[11px] truncate text-zinc-200">
                      {isBn ? sym.nameBn : sym.name}
                    </p>
                    <p className="text-[10px] text-yellow-400 font-mono">
                      5: {sym.payout5}x | 4: {sym.payout4}x | 3: {sym.payout3}x
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg transition"
          >
            {isBn ? 'বুঝেছি, খেলা শুরু করুন' : 'UNDERSTOOD, LET\'S FIGHT!'}
          </button>
        </div>
      </div>
    </div>
  );
};
