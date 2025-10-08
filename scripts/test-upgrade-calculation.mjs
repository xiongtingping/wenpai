#!/usr/bin/env node

/**
 * 测试升级补差价计算
 * 验证修复后的计算逻辑是否正确
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  console.error('需要设置环境变量: VITE_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpgradeCalculation() {
  console.log('\n🧪 测试升级补差价计算\n');

  try {
    // 1. 获取测试用户的订阅信息
    const testUserId = '6882df3f2f9efaa6e241dce5'; // WP17598937175698938
    
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', testUserId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      console.error('❌ 未找到活跃订阅:', subError);
      return;
    }

    console.log('📋 当前订阅信息:');
    console.log('  - 套餐等级:', subscription.tier);
    console.log('  - 到期时间:', subscription.expires_at);
    console.log('  - 订单ID:', subscription.order_id);

    // 2. 获取订单信息
    if (subscription.order_id) {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', subscription.order_id)
        .single();

      if (order) {
        console.log('\n💰 订单信息:');
        console.log('  - 订单金额:', order.amount);
        console.log('  - 实际支付:', order.pay_price || order.amount);
        console.log('  - 创建时间:', order.created_at);
        console.log('  - 支付时间:', order.paid_at);

        // 3. 计算实际订阅周期
        const orderDate = new Date(order.created_at);
        const expiresDate = new Date(subscription.expires_at);
        const actualTotalDays = Math.ceil((expiresDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

        console.log('\n📊 订阅周期分析:');
        console.log('  - 订单创建:', orderDate.toLocaleDateString());
        console.log('  - 订阅到期:', expiresDate.toLocaleDateString());
        console.log('  - 实际周期:', actualTotalDays, '天');

        // 4. 计算剩余天数
        const now = new Date();
        const remainingTime = expiresDate.getTime() - now.getTime();
        const remainingDays = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));

        console.log('  - 剩余天数:', remainingDays, '天');

        // 5. 计算剩余价值
        const actualPaidAmount = order.pay_price || order.amount;
        const remainingValue = (actualPaidAmount * remainingDays) / actualTotalDays;

        console.log('\n💵 剩余价值计算:');
        console.log('  - 实际支付金额:', actualPaidAmount);
        console.log('  - 剩余天数:', remainingDays);
        console.log('  - 实际周期天数:', actualTotalDays);
        console.log('  - 剩余价值:', remainingValue.toFixed(2));

        // 6. 模拟升级到高级版年付
        const targetPrice = 986; // 高级版年付原价
        const upgradeAmount = Math.max(0, targetPrice - remainingValue);

        console.log('\n🚀 升级到高级版年付:');
        console.log('  - 目标价格:', targetPrice);
        console.log('  - 剩余价值:', remainingValue.toFixed(2));
        console.log('  - 需要补差:', upgradeAmount.toFixed(2));
        console.log('  - 升级后到期:', expiresDate.toLocaleDateString(), '(保持不变)');

        // 7. 验证计算结果
        console.log('\n✅ 验证结果:');
        if (remainingValue <= actualPaidAmount) {
          console.log('  ✓ 剩余价值 ≤ 实际支付金额 (正确)');
        } else {
          console.log('  ✗ 剩余价值 > 实际支付金额 (错误!)');
        }

        if (upgradeAmount > 0 && upgradeAmount < targetPrice) {
          console.log('  ✓ 升级差价在合理范围内 (正确)');
        } else {
          console.log('  ✗ 升级差价异常 (错误!)');
        }

      } else {
        console.log('\n⚠️  未找到订单信息');
      }
    } else {
      console.log('\n⚠️  订阅没有关联订单ID');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error);
  }
}

// 运行测试
testUpgradeCalculation();

