// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Check, 
  CheckSquare, 
  Square,
  Gift,
  ExternalLink,
  RotateCcw,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserAccount } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export interface MobileMailItem {
  id: string;
  sender: string;
  title: string;
  timestamp: string;
  isRead: boolean;
  category?: string;
  content: {
    headline: string;
    description: string;
    howToGetTitle: string;
    howToGetSteps: string[];
    rulesTitle: string;
    rules: string[];
    officialLinksTitle?: string;
    officialLinks?: string[];
    claimableBonus?: number;
  };
}


interface MailMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
  onClaimBonus?: (amount: number, reason: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const MailMobileView: React.FC<MailMobileViewProps> = ({
  user,
  onBack,
  onClose,
  showToast,
  onClaimBonus,
  onUnreadCountChange
}) => {
  const [mails, setMails] = useState<MobileMailItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMailDetail, setActiveMailDetail] = useState<MobileMailItem | null>(null);
  const [claimedMailIds, setClaimedMailIds] = useState<string[]>([]);
  const [internalToast, setInternalToast] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'bonus' | 'notice'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load from Live API
  const fetchLiveMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.messages.getMessages();
      if (res.success && Array.isArray(res.messages)) {
        const mapped: MobileMailItem[] = res.messages.map(m => ({
          id: m.id,
          sender: m.sender || 'প্ল্যাটফর্ম',
          title: m.title,
          timestamp: m.dateFull || m.displayTime || 'আজ',
          isRead: !!m.isRead,
          category: m.category,
          content: {
            headline: m.content?.headline || m.title,
            description: m.content?.description || '',
            howToGetTitle: m.content?.howToGetTitle || 'কিভাবে পাবেন:',
            howToGetSteps: m.content?.howToGetSteps || [],
            rulesTitle: m.content?.rulesTitle || 'নিয়মাবলী:',
            rules: m.content?.rules || [],
            officialLinksTitle: m.content?.officialLinksTitle,
            officialLinks: m.content?.officialLinks,
            claimableBonus: m.claimableBonus
          }
        }));
        setMails(mapped);
        if (onUnreadCountChange) onUnreadCountChange(res.unreadCount || 0);
      } else {
        setMails([]);
      }
    } catch (err) {
      console.warn('Live messages load error:', err);
      setMails([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMessages();
  }, []);

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setInternalToast(msg);
      setTimeout(() => setInternalToast(null), 2500);
    }
  };

  // Filtered mails based on active category
  const filteredMails = mails.filter(m => {
    if (activeCategoryFilter === 'bonus') {
      return m.category === 'bonus' || m.category === 'mission' || !!m.content.claimableBonus;
    }
    if (activeCategoryFilter === 'notice') {
      return m.category === 'notice' || m.category === 'system' || (!m.content.claimableBonus && m.category !== 'bonus');
    }
    return true;
  });

  const isAllSelected = filteredMails.length > 0 && filteredMails.every(m => selectedIds.includes(m.id));

  // Toggle select all
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMails.map(m => m.id));
    }
  };

  // Toggle single item checkbox
  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Mark selected or all as read
  const handleMarkAsRead = () => {
    const targetIds = selectedIds.length > 0 ? selectedIds : filteredMails.map(m => m.id);
    if (targetIds.length === 0) return;

    targetIds.forEach(id => api.messages.markRead(id).catch(() => {}));
    setMails(prev => {
      const updated = prev.map(m => targetIds.includes(m.id) ? { ...m, isRead: true } : m);
      const unread = updated.filter(m => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
      return updated;
    });
    triggerToast('পড়া হিসেবে চিহ্নিত করা হয়েছে');
  };

  // Delete selected
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      triggerToast('মুছে ফেলার জন্য মেইল নির্বাচন করুন');
      return;
    }
    selectedIds.forEach(id => api.messages.delete(id).catch(() => {}));
    setMails(prev => {
      const updated = prev.filter(m => !selectedIds.includes(m.id));
      const unread = updated.filter(m => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
      return updated;
    });
    setSelectedIds([]);
    triggerToast('নির্বাচিত মেইল সফলভাবে মুছে ফেলা হয়েছে');
  };

  // Click on mail item to view detail
  const handleOpenDetail = (mail: MobileMailItem) => {
    setActiveMailDetail(mail);
    if (!mail.isRead) {
      api.messages.markRead(mail.id).catch(() => {});
      setMails(prev => {
        const updated = prev.map(m => m.id === mail.id ? { ...m, isRead: true } : m);
        const unread = updated.filter(m => !m.isRead).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
        return updated;
      });
    }
  };

  // Claim Bonus from Mail Detail
  const handleClaimMailBonus = async (mail: MobileMailItem) => {
    if (!mail.content.claimableBonus || claimedMailIds.includes(mail.id)) return;

    try {
      const res = await api.messages.claimBonus(mail.id);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
        setClaimedMailIds(prev => [...prev, mail.id]);
        const amount = res.amount || mail.content.claimableBonus;
        if (onClaimBonus) {
          onClaimBonus(amount, `ইনবক্স বার্তা বোনাস: ৳${amount}`);
        }
        triggerToast(res.message || `৳${amount} বোনাস সফলভাবে যুক্ত করা হয়েছে!`);
      } else {
        triggerToast(res.message || 'বোনাস ইতিমধ্যে দাবি করা হয়েছে');
      }
    } catch (err) {
      console.warn('Claim bonus error:', err);
    }
  };

  // Reset sample mails if all deleted
  const handleResetSamples = () => {
    fetchLiveMessages();
    setSelectedIds([]);
    triggerToast('বার্তা পুনরায় রিফ্রেশ করা হয়েছে');
  };

  // If in Mail Detail View
  if (activeMailDetail) {
    const isClaimed = claimedMailIds.includes(activeMailDetail.id);
    const hasBonus = !!activeMailDetail.content.claimableBonus;

    return (
      <div 
        id="mobile-mail-detail-view"
        className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none animate-in fade-in"
      >
        {/* Top Header matching Capture15.PNG */}
        <header className="bg-[#0b3323] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setActiveMailDetail(null)}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base font-bold text-white tracking-wide">
            মেইলের বিবরণ
          </h1>

          <div className="w-9" />
        </header>

        {/* Mail Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-gray-800">
          
          {/* Metadata Card */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-semibold text-gray-700">
                প্রেরক: <span className="text-gray-900 font-bold">{activeMailDetail.sender}</span>
              </span>
              <span className="font-mono text-[11px] text-gray-500">{activeMailDetail.timestamp}</span>
            </div>

            <h2 className="text-base font-black text-gray-900 leading-snug pt-1">
              {activeMailDetail.content.headline}
            </h2>
          </div>

          {/* Description */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs space-y-3">
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {activeMailDetail.content.description}
            </p>

            {/* How to get */}
            {activeMailDetail.content.howToGetSteps.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {activeMailDetail.content.howToGetTitle}
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 pl-1">
                  {activeMailDetail.content.howToGetSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rules */}
            {activeMailDetail.content.rules.length > 0 && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  {activeMailDetail.content.rulesTitle}
                </h3>
                <ul className="space-y-1 text-xs text-gray-600 pl-1">
                  {activeMailDetail.content.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Links */}
            {activeMailDetail.content.officialLinks && (
              <div className="pt-2 border-t border-gray-100 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>🔶</span>
                  <span>{activeMailDetail.content.officialLinksTitle || 'BengalBet অফিসিয়াল লিঙ্ক'}</span>
                </h4>
                <div className="flex flex-wrap gap-2 text-blue-600 font-semibold font-mono text-xs">
                  {activeMailDetail.content.officialLinks.map((link, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">
                      {link}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Claim Bonus Button if mail offers bonus */}
            {hasBonus && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleClaimMailBonus(activeMailDetail)}
                  disabled={isClaimed}
                  className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 ${
                    isClaimed
                      ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      : 'btn-bdt-gold text-[#3b2000]'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{isClaimed ? 'বোনাস সংগৃহীত হয়েছে ✅' : `৳${activeMailDetail.content.claimableBonus} বোনাস দাবি করুন`}</span>
                </button>
              </div>
            )}

          </div>

          {/* Delete Single Mail Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMails(prev => prev.filter(m => m.id !== activeMailDetail.id));
                setActiveMailDetail(null);
                triggerToast('মেইল মুছে ফেলা হয়েছে');
              }}
              className="w-full py-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>এই মেইলটি মুছে ফেলুন</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div 
      id="mobile-mail-main-view"
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none animate-in fade-in"
    >
      {/* Toast Notification */}
      {internalToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0b3323] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{internalToast}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER matching Capture15.PNG */}
      {/* Dark Forest Green Background (#0b3323) + Back Arrow + Centered Title: মেইল */}
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
          মেইল
        </h1>

        <button
          type="button"
          onClick={fetchLiveMessages}
          disabled={isLoading}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER TAB: ইনবক্স with bright blue underline matching Capture15.PNG */}
      {/* ========================================================================= */}
      <div className="bg-white border-b-2 border-[#0091ea] px-4 py-2.5 flex items-center justify-center shrink-0">
        <span className="text-base font-bold text-[#0091ea] tracking-wide">
          ইনবক্স
        </span>
      </div>

      {/* Category Pills Bar */}
      <div className="bg-gray-50 border-b border-gray-100 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0">
        <button
          type="button"
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeCategoryFilter === 'all'
              ? 'bg-[#0091ea] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          সবগুলো ({mails.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveCategoryFilter('bonus')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeCategoryFilter === 'bonus'
              ? 'bg-[#0091ea] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          🎁 অফার ও মিশন
        </button>
        <button
          type="button"
          onClick={() => setActiveCategoryFilter('notice')}
          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
            activeCategoryFilter === 'notice'
              ? 'bg-[#0091ea] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          📢 নোটিশ
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. ACTION TOOLBAR matching Capture15.PNG */}
      {/* Left: Checkbox + সমস্ত নির্বাচন করুন | Right: Envelope-Check + Trash */}
      {/* ========================================================================= */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100 text-gray-800 shrink-0">
        {/* Left: Select All Checkbox */}
        <button
          type="button"
          onClick={handleToggleSelectAll}
          className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold hover:text-gray-900 active:scale-95 transition-transform"
        >
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            isAllSelected 
              ? 'bg-[#0091ea] border-[#0091ea] text-white' 
              : 'border-gray-400 bg-white'
          }`}>
            {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-sm font-bold text-gray-800">সমস্ত নির্বাচন করুন</span>
        </button>

        {/* Right: Actions (Mark Read & Delete) */}
        <div className="flex items-center gap-4 text-gray-600">
          {/* Envelope with check icon */}
          <button
            type="button"
            onClick={handleMarkAsRead}
            className="p-1 hover:text-[#0091ea] active:scale-90 transition-transform cursor-pointer"
            title="পড়া হিসেবে চিহ্নিত করুন"
          >
            {/* Custom SVG Envelope with Checkmark matching Capture15.PNG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" fill="#71717a" stroke="none" />
              <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" stroke="#ffffff" strokeWidth="1.8" />
              <path d="m14 19 2.5 2.5 4.5-4.5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Trash Can icon */}
          <button
            type="button"
            onClick={handleDeleteSelected}
            className="p-1 hover:text-red-600 active:scale-90 transition-transform cursor-pointer"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-5 h-5 text-gray-600 hover:text-red-600" strokeWidth="2" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MESSAGE LIST matching Capture15.PNG */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 bg-white">
        {filteredMails.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <Trash2 className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="text-gray-500 font-bold text-sm">কোনো মেইল নেই</div>
            <button
              type="button"
              onClick={handleResetSamples}
              className="px-4 py-2 bg-[#0b3323] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow active:scale-95 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>বার্তা রিফ্রেশ করুন</span>
            </button>
          </div>
        ) : (
          filteredMails.map((mail) => {
            const isChecked = selectedIds.includes(mail.id);

            return (
              <div
                key={mail.id}
                onClick={() => handleOpenDetail(mail)}
                className="px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50/80 active:bg-gray-100 transition-colors cursor-pointer select-none"
              >
                {/* Round Checkbox matching Capture15.PNG */}
                <div 
                  onClick={(e) => handleToggleCheck(mail.id, e)}
                  className="pt-0.5 shrink-0 cursor-pointer"
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isChecked 
                      ? 'bg-[#0091ea] border-[#0091ea] text-white' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                {/* Main Mail Content */}
                <div className="flex-1 min-w-0">
                  {/* Top Row: Green Dot + Sender (Left) & Date + Chevron (Right) */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <div className="flex items-center gap-1.5">
                      {/* Green Unread Indicator Dot */}
                      {!mail.isRead ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] inline-block shrink-0" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block shrink-0" />
                      )}
                      <span className="text-gray-700 font-medium text-xs">
                        প্রেরক:{mail.sender}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 text-[11px] font-mono">
                      <span>{mail.timestamp}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 stroke-[2]" />
                    </div>
                  </div>

                  {/* Bottom Row: Subject / Title matching Capture15.PNG */}
                  <div className="text-xs sm:text-sm text-gray-900 font-medium truncate">
                    <span className="text-gray-700">শিরোনাম:</span>
                    <span className={`ml-0.5 ${!mail.isRead ? 'font-bold text-gray-950' : 'text-gray-800'}`}>
                      {mail.title}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
