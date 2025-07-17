// 按钮点击问题诊断脚本
// 在浏览器控制台中运行此脚本来诊断问题

console.log('🔍 开始诊断按钮点击问题...');

// 1. 检查页面元素
console.log('=== 1. 检查页面元素 ===');
const heroButton = document.querySelector('button');
console.log('Hero按钮元素:', heroButton);

if (heroButton) {
  console.log('按钮文本:', heroButton.textContent);
  console.log('按钮样式:', heroButton.style);
  console.log('按钮类名:', heroButton.className);
  console.log('按钮是否可见:', heroButton.offsetParent !== null);
  console.log('按钮是否可点击:', !heroButton.disabled);
} else {
  console.error('❌ 未找到Hero按钮元素');
}

// 2. 检查事件监听器
console.log('=== 2. 检查事件监听器 ===');
if (heroButton) {
  const listeners = getEventListeners ? getEventListeners(heroButton) : 'getEventListeners不可用';
  console.log('按钮事件监听器:', listeners);
}

// 3. 检查React状态
console.log('=== 3. 检查React状态 ===');
console.log('React版本:', React?.version);
console.log('React Router版本:', window.ReactRouter?.version);

// 4. 检查认证状态
console.log('=== 4. 检查认证状态 ===');
const authingUser = localStorage.getItem('authing_user');
console.log('Authing用户信息:', authingUser);

// 5. 检查环境变量
console.log('=== 5. 检查环境变量 ===');
console.log('AUTHING_APP_ID:', import.meta?.env?.VITE_AUTHING_APP_ID);
console.log('AUTHING_HOST:', import.meta?.env?.VITE_AUTHING_HOST);

// 6. 检查控制台错误
console.log('=== 6. 检查控制台错误 ===');
console.log('请查看控制台是否有JavaScript错误');

// 7. 测试按钮点击
console.log('=== 7. 测试按钮点击 ===');
if (heroButton) {
  console.log('尝试模拟按钮点击...');
  try {
    heroButton.click();
    console.log('✅ 按钮点击模拟成功');
  } catch (error) {
    console.error('❌ 按钮点击模拟失败:', error);
  }
}

// 8. 检查网络请求
console.log('=== 8. 检查网络请求 ===');
console.log('请查看Network标签页是否有失败的请求');

// 9. 检查Authing Guard状态
console.log('=== 9. 检查Authing Guard状态 ===');
console.log('GuardFactory:', window.GuardFactory);
console.log('Guard实例:', window.guard);

// 10. 提供解决方案
console.log('=== 10. 解决方案建议 ===');
console.log('如果按钮没有反应，请尝试以下步骤：');
console.log('1. 刷新页面 (Ctrl+F5)');
console.log('2. 清除浏览器缓存');
console.log('3. 检查网络连接');
console.log('4. 查看控制台错误信息');
console.log('5. 访问 /button-test 页面进行详细测试');

console.log('🔍 诊断完成！'); 