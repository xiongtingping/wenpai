#!/usr/bin/env node
/**
 * 手动修复已支付但状态未更新的订单
 * 用法: node scripts/repairOrder.mjs <orderId>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const orderId = process.argv[2] || 'WP17598219893961884';

/**
 * 计算订阅到期时间
 */
function calculateExpiryDate(durationType) {
  const now = new Date();
  
  switch (durationType) {
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() + 1));
    case 'quarterly':
      return new Date(now.setMonth(now.getMonth() + 3));
    case 'yearly':
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      throw new Error(`未知的订阅周期: ${durationType}`);
  }
}

/**
 * 处理订单权限开通
 */
async function processOrderPermissions(order) {
  console.log('\n📝 开始处理订单权限...');
  console.log('   订单ID:', order.order_id);
  console.log('   用户ID:', order.user_id);
  console.log('   产品类型:', order.product_type);
  console.log('   订阅周期:', order.duration_type);

  // 计算订阅到期时间
  const expiresAt = calculateExpiryDate(order.duration_type);
  const startedAt = new Date();

  console.log('   开始时间:', startedAt.toLocaleString('zh-CN'));
  console.log('   到期时间:', expiresAt.toLocaleString('zh-CN'));

  // 检查用户是否已有订阅
  const { data: existingSubscription, error: queryError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', order.user_id)
    .maybeSingle();

  if (queryError) {
    throw new Error(`查询现有订阅失败: ${queryError.message}`);
  }

  let subscriptionData;

  if (existingSubscription) {
    console.log('\n   ℹ️  用户已有订阅，更新订阅信息...');
    console.log('   现有订阅ID:', existingSubscription.id);
    console.log('   现有等级:', existingSubscription.tier);
    console.log('   现有到期时间:', new Date(existingSubscription.expires_at).toLocaleString('zh-CN'));

    // 更新现有订阅
    const { data: updated, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        tier: order.product_type,
        status: 'active',
        period: order.duration_type,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        payment_method: order.pay_type,
        last_payment_id: order.order_id
      })
      .eq('id', existingSubscription.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`更新订阅失败: ${updateError.message}`);
    }

    subscriptionData = updated;
    console.log('   ✅ 订阅更新成功');
  } else {
    console.log('\n   ℹ️  用户无订阅，创建新订阅...');

    // 创建新订阅
    const { data: created, error: createError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        tier: order.product_type,
        status: 'active',
        period: order.duration_type,
        started_at: startedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        auto_renew: false,
        payment_method: order.pay_type,
        last_payment_id: order.order_id,
        discount_percentage: 0,
        metadata: {}
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`创建订阅失败: ${createError.message}`);
    }

    subscriptionData = created;
    console.log('   ✅ 订阅创建成功');
  }

  console.log('   订阅ID:', subscriptionData.id);
  console.log('   订阅等级:', subscriptionData.tier);
  console.log('   订阅状态:', subscriptionData.status);

  return subscriptionData;
}

/**
 * 修复订单
 */
async function repairOrder() {
  console.log('\n🔧 开始修复订单...');
  console.log('订单ID:', orderId);
  console.log('─'.repeat(80));

  try {
    // 1. 查询订单
    console.log('\n📋 1. 查询订单信息...');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`订单不存在: ${orderId}`);
    }

    console.log('   订单状态:', order.status);
    console.log('   支付时间:', order.paid_at ? new Date(order.paid_at).toLocaleString('zh-CN') : '未支付');
    console.log('   产品:', order.product_name);
    console.log('   金额:', `¥${order.amount}`);

    // 2. 检查订单状态
    if (order.status === 'paid' || order.status === 'processed') {
      console.log('\n   ⚠️  订单已处理，无需修复');
      
      // 检查是否有订阅
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('tier', order.product_type)
        .single();

      if (subscription) {
        console.log('   ✅ 订阅已存在');
        console.log('   订阅等级:', subscription.tier);
        console.log('   到期时间:', new Date(subscription.expires_at).toLocaleString('zh-CN'));
      }

      return;
    }

    // 3. 确认是否已支付
    if (!order.paid_at) {
      console.log('\n   ❌ 订单未支付，无法修复');
      console.log('   请确认用户是否真的已经支付');
      return;
    }

    console.log('\n   ✅ 订单已支付但状态未更新，开始修复...');

    // 4. 更新订单状态为已支付
    console.log('\n💳 2. 更新订单状态...');
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid'
      })
      .eq('order_id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`更新订单状态失败: ${updateError.message}`);
    }

    console.log('   ✅ 订单状态已更新为: paid');

    // 5. 处理权限开通
    console.log('\n💎 3. 开通订阅权限...');
    const subscriptionData = await processOrderPermissions(updatedOrder);

    // 6. 更新订单状态为已处理
    console.log('\n✅ 4. 标记订单为已处理...');
    await supabase
      .from('orders')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    console.log('   ✅ 订单状态已更新为: processed');

    console.log('\n' + '─'.repeat(80));
    console.log('🎉 订单修复成功！');
    console.log('\n📊 修复结果:');
    console.log('   订单ID:', orderId);
    console.log('   用户ID:', order.user_id);
    console.log('   订阅等级:', subscriptionData.tier);
    console.log('   订阅状态:', subscriptionData.status);
    console.log('   开始时间:', new Date(subscriptionData.started_at).toLocaleString('zh-CN'));
    console.log('   到期时间:', new Date(subscriptionData.expires_at).toLocaleString('zh-CN'));
    console.log('');

  } catch (error) {
    console.error('\n❌ 修复失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

repairOrder();

