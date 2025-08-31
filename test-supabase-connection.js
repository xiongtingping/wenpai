/**
 * 测试 Supabase 数据库连接和表结构
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });
dotenv.config(); // 也加载 .env 文件

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 测试 Supabase 数据库连接\n');
console.log('='.repeat(60));

// 检查环境变量
console.log('📋 环境变量检查:');
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✅ 已设置' : '❌ 未设置'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ 缺少必要的环境变量，无法继续测试');
  process.exit(1);
}

// 创建客户端
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * 测试基本连接
 */
async function testBasicConnection() {
  console.log('\n🌐 测试基本连接:');
  
  try {
    // 测试匿名客户端连接
    const { data, error } = await supabaseAnon.from('orders').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ 匿名客户端连接失败:', error.message);
      return false;
    } else {
      console.log('✅ 匿名客户端连接成功');
    }
    
    // 测试服务端客户端连接
    if (supabaseService) {
      const { data: serviceData, error: serviceError } = await supabaseService.from('orders').select('count', { count: 'exact', head: true });
      
      if (serviceError) {
        console.log('❌ 服务端客户端连接失败:', serviceError.message);
      } else {
        console.log('✅ 服务端客户端连接成功');
      }
    } else {
      console.log('⚠️  服务端客户端未配置');
    }
    
    return true;
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message);
    return false;
  }
}

/**
 * 测试表结构
 */
async function testTableStructure() {
  console.log('\n📊 测试表结构:');
  
  const tables = ['orders', 'user_subscriptions'];
  
  for (const tableName of tables) {
    console.log(`\n检查表: ${tableName}`);
    
    try {
      // 获取表的第一行数据来了解结构
      const { data, error } = await supabaseAnon
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ 无法访问表 ${tableName}:`, error.message);
        continue;
      }
      
      console.log(`✅ 表 ${tableName} 访问成功`);
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        console.log(`  列数: ${columns.length}`);
        console.log(`  列名: ${columns.join(', ')}`);
      } else {
        console.log(`  表为空，尝试获取表结构...`);
        
        // 尝试插入一个测试记录来了解表结构
        const testData = tableName === 'orders' ? {
          order_id: 'TEST_ORDER_' + Date.now(),
          user_id: 'test_user',
          product_name: '测试产品',
          product_type: 'professional',
          duration_type: 'monthly',
          amount: 39.00,
          pay_type: 'alipay',
          status: 'pending'
        } : {
          user_id: 'test_user',
          subscription_type: 'professional',
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        const { data: insertData, error: insertError } = await supabaseService
          ?.from(tableName)
          .insert(testData)
          .select();
        
        if (insertError) {
          console.log(`  ❌ 无法插入测试数据:`, insertError.message);
          console.log(`  可能的列结构问题或权限问题`);
        } else {
          console.log(`  ✅ 测试数据插入成功`);
          if (insertData && insertData.length > 0) {
            const columns = Object.keys(insertData[0]);
            console.log(`  列数: ${columns.length}`);
            console.log(`  列名: ${columns.join(', ')}`);
          }
          
          // 清理测试数据
          await supabaseService?.from(tableName).delete().eq('id', insertData[0].id);
          console.log(`  🧹 测试数据已清理`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 检查表 ${tableName} 时出错:`, error.message);
    }
  }
}

/**
 * 测试订单操作
 */
