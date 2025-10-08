/**
 * Netlify Functions - 支付回调处理
 * 处理支付平台的异步通知，更新订单状态
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// 环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUFPAY_SECRET_KEY = process.env.BUFPAY_SECRET_KEY;

// 创建 Supabase 客户端（使用 service_role 权限）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/**
 * 验证 BufPay 签名
 */
function verifyBufPaySignature(data, signature) {
  try {
    // BufPay 签名验证逻辑
    // 根据 BufPay 文档实现具体的签名验证
    const sortedParams = Object.keys(data)
      .filter(key => key !== 'sign' && data[key] !== '')
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('&');
    
    const signString = sortedParams + '&key=' + BUFPAY_SECRET_KEY;
    const expectedSignature = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

/**
 * 更新订单状态
 */
async function updateOrderStatus(orderId, status, notifyData) {
  try {
    const updateData = {
      status,
      notify_data: notifyData,
      notify_verified: true
    };

    if (status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    } else if (status === 'failed') {
      updateData.failed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('订单状态更新成功:', { orderId, status });
    return data;
  } catch (error) {
    console.error('更新订单状态失败:', error);
    throw error;
  }
}

/**
 * 创建用户订阅
 */
async function createUserSubscription(order) {
  try {
    const subscriptionData = {
      user_id: order.user_id,
      tier: order.product_type,  // 🔧 FIX: 使用 tier 而不是 subscription_type
      status: 'active',
      period: order.duration_type,  // 🔧 FIX: 添加 period 字段
      started_at: new Date().toISOString(),
      order_id: order.order_id,
      last_payment_id: order.order_id  // 🔧 FIX: 添加 last_payment_id
    };

    // 计算到期时间
    const expiresAt = new Date();
    if (order.duration_type === 'yearly') {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    subscriptionData.expires_at = expiresAt.toISOString();

    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 更新订单的订阅ID
    await supabase
      .from('orders')
      .update({ subscription_id: data.id })
      .eq('id', order.id);

    console.log('用户订阅创建成功:', data);

    // 🎯 CRITICAL FIX: 订阅升级时重置使用次数
    await resetUsageCount(order.user_id, order.product_type);

    return data;
  } catch (error) {
    console.error('创建用户订阅失败:', error);
    throw error;
  }
}

/**
 * 重置用户使用次数（订阅升级时）
 */
async function resetUsageCount(userId, tier) {
  try {
    // 获取新套餐的限额
    const tierLimits = {
      'trial': 10,
      'pro': 30,
      'premium': -1  // 无限制
    };

    const totalCount = tierLimits[tier] || 10;

    // 🎯 CRITICAL: 删除本月的使用记录
    const { error: deleteError } = await supabase
      .from('usage_count_records')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    if (deleteError) {
      console.error('删除使用记录失败:', deleteError);
    } else {
      console.log('✅ 已删除本月使用记录:', { userId });
    }

    // 重置user_usage_balance表
    const { error } = await supabase
      .from('user_usage_balance')
      .upsert({
        user_id: userId,
        total_count: totalCount,
        used_count: 0,
        remaining_count: totalCount,
        base_count: totalCount,
        bonus_count: 0,
        last_reset_at: new Date(),
        reset_period: 'monthly',
        updated_at: new Date()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('重置使用次数失败:', error);
    } else {
      console.log('✅ 使用次数已重置:', { userId, tier, totalCount });
    }
  } catch (error) {
    console.error('重置使用次数异常:', error);
  }
}

/**
 * 主处理函数
 */
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
    console.log('收到支付回调:', event.body);

    // 解析请求数据
    let notifyData;
    try {
      notifyData = JSON.parse(event.body);
    } catch (error) {
      console.error('解析请求数据失败:', error);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid JSON data' })
      };
    }

    // 验证必要字段
    const { order_id, status, sign } = notifyData;
    if (!order_id || !status || !sign) {
      console.error('缺少必要字段:', { order_id, status, sign });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // 验证签名
    if (!verifyBufPaySignature(notifyData, sign)) {
      console.error('签名验证失败');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (orderError || !order) {
      console.error('订单不存在:', order_id);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    // 检查订单状态，避免重复处理
    if (order.status === 'paid') {
      console.log('订单已支付，跳过处理:', order_id);
      return {
        statusCode: 200,
        headers,
        body: 'success'
      };
    }

    // 根据支付状态更新订单
    let orderStatus;
    if (status === 'success' || status === 'paid') {
      orderStatus = 'paid';
    } else if (status === 'failed' || status === 'fail') {
      orderStatus = 'failed';
    } else {
      console.error('未知的支付状态:', status);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Unknown payment status' })
      };
    }

    // 更新订单状态
    const updatedOrder = await updateOrderStatus(order_id, orderStatus, notifyData);

    // 如果支付成功，创建用户订阅
    if (orderStatus === 'paid') {
      try {
        await createUserSubscription(updatedOrder);
      } catch (error) {
        console.error('创建订阅失败，但订单已标记为已支付:', error);
        // 这里可以考虑发送告警通知管理员
      }
    }

    console.log('支付回调处理完成:', { order_id, status: orderStatus });

    // 返回成功响应给支付平台
    return {
      statusCode: 200,
      headers,
      body: 'success'
    };

  } catch (error) {
    console.error('支付回调处理失败:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
