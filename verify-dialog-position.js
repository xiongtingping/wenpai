/**
 * 🎯 使用Playwright自动验证快速引用弹窗修复
 */

const { chromium } = require('playwright');

async function verifyDialogFix() {
  console.log('🚀 启动自动化验证...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // 导航到应用
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 页面已加载');
    
    // 查找快速引用按钮
    const quickRefButton = await page.locator('button[title*="快速引用"], button:has(.lucide-at-sign)').first();
    
    if (!(await quickRefButton.isVisible())) {
      console.log('❌ 快速引用按钮不可见');
      return;
    }
    
    console.log('✅ 找到快速引用按钮');
    
    // 点击打开弹窗
    await quickRefButton.click();
    
    // 等待弹窗出现
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    console.log('✅ 弹窗已出现');
    
    // 验证弹窗位置
    const dialog = await page.locator('[role="dialog"]').first();
    const dialogBox = await dialog.boundingBox();
    const viewport = page.viewportSize();
    
    const viewportCenter = {
      x: viewport.width / 2,
      y: viewport.height / 2
    };
    
    const dialogCenter = {
      x: dialogBox.x + dialogBox.width / 2,
      y: dialogBox.y + dialogBox.height / 2
    };
    
    const offset = {
      x: Math.abs(dialogCenter.x - viewportCenter.x),
      y: Math.abs(dialogCenter.y - viewportCenter.y)
    };
    
    const isCentered = offset.x < 5 && offset.y < 5;
    
    console.log('🎯 弹窗位置验证:', {
      viewport: viewportCenter,
      dialog: dialogCenter,
      offset: offset,
      isCentered: isCentered ? '✅ 完美居中' : '❌ 未居中'
    });
    
    // 验证CSS样式
    const dialogStyles = await dialog.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        transform: computed.transform,
        zIndex: computed.zIndex
      };
    });
    
    console.log('🎨 Dialog CSS样式:', dialogStyles);
    
    // 验证背景遮罩
    const overlay = await page.locator('[data-radix-dialog-overlay]').first();
    const overlayBox = await overlay.boundingBox();
    const isOverlayFullscreen = 
      overlayBox.x === 0 && 
      overlayBox.y === 0 && 
      overlayBox.width === viewport.width && 
      overlayBox.height === viewport.height;
    
    console.log('🌃 背景遮罩验证:', {
      overlay: overlayBox,
      viewport: viewport,
      isFullscreen: isOverlayFullscreen ? '✅ 全屏覆盖' : '❌ 覆盖异常'
    });
    
    // 验证滚动锁定
    const bodyStyles = await page.evaluate(() => {
      return {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top
      };
    });
    
    const scrollLocked = bodyStyles.overflow === 'hidden' && bodyStyles.position === 'fixed';
    
    console.log('🔒 滚动锁定验证:', {
      bodyStyles: bodyStyles,
      scrollLocked: scrollLocked ? '✅ 已锁定' : '❌ 未锁定'
    });
    
    // 综合评估
    const allTestsPassed = isCentered && isOverlayFullscreen && scrollLocked;
    
    console.log('\n🏆 验证结果总结:');
    console.log('===============================');
    console.log(`🎯 弹窗居中: ${isCentered ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🌃 背景遮罩: ${isOverlayFullscreen ? '✅ 通过' : '❌ 失败'}`);
    console.log(`🔒 滚动锁定: ${scrollLocked ? '✅ 通过' : '❌ 失败'}`);
    console.log('===============================');
    console.log(`🎉 修复状态: ${allTestsPassed ? '✅ 完全成功' : '❌ 需要修复'}`);
    
    if (allTestsPassed) {
      console.log('🎊 快速引用弹窗修复符合CLAUDE.md 3.6.2节规范！');
    }
    
    // 测试关闭功能
    await overlay.click();
    await page.waitForTimeout(500);
    
    const dialogAfterClose = await page.locator('[role="dialog"]').count();
    console.log(`🚪 弹窗关闭测试: ${dialogAfterClose === 0 ? '✅ 正常关闭' : '❌ 关闭异常'}`);
    
  } catch (error) {
    console.error('❌ 验证过程出错:', error.message);
  } finally {
    await browser.close();
  }
}

// 检查Playwright是否可用
try {
  verifyDialogFix();
} catch (error) {
  console.log('⚠️  Playwright不可用，请手动验证');
  console.log('👉 打开 http://localhost:5174 手动测试快速引用弹窗');
}