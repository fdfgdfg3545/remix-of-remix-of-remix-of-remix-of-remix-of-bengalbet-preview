// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gamepad2,
  Settings,
  Bell,
  MessageSquare,
  Mail,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  RefreshCw,
  Sliders,
  Lock,
  Unlock,
  LogOut,
  ExternalLink,
  Edit3,
  Save,
  Plus,
  Minus,
  Smartphone,
  Wallet,
  Sparkles,
  Menu,
  X,
  Clock,
  Award,
  Filter,
  Check,
  Zap,
  Activity,
  Trash2,
  UserPlus,
  Send,
  Eye,
  Copy,
  ChevronDown,
  Download,
  UserCheck,
  UserX,
  Key,
  Flame,
  Headphones,
  Share2,
  Crown,
  Gift,
  Server,
  Database,
  Terminal,
  FileCode
} from 'lucide-react';
import { Language } from '../types';
import { api, REST_API_CONFIG } from '../services/api';
import { NeextHubTransactionsManager } from './NeextHubTransactionsManager';
import { NeextHubGameEngineManager } from './NeextHubGameEngineManager';
import { NeextHubAdminMessagesManager } from './NeextHubAdminMessagesManager';
import { NeextHubAdminSupportTicketsManager } from './NeextHubAdminSupportTicketsManager';
import { NeextHubAdminLiveChatManager } from './NeextHubAdminLiveChatManager';
import { NeextHubAdminReferralsManager } from './NeextHubAdminReferralsManager';
import { NeextHubAdminVipManager } from './NeextHubAdminVipManager';
import { NeextHubAdminRewardsManager } from './NeextHubAdminRewardsManager';
import { NeextHubMasterManager } from './NeextHubMasterManager';
import { AdminSiteContent } from './AdminSiteContent';
import { AdminDepositOffer } from './AdminDepositOffer';
import { saveVerifiedSettings } from '../services/settingsPersistence';

interface NeextHubAdminViewProps {
  language: Language;
  onExitAdmin: () => void;
  onRefreshSiteUser?: () => void;
}

type AdminTab = 'overview' | 'users' | 'vip' | 'rewards_manager' | 'transactions' | 'games' | 'gateways' | 'promotions' | 'messages' | 'support' | 'livechat' | 'referrals' | 'master_api';

