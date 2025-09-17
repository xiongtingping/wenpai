/**
 * {t('emojiSystem.description')}
 * {t('emojiSystem.integration')}
 */

import { getAllEmojis as getRawEmojiJson, getEmojiUnicode } from '@/services/emojiService';

// {t('emojiSystem.types.basicData')}
export interface UnifiedEmojiItem {
  id: string;
  name: string;
  emoji: string;
  color: string;
  category: 'animals' | 'food' | 'objects' | 'emotions' | 'nature';
  keywords: string[];
  svg?: string;
  unicode?: string;
  createdAt?: string;
  source: 'system' | 'user' | 'ai';
}

/**
 * {t('emojiSystem.types.usageContext')}
 */
export type EmojiUsageContext =
  | 'avatar'          // {t('emojiSystem.contexts.avatar')}
  | 'decoration'      // {t('emojiSystem.contexts.decoration')}
  | 'button'          // {t('emojiSystem.contexts.button')}
  | 'title'           // {t('emojiSystem.contexts.title')}
  | 'content'         // {t('emojiSystem.contexts.content')}
  | 'card'            // 卡片
  | 'icon'            // 图标
  | 'badge'           // 徽章
  | 'notification'    // 通知
  | 'status'          // 状态指示
  | 'reaction'        // 反应/表情回应
  | 'picker';         // 选择器

/**
 * {t('emojiSystem.types.platformType')}
 */
export type PlatformType = 'desktop' | 'mobile' | 'tablet';

/**
 * {t('emojiSystem.types.sizeConfig')}
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
 * Emoji尺寸配置映射表
 */
export const EMOJI_SIZE_CONFIG: Record<EmojiUsageContext, Record<PlatformType, EmojiSizeConfig>> = {
  avatar: {
    desktop: { fontSize: 'var(--spacing-8)', width: 'var(--spacing-16)', height: 'var(--spacing-16)', borderRadius: '50%' },
    mobile: { fontSize: 'var(--spacing-6)', width: 'var(--spacing-12)', height: 'var(--spacing-12)', borderRadius: '50%' },
    tablet: { fontSize: '1.75rem', width: 'var(--spacing-14)', height: 'var(--spacing-14)', borderRadius: '50%' }
  },
  decoration: {
    desktop: { fontSize: 'var(--spacing-5)', lineHeight: '1.5' },
    mobile: { fontSize: 'var(--spacing-4)', lineHeight: '1.4' },
    tablet: { fontSize: '1.125rem', lineHeight: '1.45' }
  },
  button: {
    desktop: { fontSize: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: '0.375rem' },
    mobile: { fontSize: '0.875rem', padding: '0.375rem', borderRadius: 'var(--spacing-1)' },
    tablet: { fontSize: '0.9375rem', padding: '0.4375rem', borderRadius: '0.3125rem' }
  },
  title: {
    desktop: { fontSize: 'var(--spacing-6)', lineHeight: '1.2' },
    mobile: { fontSize: 'var(--spacing-5)', lineHeight: '1.3' },
    tablet: { fontSize: '1.375rem', lineHeight: '1.25' }
  },
  content: {
    desktop: { fontSize: 'var(--spacing-4)', lineHeight: '1.6' },
    mobile: { fontSize: '0.875rem', lineHeight: '1.5' },
    tablet: { fontSize: '0.9375rem', lineHeight: '1.55' }
  },
  card: {
    desktop: { fontSize: '1.125rem', padding: 'var(--spacing-3)', borderRadius: 'var(--spacing-2)' },
    mobile: { fontSize: 'var(--spacing-4)', padding: 'var(--spacing-2)', borderRadius: '0.375rem' },
    tablet: { fontSize: '1.0625rem', padding: '0.625rem', borderRadius: '0.4375rem' }
  },
  icon: {
    desktop: { fontSize: 'var(--spacing-4)', width: 'var(--spacing-6)', height: 'var(--spacing-6)' },
    mobile: { fontSize: '0.875rem', width: 'var(--spacing-5)', height: 'var(--spacing-5)' },
    tablet: { fontSize: '0.9375rem', width: '22px', height: '22px' }
  },
  badge: {
    desktop: { fontSize: 'var(--spacing-3)', padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: '9999px' },
    mobile: { fontSize: '0.625rem', padding: '0.1875rem 0.375rem', borderRadius: '9999px' },
    tablet: { fontSize: '0.6875rem', padding: '0.21875rem 0.4375rem', borderRadius: '9999px' }
  },
  notification: {
    desktop: { fontSize: 'var(--spacing-4)', padding: 'var(--spacing-3)', borderRadius: 'var(--spacing-2)' },
    mobile: { fontSize: '0.875rem', padding: 'var(--spacing-2)', borderRadius: '0.375rem' },
    tablet: { fontSize: '0.9375rem', padding: '0.625rem', borderRadius: '0.4375rem' }
  },
  status: {
    desktop: { fontSize: '0.875rem', width: 'var(--spacing-4)', height: 'var(--spacing-4)' },
    mobile: { fontSize: 'var(--spacing-3)', width: 'var(--spacing-3-5)', height: 'var(--spacing-3-5)' },
    tablet: { fontSize: '0.8125rem', width: '15px', height: '15px' }
  },
  reaction: {
    desktop: { fontSize: 'var(--spacing-5)', padding: '0.375rem', borderRadius: '0.375rem' },
    mobile: { fontSize: 'var(--spacing-4)', padding: 'var(--spacing-1)', borderRadius: 'var(--spacing-1)' },
    tablet: { fontSize: '1.125rem', padding: '0.3125rem', borderRadius: '0.3125rem' }
  },
  picker: {
    desktop: { fontSize: 'var(--spacing-6)', width: 'var(--spacing-10)', height: 'var(--spacing-10)', padding: 'var(--spacing-2)' },
    mobile: { fontSize: 'var(--spacing-5)', width: 'var(--spacing-9)', height: 'var(--spacing-9)', padding: '0.375rem' },
    tablet: { fontSize: '1.375rem', width: '38px', height: '38px', padding: '0.4375rem' }
  }
};

// emoji分类配置
export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}

