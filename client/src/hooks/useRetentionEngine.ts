import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { premiumFeedback } from '../utils/premiumFeedback';

interface DynamicInsight {
  id: string;
  title: string;
  message: string;
  type: 'insight' | 'warning' | 'achievement';
}

export const useRetentionEngine = (userData: any, expenses: any[]) => {
  const [insights, setInsights] = useState<DynamicInsight[]>([]);

  const generateInsights = useCallback(() => {
    const newInsights: DynamicInsight[] = [];
    
    // Logic for "You spent more today than yesterday"
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const todayTotal = expenses
      .filter(e => e.date?.split('T')[0] === today)
      .reduce((sum, e) => sum + e.amount, 0);
      
    const yesterdayTotal = expenses
      .filter(e => e.date?.split('T')[0] === yesterday)
      .reduce((sum, e) => sum + e.amount, 0);

    if (todayTotal > yesterdayTotal && todayTotal > 0) {
      newInsights.push({
        id: 'spending-spike',
        title: 'Spending Alert',
        message: `Your expenses are ${Math.round((todayTotal/yesterdayTotal - 1) * 100)}% higher today than yesterday.`,
        type: 'warning'
      });
    } else if (todayTotal < yesterdayTotal && yesterdayTotal > 0) {
      newInsights.push({
        id: 'saving-pulse',
        title: 'Great Savings',
        message: `Excellent! You saved ₹${Math.round(yesterdayTotal - todayTotal)} today compared to yesterday.`,
        type: 'achievement'
      });
    }

    // Weekly summary highlight
    if (expenses.length > 5) {
      newInsights.push({
        id: 'weekly-summary',
        title: 'Weekly Summary',
        message: `Your weekly summary is ready. Click to see how your habits shifted.`,
        type: 'insight'
      });
    }

    setInsights(newInsights);
  }, [expenses]);

  useEffect(() => {
    if (expenses?.length) {
      generateInsights();
    }
  }, [expenses, generateInsights]);

  // Behavioral triggers (Retention)
  useEffect(() => {
    const lastActive = localStorage.getItem('last_active');
    const now = Date.now();
    
    if (lastActive) {
      const hoursSince = (now - parseInt(lastActive)) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        toast('Welcome back! Ready to track today\'s progress?', {
          id: 'welcome-back',
          icon: '👋',
          duration: 6000
        });
        premiumFeedback.success();
      }
    }
    
    localStorage.setItem('last_active', now.toString());
  }, []);

  return { insights };
};
