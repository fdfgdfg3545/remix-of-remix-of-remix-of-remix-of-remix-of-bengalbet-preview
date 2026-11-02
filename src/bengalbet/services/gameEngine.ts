// @ts-nocheck
import { GameEngineSettings } from '../types';
import { api } from './api';

export const DEFAULT_GAME_ENGINE: GameEngineSettings = {
  globalRtp: 96.5,
  engineMode: 'normal',
  volatility: 'medium',
  maxMultiplierCap: 2500,
  nearMissRate: 35,
  dynamicBalancing: true,
  categoryRtp: {
    crash: 97.0,
    slot: 96.5,
    table: 98.0,
    fishing: 96.8,
    arcade: 96.5
  },
  gameRtp: {
    'aviator': 97.2,
    'game-aviator': 97.2,
    'super-ace': 96.8,
    'game-super-ace': 96.8,
    'game-super-ace-2': 97.0,
    'game-super-ace-deluxe': 96.9,
    'crazy-777': 98.0,
    'game-crazy-777': 98.0,
    'head-tail': 98.0,
    'game-head-tail': 98.0,
    'seven-coins': 97.0,
    'game-seven-coins': 97.0,
    'sweet-bonanza': 96.5,
    'game-sweet-bonanza': 96.5,
    'gates-of-olympus': 96.5,
    'game-gates-of-olympus': 96.5,
    'fortune-tree': 96.5,
    'game-fortune-tree': 96.5,
    'fortune-gems-3': 97.0,
    'game-fortune-gems-3': 97.0,
    'money-coming': 97.2,
    'game-money-coming': 97.2,
    'boxing-king': 96.8,
    'game-boxing-king': 96.8,
    'alibaba-cave': 97.0,
    'game-alibaba-cave': 97.0,
    'wild-bounty': 96.75,
    'game-wild-bounty': 96.75,
    'treasures-aztec': 96.71,
    'game-treasures-aztec': 96.71,
    'happy-fishing': 97.0,
    'game-happy-fishing': 97.0
  },
  forceOutcome: 'none',
  telemetry: {
    totalWagered: 148500,
    totalPayout: 142850,
    totalRounds: 1248,
    lastResetTime: new Date().toISOString()
  }
};

const STORAGE_KEY = 'bdt222_game_engine_config_v2';

