// @ts-nocheck
// Web Audio synthesizer for Pragmatic Play Gates of Olympus

class OlympusAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Gem drop sound
  playTumble() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  // Zeus thunder strike / lightning multiplier drop
  playThunder() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      // White noise explosion for thunder
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();

      // Sharp sine zap
      const zap = this.ctx.createOscillator();
      const zapGain = this.ctx.createGain();
      zap.type = 'sawtooth';
      zap.frequency.setValueAtTime(1200, this.ctx.currentTime);
      zap.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.25);
      zapGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      zapGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      zap.connect(zapGain);
      zapGain.connect(this.ctx.destination);
      zap.start();
      zap.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Win chime for pay anywhere
  playWinChime(mult: number) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const base = 440 * (1 + Math.min(mult, 50) * 0.04);
      [0, 0.08, 0.16].forEach((d, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(base * (1 + i * 0.25), this.ctx!.currentTime + d);
        gain.gain.setValueAtTime(0.25, this.ctx!.currentTime + d);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + d + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(this.ctx!.currentTime + d);
        osc.stop(this.ctx!.currentTime + d + 0.2);
      });
    } catch {}
  }

  // Zeus Scatter sound
  playZeusScatter() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }
}

export const olympusAudio = new OlympusAudio();
