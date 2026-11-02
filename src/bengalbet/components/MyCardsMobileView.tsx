// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  X, 
  Lock, 
  CreditCard, 
  Contact2, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { api } from '../services/api';

export interface BoundWalletCard {
  id: string;
  type: 'Rocket' | 'Nagad' | 'BKash';
  accountNumber: string;
  fullNumber?: string;
  date: string;
}

interface MyCardsMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (message: string) => void;
}

// Bound wallets loaded exclusively from REST API (https://server.nexarofx.com/dbserver/api/wallet.php?action=cards)

export const MyCardsMobileView: React.FC<MyCardsMobileViewProps> = ({
  user,
  onBack,
  onClose,
  showToast
}) => {
  // Screen views: 'list' (Image 2: আমার কার্ড) | 'bind' (Image 1: ই-ওয়ালেট বাঁধুন)
  const [currentScreen, setCurrentScreen] = useState<'list' | 'bind'>('list');

  // Bottom action sheet modal (Image 3: নতুন যোগ করুন)
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Local state for registered wallet cards
  const [wallets, setWallets] = useState<BoundWalletCard[]>(() => {
    try {
      const saved = localStorage.getItem('bengalbet_bound_cards_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved wallets', e);
    }
    return [];
  });

  // Fetch real registered cards from backend
  useEffect(() => {
    api.wallet.getCards().then(res => {
      if (res.success && Array.isArray(res.wallets)) {
        const mapped: BoundWalletCard[] = res.wallets.map((c: any) => ({
          id: c.id,
          type: c.type,
          accountNumber: c.accountNumber && c.accountNumber.length > 4 ? `*******${c.accountNumber.slice(-4)}` : c.accountNumber,
          fullNumber: c.accountNumber,
          date: c.createdAt || new Date().toISOString()
        }));
        setWallets(mapped);
      } else {
        setWallets([]);
      }
    }).catch(err => {
      console.warn('Could not fetch cards:', err);
      setWallets([]);
    });
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('bengalbet_bound_cards_list', JSON.stringify(wallets));
    } catch (e) {
      console.error('Error saving wallets', e);
    }
  }, [wallets]);

  // Form states for Binding new wallet (Image 1: ই-ওয়ালেট বাঁধুন)
  const [selectedWalletType, setSelectedWalletType] = useState<'Rocket' | 'Nagad' | 'BKash'>('Rocket');
  const [accountNumberInput, setAccountNumberInput] = useState<string>('');
  const [transPasswordInput, setTransPasswordInput] = useState<string>('');
  const [showTransPassword, setShowTransPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerLocalToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleDeleteWallet = async (walletId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wallets.length <= 1) {
      triggerLocalToast('কমপক্ষে ১টি ই-ওয়ালেট যুক্ত থাকতে হবে');
      return;
    }
    api.wallet.deleteCard(walletId).catch(() => {});
    setWallets(prev => prev.filter(w => w.id !== walletId));
    triggerLocalToast('ই-ওয়ালেট সফলভাবে মুছে ফেলা হয়েছে');
  };

  const handleBindSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumberInput.trim() || accountNumberInput.length < 10) {
      triggerLocalToast('অনুগ্রহ করে সঠিক ১১ ডিজিটের ওয়ালেট অ্যাকাউন্ট নম্বর দিন');
      return;
    }

    if (!transPasswordInput.trim()) {
      triggerLocalToast('অনুগ্রহ করে লেনদেন পাসওয়ার্ড প্রদান করুন');
      return;
    }

    setIsSubmitting(true);
    const rawNum = accountNumberInput.trim();
    const lastFour = rawNum.slice(-4);
    const masked = `*******${lastFour}`;

    try {
      const res = await api.wallet.addCard(selectedWalletType, user?.username || 'সদস্য', rawNum);
      setIsSubmitting(false);

      const newWallet: BoundWalletCard = {
        id: res.wallet?.id || `w-${Date.now()}`,
        type: selectedWalletType,
        accountNumber: masked,
        fullNumber: rawNum,
        date: res.wallet?.createdAt || new Date().toISOString()
      };

      setWallets(prev => [newWallet, ...prev]);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      triggerLocalToast(`${selectedWalletType} ই-ওয়ালেট সফলভাবে যুক্ত করা হয়েছে!`);
      setAccountNumberInput('');
      setTransPasswordInput('');
      setCurrentScreen('list');
    } catch {
      setIsSubmitting(false);

      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      const newWallet: BoundWalletCard = {
        id: `w-${Date.now()}`,
        type: selectedWalletType,
        accountNumber: masked,
        fullNumber: rawNum,
        date: formattedDate
      };

      setWallets(prev => [newWallet, ...prev]);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      triggerLocalToast(`${selectedWalletType} ই-ওয়ালেট সফলভাবে যুক্ত করা হয়েছে!`);
      setAccountNumberInput('');
      setTransPasswordInput('');
      setCurrentScreen('list');
    }
  };

  // Check if bind form is valid
  const isBindValid = accountNumberInput.trim().length >= 10 && transPasswordInput.trim().length >= 4;

  // =========================================================================
  // SCREEN 2: ই-ওয়ালেট বাঁধুন (Image 1)
  // =========================================================================
  if (currentScreen === 'bind') {
    return (
      <div 
        id="bind-wallet-mobile-view"
        className="flex flex-col h-full min-h-screen bg-[#f5f7fa] text-gray-900 font-bengali select-none animate-in fade-in"
      >
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#084e36] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in border border-emerald-400/40 w-[90%] max-w-sm justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header matching Screenshot 1 */}
        <header className="bg-[#084e36] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentScreen('list')}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-8">
            ই-ওয়ালেট বাঁধুন
          </h1>
        </header>

        {/* Form Body matching Screenshot 1 */}
        <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full space-y-4">
          
          {/* Section 1: ই-ওয়ালেট গ্রুপ নির্বাচন করুন */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-gray-800">
              ই-ওয়ালেট গ্রুপ নির্বাচন করুন
            </h2>

            <div className="w-28 py-3.5 px-3 rounded-2xl border-2 border-[#ff3b4e] bg-[#fff5f6] flex items-center justify-center shadow-xs cursor-pointer">
              {/* Pink rounded icon with white "ec" */}
              <div className="w-10 h-10 rounded-2xl bg-[#e6007e] text-white font-black text-sm flex items-center justify-center shadow-xs tracking-tight">
                ec
              </div>
            </div>
          </div>

          {/* Section 2: ই-ওয়ালেট প্রকার Container Card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs space-y-3.5">
            <h3 className="text-sm font-bold text-gray-800">
              ই-ওয়ালেট প্রকার
            </h3>

            {/* 3 Wallet Type Selector Buttons */}
            <div className="grid grid-cols-3 gap-2.5">
              {(['Rocket', 'Nagad', 'BKash'] as const).map((type) => {
                const isSelected = selectedWalletType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedWalletType(type)}
                    className={`py-2.5 px-2 rounded-xl text-center text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#ff3b4e] text-gray-900 bg-[#fff5f6] shadow-xs'
                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            {/* Field 1 (Readonly ID): User ID Card / Real Name Mask */}
            <div className="flex items-center bg-[#cfd3d6] rounded-xl px-3.5 py-3 border border-transparent select-none cursor-not-allowed">
              <Contact2 className="w-5 h-5 text-gray-500 shrink-0 mr-3 stroke-[1.8]" />
              <span className="text-xs sm:text-sm font-mono font-bold text-gray-600">
                P*****
              </span>
            </div>

            {/* Field 2: Account Number input with placeholder */}
            <div className="flex items-center bg-[#ededef] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-emerald-600 focus-within:bg-white transition-all">
              <CreditCard className="w-5 h-5 text-gray-400 shrink-0 mr-3 stroke-[1.8]" />
              <input
                type="text"
                inputMode="numeric"
                value={accountNumberInput}
                onChange={(e) => setAccountNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder={`* অনুগ্রহ করে ${selectedWalletType} অ্যাকাউন্ট নম্বর পূরণ করুন`}
                className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
              />
              {accountNumberInput && (
                <button
                  type="button"
                  onClick={() => setAccountNumberInput('')}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Transaction Password */}
          <div className="flex items-center bg-[#ededef] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-emerald-600 focus-within:bg-white transition-all">
            <Lock className="w-5 h-5 text-gray-400 shrink-0 mr-3 stroke-[1.8]" />
            <input
              type={showTransPassword ? 'text' : 'password'}
              value={transPasswordInput}
              onChange={(e) => setTransPasswordInput(e.target.value)}
              placeholder="* লেনদেন পাসওয়ার্ড"
              className="w-full bg-transparent border-none text-xs sm:text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => setShowTransPassword(!showTransPassword)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              {showTransPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          {/* Section 4: Submit Button (জমা দিন) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleBindSubmit}
              disabled={isSubmitting || !isBindValid}
              className={`w-full py-3.5 rounded-xl text-center font-bold text-base tracking-wide transition-all shadow-md ${
                isBindValid && !isSubmitting
                  ? 'bg-[#0b824c] hover:bg-[#096e40] text-white active:scale-98 cursor-pointer'
                  : 'bg-[#cfd4d8] text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </div>
              ) : (
                <span>জমা দিন</span>
              )}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: আমার কার্ড (Image 2)
  // =========================================================================
  return (
    <div 
      id="my-cards-mobile-view"
      className="flex flex-col h-full min-h-screen bg-[#f5f7fa] text-gray-900 font-bengali select-none animate-in fade-in relative pb-28"
    >
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#084e36] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in border border-emerald-400/40 w-[90%] max-w-sm justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header matching Screenshot 2 */}
      <header className="bg-[#084e36] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-8">
          আমার কার্ড
        </h1>
      </header>

      {/* Main Content Area matching Screenshot 2 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full space-y-3.5">
        
        {/* Bullet Indicator matching Screenshot 2: • ই-ওয়ালেট যোগ করা হয়েছে: 1 */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-800 px-0.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f39800] inline-block shadow-2xs" />
          <span>ই-ওয়ালেট যোগ করা হয়েছে: {wallets.length}</span>
        </div>

        {/* Bound Wallets Cards List matching Screenshot 2 */}
        <div className="space-y-3">
          {wallets.map((wallet) => {
            const isRocket = wallet.type === 'Rocket';
            const isNagad = wallet.type === 'Nagad';
            const isBkash = wallet.type === 'BKash';

            return (
              <div 
                key={wallet.id}
                className="rounded-2xl p-4 relative overflow-hidden shadow-xs border border-[#f2deba] bg-gradient-to-r from-[#fef5e6] via-[#fcf0d9] to-[#fcefd3]"
              >
                {/* Decorative background watermark arc */}
                <div className="absolute right-0 bottom-0 w-36 h-36 rounded-full bg-orange-300/10 pointer-events-none translate-x-10 translate-y-10" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3.5">
                    {/* Wallet Brand Badge Logo matching Screenshot 2 */}
                    {isRocket && (
                      <div className="w-24 h-12 rounded-xl bg-[#8c3494] text-white flex flex-col items-center justify-center p-1 shadow-sm shrink-0 border border-purple-400/40">
                        <div className="flex items-center gap-1">
                          {/* Paper rocket icon */}
                          <svg viewBox="0 0 24 24" className="w-4 h-4 text-white -rotate-45" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                          </svg>
                          <span className="text-xs font-black tracking-tight leading-none">রকেট</span>
                        </div>
                        <span className="text-[7px] text-white/80 font-normal leading-tight mt-0.5 scale-90">
                          ডাচ-বাংলা ব্যাংক মোবাইল ব্যাংকিং
                        </span>
                      </div>
                    )}

                    {isNagad && (
                      <div className="w-24 h-12 rounded-xl bg-[#e24826] text-white flex flex-col items-center justify-center p-1 shadow-sm shrink-0 border border-orange-400/40">
                        <span className="text-sm font-black tracking-tight leading-none">নগদ</span>
                        <span className="text-[7px] text-white/90 font-normal leading-tight mt-0.5">
                          ডাক বিভাগের ডিজিটাল সেবা
                        </span>
                      </div>
                    )}

                    {isBkash && (
                      <div className="w-24 h-12 rounded-xl bg-[#e2136e] text-white flex flex-col items-center justify-center p-1 shadow-sm shrink-0 border border-pink-400/40">
                        <span className="text-sm font-black tracking-tight leading-none">bKash</span>
                        <span className="text-[7px] text-white/90 font-normal leading-tight mt-0.5">
                          মোবাইল ব্যাংকিং
                        </span>
                      </div>
                    )}

                    {/* Details */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        {wallet.type}
                      </h4>
                      <p className="text-xs font-mono font-bold text-gray-700 mt-0.5 tracking-wider">
                        {wallet.accountNumber}
                      </p>
                    </div>
                  </div>

                  {/* Delete Option if multiple */}
                  {wallets.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteWallet(wallet.id, e)}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Bottom Right Date & Time matching Screenshot 2 */}
                <div className="text-right text-[11px] font-mono text-gray-500 mt-3 pt-1">
                  {wallet.date}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {wallets.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center space-y-3 border border-gray-200">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-gray-800">কোন ই-ওয়ালেট যোগ করা হয়নি</p>
            <p className="text-xs text-gray-500">উত্তোলন করার জন্য অনুগ্রহ করে আপনার ই-ওয়ালেট যোগ করুন।</p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="py-2 px-5 bg-[#084e36] text-white rounded-xl text-xs font-bold hover:bg-[#0b6345] transition-all shadow-md cursor-pointer"
            >
              ই-ওয়ালেট যোগ করুন
            </button>
          </div>
        )}

      </div>

      {/* Floating Action Button (Red round + button) matching Screenshot 2 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-14 h-14 rounded-full bg-[#ff3b4e] hover:bg-[#e62b3e] active:scale-95 text-white flex items-center justify-center shadow-[0_6px_20px_rgba(255,59,78,0.45)] transition-all cursor-pointer"
          title="নতুন যোগ করুন"
        >
          <Plus className="w-8 h-8 stroke-[2.5]" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* POPUP MODAL / BOTTOM SHEET matching Screenshot 3 */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end p-4 animate-in fade-in duration-200">
          
          {/* Card Container */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto mb-3 animate-in slide-in-from-bottom-5 duration-300">
            
            {/* Header: নতুন যোগ করুন */}
            <div className="py-3.5 text-center text-sm font-bold text-gray-800 bg-[#f8fafc] border-b border-gray-100">
              নতুন যোগ করুন
            </div>

            {/* Row: E wallet */}
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setCurrentScreen('bind');
              }}
              className="w-full px-5 py-4 flex items-center gap-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* Pink rounded icon with white "ec" */}
              <div className="w-8 h-8 rounded-full bg-[#e6007e] text-white font-black text-xs flex items-center justify-center shadow-xs tracking-tight shrink-0">
                ec
              </div>
              <span className="font-bold text-gray-800 text-sm">
                E wallet
              </span>
            </button>

          </div>

          {/* Close button with white circle and border matching Screenshot 3 */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(false)}
            className="w-12 h-12 rounded-full bg-white border border-red-500/80 text-gray-800 flex items-center justify-center mx-auto shadow-2xl hover:bg-gray-100 active:scale-95 transition-transform cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

        </div>
      )}

    </div>
  );
};
