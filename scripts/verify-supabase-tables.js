#!/usr/bin/env node
/**
 * Supabase数据库表格验证脚本
 * 验证所有必需的表格是否存在并可访问
 */

import { createClient } from '@supabase/supabase-js';

// Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTIzMzksImV4cCI6MjA3MDYyODMzOX0.77cefG7i52iWjR6D_0H1aB-xmmJe19WQlM8PkGISW7c';

// 创建Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 验证表格是否存在
 */
async function verifyTables() {
  const requiredTables = [
    'user_profiles',
    'user_subscriptions', 
    'token_usage_records',
    'usage_count_records',
    'user_invite_relations',
    'user_invite_stats',
    'user_invite_events',
    'user_files',
    'user_notes',
    'user_brand_corpus',
    'user_library_items',
    'user_chat_history'
  ];
  
  console.log('🔍 验证Supabase表格...');
  console.log(`📡 连接到: ${SUPABASE_URL}`);
  
  const results = {
    existing: [],
    missing: [],
    errors: []
  };
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          results.missing.push(tableName);
          console.log(`❌ 表 ${tableName}: 不存在`);
        } else {
          results.errors.push({ table: tableName, error: error.message });
          console.log(`⚠️  表 ${tableName}: ${error.message}`);
        }
      } else {
        results.existing.push(tableName);
        console.log(`✅ 表 ${tableName}: 存在且可访问`);
      }
    } catch (err) {
      results.errors.push({ table: tableName, error: err.message });
      console.log(`❌ 表 ${tableName}: 验证失败 - ${err.message}`);
    }
  }
  
  // 输出总结
  console.log('\n📊 验证结果总结:');
  console.log(`✅ 存在的表: ${results.existing.length}/${requiredTables.length}`);
  console.log(`❌ 缺失的表: ${results.missing.length}`);
  console.log(`⚠️  错误的表: ${results.errors.length}`);
  
  if (results.missing.length > 0) {
    console.log('\n🚨 需要创建的表:');
    results.missing.forEach(table => console.log(`  - ${table}`));
  }
  
  if (results.errors.length > 0) {
    console.log('\n⚠️  错误详情:');
    results.errors.forEach(({ table, error }) => console.log(`  - ${table}: ${error}`));
  }
  
  return results;
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    console.log('🔌 测试Supabase连接...');
    
    // 测试基本连接
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && !error.message.includes('Auth session missing')) {
      throw new Error(`连接失败: ${error.message}`);
    }
    
    console.log('✅ Supabase连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase连接失败:', error);
    return false;
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始验证Supabase数据库配置...\n');
    
    // 1. 测试连接
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ 无法连接到Supabase，请检查配置');
      process.exit(1);
    }
    
    // 2. 验证表格
    const results = await verifyTables();
    
    // 3. 生成建议
    console.log('\n📋 建议操作:');
    
    if (results.missing.length > 0) {
      console.log('1. 在Supabase Dashboard中执行以下SQL创建缺失的表:');
      console.log('   - 打开 https://supabase.com/dashboard/project/weizkydylskcwgnaieqy/editor');
      console.log('   - 在SQL Editor中执行 database_setup.sql 文件的内容');
    }
    
    if (results.existing.length === requiredTables.length) {
      console.log('🎉 所有表格都已存在，数据库配置完成！');
    }
    
  } catch (error) {
    console.error('❌ 验证过程失败:', error);
    process.exit(1);
  }
}

// 导出需要的表列表供其他脚本使用
export const requiredTables = [
  'user_profiles',
  'user_subscriptions', 
  'token_usage_records',
  'usage_count_records',
  'user_invite_relations',
  'user_invite_stats',
  'user_invite_events',
  'user_files',
  'user_notes',
  'user_brand_corpus',
  'user_library_items',
  'user_chat_history'
];

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}