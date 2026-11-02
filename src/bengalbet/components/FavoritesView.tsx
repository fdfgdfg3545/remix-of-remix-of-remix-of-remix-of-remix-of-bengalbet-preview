// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Search, 
  X, 
  Heart, 
  Play, 
  Flame, 
  Sparkles,
  Gamepad2
} from 'lucide-react';
import { GameItem, GameCategory, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { getProviderInfo } from '../data/providers';

interface FavoritesViewProps {
  language: Language;
  favorites: string[];
  onToggleFavorite: (gameId: string, e?: React.MouseEvent) => void;
  onLaunchGame: (game: GameItem) => void;
  onBackToLobby: () => void;
}

// Categories list exactly matching Capture8.PNG
const CATEGORIES: { id: GameCategory | 'all'; labelBn: string; labelEn: string }[] = [
  { id: 'all', labelBn: 'সব', labelEn: 'All' },
  { id: 'slot', labelBn: 'স্লট', labelEn: 'Slot' },
  { id: 'live', labelBn: 'লাইভ', labelEn: 'Live' },
  { id: 'fishing', labelBn: 'ফিশিং', labelEn: 'Fishing' },
  { id: 'poker', labelBn: 'পোকার', labelEn: 'Poker' },
  { id: 'sports', labelBn: 'স্পোর্টস', labelEn: 'Sports' },
  { id: 'cockfight', labelBn: 'মুরগির যুদ্ধ', labelEn: 'Cockfight' },
  { id: 'esports', labelBn: 'ই-স্পোর্টস', labelEn: 'E-Sports' },
  { id: 'lottery', labelBn: 'লটারি', labelEn: 'Lottery' }
];

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  language,
  favorites,
  onToggleFavorite,
  onLaunchGame,
  onBackToLobby
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'all'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');

  // Map favorited IDs to actual GameItem objects
  const favoriteGameItems = useMemo(() => {
    return favorites
      .map(id => GAMES_DATA.find(g => g.id === id))
      .filter((g): g is GameItem => g !== undefined);
  }, [favorites]);

  // Available providers based on favorited games & category
  const availableProviders = useMemo(() => {
    const relevantGames = selectedCategory === 'all'
      ? GAMES_DATA
      : GAMES_DATA.filter(g => {
          if (selectedCategory === 'slot') return g.category === 'slot' || g.category === 'hot';
          if (selectedCategory === 'poker') return g.category === 'poker' || g.category === 'table';
          return g.category === selectedCategory;
        });

    const set = new Set<string>();
    relevantGames.forEach(g => set.add(g.provider));
    return Array.from(set).slice(0, 10);
  }, [selectedCategory]);

  // Filtered games based on favorites + search + category + provider
  const displayedGames = useMemo(() => {
    return favoriteGameItems.filter(game => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = game.name.toLowerCase().includes(q) || (game.nameBn && game.nameBn.includes(q));
        const matchesProvider = game.provider.toLowerCase().includes(q);
        if (!matchesName && !matchesProvider) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'slot') {
          if (game.category !== 'slot' && game.category !== 'hot') return false;
        } else if (selectedCategory === 'poker') {
          if (game.category !== 'poker' && game.category !== 'table') return false;
        } else if (game.category !== selectedCategory) {
          return false;
        }
      }

      // 3. Provider Filter
      if (selectedProvider !== 'all') {
        if (game.provider.toLowerCase() !== selectedProvider.toLowerCase()) return false;
      }

      return true;
    });
  }, [favoriteGameItems, searchQuery, selectedCategory, selectedProvider]);

  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-[#073625] text-white p-3 sm:p-5 lg:p-6 flex flex-col gap-4">
      {/* 1. Header with Back Arrow exact to Capture8.PNG */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-white hover:text-yellow-400 font-bold transition-colors cursor-pointer group"
          title={language === 'bn' ? 'ফিরে যান' : 'Go Back'}
        >
          <ChevronLeft className="w-6 h-6 text-white group-hover:text-yellow-400 transition-colors" />
          <h1 className="text-xl sm:text-2xl font-black text-white font-bengali tracking-wide">
            {language === 'bn' ? 'আমার সংগ্রহ' : 'My Collection'}
          </h1>
        </button>
      </div>

      {/* 2. Search Bar exact to Capture8.PNG */}
      <div className="w-full max-w-md">
        <div className="relative flex items-center bg-[#052318] border border-[#145d40] rounded-xl px-3 py-2 shadow-inner focus-within:border-yellow-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'খেলার নাম' : 'Game name'}
            className="w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none font-bengali"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Box exact to Capture8.PNG */}
      <div className="w-full bg-[#062c1e]/85 border border-[#145d40]/70 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col gap-3">
        {/* Row 1: খেলার বিভাগ (Game Category) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-gray-200 font-bengali">
            {language === 'bn' ? 'খেলার বিভাগ' : 'Game Category'}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedProvider('all');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-bengali transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0c6b50] text-white border border-teal-300/60 shadow-sm'
                      : 'bg-[#041a12]/60 text-gray-300 border border-[#145d40]/60 hover:text-white hover:border-emerald-400'
                  }`}
                >
                  {language === 'bn' ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: খেলার শ্রেণীবিভাগ (Game Classification / Provider) */}
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-xs sm:text-sm font-bold text-gray-200 font-bengali">
            {language === 'bn' ? 'খেলার শ্রেণীবিভাগ' : 'Game Provider'}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              onClick={() => setSelectedProvider('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold font-bengali transition-all cursor-pointer ${
                selectedProvider === 'all'
                  ? 'bg-[#0c6b50] text-white border border-teal-300/60 shadow-sm'
                  : 'bg-[#041a12]/60 text-gray-300 border border-[#145d40]/60 hover:text-white hover:border-emerald-400'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'}
            </button>
            {availableProviders.map(prov => {
              const isActive = selectedProvider.toLowerCase() === prov.toLowerCase();
              return (
                <button
                  key={prov}
                  onClick={() => setSelectedProvider(prov)}
                  className={`px-3 py-1 rounded-full text-xs font-bold font-bengali transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0c6b50] text-white border border-teal-300/60 shadow-sm'
                      : 'bg-[#041a12]/60 text-gray-300 border border-[#145d40]/60 hover:text-white hover:border-emerald-400'
                  }`}
                >
                  {prov}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Display Area: Empty State or Favorited Games Grid */}
      {displayedGames.length === 0 ? (
        /* Empty State Illustration exact to Capture8.PNG */
        <div className="w-full flex-1 flex flex-col items-center justify-center py-16 sm:py-24 text-center">
          <div className="relative flex flex-col items-center justify-center">
            {/* Subtle Circular Floor Glow */}
            <div className="w-44 h-16 bg-emerald-500/10 blur-xl rounded-full absolute -bottom-2" />
            
            {/* 3D Notepad / Clipboard Illustration matching screenshot */}
            <div className="relative w-28 h-32 bg-gradient-to-b from-gray-100 to-gray-300 rounded-2xl shadow-2xl border border-gray-300/80 flex flex-col items-center p-3 transform -rotate-1 hover:rotate-0 transition-transform">
              {/* Spiral rings at top */}
              <div className="absolute -top-3 left-6 w-3 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full border border-gray-300 shadow-sm" />
              <div className="absolute -top-3 right-6 w-3 h-6 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full border border-gray-300 shadow-sm" />
              
              {/* Ruled paper lines */}
              <div className="w-full space-y-2 mt-4">
                <div className="w-3/4 h-1.5 bg-gray-400/40 rounded-full" />
                <div className="w-full h-1.5 bg-gray-400/40 rounded-full" />
                <div className="w-4/5 h-1.5 bg-gray-400/40 rounded-full" />
                <div className="w-2/3 h-1.5 bg-gray-400/40 rounded-full" />
              </div>

              {/* Upward arrow entering from bottom exact to Capture8.PNG */}
              <div className="absolute -bottom-4 w-7 h-7 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-emerald-600 mb-0.5" />
              </div>
            </div>
          </div>

          {/* Bengali text exact to Capture8.PNG */}
          <p className="mt-8 text-base font-bold text-gray-300 font-bengali tracking-wide">
            {language === 'bn' ? 'কোন ডেটা নেই' : 'No Data Available'}
          </p>

          <p className="text-xs text-gray-400 font-bengali mt-1 max-w-sm">
            {favorites.length === 0
              ? (language === 'bn' 
                  ? 'আপনার কোনো প্রিয় গেম সংরক্ষণ করা নেই। লবি থেকে হৃদয়ে (❤️) ক্লিক করে প্রিয় গেম যুক্ত করুন।' 
                  : 'You have no favorited games yet. Click the heart (❤️) icon on any game card to add it here.')
              : (language === 'bn' 
                  ? 'এই ফিল্টারের সাথে মিলে এমন কোনো প্রিয় গেম পাওয়া যায়নি।' 
                  : 'No favorited games match this filter.')}
          </p>

          {/* Call to action button */}
          <button
            onClick={onBackToLobby}
            className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold font-bengali shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Gamepad2 className="w-4 h-4 text-yellow-300" />
            <span>{language === 'bn' ? 'লবিতে গেম ব্রাউজ করুন' : 'Browse Games in Lobby'}</span>
          </button>
        </div>
      ) : (
        /* Games Grid (7 columns layout exact to CasinoLobby & CategoryGamesView) */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3 pt-2">
          {displayedGames.map((game) => {
            const providerInfo = getProviderInfo(game.provider);

            return (
              <div
                key={game.id}
                id={`fav-game-card-${game.id}`}
                onClick={() => onLaunchGame(game)}
                className="group relative bg-[#073625] rounded-xl overflow-hidden border border-[#166245] hover:border-yellow-400 transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer flex flex-col"
              >
                {/* Game Artwork */}
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

                  {/* Hot Badge */}
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

                  {/* Favorite Toggle Heart - Active Red/Gold */}
                  <button
                    onClick={(e) => onToggleFavorite(game.id, e)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors z-10 hover:scale-110 active:scale-95"
                    title={language === 'bn' ? 'সংগ্রহ থেকে সরান' : 'Remove from Favorites'}
                    aria-label="Toggle favorite"
                  >
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 transition-colors drop-shadow" />
                  </button>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Game Title */}
                <div className="py-2 px-1.5 bg-[#093c28] text-center">
                  <h4 className="text-xs font-bold text-white group-hover:text-yellow-300 transition-colors truncate font-bengali">
                    {language === 'bn' && game.nameBn ? game.nameBn : game.name}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
