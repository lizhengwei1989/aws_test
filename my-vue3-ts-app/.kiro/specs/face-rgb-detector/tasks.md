# Implementation Plan: Face RGB Detector (Vue 3 Mobile App)

## Overview

实现一个 Vue 3 + TypeScript 移动端 Web 应用，使用 MediaPipe Face Detection 进行实时人脸检测，并从检测到的人脸区域提取 RGB 颜色值。用户将脸部置于取景框内，稳定 3 秒后自动捕获并显示 RGB 值。

## Tasks

- [x] 1. 项目初始化和基础配置
  - [x] 1.1 创建 Vue 3 + TypeScript + Vite 项目结构
    - 初始化 Vite 项目配置
    - 配置 TypeScript (tsconfig.json)
    - 配置 Vitest 测试框架
    - 安装依赖：vue, @mediapipe/face_detection, @mediapipe/tasks-vision, vitest, fast-check
    - _Requirements: 设计文档 - 技术栈_

- [x] 2. 类型定义和核心接口
  - [x] 2.1 创建类型定义文件
    - 创建 `src/types/index.ts` 定义核心类型
    - 创建 `src/types/face-detection.ts` 定义人脸检测相关类型
    - 创建 `src/types/rgb.ts` 定义 RGB 相关类型
    - 定义 AppState, FaceRegion, BoundingBox, RGBResult 等接口
    - _Requirements: 设计文档 - Data Models_

- [ ] 3. 服务层实现
  - [-] 3.1 实现 FaceDetectionService
    - 创建 `src/services/FaceDetectionService.ts`
    - 实现 initialize() 方法初始化 MediaPipe
    - 实现 detectFaces() 方法进行人脸检测
    - 实现 extractFaceRegion() 方法提取人脸区域
    - 实现 dispose() 方法清理资源
    - _Requirements: 设计文档 - Service Layer_

  - [ ]* 3.2 编写 FaceDetectionService 单元测试
    - 测试初始化流程
    - 测试人脸检测返回格式
    - _Requirements: 设计文档 - Service Layer_

  - [-] 3.3 实现 RGBExtractorService
    - 创建 `src/services/RGBExtractorService.ts`
    - 实现 extractDominantRGB() 方法计算主导 RGB 值
    - 实现皮肤像素过滤逻辑
    - 返回 RGB 值和皮肤像素百分比
    - _Requirements: 设计文档 - Service Layer, Requirements 3.1, 3.2, 3.3_

  - [ ]* 3.4 编写 RGBExtractorService 属性测试
    - **Property 1: RGB Values Are Valid** - 验证 RGB 值在 0-255 范围内
    - **Validates: Requirements 3.2, 4.1**

- [ ] 4. 工具函数
  - [-] 4.1 创建颜色和画布工具函数
    - 创建 `src/utils/colorUtils.ts` 实现 RGB 转换函数
    - 创建 `src/utils/canvasUtils.ts` 实现画布操作函数
    - _Requirements: 设计文档 - Utils_

- [ ] 5. Composables 组合式函数
  - [~] 5.1 实现 useCamera composable
    - 创建 `src/composables/useCamera.ts`
    - 管理摄像头访问和视频流
    - 处理权限请求和错误状态
    - 实现流清理逻辑
    - _Requirements: Requirements 1.1, 设计文档 - Camera State_

  - [~] 5.2 实现 useFaceDetection composable
    - 创建 `src/composables/useFaceDetection.ts`
    - 封装 FaceDetectionService 调用
    - 管理检测状态和结果
    - _Requirements: Requirements 2.1, 2.2_

  - [~] 5.3 实现 useDetectionTimer composable
    - 创建 `src/composables/useDetectionTimer.ts`
    - 实现计时器状态机 (idle, counting, completed)
    - 实现 3 秒倒计时逻辑
    - 处理状态转换和重置
    - _Requirements: Requirements 3.1, 3.2, 3.3_

  - [ ]* 5.4 编写 Timer 状态机属性测试
    - **Property 3: Timer Progression Consistency** - 验证计时器单调递增
    - **Property 4: Detection Reset on Face Exit** - 验证人脸离开时重置
    - **Validates: Requirements 3.1, 3.2, 3.3**

  - [~] 5.5 实现 useErrorHandler composable
    - 创建 `src/composables/useErrorHandler.ts`
    - 实现统一错误处理逻辑
    - 分类和转换错误类型
    - 提供用户友好的错误消息
    - _Requirements: Requirements 5.1, 5.2, 5.3_

