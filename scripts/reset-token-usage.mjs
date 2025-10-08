#!/usr/bin/env node
/**
 * 重置 Token 使用记录（升级后清零）
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

console.log('🔍 检查 Token 使用记录...\n');

// 1. 查询所有 Token 使用记录
const { data: tokenRecords, error: queryError } = await supabase
  .from('token_usage_records')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

if (queryError) {
  console.error('❌ 查询失败:', queryError.message);
  process.exit(1);
}

console.log(`📊 找到 ${tokenRecords.length} 条 Token 使用记录\n`);

if (tokenRecords.length > 0) {
  // 统计总 Token 使用量
  const totalTokens = tokenRecords.reduce((sum, record) => {
    return sum + (record.total_tokens || 0);
  }, 0);
  
  console.log(`📈 总 Token 使用量: ${totalTokens.toLocaleString()} tokens\n`);
  
  // 显示最近5条记录
  console.log('最近 5 条记录:');
  tokenRecords.slice(0, 5).forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.feature} - ${record.total_tokens} tokens (${record.created_at})`);
  });
  console.log('');
}

// 2. 检查订阅状态
const { data: subscription, error: subError } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

if (subError) {
  console.log('⚠️  无法查询订阅状态:', subError.message);
} else {
  console.log('📋 当前订阅状态:');
  console.log(`  套餐: ${subscription.tier}`);
  console.log(`  状态: ${subscription.status}`);
  console.log(`  开始时间: ${subscription.started_at}`);
  console.log(`  到期时间: ${subscription.expires_at}\n`);
}

// 3. 执行清理
console.log('================================================================================');
console.log('🔧 执行清理：删除所有 Token 使用记录（升级后重置）');
console.log('================================================================================\n');

const { error: deleteError } = await supabase
  .from('token_usage_records')
  .delete()
  .eq('user_id', userId);

if (deleteError) {
  console.error('❌ 删除失败:', deleteError.message);
  process.exit(1);
}

console.log('✅ 已删除所有 Token 使用记录');
console.log('✅ Token 使用量已重置为 0\n');

// 4. 验证
const { data: afterRecords, error: verifyError } = await supabase
  .from('token_usage_records')
  .select('*')
  .eq('user_id', userId);

if (verifyError) {
  console.error('❌ 验证失败:', verifyError.message);
} else {
  console.log(`📊 验证结果: ${afterRecords.length} 条记录`);
  if (afterRecords.length === 0) {
    console.log('✅ 清理成功！Token 使用量现在应该显示为 0 / 200,000');
  }
}

console.log('\n✅ 重置完成');
console.log('\n预期显示:');
console.log('  Token使用量: 0 / 200,000 tokens');
console.log('  使用次数: 0 / 30 次');

