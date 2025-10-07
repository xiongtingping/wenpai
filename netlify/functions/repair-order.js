/**
 * 手动修复订单 - 当Bufpay webhook通知失败时使用
 * 
 * 功能：
 * 1. 验证Bufpay支付状态
 * 2. 更新订单状态
 * 3. 开通用户订阅权限
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 计算订阅到期时间
 */
function calculateExpiryDate(durationType) {
  const now = new Date();
  
  switch (durationType) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      throw new Error(`未知的订阅周期: ${durationType}`);
  }
}

/**
 * 重置用户使用次数和Token统计（订阅升级时）
 */
async function resetUsageStats(userId, tier) {
  try {
    console.log('🔄 开始重置使用统计...', { userId, tier });

    // 获取新套餐的限额
    const tierLimits = {
      'trial': 10,
      'pro': 30,
      'premium': 100,
      'professional': 30  // pro的别名
    };

    const totalCount = tierLimits[tier] || 10;

    // 1. 删除本月的使用记录（重新开始计数）
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { error: deleteError } = await supabase
      .from('usage_count_records')
      .delete()
      .eq('user_id', userId)
      .gte('timestamp', monthStart.toISOString());

    if (deleteError) {
      console.error('删除使用记录失败:', deleteError);
    } else {
      console.log('✅ 已删除本月使用记录:', { userId });
    }

    // 2. 重置user_usage_balance表
    const { error: balanceError } = await supabase
      .from('user_usage_balance')
      .upsert({
        user_id: userId,
        total_count: totalCount,
        used_count: 0,
        remaining_count: totalCount,
        base_count: totalCount,
        bonus_count: 0,
        last_reset_at: new Date().toISOString(),
        reset_period: 'monthly',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (balanceError) {
      console.error('重置使用次数失败:', balanceError);
    } else {
      console.log('✅ 使用次数已重置:', { userId, tier, totalCount });
    }

    // 3. 注意：Token使用量不需要重置，因为是累计统计
    // Token限额会根据新的tier自动更新
    console.log('ℹ️  Token使用量保持累计，限额已更新为新套餐标准');

  } catch (error) {
    console.error('重置使用统计异常:', error);
  }
}

/**
 * 处理订单权限开通
 */
async function processOrderPermissions(order) {
  console.log('📝 开始处理订单权限...', {
    orderId: order.order_id,
    userId: order.user_id,
    productType: order.product_type,
    durationType: order.duration_type
  });

  // 计算订阅到期时间
  const expiresAt = calculateExpiryDate(order.duration_type);
  const startedAt = new Date();

  // 检查用户是否已有订阅
  const { data: existingSubscription, error: queryError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', order.user_id)
    .maybeSingle();

  if (queryError) {
    throw new Error(`查询现有订阅失败: ${queryError.message}`);
  }

  let subscriptionData;

  if (existingSubscription) {
    console.log('ℹ️  用户已有订阅，更新订阅信息...', {
      existingId: existingSubscription.id,
      existingTier: existingSubscription.tier
    });

    // 更新现有订阅
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        tier: order.product_type,
        status: 'active',
        period: order.duration_type,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_method: order.pay_type,
        last_payment_id: order.order_id
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`更新订阅失败: ${updateError.message}`);
    }

    subscriptionData = updated;
    console.log('✅ 订阅更新成功');
  } else {
    console.log('ℹ️  用户无订阅，创建新订阅...');

    // 创建新订阅
    const { data: created, error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        tier: order.product_type,
        status: 'active',
        period: order.duration_type,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: false,
        payment_method: order.pay_type,
        last_payment_id: order.order_id,
        discount_percentage: 0,
        metadata: {}
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`创建订阅失败: ${createError.message}`);
    }

    subscriptionData = created;
    console.log('✅ 订阅创建成功');
  }

  // 重置使用统计
  await resetUsageStats(order.user_id, order.product_type);

  return subscriptionData;
}

/**
 * 查询Bufpay支付状态
 */
async function queryBufPayStatus(aoid) {
  try {
    const queryUrl = `https://bufpay.com/api/query/${aoid}`;
    console.log('🔍 查询Bufpay状态:', queryUrl);

    const response = await fetch(queryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('💳 Bufpay响应:', result);

    return result.status;
  } catch (error) {
    console.error('❌ 查询Bufpay失败:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { orderId, aoid } = JSON.parse(event.body);

    console.log('🔧 开始手动修复订单...', { orderId, aoid });

    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: '缺少订单ID' })
      };
    }

    // 1. 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      console.error('❌ 订单不存在:', orderId);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: '订单不存在' })
      };
    }

    console.log('📋 订单信息:', {
      orderId: order.order_id,
      status: order.status,
      paidAt: order.paid_at,
      amount: order.amount
    });

    // 2. 检查订单是否已处理
    if (order.status === 'paid' || order.status === 'processed') {
      console.log('⚠️  订单已处理，无需修复');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '订单已处理',
          order
        })
      };
    }

    // 3. 验证Bufpay支付状态
    if (aoid) {
      try {
        const bufpayStatus = await queryBufPayStatus(aoid);
        console.log('💳 Bufpay状态:', bufpayStatus);

        if (bufpayStatus !== 'payed' && bufpayStatus !== 'success') {
          console.log('❌ Bufpay显示未支付，拒绝修复');
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Bufpay显示订单未支付',
              bufpayStatus
            })
          };
        }
      } catch (bufpayError) {
        console.warn('⚠️ 无法验证Bufpay状态，继续处理:', bufpayError);
      }
    }

    // 4. 更新订单状态为已支付
    console.log('💳 更新订单状态...');
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid'
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ 更新订单失败:', updateError);
      throw new Error(`更新订单状态失败: ${updateError.message}`);
    }

    console.log('✅ 订单状态已更新为: paid');

    // 5. 处理权限开通
    console.log('💎 开通订阅权限...');
    const subscriptionData = await processOrderPermissions(updatedOrder);

    // 6. 更新订单状态为已处理
    console.log('✅ 标记订单为已处理...');
    await supabase
      .from('orders')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    console.log('🎉 订单修复成功！');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '订单修复成功',
        order: updatedOrder,
        subscription: subscriptionData
      })
    };

  } catch (error) {
    console.error('❌ 修复订单失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '修复订单失败',
        message: error.message
      })
    };
  }
};

