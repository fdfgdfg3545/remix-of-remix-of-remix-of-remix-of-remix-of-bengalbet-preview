// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  Tag,
  Calendar,
  Headphones,
  Check,
  ShieldAlert,
  ArrowUpDown,
  CornerDownRight
} from 'lucide-react';
import { SupportTicket } from '../types';
import { api } from '../services/api';

interface NeextHubAdminSupportTicketsManagerProps {
  tickets: SupportTicket[];
  onRefresh: () => void;
  showToast: (msg: string) => void;
  onOpenUserDetail?: (userId: string) => void;
}

const QUICK_REPLIES = [
  'আপনার ডিপোজিট TrxID যাচাই করা হচ্ছে। অনুগ্রহ করে ২-৫ মিনিট অপেক্ষা করুন।',
  'আপনার উইথড্রয়াল অনুমোদন করা হয়েছে। কিছুক্ষণের মধ্যেই একাউন্টে ব্যালেন্স পৌঁছাবে।',
  'অনুগ্রহ করে আপনার মোবাইল ব্যাংকিং অ্যাপের লেনদেন স্ক্রিনশট বা মেসেজ দিন।',
  'আপনার অ্যাকাউন্ট নিরাপত্তা যাচাই সফল হয়েছে। এখন আপনি স্বাভাবিকভাবে খেলতে পারেন।',
  'আমাদের কারিগরি টিম গেম সংক্রান্ত সমস্যার সমাধান সম্পন্ন করেছে।'
];

