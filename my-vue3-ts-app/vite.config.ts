import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 将请求路径中以 /api 开头的请求代理出去
      '/api': {
        target: 'http://localhost:3000', // 你的后端服务地址
        changeOrigin: true,              // 推荐开启，可以解决大部分跨域问题[citation:1][citation:4]
      }
    }
  }
})
