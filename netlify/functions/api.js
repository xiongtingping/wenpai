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
      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          content: `这是来自OpenAI的模拟响应：\n\n${body.prompt || '无提示词'}\n\n这是一个模拟的AI响应，用于测试目的。`,
          model: body.model || 'gpt-4o',
          provider: 'openai',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (path.includes('/api/status/openai')) {
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