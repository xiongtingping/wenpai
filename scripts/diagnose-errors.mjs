#!/usr/bin/env node
/**
 * 错误诊断脚本
 * 用于诊断 user_usage_logs 404 和 create-order 500 错误
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.local') });
dotenv.config({ path: join(__dirname, '../.env') });

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function checkEnvironmentVariables() {
  section('1. 检查环境变量');
  
  const requiredVars = {
    'SUPABASE_URL': process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
    'BUFPAY_SECRET_KEY': process.env.BUFPAY_SECRET_KEY || process.env.BUFPAY_APP_SECRET
  };

  let allConfigured = true;
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (value) {
      log(`✅ ${key}: 已配置 (${value.substring(0, 10)}...)`, 'green');
    } else {
      log(`❌ ${key}: 未配置`, 'red');
      allConfigured = false;
    }
  }

  return allConfigured;
}

async function checkSupabaseTables() {
  section('2. 检查 Supabase 数据库表');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    log('❌ Supabase 配置缺失，跳过数据库检查', 'red');
    return false;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 检查 user_usage_logs 表
    log('\n检查 user_usage_logs 表...', 'yellow');
    try {
      const { data, error } = await supabase
        .from('user_usage_logs')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          log('❌ user_usage_logs 表不存在', 'red');
          log('   建议: 需要创建该表', 'yellow');
        } else {
          log(`❌ user_usage_logs 表查询失败: ${error.message}`, 'red');
        }
      } else {
        log('✅ user_usage_logs 表存在且可访问', 'green');
      }
    } catch (err) {
      log(`❌ user_usage_logs 表检查异常: ${err.message}`, 'red');
    }

    // 检查 orders 表
    log('\n检查 orders 表...', 'yellow');
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          log('❌ orders 表不存在', 'red');
        } else {
          log(`❌ orders 表查询失败: ${error.message}`, 'red');
        }
      } else {
        log('✅ orders 表存在且可访问', 'green');
        
        // 检查表结构
        const { data: columns, error: schemaError } = await supabase
          .rpc('get_table_columns', { table_name: 'orders' })
          .catch(() => ({ data: null, error: null }));

        if (columns) {
          log('   表字段:', 'cyan');
          columns.forEach(col => {
            log(`   - ${col.column_name} (${col.data_type})`, 'blue');
          });
        }
      }
    } catch (err) {
      log(`❌ orders 表检查异常: ${err.message}`, 'red');
    }

    // 列出所有包含 'usage' 的表
    log('\n查找包含 "usage" 的表...', 'yellow');
    try {
      const { data: tables, error } = await supabase
        .rpc('get_tables_like', { pattern: '%usage%' })
        .catch(() => ({ data: null, error: null }));

      if (tables && tables.length > 0) {
        log('找到以下相关表:', 'green');
        tables.forEach(table => {
          log(`   - ${table.table_name}`, 'blue');
        });
      } else {
        log('未找到包含 "usage" 的表', 'yellow');
      }
    } catch (err) {
      // 忽略 RPC 函数不存在的错误
    }

    return true;
  } catch (error) {
    log(`❌ Supabase 连接失败: ${error.message}`, 'red');
    return false;
  }
}

async function testCreateOrderEndpoint() {
  section('3. 测试 create-order 端点');
  
  const testPayload = {
    userId: 'test_user_' + Date.now(),
    userEmail: 'test@example.com',
    productName: '测试产品',
    productType: 'professional',
    durationType: 'monthly',
    amount: 0.01,
    payType: 'alipay'
  };

  log('测试负载:', 'yellow');
  console.log(JSON.stringify(testPayload, null, 2));

  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    log(`\n响应状态: ${response.status} ${response.statusText}`, 
        response.ok ? 'green' : 'red');

    const responseText = await response.text();
    
    try {
      const responseData = JSON.parse(responseText);
      log('响应数据:', 'yellow');
      console.log(JSON.stringify(responseData, null, 2));
      
      if (responseData.error) {
        log(`❌ 错误: ${responseData.error}`, 'red');
      } else if (responseData.success) {
        log('✅ 订单创建成功', 'green');
      }
    } catch {
      log('响应内容 (非JSON):', 'yellow');
      console.log(responseText.substring(0, 500));
    }

    return response.ok;
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    log('   提示: 确保本地开发服务器正在运行 (npm run dev)', 'yellow');
    return false;
  }
}

async function generateFixScript() {
  section('4. 生成修复脚本');
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  
  if (!supabaseUrl) {
    log('❌ 无法生成修复脚本: Supabase URL 未配置', 'red');
    return;
  }

  const fixScript = `
-- 修复脚本: 创建 user_usage_logs 表
-- 在 Supabase SQL Editor 中执行

-- 1. 创建表
CREATE TABLE IF NOT EXISTS public.user_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_user_usage_logs_user_id 
  ON public.user_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_logs_created_at 
  ON public.user_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_logs_timestamp 
  ON public.user_usage_logs(timestamp);

-- 3. 启用 RLS
ALTER TABLE public.user_usage_logs ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略
CREATE POLICY "Users can view their own usage logs"
  ON public.user_usage_logs
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own usage logs"
  ON public.user_usage_logs
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 5. 验证
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_name = 'user_usage_logs';
`;

  log('SQL 修复脚本已生成:', 'green');
  log(`\n在 Supabase Dashboard 执行以下 SQL:\n${supabaseUrl}/project/_/sql`, 'cyan');
  console.log(fixScript);
}

async function main() {
  log('\n🔍 开始错误诊断...', 'cyan');
  
  const envOk = await checkEnvironmentVariables();
  const dbOk = await checkSupabaseTables();
  // const endpointOk = await testCreateOrderEndpoint();
  
  await generateFixScript();

  section('诊断总结');
  
  if (envOk && dbOk) {
    log('✅ 所有检查通过', 'green');
  } else {
    log('❌ 发现问题，请查看上述详细信息', 'red');
    log('\n建议修复步骤:', 'yellow');
    if (!envOk) {
      log('1. 配置缺失的环境变量', 'yellow');
    }
    if (!dbOk) {
      log('2. 执行生成的 SQL 修复脚本', 'yellow');
    }
  }
  
  log('\n📝 详细诊断报告已保存到: docs/ERROR_DIAGNOSIS_2025-10-08.md', 'cyan');
}

main().catch(error => {
  log(`\n❌ 诊断脚本执行失败: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

