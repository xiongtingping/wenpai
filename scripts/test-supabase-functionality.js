#!/usr/bin/env node
/**
 * 🧪 Supabase功能性测试脚本
 * 测试所有表格的实际业务功能
 */

import { createClient } from '@supabase/supabase-js';

// Supabase配置
const SUPABASE_URL = 'https://weizkydylskcwgnaieqy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MjMzOSwiZXhwIjoyMDcwNjI4MzM5fQ.l5BvkhJttv0agpydb5lktK1Q4KvDaxQTNUb5-GMU14w';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let testUserId = null;

/**
 * 创建真实测试用户
 */
async function createTestUser() {
  try {
    console.log('🔧 创建真实测试用户...');
    
    const timestamp = Date.now();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `test-user-${timestamp}@wenpai.test`,
      password: 'TestPassword123!',
      email_confirm: true
    });
    
    if (authError) throw authError;
    
    testUserId = authData.user.id;
    console.log(`✅ 测试用户创建成功: ${testUserId}`);
    
    return testUserId;
  } catch (error) {
    throw new Error(`创建测试用户失败: ${error.message}`);
  }
}

/**
 * 测试所有表格的完整功能
 */
async function testAllTableFunctionality() {
  const results = {};
  
  console.log('\n🧪 开始测试所有表格功能...');
  
  // 1. 测试用户档案表
  console.log('\n👤 测试 user_profiles');
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        nickname: '测试用户',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: '全面测试用户',
        preferences: { theme: 'dark', language: 'zh-CN' },
        settings: { notifications: true, newsletter: false }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_profiles = { success: true, id: profile.id };
    console.log(`  ✅ 创建成功 - ID: ${profile.id}`);
    
    // 测试更新
    const { data: updated, error: updateError } = await supabase
      .from('user_profiles')
      .update({ nickname: '更新的测试用户' })
      .eq('id', profile.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    console.log(`  ✅ 更新成功 - 新昵称: ${updated.nickname}`);
    
  } catch (error) {
    results.user_profiles = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 2. 测试订阅表
  console.log('\n💳 测试 user_subscriptions');
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: testUserId,
        tier: 'pro',
        monthly_token_limit: 500000,
        usage_count_limit: 100,
        payment_status: 'paid'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_subscriptions = { success: true, id: subscription.id };
    console.log(`  ✅ 创建成功 - 订阅等级: ${subscription.tier}`);
    
  } catch (error) {
    results.user_subscriptions = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 3. 测试Token使用记录表
  console.log('\n🎯 测试 token_usage_records');
  try {
    const records = [];
    for (let i = 0; i < 3; i++) {
      const { data: tokenRecord, error } = await supabase
        .from('token_usage_records')
        .insert({
          id: `test_${testUserId}_${Date.now()}_${i}`,
          user_id: testUserId,
          feature: ['content_generation', 'title_generation', 'brand_analysis'][i],
          task_type: 'test_task',
          input_tokens: 100 + i * 50,
          output_tokens: 200 + i * 100,
          total_tokens: 300 + i * 150,
          model: 'gpt-4o',
          content_summary: `测试内容 ${i + 1}`,
          success: true
        })
        .select()
        .single();
      
      if (error) throw error;
      records.push(tokenRecord);
    }
    
    results.token_usage_records = { success: true, count: records.length };
    console.log(`  ✅ 创建成功 - ${records.length} 条记录`);
    
  } catch (error) {
    results.token_usage_records = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 4. 测试使用次数记录表
  console.log('\n📊 测试 usage_count_records');
  try {
    const counts = [];
    for (let i = 0; i < 3; i++) {
      const { data: countRecord, error } = await supabase
        .from('usage_count_records')
        .insert({
          user_id: testUserId,
          feature: ['emoji_generation', 'hot_topics', 'brand_library'][i],
          amount: i + 1
        })
        .select()
        .single();
      
      if (error) throw error;
      counts.push(countRecord);
    }
    
    results.usage_count_records = { success: true, count: counts.length };
    console.log(`  ✅ 创建成功 - ${counts.length} 条记录`);
    
  } catch (error) {
    results.usage_count_records = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 5. 测试邀请统计表
  console.log('\n👥 测试 user_invite_stats');
  try {
    const { data: inviteStats, error } = await supabase
      .from('user_invite_stats')
      .insert({
        user_id: testUserId,
        total_invites: 5,
        successful_invites: 3,
        link_clicks: 12,
        rewards_issued: 3,
        total_reward_count: 150,
        conversion_rate: 60.00
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_invite_stats = { success: true, id: inviteStats.id };
    console.log(`  ✅ 创建成功 - 邀请成功率: ${inviteStats.conversion_rate}%`);
    
  } catch (error) {
    results.user_invite_stats = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 6. 测试用户文件表
  console.log('\n📁 测试 user_files');
  try {
    const { data: file, error } = await supabase
      .from('user_files')
      .insert({
        user_id: testUserId,
        filename: 'test-document.pdf',
        file_path: '/uploads/test-document.pdf',
        file_size: 1024000,
        mime_type: 'application/pdf',
        file_type: 'document',
        metadata: { uploaded_via: 'web', processed: true }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_files = { success: true, id: file.id };
    console.log(`  ✅ 创建成功 - 文件: ${file.filename} (${file.file_size} bytes)`);
    
  } catch (error) {
    results.user_files = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 7. 测试用户笔记表
  console.log('\n📝 测试 user_notes');
  try {
    const { data: note, error } = await supabase
      .from('user_notes')
      .insert({
        user_id: testUserId,
        title: '测试笔记标题',
        content: '这是一个详细的测试笔记内容，包含多种信息。',
        category: 'testing',
        tags: ['测试', '笔记', 'supabase'],
        is_private: true,
        metadata: { editor: 'rich_text', version: '1.0' }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_notes = { success: true, id: note.id };
    console.log(`  ✅ 创建成功 - 笔记: ${note.title}`);
    
  } catch (error) {
    results.user_notes = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 8. 测试品牌语料库表
  console.log('\n🎨 测试 user_brand_corpus');
  try {
    const { data: brand, error } = await supabase
      .from('user_brand_corpus')
      .insert({
        user_id: testUserId,
        brand_name: '测试科技公司',
        brand_description: '一家专注于人工智能技术的创新公司',
        tone_keywords: ['专业', '创新', '友好', '可信赖'],
        style_guide: '使用简洁明了的语言，避免过度技术化的术语',
        content_samples: [
          '我们致力于为用户提供最优质的AI服务',
          '创新技术，改变未来',
          '让AI成为每个人的助手'
        ],
        metadata: { industry: 'technology', target_audience: 'business' }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_brand_corpus = { success: true, id: brand.id };
    console.log(`  ✅ 创建成功 - 品牌: ${brand.brand_name}`);
    
  } catch (error) {
    results.user_brand_corpus = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 9. 测试收藏夹表
  console.log('\n🔖 测试 user_library_items');
  try {
    const { data: library, error } = await supabase
      .from('user_library_items')
      .insert({
        user_id: testUserId,
        title: 'AI技术趋势报告2025',
        url: 'https://example.com/ai-trends-2025',
        content: '这是一篇关于2025年AI技术发展趋势的深度分析文章...',
        category: 'research',
        tags: ['AI', '趋势', '2025', '技术'],
        status: 'active',
        metadata: { source: 'web', read_time: 10, importance: 'high' }
      })
      .select()
      .single();
    
    if (error) throw error;
    
    results.user_library_items = { success: true, id: library.id };
    console.log(`  ✅ 创建成功 - 收藏: ${library.title}`);
    
  } catch (error) {
    results.user_library_items = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  // 10. 测试聊天历史表
  console.log('\n💬 测试 user_chat_history');
  try {
    const chatMessages = [
      { role: 'user', content: '你好，我想测试聊天功能' },
      { role: 'assistant', content: '您好！我是文派AI助手，很高兴为您服务。' },
      { role: 'user', content: '请帮我生成一篇关于AI的文章' }
    ];
    
    const sessionId = `session_${Date.now()}`;
    const insertedMessages = [];
    
    for (const [index, message] of chatMessages.entries()) {
      const { data: chatRecord, error } = await supabase
        .from('user_chat_history')
        .insert({
          user_id: testUserId,
          session_id: sessionId,
          role: message.role,
          content: message.content,
          model: message.role === 'assistant' ? 'gpt-4o' : null,
          tokens_used: message.role === 'assistant' ? 150 + index * 50 : 20 + index * 10,
          metadata: { message_index: index, platform: 'web' }
        })
        .select()
        .single();
      
      if (error) throw error;
      insertedMessages.push(chatRecord);
    }
    
    results.user_chat_history = { success: true, count: insertedMessages.length };
    console.log(`  ✅ 创建成功 - ${insertedMessages.length} 条聊天记录`);
    
  } catch (error) {
    results.user_chat_history = { success: false, error: error.message };
    console.log(`  ❌ 失败: ${error.message}`);
  }
  
  return results;
}

/**
 * 测试统计视图和函数
 */
async function testStatisticsAndFunctions() {
  console.log('\n📊 测试统计功能');
  const results = {};
  
  // 测试月度Token使用统计
  try {
    const { data, error } = await supabase
      .rpc('get_user_monthly_token_usage', { p_user_id: testUserId });
    
    if (error) throw error;
    
    results.monthly_token_usage = { success: true, data: data[0] };
    console.log(`  ✅ 月度Token统计: ${data[0].total_tokens} tokens, ${data[0].request_count} 次请求`);
    
  } catch (error) {
    results.monthly_token_usage = { success: false, error: error.message };
    console.log(`  ❌ 月度Token统计失败: ${error.message}`);
  }
  
  // 测试Token限额检查
  try {
    const { data, error } = await supabase
      .rpc('check_user_token_limit', { 
        p_user_id: testUserId,
        p_estimated_tokens: 1000
      });
    
    if (error) throw error;
    
    results.token_limit_check = { success: true, data: data[0] };
    console.log(`  ✅ Token限额检查: ${data[0].monthly_used}/${data[0].monthly_limit} (${data[0].usage_percentage}%)`);
    
  } catch (error) {
    results.token_limit_check = { success: false, error: error.message };
    console.log(`  ❌ Token限额检查失败: ${error.message}`);
  }
  
  // 测试使用次数统计
  try {
    const { data, error } = await supabase
      .rpc('get_user_usage_count', { p_user_id: testUserId });
    
    if (error) throw error;
    
    results.usage_count = { success: true, data: data[0] };
    console.log(`  ✅ 使用次数统计: 总计${data[0].total_used}次, 本月${data[0].monthly_used}次, 今日${data[0].daily_used}次`);
    
  } catch (error) {
    results.usage_count = { success: false, error: error.message };
    console.log(`  ❌ 使用次数统计失败: ${error.message}`);
  }
  
  return results;
}

/**
 * 测试数据查询和关联
 */
async function testDataQueries() {
  console.log('\n🔍 测试数据查询功能');
  const results = {};
  
  // 测试用户完整信息查询
  try {
    const { data: userInfo, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_subscriptions(*)
      `)
      .eq('user_id', testUserId)
      .single();
    
    if (error) throw error;
    
    results.user_complete_info = { success: true };
    console.log(`  ✅ 用户完整信息查询成功`);
    console.log(`    用户: ${userInfo.nickname}`);
    console.log(`    订阅: ${userInfo.user_subscriptions?.[0]?.tier || '无'}`);
    
  } catch (error) {
    results.user_complete_info = { success: false, error: error.message };
    console.log(`  ❌ 用户完整信息查询失败: ${error.message}`);
  }
  
  // 测试Token使用记录查询
  try {
    const { data: tokenRecords, error } = await supabase
      .from('token_usage_records')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    results.token_records_query = { success: true, count: tokenRecords.length };
    console.log(`  ✅ Token记录查询成功 - ${tokenRecords.length} 条记录`);
    
    if (tokenRecords.length > 0) {
      const totalTokens = tokenRecords.reduce((sum, record) => sum + record.total_tokens, 0);
      console.log(`    总Token使用量: ${totalTokens}`);
    }
    
  } catch (error) {
    results.token_records_query = { success: false, error: error.message };
    console.log(`  ❌ Token记录查询失败: ${error.message}`);
  }
  
  return results;
}

/**
 * 清理测试数据
 */
async function cleanupTestData() {
  console.log('\n🧹 清理测试数据');
  
  if (!testUserId) {
    console.log('  ℹ️ 没有测试用户需要清理');
    return;
  }
  
  try {
    // 删除测试用户（会级联删除所有相关数据）
    const { error } = await supabase.auth.admin.deleteUser(testUserId);
    
    if (error) throw error;
    
    console.log(`  ✅ 测试用户及所有数据清理成功`);
    
  } catch (error) {
    console.log(`  ⚠️ 清理测试数据失败: ${error.message}`);
  }
}

/**
 * 生成最终报告
 */
function generateFinalReport(tableResults, statsResults, queryResults) {
  console.log('\n📊 === 最终测试报告 ===');
  
  const allResults = { ...tableResults, ...statsResults, ...queryResults };
  const totalTests = Object.keys(allResults).length;
  const passedTests = Object.values(allResults).filter(r => r.success).length;
  
  console.log(`\n🎯 功能测试结果: ${passedTests}/${totalTests} 项通过 (${Math.round(passedTests/totalTests*100)}%)`);
  
  console.log('\n📋 详细结果:');
  Object.entries(allResults).forEach(([testName, result]) => {
    const status = result.success ? '✅' : '❌';
    const details = result.count ? ` (${result.count}条)` : result.error ? ` - ${result.error}` : '';
    console.log(`  ${status} ${testName}${details}`);
  });
  
  console.log('\n🎉 测试结论:');
  if (passedTests === totalTests) {
    console.log('🚀 所有表格功能完美！数据库可完全投入使用！');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ 主要功能正常，数据库可以使用');
  } else {
    console.log('⚠️ 部分功能存在问题，建议检查配置');
  }
  
  return { totalTests, passedTests, successRate: passedTests/totalTests };
}

/**
 * 主执行函数
 */
async function main() {
  try {
    console.log('🚀 开始Supabase数据库功能性全面测试...');
    console.log(`📡 连接到: ${SUPABASE_URL}`);
    
    // 1. 创建测试用户
    await createTestUser();
    
    // 2. 测试所有表格功能
    const tableResults = await testAllTableFunctionality();
    
    // 3. 测试统计功能
    const statsResults = await testStatisticsAndFunctions();
    
    // 4. 测试数据查询
    const queryResults = await testDataQueries();
    
    // 5. 生成报告
    const report = generateFinalReport(tableResults, statsResults, queryResults);
    
    // 6. 清理测试数据
    await cleanupTestData();
    
    console.log('\n📋 后续建议:');
    if (report.successRate >= 0.9) {
      console.log('🚀 数据库配置完美，建议启动应用: npm run dev');
      console.log('🔗 可以开始使用所有AI功能和用户系统');
    } else {
      console.log('🔧 数据库基本可用，某些高级功能可能受限');
    }
    
  } catch (error) {
    console.error('❌ 测试过程失败:', error);
    
    // 确保清理
    if (testUserId) {
      try {
        await supabase.auth.admin.deleteUser(testUserId);
        console.log('🧹 紧急清理测试用户成功');
      } catch (cleanupError) {
        console.log('⚠️ 紧急清理失败，可能需要手动清理');
      }
    }
    
    process.exit(1);
  }
}

// 运行主函数
main().catch(console.error);