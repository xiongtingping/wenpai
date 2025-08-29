/**
 * 深度调试Authing API响应，找出400错误真正根因
 */

const https = require('https');

// 测试不同的Authing API端点
const API_ENDPOINTS = {
  publicConfig: 'https://core.authing.cn/api/v2/applications/68a68a29d0c3341ae7a3df23/public-config',
  appDetails: 'https://rzcswqs4sq0f.authing.cn/api/v2/applications/68a68a29d0c3341ae7a3df23',
  oidcConfig: 'https://rzcswqs4sq0f.authing.cn/.well-known/openid_configuration'
};

async function testApiEndpoint(name, url) {
  console.log(`🔍 测试 ${name}...`);
  console.log(`📍 ${url}`);
  
  return new Promise((resolve) => {
    const req = https.request(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }, (res) => {
      console.log(`📊 状态: ${res.statusCode}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ 响应解析成功`);
          
          if (name === 'publicConfig') {
            const redirectUris = parsed?.oidc?.redirect_uris || parsed?.redirectUris || parsed?.redirectUrisWhitelist || [];
            console.log(`📋 redirect_uris: [${redirectUris.length}] ${JSON.stringify(redirectUris)}`);
            
            if (redirectUris.length === 0) {
              console.log('❌ 关键问题：redirect_uris为空数组！');
            }
          } else if (name === 'oidcConfig') {
            console.log(`📋 issuer: ${parsed.issuer || 'N/A'}`);
            console.log(`📋 authorization_endpoint: ${parsed.authorization_endpoint || 'N/A'}`);
          }
          
          resolve({ success: true, data: parsed, statusCode: res.statusCode });
        } catch (e) {
          console.log(`❌ JSON解析失败: ${e.message}`);
          console.log(`📄 原始响应: ${data.substring(0, 200)}...`);
          resolve({ success: false, error: e.message, rawData: data });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ 请求失败: ${err.message}`);
      resolve({ success: false, error: err.message });
    });
    
    req.end();
  });
}

// 测试认证请求的详细错误信息
async function analyzeAuthError() {
  console.log('🧪 分析认证请求错误...');
  
  const authUrl = 'https://rzcswqs4sq0f.authing.cn/oidc/auth?' + new URLSearchParams({
    nonce: 'test_nonce_12345',
    state: 'test_state_67890', 
    scope: 'openid profile email phone address',
    client_id: '68a68a29d0c3341ae7a3df23',
    redirect_uri: 'https://www.wenpai.xyz/callback',
    response_type: 'code',
    response_mode: 'query',
    code_challenge: 'test_challenge_abcdef',
    code_challenge_method: 'S256'
  });
  
  return new Promise((resolve) => {
    const req = https.request(authUrl, {
      method: 'GET',
      timeout: 10000
    }, (res) => {
      console.log(`📊 认证请求状态: ${res.statusCode}`);
      console.log('📋 响应头:', Object.keys(res.headers).map(k => `${k}: ${res.headers[k]}`).join('\n  '));
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 400) {
          console.log('\n❌ 400错误详情:');
          
          // 尝试从HTML中提取错误信息
          const errorMatch = data.match(/<title>(.*?)<\/title>/i);
          if (errorMatch) {
            console.log(`  标题: ${errorMatch[1]}`);
          }
          
          const bodyMatch = data.match(/<body[^>]*>(.*?)<\/body>/is);
          if (bodyMatch) {
            const bodyText = bodyMatch[1].replace(/<[^>]+>/g, '').trim();
            console.log(`  错误信息: ${bodyText.substring(0, 200)}...`);
          }
          
          // 检查是否是redirect_uri相关错误
          if (data.includes('redirect_uri') || data.includes('callback')) {
            console.log('🎯 确认：这是redirect_uri相关的400错误');
          }
        }
        
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    
    req.on('error', (err) => {
      resolve({ error: err.message });
    });
    
    req.end();
  });
}

async function runDeepAnalysis() {
  console.log('🚀 开始Authing API深度分析\n');
  
  try {
    // 1. 测试各个API端点
    for (const [name, url] of Object.entries(API_ENDPOINTS)) {
      const result = await testApiEndpoint(name, url);
      console.log('---\n');
      
      if (name === 'publicConfig' && result.success) {
        const redirectUris = result.data?.oidc?.redirect_uris || result.data?.redirectUris || [];
        if (redirectUris.length === 0) {
          console.log('🔴 根因确认：Authing后台redirect_uris配置确实为空！');
          console.log('💡 尽管你说后台已配置，但API返回空数组');
          console.log('🔧 可能原因：');
          console.log('  1. 配置未保存');
          console.log('  2. 配置未同步到API');
          console.log('  3. 缓存问题');
          console.log('  4. 应用配置页面与OIDC配置不同步\n');
        }
      }
    }
    
    // 2. 分析具体的400错误
    console.log('🔬 分析400错误详情...');
    await analyzeAuthError();
    
  } catch (error) {
    console.error('❌ 分析失败:', error.message);
  }
}

runDeepAnalysis();