// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronDown, 
  Calendar as CalendarIcon, 
  Search, 
  HelpCircle, 
  X, 
  Check, 
  RefreshCw,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { DateRangePickerModal, DateRange } from './DateRangePickerModal';
import { api } from '../services/api';
import { 
  getTodayStr, 
  getYesterdayStr, 
  getDaysAgoStr, 
  formatCurrency 
} from '../utils/dateHelpers';

interface BetRecordViewProps {
  user?: UserAccount;
  onBack?: () => void;
  onClose?: () => void;
}

export type BetCategory = 'all' | 'slot' | 'live' | 'fishing' | 'crash' | 'poker' | 'sports';
type DateQuickTab = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export interface BetItem {
  id: string;
  orderNo: string;
  category: BetCategory;
  vendor: string;        // e.g. JILI, PG Soft, EVO, SEXY, SBO, PT, FC, Spribe
  gameName: string;      // e.g. সুপার এস, এভিয়েটর, ক্রেজি টাইম
  gameRound: string;     // খেলার সংখ্যা (Round / Table ID)
  time: string;          // 2026-09-23 16:20:15
  date: string;          // 2026-09-23
  betAmount: number;     // বেট পরিমাণ
  validBet: number;      // বৈধ বেট
  reward: number;        // পুরস্কার / জয় (Payout)
  profit: number;        // লাভ ও হার / লাভ এবং লস (reward - betAmount)
}

interface ExcludedTurnoverGame {
  id: string;
  gameType: string;
  vendor: string;
  gameName: string;
  exclusionPercent: string;
}

// Bets loaded directly from REST API (https://server.nexarofx.com/dbserver/api/games.php?action=records)


// Comprehensive Excluded Turnover List matching Capture.PNG
const EXCLUDED_TURNOVER_LIST: ExcludedTurnoverGame[] = [
  { id: 'ex-1', gameType: 'স্লট', vendor: 'PT', gameName: 'নয় তারা জ্বলন্ত', exclusionPercent: '100%' },
  { id: 'ex-2', gameType: 'স্লট', vendor: 'PT', gameName: 'খরগোশ ও শিয়াল', exclusionPercent: '100%' },
  { id: 'ex-3', gameType: 'স্লট', vendor: 'PT', gameName: 'মিস্টার কয়েন মহাহিট', exclusionPercent: '100%' },
  { id: 'ex-4', gameType: 'স্লট', vendor: 'PT', gameName: '৮১ সোনার ধারাবাহিক', exclusionPercent: '100%' },
  { id: 'ex-5', gameType: 'স্লট', vendor: 'PT', gameName: 'তিনপাতা উল্টানো', exclusionPercent: '100%' },
  { id: 'ex-6', gameType: 'স্লট', vendor: 'PT', gameName: 'বড় সুমো', exclusionPercent: '100%' },
  { id: 'ex-7', gameType: 'স্লট', vendor: 'PT', gameName: 'ফু ডাবল লাক ডায়মন্ড বিস্ফোরণ', exclusionPercent: '100%' },
  { id: 'ex-8', gameType: 'স্লট', vendor: 'PT', gameName: 'মেগা অগ্নিশিখা: খান', exclusionPercent: '100%' },
  { id: 'ex-9', gameType: 'স্লট', vendor: 'PT', gameName: '৪ ক্যাশ বিমান: মাল্টিপ্লেয়ার', exclusionPercent: '100%' },
  { id: 'ex-10', gameType: 'স্লট', vendor: 'PT', gameName: 'কুকুরের যুগ', exclusionPercent: '100%' },
  { id: 'ex-11', gameType: 'স্লট', vendor: 'PT', gameName: 'বন্য লাভা', exclusionPercent: '100%' },
  { id: 'ex-12', gameType: 'স্লট', vendor: 'PT', gameName: 'গড অফ স্টর্মস ২', exclusionPercent: '100%' },
  { id: 'ex-13', gameType: 'স্লট', vendor: 'PP', gameName: 'মানি রোল', exclusionPercent: '100%' },
  { id: 'ex-14', gameType: 'স্লট', vendor: 'PP', gameName: 'গোল্ডেন বিউটি', exclusionPercent: '100%' },
  { id: 'ex-15', gameType: 'স্লট', vendor: 'PP', gameName: '৮৮৮ ড্রাগন', exclusionPercent: '100%' },
  { id: 'ex-16', gameType: 'স্লট', vendor: 'JILI', gameName: 'কিং কনগ', exclusionPercent: '100%' },
  { id: 'ex-17', gameType: 'লাইভ', vendor: 'EVO', gameName: 'রুলেট নো কমিশন', exclusionPercent: '100%' },
  { id: 'ex-18', gameType: 'লাইভ', vendor: 'SEXY', gameName: 'ব্যাকারাত সুপার ৬', exclusionPercent: '100%' }
];

