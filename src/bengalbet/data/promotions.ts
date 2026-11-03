// @ts-nocheck
import { Promotion } from '../types';

import promoMystery from '../assets/images/bn_promo_mystery_1790173769456.jpg';
import promoReferral from '../assets/images/bn_promo_invite_1790173787979.jpg';
import promoFirstDeposit from '../assets/images/bn_promo_first_dep_47.jpg';
import promoVipExclusive from '../assets/images/bn_promo_vip_1790173825343.jpg';
import promoDailySlot from '../assets/images/bn_promo_slots_1790173843512.jpg';
import promoAppDownload from '../assets/images/bn_promo_app_1790173858946.jpg';
import promoLossRescue from '../assets/images/bn_promo_rescue_1790173874285.jpg';
import promoGoldenEgg from '../assets/images/bn_promo_egg_1790173893915.jpg';
import promoRedPacket from '../assets/images/bn_promo_packet_1790173911880.jpg';
import promoIphone17 from '../assets/images/bn_promo_iphone_clean_wheel.jpg';
import promoMemberDay from '../assets/images/bn_promo_member_1790173950780.jpg';
import promoRebate from '../assets/images/bn_promo_rebate_1790173969832.jpg';

export const PROMOTIONS_DATA: Promotion[] = [
  {
    id: 'promo-mystery-23',
    titleBn: 'রহস্যময় পুরস্কার প্রতি মাসের ২৩ তারিখ',
    titleEn: 'Mystery Bonus Every 23rd of the Month',
    subtitleBn: 'রহস্যময় বোনাস',
    subtitleEn: 'Exclusive Mystery Cash Drop',
    category: 'hot',
    badge: 'HOT',
    badgeBn: 'হট',
    bannerGradient: 'from-amber-900 via-rose-950 to-emerald-950',
    bannerImage: promoMystery,
    iconType: 'mystery',
    accentColor: '#f59e0b',
    highlightNumber: '৳১,০০০ – ৳৫০,০০০',
    claimableAmount: '৳ ১,০০০ - ৳ ৫০,০০০',
    validUntil: 'প্রতি মাসের ২৩ তারিখ',
    requirementsBn: [
      'মাসের ১ তারিখ থেকে ২২ তারিখ পর্যন্ত মোট ন্যূনতম ৫০০ টাকা বাজি ধরতে হবে।',
      'আপনার অন্তত একটি জমা অনুমোদিত থাকতে হবে।',
      '২৩ তারিখ সন্ধ্যা ৬টায় পুরস্কার কেন্দ্রে নগদ কার্ড আসে; কার্ড খুললে টাকা যোগ হয়।'
    ],
    requirementsEn: [
      'Accumulate a minimum bet turnover of ৳500 from the 1st to 22nd of the month.',
      'At least one approved deposit is required.',
      'A cash card arrives in the Reward Center on the 23rd at 18:00 BST; open it to add the money.'
    ],
    rulesBn: [
      'বোনাসটির সাথে মাত্র ১ গুণ (1x) ভেগারিং টার্নওভার প্রযোজ্য।',
      'কোনো অতিরিক্ত রেজিস্ট্রেশন বা ডিপোজিট স্লিপ লাগবে না।',
      'সমস্ত স্লট ও লাইভ ক্যাসিনো গেমসে ব্যবহারযোগ্য।'
    ],
    rulesEn: [
      '1x Wagering rollover requirement applies to the bonus.',
      'No extra registration required—automated lucky draw.',
      'Applicable on all slots, live casino, and crash games.'
    ],
    actionTextBn: 'বিস্তারিত দেখুন ও ক্লেইম করুন',
    actionTextEn: 'View Details & Check Eligibility',
    actionType: 'claim'
  },
  {
    id: 'promo-referral-300',
    titleBn: '১ জনকে আমন্ত্রণ করুন, আয় করুন ৩০০ টাকা + ০.৭% জমা + ১% বাজি কমিশন',
    titleEn: 'Invite 1 Friend, Earn ৳300 + 0.7% Deposit + 1% Bet',
    subtitleBn: 'বন্ধু আমন্ত্রণ বোনাস ও কমিশন',
    subtitleEn: 'Referral Bonus & Commission',
    category: 'hot',
    badge: 'REFER',
    badgeBn: 'রেফার',
    bannerGradient: 'from-emerald-900 via-teal-950 to-amber-950',
    bannerImage: promoReferral,
    iconType: 'referral',
    accentColor: '#10b981',
    highlightNumber: '৳৩০০ + ০.৭% + ১%',
    claimableAmount: '৳ ৩০০ ইনস্ট্যান্ট',
    validUntil: 'আজীবন কার্যকর',
    requirementsBn: [
      'আপনার ইউনিক রেফারেল লিঙ্ক দিয়ে বন্ধুকে রেজিস্ট্রেশন করান।',
      'বন্ধু কমপক্ষে ৫০০ টাকা ডিপোজিট ও ২০০০ টাকা গেমপ্লে সম্পন্ন করবে।',
      'আপনার নিজের অন্তত একটি জমা অনুমোদিত থাকলে ৩০০ টাকা রেফারেল বোনাস জমা হবে (১ গুণ বাজির শর্ত)।'
    ],
    requirementsEn: [
      'Share your unique referral invite link or QR code.',
      'Friend registers and deposits minimum ৳500 with ৳2,000 turnover.',
      'Instant ৳300 referral cash added to your wallet directly.'
    ],
    rulesBn: [
      'আনলিমিটেড বন্ধুদের আমন্ত্রণ জানাতে পারবেন—কোনো ঊর্ধ্বসীমা নেই।',
      'বন্ধুর প্রতিটি ডিপোজিটের উপর ০.৭% লাইফটাইম কমিশন।',
      'বন্ধুর প্রতিটি বাজির উপর ১% কমিশন প্রতিদিন স্বয়ংক্রিয়ভাবে জমা হবে।'
    ],
    rulesEn: [
      'Unlimited referrals—invite as many friends as you want.',
      '0.7% lifetime deposit commission on all future deposits.',
      '1% daily turnover rebate commission on every friend bet.'
    ],
    actionTextBn: 'বন্ধুকে রেফার করুন',
    actionTextEn: 'Invite Friends Now',
    actionType: 'invite'
  },
  {
    id: 'promo-first-deposit-47',
    titleBn: 'প্রথম জমা বোনাস সর্বোচ্চ ৪৭% পর্যন্ত',
    titleEn: 'First Deposit Bonus up to 47%',
    subtitleBn: 'প্রথম জমায় সর্বোচ্চ ৪৭% পর্যন্ত বোনাস গ্রহণের সুযোগ',
    subtitleEn: 'Welcome Deposit Bonus',
    category: 'new_member',
    badge: 'NEW',
    badgeBn: 'নতুন সদস্য',
    bannerGradient: 'from-blue-950 via-indigo-950 to-emerald-950',
    bannerImage: promoFirstDeposit,
    iconType: 'deposit',
    accentColor: '#3b82f6',
    highlightNumber: '৪৭% বোনাস',
    claimableAmount: 'সর্বোচ্চ ৳ ২০,০০০',
    validUntil: 'নতুন সদস্যদের জন্য',
    requirementsBn: [
      'নতুন একাউন্টের ১ম জমার সময় জমা পেইজে "প্রথম জমা বোনাস" বেছে নিন।',
      'ন্যূনতম ডিপোজিট ৫০০ টাকা (বিকাশ, নগদ, রকেট)।',
      'অ্যাডমিন জমা যাচাই ও অনুমোদন করার পর জমার সাথে বোনাস (৪৭%, সর্বোচ্চ ৳২০,০০০) যোগ হবে।',
    ],
    requirementsEn: [
      'Select First Deposit Bonus during your very 1st wallet recharge.',
      'Minimum deposit amount is ৳500 via bKash, Nagad, or Rocket.',
      'Bonus (47%, max ৳20,000) is credited with your deposit after admin approval.',
    ],
    rulesBn: [
      'বাজির শর্ত: জমা ও বোনাসে সাধারণ ১ গুণ, আর প্রথম জমার বোনাসে অতিরিক্ত ৮ গুণ।',
      'শেষ জমার এক মাস পর উত্তোলন বন্ধ হলে, ব্লকের সময়ের ব্যালেন্সের সমান নতুন জমায় আবার চালু হয়।',
      'প্রতি সদস্য ও প্রতি আইপি অ্যাড্রেসে কেবল একবারই প্রযোজ্য।'
    ],
    rulesEn: [
      'Wagering: 1x on deposits and bonuses, plus an extra 8x on the first deposit bonus.',
      'Withdrawal locks one month after the last deposit; a new deposit equal to the locked balance reopens it.',
      'Strictly 1 claim per player account/IP.'
    ],
    actionTextBn: 'এখনই ডিপোজিট করুন',
    actionTextEn: 'Deposit & Get 47%',
    actionType: 'deposit'
  },
  {
    id: 'promo-vip-exclusive',
    titleBn: 'ভিআইপি এক্সক্লুসিভ সুবিধা ও বোনাস',
    titleEn: 'VIP Exclusive Privileges & Rewards',
    subtitleBn: 'ভিআইপি সদস্যদের জন্য অফার',
    subtitleEn: 'VIP Club Tiers & Gifts',
    category: 'hot',
    badge: 'VIP CLUB',
    badgeBn: 'ভিআইপি ক্লাব',
    bannerGradient: 'from-purple-950 via-slate-900 to-amber-950',
    bannerImage: promoVipExclusive,
    iconType: 'vip',
    accentColor: '#a855f7',
    highlightNumber: 'লেভেল আপগ্রেড + সাপ্তাহিক + মাসিক',
    claimableAmount: '৳ ১,০০,০০০ পর্যন্ত',
    validUntil: 'আজীবন কার্যকর',
    requirementsBn: [
      'গেমপ্লে করে ভিআইপি এক্সপেরিয়েন্স পয়েন্ট (EXP) অর্জন করুন।',
      'প্রতি ৳১ বাজিতে ১ ভিআইপি পয়েন্ট যোগ হবে।',
      'লেভেল ১ থেকে লেভেল ১০ পর্যন্ত ধাপে ধাপে পদোন্নতি।'
    ],
    requirementsEn: [
      'Earn VIP EXP points automatically by playing any real money games.',
      'Get 1 VIP point for every ৳1 wagered.',
      'Climb from VIP 1 to VIP 10 for increasingly prestigious rewards.'
    ],
    rulesBn: [
      'প্রতি লেভেল আপে ইনস্ট্যান্ট ক্যাশ উপহার।',
      'সাপ্তাহিক বেতন প্রতি সোমবার রাত ১২টায় পুরস্কার কেন্দ্রে নগদ কার্ড হিসেবে আসে।',
      'মাসিক বেতন প্রতি মাসের ১ তারিখ দুপুর ৩টায় নগদ কার্ড হিসেবে আসে; কার্ড খুললে ১ গুণ বাজির শর্তে টাকা যোগ হয়।'
    ],
    rulesEn: [
      'Instant upgrade gift on reaching every new VIP rank.',
      'Weekly salary arrives as a cash card every Monday at 00:00.',
      'Monthly salary arrives as a cash card on the 1st at 15:00.'
    ],
    actionTextBn: 'ভিআইপি স্ট্যাটাস দেখুন',
    actionTextEn: 'View VIP Tier Status',
    actionType: 'view'
  },
  {
    id: 'promo-daily-slot-bet',
    titleBn: 'প্রতিদিন স্লট বাজির দৈনিক বোনাস',
    titleEn: 'Daily Slot Betting Cashback Bonus',
    subtitleBn: 'প্রতিদিন স্লট বাজির বোনাস',
    subtitleEn: 'Slots Daily Turnover',
    category: 'rebate',
    badge: 'DAILY',
    badgeBn: 'দৈনিক',
    bannerGradient: 'from-amber-950 via-yellow-950 to-emerald-950',
    bannerImage: promoDailySlot,
    iconType: 'slot',
    accentColor: '#eab308',
    highlightNumber: '৳১৮,৮৮৮ পর্যন্ত',
    claimableAmount: 'প্রতিদিন ৳ ১৮,৮৮৮',
    validUntil: 'প্রতিদিন রাত ১১:৫৯ পর্যন্ত',
    requirementsBn: [
      'JILI, PG Soft, Pragmatic Play স্লটে প্রতিদিনের মোট বাজি ২০০০+ হতে হবে।',
      'টার্নওভার যত বেশি, দৈনিক রিবেট তত বেশি।'
    ],
    requirementsEn: [
      'Play slots from JILI, PG Soft, or Pragmatic Play daily.',
      'Minimum daily slot turnover of ৳2,000 qualifies for tiered cashbacks.'
    ],
    rulesBn: [
      'প্রতিদিন মধ্যরাতে অটো ক্যালকুলেট হয়ে পরের দিন সকাল ৯টায় জমা হয়।',
      'বোনাস উইথড্র করতে মাত্র ১ বার বাজি ধরা আবশ্যক।'
    ],
    rulesEn: [
      'Auto-calculated at 00:00 BST and credited by 09:00 BST next morning.',
      '1x rollover only.'
    ],
    actionTextBn: 'স্লট গেম খেলুন',
    actionTextEn: 'Play Slots Now',
    actionType: 'claim'
  },
  {
    id: 'promo-app-download-52',
    titleBn: 'অ্যাপ ডাউনলোড করুন ও জিতুন ৳৫২ পুরষ্কার',
    titleEn: 'Download BengalBet Official App & Win ৳52 Free',
    subtitleBn: 'অ্যাপ ডাউনলোডের পুরস্কার: ৫২ টাকা',
    subtitleEn: 'App Install Bonus',
    category: 'app_download',
    badge: 'FREE',
    badgeBn: 'ফ্রি নগদ',
    bannerGradient: 'from-emerald-950 via-cyan-950 to-teal-950',
    bannerImage: promoAppDownload,
    iconType: 'app',
    accentColor: '#06b6d4',
    highlightNumber: '৳৫২ ইনস্ট্যান্ট',
    claimableAmount: '৳ ৫২ ফ্রি',
    validUntil: 'সীমিত সময়ের অফার',
    requirementsBn: [
      'BengalBet অফিশিয়াল অ্যান্ড্রয়েড APK বা iOS ওয়েব অ্যাপ ইনস্টল করুন।',
      'অ্যাপ থেকে আপনার অ্যাকাউন্টে লগইন করুন।',
      'নিরাপত্তা সেকশন থেকে নম্বর ও পাসওয়ার্ড ভেরিফাই করুন।'
    ],
    requirementsEn: [
      'Install official BengalBet Android APK or add to Home Screen on iOS.',
      'Login to your account directly via the app.',
      'Verify mobile number to immediately unlock the ৳52 reward.'
    ],
    rulesBn: [
      '১টি ডিভাইসে কেবল ১ বারই এই বোনাস দেওয়া হবে।',
      'বোনাসের ১ গুণ বাজি শেষ করলেই উত্তোলনযোগ্য; আগে একটি জমা অনুমোদিত থাকতে হবে।'
    ],
    rulesEn: [
      'Strictly one claim per unique mobile device ID.',
      'Enjoy 1x turnover only before cashout.'
    ],
    actionTextBn: 'অ্যাপ ডাউনলোড করুন',
    actionTextEn: 'Download App APK',
    actionType: 'download'
  },
  {
    id: 'promo-loss-rescue',
    titleBn: 'ইলেকট্রনিক ও ফিশিং প্রতিদিনের ক্ষতির বোনাস ৳ ৮৮,৮৮৮ পর্যন্ত',
    titleEn: 'Electronic & Fishing Daily Loss Rescue Bonus',
    subtitleBn: 'ক্ষতি পুনরুদ্ধার বোনাস',
    subtitleEn: 'Loss Cashback Rescue',
    category: 'rebate',
    badge: 'RESCUE',
    badgeBn: 'রিকভারি',
    bannerGradient: 'from-rose-950 via-red-950 to-amber-950',
    bannerImage: promoLossRescue,
    iconType: 'cashback',
    accentColor: '#f43f5e',
    highlightNumber: '৳৮৮,৮৮৮ পর্যন্ত',
    claimableAmount: 'সর্বোচ্চ ৳ ৮৮,৮৮৮',
    validUntil: 'প্রতিদিন কার্যকর',
    requirementsBn: [
      'স্লট বা ফিশিং গেমে দিনে ১,০০০ টাকার বেশি লোকসান হলে ক্যাশব্যাক মিলবে।',
      'ক্ষতির পরিমাণের উপর ৩% থেকে ৮% পর্যন্ত রিকভারি ফান্ড।'
    ],
    requirementsEn: [
      'Applies to daily net losses of ৳1,000 or more in Slots and Fishing.',
      'Recovery compensation tiers from 3% up to 8% based on loss amount.'
    ],
    rulesBn: [
      'পরের দিন সকাল ১০টার মধ্যে আপনার রেসকিউ বোনাস ক্লেইম করুন।',
      '১ গুণ বাজি দিয়ে ব্যালেন্স উইথড্র করা যাবে।'
    ],
    rulesEn: [
      'Claim your rescue token before 10:00 BST the following day.',
      'Only 1x wagering required.'
    ],
    actionTextBn: 'ক্যাশব্যাক চেক করুন',
    actionTextEn: 'Check Rescue Cashback',
    actionType: 'claim'
  },
  {
    id: 'promo-golden-egg-18222',
    titleBn: 'প্রতিদিন লগইন করুন সোনার ডিম ভাঙুন জিতুন সর্বোচ্চ ৳ ১৮,২২২',
    titleEn: 'Daily Login Smash Golden Egg Win up to ৳18,222',
    subtitleBn: 'প্রতিদিন লগইন করুন সোনার ডিম ভাঙুন জিতুন সর্বচ্চ...',
    subtitleEn: 'Golden Egg Lucky Smash',
    category: 'deposit',
    badge: 'MINI GAME',
    badgeBn: 'মিনি গেম',
    bannerGradient: 'from-yellow-950 via-amber-900 to-emerald-950',
    bannerImage: promoGoldenEgg,
    iconType: 'golden_egg',
    accentColor: '#f59e0b',
    highlightNumber: '৳১৮,২২২ জ্যাকপট',
    claimableAmount: '৳ ২০ - ৳ ১৮,২২২',
    validUntil: 'প্রতিদিন ১টি ফ্রি হ্যামার',
    requirementsBn: [
      'প্রতিদিন সাইটে লগইন করলেই ১টি ফ্রি হ্যামার (হাতুড়ি) পাবেন।',
      'ডিপোজিট করলে অতিরিক্ত ৩টি পর্যন্ত সোনার ডিম ভাঙার সুযোগ।'
    ],
    requirementsEn: [
      'Receive 1 free golden hammer daily simply by logging in.',
      'Deposit ৳500+ to unlock up to 3 extra golden egg smashes.'
    ],
    rulesBn: [
      'সোনার ডিম ভাঙলে নিশ্চিত নগদ পুরস্কার বা লাকি কয়েন মিলবে।',
      'পুরস্কার সাথে সাথে ওয়ালেটে যোগ হয়, ১ গুণ বাজির শর্তে।'
    ],
    rulesEn: [
      'Every smashed egg contains guaranteed cash prize or lucky spin credits.',
      'Instant payout into player balance with 1x rollover.'
    ],
    actionTextBn: 'সোনার ডিম ভাঙুন',
    actionTextEn: 'Smash Golden Egg',
    actionType: 'spin'
  },
  {
    id: 'promo-red-packet-77777',
    titleBn: 'দৈনিক লগইন রেড প্যাকেট সর্বোচ্চ পুরষ্কার ৳৭৭৭৭৭',
    titleEn: 'Daily Login Red Packet Jackpot up to ৳77,777',
    subtitleBn: 'দৈনিক লগইন ভাগ্যবান বোনাস',
    subtitleEn: 'Red Envelope Cash Drop',
    category: 'hot',
    badge: 'LUCKY DROP',
    badgeBn: 'রেড প্যাকেট',
    bannerGradient: 'from-red-950 via-rose-900 to-amber-950',
    bannerImage: promoRedPacket,
    iconType: 'red_packet',
    accentColor: '#ef4444',
    highlightNumber: '৳৭৭,৭৭৭ সর্বোচ্চ',
    claimableAmount: '৳ ১০ - ৳ ৭৭,৭৭৭',
    validUntil: 'প্রতিদিন ৪টি সেশন',
    requirementsBn: [
      'প্রতিদিন দুপুর ১২টা, বিকেল ৪টা, রাত ৮টা ও রাত ১২টায় রেড প্যাকেট বৃষ্টি শুরু হয়।',
      'কাউন্টডাউন চলাকালীন স্ক্রিনে ট্যাপ করে আপনার খামটি সংগ্রহ করুন।'
    ],
    requirementsEn: [
      'Red packet rain drops daily at 12:00, 16:00, 20:00, and 00:00 BST.',
      'Tap on the dropping envelope packets during the active countdown.'
    ],
    rulesBn: [
      'প্রথম ৫০ জন দ্রুত সংগ্রাহক সর্বোচ্চ ৳৭৭,৭৭৭ পর্যন্ত মেগা জ্যাকপট পাবেন।',
      'সংগ্রহের সাথে সাথেই নগদ টাকা যোগ হবে, ১ গুণ বাজির শর্তে।'
    ],
    rulesEn: [
      'Fastest tappers claim the highest cash bags up to ৳77,777.',
      'Instant credit to wallet with 1x rollover.'
    ],
    actionTextBn: 'রেড প্যাকেট সংগ্রহ করুন',
    actionTextEn: 'Grab Red Packet',
    actionType: 'spin'
  },
  {
    id: 'promo-iphone-17',
    titleBn: 'প্রতিদিন লগইন করুন লাকি হুইল ঘোরান এবং জিতুন আইফোন ১৭',
    titleEn: 'iPhone 17 Pro Max Daily Deposit Lucky Wheel Draw',
    subtitleBn: 'iPhone 17 Pro Max দৈনিক ডিপোজিট ড্র বোনাস.',
    subtitleEn: 'Lucky Spin iPhone 17',
    category: 'deposit',
    badge: 'GRAND PRIZE',
    badgeBn: 'আইফোন ১৭',
    bannerGradient: 'from-indigo-950 via-purple-950 to-pink-950',
    bannerImage: promoIphone17,
    iconType: 'iphone',
    accentColor: '#8b5cf6',
    highlightNumber: 'iPhone 17 Pro Max',
    claimableAmount: 'iPhone 17 / ৳১,৫০,০০০ সমমূল্য',
    validUntil: 'চলতি মাসের শেষ পর্যন্ত',
    requirementsBn: [
      'প্রতিদিন ন্যূনতম ১,০০০ টাকা ডিপোজিট করলে ১টি লাকি হুইল ড্র টিকিট মিলবে।',
      'হুইল ঘুরিয়ে জিতুন ব্র্যান্ড নিউ iPhone 17 Pro Max অথবা নগদ সমমূল্য টাকা।'
    ],
    requirementsEn: [
      'Deposit ৳1,000+ daily to receive 1 Golden Wheel draw ticket.',
      'Spin the prize wheel to win a real iPhone 17 Pro Max or cash equivalent.'
    ],
    rulesBn: [
      'বিজয়ীকে বিডিটি২২২ এর ভিআইপি টিম সরাসরি ফোন করে কুরিয়ারে পৌঁছে দেবে।',
      'চাইলে সমপরিমাণ টাকা নগদ বা বিকাশের মাধ্যমে উত্তোলন করা যাবে।'
    ],
    rulesEn: [
      'Winner contacted directly by VIP manager for doorstep delivery.',
      'Option to receive full cash equivalent directly to Nagad/bKash.'
    ],
    actionTextBn: 'লাকি হুইল স্পিন করুন',
    actionTextEn: 'Spin Lucky Wheel',
    actionType: 'spin'
  },
  {
    id: 'promo-member-day-13',
    titleBn: 'সদস্য দিবস প্রতি মাসের ১৩ তারিখে সদস্যপ্রতি সর্বোচ্চ ৳১,০০,০০০',
    titleEn: 'Super Member Day 13th — up to ৳1,00,000 per member',
    subtitleBn: 'সদস্য দিবস প্রতি মাসের ১৩ তারিখে',
    subtitleEn: 'Member Super Day 13th',
    category: 'hot',
    badge: 'MEGA EVENT',
    badgeBn: 'মেগা ইভেন্ট',
    bannerGradient: 'from-amber-950 via-rose-950 to-emerald-950',
    bannerImage: promoMemberDay,
    iconType: 'member_day',
    accentColor: '#fbbf24',
    highlightNumber: 'সর্বোচ্চ ৳১,০০,০০০',
    claimableAmount: '৳ ৫,০০০ - ৳ ১,০০,০০০',
    validUntil: 'প্রতি মাসের ১৩ তারিখ',
    requirementsBn: [
      'মাসের ১ থেকে ১২ তারিখের মধ্যে সক্রিয় খেলোয়াড়দের জন্য উন্মুক্ত।',
      '১৩ তারিখে লগইন করে মেগা প্রাইজ পুলে অংশগ্রহণ করুন।'
    ],
    requirementsEn: [
      'Open to all active players active between the 1st and 12th.',
      'Login on the 13th to grab your share of the mega prize pool.'
    ],
    rulesBn: [
      'সমস্ত বোনাস স্বয়ংক্রিয়ভাবে প্রদান করা হয়।',
      'মাত্র ১ গুণ টার্নওভার শর্ত প্রযোজ্য।'
    ],
    rulesEn: [
      'Automated distribution at 13:13 BST on the 13th.',
      'Only 1x rollover requirement.'
    ],
    actionTextBn: 'ইভেন্টে যোগ দিন',
    actionTextEn: 'Join Member Day Event',
    actionType: 'claim'
  },
  {
    id: 'promo-realtime-rebate-3',
    titleBn: 'রিয়েল টাইম রিবেট ইনস্ট্যান্ট বোনাস ৩% পর্যন্ত',
    titleEn: 'Real-Time Instant Bet Rebate up to 3%',
    subtitleBn: 'রিয়েল টাইম রিবেট ইনস্ট্যান্ট বোনাস ৩% পর্যন্ত।',
    subtitleEn: 'Instant Bet Rebate',
    category: 'rebate',
    badge: 'UNLIMITED',
    badgeBn: 'আনলিমিটেড',
    bannerGradient: 'from-emerald-950 via-teal-900 to-green-950',
    bannerImage: promoRebate,
    iconType: 'rebate',
    accentColor: '#22c55e',
    highlightNumber: '৩% পর্যন্ত',
    claimableAmount: 'প্রতি মিনিটে ইনস্ট্যান্ট',
    validUntil: 'সর্বদা সক্রিয়',
    requirementsBn: [
      'স্লট, লাইভ ক্যাসিনো, বাজি ও স্পোর্টসে যেকোনো রিয়েল মানি বেট ধরুন।',
      'জিতুন বা হারুন—প্রতিটি বাজির উপর সাথে সাথে ৩% পর্যন্ত রিবেট পাবেন।'
    ],
    requirementsEn: [
      'Place any real money wager on Slots, Live Casino, Cricket, or Crash.',
      'Win or lose—receive up to 3% instant rebate calculation in real-time.'
    ],
    rulesBn: [
      'কোনো অপেক্ষার প্রয়োজন নেই—ক্লিক করলেই ইনস্ট্যান্ট ওয়ালেটে রিলিজ।',
      'রিবেটে ১ গুণ বাজির শর্ত, তারপর উত্তোলনযোগ্য।'
    ],
    rulesEn: [
      'Zero wait time—click "One-Key Claim" anytime.',
      '1x wagering, then withdrawable.'
    ],
    actionTextBn: 'রিবেট ক্লেইম করুন',
    actionTextEn: 'Claim Instant Rebate',
    actionType: 'claim'
  },
  {
    id: 'promo-terms-conditions',
    titleBn: 'BengalBet প্রচারের নিয়ম ও সাধারণ শর্তাবলী',
    titleEn: 'BengalBet Promotional Rules & General Terms',
    subtitleBn: 'BengalBet অফিসিয়াল নীতি',
    subtitleEn: 'BengalBet Official Guidelines',
    category: 'hot',
    badge: 'POLICY',
    badgeBn: 'পলিসি',
    bannerGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    bannerImage: '',
    iconType: 'terms',
    accentColor: '#e2e8f0',
    highlightNumber: 'BengalBet পলিসি',
    claimableAmount: 'স্বচ্ছ নীতি',
    validUntil: 'সর্বদা প্রযোজ্য',
    requirementsBn: [
      'সকল সদস্যের বয়স ১৮ বছর বা তার বেশি হতে হবে।',
      'BengalBet-এ প্রতি ব্যক্তি, মোবাইল নম্বর, আইপি অ্যাড্রেসে কেবল একটি একাউন্ট অনুমোদিত।'
    ],
    requirementsEn: [
      'All participants must be strictly 18 years of age or older.',
      'Strictly one BengalBet account per person, phone number, device, and IP address.'
    ],
    rulesBn: [
      'যেকোনো প্রকার মাল্টিপল একাউন্ট বা সিস্টেম অপব্যবহার কঠোরভাবে নিষিদ্ধ।',
      'BengalBet যেকোনো সময় প্রচার সংশোধন বা শেষ করার চূড়ান্ত অধিকার সংরক্ষণ করে।'
    ],
    rulesEn: [
      'Syndicate play, arbitrage, or multi-accounting results in immediate forfeiture.',
      'BengalBet reserves the right to amend promo terms at its sole discretion.'
    ],
    actionTextBn: 'পূর্ণাঙ্গ শর্তাবলী পড়ুন',
    actionTextEn: 'Read Full Terms',
    actionType: 'view'
  }
];

