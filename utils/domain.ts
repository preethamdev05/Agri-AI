/**
 * DOMAIN LOGIC & CONTRACT ENFORCEMENT
 * 
 * This file centralizes all logic derived from the strict backend contract analysis.
 * It serves as the single source of truth for formatting API responses.
 * 
 * NO STATE INFERENCE PERMITTED.
 * State must be derived explicitly from health.status.
 */

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
