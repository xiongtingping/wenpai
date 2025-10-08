#!/usr/bin/env node
/**
 * 检查订阅状态脚本
 * 用于诊断支付成功但订阅未生效的问题
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
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

async function checkOrderAndSubscription(orderId) {
  section(`检查订单: ${orderId}`);
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase 配置缺失', 'red');
    log('   请确保设置了以下环境变量:', 'yellow');
    log('   - SUPABASE_URL', 'yellow');
    log('   - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 查询订单
    log('\n📋 查询订单信息...', 'blue');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError) {
      log(`❌ 订单查询失败: ${orderError.message}`, 'red');
      return false;
    }

    if (!order) {
      log('❌ 订单不存在', 'red');
      return false;
    }

    log('✅ 订单信息:', 'green');
    console.log({
      order_id: order.order_id,
      user_id: order.user_id,
      product_type: order.product_type,
      duration_type: order.duration_type,
      amount: order.amount,
      status: order.status,
      paid_at: order.paid_at,
      processed_at: order.processed_at,
      created_at: order.created_at
    });

    // 2. 查询订阅（通过 order_id）
    log('\n🔍 查询订阅信息（通过 order_id）...', 'blue');
    const { data: subscriptionByOrder, error: subByOrderError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('order_id', orderId);

    if (subByOrderError) {
      log(`⚠️ 订阅查询失败: ${subByOrderError.message}`, 'yellow');
    } else if (subscriptionByOrder && subscriptionByOrder.length > 0) {
      log('✅ 找到订阅:', 'green');
      subscriptionByOrder.forEach(sub => {
        console.log({
          id: sub.id,
          user_id: sub.user_id,
          subscription_type: sub.subscription_type,
          status: sub.status,
          started_at: sub.started_at,
          expires_at: sub.expires_at,
          order_id: sub.order_id
        });
      });
    } else {
      log('❌ 未找到与订单关联的订阅', 'red');
    }

    // 3. 查询用户的所有订阅
    log('\n🔍 查询用户的所有订阅...', 'blue');
    const { data: userSubscriptions, error: userSubError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', order.user_id)
      .order('created_at', { ascending: false });

    if (userSubError) {
      log(`⚠️ 用户订阅查询失败: ${userSubError.message}`, 'yellow');
    } else if (userSubscriptions && userSubscriptions.length > 0) {
      log(`✅ 找到 ${userSubscriptions.length} 个订阅:`, 'green');
      userSubscriptions.forEach((sub, index) => {
        console.log(`\n订阅 ${index + 1}:`, {
          id: sub.id,
          subscription_type: sub.subscription_type,
          status: sub.status,
          started_at: sub.started_at,
          expires_at: sub.expires_at,
          order_id: sub.order_id,
          created_at: sub.created_at
        });
      });
    } else {
      log('❌ 用户没有任何订阅', 'red');
    }

    // 4. 分析问题
    section('问题分析');
    
    const hasSubscription = subscriptionByOrder && subscriptionByOrder.length > 0;
    const orderPaid = order.status === 'paid' || order.status === 'processed';

    if (orderPaid && !hasSubscription) {
      log('❌ 问题: 订单已支付但没有创建订阅', 'red');
      log('\n💡 建议修复步骤:', 'yellow');
      log('1. 执行 RLS 策略修复:', 'cyan');
      log('   supabase/migrations/fix_user_subscriptions_rls.sql', 'blue');
      log('\n2. 手动创建订阅:', 'cyan');
      log(`   INSERT INTO user_subscriptions (user_id, subscription_type, status, started_at, expires_at, order_id)`, 'blue');
      log(`   VALUES ('${order.user_id}', '${order.product_type}', 'active', NOW(), NOW() + INTERVAL '1 ${order.duration_type === 'monthly' ? 'month' : 'year'}', '${order.order_id}');`, 'blue');
      log('\n3. 或者调用修复接口:', 'cyan');
      log(`   curl -X POST https://www.wenpai.xyz/.netlify/functions/repair-order-permissions \\`, 'blue');
      log(`     -H "Content-Type: application/json" \\`, 'blue');
      log(`     -d '{"orderId": "${orderId}", "force": true}'`, 'blue');
      
      return false;
    } else if (hasSubscription) {
      log('✅ 订单和订阅状态正常', 'green');
      
      // 检查订阅是否过期
      const subscription = subscriptionByOrder[0];
      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();
      
      if (expiresAt < now) {
        log('⚠️ 警告: 订阅已过期', 'yellow');
        log(`   过期时间: ${subscription.expires_at}`, 'yellow');
      } else {
        const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        log(`✅ 订阅有效，剩余 ${daysRemaining} 天`, 'green');
      }
      
      return true;
    } else {
      log('⚠️ 订单未支付或状态异常', 'yellow');
      log(`   当前状态: ${order.status}`, 'yellow');
      return false;
    }

  } catch (error) {
    log(`\n❌ 检查过程中出错: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const orderId = args[0];

  if (!orderId) {
    log('❌ 缺少订单ID参数', 'red');
    log('\n用法:', 'yellow');
    log('  node scripts/check-subscription-status.mjs <ORDER_ID>', 'cyan');
    log('\n示例:', 'yellow');
    log('  node scripts/check-subscription-status.mjs WP17598937175698938', 'cyan');
    process.exit(1);
  }

  log('\n🔍 开始检查订阅状态...', 'cyan');
  
  const success = await checkOrderAndSubscription(orderId);
  
  if (success) {
    log('\n✅ 检查完成，状态正常', 'green');
    process.exit(0);
  } else {
    log('\n❌ 检查完成，发现问题', 'red');
    log('\n📝 详细修复指南: docs/FIX_SUBSCRIPTION_ISSUES.md', 'cyan');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ 脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

