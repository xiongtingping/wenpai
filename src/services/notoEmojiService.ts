/**
 * Noto Emoji Service
 * 基于Google Noto Emoji开源项目
 * 提供完整的Unicode标准emoji支持
 */

/**
 * Unicode emoji分类 - 基于Unicode 15.0标准
 */
export const UNICODE_EMOJI_GROUPS = [
  'Smileys & Emotion',
  'People & Body', 
  'Component',
  'Animals & Nature',
  'Food & Drink',
  'Travel & Places',
  'Activities',
  'Objects',
  'Symbols',
  'Flags'
] as const;

/**
 * 肤色修饰符 - 基于Unicode Fitzpatrick Scale
 */
export const SKIN_TONE_MODIFIERS = {
  'light': { unicode: '\u{1F3FB}', hex: 'F7D7C4', name: '浅肤色' },
  'medium-light': { unicode: '\u{1F3FC}', hex: 'D4A574', name: '中浅肤色' },
  'medium': { unicode: '\u{1F3FD}', hex: 'A0754D', name: '中等肤色' },
  'medium-dark': { unicode: '\u{1F3FE}', hex: '825C42', name: '中深肤色' },
  'dark': { unicode: '\u{1F3FF}', hex: '5C4033', name: '深肤色' }
} as const;

/**
 * 自定义emoji序列名称 - 来自Noto Emoji项目
 */
const CUSTOM_GENDERED_SEQ_NAMES: Record<string, string> = {
  // Kiss sequences
  '1f468-2764-1f48b-1f468': 'Kiss',
  '1f469-2764-1f48b-1f469': 'Kiss', 
  '1f469-2764-1f48b-1f468': 'Kiss',
  // Couple with heart
  '1f469-2764-1f468': 'Couple with Heart',
  '1f468-2764-1f468': 'Couple with Heart',
  '1f469-2764-1f469': 'Couple with Heart',
  // Family sequences  
  '1f468-1f467': 'Family',
  '1f468-1f466': 'Family',
  '1f469-1f467': 'Family',
  '1f469-1f466': 'Family'
};

/**
 * 自定义emoji名称简化 - 来自Noto Emoji项目
 */
const CUSTOM_SEQ_NAMES: Record<string, string> = {
  '1f441-1f5e8': 'I Witness',
  '1f3f3-1f308': 'Rainbow Flag',
  '2695': 'Health Worker',
  '2696': 'Judge', 
  '26f7': 'Skiing',
  '26f9': 'Bouncing a Ball',
  '2708': 'Pilot',
  '1f33e': 'Farmer',
  '1f373': 'Cook',
  '1f393': 'Student',
  '1f3a4': 'Singer',
  '1f3a8': 'Artist',
  '1f3c3': 'Running',
  '1f3c4': 'Surfing',
  '1f3ca': 'Swimming',
  '1f46e': 'Police Officer',
  '1f477': 'Construction Worker',
  '1f4bb': 'Technologist',
  '1f527': 'Mechanic',
  '1f52c': 'Scientist',
  '1f680': 'Astronaut',
  '1f692': 'Firefighter'
};

/**
 * Emoji数据接口
 */
export interface NotoEmojiData {
  unicode: string;
  codepoint: string;
  name: string;
  group: string;
  subgroup: string;
  keywords: string[];
  hasSkinTone: boolean;
  hasGender: boolean;
  version: string;
  status: 'fully-qualified' | 'minimally-qualified' | 'unqualified';
}

/**
 * Noto Emoji风格选项
 */
export const NOTO_STYLES = {
  'color': {
    name: 'Noto Color',
    description: 'Google官方彩色设计',
    baseUrl: 'https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png',
    format: 'png'
  },
  'outline': {
    name: 'Noto Outline', 
    description: '黑白描边风格',
    baseUrl: '/assets/noto-emoji',
    format: 'png'
  },
  'material': {
    name: 'Material Design',
    description: 'Material Design风格',
    baseUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest',
    format: 'webp'
  }
} as const;

/**
 * 基础emoji数据 - 扩展版
 */
