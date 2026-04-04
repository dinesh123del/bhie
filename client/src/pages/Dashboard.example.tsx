// Dashboard.tsx - Example implementation with working APIs

import React, { useEffect, useState } from 'react';
import { analyticsAPI, recordsAPI } from '@/services/api';

interface KPIs {
  totalRecords: number;
  activeRecords: number;
  inactiveRatio: number;
  growthRate: number;
}

interface Trends {
  name: string;
  value: number;
  date: string;
}

export const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [trends, setTrends] = useState<Trends[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch KPIs
      const summaryRes = await analyticsAPI.getSummary();
      setKpis(summaryRes.data.kpis);

      // Fetch Trends
      const trendsRes = await analyticsAPI.getTrends();
      setTrends(trendsRes.data.trends);

      // Fetch Records
      const recordsRes = await recordsAPI.getAll();
      setRecords(recordsRes.data.slice(0, 5)); // Show last 5
    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-600">Total Records</p>
            <p className="text-3xl font-bold">{kpis.totalRecords}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <p className="text-gray-600">Active Records</p>
            <p className="text-3xl font-bold">{kpis.activeRecords}</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <p className="text-gray-600">Inactive Ratio</p>
            <p className="text-3xl font-bold">{kpis.inactiveRatio}%</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <p className="text-gray-600">Growth Rate</p>
            <p className="text-3xl font-bold">+{kpis.growthRate}%</p>
          </div>
        </div>
      )}

      {/* Trends */}
      <div className="bg-white rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Trends</h2>
        {trends.length > 0 ? (
          <div className="space-y-2">
            {trends.map((trend, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span>{trend.name}</span>
                <span className="font-bold">{trend.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No trend data available</p>
        )}
      </div>

      {/* Recent Records */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Recent Records</h2>
        {records.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{record.title}</td>
                  <td className="py-2">{record.description || '-'}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No records available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
