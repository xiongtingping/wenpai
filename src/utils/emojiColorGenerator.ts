/**
 * Emoji颜色多样化生成器
 * 解决emoji颜色重复问题，为每个emoji生成独特且合适的颜色
 */

// 扩展的颜色调色板 - 按类别和特征分组
const COLOR_PALETTES = {
  // 动物相关颜色
  animals: {
    mammals: [
      '#FF8C00', '#CD853F', '#D2691E', '#A0522D', '#8B4513', // 棕色系列
      '#DEB887', '#F4A460', '#DAA520', '#B8860B', '#CD853F', // 米色/金色系列
      '#696969', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC', // 灰色系列
      '#FFF8DC', '#FFFACD', '#FFEFD5', '#FFE4B5', '#F5DEB3'  // 奶油色系列
    ],
    birds: [
      '#87CEEB', '#4169E1', '#1E90FF', '#00BFFF', '#87CEFA', // 蓝色系列
      '#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FF6347', // 金橙色系列
      '#32CD32', '#228B22', '#008000', '#006400', '#2E8B57', // 绿色系列
      '#DC143C', '#B22222', '#CD5C5C', '#F08080', '#FA8072'  // 红色系列
    ],
    aquatic: [
      '#4682B4', '#5F9EA0', '#48D1CC', '#00CED1', '#20B2AA', // 海洋蓝绿
      '#7FFFD4', '#AFEEEE', '#E0FFFF', '#F0F8FF', '#B0E0E6', // 浅海色
      '#2F4F4F', '#708090', '#778899', '#B0C4DE', '#D6EAF8'  // 深海色
    ],
    insects: [
      '#9ACD32', '#7CFC00', '#32CD32', '#00FF7F', '#00FA9A', // 绿色系列
      '#FFD700', '#FFFF00', '#F0E68C', '#BDB76B', '#DAA520', // 黄色系列
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', // 棕色系列
      '#FF1493', '#FF69B4', '#FFB6C1', '#FFC0CB', '#FFCCCB'  // 粉红色系列
    ]
  },

  // 食物相关颜色
  food: {
    fruits: [
      '#FF6347', '#FF4500', '#FF0000', '#DC143C', '#B22222', // 红色水果
      '#FFA500', '#FF8C00', '#FFD700', '#F0E68C', '#FFFF00', // 橙黄色水果
      '#32CD32', '#00FF00', '#7CFC00', '#9ACD32', '#ADFF2F', // 绿色水果
      '#8B008B', '#9370DB', '#9932CC', '#BA55D3', '#DA70D6'  // 紫色水果
    ],
    vegetables: [
      '#228B22', '#32CD32', '#00FF00', '#7CFC00', '#9ACD32', // 绿色蔬菜
      '#FF6347', '#FF4500', '#FF8C00', '#FFA500', '#FFD700', // 橙红色蔬菜
      '#8B008B', '#9370DB', '#9932CC', '#6A5ACD', '#7B68EE', // 紫色蔬菜
      '#FFFF00', '#F0E68C', '#DAA520', '#B8860B', '#CD853F'  // 黄色蔬菜
    ],
    desserts: [
      '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#8B4513', // 巧克力色
      '#FFB6C1', '#FFC0CB', '#FFCCCB', '#FFE4E1', '#FFF0F5', // 粉色系列
      '#F5F5DC', '#FDF5E6', '#FAF0E6', '#FFEFD5', '#FFE4B5', // 奶油色
      '#7FFFD4', '#AFEEEE', '#E0FFFF', '#F0FFFF', '#AZURE'   // 冰淇淋色
    ]
  },

  // 物品相关颜色
  objects: {
    tech: [
      '#2F4F4F', '#696969', '#708090', '#778899', '#C0C0C0', // 金属色
      '#000000', '#191970', '#000080', '#4169E1', '#0000FF', // 深色科技
      '#00FF00', '#00FF7F', '#00FA9A', '#7FFFD4', '#40E0D0'  // 科技绿
    ],
    home: [
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', // 木色
      '#F5F5DC', '#FDF5E6', '#FAF0E6', '#FFEFD5', '#FFE4B5', // 温暖色
      '#4682B4', '#5F9EA0', '#B0C4DE', '#B0E0E6', '#E6F3FF'  // 清爽色
    ]
  },

  // 情感相关颜色
  emotions: {
    happy: [
      '#FFD700', '#FFFF00', '#F0E68C', '#DAA520', '#FFA500', // 快乐黄
      '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', '#FFCCCB', // 快乐粉
      '#00FF7F', '#7CFC00', '#32CD32', '#00FA9A', '#98FB98'  // 快乐绿
    ],
    calm: [
      '#87CEEB', '#4169E1', '#6495ED', '#00BFFF', '#87CEFA', // 平静蓝
      '#98FB98', '#90EE90', '#8FBC8F', '#20B2AA', '#48D1CC', // 平静绿
      '#DDA0DD', '#D8BFD8', '#E6E6FA', '#F0E68C', '#F5DEB3'  // 平静紫/米
    ],
    energetic: [
      '#FF4500', '#FF6347', '#FF0000', '#DC143C', '#B22222', // 能量红
      '#FFA500', '#FF8C00', '#FFD700', '#F0E68C', '#FFFF00', // 能量橙黄
      '#9370DB', '#8B008B', '#9932CC', '#BA55D3', '#DA70D6'  // 能量紫
    ]
  },

  // 自然相关颜色
  nature: {
    plants: [
      '#228B22', '#32CD32', '#00FF00', '#7CFC00', '#9ACD32', // 植物绿
      '#ADFF2F', '#98FB98', '#90EE90', '#8FBC8F', '#9ACD32', // 嫩绿色
      '#006400', '#008000', '#2E8B57', '#3CB371', '#20B2AA'  // 深绿色
    ],
    sky: [
      '#87CEEB', '#4169E1', '#6495ED', '#00BFFF', '#87CEFA', // 天空蓝
      '#B0C4DE', '#B0E0E6', '#ADD8E6', '#E0F6FF', '#F0F8FF', // 浅蓝色
      '#191970', '#000080', '#00008B', '#0000CD', '#4169E1'  // 深蓝色
    ],
    earth: [
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887', // 土壤色
      '#F4A460', '#DAA520', '#B8860B', '#CD853F', '#D2B48C', // 沙土色
      '#2F4F4F', '#696969', '#708090', '#778899', '#A9A9A9'  // 岩石色
    ]
  }
};

