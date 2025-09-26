/**
 * 手动颜色更新脚本
 * 在浏览器控制台中执行以立即更新emoji颜色
 */

console.log('🎨 开始手动emoji颜色更新...');

// 手动执行颜色更新
async function manualColorUpdate() {
  try {
    // 动态导入服务
    const { getAllEmojis, updateEmojiData } = await import('./src/services/unifiedEmojiSystem.ts');
    
    const allEmojis = getAllEmojis();
    console.log(`📊 发现 ${allEmojis.length} 个emoji`);
    
    // 检查当前颜色分布
    const colorCount = new Map();
    allEmojis.forEach(emoji => {
      const count = colorCount.get(emoji.color) || 0;
      colorCount.set(emoji.color, count + 1);
    });
    
    console.log(`🔍 当前唯一颜色数: ${colorCount.size}`);
    console.log(`❗ #008000 使用次数: ${colorCount.get('#008000') || 0}`);
    
    // 生成新颜色
    const newEmojis = allEmojis.map((emoji, index) => {
      return {
        ...emoji,
        color: generateNewColor(emoji, index)
      };
    });
    
    // 更新数据
    updateEmojiData(newEmojis);
    
    // 检查更新后的颜色分布
    const newColorCount = new Map();
    newEmojis.forEach(emoji => {
      const count = newColorCount.get(emoji.color) || 0;
      newColorCount.set(emoji.color, count + 1);
    });
    
    console.log(`✅ 更新完成! 新唯一颜色数: ${newColorCount.size}`);
    console.log(`🎯 新 #008000 使用次数: ${newColorCount.get('#008000') || 0}`);
    
    // 强制刷新页面以查看效果
    setTimeout(() => {
      console.log('🔄 刷新页面查看效果...');
      window.location.reload();
    }, 1000);
    
  } catch (error) {
    console.error('❌ 颜色更新失败:', error);
  }
}

// 简单的颜色生成函数
function generateNewColor(emoji, index) {
  const colors = [
    // 红色系
    '#FF0000', '#DC143C', '#B22222', '#CD5C5C', '#F08080', '#FF6347', '#FF4500',
    // 绿色系
    '#228B22', '#32CD32', '#7CFC00', '#9ACD32', '#2E8B57', '#00FF7F', '#ADFF2F',
    // 蓝色系
    '#4169E1', '#1E90FF', '#00BFFF', '#87CEEB', '#6495ED', '#87CEFA', '#ADD8E6',
    // 黄色系
    '#FFD700', '#FFFF00', '#F0E68C', '#DAA520', '#BDB76B', '#FFA500', '#FF8C00',
    // 紫色系
    '#9370DB', '#9932CC', '#BA55D3', '#DA70D6', '#DDA0DD', '#EE82EE', '#FF00FF',
    // 棕色系
    '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#BC8F8F',
    // 粉色系
    '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FFCCCB', '#F0E68C', '#FFE4E1',
    // 灰色系
    '#696969', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', '#778899', '#708090'
  ];
  
  // 基于emoji特征选择颜色
  const text = emoji.name.toLowerCase();
  let selectedColors = colors;
  
  // 基于关键词筛选颜色
  if (text.includes('红') || text.includes('苹果') || text.includes('草莓')) {
    selectedColors = colors.slice(0, 7); // 红色系
  } else if (text.includes('绿') || text.includes('草') || text.includes('叶')) {
    selectedColors = colors.slice(7, 14); // 绿色系
  } else if (text.includes('蓝') || text.includes('天') || text.includes('海')) {
    selectedColors = colors.slice(14, 21); // 蓝色系
  } else if (text.includes('黄') || text.includes('金') || text.includes('太阳')) {
    selectedColors = colors.slice(21, 28); // 黄色系
  } else if (text.includes('紫') || text.includes('葡萄')) {
    selectedColors = colors.slice(28, 35); // 紫色系
  } else if (text.includes('棕') || text.includes('木') || text.includes('熊')) {
    selectedColors = colors.slice(35, 42); // 棕色系
  } else if (text.includes('粉') || text.includes('花')) {
    selectedColors = colors.slice(42, 49); // 粉色系
  }
  
  // 基于索引和emoji名称生成确定性选择
  let hash = index;
  for (let i = 0; i < emoji.name.length; i++) {
    hash = hash * 31 + emoji.name.charCodeAt(i);
  }
  
  return selectedColors[Math.abs(hash) % selectedColors.length];
}

// 执行更新
manualColorUpdate();

console.log('📝 如果没有自动执行，请手动调用: manualColorUpdate()');