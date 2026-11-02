// @ts-nocheck
/**
 * BengalBet Global Search Modal
 * Features:
 * - Real-time unified search across all games & promotional offers
 * - Instant game launcher & favorites toggling
 * - Full bilingual support (Bengali / English)
 * - UI Developed by Neext Hub (https://neexthub.ai.studio/)
 */

import React, { useState } from 'react';
import { X, Search, Gamepad2, Gift, Play, ArrowRight, Heart } from 'lucide-react';
import { GameItem, Promotion, Language } from '../types';
import { GAMES_DATA } from '../data/games';
import { getProviderInfo } from '../data/providers';
import { PROMOTIONS_DATA } from '../data/promotions';
import { useFavorites } from '../hooks/useFavorites';

interface SearchModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
  onSelectGame: (game: GameItem) => void;
  onSelectPromotion: (promo: Promotion) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  language,
  onClose,
  onSelectGame,
  onSelectPromotion
}) => {
  const [query, setQuery] = useState('');
  const { favorites, toggleFavorite } = useFavorites();

  if (!isOpen) return null;

  const matchedGames = GAMES_DATA.filter(g => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const matchName = g.name.toLowerCase().includes(q);
    const matchNameBn = g.nameBn && g.nameBn.toLowerCase().includes(q);
    const matchProvider = g.provider.toLowerCase().includes(q);

    // Aliases for Super Ace 11 / Super Ace II / Super Ace 2
    const isSuperAce11Query = (q.includes('11') || q.includes('ii') || q.includes('2')) && 
                              (q.includes('super') || q.includes('ace') || q.includes('এস'));
    const isSuperAce2Game = g.id.includes('super-ace-2');

    // Aliases for Head and Tail / Head Tell
    const isHeadTailQuery = q.includes('head') || q.includes('tail') || q.includes('tell') || q.includes('হেড') || q.includes('টেল');
    const isHeadTailGame = g.id.includes('head-tail');

    // Aliases for Fortune Gems / Fortene games / Fortune Gems 3
    const isFortuneGemsQuery = q.includes('fortene') || q.includes('fortune') || q.includes('gems') || q.includes('ফরচুন') || q.includes('জেমস');
    const isFortuneGemsGame = g.id.includes('fortune-gems');

    // Aliases for Boxing King / boxingjking
    const isBoxingQuery = q.includes('boxing') || q.includes('boxingjking') || q.includes('box') || q.includes('বক্সিং');
    const isBoxingGame = g.id.includes('boxing-king');

    // Aliases for Super Elements / Super Elements 2 / FA CHAI
    const isElementsQuery = q.includes('element') || q.includes('super element') || q.includes('fa chai') || q.includes('fc') || q.includes('এলিমেন্ট');
    const isElementsGame = g.id.includes('super-elements');

    // Aliases for Wild Bounty Showdown / PG Soft
    const isBountyQuery = q.includes('wild') || q.includes('bounty') || q.includes('showdown') || q.includes('বাউন্টি') || q.includes('ওয়াইল্ড') || q.includes('pg soft') || q.includes('pg');
    const isBountyGame = g.id.includes('wild-bounty');

    // Aliases for Happy Fishing / JILI Fishing
    const isFishingQuery = q.includes('happy') || q.includes('fish') || q.includes('fishing') || q.includes('হ্যাপি') || q.includes('ফিশিং') || q.includes('মাছ');
    const isFishingGame = g.id.includes('happy-fishing');

    return matchName || matchNameBn || matchProvider || (isSuperAce11Query && isSuperAce2Game) || (isHeadTailQuery && isHeadTailGame) || (isFortuneGemsQuery && isFortuneGemsGame) || (isBoxingQuery && isBoxingGame) || (isElementsQuery && isElementsGame) || (isBountyQuery && isBountyGame) || (isFishingQuery && isFishingGame);
  }).slice(0, 6);

  const matchedPromos = PROMOTIONS_DATA.filter(p => 
    p.titleBn.toLowerCase().includes(query.toLowerCase()) ||
    p.titleEn.toLowerCase().includes(query.toLowerCase()) ||
    p.subtitleBn.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-3 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div 
        id="search-dialog"
        className="relative w-full max-w-2xl bg-[#082a1d] border-2 border-yellow-400 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Bar Input */}
        <div className="p-4 bg-[#051c13] border-b border-[#14593e] flex items-center gap-3">
          <Search className="w-5 h-5 text-yellow-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={language === 'bn' ? 'গেম বা অফারের নাম দিয়ে খুঁজুন (যেমন: Aviator, Super Ace, রিবেট)...' : 'Search games, providers or promotions...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#0e432f] hover:bg-[#155e42] text-gray-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Matched Games */}
          <div>
            <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'গেমসমূহ' : 'Games'} ({matchedGames.length})</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {matchedGames.map((game) => {
                const providerInfo = getProviderInfo(game.provider);
                const isFav = favorites.includes(game.id);
                return (
                  <div
                    key={game.id}
                    onClick={() => { onSelectGame(game); onClose(); }}
                    className="bg-[#051c13] hover:bg-[#0e432f] border border-[#14593e] hover:border-yellow-400 rounded-xl p-2.5 flex items-center gap-2.5 cursor-pointer transition-colors group relative"
                  >
                    <img 
                      src={game.image} 
                      alt={game.name} 
                      className="w-10 h-10 rounded-lg object-cover shrink-0" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=500&q=85';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white group-hover:text-yellow-300 truncate text-xs">{game.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <img 
                          src={providerInfo.logo} 
                          alt={providerInfo.name} 
                          className="w-2.5 h-2.5 object-contain" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <p className="text-[10px] text-emerald-400 truncate">{providerInfo.name}</p>
                      </div>
                    </div>
                    
                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(game.id, e)}
                      className="p-1 rounded-full bg-black/40 hover:bg-black/80 text-white transition-all hover:scale-110 z-10 shrink-0"
                      title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-gray-400 hover:text-white'}`} />
                    </button>

                    <Play className="w-3.5 h-3.5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matched Promotions */}
          <div>
            <h4 className="text-xs font-bold text-yellow-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-red-400" />
              <span>{language === 'bn' ? 'প্রমোশন ও অফার' : 'Promotions'} ({matchedPromos.length})</span>
            </h4>
            <div className="space-y-2">
              {matchedPromos.map((promo) => (
                <div
                  key={promo.id}
                  onClick={() => { onSelectPromotion(promo); onClose(); }}
                  className="bg-[#051c13] hover:bg-[#0e432f] border border-[#14593e] hover:border-yellow-400 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors group"
                >
                  <div>
                    <p className="font-bold text-white group-hover:text-yellow-300 text-xs">
                      {language === 'bn' ? promo.titleBn : promo.titleEn}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {promo.claimableAmount}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
