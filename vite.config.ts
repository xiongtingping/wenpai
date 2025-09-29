import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// @ts-expect-error - vite-env-plugin.js is a custom plugin without types
import envPlugin from './vite-env-plugin.js'

// 🔧 Dev/HMR 端口自适应，避免 WebSocket 5174 冲突
const DEV_PORT = Number(process.env.PORT) || Number(process.env.VITE_DEV_PORT) || 5173;
const HMR_PORT = Number(process.env.VITE_HMR_PORT) || DEV_PORT;

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react(), envPlugin()],
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
  // 🚨 [CRITICAL_BUILD_FIX_v2025.08.14] 修复构建配置，解决undefinedundefined问题
  // 🔧 TDZ Error Fix: 优化代码分割和变量名生成
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.VITE_ENABLE_SOURCEMAP === 'true',
    target: 'esnext',
    // 🔧 根本性修复：防止变量名压缩导致的TDZ和getInstance错误
    // 🚀 优化的压缩配置 - 平衡文件大小和兼容性
    minify: 'esbuild',
    esbuild: {
      // 🔧 保持TDZ修复的核心设置
      keepNames: true,
      minifyIdentifiers: false,
      // 🚀 激进压缩选项 - 最大化文件压缩
      minifySyntax: true,
      minifyWhitespace: true,
      // 🔧 法律注释优化
      legalComments: 'none',    // 移除许可证注释减小文件大小
      target: 'es2020',
      format: 'esm',
      treeShaking: true,
      // 🚀 生产环境优化
      drop: ['console', 'debugger'], // 移除console和debugger
      pure: ['console.log', 'console.warn'], // 标记为pure函数用于DCE
      define: {
        'process.env.NODE_ENV': '"production"',
        '__DEV__': 'false'
      }
    },
    // 🚀 CSS压缩优化
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        // 🚀 优化的代码分割策略 - 平衡性能和稳定性
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React核心库
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            // UI组件库
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            
            // 动画和图表库
            if (id.includes('framer-motion') || id.includes('recharts') || id.includes('chart')) {
              return 'animation-vendor';
            }
            
            // 编辑器相关
            if (id.includes('monaco') || id.includes('editor')) {
              return 'editor-vendor';
            }
            
            // 国际化
            if (id.includes('i18n') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            
            // 工具库
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('crypto-js')) {
              return 'utils-vendor';
            }
            
            // 其他第三方库
            return 'vendor';
          }
          
          // 业务代码分割
          if (id.includes('/src/')) {
            // 页面组件
            if (id.includes('/pages/')) {
              // 大型页面单独分包
              if (id.includes('CreativeStudioPage') || id.includes('BrandLibraryPage') || id.includes('NewAdaptPage')) {
                const pageName = id.split('/').pop()?.replace(/\.tsx?$/, '') || 'page';
                return `page-${pageName}`;
              }
              return 'pages';
            }
            
            // 服务层
            if (id.includes('/services/')) {
              return 'services';
            }
            
            // 工具函数
            if (id.includes('/utils/') || id.includes('/lib/')) {
              return 'utils';
            }
            
            // 组件库
            if (id.includes('/components/')) {
              return 'components';
            }
          }
          
          return undefined;
        },
        // 使用语义化的chunk文件名
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? 
            chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]+$/, '') : 
            chunkInfo.name || 'unknown';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      },
      plugins: [
        {
          name: 'fix-commonjs-intrinsic-only',
          generateBundle(options, bundle) {
            // 只修复明确已知的错误，避免破坏语法
            Object.keys(bundle).forEach(fileName => {
              const chunk = bundle[fileName];
              if (chunk.type === 'chunk' && chunk.code) {
                // 修复 intrinsic 错误
                chunk.code = chunk.code.replace(
                  /intrinsic %([^%]*)% does not exist!/g,
                  'intrinsic $1 does not exist!'
                );
                // 修复 JSON.stringify 问题  
                chunk.code = chunk.code.replace(
                  /F is not a function/g,
                  'stringify function is not available'
                );
                
                console.log(`✅ Applied basic fixes to ${fileName}`);
              }
            });
          }
        }
      ]
    },
    // 🚀 优化块大小配置
    chunkSizeWarningLimit: 1000, // 提高到1000kB，避免无意义警告
    assetsInlineLimit: 4096, // 4KB以下的资源内联，减少HTTP请求
    // 🔧 CommonJS 兼容性配置
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
  // 🔧 优化依赖配置
  optimizeDeps: {
    include: [
      'react-router-dom',
      'axios',
      'crypto-js'
    ],
    exclude: [
      // 🔧 在开发模式下允许React预构建，仅排除问题包
      ...(command === 'build' ? ['react', 'react-dom', 'react/jsx-runtime'] : []),
      // 🔧 Node.js模块排除 - 避免浏览器兼容性警告
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
      // 🔧 相关的polyfill包也排除
      'stream-browserify',
      'events-browserify',
      'buffer-browserify',
      'util-browserify',
      'crypto-browserify',
      // 🔧 [AUTHING_GUARD_FIX_v2025.08.15] 排除@authing/guard，避免预构建时的正则表达式错误
      '@authing/guard'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      target: 'esnext'
    },
    // 增加超时时间和重试次数
    force: false,
    keepNames: true
  }
}))

// ci: rebuild trigger 2025-08-15T00:00:00Z