async function testOrderOperations() {
  console.log('\n📝 测试订单操作:');
  
  if (!supabaseService) {
    console.log('❌ 需要服务端客户端进行订单操作测试');
    return;
  }
  
  const testOrderId = 'TEST_ORDER_' + Date.now();
  const testUserId = 'test_user_' + Date.now();
  
  try {
    // 1. 创建测试订单
    console.log('1. 创建测试订单...');
    const { data: order, error: createError } = await supabaseService
      .from('orders')
      .insert({
        order_id: testOrderId,
        user_id: testUserId,
        user_email: 'test@example.com',
        product_name: '文派专业版月度会员',
        product_type: 'professional',
        duration_type: 'monthly',
        amount: 39.00,
        pay_type: 'alipay',
        status: 'pending',
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.log('❌ 创建订单失败:', createError.message);
      return;
    }
    
    console.log('✅ 订单创建成功:', testOrderId);
    
    // 2. 查询订单
    console.log('2. 查询订单...');
    const { data: foundOrder, error: queryError } = await supabaseService
      .from('orders')
      .select('*')
      .eq('order_id', testOrderId)
      .single();
    
    if (queryError) {
      console.log('❌ 查询订单失败:', queryError.message);
    } else {
      console.log('✅ 订单查询成功');
      console.log('  订单状态:', foundOrder.status);
      console.log('  订单金额:', foundOrder.amount);
    }
    
    // 3. 更新订单状态
    console.log('3. 更新订单状态...');
    const { data: updatedOrder, error: updateError } = await supabaseService
      .from('orders')
      .update({
        status: 'paid',
        aoid: 'test_aoid_123',
        pay_price: 39.00,
        paid_at: new Date().toISOString()
      })
      .eq('order_id', testOrderId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ 更新订单失败:', updateError.message);
    } else {
      console.log('✅ 订单更新成功');
      console.log('  新状态:', updatedOrder.status);
    }
    
    // 4. 测试订阅创建
    console.log('4. 创建用户订阅...');
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    
    const { data: subscription, error: subError } = await supabaseService
      .from('user_subscriptions')
      .insert({
        user_id: testUserId,
        subscription_type: 'professional',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiryDate.toISOString(),
        order_id: testOrderId
      })
      .select()
      .single();
    
    if (subError) {
      console.log('❌ 创建订阅失败:', subError.message);
    } else {
      console.log('✅ 订阅创建成功');
      console.log('  订阅类型:', subscription.subscription_type);
      console.log('  到期时间:', subscription.expires_at);
    }
    
    // 5. 清理测试数据
    console.log('5. 清理测试数据...');
    
    // 删除订阅
    if (subscription) {
      await supabaseService.from('user_subscriptions').delete().eq('id', subscription.id);
    }
    
    // 删除订单
    await supabaseService.from('orders').delete().eq('order_id', testOrderId);
    
    console.log('✅ 测试数据清理完成');
    
  } catch (error) {
    console.log('❌ 订单操作测试失败:', error.message);
    
    // 尝试清理可能残留的测试数据
    try {
      await supabaseService.from('user_subscriptions').delete().eq('user_id', testUserId);
      await supabaseService.from('orders').delete().eq('order_id', testOrderId);
    } catch (cleanupError) {
      console.log('清理残留数据时出错:', cleanupError.message);
    }
  }
}

/**
 * 测试权限
 */
async function testPermissions() {
  console.log('\n🔐 测试权限:');
  
  // 测试匿名用户权限
  console.log('1. 测试匿名用户权限:');
  
  try {
    // 尝试读取订单（应该被限制）
    const { data, error } = await supabaseAnon.from('orders').select('*').limit(1);
    
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('✅ 匿名用户正确被限制访问订单表');
      } else {
        console.log('❌ 匿名用户访问订单表时出现其他错误:', error.message);
      }
    } else {
      console.log('⚠️  匿名用户可以访问订单表（可能需要检查 RLS 策略）');
    }
    
    // 尝试读取订阅（应该被限制）
    const { data: subData, error: subError } = await supabaseAnon.from('user_subscriptions').select('*').limit(1);
    
    if (subError) {
      if (subError.message.includes('permission') || subError.message.includes('policy')) {
        console.log('✅ 匿名用户正确被限制访问订阅表');
      } else {
        console.log('❌ 匿名用户访问订阅表时出现其他错误:', subError.message);
      }
    } else {
      console.log('⚠️  匿名用户可以访问订阅表（可能需要检查 RLS 策略）');
    }
    
  } catch (error) {
    console.log('❌ 权限测试失败:', error.message);
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  try {
    // 1. 测试基本连接
    const connectionOk = await testBasicConnection();
    if (!connectionOk) {
      console.log('\n❌ 基本连接失败，停止后续测试');
      return;
    }
    
    // 2. 测试表结构
    await testTableStructure();
    
    // 3. 测试订单操作
    await testOrderOperations();
    
    // 4. 测试权限
    await testPermissions();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Supabase 数据库测试完成');
    
  } catch (error) {
    console.log('\n❌ 测试过程中出现错误:', error.message);
    console.log(error.stack);
  }
}

// 运行测试
runAllTests().catch(console.error);
