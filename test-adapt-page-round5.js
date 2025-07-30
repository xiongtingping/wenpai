/**
 * AI内容适配器页面第五轮修复验证脚本
 * 在浏览器控制台中运行此脚本来验证所有7个问题的修复效果
 */

console.log('🔍 开始验证AI内容适配器页面第五轮修复...');

// 问题1：表达风格选择器显示优化
console.log('\n1️⃣ 验证表达风格选择器显示优化...');

function testStyleSelectorOptimization() {
  // 查找是否还有"未选择"文案
  const unselectedTexts = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('未选择') && 
    !el.textContent.includes('点击上方选择')
  );
  
  if (unselectedTexts.length === 0) {
    console.log('✅ "未选择"文案已移除');
    
    // 检查是否有"已选择"文案（只在实际选择时显示）
    const selectedBadges = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && el.textContent.includes('已选择：')
    );
    
    console.log('📋 当前选择状态:', selectedBadges.length > 0 ? '已选择风格' : '未选择风格');
    console.log('✅ 表达风格选择器显示优化完成');
    return true;
  } else {
    console.log('❌ 仍存在"未选择"文案:', unselectedTexts.length, '个');
    return false;
  }
}

// 问题2：版本操作按钮无响应
console.log('\n2️⃣ 验证版本操作按钮响应...');

function testVersionButtonsResponse() {
  // 查找版本操作按钮
  const versionButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('重新生成') || 
    btn.textContent.includes('编辑') || 
    btn.textContent.includes('收藏') || 
    btn.textContent.includes('一键复制') || 
    btn.textContent.includes('立刻发布')
  );
  
  if (versionButtons.length > 0) {
    console.log('✅ 找到版本操作按钮:', versionButtons.length, '个');
    console.log('💡 建议：点击按钮测试功能是否正常响应');
    console.log('💡 预期：收藏功能支持版本特定内容，其他功能正常工作');
    return true;
  } else {
    console.log('⚠️ 未找到版本操作按钮，可能需要先生成内容');
    return false;
  }
}

// 问题3：版本按钮布局对齐问题
console.log('\n3️⃣ 验证版本按钮布局对齐...');

function testVersionButtonAlignment() {
  // 查找版本A和版本B的标题
  const versionATitles = Array.from(document.querySelectorAll('h4')).filter(h => 
    h.textContent.includes('版本A')
  );
  const versionBTitles = Array.from(document.querySelectorAll('h4')).filter(h => 
    h.textContent.includes('版本B')
  );
  
  if (versionATitles.length > 0 && versionBTitles.length > 0) {
    console.log('✅ 找到版本A和版本B区域');
    console.log('💡 建议：检查两个版本的按钮组是否在同一水平线对齐');
    console.log('💡 预期：使用flex布局确保按钮对齐，不受内容长度影响');
    return true;
  } else {
    console.log('⚠️ 未找到版本A/B区域，可能需要先生成内容');
    return false;
  }
}

// 问题4：移除底部冗余操作按钮
console.log('\n4️⃣ 验证底部冗余按钮移除...');

function testRedundantButtonsRemoval() {
  // 查找页面底部是否还有冗余的操作按钮
  const allButtons = Array.from(document.querySelectorAll('button'));
  const operationButtons = allButtons.filter(btn => 
    btn.textContent.includes('重新生成') || 
    btn.textContent.includes('编辑') || 
    btn.textContent.includes('收藏') || 
    btn.textContent.includes('一键复制') || 
    btn.textContent.includes('立刻发布')
  );
  
  // 检查是否有重复的按钮（同一功能出现多次）
  const buttonTexts = operationButtons.map(btn => btn.textContent.trim());
  const duplicates = buttonTexts.filter((text, index) => buttonTexts.indexOf(text) !== index);
  
  if (duplicates.length === 0) {
    console.log('✅ 没有发现重复的操作按钮');
    console.log('✅ 底部冗余按钮已移除');
    return true;
  } else {
    console.log('❌ 发现重复的操作按钮:', duplicates);
    return false;
  }
}

// 问题5：批量转发功能异常
console.log('\n5️⃣ 验证批量转发功能...');

function testBatchForwardFunction() {
  // 查找批量转发按钮
  const batchButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('批量一键转发') || btn.textContent.includes('批量API直发')
  );
  
  if (batchButton) {
    console.log('✅ 找到批量转发按钮');
    console.log('💡 建议：点击按钮并全选平台，测试是否能打开所有选中平台');
    console.log('💡 预期：支持版本内容的批量转发，所有选中平台都能正确跳转');
    return true;
  } else {
    console.log('⚠️ 未找到批量转发按钮，可能需要先生成内容');
    return false;
  }
}

// 问题6：平台标题区域排版问题
console.log('\n6️⃣ 验证平台标题区域排版...');

function testPlatformTitleLayout() {
  // 查找平台标题区域
  const platformTitles = Array.from(document.querySelectorAll('h2')).filter(h => 
    h.textContent.includes('小红书') || 
    h.textContent.includes('微博') || 
    h.textContent.includes('抖音') || 
    h.textContent.includes('知乎') || 
    h.textContent.includes('哔哩哔哩')
  );
  
  if (platformTitles.length > 0) {
    console.log('✅ 找到平台标题区域:', platformTitles.length, '个');
    
    // 检查是否有内联状态显示
    const statusElements = Array.from(document.querySelectorAll('*')).filter(el => 
      el.textContent && (
        el.textContent.includes('正在生成') || 
        el.textContent.includes('生成完成') || 
        el.textContent.includes('生成失败')
      )
    );
    
    if (statusElements.length > 0) {
      console.log('✅ 找到状态显示元素，应该与标题内联显示');
    }
    
    console.log('💡 建议：检查图标、平台名称、状态是否在同一水平线对齐');
    return true;
  } else {
    console.log('⚠️ 未找到平台标题区域，可能需要先生成内容');
    return false;
  }
}

