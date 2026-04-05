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

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.04, pan: number = 0) {
    this.initAudio();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    // 3D Spatial Dolby Feel
    const panner = this.audioContext.createStereoPanner ? this.audioContext.createStereoPanner() : null;
    if (panner) {
      panner.pan.setValueAtTime(pan, this.audioContext.currentTime);
    }

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    if (panner) {
      osc.connect(panner);
      panner.connect(gain);
    } else {
      osc.connect(gain);
    }
    
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // ===== Core Interaction Sounds =====

  tick() {
    this.playTone(880, 'sine', 0.06, 0.03, 0);
    this.playTone(1200, 'sine', 0.04, 0.015, 0.2); // subtle spatial pop
  }

  chime() {
    // Spatial sweeping chime (Left -> Center -> Right)
    this.playTone(880.00, 'sine', 0.8, 0.035, -0.6);  
    setTimeout(() => this.playTone(1108.73, 'sine', 0.6, 0.025, 0), 120); 
    setTimeout(() => this.playTone(1318.51, 'sine', 0.4, 0.018, 0.6), 240); 
  }

  low() {
    // Deep center warning
    this.playTone(200, 'sine', 0.4, 0.035, 0);
    setTimeout(() => this.playTone(150, 'sine', 0.3, 0.025, 0), 100);
  }

  // ===== Enhanced Navigation Sounds =====

  navigate() {
    // Air moving left to right
    this.playTone(400, 'sine', 0.12, 0.02, -0.4);
    setTimeout(() => this.playTone(600, 'sine', 0.1, 0.015, 0.4), 50);
  }

  hover() {
    this.playTone(1400, 'sine', 0.04, 0.008, 0);
  }

  tab() {
    this.playTone(700, 'sine', 0.08, 0.02, -0.2);
    this.playTone(900, 'sine', 0.06, 0.012, 0.2);
  }

  toggleOn() {
    this.playTone(600, 'sine', 0.08, 0.025, -0.3);
    setTimeout(() => this.playTone(900, 'sine', 0.06, 0.02, 0.3), 60);
  }

  toggleOff() {
    this.playTone(900, 'sine', 0.08, 0.02, 0.3);
    setTimeout(() => this.playTone(600, 'sine', 0.06, 0.015, -0.3), 60);
  }

  modalOpen() {
    // Massive blooming center feel
    this.playTone(300, 'sine', 0.2, 0.02, 0);
    setTimeout(() => this.playTone(500, 'sine', 0.15, 0.015, -0.3), 80);
    setTimeout(() => this.playTone(700, 'sine', 0.1, 0.01, 0.3), 160);
  }

  modalClose() {
    this.playTone(700, 'sine', 0.12, 0.015, 0.3);
    setTimeout(() => this.playTone(400, 'sine', 0.1, 0.01, -0.3), 80);
  }

  notification() {
    this.playTone(1046.50, 'sine', 0.3, 0.03, 0.5); // Ping right
    setTimeout(() => this.playTone(1318.51, 'sine', 0.25, 0.025, -0.5), 150); // Echo left
  }

  achievement() {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; 
    notes.forEach((freq, i) => {
      // Complete surround sound rotation sweep
      const pan = -0.8 + (i * 0.4); 
      setTimeout(() => this.playTone(freq, 'sine', 0.5 - i * 0.08, 0.025 - i * 0.003, pan), i * 80);
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
