/**
 * 快速检查深色模式下表格显示效果
 * 在浏览器控制台中运行: copy(document.querySelector('script').textContent); 然后粘贴运行
 */

console.log('🔍 快速检查深色模式表格...');

// 检查当前主题
const theme = document.documentElement.getAttribute('data-theme');
console.log(`当前主题: ${theme}`);

if (theme !== 'dark') {
  console.log('❌ 请先切换到深色模式');
} else {
  // 查找表格
  const table = document.querySelector('.overflow-x-auto table');
  if (table) {
    const style = getComputedStyle(table);
    console.log('✅ 找到表格');
    console.log(`边框: ${style.border}`);
    console.log(`背景: ${style.backgroundColor}`);
    console.log(`阴影: ${style.boxShadow}`);
    
    // 检查单元格
    const cells = table.querySelectorAll('td, th');
    console.log(`单元格数量: ${cells.length}`);
    
    let visibleBorders = 0;
    cells.forEach(cell => {
      const cellStyle = getComputedStyle(cell);
      if (cellStyle.borderColor !== 'rgba(0, 0, 0, 0)' && !cellStyle.borderColor.includes('rgba(0, 0, 0, 0)')) {
        visibleBorders++;
      }
    });
    
    console.log(`可见边框单元格: ${visibleBorders}/${cells.length}`);
    
    if (visibleBorders > cells.length * 0.8) {
      console.log('🎉 表格边框修复成功！');
    } else {
      console.log('⚠️ 表格边框仍需改进');
    }
  } else {
    console.log('❌ 未找到表格');
  }
}
