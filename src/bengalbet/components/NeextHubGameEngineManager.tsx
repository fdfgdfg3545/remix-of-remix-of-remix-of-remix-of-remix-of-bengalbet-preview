// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Gamepad2, 
  Sliders, 
  Percent, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  RefreshCw, 
  Save, 
  RotateCcw, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sparkles, 
  Info,
  Layers,
  Award
} from 'lucide-react';
import { GameEngineSettings } from '../types';
import { gameEngine, DEFAULT_GAME_ENGINE } from '../services/gameEngine';

interface NeextHubGameEngineManagerProps {
  onRefreshSiteUser?: () => void;
  showToast: (msg: string) => void;
}

// Full game catalog for granular per-game RTP control (0 to 100%)
const ALL_GAMES_LIST = [
  { id: 'aviator', name: 'Aviator Crash (এভিয়েটর)', vendor: 'Spribe', category: 'crash', defaultRtp: 97.2 },
  { id: 'super-ace', name: 'Super Ace Classic (সুপার এস)', vendor: 'JILI', category: 'slot', defaultRtp: 96.8 },
  { id: 'super-ace-2', name: 'Super Ace II / 11 (সুপার এস ১১)', vendor: 'JILI', category: 'slot', defaultRtp: 97.0 },
  { id: 'super-ace-deluxe', name: 'Super Ace Deluxe (সুপার এস ডিলাক্স)', vendor: 'JILI', category: 'slot', defaultRtp: 96.9 },
  { id: 'head-tail', name: 'Head & Tail 3D Coin (হেড অ্যান্ড টেল)', vendor: 'Spribe', category: 'table', defaultRtp: 98.0 },
  { id: 'crazy-777', name: 'Crazy 777 (ক্রেজি ৭৭৭)', vendor: 'JILI', category: 'slot', defaultRtp: 98.0 },
  { id: 'fortune-gems-3', name: 'Fortune Gems 3 (ফরচুন জেমস ৩)', vendor: 'JILI', category: 'slot', defaultRtp: 97.0 },
  { id: 'money-coming', name: 'Money Coming (মানি কামিং)', vendor: 'JILI', category: 'slot', defaultRtp: 97.2 },
  { id: 'seven-coins', name: 'Seven Coins (সেভেন কয়েনস)', vendor: 'JILI', category: 'slot', defaultRtp: 97.0 },
  { id: 'sweet-bonanza', name: 'Sweet Bonanza (সুইট বোনানজা)', vendor: 'Pragmatic', category: 'slot', defaultRtp: 96.5 },
  { id: 'gates-of-olympus', name: 'Gates of Olympus (জিউস)', vendor: 'Pragmatic', category: 'slot', defaultRtp: 96.5 },
  { id: 'treasures-aztec', name: 'Treasures of Aztec (আজটেক)', vendor: 'PG Soft', category: 'slot', defaultRtp: 96.71 },
  { id: 'wild-bounty', name: 'Wild Bounty Showdown', vendor: 'PG Soft', category: 'slot', defaultRtp: 96.75 },
  { id: 'boxing-king', name: 'Boxing King (বক্সিং কিং)', vendor: 'JILI', category: 'slot', defaultRtp: 96.8 },
  { id: 'fortune-tree', name: 'Fortune Tree (ফরচুন ট্রি)', vendor: 'JILI', category: 'slot', defaultRtp: 96.5 },
  { id: 'alibaba-cave', name: 'Ali Baba (আলি বাবা)', vendor: 'JILI', category: 'slot', defaultRtp: 97.0 },
  { id: 'happy-fishing', name: 'Happy Fishing (হ্যাপি ফিশিং)', vendor: 'JILI', category: 'fishing', defaultRtp: 97.0 },
  { id: 'magic-ace', name: 'Magic Ace (ম্যাজিক এস)', vendor: 'JILI', category: 'slot', defaultRtp: 97.6 },
  { id: 'circus-joker', name: 'Circus Joker 4096', vendor: 'JILI', category: 'slot', defaultRtp: 96.8 },
  { id: 'anubis', name: 'Anubis Wrath', vendor: 'PG Soft', category: 'slot', defaultRtp: 96.75 },
  { id: 'pinata-wins', name: 'Pinata Wins', vendor: 'PG Soft', category: 'slot', defaultRtp: 96.75 },
  { id: 'super-elements', name: 'Super Elements 2', vendor: 'JILI', category: 'slot', defaultRtp: 96.5 }
];

