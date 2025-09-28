/**
 * 内容形式配置
 * 定义四大内容分类和具体形式
 */

import i18n from '@/i18n';

// 创建t函数快捷方式
const t = (key: string) => i18n.t(key);

export interface ContentForm {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'image-text' | 'video' | 'interview' | 'insight';
  outputType: string;
  characteristics: string[];
  structure: string[];
  examples: string[];
}

export interface ContentCategory {
  id: 'image-text' | 'video' | 'interview' | 'insight';
  name: string;
  description: string;
  icon: string;
  outputDescription: string;
  forms: ContentForm[];
}

/**
 * t('contentForms.comments.imageTextForms')
 */
const imageTextForms: ContentForm[] = [
  {
    id: 'image-text-planting',
    name: t('contentForms.names.imageTextPlanting'),
    description: t('contentForms.descriptions.imageTextPlanting'),
    icon: '🌱',
    category: 'image-text',
    outputType: t('contentForms.outputTypes.pureText'),
    characteristics: [
      '第一人称真实体验',
      '自然亲切的语言',
      '融合emoji表达',
      '评论互动引导',
      '种草推荐语气'
    ],
    structure: [
      '开头：吸引注意的钩子',
      '体验：详细使用感受',
      '亮点：产品核心优势',
      '总结：推荐理由和建议'
    ],
    examples: [
      '姐妹们！这个面膜我用了一个月，真的太惊喜了！',
      '作为一个敏感肌，我终于找到了适合的护肤品',
      '这款产品让我从路人变女神，必须安利给大家'
    ]
  },
  {
    id: 'dry-goods-analysis',
    name: '干货拆解',
    description: '知识结构清晰、分点呈现，表达精炼，常见于教育类或知识科普内容',
    icon: '📚',
    category: 'image-text',
    outputType: t('contentForms.outputTypes.pureText'),
    characteristics: [
      '知识结构清晰',
      '分点条理呈现',
      '表达精炼准确',
      '教育科普导向',
      '实用性强'
    ],
    structure: [
      '标题：明确知识点',
      '概述：整体框架介绍',
      '分点：详细知识拆解',
      '总结：要点回顾和应用'
    ],
    examples: [
      '5个步骤教你快速掌握时间管理',
      '新手必看：理财入门完整指南',
      '职场沟通技巧：让你事半功倍的方法'
    ]
  },
  {
    id: 'knowledge-card',
    name: '知识卡片',
    description: '精简内容，适合一图一语传播，语言直观，重点突出，利于收藏',
    icon: '🎯',
    category: 'image-text',
    outputType: t('contentForms.outputTypes.pureText'),
    characteristics: [
      '内容精简扼要',
      '一图一语设计',
      '语言直观易懂',
      '重点突出明确',
      '便于收藏分享'
    ],
    structure: [
      '核心观点：一句话概括',
      '关键信息：3-5个要点',
      '记忆点：便于记住的表达',
      '行动指导：具体可执行建议'
    ],
    examples: [
      '今日金句：成功不是终点，失败不是终结',
      '一分钟学会：高效沟通的3个技巧',
      '职场必知：这5个习惯让你脱颖而出'
    ]
  },
  {
    id: 'case-analysis',
    name: '案例解析',
    description: '深度分析成功案例或失败复盘，结构完整，语言偏专业，数据清晰',
    icon: '🔍',
    category: 'image-text',
    outputType: t('contentForms.outputTypes.pureText'),
    characteristics: [
      '深度案例分析',
      '成功失败复盘',
      '结构完整清晰',
      '语言专业准确',
      '数据支撑有力'
    ],
    structure: [
      '背景：案例基本情况',
      '过程：详细操作步骤',
      '结果：具体成效数据',
      '启示：可复制的经验'
    ],
    examples: [
      '从0到100万粉丝：这个博主是如何做到的',
      '失败案例复盘：创业路上的5个致命错误',
      '成功营销案例：如何用小预算撬动大流量'
    ]
  }
];

/**
 * t('contentForms.comments.videoForms')
 */
