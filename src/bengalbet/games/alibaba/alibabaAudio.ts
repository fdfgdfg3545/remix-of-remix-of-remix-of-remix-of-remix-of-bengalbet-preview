// @ts-nocheck
// Web Audio Synthesizer for Alibaba's Cave of Fortune (Arabian Oud, Magical Bells, Open Sesame Gate, Coin Showers)

class AlibabaAudio {
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

  // Arabian Reel Spin whoosh with finger cymbals
  public playSpin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Magic sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);

    // Finger cymbal clink
    const cymbal = this.ctx.createOscillator();
    const cymbalGain = this.ctx.createGain();
    cymbal.type = 'triangle';
    cymbal.frequency.setValueAtTime(2400, now);
    cymbalGain.gain.setValueAtTime(0.08, now);
    cymbalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    cymbal.connect(cymbalGain);
    cymbalGain.connect(this.ctx.destination);
    cymbal.start(now);
    cymbal.stop(now + 0.15);
  }

  // Stone reel lock sound (Cave door thud)
  public playReelStop(reelIdx: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + reelIdx * 25, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Magic Genie Lamp Wild appearance (magical twinkle)
  public playWildLamp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  // Cave Multiplier Level Up (Oud progression + chime)
  public playMultiplierUpgrade(mult: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const baseFreq = 440 * (1 + Math.min(mult, 10) * 0.1);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq * 0.75, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.2);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Open Sesame Golden Gate Scatter Hit
  public playScatterHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Open Sesame Free Spins Trigger! (Cave door opening fanfare)
  public playOpenSesameFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Arabian Hijaz scale notes: D4, Eb4, F#4, G4, A4, Bb4, C5, D5
    const hijazScale = [293.66, 311.13, 369.99, 392.00, 440.00, 466.16, 587.33];
    hijazScale.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.09;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  // Treasure Win Cascade (Gold coins clinking)
  public playCascadeWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const coin = this.ctx.createOscillator();
      const coinGain = this.ctx.createGain();
      const time = now + i * 0.04;

      coin.type = 'sine';
      coin.frequency.setValueAtTime(1400 + Math.random() * 400, time);

      coinGain.gain.setValueAtTime(0.12, time);
      coinGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      coin.connect(coinGain);
      coinGain.connect(this.ctx.destination);
      coin.start(time);
      coin.stop(time + 0.08);
    }
  }

  // Big Win Fanfare
  public playBigWin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [293.66, 369.99, 440.00], // D Major
      [329.63, 415.30, 493.88], // E Major
      [369.99, 466.16, 554.37], // F# Major
      [440.00, 554.37, 659.25], // A Major
      [587.33, 739.99, 880.00]  // High D Major
    ];

    chords.forEach((chord, step) => {
      chord.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = now + step * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.35);
      });
    });
  }
}

export const alibabaAudio = new AlibabaAudio();
