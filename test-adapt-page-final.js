/**
 * AI内容适配器页面最终验证脚本
 * 在浏览器控制台中运行此脚本来验证所有3个问题的修复效果
 */

console.log('🔍 开始验证AI内容适配器页面修复...');

// 问题1：表达风格选择器显示异常
console.log('\n1️⃣ 验证表达风格选择器显示状态...');

function testStyleSelectorDisplay() {
  // 查找风格选择按钮
  const styleButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('选择表达风格')
  );
  
  if (styleButton) {
    console.log('✅ 找到表达风格选择按钮');
    
    // 检查是否有"未选择"标签
    const unselectedBadge = styleButton.querySelector('.text-gray-500');
    const selectedBadge = styleButton.querySelector('.ml-2:not(.text-gray-500)');
    
    if (unselectedBadge && unselectedBadge.textContent.includes('未选择')) {
      console.log('✅ 未选择状态显示正确："未选择"');
      return true;
    } else if (selectedBadge && selectedBadge.textContent.includes('已选择：')) {
      console.log('✅ 已选择状态显示正确：', selectedBadge.textContent);
      return true;
    } else {
      console.log('❌ 风格选择状态显示异常');
      return false;
    }
  } else {
    console.log('❌ 未找到表达风格选择按钮');
    return false;
  }
}

// 问题2：组合效果预览中的默认风格问题
console.log('\n2️⃣ 验证组合效果预览配置...');

function testConfigurationPreview() {
  // 查找组合效果预览区域
  const previewSection = Array.from(document.querySelectorAll('p')).find(p => 
    p.textContent.includes('当前配置：')
  );
  
  if (previewSection) {
    console.log('✅ 找到组合效果预览区域');
    const configText = previewSection.textContent;
    console.log('📋 当前配置:', configText);
    
    // 检查是否显示了错误的"专业风格"
    if (configText.includes('专业风格') && !configText.includes('已选择')) {
      console.log('❌ 仍然显示默认的"专业风格"');
      return false;
    } else if (configText.includes('自然表达风格') || configText.includes('未选择')) {
      console.log('✅ 正确显示"自然表达风格"或未选择状态');
      return true;
    } else {
      console.log('✅ 配置预览显示正常');
      return true;
    }
  } else {
    console.log('❌ 未找到组合效果预览区域');
    return false;
  }
}

// 问题3：DeepSeek API调用测试
console.log('\n3️⃣ 验证DeepSeek API调用...');

async function testDeepSeekAPI() {
  try {
    console.log('📡 准备测试DeepSeek API调用...');
    
    // 导入callAI函数
    const { callAI } = await import('/src/api/index.js');
    
    // 测试DeepSeek V3模型
    const testParams = {
      prompt: '请简单说一句话',
      model: 'deepseek-v3',
      systemPrompt: '你是一个AI助手',
      maxTokens: 50,
      temperature: 0.7
    };
    
    console.log('📋 测试参数:', testParams);
    
    const result = await callAI(testParams);
    
    if (result.success) {
      console.log('✅ DeepSeek V3 API调用成功');
      console.log('📝 生成内容:', result.content);
      return true;
    } else {
      console.log('❌ DeepSeek V3 API调用失败:', result.error);
      
      // 测试备用模型
      console.log('🔄 尝试备用模型 deepseek-chat...');
      testParams.model = 'deepseek-chat';
      const backupResult = await callAI(testParams);
      
      if (backupResult.success) {
        console.log('✅ DeepSeek Chat 备用模型调用成功');
        console.log('📝 生成内容:', backupResult.content);
        return true;
      } else {
        console.log('❌ 备用模型也失败:', backupResult.error);
        return false;
      }
    }
  } catch (error) {
    console.error('🚨 DeepSeek API测试异常:', error);
    return false;
  }
}

// 综合验证函数
async function runComprehensiveTest() {
  console.log('🚀 开始综合验证...');
  
  const results = {
    styleDisplay: false,
    configPreview: false,
    deepseekAPI: false
  };
  
  // 测试1：风格选择器显示
  results.styleDisplay = testStyleSelectorDisplay();
  
  // 测试2：配置预览
  results.configPreview = testConfigurationPreview();
  
  // 测试3：DeepSeek API（异步）
  try {
    results.deepseekAPI = await testDeepSeekAPI();
  } catch (error) {
    console.error('DeepSeek API测试失败:', error);
    results.deepseekAPI = false;
  }
  
  // 输出总结
  console.log('\n📊 验证结果总结:');
  console.log('1. 表达风格选择器显示:', results.styleDisplay ? '✅ 通过' : '❌ 失败');
  console.log('2. 组合效果预览配置:', results.configPreview ? '✅ 通过' : '❌ 失败');
  console.log('3. DeepSeek API调用:', results.deepseekAPI ? '✅ 通过' : '❌ 失败');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有问题修复验证通过！');
  } else {
    console.log('⚠️ 部分问题仍需修复');
  }
  
  return results;
}

// 手动测试函数
function manualTest() {
  console.log('\n🔧 手动测试建议:');
  console.log('1. 点击"选择表达风格"按钮，验证显示状态');
  console.log('2. 选择一个风格，然后再次点击取消选择');
  console.log('3. 查看"组合效果预览"区域的配置显示');
  console.log('4. 输入内容并选择平台，测试内容生成功能');
}

// 自动运行综合测试
runComprehensiveTest().then(results => {
  console.log('\n💡 如需手动验证，请调用 manualTest() 函数');
}).catch(error => {
  console.error('综合测试执行失败:', error);
});

// 导出测试函数供手动调用
window.testStyleSelectorDisplay = testStyleSelectorDisplay;
window.testConfigurationPreview = testConfigurationPreview;
window.testDeepSeekAPI = testDeepSeekAPI;
window.runComprehensiveTest = runComprehensiveTest;
window.manualTest = manualTest;

console.log('\n💡 可用的测试函数:');
console.log('- testStyleSelectorDisplay() - 测试风格选择器显示');
console.log('- testConfigurationPreview() - 测试配置预览');
console.log('- testDeepSeekAPI() - 测试DeepSeek API');
console.log('- runComprehensiveTest() - 运行综合测试');
console.log('- manualTest() - 显示手动测试建议');
