#!/usr/bin/env node
/**
 * 诊断订阅同步问题
 * 检查用户订阅状态为什么没有正确同步到前端
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ 缺少环境变量');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const USER_ID = '6882df3f2f9efaa6e241dce5';
const ORDER_ID = 'WP17598937175698938';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

async function main() {
  log('\n🔍 开始诊断订阅同步问题...', 'cyan');

  try {
    // 1. 检查订阅记录
    section('1. 检查 user_subscriptions 表');
    
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false });

    if (subError) {
      log(`❌ 查询失败: ${subError.message}`, 'red');
    } else {
      log(`✅ 找到 ${subscriptions.length} 条订阅记录`, 'green');
      subscriptions.forEach((sub, index) => {
        log(`\n订阅 ${index + 1}:`, 'blue');
        log(`  ID: ${sub.id}`, 'yellow');
        log(`  等级: ${sub.tier}`, sub.tier === 'pro' ? 'green' : 'yellow');
        log(`  状态: ${sub.status}`, sub.status === 'active' ? 'green' : 'red');
        log(`  周期: ${sub.period}`, 'yellow');
        log(`  开始: ${sub.started_at}`, 'yellow');
        log(`  到期: ${sub.expires_at}`, 'yellow');
        log(`  订单ID: ${sub.order_id}`, 'yellow');
        log(`  支付ID: ${sub.last_payment_id}`, 'yellow');
        log(`  创建时间: ${sub.created_at}`, 'yellow');
      });
    }

    // 2. 检查有效订阅
    section('2. 检查有效订阅（status=active 且未过期）');
    
    const now = new Date().toISOString();
    const { data: activeSubscriptions, error: activeError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('status', 'active')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (activeError) {
      log(`❌ 查询失败: ${activeError.message}`, 'red');
    } else if (activeSubscriptions.length === 0) {
      log(`❌ 没有找到有效订阅！`, 'red');
      log(`   当前时间: ${now}`, 'yellow');
    } else {
      log(`✅ 找到 ${activeSubscriptions.length} 条有效订阅`, 'green');
      const activeSub = activeSubscriptions[0];
      log(`\n当前有效订阅:`, 'green');
      log(`  等级: ${activeSub.tier}`, 'green');
      log(`  状态: ${activeSub.status}`, 'green');
      log(`  到期: ${activeSub.expires_at}`, 'green');
      
      // 计算剩余天数
      const expiresAt = new Date(activeSub.expires_at);
      const daysRemaining = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      log(`  剩余天数: ${daysRemaining} 天`, daysRemaining > 7 ? 'green' : 'yellow');
    }

    // 3. 检查订单记录
    section('3. 检查 orders 表');
    
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', ORDER_ID);

    if (orderError) {
      log(`❌ 查询失败: ${orderError.message}`, 'red');
    } else if (orders.length === 0) {
      log(`❌ 没有找到订单 ${ORDER_ID}`, 'red');
    } else {
      const order = orders[0];
      log(`✅ 找到订单`, 'green');
      log(`  订单ID: ${order.order_id}`, 'yellow');
      log(`  用户ID: ${order.user_id}`, 'yellow');
      log(`  产品类型: ${order.product_type}`, 'yellow');
      log(`  订阅周期: ${order.duration_type}`, 'yellow');
      log(`  金额: ${order.amount}`, 'yellow');
      log(`  状态: ${order.status}`, order.status === 'paid' ? 'green' : 'yellow');
      log(`  创建时间: ${order.created_at}`, 'yellow');
      log(`  支付时间: ${order.paid_at}`, 'yellow');
      log(`  处理时间: ${order.processed_at}`, 'yellow');
    }

    // 4. 检查使用日志
    section('4. 检查 user_usage_logs 表');
    
    const { data: usageLogs, error: usageError } = await supabase
      .from('user_usage_logs')
      .select('*')
      .eq('user_id', USER_ID)
      .order('created_at', { ascending: false })
      .limit(10);

    if (usageError) {
      log(`❌ 查询失败: ${usageError.message}`, 'red');
    } else {
      log(`✅ 找到 ${usageLogs.length} 条使用记录`, 'green');
      if (usageLogs.length > 0) {
        log(`\n最近的使用记录:`, 'blue');
        usageLogs.slice(0, 5).forEach((log_entry, index) => {
          console.log(`  ${index + 1}. ${log_entry.feature_id} - ${log_entry.created_at}`);
        });
      }
    }

    // 5. 分析问题
    section('5. 问题分析');

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      const activeSub = activeSubscriptions[0];
      
      log('\n✅ 数据库层面：订阅状态正确', 'green');
      log(`   - 等级: ${activeSub.tier}`, 'green');
      log(`   - 状态: ${activeSub.status}`, 'green');
      log(`   - 订单ID: ${activeSub.order_id}`, 'green');
      
      log('\n❌ 前端显示问题可能原因:', 'yellow');
      log('   1. 浏览器缓存未清除', 'yellow');
      log('   2. localStorage 中的旧数据未更新', 'yellow');
      log('   3. 订阅同步服务未被调用', 'yellow');
      log('   4. useSubscriptionStatus Hook 返回了缓存的旧数据', 'yellow');
      log('   5. useUnifiedUsageStats Hook 使用了错误的 tier', 'yellow');
      
      log('\n🔧 建议的修复步骤:', 'cyan');
      log('   1. 完全退出登录', 'cyan');
      log('   2. 清除浏览器所有数据（Ctrl+Shift+Delete）', 'cyan');
      log('   3. 关闭所有浏览器窗口', 'cyan');
      log('   4. 重新打开浏览器', 'cyan');
      log('   5. 重新登录', 'cyan');
      log('   6. 检查浏览器控制台日志，查找订阅同步相关的日志', 'cyan');
      
      log('\n🔍 需要检查的日志关键词:', 'magenta');
      log('   - "🔄 开始同步用户订阅状态"', 'magenta');
      log('   - "✅ 订阅状态已同步"', 'magenta');
      log('   - "🔍 查询用户订阅状态"', 'magenta');
      log('   - "✅ 找到有效订阅"', 'magenta');
      log('   - "getUserTier"', 'magenta');
      
    } else {
      log('\n❌ 数据库层面：没有找到有效订阅', 'red');
      log('   可能原因:', 'yellow');
      log('   1. 订阅记录的 status 不是 "active"', 'yellow');
      log('   2. 订阅已过期（expires_at < 当前时间）', 'yellow');
      log('   3. 订阅记录未正确创建', 'yellow');
    }

    // 6. 生成修复脚本
    section('6. 生成修复建议');

    if (subscriptions && subscriptions.length > 0) {
      const sub = subscriptions[0];
      
      // 检查是否需要修复
      const needsFix = [];
      
      if (sub.status !== 'active') {
        needsFix.push('status 不是 active');
      }
      
      const expiresAt = new Date(sub.expires_at);
      if (expiresAt < new Date()) {
        needsFix.push('订阅已过期');
      }
      
      if (!sub.order_id) {
        needsFix.push('缺少 order_id');
      }
      
      if (!sub.last_payment_id) {
        needsFix.push('缺少 last_payment_id');
      }
      
      if (needsFix.length > 0) {
        log('\n⚠️ 发现需要修复的问题:', 'yellow');
        needsFix.forEach(issue => log(`   - ${issue}`, 'yellow'));
        
        log('\n修复 SQL:', 'cyan');
        console.log(`
UPDATE user_subscriptions
SET 
  status = 'active',
  order_id = '${ORDER_ID}',
  last_payment_id = '${ORDER_ID}',
  updated_at = NOW()
WHERE id = '${sub.id}';
        `);
      } else {
        log('\n✅ 订阅记录完整，无需修复', 'green');
      }
    }

  } catch (error) {
    log(`\n❌ 诊断失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

