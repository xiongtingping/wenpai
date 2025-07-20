/**
 * Authing 回调处理函数
 * 处理 Authing 登录/注册回调
 */

module.exports.handler = async (event, context) => {
  // CORS 配置
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.netlify.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:8888'
  ];
  
  const origin = event.headers.origin || event.headers.Origin;
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Vary': 'Origin',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }

  try {
    console.log('🔐 Authing 回调处理开始');
    console.log('📋 请求信息:', {
      method: event.httpMethod,
      path: event.path,
      queryStringParameters: event.queryStringParameters,
      headers: event.headers
    });

    // 获取查询参数
    const queryParams = event.queryStringParameters || {};
    const { code, state, error, error_description } = queryParams;

    // 检查是否有错误
    if (error) {
      console.error('❌ Authing 回调错误:', { error, error_description });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Authing 认证失败',
          details: error_description || error
        })
      };
    }

    // 检查授权码
    if (!code) {
      console.error('❌ 缺少授权码');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: '缺少授权码',
          message: 'Authing 回调缺少必要的授权码'
        })
      };
    }

    console.log('✅ 收到有效的授权码:', code);

    // 构建重定向 URL
    const redirectUrl = new URL(origin || 'http://localhost:5177');
    redirectUrl.pathname = '/callback';
    redirectUrl.searchParams.set('code', code);
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    console.log('🔄 重定向到:', redirectUrl.toString());

    // 返回重定向响应
    return {
      statusCode: 302,
      headers: {
        'Location': redirectUrl.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: ''
    };

  } catch (error) {
    console.error('❌ Authing 回调处理失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '内部服务器错误',
        message: error.message
      })
    };
  }
}; 