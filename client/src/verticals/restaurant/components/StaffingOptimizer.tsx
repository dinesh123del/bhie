import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Sun, 
  CloudRain,
  CalendarDays,
  AlertCircle
} from 'lucide-react';

interface StaffingForecast {
  date: Date;
  dayName: string;
  predictedCovers: number;
  recommendedStaff: number;
  currentScheduled: number;
  confidence: number;
  factors: string[];
  weather?: string;
  localEvents?: string[];
}

interface StaffingOptimizerProps {
  forecasts: StaffingForecast[];
}

export const StaffingOptimizer: React.FC<StaffingOptimizerProps> = ({ forecasts }) => {
  const getWeatherIcon = (condition?: string) => {
    if (!condition) return null;
    if (condition.includes('rain') || condition.includes('Rain')) {
      return <CloudRain className="w-4 h-4 text-[#00D4FF]" />;
    }
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  const getStaffingStatus = (scheduled: number, recommended: number): {
    status: 'adequate' | 'understaffed' | 'overstaffed';
    color: string;
    message: string;
  } => {
    const ratio = scheduled / recommended;
    if (ratio >= 0.9 && ratio <= 1.1) {
      return {
        status: 'adequate',
        color: 'bg-green-100 text-green-800',
        message: 'Staffing level optimal'
      };
    } else if (ratio < 0.9) {
      return {
        status: 'understaffed',
        color: 'bg-red-100 text-red-800',
        message: `Need ${Math.ceil(recommended - scheduled)} more staff`
      };
    } else {
      return {
        status: 'overstaffed',
        color: 'bg-amber-100 text-amber-800',
        message: `${Math.floor(scheduled - recommended)} extra staff scheduled`
      };
    }
  };

  const today = forecasts[0];
  const needsAttention = forecasts.filter(f => {
    const status = getStaffingStatus(f.currentScheduled, f.recommendedStaff);
    return status.status !== 'adequate';
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          AI Staffing Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Today's Alert */}
        {today && (
          <Alert className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Today ({today.dayName}):</strong> Predict {today.predictedCovers} covers. 
              Recommend {today.recommendedStaff} staff members.
              {today.localEvents && today.localEvents.length > 0 && (
                <span className="block mt-1 text-blue-600">
                  📅 Special events: {today.localEvents.join(', ')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Needs Attention Summary */}
        {needsAttention.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-900">
                {needsAttention.length} days need staffing adjustments
              </span>
            </div>
          </div>
        )}

        {/* Weekly Forecast */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            7-Day Forecast
          </h4>
          
          {forecasts.map((forecast, index) => {
            const staffingStatus = getStaffingStatus(
              forecast.currentScheduled, 
              forecast.recommendedStaff
            );
            const utilizationRate = forecast.currentScheduled > 0
              ? (forecast.predictedCovers / (forecast.currentScheduled * 20)) * 100
              : 0;

            return (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{forecast.dayName}</span>
                      <span className="text-sm text-gray-500">
                        {forecast.date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </span>
                      {getWeatherIcon(forecast.weather)}
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-[#C0C0C0]" />
                        {forecast.predictedCovers} covers
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-[#C0C0C0]" />
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${staffingStatus.color}`}>
                      {staffingStatus.message}
                    </span>
                  </div>
                </div>

                {/* Staffing Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Staff: {forecast.currentScheduled} / {forecast.recommendedStaff} recommended</span>
                    <span>{Math.round(utilizationRate)}% utilization</span>
                  </div>
                  <Progress 
                    value={Math.min(utilizationRate, 100)}
                    className={staffingStatus.status === 'understaffed' ? 'bg-red-200' : ''}
                  />
                </div>

                {/* Factors */}
                {forecast.factors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {forecast.factors.map((factor, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                )}

                {/* Events */}
                {forecast.localEvents && forecast.localEvents.length > 0 && (
                  <div className="mt-2 text-sm text-blue-600">
                    📅 {forecast.localEvents.join(', ')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">💡 AI Recommendations</h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• Schedule extra staff on weekends (40% higher demand predicted)</li>
            <li>• Cross-train staff for rainy days when customer flow is unpredictable</li>
            <li>• Consider part-time staff for lunch rush hours</li>
            <li>• Monitor actual vs predicted covers to improve forecast accuracy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
