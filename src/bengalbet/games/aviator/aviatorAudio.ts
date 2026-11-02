// @ts-nocheck
/**
 * Spribe Aviator Authentic Web Audio API Engine
 * 
 * Generates all sound effects and background music synthesizers:
 * - Dynamic propeller engine hum with pitch rising in sync with flight multiplier
 * - Crisp cashout arpeggio chime on win
 * - High-speed whoosh noise on "Flew Away" / crash
 * - Tick sound during countdown
 * - Interactive button click sounds
 * - Looping electronic lounge background music
 */

class AviatorAudioEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private musicInterval: any = null;
  private isMusicPlaying = false;
  private soundEnabled = true;
  private musicEnabled = true;

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
    if (!val) {
      this.stopEngine();
    }
  }

  public setMusicEnabled(val: boolean) {
    this.musicEnabled = val;
    if (!val) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public getSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  // --- 1. PROPELLER / FLIGHT ENGINE SOUND ---
  public startEngine(initialMultiplier: number = 1.0) {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.stopEngine();

      const now = this.ctx.currentTime;
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      // Rich sawtooth wave filtered for airplane engine texture
      this.engineOsc.type = 'sawtooth';

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      // Base frequency around 80Hz + frequency scaled with multiplier
      const baseFreq = 85 + (initialMultiplier - 1) * 35;
      this.engineOsc.frequency.setValueAtTime(Math.min(baseFreq, 380), now);

      // Gentle attack
      this.engineGain.gain.setValueAtTime(0.001, now);
      this.engineGain.gain.exponentialRampToValueAtTime(0.09, now + 0.15);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start(now);
    } catch (e) {
      // Audio autoplay policy guard
    }
  }

  public updateEnginePitch(multiplier: number) {
    if (!this.soundEnabled || !this.ctx || !this.engineOsc) return;
    try {
      const now = this.ctx.currentTime;
      // Exponential/log pitch curve matching multiplier climb
      const targetFreq = 85 + Math.min((multiplier - 1) * 32, 420);
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    } catch (e) {}
  }

  public stopEngine() {
    if (this.engineGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.engineGain.gain.setValueAtTime(this.engineGain.gain.value, now);
        this.engineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        setTimeout(() => {
          if (this.engineOsc) {
            try { this.engineOsc.stop(); } catch (e) {}
            this.engineOsc.disconnect();
            this.engineOsc = null;
          }
          if (this.engineGain) {
            this.engineGain.disconnect();
            this.engineGain = null;
          }
        }, 130);
      } catch (e) {
        this.engineOsc = null;
        this.engineGain = null;
      }
    } else {
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  // --- 2. CASH OUT SOUND (Crisp harmonic celebration) ---
  public playCashoutSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.46);
      });
    } catch (e) {}
  }

  // --- 3. FLEW AWAY / CRASH SOUND (Jet whoosh) ---
  public playFlewAwaySound() {
    this.stopEngine();
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High to low frequency drop with noise sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.55);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.55);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.56);
    } catch (e) {}
  }

  // --- 4. COUNTDOWN TICK SOUND ---
  public playCountdownTick() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {}
  }

  // --- 5. BUTTON CLICK SOUND ---
  public playClickSound() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // --- 6. BACKGROUND MUSIC SYNTHESIZER (Spribe Electronic Groove) ---
  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    let step = 0;
    // Rhythmic 8-step bassline pattern
    const bassline = [110, 110, 130.81, 110, 146.83, 130.81, 110, 98]; // A2, C3, D3 etc.

    const playStep = () => {
      if (!this.musicEnabled || !this.isMusicPlaying || !this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Bass synth
        osc.type = 'sine';
        osc.frequency.setValueAtTime(bassline[step % bassline.length], now);

        const isKick = step % 2 === 0;
        gain.gain.setValueAtTime(isKick ? 0.045 : 0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);

        // Hi-hat tick on offbeat
        if (step % 2 === 1) {
          const hhOsc = this.ctx.createOscillator();
          const hhGain = this.ctx.createGain();
          hhOsc.type = 'triangle';
          hhOsc.frequency.setValueAtTime(3200, now);
          hhGain.gain.setValueAtTime(0.015, now);
          hhGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
          hhOsc.connect(hhGain);
          hhGain.connect(this.ctx.destination);
          hhOsc.start(now);
          hhOsc.stop(now + 0.06);
        }

        step++;
      } catch (e) {}
    };

    this.musicInterval = setInterval(playStep, 250); // 120 BPM 8th notes
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public destroy() {
    this.stopEngine();
    this.stopMusic();
    if (this.ctx) {
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    }
  }
}

export const aviatorAudio = new AviatorAudioEngine();
