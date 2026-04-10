"use client"
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  Zap,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Settings,
  Lightbulb,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface AgentTask {
  id: string;
  type: 'analysis' | 'prediction' | 'recommendation' | 'automation' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  businessId: string;
  userId: string;
  data: any;
  createdAt: string;
  scheduledFor?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface AgentCapability {
  name: string;
  description: string;
  triggers: string[];
  category: 'analysis' | 'strategy' | 'risk' | 'optimization' | 'analytics' | 'automation';
  frequency: string;
}

interface AgentPerformance {
  summary: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
    successRate: number;
  };
  agentPerformance: Record<string, { total: number; completed: number; failed: number }>;
  lastUpdated: string;
}

interface BusinessContext {
  businessId: string;
  userId: string;
  industry?: string;
  size: 'small' | 'medium' | 'large';
  metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    growth: number;
    transactions: number;
    healthScore: number;
  };
  recentEvents: any[];
  alerts: any[];
}

interface AutonomousAgentsProps {
  businessId?: string;
  className?: string;
}

export function AutonomousAgents({ businessId, className }: AutonomousAgentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [availableAgents, setAvailableAgents] = useState<AgentCapability[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [context, setContext] = useState<BusinessContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState<string | null>(null);

  // Fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const [agentsRes, tasksRes, performanceRes, contextRes] = await Promise.all([
        fetch('/api/agents/capabilities', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/agents/tasks${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/agents/performance${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/agents/context${businessId ? `/${businessId}` : ''}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAvailableAgents(agentsData.data);
      }

      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data.slice(0, 20)); // Show last 20 tasks
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setPerformance(performanceData.data);
      }

      if (contextRes.ok) {
        const contextData = await contextRes.json();
        setContext(contextData.data);
      }

    } catch (error) {
      console.error('❌ Error fetching agents data:', error);
      toast({
        title: "Connection Error",
        description: "Unable to fetch autonomous agents data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, businessId, toast]);

  // Trigger agent manually
  const triggerAgent = useCallback(async (agentName: string) => {
    if (!user) return;

    try {
      setIsTriggering(agentName);
      
      const response = await fetch(
        `/api/agents/trigger/${agentName}${businessId ? `/${businessId}` : ''}`,
        {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Agent Triggered",
          description: `${agentName} has been triggered successfully`,
        });
        // Refresh tasks after a short delay
        setTimeout(fetchInitialData, 2000);
      } else {
        throw new Error(data.error || 'Failed to trigger agent');
      }

    } catch (error) {
      console.error('❌ Error triggering agent:', error);
      toast({
        title: "Trigger Failed",
        description: error instanceof Error ? error.message : 'Failed to trigger agent',
        variant: "destructive"
      });
    } finally {
      setIsTriggering(null);
    }
  }, [user, businessId, toast, fetchInitialData]);

  // Initial data fetch
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, [fetchInitialData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-[#00D4FF] animate-spin" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'risk': return <Shield className="h-4 w-4" />;
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      case 'analytics': return <Lightbulb className="h-4 w-4" />;
      case 'automation': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-[#00D4FF]/20 text-[#00D4FF]';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-[#00D4FF]" />
            <span className="ml-2 text-gray-600">Loading autonomous agents...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-[#00D4FF]" />
          <h2 className="text-2xl font-bold">Business Analysis Tools</h2>
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

      {/* Performance Overview */}
      {performance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                Agent Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Tasks</p>
                  <p className="text-lg font-semibold">{performance.summary.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-green-600">{performance.summary.completed}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-lg font-semibold text-red-600">{performance.summary.failed}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-lg font-semibold text-yellow-600">{performance.summary.pending}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {performance.summary.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Success Rate</span>
                  <span>{performance.summary.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={performance.summary.successRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agents">Analysis Tools</TabsTrigger>
          <TabsTrigger value="tasks">Recent Reports</TabsTrigger>
          <TabsTrigger value="context">Business Overview</TabsTrigger>
        </TabsList>

        {/* Available Agents */}
        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAgents.map((agent, index) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {getCategoryIcon(agent.category)}
                        <span className="ml-2">{agent.name}</span>
                      </CardTitle>
                      <Button
                        size="sm"
                        onClick={() => triggerAgent(agent.name)}
                        disabled={isTriggering === agent.name}
                      >
                        {isTriggering === agent.name ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="capitalize">
                        {agent.category}
                      </Badge>
                      <span className="text-gray-500">{agent.frequency}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Triggers:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.triggers.map((trigger, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Recent Tasks */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <p className="font-medium capitalize">{task.type}</p>
                          <p className="text-sm text-gray-600">
                            Priority: <span className="capitalize">{task.priority}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(task.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getPriorityColor(task.priority)} text-white`}
                        >
                          {task.priority}
                        </Badge>
                        {task.error && (
                          <p className="text-xs text-red-600 mt-1 max-w-xs truncate">
                            {task.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Business Context */}
        <TabsContent value="context" className="space-y-4">
          {context && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Current Business Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Business Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Industry:</span>
                          <span className="capitalize">{context.industry || 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Size:</span>
                          <span className="capitalize">{context.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recent Events:</span>
                          <span>{context.recentEvents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Active Alerts:</span>
                          <span>{context.alerts.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Current Metrics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span>₹{context.metrics.revenue.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expenses:</span>
                          <span>₹{context.metrics.expenses.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit:</span>
                          <span className={context.metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ₹{context.metrics.profit.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Growth:</span>
                          <span className={context.metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {context.metrics.growth.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Health Score:</span>
                          <span>{context.metrics.healthScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AutonomousAgents;
