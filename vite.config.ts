import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// @ts-expect-error - vite-env-plugin.js is a custom plugin without types
import envPlugin from './vite-env-plugin.js'
// @ts-expect-error - custom plugin without types
import modulePreloadPriority from './vite-modulepreload-priority.js'

// 🔧 Dev/HMR 端口自适应，避免 WebSocket 5174 冲突
const DEV_PORT = Number(process.env.PORT) || Number(process.env.VITE_DEV_PORT) || 5173;
const HMR_PORT = Number(process.env.VITE_HMR_PORT) || DEV_PORT;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react(), envPlugin(), modulePreloadPriority()],
  // 优化 base 路径配置，支持通过环境变量 VITE_BASE_PATH 设置，兼容子路径部署
  base: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@radix-ui/react-slot": path.resolve(__dirname, "./src/components/ui/safe-slot.tsx"),
    },
  },
  // 🔒 环境变量注入 - 增强安全性处理
  define: {
    __ENV__: JSON.stringify({
      // 🔒 公开API配置（无敏感信息）
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || '',
      VITE_DEBUG_MODE: process.env.VITE_DEBUG_MODE || '',
      VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || '',
      VITE_AUTHING_APP_ID: process.env.VITE_AUTHING_APP_ID || '',
      VITE_AUTHING_DOMAIN: process.env.VITE_AUTHING_DOMAIN || '',
      VITE_AUTHING_HOST: process.env.VITE_AUTHING_HOST || '',
      VITE_AUTHING_REDIRECT_URI: process.env.VITE_AUTHING_REDIRECT_URI || '',
      VITE_AUTHING_USER_POOL_ID: process.env.VITE_AUTHING_USER_POOL_ID || '',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || '',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || '',
      VITE_BUFPAY_API_URL: process.env.VITE_BUFPAY_API_URL || '',
      VITE_BUFPAY_QUERY_URL: process.env.VITE_BUFPAY_QUERY_URL || '',
      VITE_BUFPAY_NOTIFY_URL: process.env.VITE_BUFPAY_NOTIFY_URL || '',
      VITE_BUFPAY_RETURN_URL: process.env.VITE_BUFPAY_RETURN_URL || '',
      VITE_BUFPAY_FEEDBACK_URL: process.env.VITE_BUFPAY_FEEDBACK_URL || '',
      VITE_AUTHING_FALLBACK_HOSTED: process.env.VITE_AUTHING_FALLBACK_HOSTED || '',
      VITE_APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
      NODE_ENV: process.env.NODE_ENV || '',
      BASE_PATH: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
      
      // 🔒 敏感信息处理：仅在开发环境注入，生产环境使用运行时获取
      ...(process.env.NODE_ENV === 'development' && {
        VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
        VITE_DEEPSEEK_API_KEY: process.env.VITE_DEEPSEEK_API_KEY || '',
        VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || '',
        VITE_CREEM_API_KEY: process.env.VITE_CREEM_API_KEY || '',
        VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
        VITE_BUFPAY_APP_SECRET: process.env.VITE_BUFPAY_APP_SECRET || '',
      }),
      
      // 🔒 生产环境敏感信息标记（需要运行时获取）
      ...(process.env.NODE_ENV === 'production' && {
        VITE_OPENAI_API_KEY: '__RUNTIME_SECRET__',
        VITE_DEEPSEEK_API_KEY: '__RUNTIME_SECRET__',
        VITE_GEMINI_API_KEY: '__RUNTIME_SECRET__',
        VITE_CREEM_API_KEY: '__RUNTIME_SECRET__',
        VITE_SUPABASE_SERVICE_ROLE_KEY: '__RUNTIME_SECRET__',
        VITE_BUFPAY_APP_SECRET: '__RUNTIME_SECRET__',
      })
    })
  },
  // 开发服务器配置
  server: {
    port: DEV_PORT,
    host: '0.0.0.0',
    strictPort: true,
    hmr: {
      port: HMR_PORT,
      clientPort: HMR_PORT
    },
    proxy: {
      '/api/authing': {
        target: 'https://rzcswqs4sq0f.authing.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/authing/, '/api'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔧 Authing代理错误:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔧 代理Authing请求:', req.method, req.url);
          });
        }
      },
      '/api/bufpay': {
        target: 'https://bufpay.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/bufpay/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔧 BufPay代理错误:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔧 代理BufPay请求:', req.method, req.url);
          });
        }
      },
      '/api/hot': {
        target: 'https://api-hot.imsyy.top',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/hot/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔧 热点API代理错误:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔧 代理热点API请求:', req.method, req.url);
          });
        }
      },
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔧 Netlify函数代理错误:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('🔧 代理Netlify函数请求:', req.method, req.url);
          });
        }
      }
    }
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.VITE_ENABLE_SOURCEMAP === 'true',
    target: 'esnext',
    rollupOptions: {
      // 🔧 CRITICAL: 强制React模块正确处理
      external: (id) => {
        // 不外部化任何模块，全部打包以避免运行时加载顺序问题
        return false;
      },
      output: {
        // 🔧 ROOT CAUSE FIX: 强制模块加载优先级控制
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 🔧 ULTIMATE FIX: React核心库绝对优先级
            if (id.includes('react') && !id.includes('react-router') && !id.includes('react-i18next')) {
              return 'aaaa-react-core'; // 用更多'a'前缀确保绝对优先
            }
            
            // React生态系统库 - 依赖React核心库
            if (id.includes('react-router') || id.includes('react-i18next') || id.includes('react-hook-form')) {
              return 'bbbb-react-ecosystem';
            }
            
            // UI组件库 - 依赖React
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'cccc-ui-vendor';
            }
            
            // 工具库 - 通常不依赖React，可以并行加载
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('crypto-js') || id.includes('axios')) {
              return 'dddd-utils-vendor';
            }
            
            // 国际化
            if (id.includes('i18n')) {
              return 'eeee-i18n-vendor';
            }
            
            // 动画和图表库 - 强制依赖React核心库，最后加载
            if (id.includes('framer-motion') || id.includes('recharts') || id.includes('chart')) {
              return 'zzzz-animation-vendor';
            }
            
            // 编辑器相关 - 大型库，延后加载
            if (id.includes('monaco') || id.includes('editor')) {
              return 'yyyy-editor-vendor';
            }
            
            // 其他第三方库
            return 'ffff-vendor';
          }
          
          // 业务代码分割
          if (id.includes('/src/')) {
            // 服务层
            if (id.includes('/services/')) {
              return 'gggg-services';
            }
            
            // 工具函数
            if (id.includes('/utils/') || id.includes('/lib/')) {
              return 'hhhh-utils';
            }
            
            // 组件库
            if (id.includes('/components/')) {
              return 'iiii-components';
            }
            
            // 页面组件 - 最后加载
            if (id.includes('/pages/')) {
              // 大型页面单独分包
              if (id.includes('CreativeStudioPage') || id.includes('BrandLibraryPage') || id.includes('NewAdaptPage')) {
                const pageName = id.split('/').pop()?.replace(/\.tsx?$/, '') || 'page';
                return `zzzz-page-${pageName}`;
              }
              return 'zzzz-pages';
            }
          }
          
          return undefined;
        },
        // 🔧 ROOT CAUSE FIX: 控制chunk顺序和modulepreload生成
        chunkFileNames: (chunkInfo) => {
          return `[name]-[hash].js`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      dynamicRequireTargets: [
        'node_modules/stream/**/*.js',
        'node_modules/readable-stream/**/*.js'
      ],
      ignoreDynamicRequires: true
    }
  },
  // 🔧 根因修复：正确的依赖预构建配置
  optimizeDeps: {
    include: [
      // 🔧 ULTIMATE FIX: 强制预构建所有React相关模块避免TDZ
      'react',
      'react/jsx-runtime', 
      'react/jsx-dev-runtime',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react-hook-form',
      'react-i18next',
      // 🔧 强制预构建React内部模块
      'scheduler',
      'scheduler/tracing',
      'use-sync-external-store',
      'use-sync-external-store/shim',
      'axios',
      'crypto-js'
    ],
    // 🔧 CRITICAL: 强制深度扫描React模块
    entries: [
      'src/main.tsx',
      'src/App.tsx',
      'react',
      'react-dom/client'
    ],
    exclude: [
      // 🔧 仅排除Node.js模块和有问题的包
      'stream',
      'readable-stream', 
      'events',
      'buffer',
      'util',
      'crypto',
      'fs',
      'path',
      'os',
      'url',
      'querystring',
      'http',
      'https',
      'zlib',
      // polyfill包
      'stream-browserify',
      'events-browserify', 
      'buffer-browserify',
      'util-browserify',
      'crypto-browserify',
      // 有问题的第三方包
      '@authing/guard'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
        // 🔧 ULTIMATE FIX: 强制确保React全局可用并预定义关键对象
        'window.React': 'window.React',
        'process.env.NODE_ENV': '"production"'
      },
      target: 'esnext',
      // 🔧 关键修复：保持函数名避免React内部引用错误
      keepNames: true,
      minify: false,
      // 🔧 CRITICAL: 确保React模块正确打包
      platform: 'browser',
      format: 'esm'
    },
    force: false
  }
}))

// ci: rebuild trigger 2025-08-15T00:00:00Z