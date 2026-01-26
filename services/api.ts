/**
 * API SERVICE LAYER
 * 
 * Manages HTTP communication with the Multitask Inference Backend.
 * Enforces timeouts and response parsing contracts.
 * 
 * Handles model loading state: Backend returns 503 while loading, 200 when ready.
 */

import axios from 'axios';
import { 
  MetadataResponseSchema, 
  PredictResponseSchema, 
  type MetadataResponse, 
  type PredictResponse 
} from '../types';

// Health check response type
export interface HealthResponse {
  status: 'ok' | 'loading' | 'offline';
  ready: boolean;
}

// Safe initialization - never throw at module level
const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (!envUrl) {
    console.warn('VITE_API_BASE_URL is missing. App will run in offline mode.');
    return '';
  }
  return envUrl.replace(/\/$/, '');
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // STRICT CONSTRAINT: Frontend timeout 45s
  timeout: 45000,
});

/**
 * Centralized error normalization.
 * Extracts `detail` field from FastAPI error responses.
 */
const normalizeError = (error: any) => {
  if (axios.isAxiosError(error)) {
    // Backend Contract: Error responses are { "detail": string }
    const message = error.response?.data?.detail || error.message || "Network error occurred";
    const enhancedError = new Error(message);
    // Attach status for downstream handling (e.g 413, 429)
    (enhancedError as any).status = error.response?.status;
    return enhancedError;
  }
  return error instanceof Error ? error : new Error("An unexpected error occurred");
};

/**
 * Health check: Distinguishes between offline and model loading.
 * 
 * Returns:
 * - { status: 'ok', ready: true } - Backend ready (200)
 * - { status: 'loading', ready: false } - Model loading (503)
 * - { status: 'offline', ready: false } - Backend offline
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  if (!API_BASE_URL) {
    return { status: 'offline', ready: false };
  }
  
  try {
    const response = await apiClient.get('/health', {
      headers: { 'Accept': 'application/json' },
      // Accept both 200 and 503 - don't reject on 503
      validateStatus: (status) => status < 500
    });
    
    if (response.status === 200) {
      // Backend ready
      return { status: 'ok', ready: true };
    } else if (response.status === 503) {
      // Model loading
      return { status: 'loading', ready: false };
    }
    
    // Unexpected status
    return { status: 'offline', ready: false };
  } catch (error) {
    // Network error or timeout
    return { status: 'offline', ready: false };
  }
};

export const fetchMetadata = async (): Promise<MetadataResponse> => {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  try {
    const response = await apiClient.get('/metadata/classes', {
      headers: { 'Accept': 'application/json' }
    });
    return MetadataResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
};

/**
 * Analyze image with automatic retry on 503 (model loading).
 * 
 * Retries up to 3 times with 2-second delays if model is loading.
 * Once model is ready, request succeeds immediately.
 */
export const analyzeImage = async (file: File): Promise<PredictResponse> => {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      // STRICT CONTRACT: Field name must be 'image'
      formData.append('image', file);

      const response = await apiClient.post('/predict', formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        validateStatus: (status) => status < 500 // Accept 200 and 503
      });

      // Check for 503 (model loading)
      if (response.status === 503) {
        if (attempt < maxRetries) {
          console.log(`[Attempt ${attempt}/${maxRetries}] Model loading, retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue; // Retry
        } else {
          throw new Error("Model is still loading. Please wait and try again.");
        }
      }

      // Success (200)
      return PredictResponseSchema.parse(response.data);
    } catch (error) {
      lastError = normalizeError(error);
      
      // Retry on network errors (not on validation errors)
      if (attempt < maxRetries && !(error instanceof Error && error.message.includes('Model is still loading'))) {
        console.log(`[Attempt ${attempt}/${maxRetries}] Request failed, retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
    }
  }
  
  throw lastError || new Error("Failed to analyze image after retries");
};