// t('emojiSystem.comments.animalEmojis')
const animalEmojis: UnifiedEmojiItem[] = [
  // 原有的30个动物
  { id: 'animal_001', name: '小猫', emoji: '🐱', color: t('emojiSystem.colors.orange'), category: 'animals', keywords: ['猫', '宠物', '可爱'], source: 'system' },
  { id: 'animal_002', name: '小狗', emoji: '🐶', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['狗', '宠物', '忠诚'], source: 'system' },
  { id: 'animal_003', name: '小熊', emoji: '🐻', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['熊', '可爱', '毛绒'], source: 'system' },
  { id: 'animal_004', name: '小兔', emoji: '🐰', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['兔子', '可爱', '跳跃'], source: 'system' },
  { id: 'animal_005', name: '小狐狸', emoji: '🦊', color: t('emojiSystem.colors.orange'), category: 'animals', keywords: ['狐狸', '聪明', t('emojiSystem.colors.orange')], source: 'system' },
  { id: 'animal_006', name: '小熊猫', emoji: '🐼', color: t('emojiSystem.colors.blackWhite'), category: 'animals', keywords: ['熊猫', '中国', t('emojiSystem.colors.blackWhite')], source: 'system' },
  { id: 'animal_007', name: '小猴子', emoji: '🐵', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['猴子', '活泼', '聪明'], source: 'system' },
  { id: 'animal_008', name: '小老虎', emoji: '🐯', color: t('emojiSystem.colors.orange'), category: 'animals', keywords: ['老虎', '威猛', '条纹'], source: 'system' },
  { id: 'animal_009', name: '小狮子', emoji: '🦁', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['狮子', '王者', '鬃毛'], source: 'system' },
  { id: 'animal_010', name: '小牛', emoji: '🐮', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['牛', '力量', '农场'], source: 'system' },
  { id: 'animal_011', name: '小猪', emoji: '🐷', color: t('emojiSystem.colors.pink'), category: 'animals', keywords: ['猪', '可爱', t('emojiSystem.colors.pink')], source: 'system' },
  { id: 'animal_012', name: '小青蛙', emoji: '🐸', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['青蛙', t('emojiSystem.colors.green'), '跳跃'], source: 'system' },
  { id: 'animal_013', name: '小鸡', emoji: '🐥', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['小鸡', t('emojiSystem.colors.yellow'), '可爱'], source: 'system' },
  { id: 'animal_014', name: '小企鹅', emoji: '🐧', color: t('emojiSystem.colors.blackWhite'), category: 'animals', keywords: ['企鹅', '南极', t('emojiSystem.colors.blackWhite')], source: 'system' },
  { id: 'animal_015', name: '小鸟', emoji: '🐦', color: t('emojiSystem.colors.blue'), category: 'animals', keywords: ['鸟', '飞翔', '自由'], source: 'system' },
  { id: 'animal_016', name: '小鱼', emoji: '🐠', color: t('emojiSystem.colors.blue'), category: 'animals', keywords: ['鱼', '海洋', '游泳'], source: 'system' },
  { id: 'animal_017', name: '小章鱼', emoji: '🐙', color: t('emojiSystem.colors.purple'), category: 'animals', keywords: ['章鱼', '海洋', '触手'], source: 'system' },
  { id: 'animal_018', name: '小蝴蝶', emoji: '🦋', color: '彩色', category: 'animals', keywords: ['蝴蝶', '美丽', '飞舞'], source: 'system' },
  { id: 'animal_019', name: '小蜜蜂', emoji: '🐝', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['蜜蜂', '勤劳', t('emojiSystem.colors.yellow')], source: 'system' },
  { id: 'animal_020', name: '小瓢虫', emoji: '🐞', color: t('emojiSystem.colors.red'), category: 'animals', keywords: ['瓢虫', t('emojiSystem.colors.red'), '斑点'], source: 'system' },
  { id: 'animal_021', name: '小蜗牛', emoji: '🐌', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['蜗牛', '慢', '壳'], source: 'system' },
  { id: 'animal_022', name: '小海豚', emoji: '🐬', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['海豚', '聪明', '海洋'], source: 'system' },
  { id: 'animal_023', name: '小鲸鱼', emoji: '🐳', color: t('emojiSystem.colors.blue'), category: 'animals', keywords: ['鲸鱼', '巨大', '海洋'], source: 'system' },
  { id: 'animal_024', name: '小鳄鱼', emoji: '🐊', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['鳄鱼', '危险', t('emojiSystem.colors.green')], source: 'system' },
  { id: 'animal_025', name: '小乌龟', emoji: '🐢', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['乌龟', '长寿', '慢'], source: 'system' },
  { id: 'animal_026', name: '小蛇', emoji: '🐍', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['蛇', '长', '爬行'], source: 'system' },
  { id: 'animal_027', name: '小龙', emoji: '🐲', color: t('emojiSystem.colors.red'), category: 'animals', keywords: ['龙', '神话', '力量'], source: 'system' },
  { id: 'animal_028', name: '小独角兽', emoji: '🦄', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['独角兽', '神话', '纯洁'], source: 'system' },
  { id: 'animal_029', name: '小考拉', emoji: '🐨', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['考拉', '澳洲', '可爱'], source: 'system' },
  { id: 'animal_030', name: '小袋鼠', emoji: '🦘', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['袋鼠', '澳洲', '跳跃'], source: 'system' },

  // t('emojiSystem.comments.newAnimalEmojis')
  { id: 'animal_031', name: '小羊', emoji: '🐑', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['羊', '温顺', t('emojiSystem.colors.white')], source: 'system' },
  { id: 'animal_032', name: '小马', emoji: '🐴', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['马', '奔跑', '优雅'], source: 'system' },
  { id: 'animal_033', name: '小斑马', emoji: '🦓', color: t('emojiSystem.colors.blackWhite'), category: 'animals', keywords: ['斑马', '条纹', '非洲'], source: 'system' },
  { id: 'animal_034', name: '小鹿', emoji: '🦌', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['鹿', '优雅', '森林'], source: 'system' },
  { id: 'animal_035', name: '小长颈鹿', emoji: '🦒', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['长颈鹿', '高', '非洲'], source: 'system' },
  { id: 'animal_036', name: '小大象', emoji: '🐘', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['大象', '巨大', '记忆'], source: 'system' },
  { id: 'animal_037', name: '小犀牛', emoji: '🦏', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['犀牛', '角', '力量'], source: 'system' },
  { id: 'animal_038', name: '小河马', emoji: '🦛', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['河马', '水', '大嘴'], source: 'system' },
  { id: 'animal_039', name: '小骆驼', emoji: '🐪', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['骆驼', '沙漠', '驼峰'], source: 'system' },
  { id: 'animal_040', name: '小双峰驼', emoji: '🐫', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['双峰驼', '沙漠', '两个驼峰'], source: 'system' },
  { id: 'animal_041', name: '小羊驼', emoji: '🦙', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['羊驼', '可爱', '毛茸茸'], source: 'system' },
  { id: 'animal_042', name: '小水牛', emoji: '🐃', color: t('emojiSystem.colors.black'), category: 'animals', keywords: ['水牛', '力量', '农场'], source: 'system' },
  { id: 'animal_043', name: '小野牛', emoji: '🦬', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['野牛', '野性', '草原'], source: 'system' },
  { id: 'animal_044', name: '小山羊', emoji: '🐐', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['山羊', '攀爬', '胡须'], source: 'system' },
  { id: 'animal_045', name: '小公羊', emoji: '🐏', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['公羊', '角', '力量'], source: 'system' },
  { id: 'animal_046', name: '小野猪', emoji: '🐗', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['野猪', '野性', '獠牙'], source: 'system' },
  { id: 'animal_047', name: '小鼠', emoji: '🐭', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['老鼠', '小', '灵活'], source: 'system' },
  { id: 'animal_048', name: '小仓鼠', emoji: '🐹', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['仓鼠', '可爱', '宠物'], source: 'system' },
  { id: 'animal_049', name: '小兔子', emoji: '🐇', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['兔子', '快速', '耳朵'], source: 'system' },
  { id: 'animal_050', name: '小松鼠', emoji: '🐿️', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['松鼠', '坚果', '尾巴'], source: 'system' },
  { id: 'animal_051', name: '小刺猬', emoji: '🦔', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['刺猬', '刺', '防御'], source: 'system' },
  { id: 'animal_052', name: '小蝙蝠', emoji: '🦇', color: t('emojiSystem.colors.black'), category: 'animals', keywords: ['蝙蝠', '夜晚', '飞行'], source: 'system' },
  { id: 'animal_053', name: '小狼', emoji: '🐺', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['狼', '野性', '群体'], source: 'system' },
  { id: 'animal_054', name: '小北极熊', emoji: '🐻‍❄️', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['北极熊', t('emojiSystem.colors.white'), '寒冷'], source: 'system' },
  { id: 'animal_055', name: '小浣熊', emoji: '🦝', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['浣熊', '面具', '聪明'], source: 'system' },
  { id: 'animal_056', name: '小獾', emoji: '🦡', color: t('emojiSystem.colors.blackWhite'), category: 'animals', keywords: ['獾', '挖掘', '条纹'], source: 'system' },
  { id: 'animal_057', name: '小水獭', emoji: '🦦', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['水獭', '游泳', '可爱'], source: 'system' },
  { id: 'animal_058', name: '小臭鼬', emoji: '🦨', color: t('emojiSystem.colors.blackWhite'), category: 'animals', keywords: ['臭鼬', t('emojiSystem.colors.blackWhite'), '气味'], source: 'system' },
  { id: 'animal_059', name: '小袋熊', emoji: '🐨', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['袋熊', '澳洲', '方形'], source: 'system' },
  { id: 'animal_060', name: '小树懒', emoji: '🦥', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['树懒', '慢', '树上'], source: 'system' },
  { id: 'animal_061', name: '小犰狳', emoji: '🦔', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['犰狳', '装甲', '卷曲'], source: 'system' },
  { id: 'animal_062', name: '小食蚁兽', emoji: '🐜', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['食蚁兽', '长鼻', '蚂蚁'], source: 'system' },
  { id: 'animal_063', name: '小猞猁', emoji: '🐱', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['猞猁', '野猫', '耳朵'], source: 'system' },
  { id: 'animal_064', name: '小豹', emoji: '🐆', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['豹', '斑点', '速度'], source: 'system' },
  { id: 'animal_065', name: '小美洲豹', emoji: '🐅', color: t('emojiSystem.colors.orange'), category: 'animals', keywords: ['美洲豹', '斑点', '力量'], source: 'system' },
  { id: 'animal_066', name: '小猎豹', emoji: '🐆', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['猎豹', '速度', '斑点'], source: 'system' },
  { id: 'animal_067', name: '小雪豹', emoji: '🐆', color: t('emojiSystem.colors.white'), category: 'animals', keywords: ['雪豹', '雪山', '稀有'], source: 'system' },
  { id: 'animal_068', name: '小黑豹', emoji: '🐈‍⬛', color: t('emojiSystem.colors.black'), category: 'animals', keywords: ['黑豹', t('emojiSystem.colors.black'), '神秘'], source: 'system' },
  { id: 'animal_069', name: '小美洲狮', emoji: '🦁', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['美洲狮', '山狮', '敏捷'], source: 'system' },
  { id: 'animal_070', name: '小猩猩', emoji: '🦍', color: t('emojiSystem.colors.black'), category: 'animals', keywords: ['猩猩', '强壮', '智慧'], source: 'system' },
  { id: 'animal_071', name: '小黑猩猩', emoji: '🐵', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['黑猩猩', '聪明', '社交'], source: 'system' },
  { id: 'animal_072', name: '小长臂猿', emoji: '🐒', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['长臂猿', '摆荡', '长臂'], source: 'system' },
  { id: 'animal_073', name: '小狒狒', emoji: '🐵', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['狒狒', '群体', '社交'], source: 'system' },
  { id: 'animal_074', name: '小猕猴', emoji: '🐒', color: t('emojiSystem.colors.brown'), category: 'animals', keywords: ['猕猴', '活泼', '聪明'], source: 'system' },
  { id: 'animal_075', name: '小狐猴', emoji: '🐒', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['狐猴', '马达加斯加', '大眼'], source: 'system' },
  { id: 'animal_076', name: '小海狮', emoji: '🦭', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['海狮', '海洋', '表演'], source: 'system' },
  { id: 'animal_077', name: '小海豹', emoji: '🦭', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['海豹', '可爱', '海洋'], source: 'system' },
  { id: 'animal_078', name: '小海象', emoji: '🦭', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['海象', '獠牙', '北极'], source: 'system' },
  { id: 'animal_079', name: '小鲨鱼', emoji: '🦈', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['鲨鱼', '海洋', '危险'], source: 'system' },
  { id: 'animal_080', name: '小鳐鱼', emoji: '🐠', color: t('emojiSystem.colors.blue'), category: 'animals', keywords: ['鳐鱼', '扁平', '海洋'], source: 'system' },
  { id: 'animal_081', name: '小海马', emoji: '🐠', color: t('emojiSystem.colors.blue'), category: 'animals', keywords: ['海马', '独特', '海洋'], source: 'system' },
  { id: 'animal_082', name: '小水母', emoji: '🪼', color: t('emojiSystem.colors.purple'), category: 'animals', keywords: ['水母', '透明', '漂浮'], source: 'system' },
  { id: 'animal_083', name: '小海星', emoji: '⭐', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['海星', '五角', '海洋'], source: 'system' },
  { id: 'animal_084', name: '小海胆', emoji: '🦔', color: t('emojiSystem.colors.purple'), category: 'animals', keywords: ['海胆', '刺', '海洋'], source: 'system' },
  { id: 'animal_085', name: '小螃蟹', emoji: '🦀', color: t('emojiSystem.colors.red'), category: 'animals', keywords: ['螃蟹', '钳子', '横行'], source: 'system' },
  { id: 'animal_086', name: '小龙虾', emoji: '🦞', color: t('emojiSystem.colors.red'), category: 'animals', keywords: ['龙虾', t('emojiSystem.colors.red'), '美味'], source: 'system' },
  { id: 'animal_087', name: '小虾', emoji: '🦐', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['虾', '弯曲', '海鲜'], source: 'system' },
  { id: 'animal_088', name: '小鱿鱼', emoji: '🦑', color: t('emojiSystem.colors.purple'), category: 'animals', keywords: ['鱿鱼', '触手', '海洋'], source: 'system' },
  { id: 'animal_089', name: '小贝壳', emoji: '🐚', color: t('emojiSystem.colors.yellow'), category: 'animals', keywords: ['贝壳', '珍珠', '海洋'], source: 'system' },
  { id: 'animal_090', name: '小蜘蛛', emoji: '🕷️', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['蜘蛛', '网', '八腿'], source: 'system' },
  { id: 'animal_091', name: '小蝎子', emoji: '🦂', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['蝎子', '毒刺', '沙漠'], source: 'system' },
  { id: 'animal_092', name: '小蚊子', emoji: '🦟', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['蚊子', '叮咬', '小'], source: 'system' },
  { id: 'animal_093', name: '小苍蝇', emoji: '🪰', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['苍蝇', '飞行', '讨厌'], source: 'system' },
  { id: 'animal_094', name: '小蚂蚁', emoji: '🐜', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['蚂蚁', '勤劳', '团队'], source: 'system' },
  { id: 'animal_095', name: '小蚱蜢', emoji: '🦗', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['蚱蜢', '跳跃', t('emojiSystem.colors.green')], source: 'system' },
  { id: 'animal_096', name: '小蟋蟀', emoji: '🦗', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['蟋蟀', '鸣叫', '夜晚'], source: 'system' },
  { id: 'animal_097', name: '小蜻蜓', emoji: '🦋', color: '彩色', category: 'animals', keywords: ['蜻蜓', '飞行', '水边'], source: 'system' },
  { id: 'animal_098', name: '小飞蛾', emoji: '🦋', color: '彩色', category: 'animals', keywords: ['飞蛾', '夜晚', '灯光'], source: 'system' },
  { id: 'animal_099', name: '小甲虫', emoji: '🪲', color: t('emojiSystem.colors.gray'), category: 'animals', keywords: ['甲虫', '硬壳', '昆虫'], source: 'system' },
  { id: 'animal_100', name: '小毛虫', emoji: '🐛', color: t('emojiSystem.colors.green'), category: 'animals', keywords: ['毛虫', '变化', '蝴蝶'], source: 'system' }
];

