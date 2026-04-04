import mongoose from 'mongoose';
import Insight from '../models/Insight';
import BusinessRecord from '../models/Record';

export class IntelligenceEngine {
  static async generateInsights(userId: mongoose.Types.ObjectId): Promise<void> {
    // Get all transactions for the user
    const transactions = await BusinessRecord.find({ userId });

    // Calculate totals
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const insights: { message: string; priority: 'low' | 'medium' | 'high' }[] = [];

    // Rule 1: Spending but not earning
    if (income === 0 && expense > 0) {
      insights.push({
        message: 'You are spending but not earning. Focus on generating income first.',
        priority: 'high',
      });
    }

    // Rule 2: Loss
    if (expense > income) {
      insights.push({
        message: 'You are in loss. Your expenses exceed your income.',
        priority: 'high',
      });
    }

    // Rule 3: Profitable
    if (income > expense) {
      insights.push({
        message: 'Your business is profitable. Keep up the good work!',
        priority: 'low',
      });
    }

    // Clear old insights
    await Insight.deleteMany({ userId });

    // Save new insights
    for (const insight of insights) {
      await Insight.create({
        userId,
        message: insight.message,
        priority: insight.priority,
      });
    }
  }

  static async getPredictions(userId: mongoose.Types.ObjectId): Promise<{
    nextIncome: number;
    nextExpense: number;
    nextProfit: number;
  }> {
    const transactions = await BusinessRecord.find({ userId }).sort({ date: -1 });

    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = transactions.filter(t => t.date >= thirtyDaysAgo);

    const incomes = recentTransactions.filter(t => t.type === 'income');
    const expenses = recentTransactions.filter(t => t.type === 'expense');

    const avgIncome = incomes.length > 0
      ? incomes.reduce((sum, t) => sum + t.amount, 0) / incomes.length
      : 0;

    const avgExpense = expenses.length > 0
      ? expenses.reduce((sum, t) => sum + t.amount, 0) / expenses.length
      : 0;

    return {
      nextIncome: Math.round(avgIncome),
      nextExpense: Math.round(avgExpense),
      nextProfit: Math.round(avgIncome - avgExpense),
    };
  }
}