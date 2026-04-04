import { TrendingUp, AlertCircle, Activity, Users } from 'lucide-react';

interface AnalyticsProps {
  data: any;
}

const AnalyticsCards = ({ data }: AnalyticsProps) => {
  const { kpis } = data;

  const formatGrowth = (growth: string) => {
    const num = parseFloat(growth);
    return num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (growth: string) => {
    const num = parseFloat(growth);
    return num > 0 ? (
      <TrendingUp className="w-8 h-8 text-green-500 animate-pulse" />
    ) : (
      <TrendingUp className="w-8 h-8 text-red-500 -rotate-12" />
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Records */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-3xl shadow-2xl group hover:scale-105 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Records</p>
            <p className="text-3xl font-bold mt-1">{kpis.totalRecords.toLocaleString()}</p>
          </div>
          <Users className="w-12 h-12 opacity-75" />
        </div>
      </div>

      {/* Growth Rate */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-3xl shadow-2xl group hover:scale-105 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Growth Rate</p>
            <p className={`text-3xl font-bold mt-1 ${parseFloat(kpis.growthRate) >= 0 ? 'text-white' : 'text-red-200'}`}>
              {formatGrowth(kpis.growthRate)}
            </p>
          </div>
          {getTrendIcon(kpis.growthRate)}
        </div>
      </div>

      {/* Active Records */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-3xl shadow-2xl group hover:scale-105 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Active Records</p>
            <p className="text-3xl font-bold mt-1">{kpis.activeRecords.toLocaleString()}</p>
          </div>
          <Activity className="w-12 h-12 opacity-75" />
        </div>
        <p className="text-purple-200 text-sm mt-2">{(100 - parseFloat(kpis.inactiveRatio)).toFixed(1)}% Active</p>
      </div>

      {/* Alerts */}
      <div className={`p-6 rounded-3xl shadow-2xl group hover:scale-105 transition-all ${
        kpis.categories[0]?.count > 50 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">Priority Alerts</p>
            <p className="text-3xl font-bold mt-1">{kpis.categories[0]?.count || 0}</p>
          </div>
          <AlertCircle className="w-12 h-12 opacity-75" />
        </div>
        <p className="text-indigo-200 text-sm mt-2">
          {kpis.categories[0]?._id || 'N/A'} dominates
        </p>
      </div>
    </div>
  );
};

export default AnalyticsCards;