// t('emojiSystem.comments.foodEmojis')
const foodEmojis: UnifiedEmojiItem[] = [
  // 原有的25个食物
  { id: 'food_001', name: '苹果', emoji: '🍎', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['苹果', '水果', t('emojiSystem.colors.red')], source: 'system' },
  { id: 'food_002', name: '香蕉', emoji: '🍌', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['香蕉', '水果', t('emojiSystem.colors.yellow')], source: 'system' },
  { id: 'food_003', name: '橙子', emoji: '🍊', color: t('emojiSystem.colors.orange'), category: 'food', keywords: ['橙子', '水果', t('emojiSystem.colors.orange')], source: 'system' },
  { id: 'food_004', name: '草莓', emoji: '🍓', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['草莓', '水果', t('emojiSystem.colors.red')], source: 'system' },
  { id: 'food_005', name: '葡萄', emoji: '🍇', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['葡萄', '水果', t('emojiSystem.colors.purple')], source: 'system' },
  { id: 'food_006', name: '西瓜', emoji: '🍉', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['西瓜', '水果', '夏天'], source: 'system' },
  { id: 'food_007', name: '桃子', emoji: '🍑', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['桃子', '水果', t('emojiSystem.colors.pink')], source: 'system' },
  { id: 'food_008', name: '菠萝', emoji: '🍍', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['菠萝', '水果', '热带'], source: 'system' },
  { id: 'food_009', name: '芒果', emoji: '🥭', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['芒果', '水果', '热带'], source: 'system' },
  { id: 'food_010', name: '柠檬', emoji: '🍋', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['柠檬', '水果', '酸'], source: 'system' },
  { id: 'food_011', name: '椰子', emoji: '🥥', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['椰子', '水果', '热带'], source: 'system' },
  { id: 'food_012', name: '猕猴桃', emoji: '🥝', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['猕猴桃', '水果', t('emojiSystem.colors.green')], source: 'system' },
  { id: 'food_013', name: '蛋糕', emoji: '🎂', color: '彩色', category: 'food', keywords: ['蛋糕', '甜点', '生日'], source: 'system' },
  { id: 'food_014', name: '甜甜圈', emoji: '🍩', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['甜甜圈', '甜点', '圆形'], source: 'system' },
  { id: 'food_015', name: '冰淇淋', emoji: '🍦', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['冰淇淋', '甜点', '冷'], source: 'system' },
  { id: 'food_016', name: '棒棒糖', emoji: '🍭', color: '彩色', category: 'food', keywords: ['棒棒糖', '糖果', '甜'], source: 'system' },
  { id: 'food_017', name: '巧克力', emoji: '🍫', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['巧克力', '甜点', t('emojiSystem.colors.brown')], source: 'system' },
  { id: 'food_018', name: '饼干', emoji: '🍪', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['饼干', '零食', '脆'], source: 'system' },
  { id: 'food_019', name: '汉堡', emoji: '🍔', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['汉堡', '快餐', '肉'], source: 'system' },
  { id: 'food_020', name: '披萨', emoji: '🍕', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['披萨', '意大利', '奶酪'], source: 'system' },
  { id: 'food_021', name: '热狗', emoji: '🌭', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['热狗', '快餐', '香肠'], source: 'system' },
  { id: 'food_022', name: '薯条', emoji: '🍟', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['薯条', '快餐', '金黄'], source: 'system' },
  { id: 'food_023', name: '爆米花', emoji: '🍿', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['爆米花', '零食', '电影'], source: 'system' },
  { id: 'food_024', name: '咖啡', emoji: '☕', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['咖啡', '饮品', '提神'], source: 'system' },
  { id: 'food_025', name: '茶', emoji: '🍵', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['茶', '饮品', t('emojiSystem.colors.green')], source: 'system' },

  // t('emojiSystem.comments.newFoodEmojis')
  { id: 'food_026', name: '牛奶', emoji: '🥛', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['牛奶', '饮品', t('emojiSystem.colors.white')], source: 'system' },
  { id: 'food_027', name: '果汁', emoji: '🧃', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['果汁', '饮品', '盒装'], source: 'system' },
  { id: 'food_028', name: '汽水', emoji: '🥤', color: t('emojiSystem.colors.blue'), category: 'food', keywords: ['汽水', '饮品', '碳酸'], source: 'system' },
  { id: 'food_029', name: '啤酒', emoji: '🍺', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['啤酒', '酒精', '泡沫'], source: 'system' },
  { id: 'food_030', name: '红酒', emoji: '🍷', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['红酒', '酒精', '优雅'], source: 'system' },
  { id: 'food_031', name: '香槟', emoji: '🍾', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['香槟', '庆祝', '泡沫'], source: 'system' },
  { id: 'food_032', name: '鸡尾酒', emoji: '🍸', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['鸡尾酒', '调酒', '优雅'], source: 'system' },
  { id: 'food_033', name: '热带饮品', emoji: '🍹', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['热带饮品', '度假', '彩色'], source: 'system' },
  { id: 'food_034', name: '奶昔', emoji: '🥤', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['奶昔', '甜品', '浓稠'], source: 'system' },
  { id: 'food_035', name: '气泡水', emoji: '🫧', color: t('emojiSystem.colors.blue'), category: 'food', keywords: ['气泡水', '清爽', '健康'], source: 'system' },
  { id: 'food_036', name: '面包', emoji: '🍞', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['面包', '主食', '烘焙'], source: 'system' },
  { id: 'food_037', name: '法棍', emoji: '🥖', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['法棍', '法式', '长条'], source: 'system' },
  { id: 'food_038', name: '羊角包', emoji: '🥐', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['羊角包', '法式', '酥脆'], source: 'system' },
  { id: 'food_039', name: '椒盐卷饼', emoji: '🥨', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['椒盐卷饼', '德式', '扭曲'], source: 'system' },
  { id: 'food_040', name: '贝果', emoji: '🥯', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['贝果', '圆形', '犹太'], source: 'system' },
  { id: 'food_041', name: '松饼', emoji: '🧁', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['松饼', '甜点', '小巧'], source: 'system' },
  { id: 'food_042', name: '华夫饼', emoji: '🧇', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['华夫饼', '格子', '甜点'], source: 'system' },
  { id: 'food_043', name: '煎饼', emoji: '🥞', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['煎饼', '早餐', '叠层'], source: 'system' },
  { id: 'food_044', name: '奶酪', emoji: '🧀', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['奶酪', t('emojiSystem.colors.yellow'), '孔洞'], source: 'system' },
  { id: 'food_045', name: '鸡蛋', emoji: '🥚', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['鸡蛋', '蛋白质', '椭圆'], source: 'system' },
  { id: 'food_046', name: '煎蛋', emoji: '🍳', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['煎蛋', '早餐', t('emojiSystem.colors.yellow')], source: 'system' },
  { id: 'food_047', name: '培根', emoji: '🥓', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['培根', '肉类', '条纹'], source: 'system' },
  { id: 'food_048', name: '香肠', emoji: '🌭', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['香肠', '肉类', '长条'], source: 'system' },
  { id: 'food_049', name: '鸡肉', emoji: '🍗', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['鸡肉', '蛋白质', '烤制'], source: 'system' },
  { id: 'food_050', name: '牛排', emoji: '🥩', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['牛排', '肉类', '高级'], source: 'system' },
  { id: 'food_051', name: '火腿', emoji: '🍖', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['火腿', '肉类', '腌制'], source: 'system' },
  { id: 'food_052', name: '鱼', emoji: '🐟', color: t('emojiSystem.colors.blue'), category: 'food', keywords: ['鱼', '海鲜', '健康'], source: 'system' },
  { id: 'food_053', name: '虾', emoji: '🦐', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['虾', '海鲜', '弯曲'], source: 'system' },
  { id: 'food_054', name: '螃蟹', emoji: '🦀', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['螃蟹', '海鲜', '钳子'], source: 'system' },
  { id: 'food_055', name: '龙虾', emoji: '🦞', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['龙虾', '海鲜', '高级'], source: 'system' },
  { id: 'food_056', name: '鱿鱼', emoji: '🦑', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['鱿鱼', '海鲜', '触手'], source: 'system' },
  { id: 'food_057', name: '章鱼', emoji: '🐙', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['章鱼', '海鲜', '八爪'], source: 'system' },
  { id: 'food_058', name: '寿司', emoji: '🍣', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['寿司', '日式', '生鱼'], source: 'system' },
  { id: 'food_059', name: '寿司卷', emoji: '🍱', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['寿司卷', '日式', '海苔'], source: 'system' },
  { id: 'food_060', name: '便当', emoji: '🍱', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['便当', '日式', '盒饭'], source: 'system' },
  { id: 'food_061', name: '拉面', emoji: '🍜', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['拉面', '日式', '汤面'], source: 'system' },
  { id: 'food_062', name: '意面', emoji: '🍝', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['意面', '意大利', '番茄'], source: 'system' },
  { id: 'food_063', name: '米饭', emoji: '🍚', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['米饭', '主食', t('emojiSystem.colors.white')], source: 'system' },
  { id: 'food_064', name: '咖喱', emoji: '🍛', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['咖喱', '印度', '香料'], source: 'system' },
  { id: 'food_065', name: '炒饭', emoji: '🍚', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['炒饭', '中式', '混合'], source: 'system' },
  { id: 'food_066', name: '饺子', emoji: '🥟', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['饺子', '中式', '包子'], source: 'system' },
  { id: 'food_067', name: '包子', emoji: '🥟', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['包子', '中式', '蒸制'], source: 'system' },
  { id: 'food_068', name: '春卷', emoji: '🥟', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['春卷', '中式', '油炸'], source: 'system' },
  { id: 'food_069', name: '玉米饼', emoji: '🌮', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['玉米饼', '墨西哥', '卷饼'], source: 'system' },
  { id: 'food_070', name: '墨西哥卷', emoji: '🌯', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['墨西哥卷', '卷饼', '包裹'], source: 'system' },
  { id: 'food_071', name: '三明治', emoji: '🥪', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['三明治', '面包', '夹心'], source: 'system' },
  { id: 'food_072', name: '沙拉', emoji: '🥗', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['沙拉', '蔬菜', '健康'], source: 'system' },
  { id: 'food_073', name: '汤', emoji: '🍲', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['汤', '热汤', '营养'], source: 'system' },
  { id: 'food_074', name: '炖菜', emoji: '🍲', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['炖菜', '慢煮', '丰富'], source: 'system' },
  { id: 'food_075', name: '火锅', emoji: '🍲', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['火锅', '中式', '辣'], source: 'system' },
  { id: 'food_076', name: '胡萝卜', emoji: '🥕', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['胡萝卜', '蔬菜', t('emojiSystem.colors.orange')], source: 'system' },
  { id: 'food_077', name: '玉米', emoji: '🌽', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['玉米', '蔬菜', t('emojiSystem.colors.yellow')], source: 'system' },
  { id: 'food_078', name: '茄子', emoji: '🍆', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['茄子', '蔬菜', t('emojiSystem.colors.purple')], source: 'system' },
  { id: 'food_079', name: '番茄', emoji: '🍅', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['番茄', '蔬菜', t('emojiSystem.colors.red')], source: 'system' },
  { id: 'food_080', name: '辣椒', emoji: '🌶️', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['辣椒', '蔬菜', '辣'], source: 'system' },
  { id: 'food_081', name: '黄瓜', emoji: '🥒', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['黄瓜', '蔬菜', t('emojiSystem.colors.green')], source: 'system' },
  { id: 'food_082', name: '生菜', emoji: '🥬', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['生菜', '蔬菜', '叶子'], source: 'system' },
  { id: 'food_083', name: '西兰花', emoji: '🥦', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['西兰花', '蔬菜', '营养'], source: 'system' },
  { id: 'food_084', name: '花椰菜', emoji: '🥦', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['花椰菜', '蔬菜', t('emojiSystem.colors.white')], source: 'system' },
  { id: 'food_085', name: '卷心菜', emoji: '🥬', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['卷心菜', '蔬菜', '圆形'], source: 'system' },
  { id: 'food_086', name: '洋葱', emoji: '🧅', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['洋葱', '蔬菜', '层次'], source: 'system' },
  { id: 'food_087', name: '大蒜', emoji: '🧄', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['大蒜', '调料', '香味'], source: 'system' },
  { id: 'food_088', name: '土豆', emoji: '🥔', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['土豆', '蔬菜', '主食'], source: 'system' },
  { id: 'food_089', name: '红薯', emoji: '🍠', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['红薯', '蔬菜', '甜'], source: 'system' },
  { id: 'food_090', name: '萝卜', emoji: '🥕', color: t('emojiSystem.colors.red'), category: 'food', keywords: ['萝卜', '蔬菜', '根茎'], source: 'system' },
  { id: 'food_091', name: '蘑菇', emoji: '🍄', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['蘑菇', '菌类', '伞状'], source: 'system' },
  { id: 'food_092', name: '花生', emoji: '🥜', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['花生', '坚果', '蛋白质'], source: 'system' },
  { id: 'food_093', name: '栗子', emoji: '🌰', color: t('emojiSystem.colors.gray'), category: 'food', keywords: ['栗子', '坚果', '秋天'], source: 'system' },
  { id: 'food_094', name: '面条', emoji: '🍜', color: t('emojiSystem.colors.brown'), category: 'food', keywords: ['面条', '主食', '长条'], source: 'system' },
  { id: 'food_095', name: '年糕', emoji: '🍘', color: t('emojiSystem.colors.white'), category: 'food', keywords: ['年糕', '日式', '米制'], source: 'system' },
  { id: 'food_096', name: '月饼', emoji: '🥮', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['月饼', '中式', '中秋'], source: 'system' },
  { id: 'food_097', name: '粽子', emoji: '🍘', color: t('emojiSystem.colors.green'), category: 'food', keywords: ['粽子', '中式', '端午'], source: 'system' },
  { id: 'food_098', name: '汤圆', emoji: '🍡', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['汤圆', '中式', '圆形'], source: 'system' },
  { id: 'food_099', name: '布丁', emoji: '🍮', color: t('emojiSystem.colors.yellow'), category: 'food', keywords: ['布丁', '甜点', '嫩滑'], source: 'system' },
  { id: 'food_100', name: '果冻', emoji: '🍮', color: t('emojiSystem.colors.purple'), category: 'food', keywords: ['果冻', '甜点', 'Q弹'], source: 'system' }
];

