#!/usr/bin/env node

/**
 * 开发环境状态检查脚本
 * 用于监控应用运行状态和诊断问题
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔍 开发环境状态检查');
console.log('==================\n');

// 检查环境变量
function checkEnvVars() {
  console.log('📋 环境变量检查:');
  
  const envFiles = ['.env.local', '.env'];
  let envContent = '';
  
  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      envContent = fs.readFileSync(file, 'utf8');
      console.log(`✅ 找到 ${file}`);
      break;
    }
  }
  
  if (!envContent) {
    console.log('❌ 未找到环境变量文件');
    return;
  }
  
  const requiredVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_CREEM_API_KEY', 
    'VITE_AUTHING_APP_ID',
    'VITE_AUTHING_HOST'
  ];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: 已配置`);
    } else {
      console.log(`❌ ${varName}: 未配置`);
    }
  });
  
  console.log('');
}

// 检查端口占用
function checkPorts() {
  console.log('🌐 端口占用检查:');
  
  try {
    const ports = [5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 8888];
    
    ports.forEach(port => {
      try {
        const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
        if (result.trim()) {
          console.log(`🔴 端口 ${port}: 被占用`);
        } else {
          console.log(`🟢 端口 ${port}: 可用`);
        }
      } catch (error) {
        console.log(`🟢 端口 ${port}: 可用`);
      }
    });
  } catch (error) {
    console.log('⚠️  无法检查端口占用状态');
  }
  
  console.log('');
}

// 检查依赖
function checkDependencies() {
  console.log('📦 依赖检查:');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const netlifyPackageJson = JSON.parse(fs.readFileSync('netlify/functions/package.json', 'utf8'));
  
  console.log('主项目依赖:');
  const mainDeps = Object.keys(packageJson.dependencies || {});
  mainDeps.forEach(dep => {
    console.log(`  ✅ ${dep}`);
  });
  
  console.log('\nNetlify Functions 依赖:');
  const funcDeps = Object.keys(netlifyPackageJson.dependencies || {});
  funcDeps.forEach(dep => {
    console.log(`  ✅ ${dep}`);
  });
  
  console.log('');
}

// 检查文件结构
function checkFileStructure() {
  console.log('📁 文件结构检查:');
  
  const requiredFiles = [
    'src/main.tsx',
    'src/App.tsx',
    'src/contexts/UnifiedAuthContext.tsx',
    'netlify/functions/checkout.cjs',
    'netlify.toml',
    'vite.config.ts'
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
    }
  });
  
  console.log('');
}

// 检查开发服务器状态
function checkDevServer() {
  console.log('🚀 开发服务器状态:');
  
  try {
    // 检查是否有Node.js进程在运行
    const result = execSync('ps aux | grep -E "(vite|netlify)" | grep -v grep', { encoding: 'utf8' });
    if (result.trim()) {
      console.log('✅ 开发服务器正在运行');
      console.log(result.trim());
    } else {
      console.log('❌ 开发服务器未运行');
    }
  } catch (error) {
    console.log('❌ 开发服务器未运行');
  }
  
  console.log('');
}

// 生成建议
function generateSuggestions() {
  console.log('💡 开发建议:');
  console.log('1. 使用 netlify dev 启动开发服务器以同时运行前端和函数');
  console.log('2. 确保所有环境变量都已正确配置');
  console.log('3. 如果遇到端口冲突，可以手动指定端口');
  console.log('4. 定期清理浏览器缓存以避免认证问题');
  console.log('5. 使用浏览器开发者工具监控网络请求');
  console.log('');
}

// 主函数
function main() {
  checkEnvVars();
  checkPorts();
  checkDependencies();
  checkFileStructure();
  checkDevServer();
  generateSuggestions();
  
  console.log('✅ 状态检查完成');
}

// 运行检查
main();
