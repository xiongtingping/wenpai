#!/usr/bin/env node
/**
 * 🧪 Supabase数据库全面测试脚本
 * 测试所有表格的CRUD操作、RLS策略、统计视图和存储函数
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Supabase配置
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://weizkydylskcwgnaieqy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w';

// 创建Supabase客户端（使用service role进行全面测试）
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 测试用的模拟用户ID
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

/**
 * 工具函数：生成测试数据
 */
function generateTestData() {
  const now = new Date().toISOString();
  return {
    userId: TEST_USER_ID,
    timestamp: now,
    testId: randomUUID()
  };
}

/**
 * 测试表格基础CRUD操作
 */
async function testTableCRUD(tableName, testData, idField = 'id') {
  const results = {
    create: false,
    read: false,
    update: false,
    delete: false,
    error: null
  };

  try {
    console.log(`\n🧪 测试表格: ${tableName}`);
    
    // 1. 测试创建 (CREATE)
    try {
      const { data: createData, error: createError } = await supabase
        .from(tableName)
        .insert(testData)
        .select()
        .single();
      
      if (createError) throw createError;
      
      console.log(`  ✅ CREATE: 成功创建记录 ${createData[idField]}`);
      results.create = true;
      
      const recordId = createData[idField];
      
      // 2. 测试读取 (READ)
      try {
        const { data: readData, error: readError } = await supabase
          .from(tableName)
          .select('*')
          .eq(idField, recordId)
          .single();
        
        if (readError) throw readError;
        
        console.log(`  ✅ READ: 成功读取记录`);
        results.read = true;
        
        // 3. 测试更新 (UPDATE)
        try {
          const updateData = { updated_at: new Date().toISOString() };
          const { data: updatedData, error: updateError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq(idField, recordId)
            .select()
            .single();
          
          if (updateError) throw updateError;
          
          console.log(`  ✅ UPDATE: 成功更新记录`);
          results.update = true;
          
        } catch (updateErr) {
          console.log(`  ❌ UPDATE: ${updateErr.message}`);
        }
        
        // 4. 测试删除 (DELETE)
        try {
          const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq(idField, recordId);
          
          if (deleteError) throw deleteError;
          
          console.log(`  ✅ DELETE: 成功删除记录`);
          results.delete = true;
          
        } catch (deleteErr) {
          console.log(`  ❌ DELETE: ${deleteErr.message}`);
        }
        
      } catch (readErr) {
        console.log(`  ❌ READ: ${readErr.message}`);
      }
      
    } catch (createErr) {
      console.log(`  ❌ CREATE: ${createErr.message}`);
      results.error = createErr.message;
    }
    
  } catch (error) {
    console.log(`  ❌ 表格测试失败: ${error.message}`);
    results.error = error.message;
  }
  
  return results;
}

/**
 * 测试用户基础表格
 */
async function testUserBaseTables() {
  console.log('\n📋 1. 测试用户基础表格');
  
  const testData = generateTestData();
  
  // 测试 user_profiles
  const profileResults = await testTableCRUD('user_profiles', {
    user_id: TEST_USER_ID,
    nickname: '测试用户',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: '这是一个测试用户',
    preferences: { theme: 'dark' },
    settings: { notifications: true }
  });
  
  // 测试 user_subscriptions  
  const subscriptionResults = await testTableCRUD('user_subscriptions', {
    user_id: TEST_USER_ID,
    tier: 'pro',
    monthly_token_limit: 500000,
    usage_count_limit: 50,
    payment_status: 'paid'
  });
  
  return { profileResults, subscriptionResults };
}

/**
 * 测试Token使用相关表格
 */
async function testTokenUsageTables() {
  console.log('\n🎯 2. 测试Token使用相关表格');
  
  // 测试 token_usage_records
  const tokenResults = await testTableCRUD('token_usage_records', {
    id: `test_${Date.now()}`,
    user_id: TEST_USER_ID,
    feature: 'content_generation',
    task_type: 'article_writing',
    input_tokens: 100,
    output_tokens: 300,
    total_tokens: 400,
    model: 'gpt-4o',
    content_summary: '测试文章生成',
    success: true
  }, 'id');
  
  // 测试 usage_count_records
  const countResults = await testTableCRUD('usage_count_records', {
    user_id: TEST_USER_ID,
    feature: 'title_generation',
    amount: 1
  });
  
  return { tokenResults, countResults };
}

/**
 * 测试邀请系统表格
 */
async function testInviteTables() {
  console.log('\n👥 3. 测试邀请系统表格');
  
  const inviteeId = '550e8400-e29b-41d4-a716-446655440001';
  
  // 测试 user_invite_relations
  const relationsResults = await testTableCRUD('user_invite_relations', {
    inviter_id: TEST_USER_ID,
    invitee_id: inviteeId,
    invite_code: 'TEST123',
    status: 'pending',
    source: 'link',
    metadata: { campaign: 'test' }
  });
  
  // 测试 user_invite_stats
  const statsResults = await testTableCRUD('user_invite_stats', {
    user_id: TEST_USER_ID,
    total_invites: 5,
    successful_invites: 3,
    link_clicks: 10,
    rewards_issued: 3,
    total_reward_count: 150
  });
  
  // 测试 user_invite_events
  const eventsResults = await testTableCRUD('user_invite_events', {
    user_id: TEST_USER_ID,
    event_type: 'link_click',
    inviter_id: TEST_USER_ID,
    invitee_id: inviteeId,
    metadata: { ip: '127.0.0.1' }
  });
  
  return { relationsResults, statsResults, eventsResults };
}

/**
 * 测试用户内容表格
 */
async function testContentTables() {
  console.log('\n📄 4. 测试用户内容表格');
  
  // 测试 user_files
  const filesResults = await testTableCRUD('user_files', {
    user_id: TEST_USER_ID,
    filename: 'test-document.pdf',
    file_path: '/uploads/test-document.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    file_type: 'document',
    metadata: { uploaded_via: 'web' }
  });
  
  // 测试 user_notes
  const notesResults = await testTableCRUD('user_notes', {
    user_id: TEST_USER_ID,
    title: '测试笔记',
    content: '这是一个测试笔记的内容',
    category: 'work',
    tags: ['测试', '笔记'],
    is_private: true,
    metadata: { editor: 'rich_text' }
  });
  
  // 测试 user_brand_corpus
  const brandResults = await testTableCRUD('user_brand_corpus', {
    user_id: TEST_USER_ID,
    brand_name: '测试品牌',
    brand_description: '一个用于测试的品牌',
    tone_keywords: ['专业', '友好', '创新'],
    style_guide: '使用简洁明了的语言风格',
    content_samples: ['示例内容1', '示例内容2'],
    metadata: { industry: 'tech' }
  });
  
  // 测试 user_library_items
  const libraryResults = await testTableCRUD('user_library_items', {
    user_id: TEST_USER_ID,
    title: '测试收藏项目',
    url: 'https://example.com/article',
    content: '这是收藏的文章内容摘要',
    category: 'technology',
    tags: ['AI', '技术'],
    status: 'active',
    metadata: { source: 'web' }
  });
  
  // 测试 user_chat_history
  const chatResults = await testTableCRUD('user_chat_history', {
    user_id: TEST_USER_ID,
    session_id: 'test_session_001',
    role: 'user',
    content: '你好，这是一个测试消息',
    model: 'gpt-4o',
    tokens_used: 20,
    metadata: { platform: 'web' }
  });
  
  return { filesResults, notesResults, brandResults, libraryResults, chatResults };
}

/**
 * 测试统计视图
 */
async function testStatisticsViews() {
  console.log('\n📊 5. 测试统计视图');
  
  const viewResults = {};
  
  // 测试月度Token使用统计视图
  try {
    const { data, error } = await supabase
      .from('monthly_token_usage')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    viewResults.monthly_token_usage = { success: true, count: data?.length || 0 };
    console.log(`  ✅ monthly_token_usage: 查询成功 (${data?.length || 0} 条记录)`);
  } catch (error) {
    viewResults.monthly_token_usage = { success: false, error: error.message };
    console.log(`  ❌ monthly_token_usage: ${error.message}`);
  }
  
  // 测试日度Token使用统计视图
  try {
    const { data, error } = await supabase
      .from('daily_token_usage')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    viewResults.daily_token_usage = { success: true, count: data?.length || 0 };
    console.log(`  ✅ daily_token_usage: 查询成功 (${data?.length || 0} 条记录)`);
  } catch (error) {
    viewResults.daily_token_usage = { success: false, error: error.message };
    console.log(`  ❌ daily_token_usage: ${error.message}`);
  }
  
  // 测试功能使用统计视图
  try {
    const { data, error } = await supabase
      .from('feature_usage_stats')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    viewResults.feature_usage_stats = { success: true, count: data?.length || 0 };
    console.log(`  ✅ feature_usage_stats: 查询成功 (${data?.length || 0} 条记录)`);
  } catch (error) {
    viewResults.feature_usage_stats = { success: false, error: error.message };
    console.log(`  ❌ feature_usage_stats: ${error.message}`);
  }
  
  return viewResults;
}

/**
 * 测试存储函数
 */
async function testStoredFunctions() {
  console.log('\n⚙️ 6. 测试存储函数');
  
  const functionResults = {};
  
  // 测试 get_user_monthly_token_usage 函数
  try {
    const { data, error } = await supabase
      .rpc('get_user_monthly_token_usage', { 
        p_user_id: TEST_USER_ID 
      });
    
    if (error) throw error;
    functionResults.get_user_monthly_token_usage = { success: true, data };
    console.log(`  ✅ get_user_monthly_token_usage: 执行成功`);
    console.log(`     结果: ${JSON.stringify(data)}`);
  } catch (error) {
    functionResults.get_user_monthly_token_usage = { success: false, error: error.message };
    console.log(`  ❌ get_user_monthly_token_usage: ${error.message}`);
  }
  
  // 测试 check_user_token_limit 函数
  try {
    const { data, error } = await supabase
      .rpc('check_user_token_limit', { 
        p_user_id: TEST_USER_ID,
        p_estimated_tokens: 1000
      });
    
    if (error) throw error;
    functionResults.check_user_token_limit = { success: true, data };
    console.log(`  ✅ check_user_token_limit: 执行成功`);
    console.log(`     结果: ${JSON.stringify(data)}`);
  } catch (error) {
    functionResults.check_user_token_limit = { success: false, error: error.message };
    console.log(`  ❌ check_user_token_limit: ${error.message}`);
  }
  
  // 测试 get_user_usage_count 函数
  try {
    const { data, error } = await supabase
      .rpc('get_user_usage_count', { 
        p_user_id: TEST_USER_ID 
      });
    
    if (error) throw error;
    functionResults.get_user_usage_count = { success: true, data };
    console.log(`  ✅ get_user_usage_count: 执行成功`);
    console.log(`     结果: ${JSON.stringify(data)}`);
  } catch (error) {
    functionResults.get_user_usage_count = { success: false, error: error.message };
    console.log(`  ❌ get_user_usage_count: ${error.message}`);
  }
  
  return functionResults;
}

/**
 * 测试RLS安全策略
 */
async function testRLSSecurity() {
  console.log('\n🔒 7. 测试RLS安全策略');
  
  // 创建一个普通用户客户端（非service role）
  const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTIzMzksImV4cCI6MjA3MDYyODMzOX0.77cefG7i52iWjR6D_0H1aB-xmmJe19WQlM8PkGISW7c';
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  const rlsResults = {};
  
  // 测试未认证用户访问（应该被拒绝）
  try {
    const { data, error } = await anonClient
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (error && error.message.includes('RLS')) {
      rlsResults.unauthenticated_access = { success: true, blocked: true };
      console.log(`  ✅ RLS策略: 未认证访问被正确阻止`);
    } else {
      rlsResults.unauthenticated_access = { success: false, blocked: false };
      console.log(`  ⚠️ RLS策略: 未认证访问未被阻止`);
    }
  } catch (error) {
    rlsResults.unauthenticated_access = { success: true, blocked: true };
    console.log(`  ✅ RLS策略: 访问被阻止 - ${error.message}`);
  }
  
  return rlsResults;
}

/**
 * 生成测试报告
 */
function generateTestReport(results) {
  console.log('\n📊 === 测试报告汇总 ===');
  
  let totalTests = 0;
  let passedTests = 0;
  
  Object.entries(results).forEach(([category, categoryResults]) => {
    console.log(`\n📝 ${category}:`);
    
    Object.entries(categoryResults).forEach(([testName, result]) => {
      totalTests++;
      
      if (typeof result === 'object' && result.create !== undefined) {
        // CRUD测试结果
        const crudPassed = Object.values(result).filter(v => v === true).length;
        const crudTotal = Object.keys(result).filter(k => k !== 'error').length;
        passedTests += crudPassed;
        totalTests += crudTotal - 1; // 减去重复计算
        
        console.log(`  ${testName}: ${crudPassed}/${crudTotal} 操作成功`);
        if (result.error) {
          console.log(`    错误: ${result.error}`);
        }
      } else if (typeof result === 'object' && result.success !== undefined) {
        // 其他测试结果
        if (result.success) passedTests++;
        console.log(`  ${testName}: ${result.success ? '✅ 成功' : '❌ 失败'}`);
        if (!result.success && result.error) {
          console.log(`    错误: ${result.error}`);
        }
      }
    });
  });
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 测试通过 (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！Supabase数据库配置完美！');
  } else {
    console.log('⚠️ 部分测试失败，请检查相关配置');
  }
  
  return { totalTests, passedTests, successRate: passedTests/totalTests };
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始Supabase数据库全面测试...');
    console.log(`📡 连接到: ${SUPABASE_URL}`);
    console.log(`🧪 测试用户ID: ${TEST_USER_ID}`);
    
    const results = {};
    
    // 1. 测试用户基础表格
    results.userBaseTables = await testUserBaseTables();
    
    // 2. 测试Token使用表格
    results.tokenUsageTables = await testTokenUsageTables();
    
    // 3. 测试邀请系统表格
    results.inviteTables = await testInviteTables();
    
    // 4. 测试用户内容表格
    results.contentTables = await testContentTables();
    
    // 5. 测试统计视图
    results.statisticsViews = await testStatisticsViews();
    
    // 6. 测试存储函数
    results.storedFunctions = await testStoredFunctions();
    
    // 7. 测试RLS安全策略
    results.rlsSecurity = await testRLSSecurity();
    
    // 生成测试报告
    const report = generateTestReport(results);
    
    console.log('\n📋 后续建议:');
    if (report.successRate === 1) {
      console.log('✅ 数据库配置完美，可以开始使用所有功能');
      console.log('🔗 建议测试应用功能: npm run dev');
    } else {
      console.log('🔧 建议检查失败的表格和功能');
      console.log('📖 参考: SUPABASE_SETUP_GUIDE.md');
    }
    
  } catch (error) {
    console.error('❌ 测试过程失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);