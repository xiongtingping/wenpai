/**
 * 🚨 浏览器端历史记录弹窗紧急诊断脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台中运行：runEmergencyDiagnosis()
 * 2. 或者在页面中添加：<script src="/emergency-dialog-diagnosis.js"></script>
 */

(function() {
  'use strict';

  console.log('🚨 历史记录弹窗紧急诊断脚本已加载');

  // 诊断配置
  const CONFIG = {
    maxRetries: 15,
    checkInterval: 100,
    monitorDuration: 8000,
    debugMode: true
  };

  // 诊断结果
  const results = {
    cssRules: [],
    computedStyles: {},
    fixes: [],
    issues: []
  };

  /**
   * 🔍 深度CSS分析
   */
  function analyzeCSSConflicts() {
    console.log('🔍 开始CSS冲突分析...');
    
    // 查找Dialog元素
    const selectors = [
      '[role="dialog"].enhanced-history-dialog',
      '[role="dialog"]',
      '[data-radix-dialog-content].enhanced-history-dialog',
      '[data-radix-dialog-content]',
      '.enhanced-history-dialog'
    ];
    
    let dialogElement = null;
    let usedSelector = '';
    
    for (const selector of selectors) {
      dialogElement = document.querySelector(selector);
      if (dialogElement) {
        usedSelector = selector;
        console.log(`✅ 找到Dialog元素: ${selector}`);
        break;
      }
    }
    
    if (!dialogElement) {
      console.log('❌ 未找到Dialog元素');
      results.issues.push('Dialog元素不存在');
      return null;
    }
    
    // 分析计算样式
    const computedStyle = window.getComputedStyle(dialogElement);
    const criticalStyles = {
      position: computedStyle.position,
      top: computedStyle.top,
      left: computedStyle.left,
      right: computedStyle.right,
      bottom: computedStyle.bottom,
      transform: computedStyle.transform,
      zIndex: computedStyle.zIndex,
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      width: computedStyle.width,
      height: computedStyle.height,
      maxWidth: computedStyle.maxWidth,
      maxHeight: computedStyle.maxHeight,
      margin: computedStyle.margin,
      inset: computedStyle.inset
    };
    
    console.log('📊 当前计算样式:', criticalStyles);
    results.computedStyles = criticalStyles;
    
    // 检查是否正确定位
    const isCorrectlyPositioned = 
      criticalStyles.position === 'fixed' &&
      criticalStyles.top === '50%' &&
      criticalStyles.left === '50%' &&
      criticalStyles.transform.includes('translate(-50%, -50%)');
    
    if (!isCorrectlyPositioned) {
      results.issues.push('定位不正确');
      console.log('❌ 定位不正确:', {
        expected: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        actual: { 
          position: criticalStyles.position, 
          top: criticalStyles.top, 
          left: criticalStyles.left, 
          transform: criticalStyles.transform 
        }
      });
    } else {
      console.log('✅ 定位正确');
    }
    
    return { element: dialogElement, selector: usedSelector, styles: criticalStyles };
  }

  /**
   * 🛠️ 强制修复定位
   */
  function forceFixPositioning(dialogInfo) {
    if (!dialogInfo || !dialogInfo.element) return false;
    
    console.log('🛠️ 开始强制修复定位...');
    const dialogElement = dialogInfo.element;
    
    // 移除冲突类名
    const conflictClasses = [
      'slide-in-from-left-1/2',
      'slide-in-from-top-[48%]',
      'slide-out-to-left-1/2',
      'slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2',
      'data-[state=open]:slide-in-from-top-[48%]',
      'absolute',
      'relative',
      'static'
    ];
    
    conflictClasses.forEach(className => {
      if (dialogElement.classList.contains(className)) {
        dialogElement.classList.remove(className);
        console.log(`🗑️ 移除冲突类: ${className}`);
      }
    });
    
    // 清除内联样式
    const stylesToClear = ['top', 'left', 'right', 'bottom', 'transform', 'inset', 'translate', 'margin'];
    stylesToClear.forEach(prop => {
      if (dialogElement.style[prop]) {
        dialogElement.style.removeProperty(prop);
        console.log(`🗑️ 清除样式: ${prop}`);
      }
    });
    
    // 强制应用正确样式
    const forceStyles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      zIndex: '1055',
      maxWidth: 'min(95vw, 1024px)',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      visibility: 'visible',
      opacity: '1',
      pointerEvents: 'auto',
      margin: '0',
      inset: 'auto'
    };
    
    Object.entries(forceStyles).forEach(([prop, value]) => {
      dialogElement.style.setProperty(prop, value, 'important');
    });
    
    console.log('✅ 强制样式已应用');
    results.fixes.push('强制定位样式已应用');
    
    // 验证修复效果
    setTimeout(() => {
      const newComputedStyle = window.getComputedStyle(dialogElement);
      const isFixed = 
        newComputedStyle.position === 'fixed' &&
        newComputedStyle.top === '50%' &&
        newComputedStyle.left === '50%' &&
        newComputedStyle.transform.includes('translate(-50%, -50%)');
      
      if (isFixed) {
        console.log('✅ 修复验证成功');
        results.fixes.push('修复验证成功');
      } else {
        console.log('❌ 修复验证失败');
        results.issues.push('修复验证失败');
        console.log('修复后样式:', {
          position: newComputedStyle.position,
          top: newComputedStyle.top,
          left: newComputedStyle.left,
          transform: newComputedStyle.transform
        });
      }
    }, 100);
    
    return true;
  }

  /**
   * 🔄 实时监控
   */
  function startRealTimeMonitoring() {
    console.log('🔄 启动实时监控...');
    
    let checkCount = 0;
    const maxChecks = CONFIG.monitorDuration / CONFIG.checkInterval;
    
    const monitor = setInterval(() => {
      checkCount++;
      
      if (checkCount > maxChecks) {
        clearInterval(monitor);
        console.log('⏰ 监控结束');
        printFinalReport();
        return;
      }
      
      const dialogElement = document.querySelector('[role="dialog"].enhanced-history-dialog') ||
                            document.querySelector('[role="dialog"]');
      
      if (!dialogElement) {
        if (checkCount > 10) {
          clearInterval(monitor);
          console.log('❌ Dialog元素消失，停止监控');
          printFinalReport();
        }
        return;
      }
      
      const computedStyle = window.getComputedStyle(dialogElement);
      const isCorrect = 
        computedStyle.position === 'fixed' &&
        computedStyle.top === '50%' &&
        computedStyle.left === '50%' &&
        computedStyle.transform.includes('translate(-50%, -50%)');
      
      if (!isCorrect) {
        console.log(`🔧 检测到定位偏移 (第${checkCount}次检查)，重新修复...`);
        console.log('当前样式:', {
          position: computedStyle.position,
          top: computedStyle.top,
          left: computedStyle.left,
          transform: computedStyle.transform
        });
        
        forceFixPositioning({ element: dialogElement });
        results.fixes.push(`第${checkCount}次自动修复`);
      } else if (checkCount % 20 === 0) {
        console.log(`✅ 定位正确 (第${checkCount}次检查)`);
      }
      
    }, CONFIG.checkInterval);
  }

  /**
   * 📊 生成最终报告
   */
  function printFinalReport() {
    console.log('\n📊 ===== 最终诊断报告 =====');
    console.log('🎯 计算样式:', results.computedStyles);
    console.log('🛠️ 修复次数:', results.fixes.length);
    console.log('❌ 问题数量:', results.issues.length);
    console.log('📝 修复记录:', results.fixes);
    console.log('⚠️ 问题记录:', results.issues);
    
    // 最终状态检查
    const finalDialog = document.querySelector('[role="dialog"].enhanced-history-dialog') ||
                        document.querySelector('[role="dialog"]');
    
    if (finalDialog) {
      const finalStyle = window.getComputedStyle(finalDialog);
      const finalSuccess = 
        finalStyle.position === 'fixed' &&
        finalStyle.top === '50%' &&
        finalStyle.left === '50%' &&
        finalStyle.transform.includes('translate(-50%, -50%)');
      
      console.log('\n🎯 最终状态:');
      console.log('- Position:', finalStyle.position);
      console.log('- Top:', finalStyle.top);
      console.log('- Left:', finalStyle.left);
      console.log('- Transform:', finalStyle.transform);
      console.log('- 修复状态:', finalSuccess ? '✅ 成功' : '❌ 失败');
      
      if (finalSuccess) {
        console.log('\n🎉 历史记录弹窗定位修复完成！');
      } else {
        console.log('\n⚠️ 历史记录弹窗定位仍有问题，需要进一步处理');
      }
    } else {
      console.log('\n❌ Dialog元素不存在');
    }
    
    console.log('===== 诊断完成 =====\n');
  }

  /**
   * 🚀 主执行函数
   */
  function runEmergencyDiagnosis() {
    console.log('🚀 开始历史记录弹窗紧急诊断...');
    
    // 重置结果
    results.cssRules = [];
    results.computedStyles = {};
    results.fixes = [];
    results.issues = [];
    
    // 等待DOM稳定
    setTimeout(() => {
      const dialogInfo = analyzeCSSConflicts();
      
      if (dialogInfo) {
        forceFixPositioning(dialogInfo);
        
        // 延迟启动监控
        setTimeout(() => {
          startRealTimeMonitoring();
        }, 500);
      } else {
        console.log('❌ 无法找到Dialog元素，等待元素出现...');
        
        // 等待Dialog出现
        let waitCount = 0;
        const waitForDialog = setInterval(() => {
          waitCount++;
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            clearInterval(waitForDialog);
            console.log('✅ Dialog元素出现，重新开始诊断');
            runEmergencyDiagnosis();
          } else if (waitCount > 50) {
            clearInterval(waitForDialog);
            console.log('⏰ 等待超时，诊断结束');
            printFinalReport();
          }
        }, 200);
      }
    }, 100);
  }

  // 导出到全局
  window.runEmergencyDiagnosis = runEmergencyDiagnosis;
  window.dialogDiagnosisResults = results;

  console.log('🎯 紧急诊断脚本已准备就绪');
  console.log('💡 使用方法: runEmergencyDiagnosis()');

})();
