// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  ChevronDown, 
  ChevronLeft, 
  Check, 
  Copy,
  CheckCircle2, 
  Clock, 
  XCircle,
  Search,
  X,
  CreditCard,
  ArrowDownToLine,
  Gift,
  Coins
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

interface AccountRecordViewProps {
  user?: UserAccount;
  initialTab?: 'transaction' | 'deposit' | 'withdraw' | 'bonus' | 'rebate';
  onBack?: () => void;
  onClose?: () => void;
}

export type MainTab = 'transaction' | 'deposit' | 'withdraw' | 'bonus' | 'rebate';
type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export interface AccountRecordItem {
  id: string;
  orderRefType: string;        // 'ডিপোজিট (জমা)', 'উত্তোলন', 'বোনাস', 'ক্যাশ রিবেট', 'গেম জয়লাভ'
  categoryKey: 'deposit' | 'withdraw' | 'bonus' | 'game' | 'rebate';
  time: string;                // 2026-09-23 15:42:10
  date: string;                // 2026-09-23
  amount: number;              // লেনদেনের পরিমাণ (+ or -)
  currentBalance: number;      // বর্তমান ব্যালেন্স
  orderRefNumber: string;      // রেফারেন্স নাম্বার (e.g. TXN2026092384920)
  content: string;             // কনটেন্ট / বিবরণ
  status?: 'success' | 'pending' | 'cancelled';
}
// Account records loaded exclusively from REST API (https://server.nexarofx.com/dbserver/api/wallet.php?action=transactions)


