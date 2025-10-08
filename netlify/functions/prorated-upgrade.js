/**
 * 补差价升级结算 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 订阅计划原价映射（不含优惠）
 */
const PLAN_PRICES = {
  pro: {
    monthly: 39,
    yearly: 388
  },
  professional: {
    monthly: 39, // 与pro相同
    yearly: 388  // 与pro相同
  },
  premium: {
    monthly: 99,
    yearly: 986
  }
};

/**
 * 获取计划等级
 */
function getPlanLevel(tier) {
  switch (tier) {
    case 'trial': return 0;
    case 'pro': return 1;
    case 'professional': return 1; // 与pro相同等级
    case 'premium': return 2;
    default: return -1;
  }
}

/**
 * 计算补差价升级
 */
function calculateProratedUpgrade(currentSubscription, targetTier, targetPeriod) {
  const now = new Date();
  const expiresAt = new Date(currentSubscription.expires_at);
  const startedAt = new Date(currentSubscription.started_at);

  // 计算订阅周期
  const totalDuration = expiresAt.getTime() - startedAt.getTime();
  const totalDays = Math.ceil(totalDuration / (1000 * 60 * 60 * 24));
  const currentPeriod = totalDays > 200 ? 'yearly' : 'monthly';

  // 计算剩余天数
  const remainingTime = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
  const usedDays = totalDays - daysRemaining;

  // 获取价格
  const currentPrice = PLAN_PRICES[currentSubscription.tier][currentPeriod];  // 🔧 FIX: 使用 tier
  const targetPrice = PLAN_PRICES[targetTier][targetPeriod];

  // 检查是否支持升级
  const canUpgrade = targetTier !== currentSubscription.tier &&  // 🔧 FIX: 使用 tier
                    daysRemaining > 0 &&
                    getPlanLevel(targetTier) > getPlanLevel(currentSubscription.tier);  // 🔧 FIX: 使用 tier

  if (!canUpgrade) {
    return {
      canUpgrade: false,
      upgradeAmount: 0,
      daysRemaining,
      currentPrice,
      targetPrice,
      remainingValue: 0,
      expiresAt: currentSubscription.expires_at,
      calculation: {
        totalDays,
        usedDays,
        remainingDays: daysRemaining,
        priceDifference: 0,
        dailyRateTarget: 0
      }
    };
  }

  let upgradeAmount;
  let remainingValue;

  // 同周期升级：使用原公式
  if (targetPeriod === currentPeriod) {
    const priceDifference = targetPrice - currentPrice;
    upgradeAmount = Math.round((priceDifference * daysRemaining / totalDays) * 100) / 100;
    remainingValue = Math.round((currentPrice * daysRemaining / totalDays) * 100) / 100;
  } else {
    // 跨周期升级：按每日单价计算
    const currentDailyRate = currentPrice / totalDays;
    const targetDailyRate = targetPrice / (targetPeriod === 'yearly' ? 365 : 30);
    
    remainingValue = Math.round((currentDailyRate * daysRemaining) * 100) / 100;
    const targetCostForRemainingDays = targetDailyRate * daysRemaining;
    upgradeAmount = Math.round((targetCostForRemainingDays - remainingValue) * 100) / 100;
  }

  return {
    canUpgrade: true,
    upgradeAmount: Math.max(0.01, upgradeAmount),
    daysRemaining,
    currentPrice,
    targetPrice,
    remainingValue,
    expiresAt: currentSubscription.expires_at,
    calculation: {
      totalDays,
      usedDays,
      remainingDays: daysRemaining,
      priceDifference: targetPrice - currentPrice,
      dailyRateTarget: targetPrice / (targetPeriod === 'yearly' ? 365 : 30)
    }
  };
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
    console.log('收到补差价升级计算请求:', event.body);

    // 解析请求数据
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

    const { userId, targetTier, targetPeriod } = requestData;

    if (!userId || !targetTier || !targetPeriod) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // 查询用户当前订阅
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      console.error('查询用户订阅失败:', error);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No active subscription found' })
      };
    }

    // 计算补差价
    const calculation = calculateProratedUpgrade(subscription, targetTier, targetPeriod);

    console.log('补差价计算完成:', {
      userId,
      currentTier: subscription.tier,  // 🔧 FIX: 使用 tier
      targetTier,
      targetPeriod,
      canUpgrade: calculation.canUpgrade,
      upgradeAmount: calculation.upgradeAmount,
      daysRemaining: calculation.daysRemaining
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        calculation,
        subscription: {
          id: subscription.id,
          tier: subscription.tier,  // 🔧 FIX: 使用 tier
          expires_at: subscription.expires_at,
          started_at: subscription.started_at
        }
      })
    };

  } catch (error) {
    console.error('补差价计算失败:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};