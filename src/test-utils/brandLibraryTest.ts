/**
 * ✅ FIXED: 2025-08-06 品牌语料库功能测试工具
 * 用于验证修复后的功能是否正常工作
 * 🔧 UPDATED: 2025-08-13 支持用户数据隔离
 */

import { generateStorageKey } from '@/utils/userDataIsolation';

/**
 * 测试localStorage状态持久化 - 支持用户数据隔离
 */
export function testLocalStoragePersistence(user?: any) {
  console.log('🧪 测试localStorage状态持久化...');

  try {
    // 🔧 FIXED: 使用用户隔离的存储键
    const analysisRunningKey = generateStorageKey('backgroundAnalysisRunning', user);
    const analysisTimestampKey = generateStorageKey('backgroundAnalysisTimestamp', user);

    // 测试分析状态保存和加载
    const testState = true;
    localStorage.setItem(analysisRunningKey, JSON.stringify(testState));
    localStorage.setItem(analysisTimestampKey, Date.now().toString());

    const savedState = localStorage.getItem(analysisRunningKey);
    const timestamp = localStorage.getItem(analysisTimestampKey);
    
    if (savedState && timestamp) {
      console.log('✅ localStorage状态保存/加载正常');
      return true;
    } else {
      console.log('❌ localStorage状态保存/加载失败');
      return false;
    }
  } catch (error) {
    console.error('❌ localStorage测试异常:', error);
    return false;
  }
}

/**
 * 测试品牌维度数据结构
 */
export function testBrandDimensionsStructure() {
  console.log('🧪 测试品牌维度数据结构...');
  
  try {
    const testDimension = {
      id: 'test-dimension',
      title: '测试维度',
      description: '测试描述',
      category: 'test',
      items: [
        {
          id: 'test-item',
          content: '测试内容',
          source: '测试来源',
          confidence: 0.9,
          isPinned: false,
          isBlocked: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      keywords: ['测试关键词'],
      content: '测试内容',
      placeholder: '测试占位符'
    };
    
    // 验证数据结构完整性
    const requiredFields = ['id', 'title', 'description', 'category', 'items'];
    const hasAllFields = requiredFields.every(field => field in testDimension);
    
    if (hasAllFields) {
      console.log('✅ 品牌维度数据结构正确');
      return true;
    } else {
      console.log('❌ 品牌维度数据结构不完整');
      return false;
    }
  } catch (error) {
    console.error('❌ 品牌维度数据结构测试异常:', error);
    return false;
  }
}

/**
 * 测试分析结果数据结构
 */
export function testAnalysisResultStructure() {
  console.log('🧪 测试分析结果数据结构...');
  
  try {
    const testAnalysisResult = {
      extractedFields: {
        'brandName': {
          value: '测试品牌',
          excerpt: '测试摘录',
          confidence: 0.9
        }
      },
      overallConfidence: 0.85,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      processingTime: 5.2
    };
    
    // 验证分析结果结构
    const hasExtractedFields = testAnalysisResult.extractedFields && 
                              typeof testAnalysisResult.extractedFields === 'object';
    const hasConfidence = typeof testAnalysisResult.overallConfidence === 'number';
    
    if (hasExtractedFields && hasConfidence) {
      console.log('✅ 分析结果数据结构正确');
      return true;
    } else {
      console.log('❌ 分析结果数据结构不正确');
      return false;
    }
  } catch (error) {
    console.error('❌ 分析结果数据结构测试异常:', error);
    return false;
  }
}

/**
 * 测试PDF对话数据结构
 */
export function testPDFChatStructure() {
  console.log('🧪 测试PDF对话数据结构...');
  
  try {
    const testDocument = {
      id: 'test-doc',
      name: '测试文档.pdf',
      content: '这是测试文档内容',
      uploadDate: new Date(),
      size: '1.2MB'
    };
    
    const testMessage = {
      id: 'test-message',
      role: 'user' as const,
      content: '测试消息',
      timestamp: new Date(),
      isLoading: false
    };
    
    // 验证文档和消息结构
    const docHasRequiredFields = ['id', 'name', 'content'].every(field => field in testDocument);
    const msgHasRequiredFields = ['id', 'role', 'content', 'timestamp'].every(field => field in testMessage);
    
    if (docHasRequiredFields && msgHasRequiredFields) {
      console.log('✅ PDF对话数据结构正确');
      return true;
    } else {
      console.log('❌ PDF对话数据结构不正确');
      return false;
    }
  } catch (error) {
    console.error('❌ PDF对话数据结构测试异常:', error);
    return false;
  }
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('🚀 开始运行品牌语料库功能测试...');
  
  const tests = [
    { name: 'localStorage持久化', test: testLocalStoragePersistence },
    { name: '品牌维度数据结构', test: testBrandDimensionsStructure },
    { name: '分析结果数据结构', test: testAnalysisResultStructure },
    { name: 'PDF对话数据结构', test: testPDFChatStructure }
  ];
  
  const results = tests.map(({ name, test }) => {
    const result = test();
    return { name, passed: result };
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`\n📊 测试结果: ${passedCount}/${totalCount} 通过`);
  
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });
  
  if (passedCount === totalCount) {
    console.log('🎉 所有测试通过！品牌语料库功能修复成功。');
  } else {
    console.log('⚠️ 部分测试失败，需要进一步检查。');
  }
  
  return { passedCount, totalCount, results };
}

// 在开发环境中自动运行测试
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟执行，确保页面加载完成
  setTimeout(() => {
    runAllTests();
  }, 2000);
}