// 生成渐变色和变化色的工具函数
class ColorGenerator {
  private usedColors: Set<string> = new Set();
  private categoryColorMap: Map<string, string[]> = new Map();

  constructor() {
    this.initializeCategoryMaps();
  }

  private initializeCategoryMaps(): void {
    // 为每个主要类别创建颜色映射
    this.categoryColorMap.set('animals', this.flattenPalette(COLOR_PALETTES.animals));
    this.categoryColorMap.set('food', this.flattenPalette(COLOR_PALETTES.food));
    this.categoryColorMap.set('objects', this.flattenPalette(COLOR_PALETTES.objects));
    this.categoryColorMap.set('emotions', this.flattenPalette(COLOR_PALETTES.emotions));
    this.categoryColorMap.set('nature', this.flattenPalette(COLOR_PALETTES.nature));
  }

  private flattenPalette(palette: Record<string, string[]>): string[] {
    return Object.values(palette).flat();
  }

  /**
   * 为emoji生成颜色，基于其特征智能选择
   */
  generateColorForEmoji(emoji: string, name: string, category: string, keywords: string[]): string {
    // 基于emoji内容的智能颜色匹配
    const colorHints = this.extractColorHints(emoji, name, keywords);
    
    // 获取该类别的颜色组
    const categoryColors = this.categoryColorMap.get(category) || [];
    
    // 基于颜色提示选择最适合的颜色
    let selectedColor = this.selectBestColor(colorHints, categoryColors, emoji);
    
    // 如果选中的颜色已使用过，生成变化色
    if (this.usedColors.has(selectedColor)) {
      selectedColor = this.generateVariantColor(selectedColor);
    }
    
    this.usedColors.add(selectedColor);
    return selectedColor;
  }

  /**
   * 从emoji、名称和关键词中提取颜色线索
   */
  private extractColorHints(emoji: string, name: string, keywords: string[]): string[] {
    const hints: string[] = [];
    const text = `${name} ${keywords.join(' ')}`.toLowerCase();

    // 颜色关键词映射
    const colorKeywords = {
      red: ['红', '红色', '苹果', '草莓', '番茄', '辣椒', '心', '爱'],
      green: ['绿', '绿色', '叶子', '草', '树', '森林', '青蛙', '西瓜', '黄瓜'],
      blue: ['蓝', '蓝色', '天空', '海', '水', '鱼', '鸟'],
      yellow: ['黄', '黄色', '太阳', '香蕉', '柠檬', '玉米', '小鸡'],
      purple: ['紫', '紫色', '葡萄', '茄子', '薰衣草'],
      orange: ['橙', '橙色', '橙子', '胡萝卜', '南瓜', '狐狸', '老虎'],
      pink: ['粉', '粉色', '粉红', '花', '樱花', '猪'],
      brown: ['棕', '棕色', '咖啡', '巧克力', '木', '土', '熊', '狗'],
      black: ['黑', '黑色', '夜', '煤', '蝙蝠'],
      white: ['白', '白色', '雪', '云', '牛奶', '兔子'],
      gray: ['灰', '灰色', '银', '石头', '鼠', '大象']
    };

    // 检查文本中的颜色关键词
    for (const [color, keywords] of Object.entries(colorKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        hints.push(color);
      }
    }

    // 基于emoji Unicode分析
    const emojiCode = emoji.codePointAt(0);
    if (emojiCode) {
      hints.push(...this.getColorFromEmojiCode(emojiCode));
    }

    return hints;
  }

