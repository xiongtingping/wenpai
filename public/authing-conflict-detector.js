/**
 * 🚨 Authing Guard冲突实时检测器
 * 
 * 在浏览器中实时监控Authing Guard与历史记录弹窗的冲突情况
 * 使用方法：在控制台运行 startAuthingConflictMonitor()
 */

(function() {
  'use strict';

  console.log('🚨 Authing Guard冲突检测器已加载');

  // 监控状态
  let monitoringActive = false;
  let monitorInterval = null;
  let conflictHistory = [];

  /**
   * 检测Authing Guard是否存在
   */
  function detectAuthingGuard() {
    const authingSelectors = [
      '.authing-ant-modal-root',
      '.authing-ant-modal-wrap',
      '.authing-ant-modal',
      '[class*="authing"]',
      '[id*="authing"]'
    ];

    const foundElements = [];
    authingSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements.push({
          selector: selector,
          count: elements.length,
          elements: Array.from(elements)
        });
      }
    });

    return {
      exists: foundElements.length > 0,
      elements: foundElements
    };
  }

  /**
   * 检测历史记录弹窗是否存在
   */
  function detectHistoryDialog() {
    const dialogSelectors = [
      '[role="dialog"].enhanced-history-dialog',
      '[role="dialog"]',
      '[data-radix-dialog-content].enhanced-history-dialog',
      '.enhanced-history-dialog'
    ];

    let dialogElement = null;
    let usedSelector = '';

    for (const selector of dialogSelectors) {
      dialogElement = document.querySelector(selector);
      if (dialogElement) {
        usedSelector = selector;
        break;
      }
    }

    if (!dialogElement) {
      return { exists: false };
    }

    const computedStyle = window.getComputedStyle(dialogElement);
    return {
      exists: true,
      element: dialogElement,
      selector: usedSelector,
      styles: {
        position: computedStyle.position,
        top: computedStyle.top,
        left: computedStyle.left,
        transform: computedStyle.transform,
        zIndex: computedStyle.zIndex,
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity
      }
    };
  }

  /**
   * 分析冲突情况
   */
  function analyzeConflict() {
    const authingStatus = detectAuthingGuard();
    const dialogStatus = detectHistoryDialog();

    const analysis = {
      timestamp: new Date().toISOString(),
      authing: authingStatus,
      dialog: dialogStatus,
      conflict: false,
      issues: [],
      recommendations: []
    };

    // 如果两者都存在，检查冲突
    if (authingStatus.exists && dialogStatus.exists) {
      analysis.conflict = true;

      // 检查z-index冲突
      const dialogZIndex = parseInt(dialogStatus.styles.zIndex) || 0;
      if (dialogZIndex < 1000000) {
        analysis.issues.push({
          type: 'z-index',
          severity: 'high',
          message: `历史记录弹窗z-index (${dialogZIndex}) 可能被Authing Guard覆盖`,
          expected: '1000000',
          actual: dialogZIndex.toString()
        });
      }

      // 检查定位是否正确
      const isCorrectlyPositioned = 
        dialogStatus.styles.position === 'fixed' &&
        dialogStatus.styles.top === '50%' &&
        dialogStatus.styles.left === '50%' &&
        dialogStatus.styles.transform.includes('translate(-50%, -50%)');

      if (!isCorrectlyPositioned) {
        analysis.issues.push({
          type: 'positioning',
          severity: 'critical',
          message: '历史记录弹窗定位不正确，可能受到Authing Guard影响',
          expected: { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
          actual: {
            position: dialogStatus.styles.position,
            top: dialogStatus.styles.top,
            left: dialogStatus.styles.left,
            transform: dialogStatus.styles.transform
          }
        });
      }

      // 检查可见性
      if (dialogStatus.styles.visibility !== 'visible' || dialogStatus.styles.opacity !== '1') {
        analysis.issues.push({
          type: 'visibility',
          severity: 'medium',
          message: '历史记录弹窗可见性异常',
          expected: { visibility: 'visible', opacity: '1' },
          actual: { visibility: dialogStatus.styles.visibility, opacity: dialogStatus.styles.opacity }
        });
      }

      // 生成修复建议
      if (analysis.issues.length > 0) {
        analysis.recommendations = [
          '1. 确认Authing冲突修复CSS已正确加载',
          '2. 检查组件中的Authing冲突检测代码',
          '3. 验证z-index是否设置为1000000',
          '4. 确认CSS隔离保护是否激活'
        ];
      }
    }

    return analysis;
  }

  /**
   * 自动修复冲突
   */
  function autoFixConflict() {
    const dialogStatus = detectHistoryDialog();
    const authingStatus = detectAuthingGuard();

    if (!dialogStatus.exists) {
      console.log('❌ 未找到历史记录弹窗，无法修复');
      return false;
    }

    if (!authingStatus.exists) {
      console.log('ℹ️ 未检测到Authing Guard，无需修复');
      return true;
    }

    console.log('🔧 检测到Authing Guard冲突，开始自动修复...');

    const dialogElement = dialogStatus.element;

    // 应用强制修复样式
    const fixStyles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      transform: 'translate(-50%, -50%)',
      zIndex: '1000000',
      visibility: 'visible',
      opacity: '1',
      contain: 'layout style paint',
      isolation: 'isolate'
    };

    Object.entries(fixStyles).forEach(([prop, value]) => {
      dialogElement.style.setProperty(prop, value, 'important');
    });

    console.log('✅ 自动修复完成');

    // 验证修复效果
    setTimeout(() => {
      const newAnalysis = analyzeConflict();
      if (newAnalysis.issues.length === 0) {
        console.log('🎉 修复验证成功，冲突已解决');
      } else {
        console.log('⚠️ 修复验证失败，仍存在问题:', newAnalysis.issues);
      }
    }, 100);

    return true;
  }

  /**
   * 开始监控
   */
  function startAuthingConflictMonitor() {
    if (monitoringActive) {
      console.log('⚠️ 监控已在运行中');
      return;
    }

    console.log('🚀 开始Authing Guard冲突监控...');
    monitoringActive = true;
    conflictHistory = [];

    monitorInterval = setInterval(() => {
      const analysis = analyzeConflict();
      
      // 记录冲突历史
      if (analysis.conflict) {
        conflictHistory.push(analysis);
        
        // 只保留最近50条记录
        if (conflictHistory.length > 50) {
          conflictHistory = conflictHistory.slice(-50);
        }

        // 如果发现严重问题，自动修复
        const criticalIssues = analysis.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
          console.log('🚨 检测到严重冲突，尝试自动修复...');
          autoFixConflict();
        }

        // 输出冲突信息
        if (analysis.issues.length > 0) {
          console.log('⚠️ Authing冲突检测:', {
            timestamp: analysis.timestamp,
            issues: analysis.issues.length,
            details: analysis.issues
          });
        }
      }
    }, 500); // 每500ms检查一次

    console.log('✅ 监控已启动，每500ms检查一次冲突情况');
  }

  /**
   * 停止监控
   */
  function stopAuthingConflictMonitor() {
    if (!monitoringActive) {
      console.log('⚠️ 监控未在运行');
      return;
    }

    clearInterval(monitorInterval);
    monitoringActive = false;
    console.log('🛑 Authing Guard冲突监控已停止');
  }

  /**
   * 获取冲突历史
   */
  function getConflictHistory() {
    return {
      total: conflictHistory.length,
      recent: conflictHistory.slice(-10),
      summary: {
        totalConflicts: conflictHistory.length,
        criticalIssues: conflictHistory.reduce((count, analysis) => 
          count + analysis.issues.filter(issue => issue.severity === 'critical').length, 0),
        highIssues: conflictHistory.reduce((count, analysis) => 
          count + analysis.issues.filter(issue => issue.severity === 'high').length, 0),
        mediumIssues: conflictHistory.reduce((count, analysis) => 
          count + analysis.issues.filter(issue => issue.severity === 'medium').length, 0)
      }
    };
  }

  /**
   * 手动检测冲突
   */
  function checkConflictNow() {
    console.log('🔍 手动检测Authing Guard冲突...');
    const analysis = analyzeConflict();
    
    console.log('📊 检测结果:', {
      authingExists: analysis.authing.exists,
      dialogExists: analysis.dialog.exists,
      conflictDetected: analysis.conflict,
      issuesFound: analysis.issues.length,
      details: analysis
    });

    if (analysis.conflict && analysis.issues.length > 0) {
      console.log('🔧 发现冲突，是否需要自动修复？运行 autoFixConflict()');
    }

    return analysis;
  }

  // 导出到全局
  window.startAuthingConflictMonitor = startAuthingConflictMonitor;
  window.stopAuthingConflictMonitor = stopAuthingConflictMonitor;
  window.checkConflictNow = checkConflictNow;
  window.autoFixConflict = autoFixConflict;
  window.getConflictHistory = getConflictHistory;

  console.log('🎯 Authing Guard冲突检测器已准备就绪');
  console.log('💡 使用方法:');
  console.log('  - startAuthingConflictMonitor() - 开始监控');
  console.log('  - stopAuthingConflictMonitor() - 停止监控');
  console.log('  - checkConflictNow() - 手动检测');
  console.log('  - autoFixConflict() - 自动修复');
  console.log('  - getConflictHistory() - 查看冲突历史');

})();
