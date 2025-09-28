/**
 * IP级别速率限制中间件
 * @description 防止单IP过度请求，支持滑动窗口算法
 */

const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * 速率限制配置
 */
const RATE_LIMIT_CONFIG = {
  // 默认限制：每分钟60次请求
  default: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 60,
    message: '请求过于频繁，请稍后再试'
  },
  
  // API端点特定限制
  endpoints: {
    '/ai/chat': {
      windowMs: 60 * 1000, // 1分钟 
      maxRequests: 20, // AI请求限制更严格
      message: 'AI请求过于频繁，请稍后再试'
    },
    '/config': {
      windowMs: 60 * 1000,
      maxRequests: 10, // 配置请求限制很严格
      message: '配置请求过于频繁'
    },
    '/hot-topics': {
      windowMs: 60 * 1000,
      maxRequests: 30,
      message: '热点话题请求过于频繁'
    },
    '/generate-image': {
      windowMs: 60 * 1000,
      maxRequests: 5, // 图像生成限制最严格
      message: '图像生成请求过于频繁，请稍后再试'
    }
  },
  
  // VIP用户倍率
  vipMultiplier: {
    trial: 1,
    pro: 2,
    premium: 3
  }
};

/**
 * 内存缓存存储（生产环境建议使用Redis）
 */
const requestCache = new Map();

/**
 * 清理过期记录
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, data] of requestCache.entries()) {
    if (now - data.windowStart > data.windowMs) {
      requestCache.delete(key);
    }
  }
}

/**
 * 获取客户端IP地址
 */
function getClientIP(event) {
  // Netlify环境下获取真实IP
  return event.headers['x-forwarded-for'] ||
         event.headers['x-real-ip'] ||
         event.headers['cf-connecting-ip'] ||
         event.headers['x-client-ip'] ||
         '127.0.0.1';
}

/**
 * 获取API端点路径
 */
function getEndpointPath(event) {
  const path = event.path || event.rawUrl || '';
  
  // 提取主要端点
  if (path.includes('/ai/chat')) return '/ai/chat';
  if (path.includes('/config')) return '/config';
  if (path.includes('/hot-topics')) return '/hot-topics';
  if (path.includes('/generate-image')) return '/generate-image';
  
  return 'default';
}

/**
 * 获取用户等级（用于VIP倍率）
 */
async function getUserTier(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'trial';
  }
  
  try {
    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return 'trial';
    
    // 获取用户订阅信息
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .single();
      
    return subscription?.tier || 'trial';
  } catch (error) {
    console.warn('获取用户等级失败:', error.message);
    return 'trial';
  }
}

/**
 * 记录限制事件到数据库（异步，不影响响应）
 */
