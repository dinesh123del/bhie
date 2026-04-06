import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProfitBarChartProps {
  data: Array<{
    month: string;
    profit: number;
    revenue: number;
    expenses: number;
  }>;
  loading?: boolean;
}

const ProfitBarChart: React.FC<ProfitBarChartProps> = ({ data, loading = false }) => {
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
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="month" 
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
            itemStyle={{ fontWeight: '500' }}
            labelStyle={{ fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '12px', 
              fontSize: '11px', 
              fontFamily: 'SF Pro Text, -apple-system, system-ui, sans-serif' 
            }} 
            iconType="circle"
          />
          <Bar dataKey="profit" fill="#34C759" name="Net Profit" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" fill="#007AFF" name="Revenue" radius={[4, 4, 0, 0]} stackId="stack" />
          <Bar dataKey="expenses" fill="#FF3B30" name="Expenses" radius={[4, 4, 0, 0]} stackId="stack" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitBarChart;
