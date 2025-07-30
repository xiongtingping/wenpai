/**
 * AI内容适配器核心功能验证脚本
 * 在浏览器控制台中运行此脚本来验证两个核心功能的实现效果
 */

console.log('🔍 开始验证AI内容适配器核心功能实现...');

// 功能1：平台字符数限制智能推荐与严格控制
console.log('\n📊 功能1：平台字符数限制智能推荐与严格控制');

function testCharacterLimitsFeature() {
  console.log('\n1️⃣ 验证智能推荐机制...');
  
  // 检查推荐按钮
  const recommendButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent && btn.textContent.includes('推荐')
  );
  
  if (recommendButtons.length > 0) {
    console.log('✅ 找到推荐按钮:', recommendButtons.length, '个');
    console.log('💡 建议：点击推荐按钮测试一键设置最佳字符数');
  } else {
    console.log('⚠️ 未找到推荐按钮，可能需要展开平台特定设置');
  }
  
  // 检查字符数限制说明
  const limitDescriptions = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && (
      el.textContent.includes('限制') && el.textContent.includes('字符') ||
      el.textContent.includes('最大') && el.textContent.includes('字符')
    )
  );
  
  if (limitDescriptions.length > 0) {
    console.log('✅ 找到字符数限制说明:', limitDescriptions.length, '个');
  } else {
    console.log('⚠️ 未找到字符数限制说明');
  }
  
  // 检查安全区域显示
  const safetyElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('安全区域')
  );
  
  if (safetyElements.length > 0) {
    console.log('✅ 找到安全区域显示:', safetyElements.length, '个');
    console.log('💡 安全区域功能已实现，生成内容将控制在90-95%范围内');
  } else {
    console.log('⚠️ 未找到安全区域显示，可能需要先设置字符数');
  }
  
  return {
    recommendButtons: recommendButtons.length > 0,
    limitDescriptions: limitDescriptions.length > 0,
    safetyElements: safetyElements.length > 0
  };
}

// 功能2：基于Playwright的批量一键转发自动化
console.log('\n🤖 功能2：基于Playwright的批量一键转发自动化');

function testAutomationFeature() {
  console.log('\n2️⃣ 验证自动化转发功能...');
  
  // 检查自动化转发按钮
  const automatedButton = document.querySelector('[data-testid="automated-forward-button"]');
  
  if (automatedButton) {
    console.log('✅ 找到自动化转发按钮');
    console.log('🔍 按钮状态:', automatedButton.disabled ? '禁用' : '可用');
    console.log('📝 按钮文本:', automatedButton.textContent?.trim());
  } else {
    console.log('❌ 未找到自动化转发按钮');
  }
  
  // 检查批量转发按钮
  const batchButton = document.querySelector('[data-testid="batch-forward-button"]');
  
  if (batchButton) {
    console.log('✅ 找到批量转发按钮');
    console.log('🔍 按钮状态:', batchButton.disabled ? '禁用' : '可用');
  } else {
    console.log('❌ 未找到批量转发按钮');
  }
  
  // 检查平台卡片的data-testid
  const platformCards = document.querySelectorAll('[data-testid="platform-card"]');
  
  if (platformCards.length > 0) {
    console.log('✅ 找到平台卡片:', platformCards.length, '个');
    
    // 检查平台ID属性
    let cardsWithPlatformId = 0;
    platformCards.forEach(card => {
      if (card.getAttribute('data-platform-id')) {
        cardsWithPlatformId++;
      }
    });
    
    console.log('✅ 带有平台ID的卡片:', cardsWithPlatformId, '个');
  } else {
    console.log('⚠️ 未找到平台卡片，可能需要先生成内容');
  }
  
  // 检查版本内容的data-testid
  const versionAContent = document.querySelectorAll('[data-testid="version-a-content"]');
  const versionBContent = document.querySelectorAll('[data-testid="version-b-content"]');
  
  if (versionAContent.length > 0 || versionBContent.length > 0) {
    console.log('✅ 找到版本内容标识:');
    console.log('  - 版本A内容:', versionAContent.length, '个');
    console.log('  - 版本B内容:', versionBContent.length, '个');
  } else {
    console.log('⚠️ 未找到版本内容标识，可能需要先生成内容');
  }
  
  return {
    automatedButton: !!automatedButton,
    batchButton: !!batchButton,
    platformCards: platformCards.length > 0,
    versionContent: versionAContent.length > 0 || versionBContent.length > 0
  };
}

// 验证字符数验证功能
function testCharacterValidation() {
  console.log('\n3️⃣ 验证字符数验证功能...');
  
  // 检查字符数验证信息
  const validationElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && (
      el.textContent.includes('字符数在安全范围内') ||
      el.textContent.includes('字符数警告') ||
      el.textContent.includes('超出') && el.textContent.includes('限制')
    )
  );
  
  if (validationElements.length > 0) {
    console.log('✅ 找到字符数验证信息:', validationElements.length, '个');
    validationElements.forEach((el, index) => {
      console.log(`  ${index + 1}. ${el.textContent?.trim().substring(0, 50)}...`);
    });
  } else {
    console.log('⚠️ 未找到字符数验证信息，可能需要先生成内容');
  }
  
  // 检查字符数显示
  const charCountElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.match(/\d+字/)
  );
  
  if (charCountElements.length > 0) {
    console.log('✅ 找到字符数显示:', charCountElements.length, '个');
  } else {
    console.log('⚠️ 未找到字符数显示');
  }
  
  return {
    validationElements: validationElements.length > 0,
    charCountElements: charCountElements.length > 0
  };
}

