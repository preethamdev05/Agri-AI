import axios, { AxiosError } from 'axios';

type ErrorSeverity = 'error' | 'warning' | 'info';

interface UserFriendlyError {
  message: string;
  severity: ErrorSeverity;
  action?: string;
}

export const mapApiErrorToMessage = (error: unknown): UserFriendlyError => {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError;
    
    // 1. Network / Offline
    if (!err.response) {
      return {
        message: "Unable to connect to the server. Please check your internet connection.",
        severity: 'warning',
        action: 'Retry'
      };
    }

    // 2. Server Errors (5xx)
    if (err.response.status >= 500) {
      return {
        message: "The AgriScan service is currently experiencing high load. Please try again in a moment.",
        severity: 'error',
        action: 'Retry'
      };
    }

    // 3. Client Errors (4xx)
    if (err.response.status === 413) {
      return {
        message: "The image file is too large. Please use an image smaller than 10MB.",
        severity: 'warning'
      };
    }

    if (err.response.status === 429) {
      return {
        message: "You're sending requests too quickly. Please wait a moment.",
        severity: 'warning'
      };
    }
  }

  // Fallback
  return {
    message: error instanceof Error ? error.message : "An unexpected error occurred.",
    severity: 'error'
  };
};
