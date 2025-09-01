/**
 * BufPay 支付回调调试版本 - 简化诊断
 */

exports.handler = async (event, context) => {
  console.log('🔍 [DEBUG] 收到BufPay支付回调:', {
    method: event.httpMethod,
    timestamp: new Date().toISOString(),
    hasBody: !!event.body,
    bodyLength: event.body ? event.body.length : 0,
    contentType: event.headers['content-type'],
    userAgent: event.headers['user-agent']
  });

  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    console.log('❌ [DEBUG] 方法不允许:', event.httpMethod);
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析请求体
    if (!event.body) {
      console.log('❌ [DEBUG] 请求体为空');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: 'success'
      };
    }

    console.log('📥 [DEBUG] 原始请求体:', event.body);
    
    const params = new URLSearchParams(event.body);
    const notifyData = {
      aoid: params.get('aoid'),
      order_id: params.get('order_id'),
      order_uid: params.get('order_uid'),
      price: params.get('price'),
      pay_price: params.get('pay_price'),
      sign: params.get('sign')
    };

    console.log('📊 [DEBUG] 解析后的参数:', {
      aoid: notifyData.aoid,
      order_id: notifyData.order_id,
      order_uid: notifyData.order_uid,
      price: notifyData.price,
      pay_price: notifyData.pay_price,
      signPresent: !!notifyData.sign,
      signLength: notifyData.sign ? notifyData.sign.length : 0
    });

    // 检查必需参数
    const missingParams = [];
    if (!notifyData.aoid) missingParams.push('aoid');
    if (!notifyData.order_id) missingParams.push('order_id');
    if (!notifyData.order_uid) missingParams.push('order_uid');
    if (!notifyData.price) missingParams.push('price');
    if (!notifyData.pay_price) missingParams.push('pay_price');
    if (!notifyData.sign) missingParams.push('sign');

    if (missingParams.length > 0) {
      console.log('⚠️ [DEBUG] 缺少参数:', missingParams);
    } else {
      console.log('✅ [DEBUG] 所有必需参数都存在');
    }

    // 检查环境变量
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log('🔑 [DEBUG] Supabase密钥状态:', {
      exists: !!supabaseKey,
      length: supabaseKey ? supabaseKey.length : 0,
      prefix: supabaseKey ? supabaseKey.substring(0, 10) : 'N/A'
    });

    console.log('✅ [DEBUG] 诊断完成，返回成功');
    
    // 总是返回成功，避免BufPay重复回调
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'success'
    };

  } catch (error) {
    console.error('❌ [DEBUG] 处理异常:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // 即使出错也返回success，防止重复回调
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'success'
    };
  }
};