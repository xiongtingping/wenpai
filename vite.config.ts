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
    minify: false, // 暂时禁用压缩避免CSS错误
    rollupOptions: {
      output: {
        format: 'es',
        // 🔧 FIX: 确保chunk名称包含hash以避免缓存问题
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // 简化的chunk分割策略
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-slot', 'lucide-react'],
        }
      }
    },
    // 🔧 FIX: 确保sourcemap生成用于调试
    sourcemap: true,
    // 🔧 FIX: 清理输出目录避免旧文件残留
    emptyOutDir: true
  }
})