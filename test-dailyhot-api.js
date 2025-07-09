/**
 * DailyHotApi 接口测试脚本
 * 验证全网热点数据获取功能
 */

import axios from 'axios';

/**
 * 测试获取全网热点聚合数据
 */
async function testGetDailyHotAll() {
  console.log('🔍 测试获取全网热点聚合数据...');
  try {
    const response = await axios.get('https://api-hot.imsyy.top/all');
    console.log('✅ 接口响应状态:', response.status);
    console.log('📊 数据格式:', typeof response.data);
    
    if (response.data && response.data.code === 200) {
      const platforms = Object.keys(response.data.data || {});
      console.log('🌐 支持平台数量:', platforms.length);
      console.log('📋 平台列表:', platforms.slice(0, 10).join(', '));
      
      // 统计总话题数
      let totalTopics = 0;
      Object.values(response.data.data || {}).forEach(items => {
        totalTopics += items.length;
      });
      console.log('📈 总话题数:', totalTopics);
      
      return true;
    } else {
      console.log('❌ 接口返回错误:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return false;
  }
}

/**
 * 测试获取指定平台数据
 */
async function testGetPlatformData(platform) {
  console.log(`🔍 测试获取 ${platform} 平台数据...`);
  try {
    const response = await axios.get(`https://api-hot.imsyy.top/${platform}`);
    console.log('✅ 接口响应状态:', response.status);
    
    if (response.data && response.data.code === 200) {
      const items = response.data.data || [];
      console.log(`📊 ${platform} 话题数量:`, items.length);
      
      if (items.length > 0) {
        console.log(`📝 示例话题:`, items[0].title);
        console.log(`🔥 热度值:`, items[0].hot);
      }
      
      return true;
    } else {
      console.log('❌ 接口返回错误:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return false;
  }
}

/**
 * 测试支持的平台列表
 */
function testSupportedPlatforms() {
  console.log('🔍 测试支持的平台列表...');
  const platforms = [
    'weibo',      // 微博
    'zhihu',      // 知乎
    'douyin',     // 抖音
    'bilibili',   // B站
    'baidu',      // 百度
    '36kr',       // 36氪
    'ithome',     // IT之家
    'sspai',      // 少数派
    'juejin',     // 掘金
    'csdn',       // CSDN
    'github',     // GitHub
    'v2ex',       // V2EX
    'ngabbs',     // NGA
    'hellogithub', // HelloGitHub
    'weatheralarm', // 中央气象台
    'earthquake',   // 中国地震台
    'history'       // 历史上的今天
  ];
  
  console.log('📋 支持平台数量:', platforms.length);
  console.log('🌐 平台列表:', platforms.join(', '));
  return platforms;
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log('🚀 开始测试 DailyHotApi 接口...\n');
  
  // 测试1: 获取全网热点聚合数据
  const allDataSuccess = await testGetDailyHotAll();
  console.log('');
  
  // 测试2: 测试支持的平台列表
  const platforms = testSupportedPlatforms();
  console.log('');
  
  // 测试3: 测试几个主要平台
  const testPlatforms = ['weibo', 'zhihu', 'douyin', 'bilibili'];
  for (const platform of testPlatforms) {
    await testGetPlatformData(platform);
    console.log('');
  }
  
  // 测试4: 测试一个特殊平台
  await testGetPlatformData('github');
  console.log('');
  
  console.log('🎉 测试完成！');
  
  if (allDataSuccess) {
    console.log('✅ 全网热点功能测试通过');
  } else {
    console.log('❌ 全网热点功能测试失败');
  }
}

// 运行测试
runTests().catch(console.error); 