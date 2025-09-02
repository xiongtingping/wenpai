/**
 * 创建补差价升级订单 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// BufPay 配置
const BUFPAY_CONFIG = {
  API_URL: 'https://bufpay.com/api/pay/107628',
  APP_SECRET: process.env.BUFPAY_APP_SECRET || '2861731746ef4189937ef4dc11f09375',
  NOTIFY_URL: 'https://www.wenpai.xyz/.netlify/functions/upgrade-notify',
  RETURN_URL: 'https://www.wenpai.xyz/payment/result',
  FEEDBACK_URL: 'https://www.wenpai.xyz/payment/feedback'
};

// 创建 Supabase 客户端
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
  return `WP_UPG_${timestamp}${random}`;
}

/**
 * 格式化金额
 */
function formatAmount(amount) {
  return amount.toFixed(2);
}

exports.handler = async (event, context) => {
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
    console.log('收到补差价升级订单创建请求:', event.body);

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

    const { 
      userId, 
      currentSubscriptionId,
      targetTier, 
      targetPeriod,
      upgradeAmount,
      payType = 'alipay',
      userEmail 
    } = requestData;

    if (!userId || !currentSubscriptionId || !targetTier || !targetPeriod || !upgradeAmount) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // 验证升级金额
    if (upgradeAmount <= 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid upgrade amount' })
      };
    }

    // 生成升级订单号
    const orderId = generateOrderId();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后过期

    const tierNames = {
      professional: '专业版',
      premium: '高级版'
    };

    const periodNames = {
      monthly: '月付',
      yearly: '年付'
    };

    const productName = `升级到${tierNames[targetTier]}(${periodNames[targetPeriod]})`;

    console.log('创建补差价升级订单:', { 
      orderId, 
      userId, 
      targetTier, 
      targetPeriod, 
      upgradeAmount,
      currentSubscriptionId
    });

    // 创建升级订单记录
    const { data: order, error: orderError } = await supabase
      .from('upgrade_orders')
      .insert({
        order_id: orderId,
        user_id: userId,
        user_email: userEmail,
        current_subscription_id: currentSubscriptionId,
        target_tier: targetTier,
        target_period: targetPeriod,
        upgrade_amount: upgradeAmount,
        pay_type: payType,
        status: 'pending',
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('创建升级订单失败:', orderError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to create upgrade order' })
      };
    }

    // 调用 BufPay 接口
    const priceStr = formatAmount(upgradeAmount);
    const formData = new URLSearchParams();
    
    formData.append('name', productName);
    formData.append('pay_type', payType);
    formData.append('price', priceStr);
    formData.append('order_id', orderId);
    formData.append('order_uid', userId);
    formData.append('notify_url', BUFPAY_CONFIG.NOTIFY_URL);
    formData.append('return_url', BUFPAY_CONFIG.RETURN_URL);
    formData.append('feedback_url', BUFPAY_CONFIG.FEEDBACK_URL);
    
    const sign = generatePaymentSign(
      productName,
      payType,
      priceStr,
      orderId,
      userId,
      BUFPAY_CONFIG.NOTIFY_URL,
      BUFPAY_CONFIG.RETURN_URL,
      BUFPAY_CONFIG.FEEDBACK_URL
    );
    
    formData.append('sign', sign);

    console.log('调用 BufPay 接口创建补差价支付:', { orderId, amount: priceStr, payType });

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

    // 处理HTML响应
    const contentType = response.headers.get('content-type');
    let paymentResult;
    
    if (contentType && contentType.includes('text/html')) {
      const htmlResponse = await response.text();
      
      // 从HTML中提取aoid和二维码信息
      let extractedAoid = null;
      let qrCodeUrl = null;
      
      const aoidMatch = htmlResponse.match(/aoid['\"]\\s*[:=]\\s*['\"]([^'\"]+)['\"]/) || 
                       htmlResponse.match(/aoid=([^&\s'"]+)/);
      if (aoidMatch) {
        extractedAoid = aoidMatch[1];
      }
      
      const qrMatch = htmlResponse.match(/(?:qr_?code|qr_?img)['\"]\\s*[:=]\\s*['\"]([^'\"]+)['\"]/) ||
                     htmlResponse.match(/src=['\"]([^'\"]*qr[^'\"]*)['\"]/) ||
                     htmlResponse.match(/(https?:\/\/[^\\s'"]*qr[^\\s'"]*)/);
      if (qrMatch) {
        qrCodeUrl = qrMatch[1];
      }

      paymentResult = {
        status: 'ok',
        aoid: extractedAoid || `bufpay_${orderId}_${Date.now()}`,
        htmlContent: htmlResponse,
        qr_img: qrCodeUrl,
        message: '补差价支付页面已生成',
        expires_in: 900
      };
    } else {
      paymentResult = await response.json();
    }

    console.log('BufPay 补差价支付接口响应:', { orderId, status: paymentResult.status });

    // 检查支付接口响应
    if (paymentResult.status !== 'ok') {
      console.error('补差价支付接口返回错误:', { orderId, status: paymentResult.status });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `支付失败: ${paymentResult.status}` })
      };
    }

    // 更新升级订单支付信息
    if (paymentResult.aoid) {
      const paymentExpiresAt = paymentResult.expires_in 
        ? new Date(Date.now() + paymentResult.expires_in * 1000).toISOString()
        : undefined;

      await supabase
        .from('upgrade_orders')
        .update({
          aoid: paymentResult.aoid,
          qr_code: paymentResult.qr,
          qr_image: paymentResult.qr_img,
          expires_at: paymentExpiresAt
        })
        .eq('order_id', orderId);
    }

    console.log('补差价升级订单创建成功:', { orderId, aoid: paymentResult.aoid });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        orderType: 'upgrade',
        paymentInfo: paymentResult,
        upgradeDetails: {
          targetTier,
          targetPeriod,
          upgradeAmount
        }
      })
    };

  } catch (error) {
    console.error('创建补差价升级订单失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};