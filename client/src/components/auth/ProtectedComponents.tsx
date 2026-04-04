import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Admin Route Component
 * Redirects to dashboard if user is not admin
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
            <p className="text-gray-700">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading Skeleton Component
 */
export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
    </div>
  );
};

/**
 * Error Message Component
 */
export const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * API Error Handler
 */
export const handleApiError = (error: any): string => {
  if (error.response?.status === 401) {
    return 'Your session expired. Please login again.';
  }
  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  if (error.response?.status === 500) {
    return 'Server error. Please try again later.';
  }
  return error.response?.data?.message || error.message || 'An error occurred';
};

/**
 * Example Usage in a Component
 */
export const ExampleComponent = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, _setData] = React.useState<any>(null);

  const handleFetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // const result = await recordsService.getRecords();
      // _setData(result);
    } catch (err: any) {
      const message = handleApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton count={5} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={handleFetchData} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="No Data"
        description="Start by creating a new record"
        action={{ label: 'Create', onClick: () => {} }}
      />
    );
  }

  return <div>{/* Render data */}</div>;
};
