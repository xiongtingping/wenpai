#!/usr/bin/env node

/**
 * 部署前安全检查脚本
 * 基于 security_check_modern_web_deploy_standard 规则
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 开始部署前安全检查...');
console.log('=====================================');

let hasErrors = false;
let hasWarnings = false;

/**
 * 检查构建产物
 */
function checkBuildOutput() {
  console.log('\n📦 检查构建产物...');
  
  const distPath = path.join(projectRoot, 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('❌ dist 目录不存在，请先运行 npm run build');
    hasErrors = true;
    return;
  }
  
  const indexHtml = path.join(distPath, 'index.html');
  if (!fs.existsSync(indexHtml)) {
    console.error('❌ index.html 不存在');
    hasErrors = true;
  } else {
    console.log('✅ index.html 存在');
  }
  
  const assetsDir = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error('❌ assets 目录不存在');
    hasErrors = true;
  } else {
    console.log('✅ assets 目录存在');
  }
}

/**
 * 检查环境变量配置
 */
function checkEnvironmentVariables() {
  console.log('\n🌐 检查环境变量配置...');
  
  const envExample = path.join(projectRoot, '.env.example');
  if (!fs.existsSync(envExample)) {
    console.warn('⚠️ .env.example 文件不存在');
    hasWarnings = true;
  } else {
    console.log('✅ .env.example 文件存在');
  }
  
  const envLocal = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envLocal)) {
    console.warn('⚠️ .env.local 文件不存在，可能影响功能');
    hasWarnings = true;
  } else {
    console.log('✅ .env.local 文件存在');
  }
}

/**
 * 检查硬编码路径
 */
function checkHardcodedPaths() {
  console.log('\n🔍 检查硬编码路径...');
  
  const srcPath = path.join(projectRoot, 'src');
  const files = getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
  
  let foundIssues = false;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查硬编码的绝对路径
    const hardcodedPatterns = [
      /\/static\//g,
      /\/assets\//g,
      /localhost:\d+/g,
      /127\.0\.0\.1:\d+/g
    ];
    
    hardcodedPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        console.warn(`⚠️ ${path.relative(projectRoot, file)}: 发现硬编码路径 ${matches[0]}`);
        foundIssues = true;
        hasWarnings = true;
      }
    });
  });
  
  if (!foundIssues) {
    console.log('✅ 未发现硬编码路径问题');
  }
}

/**
 * 检查 SSR 兼容性
 */
function checkSSRCompatibility() {
  console.log('\n🌐 检查 SSR 兼容性...');
  
  const srcPath = path.join(projectRoot, 'src');
  const files = getAllFiles(srcPath, ['.ts', '.tsx', '.js', '.jsx']);
  
  let foundIssues = false;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // 检查不安全的浏览器对象使用
    const unsafePatterns = [
      /(?<!typeof\s+)window\./g,
      /(?<!typeof\s+)document\./g,
      /(?<!typeof\s+)localStorage\./g,
      /(?<!typeof\s+)sessionStorage\./g
    ];
    
    unsafePatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        const objectName = ['window', 'document', 'localStorage', 'sessionStorage'][index];
        console.warn(`⚠️ ${path.relative(projectRoot, file)}: 不安全的 ${objectName} 使用`);
        foundIssues = true;
        hasWarnings = true;
      }
    });
  });
  
  if (!foundIssues) {
    console.log('✅ SSR 兼容性检查通过');
  }
}

/**
 * 检查部署配置
 */
function checkDeploymentConfig() {
  console.log('\n🚀 检查部署配置...');
  
  // 检查 Netlify 配置
  const netlifyConfig = path.join(projectRoot, 'netlify.toml');
  const githubWorkflow = path.join(projectRoot, '.github/workflows/deploy.yml');
  
  if (fs.existsSync(netlifyConfig)) {
    console.log('✅ netlify.toml 配置存在');
  } else if (fs.existsSync(githubWorkflow)) {
    console.log('✅ GitHub Actions 部署配置存在');
  } else {
    console.warn('⚠️ 未找到部署配置文件');
    hasWarnings = true;
  }
  
  // 检查 package.json 脚本
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  if (!packageJson.scripts.build) {
    console.error('❌ package.json 缺少 build 脚本');
    hasErrors = true;
  } else {
    console.log('✅ build 脚本配置正确');
  }
}

/**
 * 获取所有文件
 */
function getAllFiles(dirPath, extensions) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

// 执行检查
checkBuildOutput();
checkEnvironmentVariables();
checkHardcodedPaths();
checkSSRCompatibility();
checkDeploymentConfig();

// 输出结果
console.log('\n=====================================');
console.log('🔍 部署前安全检查完成');

if (hasErrors) {
  console.log('❌ 发现严重问题，建议修复后再部署');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️ 发现一些警告，建议检查后部署');
  process.exit(0);
} else {
  console.log('✅ 所有检查通过，可以安全部署');
  process.exit(0);
}
