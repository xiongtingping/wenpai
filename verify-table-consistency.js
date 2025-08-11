/**
 * 验证深色模式下表格三个版本列背景色一致性
 * 在浏览器控制台中运行此脚本
 */

console.log('🔍 验证表格背景色一致性...');

function switchToDarkMode() {
  console.log('🌙 切换到深色模式...');
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
  localStorage.setItem('wenpai-theme', 'dark');
  console.log('✅ 已切换到深色模式');
}

function verifyTableConsistency() {
  console.log('\n📊 检查表格背景色一致性...');
  
  // 查找表格
  const table = document.querySelector('.overflow-x-auto table');
  if (!table) {
    console.log('❌ 未找到功能对比表格');
    return false;
  }
  
  console.log('✅ 找到功能对比表格');
  
  // 获取所有数据行
  const dataRows = table.querySelectorAll('tbody tr');
  console.log(`找到 ${dataRows.length} 行数据`);
  
  let consistencyIssues = [];
  let totalChecks = 0;
  let passedChecks = 0;
  
  dataRows.forEach((row, rowIndex) => {
    const cells = row.querySelectorAll('td');
    
    // 检查版本列（第2、3、4列）的背景色
    const versionCells = [cells[1], cells[2], cells[3]]; // 体验版、专业版、高级版
    const versionNames = ['体验版', '专业版', '高级版'];
    
    if (versionCells.length === 3) {
      const backgrounds = versionCells.map(cell => {
        if (cell) {
          return getComputedStyle(cell).backgroundColor;
        }
        return null;
      });
      
      console.log(`\n行${rowIndex + 1} (${cells[0]?.textContent?.trim()}):`);
      backgrounds.forEach((bg, index) => {
        console.log(`  ${versionNames[index]}: ${bg}`);
      });
      
      // 检查背景色是否一致
      const uniqueBackgrounds = [...new Set(backgrounds.filter(bg => bg !== null))];
      totalChecks++;
      
      if (uniqueBackgrounds.length === 1) {
        console.log(`  ✅ 背景色一致`);
        passedChecks++;
      } else {
        console.log(`  ❌ 背景色不一致`);
        consistencyIssues.push({
          row: rowIndex + 1,
          feature: cells[0]?.textContent?.trim(),
          backgrounds: backgrounds
        });
      }
    }
  });
  
  console.log(`\n📈 一致性检查结果:`);
  console.log(`  总检查数: ${totalChecks}`);
  console.log(`  通过检查: ${passedChecks}`);
  console.log(`  一致性率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
  
  if (consistencyIssues.length > 0) {
    console.log(`\n⚠️ 发现 ${consistencyIssues.length} 个一致性问题:`);
    consistencyIssues.forEach(issue => {
      console.log(`  行${issue.row} (${issue.feature}): 背景色不统一`);
    });
    return false;
  } else {
    console.log(`\n🎉 所有版本列背景色完全一致！`);
    return true;
  }
}

function testHoverConsistency() {
  console.log('\n🖱️ 测试悬停效果一致性...');
  
  const table = document.querySelector('.overflow-x-auto table');
  if (!table) {
    console.log('❌ 未找到表格');
    return false;
  }
  
  const firstDataRow = table.querySelector('tbody tr');
  if (!firstDataRow) {
    console.log('❌ 未找到数据行');
    return false;
  }
  
  const versionCells = [
    firstDataRow.querySelector('td:nth-child(2)'), // 体验版
    firstDataRow.querySelector('td:nth-child(3)'), // 专业版
    firstDataRow.querySelector('td:nth-child(4)')  // 高级版
  ];
  
  // 获取原始背景色
  const originalBackgrounds = versionCells.map(cell => 
    cell ? getComputedStyle(cell).backgroundColor : null
  );
  
  console.log('原始背景色:');
  originalBackgrounds.forEach((bg, index) => {
    console.log(`  ${['体验版', '专业版', '高级版'][index]}: ${bg}`);
  });
  
  // 模拟悬停
  firstDataRow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  setTimeout(() => {
    const hoverBackgrounds = versionCells.map(cell => 
      cell ? getComputedStyle(cell).backgroundColor : null
    );
    
    console.log('\n悬停时背景色:');
    hoverBackgrounds.forEach((bg, index) => {
      console.log(`  ${['体验版', '专业版', '高级版'][index]}: ${bg}`);
    });
    
    // 检查悬停时是否一致
    const uniqueHoverBgs = [...new Set(hoverBackgrounds.filter(bg => bg !== null))];
    
    if (uniqueHoverBgs.length === 1) {
      console.log('✅ 悬停时背景色一致');
    } else {
      console.log('❌ 悬停时背景色不一致');
    }
    
    // 检查是否有悬停效果
    const hasHoverEffect = originalBackgrounds.some((orig, index) => 
      orig !== hoverBackgrounds[index]
    );
    
    if (hasHoverEffect) {
      console.log('✅ 悬停效果正常工作');
    } else {
      console.log('⚠️ 未检测到悬停效果');
    }
    
    // 恢复原状
    firstDataRow.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
  }, 200);
  
  return true;
}

// 主验证函数
async function runConsistencyCheck() {
  console.log('🚀 开始表格一致性验证...');
  
  // 1. 切换到深色模式
  switchToDarkMode();
  
  // 2. 等待样式应用
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. 验证背景色一致性
  const consistencyResult = verifyTableConsistency();
  
  // 4. 测试悬停效果一致性
  testHoverConsistency();
  
  console.log('\n🏁 验证完成！');
  
  if (consistencyResult) {
    console.log('🎉 表格背景色一致性修复成功！');
  } else {
    console.log('⚠️ 表格背景色仍存在不一致问题');
  }
  
  return consistencyResult;
}

// 自动运行验证
runConsistencyCheck();
