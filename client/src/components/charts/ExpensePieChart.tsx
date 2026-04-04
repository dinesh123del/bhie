import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ExpensePieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gradient-to-br from-orange-600/10 to-amber-600/10 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-4 animate-pulse shadow-xl shadow-orange-500/10">
        <div className="h-4 bg-orange-700/50 rounded w-32 mb-4"></div>
        <div className="h-48 bg-orange-700/30 rounded-lg flex items-center justify-center">
          <div className="w-32 h-32 bg-orange-700/50 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-600/10 to-amber-600/10 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 shadow-2xl shadow-orange-500/10 h-80">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a8 8 0 1114.32 4.906l-.594.804A9.999 9.999 0 0017 12a10 10 0 11-9-9.947z" clipRule="evenodd" />
        </svg>
        Expense Distribution
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgb(251 146 60 / 0.5)',
              borderRadius: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;

