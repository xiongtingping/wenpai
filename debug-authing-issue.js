/**
 * 🔍 Authing登录弹窗问题调试脚本
 * 专门用于诊断"undefinedundefined"弹窗问题
 */

console.log('🔍 开始Authing登录弹窗问题调试...');

// 1. 检查Guard实例
function checkGuardInstances() {
  console.log('\n📋 检查Guard实例:');
  
  // 检查全局Guard实例
  if (window.guard) {
    console.log('✅ 发现全局Guard实例:', window.guard);
    console.log('   类型:', typeof window.guard);
    console.log('   方法:', Object.getOwnPropertyNames(window.guard));
  } else {
    console.log('❌ 未发现全局Guard实例');
  }
  
  // 检查DOM中的Guard容器
  const guardContainers = [
    '#authing_guard_container',
    '#authing-guard-container-v4',
    '.authing-ant-modal-root',
    '.authing-guard-container'
  ];
  
  guardContainers.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      console.log(`✅ 发现Guard容器: ${selector}`);
      console.log('   可见性:', window.getComputedStyle(element).display !== 'none');
      console.log('   z-index:', window.getComputedStyle(element).zIndex);
    }
  });
}

// 2. 检查undefined文本
function checkUndefinedText() {
  console.log('\n🚨 检查页面中的undefined文本:');
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        return node.textContent.includes('undefined') ? 
          NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  let undefinedCount = 0;
  let node;
  while (node = walker.nextNode()) {
    undefinedCount++;
    console.log(`🚨 发现undefined文本 #${undefinedCount}:`);
    console.log('   内容:', node.textContent);
    console.log('   父元素:', node.parentElement?.tagName);
    console.log('   父元素类名:', node.parentElement?.className);
    
    if (undefinedCount > 10) {
      console.log('⚠️ 发现过多undefined文本，停止检查');
      break;
    }
  }
  
  if (undefinedCount === 0) {
    console.log('✅ 未发现undefined文本');
  }
}

// 3. 检查弹窗状态
function checkModalStatus() {
  console.log('\n🔍 检查弹窗状态:');
  
  // 检查所有可能的弹窗元素
  const modalSelectors = [
    '.ant-modal-mask',
    '.ant-modal-wrap',
    '.authing-ant-modal-root',
    '[role="dialog"]',
    '.modal',
    '[class*="modal"]'
  ];
  
  let visibleModals = 0;
  modalSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const style = window.getComputedStyle(element);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
      
      if (isVisible) {
        visibleModals++;
        console.log(`✅ 发现可见弹窗: ${selector}`);
        console.log('   内容预览:', element.textContent?.substring(0, 100));
        console.log('   z-index:', style.zIndex);
        
        // 检查是否包含undefined
        if (element.textContent?.includes('undefined')) {
          console.log('🚨 该弹窗包含undefined文本!');
        }
      }
    });
  });
  
  console.log(`总计可见弹窗: ${visibleModals}`);
}

// 4. 检查事件监听器
function checkEventListeners() {
  console.log('\n🎧 检查事件监听器:');
  
  // 检查登录按钮
  const loginButtons = document.querySelectorAll('button');
  let loginButtonCount = 0;
  
  loginButtons.forEach(button => {
    const text = button.textContent?.trim();
    if (text?.includes('登录') || text?.includes('Login')) {
      loginButtonCount++;
      console.log(`🔘 登录按钮 #${loginButtonCount}: "${text}"`);
      
      // 检查点击事件
      const hasClickHandler = button.onclick || 
                             button.addEventListener || 
                             button.getAttribute('onclick');
      console.log('   有点击处理器:', !!hasClickHandler);
    }
  });
}

// 5. 模拟登录点击测试
function simulateLoginClick() {
  console.log('\n🧪 模拟登录点击测试:');
  
  const loginButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('登录')
  );
  
  if (loginButton) {
    console.log('✅ 找到登录按钮，准备模拟点击...');
    
    // 监听DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.textContent?.includes('undefined')) {
                console.log('🚨 检测到新增的undefined元素!');
                console.log('   元素:', element);
                console.log('   内容:', element.textContent);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 延迟点击，给用户时间看到日志
    setTimeout(() => {
      console.log('🖱️ 执行模拟点击...');
      loginButton.click();
      
      // 5秒后停止监听
      setTimeout(() => {
        observer.disconnect();
        console.log('🔍 停止DOM变化监听');
      }, 5000);
    }, 2000);
    
  } else {
    console.log('❌ 未找到登录按钮');
  }
}

// 6. 主函数
function runDiagnostics() {
  console.log('🔍 Authing登录弹窗问题诊断报告');
  console.log('='.repeat(50));
  
  checkGuardInstances();
  checkUndefinedText();
  checkModalStatus();
  checkEventListeners();
  
  console.log('\n🧪 是否要模拟登录点击测试? (将在2秒后自动执行)');
  setTimeout(simulateLoginClick, 2000);
}

// 页面加载完成后运行诊断
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDiagnostics);
} else {
  runDiagnostics();
}

// 暴露到全局，方便手动调用
window.debugAuthing = {
  checkGuardInstances,
  checkUndefinedText,
  checkModalStatus,
  checkEventListeners,
  simulateLoginClick,
  runDiagnostics
};

console.log('🔧 调试工具已加载，可通过 window.debugAuthing 访问各种调试函数');
