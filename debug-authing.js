/**
 * Authing 调试工具
 */

import { AuthenticationClient } from 'authing-js-sdk';

// 模拟浏览器环境
global.window = global;
global.location = { href: 'http://localhost:3000' };

const config = {
  appId: '688237f7f9e118de849dc274',
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:3000/callback'
};

console.log('=== Authing 调试信息 ===');
console.log('');

console.log('1. 当前配置:');
console.log('- App ID:', config.appId);
console.log('- Host:', config.host);
console.log('- Redirect URI:', config.redirectUri);
console.log('');

try {
  console.log('2. 创建 AuthenticationClient...');
  const authing = new AuthenticationClient({
    appId: config.appId,
    appHost: config.host,
    onError: (code, message, data) => {
      console.error('Authing error:', { code, message, data });
    }
  });
  console.log('✅ AuthenticationClient 创建成功');
  console.log('');

  console.log('3. 构建授权 URL...');
  const authorizeUrl = authing.buildAuthorizeUrl({
    redirectUri: config.redirectUri,
    scope: 'openid profile email phone',
    state: 'test-state-123',
  });
  console.log('✅ 授权 URL 构建成功');
  console.log('授权 URL:', authorizeUrl);
  console.log('');

  console.log('4. 解析授权 URL 参数:');
  const url = new URL(authorizeUrl);
  console.log('- 协议:', url.protocol);
  console.log('- 主机:', url.host);
  console.log('- 路径:', url.pathname);
  console.log('- 查询参数:');
  url.searchParams.forEach((value, key) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('');

  console.log('5. 需要在 Authing 控制台配置的回调 URL:');
  console.log('请在 Authing 控制台添加以下 URL 到"登录回调 URL"白名单:');
  console.log(`   ${config.redirectUri}`);
  console.log('');

  console.log('6. 其他可能需要的回调 URL:');
  console.log('- http://localhost:3000/callback');
  console.log('- http://localhost:3001/callback');
  console.log('- http://localhost:3002/callback');
  console.log('- http://localhost:5173/callback');
  console.log('');

  console.log('7. 控制台配置步骤:');
  console.log('1. 访问: https://console.authing.cn/');
  console.log('2. 进入"应用管理"');
  console.log('3. 选择应用 ID: 688237f7f9e118de849dc274');
  console.log('4. 进入"应用配置"');
  console.log('5. 找到"登录回调 URL"');
  console.log('6. 添加: http://localhost:3000/callback');
  console.log('7. 保存配置');
  console.log('');

} catch (error) {
  console.error('❌ 调试过程中出现错误:', error);
}

console.log('=== 调试完成 ==='); 