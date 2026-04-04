/**
 * API USAGE EXAMPLES
 * 
 * This file demonstrates how to use the API services throughout the app
 */

// ============================================
// 1. AUTHENTICATION
// ============================================

import { authService } from '@/services/authService';

// Login
const loginExample = async () => {
  try {
    const response = await authService.login({
      email: 'admin@bhie.com',
      password: 'admin123'
    });
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register
const registerExample = async () => {
  try {
    const response = await authService.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    });
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Logout
const logoutExample = () => {
  authService.logout();
};

// ============================================
// 2. RECORDS
// ============================================

import { recordsService } from '@/services/recordsService';

// Get all records
const getRecordsExample = async () => {
  try {
    const records = await recordsService.getRecords();
    console.log('Records:', records);
  } catch (error) {
    console.error('Failed to fetch records:', error);
  }
};

// Get records with filters
const getRecordsWithFiltersExample = async () => {
  try {
    const records = await recordsService.getRecords({
      category: 'medical',
      status: 'APPROVED',
      skip: 0,
      take: 10
    });
    console.log('Filtered records:', records);
  } catch (error) {
    console.error('Failed to fetch filtered records:', error);
  }
};

// Create record
const createRecordExample = async () => {
  try {
    const newRecord = await recordsService.createRecord({
      title: 'Patient Report',
      category: 'medical',
      description: 'Monthly patient report',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('Created record:', newRecord);
  } catch (error) {
    console.error('Failed to create record:', error);
  }
};

// Update record
const updateRecordExample = async () => {
  try {
    const updated = await recordsService.updateRecord('record-id', {
      status: 'APPROVED'
    });
    console.log('Updated record:', updated);
  } catch (error) {
    console.error('Failed to update record:', error);
  }
};

// Delete record
const deleteRecordExample = async () => {
  try {
    await recordsService.deleteRecord('record-id');
    console.log('Record deleted');
  } catch (error) {
    console.error('Failed to delete record:', error);
  }
};

// ============================================
// 3. ANALYTICS
// ============================================

import { analyticsService, adminService } from '@/services/analyticsService';

// Get analytics
const getAnalyticsExample = async () => {
  try {
    const analytics = await analyticsService.getAnalytics();
    console.log('Analytics:', analytics);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
};

// Get admin stats
const getAdminStatsExample = async () => {
  try {
    const stats = await adminService.getStats();
    console.log('Admin stats:', stats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
  }
};

// ============================================
// 4. REPORTS
// ============================================

import { reportsService } from '@/services/reportsService';

// Get all reports
const getReportsExample = async () => {
  try {
    const reports = await reportsService.getReports();
    console.log('Reports:', reports);
  } catch (error) {
    console.error('Failed to fetch reports:', error);
  }
};

// Generate report
const generateReportExample = async () => {
  try {
    const report = await reportsService.generateReport({
      title: 'Monthly Summary',
      format: 'PDF',
      dateRange: {
        from: '2024-01-01',
        to: '2024-01-31'
      }
    });
    console.log('Generated report:', report);
  } catch (error) {
    console.error('Failed to generate report:', error);
  }
};

// Download report
const downloadReportExample = async () => {
  try {
    await reportsService.downloadReport('report-id');
  } catch (error) {
    console.error('Failed to download report:', error);
  }
};

// ============================================
// 5. AI PREDICTIONS
// ============================================

import { aiService } from '@/services/aiService';

// Make prediction
const predictExample = async () => {
  try {
    const prediction = await aiService.predict({
      text: 'Sample document text for classification',
      features: {
        documentType: 'medical'
      }
    });
    console.log('Prediction:', prediction);
  } catch (error) {
    console.error('Failed to make prediction:', error);
  }
};

// ============================================
// 6. USING HOOKS IN COMPONENTS
// ============================================

import { useRecords } from '@/hooks/useRecords';
import { useAnalytics, useAdminStats } from '@/hooks/useAnalytics';
import { useAuth } from '@/hooks/useAuth';

// Example component using hooks
export const ExampleComponent = () => {
  const { user, loading: authLoading } = useAuth();
  const { records, loading: recordsLoading, error: recordsError } = useRecords();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { stats, loading: statsLoading } = useAdminStats();

  if (authLoading || recordsLoading || analyticsLoading || statsLoading) {
    return <div>Loading...</div>;
  }

  if (recordsError) {
    return <div>Error: {recordsError.message}</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Total Records: {records?.length}</p>
      <p>Approval Rate: {analytics?.approvalRate}%</p>
      <p>Active Users: {stats?.activeUsers}</p>
    </div>
  );
};

// ============================================
// 7. ERROR HANDLING PATTERNS
// ============================================

import axios, { AxiosError } from 'axios';

// Pattern for handling API errors
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (axiosError.response?.status === 403) {
      // Forbidden - show permission error
      console.error('Permission denied');
    } else if (axiosError.response?.status === 500) {
      // Server error
      console.error('Server error');
    }
  }
};

// ============================================
// 8. NETWORK REQUEST STATES
// ============================================

// Pattern for handling loading, error, success states
const useApiCall = async (apiFunction: () => Promise<any>) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
