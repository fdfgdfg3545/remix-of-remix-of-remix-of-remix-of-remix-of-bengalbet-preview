// @ts-nocheck
/**
 * Web Audio API Synthesizer for Head & Tail Casino Game
 * Provides rich, realistic metallic coin flips, air spinning whooshes,
 * landing bounces, win fanfares, streak level up chimes, and ambient casino audio.
 */

class HeadTailAudioEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private musicGain: GainNode | null = null;
  private musicInterval: any = null;

  constructor() {
    // Lazy initialized on first user interaction
  }

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

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public playButtonClick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (_) {}
  }

  public playChipSelect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch (_) {}
  }

  /**
   * Realistic metallic coin flip flick:
   * High pitched ringing transient ("ping!")
   */
  public playCoinTossFlick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. High metallic ring fundamental
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2480, now);
      osc1.frequency.exponentialRampToValueAtTime(2450, now + 0.35);

      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // 2. Overtone for silver/gold coin ring
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(4860, now);
      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.25);

      // 3. Thumb flick snap impact
      const osc3 = this.ctx.createOscillator();
      const gain3 = this.ctx.createGain();
      osc3.type = 'triangle';
      osc3.frequency.setValueAtTime(320, now);
      osc3.frequency.exponentialRampToValueAtTime(80, now + 0.04);
      gain3.gain.setValueAtTime(0.3, now);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc3.connect(gain3);
      gain3.connect(this.ctx.destination);
      osc3.start(now);
      osc3.stop(now + 0.04);
    } catch (_) {}
  }

  /**
   * Continuous mid-air spinning whoosh / metallic hum
   */
  public playSpinningWhoosh() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.linearRampToValueAtTime(1700, now + 0.2);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.4);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (_) {}
  }

  /**
   * Coin lands on felt and bounces with realistic metallic clinks
   */
  public playCoinLandBounce() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 3 staggered bounces: heavy hit, medium hit, micro settle
      const hits = [
        { delay: 0.0, freq1: 1850, freq2: 3600, vol: 0.35, len: 0.12 },
        { delay: 0.09, freq1: 2150, freq2: 4200, vol: 0.22, len: 0.09 },
        { delay: 0.16, freq1: 2400, freq2: 4800, vol: 0.12, len: 0.06 }
      ];

      hits.forEach(hit => {
        const t = now + hit.delay;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(hit.freq1, t);
        gain.gain.setValueAtTime(hit.vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + hit.len);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + hit.len);

        // Overtone
        const oscOt = this.ctx!.createOscillator();
        const gainOt = this.ctx!.createGain();
        oscOt.type = 'triangle';
        oscOt.frequency.setValueAtTime(hit.freq2, t);
        gainOt.gain.setValueAtTime(hit.vol * 0.4, t);
        gainOt.gain.exponentialRampToValueAtTime(0.001, t + hit.len * 0.8);

        oscOt.connect(gainOt);
        gainOt.connect(this.ctx!.destination);
        oscOt.start(t);
        oscOt.stop(t + hit.len * 0.8);
      });
    } catch (_) {}
  }

  /**
   * Win fanfare - Bright and celebratory
   */
  public playWinFanfare() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Arpeggio notes: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const t = now + idx * 0.07;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch (_) {}
  }

  /**
   * Streak Level Up - progressive triumphant chime
   */
  public playStreakLevelUp(streakLevel: number) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 440 + Math.min(streakLevel, 8) * 60;
      const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

      notes.forEach((freq, idx) => {
        const t = now + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch (_) {}
  }

  /**
   * Big Cashout Fanfare - Major victory celebration
   */
  public playCashoutCelebration() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Majestic triumphant fanfare: G4 -> C5 -> E5 -> G5 -> C6
      const fanfare = [
        { freq: 392.00, start: 0.0, dur: 0.12 },
        { freq: 523.25, start: 0.12, dur: 0.12 },
        { freq: 659.25, start: 0.24, dur: 0.14 },
        { freq: 783.99, start: 0.38, dur: 0.20 },
        { freq: 1046.50, start: 0.58, dur: 0.60 }
      ];

      fanfare.forEach(note => {
        const t = now + note.start;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t);
        osc.stop(t + note.dur);
      });
    } catch (_) {}
  }

  /**
   * Loss thud sound
   */
  public playLossSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.28);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (_) {}
  }

  /**
   * Ambient casino background lounge loop
   */
  public startMusic() {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopMusic();

    try {
      const chords = [
        [261.63, 329.63, 392.00], // C
        [220.00, 261.63, 329.63], // Am
        [174.61, 220.00, 261.63], // F
        [196.00, 246.94, 293.66]  // G
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!this.musicEnabled || !this.ctx) return;
        const chord = chords[chordIndex];
        chordIndex = (chordIndex + 1) % chords.length;

        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          gain.gain.setValueAtTime(0.02, this.ctx!.currentTime);
          gain.gain.linearRampToValueAtTime(0.035, this.ctx!.currentTime + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 2.3);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start();
          osc.stop(this.ctx!.currentTime + 2.4);
        });
      };

      playChord();
      this.musicInterval = setInterval(playChord, 2400);
    } catch (_) {}
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const headTailAudio = new HeadTailAudioEngine();
