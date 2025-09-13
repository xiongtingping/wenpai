// 🔍 主页面调试脚本 - 直接在主应用页面运行
console.log('🚀 主页面调试脚本已加载');

// 等待页面完全加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startDebug);
} else {
  startDebug();
}

function startDebug() {
  console.log('🔍 开始主页面调试...');
  
  // 检查React根节点
  const reactRoot = document.querySelector('#root');
  if (reactRoot) {
    console.log('✅ 找到React根节点');
    
    // 检查React Fiber
    const fiberKey = Object.keys(reactRoot).find(key => key.startsWith('__reactFiber'));
    if (fiberKey) {
      console.log('✅ React应用已加载');
    } else {
      console.log('❌ React Fiber未找到');
    }
  } else {
    console.log('❌ 未找到React根节点');
  }
  
  // 查找历史记录按钮
  function findHistoryButton() {
    const buttons = Array.from(document.querySelectorAll('button'));
    const historyButton = buttons.find(btn => 
      btn.textContent && btn.textContent.includes('历史记录')
    );
    
    if (historyButton) {
      console.log('✅ 找到历史记录按钮');
      console.log('按钮文本:', historyButton.textContent.trim());
      console.log('按钮类名:', historyButton.className);
      console.log('按钮是否可点击:', !historyButton.disabled);
      
      // 添加点击监听器
      historyButton.addEventListener('click', function() {
        console.log('🔍 历史记录按钮被点击');
        
        // 检查状态变化
        setTimeout(() => {
          checkDialogElements();
        }, 100);
        
        setTimeout(() => {
          checkDialogElements();
        }, 500);
        
        setTimeout(() => {
          checkDialogElements();
        }, 1000);
      });
      
      return historyButton;
    } else {
      console.log('❌ 未找到历史记录按钮');
      console.log('页面上的所有按钮:', buttons.map(btn => btn.textContent?.trim()).filter(Boolean));
      return null;
    }
  }
  
  // 检查弹窗元素
  function checkDialogElements() {
    console.log('🔍 检查弹窗元素...');
    
    const selectors = [
      '[role="dialog"]',
      '.enhanced-history-dialog',
      '[class*="enhanced-history-dialog"]',
      '[data-radix-dialog-content]',
      '[data-radix-dialog-overlay]',
      '[data-state="open"]',
      '[data-radix-portal]'
    ];
    
    let foundAny = false;
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`✅ ${selector}: 找到 ${elements.length} 个元素`);
        foundAny = true;
        
        elements.forEach((el, index) => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          console.log(`  元素 ${index + 1}:`, {
            className: el.className,
            id: el.id,
            position: `${rect.top.toFixed(1)}, ${rect.left.toFixed(1)}`,
            size: `${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`,
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            zIndex: style.zIndex
          });
        });
      } else {
        console.log(`❌ ${selector}: 找到 0 个元素`);
      }
    });
    
    if (!foundAny) {
      console.log('❌ 没有找到任何弹窗相关元素');
    }
    
    return foundAny;
  }
  
  // 检查控制台错误
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    console.log('🚨 捕获到错误:', args);
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    console.log('⚠️ 捕获到警告:', args);
    originalWarn.apply(console, args);
  };
  
  // 监听未捕获的错误
  window.addEventListener('error', (e) => {
    console.log('🚨 JavaScript错误:', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.log('🚨 未处理的Promise拒绝:', e.reason);
  });
  
  // 初始检查
  setTimeout(() => {
    findHistoryButton();
    checkDialogElements();
  }, 1000);
  
  // 提供手动测试函数
  window.debugDialog = {
    findButton: findHistoryButton,
    checkElements: checkDialogElements,
    clickButton: function() {
      const btn = findHistoryButton();
      if (btn) {
        btn.click();
        console.log('✅ 已点击历史记录按钮');
      }
    }
  };
  
  console.log('✅ 调试工具已准备就绪');
  console.log('💡 使用 debugDialog.clickButton() 来测试按钮点击');
  console.log('💡 使用 debugDialog.checkElements() 来检查弹窗元素');
}
