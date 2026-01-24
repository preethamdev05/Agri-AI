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
}

/**
 * Creates a metadata lookup instance.
 * Accepts null metadata for graceful degradation.
 */
export const createMetadataLookup = (metadata: MetadataResponse | null): MetadataLookup => {
  return new MetadataLookup(metadata);
};
