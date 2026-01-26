/**
 * API CONTRACT TYPES
 * 
 * STRICT SYNC REQUIRED: These types mirror the backend schemas.
 */

import { z } from 'zod';

// ============================================================================
// PREDICTION ENDPOINT CONTRACT (/predict)
// ============================================================================

export const PredictionConfidenceSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
});

// Schema for Health specifically (Status/Probability)
export const HealthPredictionSchema = z.object({
  status: z.enum(["diseased", "healthy", "non_crop"]),
  probability: z.number().min(0).max(1),
});

export const PredictResponseSchema = z.object({
  crop: PredictionConfidenceSchema,
  health: HealthPredictionSchema,
  // STRICT CONSTRAINT: disease must be null unless health.status === "diseased"
  // It is nullable, but NOT optional. It must be present in the JSON.
  disease: PredictionConfidenceSchema.nullable(),
  // Optional: some deployments may add performance telemetry.
  processing_time_ms: z.number().optional(),
});

export type PredictResponse = z.infer<typeof PredictResponseSchema>;

// ============================================================================
// APP-SPECIFIC TYPES
// ============================================================================

export interface FileWithPreview extends File {
  preview?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
