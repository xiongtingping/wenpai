/**
 * 强制颜色更新工具
 * 手动触发emoji颜色系统更新
 */

type EmojiSystemModule = typeof import('@/services/unifiedEmojiSystem');
import type { UnifiedEmojiItem } from '@/services/unifiedEmojiSystem';

let emojiSystemLoader: Promise<EmojiSystemModule> | null = null;

async function loadEmojiSystem(): Promise<EmojiSystemModule> {
  if (!emojiSystemLoader) {
    emojiSystemLoader = import('@/services/unifiedEmojiSystem');
  }
  return emojiSystemLoader;
}

/**
 * 强制更新所有emoji颜色
 */
export async function forceUpdateEmojiColors(): Promise<void> {
  console.log('🚀 强制startsemojicolorupdating...');
  const { updateEmojiData, getAllEmojis } = await loadEmojiSystem();
  const allEmojis = getAllEmojis();
  console.log(`📊 currentemojiquantity: ${allEmojis.length}`);
  
  // 统计原始颜色
  const originalColors = new Map<string, number>();
  allEmojis.forEach(emoji => {
    const count = originalColors.get(emoji.color) || 0;
    originalColors.set(emoji.color, count + 1);
  });
  
  console.log(`🔍 原始唯一color数: ${originalColors.size}`);
  console.log(`⚠️ #008000使用count: ${originalColors.get('#008000') || 0}`);
  
  // 显示最常用的颜色
  const topColors = Array.from(originalColors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  console.log('🎨 最常用color:');
  topColors.forEach(([color, count]) => {
    console.log(`  ${color}: ${count} times`);
  });
  
  // 应用新的颜色系统
  const updatedEmojis = generateDiverseColors(allEmojis);
  
  // 更新数据
  updateEmojiData(updatedEmojis);
  
  // 统计更新后的颜色
  const newColors = new Map<string, number>();
  updatedEmojis.forEach(emoji => {
    const count = newColors.get(emoji.color) || 0;
    newColors.set(emoji.color, count + 1);
  });
  
  console.log(`✅ updatingcompleted! new唯一color数: ${newColors.size}`);
  console.log(`🎯 new#008000使用count: ${newColors.get('#008000') || 0}`);
  
  // 显示改进效果
  const improvement = ((newColors.size - originalColors.size) / originalColors.size * 100);
  console.log(`📈 color多样性提升: ${improvement.toFixed(1)}%`);
  
  // 检查重复情况
  const duplicates = Array.from(newColors.entries())
    .filter(([_, count]) => count > 3)
    .sort((a, b) => b[1] - a[1]);
    
  if (duplicates.length > 0) {
    console.log(`⚠️ 仍has${duplicates.length}unitscolorduplicate使用超过3times:`);
    duplicates.slice(0, 3).forEach(([color, count]) => {
      console.log(`  ${color}: ${count} times`);
    });
  } else {
    console.log('🎉 所hascolorduplicate问题already解决!');
  }
}

/**
 * 生成多样化颜色
 */
function generateDiverseColors(emojis: UnifiedEmojiItem[]): UnifiedEmojiItem[] {
  const colorPools = {
    animals: [
      '#FF8C00', '#CD853F', '#D2691E', '#A0522D', '#8B4513', // 棕色系
      '#DEB887', '#F4A460', '#DAA520', '#B8860B', '#BC8F8F', // 米色系
      '#696969', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#778899', // 灰色系
      '#228B22', '#32CD32', '#9ACD32', '#7CFC00', '#00FF7F', // 绿色系
      '#4682B4', '#5F9EA0', '#87CEEB', '#6495ED', '#00BFFF', // 蓝色系
      '#FF6347', '#FF4500', '#DC143C', '#B22222', '#CD5C5C', // 红色系
      '#9370DB', '#9932CC', '#BA55D3', '#DA70D6', '#DDA0DD'  // 紫色系
    ],
    food: [
      '#FF6347', '#FF4500', '#FF0000', '#DC143C', '#B22222', // 红色水果
      '#FFA500', '#FF8C00', '#FFD700', '#F0E68C', '#FFFF00', // 橙黄色
      '#32CD32', '#228B22', '#7CFC00', '#9ACD32', '#ADFF2F', // 绿色蔬菜
      '#8B008B', '#9370DB', '#9932CC', '#BA55D3', '#DA70D6', // 紫色
      '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#8B4513', // 棕色
      '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FFCCCB'  // 粉色
    ],
    objects: [
      '#2F4F4F', '#696969', '#708090', '#778899', '#C0C0C0', // 金属色
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', // 木色
      '#4169E1', '#0000FF', '#1E90FF', '#00BFFF', '#87CEEB', // 科技蓝
      '#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', // 金色
      '#800080', '#9370DB', '#9932CC', '#BA55D3', '#DA70D6'  // 紫色
    ],
    emotions: [
      '#FFD700', '#FFFF00', '#F0E68C', '#DAA520', '#FFA500', // 快乐黄
      '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FFCCCB', // 快乐粉
      '#87CEEB', '#4169E1', '#6495ED', '#00BFFF', '#87CEFA', // 平静蓝
      '#FF4500', '#FF6347', '#DC143C', '#B22222', '#CD5C5C', // 激情红
      '#9370DB', '#9932CC', '#BA55D3', '#DA70D6', '#DDA0DD'  // 神秘紫
    ],
    nature: [
      '#228B22', '#32CD32', '#7CFC00', '#9ACD32', '#ADFF2F', // 植物绿
      '#87CEEB', '#4169E1', '#6495ED', '#00BFFF', '#87CEFA', // 天空蓝
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', // 土壤色
      '#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', // 阳光色
      '#2F4F4F', '#696969', '#708090', '#778899', '#A9A9A9'  // 岩石色
    ]
  };
  
  const usedColors = new Set<string>();
  
  return emojis.map((emoji, index) => {
    // 选择颜色池
    const pool = colorPools[(emoji.category as keyof typeof colorPools)] || colorPools.objects;
    
    // 基于emoji特征选择颜色
    let color = selectColorForEmoji(emoji, pool, index);
    
    // 避免重复，生成变化版本
    let attempts = 0;
    while (usedColors.has(color) && attempts < 20) {
      color = generateColorVariant(color, attempts + 1);
      attempts++;
    }
    
    usedColors.add(color);
    
    return {
      ...emoji,
      color
    };
  });
}

/**
 * 为特定emoji选择最适合的颜色
 */
function selectColorForEmoji(emoji: UnifiedEmojiItem, colorPool: string[], index: number): string {
  const text = `${emoji.name} ${emoji.keywords.join(' ')}`.toLowerCase();
  
  // 基于关键词的颜色偏好
  const colorHints = [];
  
  if (text.includes('红') || text.includes('苹果') || text.includes('草莓') || text.includes('番茄')) {
    colorHints.push('#FF0000', '#DC143C', '#B22222', '#CD5C5C', '#FF6347');
  }
  if (text.includes('绿') || text.includes('草') || text.includes('叶') || text.includes('树') || text.includes('青蛙')) {
    colorHints.push('#228B22', '#32CD32', '#7CFC00', '#9ACD32', '#2E8B57');
  }
  if (text.includes('蓝') || text.includes('天') || text.includes('海') || text.includes('水') || text.includes('鱼')) {
    colorHints.push('#4169E1', '#1E90FF', '#00BFFF', '#87CEEB', '#6495ED');
  }
  if (text.includes('黄') || text.includes('金') || text.includes('太阳') || text.includes('香蕉') || text.includes('柠檬')) {
    colorHints.push('#FFD700', '#FFFF00', '#F0E68C', '#DAA520', '#BDB76B');
  }
  if (text.includes('紫') || text.includes('葡萄') || text.includes('茄子')) {
    colorHints.push('#9370DB', '#9932CC', '#BA55D3', '#DA70D6', '#DDA0DD');
  }
  if (text.includes('粉') || text.includes('花') || text.includes('樱') || text.includes('桃')) {
    colorHints.push('#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FFCCCB');
  }
  if (text.includes('棕') || text.includes('木') || text.includes('土') || text.includes('熊') || text.includes('咖啡')) {
    colorHints.push('#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887');
  }
  if (text.includes('橙') || text.includes('橙子') || text.includes('胡萝卜') || text.includes('南瓜')) {
    colorHints.push('#FF8C00', '#FFA500', '#FF7F50', '#FF6347', '#FF4500');
  }
  
  // 选择颜色源
  const candidates = colorHints.length > 0 ? colorHints : colorPool;
  
  // 基于emoji和索引生成确定性的选择
  let hash = index * 31;
  for (let i = 0; i < emoji.emoji.length; i++) {
    hash = hash * 31 + emoji.emoji.charCodeAt(i);
  }
  for (let i = 0; i < emoji.name.length; i++) {
    hash = hash * 31 + emoji.name.charCodeAt(i);
  }
  
  const colorIndex = Math.abs(hash) % candidates.length;
  return candidates[colorIndex];
}

/**
 * 生成颜色变化版本
 */
function generateColorVariant(baseColor: string, seed: number): string {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // 使用种子产生确定性的变化
  const rnd = (seed * 9301 + 49297) % 233280;
  const factor = (rnd / 233280.0) * 0.3 + 0.85; // 0.85 到 1.15 的变化
  
  const newR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const newG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const newB = Math.max(0, Math.min(255, Math.round(b * factor)));
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`.toUpperCase();
}

// 移除自动执行避免TDZ错误 - 改为手动调用
// 如需使用请手动调用 forceUpdateEmojiColors() 函数
