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
      <div className="h-64 bg-gradient-to-br from-emerald-600/10 to-green-600/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-4 animate-pulse shadow-xl shadow-emerald-500/10">
        <div className="h-4 bg-emerald-700/50 rounded w-32 mb-4"></div>
        <div className="h-48 bg-emerald-700/30 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-600/10 to-green-600/10 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 h-80">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm7 7a1 1 0 11-2 0 1 1 0 012 0zM2 13a1 1 0 011-1h12a1 1 0 110 2H3a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
        Profit Breakdown
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#37415120" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgb(34 197 94 / 0.5)',
              borderRadius: '12px',
            }}
            labelStyle={{ fontWeight: '600' }}
          />
          <Legend wrapperStyle={{ paddingTop: '12px' }} />
          <Bar dataKey="profit" fill="url(#profitGradient)" name="Profit" radius={[4, 4, 0, 0]} />
          <Bar dataKey="revenue" fill="url(#revenueGradient)" name="Revenue" radius={[4, 4, 0, 0]} stackId="revenue" />
          <Bar dataKey="expenses" fill="url(#expensesGradient)" name="Expenses" radius={[4, 4, 0, 0]} stackId="revenue" />
        </BarChart>
      </ResponsiveContainer>
      <defs>
        <linearGradient id="profitGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
        </linearGradient>
        <linearGradient id="expensesGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#dc2626" stopOpacity={0.4} />
        </linearGradient>
      </defs>
    </div>
  );
};

export default ProfitBarChart;

