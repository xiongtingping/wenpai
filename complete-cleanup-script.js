/**
 * 彻底清理品牌库localStorage数据脚本
 * 在浏览器开发者工具Console中运行
 * 专门清理包含示例数据的localStorage项
 */

console.log('🧹 开始彻底清理品牌库localStorage数据...');

// 1. 获取所有localStorage键
const allKeys = Object.keys(localStorage);
console.log(`📋 当前localStorage总计 ${allKeys.length} 个键:`, allKeys);

// 2. 查找所有品牌库相关的键 (更全面的模式)
const brandPatterns = [
  'brand_assets',
  'brand_dimensions', 
  'brandAssets',
  'brandDimensions',
  'library_',
  'brand_',
  'wenpai_brand',
  'assets_',
  'dimensions_'
];

// 3. 查找包含示例数据内容的键
const sampleDataKeywords = [
  '小红书营销策略',
  '品牌推广文案',
  '内容营销趋势',
  '策略分析',
  '文案模板',
  '趋势报告',
  '营销策略',
  '推广文案'
];

let deletedCount = 0;
let deletedKeys = [];
let foundSampleData = [];

// 4. 检查每个键的内容
allKeys.forEach(key => {
  try {
    const data = localStorage.getItem(key);
    
    // 检查是否是品牌库相关键
    const isBrandKey = brandPatterns.some(pattern => key.includes(pattern));
    
    // 检查内容是否包含示例数据
    const hasSampleData = data && sampleDataKeywords.some(keyword => 
      data.includes(keyword)
    );
    
    if (isBrandKey || hasSampleData) {
      console.log(`🎯 发现需要清理的键: ${key}`);
      
      if (hasSampleData) {
        foundSampleData.push({
          key,
          keywords: sampleDataKeywords.filter(keyword => data.includes(keyword))
        });
        console.log(`📄 发现示例数据:`, foundSampleData[foundSampleData.length - 1]);
      }
      
      // 显示数据内容预览
      if (data) {
        console.log(`📄 内容预览: ${data.substring(0, 300)}...`);
      }
      
      localStorage.removeItem(key);
      deletedKeys.push(key);
      deletedCount++;
    }
  } catch (error) {
    console.error(`❌ 处理键 ${key} 时出错:`, error);
  }
});

// 5. 输出清理结果
console.log(`\n✅ 清理完成！`);
console.log(`🗑️ 删除了 ${deletedCount} 个localStorage项:`);
console.log(deletedKeys);

if (foundSampleData.length > 0) {
  console.log(`\n🎯 清理的示例数据:`);
  foundSampleData.forEach(item => {
    console.log(`   ${item.key}: ${item.keywords.join(', ')}`);
  });
}

// 6. 验证清理结果
const remainingKeys = Object.keys(localStorage);
const stillHasBrandData = remainingKeys.some(key => 
  brandPatterns.some(pattern => key.includes(pattern))
);

const stillHasSampleData = remainingKeys.some(key => {
  const data = localStorage.getItem(key);
  return data && sampleDataKeywords.some(keyword => data.includes(keyword));
});

if (stillHasBrandData || stillHasSampleData) {
  console.warn('⚠️ 仍有部分数据未清理完全');
  if (stillHasBrandData) {
    console.log('🔍 剩余品牌相关键:', remainingKeys.filter(key => 
      brandPatterns.some(pattern => key.includes(pattern))
    ));
  }
  if (stillHasSampleData) {
    console.log('🔍 剩余示例数据键:', remainingKeys.filter(key => {
      const data = localStorage.getItem(key);
      return data && sampleDataKeywords.some(keyword => data.includes(keyword));
    }));
  }
} else {
  console.log('✅ 品牌库数据和示例数据已完全清理');
}

console.log('\n🔄 请刷新页面以查看效果');
console.log('📱 如果问题仍然存在，可能需要检查应用代码中的硬编码数据');