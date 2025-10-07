#!/usr/bin/env node
/**
 * 查询用户订阅信息脚本
 * 用法: node scripts/queryUserSubscription.mjs <userId>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少必要的环境变量:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function queryUserSubscription(userId) {
  console.log('\n🔍 查询用户订阅信息...');
  console.log('用户ID:', userId);
  console.log('─'.repeat(80));

  try {
    // 1. 查询用户基本信息（跳过auth查询，因为可能是MongoDB ID）
    console.log('\n📋 1. 用户基本信息:');
    console.log('   用户ID:', userId);
    console.log('   ℹ️  跳过auth查询（可能是MongoDB ObjectId格式）');

    // 2. 查询订阅状态表 (subscription_status)
    console.log('\n💎 2. 订阅状态 (subscription_status):');
    const { data: subStatus, error: subError } = await supabase
      .from('subscription_status')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (subError) {
      console.error('❌ 查询订阅状态失败:', subError.message);
    } else if (subStatus && subStatus.length > 0) {
      subStatus.forEach((sub, index) => {
        console.log(`\n   订阅记录 #${index + 1}:`);
        console.log('   ├─ 订阅等级:', sub.tier || '未知');
        console.log('   ├─ 状态:', sub.status || '未知');
        console.log('   ├─ 订单ID:', sub.order_id || '无');
        console.log('   ├─ 开始时间:', sub.start_date ? new Date(sub.start_date).toLocaleString('zh-CN') : '未知');
        console.log('   ├─ 结束时间:', sub.end_date ? new Date(sub.end_date).toLocaleString('zh-CN') : '未知');
        console.log('   ├─ 创建时间:', sub.created_at ? new Date(sub.created_at).toLocaleString('zh-CN') : '未知');
        console.log('   └─ 更新时间:', sub.updated_at ? new Date(sub.updated_at).toLocaleString('zh-CN') : '未知');
      });
    } else {
      console.log('   ⚠️  未找到订阅记录');
    }

    // 3. 查询支付订单表 (bufpay_orders)
    console.log('\n💰 3. 支付订单 (bufpay_orders):');
    const { data: orders, error: ordersError } = await supabase
      .from('bufpay_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ 查询订单失败:', ordersError.message);
    } else if (orders && orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\n   订单 #${index + 1}:`);
        console.log('   ├─ 订单ID:', order.order_id || '未知');
        console.log('   ├─ 支付状态:', order.status || '未知');
        console.log('   ├─ 金额:', order.amount ? `¥${order.amount}` : '未知');
        console.log('   ├─ 套餐:', order.plan_tier || '未知');
        console.log('   ├─ 周期:', order.plan_period || '未知');
        console.log('   ├─ 创建时间:', order.created_at ? new Date(order.created_at).toLocaleString('zh-CN') : '未知');
        console.log('   ├─ 支付时间:', order.paid_at ? new Date(order.paid_at).toLocaleString('zh-CN') : '未支付');
        console.log('   └─ 更新时间:', order.updated_at ? new Date(order.updated_at).toLocaleString('zh-CN') : '未知');
      });
    } else {
      console.log('   ⚠️  未找到支付订单');
    }

    // 4. 查询Creem订单表 (creem_orders) - 如果存在
    console.log('\n🔐 4. Creem订单 (creem_orders):');
    const { data: creemOrders, error: creemError } = await supabase
      .from('creem_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (creemError) {
      if (creemError.code === '42P01') {
        console.log('   ℹ️  creem_orders表不存在');
      } else {
        console.error('❌ 查询Creem订单失败:', creemError.message);
      }
    } else if (creemOrders && creemOrders.length > 0) {
      creemOrders.forEach((order, index) => {
        console.log(`\n   Creem订单 #${index + 1}:`);
        console.log('   ├─ 订单ID:', order.order_id || '未知');
        console.log('   ├─ 状态:', order.status || '未知');
        console.log('   ├─ 金额:', order.amount ? `¥${order.amount}` : '未知');
        console.log('   ├─ 创建时间:', order.created_at ? new Date(order.created_at).toLocaleString('zh-CN') : '未知');
        console.log('   └─ 更新时间:', order.updated_at ? new Date(order.updated_at).toLocaleString('zh-CN') : '未知');
      });
    } else {
      console.log('   ⚠️  未找到Creem订单');
    }

    // 5. 查询用户元数据
    console.log('\n📊 5. 用户元数据:');
    const { data: metadata, error: metaError } = await supabase
      .from('user_metadata')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (metaError) {
      if (metaError.code === 'PGRST116') {
        console.log('   ⚠️  未找到用户元数据');
      } else {
        console.error('❌ 查询元数据失败:', metaError.message);
      }
    } else if (metadata) {
      console.log('   ├─ 昵称:', metadata.nickname || '未设置');
      console.log('   ├─ 头像:', metadata.avatar ? '已设置' : '未设置');
      console.log('   ├─ 创建时间:', metadata.created_at ? new Date(metadata.created_at).toLocaleString('zh-CN') : '未知');
      console.log('   └─ 更新时间:', metadata.updated_at ? new Date(metadata.updated_at).toLocaleString('zh-CN') : '未知');
    }

    console.log('\n' + '─'.repeat(80));
    console.log('✅ 查询完成\n');

  } catch (error) {
    console.error('\n❌ 查询过程中发生错误:', error);
    process.exit(1);
  }
}

// 主函数
const userId = process.argv[2];

if (!userId) {
  console.error('❌ 请提供用户ID');
  console.error('用法: node scripts/queryUserSubscription.mjs <userId>');
  process.exit(1);
}

queryUserSubscription(userId);

