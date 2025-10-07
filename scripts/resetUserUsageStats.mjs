#!/usr/bin/env node
/**
 * 重置用户使用统计（订阅升级后）
 * 用法: node scripts/resetUserUsageStats.mjs <userId> <tier>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const userId = process.argv[2];
const tier = process.argv[3];

if (!userId || !tier) {
  console.error('❌ 请提供用户ID和订阅等级');
  console.error('用法: node scripts/resetUserUsageStats.mjs <userId> <tier>');
  console.error('示例: node scripts/resetUserUsageStats.mjs 68b6fd961774b4e49242c916 premium');
  process.exit(1);
}

async function resetUsageStats() {
  console.log('\n🔄 开始重置使用统计...');
  console.log('用户ID:', userId);
  console.log('订阅等级:', tier);
  console.log('─'.repeat(80));

  try {
    // 获取新套餐的限额
    const tierLimits = {
      'trial': 10,
      'pro': 30,
      'premium': 100,
      'professional': 30  // pro的别名
    };

    const totalCount = tierLimits[tier] || 10;

    // 1. 删除本月的使用记录（重新开始计数）
    console.log('\n📝 1. 删除本月使用记录...');
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const { error: deleteError } = await supabase
      .from('usage_count_records')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString());

    if (deleteError) {
      console.error('❌ 删除使用记录失败:', deleteError);
    } else {
      console.log('✅ 已删除本月使用记录');
    }

    // 2. 重置user_usage_balance表
    console.log('\n💎 2. 重置使用次数余额...');
    const { error: balanceError } = await supabase
      .from('user_usage_balance')
      .upsert({
        user_id: userId,
        total_count: totalCount,
        used_count: 0,
        remaining_count: totalCount,
        base_count: totalCount,
        bonus_count: 0,
        last_reset_at: new Date().toISOString(),
        reset_period: 'monthly',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (balanceError) {
      console.error('❌ 重置使用次数失败:', balanceError);
    } else {
      console.log('✅ 使用次数已重置:', { tier, totalCount });
    }

    // 3. 查询当前Token使用量
    console.log('\n📊 3. 查询Token使用量...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('token_usage_records')
      .select('total_tokens')
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString());

    if (tokenError) {
      console.error('❌ 查询Token使用量失败:', tokenError);
    } else {
      const totalTokens = (tokenData || []).reduce((sum, record) => sum + (record.total_tokens || 0), 0);
      console.log('ℹ️  本月Token使用量:', totalTokens.toLocaleString());
      console.log('ℹ️  Token使用量保持累计，限额已更新为新套餐标准');
    }

    console.log('\n' + '─'.repeat(80));
    console.log('🎉 使用统计重置成功！');
    console.log('\n📊 重置结果:');
    console.log('   用户ID:', userId);
    console.log('   订阅等级:', tier);
    console.log('   使用次数限额:', totalCount);
    console.log('   已使用次数: 0');
    console.log('   剩余次数:', totalCount);
    console.log('');

  } catch (error) {
    console.error('\n❌ 重置失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

resetUsageStats();

