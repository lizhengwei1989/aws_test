# Design Document

## Introduction

The Face RGB Detector is a Vue3 + TypeScript mobile web application that uses MediaPipe Face Detection to detect faces in real-time camera feeds and extract RGB color values from detected face regions. The application provides an intuitive mobile-first interface where users position their face within a viewfinder, and after 3 seconds of stable detection, the RGB values are captured and displayed.

## Architecture Overview

### Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Face Detection**: MediaPipe Face Detection (@mediapipe/face_detection)
- **Styling**: CSS with mobile-first responsive design
- **State Management**: Vue reactive state with Composition API

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vue 3 Application                     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CameraView  │  │ FaceDetector │  │  RGBDisplay  │  │
│  │  Component   │  │   Service    │  │  Component   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│          │                  │                  │        │
│          v                  v                  v        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Composition State Store               │  │
│  │  (reactive, computed, watch)                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           v
              ┌────────────────────────┐
              │   MediaPipe Face       │
              │   Detection API        │
              └────────────────────────┘
```

## Component Architecture

### Core Components

#### 1. App.vue
The root component that orchestrates the entire application layout.

**Responsibilities:**
- Manage global application state
- Coordinate between child components
- Handle application lifecycle

#### 2. CameraView.vue
Manages camera access and video stream display.

**Template Structure:**
```vue
<template>
  <div class="camera-container">
    <video ref="videoElement" autoplay playsinline />
    <canvas ref="overlayCanvas" />
    <ViewfinderOverlay :face-detected="isFaceInFrame" />
    <DetectionTimer 
      :active="isDetecting" 
      :progress="timerProgress" 
    />
  </div>
</template>
```

**Props:**
- None (self-contained camera management)

**Emits:**
- `face-detected: (faceRegion: FaceRegion | null) => void`
- `frame-processed: (frameData: ImageData) => void`

**State:**
```typescript
interface CameraState {
  videoElement: HTMLVideoElement | null;
  overlayCanvas: HTMLCanvasElement | null;
  stream: MediaStream | null;
  isInitialized: boolean;
  error: CameraError | null;
}
```

#### 3. ViewfinderOverlay.vue
Displays the guide frame and face detection indicators.

**Props:**
```typescript
interface ViewfinderProps {
  faceDetected: boolean;
  viewfinderBounds: ViewfinderBounds;
}
```

**Template Structure:**
```vue
<template>
  <div class="viewfinder-overlay">
    <div 
      class="viewfinder-frame" 
      :class="{ 'face-detected': faceDetected }"
    >
      <!-- Corner guides -->
      <div class="corner corner-top-left" />
      <div class="corner corner-top-right" />
      <div class="corner corner-bottom-left" />
      <div class="corner corner-bottom-right" />
    </div>
    <p v-if="!faceDetected" class="guide-text">
      请将脸部置于取景框内
    </p>
  </div>
</template>
```

#### 4. DetectionTimer.vue
Visual countdown indicator for the 3-second detection period.

**Props:**
```typescript
interface TimerProps {
  active: boolean;
  progress: number; // 0.0 to 1.0
  duration: number; // milliseconds
}
```

**Template Structure:**
```vue
<template>
  <div v-if="active" class="detection-timer">
    <svg class="timer-ring" viewBox="0 0 100 100">
      <circle 
        class="timer-bg" 
        cx="50" cy="50" r="45"
      />
      <circle 
        class="timer-progress" 
        cx="50" cy="50" r="45"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <span class="timer-text">{{ secondsRemaining }}</span>
  </div>
</template>
```

#### 5. RGBDisplay.vue
Displays captured RGB values in input components.

**Props:**
```typescript
interface RGBDisplayProps {
  r: number;
  g: number;
  b: number;
  captured: boolean;
}
```

**Emits:**
- `copy-value: (channel: 'r' | 'g' | 'b') => void`

**Template Structure:**
```vue
<template>
  <div class="rgb-display">
    <div class="color-preview" :style="{ backgroundColor: previewColor }" />
    <div class="rgb-inputs">
      <RGBInputField 
        v-for="channel in channels"
        :key="channel.label"
        :label="channel.label"
        :value="channel.value"
        @copy="handleCopy(channel.label)"
      />
    </div>
  </div>
</template>
```

#### 6. RGBInputField.vue
Individual input field for a single RGB channel.

**Props:**
```typescript
interface RGBInputProps {
  label: 'R' | 'G' | 'B';
  value: number;
}
```

**Emits:**
- `copy: () => void`

### Service Layer

#### FaceDetectionService.ts

**Purpose:** Encapsulates MediaPipe Face Detection integration.

```typescript
interface FaceDetectionService {
  initialize(): Promise<void>;
  detectFaces(imageData: ImageData): Promise<FaceDetectionResult>;
  extractFaceRegion(
    imageData: ImageData, 
    boundingBox: BoundingBox
  ): ImageData;
  dispose(): void;
}

