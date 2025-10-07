#!/usr/bin/env node
/**
 * 查询订单详细信息和支付回调记录
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

async function queryOrderDetails() {
  console.log('\n🔍 查询订单详细信息...');
  console.log('订单ID:', orderId);
  console.log('─'.repeat(80));

  try {
    // 1. 查询订单基本信息
    console.log('\n📋 1. 订单基本信息 (orders表):');
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (orderError) {
      console.error('❌ 查询订单失败:', orderError.message);
    } else if (order) {
      console.log('   订单详情:');
      Object.entries(order).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          let displayValue = value;
          if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            displayValue = new Date(value).toLocaleString('zh-CN');
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value, null, 2);
          }
          console.log(`   ├─ ${key}: ${displayValue}`);
        }
      });
    }

    // 2. 查询支付回调记录
    console.log('\n💳 2. 支付回调记录 (payment_callbacks表):');
    const { data: callbacks, error: callbackError } = await supabase
      .from('payment_callbacks')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (callbackError) {
      if (callbackError.code === '42P01') {
        console.log('   ℹ️  payment_callbacks表不存在');
      } else {
        console.error('❌ 查询回调记录失败:', callbackError.message);
      }
    } else if (callbacks && callbacks.length > 0) {
      callbacks.forEach((callback, index) => {
        console.log(`\n   回调记录 #${index + 1}:`);
        Object.entries(callback).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            let displayValue = value;
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
              displayValue = new Date(value).toLocaleString('zh-CN');
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            }
            console.log(`   ├─ ${key}: ${displayValue}`);
          }
        });
      });
    } else {
      console.log('   ⚠️  未找到支付回调记录');
    }

    // 3. 查询用户订阅状态
    console.log('\n💎 3. 用户订阅状态 (user_subscriptions表):');
    if (order && order.user_id) {
      const { data: subscription, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', order.user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError) {
        if (subError.code === 'PGRST116') {
          console.log('   ⚠️  未找到订阅记录');
        } else {
          console.error('❌ 查询订阅失败:', subError.message);
        }
      } else if (subscription) {
        console.log('   当前订阅:');
        Object.entries(subscription).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            let displayValue = value;
            if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
              displayValue = new Date(value).toLocaleString('zh-CN');
            } else if (typeof value === 'object') {
              displayValue = JSON.stringify(value, null, 2);
            }
            console.log(`   ├─ ${key}: ${displayValue}`);
          }
        });
      }
    }

    // 4. 查询Bufpay API订单状态
    console.log('\n🔍 4. 尝试查询Bufpay API订单状态:');
    console.log('   ℹ️  需要调用 BufPayService.checkOrderStatus()');
    console.log('   ℹ️  这需要在应用环境中执行，脚本无法直接调用');

    // 5. 分析问题
    console.log('\n🔎 5. 问题分析:');
    if (order) {
      console.log(`   订单状态: ${order.status}`);
      console.log(`   支付时间: ${order.paid_at ? new Date(order.paid_at).toLocaleString('zh-CN') : '未支付'}`);
      console.log(`   创建时间: ${new Date(order.created_at).toLocaleString('zh-CN')}`);
      console.log(`   更新时间: ${new Date(order.updated_at).toLocaleString('zh-CN')}`);
      
      if (order.status === 'pending') {
        console.log('\n   ⚠️  可能的原因:');
        console.log('   1. 支付回调未到达或处理失败');
        console.log('   2. Webhook配置问题');
        console.log('   3. 订单状态更新逻辑未执行');
        console.log('   4. 数据库更新失败');
        
        console.log('\n   🔧 建议检查:');
        console.log('   1. Netlify Functions日志 (支付回调处理)');
        console.log('   2. Bufpay后台的Webhook配置');
        console.log('   3. 订单处理逻辑代码');
        console.log('   4. 数据库触发器或约束');
      }
    }

    console.log('\n' + '─'.repeat(80));
    console.log('✅ 查询完成\n');

  } catch (error) {
    console.error('\n❌ 查询过程中发生错误:', error);
    process.exit(1);
  }
}

queryOrderDetails();

