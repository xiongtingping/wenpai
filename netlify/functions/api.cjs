/**
 * Netlify函数主入口
 * @param {object} event - 事件对象
 * @param {object} context - 上下文对象
 * @returns {Promise<object>} 响应对象
 */

// 导入usage-count处理器
const { handler: usageCountHandler } = require('./api/usage-count.cjs');
module.exports.handler = async (event, context) => {
  // 动态CORS配置 - 实现您提到的方案
  const allowedOrigins = [
      'https://www.wenpai.xyz',
  'https://wenpai.netlify.app',
  'http://localhost:3000',
    'https://www.wenpai.xyz'
  ];
  
  const origin = event.headers.origin || event.headers.Origin;
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8'
  };

  // 处理预检请求 - 确保OPTIONS得到正确响应
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // 使用204状态码，更符合预检请求的标准
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400' // 缓存预检请求结果24小时
      },
      body: ''
    };
  }

  try {
    // 🔧 处理 /api/config 路径
    const path = event.path || event.rawUrl || '';
    console.log('🔍 API请求调试:', {
      path,
      method: event.httpMethod,
      body: event.body?.substring(0, 200),
      headers: Object.keys(event.headers || {})
    });
    
    if (path.includes('/config')) {
      const { env } = event.queryStringParameters || {};

      // ✅ FIXED: 消除硬编码，完全依赖环境变量
      const config = {
        environment: env || 'production'
      };

      // 🛡️ 验证必需的环境变量
      const requiredEnvVars = {
        'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
        'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
        'AUTHING_APP_ID': process.env.AUTHING_APP_ID,
        'AUTHING_HOST': process.env.AUTHING_HOST,
        'AUTHING_REDIRECT_URI': process.env.AUTHING_REDIRECT_URI
      };

      // 检查缺失的环境变量
      const missingVars = Object.entries(requiredEnvVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingVars.length > 0) {
        console.error('❌ 缺失必需的环境变量:', missingVars);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Server configuration error: Missing required environment variables',
            missingVars: missingVars
          })
        };
      }

      // 只有在环境变量验证通过后才返回配置
      config.supabase = {
        url: process.env.VITE_SUPABASE_URL,
        anonKey: process.env.VITE_SUPABASE_ANON_KEY
      };
      
      config.authing = {
        appId: process.env.AUTHING_APP_ID,
        host: process.env.AUTHING_HOST,
        redirectUri: process.env.AUTHING_REDIRECT_URI
      };
      
      config.features = {
        enhancedPermissions: true,
        subscriptionCheck: true,
        usageLimits: true
      };

      console.log('📋 配置请求:', { env, timestamp: new Date().toISOString() });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          config,
          timestamp: new Date().toISOString()
        })
      };
    }

    // 🔧 处理 /ai/chat 路径 - 修复AI请求路由
    if (path.includes('/ai/chat') || path.includes('ai/chat')) {
      console.log('🔍 AI Chat 请求路径调试:', path, event.body?.substring(0, 200));
      const body = event.body ? JSON.parse(event.body) : {};
      const { provider, model, messages, temperature, maxTokens, userId, prompt, systemPrompt } = body;

      // ✅ 直接使用真实的模型名称，自动识别provider
      let actualProvider = provider;
      let actualModel = model;
      
      if (!actualProvider) {
        // 🎯 智能模型路由识别（按提供商分类）
        if (model?.includes('gpt-4o') && !model.includes('mini')) {
          // GPT-4o 走 OpenAI 原生接口
          actualProvider = 'openai';
        } else if (model?.includes('gpt-4o-mini')) {
          // GPT-4o Mini 走 OpenAI 原生接口  
          actualProvider = 'openai';
        } else if (model?.includes('deepseek')) {
          // 所有 DeepSeek 模型走 DeepSeek 原生接口
          actualProvider = 'deepseek';
        } else if (model?.includes('gpt-5') || 
                   model?.includes('claude') || 
                   model?.includes('llama') || 
                   model?.includes('qwen') || 
                   model?.includes('gemini')) {
          // 其他所有模型走 AIML API
          actualProvider = 'aimlapi';
        } else {
          // 默认降级到 DeepSeek
          actualProvider = 'deepseek';
          actualModel = 'deepseek-chat';
        }
      }
      
      console.log('🔍 AI Chat 模型调用:', {
        provider: actualProvider,
        model: actualModel
      });

      // 构建消息格式：支持两种输入格式
      let requestMessages = messages;
      if (!requestMessages && prompt) {
        // 如果没有messages但有prompt，转换为messages格式
        requestMessages = [];
        if (systemPrompt) {
          requestMessages.push({ role: 'system', content: systemPrompt });
        }
        requestMessages.push({ role: 'user', content: prompt });
      }

      // 调用相应的生成函数 - 🔧 使用标准化后的模型名称
      const requestBody = {
        model: actualModel || 'deepseek-chat',
        messages: requestMessages || [],
        temperature: temperature || 0.7,
        maxTokens: maxTokens || 1000
      };

      // 调用AI服务并转换返回格式
      let result;
      switch (actualProvider) {
        case 'openai':
          result = await generateWithOpenAI(requestBody, headers);
          break;
        case 'deepseek':
          result = await generateWithDeepSeek(requestBody, headers);
          break;
        case 'gemini':
          result = await generateWithGemini(requestBody, headers);
          break;
        case 'aimlapi':
          result = await generateWithAimlapi(requestBody, headers);
          break;
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Unknown provider' })
          };
      }

      // 转换返回格式为前端期望的格式
      if (result.statusCode === 200) {
        const responseData = JSON.parse(result.body);
        if (responseData.success && responseData.data) {
          const aiData = responseData.data;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              content: aiData.choices?.[0]?.message?.content || aiData.content || '',
              model: actualModel, // 🔧 返回实际使用的模型名称
              usage: aiData.usage,
              success: true
            })
          };
        }
      }
      
      return result;
    }

    const body = event.body ? JSON.parse(event.body) : {};
    const { provider, action, platform, model, messages, ...requestBody } = body;

    // ✅ FIXED: 确保messages和model在requestBody中可用
    requestBody.messages = messages;
    requestBody.model = model;

    // 🔧 新增：直接AI调用支持（无需action参数，通过model和messages识别）
    if (model && messages && !action) {
      console.log('🔍 直接AI调用检测:', { provider, model });
      
      // 自动识别provider
      let actualProvider = provider;
      let actualModel = model;
      
      if (!actualProvider) {
        // 🎯 智能模型路由识别（按提供商分类）
        if (model?.includes('gpt-4o') && !model.includes('mini')) {
          // GPT-4o 走 OpenAI 原生接口
          actualProvider = 'openai';
        } else if (model?.includes('gpt-4o-mini')) {
          // GPT-4o Mini 走 OpenAI 原生接口  
          actualProvider = 'openai';
        } else if (model?.includes('deepseek')) {
          // 所有 DeepSeek 模型走 DeepSeek 原生接口
          actualProvider = 'deepseek';
        } else if (model?.includes('gpt-5') || 
                   model?.includes('claude') || 
                   model?.includes('llama') || 
                   model?.includes('qwen') || 
                   model?.includes('gemini')) {
          // 其他所有模型走 AIML API
          actualProvider = 'aimlapi';
        } else {
          // 默认降级到 DeepSeek
          actualProvider = 'deepseek';
          actualModel = 'deepseek-chat';
        }
      }
      
      const aiRequestBody = {
        model: actualModel || 'deepseek-chat',
        messages: messages || [],
        temperature: requestBody.temperature || 0.7,
        maxTokens: requestBody.maxTokens || 1000
      };

      // 调用AI服务
      let result;
      switch (actualProvider) {
        case 'openai':
          result = await generateWithOpenAI(aiRequestBody, headers);
          break;
        case 'deepseek':
          result = await generateWithDeepSeek(aiRequestBody, headers);
          break;
        case 'gemini':
          result = await generateWithGemini(aiRequestBody, headers);
          break;
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Unknown provider' })
          };
      }

      // 转换返回格式为统一格式
      if (result.statusCode === 200) {
        const responseData = JSON.parse(result.body);
        if (responseData.success && responseData.data) {
          const aiData = responseData.data;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              content: aiData.choices?.[0]?.message?.content || aiData.content || '',
              model: actualModel,
              usage: aiData.usage,
              success: true
            })
          };
        }
      }
      
      return result;
    }

    // 根据provider和action路由到不同的处理函数
    if (action === 'status') {
      switch (provider) {
        case 'openai':
          return await checkOpenAIStatus(headers);
        case 'deepseek':
          return await checkDeepSeekStatus(headers);
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Unknown provider' })
          };
      }
    }

    // 处理热点话题API请求
    if (action === 'hot-topics') {
      if (platform) {
        return await getHotTopicsByPlatform(platform, headers);
      } else {
        return await getAggregatedHotTopics(headers);
      }
    }

    // 处理AI生成请求
    if (action === 'generate') {
      switch (provider) {
        case 'openai':
          return await generateWithOpenAI(requestBody, headers);
        case 'deepseek':
          return await generateWithDeepSeek(requestBody, headers);
        case 'gemini':
          return await generateWithGemini(requestBody, headers);
        case 'aimlapi':
          return await generateWithAimlapi(requestBody, headers);
        default:
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Unknown provider' })
          };
      }
    }

    // 处理图像生成请求
    if (action === 'generate-image') {
      return await generateImage(requestBody, headers);
    }

    // 处理推荐奖励请求
    if (action === 'referral-reward') {
      return await handleReferralReward(requestBody, headers);
    }

    // 处理推荐统计请求
    if (action === 'referral-stats') {
      return await getReferralStats(requestBody, headers);
    }

    // 统一使用次数统计与消费（直接调用 usage-count 处理器）
    if (action === 'user-usage' && requestBody?.userId) {
      // 构建模拟的event对象来调用usage-count处理器
      const usageEvent = {
        httpMethod: 'GET',
        path: `/user/usage/${requestBody.userId}`,
        headers: event.headers,
        body: null
      };
      return await usageCountHandler(usageEvent, context);
    }
    if (action === 'consume-usage' && requestBody?.userId) {
      // 构建模拟的event对象来调用usage-count处理器
      const usageEvent = {
        httpMethod: 'POST',
        path: '/consume-usage',
        headers: event.headers,
        body: JSON.stringify({ userId: requestBody.userId, amount: requestBody.amount || 1 })
      };
      return await usageCountHandler(usageEvent, context);
    }

    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({ error: 'Not implemented' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};

/**
 * 获取指定平台的热点话题
 */
async function getHotTopicsByPlatform(platform, headers) {
  try {
    const response = await fetch(`https://api-hot.imsyy.top/${platform}`, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      },
      timeout: 8000
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Failed to fetch ${platform} data: ${error.message}` 
      })
    };
  }
}

/**
 * 获取聚合的热点话题数据
 */
async function getAggregatedHotTopics(headers) {
  try {
    // 获取主要平台的数据
    const mainPlatforms = ['weibo', 'zhihu', 'bilibili', 'douyin'];
    const platformData = {};
    
    for (const platform of mainPlatforms) {
      try {
        const response = await fetch(`https://api-hot.imsyy.top/${platform}`, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Accept': 'application/json'
          },
          timeout: 8000
        });

        if (response.ok) {
          const data = await response.json();
          if (data.code === 200 && data.data) {
            // 为每个数据项添加平台标识
            const itemsWithPlatform = data.data.map(item => ({
              ...item,
              platform: platform
            }));
            platformData[platform] = itemsWithPlatform;
          } else {
            platformData[platform] = [];
          }
        } else {
          platformData[platform] = [];
        }
      } catch (error) {
        console.error(`Failed to fetch ${platform} data:`, error);
        platformData[platform] = [];
      }
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        code: 200,
        msg: 'success',
        data: platformData
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Failed to fetch aggregated hot topics: ${error.message}` 
      })
    };
  }
}

/**
 * 获取所有平台的热点话题
 */
async function getAllHotTopics(headers) {
  try {
    const response = await fetch('https://api-hot.imsyy.top/all', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
      },
      timeout: 8000
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: `Failed to fetch all hot topics: ${error.message}` 
      })
    };
  }
}

/**
 * 检查OpenAI服务状态
 */
async function checkOpenAIStatus(headers) {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: false,
          message: 'OpenAI API key not configured'
        })
      };
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      timeout: 5000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: response.ok,
        message: response.ok ? 'OpenAI API is available' : 'OpenAI API is not available'
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: false,
        message: `OpenAI API error: ${error.message}`
      })
    };
  }
}

/**
 * 检查DeepSeek服务状态
 */
async function checkDeepSeekStatus(headers) {
  try {
    const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          available: false,
          message: 'DeepSeek API key not configured'
        })
      };
    }

    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      timeout: 5000
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: response.ok,
        message: response.ok ? 'DeepSeek API is available' : 'DeepSeek API is not available'
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: false,
        message: `DeepSeek API error: ${error.message}`
      })
    };
  }
}

/**
 * 使用OpenAI生成内容
 */
async function generateWithOpenAI(requestBody, headers) {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        model: requestBody.model || 'gpt-4o',
        messages: requestBody.messages,
        temperature: requestBody.temperature || 0.7,
        max_tokens: requestBody.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ✅ FIXED: 提取并清理AI生成的内容，移除元数据
    let cleanContent = '';
    if (data.choices && data.choices[0]?.message?.content) {
      cleanContent = data.choices[0].message.content;

      // 清理内容：移除前后多余的换行符和空白字符
      cleanContent = cleanContent.trim();

      // 移除开头和结尾的多个连续换行符
      cleanContent = cleanContent.replace(/^\n+/, '').replace(/\n+$/, '');

      // 标准化换行符（将多个连续换行符压缩为最多两个）
      cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');

      console.log('🧹 OpenAI内容清理完成，清理后长度:', cleanContent.length);
    }

    // 返回清理后的纯净内容，而不是完整的API响应
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: cleanContent, // 直接返回清理后的内容
        model: requestBody.model || 'gpt-4o',
        usage: data.usage // 保留使用统计用于计费
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * 使用DeepSeek生成内容
 */
async function generateWithDeepSeek(requestBody, headers) {
  try {
    const apiKey = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
    console.log('🔑 DeepSeek API Key 检查:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 8) || 'N/A'
    });

    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // ✅ 直接使用实际的模型名称，无需映射
    let apiModel = requestBody.model || 'deepseek-chat';

    // ✅ FIXED: 确保messages数组存在且不为空
    let messages = requestBody.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('⚠️ messages为空，使用默认消息结构');
      messages = [{ role: 'user', content: 'Hello' }];
    }

    console.log('🔧 DeepSeek模型调用:', {
      模型名称: apiModel,
      消息数量: messages.length,
      消息内容: messages.map(m => ({ role: m.role, contentLength: m.content?.length || 0 }))
    });

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        model: apiModel,
        messages: messages,
        temperature: requestBody.temperature || 0.7,
        max_tokens: requestBody.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API错误响应:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      } catch (parseError) {
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }
    }

    const responseText = await response.text();
    console.log('🔍 DeepSeek原始响应长度:', responseText.length);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ DeepSeek JSON解析成功');
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError, '原始响应前500字符:', responseText.substring(0, 500));
      throw new Error('DeepSeek响应格式错误，无法解析JSON');
    }

    // ✅ FIXED: 提取并清理AI生成的内容，移除元数据
    let cleanContent = '';
    if (data.choices && data.choices[0]?.message?.content) {
      cleanContent = data.choices[0].message.content;

      // 清理内容：移除前后多余的换行符和空白字符
      cleanContent = cleanContent.trim();

      // 移除开头和结尾的多个连续换行符
      cleanContent = cleanContent.replace(/^\n+/, '').replace(/\n+$/, '');

      // 标准化换行符（将多个连续换行符压缩为最多两个）
      cleanContent = cleanContent.replace(/\n{3,}/g, '\n\n');

      console.log('🧹 内容清理完成，清理后长度:', cleanContent.length);
    }

    // 返回清理后的纯净内容，而不是完整的API响应
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: cleanContent, // 直接返回清理后的内容
        model: apiModel,
        usage: data.usage // 保留使用统计用于计费
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * 使用Gemini生成内容
 */
async function generateWithGemini(requestBody, headers) {
  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        contents: requestBody.messages.map(msg => ({
          parts: [{ text: msg.content }]
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * 使用 AIML API 生成内容
 */
async function generateWithAimlapi(requestBody, headers) {
  try {
    const apiKey = process.env.VITE_AIMLAPI_API_KEY || process.env.AIMLAPI_API_KEY;
    console.log('🔑 AIML API Key 检查:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 8) || 'N/A'
    });
    
    if (!apiKey) {
      throw new Error('AIML API key not configured');
    }

    // 确保messages数组存在且不为空
    let messages = requestBody.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('⚠️ messages为空，使用默认消息结构');
      messages = [{ role: 'user', content: 'Hello' }];
    }

    // 🎯 模型名称映射：将我们配置的模型名映射到AIML API实际支持的模型ID
    const modelMapping = {
      // GPT-5 系列
      'gpt-5': 'openai/gpt-5-2025-08-07',
      'gpt-5-mini': 'openai/gpt-5-mini-2025-08-07', 
      'gpt-5-nano': 'openai/gpt-5-nano-2025-08-07',
      
      // Claude 系列
      'claude-3.5-sonnet': 'claude-3-5-sonnet-20241022',
      
      // Gemini 系列  
      'gemini-2.0-flash': 'google/gemini-2.0-flash-exp',
      'gemini-2.5-flash': 'google/gemini-2.5-flash',
      'gemini-1.5-flash-8b': 'google/gemini-1.5-flash-8b',
      
      // Meta Llama 系列
      'llama-3.3-70b-instruct': 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      
      // Qwen 系列（使用实际的alibaba前缀）
      'qwen-max': 'alibaba/qwen-max',
      'qwen-plus': 'alibaba/qwen-plus', 
      'qwen-turbo': 'alibaba/qwen-turbo',
      
      // DeepSeek 系列（使用实际支持的模型）
      'deepseek-v3': 'deepseek/deepseek-chat-v3.1',
      'deepseek-r1': 'deepseek/deepseek-reasoner-v3.1'
    };

    const actualModel = modelMapping[requestBody.model] || requestBody.model || 'claude-3-5-sonnet-20241022';
    
    console.log('🔄 模型映射:', {
      输入模型: requestBody.model,
      实际模型: actualModel
    });

    const response = await fetch('https://api.aimlapi.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        model: actualModel,
        messages: messages,
        temperature: requestBody.temperature || 0.7,
        max_tokens: requestBody.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 提取并清理AI生成的内容
    let cleanContent = '';
    if (data.choices && data.choices[0]?.message?.content) {
      cleanContent = data.choices[0].message.content;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          choices: [{
            message: {
              content: cleanContent,
              role: 'assistant'
            }
          }]
        }
      })
    };
  } catch (error) {
    console.error('❌ AIML API调用错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
}

/**
 * 生成图像
 */
async function generateImage(requestBody, headers) {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        prompt: requestBody.prompt,
        n: requestBody.n || 1,
        size: requestBody.size || '512x512',
        response_format: requestBody.response_format || 'url'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: data
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
} 