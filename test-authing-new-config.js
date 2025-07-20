/**
 * 测试新的 Authing 配置
 * 验证应用ID、域名和回调地址是否正确
 */

const testAuthingConfig = () => {
  console.log('🧪 开始测试新的 Authing 配置...\n');

  // 新的配置信息
  const newConfig = {
    appId: '687bc631c105de597b993202',
    host: 'wenpaiai.authing.cn',
    redirectUri: 'http://localhost:5173/callback',
    endpoints: {
      token: 'https://wenpaiai.authing.cn/oidc/token',
      userInfo: 'https://wenpaiai.authing.cn/oidc/me',
      logout: 'https://wenpaiai.authing.cn/oidc/session/end',
      jwks: 'https://wenpaiai.authing.cn/oidc/.well-known/jwks.json',
      auth: 'https://wenpaiai.authing.cn/oidc/auth',
      issuer: 'https://wenpaiai.authing.cn/oidc',
      discovery: 'https://wenpaiai.authing.cn/oidc/.well-known/openid-configuration'
    }
  };

  console.log('📋 新配置信息:');
  console.log('App ID:', newConfig.appId);
  console.log('域名:', newConfig.host);
  console.log('回调地址:', newConfig.redirectUri);
  console.log('');

  // 验证配置格式
  console.log('✅ 配置格式验证:');
  console.log('- App ID 格式正确:', /^[a-f0-9]{24}$/.test(newConfig.appId));
  console.log('- 域名格式正确:', /^[a-z0-9-]+\.authing\.cn$/.test(newConfig.host));
  console.log('- 回调地址格式正确:', /^https?:\/\/[^\/]+\/callback$/.test(newConfig.redirectUri));
  console.log('');

  // 测试端点可访问性
  console.log('🌐 端点可访问性测试:');
  
  const testEndpoint = async (url, name) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`- ${name}: ${response.ok ? '✅ 可访问' : '❌ 不可访问'} (${response.status})`);
    } catch (error) {
      console.log(`- ${name}: ❌ 连接失败 (${error.message})`);
    }
  };

  // 测试各个端点
  Promise.all([
    testEndpoint(newConfig.endpoints.discovery, '服务发现端点'),
    testEndpoint(newConfig.endpoints.jwks, 'JWKS 端点'),
    testEndpoint(newConfig.endpoints.auth, '认证端点')
  ]).then(() => {
    console.log('\n🎯 配置测试完成！');
    console.log('\n📝 下一步操作:');
    console.log('1. 在 Authing 控制台设置回调地址为:', newConfig.redirectUri);
    console.log('2. 启动开发服务器: npm run dev');
    console.log('3. 访问 http://localhost:5173 测试登录功能');
  });
};

// 如果在浏览器环境中运行
if (typeof window !== 'undefined') {
  window.testAuthingConfig = testAuthingConfig;
  console.log('🧪 Authing 配置测试脚本已加载');
  console.log('运行 window.testAuthingConfig() 开始测试');
} else {
  // 在 Node.js 环境中运行
  testAuthingConfig();
} 