// 分类配置
export const emojiCategories: EmojiCategory[] = [
  {
    id: 'animals',
    name: t('emojiSystem.categories.animals'),
    icon: '🐱',
    color: t('emojiSystem.colors.red'),
    count: 100,
    description: t('emojiSystem.descriptions.animals')
  },
  {
    id: 'food',
    name: t('emojiSystem.categories.food'),
    icon: '🍎',
    color: t('emojiSystem.colors.blue'),
    count: 100,
    description: t('emojiSystem.descriptions.food')
  },
  {
    id: 'objects',
    name: t('emojiSystem.categories.objects'),
    icon: '🚗',
    color: t('emojiSystem.colors.blue'),
    count: 100,
    description: t('emojiSystem.descriptions.objects')
  },
  {
    id: 'emotions',
    name: t('emojiSystem.categories.emotions'),
    icon: '😊',
    color: t('emojiSystem.colors.green'),
    count: 100,
    description: t('emojiSystem.descriptions.emotions')
  },
  {
    id: 'nature',
    name: t('emojiSystem.categories.nature'),
    icon: '☀️',
    color: t('emojiSystem.colors.yellow'),
    count: 100,
    description: t('emojiSystem.descriptions.nature')
  }
];

// t('emojiSystem.comments.objectEmojis')
const objectEmojis: UnifiedEmojiItem[] = [
  // 交通工具类 (25个)
  { id: 'object_001', name: '汽车', emoji: '🚗', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['汽车', '交通', '四轮'], source: 'system' },
  { id: 'object_002', name: '飞机', emoji: '✈️', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['飞机', '航空', '飞行'], source: 'system' },
  { id: 'object_003', name: '火车', emoji: '🚂', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['火车', '铁路', '蒸汽'], source: 'system' },
  { id: 'object_004', name: '自行车', emoji: '🚲', color: t('emojiSystem.colors.green'), category: 'objects', keywords: ['自行车', '环保', '两轮'], source: 'system' },
  { id: 'object_005', name: '摩托车', emoji: '🏍️', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['摩托车', '速度', '两轮'], source: 'system' },
  { id: 'object_006', name: '船', emoji: '⛵', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['船', '航海', '帆'], source: 'system' },
  { id: 'object_007', name: '火箭', emoji: '🚀', color: '银色', category: 'objects', keywords: ['火箭', '太空', '科技'], source: 'system' },
  { id: 'object_008', name: '直升机', emoji: '🚁', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['直升机', '旋翼', '救援'], source: 'system' },
  { id: 'object_009', name: '公交车', emoji: '🚌', color: t('emojiSystem.colors.yellow'), category: 'objects', keywords: ['公交车', '公共', '大型'], source: 'system' },
  { id: 'object_010', name: '卡车', emoji: '🚚', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['卡车', '货运', '大型'], source: 'system' },
  { id: 'object_011', name: '救护车', emoji: '🚑', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['救护车', '医疗', '紧急'], source: 'system' },
  { id: 'object_012', name: '消防车', emoji: '🚒', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['消防车', '救援', t('emojiSystem.colors.red')], source: 'system' },
  { id: 'object_013', name: '警车', emoji: '🚓', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['警车', '执法', '安全'], source: 'system' },
  { id: 'object_014', name: '出租车', emoji: '🚕', color: t('emojiSystem.colors.yellow'), category: 'objects', keywords: ['出租车', '载客', t('emojiSystem.colors.yellow')], source: 'system' },
  { id: 'object_015', name: '地铁', emoji: '🚇', color: t('emojiSystem.colors.purple'), category: 'objects', keywords: ['地铁', '地下', '城市'], source: 'system' },
  { id: 'object_016', name: '轻轨', emoji: '🚈', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['轻轨', '城市', '快速'], source: 'system' },
  { id: 'object_017', name: '高铁', emoji: '🚄', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['高铁', '高速', '现代'], source: 'system' },
  { id: 'object_018', name: '电车', emoji: '🚋', color: t('emojiSystem.colors.green'), category: 'objects', keywords: ['电车', '城市', '轨道'], source: 'system' },
  { id: 'object_019', name: '缆车', emoji: '🚠', color: t('emojiSystem.colors.purple'), category: 'objects', keywords: ['缆车', '山区', '观光'], source: 'system' },
  { id: 'object_020', name: '滑雪缆车', emoji: '🚡', color: t('emojiSystem.colors.purple'), category: 'objects', keywords: ['滑雪缆车', '雪山', '运动'], source: 'system' },
  { id: 'object_021', name: '游轮', emoji: '🛳️', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['游轮', '豪华', '旅游'], source: 'system' },
  { id: 'object_022', name: '快艇', emoji: '🚤', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['快艇', '速度', '水上'], source: 'system' },
  { id: 'object_023', name: '帆船', emoji: '⛵', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['帆船', '风力', '休闲'], source: 'system' },
  { id: 'object_024', name: '独木舟', emoji: '🛶', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['独木舟', '划桨', '探险'], source: 'system' },
  { id: 'object_025', name: '潜水艇', emoji: '🚢', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['潜水艇', '水下', '军事'], source: 'system' },

  // 电子设备类 (25个)
  { id: 'object_026', name: '手机', emoji: '📱', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['手机', '通讯', '智能'], source: 'system' },
  { id: 'object_027', name: '电脑', emoji: '💻', color: '银色', category: 'objects', keywords: ['电脑', '工作', '科技'], source: 'system' },
  { id: 'object_028', name: '平板', emoji: '📱', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['平板', '触屏', '便携'], source: 'system' },
  { id: 'object_029', name: '台式机', emoji: '🖥️', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['台式机', '办公', '大屏'], source: 'system' },
  { id: 'object_030', name: '键盘', emoji: '⌨️', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['键盘', '输入', '打字'], source: 'system' },
  { id: 'object_031', name: '鼠标', emoji: '🖱️', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['鼠标', '点击', '控制'], source: 'system' },
  { id: 'object_032', name: '打印机', emoji: '🖨️', color: t('emojiSystem.colors.purple'), category: 'objects', keywords: ['打印机', '文档', '办公'], source: 'system' },
  { id: 'object_033', name: '相机', emoji: '📷', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['相机', '摄影', '记录'], source: 'system' },
  { id: 'object_034', name: '摄像机', emoji: '📹', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['摄像机', '录像', '影像'], source: 'system' },
  { id: 'object_035', name: '耳机', emoji: '🎧', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['耳机', '音乐', '私人'], source: 'system' },
  { id: 'object_036', name: '音响', emoji: '🔊', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['音响', '声音', '音乐'], source: 'system' },
  { id: 'object_037', name: '麦克风', emoji: '🎤', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['麦克风', '录音', '演讲'], source: 'system' },
  { id: 'object_038', name: '游戏手柄', emoji: '🎮', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['游戏手柄', '游戏', '娱乐'], source: 'system' },
  { id: 'object_039', name: '电视', emoji: '📺', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['电视', '娱乐', '屏幕'], source: 'system' },
  { id: 'object_040', name: '收音机', emoji: '📻', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['收音机', '广播', '音频'], source: 'system' },
  { id: 'object_041', name: '录音机', emoji: '📼', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['录音机', '磁带', '复古'], source: 'system' },
  { id: 'object_042', name: 'CD播放器', emoji: '💿', color: t('emojiSystem.colors.brown'), category: 'objects', keywords: ['CD播放器', '音乐', '光盘'], source: 'system' },
  { id: 'object_043', name: 'DVD播放器', emoji: '📀', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['DVD播放器', '影像', '光盘'], source: 'system' },
  { id: 'object_044', name: '投影仪', emoji: '📽️', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['投影仪', '演示', '大屏'], source: 'system' },
  { id: 'object_045', name: '扫描仪', emoji: '🖨️', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['扫描仪', '数字化', '文档'], source: 'system' },
  { id: 'object_046', name: '传真机', emoji: '📠', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['传真机', '通讯', '办公'], source: 'system' },
  { id: 'object_047', name: '电话', emoji: '☎️', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['电话', '通讯', '座机'], source: 'system' },
  { id: 'object_048', name: '手表', emoji: '⌚', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['手表', '时间', '智能'], source: 'system' },
  { id: 'object_049', name: '闹钟', emoji: '⏰', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['闹钟', '时间', '提醒'], source: 'system' },
  { id: 'object_050', name: '计算器', emoji: '🧮', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['计算器', '数学', '计算'], source: 'system' }
];

