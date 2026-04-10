import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import alertsAPI, { ClientAlert } from '../services/alertsService';
import { PremiumBadge } from './ui/PremiumComponents';
import toast from 'react-hot-toast';

interface AlertProps {
  alert: ClientAlert;
  onMarkRead: (id: string) => void;
}

const AlertItem: React.FC<AlertProps> = ({ alert, onMarkRead }) => {
  const getColor = (type: ClientAlert['type']) => {
    switch (type) {
      case 'danger': return 'border-red-500/30 bg-red-500/10 text-red-100';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100';
      case 'success': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
      case 'info': return 'border-blue-500/30 bg-[#00D4FF]/20 text-[#00D4FF]/10 text-blue-100';
      default: return 'border-gray-500/30 bg-gray-500/10 text-white';
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.05 }}
      className={`glass-panel rounded-2xl p-4 border ring-2 ring-white/20 card-glow glow-pulse ${getColor(alert.type)} shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          {alert.type === 'danger' && <AlertCircle className="h-5 w-5 text-red-400" />}
          {alert.type === 'warning' && <Bell className="h-5 w-5 text-yellow-400" />}
          {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400" />}
          {alert.type === 'info' && <Info className="h-5 w-5 text-[#00D4FF]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-5 line-clamp-2 mb-1">{alert.message}</p>
          <p className="text-xs opacity-75">{timeAgo(alert.createdAt)}</p>
        </div>
        {!alert.isRead && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onMarkRead(alert._id)}
            className="flex-shrink-0 -m-1 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all group-hover:opacity-100 opacity-75"
            title="Mark as read"
          >
            <CheckCircle className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      {!alert.isRead && (
        <motion.div
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.div>
  );
};

const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);


  const refreshAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data.alerts);
      setUnreadCount(response.data.unreadCount);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await alertsAPI.markRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const markAllRead = async () => {
    try {
      await alertsAPI.markAllRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
      toast.success('All alerts marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  useEffect(() => {
    refreshAlerts();
    const interval = setInterval(refreshAlerts, 10000); // 10s poll
    return () => clearInterval(interval);
  }, []);

  const unreadAlerts = alerts.filter(a => !a.isRead);
  const readAlerts = alerts.filter(a => a.isRead).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <PremiumBadge>
          <Bell className="h-3.5 w-3.5 -ml-0.5" />
          Smart Alerts ({unreadCount})
        </PremiumBadge>
        {unreadCount > 0 && (
          <motion.button
            onClick={markAllRead}
            whileHover={{ scale: 1.05 }}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 transition-all"
          >
            Mark all read
          </motion.button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="glass-panel h-16 rounded-2xl animate-pulse" />
          <div className="glass-panel h-16 rounded-2xl animate-pulse" />
        </div>
      ) : unreadAlerts.length > 0 ? (
        <>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
              New alerts ({unreadAlerts.length})
            </p>
            <AnimatePresence>
              {unreadAlerts.map((alert) => (
                <motion.div key={alert._id} exit={{ opacity: 0, height: 0 }}>
                  <AlertItem alert={alert} onMarkRead={markRead} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {readAlerts.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">
                Recent ({readAlerts.length})
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {readAlerts.map((alert) => (
                  <AlertItem key={alert._id} alert={alert} onMarkRead={markRead} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-2xl p-8 text-center border-2 border-dashed border-white/20"
        >
          <Bell className="h-12 w-12 mx-auto text-white/30 mb-4" />
          <p className="text-ink-400 mb-1">No alerts yet</p>
          <p className="text-xs text-ink-500">New records and trends will appear here automatically</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AlertsPanel;

