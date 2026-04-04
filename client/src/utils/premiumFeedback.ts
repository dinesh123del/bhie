// Premium Feedback Utility for Haptics and Sound

const sounds = {
  tick: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
  chime: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
  low: new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'),
};

// Set volumes low for premium feel
Object.values(sounds).forEach(s => { s.volume = 0.15; });

export const playSound = (type: keyof typeof sounds) => {
  try {
    const sound = sounds[type].cloneNode() as HTMLAudioElement;
    sound.volume = 0.15;
    sound.play().catch(() => { /* Ignore autoplay blocks */ });
  } catch (e) {
    console.warn('Sound play failed', e);
  }
};

export const triggerHaptic = (duration: number | number[] = 10) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(duration as any);
  }
};

export const premiumFeedback = {
  click: () => {
    playSound('tick');
    triggerHaptic(10);
  },
  success: () => {
    playSound('chime');
    triggerHaptic([15, 30, 15]);
  },
  error: () => {
    playSound('low');
    triggerHaptic(50);
  }
};
