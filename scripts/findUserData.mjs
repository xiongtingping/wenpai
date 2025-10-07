#!/usr/bin/env node
/**
 * 查找用户数据 - 尝试多个可能的表名
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

const userId = process.argv[2] || '68b6fd961774b4e49242c916';

// 可能的表名列表
const possibleTables = [
  // 订阅相关
  'subscriptions',
  'subscription',
  'user_subscriptions',
  'subscription_status',
  'subscription_tiers',
  
  // 订单相关
  'orders',
  'payment_orders',
  'bufpay_orders',
  'creem_orders',
  'transactions',
  
  // 用户相关
  'users',
  'user_profiles',
  'profiles',
  'user_metadata',
  'user_data',
];

async function tryQuery(tableName) {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .limit(10);
    
    if (error) {
      return { tableName, status: 'error', message: error.message };
    }
    
    return { tableName, status: 'success', count, data };
  } catch (e) {
    return { tableName, status: 'exception', message: e.message };
  }
}

async function findUserData() {
  console.log(`\n🔍 查找用户数据: ${userId}\n`);
  console.log('─'.repeat(80));
  
  for (const tableName of possibleTables) {
    const result = await tryQuery(tableName);
    
    if (result.status === 'success') {
      if (result.count > 0) {
        console.log(`\n✅ ${tableName} (找到 ${result.count} 条记录):`);
        result.data.forEach((record, index) => {
          console.log(`\n   记录 #${index + 1}:`);
          Object.entries(record).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              let displayValue = value;
              if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
                displayValue = new Date(value).toLocaleString('zh-CN');
              }
              console.log(`   ├─ ${key}: ${displayValue}`);
            }
          });
        });
      } else {
        console.log(`⚪ ${tableName}: 表存在但无数据`);
      }
    } else if (result.message && !result.message.includes('Could not find the table')) {
      console.log(`❌ ${tableName}: ${result.message}`);
    }
  }
  
  console.log('\n' + '─'.repeat(80));
  console.log('✅ 查询完成\n');
}

findUserData();

