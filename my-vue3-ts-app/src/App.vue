<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';

// Application state
const state = reactive({
  camera: {
    initialized: false,
    hasPermission: null as boolean | null,
    error: null as string | null,
  },
  detection: {
    isFaceInFrame: false,
    isDetecting: false,
    detectionProgress: 0,
  },
  result: {
    captured: false,
    rgb: null as { r: number; g: number; b: number } | null,
    timestamp: null as number | null,
  },
});

// Template refs
const videoElement = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  // Initialize camera on mount
  initializeCamera();
});

onUnmounted(() => {
  // Cleanup camera stream
  if (videoElement.value?.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
  }
});

async function initializeCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      state.camera.initialized = true;
      state.camera.hasPermission = true;
    }
  } catch (error) {
    state.camera.hasPermission = false;
    state.camera.error = '请允许访问相机以使用此功能';
    console.error('Camera initialization failed:', error);
  }
}
</script>

<template>
  <div class="app-container" role="application" aria-label="Face RGB Detector">
    <header class="app-header">
      <h1>Face RGB Detector</h1>
    </header>
    
    <main class="app-main">
      <div class="camera-container">
        <video
          ref="videoElement"
          autoplay
          playsinline
          muted
          class="camera-video"
          aria-label="Camera feed"
          :aria-busy="!state.camera.initialized"
        />
        
        <div v-if="!state.camera.initialized" class="camera-overlay">
          <p v-if="state.camera.error" class="error-message">{{ state.camera.error }}</p>
          <p v-else class="loading-message">正在初始化相机...</p>
        </div>
      </div>
      
      <div class="rgb-display">
        <div v-if="state.result.captured && state.result.rgb" class="rgb-result">
          <div 
            class="color-preview" 
            :style="{ backgroundColor: `rgb(${state.result.rgb.r}, ${state.result.rgb.g}, ${state.result.rgb.b})` }"
          />
          <div class="rgb-values">
            <div class="rgb-channel">
              <span class="channel-label">R</span>
              <span class="channel-value">{{ state.result.rgb.r }}</span>
            </div>
            <div class="rgb-channel">
              <span class="channel-label">G</span>
              <span class="channel-value">{{ state.result.rgb.g }}</span>
            </div>
            <div class="rgb-channel">
              <span class="channel-label">B</span>
              <span class="channel-value">{{ state.result.rgb.b }}</span>
            </div>
          </div>
        </div>
        <div v-else class="rgb-placeholder">
          <p>将脸部置于取景框内</p>
          <p class="hint">稳定保持3秒以捕获RGB值</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.app-header {
  padding: 1rem;
  text-align: center;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.camera-container {
  position: relative;
  width: 100%;
  height: 60vh;
  background-color: #000;
  overflow: hidden;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
}

.error-message {
  color: #ff6b6b;
}

.rgb-display {
  flex: 1;
  padding: 1.5rem;
  background-color: #fff;
}

.rgb-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.color-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rgb-values {
  display: flex;
  gap: 1.5rem;
}

.rgb-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.channel-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
}

.channel-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
}

.rgb-placeholder {
  text-align: center;
  color: #999;
}

.rgb-placeholder p {
  margin: 0.5rem 0;
}

.hint {
  font-size: 0.875rem;
}
</style>
