/**
 * 🚨 全局Dialog检测器
 * 无论什么组件，只要页面上出现Dialog就立即分析
 */

console.log('🔍 全局Dialog检测器已启动...');

// 创建DOM观察器
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // 检查新增的节点
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node;
        
        // 检查是否是Dialog或包含Dialog
        if (element.matches && element.matches('[role="dialog"]')) {
          console.log('🚨🚨🚨 发现Dialog元素!', {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            位置: element.getBoundingClientRect(),
            计算样式: {
              position: getComputedStyle(element).position,
              top: getComputedStyle(element).top,
              left: getComputedStyle(element).left,
              transform: getComputedStyle(element).transform
            }
          });
        }
        
        // 检查子元素中是否有Dialog
        const dialogs = element.querySelectorAll ? element.querySelectorAll('[role="dialog"]') : [];
        dialogs.forEach((dialog, i) => {
          console.log(`🔍 发现子Dialog #${i + 1}:`, {
            tagName: dialog.tagName,
            className: dialog.className,
            id: dialog.id,
            位置: dialog.getBoundingClientRect(),
            计算样式: {
              position: getComputedStyle(dialog).position,
              top: getComputedStyle(dialog).top,
              left: getComputedStyle(dialog).left,
              transform: getComputedStyle(dialog).transform
            }
          });
        });
      }
    });
  });
});

// 开始观察
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 检查页面上所有可能的弹窗元素
setTimeout(() => {
  console.log('🔍 开始全面搜索页面上的弹窗元素...');
  
  // 搜索各种可能的弹窗选择器
  const selectors = [
    '[role="dialog"]',
    '.dialog',
    '.modal', 
    '.popup',
    '.quick-reference',
    '.overlay',
    '#quick-ref-content',
    '[id*="dialog"]',
    '[id*="modal"]',
    '[class*="dialog"]',
    '[class*="modal"]',
    '[class*="popup"]',
    '[style*="position: fixed"]',
    '[style*="z-index"]'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`🎯 找到 ${elements.length} 个匹配 "${selector}" 的元素:`);
      elements.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        console.log(`  ${i + 1}. ${el.tagName}`, {
          className: el.className,
          id: el.id,
          isVisible: el.offsetWidth > 0 && el.offsetHeight > 0,
          位置: rect,
          样式: {
            position: getComputedStyle(el).position,
            top: getComputedStyle(el).top,
            left: getComputedStyle(el).left,
            transform: getComputedStyle(el).transform,
            zIndex: getComputedStyle(el).zIndex
          }
        });
      });
    }
  });
}, 2000);

console.log('✅ 全局Dialog检测器已激活，正在监听所有Dialog变化...');

// 🚨 创建全局搜索函数，可以手动调用
window.findAllPopups = function() {
  console.log('🚨🚨🚨 手动搜索所有弹窗元素...');
  
  const selectors = [
    '[role="dialog"]',
    '.dialog',
    '.modal', 
    '.popup',
    '.quick-reference',
    '.overlay',
    '#quick-ref-content',
    '[id*="dialog"]',
    '[id*="modal"]',
    '[class*="dialog"]',
    '[class*="modal"]',
    '[class*="popup"]',
    '[style*="position: fixed"]',
    '[style*="position:fixed"]',
    '[style*="z-index"]'
  ];
  
  let found = 0;
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        found += elements.length;
        console.log(`🎯 找到 ${elements.length} 个匹配 "${selector}" 的元素:`);
        elements.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          console.log(`  ${i + 1}. ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ').join('.') : ''}`, {
            可见: isVisible,
            位置: `top:${Math.round(rect.top)} left:${Math.round(rect.left)} width:${Math.round(rect.width)} height:${Math.round(rect.height)}`,
            样式: {
              position: getComputedStyle(el).position,
              top: getComputedStyle(el).top,
              left: getComputedStyle(el).left,
              transform: getComputedStyle(el).transform,
              zIndex: getComputedStyle(el).zIndex
            }
          });
        });
      }
    } catch (e) {
      console.warn(`搜索 "${selector}" 时出错:`, e);
    }
  });
  
  if (found === 0) {
    console.log('❌ 没有找到任何弹窗元素！');
  } else {
    console.log(`✅ 总共找到 ${found} 个可能的弹窗元素`);
  }
  
  return found;
};

console.log('🔧 使用方法: 打开弹窗后在控制台运行 findAllPopups()');
console.log('🔧 或者运行 window.findAllPopups()');

// 立即运行一次
setTimeout(() => {
  console.log('🔄 自动运行弹窗搜索...');
  window.findAllPopups();
}, 3000);