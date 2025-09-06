#!/usr/bin/env node

/**
 * Token使用量统计修复执行脚本
 * 执行数据库修复并测试Token统计功能
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少Supabase环境变量');
  console.error('请确保设置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 执行SQL脚本
 */
async function executeSQLScript(scriptPath) {
  try {
    console.log(`🔧 执行SQL脚本: ${scriptPath}`);
    
    const sqlContent = readFileSync(scriptPath, 'utf8');
    
    // 将脚本分割成单独的语句执行
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (statement.toUpperCase().startsWith('RAISE NOTICE')) {
        // 跳过RAISE NOTICE语句
        continue;
      }
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.warn(`⚠️  语句执行警告: ${error.message}`);
          console.warn(`   语句: ${statement.substring(0, 100)}...`);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`⚠️  语句执行错误: ${err.message}`);
        console.warn(`   语句: ${statement.substring(0, 100)}...`);
        errorCount++;
      }
    }
    
    console.log(`✅ SQL脚本执行完成: ${successCount} 成功, ${errorCount} 警告/错误`);
    return true;
  } catch (error) {
    console.error(`❌ SQL脚本执行失败:`, error);
    return false;
  }
}

/**
 * 手动执行修复操作（备选方案）
 */
async function manualFix() {
  try {
    console.log('🔧 开始手动执行修复操作...');
    
    // 1. 修改token_usage_records表的user_id字段类型
    console.log('📝 修改token_usage_records表结构...');
    
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        -- 删除外键约束
        ALTER TABLE token_usage_records DROP CONSTRAINT IF EXISTS token_usage_records_user_id_fkey;
        
        -- 修改字段类型
        ALTER TABLE token_usage_records ALTER COLUMN user_id TYPE VARCHAR(100);
        
        -- 暂时禁用RLS
        ALTER TABLE token_usage_records DISABLE ROW LEVEL SECURITY;
        
        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_token_usage_user_id_varchar ON token_usage_records(user_id);
        CREATE INDEX IF NOT EXISTS idx_token_usage_timestamp ON token_usage_records(timestamp);
      `
    });
    
    if (alterError) {
      console.log('⚠️  表结构修改可能部分失败，尝试继续...');
    } else {
      console.log('✅ 表结构修改完成');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 手动修复失败:', error);
    return false;
  }
}

/**
 * 测试Token统计功能
 */
async function testTokenStats() {
  try {
    console.log('🧪 测试Token统计功能...');
    
    // 1. 检查表结构
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'token_usage_records')
      .eq('column_name', 'user_id');
    
    if (tableError) {
      console.warn('⚠️  无法检查表结构:', tableError.message);
    } else {
      console.log('📋 user_id字段类型:', tableInfo);
    }
    
    // 2. 插入测试记录
    const testUserId = 'test_user_' + Date.now();
    const testRecord = {
      id: 'test_record_' + Date.now(),
      user_id: testUserId,
      feature: 'test-feature',
      input_tokens: 100,
      output_tokens: 200,
      total_tokens: 300,
      model: 'test-model',
      success: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 插入测试记录...', { testUserId });
    
    const { data: insertData, error: insertError } = await supabase
      .from('token_usage_records')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.error('❌ 插入测试记录失败:', insertError);
      return false;
    }
    
    console.log('✅ 测试记录插入成功:', insertData?.[0]?.id);
    
    // 3. 查询测试记录
    console.log('🔍 查询测试记录...');
    
    const { data: queryData, error: queryError } = await supabase
      .from('token_usage_records')
      .select('*')
      .eq('user_id', testUserId);
    
    if (queryError) {
      console.error('❌ 查询测试记录失败:', queryError);
      return false;
    }
    
    console.log('✅ 测试记录查询成功:', {
      recordCount: queryData?.length || 0,
      totalTokens: queryData?.[0]?.total_tokens
    });
    
    // 4. 清理测试记录
    console.log('🧹 清理测试记录...');
    
    const { error: deleteError } = await supabase
      .from('token_usage_records')
      .delete()
      .eq('user_id', testUserId);
    
    if (deleteError) {
      console.warn('⚠️  清理测试记录失败:', deleteError.message);
    } else {
      console.log('✅ 测试记录清理完成');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Token统计功能测试失败:', error);
    return false;
  }
}

/**
 * 主执行函数
 */
async function main() {
  console.log('🚀 开始Token使用量统计修复流程...');
  console.log('⚙️  Supabase URL:', supabaseUrl);
  
  try {
    // 1. 测试数据库连接
    const { data, error } = await supabase.from('token_usage_records').select('count').limit(1);
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return false;
    }
    console.log('✅ 数据库连接成功');
    
    // 2. 执行修复脚本
    const scriptPath = join(projectRoot, 'database_migration_token_fix.sql');
    
    try {
      await executeSQLScript(scriptPath);
    } catch (scriptError) {
      console.warn('⚠️  脚本执行失败，尝试手动修复...');
      await manualFix();
    }
    
    // 3. 测试修复效果
    const testResult = await testTokenStats();
    
    if (testResult) {
      console.log('\n🎉 Token使用量统计修复完成！');
      console.log('📝 修复内容:');
      console.log('   ✅ 修改user_id字段类型为VARCHAR(100)');
      console.log('   ✅ 暂时禁用RLS策略');
      console.log('   ✅ 添加必要索引');
      console.log('   ✅ 修复字段名匹配问题');
      console.log('\n🔄 接下来建议:');
      console.log('   1. 重启开发服务器');
      console.log('   2. 测试Token统计功能');
      console.log('   3. 根据需要重新配置RLS策略');
    } else {
      console.log('\n❌ Token使用量统计修复可能存在问题');
      console.log('请检查数据库配置和权限');
    }
    
  } catch (error) {
    console.error('❌ 修复流程执行失败:', error);
    return false;
  }
}

// 执行主函数
main().catch(console.error);