import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 添加构建时间戳，确保缓存破坏
    rollupOptions: {
      output: {
        // 添加时间戳到文件名，确保缓存破坏
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    },
    // 确保每次构建都生成新的哈希
    sourcemap: false,
    // 设置较小的chunk大小警告限制
    chunkSizeWarningLimit: 1000
  },
  // 开发服务器配置
  server: {
    port: 3000,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})