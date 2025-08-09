/**
 * Emoji服务适配器
 * 提供与旧版emojiService兼容的API，内部使用统一emoji系统
 */

import { 
  UnifiedEmojiItem, 
  getAllEmojis as getUnifiedEmojis,
  getEmojisByCategory as getUnifiedEmojisByCategory,
  searchEmojis as searchUnifiedEmojis,
  getRandomEmojis as getUnifiedRandomEmojis
} from '@/services/unifiedEmojiSystem';

// 兼容旧版EmojiItem接口
export interface EmojiItem {
  unified: string;
  short_name: string;
  short_names: string[];
  keywords: string[];
  category: string;
  name?: string;
  emoji?: string;
}

// 兼容旧版显示模式
export type EmojiDisplayMode = 'unicode' | 'image' | 'cdn';

/**
 * 将统一emoji转换为旧版格式
 */
function convertToLegacyFormat(unifiedEmoji: UnifiedEmojiItem): EmojiItem {
  return {
    unified: unifiedEmoji.id.replace(/[^0-9a-f]/gi, ''),
    short_name: unifiedEmoji.name.toLowerCase().replace(/\s+/g, '_'),
    short_names: [unifiedEmoji.name.toLowerCase().replace(/\s+/g, '_')],
    keywords: unifiedEmoji.keywords,
    category: unifiedEmoji.category,
    name: unifiedEmoji.name,
    emoji: unifiedEmoji.emoji
  };
}

/**
 * 获取所有emoji（兼容旧版API）
 */
export function getAllEmojis(): EmojiItem[] {
  return getUnifiedEmojis().map(convertToLegacyFormat);
}

/**
 * 按分类获取emoji（兼容旧版API）
 */
export function getEmojisByCategory(category: string): EmojiItem[] {
  // 映射旧版分类名到新版
  const categoryMap: Record<string, string> = {
    'smileys': 'emotions',
    'people': 'emotions',
    'animals': 'animals',
    'food': 'food',
    'travel': 'objects',
    'activities': 'objects',
    'objects': 'objects',
    'symbols': 'nature',
    'flags': 'objects'
  };
  
  const mappedCategory = categoryMap[category] || category;
  return getUnifiedEmojisByCategory(mappedCategory).map(convertToLegacyFormat);
}

/**
 * 搜索emoji（兼容旧版API）
 */
export function searchEmojis(keyword: string): EmojiItem[] {
  return searchUnifiedEmojis(keyword).map(convertToLegacyFormat);
}

/**
 * 获取热门emoji
 */
export function getPopularEmojis(): EmojiItem[] {
  // 返回一些热门emoji
  const popularKeywords = ['开心', '爱心', '笑', '哭', '生气', '惊讶', '可爱', '酷'];
  const popularEmojis: EmojiItem[] = [];
  
  popularKeywords.forEach(keyword => {
    const results = searchEmojis(keyword);
    if (results.length > 0) {
      popularEmojis.push(results[0]);
    }
  });
  
  return popularEmojis.slice(0, 20);
}

/**
 * 获取表情类emoji
 */
export function getSmileysEmojis(): EmojiItem[] {
  return getEmojisByCategory('emotions');
}

/**
 * 获取动物类emoji
 */
export function getAnimalsEmojis(): EmojiItem[] {
  return getEmojisByCategory('animals');
}

/**
 * 获取食物类emoji
 */
export function getFoodEmojis(): EmojiItem[] {
  return getEmojisByCategory('food');
}

/**
 * 获取活动类emoji
 */
export function getActivityEmojis(): EmojiItem[] {
  return getEmojisByCategory('objects').filter(emoji => 
    emoji.keywords.some(keyword => 
      ['运动', '游戏', '娱乐', '活动'].includes(keyword)
    )
  );
}

/**
 * 获取旅行类emoji
 */
export function getTravelEmojis(): EmojiItem[] {
  return getEmojisByCategory('objects').filter(emoji => 
    emoji.keywords.some(keyword => 
      ['旅行', '交通', '出行', '航海'].includes(keyword)
    )
  );
}

/**
 * 获取物品类emoji
 */
export function getObjectsEmojis(): EmojiItem[] {
  return getEmojisByCategory('objects');
}

/**
 * 获取符号类emoji
 */
export function getSymbolsEmojis(): EmojiItem[] {
  return getEmojisByCategory('nature').filter(emoji => 
    emoji.keywords.some(keyword => 
      ['符号', '标志', '图标'].includes(keyword)
    )
  );
}

/**
 * 获取旗帜类emoji
 */
