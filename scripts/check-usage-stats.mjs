#!/usr/bin/env node
/**
 * 检查使用统计数据
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
const userId = '6882df3f2f9efaa6e241dce5';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 Supabase 配置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 检查使用统计数据...\n');

// 1. 检查订阅状态
console.log('================================================================================');
console.log('1. 检查订阅状态');
console.log('================================================================================');

const { data: subscription, error: subError } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

if (subError) {
  console.error('❌ 查询订阅失败:', subError);
} else if (!subscription) {
  console.log('❌ 未找到活跃订阅');
} else {
  console.log('✅ 找到活跃订阅:');
  console.log('  等级:', subscription.tier);
  console.log('  状态:', subscription.status);
  console.log('  周期:', subscription.period);
  console.log('  到期:', subscription.expires_at);
}

// 2. 检查 token_usage_records 表
console.log('\n================================================================================');
console.log('2. 检查 token_usage_records 表');
console.log('================================================================================');

const { data: tokenRecords, error: tokenError } = await supabase
  .from('token_usage_records')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

if (tokenError) {
  console.error('❌ 查询 token_usage_records 失败:', tokenError);
} else if (!tokenRecords || tokenRecords.length === 0) {
  console.log('⚠️  未找到 token 使用记录');
} else {
  console.log(`✅ 找到 ${tokenRecords.length} 条 token 使用记录:\n`);

  // 统计总使用次数
  const totalCount = tokenRecords.length;

  // 统计总 Token 使用量
  const totalTokens = tokenRecords.reduce((sum, record) => {
    return sum + (record.total_tokens || 0);
  }, 0);

  console.log('📊 统计汇总:');
  console.log('  总使用次数:', totalCount);
  console.log('  总 Token 使用量:', totalTokens);
  console.log();

  console.log('最近 10 条记录:');
  tokenRecords.forEach((record, index) => {
    console.log(`\n  记录 ${index + 1}:`);
    console.log('    功能:', record.feature || 'N/A');
    console.log('    Token:', record.total_tokens || 0);
    console.log('    模型:', record.model || 'N/A');
    console.log('    时间:', record.created_at);
  });
}

// 3. 检查 user_usage_logs 表
console.log('\n================================================================================');
console.log('3. 检查 user_usage_logs 表');
console.log('================================================================================');

const { data: usageLogs, error: logsError } = await supabase
  .from('user_usage_logs')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);

if (logsError) {
  console.error('❌ 查询 user_usage_logs 失败:', logsError);
} else if (!usageLogs || usageLogs.length === 0) {
  console.log('⚠️  user_usage_logs 表为空');
} else {
  console.log(`✅ 找到 ${usageLogs.length} 条记录`);
}

// 3. 检查是否有其他使用统计相关的表
console.log('\n================================================================================');
console.log('3. 检查其他可能的使用统计表');
console.log('================================================================================');

// 检查是否有 usage_stats 表
const { data: tables, error: tablesError } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public')
  .like('table_name', '%usage%');

if (!tablesError && tables) {
  console.log('找到以下包含 "usage" 的表:');
  tables.forEach(t => console.log('  -', t.table_name));
}

// 4. 检查前端应该显示的数据
console.log('\n================================================================================');
console.log('4. 前端应该显示的数据');
console.log('================================================================================');

if (subscription) {
  const tier = subscription.tier;
  
  // 根据等级确定限额
  const limits = {
    trial: { usageCount: 10, tokens: 100000 },
    pro: { usageCount: 30, tokens: 200000 },
    premium: { usageCount: -1, tokens: 500000 }
  };
  
  const limit = limits[tier] || limits.trial;
  
  console.log('当前订阅等级:', tier);
  console.log('使用次数限额:', limit.usageCount === -1 ? '无限制' : limit.usageCount);
  console.log('Token 限额:', limit.tokens);
  console.log();
  
  if (usageLogs && usageLogs.length > 0) {
    const totalCount = usageLogs.length;
    const totalTokens = usageLogs.reduce((sum, log) => sum + (log.tokens_used || 0), 0);
    
    console.log('实际使用情况:');
    console.log('  已使用次数:', totalCount);
    console.log('  已使用 Token:', totalTokens);
    console.log();
    
    if (limit.usageCount !== -1) {
      const usagePercentage = Math.round((totalCount / limit.usageCount) * 100);
      console.log('  使用次数进度:', usagePercentage + '%');
    }
    
    const tokenPercentage = Math.round((totalTokens / limit.tokens) * 100);
    console.log('  Token 使用进度:', tokenPercentage + '%');
  } else {
    console.log('⚠️  没有使用记录，前端应该显示:');
    console.log('  已使用次数: 0');
    console.log('  已使用 Token: 0');
  }
}

console.log('\n✅ 检查完成');

