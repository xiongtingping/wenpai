/**
 * 创建支付订单 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// BufPay 配置
const BUFPAY_CONFIG = {
  API_URL: 'https://bufpay.com/api/pay/107628',
  APP_SECRET: process.env.BUFPAY_APP_SECRET || '2861731746ef4189937ef4dc11f09375', // 从环境变量获取
  NOTIFY_URL: 'https://www.wenpai.xyz/.netlify/functions/bufpay-notify',
  RETURN_URL_BASE: 'https://www.wenpai.xyz/payment/result',
  FEEDBACK_URL: 'https://www.wenpai.xyz/payment/feedback'
};

// 创建 Supabase 客户端（使用 Service Role Key）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 生成 MD5 签名
 */
function generateMD5(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex').toLowerCase();
}

/**
 * 生成支付签名
 */
function generatePaymentSign(name, payType, price, orderId, orderUid, notifyUrl, returnUrl, feedbackUrl = '') {
  const signString = name + payType + price + orderId + orderUid + notifyUrl + returnUrl + feedbackUrl + BUFPAY_CONFIG.APP_SECRET;
  return generateMD5(signString);
}

/**
 * 生成订单号
 */
function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WP${timestamp}${random}`;
}

/**
 * 格式化金额
 */
function formatAmount(amount) {
  return amount.toFixed(2);
}

/**
 * 解析产品信息
 */
function parseProductInfo(productType, durationType) {
  const productMap = {
    'professional': '文派专业版',
    'premium': '文派高级版'
  };
  
  const durationMap = {
    'monthly': '月度会员',
    'yearly': '年度会员'
  };
  
  return {
    productName: productMap[productType] || '未知产品',
    durationName: durationMap[durationType] || '未知时长'
  };
}

exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 处理 OPTIONS 请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('收到创建订单请求:', event.body);

    // 解析请求体
    let requestData;
    try {
      requestData = JSON.parse(event.body);
    } catch (parseError) {
      console.error('解析请求数据失败:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }

    // 验证必要参数
    const { userId, productType, durationType, amount, payType = 'alipay', userEmail, pricingContext } = requestData;
    
    if (!userId || !productType || !durationType || !amount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // 如果有价格上下文，进行服务端验证
    if (pricingContext) {
      console.log('验证价格上下文:', { orderId: 'pending', pricingContext });
      
      // 这里可以添加服务端价格验证逻辑
      // 例如：验证金额是否与动态价格计算结果一致（允许1元误差）
      // 目前先记录信息，后续可扩展具体验证逻辑
    }

    // 验证产品类型和时长类型
    if (!['professional', 'premium'].includes(productType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid product type' })
      };
    }

    if (!['monthly', 'yearly'].includes(durationType)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid duration type' })
      };
    }

    // 解析产品信息
    const { productName } = parseProductInfo(productType, durationType);
    const fullProductName = `${productName}${durationType === 'monthly' ? '月度会员' : '年度会员'}`;

    // 1. 生成订单号
    const orderId = generateOrderId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

    console.log('创建订单:', { orderId, userId, productType, durationType, amount });

    // 2. 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: userId,
        user_email: userEmail,
        product_name: fullProductName,
        product_type: productType,
        duration_type: durationType,
        amount: amount,
        pay_type: payType,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('创建订单失败:', orderError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create order' })
      };
    }

    // 3. 调用 BufPay 接口
    const priceStr = formatAmount(amount);
    const returnUrl = `${BUFPAY_CONFIG.RETURN_URL_BASE}?order_id=${orderId}&status=success`;
    const formData = new URLSearchParams();
    
    formData.append('name', fullProductName);
    formData.append('pay_type', payType);
    formData.append('price', priceStr);
    formData.append('order_id', orderId);
    formData.append('order_uid', userId);
    formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
    formData.append('return_url', returnUrl);
    formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
    
    const sign = generatePaymentSign(
      fullProductName,
      payType,
      priceStr,
      orderId,
      userId,
      BUFPAY_CONFIG.NOTIFY_URL,
      returnUrl,
      BUFPAY_CONFIG.FEEDBACK_URL
    );
    
    formData.append('sign', sign);

    console.log('调用 BufPay 接口:', { orderId, amount: priceStr, payType });

    const response = await fetch(BUFPAY_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // BufPay API 设计：返回 HTML 支付页面而非 JSON
    const contentType = response.headers.get('content-type');
    console.log('BufPay API响应类型:', { contentType, orderId });

    let paymentResult;
    
    // 检查是否返回HTML支付页面（BufPay的设计模式）
    if (contentType && contentType.includes('text/html')) {
      const htmlResponse = await response.text();
      console.log('BufPay 返回HTML支付页面:', { 
        orderId, 
        htmlLength: htmlResponse.length,
        containsQR: htmlResponse.includes('qrcode'),
        containsPayment: htmlResponse.includes('支付'),
        containsAlipay: htmlResponse.includes('alipay')
      });

      // 尝试从HTML中提取aoid和二维码信息
      let extractedAoid = null;
      let qrCodeUrl = null;
      
      // 查找aoid
      const aoidMatch = htmlResponse.match(/aoid['"]\s*[:=]\s*['"]([^'"]+)['"]/);
      if (aoidMatch) {
        extractedAoid = aoidMatch[1];
      }
      
      // 查找二维码链接
      const qrMatch = htmlResponse.match(/(?:qr_?code|qr_?img)['"]\s*[:=]\s*['"]([^'"]+)['"]/);
      if (qrMatch) {
        qrCodeUrl = qrMatch[1];
      }

      // 构造PaymentResponse
      paymentResult = {
        status: 'ok',
        aoid: extractedAoid || `bufpay_${orderId}_${Date.now()}`,
        htmlContent: htmlResponse,
        qr_img: qrCodeUrl,
        message: '支付页面已生成',
        expires_in: 900 // 默认15分钟
      };
    } else {
      // 如果是JSON响应，使用原来的处理逻辑
      paymentResult = await response.json();
    }
    
    console.log('BufPay 接口响应:', { orderId, status: paymentResult.status });

    // 4. 检查支付接口响应
    if (paymentResult.status !== 'ok') {
      const errorMap = {
        'sign_error': '签名验证失败，请重试',
        'order_payed': '订单已支付，请勿重复支付',
        'order_expire': '订单已过期，请重新下单',
        'free_limit': '今日订单数量已达上限，请明日再试',
        'fee_error': '商户余额不足，请联系客服',
        'qr_limit': '暂无可用收款码，请稍后重试',
        'missing_argument': `缺少必要参数${paymentResult.info ? ': ' + paymentResult.info : ''}`
      };
      
      const errorMessage = errorMap[paymentResult.status] || `支付失败: ${paymentResult.status}`;
      console.error('支付接口返回错误:', { orderId, status: paymentResult.status, error: paymentResult.error });
      
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: errorMessage })
      };
    }

    // 5. 更新订单支付信息
    if (paymentResult.aoid) {
      const paymentExpiresAt = paymentResult.expires_in 
        ? new Date(Date.now() + paymentResult.expires_in * 1000).toISOString()
        : undefined;

      await supabase
        .from('orders')
        .update({
          aoid: paymentResult.aoid,
          qr_code: paymentResult.qr,
          qr_image: paymentResult.qr_img,
          expires_at: paymentExpiresAt
        })
        .eq('order_id', orderId);
    }

    console.log('支付订单创建成功:', { orderId, aoid: paymentResult.aoid });

    // 6. 返回支付信息
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        paymentInfo: paymentResult
      })
    };

  } catch (error) {
    console.error('创建支付订单失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
