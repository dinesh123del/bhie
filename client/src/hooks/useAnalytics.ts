import { useEffect, useState } from 'react';
import { analyticsService, AnalyticsSummary, AdminStats, adminService } from '../services/analyticsService';
import { AxiosError } from 'axios';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getAnalytics();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        setError(err as AxiosError);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, refetch };
};

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err as AxiosError);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch };
};
