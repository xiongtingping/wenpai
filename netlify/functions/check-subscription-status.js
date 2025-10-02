/**
 * 检查用户订阅状态 Netlify Function
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建 Supabase 客户端（使用 Service Role Key）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing userId parameter' })
      };
    }

    console.log('检查用户订阅状态:', { userId });
    console.log('Supabase配置:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });

    // 检查用户是否有有效订阅
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('查询订阅状态失败:', error);
      console.error('错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Database query failed',
          details: error.message,
          code: error.code
        })
      };
    }

    const hasActiveSubscription = !!data;
    
    console.log('用户订阅状态检查结果:', { 
      userId, 
      hasActiveSubscription,
      subscriptionData: data
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        hasActiveSubscription,
        subscriptionData: data
      })
    };

  } catch (error) {
    console.error('检查订阅状态失败:', error);
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