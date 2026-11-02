// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Mail, 
  Smartphone,
  CheckCircle2,
  Lock,
  Loader2
} from 'lucide-react';
import { UserAccount } from '../types';
import { api } from '../services/api';

interface AmarAccountMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onSuccess?: (message: string) => void;
  onUserUpdate?: (updated: Partial<UserAccount>) => void;
}

export const AmarAccountMobileView: React.FC<AmarAccountMobileViewProps> = ({
  user,
  onBack,
  onSuccess,
  onUserUpdate
}) => {
  const [withdrawerName, setWithdrawerName] = useState(user?.realName || '');
  const [validId, setValidId] = useState('');
  const [nickname, setNickname] = useState(user?.username || '');
  const [googleAccount, setGoogleAccount] = useState(user?.email || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.realName) setWithdrawerName(user.realName);
      if (user.username) setNickname(user.username);
      if (user.email) {
        setEmail(user.email);
        setGoogleAccount(user.email);
      }
    }
  }, [user]);

  // Masked phone / username matching Capture.PNG (e.g. 175234****)
  const rawUsername = user?.phone || user?.username || '1752348921';
  const maskedPhone = rawUsername.length > 6 
    ? `${rawUsername.substring(0, 6)}****` 
    : `${rawUsername}****`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawerName.trim()) {
      showToast('অনুগ্রহ করে প্রত্যাহারকারীর নাম দিন');
      return;
    }

    setIsSubmitting(true);
    try {
      const res: any = await api.auth.updateProfile({
        realName: withdrawerName.trim(),
        username: nickname.trim() || user?.username,
        email: email.trim() || undefined
      });

      if (res && res.success !== false) {
        showToast('আপনার অ্যাকাউন্টের তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
        if (onUserUpdate) {
          onUserUpdate({
            realName: withdrawerName.trim(),
            username: nickname.trim() || user?.username,
            email: email.trim() || user?.email
          });
        }
        if (onSuccess) {
          onSuccess('অ্যাকাউন্টের তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
        }
      } else {
        showToast(res?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="amar-account-mobile-view"
      className="flex flex-col h-full min-h-screen bg-white text-gray-900 font-bengali select-none animate-in fade-in"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0b3327] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in fade-in border border-emerald-500/40 w-[90%] max-w-sm justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER matching Capture.PNG / Capture2.PNG */}
      {/* Dark Forest Green Background (#0b3327) + Back Arrow + Centered Title */}
      {/* ========================================================================= */}
      <header className="bg-[#0b3327] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Title: আমার অ্যাকাউন্ট */}
        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-8">
          আমার অ্যাকাউন্ট
        </h1>
      </header>

      {/* ========================================================================= */}
      {/* 2. FORM BODY matching Capture.PNG / Capture2.PNG */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">
        
        {/* Username line: ব্যবহারকারীর নাম: 1752348921 */}
        <div className="flex flex-col gap-1.5 mb-4">
          <div className="text-sm font-extrabold text-gray-800 tracking-tight">
            ব্যবহারকারীর নাম: <span className="font-mono text-gray-900 font-bold ml-1">{rawUsername}</span>
          </div>
          {user?.email && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs w-fit">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="font-mono font-medium">{user?.email}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Field 1: Card/ID icon + placeholder: অনুগ্রহ করে প্রত্যাহারকারীর নাম */}
          <div>
            <div className="flex items-center bg-[#f0f2f5] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-gray-300 transition-colors">
              {/* ID / Name card icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="11" y2="8" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="7" y1="16" x2="14" y2="16" />
                <circle cx="15" cy="8" r="1.5" />
              </svg>
              <input
                type="text"
                value={withdrawerName}
                onChange={(e) => setWithdrawerName(e.target.value)}
                placeholder="অনুগ্রহ করে প্রত্যাহারকারীর নাম"
                className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
              />
            </div>

            {/* Red Warning text underneath Field 1 matching Capture.PNG */}
            <p className="text-[#ff0000] text-[11px] sm:text-xs font-bold mt-2 leading-relaxed px-0.5">
              আপনার আপলোড করা শংসাপত্রের সাথে সামঞ্জস্যপূর্ণ নামটি পূরণ করতে ভুলবেন না, অন্যথায় প্রত্যাহার ব্যর্থ হতে পারে।
            </p>
          </div>

          {/* Field 2: Shield/ID badge icon + placeholder: দয়া করে আপনার বৈধ আইডি পূরণ করুন */}
          <div className="flex items-center bg-[#f0f2f5] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-gray-300 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <rect x="8" y="9" width="8" height="6" rx="1" />
              <circle cx="12" cy="12" r="1" />
            </svg>
            <input
              type="text"
              value={validId}
              onChange={(e) => setValidId(e.target.value)}
              placeholder="দয়া করে আপনার বৈধ আইডি পূরণ করুন"
              className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden font-mono"
            />
          </div>

          {/* Field 3: User with pencil icon + placeholder: অনুগ্রহ করে ডাকনাম */}
          <div className="flex items-center bg-[#f0f2f5] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-gray-300 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M17 11l2 2 3-3" />
            </svg>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="অনুগ্রহ করে ডাকনাম"
              className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
            />
          </div>

          {/* Field 4: User with pencil / Google icon + placeholder: অনুগ্রহ করে Google */}
          <div className="flex items-center bg-[#f0f2f5] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-gray-300 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400 shrink-0 mr-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M16 16l4.5-4.5" />
            </svg>
            <input
              type="text"
              value={googleAccount}
              onChange={(e) => setGoogleAccount(e.target.value)}
              placeholder="অনুগ্রহ করে Google"
              className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
            />
          </div>

          {/* Field 5: Envelope / Mail icon + placeholder: অনুগ্রহ করে ইমেইল */}
          <div className="flex items-center bg-[#f0f2f5] rounded-xl px-3.5 py-3 border border-transparent focus-within:border-gray-300 transition-colors">
            <Mail className="w-5 h-5 text-gray-400 shrink-0 mr-3 stroke-[1.8]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="অনুগ্রহ করে ইমেইল"
              className="w-full bg-transparent border-none text-xs sm:text-sm font-medium text-gray-800 placeholder:text-gray-400 focus:outline-hidden"
            />
          </div>

          {/* Field 6 (Disabled / Readonly): Phone icon + 175234**** */}
          <div className="flex items-center bg-[#cfd4dc] rounded-xl px-3.5 py-3 border border-transparent select-none cursor-not-allowed">
            <Smartphone className="w-5 h-5 text-gray-500 shrink-0 mr-3 stroke-[1.8]" />
            <span className="text-xs sm:text-sm font-mono font-semibold text-gray-600">
              {maskedPhone}
            </span>
          </div>

          {/* Privacy Section matching Capture.PNG / Capture2.PNG */}
          <div className="pt-2 pb-2">
            <button
              type="button"
              className="text-[#1890ff] text-xs sm:text-sm font-bold hover:underline cursor-pointer block text-left"
            >
              আমরা আপনার গোপনীয়তা সম্পর্কে চিন্তা করি
            </button>
            <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed mt-1">
              সমস্ত ব্যবহারকারী তথ্য এনক্রিপ্ট করা হয় আপনার ব্যক্তিগত গোপনীয়তা রক্ষা করার জন্য।
            </p>
          </div>

          {/* Submit Button: জমা দিন */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#e52836] to-[#ff2638] hover:from-[#c71826] hover:to-[#e52836] active:scale-[0.99] text-white text-base font-bold shadow-[0_4px_14px_rgba(229,40,54,0.35)] transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-80 cursor-wait' : 'cursor-pointer'
              }`}
            >
              {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{isSubmitting ? 'সংরক্ষণ করা হচ্ছে...' : 'জমা দিন'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
