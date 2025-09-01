/**
 * BufPay API 代理 Netlify Function
 * 解决CORS跨域问题
 */

exports.handler = async (event, context) => {
  console.log('BufPay代理请求:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  });

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // 提取路由参数
    const path = event.path.replace('/.netlify/functions/bufpay-proxy', '');
    
    let targetUrl;
    if (path.includes('/pay')) {
      targetUrl = 'https://bufpay.com/api/pay/107628';
    } else if (path.includes('/query')) {
      targetUrl = 'https://bufpay.com/api/query';
    } else {
      targetUrl = 'https://bufpay.com/api/pay/107628'; // 默认支付接口
    }

    console.log('代理目标URL:', targetUrl);

    // 代理请求到BufPay
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': event.headers['content-type'] || 'application/x-www-form-urlencoded',
        'User-Agent': 'WenPai-Netlify-Proxy/1.0'
      },
      body: event.body
    });

    console.log('BufPay响应状态:', response.status);
    
    // 获取响应内容
    const contentType = response.headers.get('content-type');
    console.log('BufPay响应类型:', contentType);

    let responseBody;
    if (contentType && contentType.includes('text/html')) {
      responseBody = await response.text();
      console.log('BufPay返回HTML长度:', responseBody.length);
    } else {
      responseBody = await response.text();
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': contentType || 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: responseBody
    };

  } catch (error) {
    console.error('BufPay代理错误:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Proxy error', 
        message: error.message 
      })
    };
  }
};