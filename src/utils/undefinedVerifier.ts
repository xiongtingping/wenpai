/**
 * 🔍 undefinedundefined 问题验证器
 * 用于验证修复效果和检测残留问题
 */

export const verifyUndefinedFix = () => {
  console.log('🔍 开始验证 undefinedundefined 修复效果...');
  
  let issueCount = 0;
  const issues: string[] = [];
  
  // 1. 检查页面文本内容
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  textNodes.forEach((textNode, index) => {
    if (textNode.textContent) {
      if (textNode.textContent.includes('undefinedundefined')) {
        issueCount++;
        issues.push(`文本节点 #${index}: "${textNode.textContent}"`);
      }
      if (textNode.textContent.trim() === 'undefined') {
        issueCount++;
        issues.push(`单独的 undefined 文本节点 #${index}: "${textNode.textContent}"`);
      }
    }
  });
  
  // 2. 检查元素属性
  const allElements = document.querySelectorAll('*');
  allElements.forEach((element, index) => {
    ['title', 'alt', 'placeholder', 'value', 'aria-label'].forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        if (value.includes('undefinedundefined')) {
          issueCount++;
          issues.push(`元素 #${index} 的 ${attr} 属性: "${value}"`);
        }
        if (value === 'undefined') {
          issueCount++;
          issues.push(`元素 #${index} 的 ${attr} 属性为 undefined`);
        }
      }
    });
  });
  
  // 3. 检查控制台错误
  const originalConsoleError = console.error;
  let consoleErrorCount = 0;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('undefinedundefined') || message.includes('undefined')) {
      consoleErrorCount++;
      issues.push(`控制台错误: ${message}`);
    }
    originalConsoleError.apply(console, args);
  };
  
  // 4. 生成报告
  console.log('📊 验证结果:');
  console.log(`- 检查的文本节点数: ${textNodes.length}`);
  console.log(`- 检查的元素数: ${allElements.length}`);
  console.log(`- 发现的问题数: ${issueCount}`);
  
  if (issueCount === 0) {
    console.log('✅ 验证通过！没有发现 undefinedundefined 问题');
  } else {
    console.warn('❌ 验证失败！发现以下问题:');
    issues.forEach((issue, index) => {
      console.warn(`  ${index + 1}. ${issue}`);
    });
  }
  
  return {
    success: issueCount === 0,
    issueCount,
    issues,
    textNodesChecked: textNodes.length,
    elementsChecked: allElements.length
  };
};

// 在开发环境中自动验证
if (import.meta.env.DEV) {
  // 页面加载完成后验证
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        verifyUndefinedFix();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      verifyUndefinedFix();
    }, 2000);
  }
  
  // 暴露到全局，方便手动调用
  (window as any).verifyUndefinedFix = verifyUndefinedFix;
}

export default verifyUndefinedFix;
