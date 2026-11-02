// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  ChevronDown,
  Check,
  ClipboardList,
  ArrowDownToLine,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { UserAccount } from '../types';
import { DateRangePickerModal, DateRange } from './DateRangePickerModal';
import { api } from '../services/api';

export type RecordMode = 'deposit' | 'withdraw';
type DateQuickTab = 'today' | 'yesterday' | '7days';

export interface DepositWithdrawItem {
  id: string;
  orderNo: string;
  type: RecordMode;
  method: string;          // e.g. 'bKash', 'Nagad', 'Rocket', 'USDT-TRC20'
  categoryName: string;    // e.g. 'অনলাইন ক্যাশ ডিপোজিট', 'পার্সোনাল ওয়ালেট উত্তোলন'
  accountNumber: string;   // e.g. '017****8890'
  amount: number;
  bonusAmount?: number;
  actualAmount?: number;
  fee?: number;
  status: 'success' | 'processing' | 'cancelled';
  statusText: string;
  dateTime: string;
  date: string;            // '2026-08-30'
  remark?: string;
}

interface DepositWithdrawRecordViewProps {
  user?: UserAccount;
  initialType?: RecordMode;
  onBack?: () => void;
  onClose?: () => void;
}
// Transactions loaded exclusively from REST API (https://server.nexarofx.com/dbserver/api)


