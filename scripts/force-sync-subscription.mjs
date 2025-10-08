#!/usr/bin/env node
/**
 * 强制同步订阅状态脚本
 * 用于手动触发订阅状态同步，更新用户的 subscription 字段
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function syncSubscription(userId) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase 配置缺失', 'red');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const now = new Date().toISOString();
    log(`\n🔍 查询用户订阅状态: ${userId}`, 'cyan');

    // 查询所有订阅记录
    const { data: allSubs, error: allError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allError) {
      log(`❌ 查询失败: ${allError.message}`, 'red');
      return false;
    }

    log(`\n📋 找到 ${allSubs?.length || 0} 个订阅记录:`, 'blue');
    allSubs?.forEach((sub, index) => {
      const isActive = sub.status === 'active' && new Date(sub.expires_at) > new Date();
      log(`\n订阅 ${index + 1}:`, 'cyan');
      log(`  - ID: ${sub.id}`, 'blue');
      log(`  - 等级: ${sub.tier}`, 'blue');
      log(`  - 状态: ${sub.status}`, isActive ? 'green' : 'yellow');
      log(`  - 到期: ${sub.expires_at}`, 'blue');
      log(`  - 有效: ${isActive ? '✅ 是' : '❌ 否'}`, isActive ? 'green' : 'red');
      log(`  - 订单ID: ${sub.order_id || 'N/A'}`, 'blue');
    });

    // 查询有效订阅
    const { data: activeSub, error: activeError } = await supabase
      .from('user_subscriptions')
      .select('tier, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeError) {
      log(`\n❌ 查询有效订阅失败: ${activeError.message}`, 'red');
      return false;
    }

    if (activeSub) {
      log(`\n✅ 找到有效订阅:`, 'green');
      log(`  - 等级: ${activeSub.tier}`, 'green');
      log(`  - 状态: ${activeSub.status}`, 'green');
      log(`  - 到期: ${activeSub.expires_at}`, 'green');

      const expiresAt = new Date(activeSub.expires_at);
      const daysRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      log(`  - 剩余: ${daysRemaining} 天`, 'green');

      log(`\n💡 用户应该显示为: ${activeSub.tier} 订阅`, 'cyan');
      log(`💡 Token 限额应该是:`, 'cyan');
      if (activeSub.tier === 'pro') {
        log(`  - 使用次数: 30 次/月`, 'blue');
        log(`  - Token: 200,000 tokens/月`, 'blue');
      } else if (activeSub.tier === 'premium') {
        log(`  - 使用次数: 无限制`, 'blue');
        log(`  - Token: 500,000 tokens/月`, 'blue');
      }

      return true;
    } else {
      log(`\n⚠️ 未找到有效订阅`, 'yellow');
      log(`💡 用户应该显示为: trial (试用版)`, 'cyan');
      return false;
    }
  } catch (error) {
    log(`\n❌ 同步失败: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const userId = args[0];

  if (!userId) {
    log('❌ 缺少用户ID参数', 'red');
    log('\n用法:', 'yellow');
    log('  node scripts/force-sync-subscription.mjs <USER_ID>', 'cyan');
    log('\n示例:', 'yellow');
    log('  node scripts/force-sync-subscription.mjs 6882df3f2f9efaa6e241dce5', 'cyan');
    process.exit(1);
  }

  log('\n🚀 开始强制同步订阅状态...', 'cyan');
  
  const success = await syncSubscription(userId);
  
  if (success) {
    log('\n✅ 订阅状态同步完成', 'green');
    log('\n📝 下一步操作:', 'cyan');
    log('1. 清除浏览器缓存（Ctrl+Shift+Delete）', 'yellow');
    log('2. 完全退出登录', 'yellow');
    log('3. 重新登录', 'yellow');
    log('4. 检查使用统计是否更新', 'yellow');
    log('\n💡 如果仍未更新，请检查:', 'cyan');
    log('- 浏览器控制台是否有错误', 'yellow');
    log('- localStorage 中的缓存数据', 'yellow');
    log('- 订阅同步服务是否正常工作', 'yellow');
    process.exit(0);
  } else {
    log('\n❌ 订阅状态同步失败', 'red');
    log('\n📝 请检查:', 'cyan');
    log('- 用户ID是否正确', 'yellow');
    log('- 订阅记录是否存在', 'yellow');
    log('- 订阅是否已过期', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

