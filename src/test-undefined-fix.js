/**
 * 🛡️ undefined拼接修复验证脚本
 * 在浏览器控制台中运行此脚本来验证修复效果
 */

// 检测页面中是否存在undefinedundefined
function detectUndefinedIssues() {
  console.log('🔍 开始检测undefined拼接问题...');
  
  const issues = [];
  
  // 检查所有文本节点
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent && node.textContent.includes('undefinedundefined')) {
      issues.push({
        type: 'text',
        content: node.textContent,
        element: node.parentElement
      });
    }
  }
  
  // 检查所有元素的属性
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    ['title', 'alt', 'placeholder', 'value'].forEach(attr => {
      if (element.getAttribute(attr) === 'undefined') {
        issues.push({
          type: 'attribute',
          attribute: attr,
          element: element
        });
      }
    });
  });
  
  if (issues.length === 0) {
    console.log('✅ 未发现undefined拼接问题');
  } else {
    console.log(`❌ 发现 ${issues.length} 个undefined拼接问题:`, issues);
  }
  
  return issues;
}

// 监控Guard弹窗的undefined问题
function monitorGuardUndefined() {
  console.log('👀 开始监控Guard弹窗的undefined问题...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const guardElement = node.querySelector && node.querySelector('.authing-guard');
            if (guardElement || node.classList?.contains('authing-guard')) {
              console.log('🔍 检测到Guard弹窗，检查undefined问题...');
              setTimeout(() => {
                const issues = detectUndefinedIssues();
                if (issues.length > 0) {
                  console.log('🚨 Guard弹窗中发现undefined问题，需要修复');
                } else {
                  console.log('✅ Guard弹窗中未发现undefined问题');
                }
              }, 500);
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
  
  return observer;
}

// 立即执行检测
detectUndefinedIssues();

// 开始监控
const observer = monitorGuardUndefined();

console.log('🛡️ undefined拼接检测脚本已启动');
console.log('📝 使用 detectUndefinedIssues() 手动检测');
console.log('🛑 使用 observer.disconnect() 停止监控');
