#!/usr/bin/env node
/**
 * 检查订阅进度计算
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

console.log('🔍 检查订阅进度计算...\n');

// 查询订阅数据
const { data: subscription, error } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .single();

if (error) {
  console.error('❌ 查询失败:', error);
  process.exit(1);
}

if (!subscription) {
  console.log('❌ 未找到活跃订阅');
  process.exit(1);
}

console.log('✅ 找到订阅记录:\n');
console.log('订阅ID:', subscription.id);
console.log('等级:', subscription.tier);
console.log('周期:', subscription.period);
console.log('状态:', subscription.status);
console.log('开始时间:', subscription.started_at);
console.log('到期时间:', subscription.expires_at);
console.log('创建时间:', subscription.created_at);

// 计算进度
const now = new Date();
const startDate = subscription.started_at ? new Date(subscription.started_at) : null;
const endDate = subscription.expires_at ? new Date(subscription.expires_at) : null;

console.log('\n📊 进度计算:\n');

if (!startDate) {
  console.log('⚠️  缺少 started_at 字段！');
  console.log('需要根据 period 估算开始时间');
  
  if (endDate) {
    const period = subscription.period || 'monthly';
    let estimatedStart;
    
    if (period === 'yearly') {
      estimatedStart = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    } else {
      estimatedStart = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    console.log('估算开始时间:', estimatedStart.toISOString());
    console.log('到期时间:', endDate.toISOString());
    console.log('当前时间:', now.toISOString());
    
    const totalDuration = endDate.getTime() - estimatedStart.getTime();
    const elapsed = now.getTime() - estimatedStart.getTime();
    const progress = Math.round((elapsed / totalDuration) * 100);
    
    console.log('\n总时长:', Math.round(totalDuration / (1000 * 60 * 60 * 24)), '天');
    console.log('已过去:', Math.round(elapsed / (1000 * 60 * 60 * 24)), '天');
    console.log('进度:', progress, '%');
    
    const remaining = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    console.log('剩余天数:', daysRemaining, '天');
  }
} else {
  console.log('开始时间:', startDate.toISOString());
  console.log('到期时间:', endDate.toISOString());
  console.log('当前时间:', now.toISOString());
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const progress = Math.round((elapsed / totalDuration) * 100);
  
  console.log('\n总时长:', Math.round(totalDuration / (1000 * 60 * 60 * 24)), '天');
  console.log('已过去:', Math.round(elapsed / (1000 * 60 * 60 * 24)), '天');
  console.log('进度:', progress, '%');
  
  const remaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  console.log('剩余天数:', daysRemaining, '天');
}

console.log('\n✅ 检查完成');

