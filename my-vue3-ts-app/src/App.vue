<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const key = ref('')
const imgUrl = ref('')

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
const showImage = async () => {
  const res = await fetch(`/api/image?key=${encodeURIComponent(key.value)}`);
  if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
  }
  
  const data = await res.json();
  
  if (data.success) {
      imgUrl.value = data.url;
  } else {
      throw new Error(data.error || '获取图片链接失败');
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
  <div>
    <input type="text" v-model="key" placeholder="输入文件键名" />
    <button @click="showImage" :disabled="!key">获取文件</button>
    <img 
          :src="imgUrl" 
          alt="S3 图片" 
          :style="{
              maxWidth: '100%', 
              maxHeight: '500px', 
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }" 
      />
</div>
</template>
