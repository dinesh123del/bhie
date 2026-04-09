import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from '@sentry/react-native';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddScreen from './screens/AddScreen';
import ProfileScreen from './screens/ProfileScreen';

// Push notification helpers
import {
  registerForPushNotificationsAsync,
  handleNotificationReceived,
  handleNotificationResponse,
} from './src/services/pushNotifications';

// Initialize Sentry for Mobile
Sentry.init({
  dsn: 'https://placeholder@sentry.io/project', // Replace with your mobile Sentry DSN
  debug: false
});

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Add') iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.35)',
        tabBarStyle: {
          borderTopWidth: 1,
          elevation: 0,
          backgroundColor: '#0F1219',
          height: 90,
          paddingBottom: 30,
          paddingTop: 10,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // startup Sequence
    const startUp = async () => {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {
        // Haptics may not be available on all devices
      }
    };
    startUp();

    // Push Notifications
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        console.log('[Biz Plus] Registered push token:', token);
        try {
          const { default: api } = await import('./services/api');
          await api.post('/api/notifications/register', { token });
          console.log('[Biz Plus] Push token synced with backend successfully');
        } catch (err) {
          console.error('[Biz Plus] Syncing push token failed:', err);
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);
