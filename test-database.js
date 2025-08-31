/**
 * 数据库连接和表结构测试脚本
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 数据库配置测试\n');
console.log('Supabase URL:', supabaseUrl ? '✅ 已配置' : '❌ 未配置');
console.log('Service Key:', supabaseServiceKey ? '✅ 已配置' : '❌ 未配置');

if (!supabaseUrl || !supabaseServiceKey) {
  console.log('\n❌ 缺少必要的环境变量');
  console.log('请确保设置了以下环境变量:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 测试数据库连接
 */
async function testDatabaseConnection() {
  console.log('\n🔗 测试数据库连接...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ 数据库连接失败:', error.message);
      return false;
    }
    
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.log('❌ 数据库连接异常:', error.message);
    return false;
  }
}

/**
 * 检查表结构
 */
async function checkTableStructure() {
  console.log('\n📋 检查表结构...');
  
  const tables = ['orders', 'user_subscriptions'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 表 ${table} 不存在或无权限:`, error.message);
      } else {
        console.log(`✅ 表 ${table} 存在且可访问`);
      }
    } catch (error) {
      console.log(`❌ 检查表 ${table} 时出错:`, error.message);
    }
  }
}

/**
 * 创建测试订单
 */
async function createTestOrder() {
  console.log('\n📝 创建测试订单...');
  
  const testOrder = {
    order_id: `TEST_${Date.now()}`,
    user_id: 'test_user_123',
    user_email: 'test@example.com',
    product_name: '文派专业版月度会员',
    product_type: 'professional',
    duration_type: 'monthly',
    amount: 29.90,
    pay_type: 'alipay',
    status: 'pending'
  };
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();
    
    if (error) {
      console.log('❌ 创建测试订单失败:', error.message);
      return null;
    }
    
    console.log('✅ 测试订单创建成功:', data.order_id);
    return data;
  } catch (error) {
    console.log('❌ 创建测试订单异常:', error.message);
    return null;
  }
}

/**
 * 测试订单查询
 */
async function testOrderQuery(orderId) {
  console.log('\n🔍 测试订单查询...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
    
    if (error) {
      console.log('❌ 查询订单失败:', error.message);
      return false;
    }
    
    console.log('✅ 订单查询成功:', {
      orderId: data.order_id,
      status: data.status,
      amount: data.amount,
      productType: data.product_type
    });
    return true;
  } catch (error) {
    console.log('❌ 查询订单异常:', error.message);
    return false;
  }
}

/**
 * 测试订单更新
 */
async function testOrderUpdate(orderId) {
  console.log('\n📝 测试订单更新...');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        aoid: 'test_aoid_123',
        pay_price: 29.90,
        paid_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select()
      .single();
    
    if (error) {
      console.log('❌ 更新订单失败:', error.message);
      return false;
    }
    
    console.log('✅ 订单更新成功:', {
      orderId: data.order_id,
      status: data.status,
      aoid: data.aoid
    });
    return true;
  } catch (error) {
    console.log('❌ 更新订单异常:', error.message);
    return false;
  }
}

/**
 * 测试用户订阅创建
 */
async function testSubscriptionCreation(order) {
  console.log('\n🎯 测试用户订阅创建...');
  
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);
  
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: order.user_id,
        subscription_type: order.product_type,
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        order_id: order.order_id
      })
      .select()
      .single();
    
    if (error) {
      console.log('❌ 创建用户订阅失败:', error.message);
      return false;
    }
    
    console.log('✅ 用户订阅创建成功:', {
      userId: data.user_id,
      subscriptionType: data.subscription_type,
      status: data.status,
      expiresAt: data.expires_at
    });
    return true;
  } catch (error) {
    console.log('❌ 创建用户订阅异常:', error.message);
    return false;
  }
}

/**
 * 清理测试数据
 */
async function cleanupTestData(orderId) {
  console.log('\n🧹 清理测试数据...');
  
  try {
    // 删除测试订阅
    await supabase
      .from('user_subscriptions')
      .delete()
      .eq('order_id', orderId);
    
    // 删除测试订单
    await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId);
    
    console.log('✅ 测试数据清理完成');
  } catch (error) {
    console.log('❌ 清理测试数据失败:', error.message);
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始数据库测试\n');
  console.log('='.repeat(50));
  
  // 1. 测试数据库连接
  const connectionOk = await testDatabaseConnection();
  if (!connectionOk) {
    console.log('\n❌ 数据库连接失败，停止测试');
    return;
  }
  
  // 2. 检查表结构
  await checkTableStructure();
  
  // 3. 创建测试订单
  const testOrder = await createTestOrder();
  if (!testOrder) {
    console.log('\n❌ 无法创建测试订单，停止测试');
    return;
  }
  
  // 4. 测试订单查询
  await testOrderQuery(testOrder.order_id);
  
  // 5. 测试订单更新
  await testOrderUpdate(testOrder.order_id);
  
  // 6. 测试用户订阅创建
  await testSubscriptionCreation(testOrder);
  
  // 7. 清理测试数据
  await cleanupTestData(testOrder.order_id);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ 数据库测试完成');
}

// 运行测试
runAllTests().catch(console.error);
