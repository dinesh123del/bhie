import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Info,
  Zap,
  Calendar,
  Wallet,
  PiggyBank,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Alert {
  id: string;
  type: 'opportunity' | 'warning' | 'insight' | 'celebration' | 'reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissable: boolean;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Generate smart alerts based on business patterns
  const generateSmartAlerts = useCallback((): Alert[] => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const date = now.getDate();
    
    const newAlerts: Alert[] = [];

    // Morning insights (before 10 AM)
    if (hour >= 6 && hour <= 10) {
      newAlerts.push({
        id: 'morning-brief',
        type: 'insight',
        title: 'Good Morning! ☀️',
        message: 'Yesterday you made ₹45,000 in revenue - that\'s 23% better than your average Tuesday! Your top performing category was Electronics.',
        priority: 'low',
        action: {
          label: 'View Details',
          onClick: () => console.log('View morning details')
        },
        dismissable: true,
        timestamp: now,
        icon: <Sparkles className="w-5 h-5" />,
        color: '#34C759'
      });
    }

    // Cash flow warning (if it's mid-month)
    if (date >= 12 && date <= 18) {
      newAlerts.push({
        id: 'cashflow-prediction',
        type: 'warning',
        title: 'Cash Flow Forecast',
        message: 'Based on your patterns, you might have tighter cash flow next week (₹1.2L predicted expenses vs ₹95K expected income). Consider delaying non-essential purchases.',
        priority: 'medium',
        action: {
          label: 'View Forecast',
          onClick: () => console.log('View forecast')
        },
        dismissable: true,
        timestamp: now,
        icon: <TrendingDown className="w-5 h-5" />,
        color: '#FF9500'
      });
    }

    // GST filing reminder (if close to deadline)
    if (date >= 15 && date <= 20) {
      newAlerts.push({
        id: 'gst-reminder',
        type: 'reminder',
        title: 'GST Filing Due Soon',
        message: 'Your GSTR-1 is due in 5 days. I\'ve prepared your summary - you have 127 transactions ready to file. No stress, you\'re well prepared!',
        priority: 'high',
        action: {
          label: 'Review & File',
          onClick: () => console.log('Review GST')
        },
        dismissable: true,
        timestamp: now,
        icon: <Calendar className="w-5 h-5" />,
        color: '#007AFF'
      });
    }

    // Growth opportunity
    newAlerts.push({
      id: 'growth-opportunity',
      type: 'opportunity',
      title: '🚀 Growth Opportunity Spotted!',
      message: 'I noticed your marketing spend is only 5% of revenue (industry average is 12%). Increasing this could potentially boost revenue by 30-40%. Want to explore?',
      priority: 'medium',
      action: {
        label: 'Explore Strategy',
        onClick: () => console.log('Explore growth')
      },
      dismissable: true,
      timestamp: now,
      icon: <Zap className="w-5 h-5" />,
      color: '#AF52DE'
    });

    // Weekend spending pattern (if Friday)
    if (day === 5) {
      newAlerts.push({
        id: 'weekend-insight',
        type: 'insight',
        title: 'Weekend Spending Pattern',
        message: 'Your weekend expenses are typically 40% higher than weekdays. This week you\'ve been more disciplined - only 15% increase so far. Great job managing impulse purchases! 🎉',
        priority: 'low',
        dismissable: true,
        timestamp: now,
        icon: <PiggyBank className="w-5 h-5" />,
        color: '#34C759'
      });
    }

    // Tax saving opportunity (end of quarter)
    if (date >= 25 && (date <= 31)) {
      newAlerts.push({
        id: 'tax-saving',
        type: 'opportunity',
        title: '💰 Tax Saving Opportunity',
        message: 'You can save ₹18,500 in taxes by making these investments before month-end: ELSS (₹50K), NPS (₹50K), or Insurance premium. Want me to calculate the best option for you?',
        priority: 'high',
        action: {
          label: 'Calculate Savings',
          onClick: () => console.log('Calculate tax savings')
        },
        dismissable: true,
        timestamp: now,
        icon: <Wallet className="w-5 h-5" />,
        color: '#FFD700'
      });
    }

    // Unusual transaction detection
    newAlerts.push({
      id: 'unusual-transaction',
      type: 'warning',
      title: 'Unusual Transaction Detected',
      message: 'I noticed a ₹35,000 expense in "Miscellaneous" category yesterday - that\'s 5x your usual amount. Just checking: was this expected?',
      priority: 'medium',
      action: {
        label: 'Review Transaction',
        onClick: () => console.log('Review transaction')
      },
      dismissable: true,
      timestamp: now,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: '#FF3B30'
    });

    // Milestone celebration
    newAlerts.push({
      id: 'milestone-celebration',
      type: 'celebration',
      title: '🎉 Milestone Reached!',
      message: 'Congratulations! You\'ve crossed ₹10 Lakhs in total revenue. That puts you in the top 15% of businesses in your category. You should be proud!',
      priority: 'low',
      dismissable: true,
      timestamp: now,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: '#FF2D55'
    });

    return newAlerts;
  }, []);

  // Load alerts on mount
  useEffect(() => {
    const saved = localStorage.getItem('bhie_smart_alerts');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only load alerts from today
      const today = new Date().toDateString();
      const todayAlerts = parsed.filter((a: Alert) => 
        new Date(a.timestamp).toDateString() === today
      );
      setAlerts(todayAlerts);
      setUnreadCount(todayAlerts.filter((a: Alert) => !a.dismissable).length);
    } else {
      // Generate new alerts
      const newAlerts = generateSmartAlerts();
      setAlerts(newAlerts);
      setUnreadCount(newAlerts.length);
      
      // Show toast for urgent alerts
      const urgentAlerts = newAlerts.filter(a => a.priority === 'urgent' || a.priority === 'high');
      if (urgentAlerts.length > 0) {
        toast({
          title: `${urgentAlerts.length} important insights`,
          description: "You have new business insights waiting for you",
        });
      }
    }
  }, [generateSmartAlerts, toast]);

  // Save alerts when they change
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('bhie_smart_alerts', JSON.stringify(alerts));
    }
  }, [alerts]);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 border-red-500/30 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500/30 text-orange-400';
      case 'medium': return 'bg-blue-500/20 border-blue-500/30 text-blue-400';
      default: return 'bg-gray-500/20 border-gray-500/30 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Zap className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'insight': return <Info className="w-4 h-4" />;
      case 'celebration': return <Sparkles className="w-4 h-4" />;
      case 'reminder': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Alert Bell Button */}
      <motion.button
        className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1A1A1B] border border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(true)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Alert Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowPanel(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0B] border-l border-white/10 z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Smart Insights</h2>
                      <p className="text-sm text-gray-400">{alerts.length} notifications</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Alerts List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">No new insights</p>
                    <p className="text-sm text-gray-600 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border ${getPriorityStyles(alert.priority)} relative group`}
                    >
                      {/* Type badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: alert.color }}>
                          {alert.icon}
                        </span>
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                          {alert.type}
                        </span>
                        <span className="text-xs ml-auto opacity-50">
                          {alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="font-semibold text-white mb-1">{alert.title}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">{alert.message}</p>

                      {/* Action */}
                      {alert.action && (
                        <button
                          onClick={alert.action.onClick}
                          className="mt-3 flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                          style={{ color: alert.color }}
                        >
                          {alert.action.label}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {/* Dismiss */}
                      {alert.dismissable && (
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-[#0A0A0B]">
                <p className="text-xs text-gray-500 text-center">
                  Insights are generated based on your business patterns
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default SmartAlerts;