- [ ] 6. Vue 组件实现
  - [~] 6.1 实现 CameraView 组件
    - 创建 `src/components/CameraView.vue`
    - 管理视频元素和画布叠加层
    - 发出 face-detected 和 frame-processed 事件
    - _Requirements: Requirements 1.1, 设计文档 - CameraView_

  - [~] 6.2 实现 ViewfinderOverlay 组件
    - 创建 `src/components/ViewfinderOverlay.vue`
    - 显示取景框和角标指示器
    - 显示人脸检测状态和引导文字
    - _Requirements: 设计文档 - ViewfinderOverlay_

  - [~] 6.3 实现 DetectionTimer 组件
    - 创建 `src/components/DetectionTimer.vue`
    - 显示 SVG 圆环倒计时动画
    - 显示剩余秒数
    - _Requirements: Requirements 3.1, 3.2_

  - [~] 6.4 实现 RGBDisplay 组件
    - 创建 `src/components/RGBDisplay.vue`
    - 显示颜色预览块
    - 显示 RGB 输入字段
    - 发出 copy-value 事件
    - _Requirements: Requirements 4.1, 4.2_

  - [~] 6.5 实现 RGBInputField 组件
    - 创建 `src/components/RGBInputField.vue`
    - 显示单个 RGB 通道输入框
    - 实现复制功能
    - _Requirements: Requirements 4.1_

  - [ ]* 6.6 编写 RGBDisplay 属性测试
    - **Property 2: Color Preview Matches RGB Values** - 验证颜色预览与 RGB 值匹配
    - **Validates: Requirements 4.3**

- [ ] 7. 主应用集成
  - [~] 7.1 实现 App.vue 根组件
    - 整合所有子组件
    - 管理全局应用状态
    - 协调组件间通信
    - _Requirements: 设计文档 - App.vue_

  - [~] 7.2 实现核心工作流程
    - 集成摄像头初始化 → 人脸检测 → 计时器 → RGB 提取流程
    - 实现 3 秒稳定检测后触发 RGB 提取
    - 确保人脸离开时重置计时器
    - _Requirements: Requirements 3.1, 3.2, 3.3_

- [ ] 8. 样式和响应式设计
  - [~] 8.1 创建移动优先样式
    - 创建 `src/styles/main.css` 全局样式
    - 创建 `src/styles/camera.css` 摄像头样式
    - 创建 `src/styles/rgb-display.css` RGB 显示样式
    - 实现响应式布局 (portrait/landscape)
    - _Requirements: 设计文档 - Responsive Design_

- [~] 9. 检查点 - 确保核心功能正常工作
  - 运行所有测试，确保通过
  - 手动验证摄像头访问和权限处理
  - 验证人脸检测和取景框显示
  - 验证计时器功能
  - 如有问题请向用户提问

- [ ] 10. 可访问性和最终完善
  - [~] 10.1 添加 ARIA 标签和键盘导航
    - 为所有交互元素添加 aria-label
    - 实现键盘导航 (Tab, Enter, Escape)
    - _Requirements: 设计文档 - Accessibility_

  - [~] 10.2 性能优化
    - 实现帧处理节流 (每 3 帧处理一次)
    - 配置 MediaPipe 使用 'short' 模型
    - 实现资源清理逻辑
    - _Requirements: 设计文档 - Performance Considerations_

  - [ ]* 10.3 编写资源清理属性测试
    - **Property 6: Camera Stream Cleanup** - 验证组件卸载时资源清理
    - **Validates: Requirements 1.1**

- [~] 11. 最终检查点 - 确保所有测试通过
  - 运行所有测试，确保通过
  - 验证 RGB 值在 0-255 范围内
  - 验证计时器精确 3 秒
  - 验证颜色预览与 RGB 值匹配
  - 如有问题请向用户提问

## Notes

- 标记 `*` 的任务为可选测试任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求或设计文档章节
- 检查点确保增量验证
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边缘情况
- 编程语言：TypeScript（根据设计文档确定）

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1", "3.3", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.4", "5.1", "5.2", "5.3", "5.5"] },
    { "id": 3, "tasks": ["5.4", "6.1", "6.2", "6.3", "6.4", "6.5"] },
    { "id": 4, "tasks": ["6.6", "7.1", "7.2", "8.1"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3"] }
  ]
}
```
