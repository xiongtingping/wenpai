/**
 * API安全中间件
 * 提供请求频率限制、IP白名单、CORS控制等安全功能
 */

// 内存存储（生产环境建议使用Redis）
const rateLimitStore = new Map();
const ipWhitelist = new Set([
  '127.0.0.1',
  '::1',
  // 添加信任的IP地址
]);

/**
 * 获取客户端IP地址
 */
function getClientIP(event) {
  const forwarded = event.headers['x-forwarded-for'];
  const realIP = event.headers['x-real-ip'];
  const remoteAddr = event.headers['remote-addr'];
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || 'unknown';
}

/**
 * 请求频率限制
 * @param {string} key - 限制键（通常是IP地址）
 * @param {number} maxRequests - 最大请求数
 * @param {number} windowMs - 时间窗口（毫秒）
 */
function rateLimit(key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, []);
  }
  
  const requests = rateLimitStore.get(key);
  
  // 清理过期请求
  const validRequests = requests.filter(timestamp => timestamp > windowStart);
  
  if (validRequests.length >= maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: validRequests[0] + windowMs
    };
  }
  
  // 添加当前请求
  validRequests.push(now);
  rateLimitStore.set(key, validRequests);
  
  return {
    limited: false,
    remaining: maxRequests - validRequests.length,
    resetTime: now + windowMs
  };
}

/**
 * 验证请求来源
 */
function validateOrigin(event) {
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.xyz',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
  ].filter(Boolean);
  
  const origin = event.headers.origin || event.headers.referer;
  
  if (!origin) {
    return { valid: false, reason: 'No origin header' };
  }
  
  const isAllowed = allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );
  
  if (!isAllowed) {
    return { valid: false, reason: `Origin ${origin} not allowed` };
  }
  
  return { valid: true };
}

/**
 * 验证请求头
 */
function validateHeaders(event) {
  const userAgent = event.headers['user-agent'];
  const contentType = event.headers['content-type'];
  
  // 检查User-Agent（防止空或可疑的User-Agent）
  if (!userAgent || userAgent.length < 5) {
    return { valid: false, reason: 'Invalid User-Agent' };
  }
  
  // 检查内容类型（对于POST请求）
  if (event.httpMethod === 'POST' && !contentType) {
    return { valid: false, reason: 'Missing Content-Type for POST request' };
  }
  
  return { valid: true };
}

/**
 * 生成安全响应头
 */
function getSecurityHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || 'https://www.wenpai.xyz',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

/**
 * 安全中间件主函数
 */
function securityMiddleware(options = {}) {
  const {
    enableRateLimit = true,
    maxRequests = 10,
    windowMs = 60000,
    enableOriginCheck = true,
    enableIPWhitelist = false,
    skipPaths = []
  } = options;
  
  return function middleware(event, context) {
    const path = event.path || event.rawUrl;
    const clientIP = getClientIP(event);
    
    // 跳过指定路径
    if (skipPaths.some(skipPath => path.includes(skipPath))) {
      return { allowed: true };
    }
    
    // 处理OPTIONS预检请求
    if (event.httpMethod === 'OPTIONS') {
      return {
        allowed: true,
        response: {
          statusCode: 200,
          headers: getSecurityHeaders(event.headers.origin),
          body: ''
        }
      };
    }
    
    // IP白名单检查
    if (enableIPWhitelist && !ipWhitelist.has(clientIP)) {
      console.log(`🚫 IP not in whitelist: ${clientIP}`);
      return {
        allowed: false,
        response: {
          statusCode: 403,
          headers: getSecurityHeaders(),
          body: JSON.stringify({ error: 'Access denied' })
        }
      };
    }
    
    // 请求来源验证
    if (enableOriginCheck) {
      const originCheck = validateOrigin(event);
      if (!originCheck.valid) {
        console.log(`🚫 Invalid origin: ${originCheck.reason}`);
        return {
          allowed: false,
          response: {
            statusCode: 403,
            headers: getSecurityHeaders(),
            body: JSON.stringify({ error: 'Invalid origin' })
          }
        };
      }
    }
    
    // 请求头验证
    const headerCheck = validateHeaders(event);
    if (!headerCheck.valid) {
      console.log(`🚫 Invalid headers: ${headerCheck.reason}`);
      return {
        allowed: false,
        response: {
          statusCode: 400,
          headers: getSecurityHeaders(),
          body: JSON.stringify({ error: 'Invalid request headers' })
        }
      };
    }
    
    // 请求频率限制
    if (enableRateLimit) {
      const limitResult = rateLimit(clientIP, maxRequests, windowMs);
      if (limitResult.limited) {
        console.log(`🚫 Rate limit exceeded for IP: ${clientIP}`);
        return {
          allowed: false,
          response: {
            statusCode: 429,
            headers: {
              ...getSecurityHeaders(),
              'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': limitResult.resetTime.toString()
            },
            body: JSON.stringify({ 
              error: 'Too many requests',
              retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000)
            })
          }
        };
      }
      
      // 添加速率限制头到成功响应
      context.rateLimitHeaders = {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': limitResult.remaining.toString(),
        'X-RateLimit-Reset': limitResult.resetTime.toString()
      };
    }
    
    // 请求被允许
    context.securityHeaders = getSecurityHeaders(event.headers.origin);
    context.clientIP = clientIP;
    
    return { allowed: true };
  };
}

/**
 * 清理过期的频率限制记录（定期调用）
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const validRequests = requests.filter(timestamp => timestamp > fiveMinutesAgo);
    if (validRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validRequests);
    }
  }
}

// 每5分钟清理一次过期记录
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

module.exports = {
  securityMiddleware,
  getSecurityHeaders,
  rateLimit,
  getClientIP,
  cleanupRateLimitStore
};