// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Shield, 
  Check, 
  HelpCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Edit3, 
  Lock, 
  CreditCard, 
  Key, 
  Calendar, 
  Award, 
  Gift, 
  CheckCircle2, 
  X,
  ShieldCheck,
  ChevronDown,
  Phone,
  Mail,
  Smartphone,
  Wallet,
  KeyRound,
  UserCheck,
  Sparkles,
  LockKeyhole,
  Trophy,
  Loader2,
  Trash2
} from 'lucide-react';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { MobileProfileView } from './MobileProfileView';
import { api } from '../services/api';

interface MyAccountSectionViewProps {
  user?: UserAccount;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenDailySignIn?: () => void;
  onOpenVip?: () => void;
  onOpenRewardCenter?: () => void;
  onOpenSuperValueReward?: () => void;
  onOpenBetRecord?: () => void;
  onOpenProfitLoss?: () => void;
  onOpenDepositRecord?: () => void;
  onOpenWithdrawRecord?: () => void;
  onOpenAccountRecord?: () => void;
  onOpenInvite?: () => void;
  onOpenMissions?: () => void;
  onOpenRebate?: () => void;
  onOpenMessages?: () => void;
  onOpenAppDownload?: () => void;
  onOpenCustomerService?: () => void;
  onLogout?: () => void;
  onUpdateUsername?: (newUsername: string) => void;
  onUserUpdate?: (updated: Partial<UserAccount>) => void;
  onClose?: () => void;
  onBack?: () => void;
}

type SecurityDrawerTab = 'profile' | 'password' | 'transPassword' | 'wallet' | null;

interface BoundWalletItem {
  id: string;
  type: 'Rocket' | 'Nagad' | 'BKash' | 'USDT';
  accountNumber: string;
  fullNumber?: string;
  date: string;
}

