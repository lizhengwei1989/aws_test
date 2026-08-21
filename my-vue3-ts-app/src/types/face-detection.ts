/**
 * Face Detection Type Definitions
 * Defines types related to face detection, bounding boxes, and regions
 */

/**
 * 2D Point coordinates
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Bounding box for face detection
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Detected face region with metadata
 */
export interface FaceRegion {
  boundingBox: BoundingBox;
  landmarks: Point[];
  confidence: number;
}

/**
 * Face detection result from MediaPipe
 */
export interface FaceDetectionResult {
  faces: FaceRegion[];
  timestamp: number;
}

/**
 * Configuration for face detection
 */
export interface FaceDetectionConfig {
  model: 'short' | 'full';
  minDetectionConfidence: number;
  runningMode: 'VIDEO' | 'IMAGE';
}

/**
 * Default face detection configuration
 */
export const DEFAULT_FACE_DETECTION_CONFIG: FaceDetectionConfig = {
  model: 'short',
  minDetectionConfidence: 0.5,
  runningMode: 'VIDEO',
};
