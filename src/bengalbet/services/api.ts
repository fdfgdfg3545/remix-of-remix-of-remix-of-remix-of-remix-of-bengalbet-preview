// @ts-nocheck
/**
 * BengalBet Client-side API Service
 * Connects frontend UI to real Express backend & JSON Database
 */

import { UserAccount } from '../types';
import { normalizeServerConfig } from './apiConfig';
import { mayAttachAdminCredential, mayAttachMemberCredential } from './requestPolicy';

const STORAGE_KEY_CONFIG = 'bengalbet_rest_api_config';
const getDefaultConfig = () => normalizeServerConfig(import.meta.env.VITE_DBSERVER_URL);

const getInitialConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...normalizeServerConfig(parsed.rootDomain, parsed.path),
        masterKey: ''
      };
    }
  } catch {}
  return {
    ...getDefaultConfig(),
    masterKey: ''
  };
};

const _configState = getInitialConfig();

// Old sessions (before signed tokens) must sign in again
try {
  if (localStorage.getItem('bengalbet_user_session') && !localStorage.getItem('bengalbet_auth_token')) {
    localStorage.removeItem('bengalbet_user_session');
  }
} catch {}

const persistConfig = () => {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
      rootDomain: _configState.rootDomain,
      path: _configState.path
    }));
  } catch {}
};

export const REST_API_CONFIG = {
  get rootDomain() {
    return _configState.rootDomain;
  },
  set rootDomain(val: string) {
    Object.assign(_configState, normalizeServerConfig(val, _configState.path));
    persistConfig();
  },
  get path() {
    return _configState.path;
  },
  set path(val: string) {
    Object.assign(_configState, normalizeServerConfig(_configState.rootDomain, val));
    persistConfig();
  },
  // Admin master key lives only in this browser tab's session, never in the code
  get masterKey() {
    try { return sessionStorage.getItem('bengalbet_admin_key') || ''; } catch { return ''; }
  },
  set masterKey(val: string) {
    try {
      if (val.trim()) sessionStorage.setItem('bengalbet_admin_key', val.trim());
      else sessionStorage.removeItem('bengalbet_admin_key');
    } catch {}
  },
  get baseUrl() {
    const p = this.path ? (this.path.startsWith('/') ? this.path : `/${this.path}`) : '';
    return `${this.rootDomain}${p}/api`;
  },
  get masterApiUrl() {
    const p = this.path ? (this.path.startsWith('/') ? this.path : `/${this.path}`) : '';
    return `${this.rootDomain}${p}/masterapi.php`;
  },
  update(newConf: { rootDomain?: string; path?: string; masterKey?: string }) {
    Object.assign(_configState, normalizeServerConfig(
      newConf.rootDomain ?? _configState.rootDomain,
      newConf.path ?? _configState.path,
    ));
    if (newConf.masterKey !== undefined) {
      this.masterKey = newConf.masterKey;
    }
    persistConfig();
  },
  resetToDefaults() {
    Object.assign(_configState, getDefaultConfig());
    persistConfig();
  }
};

export interface DatabaseServerErrorState {
  isError: boolean;
  lastChecked: number;
  errorMessage: string;
  targetUrl: string;
  statusCode?: number;
  failingEndpoint?: string;
}

type DbErrorListener = (errorState: DatabaseServerErrorState) => void;
const dbErrorListeners = new Set<DbErrorListener>();

let currentDbErrorState: DatabaseServerErrorState = {
  isError: false,
  lastChecked: Date.now(),
  errorMessage: '',
  targetUrl: ''
};

export const getDatabaseServerError = (): DatabaseServerErrorState => ({ ...currentDbErrorState });

export const subscribeDatabaseServerError = (listener: DbErrorListener): (() => void) => {
  dbErrorListeners.add(listener);
  try {
    listener({ ...currentDbErrorState });
  } catch {}
  return () => {
    dbErrorListeners.delete(listener);
  };
};

export const setDatabaseServerError = (err: Partial<DatabaseServerErrorState> | null) => {
  if (!err) {
    currentDbErrorState = {
      isError: false,
      lastChecked: Date.now(),
      errorMessage: '',
      targetUrl: ''
    };
  } else {
    currentDbErrorState = {
      isError: true,
      lastChecked: Date.now(),
      errorMessage: err.errorMessage || 'ডাটাবেস সার্ভারে সংযোগ পাওয়া যাচ্ছে না (Database server unreachable)',
      targetUrl: err.targetUrl || REST_API_CONFIG.baseUrl,
      statusCode: err.statusCode,
      failingEndpoint: err.failingEndpoint
    };
  }
  dbErrorListeners.forEach(listener => {
    try {
      listener({ ...currentDbErrorState });
    } catch {}
  });
};

export const clearDatabaseServerError = () => {
  setDatabaseServerError(null);
};

const getAuthToken = (): string => {
  try {
    const token = localStorage.getItem('bengalbet_auth_token');
    if (token) return `Bearer ${token}`;
  } catch {}
  return '';
};

const buildApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const clean = endpoint.startsWith('/api/') ? endpoint.substring(5) : endpoint.replace(/^\//, '');
  return `${REST_API_CONFIG.baseUrl}/${clean}`;
};

const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const targetUrl = buildApiUrl(endpoint);
  const headers = {
    'Content-Type': 'application/json',
    ...(mayAttachMemberCredential(endpoint) && getAuthToken() ? { 'Authorization': getAuthToken() } : {}),
    ...(mayAttachAdminCredential(endpoint, options.method) && REST_API_CONFIG.masterKey ? { 'X-Master-Key': REST_API_CONFIG.masterKey } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'সার্ভার রেসপন্স ত্রুটি' }));
      const msg = errorData.message || errorData.error || `HTTP error ${response.status}`;
      
      // Check if this error is database-related or server unavailable
      if (
        response.status >= 500 ||
        msg.toLowerCase().includes('database') ||
        msg.toLowerCase().includes('sql') ||
        msg.toLowerCase().includes('mysql') ||
        msg.toLowerCase().includes('connection')
      ) {
        setDatabaseServerError({
          errorMessage: msg,
          targetUrl,
          statusCode: response.status,
          failingEndpoint: endpoint
        });
      }
      throw new Error(msg);
    }

    const data = await response.json();

    // Save the signed session token returned by login/register
    if (data && typeof data.token === 'string' && data.token.startsWith('v1.')) {
      try { localStorage.setItem('bengalbet_auth_token', data.token); } catch {}
    }

    // Check if database disconnected was reported inside body
    if (data && data.mysql && data.mysql.connected === false) {
      setDatabaseServerError({
        errorMessage: 'ডাটাবেস সংযোগ বিচ্ছিন্ন: ' + (data.mysql.version || 'Offline'),
        targetUrl,
        failingEndpoint: endpoint
      });
    } else if (currentDbErrorState.isError) {
      clearDatabaseServerError();
    }

    return data;
  } catch (err: any) {
    const isNetworkOrDb =
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Network request failed') ||
      err.message?.includes('Database') ||
      err.message?.includes('সার্ভার');

    if (isNetworkOrDb) {
      setDatabaseServerError({
        errorMessage: err.message || 'ডাটাবেস সার্ভার অফলাইন বা সংযোগ করা যাচ্ছে না',
        targetUrl,
        failingEndpoint: endpoint
      });
    }

    // Strict REST API operation: No fallback to local mock data
    throw err;
  }
};

