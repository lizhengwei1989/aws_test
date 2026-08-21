import { config } from '@vue/test-utils';
import { vi } from 'vitest';

// Mock MediaPipe modules
vi.mock('@mediapipe/face_detection', () => ({
  FaceDetector: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    detect: vi.fn().mockResolvedValue({ faces: [] }),
  })),
}));

vi.mock('@mediapipe/tasks-vision', () => ({
  FaceDetector: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    detect: vi.fn().mockResolvedValue({ faces: [] }),
  })),
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
}));

// Mock navigator.mediaDevices
Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    }),
    getDisplayMedia: vi.fn(),
    enumerateDevices: vi.fn().mockResolvedValue([]),
  },
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  drawImage: vi.fn(),
  getImageData: vi.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  }),
  putImageData: vi.fn(),
  createImageData: vi.fn().mockReturnValue({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1,
  }),
}) as any;

// Global Vue Test Utils config
config.global.stubs = {};
