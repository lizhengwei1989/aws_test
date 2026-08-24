<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)

// 处理文件选择
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0]
}

// 主要上传逻辑
const uploadFile = async () => {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // 1. 向后端请求预签名URL
    const response = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: selectedFile.value.name,
        fileType: selectedFile.value.type,
      }),
    })

    if (!response.ok) {
      throw new Error('获取上传链接失败')
    }

    const { uploadUrl } = await response.json()

    console.log(selectedFile.value.type, 'selectedFile.value.type')

    // 2. 使用fetch直接上传文件到S3
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': selectedFile.value.type, // 必须与后端签名时的类型一致[citation:9]
      },
      body: selectedFile.value,
    })

    if (!uploadResponse.ok) {
      throw new Error(`上传失败: ${uploadResponse.status}`)
    }

    console.log('文件上传成功！')
    // 这里可以通知后端更新数据库等操作

  } catch (error) {
    console.error('上传出错:', error)
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}
</script>

<template>
  <div>
    <input type="file" @change="handleFileChange" />
    <button @click="uploadFile" :disabled="!selectedFile || isUploading">
      {{ isUploading ? '上传中...' : '上传到S3' }}
    </button>
    <div v-if="uploadProgress">上传进度：{{ uploadProgress }}%</div>
  </div>
</template>
