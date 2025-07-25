const https = require('https');
const http = require('http');

console.log('🚀 Authing 快速配置测试...\n');

// 测试配置
const config = {
  appId: '687e0afae2b84f86865b644',
  host: 'https://ai-wenpai.authing.cn',
  redirectUri: 'http://localhost:3001/callback',
  userPoolId: '687e0a47a9c1c3d9177b8da1'
};

console.log('📋 当前配置:');
console.log(JSON.stringify(config, null, 2));
console.log('');

// 测试本地服务器
function testLocalServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001', (res) => {
      console.log(`✅ 本地服务器状态: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ 本地服务器错误: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 本地服务器超时');
      resolve(false);
    });
  });
}

// 测试Authing服务器
function testAuthingServer() {
  return new Promise((resolve) => {
    const url = new URL(config.host);
    const req = https.get(url, (res) => {
      console.log(`✅ Authing服务器状态: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Authing服务器错误: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Authing服务器超时');
      resolve(false);
    });
  });
}

// 测试回调URL
function testCallbackUrl() {
  return new Promise((resolve) => {
    const req = http.get(config.redirectUri, (res) => {
      console.log(`✅ 回调URL状态: ${res.statusCode}`);
      resolve(res.statusCode === 200);
    });
    
    req.on('error', (err) => {
      console.log(`❌ 回调URL错误: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ 回调URL超时');
      resolve(false);
    });
  });
}

// 运行所有测试
async function runTests() {
  console.log('🔍 开始网络连接测试...\n');
  
  const localServer = await testLocalServer();
  const authingServer = await testAuthingServer();
  const callbackUrl = await testCallbackUrl();
  
  console.log('\n📊 测试结果汇总:');
  console.log(`本地服务器: ${localServer ? '✅ 正常' : '❌ 异常'}`);
  console.log(`Authing服务器: ${authingServer ? '✅ 正常' : '❌ 异常'}`);
  console.log(`回调URL: ${callbackUrl ? '✅ 正常' : '❌ 异常'}`);
  
  if (localServer && authingServer && callbackUrl) {
    console.log('\n🎉 所有基础测试通过！可以进行手动登录测试。');
    console.log('📖 请参考 manual-test-guide.md 进行完整测试。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查配置和网络连接。');
  }
}

runTests(); 