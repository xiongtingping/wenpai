#!/usr/bin/env node
/**
 * 清理错误的使用次数记录
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

console.log('🔍 检查并清理使用次数记录...\n');

// 1. 查询所有记录
const { data: allRecords, error: queryError } = await supabase
  .from('usage_count_records')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (queryError) {
  console.error('❌ 查询失败:', queryError.message);
  process.exit(1);
}

console.log(`📊 找到 ${allRecords.length} 条记录\n`);

// 2. 统计
const validRecords = allRecords.filter(r => r.amount > 0);
const invalidRecords = allRecords.filter(r => r.amount === 0 || r.amount === null);

console.log(`✅ 有效记录 (amount > 0): ${validRecords.length} 条`);
console.log(`❌ 无效记录 (amount = 0 或 null): ${invalidRecords.length} 条\n`);

if (validRecords.length > 0) {
  const totalValid = validRecords.reduce((sum, r) => sum + r.amount, 0);
  console.log(`📈 有效记录总使用次数: ${totalValid}\n`);
}

// 3. 询问是否清理
console.log('================================================================================');
console.log('清理选项:');
console.log('================================================================================\n');
console.log('1. 删除所有 amount=0 的无效记录');
console.log('2. 删除所有记录（重置为0）');
console.log('3. 仅查看，不删除\n');

// 自动选择选项2：删除所有记录
console.log('🔧 自动执行：删除所有使用次数记录（重置为0）\n');

const { error: deleteError } = await supabase
  .from('usage_count_records')
  .delete()
  .eq('user_id', userId);

if (deleteError) {
  console.error('❌ 删除失败:', deleteError.message);
  process.exit(1);
}

console.log('✅ 已删除所有使用次数记录');
console.log('✅ 使用次数已重置为 0\n');

// 4. 验证
const { data: afterRecords, error: verifyError } = await supabase
  .from('usage_count_records')
  .select('*')
  .eq('user_id', userId);

if (verifyError) {
  console.error('❌ 验证失败:', verifyError.message);
} else {
  console.log(`📊 验证结果: ${afterRecords.length} 条记录`);
  if (afterRecords.length === 0) {
    console.log('✅ 清理成功！使用次数现在应该显示为 0/30');
  }
}

console.log('\n✅ 清理完成');

