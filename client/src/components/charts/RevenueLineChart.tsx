import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueLineChartProps {
  data: Array<{
    month: string;
    revenue: number;
    expenses: number;
  }>;
  loading?: boolean;
}

const RevenueLineChart: React.FC<RevenueLineChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gradient-to-br from-slate-900/20 to-slate-800/20 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-32 mb-4"></div>
        <div className="h-48 bg-slate-700/50 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-600/10 to-blue-600/10 backdrop-blur-sm border border-indigo-500/30 rounded-2xl p-6 shadow-2xl shadow-indigo-500/10 h-80">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        Revenue Trends
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#37415120" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={12} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgb(79 70 229 / 0.5)',
              borderRadius: '12px',
            }}
            labelStyle={{ fontWeight: '600' }}
          />
          <Legend wrapperStyle={{ paddingTop: '12px' }} />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="url(#revenueGradient)" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
            name="Revenue"
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="url(#expensesGradient)" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2 }}
            name="Expenses"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueLineChart;

