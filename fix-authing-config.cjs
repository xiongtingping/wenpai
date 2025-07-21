/**
 * Authing 配置修复脚本
 * 解决 Authing 登录问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复 Authing 配置...');

// 检查 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ 找到 .env.local 文件');
} else {
  console.log('⚠️  未找到 .env.local 文件，将创建新文件');
}

// 检查当前配置
const currentConfig = {
  appId: envContent.match(/VITE_AUTHING_APP_ID=(.+)/)?.[1] || '',
  host: envContent.match(/VITE_AUTHING_HOST=(.+)/)?.[1] || '',
  redirectUriDev: envContent.match(/VITE_AUTHING_REDIRECT_URI_DEV=(.+)/)?.[1] || '',
  redirectUriProd: envContent.match(/VITE_AUTHING_REDIRECT_URI_PROD=(.+)/)?.[1] || ''
};

console.log('📋 当前配置:', currentConfig);

// 修复配置
const fixedConfig = {
  appId: currentConfig.appId || '687e0aafee2b84f86685b644',
  host: currentConfig.host || 'wenpai.authing.cn',
  redirectUriDev: 'http://localhost:8888/callback',  // 使用 Netlify dev 端口
  redirectUriProd: currentConfig.redirectUriProd || 'https://www.wenpai.xyz/callback'
};

console.log('🔧 修复后的配置:', fixedConfig);

// 生成新的 .env.local 内容
const newEnvContent = `# Authing 配置
VITE_AUTHING_APP_ID=${fixedConfig.appId}
VITE_AUTHING_HOST=${fixedConfig.host}
VITE_AUTHING_REDIRECT_URI_DEV=${fixedConfig.redirectUriDev}
VITE_AUTHING_REDIRECT_URI_PROD=${fixedConfig.redirectUriProd}

# OpenAI 配置
VITE_OPENAI_API_KEY=${envContent.match(/VITE_OPENAI_API_KEY=(.+)/)?.[1] || ''}

# 其他配置保持不变
${envContent.split('\n').filter(line => 
  !line.startsWith('VITE_AUTHING_') && 
  !line.startsWith('VITE_OPENAI_API_KEY=') &&
  line.trim()
).join('\n')}
`.trim();

// 写入文件
fs.writeFileSync(envPath, newEnvContent);
console.log('✅ 配置已更新到 .env.local');

// 验证 Authing 域名
console.log('\n🔍 验证 Authing 域名...');
const https = require('https');

function checkDomain(domain) {
  return new Promise((resolve) => {
    const req = https.get(`https://${domain}`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function validateConfig() {
  console.log('🌐 检查 Authing 域名可访问性...');
  
  const domains = [
    'wenpai.authing.cn',
    'ai-wenpai.authing.cn/687e0aafee2b84f86685b644'
  ];
  
  for (const domain of domains) {
    const isAccessible = await checkDomain(domain);
    console.log(`${isAccessible ? '✅' : '❌'} ${domain}: ${isAccessible ? '可访问' : '不可访问'}`);
  }
}

validateConfig().then(() => {
  console.log('\n🎉 Authing 配置修复完成！');
  console.log('\n📋 下一步操作:');
  console.log('1. 重启开发服务器');
  console.log('2. 使用 Netlify dev 服务: npx netlify dev --port 8888 --target-port 5173');
  console.log('3. 访问: http://localhost:8888');
  console.log('4. 测试 Authing 登录功能');
}); 