// @ts-nocheck
import React, { useState } from 'react';
import { useLiveRules } from '../services/promoLive';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Download, QrCode, ShieldCheck, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';

interface AppDownloadModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onClaimAppBonus: () => Promise<string | void> | void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  language,
  onClose,
  onClaimAppBonus
}) => {
  const live = useLiveRules();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const bonus = live?.promoRules?.appBonus;
  if (!isOpen) return null;

  const handleBonus = async () => {
    if (busy) return;
    setBusy(true); setMessage('');
    try { const result = await onClaimAppBonus(); setMessage(result || ''); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'পুরস্কার নেওয়া যায়নি।'); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div 
        id="app-download-dialog"
        className="relative w-full max-w-md bg-[#082a1d] border-2 border-yellow-400 rounded-2xl shadow-2xl p-6 overflow-hidden flex flex-col items-center text-center"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-[#0e432f] hover:bg-[#155e42] text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-yellow-300 flex items-center justify-center shadow-xl border border-yellow-400/60 mb-3">
          <Smartphone className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-black mb-2 shadow">
          {bonus?.enabled ? `${language === 'bn' ? 'অ্যাপ বোনাস' : 'App bonus'}: ৳${bonus.amount}` : (language === 'bn' ? 'অ্যাপ বোনাস এখন উপলব্ধ নয়' : 'App bonus unavailable')}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white font-game tracking-wider">
          BengalBet OFFICIAL MOBILE APP
        </h2>
        <p className="text-xs text-emerald-200 mt-1 max-w-xs">
          {language === 'bn' 
                ? 'বর্তমানে আলাদা APK বা iOS ডাউনলোড ফাইল সংযুক্ত নেই।'
            : 'No separate APK or iOS download file is currently connected.'}
        </p>

        {/* Download Buttons */}
        <div className="w-full space-y-2.5 my-5">
          <Button className="w-full" disabled={busy || !bonus?.enabled} onClick={handleBonus}>
            <Sparkles className="w-4 h-4" />
            {language === 'bn' ? 'অ্যাপ বোনাস দাবি করুন' : 'Claim app bonus'}
          </Button>
          {message && <p role="status" className="text-sm text-emerald-200">{message}</p>}
        </div>

        <div className="w-full pt-3 border-t border-[#14593e] flex items-center justify-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{language === 'bn' ? 'সার্ভারে যাচাইকৃত পুরস্কার' : 'Server-verified reward'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-yellow-400" />
            <span>{language === 'bn' ? 'প্রতি সদস্য একবার' : 'Once per member'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
