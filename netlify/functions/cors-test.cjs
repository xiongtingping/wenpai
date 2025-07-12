/**
 * CORS测试函数
 */
module.exports.handler = async (event, context) => {
  // 动态CORS配置 - 实现您提到的方案
  const allowedOrigins = [
    'https://6872271d9e6c090008ffd9d5--wenpai.netlify.app',
    'https://wenpai.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
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
      statusCode: 200,
      headers,
      body: ''
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'CORS test successful',
      origin: origin,
      isAllowed: isAllowedOrigin,
      allowedOrigins: allowedOrigins,
      timestamp: new Date().toISOString()
    })
  };
}; 