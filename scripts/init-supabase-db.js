#!/usr/bin/env node
/**
 * Supabase数据库初始化脚本
 * 自动创建所有必需的表格和配置
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ SECURITY FIX: 2025-08-30 移除硬编码配置，使用环境变量
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少Supabase配置环境变量');
  process.exit(1);
}

// 创建Supabase客户端（使用service role key以执行管理操作）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 执行SQL脚本
 */
async function executeSQLScript(scriptPath) {
  try {
    console.log(`📄 读取SQL脚本: ${scriptPath}`);
    const sqlContent = readFileSync(scriptPath, 'utf8');
    
    // 分割SQL语句（以分号为分隔符）
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 准备执行 ${statements.length} 条SQL语句...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ 执行语句 ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.warn(`⚠️  语句 ${i + 1} 执行警告:`, error.message);
          } else {
            console.log(`✅ 语句 ${i + 1} 执行成功`);
          }
        } catch (err) {
          console.warn(`⚠️  语句 ${i + 1} 执行异常:`, err.message);
        }
      }
    }
    
    console.log('🎉 SQL脚本执行完成');
  } catch (error) {
    console.error('❌ SQL脚本执行失败:', error);
    throw error;
  }
}

/**
 * 验证表格是否存在
 */
async function verifyTables() {
  const requiredTables = [
    'user_profiles',
    'user_subscriptions', 
    'token_usage_records',
    'usage_count_records',
    'user_invite_relations',
    'user_invite_stats',
    'user_invite_events',
    'user_files',
    'user_notes',
    'user_brand_corpus',
    'user_library_items',
    'user_chat_history'
  ];
  
  console.log('🔍 验证表格是否创建成功...');
  
  for (const tableName of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) {
        console.log(`❌ 表 ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ 表 ${tableName}: 创建成功`);
      }
    } catch (err) {
      console.log(`❌ 表 ${tableName}: 验证失败 - ${err.message}`);
    }
  }
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始初始化Supabase数据库...');
    console.log(`📡 连接到: ${SUPABASE_URL}`);
    
    // 测试连接
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'Auth session missing!') {
      throw new Error(`Supabase连接失败: ${error.message}`);
    }
    console.log('✅ Supabase连接成功');
    
    // 执行数据库初始化脚本
    const scriptPath = join(__dirname, '..', 'database_setup.sql');
    await executeSQLScript(scriptPath);
    
    // 验证表格创建
    await verifyTables();
    
    console.log('🎉 Supabase数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);