// @ts-nocheck
import React, { useState } from 'react';
import { 
  Trash2, 
  Mail, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  CheckSquare,
  Square,
  Gift,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { UserAccount } from '../types';
import confetti from 'canvas-confetti';

export interface InternalMessage {
  id: string;
  sender: string;
  title: string;
  displayTime: string;
  dateFull: string;
  isRead: boolean;
  category?: string;
  claimableBonus?: number;
  claimedBy?: string[];
  content: {
    headline: string;
    description: string;
    howToGetTitle: string;
    howToGetSteps: string[];
    rulesTitle: string;
    rules: string[];
    officialLinksTitle?: string;
    officialLinks?: string[];
  };
}

const INITIAL_MESSAGES: InternalMessage[] = [
  {
    id: 'msg-1',
    sender: 'প্ল্যাটফর্ম',
    title: '🔥 প্রথম ডিপোজিট বোনাস – সর্বোচ্চ ৪৭%!',
    displayTime: 'আজ ১৭:১৩',
    dateFull: '২০২৬/০৮/২৯ ১৭:১৩',
    isRead: false,
    content: {
      headline: '🔥 প্রথম ডিপোজিট বোনাস – সর্বোচ্চ ৪৭%!',
      description: 'BengalBet-এ আপনার প্রথম ডিপোজিটে বোনাস পান। 💰 প্রতিদিন ন্যূনতম ৳১০০ ডিপোজিট করলে পান সর্বোচ্চ ৪৭% বোনাস এবং ২০× টার্নওভার। বেশি ডিপোজিট = বেশি বোনাস। 🎰 শুধু স্লট ও ফিশিং গেমের জন্য। 🐟',
      howToGetTitle: 'কিভাবে পাবেন:',
      howToGetSteps: [
        'রেজিস্টার করুন → সাইন ইন করুন → ডিপোজিট করুন → "প্রথম ডিপোজিট অফার" নির্বাচন করুন।',
        'বোনাস স্বয়ংক্রিয়ভাবে পাঠানো হবে।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  নাম বা ব্যাংক পরিবর্তন করলে বোনাস বাতিল ❌',
        '২  একবারই বোনাস পেতে পারবেন; একই IP/SIM/কার্ড ব্যবহার করলে বাতিল ⚠️',
        '৩  রেজিস্ট্রেশন তথ্য সঠিক হতে হবে 📝',
        '৪  শুধুমাত্র স্লট 🎰 ও ফিশিং 🐟 গেমে প্রযোজ্য',
        '৫  উইথড্র-এর আগে ওয়েজারিং সম্পূর্ণ করতে হবে 🎯',
        '৬  নতুন একাউন্টে প্রথম ডিপোজিট অফার একবারই গ্রহণযোগ্য ✅'
      ],
      officialLinksTitle: 'BengalBet অফিসিয়াল লিঙ্ক',
      officialLinks: ['BengalBet.me', 'BengalBet.vip', 'BengalBet.one', 'BengalBet.now']
    }
  },
  {
    id: 'msg-2',
    sender: 'প্ল্যাটফর্ম',
    title: '📢 মাসিক VIP রিওয়ার্ড নোটিশ 💎',
    displayTime: 'আজ ১০:০৬',
    dateFull: '২০২৬/০৮/২৯ ১০:০৬',
    isRead: false,
    content: {
      headline: '📢 মাসিক VIP রিওয়ার্ড নোটিশ 💎',
      description: 'অভিনন্দন! আপনার ভিআইপি স্ট্যাটাস আপগ্রেড সম্পন্ন হয়েছে। প্রতি মাসের ১ তারিখে সকল ভিআইপি ১-১০ স্তরের সদস্যদের জন্য বিশেষ মান্থলি ক্যাশ রিওয়ার্ড বিতরণ করা হয়।',
      howToGetTitle: 'পুরস্কার গ্রহণের নিয়ম:',
      howToGetSteps: [
        'ভিআইপি সেন্টারে যান এবং মাসিক রিওয়ার্ড বক্সে ক্লিক করুন।',
        'আপনার বর্তমান ভিআইপি লেভেল অনুযায়ী নগদ বোনাস সরাসরি মেইন ব্যালেন্সে জমা হবে।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  বোনাস যেকোনো ক্যাসিনো ও স্লট গেমে বাজি ধরতে ব্যবহার করা যাবে।',
        '২  টার্নওভার রিকোয়ারমেন্ট মাত্র ১x।'
      ],
      officialLinksTitle: 'BengalBet অফিসিয়াল লিঙ্ক',
      officialLinks: ['BengalBet.vip', 'BengalBet.me']
    }
  },
  {
    id: 'msg-3',
    sender: 'প্ল্যাটফর্ম',
    title: '⭐ রিডেম্পশন কোড প্রোমো অ্যালার্ট: BDT27302',
    displayTime: 'গতকাল ২২:০৬',
    dateFull: '২০২৬/০৮/২৮ ২২:০৬',
    isRead: false,
    content: {
      headline: '⭐ রিডেম্পশন কোড প্রোমো অ্যালার্ট: BDT27302',
      description: 'আপনার জন্য একটি বিশেষ সীমিত সময়ের রিডেম্পশন কোড উপহার পাঠানো হয়েছে! কোড: BDT27302। রিডিম করে সাথে সাথে ৳১০০ পর্যন্ত ফ্রি বোনাস গ্রহণ করুন।',
      howToGetTitle: 'কিভাবে রিডিম করবেন:',
      howToGetSteps: [
        'অ্যাকাউন্ট রেকর্ড অথবা পুরস্কার সেন্টারে যান।',
        'রিডেম্পশন কোড বক্সে BDT27302 লিখুন এবং নিশ্চিত করুন।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  কোডের মেয়াদ আগামী ২৪ ঘণ্টার মধ্যে কার্যকর থাকবে।',
        '২  প্রতি অ্যাকাউন্টে একবারই রিডিম প্রযোজ্য।'
      ]
    }
  },
  {
    id: 'msg-4',
    sender: 'প্ল্যাটফর্ম',
    title: '🥷 বন্ধু আমন্ত্রণ বোনাস – ১ জন বন্ধু আমন্ত্রণে পান ৳৩০০, ...',
    displayTime: 'গতকাল ১৬:০৩',
    dateFull: '২০২৬/০৮/২৮ ১৬:০৩',
    isRead: false,
    content: {
      headline: '🥷 বন্ধু আমন্ত্রণ বোনাস – ১ জন বন্ধু আমন্ত্রণে পান ৳৩০০',
      description: 'আপনার বন্ধুদের BengalBet-তে আমন্ত্রণ জানান এবং আনলিমিটেড রেফারেল কমিশন উপভোগ করুন। আপনার রেফারেল লিঙ্কের মাধ্যমে বন্ধু যোগ দিয়ে ডিপোজিট করলেই পাবেন ৳৩০০ বোনাস এবং তাদের প্রতি বেটের উপর ১.২% পর্যন্ত আজীবন কমিশন!',
      howToGetTitle: 'আমন্ত্রণ প্রক্রিয়া:',
      howToGetSteps: [
        '"বন্ধুদের আমন্ত্রণ করুন" মেন্যুতে গিয়ে আপনার ব্যক্তিগত লিংকটি কপি করুন।',
        'হোয়াটসঅ্যাপ, টেলিগ্রাম অথবা ফেসবুকে বন্ধুদের সাথে শেয়ার করুন।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  আমন্ত্রিত বন্ধুর ন্যূনতম মোট ডিপোজিট ৳৫০০ হতে হবে।',
        '২  রেফারেল বোনাস রিয়েল-টাইমে ব্যালেন্সে ক্রেডিট হয়।'
      ]
    }
  },
  {
    id: 'msg-5',
    sender: 'প্ল্যাটফর্ম',
    title: '🎁🏆 ভিআইপি সদস্যদের জন্য অফার 🏆🎁',
    displayTime: 'গতকাল ১০:০১',
    dateFull: '২০২৬/০৮/২৮ ১০:০১',
    isRead: false,
    content: {
      headline: '🎁🏆 ভিআইপি সদস্যদের জন্য বিশেষ সাপ্তাহিক অফার 🏆🎁',
      description: 'প্রিমিয়াম সদস্যদের জন্য এই সপ্তাহের বিশেষ স্লট টুর্নামেন্ট ও ক্যাশব্যাক পুল এখন লাইভ! সর্বোচ্চ ৳১,৫০,০০০ প্রাইজ পুলের অংশীদার হতে আজই আপনার পছন্দের স্লট গেমে বাজি ধরুন।',
      howToGetTitle: 'অংশগ্রহণের উপায়:',
      howToGetSteps: [
        'স্লট ক্যাটাগরির যেকোনো PG Soft, JILI বা Pragmatic গেমে খেলুন।',
        'লিডারবোর্ডে পয়েন্ট সংগ্রহ করে সরাসরি পুরস্কার জিতুন।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  টুর্নামেন্ট চলাকালীন প্রতিটি ১ টাকার বাজিতে ১ পয়েন্ট অর্জিত হয়।'
      ]
    }
  },
  {
    id: 'msg-6',
    sender: 'প্ল্যাটফর্ম',
    title: '⭐ রিডেম্পশন কোড প্রোমো অ্যালার্ট: BDT27391',
    displayTime: '০৮-২৭ ২২:১৩',
    dateFull: '২০২৬/০৮/২৭ ২২:১৩',
    isRead: false,
    content: {
      headline: '⭐ রিডেম্পশন কোড প্রোমো অ্যালার্ট: BDT27391',
      description: 'উইকেন্ড স্পেশাল গিফট কোড BDT27391 অ্যাক্টিভেট হয়েছে। ফ্রি স্পিন ও ক্যাশ বোনাস উপভোগ করতে এখনই কোডটি রিডিম করুন।',
      howToGetTitle: 'কিভাবে ক্লেইম করবেন:',
      howToGetSteps: [
        'উপহার কোড BDT27391 লিখে ক্লেইম বাটনে চাপুন।'
      ],
      rulesTitle: 'নিয়মাবলী:',
      rules: [
        '১  শুধুমাত্র সক্রিয় সদস্যদের জন্য প্রযোজ্য।'
      ]
    }
  },
  {
    id: 'msg-7',
    sender: 'প্ল্যাটফর্ম',
    title: '🎉 দৈনিক চেক-ইন রিওয়ার্ড ক্লেইম করুন ৳২০!',
    displayTime: '০৮-২৭ ১০:০০',
    dateFull: '২০২৬/০৮/২৭ ১০:০০',
    isRead: false,
    content: {
      headline: '🎉 দৈনিক চেক-ইন রিওয়ার্ড ক্লেইম করুন ৳২০!',
      description: 'আজকের দৈনিক উপস্থিতি বোনাস আপনার জন্য অপেক্ষা করছে। একটানা ৭ দিন চেক-ইন করলে পাবেন অতিরিক্ত ৳১৫০ লাকি ড্র টিকিট।',
      howToGetTitle: 'চেক-ইন পদ্ধতি:',
      howToGetSteps: ['মিশন পেজে গিয়ে দৈনিক চেক-ইন অপশনে ক্লিক করুন।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  প্রতিদিন বাংলাদেশ সময় রাত ১২টায় চেক-ইন রিসেট হয়।']
    }
  },
  {
    id: 'msg-8',
    sender: 'প্ল্যাটফর্ম',
    title: '🏆 সাপ্তাহিক লিডারবোর্ড ক্যাশব্যাক আপডেট ৳৫,০০০',
    displayTime: '০৮-২৬ ১৮:৩০',
    dateFull: '২০২৬/০৮/২৬ ১৮:৩০',
    isRead: false,
    content: {
      headline: '🏆 সাপ্তাহিক লিডারবোর্ড ক্যাশব্যাক আপডেট ৳৫,০০০',
      description: 'গত সপ্তাহের ক্যাসিনো ও ক্র্যাশ গেমের সাপ্তাহিক রিবেট হিসাব সম্পন্ন হয়েছে এবং আপনার অ্যাকাউন্টে রিবেট ফান্ড যুক্ত হয়েছে।',
      howToGetTitle: 'ব্যালেন্স চেক:',
      howToGetSteps: ['আপনার ওয়ালেটে রিবেট ব্যালেন্স স্বয়ংক্রিয়ভাবে ক্রেডিট হয়েছে।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  রিবেট টাকার জন্য কোনো অতিরিক্ত ওয়েজারিং প্রয়োজন নেই।']
    }
  },
  {
    id: 'msg-9',
    sender: 'প্ল্যাটফর্ম',
    title: '🔥 ক্যাসিনো লাকি ড্র ফলাফল প্রকাশিত',
    displayTime: '০৮-২৫ ১৪:১৫',
    dateFull: '২০২৬/০৮/২৫ ১৪:১৫',
    isRead: false,
    content: {
      headline: '🔥 ক্যাসিনো লাকি ড্র ফলাফল প্রকাশিত',
      description: 'গ্র্যান্ড লাকি ড্র রাউন্ড ৩ এর ফলাফল প্রকাশিত হয়েছে। বিজয়ী তালিকা দেখতে পুরস্কার কেন্দ্র পরিদর্শন করুন।',
      howToGetTitle: 'ফলাফল দেখুন:',
      howToGetSteps: ['পুরস্কার সেন্টারে লাকি ড্র ট্যাবে যান।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  পুরস্কার বিজয়ীদের একাউন্টে টাকা ২৪ ঘণ্টার মধ্যে জমা হবে।']
    }
  },
  {
    id: 'msg-10',
    sender: 'প্ল্যাটফর্ম',
    title: '💎 সুপার ভিআইপি এক্সক্লুসিভ রিবেট নোটিফিকেশন',
    displayTime: '০৮-২৪ ০৯:০০',
    dateFull: '২০২৬/০৮/২৪ ০৯:০০',
    isRead: false,
    content: {
      headline: '💎 সুপার ভিআইপি এক্সক্লুসিভ রিবেট নোটিফিকেশন',
      description: 'ভিআইপি সদস্যদের জন্য প্রতিদিনের আনলিমিটেড লাইভ ডিলার ও স্লট রিবেট হার বৃদ্ধি করে ১.৫% করা হয়েছে।',
      howToGetTitle: 'সুবিধা:',
      howToGetSteps: ['স্বয়ংক্রিয়ভাবে প্রতিদিন দুপুর ১২টায় রিবেট গণনা করা হয়।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  সকল লাইভ ক্যাসিনো টেবিল অন্তর্ভুক্ত।']
    }
  },
  {
    id: 'msg-11',
    sender: 'প্ল্যাটফর্ম',
    title: '🎁 বিশেষ উৎসব বোনাস প্যাকেজ ২০২৬',
    displayTime: '০৮-২৩ ২০:৪৫',
    dateFull: '২০২৬/০৮/২৩ ২০:৪৫',
    isRead: false,
    content: {
      headline: '🎁 বিশেষ উৎসব বোনাস প্যাকেজ ২০২৬',
      description: 'উৎসবের মৌসুমে অতিরিক্ত ডিপোজিট রিচার্জ বোনাস ও গোল্ডেন এগ স্ম্যাশ টিকিট উপভোগ করুন।',
      howToGetTitle: 'অংশগ্রহণ:',
      howToGetSteps: ['ডিপোজিট করার সময় উৎসবের প্রোমো কোড নির্বাচন করুন।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  অফার সীমিত সময়ের জন্য প্রযোজ্য।']
    }
  },
  {
    id: 'msg-12',
    sender: 'প্ল্যাটফর্ম',
    title: '🛡️ অ্যাকাউন্ট সিকিউরিটি আপডেট ও ভেরিফিকেশন নোটিশ',
    displayTime: '০৮-২২ ১১:২০',
    dateFull: '২০২৬/০৮/২২ ১১:২০',
    isRead: false,
    content: {
      headline: '🛡️ অ্যাকাউন্ট সিকিউরিটি আপডেট ও ভেরিফিকেশন নোটিশ',
      description: 'আপনার তহবিলের সর্বোচ্চ সুরক্ষার জন্য আপনার একাউন্টে ফোন নম্বর ও লেনদেনের পাসওয়ার্ড সুরক্ষিত রাখুন। কখনো কারো সাথে OTP শেয়ার করবেন না।',
      howToGetTitle: 'নিরাপত্তা ব্যবস্থা:',
      howToGetSteps: ['ব্যক্তিগত কেন্দ্রে আমার অ্যাকাউন্ট অপশনে গিয়ে পাসওয়ার্ড আপডেট করুন।'],
      rulesTitle: 'নিয়মাবলী:',
      rules: ['১  BengalBet সাপোর্ট টিম কখনো আপনার পাসওয়ার্ড চাইবে না।']
    }
  }
];

interface InternalMessagesViewProps {
  user?: UserAccount;
  onUnreadCountChange?: (count: number) => void;
  onClaimBonus?: (amount: number, reason: string) => void;
  showToast?: (msg: string) => void;
}

export const InternalMessagesView: React.FC<InternalMessagesViewProps> = ({
  user,
  onUnreadCountChange,
  onClaimBonus,
  showToast
}) => {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [selectedCheckIds, setSelectedCheckIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'bonus' | 'notice'>('all');
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const itemsPerPage = 6;

  const fetchLiveMessages = async () => {
    setIsLoading(true);
    try {
      const res = await api.messages.getMessages();
      if (res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
        if (res.messages.length > 0 && (!selectedMsgId || !res.messages.some(m => m.id === selectedMsgId))) {
          setSelectedMsgId(res.messages[0].id);
        }
        if (onUnreadCountChange) onUnreadCountChange(res.unreadCount || 0);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Messages API error:', err);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLiveMessages();
  }, []);

  const filteredMessages = messages.filter(m => {
    if (categoryFilter === 'bonus') {
      return m.category === 'bonus' || m.category === 'mission' || !!m.claimableBonus;
    }
    if (categoryFilter === 'notice') {
      return m.category === 'notice' || m.category === 'system' || (!m.claimableBonus && m.category !== 'bonus');
    }
    return true;
  });

  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage) || 1;
  const currentMessages = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const selectedMessage = messages.find(m => m.id === selectedMsgId);

  const handleSelectMessage = (msg: InternalMessage) => {
    setSelectedMsgId(msg.id);
    if (!msg.isRead) {
      api.messages.markRead(msg.id).catch(() => {});
      setMessages(prev => {
        const updated = prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m);
        const unreadCount = updated.filter(m => !m.isRead).length;
        if (onUnreadCountChange) onUnreadCountChange(unreadCount);
        return updated;
      });
    }
  };

  const handleClaimBonus = async (msg: InternalMessage) => {
    if (!msg.claimableBonus || claimedIds.includes(msg.id) || isClaiming) return;
    setIsClaiming(true);
    try {
      const res = await api.messages.claimBonus(msg.id);
      if (res.success) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
        setClaimedIds(prev => [...prev, msg.id]);
        const amount = res.amount || msg.claimableBonus;
        if (onClaimBonus) {
          onClaimBonus(amount, `অভ্যন্তরীণ বার্তা বোনাস: ৳${amount}`);
        }
        if (showToast) {
          showToast(res.message || `৳${amount} বোনাস সফলভাবে অ্যাকাউন্টে জমা হয়েছে!`);
        }
      } else {
        if (showToast) {
          showToast(res.message || 'বোনাস ইতিমধ্যে দাবি করা হয়েছে');
        }
      }
    } catch (err) {
      console.warn('Claim bonus error:', err);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleToggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCheckIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentPageIds = currentMessages.map(m => m.id);
    const allSelected = currentPageIds.every(id => selectedCheckIds.includes(id));
    if (allSelected) {
      setSelectedCheckIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedCheckIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const isAllCurrentSelected = currentMessages.length > 0 && currentMessages.every(m => selectedCheckIds.includes(m.id));

  const handleDeleteSelected = () => {
    if (selectedCheckIds.length === 0) return;
    selectedCheckIds.forEach(id => api.messages.delete(id).catch(() => {}));
    setMessages(prev => {
      const updated = prev.filter(m => !selectedCheckIds.includes(m.id));
      const unreadCount = updated.filter(m => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
      return updated;
    });
    setSelectedCheckIds([]);
    if (selectedMsgId && selectedCheckIds.includes(selectedMsgId)) {
      setSelectedMsgId(null);
    }
  };

  const handleDeleteSingle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    api.messages.delete(id).catch(() => {});
    setMessages(prev => {
      const updated = prev.filter(m => m.id !== id);
      const unreadCount = updated.filter(m => !m.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
      return updated;
    });
    setSelectedCheckIds(prev => prev.filter(item => item !== id));
    if (selectedMsgId === id) {
      setSelectedMsgId(null);
    }
  };

  const handleMarkAllRead = () => {
    messages.forEach(m => {
      if (!m.isRead) api.messages.markRead(m.id).catch(() => {});
    });
    setMessages(prev => {
      const updated = prev.map(m => ({ ...m, isRead: true }));
      if (onUnreadCountChange) onUnreadCountChange(0);
      return updated;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Top Header Tab: ইনবক্স + Category filters */}
      <div className="border-b border-gray-200 px-6 py-2.5 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => { setCategoryFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#0091ea] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            সবগুলো ({messages.length})
          </button>
          <button 
            type="button"
            onClick={() => { setCategoryFilter('bonus'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              categoryFilter === 'bonus'
                ? 'bg-amber-500 text-black shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-600" />
            <span>অফার ও মিশন</span>
          </button>
          <button 
            type="button"
            onClick={() => { setCategoryFilter('notice'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              categoryFilter === 'notice'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            নোটিশ ও সিস্টেম
          </button>
        </div>

        <button
          type="button"
          onClick={fetchLiveMessages}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0091ea]' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Main Split Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: MESSAGE LIST WITH ACTION TOOLBAR & PAGINATION */}
        {/* ========================================================================= */}
        <div className="w-full md:w-[340px] lg:w-[380px] flex flex-col border-r border-gray-200 shrink-0 bg-white">
          {/* Action Bar matching Capture9.PNG & Capture10.PNG */}
          <div className="h-10 px-3 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs text-gray-700 select-none">
            {/* Checkbox Select All */}
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 hover:text-gray-900 cursor-pointer font-medium"
            >
              {isAllCurrentSelected ? (
                <CheckSquare className="w-4 h-4 text-emerald-700" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>সব নির্বাচন করুন</span>
            </button>

            {/* Icons: Trash, Mail, Sort */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDeleteSelected}
                className="text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button 
                onClick={handleMarkAllRead}
                className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                title="পড়া হিসেবে চিহ্নিত করুন"
              >
                <Mail className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-gray-600 hover:text-gray-900 cursor-pointer">
                <span>সময় অনুযায়ী সাজান</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 scrollbar-thin">
            {currentMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                কোনো বার্তা নেই
              </div>
            ) : (
              currentMessages.map((msg) => {
                const isSelected = msg.id === selectedMsgId;
                const isChecked = selectedCheckIds.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group px-3 py-3 flex items-start gap-2.5 cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/70 border-l-4 border-emerald-700' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={(e) => handleToggleCheck(msg.id, e)}
                      className="mt-0.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: Sender & Time */}
                      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-0.5">
                        <span className="font-bold text-gray-800">{msg.sender}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono">{msg.displayTime}</span>
                          {/* Hover/Selected Trash icon */}
                          <button
                            onClick={(e) => handleDeleteSingle(msg.id, e)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom row: Title */}
                      <p className={`text-xs truncate ${!msg.isRead ? 'font-bold text-gray-900' : 'text-gray-700 font-medium'}`}>
                        {msg.title}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Pagination Bar matching Capture9.PNG & Capture10.PNG */}
          <div className="h-10 px-3 border-t border-gray-200 bg-white flex items-center justify-between text-xs text-gray-600 shrink-0">
            {/* Trash icon on bottom left */}
            <button 
              onClick={handleDeleteSelected}
              className="text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              title="মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                currentPage === 1 ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`} onClick={() => setCurrentPage(1)}>
                1
              </span>

              {totalPages >= 2 && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer ${
                  currentPage === 2 ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`} onClick={() => setCurrentPage(2)}>
                  2
                </span>
              )}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MESSAGE DETAIL VIEW matching Capture10.PNG */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedMessage ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Detail Header Strip matching Capture10.PNG */}
              <div className="h-10 px-6 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0 font-medium">
                <div>
                  প্রেরক: <span className="font-bold text-gray-800">{selectedMessage.sender}</span>
                </div>
                <div className="font-mono text-gray-600">
                  {selectedMessage.dateFull}
                </div>
              </div>

              {/* Detail Body (Rich formatted content matching Capture10.PNG) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-gray-800 font-bengali leading-relaxed select-text">
                {/* Headline */}
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  {selectedMessage.content.headline}
                </h2>

                {/* Claimable Bonus Banner */}
                {selectedMessage.claimableBonus && selectedMessage.claimableBonus > 0 && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-emerald-500/10 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black flex items-center justify-center font-black shadow-sm shrink-0">
                        <Gift className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-amber-900">অভ্যন্তরীণ বার্তা উপহার ও রিওয়ার্ড</div>
                        <div className="text-base font-black text-emerald-800 font-mono">
                          ৳{selectedMessage.claimableBonus.toLocaleString()} বোনাস ক্রেডিট
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimBonus(selectedMessage)}
                      disabled={claimedIds.includes(selectedMessage.id) || isClaiming}
                      className={`px-5 py-2 rounded-xl font-black text-xs tracking-wide transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95 ${
                        claimedIds.includes(selectedMessage.id)
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                          : 'btn-bdt-gold text-[#3b2000] hover:brightness-105'
                      }`}
                    >
                      {claimedIds.includes(selectedMessage.id) ? 'বোনাস সংগৃহীত হয়েছে ✅' : isClaiming ? 'প্রসেসিং...' : `৳${selectedMessage.claimableBonus} বোনাস দাবি করুন`}
                    </button>
                  </div>
                )}

                {/* Main description paragraph with bold & colored highlights */}
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                  <strong className="text-emerald-700 font-extrabold font-mono">BengalBet</strong>
                  {selectedMessage.content.description.replace('BengalBet', '')}
                </p>

                {/* How to get section */}
                <div className="space-y-1.5 pt-1">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    {selectedMessage.content.howToGetTitle}
                  </h3>
                  <div className="space-y-1 pl-1 text-gray-700">
                    {selectedMessage.content.howToGetSteps.map((step, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span>{step}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Rules Section */}
                <div className="space-y-1.5 pt-1">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                    {selectedMessage.content.rulesTitle}
                  </h3>
                  <div className="space-y-1 pl-1 text-gray-700">
                    {selectedMessage.content.rules.map((rule, idx) => (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span>{rule}</span>
                      </p>
                    ))}
                  </div>
                </div>

                {/* Official Links */}
                {selectedMessage.content.officialLinks && (
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <h4 className="font-bold text-gray-900 flex items-center gap-1.5 text-xs sm:text-sm">
                      <span>🔶</span>
                      <span>{selectedMessage.content.officialLinksTitle || 'BengalBet অফিসিয়াল লিঙ্ক'}</span>
                    </h4>
                    <div className="flex flex-wrap gap-3 text-blue-600 font-semibold font-mono text-xs">
                      {selectedMessage.content.officialLinks.map((link, idx) => (
                        <a 
                          key={idx} 
                          href="#" 
                          onClick={(e) => e.preventDefault()} 
                          className="hover:underline hover:text-blue-800"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
              <Mail className="w-12 h-12 text-gray-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium">একটি বার্তা নির্বাচন করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
