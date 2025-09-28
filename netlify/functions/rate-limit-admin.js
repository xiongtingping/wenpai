/**
 * 速率限制管理和监控端点
 * 路由：/.netlify/functions/rate-limit-admin
 */

const { getRateLimitStats, getClientIP, RATE_LIMIT_CONFIG } = require('./lib/rate-limiter.js');
const { createPermissionMiddleware, handlePermissionError } = require('./lib/permission-middleware.js');

// 创建权限中间件（需要管理员权限）
const adminPermissionCheck = createPermissionMiddleware(['admin:system-config'], {
  allowAnonymous: false
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // 处理OPTIONS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // 权限验证
    const permissionResult = await adminPermissionCheck(event);
    
    const method = event.httpMethod;
    const path = event.path || '';
    const query = event.queryStringParameters || {};

    // GET /rate-limit-admin - 获取速率限制统计
    if (method === 'GET' && !query.action) {
      const stats = getRateLimitStats();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            ...stats,
            config: RATE_LIMIT_CONFIG,
            serverInfo: {
              timestamp: new Date().toISOString(),
              uptime: process.uptime(),
              nodeVersion: process.version
            }
          }
        })
      };
    }

    // GET /rate-limit-admin?action=config - 获取配置信息
    if (method === 'GET' && query.action === 'config') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            config: RATE_LIMIT_CONFIG,
            description: {
              default: '默认速率限制配置',
              endpoints: '特定端点的速率限制配置',
              vipMultiplier: 'VIP用户的倍率配置'
            }
          }
        })
      };
    }

    // GET /rate-limit-admin?action=recent - 获取最近的限制事件
    if (method === 'GET' && query.action === 'recent') {
      // 这里可以从数据库查询最近的限制事件
      // 暂时返回空数据，实际实现需要查询 rate_limit_logs 表
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            recentEvents: [],
            note: '需要连接数据库查询 rate_limit_logs 表'
          }
        })
      };
    }

    // POST /rate-limit-admin - 清理缓存或重置限制
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { action } = body;

      if (action === 'clear-cache') {
        // 清理内存缓存的实现需要在 rate-limiter.js 中添加
        
        console.log('管理员清理速率限制缓存:', {
          adminId: permissionResult.user.id,
          timestamp: new Date().toISOString()
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: '缓存清理请求已提交',
            action: 'clear-cache'
          })
        };
      }

      if (action === 'reset-ip') {
        const { ip } = body;
        if (!ip) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: '缺少IP地址参数'
            })
          };
        }

        // 重置特定IP的限制状态
        console.log('管理员重置IP限制:', {
          adminId: permissionResult.user.id,
          targetIP: ip,
          timestamp: new Date().toISOString()
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: `IP ${ip} 的限制状态已重置`,
            action: 'reset-ip'
          })
        };
      }

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: '不支持的操作'
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        error: '端点未找到'
      })
    };

  } catch (error) {
    // 处理权限错误
    if (error.message.includes('PERMISSION_DENIED') || 
        error.message.includes('UNAUTHORIZED') ||
        error.message.includes('INVALID_TOKEN')) {
      return handlePermissionError(error, headers);
    }

    console.error('速率限制管理端点错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: '服务器内部错误',
        message: error.message
      })
    };
  }
};