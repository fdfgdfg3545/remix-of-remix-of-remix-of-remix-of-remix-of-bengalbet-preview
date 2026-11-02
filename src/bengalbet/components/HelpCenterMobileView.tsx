// @ts-nocheck
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  HelpCircle, 
  CreditCard, 
  ArrowDownCircle, 
  ShieldCheck, 
  Gift, 
  BookOpen,
  Headphones,
  Search
} from 'lucide-react';
import { UserAccount } from '../types';

interface HelpCenterMobileViewProps {
  user?: UserAccount;
  onBack: () => void;
  onClose?: () => void;
  showToast?: (msg: string) => void;
  onOpenCustomerService?: () => void;
}

interface HelpTabItem {
  id: string;
  label: string;
  sections: {
    title: string;
    content: string | string[];
  }[];
}

const HELP_TABS: HelpTabItem[] = [
  {
    id: 'deposit',
    label: 'Deposit',
    sections: [
      {
        title: 'ডিপোজিট',
        content: 'আপনার বসবাসকারী দেশের উপর নির্ভর করে প্রদত্ত ডিপোজিট বিকল্পগুলি ভিন্ন হতে পারে। আপনার জন্য উপলব্ধ পদ্ধতিগুলির সঠিক তথ্যের জন্য অনুগ্রহ করে মেম্বার সেন্টার পরিদর্শন করুন। ज्यादातर ক্ষেত্রে আপনি ৫ মিনিটের মধ্যে ব্যালেন্স পেয়ে যাবেন।'
      },
      {
        title: 'ডিপোজিট গ্রহণের সময়',
        content: '২৪ ঘন্টা খোলা'
      },
      {
        title: 'ডিপোজিটের পরিমাণ সীমা',
        content: [
          'ব্যাংক ট্রান্সফার: ন্যূনতম ৫০ টাকা বা সমমান, সর্বোচ্চ ৫০০০ টাকা বা সমমান',
          'অন্যান্য: ন্যূনতম ৮০ টাকা বা সমমান, সর্বোচ্চ ৩০০০ টাকা বা সমমান'
        ]
      },
      {
        title: 'পেমেন্ট পদ্ধতি',
        content: [
          'আমরা যা সমর্থন করি: ব্যাংক ট্রান্সফার ও অন্যান্য',
          'আমরা পেমেন্ট সমাধান নিয়ে নিরন্তর কাজ করছি। যদি ২০ মিনিটের মধ্যে আপনার ব্যালেন্স না পান, দয়া করে আরও তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।'
        ]
      }
    ]
  },
  {
    id: 'withdraw',
    label: 'উত্তোলন',
    sections: [
      {
        title: 'টাকা উত্তোলন (Withdrawal)',
        content: 'আপনার একাউন্ট থেকে যেকোনো সময় দ্রুত ও সহজে টাকা উত্তোলন করতে পারেন। উত্তোলন প্রক্রিয়া শুরু করতে আপনার সঠিক বিকাশ, নগদ বা রকেট অ্যাকাউন্ট নম্বর যাচাই করুন।'
      },
      {
        title: 'উত্তোলনের প্রক্রিয়াকরণ সময়',
        content: 'সাধারণত ১০ থেকে ৩০ মিনিটের মধ্যে আপনার ওয়ালেটে টাকা জমা হয়ে যায়। পিক আওয়ারে সর্বোচ্চ ১ ঘণ্টা সময় লাগতে পারে।'
      },
      {
        title: 'উত্তোলনের সীমা',
        content: [
          'ন্যূনতম উত্তোলন: ৳২০০',
          'দৈনিক সর্বোচ্চ উত্তোলন: ৳১,৫০,০০০',
          'ভিআইপি লেভেল অনুসারে দৈনিক ফ্রি উইথড্রয়াল সুবিধা প্রযোজ্য।'
        ]
      },
      {
        title: 'গুরুত্বপূর্ণ নিয়ম',
        content: [
          'উত্তোলনের পূর্বে সংশ্লিষ্ট বোনাসের টার্নওভার শর্ত পূরণ করতে হবে।',
          'অ্যাকাউন্ট ভেরিফিকেশন ও সিকিউরিটি পাসওয়ার্ড প্রয়োজন।'
        ]
      }
    ]
  },
  {
    id: 'account',
    label: 'অ্যাকাউন্ট',
    sections: [
      {
        title: 'অ্যাকাউন্ট নিবন্ধন ও লগইন',
        content: 'BengalBet-এ একটি সক্রিয় মোবাইল নম্বর দিয়ে তাৎক্ষণিকভাবে অ্যাকাউন্ট তৈরি করা যায়। একটি ডিভাইসে শুধুমাত্র একটি সক্রিয় মূল অ্যাকাউন্ট পরিচালনার অনুমতি রয়েছে।'
      },
      {
        title: 'পাসওয়ার্ড ও নিরাপত্তা',
        content: 'আপনার অ্যাকাউন্টের নিরাপত্তা সুনিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ও সিকিউরিটি পিন সেট করুন। কখনোই কাউকে আপনার ওটিপি (OTP) বা পাসওয়ার্ড শেয়ার করবেন না।'
      },
      {
        title: 'তথ্য পরিবর্তন',
        content: [
          'নাম ও জন্মতারিখ একবার নির্ধারণের পর শুধুমাত্র কাস্টমার সার্ভিসের মাধ্যমে পরিবর্তনযোগ্য।',
          'বাইন্ড করা ব্যাংক ও ই-ওয়ালেট অ্যাকাউন্ট সিকিউরিটি সেন্টার থেকে পরিচালনা করুন।'
        ]
      }
    ]
  },
  {
    id: 'bonus',
    label: 'বোনাস ও অফার',
    sections: [
      {
        title: 'স্বাগত ও রিচার্জ বোনাস',
        content: 'নতুন ব্যবহারকারীদের জন্য প্রথম ডিপোজিটে পান আকর্ষণীয় ক্যাশব্যাক এবং দৈনিক রিলোড বোনাস। প্রতিটি বোনাসের বিস্তারিত শর্তাবলী প্রমোশন পেজে উল্লেখ থাকে।'
      },
      {
        title: 'টার্নওভার গণনা',
        content: [
          'বোনাস উত্তোলনের পূর্বে সংশ্লিষ্ট গেমের টার্নওভার (Turnover Requirement) সম্পন্ন করতে হবে।',
          'লাইভ ক্যাসিনো, স্লট ও স্পোর্টস বেটিংয়ের জন্য টার্নওভার পার্সেন্টেজ প্রযোজ্য।'
        ]
      },
      {
        title: 'ভিআইপি রিওয়ার্ডস',
        content: 'নিয়মিত খেলে আপনার ভিআইপি লেভেল আপগ্রেড করুন এবং মাসিক নগদ রিওয়ার্ড, জন্মদিনের উপহার ও এক্সক্লুসিভ রিবেট উপভোগ করুন।'
      }
    ]
  },
  {
    id: 'rules',
    label: 'নিয়মাবলী',
    sections: [
      {
        title: 'গেমিং পলিসি ও নিয়ম',
        content: 'আমাদের প্ল্যাটফর্মে সমস্ত গেম আন্তর্জাতিক গেমিং ল্যাব কর্তৃক পরীক্ষিত ও আরএনজি (RNG) সার্টিফাইড। সুষ্ঠু ও নিরাপদ গেমিং পরিবেশ নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।'
      },
      {
        title: 'নিষিদ্ধ কার্যক্রম',
        content: [
          'একাধিক ফেইক অ্যাকাউন্ট তৈরি করা বা আরবিট্রেজ বেটিং সম্পূর্ণ নিষিদ্ধ।',
          'যেকোনো প্রতারণামূলক কার্যক্রমের বিরুদ্ধে তাৎক্ষণিক অ্যাকাউন্ট স্থগিতাদেশ কার্যকর হবে।'
        ]
      }
    ]
  }
];

