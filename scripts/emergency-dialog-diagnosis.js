/**
 * 🚨 历史记录弹窗紧急诊断和修复脚本
 * 
 * 目标：彻底解决弹窗定位异常问题
 * 策略：多层诊断 + 强制修复 + 实时验证
 */

console.log('🚨 启动历史记录弹窗紧急诊断...');

// 诊断配置
const DIAGNOSIS_CONFIG = {
  maxRetries: 10,
  checkInterval: 100,
  forceFixDelay: 500,
  debugMode: true
};

// 诊断结果存储
const diagnosisResults = {
  cssRules: [],
  computedStyles: {},
  domStructure: {},
  conflicts: [],
  fixes: []
};

/**
 * 🔍 第一步：深度CSS诊断
 */
function deepCSSAnalysis() {
  console.log('🔍 开始深度CSS分析...');
  
  // 查找所有可能的Dialog元素
  const dialogSelectors = [
    '[role="dialog"].enhanced-history-dialog',
    '[role="dialog"]',
    '[data-radix-dialog-content].enhanced-history-dialog',
    '[data-radix-dialog-content]',
    '.enhanced-history-dialog'
  ];
  
  let dialogElement = null;
  for (const selector of dialogSelectors) {
    dialogElement = document.querySelector(selector);
    if (dialogElement) {
      console.log(`✅ 找到Dialog元素: ${selector}`);
      break;
    }
  }
  
  if (!dialogElement) {
    console.log('❌ 未找到Dialog元素');
    return null;
  }
  
  // 获取计算样式
  const computedStyle = window.getComputedStyle(dialogElement);
  const criticalStyles = {
    position: computedStyle.position,
    top: computedStyle.top,
    left: computedStyle.left,
    transform: computedStyle.transform,
    zIndex: computedStyle.zIndex,
    display: computedStyle.display,
    visibility: computedStyle.visibility,
    opacity: computedStyle.opacity,
    width: computedStyle.width,
    height: computedStyle.height,
    maxWidth: computedStyle.maxWidth,
    maxHeight: computedStyle.maxHeight
  };
  
  console.log('📊 关键样式分析:', criticalStyles);
  diagnosisResults.computedStyles = criticalStyles;
  
  // 检查CSS规则冲突
  const allRules = Array.from(document.styleSheets).flatMap(sheet => {
    try {
      return Array.from(sheet.cssRules || []);
    } catch (e) {
      return [];
    }
  });
  
  const conflictingRules = allRules.filter(rule => {
    if (rule.type === CSSRule.STYLE_RULE) {
      const selectorText = rule.selectorText || '';
      return selectorText.includes('dialog') || 
             selectorText.includes('[role="dialog"]') ||
             selectorText.includes('[data-radix-dialog-content]');
    }
    return false;
  });
  
  console.log(`🔍 发现 ${conflictingRules.length} 个可能冲突的CSS规则`);
  diagnosisResults.cssRules = conflictingRules.map(rule => ({
    selector: rule.selectorText,
    cssText: rule.cssText
  }));
  
  return dialogElement;
}

/**
 * 🛠️ 第二步：强制修复定位
 */
function forceFixPositioning(dialogElement) {
  console.log('🛠️ 开始强制修复定位...');
  
  if (!dialogElement) return false;
  
  // 移除所有可能冲突的类名
  const conflictClasses = [
    'slide-in-from-left-1/2',
    'slide-in-from-top-[48%]',
    'slide-out-to-left-1/2',
    'slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2',
    'data-[state=open]:slide-in-from-top-[48%]'
  ];
  
  conflictClasses.forEach(className => {
    dialogElement.classList.remove(className);
  });
  
  // 清除内联样式
  const stylesToClear = ['top', 'left', 'right', 'bottom', 'transform', 'inset'];
  stylesToClear.forEach(prop => {
    dialogElement.style.removeProperty(prop);
  });
  
  // 强制应用正确的定位样式
  const forceStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '1055',
    maxWidth: 'min(95vw, 1024px)',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    visibility: 'visible',
    opacity: '1',
    pointerEvents: 'auto'
  };
  
  Object.entries(forceStyles).forEach(([prop, value]) => {
    dialogElement.style.setProperty(prop, value, 'important');
  });
  
  console.log('✅ 强制样式已应用');
  diagnosisResults.fixes.push('强制定位样式已应用');
  
  return true;
}

/**
 * 🔄 第三步：实时监控和修复
 */
