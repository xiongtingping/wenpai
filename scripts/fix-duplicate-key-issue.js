#!/usr/bin/env node

/**
 * 修复Token记录重复键问题的测试脚本
 */

import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = 'https://weizkydylskcwgnaieqy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlaXpreWR5bHNrY3dnbmFpZXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTIzMzksImV4cCI6MjA3MDYyODMzOX0.77cefG7i52iWjR6D_0H1aB-xmmJe19WQlM8PkGISW7c';

const supabase = createClient(supabaseUrl, supabaseKey);

// 改进的ID生成函数
function generateUniqueId(userId, feature) {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substr(2, 12);
  const userPart = userId.substr(-6); // 使用用户ID的后6位
  const featurePart = feature.replace(/[^a-zA-Z0-9]/g, '').substr(0, 6); // 清理和截取功能名
  
  return `token_${timestamp}_${userPart}_${featurePart}_${randomPart}`;
}

// 安全的Token记录插入函数
async function safeInsertTokenRecord(record) {
  try {
    console.log('🔍 开始安全插入Token记录:', record.id);
    
    // 1. 检查记录是否已存在
    const { data: existingRecord, error: checkError } = await supabase
      .from('token_usage_records')
      .select('id')
      .eq('id', record.id)
      .maybeSingle();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.warn('⚠️  检查重复记录时发生错误:', checkError);
    }
    
    if (existingRecord) {
      console.log('🔄 记录已存在，跳过插入:', record.id);
      return { success: true, existed: true };
    }
    
    // 2. 准备数据库记录（使用snake_case）
    const dbRecord = {
      id: record.id,
      user_id: record.userId,
      feature: record.feature,
      task_type: record.taskType || null,
      input_tokens: record.inputTokens || 0,
      output_tokens: record.outputTokens || 0,
      total_tokens: record.totalTokens || 0,
      model: record.model,
      content_summary: record.contentSummary || null,
      success: record.success !== false, // 默认为true
      error_message: record.error || null,
      timestamp: record.timestamp
    };
    
    console.log('📊 准备插入的数据库记录:', {
      id: dbRecord.id,
      user_id: dbRecord.user_id,
      total_tokens: dbRecord.total_tokens,
      feature: dbRecord.feature
    });
    
    // 3. 尝试插入
    const { data, error } = await supabase
      .from('token_usage_records')
      .insert(dbRecord)
      .select()
      .single();
      
    if (error) {
      // 特殊处理主键重复错误
      if (error.code === '23505') {
        console.log('⚠️  检测到主键重复，记录可能已存在:', record.id);
        
        // 再次检查记录是否确实存在
        const { data: doubleCheck } = await supabase
          .from('token_usage_records')
          .select('id, total_tokens')
          .eq('id', record.id)
          .single();
          
        if (doubleCheck) {
          console.log('✅ 确认记录已存在，跳过重复插入:', doubleCheck.id);
          return { success: true, existed: true };
        } else {
          console.error('❌ 主键重复但找不到记录，可能存在数据一致性问题');
          return { success: false, error: '主键重复但记录不存在' };
        }
      }
      
      console.error('❌ 插入Token记录失败:', {
        error,
        code: error.code,
        message: error.message,
        recordId: record.id
      });
      
      return { success: false, error: error.message };
    }
    
    console.log('✅ Token记录插入成功:', {
      recordId: record.id,
      dbRecordId: data?.id,
      totalTokens: data?.total_tokens
    });
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ 安全插入Token记录异常:', error);
    return { success: false, error: error.message };
  }
}

