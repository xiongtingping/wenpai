/**
 * 🔍 弹窗调试检查器
 * 检查当前页面上的所有弹窗和模态框
 */

(function() {
  console.log('🔍 弹窗调试检查器启动！');
  
  function inspectModals() {
    console.log('\n=== 🔍 弹窗检查报告 ===');
    
    // 1. 检查所有可能的弹窗选择器
    const modalSelectors = [
      // Authing Guard相关
      '.authing-guard-container',
      '.authing-guard',
      '[class*="authing"]',
      '[id*="authing"]',
      
      // 通用弹窗
      '.modal',
      '.dialog',
      '[role="dialog"]',
      '[aria-modal="true"]',
      
      // Radix UI Dialog
      '[data-radix-dialog-content]',
      '[data-state="open"]',
      
      // 自定义弹窗
      '[class*="dialog"]',
      '[class*="modal"]',
      '[class*="popup"]',
      '[class*="overlay"]'
    ];
    
    let foundModals = [];
    
    modalSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          elements.forEach(el => {
            const isVisible = el.offsetParent !== null;
            const computedStyle = window.getComputedStyle(el);
            const isDisplayed = computedStyle.display !== 'none';
            const isOpaque = computedStyle.opacity !== '0';
            
            foundModals.push({
              selector,
              element: el,
              isVisible,
              isDisplayed,
              isOpaque,
              className: el.className,
              id: el.id,
              textContent: el.textContent?.substring(0, 100) + '...',
              zIndex: computedStyle.zIndex,
              position: computedStyle.position
            });
          });
        }
      } catch (error) {
        console.warn(`检查选择器 ${selector} 时出错:`, error);
      }
    });
    
    console.log(`\n📊 找到 ${foundModals.length} 个潜在弹窗元素:`);
    
    foundModals.forEach((modal, index) => {
      console.log(`\n${index + 1}. 弹窗元素:`);
      console.log(`   选择器: ${modal.selector}`);
      console.log(`   类名: ${modal.className}`);
      console.log(`   ID: ${modal.id}`);
      console.log(`   可见性: ${modal.isVisible ? '✅ 可见' : '❌ 隐藏'}`);
      console.log(`   显示状态: ${modal.isDisplayed ? '✅ 显示' : '❌ 隐藏'}`);
      console.log(`   透明度: ${modal.isOpaque ? '✅ 不透明' : '❌ 透明'}`);
      console.log(`   z-index: ${modal.zIndex}`);
      console.log(`   position: ${modal.position}`);
      console.log(`   内容预览: ${modal.textContent}`);
      console.log(`   元素:`, modal.element);
    });
    
    // 2. 检查body的直接子元素（很多弹窗会直接添加到body）
    console.log('\n📋 Body直接子元素检查:');
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((child, index) => {
      const isVisible = child.offsetParent !== null;
      const computedStyle = window.getComputedStyle(child);
      const zIndex = computedStyle.zIndex;
      const position = computedStyle.position;
      
      if (isVisible && (position === 'fixed' || position === 'absolute' || parseInt(zIndex) > 100)) {
        console.log(`\n${index + 1}. 可疑弹窗元素:`);
        console.log(`   标签: ${child.tagName}`);
        console.log(`   类名: ${child.className}`);
        console.log(`   ID: ${child.id}`);
        console.log(`   z-index: ${zIndex}`);
        console.log(`   position: ${position}`);
        console.log(`   内容预览: ${child.textContent?.substring(0, 100)}...`);
        console.log(`   元素:`, child);
      }
    });
    
    // 3. 检查React Portal（很多现代弹窗使用Portal）
    console.log('\n🌀 React Portal检查:');
    const portals = document.querySelectorAll('[data-radix-portal], [data-react-portal]');
    if (portals.length > 0) {
      portals.forEach((portal, index) => {
        console.log(`\n${index + 1}. React Portal:`);
        console.log(`   元素:`, portal);
        console.log(`   内容:`, portal.textContent?.substring(0, 200));
      });
    } else {
      console.log('   未找到明显的React Portal');
    }
    
    // 4. 检查高z-index元素
    console.log('\n🔝 高z-index元素检查:');
    const allElements = document.querySelectorAll('*');
    const highZIndexElements = [];
    
    allElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const zIndex = parseInt(computedStyle.zIndex);
      
      if (zIndex > 999 && el.offsetParent !== null) {
        highZIndexElements.push({
          element: el,
          zIndex,
          className: el.className,
          id: el.id,
          textContent: el.textContent?.substring(0, 100)
        });
      }
    });
    
    highZIndexElements
      .sort((a, b) => b.zIndex - a.zIndex)
      .slice(0, 10)
      .forEach((item, index) => {
        console.log(`\n${index + 1}. 高z-index元素 (${item.zIndex}):`);
        console.log(`   类名: ${item.className}`);
        console.log(`   ID: ${item.id}`);
        console.log(`   内容: ${item.textContent}...`);
        console.log(`   元素:`, item.element);
      });
    
    console.log('\n=== 🔍 检查完成 ===\n');
    
    return foundModals;
  }
  
  // 立即执行检查
  inspectModals();
  
  // 暴露全局函数
  window.__modalInspector = {
    inspect: inspectModals,
    hideAllModals: () => {
      console.log('🚫 尝试隐藏所有弹窗...');

      // 隐藏Authing Guard
      if (window.guard) {
        try {
          window.guard.hide();
          console.log('✅ Authing Guard已隐藏');
        } catch (error) {
          console.warn('❌ 隐藏Authing Guard失败:', error);
        }
      }

      // 隐藏所有高z-index元素
      const allElements = document.querySelectorAll('*');
      let hiddenCount = 0;

      allElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const zIndex = parseInt(computedStyle.zIndex);

        if (zIndex > 999 && el.offsetParent !== null) {
          el.style.display = 'none';
          hiddenCount++;
        }
      });

      console.log(`✅ 隐藏了 ${hiddenCount} 个高z-index元素`);

      // 重新检查
      setTimeout(() => {
        inspectModals();
      }, 500);
    },

    forceCloseAuthing: () => {
      console.log('💪 执行强力Authing弹窗关闭...');
      let closedCount = 0;

      // 方法1：强制隐藏所有Authing相关元素
      document.querySelectorAll('[class*="authing"]').forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        closedCount++;
      });
      console.log(`✅ 方法1: 隐藏了 ${closedCount} 个Authing元素`);

      // 方法2：移除Authing弹窗容器
      const containers = ['authing_guard_container', 'authing-guard-container-v4'];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.remove();
          console.log(`✅ 方法2: 移除容器 ${id}`);
        }
      });

      // 方法3：点击关闭按钮
      const closeBtn = document.querySelector('.authing-ant-modal-close');
      if (closeBtn) {
        closeBtn.click();
        console.log('✅ 方法3: 点击了关闭按钮');
      }

      // 方法4：终极方案 - 移除所有modal元素
      const modalSelectors = [
        '.authing-ant-modal-root',
        '.authing-ant-modal-mask',
        '.authing-ant-modal-wrap',
        '.authing-ant-modal'
      ];

      modalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
        if (elements.length > 0) {
          console.log(`✅ 方法4: 移除了 ${elements.length} 个 ${selector} 元素`);
        }
      });

      // 方法5：清理body上的overflow样式（防止页面滚动被锁定）
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      console.log('✅ 方法5: 恢复页面滚动');

      // 方法6：移除所有aria-hidden属性
      document.querySelectorAll('[aria-hidden="true"]').forEach(el => {
        if (el.className && el.className.includes && el.className.includes('authing')) {
          el.remove();
        }
      });

      console.log('💪 强力关闭完成！');

      // 延迟检查结果
      setTimeout(() => {
        const remainingModals = document.querySelectorAll('[class*="authing"]');
        if (remainingModals.length === 0) {
          console.log('🎉 成功！所有Authing弹窗已清除');
        } else {
          console.log(`⚠️ 仍有 ${remainingModals.length} 个Authing元素残留`);
          inspectModals();
        }
      }, 1000);
    }
  };
  
  console.log('💡 使用 window.__modalInspector.inspect() 重新检查');
  console.log('💡 使用 window.__modalInspector.hideAllModals() 隐藏所有弹窗');
  console.log('💪 使用 window.__modalInspector.forceCloseAuthing() 强力关闭Authing弹窗');

  // 🚀 自动执行强力关闭（如果检测到Authing弹窗）
  setTimeout(() => {
    const authingModals = document.querySelectorAll('[class*="authing-ant-modal"]');
    if (authingModals.length > 0) {
      console.log('🚨 检测到Authing弹窗，自动执行强力关闭...');
      window.__modalInspector.forceCloseAuthing();
    }
  }, 2000);
})();
