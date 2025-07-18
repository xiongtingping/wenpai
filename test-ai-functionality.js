/**
 * AI功能测试脚本
 * 测试资料库内容提取和品牌库AI分析功能
 */

// 模拟前端AI调用
const testAIFunctionality = async () => {
  console.log('🤖 AI功能测试开始...\n');

  try {
    // 测试1: 内容提取/总结功能
    console.log('📝 测试1: 内容提取/总结功能');
    const contentExtractionTest = {
      prompt: '请总结以下内容：文派是一个专注于AI内容创作的创新平台，致力于为用户提供高效、智能的内容生成工具。',
      model: 'gpt-4o',
      maxTokens: 100
    };
    
    console.log('请求参数:', contentExtractionTest);
    console.log('预期结果: 应该返回AI生成的内容总结\n');

    // 测试2: 品牌分析功能
    console.log('🏢 测试2: 品牌分析功能');
    const brandAnalysisTest = {
      prompt: '请分析以下品牌资料：文派，AI内容创作平台，主打高效、智能、易用。',
      model: 'gpt-4o',
      maxTokens: 150
    };
    
    console.log('请求参数:', brandAnalysisTest);
    console.log('预期结果: 应该返回AI生成的品牌分析\n');

    console.log('✅ 测试脚本准备完成');
    console.log('请访问 http://localhost:5173/ 进行实际功能测试');
    console.log('1. 进入资料库页面，测试内容提取功能');
    console.log('2. 进入品牌库页面，测试AI分析功能');
    console.log('3. 检查控制台是否还有 "provider" 参数错误');

  } catch (error) {
    console.error('❌ 测试脚本执行失败:', error);
  }
};

// 执行测试
testAIFunctionality(); 