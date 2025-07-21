#!/usr/bin/env node

/**
 * 一键检测 Authing 相关环境变量和运行时一致性
 * 用于本地或 CI/CD 环境
 */

const REQUIRED_VARS = [
  'VITE_AUTHING_APP_ID',
  'VITE_AUTHING_HOST',
  'VITE_AUTHING_REDIRECT_URI',
  'VITE_AUTHING_OIDC_ORIGIN'
];

let hasError = false;

console.log('🔍 检查 Authing 相关环境变量...');

REQUIRED_VARS.forEach((key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.error(`❌ 缺少环境变量: ${key}`);
    hasError = true;
  } else {
    // 关键格式校验
    if (key === 'VITE_AUTHING_HOST' || key === 'VITE_AUTHING_OIDC_ORIGIN') {
      if (!/^https:\/\//.test(value)) {
        console.error(`❌ ${key} 必须以 https:// 开头，当前值: ${value}`);
        hasError = true;
      }
      if (key === 'VITE_AUTHING_OIDC_ORIGIN' && !/\/[a-z0-9]{24,}\/?$/.test(value)) {
        console.error(`❌ ${key} 需为完整认证路径（含 AppID），当前值: ${value}`);
        hasError = true;
      }
    }
    console.log(`✅ ${key}: ${value}`);
  }
});

if (hasError) {
  console.error('❌ Authing 环境变量检测未通过，请检查上方错误并修正！');
  process.exit(1);
} else {
  console.log('✅ Authing 环境变量检测全部通过！');
  process.exit(0);
} 