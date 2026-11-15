import type { StoryPage } from '../story/storyData';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled = true;
  public readAloudEnabled = false;

  private ensureContext(): AudioContext | null {
    if (!this.soundEnabled) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      case 'setup': {
        this.playTone(440, now, 0.08, 'triangle', 0.07);
        this.playTone(587.33, now + 0.09, 0.1, 'triangle', 0.08);
        this.playTone(783.99, now + 0.18, 0.16, 'sine', 0.08);
        break;
      }
      case 'quake': {
        // Gentle low moonquake seismic pulse + sensor ping
        this.playTone(95, now, 0.25, 'sine', 0.1);
        this.playTone(125, now + 0.08, 0.22, 'triangle', 0.08);
        this.playTone(880, now + 0.18, 0.12, 'sine', 0.07);
        this.playTone(1174.66, now + 0.27, 0.16, 'sine', 0.06);
        break;
      }
      case 'wave': {
        this.playTone(523.25, now, 0.14, 'sine', 0.08);
        this.playTone(659.25, now + 0.1, 0.14, 'sine', 0.08);
        this.playTone(587.33, now + 0.22, 0.22, 'triangle', 0.07);
        break;
      }
      case 'signal': {
        this.playTone(740, now, 0.09, 'sine', 0.07);
        this.playTone(987.77, now + 0.1, 0.12, 'sine', 0.07);
        this.playTone(1318.5, now + 0.2, 0.18, 'sine', 0.06);
        break;
      }
      case 'sleep': {
        this.playTone(440, now, 0.18, 'sine', 0.07);
        this.playTone(349.23, now + 0.16, 0.24, 'sine', 0.07);
        this.playTone(261.63, now + 0.34, 0.35, 'sine', 0.06);
        break;
      }
      case 'fanfare': {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          this.playTone(freq, now + idx * 0.075, 0.25, 'triangle', 0.1);
        });
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
    utterance.rate = 0.94;
    utterance.pitch = 1.12;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en/i.test(v.lang) && /samantha|karen|victoria|google|natural/i.test(v.name)) ||
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
