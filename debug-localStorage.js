/**
 * 调试localStorage数据内容
 * 在浏览器开发者工具Console中运行
 */

console.log('🔍 开始调试localStorage数据内容...');

// 获取所有localStorage键
const allKeys = Object.keys(localStorage);
console.log('📋 当前localStorage所有键:', allKeys);

// 查找品牌库相关的键
const brandKeys = allKeys.filter(key => 
  key.includes('brand') || 
  key.includes('assets') || 
  key.includes('dimensions') ||
  key.includes('library')
);

console.log('🎯 品牌库相关的键:', brandKeys);

// 输出每个键的详细内容
brandKeys.forEach(key => {
  console.log(`\n📁 键: ${key}`);
  const data = localStorage.getItem(key);
  
  try {
    const parsed = JSON.parse(data);
    console.log(`📄 解析后的数据:`, parsed);
    
    // 如果是数组，显示数组内容概要
    if (Array.isArray(parsed)) {
      console.log(`📊 数组长度: ${parsed.length}`);
      parsed.forEach((item, index) => {
        console.log(`   [${index}] 名称: ${item.name || item.title || 'N/A'}`);
        console.log(`   [${index}] 类型: ${item.type || 'N/A'}`);
        console.log(`   [${index}] 状态: ${item.status || 'N/A'}`);
      });
    }
  } catch (error) {
    console.log(`❌ JSON解析失败:`, data?.substring(0, 200) + '...');
  }
});

// 查找可能包含示例数据的键
console.log('\n🔍 检查是否包含示例数据关键词...');
brandKeys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data && (
    data.includes('小红书营销') || 
    data.includes('品牌推广') || 
    data.includes('内容营销') ||
    data.includes('策略分析') ||
    data.includes('文案模板') ||
    data.includes('趋势报告')
  )) {
    console.log(`🎯 发现示例数据在键: ${key}`);
    console.log(`📄 内容片段:`, data.substring(0, 500) + '...');
  }
});