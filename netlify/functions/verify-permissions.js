/**
 * Netlify Function: 服务器端权限验证API
 * @description 提供统一的权限验证服务，防止前端权限绕过
 * @method POST
 * @body { permissions: string[], forceRefresh?: boolean }
 */

const { createClient } = require('@supabase/supabase-js');

// 初始化Supabase客户端
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * 权限等级定义
 */
const PERMISSION_TIERS = {
  trial: 0,
  pro: 1,
  premium: 2
};

/**
 * 权限配置映射 - 与前端保持一致
 */
const PERMISSION_CONFIGS = {
  'auth:required': {
    name: '登录权限',
    requiredTier: 'trial',
    check: (user) => !!user?.id
  },
  'tier:trial': {
    name: '体验版',
    requiredTier: 'trial',
    check: () => true
  },
  'tier:pro': {
    name: '专业版',
    requiredTier: 'pro',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.pro;
    }
  },
  'tier:premium': {
    name: '高级版',
    requiredTier: 'premium',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.premium;
    }
  },
  'feature:creative-studio': {
    name: '创意魔方',
    requiredTier: 'pro',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.pro;
    }
  },
  'feature:brand-library': {
    name: '品牌库',
    requiredTier: 'premium',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.premium;
    }
  },
  'feature:unlimited-usage': {
    name: '无限使用',
    requiredTier: 'premium',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.premium;
    }
  },
  'feature:advanced-models': {
    name: '高级AI模型',
    requiredTier: 'pro',
    check: (user) => {
      if (!user) return false;
      const userTier = getUserTier(user);
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.pro;
    }
  }
};

/**
 * 获取用户订阅等级
 */
function getUserTier(user) {
  if (!user) return 'trial';

  // 优先从订阅信息获取
  if (user.subscription?.tier) {
    return user.subscription.tier;
  }

  // 从VIP等级推断
  if (user.vipLevel === 'premium') return 'premium';
  if (user.vipLevel === 'pro') return 'pro';
  if (user.isVip) return 'pro';

  // 从权限推断
  if (user.permissions?.includes('tier:premium')) return 'premium';
  if (user.permissions?.includes('tier:pro')) return 'pro';

  return 'trial';
}

/**
 * 验证用户身份并获取用户信息
 */
async function verifyUserAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('未提供有效的认证信息');
  }
  
  const token = authHeader.substring(7);
  
  try {
    // 使用Supabase验证token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('用户认证失败');
    }

    // 获取用户订阅信息
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status, features')
      .eq('user_id', user.id)
      .single();

    // 获取用户权限信息
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('is_vip, vip_level, permissions')
      .eq('user_id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email,
      subscription: subscription || { tier: 'trial', status: 'active' },
      isVip: userProfile?.is_vip || false,
      vipLevel: userProfile?.vip_level || 'trial',
      permissions: userProfile?.permissions || []
    };
  } catch (error) {
    console.error('用户认证失败:', error);
    throw new Error('用户认证失败');
  }
}

/**
 * 检查单个权限
 */
function checkPermission(user, permission) {
  const config = PERMISSION_CONFIGS[permission];
  
  if (!config) {
    return {
      permission,
      hasPermission: false,
      userTier: getUserTier(user),
      requiredTier: 'unknown',
      description: '未知权限',
      reason: `权限配置不存在: ${permission}`
    };
  }

  const hasPermission = config.check(user);
  const userTier = getUserTier(user);
  
  return {
    permission,
    hasPermission,
    userTier,
    requiredTier: config.requiredTier,
    description: config.name,
    reason: hasPermission ? '权限验证通过' : `需要${config.name}权限`
  };
}

/**
 * 权限验证缓存
 */
const permissionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

/**
 * 获取缓存键
 */
function getCacheKey(userId, permissions) {
  return `${userId}:${permissions.sort().join(',')}`;
}

/**
 * 主处理函数
 */
exports.handler = async (event, context) => {
  // 设置CORS头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // 处理OPTIONS请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        message: '权限验证API只支持POST请求'
      })
    };
  }

  try {
    // 验证用户身份
    const user = await verifyUserAuth(event.headers.authorization);
    
    // 解析请求体
    const { permissions, forceRefresh = false } = JSON.parse(event.body || '{}');
    
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid request',
          message: '权限列表不能为空'
        })
      };
    }

    // 检查缓存（除非强制刷新）
    const cacheKey = getCacheKey(user.id, permissions);
    if (!forceRefresh && permissionCache.has(cacheKey)) {
      const cached = permissionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('返回缓存的权限验证结果:', { userId: user.id, permissions });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...cached.result,
            cached: true,
            cachedAt: new Date(cached.timestamp).toISOString()
          })
        };
      } else {
        // 缓存过期，删除
        permissionCache.delete(cacheKey);
      }
    }

    // 验证每个权限
    const results = permissions.map(permission => checkPermission(user, permission));
    const allPermissionsGranted = results.every(result => result.hasPermission);
    
    const response = {
      userId: user.id,
      userTier: getUserTier(user),
      allPermissionsGranted,
      results,
      verifiedAt: new Date().toISOString(),
      cached: false
    };

    // 缓存结果
    permissionCache.set(cacheKey, {
      result: response,
      timestamp: Date.now()
    });

    // 记录权限验证日志
    console.log('权限验证完成:', {
      userId: user.id,
      userTier: getUserTier(user),
      permissions,
      allGranted: allPermissionsGranted,
      timestamp: new Date().toISOString()
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('权限验证API错误:', error);
    
    // 根据错误类型返回不同状态码
    let statusCode = 500;
    if (error.message.includes('认证失败')) {
      statusCode = 401;
    } else if (error.message.includes('权限不足')) {
      statusCode = 403;
    }
    
    return {
      statusCode,
      headers,
      body: JSON.stringify({
        error: 'Permission verification failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// 定期清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of permissionCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      permissionCache.delete(key);
    }
  }
}, 60000); // 每分钟清理一次