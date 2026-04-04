import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import Card from '../components/Card';
import { transactionService } from '../services/api';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
            // Simulated fetch for example
            const response = await transactionService.getOverview();
            setData(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
            // Example data for visualization
            setData({
                revenue: 5420.00,
                expenses: 1240.50,
                netBalance: 4179.50,
                transactions: [
                    { id: '1', title: 'Stripe Payout', amount: 500, type: 'revenue', date: '2026-04-03' },
                    { id: '2', title: 'Monthly Rent', amount: -1200, type: 'expense', date: '2026-04-01' },
                    { id: '3', title: 'AWS Cloud', amount: -40.50, type: 'expense', date: '2026-03-28' },
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.userName}>Dinesh</Text>
            </View>

            <ScrollView 
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
                showsVerticalScrollIndicator={false}
            >
                {/* Main Balance Card */}
                <Card style={styles.mainBalanceCard} delay={200}>
                    <Text style={styles.cardLabel}>Net Balance</Text>
                    <Text style={styles.balanceText}>${data.netBalance.toLocaleString()}</Text>
                    
                    <View style={styles.statsContainer}>
                        <View>
                            <Text style={styles.statLabel}>Revenue</Text>
                            <Text style={styles.revenueText}>+${data.revenue.toLocaleString()}</Text>
                        </View>
                        <View>
                            <Text style={styles.statLabel}>Expenses</Text>
                            <Text style={styles.expenseText}>-${data.expenses.toLocaleString()}</Text>
                        </View>
                    </View>
                </Card>

                {/* Transactions Section */}
                <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                    <Text style={styles.sectionTitle}>Recent Activities</Text>
                    {data.transactions.map((tx, index) => (
                        <Card key={tx.id} delay={600 + (index * 100)}>
                            <View style={styles.txRow}>
                                <View>
                                    <Text style={styles.txTitle}>{tx.title}</Text>
                                    <Text style={styles.txDate}>{tx.date}</Text>
                                </View>
                                <Text style={[styles.txAmount, tx.type === 'revenue' ? styles.revenueText : styles.expenseText]}>
                                    {tx.type === 'revenue' ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                                </Text>
                            </View>
                        </Card>
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 16,
        color: '#828282',
        fontWeight: '500',
    },
    userName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A1A',
        marginTop: 4,
    },
    mainBalanceCard: {
        backgroundColor: '#1A1A1A',
    },
    cardLabel: {
        color: '#E0E0E0',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    balanceText: {
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 16,
    },
    statLabel: {
        color: '#828282',
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    revenueText: {
        color: '#34C759',
        fontSize: 18,
        fontWeight: '700',
    },
    expenseText: {
        color: '#FF3B30',
        fontSize: 18,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 24,
        marginTop: 32,
        marginBottom: 16,
    },
    txRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    txTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    txDate: {
        fontSize: 13,
        color: '#9E9E9E',
        marginTop: 2,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '700',
    }
});

export default DashboardScreen;
