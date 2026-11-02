// @ts-nocheck
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRange?: DateRange;
  onApply: (range: DateRange) => void;
  title?: string;
  withTime?: boolean;
}

export const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  initialRange = { startDate: '2026-08-29', endDate: '2026-08-29' },
  onApply,
  title = 'তারিখ নির্বাচন করুন',
  withTime = false
}) => {
  const [startDate, setStartDate] = useState<string>(initialRange.startDate);
  const [endDate, setEndDate] = useState<string>(initialRange.endDate);
  
  // Current view calendar month/year
  const [viewYear, setViewYear] = useState<number>(() => {
    return parseInt(initialRange.endDate.split('-')[0]) || 2026;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parseInt(initialRange.endDate.split('-')[1]) - 1 || 7; // 0-indexed (7 = Aug)
  });

  const [selectingStep, setSelectingStep] = useState<'start' | 'end'>('start');

  if (!isOpen) return null;

  const monthNamesBangla = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const daysOfWeek = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatLocalDate = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleDateClick = (dateStr: string) => {
    if (selectingStep === 'start') {
      setStartDate(dateStr);
      setEndDate(dateStr);
      setSelectingStep('end');
    } else {
      if (new Date(dateStr) < new Date(startDate)) {
        setStartDate(dateStr);
        setEndDate(startDate);
      } else {
        setEndDate(dateStr);
      }
      setSelectingStep('start');
    }
  };

  // Quick preset ranges
  const applyPreset = (type: 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'lastMonth') => {
    const baseDate = new Date();
    let start = new Date(baseDate);
    let end = new Date(baseDate);

    if (type === 'today') {
      // today
    } else if (type === 'yesterday') {
      start.setDate(baseDate.getDate() - 1);
      end.setDate(baseDate.getDate() - 1);
    } else if (type === '7days') {
      start.setDate(baseDate.getDate() - 6);
    } else if (type === '30days') {
      start.setDate(baseDate.getDate() - 29);
    } else if (type === 'thisMonth') {
      start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
      end = new Date(baseDate);
    } else if (type === 'lastMonth') {
      start = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
      end = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
      setViewYear(start.getFullYear());
      setViewMonth(start.getMonth());
    }

    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    setStartDate(startStr);
    setEndDate(endStr);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const isSelectedStart = (dateStr: string) => dateStr === startDate;
  const isSelectedEnd = (dateStr: string) => dateStr === endDate;
  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false;
    return dateStr > startDate && dateStr < endDate;
  };

  const handleConfirm = () => {
    onApply({
      startDate: startDate || '2026-08-29',
      endDate: endDate || startDate || '2026-08-29'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none font-bengali">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-xl w-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row gap-5">
          
          {/* Left: Presets */}
          <div className="w-full md:w-36 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 md:pr-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:block mb-1">
              দ্রুত নির্বাচন
            </span>
            <button
              onClick={() => applyPreset('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-08-29' && endDate === '2026-08-29'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              আজ
            </button>
            <button
              onClick={() => applyPreset('yesterday')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-08-28' && endDate === '2026-08-28'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              গতকাল
            </button>
            <button
              onClick={() => applyPreset('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-08-23' && endDate === '2026-08-29'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              গত ৭ দিন
            </button>
            <button
              onClick={() => applyPreset('30days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-07-31' && endDate === '2026-08-29'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              গত ৩০ দিন
            </button>
            <button
              onClick={() => applyPreset('thisMonth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-08-01' && endDate === '2026-08-29'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              চলতি মাস
            </button>
            <button
              onClick={() => applyPreset('lastMonth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-left transition-colors cursor-pointer ${
                startDate === '2026-07-01' && endDate === '2026-07-31'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              গত মাস
            </button>
          </div>

          {/* Right: Date Inputs & Interactive Calendar */}
          <div className="flex-1 flex flex-col">
            
            {/* Range display bar */}
            <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <div 
                onClick={() => setSelectingStep('start')}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectingStep === 'start' ? 'bg-white shadow-xs border border-red-400 ring-1 ring-red-400' : 'hover:bg-white'
                }`}
              >
                <div className="text-[10px] text-gray-500 font-bold uppercase">শুরুর তারিখ (From)</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-gray-900">{startDate || 'সিলেক্ট করুন'}</div>
              </div>

              <div 
                onClick={() => setSelectingStep('end')}
                className={`p-2 rounded-lg text-center cursor-pointer transition-all ${
                  selectingStep === 'end' ? 'bg-white shadow-xs border border-red-400 ring-1 ring-red-400' : 'hover:bg-white'
                }`}
              >
                <div className="text-[10px] text-gray-500 font-bold uppercase">শেষের তারিখ (To)</div>
                <div className="text-xs sm:text-sm font-bold font-mono text-gray-900">{endDate || 'সিলেক্ট করুন'}</div>
              </div>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={prevMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-bold text-xs sm:text-sm text-gray-800 font-sans">
                {monthNamesBangla[viewMonth]} {viewYear}
              </div>
              <button
                onClick={nextMonth}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="text-[11px] font-bold text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading days */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatLocalDate(viewYear, viewMonth, dayNum);
                const isStart = isSelectedStart(dateStr);
                const isEnd = isSelectedEnd(dateStr);
                const inRange = isInRange(dateStr);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr)}
                    className={`h-8 w-full rounded-md text-xs font-mono font-medium flex items-center justify-center transition-colors cursor-pointer ${
                      isStart || isEnd
                        ? 'bg-red-600 text-white font-bold shadow-xs'
                        : inRange
                        ? 'bg-red-50 text-red-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

          </div>

        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500 font-mono">
            সীমা: {startDate} ~ {endDate}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>নিশ্চিত করুন</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
