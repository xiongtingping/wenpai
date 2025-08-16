/**
 * 使用次数统计 API（Netlify Function）
 * 路由：/.netlify/functions/api/usage-count/*
 * - GET /user/usage/:id         获取累计使用次数 { totalUsed }
 * - POST /consume-usage         消费次数 { userId, amount }
 */

const { createClient } = require('@supabase/supabase-js');

// 初始化 Supabase 客户端
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function getTotalUsed(userId) {
  try {
    // 统计使用记录表中的次数（示例：usage_count_records）
    const { data, error } = await supabase
      .from('usage_count_records')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;

    // 使用 count 头获取总次数
    const totalUsed = data && Array.isArray(data) ? data.length : (typeof data === 'number' ? data : 0);

    return { totalUsed };
  } catch (err) {
    console.error('查询使用次数失败:', err);
    // 兼容：若表不存在，返回0，避免前端报错
    return { totalUsed: 0 };
  }
}

async function consumeUsage(userId, amount = 1) {
  try {
    const records = Array.from({ length: Math.max(1, amount) }).map((_, i) => ({
      id: `usage_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 8)}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('usage_count_records').insert(records);
    if (error) throw error;

    return { success: true, inserted: records.length };
  } catch (err) {
    console.error('消费使用次数失败:', err);
    return { success: false };
  }
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api/usage-count', '');
    const method = event.httpMethod;

    if (method === 'GET' && /^\/user\/usage\//.test(path)) {
      const userId = path.split('/').pop();
      const result = await getTotalUsed(userId);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    if (method === 'POST' && path === '/consume-usage') {
      const { userId, amount } = JSON.parse(event.body || '{}');
      const result = await consumeUsage(userId, amount);
      return { statusCode: 200, headers, body: JSON.stringify(result) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

