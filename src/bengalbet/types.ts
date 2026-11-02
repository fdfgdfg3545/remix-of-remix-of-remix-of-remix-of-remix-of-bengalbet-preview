// @ts-nocheck
export type Language = 'bn' | 'en';

export type MainNavTab = 'offers' | 'missions' | 'spin' | 'redpacket' | 'vip' | 'share' | 'lobby';

export type GameCategory = 'all' | 'hot' | 'slot' | 'live' | 'fishing' | 'poker' | 'table' | 'sports' | 'esports' | 'cockfight' | 'lottery' | 'crash' | 'arcade';

export interface Promotion {
  id: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  category: 'all' | 'hot' | 'new_member' | 'deposit' | 'rebate' | 'app_download';
  badge?: string;
  badgeBn?: string;
  bannerImage: string;
  bannerGradient: string;
  iconType: 'mystery' | 'referral' | 'deposit' | 'vip' | 'slot' | 'app' | 'cashback' | 'golden_egg' | 'red_packet' | 'iphone' | 'member_day' | 'rebate' | 'terms';
  accentColor: string;
  highlightNumber?: string;
  validUntil?: string;
  claimableAmount?: string;
  requirementsBn: string[];
  requirementsEn: string[];
  rulesBn: string[];
  rulesEn: string[];
  actionTextBn: string;
  actionTextEn: string;
  actionType: 'claim' | 'deposit' | 'spin' | 'invite' | 'download' | 'view';
}

export interface GameItem {
  id: string;
  name: string;
  nameBn?: string;
  provider: string;
  category: GameCategory;
  image: string;
  isHot?: boolean;
  isNew?: boolean;
  jackpot?: number;
  rtp?: number;
  playersCount?: number;
  volatility?: 'Low' | 'Medium' | 'High' | 'Extreme';
}

export interface UserAccount {
  id?: string;
  isLoggedIn: boolean;
  username: string;
  phone: string;
  balance: number;
  vipLevel: number;
  vipExp: number;
  vipMaxExp: number;
  freeSpins: number;
  redPacketsAvailable: number;
  goldenEggsAvailable: number;
  unreadNotifications: number;
  avatar: string;
  email?: string;
  referralCode: string;
  totalEarnings: number;
  referredFriendsCount: number;
  realName?: string;
  birthday?: string;
  transactionPassword?: string;
  hasTransactionPassword?: boolean;
  lastLoginIp?: string;
  securityScore?: number;
  status?: 'active' | 'frozen' | 'banned' | string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  lastLogin?: string;
  password?: string;
}

export interface Mission {
  id: string;
  titleBn: string;
  titleEn: string;
  rewardBn: string;
  rewardAmount: number;
  progress: number;
  total: number;
  isClaimed: boolean;
  type: 'daily_login' | 'bet_amount' | 'deposit' | 'invite' | 'slot_rounds';
}

export interface SpinPrize {
  id: number;
  labelBn: string;
  labelEn: string;
  amount: number;
  type: 'cash' | 'spins' | 'iphone' | 'bonus' | 'ticket';
  color: string;
  textColor: string;
  probability: number;
}

export interface PaymentChannel {
  id: 'bkash' | 'nagad' | 'rocket' | 'usdt';
  name: string;
  nameBn: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  feePercent: number;
  color: string;
  accountNumber: string;
  iconBg: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName?: string;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber?: string;
  userId: string;
  username?: string;
  type: string;
  subject?: string;
  content: string;
  contact?: string;
  priority?: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'replied' | 'resolved' | 'closed';
  reply?: string;
  messages?: SupportTicketMessage[];
  createdAt: string;
  updatedAt?: string;
}

export interface GameEngineSettings {
  globalRtp: number; // 0 to 100
  engineMode: 'normal' | 'drain' | 'generous' | 'jackpot_frenzy' | 'custom';
  volatility: 'low' | 'medium' | 'high' | 'extreme';
  maxMultiplierCap: number;
  nearMissRate: number; // 0 to 100
  dynamicBalancing: boolean;
  categoryRtp: {
    crash: number;
    slot: number;
    table: number;
    fishing: number;
    arcade: number;
  };
  gameRtp: Record<string, number>;
  forceOutcome: 'none' | 'always_win' | 'always_lose' | 'big_win_next';
  telemetry: {
    totalWagered: number;
    totalPayout: number;
    totalRounds: number;
    lastResetTime: string;
  };
}

export interface VipTierConfig {
  level: number;
  name: string;
  badgeType: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'crown';
  targetBet: number;
  targetBetDisplay?: string;
  depositTarget: number;
  upgradeBonus: number;
  weeklyBonus: number;
  monthlyBonus: number;
  birthdayBonus?: number;
  slotRebate?: number;
  liveRebate?: number;
  description?: string;
  perks?: string[];
  status?: 'active' | 'inactive';
  updatedAt?: string;
}

export interface VipRewardRecord {
  id: string;
  userId: string;
  username?: string;
  level: number;
  type: 'upgrade' | 'weekly' | 'monthly' | 'birthday' | 'custom';
  eventName: string;
  bonus: number;
  points: number;
  ticketName: string;
  date: string;
  timestamp: number;
  status: 'claimed' | 'completed';
}