export const HelpCenterMobileView: React.FC<HelpCenterMobileViewProps> = ({
  user,
  onBack,
  onClose,
  showToast,
  onOpenCustomerService
}) => {
  const [activeTabId, setActiveTabId] = useState<string>('deposit');
  const [searchQuery, setSearchQuery] = useState('');

  const activeTab = HELP_TABS.find(t => t.id === activeTabId) || HELP_TABS[0];

  return (
    <div 
      id="mobile-help-center-view"
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none animate-in fade-in"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER matching Capture16.PNG */}
      {/* Dark Forest Green Background (#0b3323) + Back Arrow + Centered Title: সাহায্য কেন্দ্র */}
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
          সাহায্য কেন্দ্র
        </h1>

        <div className="w-9" />
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER CATEGORY TABS matching Capture16.PNG (Deposit active in blue) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-xs">
        {HELP_TABS.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                isActive 
                  ? 'text-[#0091ea] bg-blue-50/80 border-b-2 border-[#0091ea]' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN GREEN CARD CONTENT CONTAINER matching Capture16.PNG */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 bg-gray-50/50">
        
        {/* The Characteristic Green Card matching Capture16.PNG */}
        <div 
          className="w-full bg-[#0b824c] rounded-2xl p-5 text-white shadow-md space-y-6 font-bengali leading-relaxed"
          style={{
            background: 'linear-gradient(180deg, #0b8a51 0%, #087744 100%)'
          }}
        >
          {activeTab.sections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              {/* Heading matching screenshot */}
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {sec.title}
              </h2>

              {/* Content Paragraph or List */}
              {Array.isArray(sec.content) ? (
                <div className="space-y-1 text-[13px] sm:text-sm text-emerald-50 leading-relaxed font-medium">
                  {sec.content.map((line, lIdx) => (
                    <p key={lIdx} className="leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] sm:text-sm text-emerald-50 leading-relaxed font-medium">
                  {sec.content}
                </p>
              )}
            </div>
          ))}

          {/* 24/7 Live Support Helper button inside card */}
          {onOpenCustomerService && (
            <div className="pt-4 border-t border-white/20">
              <button
                type="button"
                onClick={onOpenCustomerService}
                className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 active:scale-[0.98] transition-all rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-white/20"
              >
                <Headphones className="w-4 h-4 text-emerald-200" />
                <span>আরও কোনো প্রশ্ন আছে? ২৪/৭ কাস্টমার সার্ভিসের সাথে কথা বলুন</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
