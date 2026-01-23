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
  // Backend code does not currently populate description, but schema allows it.
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
  // STRICT CONSTRAINT: Backend must return float [0, 1].
  confidence: z.number().min(0).max(1),
  // Optional field backend may return but frontend ignores
  class_id: z.string().optional(),
});

export const PredictResponseSchema = z.object({
  health: PredictionConfidenceSchema,
  crop: PredictionConfidenceSchema,
  // STRICT CONSTRAINT: disease must be null if health is "Healthy"
  disease: PredictionConfidenceSchema.nullable().optional(),
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
