/**
 * 随机昵称生成器
 * 使用互联网热梗词汇生成有趣的昵称
 */

// 热梗词汇库
const HOT_TRENDS = {
  // 形容词
  adjectives: [
    '超级', '无敌', '宇宙', '银河', '星际', '量子', '赛博', '数字', '智能', '未来',
    '复古', '经典', '传奇', '神话', '史诗', '王者', '大师', '专家', '达人', '高手',
    '神秘', '奇妙', '神奇', '魔法', '梦幻', '童话', '浪漫', '温馨', '可爱', '萌系',
    '酷炫', '帅气', '美丽', '优雅', '精致', '完美', '极致', '顶级', '豪华', '尊贵',
    '自由', '独立', '勇敢', '坚强', '乐观', '积极', '阳光', '温暖', '善良', '真诚'
  ],
  
  // 名词
  nouns: [
    // 动物类
    '熊猫', '猫咪', '狗狗', '兔子', '仓鼠', '龙猫', '小鹿', '海豚', '鲸鱼', '企鹅',
    '考拉', '袋鼠', '树懒', '刺猬', '松鼠', '狐狸', '狼', '虎', '狮子', '大象',
    
    // 食物类
    '奶茶', '咖啡', '蛋糕', '冰淇淋', '巧克力', '糖果', '饼干', '面包', '披萨', '汉堡',
    '寿司', '拉面', '火锅', '烧烤', '炸鸡', '薯条', '爆米花', '棉花糖', '果冻', '布丁',
    
    // 科技类
    '程序猿', '码农', '黑客', '极客', '工程师', '科学家', '研究员', '发明家', '创客', '玩家',
    '主播', 'UP主', '博主', '网红', '明星', '偶像', '艺术家', '设计师', '摄影师', '作家',
    
    // 自然类
    '星辰', '月亮', '太阳', '彩虹', '雪花', '雨滴', '云朵', '风', '海', '山',
    '森林', '花园', '草原', '沙漠', '冰川', '火山', '瀑布', '溪流', '湖泊', '海洋',
    
    // 抽象概念
    '梦想', '希望', '快乐', '幸福', '爱情', '友情', '亲情', '青春', '回忆', '未来',
    '时光', '岁月', '人生', '命运', '缘分', '奇迹', '魔法', '童话', '传说', '神话'
  ],
  
  // 后缀
  suffixes: [
    '君', '酱', '桑', '先生', '小姐', '大人', '殿下', '陛下', '王子', '公主',
    '侠', '客', '者', '师', '家', '手', '员', '生', '长', '王',
    '控', '迷', '粉', '党', '派', '团', '队', '组', '班', '社',
    '星', '神', '仙', '魔', '鬼', '怪', '精', '灵', '使', '者'
  ],
  
  // 数字
  numbers: [
    '001', '007', '123', '666', '888', '999', '2024', '2025', '520', '1314',
    '233', '666', '777', '888', '999', '1001', '2020', '2021', '2022', '2023'
  ]
};

/**
 * 从数组中随机选择一个元素
 */
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 生成随机昵称
 * @param style 昵称风格：'simple' | 'trendy' | 'creative'
 * @returns 生成的昵称
 */
export function generateNickname(style: 'simple' | 'trendy' | 'creative' = 'trendy'): string {
  switch (style) {
    case 'simple':
      // 简单风格：形容词 + 名词
      return randomChoice(HOT_TRENDS.adjectives) + randomChoice(HOT_TRENDS.nouns);
    
    case 'trendy':
      // 潮流风格：形容词 + 名词 + 后缀
      return randomChoice(HOT_TRENDS.adjectives) + randomChoice(HOT_TRENDS.nouns) + randomChoice(HOT_TRENDS.suffixes);
    
    case 'creative':
      // 创意风格：名词 + 数字
      return randomChoice(HOT_TRENDS.nouns) + randomChoice(HOT_TRENDS.numbers);
    
    default:
      return randomChoice(HOT_TRENDS.adjectives) + randomChoice(HOT_TRENDS.nouns);
  }
}

/**
 * 生成多个昵称供用户选择
 * @param count 生成数量
 * @returns 昵称数组
 */
export function generateNicknameOptions(count: number = 6): string[] {
  const nicknames = new Set<string>();
  
  while (nicknames.size < count) {
    const style = randomChoice(['simple', 'trendy', 'creative'] as const);
    nicknames.add(generateNickname(style));
  }
  
  return Array.from(nicknames);
}

/**
 * 验证昵称是否合适
 * @param nickname 昵称
 * @returns 是否合适
 */
export function validateNickname(nickname: string): boolean {
  // 长度检查
  if (nickname.length < 2 || nickname.length > 20) {
    return false;
  }
  
  // 字符检查（只允许中文、英文、数字）
  const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
  if (!validPattern.test(nickname)) {
    return false;
  }
  
  // 敏感词检查（这里可以添加更多敏感词）
  const sensitiveWords = ['admin', 'root', 'system', 'test', 'guest'];
  const lowerNickname = nickname.toLowerCase();
  if (sensitiveWords.some(word => lowerNickname.includes(word))) {
    return false;
  }
  
  return true;
} 