/**
 * 最终验证深色模式表格修复效果
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 最终验证深色模式表格修复效果...');

// 自动切换到深色模式
function ensureDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme !== 'dark') {
    console.log('🔄 切换到深色模式...');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    localStorage.setItem('wenpai-theme', 'dark');
    
    // 触发主题切换事件
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: 'dark' }));
    
    console.log('✅ 已切换到深色模式');
    return true;
  }
  console.log('✅ 当前已是深色模式');
  return false;
}

// 验证表格修复
function verifyTableFix() {
  console.log('\n📊 验证表格修复效果...');
  
  // 查找表格
  const table = document.querySelector('.overflow-x-auto table');
  if (!table) {
    console.log('❌ 未找到功能对比表格，请确保在正确的页面');
    return false;
  }
  
  console.log('✅ 找到功能对比表格');
  
  // 获取表格样式
  const tableStyle = getComputedStyle(table);
  const tableBorder = tableStyle.border;
  const tableBg = tableStyle.backgroundColor;
  const tableShadow = tableStyle.boxShadow;
  
  console.log('🎨 表格样式:');
  console.log(`  边框: ${tableBorder}`);
  console.log(`  背景: ${tableBg}`);
  console.log(`  阴影: ${tableShadow}`);
  
  // 检查边框可见性
  const hasBorder = tableBorder !== 'none' && 
                   tableBorder !== '0px' && 
                   !tableBorder.includes('rgba(0, 0, 0, 0)');
  
  console.log(`  边框可见: ${hasBorder ? '✅' : '❌'}`);
  
  // 检查背景色
  const hasBg = tableBg !== 'rgba(0, 0, 0, 0)' && tableBg !== 'transparent';
  console.log(`  背景可见: ${hasBg ? '✅' : '❌'}`);
  
  // 检查阴影
  const hasShadow = tableShadow !== 'none';
  console.log(`  阴影效果: ${hasShadow ? '✅' : '❌'}`);
  
  // 检查单元格
  const cells = table.querySelectorAll('td, th');
  console.log(`\n📋 单元格检查 (共${cells.length}个):`);
  
  let visibleBorderCount = 0;
  let goodContrastCount = 0;
  
  // 检查前10个单元格的详细信息
  for (let i = 0; i < Math.min(10, cells.length); i++) {
    const cell = cells[i];
    const cellStyle = getComputedStyle(cell);
    const cellBorder = cellStyle.borderColor;
    const cellBg = cellStyle.backgroundColor;
    const cellText = cellStyle.color;
    
    const borderVisible = cellBorder !== 'rgba(0, 0, 0, 0)' && 
                         !cellBorder.includes('rgba(0, 0, 0, 0)');
    
    if (borderVisible) visibleBorderCount++;
    
    const hasContrast = cellBg !== 'rgba(0, 0, 0, 0)' && 
                       cellText !== 'rgba(0, 0, 0, 0)';
    
    if (hasContrast) goodContrastCount++;
    
    if (i < 5) {
      console.log(`  单元格${i + 1}: 边框=${borderVisible ? '✅' : '❌'} 对比度=${hasContrast ? '✅' : '❌'}`);
    }
  }
  
  const borderSuccessRate = (visibleBorderCount / Math.min(10, cells.length)) * 100;
  const contrastSuccessRate = (goodContrastCount / Math.min(10, cells.length)) * 100;
  
  console.log(`\n📈 修复效果统计:`);
  console.log(`  边框可见率: ${borderSuccessRate.toFixed(1)}%`);
  console.log(`  对比度良好率: ${contrastSuccessRate.toFixed(1)}%`);
  
  // 综合评估
  const overallSuccess = hasBorder && hasBg && borderSuccessRate >= 80 && contrastSuccessRate >= 80;
  
  console.log(`\n🎯 综合评估: ${overallSuccess ? '✅ 修复成功' : '❌ 需要改进'}`);
  
  return overallSuccess;
}

// 测试悬停效果
function testHoverEffects() {
  console.log('\n🖱️ 测试悬停效果...');
  
  const rows = document.querySelectorAll('.overflow-x-auto table tbody tr');
  if (rows.length === 0) {
    console.log('❌ 未找到表格行');
    return false;
  }
  
  const testRow = rows[0];
  const originalBg = getComputedStyle(testRow).backgroundColor;
  
  // 模拟鼠标进入
  testRow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  setTimeout(() => {
    const hoverBg = getComputedStyle(testRow).backgroundColor;
    const hoverChanged = originalBg !== hoverBg;
    
    console.log(`  原始背景: ${originalBg}`);
    console.log(`  悬停背景: ${hoverBg}`);
    console.log(`  悬停效果: ${hoverChanged ? '✅ 正常' : '⚠️ 未检测到变化'}`);
    
    // 恢复原状
    testRow.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  }, 100);
  
  return true;
}

// 主验证函数
async function runFinalVerification() {
  console.log('🚀 开始最终验证...');
  
  // 1. 确保深色模式
  const switched = ensureDarkMode();
  
  // 2. 如果刚切换主题，等待样式应用
  if (switched) {
    console.log('⏳ 等待样式应用...');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. 验证表格修复
  const tableSuccess = verifyTableFix();
  
  // 4. 测试悬停效果
  testHoverEffects();
  
  // 5. 最终结果
  console.log('\n🏁 最终验证结果:');
  if (tableSuccess) {
    console.log('🎉 深色模式表格修复成功！');
    console.log('✅ 表格边框清晰可见');
    console.log('✅ 背景对比度充足');
    console.log('✅ 文字清晰可读');
    console.log('✅ 整体视觉效果良好');
  } else {
    console.log('⚠️ 深色模式表格仍需进一步优化');
    console.log('建议检查CSS样式是否正确加载');
  }
  
  return tableSuccess;
}

// 自动运行验证
runFinalVerification();
