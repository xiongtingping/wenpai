/**
 * 权限验证API
 * @description 后端权限验证端点,防止前端绕过
 * @created 2025-10-02
 */

import { createClient } from '@supabase/supabase-js';
import type { ExtendedPermissionType } from '@/types/permissions';
import type { SubscriptionTier } from '@/types/subscription';

/**
 * 权限验证结果接口
 */
interface PermissionVerifyResult {
  success: boolean;
  hasPermission: boolean;
  userTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  reason?: string;
  expiresAt?: string;
  metadata?: {
    timestamp: string;
    source: string;
  };
}

/**
 * 权限等级映射
 */
const PERMISSION_TIER_MAP: Record<ExtendedPermissionType, SubscriptionTier> = {
  'auth:required': 'trial',
  'tier:trial': 'trial',
  'tier:pro': 'pro',
  'tier:premium': 'premium',
  'feature:creative-studio': 'pro',
  'feature:creative-cube': 'pro',
  'feature:marketing-calendar': 'pro',
  'feature:wechat-templates': 'pro',
  'feature:emoji-generator': 'pro',
  'feature:brand-library': 'premium',
  'feature:unlimited-usage': 'premium',
  'feature:advanced-models': 'pro',
  'model:trial': 'trial',
  'model:pro': 'pro',
  'model:premium': 'premium',
  'theme:basic': 'trial',
  'theme:advanced': 'pro',
  'theme:premium': 'premium',
};

/**
 * 订阅等级权重
 */
const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  free: -1,
  trial: 0,
  pro: 1,
  premium: 2,
};

/**
 * 获取所需订阅等级
 */
function getRequiredTier(permission: ExtendedPermissionType): SubscriptionTier {
  return PERMISSION_TIER_MAP[permission] || 'trial';
}

/**
 * 检查权限
 */
function checkPermission(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_WEIGHTS[userTier] >= TIER_WEIGHTS[requiredTier];
}

/**
 * POST /api/permissions/verify
 * 验证单个权限
 */
export async function POST(request: Request) {
  try {
    const { userId, permission } = await request.json();

    // 验证必填参数
    if (!userId || !permission) {
      return Response.json({
        success: false,
        hasPermission: false,
        userTier: 'trial',
        requiredTier: getRequiredTier(permission),
        reason: '缺少必填参数'
      } as PermissionVerifyResult, { status: 400 });
    }

    // 初始化 Supabase 客户端
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    // 从数据库获取用户订阅信息
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      // 用户没有订阅记录,默认为试用版
      return Response.json({
        success: true,
        hasPermission: permission === 'auth:required' || permission.startsWith('tier:trial'),
        userTier: 'trial',
        requiredTier: getRequiredTier(permission),
        reason: '未找到订阅记录,默认为体验版',
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'api'
        }
      } as PermissionVerifyResult);
    }

    // 检查订阅状态
    if (subscription.status !== 'active') {
      return Response.json({
        success: true,
        hasPermission: false,
        userTier: 'trial',
        requiredTier: getRequiredTier(permission),
        reason: `订阅状态异常: ${subscription.status}`,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'api'
        }
      } as PermissionVerifyResult);
    }

    // 检查订阅是否过期
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      return Response.json({
        success: true,
        hasPermission: false,
        userTier: 'trial',
        requiredTier: getRequiredTier(permission),
        reason: '订阅已过期',
        expiresAt: subscription.expires_at,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'api'
        }
      } as PermissionVerifyResult);
    }

    // 验证权限
    const userTier = subscription.tier as SubscriptionTier;
    const requiredTier = getRequiredTier(permission as ExtendedPermissionType);
    const hasPermission = checkPermission(userTier, requiredTier);

    return Response.json({
      success: true,
      hasPermission,
      userTier,
      requiredTier,
      reason: hasPermission ? '权限验证通过' : `需要 ${requiredTier} 或更高等级`,
      expiresAt: subscription.expires_at,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'api'
      }
    } as PermissionVerifyResult);

  } catch (error) {
    console.error('权限验证错误:', error);
    return Response.json({
      success: false,
      hasPermission: false,
      userTier: 'trial',
      requiredTier: 'trial',
      reason: error instanceof Error ? error.message : '权限验证失败',
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'api'
      }
    } as PermissionVerifyResult, { status: 500 });
  }
}

/**
 * POST /api/permissions/verify-batch
 * 批量验证权限
 */
export async function verifyBatchPermissions(request: Request) {
  try {
    const { userId, permissions } = await request.json();

    if (!userId || !Array.isArray(permissions)) {
      return Response.json({
        success: false,
        error: '缺少必填参数'
      }, { status: 400 });
    }

    // 获取用户订阅信息
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .single();

    const userTier: SubscriptionTier = subscription?.tier || 'trial';

    // 批量验证
    const results = permissions.map((permission: ExtendedPermissionType) => {
      const requiredTier = getRequiredTier(permission);
      const hasPermission = checkPermission(userTier, requiredTier);

      return {
        permission,
        hasPermission,
        requiredTier
      };
    });

    const allGranted = results.every(r => r.hasPermission);

    return Response.json({
      success: true,
      allGranted,
      userTier,
      results,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'api'
      }
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : '批量验证失败'
    }, { status: 500 });
  }
}
