// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Settings,
  Database,
  X,
  Server,
  Key,
  Globe,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import {
  api,
  REST_API_CONFIG,
  subscribeDatabaseServerError,
  clearDatabaseServerError,
  setDatabaseServerError,
  DatabaseServerErrorState
} from '../services/api';

interface GlobalDatabaseErrorBannerProps {
  onOpenAdminSettings?: () => void;
}

export const GlobalDatabaseErrorBanner: React.FC<GlobalDatabaseErrorBannerProps> = ({
  onOpenAdminSettings
}) => {
  const [errorState, setErrorState] = useState<DatabaseServerErrorState>({
    isError: false,
    lastChecked: Date.now(),
    errorMessage: '',
    targetUrl: ''
  });

  const [isRetrying, setIsRetrying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any | null>(null);

  // Editable config state inside quick modal
  const [inputDomain, setInputDomain] = useState(REST_API_CONFIG.rootDomain);
  const [inputPath, setInputPath] = useState(REST_API_CONFIG.path);
  const [inputMasterKey, setInputMasterKey] = useState(REST_API_CONFIG.masterKey);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeDatabaseServerError((state) => {
      setErrorState(state);
      if (state.isError) {
        setIsDismissed(false);
      }
    });

    // Initial background health check
    api.health().then(res => {
      if (res && res.mysql && res.mysql.connected === false) {
        setDatabaseServerError({
          errorMessage: 'MySQL Database not connected on remote server: ' + (res.mysql.version || 'Offline'),
          targetUrl: REST_API_CONFIG.baseUrl
        });
      }
    }).catch(err => {
      // If server ping fails, register error
      setDatabaseServerError({
        errorMessage: err.message || 'Database server is not responding to API calls',
        targetUrl: REST_API_CONFIG.baseUrl
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setTestResult(null);
    try {
      const res = await api.health();
      if (res.success && res.mysql?.connected !== false) {
        clearDatabaseServerError();
        setIsDismissed(true);
      } else {
        setDatabaseServerError({
          errorMessage: res.mysql?.version || 'MySQL database is still disconnected',
          targetUrl: REST_API_CONFIG.baseUrl
        });
      }
    } catch (err: any) {
      setDatabaseServerError({
        errorMessage: err.message || 'Database server connection failed',
        targetUrl: REST_API_CONFIG.baseUrl
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleSaveConfig = () => {
    REST_API_CONFIG.update({
      rootDomain: inputDomain,
      path: inputPath,
      masterKey: inputMasterKey
    });
    setSaveSuccessMsg('কনফিগারেশন সেভ হয়েছে! নতুন সেটিংসে যাচাই করা হচ্ছে...');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    handleRetry();
  };

  const handleResetToDefaults = () => {
    REST_API_CONFIG.resetToDefaults();
    setInputDomain(REST_API_CONFIG.rootDomain);
    setInputPath(REST_API_CONFIG.path);
    setInputMasterKey(REST_API_CONFIG.masterKey);
    setSaveSuccessMsg('ডিফল্ট কনফিগারেশন রিস্টোর করা হয়েছে!');
    setTimeout(() => setSaveSuccessMsg(''), 3000);
    handleRetry();
  };

  const handlePerformResetDatabase = async () => {
    setIsResetting(true);
    setResetResult(null);
    try {
      const res = await api.master.resetDatabase();
      setResetResult(res);
      if (res.success) {
        clearDatabaseServerError();
      }
    } catch (err: any) {
      setResetResult({
        success: false,
        message: err.message || 'ডাটাবেস রিসেট ব্যর্থ হয়েছে'
      });
    } finally {
      setIsResetting(false);
    }
  };

  // If no error, render nothing
  if (!errorState.isError) {
    return null;
  }

  // If dismissed, render a subtle sticky notification pill so it remains visible & accessible
  if (isDismissed) {
    return (
      <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
        <button
          onClick={() => setIsDismissed(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-2xl border-2 border-amber-400 font-bold text-xs animate-bounce transition-all duration-300"
        >
          <AlertTriangle className="w-4 h-4 text-amber-300 animate-spin" />
          <span>⚠️ ডাটাবেস সার্ভার ত্রুটি (DB Server Error)</span>
          <span className="bg-black/40 px-2 py-0.5 rounded-full text-[10px]">ক্লিক করুন</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Top Global Error Banner Bar */}
      <div className="sticky top-0 z-[100] w-full bg-gradient-to-r from-[#3b0808] via-[#4d0c0c] to-[#3b0808] border-b-2 border-red-500 shadow-2xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Left: Icon & Title & Description */}
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <AlertTriangle className="w-5 h-5 animate-pulse text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-500 text-white shadow-sm">
                    সার্ভার ত্রুটি / DB Server Error
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide truncate">
                    ডাটাবেস সার্ভার সংযোগ পাওয়া যাচ্ছে না (Database Server Getting Error)
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-red-200/90">
                  <span className="font-mono text-amber-300 bg-black/40 px-2 py-0.5 rounded truncate max-w-[280px] sm:max-w-[400px]">
                    {errorState.targetUrl || REST_API_CONFIG.baseUrl}
                  </span>
                  <span className="text-red-300 truncate max-w-full">
                    {errorState.errorMessage || 'Cannot establish connection to MySQL DB Server.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto justify-end">
              {/* Retry Button */}
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow-md shadow-amber-400/20 disabled:opacity-50"
                title="সার্ভার সংযোগ পুনরায় পরীক্ষা করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'পরীক্ষা হচ্ছে...' : 'পুনরায় চেষ্টা'}</span>
              </button>

              {/* Reset Database Button */}
              <button
                onClick={() => setIsResetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white border border-red-500/40 text-xs font-semibold transition"
                title="ডাটাবেস টেবিল স্কিমা রিসেট ও সেটআপ"
              >
                <Database className="w-3.5 h-3.5 text-amber-300" />
                <span>ডাটাবেস ক্রিয়েট/রিসেট</span>
              </button>

              {/* Configure URL & Key Button */}
              <button
                onClick={() => {
                  setInputDomain(REST_API_CONFIG.rootDomain);
                  setInputPath(REST_API_CONFIG.path);
                  setInputMasterKey(REST_API_CONFIG.masterKey);
                  setIsConfigModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border border-zinc-600 text-xs font-semibold transition"
                title="ডাটাবেস URL ও মাস্টার কি কনফিগারেশন"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-300" />
                <span>URL ও API Key সেট</span>
              </button>

              {/* Dismiss Button */}
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 text-red-300 hover:text-white rounded-lg hover:bg-red-800/50 transition"
                title="লুকিয়ে রাখুন (মিনিমাইজ)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick DB URL & Master Key Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121418] border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Database URL & Master API Key Settings</h3>
                <p className="text-xs text-zinc-400">লাইভ ডাটাবেস সার্ভার ও মাস্টার API কনফিগারেশন</p>
              </div>
            </div>

            {saveSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  Database Server Root Domain (ডাটাবেস সার্ভার ডোমেইন)
                </label>
                <input
                  type="text"
                  value={inputDomain}
                  onChange={(e) => setInputDomain(e.target.value)}
                  placeholder="https://server.nexarofx.com"
                  className="w-full bg-[#1b1f24] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  DB Server Subpath (পাথ ডিরেক্টরি)
                </label>
                <input
                  type="text"
                  value={inputPath}
                  onChange={(e) => setInputPath(e.target.value)}
                  placeholder="/dbserver"
                  className="w-full bg-[#1b1f24] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Master API Secret Key (মাস্টার কি)
                </label>
                <input
                  type="text"
                  value={inputMasterKey}
                  onChange={(e) => setInputMasterKey(e.target.value)}
                  placeholder="Admin Master Key"
                  className="w-full bg-[#1b1f24] border border-zinc-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none transition"
                />
              </div>

              {/* Resolved Endpoints Preview */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs font-mono">
                <div className="text-zinc-400 text-[11px] font-sans font-medium mb-1">
                  স্বয়ংক্রিয় প্রস্তুতকৃত সংযোগ URLs:
                </div>
                <div className="text-zinc-400 truncate">
                  <span className="text-amber-400/80">Base API: </span>
                  <span className="text-zinc-200">{inputDomain.replace(/\/+$/, '')}{inputPath}/api</span>
                </div>
                <div className="text-zinc-400 truncate">
                  <span className="text-emerald-400/80">Master API: </span>
                  <span className="text-zinc-200">{inputDomain.replace(/\/+$/, '')}{inputPath}/masterapi.php</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="text-xs text-zinc-400 hover:text-amber-300 underline transition"
              >
                ডিফল্ট সেটিংসে ফিরিয়ে নিন (Reset to Defaults)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow-lg shadow-amber-400/20"
                >
                  সেভ ও কানেকশন যাচাই
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Reset / Create Process Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121418] border border-red-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Database Reset & Create Process</h3>
                <p className="text-xs text-zinc-400">ডাটাবেস সম্পূর্ণ রিসেট ও স্কিমা টেবিল ক্রিয়েট প্রসেস</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 mb-4 text-xs text-red-200 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-red-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>সতর্কতা: এটি লাইভ সার্ভারের ডাটাবেস সম্পূর্ণ রিসেট করবে!</span>
              </div>
              <p>
                এই প্রসেসটি চালালে রিমোট MySQL সার্ভারে থাকা বর্তমান টেবিলগুলো ফ্রেশ করে <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">database.sql</code> ফাইল অনুযায়ী নতুন টেবিল ক্রিয়েট করা হবে এবং প্রাথমিক সিস্টেম ডেটা ইনসার্ট করা হবে।
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-zinc-300 pl-1">
                <li>Users, Transactions, Bets, Games টেবিল ফ্রেশ তৈরি হবে</li>
                <li>VIP লেভেল, সিস্টেম সেটিংস ও কনফিগ লোড হবে</li>
                <li>সব এপিআই রুট সরাসরি কানেক্ট হতে পারবে</li>
              </ul>
            </div>

            {resetResult && (
              <div className={`p-4 rounded-xl mb-4 text-xs ${
                resetResult.success
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border border-red-500/40 text-red-200'
              }`}>
                <div className="font-bold flex items-center gap-2 mb-1.5">
                  {resetResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <span>{resetResult.message || (resetResult.success ? 'রিসেট সফল!' : 'রিসেট ব্যর্থ')}</span>
                </div>
                {resetResult.created_tables !== undefined && (
                  <div className="font-mono text-[11px] space-y-0.5 text-zinc-300">
                    <div>মুছে ফেলা টেবিল: {resetResult.dropped_tables} টি</div>
                    <div>তৈরিকৃত নতুন টেবিল: {resetResult.created_tables} টি</div>
                    <div>ডাটাবেস: {resetResult.database}</div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handlePerformResetDatabase}
                disabled={isResetting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'ডাটাবেস রিসেট হচ্ছে...' : 'হ্যাঁ, ডাটাবেস রিসেট ও ক্রিয়েট করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
