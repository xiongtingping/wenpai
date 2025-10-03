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
        // 改进的chunk分割策略 - 自动分割大型依赖
        manualChunks(id) {
          // 分离 node_modules
          if (id.includes('node_modules')) {
            // React 核心库及其依赖(包括 scheduler)
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
              return 'vendor';
            }
            // Radix UI 组件
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
            // PDF 相关库
            if (id.includes('pdfjs') || id.includes('pdf')) {
              return 'pdf';
            }
            // 其他大型依赖
            return 'vendor-misc';
          }
          // 分离大型服务文件
          if (id.includes('src/services/aiAnalysisService')) {
            return 'ai-analysis';
          }
          if (id.includes('src/services/unifiedEmojiSystem')) {
            return 'emoji-system';
          }
          if (id.includes('src/services/PromptSystem')) {
            return 'prompt-system';
          }
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