export const NeextHubAdminView: React.FC<NeextHubAdminViewProps> = ({
  language,
  onExitAdmin,
  onRefreshSiteUser
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('neexthub_admin_session') === 'true' && !!sessionStorage.getItem('bengalbet_admin_key');
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab & Responsive Sidebar State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Data States
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUserBalance: 0,
    totalDepositAmount: 0,
    totalWithdrawAmount: 0,
    netGGR: 0,
    pendingDepositsCount: 0,
    pendingWithdrawalsCount: 0,
    totalTransactionsCount: 0,
    totalFeedbacksCount: 0,
    pendingFeedbacksCount: 0,
    maintenanceMode: false,
    serverTime: new Date().toISOString()
  });

  const [liveChatBadge, setLiveChatBadge] = useState<number>(0);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'frozen' | 'banned'>('all');
  const [userVipFilter, setUserVipFilter] = useState<'all' | '0' | '1_2' | '3_5' | '6_plus'>('all');
  const [userSortBy, setUserSortBy] = useState<'balance_desc' | 'balance_asc' | 'vip_desc' | 'newest' | 'username'>('balance_desc');
  
  // User Modals & Actions State
  const [selectedUserForBalance, setSelectedUserForBalance] = useState<any | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceActionType, setBalanceActionType] = useState<'add' | 'deduct' | 'set'>('add');
  const [balanceNote, setBalanceNote] = useState('Admin Adjustment');

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    balance: '1000',
    vipLevel: 1,
    realName: ''
  });

  // Edit User Modal State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Direct Message Modal State
  const [selectedUserForMessage, setSelectedUserForMessage] = useState<any | null>(null);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageSender, setMessageSender] = useState('Neext Hub Admin Support');

  // User Details & Analytics Modal State
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete User State
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isSubmittingUserAction, setIsSubmittingUserAction] = useState(false);

  // Transactions State
  const [transactions, setTransactions] = useState<any[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
    bkashNumber: '01878901234',
    nagadNumber: '01789012345',
    rocketNumber: '01912345678',
    usdtAddress: 'TXYZ8899CasinoTRC20OfficialWallet',
    minDeposit: 100,
    maxDeposit: 50000,
    minWithdraw: 500,
    maxWithdraw: 100000,
    siteNotice: {
      enabled: true,
      titleBn: 'BengalBet মেগা ক্যাসিনো ও বোনাস ঘোষণা',
      titleEn: 'BengalBet Mega Casino & Bonus Announcement',
      contentBn: 'প্রতিটি ডিপোজিটে ৪৭% পর্যন্ত স্বাগতম বোনাস এবং গোল্ডেন এগে সর্বোচ্চ ৳৩,৮৮৮ পর্যন্ত ক্যাশ রিওয়ার্ড!',
      contentEn: 'Up to 47% welcome bonus on every deposit and win up to ৳3,888 cash reward in Golden Egg!',
      bannerImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80'
    },
    gameRtp: {
      'aviator': 97.2,
      'super-ace': 96.8,
      'fortune-tree': 96.5,
      'alibaba-cave': 97.0,
      'crazy-777': 98.0,
      'sweet-bonanza': 96.5,
      'gates-of-olympus': 96.5
    } as Record<string, number>,
    maintenanceMode: false
  });

  // Feedbacks
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load All Admin Data directly from REST API
  const loadData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [statsRes, usersRes, txRes, settingsRes, feedbackRes] = await Promise.all([
        api.admin.getStats().catch(() => ({ success: false, stats: null })),
        api.admin.getUsers().catch(() => ({ success: false, users: [] })),
        api.admin.getTransactions().catch(() => ({ success: false, transactions: [] })),
        api.admin.getSettings().catch(() => ({ success: false, settings: null })),
        api.admin.getFeedbacks().catch(() => ({ success: false, feedbacks: [] }))
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
        if (statsRes.stats.liveChatStats) {
          setLiveChatBadge(statsRes.stats.liveChatStats.waitingSessions || statsRes.stats.liveChatStats.unreadAdminCount || 0);
        }
      }

      setUsers(usersRes.success && usersRes.users ? usersRes.users : []);

      if (txRes.success && txRes.transactions) {
        setTransactions(txRes.transactions);
      }
      setSettingsReady(settingsRes.success && !!settingsRes.settings?.siteNotice);
      if (settingsRes.success && settingsRes.settings) {
        setSettings(prev => ({ ...prev, ...settingsRes.settings }));
      }
      if (feedbackRes.success && feedbackRes.feedbacks) {
        setFeedbacks(feedbackRes.feedbacks);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle PIN Login
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = pinInput.trim();
    if (!key) return;
    try {
      const res = await fetch(`${REST_API_CONFIG.baseUrl}/admin.php?section=stats`, { headers: { 'X-Master-Key': key } });
      if (!res.ok) throw new Error('bad');
      REST_API_CONFIG.masterKey = key;
      sessionStorage.setItem('neexthub_admin_session', 'true');
      setIsAuthenticated(true);
      setPinError('');
    } catch {
      setPinError('ভুল অ্যাডমিন কী! আবার চেষ্টা করুন।');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    REST_API_CONFIG.masterKey = '';
    sessionStorage.removeItem('neexthub_admin_session');
  };

  // Comprehensive Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // 1. Text Search (Username, Phone, Email, ID, Real Name)
    if (userSearch.trim()) {
      const s = userSearch.toLowerCase();
      result = result.filter(u =>
        (u.username && u.username.toLowerCase().includes(s)) ||
        (u.phone && u.phone.includes(s)) ||
        (u.id && u.id.toLowerCase().includes(s)) ||
        (u.email && u.email.toLowerCase().includes(s)) ||
        (u.realName && u.realName.toLowerCase().includes(s))
      );
    }

    // 2. Status Filter
    if (userStatusFilter !== 'all') {
      result = result.filter(u => {
        const st = u.status || 'active';
        return st === userStatusFilter;
      });
    }

    // 3. VIP Tier Filter
    if (userVipFilter !== 'all') {
      result = result.filter(u => {
        const lvl = u.vipLevel || 0;
        if (userVipFilter === '0') return lvl === 0;
        if (userVipFilter === '1_2') return lvl >= 1 && lvl <= 2;
        if (userVipFilter === '3_5') return lvl >= 3 && lvl <= 5;
        if (userVipFilter === '6_plus') return lvl >= 6;
        return true;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (userSortBy === 'balance_desc') return (b.balance || 0) - (a.balance || 0);
      if (userSortBy === 'balance_asc') return (a.balance || 0) - (b.balance || 0);
      if (userSortBy === 'vip_desc') return (b.vipLevel || 0) - (a.vipLevel || 0);
      if (userSortBy === 'username') return (a.username || '').localeCompare(b.username || '');
      if (userSortBy === 'newest') {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return result;
  }, [users, userSearch, userStatusFilter, userVipFilter, userSortBy]);

  // Aggregate User Statistics
  const userStatsSummary = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => (u.status || 'active') === 'active').length;
    const frozen = users.filter(u => u.status === 'frozen').length;
    const banned = users.filter(u => u.status === 'banned').length;
    const totalBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const highVipCount = users.filter(u => (u.vipLevel || 0) >= 3).length;

    return { total, active, frozen, banned, totalBalance, highVipCount };
  }, [users]);

  const adminTabs = [
            { id: 'overview', label: 'ওভারভিউ', icon: LayoutDashboard },
            { id: 'users', label: 'প্লেয়ার ও ব্যালেন্স', icon: Users, badge: users.length },
            { id: 'vip', label: 'ভিআইপি ক্লাব', icon: Crown },
            { id: 'rewards_manager', label: 'পুরস্কার ও প্রচার', icon: Gift },
            { id: 'transactions', label: 'ট্রানজেকশন প্রসেসিং', icon: CreditCard, badge: stats.pendingDepositsCount + stats.pendingWithdrawalsCount },
            { id: 'games', label: 'গেম ইঞ্জিন ও RTP', icon: Gamepad2 },
            { id: 'gateways', label: 'বিকাশ/নগদ গেটওয়ে', icon: Wallet },
            { id: 'promotions', label: 'সাইটের নোটিশ', icon: Bell },
            { id: 'messages', label: 'অভ্যন্তরীণ বার্তা', icon: Mail },
            { id: 'support', label: 'সাপোর্ট টিকিট', icon: MessageSquare, badge: stats.pendingFeedbacksCount },
            { id: 'livechat', label: 'লাইভ চ্যাট কনসোল', icon: Headphones, badge: liveChatBadge },
            { id: 'referrals', label: 'রেফারেল ও এজেন্ট', icon: Share2 },
            { id: 'master_api', label: 'ডাটাবেস ও ফাইল কন্ট্রোলার', icon: Server }
          ];

  // ====================================================
  // USER ACTION HANDLERS
  // ====================================================

  // Execute User Balance Adjustment
  const handleConfirmBalance = async () => {
    if (!selectedUserForBalance || !balanceAmount) return;
    const amt = parseFloat(balanceAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }

    setIsSubmittingUserAction(true);
    try {
      const res = await api.admin.updateUserBalance(
        selectedUserForBalance.id,
        amt,
        balanceActionType,
        balanceNote
      );

      if (res.success) {
        showToast(res.message);
        setSelectedUserForBalance(null);
        setBalanceAmount('');
        loadData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'ব্যালেন্স আপডেট করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  // Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.username.trim() || !newUserData.phone.trim()) {
      alert('ইউজারনেম এবং ফোন নম্বর অবশ্যই পূরণ করুন');
      return;
    }

    setIsSubmittingUserAction(true);
    try {
      const res = await api.admin.createUser({
        username: newUserData.username.trim(),
        phone: newUserData.phone.trim(),
        email: newUserData.email.trim() || undefined,
        password: newUserData.password.trim() || '123456',
        balance: parseFloat(newUserData.balance) || 0,
        vipLevel: Number(newUserData.vipLevel) || 1,
        realName: newUserData.realName.trim() || undefined
      });

      if (res.success) {
        showToast('নতুন প্লেয়ার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
        setIsCreateUserModalOpen(false);
        setNewUserData({
          username: '',
          phone: '',
          email: '',
          password: '',
          balance: '1000',
          vipLevel: 1,
          realName: ''
        });
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'নতুন ইউজার তৈরি করতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  // Open Full User Edit Modal
  const handleOpenEditUser = (user: any) => {
    setSelectedUserForEdit(user);
    setEditFormData({
      username: user.username || '',
      realName: user.realName || '',
      phone: user.phone || '',
      email: user.email || '',
      status: user.status || 'active',
      passwordHash: user.passwordHash || '',
      balance: user.balance !== undefined ? user.balance : 0,
      vipLevel: user.vipLevel !== undefined ? user.vipLevel : 1,
      vipExp: user.vipExp || 0,
      freeSpins: user.freeSpins || 0,
      goldenEggsAvailable: user.goldenEggsAvailable || 0,
      redPacketsAvailable: user.redPacketsAvailable || 0
    });
  };

  // Save Full User Edits
  const handleSaveUserEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    setIsSubmittingUserAction(true);
    try {
      const res = await api.admin.updateUserFull(selectedUserForEdit.id, editFormData);

      if (res.success) {
        showToast('ইউজার প্রোফাইল ও কন্ট্রোল সফলভাবে আপডেট হয়েছে!');
        setSelectedUserForEdit(null);
        loadData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'আপডেট ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  // Quick Change Status
  const handleQuickChangeStatus = async (userId: string, newStatus: 'active' | 'frozen' | 'banned') => {
    try {
      const res = await api.admin.updateUserStatus(userId, newStatus);
      if (res.success) {
        showToast(`একাউন্ট স্ট্যাটাস '${newStatus === 'active' ? 'সক্রিয়' : newStatus === 'frozen' ? 'স্থগিত' : 'নিষিদ্ধ'}' করা হয়েছে`);
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Quick Change VIP
  const handleChangeVip = async (userId: string, newVip: number) => {
    try {
      const res = await api.admin.updateUserVip(userId, newVip, newVip * 5000);
      if (res.success) {
        showToast(res.message);
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Quick Add 5 Free Spins
  const handleQuickAddSpins = async (userId: string, currentSpins: number) => {
    try {
      const newSpins = (currentSpins || 0) + 5;
      const res = await api.admin.updateUserFull(userId, { freeSpins: newSpins });
      if (res.success) {
        showToast('+৫টি ফ্রি স্পিন যোগ করা হয়েছে!');
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Reset User Cooldowns (Eggs & Spins)
  const handleResetCooldowns = async (userId: string) => {
    try {
      const res = await api.admin.resetUserCooldowns(userId);
      if (res.success) {
        localStorage.removeItem('bengalbet_golden_egg_renew_until');
        showToast('গোল্ডেন এগ ও ফ্রি স্পিন সফলভাবে আনলক ও রিফ্রেশ হয়েছে!');
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Open Direct Message Modal
  const handleOpenMessageModal = (user: any) => {
    setSelectedUserForMessage(user);
    setMessageTitle('অভিনন্দন! আপনার জন্য একটি বিশেষ নোটিশ / বোনাস');
    setMessageContent(`প্রিয় ${user.username || 'প্লেয়ার'},\nআমাদের সাইটে সক্রিয় থাকার জন্য ধন্যবাদ! আপনার একাউন্টে বিশেষ সুবিধা যুক্ত করা হয়েছে। কোনো প্রয়োজনে আমাদের লাইভ সাপোর্টে যোগাযোগ করুন।`);
    setMessageSender('Neext Hub Admin Support');
  };

  // Send Direct Message to User's Notification Center
  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForMessage || !messageTitle.trim() || !messageContent.trim()) {
      alert('শিরোনাম ও বিবরণ অবশ্যই পূরণ করুন');
      return;
    }

    setIsSubmittingUserAction(true);
    try {
      const res = await api.admin.sendUserMessage(
        selectedUserForMessage.id,
        messageTitle.trim(),
        messageContent.trim(),
        messageSender.trim()
      );
      if (res.success) {
        showToast('ইনবক্সে বার্তা ও নোটিফিকেশন সফলভাবে পাঠানো হয়েছে!');
        setSelectedUserForMessage(null);
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'বার্তা পাঠানো সম্ভব হয়নি');
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  // Open Detailed User Info Modal
  const handleOpenUserDetails = async (user: any) => {
    setSelectedUserForDetails({ user, loading: true });
    setIsLoadingDetails(true);
    try {
      const res = await api.admin.getUserDetails(user.id);
      if (res.success && res.details) {
        setSelectedUserForDetails(res.details);
      } else {
        setSelectedUserForDetails({ user, stats: null, wallets: [], recentTransactions: [], recentBets: [] });
      }
    } catch (e) {
      setSelectedUserForDetails({ user, stats: null, wallets: [], recentTransactions: [], recentBets: [] });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Confirm Delete User
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsSubmittingUserAction(true);
    try {
      const res = await api.admin.deleteUser(userToDelete.id);

      if (res.success) {
        showToast('ইউজার সফলভাবে মুছে ফেলা হয়েছে');
        setUserToDelete(null);
        loadData();
        if (onRefreshSiteUser) onRefreshSiteUser();
      }
    } catch (e: any) {
      alert(e.message || 'ইউজার মুছতে ব্যর্থ হয়েছে');
    } finally {
      setIsSubmittingUserAction(false);
    }
  };

  // Export Users to JSON
  const handleExportUsers = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bengalbet_users_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('ইউজার তালিকা সফলভাবে এক্সপোর্ট করা হয়েছে!');
  };

  // Save Settings
  const handleSaveSettings = async () => {
    if (!settingsReady || isLoading) return;
    setIsLoading(true);
    setSettingsSaved(false);
    setSettingsSaveError(null);
    try {
      const verified = await saveVerifiedSettings(settings, api.admin);
      setSettings(prev => ({ ...prev, ...verified }));
      setSettingsSaved(true);
      showToast('সার্ভারের সেটিংস সংরক্ষণ নিশ্চিত হয়েছে!');
    } catch (e: any) {
      setSettingsSaveError(e.message || 'সংরক্ষণ যাচাই করা যায়নি।');
    } finally {
      setIsLoading(false);
    }
  };

  // Reply Feedback
  const handleSendFeedbackReply = async (id: string) => {
    const text = replyInput[id];
    if (!text || !text.trim()) return;
    try {
      const res = await api.admin.replyFeedback(id, text);
      if (res.success) {
        showToast('ফিডব্যাক উত্তর সফলভাবে পাঠানো হয়েছে');
        setReplyInput(prev => ({ ...prev, [id]: '' }));
        loadData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#04170f] text-white flex flex-col items-center justify-center p-4 selection:bg-yellow-400 selection:text-black">
        {/* Background ambient lighting */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md bg-[#09291b] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-300 text-black shadow-lg shadow-yellow-500/20 mb-2">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white uppercase">
              NEEXT HUB ADMIN
            </h1>
            <p className="text-xs text-emerald-300/80 font-medium">
              BengalBet Master Management & Live Site Controller
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">
                Admin Master Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Admin Master Key"
                  className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-4 py-3.5 text-center text-lg tracking-widest text-white placeholder:text-gray-500 focus:outline-hidden focus:border-yellow-400 font-mono transition-colors"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
              {pinError && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm tracking-wide shadow-lg shadow-yellow-500/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              আনলক করুন (UNLOCK ADMIN)
            </button>

          </form>

          <div className="mt-6 pt-5 border-t border-emerald-800/50 flex items-center justify-between text-xs text-gray-400">
            <button
              type="button"
              onClick={onExitAdmin}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              ← ক্যাসিনো লবিতে ফিরে যান
            </button>
            <span className="font-mono text-[11px] text-emerald-400/70">v13.4 Neext Hub</span>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#04160e] text-white flex flex-col font-sans selection:bg-yellow-400 selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-black font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce text-xs sm:text-sm">
          <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR */}
      <header className="sticky top-0 z-40 bg-[#072418]/95 backdrop-blur-md border-b border-emerald-600/30 px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Status */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 flex items-center justify-center text-black font-black shadow-md shadow-yellow-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-wider text-white">
                  NEEXT HUB ADMIN
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE SYSTEM
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 font-mono hidden md:block">
                BengalBet Full-Spectrum Gaming Operations Control
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={loadData}
              disabled={isLoading}
              title="Refresh All Data"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#0e3c29] hover:bg-[#145239] border border-emerald-500/30 text-emerald-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-yellow-400' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ক্যাসিনো লবি</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Lock Admin"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/70 backdrop-blur-xs flex">
          <div className="w-72 bg-[#072418] h-full p-4 border-r border-emerald-600/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-emerald-700/40 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-400 text-black flex items-center justify-center font-bold">
                    NH
                  </div>
                  <span className="font-bold text-sm">Control Navigation</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {adminTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as AdminTab);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-yellow-400 text-black shadow-md'
                          : 'text-gray-300 hover:bg-emerald-800/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && tab.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-black text-yellow-300' : 'bg-red-500 text-white'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-700/40 text-[11px] text-gray-400">
              Neext Hub Admin Studio v13.4
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* DESKTOP TAB NAVIGATION BAR */}
      <nav className="bg-[#061e14] border-b border-emerald-800/40 px-3 sm:px-6 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2">
          {adminTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                    : 'text-emerald-200/80 hover:bg-emerald-800/30 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-black text-yellow-300' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MOBILE HORIZONTAL CHIP TABS */}
      <div className="lg:hidden bg-[#061e14] border-b border-emerald-800/40 px-3 py-2 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {adminTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-yellow-400 text-black'
                  : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW & ANALYTICS                          */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Banner Alert */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900/60 via-emerald-800/40 to-[#072418] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    BengalBet Master Control Dashboard
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    ফুল কন্ট্রোল প্যানেল: প্লেয়ার ব্যালেন্স, bKash/Nagad অনুমোদন, এবং স্লট RTP সমন্বয় করুন।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className="px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  লেনদেন দেখুন ({stats.pendingDepositsCount + stats.pendingWithdrawalsCount} পেন্ডিং)
                </button>
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Total Users */}
              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">মোট ইউজার</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  রেজিস্ট্রেশন একটিভ
                </p>
              </div>

              {/* Card 2: Total User Balance */}
              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">ইউজার ওয়ালেট ব্যালেন্স</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">
                  ৳{stats.totalUserBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  সাইটে সঞ্চিত ব্যালেন্স
                </p>
              </div>

              {/* Card 3: Total Deposits */}
              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">মোট ডিপোজিট</span>
                  <div className="w-7 h-7 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-green-400 font-mono">
                  ৳{stats.totalDepositAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-yellow-300 mt-1">
                  {stats.pendingDepositsCount} টি অপেক্ষমান ডিপোজিট
                </p>
              </div>

              {/* Card 4: Total Withdrawals */}
              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-300">মোট উত্তোলন</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  ৳{stats.totalWithdrawAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-[11px] text-yellow-300 mt-1">
                  {stats.pendingWithdrawalsCount} টি অপেক্ষমান উত্তোলন
                </p>
              </div>
            </div>

            {/* Quick Action Bento Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Financial Summary */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  ক্যাসিনো নিট রেভিনিউ (GGR)
                </h4>
                <div className="text-2xl font-black text-white font-mono">
                  ৳{stats.netGGR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-300 space-y-1 pt-2 border-t border-emerald-800/50">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ডিপোজিট - উত্তোলন ব্যবধান:</span>
                    <span className={stats.netGGR >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {stats.netGGR >= 0 ? '+৳' : '-৳'}{Math.abs(stats.netGGR)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">মোট ট্রানজেকশন সংখ্যা:</span>
                    <span className="font-bold text-white">{stats.totalTransactionsCount}</span>
                  </div>
                </div>
              </div>

              {/* Maintenance & Emergency Controls */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-yellow-400" />
                  সিস্টেম স্ট্যাটাস ও মোড
                </h4>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#051e14] border border-emerald-800">
                  <div>
                    <div className="text-xs font-bold text-white">মেইনটেন্যান্স মোড</div>
                    <div className="text-[10px] text-gray-400">সাইটে সাময়িক রক্ষণাবেক্ষণ বার্তা</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newMode = !settings.maintenanceMode;
                      setSettings(prev => ({ ...prev, maintenanceMode: newMode }));
                      api.admin.updateSettings({ maintenanceMode: newMode }).then(() => {
                        showToast(`মেইনটেন্যান্স মোড ${newMode ? 'অন' : 'অফ'} করা হয়েছে`);
                        loadData();
                      });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      settings.maintenanceMode ? 'bg-red-500 text-white' : 'bg-emerald-700 text-emerald-100'
                    }`}
                  >
                    {settings.maintenanceMode ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)'}
                  </button>
                </div>
                <div className="text-[11px] text-emerald-300/80">
                  সার্ভার সময়: <span className="font-mono text-white">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Instant Shortcuts */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  দ্রুত একশন (Quick Tools)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('users')}
                    className="p-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-600/40 text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-yellow-400 mb-1" />
                    ব্যালেন্স যোগ/বিয়োগ
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('gateways')}
                    className="p-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-600/40 text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-yellow-400 mb-1" />
                    বিকাশ নম্বর বদলান
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('games')}
                    className="p-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-600/40 text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4 text-yellow-400 mb-1" />
                    RTP উইন রেট
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('promotions')}
                    className="p-2.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-800/80 border border-emerald-600/40 text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-yellow-400 mb-1" />
                    ঘোষণা ও ব্যানার
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: USER & PLAYER MANAGEMENT (ALL CONTROLS)      */}
        {/* ==================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* 1. Quick Stats Bento Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>মোট রেজিস্টার্ড প্লেয়ার</span>
                  <Users className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {userStatsSummary.total} জন
                </div>
                <div className="flex items-center gap-2 text-[10px] mt-1.5">
                  <span className="text-green-400 font-semibold">🟢 {userStatsSummary.active} সক্রিয়</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-amber-400 font-semibold">🟡 {userStatsSummary.frozen} স্থগিত</span>
                  {userStatsSummary.banned > 0 && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-red-400 font-semibold">🔴 {userStatsSummary.banned} নিষিদ্ধ</span>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>প্লেয়ার ওয়ালেট মোট ব্যালেন্স</span>
                  <Wallet className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-yellow-400 font-mono mt-1">
                  ৳{userStatsSummary.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="text-[10px] text-emerald-300/80 mt-1.5">
                  গড়ে ৳{userStatsSummary.total > 0 ? (userStatsSummary.totalBalance / userStatsSummary.total).toFixed(0) : 0} /প্লেয়ার
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>হাই রোলার (VIP 3+)</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {userStatsSummary.highVipCount} জন
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1.5">
                  বিশেষ সুবিধা ও ক্যাশব্যাক প্রাপক
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>প্লেয়ার অ্যাক্টিভিটি রেট</span>
                  <Activity className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-cyan-300 font-mono mt-1">
                  {userStatsSummary.total > 0 ? Math.round((userStatsSummary.active / userStatsSummary.total) * 100) : 100}%
                </div>
                <div className="text-[10px] text-gray-400 mt-1.5">
                  সরাসরি ডাটাবেস ও ফায়ারবেস সিঙ্কড
                </div>
              </div>
            </div>

            {/* 2. Top Control Panel & Filter Bar */}
            <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-yellow-400" />
                    প্লেয়ার অ্যাকাউন্ট ও ফুল কন্ট্রোল ম্যানেজমেন্ট
                    <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-mono text-xs border border-yellow-400/30">
                      {filteredUsers.length} জন ফিল্টার্ড
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-300/80 mt-0.5">
                    ইউজার তৈরি করুন, ব্যালেন্স সমন্বয় করুন, ভিআইপি/স্পিন বাড়ান, স্ট্যাটাস পরিবর্তন করুন বা সরাসরি ইনবক্স নোটিশ পাঠান।
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsCreateUserModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow-md shadow-yellow-500/20 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    + নতুন প্লেয়ার যোগ
                  </button>

                  <button
                    type="button"
                    onClick={handleExportUsers}
                    className="px-3 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-600/60 text-emerald-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">এক্সপোর্ট</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={isLoading}
                    className="px-3 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-600/60 text-emerald-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 text-yellow-400 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">রিফ্রেশ</span>
                  </button>
                </div>
              </div>

              {/* Filtering & Search Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 pt-2 border-t border-emerald-800/50">
                {/* Search Bar */}
                <div className="lg:col-span-5 relative">
                  <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="ইউজারনেম, ফোন, ইমেইল বা আইডি দিয়ে সার্চ..."
                    className="w-full bg-[#051c13] border border-emerald-600/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-gray-400 focus:outline-hidden focus:border-yellow-400"
                  />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="lg:col-span-2">
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value as any)}
                    className="w-full bg-[#051c13] border border-emerald-600/50 rounded-xl px-2.5 py-2 text-xs text-emerald-100 focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="all">সব স্ট্যাটাস ({users.length})</option>
                    <option value="active">🟢 সক্রিয় ({userStatsSummary.active})</option>
                    <option value="frozen">🟡 স্থগিত (Frozen) ({userStatsSummary.frozen})</option>
                    <option value="banned">🔴 নিষিদ্ধ (Banned) ({userStatsSummary.banned})</option>
                  </select>
                </div>

                {/* VIP Filter */}
                <div className="lg:col-span-2">
                  <select
                    value={userVipFilter}
                    onChange={(e) => setUserVipFilter(e.target.value as any)}
                    className="w-full bg-[#051c13] border border-emerald-600/50 rounded-xl px-2.5 py-2 text-xs text-emerald-100 focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="all">সব VIP স্তর</option>
                    <option value="0">VIP 0 (নবাগত)</option>
                    <option value="1_2">VIP 1-2 (রেগুলার)</option>
                    <option value="3_5">VIP 3-5 (গোল্ড)</option>
                    <option value="6_plus">VIP 6+ (প্লাটিনাম/ডায়মন্ড)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="lg:col-span-3">
                  <select
                    value={userSortBy}
                    onChange={(e) => setUserSortBy(e.target.value as any)}
                    className="w-full bg-[#051c13] border border-emerald-600/50 rounded-xl px-2.5 py-2 text-xs text-yellow-300 font-semibold focus:outline-hidden focus:border-yellow-400"
                  >
                    <option value="balance_desc">সাজান: ব্যালেন্স (সর্বোচ্চ)</option>
                    <option value="balance_asc">সাজান: ব্যালেন্স (সর্বনিম্ন)</option>
                    <option value="vip_desc">সাজান: VIP লেভেল (উচ্চ থেকে নিম্ন)</option>
                    <option value="newest">সাজান: নতুন রেজিস্ট্রেশন</option>
                    <option value="username">সাজান: ইউজারনেম (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Users Table (Desktop & Tablet) & Cards (Mobile) */}
            <div className="bg-[#09291b] border border-emerald-700/40 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop & Tablet Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#061e14] text-emerald-300 font-bold uppercase tracking-wider border-b border-emerald-800">
                    <tr>
                      <th className="p-3.5">প্লেয়ার প্রোফাইল</th>
                      <th className="p-3.5">যোগাযোগ ও উৎস</th>
                      <th className="p-3.5">ওয়ালেট ব্যালেন্স</th>
                      <th className="p-3.5">VIP লেভেল</th>
                      <th className="p-3.5">স্ট্যাটাস</th>
                      <th className="p-3.5">রিসোর্স (স্পিন/এগ)</th>
                      <th className="p-3.5 text-right">কন্ট্রোল একশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800/40">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-gray-400">
                          <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-50" />
                          কোনো ইউজার পাওয়া যায়নি। অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন ইউজার তৈরি করুন।
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const statusColor =
                          u.status === 'banned'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : u.status === 'frozen'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-green-500/20 text-green-400 border-green-500/40';

                        return (
                          <tr key={u.id} className="hover:bg-white/5 transition-colors">
                            {/* Profile */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                                  alt="avatar"
                                  className="w-9 h-9 rounded-full border border-yellow-400/40 object-cover shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{u.username}</span>
                                    {u.isFirestore && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                        Google Auth
                                      </span>
                                    )}
                                  </div>
                                  {u.realName && (
                                    <div className="text-[11px] text-emerald-200/90 font-medium">{u.realName}</div>
                                  )}
                                  <div className="text-[10px] text-gray-400 font-mono">ID: {u.id}</div>
                                </div>
                              </div>
                            </td>

                            {/* Contact & Auth Source */}
                            <td className="p-3.5 font-mono text-emerald-200">
                              <div className="flex items-center gap-1">
                                <span>{u.phone || '—'}</span>
                                {u.phone && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard?.writeText(u.phone);
                                      showToast('ফোন নম্বর কপি করা হয়েছে!');
                                    }}
                                    title="কপি করুন"
                                    className="p-0.5 text-gray-400 hover:text-white cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              {u.email && (
                                <div className="text-[10px] text-gray-400 truncate max-w-[140px] font-sans">
                                  {u.email}
                                </div>
                              )}
                              <div className="text-[9px] text-gray-500 mt-0.5 font-sans">
                                {u.createdAt ? u.createdAt.slice(0, 10) : 'অজানা তারিখ'}
                              </div>
                            </td>

                            {/* Balance */}
                            <td className="p-3.5">
                              <div className="font-black text-yellow-400 font-mono text-sm">
                                ৳{(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                ডিপোজিট/উইন সক্ষম
                              </span>
                            </td>

                            {/* VIP Level */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-[10px] border border-yellow-400/40 whitespace-nowrap">
                                  VIP {u.vipLevel || 0}
                                </span>
                                <select
                                  value={u.vipLevel || 0}
                                  onChange={(e) => handleChangeVip(u.id, Number(e.target.value))}
                                  className="bg-[#051c13] border border-emerald-700 text-white text-[10px] rounded px-1.5 py-0.5 cursor-pointer"
                                >
                                  {[0,1,2,3,4,5,6,7,8,9,10].map(lvl => (
                                    <option key={lvl} value={lvl}>Set VIP {lvl}</option>
                                  ))}
                                </select>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="p-3.5">
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] border ${statusColor}`}>
                                  {u.status === 'banned' ? 'নিষিদ্ধ (Banned)' : u.status === 'frozen' ? 'স্থগিত (Frozen)' : 'সক্রিয় (Active)'}
                                </span>
                                <div>
                                  <select
                                    value={u.status || 'active'}
                                    onChange={(e) => handleQuickChangeStatus(u.id, e.target.value as any)}
                                    className="bg-[#051c13] border border-emerald-700 text-[10px] text-gray-300 rounded px-1 py-0.5 cursor-pointer"
                                  >
                                    <option value="active">Active</option>
                                    <option value="frozen">Freeze</option>
                                    <option value="banned">Ban</option>
                                  </select>
                                </div>
                              </div>
                            </td>

                            {/* Reward Resources */}
                            <td className="p-3.5">
                              <div className="text-[11px] text-gray-300 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span>স্পিন: <b className="text-yellow-400">{u.freeSpins || 0}</b></span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAddSpins(u.id, u.freeSpins || 0)}
                                    title="+৫টি ফ্রি স্পিন দিন"
                                    className="px-1 py-0.2 rounded bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 font-bold text-[9px] border border-yellow-500/30 cursor-pointer"
                                  >
                                    +৫
                                  </button>
                                </div>
                                <div>এগ: <b className="text-amber-400">{u.goldenEggsAvailable || 0}</b></div>
                              </div>
                            </td>

                            {/* Action Buttons */}
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1 flex-wrap">
                                {/* Balance Adjust */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedUserForBalance(u);
                                    setBalanceActionType('add');
                                    setBalanceAmount('1000');
                                    setBalanceNote('এডমিন ডিপোজিট সমন্বয়');
                                  }}
                                  title="ব্যালেন্স যোগ / কাটাও"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-colors"
                                >
                                  টাকা
                                </button>

                                {/* Edit Full Profile */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  title="সম্পূর্ণ প্রোফাইল ও সেটিংস এডিট"
                                  className="p-1 rounded-lg bg-emerald-800/60 hover:bg-emerald-700 border border-emerald-600/60 text-emerald-200 hover:text-white cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                {/* Send Message */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenMessageModal(u)}
                                  title="ইউজারের ইনবক্সে বার্তা / নোটিশ পাঠান"
                                  className="p-1 rounded-lg bg-blue-900/40 hover:bg-blue-800 border border-blue-600/40 text-blue-300 hover:text-white cursor-pointer"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                </button>

                                {/* User Details & History */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserDetails(u)}
                                  title="বিস্তারিত পরিসংখ্যান ও লেনদেন হিস্ট্রি"
                                  className="p-1 rounded-lg bg-purple-900/40 hover:bg-purple-800 border border-purple-600/40 text-purple-300 hover:text-white cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Unlock Eggs */}
                                <button
                                  type="button"
                                  onClick={() => handleResetCooldowns(u.id)}
                                  title="গোল্ডেন এগ ও ফ্রি স্পিন কুলডাউন রিসেট"
                                  className="p-1 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/40 text-yellow-300 cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete User */}
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(u)}
                                  title="ইউজার অ্যাকাউন্ট মুছুন"
                                  className="p-1 rounded-lg bg-red-900/30 hover:bg-red-800 border border-red-600/40 text-red-300 hover:text-white cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile All-Screen Friendly Card View */}
              <div className="md:hidden divide-y divide-emerald-800/40">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs">
                    <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-50" />
                    কোনো ইউজার পাওয়া যায়নি
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const statusColor =
                      u.status === 'banned'
                        ? 'bg-red-500/20 text-red-400 border-red-500/40'
                        : u.status === 'frozen'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-green-500/20 text-green-400 border-green-500/40';

                    return (
                      <div key={u.id} className="p-4 space-y-3">
                        {/* Header: Avatar, Name, Status & VIP */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                              alt="avatar"
                              className="w-10 h-10 rounded-full border border-yellow-400/40 object-cover shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                                <span>{u.username}</span>
                                {u.isFirestore && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    Google
                                  </span>
                                )}
                              </div>
                              {u.realName && (
                                <div className="text-xs text-emerald-200">{u.realName}</div>
                              )}
                              <div className="text-[10px] text-gray-400 font-mono">
                                📞 {u.phone || u.email || u.id}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-[10px] border border-yellow-400/40">
                              VIP {u.vipLevel || 0}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${statusColor}`}>
                              {u.status === 'banned' ? 'নিষিদ্ধ' : u.status === 'frozen' ? 'স্থগিত' : 'সক্রিয়'}
                            </span>
                          </div>
                        </div>

                        {/* Balance & Resources Grid */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#061e14] border border-emerald-800/60 text-xs">
                          <div>
                            <span className="text-gray-400 block text-[10px]">বর্তমান ব্যালেন্স:</span>
                            <span className="font-black text-yellow-400 font-mono text-base">
                              ৳{(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-right text-[11px] text-gray-300 flex flex-col justify-center">
                            <div>ফ্রি স্পিন: <b className="text-yellow-400">{u.freeSpins || 0}</b></div>
                            <div>গোল্ডেন এগ: <b className="text-amber-400">{u.goldenEggsAvailable || 0}</b></div>
                          </div>
                        </div>

                        {/* Primary Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserForBalance(u);
                              setBalanceActionType('add');
                              setBalanceAmount('1000');
                              setBalanceNote('এডমিন ডিপোজিট');
                            }}
                            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            টাকা সমন্বয়
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(u)}
                            className="py-2.5 rounded-xl bg-[#051c13] hover:bg-emerald-800/40 text-emerald-200 border border-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            প্রোফাইল এডিট
                          </button>
                        </div>

                        {/* Secondary Actions Bar */}
                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenMessageModal(u)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-blue-900/30 border border-blue-700/40 text-blue-300 font-medium text-[11px] flex items-center justify-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            বার্তা
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenUserDetails(u)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-purple-900/30 border border-purple-700/40 text-purple-300 font-medium text-[11px] flex items-center justify-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            হিস্ট্রি
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetCooldowns(u.id)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-medium text-[11px] flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            এগ আনলক
                          </button>

                          <button
                            type="button"
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg bg-red-900/30 border border-red-700/40 text-red-300 flex items-center justify-center"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: TRANSACTIONS PROCESSING                      */}
        {/* ==================================================== */}
        {activeTab === 'transactions' && (
          <NeextHubTransactionsManager
            transactions={transactions}
            users={users}
            onRefreshData={loadData}
            onRefreshSiteUser={onRefreshSiteUser}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 4: ADVANCED GAME ENGINE & RTP 0-100% CONTROL     */}
        {/* ==================================================== */}
        {activeTab === 'games' && (
          <NeextHubGameEngineManager
            onRefreshSiteUser={onRefreshSiteUser}
            showToast={showToast}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 5: GATEWAYS & PAYMENT NUMBERS                   */}
        {/* ==================================================== */}
        {activeTab === 'gateways' && (
          <div className="space-y-4">
            <AdminDepositOffer />
            <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-yellow-400" />
                বিকাশ, নগদ, রকেট এজেন্ট নম্বর ও পেমেন্ট গেটওয়ে
              </h3>
              <p className="text-xs text-emerald-300/80">
                এখানে নম্বর পরিবর্তন করলে সাইটের ডিপোজিট পেইজে স্বয়ংক্রিয়ভাবে নতুন নম্বর প্রদর্শিত হবে।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* bKash Gateway */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-600 text-white font-black text-xs flex items-center justify-center">
                    bK
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">bKash (বিকাশ) এজেন্ট নম্বর</h4>
                    <span className="text-[10px] text-pink-300">ক্যাশআউট / সেন্ড মানি চ্যানেল</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">অফিসিয়াল বিকাশ নম্বর:</label>
                  <input
                    type="text"
                    value={settings.bkashNumber}
                    onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Nagad Gateway */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black text-xs flex items-center justify-center">
                    NG
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Nagad (নগদ) এজেন্ট নম্বর</h4>
                    <span className="text-[10px] text-orange-300">নগদ ক্যাশআউট চ্যানেল</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">অফিসিয়াল নগদ নম্বর:</label>
                  <input
                    type="text"
                    value={settings.nagadNumber}
                    onChange={(e) => setSettings({ ...settings, nagadNumber: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* Rocket Gateway */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                    RK
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Rocket (রকেট) নম্বর</h4>
                    <span className="text-[10px] text-purple-300">ডাচ-বাংলা রকেট</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">অফিসিয়াল রকেট নম্বর:</label>
                  <input
                    type="text"
                    value={settings.rocketNumber}
                    onChange={(e) => setSettings({ ...settings, rocketNumber: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-yellow-400"
                  />
                </div>
              </div>

              {/* USDT TRC20 Gateway */}
              <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-black text-xs flex items-center justify-center">
                    ₮
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">USDT (TRC-20) ওয়ালেট ঠিকানা</h4>
                    <span className="text-[10px] text-teal-300">ক্রিপ্টো ডিপোজিট চ্যানেল</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">TRC-20 অ্যাড্রেস:</label>
                  <input
                    type="text"
                    value={settings.usdtAddress}
                    onChange={(e) => setSettings({ ...settings, usdtAddress: e.target.value })}
                    className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-yellow-400"
                  />
                </div>
              </div>
            </div>

            {/* Limits Config */}
            <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
              <h4 className="font-bold text-white text-sm">ডিপোজিট ও উত্তোলন সীমা (Limits)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">সর্বনিম্ন ডিপোজিট:</label>
                  <input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">সর্বোচ্চ ডিপোজিট:</label>
                  <input
                    type="number"
                    value={settings.maxDeposit}
                    onChange={(e) => setSettings({ ...settings, maxDeposit: Number(e.target.value) })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">সর্বনিম্ন উত্তোলন:</label>
                  <input
                    type="number"
                    value={settings.minWithdraw}
                    onChange={(e) => setSettings({ ...settings, minWithdraw: Number(e.target.value) })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">সর্বোচ্চ উত্তোলন:</label>
                  <input
                    type="number"
                    value={settings.maxWithdraw}
                    onChange={(e) => setSettings({ ...settings, maxWithdraw: Number(e.target.value) })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-lg shadow-yellow-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                গেটওয়ে সেটিংস সেভ করুন
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: PROMOTIONS & NOTICE MODAL                    */}
        {/* ==================================================== */}
        {activeTab === 'promotions' && (
          <AdminSiteContent
            notice={settings.siteNotice}
            onChange={siteNotice => { setSettings(prev => ({ ...prev, siteNotice })); setSettingsSaved(false); setSettingsSaveError(null); }}
            onSave={handleSaveSettings}
            busy={isLoading}
            ready={settingsReady}
            error={settingsSaveError}
            saved={settingsSaved}
          />
        )}

        {/* ==================================================== */}
        {/* TAB: INTERNAL MESSAGES & NOTICES (অভ্যন্তরীণ বার্তা) */}
        {/* ==================================================== */}
        {activeTab === 'messages' && (
          <NeextHubAdminMessagesManager
            users={users}
            showToast={showToast}
            onRefreshSiteUser={onRefreshSiteUser}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 7: SUPPORT TICKETS & FEEDBACK                   */}
        {/* ==================================================== */}
        {activeTab === 'support' && (
          <NeextHubAdminSupportTicketsManager
            tickets={feedbacks}
            onRefresh={loadData}
            showToast={showToast}
            onOpenUserDetail={(userId) => {
              const u = users.find((x) => x.id === userId);
              if (u) setSelectedUserForDetails(u);
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 8: LIVE CHAT OPERATIONAL CONSOLE                */}
        {/* ==================================================== */}
        {activeTab === 'livechat' && (
          <NeextHubAdminLiveChatManager
            onRefresh={loadData}
            showToast={showToast}
            onOpenUserDetail={(userId) => {
              const u = users.find((x) => x.id === userId);
              if (u) setSelectedUserForDetails(u);
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB: VIP CLUB MANAGEMENT (ভিআইপি ক্লাব নিয়ন্ত্রণ)     */}
        {/* ==================================================== */}
        {activeTab === 'vip' && (
          <NeextHubAdminVipManager
            language={language}
            users={users}
            onRefreshUsers={loadData}
            onRefreshSiteUser={onRefreshSiteUser}
          />
        )}

        {/* ==================================================== */}
        {/* TAB: REWARDS, SIGN-IN, RESCUE, PROMOS, TICKETS CRUD */}
        {/* ==================================================== */}
        {activeTab === 'rewards_manager' && (
          <NeextHubAdminRewardsManager
            language={language}
            users={users}
            onRefreshUsers={loadData}
            onRefreshSiteUser={onRefreshSiteUser}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 9: REFERRALS & AGENT MANAGEMENT                 */}
        {/* ==================================================== */}
        {activeTab === 'referrals' && (
          <NeextHubAdminReferralsManager
            onRefresh={loadData}
            showToast={showToast}
            onOpenUserDetail={(userId) => {
              const u = users.find((x) => x.id === userId);
              if (u) setSelectedUserForDetails(u);
            }}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 10: MASTER API, DATABASE & FILE MANAGER         */}
        {/* ==================================================== */}
        {activeTab === 'master_api' && (
          <NeextHubMasterManager
            language={language}
            showToast={showToast}
          />
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL 1: BALANCE ADJUSTMENT MODAL                   */}
      {/* ==================================================== */}
      {selectedUserForBalance && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  ব্যালেন্স সমন্বয় (Balance Controller)
                </h3>
                <p className="text-xs text-emerald-300/80">
                  প্লেয়ার: <b className="text-yellow-400">{selectedUserForBalance.username}</b> (ID: {selectedUserForBalance.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800 flex justify-between text-xs">
              <span className="text-gray-400">বর্তমান ওয়ালেট ব্যালেন্স:</span>
              <span className="font-black text-yellow-400 font-mono text-base">
                ৳{(selectedUserForBalance.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Action Type */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBalanceActionType('add')}
                className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  balanceActionType === 'add'
                    ? 'bg-green-500 text-black shadow-md shadow-green-500/20'
                    : 'bg-[#051c13] text-gray-300 border border-emerald-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                টাকা যোগ (+৳)
              </button>
              <button
                type="button"
                onClick={() => setBalanceActionType('deduct')}
                className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  balanceActionType === 'deduct'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-[#051c13] text-gray-300 border border-emerald-700'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                টাকা কাটাও (-৳)
              </button>
              <button
                type="button"
                onClick={() => setBalanceActionType('set')}
                className={`py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  balanceActionType === 'set'
                    ? 'bg-yellow-400 text-black shadow-md shadow-yellow-500/20'
                    : 'bg-[#051c13] text-gray-300 border border-emerald-700'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                নতুন ফিক্সড
              </button>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">দ্রুত টাকার পরিমাণ নির্বাচন করুন:</label>
              <div className="flex gap-1.5 flex-wrap">
                {[100, 500, 1000, 2000, 5000, 10000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setBalanceAmount(chip.toString())}
                    className="px-2.5 py-1 rounded-lg bg-[#051c13] hover:bg-emerald-800/60 border border-emerald-700 text-xs font-mono text-emerald-200 cursor-pointer"
                  >
                    +৳{chip.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs text-gray-300 mb-1.5 font-semibold">টাকার পরিমাণ (BDT):</label>
              <input
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="যেমন: 500"
                className="w-full bg-[#051c13] border border-emerald-600/60 rounded-xl px-4 py-3 text-lg text-white font-mono focus:border-yellow-400"
              />
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs text-gray-300 mb-1 font-semibold">এডমিন নোট / কারণ:</label>
              <input
                type="text"
                value={balanceNote}
                onChange={(e) => setBalanceNote(e.target.value)}
                placeholder="যেমন: বিশেষ বোনাস / ম্যানুয়াল অনুমোদন"
                className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedUserForBalance(null)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isSubmittingUserAction}
                onClick={handleConfirmBalance}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmittingUserAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                সমন্বয় নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CREATE NEW USER MODAL                      */}
      {/* ==================================================== */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-yellow-400" />
                  নতুন প্লেয়ার অ্যাকাউন্ট তৈরি করুন
                </h3>
                <p className="text-xs text-emerald-300/80">
                  সরাসরি ডাটাবেসে নতুন খেলোয়াড় প্রোফাইল ও ব্যালেন্স তৈরি করুন।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateUserModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">ইউজারনেম (Username) *:</label>
                  <input
                    type="text"
                    required
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    placeholder="যেমন: shakib_pro"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">ফোন নম্বর *:</label>
                  <input
                    type="text"
                    required
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    placeholder="যেমন: 01712345678"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">আসল নাম (Real Name):</label>
                  <input
                    type="text"
                    value={newUserData.realName}
                    onChange={(e) => setNewUserData({ ...newUserData, realName: e.target.value })}
                    placeholder="যেমন: সাকিব আল হাসান"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">ইমেইল (ঐচ্ছিক):</label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="যেমন: player@gmail.com"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">লগইন পাসওয়ার্ড:</label>
                  <input
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="ডিফল্ট: 123456"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">প্রাথমিক ব্যালেন্স (BDT):</label>
                  <input
                    type="number"
                    value={newUserData.balance}
                    onChange={(e) => setNewUserData({ ...newUserData, balance: e.target.value })}
                    placeholder="1000"
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-yellow-400 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-300 mb-1 font-semibold">VIP লেভেল নির্ধারণ:</label>
                  <select
                    value={newUserData.vipLevel}
                    onChange={(e) => setNewUserData({ ...newUserData, vipLevel: Number(e.target.value) })}
                    className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        VIP {lvl} {lvl === 0 ? '(নবাগত)' : lvl >= 5 ? '(প্লাটিনাম/ডায়মন্ড)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUserAction}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingUserAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  প্লেয়ার অ্যাকাউন্ট সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: FULL USER EDIT & CONTROL MODAL             */}
      {/* ==================================================== */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-yellow-400" />
                  সম্পূর্ণ ইউজার প্রোফাইল এডিট ও রিসোর্স কন্ট্রোল
                </h3>
                <p className="text-xs text-emerald-300/80">
                  ইউজার: <b className="text-yellow-400">{selectedUserForEdit.username}</b> (ID: {selectedUserForEdit.id})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForEdit(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdits} className="space-y-4">
              {/* Account Credentials */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  ১. অ্যাকাউন্ট তথ্য ও স্ট্যাটাস
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">ইউজারনেম:</label>
                    <input
                      type="text"
                      value={editFormData.username || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">আসল নাম:</label>
                    <input
                      type="text"
                      value={editFormData.realName || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, realName: e.target.value })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">ফোন নম্বর:</label>
                    <input
                      type="text"
                      value={editFormData.phone || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">ইমেইল ঠিকানা:</label>
                    <input
                      type="email"
                      value={editFormData.email || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-300 mb-1">অ্যাকাউন্ট স্ট্যাটাস (Security Status):</label>
                    <select
                      value={editFormData.status || 'active'}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    >
                      <option value="active">🟢 সক্রিয় (Active - স্বাভাবিক খেলা ও উইথড্র)</option>
                      <option value="frozen">🟡 স্থগিত (Frozen - সাময়িক ব্লক)</option>
                      <option value="banned">🔴 নিষিদ্ধ (Banned - স্থায়ী ব্যান)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Financial & VIP Settings */}
              <div className="space-y-2 pt-2 border-t border-emerald-800/60">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  ২. ওয়ালেট ও ভিআইপি স্তর
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">ওয়ালেট ব্যালেন্স (BDT):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.balance}
                      onChange={(e) => setEditFormData({ ...editFormData, balance: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-sm text-yellow-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-300 mb-1">VIP লেভেল (0-10):</label>
                    <select
                      value={editFormData.vipLevel}
                      onChange={(e) => setEditFormData({ ...editFormData, vipLevel: Number(e.target.value) })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white font-bold"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((l) => (
                        <option key={l} value={l}>
                          VIP {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Reward Resources Quota */}
              <div className="space-y-2 pt-2 border-t border-emerald-800/60">
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                  ৩. গেম ও রিওয়ার্ড কোটা
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">ফ্রি স্পিন সংখ্যা:</label>
                    <input
                      type="number"
                      value={editFormData.freeSpins}
                      onChange={(e) => setEditFormData({ ...editFormData, freeSpins: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-2.5 py-1.5 text-xs text-yellow-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">গোল্ডেন এগ সংখ্যা:</label>
                    <input
                      type="number"
                      value={editFormData.goldenEggsAvailable}
                      onChange={(e) => setEditFormData({ ...editFormData, goldenEggsAvailable: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-300 mb-1">রেড প্যাকেট সংখ্যা:</label>
                    <input
                      type="number"
                      value={editFormData.redPacketsAvailable}
                      onChange={(e) => setEditFormData({ ...editFormData, redPacketsAvailable: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-2.5 py-1.5 text-xs text-red-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2 border-t border-emerald-800/60">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUserAction}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingUserAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  পরিবর্তন সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: SEND DIRECT INBOX MESSAGE / NOTICE         */}
      {/* ==================================================== */}
      {selectedUserForMessage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-yellow-400" />
                  ইনবক্স বার্তা ও নোটিফিকেশন পাঠান
                </h3>
                <p className="text-xs text-emerald-300/80">
                  প্রাপক: <b className="text-yellow-400">{selectedUserForMessage.username}</b>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForMessage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessageSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">বার্তার শিরোনাম (Subject):</label>
                <input
                  type="text"
                  required
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  placeholder="যেমন: বিশেষ অফার অথবা সতর্কতা"
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">বার্তার বিবরণ (Message):</label>
                <textarea
                  rows={4}
                  required
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="প্লেয়ারের জন্য বিস্তারিত বার্তা লিখুন..."
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-300 mb-1 font-semibold">প্রেরকের নাম (Sender Signature):</label>
                <input
                  type="text"
                  value={messageSender}
                  onChange={(e) => setMessageSender(e.target.value)}
                  placeholder="Neext Hub Admin Support"
                  className="w-full bg-[#051c13] border border-emerald-700 rounded-xl px-3 py-2 text-xs text-emerald-200"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForMessage(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUserAction}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs shadow-lg shadow-yellow-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingUserAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  বার্তা প্রেরণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: DETAILED USER ANALYTICS & HISTORY MODAL     */}
      {/* ==================================================== */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#09291b] border border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/40">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUserForDetails.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border-2 border-yellow-400 object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedUserForDetails.user?.username || 'প্লেয়ার'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 font-bold text-[10px] border border-yellow-400/40">
                      VIP {selectedUserForDetails.user?.vipLevel || 0}
                    </span>
                  </h3>
                  <div className="text-xs text-emerald-300/80 font-mono">
                    ID: {selectedUserForDetails.user?.id} • 📞 {selectedUserForDetails.user?.phone || 'ফোন নেই'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="p-12 text-center text-emerald-300">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-yellow-400" />
                ইউজার হিস্ট্রি ও ডাটা লোড হচ্ছে...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Financial Summary Bento */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800">
                    <span className="text-gray-400 block text-[10px]">প্রধান ওয়ালেট:</span>
                    <span className="font-black text-yellow-400 font-mono text-sm">
                      ৳{(selectedUserForDetails.user?.balance || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800">
                    <span className="text-gray-400 block text-[10px]">মোট ডিপোজিট:</span>
                    <span className="font-black text-green-400 font-mono text-sm">
                      ৳{(selectedUserForDetails.stats?.totalDeposited || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800">
                    <span className="text-gray-400 block text-[10px]">মোট ক্যাশআউট:</span>
                    <span className="font-black text-red-400 font-mono text-sm">
                      ৳{(selectedUserForDetails.stats?.totalWithdrawn || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#061e14] border border-emerald-800">
                    <span className="text-gray-400 block text-[10px]">গেম বেট গণনা:</span>
                    <span className="font-black text-cyan-400 font-mono text-sm">
                      {selectedUserForDetails.stats?.totalBetsCount || 0} টি বেট
                    </span>
                  </div>
                </div>

                {/* Sub-wallets */}
                {selectedUserForDetails.wallets && selectedUserForDetails.wallets.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-gray-300">গেম সাব-ওয়ালেট সমুহ:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {selectedUserForDetails.wallets.map((w: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-[#051c13] border border-emerald-800/80 flex justify-between">
                          <span className="text-gray-400">{w.gameId || 'Game'}:</span>
                          <span className="font-bold text-white font-mono">৳{(w.balance || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Transactions */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-300">সাম্প্রতিক লেনদেন হিস্ট্রি:</h4>
                  {(!selectedUserForDetails.recentTransactions || selectedUserForDetails.recentTransactions.length === 0) ? (
                    <div className="p-4 rounded-xl bg-[#061e14] text-center text-xs text-gray-400">
                      কোনো লেনদেন রেকর্ড নেই
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedUserForDetails.recentTransactions.map((tx: any) => (
                        <div key={tx.id} className="p-2 rounded-xl bg-[#061e14] border border-emerald-800/60 flex items-center justify-between text-xs">
                          <div>
                            <span className={`font-bold ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                              {tx.type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'}
                            </span>
                            <span className="text-gray-400 text-[10px] ml-1.5">({tx.method})</span>
                            <div className="text-[10px] text-gray-500 font-mono">TRX: {tx.trxId || tx.id}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-white">৳{tx.amount}</span>
                            <div className={`text-[10px] ${tx.status === 'success' ? 'text-green-400' : tx.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}`}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Bets */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-300">সাম্প্রতিক গেম বেটিং হিস্ট্রি:</h4>
                  {(!selectedUserForDetails.recentBets || selectedUserForDetails.recentBets.length === 0) ? (
                    <div className="p-4 rounded-xl bg-[#061e14] text-center text-xs text-gray-400">
                      কোনো বেটিং হিস্ট্রি নেই
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {selectedUserForDetails.recentBets.map((b: any) => (
                        <div key={b.id} className="p-2 rounded-xl bg-[#061e14] border border-emerald-800/60 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-white">{b.gameName || b.gameId}</span>
                            <div className="text-[10px] text-gray-500">{b.timestamp ? b.timestamp.slice(0, 16) : ''}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-gray-300">বেট: ৳{b.betAmount}</div>
                            <div className={`font-bold font-mono ${b.isWin ? 'text-green-400' : 'text-gray-500'}`}>
                              {b.isWin ? `+৳${b.payout}` : 'পরাজয়'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 6: CONFIRM DELETE USER MODAL                  */}
      {/* ==================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#09291b] border border-red-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">আপনি কি নিশ্চিত?</h3>
              <p className="text-xs text-gray-300 mt-1">
                প্লেয়ার <b className="text-yellow-400">{userToDelete.username}</b> (ID: {userToDelete.id}) কে সম্পূর্ণ মুছে ফেলা হবে। এই পদক্ষেপ পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isSubmittingUserAction}
                onClick={handleConfirmDeleteUser}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isSubmittingUserAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

