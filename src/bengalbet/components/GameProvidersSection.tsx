// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles, Layers } from 'lucide-react';
import { Language } from '../types';
import { GAME_PROVIDERS_LIST, ProviderItem } from '../data/providers';

interface GameProvidersSectionProps {
  language: Language;
  onSelectProvider?: (provider: ProviderItem) => void;
}

export const GameProvidersSection: React.FC<GameProvidersSectionProps> = ({
  language,
  onSelectProvider
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'slots' | 'live' | 'sports' | 'fishing'>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredProviders = GAME_PROVIDERS_LIST.filter(p => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'slots') return p.category.toLowerCase().includes('slot');
    if (selectedFilter === 'live') return p.category.toLowerCase().includes('live') || p.category.toLowerCase().includes('table');
    if (selectedFilter === 'sports') return p.category.toLowerCase().includes('sport') || p.category.toLowerCase().includes('cockfight') || p.category.toLowerCase().includes('esport');
    if (selectedFilter === 'fishing') return p.category.toLowerCase().includes('fish') || p.category.toLowerCase().includes('arcade') || p.category.toLowerCase().includes('crash');
    return true;
  });

  const displayedProviders = showAll ? filteredProviders : filteredProviders.slice(0, 36);

  return (
    <div id="game-providers-showcase" className="w-full bg-[#052b1d] border border-[#145d40] rounded-3xl p-3 sm:p-5 shadow-2xl my-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#145d40] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
            <Layers className="w-5 h-5 text-stone-900" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white font-bengali flex items-center gap-2">
              <span>{language === 'bn' ? 'গেমিং পার্টনার ও প্রোভাইডার' : 'Gaming Partners & Providers'}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#114d35] border border-yellow-500/40 text-yellow-300 font-sans font-bold">
                {GAME_PROVIDERS_LIST.length}+ Brands
              </span>
            </h3>
            <p className="text-[11px] text-emerald-300/80">
              {language === 'bn' ? 'বিশ্বের শীর্ষস্থানীয় সনদপ্রাপ্ত ক্যাসিনো ও স্লট সফটওয়্যার স্টুডিও' : 'Certified International Gaming & Live Dealer Studios'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {(['all', 'slots', 'live', 'sports', 'fishing'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => { setSelectedFilter(filterKey); }}
              className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === filterKey
                  ? 'bg-yellow-400 text-stone-950 font-black shadow-md'
                  : 'bg-[#093a28] hover:bg-[#0e5138] text-emerald-200 border border-[#145d40]'
              }`}
            >
              {filterKey === 'all' && (language === 'bn' ? 'সবগুলো' : 'All')}
              {filterKey === 'slots' && (language === 'bn' ? 'স্লট' : 'Slots')}
              {filterKey === 'live' && (language === 'bn' ? 'লাইভ' : 'Live')}
              {filterKey === 'sports' && (language === 'bn' ? 'স্পোর্টস' : 'Sports')}
              {filterKey === 'fishing' && (language === 'bn' ? 'ফিশিং/ক্র্যাশ' : 'Fishing/Crash')}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Cards Grid with Official Full Color Logos */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 sm:gap-2.5">
        {displayedProviders.map((provider) => (
          <div
            key={provider.id + provider.name}
            id={`provider-card-${provider.id}`}
            onClick={() => onSelectProvider?.(provider)}
            className="group relative bg-[#073625] hover:bg-[#0c4e37] border border-[#145d40] hover:border-yellow-400/80 rounded-xl p-2 flex flex-col items-center justify-between text-center transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1"
          >
            {/* Badge */}
            {provider.badge && (
              <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded text-[8px] font-black bg-red-600 text-white shadow z-10 animate-pulse">
                {provider.badge}
              </div>
            )}

            {/* Official Vendor Color Logo */}
            <div className="w-full aspect-[2/1] sm:aspect-[2.2/1] flex items-center justify-center p-1 bg-[#042016] rounded-lg border border-[#125037] group-hover:border-yellow-400/40 transition-colors mb-1.5 overflow-hidden">
              <img
                src={provider.logo}
                alt={provider.name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="max-h-full max-w-full object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-200"
                onError={(e) => {
                  // Text fallback if network prevents remote image
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'block';
                  }
                }}
              />
              <span className="hidden text-[10px] font-black text-yellow-400">
                {provider.name}
              </span>
            </div>

            {/* Provider Label & Genre */}
            <div className="w-full">
              <h4 className="text-[11px] font-black text-white group-hover:text-yellow-300 truncate">
                {provider.name}
              </h4>
              <p className="text-[9px] text-emerald-300/70 truncate">
                {provider.category}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Toggle View All / Collapse Button */}
      {filteredProviders.length > 36 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#093c28] to-[#0c4e37] hover:from-yellow-400 hover:to-amber-500 text-white hover:text-stone-950 font-black text-xs border border-yellow-500/40 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {showAll 
                ? (language === 'bn' ? 'কম দেখান' : 'Show Less') 
                : (language === 'bn' ? `সব ${filteredProviders.length}টি প্রোভাইডার দেখুন` : `View All ${filteredProviders.length} Providers`)}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
