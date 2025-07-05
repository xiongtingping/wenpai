/**
 * Netlify函数 - 处理API调用
 * 支持OpenAI、DeepSeek、Gemini三种AI提供商
 */

/**
 * 处理OpenAI API请求
 */
async function handleOpenAIRequest(body, headers) {
  const { prompt, messages, model = 'gpt-4o', temperature = 0.7, maxTokens = 2000 } = body;

  // 支持两种格式：prompt字符串或messages数组
  let userPrompt = prompt;
  if (!userPrompt && messages && Array.isArray(messages)) {
    // 从messages数组中提取用户消息
    const userMessage = messages.find(msg => msg.role === 'user');
    if (userMessage) {
      userPrompt = userMessage.content;
    }
  }

  if (!userPrompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Prompt is required or messages array must contain user message' 
      })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'OPENAI_API_KEY not configured',
        message: '请在Netlify环境变量中配置OPENAI_API_KEY'
      })
    };
  }

  try {
    console.log(`调用OpenAI API: ${model}`);
    
    // 构建API请求体
    const apiRequestBody = {
      model: model,
      max_tokens: maxTokens,
      temperature: temperature
    };

    // 如果有完整的messages数组，直接使用；否则构建简单的消息
    if (messages && Array.isArray(messages)) {
      apiRequestBody.messages = messages;
    } else {
      apiRequestBody.messages = [
        {
          role: 'user',
          content: userPrompt
        }
      ];
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiRequestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI API错误: ${response.status}`);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI API返回空响应');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          choices: [
            {
              message: {
                content: content
              }
            }
          ],
          usage: data.usage,
          model: model
        },
        model: model,
        provider: 'openai',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('OpenAI API错误:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'OpenAI API调用失败',
        message: error.message
      })
    };
  }
}

/**
 * 处理DeepSeek API请求
 */
async function handleDeepSeekRequest(body, headers) {
  const { prompt, messages, model = 'deepseek-v2.5', temperature = 0.7, maxTokens = 2000 } = body;

  // 支持两种格式：prompt字符串或messages数组
  let userPrompt = prompt;
  if (!userPrompt && messages && Array.isArray(messages)) {
    // 从messages数组中提取用户消息
    const userMessage = messages.find(msg => msg.role === 'user');
    if (userMessage) {
      userPrompt = userMessage.content;
    }
  }

  if (!userPrompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Prompt is required or messages array must contain user message' 
      })
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'DEEPSEEK_API_KEY not configured',
        message: '请在Netlify环境变量中配置DEEPSEEK_API_KEY'
      })
    };
  }

  try {
    console.log(`调用DeepSeek API: ${model}`);
    
    // 构建API请求体
    const apiRequestBody = {
      model: model,
      max_tokens: maxTokens,
      temperature: temperature
    };

    // 如果有完整的messages数组，直接使用；否则构建简单的消息
    if (messages && Array.isArray(messages)) {
      apiRequestBody.messages = messages;
    } else {
      apiRequestBody.messages = [
        {
          role: 'user',
          content: userPrompt
        }
      ];
    }
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiRequestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `DeepSeek API错误: ${response.status}`);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek API返回空响应');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          choices: [
            {
              message: {
                content: content
              }
            }
          ],
          usage: data.usage,
          model: model
        },
        model: model,
        provider: 'deepseek',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('DeepSeek API错误:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'DeepSeek API调用失败',
        message: error.message
      })
    };
  }
}

/**
 * 处理Gemini API请求
 */
async function handleGeminiRequest(body, headers) {
  const { prompt, messages, model = 'gemini-pro', temperature = 0.7, maxTokens = 2000 } = body;

  // 支持两种格式：prompt字符串或messages数组
  let userPrompt = prompt;
  if (!userPrompt && messages && Array.isArray(messages)) {
    // 从messages数组中提取用户消息
    const userMessage = messages.find(msg => msg.role === 'user');
    if (userMessage) {
      userPrompt = userMessage.content;
    }
  }

  if (!userPrompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        success: false,
        error: 'Prompt is required or messages array must contain user message' 
      })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'GEMINI_API_KEY not configured',
        message: '请在Netlify环境变量中配置GEMINI_API_KEY'
      })
    };
  }

  try {
    console.log(`调用Gemini API: ${model}`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userPrompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Gemini API错误: ${response.status}`);
    }

    const content = data.candidates[0]?.content?.parts[0]?.text;
    if (!content) {
      throw new Error('Gemini API返回空响应');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        data: {
          choices: [
            {
              message: {
                content: content
              }
            }
          ],
          usage: data.usageMetadata,
          model: model
        },
        model: model,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Gemini API错误:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Gemini API调用失败',
        message: error.message
      })
    };
  }
}

