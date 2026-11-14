import type { StoryPage } from '../story/storyData';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;
  public readAloudEnabled = false;

  private ensureContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public playPageFlip(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Soft paper rustle via filtered noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.24);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.22);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);

    // Subtle magical pop-up shimmer
    this.playTone(523.25, now + 0.09, 0.14, 'sine', 0.07);
    this.playTone(659.25, now + 0.14, 0.18, 'triangle', 0.07);
  }

  public playCue(cue: StoryPage['soundCue']): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    switch (cue) {
      case 'open': {
        [392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.07, 0.28, 'triangle', 0.09);
        });
        break;
      }
      case 'happy': {
        this.playTone(587.33, now, 0.12, 'sine', 0.09);
        this.playTone(880, now + 0.08, 0.16, 'sine', 0.09);
        break;
      }
      case 'boost': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(340, now + 0.35);

        const lpf = ctx.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(lpf);
        lpf.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.42);
        break;
      }
      case 'camera': {
        // Camera shutter click + flash ding
        this.playTone(1200, now, 0.035, 'square', 0.06);
        this.playTone(900, now + 0.04, 0.035, 'square', 0.05);
        this.playTone(1318.5, now + 0.09, 0.2, 'sine', 0.07);
        break;
      }
      case 'uhoh': {
        this.playTone(440, now, 0.14, 'triangle', 0.09);
        this.playTone(311.13, now + 0.13, 0.25, 'triangle', 0.09);
        break;
      }
      case 'sad': {
        this.playTone(392, now, 0.2, 'sine', 0.08);
        this.playTone(349.23, now + 0.18, 0.22, 'sine', 0.08);
        this.playTone(293.66, now + 0.36, 0.32, 'sine', 0.07);
        break;
      }
      case 'fanfare': {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.075, 0.25, 'triangle', 0.1);
        });
        break;
      }
      case 'gentle': {
        this.playTone(440, now, 0.28, 'sine', 0.06);
        this.playTone(554.37, now + 0.12, 0.32, 'sine', 0.06);
        this.playTone(659.25, now + 0.24, 0.4, 'sine', 0.06);
        break;
      }
    }
  }

  public playInteractionPop(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    this.playTone(660, now, 0.09, 'sine', 0.09);
    this.playTone(990, now + 0.06, 0.14, 'triangle', 0.08);
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public speak(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!this.readAloudEnabled) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94; // Clear, warm pace for young readers
    utterance.pitch = 1.08;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en/i.test(v.lang) && /natural|google|samantha|daniel|karen/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeech(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
