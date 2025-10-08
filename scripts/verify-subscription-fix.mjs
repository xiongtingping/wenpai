#!/usr/bin/env node
/**
 * 验证订阅修复脚本
 * 自动检查所有修复是否成功
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

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function verifyTableStructure(supabase) {
  section('1. 验证表结构');
  
  try {
    // 检查 order_id 列是否存在
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'user_subscriptions' 
          AND column_name = 'order_id'
        `
      })
      .catch(() => ({ data: null, error: null }));

    // 如果 RPC 不可用，尝试直接查询
    const { data: columns, error: colError } = await supabase
      .from('user_subscriptions')
      .select('order_id')
      .limit(0);

    if (colError && colError.message.includes('column "order_id" does not exist')) {
      log('❌ order_id 列不存在', 'red');
      log('   请执行步骤 1 的 SQL 脚本', 'yellow');
      return false;
    } else {
      log('✅ order_id 列已存在', 'green');
      return true;
    }
  } catch (error) {
    log(`⚠️ 无法验证表结构: ${error.message}`, 'yellow');
    return null;
  }
}

async function verifyRLSPolicies(supabase) {
  section('2. 验证 RLS 策略');
  
  try {
    // 尝试查询订阅（测试 RLS 策略）
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42501') {
        log('❌ RLS 策略过于严格，阻止了查询', 'red');
        log('   请执行步骤 1 的 SQL 脚本更新策略', 'yellow');
        return false;
      } else {
        log(`⚠️ 查询失败: ${error.message}`, 'yellow');
        return null;
      }
    } else {
      log('✅ RLS 策略正常，可以查询数据', 'green');
      return true;
    }
  } catch (error) {
    log(`⚠️ 无法验证 RLS 策略: ${error.message}`, 'yellow');
    return null;
  }
}

async function verifyOrderAndSubscription(supabase, orderId, userId) {
  section('3. 验证订单和订阅');
  
  try {
    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      log(`❌ 订单不存在: ${orderId}`, 'red');
      return false;
    }

    log(`✅ 订单存在: ${orderId}`, 'green');
    log(`   状态: ${order.status}`, 'blue');
    log(`   用户: ${order.user_id}`, 'blue');
    log(`   产品: ${order.product_type}`, 'blue');

    // 查询订阅
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subError) {
      log(`❌ 订阅查询失败: ${subError.message}`, 'red');
      return false;
    }

    if (!subscriptions || subscriptions.length === 0) {
      log('❌ 未找到有效订阅', 'red');
      log('   请执行步骤 3 手动创建订阅', 'yellow');
      return false;
    }

    log(`✅ 找到 ${subscriptions.length} 个有效订阅`, 'green');
    
    subscriptions.forEach((sub, index) => {
      const expiresAt = new Date(sub.expires_at);
      const now = new Date();
      const isValid = expiresAt > now;
      const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));

      log(`\n   订阅 ${index + 1}:`, 'cyan');
      log(`   - 等级: ${sub.tier}`, 'blue');
      log(`   - 状态: ${sub.status}`, 'blue');
      log(`   - 周期: ${sub.period || 'N/A'}`, 'blue');
      log(`   - 到期: ${sub.expires_at}`, 'blue');
      log(`   - 有效: ${isValid ? '✅ 是' : '❌ 否'}`, isValid ? 'green' : 'red');
      if (isValid) {
        log(`   - 剩余: ${daysRemaining} 天`, 'green');
      }
      log(`   - 订单ID: ${sub.order_id || 'N/A'}`, 'blue');
    });

    return subscriptions.some(sub => new Date(sub.expires_at) > new Date());
  } catch (error) {
    log(`❌ 验证失败: ${error.message}`, 'red');
    return false;
  }
}

async function testRepairEndpoint(orderId) {
  section('4. 测试修复端点');
  
  try {
    log('🔄 调用 repair-order-permissions...', 'blue');
    
    const response = await fetch('https://www.wenpai.xyz/.netlify/functions/repair-order-permissions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, force: false })
    });

    const data = await response.json();

    if (response.ok) {
      log('✅ 修复端点响应正常', 'green');
      log(`   消息: ${data.message}`, 'blue');
      return true;
    } else {
      log(`❌ 修复端点返回错误: ${response.status}`, 'red');
      log(`   错误: ${data.error || data.message}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ 调用修复端点失败: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const orderId = args[0] || 'WP17598937175698938';
  const userId = args[1] || '6882df3f2f9efaa6e241dce5';

  log('\n🔍 开始验证订阅修复...', 'cyan');
  log(`   订单ID: ${orderId}`, 'blue');
  log(`   用户ID: ${userId}`, 'blue');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('\n❌ Supabase 配置缺失', 'red');
    log('   请设置环境变量:', 'yellow');
    log('   - SUPABASE_URL', 'yellow');
    log('   - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const results = {
    tableStructure: await verifyTableStructure(supabase),
    rlsPolicies: await verifyRLSPolicies(supabase),
    orderAndSubscription: await verifyOrderAndSubscription(supabase, orderId, userId),
    repairEndpoint: await testRepairEndpoint(orderId)
  };

  section('验证总结');

  const allPassed = Object.values(results).every(r => r === true);
  const anyFailed = Object.values(results).some(r => r === false);

  if (allPassed) {
    log('✅ 所有验证通过！', 'green');
    log('\n🎉 订阅系统已完全修复', 'green');
    log('\n下一步:', 'cyan');
    log('1. 清除浏览器缓存', 'yellow');
    log('2. 重新登录', 'yellow');
    log('3. 检查使用统计是否更新', 'yellow');
    process.exit(0);
  } else if (anyFailed) {
    log('❌ 部分验证失败', 'red');
    log('\n需要修复的问题:', 'yellow');
    
    if (results.tableStructure === false) {
      log('- 执行步骤 1: 修复表结构', 'yellow');
    }
    if (results.rlsPolicies === false) {
      log('- 执行步骤 1: 修复 RLS 策略', 'yellow');
    }
    if (results.orderAndSubscription === false) {
      log('- 执行步骤 3: 手动创建订阅', 'yellow');
    }
    if (results.repairEndpoint === false) {
      log('- 执行步骤 4: 部署代码更改', 'yellow');
    }
    
    log('\n📝 详细修复指南: docs/FINAL_FIX_STEPS.md', 'cyan');
    process.exit(1);
  } else {
    log('⚠️ 部分验证无法完成', 'yellow');
    log('   请手动检查相关配置', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ 验证脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

