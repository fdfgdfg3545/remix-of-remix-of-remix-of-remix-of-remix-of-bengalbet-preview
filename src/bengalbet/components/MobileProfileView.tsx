// @ts-nocheck
import React, { useState } from 'react';
import { 
  ChevronLeft,
  X,
  CheckSquare,
  ChevronRight,
  Shield,
  Copy,
  Check,
  Edit3,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { UserAccount } from '../types';
import { WALLET_LOGOS } from '../data/providers';
import { AmarAccountMobileView } from './AmarAccountMobileView';
import { SecurityCenterMobileView } from './SecurityCenterMobileView';
import { InviteFriendsMobileView } from './InviteFriendsMobileView';
import { MissionMobileView } from './MissionMobileView';
import { MailMobileView } from './MailMobileView';
import { FeedbackMobileView } from './FeedbackMobileView';
import { CustomerServiceModal } from './CustomerServiceModal';
import { HelpCenterMobileView } from './HelpCenterMobileView';
import { RebateMobileView } from './RebateMobileView';
import { DepositMobileView } from './DepositMobileView';
import { WithdrawMobileView } from './WithdrawMobileView';
import { MyCardsMobileView } from './MyCardsMobileView';
import { VipMobileView } from './VipMobileView';
import { BetRecordView } from './BetRecordView';
import { ProfitLossView } from './ProfitLossView';
import { AccountRecordView } from './AccountRecordView';

interface MobileProfileViewProps {
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

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeSubModal, setActiveSubModal] = useState<'profile' | 'security' | 'invite' | 'mission' | 'wallet' | 'feedback' | 'help' | 'mail' | 'rebate' | 'deposit' | 'withdraw' | 'vip' | 'bet_record' | 'profit_loss' | 'account_record' | 'deposit_record' | 'withdraw_record' | null>(null);
  const [isCustomerServiceModalOpen, setIsCustomerServiceModalOpen] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.username || '1752348921');

  // Sub-modal states
  const [realName, setRealName] = useState('P*****');
  const [customId, setCustomId] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<'Rocket' | 'Nagad' | 'BKash'>('Rocket');
  const [walletNumber, setWalletNumber] = useState('');
  const [feedbackText, setFeedbackText] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('ব্যালেন্স সফলভাবে আপডেট করা হয়েছে!');
    }, 600);
  };

  const handleCopyId = () => {
    const textToCopy = user?.phone || user?.username || '1752348921';
    navigator.clipboard?.writeText(textToCopy);
    setIsCopied(true);
    showToast('আইডি কপি করা হয়েছে!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      if (onUpdateUsername) onUpdateUsername(nicknameInput.trim());
      setIsEditingNickname(false);
      showToast('ডাকনাম সফলভাবে সংরক্ষণ করা হয়েছে!');
    }
  };

  const balanceDisplay = user?.balance !== undefined 
    ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';

  const userIdDisplay = user?.phone || user?.username || '1752348921';

  if (activeSubModal === 'profile') {
    return (
      <AmarAccountMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onUserUpdate={onUserUpdate}
        onSuccess={(msg) => {
          showToast(msg);
          setActiveSubModal(null);
        }}
      />
    );
  }

  if (activeSubModal === 'security') {
    return (
      <SecurityCenterMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onLogout={onLogout}
        showToast={showToast}
        onUserUpdate={onUserUpdate}
      />
    );
  }

  if (activeSubModal === 'invite') {
    return (
      <InviteFriendsMobileView
        user={user!}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'mission') {
    return (
      <MissionMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'mail') {
    return (
      <MailMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'feedback') {
    return (
      <FeedbackMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'help') {
    return (
      <HelpCenterMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
        onOpenCustomerService={() => {
          setActiveSubModal(null);
          setIsCustomerServiceModalOpen(true);
        }}
      />
    );
  }

  if (activeSubModal === 'rebate') {
    return (
      <RebateMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'deposit') {
    return (
      <DepositMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        onOpenDepositRecord={() => {
          if (onOpenDepositRecord) {
            onOpenDepositRecord();
          }
        }}
        onOpenCustomerService={() => {
          setIsCustomerServiceModalOpen(true);
        }}
        onDepositSuccess={(amt, bonus, method) => {
          showToast(`৳${amt} জমার অনুরোধ পাঠানো হয়েছে। অ্যাডমিন অনুমোদনের পর ব্যালেন্সে যোগ হবে।`);
          if (onOpenDeposit) {
            // Also notify parent
          }
        }}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'wallet' || (activeSubModal as any) === 'card') {
    return (
      <MyCardsMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'withdraw') {
    return (
      <WithdrawMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
        onOpenWithdrawRecord={() => {
          if (onOpenWithdrawRecord) {
            onOpenWithdrawRecord();
          }
        }}
        onOpenCustomerService={() => {
          setIsCustomerServiceModalOpen(true);
        }}
        onWithdrawSuccess={(amt) => {
          showToast(`৳${amt} উত্তোলনের আবেদন পাঠানো হয়েছে। অ্যাডমিন অনুমোদনের অপেক্ষায়।`);
          if (onOpenWithdraw) {
            // Also notify parent
          }
        }}
        showToast={showToast}
      />
    );
  }

  if (activeSubModal === 'vip') {
    return (
      <VipMobileView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  if (activeSubModal === 'bet_record') {
    return (
      <BetRecordView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  if (activeSubModal === 'profit_loss') {
    return (
      <ProfitLossView
        user={user}
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  if (activeSubModal === 'account_record') {
    return (
      <AccountRecordView
        user={user}
        initialTab="transaction"
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  if (activeSubModal === 'deposit_record') {
    return (
      <AccountRecordView
        user={user}
        initialTab="deposit"
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  if (activeSubModal === 'withdraw_record') {
    return (
      <AccountRecordView
        user={user}
        initialTab="withdraw"
        onBack={() => setActiveSubModal(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <div 
      id="mobile-profile-full-view"
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none overflow-y-auto overscroll-contain pb-32"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0d2a1f] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Header Bar matching Capture.PNG */}
      <header className="bg-gradient-to-r from-[#1b221d] via-[#101914] to-[#1b221d] px-4 py-3 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <button
          type="button"
          onClick={() => {
            if (onBack) onBack();
            else if (onClose) onClose();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
          আমার অ্যাকাউন্ট
        </h1>

        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            else if (onBack) onBack();
          }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* 2. User Profile Card matching Capture.PNG */}
      <div className="px-3.5 pt-3 shrink-0">
        <div className="rounded-2xl bg-gradient-to-b from-[#eaf2f9] via-[#deebf5] to-[#cfe0ee] border border-white/80 p-4 relative overflow-hidden shadow-sm">
          
          {/* Watermark Crest Emblem in background */}
          <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full border-[10px] border-blue-900/5 flex items-center justify-center pointer-events-none">
            <Shield className="w-20 h-20 text-blue-900/5" />
          </div>

          {/* Top-Right Red Ribbon: সাইন ইন > */}
          <button
            type="button"
            onClick={onOpenDailySignIn}
            className="absolute top-0 right-0 bg-gradient-to-r from-[#e52836] to-[#c71826] text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-xl shadow flex items-center gap-1 cursor-pointer active:scale-95 transition-transform"
          >
            <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>সাইন ইন</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Main User Card Info */}
          <div className="flex items-start gap-3.5 pr-20">
            {/* Avatar with circular white border */}
            <div className="relative shrink-0">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"} 
                alt="Avatar"
                className="w-18 h-18 rounded-full object-cover border-2 border-white shadow-md"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              {/* VIP Badge */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenVip) {
                      onOpenVip();
                    } else {
                      setActiveSubModal('vip');
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#627384] text-white text-[10px] font-black tracking-wider shadow-xs hover:bg-[#526374] active:scale-95 transition-transform cursor-pointer"
                >
                  <Shield className="w-2.5 h-2.5 fill-white" />
                  <span>VIP{user?.vipLevel ?? 0}</span>
                </button>
              </div>

              {/* User ID + Copy button */}
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-extrabold text-base text-gray-900 font-mono tracking-tight">
                  {userIdDisplay}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 text-gray-700 hover:text-gray-900 active:scale-90 transition-transform cursor-pointer"
                  title="কপি করুন"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Nickname + edit pencil */}
              <div className="flex items-center gap-1 text-xs text-gray-700 mt-0.5">
                <span>ডাকনাম:</span>
                <span className="font-semibold text-gray-900">{user?.username || userIdDisplay}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingNickname(true)}
                  className="p-0.5 text-gray-500 hover:text-gray-800 cursor-pointer"
                  title="ডাকনাম পরিবর্তন"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              {/* Join date */}
              <div className="text-[11px] text-gray-500 mt-0.5">
                যোগদান করেছেন: 2026-08-30
              </div>
            </div>
          </div>

          {/* Balance Section */}
          <div className="flex items-center gap-2 mt-3.5 pt-2">
            <span className="text-2xl sm:text-3xl font-black text-gray-900 font-mono tracking-tight">
              ৳ {balanceDisplay}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              className={`p-1.5 text-gray-600 hover:text-gray-900 active:scale-90 transition-transform cursor-pointer ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`}
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* 3 Action Pill Buttons matching Capture.PNG */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenDeposit) {
                  onOpenDeposit();
                } else {
                  setActiveSubModal('deposit');
                }
              }}
              className="py-2 px-1 rounded-full bg-gradient-to-b from-white to-[#f0f4f8] border border-gray-300/80 shadow-xs text-xs font-extrabold text-gray-800 hover:bg-white active:scale-95 transition-all text-center cursor-pointer"
            >
              জমা দিন
            </button>
            <button
              type="button"
              onClick={() => {
                if (onOpenWithdraw) {
                  onOpenWithdraw();
                } else {
                  setActiveSubModal('withdraw');
                }
              }}
              className="py-2 px-1 rounded-full bg-gradient-to-b from-white to-[#f0f4f8] border border-gray-300/80 shadow-xs text-xs font-extrabold text-gray-800 hover:bg-white active:scale-95 transition-all text-center cursor-pointer"
            >
              উত্তোলন
            </button>
            <button
              type="button"
              onClick={() => setActiveSubModal('wallet')}
              className="py-2 px-1 rounded-full bg-gradient-to-b from-white to-[#f0f4f8] border border-gray-300/80 shadow-xs text-xs font-extrabold text-gray-800 hover:bg-white active:scale-95 transition-all text-center cursor-pointer"
            >
              আমার কার্ড
            </button>
          </div>

        </div>
      </div>

      {/* 3. Section Tag: সদস্য সেন্টার matching Capture.PNG */}
      <div className="px-4 pt-4 pb-1 flex items-center shrink-0">
        <span className="inline-block bg-[#e5e9ea] text-[#596a72] text-[12px] font-bold px-3 py-0.5 rounded-full">
          সদস্য সেন্টার
        </span>
        <div className="h-px flex-1 bg-gray-200 ml-3" />
      </div>

      {/* 4. Grid of 17 Premium Gold Circle Icons in 4 Columns with Identical Sweet Gold Colors */}
      <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-3 pt-3 pb-12 text-center">
        
        {/* 1. পুরস্কার সেন্টার (Badge 3) */}
        <button
          type="button"
          onClick={onOpenRewardCenter}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff2638] text-white text-[10px] font-black flex items-center justify-center shadow-md">
              3
            </span>
            <Trophy className="w-7 h-7 text-[#c69238] stroke-[1.6]" />
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            পুরস্কার সেন্টার
          </span>
        </button>

        {/* 2. বেটিং রেকর্ড */}
        <button
          type="button"
          onClick={() => {
            if (onOpenBetRecord) onOpenBetRecord();
            else setActiveSubModal('bet_record');
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* 4-blade geometric pinwheel matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12L12 4L16 4" />
              <path d="M12 12L20 12L20 16" />
              <path d="M12 12L12 20L8 20" />
              <path d="M12 12L4 12L4 8" />
              <rect x="10.5" y="10.5" width="3" height="3" fill="#c69238" stroke="none" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            বেটিং রেকর্ড
          </span>
        </button>

        {/* 3. লাভ এবং লস */}
        <button
          type="button"
          onClick={() => {
            if (onOpenProfitLoss) onOpenProfitLoss();
            else setActiveSubModal('profit_loss');
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Receipt document with $ sign matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              <path d="M4 18a2 2 0 0 0 2 2h12a1 1 0 0 0 1-1v-2H6a2 2 0 0 0-2 1z" fill="#fef5e7" />
              <path d="M12 7v7" />
              <path d="M9.5 9.5a2 2 0 0 1 3-1.5h1a2 2 0 0 1 0 4h-3a2 2 0 0 0 0 4h1.5a2 2 0 0 0 3-1.5" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            লাভ এবং লস
          </span>
        </button>

        {/* 4. জমা রেকর্ড */}
        <button
          type="button"
          onClick={() => {
            if (onOpenDepositRecord) onOpenDepositRecord();
            else setActiveSubModal('deposit_record');
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Clipboard with circular Up Arrow matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <circle cx="16.5" cy="16.5" r="4.5" fill="#fef5e7" />
              <path d="M16.5 19v-5M14.5 16l2-2 2 2" />
              <path d="M8 10h8M8 14h4" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            জমা রেকর্ড
          </span>
        </button>

        {/* 5. উত্তোলন রেকর্ড */}
        <button
          type="button"
          onClick={() => {
            if (onOpenWithdrawRecord) onOpenWithdrawRecord();
            else setActiveSubModal('withdraw_record');
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Clipboard with circular Down Arrow matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <circle cx="16.5" cy="16.5" r="4.5" fill="#fef5e7" />
              <path d="M16.5 14v5M14.5 17l2 2 2-2" />
              <path d="M8 10h8M8 14h4" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            উত্তোলন রেকর্ড
          </span>
        </button>

        {/* 6. অ্যাকাউন্ট রেকর্ড */}
        <button
          type="button"
          onClick={() => {
            if (onOpenAccountRecord) onOpenAccountRecord();
            else setActiveSubModal('account_record');
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Document / Card with magnifying glass and clock matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M3 8h18" />
              <circle cx="15" cy="13" r="2.5" />
              <path d="M17 15l2 2" />
              <circle cx="7" cy="18" r="2.5" fill="#fef5e7" />
              <path d="M7 17v1h1" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            অ্যাকাউন্ট রেকর্ড
          </span>
        </button>

        {/* 7. আমার অ্যাকাউন্ট */}
        <button
          type="button"
          onClick={() => setActiveSubModal('profile')}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* User profile avatar inside circle matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <circle cx="12" cy="9.5" r="3" />
              <path d="M6.8 17.8c1.3-2.2 3.1-3.3 5.2-3.3s3.9 1.1 5.2 3.3" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            আমার অ্যাকাউন্ট
          </span>
        </button>

        {/* 8. সুরক্ষা কেন্দ্র */}
        <button
          type="button"
          onClick={() => setActiveSubModal('security')}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Shield containing user portrait matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3s7 2.5 7 9c0 5.5-5.5 8.5-7 9.5-1.5-1-7-4-7-9.5 0-6.5 7-9 7-9z" />
              <circle cx="12" cy="10" r="2.2" />
              <path d="M8.5 15.5c.8-1.5 2.1-2 3.5-2s2.7.5 3.5 2" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            সুরক্ষা কেন্দ্র
          </span>
        </button>

        {/* 9. বন্ধুদের আমন্ত্রণ জানান */}
        <button
          type="button"
          onClick={() => {
            if (onOpenInvite) {
              onOpenInvite();
            } else {
              setActiveSubModal('invite');
            }
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* User with + symbol matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="8.5" r="3.5" />
              <path d="M4.5 18.5c1.2-3 4-4.5 6.5-4.5 1.2 0 2.3.4 3.2 1" />
              <circle cx="17.5" cy="16.5" r="4" fill="#fef5e7" />
              <path d="M17.5 14.5v4M15.5 16.5h4" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            বন্ধুদের আমন্ত্রণ জানান
          </span>
        </button>

        {/* 10. মিশন (Badge 1) */}
        <button
          type="button"
          onClick={() => {
            if (onOpenMissions) {
              onOpenMissions();
            } else {
              setActiveSubModal('mission');
            }
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff2638] text-white text-[10px] font-black flex items-center justify-center shadow-md">
              1
            </span>
            {/* Solid warm gold gift box matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="currentColor">
              <path d="M4 11h6v10H5a1 1 0 0 1-1-1v-9zm8 0h6a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-6V11zM3 7a1 1 0 0 1 1-1h7v4H3V7zm9-1h7a1 1 0 0 1 1 1v3h-8V6zm-1-3c-1.5 0-3 .8-3 2a2 2 0 0 0 2 2h2V4a1 1 0 0 0-1-1zm2 0a1 1 0 0 0-1 1v3h2a2 2 0 0 0 2-2c0-1.2-1.5-2-3-2z" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            মিশন
          </span>
        </button>

        {/* 11. রিবেট */}
        <button
          type="button"
          onClick={() => {
            if (onOpenRebate) {
              onOpenRebate();
            } else {
              setActiveSubModal('rebate');
            }
          }}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Stacked coins with cycle arrow loop matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="12" rx="4.5" ry="2" />
              <path d="M7.5 12v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" />
              <path d="M7.5 15v3c0 1.1 2 2 4.5 2s4.5-.9 4.5-2v-3" />
              <path d="M4.5 10A8 8 0 0 1 18 6.5l2-1.5" />
              <path d="M20 5v4h-4" />
              <path d="M19.5 14A8 8 0 0 1 6 17.5l-2 1.5" />
              <path d="M4 19v-4h4" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            রিবেট
          </span>
        </button>

        {/* 12. মেইল (Badge 3) */}
        <button
          type="button"
          onClick={() => setActiveSubModal('mail')}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff2638] text-white text-[10px] font-black flex items-center justify-center shadow-md">
              3
            </span>
            {/* Elegant @ email symbol matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            মেইল
          </span>
        </button>

        {/* 13. পরামর্শ */}
        <button
          type="button"
          onClick={() => setActiveSubModal('feedback')}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Speech bubble with 3 lines & star matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M7 8h5M7 12h8" />
              <path d="M17 6.5l.5 1 1.2.2-.9.8.2 1.2-1-.6-1 .6.2-1.2-.9-.8 1.2-.2z" fill="#c69238" stroke="none" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            পরামর্শ
          </span>
        </button>

        {/* 14. অ্যাপ ডাউনলোড করুন */}
        <button
          type="button"
          onClick={onOpenAppDownload}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Phone with download arrow into tray matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="2" width="12" height="20" rx="3" />
              <path d="M12 18h.01" strokeWidth="2.5" />
              <path d="M12 7v6M9.5 10.5L12 13l2.5-2.5" />
              <path d="M9 15h6" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            অ্যাপ ডাউনলোড করুন
          </span>
        </button>

        {/* 15. কাস্টমার সার্ভিস */}
        <button
          type="button"
          onClick={() => setIsCustomerServiceModalOpen(true)}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* 24/7 round badge with rotating arrows matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5" />
              <path d="M21.5 8.5v3.5h-3.5" />
              <path d="M12 21.5a9.5 9.5 0 0 1-9.5-9.5" />
              <path d="M2.5 15.5v-3.5h3.5" />
              <text x="12" y="14" fill="#c69238" fontSize="7" fontWeight="bold" textAnchor="middle" stroke="none" fontFamily="sans-serif">
                24/7
              </text>
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            কাস্টমার সার্ভিস
          </span>
        </button>

        {/* 16. সাহায্য কেন্দ্র */}
        <button
          type="button"
          onClick={() => setActiveSubModal('help')}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Question mark ? circle matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r=".8" fill="#c69238" stroke="none" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            সাহায্য কেন্দ্র
          </span>
        </button>

        {/* 17. লগআউট (Row 5 Column 1) */}
        <button
          type="button"
          onClick={onLogout}
          className="flex flex-col items-center justify-start group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-[58px] h-[58px] rounded-full border border-[#f3d7a8] bg-[#fef5e7] flex items-center justify-center relative shadow-[0_2px_6px_rgba(202,156,66,0.12)] group-hover:border-[#e2bc79] group-hover:bg-[#fef1db] transition-colors">
            {/* Circular Exit right arrow matching screenshot */}
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#c69238]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M8 12h8M13 8.5l3.5 3.5-3.5 3.5" />
            </svg>
          </div>
          <span className="text-[12px] text-[#2c373d] font-medium mt-1.5 leading-tight max-w-[76px]">
            লগআউট
          </span>
        </button>

      </div>

      {/* Sub-Modals / Sliding Drawers for Mobile */}
      {activeSubModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-base text-gray-900">
                {activeSubModal === 'wallet' && 'আমার কার্ড / ই-ওয়ালেট বাঁধুন'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveSubModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wallet Binding Drawer */}
            {activeSubModal === 'wallet' && (
              <div className="space-y-3 text-xs sm:text-sm">
                <label className="block text-gray-600 font-semibold mb-1">ই-ওয়ালেট নির্বাচন করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Rocket', 'Nagad', 'BKash'] as const).map((wType) => (
                    <button
                      key={wType}
                      type="button"
                      onClick={() => setSelectedWallet(wType)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        selectedWallet === wType 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={WALLET_LOGOS[wType]} 
                        alt={wType} 
                        className="w-8 h-8 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[11px]">{wType}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">ওয়ালেট অ্যাকাউন্ট নম্বর</label>
                  <input
                    type="text"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!walletNumber.trim()) {
                      showToast('ওয়ালেট নম্বর দিন!');
                      return;
                    }
                    showToast(`${selectedWallet} ওয়ালেট সফলভাবে যুক্ত করা হয়েছে!`);
                    setActiveSubModal(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold mt-2 shadow cursor-pointer"
                >
                  ওয়ালেট বাঁধুন
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {isEditingNickname && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="font-bold text-sm text-black">ডাকনাম পরিবর্তন</h3>
              <button onClick={() => setIsEditingNickname(false)} className="text-gray-400 hover:text-black cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-black block mb-1.5">নতুন ডাকনাম</label>
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="নতুন ডাকনাম লিখুন"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-black placeholder:text-gray-400 bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingNickname(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-xs font-bold text-black hover:bg-gray-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveNickname}
                className="flex-1 py-2.5 rounded-lg bg-[#084e36] hover:bg-[#0b6345] text-white text-xs font-bold shadow cursor-pointer transition-colors"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Service Selection Modal matching Capture17.PNG */}
      <CustomerServiceModal
        isOpen={isCustomerServiceModalOpen}
        onClose={() => setIsCustomerServiceModalOpen(false)}
        onOpenLiveChat={() => {
          setIsCustomerServiceModalOpen(false);
          if (onOpenCustomerService) onOpenCustomerService();
        }}
        onOpenSupportTicket={() => {
          setIsCustomerServiceModalOpen(false);
          setActiveSubModal('feedback');
        }}
        showToast={showToast}
      />

    </div>
  );
};