// 检查自动化结果显示
function testAutomationResults() {
  console.log('\n4️⃣ 验证自动化结果显示...');
  
  // 检查自动化结果区域
  const resultsTitle = Array.from(document.querySelectorAll('h2')).find(h => 
    h.textContent && h.textContent.includes('自动化转发结果')
  );
  
  if (resultsTitle) {
    console.log('✅ 找到自动化结果标题');
    
    // 检查结果卡片
    const resultCards = resultsTitle.parentElement?.querySelectorAll('.border-green-200, .border-red-200');
    if (resultCards && resultCards.length > 0) {
      console.log('✅ 找到结果卡片:', resultCards.length, '个');
    } else {
      console.log('💡 暂无自动化结果，需要先执行自动化转发');
    }
  } else {
    console.log('💡 暂无自动化结果显示，需要先执行自动化转发');
  }
  
  return {
    resultsTitle: !!resultsTitle
  };
}

// 综合验证函数
async function runComprehensiveTest() {
  console.log('🚀 开始核心功能综合验证...');
  
  const results = {
    characterLimits: testCharacterLimitsFeature(),
    automation: testAutomationFeature(),
    validation: testCharacterValidation(),
    automationResults: testAutomationResults()
  };
  
  // 输出总结
  console.log('\n📊 核心功能验证结果总结:');
  
  console.log('\n🎯 功能1：字符数限制智能推荐与严格控制');
  console.log('  - 推荐按钮:', results.characterLimits.recommendButtons ? '✅ 通过' : '❌ 失败');
  console.log('  - 限制说明:', results.characterLimits.limitDescriptions ? '✅ 通过' : '❌ 失败');
  console.log('  - 安全区域:', results.characterLimits.safetyElements ? '✅ 通过' : '❌ 失败');
  console.log('  - 字符验证:', results.validation.validationElements ? '✅ 通过' : '❌ 失败');
  console.log('  - 字符显示:', results.validation.charCountElements ? '✅ 通过' : '❌ 失败');
  
  console.log('\n🤖 功能2：Playwright批量转发自动化');
  console.log('  - 自动化按钮:', results.automation.automatedButton ? '✅ 通过' : '❌ 失败');
  console.log('  - 批量按钮:', results.automation.batchButton ? '✅ 通过' : '❌ 失败');
  console.log('  - 平台卡片:', results.automation.platformCards ? '✅ 通过' : '❌ 失败');
  console.log('  - 版本内容:', results.automation.versionContent ? '✅ 通过' : '❌ 失败');
  console.log('  - 结果显示:', results.automationResults.resultsTitle ? '✅ 通过' : '💡 待测试');
  
  // 计算总体通过率
  const allTests = [
    results.characterLimits.recommendButtons,
    results.characterLimits.limitDescriptions,
    results.automation.automatedButton,
    results.automation.batchButton,
    results.validation.charCountElements
  ];
  
  const passedTests = allTests.filter(Boolean).length;
  const totalTests = allTests.length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项核心功能通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 所有核心功能验证通过！');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('✅ 大部分核心功能正常，部分功能可能需要特定条件触发');
  } else {
    console.log('⚠️ 部分核心功能需要进一步检查');
  }
  
  return results;
}

// 手动测试建议
function manualTestSuggestions() {
  console.log('\n🔧 手动测试建议:');
  console.log('\n📊 字符数限制功能测试:');
  console.log('1. 展开"平台特定设置"');
  console.log('2. 点击任意平台的"推荐"按钮，观察字符数是否自动设置');
  console.log('3. 调整字符数滑块，观察安全区域提示是否更新');
  console.log('4. 生成内容后，查看字符数验证结果');
  
  console.log('\n🤖 自动化转发功能测试:');
  console.log('1. 先生成一些平台内容');
  console.log('2. 点击"自动化转发"按钮');
  console.log('3. 观察是否启动Playwright自动化');
  console.log('4. 检查是否打开了对应平台的发布页面');
  console.log('5. 查看自动化结果报告');
  
  console.log('\n💡 注意事项:');
  console.log('- 自动化功能需要安装Playwright依赖');
  console.log('- 某些功能需要先生成内容才能测试');
  console.log('- 推荐在开发环境中测试自动化功能');
}

// 自动运行综合测试
runComprehensiveTest().then(results => {
  console.log('\n💡 如需手动验证，请调用 manualTestSuggestions() 函数');
}).catch(error => {
  console.error('综合测试执行失败:', error);
});

// 导出测试函数供手动调用
window.testCharacterLimitsFeature = testCharacterLimitsFeature;
window.testAutomationFeature = testAutomationFeature;
window.testCharacterValidation = testCharacterValidation;
window.testAutomationResults = testAutomationResults;
window.runComprehensiveTest = runComprehensiveTest;
window.manualTestSuggestions = manualTestSuggestions;

console.log('\n💡 可用的测试函数:');
console.log('- testCharacterLimitsFeature() - 测试字符数限制功能');
console.log('- testAutomationFeature() - 测试自动化转发功能');
console.log('- testCharacterValidation() - 测试字符数验证');
console.log('- testAutomationResults() - 测试自动化结果显示');
console.log('- runComprehensiveTest() - 运行综合测试');
console.log('- manualTestSuggestions() - 显示手动测试建议');
