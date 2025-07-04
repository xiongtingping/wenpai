/**
 * Netlify函数 - 处理API调用
 */
exports.handler = async function(event, context) {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
          path: path
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
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
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

/**
 * 处理OpenAI API请求
 */
async function handleOpenAIRequest(body, headers) {
  const { prompt, model = 'gpt-4o' } = body;

  if (!prompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Prompt is required' })
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自OpenAI (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为未配置OPENAI_API_KEY。`,
        model: model,
        provider: 'openai',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: data.choices[0]?.message?.content || 'No response content',
        model: model,
        provider: 'openai',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自OpenAI (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为API调用失败：${error.message}`,
        model: model,
        provider: 'openai',
        timestamp: new Date().toISOString()
      })
    };
  }
}

/**
 * 处理DeepSeek API请求
 */
async function handleDeepSeekRequest(body, headers) {
  const { prompt, model = 'deepseek-chat' } = body;

  if (!prompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Prompt is required' })
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自DeepSeek (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为未配置DEEPSEEK_API_KEY。`,
        model: model,
        provider: 'deepseek',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'DeepSeek API request failed');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: data.choices[0]?.message?.content || 'No response content',
        model: model,
        provider: 'deepseek',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自DeepSeek (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为API调用失败：${error.message}`,
        model: model,
        provider: 'deepseek',
        timestamp: new Date().toISOString()
      })
    };
  }
}

/**
 * 处理Gemini API请求
 */
async function handleGeminiRequest(body, headers) {
  const { prompt, model = 'gemini-pro' } = body;

  if (!prompt) {
    return {
      statusCode: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Prompt is required' })
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自Gemini (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为未配置GEMINI_API_KEY。`,
        model: model,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
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
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API request failed');
    }

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: data.candidates[0]?.content?.parts[0]?.text || 'No response content',
        model: model,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        content: `这是来自Gemini (${model}) 的模拟响应：\n\n${prompt}\n\n这是一个模拟的AI响应，因为API调用失败：${error.message}`,
        model: model,
        provider: 'gemini',
        timestamp: new Date().toISOString()
      })
    };
  }
}

/**
 * 检查OpenAI状态
 */
async function checkOpenAIStatus(headers) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in your environment variables',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          available: true,
          message: 'OpenAI API is available',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      throw new Error('API key validation failed');
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'OpenAI API is not available',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}

/**
 * 检查DeepSeek状态
 */
async function checkDeepSeekStatus(headers) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'DeepSeek API key not configured',
        message: 'Please configure DEEPSEEK_API_KEY in your environment variables',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          available: true,
          message: 'DeepSeek API is available',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      throw new Error('API key validation failed');
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'DeepSeek API is not available',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}

/**
 * 检查Gemini状态
 */
async function checkGeminiStatus(headers) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'Gemini API key not configured',
        message: 'Please configure GEMINI_API_KEY in your environment variables',
        timestamp: new Date().toISOString()
      })
    };
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (response.ok) {
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          available: true,
          message: 'Gemini API is available',
          timestamp: new Date().toISOString()
        })
      };
    } else {
      throw new Error('API key validation failed');
    }
  } catch (error) {
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        available: false,
        error: 'Gemini API is not available',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
} 