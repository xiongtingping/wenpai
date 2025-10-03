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
    minify: 'esbuild', // 启用压缩以减小文件大小
    rollupOptions: {
      output: {
        format: 'es',
        // 🔧 FIX: 确保chunk名称包含hash以避免缓存问题
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 简化的chunk分割策略 - 只分离核心依赖,避免循环依赖
        manualChunks: {
          // React 核心生态系统(包括 scheduler)
          'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
          // PDF.js 独立分离(体积大)
          'pdf': ['pdfjs-dist'],
        }
      }
    },
    // 🔧 FIX: 确保sourcemap生成用于调试
    sourcemap: true,
    // 🔧 FIX: 清理输出目录避免旧文件残留
    emptyOutDir: true,
    // 增加 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000
  }
})