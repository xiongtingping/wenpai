/**
 * BufPay API 代理 Netlify Function
 * 解决CORS跨域问题
 */

exports.handler = async (event, context) => {
  console.log('BufPay代理请求:', {
    method: event.httpMethod,
    path: event.path,
    rawUrl: event.rawUrl,
    queryStringParameters: event.queryStringParameters
  });

  // 支持POST、GET和OPTIONS请求
  if (!['POST', 'GET', 'OPTIONS'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // 检查查询参数决定目标URL
    const queryParams = event.queryStringParameters || {};
    let targetUrl = 'https://bufpay.com/api/pay/107628';
    
    if (queryParams.query) {
      // 查询支付状态
      targetUrl = `https://bufpay.com/api/query/${queryParams.query}`;
      console.log('查询支付状态:', queryParams.query);
    } else {
      // 创建支付订单
      console.log('创建支付订单');
      console.log('接收到的请求体长度:', event.body ? event.body.length : 0);
      console.log('Content-Type:', event.headers['content-type']);
      
      // 记录请求格式（不记录敏感内容）
      if (event.body && event.headers['content-type'] && event.headers['content-type'].includes('application/x-www-form-urlencoded')) {
        console.log('检测到URL编码格式，参数数量:', event.body.split('&').length);
      }
    }
    
    console.log('目标URL:', targetUrl);

    console.log('代理目标URL:', targetUrl);

    // 代理请求到BufPay
    const headers = {
      'User-Agent': 'WenPai-Netlify-Proxy/1.0'
    };
    
    const fetchOptions = {
      method: event.httpMethod,
      headers
    };
    
    // 只有POST请求才设置Content-Type和body
    if (event.httpMethod === 'POST') {
      // 设置正确的Content-Type
      if (event.headers['content-type']) {
        headers['Content-Type'] = event.headers['content-type'];
      } else {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
      fetchOptions.body = event.body;
      console.log('请求头设置:', headers);
    }
    
    const response = await fetch(targetUrl, fetchOptions);

    console.log('BufPay响应状态:', response.status);
    
    // 获取响应内容
    const contentType = response.headers.get('content-type');
    console.log('BufPay响应类型:', contentType);

    let responseBody;
    let finalContentType = contentType || 'application/json';

    if (contentType && contentType.includes('text/html')) {
      responseBody = await response.text();
      console.log('BufPay返回HTML长度:', responseBody.length);
      finalContentType = 'text/html';
    } else {
      // 对于查询接口，尝试解析为JSON
      responseBody = await response.text();
      
      if (queryParams.query) {
        // 查询接口应该返回JSON
        try {
          const parsed = JSON.parse(responseBody);
          responseBody = JSON.stringify(parsed);
          finalContentType = 'application/json';
          console.log('BufPay查询结果:', parsed);
        } catch (parseError) {
          console.warn('解析JSON失败，返回原始文本:', parseError);
          finalContentType = 'text/plain';
        }
      }
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': contentType || 'text/html',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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