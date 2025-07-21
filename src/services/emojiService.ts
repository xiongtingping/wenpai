/**
 * Emoji 服务
 * 提供 emoji 查询、分类、搜索等功能
 * @module emojiService
 */

import emojiData from '@/assets/emoji/emoji-data.json';

/**
 * Emoji 数据接口
 */
export interface EmojiItem {
  unified: string;
  short_name: string;
  short_names: string[];
  category: string;
  keywords: string[];
}

/**
 * 平台图标配置
 */
export interface PlatformIcon {
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

/**
 * Emoji 显示模式
 */
export type EmojiDisplayMode = 'unicode' | 'image' | 'cdn';

/**
 * CDN 配置
 */
const CDN_CONFIGS = {
  'noto-color': {
    name: 'Google Noto Color',
    baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128',
    format: 'png',
    size: 128
  },
  'noto-outline': {
    name: 'Google Noto Outline', 
    baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128',
    format: 'png',
    size: 128
  },
  'twemoji': {
    name: 'Twitter Emoji',
    baseUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72',
    format: 'png',
    size: 72
  },
  'emojione': {
    name: 'EmojiOne',
    baseUrl: 'https://cdn.jsdelivr.net/gh/emojione/emojione@latest/assets/png',
    format: 'png',
    size: 64
  }
} as const;

/**
 * 获取所有 emoji
 * @returns {EmojiItem[]} emoji 列表
 */
export function getAllEmojis(): EmojiItem[] {
  return emojiData as EmojiItem[];
}

/**
 * 按分类获取 emoji
 * @param {string} category - 分类名称
 * @returns {EmojiItem[]} 分类下的 emoji 列表
 */
export function getEmojisByCategory(category: string): EmojiItem[] {
  return emojiData.filter(e => e.category === category) as EmojiItem[];
}

/**
 * 按关键词搜索 emoji
 * @param {string} keyword - 搜索关键词
 * @returns {EmojiItem[]} 匹配的 emoji 列表
 */
export function searchEmojis(keyword: string): EmojiItem[] {
  const lowerKeyword = keyword.toLowerCase();
  return emojiData.filter(e => 
    e.short_name.includes(lowerKeyword) ||
    e.short_names.some(name => name.includes(lowerKeyword)) ||
    e.keywords.some(k => k.includes(lowerKeyword))
  ) as EmojiItem[];
}

/**
 * 获取 emoji 图片路径
 * @param {string} unified - emoji 统一码
 * @returns {string} 图片路径
 */
export function getEmojiImage(unified: string): string {
  return `/assets/noto-emoji/emoji_u${unified.toLowerCase()}.png`;
}

/**
 * 获取 emoji 的 Unicode 字符
 * @param {string} unified - emoji 统一码
 * @returns {string} Unicode 字符
 */
export function getEmojiUnicode(unified: string): string {
  return String.fromCodePoint(...unified.split('-').map(hex => parseInt(hex, 16)));
}

/**
 * 获取 emoji CDN 图片URL
 * @param {string} unified - emoji 统一码
 * @param {keyof typeof CDN_CONFIGS} cdnType - CDN类型
 * @returns {string} CDN图片URL
 */
export function getEmojiCDNUrl(
  unified: string, 
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
): string {
  const config = CDN_CONFIGS[cdnType];
  const filename = unified.toLowerCase().replace(/-/g, '_');
  return `${config.baseUrl}/emoji_u${filename}.${config.format}`;
}

/**
 * 获取 emoji 显示内容
 * @param {string} unified - emoji 统一码
 * @param {EmojiDisplayMode} mode - 显示模式
 * @param {keyof typeof CDN_CONFIGS} cdnType - CDN类型（仅在image模式下使用）
 * @returns {string} 显示内容（Unicode字符或图片URL）
 */
export function getEmojiDisplay(
  unified: string,
  mode: EmojiDisplayMode = 'unicode',
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
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
 * 批量获取 emoji CDN URLs
 * @param {string[]} unifiedCodes - emoji 统一码数组
 * @param {keyof typeof CDN_CONFIGS} cdnType - CDN类型
 * @returns {Array<{unified: string, url: string}>} emoji URL数组
 */
export function getEmojiCDNUrls(
  unifiedCodes: string[],
  cdnType: keyof typeof CDN_CONFIGS = 'noto-color'
): Array<{unified: string, url: string}> {
  return unifiedCodes.map(unified => ({
    unified,
    url: getEmojiCDNUrl(unified, cdnType)
  }));
}

/**
 * 获取可用的 CDN 配置
 * @returns {typeof CDN_CONFIGS} CDN配置对象
 */
export function getCDNConfigs(): typeof CDN_CONFIGS {
  return CDN_CONFIGS;
}

/**
 * 获取常用 emoji 分类
 * @returns {string[]} 分类列表
 */
export function getEmojiCategories(): string[] {
  const categories = [...new Set(emojiData.map(e => e.category))];
  return categories.sort();
}

/**
 * 获取平台图标配置
 * @returns {PlatformIcon[]} 平台图标列表
 */
export function getPlatformIcons(): PlatformIcon[] {
  return [
    {
      name: 'V2EX',
      shortName: 'V',
      icon: 'V',
      color: '#1f2937'
    },
    {
      name: '掘金',
      shortName: 'J',
      icon: 'J',
      color: '#1e40af'
    },
    {
      name: 'CSDN',
      shortName: 'C',
      icon: 'C',
      color: '#dc2626'
    },
    {
      name: '知乎',
      shortName: 'Z',
      icon: 'Z',
      color: '#059669'
    },
    {
      name: 'B站',
      shortName: 'B',
      icon: 'B',
      color: '#7c3aed'
    },
    {
      name: '微博',
      shortName: 'W',
      icon: 'W',
      color: '#ea580c'
    },
    {
      name: '小红书',
      shortName: 'X',
      icon: 'X',
      color: '#dc2626'
    },
    {
      name: '抖音',
      shortName: 'D',
      icon: 'D',
      color: '#000000'
    }
  ].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

/**
 * 获取平台图标组件
 * @param {string} platformName - 平台名称
 * @returns {PlatformIcon | null} 平台图标配置
 */
export function getPlatformIcon(platformName: string): PlatformIcon | null {
  const icons = getPlatformIcons();
  return icons.find(icon => icon.name === platformName) || null;
}

/**
 * 生成平台图标 SVG
 * @param {PlatformIcon} icon - 平台图标配置
 * @param {number} size - 图标大小
 * @returns {string} SVG 字符串
 */
export function generatePlatformIconSVG(icon: PlatformIcon, size: number = 24): string {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${icon.color}"/>
      <text x="${size/2}" y="${size/2 + size/6}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.6}" font-weight="bold">${icon.icon}</text>
    </svg>
  `;
}

/**
 * 获取热门 emoji
 * @returns {EmojiItem[]} 热门 emoji 列表
 */
export function getPopularEmojis(): EmojiItem[] {
  const popularUnified = [
    '1f600', '1f603', '1f604', '1f601', '1f606', '1f605', '1f602', '1f642',
    '1f609', '1f60a', '1f60d', '1f618', '1f617', '1f619', '1f61a', '1f60b',
    '1f60c', '1f60f', '1f60e', '1f913', '1f9d0', '1f615', '1f641', '1f62e',
    '1f62f', '1f632', '1f633', '1f97a', '1f979', '1f626', '1f627', '1f628',
    '1f630', '1f625', '1f622', '1f62d', '1f631', '1f616', '1f623', '1f61e',
    '1f613', '1f629', '1f62b', '1f971', '1f624', '1f621', '1f620', '1f92c'
  ];
  
  return emojiData.filter(e => popularUnified.includes(e.unified)) as EmojiItem[];
}

/**
 * 获取表情分类的 emoji
 * @returns {EmojiItem[]} 表情分类的 emoji 列表
 */
export function getSmileysEmojis(): EmojiItem[] {
  return getEmojisByCategory('smileys_emotion');
}

/**
 * 获取动物分类的 emoji
 * @returns {EmojiItem[]} 动物分类的 emoji 列表
 */
export function getAnimalsEmojis(): EmojiItem[] {
  return getEmojisByCategory('animals_nature');
}

/**
 * 获取食物分类的 emoji
 * @returns {EmojiItem[]} 食物分类的 emoji 列表
 */
export function getFoodEmojis(): EmojiItem[] {
  return getEmojisByCategory('food_drink');
}

/**
 * 获取活动分类的 emoji
 * @returns {EmojiItem[]} 活动分类的 emoji 列表
 */
export function getActivityEmojis(): EmojiItem[] {
  return getEmojisByCategory('activities');
}

/**
 * 获取旅行分类的 emoji
 * @returns {EmojiItem[]} 旅行分类的 emoji 列表
 */
export function getTravelEmojis(): EmojiItem[] {
  return getEmojisByCategory('travel_places');
}

/**
 * 获取物体分类的 emoji
 * @returns {EmojiItem[]} 物体分类的 emoji 列表
 */
export function getObjectsEmojis(): EmojiItem[] {
  return getEmojisByCategory('objects');
}

/**
 * 获取符号分类的 emoji
 * @returns {EmojiItem[]} 符号分类的 emoji 列表
 */
export function getSymbolsEmojis(): EmojiItem[] {
  return getEmojisByCategory('symbols');
}

/**
 * 获取旗帜分类的 emoji
 * @returns {EmojiItem[]} 旗帜分类的 emoji 列表
 */
export function getFlagsEmojis(): EmojiItem[] {
  return getEmojisByCategory('flags');
}

/**
 * 获取随机 emoji
 * @param {number} count - 数量
 * @returns {EmojiItem[]} 随机 emoji 列表
 */
export function getRandomEmojis(count: number = 10): EmojiItem[] {
  const shuffled = [...emojiData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count) as EmojiItem[];
}

/**
 * 根据心情获取 emoji
 * @param {string} mood - 心情关键词
 * @returns {EmojiItem[]} 匹配心情的 emoji 列表
 */
export function getEmojisByMood(mood: string): EmojiItem[] {
  const moodKeywords: Record<string, string[]> = {
    'happy': ['happy', 'joy', 'smile', 'laugh', 'grin'],
    'sad': ['sad', 'cry', 'tear', 'frown', 'weep'],
    'angry': ['angry', 'rage', 'furious', 'mad'],
    'love': ['love', 'heart', 'kiss', 'romance'],
    'surprise': ['surprise', 'shock', 'wow', 'astonished'],
    'fear': ['fear', 'scared', 'terrified', 'frightened']
  };
  
  const keywords = moodKeywords[mood.toLowerCase()] || [];
  return emojiData.filter(e => 
    keywords.some(keyword => 
      e.keywords.some(k => k.includes(keyword))
    )
  ) as EmojiItem[];
}

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