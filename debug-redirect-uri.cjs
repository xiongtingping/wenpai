/**
 * 🔍 redirect_uri问题深度调试脚本
 * 分析为什么Authing返回多重URL以及redirect_uri不匹配问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始深度调试redirect_uri问题...\n');

/**
 * 1. 分析configManager.ts的redirect_uri生成逻辑
 */
function analyzeConfigManager() {
  console.log('📁 1. 分析configManager.ts的redirect_uri生成逻辑...');
  
  try {
    const configPath = path.join(__dirname, 'src/config/configManager.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // 提取getRedirectUri函数
    const getRedirectUriMatch = content.match(/private getRedirectUri\(\): string \{[\s\S]*?\n  \}/);
    if (getRedirectUriMatch) {
      console.log('   🎯 找到getRedirectUri函数:');
      console.log('   ```typescript');
      console.log('   ' + getRedirectUriMatch[0].split('\n').join('\n   '));
      console.log('   ```');
      
      // 分析逻辑
      const windowCheck = content.includes('window.location.origin}/callback');
      const prodFallback = content.includes('https://www.wenpai.xyz/callback');
      const devFallback = content.includes('http://localhost:5173/callback');
      
      console.log('   📊 逻辑分析:');
      console.log(`      - 动态生成: ${windowCheck ? '✅' : '❌'} (基于window.location.origin)`);
      console.log(`      - 生产环境兜底: ${prodFallback ? '✅' : '❌'} (www.wenpai.xyz)`);
      console.log(`      - 开发环境兜底: ${devFallback ? '✅' : '❌'} (localhost:5173)`);
      
      // 分析可能的问题
      console.log('   🚨 潜在问题:');
      if (windowCheck) {
        console.log('      - window.location.origin在不同访问方式下会返回不同值');
        console.log('      - www.wenpai.xyz -> https://www.wenpai.xyz');
        console.log('      - wenpai.xyz -> https://wenpai.xyz');  
        console.log('      - netlify域名 -> https://wenpai.netlify.app');
        console.log('      - 本地开发 -> http://localhost:5173');
      }
      
      return true;
    } else {
      console.log('   ❌ 未找到getRedirectUri函数');
      return false;
    }
  } catch (error) {
    console.log('   ❌ 配置文件读取失败:', error.message);
    return false;
  }
}

/**
 * 2. 分析Netlify Function的redirect_uri处理逻辑
 */
function analyzeNetlifyFunction() {
  console.log('\n🖥️  2. 分析Netlify Function的redirect_uri处理逻辑...');
  
  try {
    const functionPath = path.join(__dirname, 'netlify/functions/authing-token-exchange.cjs');
    const content = fs.readFileSync(functionPath, 'utf8');
    
    // 检查Round #4修复逻辑
    const hasRound4Fix = content.includes('Round #4');
    const hasGetCorrectRedirectUri = content.includes('getCorrectRedirectUri');
    const hasOriginMapping = content.includes('originUrl.hostname');
    
    console.log('   📊 修复状态分析:');
    console.log(`      - Round #4修复: ${hasRound4Fix ? '✅' : '❌'}`);
    console.log(`      - getCorrectRedirectUri函数: ${hasGetCorrectRedirectUri ? '✅' : '❌'}`);
    console.log(`      - 域名映射逻辑: ${hasOriginMapping ? '✅' : '❌'}`);
    
    // 提取关键逻辑
    const getCorrectRedirectUriMatch = content.match(/function getCorrectRedirectUri\(\) \{[\s\S]*?\n    \}/);
    if (getCorrectRedirectUriMatch) {
      console.log('   🎯 getCorrectRedirectUri函数:');
      console.log('   ```javascript');
      console.log('   ' + getCorrectRedirectUriMatch[0].split('\n').join('\n   '));
      console.log('   ```');
      
      // 分析域名映射
      const domainMappings = [
        { pattern: 'localhost', target: 'http://localhost' },
        { pattern: 'wenpai.netlify.app', target: 'https://wenpai.netlify.app/callback' },
        { pattern: 'wenpai.xyz', target: 'https://wenpai.xyz/callback' },
        { pattern: 'default', target: 'https://www.wenpai.xyz/callback' }
      ];
      
      console.log('   🗺️  域名映射分析:');
      domainMappings.forEach(mapping => {
        const hasMapping = content.includes(mapping.pattern);
        console.log(`      - ${mapping.pattern} -> ${mapping.target}: ${hasMapping ? '✅' : '❌'}`);
      });
      
      return true;
    } else {
      console.log('   ❌ 未找到getCorrectRedirectUri函数');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Netlify Function读取失败:', error.message);
    return false;
  }
}

/**
 * 3. 分析cache-cleanup.js的URL处理逻辑
 */
function analyzeCacheCleanup() {
  console.log('\n🧹 3. 分析cache-cleanup.js的URL处理逻辑...');
  
  try {
    const cleanupPath = path.join(__dirname, 'public/cache-cleanup.js');
    const content = fs.readFileSync(cleanupPath, 'utf8');
    
    // 检查多重URL检测逻辑
    const hasMultipleUrlDetection = content.includes('callback%20');
    const hasGetCorrectCallbackUrl = content.includes('getCorrectCallbackUrl');
    const hasHostnameMapping = content.includes('hostname ===');
    
    console.log('   📊 URL清理分析:');
    console.log(`      - 多重URL检测: ${hasMultipleUrlDetection ? '✅' : '❌'}`);
    console.log(`      - getCorrectCallbackUrl函数: ${hasGetCorrectCallbackUrl ? '✅' : '❌'}`);
    console.log(`      - 主机名映射: ${hasHostnameMapping ? '✅' : '❌'}`);
    
    // 提取getCorrectCallbackUrl函数
    const getCorrectCallbackUrlMatch = content.match(/function getCorrectCallbackUrl\(\) \{[\s\S]*?\n      \}/);
    if (getCorrectCallbackUrlMatch) {
      console.log('   🎯 getCorrectCallbackUrl函数:');
      console.log('   ```javascript');
      console.log('   ' + getCorrectCallbackUrlMatch[0].split('\n').join('\n   '));
      console.log('   ```');
      
      // 分析URL选择逻辑
      console.log('   🚨 关键发现:');
      console.log('      - cache-cleanup.js在多重URL中选择第一个可能不正确');
      console.log('      - 应该根据当前访问的域名选择对应的callback URL');
      console.log('      - 而不是盲目选择第一个URL');
      
      return true;
    } else {
      console.log('   ❌ 未找到getCorrectCallbackUrl函数');
      return false;
    }
  } catch (error) {
    console.log('   ❌ cache-cleanup.js读取失败:', error.message);
    return false;
  }
}

/**
 * 4. 分析根本问题和解决方案
 */
function analyzeRootCause() {
  console.log('\n🔬 4. 根本原因分析...');
  
  console.log('   🔍 问题链条分析:');
  console.log('   1. 用户访问 www.wenpai.xyz');
  console.log('   2. 前端getRedirectUri()返回: https://www.wenpai.xyz/callback');
  console.log('   3. 发起Authing认证时使用: https://www.wenpai.xyz/callback');
  console.log('   4. 但Authing配置中可能有多个callback URL:');
  console.log('      - https://www.wenpai.xyz/callback');  
  console.log('      - https://wenpai.xyz/callback');
  console.log('      - https://wenpai.netlify.app/callback');
  console.log('      - http://localhost:5173/callback');
  console.log('   5. Authing返回所有配置的URL（用空格连接）');
  console.log('   6. cache-cleanup.js选择第一个，但可能不是认证时使用的');
  console.log('   7. token交换时redirect_uri不匹配 -> 400错误');
  
  console.log('\n   💡 解决方案:');
  console.log('   方案1 (推荐): 在Authing控制台中只保留一个callback URL');
  console.log('   方案2: 确保cache-cleanup.js选择正确的URL');
  console.log('   方案3: 后端完全忽略多重URL，强制使用正确的redirect_uri');
  
  console.log('\n   🚨 当前状态:');
  console.log('   - Round #4修复应该能处理不同origin的映射');
  console.log('   - 但如果Authing配置有多个URL，仍可能有问题');
  console.log('   - 需要检查Authing控制台的回调URL配置');
}

/**
 * 5. 生成修复建议
 */
function generateFixRecommendations() {
  console.log('\n📋 5. 修复建议...');
  
  const recommendations = [
    {
      priority: 'P0 - 紧急',
      title: '检查Authing控制台配置',
      action: '登录Authing控制台，检查应用配置中的回调URL列表，确保只有一个主要的callback URL',
      reason: '多个callback URL可能导致Authing返回多重URL'
    },
    {
      priority: 'P1 - 重要', 
      title: '优化cache-cleanup.js逻辑',
      action: '改进URL选择逻辑，根据当前访问域名选择对应的callback URL',
      reason: '当前可能选择了错误的callback URL'
    },
    {
      priority: 'P2 - 增强',
      title: '添加详细的调试日志',
      action: '在前端和后端都添加redirect_uri的详细日志，便于排查问题',
      reason: '便于快速定位redirect_uri不匹配的具体原因'
    },
    {
      priority: 'P3 - 预防',
      title: '实施redirect_uri验证机制',
      action: '在token交换前验证redirect_uri的正确性',
      reason: '提前发现并修正redirect_uri问题'
    }
  ];
  
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec.priority}: ${rec.title}`);
    console.log(`      行动: ${rec.action}`);
    console.log(`      原因: ${rec.reason}\n`);
  });
}

/**
 * 主函数
 */
function main() {
  const results = [
    analyzeConfigManager(),
    analyzeNetlifyFunction(), 
    analyzeCacheCleanup()
  ];
  
  analyzeRootCause();
  generateFixRecommendations();
  
  const successCount = results.filter(Boolean).length;
  
  console.log('=' .repeat(50));
  console.log(`📊 调试完成: ${successCount}/${results.length} 项分析成功`);
  
  if (successCount === results.length) {
    console.log('✅ 所有组件分析完成，已生成修复建议');
  } else {
    console.log('⚠️ 部分组件分析失败，请检查文件路径');
  }
  
  console.log('\n🔥 下一步行动:');
  console.log('1. 检查Authing控制台的回调URL配置');
  console.log('2. 部署Round #4修复到生产环境');
  console.log('3. 测试各种访问方式的认证流程');
  console.log('4. 监控redirect_uri相关的错误日志');
}

// 运行调试
main();