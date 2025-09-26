/**
 * Emoji收藏按钮位置强制修复器
 * 用于在任何情况下都能确保收藏按钮正确定位到右上角
 */

export class EmojiButtonPositionFixer {
  constructor() {
    this.isFixing = false;
    this.observer = null;
    this.init();
  }

  init() {
    // 立即修复现有按钮
    this.fixAllButtons();
    
    // 设置监听器，在DOM变化时自动修复
    this.setupObserver();
    
    // 设置定期检查
    this.setupPeriodicCheck();
  }

  fixAllButtons() {
    if (this.isFixing) return;
    this.isFixing = true;

    try {
      // 查找所有收藏按钮
      const buttons = document.querySelectorAll('.emoji-favorite-btn, button.emoji-favorite-btn');
      
      console.log(`🎯 发现 ${buttons.length} 个收藏按钮，开始修复位置...`);
      
      buttons.forEach((button, index) => {
        this.fixButtonPosition(button, index);
      });
      
      console.log('✅ 收藏按钮位置修复完成');
    } catch (error) {
      console.error('❌ 收藏按钮修复出错:', error);
    } finally {
      this.isFixing = false;
    }
  }

  fixButtonPosition(button, index = 0) {
    if (!button) return;

    // 强制设置关键样式
    const styles = {
      position: 'absolute',
      top: '6px',
      right: '6px',
      left: 'auto',
      bottom: 'auto',
      zIndex: '999',
      width: '24px',
      height: '24px',
      minWidth: '24px',
      minHeight: '24px',
      maxWidth: '24px',
      maxHeight: '24px',
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(229, 231, 235, 0.3)',
      borderRadius: '50%',
      padding: '0',
      margin: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      transform: 'none',
      translate: 'none',
      inset: 'auto',
      flex: 'none',
      flexGrow: '0',
      flexShrink: '0',
      flexBasis: 'auto',
      alignSelf: 'auto',
      justifySelf: 'auto',
      gridArea: 'auto',
      gridColumn: 'auto',
      gridRow: 'auto'
    };

    // 应用样式
    Object.assign(button.style, styles);

    // 确保父容器是相对定位
    const parent = button.closest('.avatar-card, .emoji-grid-container, .emoji-manager-container');
    if (parent) {
      parent.style.position = 'relative';
    }

    // 修复图标样式
    const icon = button.querySelector('svg');
    if (icon) {
      Object.assign(icon.style, {
        width: '14px',
        height: '14px',
        minWidth: '14px',
        minHeight: '14px',
        maxWidth: '14px',
        maxHeight: '14px',
        transition: 'all 0.2s ease-in-out',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: '2'
      });

      // 根据收藏状态设置颜色
      const isFavorited = button.getAttribute('data-favorited') === 'true';
      if (isFavorited) {
        icon.style.color = '#ef4444';
        icon.style.fill = '#ef4444';
        button.style.background = 'rgba(239, 68, 68, 0.1)';
        button.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      } else {
        icon.style.color = '#6b7280';
        icon.style.fill = 'none';
      }
    }

    console.log(`✅ 修复收藏按钮 #${index + 1} 位置`);
  }

  setupObserver() {
    // 使用MutationObserver监听DOM变化
    this.observer = new MutationObserver((mutations) => {
      let shouldFix = false;
      
      mutations.forEach((mutation) => {
        // 检查是否有新的收藏按钮被添加
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList?.contains('emoji-favorite-btn') || 
                  node.querySelector?.('.emoji-favorite-btn')) {
                shouldFix = true;
              }
            }
          });
        }
        
        // 检查属性变化
        if (mutation.type === 'attributes' && 
            mutation.target.classList?.contains('emoji-favorite-btn')) {
          shouldFix = true;
        }
      });
      
      if (shouldFix) {
        // 延迟执行以避免频繁修复
        setTimeout(() => this.fixAllButtons(), 100);
      }
    });

    // 开始观察
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-favorited']
    });
  }

  setupPeriodicCheck() {
    // 每5秒检查一次，确保按钮位置正确
    setInterval(() => {
      this.fixAllButtons();
    }, 5000);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 自动启动修复器
let fixer = null;

export function startEmojiButtonFixer() {
  if (!fixer) {
    fixer = new EmojiButtonPositionFixer();
    console.log('🚀 Emoji收藏按钮位置修复器已启动');
  }
  return fixer;
}

export function stopEmojiButtonFixer() {
  if (fixer) {
    fixer.destroy();
    fixer = null;
    console.log('🛑 Emoji收藏按钮位置修复器已停止');
  }
}

// 立即注入强制修复样式
function injectEmergencyStyles() {
  const style = document.createElement('style');
  style.id = 'emoji-button-emergency-fix';
  style.textContent = `
/* 🚨 紧急修复：收藏按钮位置强制修复 */
button.emoji-favorite-btn,
.emoji-favorite-btn,
button[data-favorited],
.emoji-grid-container button,
.avatar-card button {
  position: absolute !important;
  top: 6px !important;
  right: 6px !important;
  left: auto !important;
  bottom: auto !important;
  width: 24px !important;
  height: 24px !important;
  z-index: 9999 !important;
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 50% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
  translate: none !important;
  inset: auto !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
}

button.emoji-favorite-btn:hover,
.emoji-favorite-btn:hover {
  background: rgba(255, 255, 255, 1) !important;
  transform: scale(1.1) !important;
}

button.emoji-favorite-btn svg,
.emoji-favorite-btn svg {
  width: 14px !important;
  height: 14px !important;
  color: #6b7280 !important;
  fill: none !important;
  stroke: currentColor !important;
}

button.emoji-favorite-btn[data-favorited="true"],
.emoji-favorite-btn[data-favorited="true"] {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
}

button.emoji-favorite-btn[data-favorited="true"] svg,
.emoji-favorite-btn[data-favorited="true"] svg {
  color: #ef4444 !important;
  fill: #ef4444 !important;
}

/* 确保父容器相对定位 */
.avatar-card,
.emoji-grid-container > * {
  position: relative !important;
}
`;
  
  if (!document.getElementById('emoji-button-emergency-fix')) {
    document.head.appendChild(style);
    console.log('🚨 紧急注入收藏按钮修复样式');
  }
}

// 在页面加载完成后自动启动
if (typeof window !== 'undefined') {
  // 立即注入样式
  injectEmergencyStyles();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectEmergencyStyles();
      startEmojiButtonFixer();
    });
  } else {
    startEmojiButtonFixer();
  }
  
  // 确保在任何时候都有修复样式
  setTimeout(injectEmergencyStyles, 100);
  setTimeout(injectEmergencyStyles, 500);
  setTimeout(injectEmergencyStyles, 1000);
}