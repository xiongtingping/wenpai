// 调试标题生成功能的简单测试脚本
// 在浏览器控制台中运行此脚本来测试

async function debugTitleGeneration() {
  console.log('🔍 开始调试标题生成功能...');
  
  try {
    // 导入服务
    const { titleGenerationService } = window;
    
    if (!titleGenerationService) {
      console.error('❌ titleGenerationService 未找到');
      return;
    }
    
    console.log('✅ titleGenerationService 已找到');
    
    // 测试输入
    const testInput = {
      content: '今天学习了React Hook的使用方法，包括useState、useEffect等常用Hook，感觉对组件状态管理有了更深的理解。',
      platform: 'xiaohongshu',
      stylePreference: ['informative', 'engaging'],
      outputCount: 3
    };
    
    console.log('📝 测试输入:', testInput);
    
    // 调用生成服务
    console.log('🚀 开始生成标题...');
    const result = await titleGenerationService.generateTitles(testInput);
    
    console.log('✅ 生成结果:', result);
    console.log(`📊 生成标题数量: ${result.titles.length}`);
    console.log('📋 标题列表:');
    
    result.titles.forEach((title, index) => {
      console.log(`  ${index + 1}. ${title.title} (${title.length}字)`);
    });
    
    return result;
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    return null;
  }
}

// 自动运行调试
console.log('🎯 标题生成调试脚本已加载');
console.log('💡 运行 debugTitleGeneration() 来开始调试');

// 如果在浏览器环境中，自动运行
if (typeof window !== 'undefined') {
  window.debugTitleGeneration = debugTitleGeneration;
}
