/**
 * API CONTRACT TYPES
 * 
 * STRICT SYNC REQUIRED: These types mirror the backend Pydantic schemas.
 * Any changes here must be validated against the backend `schemas.py`.
 */

import { z } from 'zod';

// ============================================================================
// METADATA ENDPOINT CONTRACT (/metadata/classes)
// ============================================================================

export const SemanticClassSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().optional(),
});

export const MetadataResponseSchema = z.object({
  crops: z.array(SemanticClassSchema),
  diseases: z.array(SemanticClassSchema),
  health_statuses: z.array(SemanticClassSchema),
});

export type MetadataResponse = z.infer<typeof MetadataResponseSchema>;

// ============================================================================
// PREDICTION ENDPOINT CONTRACT (/predict)
// ============================================================================

export const PredictionConfidenceSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  class_id: z.string().optional(),
});

// Schema for Health specifically (Status/Probability)
export const HealthPredictionSchema = z.object({
  status: z.enum(["diseased", "healthy", "non_crop"]),
  probability: z.number().min(0).max(1),
});

export const PredictResponseSchema = z.object({
  health: HealthPredictionSchema,
  crop: PredictionConfidenceSchema,
  // STRICT CONSTRAINT: disease must be null unless health.status === "diseased"
  // It is nullable, but NOT optional. It must be present in the JSON.
  disease: PredictionConfidenceSchema.nullable(),
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
