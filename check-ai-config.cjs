#!/usr/bin/env node

/**
 * AI配置检查脚本
 * 检查项目中的AI API配置状态
 */

const fs = require('fs');
const path = require('path');

// 检查文件是否存在
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log('🔍 检查环境变量配置...');
  
  const envVars = [
    'VITE_OPENAI_API_KEY',
    'VITE_DEEPSEEK_API_KEY', 
    'VITE_GEMINI_API_KEY'
  ];
  
  envVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value !== 'sk-your-openai-api-key-here' && value !== 'your-gemini-api-key-here') {
      console.log(`✅ ${varName}: 已配置`);
    } else {
      console.log(`❌ ${varName}: 未配置`);
    }
  });
}

// 检查配置文件
function checkConfigFiles() {
  console.log('\n📁 检查配置文件...');
  
  const configFiles = [
    '.env.local',
    '.env',
    'src/config/apiConfig.ts',
    'src/api/aiService.ts'
  ];
  
  configFiles.forEach(file => {
    if (fileExists(file)) {
      console.log(`✅ ${file}: 存在`);
      
      // 检查API配置内容
      if (file.includes('apiConfig.ts') || file.includes('aiService.ts')) {
        const content = readFile(file);
        if (content) {
          if (content.includes('VITE_OPENAI_API_KEY')) {
            console.log(`  📝 包含OpenAI配置`);
          }
          if (content.includes('VITE_DEEPSEEK_API_KEY')) {
            console.log(`  📝 包含DeepSeek配置`);
          }
          if (content.includes('VITE_GEMINI_API_KEY')) {
            console.log(`  📝 包含Gemini配置`);
          }
        }
      }
    } else {
      console.log(`❌ ${file}: 不存在`);
    }
  });
}

// 检查测试页面
function checkTestPages() {
  console.log('\n🧪 检查测试页面...');
  
  const testPages = [
    'src/pages/AIConfigTestPage.tsx',
    'src/pages/APIConfigTestPage.tsx',
    'test-ai-api-connection.html'
  ];
  
  testPages.forEach(page => {
    if (fileExists(page)) {
      console.log(`✅ ${page}: 存在`);
    } else {
      console.log(`❌ ${page}: 不存在`);
    }
  });
}

// 检查路由配置
function checkRoutes() {
  console.log('\n🛣️  检查路由配置...');
  
  const routeFiles = [
    'src/App.tsx',
    'src/pages/index.tsx'
  ];
  
  routeFiles.forEach(file => {
    if (fileExists(file)) {
      const content = readFile(file);
      if (content) {
        if (content.includes('AIConfigTestPage') || content.includes('ai-config-test')) {
          console.log(`✅ ${file}: 包含AI测试页面路由`);
        } else {
          console.log(`⚠️  ${file}: 未找到AI测试页面路由`);
        }
      }
    }
  });
}

// 检查package.json脚本
function checkPackageScripts() {
  console.log('\n📦 检查package.json脚本...');
  
  const packagePath = 'package.json';
  if (fileExists(packagePath)) {
    const content = readFile(packagePath);
    if (content) {
      try {
        const packageJson = JSON.parse(content);
        const scripts = packageJson.scripts || {};
        
        if (scripts.dev) {
          console.log(`✅ 开发脚本: ${scripts.dev}`);
        }
        if (scripts.build) {
          console.log(`✅ 构建脚本: ${scripts.build}`);
        }
        if (scripts.preview) {
          console.log(`✅ 预览脚本: ${scripts.preview}`);
        }
      } catch (error) {
        console.log(`❌ 解析package.json失败: ${error.message}`);
      }
    }
  }
}

// 主函数
function main() {
  console.log('🤖 AI配置检查工具');
  console.log('='.repeat(50));
  
  checkEnvironmentVariables();
  checkConfigFiles();
  checkTestPages();
  checkRoutes();
  checkPackageScripts();
  
  console.log('\n📋 总结:');
  console.log('1. 如果环境变量未配置，请设置相应的API密钥');
  console.log('2. 如果配置文件缺失，请检查项目结构');
  console.log('3. 如果测试页面不存在，请创建相应的测试页面');
  console.log('4. 如果路由未配置，请添加AI测试页面路由');
  
  console.log('\n🚀 下一步:');
  console.log('1. 运行 npm run dev 启动开发服务器');
  console.log('2. 访问 http://localhost:5173/ai-config-test 测试AI功能');
  console.log('3. 或者打开 test-ai-api-connection.html 进行测试');
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = {
  checkEnvironmentVariables,
  checkConfigFiles,
  checkTestPages,
  checkRoutes,
  checkPackageScripts
}; 