#!/usr/bin/env node

/**
 * 速率限制功能测试脚本
 * 用于验证IP级别速率限制是否正常工作
 */

const axios = require('axios');

// 测试配置
const CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:8888',
  endpoints: [
    '/.netlify/functions/api?action=hot-topics',
    '/.netlify/functions/api/config',
    '/.netlify/functions/api/ai/chat'
  ],
  concurrency: 5, // 并发请求数
  totalRequests: 50, // 总请求数
  delay: 100 // 请求间隔(ms)
};

// 请求统计
const stats = {
  total: 0,
  success: 0,
  rateLimited: 0,
  errors: 0,
  responses: []
};

/**
 * 发送单个测试请求
 */
async function sendTestRequest(endpoint, index) {
  try {
    const startTime = Date.now();
    
    let requestData = {};
    if (endpoint.includes('/ai/chat')) {
      requestData = {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: 'Hello, this is a test' }],
        temperature: 0.7
      };
    }

    const response = await axios({
      method: endpoint.includes('/ai/chat') ? 'POST' : 'GET',
      url: `${CONFIG.baseURL}${endpoint}`,
      data: Object.keys(requestData).length > 0 ? requestData : undefined,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RateLimit-Test-Script/1.0'
      },
      timeout: 10000,
      validateStatus: () => true // 不抛出HTTP错误异常
    });

    const duration = Date.now() - startTime;
    const result = {
      index,
      endpoint,
      status: response.status,
      duration,
      rateLimited: response.status === 429,
      timestamp: new Date().toISOString(),
      headers: {
        'x-ratelimit-limit': response.headers['x-ratelimit-limit'],
        'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': response.headers['x-ratelimit-reset'],
        'retry-after': response.headers['retry-after']
      }
    };

    stats.total++;
    if (response.status === 200) {
      stats.success++;
    } else if (response.status === 429) {
      stats.rateLimited++;
      console.log(`🚫 请求 ${index} 被限制 - ${endpoint} (Retry-After: ${result.headers['retry-after']}s)`);
    } else {
      stats.errors++;
      console.log(`❌ 请求 ${index} 错误 - ${endpoint} (状态: ${response.status})`);
    }

    stats.responses.push(result);
    
    return result;
  } catch (error) {
    stats.total++;
    stats.errors++;
    console.error(`💥 请求 ${index} 异常 - ${endpoint}:`, error.message);
    
    return {
      index,
      endpoint,
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 批量发送请求
 */
async function runConcurrentTest(endpoint, requestCount) {
  console.log(`\n📡 开始测试端点: ${endpoint}`);
  console.log(`   请求数量: ${requestCount}, 并发数: ${CONFIG.concurrency}, 间隔: ${CONFIG.delay}ms`);
  
  const requests = [];
  
  for (let i = 0; i < requestCount; i++) {
    const request = sendTestRequest(endpoint, i + 1);
    requests.push(request);
    
    // 控制并发数
    if (requests.length >= CONFIG.concurrency) {
      await Promise.all(requests);
      requests.length = 0; // 清空数组
      
      // 添加延迟
      if (i < requestCount - 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
      }
    }
  }
  
  // 处理剩余请求
  if (requests.length > 0) {
    await Promise.all(requests);
  }
}

/**
 * 测试单个端点的速率限制
 */
async function testEndpoint(endpoint) {
  const testStats = {
    endpoint,
    startTime: Date.now(),
    requests: CONFIG.totalRequests,
    results: {
      success: 0,
      rateLimited: 0,
      errors: 0
    }
  };
  
  // 重置统计
  const initialStats = { ...stats };
  
  await runConcurrentTest(endpoint, CONFIG.totalRequests);
  
  // 计算这个端点的统计
  testStats.results.success = stats.success - initialStats.success;
  testStats.results.rateLimited = stats.rateLimited - initialStats.rateLimited;
  testStats.results.errors = stats.errors - initialStats.errors;
  testStats.duration = Date.now() - testStats.startTime;
  
  console.log(`\n📊 端点 ${endpoint} 测试结果:`);
  console.log(`   成功: ${testStats.results.success}/${CONFIG.totalRequests}`);
  console.log(`   被限制: ${testStats.results.rateLimited}/${CONFIG.totalRequests}`);
  console.log(`   错误: ${testStats.results.errors}/${CONFIG.totalRequests}`);
  console.log(`   耗时: ${testStats.duration}ms`);
  
  return testStats;
}

/**
 * 测试管理员端点
 */
async function testAdminEndpoint() {
  console.log(`\n🔧 测试管理员端点...`);
  
  try {
    const response = await axios.get(`${CONFIG.baseURL}/.netlify/functions/rate-limit-admin`, {
      headers: {
        'Authorization': 'Bearer test-admin-token', // 需要真实token
        'Content-Type': 'application/json'
      },
      timeout: 5000,
      validateStatus: () => true
    });
    
    console.log(`   状态: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      console.log(`   ✅ 管理端点可访问`);
      console.log(`   缓存IP数: ${response.data.data.totalCachedIPs}`);
    } else if (response.status === 401 || response.status === 403) {
      console.log(`   🔒 管理端点需要认证（正常）`);
    } else {
      console.log(`   ❌ 管理端点异常: ${response.data?.message || '未知错误'}`);
    }
  } catch (error) {
    console.log(`   💥 管理端点测试失败: ${error.message}`);
  }
}

/**
 * 生成测试报告
 */
function generateReport(endpointResults) {
  console.log(`\n📋 速率限制测试报告`);
  console.log(`===========================================`);
  console.log(`测试时间: ${new Date().toLocaleString()}`);
  console.log(`测试目标: ${CONFIG.baseURL}`);
  console.log(`总请求数: ${stats.total}`);
  console.log(`成功: ${stats.success} (${((stats.success/stats.total)*100).toFixed(1)}%)`);
  console.log(`被限制: ${stats.rateLimited} (${((stats.rateLimited/stats.total)*100).toFixed(1)}%)`);
  console.log(`错误: ${stats.errors} (${((stats.errors/stats.total)*100).toFixed(1)}%)`);
  
  console.log(`\n按端点统计:`);
  endpointResults.forEach(result => {
    console.log(`  ${result.endpoint}:`);
    console.log(`    成功: ${result.results.success}, 限制: ${result.results.rateLimited}, 错误: ${result.results.errors}`);
    console.log(`    限制率: ${((result.results.rateLimited/CONFIG.totalRequests)*100).toFixed(1)}%`);
  });
  
  // 分析速率限制效果
  console.log(`\n🎯 速率限制效果分析:`);
  
  if (stats.rateLimited > 0) {
    console.log(`   ✅ 速率限制功能正常工作`);
    console.log(`   📊 ${stats.rateLimited} 个请求被正确阻止`);
  } else {
    console.log(`   ⚠️  未触发速率限制 - 可能需要增加请求频率或减少限制阈值`);
  }
  
  const avgSuccessRate = (stats.success / stats.total) * 100;
  if (avgSuccessRate > 80) {
    console.log(`   ✅ 服务可用性良好 (${avgSuccessRate.toFixed(1)}%)`);
  } else if (avgSuccessRate > 50) {
    console.log(`   ⚠️  服务可用性中等 (${avgSuccessRate.toFixed(1)}%)`);
  } else {
    console.log(`   ❌ 服务可用性较低 (${avgSuccessRate.toFixed(1)}%)`);
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log(`🚀 开始速率限制功能测试`);
  console.log(`目标: ${CONFIG.baseURL}`);
  console.log(`测试参数: 并发=${CONFIG.concurrency}, 总请求=${CONFIG.totalRequests}, 间隔=${CONFIG.delay}ms\n`);
  
  const endpointResults = [];
  
  // 测试每个端点
  for (const endpoint of CONFIG.endpoints) {
    const result = await testEndpoint(endpoint);
    endpointResults.push(result);
    
    // 端点之间稍微休息
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 测试管理员端点
  await testAdminEndpoint();
  
  // 生成报告
  generateReport(endpointResults);
  
  console.log(`\n✨ 测试完成!`);
}

// 运行测试
if (require.main === module) {
  main().catch(error => {
    console.error('💥 测试失败:', error);
    process.exit(1);
  });
}

module.exports = { sendTestRequest, testEndpoint };