export const AccountRecordView: React.FC<AccountRecordViewProps> = ({ 
  user, 
  initialTab = 'transaction',
  onBack,
  onClose
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(initialTab);
  const [dateFilter, setDateFilter] = useState<DateFilter>('30days');
  const [recordsList, setRecordsList] = useState<AccountRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setActiveMainTab(initialTab);
    }
  }, [initialTab]);

  // Date range - default to last 30 days
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: getDaysAgoStr(30),
    endDate: getTodayStr()
  });

  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showDecimal, setShowDecimal] = useState<boolean>(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mobile Dropdown toggles
  const [isMobileTypeDropdownOpen, setIsMobileTypeDropdownOpen] = useState(false);
  const [isMobileDateDropdownOpen, setIsMobileDateDropdownOpen] = useState(false);

  // Fetch real transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const typeParam = activeMainTab === 'transaction' ? undefined : activeMainTab;
      const res = await api.wallet.getTransactions(typeParam);
      if (res.success && res.transactions) {
        let runningBalance = user?.balance || 5000;
        const apiRecords: AccountRecordItem[] = res.transactions.map((tx: any) => {
          const isWithdraw = tx.type === 'withdraw';
          const isDeposit = tx.type === 'deposit';
          const isBonus = tx.type === 'bonus';
          const isRebate = tx.type === 'rebate';

          let categoryKey: AccountRecordItem['categoryKey'] = 'game';
          let orderRefType = 'গেম জয়লাভ';

          if (isWithdraw) {
            categoryKey = 'withdraw';
            orderRefType = 'উত্তোলন';
          } else if (isDeposit) {
            categoryKey = 'deposit';
            orderRefType = 'ডিপোজিট (জমা)';
          } else if (isBonus) {
            categoryKey = 'bonus';
            orderRefType = 'বোনাস / রিওয়ার্ড';
          } else if (isRebate) {
            categoryKey = 'rebate';
            orderRefType = 'ক্যাশ রিবেট';
          }

          const rawAmount = Number(tx.amount || 0);
          const signedAmount = isWithdraw ? -Math.abs(rawAmount) : Math.abs(rawAmount);
          const createdAt = tx.createdAt || `${getTodayStr()} 12:00:00`;
          const dateStr = createdAt.slice(0, 10);

          return {
            id: tx.id || `tx-${Math.random()}`,
            orderRefType,
            categoryKey,
            time: createdAt,
            date: dateStr,
            amount: signedAmount,
            currentBalance: runningBalance,
            orderRefNumber: tx.trxId || tx.id || 'TXN1001',
            content: tx.description || `${tx.channel ? tx.channel.toUpperCase() : 'সিস্টেম'} লেনদেন`,
            status: tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'pending' : 'cancelled'
          };
        });

        setRecordsList(apiRecords);
      } else {
        setRecordsList([]);
      }
    } catch (err) {
      console.warn('Could not load account transactions:', err);
      setRecordsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [activeMainTab]);

  // Main Tabs
  const mainTabs: { key: MainTab; label: string }[] = [
    { key: 'transaction', label: 'সব লেনদেন' },
    { key: 'deposit', label: 'জমা রেকর্ড' },
    { key: 'withdraw', label: 'উত্তোলন রেকর্ড' },
    { key: 'bonus', label: 'বোনাস রেকর্ড' },
    { key: 'rebate', label: 'রিবেট রেকর্ড' }
  ];

  // Date range text: "09/16 - 09/23"
  const dateRangeDisplay = useMemo(() => {
    const startFormatted = customRange.startDate.length >= 10 ? customRange.startDate.substring(5).replace('-', '/') : customRange.startDate;
    const endFormatted = customRange.endDate.length >= 10 ? customRange.endDate.substring(5).replace('-', '/') : customRange.endDate;
    return `${startFormatted}- ${endFormatted}`;
  }, [customRange]);

  // Format currency/number based on decimal toggle
  const formatVal = (val: number) => {
    return formatCurrency(val, showDecimal);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return recordsList.filter((item) => {
      // 1. Tab filter
      if (activeMainTab === 'deposit' && item.categoryKey !== 'deposit') return false;
      if (activeMainTab === 'withdraw' && item.categoryKey !== 'withdraw') return false;
      if (activeMainTab === 'bonus' && item.categoryKey !== 'bonus') return false;
      if (activeMainTab === 'rebate' && item.categoryKey !== 'rebate') return false;

      // 2. Date range filter
      if (item.date < customRange.startDate || item.date > customRange.endDate) {
        return false;
      }

      // 3. Order Reference Type dropdown filter
      if (orderTypeFilter !== 'all') {
        if (orderTypeFilter === 'deposit' && item.categoryKey !== 'deposit') return false;
        if (orderTypeFilter === 'withdraw' && item.categoryKey !== 'withdraw') return false;
        if (orderTypeFilter === 'bonus' && item.categoryKey !== 'bonus') return false;
        if (orderTypeFilter === 'rebate' && item.categoryKey !== 'rebate') return false;
        if (orderTypeFilter === 'game' && item.categoryKey !== 'game') return false;
      }

      // 4. Keyword search
      if (searchKeyword.trim()) {
        const q = searchKeyword.trim().toLowerCase();
        const mOrder = item.orderRefNumber.toLowerCase().includes(q);
        const mContent = item.content.toLowerCase().includes(q);
        const mType = item.orderRefType.toLowerCase().includes(q);
        if (!mOrder && !mContent && !mType) return false;
      }

      return true;
    });
  }, [recordsList, activeMainTab, customRange, orderTypeFilter, searchKeyword]);

  // Calculation totals
  const summaryTotals = useMemo(() => {
    let deposit = 0;
    let withdraw = 0;
    let bonus = 0;
    let net = 0;

    for (const r of filteredRecords) {
      if (r.categoryKey === 'deposit') deposit += Math.abs(r.amount);
      else if (r.categoryKey === 'withdraw') withdraw += Math.abs(r.amount);
      else if (r.categoryKey === 'bonus' || r.categoryKey === 'rebate') bonus += Math.abs(r.amount);
      net += r.amount;
    }

    return { deposit, withdraw, bonus, net, count: filteredRecords.length };
  }, [filteredRecords]);

  // Date Filter Switch
  const handleSelectDateTab = (tab: DateFilter) => {
    setDateFilter(tab);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getOrderTypeLabel = (val: string) => {
    switch (val) {
      case 'deposit': return 'ডিপোজিট';
      case 'withdraw': return 'উত্তোলন';
      case 'bonus': return 'বোনাস';
      case 'rebate': return 'রিবেট';
      case 'game': return 'গেম জয়লাভ';
      default: return 'সব ধরন';
    }
  };

  const getDateFilterLabel = (val: DateFilter) => {
    switch (val) {
      case 'today': return 'আজ';
      case 'yesterday': return 'গতকাল';
      case '7days': return '৭ দিন';
      case '30days': return '৩০ দিন';
      default: return 'কাস্টম';
    }
  };

  return (
    <div 
      id="account-record-view"
      className="flex-1 bg-white flex flex-col h-full min-h-0 overflow-hidden text-gray-800 font-bengali select-none"
    >
      {/* 1. MOBILE HEADER */}
      <header className="bg-[#0b3327] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30 md:hidden">
        <button
          type="button"
          onClick={() => {
            if (onBack) onBack();
            else if (onClose) onClose();
          }}
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title="ফিরে যান"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-white tracking-wide flex-1 text-center pr-2">
          অ্যাকাউন্ট রেকর্ড
        </h1>

        <button
          type="button"
          onClick={fetchTransactions}
          className={`w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ${
            isLoading ? 'animate-spin' : 'active:scale-90'
          }`}
          title="রিফ্রেশ"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* 2. MOBILE TOP FILTER BAR */}
      <div className="px-3.5 py-2.5 bg-[#f4f6f8] border-b border-gray-200/80 flex md:hidden items-center gap-2 shrink-0 overflow-x-auto">
        {/* Button 1: Order Type Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsMobileTypeDropdownOpen(prev => !prev);
              setIsMobileDateDropdownOpen(false);
            }}
            className="h-8 px-3 rounded-md bg-[#e9ecef] hover:bg-gray-200 text-gray-700 flex items-center gap-1 text-xs font-bold transition-all cursor-pointer border border-gray-300/60"
          >
            <span>{getOrderTypeLabel(orderTypeFilter)}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 opacity-80" />
          </button>

          {isMobileTypeDropdownOpen && (
            <div className="absolute top-9 left-0 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-36 text-xs font-semibold animate-in fade-in zoom-in-95">
              {['all', 'deposit', 'withdraw', 'game', 'bonus', 'rebate'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setOrderTypeFilter(key); setIsMobileTypeDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
                    orderTypeFilter === key ? 'text-[#1890ff] font-bold' : 'text-gray-700'
                  }`}
                >
                  <span>{getOrderTypeLabel(key)}</span>
                  {orderTypeFilter === key && <Check className="w-3.5 h-3.5 text-[#1890ff]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Button 2: Quick Date Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsMobileDateDropdownOpen(prev => !prev);
              setIsMobileTypeDropdownOpen(false);
            }}
            className="h-8 px-3 rounded-md bg-[#1890ff] text-white flex items-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Check className="w-3 h-3 text-white stroke-[3]" />
            <span>{getDateFilterLabel(dateFilter)}</span>
          </button>

          {isMobileDateDropdownOpen && (
            <div className="absolute top-9 left-0 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-32 text-xs font-semibold animate-in fade-in zoom-in-95">
              {(['today', 'yesterday', '7days', '30days', 'custom'] as DateFilter[]).map((df) => (
                <button
                  key={df}
                  type="button"
                  onClick={() => { handleSelectDateTab(df); setIsMobileDateDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${
                    dateFilter === df ? 'text-[#1890ff] font-bold' : 'text-gray-700'
                  }`}
                >
                  <span>{getDateFilterLabel(df)}</span>
                  {dateFilter === df && <Check className="w-3.5 h-3.5 text-[#1890ff]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Button 3: Date Range Pill */}
        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="h-8 px-2.5 rounded-md bg-[#e9ecef] hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer border border-gray-300/60 shrink-0 ml-auto"
          title="ক্যালেন্ডার থেকে তারিখ নির্বাচন করুন"
        >
          <Calendar className="w-3.5 h-3.5 text-gray-600 shrink-0" />
          <span>{dateRangeDisplay}</span>
        </button>
      </div>

      {/* 3. DESKTOP HEADER & CONTROLS */}
      <div className="hidden md:flex flex-col shrink-0">
        {/* Top Tabs */}
        <div className="border-b border-gray-200 px-6 pt-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-8">
            {mainTabs.map((tab) => {
              const isActive = activeMainTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveMainTab(tab.key)}
                  className={`pb-2.5 text-sm transition-all relative whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-red-600 font-bold border-b-2 border-red-600'
                      : 'text-gray-600 hover:text-gray-900 font-medium'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              type="button"
              onClick={fetchTransactions}
              className={`p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer ${
                isLoading ? 'animate-spin text-emerald-600' : ''
              }`}
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Date Filter & Search Actions Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4 bg-white">
          <div className="flex flex-wrap items-center gap-4">
            {/* Quick Radio options */}
            {(['today', 'yesterday', '7days', '30days'] as DateFilter[]).map((df) => (
              <label 
                key={df}
                onClick={() => handleSelectDateTab(df)}
                className="flex items-center gap-1.5 cursor-pointer text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  dateFilter === df ? 'border-red-600' : 'border-gray-300'
                }`}>
                  {dateFilter === df && <span className="w-2 h-2 rounded-full bg-red-600" />}
                </span>
                <span>{getDateFilterLabel(df)}</span>
              </label>
            ))}

            {/* Custom Date Input */}
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:border-red-500 text-xs font-mono text-gray-700 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{dateRangeDisplay}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <div className="h-8 rounded-lg border border-gray-300 bg-white flex items-center px-2.5 gap-1.5 focus-within:border-emerald-600 transition-all min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="অর্ডার নং বা বিবরণ..."
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

            {/* Order Type Dropdown */}
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="h-8 px-2.5 py-1 rounded-md border border-gray-300 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">সব ধরন</option>
              <option value="deposit">ডিপোজিট</option>
              <option value="withdraw">উত্তোলন</option>
              <option value="game">গেম জয়লাভ</option>
              <option value="bonus">বোনাস / রিওয়ার্ড</option>
              <option value="rebate">ক্যাশ রিবেট</option>
            </select>
          </div>
        </div>

        {/* Desktop Table Headers */}
        <div className="bg-[#f7f8fa] border-b border-gray-200 grid grid-cols-6 text-center text-xs font-bold text-gray-700 py-3 px-2">
          <div>অর্ডার সন্দর্ভ প্রকার</div>
          <div>লেনদেনের সময়</div>
          <div>লেনদেনের পরিমাণ</div>
          <div>বর্তমান ব্যালেন্স</div>
          <div>অর্ডার সন্দর্ভ সংখ্যা</div>
          <div className="text-left px-2">কনটেন্ট / বিবরণ</div>
        </div>
      </div>

      {/* 4. MAIN RECORDS CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white flex flex-col">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-7 h-7 text-[#1890ff] animate-spin" />
            <span className="text-xs font-semibold text-gray-500">অ্যাকাউন্ট রেকর্ড লোড হচ্ছে...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-12 animate-in fade-in zoom-in-95">
            <div className="relative w-56 h-48 sm:w-64 sm:h-56 flex items-center justify-center">
              <svg 
                viewBox="0 0 240 200" 
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="89" cy="82" r="2.8" fill="#00a2ff" />
                <circle cx="75" cy="106" r="3.5" fill="#00a2ff" />
                <circle cx="145" cy="78" r="3" fill="#00a2ff" />
                
                <path d="M106 72C106 75 107.5 76.5 110 76.5C107.5 76.5 106 78 106 81C106 78 104.5 76.5 102 76.5C104.5 76.5 106 75 106 72Z" fill="#00a2ff" />
                <path d="M61 103C61 105 62.5 106 64.5 106C62.5 106 61 107 61 109C61 107 59.5 106 57.5 106C59.5 106 61 105 61 103Z" fill="#00a2ff" />
                <path d="M74 97C74 99 75.5 100 77.5 100C75.5 100 74 101 74 103C74 101 72.5 100 70.5 100C72.5 100 74 99 74 97Z" fill="#00a2ff" />
                <path d="M174 99C174 102 175.5 103.5 178.5 103.5C175.5 103.5 174 105 174 108C174 105 172.5 103.5 169.5 103.5C172.5 103.5 174 102 174 99Z" fill="#00a2ff" />

                <path 
                  d="M99 110L141 110L149 133H91L99 110Z" 
                  fill="#f0f9ff"
                  opacity="0.6"
                />
                
                <path 
                  d="M98 110 L142 110 L149 133 L149 157 L91 157 L91 133 Z" 
                  stroke="#00a2ff" 
                  strokeWidth="2.8" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />
                
                <path 
                  d="M91 133 H111 C111 140 115 144 120 144 C125 144 129 140 129 133 H149" 
                  stroke="#00a2ff" 
                  strokeWidth="2.8" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />

                <path 
                  d="M110 131 C107 122 124 105 125 117 C126 128 114 124 121 110 C128 97 140 91 146 85" 
                  stroke="#00a2ff" 
                  strokeWidth="2" 
                  strokeDasharray="3.8 3.8" 
                  strokeLinecap="round" 
                />

                <g transform="translate(135, 74) rotate(-6)">
                  <polygon points="0,17 28,0 14,20" fill="#1890ff" />
                  <polygon points="28,0 23,27 14,20" fill="#0077e6" />
                  <polygon points="14,20 12,26 21,22" fill="#0055b3" opacity="0.8" />
                </g>
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[#1890ff] mt-2 tracking-wide">
              কোন ডেটা নেই
            </h2>
            <p className="text-xs text-gray-500 mt-1">নির্বাচিত ফিল্টারে কোনো অ্যাকাউন্ট রেকর্ড পাওয়া যায়নি।</p>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW */}
            <div className="block md:hidden p-3.5 space-y-3 max-w-2xl mx-auto w-full bg-[#f8fafc] min-h-full pb-10">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    মোট লেনদেন ({dateRangeDisplay})
                  </div>
                  <div className={`text-lg font-mono font-extrabold mt-0.5 ${
                    summaryTotals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {summaryTotals.net >= 0 ? '+' : '-'}৳{formatVal(summaryTotals.net)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-gray-500 font-semibold">
                    {filteredRecords.length} টি রেকর্ড
                  </div>
                  <div className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">
                    জমা: ৳{formatVal(summaryTotals.deposit)}
                  </div>
                </div>
              </div>

              {/* Records List Cards */}
              <div className="space-y-2.5">
                {filteredRecords.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-2 hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.categoryKey === 'deposit' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : item.categoryKey === 'withdraw'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : item.categoryKey === 'game'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {item.orderRefType}
                      </span>

                      <div className={`text-base font-mono font-extrabold ${
                        item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.amount > 0 ? `+৳${formatVal(item.amount)}` : `-৳${formatVal(item.amount)}`}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-2 pt-1 border-t border-gray-50">
                      <div>
                        <div className="font-bold text-xs text-gray-900 leading-tight">
                          {item.content}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
                          <span>রেফারেন্স: {item.orderRefNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.orderRefNumber)}
                            className="text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="কপি করুন"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          {copiedId === item.orderRefNumber && (
                            <span className="text-[9px] text-emerald-600 font-bold">কপি হয়েছে!</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-gray-400">ব্যালেন্স</div>
                        <div className="text-xs font-mono font-bold text-gray-800">
                          ৳{formatVal(item.currentBalance)}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 font-sans pt-0.5 flex items-center justify-between">
                      <span>{item.time}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        সফল
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block w-full divide-y divide-gray-100 bg-[#fafafa]">
              {filteredRecords.map((item) => (
                <div 
                  key={item.id}
                  className="grid grid-cols-6 items-center text-center text-xs py-3.5 px-3 bg-white hover:bg-emerald-50/30 transition-colors font-mono text-gray-700"
                >
                  <div className="font-bengali font-bold text-gray-800 text-xs px-1">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                      item.categoryKey === 'deposit' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : item.categoryKey === 'withdraw'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : item.categoryKey === 'game'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {item.orderRefType}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 font-sans">
                    {item.time}
                  </div>

                  <div className={`font-bold font-mono text-xs ${
                    item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {item.amount > 0 ? `+৳${formatVal(item.amount)}` : `-৳${formatVal(item.amount)}`}
                  </div>

                  <div className="font-bold text-gray-800 font-mono">
                    ৳{formatVal(item.currentBalance)}
                  </div>

                  <div className="font-mono text-gray-600 text-[11px] flex items-center justify-center gap-1">
                    <span className="truncate max-w-[120px]" title={item.orderRefNumber}>{item.orderRefNumber}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.orderRefNumber)}
                      className="p-1 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
                      title="অর্ডার নম্বর কপি করুন"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedId === item.orderRefNumber && (
                      <span className="text-[9px] text-emerald-600 font-bold font-sans">কপি!</span>
                    )}
                  </div>

                  <div className="font-bengali text-gray-700 text-xs text-left px-2 truncate" title={item.content}>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 5. FOOTER & SUMMARY BAR */}
      <footer className="bg-[#f0f2f5] border-t border-gray-200 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-gray-800 shrink-0 font-mono">
        <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-bengali text-gray-600">মোট জমা:</span>
            <span className="text-emerald-600 font-bold">৳{formatVal(summaryTotals.deposit)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bengali text-gray-600">মোট উত্তোলন:</span>
            <span className="text-amber-600 font-bold">৳{formatVal(summaryTotals.withdraw)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bengali text-gray-600">নিট পরিবর্তন:</span>
            <span className={summaryTotals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {summaryTotals.net >= 0 ? '+' : '-'}৳{formatVal(summaryTotals.net)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-gray-600 text-[11px] font-medium font-bengali">দশমিক বিন্দু</span>
            <button
              type="button"
              onClick={() => setShowDecimal(!showDecimal)}
              className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                showDecimal ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                  showDecimal ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="text-gray-500 font-bengali font-normal text-[11px]">
            রেকর্ড: {filteredRecords.length} টি
          </div>
        </div>
      </footer>

      {/* Interactive Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        initialRange={customRange}
        title="তারিখ রেঞ্জ নির্বাচন করুন"
        onApply={(range) => {
          setCustomRange(range);
          setDateFilter('custom');
        }}
      />
    </div>
  );
};
