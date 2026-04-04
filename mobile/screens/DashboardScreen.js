import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Card from '../components/Card';
import PremiumBackground from '../components/PremiumBackground';
import { transactionService } from '../services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const DashboardScreen = () => {
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState({
        revenue: 0,
        expenses: 0,
        netBalance: 0,
        transactions: []
    });

    const fetchData = async () => {
        try {
            const response = await transactionService.getOverview();
            setData(response.data);
        } catch (error) {
            setData({
                revenue: 15420.00,
                expenses: 3240.50,
                netBalance: 12179.50,
                transactions: [
                    { id: '1', title: 'Global Payout', amount: 500, type: 'revenue', date: '2026-04-03' },
                    { id: '2', title: 'Cloud Infrastructure', amount: -1200, type: 'expense', date: '2026-04-01' },
                    { id: '3', title: 'Security Audit', amount: -40.50, type: 'expense', date: '2026-03-28' },
                ]
            });
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    return (
        <PremiumBackground>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.kicker}>Authorized Node</Text>
                    <Text style={styles.userName}>Director <Text style={styles.highlight}>Dinesh</Text></Text>
                </View>

                <ScrollView 
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Main Intelligence Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                        <LinearGradient
                            colors={['#1E293B', '#0F172A']}
                            style={styles.mainBalanceCard}
                        >
                            <View style={styles.balanceHeader}>
                                <Text style={styles.cardLabel}>Net Strategic Capital</Text>
                                <View style={styles.statusBadge}>
                                    <Text style={styles.statusText}>ELITE</Text>
                                </View>
                            </View>
                            <Text style={styles.balanceText}>₹{data.netBalance.toLocaleString()}</Text>
                            
                            <View style={styles.statsContainer}>
                                <View>
                                    <Text style={styles.statLabel}>Revenue Velocity</Text>
                                    <Text style={styles.revenueText}>+₹{data.revenue.toLocaleString()}</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View>
                                    <Text style={styles.statLabel}>Expenditure</Text>
                                    <Text style={styles.expenseText}>-₹{data.expenses.toLocaleString()}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Transactions Section */}
                    <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Node Activity Log</Text>
                            <Text style={styles.sectionSubtitle}>Last 72 hours of telemetry</Text>
                        </View>
                        
                        {data.transactions.map((tx, index) => (
                            <View key={tx.id} style={styles.txCard}>
                                <View style={styles.txIconContainer}>
                                    <View style={[styles.txIndicator, tx.type === 'revenue' ? styles.bgRevenue : styles.bgExpense]} />
                                </View>
                                <View style={styles.txInfo}>
                                    <Text style={styles.txTitle}>{tx.title}</Text>
                                    <Text style={styles.txDate}>{tx.date}</Text>
                                </View>
                                <Text style={[styles.txAmount, tx.type === 'revenue' ? styles.revenueText : styles.expenseText]}>
                                    {tx.type === 'revenue' ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </Animated.View>

                    <View style={styles.footerSpacer} />
                </ScrollView>
            </SafeAreaView>
        </PremiumBackground>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
    },
    kicker: {
        fontSize: 10,
        fontWeight: '900',
        color: '#38BDF8',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    userName: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginTop: 4,
        letterSpacing: -1,
    },
    highlight: {
        color: '#38BDF8',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    mainBalanceCard: {
        marginHorizontal: 24,
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 10,
    },
    balanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statusBadge: {
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    statusText: {
        color: '#38BDF8',
        fontSize: 10,
        fontWeight: '900',
    },
    balanceText: {
        color: '#FFFFFF',
        fontSize: 42,
        fontWeight: '900',
        letterSpacing: -1.5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statLabel: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    revenueText: {
        color: '#38BDF8',
        fontSize: 18,
        fontWeight: '800',
    },
    expenseText: {
        color: '#EF4444',
        fontSize: 18,
        fontWeight: '800',
    },
    sectionHeader: {
        paddingHorizontal: 24,
        marginTop: 40,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    sectionSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
        marginTop: 2,
    },
    txCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginHorizontal: 24,
        marginVertical: 6,
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    txIconContainer: {
        width: 12,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    txIndicator: {
        width: 4,
        height: 24,
        borderRadius: 2,
    },
    bgRevenue: {
        backgroundColor: '#38BDF8',
    },
    bgExpense: {
        backgroundColor: '#EF4444',
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
    txDate: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 2,
        fontWeight: '600',
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    footerSpacer: {
        height: 40,
    }
});

export default DashboardScreen;
