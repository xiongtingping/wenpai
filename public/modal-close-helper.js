/**
 * 🔧 弹窗关闭助手
 * 帮助用户关闭 Authing 登录弹窗并提供调试信息
 */

(function() {
  console.log('🔧 弹窗关闭助手已加载');
  
  // 检查当前弹窗状态
  function checkModalStatus() {
    const modals = {
      'authing_guard_container': document.getElementById('authing_guard_container'),
      'authing-guard-container-v4': document.getElementById('authing-guard-container-v4'),
      'authing-ant-modal-root': document.querySelector('.authing-ant-modal-root'),
      'ant-modal-mask': document.querySelector('.ant-modal-mask'),
      'ant-modal-wrap': document.querySelector('.ant-modal-wrap')
    };
    
    console.log('🔍 当前弹窗状态:');
    Object.entries(modals).forEach(([name, element]) => {
      if (element) {
        const isVisible = element.offsetParent !== null;
        const style = window.getComputedStyle(element);
        console.log(`  ${name}: 存在=${!!element}, 可见=${isVisible}, display=${style.display}, zIndex=${style.zIndex}`);
      } else {
        console.log(`  ${name}: 不存在`);
      }
    });
    
    return modals;
  }
  
  // 尝试关闭弹窗的多种方法
  function closeModal() {
    console.log('🔧 尝试关闭弹窗...');
    
    const methods = [
      // 方法1: 使用 Guard 实例的 hide 方法
      () => {
        if (window.guardInstance && typeof window.guardInstance.hide === 'function') {
          console.log('🔧 方法1: 使用 Guard.hide()');
          window.guardInstance.hide();
          return true;
        }
        return false;
      },
      
      // 方法2: 查找并点击关闭按钮
      () => {
        const closeButtons = [
          '.ant-modal-close',
          '.ant-modal-close-x',
          '.authing-modal-close',
          '.close-btn',
          '[aria-label="Close"]',
          '.modal-close'
        ];
        
        for (const selector of closeButtons) {
          const btn = document.querySelector(selector);
          if (btn && btn.offsetParent !== null) {
            console.log(`🔧 方法2: 点击关闭按钮 ${selector}`);
            btn.click();
            return true;
          }
        }
        return false;
      },
      
      // 方法3: 点击遮罩层
      () => {
        const mask = document.querySelector('.ant-modal-mask');
        if (mask && mask.offsetParent !== null) {
          console.log('🔧 方法3: 点击遮罩层');
          mask.click();
          return true;
        }
        return false;
      },
      
      // 方法4: 模拟 ESC 键
      () => {
        console.log('🔧 方法4: 模拟 ESC 键');
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true
        });
        document.dispatchEvent(escEvent);
        return true;
      },
      
      // 方法5: 直接隐藏弹窗元素
      () => {
        const containers = [
          '#authing_guard_container',
          '#authing-guard-container-v4',
          '.authing-ant-modal-root'
        ];
        
        let hidden = false;
        containers.forEach(selector => {
          const element = document.querySelector(selector);
          if (element && element.offsetParent !== null) {
            console.log(`🔧 方法5: 直接隐藏 ${selector}`);
            element.style.display = 'none';
            hidden = true;
          }
        });
        return hidden;
      }
    ];
    
    // 依次尝试各种方法
    for (let i = 0; i < methods.length; i++) {
      try {
        if (methods[i]()) {
          console.log(`✅ 方法${i + 1} 执行成功`);
          
          // 等待一下再检查结果
          setTimeout(() => {
            const modals = checkModalStatus();
            const hasVisibleModal = Object.values(modals).some(modal => 
              modal && modal.offsetParent !== null
            );
            
            if (!hasVisibleModal) {
              console.log('🎉 弹窗已成功关闭！');
            } else {
              console.log('⚠️ 弹窗仍然可见，尝试下一种方法...');
              if (i < methods.length - 1) {
                closeModal();
              }
            }
          }, 500);
          
          break;
        }
      } catch (error) {
        console.warn(`❌ 方法${i + 1} 执行失败:`, error);
      }
    }
  }
  
  // 检查弹窗关闭功能
  function testCloseFeatures() {
    console.log('🧪 测试弹窗关闭功能...');
    
    const tests = [
      {
        name: 'ESC 键支持',
        test: () => {
          const containers = document.querySelectorAll('[id*="authing"], [class*="authing"]');
          return Array.from(containers).some(el => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && el.offsetParent !== null;
          });
        }
      },
      {
        name: '关闭按钮存在',
        test: () => {
          const closeButtons = document.querySelectorAll('.ant-modal-close, .close-btn, [aria-label="Close"]');
          return closeButtons.length > 0;
        }
      },
      {
        name: '遮罩层点击',
        test: () => {
          const mask = document.querySelector('.ant-modal-mask');
          return mask && mask.offsetParent !== null;
        }
      },
      {
        name: 'Guard 实例方法',
        test: () => {
          return window.guardInstance && typeof window.guardInstance.hide === 'function';
        }
      }
    ];
    
    tests.forEach(({ name, test }) => {
      try {
        const result = test();
        console.log(`  ${result ? '✅' : '❌'} ${name}: ${result ? '支持' : '不支持'}`);
      } catch (error) {
        console.log(`  ❌ ${name}: 测试失败 - ${error.message}`);
      }
    });
  }
  
  // 暴露到全局
  window.modalCloseHelper = {
    checkStatus: checkModalStatus,
    close: closeModal,
    test: testCloseFeatures
  };
  
  // 自动检查当前状态
  setTimeout(() => {
    console.log('\n🔍 自动检查弹窗状态...');
    checkModalStatus();
    testCloseFeatures();
    
    console.log('\n💡 使用方法:');
    console.log('  modalCloseHelper.checkStatus() - 检查弹窗状态');
    console.log('  modalCloseHelper.close() - 尝试关闭弹窗');
    console.log('  modalCloseHelper.test() - 测试关闭功能');
  }, 1000);
  
})();
