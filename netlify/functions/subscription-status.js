/**
 * 订阅状态查询 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function normalizeTier(raw) {
  const v = (raw || '').toString().toLowerCase();
  if (v === 'premium') return 'premium';
  if (v === 'pro' || v === 'professional') return 'pro';
  return 'trial';
}

function calculateExpiryDate(durationType, baseDate) {
  const base = baseDate ? new Date(baseDate) : new Date();
  const expiry = new Date(base);
  if (durationType === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else if (durationType === 'yearly') {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  return expiry;
}


/**
 * 计算订阅状态（兼容 tier 与 subscription_type 字段）
 */
function calculateSubscriptionStatus(subscription) {
  const now = new Date();

  if (!subscription || subscription.status !== 'active') {
    return {
      status: 'inactive',
      tier: 'trial',
      expiresAt: null,
      daysRemaining: 0,
      needsAlert: false,
      alertLevel: 'info',
      alertMessage: '',
      statusLabel: '未订阅',
      statusColor: 'gray'
    };
  }

  const expiresAt = new Date(subscription.expires_at);
  const timeDiff = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const rawTier = subscription.tier || subscription.subscription_type;
  const tier = normalizeTier(rawTier);

  // 已过期
  if (daysRemaining <= 0) {
    return {
      status: 'expired',
      tier,
      expiresAt: subscription.expires_at,
      daysRemaining: 0,
      needsAlert: true,
      alertLevel: 'danger',
      alertMessage: '您的订阅已过期，请立即续费以继续使用服务',
      statusLabel: '已过期',
      statusColor: 'red'
    };
  }

  // 当天到期
  if (daysRemaining === 1) {
    return {
      status: 'expiring_soon',
      tier,
      expiresAt: subscription.expires_at,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'danger',
      alertMessage: '您的订阅今天到期，立即续费避免服务中断',
      statusLabel: '今日到期',
      statusColor: 'red'
    };
  }

  // 3天内到期
  if (daysRemaining <= 3) {
    return {
      status: 'expiring_soon',
      tier,
      expiresAt: subscription.expires_at,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'warning',
      alertMessage: `您的订阅将在 ${daysRemaining} 天后到期，续费以避免服务中断`,
      statusLabel: `${daysRemaining}天后到期`,
      statusColor: 'orange'
    };
  }

  // 7天内到期
  if (daysRemaining <= 7) {
    return {
      status: 'expiring_soon',
      tier,
      expiresAt: subscription.expires_at,
      daysRemaining,
      needsAlert: true,
      alertLevel: 'info',
      alertMessage: `您的订阅将在 ${daysRemaining} 天后到期，立即升级可享受更多高级功能`,
      statusLabel: `${daysRemaining}天后到期`,
      statusColor: 'yellow'
    };
  }

  // 正常状态
  const tierNames = { pro: '专业版', premium: '高级版', trial: '体验版' };
  const tierName = tierNames[tier] || '专业版';

  return {
    status: 'active',
    tier,
    expiresAt: subscription.expires_at,
    daysRemaining,
    needsAlert: false,
    alertLevel: 'info',
    alertMessage: '',
    statusLabel: `${tierName}有效`,
    statusColor: 'green'
  };
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // 只接受 GET 请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // 从路径参数获取用户ID
    const pathParts = event.path.split('/');
    const userId = pathParts[pathParts.length - 1];

    if (!userId || userId === 'subscription-status') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'User ID is required' })
      };
    }

    console.log('查询用户订阅状态:', { userId });

    // 查询用户活跃订阅（同时兼容 tier 与 subscription_type 字段）
    const { data: subscriptions, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false });

    if (error) {
      console.error('查询用户订阅失败:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to query subscription' })
      };
    }

    let primarySubscription = null;
    let allStatuses = [];

    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {

    // 自动修复：若无 premium 订阅，但存在 premium 的已支付/已处理订单，则自动补齐 premium 订阅
      if (allStatuses.length === 0) {

    try {
      const hasPremium = (subscriptions || []).some(
        (s) => normalizeTier(s.tier || s.subscription_type) === 'premium'
      );

      if (!hasPremium) {
        const { data: premiumOrder, error: orderErr } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .in('status', ['paid', 'processed'])
          .eq('product_type', 'premium')
          .order('paid_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!orderErr && premiumOrder) {
          const start = premiumOrder.paid_at || new Date().toISOString();
          const expiry = calculateExpiryDate(premiumOrder.duration_type, start).toISOString();

          const { data: newSub, error: insErr } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              subscription_type: 'premium',
              status: 'active',
              started_at: start,
              expires_at: expiry,
              order_id: premiumOrder.order_id
            })
            .select('*')
            .single();

          if (!insErr && newSub) {
            const status = calculateSubscriptionStatus(newSub);
            allStatuses.unshift({
              ...status,
              subscriptionType: newSub.subscription_type,
              subscriptionId: newSub.id
            });
            primarySubscription = newSub;
            console.log('🔧 已根据订单自动补齐 premium 订阅:', {
              userId,
              orderId: premiumOrder.order_id,
              expiresAt: newSub.expires_at
            });
          }
        }
      }
    } catch (autoFixErr) {
      console.warn('自动补齐 premium 订阅失败（忽略，不影响查询返回）:', autoFixErr?.message || autoFixErr);
      }

    }

        const status = calculateSubscriptionStatus(subscription);
        allStatuses.push({
          ...status,
          subscriptionType: subscription.tier || subscription.subscription_type,
          subscriptionId: subscription.id
        });
      }

      // 选择最高级别订阅作为主要订阅（优先 premium）
      primarySubscription = subscriptions.find(sub => normalizeTier(sub.tier || sub.subscription_type) === 'premium') || subscriptions[0];
    }

    const primaryStatus = calculateSubscriptionStatus(primarySubscription);

    console.log('订阅状态计算完成:', {
      userId,
      hasSubscription: !!primarySubscription,
      status: primaryStatus.status,
      tier: primaryStatus.tier,
      needsAlert: primaryStatus.needsAlert,
      daysRemaining: primaryStatus.daysRemaining
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        userId,
        primaryStatus,
        allSubscriptions: allStatuses,
        hasActiveSubscription: !!primarySubscription
      })
    };

  } catch (error) {
    console.error('查询订阅状态失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: error.stack
      })
    };
  }
};