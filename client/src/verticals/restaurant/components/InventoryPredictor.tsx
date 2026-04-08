import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Clock, Thermometer, Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventoryItem {
  name: string;
  currentStock: number;
  unit: string;
  shelfLifeDays: number;
  dailyConsumption: number;
  expiryDate: Date;
  reorderPoint: number;
  optimalStock: number;
}

interface InventoryPrediction {
  item: InventoryItem;
  daysUntilDepletion: number;
  depletionDate: Date;
  recommendedOrderQty: number;
  urgency: 'critical' | 'warning' | 'normal';
  confidence: number;
  factors: string[];
}

interface InventoryPredictorProps {
  predictions: InventoryPrediction[];
  weatherData?: {
    temperature: number;
    condition: string;
  };
  upcomingEvents?: string[];
}

export const InventoryPredictor: React.FC<InventoryPredictorProps> = ({
  predictions,
  weatherData,
  upcomingEvents
}) => {
  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-green-500';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const criticalItems = predictions.filter(p => p.urgency === 'critical');
  const warningItems = predictions.filter(p => p.urgency === 'warning');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Inventory Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Weather Impact */}
        {weatherData && (
          <Alert className="mb-4">
            <Thermometer className="h-4 w-4" />
            <AlertDescription>
              {weatherData.temperature > 35 
                ? `🔥 Hot weather (${weatherData.temperature}°C) predicted: Increase cold beverage stock by 40%`
                : weatherData.temperature < 20
                ? `❄️ Cool weather (${weatherData.temperature}°C): Hot beverage demand may increase`
                : `Weather forecast: ${weatherData.condition}. Normal consumption patterns expected.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Events Impact */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900">📅 Upcoming Events</p>
            {upcomingEvents.map((event, idx) => (
              <p key={idx} className="text-sm text-purple-800 mt-1">
                • {event} - Plan for 40% higher order volume
              </p>
            ))}
          </div>
        )}

        {/* Critical Alerts */}
        {criticalItems.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalItems.length} items need immediate attention - stock will deplete within 2 days!
            </AlertDescription>
          </Alert>
        )}

        {/* Inventory Items */}
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div 
              key={prediction.item.name}
              className="p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getUrgencyIcon(prediction.urgency)}
                  <div>
                    <h4 className="font-semibold">{prediction.item.name}</h4>
                    <p className="text-sm text-gray-500">
                      Current: {prediction.item.currentStock} {prediction.item.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prediction.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                    prediction.urgency === 'warning' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {prediction.daysUntilDepletion} days left
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Stock Level</span>
                  <span>{Math.round((prediction.item.currentStock / prediction.item.optimalStock) * 100)}%</span>
                </div>
                <Progress 
                  value={(prediction.item.currentStock / prediction.item.optimalStock) * 100}
                  className={getUrgencyColor(prediction.urgency)}
                />
              </div>

              {prediction.urgency !== 'normal' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    📦 Recommendation
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Order {prediction.recommendedOrderQty} {prediction.item.unit} by {prediction.depletionDate.toLocaleDateString('en-IN')}
                  </p>
                  {prediction.factors.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                      Based on: {prediction.factors.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
