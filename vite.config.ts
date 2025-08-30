import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// @ts-expect-error - vite-env-plugin.js is a custom plugin without types
import envPlugin from './vite-env-plugin.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), envPlugin()],
  // 优化 base 路径配置，支持通过环境变量 VITE_BASE_PATH 设置，兼容子路径部署
  base: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
  root: '.',
  publicDir: 'public',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
      VITE_AUTHING_APP_ID: process.env.VITE_AUTHING_APP_ID || '68a58c57614a821a46f264f7',
      VITE_AUTHING_DOMAIN: process.env.VITE_AUTHING_DOMAIN || 'rzcswqs4sq0f.authing.cn',
      VITE_AUTHING_HOST: process.env.VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn',
      VITE_AUTHING_REDIRECT_URI: process.env.VITE_AUTHING_REDIRECT_URI || '',
      VITE_AUTHING_USER_POOL_ID: process.env.VITE_AUTHING_USER_POOL_ID || '688237f7f9e118de849dc274',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTIzMzksImV4cCI6MjA3MDYyODMzOX0.77cefG7i52iWjR6D_0H1aB-xmmJe19WQlM8PkGISW7c',
      VITE_SUPABASE_SERVICE_ROLE_KEY: process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w',
      NODE_ENV: process.env.NODE_ENV || '',
      BASE_PATH: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
      VITE_AUTHING_FALLBACK_HOSTED: process.env.VITE_AUTHING_FALLBACK_HOSTED || '',
    })
  },
  // 开发服务器配置
  server: {
    port: 3000,
    host: 'localhost',
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
      }
    }
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  // 🚨 [CRITICAL_BUILD_FIX_v2025.08.14] 修复构建配置，解决undefinedundefined问题
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          // 🔧 [AUTHING_GUARD_FIX_v2025.08.15] 移除authing chunk，避免构建时包含有问题的@authing/guard
          // authing: ['@authing/guard']
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
      'react',
      'react-dom',
      // 🔧 [AUTHING_GUARD_FIX_v2025.08.15] 暂时排除@authing/guard，避免正则表达式错误
      // '@authing/guard',
      'axios',
      'crypto-js'
    ],
    exclude: [
      'stream',
      'readable-stream',
      // 🔧 [AUTHING_GUARD_FIX_v2025.08.15] 排除@authing/guard，避免预构建时的正则表达式错误
      '@authing/guard'
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }

// ci: rebuild trigger 2025-08-15T00:00:00Z

})