// 扩展的表情类emoji（100个）
const emotionEmojis: UnifiedEmojiItem[] = [
  // 基础表情 (25个)
  { id: 'emotion_001', name: '开心', emoji: '😊', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['开心', '微笑', '愉快'], source: 'system' },
  { id: 'emotion_002', name: '大笑', emoji: '😂', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['大笑', '搞笑', '眼泪'], source: 'system' },
  { id: 'emotion_003', name: '爱心眼', emoji: '😍', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['爱心眼', '喜爱', '迷恋'], source: 'system' },
  { id: 'emotion_004', name: '飞吻', emoji: '😘', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['飞吻', '亲吻', '爱意'], source: 'system' },
  { id: 'emotion_005', name: '眨眼', emoji: '😉', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['眨眼', '调皮', '暗示'], source: 'system' },
  { id: 'emotion_006', name: '思考', emoji: '🤔', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['思考', '疑惑', '考虑'], source: 'system' },
  { id: 'emotion_007', name: '惊讶', emoji: '😮', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['惊讶', '震惊', '意外'], source: 'system' },
  { id: 'emotion_008', name: '害羞', emoji: '😳', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['害羞', '脸红', '尴尬'], source: 'system' },
  { id: 'emotion_009', name: '困倦', emoji: '😴', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['困倦', '睡觉', '疲倦'], source: 'system' },
  { id: 'emotion_010', name: '生气', emoji: '😠', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['生气', '愤怒', '不满'], source: 'system' },
  { id: 'emotion_011', name: '哭泣', emoji: '😢', color: t('emojiSystem.colors.blue'), category: 'emotions', keywords: ['哭泣', '伤心', '眼泪'], source: 'system' },
  { id: 'emotion_012', name: '恐惧', emoji: '😨', color: t('emojiSystem.colors.purple'), category: 'emotions', keywords: ['恐惧', '害怕', '惊吓'], source: 'system' },
  { id: 'emotion_013', name: '酷', emoji: '😎', color: t('emojiSystem.colors.gray'), category: 'emotions', keywords: ['酷', '墨镜', '帅气'], source: 'system' },
  { id: 'emotion_014', name: '恶魔', emoji: '😈', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['恶魔', '坏笑', '调皮'], source: 'system' },
  { id: 'emotion_015', name: '天使', emoji: '😇', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['天使', '纯洁', '善良'], source: 'system' },
  { id: 'emotion_016', name: '鬼脸', emoji: '😜', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['鬼脸', '调皮', '吐舌'], source: 'system' },
  { id: 'emotion_017', name: '无语', emoji: '🙄', color: t('emojiSystem.colors.gray'), category: 'emotions', keywords: ['无语', '翻白眼', '无奈'], source: 'system' },
  { id: 'emotion_018', name: '尴尬', emoji: '😅', color: t('emojiSystem.colors.yellow'), category: 'emotions', keywords: ['尴尬', '汗水', '紧张'], source: 'system' },
  { id: 'emotion_019', name: '疯狂', emoji: '🤪', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['疯狂', '古怪', '搞笑'], source: 'system' },
  { id: 'emotion_020', name: '恶心', emoji: '🤢', color: t('emojiSystem.colors.green'), category: 'emotions', keywords: ['恶心', '呕吐', '不适'], source: 'system' },
  { id: 'emotion_021', name: '发烧', emoji: '🤒', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['发烧', '生病', '温度计'], source: 'system' },
  { id: 'emotion_022', name: '头晕', emoji: '😵', color: t('emojiSystem.colors.purple'), category: 'emotions', keywords: ['头晕', '眩晕', '不适'], source: 'system' },
  { id: 'emotion_023', name: '口罩', emoji: '😷', color: t('emojiSystem.colors.blue'), category: 'emotions', keywords: ['口罩', '生病', '防护'], source: 'system' },
  { id: 'emotion_024', name: '机器人', emoji: '🤖', color: t('emojiSystem.colors.gray'), category: 'emotions', keywords: ['机器人', '科技', '人工智能'], source: 'system' },
  { id: 'emotion_025', name: '外星人', emoji: '👽', color: t('emojiSystem.colors.green'), category: 'emotions', keywords: ['外星人', t('emojiSystem.colors.green'), '神秘'], source: 'system' }

  // 这里会继续添加75个表情emoji...
];