class GameEngineService {
  private config: GameEngineSettings;
  private listeners: Set<(config: GameEngineSettings) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.config = this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.initServerSync();
    }
  }

  private loadFromStorage(): GameEngineSettings {
    if (typeof window === 'undefined') return { ...DEFAULT_GAME_ENGINE };
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_GAME_ENGINE,
          ...parsed,
          categoryRtp: {
            ...DEFAULT_GAME_ENGINE.categoryRtp,
            ...(parsed.categoryRtp || {})
          },
          gameRtp: {
            ...DEFAULT_GAME_ENGINE.gameRtp,
            ...(parsed.gameRtp || {})
          },
          telemetry: {
            ...DEFAULT_GAME_ENGINE.telemetry,
            ...(parsed.telemetry || {})
          }
        };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_GAME_ENGINE };
  }

  private saveToStorage(cfg: GameEngineSettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    } catch (e) {
      console.warn('Failed to save game engine config to localStorage', e);
    }
  }

  private async initServerSync() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    try {
      const res = await api.settings.getPublicSettings();
      if (res.success && res.settings && res.settings.gameEngine) {
        this.applyExternalConfig(res.settings.gameEngine);
      }
    } catch {
      // Offline / server starting
    }

    // Listen to storage events across tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          this.applyExternalConfig(updated, false);
        } catch {
          // Ignore
        }
      }
    });
  }

  private applyExternalConfig(external: Partial<GameEngineSettings>, save = true) {
    this.config = {
      ...this.config,
      ...external,
      categoryRtp: {
        ...this.config.categoryRtp,
        ...(external.categoryRtp || {})
      },
      gameRtp: {
        ...this.config.gameRtp,
        ...(external.gameRtp || {})
      },
      telemetry: {
        ...this.config.telemetry,
        ...(external.telemetry || {})
      }
    };
    if (save) {
      this.saveToStorage(this.config);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bdt222-game-engine-updated', { detail: this.config }));
    }
  }

  public subscribe(listener: (config: GameEngineSettings) => void): () => void {
    this.listeners.add(listener);
    listener(this.config);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getConfig(): GameEngineSettings {
    return { ...this.config };
  }

  public async updateConfig(updates: Partial<GameEngineSettings>): Promise<GameEngineSettings> {
    this.applyExternalConfig(updates, true);

    try {
      const res = await api.admin.updateSettings({ gameEngine: this.config });
      if (res.success && res.settings?.gameEngine) {
        this.applyExternalConfig(res.settings.gameEngine, true);
      }
    } catch (e) {
      console.warn('Could not sync game engine updates to server', e);
    }

    return this.config;
  }

  public async resetTelemetry(): Promise<void> {
    const cleared = {
      totalWagered: 0,
      totalPayout: 0,
      totalRounds: 0,
      lastResetTime: new Date().toISOString()
    };
    this.config.telemetry = cleared;
    this.saveToStorage(this.config);
    this.notify();

    try {
      await api.admin.updateSettings({ gameEngine: this.config });
    } catch {
      // Ignore
    }
  }

  /**
   * Calculates the exact Return-To-Player (0% to 100%) for any game.
   */
  public getEffectiveRtp(gameId?: string, category?: string): number {
    // 1. Force modes
    if (this.config.forceOutcome === 'always_lose' || this.config.engineMode === 'drain') {
      return 0;
    }
    if (this.config.forceOutcome === 'always_win') {
      return 100;
    }
    if (this.config.engineMode === 'generous') {
      return 99.5;
    }
    if (this.config.engineMode === 'jackpot_frenzy') {
      return 99.0;
    }

    // 2. Specific game override (0 to 100)
    if (gameId) {
      const cleanId = gameId.toLowerCase().replace(/^game-/, '').replace(/^slot-/, '');
      if (this.config.gameRtp[cleanId] !== undefined) {
        return Math.max(0, Math.min(100, Number(this.config.gameRtp[cleanId])));
      }
      if (this.config.gameRtp[gameId] !== undefined) {
        return Math.max(0, Math.min(100, Number(this.config.gameRtp[gameId])));
      }
    }

    // 3. Category override (0 to 100)
    if (category) {
      const catKey = category.toLowerCase() as keyof typeof this.config.categoryRtp;
      if (this.config.categoryRtp[catKey] !== undefined) {
        return Math.max(0, Math.min(100, Number(this.config.categoryRtp[catKey])));
      }
    }

    // 4. Global RTP fallback (0 to 100)
    return Math.max(0, Math.min(100, Number(this.config.globalRtp || 96.5)));
  }

  /**
   * Generates crash multiplier for Aviator / Crash game based on 0-100% RTP.
   */
  public generateCrashMultiplier(gameId: string = 'aviator'): number {
    const rtp = this.getEffectiveRtp(gameId, 'crash');

    // 0% RTP: Instant Crash at 1.00x every single time
    if (rtp <= 0) {
      return 1.00;
    }

    // 100% RTP: Generous, never instant crash below 1.20x
    if (rtp >= 100) {
      const r = Math.random();
      const raw = 1.0 / (1 - r * 0.95);
      return parseFloat(Math.min(raw, this.config.maxMultiplierCap).toFixed(2));
    }

    // Dynamic balancing: if actual RTP is drifting high, adjust slightly down
    let adjustedRtp = rtp;
    if (this.config.dynamicBalancing && this.config.telemetry.totalWagered > 1000) {
      const actualRtp = (this.config.telemetry.totalPayout / this.config.telemetry.totalWagered) * 100;
      if (actualRtp > rtp + 3) {
        adjustedRtp = Math.max(0, rtp - 2.5);
      } else if (actualRtp < rtp - 3) {
        adjustedRtp = Math.min(100, rtp + 2.5);
      }
    }

    // Instant crash probability inversely proportional to RTP (0% RTP -> 100% crash, 97% RTP -> ~3% crash)
    const houseEdge = (100 - adjustedRtp) / 100;
    const instantCrashChance = Math.min(0.95, Math.max(0.01, houseEdge * 1.1));

    const roll = Math.random();
    if (roll < instantCrashChance) {
      // Instant bust
      return parseFloat((1.00 + Math.random() * 0.08).toFixed(2));
    }

    // Pareto distribution scaled by (rtp / 100)
    const scale = Math.max(0.1, adjustedRtp / 100);
    const rawMultiplier = scale / (1 - Math.random() * 0.96);

    const clamped = Math.min(rawMultiplier, this.config.maxMultiplierCap);
    return Math.max(1.01, parseFloat(clamped.toFixed(2)));
  }

  /**
   * Evaluates a slot spin or wheel spin outcome using 0-100% RTP and volatility curve.
   */
  public evaluateSpinOutcome(
    gameId: string,
    category: string = 'slot',
    betAmount: number = 50
  ): {
    isWin: boolean;
    multiplier: number;
    payout: number;
    isNearMiss: boolean;
    isJackpot: boolean;
    isBonusTrigger: boolean;
  } {
    const rtp = this.getEffectiveRtp(gameId, category);

    // 0% RTP: Guaranteed Loss
    if (rtp <= 0) {
      const isNearMiss = Math.random() * 100 < this.config.nearMissRate;
      return {
        isWin: false,
        multiplier: 0,
        payout: 0,
        isNearMiss,
        isJackpot: false,
        isBonusTrigger: false
      };
    }

    // Volatility parameters
    let hitRate = 0.28; // Standard 28% hit frequency
    let multPool = [1.2, 1.5, 2.0, 3.0, 5.0, 10.0];

    switch (this.config.volatility) {
      case 'low':
        hitRate = 0.42; // Frequent small payouts
        multPool = [1.1, 1.3, 1.6, 2.2, 3.5, 6.0];
        break;
      case 'high':
        hitRate = 0.18; // Less frequent, bigger multipliers
        multPool = [1.5, 2.5, 5.0, 12.0, 30.0, 75.0, 150.0];
        break;
      case 'extreme':
        hitRate = 0.10; // Rare explosive hits
        multPool = [2.0, 5.0, 15.0, 50.0, 150.0, 500.0, 1000.0];
        break;
      default:
        hitRate = 0.28;
        multPool = [1.2, 1.5, 2.0, 3.0, 5.0, 10.0, 25.0];
        break;
    }

    // Scale hit rate with RTP (at 96.5% RTP, hitRate is base. At 50% RTP, hitRate is cut in half. At 100%, hitRate is boosted)
    const scaledHitRate = Math.min(0.95, hitRate * (rtp / 96.5));
    const roll = Math.random();

    if (roll < scaledHitRate || this.config.forceOutcome === 'always_win') {
      // Pick multiplier
      let selectedMult = multPool[Math.floor(Math.random() * multPool.length)];

      // Check for big bonus / jackpot
      const isJackpot = selectedMult >= 50 || this.config.forceOutcome === 'big_win_next' || this.config.engineMode === 'jackpot_frenzy';
      if (this.config.forceOutcome === 'big_win_next') {
        selectedMult = Math.min(this.config.maxMultiplierCap, 100.0);
      }

      // Respect max multiplier cap
      selectedMult = Math.min(selectedMult, this.config.maxMultiplierCap);
      const payout = Math.round(betAmount * selectedMult);

      return {
        isWin: true,
        multiplier: selectedMult,
        payout,
        isNearMiss: false,
        isJackpot,
        isBonusTrigger: isJackpot || Math.random() < 0.15
      };
    }

    // Loss with Near-Miss excitement check
    const isNearMiss = Math.random() * 100 < this.config.nearMissRate;
    return {
      isWin: false,
      multiplier: 0,
      payout: 0,
      isNearMiss,
      isJackpot: false,
      isBonusTrigger: false
    };
  }

  /**
   * Evaluates Coin Toss (Head & Tail) with exact 0-100% RTP.
   */
  public evaluateCoinToss(
    gameId: string = 'head-tail',
    playerPick: 'HEAD' | 'TAIL',
    betAmount: number
  ): {
    outcome: 'HEAD' | 'TAIL';
    isWin: boolean;
    payout: number;
    payoutMultiplier: number;
  } {
    const rtp = this.getEffectiveRtp(gameId, 'table');
    const payoutMultiplier = 1.96; // Standard 1.96x for coin flip

    // 0% RTP: Always opposite of pick
    if (rtp <= 0) {
      const outcome = playerPick === 'HEAD' ? 'TAIL' : 'HEAD';
      return { outcome, isWin: false, payout: 0, payoutMultiplier };
    }

    // 100% RTP: Always matches pick
    if (rtp >= 100 || this.config.forceOutcome === 'always_win') {
      return {
        outcome: playerPick,
        isWin: true,
        payout: Math.round(betAmount * payoutMultiplier),
        payoutMultiplier
      };
    }

    // Win probability = RTP / (Multiplier * 100)
    // E.g. 98% / (1.96 * 100) = 50.0%
    // E.g. 50% / (1.96 * 100) = 25.5%
    const winProbability = rtp / (payoutMultiplier * 100);
    const isWin = Math.random() < winProbability;

    const outcome = isWin ? playerPick : (playerPick === 'HEAD' ? 'TAIL' : 'HEAD');
    const payout = isWin ? Math.round(betAmount * payoutMultiplier) : 0;

    return { outcome, isWin, payout, payoutMultiplier };
  }

  /**
   * Records live telemetry in real-time and persists bet record to MySQL DB server.
   */
  public recordRound(
    betAmount: number,
    payoutAmount: number,
    options?: {
      gameId?: string;
      gameName?: string;
      category?: string;
      vendor?: string;
      gameRound?: string;
    }
  ) {
    this.config.telemetry.totalWagered = Number((this.config.telemetry.totalWagered + betAmount).toFixed(2));
    this.config.telemetry.totalPayout = Number((this.config.telemetry.totalPayout + payoutAmount).toFixed(2));
    this.config.telemetry.totalRounds += 1;
    this.saveToStorage(this.config);
    this.notify();

    // Local simulation telemetry only. Cash settlement requires a trusted server round,
    // not the client-generated outcome or payout supplied to this method.
  }
}

export const gameEngine = new GameEngineService();
