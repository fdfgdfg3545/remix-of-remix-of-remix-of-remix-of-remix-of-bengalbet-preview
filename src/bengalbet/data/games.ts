// @ts-nocheck
import { GameItem, GameCategory } from '../types';
import headTailIcon from '../assets/images/head_tail_icon_1789325177529.jpg';
import superAce2Icon from '../assets/images/super_ace_2_icon_1789325204493.jpg';
import fortuneGems3Icon from '../assets/images/fortune_gems_3_1789325632226.jpg';
import boxingKingIcon from '../assets/images/boxing_king_icon_1789325912862.jpg';
import superElements2Icon from '../assets/images/super_elements_2_icon_1789326156273.jpg';
import wildBountyThumb from '../assets/images/wild_bounty_showdown_1789326457687.jpg';
import happyFishingIcon from '../assets/images/happy_fishing_icon_1789326697876.jpg';
import fortuneTreeIcon from '../assets/images/fortune_tree_icon_1789326882984.jpg';
import alibabaCaveIcon from '../assets/images/alibaba_cave_icon_1789327670216.jpg';
import crazy777Icon from '../assets/images/crazy_777_icon_1789328037942.jpg';
import sevenCoinsIcon from '../assets/images/seven_coins_icon_1789328050971.jpg';
import anubisWrathIcon from '../assets/images/anubis_wrath_icon_1789328514214.jpg';
import pinataWinsIcon from '../assets/images/pinata_wins_icon_1789328528210.jpg';
import moneyComingIcon from '../assets/images/money_coming_icon_1789330321878.jpg';
import magicAceIcon from '../assets/images/magic_ace_icon_1789330338430.jpg';
import sweetBonanzaIcon from '../assets/images/sweet_bonanza_icon_1789330361177.jpg';
import treasuresAztecIcon from '../assets/images/treasures_aztec_icon_1789330776428.jpg';
import circusJokerIcon from '../assets/images/circus_joker_icon_1789330788237.jpg';
import gatesOlympusIcon from '../assets/images/gates_olympus_icon_1789330801506.jpg';

export const MONEY_COMING_GAME: GameItem = {
  id: 'game-money-coming',
  name: 'Money Coming',
  nameBn: 'মানি কামিং',
  provider: 'JILI',
  category: 'slot',
  image: moneyComingIcon,
  isHot: true,
  isNew: true,
  jackpot: 15500000,
  rtp: 97.8,
  playersCount: 46800,
  volatility: 'High'
};

export const MAGIC_ACE_GAME: GameItem = {
  id: 'game-magic-ace',
  name: 'Magic Ace',
  nameBn: 'ম্যাজিক এস (ওয়াইল্ড লক)',
  provider: 'JILI',
  category: 'slot',
  image: magicAceIcon,
  isHot: true,
  isNew: true,
  jackpot: 18200000,
  rtp: 97.6,
  playersCount: 51200,
  volatility: 'Extreme'
};

export const SWEET_BONANZA_GAME: GameItem = {
  id: 'game-sweet-bonanza',
  name: 'Sweet Bonanza',
  nameBn: 'সুইট বোনানজা (ক্যান্ডি)',
  provider: 'Pragmatic Play',
  category: 'slot',
  image: sweetBonanzaIcon,
  isHot: true,
  isNew: true,
  jackpot: 24500000,
  rtp: 96.6,
  playersCount: 58900,
  volatility: 'High'
};

export const TREASURES_OF_AZTEC_GAME: GameItem = {
  id: 'game-treasures-aztec',
  name: 'Treasures of Aztec',
  nameBn: 'ট্রেজার্স অফ আজটেক (PG Soft)',
  provider: 'Pocket Games Soft',
  category: 'slot',
  image: treasuresAztecIcon,
  isHot: true,
  isNew: true,
  jackpot: 28500000,
  rtp: 96.71,
  playersCount: 48900,
  volatility: 'High'
};

