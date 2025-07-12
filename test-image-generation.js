/**
 * 图像生成API测试脚本
 * 测试Netlify函数API的图像生成功能
 */

const API_BASE_URL = 'http://localhost:3001/.netlify/functions/api';

/**
 * 测试API状态检查
 */
async function testApiStatus() {
  console.log('🔍 测试API状态检查...');
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'status'
      })
    });

    const data = await response.json();
    console.log('✅ API状态检查结果:', data);
    return data.success && data.available;
  } catch (error) {
    console.error('❌ API状态检查失败:', error.message);
    return false;
  }
}

/**
 * 测试图像生成
 */
async function testImageGeneration() {
  console.log('🎨 测试图像生成...');
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'openai',
        action: 'generate-image',
        prompt: '一只可爱的小猫坐在花园里，阳光明媚，卡通风格',
        n: 1,
        size: '512x512',
        response_format: 'url'
      })
    });

    const data = await response.json();
    console.log('✅ 图像生成结果:', data);
    
    if (data.success && data.data?.images?.length > 0) {
      console.log('🖼️  生成的图像URL:', data.data.images[0].url);
      return true;
    } else {
      console.error('❌ 图像生成失败:', data.error || data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ 图像生成请求失败:', error.message);
    return false;
  }
}

/**
 * 测试API信息
 */
async function testApiInfo() {
  console.log('ℹ️  测试API信息...');
  
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log('✅ API信息:', data);
    return data.success;
  } catch (error) {
    console.error('❌ API信息获取失败:', error.message);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始图像生成API测试...\n');
  
  // 测试API信息
  const apiInfoSuccess = await testApiInfo();
  console.log('');
  
  // 测试API状态
  const apiStatusSuccess = await testApiStatus();
  console.log('');
  
  // 如果API可用，测试图像生成
  if (apiStatusSuccess) {
    const imageGenerationSuccess = await testImageGeneration();
    console.log('');
    
    console.log('📊 测试结果汇总:');
    console.log(`  API信息: ${apiInfoSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`  API状态: ${apiStatusSuccess ? '✅ 可用' : '❌ 不可用'}`);
    console.log(`  图像生成: ${imageGenerationSuccess ? '✅ 成功' : '❌ 失败'}`);
    
    if (apiInfoSuccess && apiStatusSuccess && imageGenerationSuccess) {
      console.log('\n🎉 所有测试通过！图像生成功能正常工作。');
    } else {
      console.log('\n⚠️  部分测试失败，请检查配置。');
    }
  } else {
    console.log('📊 测试结果汇总:');
    console.log(`  API信息: ${apiInfoSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`  API状态: ${apiStatusSuccess ? '✅ 可用' : '❌ 不可用'}`);
    console.log('\n⚠️  API不可用，跳过图像生成测试。');
    console.log('💡 请确保：');
    console.log('   1. 开发服务器正在运行 (npm run dev)');
    console.log('   2. OPENAI_API_KEY 环境变量已配置');
    console.log('   3. Netlify函数正常工作');
  }
}

// 运行测试
runTests().catch(console.error); 