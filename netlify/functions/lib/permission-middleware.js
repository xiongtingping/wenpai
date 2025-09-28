/**
 * 权限验证中间件
 * @description 为Netlify函数提供统一的权限验证功能
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
 * 获取用户订阅等级
 */
function getUserTier(user) {
  if (!user) return 'trial';

  // 优先从订阅信息获取
  if (user.subscription_tier) return user.subscription_tier;
  if (user.vip_level === 'premium') return 'premium';
  if (user.vip_level === 'pro') return 'pro';
  if (user.is_vip) return 'pro';

  return 'trial';
}

/**
 * 验证用户身份并获取完整用户信息
 */
async function authenticateUser(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED');
  }
  
  const token = authHeader.substring(7);
  
  try {
    // 验证token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new Error('INVALID_TOKEN');
    }

    // 获取用户订阅信息
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status, features, monthly_token_limit')
      .eq('user_id', user.id)
      .single();

    // 获取用户资料信息
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_vip, vip_level, permissions, role')
      .eq('user_id', user.id)
      .single();

    const enrichedUser = {
      id: user.id,
      email: user.email,
      subscription_tier: subscription?.tier || 'trial',
      subscription_status: subscription?.status || 'active',
      monthly_token_limit: subscription?.monthly_token_limit || 100000,
      is_vip: profile?.is_vip || false,
      vip_level: profile?.vip_level || 'trial',
      permissions: profile?.permissions || [],
      role: profile?.role || 'user'
    };

    console.log('用户认证成功:', {
      userId: enrichedUser.id,
      tier: getUserTier(enrichedUser),
      isVip: enrichedUser.is_vip
    });

    return enrichedUser;
  } catch (error) {
    console.error('用户认证失败:', error);
    if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
      throw error;
    }
    throw new Error('AUTH_ERROR');
  }
}

/**
 * 检查用户权限
 */
function checkUserPermission(user, requiredPermission) {
  const userTier = getUserTier(user);
  
  // 基于权限的检查
  switch (requiredPermission) {
    case 'auth:required':
      return !!user.id;
      
    case 'tier:trial':
      return true;
      
    case 'tier:pro':
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.pro;
      
    case 'tier:premium':
      return PERMISSION_TIERS[userTier] >= PERMISSION_TIERS.premium;
      
    case 'feature:token-usage':
      return !!user.id; // 任何登录用户都可以查看token使用情况
      
    case 'feature:profile-update':
      return !!user.id; // 任何登录用户都可以更新自己的资料
      
    case 'feature:payment':
      return !!user.id; // 任何登录用户都可以进行支付
      
    case 'admin:user-management':
      return user.role === 'admin' || user.role === 'super_admin';
      
    case 'admin:system-config':
      return user.role === 'super_admin';
      
    default:
      // 未知权限，拒绝访问
      return false;
  }
}

/**
 * 验证用户数据访问权限（防止水平越权）
 */
function checkDataAccess(user, targetUserId, resourceType = 'user_data') {
  // 管理员可以访问所有数据
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true;
  }
  
  // 普通用户只能访问自己的数据
  if (resourceType === 'user_data') {
    return user.id === targetUserId;
  }
  
  return false;
}

/**
 * 权限验证中间件工厂函数
 */
function createPermissionMiddleware(requiredPermissions = [], options = {}) {
  const {
    allowAnonymous = false,
    checkDataAccess: enableDataCheck = false,
    customCheck = null
  } = options;

  return async function permissionMiddleware(event) {
    try {
      // 如果允许匿名访问且没有提供认证信息，跳过验证
      if (allowAnonymous && !event.headers.authorization) {
        return { user: null, permissions: [] };
      }

      // 认证用户
      const user = await authenticateUser(event.headers.authorization);
      
      // 检查所需权限
      const permissionResults = requiredPermissions.map(permission => ({
        permission,
        granted: checkUserPermission(user, permission)
      }));
      
      // 检查是否所有权限都通过
      const allPermissionsGranted = permissionResults.every(result => result.granted);
      const deniedPermissions = permissionResults
        .filter(result => !result.granted)
        .map(result => result.permission);
      
      if (!allPermissionsGranted) {
        console.warn('权限验证失败:', {
          userId: user.id,
          userTier: getUserTier(user),
          requiredPermissions,
          deniedPermissions
        });
        
        throw new Error(`PERMISSION_DENIED: ${deniedPermissions.join(', ')}`);
      }

      // 自定义权限检查
      if (customCheck && !customCheck(user, event)) {
        throw new Error('CUSTOM_PERMISSION_DENIED');
      }

      // 数据访问权限检查
      if (enableDataCheck) {
        const { targetUserId } = JSON.parse(event.body || '{}');
        if (targetUserId && !checkDataAccess(user, targetUserId)) {
          throw new Error('DATA_ACCESS_DENIED');
        }
      }

      console.log('权限验证通过:', {
        userId: user.id,
        userTier: getUserTier(user),
        grantedPermissions: requiredPermissions
      });

      return {
        user,
        permissions: requiredPermissions,
        userTier: getUserTier(user)
      };
      
    } catch (error) {
      console.error('权限中间件错误:', error);
      throw error;
    }
  };
}

/**
 * 权限检查结果处理器
 */
function handlePermissionError(error, headers = {}) {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
    ...headers
  };

  if (error.message === 'UNAUTHORIZED' || error.message === 'INVALID_TOKEN') {
    return {
      statusCode: 401,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: 'Unauthorized',
        message: '用户认证失败，请重新登录',
        code: 'AUTH_REQUIRED'
      })
    };
  }

  if (error.message.startsWith('PERMISSION_DENIED')) {
    const deniedPermissions = error.message.replace('PERMISSION_DENIED: ', '');
    return {
      statusCode: 403,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: 'Permission Denied',
        message: `权限不足，缺少权限: ${deniedPermissions}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        deniedPermissions: deniedPermissions.split(', ')
      })
    };
  }

  if (error.message === 'DATA_ACCESS_DENIED') {
    return {
      statusCode: 403,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: 'Access Denied',
        message: '无权访问其他用户的数据',
        code: 'DATA_ACCESS_DENIED'
      })
    };
  }

  if (error.message === 'CUSTOM_PERMISSION_DENIED') {
    return {
      statusCode: 403,
      headers: defaultHeaders,
      body: JSON.stringify({
        error: 'Permission Denied',
        message: '自定义权限检查失败',
        code: 'CUSTOM_CHECK_FAILED'
      })
    };
  }

  // 其他错误
  return {
    statusCode: 500,
    headers: defaultHeaders,
    body: JSON.stringify({
      error: 'Internal Server Error',
      message: '服务器内部错误',
      code: 'SERVER_ERROR'
    })
  };
}

module.exports = {
  createPermissionMiddleware,
  handlePermissionError,
  authenticateUser,
  checkUserPermission,
  checkDataAccess,
  getUserTier
};