  /**
   * 基于emoji Unicode码获取颜色提示
   */
  private getColorFromEmojiCode(code: number): string[] {
    // 基于Unicode范围的颜色提示
    if (code >= 0x1F400 && code <= 0x1F43F) return ['brown', 'gray']; // 动物
    if (code >= 0x1F340 && code <= 0x1F37F) return ['green', 'red', 'yellow']; // 植物和食物
    if (code >= 0x1F300 && code <= 0x1F33F) return ['blue', 'green', 'yellow']; // 天气和自然
    if (code >= 0x1F600 && code <= 0x1F64F) return ['yellow', 'orange']; // 表情
    
    return [];
  }

  /**
   * 从候选颜色中选择最适合的颜色
   */
  private selectBestColor(hints: string[], categoryColors: string[], emoji: string): string {
    if (hints.length === 0) {
      // 没有颜色提示时，基于emoji的hash选择
      return this.selectColorByHash(emoji, categoryColors);
    }

    // 有颜色提示时，在对应的颜色范围内选择
    const hintBasedColors = this.getColorsForHints(hints);
    const availableColors = hintBasedColors.filter(color => categoryColors.includes(color));
    
    if (availableColors.length > 0) {
      return this.selectColorByHash(emoji, availableColors);
    }

    // 回退到类别颜色
    return this.selectColorByHash(emoji, categoryColors);
  }

  /**
   * 根据颜色提示获取具体的颜色值
   */
  private getColorsForHints(hints: string[]): string[] {
    const hintColors: string[] = [];
    
    const hintColorMap: Record<string, string[]> = {
      red: ['#FF0000', '#DC143C', '#B22222', '#CD5C5C', '#F08080'],
      green: ['#008000', '#228B22', '#32CD32', '#7CFC00', '#9ACD32'],
      blue: ['#0000FF', '#4169E1', '#1E90FF', '#00BFFF', '#87CEEB'],
      yellow: ['#FFFF00', '#FFD700', '#F0E68C', '#DAA520', '#BDB76B'],
      purple: ['#800080', '#9370DB', '#9932CC', '#BA55D3', '#DA70D6'],
      orange: ['#FFA500', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500'],
      pink: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493', '#FFCCCB'],
      brown: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887'],
      black: ['#000000', '#2F4F4F', '#696969', '#708090', '#778899'],
      white: ['#FFFFFF', '#F5F5F5', '#DCDCDC', '#D3D3D3', '#C0C0C0'],
      gray: ['#808080', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC']
    };

    for (const hint of hints) {
      if (hintColorMap[hint]) {
        hintColors.push(...hintColorMap[hint]);
      }
    }

    return hintColors;
  }

  /**
   * 基于字符串hash选择颜色
   */
  private selectColorByHash(text: string, colors: string[]): string {
    if (colors.length === 0) {
      return '#808080'; // 默认灰色
    }

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转为32位整数
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  /**
   * 生成颜色的变化版本
   */
  private generateVariantColor(baseColor: string): string {
    // 将十六进制颜色转换为RGB
    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return baseColor;

    // 生成变化：轻微调整RGB值
    const variance = 15; // 颜色变化范围
    const newR = Math.max(0, Math.min(255, rgb.r + (Math.random() - 0.5) * variance * 2));
    const newG = Math.max(0, Math.min(255, rgb.g + (Math.random() - 0.5) * variance * 2));
    const newB = Math.max(0, Math.min(255, rgb.b + (Math.random() - 0.5) * variance * 2));

    return this.rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB));
  }

  private hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * 重置使用的颜色记录
   */
  resetUsedColors(): void {
    this.usedColors.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): {totalUsedColors: number, uniqueColors: number} {
    return {
      totalUsedColors: this.usedColors.size,
      uniqueColors: this.usedColors.size
    };
  }
}

// 创建全局颜色生成器实例
export const emojiColorGenerator = new ColorGenerator();

/**
 * 为emoji生成多样化的颜色
 */
export function generateEmojiColor(emoji: string, name: string, category: string, keywords: string[]): string {
  return emojiColorGenerator.generateColorForEmoji(emoji, name, category, keywords);
}

/**
 * 重置颜色生成器
 */
export function resetEmojiColorGenerator(): void {
  emojiColorGenerator.resetUsedColors();
}

/**
 * 获取颜色生成统计
 */
export function getColorGeneratorStats() {
  return emojiColorGenerator.getStats();
}

/**
 * 批量为emoji列表生成颜色
 */
export function generateColorsForEmojiList(emojis: Array<{
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}>): Array<{emoji: string; name: string; category: string; keywords: string[]; color: string}> {
  
  // 重置颜色生成器确保新的批次
  resetEmojiColorGenerator();
  
  return emojis.map(item => ({
    ...item,
    color: generateEmojiColor(item.emoji, item.name, item.category, item.keywords)
  }));
}