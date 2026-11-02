// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Server,
  Folder,
  FileCode,
  FileText,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  Play,
  Upload,
  Download,
  Terminal,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Search,
  Lock,
  ArrowRight,
  Eye,
  X,
  Code,
  Settings,
  Key,
  Globe,
  ShieldAlert,
  RotateCcw,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { api, REST_API_CONFIG, clearDatabaseServerError, setDatabaseServerError } from '../services/api';
import { Language } from '../types';

interface NeextHubMasterManagerProps {
  language: Language;
  showToast: (msg: string) => void;
}

type MasterSubTab = 'database' | 'files' | 'config' | 'reset' | 'sql' | 'status';

export const NeextHubMasterManager: React.FC<NeextHubMasterManagerProps> = ({
  language,
  showToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<MasterSubTab>('database');
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------------------------------------------------
  // Server Status & Ping State
  // --------------------------------------------------------------------------
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // --------------------------------------------------------------------------
  // Config Tab State
  // --------------------------------------------------------------------------
  const [cfgDomain, setCfgDomain] = useState(REST_API_CONFIG.rootDomain);
  const [cfgPath, setCfgPath] = useState(REST_API_CONFIG.path);
  const [cfgMasterKey, setCfgMasterKey] = useState(REST_API_CONFIG.masterKey);
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [configSaveMsg, setConfigSaveMsg] = useState('');

  // --------------------------------------------------------------------------
  // Database Reset Process State
  // --------------------------------------------------------------------------
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState<any | null>(null);

  // --------------------------------------------------------------------------
  // File Manager State
  // --------------------------------------------------------------------------
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isEditingFile, setIsEditingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreateFileOpen, setIsCreateFileOpen] = useState(false);
  const [isCreateDirOpen, setIsCreateDirOpen] = useState(false);
  const [newDirName, setNewDirName] = useState('');

  // --------------------------------------------------------------------------
  // Database Manager State (CRUD)
  // --------------------------------------------------------------------------
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<any>({ total: 0, rows: [], columns: [] });
  const [tablePage, setTablePage] = useState(1);
  const [tableSearch, setTableSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [viewRowModalOpen, setViewRowModalOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>({});
  const [isEditRowModalOpen, setIsEditRowModalOpen] = useState(false);
  const [isAddRowModalOpen, setIsAddRowModalOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // SQL Runner State
  // --------------------------------------------------------------------------
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM `users` LIMIT 10;");
  const [sqlResult, setSqlResult] = useState<any | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [isExecutingSql, setIsExecutingSql] = useState(false);

  // --------------------------------------------------------------------------
  // 1. Check Server Ping
  // --------------------------------------------------------------------------
  const checkPing = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await api.master.ping();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      setServerStatus(res);
      if (res.mysql?.connected) {
        clearDatabaseServerError();
        showToast('Master API ও MySQL ডাটাবেস সার্ভার অনলাইন ও সম্পূর্ণ সংযুক্ত!');
      } else {
        showToast(`সার্ভার অনলাইন কিন্তু MySQL ডাটাবেস ডিসকানেক্টেড: ${res.mysql?.version}`);
      }
    } catch (err: any) {
      showToast(`সার্ভার সংযোগ ত্রুটি: ${err.message}`);
      setServerStatus({
        status: 'offline',
        error: err.message
      });
      setDatabaseServerError({
        errorMessage: err.message,
        targetUrl: REST_API_CONFIG.baseUrl
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 2. Config Actions
  // --------------------------------------------------------------------------
  const handleSaveConfig = async () => {
    REST_API_CONFIG.update({
      rootDomain: cfgDomain,
      path: cfgPath,
      masterKey: cfgMasterKey
    });
    setConfigSaveMsg('কনফিগারেশন সফলভাবে সেভ করা হয়েছে! নতুন তথ্য দিয়ে সংযোগ যাচাই হচ্ছে...');
    setTimeout(() => setConfigSaveMsg(''), 4000);
    showToast('কনফিগারেশন সেভ হয়েছে!');
    await checkPing();
    loadTables();
  };

  const handleResetConfigToDefaults = async () => {
    REST_API_CONFIG.resetToDefaults();
    setCfgDomain(REST_API_CONFIG.rootDomain);
    setCfgPath(REST_API_CONFIG.path);
    setCfgMasterKey(REST_API_CONFIG.masterKey);
    setConfigSaveMsg('ডিফল্ট কনফিগারেশনে ফিরিয়ে নেওয়া হয়েছে!');
    setTimeout(() => setConfigSaveMsg(''), 3000);
    showToast('ডিফল্ট কনফিগারেশন রিস্টোর করা হয়েছে!');
    await checkPing();
    loadTables();
  };

  // --------------------------------------------------------------------------
  // 3. Database Auto-Create & Reset Process
  // --------------------------------------------------------------------------
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const handleAutoCreateDatabase = async () => {
    setIsAutoCreating(true);
    try {
      const res = await api.master.autoCreateDatabase();
      if (res.success) {
        showToast(res.message || 'ডাটাবেস তৈরি ও ডিফল্ট ডেটা সিডিং সফল হয়েছে!');
        clearDatabaseServerError();
        loadTables();
        await checkPing();
      } else {
        showToast('ডাটাবেস ক্রিয়েশন ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      showToast(`ডাটাবেস তৈরি ত্রুটি: ${err.message}`);
    } finally {
      setIsAutoCreating(false);
    }
  };

  const handleExecuteDatabaseReset = async () => {
    if (resetConfirmText.trim().toUpperCase() !== 'RESET') {
      showToast("রিসেট নিশ্চিত করতে 'RESET' লিখুন!");
      return;
    }

    setIsResetting(true);
    setResetResult(null);
    try {
      const res = await api.master.resetDatabase();
      setResetResult(res);
      if (res.success) {
        showToast(res.message || 'ডাটাবেস সফলভাবে রিসেট ও ক্রিয়েট হয়েছে!');
        clearDatabaseServerError();
        setIsResetConfirmModalOpen(false);
        setResetConfirmText('');
        loadTables();
      } else {
        showToast('ডাটাবেস রিসেট ব্যর্থ হয়েছে');
      }
    } catch (err: any) {
      setResetResult({
        success: false,
        message: err.message || 'ডাটাবেস রিসেট করতে সমস্যা হয়েছে'
      });
      showToast(`রিসেট ত্রুটি: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // --------------------------------------------------------------------------
  // 4. Load Files
  // --------------------------------------------------------------------------
  const loadFiles = async (path: string = currentPath) => {
    setIsLoading(true);
    try {
      const res = await api.master.listFiles(path);
      if (res.success) {
        setFiles(res.files);
        setCurrentPath(res.current_path || path);
      }
    } catch (err: any) {
      showToast(`ফাইল লোড ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFile = async (file: any) => {
    if (file.type === 'dir') {
      loadFiles(file.path);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.master.getFile(file.path);
      if (res.success) {
        setSelectedFile(file);
        setFileContent(res.content);
        setIsEditingFile(true);
      }
    } catch (err: any) {
      showToast(`ফাইল পড়তে সমস্যা: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      const res = await api.master.saveFile(selectedFile.path, fileContent);
      if (res.success) {
        showToast('ফাইল সফলভাবে সংরক্ষণ (Save) করা হয়েছে!');
        loadFiles(currentPath);
      }
    } catch (err: any) {
      showToast(`সংরক্ষণ ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewFile = async () => {
    if (!newFileName.trim()) return;
    const fullPath = currentPath ? `${currentPath}/${newFileName.trim()}` : newFileName.trim();
    setIsLoading(true);
    try {
      const res = await api.master.createFile(fullPath, '// New BengalBet Server File\n');
      if (res.success) {
        showToast('নতুন ফাইল তৈরি হয়েছে!');
        setIsCreateFileOpen(false);
        setNewFileName('');
        loadFiles(currentPath);
      }
    } catch (err: any) {
      showToast(`ফাইল তৈরি ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewDir = async () => {
    if (!newDirName.trim()) return;
    const fullPath = currentPath ? `${currentPath}/${newDirName.trim()}` : newDirName.trim();
    setIsLoading(true);
    try {
      const res = await api.master.createDir(fullPath);
      if (res.success) {
        showToast('নতুন ফোল্ডার তৈরি হয়েছে!');
        setIsCreateDirOpen(false);
        setNewDirName('');
        loadFiles(currentPath);
      }
    } catch (err: any) {
      showToast(`ফোল্ডার তৈরি ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে '${path}' মুছে ফেলতে চান?`)) return;
    setIsLoading(true);
    try {
      const res = await api.master.deleteFile(path);
      if (res.success) {
        showToast('সফলভাবে মুছে ফেলা হয়েছে!');
        if (selectedFile?.path === path) {
          setIsEditingFile(false);
          setSelectedFile(null);
        }
        loadFiles(currentPath);
      }
    } catch (err: any) {
      showToast(`মুছে ফেলতে ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // 5. Database CRUD Actions
  // --------------------------------------------------------------------------
  const loadTables = async () => {
    setIsLoading(true);
    try {
      const res = await api.master.getTables();
      if (res.success) {
        setTables(res.tables);
        if (res.tables.length > 0 && !selectedTable) {
          setSelectedTable(res.tables[0].name);
        }
      }
    } catch (err: any) {
      showToast(`ডাটাবেস টেবিল লোড ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTableData = async (table: string = selectedTable, page: number = 1, search: string = tableSearch) => {
    if (!table) return;
    setIsLoading(true);
    try {
      const res = await api.master.getTableData(table, page, 20, search);
      if (res.success) {
        setTableData(res);
        setTablePage(page);
      }
    } catch (err: any) {
      showToast(`ডাটা লোড ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setIsExecutingSql(true);
    setSqlError(null);
    setSqlResult(null);
    try {
      const res = await api.master.runQuery(sqlQuery);
      setSqlResult(res);
      showToast('SQL কোয়েরি সফলভাবে রান হয়েছে!');
      loadTables();
    } catch (err: any) {
      setSqlError(err.message);
    } finally {
      setIsExecutingSql(false);
    }
  };

  const handleImportSchemaOnly = async () => {
    if (!window.confirm('আপনি কি database.sql স্কিমা স্ক্রিপ্ট রান করতে চান?')) return;
    setIsLoading(true);
    try {
      const res = await api.master.importSql();
      if (res.success) {
        showToast('ডাটাবেস স্কিমা সফলভাবে ইমপোর্ট হয়েছে!');
        clearDatabaseServerError();
        loadTables();
      }
    } catch (err: any) {
      showToast(`স্কিমা ইমপোর্ট ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = async (row: any) => {
    const primaryKey = tableData.columns.includes('id') ? 'id' : tableData.columns[0];
    const primaryVal = row[primaryKey];
    if (!primaryVal) return;
    if (!window.confirm(`আপনি কি এই রেকর্ডটি (${primaryKey}=${primaryVal}) মুছে ফেলতে চান?`)) return;

    setIsLoading(true);
    try {
      const res = await api.master.deleteRow(selectedTable, primaryKey, primaryVal);
      if (res.success) {
        showToast('রেকর্ড সফলভাবে মুছে ফেলা হয়েছে!');
        loadTableData(selectedTable, tablePage);
      }
    } catch (err: any) {
      showToast(`মুছে ফেলতে ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditRow = (row: any) => {
    setSelectedRow(row);
    setEditRowData({ ...row });
    setIsEditRowModalOpen(true);
  };

  const handleSaveEditRow = async () => {
    const primaryKey = tableData.columns.includes('id') ? 'id' : tableData.columns[0];
    const primaryVal = selectedRow[primaryKey];
    setIsLoading(true);
    try {
      const res = await api.master.updateRow(selectedTable, primaryKey, primaryVal, editRowData);
      if (res.success) {
        showToast('রেকর্ড সফলভাবে আপডেট হয়েছে!');
        setIsEditRowModalOpen(false);
        loadTableData(selectedTable, tablePage);
      }
    } catch (err: any) {
      showToast(`আপডেট ত্রুটি: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewRow = async () => {
    setIsLoading(true);
    try {
      const res = await api.master.insertRow(selectedTable, newRowData);
      if (res.success) {
        showToast('নতুন রেকর্ড সফলভাবে যুক্ত হয়েছে!');
        setIsAddRowModalOpen(false);
        setNewRowData({});
        loadTableData(selectedTable, 1);
      }
    } catch (err: any) {
      showToast(`নতুন রেকর্ড যোগ ব্যর্থ: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    checkPing();
    loadTables();
    loadFiles('');
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable, 1);
    }
  }, [selectedTable]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Target Server Info */}
      <div className="bg-gradient-to-r from-[#032316] via-[#053723] to-[#032316] p-5 rounded-2xl border border-emerald-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Master API & Live DB Server Controller
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v3.2.0 Live
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5 flex flex-wrap items-center gap-2">
                <span>সার্ভার রুট:</span>
                <code className="bg-black/40 px-2 py-0.5 rounded font-mono text-amber-300 text-xs">
                  {REST_API_CONFIG.rootDomain}{REST_API_CONFIG.path}/
                </code>
                {serverStatus?.mysql?.connected && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> MySQL Connected
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {pingLatency !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-emerald-500/30 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>পিং: {pingLatency} ms</span>
              </div>
            )}

            <button
              onClick={checkPing}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              সার্ভার পিং চেক
            </button>

            <button
              onClick={() => setActiveSubTab('reset')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-700/80 hover:bg-red-600 text-white text-xs font-bold transition shadow-md shadow-red-700/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ডাটাবেস রিসেট
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-emerald-500/20">
          <button
            onClick={() => setActiveSubTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'database'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-black/30 text-emerald-200 hover:bg-emerald-950/60'
            }`}
          >
            <Database className="w-4 h-4" />
            MySQL ডাটাবেস টেবিল ম্যানেজার (CRUD)
          </button>

          <button
            onClick={() => setActiveSubTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'files'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-black/30 text-emerald-200 hover:bg-emerald-950/60'
            }`}
          >
            <Folder className="w-4 h-4" />
            লাইভ সার্ভার ফাইল ম্যানেজার (CRUD)
          </button>

          <button
            onClick={() => setActiveSubTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'config'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-black/30 text-emerald-200 hover:bg-emerald-950/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            ডাটাবেস URL ও মাস্টার API কি
          </button>

          <button
            onClick={() => setActiveSubTab('reset')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'reset'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                : 'bg-black/30 text-red-300 hover:bg-red-950/60'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            ডাটাবেস রিসেট ও ক্রিয়েট প্রসেস
          </button>

          <button
            onClick={() => setActiveSubTab('sql')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'sql'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-black/30 text-emerald-200 hover:bg-emerald-950/60'
            }`}
          >
            <Terminal className="w-4 h-4" />
            সরাসরি SQL কোয়েরি রানার
          </button>

          <button
            onClick={() => setActiveSubTab('status')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'status'
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                : 'bg-black/30 text-emerald-200 hover:bg-emerald-950/60'
            }`}
          >
            <Server className="w-4 h-4" />
            সার্ভার স্ট্যাটাস ও সিস্টেম বিবরণ
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. MYSQL DATABASE MANAGER VIEW (SMART DB CRUD) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Table Selector */}
          <div className="lg:col-span-1 bg-[#031d13] border border-emerald-500/20 rounded-2xl p-4 shadow-lg h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                টেবিল তালিকা ({tables.length})
              </span>
              <button
                onClick={loadTables}
                className="text-emerald-400 hover:text-white transition"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-[550px] overflow-y-auto pr-1">
              {tables.map(t => (
                <button
                  key={t.name}
                  onClick={() => {
                    setSelectedTable(t.name);
                    setTableSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition ${
                    selectedTable === t.name
                      ? 'bg-amber-400 text-black font-bold'
                      : 'bg-emerald-950/30 text-emerald-200 hover:bg-emerald-900/40'
                  }`}
                >
                  <span className="truncate">{t.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    selectedTable === t.name ? 'bg-black/30 text-black' : 'bg-black/40 text-emerald-400'
                  }`}>
                    {t.rows} সারি
                  </span>
                </button>
              ))}
              {tables.length === 0 && (
                <div className="p-4 text-center text-xs text-zinc-400">
                  কোনো টেবিল পাওয়া যায়নি। ডাটাবেস রিসেট বা স্কিমা ইমপোর্ট করুন।
                </div>
              )}
            </div>
          </div>

          {/* Right Table Data Grid (CRUD Table) */}
          <div className="lg:col-span-3 bg-[#031d13] border border-emerald-500/20 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  টেবিল: <code className="text-amber-300">{selectedTable}</code>
                </h3>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  মোট {tableData.total || 0} টি রেকর্ড সংরক্ষিত আছে
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadTableData(selectedTable, 1, tableSearch)}
                    placeholder="টেবিল সার্চ..."
                    className="bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-1.5 pl-8 text-xs text-white placeholder-emerald-500/50 focus:outline-none focus:border-amber-400"
                  />
                  <Search className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />
                </div>

                <button
                  onClick={() => setIsAddRowModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  নতুন সারি
                </button>

                <button
                  onClick={() => loadTableData(selectedTable, tablePage, tableSearch)}
                  className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-emerald-300 border border-emerald-500/30"
                  title="রিফ্রেশ"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Display */}
            <div className="overflow-x-auto rounded-xl border border-emerald-500/20 max-h-[500px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#02180f] text-emerald-300 sticky top-0 border-b border-emerald-500/30">
                  <tr>
                    <th className="px-3 py-2.5 font-bold uppercase tracking-wider">অ্যাকশন</th>
                    {tableData.columns?.map((col: string) => (
                      <th key={col} className="px-3 py-2.5 font-mono font-bold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/40">
                  {tableData.rows?.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-emerald-950/30 transition group">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRow(row);
                              setViewRowModalOpen(true);
                            }}
                            className="p-1 rounded bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300"
                            title="ভিউ বিবরণ"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleOpenEditRow(row)}
                            className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-300"
                            title="এডিট"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(row)}
                            className="p-1 rounded bg-red-500/20 hover:bg-red-500/40 text-red-400"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      {tableData.columns?.map((col: string) => {
                        const val = row[col];
                        const displayVal = val === null ? (
                          <span className="text-zinc-500 italic">null</span>
                        ) : typeof val === 'object' ? (
                          JSON.stringify(val)
                        ) : (
                          String(val)
                        );
                        return (
                          <td key={col} className="px-3 py-2 text-zinc-300 font-mono max-w-[200px] truncate">
                            {displayVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {(!tableData.rows || tableData.rows.length === 0) && (
                    <tr>
                      <td colSpan={(tableData.columns?.length || 0) + 1} className="p-8 text-center text-zinc-400">
                        এই টেবিলে কোনো রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {tableData.total > 20 && (
              <div className="flex items-center justify-between pt-3 border-t border-emerald-500/20 text-xs">
                <span className="text-emerald-400">
                  পৃষ্ঠা {tablePage} (মোট {Math.ceil(tableData.total / 20)} পৃষ্ঠা)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={tablePage <= 1}
                    onClick={() => loadTableData(selectedTable, tablePage - 1)}
                    className="px-3 py-1.5 rounded-lg bg-black/40 text-emerald-300 disabled:opacity-40"
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    disabled={tablePage * 20 >= tableData.total}
                    onClick={() => loadTableData(selectedTable, tablePage + 1)}
                    className="px-3 py-1.5 rounded-lg bg-black/40 text-emerald-300 disabled:opacity-40"
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. FILE MANAGER VIEW (SMART FILES CRUD) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'files' && (
        <div className="bg-[#031d13] border border-emerald-500/20 rounded-2xl p-5 shadow-lg space-y-4">
          {/* Header & Path Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2 flex-wrap">
              <Folder className="w-5 h-5 text-amber-400" />
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  onClick={() => loadFiles('')}
                  className="px-2 py-1 rounded bg-black/40 hover:bg-black/60 text-emerald-300 font-bold"
                >
                  root (dbserver)
                </button>
                {currentPath.split('/').filter(Boolean).map((seg, idx, arr) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                    <button
                      onClick={() => loadFiles(arr.slice(0, idx + 1).join('/'))}
                      className="px-2 py-1 rounded bg-black/40 hover:bg-black/60 text-amber-300"
                    >
                      {seg}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateFileOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> নতুন ফাইল
              </button>
              <button
                onClick={() => setIsCreateDirOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                <Folder className="w-3.5 h-3.5" /> নতুন ফোল্ডার
              </button>
              <button
                onClick={() => loadFiles(currentPath)}
                className="p-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-emerald-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-app File Editor */}
          {isEditingFile && selectedFile ? (
            <div className="space-y-3 p-4 bg-black/40 rounded-xl border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs text-amber-300">{selectedFile.path}</span>
                  <span className="text-[10px] text-emerald-500">({selectedFile.size_formatted})</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveFile}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> সংরক্ষণ করুন (Save)
                  </button>
                  <button
                    onClick={() => setIsEditingFile(false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 text-xs hover:bg-emerald-900 transition"
                  >
                    বন্ধ করুন
                  </button>
                </div>
              </div>

              <textarea
                rows={18}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="w-full bg-[#02100a] border border-emerald-500/30 rounded-xl p-3 font-mono text-xs text-emerald-100 focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>
          ) : (
            /* File Listing Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map(f => (
                <div
                  key={f.path}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-950/20 transition group"
                >
                  <div
                    onClick={() => handleOpenFile(f)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    {f.type === 'dir' ? (
                      <Folder className="w-6 h-6 text-amber-400 shrink-0" />
                    ) : (
                      <FileCode className="w-6 h-6 text-emerald-400 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-emerald-400/60 mt-0.5">
                        {f.type === 'dir' ? 'ফোল্ডার' : `${f.size_formatted} • ${f.modified}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pl-2">
                    {f.type === 'file' && (
                      <button
                        onClick={() => handleOpenFile(f)}
                        className="p-1 rounded bg-emerald-800/40 hover:bg-emerald-700 text-emerald-300"
                        title="এডিট"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFile(f.path)}
                      className="p-1 rounded bg-red-950/60 hover:bg-red-800 text-red-300"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <div className="col-span-full p-8 text-center text-xs text-zinc-400">
                  কোনো ফাইল বা ফোল্ডার পাওয়া যায়নি।
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. CONFIGURATION VIEW (DATABASE URL & MASTER KEY OPTION) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'config' && (
        <div className="bg-[#031d13] border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-emerald-500/20 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              ডাটাবেস সার্ভার URL ও মাস্টার API কি কনফিগারেশন
            </h3>
            <p className="text-xs text-emerald-300/80 mt-1">
              BengalBet লাইভ সার্ভার ডোমেইন, পাথ ডিরেক্টরি এবং মাস্টার সিক্রেট কি পরিবর্তন বা রিস্টোর করুন
            </p>
          </div>

          {configSaveMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{configSaveMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-black/30 p-5 rounded-2xl border border-emerald-500/20">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                সার্ভার প্যারামিটারসমূহ
              </span>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  Database Server Root Domain (সার্ভার ডোমেইন URL)
                </label>
                <input
                  type="text"
                  value={cfgDomain}
                  onChange={(e) => setCfgDomain(e.target.value)}
                  placeholder="https://server.nexarofx.com"
                  className="w-full bg-[#02100a] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  DB Server Path (পাথ ডিরেক্টরি)
                </label>
                <input
                  type="text"
                  value={cfgPath}
                  onChange={(e) => setCfgPath(e.target.value)}
                  placeholder="/dbserver"
                  className="w-full bg-[#02100a] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Master API Secret Key (মাস্টার সিক্রেট কি)
                </label>
                <div className="relative">
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    value={cfgMasterKey}
                    onChange={(e) => setCfgMasterKey(e.target.value)}
                    placeholder="Admin Master Key"
                    className="w-full bg-[#02100a] border border-emerald-500/30 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white font-mono outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-3 top-2.5 text-emerald-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
                <button
                  type="button"
                  onClick={handleResetConfigToDefaults}
                  className="text-xs text-zinc-400 hover:text-amber-300 underline transition"
                >
                  ডিফল্ট সেটিংসে ফিরিয়ে নিন (Reset Defaults)
                </button>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow-lg shadow-amber-400/20"
                >
                  সেভ ও কানেকশন টেস্ট
                </button>
              </div>
            </div>

            {/* Resolved URLs & Live Health Card */}
            <div className="space-y-4 bg-black/30 p-5 rounded-2xl border border-emerald-500/20">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                স্বয়ংক্রিয় এপিআই রুট ও কানেকশন অবস্থা
              </span>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#02100a] border border-emerald-500/20">
                  <span className="text-emerald-400 text-[11px] block mb-0.5">Base API রুট:</span>
                  <span className="text-white truncate block">{cfgDomain.replace(/\/+$/, '')}{cfgPath}/api</span>
                </div>
                <div className="p-3 rounded-xl bg-[#02100a] border border-emerald-500/20">
                  <span className="text-amber-400 text-[11px] block mb-0.5">Master API রুট:</span>
                  <span className="text-white truncate block">{cfgDomain.replace(/\/+$/, '')}{cfgPath}/masterapi.php</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#02100a] border border-emerald-500/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">সার্ভার পিং স্থিতি:</span>
                  <span className="font-semibold text-emerald-400">
                    {serverStatus?.status === 'online' ? '✅ অনলাইন' : '❌ অফলাইন'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">MySQL ডাটাবেস:</span>
                  <span className={`font-semibold ${serverStatus?.mysql?.connected ? 'text-emerald-400' : 'text-red-400'}`}>
                    {serverStatus?.mysql?.connected ? '✅ সংযুক্ত (Connected)' : '❌ ডিসকানেক্টেড'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">PHP ভার্সন:</span>
                  <span className="font-mono text-zinc-300">{serverStatus?.php_version || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">টেবিল সংখ্যা:</span>
                  <span className="font-mono text-zinc-300">{serverStatus?.mysql?.table_count || tables.length} টি</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. DATABASE RESET & CREATE PROCESS VIEW */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'reset' && (
        <div className="bg-[#031d13] border border-red-500/30 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-red-500/30 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-400" />
              ডাটাবেস সম্পূর্ণ রিসেট ও ক্রিয়েট প্রসেস (Database Reset & Create Process)
            </h3>
            <p className="text-xs text-red-200/80 mt-1">
              রিমোট MySQL ডাটাবেসে টেবিল ক্রিয়েট করা, স্কিমা রিসেট করা এবং সিস্টেম ডাটা ইনিশিয়ালাইজ করা
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Action Card 1: Full Clean Reset */}
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <ShieldAlert className="w-5 h-5" />
                <span>অপশন ১: সম্পূর্ণ ক্লিন রিসেট (Clean Drop & Recreate)</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                এই প্রক্রিয়াটি সমস্ত পুরাতন বা কারাপ্ট টেবিল মুছে ফেলে <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">database.sql</code> ফাইল থেকে নতুনভাবে সমস্ত টেবিল (Users, Transactions, Bets, Games ইত্যাদি) ফ্রেশ ক্রিয়েট করে এবং প্রাথমিক সেটিংস লোড করে।
              </p>
              <button
                onClick={() => {
                  setResetConfirmText('');
                  setIsResetConfirmModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition shadow-lg shadow-red-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                ডাটাবেস সম্পূর্ণ রিসেট ও ক্রিয়েট শুরু করুন
              </button>
            </div>

            {/* Action Card 2: Schema Import Only */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Database className="w-5 h-5" />
                <span>অপশন ২: শুধু স্কিমা ইমপোর্ট (Schema Import Only)</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                যদি বর্তমান ডাটা অক্ষুণ্ণ রেখে শুধু অনুপস্থিত টেবিলগুলো তৈরি করতে চান (CREATE TABLE IF NOT EXISTS), তবে এই বাটনে ক্লিক করুন।
              </p>
              <button
                onClick={handleImportSchemaOnly}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                database.sql স্কিমা ইমপোর্ট করুন
              </button>
            </div>
          </div>

          {/* Reset Result Display */}
          {resetResult && (
            <div className={`p-5 rounded-2xl border text-xs space-y-3 ${
              resetResult.success
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {resetResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <span>{resetResult.message}</span>
              </div>

              {resetResult.tables && (
                <div className="space-y-2 pt-2 border-t border-emerald-500/20">
                  <div className="font-semibold text-emerald-300">
                    সফলভাবে তৈরি হওয়া টেবিলসমূহ ({resetResult.tables.length} টি):
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {resetResult.tables.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-black/40 text-[11px] font-mono text-amber-300 border border-emerald-500/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. DIRECT SQL QUERY RUNNER */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'sql' && (
        <div className="bg-[#031d13] border border-emerald-500/20 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                সরাসরি SQL কোয়েরি কনসোল (Query Runner)
              </h3>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                MySQL সার্ভারে সরাসরি SELECT, INSERT, UPDATE, DELETE বা SHOW কোয়েরি রান করুন
              </p>
            </div>
            <button
              onClick={handleExecuteSql}
              disabled={isExecutingSql}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition shadow disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isExecutingSql ? 'animate-spin' : ''}`} />
              কোয়েরি রান করুন (Execute)
            </button>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-zinc-400 self-center text-[11px]">প্রিসেট কোয়েরি:</span>
            {[
              "SHOW TABLES;",
              "SELECT * FROM `users` LIMIT 10;",
              "SELECT * FROM `transactions` ORDER BY `id` DESC LIMIT 10;",
              "SELECT COUNT(*) as total_bets FROM `bets`;",
              "DESCRIBE `users`;"
            ].map(q => (
              <button
                key={q}
                onClick={() => setSqlQuery(q)}
                className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-emerald-950 text-emerald-300 font-mono text-[11px] border border-emerald-500/20"
              >
                {q}
              </button>
            ))}
          </div>

          <textarea
            rows={5}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-[#02100a] border border-emerald-500/30 rounded-xl p-3 font-mono text-xs text-emerald-100 focus:outline-none focus:border-amber-400"
            placeholder="SELECT * FROM users;"
          />

          {sqlError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-mono">
              ত্রুটি: {sqlError}
            </div>
          )}

          {sqlResult && (
            <div className="space-y-2 pt-2 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>কোয়েরি টাইপ: {sqlResult.query_type}</span>
                <span>{sqlResult.count !== undefined ? `${sqlResult.count} টি রেকর্ড পাওয়া গেছে` : `প্রভাবিত সারি: ${sqlResult.affected_rows}`}</span>
              </div>
              {sqlResult.rows && sqlResult.rows.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-emerald-500/20 max-h-[350px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#02180f] text-emerald-300 sticky top-0">
                      <tr>
                        {Object.keys(sqlResult.rows[0]).map(col => (
                          <th key={col} className="px-3 py-2 font-mono font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {sqlResult.rows.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-emerald-950/30">
                          {Object.keys(sqlResult.rows[0]).map(col => (
                            <td key={col} className="px-3 py-1.5 text-zinc-300 font-mono max-w-[200px] truncate">
                              {String(row[col])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 6. SERVER STATUS VIEW */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'status' && (
        <div className="bg-[#031d13] border border-emerald-500/20 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-emerald-500/20 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-amber-400" />
              লাইভ সার্ভার স্থিতি ও ডেপ্লয়মেন্ট সেটিংস
            </h3>
            <p className="text-xs text-emerald-300/80 mt-1">
              BengalBet PHP ও MySQL সার্ভারের অভ্যন্তরীণ স্বাস্থ্য ও কনফিগারেশন বিবরণী
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block">
                সিস্টেম প্যারামিটার
              </span>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">রুট ডোমেন:</span>
                <span className="font-mono text-white">{REST_API_CONFIG.rootDomain}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">পাথ:</span>
                <span className="font-mono text-white">{REST_API_CONFIG.path}/</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">PHP সংস্করণ:</span>
                <span className="font-mono text-white">{serverStatus?.php_version || '8.x'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">MySQL সংযোগ:</span>
                <span className="font-semibold text-emerald-400">
                  {serverStatus?.mysql?.connected ? 'সংযুক্ত (Connected)' : 'অপেক্ষমান'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400">মোট টেবিল সংখ্যা:</span>
                <span className="font-mono text-white">{tables.length} টি</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20 space-y-3 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block">
                ফাইলসিস্টেম তথ্য
              </span>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">সার্ভার রুট পাথ:</span>
                <span className="font-mono text-white truncate max-w-[220px]">{serverStatus?.filesystem?.root_path || '/var/www'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-emerald-950/60">
                <span className="text-emerald-400">ফোল্ডার রাইটেবল:</span>
                <span className="font-semibold text-emerald-400">{serverStatus?.filesystem?.is_writable ? 'হ্যাঁ (Writable)' : 'না'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-emerald-400">ফ্রি স্পেস:</span>
                <span className="font-mono text-white">{serverStatus?.filesystem?.free_space_mb || 0} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODALS */}
      {/* ------------------------------------------------------------------ */}

      {/* MODAL: Full Database Reset Confirmation */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#121418] border border-red-500/50 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">ডাটাবেস রিসেট নিশ্চিতকরণ</h4>
                <p className="text-xs text-red-300">এটি সমস্ত বর্তমান টেবিল মুছে ফেলে ফ্রেশ করবে</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              নিশ্চিত করতে নিচে <span className="font-mono font-bold text-amber-300">RESET</span> টাইপ করুন:
            </p>

            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="RESET লিখুন"
              className="w-full bg-[#1a1d22] border border-red-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono outline-none focus:border-red-400 text-center tracking-widest uppercase font-bold"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleExecuteDatabaseReset}
                disabled={isResetting || resetConfirmText.trim().toUpperCase() !== 'RESET'}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/30 disabled:opacity-40"
              >
                {isResetting ? 'রিসেট হচ্ছে...' : 'রিসেট সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: View Row Details */}
      {viewRowModalOpen && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#032316] border border-emerald-500/40 rounded-2xl w-full max-w-xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                সারি বিস্তারিত রেকর্ড ({selectedTable})
              </h4>
              <button onClick={() => setViewRowModalOpen(false)} className="text-emerald-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {Object.entries(selectedRow).map(([k, v]) => (
                <div key={k} className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                  <span className="font-mono text-emerald-400 shrink-0">{k}:</span>
                  <span className="font-mono text-white text-right truncate flex-1">{String(v)}</span>
                  <button
                    onClick={() => copyToClipboard(String(v), k)}
                    className="text-zinc-400 hover:text-white p-1 rounded hover:bg-emerald-950/60"
                    title="কপি"
                  >
                    {copiedKey === k ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-emerald-500/20">
              <button
                onClick={() => setViewRowModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-900/60 text-emerald-300 text-xs hover:bg-emerald-800"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Row */}
      {isEditRowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#032316] border border-amber-400/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                সারি এডিট করুন ({selectedTable})
              </h4>
              <button onClick={() => setIsEditRowModalOpen(false)} className="text-emerald-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {tableData.columns?.map((col: string) => (
                <div key={col}>
                  <label className="text-xs font-semibold text-emerald-300 mb-1 block">
                    {col}
                  </label>
                  <input
                    type="text"
                    disabled={col === 'id'}
                    value={editRowData[col] !== undefined ? editRowData[col] : ''}
                    onChange={(e) => setEditRowData({ ...editRowData, [col]: e.target.value })}
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-emerald-500/20">
              <button
                onClick={() => setIsEditRowModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-black/40 text-xs text-emerald-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEditRow}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold"
              >
                সংরক্ষণ করুন (Update)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Insert New Row */}
      {isAddRowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#032316] border border-amber-400/40 rounded-2xl w-full max-w-lg p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                নতুন সারি যোগ করুন ({selectedTable})
              </h4>
              <button onClick={() => setIsAddRowModalOpen(false)} className="text-emerald-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {tableData.columns?.map((col: string) => (
                <div key={col}>
                  <label className="text-xs font-semibold text-emerald-300 mb-1 block">
                    {col}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${col}`}
                    value={newRowData[col] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [col]: e.target.value })}
                    className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-emerald-500/20">
              <button
                onClick={() => setIsAddRowModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-black/40 text-xs text-emerald-300"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveNewRow}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold"
              >
                যুক্ত করুন (Insert)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create File */}
      {isCreateFileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#032316] border border-amber-400/40 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" /> নতুন ফাইল তৈরি করুন
            </h4>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. custom_handler.php"
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreateFileOpen(false)} className="px-3 py-1.5 rounded-xl bg-black/40 text-xs text-emerald-300">
                বাতিল
              </button>
              <button onClick={handleCreateNewFile} className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold">
                তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Create Directory */}
      {isCreateDirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#032316] border border-amber-400/40 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" /> নতুন ফোল্ডার তৈরি করুন
            </h4>
            <input
              type="text"
              value={newDirName}
              onChange={(e) => setNewDirName(e.target.value)}
              placeholder="e.g. uploads"
              className="w-full bg-black/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreateDirOpen(false)} className="px-3 py-1.5 rounded-xl bg-black/40 text-xs text-emerald-300">
                বাতিল
              </button>
              <button onClick={handleCreateNewDir} className="px-3 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold">
                তৈরি করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
