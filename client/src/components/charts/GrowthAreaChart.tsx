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
      <div className="h-64 bg-[#1C1C1E] rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-[#2C2C2E] rounded w-32 mb-4"></div>
        <div className="h-48 bg-[#2C2C2E] rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full font-sans">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AF52DE" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#AF52DE" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tickMargin={12} 
            tick={{ fontSize: 11, fill: '#A1A1A6', fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tickMargin={12} 
            tick={{ fontSize: 11, fill: '#A1A1A6', fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' }} 
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(28, 28, 30, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif',
              fontSize: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
            labelStyle={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}
            itemStyle={{ fontWeight: '500' }}
          />
          <Area type="monotone" dataKey="value" stroke="#AF52DE" strokeWidth={3} fillOpacity={1} fill="url(#growthGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthAreaChart;
