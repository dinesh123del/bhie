import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  HelpCircle, 
  Circle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';

interface MenuItem {
  name: string;
  category: 'star' | 'puzzle' | 'plow-horse' | 'dog';
  popularity: number; // 0-100
  profitability: number; // 0-100
  revenue: number;
  margin: number;
  cost: number;
  price: number;
  monthlyOrders: number;
}

interface MenuEngineeringMatrixProps {
  items: MenuItem[];
}

export const MenuEngineeringMatrix: React.FC<MenuEngineeringMatrixProps> = ({ items }) => {
  const categories = {
    star: {
      label: 'Stars',
      icon: Star,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'High popularity, high profit - promote these!',
      action: 'Feature prominently, train staff to upsell'
    },
    puzzle: {
      label: 'Puzzles',
      icon: HelpCircle,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Low popularity, high profit - make them popular',
      action: 'Reposition, rename, or promote through specials'
    },
    'plow-horse': {
      label: 'Plow Horses',
      icon: Circle,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'High popularity, low profit - reduce costs',
      action: 'Optimize portions or slightly increase price'
    },
    dog: {
      label: 'Dogs',
      icon: XCircle,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Low popularity, low profit - remove or fix',
      action: 'Remove from menu or completely redesign'
    }
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Menu Engineering Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Classify menu items by popularity and profitability to optimize your menu
        </p>

        {/* Matrix Visualization */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Top Row */}
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">Stars</span>
            </div>
            <p className="text-xs text-green-700">
              High Profit + High Popularity
            </p>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-900">Puzzles</span>
            </div>
            <p className="text-xs text-amber-700">
              High Profit + Low Popularity
            </p>
          </div>

          {/* Bottom Row */}
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Circle className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Plow Horses</span>
            </div>
            <p className="text-xs text-blue-700">
              Low Profit + High Popularity
            </p>
          </div>
          
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Dogs</span>
            </div>
            <p className="text-xs text-red-700">
              Low Profit + Low Popularity
            </p>
          </div>
        </div>

        {/* Category Details */}
        <div className="space-y-4">
          {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => {
            const category = categories[key];
            const categoryItems = groupedItems[key] || [];
            const Icon = category.icon;

            return (
              <div key={key} className={`p-4 rounded-lg border ${category.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{category.label}</span>
                    <span className="text-sm opacity-70">
                      ({categoryItems.length} items)
                    </span>
                  </div>
                </div>
                
                <p className="text-sm opacity-80 mb-3">{category.description}</p>
                <p className="text-sm font-medium mb-2">
                  💡 Action: {category.action}
                </p>

                {/* Items List */}
                {categoryItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {categoryItems.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white/50 rounded"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs opacity-70">
                            {item.monthlyOrders} orders/month • 
                            ₹{item.revenue.toLocaleString('en-IN')} revenue
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            item.margin > 0.6 ? 'text-green-600' : 
                            item.margin > 0.3 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {(item.margin * 100).toFixed(0)}% margin
                          </p>
                          <p className="text-xs opacity-70">
                            Pop: {item.popularity}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">
              {(groupedItems.star?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">Stars</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">
              {(groupedItems.puzzle?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">Puzzles</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">
              {(groupedItems['plow-horse']?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">Plow Horses</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">
              {(groupedItems.dog?.length || 0)}
            </p>
            <p className="text-xs text-gray-600">Dogs</p>
          </div>
        </div>

        {/* Recommendations */}
        <Alert className="mt-6">
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            <strong>Menu Optimization Potential:</strong> Converting just 2 Puzzles to Stars 
            could increase monthly revenue by ₹{(totalRevenue * 0.08).toLocaleString('en-IN')}.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
