// Premium Feedback Utility for Haptics and Sound using Web Audio API
// This ensures reliable, zero-latency feedback without external assets

class FeedbackEngine {
  private audioContext: AudioContext | null = null;

  private initAudio() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.05) {
    this.initAudio();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Soft "tick" for button clicks
  tick() {
    this.playTone(800, 'sine', 0.1, 0.04);
  }

  // Elegant Success Chime (A Major Shimmer)
  chime() {
    this.playTone(880.00, 'sine', 0.8, 0.04);  // A5
    setTimeout(() => this.playTone(1108.73, 'sine', 0.6, 0.03), 100); // C#6
    setTimeout(() => this.playTone(1318.51, 'sine', 0.4, 0.02), 200); // E6
  }

  // Smooth, low-frequency failure chime
  low() {
    this.playTone(120, 'sine', 0.6, 0.04);
  }

  vibrate(ms: number | number[] = 10) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  }
}

const engine = new FeedbackEngine();

export const premiumFeedback = {
  click: () => {
    engine.tick();
    engine.vibrate(8);
  },
  success: () => {
    engine.chime();
    engine.vibrate([10, 30, 10]);
  },
  error: () => {
    engine.low();
    engine.vibrate(50);
  },
  haptic: (ms: number = 10) => {
    engine.vibrate(ms);
  }
};
