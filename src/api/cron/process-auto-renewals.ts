/**
 * 定时任务: 处理自动续费
 * @description 每天运行一次,处理即将到期的自动续费订阅
 * @created 2025-10-02
 */

import { subscriptionExpiryService } from '@/services/subscriptionExpiryService';

/**
 * GET /api/cron/process-auto-renewals
 * 定时任务端点 - 处理自动续费
 */
export async function GET(request: Request) {
  try {
    // 验证调用来源
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return Response.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    console.log('[Cron] Starting auto-renewals processing...');

    // 处理自动续费
    const result = await subscriptionExpiryService.processAutoRenewals();

    console.log('[Cron] Auto-renewals processing complete', result);

    return Response.json({
      success: true,
      message: '自动续费处理完成',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Cron] Error processing auto-renewals:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
