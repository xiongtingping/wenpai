#!/usr/bin/env node
/**
 * 检查使用次数数据
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
const userId = '6882df3f2f9efaa6e241dce5'; // WP17598937175698938

console.log('🔍 检查使用次数数据...\n');

// 1. 检查 usage_count_records 表
console.log('================================================================================');
console.log('1. 检查 usage_count_records 表');
console.log('================================================================================\n');

const { data: usageCountData, error: usageCountError } = await supabase
  .from('usage_count_records')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (usageCountError) {
  console.log(`❌ 查询失败: ${usageCountError.message}`);
} else {
  console.log(`✅ 找到 ${usageCountData.length} 条使用次数记录\n`);
  
  // 统计总使用次数
  const totalCount = usageCountData.reduce((sum, record) => sum + (record.amount || 0), 0);
  console.log(`📊 总使用次数: ${totalCount}\n`);
  
  // 按功能分组统计
  const byFeature = {};
  usageCountData.forEach(record => {
    const feature = record.feature || 'unknown';
    if (!byFeature[feature]) {
      byFeature[feature] = { count: 0, records: 0 };
    }
    byFeature[feature].count += record.amount || 0;
    byFeature[feature].records += 1;
  });
  
  console.log('按功能分组:');
  Object.entries(byFeature).forEach(([feature, stats]) => {
    console.log(`  ${feature}: ${stats.count} 次 (${stats.records} 条记录)`);
  });
  
  console.log('\n最近 10 条记录:');
  usageCountData.slice(0, 10).forEach((record, index) => {
    console.log(`\n  记录 ${index + 1}:`);
    console.log(`    功能: ${record.feature}`);
    console.log(`    次数: ${record.amount}`);
    console.log(`    时间: ${record.created_at || record.used_at}`);
  });
}

// 2. 检查本月的使用次数
console.log('\n================================================================================');
console.log('2. 检查本月使用次数');
console.log('================================================================================\n');

const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthStartISO = monthStart.toISOString();

const { data: monthlyData, error: monthlyError } = await supabase
  .from('usage_count_records')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', monthStartISO);

if (monthlyError) {
  console.log(`❌ 查询失败: ${monthlyError.message}`);
} else {
  const monthlyCount = monthlyData.reduce((sum, record) => sum + (record.amount || 0), 0);
  console.log(`✅ 本月使用次数: ${monthlyCount} (${monthlyData.length} 条记录)`);
}

console.log('\n✅ 检查完成');

