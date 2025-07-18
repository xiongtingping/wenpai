/**
 * 运行时配置注入器
 * 用于在生产环境中动态注入API配置，避免硬编码敏感信息
 */

const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // 只处理HTML请求
  if (event.httpMethod !== 'GET' || !event.path.endsWith('.html')) {
    return {
      statusCode: 404,
      body: 'Not Found'
    };
  }

  try {
    // 读取HTML模板
    const htmlPath = path.join(__dirname, '../../dist/index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 获取环境变量
    const envVars = {
      VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || '',
      VITE_DEEPSEEK_API_KEY: process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY || '',
      VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
      VITE_CREEM_API_KEY: process.env.VITE_CREEM_API_KEY || process.env.CREEM_API_KEY || '',
      VITE_AUTHING_APP_ID: process.env.VITE_AUTHING_APP_ID || process.env.AUTHING_APP_ID || '',
      VITE_AUTHING_HOST: process.env.VITE_AUTHING_HOST || process.env.AUTHING_HOST || '',
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || process.env.API_BASE_URL || '',
      VITE_DEBUG_MODE: process.env.VITE_DEBUG_MODE || process.env.DEBUG_MODE || 'false',
      VITE_LOG_LEVEL: process.env.VITE_LOG_LEVEL || process.env.LOG_LEVEL || 'info'
    };

    // 替换模板中的占位符
    Object.entries(envVars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), value);
    });
    
    // 注入环境变量到meta标签中，供前端JavaScript使用
    const metaTags = Object.entries(envVars)
      .map(([key, value]) => `<meta name="${key}" content="${value}" />`)
      .join('\n    ');
    
    // 在head标签中插入meta标签
    if (html.includes('</head>')) {
      html = html.replace('</head>', `    ${metaTags}\n  </head>`);
    }

    // 添加安全头
    const headers = {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    };

    return {
      statusCode: 200,
      headers,
      body: html
    };

  } catch (error) {
    console.error('配置注入错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      },
      body: 'Internal Server Error'
    };
  }
}; 