/**
 * 🔍 快速引用Dialog深度诊断脚本
 * 用于排查弹窗不可见的根本原因
 */

function deepDiagnoseDialog() {
  console.log('🔍 开始深度诊断快速引用Dialog问题...');
  
  const report = {
    timestamp: new Date().toISOString(),
    domStructure: {},
    cssAnalysis: {},
    jsErrors: [],
    recommendations: []
  };

  // 1. 检查所有可能的Dialog相关DOM元素
  console.log('📋 步骤1: 检查DOM结构...');
  
  const selectors = [
    '[role="dialog"]',
    '[data-radix-dialog-content]',
    '[data-radix-portal]',
    '.quick-reference-dialog',
    '[class*="quick-reference"]',
    '[data-state="open"]',
    '[data-state="closed"]'
  ];
  
  report.domStructure.elements = {};
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    report.domStructure.elements[selector] = {
      count: elements.length,
      elements: Array.from(elements).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        style: el.getAttribute('style'),
        dataState: el.getAttribute('data-state'),
        role: el.getAttribute('role'),
        visible: el.offsetWidth > 0 && el.offsetHeight > 0,
        boundingRect: el.getBoundingClientRect()
      }))
    };
    
    if (elements.length > 0) {
      console.log(`✅ 找到 ${elements.length} 个 ${selector} 元素:`, elements);
    } else {
      console.log(`❌ 未找到 ${selector} 元素`);
    }
  });

  // 2. 检查Portal容器
  console.log('📋 步骤2: 检查Portal容器...');
  const portals = document.querySelectorAll('[data-radix-portal]');
  report.domStructure.portals = Array.from(portals).map(portal => {
    const children = portal.children;
    return {
      innerHTML: portal.innerHTML.substring(0, 200) + '...',
      childCount: children.length,
      children: Array.from(children).map(child => ({
        tagName: child.tagName,
        className: child.className,
        role: child.getAttribute('role'),
        dataState: child.getAttribute('data-state')
      }))
    };
  });
  console.log('🏗️ Portal结构:', report.domStructure.portals);

  // 3. 检查组件状态
  console.log('📋 步骤3: 检查React组件状态...');
  
  // 尝试获取React fiber信息
  const dialogElement = document.querySelector('[role="dialog"]') || 
                       document.querySelector('[data-radix-dialog-content]');
  
  if (dialogElement) {
    const fiber = dialogElement._reactInternalFiber || 
                  dialogElement._reactInternals ||
                  Object.keys(dialogElement).find(key => key.startsWith('__reactInternalInstance'));
    
    if (fiber) {
      console.log('⚛️ 找到React Fiber:', fiber);
      report.domStructure.reactFiber = 'Found';
    } else {
      console.log('⚛️ 未找到React Fiber');
      report.domStructure.reactFiber = 'Not Found';
    }
  }

  // 4. 检查CSS层叠和优先级
  console.log('📋 步骤4: 分析CSS...');
  
  if (dialogElement) {
    const computedStyle = window.getComputedStyle(dialogElement);
    const criticalStyles = [
      'position', 'display', 'visibility', 'opacity', 'z-index',
      'top', 'left', 'right', 'bottom', 'transform', 'inset',
      'width', 'height', 'max-width', 'max-height',
      'overflow', 'clip-path', 'mask', 'filter'
    ];
    
    report.cssAnalysis.computedStyles = {};
    criticalStyles.forEach(prop => {
      report.cssAnalysis.computedStyles[prop] = computedStyle.getPropertyValue(prop);
    });
    
    console.log('🎨 关键CSS属性:', report.cssAnalysis.computedStyles);
    
    // 检查CSS规则
    const rules = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      try {
        const styleSheet = document.styleSheets[i];
        if (styleSheet.cssRules) {
          for (let j = 0; j < styleSheet.cssRules.length; j++) {
            const rule = styleSheet.cssRules[j];
            if (rule.selectorText && rule.selectorText.includes('dialog')) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText.substring(0, 200) + '...',
                href: styleSheet.href
              });
            }
          }
        }
      } catch (e) {
        console.warn('CSS规则检查失败:', e);
      }
    }
    
    report.cssAnalysis.matchingRules = rules;
    console.log('📜 匹配的CSS规则:', rules);
  }

  // 5. 检查JavaScript错误
  console.log('📋 步骤5: 检查JavaScript错误...');
  
  const originalError = window.console.error;
  const errors = [];
  
  window.console.error = function(...args) {
    errors.push({
      timestamp: new Date().toISOString(),
      message: args.join(' ')
    });
    originalError.apply(console, args);
  };
  
  // 恢复原始error函数
  setTimeout(() => {
    window.console.error = originalError;
  }, 1000);
  
  report.jsErrors = errors;

  // 6. 检查特定的Radix UI状态
  console.log('📋 步骤6: 检查Radix UI状态...');
  
  const radixElements = document.querySelectorAll('[data-radix-dialog-content], [data-radix-dialog-overlay]');
  report.domStructure.radixUI = Array.from(radixElements).map(el => {
    const style = window.getComputedStyle(el);
    return {
      element: el.tagName,
      dataState: el.getAttribute('data-state'),
      ariaHidden: el.getAttribute('aria-hidden'),
      style: {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
        zIndex: style.zIndex
      },
      rect: el.getBoundingClientRect()
    };
  });
  
  console.log('🎭 Radix UI状态:', report.domStructure.radixUI);

  // 7. 检查是否有样式冲突
  console.log('📋 步骤7: 检查样式冲突...');
  
  if (dialogElement) {
    const inlineStyle = dialogElement.getAttribute('style');
    const classList = Array.from(dialogElement.classList);
    
    report.cssAnalysis.inlineStyle = inlineStyle;
    report.cssAnalysis.classList = classList;
    
    console.log('🏷️ 内联样式:', inlineStyle);
    console.log('🏷️ CSS类列表:', classList);
    
    // 检查可能冲突的样式
    const conflictingProps = ['display: none', 'visibility: hidden', 'opacity: 0'];
    const hasConflicts = conflictingProps.some(prop => 
      inlineStyle && inlineStyle.includes(prop)
    );
    
    if (hasConflicts) {
      report.recommendations.push('发现内联样式冲突，需要清除隐藏属性');
    }
  }

  // 8. 生成修复建议
  console.log('📋 步骤8: 生成修复建议...');
  
  if (report.domStructure.elements['[role="dialog"]'].count === 0) {
    report.recommendations.push('🚨 未找到[role="dialog"]元素，Dialog可能未渲染');
  }
  
  if (report.domStructure.portals.length === 0) {
    report.recommendations.push('🚨 未找到Portal容器，Dialog可能未正确挂载');
  }
  
  const dialogData = report.domStructure.elements['[role="dialog"]'];
  if (dialogData.count > 0 && !dialogData.elements[0].visible) {
    report.recommendations.push('🚨 Dialog元素存在但不可见，检查CSS隐藏属性');
  }

  // 输出完整报告
  console.log('📊 深度诊断报告:', report);
  
  // 提供即时修复建议
  if (report.recommendations.length > 0) {
    console.log('💡 修复建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  return report;
}

// 自动运行诊断
console.log('🔧 深度诊断工具已加载');
console.log('📋 使用方法: 运行 deepDiagnoseDialog() 进行深度诊断');

// 立即运行一次基础检查
setTimeout(() => {
  console.log('🔍 执行初始检查...');
  deepDiagnoseDialog();
}, 1000);

window.deepDiagnoseDialog = deepDiagnoseDialog;