export const GATES_OF_OLYMPUS_GAME: GameItem = {
  id: 'game-gates-of-olympus',
  name: 'Gates of Olympus',
  nameBn: 'গেটস অফ অলিম্পাস (জিউস)',
  provider: 'Pragmatic Play',
  category: 'slot',
  image: gatesOlympusIcon,
  isHot: true,
  isNew: true,
  jackpot: 32000000,
  rtp: 96.5,
  playersCount: 64200,
  volatility: 'Extreme'
};

export const CIRCUS_JOKER_GAME: GameItem = {
  id: 'game-circus-joker',
  name: 'Circus Joker 4096',
  nameBn: 'সার্কাস জোকার ৪০৯৬ (JILI)',
  provider: 'JILI',
  category: 'slot',
  image: circusJokerIcon,
  isHot: true,
  isNew: true,
  jackpot: 16800000,
  rtp: 96.5,
  playersCount: 38400,
  volatility: 'Medium'
};

export const AVIATOR_GAME: GameItem = {
  id: 'game-aviator',
  name: 'Aviator',
  nameBn: 'এভিয়েটর',
  provider: 'Spribe',
  category: 'crash',
  image: 'https://images.33089393.com/TCG_GAME_ICONS/SPB/EN/SPB002.avif',
  isHot: true,
  isNew: false,
  jackpot: 8900000,
  rtp: 97.0,
  playersCount: 32840,
  volatility: 'Extreme'
};

export const SUPER_ACE_GAME: GameItem = {
  id: 'game-super-ace',
  name: 'Super Ace',
  nameBn: 'সুপার এস',
  provider: 'JILI',
  category: 'slot',
  image: 'https://images.33089393.com/TCG_GAME_ICONS/JL/EN/JL0033.avif',
  isHot: true,
  isNew: false,
  jackpot: 12500000,
  rtp: 97.4,
  playersCount: 28450,
  volatility: 'High'
};

export const SUPER_ACE_2_GAME: GameItem = {
  id: 'game-super-ace-2',
  name: 'Super Ace II',
  nameBn: 'সুপার এস ১১ (II)',
  provider: 'JILI',
  category: 'slot',
  image: superAce2Icon,
  isHot: true,
  isNew: true,
  jackpot: 16800000,
  rtp: 97.8,
  playersCount: 39400,
  volatility: 'High'
};

export const SUPER_ACE_DELUXE_GAME: GameItem = {
  id: 'game-super-ace-deluxe',
  name: 'Super Ace Deluxe',
  nameBn: 'সুপার এস ডিলাক্স',
  provider: 'JILI',
  category: 'slot',
  image: 'https://images.33089393.com/TCG_GAME_ICONS/JL/EN/JL0033.avif',
  isHot: true,
  isNew: true,
  jackpot: 18500000,
  rtp: 97.9,
  playersCount: 34200,
  volatility: 'High'
};

export const HEAD_TAIL_GAME: GameItem = {
  id: 'game-head-tail',
  name: 'Head & Tail',
  nameBn: 'হেড অ্যান্ড টেল',
  provider: 'JILI',
  category: 'poker',
  image: headTailIcon,
  isHot: true,
  isNew: true,
  jackpot: 9500000,
  rtp: 98.0,
  playersCount: 31200,
  volatility: 'Medium'
};

export const FORTUNE_GEMS_3_GAME: GameItem = {
  id: 'game-fortune-gems-3',
  name: 'Fortune Gems 3',
  nameBn: 'ফরচুন জেমস ৩',
  provider: 'JILI',
  category: 'slot',
  image: fortuneGems3Icon,
  isHot: true,
  isNew: true,
  jackpot: 4950000,
  rtp: 98.1,
  playersCount: 29400,
  volatility: 'Medium'
};

export const FORTUNE_GEMS_2_GAME: GameItem = {
  id: 'game-fortune-gems-2',
  name: 'Fortune Gems 2',
  nameBn: 'ফরচুন জেমস ২',
  provider: 'JILI',
  category: 'slot',
  image: fortuneGems3Icon,
  isHot: true,
  isNew: false,
  jackpot: 7400000,
  rtp: 97.6,
  playersCount: 18600,
  volatility: 'Medium'
};

