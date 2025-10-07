/**
 * BufPay 支付回调处理 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appSecret = process.env.BUFPAY_SECRET_KEY || process.env.BUFPAY_APP_SECRET; // 统一命名，兼容旧变量名
if (!appSecret) {
  throw new Error('Missing BUFPAY_SECRET_KEY (or legacy BUFPAY_APP_SECRET) environment variable');
}

// 创建 Supabase 客户端（使用 Service Role Key）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 生成 MD5 签名
 */
function generateMD5(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex').toLowerCase();
}

/**
 * 验证回调签名
 */
function verifyNotifySign(aoid, orderId, orderUid, price, payPrice, sign) {
  // 确保所有参数都是字符串
  const aoidStr = String(aoid || '');
  const orderIdStr = String(orderId || '');
  const orderUidStr = String(orderUid || '');
  const priceStr = String(price || '');
  const payPriceStr = String(payPrice || '');
  const signStr = String(sign || '');
  
  // 按文档要求的顺序拼接：aoid + order_id + order_uid + price + pay_price + app_secret
  const signString = aoidStr + orderIdStr + orderUidStr + priceStr + payPriceStr + appSecret;
  const expectedSign = generateMD5(signString);
  
  console.log('签名验证详情:', {
    aoid: aoidStr,
    orderId: orderIdStr,
    orderUid: orderUidStr,
    price: priceStr,
    payPrice: payPriceStr,
    signString: signString,
    expectedSign: expectedSign,
    receivedSign: signStr.toLowerCase(),
    isValid: expectedSign === signStr.toLowerCase()
  });
  
  return expectedSign === signStr.toLowerCase();
}

/**
 * 计算订阅到期时间
 */
