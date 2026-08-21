/**
 * Core Type Definitions
 * Main entry point for all type exports
 */

// Import types from sub-modules for local use
import type {
  RGB,
  RGBChannel,
  RGBResult,
  RGBExtractionConfig,
} from './rgb';

import {
  isValidRGBChannel,
  isValidRGB,
} from './rgb';

import type {
  Point,
  BoundingBox,
  FaceRegion,
  FaceDetectionResult,
  FaceDetectionConfig,
} from './face-detection';

import { DEFAULT_FACE_DETECTION_CONFIG } from './face-detection';

// Re-export all imports
export {
  RGB,
  RGBChannel,
  RGBResult,
  RGBExtractionConfig,
  isValidRGBChannel,
  isValidRGB,
  Point,
  BoundingBox,
  FaceRegion,
  FaceDetectionResult,
  FaceDetectionConfig,
  DEFAULT_FACE_DETECTION_CONFIG,
};

/**
 * Camera error types
 */
export type CameraErrorCode = 
  | 'permission_denied' 
  | 'not_supported' 
  | 'initialization_failed';

/**
 * Camera error structure
 */
export interface CameraError {
  code: CameraErrorCode;
  message: string;
}

/**
 * Viewfinder bounds for face positioning guide
 */
export interface ViewfinderBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Timer state for detection countdown
 */
export type TimerState = 'idle' | 'counting' | 'completed';

/**
 * Camera state within the application
 */
export interface CameraState {
  initialized: boolean;
  hasPermission: boolean | null;
  error: CameraError | null;
}

/**
 * Detection state within the application
 */
export interface DetectionState {
  isFaceInFrame: boolean;
  faceRegion: FaceRegion | null;
  isDetecting: boolean;
  detectionProgress: number;
}

/**
 * RGB result state within the application
 */
export interface ResultState {
  captured: boolean;
  rgb: RGBResult | null;
  timestamp: number | null;
}

/**
 * UI state within the application
 */
export interface UIState {
  isMobile: boolean;
  orientation: 'portrait' | 'landscape';
  viewfinderBounds: ViewfinderBounds;
}

/**
 * Complete application state
 */
export interface AppState {
  camera: CameraState;
  detection: DetectionState;
  result: ResultState;
  ui: UIState;
}

/**
 * Application error structure
 */
export interface AppError {
  type: string;
  message: string;
  timestamp: number;
  recoverable: boolean;
}
