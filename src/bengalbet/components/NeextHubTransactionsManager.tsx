// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  X,
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Send,
  Smartphone,
  Wallet,
  ShieldAlert,
  FileText,
  ChevronDown,
  User,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../services/api';
import { mayProcessPayment } from '../services/paymentActions';

export interface AdminTransaction {
  id: string;
  userId: string;
  username?: string;
  userPhone?: string;
  type: 'deposit' | 'withdraw' | 'bonus' | 'rebate' | 'bet_payout' | 'adjustment';
  amount: number;
  bonus?: number;
  fee?: number;
  channel: 'bkash' | 'nagad' | 'rocket' | 'usdt' | 'bank' | 'system';
  gateway?: string;
  accountNumber?: string;
  trxId: string;
  status: 'success' | 'pending' | 'rejected' | 'processing' | 'flagged';
  createdAt: string;
  updatedAt?: string;
  processedAt?: string;
  processedBy?: string;
  adminNote?: string;
  rejectionReason?: string;
  description: string;
}

interface NeextHubTransactionsManagerProps {
  transactions: AdminTransaction[];
  users: any[];
  onRefreshData: () => void;
  onRefreshSiteUser?: () => void;
  showToast: (msg: string) => void;
}

export const NeextHubTransactionsManager: React.FC<NeextHubTransactionsManagerProps> = ({
  transactions,
  users,
  onRefreshData,
  onRefreshSiteUser,
  showToast
}) => {
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest');

  // Multi-Selection State for Batch Processing
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchActionType, setBatchActionType] = useState<'success' | 'rejected' | 'processing'>('success');
  const [batchReason, setBatchReason] = useState('ব্যাচ অনুমোদন সম্পন্ন');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Single Transaction Inspection / Processing Modal
  const [selectedTxForReview, setSelectedTxForReview] = useState<AdminTransaction | null>(null);
  const [processBonusAdjust, setProcessBonusAdjust] = useState<string>('');
  const [processFeeAdjust, setProcessFeeAdjust] = useState<string>('');
  const [processAdminNote, setProcessAdminNote] = useState<string>('');
  const [processRejectionReason, setProcessRejectionReason] = useState<string>('');
  const [isCustomRejection, setIsCustomRejection] = useState<boolean>(false);
  const [shouldNotifyUser, setShouldNotifyUser] = useState<boolean>(true);
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  // Manual Transaction Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTxData, setNewTxData] = useState({
    userId: '',
    type: 'deposit',
    amount: '',
    bonus: '0',
    fee: '0',
    channel: 'bkash',
    gateway: 'ম্যানুয়াল এডমিন পেমেন্ট',
    accountNumber: '',
    trxId: '',
    status: 'success',
    description: '',
    adminNote: 'এডমিন কর্তৃক সরাসরি ক্রেডিট',
    adjustBalance: true,
    notifyUser: true
  });

  // Edit Transaction Modal
  const [selectedTxForEdit, setSelectedTxForEdit] = useState<AdminTransaction | null>(null);
  const [editTxData, setEditTxData] = useState<any>({});

  // Delete Confirmation Modal
  const [txToDelete, setTxToDelete] = useState<AdminTransaction | null>(null);

  // Copy Feedback
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrxId(id);
    showToast(`কপি করা হয়েছে: ${text}`);
    setTimeout(() => setCopiedTrxId(null), 2000);
  };

  // ----------------------------------------------------
  // METRICS & STATS CALCULATION
  // ----------------------------------------------------
  const stats = useMemo(() => {
    let pendingDepCount = 0;
    let pendingDepSum = 0;
    let pendingWdrCount = 0;
    let pendingWdrSum = 0;
    let approvedTotalSum = 0;
    let totalDepositSum = 0;
    let totalWithdrawSum = 0;
    let flaggedCount = 0;
    let flaggedSum = 0;

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const t of transactions) {
      if (t.type === 'deposit') {
        if (t.status === 'pending') {
          pendingDepCount++;
          pendingDepSum += t.amount;
        } else if (t.status === 'success') {
          totalDepositSum += t.amount;
          if (t.createdAt?.startsWith(todayStr)) {
            approvedTotalSum += t.amount;
          }
        }
      } else if (t.type === 'withdraw') {
        if (t.status === 'pending') {
          pendingWdrCount++;
          pendingWdrSum += t.amount;
        } else if (t.status === 'success') {
          totalWithdrawSum += t.amount;
        }
      }

      if (t.status === 'flagged') {
        flaggedCount++;
        flaggedSum += t.amount;
      }
    }

    const netCashflow = totalDepositSum - totalWithdrawSum;

    return {
      pendingDepCount,
      pendingDepSum,
      pendingWdrCount,
      pendingWdrSum,
      approvedTotalSum,
      totalDepositSum,
      totalWithdrawSum,
      flaggedCount,
      flaggedSum,
      netCashflow
    };
  }, [transactions]);

  // ----------------------------------------------------
  // FILTERED & SORTED TRANSACTIONS
  // ----------------------------------------------------
  const filteredTransactions = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    let list = transactions.filter((t) => {
      // Type Filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Status Filter
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;

      // Channel Filter
      if (channelFilter !== 'all' && t.channel !== channelFilter) return false;

      // Date Filter
      if (dateFilter === 'today' && !t.createdAt?.startsWith(today)) return false;
      if (dateFilter === 'yesterday' && !t.createdAt?.startsWith(yesterday)) return false;
      if (dateFilter === '7days' && (t.createdAt?.slice(0, 10) || '') < sevenDaysAgo) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTrx = t.trxId?.toLowerCase().includes(q);
        const matchesUser = t.userId?.toLowerCase().includes(q);
        const matchesUsername = t.username?.toLowerCase().includes(q);
        const matchesPhone = t.userPhone?.includes(q);
        const matchesAccount = t.accountNumber?.includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        const matchesNote = t.adminNote?.toLowerCase().includes(q);
        if (!matchesTrx && !matchesUser && !matchesUsername && !matchesPhone && !matchesAccount && !matchesDesc && !matchesNote) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [transactions, typeFilter, statusFilter, channelFilter, dateFilter, searchQuery, sortBy]);

  // ----------------------------------------------------
  // MULTI-SELECT HELPERS
  // ----------------------------------------------------
  const toggleSelectAll = () => {
    if (selectedTxIds.length === filteredTransactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filteredTransactions.filter(mayProcessPayment).map((t) => t.id));
    }
  };

  const toggleSelectTx = (id: string) => {
    if (!mayProcessPayment(transactions.find(tx => tx.id === id))) return;
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ----------------------------------------------------
  // SINGLE TRANSACTION ACTION HANDLERS
  // ----------------------------------------------------
  const handleOpenReviewModal = (tx: AdminTransaction) => {
    setSelectedTxForReview(tx);
    setProcessBonusAdjust(tx.bonus ? String(tx.bonus) : '');
    setProcessFeeAdjust(tx.fee ? String(tx.fee) : '');
    setProcessAdminNote(tx.adminNote || '');
    setProcessRejectionReason(tx.rejectionReason || '');
    setIsCustomRejection(false);
    setShouldNotifyUser(true);
  };

  const handleUpdateStatusDirect = async (
    id: string,
    newStatus: 'success' | 'rejected' | 'processing' | 'flagged' | 'pending',
    customNote?: string,
    customReason?: string
  ) => {
    if (!mayProcessPayment(transactions.find(tx => tx.id === id)) || !['success', 'rejected'].includes(newStatus)) return;
    setIsSubmittingAction(true);
    try {
      const res = await api.admin.updateTransactionStatus(id, newStatus, {
        adminNote: customNote || (newStatus === 'success' ? 'অনুমোদিত' : newStatus === 'flagged' ? 'সন্দেহজনক ফ্ল্যাগ করা হয়েছে' : undefined),
        rejectionReason: customReason,
        notifyUser: true
      });
      if (res.success) {
        showToast(res.message);
        onRefreshData();
        if (onRefreshSiteUser) onRefreshSiteUser();
        if (selectedTxForReview?.id === id) {
          setSelectedTxForReview(null);
        }
      }
    } catch (e: any) {
      alert(e.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleDetailedReviewSubmit = async (status: 'success' | 'rejected' | 'processing' | 'flagged') => {
    if (!mayProcessPayment(selectedTxForReview) || !['success', 'rejected'].includes(status)) return;

    if (status === 'rejected' && !processRejectionReason.trim()) {
      alert('বাতিলের কারণ উল্লেখ করুন');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await api.admin.updateTransactionStatus(selectedTxForReview.id, status, {
        adminNote: processAdminNote.trim() || undefined,
        rejectionReason: status === 'rejected' ? processRejectionReason.trim() : undefined,
        notifyUser: shouldNotifyUser
      });

      if (res.success) {
        showToast(res.message);
        setSelectedTxForReview(null);
        onRefreshData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'অ্যাকশন প্রক্রিয়া সম্পন্ন করা যায়নি');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ----------------------------------------------------
  // BATCH ACTIONS
  // ----------------------------------------------------
  const handleOpenBatchModal = (type: 'success' | 'rejected' | 'processing') => {
    setBatchActionType(type);
    setBatchReason(type === 'success' ? 'ব্যাচ অনুমোদন সম্পন্ন' : type === 'rejected' ? 'ডুপ্লিকেট বা ভুল তথ্য' : 'পর্যালোচনা চলছে');
    setIsBatchModalOpen(true);
  };

  const handleExecuteBatchAction = async () => {
    if (selectedTxIds.length === 0) return;
    setIsBatchProcessing(true);
    try {
      const res = await api.admin.batchProcessTransactions({
        ids: selectedTxIds,
        status: batchActionType,
        rejectionReason: batchActionType === 'rejected' ? batchReason : undefined,
        adminNote: `ব্যাচ ${batchActionType === 'success' ? 'অনুমোদন' : batchActionType === 'rejected' ? 'বাতিল' : 'প্রসেসিং'}`,
        notifyUsers: true
      });

      if (res.success) {
        showToast(res.message);
        setSelectedTxIds([]);
        setIsBatchModalOpen(false);
        onRefreshData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'ব্যাচ অ্যাকশন সম্পন্ন হয়নি');
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // ----------------------------------------------------
  // MANUAL TRANSACTION CREATION
  // ----------------------------------------------------
  const handleCreateManualTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxData.userId.trim()) {
      alert('ব্যবহারকারী নির্বাচন করুন');
      return;
    }
    const amt = parseFloat(newTxData.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await api.admin.createTransaction({
        userId: newTxData.userId.trim(),
        type: newTxData.type,
        amount: amt,
        bonus: parseFloat(newTxData.bonus) || 0,
        fee: parseFloat(newTxData.fee) || 0,
        channel: newTxData.channel,
        gateway: newTxData.gateway.trim(),
        accountNumber: newTxData.accountNumber.trim(),
        trxId: newTxData.trxId.trim() || undefined,
        status: newTxData.status,
        description: newTxData.description.trim() || undefined,
        adminNote: newTxData.adminNote.trim() || undefined,
        adjustBalance: newTxData.adjustBalance,
        notifyUser: newTxData.notifyUser
      });

      if (res.success) {
        showToast(res.message);
        setIsCreateModalOpen(false);
        setNewTxData({
          userId: '',
          type: 'deposit',
          amount: '',
          bonus: '0',
          fee: '0',
          channel: 'bkash',
          gateway: 'ম্যানুয়াল এডমিন পেমেন্ট',
          accountNumber: '',
          trxId: '',
          status: 'success',
          description: '',
          adminNote: 'এডমিন কর্তৃক সরাসরি ক্রেডিট',
          adjustBalance: true,
          notifyUser: true
        });
        onRefreshData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'লেনদেন তৈরি করা যায়নি');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ----------------------------------------------------
  // EDIT TRANSACTION
  // ----------------------------------------------------
  const handleOpenEdit = (tx: AdminTransaction) => {
    setSelectedTxForEdit(tx);
    setEditTxData({
      trxId: tx.trxId,
      amount: tx.amount,
      bonus: tx.bonus || 0,
      fee: tx.fee || 0,
      channel: tx.channel,
      accountNumber: tx.accountNumber || '',
      gateway: tx.gateway || '',
      description: tx.description || '',
      adminNote: tx.adminNote || '',
      rejectionReason: tx.rejectionReason || ''
    });
  };

  const handleSaveEditTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxForEdit) return;

    setIsSubmittingAction(true);
    try {
      const res = await api.admin.editTransaction(selectedTxForEdit.id, { adminNote: editTxData.adminNote || '' });
      if (res.success) {
        showToast(res.message);
        setSelectedTxForEdit(null);
        onRefreshData();
      }
    } catch (e: any) {
      alert(e.message || 'এডিট সংরক্ষণ করা যায়নি');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ----------------------------------------------------
  // DELETE TRANSACTION
  // ----------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!txToDelete) return;
    setIsSubmittingAction(true);
    try {
      const res = await api.admin.deleteTransaction(txToDelete.id);
      if (res.success) {
        showToast('লেনদেন রেকর্ড মুছে ফেলা হয়েছে');
        setTxToDelete(null);
        onRefreshData();
      }
    } catch (e: any) {
      alert(e.message || 'মুছে ফেলা যায়নি');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // ----------------------------------------------------
  // EXPORT TO CSV
  // ----------------------------------------------------
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('এক্সপোর্ট করার জন্য কোনো লেনদেন নেই');
      return;
    }

    const headers = [
      'Transaction ID',
      'Date Time',
      'User ID',
      'Username',
      'Phone',
      'Type',
      'Channel',
      'Gateway',
      'Account Number',
      'TrxID',
      'Amount (BDT)',
      'Bonus',
      'Fee',
      'Status',
      'Description',
      'Admin Note',
      'Rejection Reason'
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.id}"`,
      `"${t.createdAt || ''}"`,
      `"${t.userId}"`,
      `"${t.username || ''}"`,
      `"${t.userPhone || ''}"`,
      `"${t.type}"`,
      `"${t.channel}"`,
      `"${t.gateway || ''}"`,
      `"${t.accountNumber || ''}"`,
      `"${t.trxId}"`,
      t.amount,
      t.bonus || 0,
      t.fee || 0,
      `"${t.status}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.adminNote || '').replace(/"/g, '""')}"`,
      `"${(t.rejectionReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BengalBet_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('CSV ফাইল সফলভাবে ডাউনলোড হয়েছে!');
  };

  // Find user details helper
  const getUserSnapshot = (userId: string) => {
    return users.find((u) => u.id === userId);
  };

  // Channel UI Helper
  const getChannelBadge = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'bkash':
        return { name: 'bKash (বিকাশ)', bg: 'bg-[#D12053]/20 text-[#FF4081] border-[#D12053]/40' };
      case 'nagad':
        return { name: 'Nagad (নগদ)', bg: 'bg-[#F7931E]/20 text-[#FF9E2C] border-[#F7931E]/40' };
      case 'rocket':
        return { name: 'Rocket (রকেট)', bg: 'bg-[#8B2396]/20 text-[#B65CD6] border-[#8B2396]/40' };
      case 'usdt':
        return { name: 'USDT (টিআরসি২০)', bg: 'bg-[#26A17B]/20 text-[#30DEAA] border-[#26A17B]/40' };
      case 'bank':
        return { name: 'Bank (ব্যাংক)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { name: 'System (সিস্টেম)', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/40' };
    }
  };

  return (
    <div className="space-y-4">
      {/* ==================================================== */}
      {/* 1. TRANSACTION METRICS BENTO HEADER                  */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Pending Deposits */}
        <button
          type="button"
          onClick={() => {
            setTypeFilter('deposit');
            setStatusFilter('pending');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            typeFilter === 'deposit' && statusFilter === 'pending'
              ? 'bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-400/30'
              : 'bg-[#09291b] border-emerald-700/40 hover:border-yellow-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-yellow-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              অপেক্ষমান ডিপোজিট
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 text-[10px] font-bold">
              {stats.pendingDepCount} টি
            </span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono text-yellow-400">
            ৳{stats.pendingDepSum.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ক্লিক করে ফিল্টার করুন</div>
        </button>

        {/* Pending Withdrawals */}
        <button
          type="button"
          onClick={() => {
            setTypeFilter('withdraw');
            setStatusFilter('pending');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            typeFilter === 'withdraw' && statusFilter === 'pending'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-[#09291b] border-emerald-700/40 hover:border-amber-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-semibold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              অপেক্ষমান উত্তোলন
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
              {stats.pendingWdrCount} টি
            </span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono text-amber-400">
            ৳{stats.pendingWdrSum.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ক্লিক করে পে-আউট দিন</div>
        </button>

        {/* Today's Volume */}
        <div className="p-3.5 rounded-2xl bg-[#09291b] border border-emerald-700/40">
          <div className="flex items-center justify-between text-xs text-emerald-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-green-400" />
              আজকের অনুমোদিত ভলিউম
            </span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono text-green-400">
            ৳{stats.approvedTotalSum.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">আজকের সফল লেনদেন</div>
        </div>

        {/* Flagged / In Review */}
        <button
          type="button"
          onClick={() => {
            setStatusFilter('flagged');
            setTypeFilter('all');
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'flagged'
              ? 'bg-red-500/20 border-red-400 ring-2 ring-red-400/30'
              : 'bg-[#09291b] border-emerald-700/40 hover:border-red-400/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-red-300">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              ফ্ল্যাগকৃত লেনদেন
            </span>
            <span className="px-1.5 py-0.5 rounded-full bg-red-400/20 text-red-300 text-[10px] font-bold">
              {stats.flaggedCount} টি
            </span>
          </div>
          <div className="mt-1.5 text-lg sm:text-xl font-black font-mono text-red-400">
            ৳{stats.flaggedSum.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">সন্দেহজনক তদন্ত</div>
        </button>

        {/* Net Cashflow */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 p-3.5 rounded-2xl bg-[#09291b] border border-emerald-700/40">
          <div className="flex items-center justify-between text-xs text-cyan-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              নেট ক্যাশফ্লো (Net)
            </span>
          </div>
          <div className={`mt-1.5 text-lg sm:text-xl font-black font-mono ${stats.netCashflow >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            ৳{stats.netCashflow.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ডিপোজিট - উত্তোলন</div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. ACTIONS & BULK CONTROL BAR                        */}
      {/* ==================================================== */}
      <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-yellow-400" />
              অ্যাডভান্সড ট্রানজেকশন প্রসেসিং হাব
            </h3>
            <p className="text-xs text-emerald-300/80">
              ডিপোজিট ও উইথড্র ১-ক্লিক অনুমোদন, স্ট্যাটাস কন্ট্রোল, ম্যানুয়াল অ্যাডজাস্টমেন্ট ও রসিদ যাচাই।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Create Manual Transaction */}
            <button
              type="button"
              disabled
              title="লেনদেনের ইতিহাস সরাসরি তৈরি করা বন্ধ"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-yellow-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              ম্যানুয়াল লেনদেন তৈরি
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CSV রিপোর্ট
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => {
                onRefreshData();
                showToast('লেনদেন ডাটা রিফ্রেশ করা হয়েছে');
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              রিফ্রেশ
            </button>
          </div>
        </div>

        {/* Batch Selection Active Bar */}
        {selectedTxIds.length > 0 && (
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/40 flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-yellow-300">
              <Layers className="w-4 h-4 text-yellow-400" />
              <span>{selectedTxIds.length}টি লেনদেন নির্বাচিত</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenBatchModal('success')}
                className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-green-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                একসাথে অনুমোদন করুন
              </button>

              <button
                type="button"
                onClick={() => handleOpenBatchModal('rejected')}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                একসাথে বাতিল
              </button>

              <button
                type="button"
                onClick={() => setSelectedTxIds([])}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 3. FILTERS & SEARCH ROW                              */}
        {/* ==================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-emerald-800/40">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="TrxID, User ID, ফোন বা বিবরণ খুঁজুন..."
              className="w-full bg-[#051c13] border border-emerald-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:border-yellow-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#051c13] border border-emerald-700/60 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400"
            >
              <option value="all">সব ধরন (All Types)</option>
              <option value="deposit">ডিপোজিট (Deposit)</option>
              <option value="withdraw">উত্তোলন (Withdraw)</option>
              <option value="bonus">বোনাস (Bonus)</option>
              <option value="rebate">ক্যাশব্যাক (Rebate)</option>
              <option value="adjustment">সমন্বয় (Adjustment)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#051c13] border border-emerald-700/60 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400"
            >
              <option value="all">সব স্ট্যাটাস (All)</option>
              <option value="pending">অপেক্ষমান (Pending)</option>
              <option value="processing">পর্যালোচনাধীন (Processing)</option>
              <option value="success">অনুমোদিত (Approved)</option>
              <option value="flagged">ফ্ল্যাগকৃত (Flagged)</option>
              <option value="rejected">বাতিল (Rejected)</option>
            </select>
          </div>

          {/* Channel Filter */}
          <div>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-[#051c13] border border-emerald-700/60 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400"
            >
              <option value="all">সব চ্যানেল (All Gateways)</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
              <option value="rocket">রকেট (Rocket)</option>
              <option value="usdt">USDT (টিআরসি২০)</option>
              <option value="bank">ব্যাংক (Bank Transfer)</option>
              <option value="system">সিস্টেম (System)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#051c13] border border-emerald-700/60 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400"
            >
              <option value="newest">সর্বশেষ তারিখ (Newest)</option>
              <option value="oldest">পুরাতন তারিখ (Oldest)</option>
              <option value="amount_desc">সর্বোচ্চ টাকা (Highest)</option>
              <option value="amount_asc">সর্বনিম্ন টাকা (Lowest)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-gray-400">দ্রুত ফিল্টার:</span>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all');
              setStatusFilter('all');
              setChannelFilter('all');
              setDateFilter('all');
              setSearchQuery('');
            }}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer ${
              typeFilter === 'all' && statusFilter === 'all' && channelFilter === 'all' && dateFilter === 'all'
                ? 'bg-yellow-400 text-black font-bold border-yellow-400'
                : 'bg-white/5 text-gray-300 border-emerald-700/40 hover:bg-white/10'
            }`}
          >
            সব ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('deposit');
              setStatusFilter('pending');
            }}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer ${
              typeFilter === 'deposit' && statusFilter === 'pending'
                ? 'bg-yellow-400 text-black font-bold border-yellow-400'
                : 'bg-white/5 text-yellow-300 border-yellow-500/40 hover:bg-white/10'
            }`}
          >
            🕒 অপেক্ষমান ডিপোজিট ({stats.pendingDepCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter('withdraw');
              setStatusFilter('pending');
            }}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer ${
              typeFilter === 'withdraw' && statusFilter === 'pending'
                ? 'bg-amber-400 text-black font-bold border-amber-400'
                : 'bg-white/5 text-amber-300 border-amber-500/40 hover:bg-white/10'
            }`}
          >
            🕒 অপেক্ষমান উত্তোলন ({stats.pendingWdrCount})
          </button>
          <button
            type="button"
            onClick={() => {
              setDateFilter('today');
              setStatusFilter('all');
            }}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer ${
              dateFilter === 'today'
                ? 'bg-green-500 text-black font-bold border-green-500'
                : 'bg-white/5 text-green-300 border-green-500/40 hover:bg-white/10'
            }`}
          >
            📅 আজকের লেনদেন
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('flagged');
            }}
            className={`px-2.5 py-0.5 rounded-full border cursor-pointer ${
              statusFilter === 'flagged'
                ? 'bg-red-500 text-white font-bold border-red-500'
                : 'bg-white/5 text-red-300 border-red-500/40 hover:bg-white/10'
            }`}
          >
            🚩 সন্দেহজনক ({stats.flaggedCount})
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. TRANSACTIONS LIST / TABLE                         */}
      {/* ==================================================== */}
      <div className="bg-[#09291b] border border-emerald-700/40 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Header Controls */}
        <div className="p-3 bg-[#061e14] border-b border-emerald-800/60 flex items-center justify-between text-xs text-gray-300">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filteredTransactions.length > 0 && selectedTxIds.length === filteredTransactions.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-yellow-500 bg-[#051c13] border-emerald-700 focus:ring-yellow-400 cursor-pointer"
            />
            <span className="font-semibold text-white">
              মোট প্রদর্শিত লেনদেন: {filteredTransactions.length} টি
            </span>
          </div>
          <span className="text-[11px] text-emerald-300/80">
            রসিদ ক্লিক করে বিস্তারিত দেখুন ও একশনে অনুমোদন/বাতিল করুন
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/5 text-gray-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-gray-300">কোনো লেনদেন পাওয়া যায়নি</p>
            <p className="text-xs text-gray-500">আপনার ফিল্টার বা সার্চ কিওয়ার্ড পরিবর্তন করে চেষ্টা করুন</p>
          </div>
        ) : (
          <div className="divide-y divide-emerald-800/40">
            {filteredTransactions.map((tx) => {
              const channelBadge = getChannelBadge(tx.channel);
              const isSelected = selectedTxIds.includes(tx.id);
              const userSnapshot = getUserSnapshot(tx.userId);

              return (
                <div
                  key={tx.id}
                  className={`p-4 transition-colors flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 ${
                    isSelected ? 'bg-yellow-500/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Left Column: Selection Checkbox, Icon, Basic Details */}
                  <div className="flex items-start gap-3 w-full lg:w-auto">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectTx(tx.id)}
                        className="w-4 h-4 rounded text-yellow-500 bg-[#051c13] border-emerald-700 focus:ring-yellow-400 cursor-pointer"
                      />
                    </div>

                    {/* Transaction Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'deposit'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : tx.type === 'withdraw'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : tx.type === 'bonus'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : tx.type === 'withdraw' ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                    </div>

                    {/* Core Info */}
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Type Label */}
                        <span className="font-bold text-white text-sm">
                          {tx.type === 'deposit'
                            ? 'ডিপোজিট (Deposit)'
                            : tx.type === 'withdraw'
                            ? 'উত্তোলন (Withdraw)'
                            : tx.type === 'bonus'
                            ? 'বোনাস (Bonus)'
                            : 'সমন্বয় (Adjustment)'}
                        </span>

                        {/* Channel Badge */}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${channelBadge.bg}`}>
                          {channelBadge.name}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            tx.status === 'success'
                              ? 'bg-green-500/20 text-green-400 border-green-500/40'
                              : tx.status === 'pending'
                              ? 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40 animate-pulse'
                              : tx.status === 'processing'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : tx.status === 'flagged'
                              ? 'bg-red-500/20 text-red-400 border-red-500/50'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/40'
                          }`}
                        >
                          {tx.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                          {tx.status === 'success' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {tx.status === 'processing' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                          {tx.status === 'flagged' && <AlertTriangle className="w-2.5 h-2.5" />}
                          {tx.status === 'rejected' && <XCircle className="w-2.5 h-2.5" />}
                          {tx.status === 'success'
                            ? 'অনুমোদিত'
                            : tx.status === 'pending'
                            ? 'অপেক্ষমান'
                            : tx.status === 'processing'
                            ? 'যাচাই চলছে'
                            : tx.status === 'flagged'
                            ? 'ফ্ল্যাগকৃত'
                            : 'বাতিলকৃত'}
                        </span>
                      </div>

                      {/* TrxID, User, Account Row */}
                      <div className="text-xs text-gray-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {/* Copyable TrxID */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">TrxID:</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(tx.trxId, tx.id)}
                            className="font-mono text-yellow-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            title="কপি করতে ক্লিক করুন"
                          >
                            <span>{tx.trxId}</span>
                            {copiedTrxId === tx.id ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400 hover:text-white" />
                            )}
                          </button>
                        </div>

                        {/* User Pill */}
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400">প্লেয়ার:</span>
                          <span className="text-white font-semibold">
                            {tx.username || userSnapshot?.username || tx.userId}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">({tx.userId})</span>
                        </div>

                        {/* Account Number */}
                        {tx.accountNumber && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400">নম্বর:</span>
                            <span className="text-emerald-300 font-mono font-bold">{tx.accountNumber}</span>
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className="text-gray-500 text-[11px]">{tx.createdAt}</span>
                      </div>

                      {/* Admin Note or Rejection Reason Banner if available */}
                      {(tx.rejectionReason || tx.adminNote || tx.description) && (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                          {tx.rejectionReason && (
                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/30">
                              কারণ: {tx.rejectionReason}
                            </span>
                          )}
                          {tx.adminNote && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                              নোট: {tx.adminNote}
                            </span>
                          )}
                          {tx.description && !tx.adminNote && (
                            <span className="text-gray-400">{tx.description}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Amount, Breakdown & Action Buttons */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-emerald-800/30">
                    {/* Amount & Bonus */}
                    <div className="text-left lg:text-right">
                      <div
                        className={`text-base font-black font-mono ${
                          tx.type === 'deposit'
                            ? 'text-green-400'
                            : tx.type === 'withdraw'
                            ? 'text-amber-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {tx.type === 'deposit' ? '+' : tx.type === 'withdraw' ? '-' : ''}৳
                        {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                        {tx.bonus ? <span className="text-yellow-300">+৳{tx.bonus} বোনাস</span> : null}
                        {tx.fee ? <span className="text-rose-400">-৳{tx.fee} ফি</span> : null}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Detailed Review / Inspector Modal Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(tx)}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                        title="রসিদ ও সম্পূর্ণ রিভিউ"
                      >
                        <Eye className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="hidden sm:inline">রিভিউ</span>
                      </button>

                      {/* Quick Actions for Pending / Processing */}
                      {mayProcessPayment(tx) && (
                        <>
                          <button
                            type="button"
                            disabled={isSubmittingAction}
                            onClick={() => handleUpdateStatusDirect(tx.id, 'success')}
                            className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-green-500/20 transition-all"
                            title="১-ক্লিকে অনুমোদন"
                          >
                            <Check className="w-3.5 h-3.5" />
                            অনুমোদন
                          </button>

                          <button
                            type="button"
                            disabled={isSubmittingAction}
                            onClick={() => {
                              const reason = prompt('বাতিল করার কারণ লিখুন:', 'ভুল TrxID বা লেনদেন পাওয়া যায়নি');
                              if (reason !== null) {
                                handleUpdateStatusDirect(tx.id, 'rejected', undefined, reason.trim() || 'এডমিন কর্তৃক বাতিল');
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold cursor-pointer transition-colors"
                            title="বাতিল করুন"
                          >
                            <X className="w-3.5 h-3.5" />
                            বাতিল
                          </button>
                        </>
                      )}

                      {/* Quick Edit */}
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white cursor-pointer transition-colors"
                        title="লেনদেন এডিট"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Delete */}
                      <button
                        type="button"
                        disabled
                        aria-label="লেনদেনের ইতিহাস মুছে ফেলা বন্ধ"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* MODAL 1: FULL TRANSACTION INSPECTION & ACTION SLIP   */}
      {/* ==================================================== */}
      {selectedTxForReview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center border border-yellow-400/30">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">লেনদেন স্লিপ ও প্রসেসিং কন্ট্রোল</h3>
                  <p className="text-xs text-emerald-300/80">আইডি: #{selectedTxForReview.id}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxForReview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Card */}
            <div className="p-4 rounded-2xl bg-[#051c13] border border-emerald-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {selectedTxForReview.type === 'deposit'
                      ? 'ডিপোজিট রিকোয়েস্ট'
                      : selectedTxForReview.type === 'withdraw'
                      ? 'উত্তোলন রিকোয়েস্ট'
                      : 'ব্যালেন্স সমন্বয়'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${getChannelBadge(selectedTxForReview.channel).bg}`}>
                    {getChannelBadge(selectedTxForReview.channel).name}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-yellow-400">
                  ৳{selectedTxForReview.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">TrxID / ভাউচার:</span>
                  <span className="font-mono text-yellow-300 font-bold select-all">{selectedTxForReview.trxId}</span>
                </div>

                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">প্রেরক/প্রাপক নম্বর:</span>
                  <span className="font-mono text-white font-bold">{selectedTxForReview.accountNumber || 'N/A'}</span>
                </div>

                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">গেটওয়ে নাম:</span>
                  <span className="text-gray-200">{selectedTxForReview.gateway || 'GBKPAY / Direct'}</span>
                </div>

                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">বোনাস যোগ:</span>
                  <span className="font-mono text-green-400 font-bold">+৳{selectedTxForReview.bonus || 0}</span>
                </div>

                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">প্রসেসিং ফি:</span>
                  <span className="font-mono text-rose-400 font-bold">-৳{selectedTxForReview.fee || 0}</span>
                </div>

                <div className="p-2 rounded-xl bg-[#09291b] border border-emerald-800">
                  <span className="text-gray-400 block text-[10px]">তারিখ ও সময়:</span>
                  <span className="text-gray-300 text-[11px]">{selectedTxForReview.createdAt}</span>
                </div>
              </div>

              {/* Player snapshot */}
              {(() => {
                const user = getUserSnapshot(selectedTxForReview.userId);
                return (
                  <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-700/50 text-emerald-300 flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {user?.username || selectedTxForReview.username || 'Player'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          ফোন: {user?.phone || selectedTxForReview.userPhone || 'N/A'} • VIP {user?.vipLevel || 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">বর্তমান ব্যালেন্স</div>
                      <div className="font-mono font-bold text-green-400">
                        ৳{(user?.balance || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Action Configurations Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-200">প্রসেসিং প্যারামিটার ও নোটিশ:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">
                    বোনাস সমন্বয় (ডিপোজিট অনুমোদন হলে):
                  </label>
                  <input
                    type="number"
                    disabled
                    value={processBonusAdjust}
                    onChange={(e) => setProcessBonusAdjust(e.target.value)}
                    placeholder="যেমন: 77"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">
                    এডমিন অভ্যন্তরীণ নোট (Admin Note):
                  </label>
                  <input
                    type="text"
                    value={processAdminNote}
                    onChange={(e) => setProcessAdminNote(e.target.value)}
                    placeholder="যেমন: নগদ এজেন্ট ভেরিফাইড"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Rejection Preset Chips & Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] text-gray-300">
                  বাতিলের কারণ (যদি বাতিল করতে চান):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'ভুল TrxID বা লেনদেন পাওয়া যায়নি',
                    'টাকার পরিমাণ মেলেনি',
                    'অ্যাকাউন্ট নম্বর সঠিক নয়',
                    'ডুপ্লিকেট রিকোয়েস্ট',
                    'গেটওয়ে সার্ভার সাময়িক ডাউন',
                    'সন্দেহজনক টার্নওভার অসমাপ্ত'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setProcessRejectionReason(preset);
                        setIsCustomRejection(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors ${
                        processRejectionReason === preset
                          ? 'bg-red-500 text-white font-bold border-red-500'
                          : 'bg-[#051c13] text-gray-300 border-emerald-800 hover:border-red-500/50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={processRejectionReason}
                  onChange={(e) => setProcessRejectionReason(e.target.value)}
                  placeholder="অথবা কাস্টম কারণ লিখুন..."
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white mt-1"
                />
              </div>

              {/* Notification Toggle */}
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={shouldNotifyUser}
                  onChange={(e) => setShouldNotifyUser(e.target.checked)}
                  className="w-4 h-4 rounded text-yellow-500 bg-[#051c13] border-emerald-700 focus:ring-yellow-400 cursor-pointer"
                />
                <span>ব্যবহারকারীর ইনবক্সে স্বয়ংক্রিয় নোটিফিকেশন মেসেজ পাঠান</span>
              </label>
            </div>

            {/* Action Buttons Grid */}
            <div className="pt-2 border-t border-emerald-700/40 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Approve */}
              <button
                type="button"
                disabled={isSubmittingAction || !mayProcessPayment(selectedTxForReview)}
                onClick={() => handleDetailedReviewSubmit('success')}
                className="py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-green-500/20"
              >
                {isSubmittingAction ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />}
                অনুমোদন ও ক্রেডিট
              </button>

              {/* Mark Processing */}
              <button
                type="button"
                disabled
                onClick={() => handleDetailedReviewSubmit('processing')}
                className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                যাচাইাধীন রাখুন
              </button>

              {/* Flag Suspicious */}
              <button
                type="button"
                disabled
                onClick={() => handleDetailedReviewSubmit('flagged')}
                className="py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                সন্দেহভাজন ফ্ল্যাগ
              </button>

              {/* Reject */}
              <button
                type="button"
                disabled={isSubmittingAction || !mayProcessPayment(selectedTxForReview)}
                onClick={() => handleDetailedReviewSubmit('rejected')}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
                লেনদেন বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CREATE MANUAL TRANSACTION MODAL            */}
      {/* ==================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center border border-yellow-400/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ম্যানুয়াল লেনদেন তৈরি করুন</h3>
                  <p className="text-xs text-emerald-300/80">সরাসরি ডাটাবেসে ডিপোজিট, উইথড্র বা ব্যালেন্স ইস্যু করুন</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTx} className="space-y-3">
              {/* User Selector */}
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">ব্যবহারকারী নির্বাচন করুন *:</label>
                <select
                  required
                  value={newTxData.userId}
                  onChange={(e) => {
                    const selected = users.find((u) => u.id === e.target.value);
                    setNewTxData({
                      ...newTxData,
                      userId: e.target.value,
                      accountNumber: selected?.phone || newTxData.accountNumber
                    });
                  }}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">-- প্লেয়ার সিলেক্ট করুন --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.phone}) - ব্যালেন্স: ৳{u.balance}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Type */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">লেনদেনের ধরন *:</label>
                  <select
                    value={newTxData.type}
                    onChange={(e) => setNewTxData({ ...newTxData, type: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="deposit">ডিপোজিট (Deposit)</option>
                    <option value="withdraw">উত্তোলন (Withdraw)</option>
                    <option value="bonus">বোনাস (Bonus)</option>
                    <option value="rebate">ক্যাশব্যাক (Rebate)</option>
                    <option value="adjustment">ম্যানুয়াল সমন্বয় (Adjustment)</option>
                  </select>
                </div>

                {/* Channel */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">পেমেন্ট চ্যানেল *:</label>
                  <select
                    value={newTxData.channel}
                    onChange={(e) => setNewTxData({ ...newTxData, channel: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                    <option value="rocket">রকেট (Rocket)</option>
                    <option value="usdt">USDT (টিআরসি২০)</option>
                    <option value="bank">ব্যাংক ট্রান্সফার (Bank)</option>
                    <option value="system">সিস্টেম সরাসরি (System)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Amount */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">টাকার পরিমাণ (BDT) *:</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={newTxData.amount}
                    onChange={(e) => setNewTxData({ ...newTxData, amount: e.target.value })}
                    placeholder="যেমন: 5000"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Bonus */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">অতিরিক্ত বোনাস:</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newTxData.bonus}
                    onChange={(e) => setNewTxData({ ...newTxData, bonus: e.target.value })}
                    placeholder="0"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                {/* Fee */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">ফি কর্তন (যদি থাকে):</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newTxData.fee}
                    onChange={(e) => setNewTxData({ ...newTxData, fee: e.target.value })}
                    placeholder="0"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* TrxID */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs text-gray-300 font-semibold">TrxID:</label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewTxData({
                          ...newTxData,
                          trxId: `${newTxData.channel.toUpperCase()}${Date.now().toString().slice(-7)}`
                        })
                      }
                      className="text-[10px] text-yellow-400 hover:underline cursor-pointer"
                    >
                      অটো জেনারেট
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newTxData.trxId}
                    onChange={(e) => setNewTxData({ ...newTxData, trxId: e.target.value })}
                    placeholder="যেমন: BKASH8923182"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">অ্যাকাউন্ট নম্বর / ফোন:</label>
                  <input
                    type="text"
                    value={newTxData.accountNumber}
                    onChange={(e) => setNewTxData({ ...newTxData, accountNumber: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">প্রাথমিক স্ট্যাটাস:</label>
                <select
                  value={newTxData.status}
                  onChange={(e) => setNewTxData({ ...newTxData, status: e.target.value })}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="success">সফল ও অনুমোদিত (Success / Approved)</option>
                  <option value="pending">অপেক্ষমান (Pending Review)</option>
                  <option value="processing">প্রসেসিং চলছে (Processing)</option>
                </select>
              </div>

              {/* Description & Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">বিবরণ (Description):</label>
                  <input
                    type="text"
                    value={newTxData.description}
                    onChange={(e) => setNewTxData({ ...newTxData, description: e.target.value })}
                    placeholder="যেমন: বিশেষ অফার ডিপোজিট"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">এডমিন নোট:</label>
                  <input
                    type="text"
                    value={newTxData.adminNote}
                    onChange={(e) => setNewTxData({ ...newTxData, adminNote: e.target.value })}
                    placeholder="যেমন: VIP প্লেয়ার বোনাস প্রদান"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-emerald-800/40">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTxData.adjustBalance}
                    onChange={(e) => setNewTxData({ ...newTxData, adjustBalance: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-500 bg-[#051c13] border-emerald-700 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span className="font-semibold text-white">
                    স্বয়ংক্রিয়ভাবে ব্যবহারকারীর ওয়ালেট ব্যালেন্স সমন্বয় করুন (Auto Balance Sync)
                  </span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTxData.notifyUser}
                    onChange={(e) => setNewTxData({ ...newTxData, notifyUser: e.target.checked })}
                    className="w-4 h-4 rounded text-yellow-500 bg-[#051c13] border-emerald-700 focus:ring-yellow-400 cursor-pointer"
                  />
                  <span>প্লেয়ারের ইনবক্সে নোটিফিকেশন পাঠান</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-emerald-700/40">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  লেনদেন সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: EDIT TRANSACTION MODAL                     */}
      {/* ==================================================== */}
      {selectedTxForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white">লেনদেন তথ্য এডিট করুন</h3>
                <p className="text-xs text-emerald-300/80">আইডি: #{selectedTxForEdit.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTxForEdit(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTx} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">TrxID:</label>
                <input
                  type="text"
                  required
                  readOnly
                  value={editTxData.trxId || ''}
                  onChange={(e) => setEditTxData({ ...editTxData, trxId: e.target.value })}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">টাকার পরিমাণ (BDT):</label>
                  <input
                    type="number"
                    step="any"
                    required
                    readOnly
                    value={editTxData.amount || ''}
                    onChange={(e) => setEditTxData({ ...editTxData, amount: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">বোনাস:</label>
                  <input
                    type="number"
                    step="any"
                    readOnly
                    value={editTxData.bonus || 0}
                    onChange={(e) => setEditTxData({ ...editTxData, bonus: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">অ্যাকাউন্ট নম্বর / ফোন:</label>
                <input
                  type="text"
                  readOnly
                  value={editTxData.accountNumber || ''}
                  onChange={(e) => setEditTxData({ ...editTxData, accountNumber: e.target.value })}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1">এডমিন নোট:</label>
                <input
                  type="text"
                  value={editTxData.adminNote || ''}
                  onChange={(e) => setEditTxData({ ...editTxData, adminNote: e.target.value })}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-emerald-700/40">
                <button
                  type="button"
                  onClick={() => setSelectedTxForEdit(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: BATCH ACTION CONFIRMATION MODAL             */}
      {/* ==================================================== */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#09291b] border border-yellow-400/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/30">
              <Layers className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">ব্যাচ অ্যাকশন নিশ্চিত করুন</h3>
              <p className="text-xs text-gray-300 mt-1">
                আপনি এক সাথে <b className="text-yellow-400">{selectedTxIds.length}টি</b> লেনদেন{' '}
                <b className={batchActionType === 'success' ? 'text-green-400' : 'text-red-400'}>
                  '{batchActionType === 'success' ? 'অনুমোদন' : batchActionType === 'rejected' ? 'বাতিল' : 'প্রসেসিং'}'
                </b>{' '}
                করতে যাচ্ছেন।
              </p>
            </div>

            {batchActionType === 'rejected' && (
              <div className="text-left space-y-1">
                <label className="text-[11px] text-gray-300 font-semibold">বাতিলের কারণ:</label>
                <input
                  type="text"
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isBatchProcessing}
                onClick={handleExecuteBatchAction}
                className={`flex-1 py-2.5 rounded-xl text-black font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                  batchActionType === 'success'
                    ? 'bg-green-500 hover:bg-green-400 shadow-lg shadow-green-500/20'
                    : 'bg-red-500 hover:bg-red-400 text-white'
                }`}
              >
                {isBatchProcessing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: DELETE TRANSACTION MODAL                    */}
      {/* ==================================================== */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#09291b] border border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">ট্রানজেকশন মুছে ফেলবেন?</h3>
              <p className="text-xs text-gray-300 mt-1">
                লেনদেন <b className="text-yellow-400">#{txToDelete.trxId}</b> (৳{txToDelete.amount}) সম্পূর্ণ ডাটাবেস থেকে মুছে ফেলা হবে।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isSubmittingAction}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
