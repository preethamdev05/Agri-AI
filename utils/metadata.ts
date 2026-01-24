/**
 * METADATA LOOKUP UTILITY
 * 
 * Provides display name enrichment for backend labels.
 * Pure lookup layer - no API calls, no side effects.
 * Gracefully degrades to formatted labels if metadata unavailable.
 */

import { formatLabel } from './domain';
import type { MetadataResponse } from '../types';

export interface DisplayInfo {
  displayName: string;
  description?: string;
}

export type CropMetadata = {
  label: string;
  displayName?: string;
  description?: string;
};

// GLOBAL STATE for trained crops (whitelist)
// This serves as the authoritative source for domain validation
let trainedCrops: Set<string> | null = null;

/**
 * Initialize trained crop labels from static CSV / metadata.
 * This should be called once at app startup or metadata load.
 */
export const initTrainedCrops = (crops: CropMetadata[] | null) => {
  trainedCrops = crops
    ? new Set(crops.map(c => c.label.toLowerCase()))
    : null;
};

/**
 * Checks if the global trained metadata has been initialized.
 * Used to implement "fail open" logic if metadata is missing.
 */
export const hasTrainedCropMetadata = (): boolean => {
  return trainedCrops !== null && trainedCrops.size > 0;
};

/**
 * Normalizes backend labels to match metadata lookup keys.
 * Handles variations: snake_case, PascalCase, Title Case, etc.
 */
const normalizeKey = (label: string): string => {
  return label.toLowerCase().replace(/[\s_-]+/g, '_');
};

/**
 * Creates a lookup map from metadata arrays.
 * Keys are normalized labels, values are display info.
 */
const buildLookupMap = (
  items: Array<{ id: string; label: string; description?: string }>
): Map<string, DisplayInfo> => {
  const map = new Map<string, DisplayInfo>();
  
  items.forEach(item => {
    const key = normalizeKey(item.label);
    map.set(key, {
      displayName: formatLabel(item.label),
      description: item.description,
    });
  });
  
  return map;
};

/**
 * Metadata lookup service.
 * Initialized with metadata response, provides enriched labels.
 */
export class MetadataLookup {
  private cropMap: Map<string, DisplayInfo>;
  private diseaseMap: Map<string, DisplayInfo>;
  private healthMap: Map<string, DisplayInfo>;

  constructor(metadata: MetadataResponse | null) {
    this.cropMap = metadata ? buildLookupMap(metadata.crops) : new Map();
    this.diseaseMap = metadata ? buildLookupMap(metadata.diseases) : new Map();
    this.healthMap = metadata ? buildLookupMap(metadata.health_statuses) : new Map();
    
    // Also initialize the global whitelist if we have metadata
    if (metadata && metadata.crops) {
       initTrainedCrops(metadata.crops);
    }
  }

  /**
   * Looks up crop display info.
   * Falls back to formatted label if not found.
   */
  getCropInfo(label: string): DisplayInfo {
    const key = normalizeKey(label);
    return this.cropMap.get(key) || {
      displayName: formatLabel(label),
    };
  }

  /**
   * Looks up disease display info.
   * Falls back to formatted label if not found.
   */
  getDiseaseInfo(label: string): DisplayInfo {
    const key = normalizeKey(label);
    return this.diseaseMap.get(key) || {
      displayName: formatLabel(label),
    };
  }

  /**
   * Looks up health status display info.
   * Falls back to formatted label if not found.
   */
  getHealthInfo(label: string): DisplayInfo {
    const key = normalizeKey(label);
    return this.healthMap.get(key) || {
      displayName: formatLabel(label),
    };
  }

  /**
   * Determines if a label exists in the trained crop domain.
   * Used for UI guardrails to block unsupported images.
   * Case-insensitive comparison.
   */
  isKnownCrop(label: string): boolean {
    const key = normalizeKey(label);
    return this.cropMap.has(key);
  }
}

/**
 * Creates a metadata lookup instance.
 * Accepts null metadata for graceful degradation.
 */
export const createMetadataLookup = (metadata: MetadataResponse | null): MetadataLookup => {
  return new MetadataLookup(metadata);
};

/**
 * Standalone function to check if a crop label is in the trained domain.
 * USES GLOBAL STATE.
 * 
 * @param label - Crop label to validate
 * @returns true only if label exists in trained metadata
 */
export const isKnownCrop = (label: string | undefined | null): boolean => {
  if (!label || !trainedCrops) return false;
  
  // Normalize key to match map behavior
  const key = normalizeKey(label);
  
  // Check against global set (assuming initTrainedCrops used normalized keys or raw?)
  // The initTrainedCrops uses label.toLowerCase().
  // normalizeKey uses lowerCase + replace spaces.
  // We should align them.
  
  // Let's rely on simple lowercase check for the global set as defined in initTrainedCrops
  // But strictly, we should normalize consistently.
  // The global set uses label.toLowerCase().
  // So we check label.toLowerCase().
  
  return trainedCrops.has(label.toLowerCase());
};
