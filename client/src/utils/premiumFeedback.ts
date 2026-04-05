// Premium Feedback Engine — Haptic + Sound Effects
// Ultra-refined Web Audio API tones that feel built-in, like iOS/macOS system sounds.
// Zero external assets. Zero latency. Pure synthesis.

class FeedbackEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;

  private initAudio() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      this.audioContext = new AudioCtx();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.12; // Master volume — subtle but audible
      this.masterGain.connect(this.audioContext.destination);
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.06) {
    if (!this.enabled) return;
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

    // Soft attack → natural decay (feels premium, not jarring)
    gain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // ── Soft button tap (like iOS keyboard tick) ──
  tick() {
    this.playTone(1200, 'sine', 0.06, 0.04);
  }

  // ── Navigation click (subtle pop) ──
  pop() {
    this.playTone(600, 'sine', 0.08, 0.05);
    setTimeout(() => this.playTone(900, 'sine', 0.06, 0.03), 30);
  }

  // ── Success Chime (ascending A major triad — warm & rewarding) ──
  chime() {
    this.playTone(880.00, 'sine', 0.5, 0.05);    // A5
    setTimeout(() => this.playTone(1108.73, 'sine', 0.4, 0.04), 80);  // C#6
    setTimeout(() => this.playTone(1318.51, 'sine', 0.35, 0.03), 160); // E6
    setTimeout(() => this.playTone(1760.00, 'sine', 0.3, 0.02), 250);  // A6 (octave shimmer)
  }

  // ── Error / failure tone (low rumble) ──
  low() {
    this.playTone(150, 'sine', 0.3, 0.05);
    setTimeout(() => this.playTone(100, 'sine', 0.4, 0.03), 100);
  }

  // ── Notification ping (gentle bell) ──
  ping() {
    this.playTone(1400, 'sine', 0.15, 0.04);
    setTimeout(() => this.playTone(1800, 'sine', 0.12, 0.02), 60);
  }

  // ── Toggle switch sound ──
  toggle(on: boolean) {
    if (on) {
      this.playTone(700, 'sine', 0.08, 0.04);
      setTimeout(() => this.playTone(1050, 'sine', 0.06, 0.03), 40);
    } else {
      this.playTone(1050, 'sine', 0.08, 0.04);
      setTimeout(() => this.playTone(700, 'sine', 0.06, 0.03), 40);
    }
  }

  // ── Haptic vibration (mobile devices) ──
  vibrate(ms: number | number[] = 10) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (_) { /* silently ignore */ }
    }
  }

  // ── Enable/Disable all feedback ──
  setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('bhie_sound', val ? '1' : '0');
    }
  }

  isEnabled() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('bhie_sound');
      if (stored !== null) this.enabled = stored === '1';
    }
    return this.enabled;
  }
}

const engine = new FeedbackEngine();

export const premiumFeedback = {
  // Standard button click — use on every interactive element
  click: () => {
    engine.tick();
    engine.vibrate(6);
  },

  // Navigation between pages — slightly richer than click
  navigate: () => {
    engine.pop();
    engine.vibrate(8);
  },

  // Success action (login, save, upload complete)
  success: () => {
    engine.chime();
    engine.vibrate([8, 40, 8]);
  },

  // Error / failure action
  error: () => {
    engine.low();
    engine.vibrate(40);
  },

  // Notification arrived
  notify: () => {
    engine.ping();
    engine.vibrate([5, 20, 5]);
  },

  // Toggle switch
  toggle: (on: boolean) => {
    engine.toggle(on);
    engine.vibrate(5);
  },

  // Raw haptic only (for hover states, etc.)
  haptic: (ms: number = 8) => {
    engine.vibrate(ms);
  },

  // Master sound on/off
  setEnabled: (val: boolean) => engine.setEnabled(val),
  isEnabled: () => engine.isEnabled(),
};
