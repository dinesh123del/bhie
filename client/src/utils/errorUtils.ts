type AxiosError = any;

/**
 * Standard interface for parsed API errors
 */
export interface ParsedError {
  message: string;
  details?: any;
  statusCode?: number;
  type?: string;
}

/**
 * Utility to parse Axios/API errors into a standardized format for UI display
 */
export const parseApiError = (error: any): ParsedError => {
  // If it's already a parsed error from our interceptor
  if (error.displayMessage) {
    return {
      message: error.displayMessage,
      details: error.details,
      statusCode: error.response?.status,
      type: error.type
    };
  }

  // Fallback for non-Axios or unhandled errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return {
    message,
    statusCode: (error as AxiosError)?.response?.status
  };
};

/**
 * Helper to get a user-friendly message for common status codes
 */
export const getFriendlyErrorMessage = (error: any): string => {
  const parsed = parseApiError(error);

  switch (parsed.statusCode) {
    case 401:
      return 'Your session has expired. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please slow down.';
    case 500:
      return 'Our server is having some trouble. Please try again later.';
    default:
      return parsed.message;
  }
};
