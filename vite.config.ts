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
      overlay: true, // 显示错误覆盖层
    },
    // 代理Netlify函数到本地开发服务器
    proxy: {
      '/.netlify/functions/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // 构建优化
    rollupOptions: {
      output: {
        manualChunks: {
          // 核心库
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          
          // UI组件库（只保留真实存在的Radix UI包）
          'ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-progress',
            '@radix-ui/react-separator',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-popover',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-accordion',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-tooltip',
          ],
          
          // 工具库
          'utils': [
            'lucide-react',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'date-fns',
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            'zustand',
          ],
          
          // 页面分割
          'pages-home': ['./src/pages/HomePage.tsx'],
          'pages-adapt': ['./src/pages/AdaptPage.tsx'],
          'pages-creative': ['./src/pages/CreativeStudioPage.tsx'],
          'pages-hot-topics': ['./src/pages/HotTopicsPage.tsx'],
          'pages-library': ['./src/pages/BookmarkPage.tsx'],
          'pages-brand': ['./src/pages/BrandLibraryPage.tsx'],
          'pages-content-extractor': ['./src/pages/ContentExtractorPage.tsx'],
          'pages-emoji': ['./src/pages/EmojiPage.tsx'],
          'pages-share': ['./src/pages/ShareManagerPage.tsx'],
          
          // 组件分割
          'components-layout': [
            './src/components/layout/PageNavigation.tsx',
            './src/components/layout/ToolLayout.tsx',
            './src/components/layout/TopNavigation.tsx',
            './src/components/layout/ScrollToTop.tsx',
          ],
          'components-landing': [
            './src/components/landing/HeroSection.tsx',
            './src/components/landing/FeaturesSection.tsx',
            './src/components/landing/Header.tsx',
            './src/components/landing/Footer.tsx',
          ],
          'components-creative': [
            './src/components/creative/CreativeCube.tsx',
            './src/components/creative/MarketingCalendar.tsx',
            './src/components/creative/BrandContentGenerator.tsx',
            './src/components/creative/BrandProfileGenerator.tsx',
          ],
          'components-auth': [
            './src/components/auth/UserAvatar.tsx',
            './src/components/auth/LoginForm.tsx',
            './src/components/auth/ProtectedRoute.tsx',
          ],
          
          // API和服务
          'api-services': [
            './src/api/contentAdapter.ts',
            './src/api/hotTopicsService.ts',
            './src/api/topicSubscriptionService.ts',
            './src/services/aiAnalysisService.ts',
            './src/services/notoEmojiService.ts',
          ],
        },
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        toplevel: true,
      },
    },
    // 分块大小警告限制
    chunkSizeWarningLimit: 1000,
    // 源码映射
    sourcemap: false,
    // 资源内联限制
    assetsInlineLimit: 4096,
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
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-switch',
      '@radix-ui/react-progress',
      '@radix-ui/react-separator',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-popover',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-accordion',
      '@radix-ui/react-aspect-ratio',
      '@radix-ui/react-avatar',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slider',
      '@radix-ui/react-toggle',
      '@radix-ui/react-toggle-group',
      '@radix-ui/react-tooltip',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'date-fns',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'zustand',
    ],
    exclude: [
      // 排除不需要预构建的依赖
    ],
  },
  // 环境变量配置
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  // CSS优化
  css: {
    devSourcemap: false,
  },
})