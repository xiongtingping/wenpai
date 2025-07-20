/**
 * 环境变量测试脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 测试环境变量配置...');

// 读取 .env.local 文件
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ 找到 .env.local 文件');
  
  // 解析环境变量
  const envVars = {};
  envContent.split('\n').forEach(line => {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      envVars[key.trim()] = value.trim();
    }
  });
  
  console.log('📋 环境变量内容:');
  Object.keys(envVars).forEach(key => {
    if (key.startsWith('VITE_')) {
      const value = envVars[key];
      const maskedValue = value.length > 10 ? value.substring(0, 10) + '...' : value;
      console.log(`  ${key}: ${maskedValue}`);
    }
  });
  
  // 检查关键变量
  const requiredVars = [
    'VITE_AUTHING_APP_ID',
    'VITE_AUTHING_HOST',
    'VITE_AUTHING_REDIRECT_URI_DEV',
    'VITE_OPENAI_API_KEY'
  ];
  
  console.log('\n🔍 检查必需的环境变量:');
  requiredVars.forEach(varName => {
    if (envVars[varName]) {
      console.log(`  ✅ ${varName}: 已设置`);
    } else {
      console.log(`  ❌ ${varName}: 未设置`);
    }
  });
  
} else {
  console.log('❌ 未找到 .env.local 文件');
}

// 检查 Netlify 环境变量
console.log('\n🌐 检查 Netlify 环境变量:');
const netlifyEnvVars = [
  'NODE_ENV',
  'NETLIFY_DEV',
  'NETLIFY_FUNCTIONS_URL'
];

netlifyEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ❌ ${varName}: 未设置`);
  }
});

console.log('\n🎯 建议:');
console.log('1. 确保 .env.local 文件存在且包含正确的配置');
console.log('2. 重启 Netlify dev 服务以加载新的环境变量');
console.log('3. 检查浏览器控制台是否有 MIME 类型错误'); 