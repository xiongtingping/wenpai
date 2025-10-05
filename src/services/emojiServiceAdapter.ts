// @ts-nocheck
/**
 * Emoji服务适配器
 * 提供与旧版emojiService兼容的API，内部使用统一emoji系统
 */

import type { UnifiedEmojiItem } from '@/types/emoji';

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
export async function getAllEmojis(): Promise<EmojiItem[]> {
  try {
    const { getAllEmojis: getUnifiedEmojis } = await import('@/services/unifiedEmojiSystem');
    return getUnifiedEmojis().map(convertToLegacyFormat);
  } catch (error) {
    console.error('getting所hasemojifailed:', error);
    return [];
  }
}

/**
 * 按分类获取emoji（兼容旧版API）
 */
export async function getEmojisByCategory(category: string): Promise<EmojiItem[]> {
  try {
    const { getEmojisByCategory: getUnifiedEmojisByCategory } = await import('@/services/unifiedEmojiSystem');
    
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
  } catch (error) {
    console.error('按categorygettingemojifailed:', error);
    return [];
  }
}

/**
 * 搜索emoji（兼容旧版API）
 */
export async function searchEmojis(keyword: string): Promise<EmojiItem[]> {
  try {
    const { searchEmojis: searchUnifiedEmojis } = await import('@/services/unifiedEmojiSystem');
    return searchUnifiedEmojis(keyword).map(convertToLegacyFormat);
  } catch (error) {
    console.error('searchingemojifailed:', error);
    return [];
  }
}

/**
 * 获取热门emoji
 */
export async function getPopularEmojis(): Promise<EmojiItem[]> {
  try {
    // 返回一些热门emoji
    const popularKeywords = ['开心', '爱心', '笑', '哭', '生气', '惊讶', '可爱', '酷'];
    const popularEmojis: EmojiItem[] = [];
    
    for (const keyword of popularKeywords) {
      const results = await searchEmojis(keyword);
      if (results.length > 0) {
        popularEmojis.push(results[0]);
      }
    }
    
    return popularEmojis.slice(0, 20);
  } catch (error) {
    console.error('getting热门emojifailed:', error);
    return [];
  }
}

/**
 * 获取表情类emoji
 */
export async function getSmileysEmojis(): Promise<EmojiItem[]> {
  return await getEmojisByCategory('emotions');
}

/**
 * 获取动物类emoji
 */
export async function getAnimalsEmojis(): Promise<EmojiItem[]> {
  return await getEmojisByCategory('animals');
}

/**
 * 获取食物类emoji
 */
export async function getFoodEmojis(): Promise<EmojiItem[]> {
  return await getEmojisByCategory('food');
}

/**
 * 获取活动类emoji
 */
export async function getActivityEmojis(): Promise<EmojiItem[]> {
  const objects = await getEmojisByCategory('objects');
  return objects.filter(emoji => 
    emoji.keywords.some(keyword => 
      ['运动', '游戏', '娱乐', '活动'].includes(keyword)
    )
  );
}

/**
 * 获取旅行类emoji
 */
export async function getTravelEmojis(): Promise<EmojiItem[]> {
  const objects = await getEmojisByCategory('objects');
  return objects.filter(emoji => 
    emoji.keywords.some(keyword => 
      ['旅行', '交通', '出行', '航海'].includes(keyword)
    )
  );
}

/**
 * 获取物品类emoji
 */
export async function getObjectsEmojis(): Promise<EmojiItem[]> {
  return await getEmojisByCategory('objects');
}

/**
 * 获取符号类emoji
 */
export async function getSymbolsEmojis(): Promise<EmojiItem[]> {
  const nature = await getEmojisByCategory('nature');
  return nature.filter(emoji => 
    emoji.keywords.some(keyword => 
      ['符号', '标志', '图标'].includes(keyword)
    )
  );
}

/**
 * 获取旗帜类emoji
 */
export async function getFlagsEmojis(): Promise<EmojiItem[]> {
  // 返回一些旗帜相关的emoji
  const objects = await getEmojisByCategory('objects');
  return objects.filter(emoji => 
    emoji.keywords.some(keyword => 
      ['旗帜', '国家', '地区'].includes(keyword)
    )
  );
}

/**
 * 获取随机emoji
 */
export async function getRandomEmojis(count: number = 5): Promise<EmojiItem[]> {
  try {
    const { getRandomEmojis: getUnifiedRandomEmojis } = await import('@/services/unifiedEmojiSystem');
    return getUnifiedRandomEmojis(count).map(convertToLegacyFormat);
  } catch (error) {
    console.error('getting随机emojifailed:', error);
    return [];
  }
}

/**
 * 根据心情获取emoji
 */
export async function getEmojisByMood(mood: string): Promise<EmojiItem[]> {
  try {
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
    
    for (const keyword of keywords) {
      const searchResults = await searchEmojis(keyword);
      results.push(...searchResults);
    }
    
    // 去重并返回前10个
    const uniqueResults = results.filter((emoji, index, self) => 
      index === self.findIndex(e => e.unified === emoji.unified)
    );
    
    return uniqueResults.slice(0, 10);
  } catch (error) {
    console.error('root据心情gettingemojifailed:', error);
    return [];
  }
}

/**
 * 获取emoji的Unicode字符
 */
export async function getEmojiUnicode(unified: string): Promise<string> {
  try {
    const allEmojis = await getAllEmojis();
    const emoji = allEmojis.find(e => e.unified === unified);
    return emoji?.emoji || '';
  } catch (error) {
    console.error('fetchingemoji Unicodefailed:', error);
    return '';
  }
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
