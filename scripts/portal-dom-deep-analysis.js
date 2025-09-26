/**
 * 🔍 React Portal和DOM容器深度分析脚本
 * 系统性检查Portal系统、坐标系和containing block问题
 */

console.log('🔍 启动React Portal和DOM容器深度分析...');

// 1. 检查Radix UI Portal系统
function analyzeRadixPortals() {
  console.log('\n📡 === Radix UI Portal 系统分析 ===');
  
  const portals = document.querySelectorAll('[data-radix-portal]');
  console.log(`发现 ${portals.length} 个 Radix Portal 容器`);
  
  portals.forEach((portal, index) => {
    const computedStyle = window.getComputedStyle(portal);
    const rect = portal.getBoundingClientRect();
    
    console.log(`\n📡 Portal ${index + 1}:`);
    console.log(`  选择器: [data-radix-portal]`);
    console.log(`  位置: ${rect.x}, ${rect.y}`);
    console.log(`  尺寸: ${rect.width} x ${rect.height}`);
    console.log(`  CSS属性:`);
    console.log(`    position: ${computedStyle.position}`);
    console.log(`    inset: ${computedStyle.inset}`);
    console.log(`    top: ${computedStyle.top}`);
    console.log(`    left: ${computedStyle.left}`);
    console.log(`    transform: ${computedStyle.transform}`);
    console.log(`    z-index: ${computedStyle.zIndex}`);
    console.log(`    pointer-events: ${computedStyle.pointerEvents}`);
    
    // 检查是否创建新的stacking context
    const createsStackingContext = (
      computedStyle.zIndex !== 'auto' ||
      computedStyle.opacity !== '1' ||
      computedStyle.transform !== 'none' ||
      computedStyle.filter !== 'none' ||
      computedStyle.perspective !== 'none' ||
      computedStyle.clipPath !== 'none' ||
      computedStyle.isolation === 'isolate'
    );
    
    console.log(`    创建Stacking Context: ${createsStackingContext ? '是' : '否'}`);
    
    // 检查是否创建containing block
    const createsContainingBlock = (
      computedStyle.transform !== 'none' ||
      computedStyle.perspective !== 'none' ||
      computedStyle.filter !== 'none' ||
      computedStyle.contain === 'layout' ||
      computedStyle.contain === 'paint' ||
      computedStyle.contain.includes('layout') ||
      computedStyle.contain.includes('paint')
    );
    
    console.log(`    创建Containing Block: ${createsContainingBlock ? '是' : '否'}`);
    
    // 检查Portal内的Dialog元素
    const dialogs = portal.querySelectorAll('[role="dialog"]');
    console.log(`    包含Dialog数量: ${dialogs.length}`);
    
    dialogs.forEach((dialog, dialogIndex) => {
      const dialogStyle = window.getComputedStyle(dialog);
      const dialogRect = dialog.getBoundingClientRect();
      
      console.log(`    🔘 Dialog ${dialogIndex + 1}:`);
      console.log(`      位置: ${dialogRect.x}, ${dialogRect.y}`);
      console.log(`      尺寸: ${dialogRect.width} x ${dialogRect.height}`);
      console.log(`      position: ${dialogStyle.position}`);
      console.log(`      top: ${dialogStyle.top}`);
      console.log(`      left: ${dialogStyle.left}`);
      console.log(`      transform: ${dialogStyle.transform}`);
      console.log(`      inset: ${dialogStyle.inset}`);
      
      // 计算中心点
      const centerX = dialogRect.left + dialogRect.width / 2;
      const centerY = dialogRect.top + dialogRect.height / 2;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;
      const offsetX = centerX - viewportCenterX;
      const offsetY = centerY - viewportCenterY;
      
      console.log(`      中心坐标: (${Math.round(centerX)}, ${Math.round(centerY)})`);
      console.log(`      视口中心: (${Math.round(viewportCenterX)}, ${Math.round(viewportCenterY)})`);
      console.log(`      偏移量: (${Math.round(offsetX)}, ${Math.round(offsetY)})`);
      console.log(`      是否居中: ${Math.abs(offsetX) < 5 && Math.abs(offsetY) < 5 ? '是' : '否'}`);
    });
  });
}

