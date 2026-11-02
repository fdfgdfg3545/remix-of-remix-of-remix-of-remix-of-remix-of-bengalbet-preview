// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  RefreshCw, 
  Send,
  X,
  MessageSquare,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Headphones,
  User,
  ShieldCheck,
  Tag,
  PhoneCall,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserAccount, SupportTicket } from '../types';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

interface FeedbackMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
  onNavigateLobby?: () => void;
  onOpenPromotions?: () => void;
  onOpenShare?: () => void;
  onOpenRewards?: () => void;
}

const QUESTION_TYPES = [
  'ডিপোজিট সমস্যা ও রিচার্জ যাচাই',
  'উইথড্রয়াল বিলম্ব বা ব্যাংক সমস্যা',
  'গেম সংক্রান্ত ত্রুটি বা লোডিং সমস্যা',
  'ভিআইপি ও বোনাস সংক্রান্ত জিজ্ঞাসা',
  'অ্যাকাউন্ট ও নিরাপত্তা সমস্যা',
  'প্ল্যাটফর্ম উন্নয়ন ও নতুন পরামর্শ',
  'অন্যান্য অনুসন্ধান'
];

export const FeedbackMobileView: React.FC<FeedbackMobileViewProps> = ({
  user,
  onBack,
  onClose,
  showToast,
  onNavigateLobby,
  onOpenPromotions,
  onOpenShare,
  onOpenRewards
}) => {
  // Tabs: 'create' (নতুন টিকিট) | 'my_tickets' (আমার টিকিটসমূহ)
  const [activeTab, setActiveTab] = useState<'create' | 'my_tickets'>('create');
  
  // Ticket Form States
  const [selectedType, setSelectedType] = useState<string>('');
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [contact, setContact] = useState(user?.phone || '');
  const [content, setContent] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('83137');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tickets List & Detail States
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'replied' | 'resolved'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Generate random 5-digit Captcha
  const generateCaptcha = () => {
    const digits = Math.floor(10000 + Math.random() * 90000).toString();
    setCaptchaCode(digits);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const res = await api.feedback.getFeedbacks();
      if (res.success && res.feedbacks) {
        setTickets(res.feedbacks);
        // If there's an active detail view open, update selectedTicket too
        if (selectedTicket) {
          const updated = res.feedbacks.find(t => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.warn('Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const triggerToast = (msg: string) => {
    if (showToast) {
      showToast(msg);
    } else {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      triggerToast('দয়া করে প্রশ্ন প্রকার নির্বাচন করুন');
      setIsTypePickerOpen(true);
      return;
    }

    if (!content.trim()) {
      triggerToast('দয়া করে আপনার সমস্যার বিবরণ লিখুন');
      return;
    }

    if (content.length < 5) {
      triggerToast('কমপক্ষে ৫টি অক্ষরে আপনার বার্তা লিখুন');
      return;
    }

    if (!captchaInput.trim()) {
      triggerToast('যাচাইকরণ কোড (ক্যাপচা) পূরণ করুন');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      triggerToast('ভুল ক্যাপচা কোড! পুনরায় চেষ্টা করুন');
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.feedback.submit(
        selectedType,
        content.trim(),
        contact.trim() || user?.phone,
        subject.trim() || selectedType,
        priority
      );

      if (res.success) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 }
        });
        triggerToast('আপনার সাপোর্ট টিকিট সফলভাবে জমা হয়েছে!');
        
        // Reset form
        setContent('');
        setSubject('');
        setSelectedType('');
        generateCaptcha();

        // Refresh tickets & switch to my_tickets tab
        await fetchMyTickets();
        if (res.feedback) {
          setSelectedTicket(res.feedback);
          setIsDetailModalOpen(true);
        }
        setActiveTab('my_tickets');
      } else {
        triggerToast(res.message || 'টিকিট সাবমিট করা যায়নি');
      }
    } catch (err) {
      triggerToast('সার্ভার এরর! পুনরায় চেষ্টা করুন');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await api.feedback.addMessage(selectedTicket.id, replyText.trim(), user?.username || 'প্লেয়ার');
      if (res.success && res.feedback) {
        setSelectedTicket(res.feedback);
        setReplyText('');
        triggerToast('আপনার মেসেজ সফলভাবে পাঠানো হয়েছে');
        fetchMyTickets();
      } else {
        triggerToast(res.message || 'মেসেজ পাঠানো যায়নি');
      }
    } catch (err) {
      triggerToast('মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await api.feedback.resolveTicket(ticketId);
      if (res.success && res.feedback) {
        setSelectedTicket(res.feedback);
        triggerToast('টিকিট সমাধান হিসেবে চিহ্নিত হয়েছে');
        fetchMyTickets();
      }
    } catch (err) {
      triggerToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === 'pending') return t.status === 'pending' || t.status === 'in_progress';
    if (statusFilter === 'replied') return t.status === 'replied';
    if (statusFilter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const pendingCount = tickets.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const repliedCount = tickets.filter(t => t.status === 'replied').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'replied':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
            <span>উত্তর এসেছে</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-400 animate-spin" />
            <span>পর্যালোচনাধীন</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>সমাধান হয়েছে</span>
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-600/30 text-gray-400 border border-gray-600/40">
            বন্ধ
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>অপেক্ষমান</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (p?: string) => {
    if (p === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
          🔥 অতি জরুরি
        </span>
      );
    }
    if (p === 'high') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          জরুরি
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-500/20 text-gray-300">
        সাধারণ
      </span>
    );
  };

  return (
    <div 
      id="support-ticket-view"
      className="w-full h-full min-h-screen bg-[#073022] flex flex-col font-bengali select-none animate-in fade-in relative pb-16 overflow-y-auto"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#0b3323] text-yellow-300 border border-yellow-400/50 px-4 py-2 rounded-full shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER */}
      {/* ========================================================================= */}
      <header className="bg-[#0b3323] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30 border-b border-emerald-800/60">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5 text-yellow-400" />
            <span>সাপোর্ট ও অভিযোগ টিকিট</span>
          </h1>
          <p className="text-[10px] text-emerald-300/80">২৪/৭ অনলাইন সমাধান ডেস্ক</p>
        </div>

        <button
          type="button"
          onClick={fetchMyTickets}
          disabled={isLoadingTickets}
          className="w-9 h-9 rounded-full flex items-center justify-center text-emerald-300 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingTickets ? 'animate-spin text-yellow-400' : ''}`} />
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. TAB CONTROLS (নতুন টিকিট | আমার টিকিটসমূহ) */}
      {/* ========================================================================= */}
      <div className="bg-[#06241a] px-4 py-2.5 border-b border-emerald-900/60 flex items-center justify-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('create')}
          className={`flex-1 max-w-[200px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'create'
              ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md'
              : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>নতুন টিকিট জমা দিন</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('my_tickets');
            fetchMyTickets();
          }}
          className={`flex-1 max-w-[200px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeTab === 'my_tickets'
              ? 'bg-gradient-to-r from-[#2f81f7] to-[#1f6feb] text-white shadow-md'
              : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>আমার টিকিট ({tickets.length})</span>
          {repliedCount > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 absolute -top-1 -right-1 animate-ping" />
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CREATE TICKET FORM */}
      {/* ========================================================================= */}
      {activeTab === 'create' && (
        <div className="flex-1 p-4 space-y-4 max-w-xl mx-auto w-full">
          
          {/* Information Notice */}
          <div className="p-3.5 rounded-2xl bg-emerald-900/30 border border-emerald-700/50 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="text-xs text-emerald-200 leading-relaxed">
              <span className="font-bold text-yellow-300">BengalBet অগ্রাধিকার ডেস্ক:</span> আপনার যে কোনো ডিপোজিট, উইথড্রয়াল বা গেম সংক্রান্ত অভিযোগ এখানে টিকিট হিসেবে জমা দিন। আমাদের সাপোর্ট টিম সাধারণত ৫-১৫ মিনিটের মধ্যে সমাধান প্রদান করে।
            </div>
          </div>

          {/* Field 1: Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-yellow-400" />
              <span>প্রশ্নের প্রকার / ক্যাটাগরি *</span>
            </label>
            <button
              type="button"
              onClick={() => setIsTypePickerOpen(true)}
              className="w-full bg-[#182230] text-left px-4 py-3 rounded-xl flex items-center justify-between border border-[#253244] text-white active:scale-[0.99] transition-transform cursor-pointer group shadow-sm"
            >
              <span className={selectedType ? 'text-white font-bold text-sm' : 'text-gray-400 text-sm font-medium'}>
                {selectedType || 'প্রশ্ন প্রকার নির্বাচন করুন'}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors shrink-0" />
            </button>
          </div>

          {/* Field 2: Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">
              টিকিটের বিষয় / সংক্ষেপ (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="উদা: বিকাশ ডিপোজিট এখনো জমা হয়নি"
              className="w-full bg-[#182230] border border-[#253244] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Field 3: Priority Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">জরুরিতা (Priority)</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('normal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  priority === 'normal'
                    ? 'bg-blue-600/30 text-blue-300 border-blue-500 shadow-xs'
                    : 'bg-[#182230] text-gray-400 border-[#253244] hover:bg-[#1f2c3f]'
                }`}
              >
                সাধারণ (Normal)
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  priority === 'high'
                    ? 'bg-amber-500/30 text-amber-300 border-amber-500 shadow-xs'
                    : 'bg-[#182230] text-gray-400 border-[#253244] hover:bg-[#1f2c3f]'
                }`}
              >
                জরুরি (High)
              </button>
              <button
                type="button"
                onClick={() => setPriority('urgent')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  priority === 'urgent'
                    ? 'bg-rose-500/30 text-rose-300 border-rose-500 shadow-xs'
                    : 'bg-[#182230] text-gray-400 border-[#253244] hover:bg-[#1f2c3f]'
                }`}
              >
                🔥 অতি জরুরি
              </button>
            </div>
          </div>

          {/* Field 4: Contact Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-yellow-400" />
              <span>যোগাযোগ নম্বর বা হোয়াটসঅ্যাপ (ঐচ্ছিক)</span>
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full bg-[#182230] border border-[#253244] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-gray-500 font-mono focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Field 5: Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-300">
              সমস্যার বিস্তারিত বিবরণ * (TrxID / তারিখ / পরিমাণ উল্লেখ করুন)
            </label>
            <div className="bg-[#182230] border border-[#253244] rounded-xl p-3 shadow-sm relative focus-within:border-yellow-400 transition-colors">
              <textarea
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setContent(e.target.value);
                  }
                }}
                placeholder="দয়া করে আপনার সমস্যার সম্পূর্ণ তথ্য লিখুন যাতে দ্রুত সমাধান করা যায়..."
                rows={5}
                className="w-full bg-transparent border-none text-white placeholder:text-gray-500 text-sm leading-relaxed focus:outline-none resize-none"
              />
              <div className="text-right text-[11px] text-gray-400 font-mono select-none pt-1">
                {content.length}/500
              </div>
            </div>
          </div>

          {/* Field 6: Captcha */}
          <div className="bg-[#182230] border border-[#253244] rounded-xl p-1.5 flex items-center justify-between shadow-sm">
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="যাচাইকরণ কোড (ক্যাপচা)"
              maxLength={6}
              className="flex-1 bg-transparent px-3 py-2 text-white placeholder:text-gray-500 text-sm font-mono focus:outline-none"
            />

            <div 
              onClick={generateCaptcha}
              className="bg-[#f0f4f3] rounded-lg px-3 py-1.5 flex items-center justify-center cursor-pointer select-none border border-gray-300 relative overflow-hidden group shadow-inner min-w-[100px] h-[38px]"
              title="নতুন কোড পেতে ক্লিক করুন"
            >
              <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 100 40">
                <path d="M0 20 Q 25 5, 50 20 T 100 20" fill="none" stroke="#2563eb" strokeWidth="2" />
                <path d="M0 10 Q 25 30, 50 15 T 100 25" fill="none" stroke="#16a34a" strokeWidth="1.5" />
                <path d="M0 30 Q 35 10, 70 30 T 100 15" fill="none" stroke="#ca8a04" strokeWidth="1.8" />
              </svg>

              <div className="flex items-center gap-1 relative z-10 font-bold font-mono text-lg tracking-wider">
                {captchaCode.split('').map((char, index) => {
                  const colors = ['#15803d', '#1d4ed8', '#0f766e', '#b45309', '#047857'];
                  const rotations = ['-rotate-3', 'rotate-2', '-rotate-6', 'rotate-4', '-rotate-2'];
                  return (
                    <span 
                      key={index} 
                      className={`inline-block transform ${rotations[index % rotations.length]}`}
                      style={{ color: colors[index % colors.length] }}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-bold text-base text-white shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #70b2ff 0%, #4a94ff 50%, #2f81f7 100%)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>জমা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>টিকিট সাবমিট করুন</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MY TICKETS LIST */}
      {/* ========================================================================= */}
      {activeTab === 'my_tickets' && (
        <div className="flex-1 p-4 space-y-4 max-w-xl mx-auto w-full">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-yellow-400 text-black shadow-xs'
                  : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
              }`}
            >
              সবগুলো ({tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>অপেক্ষমান ({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('replied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'replied'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>উত্তর প্রাপ্ত ({repliedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-[#0a3827] text-gray-300 hover:bg-[#0e4833]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>সমাধান</span>
            </button>
          </div>

          {/* Tickets List */}
          {isLoadingTickets ? (
            <div className="p-12 text-center text-emerald-300 text-sm flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 animate-spin text-yellow-400" />
              <span>টিকিট লোড হচ্ছে...</span>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center bg-[#06241a] border border-emerald-800/60 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 text-emerald-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-xs text-emerald-200">
                এই ক্যাটাগরিতে কোনো সাপোর্ট টিকিট নেই।
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>নতুন টিকিট তৈরি করুন</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    setIsDetailModalOpen(true);
                  }}
                  className="p-4 rounded-2xl bg-[#0d3b2b] border border-emerald-700/50 hover:border-yellow-400/50 transition-all cursor-pointer active:scale-[0.99] shadow-md space-y-2.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-yellow-400 bg-black/40 px-2 py-0.5 rounded-md border border-yellow-500/30">
                        {t.ticketNumber || `#${t.id.slice(-6)}`}
                      </span>
                      {getPriorityBadge(t.priority)}
                    </div>
                    {getStatusBadge(t.status)}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors line-clamp-1">
                      {t.subject || t.type}
                    </h3>
                    <p className="text-xs text-emerald-200/80 line-clamp-2 mt-1">
                      {t.content}
                    </p>
                  </div>

                  {/* If there is an admin reply, show latest snippet */}
                  {t.reply && (
                    <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-start gap-2">
                      <Headphones className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <div className="line-clamp-2">
                        <span className="font-bold text-white">সাপোর্ট উত্তর:</span> {t.reply}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-800/60 text-[11px] text-emerald-400/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{t.createdAt?.slice(0, 16)}</span>
                    </span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>বিস্তারিত দেখুন ও উত্তর দিন</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TICKET DETAIL & THREAD CONVERSATION MODAL */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-[#082a1d] border-t sm:border border-emerald-600/50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] text-white animate-in slide-in-from-bottom-5">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-emerald-800/60 flex items-center justify-between bg-[#051e14] rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-yellow-400">
                      {selectedTicket.ticketNumber || `#${selectedTicket.id}`}
                    </span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                  <h3 className="text-xs font-bold text-gray-200 line-clamp-1">
                    {selectedTicket.subject || selectedTicket.type}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Info Strip */}
            <div className="px-4 py-2.5 bg-[#0a3827] border-b border-emerald-800/40 text-[11px] flex items-center justify-between text-emerald-200 shrink-0">
              <div className="flex items-center gap-2">
                <span>ক্যাটাগরি: <b className="text-white">{selectedTicket.type}</b></span>
                {selectedTicket.contact && (
                  <span>| যোগাযোগ: <b className="text-yellow-400 font-mono">{selectedTicket.contact}</b></span>
                )}
              </div>
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <button
                  type="button"
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50 text-emerald-300 font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>সমাধান চিহ্নিত করুন</span>
                </button>
              )}
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[50vh]">
              {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                selectedTicket.messages.map((m, idx) => {
                  const isAdmin = m.sender === 'admin';
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-1 px-1">
                        {isAdmin ? (
                          <>
                            <Headphones className="w-3 h-3 text-purple-400" />
                            <span className="font-bold text-purple-300">BengalBet সাপোর্ট টিম</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-emerald-300">{m.senderName || 'আপনি'}</span>
                            <User className="w-3 h-3 text-emerald-400" />
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono">{m.createdAt?.slice(11, 16) || ''}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed shadow-md ${
                          isAdmin
                            ? 'bg-purple-950/60 border border-purple-800/60 text-purple-100 rounded-tl-xs'
                            : 'bg-gradient-to-r from-[#1b5e3f] to-[#124d32] border border-emerald-600/50 text-white rounded-tr-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 rounded-xl bg-[#061e14] border border-emerald-800 text-xs text-emerald-100">
                  {selectedTicket.content}
                </div>
              )}
            </div>

            {/* Reply Input Bar */}
            <div className="p-3 bg-[#051e14] border-t border-emerald-800/60 rounded-b-3xl shrink-0">
              {selectedTicket.status === 'closed' ? (
                <div className="text-center py-2 text-xs text-gray-400">
                  এই টিকিটটি বর্তমানে বন্ধ রয়েছে। নতুন সমস্যার জন্য নতুন টিকিট জমা দিন।
                </div>
              ) : (
                <form onSubmit={handleSendFollowUp} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="সাপোর্টকে উত্তর বা অতিরিক্ত তথ্য লিখুন..."
                    className="flex-1 bg-[#092b1e] border border-emerald-700/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSendingReply}
                    className="px-4 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-xs hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    {isSendingReply ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>পাঠান</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION TYPE PICKER MODAL */}
      {/* ========================================================================= */}
      {isTypePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#182230] border-t sm:border border-[#2d3a4d] rounded-t-2xl sm:rounded-2xl p-4 space-y-3 text-white shadow-2xl animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#2d3a4d]">
              <h3 className="font-bold text-base text-white">
                প্রশ্ন প্রকার নির্বাচন করুন
              </h3>
              <button
                type="button"
                onClick={() => setIsTypePickerOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto py-1">
              {QUESTION_TYPES.map((type, idx) => {
                const isSelected = selectedType === type;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedType(type);
                      setIsTypePickerOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/50' 
                        : 'bg-[#1e2a3b] text-gray-200 hover:bg-[#253347]'
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
