/**
 * 诊断Authing应用状态
 * 检查新应用的配置和状态
 */

const https = require('https');

console.log('🔍 诊断Authing应用状态...\n');

// 新应用配置
const appConfig = {
  appId: '687bc631c105de597b993202',
  host: 'ai-wenpai.authing.cn/687e0aafee2b84f86685b644',
  redirectUri: 'http://localhost:5173/callback'
};

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
        resolve({ success: true, status: res.statusCode, data });
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${description}: 请求超时`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });
  });
}

async function runDiagnostics() {
  console.log('📋 应用配置信息:');
  console.log('- App ID:', appConfig.appId);
  console.log('- 域名:', appConfig.host);
  console.log('- 回调地址:', appConfig.redirectUri);
  console.log('');

  // 测试1: 检查应用公共配置
  console.log('🔧 测试1: 检查应用公共配置...');
  await testEndpoint(
    `https://${appConfig.host}/api/v2/applications/${appConfig.appId}/public-config`,
    '应用公共配置'
  );

  // 测试2: 检查应用详情
  console.log('\n📋 测试2: 检查应用详情...');
  await testEndpoint(
    `https://${appConfig.host}/api/v2/applications/${appConfig.appId}`,
    '应用详情'
  );

  // 测试3: 检查登录页面
  console.log('\n🌐 测试3: 检查登录页面...');
  await testEndpoint(
    `https://${appConfig.host}/login?app_id=${appConfig.appId}`,
    '登录页面'
  );

  // 测试4: 检查注册页面
  console.log('\n📝 测试4: 检查注册页面...');
  await testEndpoint(
    `https://${appConfig.host}/register?app_id=${appConfig.appId}`,
    '注册页面'
  );

  // 测试5: 检查OIDC授权端点
  console.log('\n🔐 测试5: 检查OIDC授权端点...');
  const oidcUrl = new URL(`https://${appConfig.host}/oidc/auth`);
  oidcUrl.searchParams.set('client_id', appConfig.appId);
  oidcUrl.searchParams.set('redirect_uri', appConfig.redirectUri);
  oidcUrl.searchParams.set('response_type', 'code');
  oidcUrl.searchParams.set('scope', 'openid profile email');
  oidcUrl.searchParams.set('state', 'test-' + Date.now());
  
  await testEndpoint(oidcUrl.toString(), 'OIDC授权端点');

  // 测试6: 检查OIDC授权端点（带注册提示）
  console.log('\n📝 测试6: 检查OIDC授权端点（注册模式）...');
  const oidcRegisterUrl = new URL(`https://${appConfig.host}/oidc/auth`);
  oidcRegisterUrl.searchParams.set('client_id', appConfig.appId);
  oidcRegisterUrl.searchParams.set('redirect_uri', appConfig.redirectUri);
  oidcRegisterUrl.searchParams.set('response_type', 'code');
  oidcRegisterUrl.searchParams.set('scope', 'openid profile email');
  oidcRegisterUrl.searchParams.set('state', 'test-register-' + Date.now());
  oidcRegisterUrl.searchParams.set('screen_hint', 'signup');
  
  await testEndpoint(oidcRegisterUrl.toString(), 'OIDC授权端点（注册）');

  // 生成不同的URL格式进行测试
  console.log('\n🔗 生成不同格式的测试URL...');
  
  // 格式1: 标准登录URL
  const loginUrl1 = `https://${appConfig.host}/login?app_id=${appConfig.appId}`;
  console.log('格式1 - 标准登录:', loginUrl1);
  
  // 格式2: 带协议参数的登录URL
  const loginUrl2 = `https://${appConfig.host}/login?app_id=${appConfig.appId}&protocol=oidc`;
  console.log('格式2 - 带协议登录:', loginUrl2);
  
  // 格式3: 注册URL
  const registerUrl1 = `https://${appConfig.host}/register?app_id=${appConfig.appId}`;
  console.log('格式3 - 标准注册:', registerUrl1);
  
  // 格式4: 带注册提示的登录URL
  const loginUrl3 = `https://${appConfig.host}/login?app_id=${appConfig.appId}&screen_hint=signup`;
  console.log('格式4 - 注册提示登录:', loginUrl3);

  console.log('\n🎯 诊断总结:');
  console.log('================================');
  console.log('✅ 配置信息:');
  console.log('- 使用新的Authing应用');
  console.log('- 域名: ai-wenpai.authing.cn/687e0aafee2b84f86685b644');
  console.log('- App ID: 687bc631c105de597b993202');
  
  console.log('\n🔧 可能的问题:');
  console.log('1. Authing应用可能未正确配置');
  console.log('2. 回调URL可能未在Authing控制台设置');
  console.log('3. 应用可能未启用或权限不足');
  console.log('4. 可能需要使用不同的URL格式');
  
  console.log('\n📝 建议的修复步骤:');
  console.log('1. 登录Authing控制台: https://console.authing.cn/');
  console.log('2. 找到应用: 687bc631c105de597b993202');
  console.log('3. 检查应用状态是否启用');
  console.log('4. 配置回调URL: http://localhost:5173/callback');
  console.log('5. 检查应用权限设置');
  console.log('6. 测试不同的URL格式');
  
  console.log('\n✅ 诊断完成！');
}

// 运行诊断
runDiagnostics().catch(console.error); 