export const NeextHubGameEngineManager: React.FC<NeextHubGameEngineManagerProps> = ({
  onRefreshSiteUser,
  showToast
}) => {
  const [config, setConfig] = useState<GameEngineSettings>(() => gameEngine.getConfig());
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Search & Filter state for per-game controls
  const [gameSearch, setGameSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crash' | 'slot' | 'table' | 'fishing'>('all');

  // Sync with GameEngine service
  useEffect(() => {
    const unsub = gameEngine.subscribe((newCfg) => {
      setConfig(newCfg);
    });
    return unsub;
  }, []);

  // Filter games list
  const filteredGames = useMemo(() => {
    return ALL_GAMES_LIST.filter(g => {
      const matchCat = selectedCategory === 'all' || g.category === selectedCategory;
      const matchQuery = !gameSearch.trim() || 
        g.name.toLowerCase().includes(gameSearch.toLowerCase()) ||
        g.vendor.toLowerCase().includes(gameSearch.toLowerCase()) ||
        g.id.toLowerCase().includes(gameSearch.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, gameSearch]);

  // Telemetry Calculations
  const telemetry = config.telemetry || { totalWagered: 0, totalPayout: 0, totalRounds: 0, lastResetTime: '' };
  const actualRtp = telemetry.totalWagered > 0 
    ? Number(((telemetry.totalPayout / telemetry.totalWagered) * 100).toFixed(2))
    : 0;
  const netGgr = Number((telemetry.totalWagered - telemetry.totalPayout).toFixed(2));
  const rtpVariance = Number((actualRtp - config.globalRtp).toFixed(2));

  // Update field handler
  const handleUpdateField = <K extends keyof GameEngineSettings>(key: K, value: GameEngineSettings[K]) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  // Update Category RTP
  const handleUpdateCategoryRtp = (cat: keyof GameEngineSettings['categoryRtp'], val: number) => {
    const clamped = Math.max(0, Math.min(100, Number(val)));
    setConfig(prev => ({
      ...prev,
      categoryRtp: {
        ...prev.categoryRtp,
        [cat]: clamped
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Update Single Game RTP
  const handleUpdateGameRtp = (gameId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, Number(val)));
    setConfig(prev => ({
      ...prev,
      gameRtp: {
        ...prev.gameRtp,
        [gameId]: clamped
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Preset master RTP buttons
  const applyPresetRtp = (presetRtp: number, mode?: GameEngineSettings['engineMode']) => {
    const clamped = Math.max(0, Math.min(100, presetRtp));
    setConfig(prev => ({
      ...prev,
      globalRtp: clamped,
      engineMode: mode || prev.engineMode
    }));
    setHasUnsavedChanges(true);
    showToast(`Master RTP সেট করা হয়েছে: ${clamped}%`);
  };

  // Reset Single Game RTP to category default
  const handleResetGameRtp = (gameId: string) => {
    setConfig(prev => {
      const nextRtp = { ...prev.gameRtp };
      delete nextRtp[gameId];
      return {
        ...prev,
        gameRtp: nextRtp
      };
    });
    setHasUnsavedChanges(true);
    showToast(`${gameId} এর RTP ক্যাটাগরি ডিফল্টে রিসেট করা হয়েছে`);
  };

  // Save changes to engine & backend
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await gameEngine.updateConfig(config);
      setHasUnsavedChanges(false);
      showToast('গেম ইঞ্জিন ও 0-100% RTP সেটিংস সফলভাবে সক্রিয় ও সংরক্ষিত হয়েছে!');
      if (onRefreshSiteUser) onRefreshSiteUser();
    } catch {
      showToast('সেটিংস সেভ করতে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset Telemetry
  const handleResetTelemetry = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে সমস্ত রিয়েল-টাইম RTP ও বেটিং টেলিমেট্রি কাউন্টার রিসেট করতে চান?')) return;
    await gameEngine.resetTelemetry();
    showToast('টেলিমেট্রি কাউন্টার সফলভাবে রিসেট করা হয়েছে!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Banner */}
      <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                গেম ইঞ্জিন ও RTP কন্ট্রোল স্টুডিও (0% - 100%)
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  v2.0 Advanced Engine
                </span>
              </h2>
              <p className="text-xs text-emerald-300/80">
                0% (হাউজ ড্রেন / 0 উইন) থেকে 100% (ব্রেক-ইভেন) পর্যন্ত ফুল কন্ট্রোল। ভলাটিলিটি, ম্যাক্স ক্যাপ ও লাইভ টেলিমেট্রি।
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          <button
            type="button"
            onClick={() => applyPresetRtp(0, 'drain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              config.globalRtp === 0 || config.engineMode === 'drain'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                : 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-700/50'
            }`}
            title="House Takes All (0% RTP / Guaranteed Loss)"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            🛑 0% ড্রেন মোড (House Drain)
          </button>

          <button
            type="button"
            onClick={() => applyPresetRtp(100, 'generous')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              config.globalRtp === 100
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                : 'bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50'
            }`}
            title="Zero House Edge (100% RTP Break Even)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            💯 100% নো-এজ মোড
          </button>

          <button
            type="button"
            onClick={() => applyPresetRtp(96.5, 'normal')}
            className="px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/50 text-xs font-semibold cursor-pointer"
          >
            ডিফল্ট ৯৬.৫%
          </button>
        </div>
      </div>

      {/* 2. Real-Time Telemetry Bento Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
          <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-1">
            <span>মোট বেট ভলিউম (Turnover)</span>
            <DollarSign className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-lg md:text-xl font-black text-white font-mono">
            ৳{telemetry.totalWagered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            মোট রাউন্ড: <b className="text-white font-mono">{telemetry.totalRounds}</b>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
          <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-1">
            <span>প্লেয়ারদের মোট উইনিং পেআউট</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-black text-emerald-300 font-mono">
            ৳{telemetry.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            উইন অনুপাত: <b className="text-emerald-300 font-mono">{actualRtp}%</b>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40">
          <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-1">
            <span>লাইভ RTP বনাম টার্গেট RTP</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg md:text-xl font-black text-yellow-400 font-mono">
              {actualRtp}%
            </span>
            <span className="text-xs text-gray-400 font-mono">/ {config.globalRtp}%</span>
          </div>
          <div className="text-[11px] mt-1 flex items-center gap-1">
            <span className={rtpVariance > 0 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
              {rtpVariance > 0 ? `+${rtpVariance}%` : `${rtpVariance}%`}
            </span>
            <span className="text-gray-400 font-mono">ভ্যারিয়েন্স</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-300/80 mb-1">
              <span>ক্যাসিনো নেট প্রফিট (GGR)</span>
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <div className={`text-lg md:text-xl font-black font-mono ${netGgr >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {netGgr >= 0 ? '+' : ''}৳{netGgr.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetTelemetry}
            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer pt-2 mt-1 border-t border-emerald-800/40 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            টেলিমেট্রি রিসেট
          </button>
        </div>
      </div>

      {/* 3. Master Global RTP Slider (0% - 100%) */}
      <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/50 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-5 h-5 text-yellow-400" />
              মাস্টার গ্লোবাল RTP কন্ট্রোলার (0.0% to 100.0%)
            </h3>
            <p className="text-xs text-gray-300">
              সাইটের সমস্ত গেমের সার্বিক উইন রেট নির্ধারণ করুন। প্রতিটি বেটের প্রত্যাশিত রিটার্ন রেট অবিলম্বে সমন্বিত হবে।
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="px-4 py-2 rounded-xl bg-black/40 border border-yellow-400/40 flex items-center gap-2">
              <span className="text-xs text-gray-400">টার্গেট RTP:</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.globalRtp}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  handleUpdateField('globalRtp', Math.max(0, Math.min(100, val)));
                }}
                className="w-20 bg-transparent text-yellow-400 font-mono font-black text-lg focus:outline-none text-right"
              />
              <span className="text-yellow-400 font-black text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Master Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={config.globalRtp}
            onChange={(e) => handleUpdateField('globalRtp', parseFloat(e.target.value))}
            className="w-full h-3.5 bg-[#04160e] rounded-xl appearance-none cursor-pointer accent-yellow-400 border border-emerald-800"
          />

          <div className="flex justify-between text-[11px] font-mono text-gray-400 px-1">
            <span className="text-red-400 font-bold">০% (House Takes 100%)</span>
            <span>২৫%</span>
            <span>৫০% (High Edge)</span>
            <span>৭৫%</span>
            <span className="text-emerald-400 font-bold">৯৬.৫% (Standard)</span>
            <span className="text-purple-400 font-bold">১০০% (Break-Even)</span>
          </div>
        </div>

        {/* Preset Quick Click Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { label: '০% ড্রেন মোড', val: 0, color: 'bg-red-500/20 text-red-300 border-red-500/40' },
            { label: '৫০% ভারী এজ', val: 50, color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
            { label: '৮০% আর্কেড টাইট', val: 80, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            { label: '৯৫% ভেগাস স্ট্যান্ডার্ড', val: 95, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { label: '৯৬.৫% ডিফল্ট গোল্ডেন', val: 96.5, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
            { label: '৯৮% ভিআইপি ফ্রেন্ডলি', val: 98, color: 'bg-green-500/20 text-green-300 border-green-500/40' },
            { label: '৯৯.৫% মেগা উইন', val: 99.5, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
            { label: '১০০% নো-এজ (ব্রেক-ইভেন)', val: 100, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => applyPresetRtp(preset.val)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${preset.color} hover:opacity-90 active:scale-95`}
            >
              {preset.label} ({preset.val}%)
            </button>
          ))}
        </div>
      </div>

      {/* 4. Engine Modes & Volatility Bento Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Engine Operational Mode */}
        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            ইঞ্জিন অপারেশনাল মোড
          </h4>
          <p className="text-[11px] text-gray-300">
            গেম অ্যালগরিদম কীভাবে রাউন্ড পরিচালনা করবে তা সিলেক্ট করুন:
          </p>

          <div className="space-y-2">
            {[
              { id: 'normal', name: 'Normal RNG (স্ট্যান্ডার্ড মোড)', desc: 'RTP অনুযায়ী ন্যাচারাল প্রোবাবিলিটি ম্যাথ' },
              { id: 'drain', name: 'Drain 0% (ড্রেন মোড)', desc: '১০০% নিশ্চিত পরাজয় (1.00x ক্র্যাশ / ব্ল্যাঙ্ক স্পিন)' },
              { id: 'generous', name: 'Generous (উদার মোড)', desc: 'ঘন ঘন ছোট ও মাঝারি উইন পেআউট' },
              { id: 'jackpot_frenzy', name: 'Jackpot Frenzy (জ্যাকপট উৎসব)', desc: 'মেগা মাল্টিপ্লায়ার ও ফ্রি স্পিনের সর্বোচ্চ হার' },
              { id: 'custom', name: 'Custom (কাস্টম প্রোফাইল)', desc: 'আপনার দেওয়া সুনির্দিষ্ট সেটিংস অনুযায়ী' }
            ].map(m => (
              <label
                key={m.id}
                onClick={() => handleUpdateField('engineMode', m.id as any)}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                  config.engineMode === m.id
                    ? 'bg-yellow-400/15 border-yellow-400/60 text-white shadow-md'
                    : 'bg-[#04160e]/80 border-emerald-800/60 text-gray-300 hover:bg-white/5'
                }`}
              >
                <input
                  type="radio"
                  name="engineMode"
                  checked={config.engineMode === m.id}
                  onChange={() => handleUpdateField('engineMode', m.id as any)}
                  className="mt-1 accent-yellow-400"
                />
                <div>
                  <div className="text-xs font-bold text-white">{m.name}</div>
                  <div className="text-[10px] text-gray-400">{m.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Volatility & Risk Profile */}
        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            ভলাটিলিটি কার্ভ (Volatility Profile)
          </h4>
          <p className="text-[11px] text-gray-300">
            উইন রেট ফ্রিকোয়েন্সি ও মাল্টিপ্লায়ারের তীব্রতা নিয়ন্ত্রণ করুন:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'low', name: 'Low (শান্ত)', tag: 'ঘন ঘন ছোট উইন (42% Hit)' },
              { id: 'medium', name: 'Medium (ব্যালেন্সড)', tag: 'স্ট্যান্ডার্ড হিট রেট (28% Hit)' },
              { id: 'high', name: 'High (উচ্চ ঝুঁকি)', tag: 'কম উইন, বড় মাল্টিপ্লায়ার (18%)' },
              { id: 'extreme', name: 'Extreme (পাগলা)', tag: 'বিরল হিট, ১০০০X বিস্ফোরণ (10%)' }
            ].map(v => (
              <button
                key={v.id}
                type="button"
                onClick={() => handleUpdateField('volatility', v.id as any)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  config.volatility === v.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-white font-bold shadow-md'
                    : 'bg-[#04160e]/80 border-emerald-800/60 text-gray-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold text-white">{v.name}</div>
                <div className="text-[10px] text-emerald-300/80 mt-1">{v.tag}</div>
              </button>
            ))}
          </div>

          {/* Dynamic Balancer Switch */}
          <div className="pt-3 border-t border-emerald-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  ডাইনামিক RTP ব্যালেন্সার
                </div>
                <div className="text-[10px] text-gray-400">
                  টার্গেট RTP থেকে লাইভ পেআউট সরে গেলে স্বয়ংক্রিয়ভাবে ব্যালেন্স করে
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateField('dynamicBalancing', !config.dynamicBalancing)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  config.dynamicBalancing ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  config.dynamicBalancing ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Safety Limits & Rigging Sandbox */}
        <div className="p-4 rounded-2xl bg-[#09291b] border border-emerald-700/40 space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            হাউজ লিমিট ও রিগিং স্যান্ডবক্স
          </h4>

          {/* Max Multiplier Cap */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-semibold">ম্যাক্স পেআউট ক্যাপ:</span>
              <span className="text-yellow-400 font-mono font-bold">{config.maxMultiplierCap}X</span>
            </div>
            <select
              value={config.maxMultiplierCap}
              onChange={(e) => handleUpdateField('maxMultiplierCap', parseInt(e.target.value))}
              className="w-full bg-[#04160e] border border-emerald-700 text-xs text-white rounded-xl px-3 py-2"
            >
              <option value="50">৫০X ক্যাপ (Safe Limits)</option>
              <option value="100">১০০X ক্যাপ</option>
              <option value="500">৫০০X ক্যাপ</option>
              <option value="1000">১,০০০X ক্যাপ (Standard)</option>
              <option value="2500">২,৫০০X ক্যাপ</option>
              <option value="5000">৫,০০০X ক্যাপ (High Roller)</option>
              <option value="10000">১০,০০০X আনক্যাপড (Insane)</option>
            </select>
          </div>

          {/* Near-Miss Rate */}
          <div className="pt-2 border-t border-emerald-800/60">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-300 font-semibold">নিয়ার-মিস টানটান উত্তেজনা হার:</span>
              <span className="text-orange-400 font-mono font-bold">{config.nearMissRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={config.nearMissRate}
              onChange={(e) => handleUpdateField('nearMissRate', parseInt(e.target.value))}
              className="w-full h-2 bg-[#04160e] rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
            <div className="text-[10px] text-gray-400 mt-0.5">
              পরাজিত রাউন্ডে ২টা ৭ বা অল্পের জন্য ক্র্যাশ দেখিয়ে প্লেয়ারকে রোমাঞ্চিত রাখা
            </div>
          </div>

          {/* Admin Rigging Mode */}
          <div className="pt-2 border-t border-emerald-800/60">
            <div className="text-xs font-semibold text-gray-300 mb-1">টেস্টিং / ফোর্সড আউটকাম:</div>
            <select
              value={config.forceOutcome}
              onChange={(e) => handleUpdateField('forceOutcome', e.target.value as any)}
              className="w-full bg-[#04160e] border border-emerald-700 text-xs text-white rounded-xl px-3 py-2"
            >
              <option value="none">স্বাভাবিক (Natural RNG)</option>
              <option value="always_win">সব রাউন্ড উইন (Always Win)</option>
              <option value="always_lose">সব রাউন্ড লস (Always Lose)</option>
              <option value="big_win_next">পরবর্তী রাউন্ডে মেগা জ্যাকপট (Big Win Next)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Category-Level RTP Overrides */}
      <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/50 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              ক্যাটাগরি ভিত্তিক RTP কন্ট্রোল (0% - 100%)
            </h3>
            <p className="text-xs text-gray-300">
              ক্র্যাশ, স্লট, টেবিল ও ফিশিং ক্যাটাগরির জন্য স্বাধীনভাবে 0% থেকে 100% RTP নির্ধারণ করুন।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {[
            { id: 'crash', name: 'ক্র্যাশ গেম (Aviator)', icon: '🚀', current: config.categoryRtp.crash },
            { id: 'slot', name: 'স্লট গেমস (Slots)', icon: '🎰', current: config.categoryRtp.slot },
            { id: 'table', name: 'টেবিল ও কয়েন (Coin/Live)', icon: '🪙', current: config.categoryRtp.table },
            { id: 'fishing', name: 'ফিশিং গেমস (Fishing)', icon: '🎣', current: config.categoryRtp.fishing },
            { id: 'arcade', name: 'আর্কেড গেমস (Arcade)', icon: '🕹️', current: config.categoryRtp.arcade }
          ].map((cat) => (
            <div key={cat.id} className="p-3.5 rounded-xl bg-[#04160e] border border-emerald-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{cat.icon}</span>
                  {cat.name}
                </span>
                <span className="font-mono font-bold text-yellow-400 text-sm">{cat.current}%</span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={cat.current}
                onChange={(e) => handleUpdateCategoryRtp(cat.id as any, parseFloat(e.target.value))}
                className="w-full h-2 bg-[#09291b] rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />

              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <button
                  type="button"
                  onClick={() => handleUpdateCategoryRtp(cat.id as any, 0)}
                  className="hover:text-red-400 cursor-pointer"
                >
                  ০% (Drain)
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCategoryRtp(cat.id as any, 96.5)}
                  className="hover:text-yellow-400 cursor-pointer"
                >
                  ৯৬.৫%
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateCategoryRtp(cat.id as any, 100)}
                  className="hover:text-purple-400 cursor-pointer"
                >
                  ১০০% (Max)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Per-Game RTP Granular Overrides (0% - 100%) */}
      <div className="p-5 rounded-2xl bg-[#09291b] border border-emerald-700/50 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-yellow-400" />
              প্রতিটি একক গেমের সুনির্দিষ্ট RTP ওভাররাইড (0% to 100%)
            </h3>
            <p className="text-xs text-gray-300">
              যেকোনো গেমকে আলাদাভাবে 0% করে ড্রেন করতে পারেন অথবা 99-100% করে প্লেয়ার আকর্ষণ বাড়াতে পারেন।
            </p>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={gameSearch}
                onChange={(e) => setGameSearch(e.target.value)}
                placeholder="গেম খুঁজুন (যেমন: Aviator)..."
                className="bg-[#04160e] border border-emerald-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-400 w-48 focus:outline-none focus:border-yellow-400"
              />
            </div>

            <div className="flex rounded-xl bg-[#04160e] p-1 border border-emerald-800 text-xs">
              {(['all', 'crash', 'slot', 'table', 'fishing'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    selectedCategory === tab
                      ? 'bg-yellow-400 text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? 'সকল' : tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredGames.map((g) => {
            const hasOverride = config.gameRtp[g.id] !== undefined;
            const effectiveRtp = gameEngine.getEffectiveRtp(g.id, g.category);
            const currentVal = hasOverride ? config.gameRtp[g.id] : effectiveRtp;

            return (
              <div 
                key={g.id} 
                className={`p-4 rounded-2xl bg-[#04160e] border transition-all space-y-3 ${
                  hasOverride 
                    ? 'border-yellow-400/50 shadow-md ring-1 ring-yellow-400/20' 
                    : 'border-emerald-800/70 hover:border-emerald-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{g.name}</h4>
                    <div className="text-[11px] text-emerald-300/70 font-mono">
                      {g.vendor} • {g.category.toUpperCase()}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    hasOverride
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {hasOverride ? 'কাস্টম' : 'ক্যাটাগরি'}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-emerald-900/80">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-gray-300">সক্রিয় উইন রেট (RTP):</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={currentVal}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateGameRtp(g.id, val);
                        }}
                        className="w-16 bg-[#09291b] border border-emerald-700 rounded px-1.5 py-0.5 text-right font-mono font-bold text-yellow-400 text-xs"
                      />
                      <span className="text-yellow-400 font-bold font-mono">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={currentVal}
                    onChange={(e) => handleUpdateGameRtp(g.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#09291b] rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />

                  {/* Micro adjustment quick buttons */}
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateGameRtp(g.id, 0)}
                        className="px-1.5 py-0.5 rounded bg-red-950/70 hover:bg-red-900/70 text-red-300 border border-red-800/40 cursor-pointer"
                        title="Drain 0% RTP"
                      >
                        ০%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGameRtp(g.id, Math.max(0, currentVal - 5))}
                        className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-gray-300 border border-emerald-800 cursor-pointer"
                      >
                        -৫%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGameRtp(g.id, Math.min(100, currentVal + 5))}
                        className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-gray-300 border border-emerald-800 cursor-pointer"
                      >
                        +৫%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateGameRtp(g.id, 100)}
                        className="px-1.5 py-0.5 rounded bg-purple-950/70 hover:bg-purple-900/70 text-purple-300 border border-purple-800/40 cursor-pointer"
                        title="100% RTP"
                      >
                        ১০০%
                      </button>
                    </div>

                    {hasOverride && (
                      <button
                        type="button"
                        onClick={() => handleResetGameRtp(g.id)}
                        className="text-gray-400 hover:text-white underline cursor-pointer"
                      >
                        রিসেট
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Bottom Floating Save Bar */}
      <div className="sticky bottom-4 z-40 p-4 rounded-2xl bg-[#03150e]/95 backdrop-blur-md border border-yellow-400/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
          <div className="text-xs text-white">
            <span className="font-bold">সক্রিয় কনফিগারেশন:</span> গ্লোবাল RTP <b className="text-yellow-400 font-mono">{config.globalRtp}%</b> • মোড: <b className="text-emerald-300 uppercase">{config.engineMode}</b> • ভলাটিলিটি: <b className="text-orange-400 uppercase">{config.volatility}</b>
            {hasUnsavedChanges && (
              <span className="ml-2 text-yellow-300 font-semibold animate-pulse">(অসংরক্ষিত পরিবর্তন রয়েছে)</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'সংরক্ষিত হচ্ছে...' : 'সেভ করুন এবং লাইভ গেম ইঞ্জিনে সক্রিয় করুন'}
          </button>
        </div>
      </div>
    </div>
  );
};