export function getFlagsEmojis(): EmojiItem[] {
  // 返回一些旗帜相关的emoji
  return getEmojisByCategory('objects').filter(emoji => 
    emoji.keywords.some(keyword => 
      ['旗帜', '国家', '地区'].includes(keyword)
    )
  );
}

/**
 * 获取随机emoji
 */
export function getRandomEmojis(count: number = 5): EmojiItem[] {
  return getUnifiedRandomEmojis(count).map(convertToLegacyFormat);
}

/**
 * 根据心情获取emoji
 */
export function getEmojisByMood(mood: string): EmojiItem[] {
  const moodKeywords: Record<string, string[]> = {
    'happy': ['开心', '快乐', '笑', '高兴'],
    'sad': ['伤心', '难过', '哭', '悲伤'],
    'angry': ['生气', '愤怒', '火', '怒'],
    'love': ['爱', '心', '喜欢', '爱情'],
    'surprise': ['惊讶', '震惊', '意外', '吃惊'],
    'fear': ['害怕', '恐惧', '紧张', '担心']
  };
  
  const keywords = moodKeywords[mood.toLowerCase()] || [mood];
  const results: EmojiItem[] = [];
  
  keywords.forEach(keyword => {
    const searchResults = searchEmojis(keyword);
    results.push(...searchResults);
  });
  
  // 去重并返回前10个
  const uniqueResults = results.filter((emoji, index, self) => 
    index === self.findIndex(e => e.unified === emoji.unified)
  );
  
  return uniqueResults.slice(0, 10);
}

/**
 * 获取emoji的Unicode字符
 */
export function getEmojiUnicode(unified: string): string {
  const allEmojis = getAllEmojis();
  const emoji = allEmojis.find(e => e.unified === unified);
  return emoji?.emoji || '';
}

/**
 * 获取emoji图片路径
 */
export function getEmojiImage(unified: string): string {
  // 返回一个占位符图片路径
  return `/assets/emoji/${unified}.png`;
}

/**
 * 获取emoji CDN URL
 */
export function getEmojiCDNUrl(unified: string, cdnType: string = 'noto-color'): string {
  // 返回Google Noto Emoji CDN URL
  return `https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u${unified}.png`;
}

/**
 * 获取emoji显示内容
 */
export function getEmojiDisplay(
  unified: string,
  mode: EmojiDisplayMode = 'unicode',
  cdnType: string = 'noto-color'
): string {
  switch (mode) {
    case 'unicode':
      return getEmojiUnicode(unified);
    case 'image':
      return getEmojiImage(unified);
    case 'cdn':
      return getEmojiCDNUrl(unified, cdnType);
    default:
      return getEmojiUnicode(unified);
  }
}

/**
 * 获取emoji分类
 */
export function getEmojiCategories(): string[] {
  return ['smileys', 'people', 'animals', 'food', 'travel', 'activities', 'objects', 'symbols', 'flags'];
}

/**
 * 获取CDN配置
 */
export function getCDNConfigs() {
  return {
    'noto-color': {
      name: 'Google Noto Color',
      baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128'
    },
    'twemoji': {
      name: 'Twitter Emoji',
      baseUrl: 'https://twemoji.maxcdn.com/v/latest/72x72'
    }
  };
}

/**
 * 获取平台图标
 */
export function getPlatformIcons(): any[] {
  return [];
}

/**
 * 获取平台图标
 */
export function getPlatformIcon(platform: string): any {
  return null;
}

/**
 * 生成平台图标SVG
 */
export function generatePlatformIconSVG(platform: string): string {
  return '';
}

/**
 * 批量获取emoji CDN URLs
 */
export function getEmojiCDNUrls(unifiedCodes: string[], cdnType: string = 'noto-color'): string[] {
  return unifiedCodes.map(code => getEmojiCDNUrl(code, cdnType));
}

// 默认导出兼容旧版API
export default {
  getAllEmojis,
  getEmojisByCategory,
  searchEmojis,
  getEmojiImage,
  getEmojiUnicode,
  getEmojiCDNUrl,
  getEmojiDisplay,
  getEmojiCDNUrls,
  getCDNConfigs,
  getEmojiCategories,
  getPlatformIcons,
  getPlatformIcon,
  generatePlatformIconSVG,
  getPopularEmojis,
  getSmileysEmojis,
  getAnimalsEmojis,
  getFoodEmojis,
  getActivityEmojis,
  getTravelEmojis,
  getObjectsEmojis,
  getSymbolsEmojis,
  getFlagsEmojis,
  getRandomEmojis,
  getEmojisByMood
};