// ----------------------------------------------------
// DAILY SIGN-IN (দৈনিক সাইন-ইন কাজ)
// ----------------------------------------------------
export interface DailySignInRecord {
  id: string;
  userId: string;
  username: string;
  day: number;
  bonus: number;
  date: string; // YYYY-MM-DD
  claimedAt: string;
  streak: number;
  vipMultiplier?: number;
  status: 'claimed';
  note?: string;
}

export interface DailySignInDayConfig {
  day: number;
  bonus: number;
  requiredBet: number;
  labelBn?: string;
  icon?: string;
  isSpecial?: boolean;
}

export interface DailySignInConfig {
  enabled: boolean;
  cycleDays: number;
  dailyRequiredBet?: number;
  days: DailySignInDayConfig[];
  vipBonusPercent: Record<number, number>;
  rulesTitle: string;
  rulesList: string[];
}

export interface UserDailySignInState {
  currentStreak: number;
  totalClaimedBonus: number;
  hasSignedToday: boolean;
  todayDayNumber: number;
  todayBonus: number;
  lastSignDate?: string;
  history: DailySignInRecord[];
  config: DailySignInConfig;
}

// ----------------------------------------------------
// RESCUE FUND (লস রেসকিউ ফান্ড / উদ্ধার তহবিল)
// ----------------------------------------------------
export interface RescueTierRecord {
  id: number;
  minLoss: number;
  percentage: number;
  maxBonus: number;
  nameBn: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface RescueClaimRecord {
  id: string;
  userId: string;
  username: string;
  date: string; // YYYY-MM-DD
  totalBet: number;
  totalWin: number;
  netLoss: number;
  percentage: number;
  bonusAmount: number;
  status: 'claimed' | 'approved' | 'rejected' | 'pending';
  claimedAt: string;
  adminNote?: string;
}

export interface UserRescueStatus {
  date: string;
  totalBet: number;
  totalWin: number;
  netLoss: number;
  percentage: number;
  eligibleBonus: number;
  matchedTier?: RescueTierRecord;
  hasClaimedToday: boolean;
  claimRecord?: RescueClaimRecord;
  tiers: RescueTierRecord[];
  history: RescueClaimRecord[];
}

// ----------------------------------------------------
// PROCHAR CODE / PROMO CODE (প্রচার কোড / রিডিম ভাউচার)
// ----------------------------------------------------
export interface PromoCodeRecord {
  id: string;
  code: string;
  title: string;
  type: 'fixed_cash' | 'percentage' | 'free_spins';
  amount: number;
  minVipLevel: number;
  maxUsageCount: number;
  currentUsageCount: number;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PromoRedemptionRecord {
  id: string;
  promoId: string;
  code: string;
  userId: string;
  username: string;
  bonusAmount: number;
  redeemedAt: string;
}

// ----------------------------------------------------
// TICKET RECORD (টিকেট রেকর্ড / কুপন ও ভাউচার টিকিট)
// ----------------------------------------------------
export interface UserTicketRecord {
  id: string;
  userId: string;
  username: string;
  name: string;
  type: string;
  usedTime?: string;
  productName: string;
  redeemCode: string;
  amount: string;
  amountNumber?: number;
  status: 'active' | 'used' | 'claimed' | 'expired';
  targetAction: 'temu_chest' | 'signin' | 'spin' | 'golden_egg' | 'red_envelope' | 'rescue' | 'promo' | 'mystery';
  dateCategory: 'today' | 'yesterday' | '7days' | 'older';
  createdAt: string;
}

// ----------------------------------------------------
// MYSTERY REWARD / CASH CARD (প্রতি মাসের ২৩ তারিখ রহস্যময় পুরস্কার)
// ----------------------------------------------------
export interface MysteryRewardConfig {
  enabled: boolean;
  dayOfMonth: number; // 23
  triggerHour: number; // 18 (সন্ধ্যা ৬টা)
  minBonus: number; // 1000
  maxBonus: number; // 50000
  promoCode: string; // 'BENGALBETVIP'
  minBetRequired: number; // 500
  betStartDateDay: number; // 1
  betEndDateDay: number; // 22
  turnoverMultiplier: number; // 1 (1x)
  requireVerifiedEmailPhone: boolean; // true
  title: string;
  description: string;
  terms: string[];
}

export interface MysteryCashCardRecord {
  id: string;
  userId: string;
  username: string;
  monthYear: string; // e.g. '2026-09'
  bonusAmount: number;
  promoCodeUsed?: string;
  cardCode?: string;
  voucherCode?: string;
  turnoverMultiplier?: number;
  month?: number | string;
  year?: number | string;
  status: 'unlocked' | 'claimed' | 'expired';
  eligible: boolean;
  userBetAmount: number;
  unlockedAt: string;
  claimedAt?: string;
  turnoverRequired: number;
  turnoverCompleted: number;
  ticketCode: string;
  note?: string;
}

export interface UserMysteryRewardStatus {
  config: MysteryRewardConfig;
  currentDate: string;
  is23rdToday: boolean;
  isPast6PM: boolean;
  isUnlocked: boolean;
  hasClaimed: boolean;
  claimedCard?: MysteryCashCardRecord;
  unlockedCard?: MysteryCashCardRecord;
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
}