export const BOXING_KING_GAME: GameItem = {
  id: 'game-boxing-king',
  name: 'Boxing King',
  nameBn: 'বক্সিং কিং',
  provider: 'JILI',
  category: 'slot',
  image: boxingKingIcon,
  isHot: true,
  isNew: true,
  jackpot: 14800000,
  rtp: 97.5,
  playersCount: 42500,
  volatility: 'Medium'
};

export const SUPER_ELEMENTS_2_GAME: GameItem = {
  id: 'game-super-elements-2',
  name: 'Super Elements 2',
  nameBn: 'সুপার এলিমেন্টস ২',
  provider: 'FA CHAI Gaming',
  category: 'slot',
  image: superElements2Icon,
  isHot: true,
  isNew: true,
  jackpot: 12500000,
  rtp: 96.5,
  playersCount: 38900,
  volatility: 'Medium'
};

export const WILD_BOUNTY_SHOWDOWN_GAME: GameItem = {
  id: 'game-wild-bounty',
  name: 'Wild Bounty Showdown',
  nameBn: 'ওয়াইল্ড বাউন্টি শোডাউন',
  provider: 'Pocket Games Soft',
  category: 'slot',
  image: wildBountyThumb,
  isHot: true,
  isNew: true,
  jackpot: 18500000,
  rtp: 96.75,
  playersCount: 45200,
  volatility: 'High'
};

export const HAPPY_FISHING_GAME: GameItem = {
  id: 'game-happy-fishing',
  name: 'Happy Fishing',
  nameBn: 'হ্যাপি ফিশিং',
  provider: 'JILI',
  category: 'fishing',
  image: happyFishingIcon,
  isHot: true,
  isNew: true,
  jackpot: 15400000,
  rtp: 97.1,
  playersCount: 42100,
  volatility: 'Medium'
};

export const FORTUNE_TREE_GAME: GameItem = {
  id: 'game-fortune-tree',
  name: 'Fortune Tree',
  nameBn: 'ফরচুন ট্রি',
  provider: 'JILI',
  category: 'slot',
  image: fortuneTreeIcon,
  isHot: true,
  isNew: true,
  jackpot: 5100000,
  rtp: 97.3,
  playersCount: 27800,
  volatility: 'High'
};

export const ALIBABA_CAVE_GAME: GameItem = {
  id: 'game-alibaba',
  name: "Alibaba's Cave of Fortune",
  nameBn: "আলিবাবা'স কেভ অফ ফরচুন",
  provider: 'Pocket Games Soft',
  category: 'slot',
  image: alibabaCaveIcon,
  isHot: true,
  isNew: true,
  jackpot: 4900000,
  rtp: 97.0,
  playersCount: 31100,
  volatility: 'High'
};

export const CRAZY_777_GAME: GameItem = {
  id: 'game-crazy-777',
  name: 'Crazy 777',
  nameBn: 'ক্রেজি৭৭৭',
  provider: 'JILI',
  category: 'slot',
  image: crazy777Icon,
  isHot: true,
  isNew: true,
  jackpot: 9200000,
  rtp: 98.4,
  playersCount: 41800,
  volatility: 'Extreme'
};

export const SEVEN_COINS_GAME: GameItem = {
  id: 'game-777-coins',
  name: '777 Coins',
  nameBn: '777 কয়েন',
  provider: 'BNG',
  category: 'slot',
  image: sevenCoinsIcon,
  isHot: true,
  isNew: true,
  jackpot: 9900000,
  rtp: 98.6,
  playersCount: 39400,
  volatility: 'High'
};

