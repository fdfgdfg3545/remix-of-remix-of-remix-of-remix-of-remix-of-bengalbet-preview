// @ts-nocheck
/**
 * JILI Super Ace Authentic Web Audio API Sound Engine
 * 
 * Synthesizes all audio effects and background music without external audio files:
 * - Upbeat casino slot background music (rhythmic groove with bass, chord stabs & lead)
 * - Free Game high-energy bonus music
 * - Reel spin clatter & card shuffle whoosh
 * - Sequential reel stop snaps
 * - Scatter landing bell & 2-scatter suspense crescendo
 * - Card elimination explosion & spark pops
 * - Golden Card flip & Joker transformation chime
 * - Big Joker magic lightning zap
 * - Multiplier advancement stingers (x1, x2, x3, x5 / x2, x4, x6, x10)
 * - Big Win, Mega Win, Super Win triumphant brass fanfares
 * - Coin ticker counter sounds
 * - Developed by Neext Hub (https://neexthub.ai.studio/)
 */

class SuperAceAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = true;
  private musicInterval: any = null;
  private isMusicPlaying = false;
  private isBonusMusic = false;
  private musicStep = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundEnabled(val: boolean) {
    this.soundEnabled = val;
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    if (!val) {
      this.stopMusic();
    } else {
      this.startMusic(this.isBonusMusic);
    }
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // --- 1. BACKGROUND MUSIC (CASINO SLOT GROOVE) ---
  public startMusic(isBonus: boolean = false) {
    this.isBonusMusic = isBonus;
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Upbeat casino groove in C minor / F pentatonic
    const bpm = isBonus ? 138 : 124;
    const intervalMs = (60 / bpm / 4) * 1000; // 16th notes

    const bassNotes = isBonus 
      ? [130.81, 130.81, 155.56, 174.61, 130.81, 196.00, 174.61, 155.56] // C3, Eb3, F3, G3
      : [110.00, 110.00, 130.81, 146.83, 110.00, 164.81, 146.83, 130.81]; // A2, C3, D3, E3

    const melodyNotesNormal = [
      440.00, 0, 523.25, 0, 659.25, 0, 587.33, 523.25,
      440.00, 0, 392.00, 0, 440.00, 523.25, 659.25, 0
    ];

    const melodyNotesBonus = [
      523.25, 523.25, 659.25, 783.99, 0, 880.00, 783.99, 659.25,
      523.25, 0, 659.25, 0, 783.99, 1046.50, 880.00, 783.99
    ];

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const step = this.musicStep % 16;
      this.musicStep++;

      // Bass note on beats 0, 4, 8, 12, etc.
      if (step % 2 === 0) {
        const bassFreq = bassNotes[(step / 2) % bassNotes.length];
        this.playTone(bassFreq, 'triangle', 0.15, 0.08);
      }

      // Snare / Hat click
      if (step % 4 === 2) {
        this.playNoise(0.04, 0.03); // hi-hat
      } else if (step % 8 === 4) {
        this.playNoise(0.08, 0.05); // snare pop
      }

      // Melody stabs
      const melNotes = isBonus ? melodyNotesBonus : melodyNotesNormal;
      const freq = melNotes[step % melNotes.length];
      if (freq > 0) {
        this.playTone(freq, isBonus ? 'sawtooth' : 'sine', 0.12, isBonus ? 0.04 : 0.03);
      }
    }, intervalMs);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  // --- 2. REEL SPIN WHOOSH & CARD SOUNDS ---
  public playSpinStart() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.18);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);

      // Card shuffle flutter
      this.playNoise(0.12, 0.04);
    } catch (_) {}
  }

  public playReelStop(reelIndex: number = 0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Slightly rising pitch per reel index (1..5)
      const baseFreq = 160 + reelIndex * 24;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.09);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (_) {}
  }

  // --- 3. SCATTER SOUND & SUSPENSE ---
  public playScatterLanding(scatterCount: number = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Iconic bright gold coin chime: C6 -> E6 -> G6
      const freq = scatterCount === 1 ? 1046.50 : scatterCount === 2 ? 1318.51 : 1567.98;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (_) {}
  }

  public playScatterSuspense() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(800, now + 1.2);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 1.25);
    } catch (_) {}
  }

  // --- 4. WIN & CASCADING ELIMINATION ---
  public playWinMatch(comboCount: number = 1) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const pitchShift = 1 + (comboCount - 1) * 0.15;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * pitchShift, now + i * 0.05);

        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.25);
      });
    } catch (_) {}
  }

  public playCardElimination() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Pop + sparkles
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);

      this.playNoise(0.08, 0.05);
    } catch (_) {}
  }

  // --- 5. GOLDEN CARD -> JOKER TRANSFORM & BIG JOKER ---
  public playGoldenCardTransform() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Shimmering high arpeggio
      const harpNotes = [880, 1108, 1318, 1760, 2217];
      const now = this.ctx.currentTime;

      harpNotes.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.04);

        gain.gain.setValueAtTime(0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch (_) {}
  }

  public playBigJokerZap() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch (_) {}
  }

  // --- 5.1 STAR CARD ACTIVATION CHIME & COSMIC STARDUST ---
  public playStarCardActivation() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Multi-tone cosmic chime cascade: C6 -> E6 -> G6 -> B6 -> D7
      const starPitches = [1046.50, 1318.51, 1567.98, 1975.53, 2349.32];
      starPitches.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + idx * 0.06 + 0.35);

        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.4);
      });

      // Shimmering white noise sparkle
      this.playNoise(0.25, 0.05);
    } catch (_) {}
  }

  // --- 6. MULTIPLIER STEP ADVANCEMENT ---
  public playMultiplierUp(multiplierText: string) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const f = multiplierText.includes('20') 
        ? 1800 
        : multiplierText.includes('10') 
        ? 1520 
        : multiplierText.includes('5') || multiplierText.includes('6') 
        ? 1240 
        : multiplierText.includes('3') || multiplierText.includes('4') 
        ? 1050 
        : 880;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.35, now + 0.24);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch (_) {}
  }

  // --- 7. FREE SPINS TRIGGER FANFARE ---
  public playFreeSpinsTrigger() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const brassChords = [
        [523.25, 659.25, 783.99],       // C
        [587.33, 739.99, 880.00],       // D
        [659.25, 830.61, 987.77],       // E
        [783.99, 987.77, 1174.66, 1567.98] // G + high C
      ];

      const now = this.ctx.currentTime;
      brassChords.forEach((chord, step) => {
        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + step * 0.16);

          gain.gain.setValueAtTime(0.15, now + step * 0.16);
          gain.gain.exponentialRampToValueAtTime(0.001, now + step * 0.16 + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(now + step * 0.16);
          osc.stop(now + step * 0.16 + 0.4);
        });
      });
    } catch (_) {}
  }

  // --- 8. BIG WIN / MEGA WIN / SUPER WIN CELEBRATION ---
  public playBigWinFanfare(tier: 'big' | 'mega' | 'super') {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const root = tier === 'super' ? 523.25 : tier === 'mega' ? 440.0 : 392.0;
      const melody = [root, root * 1.25, root * 1.5, root * 2, root * 2.5];

      melody.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.22, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.45);
      });
    } catch (_) {}
  }

  public playCoinTick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 400, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (_) {}
  }

  public playButtonClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (_) {}
  }

  // Audio aliases for unified gameplay engine compatibility
  public playScatterLand(scatterCount: number = 1) {
    this.playScatterLanding(scatterCount);
  }

  public playWinCascade(comboCount: number = 1) {
    this.playWinMatch(comboCount);
  }

  public playEliminationExplosion() {
    this.playCardElimination();
  }

  public playGoldenFlip() {
    this.playGoldenCardTransform();
  }

  public playBigJokerLightning() {
    this.playBigJokerZap();
  }

  public playCelebration(tier: 'BIG' | 'MEGA' | 'SUPER' | 'big' | 'mega' | 'super') {
    const t = (tier ? tier.toLowerCase() : 'big') as 'big' | 'mega' | 'super';
    this.playBigWinFanfare(t);
  }

  public playFreeGameTrigger() {
    this.playFreeSpinsTrigger();
  }

  // Convenient aliases for Super Ace II & variants
  public playSpin() {
    this.playSpinStart();
  }

  public playScatterTrigger() {
    this.playFreeSpinsTrigger();
  }

  public playWinEliminate() {
    this.playCardElimination();
  }

  public playCardFlip() {
    this.playGoldenCardTransform();
  }

  public playCascadeDrop() {
    this.playReelStop(2);
  }

  public playBigWinCelebration(tier: string = 'big') {
    this.playCelebration(tier as any);
  }

  // Helper tone player
  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (_) {}
  }

  // Helper noise burst (drums / shuffles)
  private playNoise(duration: number, volume: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch (_) {}
  }
}

export const superAceAudio = new SuperAceAudioEngine();
