// Web Audio API sound generator
let audioContextInstance: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (audioContextInstance) return audioContextInstance;

  if (typeof window !== 'undefined' && 'AudioContext' in window) {
    audioContextInstance = new (window.AudioContext || (window as any).webkitAudioContext)() as AudioContext;
  }

  return (audioContextInstance || {}) as AudioContext;
};

export const playBeep = (frequency: number = 800, duration: number = 100, volume: number = 0.3) => {
  try {
    const context = getAudioContext() as any;
    if (!context.createOscillator) return;

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  } catch (e) {
    // Silently fail if audio context unavailable
  }
};

export const playClickSound = () => {
  playBeep(800, 80, 0.2);
};

export const playSuccessSound = () => {
  const context = getAudioContext() as any;
  if (!context.createOscillator) return;

  playBeep(523.25, 100, 0.2); // C5
  setTimeout(() => playBeep(659.25, 100, 0.2), 120); // E5
  setTimeout(() => playBeep(783.99, 200, 0.2), 240); // G5
};

export const playErrorSound = () => {
  const context = getAudioContext() as any;
  if (!context.createOscillator) return;

  playBeep(400, 150, 0.2);
  setTimeout(() => playBeep(300, 150, 0.2), 170);
};

export const playHoverSound = () => {
  playBeep(600, 40, 0.1);
};
