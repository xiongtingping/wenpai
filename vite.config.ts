import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    // 开发环境优化
    hmr: {
      overlay: {
        // 错误覆盖层配置
        errors: true,
        warnings: false, // 隐藏警告覆盖层
      },
    },
  },
  build: {
    // 构建优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 代码分割配置
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
        },
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
      },
    },
  },
  // 开发环境优化
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      'lucide-react',
    ],
  },
  // 环境变量配置
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})