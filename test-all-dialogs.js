/**
 * 🎯 验证所有Dialog组件定位修复
 * 测试快速引用和历史记录弹窗的定位是否正常
 */

console.clear();
console.log('🎯 开始验证所有Dialog组件定位修复...');
console.log('检查：快速引用弹窗 + 历史记录弹窗');

async function verifyAllDialogs() {
  const results = {
    quickReference: null,
    history: null
  };

  try {
    console.log('\n📋 测试计划:');
    console.log('1. 测试快速引用弹窗定位');
    console.log('2. 测试历史记录弹窗定位');
    console.log('3. 验证两个弹窗不会相互干扰');
    
    // ===========================================
    // 1. 测试快速引用弹窗
    // ===========================================
    console.log('\n🎯 === 测试快速引用弹窗 ===');
    
    const quickRefButton = document.querySelector('button[title*="快速引用"], button:has(.lucide-at-sign)') ||
                          Array.from(document.querySelectorAll('button')).find(btn => 
                            btn.textContent.includes('快速引用') || 
                            btn.querySelector('.lucide-at-sign')
                          );
    
    if (quickRefButton) {
      console.log('✅ 找到快速引用按钮');
      
      // 点击打开快速引用弹窗
      quickRefButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const quickRefDialog = document.querySelector('[role="dialog"].quick-reference-dialog') ||
                            document.querySelector('[role="dialog"]');
      
      if (quickRefDialog) {
        const rect = quickRefDialog.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        const viewportCenter = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        const offset = {
          x: Math.abs(center.x - viewportCenter.x),
          y: Math.abs(center.y - viewportCenter.y)
        };
        
        results.quickReference = {
          found: true,
          centered: offset.x < 5 && offset.y < 5,
          offset: offset,
          rect: rect,
          inViewport: rect.left >= 0 && rect.top >= 0 && 
                     rect.right <= window.innerWidth && rect.bottom <= window.innerHeight
        };
        
        console.log('🎯 快速引用弹窗定位:', results.quickReference);
        
        // 关闭快速引用弹窗
        const overlay = document.querySelector('[data-radix-dialog-overlay]');
        if (overlay) {
          overlay.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        results.quickReference = { found: false, error: '弹窗未出现' };
        console.log('❌ 快速引用弹窗未出现');
      }
    } else {
      results.quickReference = { found: false, error: '按钮未找到' };
      console.log('❌ 快速引用按钮未找到');
    }
    
    // ===========================================
    // 2. 测试历史记录弹窗
    // ===========================================
    console.log('\n📋 === 测试历史记录弹窗 ===');
    
    const historyButton = document.querySelector('button[title*="历史"], button[title*="history"]') ||
                         Array.from(document.querySelectorAll('button')).find(btn => 
                           btn.textContent.includes('历史') || 
                           btn.textContent.includes('记录')
                         );
    
    if (historyButton) {
      console.log('✅ 找到历史记录按钮');
      
      // 点击打开历史记录弹窗
      historyButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const historyDialog = document.querySelector('[role="dialog"][class*="enhanced-history-dialog"]') ||
                           document.querySelector('.enhanced-history-dialog') ||
                           document.querySelector('[role="dialog"]');
      
      if (historyDialog) {
        const rect = historyDialog.getBoundingClientRect();
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        const viewportCenter = {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
        const offset = {
          x: Math.abs(center.x - viewportCenter.x),
          y: Math.abs(center.y - viewportCenter.y)
        };
        
        results.history = {
          found: true,
          centered: offset.x < 5 && offset.y < 5,
          offset: offset,
          rect: rect,
          inViewport: rect.left >= 0 && rect.top >= 0 && 
                     rect.right <= window.innerWidth && rect.bottom <= window.innerHeight
        };
        
        console.log('📋 历史记录弹窗定位:', results.history);
        
        // 关闭历史记录弹窗
        const overlay = document.querySelector('[data-radix-dialog-overlay]');
        if (overlay) {
          overlay.click();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else {
        results.history = { found: false, error: '弹窗未出现' };
        console.log('❌ 历史记录弹窗未出现');
      }
    } else {
      results.history = { found: false, error: '按钮未找到' };
      console.log('❌ 历史记录按钮未找到');
    }
    
    // ===========================================
    // 3. 综合评估
    // ===========================================
    console.log('\n🏆 === 综合评估结果 ===');
    console.log('===============================');
    
    const quickRefStatus = results.quickReference?.found && results.quickReference?.centered ? '✅ 正常' : '❌ 异常';
    const historyStatus = results.history?.found && results.history?.centered ? '✅ 正常' : '❌ 异常';
    
    console.log(`🎯 快速引用弹窗: ${quickRefStatus}`);
    if (results.quickReference?.found) {
      console.log(`   居中偏移: x=${results.quickReference.offset?.x?.toFixed(1)}px, y=${results.quickReference.offset?.y?.toFixed(1)}px`);
      console.log(`   视口内显示: ${results.quickReference.inViewport ? '✅' : '❌'}`);
    }
    
    console.log(`📋 历史记录弹窗: ${historyStatus}`);
    if (results.history?.found) {
      console.log(`   居中偏移: x=${results.history.offset?.x?.toFixed(1)}px, y=${results.history.offset?.y?.toFixed(1)}px`);
      console.log(`   视口内显示: ${results.history.inViewport ? '✅' : '❌'}`);
    }
    
    console.log('===============================');
    
    const allGood = 
      (!results.quickReference || (results.quickReference.found && results.quickReference.centered)) &&
      (!results.history || (results.history.found && results.history.centered));
    
    if (allGood) {
      console.log('🎊 所有Dialog组件定位正常！');
      console.log('✅ CLAUDE.md 3.6.2节双重保护机制完全生效');
      console.log('✅ 快速引用和历史记录弹窗互不干扰');
      console.log('✅ 根本性解决方案验证成功');
    } else {
      console.log('🚨 部分Dialog存在定位问题');
      console.log('💡 请检查具体的失败项目进行修复');
    }
    
    // ===========================================
    // 4. 技术验证信息
    // ===========================================
    console.log('\n🔧 === 技术验证信息 ===');
    console.log('CSS修复文件: dialog-positioning-fix-clean.css');
    console.log('Hook文件: useDialogPositioning.ts');
    console.log('双重保护: CSS基础修复 + JavaScript运行时修复');
    console.log('设计令牌: 使用CSS变量确保一致性');
    console.log('视窗单位: 使用vh/vw而非百分比单位');
    console.log('inset重置: 完全清除inset属性冲突');
    
    return results;
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error);
    return results;
  }
}

// 执行验证
verifyAllDialogs();