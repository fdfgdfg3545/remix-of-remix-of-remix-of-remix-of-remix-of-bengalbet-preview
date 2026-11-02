// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Headphones,
  Search,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  User,
  Phone,
  ShieldCheck,
  Award,
  DollarSign,
  AlertCircle,
  Trash2,
  Paperclip,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  Filter,
  FileText,
  Star,
  ChevronRight,
  CornerDownRight,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

interface NeextHubAdminLiveChatManagerProps {
  onRefresh?: () => void;
  showToast: (msg: string) => void;
  onOpenUserDetail?: (userId: string) => void;
}

const CANNED_REPLIES = [
  {
    title: 'ডিপোজিট TrxID ভেরিফিকেশন',
    text: 'প্রিয় গ্রাহক, আপনার TrxID সফলভাবে ভেরিফাই করা হয়েছে এবং ব্যালেন্স যোগ করে দেওয়া হয়েছে। অনুগ্রহ করে আপনার অ্যাকাউন্ট চেক করুন।'
  },
  {
    title: 'TrxID ও স্ক্রিনশট চাওয়া',
    text: 'অনুগ্রহ করে আপনার বিকাশ/নগদ পেমেন্টের TrxID এবং ট্রানজেকশনের একটি স্ক্রিনশট এখানে পাঠিয়ে দিন। আমরা দ্রুত চেক করে দেখছি।'
  },
  {
    title: 'ক্যাশ-আউট অনুমোদন',
    text: 'আপনার উইথড্রয়াল রিকোয়েস্ট সফলভাবে অনুমোদিত হয়েছে। পরবর্তী ৫-১০ মিনিটের মধ্যে সংশ্লিষ্ট বিকাশ/নগদ অ্যাকাউন্টে টাকা জমা হবে।'
  },
  {
    title: 'স্পেশাল বোনাস অ্যাক্টিভেশন',
    text: 'অভিনন্দন! আপনার আনুগত্যের জন্য অ্যাকাউন্টে বিশেষ ভিআইপি ক্যাশব্যাক বোনাস সক্রিয় করা হয়েছে। শুভ গেমিং!'
  },
  {
    title: 'চ্যাট সমাপ্তি ও শুভেচ্ছা',
    text: 'BengalBet ২৪/৭ ভিআইপি লাইভ সাপোর্টে যোগাযোগ করার জন্য ধন্যবাদ। আপনার আর কোনো জিজ্ঞাসা না থাকলে আমরা এই সেশনটি সম্পন্ন করছি। শুভ দিন!'
  }
];

