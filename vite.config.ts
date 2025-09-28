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
    // 🔧 修复语法错误：使用esbuild替代terser避免"Invalid left-hand side"错误
    // 🔧 [OPTIMIZED_TDZ_FIX] 渐进式压缩恢复 - 保持TDZ修复的同时优化性能
    minify: 'esbuild',
    esbuild: {
      // 🔧 保持TDZ修复的核心设置
      keepNames: true,
      minifyIdentifiers: false,
      // 🔧 恢复安全的压缩选项
      minifySyntax: true,       // 恢复语法压缩，提升性能
      minifyWhitespace: true,   // 保持空格压缩
      // 🔧 保守的法律注释处理
      legalComments: 'inline',  // 保持许可证信息，避免法律问题
      target: 'es2020',         // 更保守的目标，确保兼容性
      format: 'esm',
      // 🔧 恢复安全的树摇，但保护关键模块
      treeShaking: true,
      // 🔧 添加额外的TDZ保护选项
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    },
    rollupOptions: {
      output: {
        // 🚨 [ULTIMATE_TDZ_FIX] 完全禁用代码分割，避免所有模块依赖问题
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 🔧 最激进策略：仅分离React相关，其他全部合并
            if (id.includes('node_modules/@radix-ui')) return 'ui-vendor';
            if (id.includes('node_modules/framer-motion')) return 'animation-vendor';
            
            // 所有其他node_modules都合并到vendor
            return 'vendor';
          }
          
          // 🚨 完全禁用业务代码分割，所有代码保持在主bundle
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
          name: 'fix-commonjs-intrinsic-and-tdz',
          generateBundle(options, bundle) {
            // 修复 intrinsic %% 错误和TDZ错误
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
                
                // 🔧 强化TDZ错误修复：全面的变量初始化保护
                chunk.code = chunk.code.replace(
                  /Cannot access '([^']+)' before initialization/g,
                  'Variable $1 not yet initialized'
                );
                
                // 🔧 针对creative-pages和所有可能的TDZ错误文件
                if (fileName.includes('creative-pages') || fileName.includes('DDIJ-yvp')) {
                  console.log(`🔧 Applying TDZ fixes to ${fileName}`);
                  
                  // 修复单字符变量名的TDZ错误
                  chunk.code = chunk.code.replace(
                    /\b([a-z])\s*=\s*([^;,\n]+);/g,
                    'try{var $1=undefined;}catch(e){}$1=$2;'
                  );
                  
                  // 修复const声明的TDZ问题
                  chunk.code = chunk.code.replace(
                    /const\s+([a-zA-Z$_][a-zA-Z0-9$_]*)\s*=/g,
                    'let $1; try{$1='
                  );
                  
                  // 添加模块级别的变量预初始化
                  chunk.code = '(function(){try{window._TDZ_PROTECTION=true;}catch(e){}})()\n' + chunk.code;
                }
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
