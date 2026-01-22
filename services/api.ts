import axios from 'axios';
import { 
  MetadataResponseSchema, 
  PredictResponseSchema, 
  type MetadataResponse, 
  type PredictResponse 
} from '../types';

// Use environment variable for base URL
// The prompt requires reading VITE_API_BASE_URL and not hardcoding relative paths.
const getBaseUrl = () => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  // Fallback only if strictly necessary for local dev, but prompt implies env var is key.
  const url = envUrl || 'https://multitask-inference-backend-812118174928.asia-south1.run.app';
  return url.replace(/\/$/, '');
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // Increased timeout for heavy inference
});

// Centralized error normalization
const normalizeError = (error: any) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.message || "Network error occurred";
    return new Error(message);
  }
  return error instanceof Error ? error : new Error("An unexpected error occurred");
};

export const checkHealth = async (): Promise<boolean> => {
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
  try {
    const formData = new FormData();
    // Requirement: field named 'image'
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