export const BetRecordView: React.FC<BetRecordViewProps> = ({ 
  user, 
  onBack, 
  onClose 
}) => {
  // Main view state: 'records' | 'excluded_turnover'
  const [currentView, setCurrentView] = useState<'records' | 'excluded_turnover'>('records');

  // Dynamic bets list directly from REST API
  const [betsList, setBetsList] = useState<BetItem[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState<boolean>(false);

  // Category Tabs: সব, স্লট, লাইভ, মাছ, পোকার, খেলাধুলা
  const [activeCategory, setActiveCategory] = useState<BetCategory>('all');

  // Date Quick Tab: 'today' | 'yesterday' | '7days' | '30days' | 'custom'
  const [activeDateTab, setActiveDateTab] = useState<DateQuickTab>('30days');

  // Date filter state - default to last 30 days so recent bets are immediately accessible
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: getDaysAgoStr(30),
    endDate: getTodayStr()
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Search keyword for game name, round ID, orderNo
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Vendor Filter
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [isVendorDropdownOpen, setIsVendorDropdownOpen] = useState(false);

  // Excluded Turnover Search & Filter state
  const [excludedVendorFilter, setExcludedVendorFilter] = useState<string>('all');
  const [isExcludedFilterDropdownOpen, setIsExcludedFilterDropdownOpen] = useState(false);
  const [excludedSearchTerm, setExcludedSearchTerm] = useState<string>('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Fetch real bet records from server API
  const fetchBets = async () => {
    setIsLoadingBets(true);
    try {
      const categoryParam = activeCategory === 'all' ? undefined : activeCategory;
      const res = await api.games.getRecords(categoryParam);
      if (res.success && res.bets) {
        const mappedServerBets: BetItem[] = res.bets.map((b: any) => ({
          id: b.id,
          orderNo: b.orderNo || `B${b.id}`,
          category: (b.category as BetCategory) || 'slot',
          vendor: b.vendor || 'JILI',
          gameName: b.gameName || 'সুপার এস',
          gameRound: b.gameRound || '#R1001',
          time: b.time || b.createdAt || `${b.date || getTodayStr()} 12:00:00`,
          date: b.date || (b.time ? b.time.substring(0, 10) : getTodayStr()),
          betAmount: Number(b.betAmount || 0),
          validBet: Number(b.validBet || b.betAmount || 0),
          reward: Number(b.reward || 0),
          profit: Number(b.profit !== undefined ? b.profit : (b.reward || 0) - (b.betAmount || 0))
        }));

        setBetsList(mappedServerBets);
      }
    } catch (err) {
      console.warn('Could not load bet records from API:', err);
    } finally {
      setIsLoadingBets(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [activeCategory]);

  // Categories list
  const categories: { key: BetCategory; label: string }[] = [
    { key: 'all', label: 'সব গেম' },
    { key: 'slot', label: 'স্লট' },
    { key: 'live', label: 'লাইভ' },
    { key: 'fishing', label: 'মাছ' },
    { key: 'poker', label: 'পোকার' },
    { key: 'sports', label: 'খেলাধুলা' }
  ];

  // Vendor list options
  const vendorOptions = [
    { value: 'all', label: 'সব ভেন্ডর' },
    { value: 'jili', label: 'JILI' },
    { value: 'pg soft', label: 'PG Soft' },
    { value: 'evo', label: 'EVO (Evolution)' },
    { value: 'sexy', label: 'SEXY Gaming' },
    { value: 'sbo', label: 'SBO Sports' },
    { value: 'spribe', label: 'Spribe' },
    { value: 'pt', label: 'PT (Playtech)' },
    { value: 'pp', label: 'Pragmatic Play' },
    { value: 'fc', label: 'FC Slots' },
    { value: 'jdb', label: 'JDB Gaming' }
  ];

  // Quick Date Select handler
  const handleSelectQuickDate = (tab: DateQuickTab) => {
    setActiveDateTab(tab);
    if (tab === 'today') {
      const today = getTodayStr();
      setCustomRange({ startDate: today, endDate: today });
    } else if (tab === 'yesterday') {
      const yesterday = getYesterdayStr();
      setCustomRange({ startDate: yesterday, endDate: yesterday });
    } else if (tab === '7days') {
      setCustomRange({ startDate: getDaysAgoStr(7), endDate: getTodayStr() });
    } else if (tab === '30days') {
      setCustomRange({ startDate: getDaysAgoStr(30), endDate: getTodayStr() });
    } else if (tab === 'custom') {
      setIsDatePickerOpen(true);
    }
  };

  // Date Range Display: e.g. "09/16- 09/23"
  const dateRangeDisplay = useMemo(() => {
    const startFormatted = customRange.startDate.length >= 10 ? customRange.startDate.substring(5).replace('-', '/') : customRange.startDate;
    const endFormatted = customRange.endDate.length >= 10 ? customRange.endDate.substring(5).replace('-', '/') : customRange.endDate;
    return `${startFormatted} 00:00 - ${endFormatted} 23:59`;
  }, [customRange]);

  // Filtered Bet Records
  const filteredBets = useMemo(() => {
    return betsList.filter((item) => {
      // 1. Category filter
      if (activeCategory !== 'all') {
        if (activeCategory === 'slot' && item.category !== 'slot') return false;
        if (activeCategory === 'live' && item.category !== 'live') return false;
        if (activeCategory === 'fishing' && item.category !== 'fishing') return false;
        if (activeCategory === 'poker' && item.category !== 'poker') return false;
        if (activeCategory === 'sports' && item.category !== 'sports') return false;
      }

      // 2. Date range filter
      if (item.date < customRange.startDate || item.date > customRange.endDate) {
        return false;
      }

      // 3. Vendor filter
      if (selectedVendor !== 'all') {
        if (!item.vendor.toLowerCase().includes(selectedVendor.toLowerCase())) {
          return false;
        }
      }

      // 4. Keyword search (game name, orderNo, gameRound)
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const matchName = item.gameName.toLowerCase().includes(q);
        const matchOrder = item.orderNo.toLowerCase().includes(q);
        const matchRound = item.gameRound.toLowerCase().includes(q);
        const matchVendor = item.vendor.toLowerCase().includes(q);
        if (!matchName && !matchOrder && !matchRound && !matchVendor) return false;
      }

      return true;
    });
  }, [betsList, activeCategory, customRange, selectedVendor, searchKeyword]);

  // Totals calculations for the 4 metrics in bottom bar
  const totals = useMemo(() => {
    return filteredBets.reduce(
      (acc, curr) => ({
        betAmount: acc.betAmount + curr.betAmount,
        validBet: acc.validBet + curr.validBet,
        reward: acc.reward + curr.reward,
        profit: acc.profit + curr.profit
      }),
      { betAmount: 0, validBet: 0, reward: 0, profit: 0 }
    );
  }, [filteredBets]);

  // Filtered Excluded Turnover List
  const filteredExcludedList = useMemo(() => {
    return EXCLUDED_TURNOVER_LIST.filter((item) => {
      if (excludedVendorFilter !== 'all') {
        const term = excludedVendorFilter.toLowerCase();
        const matchesVendor = item.vendor.toLowerCase() === term;
        const matchesType = item.gameType.toLowerCase() === term;
        if (!matchesVendor && !matchesType) return false;
      }

      if (excludedSearchTerm.trim()) {
        const q = excludedSearchTerm.trim().toLowerCase();
        const matchesName = item.gameName.toLowerCase().includes(q);
        const matchesVendor = item.vendor.toLowerCase().includes(q);
        const matchesType = item.gameType.toLowerCase().includes(q);
        if (!matchesName && !matchesVendor && !matchesType) return false;
      }

      return true;
    });
  }, [excludedVendorFilter, excludedSearchTerm]);

  // =========================================================================
  // 1. SCREEN: বর্জিত টার্নওভার তালিকা (Excluded Turnover List)
  // =========================================================================
  if (currentView === 'excluded_turnover') {
    return (
      <div 
        id="excluded-turnover-list-view"
        className="w-full h-full min-h-0 bg-white flex flex-col font-bengali select-none overflow-hidden"
      >
        {/* Top Dark Green Header matching Capture.PNG */}
        <header className="bg-[#0b3327] px-4 py-3 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setCurrentView('records')}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            বর্জিত টার্নওভার তালিকা
          </h1>

          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="সাহায্য"
          >
            <HelpCircle className="w-6 h-6 stroke-[2]" />
          </button>
        </header>

        {/* Filter Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center gap-2.5 shrink-0">
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsExcludedFilterDropdownOpen(!isExcludedFilterDropdownOpen)}
              className="h-9 px-3.5 rounded-md border border-[#1890ff] text-[#1890ff] bg-white flex items-center gap-1 text-xs sm:text-sm font-semibold hover:bg-blue-50/50 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              <span>
                {excludedVendorFilter === 'all' 
                  ? 'সব' 
                  : excludedVendorFilter.toUpperCase()}
              </span>
            </button>

            {isExcludedFilterDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-40 animate-in fade-in zoom-in-95">
                {[
                  { value: 'all', label: 'সব' },
                  { value: 'pt', label: 'PT (Playtech)' },
                  { value: 'pp', label: 'Pragmatic Play' },
                  { value: 'jili', label: 'JILI' },
                  { value: 'স্লট', label: 'স্লট' },
                  { value: 'লাইভ', label: 'লাইভ' }
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setExcludedVendorFilter(opt.value);
                      setIsExcludedFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-gray-50 transition-colors ${
                      excludedVendorFilter === opt.value ? 'text-[#1890ff] bg-blue-50/40' : 'text-gray-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {excludedVendorFilter === opt.value && <Check className="w-3.5 h-3.5 text-[#1890ff]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 relative">
            <div className="h-9 w-full rounded-full border border-gray-300 bg-white flex items-center px-3.5 gap-2 focus-within:border-[#1890ff] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="খেলার নাম"
                value={excludedSearchTerm}
                onChange={(e) => setExcludedSearchTerm(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
              />
              {excludedSearchTerm && (
                <button
                  type="button"
                  onClick={() => setExcludedSearchTerm('')}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Excluded Turnover Card List */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-white p-3.5 sm:p-5 space-y-3">
          {filteredExcludedList.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm font-medium">
              কোন গেমের তথ্য পাওয়া যায়নি
            </div>
          ) : (
            filteredExcludedList.map((item) => (
              <div 
                key={item.id}
                className="bg-white border border-gray-100 rounded-xl p-3 sm:p-4 shadow-2xs hover:border-gray-200 transition-all space-y-2 text-xs sm:text-sm font-medium text-gray-700"
              >
                <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                  <span className="text-gray-500">গেমের ধরন :</span>
                  <span className="font-bold text-gray-900">{item.gameType}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                  <span className="text-gray-500">ভেন্ডর :</span>
                  <span className="font-bold text-gray-900">{item.vendor}</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-50 pb-1.5">
                  <span className="text-gray-500">খেলার নাম :</span>
                  <span className="font-bold text-gray-900 text-right">{item.gameName}</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-gray-500">বর্জনের অনুপাত :</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full text-xs">
                    {item.exclusionPercent}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-100">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-gray-900 text-base">বর্জিত টার্নওভার সম্পর্কে</h3>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                <p>• বর্জিত টার্নওভার তালিকায় অন্তর্ভুক্ত গেমগুলোতে কৃত বাজি কোনো বোনাস টার্নওভার বা ভিআইপি লেভেল আপের প্রয়োজনীয়তা পূরণে গণনা করা হবে না।</p>
                <p>• যে গেমগুলি এই বর্জনের তালিকায় নেই, সেগুলি বৈধ বেটিং এর ১০০% টার্নওভার হিসেবে স্বয়ংক্রিয়ভাবে গণ্য হবে।</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-[#0b3327] hover:bg-[#072418] text-white rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. SCREEN: বেটিং রেকর্ড (Betting Record Main Screen)
  // =========================================================================
  return (
    <div 
      id="betting-record-view"
      className="w-full h-full min-h-0 bg-white flex flex-col font-bengali select-none overflow-hidden"
    >
      {/* 1. Top Dark Green Header matching Capture2.PNG */}
      <header className="bg-[#0b3327] px-4 py-3 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else if (onClose) onClose();
            }}
            className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="ফিরে যান"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            বেটিং রেকর্ড
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchBets}
            className={`w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ${
              isLoadingBets ? 'animate-spin' : 'active:scale-90'
            }`}
            title="রিফ্রেশ করুন"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Blue Pill Button: বর্জিত টার্নওভার তালিকা */}
          <button
            type="button"
            onClick={() => setCurrentView('excluded_turnover')}
            className="bg-[#1890ff] hover:bg-[#1677ff] text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <span>বর্জিত টার্নওভার তালিকা</span>
          </button>
        </div>
      </header>

      {/* 2. Category Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 pt-1 flex items-center overflow-x-auto scrollbar-none shrink-0">
        <div className="flex items-center gap-5 sm:gap-8 min-w-full justify-around sm:justify-start">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all relative ${
                  isActive
                    ? 'text-[#1890ff] font-bold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span>{cat.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1890ff] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Date Selector Chips */}
      <div className="px-3.5 sm:px-5 py-2 bg-slate-50 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => handleSelectQuickDate('today')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeDateTab === 'today'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          আজ
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuickDate('yesterday')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeDateTab === 'yesterday'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          গতকাল
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuickDate('7days')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeDateTab === '7days'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ৭ দিন
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuickDate('30days')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeDateTab === '30days'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          ৩০ দিন
        </button>
        <button
          type="button"
          onClick={() => handleSelectQuickDate('custom')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
            activeDateTab === 'custom'
              ? 'bg-[#1890ff] text-white shadow-xs'
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <CalendarIcon className="w-3 h-3" />
          <span>কাস্টম তারিখ</span>
        </button>
      </div>

      {/* 4. Filter Bar */}
      <div className="px-3.5 sm:px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
        {/* Date Display Pill */}
        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="flex-1 min-w-[200px] h-8 px-2.5 rounded-md border border-[#91caff] bg-white flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-800 font-mono hover:bg-blue-50/30 active:scale-98 transition-all cursor-pointer overflow-hidden"
          title="তারিখ পরিবর্তন করতে ক্লিক করুন"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#1890ff] shrink-0" />
          <span className="truncate font-semibold tracking-tight">{dateRangeDisplay}</span>
        </button>

        {/* Vendor Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsVendorDropdownOpen(!isVendorDropdownOpen)}
            className="h-8 px-3 rounded-md border border-[#91caff] text-[#1890ff] bg-white flex items-center gap-1 text-xs font-semibold hover:bg-blue-50/30 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>
              {selectedVendor === 'all' 
                ? 'সব ভেন্ডর' 
                : vendorOptions.find(v => v.value === selectedVendor)?.label || selectedVendor}
            </span>
          </button>

          {isVendorDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 py-1 z-40 animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
              {vendorOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedVendor(opt.value);
                    setIsVendorDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedVendor === opt.value ? 'text-[#1890ff] bg-blue-50/40' : 'text-gray-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {selectedVendor === opt.value && <Check className="w-3.5 h-3.5 text-[#1890ff]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Input Box */}
        <div className="relative flex-1 sm:max-w-xs min-w-[140px]">
          <div className="h-8 w-full rounded-md border border-gray-300 bg-white flex items-center px-2.5 gap-1.5 focus-within:border-[#1890ff] transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="খেলার নাম বা অর্ডার নং..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full h-full bg-transparent border-none outline-none text-xs text-gray-800 placeholder:text-gray-400 font-medium"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword('')}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Main Body Content */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#fafafa] p-3 sm:p-5 flex flex-col">
        {isLoadingBets ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-7 h-7 text-[#1890ff] animate-spin" />
            <span className="text-xs font-semibold text-gray-500">বেটিং রেকর্ড লোড হচ্ছে...</span>
          </div>
        ) : filteredBets.length === 0 ? (
          // EMPTY STATE: Exact Match to Capture2.PNG
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8 animate-in fade-in zoom-in-95">
            <div className="relative w-56 h-48 sm:w-64 sm:h-56 flex items-center justify-center">
              <svg 
                viewBox="0 0 240 200" 
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="90" cy="102" r="3" fill="#00a2ff" />
                <circle cx="76" cy="120" r="3.5" fill="#00a2ff" />
                <circle cx="143" cy="98" r="3" fill="#00a2ff" />
                
                <path d="M106 93.5C106 96 107.5 97.5 110 97.5C107.5 97.5 106 99 106 101.5C106 99 104.5 97.5 102 97.5C104.5 97.5 106 96 106 93.5Z" fill="#00a2ff" />
                <path d="M63 116C63 118 64.5 119 66.5 119C64.5 119 63 120 63 122C63 120 61.5 119 59.5 119C61.5 119 63 118 63 116Z" fill="#00a2ff" />
                <path d="M76 112C76 114 77.5 115 79.5 115C77.5 115 76 116 76 118C76 116 74.5 115 72.5 115C74.5 115 76 114 76 112Z" fill="#00a2ff" />
                <path d="M171 113C171 115.5 172.5 116.5 175 116.5C172.5 116.5 171 117.5 171 120C171 117.5 169.5 116.5 167 116.5C169.5 116.5 171 115.5 171 113Z" fill="#00a2ff" />
                <path d="M175 108C175 109 176 109.5 177 109.5C176 109.5 175 110 175 111C175 110 174 109.5 173 109.5C174 109.5 175 109 175 108Z" fill="#00a2ff" />

                <path 
                  d="M100 123L138 123L146 146H92L100 123Z" 
                  fill="#f0f9ff"
                  opacity="0.5"
                />
                
                <path 
                  d="M99 123 L139 123 L146 145 L146 167 L92 167 L92 145 Z" 
                  stroke="#00a2ff" 
                  strokeWidth="2.6" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />
                
                <path 
                  d="M92 145 H111 C111 151 115 155 119 155 C123 155 127 151 127 145 H146" 
                  stroke="#00a2ff" 
                  strokeWidth="2.6" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />

                <path 
                  d="M111 143 C108 135 125 120 126 130 C127 140 115 137 122 125 C129 113 140 108 144 103" 
                  stroke="#00a2ff" 
                  strokeWidth="1.8" 
                  strokeDasharray="3.5 3.5" 
                  strokeLinecap="round" 
                />

                <g transform="translate(136, 92) rotate(-8)">
                  <polygon points="0,15 25,0 12,18" fill="#1890ff" />
                  <polygon points="25,0 20,24 12,18" fill="#0077e6" />
                  <polygon points="12,18 10,23 18,20" fill="#0055b3" opacity="0.8" />
                </g>
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1890ff] mt-2 tracking-wide">
              কোন ডেটা নেই
            </h2>
            <p className="text-xs text-gray-500 mt-1">নির্বাচিত ফিল্টারে কোনো বেট রেকর্ড পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto space-y-3">
            {/* Desktop Table View (md:block) */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0f4f8] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">সময় ও অর্ডার নং</th>
                    <th className="py-3 px-4">খেলার নাম</th>
                    <th className="py-3 px-4">ভেন্ডর</th>
                    <th className="py-3 px-4 text-right">বেট পরিমাণ</th>
                    <th className="py-3 px-4 text-right">বৈধ বেট</th>
                    <th className="py-3 px-4 text-right">পুরস্কার</th>
                    <th className="py-3 px-4 text-right">লাভ / লস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {filteredBets.map((bet) => (
                    <tr key={bet.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-gray-900">{bet.time}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{bet.orderNo}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-gray-800">{bet.gameName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{bet.gameRound}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-50 text-[#1890ff] border border-blue-100">
                          {bet.vendor}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ৳{formatCurrency(bet.betAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">
                        ৳{formatCurrency(bet.validBet)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600">
                        ৳{formatCurrency(bet.reward)}
                      </td>
                      <td className={`py-3 px-4 text-right font-extrabold ${bet.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {bet.profit > 0 ? `+৳${formatCurrency(bet.profit)}` : bet.profit < 0 ? `-৳${formatCurrency(bet.profit)}` : '৳0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (md:hidden) */}
            <div className="md:hidden space-y-2.5">
              {filteredBets.map((bet) => (
                <div 
                  key={bet.id}
                  className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-xs space-y-2 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">{bet.gameName}</span>
                      <span className="text-[10px] bg-blue-50 text-[#1890ff] font-bold px-2 py-0.5 rounded-full">
                        {bet.vendor}
                      </span>
                    </div>
                    <span className="font-mono text-gray-400 text-[11px]">{bet.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pb-1 border-b border-gray-50">
                    <span>অর্ডার: {bet.orderNo}</span>
                    <span>রাউন্ড: {bet.gameRound}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono text-xs">
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">বেট</div>
                      <div className="font-bold text-gray-800">৳{formatCurrency(bet.betAmount)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">বৈধ বেট</div>
                      <div className="font-bold text-gray-800">৳{formatCurrency(bet.validBet)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">পুরস্কার</div>
                      <div className="font-bold text-amber-600">৳{formatCurrency(bet.reward)}</div>
                    </div>
                    <div className={`rounded-lg p-1.5 ${bet.profit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      <div className="text-[10px] font-bengali opacity-80">লাভ/লস</div>
                      <div className="font-extrabold">
                        {bet.profit > 0 ? `+৳${formatCurrency(bet.profit)}` : bet.profit < 0 ? `-৳${formatCurrency(bet.profit)}` : '৳0.00'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Bottom 4-Metric Summary Bar */}
      <footer className="bg-[#f0f2f5] border-t border-gray-200 px-5 py-3 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto text-xs sm:text-sm font-semibold">
          <div className="bg-white md:bg-transparent p-2.5 md:p-0 rounded-lg border md:border-0 border-gray-100">
            <div className="text-gray-700 font-bold text-xs">মোট বেট পরিমাণ</div>
            <div className="text-[#1890ff] font-mono font-bold text-sm sm:text-base">
              ৳{formatCurrency(totals.betAmount)}
            </div>
          </div>

          <div className="bg-white md:bg-transparent p-2.5 md:p-0 rounded-lg border md:border-0 border-gray-100">
            <div className="text-gray-700 font-bold text-xs">বৈধ বেট</div>
            <div className="text-[#52c41a] font-mono font-bold text-sm sm:text-base">
              ৳{formatCurrency(totals.validBet)}
            </div>
          </div>

          <div className="bg-white md:bg-transparent p-2.5 md:p-0 rounded-lg border md:border-0 border-gray-100">
            <div className="text-gray-700 font-bold text-xs">মোট পুরস্কার / জয়</div>
            <div className="text-amber-600 font-mono font-bold text-sm sm:text-base">
              ৳{formatCurrency(totals.reward)}
            </div>
          </div>

          <div className="bg-white md:bg-transparent p-2.5 md:p-0 rounded-lg border md:border-0 border-gray-100">
            <div className="text-gray-700 font-bold text-xs">মোট লাভ এবং লস</div>
            <div className={`font-mono font-bold text-sm sm:text-base ${totals.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totals.profit >= 0 ? `+৳${formatCurrency(totals.profit)}` : `-৳${formatCurrency(totals.profit)}`}
            </div>
          </div>
        </div>
      </footer>

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        initialRange={customRange}
        title="তারিখ রেঞ্জ নির্বাচন করুন"
        onApply={(range) => {
          setCustomRange(range);
          setActiveDateTab('custom');
        }}
      />
    </div>
  );
};
