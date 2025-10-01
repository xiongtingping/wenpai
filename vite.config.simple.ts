import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 简化的Vite配置 - 测试TDZ修复
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'terser', // 恢复正常压缩
    rollupOptions: {
      output: {
        format: 'es',
        // 简化的chunk分割策略
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slot', 'lucide-react'],
        }
      }
    }
  }
})