const BASE_EMOJI_DATA: NotoEmojiData[] = [
  {
    unicode: '😀',
    codepoint: '1f600',
    name: '笑脸',
    group: 'Smileys & Emotion',
    subgroup: 'face-smiling',
    keywords: ['笑', '开心', '高兴', '快乐', 'grinning'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '😃',
    codepoint: '1f603',
    name: '张嘴笑脸',
    group: 'Smileys & Emotion',
    subgroup: 'face-smiling',
    keywords: ['笑', '开心', '张嘴', '兴奋', 'grinning', 'big eyes'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '👍',
    codepoint: '1f44d',
    name: '竖起大拇指',
    group: 'People & Body',
    subgroup: 'hand-fingers-closed',
    keywords: ['好', '赞', '同意', '手势', 'thumbs up', 'like'],
    hasSkinTone: true,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '🐶',
    codepoint: '1f436',
    name: '狗脸',
    group: 'Animals & Nature',
    subgroup: 'animal-mammal',
    keywords: ['狗', '小狗', '宠物', '动物', 'dog', 'face'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '🍎',
    codepoint: '1f34e',
    name: '红苹果',
    group: 'Food & Drink',
    subgroup: 'food-fruit',
    keywords: ['苹果', '水果', '红色', '健康', 'apple', 'hsl(var(--destructive))'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '❤️',
    codepoint: '2764',
    name: '红心',
    group: 'Symbols',
    subgroup: 'heart',
    keywords: ['爱', '心', '红色', '感情', 'heart', 'love'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '🚗',
    codepoint: '1f697',
    name: '汽车',
    group: 'Travel & Places',
    subgroup: 'transport-ground',
    keywords: ['汽车', '车', '交通', '驾驶', 'car', 'automobile'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '⚽',
    codepoint: '26bd',
    name: '足球',
    group: 'Activities',
    subgroup: 'sport',
    keywords: ['足球', '运动', '球', '比赛', 'soccer', 'football'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '💡',
    codepoint: '1f4a1',
    name: '电灯泡',
    group: 'Objects',
    subgroup: 'light & video',
    keywords: ['灯泡', '想法', '创意', '电', 'bulb', 'idea'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  },
  {
    unicode: '🏳️',
    codepoint: '1f3f3',
    name: '白旗',
    group: 'Flags',
    subgroup: 'flag',
    keywords: ['旗帜', '白色', '投降', '和平', 'flag', 'hsl(var(--background))'],
    hasSkinTone: false,
    hasGender: false,
    version: '1.0',
    status: 'fully-qualified'
  }
];

/**
 * Noto Emoji服务类
 */
export class NotoEmojiService {
  private static instance: NotoEmojiService;
  private emojiData: NotoEmojiData[] = [];
  private emojiMap: Map<string, NotoEmojiData> = new Map();

  private constructor() {
    this.initializeData();
  }

  public static getInstance(): NotoEmojiService {
    if (!NotoEmojiService.instance) {
      NotoEmojiService.instance = new NotoEmojiService();
    }
    return NotoEmojiService.instance;
  }

  /**
   * 初始化emoji数据
   */
  private initializeData(): void {
    this.emojiData = [...BASE_EMOJI_DATA];
    this.buildEmojiMap();
  }

  /**
   * 构建emoji映射表
   */
  private buildEmojiMap(): void {
    this.emojiMap.clear();
    this.emojiData.forEach(emoji => {
      this.emojiMap.set(emoji.unicode, emoji);
      this.emojiMap.set(emoji.codepoint, emoji);
    });
  }

  /**
   * 获取所有emoji数据
   */
  public getAllEmojis(): NotoEmojiData[] {
    return [...this.emojiData];
  }

  /**
   * 根据分组获取emoji
   */
  public getEmojisByGroup(group: string): NotoEmojiData[] {
    return this.emojiData.filter(emoji => emoji.group === group);
  }

  /**
   * 搜索emoji
   */
  public searchEmojis(query: string): NotoEmojiData[] {
    const lowerQuery = query.toLowerCase();
    return this.emojiData.filter(emoji => 
      emoji.name.toLowerCase().includes(lowerQuery) ||
      emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery)) ||
      emoji.unicode.includes(query)
    );
  }

  /**
   * 根据unicode获取emoji数据
   */
  public getEmojiByUnicode(unicode: string): NotoEmojiData | undefined {
    return this.emojiMap.get(unicode);
  }

  /**
   * 根据codepoint获取emoji数据
   */
  public getEmojiByCodepoint(codepoint: string): NotoEmojiData | undefined {
    return this.emojiMap.get(codepoint);
  }

  /**
   * 生成Noto风格的emoji图片URL
   */
  public generateEmojiUrl(
    codepoint: string, 
    style: keyof typeof NOTO_STYLES = 'color',
    size: number = 128
  ): string {
    const styleConfig = NOTO_STYLES[style];
    
    if (style === 'color') {
      return `${styleConfig.baseUrl}/${size}/emoji_u${codepoint}.${styleConfig.format}`;
    } else if (style === 'material') {
      return `${styleConfig.baseUrl}/${codepoint}/${size}.${styleConfig.format}`;
    } else {
      return `${styleConfig.baseUrl}/emoji_u${codepoint}.${styleConfig.format}`;
    }
  }

  /**
   * 应用肤色修饰符
   * @param unicode emoji的unicode字符串
   * @param modifier 肤色修饰符key
   * @returns 应用修饰符后的unicode字符串，若无效则返回原unicode
   */
  public applySkinToneModifier(
    unicode: string,
    modifier: keyof typeof SKIN_TONE_MODIFIERS
  ): string {
    if (!unicode) {
      console.warn('[applySkinToneModifier] unicodeparameteris empty');
      return '';
    }
    const emoji = this.getEmojiByUnicode(unicode);
    if (!emoji) {
      console.warn(`[applySkinToneModifier] not foundunicode: ${unicode} 对应的emoji`);
      return unicode;
    }
    if (emoji.hasSkinTone && modifier && SKIN_TONE_MODIFIERS[modifier]) {
      return unicode + SKIN_TONE_MODIFIERS[modifier].unicode;
    }
    return unicode;
  }

  /**
   * 获取emoji的变体（肤色、性别等）
   */
  public getEmojiVariants(baseUnicode: string): string[] {
    const emoji = this.getEmojiByUnicode(baseUnicode);
    if (!emoji) return [baseUnicode];

    const variants = [baseUnicode];

    // 添加肤色变体
    if (emoji.hasSkinTone) {
      Object.keys(SKIN_TONE_MODIFIERS).forEach(modifier => {
        variants.push(this.applySkinToneModifier(baseUnicode, modifier as keyof typeof SKIN_TONE_MODIFIERS));
      });
    }

    return variants;
  }

  /**
   * 获取自定义名称
   */
  public getCustomName(codepoint: string): string | null {
    return CUSTOM_SEQ_NAMES[codepoint] || CUSTOM_GENDERED_SEQ_NAMES[codepoint] || null;
  }

  /**
   * Unicode代码点转换
   */
  public unicodeToCodepoint(unicode: string): string {
    return Array.from(unicode)
      .map(char => char.codePointAt(0)?.toString(16).padStart(4, '0'))
      .join('_');
  }

  /**
   * 代码点转Unicode
   */
  public codepointToUnicode(codepoint: string): string {
    return codepoint
      .split('_')
      .map(code => String.fromCodePoint(parseInt(code, 16)))
      .join('');
  }

  /**
   * 验证emoji是否支持
   */
  public isEmojiSupported(unicode: string): boolean {
    return this.emojiMap.has(unicode);
  }

  /**
   * 获取emoji统计信息
   */
  public getEmojiStats() {
    const stats = {
      total: this.emojiData.length,
      byGroup: {} as Record<string, number>,
      withSkinTone: 0,
      withGender: 0
    };

    this.emojiData.forEach(emoji => {
      stats.byGroup[emoji.group] = (stats.byGroup[emoji.group] || 0) + 1;
      if (emoji.hasSkinTone) stats.withSkinTone++;
      if (emoji.hasGender) stats.withGender++;
    });

    return stats;
  }

  /**
   * 批量生成emoji URLs
   */
  public batchGenerateUrls(
    codepoints: string[],
    style: keyof typeof NOTO_STYLES = 'color',
    size: number = 128
  ): Array<{ codepoint: string; url: string }> {
    return codepoints.map(codepoint => ({
      codepoint,
      url: this.generateEmojiUrl(codepoint, style, size)
    }));
  }

  /**
   * 导出emoji数据为JSON
   */
  public exportData(): string {
    return JSON.stringify({
      metadata: {
        total: this.emojiData.length,
        generated: new Date().toISOString(),
        source: 'Google Noto Emoji Project'
      },
      groups: UNICODE_EMOJI_GROUPS,
      skinTones: SKIN_TONE_MODIFIERS,
      styles: NOTO_STYLES,
      emojis: this.emojiData
    }, null, 2);
  }
}

// 导出单例实例
export const notoEmojiService = NotoEmojiService.getInstance();
