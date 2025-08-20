#!/usr/bin/env node

/**
 * 测试不同认证参数组合
 */

const https = require('https');

const APP_ID = '68823897631e1ef8ff3720b2';
const HOST = 'rzcswqs4sq0f.authing.cn';
const REDIRECT_URI = 'https://www.wenpai.xyz/callback';

// 测试不同的参数组合
const testCases = [
  {
    name: '基础参数',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code'
    }
  },
  {
    name: '添加scope',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid'
    }
  },
  {
    name: '完整scope',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email phone'
    }
  },
  {
    name: '添加state',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'openid',
      state: 'test'
    }
  },
  {
    name: '移除所有可选参数',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code'
    }
  },
  {
    name: '使用不同的response_type',
    params: {
      client_id: APP_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token token',
      scope: 'openid',
      nonce: 'test-nonce'
    }
  }
];

/**
 * 测试单个参数组合
 */
function testAuthParams(testCase) {
  return new Promise((resolve) => {
    const params = new URLSearchParams(testCase.params);
    const authUrl = `https://${HOST}/${APP_ID}/oidc/auth?${params.toString()}`;
    
    console.log(`\n🔍 测试: ${testCase.name}`);
    console.log(`参数: ${JSON.stringify(testCase.params, null, 2)}`);
    
    const req = https.request(authUrl, { method: 'GET' }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && !data.includes('redirect_uri_mismatch')) {
          console.log('   ✅ 成功 - 无redirect_uri_mismatch错误');
          resolve({ ...testCase, status: 'success', code: res.statusCode });
        } else if (res.statusCode === 302) {
          console.log('   ✅ 重定向 - 可能成功');
          console.log(`   重定向到: ${res.headers.location}`);
          resolve({ ...testCase, status: 'redirect', code: res.statusCode, location: res.headers.location });
        } else if (data.includes('redirect_uri_mismatch')) {
          console.log('   ❌ 失败 - redirect_uri_mismatch');
          resolve({ ...testCase, status: 'mismatch', code: res.statusCode });
        } else {
          console.log(`   ⚠️  其他状态: ${res.statusCode}`);
          const errorMatch = data.match(/<span class="title">error<\/span>: <span class="titleTxt">([^<]+)<\/span>/);
          const error = errorMatch ? errorMatch[1] : 'unknown';
          console.log(`   错误: ${error}`);
          resolve({ ...testCase, status: 'error', code: res.statusCode, error });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ 网络错误: ${err.message}`);
      resolve({ ...testCase, status: 'network_error', error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log('   ❌ 请求超时');
      req.destroy();
      resolve({ ...testCase, status: 'timeout' });
    });
    
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 测试不同认证参数组合');
  console.log('================================');
  console.log(`App ID: ${APP_ID}`);
  console.log(`Host: ${HOST}`);
  console.log(`Redirect URI: ${REDIRECT_URI}`);
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await testAuthParams(testCase);
    results.push(result);
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 测试结果汇总:');
  console.log('================================');
  
  const successful = results.filter(r => r.status === 'success' || r.status === 'redirect');
  const failed = results.filter(r => r.status === 'mismatch');
  
  if (successful.length > 0) {
    console.log('\n✅ 成功的参数组合:');
    successful.forEach(result => {
      console.log(`   - ${result.name} (${result.status})`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ 失败的参数组合:');
    failed.forEach(result => {
      console.log(`   - ${result.name}`);
    });
  }
  
  if (failed.length === testCases.length) {
    console.log('\n💡 所有参数组合都失败，可能的原因:');
    console.log('   1. 应用类型配置不正确（需要配置为Web应用）');
    console.log('   2. 应用状态异常（被禁用或删除）');
    console.log('   3. 域名配置问题（需要配置域名白名单）');
    console.log('   4. Authing服务端问题');
  }
}

// 运行测试
main().catch(console.error);
