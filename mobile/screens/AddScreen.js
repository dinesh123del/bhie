import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PremiumBackground from '../components/PremiumBackground';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

const AddScreen = ({ navigation }) => {
    return (
        <PremiumBackground>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.kicker}>New Entry</Text>
                    <Text style={styles.title}>Track <Text style={styles.highlight}>Intelligence</Text></Text>
                </View>

                <View style={styles.content}>
                    <Animated.View entering={FadeInDown.delay(200)} style={styles.optionCard}>
                        <TouchableOpacity 
                            style={styles.optionButton}
                            onPress={() => navigation.navigate('ScanBill')}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="camera" size={32} color="#38BDF8" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Scan Receipt</Text>
                                <Text style={styles.optionDesc}>AI-powered OCR extraction</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300)} style={styles.optionCard}>
                        <TouchableOpacity 
                            style={styles.optionButton}
                            onPress={() => navigation.navigate('ManualEntry')}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons name="document-text" size={32} color="#EF4444" />
                            </View>
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Manual Entry</Text>
                                <Text style={styles.optionDesc}>Quick transaction logging</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 40 },
    kicker: { fontSize: 10, fontWeight: '900', color: '#38BDF8', textTransform: 'uppercase', letterSpacing: 2 },
    title: { fontSize: 32, fontWeight: '900', color: '#FFFFFF', marginTop: 4, letterSpacing: -1 },
    highlight: { color: '#38BDF8' },
    content: { paddingHorizontal: 24 },
    optionCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 32,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 24,
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20
    },
    optionTextContainer: { flex: 1 },
    optionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    optionDesc: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 14, marginTop: 2, fontWeight: '600' }
});

export default AddScreen;