// t('emojiSystem.comments.natureEmojis')
const natureEmojis: UnifiedEmojiItem[] = [
  // 天气现象 (25个)
  { id: 'nature_001', name: '太阳', emoji: '☀️', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['太阳', '阳光', '温暖'], source: 'system' },
  { id: 'nature_002', name: '月亮', emoji: '🌙', color: t('emojiSystem.colors.white'), category: 'nature', keywords: ['月亮', '夜晚', '弯月'], source: 'system' },
  { id: 'nature_003', name: '星星', emoji: '⭐', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['星星', '夜空', '闪亮'], source: 'system' },
  { id: 'nature_004', name: '彩虹', emoji: '🌈', color: '彩色', category: 'nature', keywords: ['彩虹', '雨后', '七色'], source: 'system' },
  { id: 'nature_005', name: '闪电', emoji: '⚡', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['闪电', '雷电', '能量'], source: 'system' },
  { id: 'nature_006', name: '雪花', emoji: '❄️', color: t('emojiSystem.colors.white'), category: 'nature', keywords: ['雪花', '冬天', '寒冷'], source: 'system' },
  { id: 'nature_007', name: '火焰', emoji: '🔥', color: t('emojiSystem.colors.red'), category: 'nature', keywords: ['火焰', '热量', '燃烧'], source: 'system' },
  { id: 'nature_008', name: '水滴', emoji: '💧', color: t('emojiSystem.colors.blue'), category: 'nature', keywords: ['水滴', '清洁', '纯净'], source: 'system' },
  { id: 'nature_009', name: '云朵', emoji: '☁️', color: t('emojiSystem.colors.white'), category: 'nature', keywords: ['云朵', '天空', t('emojiSystem.colors.white')], source: 'system' },
  { id: 'nature_010', name: '龙卷风', emoji: '🌪️', color: t('emojiSystem.colors.gray'), category: 'nature', keywords: ['龙卷风', '风暴', '旋转'], source: 'system' },
  { id: 'nature_011', name: '雨云', emoji: '🌧️', color: t('emojiSystem.colors.blue'), category: 'nature', keywords: ['雨云', '下雨', '阴天'], source: 'system' },
  { id: 'nature_012', name: '雷云', emoji: '⛈️', color: t('emojiSystem.colors.gray'), category: 'nature', keywords: ['雷云', '雷雨', '风暴'], source: 'system' },
  { id: 'nature_013', name: '雪云', emoji: '🌨️', color: t('emojiSystem.colors.purple'), category: 'nature', keywords: ['雪云', '下雪', '冬天'], source: 'system' },
  { id: 'nature_014', name: '雾', emoji: '🌫️', color: t('emojiSystem.colors.brown'), category: 'nature', keywords: ['雾', '朦胧', '湿润'], source: 'system' },
  { id: 'nature_015', name: '风', emoji: '💨', color: t('emojiSystem.colors.blue'), category: 'nature', keywords: ['风', '气流', '吹拂'], source: 'system' },
  { id: 'nature_016', name: '冰雹', emoji: '🧊', color: t('emojiSystem.colors.blue'), category: 'nature', keywords: ['冰雹', '冰块', '寒冷'], source: 'system' },
  { id: 'nature_017', name: '霜', emoji: '❄️', color: t('emojiSystem.colors.white'), category: 'nature', keywords: ['霜', '结冰', '清晨'], source: 'system' },
  { id: 'nature_018', name: '露水', emoji: '💧', color: t('emojiSystem.colors.blue'), category: 'nature', keywords: ['露水', '清晨', '新鲜'], source: 'system' },
  { id: 'nature_019', name: '日出', emoji: '🌅', color: t('emojiSystem.colors.red'), category: 'nature', keywords: ['日出', '黎明', '希望'], source: 'system' },
  { id: 'nature_020', name: '日落', emoji: '🌇', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['日落', '黄昏', '美丽'], source: 'system' },
  { id: 'nature_021', name: '满月', emoji: '🌕', color: t('emojiSystem.colors.white'), category: 'nature', keywords: ['满月', '圆月', '明亮'], source: 'system' },
  { id: 'nature_022', name: '新月', emoji: '🌑', color: t('emojiSystem.colors.gray'), category: 'nature', keywords: ['新月', '黑月', '开始'], source: 'system' },
  { id: 'nature_023', name: '上弦月', emoji: '🌓', color: t('emojiSystem.colors.brown'), category: 'nature', keywords: ['上弦月', '半月', '成长'], source: 'system' },
  { id: 'nature_024', name: '下弦月', emoji: '🌗', color: t('emojiSystem.colors.brown'), category: 'nature', keywords: ['下弦月', '半月', '减少'], source: 'system' },
  { id: 'nature_025', name: '流星', emoji: '🌠', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['流星', '许愿', '夜空'], source: 'system' }

  // 这里会继续添加75个自然emoji...
];

// 扩展emoji数据 - 添加更多分类和emoji
const activityEmojis: UnifiedEmojiItem[] = [
  { id: 'activity_001', name: '足球', emoji: '⚽', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['足球', '运动', '球类'], source: 'system' },
  { id: 'activity_002', name: '篮球', emoji: '🏀', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['篮球', '运动', '球类'], source: 'system' },
  { id: 'activity_003', name: '网球', emoji: '🎾', color: t('emojiSystem.colors.yellow'), category: 'objects', keywords: ['网球', '运动', '球类'], source: 'system' },
  { id: 'activity_004', name: '游戏手柄', emoji: '🎮', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['游戏', '手柄', '娱乐'], source: 'system' },
  { id: 'activity_005', name: '音乐', emoji: '🎵', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['音乐', '音符', '娱乐'], source: 'system' },
  { id: 'activity_006', name: '电影', emoji: '🎬', color: t('emojiSystem.colors.gray'), category: 'objects', keywords: ['电影', '拍摄', '娱乐'], source: 'system' },
  { id: 'activity_007', name: '艺术', emoji: '🎨', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['艺术', '绘画', '创作'], source: 'system' },
  { id: 'activity_008', name: '书籍', emoji: '📚', color: t('emojiSystem.colors.green'), category: 'objects', keywords: ['书籍', '学习', '知识'], source: 'system' },
  { id: 'activity_009', name: '奖杯', emoji: '🏆', color: t('emojiSystem.colors.yellow'), category: 'objects', keywords: ['奖杯', '胜利', '成就'], source: 'system' },
  { id: 'activity_010', name: '礼物', emoji: '🎁', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['礼物', '惊喜', '庆祝'], source: 'system' }
];

const travelEmojis: UnifiedEmojiItem[] = [
  { id: 'travel_001', name: '飞机', emoji: '✈️', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['飞机', '旅行', '交通'], source: 'system' },
  { id: 'travel_002', name: '火车', emoji: '🚂', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['火车', '旅行', '交通'], source: 'system' },
  { id: 'travel_003', name: '汽车', emoji: '🚗', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['汽车', '交通', '出行'], source: 'system' },
  { id: 'travel_004', name: '船', emoji: '⛵', color: t('emojiSystem.colors.white'), category: 'objects', keywords: ['船', '航海', '交通'], source: 'system' },
  { id: 'travel_005', name: '地图', emoji: '🗺️', color: t('emojiSystem.colors.green'), category: 'objects', keywords: ['地图', '导航', '旅行'], source: 'system' },
  { id: 'travel_006', name: '行李箱', emoji: '🧳', color: t('emojiSystem.colors.purple'), category: 'objects', keywords: ['行李箱', '旅行', '出行'], source: 'system' },
  { id: 'travel_007', name: '相机', emoji: '📷', color: t('emojiSystem.colors.black'), category: 'objects', keywords: ['相机', '拍照', '记录'], source: 'system' },
  { id: 'travel_008', name: '帐篷', emoji: '⛺', color: t('emojiSystem.colors.green'), category: 'objects', keywords: ['帐篷', '露营', '户外'], source: 'system' },
  { id: 'travel_009', name: '指南针', emoji: '🧭', color: t('emojiSystem.colors.red'), category: 'objects', keywords: ['指南针', '导航', '方向'], source: 'system' },
  { id: 'travel_010', name: '护照', emoji: '📘', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['护照', '旅行', '证件'], source: 'system' }
];

