import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Mock Screens for demonstration
const AddScreen = () => <DashboardScreen />; // Placeholder for adding transactions
const ProfileScreen = () => <DashboardScreen />; // Placeholder for profile

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
                    borderTopWidth: 0,
                    elevation: 0,
                    backgroundColor: '#0F1219',
                    height: 90,
                    paddingBottom: 30,
                    paddingTop: 10,
                    borderTopColor: 'rgba(255, 255, 255, 0.05)',
                    borderTopWidth: 1,
                }
            })}
        >
            <Tab.Screen name="Home" component={DashboardScreen} />
            <Tab.Screen name="Add" component={AddScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

import * as Haptics from 'expo-haptics';
import { playStartupSound } from './utils/audio';

export default function App() {
    React.useEffect(() => {
        // Elite Startup Sequence
        const startUp = async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await playStartupSound();
        };
        startUp();
    }, []);

    return (
        <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator 
                screenOptions={{
                    headerShown: false,
                    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Smooth horizontal slide
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
