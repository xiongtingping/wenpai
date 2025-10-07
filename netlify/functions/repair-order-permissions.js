/**
 * 修复订单权限 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建 Supabase 客户端（使用 Service Role Key）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 计算订阅到期时间
 */
function calculateExpiryDate(durationType, baseDate) {
  const base = baseDate || new Date();
  const expiry = new Date(base);
  
  if (durationType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (durationType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  } else {
    throw new Error(`不支持的订阅类型: ${durationType}`);
  }
  
  return expiry;
}

/**
 * 处理订单权限开通
 */
async function processOrderPermissions(order) {
  console.log('开始处理订单权限:', {
    orderId: order.order_id,
    userId: order.user_id,
    productType: order.product_type
  });

  // 计算订阅到期时间
  const expiryDate = calculateExpiryDate(order.duration_type);
  
  // 检查用户是否已有相同类型的订阅
  const { data: existingSubscription, error: queryError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', order.user_id)
    .eq('subscription_type', order.product_type)
    .eq('status', 'active')
    .maybeSingle();

  if (queryError) {
    throw new Error(`查询现有订阅失败: ${queryError.message}`);
  }

  let subscriptionData;

  if (existingSubscription) {
    // 延长现有订阅
    const currentExpiry = new Date(existingSubscription.expires_at);
    const newExpiry = calculateExpiryDate(
      order.duration_type, 
      currentExpiry > new Date() ? currentExpiry : new Date()
    );
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .update({
        expires_at: newExpiry.toISOString(),
        updated_at: new Date().toISOString(),
        order_id: order.order_id
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (error) throw new Error(`延长订阅失败: ${error.message}`);
    subscriptionData = data;
    
    console.log('订阅延长成功:', { 
      userId: order.user_id, 
      subscriptionType: order.product_type,
      newExpiry: newExpiry.toISOString()
    });
  } else {
    // 创建新订阅
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        subscription_type: order.product_type,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        order_id: order.order_id
      })
      .select()
      .single();

    if (error) throw new Error(`创建订阅失败: ${error.message}`);
    subscriptionData = data;
    
    console.log('新订阅创建成功:', { 
      userId: order.user_id, 
      subscriptionType: order.product_type,
      expiresAt: expiryDate.toISOString()
    });
  }

  // 标记订单为已处理
  const { error: processError } = await supabase
    .from('orders')
    .update({
      status: 'processed',
      processed_at: new Date().toISOString()
    })
    .eq('order_id', order.order_id);

  if (processError) {
    throw new Error(`标记订单为已处理失败: ${processError.message}`);
  }

  return subscriptionData;
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
    console.log('收到订单权限修复请求:', event.body);

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

    const { orderId, force } = requestData;

    if (!orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing orderId parameter' })
      };
    }

    // 1. 获取订单信息
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      console.error('订单不存在:', { orderId, error: orderError });
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    // 2. 检查订单状态（允许 force 覆盖）
    if (order.status !== 'paid' && order.status !== 'processed') {
      if (!force) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Order not eligible for repair' })
        };
      } else {
        console.warn('强制修复启用：订单未处于 paid/processed 状态，继续执行修复', { orderId, currentStatus: order.status });
        // 将订单状态提升为 paid（保留原始状态用于审计）
        const { data: updatedOrder, error: updateErr } = await supabase
          .from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('order_id', orderId)
          .select('*')
          .single();
        if (!updateErr && updatedOrder) {
          order = updatedOrder;
        }
      }
    }

    // 3. 检查是否已有订阅
    const { data: existingSubscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error('查询现有订阅失败:', subError);
    }

    if (existingSubscription) {
      console.log('订单已有有效订阅，无需修复:', { orderId, subscriptionId: existingSubscription.id });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: '订单状态正常，无需修复',
          subscriptionData: existingSubscription
        })
      };
    }

    // 4. 执行权限修复
    const subscriptionData = await processOrderPermissions(order);

    console.log('订单权限修复成功:', { 
      orderId, 
      userId: order.user_id,
      subscriptionType: subscriptionData.subscription_type
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: '权限修复成功',
        subscriptionData
      })
    };

  } catch (error) {
    console.error('修复订单权限失败:', error);
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