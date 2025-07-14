/**
 * 统一认证入口快速测试脚本
 * 检查基本功能和配置
 */

const fs = require('fs');
const path = require('path');

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * 检查文件内容
 */
function checkFileContent(filePath, keywords) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return keywords.every(keyword => content.includes(keyword));
  } catch (error) {
    return false;
  }
}

/**
 * 检查组件文件
 */
function checkComponents() {
  console.log('🔍 检查组件文件');
  console.log('================');
  console.log('');

  const components = [
    {
      name: 'UnifiedAuthEntry',
      path: 'src/components/auth/UnifiedAuthEntry.tsx',
      keywords: ['UnifiedAuthEntry', 'useUnifiedAuth', 'Authing']
    },
    {
      name: 'AuthModal',
      path: 'src/components/auth/AuthModal.tsx',
      keywords: ['AuthModal', 'QuickAuthButton', 'LoginButton', 'RegisterButton']
    },
    {
      name: 'LoginButton (更新)',
      path: 'src/components/auth/LoginButton.tsx',
      keywords: ['QuickAuthButton', 'useUnifiedAuth', 'AuthLoginButton']
    }
  ];

  let allPassed = true;

  components.forEach(component => {
    const exists = checkFileExists(component.path);
    const hasContent = exists ? checkFileContent(component.path, component.keywords) : false;

    if (exists && hasContent) {
      console.log(`   ✅ ${component.name}: 文件存在且内容正确`);
    } else if (exists) {
      console.log(`   ⚠️  ${component.name}: 文件存在但内容可能不完整`);
      allPassed = false;
    } else {
      console.log(`   ❌ ${component.name}: 文件不存在`);
      allPassed = false;
    }
  });

  console.log('');
  return allPassed;
}

/**
 * 检查Hook文件
 */
function checkHooks() {
  console.log('🔍 检查Hook文件');
  console.log('==============');
  console.log('');

  const hooks = [
    {
      name: 'useUnifiedAuth',
      path: 'src/hooks/useUnifiedAuth.ts',
      keywords: ['useUnifiedAuth', 'login', 'register', 'logout']
    },
    {
      name: 'useAuthing',
      path: 'src/hooks/useAuthing.ts',
      keywords: ['useAuthing', 'Guard', 'showLogin']
    }
  ];

  let allPassed = true;

  hooks.forEach(hook => {
    const exists = checkFileExists(hook.path);
    const hasContent = exists ? checkFileContent(hook.path, hook.keywords) : false;

    if (exists && hasContent) {
      console.log(`   ✅ ${hook.name}: 文件存在且内容正确`);
    } else if (exists) {
      console.log(`   ⚠️  ${hook.name}: 文件存在但内容可能不完整`);
      allPassed = false;
    } else {
      console.log(`   ❌ ${hook.name}: 文件不存在`);
      allPassed = false;
    }
  });

  console.log('');
  return allPassed;
}

/**
 * 检查服务文件
 */
function checkServices() {
  console.log('🔍 检查服务文件');
  console.log('==============');
  console.log('');

  const services = [
    {
      name: 'unifiedAuthService',
      path: 'src/services/unifiedAuthService.ts',
      keywords: ['UnifiedAuthService', 'Authing', 'Guard']
    }
  ];

  let allPassed = true;

  services.forEach(service => {
    const exists = checkFileExists(service.path);
    const hasContent = exists ? checkFileContent(service.path, service.keywords) : false;

    if (exists && hasContent) {
      console.log(`   ✅ ${service.name}: 文件存在且内容正确`);
    } else if (exists) {
      console.log(`   ⚠️  ${service.name}: 文件存在但内容可能不完整`);
      allPassed = false;
    } else {
      console.log(`   ❌ ${service.name}: 文件不存在`);
      allPassed = false;
    }
  });

  console.log('');
  return allPassed;
}

/**
 * 检查测试页面
 */
