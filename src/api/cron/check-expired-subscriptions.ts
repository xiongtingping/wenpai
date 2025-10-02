/**
 * 定时任务: 检查过期订阅
 * @description 每天运行一次,检查并处理过期订阅
 * @created 2025-10-02
 */

import { subscriptionExpiryService } from '@/services/subscriptionExpiryService';

/**
 * GET /api/cron/check-expired-subscriptions
 * 定时任务端点 - 由Vercel Cron或其他调度器调用
 */
export async function GET(request: Request) {
  try {
    // 验证是否从Cron调用 (可选)
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('[Cron] Starting expired subscriptions check...');

    // 执行过期检查
    const result = await subscriptionExpiryService.checkExpiredSubscriptions(false);

    console.log('[Cron] Expired subscriptions check complete', result);

    return Response.json({
      success: true,
      message: '过期订阅检查完成',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cron] Error checking expired subscriptions:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
