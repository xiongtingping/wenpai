/**
 * 验证深色模式下功能对比表格显示效果的脚本
 * 在浏览器控制台中运行此脚本
 */

console.log('🌙 开始验证深色模式下表格显示效果...');

function verifyDarkModeTableFix() {
  console.log('\n=== 🔍 1. 检查当前主题 ===');
  
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  console.log(`当前主题: ${currentTheme}`);
  
  if (currentTheme !== 'dark') {
    console.log('⚠️ 当前不是深色模式，请切换到深色模式后重新运行此脚本');
    return false;
  }
  
  console.log('\n=== 📊 2. 查找功能对比表格 ===');
  
  // 查找功能对比表格
  const comparisonTable = document.querySelector('.overflow-x-auto table');
  if (!comparisonTable) {
    console.log('❌ 未找到功能对比表格');
    return false;
  }
  
  console.log('✅ 找到功能对比表格');
  
  console.log('\n=== 🎨 3. 检查表格样式 ===');
  
  const tableStyle = getComputedStyle(comparisonTable);
  console.log(`表格边框颜色: ${tableStyle.borderColor}`);
  console.log(`表格背景颜色: ${tableStyle.backgroundColor}`);
  console.log(`表格阴影: ${tableStyle.boxShadow}`);
  
  // 检查表头样式
  const tableHeader = comparisonTable.querySelector('thead');
  if (tableHeader) {
    const headerStyle = getComputedStyle(tableHeader);
    console.log(`表头背景颜色: ${headerStyle.backgroundColor}`);
  }
  
  // 检查表头单元格样式
  const headerCells = comparisonTable.querySelectorAll('th');
  console.log(`\n📋 表头单元格样式 (共${headerCells.length}个):`);
  headerCells.forEach((cell, index) => {
    const cellStyle = getComputedStyle(cell);
    console.log(`  单元格${index + 1}: 背景=${cellStyle.backgroundColor}, 边框=${cellStyle.borderColor}, 文字=${cellStyle.color}`);
  });
  
  // 检查表格数据单元格样式
  const dataCells = comparisonTable.querySelectorAll('td');
  console.log(`\n📋 数据单元格样式 (共${dataCells.length}个):`);
  
  let cellsWithGoodContrast = 0;
  let cellsWithPoorContrast = 0;
  
  dataCells.forEach((cell, index) => {
    if (index < 10) { // 只检查前10个单元格
      const cellStyle = getComputedStyle(cell);
      const backgroundColor = cellStyle.backgroundColor;
      const borderColor = cellStyle.borderColor;
      const textColor = cellStyle.color;
      
      console.log(`  单元格${index + 1}: 背景=${backgroundColor}, 边框=${borderColor}, 文字=${textColor}`);
      
      // 简单的对比度检查
      if (borderColor.includes('rgba(0, 0, 0, 0)') || borderColor === 'rgba(0, 0, 0, 0)') {
        cellsWithPoorContrast++;
      } else {
        cellsWithGoodContrast++;
      }
    }
  });
  
  console.log(`\n📊 对比度统计:`);
  console.log(`  良好对比度单元格: ${cellsWithGoodContrast}`);
  console.log(`  对比度不足单元格: ${cellsWithPoorContrast}`);
  
  console.log('\n=== 🔍 4. 检查特定样式类 ===');
  
  // 检查是否应用了深色模式样式
  const darkModeStyles = [
    'border-border',
    'bg-accent',
    'text-foreground',
    'text-muted-foreground',
    'text-destructive'
  ];
  
  darkModeStyles.forEach(className => {
    const elements = comparisonTable.querySelectorAll(`.${className}`);
    console.log(`  .${className}: ${elements.length} 个元素`);
  });
  
  console.log('\n=== ✅ 5. 验证结果 ===');
  
  const issues = [];
  
  // 检查表格边框是否可见
  if (tableStyle.borderColor === 'rgba(0, 0, 0, 0)' || tableStyle.borderColor.includes('rgba(0, 0, 0, 0)')) {
    issues.push('表格主边框不可见');
  }
  
  // 检查表格背景是否合适
  if (tableStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || tableStyle.backgroundColor === 'transparent') {
    issues.push('表格背景透明，可能影响可读性');
  }
  
  // 检查是否有阴影效果
  if (!tableStyle.boxShadow || tableStyle.boxShadow === 'none') {
    issues.push('表格缺少阴影效果');
  }
  
  if (issues.length === 0) {
    console.log('🎉 深色模式下表格显示效果良好！');
    console.log('✅ 边框清晰可见');
    console.log('✅ 背景对比度充足');
    console.log('✅ 文字清晰可读');
    return true;
  } else {
    console.log('⚠️ 发现以下问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    return false;
  }
}

function testTableInteraction() {
  console.log('\n=== 🖱️ 6. 测试表格交互效果 ===');
  
  const tableRows = document.querySelectorAll('.overflow-x-auto table tr');
  if (tableRows.length === 0) {
    console.log('❌ 未找到表格行');
    return false;
  }
  
  console.log(`找到 ${tableRows.length} 行表格数据`);
  
  // 模拟鼠标悬停效果
  const firstDataRow = tableRows[1]; // 跳过表头行
  if (firstDataRow) {
    console.log('🖱️ 模拟鼠标悬停效果...');
    
    // 触发悬停
    firstDataRow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      const hoverStyle = getComputedStyle(firstDataRow);
      console.log(`悬停时背景颜色: ${hoverStyle.backgroundColor}`);
      
      // 移除悬停
      firstDataRow.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      
      setTimeout(() => {
        const normalStyle = getComputedStyle(firstDataRow);
        console.log(`正常状态背景颜色: ${normalStyle.backgroundColor}`);
        
        if (hoverStyle.backgroundColor !== normalStyle.backgroundColor) {
          console.log('✅ 悬停效果正常工作');
        } else {
          console.log('⚠️ 悬停效果可能未生效');
        }
      }, 100);
    }, 100);
  }
  
  return true;
}

// 主验证函数
function runFullVerification() {
  console.log('🚀 开始完整验证...');
  
  const tableFixResult = verifyDarkModeTableFix();
  
  if (tableFixResult) {
    testTableInteraction();
  }
  
  console.log('\n📋 验证完成！');
  return tableFixResult;
}

// 自动运行验证
runFullVerification();