export const DepositWithdrawRecordView: React.FC<DepositWithdrawRecordViewProps> = ({
  user,
  initialType = 'deposit',
  onBack,
  onClose
}) => {
  // Current view mode: 'deposit' (জমা রেকর্ড) or 'withdraw' (উত্তোলন রেকর্ড)
  const [recordType, setRecordType] = useState<RecordMode>(initialType);

  // Top Date Tab: 'today' | 'yesterday' | '7days' matching Capture.PNG
  const [activeDateTab, setActiveDateTab] = useState<DateQuickTab>('today');

  // Sub-filter: 'all' | 'success' | 'processing' | 'cancelled'
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'processing' | 'cancelled'>('all');
  
  // Method / Type filter: 'all' | 'bKash' | 'Nagad' | 'Rocket' | 'USDT'
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Custom Date range
  const [customRange, setCustomRange] = useState<DateRange>({
    startDate: '2026-08-30',
    endDate: '2026-09-30'
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Live transactions from backend
  const [backendTxList, setBackendTxList] = useState<DepositWithdrawItem[]>([]);

  React.useEffect(() => {
    api.wallet.getTransactions(recordType).then(res => {
      if (res.success && Array.isArray(res.transactions)) {
        const mapped: DepositWithdrawItem[] = res.transactions.map((tx: any) => ({
          id: tx.id,
          orderNo: tx.trxId || tx.id,
          type: tx.type === 'withdraw' ? 'withdraw' : 'deposit',
          method: tx.channel === 'bkash' ? 'bKash' : tx.channel === 'nagad' ? 'Nagad' : tx.channel === 'rocket' ? 'Rocket' : tx.channel || 'অন্যান্য',
          categoryName: tx.description || (tx.type === 'withdraw' ? 'ওয়ালেট উত্তোলন' : 'অনলাইন ক্যাশ ডিপোজিট'),
          accountNumber: tx.accountNumber || '016****9856',
          amount: Number(tx.amount || 0),
          bonusAmount: Number(tx.bonus || 0),
          status: tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'processing' : 'cancelled',
          statusText: tx.status === 'success' ? 'সফল' : tx.status === 'pending' ? 'প্রক্রিয়াধীন' : 'বাতিল',
          dateTime: tx.createdAt || new Date().toISOString(),
          date: (tx.createdAt || '').slice(0, 10),
          remark: tx.description
        }));
        setBackendTxList(mapped);
      } else {
        setBackendTxList([]);
      }
    }).catch(err => {
      console.warn('Could not load transactions from API:', err);
      setBackendTxList([]);
    });
  }, [recordType]);

  // Date range display text matching "08/30- 08/30" in Capture.PNG
  const dateRangeDisplay = useMemo(() => {
    const startFormatted = customRange.startDate.substring(5).replace('-', '/');
    const endFormatted = customRange.endDate.substring(5).replace('-', '/');
    return `${startFormatted}- ${endFormatted}`;
  }, [customRange]);

  // Handle Tab Switch (আজ, গতকাল, 7 দিন)
  const handleSelectDateTab = (tab: DateQuickTab) => {
    setActiveDateTab(tab);
    if (tab === 'today') {
      setCustomRange({ startDate: '2026-08-30', endDate: '2026-09-30' });
    } else if (tab === 'yesterday') {
      setCustomRange({ startDate: '2026-08-29', endDate: '2026-08-29' });
    } else if (tab === '7days') {
      setCustomRange({ startDate: '2026-08-24', endDate: '2026-09-30' });
    }
  };

  // Filter records directly from REST API data
  const allList = backendTxList;
  
  const records = useMemo(() => {
    return allList.filter(item => {
      // Date filter
      if (item.date < customRange.startDate || item.date > customRange.endDate) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Method filter
      if (methodFilter !== 'all' && item.method !== methodFilter) {
        return false;
      }
      return true;
    });
  }, [allList, customRange, statusFilter, methodFilter]);

  // Totals
  const totalAmount = useMemo(() => {
    return records.reduce((acc, curr) => acc + curr.amount, 0);
  }, [records]);

  const formatVal = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const titleText = recordType === 'deposit' ? 'জমা রেকর্ড' : 'উত্তোলন রেকর্ড';

  return (
    <div 
      id={`${recordType}-record-view`}
      className="w-full h-full min-h-screen bg-white flex flex-col font-bengali select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. TOP FOREST GREEN HEADER matching Capture.PNG */}
      {/* ========================================================================= */}
      <header className="bg-[#0b3327] px-4 py-3.5 text-white flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
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

        {/* Dynamic Title: জমা রেকর্ড or উত্তোলন রেকর্ড */}
        <h1 className="text-base sm:text-lg font-bold text-white tracking-wide flex-1 text-center pr-2">
          {titleText}
        </h1>

        {/* Right Clipboard Icon with Downward Arrow Circle Badge matching Capture.PNG */}
        <button
          type="button"
          onClick={() => {
            // Toggle between deposit & withdraw for instant testing
            setRecordType(prev => prev === 'deposit' ? 'withdraw' : 'deposit');
          }}
          className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
          title={`সুইচ করুন: ${recordType === 'deposit' ? 'উত্তোলন রেকর্ড' : 'জমা রেকর্ড'}`}
        >
          {/* Clipboard with down arrow badge */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            <div className="absolute -bottom-1 -right-1.5 w-4 h-4 bg-emerald-500 border border-[#0b3327] rounded-full flex items-center justify-center">
              <ArrowDownToLine className="w-2.5 h-2.5 text-white stroke-[2.5]" />
            </div>
          </div>
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. TOP TABS: [ আজ ] | [ গতকাল ] | [ 7 দিন ] matching Capture.PNG */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-gray-200 grid grid-cols-3 shrink-0">
        
        {/* Tab 1: আজ */}
        <button
          type="button"
          onClick={() => handleSelectDateTab('today')}
          className={`py-3 text-center text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
            activeDateTab === 'today'
              ? 'text-[#1890ff]'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>আজ</span>
          {activeDateTab === 'today' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1890ff]" />
          )}
        </button>

        {/* Tab 2: গতকাল */}
        <button
          type="button"
          onClick={() => handleSelectDateTab('yesterday')}
          className={`py-3 text-center text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
            activeDateTab === 'yesterday'
              ? 'text-[#1890ff]'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>গতকাল</span>
          {activeDateTab === 'yesterday' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1890ff]" />
          )}
        </button>

        {/* Tab 3: 7 দিন */}
        <button
          type="button"
          onClick={() => handleSelectDateTab('7days')}
          className={`py-3 text-center text-sm sm:text-base font-bold transition-all relative cursor-pointer ${
            activeDateTab === '7days'
              ? 'text-[#1890ff]'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <span>7 দিন</span>
          {activeDateTab === '7days' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1890ff]" />
          )}
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 3. SECONDARY FILTER BAR: [ সব ] [ প্রকার ] [ 📅 08/30- 08/30 ] matching Capture.PNG */}
      {/* ========================================================================= */}
      <div className="px-3.5 py-2.5 bg-[#f4f6f8] border-b border-gray-200/80 flex items-center justify-between gap-2 shrink-0">
        
        <div className="flex items-center gap-2 relative">
          
          {/* Button 1: [ সব ] with Status Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStatusDropdownOpen(prev => !prev);
                setIsMethodDropdownOpen(false);
              }}
              className={`h-8 px-3 rounded-md flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                statusFilter !== 'all'
                  ? 'bg-[#1890ff] text-white border border-[#1890ff]'
                  : 'bg-white text-[#1890ff] border border-[#1890ff] hover:bg-blue-50/50'
              }`}
            >
              <span>{statusFilter === 'all' ? 'সব' : statusFilter === 'success' ? 'সফল' : statusFilter === 'processing' ? 'প্রক্রিয়া' : 'বাতিল'}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-9 left-0 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-28 text-xs font-semibold animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setIsStatusDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${statusFilter === 'all' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>সব</span>
                  {statusFilter === 'all' && <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('success'); setIsStatusDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${statusFilter === 'success' ? 'text-emerald-600 font-bold' : 'text-gray-700'}`}
                >
                  <span>সফল</span>
                  {statusFilter === 'success' && <Check className="w-3 h-3 text-emerald-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('processing'); setIsStatusDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${statusFilter === 'processing' ? 'text-amber-600 font-bold' : 'text-gray-700'}`}
                >
                  <span>প্রক্রিয়াকরণ</span>
                  {statusFilter === 'processing' && <Check className="w-3 h-3 text-amber-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setStatusFilter('cancelled'); setIsStatusDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${statusFilter === 'cancelled' ? 'text-rose-600 font-bold' : 'text-gray-700'}`}
                >
                  <span>বাতিল</span>
                  {statusFilter === 'cancelled' && <Check className="w-3 h-3 text-rose-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Button 2: [ প্রকার ] (Payment Method: bKash / Nagad / Rocket / USDT) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMethodDropdownOpen(prev => !prev);
                setIsStatusDropdownOpen(false);
              }}
              className={`h-8 px-3 rounded-md flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                methodFilter !== 'all'
                  ? 'bg-[#1890ff] text-white border border-[#1890ff]'
                  : 'bg-white text-[#1890ff] border border-[#1890ff] hover:bg-blue-50/50'
              }`}
            >
              <span>{methodFilter === 'all' ? 'প্রকার' : methodFilter}</span>
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>

            {isMethodDropdownOpen && (
              <div className="absolute top-9 left-0 z-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-32 text-xs font-semibold animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => { setMethodFilter('all'); setIsMethodDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${methodFilter === 'all' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>সব প্রকার</span>
                  {methodFilter === 'all' && <Check className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setMethodFilter('bKash'); setIsMethodDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${methodFilter === 'bKash' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>bKash (বিকাশ)</span>
                  {methodFilter === 'bKash' && <Check className="w-3 h-3 text-[#1890ff]" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setMethodFilter('Nagad'); setIsMethodDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${methodFilter === 'Nagad' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>Nagad (নগদ)</span>
                  {methodFilter === 'Nagad' && <Check className="w-3 h-3 text-[#1890ff]" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setMethodFilter('Rocket'); setIsMethodDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${methodFilter === 'Rocket' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>Rocket (রকেট)</span>
                  {methodFilter === 'Rocket' && <Check className="w-3 h-3 text-[#1890ff]" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setMethodFilter('USDT'); setIsMethodDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center justify-between ${methodFilter === 'USDT' ? 'text-[#1890ff] font-bold' : 'text-gray-700'}`}
                >
                  <span>USDT (ক্রিপ্টো)</span>
                  {methodFilter === 'USDT' && <Check className="w-3 h-3 text-[#1890ff]" />}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Button 3: [ 📅 08/30- 08/30 ] matching Capture.PNG */}
        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="h-8 px-2.5 rounded-md bg-white text-[#1890ff] border border-[#1890ff] hover:bg-blue-50/50 flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer shrink-0"
          title="ক্যালেন্ডার থেকে তারিখ নির্বাচন করুন"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#1890ff] shrink-0" />
          <span>{dateRangeDisplay}</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN CONTENT AREA: Exact Vector Illustration OR Rich Sample Records */}
      {/* ========================================================================= */}
      <div className="flex-1 overflow-y-auto bg-white flex flex-col justify-start">
        {records.length === 0 ? (
          // =======================================================================
          // EMPTY STATE: Exact Pixel-Accurate Match to Capture.PNG
          // =======================================================================
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 animate-in fade-in zoom-in-95 my-auto">
            
            {/* Vector Illustration */}
            <div className="relative w-64 h-56 flex items-center justify-center">
              <svg 
                viewBox="0 0 240 200" 
                className="w-full h-full"
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Decorative Sparkle Stars and Cyan Dots matching Capture.PNG */}
                {/* Dot 1 - Top Left */}
                <circle cx="89" cy="82" r="2.8" fill="#00a2ff" />
                {/* Dot 2 - Mid Left */}
                <circle cx="75" cy="106" r="3.5" fill="#00a2ff" />
                {/* Dot 3 - Top Right */}
                <circle cx="145" cy="78" r="3" fill="#00a2ff" />
                
                {/* Sparkle 1 (Top Center) */}
                <path d="M106 72C106 75 107.5 76.5 110 76.5C107.5 76.5 106 78 106 81C106 78 104.5 76.5 102 76.5C104.5 76.5 106 75 106 72Z" fill="#00a2ff" />
                {/* Sparkle 2 (Far Left) */}
                <path d="M61 103C61 105 62.5 106 64.5 106C62.5 106 61 107 61 109C61 107 59.5 106 57.5 106C59.5 106 61 105 61 103Z" fill="#00a2ff" />
                {/* Sparkle 3 (Mid Left) */}
                <path d="M74 97C74 99 75.5 100 77.5 100C75.5 100 74 101 74 103C74 101 72.5 100 70.5 100C72.5 100 74 99 74 97Z" fill="#00a2ff" />
                {/* Sparkle 4 (Right side) */}
                <path d="M174 99C174 102 175.5 103.5 178.5 103.5C175.5 103.5 174 105 174 108C174 105 172.5 103.5 169.5 103.5C172.5 103.5 174 102 174 99Z" fill="#00a2ff" />
                {/* Sparkle 5 (Far Right small) */}
                <path d="M179 93C179 94 180 94.5 181 94.5C180 94.5 179 95 179 96C179 95 178 94.5 177 94.5C178 94.5 179 94 179 93Z" fill="#00a2ff" />

                {/* 3D Isometric Blue Box / Drawer Tray with front notch cutout matching Capture.PNG */}
                <path 
                  d="M99 110L141 110L149 133H91L99 110Z" 
                  fill="#f0f9ff"
                  opacity="0.6"
                />
                
                {/* Box Outer Outlines */}
                <path 
                  d="M98 110 L142 110 L149 133 L149 157 L91 157 L91 133 Z" 
                  stroke="#00a2ff" 
                  strokeWidth="2.8" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />
                
                {/* Front Tray Face with Curved Center Notch */}
                <path 
                  d="M91 133 H111 C111 140 115 144 120 144 C125 144 129 140 129 133 H149" 
                  stroke="#00a2ff" 
                  strokeWidth="2.8" 
                  strokeLinejoin="round" 
                  strokeLinecap="round"
                />

                {/* Dashed Loop Trajectory of Paper Airplane flying out of box */}
                <path 
                  d="M110 131 C107 122 124 105 125 117 C126 128 114 124 121 110 C128 97 140 91 146 85" 
                  stroke="#00a2ff" 
                  strokeWidth="2" 
                  strokeDasharray="3.8 3.8" 
                  strokeLinecap="round"
                />

                {/* Paper Airplane in Sky Blue matching Capture.PNG */}
                <g transform="translate(135, 74) rotate(-6)">
                  <polygon points="0,17 28,0 14,20" fill="#1890ff" />
                  <polygon points="28,0 23,27 14,20" fill="#0077e6" />
                  <polygon points="14,20 12,26 21,22" fill="#0055b3" opacity="0.8" />
                </g>
              </svg>
            </div>

            {/* Bengali Text matching Capture.PNG: কোন ডেটা নেই */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#1890ff] mt-2 tracking-wide">
              কোন ডেটা নেই
            </h2>
          </div>
        ) : (
          // =======================================================================
          // POPULATED STATE: Rich REST API Transaction Cards
          // =======================================================================
          <div className="p-3.5 space-y-3 max-w-2xl mx-auto w-full bg-[#f8fafc] min-h-full pb-10">
            
            {/* Top Summary Banner */}
            <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">
                  {recordType === 'deposit' ? 'মোট সফল জমা' : 'মোট সফল উত্তোলন'} ({dateRangeDisplay})
                </div>
                <div className="text-lg font-mono font-extrabold text-gray-900 mt-0.5">
                  ৳{formatVal(totalAmount)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-semibold">
                  মোট {records.length} টি রেকর্ড
                </span>
              </div>
            </div>

            {/* Records List */}
            <div className="space-y-2.5">
              {records.map((item) => {
                const isSuccess = item.status === 'success';
                const isProcessing = item.status === 'processing';

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3.5 shadow-2xs border border-gray-100 space-y-2 hover:border-blue-200 transition-all"
                  >
                    {/* Header Row: Category/Method & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          item.method === 'bKash' ? 'bg-[#e2136e]/10 text-[#e2136e]' :
                          item.method === 'Nagad' ? 'bg-[#f7941d]/10 text-[#f7941d]' :
                          item.method === 'Rocket' ? 'bg-[#8c3494]/10 text-[#8c3494]' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.method.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                            {item.categoryName}
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono">
                            {item.accountNumber}
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                        isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        isProcessing ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                        {isProcessing && <Clock className="w-3 h-3 animate-spin" />}
                        {!isSuccess && !isProcessing && <XCircle className="w-3 h-3" />}
                        <span>{item.statusText}</span>
                      </span>
                    </div>

                    {/* Middle Row: Amounts */}
                    <div className="flex items-end justify-between pt-1 border-t border-gray-50">
                      <div>
                        <div className="text-[11px] text-gray-400 font-mono">অর্ডার: {item.orderNo}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">{item.dateTime}</div>
                      </div>

                      <div className="text-right">
                        <div className={`text-base sm:text-lg font-mono font-extrabold ${
                          recordType === 'deposit' ? 'text-emerald-600' : 'text-purple-600'
                        }`}>
                          {recordType === 'deposit' ? '+' : '-'}৳{formatVal(item.amount)}
                        </div>
                        {item.bonusAmount ? item.bonusAmount > 0 ? (
                          <div className="text-[11px] font-semibold text-amber-600 font-mono">
                            +৳{formatVal(item.bonusAmount)} বোনাস
                          </div>
                        ) : null : null}
                      </div>
                    </div>

                    {/* Footnote Remark */}
                    {item.remark && (
                      <div className="text-[11px] text-gray-500 bg-gray-50/80 rounded-lg px-2.5 py-1 flex items-center justify-between">
                        <span>নোট: {item.remark}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        initialRange={customRange}
        title="তারিখ রেঞ্জ নির্বাচন করুন"
        onApply={(range) => {
          setCustomRange(range);
          setActiveDateTab('today'); // custom selection
        }}
      />
    </div>
  );
};
