import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';

// Push notification helpers
import {
  registerForPushNotificationsAsync,
  handleNotificationReceived,
  handleNotificationResponse,
} from './src/services/pushNotifications';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder screens
const AddScreen = () => <DashboardScreen />;
const ProfileScreen = () => <DashboardScreen />;

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

export default function App() {
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        // ─── Startup Sequence ───────────────────────────────────────────────
        const startUp = async () => {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (_) {
                // Haptics may not be available on all devices
            }
        };
        startUp();

        // ─── Push Notifications ─────────────────────────────────────────────
        registerForPushNotificationsAsync().then((token) => {
            if (token) {
                console.log('[BHIE] Registered push token:', token);
                // TODO: Send token to your backend here
                // api.post('/api/notifications/register', { token });
            }
        });

        // Listen for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(
            handleNotificationReceived
        );

        // Listen for user tapping on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            handleNotificationResponse
        );

        // Clean up listeners on unmount
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
