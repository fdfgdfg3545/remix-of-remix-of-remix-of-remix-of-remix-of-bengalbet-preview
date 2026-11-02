// @ts-nocheck
/**
 * BengalBet Category Games View
 * Features:
 * - Filterable games directory with sub-category tabs & provider dropdown
 * - Classification filters (All, New, Recommended, Tournament, Jackpots)
 * - Game card grid with hover launcher and favorites toggling
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Play, 
  Flame, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { GameItem, GameCategory, Language, UserAccount } from '../types';
import { GAMES_DATA } from '../data/games';
import { getProviderInfo } from '../data/providers';
import { useFavorites } from '../hooks/useFavorites';

interface CategoryGamesViewProps {
  category: GameCategory;
  language: Language;
  user: UserAccount;
  favorites?: string[];
  onToggleFavorite?: (gameId: string, e?: React.MouseEvent) => void;
  onBack: () => void;
  onLaunchGame: (game: GameItem) => void;
  onCategoryChange?: (category: GameCategory) => void;
}

// Bengali & English Category Meta Definitions
export const CATEGORY_META: Record<string, { bn: string; en: string; icon: string; path: string }> = {
  all: { bn: 'সব গেম', en: 'All Games', icon: '🎮', path: '/all' },
  hot: { bn: 'গরম খেলা', en: 'Hot Games', icon: '🔥', path: '/hot' },
  slot: { bn: 'স্লট', en: 'Slot', icon: '🎰', path: '/slot' },
  rng: { bn: 'স্লট (RNG)', en: 'Slots (RNG)', icon: '🎰', path: '/rng' },
  live: { bn: 'লাইভ ক্যাসিনো', en: 'Live Casino', icon: '🃏', path: '/live' },
  fishing: { bn: 'ফিশিং', en: 'Fishing', icon: '🐟', path: '/fishing' },
  poker: { bn: 'পোকার ও টেবিল', en: 'Poker & Table', icon: '♠️', path: '/poker' },
  table: { bn: 'টেবিল গেম', en: 'Table Games', icon: '🎲', path: '/table' },
  sports: { bn: 'স্পোর্টস', en: 'Sports', icon: '🏏', path: '/sports' },
  esports: { bn: 'ই-স্পোর্টস', en: 'E-Sports', icon: '🎮', path: '/esports' },
  cockfight: { bn: 'মুরগির যুদ্ধ', en: 'Cockfight', icon: '🐓', path: '/cockfight' },
  lottery: { bn: 'লটারি', en: 'Lottery', icon: '🎫', path: '/lottery' },
  crash: { bn: 'ক্র্যাশ গেম', en: 'Crash Games', icon: '🚀', path: '/crash' },
  arcade: { bn: 'আর্কেড গেম', en: 'Arcade', icon: '🕹️', path: '/arcade' }
};

// Classification Tags matching screenshot
const CLASSIFICATION_TAGS = [
  { id: 'all', bn: 'সব', en: 'All' },
  { id: 'new', bn: 'নতুন খেলা', en: 'New Game' },
  { id: '3reel', bn: '৩টি রিল', en: '3 Reels' },
  { id: '5reel', bn: '৫ রিল', en: '5 Reels' },
  { id: 'arcade', bn: 'তোরণ - শ্রেণী', en: 'Arcade' },
  { id: 'bingo', bn: 'বিঙ্গো', en: 'Bingo' },
  { id: 'bonus', bn: 'বোনাস খেলা', en: 'Bonus Game' },
  { id: 'cascade', bn: 'ক্যাসকেড স্লট', en: 'Cascade Slot' },
  { id: 'crash', bn: 'ক্র্যাশ গেমস্', en: 'Crash Games' },
  { id: 'cricket', bn: 'ক্রিকেট', en: 'Cricket' },
  { id: 'buy_feature', bn: 'বৈশিষ্ট্য কিনুন', en: 'Buy Feature' },
  { id: 'free_spins', bn: 'বিনামূল্যে স্পিন', en: 'Free Spins' },
  { id: 'jackpot', bn: 'জ্যাকপট', en: 'Jackpot' },
  { id: 'megaways', bn: 'মেগাওয়ে', en: 'Megaways' },
  { id: 'respin', bn: 'রেস্পিন', en: 'Respins' },
  { id: 'scratch', bn: 'আঁচড়', en: 'Scratch' },
  { id: 'slot', bn: 'স্লট', en: 'Slot' },
  { id: 'table', bn: 'টেবিল গেম', en: 'Table Game' },
  { id: 'video_poker', bn: 'ভিডিও জুজু', en: 'Video Poker' },
];

export const CategoryGamesView: React.FC<CategoryGamesViewProps> = ({
  category,
  language,
  user,
  favorites: propFavorites,
  onToggleFavorite: propToggleFavorite,
  onBack,
  onLaunchGame,
  onCategoryChange
}) => {
  const { favorites: hookFavorites, toggleFavorite: hookToggleFavorite } = useFavorites();
  const favorites = propFavorites || hookFavorites;
  const toggleFavorite = (e: React.MouseEvent, gameId: string) => {
    if (propToggleFavorite) {
      propToggleFavorite(gameId, e);
    } else {
      hookToggleFavorite(gameId, e);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [providersExpanded, setProvidersExpanded] = useState<boolean>(true);
  const [tagsExpanded, setTagsExpanded] = useState<boolean>(true);

  // Base Category Games
  const baseCategoryGames = useMemo(() => {
    if (category === 'all' || category === 'hot') {
      return GAMES_DATA;
    }
    if (category === 'slot' || (category as string) === 'rng') {
      return GAMES_DATA.filter(g => g.category === 'slot' || g.category === 'hot');
    }
    if (category === 'poker' || category === 'table') {
      return GAMES_DATA.filter(g => g.category === 'poker' || g.category === 'table');
    }
    return GAMES_DATA.filter(g => g.category === category);
  }, [category]);

  // Unique list of providers for this category
  const availableProviders = useMemo(() => {
    const set = new Set<string>();
    baseCategoryGames.forEach(g => {
      if (g.provider) set.add(g.provider);
    });

    // Default prioritized list matching screenshot
    const priorityList = [
      'JILI', 
      'Spribe', 
      'Pocket Games Soft', 
      'BNG', 
      'FA CHAI Gaming', 
      'Micro Gaming', 
      'JDB', 
      'Pragmatic Play', 
      'RICH88',
      'Evolution',
      'KingMidas',
      'Ezugi'
    ];

    const currentProviders = Array.from(set);
    // Sort so priority items come first
    currentProviders.sort((a, b) => {
      const idxA = priorityList.findIndex(p => p.toLowerCase() === a.toLowerCase() || a.toLowerCase().includes(p.toLowerCase()));
      const idxB = priorityList.findIndex(p => p.toLowerCase() === b.toLowerCase() || b.toLowerCase().includes(p.toLowerCase()));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return currentProviders;
  }, [baseCategoryGames]);

  // Filtered Games according to Search, Provider, and Tag
  const filteredGames = useMemo(() => {
    return baseCategoryGames.filter(game => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = game.name.toLowerCase().includes(query);
        const matchNameBn = game.nameBn ? game.nameBn.toLowerCase().includes(query) : false;
        const matchProvider = game.provider.toLowerCase().includes(query);
        
        const isSuperAce11Query = (query.includes('11') || query.includes('ii') || query.includes('2')) && 
                                  (query.includes('super') || query.includes('ace') || query.includes('এস'));
        const isSuperAce2Game = game.id.includes('super-ace-2');

        const isHeadTailQuery = query.includes('head') || query.includes('tail') || query.includes('tell') || query.includes('হেড') || query.includes('টেল');
        const isHeadTailGame = game.id.includes('head-tail');

        const isFortuneGemsQuery = query.includes('fortene') || query.includes('fortune') || query.includes('gems') || query.includes('ফরচুন') || query.includes('জেমস');
        const isFortuneGemsGame = game.id.includes('fortune-gems');

        const isBoxingQuery = query.includes('boxing') || query.includes('boxingjking') || query.includes('box') || query.includes('বক্সিং');
        const isBoxingGame = game.id.includes('boxing-king');

        const isElementsQuery = query.includes('element') || query.includes('super element') || query.includes('fa chai') || query.includes('fc') || query.includes('এলিমেন্ট');
        const isElementsGame = game.id.includes('super-elements');

        const isBountyQuery = query.includes('wild') || query.includes('bounty') || query.includes('showdown') || query.includes('বাউন্টি') || query.includes('ওয়াইল্ড') || query.includes('pg soft') || query.includes('pg');
        const isBountyGame = game.id.includes('wild-bounty');

        const isFishingQuery = query.includes('happy') || query.includes('fish') || query.includes('fishing') || query.includes('হ্যাপি') || query.includes('ফিশিং') || query.includes('মাছ');
        const isFishingGame = game.id.includes('happy-fishing');

        if (!matchName && !matchNameBn && !matchProvider && !(isSuperAce11Query && isSuperAce2Game) && !(isHeadTailQuery && isHeadTailGame) && !(isFortuneGemsQuery && isFortuneGemsGame) && !(isBoxingQuery && isBoxingGame) && !(isElementsQuery && isElementsGame) && !(isBountyQuery && isBountyGame) && !(isFishingQuery && isFishingGame)) {
          return false;
        }
      }

      // 2. Provider Filter
      if (selectedProvider !== 'all') {
        const isMatch = game.provider.toLowerCase() === selectedProvider.toLowerCase() ||
          game.provider.toLowerCase().includes(selectedProvider.toLowerCase()) ||
          selectedProvider.toLowerCase().includes(game.provider.toLowerCase());
        if (!isMatch) return false;
      }

      // 3. Classification Tag Filter
      if (selectedTag !== 'all') {
        if (selectedTag === 'new' && !game.isNew) return false;
        if (selectedTag === 'jackpot' && !game.jackpot) return false;
        if (selectedTag === 'crash' && !game.name.toLowerCase().includes('aviator') && !game.name.toLowerCase().includes('fly') && !game.name.toLowerCase().includes('crash')) return false;
        if (selectedTag === 'buy_feature' && !game.isHot && !game.jackpot) return false;
        if (selectedTag === 'megaways' && !game.name.toLowerCase().includes('4096') && !game.name.toLowerCase().includes('deluxe') && !game.name.toLowerCase().includes('ace')) return false;
        if (selectedTag === '3reel' && !game.name.toLowerCase().includes('777') && !game.name.toLowerCase().includes('gem') && !game.name.toLowerCase().includes('gold')) return false;
      }

      return true;
    });
  }, [baseCategoryGames, searchQuery, selectedProvider, selectedTag]);

  const catMeta = CATEGORY_META[category] || CATEGORY_META.slot;

  return (
    <div id="category-games-page" className="w-full max-w-[1440px] mx-auto space-y-3 pb-8 animate-fadeIn">
      
      {/* 1. Header with Back Arrow & Bengali Category Title exact to Screenshot */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 rounded-xl bg-[#073625] hover:bg-[#0d4f36] text-white border border-[#166245] hover:border-yellow-400 transition-all flex items-center justify-center cursor-pointer shadow-md group"
            title="Back to Home Lobby"
            aria-label="Back to Lobby"
          >
            <ChevronLeft className="w-6 h-6 text-emerald-200 group-hover:text-yellow-300 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide font-bengali flex items-center gap-2">
            <span>{language === 'bn' ? catMeta.bn : catMeta.en}</span>
          </h1>
        </div>

        {/* Total Games Count Badge */}
        <div className="text-xs font-bold text-emerald-300 bg-[#073625] border border-[#166245] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{filteredGames.length} {language === 'bn' ? 'টি খেলা' : 'Games'}</span>
        </div>
      </div>

      {/* 2. Quick Category Switcher Pills */}
      <div 
        id="category-page-pills-bar"
        className="w-full bg-[#052b1d] border border-[#145d40] rounded-2xl p-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shadow-lg"
      >
        {Object.entries(CATEGORY_META)
          .filter(([key]) => key !== 'rng' && key !== 'table' && key !== 'crash' && key !== 'arcade')
          .map(([key, meta]) => {
            const isCatActive = category === key || (key === 'slot' && (category as string) === 'rng');
            return (
              <button
                key={key}
                onClick={() => {
                  if (onCategoryChange) {
                    onCategoryChange(key as GameCategory);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isCatActive
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-md font-black scale-105'
                    : 'bg-[#083c2a] hover:bg-[#0c4e37] text-emerald-100 hover:text-white border border-[#145d40]'
                }`}
              >
                <span className="text-sm">{meta.icon}</span>
                <span>{language === 'bn' ? meta.bn : meta.en}</span>
              </button>
            );
          })}
      </div>

      {/* 3. Search Game Bar with Exact Styling from Screenshot */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? 'খেলার নাম' : 'Search game name...'}
          className="w-full pl-10 pr-10 py-2.5 bg-[#052b1d] border border-[#145d40] focus:border-yellow-400 text-white placeholder-emerald-400/70 text-xs sm:text-sm rounded-xl outline-none transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Filter Container: Provider Selection & Classifications matching Screenshot */}
      <div className="bg-[#052b1d]/90 backdrop-blur-xs border border-[#145d40] rounded-2xl p-3 sm:p-4 space-y-3.5 shadow-xl">
        
        {/* Row A: Game Providers Filter (গেম প্রয়োগনকারী) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <span className="font-bengali text-emerald-100 font-extrabold">
                {language === 'bn' ? 'গেম প্রয়োগনকারী' : 'Game Providers'}
              </span>
            </div>
            <button
              onClick={() => setProvidersExpanded(!providersExpanded)}
              className="text-emerald-400 hover:text-yellow-300 p-1 transition-colors cursor-pointer"
              aria-label="Toggle Providers"
            >
              {providersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {providersExpanded && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              {/* All Providers Pill */}
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  selectedProvider === 'all'
                    ? 'bg-[#0f6b47] text-white border-2 border-emerald-300 shadow-md font-black'
                    : 'bg-[#073625] hover:bg-[#0b4d36] text-emerald-200 border border-[#166245]'
                }`}
              >
                {language === 'bn' ? 'সব' : 'All'}
              </button>

              {/* Specific Providers Pills */}
              {availableProviders.map((provider) => {
                const isSelected = selectedProvider.toLowerCase() === provider.toLowerCase();
                const info = getProviderInfo(provider);
                return (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(isSelected ? 'all' : provider)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#0f6b47] text-white border-2 border-emerald-300 shadow-md font-black'
                        : 'bg-[#073625] hover:bg-[#0b4d36] text-emerald-200 border border-[#166245]'
                    }`}
                  >
                    <img 
                      src={info.logo} 
                      alt={provider} 
                      className="w-3 h-3 object-contain shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span>{provider}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Row B: Game Classifications / Feature Tags (খেলার শ্রেণীবিভাগ) */}
        <div className="space-y-2 pt-2 border-t border-[#0f4b34]">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <span className="font-bengali text-emerald-100 font-extrabold">
                {language === 'bn' ? 'খেলার শ্রেণীবিভাগ' : 'Game Classification'}
              </span>
            </div>
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="text-emerald-400 hover:text-yellow-300 p-1 transition-colors cursor-pointer"
              aria-label="Toggle Classifications"
            >
              {tagsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {tagsExpanded && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
              {CLASSIFICATION_TAGS.map((tag) => {
                const isSelected = selectedTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#0f6b47] text-white border-2 border-emerald-300 shadow-md font-black'
                        : 'bg-[#073625] hover:bg-[#0b4d36] text-emerald-200 border border-[#166245]'
                    }`}
                  >
                    <span>{language === 'bn' ? tag.bn : tag.en}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Game Cards Matrix (3 Columns on mobile, 7 Columns Layout on desktop) */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 pt-2">
          {filteredGames.map((game) => {
            const isFav = favorites.includes(game.id);
            const providerInfo = getProviderInfo(game.provider);

            return (
              <div
                key={game.id}
                id={`cat-game-card-${game.id}`}
                onClick={() => onLaunchGame(game)}
                className="group relative bg-[#073625] rounded-xl overflow-hidden border border-[#166245] hover:border-yellow-400 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col"
              >
                {/* Artwork Box */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#041a12]">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85';
                    }}
                  />

                  {/* Multiplier or Hot Tag */}
                  {game.isHot && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[8px] font-black tracking-wider uppercase shadow flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
                      <span>HOT</span>
                    </div>
                  )}

                  {/* Real Provider Badge */}
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs border border-white/20 text-[9px] font-black shadow-md flex items-center gap-1 text-white">
                    <img 
                      src={providerInfo.logo} 
                      alt={providerInfo.name} 
                      className="w-3 h-3 object-contain shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <span style={{ color: providerInfo.color || '#ffd200' }} className="truncate max-w-[55px] font-bold">
                      {providerInfo.name}
                    </span>
                  </div>

                  {/* Favorite Toggle Heart */}
                  <button
                    onClick={(e) => toggleFavorite(e, game.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors z-10"
                    aria-label="Add to favorites"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                  </button>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Bottom Game Title Bar matching Screenshot */}
                <div className="py-2 px-1.5 bg-[#093c28] text-center">
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors truncate">
                    {language === 'bn' && game.nameBn ? game.nameBn : game.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#052b1d] border border-[#145d40] rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#073625] flex items-center justify-center mx-auto text-yellow-400">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm text-emerald-200 font-bold">
            {language === 'bn' ? 'কোনো খেলা পাওয়া যায়নি' : 'No games found matching criteria'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('all');
              setSelectedTag('all');
            }}
            className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl transition-all shadow"
          >
            {language === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      )}
    </div>
  );
};