export const NeextHubAdminSupportTicketsManager: React.FC<NeextHubAdminSupportTicketsManagerProps> = ({
  tickets,
  onRefresh,
  showToast,
  onOpenUserDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'replied' | 'resolved' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'normal' | 'high' | 'urgent'>('all');
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  
  // Reply drafts per ticket
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyStatuses, setReplyStatuses] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});

  // Summary counts
  const stats = useMemo(() => {
    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      replied: tickets.filter(t => t.status === 'replied').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // Status filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      
      // Priority filter
      if (priorityFilter !== 'all' && (t.priority || 'normal') !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ticketNum = (t.ticketNumber || t.id).toLowerCase();
        const userId = (t.userId || '').toLowerCase();
        const username = (t.username || '').toLowerCase();
        const subject = (t.subject || t.type || '').toLowerCase();
        const content = (t.content || '').toLowerCase();
        const contact = (t.contact || '').toLowerCase();
        return (
          ticketNum.includes(q) ||
          userId.includes(q) ||
          username.includes(q) ||
          subject.includes(q) ||
          content.includes(q) ||
          contact.includes(q)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, searchQuery]);

  const handleSendReply = async (ticketId: string) => {
    const text = replyDrafts[ticketId];
    if (!text || !text.trim()) {
      showToast('উত্তর টেক্সট লিখুন');
      return;
    }

    const nextStatus = replyStatuses[ticketId] || 'replied';

    setIsReplying(prev => ({ ...prev, [ticketId]: true }));
    try {
      const res = await api.admin.replyFeedback(ticketId, text.trim(), nextStatus, 'BengalBet সাপোর্ট টিম');
      if (res.success) {
        showToast('সাপোর্ট উত্তর পাঠানো হয়েছে এবং প্লেয়ার নোটিফিকেশন পেয়েছে');
        setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }));
        onRefresh();
      } else {
        showToast(res.message || 'উত্তর পাঠানো যায়নি');
      }
    } catch (err: any) {
      showToast('ত্রুটি: ' + err.message);
    } finally {
      setIsReplying(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await api.admin.updateFeedbackStatus(ticketId, newStatus);
      if (res.success) {
        showToast(`টিকিট স্ট্যাটাস "${newStatus}" এ আপডেট করা হয়েছে`);
        onRefresh();
      }
    } catch (err: any) {
      showToast('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত এই সাপোর্ট টিকিটটি মুছে ফেলতে চান?')) return;

    setIsDeleting(prev => ({ ...prev, [ticketId]: true }));
    try {
      const res = await api.admin.deleteFeedback(ticketId);
      if (res.success) {
        showToast('টিকিট সফলভাবে মুছে ফেলা হয়েছে');
        onRefresh();
      }
    } catch (err: any) {
      showToast('মুছে ফেলা যায়নি');
    } finally {
      setIsDeleting(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'replied':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            উত্তর দেওয়া হয়েছে
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            পর্যালোচনাধীন
          </span>
        );
      case 'resolved':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>সমাধান</span>
          </span>
        );
      case 'closed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/40">
            বন্ধ
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>অপেক্ষমান</span>
          </span>
        );
    }
  };

  const getPriorityBadge = (p?: string) => {
    if (p === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
          🔥 অতি জরুরি (Urgent)
        </span>
      );
    }
    if (p === 'high') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
          জরুরি (High)
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-500/20 text-gray-300">
        সাধারণ (Normal)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Quick Stats */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#09291b] to-[#0d3b2b] border border-emerald-700/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-black flex items-center justify-center font-bold shadow-md">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>সাপোর্ট ও অভিযোগ টিকিট কন্ট্রোল সেন্টার</span>
                <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2.5 py-0.5 rounded-full border border-yellow-500/30">
                  {stats.total} টি টিকিট
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                প্লেয়ারদের অভিযোগ ও প্রশ্নাবলীর উত্তর দিন, মেসেজ থ্রেড পরিচালনা করুন এবং রিয়েল-টাইম সমাধান প্রদান করুন।
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="px-4 py-2.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 border border-emerald-600/50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer active:scale-95 transition-all shadow-md"
          >
            <RefreshCw className="w-4 h-4 text-yellow-400" />
            <span>রিফ্রেশ করুন</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all' 
              ? 'bg-yellow-400/20 border-yellow-400 shadow-md' 
              : 'bg-[#09291b] border-emerald-700/40 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] text-gray-400">সর্বমোট টিকিট</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'pending' 
              ? 'bg-amber-500/20 border-amber-400 shadow-md' 
              : 'bg-[#09291b] border-emerald-700/40 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>অপেক্ষমান</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.pending}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('in_progress')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'in_progress' 
              ? 'bg-blue-500/20 border-blue-400 shadow-md' 
              : 'bg-[#09291b] border-emerald-700/40 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] text-blue-300">পর্যালোচনাধীন</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">{stats.in_progress}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('replied')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'replied' 
              ? 'bg-purple-500/20 border-purple-400 shadow-md' 
              : 'bg-[#09291b] border-emerald-700/40 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] text-purple-300">উত্তর পাঠানো</div>
          <div className="text-2xl font-black text-purple-400 font-mono mt-1">{stats.replied}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('resolved')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'resolved' 
              ? 'bg-emerald-500/20 border-emerald-400 shadow-md' 
              : 'bg-[#09291b] border-emerald-700/40 hover:border-emerald-500/50'
          }`}
        >
          <div className="text-[11px] text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>সমাধানকৃত</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.resolved}</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="টিকিট নং, ইউজার ID, ফোন বা সমস্যা খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-[#051c13] border border-emerald-700/60 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-gray-400 font-bold shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-yellow-400" />
            <span>জরুরিতা:</span>
          </span>
          <button
            type="button"
            onClick={() => setPriorityFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              priorityFilter === 'all' ? 'bg-yellow-400 text-black' : 'bg-[#051c13] text-gray-300'
            }`}
          >
            সকল
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('urgent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              priorityFilter === 'urgent' ? 'bg-rose-600 text-white' : 'bg-[#051c13] text-gray-300'
            }`}
          >
            🔥 অতি জরুরি
          </button>
          <button
            type="button"
            onClick={() => setPriorityFilter('high')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              priorityFilter === 'high' ? 'bg-amber-500 text-black' : 'bg-[#051c13] text-gray-300'
            }`}
          >
            জরুরি
          </button>
        </div>
      </div>

      {/* 4. Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-[#09291b] border border-emerald-700/40 rounded-3xl space-y-3">
            <MessageSquare className="w-10 h-10 text-emerald-400/50 mx-auto" />
            <p className="text-sm font-bold text-gray-300">কোনো সাপোর্ট টিকিট পাওয়া যায়নি</p>
            <p className="text-xs text-gray-500">ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
          </div>
        ) : (
          filteredTickets.map((fb) => {
            const isExpanded = expandedTicketId === fb.id;
            const currentReplyText = replyDrafts[fb.id] || '';
            const isSending = isReplying[fb.id] || false;

            return (
              <div
                key={fb.id}
                className="bg-[#09291b] border border-emerald-700/50 hover:border-emerald-600/70 rounded-3xl overflow-hidden shadow-lg transition-all"
              >
                {/* Ticket Summary Header Bar */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-800/40 bg-[#072418]">
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black/40 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold shrink-0 font-mono text-sm">
                      {fb.ticketNumber ? fb.ticketNumber.slice(-4) : '#' + fb.id.slice(-4)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-black text-yellow-400 text-sm">
                          {fb.ticketNumber || `#${fb.id}`}
                        </span>
                        {getPriorityBadge(fb.priority)}
                        <span className="text-xs font-bold text-white bg-emerald-900/60 px-2.5 py-0.5 rounded-lg border border-emerald-700/50">
                          {fb.type || 'সাধারণ অভিযোগ'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>প্লেয়ার ID: </span>
                          <button
                            type="button"
                            onClick={() => onOpenUserDetail && onOpenUserDetail(fb.userId)}
                            className="font-mono text-yellow-300 font-bold hover:underline cursor-pointer"
                          >
                            {fb.username ? `${fb.username} (${fb.userId})` : fb.userId}
                          </button>
                        </span>
                        {fb.contact && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-yellow-400" />
                            <span className="font-mono text-gray-300">{fb.contact}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 font-mono text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{fb.createdAt?.slice(0, 16)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={fb.status}
                        onChange={(e) => handleStatusChange(fb.id, e.target.value)}
                        className="bg-[#051c13] text-xs font-bold text-white border border-emerald-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-yellow-400 cursor-pointer"
                      >
                        <option value="pending">অপেক্ষমান (Pending)</option>
                        <option value="in_progress">পর্যালোচনাধীন (In Progress)</option>
                        <option value="replied">উত্তর পাঠানো (Replied)</option>
                        <option value="resolved">সমাধান (Resolved)</option>
                        <option value="closed">বন্ধ (Closed)</option>
                      </select>
                    </div>

                    {/* Expand/Collapse Thread Button */}
                    <button
                      type="button"
                      onClick={() => setExpandedTicketId(isExpanded ? null : fb.id)}
                      className="p-2 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'লুকান' : 'চ্যাট থ্রেড'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Delete Ticket Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(fb.id)}
                      disabled={isDeleting[fb.id]}
                      className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 cursor-pointer transition-colors"
                      title="টিকিট মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ticket Content Body */}
                <div className="p-4 md:p-5 space-y-4">
                  {/* Subject and main inquiry */}
                  <div>
                    {fb.subject && fb.subject !== fb.type && (
                      <h4 className="text-sm font-bold text-yellow-300 mb-1">
                        বিষয়: {fb.subject}
                      </h4>
                    )}
                    <div className="text-xs text-emerald-100 bg-[#051e14] p-3.5 rounded-2xl border border-emerald-800/60 leading-relaxed font-sans">
                      "{fb.content}"
                    </div>
                  </div>

                  {/* Message Thread (if expanded) */}
                  {isExpanded && fb.messages && fb.messages.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-emerald-800/40">
                      <div className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-yellow-400" />
                        <span>মেসেজ থ্রেড ইতিহাস ({fb.messages.length} টি বার্তা)</span>
                      </div>

                      <div className="space-y-2.5 max-h-64 overflow-y-auto p-3 rounded-2xl bg-[#051910] border border-emerald-900/60">
                        {fb.messages.map((m, idx) => {
                          const isAdmin = m.sender === 'admin';
                          return (
                            <div
                              key={m.id || idx}
                              className={`p-3 rounded-xl text-xs space-y-1 ${
                                isAdmin
                                  ? 'bg-purple-950/40 border border-purple-800/40 text-purple-200 ml-4'
                                  : 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-100 mr-4'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold flex items-center gap-1">
                                  {isAdmin ? (
                                    <>
                                      <Headphones className="w-3 h-3 text-purple-400" />
                                      <span className="text-purple-300">BengalBet এডমিন সাপোর্ট</span>
                                    </>
                                  ) : (
                                    <>
                                      <User className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-300">{m.senderName || 'ইউজার'}</span>
                                    </>
                                  )}
                                </span>
                                <span className="text-gray-400 font-mono">{m.createdAt?.slice(0, 16)}</span>
                              </div>
                              <p className="leading-relaxed text-white whitespace-pre-wrap">{m.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Previous Reply Preview (if not expanded) */}
                  {!isExpanded && fb.reply && (
                    <div className="text-xs text-purple-300 bg-purple-950/40 p-3 rounded-2xl border border-purple-800/40 flex items-start gap-2">
                      <Headphones className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <b className="text-white">সর্বশেষ এডমিন উত্তর:</b> {fb.reply}
                      </div>
                    </div>
                  )}

                  {/* Admin Reply & Resolution Composer */}
                  <div className="pt-2 border-t border-emerald-800/40 space-y-3">
                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 font-bold shrink-0">দ্রুত উত্তর:</span>
                      {QUICK_REPLIES.map((quick, qIdx) => (
                        <button
                          key={qIdx}
                          type="button"
                          onClick={() => setReplyDrafts(prev => ({ ...prev, [fb.id]: quick }))}
                          className="px-2.5 py-1 rounded-lg bg-[#051c13] hover:bg-[#0b3323] border border-emerald-700/60 text-[11px] text-emerald-200 transition-colors cursor-pointer"
                        >
                          {quick.slice(0, 22)}...
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={currentReplyText}
                          onChange={(e) => setReplyDrafts(prev => ({ ...prev, [fb.id]: e.target.value }))}
                          placeholder="প্লেয়ারের জন্য এডমিন সমাধান বা উত্তর লিখুন..."
                          className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>

                      {/* Status select for when replying */}
                      <select
                        value={replyStatuses[fb.id] || 'replied'}
                        onChange={(e) => setReplyStatuses(prev => ({ ...prev, [fb.id]: e.target.value }))}
                        className="bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2.5 text-xs text-yellow-300 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="replied">স্ট্যাটাস: উত্তর পাঠানো</option>
                        <option value="resolved">স্ট্যাটাস: সরাসরি সমাধান</option>
                        <option value="in_progress">স্ট্যাটাস: চলমান রাখুন</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleSendReply(fb.id)}
                        disabled={!currentReplyText.trim() || isSending}
                        className="py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                      >
                        {isSending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>উত্তর পাঠান</span>
                      </button>
                    </div>
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
