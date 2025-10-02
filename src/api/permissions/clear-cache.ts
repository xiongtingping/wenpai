/**
 * 清除权限缓存API
 * @description 支付成功后清除用户权限缓存,确保权限立即生效
 * @created 2025-10-02
 */

import { permissionCache } from '@/services/permissionCacheService';

/**
 * POST /api/permissions/clear-cache
 * 清除指定用户的权限缓存
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({
        success: false,
        error: '缺少userId参数'
      }, { status: 400 });
    }

    // 清除指定用户的缓存
    permissionCache.clearUserCache(userId);

    console.log(`[Cache] Cleared permission cache for user: ${userId}`);

    return Response.json({
      success: true,
      message: `已清除用户 ${userId} 的权限缓存`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cache] Clear cache error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/permissions/clear-cache
 * 清除所有权限缓存
 */
export async function DELETE() {
  try {
    const statsBefore = permissionCache.getStats();

    // 清除所有缓存
    permissionCache.clearAll();

    console.log('[Cache] Cleared all permission cache');

    return Response.json({
      success: true,
      message: '已清除所有权限缓存',
      clearedItems: statsBefore.size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cache] Clear all cache error:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/permissions/clear-cache
 * 获取缓存统计信息
 */
export async function GET() {
  const stats = permissionCache.getStats();

  return Response.json({
    success: true,
    stats,
    timestamp: new Date().toISOString()
  });
}
