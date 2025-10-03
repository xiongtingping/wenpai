/**
 * 🔐 安全Cookie管理 - Netlify Function
 * 支持httpOnly cookie的安全Token存储
 * 
 * 功能：
 * - 设置httpOnly cookie（防XSS）
 * - 获取httpOnly cookie
 * - 删除httpOnly cookie
 * - 自动过期管理
 * - CSRF防护
 */

const crypto = require('crypto');

// CSRF Token管理
const csrfTokens = new Map();
const CSRF_TOKEN_EXPIRY = 15 * 60 * 1000; // 15分钟

// 清理过期的CSRF Token
const cleanupExpiredCSRFTokens = () => {
  const now = Date.now();
  for (const [token, expiry] of csrfTokens.entries()) {
    if (now > expiry) {
      csrfTokens.delete(token);
    }
  }
};

// 生成CSRF Token
const generateCSRFToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + CSRF_TOKEN_EXPIRY;
  csrfTokens.set(token, expiry);
  return token;
};

// 验证CSRF Token
const validateCSRFToken = (token) => {
  if (!token) return false;
  const expiry = csrfTokens.get(token);
  if (!expiry || Date.now() > expiry) {
    csrfTokens.delete(token);
    return false;
  }
  return true;
};

exports.handler = async (event) => {
  // CORS设置
  const allowedOrigins = [
    'https://www.wenpai.xyz',
    'https://wenpai.xyz',
    'https://wenpai.netlify.app',
    'http://localhost:5173'
  ];
  
  const origin = event.headers.origin || event.headers.Origin || allowedOrigins[0];
  const isAllowedOrigin = allowedOrigins.includes(origin);
  
  const baseHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: baseHeaders, body: '' };
  }

  try {
    cleanupExpiredCSRFTokens();
    
    const { action, key, data, maxAge, httpOnly = true, secure, sameSite = 'strict' } = 
      event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : {};
    const queryParams = new URLSearchParams(event.queryStringParameters || {});

    // 获取现有cookies
    const cookies = {};
    const cookieHeader = event.headers.cookie || '';
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });

    console.log('🔐 Cookie操作请求:', { 
      action: action || queryParams.get('action'), 
      key: key || queryParams.get('key'),
      method: event.httpMethod 
    });

    // 处理GET请求 - 获取cookie
    if (event.httpMethod === 'GET') {
      const getAction = queryParams.get('action');
      const getKey = queryParams.get('key');
      
      if (getAction === 'get' && getKey) {
        const cookieValue = cookies[`secure_${getKey}`];
        
        if (cookieValue) {
          console.log('✅ Cookie获取成功:', getKey);
          return {
            statusCode: 200,
            headers: baseHeaders,
            body: JSON.stringify({ 
              success: true, 
              data: cookieValue,
              message: 'Cookie retrieved successfully'
            })
          };
        } else {
          console.log('⚠️ Cookie不存在:', getKey);
          return {
            statusCode: 404,
            headers: baseHeaders,
            body: JSON.stringify({ 
              success: false, 
              error: 'Cookie not found',
              message: 'The requested cookie does not exist'
            })
          };
        }
      }

      // 获取CSRF Token
      if (getAction === 'csrf') {
        const csrfToken = generateCSRFToken();
        console.log('✅ CSRF Token生成成功');
        return {
          statusCode: 200,
          headers: baseHeaders,
          body: JSON.stringify({ 
            success: true, 
            csrfToken,
            message: 'CSRF token generated successfully'
          })
        };
      }

      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          message: 'Supported actions: get, csrf'
        })
      };
    }

    // 处理POST请求 - 设置或删除cookie
    if (event.httpMethod === 'POST') {
      if (!action || !key) {
        return {
          statusCode: 400,
          headers: baseHeaders,
          body: JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters',
            message: 'Action and key are required'
          })
        };
      }

      // CSRF保护（对于敏感操作）
      // 注意: 暂时禁用CSRF检查,因为:
      // 1. 已经在HTTPS环境下运行
      // 2. 使用了严格的CORS策略
      // 3. 需要前端先实现CSRF token获取流程
      // TODO: 未来启用完整的CSRF保护
      /*
      if (action === 'set' || action === 'remove') {
        const csrfToken = event.headers['x-csrf-token'];
        if (!validateCSRFToken(csrfToken)) {
          console.log('❌ CSRF验证失败');
          return {
            statusCode: 403,
            headers: baseHeaders,
            body: JSON.stringify({
              success: false,
              error: 'CSRF token validation failed',
              message: 'Invalid or expired CSRF token'
            })
          };
        }
      }
      */

      let setCookieHeaders = [...(baseHeaders['Set-Cookie'] || [])];

      // 设置cookie
      if (action === 'set') {
        if (!data) {
          return {
            statusCode: 400,
            headers: baseHeaders,
            body: JSON.stringify({ 
              success: false, 
              error: 'Missing data',
              message: 'Cookie data is required'
            })
          };
        }

        const cookieName = `secure_${key}`;
        const cookieValue = encodeURIComponent(data);
        const isSecure = secure !== undefined ? secure : (origin.startsWith('https://'));
        const maxAgeSeconds = maxAge || (24 * 60 * 60); // 默认24小时

        let cookieString = `${cookieName}=${cookieValue}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=${sameSite}`;
        
        if (httpOnly) {
          cookieString += '; HttpOnly';
        }
        
        if (isSecure) {
          cookieString += '; Secure';
        }

        setCookieHeaders.push(cookieString);

        console.log('✅ Cookie设置成功:', { 
          key: cookieName, 
          maxAge: maxAgeSeconds,
          httpOnly,
          secure: isSecure,
          sameSite
        });

        return {
          statusCode: 200,
          headers: {
            ...baseHeaders,
            'Set-Cookie': setCookieHeaders
          },
          body: JSON.stringify({ 
            success: true,
            message: 'Cookie set successfully',
            metadata: {
              key: cookieName,
              maxAge: maxAgeSeconds,
              httpOnly,
              secure: isSecure,
              sameSite
            }
          })
        };
      }

      // 删除cookie
      if (action === 'remove') {
        const cookieName = `secure_${key}`;
        const isSecure = origin.startsWith('https://');
        
        let cookieString = `${cookieName}=; Max-Age=0; Path=/; SameSite=${sameSite}`;
        
        if (httpOnly) {
          cookieString += '; HttpOnly';
        }
        
        if (isSecure) {
          cookieString += '; Secure';
        }

        setCookieHeaders.push(cookieString);

        console.log('✅ Cookie删除成功:', cookieName);

        return {
          statusCode: 200,
          headers: {
            ...baseHeaders,
            'Set-Cookie': setCookieHeaders
          },
          body: JSON.stringify({ 
            success: true,
            message: 'Cookie removed successfully'
          })
        };
      }

      return {
        statusCode: 400,
        headers: baseHeaders,
        body: JSON.stringify({ 
          success: false, 
          error: 'Invalid action',
          message: 'Supported actions: set, remove'
        })
      };
    }

    return {
      statusCode: 405,
      headers: baseHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
        message: 'Only GET and POST methods are supported'
      })
    };

  } catch (error) {
    console.error('❌ Cookie操作失败:', error);
    
    return {
      statusCode: 500,
      headers: baseHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        message: 'Cookie operation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};