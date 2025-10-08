#!/usr/bin/env node
/**
 * 完整数据库审查脚本
 * 连接到 Supabase 并审查所有表的结构
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
config({ path: join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('❌ 缺少环境变量:');
  console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'cyan');
  console.log('='.repeat(80));
}

/**
 * 获取所有表
 */
async function getAllTables() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `
  });

  if (error) {
    // 如果 RPC 不可用，使用直接查询
    const query = `
      SELECT table_name as tablename
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    // 使用原始 SQL 查询
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
      },
      body: JSON.stringify({ sql: query })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tables: ${response.statusText}`);
    }

    return await response.json();
  }

  return data;
}

/**
 * 获取表的列信息
 */
async function getTableColumns(tableName) {
  const query = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
    },
    body: JSON.stringify({ sql: query })
  });

  if (!response.ok) {
    // 如果失败，尝试使用 Supabase 客户端直接查询表结构
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (error) throw error;
      
      // 从空结果推断列名
      return [];
    } catch (err) {
      console.error(`无法获取表 ${tableName} 的列信息:`, err.message);
      return [];
    }
  }

  return await response.json();
}

/**
 * 主函数
 */
async function main() {
  log('\n🔍 开始完整数据库审查...', 'cyan');
  log(`📡 连接到: ${SUPABASE_URL}`, 'blue');

  try {
    // 1. 获取所有表
    section('1. 数据库中的所有表');
    
    // 使用简单的方法：尝试查询已知的表
    const knownTables = [
      'users',
      'user_subscriptions',
      'orders',
      'user_usage_logs',
      'upgrade_orders',
      'user_profiles',
      'user_settings',
      'user_preferences',
      'brand_library',
      'content_library',
      'ai_chat_history',
      'radar_subscriptions',
      'radar_inspiration',
      'creative_todos',
      'emoji_favorites',
      'invitation_relationships',
      'subscription_kv',
      'token_usage_kv',
      'model_usage_kv'
    ];

    const existingTables = [];
    
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
          log(`  ✅ ${tableName}`, 'green');
        }
      } catch (err) {
        // 表不存在
      }
    }

    log(`\n📊 找到 ${existingTables.length} 个表`, 'blue');

    // 2. 检查每个表的结构
    section('2. 表结构详细信息');

    const tableStructures = {};

    for (const tableName of existingTables) {
      log(`\n📋 表: ${tableName}`, 'cyan');
      
      try {
        // 获取表的一行数据来推断结构
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          log(`  ❌ 无法查询: ${error.message}`, 'red');
          continue;
        }

        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          tableStructures[tableName] = columns;
          
          log(`  列数: ${columns.length}`, 'blue');
          columns.forEach(col => {
            const value = data[0][col];
            const type = typeof value;
            log(`    - ${col} (${type})`, 'yellow');
          });
        } else {
          // 表为空，尝试获取列信息
          const { data: emptyData, error: emptyError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          log(`  ⚠️ 表为空`, 'yellow');
        }
      } catch (err) {
        log(`  ❌ 错误: ${err.message}`, 'red');
      }
    }

    // 3. 检查字段名一致性
    section('3. 字段名一致性检查');

    const fieldIssues = {
      subscription_type: [],
      tier: [],
      duration_type: [],
      period: []
    };

    for (const [tableName, columns] of Object.entries(tableStructures)) {
      if (columns.includes('subscription_type')) {
        fieldIssues.subscription_type.push(tableName);
      }
      if (columns.includes('tier')) {
        fieldIssues.tier.push(tableName);
      }
      if (columns.includes('duration_type')) {
        fieldIssues.duration_type.push(tableName);
      }
      if (columns.includes('period')) {
        fieldIssues.period.push(tableName);
      }
    }

    log('\n📊 字段使用情况:', 'blue');
    log(`\n  subscription_type 字段:`, 'yellow');
    if (fieldIssues.subscription_type.length > 0) {
      fieldIssues.subscription_type.forEach(t => log(`    - ${t}`, 'red'));
    } else {
      log(`    ✅ 未发现使用此字段的表`, 'green');
    }

    log(`\n  tier 字段:`, 'yellow');
    if (fieldIssues.tier.length > 0) {
      fieldIssues.tier.forEach(t => log(`    - ${t}`, 'green'));
    } else {
      log(`    ⚠️ 未发现使用此字段的表`, 'yellow');
    }

    log(`\n  duration_type 字段:`, 'yellow');
    if (fieldIssues.duration_type.length > 0) {
      fieldIssues.duration_type.forEach(t => log(`    - ${t}`, 'blue'));
    } else {
      log(`    ⚠️ 未发现使用此字段的表`, 'yellow');
    }

    log(`\n  period 字段:`, 'yellow');
    if (fieldIssues.period.length > 0) {
      fieldIssues.period.forEach(t => log(`    - ${t}`, 'green'));
    } else {
      log(`    ⚠️ 未发现使用此字段的表`, 'yellow');
    }

    // 4. 生成报告
    section('4. 审查总结');

    log('\n✅ 审查完成！', 'green');
    log(`\n📊 统计:`, 'blue');
    log(`  - 总表数: ${existingTables.length}`, 'blue');
    log(`  - 已审查: ${Object.keys(tableStructures).length}`, 'green');
    
    if (fieldIssues.subscription_type.length > 0) {
      log(`\n⚠️ 发现问题:`, 'yellow');
      log(`  - ${fieldIssues.subscription_type.length} 个表仍使用 subscription_type 字段`, 'red');
      log(`  - 建议: 这些表应该使用 tier 字段`, 'yellow');
    }

    // 5. 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      totalTables: existingTables.length,
      tables: existingTables,
      structures: tableStructures,
      fieldIssues
    };

    const fs = await import('fs');
    fs.writeFileSync(
      join(__dirname, '..', 'docs', 'database-audit-report.json'),
      JSON.stringify(report, null, 2)
    );

    log(`\n💾 报告已保存到: docs/database-audit-report.json`, 'green');

  } catch (error) {
    log(`\n❌ 审查失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();

