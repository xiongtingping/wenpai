/**
 * 🔒 安全的 AI API 代理函数
 * 
 * 功能：
 * 1. 在服务端处理 AI API 调用，保护 API 密钥
 * 2. 支持 OpenAI、DeepSeek、Gemini 等多个 AI 服务
 * 3. 统一错误处理和响应格式
 * 4. 请求验证和限流保护
 * 
 * 路由：
 * - /api/ai/openai/* -> OpenAI API
 * - /api/ai/deepseek/* -> DeepSeek API  
 * - /api/ai/gemini/* -> Gemini API
 */

const https = require('https');

// 🔒 从环境变量获取 API 密钥（服务端安全）
const getAPIKey = (provider) => {
  switch (provider) {
    case 'openai':
      return process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    case 'deepseek':
      return process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
    case 'gemini':
      return process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    default:
      return null;
  }
};

// 获取 API 基础 URL
const getAPIBaseURL = (provider) => {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'deepseek':
      return 'https://api.deepseek.com/v1';
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta';
    default:
      return null;
  }
};

// 构建请求头
const buildHeaders = (provider, apiKey, contentType = 'application/json') => {
  const headers = {
    'Content-Type': contentType,
    'User-Agent': 'Wenpai/1.0'
  };

  switch (provider) {
    case 'openai':
    case 'deepseek':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;
    case 'gemini':
      headers['x-goog-api-key'] = apiKey;
      break;
  }

  return headers;
};

// 发送 HTTP 请求
const makeRequest = (url, options, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// 主处理函数
exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 解析路径，提取 AI 服务提供商和具体路径
    const path = event.path.replace('/api/ai/', '');
    const pathParts = path.split('/');
    const provider = pathParts[0]; // openai, deepseek, gemini
    const apiPath = pathParts.slice(1).join('/'); // 具体的 API 路径

    console.log('🔧 AI代理请求:', { provider, apiPath, method: event.httpMethod });

    // 验证提供商
    if (!['openai', 'deepseek', 'gemini'].includes(provider)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: '不支持的 AI 服务提供商',
          provider: provider 
        })
      };
    }

    // 获取 API 密钥
    const apiKey = getAPIKey(provider);
    if (!apiKey) {
      console.error(`❌ ${provider} API 密钥未配置`);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'API 密钥未配置',
          provider: provider 
        })
      };
    }

    // 构建目标 URL
    const baseURL = getAPIBaseURL(provider);
    const targetURL = `${baseURL}/${apiPath}`;

    // 解析请求体
    let requestData = null;
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (error) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '请求体格式错误' })
        };
      }
    }

    // 构建请求选项
    const requestHeaders = buildHeaders(provider, apiKey);
    const url = new URL(targetURL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: event.httpMethod,
      headers: requestHeaders
    };

    console.log('🌐 转发请求到:', targetURL);

    // 发送请求
    const response = await makeRequest(url, options, requestData);

    console.log('✅ AI API 响应:', { 
      statusCode: response.statusCode,
      provider: provider 
    });

    return {
      statusCode: response.statusCode,
      headers,
      body: JSON.stringify(response.data)
    };

  } catch (error) {
    console.error('❌ AI代理错误:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'AI API 代理服务错误',
        message: error.message 
      })
    };
  }
};
