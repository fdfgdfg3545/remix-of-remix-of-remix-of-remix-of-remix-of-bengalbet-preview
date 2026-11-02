// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  Search, 
  RefreshCw, 
  Users, 
  Gift, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Eye, 
  X,
  Megaphone,
  Shield,
  Trophy,
  Award,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface NeextHubAdminMessagesManagerProps {
  users: any[];
  showToast?: (msg: string) => void;
  onRefreshSiteUser?: () => void;
}

export const NeextHubAdminMessagesManager: React.FC<NeextHubAdminMessagesManagerProps> = ({
  users,
  showToast,
  onRefreshSiteUser
}) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [targetFilter, setTargetFilter] = useState<'all' | 'broadcast' | 'targeted'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [viewingMessage, setViewingMessage] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State for Sending Message
  const [formTargetType, setFormTargetType] = useState<'all' | 'specific'>('all');
  const [formSelectedUserId, setFormSelectedUserId] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('notice');
  const [formSender, setFormSender] = useState<string>('প্ল্যাটফর্ম');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formHeadline, setFormHeadline] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formClaimableBonus, setFormClaimableBonus] = useState<number>(0);
  const [formSteps, setFormSteps] = useState<string>('১. ইনবক্স নোটিশটি সতর্কতার সাথে পড়ুন।\n২. প্রয়োজনীয় অপশনে গিয়ে অফারটি সক্রিয় করুন।');
  const [formRules, setFormRules] = useState<string>('১. একাউন্টে তথ্য সঠিক হতে হবে।\n২. BengalBet শর্তাবলী প্রযোজ্য।');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load Messages from API
  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getMessages();
      if (res.success && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.warn('Admin Messages load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  // Quick Preset Templates
  const applyPreset = (presetType: 'mission' | 'deposit' | 'vip' | 'system') => {
    if (presetType === 'mission') {
      setFormCategory('mission');
      setFormSender('মিশন সেন্টার');
      setFormTitle('🏆 নতুন মিশন সম্পন্ন রিওয়ার্ড নোটিশ – এখনই সংগ্রহ করুন!');
      setFormHeadline('অভিনন্দন! আপনার দৈনিক মিশন রিওয়ার্ড প্রস্তুত 🎁');
      setFormDescription('আপনি সফলভাবে আজকের গেমিং মিশন সম্পন্ন করেছেন। আপনার বিশেষ ক্যাশ রিওয়ার্ড ইনবক্সে পাঠানো হলো। ক্লেইম বাটনে ক্লিক করে সরাসরি ব্যালেন্সে যোগ করুন।');
      setFormClaimableBonus(100);
      setFormSteps('১. নিচে "বোনাস দাবি করুন" বাটনে ক্লিক করুন।\n২. টাকা সাথে সাথে আপনার মেইন অ্যাকাউন্টে যোগ হবে।');
      setFormRules('১. মিশন রিওয়ার্ড ২৪ ঘণ্টার মধ্যে ক্লেইম করতে হবে।\n২. মাত্র ১x টার্নওভার সম্পন্ন করলেই উত্তোলনযোগ্য।');
    } else if (presetType === 'deposit') {
      setFormCategory('bonus');
      setFormSender('প্রমোশন টিম');
      setFormTitle('🔥 প্রথম ডিপোজিট বোনাস – সর্বোচ্চ ৪৭% ক্যাশব্যাক!');
      setFormHeadline('BengalBet স্পেশাল ডিপোজিট বোনাস উৎসব');
      setFormDescription('প্রতিদিন ন্যূনতম ৳১০০ ডিপোজিট করলেই পান অতিরিক্ত ৪৭% পর্যন্ত ক্যাশ বোনাস। স্লট, ক্র্যাশ এবং লাইভ ক্যাসিনোতে বাজি ধরে বড় অঙ্কের জ্যাকপট জিতুন!');
      setFormClaimableBonus(50);
      setFormSteps('১. বিকাশ/নগদে ডিপোজিট করুন।\n২. প্রমোশন পেজ থেকে ডিপোজিট অফার নির্বাচন করুন।');
      setFormRules('১. প্রতি একাউন্টে দিনে একবার গ্রহণযোগ্য।\n২. নিয়ম অমান্য করলে বোনাস বাতিল হতে পারে।');
    } else if (presetType === 'vip') {
      setFormCategory('vip');
      setFormSender('VIP লাউঞ্জ');
      setFormTitle('💎 এক্সক্লুসিভ VIP রিওয়ার্ড ও উইকলি ক্যাশব্যাক ক্রেডিট');
      setFormHeadline('আপনার ভিআইপি ক্লাবের বিশেষ উপহার!');
      setFormDescription('প্রিয় ভিআইপি মেম্বার, আপনার নিয়মিত বাজির জন্য প্ল্যাটফর্ম থেকে বিশেষ কৃতজ্ঞতা উপহার পাঠানো হয়েছে। এই বোনাস দিয়ে যেকোনো গেম খেলুন।');
      setFormClaimableBonus(250);
      setFormSteps('১. বোনাস দাবি বাটনে ক্লিক করে ব্যালেন্স গ্রহণ করুন।\n২. VIP সেন্টারে গিয়ে আপনার বর্তমান র‍্যাংক চেক করুন।');
      setFormRules('১. VIP ১ থেকে VIP ১০ স্তরের সদস্যদের জন্য প্রযোজ্য।\n২. উত্তোলন সীমা প্রযোজ্য নয়।');
    } else if (presetType === 'system') {
      setFormCategory('system');
      setFormSender('নিরাপত্তা বিভাগ');
      setFormTitle('🛡️ অ্যাকাউন্ট সিকিউরিটি ও সার্ভিস আপডেট নোটিশ');
      setFormHeadline('গুরুত্বপূর্ণ নিরাপত্তা নির্দেশিকা ও আপডেট');
      setFormDescription('আমাদের সার্ভারে নতুন সিকিউরিটি প্যাচ যুক্ত করা হয়েছে। আপনার ডিপোজিট ও উইথড্রল এখন আরও দ্রুত ৩ মিনিটে প্রসেস হবে। কারো সাথে আপনার পাসওয়ার্ড বা OTP শেয়ার করবেন না।');
      setFormClaimableBonus(0);
      setFormSteps('১. আপনার ফোন নম্বর ও বিকাশ নম্বর সঠিক আছে কিনা প্রোফাইলে যাচাই করুন।');
      setFormRules('১. BengalBet কাস্টমার সাপোর্ট কখনোই আপনার অ্যাকাউন্টের পাসওয়ার্ড চাইবে না।');
    }
  };

  // Handle Create Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('অনুগ্রহ করে বার্তার শিরোনাম লিখুন');
      return;
    }

    setIsSubmitting(true);
    try {
      const stepsArray = formSteps.split('\n').filter(s => s.trim().length > 0);
      const rulesArray = formRules.split('\n').filter(r => r.trim().length > 0);

      const payload = {
        userId: formTargetType === 'all' ? 'all' : formSelectedUserId,
        title: formTitle.trim(),
        headline: formHeadline.trim() || formTitle.trim(),
        sender: formSender.trim() || 'প্ল্যাটফর্ম',
        category: formCategory,
        claimableBonus: Number(formClaimableBonus) || 0,
        description: formDescription.trim(),
        steps: stepsArray,
        rules: rulesArray
      };

      const res = await api.admin.createBroadcastMessage(payload);
      if (res.success) {
        if (showToast) showToast('অভ্যন্তরীণ বার্তা সফলভাবে পাঠানো হয়েছে!');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setIsCreateModalOpen(false);
        // Reset form
        setFormTitle('');
        setFormHeadline('');
        setFormDescription('');
        setFormClaimableBonus(0);
        loadMessages();
        if (onRefreshSiteUser) onRefreshSiteUser();
      } else {
        alert(res.message || 'বার্তা পাঠাতে সমস্যা হয়েছে');
      }
    } catch (err: any) {
      alert(err.message || 'সার্ভার এরর');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await api.admin.deleteMessage(id);
      if (res.success) {
        setMessages(prev => prev.filter(m => m.id !== id));
        if (showToast) showToast('বার্তা সফলভাবে মুছে ফেলা হয়েছে');
        if (viewingMessage && viewingMessage.id === id) {
          setViewingMessage(null);
        }
      } else {
        alert('বার্তা মুছে ফেলা সম্ভব হয়নি');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered Messages
  const filteredMessages = messages.filter(msg => {
    // Target filter
    if (targetFilter === 'broadcast' && msg.userId !== 'all') return false;
    if (targetFilter === 'targeted' && msg.userId === 'all') return false;

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'bonus' && msg.category !== 'bonus' && !msg.claimableBonus) return false;
      if (categoryFilter === 'mission' && msg.category !== 'mission') return false;
      if (categoryFilter === 'notice' && msg.category !== 'notice' && msg.category) return false;
      if (categoryFilter === 'vip' && msg.category !== 'vip') return false;
      if (categoryFilter === 'system' && msg.category !== 'system') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (msg.title || '').toLowerCase().includes(q);
      const matchDesc = (msg.content?.description || '').toLowerCase().includes(q);
      const matchSender = (msg.sender || '').toLowerCase().includes(q);
      const matchUser = (msg.userId || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchSender || matchUser;
    }

    return true;
  });

  // Calculate quick stats
  const totalBroadcast = messages.filter(m => m.userId === 'all').length;
  const totalTargeted = messages.filter(m => m.userId !== 'all').length;
  const totalBonusMessages = messages.filter(m => Number(m.claimableBonus) > 0).length;

  return (
    <div id="admin-internal-messages-module" className="space-y-6 font-bengali text-white animate-in fade-in">
      
      {/* Top Header Card & Quick Actions */}
      <div className="bg-gradient-to-r from-[#0d3824] via-[#09291b] to-[#061e14] border border-emerald-700/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300 shadow-md">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>অভ্যন্তরীণ বার্তা ও নোটিশ কন্ট্রোল</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  সক্রিয়
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-emerald-200/80">
              সকল প্লেয়ার বা নির্দিষ্ট ইউজারের ইনবক্সে তাৎক্ষণিক নোটিশ, রিওয়ার্ড ও মিশন বোনাস প্রেরণ ও পরিচালনা করুন
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={loadMessages}
              disabled={isLoading}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/50 border border-emerald-600/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>রিফ্রেশ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>নতুন অভ্যন্তরীণ বার্তা প্রেরণ</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-emerald-800/60">
          <div className="bg-[#061e14]/70 border border-emerald-800/50 rounded-xl p-3">
            <div className="text-[11px] text-emerald-300/80 font-medium">মোট অভ্যন্তরীণ বার্তা</div>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{messages.length}</div>
          </div>
          <div className="bg-[#061e14]/70 border border-emerald-800/50 rounded-xl p-3">
            <div className="text-[11px] text-emerald-300/80 font-medium">সকল প্লেয়ারকে ব্রডকাস্ট</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">{totalBroadcast}</div>
          </div>
          <div className="bg-[#061e14]/70 border border-emerald-800/50 rounded-xl p-3">
            <div className="text-[11px] text-emerald-300/80 font-medium">নির্দিষ্ট ইউজার নোটিশ</div>
            <div className="text-lg sm:text-xl font-black text-yellow-300 mt-0.5">{totalTargeted}</div>
          </div>
          <div className="bg-[#061e14]/70 border border-emerald-800/50 rounded-xl p-3">
            <div className="text-[11px] text-emerald-300/80 font-medium">বোনাস ও রিওয়ার্ড নোটিশ</div>
            <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{totalBonusMessages} টি</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#082216] border border-emerald-800/50 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-emerald-400/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="শিরোনাম, প্রেরক বা ইউজার দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#04140d] border border-emerald-700/50 text-xs text-white placeholder-emerald-400/40 focus:outline-hidden focus:border-yellow-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Target and Category Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 text-xs">
          {/* Target Tabs */}
          <div className="bg-[#04140d] p-1 rounded-xl border border-emerald-800/60 flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setTargetFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                targetFilter === 'all' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              সবগুলো
            </button>
            <button
              type="button"
              onClick={() => setTargetFilter('broadcast')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                targetFilter === 'broadcast' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              ব্রডকাস্ট (সকল)
            </button>
            <button
              type="button"
              onClick={() => setTargetFilter('targeted')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                targetFilter === 'targeted' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              নির্দিষ্ট ইউজার
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-800/60 text-xs text-emerald-200 font-bold focus:outline-hidden focus:border-yellow-400 cursor-pointer shrink-0"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="notice">📢 সাধারণ নোটিশ</option>
            <option value="bonus">🎁 বোনাস ও অফার</option>
            <option value="mission">🏆 মিশন ও রিওয়ার্ড</option>
            <option value="vip">💎 ভিআইপি অফার</option>
            <option value="system">🛡️ সিস্টেম আপডেট</option>
          </select>
        </div>
      </div>

      {/* Messages List Table & Cards */}
      <div className="bg-[#082216] border border-emerald-800/50 rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-16 text-center text-emerald-300/60 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-yellow-400" />
            <span>অভ্যন্তরীণ বার্তা লোড হচ্ছে...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400">
              <Mail className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm">কোনো বার্তা পাওয়া যায়নি</p>
            <p className="text-gray-500">নতুন বার্তা পাঠাতে উপরের "নতুন অভ্যন্তরীণ বার্তা প্রেরণ" বাটনে ক্লিক করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-200">
              <thead className="bg-[#051a10] text-[11px] text-emerald-300/80 uppercase font-bold border-b border-emerald-800/60">
                <tr>
                  <th className="py-3.5 px-4">ক্যাটাগরি ও প্রেরক</th>
                  <th className="py-3.5 px-4">শিরোনাম ও বিবরণ</th>
                  <th className="py-3.5 px-4">প্রাপক (টার্গেট)</th>
                  <th className="py-3.5 px-4 text-center">বোনাস (BDT)</th>
                  <th className="py-3.5 px-4">তারিখ</th>
                  <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/40">
                {filteredMessages.map((msg) => {
                  const isBroadcast = msg.userId === 'all';
                  const hasBonus = Number(msg.claimableBonus) > 0;

                  return (
                    <tr key={msg.id} className="hover:bg-emerald-900/20 transition-colors">
                      {/* Category & Sender */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-white text-xs">{msg.sender || 'প্ল্যাটফর্ম'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-800/80 text-emerald-300 w-fit">
                            {msg.category === 'bonus' ? '🎁 বোনাস' :
                             msg.category === 'mission' ? '🏆 মিশন' :
                             msg.category === 'vip' ? '💎 ভিআইপি' :
                             msg.category === 'system' ? '🛡️ সিস্টেম' : '📢 নোটিশ'}
                          </span>
                        </div>
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                          {msg.title}
                        </div>
                        <p className="text-gray-400 text-[11px] line-clamp-1 mt-0.5">
                          {msg.content?.description || 'কোনো বিবরণ নেই'}
                        </p>
                      </td>

                      {/* Target */}
                      <td className="py-3 px-4">
                        {isBroadcast ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                            <Users className="w-3 h-3" />
                            <span>সকল প্লেয়ার</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-yellow-300 text-[11px] font-bold font-mono">
                              👤 {msg.userId}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Claimable Bonus */}
                      <td className="py-3 px-4 text-center">
                        {hasBonus ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-bold font-mono text-xs">
                            <Gift className="w-3.5 h-3.5 text-yellow-400" />
                            <span>৳{msg.claimableBonus}</span>
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[11px] font-mono">—</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                        {msg.dateFull || msg.displayTime || 'আজ'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingMessage(msg)}
                            className="p-1.5 rounded-lg bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-300 hover:text-white transition-colors cursor-pointer"
                            title="বিস্তারিত দেখুন"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingId(msg.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-800/50 text-red-400 hover:text-white transition-colors cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / BROADCAST MESSAGE MODAL                                  */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#092b1d] border-2 border-yellow-400/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-bengali">
            {/* Modal Header */}
            <div className="bg-[#061e14] px-5 py-4 border-b border-emerald-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  নতুন অভ্যন্তরীণ বার্তা প্রেরণ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendMessage} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Quick Template Presets */}
              <div className="bg-[#051a10] p-3 rounded-xl border border-emerald-800/70 space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>দ্রুত রেডিমেড টেমপ্লেট নির্বাচন করুন:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('mission')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🏆 মিশন রিওয়ার্ড (৳১০০)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('deposit')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-800 text-yellow-200 border border-amber-700/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🔥 প্রথম ডিপোজিট বোনাস
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('vip')}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-700/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    💎 ভিআইপি রিওয়ার্ড
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('system')}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-800 text-blue-200 border border-blue-700/50 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    🛡️ সিকিউরিটি অ্যালার্ট
                  </button>
                </div>
              </div>

              {/* Target Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-emerald-300">প্রাপক নির্বাচন (Target):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormTargetType('all')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formTargetType === 'all'
                        ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                        : 'bg-[#051a10] text-gray-300 border-emerald-800/60 hover:bg-emerald-900/40'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>সকল প্লেয়ার (ব্রডকাস্ট)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTargetType('specific')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formTargetType === 'specific'
                        ? 'bg-yellow-400 text-black border-yellow-300 shadow'
                        : 'bg-[#051a10] text-gray-300 border-emerald-800/60 hover:bg-emerald-900/40'
                    }`}
                  >
                    <span>👤 নির্দিষ্ট প্লেয়ার</span>
                  </button>
                </div>

                {formTargetType === 'specific' && (
                  <div className="pt-2">
                    <select
                      value={formSelectedUserId}
                      onChange={e => setFormSelectedUserId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white text-xs font-mono focus:outline-hidden focus:border-yellow-400"
                    >
                      <option value="">-- প্লেয়ার অ্যাকাউন্ট নির্বাচন করুন --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.username || u.phone || u.id} (ব্যালেন্স: ৳{u.balance || 0})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Sender & Category & Claimable Bonus Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-300">প্রেরকের নাম:</label>
                  <input
                    type="text"
                    value={formSender}
                    onChange={e => setFormSender(e.target.value)}
                    placeholder="যেমন: প্ল্যাটফর্ম / কাস্টমার সাপোর্ট"
                    className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white focus:outline-hidden focus:border-yellow-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-300">ক্যাটাগরি:</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="notice">📢 সাধারণ নোটিশ</option>
                    <option value="bonus">🎁 ডিপোজিট ও বোনাস</option>
                    <option value="mission">🏆 মিশন ও রিওয়ার্ড</option>
                    <option value="vip">💎 ভিআইপি অফার</option>
                    <option value="system">🛡️ সিস্টেম নোটিশ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-yellow-300 flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5" />
                    <span>নগদ বোনাস উপহার (ঐচ্ছিক):</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formClaimableBonus}
                      onChange={e => setFormClaimableBonus(Number(e.target.value))}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-yellow-300 font-bold font-mono focus:outline-hidden focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Headline */}
              <div className="space-y-1">
                <label className="font-bold text-white">বার্তার মূল শিরোনাম (Subject) *:</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="যেমন: 🔥 নতুন মিশন সম্পন্ন রিওয়ার্ড নোটিশ"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white focus:outline-hidden focus:border-yellow-400 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-300">হেডলাইন (ব্যানার হেডার):</label>
                <input
                  type="text"
                  value={formHeadline}
                  onChange={e => setFormHeadline(e.target.value)}
                  placeholder="ব্যানারের প্রধান বড় লেখা..."
                  className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white focus:outline-hidden focus:border-yellow-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-white">বার্তার পূর্ণ বিবরণ (Message Body):</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="প্লেয়ারদের বিস্তারিত নোটিশ বা নির্দেশাবলী লিখুন..."
                  className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white focus:outline-hidden focus:border-yellow-400 leading-relaxed"
                />
              </div>

              {/* Steps & Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-emerald-300">কিভাবে পাবেন (ধাপসমূহ - প্রতি লাইনে একটি):</label>
                  <textarea
                    rows={2}
                    value={formSteps}
                    onChange={e => setFormSteps(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white text-[11px] focus:outline-hidden focus:border-yellow-400 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-amber-300">শর্তাবলী ও নিয়মাবলী (প্রতি লাইনে একটি):</label>
                  <textarea
                    rows={2}
                    value={formRules}
                    onChange={e => setFormRules(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#04140d] border border-emerald-700/60 text-white text-[11px] focus:outline-hidden focus:border-yellow-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black flex items-center gap-1.5 shadow-lg shadow-yellow-500/20 cursor-pointer disabled:opacity-50 transition-all active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'প্রেরণ করা হচ্ছে...' : 'এখনই প্রেরণ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MESSAGE DETAIL PREVIEW MODAL                                      */}
      {/* ========================================================================= */}
      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-bengali">
            {/* Header */}
            <div className="bg-[#0b3323] px-5 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-sm sm:text-base">অভ্যন্তরীণ বার্তা প্রিভিউ</span>
              </div>
              <button
                onClick={() => setViewingMessage(null)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>প্রেরক: <strong className="text-gray-800">{viewingMessage.sender}</strong></span>
                  <span className="font-mono">{viewingMessage.dateFull || viewingMessage.displayTime}</span>
                </div>
                <div className="text-xs text-gray-600">
                  টার্গেট:{' '}
                  <strong className="text-emerald-700">
                    {viewingMessage.userId === 'all' ? 'সকল প্লেয়ার (ব্রডকাস্ট)' : viewingMessage.userId}
                  </strong>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                {viewingMessage.content?.headline || viewingMessage.title}
              </h2>

              <p className="text-gray-700 leading-relaxed">
                {viewingMessage.content?.description}
              </p>

              {/* Bonus Tag */}
              {Number(viewingMessage.claimableBonus) > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-100 border border-yellow-300 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <div>
                      <div className="font-black text-amber-900 text-sm">৳{viewingMessage.claimableBonus} নগদ বোনাস উপহার</div>
                      <div className="text-[11px] text-amber-700">প্লেয়াররা এই বার্তায় ক্লেইম বাটন দেখতে পাবেন</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Steps */}
              {viewingMessage.content?.howToGetSteps?.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs">নির্দেশনা:</h4>
                  <ul className="space-y-1 text-xs text-gray-600 pl-2">
                    {viewingMessage.content.howToGetSteps.map((s: string, idx: number) => (
                      <li key={idx} className="list-disc">{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rules */}
              {viewingMessage.content?.rules?.length > 0 && (
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs">শর্তাবলী:</h4>
                  <ul className="space-y-1 text-xs text-gray-600 pl-2">
                    {viewingMessage.content.rules.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-3 bg-gray-100 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingMessage(null)}
                className="px-4 py-2 bg-[#0b3323] text-white text-xs font-bold rounded-xl"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#092b1d] border border-red-500/40 rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">বার্তাটি মুছে ফেলতে চান?</h3>
              <p className="text-gray-400 text-xs mt-1">মুছে ফেলার পর প্লেয়ারদের ইনবক্স থেকে এই বার্তাটি আর দেখা যাবে না।</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-bold hover:bg-gray-700"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage(deletingId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 shadow-md"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
