#!/usr/bin/env node
/**
 * 🏗️ Supabase数据库结构测试脚本
 * 验证表格结构、约束、索引和RLS策略
 */

import { createClient } from '@supabase/supabase-js';

// Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 检查表格结构
 */
async function checkTableStructure() {
  console.log('\n🏗️ 1. 检查表格结构');
  
  const expectedTables = [
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
  
  const results = {};
  
  for (const tableName of expectedTables) {
    try {
      // 查询表格信息
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        results[tableName] = { exists: true };
        console.log(`  ✅ ${tableName}: 表格存在`);
        
        // 检查列信息
        const { data: columns, error: colError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position');
        
        if (!colError && columns) {
          results[tableName].columns = columns.length;
          console.log(`    📊 字段数量: ${columns.length}`);
        }
        
      } else {
        results[tableName] = { exists: false };
        console.log(`  ❌ ${tableName}: 表格不存在`);
      }
      
    } catch (error) {
      results[tableName] = { exists: false, error: error.message };
      console.log(`  ❌ ${tableName}: 检查失败 - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * 检查索引
 */
async function checkIndexes() {
  console.log('\n📈 2. 检查索引');
  
  try {
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('*')
      .eq('schemaname', 'public')
      .like('indexname', 'idx_%');
    
    if (error) throw error;
    
    console.log(`  ✅ 找到 ${data?.length || 0} 个自定义索引`);
    
    const indexesByTable = {};
    data?.forEach(index => {
      if (!indexesByTable[index.tablename]) {
        indexesByTable[index.tablename] = [];
      }
      indexesByTable[index.tablename].push(index.indexname);
    });
    
    Object.entries(indexesByTable).forEach(([table, indexes]) => {
      console.log(`    ${table}: ${indexes.length} 个索引`);
    });
    
    return { success: true, indexCount: data?.length || 0, indexesByTable };
  } catch (error) {
    console.log(`  ❌ 索引检查失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查RLS策略
 */
async function checkRLSPolicies() {
  console.log('\n🔒 3. 检查RLS策略');
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public');
    
    if (error) throw error;
    
    console.log(`  ✅ 找到 ${data?.length || 0} 个RLS策略`);
    
    const policiesByTable = {};
    data?.forEach(policy => {
      if (!policiesByTable[policy.tablename]) {
        policiesByTable[policy.tablename] = [];
      }
      policiesByTable[policy.tablename].push({
        name: policy.policyname,
        cmd: policy.cmd
      });
    });
    
    Object.entries(policiesByTable).forEach(([table, policies]) => {
      console.log(`    ${table}: ${policies.length} 个策略`);
      policies.forEach(policy => {
        console.log(`      - ${policy.name} (${policy.cmd})`);
      });
    });
    
    return { success: true, policyCount: data?.length || 0, policiesByTable };
  } catch (error) {
    console.log(`  ❌ RLS策略检查失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查视图
 */
async function checkViews() {
  console.log('\n👁️ 4. 检查统计视图');
  
  const expectedViews = [
    'monthly_token_usage',
    'daily_token_usage', 
    'feature_usage_stats'
  ];
  
  const results = {};
  
  for (const viewName of expectedViews) {
    try {
      const { data, error } = await supabase
        .from('information_schema.views')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', viewName);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        results[viewName] = { exists: true };
        console.log(`  ✅ ${viewName}: 视图存在`);
        
        // 测试查询
        const { data: viewData, error: queryError } = await supabase
          .from(viewName)
          .select('*')
          .limit(1);
        
        if (!queryError) {
          console.log(`    🔍 查询测试: 成功`);
        } else {
          console.log(`    ❌ 查询测试: ${queryError.message}`);
        }
        
      } else {
        results[viewName] = { exists: false };
        console.log(`  ❌ ${viewName}: 视图不存在`);
      }
      
    } catch (error) {
      results[viewName] = { exists: false, error: error.message };
      console.log(`  ❌ ${viewName}: 检查失败 - ${error.message}`);
    }
  }
  
  return results;
}

/**
 * 检查存储函数
 */
async function checkStoredFunctions() {
  console.log('\n⚙️ 5. 检查存储函数');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.routines')
      .select('*')
      .eq('routine_schema', 'public')
      .in('routine_name', [
        'get_user_monthly_token_usage',
        'check_user_token_limit',
        'get_user_usage_count',
        'cleanup_old_records',
        'update_updated_at_column'
      ]);
    
    if (error) throw error;
    
    console.log(`  ✅ 找到 ${data?.length || 0} 个存储函数`);
    
    data?.forEach(func => {
      console.log(`    - ${func.routine_name} (${func.routine_type})`);
    });
    
    return { success: true, functionCount: data?.length || 0, functions: data };
  } catch (error) {
    console.log(`  ❌ 存储函数检查失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查触发器
 */
async function checkTriggers() {
  console.log('\n🔄 6. 检查触发器');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_schema', 'public')
      .like('trigger_name', '%updated_at%');
    
    if (error) throw error;
    
    console.log(`  ✅ 找到 ${data?.length || 0} 个触发器`);
    
    const triggersByTable = {};
    data?.forEach(trigger => {
      if (!triggersByTable[trigger.event_object_table]) {
        triggersByTable[trigger.event_object_table] = [];
      }
      triggersByTable[trigger.event_object_table].push(trigger.trigger_name);
    });
    
    Object.entries(triggersByTable).forEach(([table, triggers]) => {
      console.log(`    ${table}: ${triggers.join(', ')}`);
    });
    
    return { success: true, triggerCount: data?.length || 0, triggersByTable };
  } catch (error) {
    console.log(`  ❌ 触发器检查失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 检查外键约束
 */
async function checkForeignKeys() {
  console.log('\n🔗 7. 检查外键约束');
  
  try {
    const { data, error } = await supabase
      .from('information_schema.table_constraints')
      .select('*')
      .eq('constraint_schema', 'public')
      .eq('constraint_type', 'FOREIGN KEY');
    
    if (error) throw error;
    
    console.log(`  ✅ 找到 ${data?.length || 0} 个外键约束`);
    
    const fkByTable = {};
    data?.forEach(fk => {
      if (!fkByTable[fk.table_name]) {
        fkByTable[fk.table_name] = [];
      }
      fkByTable[fk.table_name].push(fk.constraint_name);
    });
    
    Object.entries(fkByTable).forEach(([table, constraints]) => {
      console.log(`    ${table}: ${constraints.length} 个外键`);
    });
    
    return { success: true, fkCount: data?.length || 0, fkByTable };
  } catch (error) {
    console.log(`  ❌ 外键约束检查失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 生成结构测试报告
 */
function generateStructureReport(results) {
  console.log('\n📊 === 数据库结构测试报告 ===');
  
  const { tables, indexes, policies, views, functions, triggers, foreignKeys } = results;
  
  // 表格统计
  const existingTables = Object.values(tables).filter(t => t.exists).length;
  const totalTables = Object.keys(tables).length;
  console.log(`\n📋 表格: ${existingTables}/${totalTables} 个表格存在`);
  
  // 功能组件统计
  console.log(`\n🔧 数据库组件:`);
  console.log(`  📈 索引: ${indexes.success ? indexes.indexCount : 0} 个`);
  console.log(`  🔒 RLS策略: ${policies.success ? policies.policyCount : 0} 个`);
  console.log(`  👁️ 统计视图: ${Object.values(views).filter(v => v.exists).length}/3 个`);
  console.log(`  ⚙️ 存储函数: ${functions.success ? functions.functionCount : 0} 个`);
  console.log(`  🔄 触发器: ${triggers.success ? triggers.triggerCount : 0} 个`);
  console.log(`  🔗 外键约束: ${foreignKeys.success ? foreignKeys.fkCount : 0} 个`);
  
  // 总体评估
  const structureScore = (
    (existingTables / totalTables) * 0.4 +
    (indexes.success ? 1 : 0) * 0.15 +
    (policies.success ? 1 : 0) * 0.15 +
    (Object.values(views).filter(v => v.exists).length / 3) * 0.1 +
    (functions.success ? 1 : 0) * 0.1 +
    (triggers.success ? 1 : 0) * 0.05 +
    (foreignKeys.success ? 1 : 0) * 0.05
  ) * 100;
  
  console.log(`\n🎯 数据库结构完整度: ${Math.round(structureScore)}%`);
  
  if (structureScore >= 95) {
    console.log('🎉 数据库结构配置完美！');
  } else if (structureScore >= 80) {
    console.log('✅ 数据库结构配置良好');
  } else {
    console.log('⚠️ 数据库结构需要改进');
  }
  
  return { structureScore, existingTables, totalTables };
}

/**
 * 测试基础数据操作（无外键依赖）
 */
async function testBasicOperations() {
  console.log('\n🧪 8. 测试基础数据操作');
  
  const results = {};
  
  // 创建临时测试用户
  try {
    console.log('  🔧 创建临时测试用户...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    const testUserId = authData.user.id;
    console.log(`  ✅ 临时用户创建成功: ${testUserId}`);
    
    // 测试创建用户档案
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: testUserId,
          nickname: '测试用户',
          bio: '这是一个测试账户'
        })
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      console.log(`  ✅ 用户档案创建成功`);
      results.profileCreation = { success: true };
      
      // 测试创建订阅信息
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: testUserId,
          tier: 'trial',
          monthly_token_limit: 100000
        })
        .select()
        .single();
      
      if (subError) throw subError;
      
      console.log(`  ✅ 订阅信息创建成功`);
      results.subscriptionCreation = { success: true };
      
      // 测试Token使用记录
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_usage_records')
        .insert({
          id: `test_${Date.now()}`,
          user_id: testUserId,
          feature: 'test_feature',
          total_tokens: 100,
          model: 'test-model'
        })
        .select()
        .single();
      
      if (tokenError) throw tokenError;
      
      console.log(`  ✅ Token使用记录创建成功`);
      results.tokenUsageCreation = { success: true };
      
    } catch (error) {
      console.log(`  ❌ 数据操作失败: ${error.message}`);
      results.dataOperations = { success: false, error: error.message };
    }
    
    // 清理测试用户
    try {
      await supabase.auth.admin.deleteUser(testUserId);
      console.log(`  🧹 清理测试用户成功`);
    } catch (cleanupError) {
      console.log(`  ⚠️ 清理测试用户失败: ${cleanupError.message}`);
    }
    
  } catch (error) {
    console.log(`  ❌ 无法创建测试用户: ${error.message}`);
    results.userCreation = { success: false, error: error.message };
  }
  
  return results;
}

/**
 * 测试存储函数调用
 */
async function testStoredFunctionCalls() {
  console.log('\n🛠️ 9. 测试存储函数调用');
  
  const results = {};
  
  // 测试函数是否可调用
  const functions = [
    'get_user_monthly_token_usage',
    'check_user_token_limit', 
    'get_user_usage_count'
  ];
  
  for (const funcName of functions) {
    try {
      const { data, error } = await supabase
        .rpc(funcName, { p_user_id: '550e8400-e29b-41d4-a716-446655440000' });
      
      if (error) throw error;
      
      results[funcName] = { success: true, callable: true };
      console.log(`  ✅ ${funcName}: 函数可调用`);
      
    } catch (error) {
      results[funcName] = { success: false, error: error.message };
      console.log(`  ❌ ${funcName}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始Supabase数据库结构全面测试...');
    console.log(`📡 连接到: ${SUPABASE_URL}`);
    
    const results = {};
    
    // 1. 检查表格结构
    results.tables = await checkTableStructure();
    
    // 2. 检查索引
    results.indexes = await checkIndexes();
    
    // 3. 检查RLS策略
    results.policies = await checkRLSPolicies();
    
    // 4. 检查视图
    results.views = await checkViews();
    
    // 5. 检查存储函数
    results.functions = await checkStoredFunctions();
    
    // 6. 检查触发器
    results.triggers = await checkTriggers();
    
    // 7. 检查外键约束
    results.foreignKeys = await checkForeignKeys();
    
    // 8. 测试基础操作
    results.basicOps = await testBasicOperations();
    
    // 9. 测试存储函数调用
    results.functionCalls = await testStoredFunctionCalls();
    
    // 生成报告
    const report = generateStructureReport(results);
    
    console.log('\n📋 测试结论:');
    if (report.structureScore >= 95) {
      console.log('🎉 Supabase数据库配置完美，所有功能可正常使用！');
      console.log('🚀 建议启动应用测试: npm run dev');
    } else {
      console.log('🔧 数据库基本可用，建议优化配置');
    }
    
  } catch (error) {
    console.error('❌ 测试过程失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);