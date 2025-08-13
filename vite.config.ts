import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// @ts-expect-error - vite-env-plugin is not typed
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
  // 🔒 SECURITY FIX: 移除 API 密钥的客户端注入，防止密钥暴露
  // 环境变量注入，仅注入非敏感配置
  define: {
    __ENV__: JSON.stringify({
      // 🚨 REMOVED: API 密钥不再注入客户端，改用服务端代理
      // VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || '',
      // VITE_DEEPSEEK_API_KEY: process.env.VITE_DEEPSEEK_API_KEY || '',
      // VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || '',
      // VITE_CREEM_API_KEY: process.env.VITE_CREEM_API_KEY || '',

      // ✅ 安全配置：仅注入非敏感的配置信息
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || '',
      VITE_DEBUG_MODE: process.env.VITE_DEBUG_MODE || '',
      VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || '',
      VITE_AUTHING_APP_ID: process.env.VITE_AUTHING_APP_ID || '68823897631e1ef8ff3720b2',
      VITE_AUTHING_DOMAIN: process.env.VITE_AUTHING_DOMAIN || 'rzcswqd4sq0f.authing.cn',
      VITE_AUTHING_HOST: process.env.VITE_AUTHING_HOST || 'https://rzcswqd4sq0f.authing.cn',
      NODE_ENV: process.env.NODE_ENV || '',
      BASE_PATH: process.env.VITE_BASE_PATH || process.env.BASE_PATH || '/',
    })
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 代理本地后端API请求
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Backend API proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from Backend:', proxyRes.statusCode, req.url);
          });
        },
      },
      // 代理热点数据API，解决CORS问题
      '/api/hot': {
        target: 'https://api-hot.imsyy.top',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/hot/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          authing: ['@authing/guard']
        }
      }
    }
  }
})