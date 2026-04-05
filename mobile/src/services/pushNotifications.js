import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';

// ─── Notification Handler ────────────────────────────────────────────────────
// Must be set before any notification is received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Register For Push Notifications ─────────────────────────────────────────
export async function registerForPushNotificationsAsync() {
  let token;

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'BHIE Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38BDF8',
      sound: true,
    });
  }

  if (!Device.isDevice) {
    Alert.alert(
      'Physical Device Required',
      'Push notifications only work on a real iOS or Android device, not in a simulator.'
    );
    return null;
  }

  // Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permission Denied',
      'Push notification permission was not granted. You can enable it in your device Settings.'
    );
    return null;
  }

  // Resolve the EAS project ID safely
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    Alert.alert(
      'Configuration Error',
      'EAS Project ID is not set. Please configure it in app.json → extra.eas.projectId.'
    );
    return null;
  }

  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    token = result.data;
    console.log('[BHIE] Push Token:', token);
  } catch (error) {
    console.error('[BHIE] Failed to get push token:', error);
    Alert.alert('Error', 'Failed to register for push notifications. Please try again.');
    return null;
  }

  return token;
}

// ─── Notification Received Handler ───────────────────────────────────────────
export function handleNotificationReceived(notification) {
  const { title, body, data } = notification.request.content;
  console.log('[BHIE] Notification Received:', { title, body, data });
}

// ─── Notification Response Handler ───────────────────────────────────────────
export function handleNotificationResponse(response) {
  const data = response?.notification?.request?.content?.data;
  console.log('[BHIE] Notification Tapped, data:', data);

  // Example: navigate to a specific screen based on data
  // if (data?.screen && navigationRef?.current) {
  //   navigationRef.current.navigate(data.screen);
  // }
}
