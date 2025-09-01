/**
 * 清理品牌库localStorage数据脚本
 * 在浏览器开发者工具Console中运行
 */

console.log('🧹 开始清理品牌库localStorage数据...');

// 获取所有localStorage键
const allKeys = Object.keys(localStorage);
console.log('📋 当前localStorage所有键:', allKeys);

// 品牌库相关的键模式
const brandPatterns = [
  'brand_assets',
  'brand_dimensions', 
  'brandAssets',
  'brandDimensions',
  'library_',
  'brand_'
];

// 查找并删除相关键
let deletedCount = 0;
let deletedKeys = [];

allKeys.forEach(key => {
  const shouldDelete = brandPatterns.some(pattern => key.includes(pattern));
  
  if (shouldDelete) {
    console.log(`🗑️ 删除键: ${key}`);
    const data = localStorage.getItem(key);
    console.log(`📄 数据内容预览: ${data?.substring(0, 200)}...`);
    
    localStorage.removeItem(key);
    deletedKeys.push(key);
    deletedCount++;
  }
});

console.log(`✅ 清理完成！删除了 ${deletedCount} 个localStorage项:`);
console.log('🗑️ 已删除的键:', deletedKeys);

// 验证清理结果
const remainingKeys = Object.keys(localStorage);
const stillHasBrandData = remainingKeys.some(key => 
  brandPatterns.some(pattern => key.includes(pattern))
);

if (stillHasBrandData) {
  console.warn('⚠️ 仍有部分品牌库数据未清理完全');
  console.log('🔍 剩余相关键:', remainingKeys.filter(key => 
    brandPatterns.some(pattern => key.includes(pattern))
  ));
} else {
  console.log('✅ 品牌库数据已完全清理');
}

console.log('🔄 请刷新页面以查看效果');