const STAFF_OPERATORS = [
  { name: 'নুসরাত জাহান', role: 'সিনিয়র VIP সাপোর্ট স্পেশালিস্ট', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
  { name: 'তানভীর আহমেদ', role: 'চিফ পেমেন্ট কনসিলিয়ার্জ', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { name: 'ফারজানা আক্তার', role: 'লাইভ গেমিং অ্যাসিস্ট্যান্ট', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' }
];

export const NeextHubAdminLiveChatManager: React.FC<NeextHubAdminLiveChatManagerProps> = ({
  showToast,
  onOpenUserDetail
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    waitingSessions: 0,
    resolvedSessions: 0,
    unreadAdminCount: 0,
    avgRating: 5.0
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [userDetails, setUserDetails] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'waiting' | 'resolved'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Internal Note state
  const [internalNote, setInternalNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Quick Credit Modal
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('500');
  const [creditType, setCreditType] = useState<'credit' | 'bonus'>('bonus');
  const [creditNote, setCreditNote] = useState('VIP সাপোর্ট বিশেষ বোনাস');
  const [isSubmittingCredit, setIsSubmittingCredit] = useState(false);

  // Operator status toggle
  const [operatorOnline, setOperatorOnline] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch all chat sessions & stats
  const fetchSessions = async (keepSelection = true) => {
    try {
      const res = await api.admin.chat.getSessions();
      if (res.success) {
        setSessions(res.sessions || []);
        if (res.stats) setStats(res.stats);

        // Auto select first waiting or active session if none selected
        if (!keepSelection || !selectedSessionId) {
          const firstCandidate = res.sessions.find((s: any) => s.status === 'waiting') || res.sessions[0];
          if (firstCandidate) {
            setSelectedSessionId(firstCandidate.id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load chat sessions:', err);
    }
  };

  // Fetch single session thread
  const fetchCurrentThread = async (sessionId: string) => {
    try {
      const res = await api.admin.chat.getSession(sessionId);
      if (res.success) {
        setCurrentSession(res.session);
        setMessages(res.messages || []);
        setUserDetails(res.userDetails || null);
        setInternalNote(res.session?.internalNote || '');
      }
    } catch (err) {
      console.warn('Failed to fetch session messages:', err);
    }
  };

  useEffect(() => {
    fetchSessions(false);
  }, []);

  // Poll for messages and sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions(true);
      if (selectedSessionId) {
        fetchCurrentThread(selectedSessionId);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchCurrentThread(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        searchQuery === '' ||
        s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.userPhone && s.userPhone.includes(searchQuery)) ||
        (s.lastMessage && s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchDept = departmentFilter === 'all' || s.department === departmentFilter;

      return matchSearch && matchStatus && matchDept;
    });
  }, [sessions, searchQuery, statusFilter, departmentFilter]);

  // Handle Send Reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedSessionId || isSending) return;

    const textToSend = replyText.trim();
    setIsSending(true);

    try {
      const res = await api.admin.chat.replySession(
        selectedSessionId,
        textToSend,
        currentSession?.assignedAgent?.name || 'BengalBet সাপোর্ট টিম'
      );

      if (res.success) {
        setReplyText('');
        if (res.chatMessage) {
          setMessages((prev) => [...prev, res.chatMessage]);
        }
        if (res.session) {
          setCurrentSession(res.session);
        }
        fetchSessions(true);
      }
    } catch (err: any) {
      alert(err.message || 'উত্তর প্রেরণ ব্যর্থ হয়েছে');
    } finally {
      setIsSending(false);
    }
  };

  // Status change
  const handleStatusChange = async (newStatus: 'active' | 'waiting' | 'resolved' | 'closed') => {
    if (!selectedSessionId) return;
    try {
      const res = await api.admin.chat.updateSessionStatus(selectedSessionId, newStatus);
      if (res.success) {
        setCurrentSession(res.session);
        showToast(`সেশন স্ট্যাটাস "${newStatus}" এ পরিবর্তন করা হয়েছে`);
        fetchSessions(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Assign agent
  const handleAssignAgent = async (op: (typeof STAFF_OPERATORS)[0]) => {
    if (!selectedSessionId) return;
    try {
      const res = await api.admin.chat.assignAgent(selectedSessionId, op.name, op.role, op.avatar);
      if (res.success) {
        setCurrentSession(res.session);
        showToast(`${op.name} দায়িত্ব গ্রহণ করেছেন`);
        fetchCurrentThread(selectedSessionId);
        fetchSessions(true);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save internal staff note
  const handleSaveInternalNote = async () => {
    if (!selectedSessionId) return;
    setIsSavingNote(true);
    try {
      const res = await api.admin.chat.saveNote(selectedSessionId, internalNote);
      if (res.success) {
        showToast('অভ্যন্তরীণ স্টাফ নোট সেভ হয়েছে');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Execute Quick Credit
  const handleExecuteCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId) return;
    const amount = Number(creditAmount);
    if (!amount || amount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    setIsSubmittingCredit(true);
    try {
      const res = await api.admin.chat.quickCredit(selectedSessionId, amount, creditNote, creditType);
      if (res.success) {
        showToast(`৳${amount} প্লেয়ার অ্যাকাউন্টে যোগ করা হয়েছে!`);
        setIsCreditModalOpen(false);
        fetchCurrentThread(selectedSessionId);
        fetchSessions(true);
      }
    } catch (err: any) {
      alert(err.message || 'ক্রেডিট প্রক্রিয়া ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingCredit(false);
    }
  };

  // Delete chat session
  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('আপনি কি এই চ্যাট সেশনটি মুছে ফেলতে চান?')) return;
    try {
      const res = await api.admin.chat.deleteSession(sessionId);
      if (res.success) {
        showToast('চ্যাট সেশন মুছে ফেলা হয়েছে');
        setSelectedSessionId(null);
        setCurrentSession(null);
        fetchSessions(false);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getDeptLabel = (dept?: string) => {
    switch (dept) {
      case 'deposit':
        return '💳 ডিপোজিট ও TrxID';
      case 'withdraw':
        return '💸 ক্যাশ-আউট';
      case 'bonus':
        return '🎁 বোনাস';
      case 'vip':
        return '👑 VIP সার্ভিস';
      case 'technical':
        return '🛠️ টেকনিক্যাল';
      default:
        return '⚡ সাধারণ';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Telemetry Stats */}
      <div className="bg-[#09291b] border border-emerald-700/50 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-black flex items-center justify-center shadow-lg shadow-yellow-500/20 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-white">২৪/৭ ভিআইপি লাইভ চ্যাট অপারেশনাল কনসোল</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-yellow-400 text-black shadow-sm">
                  LIVE 24/7
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${operatorOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                  {operatorOnline ? 'সাপোর্ট ডেস্ক সক্রিয়' : 'অফলাইন'}
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                প্লেয়ারদের রিয়েল-টাইম সমস্যা সমাধান, TrxID ভেরিফিকেশন এবং চ্যাট থেকেই সরাসরি ব্যালেন্স ও বোনাস বিতরণ করুন।
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              type="button"
              onClick={() => setOperatorOnline(!operatorOnline)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                operatorOnline
                  ? 'bg-emerald-800/60 hover:bg-emerald-700 text-emerald-200 border-emerald-600'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
              }`}
            >
              {operatorOnline ? '🟢 অনলাইন প্রস্তুত' : '⚪ অফলাইন মোড'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                fetchSessions(true).finally(() => setIsLoading(false));
              }}
              className="px-3 py-2 rounded-xl bg-[#0e3c29] hover:bg-[#145239] border border-emerald-600/60 text-emerald-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-emerald-800/60">
          <div className="bg-[#051c13] p-3 rounded-xl border border-emerald-800/70">
            <span className="text-[11px] text-gray-400 block font-medium">অপেক্ষারত প্লেয়ার (Waiting)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-amber-400 font-mono">{stats.waitingSessions}</span>
              {stats.waitingSessions > 0 && (
                <span className="text-[10px] text-amber-400 font-bold animate-pulse">জরুরি উত্তর দিন</span>
              )}
            </div>
          </div>

          <div className="bg-[#051c13] p-3 rounded-xl border border-emerald-800/70">
            <span className="text-[11px] text-gray-400 block font-medium">চলমান সেশন (Active)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-400 font-mono">{stats.activeSessions}</span>
              <span className="text-[10px] text-emerald-400/80">কথোপকথন চলছে</span>
            </div>
          </div>

          <div className="bg-[#051c13] p-3 rounded-xl border border-emerald-800/70">
            <span className="text-[11px] text-gray-400 block font-medium">আজকের সমাধান (Resolved)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-blue-400 font-mono">{stats.resolvedSessions}</span>
              <span className="text-[10px] text-gray-400">সফলভাবে সমাপ্ত</span>
            </div>
          </div>

          <div className="bg-[#051c13] p-3 rounded-xl border border-emerald-800/70">
            <span className="text-[11px] text-gray-400 block font-medium">প্লেয়ার সন্তুষ্টি রেটিং</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-yellow-400 font-mono flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {stats.avgRating || '5.0'}
              </span>
              <span className="text-[10px] text-yellow-300/80">/ ৫.০</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[720px]">
        {/* LEFT PANEL: Live Sessions Directory (4 Cols) */}
        <div className="lg:col-span-4 bg-[#09291b] border border-emerald-700/50 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Search and Filters Header */}
          <div className="p-3 bg-[#051c13] border-b border-emerald-800/70 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ইউজারনেম, ফোন বা মেসেজ খুঁজুন..."
                className="w-full bg-[#082a1d] border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-hidden focus:border-yellow-400"
              />
              <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'সব সেশন' },
                { id: 'waiting', label: `অপেক্ষারত (${stats.waitingSessions})`, highlight: stats.waitingSessions > 0 },
                { id: 'active', label: 'চলমান' },
                { id: 'resolved', label: 'সমাধানকৃত' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setStatusFilter(pill.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === pill.id
                      ? 'bg-yellow-400 text-black'
                      : pill.highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#0e3c29] text-gray-300 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Department Dropdown */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full bg-[#082a1d] border border-emerald-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-200"
            >
              <option value="all">সব ডিপার্টমেন্ট (All Departments)</option>
              <option value="deposit">💳 ডিপোজিট ও TrxID</option>
              <option value="withdraw">💸 উইথড্রয়াল ও ক্যাশ-আউট</option>
              <option value="bonus">🎁 বোনাস ও প্রমোশন</option>
              <option value="vip">👑 VIP সাপোর্ট সার্ভিস</option>
              <option value="technical">🛠️ টেকনিক্যাল ও অ্যাপ</option>
              <option value="general">⚡ সাধারণ জিজ্ঞাসা</option>
            </select>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-emerald-800/40">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Headphones className="w-8 h-8 text-emerald-600 mx-auto opacity-40" />
                <p className="text-xs">কোনো চ্যাট সেশন পাওয়া যায়নি।</p>
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = selectedSessionId === s.id;
                const isWaiting = s.status === 'waiting';

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-800/60 border-l-4 border-yellow-400'
                        : isWaiting
                        ? 'bg-amber-950/20 hover:bg-amber-950/40 border-l-4 border-amber-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-9 h-9 rounded-full bg-yellow-400 text-black font-black text-xs flex items-center justify-center border border-yellow-300">
                            {s.username.slice(0, 2).toUpperCase()}
                          </div>
                          {isWaiting && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-[#09291b] animate-ping" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs truncate">{s.username}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                              VIP {s.userVip ?? 1}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-300/80 font-mono">
                            ৳{(s.userBalance || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] text-gray-400 font-mono">
                          {s.lastMessageAt ? s.lastMessageAt.split(' ')[1]?.slice(0, 5) || s.lastMessageAt : ''}
                        </span>
                        {s.unreadAdminCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white font-black text-[10px]">
                            {s.unreadAdminCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Department Tag & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#051c13] text-emerald-200 text-[10px] font-medium border border-emerald-800">
                        {getDeptLabel(s.department)}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          s.status === 'waiting'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : s.status === 'active'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {s.status === 'waiting' ? 'অপেক্ষারত' : s.status === 'active' ? 'সক্রিয়' : 'সমাধানকৃত'}
                      </span>
                    </div>

                    {/* Message Snippet */}
                    <p className="text-[11px] text-gray-300 truncate mt-1.5">
                      {s.lastMessage || 'কোনো বার্তা নেই'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Live Console & Player Dossier (8 Cols) */}
        <div className="lg:col-span-8 bg-[#09291b] border border-emerald-700/50 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {currentSession ? (
            <>
              {/* Active Session Header Bar */}
              <div className="p-3.5 bg-[#051c13] border-b border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
                {/* Player Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-400 text-black font-black flex items-center justify-center border-2 border-yellow-300 shadow">
                    {currentSession.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-white">{currentSession.username}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black">
                        VIP {currentSession.userVip ?? 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold font-mono">
                        ব্যালেন্স: ৳{(currentSession.userBalance || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                      {currentSession.userPhone && <span>📞 {currentSession.userPhone}</span>}
                      <span>• ডিপার্টমেন্ট: <b className="text-emerald-300">{getDeptLabel(currentSession.department)}</b></span>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Dropdown */}
                  <select
                    value={currentSession.status}
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="bg-[#082a1d] border border-emerald-600 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 font-bold cursor-pointer"
                  >
                    <option value="active">🟢 সক্রিয় (Active)</option>
                    <option value="waiting">🟡 অপেক্ষারত (Waiting)</option>
                    <option value="resolved">🔵 সমাধানকৃত (Resolved)</option>
                    <option value="closed">⚪ সমাপ্ত (Closed)</option>
                  </select>

                  {/* Quick Credit Button */}
                  <button
                    type="button"
                    onClick={() => setIsCreditModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow cursor-pointer flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>ক্রেডিট/বোনাস দিন</span>
                  </button>

                  {/* Player Profile Link */}
                  {onOpenUserDetail && (
                    <button
                      type="button"
                      onClick={() => onOpenUserDetail(currentSession.userId)}
                      title="প্লেয়ার প্রোফাইল বিস্তারিত দেখুন"
                      className="p-1.5 rounded-xl bg-emerald-800/50 hover:bg-emerald-700 text-emerald-200 hover:text-white cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Session */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(currentSession.id)}
                    title="সেশন ডিলিট করুন"
                    className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Operator Assignment Ribbon */}
              <div className="px-3.5 py-2 bg-[#062117] border-b border-emerald-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">দায়িত্বপ্রাপ্ত সাপোর্ট স্পেশালিস্ট:</span>
                  <span className="text-yellow-300 font-bold flex items-center gap-1.5">
                    {currentSession.assignedAgent ? (
                      <>
                        <img
                          src={currentSession.assignedAgent.avatar}
                          alt="agent"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{currentSession.assignedAgent.name} ({currentSession.assignedAgent.role})</span>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">এখনো কোনো এজেন্ট নির্দিষ্ট হয়নি</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {STAFF_OPERATORS.map((op) => (
                    <button
                      key={op.name}
                      type="button"
                      onClick={() => handleAssignAgent(op)}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-800/40 hover:bg-emerald-700 text-emerald-200 border border-emerald-700 cursor-pointer"
                    >
                      {op.name.split(' ')[0]} নিযুক্ত
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Thread Scroll View */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#04160e]/50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    কোনো বার্তা এখনও নেই। নিচে প্লেয়ারকে অভিবাদন জানান।
                  </div>
                ) : (
                  messages.map((m) => {
                    const isUser = m.sender === 'user';
                    const isSystem = m.sender === 'system';
                    const isAgent = m.sender === 'agent';
                    const isBot = m.sender === 'bot';

                    if (isSystem) {
                      return (
                        <div key={m.id} className="flex justify-center my-2">
                          <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-medium text-center max-w-md">
                            {m.text}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex gap-2.5 ${isUser ? 'justify-start' : 'justify-end'}`}
                      >
                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-yellow-400 text-black font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow">
                            {m.senderName ? m.senderName.slice(0, 2).toUpperCase() : 'PL'}
                          </div>
                        )}

                        <div
                          className={`max-w-[78%] sm:max-w-[70%] p-3 rounded-2xl space-y-1.5 shadow-md ${
                            isUser
                              ? 'bg-[#09291b] border border-emerald-600/50 text-white rounded-tl-none'
                              : isAgent
                              ? 'bg-yellow-400 text-black font-medium rounded-tr-none'
                              : 'bg-emerald-800/80 text-emerald-100 rounded-tr-none border border-emerald-600/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-0.5 border-b border-current/10">
                            <span className="font-bold">{m.senderName || (isUser ? 'প্লেয়ার' : 'সাপোর্ট')}</span>
                            <span className="font-mono">{m.createdAt ? m.createdAt.split(' ')[1] || m.createdAt : ''}</span>
                          </div>

                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.text}</p>

                          {/* Quick Action Confirmation Badge */}
                          {m.quickAction && (
                            <div className="pt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/20 text-[10px] font-bold">
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                {m.quickAction.label}
                              </span>
                            </div>
                          )}
                        </div>

                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-emerald-700 text-yellow-300 font-bold text-xs flex items-center justify-center shrink-0 mt-1 shadow border border-emerald-500">
                            {isBot ? 'AI' : 'OP'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fast Canned Responses Strip */}
              <div className="px-3 py-1.5 bg-[#051c13] border-t border-emerald-800/70 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" /> দ্রুত উত্তর:
                </span>
                {CANNED_REPLIES.map((cr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyText(cr.text)}
                    className="px-2.5 py-1 rounded-lg bg-[#082a1d] hover:bg-emerald-800/50 border border-emerald-700 text-emerald-200 text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {cr.title}
                  </button>
                ))}
              </div>

              {/* Internal Staff Notes Collapsible */}
              <div className="px-3 py-2 bg-[#04160e] border-t border-emerald-900/60 flex items-center gap-2 text-xs">
                <FileText className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="অভ্যন্তরীণ স্টাফ নোট (যেমন: TrxID বিকাশ পোর্টালে ভেরিফাইড)..."
                  className="flex-1 bg-transparent border-none text-gray-300 text-xs focus:outline-none placeholder:text-gray-600"
                />
                <button
                  type="button"
                  onClick={handleSaveInternalNote}
                  disabled={isSavingNote}
                  className="px-2 py-0.5 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-200 font-bold text-[10px] cursor-pointer"
                >
                  {isSavingNote ? 'সেভ হচ্ছে...' : 'নোট সেভ'}
                </button>
              </div>

              {/* Message Input Form */}
              <form
                onSubmit={handleSendReply}
                className="p-3 bg-[#051c13] border-t border-emerald-800/80 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="প্লেয়ারকে সরাসরি উত্তর লিখুন (Enter টিপুন)..."
                  className="flex-1 bg-[#082a1d] border border-emerald-700 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-hidden focus:border-yellow-400"
                />

                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isSending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>পাঠান</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-900/40 text-yellow-400 flex items-center justify-center border border-emerald-700">
                <Headphones className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">কোনো চ্যাট সেশন নির্বাচিত নেই</h4>
              <p className="text-xs text-gray-400 max-w-sm">
                বাম পাশের তালিকা থেকে যেকোনো সক্রিয় বা অপেক্ষারত প্লেয়ারের সেশন নির্বাচন করে সরাসরি লাইভ সাপোর্ট শুরু করুন।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Credit Modal */}
      {isCreditModalOpen && currentSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  সরাসরি ব্যালেন্স / বোনাস প্রদান
                </h3>
                <p className="text-xs text-emerald-300/80">
                  প্লেয়ার: <b className="text-yellow-400">{currentSession.username}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteCredit} className="space-y-3.5">
              {/* Type selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCreditType('bonus')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    creditType === 'bonus'
                      ? 'bg-yellow-400 text-black shadow'
                      : 'bg-[#051c13] text-gray-300 border border-emerald-700'
                  }`}
                >
                  🎁 স্পেশাল বোনাস
                </button>
                <button
                  type="button"
                  onClick={() => setCreditType('credit')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    creditType === 'credit'
                      ? 'bg-emerald-500 text-black shadow'
                      : 'bg-[#051c13] text-gray-300 border border-emerald-700'
                  }`}
                >
                  💰 নগদ ক্রেডিট
                </button>
              </div>

              {/* Amount Quick Chips */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">দ্রুত টাকার পরিমাণ:</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[100, 200, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCreditAmount(amt.toString())}
                      className="px-2 py-1 rounded bg-[#051c13] hover:bg-emerald-800 border border-emerald-700 text-xs font-mono text-emerald-200 cursor-pointer"
                    >
                      +৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">টাকার পরিমাণ (BDT):</label>
                <input
                  type="number"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="যেমন: 500"
                  className="w-full bg-[#051c13] border border-emerald-600 rounded-xl px-3.5 py-2.5 text-base font-mono text-white focus:border-yellow-400"
                />
              </div>

              {/* Reason / note */}
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">বিবরণ / কারণ:</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="যেমন: VIP আনুগত্য বোনাস বা TrxID সমন্বয়"
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-bold cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCredit}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingCredit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  নিশ্চিত ক্রেডিট প্রদান করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
