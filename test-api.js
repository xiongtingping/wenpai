// 测试API是否正常工作
const baseUrl = 'https://wenpaiai626-kto0p4x4n-xiongtingping-9125s-projects.vercel.app';

async function testAPI(endpoint) {
  try {
    console.log(`Testing ${endpoint}...`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    const text = await response.text();
    
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get('content-type')}`);
    console.log(`Response: ${text.substring(0, 200)}...`);
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('✅ API working correctly');
        return true;
      } catch (e) {
        console.log('❌ Response is not valid JSON');
        return false;
      }
    } else {
      console.log('❌ API returned error status');
      return false;
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('=== API Tests ===\n');
  
  const endpoints = [
    '/api/debug',
    '/api/status/openai',
    '/api/status/deepseek',
    '/api/status/gemini',
    '/api/test-status'
  ];
  
  for (const endpoint of endpoints) {
    await testAPI(endpoint);
    console.log('');
  }
}

// 如果在浏览器中运行
if (typeof window !== 'undefined') {
  runTests();
} else {
  console.log('请在浏览器控制台中运行此脚本');
} 