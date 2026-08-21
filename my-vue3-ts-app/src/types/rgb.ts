/**
 * RGB Type Definitions
 * Defines types related to RGB color values and extraction results
 */

/**
 * RGB channel value - must be between 0 and 255
 */
export type RGBChannel = number; // 0-255

/**
 * RGB color value with red, green, and blue components
 */
export interface RGB {
  r: RGBChannel;
  g: RGBChannel;
  b: RGBChannel;
}

/**
 * Result of RGB extraction from a face region
 */
export interface RGBResult {
  r: RGBChannel;
  g: RGBChannel;
  b: RGBChannel;
  skinPixelPercentage: number;
}

/**
 * Configuration for RGB extraction
 */
export interface RGBExtractionConfig {
  sampleRate: number;
  useSkinFilter: boolean;
  clusteringMethod: 'kmeans' | 'histogram';
}

/**
 * Validates if a value is a valid RGB channel (0-255)
 */
export function isValidRGBChannel(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

/**
 * Validates if an object is a valid RGB structure
 */
export function isValidRGB(rgb: unknown): rgb is RGB {
  if (typeof rgb !== 'object' || rgb === null) return false;
  const { r, g, b } = rgb as Partial<RGB>;
  return (
    typeof r === 'number' &&
    typeof g === 'number' &&
    typeof b === 'number' &&
    isValidRGBChannel(r) &&
    isValidRGBChannel(g) &&
    isValidRGBChannel(b)
  );
}
