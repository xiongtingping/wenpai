/**
 * 等待并重新测试 - 给Authing后台配置一些时间生效
 */

const https = require('https');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testAuthRequest() {
  const params = new URLSearchParams({
    nonce: Math.random().toString().substring(2),
    state: Math.random().toString().substring(2), 
    scope: 'openid profile email phone address',
    client_id: '68a68a29d0c3341ae7a3df23',
    redirect_uri: 'https://www.wenpai.xyz/callback',
    response_type: 'code',
    response_mode: 'query',
    code_challenge: 'test_' + Math.random().toString(36).substring(2),
    code_challenge_method: 'S256'
  });
  
  const authUrl = `https://rzcswqs4sq0f.authing.cn/oidc/auth?${params.toString()}`;
  
  return new Promise((resolve) => {
    const req = https.request(authUrl, {
      method: 'GET',
      timeout: 8000
    }, (res) => {
      resolve({ statusCode: res.statusCode, success: res.statusCode !== 400 });
    });
    
    req.on('error', () => resolve({ success: false, error: 'network' }));
    req.on('timeout', () => resolve({ success: false, error: 'timeout' }));
    req.end();
  });
}

async function waitAndTest() {
  console.log('⏳ 等待Authing后台配置生效...\n');
  
  const intervals = [30, 60, 120]; // 30秒, 1分钟, 2分钟
  
  for (let i = 0; i < intervals.length; i++) {
    const waitTime = intervals[i];
    console.log(`⏱️ 等待 ${waitTime} 秒...`);
    
    await sleep(waitTime * 1000);
    
    console.log(`🔄 第 ${i + 1} 次重测...`);
    const result = await testAuthRequest();
    
    console.log(`📊 结果: ${result.statusCode || 'ERROR'} - ${result.success ? '成功' : '失败'}`);
    
    if (result.success) {
      console.log('\n🎉 测试通过！400错误已解决');
      return true;
    }
  }
  
  console.log('\n❌ 多次重测后仍有问题');
  console.log('💡 可能需要更多时间或手动检查后台配置');
  return false;
}

waitAndTest();