export const MyAccountSectionView: React.FC<MyAccountSectionViewProps> = ({
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenDailySignIn,
  onOpenVip,
  onOpenRewardCenter,
  onOpenSuperValueReward,
  onOpenBetRecord,
  onOpenProfitLoss,
  onOpenDepositRecord,
  onOpenWithdrawRecord,
  onOpenAccountRecord,
  onOpenInvite,
  onOpenMissions,
  onOpenRebate,
  onOpenMessages,
  onOpenAppDownload,
  onOpenCustomerService,
  onLogout,
  onUpdateUsername,
  onUserUpdate,
  onClose,
  onBack
}) => {
  const [userState, setUserState] = useState<UserAccount | undefined>(user);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(user?.username || '1615249856');
  const [isEditingUsername, setIsEditingUsername] = useState<boolean>(false);
  const [newUsernameInput, setNewUsernameInput] = useState<string>(username);
  
  // Active right side drawer tab: 'profile' (Capture.PNG) | 'password' (Capture2.PNG) | 'transPassword' (Capture3.PNG) | 'wallet' (Capture4.PNG)
  const [activeDrawer, setActiveDrawer] = useState<SecurityDrawerTab>(null);
  
  // Form states for Personal Info (Capture.PNG)
  const [realName, setRealName] = useState<string>(user?.realName || '');
  const [userId, setUserId] = useState<string>(user?.phone || user?.username || '888889922');
  const [nickname, setNickname] = useState<string>(user?.username || '');
  const [googleAccount, setGoogleAccount] = useState<string>(user?.email || '');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(
    user?.phone 
      ? (user.phone.length > 6 ? `${user.phone.substring(0, 6)}****` : `${user.phone}****`) 
      : '161524****'
  );

  // Sync with user prop
  useEffect(() => {
    if (user) {
      setUserState(user);
      if (user.username) {
        setUsername(user.username);
        setNickname(user.username);
        setNewUsernameInput(user.username);
      }
      if (user.realName) {
        setRealName(user.realName);
        setCardHolderName(user.realName);
      }
      if (user.email) {
        setEmail(user.email);
        setGoogleAccount(user.email);
      }
      if (user.phone) {
        setPhoneNumber(user.phone.length > 6 ? `${user.phone.substring(0, 6)}****` : `${user.phone}****`);
        setUserId(user.phone);
      }
    }
  }, [user]);

  // Password drawer states (Capture2.PNG)
  const [currentLoginPass, setCurrentLoginPass] = useState<string>('');
  const [newLoginPass, setNewLoginPass] = useState<string>('');
  const [confirmLoginPass, setConfirmLoginPass] = useState<string>('');
  const [showCurrentLoginPass, setShowCurrentLoginPass] = useState<boolean>(false);
  const [showNewLoginPass, setShowNewLoginPass] = useState<boolean>(false);
  const [showConfirmLoginPass, setShowConfirmLoginPass] = useState<boolean>(false);

  // Transaction Password drawer states (Capture3.PNG)
  const [currentTransPass, setCurrentTransPass] = useState<string>('');
  const [newTransPass, setNewTransPass] = useState<string>('');
  const [confirmTransPass, setConfirmTransPass] = useState<string>('');
  const [showCurrentTransPass, setShowCurrentTransPass] = useState<boolean>(false);
  const [showNewTransPass, setShowNewTransPass] = useState<boolean>(false);
  const [showConfirmTransPass, setShowConfirmTransPass] = useState<boolean>(false);

  // E-Wallet binding drawer states (Capture4.PNG)
  const [walletCategory, setWalletCategory] = useState<string>('E wallet');
  const [cardHolderName, setCardHolderName] = useState<string>(user?.realName || '');
  const [selectedWalletType, setSelectedWalletType] = useState<'Rocket' | 'Nagad' | 'BKash'>('Rocket');
  const [walletAccountNumber, setWalletAccountNumber] = useState<string>('');
  const [walletTransPass, setWalletTransPass] = useState<string>('');
  const [showWalletTransPass, setShowWalletTransPass] = useState<boolean>(false);

  // Registered wallets list
  const [boundWallets, setBoundWallets] = useState<BoundWalletItem[]>([
    {
      id: 'w-1',
      type: 'Rocket',
      accountNumber: '********0076',
      date: '২০২৬-০৮-৩০ ০০:৫৯:৫০'
    }
  ]);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [walletToDelete, setWalletToDelete] = useState<BoundWalletItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load registered wallets from server API and localStorage
  const loadWallets = async () => {
    try {
      const res = await api.wallet.getCards();
      if (res && res.success && Array.isArray(res.wallets) && res.wallets.length > 0) {
        const mapped: BoundWalletItem[] = res.wallets.map((w: any) => ({
          id: String(w.id),
          type: (w.type === 'bKash' || w.type === 'BKash') ? 'BKash' : (w.type === 'Nagad' ? 'Nagad' : (w.type === 'USDT' ? 'USDT' : 'Rocket')),
          accountNumber: w.accountNumber || (w.fullNumber ? `********${w.fullNumber.slice(-4)}` : '********0076'),
          fullNumber: w.fullNumber || '',
          date: w.createdAt ? new Date(w.createdAt).toISOString().replace('T', ' ').substring(0, 19) : '২০২৬-০৮-৩০ ০০:৫৯:৫০'
        }));
        setBoundWallets(mapped);
        try {
          localStorage.setItem('bengalbet_bound_cards_list', JSON.stringify(mapped));
        } catch {}
        return;
      }
    } catch (e) {
      console.error('Failed to load cards:', e);
    }

    try {
      const cached = localStorage.getItem('bengalbet_bound_cards_list');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBoundWallets(parsed.map((item: any) => ({
            id: item.id || `w-${Date.now()}`,
            type: (item.type === 'bKash' || item.type === 'BKash') ? 'BKash' : (item.type === 'Nagad' ? 'Nagad' : 'Rocket'),
            accountNumber: item.accountNumber || (item.fullNumber ? `********${item.fullNumber.slice(-4)}` : '********0076'),
            fullNumber: item.fullNumber || '',
            date: item.boundAt || item.date || '২০২৬-০৮-৩০ ০০:৫৯:৫০'
          })));
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadWallets();
  }, []);

  // Dynamic Real-time Security Score & Status
  const isProfileComplete = Boolean(realName && realName.trim().length > 0);
  const isWalletBound = boundWallets.length > 0;
  const isLoginPassSet = true;
  const isTxnPassSet = Boolean(userState?.hasTransactionPassword || userState?.transactionPassword);

  const securityScore = useMemo(() => {
    let completed = 0;
    if (isProfileComplete) completed++;
    if (isWalletBound) completed++;
    if (isLoginPassSet) completed++;
    if (isTxnPassSet) completed++;

    let percent = 25;
    if (completed === 1) percent = 25;
    else if (completed === 2) percent = 50;
    else if (completed === 3) percent = 75;
    else if (completed === 4) percent = 100;

    let label = 'নিম্ন';
    let ringGlow = 'from-red-500/40 via-orange-400/30 to-amber-500/40';
    let ringGradient = 'from-red-500 via-orange-400 to-amber-500';
    let textColor = 'text-red-500';
    let textLabel = 'আপনার অ্যাকাউন্ট নিরাপত্তা স্তর হল নিম্ন';

    if (percent === 100) {
      label = 'উচ্চ';
      ringGlow = 'from-emerald-400/40 via-teal-400/30 to-cyan-500/40';
      ringGradient = 'from-emerald-400 via-teal-400 to-cyan-500';
      textColor = 'text-emerald-600';
      textLabel = 'আপনার অ্যাকাউন্ট সম্পূর্ণ সুরক্ষিত! সকল নিরাপত্তা উপাদান সক্রিয়';
    } else if (percent >= 75) {
      label = 'ভালো';
      ringGlow = 'from-cyan-400/40 via-blue-400/30 to-indigo-500/40';
      ringGradient = 'from-cyan-400 via-blue-400 to-indigo-500';
      textColor = 'text-cyan-600';
      textLabel = 'আপনার অ্যাকাউন্ট নিরাপত্তা স্তর হল ভালো';
    } else if (percent >= 50) {
      label = 'মধ্য';
      ringGlow = 'from-cyan-400/40 via-amber-400/30 to-blue-500/40';
      ringGradient = 'from-cyan-400 via-amber-400 to-blue-500';
      textColor = 'text-[#1e3a8a]';
      textLabel = 'আপনার অ্যাকাউন্ট নিরাপত্তা স্তর হল মধ্য';
    }

    return {
      percent,
      completed,
      label,
      ringGlow,
      ringGradient,
      textColor,
      textLabel
    };
  }, [isProfileComplete, isWalletBound, isLoginPassSet, isTxnPassSet]);

  const displayBalance = user?.balance ?? 0;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefreshBalance = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
    }, 600);
  };

  const handleSaveUsername = async () => {
    if (newUsernameInput.trim()) {
      setIsSaving(true);
      try {
        await api.auth.updateProfile({ username: newUsernameInput.trim() });
        setUsername(newUsernameInput.trim());
        if (onUpdateUsername) {
          onUpdateUsername(newUsernameInput.trim());
        }
        if (onUserUpdate) {
          onUserUpdate({ username: newUsernameInput.trim() });
        }
        setIsEditingUsername(false);
        showToast('ইউজারনেম সফলভাবে পরিবর্তন হয়েছে!');
      } catch (err: any) {
        showToast(err.message || 'ইউজারনেম পরিবর্তন ব্যর্থ হয়েছে');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Real Submit Handlers with Backend Validation
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!realName.trim()) {
      showToast('অনুগ্রহ করে প্রত্যাহারকারীর নাম দিন');
      return;
    }

    setIsSaving(true);
    try {
      const res: any = await api.auth.updateProfile({
        realName: realName.trim(),
        username: nickname.trim() || username,
        email: email.trim() || undefined
      });

      if (res && res.success !== false) {
        showToast('ব্যক্তিগত তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
        if (nickname.trim()) {
          setUsername(nickname.trim());
          if (onUpdateUsername) onUpdateUsername(nickname.trim());
        }
        const updated = {
          realName: realName.trim(),
          username: nickname.trim() || username,
          email: email.trim() || undefined
        };
        setUserState(prev => prev ? ({ ...prev, ...updated }) : prev);
        if (onUserUpdate) onUserUpdate(updated);
        setActiveDrawer(null);
      } else {
        showToast(res?.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLoginPass.trim()) {
      showToast('অনুগ্রহ করে বর্তমান পাসওয়ার্ড লিখুন');
      return;
    }
    if (!newLoginPass.trim()) {
      showToast('অনুগ্রহ করে নতুন পাসওয়ার্ড দিন');
      return;
    }
    if (newLoginPass.length < 6 || newLoginPass.length > 12) {
      showToast('পাসওয়ার্ড ৬ - ১২ অক্ষরের হতে হবে');
      return;
    }
    if (newLoginPass !== confirmLoginPass) {
      showToast('উভয় নতুন পাসওয়ার্ড এক নয়');
      return;
    }
    if (currentLoginPass === newLoginPass) {
      showToast('নতুন পাসওয়ার্ড পূর্বের পাসওয়ার্ডের মতো হতে পারবে না');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.auth.changePassword(currentLoginPass, newLoginPass);
      if (res && res.success) {
        showToast('লগইন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setCurrentLoginPass('');
        setNewLoginPass('');
        setConfirmLoginPass('');
        setActiveDrawer(null);
      } else {
        showToast(res?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTransPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTxnPassSet && !currentTransPass.trim()) {
      showToast('অনুগ্রহ করে বর্তমান লেনদেন পাসওয়ার্ড লিখুন');
      return;
    }
    if (!newTransPass.trim()) {
      showToast('অনুগ্রহ করে নতুন লেনদেন পাসওয়ার্ড দিন');
      return;
    }
    if (newTransPass.length < 6 || newTransPass.length > 16) {
      showToast('লেনদেন পাসওয়ার্ড ৬ - ১৬ অক্ষরের হতে হবে');
      return;
    }
    if (newTransPass !== confirmTransPass) {
      showToast('উভয় লেনদেন পাসওয়ার্ড মিলছে না');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.auth.changeTransactionPassword(newTransPass, isTxnPassSet ? currentTransPass : undefined);
      if (res && res.success) {
        showToast('লেনদেন পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!');
        const updated = { hasTransactionPassword: true, transactionPassword: '******' };
        setUserState(prev => prev ? ({ ...prev, ...updated }) : prev);
        if (onUserUpdate) onUserUpdate(updated);
        setCurrentTransPass('');
        setNewTransPass('');
        setConfirmTransPass('');
        setActiveDrawer(null);
      } else {
        showToast(res?.message || 'লেনদেন পাসওয়ার্ড সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'লেনদেন পাসওয়ার্ড সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBindWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = walletAccountNumber.trim().replace(/[\s-]/g, '');
    if (!cleanNum || cleanNum.length < 11 || !cleanNum.startsWith('01')) {
      showToast('সঠিক বাংলাদেশি ওয়ালেট নম্বর দিন (যেমন: 01XXXXXXXXX)');
      return;
    }
    if (boundWallets.length >= 3) {
      showToast('সর্বোচ্চ ৩টি ই-ওয়ালেট বাঁধতে পারবেন');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.wallet.addCard(
        selectedWalletType,
        cardHolderName.trim() || realName || username || 'আমার ওয়ালেট',
        cleanNum
      );

      if (res && res.success) {
        const maskedNum = cleanNum.length > 4 
          ? '********' + cleanNum.slice(-4) 
          : '********' + cleanNum;

        const newW: BoundWalletItem = {
          id: res.wallet?.id ? String(res.wallet.id) : `w-${Date.now()}`,
          type: selectedWalletType,
          accountNumber: maskedNum,
          fullNumber: cleanNum,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };

        const updated = [newW, ...boundWallets];
        setBoundWallets(updated);
        try {
          localStorage.setItem('bengalbet_bound_cards_list', JSON.stringify(updated));
        } catch {}
        setWalletAccountNumber('');
        setWalletTransPass('');
        showToast(`${selectedWalletType} ওয়ালেট সফলভাবে যুক্ত করা হয়েছে!`);
      } else {
        showToast(res?.message || 'ই-ওয়ালেট বাঁধন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(err.message || 'ই-ওয়ালেট বাঁধন ব্যর্থ হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWalletConfirm = async () => {
    if (!walletToDelete) return;
    setIsSaving(true);
    try {
      await api.wallet.deleteCard(walletToDelete.id);
      const updated = boundWallets.filter(w => w.id !== walletToDelete.id);
      setBoundWallets(updated);
      try {
        localStorage.setItem('bengalbet_bound_cards_list', JSON.stringify(updated));
      } catch {}
      showToast('ই-ওয়ালেট সফলভাবে সরানো হয়েছে');
    } catch {
      const updated = boundWallets.filter(w => w.id !== walletToDelete.id);
      setBoundWallets(updated);
      try {
        localStorage.setItem('bengalbet_bound_cards_list', JSON.stringify(updated));
      } catch {}
      showToast('ই-ওয়ালেট সরানো হয়েছে');
    } finally {
      setWalletToDelete(null);
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Dedicated Separate Mobile View matching Capture.PNG & Capture2.PNG */}
      <div className="block md:hidden w-full h-full">
        <MobileProfileView
          user={user}
          onOpenDeposit={onOpenDeposit}
          onOpenWithdraw={onOpenWithdraw}
          onOpenDailySignIn={onOpenDailySignIn}
          onOpenVip={onOpenVip}
          onOpenRewardCenter={onOpenRewardCenter}
          onOpenSuperValueReward={onOpenSuperValueReward}
          onOpenBetRecord={onOpenBetRecord}
          onOpenProfitLoss={onOpenProfitLoss}
          onOpenDepositRecord={onOpenDepositRecord}
          onOpenWithdrawRecord={onOpenWithdrawRecord}
          onOpenAccountRecord={onOpenAccountRecord}
          onOpenInvite={onOpenInvite}
          onOpenMissions={onOpenMissions}
          onOpenRebate={onOpenRebate}
          onOpenMessages={onOpenMessages}
          onOpenAppDownload={onOpenAppDownload}
          onOpenCustomerService={onOpenCustomerService}
          onLogout={onLogout}
          onUpdateUsername={onUpdateUsername}
          onClose={onClose}
          onBack={onBack}
        />
      </div>

      {/* Desktop View */}
      <main className="hidden md:flex flex-1 bg-[#f4f7f6] flex-col overflow-y-auto p-3 sm:p-5 text-gray-800 font-bengali select-none relative min-h-[520px]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#0c4a34] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-stretch relative">
        
        {/* ========================================================================= */}
        {/* LEFT CONTAINER: COLUMN 1 (PROFILE & STATS) + COLUMN 2 (SECURITY GAUGE) */}
        {/* ========================================================================= */}
        <div className={`transition-all duration-300 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch ${
          activeDrawer ? 'lg:max-w-[48%] xl:max-w-[46%]' : 'w-full'
        }`}>
          
          {/* ========================================================================= */}
          {/* COLUMN 1: USER PROFILE, BALANCE, STATS & LOGS */}
          {/* ========================================================================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs flex flex-col justify-between">
            
            <div>
              {/* User Header */}
              <div className="flex items-start gap-3.5 pb-3.5 border-b border-gray-100">
                {/* Avatar with circular frame */}
                <div className="relative shrink-0">
                  <img 
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                    alt="User Avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/40 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                </div>

                {/* User meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* VIP Level Badge */}
                    <button
                      type="button"
                      onClick={onOpenVip}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-slate-600 via-gray-500 to-slate-700 text-white text-[9px] font-black tracking-wider shadow-2xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                      title="ভিআইপি লেভেল বিস্তারিত (VIP Level Details)"
                    >
                      <Award className="w-2.5 h-2.5 text-slate-200" />
                      VIP0
                    </button>
                    {/* Gift Icon / Daily Sign-in Button */}
                    <button
                      type="button"
                      onClick={onOpenDailySignIn}
                      className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 text-amber-600 flex items-center justify-center text-[10px] shadow-2xs hover:scale-115 active:scale-95 hover:bg-amber-200 transition-all cursor-pointer border border-amber-300/60"
                      title="সাইন ইন বোনাস (Daily Sign-In Bonus)"
                    >
                      <Gift className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Username + Edit button */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight font-mono">{username}</span>
                    <button 
                      onClick={() => setIsEditingUsername(true)}
                      className="p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                      title="ইউজারনেম পরিবর্তন করুন"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Join date */}
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>যোগদান করেছেন ২০২৬-০৮-২৬</span>
                  </div>
                </div>
              </div>

              {/* Account ID Subline - 9 Digit User ID */}
              <div className="pt-2.5 pb-0.5 flex items-center gap-1.5 text-xs text-gray-500 font-mono">
                <span className="font-semibold text-gray-600">ID:</span>
                <span className="font-bold text-gray-800 tracking-wider">
                  888889922
                </span>
                <span title="ইউজার আইডি (৯ ডিজিট)" className="inline-flex items-center cursor-pointer">
                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                </span>
              </div>

              {/* Big Main Balance */}
              <div className="flex items-baseline justify-between py-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-gray-900 font-mono tracking-tight">
                    ৳ {showBalance ? displayBalance.toFixed(2) : '••••••'}
                  </span>
                </div>

                {/* Refresh & Show/Hide Controls */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleRefreshBalance}
                    className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-transform cursor-pointer ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`}
                    title="ব্যালেন্স রিফ্রেশ করুন"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
                    title={showBalance ? "ব্যালেন্স লুকান" : "ব্যালেন্স দেখুন"}
                  >
                    {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2 Activity Progress Rows */}
              <div className="mt-2.5 space-y-2">
                {/* Row 1: Deposit request status */}
                <button
                  type="button"
                  onClick={onOpenDepositRecord}
                  className="w-full text-left p-2.5 rounded-xl bg-blue-50/80 border border-blue-100/90 flex items-center justify-between gap-3 transition-all hover:bg-blue-100/70 hover:border-blue-200 cursor-pointer group"
                  title="জমা রেকর্ড দেখুন"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 leading-snug">
                        জমা দেওয়া রেকর্ড ও রসিদ
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">বিস্তারিত দেখতে ক্লিক করুন</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    রেকর্ড &rarr;
                  </span>
                </button>

                {/* Row 2: Withdraw request status */}
                <button
                  type="button"
                  onClick={onOpenWithdrawRecord}
                  className="w-full text-left p-2.5 rounded-xl bg-amber-50/80 border border-amber-100/90 flex items-center justify-between gap-3 transition-all hover:bg-amber-100/70 hover:border-amber-200 cursor-pointer group"
                  title="উত্তোলন রেকর্ড দেখুন"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800 leading-snug">
                        উত্তোলন রেকর্ড ও স্ট্যাটাস
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">বিস্তারিত দেখতে ক্লিক করুন</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-md group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    রেকর্ড &rarr;
                  </span>
                </button>
              </div>

              {/* 3 Quick Record Navigation Shortcuts for Desktop */}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center font-bengali">
                <button
                  type="button"
                  onClick={onOpenBetRecord}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200/70 hover:border-emerald-300 transition-all cursor-pointer group flex flex-col items-center justify-center"
                  title="বেটিং রেকর্ড খুলুন"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 group-hover:text-emerald-700">বেটিং রেকর্ড</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenAccountRecord}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200/70 hover:border-blue-300 transition-all cursor-pointer group flex flex-col items-center justify-center"
                  title="অ্যাকাউন্ট রেকর্ড খুলুন"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 group-hover:text-blue-700">অ্যাকাউন্ট রেকর্ড</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenProfitLoss}
                  className="p-2 rounded-xl bg-gray-50 hover:bg-purple-50 border border-gray-200/70 hover:border-purple-300 transition-all cursor-pointer group flex flex-col items-center justify-center"
                  title="লাভ ও ক্ষতি ব্যক্তিগত প্রতিবেদন খুলুন"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold text-gray-800 group-hover:text-purple-700">লাভ ও ক্ষতি</span>
                </button>
              </div>
            </div>

            {/* Bottom Security / Login logs matching Capture.PNG */}
            <div className="pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5 fill-red-100" />
                </div>
                <div className="text-[10px] sm:text-[11px] leading-tight space-y-0.5 text-gray-600">
                  <div className="font-semibold text-gray-800">
                    শেষ লগইন সময়: <span className="font-mono text-gray-700">{userState?.lastLogin || '২০২৬-০৮-৩০ ১৩:০৪:৫৪'}</span>
                  </div>
                  <div className="text-gray-500">
                    শেষ লগইন আইপি: <span className="font-mono text-gray-700">{userState?.lastLoginIp || '123.253.38.97'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: ACCOUNT SECURITY GAUGE & 4 INTERACTIVE DOCK ICONS */}
          {/* ========================================================================= */}
          <div className="rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between border border-blue-900/40 bg-gradient-to-b from-[#1b254b] via-[#141d3c] to-[#dbeefd] relative">
            
            {/* 4 Interactive Vertical Floating Security Icons on the Right Edge (SWEET / BEST PREMIUM DOCK) */}
            <div className="absolute top-8 right-3 flex flex-col gap-3 z-20">
              
              {/* 1. Golden Amber Spherical: ব্যক্তিগত তথ্য */}
              <div className="relative group flex items-center justify-end">
                <span className={`mr-2.5 px-2.5 py-1 rounded-lg bg-[#0d1c3a]/95 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[11px] font-bold shadow-xl whitespace-nowrap transition-all duration-200 ${
                  activeDrawer === 'profile' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'
                }`}>
                  ব্যক্তিগত তথ্য
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(activeDrawer === 'profile' ? null : 'profile')}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-115 active:scale-95 cursor-pointer shadow-[0_6px_16px_rgba(245,158,11,0.45)] ${
                    activeDrawer === 'profile'
                      ? 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 ring-2 ring-white ring-offset-2 ring-offset-[#141d3c] scale-110'
                      : 'bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 ring-1 ring-amber-200/70 hover:brightness-110'
                  }`}
                  title="ব্যক্তিগত তথ্য"
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
                  <UserCheck className="w-5 h-5 drop-shadow-sm text-slate-900" strokeWidth={2.5} />
                  {isProfileComplete && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141d3c] flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>

              {/* 2. Cyan Teal Spherical: লগইন পাসওয়ার্ড */}
              <div className="relative group flex items-center justify-end">
                <span className={`mr-2.5 px-2.5 py-1 rounded-lg bg-[#0d1c3a]/95 backdrop-blur-md text-cyan-300 border border-cyan-400/40 text-[11px] font-bold shadow-xl whitespace-nowrap transition-all duration-200 ${
                  activeDrawer === 'password' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'
                }`}>
                  লগইন পাসওয়ার্ড
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(activeDrawer === 'password' ? null : 'password')}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_6px_16px_rgba(6,182,212,0.45)] ${
                    activeDrawer === 'password'
                      ? 'bg-gradient-to-tr from-teal-500 via-cyan-400 to-sky-300 ring-2 ring-white ring-offset-2 ring-offset-[#141d3c] scale-110'
                      : 'bg-gradient-to-tr from-teal-500 via-cyan-400 to-sky-300 ring-1 ring-cyan-200/70 hover:brightness-110'
                  }`}
                  title="লগইন পাসওয়ার্ড"
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
                  <LockKeyhole className="w-4.5 h-4.5 drop-shadow-sm text-slate-900" strokeWidth={2.5} />
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141d3c] flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" strokeWidth={3} />
                  </span>
                </button>
              </div>

              {/* 3. Magenta Pink Spherical: ই-ওয়ালেট বাঁধুন */}
              <div className="relative group flex items-center justify-end">
                <span className={`mr-2.5 px-2.5 py-1 rounded-lg bg-[#0d1c3a]/95 backdrop-blur-md text-pink-300 border border-pink-400/40 text-[11px] font-bold shadow-xl whitespace-nowrap transition-all duration-200 ${
                  activeDrawer === 'wallet' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'
                }`}>
                  ই-ওয়ালেট বাঁধুন
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(activeDrawer === 'wallet' ? null : 'wallet')}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_6px_16px_rgba(244,63,94,0.45)] ${
                    activeDrawer === 'wallet'
                      ? 'bg-gradient-to-tr from-pink-600 via-rose-500 to-red-400 ring-2 ring-white ring-offset-2 ring-offset-[#141d3c] scale-110'
                      : 'bg-gradient-to-tr from-pink-600 via-rose-500 to-red-400 ring-1 ring-pink-200/70 hover:brightness-110'
                  }`}
                  title="ই-ওয়ালেট বাঁধুন"
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
                  <Wallet className="w-4.5 h-4.5 drop-shadow-sm text-white" strokeWidth={2.4} />
                  {isWalletBound && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141d3c] flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>

              {/* 4. Royal Gold Spherical: লেনদেন পাসওয়ার্ড */}
              <div className="relative group flex items-center justify-end">
                <span className={`mr-2.5 px-2.5 py-1 rounded-lg bg-[#0d1c3a]/95 backdrop-blur-md text-amber-200 border border-amber-400/40 text-[11px] font-bold shadow-xl whitespace-nowrap transition-all duration-200 ${
                  activeDrawer === 'transPassword' 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none'
                }`}>
                  লেনদেন পাসওয়ার্ড
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(activeDrawer === 'transPassword' ? null : 'transPassword')}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer shadow-[0_6px_16px_rgba(234,179,8,0.45)] ${
                    activeDrawer === 'transPassword'
                      ? 'bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 ring-2 ring-white ring-offset-2 ring-offset-[#141d3c] scale-110'
                      : 'bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 ring-1 ring-amber-200/70 hover:brightness-110'
                  }`}
                  title="লেনদেন পাসওয়ার্ড"
                >
                  <span className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></span>
                  <KeyRound className="w-4.5 h-4.5 drop-shadow-sm text-slate-900" strokeWidth={2.5} />
                  {isTxnPassSet && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#141d3c] flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Top glowing circle section */}
            <div 
              className="p-5 sm:p-6 flex flex-col items-center justify-center text-center cursor-pointer group select-none"
              onClick={(e) => {
                e.preventDefault();
                if (onOpenSuperValueReward) onOpenSuperValueReward();
              }}
              title="BengalBet সুপার ভ্যালু রিওয়ার্ড খুলুন (Super Value Reward ৳৩০০)"
            >
              
              {/* Glowing Top Floating Super Value Reward Badge */}
              <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-[11px] font-black shadow-[0_4px_14px_rgba(245,158,11,0.5)] border border-yellow-200 group-hover:scale-105 transition-transform animate-pulse">
                <Gift className="w-3.5 h-3.5 text-yellow-100 animate-spin duration-3000" />
                <span className="tracking-wide drop-shadow-xs">সুপার ভ্যালু রিওয়ার্ড ৳৩০০</span>
                <Sparkles className="w-3 h-3 text-yellow-200" />
              </div>

              {/* Glowing Neon Circular Gauge (TARGET ELEMENT) */}
              <div 
                className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center my-1 group-hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.4)]"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenSuperValueReward) onOpenSuperValueReward();
                }}
              >
                {/* Outer Glow Blur */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${securityScore.ringGlow} blur-md animate-pulse group-hover:blur-lg transition-all`}></div>
                
                {/* Outer Gradient Ring */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${securityScore.ringGradient} p-1 shadow-lg group-hover:p-1.5 transition-all`}>
                  <div className="w-full h-full bg-[#141d3c] rounded-full"></div>
                </div>

                {/* Inner White Circle */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-inner flex flex-col items-center justify-center z-10 border-4 border-cyan-100 group-hover:border-amber-300 group-hover:bg-amber-50/60 transition-all">
                  <span className={`text-xl sm:text-2xl font-black ${securityScore.textColor} tracking-tight group-hover:text-amber-700 transition-colors`}>
                    {securityScore.label}
                  </span>
                  <span className="text-[10px] font-bold text-sky-600 mt-0.5 group-hover:text-amber-600">নিরাপত্তা স্তর</span>
                </div>

                {/* Pulsing Click Sparkle overlay on bottom-right of gauge */}
                <div className="absolute -bottom-1 -right-1 z-20 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border-2 border-white shadow-md flex items-center justify-center text-white text-xs">
                  <Trophy className="w-3.5 h-3.5 text-yellow-100" />
                </div>
              </div>

              {/* Score & status text */}
              <div className="mt-2.5 space-y-0.5 text-white">
                <div className="text-xs sm:text-sm font-extrabold tracking-wide">
                  স্কোর হল <span className="text-cyan-300 font-mono text-base font-black group-hover:text-yellow-300 transition-colors">{securityScore.percent}</span> পয়েন্ট
                </div>
                <div className="text-[11px] sm:text-xs text-blue-200 font-medium flex items-center justify-center gap-1 text-center px-2">
                  <span>{securityScore.textLabel}</span>
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse shrink-0" />
                </div>
                <div className="pt-1.5 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                    <span>বোনাস দাবি করতে ট্যাপ করুন</span>
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Recommended Settings Banner matching Capture.PNG */}
            <div className="p-3.5 bg-white/90 backdrop-blur-xs border-t border-blue-100 flex flex-col items-center text-center">
              <span className="text-[11px] font-extrabold text-blue-950 mb-1.5">পরামর্শিত সেটিং</span>
              <button
                type="button"
                onClick={() => setActiveDrawer('profile')}
                className="flex flex-col items-center gap-1 text-gray-700 hover:text-emerald-700 transition-transform hover:scale-105 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-800">ব্যক্তিগত তথ্য</span>
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT DRAWER / SLIDING PANEL (ACTIVE WHEN ANY SECURITY BUTTON IS CLICKED) */}
        {/* ========================================================================= */}
        {activeDrawer && (
          <div className="w-full lg:w-[52%] xl:w-[54%] bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg flex flex-col justify-between relative animate-in fade-in slide-in-from-right-4">
            
            {/* Top Red Close Button matching Capture.PNG / Capture2.PNG / Capture3.PNG / Capture4.PNG */}
            <button
              type="button"
              onClick={() => setActiveDrawer(null)}
              className="absolute -top-2.5 -left-2.5 lg:-top-3 lg:-left-3 w-7 h-7 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-30"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            {/* ===================================================================== */}
            {/* 1. ব্যক্তিগত তথ্য (Capture.PNG) */}
            {/* ===================================================================== */}
            {activeDrawer === 'profile' && (
              <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  {/* Header with Green Accent Bar */}
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full"></span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">ব্যক্তিগত তথ্য</h3>
                  </div>

                  {/* Profile Avatar in round frame */}
                  <div className="py-3 flex items-center">
                    <img 
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                      alt="User Avatar"
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Input Rows matching Capture.PNG */}
                  <div className="space-y-2.5 text-xs sm:text-sm">
                    
                    {/* Row 1: প্রত্যাহারকারীরনাম */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">প্রত্যাহারকারীরনাম:</label>
                      <input
                        type="text"
                        value={realName}
                        onChange={(e) => setRealName(e.target.value)}
                        placeholder="P*****"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Row 2: ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">ID :</label>
                      <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="অনুগ্রহ করে 1 - 20 অক্ষর লিখুন"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Row 3: ডাকনাম */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">ডাকনাম:</label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="অনুগ্রহ করে 1 - 255 অক্ষর লিখুন"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Row 4: Google */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">Google :</label>
                      <input
                        type="text"
                        value={googleAccount}
                        onChange={(e) => setGoogleAccount(e.target.value)}
                        placeholder="অনুগ্রহ করে Google নির্বাচন করুন"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Row 5: ইমেইল */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">ইমেইল:</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="অনুগ্রহ করে 1 - 255 অক্ষর লিখুন"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Row 6: *ফোন নম্বর */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">*ফোন নম্বর:</label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="161524****"
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                      />
                    </div>

                  </div>
                </div>

                {/* Bottom Submit Red Pill Button matching Capture.PNG */}
                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      'জমা দিন'
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* ===================================================================== */}
            {/* 2. লগইন পাসওয়ার্ড পরিবর্তন করুন (Capture2.PNG) */}
            {/* ===================================================================== */}
            {activeDrawer === 'password' && (
              <form onSubmit={handleSaveLoginPassword} className="flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  {/* Header with Green Accent Bar */}
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full"></span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">লগইন পাসওয়ার্ড পরিবর্তন করুন</h3>
                  </div>

                  {/* Input Rows matching Capture2.PNG */}
                  <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
                    
                    {/* Row 1: বর্তমান পাসওয়ার্ড */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">বর্তমান পাসওয়ার্ড:</label>
                      <div className="flex-1 relative">
                        <input
                          type={showCurrentLoginPass ? 'text' : 'password'}
                          value={currentLoginPass}
                          onChange={(e) => setCurrentLoginPass(e.target.value)}
                          placeholder="বর্তমান পাসওয়ার্ড পূরণ করুন"
                          className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentLoginPass(!showCurrentLoginPass)}
                          className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Row 2: নতুন পাসওয়ার্ড */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">নতুন পাসওয়ার্ড:</label>
                      <div className="flex-1 relative">
                        <input
                          type={showNewLoginPass ? 'text' : 'password'}
                          value={newLoginPass}
                          onChange={(e) => setNewLoginPass(e.target.value)}
                          placeholder="নতুন পাসওয়ার্ড (৬-১২ অক্ষর)"
                          className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewLoginPass(!showNewLoginPass)}
                          className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showNewLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Row 3: পাসওয়ার্ড নিশ্চিত করুন */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">পাসওয়ার্ড নিশ্চিত করুন:</label>
                      <div className="flex-1 relative">
                        <input
                          type={showConfirmLoginPass ? 'text' : 'password'}
                          value={confirmLoginPass}
                          onChange={(e) => setConfirmLoginPass(e.target.value)}
                          placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                          className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-teal-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmLoginPass(!showConfirmLoginPass)}
                          className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Submit Red Pill Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>পরিবর্তন হচ্ছে...</span>
                      </>
                    ) : (
                      'জমা দিন'
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* ===================================================================== */}
            {/* 3. লেনদেন পাসওয়ার্ড (Capture3.PNG) */}
            {/* ===================================================================== */}
            {activeDrawer === 'transPassword' && (
              <form onSubmit={handleSaveTransPassword} className="flex-1 flex flex-col justify-between space-y-4">
                
                <div>
                  {/* Header with Green Accent Bar */}
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full"></span>
                    <h3 className="font-extrabold text-sm sm:text-base text-gray-900">লেনদেন পাসওয়ার্ড</h3>
                  </div>

                  {/* Helper hint */}
                  {!isTxnPassSet && (
                    <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px]">
                      প্রথমবার লেনদেন পাসওয়ার্ড সেট করছেন। টাকা উত্তোলন করার জন্য এটি আবশ্যক।
                    </div>
                  )}

                  {/* Input Rows matching Capture3.PNG */}
                  <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
                    
                    {/* Row 1: বর্তমান পাসওয়ার্ড (required only if already set) */}
                    {isTxnPassSet && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-36 text-xs font-semibold text-gray-600">বর্তমান পাসওয়ার্ড:</label>
                        <div className="flex-1 relative">
                          <input
                            type={showCurrentTransPass ? 'text' : 'password'}
                            value={currentTransPass}
                            onChange={(e) => setCurrentTransPass(e.target.value)}
                            placeholder="বর্তমান লেনদেন পাসওয়ার্ড লিখুন"
                            className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentTransPass(!showCurrentTransPass)}
                            className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentTransPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Row 2: নতুন পাসওয়ার্ড */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">নতুন পাসওয়ার্ড:</label>
                      <div className="flex-1 relative">
                        <input
                          type={showNewTransPass ? 'text' : 'password'}
                          value={newTransPass}
                          onChange={(e) => setNewTransPass(e.target.value)}
                          placeholder="নতুন লেনদেন পাসওয়ার্ড (৬-১৬ অক্ষর)"
                          className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewTransPass(!showNewTransPass)}
                          className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showNewTransPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Row 3: পাসওয়ার্ড নিশ্চিত করুন */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <label className="sm:w-36 text-xs font-semibold text-gray-600">পাসওয়ার্ড নিশ্চিত করুন:</label>
                      <div className="flex-1 relative">
                        <input
                          type={showConfirmTransPass ? 'text' : 'password'}
                          value={confirmTransPass}
                          onChange={(e) => setConfirmTransPass(e.target.value)}
                          placeholder="নতুন লেনদেন পাসওয়ার্ড পুনরায় লিখুন"
                          className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmTransPass(!showConfirmTransPass)}
                          className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmTransPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Submit Red Pill Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-2.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>সংরক্ষণ হচ্ছে...</span>
                      </>
                    ) : (
                      'জমা দিন'
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* ===================================================================== */}
            {/* 4. ই-ওয়ালেট বাঁধুন (Capture4.PNG) */}
            {/* ===================================================================== */}
            {activeDrawer === 'wallet' && (
              <div className="flex-1 flex flex-col xl:flex-row gap-5 items-stretch">
                
                {/* Left Sub-Panel: Bind Form */}
                <form onSubmit={handleBindWallet} className="flex-1 flex flex-col justify-between space-y-3">
                  
                  <div>
                    {/* Header with Green Accent Bar */}
                    <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                      <span className="w-1.5 h-4.5 bg-emerald-500 rounded-full"></span>
                      <h3 className="font-extrabold text-sm sm:text-base text-gray-900">ই-ওয়ালেট বাঁধুন</h3>
                    </div>

                    <div className="mt-3 space-y-2.5 text-xs">
                      
                      {/* Row 1: ই-ওয়ালেট (Dropdown) */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <label className="sm:w-28 text-xs font-semibold text-gray-600">ই-ওয়ালেট:</label>
                        <div className="flex-1 relative">
                          <select
                            value={walletCategory}
                            onChange={(e) => setWalletCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 appearance-none focus:outline-none focus:border-pink-600 focus:bg-white"
                          >
                            <option value="E wallet">E wallet</option>
                            <option value="Bank Card">Bank Card</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 right-2.5 pointer-events-none" />
                        </div>
                      </div>

                      {/* Row 2: কার্ডের নাম */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <label className="sm:w-28 text-xs font-semibold text-gray-600">কার্ডের নাম:</label>
                        <input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="P*****"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-pink-600 focus:bg-white"
                        />
                      </div>

                      {/* Row 3: ই-ওয়ালেট প্রকার (3 Stacked Buttons) */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                        <label className="sm:w-28 text-xs font-semibold text-gray-600 pt-1.5">ই-ওয়ালেট প্রকার:</label>
                        <div className="flex-1 space-y-1.5">
                          {(['Rocket', 'Nagad', 'BKash'] as const).map((type) => {
                            const isSelected = selectedWalletType === type;
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setSelectedWalletType(type)}
                                className={`w-full py-2 rounded-lg border text-xs font-bold transition-all text-center cursor-pointer ${
                                  isSelected
                                    ? 'border-red-500 text-red-600 bg-white ring-1 ring-red-300'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {type}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Row 4: ওয়ালেট ঠিকানা */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <label className="sm:w-28 text-xs font-semibold text-gray-600">ওয়ালেট ঠিকানা:</label>
                        <input
                          type="text"
                          value={walletAccountNumber}
                          onChange={(e) => setWalletAccountNumber(e.target.value)}
                          placeholder={`অনুগ্রহ করে ${selectedWalletType} অ্যাকাউন্ট নম্বর পূরণ করুন`}
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-pink-600 focus:bg-white"
                        />
                      </div>

                      {/* Row 5: লেনদেন পাসওয়ার্ড */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <label className="sm:w-28 text-xs font-semibold text-gray-600">লেনদেন পাসওয়ার্ড:</label>
                        <div className="flex-1 relative">
                          <input
                            type={showWalletTransPass ? 'text' : 'password'}
                            value={walletTransPass}
                            onChange={(e) => setWalletTransPass(e.target.value)}
                            placeholder="লেনদেন পাসওয়ার্ড পূরণ করুন"
                            className="w-full px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:border-pink-600 focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowWalletTransPass(!showWalletTransPass)}
                            className="absolute top-1/2 -translate-y-1/2 right-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showWalletTransPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Bottom Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-7 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>যুক্ত হচ্ছে...</span>
                        </>
                      ) : (
                        'জমা দিন'
                      )}
                    </button>
                  </div>

                </form>

                {/* Right Sub-Panel: Registered Wallets List (Capture4.PNG) */}
                <div className="xl:w-64 shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200 pt-3 xl:pt-0 xl:pl-4">
                  
                  {/* Header with Red Accent Bar */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                    <span className="w-1.5 h-4.5 bg-red-500 rounded-full"></span>
                    <h3 className="font-extrabold text-xs sm:text-sm text-gray-900">
                      নিবন্ধিত ই-ওয়ালেট ({boundWallets.length}/3)
                    </h3>
                  </div>

                  {/* Cards List */}
                  <div className="mt-3 space-y-2.5">
                    {boundWallets.length === 0 ? (
                      <div className="text-center py-6 text-xs text-gray-400">
                        কোনো ই-ওয়ালেট যুক্ত করা হয়নি
                      </div>
                    ) : (
                      boundWallets.map((wallet) => (
                        <div 
                          key={wallet.id}
                          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#fae8d8] via-[#fef2e8] to-[#fde5d0] border border-orange-200/80 shadow-xs flex items-center gap-3 relative group"
                        >
                          {/* Logo */}
                          <div className="w-12 h-9 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-2xs border border-purple-100">
                            <img 
                              src={wallet.type === 'Rocket' ? WALLET_LOGOS.Rocket : wallet.type === 'Nagad' ? WALLET_LOGOS.Nagad : WALLET_LOGOS.BKash} 
                              alt={wallet.type} 
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Account Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-extrabold text-xs text-gray-900">{wallet.type}</div>
                            <div className="font-mono text-xs font-bold text-gray-700 tracking-wider">{wallet.accountNumber}</div>
                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{wallet.date}</div>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setWalletToDelete(wallet)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Delete Wallet Confirmation Modal */}
      {walletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-gray-900">ই-ওয়ালেট মুছে ফেলতে চান?</h3>
              <p className="text-xs text-gray-600">
                {walletToDelete.type} ({walletToDelete.accountNumber}) অ্যাকাউন্টটি তালিকা থেকে সরিয়ে ফেলা হবে।
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWalletToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleDeleteWalletConfirm}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>হ্যাঁ, মুছুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Username Modal */}
      {isEditingUsername && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">ইউজারনেম পরিবর্তন</h3>
              <button onClick={() => setIsEditingUsername(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">নতুন ইউজারনেম</label>
              <input
                type="text"
                value={newUsernameInput}
                onChange={(e) => setNewUsernameInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingUsername(false)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveUsername}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
    </>
  );
};