const videoForms: ContentForm[] = [
  {
    id: 'drama-script',
    name: '剧情脚本',
    description: '角色设定明确，节奏紧凑，含剧情冲突与反转，30-60秒结构',
    icon: '🎬',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '角色设定明确',
      '节奏紧凑有力',
      '剧情冲突反转',
      '30-60秒时长',
      '情节引人入胜'
    ],
    structure: [
      '开场：设定场景和角色',
      '冲突：制造矛盾和悬念',
      '反转：意外的情节转折',
      '结尾：解决问题或留悬念'
    ],
    examples: [
      '职场新人vs老员工的日常对话',
      '情侣之间的搞笑误会',
      '家庭聚餐的温馨时刻'
    ]
  },
  {
    id: 'comedy-reversal',
    name: t('contentForms.names.comedyReversal'),
    description: t('contentForms.descriptions.comedyReversal'),
    icon: '😂',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '笑点密集突出',
      '意外反转设计',
      '极简内容结构',
      '高爆点设置',
      '娱乐性强'
    ],
    structure: [
      '铺垫：建立预期',
      '发展：逐步推进',
      '反转：打破预期',
      '爆点：制造笑料'
    ],
    examples: [
      '期待vs现实的巨大反差',
      '看似正经实则搞笑的对话',
      '日常生活中的意外惊喜'
    ]
  },
  {
    id: 'unboxing-experience',
    name: '开箱体验',
    description: '结构为"开箱→展示细节→使用反馈→总结推荐"，内容流程完整',
    icon: '📦',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '开箱过程完整',
      '细节展示充分',
      '使用反馈真实',
      '推荐总结明确',
      '体验感强烈'
    ],
    structure: [
      '开箱：展示包装和第一印象',
      '细节：产品特点和功能介绍',
      '体验：实际使用感受',
      '总结：优缺点和推荐度'
    ],
    examples: [
      '最新数码产品开箱测评',
      '美妆护肤品试用体验',
      '生活好物使用分享'
    ]
  },
  {
    id: 'tutorial-teaching',
    name: '教程教学',
    description: '包括材料/工具列表、操作步骤、注意事项，支持镜头分镜与字幕建议',
    icon: '👨‍🏫',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '教学目标明确',
      '步骤详细清晰',
      '工具材料齐全',
      '注意事项提醒',
      '实操性强'
    ],
    structure: [
      '准备：所需材料和工具',
      '步骤：详细操作流程',
      '技巧：关键要点提醒',
      '总结：成果展示和建议'
    ],
    examples: [
      '5分钟学会化妆技巧',
      '手工DIY制作教程',
      '烹饪美食制作方法'
    ]
  },
  {
    id: 'knowledge-explanation',
    name: '知识讲解类',
    description: '语言通俗，每句不超过20字，有节奏感，引导用户点赞/收藏',
    icon: '🧠',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '语言通俗易懂',
      '句子简短有力',
      '节奏感强烈',
      '互动引导明确',
      '知识性强'
    ],
    structure: [
      '引入：提出问题或话题',
      '讲解：分点详细说明',
      '举例：具体案例说明',
      '总结：要点回顾和互动'
    ],
    examples: [
      '3分钟了解投资理财基础',
      '科普：为什么会有四季变化',
      '历史小知识：古代人如何生活'
    ]
  },
  {
    id: 'vlog-style',
    name: 'Vlog类',
    description: '日常生活记录，镜头自然推进，有时间线逻辑和用户共鸣点',
    icon: '📹',
    category: 'video',
    outputType: t('contentForms.outputTypes.shortVideoScript'),
    characteristics: [
      '生活记录真实',
      '镜头自然流畅',
      '时间线清晰',
      '共鸣点丰富',
      '个人化强'
    ],
    structure: [
      '开始：日常生活场景',
      '过程：活动或事件记录',
      '感受：个人想法和感悟',
      '结尾：总结或展望'
    ],
    examples: [
      '我的一天：从早到晚的生活记录',
      '周末出游：美好时光分享',
      '工作日常：职场生活点滴'
    ]
  }
];

/**
 * t('contentForms.comments.interviewForms')
 */
const interviewForms: ContentForm[] = [
  {
    id: 'role-dialogue',
    name: '角色对话体',
    description: '模拟两位角色的互动，有人物性格与情绪节奏，贴近聊天语感',
    icon: '💬',
    category: 'interview',
    outputType: '对话脚本',
    characteristics: [
      '角色性格鲜明',
      '互动自然流畅',
      '情绪节奏把控',
      '聊天语感真实',
      '代入感强'
    ],
    structure: [
      '角色介绍：设定人物背景',
      '对话开始：自然引入话题',
      '深入交流：观点碰撞交流',
      '对话结束：总结或留悬念'
    ],
    examples: [
      '职场新人与资深前辈的对话',
      '闺蜜之间的深夜谈心',
      '专家与普通人的知识交流'
    ]
  },
  {
    id: 'qa-format',
    name: 'Q&A问答体',
    description: '用户常见问题 + 专家回答，内容精炼、可信',
    icon: '❓',
    category: 'interview',
    outputType: '问答内容',
    characteristics: [
      '问题针对性强',
      '回答专业精炼',
      '内容可信度高',
      '实用性突出',
      '结构清晰'
    ],
    structure: [
      '问题提出：用户关心的问题',
      '专业回答：权威准确的解答',
      '补充说明：相关注意事项',
      '总结建议：实用性建议'
    ],
    examples: [
      'Q：如何选择适合的护肤品？A：...',
      'Q：投资理财有哪些风险？A：...',
      'Q：如何提高工作效率？A：...'
    ]
  },
  {
    id: 'virtual-interview',
    name: t('contentForms.names.virtualInterview'),
    description: t('contentForms.descriptions.virtualInterview'),
    icon: '🎙️',
    category: 'interview',
    outputType: t('contentForms.outputTypes.interviewScript'),
    characteristics: [
      '主持风格专业',
      '嘉宾回答深入',
      '访谈节奏把控',
      '话题引导自然',
      '内容有深度'
    ],
    structure: [
      '开场：介绍嘉宾和话题',
      '提问：层层深入的问题',
      '回答：嘉宾的专业见解',
      '结尾：总结和感谢'
    ],
    examples: [
      '专访成功企业家的创业经历',
      '对话知名专家的行业见解',
      '访谈网红博主的成长故事'
    ]
  },
  {
    id: 'real-interview-edit',
    name: '真实采访剪辑',
    description: '模拟实拍风格，结构包括字幕样式、镜头角度建议等',
    icon: '🎥',
    category: 'interview',
    outputType: '采访脚本',
    characteristics: [
      '实拍风格真实',
      '字幕设计考虑',
      '镜头角度建议',
      '剪辑节奏把控',
      '现场感强'
    ],
    structure: [
      '现场设置：环境和氛围',
      '采访进行：问答互动',
      '关键时刻：重点内容突出',
      '后期处理：剪辑和字幕建议'
    ],
    examples: [
      '街头随机采访市民观点',
      '专业人士深度访谈',
      '活动现场嘉宾采访'
    ]
  }
];

