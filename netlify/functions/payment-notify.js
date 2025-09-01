/**
 * BufPay 支付成功回调处理 Netlify Function
 */

const crypto = require('crypto');

// BufPay配置 - 使用正确的APP_SECRET
const BUFPAY_APP_SECRET = '2861731746ef4189937ef4dc11f09375';

/**
 * 生成MD5签名
 */
function generateMD5(text) {
  return crypto.createHash('md5').update(text).digest('hex').toLowerCase();
}

/**
 * 验证BufPay回调签名
 */
function verifyNotifySign(aoid, orderId, orderUid, price, payPrice, sign) {
  const expectedSign = generateMD5(aoid + orderId + orderUid + price + payPrice + BUFPAY_APP_SECRET);
  return expectedSign === sign.toLowerCase();
}

exports.handler = async (event, context) => {
  console.log('📞 收到BufPay支付回调:', {
    method: event.httpMethod,
    timestamp: new Date().toISOString()
  });

  // 只处理POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 解析回调数据
    if (!event.body) {
      console.error('❌ 回调请求体为空');
      return {
        statusCode: 400,
        body: 'error'
      };
    }

    const params = new URLSearchParams(event.body);
    const notifyData = {
      aoid: params.get('aoid'),
      order_id: params.get('order_id'),
      order_uid: params.get('order_uid'),
      price: params.get('price'),
      pay_price: params.get('pay_price'),
      sign: params.get('sign')
    };

    console.log('📥 解析回调数据: orderId =', notifyData.order_id);

    // 验证必需参数
    if (!notifyData.aoid || !notifyData.order_id || !notifyData.order_uid || !notifyData.price || !notifyData.pay_price || !notifyData.sign) {
      console.error('❌ 回调数据缺少必需参数, 收到参数:', Object.keys(notifyData).filter(key => notifyData[key]));
      return {
        statusCode: 400,
        body: 'error'
      };
    }

    // 验证签名
    const isValidSign = verifyNotifySign(
      notifyData.aoid,
      notifyData.order_id,
      notifyData.order_uid,
      notifyData.price,
      notifyData.pay_price,
      notifyData.sign
    );

    if (!isValidSign) {
      console.error('❌ 支付回调签名验证失败');
      return {
        statusCode: 400,
        body: 'error'
      };
    }

    console.log('✅ 签名验证成功');

    // 调用Supabase更新订单状态
    const supabaseUrl = 'https://zkdbexhnynyzqhknzfxl.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🔑 检查Supabase密钥:', supabaseKey ? '存在' : '缺失');

    if (!supabaseKey) {
      console.error('❌ 缺少Supabase服务密钥 - 将跳过数据库更新');
      // 即使缺少密钥也返回success给BufPay，避免重复回调
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: 'success'
      };
    }

    // 更新订单状态为已支付
    console.log('🔄 开始更新订单状态:', notifyData.order_id);
    
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${notifyData.order_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        status: 'paid',
        aoid: notifyData.aoid,
        pay_price: parseFloat(notifyData.pay_price),
        paid_at: new Date().toISOString()
      })
    });

    console.log('📊 Supabase响应状态:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ 更新订单状态失败:', errorText);
      return {
        statusCode: 500,
        body: 'error'
      };
    }

    const updatedOrders = await updateResponse.json();
    console.log('✅ 订单状态更新成功:', updatedOrders);

    if (updatedOrders && updatedOrders.length > 0) {
      const order = updatedOrders[0];
      
      // 处理权限开通 - 创建或延长订阅
      const expiryDate = new Date();
      if (order.duration_type === 'monthly') {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (order.duration_type === 'yearly') {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // 检查是否已有相同类型订阅
      const checkResponse = await fetch(
        `${supabaseUrl}/rest/v1/user_subscriptions?user_id=eq.${order.user_id}&subscription_type=eq.${order.product_type}&status=eq.active&limit=1`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        }
      );

      const existingSubscriptions = await checkResponse.json();

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        // 延长现有订阅
        const existing = existingSubscriptions[0];
        const currentExpiry = new Date(existing.expires_at);
        const newExpiry = new Date(currentExpiry > new Date() ? currentExpiry : new Date());
        
        if (order.duration_type === 'monthly') {
          newExpiry.setMonth(newExpiry.getMonth() + 1);
        } else if (order.duration_type === 'yearly') {
          newExpiry.setFullYear(newExpiry.getFullYear() + 1);
        }

        await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?id=eq.${existing.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expires_at: newExpiry.toISOString(),
            updated_at: new Date().toISOString()
          })
        });

        console.log('✅ 订阅时间延长成功');
      } else {
        // 创建新订阅
        await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: order.user_id,
            subscription_type: order.product_type,
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: expiryDate.toISOString(),
            order_id: order.order_id
          })
        });

        console.log('✅ 新订阅创建成功');
      }

      // 标记订单为已处理
      await fetch(`${supabaseUrl}/rest/v1/orders?order_id=eq.${notifyData.order_id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'processed',
          processed_at: new Date().toISOString()
        })
      });
    }

    // 返回成功响应给BufPay（必须返回HTTP 200和"success"）
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'success'
    };

  } catch (error) {
    console.error('❌ 处理支付回调失败:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // 即使出错也要返回success给BufPay，避免重复回调
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: 'success'
    };
  }
};