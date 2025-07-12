/**
 * 开发环境API服务器
 * 真实AI服务代理，用于本地开发测试
 */

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import FormData from 'form-data';

const app = express();
const PORT = 8888;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 强制使用真实AI服务，不使用任何模拟数据
const USE_MOCK = false;

// 配置代理
const proxyUrl = process.env.HTTP_PROXY || process.env.http_proxy || 'http://127.0.0.1:7890';
const proxyAgent = new HttpsProxyAgent(proxyUrl);

// 创建带代理的fetch函数
const fetchWithProxy = (url, options = {}) => {
  return fetch(url, {
    ...options,
    agent: proxyAgent
  });
};

/**
 * 处理OpenAI图像生成请求
 * @param {object} body - 请求体，包含 prompt、n、size、response_format、reference_image 等参数
 * @returns {Promise<object>} - 返回API响应对象
 */
async function handleOpenAIImageGeneration(body) {
  const { prompt, n = 1, size = '512x512', response_format = 'url', reference_image } = body;

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        success: false,
        error: 'Prompt is required for image generation' 
      })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'OPENAI_API_KEY not configured',
        message: '请在环境变量中配置OPENAI_API_KEY'
      })
    };
  }

  try {
    console.log(`调用OpenAI图像生成API: ${prompt.substring(0, 50)}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    let apiUrl = 'https://api.openai.com/v1/images/generations';
    let fetchOptions;

    // 有 reference_image 时，使用 multipart/form-data
    if (reference_image) {
      apiUrl = 'https://api.openai.com/v1/images/edits';
      // 处理 base64 字符串，去掉前缀
      const base64Data = reference_image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      const form = new FormData();
      form.append('image', imageBuffer, { filename: 'reference.png', contentType: 'image/png' });
      form.append('prompt', prompt);
      form.append('n', Math.min(n, 4));
      form.append('size', size);
      form.append('response_format', response_format);
      fetchOptions = {
        method: 'POST',
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${apiKey}`
        },
        body: form,
        signal: controller.signal,
        agent: proxyAgent
      };
      console.log('使用图像编辑API，参考图片长度:', reference_image.length);
    } else {
      // 无 reference_image，走 application/json
      fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt,
          n: Math.min(n, 4),
          size,
          response_format
        }),
        signal: controller.signal,
        agent: proxyAgent
      };
    }

    const response = await fetch(apiUrl, fetchOptions);
    clearTimeout(timeoutId);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI图像生成API错误: ${response.status}`);
    }

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('OpenAI图像生成API返回空响应');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: {
          images: data.data.map(item => ({
            url: item.url,
            revised_prompt: item.revised_prompt
          })),
          created: data.created
        },
        provider: 'openai',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('OpenAI图像生成API错误:', error);
    
    // 处理超时错误
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        body: JSON.stringify({
          success: false,
          error: '请求超时',
          message: 'OpenAI图像生成API请求超时，请稍后重试',
          details: error.message
        })
      };
    }
    
    // 处理网络错误
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          error: '网络连接错误',
          message: '无法连接到OpenAI API，请检查网络连接或配置代理',
          details: error.message
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'OpenAI图像生成API调用失败',
        message: error.message
      })
    };
  }
}

/**
 * 检查OpenAI API状态
 */
async function checkOpenAIStatus() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'OPENAI_API_KEY not configured',
        message: '请在环境变量中配置OPENAI_API_KEY'
      })
    };
  }

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

    const response = await fetchWithProxy('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          available: true,
          responseTime: responseTime,
          lastChecked: new Date().toISOString()
        })
      };
    } else {
      throw new Error(`API状态检查失败: ${response.status}`);
    }
  } catch (error) {
    console.error('OpenAI状态检查错误:', error);
    
    // 处理超时错误
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        body: JSON.stringify({
          success: false,
          available: false,
          error: '请求超时',
          message: 'OpenAI API状态检查超时',
          lastChecked: new Date().toISOString()
        })
      };
    }
    
    // 处理网络错误
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: false,
          available: false,
          error: '网络连接错误',
          message: '无法连接到OpenAI API，请检查网络连接或配置代理',
          details: error.message,
          lastChecked: new Date().toISOString()
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'OpenAI API不可用',
        message: error.message,
        lastChecked: new Date().toISOString()
      })
    };
  }
}

// API路由处理函数
async function handleApiRequest(req, res) {
  try {
    // 对于GET请求，从查询参数获取数据；对于POST请求，从body获取数据
    const requestData = req.method === 'GET' ? req.query : req.body;
    const { provider, action, ...requestBody } = requestData;

    // 根据provider和action路由到不同的处理函数
    if (action === 'status') {
      switch (provider) {
        case 'openai':
          const statusResult = await checkOpenAIStatus();
          res.status(statusResult.statusCode).send(JSON.parse(statusResult.body));
          break;
        default:
          res.status(400).json({
            success: false,
            error: '不支持的provider'
          });
      }
    } else if (action === 'generate-image') {
      switch (provider) {
        case 'openai':
          const imageResult = await handleOpenAIImageGeneration(requestBody);
          res.status(imageResult.statusCode).send(JSON.parse(imageResult.body));
          break;
        default:
          res.status(400).json({
            success: false,
            error: '图像生成仅支持OpenAI'
          });
      }
    } else {
      // 默认返回API信息
      res.status(200).json({
        success: true,
        message: 'AI API代理服务',
        availableProviders: ['openai'],
        availableActions: ['status', 'generate-image'],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('API处理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
}

// 支持GET和POST请求
app.get('/.netlify/functions/api', handleApiRequest);
app.post('/.netlify/functions/api', handleApiRequest);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 开发API服务器运行在 http://localhost:${PORT}`);
  console.log(`📡 API端点: http://localhost:${PORT}/.netlify/functions/api`);
  console.log(`🔑 请确保设置了 OPENAI_API_KEY 环境变量`);
  console.log(`🤖 已启用真实AI服务，所有请求将调用OpenAI API生成真实内容`);
  console.log(`🌐 代理配置: ${proxyUrl}`);
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发API服务器...');
  process.exit(0);
}); 