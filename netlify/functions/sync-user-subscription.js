/**
 * 同步用户订阅状态
 * 从 user_subscriptions 表读取最新的订阅等级并返回
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function handler(event) {
  // 只允许 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { userId } = JSON.parse(event.body);

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'userId is required' })
      };
    }

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 查询用户的有效订阅
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = 没有找到记录，这是正常情况
      console.error('查询订阅失败:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to query subscription' })
      };
    }

    // 返回订阅等级
    const tier = subscription?.tier || 'free';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        tier,
        hasSubscription: !!subscription,
        expiresAt: subscription?.expires_at || null
      })
    };

  } catch (error) {
    console.error('同步订阅状态失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}

