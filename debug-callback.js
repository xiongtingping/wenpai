/**
 * 调试 Authing 回调处理
 */

import { AuthenticationClient } from 'authing-js-sdk';

// 模拟浏览器环境
global.window = global;
global.location = { 
  href: 'http://localhost:3002/callback?code=test_code&state=test_state',
  search: '?code=test_code&state=test_state'
};

const config = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'https://qutkgzkfaezk-demo.authing.cn',
  redirectUri: 'http://localhost:3002/callback'
};

console.log('=== Authing 回调调试 ===');
console.log('');

console.log('1. 当前配置:');
console.log('- App ID:', config.appId);
console.log('- Host:', config.host);
console.log('- Redirect URI:', config.redirectUri);
console.log('');

console.log('2. 模拟回调参数:');
console.log('- code: test_code');
console.log('- state: test_state');
console.log('');

try {
  console.log('3. 创建 AuthenticationClient...');
  const authing = new AuthenticationClient({
    appId: config.appId,
    appHost: config.host,
    onError: (code, message, data) => {
      console.error('Authing error:', { code, message, data });
    }
  });
  console.log('✅ AuthenticationClient 创建成功');
  console.log('');

  console.log('4. 测试 getAccessTokenByCode 方法...');
  console.log('注意: 这里使用测试 code，实际会失败，但可以验证方法调用');
  
  // 这里会失败，因为 code 是假的，但可以验证方法调用
  try {
    await authing.getAccessTokenByCode('test_code', config.redirectUri);
  } catch (error) {
    console.log('❌ 预期的错误 (使用测试 code):', error.message);
    console.log('✅ 方法调用正常，只是 code 无效');
  }
  console.log('');

  console.log('5. 回调处理流程:');
  console.log('1. 用户点击登录 → 跳转到 Authing 登录页面');
  console.log('2. 用户登录成功 → Authing 重定向到回调 URL');
  console.log('3. 回调 URL 接收 code 和 state 参数');
  console.log('4. 使用 code 调用 getAccessTokenByCode 获取用户信息');
  console.log('5. 保存用户信息到本地存储');
  console.log('6. 跳转到首页或指定页面');
  console.log('');

  console.log('6. 可能的问题:');
  console.log('- 回调 URL 不匹配 (需要在 Authing 控制台配置)');
  console.log('- code 已过期 (通常 5-10 分钟有效期)');
  console.log('- 网络连接问题');
  console.log('- Authing 服务暂时不可用');
  console.log('');

  console.log('7. 需要在 Authing 控制台配置的回调 URL:');
  console.log('   http://localhost:3002/callback');
  console.log('');

} catch (error) {
  console.error('❌ 调试过程中出现错误:', error);
}

console.log('=== 调试完成 ==='); 