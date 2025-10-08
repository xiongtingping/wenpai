#!/usr/bin/env node
/**
 * 审查所有数据库表
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 开始审查所有数据库表...\n');

// 1. 获取所有表
console.log('================================================================================');
console.log('1. 获取所有表');
console.log('================================================================================\n');

const { data: tables, error: tablesError } = await supabase
  .rpc('get_all_tables');

if (tablesError) {
  console.log('⚠️  无法通过 RPC 获取表列表，尝试直接查询...\n');
  
  // 直接查询每个已知的表
  const knownTables = [
    'user_profiles',
    'user_subscriptions',
    'user_preferences',
    'orders',
    'upgrade_orders',
    'token_usage_records',
    'user_usage_logs',
    'usage_count_records',
    'user_library_items',
    'user_chat_history',
    'user_brand_corpus',
    'user_brand_library',
    'user_invite_relations',
    'user_invite_stats',
    'user_invite_events'
  ];
  
  console.log('检查已知表:\n');
  
  for (const tableName of knownTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${tableName} - 表不存在`);
        } else {
          console.log(`⚠️  ${tableName} - 错误: ${error.message}`);
        }
      } else {
        console.log(`✅ ${tableName} - 记录数: ${count || 0}`);
      }
    } catch (e) {
      console.log(`❌ ${tableName} - 异常: ${e.message}`);
    }
  }
} else {
  console.log('找到以下表:\n');
  tables.forEach(table => {
    console.log(`  - ${table.table_name}`);
  });
}

// 2. 检查每个表的结构和数据
console.log('\n================================================================================');
console.log('2. 检查每个表的详细信息');
console.log('================================================================================\n');

const tablesToCheck = [
  'user_subscriptions',
  'orders',
  'upgrade_orders',
  'token_usage_records',
  'user_usage_logs',
  'usage_count_records',
  'user_profiles',
  'user_preferences',
  'user_library_items',
  'user_chat_history',
  'user_brand_corpus',
  'user_brand_library'
];

for (const tableName of tablesToCheck) {
  console.log(`\n--- ${tableName} ---`);
  
  try {
    // 获取记录数
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      if (countError.code === '42P01') {
        console.log('❌ 表不存在');
        continue;
      } else {
        console.log(`⚠️  错误: ${countError.message}`);
        continue;
      }
    }
    
    console.log(`记录数: ${count || 0}`);
    
    // 获取示例数据（第一条记录）
    if (count > 0) {
      const { data: sample, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
        .single();
      
      if (!sampleError && sample) {
        console.log('字段列表:');
        Object.keys(sample).forEach(key => {
          const value = sample[key];
          const type = typeof value;
          console.log(`  - ${key}: ${type}`);
        });
      }
    } else {
      console.log('⚠️  表为空，无法获取字段信息');
    }
  } catch (e) {
    console.log(`❌ 异常: ${e.message}`);
  }
}

// 3. 分析表的用途和关系
console.log('\n================================================================================');
console.log('3. 表用途分析');
console.log('================================================================================\n');

const tableAnalysis = {
  '订阅相关': [
    { name: 'user_subscriptions', purpose: '用户订阅记录', status: '✅ 使用中' },
    { name: 'orders', purpose: '订单记录', status: '✅ 使用中' },
    { name: 'upgrade_orders', purpose: '升级订单记录', status: '✅ 使用中' }
  ],
  '使用统计': [
    { name: 'token_usage_records', purpose: 'Token 使用记录', status: '✅ 使用中' },
    { name: 'user_usage_logs', purpose: '用户使用日志（可能重复）', status: '⚠️  需要检查' },
    { name: 'usage_count_records', purpose: '使用次数记录', status: '✅ 使用中' }
  ],
  '用户数据': [
    { name: 'user_profiles', purpose: '用户资料', status: '⚠️  需要检查' },
    { name: 'user_preferences', purpose: '用户偏好设置', status: '✅ 使用中' },
    { name: 'user_library_items', purpose: '用户资料库', status: '✅ 使用中' },
    { name: 'user_chat_history', purpose: '聊天历史', status: '✅ 使用中' }
  ],
  '品牌库': [
    { name: 'user_brand_corpus', purpose: '品牌语料库', status: '✅ 使用中' },
    { name: 'user_brand_library', purpose: '品牌库（可能重复）', status: '⚠️  需要检查' }
  ],
  '邀请系统': [
    { name: 'user_invite_relations', purpose: '邀请关系', status: '✅ 使用中' },
    { name: 'user_invite_stats', purpose: '邀请统计', status: '✅ 使用中' },
    { name: 'user_invite_events', purpose: '邀请事件', status: '✅ 使用中' }
  ]
};

Object.entries(tableAnalysis).forEach(([category, tables]) => {
  console.log(`\n${category}:`);
  tables.forEach(table => {
    console.log(`  ${table.status} ${table.name} - ${table.purpose}`);
  });
});

console.log('\n✅ 审查完成');