// 2. 检查Root容器问题
function analyzeRootContainer() {
  console.log('\n🏠 === Root 容器分析 ===');
  
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');
  
  [
    { name: 'HTML', element: html },
    { name: 'BODY', element: body },
    { name: '#root', element: root }
  ].forEach(({ name, element }) => {
    if (!element) {
      console.log(`${name}: 元素不存在`);
      return;
    }
    
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    
    console.log(`\n🏠 ${name}:`);
    console.log(`  位置: ${rect.x}, ${rect.y}`);
    console.log(`  尺寸: ${rect.width} x ${rect.height}`);
    console.log(`  CSS属性:`);
    console.log(`    position: ${style.position}`);
    console.log(`    transform: ${style.transform}`);
    console.log(`    filter: ${style.filter}`);
    console.log(`    perspective: ${style.perspective}`);
    console.log(`    contain: ${style.contain}`);
    console.log(`    isolation: ${style.isolation}`);
    console.log(`    overflow: ${style.overflow}`);
    console.log(`    aria-hidden: ${element.getAttribute('aria-hidden')}`);
    
    // 检查是否创建新的坐标系
    const createsCoordinateSystem = (
      style.transform !== 'none' ||
      style.perspective !== 'none' ||
      style.filter !== 'none'
    );
    
    console.log(`    创建新坐标系: ${createsCoordinateSystem ? '是' : '否'}`);
    
    if (createsCoordinateSystem) {
      console.log(`    ⚠️  警告: ${name} 创建新坐标系可能影响fixed定位`);
    }
  });
}

// 3. 检查层级和z-index堆叠上下文
function analyzeStackingContext() {
  console.log('\n📚 === Stacking Context 分析 ===');
  
  // 查找所有可能创建stacking context的元素
  const allElements = document.querySelectorAll('*');
  const stackingElements = [];
  
  allElements.forEach(element => {
    const style = window.getComputedStyle(element);
    const createsStacking = (
      style.zIndex !== 'auto' ||
      style.opacity !== '1' ||
      style.transform !== 'none' ||
      style.filter !== 'none' ||
      style.perspective !== 'none' ||
      style.clipPath !== 'none' ||
      style.isolation === 'isolate' ||
      style.position === 'fixed' ||
      style.position === 'sticky'
    );
    
    if (createsStacking) {
      stackingElements.push({
        element,
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className,
        zIndex: style.zIndex,
        position: style.position,
        transform: style.transform,
        filter: style.filter,
        opacity: style.opacity
      });
    }
  });
  
  console.log(`发现 ${stackingElements.length} 个创建Stacking Context的元素`);
  
  // 按z-index排序
  stackingElements
    .sort((a, b) => {
      const aZ = a.zIndex === 'auto' ? 0 : parseInt(a.zIndex);
      const bZ = b.zIndex === 'auto' ? 0 : parseInt(b.zIndex);
      return bZ - aZ;
    })
    .slice(0, 10) // 只显示前10个最高层级的
    .forEach((item, index) => {
      console.log(`\n📚 Stacking Context ${index + 1}:`);
      console.log(`  元素: <${item.tag}${item.id ? '#' + item.id : ''}>`);
      console.log(`  z-index: ${item.zIndex}`);
      console.log(`  position: ${item.position}`);
      console.log(`  transform: ${item.transform !== 'none' ? item.transform : '无'}`);
      console.log(`  filter: ${item.filter !== 'none' ? item.filter : '无'}`);
      console.log(`  opacity: ${item.opacity}`);
    });
}