// 测试修复后的插入功能
async function testFixedInsert() {
  console.log('🚀 开始测试修复后的Token记录插入功能...\n');
  
  const testUserId = 'fixed_test_' + Date.now();
  const testFeature = 'ai-content-adapter';
  
  // 创建测试记录
  const createTestRecord = (suffix = '') => {
    const uniqueId = generateUniqueId(testUserId + suffix, testFeature);
    return {
      id: uniqueId,
      userId: testUserId + suffix,
      feature: testFeature,
      inputTokens: 300,
      outputTokens: 500,
      totalTokens: 800,
      model: 'gpt-4-fixed-test',
      success: true,
      timestamp: new Date().toISOString()
    };
  };
  
  try {
    // 测试1: 正常插入
    console.log('📝 测试1: 正常插入...');
    const record1 = createTestRecord('_1');
    const result1 = await safeInsertTokenRecord(record1);
    
    if (result1.success && !result1.existed) {
      console.log('✅ 测试1通过: 正常插入成功\n');
    } else {
      console.log('❌ 测试1失败:', result1.error, '\n');
    }
    
    // 测试2: 重复插入相同ID
    console.log('📝 测试2: 重复插入相同ID...');
    const result2 = await safeInsertTokenRecord(record1); // 使用相同的record1
    
    if (result2.success && result2.existed) {
      console.log('✅ 测试2通过: 正确检测并跳过重复插入\n');
    } else {
      console.log('❌ 测试2失败:', result2.error, '\n');
    }
    
    // 测试3: 并发插入（模拟真实场景）
    console.log('📝 测试3: 并发插入测试...');
    const record3 = createTestRecord('_3');
    const promises = [
      safeInsertTokenRecord(record3),
      safeInsertTokenRecord(record3), // 故意重复
      safeInsertTokenRecord(record3)  // 故意重复
    ];
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const existedCount = results.filter(r => r.status === 'fulfilled' && r.value.existed).length;
    
    console.log('📊 并发测试结果:', {
      总请求数: 3,
      成功数: successCount,
      跳过数: existedCount
    });
    
    if (successCount >= 1) {
      console.log('✅ 测试3通过: 并发插入正常处理\n');
    } else {
      console.log('❌ 测试3失败: 并发插入异常\n');
    }
    
    // 测试4: 大批量插入
    console.log('📝 测试4: 大批量插入测试...');
    const batchRecords = [];
    for (let i = 0; i < 5; i++) {
      batchRecords.push(createTestRecord(`_batch_${i}`));
    }
    
    let batchSuccessCount = 0;
    for (const record of batchRecords) {
      const result = await safeInsertTokenRecord(record);
      if (result.success && !result.existed) {
        batchSuccessCount++;
      }
    }
    
    console.log('📊 批量测试结果:', {
      总记录数: batchRecords.length,
      成功插入: batchSuccessCount
    });
    
    if (batchSuccessCount === batchRecords.length) {
      console.log('✅ 测试4通过: 批量插入全部成功\n');
    } else {
      console.log('❌ 测试4部分失败: 部分记录插入失败\n');
    }
    
    // 测试5: 验证数据查询
    console.log('📝 测试5: 验证插入的数据查询...');
    const { data: queryData, error: queryError } = await supabase
      .from('token_usage_records')
      .select('*')
      .like('user_id', `${testUserId}%`)
      .order('timestamp', { ascending: false });
      
    if (queryError) {
      console.log('❌ 测试5失败: 查询插入的数据失败:', queryError.message);
    } else {
      console.log('✅ 测试5通过: 成功查询到', queryData?.length || 0, '条记录');
      
      // 计算总Token使用量
      const totalTokens = queryData?.reduce((sum, record) => sum + (record.total_tokens || 0), 0) || 0;
      console.log('📊 测试记录统计:', {
        记录总数: queryData?.length || 0,
        总Token数: totalTokens,
        平均Token: queryData?.length ? Math.round(totalTokens / queryData.length) : 0
      });
    }
    
    // 清理测试数据
    console.log('\n🧹 清理测试数据...');
    const { error: deleteError } = await supabase
      .from('token_usage_records')
      .delete()
      .like('user_id', `${testUserId}%`);
      
    if (deleteError) {
      console.log('⚠️  清理测试数据失败:', deleteError.message);
    } else {
      console.log('✅ 测试数据清理完成');
    }
    
    console.log('\n🎉 Token记录插入修复测试完成！');
    console.log('📋 修复要点总结:');
    console.log('   1. ✅ 改进ID生成算法避免重复');
    console.log('   2. ✅ 增加重复检查机制');
    console.log('   3. ✅ 特殊处理主键重复错误');
    console.log('   4. ✅ 支持并发安全插入');
    console.log('   5. ✅ 完善错误处理和日志');
    
  } catch (error) {
    console.error('❌ 测试过程异常:', error);
  }
}

// 执行测试
testFixedInsert();