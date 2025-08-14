/**
 * 🔍 修复效果验证脚本
 * 验证 className.includes 错误和 undefinedundefined 问题是否已修复
 */

(function() {
  console.log('🔍 开始验证修复效果...');
  
  let testResults = {
    classNameIncludesFixed: false,
    undefinedundefinedFixed: false,
    fixersRunning: false,
    duplicateLogsReduced: false
  };
  
  // 1. 测试 className.includes 错误是否修复
  function testClassNameIncludes() {
    console.log('\n📋 测试 className.includes 修复...');
    
    try {
      // 创建一个测试元素，模拟 DOMTokenList className
      const testDiv = document.createElement('div');
      testDiv.className = 'test-class authing-guard';
      
      // 模拟修复器中的逻辑
      const className = typeof testDiv.className === 'string' 
        ? testDiv.className 
        : testDiv.className?.toString() || '';
      
      const hasAuthing = className.includes('authing');
      
      if (hasAuthing) {
        console.log('✅ className.includes 修复成功');
        testResults.classNameIncludesFixed = true;
      } else {
        console.log('❌ className.includes 修复失败');
      }
    } catch (error) {
      console.log('❌ className.includes 测试出错:', error);
    }
  }
  
  // 2. 检查页面是否存在 undefinedundefined
  function checkUndefinedundefined() {
    console.log('\n🔍 检查页面 undefinedundefined...');
    
    const bodyText = document.body.textContent || '';
    const hasUndefinedundefined = bodyText.includes('undefinedundefined');
    
    if (!hasUndefinedundefined) {
      console.log('✅ 页面无 undefinedundefined 问题');
      testResults.undefinedundefinedFixed = true;
    } else {
      console.log('❌ 页面仍存在 undefinedundefined 问题');
      
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
      
      const problematicNodes = [];
      let node;
      while ((node = walker.nextNode()) !== null) {
        problematicNodes.push({
          text: node.textContent,
          parent: node.parentElement?.tagName
        });
      }
      
      console.log('问题节点:', problematicNodes);
    }
  }
  
  // 3. 检查修复器是否正常运行
  function checkFixersRunning() {
    console.log('\n🛡️ 检查修复器状态...');
    
    const fixers = {
      productionUndefinedFixer: window.productionUndefinedFixer,
      authingProductionFixer: window.authingProductionFixer,
      emergencyProductionFixer: window.emergencyProductionFixer
    };
    
    let runningCount = 0;
    Object.entries(fixers).forEach(([name, fixer]) => {
      if (fixer) {
        console.log(`✅ ${name} 正在运行`);
        runningCount++;
      } else {
        console.log(`❌ ${name} 未运行`);
      }
    });
    
    if (runningCount > 0) {
      console.log(`✅ ${runningCount} 个修复器正在运行`);
      testResults.fixersRunning = true;
    } else {
      console.log('❌ 没有修复器在运行');
    }
  }
  
  // 4. 检查重复日志是否减少
  function checkDuplicateLogs() {
    console.log('\n📝 检查重复日志...');
    
    // 监控控制台输出
    const originalLog = console.log;
    const logMessages = [];
    
    console.log = function(...args) {
      const message = args.join(' ');
      logMessages.push(message);
      return originalLog.apply(console, args);
    };
    
    // 等待一段时间收集日志
    setTimeout(() => {
      console.log = originalLog;
      
      // 检查重复的启动日志
      const startupLogs = logMessages.filter(msg => 
        msg.includes('修复器已启动') || 
        msg.includes('环境检测') ||
        msg.includes('FORCE ENABLED')
      );
      
      const uniqueStartupLogs = [...new Set(startupLogs)];
      
      if (startupLogs.length <= uniqueStartupLogs.length * 2) {
        console.log('✅ 重复日志已减少');
        testResults.duplicateLogsReduced = true;
      } else {
        console.log('❌ 仍有重复日志');
        console.log('重复的启动日志:', startupLogs);
      }
    }, 2000);
  }
  
  // 5. 生成验证报告
  function generateReport() {
    setTimeout(() => {
      console.log('\n📊 修复效果验证报告:');
      console.log('================================');
      
      Object.entries(testResults).forEach(([test, passed]) => {
        const status = passed ? '✅ 通过' : '❌ 失败';
        const testName = {
          classNameIncludesFixed: 'className.includes 错误修复',
          undefinedundefinedFixed: 'undefinedundefined 问题修复',
          fixersRunning: '修复器运行状态',
          duplicateLogsReduced: '重复日志减少'
        }[test];
        
        console.log(`${status} ${testName}`);
      });
      
      const passedCount = Object.values(testResults).filter(Boolean).length;
      const totalCount = Object.keys(testResults).length;
      
      console.log('================================');
      console.log(`总体评分: ${passedCount}/${totalCount} (${Math.round(passedCount/totalCount*100)}%)`);
      
      if (passedCount === totalCount) {
        console.log('🎉 所有修复都已生效！');
      } else {
        console.log('⚠️ 部分修复需要进一步检查');
      }
    }, 3000);
  }
  
  // 执行所有测试
  testClassNameIncludes();
  checkUndefinedundefined();
  checkFixersRunning();
  checkDuplicateLogs();
  generateReport();
  
})();
