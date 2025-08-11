/**
 * 测试深色模式表格修复效果
 * 自动切换到深色模式并验证表格显示
 */

console.log('🌙 开始测试深色模式表格修复...');

function switchToDarkMode() {
  console.log('🔄 切换到深色模式...');
  
  // 设置data-theme属性
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  
  // 保存到localStorage
  localStorage.setItem('wenpai-theme', 'dark');
  
  console.log('✅ 已切换到深色模式');
}

function testTableVisibility() {
  console.log('\n📊 测试表格可见性...');
  
  // 查找表格
  const table = document.querySelector('.overflow-x-auto table');
  if (!table) {
    console.log('❌ 未找到功能对比表格');
    return false;
  }
  
  console.log('✅ 找到功能对比表格');
  
  // 检查表格样式
  const tableStyle = getComputedStyle(table);
  console.log(`表格边框: ${tableStyle.border}`);
  console.log(`表格背景: ${tableStyle.backgroundColor}`);
  
  // 检查边框是否可见
  const borderVisible = tableStyle.borderColor !== 'rgba(0, 0, 0, 0)' && 
                       !tableStyle.borderColor.includes('rgba(0, 0, 0, 0)') &&
                       tableStyle.borderWidth !== '0px';
  
  console.log(`边框可见: ${borderVisible ? '✅' : '❌'}`);
  
  // 检查表头
  const thead = table.querySelector('thead');
  if (thead) {
    const theadStyle = getComputedStyle(thead);
    console.log(`表头背景: ${theadStyle.backgroundColor}`);
  }
  
  // 检查单元格
  const cells = table.querySelectorAll('td, th');
  console.log(`单元格总数: ${cells.length}`);
  
  let visibleBorderCount = 0;
  let goodContrastCount = 0;
  
  cells.forEach((cell, index) => {
    const cellStyle = getComputedStyle(cell);
    
    // 检查边框
    if (cellStyle.borderColor !== 'rgba(0, 0, 0, 0)' && 
        !cellStyle.borderColor.includes('rgba(0, 0, 0, 0)')) {
      visibleBorderCount++;
    }
    
    // 检查对比度（简单检查）
    const bgColor = cellStyle.backgroundColor;
    const textColor = cellStyle.color;
    
    if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
      goodContrastCount++;
    }
    
    // 显示前5个单元格的详细信息
    if (index < 5) {
      console.log(`单元格${index + 1}: 边框=${cellStyle.borderColor}, 背景=${bgColor}, 文字=${textColor}`);
    }
  });
  
  console.log(`可见边框单元格: ${visibleBorderCount}/${cells.length}`);
  console.log(`良好对比度单元格: ${goodContrastCount}/${cells.length}`);
  
  const borderSuccess = visibleBorderCount > cells.length * 0.8;
  const contrastSuccess = goodContrastCount > cells.length * 0.8;
  
  console.log(`边框修复: ${borderSuccess ? '✅ 成功' : '❌ 需要改进'}`);
  console.log(`对比度修复: ${contrastSuccess ? '✅ 成功' : '❌ 需要改进'}`);
  
  return borderSuccess && contrastSuccess;
}

function testHoverEffect() {
  console.log('\n🖱️ 测试悬停效果...');
  
  const rows = document.querySelectorAll('.overflow-x-auto table tbody tr');
  if (rows.length === 0) {
    console.log('❌ 未找到表格行');
    return false;
  }
  
  const firstRow = rows[0];
  const originalStyle = getComputedStyle(firstRow);
  const originalBg = originalStyle.backgroundColor;
  
  console.log(`原始背景: ${originalBg}`);
  
  // 模拟悬停
  firstRow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  setTimeout(() => {
    const hoverStyle = getComputedStyle(firstRow);
    const hoverBg = hoverStyle.backgroundColor;
    
    console.log(`悬停背景: ${hoverBg}`);
    
    if (originalBg !== hoverBg) {
      console.log('✅ 悬停效果正常');
    } else {
      console.log('⚠️ 悬停效果未检测到变化');
    }
    
    // 移除悬停
    firstRow.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  }, 200);
  
  return true;
}

function generateReport() {
  console.log('\n📋 生成测试报告...');
  
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const table = document.querySelector('.overflow-x-auto table');
  
  const report = {
    theme: currentTheme,
    tableFound: !!table,
    timestamp: new Date().toLocaleString()
  };
  
  if (table) {
    const style = getComputedStyle(table);
    const cells = table.querySelectorAll('td, th');
    
    report.tableStyle = {
      border: style.border,
      backgroundColor: style.backgroundColor,
      boxShadow: style.boxShadow
    };
    
    report.cellCount = cells.length;
    
    let visibleBorders = 0;
    cells.forEach(cell => {
      const cellStyle = getComputedStyle(cell);
      if (cellStyle.borderColor !== 'rgba(0, 0, 0, 0)') {
        visibleBorders++;
      }
    });
    
    report.visibleBorderPercentage = Math.round((visibleBorders / cells.length) * 100);
    report.success = report.visibleBorderPercentage > 80;
  }
  
  console.log('📊 测试报告:', report);
  
  if (report.success) {
    console.log('🎉 深色模式表格修复成功！');
  } else {
    console.log('⚠️ 深色模式表格仍需改进');
  }
  
  return report;
}

// 主测试流程
async function runTest() {
  console.log('🚀 开始完整测试流程...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 测试表格可见性
  const visibilityResult = testTableVisibility();
  
  // 4. 测试悬停效果
  testHoverEffect();
  
  // 5. 生成报告
  const report = generateReport();
  
  console.log('\n✅ 测试完成！');
  return report;
}

// 自动运行测试
runTest();
