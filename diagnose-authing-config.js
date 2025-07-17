/**
 * Authing 配置诊断脚本
 */

const https = require('https');
const querystring = require('querystring');

// 当前配置
const config = {
  client_id: '6867fdc88034eb95ae86167d',
  redirect_uri: 'http://localhost:5173/callback',
  scope: 'openid profile email phone',
  response_type: 'code',
  state: '/creative',
  host: 'qutkgzkfaezk-demo.authing.cn'
};

console.log('🔍 Authing 配置诊断');
console.log('==================');
console.log('当前配置:');
console.log('- 应用ID:', config.client_id);
console.log('- 域名:', config.host);
console.log('- 回调URL:', config.redirect_uri);
console.log('- 权限范围:', config.scope);
console.log('');

// 构建授权URL
const authParams = {
  client_id: config.client_id,
  redirect_uri: config.redirect_uri,
  scope: config.scope,
  response_type: config.response_type,
  state: config.state
};

const authUrl = `https://${config.host}/oidc/auth?${querystring.stringify(authParams)}`;
console.log('🔗 授权URL:');
console.log(authUrl);
console.log('');

// 测试连接
console.log('🧪 测试连接...');
const testUrl = `https://${config.host}/oidc/auth`;

const req = https.get(testUrl, (res) => {
  console.log('📡 响应状态:', res.statusCode);
  console.log('📡 响应头:', res.headers);
  
  if (res.statusCode === 400) {
    console.log('❌ 400 错误 - 可能的原因:');
    console.log('1. 应用ID不存在或错误');
    console.log('2. 应用未启用');
    console.log('3. 回调URL未配置');
    console.log('4. 应用配置有误');
    console.log('');
    console.log('🔧 建议修复步骤:');
    console.log('1. 检查Authing控制台中的应用ID');
    console.log('2. 确认应用状态为"已启用"');
    console.log('3. 在应用配置中添加回调URL');
    console.log('4. 检查应用的其他配置');
  } else if (res.statusCode === 200) {
    console.log('✅ 连接正常');
  } else {
    console.log('⚠️ 其他状态码:', res.statusCode);
  }
});

req.on('error', (err) => {
  console.log('❌ 连接错误:', err.message);
});

req.setTimeout(5000, () => {
  console.log('⏰ 连接超时');
  req.destroy();
});

console.log('📋 检查清单:');
console.log('1. 应用ID是否正确: 6867fdc88034eb95ae86167d');
console.log('2. 域名是否正确: qutkgzkfaezk-demo.authing.cn');
console.log('3. 回调URL是否配置: http://localhost:5173/callback');
console.log('4. 应用是否启用');
console.log('5. 应用类型是否为"单页应用"'); 