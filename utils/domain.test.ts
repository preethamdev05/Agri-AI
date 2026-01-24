import { describe, it, expect } from 'vitest';
import { 
  isPlantHealthy, 
  getActiveDisease, 
  formatConfidence, 
  formatLabel 
} from './domain';
import type { PredictResponse } from '../types';

describe('Domain Logic', () => {
  describe('isPlantHealthy', () => {
    it('should return true for "Healthy" label', () => {
      expect(isPlantHealthy('Healthy')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isPlantHealthy('healthy')).toBe(true);
      expect(isPlantHealthy('HEALTHY')).toBe(true);
      expect(isPlantHealthy('HeAlThY')).toBe(true);
    });

    it('should return false for disease labels', () => {
      expect(isPlantHealthy('Disease detected')).toBe(false);
      expect(isPlantHealthy('Diseased')).toBe(false);
      expect(isPlantHealthy('Bacterial blight')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isPlantHealthy('')).toBe(false);
    });
  });

  describe('getActiveDisease', () => {
    it('should return null for healthy plants', () => {
      const mockData: PredictResponse = {
        health: { label: 'Healthy', confidence: 0.95 },
        crop: { label: 'Tomato', confidence: 0.98 },
        disease: { label: 'Early Blight', confidence: 0.87 },
      };

      expect(getActiveDisease(mockData)).toBeNull();
    });

    it('should return disease object for diseased plants', () => {
      const mockData: PredictResponse = {
        health: { label: 'Disease detected', confidence: 0.92 },
        crop: { label: 'Tomato', confidence: 0.98 },
        disease: { label: 'Early Blight', confidence: 0.87 },
      };

      const result = getActiveDisease(mockData);
      expect(result).not.toBeNull();
      expect(result?.label).toBe('Early Blight');
      expect(result?.confidence).toBe(0.87);
    });

    it('should handle missing disease field', () => {
      const mockData: PredictResponse = {
        health: { label: 'Disease detected', confidence: 0.92 },
        crop: { label: 'Tomato', confidence: 0.98 },
        disease: null,
      };

      expect(getActiveDisease(mockData)).toBeNull();
    });

    it('should handle undefined disease field', () => {
      const mockData: PredictResponse = {
        health: { label: 'Disease detected', confidence: 0.92 },
        crop: { label: 'Tomato', confidence: 0.98 },
      };

      expect(getActiveDisease(mockData)).toBeNull();
    });
  });

  describe('formatConfidence', () => {
    it('should format confidence as percentage', () => {
      expect(formatConfidence(0.95)).toBe('95%');
      expect(formatConfidence(0.5)).toBe('50%');
      expect(formatConfidence(1.0)).toBe('100%');
      expect(formatConfidence(0.0)).toBe('0%');
    });

    it('should round to nearest integer', () => {
      expect(formatConfidence(0.954)).toBe('95%');
      expect(formatConfidence(0.956)).toBe('96%');
      expect(formatConfidence(0.125)).toBe('13%');
    });

    it('should clamp values outside 0-1 range', () => {
      expect(formatConfidence(1.5)).toBe('100%');
      expect(formatConfidence(-0.3)).toBe('0%');
      expect(formatConfidence(2.0)).toBe('100%');
    });

    it('should handle edge cases', () => {
      expect(formatConfidence(0.001)).toBe('0%');
      expect(formatConfidence(0.999)).toBe('100%');
    });
  });

  describe('formatLabel', () => {
    it('should replace underscores with spaces', () => {
      expect(formatLabel('bacterial_blight')).toBe('Bacterial Blight');
      expect(formatLabel('early_blight')).toBe('Early Blight');
    });

    it('should capitalize words', () => {
      expect(formatLabel('tomato')).toBe('Tomato');
      expect(formatLabel('bell pepper')).toBe('Bell Pepper');
    });

    it('should handle already formatted labels', () => {
      expect(formatLabel('Tomato')).toBe('Tomato');
      expect(formatLabel('Bell Pepper')).toBe('Bell Pepper');
    });

    it('should handle mixed case and underscores', () => {
      expect(formatLabel('BACTERIAL_BLIGHT')).toBe('Bacterial Blight');
      expect(formatLabel('Early_Blight')).toBe('Early Blight');
    });

    it('should handle empty strings', () => {
      expect(formatLabel('')).toBe('');
    });

    it('should handle single words', () => {
      expect(formatLabel('healthy')).toBe('Healthy');
    });
  });
});
