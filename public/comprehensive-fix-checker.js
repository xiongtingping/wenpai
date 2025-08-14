/**
 * 🔍 全面修复检查器
 * 检查所有弹窗和 undefinedundefined 修复器的工作状态
 */

(function() {
  console.log('🚀 启动全面修复检查器...');
  
  const checkResults = {
    fixersStatus: {},
    undefinedIssues: [],
    modalIssues: [],
    conflicts: [],
    recommendations: []
  };

  // 1. 检查修复器状态
  function checkFixersStatus() {
    console.log('\n🛡️ 检查修复器状态...');
    
    const expectedFixers = {
      'authingProductionFixer': '🔧 Authing 生产环境修复器',
      'productionUndefinedFixer': '🛡️ 生产环境 undefined 修复器',
      'emergencyProductionFixer': '🚨 紧急生产环境修复器'
    };
    
    Object.entries(expectedFixers).forEach(([key, description]) => {
      const fixer = window[key];
      const isActive = !!fixer;
      
      checkResults.fixersStatus[key] = {
        active: isActive,
        description,
        instance: fixer
      };
      
      if (isActive) {
        console.log(`✅ ${description} - 运行中`);
        
        // 检查修复器的统计信息
        if (fixer.getStats) {
          const stats = fixer.getStats();
          console.log(`   📊 统计: ${JSON.stringify(stats)}`);
        }
      } else {
        console.log(`❌ ${description} - 未运行`);
      }
    });
  }

  // 2. 检查 undefinedundefined 问题
  function checkUndefinedIssues() {
    console.log('\n🔍 检查 undefinedundefined 问题...');
    
    const bodyText = document.body?.textContent || '';
    const hasUndefinedIssue = bodyText.includes('undefinedundefined');
    
    if (hasUndefinedIssue) {
      console.log('🚨 发现 undefinedundefined 问题');
      
      // 查找具体位置
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            return node.textContent?.includes('undefinedundefined') 
              ? NodeFilter.FILTER_ACCEPT 
              : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      let node;
      while ((node = walker.nextNode()) !== null) {
        const issue = {
          text: node.textContent,
          parent: node.parentElement?.tagName,
          parentClass: node.parentElement?.className,
          parentId: node.parentElement?.id
        };
        
        checkResults.undefinedIssues.push(issue);
        console.log('   📍 位置:', issue);
      }
    } else {
      console.log('✅ 未发现 undefinedundefined 问题');
    }
  }

  // 3. 检查弹窗问题
  function checkModalIssues() {
    console.log('\n🔍 检查弹窗问题...');
    
    const modalSelectors = [
      '.authing-guard-container',
      '.authing-ant-modal-root',
      '[id*="authing"]',
      '[class*="modal"]',
      '[role="dialog"]',
      '[aria-modal="true"]'
    ];
    
    modalSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const isVisible = el.offsetParent !== null;
            const computedStyle = window.getComputedStyle(el);
            
            const modalInfo = {
              selector,
              isVisible,
              zIndex: computedStyle.zIndex,
              display: computedStyle.display,
              className: el.className,
              id: el.id
            };
            
            checkResults.modalIssues.push(modalInfo);
            
            if (isVisible) {
              console.log(`👁️ 可见弹窗: ${selector}`, modalInfo);
            }
          });
        }
      } catch (error) {
        console.warn(`检查选择器 ${selector} 时出错:`, error);
      }
    });
    
    if (checkResults.modalIssues.length === 0) {
      console.log('✅ 未发现异常弹窗');
    }
  }

  // 4. 检查修复器冲突
  function checkFixerConflicts() {
    console.log('\n🔍 检查修复器冲突...');
    
    // 检查是否有多个修复器同时处理相同问题
    const activeFixers = Object.entries(checkResults.fixersStatus)
      .filter(([key, status]) => status.active)
      .map(([key]) => key);
    
    if (activeFixers.length > 3) {
      checkResults.conflicts.push('过多修复器同时运行，可能存在冲突');
      console.log('⚠️ 过多修复器同时运行，可能存在冲突');
    }
    
    // 检查控制台是否有重复日志
    const originalLog = console.log;
    const logMessages = [];
    let duplicateCount = 0;
    
    console.log = function(...args) {
      const message = args.join(' ');
      if (logMessages.includes(message)) {
        duplicateCount++;
      } else {
        logMessages.push(message);
      }
      return originalLog.apply(console, args);
    };
    
    setTimeout(() => {
      console.log = originalLog;
      if (duplicateCount > 10) {
        checkResults.conflicts.push(`检测到 ${duplicateCount} 条重复日志`);
        console.log(`⚠️ 检测到 ${duplicateCount} 条重复日志`);
      } else {
        console.log('✅ 日志重复情况正常');
      }
    }, 2000);
  }

  // 5. 生成建议
  function generateRecommendations() {
    console.log('\n💡 生成修复建议...');
    
    // 基于检查结果生成建议
    if (checkResults.undefinedIssues.length > 0) {
      checkResults.recommendations.push('需要加强 undefinedundefined 修复器的覆盖范围');
    }
    
    if (checkResults.modalIssues.some(modal => modal.isVisible && modal.selector.includes('authing'))) {
      checkResults.recommendations.push('Authing 弹窗可能需要手动关闭或修复');
    }
    
    const inactiveFixers = Object.entries(checkResults.fixersStatus)
      .filter(([key, status]) => !status.active)
      .map(([key]) => key);
    
    if (inactiveFixers.length > 0) {
      checkResults.recommendations.push(`需要启动以下修复器: ${inactiveFixers.join(', ')}`);
    }
    
    if (checkResults.conflicts.length > 0) {
      checkResults.recommendations.push('需要解决修复器冲突问题');
    }
    
    if (checkResults.recommendations.length === 0) {
      checkResults.recommendations.push('所有修复器工作正常，无需额外操作');
    }
    
    checkResults.recommendations.forEach(rec => {
      console.log(`💡 ${rec}`);
    });
  }

  // 6. 生成完整报告
  function generateReport() {
    setTimeout(() => {
      console.log('\n📋 全面检查报告');
      console.log('=====================================');
      
      console.log('\n🛡️ 修复器状态:');
      Object.entries(checkResults.fixersStatus).forEach(([key, status]) => {
        console.log(`   ${status.active ? '✅' : '❌'} ${key}: ${status.description}`);
      });
      
      console.log(`\n🚨 undefinedundefined 问题: ${checkResults.undefinedIssues.length} 个`);
      if (checkResults.undefinedIssues.length > 0) {
        checkResults.undefinedIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.parent}.${issue.parentClass}: "${issue.text.substring(0, 50)}..."`);
        });
      }
      
      console.log(`\n👁️ 弹窗问题: ${checkResults.modalIssues.length} 个`);
      const visibleModals = checkResults.modalIssues.filter(modal => modal.isVisible);
      if (visibleModals.length > 0) {
        visibleModals.forEach((modal, index) => {
          console.log(`   ${index + 1}. ${modal.selector} (z-index: ${modal.zIndex})`);
        });
      }
      
      console.log(`\n⚠️ 冲突问题: ${checkResults.conflicts.length} 个`);
      checkResults.conflicts.forEach((conflict, index) => {
        console.log(`   ${index + 1}. ${conflict}`);
      });
      
      console.log('\n💡 修复建议:');
      checkResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      
      // 计算总体评分
      const totalIssues = checkResults.undefinedIssues.length + 
                         checkResults.modalIssues.filter(m => m.isVisible).length + 
                         checkResults.conflicts.length;
      
      const activeFixersCount = Object.values(checkResults.fixersStatus)
        .filter(status => status.active).length;
      
      const score = Math.max(0, 100 - (totalIssues * 10) + (activeFixersCount * 5));
      
      console.log(`\n🎯 总体评分: ${score}/100`);
      
      if (score >= 90) {
        console.log('🎉 修复状态优秀！');
      } else if (score >= 70) {
        console.log('👍 修复状态良好，有小问题需要关注');
      } else {
        console.log('⚠️ 修复状态需要改进');
      }
      
      // 暴露结果到全局
      window.__fixCheckResults = checkResults;
      console.log('\n💾 检查结果已保存到 window.__fixCheckResults');
      
    }, 3000);
  }

  // 执行所有检查
  checkFixersStatus();
  checkUndefinedIssues();
  checkModalIssues();
  checkFixerConflicts();
  generateRecommendations();
  generateReport();
  
  // 暴露检查函数到全局
  window.__comprehensiveFixChecker = {
    checkAll: () => {
      checkFixersStatus();
      checkUndefinedIssues();
      checkModalIssues();
      checkFixerConflicts();
      generateRecommendations();
      generateReport();
    },
    getResults: () => checkResults
  };
  
  console.log('\n💡 使用 window.__comprehensiveFixChecker.checkAll() 重新检查');
  console.log('💡 使用 window.__comprehensiveFixChecker.getResults() 获取详细结果');
  
})();
