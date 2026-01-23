/**
 * API SERVICE LAYER
 * 
 * Manages HTTP communication with the Multitask Inference Backend.
 * Enforces timeouts and response parsing contracts.
 */

import axios from 'axios';
import { 
  MetadataResponseSchema, 
  PredictResponseSchema, 
  type MetadataResponse, 
  type PredictResponse 
} from '../types';

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
    // Attach status for downstream handling (e.g. 413, 429)
    (enhancedError as any).status = error.response?.status;
    return enhancedError;
  }
  return error instanceof Error ? error : new Error("An unexpected error occurred");
};

export const checkHealth = async (): Promise<boolean> => {
  if (!API_BASE_URL) return false;
  try {
    const response = await apiClient.get('/health', {
       headers: { 'Accept': 'application/json' }
    });
    return response.status === 200;
  } catch (error) {
    return false;
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

export const analyzeImage = async (file: File): Promise<PredictResponse> => {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  try {
    const formData = new FormData();
    // STRICT CONTRACT: Field name must be 'image'
    formData.append('image', file);

    const response = await apiClient.post('/predict', formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      }
    });

    return PredictResponseSchema.parse(response.data);
  } catch (error) {
    throw normalizeError(error);
  }
};
