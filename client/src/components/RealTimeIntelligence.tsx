import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Zap,
  Bell,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BusinessMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  transactions: number;
  avgTransactionValue: number;
  growthRate: number;
  healthScore: number;
}

interface RealTimeAlert {
  id: string;
  type: 'alert';
  userId: string;
  businessId: string;
  data: {
    metric: string;
    value: number;
    threshold: number;
    message: string;
    currentMetrics: BusinessMetrics;
  };
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
}

interface RealTimeEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  severity?: string;
}

interface RealTimeIntelligenceProps {
  businessId?: string;
  className?: string;
}

export function RealTimeIntelligence({ businessId, className }: RealTimeIntelligenceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const [metricsRes, alertsRes, eventsRes] = await Promise.all([
        fetch(`/api/realtime/metrics${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/realtime/alerts${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/realtime/events${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.data);
        setLastUpdate(new Date());
      }

      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.data.slice(0, 5)); // Show last 5 alerts
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents(eventsData.data.slice(0, 10)); // Show last 10 events
      }

    } catch (error) {
      console.error('❌ Error fetching real-time data:', error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch real-time data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, businessId, toast]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/socket.io/`
      : `ws://localhost:5000/socket.io/`;

    // Note: In production, you'd use socket.io-client
    // For now, we'll simulate with polling
    const interval = setInterval(fetchInitialData, 30000); // Poll every 30 seconds
    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [user, fetchInitialData]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading real-time intelligence...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Last update: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInitialData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Live Business Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(metrics.revenue)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(metrics.expenses)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Profit</p>
                  <p className={`text-lg font-semibold ${metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.profit)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Health Score</p>
                  <p className={`text-lg font-semibold ${getHealthScoreColor(metrics.healthScore)}`}>
                    {metrics.healthScore}/100
                  </p>
                  <p className={`text-xs ${getHealthScoreColor(metrics.healthScore)}`}>
                    {getHealthScoreLabel(metrics.healthScore)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Transactions</p>
                    <p className="text-lg font-semibold">{metrics.transactions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Avg Transaction</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(metrics.avgTransactionValue)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Growth Rate</p>
                    <p className={`text-lg font-semibold ${metrics.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metrics.growthRate >= 0 ? '+' : ''}{metrics.growthRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Real-Time Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                  Active Alerts
                  <Badge className="ml-2" variant="secondary">
                    {alerts.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <motion.div
                      key={`${alert.timestamp}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Alert className={`border-l-4 ${getSeverityColor(alert.severity)} border-l-4`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{alert.data.message}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {alert.data.metric}: {formatCurrency(alert.data.value)} 
                              (Threshold: {formatCurrency(alert.data.threshold)})
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="capitalize">
                              {alert.severity}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Events */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-500" />
                Recent Events
                <Badge className="ml-2" variant="secondary">
                  {events.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div
                    key={`${event.timestamp}-${index}`}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(event.severity || 'low')}`} />
                      <div>
                        <p className="text-sm font-medium capitalize">{event.type}</p>
                        <p className="text-xs text-gray-600">
                          {typeof event.data === 'object' 
                            ? JSON.stringify(event.data).substring(0, 50) + '...'
                            : String(event.data).substring(0, 50)
                          }
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default RealTimeIntelligence;
