// @ts-nocheck
import React, { useState } from 'react';
import { OffersClaimPanel } from './OffersClaimPanel';
import { 
  ChevronLeft, 
  AlertCircle, 
  Check, 
  Calendar, 
  Clock, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { UserAccount } from '../types';
import confetti from 'canvas-confetti';

interface RebateMobileViewProps {
  user?: UserAccount;
  onSettled?: () => void;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
}

interface RebateCategoryItem {
  id: string;
  name: string;
  leftColor: string;
  rightCapColor: string;
  amount: number;
}

export const RebateMobileView: React.FC<RebateMobileViewProps> = ({
  user,
  onSettled,
  onBack,
  onClose,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'history'>('manual');
  const [isClaiming, setIsClaiming] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic current date formatted YYYY-MM-DD
  const todayDate = '2026-08-30';

  // Categories matching Capture13.PNG
  const [categories, setCategories] = useState<RebateCategoryItem[]>([
    {
      id: 'slots',
      name: 'স্লট',
      leftColor: 'bg-[#5c7ae8]', // Periwinkle Blue
      rightCapColor: 'bg-[#38bdf8]', // Cyan cap
      amount: 0.00
    },
    {
      id: 'live',
      name: 'লাইভ',
      leftColor: 'bg-[#c084fc]', // Lavender / Violet
      rightCapColor: 'bg-[#c084fc]', // Purple cap
      amount: 0.00
    },
    {
      id: 'fish',
      name: 'মাছ',
      leftColor: 'bg-[#06b6d4]', // Teal / Cyan
      rightCapColor: 'bg-[#06b6d4]', // Teal cap
      amount: 0.00
    },
    {
      id: 'poker',
      name: 'পোকার',
      leftColor: 'bg-[#f472b6]', // Pink / Magenta
      rightCapColor: 'bg-[#f472b6]', // Pink cap
      amount: 0.00
    },
    {
      id: 'sports',
      name: 'খেলাধুলা',
      leftColor: 'bg-[#fb7185]', // Salmon / Coral
      rightCapColor: 'bg-[#fb923c]', // Orange cap
      amount: 0.00
    },
    {
      id: 'total',
      name: 'মোট',
      leftColor: 'bg-[#5c7ae8]', // Indigo Blue
      rightCapColor: 'bg-[#38bdf8]', // Cyan cap
      amount: 0.00
    }
  ]);

  // Dummy rebate history items
  const historyList = [
    { id: 'R1008', date: '2026-08-29', category: 'স্লট', amount: '128.50', status: 'সফল' },
    { id: 'R1007', date: '2026-08-28', category: 'লাইভ', amount: '250.00', status: 'সফল' },
    { id: 'R1006', date: '2026-08-27', category: 'মাছ', amount: '45.00', status: 'সফল' },
    { id: 'R1005', date: '2026-08-26', category: 'খেলাধুলা', amount: '320.00', status: 'সফল' }
  ];

  const totalAmount = categories.find(c => c.id === 'total')?.amount || 0;

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleClaim = () => {
    if (totalAmount <= 0) {
      triggerToast('দাবি করার মতো কোনো রিবেট অবশিষ্ট নেই');
      return;
    }

    setIsClaiming(true);
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      triggerToast(`৳${totalAmount.toFixed(2)} রিবেট সফলভাবে আপনার একাউন্টে জমা হয়েছে!`);
      setCategories(prev => prev.map(c => ({ ...c, amount: 0 })));
      setIsClaiming(false);
    }, 800);
  };

  return (
    <div 
      id="mobile-rebate-view"
      className="w-full h-full min-h-screen bg-[#f5f6f8] flex flex-col font-bengali select-none animate-in fade-in relative pb-12"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b3323] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER matching Capture13.PNG */}
      {/* Dark Forest Green Background (#0b3323) + Back Arrow + Centered Title: রিবেট */}
      {/* ========================================================================= */}
      <header className="bg-[#0b3323] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <h1 className="text-lg font-bold text-white tracking-wide">
          রিবেট
        </h1>

        <div className="w-9" />
      </header>

      {user?.isLoggedIn && <OffersClaimPanel onSettled={() => onSettled?.()} />}

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER TABS matching Capture13.PNG */}
      {/* [ম্যানুয়াল রিবেট] (Active with Cyan/Blue underline) | [রিবেট ইতিহাস] */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-gray-200 flex items-center shadow-xs shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === 'manual' 
              ? 'text-[#0091ea]' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>ম্যানুয়াল রিবেট</span>
          {activeTab === 'manual' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0091ea]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-center text-sm font-bold transition-all relative cursor-pointer ${
            activeTab === 'history' 
              ? 'text-[#0091ea]' 
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>রিবেট ইতিহাস</span>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0091ea]" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN TAB CONTENT */}
      {/* ========================================================================= */}
      <div className="flex-1 p-4 space-y-3 max-w-lg mx-auto w-full overflow-y-auto">
        {activeTab === 'manual' ? (
          <>
            {/* ROW 1: তারিখ (Date) matching Capture13.PNG */}
            <div className="flex items-center h-[52px] bg-white rounded-xl shadow-xs border border-gray-100/80 overflow-hidden">
              {/* Left Label Pill: Coral Salmon */}
              <div className="w-[100px] sm:w-[110px] h-full bg-[#fb7185] flex items-center justify-center text-white font-bold text-sm tracking-wide shrink-0">
                তারিখ
              </div>

              {/* Center & Right Value */}
              <div className="flex-1 px-4 flex items-center justify-end">
                <span className="text-[#f97316] font-bold text-base sm:text-lg tracking-wider font-mono">
                  {todayDate}
                </span>
              </div>

              {/* Right decorative cap matching Capture13.PNG */}
              <div className="w-2 h-full bg-[#fb923c] shrink-0" />
            </div>

            {/* ROWS 2-7: Game Categories & Total matching Capture13.PNG */}
            {categories.map((cat) => (
              <div 
                key={cat.id}
                className="flex items-center h-[52px] bg-white rounded-xl shadow-xs border border-gray-100/80 overflow-hidden"
              >
                {/* Left Colored Label Pill */}
                <div className={`w-[100px] sm:w-[110px] h-full ${cat.leftColor} flex items-center justify-center text-white font-bold text-sm tracking-wide shrink-0`}>
                  {cat.name}
                </div>

                {/* Amount in Orange/Amber */}
                <div className="flex-1 px-4 flex items-center justify-end">
                  <span className="text-[#f97316] font-bold text-base sm:text-lg tracking-wider font-mono">
                    {cat.amount.toFixed(2)}
                  </span>
                </div>

                {/* Right decorative cap */}
                <div className={`w-2 h-full ${cat.rightCapColor} shrink-0`} />
              </div>
            ))}

            {/* Bottom Claim Button matching Capture13.PNG */}
            <div className="pt-6">
              <button
                type="button"
                onClick={handleClaim}
                disabled={totalAmount <= 0 || isClaiming}
                className={`w-full py-4 rounded-xl font-black text-base tracking-wide flex items-center justify-center transition-all shadow-md ${
                  totalAmount > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white active:scale-[0.98] cursor-pointer shadow-emerald-500/30'
                    : 'bg-[#d8dfe6] text-white/90 cursor-not-allowed'
                }`}
              >
                {isClaiming ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>দাবি</span>
                )}
              </button>
            </div>
          </>
        ) : (
          /* REBATE HISTORY TAB */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-gray-500">সাম্প্রতিক রিবেট রেকর্ড</span>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer">সর্বশেষ ৭ দিন</span>
            </div>

            {historyList.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-800">{item.category} রিবেট</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {item.date} • আইডি: {item.id}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-emerald-600 font-mono">
                    +৳{item.amount}
                  </div>
                  <div className="text-[10px] text-gray-400">অ্যাকাউন্টে জমা</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. FOOTER DISCLAIMER BAR matching Capture13.PNG */}
      {/* Light pinkish background + Orange icon + Bengali text: অন্তর্বর্তীকরণ: উপরের ডেটা GMT + 8 ভিত্তিক */}
      {/* ========================================================================= */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#fff1f2] border-t border-[#ffe4e6] py-2 px-3 flex items-center justify-center gap-2 z-20 text-center">
        <div className="w-4 h-4 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[10px] font-black shrink-0">
          !
        </div>
        <span className="text-[11px] sm:text-xs font-bold text-[#ef4444] tracking-tight">
          অন্তর্বর্তীকরণ: উপরের ডেটা GMT + 8 ভিত্তিক
        </span>
      </footer>

    </div>
  );
};