const masterRequest = async <T = any>(params: Record<string, any> = {}, options: RequestInit = {}): Promise<T> => {
  const query = new URLSearchParams();
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      query.append(key, String(params[key]));
    }
  }
  const targetUrl = `${REST_API_CONFIG.masterApiUrl}${query.toString() ? '?' + query.toString() : ''}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(getAuthToken() ? { 'Authorization': getAuthToken() } : {}),
    ...(REST_API_CONFIG.masterKey ? { 'X-Master-Key': REST_API_CONFIG.masterKey } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(targetUrl, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Master API ত্রুটি' }));
      const msg = errorData.message || errorData.error || `Master API error ${response.status}`;
      setDatabaseServerError({
        errorMessage: msg,
        targetUrl,
        statusCode: response.status,
        failingEndpoint: 'masterapi.php'
      });
      throw new Error(msg);
    }

    const data = await response.json();
    if (data && data.mysql && data.mysql.connected === false) {
      setDatabaseServerError({
        errorMessage: 'ডাটাবেস সংযোগ বিচ্ছিন্ন: ' + (data.mysql.version || 'Offline'),
        targetUrl,
        failingEndpoint: 'masterapi.php'
      });
    } else if (currentDbErrorState.isError) {
      clearDatabaseServerError();
    }

    return data;
  } catch (err: any) {
    setDatabaseServerError({
      errorMessage: err.message || 'Master API সার্ভার অফলাইন বা রেসপন্স করছে না',
      targetUrl,
      failingEndpoint: 'masterapi.php'
    });
    throw err;
  }
};

export const api = {
  // Public health check (no admin key needed): settings endpoint touches the database
  async health() {
    const res = await request<any>('/api/settings');
    return { ...res, success: !!res?.success, mysql: { connected: !!res?.success, version: '' } };
  },
  auth: {
    async login(phone: string, password: string) {
      return request<{ success: boolean; message: string; token: string; user: UserAccount }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password })
      });
    },

    async register(phone: string, password: string, referralCode?: string) {
      return request<{ success: boolean; message: string; token: string; user: UserAccount }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ phone, password, referralCode })
      });
    },

    async getMe() {
      return request<{ success: boolean; user: UserAccount }>('/api/auth/me');
    },

    async updateProfile(data: { username?: string; avatar?: string; realName?: string; birthday?: string; email?: string }) {
      return request('/api/auth/update-profile', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async changePassword(oldPassword: string, newPassword: string) {
      return request<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
      });
    },

    async changeTransactionPassword(newTransactionPassword: string, oldTransactionPassword?: string) {
      return request<{ success: boolean; message: string }>('/api/auth/change-transaction-password', {
        method: 'POST',
        body: JSON.stringify({ newTransactionPassword, oldTransactionPassword })
      });
    },

    async getGoogleAuthUrl(origin?: string) {
      const q = origin ? `?origin=${encodeURIComponent(origin)}` : '';
      return request<{ configured: boolean; url?: string; redirectUri?: string; message?: string }>(`/api/auth/google/url${q}`);
    },

    async googleDemoLogin(email?: string, name?: string, avatar?: string) {
      return request<{ success: boolean; message: string; token: string; user: UserAccount }>('/api/auth/google/demo', {
        method: 'POST',
        body: JSON.stringify({ email, name, avatar })
      });
    }
  },

  wallet: {
    async getBalance() {
      return request<{ success: boolean; balance: number; vipLevel: number; vipExp: number }>('/api/wallet/balance');
    },

    async getTurnover() {
      return request<{ success: boolean; enabled: boolean; required: number; completed: number; remaining: number }>('/api/wallet/turnover');
    },

    async deposit(amount: number, method: string, gateway?: string, senderAccount?: string, trxId?: string, claimBonus = true) {
      return request<{ success: boolean; message: string; newBalance: number; bonusAdded: number; pending?: boolean; transaction: any }>('/api/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amount, method, gateway, senderAccount, trxId, claimBonus })
      });
    },

    async withdraw(amount: number, walletType: string, accountNumber: string) {
      return request<{ success: boolean; message: string; newBalance: number; transaction: any }>('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, walletType, accountNumber })
      });
    },

    async getTransactions(type?: string) {
      const query = type && type !== 'all' ? `?type=${type}` : '';
      return request<{ success: boolean; count: number; transactions: any[] }>(`/api/wallet/transactions${query}`);
    },

    async getCards() {
      return request<{ success: boolean; wallets: any[] }>('/api/wallet/cards');
    },

    async addCard(type: string, accountName: string, accountNumber: string) {
      return request<{ success: boolean; message: string; wallet: any }>('/api/wallet/cards', {
        method: 'POST',
        body: JSON.stringify({ type, accountName, accountNumber })
      });
    },

    async deleteCard(id: string) {
      return request<{ success: boolean; message: string }>(`/api/wallet/cards/${id}`, {
        method: 'DELETE'
      });
    }
  },

  games: {
    bigWins: () => request<{ success: boolean; wins: { gameName: string; vendor: string; amount: number; time: string; user: string }[]; totalBets: number }>('/api/games/big-wins'),
    playRound: (data: { gameId: string; category: string; gameName?: string; vendor?: string; betAmount: number }) =>
      request<{ success: boolean; round: { isWin: boolean; multiplier: number; payout: number; bet: number; isJackpot: boolean }; newBalance: number; vipExp: number }>('/api/games/round', { method: 'POST', body: JSON.stringify(data) }),
    async recordBet(data: {
      category: string;
      vendor: string;
      gameName: string;
      betAmount: number;
      reward: number;
      gameRound?: string;
    }) {
      return request<{ success: boolean; bet: any; newBalance: number; profit: number }>('/api/games/bet', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async getRecords(category?: string, date?: string) {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (date) params.append('date', date);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{
        success: boolean;
        bets: any[];
        summary: { totalBet: number; validBet: number; totalReward: number; totalProfit: number };
      }>(`/api/games/records${query}`);
    },

    async getProfitLoss() {
      return request<{
        success: boolean;
        totalBet: number;
        validBet: number;
        payout: number;
        netProfit: number;
        byCategory: Record<string, { totalBet: number; payout: number; netProfit: number }>;
      }>('/api/games/profit-loss');
    }
  },

  rewards: {
    chanceTable: (type: 'spin' | 'golden_egg' | 'red_envelope') =>
      request<{ success: boolean; prizes: { label: string; amount: number }[] }>(`/api/rewards/table?type=${type}`),
    missionsStatus: () => request<{ success: boolean; missions: { enabled: boolean; category: string; turnover: number; date: string; resetsAt: string; tiers: { id: number; bet: number; bonus: number; claimed: boolean; eligible: boolean }[] } }>('/api/rewards/missions-status'),
    claimMission: (tier: number) => request<{ success: boolean; amount: number; newBalance: number; message?: string }>('/api/rewards/mission-claim', { method: 'POST', body: JSON.stringify({ tier }) }),
    offersStatus: () => request<{ success: boolean; offers: Record<string, any> }>('/api/rewards/offers-status'),
    claimOffer: (offer: 'slot_daily' | 'rebate' | 'member_day') => request<{ success: boolean; amount: number; newBalance: number }>('/api/rewards/offer-claim', { method: 'POST', body: JSON.stringify({ offer }) }),
    appBonus: () => request<{ success: boolean; amount: number; newBalance: number }>('/api/rewards/app-bonus', { method: 'POST', body: '{}' }),
    packetRound: () => request<{ success: boolean; open: boolean; round: string | null; remaining: number; claimed: boolean; schedule?: string }>('/api/rewards/packet-round'),
    playChance: (type: 'spin' | 'golden_egg' | 'red_envelope') =>
      request<{ success: boolean; prize: { index: number; label: string; amount: number }; newBalance: number; user: any }>('/api/rewards/claim', { method: 'POST', body: JSON.stringify({ type }) }),
    getChanceConfig: () => request<{ success: boolean; configured: boolean; config: Record<string, { label: string; amount: number; weight: number }[]> }>('/api/admin.php?section=chance-rewards&action=config'),
    saveChanceConfig: (config: Record<string, { label: string; amount: number; weight: number }[]>) =>
      request<{ success: boolean; config: any }>('/api/admin.php?section=chance-rewards&action=config', { method: 'POST', body: JSON.stringify(config) }),
    async claim(type: 'spin' | 'golden_egg' | 'red_envelope' | 'mission' | 'promo' | 'signin', amount: number, title?: string) {
      return request<{ success: boolean; message: string; newBalance: number; user: any }>('/api/rewards/claim', {
        method: 'POST',
        body: JSON.stringify({ type, amount, title })
      });
    }
  },

  messages: {
    async getMessages() {
      return request<{ success: boolean; messages: any[]; unreadCount: number }>('/api/messages');
    },

    async markRead(id: string) {
      return request<{ success: boolean }>(`/api/messages/${id}/read`, {
        method: 'POST'
      });
    },

    async delete(id: string) {
      return request<{ success: boolean }>(`/api/messages/${id}`, {
        method: 'DELETE'
      });
    },

    async claimBonus(id: string) {
      return request<{ success: boolean; amount?: number; message: string }>(`/api/messages/${id}/claim`, {
        method: 'POST'
      });
    }
  },

  feedback: {
    async submit(
      type: string,
      content: string,
      contact?: string,
      subject?: string,
      priority?: 'normal' | 'high' | 'urgent'
    ) {
      return request<{ success: boolean; message: string; feedback: any }>('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({ type, content, contact, subject, priority })
      });
    },

    async getFeedbacks() {
      return request<{
        success: boolean;
        feedbacks: any[];
        pendingCount?: number;
        repliedCount?: number;
      }>('/api/feedback');
    },

    async getTicket(id: string) {
      return request<{ success: boolean; feedback: any }>(`/api/feedback/${id}`);
    },

    async addMessage(id: string, text: string, senderName?: string) {
      return request<{ success: boolean; message: string; feedback: any }>(`/api/feedback/${id}/message`, {
        method: 'POST',
        body: JSON.stringify({ text, senderName })
      });
    },

    async resolveTicket(id: string) {
      return request<{ success: boolean; message: string; feedback: any }>(`/api/feedback/${id}/resolve`, {
        method: 'PATCH'
      });
    }
  },

  chat: {
    async getSession(department?: string) {
      const q = department ? `?department=${encodeURIComponent(department)}` : '';
      return request<{ success: boolean; session: any; messages: any[] }>(`/api/chat/session${q}`);
    },

    async getMessages(sessionId: string) {
      return request<{ success: boolean; session: any; messages: any[] }>(`/api/chat/messages/${sessionId}`);
    },

    async sendMessage(data: {
      sessionId: string;
      text: string;
      attachmentUrl?: string;
      attachmentType?: string;
      quickAction?: any;
    }) {
      return request<{ success: boolean; message: any; session: any }>('/api/chat/send', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async setDepartment(sessionId: string, department: string) {
      return request<{ success: boolean; session: any; messages: any[] }>('/api/chat/department', {
        method: 'POST',
        body: JSON.stringify({ sessionId, department })
      });
    },

    async rateSession(sessionId: string, rating: number, comment?: string) {
      return request<{ success: boolean; message: string; session: any }>('/api/chat/rate', {
        method: 'POST',
        body: JSON.stringify({ sessionId, rating, comment })
      });
    },

    async closeSession(sessionId: string) {
      return request<{ success: boolean; session: any }>('/api/chat/close', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
    }
  },

  settings: {
    async getPublicSettings() {
      return request<{
        success: boolean;
        settings: {
          bkashNumber: string;
          nagadNumber: string;
          rocketNumber: string;
          usdtAddress: string;
          siteNotice: any;
          maintenanceMode: boolean;
          minDeposit: number;
          maxDeposit: number;
          minWithdraw: number;
          maxWithdraw: number;
          gameEngine?: any;
          depositOffer?: import('./depositOffer').DepositOffer;
        };
      }>('/api/settings');
    }
  },

  admin: {
    async getStats() {
      return request<{ success: boolean; stats: any }>('/api/admin/stats');
    },

    async getUsers() {
      return request<{ success: boolean; users: any[] }>('/api/admin/users');
    },

    async createUser(userData: { username: string; phone: string; email?: string; password?: string; balance?: number; vipLevel?: number; realName?: string }) {
      return request<{ success: boolean; user: any; message: string }>('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    async syncUsers(users: any[]) {
      return request<{ success: boolean; syncedCount: number; total: number }>('/api/admin/users/sync', {
        method: 'POST',
        body: JSON.stringify({ users })
      });
    },

    async getUserDetails(userId: string) {
      return request<{ success: boolean; details: any }>(`/api/admin/users/${userId}/details`);
    },

    async updateUserFull(userId: string, updates: any) {
      return request<{ success: boolean; user: any; message: string }>(`/api/admin/users/${userId}/update`, {
        method: 'POST',
        body: JSON.stringify(updates)
      });
    },

    async updateUserStatus(userId: string, status: 'active' | 'frozen' | 'banned') {
      return request<{ success: boolean; user: any; message: string }>(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status })
      });
    },

    async sendUserMessage(userId: string, title: string, description: string, sender?: string) {
      return request<{ success: boolean; message: string; record?: any }>(`/api/admin/users/${userId}/message`, {
        method: 'POST',
        body: JSON.stringify({ title, description, sender })
      });
    },

    async updateUserBalance(userId: string, amount: number, type: 'add' | 'deduct' | 'set', note?: string) {
      return request<{ success: boolean; user: any; message: string }>(`/api/admin/users/${userId}/balance`, {
        method: 'POST',
        body: JSON.stringify({ amount, type, note })
      });
    },

    async updateUserVip(userId: string, vipLevel: number, vipExp?: number) {
      return request<{ success: boolean; user: any; message: string }>(`/api/admin/users/${userId}/vip`, {
        method: 'POST',
        body: JSON.stringify({ vipLevel, vipExp })
      });
    },

    async resetUserCooldowns(userId: string) {
      return request<{ success: boolean; user: any; message: string }>(`/api/admin/users/${userId}/reset-cooldowns`, {
        method: 'POST'
      });
    },

    async deleteUser(userId: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
    },

    async getTransactions(type?: string, status?: string, channel?: string, search?: string) {
      const params = new URLSearchParams();
      if (type && type !== 'all') params.append('type', type);
      if (status && status !== 'all') params.append('status', status);
      if (channel && channel !== 'all') params.append('channel', channel);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; count: number; transactions: any[] }>(`/api/admin/transactions${query}`);
    },

    async createTransaction(data: {
      userId: string;
      type: string;
      amount: number;
      bonus?: number;
      fee?: number;
      channel: string;
      gateway?: string;
      accountNumber?: string;
      trxId?: string;
      status?: string;
      description?: string;
      adminNote?: string;
      adjustBalance?: boolean;
      notifyUser?: boolean;
    }) {
      return request<{ success: boolean; transaction: any; message: string }>('/api/admin/transactions/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateTransactionStatus(
      id: string,
      status: 'success' | 'rejected' | 'pending' | 'processing' | 'flagged',
      options?: {
        adminNote?: string;
        rejectionReason?: string;
        bonusAdjust?: number;
        feeAdjust?: number;
        notifyUser?: boolean;
      }
    ) {
      return request<{ success: boolean; transaction: any; message: string }>(`/api/admin/transactions/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, ...options })
      });
    },

    async batchProcessTransactions(data: {
      ids: string[];
      status: 'success' | 'rejected' | 'processing' | 'flagged' | 'pending';
      rejectionReason?: string;
      adminNote?: string;
      notifyUsers?: boolean;
    }) {
      return request<{ success: boolean; updatedCount: number; message: string }>('/api/admin/transactions/batch', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async editTransaction(id: string, updates: any) {
      return request<{ success: boolean; transaction: any; message: string }>(`/api/admin/transactions/${id}/edit`, {
        method: 'POST',
        body: JSON.stringify(updates)
      });
    },

    async deleteTransaction(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/transactions/${id}`, {
        method: 'DELETE'
      });
    },

    async getSettings() {
      return request<{ success: boolean; settings: any }>('/api/admin/settings');
    },

    async updateSettings(settings: any) {
      return request<{ success: boolean; settings: any; message: string }>('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify(settings)
      });
    },

    async getFeedbacks() {
      return request<{
        success: boolean;
        feedbacks: any[];
        stats?: {
          total: number;
          pending: number;
          in_progress: number;
          replied: number;
          resolved: number;
          closed: number;
        };
      }>('/api/admin/feedbacks');
    },

    async replyFeedback(id: string, reply: string, status?: string, senderName?: string) {
      return request<{ success: boolean; feedback: any; message: string }>(`/api/admin/feedbacks/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply, status, senderName })
      });
    },

    async updateFeedbackStatus(id: string, status: string) {
      return request<{ success: boolean; feedback: any; message: string }>(`/api/admin/feedbacks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },

    async deleteFeedback(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/feedbacks/${id}`, {
        method: 'DELETE'
      });
    },

    async getMessages() {
      return request<{ success: boolean; messages: any[] }>('/api/admin/messages');
    },

    async createBroadcastMessage(data: {
      userId?: string;
      title: string;
      headline?: string;
      sender?: string;
      category?: string;
      claimableBonus?: number;
      description?: string;
      steps?: string[];
      rules?: string[];
    }) {
      return request<{ success: boolean; message: string; messageRecord: any }>('/api/admin/messages/create', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async deleteMessage(id: string) {
      return request<{ success: boolean; message?: string }>(`/api/admin/messages/${id}`, {
        method: 'DELETE'
      });
    },

    chat: {
      async getSessions() {
        return request<{
          success: boolean;
          sessions: any[];
          stats: {
            totalSessions: number;
            activeSessions: number;
            waitingSessions: number;
            resolvedSessions: number;
            unreadAdminCount: number;
            avgRating: number;
          };
        }>('/api/admin/chat/sessions');
      },

      async getSession(sessionId: string) {
        return request<{
          success: boolean;
          session: any;
          messages: any[];
          userDetails: any;
        }>(`/api/admin/chat/sessions/${sessionId}`);
      },

      async replySession(sessionId: string, text: string, senderName?: string, attachmentUrl?: string, quickAction?: any) {
        return request<{
          success: boolean;
          message: string;
          chatMessage: any;
          session: any;
        }>(`/api/admin/chat/sessions/${sessionId}/reply`, {
          method: 'POST',
          body: JSON.stringify({ text, senderName, attachmentUrl, quickAction })
        });
      },

      async updateSessionStatus(sessionId: string, status: 'active' | 'waiting' | 'resolved' | 'closed') {
        return request<{
          success: boolean;
          session: any;
          message: string;
        }>(`/api/admin/chat/sessions/${sessionId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });
      },

      async assignAgent(sessionId: string, name: string, role?: string, avatar?: string) {
        return request<{ success: boolean; session: any }>(`/api/admin/chat/sessions/${sessionId}/assign`, {
          method: 'POST',
          body: JSON.stringify({ name, role, avatar })
        });
      },

      async saveNote(sessionId: string, note: string) {
        return request<{ success: boolean; session: any; message: string }>(`/api/admin/chat/sessions/${sessionId}/note`, {
          method: 'POST',
          body: JSON.stringify({ note })
        });
      },

      async quickCredit(sessionId: string, amount: number, note?: string, type: 'bonus' | 'credit' = 'credit') {
        return request<{ success: boolean; message: string; newBalance: number }>(`/api/admin/chat/sessions/${sessionId}/credit`, {
          method: 'POST',
          body: JSON.stringify({ amount, note, type })
        });
      },

      async deleteSession(sessionId: string) {
        return request<{ success: boolean; message: string }>(`/api/admin/chat/sessions/${sessionId}`, {
          method: 'DELETE'
        });
      }
    },

    referrals: {
      async getStats() {
        return request<{
          success: boolean;
          stats: {
            totalReferrals: number;
            totalBonusPaid: number;
            activeReferrers: number;
            totalDepositsGenerated: number;
            totalTurnoverGenerated: number;
            instantBonusPerFriend: number;
            depositCommissionRate: number;
            betRebateRate: number;
          };
          topReferrers: Array<{
            userId: string;
            username: string;
            phone: string;
            code: string;
            friendsCount: number;
            totalEarnings: number;
          }>;
        }>('/api/admin/referrals/stats');
      },

      async getList(search = '', status = 'all') {
        const query = new URLSearchParams({ search, status }).toString();
        return request<{
          success: boolean;
          referrals: any[];
          total: number;
        }>(`/api/admin/referrals/list?${query}`);
      },

      async getSettings() {
        return request<{
          success: boolean;
          settings: {
            enabled: boolean;
            instantBonusPerFriend: number;
            minDepositToQualify: number;
            minBetTurnoverToQualify?: number;
            depositRebateRate?: number;
            betTurnoverRebateRate: number;
            maxBonusCap?: number;
            autoCreditInstantBonus: boolean;
            customTiers?: Array<{ id: number; count: number; bonus: number; desc?: string }>;
            tier1DepositCommissionRate?: number;
            tier2DepositCommissionRate?: number;
            tier3DepositCommissionRate?: number;
          };
        }>('/api/admin/referrals/settings');
      },

      async updateSettings(settings: any) {
        return request<{
          success: boolean;
          message: string;
          settings: any;
        }>('/api/admin/referrals/settings', {
          method: 'POST',
          body: JSON.stringify(settings)
        });
      },

      async manualBonusPayout(userId: string, amount: number, note?: string) {
        return request<{
          success: boolean;
          message: string;
          newBalance: number;
          transaction: any;
        }>('/api/admin/referrals/bonus-payout', {
          method: 'POST',
          body: JSON.stringify({ userId, amount, note })
        });
      },

      async updateStatus(id: string, status: 'active' | 'pending_first_deposit' | 'frozen') {
        return request<{
          success: boolean;
          message: string;
          referral: any;
        }>('/api/admin/referrals/status', {
          method: 'POST',
          body: JSON.stringify({ id, status })
        });
      },

      async getClaims() {
        return request<{
          success: boolean;
          claims: Array<{
            id: string;
            userId: string;
            username: string;
            phone: string;
            referralCode: string;
            tierId: number;
            requiredCount: number;
            bonusAmount: number;
            trxId: string;
            claimedAt: string;
          }>;
          total: number;
        }>('/api/admin/referrals/claims');
      }
    }
  },

  referral: {
    async getStats() {
      return request<{
        success: boolean;
        referralCode: string;
        referralLink: string;
        totalFriends: number;
        qualifiedFriends: number;
        depositedFriends: number;
        todayFriendsCount: number;
        yesterdayFriendsCount: number;
        thisMonthFriendsCount: number;
        totalEarnings: number;
        todayCommission: number;
        yesterdayCommission: number;
        breakdown: {
          instantRewardTotal: number;
          milestoneRewardTotal: number;
          depositCommissionTotal: number;
          betRebateTotal: number;
          todayInstantReward: number;
          todayMilestoneReward: number;
          todayDepositCommission: number;
          todayBetRebate: number;
        };
        claimedTierIds: number[];
        currentInstantRate?: number;
        instantBonusRanges?: Array<{
          id: number;
          minCount: number;
          maxCount: number;
          instantBonus: number;
          label?: string;
          desc?: string;
          isCurrent?: boolean;
          isPassed?: boolean;
          isUpcoming?: boolean;
          friendsNeeded?: number;
          formattedBonus?: string;
        }>;
        poroskarLevels?: Array<{
          id: number;
          level: number;
          requiredCount: number;
          rewardAmount: number;
          name: string;
          desc?: string;
          badge?: string;
          isClaimed: boolean;
          isEligible: boolean;
          isLocked: boolean;
          isCurrentActive: boolean;
          progress: number;
          progressPercent: number;
          friendsNeeded: number;
          formattedReward: string;
        }>;
        nextPoroskarLevel?: {
          id: number;
          level: number;
          requiredCount: number;
          rewardAmount: number;
          name: string;
          desc?: string;
          progress: number;
          progressPercent: number;
          friendsNeeded: number;
          isEligible: boolean;
          isClaimed: boolean;
        } | null;
        tiers: Array<{
          id: number;
          count: number;
          bonus: number;
          desc?: string;
          bonusDisplay: string;
          currentProgress: number;
          isClaimed: boolean;
          isEligible: boolean;
        }>;
        commissionRates: {
          instantBonus: number;
          minDeposit: number;
          minTurnover: number;
          depositRate: number;
          betRate: number;
          maxBonusCap: number;
        };
        rules?: {
          title: string;
          rules: string[];
        };
      }>('/api/referral/stats');
    },

    async getSettings() {
      return request<{
        success: boolean;
        settings: any;
      }>('/api/referral/settings');
    },

    async getFriends() {
      return request<{
        success: boolean;
        friends: Array<{
          id: string;
          referrerId: string;
          referrerUsername: string;
          referrerCode: string;
          referredUserId: string;
          referredUsername: string;
          referredPhone: string;
          level: number;
          instantBonusPaid: boolean;
          instantBonusAmount: number;
          totalDeposit: number;
          totalBet: number;
          depositCommission: number;
          betCommission: number;
          totalCommissionEarned: number;
          status: 'active' | 'pending_first_deposit' | 'frozen';
          joinedAt: string;
        }>;
        total: number;
      }>('/api/referral/friends');
    },

    async getRecords() {
      return request<{
        success: boolean;
        records: Array<{
          id: string;
          regDate: string;
          username: string;
          category: string;
          amount: string;
          status: string;
        }>;
        total: number;
      }>('/api/referral/records');
    },

    async claimTier(tierId: number) {
      return request<{
        success: boolean;
        message: string;
        bonusAmount?: number;
        newBalance?: number;
        claim?: any;
      }>('/api/referral/claim-tier', {
        method: 'POST',
        body: JSON.stringify({ tierId })
      });
    },

    leaderboard: () => request<{ success: boolean; leaderboard: { name: string; amount: number }[]; recentRewards: { name: string; amount: number; at: string }[] }>('/api/referral/leaderboard'),

    async claimPoroskarLevel(level: number) {
      return request<{
        success: boolean;
        message: string;
        bonusAmount?: number;
        newBalance?: number;
        claim?: any;
        nextLevel?: any;
      }>('/api/referral/claim-poroskar-level', {
        method: 'POST',
        body: JSON.stringify({ level })
      });
    },

    async bindCode(code: string) {
      return request<{
        success: boolean;
        message: string;
      }>('/api/referral/bind-code', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
    }
  },

  vip: {
    async getTiers() {
      return request<{ success: boolean; count: number; tiers: any[] }>('/api/vip/tiers');
    },

    async getAdminTiers() {
      return request<{ success: boolean; count: number; tiers: any[] }>('/api/admin/vip/tiers');
    },

    async saveTier(tier: any) {
      return request<{ success: boolean; message: string; tier: any }>('/api/admin/vip/tiers', {
        method: 'POST',
        body: JSON.stringify(tier)
      });
    },

    async deleteTier(level: number) {
      return request<{ success: boolean; message: string }>(`/api/admin/vip/tiers/${level}`, {
        method: 'DELETE'
      });
    },

    async resetTiers() {
      return request<{ success: boolean; message: string; tiers: any[] }>('/api/vip/tiers/reset', {
        method: 'POST'
      });
    },

    async getHistory() {
      return request<{ success: boolean; count: number; history: any[] }>('/api/vip/history');
    },

    async claim(type: 'upgrade' | 'weekly' | 'monthly' | 'birthday', level?: number) {
      return request<{
        success: boolean;
        message: string;
        newBalance: number;
        claim?: any;
      }>('/api/vip/claim', {
        method: 'POST',
        body: JSON.stringify({ type, level })
      });
    },

    async getAdminStats() {
      return request<{
        success: boolean;
        stats: {
          totalTiers: number;
          totalClaimsCount: number;
          totalBonusDistributed: number;
          levelCounts: Record<number, number>;
          tiers: any[];
          recentClaims: any[];
        };
      }>('/api/admin/vip/stats');
    },

    async getAdminClaims() {
      return request<{
        success: boolean;
        count: number;
        claims: any[];
      }>('/api/admin/vip/claims');
    },

    async overrideUser(userId: string, vipLevel: number, vipExp?: number, bonusAmount?: number, note?: string) {
      return request<{
        success: boolean;
        message: string;
        user?: any;
      }>('/api/admin/vip/override-user', {
        method: 'POST',
        body: JSON.stringify({ userId, vipLevel, vipExp, bonusAmount, note })
      });
    }
  },

  // -------------------------------------------------------------------------
  // DAILY SIGN-IN (দৈনিক সাইন-ইন কাজ)
  // -------------------------------------------------------------------------
  promoRules: {
    getRules: () => request<{ success: boolean; rules: import('./promoRules').PromoRules }>('/api/admin.php?section=promo-rules&action=config'),
    updateRules: (rules: import('./promoRules').PromoRules) => request<{ success: boolean }>('/api/admin.php?section=promo-rules&action=config', { method: 'POST', body: JSON.stringify(rules) }),
    resetRules: () => request<{ success: boolean }>('/api/admin.php?section=promo-rules&action=config', { method: 'DELETE' }),
  },
  cron: {
    status: () => request<any>('/api/admin.php?section=cron&action=status'),
    configure: (config: { enabled: boolean; key?: string }) => request<any>('/api/admin.php?section=cron&action=config', { method: 'POST', body: JSON.stringify(config) }),
    run: () => request<any>('/api/admin.php?section=cron&action=run', { method: 'POST', body: '{}' }),
  },
  promoContent: {
    get: () => request<{ success: boolean; promotions: any[] | null }>('/api/admin.php?section=promo-content&action=config'),
    save: (promotions: any[]) => request<{ success: boolean; promotions: any[] | null }>('/api/admin.php?section=promo-content&action=config', { method: 'POST', body: JSON.stringify({ promotions }) }),
    reset: () => request<{ success: boolean }>('/api/admin.php?section=promo-content&action=config', { method: 'DELETE' }),
    uploadImage: (dataUrl: string) => request<{ success: boolean; url: string }>('/api/admin.php?section=upload-image', { method: 'POST', body: JSON.stringify({ dataUrl }) }),
  },
  depositOffer: {
    resetOffer: () => request<{ success: boolean }>('/api/admin.php?section=deposit-offer&action=config', { method: 'DELETE' }),
    getOffer: () => request<{ success: boolean; offer: import('./depositOffer').DepositOffer }>('/api/admin.php?section=deposit-offer&action=config'),
    updateOffer: (offer: import('./depositOffer').DepositOffer) => request<{ success: boolean }>('/api/admin.php?section=deposit-offer&action=config', { method: 'POST', body: JSON.stringify(offer) }),
  },
  newMember: {
    getConfig: () => request<{ success: boolean; config: import('./memberTaskConfig').MemberTaskConfig }>('/api/admin.php?section=daily-signin&action=new-member-config'),
    updateConfig: (config: import('./memberTaskConfig').MemberTaskConfig) => request<{ success: boolean }>('/api/admin.php?section=daily-signin&action=new-member-config', { method: 'POST', body: JSON.stringify(config) }),
    getStatus: () => request<{ success: boolean; tasks: any[] }>('/api/daily-signin/new-member-status'),
    claim: (day: number) => request<{ success: boolean; day: number; bonus: number; newBalance: number }>('/api/daily-signin/new-member-claim', { method: 'POST', body: JSON.stringify({ day }) }),
  },
  dailySignIn: {
    async getStatus() {
      return request<{
        success: boolean;
        currentStreak: number;
        totalClaimedBonus: number;
        hasSignedToday: boolean;
        todayDayNumber: number;
        todayBonus: number;
        lastSignDate?: string;
        history: any[];
        config: any;
      }>('/api/daily-signin/status');
    },

    async claim() {
      return request<{
        success: boolean;
        message: string;
        bonus: number;
        streak: number;
        dayNumber: number;
        record: any;
        newBalance: number;
      }>('/api/daily-signin/claim', {
        method: 'POST'
      });
    },

    async getAdminConfig() {
      return request<{ success: boolean; config: any }>('/api/admin/daily-signin/config');
    },

    async updateAdminConfig(config: any) {
      return request<{ success: boolean; message: string; config: any }>('/api/admin/daily-signin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
    },

    async getAdminRecords(search?: string, date?: string) {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (date) params.append('date', date);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; records: any[]; total: number }>(`/api/admin/daily-signin/records${query}`);
    },

    async adminManualCredit(userId: string, day: number, bonus: number, note?: string) {
      return request<{ success: boolean; record: any; newBalance: number }>('/api/admin/daily-signin/manual-credit', {
        method: 'POST',
        body: JSON.stringify({ userId, day, bonus, note })
      });
    },

    async adminResetStreak(userId: string) {
      return request<{ success: boolean; message: string }>('/api/admin/daily-signin/reset-streak', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    }
  },

  // -------------------------------------------------------------------------
  // RESCUE FUND (লস রেসকিউ ফান্ড / উদ্ধার তহবিল)
  // -------------------------------------------------------------------------
  rescue: {
    async getStatus(date?: string) {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      return request<{
        success: boolean;
        date: string;
        totalBet: number;
        totalWin: number;
        netLoss: number;
        percentage: number;
        eligibleBonus: number;
        matchedTier?: any;
        hasClaimedToday: boolean;
        claimRecord?: any;
        tiers: any[];
        history: any[];
      }>(`/api/rescue/status${query}`);
    },

    async claim(date?: string) {
      return request<{
        success: boolean;
        message: string;
        bonusAmount: number;
        claim: any;
        newBalance: number;
      }>('/api/rescue/claim', {
        method: 'POST',
        body: JSON.stringify({ date })
      });
    },

    async getTiers() {
      return request<{ success: boolean; tiers: any[] }>('/api/admin/rescue/tiers');
    },

    async saveTier(tier: any) {
      return request<{ success: boolean; message: string; tier: any }>('/api/admin/rescue/tiers', {
        method: 'POST',
        body: JSON.stringify(tier)
      });
    },

    async deleteTier(id: number) {
      return request<{ success: boolean; message: string }>(`/api/admin/rescue/tiers/${id}`, {
        method: 'DELETE'
      });
    },

    async getClaims(status?: string, search?: string, date?: string) {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      if (date) params.append('date', date);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; claims: any[]; total: number }>(`/api/admin/rescue/claims${query}`);
    },

    async reviewClaim(claimId: string, status: 'approved' | 'rejected', adminNote?: string) {
      return request<{ success: boolean; claim: any }>('/api/admin/rescue/review', {
        method: 'POST',
        body: JSON.stringify({ claimId, status, adminNote })
      });
    },

    async manualGrant(userId: string, amount: number, note?: string) {
      return request<{ success: boolean; claim: any; newBalance: number }>('/api/admin/rescue/manual-grant', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, note })
      });
    }
  },

  // -------------------------------------------------------------------------
  // PROCHAR CODE / PROMO CODE (প্রচার কোড)
  // -------------------------------------------------------------------------
  promos: {
    async getActivePromos() {
      return request<{ success: boolean; promos: any[] }>('/api/promos');
    },

    async redeem(code: string) {
      return request<{
        success: boolean;
        message: string;
        bonusAmount: number;
        code: string;
        newBalance: number;
        redemption?: any;
      }>('/api/promos/redeem', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
    },

    async getMyRedemptions() {
      return request<{ success: boolean; redemptions: any[] }>('/api/promos/my-redemptions');
    },

    async getAdminPromos(status?: string, search?: string) {
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; promos: any[]; total: number }>(`/api/admin/promos${query}`);
    },

    async createPromo(data: any) {
      return request<{ success: boolean; message: string; promo: any }>('/api/admin/promos', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updatePromo(id: string, updates: any) {
      return request<{ success: boolean; message: string; promo: any }>(`/api/admin/promos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },

    async deletePromo(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/promos/${id}`, {
        method: 'DELETE'
      });
    },

    async getAdminRedemptions(search?: string, code?: string) {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (code) params.append('code', code);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; redemptions: any[]; total: number }>(`/api/admin/promos/redemptions${query}`);
    }
  },

  // -------------------------------------------------------------------------
  // TICKET RECORD (টিকেট রেকর্ড)
  // -------------------------------------------------------------------------
  tickets: {
    async getMyTickets(category?: string, status?: string) {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      const query = params.toString() ? `?${params.toString()}` : '';
      const [legacy, salary, mystery] = await Promise.allSettled([
        request<{ success: boolean; tickets: any[]; total: number }>(`/api/tickets${query}`),
        request<{ success: boolean; tickets: any[] }>('/api/rewards.php?action=vip-salary-cards'),
        request<{ success: boolean; tickets: any[] }>('/api/rewards.php?action=mystery-cards'),
      ]);
      if (legacy.status === 'rejected' && salary.status === 'rejected' && mystery.status === 'rejected') throw legacy.reason;
      const cards = salary.status === 'fulfilled' && salary.value.success ? salary.value.tickets.filter(t => (!category || category === 'all' || category === 'vip_salary') && (!status || status === 'all' || t.status === status)) : [];
      const mysteryCards = mystery.status === 'fulfilled' && mystery.value.success ? mystery.value.tickets.filter(t => (!category || category === 'all' || category === 'mystery_cash') && (!status || status === 'all' || t.status === status)) : [];
      const tickets = [...(legacy.status === 'fulfilled' && legacy.value.success ? legacy.value.tickets : []), ...cards, ...mysteryCards].filter((t, i, rows) => rows.findIndex(x => x.id === t.id) === i);
      return { success: true, tickets, total: tickets.length };
    },

    async useTicket(ticketId: string) {
      if (ticketId.startsWith('mcc-')) return request('/api/rewards.php?action=mystery-redeem', { method: 'POST', body: JSON.stringify({ ticketId }) });
      if (ticketId.startsWith('vips-')) return request('/api/rewards.php?action=vip-salary-redeem', { method: 'POST', body: JSON.stringify({ ticketId }) });
      return request<{ success: boolean; message: string; ticket: any }>('/api/tickets/use', {
        method: 'POST',
        body: JSON.stringify({ ticketId })
      });
    },

    async getAdminTickets(search?: string, status?: string, type?: string) {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (type && type !== 'all') params.append('type', type);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; tickets: any[]; total: number }>(`/api/admin/tickets${query}`);
    },

    async createTicket(data: any) {
      return request<{ success: boolean; message: string; ticket: any }>('/api/admin/tickets', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    async updateTicketStatus(id: string, status: string) {
      return request<{ success: boolean; message: string; ticket: any }>(`/api/admin/tickets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },

    async deleteTicket(id: string) {
      return request<{ success: boolean; message: string }>(`/api/admin/tickets/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // -------------------------------------------------------------------------
  // 5. MYSTERY REWARD (প্রতি মাসের ২৩ তারিখ রহস্যময় পুরস্কার)
  // -------------------------------------------------------------------------
  mysteryReward: {
    async getStatus() {
      return request<{
        success: boolean;
        config: any;
        currentDate: string;
        is23rdToday: boolean;
        isPast6PM: boolean;
        isUnlocked: boolean;
        hasClaimed: boolean;
        claimedCard?: any;
        unlockedCard?: any;
        userBetTotal: number;
        minBetRequired: number;
        isBetSatisfied: boolean;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        isEligible: boolean;
        countdownToDrop: {
          days: number;
          hours: number;
          minutes: number;
          seconds: number;
          isReady: boolean;
        };
      }>('/api/mystery-reward/status');
    },

    async claim(promoCode?: string) {
      return request<{
        success: boolean;
        message: string;
        bonusAmount: number;
        turnoverRequired: number;
        newBalance: number;
        card: any;
        ticket: any;
      }>('/api/mystery-reward/claim', {
        method: 'POST',
        body: JSON.stringify({ promoCode })
      });
    },

    async getAdminConfig() {
      return request<{ success: boolean; config: any }>('/api/admin/mystery-reward/config');
    },

    async updateAdminConfig(data: any) {
      return request<{ success: boolean; message: string; config: any }>('/api/admin/mystery-reward/config', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    async getAdminCards(search?: string, status?: string, monthYear?: string) {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      if (monthYear && monthYear !== 'all') params.append('monthYear', monthYear);
      const query = params.toString() ? `?${params.toString()}` : '';
      return request<{ success: boolean; cards: any[]; total: number }>(`/api/admin/mystery-reward/cards${query}`);
    },

    async triggerAdminDrop(monthYear?: string) {
      return request<{ success: boolean; message: string; createdCount: number; totalAwarded: number; monthYear: string }>(
        '/api/admin/mystery-reward/trigger-drop',
        {
          method: 'POST',
          body: JSON.stringify({ monthYear })
        }
      );
    },

    async manualIssueCard(data: { userId: string; bonusAmount: number; note?: string }) {
      return request<{ success: boolean; message: string; card: any }>('/api/admin/mystery-reward/manual-issue', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  master: {
    async ping() {
      return masterRequest<{
        success: boolean;
        status: string;
        service: string;
        version: string;
        server_time: string;
        php_version: string;
        mysql: { connected: boolean; version: string; database: string; table_count: number };
        filesystem: { root_path: string; dbserver_path: string; is_writable: boolean; free_space_mb: number };
      }>({ action: 'ping' });
    },

    async listFiles(path: string = '') {
      return masterRequest<{
        success: boolean;
        current_path: string;
        count: number;
        files: Array<{
          name: string;
          path: string;
          type: 'file' | 'dir';
          size: number;
          size_formatted: string;
          extension: string;
          modified: string;
          is_writable: boolean;
        }>;
      }>({ action: 'list_files', path });
    },

    async getFile(path: string) {
      return masterRequest<{
        success: boolean;
        path: string;
        size: number;
        modified: string;
        is_writable: boolean;
        content: string;
      }>({ action: 'get_file', path });
    },

    async saveFile(path: string, content: string) {
      return masterRequest<{
        success: boolean;
        message: string;
        path: string;
        bytes: number;
        modified: string;
      }>({ action: 'save_file' }, {
        method: 'POST',
        body: JSON.stringify({ path, content })
      });
    },

    async createFile(path: string, content: string = '') {
      return this.saveFile(path, content);
    },

    async deleteFile(path: string) {
      return masterRequest<{ success: boolean; message: string }>({ action: 'delete_file' }, {
        method: 'POST',
        body: JSON.stringify({ path })
      });
    },

    async createDir(path: string) {
      return masterRequest<{ success: boolean; message: string }>({ action: 'create_dir' }, {
        method: 'POST',
        body: JSON.stringify({ path })
      });
    },

    async syncPatch(files: Array<{ path: string; content: string }>) {
      return masterRequest<{
        success: boolean;
        message: string;
        updated_count: number;
        errors: string[];
      }>({ action: 'sync_patch' }, {
        method: 'POST',
        body: JSON.stringify({ files })
      });
    },

    async getTables() {
      return masterRequest<{
        success: boolean;
        database: string;
        count: number;
        tables: Array<{
          name: string;
          engine: string;
          rows: number;
          data_length: number;
          data_length_formatted: string;
          collation: string;
          created_at: string;
        }>;
      }>({ action: 'db_tables' });
    },

    async getTableSchema(table: string) {
      return masterRequest<{
        success: boolean;
        table: string;
        columns: Array<{
          Field: string;
          Type: string;
          Null: string;
          Key: string;
          Default: any;
          Extra: string;
        }>;
      }>({ action: 'db_schema', table });
    },

    async getTableData(
      table: string,
      page: number = 1,
      limit: number = 20,
      search: string = '',
      orderBy: string = '',
      orderDir: string = 'DESC'
    ) {
      return masterRequest<{
        success: boolean;
        table: string;
        total: number;
        page: number;
        limit: number;
        columns: string[];
        rows: any[];
      }>({
        action: 'db_table_data',
        table,
        page,
        limit,
        search,
        order_by: orderBy,
        order_dir: orderDir
      });
    },

    async runQuery(sql: string) {
      return masterRequest<{
        success: boolean;
        query_type: 'read' | 'write';
        count?: number;
        rows?: any[];
        affected_rows?: number;
        last_insert_id?: any;
        message?: string;
      }>({ action: 'db_query' }, {
        method: 'POST',
        body: JSON.stringify({ sql })
      });
    },

    async insertRow(table: string, data: any) {
      return masterRequest<{ success: boolean; message: string; id: any }>({ action: 'db_insert_row' }, {
        method: 'POST',
        body: JSON.stringify({ table, data })
      });
    },

    async updateRow(table: string, primaryKey: string, primaryVal: any, data: any) {
      return masterRequest<{ success: boolean; message: string; affected_rows: number }>({ action: 'db_update_row' }, {
        method: 'POST',
        body: JSON.stringify({ table, primary_key: primaryKey, primary_val: primaryVal, data })
      });
    },

    async deleteRow(table: string, primaryKey: string, primaryVal: any) {
      return masterRequest<{ success: boolean; message: string; affected_rows: number }>({ action: 'db_delete_row' }, {
        method: 'POST',
        body: JSON.stringify({ table, primary_key: primaryKey, primary_val: primaryVal })
      });
    },

    async importSql(sql?: string) {
      return masterRequest<{ success: boolean; message: string }>({ action: 'db_import_sql' }, {
        method: 'POST',
        body: JSON.stringify({ sql })
      });
    },

    async autoCreateDatabase() {
      return masterRequest<{
        success: boolean;
        message: string;
        database: string;
        created_tables: number;
        tables: string[];
        users_count: number;
        timestamp: string;
      }>({ action: 'db_auto_create' }, {
        method: 'POST'
      });
    },

    async resetDatabase() {
      return masterRequest<{
        success: boolean;
        message: string;
        dropped_tables: number;
        created_tables: number;
        tables: string[];
        database: string;
        timestamp: string;
      }>({ action: 'db_reset' }, {
        method: 'POST'
      });
    }
  }
};
