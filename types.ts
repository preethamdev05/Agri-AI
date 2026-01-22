import { z } from 'zod';

// Schema for Metadata Endpoint
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

// Schema for Prediction Endpoint
export const PredictionConfidenceSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  class_id: z.string().optional(),
});

export const PredictResponseSchema = z.object({
  health: PredictionConfidenceSchema,
  crop: PredictionConfidenceSchema,
  disease: PredictionConfidenceSchema.nullable().optional(),
  processing_time_ms: z.number().optional(),
});

export type PredictResponse = z.infer<typeof PredictResponseSchema>;

// App specific types
export interface FileWithPreview extends File {
  preview?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
