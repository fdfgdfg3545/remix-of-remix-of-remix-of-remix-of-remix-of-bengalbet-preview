// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Check, 
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Coins,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Award
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

interface ProfitLossViewProps {
  user?: UserAccount;
  onBack?: () => void;
  onClose?: () => void;
}

type DateQuickFilter = 'today' | 'yesterday' | '7days' | '30days' | 'custom';

export interface ProfitLossRecord {
  id: string;
  date: string;
  category: string;
  vendor: string;
  gameName: string;
  deposit: number;
  withdraw: number;
  betAmount: number;
  validBet: number;
  reward: number;
  netProfit: number;
  rebate: number;
  bonus: number;
}

// Profit & Loss records loaded exclusively from REST API (https://server.nexarofx.com/dbserver/api/games.php?action=records)


export const ProfitLossView: React.FC<ProfitLossViewProps> = ({ 
  user, 
  onBack, 
  onClose 
}) => {
  // Active quick filter: 'today' | 'yesterday' | '7days' | '30days' | 'custom'
  const [activeDateFilter, setActiveDateFilter] = useState<DateQuickFilter>('30days');

  // Date range state - default to last 30 days
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: getDaysAgoStr(30),
    endDate: getTodayStr()
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [recordsList, setRecordsList] = useState<ProfitLossRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch real data from server (both bets and transactions)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [betsRes] = await Promise.allSettled([
        api.games.getRecords()
      ]);

      let items: ProfitLossRecord[] = [];

      if (betsRes.status === 'fulfilled' && betsRes.value?.success && Array.isArray(betsRes.value?.bets)) {
        const mappedBets: ProfitLossRecord[] = betsRes.value.bets.map((b: any) => {
          const betAmount = Number(b.betAmount || 0);
          const validBet = Number(b.validBet || b.betAmount || 0);
          const reward = Number(b.reward || 0);
          const netProfit = b.profit !== undefined ? Number(b.profit) : reward - betAmount;
          const dateStr = b.date || (b.time ? b.time.substring(0, 10) : getTodayStr());

          let catName = 'স্লট (Slot)';
          if (b.category === 'live') catName = 'লাইভ ক্যাসিনো';
          else if (b.category === 'fishing') catName = 'মাছ শিকার';
          else if (b.category === 'sports') catName = 'খেলাধুলা (Sports)';
          else if (b.category === 'poker') catName = 'পোকার (Poker)';
          else if (b.category === 'crash') catName = 'ক্র্যাশ গেম';

          return {
            id: `pl-srv-${b.id}`,
            date: dateStr,
            category: catName,
            vendor: b.vendor || 'JILI',
            gameName: b.gameName || 'সুপার এস',
            deposit: 0,
            withdraw: 0,
            betAmount,
            validBet,
            reward,
            netProfit,
            rebate: Math.round(validBet * 0.01),
            bonus: 0
          };
        });

        items = mappedBets;
      }

      setRecordsList(items);
    } catch (err) {
      console.warn('Could not load profit loss records from API:', err);
      setRecordsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format date range display
  const dateRangeDisplay = useMemo(() => {
    const startFormatted = customRange.startDate.length >= 10 ? customRange.startDate.substring(5).replace('-', '/') : customRange.startDate;
    const endFormatted = customRange.endDate.length >= 10 ? customRange.endDate.substring(5).replace('-', '/') : customRange.endDate;
    return `${startFormatted}- ${endFormatted}`;
  }, [customRange]);

  // Handler for quick date filter selection
  const handleSelectQuickFilter = (filter: DateQuickFilter) => {
    setActiveDateFilter(filter);
    if (filter === 'today') {
      const today = getTodayStr();
      setCustomRange({ startDate: today, endDate: today });
    } else if (filter === 'yesterday') {
      const yesterday = getYesterdayStr();
      setCustomRange({ startDate: yesterday, endDate: yesterday });
    } else if (filter === '7days') {
      setCustomRange({ startDate: getDaysAgoStr(7), endDate: getTodayStr() });
    } else if (filter === '30days') {
      setCustomRange({ startDate: getDaysAgoStr(30), endDate: getTodayStr() });
    } else if (filter === 'custom') {
      setIsDatePickerOpen(true);
    }
  };

  // Filter records based on selected date range
  const filteredRecords = useMemo(() => {
    return recordsList.filter(record => {
      return record.date >= customRange.startDate && record.date <= customRange.endDate;
    });
  }, [recordsList, customRange]);

  // Calculate totals
  const totals = useMemo(() => {
    return filteredRecords.reduce((acc, curr) => ({
      deposit: acc.deposit + curr.deposit,
      withdraw: acc.withdraw + curr.withdraw,
      betAmount: acc.betAmount + curr.betAmount,
      validBet: acc.validBet + curr.validBet,
      reward: acc.reward + curr.reward,
      netProfit: acc.netProfit + curr.netProfit,
      rebate: acc.rebate + curr.rebate,
      bonus: acc.bonus + curr.bonus
    }), {
      deposit: 0,
      withdraw: 0,
      betAmount: 0,
      validBet: 0,
      reward: 0,
      netProfit: 0,
      rebate: 0,
      bonus: 0
    });
  }, [filteredRecords]);

  const formatVal = (val: number) => {
    return formatCurrency(val, true);
  };

  return (
    <div 
      id="profit-loss-view"
      className="w-full h-full min-h-0 bg-white flex flex-col font-bengali select-none overflow-hidden"
    >
      {/* 1. Top Forest Green Header */}
      <header className="bg-[#0b3327] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2">
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

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
            ব্যক্তিগত প্রতিবেদন (লাভ ও ক্ষতি)
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className={`w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ${
            isLoading ? 'animate-spin' : 'active:scale-90'
          }`}
          title="রিফ্রেশ করুন"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* 2. Top Filter Bar */}
      <div className="px-3.5 py-2.5 bg-[#f8fafc] border-b border-gray-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => handleSelectQuickFilter('today')}
          className={`h-8 px-3 rounded-md flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeDateFilter === 'today'
              ? 'bg-[#1890ff] text-white border border-[#1890ff] shadow-xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {activeDateFilter === 'today' && (
            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center -ml-0.5">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
          <span>আজ</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectQuickFilter('yesterday')}
          className={`h-8 px-3.5 rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeDateFilter === 'yesterday'
              ? 'bg-[#1890ff] text-white border border-[#1890ff] shadow-xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {activeDateFilter === 'yesterday' && (
            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center -ml-0.5 mr-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
          <span>গতকাল</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectQuickFilter('7days')}
          className={`h-8 px-3.5 rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeDateFilter === '7days'
              ? 'bg-[#1890ff] text-white border border-[#1890ff] shadow-xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {activeDateFilter === '7days' && (
            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center -ml-0.5 mr-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
          <span>৭ দিন</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectQuickFilter('30days')}
          className={`h-8 px-3.5 rounded-md flex items-center justify-center text-xs font-bold transition-all cursor-pointer shrink-0 ${
            activeDateFilter === '30days'
              ? 'bg-[#1890ff] text-white border border-[#1890ff] shadow-xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {activeDateFilter === '30days' && (
            <span className="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center -ml-0.5 mr-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
          <span>৩০ দিন</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className={`h-8 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ml-auto ${
            activeDateFilter === 'custom'
              ? 'bg-[#1890ff] text-white border border-[#1890ff] shadow-xs'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          title="ক্যালেন্ডার থেকে তারিখ নির্বাচন করুন"
        >
          <CalendarIcon className={`w-3.5 h-3.5 ${activeDateFilter === 'custom' ? 'text-white' : 'text-[#1890ff]'} shrink-0`} />
          <span>{dateRangeDisplay}</span>
        </button>
      </div>

      {/* 3. Main Center Content: Summary & Table/Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f6f9] p-3 sm:p-5 space-y-4">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-7 h-7 text-[#1890ff] animate-spin" />
            <span className="text-xs font-semibold text-gray-500">লাভ ও ক্ষতি হিসাব তৈরি হচ্ছে...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="min-h-[350px] flex flex-col items-center justify-center text-center my-auto animate-in fade-in zoom-in-95 bg-white rounded-2xl py-12 px-4 shadow-2xs border border-gray-100 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-[#1890ff] mt-2 tracking-wide">কোন ডেটা নেই</h2>
            <p className="text-xs text-gray-500 mt-1">নির্বাচিত সময়ের জন্য কোনো লাভ বা ক্ষতির বিবরণ পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto pb-6">
            {/* Top 6 KPI Metric Cards */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1890ff]" />
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    লাভ ও ক্ষতি সারসংক্ষেপ ({dateRangeDisplay})
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-semibold font-mono">
                  {filteredRecords.length} টি রেকর্ড
                </span>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {/* 1. Deposit */}
                <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100/70">
                  <div className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>মোট জমা</span>
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-emerald-700 mt-1">
                    ৳{formatVal(totals.deposit)}
                  </div>
                </div>

                {/* 2. Withdrawal */}
                <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100/70">
                  <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    <span>মোট উত্তোলন</span>
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-amber-700 mt-1">
                    ৳{formatVal(totals.withdraw)}
                  </div>
                </div>

                {/* 3. Total Bet */}
                <div className="bg-blue-50/40 rounded-xl p-3 border border-blue-100/70">
                  <div className="text-[11px] text-blue-800 font-medium flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-blue-600" />
                    <span>মোট বাজি</span>
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-blue-700 mt-1">
                    ৳{formatVal(totals.betAmount)}
                  </div>
                </div>

                {/* 4. Total Payout */}
                <div className="bg-purple-50/40 rounded-xl p-3 border border-purple-100/70">
                  <div className="text-[11px] text-purple-800 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>মোট জয়</span>
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-purple-700 mt-1">
                    ৳{formatVal(totals.reward)}
                  </div>
                </div>

                {/* 5. Net Profit / Loss */}
                <div className={`rounded-xl p-3 border ${
                  totals.netProfit >= 0 
                    ? 'bg-emerald-500 text-white shadow-xs' 
                    : 'bg-rose-500 text-white shadow-xs'
                }`}>
                  <div className="text-[11px] font-medium opacity-90 flex items-center gap-1">
                    {totals.netProfit >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span>নেট লাভ/ক্ষতি</span>
                  </div>
                  <div className="font-mono font-extrabold text-sm sm:text-base mt-1">
                    {totals.netProfit >= 0 ? `+৳${formatVal(totals.netProfit)}` : `-৳${formatVal(totals.netProfit)}`}
                  </div>
                </div>

                {/* 6. Rebate & Bonus */}
                <div className="bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/70">
                  <div className="text-[11px] text-indigo-800 font-medium flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-indigo-600" />
                    <span>বোনাস ও রিবেট</span>
                  </div>
                  <div className="font-mono font-bold text-sm sm:text-base text-indigo-700 mt-1">
                    ৳{formatVal(totals.rebate + totals.bonus)}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Table View (md:block) */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f1f5f9] text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">খেলার নাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4 text-right">বেট পরিমাণ</th>
                    <th className="py-3 px-4 text-right">বৈধ বেট</th>
                    <th className="py-3 px-4 text-right">পুরস্কার</th>
                    <th className="py-3 px-4 text-right">রিবেট</th>
                    <th className="py-3 px-4 text-right">নেট লাভ / ক্ষতি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 font-sans text-gray-600">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-gray-900">{item.gameName}</div>
                        <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold font-sans">
                          {item.vendor}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-gray-600">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ৳{formatVal(item.betAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">
                        ৳{formatVal(item.validBet)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600">
                        ৳{formatVal(item.reward)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-indigo-600">
                        ৳{formatVal(item.rebate)}
                      </td>
                      <td className={`py-3 px-4 text-right font-extrabold ${
                        item.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {item.netProfit > 0 ? `+৳${formatVal(item.netProfit)}` : item.netProfit < 0 ? `-৳${formatVal(item.netProfit)}` : '৳0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (md:hidden) */}
            <div className="md:hidden space-y-2.5">
              {filteredRecords.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-2.5 hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{item.gameName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#1890ff] border border-blue-100">
                        {item.vendor}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-gray-400 font-medium">
                      {item.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>বিভাগ: <strong className="text-gray-700">{item.category}</strong></span>
                    {item.deposit > 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold">ডিপোজিট: ৳{formatVal(item.deposit)}</span>
                    )}
                    {item.withdraw > 0 && (
                      <span className="text-[11px] text-purple-600 font-semibold">উত্তোলন: ৳{formatVal(item.withdraw)}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono text-xs">
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">বেট</div>
                      <div className="font-bold text-gray-800">৳{formatVal(item.betAmount)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">বৈধ বেট</div>
                      <div className="font-bold text-gray-800">৳{formatVal(item.validBet)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-1.5">
                      <div className="text-[10px] text-gray-500 font-bengali">পুরস্কার</div>
                      <div className="font-bold text-amber-600">৳{formatVal(item.reward)}</div>
                    </div>
                    <div className={`rounded-lg p-1.5 ${
                      item.netProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      <div className="text-[10px] font-bengali opacity-80">লাভ/ক্ষতি</div>
                      <div className="font-extrabold">
                        {item.netProfit > 0 ? `+৳${formatVal(item.netProfit)}` : item.netProfit < 0 ? `-৳${formatVal(item.netProfit)}` : '৳0.00'}
                      </div>
                    </div>
                  </div>

                  {(item.rebate > 0 || item.bonus > 0) && (
                    <div className="pt-1 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-500">
                      <span>অর্জিত রিবেট: <strong className="text-indigo-600 font-mono">৳{formatVal(item.rebate)}</strong></span>
                      {item.bonus > 0 && (
                        <span>বোনাস: <strong className="text-emerald-600 font-mono">৳{formatVal(item.bonus)}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Disclaimer / Notice Bar */}
      <footer className="bg-[#fff1f0] border-t border-[#ffccc7] px-4 py-2.5 flex items-center justify-center gap-2 shrink-0">
        <div className="w-4 h-4 rounded-full bg-[#ff4d4f] text-white flex items-center justify-center shrink-0">
          <span className="text-[10px] font-extrabold leading-none">!</span>
        </div>
        <span className="text-[#cf1322] font-semibold text-xs sm:text-[13px] tracking-wide">
          অন্তর্বর্ণীকরণ: উপরের প্রতিবেদন GMT + 8 ভিত্তিক স্বয়ংক্রিয় হিসাব
        </span>
      </footer>

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        initialRange={customRange}
        title="তারিখ রেঞ্জ নির্বাচন করুন"
        onApply={(range) => {
          setCustomRange(range);
          setActiveDateFilter('custom');
        }}
      />
    </div>
  );
};