async function logRateLimitEvent(ip, endpoint, userTier, isBlocked) {
  try {
    await supabase.from('rate_limit_logs').insert({
      ip_address: ip,
      endpoint: endpoint,
      user_tier: userTier,
      is_blocked: isBlocked,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 日志记录失败不应该影响主流程
    console.error('记录速率限制日志失败:', error.message);
  }
}

/**
 * 速率限制检查
 */
async function checkRateLimit(event) {
  // 定期清理过期记录
  if (Math.random() < 0.01) { // 1%概率清理
    cleanupExpiredRecords();
  }
  
  const ip = getClientIP(event);
  const endpoint = getEndpointPath(event);
  const userTier = await getUserTier(event.headers.authorization);
  
  // 获取对应的限制配置
  const config = RATE_LIMIT_CONFIG.endpoints[endpoint] || RATE_LIMIT_CONFIG.default;
  
  // 应用VIP倍率
  const multiplier = RATE_LIMIT_CONFIG.vipMultiplier[userTier] || 1;
  const effectiveLimit = Math.floor(config.maxRequests * multiplier);
  
  // 生成缓存键
  const cacheKey = `${ip}:${endpoint}`;
  const now = Date.now();
  
  // 获取或创建请求记录
  let requestData = requestCache.get(cacheKey);
  
  if (!requestData || (now - requestData.windowStart) >= config.windowMs) {
    // 新的时间窗口
    requestData = {
      count: 1,
      windowStart: now,
      windowMs: config.windowMs,
      firstRequest: now
    };
    requestCache.set(cacheKey, requestData);
    
    // 异步记录事件
    setImmediate(() => logRateLimitEvent(ip, endpoint, userTier, false));
    
    return { allowed: true, remaining: effectiveLimit - 1 };
  }
  
  // 在现有时间窗口内
  requestData.count++;
  
  if (requestData.count > effectiveLimit) {
    // 超出限制
    console.warn(`🚫 IP ${ip} 在端点 ${endpoint} 超出速率限制:`, {
      count: requestData.count,
      limit: effectiveLimit,
      userTier,
      timeWindow: config.windowMs + 'ms'
    });
    
    // 异步记录阻止事件
    setImmediate(() => logRateLimitEvent(ip, endpoint, userTier, true));
    
    return {
      allowed: false,
      message: config.message,
      retryAfter: Math.ceil((config.windowMs - (now - requestData.windowStart)) / 1000),
      details: {
        limit: effectiveLimit,
        current: requestData.count,
        windowMs: config.windowMs,
        userTier: userTier
      }
    };
  }
  
  // 在限制内
  return { 
    allowed: true, 
    remaining: effectiveLimit - requestData.count,
    resetTime: requestData.windowStart + config.windowMs
  };
}

/**
 * 生成速率限制响应
 */
function createRateLimitResponse(result, headers = {}) {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
    'X-RateLimit-Limit': result.details?.limit || 'unknown',
    'X-RateLimit-Remaining': result.remaining || 0,
    'X-RateLimit-Reset': result.resetTime || Date.now(),
    ...headers
  };

  if (result.retryAfter) {
    defaultHeaders['Retry-After'] = result.retryAfter;
  }

  return {
    statusCode: 429,
    headers: defaultHeaders,
    body: JSON.stringify({
      error: 'Too Many Requests',
      message: result.message || '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: result.retryAfter,
      details: {
        limit: result.details?.limit,
        current: result.details?.current,
        windowMs: result.details?.windowMs,
        userTier: result.details?.userTier
      },
      timestamp: new Date().toISOString()
    })
  };
}

/**
 * 速率限制中间件工厂函数
 */
function createRateLimitMiddleware(options = {}) {
  const {
    enabled = true,
    skipPaths = [],
    customConfig = {}
  } = options;

  return async function rateLimitMiddleware(event) {
    // 如果禁用或在跳过路径中，直接通过
    if (!enabled || skipPaths.some(path => event.path?.includes(path))) {
      return { allowed: true, skipped: true };
    }

    try {
      const result = await checkRateLimit(event);
      
      if (!result.allowed) {
        console.log('🚫 速率限制触发:', {
          ip: getClientIP(event),
          endpoint: getEndpointPath(event),
          method: event.httpMethod,
          userAgent: event.headers['user-agent']?.substring(0, 100),
          timestamp: new Date().toISOString()
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ 速率限制中间件错误:', error);
      // 发生错误时默认允许请求，避免影响服务
      return { allowed: true, error: error.message };
    }
  };
}

/**
 * 获取速率限制统计信息
 */
function getRateLimitStats() {
  const stats = {
    totalCachedIPs: requestCache.size,
    cacheEntries: [],
    memoryUsage: process.memoryUsage()
  };
  
  // 获取前10个最活跃的IP
  const entries = Array.from(requestCache.entries())
    .map(([key, data]) => ({
      key,
      count: data.count,
      windowStart: new Date(data.windowStart).toISOString(),
      remaining: Math.max(0, data.windowMs - (Date.now() - data.windowStart))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  stats.cacheEntries = entries;
  
  return stats;
}

module.exports = {
  checkRateLimit,
  createRateLimitMiddleware,
  createRateLimitResponse,
  getRateLimitStats,
  getClientIP,
  RATE_LIMIT_CONFIG
};