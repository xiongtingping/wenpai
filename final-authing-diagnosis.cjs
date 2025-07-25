#!/usr/bin/env node

/**
 * Authing 最终诊断脚本
 * 深入分析 400 错误的具体原因
 */

const https = require('https');
const crypto = require('crypto');

console.log('🔍 Authing 最终诊断脚本启动...\n');

// Authing 配置
const AUTHING_CONFIG = {
  host: 'ai-wenpai.authing.cn/688237f7f9e118de849dc274',
  appId: '688237f7f9e118de849dc274',
  userPoolId: '688237f7f9e118de849dc274',
  redirectUri: 'http://localhost:5174/callback'
};

/**
 * 生成 PKCE 参数
 */
function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  return { codeVerifier, codeChallenge };
}

/**
 * 测试不同的登录 URL 格式
 */
async function testLoginURLs() {
  console.log('🔐 测试不同的登录 URL 格式...\n');
  
  const { codeVerifier, codeChallenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const testCases = [
    {
      name: '基本登录 URL (无 PKCE)',
      url: `https://${AUTHING_CONFIG.host}/oidc/auth?` +
        `client_id=${AUTHING_CONFIG.appId}&` +
        `redirect_uri=${encodeURIComponent(AUTHING_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `scope=openid profile email phone&` +
        `state=${state}&` +
        `nonce=${nonce}`
    },
    {
      name: '带 PKCE 的登录 URL',
      url: `https://${AUTHING_CONFIG.host}/oidc/auth?` +
        `client_id=${AUTHING_CONFIG.appId}&` +
        `redirect_uri=${encodeURIComponent(AUTHING_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `scope=openid profile email phone&` +
        `state=${state}&` +
        `nonce=${nonce}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`
    },
    {
      name: '带 response_mode 的登录 URL',
      url: `https://${AUTHING_CONFIG.host}/oidc/auth?` +
        `client_id=${AUTHING_CONFIG.appId}&` +
        `redirect_uri=${encodeURIComponent(AUTHING_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `response_mode=fragment&` +
        `scope=openid profile email phone&` +
        `state=${state}&` +
        `nonce=${nonce}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`
    },
    {
      name: '简化登录 URL',
      url: `https://${AUTHING_CONFIG.host}/oidc/auth?` +
        `client_id=${AUTHING_CONFIG.appId}&` +
        `redirect_uri=${encodeURIComponent(AUTHING_CONFIG.redirectUri)}&` +
        `response_type=code&` +
        `scope=openid`
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`📋 测试: ${testCase.name}`);
    console.log(`🔗 URL: ${testCase.url.substring(0, 100)}...`);
    
    try {
      const result = await testURL(testCase.url);
      console.log(`📊 结果: ${result.statusCode} - ${result.message}\n`);
    } catch (error) {
      console.log(`❌ 错误: ${error.message}\n`);
    }
  }
}

/**
 * 测试单个 URL
 */
function testURL(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 400) {
          resolve({
            statusCode: res.statusCode,
            message: '400 错误 - 可能是参数问题',
            details: data
          });
        } else if (res.statusCode === 200 || res.statusCode === 302) {
          resolve({
            statusCode: res.statusCode,
            message: '成功 - 应该能正常跳转'
          });
        } else {
          resolve({
            statusCode: res.statusCode,
            message: `未知状态码: ${res.statusCode}`
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 检查 Authing 应用配置
 */
async function checkAuthingAppConfig() {
  console.log('🔧 检查 Authing 应用配置...\n');
  
  console.log('📋 当前配置:');
  console.log(`   App ID: ${AUTHING_CONFIG.appId}`);
  console.log(`   User Pool ID: ${AUTHING_CONFIG.userPoolId}`);
  console.log(`   Host: ${AUTHING_CONFIG.host}`);
  console.log(`   Redirect URI: ${AUTHING_CONFIG.redirectUri}\n`);
  
  console.log('⚠️ 需要验证的配置:');
  console.log('   1. 应用类型是否为"单页 Web 应用"');
  console.log('   2. 授权模式是否开启 "authorization_code"');
  console.log('   3. 返回类型是否开启 "code"');
  console.log('   4. 登录回调 URL 是否包含当前回调地址');
  console.log('   5. 应用是否已启用\n');
}

/**
 * 生成修复建议
 */
function generateFixSuggestions() {
  console.log('💡 修复建议:\n');
  
  console.log('1️⃣ 检查 Authing 控制台配置:');
  console.log('   - 登录 https://console.authing.cn/');
  console.log('   - 找到应用 "wenpai"');
  console.log('   - 检查应用类型、授权模式、返回类型');
  console.log('   - 确保登录回调 URL 包含: http://localhost:5174/callback\n');
  
  console.log('2️⃣ 尝试不同的登录方式:');
  console.log('   - 使用简化登录 URL（无 PKCE）');
  console.log('   - 使用带 PKCE 的登录 URL');
  console.log('   - 使用带 response_mode 的登录 URL\n');
  
  console.log('3️⃣ 检查网络和域名:');
  console.log('   - 确保 ai-wenpai.authing.cn/688237f7f9e118de849dc274 可访问');
  console.log('   - 检查 DNS 解析是否正常');
  console.log('   - 检查防火墙设置\n');
  
  console.log('4️⃣ 联系 Authing 技术支持:');
  console.log('   - 提供错误详情和配置信息');
  console.log('   - 请求技术支持的帮助\n');
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 Authing 最终诊断工具\n');
  
  await checkAuthingAppConfig();
  await testLoginURLs();
  generateFixSuggestions();
  
  console.log('✅ 诊断完成！');
  console.log('📞 如果问题持续存在，请联系 Authing 技术支持');
}

// 运行诊断
main().catch(console.error); 