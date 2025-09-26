/**
 * 临时脚本：应用emoji颜色更新
 * 直接在浏览器控制台运行或在应用启动时执行
 */

// 立即应用颜色更新的函数
async function applyEmojiColorUpdate() {
  try {
    console.log('🎨 开始应用emoji颜色多样化更新...');
    
    // 动态导入模块
    const { applyDiversifiedColors } = await import('./src/services/unifiedEmojiSystem.ts');
    
    // 应用更新
    applyDiversifiedColors();
    
    console.log('✅ 颜色更新已启动！请等待几秒钟...');
    
    // 等待更新完成后刷新页面
    setTimeout(() => {
      console.log('🔄 刷新页面以查看效果...');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ 应用颜色更新失败:', error);
  }
}

// 如果在浏览器环境中，立即执行
if (typeof window !== 'undefined') {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyEmojiColorUpdate);
  } else {
    applyEmojiColorUpdate();
  }
}

// 导出供其他地方使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyEmojiColorUpdate };
}