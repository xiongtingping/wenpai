/**
 * 🚀 官方SDK实现快速验证脚本
 * 检查所有必要文件和配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 正在验证官方SDK实现...\n');

/**
 * 检查必要文件是否存在
 */
function checkRequiredFiles() {
  console.log('📁 1. 检查必要文件...');
  
  const requiredFiles = [
    'src/auth/officialAuthConfig.ts',
    'src/auth/OfficialAuthService.ts', 
    'src/auth/OfficialAuthProvider.tsx',
    'src/components/OfficialAuthTest.tsx',
    'package.json'
  ];
  
  let allFilesExist = true;
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });
  
  return allFilesExist;
}

/**
 * 检查@authing/browser依赖
 */
function checkAuthingDependency() {
  console.log('\n📦 2. 检查@authing/browser依赖...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps['@authing/browser']) {
      console.log(`   ✅ @authing/browser: ${deps['@authing/browser']}`);
      return true;
    } else {
      console.log('   ❌ @authing/browser 未安装');
      return false;
    }
  } catch (error) {
    console.log('   ❌ 无法读取package.json');
    return false;
  }
}

/**
 * 检查配置内容
 */
function checkConfiguration() {
  console.log('\n⚙️ 3. 检查配置内容...');
  
  try {
    const configContent = fs.readFileSync('src/auth/officialAuthConfig.ts', 'utf8');
    
    const hasCorrectDomain = configContent.includes('https://vq1zaovh.authing.cn');
    const hasCorrectAppId = configContent.includes('68a68a29d0c3341ae7a3df23');
    const hasMultipleRedirectUris = configContent.includes('localhost:5177') &&
                                   configContent.includes('www.wenpai.xyz');
    
    console.log(`   ${hasCorrectDomain ? '✅' : '❌'} 认证域名配置`);
    console.log(`   ${hasCorrectAppId ? '✅' : '❌'} App ID配置`);
    console.log(`   ${hasMultipleRedirectUris ? '✅' : '❌'} 多重回调URL配置`);
    
    return hasCorrectDomain && hasCorrectAppId && hasMultipleRedirectUris;
  } catch (error) {
    console.log('   ❌ 无法读取配置文件');
    return false;
  }
}

/**
 * 检查路由配置
 */
function checkRouteConfiguration() {
  console.log('\n🛣️ 4. 检查路由配置...');
  
  try {
    const appContent = fs.readFileSync('src/App.tsx', 'utf8');
    
    const hasTestRoute = appContent.includes('/test-official-auth') &&
                        appContent.includes('OfficialAuthTest');
    
    console.log(`   ${hasTestRoute ? '✅' : '❌'} 测试路由配置`);
    
    return hasTestRoute;
  } catch (error) {
    console.log('   ❌ 无法读取App.tsx');
    return false;
  }
}

/**
 * 生成测试指引
 */
function generateTestGuide(allChecksPass) {
  console.log('\n📋 5. 生成测试指引...');
  
  const guide = `# 🧪 官方SDK测试指引

## ✅ 验证结果: ${allChecksPass ? '全部通过' : '存在问题'}

## 🚀 测试步骤

### 第1步：访问测试页面
浏览器访问: http://localhost:5177/test-official-auth

### 第2步：检查初始化
- ✅ 页面应显示"已初始化"状态
- ✅ 控制台应有"🎯 创建官方Authing SDK实例"日志
- ✅ 不应该有任何错误信息

### 第3步：测试登录流程  
1. 点击"🚀 登录"按钮
2. 应该跳转到Authing托管登录页面
3. **关键：不应该出现"Error: redirect"错误**
4. 完成登录后自动返回callback页面

### 第4步：验证回调处理
- ✅ 回调页面应正确解析认证结果
- ✅ 用户信息应正确显示
- ✅ 控制台应有成功处理日志

## 🔍 关键检查点

### 成功标准：
- ❌ 旧问题：Error: redirect at cdn.authing.co/...
- ✅ 新状态：使用官方SDK，无redirect错误
- ✅ 正确的多重URL处理
- ✅ 简化的代码逻辑

### 如果仍有问题：
1. 检查控制台错误信息
2. 确认@authing/browser版本
3. 验证配置是否正确
4. 检查网络连接

## 💡 对比测试
- 当前实现: http://localhost:5177/
- 新实现: http://localhost:5177/test-official-auth

对比两者的表现，新实现应该更稳定且无redirect错误。

---
验证时间: ${new Date().toLocaleString()}
${allChecksPass ? '🎉 准备就绪，开始测试！' : '⚠️ 请修复上述问题后再测试'}`;

  try {
    fs.writeFileSync('QUICK_TEST_GUIDE.md', guide);
    console.log('   ✅ 测试指引已生成: QUICK_TEST_GUIDE.md');
  } catch (error) {
    console.log('   ❌ 测试指引生成失败');
  }
}

/**
 * 主验证函数
 */
function main() {
  const filesOk = checkRequiredFiles();
  const depOk = checkAuthingDependency();
  const configOk = checkConfiguration();
  const routeOk = checkRouteConfiguration();
  
  const allChecksPass = filesOk && depOk && configOk && routeOk;
  
  generateTestGuide(allChecksPass);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 官方SDK实现验证完成');
  console.log('='.repeat(50));
  
  console.log(`\n📊 验证结果: ${allChecksPass ? '✅ 全部通过' : '❌ 需要修复'}`);
  console.log(`- 必要文件: ${filesOk ? '✅' : '❌'}`);
  console.log(`- 依赖检查: ${depOk ? '✅' : '❌'}`);
  console.log(`- 配置检查: ${configOk ? '✅' : '❌'}`);
  console.log(`- 路由配置: ${routeOk ? '✅' : '❌'}`);
  
  if (allChecksPass) {
    console.log('\n🚀 下一步操作:');
    console.log('1. 访问测试页面: http://localhost:5177/test-official-auth');
    console.log('2. 测试登录流程');
    console.log('3. 验证不再有redirect错误');
    console.log('4. 对比新旧实现的差异');
    
    console.log('\n💡 关键测试点:');
    console.log('- 🎯 官方SDK初始化');
    console.log('- 🚀 登录跳转（无redirect错误）');
    console.log('- 🔄 回调处理');
    console.log('- 📊 状态管理');
  } else {
    console.log('\n⚠️ 请修复上述问题后再进行测试');
  }
}

// 运行验证
main();