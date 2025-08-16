/**
 * 颜色令牌映射工具
 * 将硬编码的十六进制颜色映射到设计令牌
 */

// 设计令牌颜色映射
export const COLOR_TOKEN_MAP: Record<string, string> = {
  // 红色系
  '#FF6B6B': 'hsl(var(--destructive))',
  '#E84393': 'hsl(var(--destructive))',
  '#FD79A8': 'hsl(var(--destructive))',
  '#E17055': 'hsl(var(--destructive))',
  '#FF4500': 'hsl(var(--destructive))',
  '#DC143C': 'hsl(var(--destructive))',
  '#8B0000': 'hsl(var(--destructive))',
  '#FF6347': 'hsl(var(--destructive))',
  
  // 蓝色系
  '#74B9FF': 'hsl(var(--primary))',
  '#0984E3': 'hsl(var(--primary))',
  '#4ECDC4': 'hsl(var(--primary))',
  '#45B7D1': 'hsl(var(--primary))',
  '#00CEC9': 'hsl(var(--primary))',
  '#4682B4': 'hsl(var(--primary))',
  '#20B2AA': 'hsl(var(--primary))',
  '#4169E1': 'hsl(var(--primary))',
  '#87CEEB': 'hsl(var(--primary))',
  '#B0E0E6': 'hsl(var(--primary))',
  '#E0F6FF': 'hsl(var(--primary))',
  
  // 绿色系
  '#00B894': 'hsl(var(--success))',
  '#96CEB4': 'hsl(var(--success))',
  '#32CD32': 'hsl(var(--success))',
  '#228B22': 'hsl(var(--success))',
  '#90EE90': 'hsl(var(--success))',
  
  // 黄色系
  '#FDCB6E': 'hsl(var(--warning))',
  '#FFEAA7': 'hsl(var(--warning))',
  '#DAA520': 'hsl(var(--warning))',
  '#FFFF00': 'hsl(var(--warning))',
  '#FFD700': 'hsl(var(--warning))',
  '#FFA500': 'hsl(var(--warning))',
  '#FF8C00': 'hsl(var(--warning))',
  
  // 紫色系
  '#6C5CE7': 'hsl(var(--accent))',
  '#A29BFE': 'hsl(var(--accent))',
  '#DDA0DD': 'hsl(var(--accent))',
  '#8B008B': 'hsl(var(--accent))',
  '#E6E6FA': 'hsl(var(--accent))',
  
  // 灰色系
  '#636E72': 'hsl(var(--muted-foreground))',
  '#2F4F4F': 'hsl(var(--muted-foreground))',
  '#708090': 'hsl(var(--muted-foreground))',
  '#696969': 'hsl(var(--muted-foreground))',
  '#2F2F2F': 'hsl(var(--muted-foreground))',
  '#C0C0C0': 'hsl(var(--muted))',
  '#D3D3D3': 'hsl(var(--muted))',
  
  // 白色系
  '#F8F9FA': 'hsl(var(--background))',
  '#F5F5DC': 'hsl(var(--background))',
  '#F5F5F5': 'hsl(var(--background))',
  '#F0F8FF': 'hsl(var(--background))',
  '#FFFFFF': 'hsl(var(--background))',
  
  // 棕色系
  '#8B4513': 'hsl(var(--muted-foreground))',
  '#D2B48C': 'hsl(var(--muted))',
  '#DEB887': 'hsl(var(--muted))',
  '#F4A460': 'hsl(var(--muted))',
  '#D2691E': 'hsl(var(--muted))',
  '#CD853F': 'hsl(var(--muted))',
  '#8B7355': 'hsl(var(--muted-foreground))',
  '#8B7D6B': 'hsl(var(--muted-foreground))',
  '#BC8F8F': 'hsl(var(--muted))',
  
  // 粉色系
  '#FFB6C1': 'hsl(var(--accent))',
  '#FF69B4': 'hsl(var(--accent))',
};

// 分类颜色映射
export const CATEGORY_COLOR_TOKENS: Record<string, string> = {
  animals: 'hsl(var(--destructive))',
  food: 'hsl(var(--primary))',
  objects: 'hsl(var(--accent))',
  emotions: 'hsl(var(--success))',
  nature: 'hsl(var(--warning))',
};

/**
 * 将十六进制颜色转换为设计令牌
 */
export function mapColorToToken(hexColor: string): string {
  return COLOR_TOKEN_MAP[hexColor] || hexColor;
}

/**
 * 将分类映射到颜色令牌
 */
export function mapCategoryToColorToken(category: string): string {
  return CATEGORY_COLOR_TOKENS[category] || 'hsl(var(--foreground))';
}

/**
 * 批量替换对象中的颜色值
 */
export function replaceColorsInObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string' && result[key].startsWith('#')) {
      result[key] = mapColorToToken(result[key] as string) as any;
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = replaceColorsInObject(result[key]);
    }
  }
  
  return result;
}

/**
 * 获取所有支持的颜色令牌
 */
export function getSupportedColorTokens(): string[] {
  return Object.values(COLOR_TOKEN_MAP);
}

/**
 * 检查颜色是否为硬编码值
 */
export function isHardcodedColor(color: string): boolean {
  return color.startsWith('#') || color.startsWith('rgb') || color.startsWith('rgba');
}

/**
 * 获取颜色的设计令牌建议
 */
export function getColorTokenSuggestion(color: string): string {
  if (COLOR_TOKEN_MAP[color]) {
    return COLOR_TOKEN_MAP[color];
  }
  
  // 基于颜色值提供智能建议
  const colorLower = color.toLowerCase();
  
  if (colorLower.includes('red') || colorLower.includes('ff')) {
    return 'hsl(var(--destructive))';
  }
  if (colorLower.includes('blue') || colorLower.includes('0000ff')) {
    return 'hsl(var(--primary))';
  }
  if (colorLower.includes('green') || colorLower.includes('00ff00')) {
    return 'hsl(var(--success))';
  }
  if (colorLower.includes('yellow') || colorLower.includes('ffff00')) {
    return 'hsl(var(--warning))';
  }
  if (colorLower.includes('purple') || colorLower.includes('violet')) {
    return 'hsl(var(--accent))';
  }
  if (colorLower.includes('gray') || colorLower.includes('grey')) {
    return 'hsl(var(--muted-foreground))';
  }
  if (colorLower.includes('white') || colorLower.includes('ffffff')) {
    return 'hsl(var(--background))';
  }
  if (colorLower.includes('black') || colorLower.includes('000000')) {
    return 'hsl(var(--foreground))';
  }
  
  return 'hsl(var(--foreground))';
}
