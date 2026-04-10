import { useEffect, useState } from 'react';
import { Record, RecordsFilter, recordsService } from '../services/recordsService';
type AxiosError = any;

export const useRecords = (filters?: RecordsFilter) => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AxiosError | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const data = await recordsService.getRecords(filters);
        setRecords(data);
        setError(null);
      } catch (err) {
        setError(err as AxiosError);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filters?.category, filters?.status, filters?.skip]);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await recordsService.getRecords(filters);
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  };

  return { records, loading, error, refetch };
};