const symbolEmojis: UnifiedEmojiItem[] = [
  { id: 'symbol_001', name: '爱心', emoji: '❤️', color: t('emojiSystem.colors.red'), category: 'emotions', keywords: ['爱心', '爱情', '喜欢'], source: 'system' },
  { id: 'symbol_002', name: '星星', emoji: '⭐', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['星星', '闪亮', '优秀'], source: 'system' },
  { id: 'symbol_003', name: '闪电', emoji: '⚡', color: t('emojiSystem.colors.yellow'), category: 'nature', keywords: ['闪电', '能量', '快速'], source: 'system' },
  { id: 'symbol_004', name: '火焰', emoji: '🔥', color: t('emojiSystem.colors.red'), category: 'nature', keywords: ['火焰', '热情', '流行'], source: 'system' },
  { id: 'symbol_005', name: '钻石', emoji: '💎', color: t('emojiSystem.colors.blue'), category: 'objects', keywords: ['钻石', '珍贵', '闪亮'], source: 'system' },
  { id: 'symbol_006', name: '皇冠', emoji: '👑', color: '金色', category: 'objects', keywords: ['皇冠', '王者', '尊贵'], source: 'system' },
  { id: 'symbol_007', name: '魔法', emoji: '✨', color: '金色', category: 'nature', keywords: ['魔法', '闪烁', '神奇'], source: 'system' },
  { id: 'symbol_008', name: '彩虹', emoji: '🌈', color: '彩色', category: 'nature', keywords: ['彩虹', '美丽', '希望'], source: 'system' },
  { id: 'symbol_009', name: '钥匙', emoji: '🔑', color: '金色', category: 'objects', keywords: ['钥匙', '解锁', '重要'], source: 'system' },
  { id: 'symbol_010', name: '盾牌', emoji: '🛡️', color: '银色', category: 'objects', keywords: ['盾牌', '保护', '安全'], source: 'system' }
];

// 统一emoji数据存储 - 恢复既有本地精选数据（≈330个）
let unifiedEmojiData: UnifiedEmojiItem[] = [
  ...animalEmojis,
  ...foodEmojis,
  ...objectEmojis,
  ...emotionEmojis,
  ...natureEmojis,
  ...activityEmojis,
  ...travelEmojis,
  ...symbolEmojis
];

// 原始分类到统一分类的映射（用于补齐）
function mapRawCategory(raw: string): UnifiedEmojiItem['category'] {
  if (!raw) return 'objects';
  const r = raw.toLowerCase();
  if (r.includes('smiley') || r.includes('emotion')) return 'emotions';
  if (r.includes('animal')) return 'animals';
  if (r.includes('nature')) return 'nature';
  if (r.includes('food') || r.includes('drink')) return 'food';
  // 其他（activities, travel_places, objects, symbols, flags）归为 objects
  return 'objects';
}

// 类别主题色（用于补齐条目的默认底色）
const CATEGORY_COLORS: Record<UnifiedEmojiItem['category'], string> = {
  animals: t('emojiSystem.colors.red'),
  food: t('emojiSystem.colors.blue'),
  objects: t('emojiSystem.colors.purple'),
  emotions: t('emojiSystem.colors.green'),
  nature: t('emojiSystem.colors.yellow')
};

// 确保每个主分类至少 minCount 个（去重补齐）
function ensureMinimumPerCategory(minCount = 100) {
  const raw = getRawEmojiJson();
  if (!raw || !Array.isArray(raw)) return;

  // 现有集合：用“emoji字符”去重
  const seen = new Set(unifiedEmojiData.map(e => `${e.emoji}|${e.name}`));

  const buckets: Record<UnifiedEmojiItem['category'], UnifiedEmojiItem[]> = {
    animals: [], food: [], objects: [], emotions: [], nature: []
  };

  // 将原始数据映射进入候选池
  raw.forEach((e, idx) => {
    try {
      const cat = mapRawCategory(e.category);
      const emojiChar = getEmojiUnicode(e.unified);
      const candidate: UnifiedEmojiItem = {
        id: `extra_${cat}_${e.unified || idx}`,
        name: e.short_name || e.short_names?.[0] || `emoji_${idx}`,
        emoji: emojiChar,
        color: CATEGORY_COLORS[cat],
        category: cat,
        keywords: e.keywords || [],
        source: 'system'
      };
      if (!seen.has(`${candidate.emoji}|${candidate.name}`)) {
        buckets[cat].push(candidate);
      }
    } catch { /* noop */ }
  });

  // 逐类补齐
  (Object.keys(buckets) as Array<UnifiedEmojiItem['category']>).forEach(cat => {
    const current = unifiedEmojiData.filter(e => e.category === cat);
    let i = 0;
    while (current.length + i < minCount && i < buckets[cat].length) {
      unifiedEmojiData.push(buckets[cat][i]);
      i++;
    }
  });
}

// 初始化：在恢复的基础上进行补齐并做数据质检
ensureMinimumPerCategory(110);
runDataQualityPass();
// 质检后再补齐一轮，确保去重后仍满足 >100
ensureMinimumPerCategory(110);

/** 数据质量检查与修复 */
function runDataQualityPass() {
  // 1) 删除重复emoji（按 emoji 字符去重，保留首次）
  const seenEmoji = new Set<string>();
  unifiedEmojiData = unifiedEmojiData.filter(e => {
    const key = e.emoji;
    if (seenEmoji.has(key)) return false;
    seenEmoji.add(key);
    return true;
  });

  // 2) 修正名称-字符错配（示例：🥟 应为“饺子”，去掉把🥟命名为“包子”的条目）
  unifiedEmojiData = unifiedEmojiData.filter(e => {
    if (e.emoji === '🥟' && e.name.includes('包子')) return false; // 删除错误命名
    return true;
  });

  // 3) 自然类去重：移除重复“彩虹”
  let rainbowKept = false;
  unifiedEmojiData = unifiedEmojiData.filter(e => {
    if (e.emoji === '🌈') {
      if (!rainbowKept) { rainbowKept = true; return true; }
      return false; // 只保留一个彩虹
    }
    return true;
  });

  // 4) 明确的分类覆写与规则性纠偏（避免“小龙虾”被归到神话等误归类）
  const OVERRIDE_CATEGORY_NAME_MAP: Record<string, UnifiedEmojiItem['category']> = {
    '雪花': 'nature',
    '小龙虾': 'animals',
    '龙虾': 'animals',
    '螃蟹': 'animals'
  };
  const aquaticTokens = ['虾','龙虾','蟹','螃蟹','鱼','鲸','海豚','章鱼','水母','鳄鱼','乌龟','海马','海狮','海豹'];
  const weatherTokens = ['雪','雨','雷','风','云','彩虹','闪电','雾','冰雹','霜','露'];
  const foodTokens = ['饺子','寿司','披萨','汉堡','面','饭','汤','蛋糕','甜甜圈','咖啡','茶','酒','热狗','薯条','米饭','拉面','意面'];

  function inferCategory(e: UnifiedEmojiItem): UnifiedEmojiItem['category'] | null {
    if (OVERRIDE_CATEGORY_NAME_MAP[e.name]) return OVERRIDE_CATEGORY_NAME_MAP[e.name];
    const name = e.name || '';
    if (aquaticTokens.some(t => name.includes(t))) return 'animals';
    if (weatherTokens.some(t => name.includes(t))) return 'nature';
    if (foodTokens.some(t => name.includes(t))) return 'food';
    return null;
  }

  unifiedEmojiData = unifiedEmojiData.map(e => {
    const inferred = inferCategory(e);
    if (inferred && inferred !== e.category) {
      return { ...e, category: inferred };
    }
    return e;
  });

  // 5) 首项异常清理：移除异常的“合”或其他非期望的首项（如出现单个汉字且不是表情字符）
  if (unifiedEmojiData.length > 0) {
    const first = unifiedEmojiData[0];
    if (/^[\u4e00-\u9fa5]$/.test(first.emoji)) {
      unifiedEmojiData.shift();
    }
  }
}

/**
 * 检测当前平台类型
 */
export function detectPlatform(): PlatformType {
  if (typeof window === 'undefined') return 'desktop';

  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) ||
    (window.innerWidth >= 768 && window.innerWidth <= 1024);

  if (isMobile && !isTablet) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * 获取自适应emoji尺寸配置
 */
export function getAdaptiveEmojiSize(
  context: EmojiUsageContext,
  platform?: PlatformType
): EmojiSizeConfig {
  const currentPlatform = platform || detectPlatform();
  return EMOJI_SIZE_CONFIG[context][currentPlatform];
}

/**
 * 生成自适应emoji样式
 */
export function generateEmojiStyle(
  context: EmojiUsageContext,
  platform?: PlatformType,
  customStyles?: Partial<EmojiSizeConfig> | React.CSSProperties
): React.CSSProperties {
  const config = getAdaptiveEmojiSize(context, platform);

  return {
    fontSize: config.fontSize,
    width: config.width,
    height: config.height,
    lineHeight: config.lineHeight,
    padding: config.padding,
    borderRadius: config.borderRadius,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(customStyles as React.CSSProperties)
  };
}

// 颜色描述到CSS颜色值的映射 - 使用函数初始化
function createColorNameToCSSMap() {
  return {
    [t('emojiSystem.colors.red')]: '#FF4444',
    [t('emojiSystem.colors.blue')]: '#4444FF',
    [t('emojiSystem.colors.green')]: '#44AA44',
    [t('emojiSystem.colors.yellow')]: '#FFCC00',
    [t('emojiSystem.colors.purple')]: '#AA44AA',
    [t('emojiSystem.colors.brown')]: '#8B4513',
    [t('emojiSystem.colors.gray')]: '#888888',
    [t('emojiSystem.colors.white')]: '#F5F5F5',
    [t('emojiSystem.colors.black')]: '#333333',
    [t('emojiSystem.colors.orange')]: '#FF8800',
    [t('emojiSystem.colors.pink')]: '#FF69B4',
    '彩色': '#FF6B6B',
    '金色': '#FFD700',
    '银色': '#C0C0C0',
    [t('emojiSystem.colors.blackWhite')]: '#666666'
  };
}

/**
 * 生成emoji的SVG表示（用于头像生成）
 */
