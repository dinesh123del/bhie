import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface PlatformData {
  name: string;
  commission: number;
  orders: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface CommissionCardProps {
  platforms: PlatformData[];
  totalRevenue: number;
  alertThreshold?: number;
}

export const CommissionCard: React.FC<CommissionCardProps> = ({
  platforms,
  totalRevenue,
  alertThreshold = 0.25
}) => {
  const totalCommission = platforms.reduce((sum, p) => sum + p.commission, 0);
  const commissionRate = totalRevenue > 0 ? totalCommission / totalRevenue : 0;
  const isOverThreshold = commissionRate > alertThreshold;

  const getOptimizationTip = (platform: PlatformData): string => {
    const tips: Record<string, string> = {
      zomato: 'Switch to Zomato Gold Lite to reduce commission from 28% to 18%',
      swiggy: 'Consider Swiggy Assured for better visibility at lower commission',
      dunzo: 'Negotiate bulk delivery rates for orders > ₹500'
    };
    return tips[platform.name.toLowerCase()] || 'Review commission structure';
  };

  const calculateSavings = (platform: PlatformData): number => {
    const currentRate = platform.commission / platform.revenue;
    const optimizedRate = currentRate * 0.7; // Assume 30% reduction possible
    return (currentRate - optimizedRate) * platform.revenue;
  };

  return (
    <Card className={isOverThreshold ? 'border-red-500 border-2' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          Platform Commissions
        </CardTitle>
        {isOverThreshold && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Commissions consuming {(commissionRate * 100).toFixed(1)}% of revenue! 
              Industry standard is 18-22%.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div 
              key={platform.name}
              className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{platform.name}</span>
                  {platform.trend === 'up' && (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  )}
                  {platform.trend === 'down' && (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold">₹{platform.commission.toLocaleString('en-IN')}</div>
                  <div className="text-sm text-gray-500">
                    {((platform.commission / platform.revenue) * 100).toFixed(1)}% of revenue
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{platform.orders} orders</span>
                <span className="text-gray-600">
                  ₹{platform.revenue.toLocaleString('en-IN')} revenue
                </span>
              </div>
              
              {platform.commission / platform.revenue > 0.25 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">
                    💡 {getOptimizationTip(platform)}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Potential monthly savings: ₹{calculateSavings(platform).toLocaleString('en-IN')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Commission Burden</span>
            <span className={`font-bold text-lg ${isOverThreshold ? 'text-red-600' : 'text-gray-900'}`}>
              {(commissionRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            ₹{totalCommission.toLocaleString('en-IN')} out of ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
