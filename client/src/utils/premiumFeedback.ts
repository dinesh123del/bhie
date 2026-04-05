// Premium Feedback Engine - Haptics + Spatial Audio
// Delivers a satisfying, addictive micro-interaction layer across the entire app.
// Uses Web Audio API exclusively - zero external assets needed.

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

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.04) {
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

  // ===== Core Interaction Sounds =====

  // Soft "tick" for button clicks - feels like a mechanical switch
  tick() {
    this.playTone(880, 'sine', 0.06, 0.03);
    this.playTone(1200, 'sine', 0.04, 0.015);
  }

  // Elegant Success Chime (A Major Shimmer) - feels like unlocking something
  chime() {
    this.playTone(880.00, 'sine', 0.8, 0.035);  // A5
    setTimeout(() => this.playTone(1108.73, 'sine', 0.6, 0.025), 120); // C#6
    setTimeout(() => this.playTone(1318.51, 'sine', 0.4, 0.018), 240); // E6
  }

  // Smooth, low-frequency error signal
  low() {
    this.playTone(200, 'sine', 0.4, 0.035);
    setTimeout(() => this.playTone(150, 'sine', 0.3, 0.025), 100);
  }

  // ===== Enhanced Navigation Sounds =====

  // Page navigation whoosh - subtle air movement feel
  navigate() {
    this.playTone(400, 'sine', 0.12, 0.02);
    setTimeout(() => this.playTone(600, 'sine', 0.1, 0.015), 50);
  }

  // Hover sound - barely perceptible, like a whisper
  hover() {
    this.playTone(1400, 'sine', 0.04, 0.008);
  }

  // Tab/section switch - clean digital pop
  tab() {
    this.playTone(700, 'sine', 0.08, 0.02);
    this.playTone(900, 'sine', 0.06, 0.012);
  }

  // Toggle on/off sounds
  toggleOn() {
    this.playTone(600, 'sine', 0.08, 0.025);
    setTimeout(() => this.playTone(900, 'sine', 0.06, 0.02), 60);
  }

  toggleOff() {
    this.playTone(900, 'sine', 0.08, 0.02);
    setTimeout(() => this.playTone(600, 'sine', 0.06, 0.015), 60);
  }

  // Modal open/close
  modalOpen() {
    this.playTone(300, 'sine', 0.2, 0.02);
    setTimeout(() => this.playTone(500, 'sine', 0.15, 0.015), 80);
    setTimeout(() => this.playTone(700, 'sine', 0.1, 0.01), 160);
  }

  modalClose() {
    this.playTone(700, 'sine', 0.12, 0.015);
    setTimeout(() => this.playTone(400, 'sine', 0.1, 0.01), 80);
  }

  // Notification ping - attention-grabbing but not jarring
  notification() {
    this.playTone(1046.50, 'sine', 0.3, 0.03); // C6
    setTimeout(() => this.playTone(1318.51, 'sine', 0.25, 0.025), 150); // E6
  }

  // Achievement / milestone unlocked - magical sparkle
  achievement() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5 -> E6 arpeggio
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.5 - i * 0.08, 0.025 - i * 0.003), i * 80);
    });
  }

  // ===== Haptic Engine =====

  vibrate(ms: number | number[] = 10) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {
        // Ignore haptic failures silently
      }
    }
  }
}

const engine = new FeedbackEngine();

export const premiumFeedback = {
  // Core interactions
  click: () => {
    engine.tick();
    engine.vibrate(6);
  },
  success: () => {
    engine.chime();
    engine.vibrate([8, 20, 8]);
  },
  error: () => {
    engine.low();
    engine.vibrate([40, 30, 40]);
  },

  // Navigation
  navigate: () => {
    engine.navigate();
    engine.vibrate(4);
  },
  hover: () => {
    engine.hover();
  },
  tab: () => {
    engine.tab();
    engine.vibrate(5);
  },

  // Toggles
  toggleOn: () => {
    engine.toggleOn();
    engine.vibrate(8);
  },
  toggleOff: () => {
    engine.toggleOff();
    engine.vibrate(5);
  },

  // Modals
  modalOpen: () => {
    engine.modalOpen();
    engine.vibrate([5, 15, 5]);
  },
  modalClose: () => {
    engine.modalClose();
    engine.vibrate(5);
  },

  // Special effects
  notification: () => {
    engine.notification();
    engine.vibrate([10, 10, 10]);
  },
  achievement: () => {
    engine.achievement();
    engine.vibrate([5, 10, 5, 10, 5, 20, 10]);
  },

  // Raw haptic
  haptic: (ms: number = 8) => {
    engine.vibrate(ms);
  }
};
