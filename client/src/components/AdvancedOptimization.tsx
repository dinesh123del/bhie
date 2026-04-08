import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  BarChart3,
  Truck,
  Calendar,
  Shield,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface OptimizationResult {
  portfolio?: {
    portfolio: any[];
    expectedReturn: number;
    risk: number;
    confidence: number;
  };
  route?: {
    route: any[];
    totalDistance: number;
    optimization: number;
  };
  schedule?: {
    schedule: any[];
    totalEfficiency: number;
    utilization: number;
  };
  type: string;
  computedAt: string;
}

interface AdvancedOptimizationProps {
  businessId?: string;
  className?: string;
}

export function AdvancedOptimization({ businessId, className }: AdvancedOptimizationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [capabilities, setCapabilities] = useState<any>(null);
  const [optimizationResults, setOptimizationResults] = useState<OptimizationResult[]>([]);
  const [isOptimizing, setIsOptimizing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quantum capabilities
  const fetchCapabilities = async () => {
    try {
      const response = await fetch('/api/quantum/capabilities', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCapabilities(data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching capabilities:', error);
    }
  };

  // Portfolio optimization
  const optimizePortfolio = async () => {
    if (!user) return;
    
    setIsOptimizing('portfolio');
    
    try {
      const mockAssets = [
        { symbol: 'STOCK_A', expectedReturn: 0.12, variance: 0.04, correlation: [0, 0.3, 0.1] },
        { symbol: 'STOCK_B', expectedReturn: 0.08, variance: 0.02, correlation: [0.3, 0, 0.2] },
        { symbol: 'STOCK_C', expectedReturn: 0.15, variance: 0.06, correlation: [0.1, 0.2, 0] }
      ];
      
      const response = await fetch('/api/quantum/optimize/portfolio', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assets: mockAssets,
          constraints: { riskPenalty: 0.5, correlationPenalty: 0.3 }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOptimizationResults(prev => [data.data, ...prev.slice(0, 4)]);
        toast({
          title: "Portfolio Optimized",
          description: "Found optimal investment allocation using advanced algorithms",
        });
      }
    } catch (error) {
      console.error('❌ Portfolio optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize portfolio at this time",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(null);
    }
  };

  // Route optimization
  const optimizeRoutes = async () => {
    if (!user) return;
    
    setIsOptimizing('routes');
    
    try {
      const mockLocations = [
        { id: 1, x: 0, y: 0, name: "Warehouse" },
        { id: 2, x: 10, y: 5, name: "Customer A" },
        { id: 3, x: 8, y: 12, name: "Customer B" },
        { id: 4, x: 3, y: 9, name: "Customer C" }
      ];
      
      const response = await fetch('/api/quantum/optimize/routes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: mockLocations,
          constraints: { distanceWeight: 1.0 }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOptimizationResults(prev => [data.data, ...prev.slice(0, 4)]);
        toast({
          title: "Routes Optimized",
          description: "Found most efficient delivery routes",
        });
      }
    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      toast({
        title: "Optimization Failed", 
        description: "Unable to optimize routes at this time",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(null);
    }
  };

  // Schedule optimization
  const optimizeSchedule = async () => {
    if (!user) return;
    
    setIsOptimizing('schedule');
    
    try {
      const mockTasks = [
        { id: 1, name: "Product Development", difficulty: 0.7, duration: 5 },
        { id: 2, name: "Marketing Campaign", difficulty: 0.4, duration: 3 },
        { id: 3, name: "Customer Support", difficulty: 0.3, duration: 2 }
      ];
      
      const mockResources = [
        { id: 1, name: "Team Alpha", efficiency: 0.9, availability: 0.8 },
        { id: 2, name: "Team Beta", efficiency: 0.8, availability: 0.9 }
      ];
      
      const response = await fetch('/api/quantum/optimize/schedule', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tasks: mockTasks,
          resources: mockResources
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setOptimizationResults(prev => [data.data, ...prev.slice(0, 4)]);
        toast({
          title: "Schedule Optimized",
          description: "Optimal resource allocation found",
        });
      }
    } catch (error) {
      console.error('❌ Schedule optimization failed:', error);
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize schedule at this time", 
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(null);
    }
  };

  useEffect(() => {
    fetchCapabilities();
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading optimization tools...</span>
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
          <Zap className="h-6 w-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Advanced Optimization</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCapabilities}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Capabilities Overview */}
      {capabilities && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-500" />
                Optimization Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Backend</p>
                  <p className="text-lg font-semibold capitalize">{capabilities.backend}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Max Qubits</p>
                  <p className="text-lg font-semibold">{capabilities.maxQubits}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Execution Time</p>
                  <p className="text-lg font-semibold">{capabilities.avgExecutionTime}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={capabilities.initialized ? 'bg-green-500' : 'bg-yellow-500'}>
                    {capabilities.initialized ? 'Active' : 'Initializing'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Optimization Tools */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Portfolio Optimization */}
        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                Investment Portfolio Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Find the optimal allocation of investments to maximize returns while minimizing risk.
              </p>
              <Button 
                onClick={optimizePortfolio}
                disabled={isOptimizing === 'portfolio'}
                className="w-full"
              >
                {isOptimizing === 'portfolio' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isOptimizing === 'portfolio' ? 'Optimizing...' : 'Optimize Portfolio'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Route Optimization */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-orange-500" />
                Route Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Calculate the most efficient routes for deliveries, sales calls, or site visits.
              </p>
              <Button 
                onClick={optimizeRoutes}
                disabled={isOptimizing === 'routes'}
                className="w-full"
              >
                {isOptimizing === 'routes' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isOptimizing === 'routes' ? 'Optimizing...' : 'Optimize Routes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Optimization */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                Resource Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Optimize task assignments and resource allocation for maximum efficiency.
              </p>
              <Button 
                onClick={optimizeSchedule}
                disabled={isOptimizing === 'schedule'}
                className="w-full"
              >
                {isOptimizing === 'schedule' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isOptimizing === 'schedule' ? 'Optimizing...' : 'Optimize Schedule'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Results */}
      <AnimatePresence>
        {optimizationResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                  Recent Optimizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationResults.map((result, index) => (
                    <motion.div
                      key={`${result.type}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium capitalize">{result.type} Optimization</span>
                        </div>
                        <Badge variant="outline">
                          {new Date(result.computedAt).toLocaleTimeString()}
                        </Badge>
                      </div>
                      
                      {/* Portfolio Results */}
                      {result.portfolio && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Expected Return</p>
                            <p className="font-semibold text-green-600">
                              {(result.portfolio.expectedReturn * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Risk Level</p>
                            <p className="font-semibold text-orange-600">
                              {(result.portfolio.risk * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Confidence</p>
                            <p className="font-semibold text-blue-600">
                              {(result.portfolio.confidence * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Route Results */}
                      {result.route && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Distance</p>
                            <p className="font-semibold">
                              {result.route.totalDistance.toFixed(1)} units
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Optimization</p>
                            <p className="font-semibold text-green-600">
                              {(result.route.optimization * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Schedule Results */}
                      {result.schedule && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total Efficiency</p>
                            <p className="font-semibold text-green-600">
                              {(result.schedule.totalEfficiency * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Resource Utilization</p>
                            <p className="font-semibold text-blue-600">
                              {(result.schedule.utilization * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdvancedOptimization;