export const ANUBIS_GAME: GameItem = {
  id: 'game-anubis',
  name: 'Anubis Wrath',
  nameBn: 'আনুবিস এর ক্রোধ',
  provider: 'Pocket Games Soft',
  category: 'slot',
  image: anubisWrathIcon,
  isHot: true,
  isNew: true,
  jackpot: 9500000,
  rtp: 96.75,
  playersCount: 48600,
  volatility: 'High'
};

export const PINATA_WINS_GAME: GameItem = {
  id: 'game-pinata-wins',
  name: 'Piñata Wins',
  nameBn: 'পিনাটা উইনস',
  provider: 'Pocket Games Soft',
  category: 'slot',
  image: pinataWinsIcon,
  isHot: true,
  isNew: true,
  jackpot: 8800000,
  rtp: 96.75,
  playersCount: 43200,
  volatility: 'Medium'
};

export const GAMES_DATA: GameItem[] = [
  // ================= 1. POPULAR & HOT SLOTS (জনপ্রিয় স্লট) =================
  SUPER_ACE_GAME,
  SUPER_ACE_2_GAME,
  SUPER_ACE_DELUXE_GAME,
  SWEET_BONANZA_GAME,
  GATES_OF_OLYMPUS_GAME,
  TREASURES_OF_AZTEC_GAME,
  CIRCUS_JOKER_GAME,
  MONEY_COMING_GAME,
  MAGIC_ACE_GAME,
  FORTUNE_GEMS_3_GAME,
  FORTUNE_GEMS_2_GAME,
  BOXING_KING_GAME,
  SUPER_ELEMENTS_2_GAME,
  WILD_BOUNTY_SHOWDOWN_GAME,
  FORTUNE_TREE_GAME,
  ALIBABA_CAVE_GAME,
  CRAZY_777_GAME,
  SEVEN_COINS_GAME,
  ANUBIS_GAME,
  PINATA_WINS_GAME,
  {
    id: 'slot-flyx',
    name: 'FlyX',
    nameBn: 'ফ্লাইএক্স',
    provider: 'Micro Gaming',
    category: 'slot',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.0,
    playersCount: 13200
  },

  // ================= 2. CRASH GAMES (ক্র্যাশ) =================
  AVIATOR_GAME,

  // ================= 3. LIVE CASINO (লাইভ) =================
  {
    id: 'live-evolution',
    name: 'Evolution Live Studio',
    nameBn: 'Evolution',
    provider: 'Evolution',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 99.2,
    playersCount: 42100
  },
  {
    id: 'live-pp',
    name: 'Pragmatic Play Live',
    nameBn: 'PP',
    provider: 'PP',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.9,
    playersCount: 31200
  },
  {
    id: 'live-sexy-casino',
    name: 'AE Sexy Live Casino',
    nameBn: 'SEXY CASINO',
    provider: 'SEXY CASINO',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.8,
    playersCount: 28900
  },
  {
    id: 'live-microgaming',
    name: 'Microgaming Live',
    nameBn: 'Micro Gaming',
    provider: 'Micro Gaming',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 98.5,
    playersCount: 16400
  },
  {
    id: 'live-via-casino',
    name: 'VIA Casino Live',
    nameBn: 'VIA CASINO',
    provider: 'VIA CASINO',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 98.4,
    playersCount: 14300
  },
  {
    id: 'live-w-casino',
    name: 'W Casino Live Studio',
    nameBn: 'W Casino',
    provider: 'W Casino',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 98.2,
    playersCount: 11900
  },
  {
    id: 'live-ezugi',
    name: 'Ezugi Live Studio',
    nameBn: 'Ezugi',
    provider: 'Ezugi',
    category: 'live',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.7,
    playersCount: 22700
  },

  // ================= 4. FISHING (ফিশিং) =================
  HAPPY_FISHING_GAME,
  {
    id: 'fish-fortune-king',
    name: 'Fortune King Jackpot',
    nameBn: 'ফরচুন কিং জ্যাক...',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.4,
    playersCount: 18900
  },
  {
    id: 'fish-jackpot-fishing',
    name: 'Jackpot Fishing',
    nameBn: 'জ্যাকপট ফিশিং',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.5,
    playersCount: 14800
  },
  {
    id: 'fish-fruit-jackpot',
    name: 'Fruit Jackpot Shoot & Win',
    nameBn: 'ফ্রুট জ্যাকপট ...',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.9,
    playersCount: 8700
  },
  {
    id: 'fish-ocean-king',
    name: 'Ocean King Jackpot',
    nameBn: 'ওশান কিং জ্যাক...',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.2,
    playersCount: 16200
  },
  {
    id: 'fish-mega-fishing',
    name: 'Mega Fishing',
    nameBn: 'মেগা ফিশিং',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.0,
    playersCount: 19400
  },
  {
    id: 'fish-circus-jackpot',
    name: 'Circus Jackpot',
    nameBn: 'সার্কাস জ্যাকপট',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.6,
    playersCount: 7900
  },
  {
    id: 'fish-dinosaur-tycoon',
    name: 'Dinosaur Tycoon',
    nameBn: 'ডাইনোসর টাইকুন',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.3,
    playersCount: 13700
  },
  {
    id: 'fish-star-hunter',
    name: 'Star Hunter',
    nameBn: 'স্টার হান্টার',
    provider: 'FA CHAI Gaming',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.8,
    playersCount: 9200
  },
  {
    id: 'fish-royal-fishing',
    name: 'Royal Fishing',
    nameBn: 'রয়্যাল ফিশিং',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.6,
    playersCount: 15800
  },
  {
    id: 'fish-dinosaur-tycoon-2',
    name: 'Dinosaur Tycoon 2',
    nameBn: 'ডাইনোসর টাইকু...',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.8,
    playersCount: 17100
  },
  {
    id: 'fish-all-star-fishing',
    name: 'All-Star Fishing',
    nameBn: 'অল-স্টার ফিশিং',
    provider: 'JILI',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.4,
    playersCount: 14500
  },
  {
    id: 'fish-boom-legend',
    name: 'Boom Legend',
    nameBn: 'বুম লেজেন্ড',
    provider: 'JDB',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.5,
    playersCount: 8400
  },
  {
    id: 'fish-dragon-fishing',
    name: 'Dragon Fishing',
    nameBn: 'ড্রাগন ফিশিং',
    provider: 'JDB',
    category: 'fishing',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.1,
    playersCount: 11600
  },

  // ================= 5. POKER & TABLE (পোকার) =================
  {
    id: 'poker-7-up-7-down',
    name: '7 Up 7 Down',
    nameBn: '7 Up 7 Down',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.5,
    playersCount: 16800
  },
  {
    id: 'poker-andar-bahar',
    name: 'Andar Bahar',
    nameBn: 'অন্দর বাহার',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.1,
    playersCount: 24500
  },
  HEAD_TAIL_GAME,
  {
    id: 'poker-coin-toss',
    name: 'Coin Toss',
    nameBn: 'Coin Toss',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.0,
    playersCount: 11200
  },
  {
    id: 'poker-sic-bo',
    name: 'Sic Bo',
    nameBn: 'Sic Bo',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.2,
    playersCount: 13900
  },
  {
    id: 'poker-andar-bahar-baison',
    name: 'Andar Bahar Baison',
    nameBn: 'অন্দর বাহার',
    provider: 'Baison Poker',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.9,
    playersCount: 9800
  },
  {
    id: 'poker-roulette',
    name: 'Poker Roulette',
    nameBn: 'Poker Roulette',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.3,
    playersCount: 15400
  },
  {
    id: 'poker-dice-duet',
    name: '7 Up Down Dice Duet',
    nameBn: 'ডাইস ডুয়েট',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.8,
    playersCount: 8900
  },
  {
    id: 'poker-callbreak',
    name: 'Callbreak',
    nameBn: 'কলব্রেক',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.4,
    playersCount: 28700
  },
  {
    id: 'poker-callbreak-quick',
    name: 'Callbreak Quick',
    nameBn: 'কলব্রেক কুইক',
    provider: 'JILI',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.2,
    playersCount: 19600
  },
  {
    id: 'poker-ludo-quick',
    name: 'Ludo Quick',
    nameBn: 'লুডো কুইক',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.0,
    playersCount: 22100
  },
  {
    id: 'poker-32-cards',
    name: '32 Cards',
    nameBn: '32 Cards',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.6,
    playersCount: 10400
  },
  {
    id: 'poker-andar-bahar-km',
    name: 'Andar Bahar Live',
    nameBn: 'Andar Bahar',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.1,
    playersCount: 17200
  },
  {
    id: 'poker-thai-fish',
    name: 'Thai Fish Prawn Crab',
    nameBn: 'Thai Fish Prawn...',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 96.9,
    playersCount: 8300
  },
  {
    id: 'poker-speedy-andar-bahar',
    name: 'Speedy Andar Bahar',
    nameBn: 'দ্রুত আন্ডার বা...',
    provider: 'KingMidas',
    category: 'poker',
    image: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.3,
    playersCount: 18900
  },

  // ================= 6. SPORTS (স্পোর্টস) =================
  {
    id: 'sports-9wickets',
    name: '9wickets Cricket Exchange',
    nameBn: '9wickets',
    provider: '9wickets',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1531415074868-036b1c57e3ce?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.5,
    playersCount: 38400
  },
  {
    id: 'sports-bti',
    name: 'BTi Sportsbook',
    nameBn: 'BTi',
    provider: 'BTi',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.2,
    playersCount: 29500
  },
  {
    id: 'sports-saba',
    name: 'Saba Sports Live',
    nameBn: 'Saba Sports',
    provider: 'Saba Sports',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.1,
    playersCount: 26100
  },
  {
    id: 'sports-lucky',
    name: 'LuckySports',
    nameBn: 'LuckySports',
    provider: 'LuckySports',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.9,
    playersCount: 14200
  },
  {
    id: 'sports-fb',
    name: 'FB SPORTS',
    nameBn: 'FB SPORTS',
    provider: 'FB SPORTS',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.8,
    playersCount: 16800
  },
  {
    id: 'sports-ap',
    name: 'AP Gaming Sports',
    nameBn: 'AP Gaming',
    provider: 'AP Gaming',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.7,
    playersCount: 12500
  },
  {
    id: 'sports-poly',
    name: 'Poly Sports Exchange',
    nameBn: 'Poly Sports',
    provider: 'Poly Sports',
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1569517282132-25d22f4573e6?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.6,
    playersCount: 11400
  },

  // ================= 7. E-SPORTS (ই-স্পোর্টস) =================
  {
    id: 'esports-tf',
    name: 'TF Gaming Arena',
    nameBn: 'TF',
    provider: 'TF',
    category: 'esports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.0,
    playersCount: 18600
  },
  {
    id: 'esports-ia',
    name: 'IA E-Sports Arena',
    nameBn: 'IA',
    provider: 'IA',
    category: 'esports',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 97.9,
    playersCount: 15900
  },

  // ================= 8. COCKFIGHT (মুরগির যুদ্ধ) =================
  {
    id: 'cockfight-sv388',
    name: 'SV388 Cockfight Live Arena',
    nameBn: 'SV388',
    provider: 'SV388',
    category: 'cockfight',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.3,
    playersCount: 34200
  },

  // ================= 9. LOTTERY (লটারি) =================
  {
    id: 'lottery-tc',
    name: 'TC Lottery 5D & WinGo',
    nameBn: 'TC Gaming',
    provider: 'TC GAMING',
    category: 'lottery',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85',
    isHot: true,
    rtp: 98.5,
    playersCount: 21000
  },
  {
    id: 'lottery-keno',
    name: 'Keno Lucky 80',
    nameBn: 'Keno 80',
    provider: 'JDB',
    category: 'lottery',
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=85',
    isHot: false,
    rtp: 97.5,
    playersCount: 11000
  }
];
