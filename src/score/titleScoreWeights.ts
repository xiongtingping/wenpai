/**
 * ✅ V3.3 标题评分权重配置 - 增强版
 * 🎯 优化权重分配，强化语义相关性和语序正确性
 * 
 */
export const V3_3_TITLE_SCORE_WEIGHTS = {
  semanticRelevance: 0.50,        // 主旨拟合度 (50%) - 标题与原文内容的语义相似度
  emotionalAppeal: 0.20,          // 情绪吸引力 (20%) - 冲突感、对比感、转变、情绪词
  structuralDiversity: 0.15,      // 表达结构多样性 (15%) - 避免重复句式结构
  semanticCompleteness: 0.10,     // 语义完整性 (10%) - 防止残词和未闭合表达
  characterUtilization: 0.05      // 字符利用率 (5%) - 接近平台字符上限，信息密度高
} as const;

/**
 * ✅ V3.3 标题评分系统配置 - 增强版
 * 🎯 与 src/utils/titleGenerationUtils.ts 中的 TITLE_SCORING_V3_3_CONFIG 保持同步
 */
export const TITLE_SCORING_V3_3_CONFIG = {
  outputCount: 5,
  ensureDiversity: true,
  scoringWeights: V3_3_TITLE_SCORE_WEIGHTS,
  semanticCompleteness: {
    // 语义完整性检查规则
    badEndings: [
      '、', '的', '是', '我', '和', '让', '要', '在', '对', '为', '把', '给', '向',
      '从', '到', '由', '被', '得', '着', '过', '了', '吗', '呢', '啊', '哦', '吧',
      '这', '那', '它', '他', '她', '们', '个', '种', '些', '点', '下', '上', '里',
      '外', '前', '后', '左', '右', '中', '间', '边', '面', '方', '向', '位', '处'
    ],
    // 好的结尾
    goodEndings: ['了', '的', '！', '？', '。', '吧', '呢', '啊', '哦', '呢', '吧'],
    // 禁止的残词
    prohibitedWords: ['文', '工', '图', '说', '表', '…', '...'],
    // 语序异常模式
    brokenPatterns: [
      '让我小红书', '小红书优化', '工具帮我', '发现宝藏AI', '优化关键',
      '台、文', '小红书优化关键', '工具帮我小红书', '让我小红书优化',
      '小红书优化工具', '工具帮我优化', '优化小红书', '小红书工具',
      '工具小红书', '小红书帮我', '帮我小红书', '优化小红书工具',
      '小红书工具帮我', '工具小红书优化', '优化工具小红书'
    ]
  }
} as const;
