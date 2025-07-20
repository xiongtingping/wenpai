/**
 * 测试旧Authing应用配置
 * 验证旧应用是否仍然有效
 */

const https = require('https');

console.log('🔍 测试旧Authing应用配置...\n');

// 旧应用配置
const oldConfig = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'qutkgzkfaezk-demo.authing.cn',
  redirectUri: 'http://localhost:5173/callback'
};

console.log('📋 旧应用配置:');
console.log('- App ID:', oldConfig.appId);
console.log('- 域名:', oldConfig.host);
console.log('- 回调地址:', oldConfig.redirectUri);
console.log('');

// 测试函数
async function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`   📄 响应数据:`, JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log(`   📄 响应数据: ${data.substring(0, 200)}...`);
          }
        }
        resolve({ success: true, status: res.statusCode });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ ${description}: 请求超时`);
      resolve({ success: false, error: 'timeout' });
    });
  });
}

// 运行测试
async function runTests() {
  console.log('🧪 开始测试...\n');
  
  // 测试1: 域名访问
  await testEndpoint(
    `https://${oldConfig.host}`,
    '旧应用域名访问'
  );
  
  // 测试2: 应用公共配置
  await testEndpoint(
    `https://${oldConfig.host}/api/v3/applications/${oldConfig.appId}/public-config`,
    '旧应用公共配置'
  );
  
  // 测试3: 应用详情
  await testEndpoint(
    `https://${oldConfig.host}/api/v3/applications/${oldConfig.appId}`,
    '旧应用详情'
  );
  
  // 测试4: 登录页面
  await testEndpoint(
    `https://${oldConfig.host}/login?app_id=${oldConfig.appId}`,
    '旧应用登录页面'
  );
  
  // 测试5: 注册页面
  await testEndpoint(
    `https://${oldConfig.host}/register?app_id=${oldConfig.appId}`,
    '旧应用注册页面'
  );
  
  // 测试6: OIDC授权端点
  const oidcUrl = new URL(`https://${oldConfig.host}/oidc/auth`);
  oidcUrl.searchParams.set('client_id', oldConfig.appId);
  oidcUrl.searchParams.set('redirect_uri', oldConfig.redirectUri);
  oidcUrl.searchParams.set('response_type', 'code');
  oidcUrl.searchParams.set('scope', 'openid profile email');
  oidcUrl.searchParams.set('state', 'test-' + Date.now());
  
  await testEndpoint(
    oidcUrl.toString(),
    '旧应用OIDC授权端点'
  );
  
  console.log('\n🎯 测试完成！');
  console.log('如果所有测试都通过，旧应用配置应该可以正常工作。');
}

runTests().catch(console.error); 