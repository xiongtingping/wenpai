/**
 * 标题风格分类配置
 * 定义5种标题风格及其特征和生成模板
 */

export interface TitleStyleTemplate {
  id: string;
  name: string;
  description: string;
  minLength: number;
  pattern: string;
  keywords: string[];
  emotionalBoost: number; // 情绪吸引力加成
  examples: string[];
}

/**
 * 5种标题风格配置
 */
export const TITLE_STYLE_TEMPLATES: Record<string, TitleStyleTemplate> = {
  // 1. 结果+情绪型 (10字+)
  resultEmotion: {
    id: 'resultEmotion',
    name: '结果+情绪型',
    description: '强调使用结果 + 情感评价',
    minLength: 10,
    pattern: '用了[工具]后，[结果][情绪词]',
    keywords: ['用了', '后', '让我', '真的', '太', '惊艳', '效率', '提升'],
    emotionalBoost: 0.3,
    examples: [
      '用了这个工具后，效率提升3倍',
      '试用AI助手后，真的太惊艳了',
      '用了文案神器后，让我工作轻松多了'
    ]
  },

  // 2. 提问钩子型 (8字+)
  questionHook: {
    id: 'questionHook',
    name: '提问钩子型',
    description: '用好奇心驱动点击',
    minLength: 8,
    pattern: '为什么/如何/什么[问题]？',
    keywords: ['为什么', '如何', '怎么', '什么', '哪个', '是否'],
    emotionalBoost: 0.2,
    examples: [
      '为什么大家都在用这个工具？',
      '如何快速提升写作效率？',
      '什么工具能解决文案难题？'
    ]
  },

  // 3. 原因+行动型 (10字+)
  reasonAction: {
    id: 'reasonAction',
    name: '原因+行动型',
    description: '讲述为什么用 + 得到了什么',
    minLength: 10,
    pattern: '因为[痛点]，我用了[工具]，[结果]',
    keywords: ['因为', '所以', '让我', '帮我', '解决', '实现', '获得'],
    emotionalBoost: 0.25,
    examples: [
      '因为文案效率低，我用了AI助手，节省3小时',
      '写作痛苦让我找到了这个神器',
      '因为需求紧急，用这个工具帮我完成了'
    ]
  },

  // 4. 体验+反差型 (12字+)
  experienceContrast: {
    id: 'experienceContrast',
    name: '体验+反差型',
    description: '从"以前"到"现在"的转变',
    minLength: 12,
    pattern: '以前[痛点]，现在用[工具][结果]',
    keywords: ['以前', '现在', '从', '到', '原来', '没想到', '竟然', '居然'],
    emotionalBoost: 0.35,
    examples: [
      '以前写文案3小时，现在用AI只需10分钟',
      '从手写到AI辅助，效率提升10倍',
      '原来写作这么简单，没想到这个工具这么强'
    ]
  },

  // 5. 工具+明确价值型 (8字+)
  toolValue: {
    id: 'toolValue',
    name: '工具+明确价值型',
    description: '工具名称 + 功能/收益',
    minLength: 8,
    pattern: '[工具名] + [具体功能/价值]',
    keywords: ['帮我', '让我', '提升', '节省', '优化', '改善', '解决'],
    emotionalBoost: 0.2,
    examples: [
      'AI写作助手，让文案效率翻倍',
      '文派智能工具，帮我节省3小时',
      '这个AI神器，解决了我的写作难题'
    ]
  }
};

/**
 * 根据内容特征推荐标题风格
 */
export function recommendTitleStyles(content: string): string[] {
  const styles: string[] = [];

  // 检测内容特征
  const hasToolName = /AI|工具|软件|平台|助手|神器/.test(content);
  const hasPainPoint = /痛点|难题|问题|困难|挑战/.test(content);
  const hasResult = /效率|提升|改善|优化|节省|翻倍/.test(content);
  const hasEmotion = /惊艳|震撼|完美|太好|真的|没想到/.test(content);
  const hasContrast = /以前|现在|原来|之前|从.*到/.test(content);

  // 根据特征推荐风格
  if (hasResult && hasEmotion) {
    styles.push('resultEmotion');
  }

  if (hasPainPoint) {
    styles.push('questionHook', 'reasonAction');
  }

  if (hasContrast) {
    styles.push('experienceContrast');
  }

  if (hasToolName) {
    styles.push('toolValue');
  }

  // 如果没有明显特征，返回所有风格
  if (styles.length === 0) {
    return Object.keys(TITLE_STYLE_TEMPLATES);
  }

  return styles;
}

/**
 * 验证标题是否符合某种风格
 */
export function validateTitleStyle(title: string, styleId: string): boolean {
  const template = TITLE_STYLE_TEMPLATES[styleId];
  if (!template) return false;

  // 检查长度要求
  if (title.length < template.minLength) return false;

  // 检查关键词覆盖
  const keywordMatches = template.keywords.filter(keyword => title.includes(keyword));
  return keywordMatches.length > 0;
}

/**
 * 获取标题的风格匹配度
 */
export function getTitleStyleScore(title: string, styleId: string): number {
  const template = TITLE_STYLE_TEMPLATES[styleId];
  if (!template) return 0;

  let score = 0.5; // 基础分

  // 长度匹配度
  if (title.length >= template.minLength) {
    score += 0.2;
  }

  // 关键词覆盖度
  const keywordMatches = template.keywords.filter(keyword => title.includes(keyword));
  const keywordCoverage = keywordMatches.length / template.keywords.length;
  score += keywordCoverage * 0.3;

  return Math.min(score, 1.0);
}

export default TITLE_STYLE_TEMPLATES;
