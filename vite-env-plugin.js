import { loadEnv } from 'vite';

/**
 * Vite 环境变量注入插件
 */
export default function envPlugin() {
  let envVars = {};
  
  return {
    name: 'env-injector',
    config(config, { mode }) {
      // 加载环境变量
      envVars = loadEnv(mode, process.cwd(), '');
    },
    transformIndexHtml(html) {
      // 🔒 SECURITY FIX: 仅注入非敏感环境变量到全局对象
      // API 密钥不再注入客户端，改用服务端代理
      const envScript = `
        <script>
          window.__ENV__ = {
            // 🚨 REMOVED: API 密钥不再注入客户端
            // VITE_OPENAI_API_KEY: '${envVars.VITE_OPENAI_API_KEY || ''}',
            // VITE_DEEPSEEK_API_KEY: '${envVars.VITE_DEEPSEEK_API_KEY || ''}',
            // VITE_GEMINI_API_KEY: '${envVars.VITE_GEMINI_API_KEY || ''}',
            // VITE_CREEM_API_KEY: '${envVars.VITE_CREEM_API_KEY || ''}',

            // ✅ 安全配置：仅注入非敏感配置
            VITE_AUTHING_APP_ID: '${envVars.VITE_AUTHING_APP_ID || '68a68a29d0c3341ae7a3df23'}',
            VITE_AUTHING_HOST: '${envVars.VITE_AUTHING_HOST || 'https://rzcswqs4sq0f.authing.cn'}',
            VITE_AUTHING_DOMAIN: '${envVars.VITE_AUTHING_DOMAIN || 'rzcswqs4sq0f.authing.cn'}',
            
            // Supabase 配置 (anon key 是公开的，可以安全注入)
            VITE_SUPABASE_URL: '${envVars.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co'}',
            VITE_SUPABASE_ANON_KEY: '${envVars.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTIzMzksImV4cCI6MjA3MDYyODMzOX0.77cefG7i52iWjR6D_0H1aB-xmmJe19WQlM8PkGISW7c'}',
            VITE_SUPABASE_PROJECT_ID: '${envVars.VITE_SUPABASE_PROJECT_ID || 'weizkydylskcwgnaieqy'}',
            
            VITE_API_BASE_URL: '${envVars.VITE_API_BASE_URL || 'https://www.wenpai.xyz/api'}',
            VITE_DEBUG_MODE: '${envVars.VITE_DEBUG_MODE || 'false'}',
            VITE_LOG_LEVEL: '${envVars.VITE_LOG_LEVEL || 'info'}'
          };
        </script>
      `;

      return html.replace('</head>', `${envScript}</head>`);
    }
  };
} 