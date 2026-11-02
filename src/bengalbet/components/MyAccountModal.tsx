// @ts-nocheck
/**
 * BengalBet My Account Profile Modal
 * Features:
 * - User avatar, VIP level, phone number, and wallet balance
 * - Quick deposit, withdraw, and VIP tier upgrade links
 * - Security info, transaction histories, and referral code sharing
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React from 'react';
import { X, User, Wallet, Crown, Shield, ArrowUpRight, ArrowDownLeft, Phone, History, Sparkles, LogOut, MessageSquare } from 'lucide-react';
import { Language, UserAccount } from '../types';

interface MyAccountModalProps {
  isOpen: boolean;
  language: Language;
  user: UserAccount;
  onClose: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenVIP: () => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  onOpenSupportTicket?: () => void;
}

export const MyAccountModal: React.FC<MyAccountModalProps> = ({
  isOpen,
  language,
  user,
  onClose,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenVIP,
  onLogout,
  onOpenAdmin,
  onOpenSupportTicket
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div 
        id="my-account-dialog"
        className="relative w-full max-w-xl bg-[#082a1d] border-2 border-yellow-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-[#0a3f2b] to-emerald-950 border-b border-[#14593e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover shadow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user.username}</h3>
                <span className="px-2 py-0.5 rounded bg-yellow-400 text-black text-xs font-black">
                  VIP {user.vipLevel}
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-mono">{user.phone}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-emerald-100">
          {/* Main Wallet Box */}
          <div className="bg-[#051c13] border border-yellow-400/60 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400 block">{language === 'bn' ? 'মোট মূল ব্যালেন্স' : 'Total Main Balance'}</span>
              <span className="text-2xl font-black text-yellow-400 font-game">
                ৳ {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { onClose(); onOpenDeposit(); }}
                className="btn-bdt-green px-3.5 py-1.5 rounded-lg text-xs font-bold shadow"
              >
                {language === 'bn' ? 'ডিপোজিট' : 'Deposit'}
              </button>
              <button
                onClick={() => { onClose(); onOpenWithdraw(); }}
                className="btn-bdt-gold px-3.5 py-1.5 rounded-lg text-xs font-bold shadow"
              >
                {language === 'bn' ? 'উত্তোলন' : 'Withdraw'}
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl">
              <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'ফ্রি স্পিন' : 'Free Spins'}</span>
              <span className="text-base font-bold text-yellow-400 font-game">{user.freeSpins} বার</span>
            </div>
            <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl">
              <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'রেড প্যাকেট' : 'Red Packets'}</span>
              <span className="text-base font-bold text-red-400 font-game">{user.redPacketsAvailable} টি</span>
            </div>
            <div className="p-3 bg-[#051c13] border border-[#14593e] rounded-xl">
              <span className="text-[10px] text-gray-400 block">{language === 'bn' ? 'সোনার ডিম' : 'Golden Eggs'}</span>
              <span className="text-base font-bold text-amber-400 font-game">{user.goldenEggsAvailable} টি</span>
            </div>
          </div>

          {/* Account Settings Menu */}
          <div className="space-y-1.5">
            <button
              onClick={() => { onClose(); onOpenVIP(); }}
              className="w-full p-3 bg-[#051c13] hover:bg-[#0e432f] border border-[#14593e] rounded-xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>{language === 'bn' ? 'ভিআইপি প্রিভিলেজ ও লেভেল' : 'VIP Privileges & Tiers'}</span>
              </div>
              <span className="text-xs text-yellow-400 font-bold font-game">LV {user.vipLevel}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                if (onOpenSupportTicket) onOpenSupportTicket();
              }}
              className="w-full p-3 bg-[#051c13] hover:bg-[#0e432f] border border-[#14593e] rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-yellow-400" />
                <span>{language === 'bn' ? 'সাপোর্ট ও অভিযোগ টিকিট' : 'Support & Inquiry Tickets'}</span>
              </div>
              <span className="text-[10px] bg-emerald-600/60 text-emerald-200 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">২৪/৭ সহায়তা</span>
            </button>

            <button
              onClick={() => alert('KYC Status: Fully Verified (Level 2)')}
              className="w-full p-3 bg-[#051c13] hover:bg-[#0e432f] border border-[#14593e] rounded-xl flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'নিরাপত্তা ও KYC ভেরিফিকেশন' : 'Security & KYC Verification'}</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">✓ ভেরিফাইড</span>
            </button>
            {onOpenAdmin && (
              <button
                onClick={() => { onClose(); onOpenAdmin(); }}
                className="w-full p-3 bg-emerald-950/60 hover:bg-emerald-900 border border-yellow-500/40 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 font-bold">Neext Hub Admin Panel</span>
                </div>
                <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded font-black">MASTER</span>
              </button>
            )}
          </div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগআউট করুন' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
