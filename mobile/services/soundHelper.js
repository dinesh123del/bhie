import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Premium Apple-Style Feedback Engine for React Native
 * Leverages Expo Haptics to communicate with the native Taptic Engine 
 * delivering deep, sub-vocal tactile feedback across the mobile experience.
 */
class SoundHelper {
  // ── Core Interactions ───────────
  
  /**
   * Crisp, soft tap. Used for navigating tabs, clicking buttons, or toggling minor switches.
   * Maps to iOS UISelectionFeedbackGenerator.
   */
  async tap() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Ignore gracefully if hardware doesn't support
    }
  }

  /**
   * Deep, satisfying thud. Used for opening modals, pulling to refresh, or heavy actions.
   * Maps to iOS UIImpactFeedbackGenerator (Medium/Heavy).
   */
  async impact(style = Haptics.ImpactFeedbackStyle.Medium) {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(style);
    } catch (e) {}
  }

  // ── Notifications & Achievements ───────────

  /**
   * Signature Apple Pay success chime + double vibration.
   * Used for completing a transaction, uploading a receipt, or saving settings.
   */
  async success() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
  }

  /**
   * Warning flutter. Used for invalid form inputs or rate limits.
   */
  async warning() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {}
  }

  /**
   * Hard error reject bump. Used for failing mutations or server drops.
   */
  async error() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}
  }

  // ── Custom Rhythmic Haptics ───────────

  /**
   * Heartbeat sequence. Useful for "Waiting for AI" loaders or pending states.
   */
  async heartbeat() {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 150);
    } catch (e) {}
  }
}

export const premiumFeedback = new SoundHelper();
export default premiumFeedback;
