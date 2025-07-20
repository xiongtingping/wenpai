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
      // 注入环境变量到全局对象
      const envScript = `
        <script>
          window.__ENV__ = {
            VITE_OPENAI_API_KEY: '${envVars.VITE_OPENAI_API_KEY || ''}',
            VITE_DEEPSEEK_API_KEY: '${envVars.VITE_DEEPSEEK_API_KEY || ''}',
            VITE_GEMINI_API_KEY: '${envVars.VITE_GEMINI_API_KEY || ''}',
            VITE_CREEM_API_KEY: '${envVars.VITE_CREEM_API_KEY || ''}',
            VITE_AUTHING_APP_ID: '${envVars.VITE_AUTHING_APP_ID || ''}',
            VITE_AUTHING_HOST: '${envVars.VITE_AUTHING_HOST || ''}',
            VITE_API_BASE_URL: '${envVars.VITE_API_BASE_URL || ''}',
            VITE_DEBUG_MODE: '${envVars.VITE_DEBUG_MODE || ''}',
            VITE_LOG_LEVEL: '${envVars.VITE_LOG_LEVEL || ''}'
          };
        </script>
      `;
      
      return html.replace('</head>', `${envScript}</head>`);
    }
  };
} 