/**
 * 检查 Authing 配置的脚本
 */

// 直接显示配置信息，避免导入问题
console.log('=== Authing 配置检查 ===');
console.log('');

console.log('当前配置:');
console.log('- App ID: 6867fdc88034eb95ae86167d');
console.log('- Host: https://qutkgzkfaezk-demo.authing.cn');
console.log('- Redirect URI: http://localhost:3001/callback');
console.log('- Mode: normal');
console.log('- Default Scene: login');
console.log('');

console.log('=== 需要在 Authing 控制台配置的回调 URL ===');
console.log('请在 Authing 控制台的以下位置添加回调 URL:');
console.log('1. 进入应用管理');
console.log('2. 选择你的应用');
console.log('3. 进入"应用配置"');
console.log('4. 找到"登录回调 URL"');
console.log('5. 添加以下 URL:');
console.log('   http://localhost:3001/callback');
console.log('');

console.log('=== 其他可能需要的回调 URL ===');
console.log('如果需要在其他端口测试，也可以添加:');
console.log('- http://localhost:3000/callback');
console.log('- http://localhost:3002/callback');
console.log('- http://localhost:5173/callback');
console.log('');

console.log('=== 检查完成 ==='); 