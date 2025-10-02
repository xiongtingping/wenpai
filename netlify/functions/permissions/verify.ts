/**
 * Netlify Function: 权限验证
 * @endpoint /.netlify/functions/permissions/verify
 */

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

type SubscriptionTier = 'trial' | 'pro' | 'premium';
type ExtendedPermissionType = string;

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

const PERMISSION_TIER_MAP: Record<string, SubscriptionTier> = {
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

const TIER_WEIGHTS: Record<SubscriptionTier, number> = {
  trial: 0,
  pro: 1,
  premium: 2,
};

function getRequiredTier(permission: string): SubscriptionTier {
  return PERMISSION_TIER_MAP[permission] || 'trial';
}

function checkPermission(userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean {
  return TIER_WEIGHTS[userTier] >= TIER_WEIGHTS[requiredTier];
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { userId, permission } = JSON.parse(event.body || '{}');

    if (!userId || !permission) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          hasPermission: false,
          userTier: 'trial',
          requiredTier: getRequiredTier(permission),
          reason: '缺少必填参数',
        } as PermissionVerifyResult),
      };
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || ''
    );

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .single();

    if (error || !subscription) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPermission: permission === 'auth:required' || permission.startsWith('tier:trial'),
          userTier: 'trial',
          requiredTier: getRequiredTier(permission),
          reason: '未找到订阅记录,默认为体验版',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'netlify-function',
          },
        } as PermissionVerifyResult),
      };
    }

    if (subscription.status !== 'active') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPermission: false,
          userTier: 'trial',
          requiredTier: getRequiredTier(permission),
          reason: `订阅状态异常: ${subscription.status}`,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'netlify-function',
          },
        } as PermissionVerifyResult),
      };
    }

    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    if (expiresAt < now) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPermission: false,
          userTier: 'trial',
          requiredTier: getRequiredTier(permission),
          reason: '订阅已过期',
          expiresAt: subscription.expires_at,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'netlify-function',
          },
        } as PermissionVerifyResult),
      };
    }

    const userTier = subscription.tier as SubscriptionTier;
    const requiredTier = getRequiredTier(permission);
    const hasPermission = checkPermission(userTier, requiredTier);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasPermission,
        userTier,
        requiredTier,
        reason: hasPermission ? '权限验证通过' : `需要 ${requiredTier} 或更高等级`,
        expiresAt: subscription.expires_at,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'netlify-function',
        },
      } as PermissionVerifyResult),
    };
  } catch (error) {
    console.error('权限验证错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        hasPermission: false,
        userTier: 'trial',
        requiredTier: 'trial',
        reason: error instanceof Error ? error.message : '权限验证失败',
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'netlify-function',
        },
      } as PermissionVerifyResult),
    };
  }
};
