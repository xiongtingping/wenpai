#!/usr/bin/env node

console.log('🔍 详细检查Authing配置...\n');

// 当前环境配置
const env = process.env.NODE_ENV || 'development';
console.log(`📋 当前环境: ${env}`);

// 模拟环境变量（从.env.local读取）
const config = {
  appId: '6867fdc88034eb95ae86167d',
  host: 'qutkgzkfaezk-demo.authing.cn',
  devRedirectUri: 'http://localhost:5173/callback',
  prodRedirectUri: 'https://www.wenpai.xyz/callback'
};

console.log('📋 当前配置:');
Object.entries(config).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// 构建授权URL进行测试
function buildAuthUrl(redirectUri) {
  const authUrl = `https://${config.host}/oidc/auth?` + new URLSearchParams({
    client_id: config.appId,
    redirect_uri: redirectUri,
    scope: 'openid profile email phone',
    response_type: 'code',
    state: '/',
    nonce: 'test-nonce-123'
  }).toString();
  
  return authUrl;
}

console.log('\n🔗 测试授权URL:');
const devAuthUrl = buildAuthUrl(config.devRedirectUri);
const prodAuthUrl = buildAuthUrl(config.prodRedirectUri);

console.log('开发环境:');
console.log(`  ${devAuthUrl}`);
console.log('\n生产环境:');
console.log(`  ${prodAuthUrl}`);

// URL编码检查
console.log('\n🔍 URL编码检查:');
console.log('开发环境回调URL编码:');
console.log(`  原始: ${config.devRedirectUri}`);
console.log(`  编码: ${encodeURIComponent(config.devRedirectUri)}`);

console.log('\n生产环境回调URL编码:');
console.log(`  原始: ${config.prodRedirectUri}`);
console.log(`  编码: ${encodeURIComponent(config.prodRedirectUri)}`);

// 常见问题检查
console.log('\n⚠️  常见问题检查:');

// 1. 检查是否有空格
const hasSpaces = config.devRedirectUri.includes(' ') || config.prodRedirectUri.includes(' ');
console.log(`1. 回调URL包含空格: ${hasSpaces ? '❌ 是' : '✅ 否'}`);

// 2. 检查协议
const hasHttp = config.devRedirectUri.startsWith('http://');
const hasHttps = config.prodRedirectUri.startsWith('https://');
console.log(`2. 开发环境使用HTTP: ${hasHttp ? '✅ 是' : '❌ 否'}`);
console.log(`3. 生产环境使用HTTPS: ${hasHttps ? '✅ 是' : '❌ 否'}`);

// 3. 检查端口号
const hasPort = config.devRedirectUri.includes(':5173');
console.log(`4. 开发环境包含端口5173: ${hasPort ? '✅ 是' : '❌ 否'}`);

// 4. 检查路径
const hasCallback = config.devRedirectUri.endsWith('/callback') && config.prodRedirectUri.endsWith('/callback');
console.log(`5. 回调URL以/callback结尾: ${hasCallback ? '✅ 是' : '❌ 否'}`);

// Authing控制台配置指南
console.log('\n📋 Authing控制台配置指南:');
console.log('1. 登录 https://console.authing.cn');
console.log('2. 进入应用: 6867fdc88034eb95ae86167d');
console.log('3. 点击 "应用配置" -> "登录回调 URL"');
console.log('4. 删除所有现有的回调URL');
console.log('5. 添加以下回调URL（确保完全一致）:');
console.log(`   - ${config.devRedirectUri}`);
console.log(`   - ${config.prodRedirectUri}`);
console.log('6. 保存配置');
console.log('7. 等待1-2分钟让配置生效');

// 测试建议
console.log('\n🧪 测试建议:');
console.log('1. 在Authing控制台完成配置后');
console.log('2. 清除浏览器缓存和localStorage');
console.log('3. 重启开发服务器');
console.log('4. 打开浏览器开发者工具');
console.log('5. 尝试登录，查看网络请求和控制台日志');

// 调试命令
console.log('\n🔧 调试命令:');
console.log('清除localStorage: localStorage.clear()');
console.log('查看网络请求: 开发者工具 -> Network');
console.log('查看控制台日志: 开发者工具 -> Console');

console.log('\n📞 如果问题仍然存在:');
console.log('1. 截图Authing控制台的回调URL配置');
console.log('2. 截图浏览器开发者工具的网络请求');
console.log('3. 提供完整的错误信息'); 