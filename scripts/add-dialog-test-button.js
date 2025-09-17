/**
 * 🧪 Dialog测试按钮注入脚本
 * 用于在页面上添加测试按钮，验证Dialog渲染
 */

function addDialogTestButton() {
  // 移除已存在的测试按钮
  const existingButton = document.getElementById('dialog-test-button');
  if (existingButton) {
    existingButton.remove();
  }

  // 创建测试按钮
  const testButton = document.createElement('button');
  testButton.id = 'dialog-test-button';
  testButton.innerHTML = '🧪 测试Dialog';
  testButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: #ff0000;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `;

  // 点击事件
  testButton.onclick = function() {
    console.log('🧪 创建测试Dialog...');
    
    // 创建Portal容器
    let portal = document.getElementById('dialog-portal-root');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'dialog-portal-root';
      portal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: auto;
        z-index: 1000;
        display: block;
        visibility: visible;
        opacity: 1;
        background: transparent;
        overflow: visible;
      `;
      document.body.appendChild(portal);
    }

    // 创建背景遮罩
    const overlay = document.createElement('div');
    overlay.setAttribute('data-radix-dialog-overlay', '');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      z-index: 999997;
      background-color: rgba(255, 0, 0, 0.3);
      backdrop-filter: blur(2px);
      display: block;
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
    `;

    // 创建Dialog元素
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    dialog.className = 'quick-reference-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999999;
      display: block;
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
      background: #ffffff;
      border: 3px solid #ff0000;
      border-radius: 8px;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
      padding: 20px;
      min-width: 400px;
      min-height: 300px;
      max-width: 90vw;
      max-height: 80vh;
      width: auto;
      height: auto;
      color: #000000;
      font-size: 14px;
    `;

    dialog.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h2 style="color: #000000; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">
          🧪 测试Dialog
        </h2>
        <p style="color: #000000; font-size: 14px; margin: 0;">
          如果你看到这个Dialog，说明基本渲染正常！
        </p>
        <p style="color: #666; font-size: 12px; margin: 10px 0 0 0;">
          红色边框是调试标识
        </p>
      </div>
      
      <div style="text-align: center;">
        <button id="close-test-dialog" style="
          background: #ff0000;
          color: #ffffff;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">
          关闭测试Dialog
        </button>
      </div>
      
      <button id="close-test-dialog-x" style="
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff0000;
        color: #ffffff;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ×
      </button>
    `;

    // 添加关闭功能
    const closeHandler = () => {
      portal.removeChild(overlay);
      portal.removeChild(dialog);
      console.log('🧪 测试Dialog已关闭');
    };

    dialog.querySelector('#close-test-dialog').onclick = closeHandler;
    dialog.querySelector('#close-test-dialog-x').onclick = closeHandler;
    overlay.onclick = closeHandler;

    // 添加到Portal
    portal.appendChild(overlay);
    portal.appendChild(dialog);

    console.log('✅ 测试Dialog已创建');
    console.log('📐 Dialog元素:', dialog);
    console.log('📐 Dialog位置:', dialog.getBoundingClientRect());
  };

  // 添加到页面
  document.body.appendChild(testButton);
  console.log('✅ 测试按钮已添加到页面右上角');
}

// 立即执行
addDialogTestButton();

// 导出函数
window.addDialogTestButton = addDialogTestButton;

console.log('🧪 Dialog测试工具已加载');
console.log('📋 使用方法: 点击右上角红色"🧪 测试Dialog"按钮');