/**
 * 检查OpenAI API状态
 */
async function checkOpenAIStatus(headers) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'OPENAI_API_KEY not configured',
        message: '请在Netlify环境变量中配置OPENAI_API_KEY'
      })
    };
  }

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
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
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
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

/**
 * 检查DeepSeek API状态
 */
async function checkDeepSeekStatus(headers) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'DEEPSEEK_API_KEY not configured',
        message: '请在Netlify环境变量中配置DEEPSEEK_API_KEY'
      })
    };
  }

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.deepseek.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
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
    console.error('DeepSeek状态检查错误:', error);
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'DeepSeek API不可用',
        message: error.message,
        lastChecked: new Date().toISOString()
      })
    };
  }
}

/**
 * 检查Gemini API状态
 */
async function checkGeminiStatus(headers) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'GEMINI_API_KEY not configured',
        message: '请在Netlify环境变量中配置GEMINI_API_KEY'
      })
    };
  }

  try {
    const startTime = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      method: 'GET'
    });
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
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
    console.error('Gemini状态检查错误:', error);
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        available: false,
        error: 'Gemini API不可用',
        message: error.message,
        lastChecked: new Date().toISOString()
      })
    };
  }
}

/**
 * Netlify函数主处理器
 */
export const handler = async function(event, context) {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    console.log(`API请求: ${event.httpMethod} ${path}`);

    // 根据路径处理不同的API
    if (path.includes('/api/basic')) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Netlify API is working',
          timestamp: new Date().toISOString(),
          method: event.httpMethod,
          path: path,
          version: '2.0.0'
        })
      };
    }

    if (path.includes('/api/debug-env')) {
      const openaiKey = process.env.OPENAI_API_KEY;
      const deepseekKey = process.env.DEEPSEEK_API_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Environment variables check',
          timestamp: new Date().toISOString(),
          openai_key_configured: !!openaiKey,
          openai_key_prefix: openaiKey ? openaiKey.substring(0, 7) + '...' : 'not set',
          deepseek_key_configured: !!deepseekKey,
          deepseek_key_prefix: deepseekKey ? deepseekKey.substring(0, 7) + '...' : 'not set',
          gemini_key_configured: !!geminiKey,
          gemini_key_prefix: geminiKey ? geminiKey.substring(0, 7) + '...' : 'not set'
        })
      };
    }

    if (path.includes('/api/proxy/openai')) {
      return await handleOpenAIRequest(body, headers);
    }

    if (path.includes('/api/proxy/deepseek')) {
      return await handleDeepSeekRequest(body, headers);
    }

    if (path.includes('/api/proxy/gemini')) {
      return await handleGeminiRequest(body, headers);
    }

    if (path.includes('/api/status/openai')) {
      return await checkOpenAIStatus(headers);
    }

    if (path.includes('/api/status/deepseek')) {
      return await checkDeepSeekStatus(headers);
    }

    if (path.includes('/api/status/gemini')) {
      return await checkGeminiStatus(headers);
    }

    // 默认响应
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Netlify Function API',
        path: path,
        method: event.httpMethod,
        timestamp: new Date().toISOString(),
        availableEndpoints: [
          '/api/basic',
          '/api/proxy/openai',
          '/api/proxy/deepseek', 
          '/api/proxy/gemini',
          '/api/status/openai',
          '/api/status/deepseek',
          '/api/status/gemini'
        ]
      })
    };

  } catch (error) {
    console.error('API错误:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 