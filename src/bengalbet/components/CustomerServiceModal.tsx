// @ts-nocheck
import React from 'react';
import { X, MessageSquare, Headphones } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLiveChat: () => void;
  onOpenSupportTicket?: () => void;
  showToast?: (msg: string) => void;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
  onOpenLiveChat,
  onOpenSupportTicket,
  showToast
}) => {
  if (!isOpen) return null;

  const handleSelectService = (type: 'live' | 'ticket' | 'telegram' | 'facebook') => {
    if (type === 'live') {
      onClose();
      onOpenLiveChat();
    } else if (type === 'ticket') {
      onClose();
      if (onOpenSupportTicket) {
        onOpenSupportTicket();
      } else {
        onOpenLiveChat();
      }
    } else if (type === 'telegram') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 }
      });
      if (showToast) {
        showToast('টেলিগ্রাম কাস্টমার সাপোর্ট সংযুক্ত হচ্ছে...');
      }
      onClose();
      window.open('https://t.me/BengalBet_Official_Support', '_blank', 'noopener,noreferrer');
    } else if (type === 'facebook') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.6 }
      });
      if (showToast) {
        showToast('ফেসবুক মেসেঞ্জার সাপোর্ট সংযুক্ত হচ্ছে...');
      }
      onClose();
      window.open('https://facebook.com/BengalBetOfficialSupport', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      id="customer-service-modal-overlay"
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in select-none font-bengali"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div 
        id="customer-service-dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[340px] sm:max-w-[360px] bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150"
      >
        {/* Floating Close Button at Top Right corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-3.5 -right-3.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#404c5a] border-2 border-white text-white flex items-center justify-center shadow-lg hover:bg-black active:scale-90 transition-all cursor-pointer z-30"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Title */}
        <h2 className="text-center text-lg font-black text-[#2c373d] tracking-wide mb-1">
          গ্রাহক সেবা নির্বাচন করুন
        </h2>
        <p className="text-center text-xs text-gray-500 mb-4">
          ২৪/৭ সক্রিয় সমাধান ও লাইভ সহায়তা
        </p>

        {/* Options */}
        <div className="space-y-3">
          
          {/* 1. পরিবেশন করুন (Live Service with Red Operator Icon) */}
          <button
            type="button"
            onClick={() => handleSelectService('live')}
            className="w-full p-2.5 sm:p-3 bg-[#fdf0ec] hover:bg-[#fce8e2] border border-[#fae0d7] rounded-2xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#eb4335] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(235,67,53,0.35)] group-hover:scale-105 transition-transform shrink-0">
                <Headphones className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[15px] font-bold text-[#2c373d] tracking-wide block">
                  পরিবেশন করুন (লাইভ চ্যাট)
                </span>
                <span className="text-[11px] text-gray-500 font-medium">
                  তাত্ক্ষণিক এজেন্ট সহায়তা
                </span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-2" />
          </button>

          {/* 2. সাপোর্ট ও অভিযোগ টিকিট (Support Ticket with Green Badge) */}
          <button
            type="button"
            onClick={() => handleSelectService('ticket')}
            className="w-full p-2.5 sm:p-3 bg-[#e8f7ee] hover:bg-[#d8f1e1] border border-[#c4ebcf] rounded-2xl flex items-center justify-between text-left active:scale-[0.98] transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#0b824c] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(11,130,76,0.35)] group-hover:scale-105 transition-transform shrink-0">
                <MessageSquare className="w-6 h-6 stroke-[2.2]" />
              </div>

              <div>
                <span className="text-[15px] font-bold text-[#094227] tracking-wide block">
                  সাপোর্ট ও অভিযোগ টিকিট
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  ট্র্যাকিং নম্বর ও বিস্তারিত সমাধান
                </span>
              </div>
            </div>
            <span className="text-[10px] font-black bg-[#0b824c] text-white px-2 py-0.5 rounded-full mr-1">
              টিকিট
            </span>
          </button>

          {/* 3. টেলিগ্রাম (Telegram with Blue Telegram Icon) */}
          <button
            type="button"
            onClick={() => handleSelectService('telegram')}
            className="w-full p-2.5 sm:p-3 bg-[#eef2ff] hover:bg-[#e6ebfd] border border-[#dce4fe] rounded-2xl flex items-center gap-3.5 text-left active:scale-[0.98] transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.673c.458 0 .66-.21.916-.458l2.199-2.138 4.573 3.378c.843.464 1.448.225 1.658-.785l2.997-14.123c.308-1.233-.471-1.792-1.506-1.314z" />
              </svg>
            </div>

            <div>
              <span className="text-[15px] font-bold text-[#2c373d] tracking-wide block">
                টেলিগ্রাম অফিসিয়াল চ্যানেল
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                @BengalBet_Official_Support
              </span>
            </div>
          </button>

          {/* 4. Facebook (Facebook with Orange/Gold Icon) */}
          <button
            type="button"
            onClick={() => handleSelectService('facebook')}
            className="w-full p-2.5 sm:p-3 bg-[#fff7e8] hover:bg-[#ffefd4] border border-[#ffeed0] rounded-2xl flex items-center gap-3.5 text-left active:scale-[0.98] transition-all cursor-pointer group shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-[#f59e0b] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>

            <div>
              <span className="text-[15px] font-bold text-[#2c373d] tracking-wide block">
                ফেসবুক মেসেঞ্জার
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                BengalBet Official Support
              </span>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};