export function generateEmojiSVG(emoji: UnifiedEmojiItem, size: number = 200): string {
  // 为了确保每次生成的dataURL不同（避免缓存/重渲染问题），引入唯一标识
  const uid = `${emoji.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // 将颜色描述转换为CSS颜色值
  const colorMap = createColorNameToCSSMap();
  const cssColor = colorMap[emoji.color] || '#4444FF';

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" data-uid="${uid}">
      <defs>
        <linearGradient id="bg-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${cssColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${cssColor}dd;stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#bg-${uid})" />
      <text x="100" y="130" font-size="80" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${emoji.emoji}</text>
    </svg>
  `;
  // 处理Unicode到Base64编码，避免btoa的Unicode问题
  const base64 = typeof window !== 'undefined'
    ? window.btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg, 'utf-8').toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * 获取所有emoji
 */
export function getAllEmojis(): UnifiedEmojiItem[] {
  return unifiedEmojiData;
}

/**
 * 按分类获取emoji
 */
export function getEmojisByCategory(category: string): UnifiedEmojiItem[] {
  return unifiedEmojiData.filter(emoji => emoji.category === category);
}

/**
 * 搜索emoji
 */
export function searchEmojis(query: string): UnifiedEmojiItem[] {
  const lowerQuery = query.toLowerCase();
  return unifiedEmojiData.filter(emoji => 
    emoji.name.toLowerCase().includes(lowerQuery) ||
    emoji.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 随机获取emoji
 */
export function getRandomEmojis(count: number = 1, category?: string): UnifiedEmojiItem[] {
  const sourceEmojis = category ? getEmojisByCategory(category) : unifiedEmojiData;
  const shuffled = [...sourceEmojis].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 获取分类信息
 */
export function getCategories(): EmojiCategory[] {
  // 动态根据数据源计算各分类数量，避免与静态配置不一致
  const counts: Record<string, number> = {};
  for (const e of unifiedEmojiData) {
    counts[e.category] = (counts[e.category] || 0) + 1;
  }
  return emojiCategories.map(cat => ({ ...cat, count: counts[cat.id] || 0 }));
}

/**
 * 添加自定义emoji
 */
export function addCustomEmoji(emoji: Omit<UnifiedEmojiItem, 'id' | 'createdAt'>): UnifiedEmojiItem {
  const newEmoji: UnifiedEmojiItem = {
    ...emoji,
    id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    source: 'user'
  };

  unifiedEmojiData.push(newEmoji);
  return newEmoji;
}

/** 子分类规则：用于更细粒度的筛选 */
// 辅助匹配：仅按关键词匹配，避免名称子串误伤（例如“雪花”被“花”命中）
const hasAnyKeyword = (e: UnifiedEmojiItem, tokens: string[]) => (e.keywords || []).some(k => tokens.includes(k));
const nameInSet = (e: UnifiedEmojiItem, names: string[]) => names.includes(e.name);

const SUBCATEGORY_RULES: Record<UnifiedEmojiItem['category'], Array<{ id: string; name: string; match: (e: UnifiedEmojiItem) => boolean }>> = {
  animals: [
    { id: 'mammals', name: '哺乳', match: e => /猫|狗|熊|兔|狐|熊猫|猴|虎|狮|牛|猪|羊|马|鼠|仓鼠|考拉|袋鼠|浣熊|獾|水獭|猩猩|黑猩猩|狐猴/.test(e.name) },
    { id: 'birds', name: '鸟类', match: e => /鸟|企鹅|鸡|鸭|鹅|鸽/.test(e.name) },
    { id: 'aquatic', name: '水生', match: e => /鱼|海|鲸|豚|章鱼|水母|海狮|海豹|鲨|鳐|海马|海星|海胆|贝壳|虾|龙虾|蟹|螃蟹/.test(e.name) },
    { id: 'insects', name: '昆虫', match: e => /蝴蝶|蜜蜂|瓢虫|蜘蛛|蝎|蚊|苍蝇|蚂蚁|蚱蜢|蟋蟀|蜻蜓|飞蛾|甲虫|毛虫/.test(e.name) },
    { id: 'myth', name: '神话', match: e => nameInSet(e, ['龙','独角兽','凤凰','麒麟','天马']) },
    { id: 'other', name: '其他', match: e => true }
  ],
  food: [
    { id: 'fruit', name: '水果', match: e => /苹果|香蕉|橙|草莓|西瓜|桃|菠萝|芒果|柠檬|椰子|猕猴桃|葡萄/.test(e.name) },
    { id: 'dessert', name: '甜点', match: e => /蛋糕|甜甜圈|冰淇淋|棒棒糖|巧克力|饼干|布丁|果冻|松饼|华夫|煎饼/.test(e.name) },
    { id: 'drink', name: '饮品', match: e => /咖啡|茶|牛奶|果汁|汽水|啤酒|红酒|香槟|鸡尾酒|热带饮品|奶昔|气泡水/.test(e.name) },
    { id: 'cooked', name: '熟食', match: e => /汉堡|披萨|热狗|薯条|爆米花|面包|法棍|羊角包|椒盐卷饼|贝果|奶酪|鸡蛋|煎蛋|培根|香肠|鸡肉|牛排|火腿|寿司|拉面|意面|米饭|咖喱|炒饭|饺子|包子|春卷|玉米饼|墨西哥卷|三明治|汤|炖菜|火锅|面条|年糕|月饼|粽子|汤圆/.test(e.name) },
    { id: 'other', name: '其他', match: e => true }
  ],
  objects: [
    { id: 'vehicle', name: '交通', match: e => /车|飞机|火车|自行车|船/.test(e.name) },
    { id: 'device', name: '设备', match: e => /闹钟|计算器|相机|电视|耳机|键盘|鼠标|手机|电脑/.test(e.name) },
    { id: 'tool', name: '工具', match: e => /钥匙|盾牌|钻石|书籍|奖杯|礼物/.test(e.name) },
    { id: 'other', name: '其他', match: e => true }
  ],
  emotions: [
    { id: 'happy', name: '积极', match: e => /开心|大笑|爱|爱心|喜|微笑|飞吻/.test(e.name) },
    { id: 'negative', name: '消极', match: e => /哭|伤|怒|生气|烦|恐|惊/.test(e.name) },
    { id: 'love', name: '爱情', match: e => /爱|心|吻/.test(e.name) },
    { id: 'other', name: '其他', match: e => true }
  ],
  nature: [
    // 严格规则：天气仅匹配天气相关关键词或精确名称；植物不再使用名称模糊匹配“花”，避免“雪花”被误归类
    { id: 'weather', name: '天气', match: e => (
      nameInSet(e, ['太阳','月亮','星星','彩虹','闪电','火焰','云朵','龙卷风','雨云','雷云','雪云','雾','风','冰雹','霜','露水','日出','日落','满月','新月','上弦月','下弦月','流星'])
      || hasAnyKeyword(e, ['天气','太阳','月亮','星星','彩虹','闪电','火焰','云','雨','雪','雷','风','雾','冰','霜','露','日出','日落','夜空','天体','气象'])
    ) },
    { id: 'plant', name: '植物', match: e => (
      nameInSet(e, ['花','树','叶','草','森林']) || hasAnyKeyword(e, ['花','树','叶','草','森林','植物','绿植','花朵','树木'])
    ) },
    { id: 'astro', name: '天体', match: e => (
      nameInSet(e, ['太阳','月亮','星星','满月','新月','上弦月','下弦月','流星']) || hasAnyKeyword(e, ['天体','宇宙','星球','月亮','太阳','夜空'])
    ) },
    { id: 'other', name: '其他', match: e => true }
  ]
};

export function getSubcategories(category: UnifiedEmojiItem['category']): Array<{ id: string; name: string; count: number }> {
  const rules = SUBCATEGORY_RULES[category] || [];
  const positives = rules.filter(r => r.id !== 'other');
  const otherRule = rules.find(r => r.id === 'other');

  const positiveSets = positives.map(r => unifiedEmojiData.filter(e => e.category === category && r.match(e)));
  const positiveIds = new Set<string>();
  positiveSets.forEach(list => list.forEach(e => positiveIds.add(e.id)));

  const otherCount = otherRule
    ? unifiedEmojiData.filter(e => e.category === category && !positiveIds.has(e.id)).length
    : 0;

  const result = [
    ...positives.map(r => ({ id: r.id, name: r.name, count: unifiedEmojiData.filter(e => e.category === category && r.match(e)).length })),
    ...(otherRule ? [{ id: 'other', name: otherRule.name, count: otherCount }] : [])
  ];

  return result.filter(sc => sc.count > 0);
}

export function matchesSubcategory(e: UnifiedEmojiItem, category: UnifiedEmojiItem['category'], subId: string): boolean {
  const rules = SUBCATEGORY_RULES[category] || [];
  if (subId === 'other') {
    // 其他 = 不属于任何正向子类
    const positives = rules.filter(r => r.id !== 'other');
    return e.category === category && !positives.some(r => r.match(e));
  }
  const rule = rules.find(r => r.id === subId);
  return !!rule && e.category === category && rule.match(e);
}

/**
 * 更新emoji数据
 */
export function updateEmojiData(newData: UnifiedEmojiItem[]): void {
  unifiedEmojiData = newData;
}

/**
 * 获取emoji统计信息
 */
export function getEmojiStats() {
  const stats = {
    total: unifiedEmojiData.length,
    byCategory: {} as Record<string, number>,
    bySource: {} as Record<string, number>
  };
  
  unifiedEmojiData.forEach(emoji => {
    stats.byCategory[emoji.category] = (stats.byCategory[emoji.category] || 0) + 1;
    stats.bySource[emoji.source] = (stats.bySource[emoji.source] || 0) + 1;
  });
  
  return stats;
}

export default {
  getAllEmojis,
  getEmojisByCategory,
  searchEmojis,
  getRandomEmojis,
  getCategories,
  addCustomEmoji,
  updateEmojiData,
  getEmojiStats,
  generateEmojiSVG,
  detectPlatform,
  getAdaptiveEmojiSize,
  generateEmojiStyle
};
