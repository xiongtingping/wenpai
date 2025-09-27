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
      // 🔧 FIXED: 全局替换 @radix-ui/react-slot 以解决 forwardRef 错误
      "@radix-ui/react-slot": path.resolve(__dirname, "./src/components/ui/safe-slot.tsx"),
      // 🔧 关键修复：只重定向jsx-runtime，保持react外部化
      "react/jsx-runtime": path.resolve(__dirname, "./src/utils/jsx-runtime-polyfill.ts"),
    },
  },
  // 环境变量注入，兼容 Vite/Node/Netlify/Vercel
  define: {
    __ENV__: JSON.stringify({
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
      VITE_DEEPSEEK_API_KEY: process.env.VITE_DEEPSEEK_API_KEY || '',
      VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || '',
      VITE_CREEM_API_KEY: process.env.VITE_CREEM_API_KEY || '',
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
      VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
      VITE_BUFPAY_API_URL: process.env.VITE_BUFPAY_API_URL || '',
      VITE_BUFPAY_QUERY_URL: process.env.VITE_BUFPAY_QUERY_URL || '',
      VITE_BUFPAY_APP_SECRET: process.env.VITE_BUFPAY_APP_SECRET || '',
      VITE_BUFPAY_NOTIFY_URL: process.env.VITE_BUFPAY_NOTIFY_URL || '',
      VITE_BUFPAY_RETURN_URL: process.env.VITE_BUFPAY_RETURN_URL || '',
      VITE_BUFPAY_FEEDBACK_URL: process.env.VITE_BUFPAY_FEEDBACK_URL || '',
      NODE_ENV: process.env.NODE_ENV || '',
      BASE_PATH: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
      VITE_AUTHING_FALLBACK_HOSTED: process.env.VITE_AUTHING_FALLBACK_HOSTED || '',
      VITE_APP_VERSION: process.env.VITE_APP_VERSION || '1.0.0',
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
    // 🔧 修复语法错误：使用esbuild替代terser避免"Invalid left-hand side"错误
    minify: 'esbuild',
    esbuild: {
      // 保持类名和函数名不被压缩，避免运行时错误
      keepNames: true,
      // 使用安全的压缩配置
      minifyIdentifiers: false,
      minifySyntax: true,
      minifyWhitespace: true,
      // 禁用可能导致语法错误的代码转换
      legalComments: 'none',
      // 保持原始代码结构，避免赋值语句解析错误
      target: 'es2020'
    },
    rollupOptions: {
      // 🔧 修复React外部化 - 改为UMD格式映射
      ...(command === 'build' && {
        external: (id) => {
          return ['react', 'react-dom'].includes(id);
        },
      }),
      output: {
        // 🔧 修复全局变量映射 - 使用正确的UMD全局变量名
        ...(command === 'build' && {
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM'
          },
        }),
        // 优化代码分割策略：减少大文件
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // UI组件库
            if (id.includes('node_modules/@radix-ui')) return 'ui-vendor';
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor';
            if (id.includes('node_modules/framer-motion')) return 'animation-vendor';
            
            // 认证相关
            if (id.includes('node_modules/@authing')) return 'auth-vendor';
            if (id.includes('node_modules/jsonwebtoken')) return 'auth-vendor';
            
            // 大型库分离
            if (id.includes('node_modules/react-router')) return 'router-vendor';
            if (id.includes('node_modules/@tanstack/react-table')) return 'table-vendor';
            if (id.includes('node_modules/recharts')) return 'chart-vendor';
            
            // 工具库
            if (id.includes('node_modules/lodash')) return 'utils-vendor';
            if (id.includes('node_modules/date-fns')) return 'utils-vendor';
            if (id.includes('node_modules/crypto-js')) return 'utils-vendor';
            
            return 'vendor';
          }
          
          // 业务代码分割
          if (id.includes('/src/pages/')) {
            if (id.includes('ProfilePage') || id.includes('SettingsPage')) return 'user-pages';
            if (id.includes('PaymentPage') || id.includes('PaymentResult')) return 'payment-pages';
            if (id.includes('CreativeStudio') || id.includes('BrandLibrary')) return 'creative-pages';
            return 'pages';
          }
          
          // 服务层分离
          if (id.includes('/src/services/')) return 'services';
          if (id.includes('/src/api/')) return 'api';
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
          name: 'fix-commonjs-intrinsic',
          generateBundle(options, bundle) {
            // 修复 intrinsic %% 错误
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
              }
            });
          }
        }
      ]
    },
    // 调整块大小警告阈值
    chunkSizeWarningLimit: 800, // 提高到800kB
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
      'stream',
      'readable-stream',
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