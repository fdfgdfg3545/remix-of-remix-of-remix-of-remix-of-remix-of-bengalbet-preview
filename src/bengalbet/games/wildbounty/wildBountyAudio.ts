// @ts-nocheck
// Web Audio Synthesizer for Wild Bounty Showdown (Western Gunfire, Ricochet, Cascades)

class WildBountyAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Western revolver cylinder spin
  public playSpin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + i * 0.05;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 - i * 40, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.04);
    }
  }

  // Heavy wood holster / reel stop
  public playReelStop(reelIdx: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + reelIdx * 20, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.09);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Western gunshot / bullet ricochet when multiplier doubles
  public playGunshotRicochet(multiplier: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Gunshot blast (noise/low freq punch)
    const blast = this.ctx.createOscillator();
    const blastGain = this.ctx.createGain();
    blast.type = 'sawtooth';
    blast.frequency.setValueAtTime(160, now);
    blast.frequency.exponentialRampToValueAtTime(30, now + 0.15);

    blastGain.gain.setValueAtTime(0.3, now);
    blastGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    blast.connect(blastGain);
    blastGain.connect(this.ctx.destination);
    blast.start(now);
    blast.stop(now + 0.15);

    // 2. High metallic bullet ricochet whistle
    const whistle = this.ctx.createOscillator();
    const whistleGain = this.ctx.createGain();
    whistle.type = 'sine';
    const baseFreq = 800 + Math.min(multiplier, 1024) * 0.8;
    whistle.frequency.setValueAtTime(baseFreq, now + 0.05);
    whistle.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.25);

    whistleGain.gain.setValueAtTime(0.2, now + 0.05);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    whistle.connect(whistleGain);
    whistleGain.connect(this.ctx.destination);
    whistle.start(now + 0.05);
    whistle.stop(now + 0.28);
  }

  // Golden frame transform into Sheriff Star Wild
  public playSheriffWildTransform() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const starNotes = [523.25, 659.25, 783.99, 1046.5]; // C E G C gold chime

    starNotes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Gold Ingot Scatter drop
  public playScatterDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Free Spins Duel Fanfare
  public playFreeSpinsFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Ennio Morricone spaghetti western trumpet motif
    const notes = [440, 523.25, 587.33, 659.25, 880];

    notes.forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.12;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  // Outlaw Bounty Big Win
  public playBigWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [392, 493.88, 587.33, 783.99]; // G Major Western

    for (let r = 0; r < 4; r++) {
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + r * 0.25 + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.22);
      });
    }
  }
}

export const wildBountyAudio = new WildBountyAudio();
