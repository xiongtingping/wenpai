/**
 * 测试实际认证流程，模拟前端请求
 */

const https = require('https');

// 构建认证URL (模拟前端逻辑)
function buildAuthUrl() {
  const params = new URLSearchParams({
    nonce: Math.random().toString().substring(2),
    state: Math.random().toString().substring(2),
    scope: 'openid profile email phone address',
    client_id: '68a68a29d0c3341ae7a3df23',
    redirect_uri: 'https://www.wenpai.xyz/callback', // 使用修复后的固定回调
    response_type: 'code',
    response_mode: 'query',
    code_challenge: 'test_challenge',
    code_challenge_method: 'S256'
  });
  
  return `https://rzcswqs4sq0f.authing.cn/oidc/auth?${params.toString()}`;
}

async function testAuthRequest() {
  const authUrl = buildAuthUrl();
  console.log('🧪 测试认证请求...');
  console.log('📍 URL:', authUrl);
  
  return new Promise((resolve) => {
    const req = https.request(authUrl, {
      method: 'GET',
      timeout: 10000
    }, (res) => {
      console.log(`📊 响应状态: ${res.statusCode}`);
      console.log('📋 响应头:', res.headers);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const result = {
          statusCode: res.statusCode,
          headers: res.headers,
          success: res.statusCode !== 400,
          bodyLength: data.length
        };
        
        if (res.statusCode === 400) {
          console.log('❌ 仍然收到400错误');
          console.log('📄 响应体预览:', data.substring(0, 200));
        } else if (res.statusCode === 302 || res.statusCode === 200) {
          console.log('✅ 认证请求成功！');
        } else {
          console.log(`⚠️ 意外状态码: ${res.statusCode}`);
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ 请求失败:', err.message);
      resolve({ success: false, error: err.message });
    });
    
    req.on('timeout', () => {
      console.log('⏱️ 请求超时');
      resolve({ success: false, error: 'timeout' });
    });
    
    req.end();
  });
}

async function runTest() {
  console.log('🚀 开始测试认证流程\n');
  
  try {
    // 1. 测试网站可访问性
    console.log('1️⃣ 检查网站状态...');
    const deploymentReady = await new Promise((resolve) => {
      const req = https.request('https://www.wenpai.xyz/', {
        method: 'HEAD',
        timeout: 5000
      }, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.end();
    });
    
    if (!deploymentReady) {
      throw new Error('网站不可访问');
    }
    console.log('✅ 网站可访问\n');
    
    // 2. 测试认证请求
    console.log('2️⃣ 测试认证请求...');
    const authResult = await testAuthRequest();
    
    console.log('\n📊 测试结果:');
    console.log(JSON.stringify(authResult, null, 2));
    
    // 3. 分析结果
    if (authResult.success) {
      console.log('\n🎉 认证流程测试通过！');
      console.log('✅ redirectUri修复已生效');
      console.log('✅ 400错误已解决');
    } else {
      console.log('\n❌ 认证流程仍有问题');
      if (authResult.statusCode === 400) {
        console.log('💡 建议检查Authing后台redirect_uris配置');
      }
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
runTest();