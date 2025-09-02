/**
 * 补差价升级支付回调 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// BufPay 配置
const BUFPAY_CONFIG = {
  APP_SECRET: process.env.BUFPAY_APP_SECRET || '2861731746ef4189937ef4dc11f09375'
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
 * 验证支付签名
 */
function verifyPaymentSign(aoid, orderId, orderUid, price, payPrice, receivedSign) {
  const signString = aoid + orderId + orderUid + price + payPrice + BUFPAY_CONFIG.APP_SECRET;
  const expectedSign = generateMD5(signString);
  return expectedSign === receivedSign.toLowerCase();
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'text/plain'
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
      body: 'Method not allowed'
    };
  }

  try {
    console.log('===== 补差价升级支付回调开始 =====');
    console.log('回调时间:', new Date().toISOString());
    console.log('原始请求体:', event.body);

    // 解析回调数据
    const notifyData = new URLSearchParams(event.body);
    const callbackData = {
      aoid: notifyData.get('aoid'),
      order_id: notifyData.get('order_id'),
      order_uid: notifyData.get('order_uid'),
      price: notifyData.get('price'),
      pay_price: notifyData.get('pay_price'),
      sign: notifyData.get('sign')
    };

    console.log('解析后的回调数据:', callbackData);

    // 验证必要参数
    if (!callbackData.aoid || !callbackData.order_id || !callbackData.sign) {
      console.error('缺少必要的回调参数');
      return {
        statusCode: 400,
        headers,
        body: 'Missing required parameters'
      };
    }

    // 验证签名
    const isValidSign = verifyPaymentSign(
      callbackData.aoid,
      callbackData.order_id,
      callbackData.order_uid,
      callbackData.price,
      callbackData.pay_price,
      callbackData.sign
    );

    console.log('签名验证详情:', {
      aoid: callbackData.aoid,
      orderId: callbackData.order_id,
      orderUid: callbackData.order_uid,
      price: callbackData.price,
      payPrice: callbackData.pay_price,
      signString: callbackData.aoid + callbackData.order_id + callbackData.order_uid + callbackData.price + callbackData.pay_price + BUFPAY_CONFIG.APP_SECRET,
      expectedSign: generateMD5(callbackData.aoid + callbackData.order_id + callbackData.order_uid + callbackData.price + callbackData.pay_price + BUFPAY_CONFIG.APP_SECRET),
      receivedSign: callbackData.sign,
      isValid: isValidSign
    });

    if (!isValidSign) {
      console.error('升级支付回调签名验证失败');
      return {
        statusCode: 400,
        headers,
        body: 'Invalid signature'
      };
    }

    // 查询升级订单
    const { data: upgradeOrder, error: orderError } = await supabase
      .from('upgrade_orders')
      .select('*')
      .eq('order_id', callbackData.order_id)
      .single();

    if (orderError || !upgradeOrder) {
      console.error('查询升级订单失败:', orderError);
      return {
        statusCode: 404,
        headers,
        body: 'Upgrade order not found'
      };
    }

    // 检查订单是否已经处理完成
    if (upgradeOrder.status === 'paid' || upgradeOrder.status === 'processed') {
      console.log('升级订单已处理完成，跳过重复处理:', {
        orderId: callbackData.order_id,
        existingStatus: upgradeOrder.status
      });
      return {
        statusCode: 200,
        headers,
        body: 'success'
      };
    }

    // 使用事务处理升级
    try {
      // 1. 更新升级订单为已支付
      const { error: updateError } = await supabase
        .from('upgrade_orders')
        .update({
          status: 'paid',
          aoid: callbackData.aoid,
          pay_price: parseFloat(callbackData.pay_price),
          paid_at: new Date().toISOString()
        })
        .eq('order_id', callbackData.order_id);

      if (updateError) {
        throw updateError;
      }

      console.log('升级订单状态更新成功:', { 
        orderId: callbackData.order_id, 
        status: 'paid' 
      });

      // 2. 升级用户订阅
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          subscription_type: upgradeOrder.target_tier
        })
        .eq('id', upgradeOrder.current_subscription_id)
        .eq('status', 'active');

      if (subscriptionError) {
        throw subscriptionError;
      }

      console.log('用户订阅升级成功:', {
        userId: upgradeOrder.user_id,
        subscriptionId: upgradeOrder.current_subscription_id,
        newTier: upgradeOrder.target_tier
      });

      // 3. 标记升级订单为已处理
      await supabase
        .from('upgrade_orders')
        .update({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .eq('order_id', callbackData.order_id);

      console.log('✅ 补差价升级处理完成:', {
        orderId: callbackData.order_id,
        userId: upgradeOrder.user_id,
        fromTier: 'professional', // 假设从专业版升级
        toTier: upgradeOrder.target_tier,
        upgradeAmount: callbackData.pay_price,
        processedAt: new Date().toISOString()
      });

      console.log('===== 补差价升级支付回调结束 =====');

      return {
        statusCode: 200,
        headers,
        body: 'success'
      };

    } catch (processingError) {
      console.error('处理升级失败:', processingError);
      
      // 记录失败状态
      await supabase
        .from('upgrade_orders')
        .update({
          status: 'failed'
        })
        .eq('order_id', callbackData.order_id);

      return {
        statusCode: 500,
        headers,
        body: 'Processing failed'
      };
    }

  } catch (error) {
    console.error('补差价升级回调处理失败:', error);
    return {
      statusCode: 500,
      headers,
      body: 'Internal server error'
    };
  }
};