function calculateExpiryDate(durationType, startDate) {
  const start = startDate || new Date();
  const expiry = new Date(start);
  
  if (durationType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (durationType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  return expiry;
}

/**
 * 处理订单权限开通
 */
async function processOrderPermissions(order) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`权限开通尝试 ${retryCount + 1}/${maxRetries}:`, {
        orderId: order.order_id,
        userId: order.user_id,
        productType: order.product_type
      });

      // 计算订阅到期时间
      const expiryDate = calculateExpiryDate(order.duration_type);
    
    // 🔧 FIX: 将 professional 映射为 pro
    const tier = order.product_type === 'professional' ? 'pro' : order.product_type;

    // 检查用户是否已有订阅（不区分类型，一个用户只有一个订阅）
    const { data: existingSubscription, error: queryError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', order.user_id)
      .maybeSingle(); // 使用 maybeSingle 避免没有记录时报错

    if (queryError) {
      console.error('查询现有订阅失败:', queryError);
      throw queryError;
    }

    let subscriptionData;

    if (existingSubscription) {
      // 如果已有订阅，更新等级和延长到期时间
      const currentExpiry = new Date(existingSubscription.expires_at);
      const newExpiry = calculateExpiryDate(order.duration_type, currentExpiry > new Date() ? currentExpiry : new Date());

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          tier: tier, // 🔧 FIX: 使用 tier 字段
          period: order.duration_type, // 🔧 FIX: 添加 period 字段
          status: 'active',
          expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscription.id)
        .select()
        .single();

      if (error) throw error;
      subscriptionData = data;

      console.log('订阅更新成功:', {
        userId: order.user_id,
        tier: tier,
        period: order.duration_type,
        newExpiry: newExpiry.toISOString()
      });
    } else {
      // 创建新订阅
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: order.user_id,
          tier: tier, // 🔧 FIX: 使用 tier 字段
          period: order.duration_type, // 🔧 FIX: 添加 period 字段
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiryDate.toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      subscriptionData = data;

      console.log('新订阅创建成功:', {
        userId: order.user_id,
        tier: tier,
        period: order.duration_type,
        expiresAt: expiryDate.toISOString()
      });
    }

    // 🔧 FIX: 标记订单为已处理 - 使用正确的表名 payment_orders
    await supabase
      .from('payment_orders')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('order_id', order.order_id);

      console.log('订单处理完成:', { orderId: order.order_id, status: 'processed' });
      return subscriptionData;

    } catch (error) {
      retryCount++;
      console.error(`权限开通失败 (尝试 ${retryCount}/${maxRetries}):`, {
        error: error.message,
        orderId: order.order_id,
        userId: order.user_id
      });

      if (retryCount >= maxRetries) {
        console.error('权限开通最终失败，已达到最大重试次数');

        // 记录失败信息到订单 (数据库表中缺少额外字段，只保留基本状态)
        console.error('权限开通最终失败，订单ID:', order.order_id);

        throw error;
      }

      // 指数退避重试：1秒、2秒、4秒
      const backoffDelay = Math.pow(2, retryCount - 1) * 1000;
      console.log(`等待 ${backoffDelay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
}

exports.handler = async (event, context) => {
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    const timestamp = new Date().toISOString();
    console.log('===== BufPay 支付回调开始 =====');
    console.log('回调时间:', timestamp);
    console.log('请求方法:', event.httpMethod);
    console.log('请求头:', JSON.stringify(event.headers, null, 2));
    console.log('原始请求体:', event.body);

    // 解析请求体
    let notifyData;
    try {
      if (event.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        // 解析 form-urlencoded 数据
        const params = new URLSearchParams(event.body);
        notifyData = {
          aoid: params.get('aoid'),
          order_id: params.get('order_id'),
          order_uid: params.get('order_uid'),
          price: params.get('price'),
          pay_price: params.get('pay_price'),
          sign: params.get('sign')
        };
      } else {
        notifyData = JSON.parse(event.body);
      }
    } catch (parseError) {
      console.error('解析请求数据失败:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request data' })
      };
    }

    console.log('解析后的回调数据:', notifyData);

    // 验证必要参数
    if (!notifyData.aoid || !notifyData.order_id || !notifyData.sign) {
      console.error('❌ 缺少必要参数:', notifyData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // 1. 验证签名
    const isValidSign = verifyNotifySign(
      notifyData.aoid,
      notifyData.order_id,
      notifyData.order_uid,
      notifyData.price,
      notifyData.pay_price,
      notifyData.sign
    );

    if (!isValidSign) {
      console.error('❌ 支付回调签名验证失败:', notifyData);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // 2. 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', notifyData.order_id)
      .single();

    if (orderError || !order) {
      console.error('❌ 订单不存在:', { orderId: notifyData.order_id, error: orderError });
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    // 3. 检查订单状态
    if (order.status === 'paid' || order.status === 'processed') {
      console.log('订单已处理，跳过重复通知:', { 
        orderId: notifyData.order_id, 
        status: order.status,
        aoid: notifyData.aoid,
        timestamp: new Date().toISOString()
      });
      return {
        statusCode: 200,
        headers,
        body: 'success'
      };
    }

    // 3.1. 检查订单是否已经处理完成（防止重复处理）
    if (order.status === 'paid' || order.status === 'processed') {
      console.log('订单已处理完成，跳过重复处理:', { 
        orderId: notifyData.order_id, 
        aoid: notifyData.aoid,
        existingStatus: order.status
      });
      return {
        statusCode: 200,
        headers,
        body: 'success'
      };
    }

    // 4. 使用事务处理订单状态更新和权限发放
    try {
      // 4.1 更新订单为已支付
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          aoid: notifyData.aoid,
          pay_price: parseFloat(notifyData.pay_price),
          paid_at: new Date().toISOString()
        })
        .eq('order_id', notifyData.order_id)
        .select()
        .single();

      if (updateError) {
        console.error('更新订单状态失败:', updateError);
        throw new Error(`更新订单状态失败: ${updateError.message}`);
      }

      console.log('订单状态更新成功:', { orderId: notifyData.order_id, status: 'paid' });

      // 4.2 处理权限开通
      const subscriptionData = await processOrderPermissions(updatedOrder);

      console.log('权限开通成功:', {
        userId: updatedOrder.user_id,
        subscriptionType: subscriptionData.subscription_type,
        expiresAt: subscriptionData.expires_at
      });

    } catch (permissionError) {
      console.error('❌ 权限开通失败，回滚订单状态:', permissionError);

      // 回滚订单状态
      await supabase
        .from('payment_orders')
        .update({
          status: 'pending'
        })
        .eq('order_id', notifyData.order_id);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Permission grant failed' })
      };
    }

    console.log('✅ 支付回调处理完成:', {
      orderId: notifyData.order_id,
      userId: order.user_id,
      productType: order.product_type,
      durationType: order.duration_type,
      aoid: notifyData.aoid,
      payPrice: notifyData.pay_price,
      processedAt: new Date().toISOString()
    });
    console.log('===== BufPay 支付回调结束 =====');

    // 返回成功响应 - BufPay要求返回纯文本"success"
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain'
      },
      body: 'success'
    };

  } catch (error) {
    console.error('❌ 处理支付回调失败:', error);
    // 🔧 FIX: 即使处理失败也返回200，避免BufPay无限重试
    // 错误已记录在日志中，可以通过后台查看并手动修复
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain'
      },
      body: 'success'
    };
  }
};
