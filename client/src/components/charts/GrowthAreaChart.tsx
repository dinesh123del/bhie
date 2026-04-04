import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GrowthAreaChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  loading?: boolean;
}

const GrowthAreaChart: React.FC<GrowthAreaChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gradient-to-br from-purple-600/10 to-violet-600/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-4 animate-pulse shadow-xl shadow-purple-500/10">
        <div className="h-4 bg-purple-700/50 rounded w-32 mb-4"></div>
        <div className="h-48 bg-purple-700/30 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600/10 to-violet-600/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 h-80">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.25 4.25a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM7.25 9.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75zM3.25 14.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5a.75.75 0 01-.75.75zM10.75 9.75a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5z" />
        </svg>
        Growth Trends
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#9333ea" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#37415120" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgb(168 85 247 / 0.5)',
              borderRadius: '12px',
            }}
            labelStyle={{ fontWeight: '600' }}
          />
          <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#growthGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthAreaChart;