interface FaceDetectionResult {
  faces: FaceRegion[];
  timestamp: number;
}

interface FaceRegion {
  boundingBox: BoundingBox;
  landmarks: Point[];
  confidence: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

#### RGBExtractorService.ts

**Purpose:** Extracts dominant RGB values from face regions.

```typescript
interface RGBExtractorService {
  extractDominantRGB(
    faceImageData: ImageData
  ): Promise<RGBResult>;
}

interface RGBResult {
  r: number;
  g: number;
  b: number;
  skinPixelPercentage: number;
}

interface RGBExtractionConfig {
  sampleRate: number;
  useSkinFilter: boolean;
  clusteringMethod: 'kmeans' | 'histogram';
}
```

## Data Models

### Application State

```typescript
interface AppState {
  // Camera state
  camera: {
    initialized: boolean;
    hasPermission: boolean | null;
    error: CameraError | null;
  };
  
  // Detection state
  detection: {
    isFaceInFrame: boolean;
    faceRegion: FaceRegion | null;
    isDetecting: boolean;
    detectionProgress: number;
  };
  
  // RGB result state
  result: {
    captured: boolean;
    rgb: RGBResult | null;
    timestamp: number | null;
  };
  
  // UI state
  ui: {
    isMobile: boolean;
    orientation: 'portrait' | 'landscape';
    viewfinderBounds: ViewfinderBounds;
  };
}

interface CameraError {
  code: 'permission_denied' | 'not_supported' | 'initialization_failed';
  message: string;
}

interface ViewfinderBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### TypeScript Interfaces

```typescript
// RGB value constraints
type RGBChannel = 0 | 1 | ... | 255;

interface RGB {
  r: RGBChannel;
  g: RGBChannel;
  b: RGBChannel;
}

// Face detection types
interface Point {
  x: number;
  y: number;
}

interface FaceDetectionConfig {
  model: 'short' | 'full';
  minDetectionConfidence: number;
  runningMode: 'VIDEO' | 'IMAGE';
}
```

## Core Workflows

### Face Detection and RGB Capture Workflow

```
1. Application Mount
   └─> Initialize Camera
       └─> Request Permissions
           ├─> Granted: Start Video Stream
           └─> Denied: Show Error Message

2. Video Stream Active
   └─> Start Frame Processing Loop
       └─> For Each Frame:
           ├─> Run Face Detection
           ├─> Check if face in viewfinder
           │   ├─> In frame: Start/Continue Timer
           │   └─> Out of frame: Reset Timer
           └─> Draw Detection Overlay

3. Face Stable for 3 Seconds
   └─> Extract Face Region
       └─> Calculate Dominant RGB
           └─> Update UI State
               └─> Display RGB Values

4. User Interaction
   └─> Tap RGB Value
       └─> Copy to Clipboard
           └─> Show Toast Notification
```

### Timer State Machine

```typescript
type TimerState = 'idle' | 'counting' | 'completed';

interface TimerStateMachine {
  currentState: TimerState;
  transitions: {
    'idle': {
      faceEntered: 'counting';
    };
    'counting': {
      faceLeft: 'idle';
      timeout: 'completed';
    };
    'completed': {
      reset: 'idle';
    };
  };
}
```

## Error Handling

### Error Categories

1. **Camera Errors**
   - Permission denied by user
   - Camera hardware not available
   - Browser does not support getUserMedia

2. **Detection Errors**
   - MediaPipe initialization failure
   - Face detection processing error
   - Invalid image data

3. **RGB Extraction Errors**
   - Empty face region
   - Insufficient skin pixels

### Error Handling Strategy

```typescript
// Error handler composable
function useErrorHandler() {
  const error = ref<AppError | null>(null);
  
  function handleError(error: unknown, context: string) {
    console.error(`[${context}]`, error);
    
    const appError: AppError = {
      type: categorizeError(error),
      message: getUserFriendlyMessage(error),
      timestamp: Date.now(),
      recoverable: isRecoverable(error)
    };
    
    error.value = appError;
  }
  
  return { error, handleError };
}
```

### User-Facing Error Messages

| Error Code | User Message (Chinese) | User Message (English) |
|------------|------------------------|------------------------|
| permission_denied | 请允许访问相机以使用此功能 | Please allow camera access to use this feature |
| not_supported | 您的浏览器不支持相机功能 | Your browser does not support camera features |
| initialization_failed | 相机初始化失败，请刷新页面 | Camera initialization failed, please refresh |
| detection_failed | 检测失败，请重试 | Detection failed, please try again |

## Responsive Design

### Breakpoints

```css
:root {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}
```

### Layout Adaptations

**Portrait Mode:**
- Camera view fills top 60% of screen
- RGB display at bottom 40%
- Viewfinder centered with guide text

**Landscape Mode:**
- Camera view on left 60%
- RGB display on right 40%
- Compact horizontal layout

### Mobile-First CSS Architecture

```css
/* Base mobile styles */
.camera-container {
  width: 100%;
  height: 60vh;
  position: relative;
}

/* Tablet and larger */
@media (min-width: 768px) {
  .camera-container {
    height: 70vh;
  }
}

/* Landscape orientation */
@media (orientation: landscape) and (max-height: 500px) {
  .app-layout {
    flex-direction: row;
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Frame Processing Throttling**
   - Process every 3rd frame to reduce CPU load
   - Use requestAnimationFrame for smooth rendering

2. **Canvas Optimization**
   - Use OffscreenCanvas for background processing
   - Minimize canvas redraws

3. **MediaPipe Configuration**
   - Use 'short' model for faster detection on mobile
   - Set appropriate minDetectionConfidence (0.5)

4. **Memory Management**
   - Dispose MediaPipe detector on component unmount
   - Clean up video streams properly

```typescript
// Optimized frame processing
const FRAME_SKIP = 3;
let frameCount = 0;

function processFrame(timestamp: number) {
  frameCount++;
  
  if (frameCount % FRAME_SKIP === 0) {
    const imageData = captureFrame();
    detectFace(imageData);
  }
  
  requestAnimationFrame(processFrame);
}
```

## Accessibility

### ARIA Labels

```vue
<div 
  role="application"
  aria-label="Face RGB Detector"
>
  <video 
    ref="videoElement"
    aria-label="Camera feed"
    :aria-busy="!isInitialized"
  />
  
  <div 
    class="rgb-input"
    role="group"
    aria-label="RGB color values"
  >
    <input
      :aria-label="`Red channel: ${r}`"
      readonly
    />
  </div>
</div>
```

### Keyboard Navigation

- Tab navigation between RGB input fields
- Enter/Space to copy RGB value
- Escape to reset detection

## Security Considerations

1. **Camera Permissions**
   - Only request camera when component mounts
   - Clean up streams when component unmounts
   - Never store or transmit video frames

2. **Data Privacy**
   - All processing happens locally on device
   - No server communication required
   - No persistent storage of face images

3. **Input Validation**
   - Validate RGB values are within 0-255 range
   - Sanitize any user inputs

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: RGB Values Are Valid

*For any* captured RGB result, the red, green, and blue components SHALL each be integer values between 0 and 255 (inclusive).

**Validates: Requirements 3.2, 4.1**

### Property 2: Color Preview Matches RGB Values

*For any* RGB result displayed in the UI, the color preview element's background color SHALL exactly match the RGB values shown in the input fields.

**Validates: Requirements 4.3**

### Property 3: Timer Progression Consistency

*For any* detection session where a face remains continuously in the viewfinder, the timer progress SHALL monotonically increase from 0.0 to 1.0 over exactly 3 seconds.

**Validates: Requirements 3.1, 3.2**

### Property 4: Detection Reset on Face Exit

*For any* detection session where the face exits the viewfinder, the timer progress SHALL reset to 0.0 and the detection state SHALL return to idle.

**Validates: Requirements 3.3**

### Property 5: RGB Extraction Only After Timer Completion

*For any* face detection event, RGB values SHALL only be extracted and displayed after the 3-second timer has fully completed (progress = 1.0).

**Validates: Requirements 3.2**

### Property 6: Camera Stream Cleanup

*For any* component lifecycle, when the component is unmounted, all camera streams and MediaPipe resources SHALL be properly disposed.

**Validates: Requirements 1.1**

## Testing Strategy

### Unit Tests (Vitest)

Focus on pure functions and component logic:
- RGB value validation
- Timer state machine transitions
- Color preview calculation
- Clipboard copy functionality

### Integration Tests

Test component interactions:
- Camera initialization flow
- Face detection trigger → RGB display
- Orientation change handling

### Property-Based Tests

Use fast-check for:
- RGB value validity across all extraction results
- Timer progression consistency
- Color preview matching

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/']
    }
  }
});
```

## File Structure

```
src/
├── components/
│   ├── CameraView.vue
│   ├── ViewfinderOverlay.vue
│   ├── DetectionTimer.vue
│   ├── RGBDisplay.vue
│   └── RGBInputField.vue
├── composables/
│   ├── useCamera.ts
│   ├── useFaceDetection.ts
│   ├── useDetectionTimer.ts
│   └── useErrorHandler.ts
├── services/
│   ├── FaceDetectionService.ts
│   └── RGBExtractorService.ts
├── types/
│   ├── index.ts
│   ├── face-detection.ts
│   └── rgb.ts
├── utils/
│   ├── colorUtils.ts
│   └── canvasUtils.ts
├── styles/
│   ├── main.css
│   ├── camera.css
│   └── rgb-display.css
├── App.vue
└── main.ts
```

## Dependencies

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "@mediapipe/face_detection": "^0.4.0",
    "@mediapipe/tasks-vision": "^0.10.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "fast-check": "^3.0.0"
  }
}
```
