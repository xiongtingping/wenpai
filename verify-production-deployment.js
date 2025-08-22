#!/usr/bin/env node

/**
 * 🔍 部署验证脚本 - 验证生产环境配置和功能
 */

console.log('🚀 开始验证生产环境部署...\n');

const PRODUCTION_URL = 'https://www.wenpai.xyz';
const EXPECTED_APP_ID = '68a68a29d0c3341ae7a3df23';

// 测试项目列表
const tests = [
  {
    name: '🌐 网站可访问性',
    test: async () => {
      const response = await fetch(PRODUCTION_URL);
      return {
        success: response.ok,
        details: `状态码: ${response.status}`,
        data: { status: response.status, ok: response.ok }
      };
    }
  },
  {
    name: '🔧 Netlify Functions可用性',
    test: async () => {
      try {
        const response = await fetch(`${PRODUCTION_URL}/.netlify/functions/oidc-discovery?appId=${EXPECTED_APP_ID}`);
        const data = await response.json();
        return {
          success: response.ok && data.authorization_endpoint,
          details: `端点: ${data.authorization_endpoint || '未找到'}`,
          data: data
        };
      } catch (error) {
        return {
          success: false,
          details: `错误: ${error.message}`,
          data: null
        };
      }
    }
  },
  {
    name: '🔐 Authing配置验证',
    test: async () => {
      try {
        const response = await fetch(`${PRODUCTION_URL}/.netlify/functions/oidc-discovery?appId=${EXPECTED_APP_ID}`);
        const data = await response.json();
        const hasCorrectAppId = data.authorization_endpoint?.includes(EXPECTED_APP_ID);
        return {
          success: hasCorrectAppId,
          details: `App ID检查: ${hasCorrectAppId ? '✅ 正确' : '❌ 错误'}`,
          data: { appIdMatch: hasCorrectAppId, endpoint: data.authorization_endpoint }
        };
      } catch (error) {
        return {
          success: false,
          details: `配置检查失败: ${error.message}`,
          data: null
        };
      }
    }
  }
];

// 执行测试
async function runTests() {
  let passedTests = 0;
  const totalTests = tests.length;

  for (const test of tests) {
    console.log(`📋 执行测试: ${test.name}`);
    
    try {
      const result = await test.test();
      
      if (result.success) {
        console.log(`✅ 通过: ${result.details}`);
        passedTests++;
      } else {
        console.log(`❌ 失败: ${result.details}`);
      }
      
      if (result.data) {
        console.log(`📊 数据:`, JSON.stringify(result.data, null, 2));
      }
      
    } catch (error) {
      console.log(`❌ 测试异常: ${error.message}`);
    }
    
    console.log(); // 空行分隔
  }

  // 生成测试报告
  console.log('📊 测试结果汇总:');
  console.log('='.repeat(50));
  console.log(`✅ 通过测试: ${passedTests}/${totalTests}`);
  console.log(`❌ 失败测试: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！部署验证成功！');
    console.log('🔗 生产环境地址:', PRODUCTION_URL);
    console.log('🎯 建议操作:');
    console.log('   1. 访问生产环境测试用户登录');
    console.log('   2. 验证多重回调URL问题已修复');
    console.log('   3. 检查所有核心功能正常');
  } else {
    console.log('\n⚠️  部分测试失败，需要进一步检查！');
    console.log('🔧 建议操作:');
    console.log('   1. 检查Netlify Functions部署状态');
    console.log('   2. 验证环境变量配置');
    console.log('   3. 查看Netlify部署日志');
  }

  return passedTests === totalTests;
}

// 主要验证流程
async function main() {
  try {
    const success = await runTests();
    
    console.log('\n🔍 部署信息:');
    console.log(`📅 部署时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log(`🆔 App ID: ${EXPECTED_APP_ID}`);
    console.log(`🌐 生产URL: ${PRODUCTION_URL}`);
    console.log(`✅ 验证状态: ${success ? '成功' : '需要修复'}`);
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ 验证脚本执行失败:', error.message);
    process.exit(1);
  }
}

main();