#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 API密钥配置诊断报告\n');

// 读取.env.local文件
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local文件不存在');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');
const config = {};

lines.forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      config[key] = valueParts.join('=');
    }
  }
});

// 验证OpenAI密钥
const openaiKey = config['VITE_OPENAI_API_KEY'] || '';
console.log('🤖 OpenAI API密钥：');
if (!openaiKey) {
  console.log('❌ 未配置');
} else if (!openaiKey.startsWith('sk-')) {
  console.log('❌ 格式错误：应以sk-开头');
} else if (openaiKey.length !== 51) {
  console.log(`❌ 长度错误：当前${openaiKey.length}字符，应为51字符`);
} else {
  console.log('✅ 格式正确');
}

// 验证DeepSeek密钥
const deepseekKey = config['VITE_DEEPSEEK_API_KEY'] || '';
console.log('\n🔍 DeepSeek API密钥：');
if (!deepseekKey) {
  console.log('❌ 未配置');
} else if (!deepseekKey.startsWith('sk-')) {
  console.log('❌ 格式错误：应以sk-开头');
} else if (deepseekKey.length !== 51) {
  console.log(`❌ 长度错误：当前${deepseekKey.length}字符，应为51字符`);
} else {
  console.log('✅ 格式正确');
}

// 验证Gemini密钥
const geminiKey = config['VITE_GEMINI_API_KEY'] || '';
console.log('\n🌟 Gemini API密钥：');
if (!geminiKey || geminiKey.includes('your-')) {
  console.log('❌ 未配置或为占位符');
} else {
  console.log('✅ 已配置');
}

console.log('\n📝 修复建议：');
console.log('1. 访问 https://platform.openai.com/api-keys 获取正确的OpenAI API密钥');
console.log('2. 访问 https://platform.deepseek.com/ 获取正确的DeepSeek API密钥');
console.log('3. 访问 https://makersuite.google.com/app/apikey 获取正确的Gemini API密钥');
console.log('4. 更新 .env.local 文件并重启开发服务器');

console.log('\n📋 正确配置示例：');
console.log('VITE_OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef');
console.log('VITE_DEEPSEEK_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef');
console.log('VITE_GEMINI_API_KEY=your-gemini-api-key-here');
