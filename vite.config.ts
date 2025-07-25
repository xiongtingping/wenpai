import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
// @ts-ignore
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
    // ✅ FIXED: 2025-07-25 添加API代理配置，解决本地开发环境Netlify Functions调用问题
    // 🐛 问题原因：本地开发环境无法访问/.netlify/functions/api端点
    // 🔧 修复方式：添加代理配置，将API请求转发到模拟端点或直接返回模拟数据
    proxy: {
      // 代理Netlify Functions到本地模拟服务
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('🔧 API代理错误，返回模拟响应');
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            });
            res.end(JSON.stringify({
              success: false,
              error: '本地开发环境：Netlify Functions不可用',
              message: '请使用生产环境测试完整功能',
              development: true
            }));
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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})