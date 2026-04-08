import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Utensils, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Clock,
  ChefHat,
  ArrowUpRight,
  ArrowDownRight,
  Package
} from 'lucide-react';
import { CommissionCard } from './components/CommissionCard';
import { InventoryPredictor } from './components/InventoryPredictor';
import { StaffingOptimizer } from './components/StaffingOptimizer';
import { MenuEngineeringMatrix } from './components/MenuEngineeringMatrix';
import { useToast } from '@/hooks/use-toast';

interface RestaurantMetrics {
  // Platform-specific
  platforms: {
    name: string;
    commission: number;
    orders: number;
    revenue: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
  }[];
  
  // Restaurant-specific KPIs
  tableTurnTime: number;
  foodCostPercentage: number;
  laborCostPercentage: number;
  rentToRevenueRatio: number;
  
  // Inventory
  inventoryTurnover: number;
  wastagePercentage: number;
  perishablesValue: number;
  
  // Financial
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  healthScore: number;
}

interface InventoryPrediction {
  item: {
    name: string;
    currentStock: number;
    unit: string;
    optimalStock: number;
    shelfLifeDays: number;
    dailyConsumption: number;
    expiryDate: Date;
    reorderPoint: number;
  };
  daysUntilDepletion: number;
  depletionDate: Date;
  recommendedOrderQty: number;
  urgency: 'critical' | 'warning' | 'normal';
  confidence: number;
  factors: string[];
}

interface StaffingForecast {
  date: Date;
  dayName: string;
  predictedCovers: number;
  recommendedStaff: number;
  currentScheduled: number;
  confidence: number;
  factors: string[];
}

interface MenuItem {
  name: string;
  category: 'star' | 'puzzle' | 'plow-horse' | 'dog';
  popularity: number;
  profitability: number;
  revenue: number;
  margin: number;
  cost: number;
  price: number;
  monthlyOrders: number;
}

export const RestaurantDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<RestaurantMetrics | null>(null);
  const [inventory, setInventory] = useState<InventoryPrediction[]>([]);
  const [staffing, setStaffing] = useState<StaffingForecast[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurantData();
  }, []);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant-specific data
      const response = await fetch('/api/restaurant/dashboard');
      const data = await response.json();
      
      setMetrics(data.metrics);
      setInventory(data.inventory);
      setStaffing(data.staffing);
      setMenuItems(data.menuItems);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load restaurant data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load restaurant data. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const totalCommission = metrics.platforms.reduce((sum, p) => sum + p.commission, 0);
  const commissionRate = (totalCommission / metrics.totalRevenue) * 100;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8" />
            Restaurant Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Industry-specific insights for food businesses
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Health Score</p>
            <p className={`text-2xl font-bold ${
              metrics.healthScore >= 70 ? 'text-green-600' :
              metrics.healthScore >= 40 ? 'text-amber-600' :
              'text-red-600'
            }}`}>
              {metrics.healthScore}/100
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Food Cost %"
          value={`${metrics.foodCostPercentage.toFixed(1)}%`}
          target="28-35%"
          status={metrics.foodCostPercentage <= 35 ? 'good' : metrics.foodCostPercentage <= 40 ? 'warning' : 'critical'}
          icon={<Utensils className="w-5 h-5" />}
        />
        <MetricCard
          title="Labor Cost %"
          value={`${metrics.laborCostPercentage.toFixed(1)}%`}
          target="25-35%"
          status={metrics.laborCostPercentage <= 35 ? 'good' : metrics.laborCostPercentage <= 40 ? 'warning' : 'critical'}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricCard
          title="Table Turn Time"
          value={`${Math.round(metrics.tableTurnTime)} min`}
          target="45-60 min"
          status={metrics.tableTurnTime <= 60 ? 'good' : 'warning'}
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          title="Wastage %"
          value={`${metrics.wastagePercentage.toFixed(1)}%`}
          target="<5%"
          status={metrics.wastagePercentage <= 5 ? 'good' : metrics.wastagePercentage <= 8 ? 'warning' : 'critical'}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Commission Alert */}
      {commissionRate > 25 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Platform commissions are consuming {commissionRate.toFixed(1)}% of your revenue! 
            This is above the industry standard of 18-22%. Consider optimizing your platform strategy.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CommissionCard 
              platforms={metrics.platforms}
              totalRevenue={metrics.totalRevenue}
            />
            <MenuEngineeringMatrix items={menuItems} />
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <CommissionCard 
            platforms={metrics.platforms}
            totalRevenue={metrics.totalRevenue}
          />
          
          {/* Platform Optimization Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Platform Optimization Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.platforms.map((platform) => {
                  const rate = (platform.commission / platform.revenue) * 100;
                  if (rate > 25) {
                    return (
                      <div key={platform.name} className="p-4 bg-amber-50 rounded-lg">
                        <p className="font-medium text-amber-900">
                          💡 {platform.name} Optimization
                        </p>
                        <p className="text-sm text-amber-800 mt-1">
                          Current rate: {rate.toFixed(1)}% • 
                          Potential savings: ₹{((rate - 20) / 100 * platform.revenue).toLocaleString('en-IN')}/month
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          Action: {platform.name === 'Zomato' 
                            ? 'Switch to Gold Lite plan' 
                            : platform.name === 'Swiggy'
                            ? 'Enable Assured program'
                            : 'Negotiate bulk rates'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <InventoryPredictor 
            predictions={inventory}
            weatherData={{ temperature: 32, condition: 'sunny' }}
            upcomingEvents={['IPL Match - Sunday', 'Weekend Rush']}
          />
        </TabsContent>

        <TabsContent value="staffing" className="space-y-6">
          <StaffingOptimizer forecasts={staffing} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  target: string;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, target, status, icon }) => {
  const colors = {
    good: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    critical: 'bg-red-50 border-red-200 text-red-900'
  };

  const icons = {
    good: <ArrowUpRight className="w-4 h-4 text-green-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    critical: <ArrowDownRight className="w-4 h-4 text-red-600" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`${colors[status]} border-2`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <p className="text-xs mt-1 opacity-70">Target: {target}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {icon}
              {icons[status]}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
