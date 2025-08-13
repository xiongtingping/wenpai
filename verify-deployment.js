#!/usr/bin/env node

/**
 * 部署验证脚本
 * 检查部署后的网站功能是否正常
 */

import https from 'https';
import http from 'http';

const SITE_URL = 'https://www.wenpai.xyz';
const TIMEOUT = 10000;

console.log('🚀 开始验证部署...');
console.log(`📍 验证站点: ${SITE_URL}`);

// 验证项目列表
const verificationTests = [
  {
    name: '首页加载',
    url: '/',
    expectedStatus: 200,
    expectedContent: ['文派', 'AI内容创作']
  },
  {
    name: 'API健康检查',
    url: '/api/test',
    expectedStatus: 200,
    expectedContent: ['success', 'ok']
  },
  {
    name: 'Authing回调页面',
    url: '/callback',
    expectedStatus: 200,
    expectedContent: ['callback', 'authing']
  },
  {
    name: '静态资源',
    url: '/favicon.ico',
    expectedStatus: 200,
    expectedContent: []
  }
];

// HTTP请求函数
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;
    const protocol = fullUrl.startsWith('https') ? https : http;
    
    const req = protocol.get(fullUrl, {
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Deployment-Verification-Bot/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// 执行验证
async function runVerification() {
  const results = [];
  
  for (const test of verificationTests) {
    console.log(`\n🔍 测试: ${test.name}`);
    console.log(`📡 请求: ${test.url}`);
    
    try {
      const response = await makeRequest(test.url);
      const passed = response.status === test.expectedStatus;
      
      // 检查内容
      let contentCheck = true;
      if (test.expectedContent.length > 0) {
        contentCheck = test.expectedContent.some(content => 
          response.body.toLowerCase().includes(content.toLowerCase())
        );
      }
      
      const result = {
        test: test.name,
        url: test.url,
        status: response.status,
        expected: test.expectedStatus,
        passed: passed && contentCheck,
        contentFound: contentCheck,
        responseSize: response.body.length
      };
      
      results.push(result);
      
      if (result.passed) {
        console.log(`✅ 通过 (${response.status}) - ${response.body.length} bytes`);
      } else {
        console.log(`❌ 失败 (${response.status}) - 期望: ${test.expectedStatus}`);
        if (!contentCheck) {
          console.log(`   内容检查失败，期望包含: ${test.expectedContent.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
      results.push({
        test: test.name,
        url: test.url,
        status: 'ERROR',
        expected: test.expectedStatus,
        passed: false,
        error: error.message
      });
    }
  }
  
  // 输出总结
  console.log('\n📊 验证总结:');
  console.log('═'.repeat(50));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`✅ 通过: ${passed}/${total}`);
  console.log(`❌ 失败: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 所有验证通过！部署成功！');
    console.log(`🌐 访问地址: ${SITE_URL}`);
  } else {
    console.log('\n⚠️  部分验证失败，请检查相关功能');
  }
  
  return results;
}

// 运行验证
runVerification().catch(console.error);