function checkTestPages() {
  console.log('🔍 检查测试页面');
  console.log('==============');
  console.log('');

  const pages = [
    {
      name: 'UnifiedAuthTestPage',
      path: 'src/pages/UnifiedAuthTestPage.tsx',
      keywords: ['UnifiedAuthTestPage', 'UnifiedAuthEntry', 'QuickAuthButton']
    }
  ];

  let allPassed = true;

  pages.forEach(page => {
    const exists = checkFileExists(page.path);
    const hasContent = exists ? checkFileContent(page.path, page.keywords) : false;

    if (exists && hasContent) {
      console.log(`   ✅ ${page.name}: 文件存在且内容正确`);
    } else if (exists) {
      console.log(`   ⚠️  ${page.name}: 文件存在但内容可能不完整`);
      allPassed = false;
    } else {
      console.log(`   ❌ ${page.name}: 文件不存在`);
      allPassed = false;
    }
  });

  console.log('');
  return allPassed;
}

/**
 * 检查路由配置
 */
function checkRoutes() {
  console.log('🔍 检查路由配置');
  console.log('==============');
  console.log('');

  const appFile = 'src/App.tsx';
  const exists = checkFileExists(appFile);
  const hasRoute = exists ? checkFileContent(appFile, ['/unified-auth-test', 'UnifiedAuthTestPage']) : false;

  if (exists && hasRoute) {
    console.log('   ✅ 路由配置正确');
    console.log('   ✅ 测试页面路径: /unified-auth-test');
  } else if (exists) {
    console.log('   ⚠️  路由配置可能不完整');
  } else {
    console.log('   ❌ App.tsx文件不存在');
  }

  console.log('');
  return exists && hasRoute;
}

/**
 * 检查依赖配置
 */
function checkDependencies() {
  console.log('🔍 检查依赖配置');
  console.log('==============');
  console.log('');

  const packageFile = 'package.json';
  const exists = checkFileExists(packageFile);
  
  if (!exists) {
    console.log('   ❌ package.json文件不存在');
    console.log('');
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    const requiredDeps = [
      '@authing/guard-react',
      'authing-js-sdk'
    ];

    let allFound = true;

    requiredDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`   ❌ ${dep}: 未找到`);
        allFound = false;
      }
    });

    console.log('');
    return allFound;
  } catch (error) {
    console.log(`   ❌ 解析package.json失败: ${error.message}`);
    console.log('');
    return false;
  }
}

/**
 * 检查配置文件
 */
function checkConfig() {
  console.log('🔍 检查配置文件');
  console.log('==============');
  console.log('');

  const configFile = 'src/config/authing.ts';
  const exists = checkFileExists(configFile);
  const hasConfig = exists ? checkFileContent(configFile, ['appId', 'host', 'redirectUri']) : false;

  if (exists && hasConfig) {
    console.log('   ✅ Authing配置文件存在且内容正确');
  } else if (exists) {
    console.log('   ⚠️  Authing配置文件存在但内容可能不完整');
  } else {
    console.log('   ❌ Authing配置文件不存在');
  }

  console.log('');
  return exists && hasConfig;
}

/**
 * 主测试函数
 */
function runQuickTest() {
  console.log('🚀 统一认证入口快速测试');
  console.log('========================');
  console.log('');

  const results = {
    components: checkComponents(),
    hooks: checkHooks(),
    services: checkServices(),
    testPages: checkTestPages(),
    routes: checkRoutes(),
    dependencies: checkDependencies(),
    config: checkConfig()
  };

  console.log('📊 测试结果总结');
  console.log('==============');
  console.log('');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${test}: ${passed ? '通过' : '失败'}`);
  });

  console.log('');
  console.log(`🎯 总体结果: ${passedTests}/${totalTests} 项测试通过`);

  if (passedTests === totalTests) {
    console.log('🎉 所有测试通过！统一认证入口实现完整。');
    console.log('');
    console.log('💡 下一步:');
    console.log('   1. 访问 http://localhost:5173/unified-auth-test 查看测试页面');
    console.log('   2. 测试各种登录/注册功能');
    console.log('   3. 验证Authing集成是否正常工作');
  } else {
    console.log('⚠️  部分测试失败，请检查相关文件。');
    console.log('');
    console.log('🔧 建议:');
    console.log('   1. 检查文件路径是否正确');
    console.log('   2. 确保所有依赖已安装');
    console.log('   3. 验证配置文件是否正确');
  }

  console.log('');
}

// 运行测试
if (require.main === module) {
  runQuickTest();
}

module.exports = {
  runQuickTest,
  checkComponents,
  checkHooks,
  checkServices,
  checkTestPages,
  checkRoutes,
  checkDependencies,
  checkConfig
}; 