function startRealTimeMonitoring() {
  console.log('🔄 启动实时监控...');
  
  let monitoringActive = true;
  let checkCount = 0;
  
  const monitor = setInterval(() => {
    checkCount++;
    
    if (checkCount > DIAGNOSIS_CONFIG.maxRetries) {
      clearInterval(monitor);
      console.log('⏰ 监控超时，停止监控');
      return;
    }
    
    const dialogElement = document.querySelector('[role="dialog"].enhanced-history-dialog') ||
                          document.querySelector('[role="dialog"]');
    
    if (!dialogElement) {
      if (checkCount > 5) {
        clearInterval(monitor);
        console.log('❌ Dialog元素消失，停止监控');
      }
      return;
    }
    
    const computedStyle = window.getComputedStyle(dialogElement);
    const currentTop = computedStyle.top;
    const currentLeft = computedStyle.left;
    const currentTransform = computedStyle.transform;
    
    // 检查是否偏离正确位置
    const isCorrectlyPositioned = 
      currentTop === '50%' && 
      currentLeft === '50%' && 
      currentTransform.includes('translate(-50%, -50%)');
    
    if (!isCorrectlyPositioned) {
      console.log(`🔧 检测到定位偏移，重新修复... (第${checkCount}次检查)`);
      console.log(`当前位置: top=${currentTop}, left=${currentLeft}, transform=${currentTransform}`);
      
      forceFixPositioning(dialogElement);
      diagnosisResults.fixes.push(`第${checkCount}次自动修复`);
    } else {
      console.log(`✅ 定位正确 (第${checkCount}次检查)`);
    }
    
  }, DIAGNOSIS_CONFIG.checkInterval);
  
  // 5秒后停止监控
  setTimeout(() => {
    clearInterval(monitor);
    monitoringActive = false;
    console.log('🏁 实时监控结束');
    printDiagnosisReport();
  }, 5000);
}

/**
 * 📊 第四步：生成诊断报告
 */
function printDiagnosisReport() {
  console.log('\n📊 ===== 诊断报告 =====');
  console.log('🎯 计算样式:', diagnosisResults.computedStyles);
  console.log('🔍 CSS规则数量:', diagnosisResults.cssRules.length);
  console.log('🛠️ 修复次数:', diagnosisResults.fixes.length);
  console.log('📝 修复记录:', diagnosisResults.fixes);
  
  // 检查最终状态
  const finalDialog = document.querySelector('[role="dialog"].enhanced-history-dialog') ||
                      document.querySelector('[role="dialog"]');
  
  if (finalDialog) {
    const finalStyle = window.getComputedStyle(finalDialog);
    console.log('\n🎯 最终状态检查:');
    console.log('- Position:', finalStyle.position);
    console.log('- Top:', finalStyle.top);
    console.log('- Left:', finalStyle.left);
    console.log('- Transform:', finalStyle.transform);
    console.log('- Z-Index:', finalStyle.zIndex);
    
    const isFixed = finalStyle.position === 'fixed' &&
                   finalStyle.top === '50%' &&
                   finalStyle.left === '50%' &&
                   finalStyle.transform.includes('translate(-50%, -50%)');
    
    console.log(isFixed ? '✅ 修复成功！' : '❌ 修复失败！');
  } else {
    console.log('❌ Dialog元素不存在');
  }
  
  console.log('===== 诊断完成 =====\n');
}

/**
 * 🚀 主执行函数
 */
function runEmergencyDiagnosis() {
  console.log('🚀 开始紧急诊断流程...');
  
  // 等待DOM稳定
  setTimeout(() => {
    const dialogElement = deepCSSAnalysis();
    
    if (dialogElement) {
      forceFixPositioning(dialogElement);
      
      // 延迟启动监控，确保修复生效
      setTimeout(() => {
        startRealTimeMonitoring();
      }, DIAGNOSIS_CONFIG.forceFixDelay);
    } else {
      console.log('❌ 无法找到Dialog元素，等待元素出现...');
      
      // 等待Dialog出现
      const waitForDialog = setInterval(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          clearInterval(waitForDialog);
          console.log('✅ Dialog元素出现，重新开始诊断');
          runEmergencyDiagnosis();
        }
      }, 200);
      
      // 10秒后停止等待
      setTimeout(() => {
        clearInterval(waitForDialog);
        console.log('⏰ 等待超时，诊断结束');
      }, 10000);
    }
  }, 100);
}

// 导出函数供外部调用
window.runEmergencyDiagnosis = runEmergencyDiagnosis;

// 如果页面已加载，立即执行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runEmergencyDiagnosis);
} else {
  runEmergencyDiagnosis();
}

console.log('🎯 紧急诊断脚本已加载，可通过 runEmergencyDiagnosis() 手动执行');
