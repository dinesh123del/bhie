import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PremiumBackground from '../components/PremiumBackground';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const ProfileScreen = ({ navigation }) => {
    const handleLogout = () => {
        navigation.replace('Login');
    };

    return (
        <PremiumBackground>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.kicker}>Settings</Text>
                    <Text style={styles.title}>Your <Text style={styles.highlight}>Profile</Text></Text>
                </View>

                <ScrollView style={styles.content}>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>D</Text>
                        </View>
                        <Text style={styles.userName}>Dinesh Kumar</Text>
                        <Text style={styles.userEmail}>dinesh@example.com</Text>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumText}>PREMIUM MEMBER</Text>
                        </View>
                    </Animated.View>

                    <View style={styles.section}>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                            <Ionicons name="person-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.menuText}>Edit Account</Text>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.menuText}>Notifications</Text>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
                            <Text style={styles.menuText}>Security</Text>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Sign Out</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 20 },
    kicker: { fontSize: 10, fontWeight: '900', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 2 },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 4, letterSpacing: -1 },
    highlight: { color: '#38BDF8' },
    content: { flex: 1, marginTop: 20 },
    profileHeader: { alignItems: 'center', padding: 24 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#38BDF8', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
    userName: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 16 },
    userEmail: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 14, marginTop: 4 },
    premiumBadge: { backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderColor: 'rgba(56, 189, 248, 0.3)', borderWidth: 1, marginTop: 12 },
    premiumText: { color: '#38BDF8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    section: { backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 32, margin: 24, padding: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.05)' },
    menuText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1, marginLeft: 16 },
    logoutButton: { marginHorizontal: 24, padding: 20, borderRadius: 24, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', marginTop: 10, marginBottom: 40 },
    logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 16 }
});

export default ProfileScreen;
