// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Headphones,
  Sparkles,
  Phone,
  MessageSquare,
  Star,
  Maximize2,
  Minimize2,
  CheckCheck,
  Zap,
  ShieldCheck,
  Smile,
  Paperclip,
  ChevronDown,
  RefreshCw,
  Award
} from 'lucide-react';
import { Language } from '../types';
import { api } from '../services/api';

interface LiveChatWidgetProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onOpenSupportTicket?: () => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenPromotions?: () => void;
}

const DEPARTMENTS = [
  { id: 'general', label: '⚡ সাধারণ জিজ্ঞাসা', en: 'General Help' },
  { id: 'deposit', label: '💳 ডিপোজিট ও TrxID', en: 'Deposit & TrxID' },
  { id: 'withdraw', label: '💸 উইথড্রয়াল ও ক্যাশ-আউট', en: 'Withdrawal' },
  { id: 'bonus', label: '🎁 বোনাস ও রিওয়ার্ড', en: 'Bonus & Rewards' },
  { id: 'vip', label: '👑 VIP সাপোর্ট সার্ভিস', en: 'VIP Concierge' },
  { id: 'technical', label: '🛠️ টেকনিক্যাল সাপোর্ট', en: 'Technical Support' }
];

const QUICK_PROMPTS = [
  '💰 আমার বিকাশ/নগদ ডিপোজিট ব্যালেন্সে আসেনি',
  '⚡ উইথড্রয়াল রিকোয়েস্ট কত সময় লাগবে?',
  '🎁 আজকের স্পেশাল ডিপোজিট বোনাস কি?',
  '📞 সরাসরি লাইভ এজেন্টের সাথে কথা বলতে চাই'
];

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  language,
  onClose,
  onOpenSupportTicket,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenPromotions
}) => {
  const [session, setSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDept, setSelectedDept] = useState('general');
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  // Rating state
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [hasRated, setHasRated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch session & messages
  const fetchSessionAndMessages = async (dept?: string) => {
    try {
      const res = await api.chat.getSession(dept || selectedDept);
      if (res.success) {
        setSession(res.session);
        setMessages(res.messages || []);
        if (res.session?.department) {
          setSelectedDept(res.session.department);
        }
      }
    } catch (err) {
      console.warn('Failed to load chat session:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessionAndMessages();
    }
  }, [isOpen]);

  // Polling every 3.5s for live updates when open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (session?.id) {
        api.chat.getMessages(session.id).then((res) => {
          if (res.success) {
            setMessages(res.messages || []);
            if (res.session) setSession(res.session);
          }
        }).catch(() => {});
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, session?.id]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Handle message send
  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || inputText).trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      sessionId: session?.id || '',
      sender: 'user',
      senderName: session?.username || 'আপনি',
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.chat.sendMessage({
        sessionId: session?.id,
        text
      });

      if (res.success) {
        if (res.session) setSession(res.session);
        // Refresh messages
        if (res.session?.id) {
          setTimeout(() => {
            api.chat.getMessages(res.session.id).then((msgRes) => {
              if (msgRes.success) setMessages(msgRes.messages || []);
            });
          }, 800);
        }
      }
    } catch (err: any) {
      console.warn('Failed to send chat message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Change department
  const handleSelectDepartment = async (deptId: string) => {
    setSelectedDept(deptId);
    setIsDeptDropdownOpen(false);

    if (session?.id) {
      try {
        const res = await api.chat.setDepartment(session.id, deptId);
        if (res.success) {
          setSession(res.session);
          setMessages(res.messages || []);
        }
      } catch (err) {
        console.warn(err);
      }
    } else {
      fetchSessionAndMessages(deptId);
    }
  };

  // Handle action card clicks
  const handleActionClick = (action: string) => {
    if (action === 'view_deposits' || action === 'deposit') {
      if (onOpenDeposit) onOpenDeposit();
      else if (onOpenSupportTicket) onOpenSupportTicket();
    } else if (action === 'view_withdrawals' || action === 'withdraw') {
      if (onOpenWithdraw) onOpenWithdraw();
    } else if (action === 'claim_bonus' || action === 'promotions') {
      if (onOpenPromotions) onOpenPromotions();
    } else if (action === 'refresh_balance') {
      fetchSessionAndMessages();
    }
  };

  // Submit Rating
  const handleRatingSubmit = async () => {
    if (!session?.id) return;
    try {
      const res = await api.chat.rateSession(session.id, selectedRating, ratingComment);
      if (res.success) {
        setHasRated(true);
        setIsRatingOpen(false);
        if (res.session) setSession(res.session);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const activeAgent = session?.assignedAgent || {
    name: 'নুসরাত জাহান',
    role: 'সিনিয়র VIP সাপোর্ট স্পেশালিস্ট',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 bg-[#061e14] border-2 border-yellow-400/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 backdrop-blur-xl ${
        isExpanded
          ? 'w-[95vw] sm:w-[500px] h-[650px] max-h-[90vh]'
          : 'w-[92vw] sm:w-[410px] h-[540px] max-h-[85vh]'
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-[#051c13] via-[#092b1d] to-[#051c13] p-3.5 border-b border-emerald-700/60 flex items-center justify-between shadow-md">
        {/* Agent Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={activeAgent.avatar}
              alt="agent"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 shadow-md"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#051c13] animate-pulse" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-white truncate">{activeAgent.name}</h4>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-yellow-400 text-black shrink-0">
                VIP
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
              <span className="truncate">{activeAgent.role}</span>
            </div>
          </div>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsRatingOpen(!isRatingOpen)}
            title="রেটিং দিন"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-yellow-300 cursor-pointer transition-colors"
          >
            <Star className="w-4 h-4 fill-yellow-400/20 text-yellow-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'ছোট করুন' : 'বড় করুন'}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="বন্ধ করুন"
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Department Selector Ribbon */}
      <div className="bg-[#041710] px-3 py-2 border-b border-emerald-800/60 flex items-center justify-between text-xs">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
            className="flex items-center gap-1.5 text-[11px] font-bold text-yellow-300 bg-[#09291b] hover:bg-emerald-800/50 px-2.5 py-1 rounded-lg border border-emerald-700/60 transition-colors cursor-pointer"
          >
            <span>{DEPARTMENTS.find((d) => d.id === selectedDept)?.label || 'ডিপার্টমেন্ট নির্বাচন'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDeptDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#09291b] border border-emerald-600 rounded-xl shadow-2xl p-1 z-30 space-y-0.5">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleSelectDepartment(dept.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedDept === dept.id
                      ? 'bg-yellow-400 text-black'
                      : 'text-emerald-100 hover:bg-emerald-800/60'
                  }`}
                >
                  <span>{dept.label}</span>
                  {selectedDept === dept.id && <CheckCheck className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Support Ticket Fast Link */}
        {onOpenSupportTicket && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSupportTicket();
            }}
            className="text-[10px] text-emerald-300 hover:text-yellow-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3 h-3 text-yellow-400" />
            <span>অফিসিয়াল টিকিট</span>
          </button>
        )}
      </div>

      {/* Interactive Rating Popup Overlay */}
      {isRatingOpen && (
        <div className="p-3 bg-[#082a1d] border-b border-yellow-400/40 animate-in slide-in-from-top-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-300 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              আপনার সাপোর্ট অভিজ্ঞতা কেমন ছিল?
            </span>
            <button
              type="button"
              onClick={() => setIsRatingOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedRating(s)}
                className="p-1 cursor-pointer hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    s <= selectedRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-600 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="মন্তব্য লিখুন (ঐচ্ছিক)..."
              className="flex-1 bg-[#051c13] border border-emerald-700 rounded-xl px-2.5 py-1 text-xs text-white"
            />
            <button
              type="button"
              onClick={handleRatingSubmit}
              className="px-3 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs cursor-pointer shadow"
            >
              জমা দিন
            </button>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#04160e]/70">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          const isSystem = m.sender === 'system';
          const isAgent = m.sender === 'agent';
          const isBot = m.sender === 'bot';

          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center my-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[10px] text-center max-w-[90%]">
                  {m.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={m.id}
              className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="relative shrink-0 mt-1">
                  <img
                    src={m.senderAvatar || activeAgent.avatar}
                    alt="avatar"
                    className="w-7 h-7 rounded-full object-cover border border-yellow-400/80 shadow"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
              )}

              <div
                className={`max-w-[80%] sm:max-w-[75%] p-3 rounded-2xl shadow-md space-y-1.5 ${
                  isUser
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-semibold rounded-tr-none'
                    : 'bg-[#09291b] text-emerald-50 border border-emerald-600/70 rounded-tl-none'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold border-b border-emerald-700/50 pb-0.5">
                    <span>{m.senderName || (isBot ? 'BengalBet এআই' : 'সাপোর্ট স্পেশালিস্ট')}</span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {m.createdAt ? m.createdAt.split(' ')[1] || m.createdAt : ''}
                    </span>
                  </div>
                )}

                <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

                {/* Quick Action Button inside Message */}
                {m.quickAction && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleActionClick(m.quickAction.action)}
                      className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-[11px] shadow flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>{m.quickAction.label}</span>
                    </button>
                  </div>
                )}

                {isUser && (
                  <div className="flex items-center justify-end gap-1 text-[9px] text-amber-950 font-bold">
                    <span>{m.createdAt ? m.createdAt.split(' ')[1] || m.createdAt : ''}</span>
                    <CheckCheck className="w-3 h-3 text-amber-900" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel for Players */}
      <div className="px-2.5 py-1.5 bg-[#051c13] border-t border-emerald-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(undefined, prompt)}
            className="px-2.5 py-1 rounded-full bg-[#082a1d] hover:bg-emerald-800/60 border border-emerald-700/60 text-[10px] text-emerald-200 font-medium whitespace-nowrap transition-colors active:scale-95 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-2.5 bg-[#051c13] border-t border-emerald-800/80 flex items-center gap-2">
        <input
          type="text"
          placeholder={language === 'bn' ? 'কীভাবে সাহায্য করতে পারি? বার্তা লিখুন...' : 'Type your message...'}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-[#092c1e] border border-emerald-700/80 text-white text-xs px-3 py-2.5 rounded-xl focus:outline-hidden focus:border-yellow-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="btn-bdt-gold p-2.5 rounded-xl text-black shadow-lg shadow-yellow-500/20 disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
};
