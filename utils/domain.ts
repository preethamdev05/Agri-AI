/**
 * DOMAIN LOGIC & CONTRACT ENFORCEMENT
 * 
 * This file centralizes all logic derived from the strict backend contract analysis.
 * It serves as the single source of truth for interpreting API responses.
 * 
 * BACKEND CONTRACTS (DO NOT MODIFY WITHOUT BACKEND SYNC):
 * 1. Health Label: "Healthy" (case-insensitive for safety, but strict on semantics)
 * 2. Disease: Nullable. MUST be null if health is "Healthy".
 * 3. Confidence: Float [0, 1].
 */

import { PredictResponse } from '../types';

// Strict constants from backend config analysis
const NEGATIVE_CLASS_LABEL = 'healthy';

/**
 * SECONDARY UI GUARD: Minimum crop confidence for display.
 * This is a display-only sanity floor applied AFTER domain validation.
 * 
 * This does NOT alter inference - the backend decides predictions.
 * This prevents showing results when confidence is suspiciously low.
 * 
 * Order of checks in UI:
 * 1. FIRST: Is crop label in trained metadata? (domain validation)
 * 2. SECOND: Is confidence >= UI_MIN_CROP_CONFIDENCE? (sanity check)
 */
export const UI_MIN_CROP_CONFIDENCE = 0.55;

/**
 * Determines if a prediction result indicates a healthy plant.
 * Enforces Case-Insensitive comparison as a safety guard.
 */
export const isPlantHealthy = (healthLabel: string): boolean => {
  return healthLabel.toLowerCase() === NEGATIVE_CLASS_LABEL;
};

/**
 * Safely extracts disease information respecting the contract:
 * Disease info is only valid if the plant is NOT healthy.
 * 
 * @returns The disease object or null if healthy/undefined.
 */
export const getActiveDisease = (data: PredictResponse) => {
  if (isPlantHealthy(data.health.label)) {
    return null;
  }
  return data.disease || null;
};

/**
 * Formats confidence as a percentage string.
 * Enforces 0-1 range assumption.
 */
export const formatConfidence = (value: number): string => {
  // Clamp to 0-1 just in case, though Zod should catch it
  const clamped = Math.max(0, Math.min(1, value));
  return `${Math.round(clamped * 100)}%`;
};

/**
 * Normalizes label strings for display.
 * Replaces underscores with spaces and capitalizes.
 */
export const formatLabel = (label: string): string => {
  return label
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};
