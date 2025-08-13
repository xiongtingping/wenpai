#!/usr/bin/env node

/**
 * 🚀 生产环境 Authing 配置检查脚本
 * 确保生产环境下 Authing 登录功能正常工作
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 检查生产环境 Authing 配置...\n');

// 检查项目配置
const checkProjectConfig = () => {
  console.log('📋 检查项目配置文件...');
  
  const configFiles = [
    'netlify.toml',
    'vite.config.ts',
    'src/config/authing.ts'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} 存在`);
    } else {
      console.log(`❌ ${file} 不存在`);
    }
  });
  
  console.log('');
};

// 检查 Authing 配置
const checkAuthingConfig = () => {
  console.log('🔧 检查 Authing 配置...');
  
  const authingConfigPath = 'src/config/authing.ts';
  if (fs.existsSync(authingConfigPath)) {
    const content = fs.readFileSync(authingConfigPath, 'utf8');
    
    // 检查硬编码配置
    const appIdMatch = content.match(/APP_ID = '([^']+)'/);
    const domainMatch = content.match(/DOMAIN = '([^']+)'/);
    const hostMatch = content.match(/HOST = '([^']+)'/);
    
    if (appIdMatch) {
      console.log(`✅ APP_ID: ${appIdMatch[1]}`);
    } else {
      console.log('❌ APP_ID 未找到');
    }
    
    if (domainMatch) {
      console.log(`✅ DOMAIN: ${domainMatch[1]}`);
    } else {
      console.log('❌ DOMAIN 未找到');
    }
    
    if (hostMatch) {
      console.log(`✅ HOST: ${hostMatch[1]}`);
    } else {
      console.log('❌ HOST 未找到');
    }
    
    // 检查动态回调URI配置
    if (content.includes('window.location.origin')) {
      console.log('✅ 动态回调URI配置正确');
    } else {
      console.log('❌ 动态回调URI配置可能有问题');
    }
  } else {
    console.log('❌ Authing 配置文件不存在');
  }
  
  console.log('');
};

// 检查 Netlify 配置
const checkNetlifyConfig = () => {
  console.log('🌐 检查 Netlify 配置...');
  
  const netlifyConfigPath = 'netlify.toml';
  if (fs.existsSync(netlifyConfigPath)) {
    const content = fs.readFileSync(netlifyConfigPath, 'utf8');
    
    // 检查生产环境变量
    const prodEnvSection = content.match(/\[context\.production\.environment\]([\s\S]*?)(?=\[|$)/);
    if (prodEnvSection) {
      const envContent = prodEnvSection[1];
      
      const checks = [
        { key: 'VITE_AUTHING_APP_ID', pattern: /VITE_AUTHING_APP_ID\s*=\s*"([^"]+)"/ },
        { key: 'VITE_AUTHING_DOMAIN', pattern: /VITE_AUTHING_DOMAIN\s*=\s*"([^"]+)"/ },
        { key: 'VITE_AUTHING_HOST', pattern: /VITE_AUTHING_HOST\s*=\s*"([^"]+)"/ },
        { key: 'VITE_AUTHING_REDIRECT_URI_PROD', pattern: /VITE_AUTHING_REDIRECT_URI_PROD\s*=\s*"([^"]+)"/ }
      ];
      
      checks.forEach(check => {
        const match = envContent.match(check.pattern);
        if (match) {
          console.log(`✅ ${check.key}: ${match[1]}`);
        } else {
          console.log(`❌ ${check.key} 未配置`);
        }
      });
    } else {
      console.log('❌ 未找到生产环境配置段');
    }
  } else {
    console.log('❌ netlify.toml 不存在');
  }
  
  console.log('');
};

// 检查构建配置
const checkBuildConfig = () => {
  console.log('🏗️ 检查构建配置...');
  
  const viteConfigPath = 'vite.config.ts';
  if (fs.existsSync(viteConfigPath)) {
    const content = fs.readFileSync(viteConfigPath, 'utf8');
    
    // 检查环境变量注入
    if (content.includes('VITE_AUTHING_APP_ID')) {
      console.log('✅ Vite 配置包含 Authing 环境变量注入');
    } else {
      console.log('❌ Vite 配置缺少 Authing 环境变量注入');
    }
    
    // 检查默认值
    if (content.includes('68823897631e1ef8ff3720b2')) {
      console.log('✅ Vite 配置包含 Authing APP_ID 默认值');
    } else {
      console.log('❌ Vite 配置缺少 Authing APP_ID 默认值');
    }
  } else {
    console.log('❌ vite.config.ts 不存在');
  }
  
  console.log('');
};

// 检查生产环境修复器
const checkProductionFixers = () => {
  console.log('🛡️ 检查生产环境修复器...');
  
  const fixers = [
    'src/utils/productionUndefinedFixer.ts',
    'src/utils/productionEnvChecker.ts',
    'src/utils/authingProductionFixer.ts',
    'src/utils/emergencyProductionFixer.ts'
  ];
  
  fixers.forEach(fixer => {
    if (fs.existsSync(fixer)) {
      console.log(`✅ ${fixer} 存在`);
    } else {
      console.log(`⚠️ ${fixer} 不存在（可选）`);
    }
  });
  
  console.log('');
};

// 生成部署建议
const generateDeploymentAdvice = () => {
  console.log('💡 生产环境部署建议...\n');
  
  console.log('1. 🔧 Authing 控制台配置:');
  console.log('   - 确保回调地址包含: https://your-domain.com/callback');
  console.log('   - 确保应用状态为"已发布"');
  console.log('   - 检查登录方式配置（手机号+验证码）');
  console.log('');
  
  console.log('2. 🌐 Netlify 部署配置:');
  console.log('   - 确保环境变量正确设置');
  console.log('   - 检查构建命令: npm run build');
  console.log('   - 检查发布目录: dist');
  console.log('');
  
  console.log('3. 🧪 测试步骤:');
  console.log('   - 访问 /production-auth-test 页面');
  console.log('   - 检查环境信息显示是否正确');
  console.log('   - 测试登录功能是否正常');
  console.log('   - 查看浏览器控制台是否有错误');
  console.log('');
  
  console.log('4. 🚨 常见问题排查:');
  console.log('   - 如果出现 "undefinedundefined"，检查用户信息处理');
  console.log('   - 如果登录弹窗不显示，检查 Guard 配置');
  console.log('   - 如果回调失败，检查回调地址配置');
  console.log('   - 如果网络错误，检查 CORS 和防火墙设置');
  console.log('');
};

// 主函数
const main = () => {
  console.log('🚀 生产环境 Authing 配置检查工具\n');
  console.log('='.repeat(50));
  console.log('');
  
  checkProjectConfig();
  checkAuthingConfig();
  checkNetlifyConfig();
  checkBuildConfig();
  checkProductionFixers();
  generateDeploymentAdvice();
  
  console.log('✅ 检查完成！');
  console.log('');
  console.log('📋 下一步操作:');
  console.log('1. 修复上述检查中发现的问题');
  console.log('2. 运行 npm run build 测试构建');
  console.log('3. 部署到生产环境');
  console.log('4. 访问 /production-auth-test 进行功能测试');
};

// 运行检查
main();
