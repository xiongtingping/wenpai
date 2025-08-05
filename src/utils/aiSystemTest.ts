/**
 * AI系统测试工具 - 验证多维矩阵提示词系统
 * 
 * 用于测试和验证AI内容适配器的多维矩阵系统是否正常工作
 */

import { 
  callContentAdapter, 
  callMultiDimensionalMatrixGenerator,
  callContentQualityController,
  callMultiVersionContentGenerator,
  callTitleGenerator,
  callTitleQualityChecker
} from '@/api/aiService';

import { 
  getPrompt, 
  PromptType, 
  getAllPromptTemplates,
  getPromptSystemStats
} from '@/prompts/PromptSystem';

/**
 * 测试多维矩阵内容适配
 */
export async function testMultiDimensionalMatrix() {
  console.log('🧪 开始测试多维矩阵提示词系统...');
  
  const testContent = "文派是一个AI内容创作平台，帮助用户快速生成高质量的多平台内容。";
  
  try {
    // 测试基础内容适配
    console.log('📝 测试基础内容适配...');
    const basicResult = await callContentAdapter({
      originalContent: testContent,
      platform: 'xiaohongshu',
      style: 'casual',
      charCount: 200
    });
    
    console.log('✅ 基础适配结果:', basicResult.content.substring(0, 100) + '...');
    
    // 测试多维矩阵生成
    console.log('🎯 测试多维矩阵生成...');
    const matrixResult = await callMultiDimensionalMatrixGenerator({
      originalContent: testContent,
      platform: 'xiaohongshu',
      dimensions: {
        brand: {
          content: '文派专注于AI内容创作，提供专业、高效的解决方案',
          tone: '专业友好',
          keywords: ['AI', '内容创作', '高效', '专业'],
          style: '现代简约',
          values: ['创新', '效率', '品质']
        },
        contentForm: 'image-text-planting',
        expressionStyle: 'casual',
        customRequirements: '突出平台适配能力',
        charCount: 150
      }
    });
    
    console.log('✅ 多维矩阵结果:', matrixResult.content.substring(0, 100) + '...');
    
    // 测试质量控制
    console.log('📊 测试质量控制...');
    const qualityResult = await callContentQualityController({
      generatedContent: matrixResult.content,
      originalContent: testContent,
      platform: 'xiaohongshu',
      charLimit: 150,
      requirements: ['AI', '内容创作']
    });
    
    console.log('✅ 质量控制结果:', {
      isQualified: qualityResult.isQualified,
      issues: qualityResult.issues,
      charCount: qualityResult.charCount
    });
    
    return {
      success: true,
      results: {
        basic: basicResult,
        matrix: matrixResult,
        quality: qualityResult
      }
    };
    
  } catch (error) {
    console.error('❌ 多维矩阵测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 测试V3版本标题生成
 */
export async function testV3TitleGeneration() {
  console.log('🧪 开始测试V3版本标题生成系统...');
  
  const testContent = "文派AI内容创作平台，支持小红书、抖音、微信公众号等多平台内容适配，一键生成高质量内容，提升创作效率。";
  
  try {
    // 测试V3标题生成
    console.log('📝 测试V3标题生成...');
    const titleResult = await callTitleGenerator({
      content: testContent,
      platform: 'xiaohongshu',
      stylePreference: 'mixed',
      outputCount: 3
    });
    
    console.log('✅ V3标题生成结果:', titleResult.content.substring(0, 200) + '...');
    
    // 测试标题质量评估
    console.log('📊 测试标题质量评估...');
    const testTitle = "文派AI：一键适配多平台，内容创作效率翻倍！";
    const qualityResult = await callTitleQualityChecker({
      title: testTitle,
      originalContent: testContent,
      platform: 'xiaohongshu',
      otherTitles: ['其他标题示例1', '其他标题示例2']
    });
    
    console.log('✅ 标题质量评估结果:', qualityResult.content.substring(0, 200) + '...');
    
    return {
      success: true,
      results: {
        titles: titleResult,
        quality: qualityResult
      }
    };
    
  } catch (error) {
    console.error('❌ V3标题生成测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 测试提示词系统状态
 */
export async function testPromptSystemStatus() {
  console.log('🧪 检查提示词系统状态...');
  
  try {
    // 获取系统统计信息
    const stats = getPromptSystemStats();
    console.log('📊 提示词系统统计:', stats);
    
    // 获取所有提示词模板
    const templates = getAllPromptTemplates();
    console.log('📋 提示词模板数量:', templates.length);
    
    // 测试提示词获取
    const titlePrompt = getPrompt(PromptType.TITLE_GENERATION_SYSTEM, {
      content: '测试内容',
      platform: 'xiaohongshu',
      outputCount: 5
    });
    
    console.log('✅ 提示词获取测试成功');
    
    return {
      success: true,
      stats,
      templateCount: templates.length,
      samplePrompt: titlePrompt.userPrompt.substring(0, 100) + '...'
    };
    
  } catch (error) {
    console.error('❌ 提示词系统测试失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 运行完整的AI系统测试套件
 */
export async function runFullAISystemTest() {
  console.log('🚀 开始运行完整的AI系统测试套件...');
  
  const results = {
    promptSystem: await testPromptSystemStatus(),
    multiDimensionalMatrix: await testMultiDimensionalMatrix(),
    v3TitleGeneration: await testV3TitleGeneration(),
    timestamp: new Date().toISOString()
  };
  
  const successCount = Object.values(results).filter(r => 
    typeof r === 'object' && r.success
  ).length;
  
  console.log(`🎯 测试完成: ${successCount}/3 项测试通过`);
  
  return results;
}

/**
 * 在开发环境下自动运行测试（可选）
 */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // 延迟执行，确保系统初始化完成
  setTimeout(() => {
    if (window.location.search.includes('test=ai')) {
      runFullAISystemTest().then(results => {
        console.log('🧪 AI系统测试结果:', results);
        (window as any).aiTestResults = results;
      });
    }
  }, 2000);
}
