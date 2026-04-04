import { useCallback, useEffect } from 'react';
import {
  playClickSound,
  playSuccessSound,
  playErrorSound,
  playHoverSound,
} from '../lib/audioGenerator';

type SoundType = 'click' | 'success' | 'error' | 'hover';

const SOUND_FUNCTIONS: Record<SoundType, () => void> = {
  click: playClickSound,
  success: playSuccessSound,
  error: playErrorSound,
  hover: playHoverSound,
};

interface UseAudioOptions {
  enabled?: boolean;
}

export const useSound = (soundType: SoundType, options: UseAudioOptions = {}) => {
  const { enabled = true } = options;

  const play = useCallback(() => {
    if (!enabled) return;
    const soundFunction = SOUND_FUNCTIONS[soundType];
    if (soundFunction) {
      soundFunction();
    }
  }, [soundType, enabled]);

  return { play };
};

// Haptic feedback utilities
export const useHaptic = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const click = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const success = useCallback(() => {
    vibrate([10, 20, 10]);
  }, [vibrate]);

  const error = useCallback(() => {
    vibrate([50, 30, 50]);
  }, [vibrate]);

  const warning = useCallback(() => {
    vibrate([30, 20, 30]);
  }, [vibrate]);

  return { vibrate, click, success, error, warning };
};

// Combined hook for audio + haptic
export const useFeedback = (
  soundType: SoundType,
  hapticType: 'click' | 'success' | 'error' | 'warning' = 'click',
  options: UseAudioOptions = {}
) => {
  const { play } = useSound(soundType, options);
  const haptic = useHaptic();

  const trigger = useCallback(() => {
    play();
    haptic[hapticType]?.();
  }, [play, haptic, hapticType]);

  return { trigger, play, haptic };
};

// Preload sounds on app start (Web Audio)
export const usePreloadSounds = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Web Audio context is lazy-loaded on first interaction
    // No explicit preload needed
  }, []);
};
