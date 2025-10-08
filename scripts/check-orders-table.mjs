#!/usr/bin/env node

/**
 * 检查订单表结构
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrdersTable() {
  console.log('\n🔍 检查订单表结构\n');

  try {
    // 1. 检查表是否存在
    const { data: tables, error: tablesError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (tablesError) {
      console.error('❌ 订单表不存在或无法访问:', tablesError.message);
      return;
    }

    console.log('✅ 订单表存在');

    // 2. 获取最近的订单
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ordersError) {
      console.error('❌ 查询订单失败:', ordersError.message);
      return;
    }

    console.log(`\n📋 最近的 ${recentOrders?.length || 0} 个订单:\n`);

    if (recentOrders && recentOrders.length > 0) {
      recentOrders.forEach((order, index) => {
        console.log(`${index + 1}. 订单 ${order.order_id}:`);
        console.log(`   - 用户ID: ${order.user_id}`);
        console.log(`   - 产品: ${order.product_name}`);
        console.log(`   - 金额: ¥${order.amount}`);
        console.log(`   - 实际支付: ¥${order.pay_price || order.amount}`);
        console.log(`   - 状态: ${order.status}`);
        console.log(`   - 创建时间: ${order.created_at}`);
        console.log(`   - 支付时间: ${order.paid_at || '未支付'}`);
        console.log('');
      });
    } else {
      console.log('   (暂无订单)');
    }

    // 3. 检查字段
    if (recentOrders && recentOrders.length > 0) {
      const sampleOrder = recentOrders[0];
      console.log('\n📊 订单表字段:');
      Object.keys(sampleOrder).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleOrder[key]}`);
      });
    }

  } catch (error) {
    console.error('\n❌ 检查失败:', error);
  }
}

checkOrdersTable();

