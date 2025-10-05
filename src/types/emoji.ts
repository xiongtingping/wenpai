/**
 * Emoji系统类型定义
 * 独立的类型文件，避免循环依赖
 */

export interface UnifiedEmojiItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  keywords: string[];
  color: string;
  tags?: string[];
  unicode?: string;
  group?: string;
  subgroup?: string;
  skin_tone_support?: boolean;
  skin_tone_support_unicode_version?: string;
  emoticon?: string[];
  shortcodes?: string[];
  animated?: boolean;
  static_url?: string;
  animated_url?: string;
  custom?: boolean;
  description?: string;
  aliases?: string[];
  searchable?: boolean;
  visible?: boolean;
  order?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EmojiColorInput {
  emoji: string;
  name: string;
  category: string;
  keywords: string[];
}

export interface EmojiColorResult {
  emoji: string;
  name: string;
  color: string;
}

/**
 * Emoji使用上下文类型
 */
export type EmojiUsageContext =
  | 'avatar'          // 头像
  | 'decoration'      // 装饰
  | 'button'          // 按钮
  | 'title'           // 标题
  | 'content'         // 内容
  | 'card'            // 卡片
  | 'icon'            // 图标
  | 'badge'           // 徽章
  | 'notification'    // 通知
  | 'status'          // 状态指示
  | 'reaction'        // 反应/表情回应
  | 'picker';         // 选择器

/**
 * 平台类型
 */
export type PlatformType = 'desktop' | 'mobile' | 'tablet' | 'apple' | 'google' | 'microsoft' | 'web';

/**
 * Emoji尺寸配置接口
 */
export interface EmojiSizeConfig {
  fontSize: string;
  width?: string;
  height?: string;
  lineHeight?: string;
  padding?: string;
  borderRadius?: string;
}

/**
 * Emoji分类接口
 */
export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}