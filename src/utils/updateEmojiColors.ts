/**
 * Emoji颜色更新工具
 * 用于批量更新所有emoji的颜色，解决颜色重复问题
 */

import { generateColorsForEmojiList, getColorGeneratorStats } from './emojiColorGenerator';
import type { UnifiedEmojiItem } from '@/types/emoji';

/**
 * 更新emoji数据的颜色
 */
export function updateEmojiColorsInData(emojis: UnifiedEmojiItem[]): UnifiedEmojiItem[] {
  console.log('🎨 开始更新emoji颜色系统...');
  console.log(`📊 原始数据：${emojis.length} 个emoji`);
  
  // 统计原始颜色使用情况
  const originalColors = new Map<string, number>();
  emojis.forEach(emoji => {
    const count = originalColors.get(emoji.color) || 0;
    originalColors.set(emoji.color, count + 1);
  });
  
  console.log('📈 原始颜色分布：');
  const sortedOriginalColors = Array.from(originalColors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedOriginalColors.forEach(([color, count]) => {
    console.log(`  ${color}: ${count} 个emoji`);
  });
  
  // 生成新的颜色
  const emojiInputs = emojis.map(emoji => ({
    emoji: emoji.emoji,
    name: emoji.name,
    category: emoji.category,
    keywords: emoji.keywords
  }));
  
  const updatedEmojiData = generateColorsForEmojiList(emojiInputs);
  
  // 更新原始数据中的颜色
  const result = emojis.map((originalEmoji) => {
    const updatedData = updatedEmojiData.find(updated => 
      updated.emoji === originalEmoji.emoji && updated.name === originalEmoji.name
    );
    
    if (updatedData) {
      return {
        ...originalEmoji,
        color: updatedData.color
      };
    }
    
    return originalEmoji;
  });
  
  // 统计新颜色使用情况
  const newColors = new Map<string, number>();
  result.forEach(emoji => {
    const count = newColors.get(emoji.color) || 0;
    newColors.set(emoji.color, count + 1);
  });
  
  console.log('🎨 新颜色分布（前10）：');
  const sortedNewColors = Array.from(newColors.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedNewColors.forEach(([color, count]) => {
    console.log(`  ${color}: ${count} 个emoji`);
  });
  
  // 统计改进效果
  const stats = getColorGeneratorStats();
  const originalUniqueColors = originalColors.size;
  const newUniqueColors = newColors.size;
  const improvement = ((newUniqueColors - originalUniqueColors) / originalUniqueColors * 100).toFixed(1);
  
  console.log('📊 颜色多样性改进统计：');
  console.log(`  原始唯一颜色数：${originalUniqueColors}`);
  console.log(`  新唯一颜色数：${newUniqueColors}`);
  console.log(`  颜色多样性提升：${improvement}%`);
  console.log(`  处理emoji总数：${stats.totalUsedColors}`);
  
  // 查找仍然重复的颜色
  const duplicateColors = Array.from(newColors.entries())
    .filter(([color, count]) => count > 3)
    .sort((a, b) => b[1] - a[1]);
  
  if (duplicateColors.length > 0) {
    console.log('⚠️  仍有重复的颜色（使用超过3次）：');
    duplicateColors.slice(0, 5).forEach(([color, count]) => {
      console.log(`  ${color}: ${count} 个emoji`);
    });
  } else {
    console.log('✅ 没有发现明显的颜色重复！');
  }
  
  console.log('🎉 Emoji颜色更新完成！');
  return result;
}

/**
 * 分析颜色分布
 */
export function analyzeColorDistribution(emojis: UnifiedEmojiItem[]): {
  totalEmojis: number;
  uniqueColors: number;
  colorDistribution: Array<{color: string; count: number; percentage: string}>;
  duplicates: Array<{color: string; count: number}>;
  diversity: number;
} {
  const colorCounts = new Map<string, number>();
  
  emojis.forEach(emoji => {
    const count = colorCounts.get(emoji.color) || 0;
    colorCounts.set(emoji.color, count + 1);
  });
  
  const colorDistribution = Array.from(colorCounts.entries())
    .map(([color, count]) => ({
      color,
      count,
      percentage: ((count / emojis.length) * 100).toFixed(1) + '%'
    }))
    .sort((a, b) => b.count - a.count);
    
  const duplicates = colorDistribution.filter(item => item.count > 1);
  const diversity = colorCounts.size / emojis.length;
  
  return {
    totalEmojis: emojis.length,
    uniqueColors: colorCounts.size,
    colorDistribution,
    duplicates,
    diversity
  };
}

/**
 * 验证颜色格式是否正确
 */
export function validateEmojiColors(emojis: UnifiedEmojiItem[]): {
  valid: UnifiedEmojiItem[];
  invalid: Array<{emoji: UnifiedEmojiItem; reason: string}>;
} {
  const valid: UnifiedEmojiItem[] = [];
  const invalid: Array<{emoji: UnifiedEmojiItem; reason: string}> = [];
  
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  emojis.forEach(emoji => {
    if (!emoji.color) {
      invalid.push({emoji, reason: '缺少颜色值'});
    } else if (!hexColorRegex.test(emoji.color)) {
      invalid.push({emoji, reason: '颜色格式不正确（应为#RRGGBB）'});
    } else {
      valid.push(emoji);
    }
  });
  
  return { valid, invalid };
}

/**
 * 生成颜色报告
 */
export function generateColorReport(emojis: UnifiedEmojiItem[]): string {
  const analysis = analyzeColorDistribution(emojis);
  const validation = validateEmojiColors(emojis);
  
  let report = `# Emoji颜色分析报告\n\n`;
  report += `## 📊 总体统计\n`;
  report += `- **Emoji总数**: ${analysis.totalEmojis}\n`;
  report += `- **唯一颜色数**: ${analysis.uniqueColors}\n`;
  report += `- **颜色多样性**: ${(analysis.diversity * 100).toFixed(1)}%\n`;
  report += `- **有效颜色**: ${validation.valid.length}\n`;
  report += `- **无效颜色**: ${validation.invalid.length}\n\n`;
  
  if (validation.invalid.length > 0) {
    report += `## ❌ 无效颜色\n`;
    validation.invalid.forEach(({emoji, reason}) => {
      report += `- ${emoji.emoji} ${emoji.name}: ${reason} (${emoji.color})\n`;
    });
    report += `\n`;
  }
  
  report += `## 🎨 颜色分布（前20）\n`;
  analysis.colorDistribution.slice(0, 20).forEach(({color, count, percentage}) => {
    report += `- **${color}**: ${count} 个emoji (${percentage})\n`;
  });
  report += `\n`;
  
  if (analysis.duplicates.length > 0) {
    report += `## 🔍 重复颜色分析\n`;
    const significantDuplicates = analysis.duplicates.filter(item => item.count > 2);
    if (significantDuplicates.length > 0) {
      report += `### 明显重复（超过2次使用）\n`;
      significantDuplicates.forEach(({color, count}) => {
        report += `- **${color}**: ${count} 次\n`;
      });
    } else {
      report += `✅ 没有发现明显的颜色重复！\n`;
    }
    report += `\n`;
  }
  
  report += `## 📈 分类颜色分布\n`;
  const categoryColors = new Map<string, Set<string>>();
  emojis.forEach(emoji => {
    if (!categoryColors.has(emoji.category)) {
      categoryColors.set(emoji.category, new Set());
    }
    categoryColors.get(emoji.category)!.add(emoji.color);
  });
  
  Array.from(categoryColors.entries()).forEach(([category, colors]) => {
    report += `- **${category}**: ${colors.size} 种颜色\n`;
  });
  
  return report;
}