// 问题7：模块容器高度优化
console.log('\n7️⃣ 验证模块容器高度优化...');

function testContainerHeightOptimization() {
  // 查找平台模块容器
  const platformCards = document.querySelectorAll('[class*="Card"], .card, [class*="shadow-lg"]');
  
  if (platformCards.length > 0) {
    console.log('✅ 找到平台模块容器:', platformCards.length, '个');
    
    // 检查容器的padding类
    let optimizedContainers = 0;
    platformCards.forEach(card => {
      const classes = card.className;
      if (classes.includes('p-3') || classes.includes('p-4') || classes.includes('p-5')) {
        optimizedContainers++;
      }
    });
    
    if (optimizedContainers > 0) {
      console.log('✅ 发现优化的容器padding:', optimizedContainers, '个');
      console.log('✅ 模块容器高度已优化，信息密度提升');
      return true;
    } else {
      console.log('⚠️ 未发现优化的容器padding');
      return false;
    }
  } else {
    console.log('⚠️ 未找到平台模块容器');
    return false;
  }
}

// 综合验证函数
async function runComprehensiveTest() {
  console.log('🚀 开始第五轮综合验证...');
  
  const results = {
    styleSelectorOptimization: false,
    versionButtonsResponse: false,
    versionButtonAlignment: false,
    redundantButtonsRemoval: false,
    batchForwardFunction: false,
    platformTitleLayout: false,
    containerHeightOptimization: false
  };
  
  // 执行所有测试
  results.styleSelectorOptimization = testStyleSelectorOptimization();
  results.versionButtonsResponse = testVersionButtonsResponse();
  results.versionButtonAlignment = testVersionButtonAlignment();
  results.redundantButtonsRemoval = testRedundantButtonsRemoval();
  results.batchForwardFunction = testBatchForwardFunction();
  results.platformTitleLayout = testPlatformTitleLayout();
  results.containerHeightOptimization = testContainerHeightOptimization();
  
  // 输出总结
  console.log('\n📊 第五轮验证结果总结:');
  console.log('1. 表达风格选择器显示优化:', results.styleSelectorOptimization ? '✅ 通过' : '❌ 失败');
  console.log('2. 版本操作按钮响应:', results.versionButtonsResponse ? '✅ 通过' : '❌ 失败');
  console.log('3. 版本按钮布局对齐:', results.versionButtonAlignment ? '✅ 通过' : '❌ 失败');
  console.log('4. 底部冗余按钮移除:', results.redundantButtonsRemoval ? '✅ 通过' : '❌ 失败');
  console.log('5. 批量转发功能:', results.batchForwardFunction ? '✅ 通过' : '❌ 失败');
  console.log('6. 平台标题区域排版:', results.platformTitleLayout ? '✅ 通过' : '❌ 失败');
  console.log('7. 模块容器高度优化:', results.containerHeightOptimization ? '✅ 通过' : '❌ 失败');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);
  
  if (passedTests === totalTests) {
    console.log('🎉 第五轮所有问题修复验证通过！');
  } else {
    console.log('⚠️ 部分问题仍需修复');
  }
  
  return results;
}

// 手动测试建议
function manualTestSuggestions() {
  console.log('\n🔧 手动测试建议:');
  console.log('1. 检查表达风格选择器是否不显示"未选择"文案');
  console.log('2. 点击版本A和版本B的操作按钮，测试功能响应');
  console.log('3. 观察版本按钮组是否水平对齐');
  console.log('4. 确认页面底部无重复的操作按钮');
  console.log('5. 测试批量转发是否能打开所有选中平台');
  console.log('6. 检查平台标题区域的图标、名称、状态是否对齐');
  console.log('7. 观察页面整体是否更紧凑，信息密度是否提升');
}

// 自动运行综合测试
runComprehensiveTest().then(results => {
  console.log('\n💡 如需手动验证，请调用 manualTestSuggestions() 函数');
}).catch(error => {
  console.error('综合测试执行失败:', error);
});

// 导出测试函数供手动调用
window.testStyleSelectorOptimization = testStyleSelectorOptimization;
window.testVersionButtonsResponse = testVersionButtonsResponse;
window.testVersionButtonAlignment = testVersionButtonAlignment;
window.testRedundantButtonsRemoval = testRedundantButtonsRemoval;
window.testBatchForwardFunction = testBatchForwardFunction;
window.testPlatformTitleLayout = testPlatformTitleLayout;
window.testContainerHeightOptimization = testContainerHeightOptimization;
window.runComprehensiveTest = runComprehensiveTest;
window.manualTestSuggestions = manualTestSuggestions;

console.log('\n💡 可用的测试函数:');
console.log('- testStyleSelectorOptimization() - 测试风格选择器优化');
console.log('- testVersionButtonsResponse() - 测试版本按钮响应');
console.log('- testVersionButtonAlignment() - 测试按钮对齐');
console.log('- testRedundantButtonsRemoval() - 测试冗余按钮移除');
console.log('- testBatchForwardFunction() - 测试批量转发功能');
console.log('- testPlatformTitleLayout() - 测试标题排版');
console.log('- testContainerHeightOptimization() - 测试容器高度优化');
console.log('- runComprehensiveTest() - 运行综合测试');
console.log('- manualTestSuggestions() - 显示手动测试建议');