// 4. 检查Containing Block问题
function analyzeContainingBlocks() {
  console.log('\n📦 === Containing Block 分析 ===');
  
  const dialogs = document.querySelectorAll('[role="dialog"]');
  
  console.log(`发现 ${dialogs.length} 个 Dialog 元素`);
  
  dialogs.forEach((dialog, index) => {
    console.log(`\n📦 Dialog ${index + 1} Containing Block 分析:`);
    
    let current = dialog.parentElement;
    let level = 1;
    
    while (current && level <= 5) { // 检查最多5层祖先
      const style = window.getComputedStyle(current);
      const isContainingBlock = (
        style.transform !== 'none' ||
        style.perspective !== 'none' ||
        style.filter !== 'none' ||
        style.contain === 'layout' ||
        style.contain === 'paint' ||
        style.contain.includes('layout') ||
        style.contain.includes('paint') ||
        (style.position !== 'static' && current !== document.body)
      );
      
      if (isContainingBlock || current === document.body) {
        console.log(`  层级 ${level}: <${current.tagName.toLowerCase()}${current.id ? '#' + current.id : ''}>`);
        console.log(`    position: ${style.position}`);
        console.log(`    transform: ${style.transform}`);
        console.log(`    perspective: ${style.perspective}`);
        console.log(`    filter: ${style.filter}`);
        console.log(`    contain: ${style.contain}`);
        console.log(`    是Containing Block: ${isContainingBlock ? '是' : '否'}`);
        
        if (isContainingBlock && style.transform !== 'none') {
          console.log(`    ⚠️  警告: transform属性创建新的Containing Block`);
        }
        
        if (current === document.body) break;
      }
      
      current = current.parentElement;
      level++;
    }
  });
}

// 5. 生成诊断报告
function generateDiagnosticReport() {
  console.log('\n📋 === 诊断报告摘要 ===');
  
  const issues = [];
  
  // 检查Portal容器配置
  const portals = document.querySelectorAll('[data-radix-portal]');
  portals.forEach(portal => {
    const style = window.getComputedStyle(portal);
    if (style.inset !== '0px') {
      issues.push('Portal容器inset设置异常');
    }
    if (style.position !== 'fixed') {
      issues.push('Portal容器position不是fixed');
    }
  });
  
  // 检查根容器是否有问题属性
  const root = document.getElementById('root');
  if (root) {
    const style = window.getComputedStyle(root);
    if (style.transform !== 'none') {
      issues.push('#root元素设置了transform属性');
    }
    if (style.filter !== 'none') {
      issues.push('#root元素设置了filter属性');
    }
    if (style.perspective !== 'none') {
      issues.push('#root元素设置了perspective属性');
    }
  }
  
  // 检查Dialog定位问题
  const dialogs = document.querySelectorAll('[role="dialog"]');
  dialogs.forEach(dialog => {
    const rect = dialog.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const offsetX = Math.abs(centerX - viewportCenterX);
    const offsetY = Math.abs(centerY - viewportCenterY);
    
    if (offsetX > 10 || offsetY > 10) {
      issues.push(`Dialog未正确居中 (偏移: ${Math.round(offsetX)}, ${Math.round(offsetY)})`);
    }
  });
  
  console.log('\n🚨 发现的问题:');
  if (issues.length === 0) {
    console.log('  ✅ 未发现明显问题');
  } else {
    issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  console.log('\n💡 建议修复方案:');
  console.log('  1. 确保Portal容器设置正确: position: fixed, inset: 0');
  console.log('  2. 移除根容器的transform、filter、perspective属性');
  console.log('  3. 使用vh/vw单位而非百分比进行Dialog定位');
  console.log('  4. 完全重置Dialog的inset属性避免冲突');
  console.log('  5. 确保z-index层级正确，避免Dialog被覆盖');
}

// 执行所有分析
try {
  analyzeRadixPortals();
  analyzeRootContainer();
  analyzeStackingContext();
  analyzeContainingBlocks();
  generateDiagnosticReport();
  
  console.log('\n✅ React Portal和DOM容器深度分析完成！');
} catch (error) {
  console.error('❌ 分析过程中出现错误:', error);
}