/**
 * 错误报告处理函数
 * 接收前端错误报告并记录到日志
 */

exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' }),
    };
  }

  try {
    // 只接受POST请求
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // 解析请求体
    const requestBody = JSON.parse(event.body || '{}');
    const {
      error,
      errorInfo,
      userAgent,
      url,
      timestamp,
      userId,
      sessionId,
      componentStack,
      errorBoundary,
    } = requestBody;

    // 构建错误日志
    const errorLog = {
      timestamp: timestamp || new Date().toISOString(),
      error: {
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        name: error?.name || 'Error',
      },
      errorInfo: errorInfo || {},
      context: {
        userAgent: userAgent || event.headers['user-agent'] || 'Unknown',
        url: url || event.headers.referer || 'Unknown',
        userId: userId || 'anonymous',
        sessionId: sessionId || 'unknown',
        componentStack: componentStack || '',
        errorBoundary: errorBoundary || false,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'production',
        functionName: context.functionName,
        requestId: context.awsRequestId,
      },
    };

    // 记录错误到控制台（Netlify会自动收集这些日志）
    console.error('🚨 前端错误报告:', JSON.stringify(errorLog, null, 2));

    // 在生产环境中，可以添加额外的错误处理逻辑
    // 例如：发送到外部错误追踪服务、数据库记录等
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成Sentry、LogRocket等错误追踪服务
      console.log('📊 错误已记录到生产环境日志系统');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Error report received',
        timestamp: errorLog.timestamp,
        requestId: context.awsRequestId,
      }),
    };

  } catch (parseError) {
    console.error('❌ 错误报告处理失败:', parseError);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid request body',
        details: parseError.message,
      }),
    };
  }
};