/**
 * 洞察类内容形式
 */
const insightForms: ContentForm[] = [
  {
    id: 'trend-opinion',
    name: t('contentForms.names.trendOpinion'),
    description: t('contentForms.descriptions.trendOpinion'),
    icon: '📈',
    category: 'insight',
    outputType: t('contentForms.outputTypes.opinionArticle'),
    characteristics: [
      '专家视角权威',
      '趋势判断准确',
      '论据充分有力',
      '逻辑结构清晰',
      '前瞻性强'
    ],
    structure: [
      '观点：明确的趋势判断',
      '论据：支撑观点的证据',
      '分析：深入的逻辑分析',
      '总结：结论和未来展望'
    ],
    examples: [
      '2024年数字营销的5大趋势',
      '人工智能将如何改变我们的生活',
      '新消费时代的品牌机遇与挑战'
    ]
  },
  {
    id: 'emotional-resonance',
    name: '情绪共鸣故事',
    description: '侧重真实细节、转折与破防时刻，引发共鸣与评论',
    icon: '💝',
    category: 'insight',
    outputType: t('contentForms.outputTypes.emotionalContent'),
    characteristics: [
      '真实细节丰富',
      '情感转折明显',
      '破防时刻设计',
      '共鸣点突出',
      '互动性强'
    ],
    structure: [
      '背景：设定情感基调',
      '发展：情感层层递进',
      '转折：关键情感节点',
      '升华：情感共鸣和启发'
    ],
    examples: [
      '那个改变我人生的瞬间',
      '平凡生活中的不平凡感动',
      '成长路上的酸甜苦辣'
    ]
  },
  {
    id: 'activity-promotion',
    name: '活动预告/推广类',
    description: '专为营销场景设计，强调优惠、时效性与参与引导',
    icon: '🎉',
    category: 'insight',
    outputType: t('contentForms.outputTypes.marketingContent'),
    characteristics: [
      '营销目标明确',
      '优惠信息突出',
      '时效性强调',
      '参与引导清晰',
      '转化导向'
    ],
    structure: [
      '吸引：引人注目的开头',
      '介绍：活动详情和优惠',
      '紧迫：时间限制和稀缺性',
      '行动：明确的参与指引'
    ],
    examples: [
      '限时优惠！错过再等一年',
      '新品发布会，邀请您参与',
      '会员专享活动，名额有限'
    ]
  }
];

/**
 * 四大内容分类
 */
export const contentCategories: ContentCategory[] = [
  {
    id: 'image-text',
    name: t('contentForms.categories.imageText'),
    description: t('contentForms.outputTypes.pureText'),
    icon: '📸',
    outputDescription: '纯文案，用户自配图',
    forms: imageTextForms
  },
  {
    id: 'video',
    name: t('contentForms.categories.video'),
    description: t('contentForms.outputTypes.shortVideoScript'),
    icon: '🎬',
    outputDescription: t('contentForms.outputTypes.shortVideoScript'),
    forms: videoForms
  },
  {
    id: 'interview',
    name: t('contentForms.categories.interview'),
    description: t('contentForms.outputTypes.dialogueScript'),
    icon: '💬',
    outputDescription: t('contentForms.outputTypes.dialogueScript'),
    forms: interviewForms
  },
  {
    id: 'insight',
    name: t('contentForms.categories.insight'),
    description: t('contentForms.outputTypes.opinionEmotionalMarketing'),
    icon: '🔍',
    outputDescription: t('contentForms.outputTypes.opinionEmotionalMarketing'),
    forms: insightForms
  }
];

/**
 * 获取所有内容形式
 */
export function getAllContentForms(): ContentForm[] {
  return contentCategories.flatMap(category => category.forms);
}

/**
 * 根据ID获取内容形式
 */
export function getContentFormById(id: string): ContentForm | undefined {
  return getAllContentForms().find(form => form.id === id);
}

/**
 * 根据分类获取内容形式
 */
export function getContentFormsByCategory(categoryId: string): ContentForm[] {
  const category = contentCategories.find(cat => cat.id === categoryId);
  return category ? category.forms : [];
}

/**
 * 获取内容分类
 */
export function getContentCategoryById(id: string): ContentCategory | undefined {
  return contentCategories.find(category => category.id === id);
}
