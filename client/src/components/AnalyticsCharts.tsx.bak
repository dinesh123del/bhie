import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { useState, useEffect } from 'react';

interface ChartsProps {
  analytics: any;
  trends: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AnalyticsCharts = ({ analytics, trends }: ChartsProps) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (analytics?.kpis?.categories) {
      const categories = analytics.kpis.categories.map((cat: any, index: number) => ({
        name: cat._id || `Category ${index}`,
        value: cat.count || 0,
        fill: COLORS[index % COLORS.length]
      }));
      setChartData(categories);
    }
  }, [analytics]);

  const statusData = [
    { name: 'Completed', value: analytics?.kpis?.activeRecords || 0, fill: '#00C49F' },
    { name: 'Pending/In Progress', value: analytics?.kpis?.totalRecords - (analytics?.kpis?.activeRecords || 0), fill: '#FFBB28' }
  ];

  const trendData = trends?.map((month: any) => ({
    name: `${month._id.month}/${month._id.year}`,
    value: month.total,
    completed: month.completed
  })) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Line Chart - Monthly Growth */}
      <div className="bg-white dark:bg-[#0A0A0A]/60 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          Monthly Growth Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={false} />
            <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart - Category Distribution */}
      <div className="bg-white dark:bg-[#0A0A0A]/60 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 row-span-2">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          Category Distribution
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%" 
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }: any) => {
                if (!percent || percent === 0) return null;
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={chartData[index]?.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Status Comparison */}
      <div className="bg-white dark:bg-[#0A0A0A]/60 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 col-span-2">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          Status Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsCharts;

