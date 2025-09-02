/**
 * 订单过期清理 Netlify Function
 * 定期清理过期的待支付订单
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 清理过期订单
 */
async function cleanupExpiredOrders() {
  try {
    console.log('🧹 开始清理过期订单...');
    const now = new Date();
    
    // 1. 查找过期的 pending 订单（创建时间超过1小时）
    const { data: expiredOrders, error: queryError } = await supabase
      .from('orders')
      .select('order_id, created_at, user_id')
      .eq('status', 'pending')
      .lt('created_at', new Date(now.getTime() - 60 * 60 * 1000).toISOString());

    if (queryError) {
      throw new Error(`查询过期订单失败: ${queryError.message}`);
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('✅ 没有需要清理的过期订单');
      return { cleaned: 0, errors: 0 };
    }

    console.log(`发现 ${expiredOrders.length} 个过期订单，开始清理...`);

    let cleaned = 0;
    let errors = 0;

    // 2. 逐个标记为过期（保留数据用于分析）
    for (const order of expiredOrders) {
      try {
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'expired'
          })
          .eq('order_id', order.order_id);

        if (updateError) {
          console.error(`标记订单过期失败: ${order.order_id}`, updateError);
          errors++;
        } else {
          console.log(`✅ 订单已标记过期: ${order.order_id}`);
          cleaned++;
        }
      } catch (err) {
        console.error(`处理订单失败: ${order.order_id}`, err);
        errors++;
      }
    }

    console.log(`🎉 过期订单清理完成: 清理${cleaned}个，失败${errors}个`);
    return { cleaned, errors, total: expiredOrders.length };

  } catch (error) {
    console.error('❌ 清理过期订单失败:', error);
    throw error;
  }
}

/**
 * 清理旧的过期订单记录（超过30天的）
 */
async function cleanupOldExpiredOrders() {
  try {
    console.log('🗑️ 清理旧的过期订单记录...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { data: oldOrders, error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('status', 'expired')
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (deleteError) {
      console.error('删除旧订单失败:', deleteError);
      return { deleted: 0 };
    }

    const deletedCount = oldOrders ? oldOrders.length : 0;
    console.log(`✅ 删除了 ${deletedCount} 个30天前的过期订单`);
    return { deleted: deletedCount };

  } catch (error) {
    console.error('❌ 清理旧订单失败:', error);
    return { deleted: 0 };
  }
}

/**
 * Netlify Function 入口
 */
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    console.log('🚀 订单清理任务开始执行...');
    
    // 清理过期订单
    const cleanupResult = await cleanupExpiredOrders();
    
    // 清理旧记录（可选，避免数据库过大）
    const oldCleanupResult = await cleanupOldExpiredOrders();

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      expiredOrders: cleanupResult,
      oldOrdersCleanup: oldCleanupResult,
      message: `清理完成: 过期${cleanupResult.cleaned}个, 删除旧记录${oldCleanupResult.deleted}个`
    };

    console.log('✅ 订单清理任务完成:', result);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('❌ 订单清理任务失败:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};