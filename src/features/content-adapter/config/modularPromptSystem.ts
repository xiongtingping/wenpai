/**
 * ✅ V2.2 模块化提示词架构系统
 * 🎯 通过组件库+随机变体避免AI生成的模板化倾向
 *
 * 核心理念:
 * 1. 将提示词拆解成可复用的模块组件
 * 2. 每个模块提供3-5个随机变体
 * 3. 通过逻辑组合引擎动态生成提示词
 * 4. 避免固定模板,确保每次生成都有差异
 */

// ================== 类型定义 ==================

/**
 * 提示词模块
 */
export interface PromptModule {
  id: string;
  name: string;
  category: 'opening' | 'content' | 'brand' | 'interaction' | 'format' | 'constraint';
  variants: PromptVariant[];
}

/**
 * 提示词变体
 */
export interface PromptVariant {
  id: string;
  template: string;
  weight?: number;        // 权重(1-10),用于随机选择
  context?: string[];     // 适用上下文
  antiContext?: string[]; // 不适用上下文
}

/**
 * 模块组合规则
 */
export interface CombinationRule {
  requiredModules: string[];   // 必需模块
  optionalModules: string[];   // 可选模块
  moduleOrder: string[];       // 模块顺序
  maxModules?: number;         // 最大模块数
}

// ================== 开头钩子模块 ==================

/**
 * 📌 开头钩子模块组
 * 用于吸引注意力,建立预期
 */
export const OPENING_HOOK_MODULES: PromptModule[] = [
  {
    id: 'opening-curiosity',
    name: '好奇心驱动',
    category: 'opening',
    variants: [
      {
        id: 'curiosity-1',
        template: '从开头就要引发读者好奇心,使用悬念、反常识或意外信息作为切入点',
        weight: 8
      },
      {
        id: 'curiosity-2',
        template: '开篇抛出一个令人意外的观察或数据,让读者产生"真的吗?"的疑问',
        weight: 7
      },
      {
        id: 'curiosity-3',
        template: '用一个与常规认知相反的陈述开场,制造认知冲突',
        weight: 6
      },
      {
        id: 'curiosity-4',
        template: '提出一个大多数人都关心但没有答案的问题作为开头',
        weight: 7
      },
      {
        id: 'curiosity-5',
        template: '分享一个看似不可能但确实发生的真实场景作为引子',
        weight: 6
      }
    ]
  },
  {
    id: 'opening-pain-point',
    name: '痛点共鸣',
    category: 'opening',
    variants: [
      {
        id: 'pain-1',
        template: '直击目标用户的具体痛点场景,用"是不是也遇到过..."式的共鸣开场',
        weight: 9
      },
      {
        id: 'pain-2',
        template: '描述一个令人沮丧的常见困境,让读者产生"说的就是我"的感觉',
        weight: 8
      },
      {
        id: 'pain-3',
        template: '列举用户在某个场景下反复碰壁的具体问题,建立情感联结',
        weight: 7
      },
      {
        id: 'pain-4',
        template: '用"每次...都..."的句式描绘用户经常遇到的挫折时刻',
        weight: 8
      }
    ]
  },
  {
    id: 'opening-story',
    name: '故事化引入',
    category: 'opening',
    variants: [
      {
        id: 'story-1',
        template: '用一个具体的时间、地点、人物开场,像讲故事一样自然引入主题',
        weight: 7
      },
      {
        id: 'story-2',
        template: '从一个转折性的"那一天"开始叙述,营造戏剧感',
        weight: 6
      },
      {
        id: 'story-3',
        template: '用对话或内心独白作为开头,增强代入感',
        weight: 5
      },
      {
        id: 'story-4',
        template: '描述一个关键场景的感官细节(看到的、听到的、感受到的)',
        weight: 6
      }
    ]
  },
  {
    id: 'opening-data',
    name: '数据冲击',
    category: 'opening',
    variants: [
      {
        id: 'data-1',
        template: '用一个震撼性的数据或统计结果开场,建立权威感',
        weight: 7
      },
      {
        id: 'data-2',
        template: '展示前后对比的数据差距,制造视觉冲击',
        weight: 8
      },
      {
        id: 'data-3',
        template: '揭示一个大多数人不知道的行业数据真相',
        weight: 6
      }
    ]
  }
];

// ================== 内容表达模块 ==================

/**
 * 📝 内容表达模块组
 * 主体内容的组织和表达方式
 */
export const CONTENT_EXPRESSION_MODULES: PromptModule[] = [
  {
    id: 'content-case-driven',
    name: '案例驱动',
    category: 'content',
    variants: [
      {
        id: 'case-1',
        template: '通过2-3个真实具体的案例来说明观点,每个案例包含背景-行动-结果三要素',
        weight: 9
      },
      {
        id: 'case-2',
        template: '用一个详细的案例拆解来展开内容,深入分析每个关键决策点',
        weight: 8
      },
      {
        id: 'case-3',
        template: '对比正反两个案例,通过对比突出核心方法的有效性',
        weight: 7
      },
      {
        id: 'case-4',
        template: '用自己的亲身经历作为主案例,配合数据和细节增强真实性',
        weight: 8
      }
    ]
  },
  {
    id: 'content-step-by-step',
    name: '步骤拆解',
    category: 'content',
    variants: [
      {
        id: 'step-1',
        template: '将方法拆解成清晰的步骤,每步提供具体的操作指引和注意事项',
        weight: 9
      },
      {
        id: 'step-2',
        template: '用递进式的逻辑组织内容: 为什么→是什么→怎么做',
        weight: 8
      },
      {
        id: 'step-3',
        template: '采用问题-分析-解决方案的三段式结构展开',
        weight: 7
      },
      {
        id: 'step-4',
        template: '使用框架化的方法论(如4步法、3原则等)来组织核心内容',
        weight: 8
      }
    ]
  },
  {
    id: 'content-comparison',
    name: '对比呈现',
    category: 'content',
    variants: [
      {
        id: 'comparison-1',
        template: '通过"之前 vs 之后"的对比展示改变和效果',
        weight: 8
      },
      {
        id: 'comparison-2',
        template: '用"大多数人 vs 高手"的对比揭示认知差距',
        weight: 7
      },
      {
        id: 'comparison-3',
        template: '列举多个选项的优劣对比,帮助读者做出选择',
        weight: 7
      },
      {
        id: 'comparison-4',
        template: '用"表面看 vs 实际上"的结构揭示深层逻辑',
        weight: 6
      }
    ]
  },
  {
    id: 'content-list',
    name: '清单罗列',
    category: 'content',
    variants: [
      {
        id: 'list-1',
        template: '用带数字的要点清单组织内容,每个要点都有小标题和展开说明',
        weight: 8
      },
      {
        id: 'list-2',
        template: '采用分类清单的方式,将内容归类到不同维度下',
        weight: 7
      },
      {
        id: 'list-3',
        template: '用正反清单(要做的+要避免的)来全面覆盖知识点',
        weight: 7
      }
    ]
  },
  {
    id: 'content-principle',
    name: '原理阐释',
    category: 'content',
    variants: [
      {
        id: 'principle-1',
        template: '先讲底层原理和逻辑,再展开到具体应用',
        weight: 7
      },
      {
        id: 'principle-2',
        template: '用类比和比喻解释复杂概念,降低理解门槛',
        weight: 8
      },
      {
        id: 'principle-3',
        template: '揭示现象背后的运作机制,解答"为什么"',
        weight: 7
      }
    ]
  }
];

// ================== 品牌人设模块 ==================

/**
 * 🎭 品牌人设模块组
 * 塑造独特的表达个性
 */
export const BRAND_PERSONALITY_MODULES: PromptModule[] = [
  {
    id: 'personality-friend',
    name: '朋友般真诚',
    category: 'brand',
    variants: [
      {
        id: 'friend-1',
        template: '像和朋友聊天一样表达,用"我"、"你"等人称拉近距离,分享真实感受和思考',
        weight: 8
      },
      {
        id: 'friend-2',
        template: '保持真诚坦率的态度,承认局限性,分享踩坑经历,不过度包装',
        weight: 9
      },
      {
        id: 'friend-3',
        template: '用口语化的表达,适当加入个人化的细节和感受,增强亲近感',
        weight: 7
      }
    ]
  },
  {
    id: 'personality-expert',
    name: '专业可信赖',
    category: 'brand',
    variants: [
      {
        id: 'expert-1',
        template: '展现专业功底,引用数据、研究或行业观察来支撑观点',
        weight: 8
      },
      {
        id: 'expert-2',
        template: '保持客观理性,多用"根据"、"数据显示"等表述建立信任',
        weight: 7
      },
      {
        id: 'expert-3',
        template: '提供深度洞察和独特视角,展示思考深度',
        weight: 8
      }
    ]
  },
  {
    id: 'personality-playful',
    name: '有趣幽默',
    category: 'brand',
    variants: [
      {
        id: 'playful-1',
        template: '适当使用网络流行语和meme,保持年轻化的表达',
        weight: 7
      },
      {
        id: 'playful-2',
        template: '用自嘲和轻松的调侃来活跃气氛,避免过于严肃',
        weight: 6
      },
      {
        id: 'playful-3',
        template: '创造有趣的比喻和形象化表达,让内容更生动',
        weight: 7
      }
    ]
  },
  {
    id: 'personality-motivational',
    name: '激励赋能',
    category: 'brand',
    variants: [
      {
        id: 'motivational-1',
        template: '传递积极向上的能量,鼓励读者采取行动',
        weight: 7
      },
      {
        id: 'motivational-2',
        template: '强调可能性和可实现性,降低读者的畏难情绪',
        weight: 8
      },
      {
        id: 'motivational-3',
        template: '分享成长和改变的故事,给读者希望和方向',
        weight: 7
      }
    ]
  }
];

// ================== 互动引导模块 ==================

/**
 * 💬 互动引导模块组
 * 促进用户参与和行动
 */
export const INTERACTION_MODULES: PromptModule[] = [
  {
    id: 'interaction-question',
    name: '提问互动',
    category: 'interaction',
    variants: [
      {
        id: 'question-1',
        template: '在适当位置提出开放性问题,邀请读者在评论区分享经验或看法',
        weight: 8
      },
      {
        id: 'question-2',
        template: '用"你呢?"、"你遇到过吗?"等提问建立双向交流感',
        weight: 7
      },
      {
        id: 'question-3',
        template: '设计选择性问题(A还是B),降低互动门槛',
        weight: 7
      }
    ]
  },
  {
    id: 'interaction-action',
    name: '行动召唤',
    category: 'interaction',
    variants: [
      {
        id: 'action-1',
        template: '明确告诉读者下一步可以做什么,提供清晰的行动指引',
        weight: 9
      },
      {
        id: 'action-2',
        template: '用"试试看"、"马上行动"等词语降低行动阻力',
        weight: 7
      },
      {
        id: 'action-3',
        template: '提供可立即实践的小任务或练习,促进转化',
        weight: 8
      }
    ]
  },
  {
    id: 'interaction-value',
    name: '价值预告',
    category: 'interaction',
    variants: [
      {
        id: 'value-1',
        template: '预告后续内容或系列,吸引关注',
        weight: 7
      },
      {
        id: 'value-2',
        template: '邀请收藏或分享,强调内容的长期价值',
        weight: 8
      },
      {
        id: 'value-3',
        template: '告诉读者这个内容能解决什么具体问题,强化价值感知',
        weight: 8
      }
    ]
  }
];

// ================== 格式优化模块 ==================

/**
 * 📐 格式优化模块组
 * 提升可读性和视觉效果
 */
export const FORMAT_MODULES: PromptModule[] = [
  {
    id: 'format-visual',
    name: '视觉层次',
    category: 'format',
    variants: [
      {
        id: 'visual-1',
        template: '合理使用小标题、加粗、列表等格式,建立清晰的视觉层次',
        weight: 9
      },
      {
        id: 'visual-2',
        template: '控制段落长度,避免大段文字,每段专注一个要点',
        weight: 8
      },
      {
        id: 'visual-3',
        template: '适当使用符号(✓、×、→等)和emoji增强可读性',
        weight: 7,
        context: ['xiaohongshu', 'wechat', 'douyin']
      }
    ]
  },
  {
    id: 'format-rhythm',
    name: '节奏控制',
    category: 'format',
    variants: [
      {
        id: 'rhythm-1',
        template: '句子长短搭配,长句说理,短句发力,避免单调',
        weight: 8
      },
      {
        id: 'rhythm-2',
        template: '用空行分隔不同部分,给读者呼吸感',
        weight: 7
      },
      {
        id: 'rhythm-3',
        template: '重点内容用短句单独成段,制造强调效果',
        weight: 7
      }
    ]
  },
  {
    id: 'format-highlight',
    name: '重点突出',
    category: 'format',
    variants: [
      {
        id: 'highlight-1',
        template: '用"重点是"、"核心在于"等词语标注关键信息',
        weight: 8
      },
      {
        id: 'highlight-2',
        template: '将核心结论或金句用引号或特殊格式突出',
        weight: 7
      },
      {
        id: 'highlight-3',
        template: '在结尾总结3-5个核心要点,方便读者记忆',
        weight: 8
      }
    ]
  }
];

// ================== 约束条件模块 ==================

/**
 * ⚠️ 约束条件模块组
 * 避免常见问题和模板化
 */
export const CONSTRAINT_MODULES: PromptModule[] = [
  {
    id: 'constraint-anti-template',
    name: '反模板化',
    category: 'constraint',
    variants: [
      {
        id: 'anti-template-1',
        template: '禁止使用"今天给大家分享"、"干货满满"等套话开头',
        weight: 10
      },
      {
        id: 'anti-template-2',
        template: '避免"点赞收藏"、"关注我"等生硬的互动话术,要自然融入',
        weight: 9
      },
      {
        id: 'anti-template-3',
        template: '不要用"第一点、第二点"这种机械化的列举方式',
        weight: 7
      },
      {
        id: 'anti-template-4',
        template: '避免过度使用"绝了"、"爱了"等网络流行语堆砌',
        weight: 8
      }
    ]
  },
  {
    id: 'constraint-authenticity',
    name: '真实性',
    category: 'constraint',
    variants: [
      {
        id: 'authenticity-1',
        template: '禁止夸大效果或编造数据,保持真实可信',
        weight: 10
      },
      {
        id: 'authenticity-2',
        template: '不要过度使用"神器"、"绝绝子"等极端化表达',
        weight: 9
      },
      {
        id: 'authenticity-3',
        template: '承认方法的局限性和适用范围,不要宣称万能',
        weight: 8
      }
    ]
  },
  {
    id: 'constraint-originality',
    name: '原创性',
    category: 'constraint',
    variants: [
      {
        id: 'originality-1',
        template: '每次生成都要有独特的表达方式,不要重复相同的句式结构',
        weight: 10
      },
      {
        id: 'originality-2',
        template: '基于具体内容创造个性化的比喻和案例,而非使用通用模板',
        weight: 9
      },
      {
        id: 'originality-3',
        template: '结合时事热点或新鲜元素,保持内容的时效性',
        weight: 7
      }
    ]
  }
];

// ================== 模块组合逻辑 ==================

/**
 * 🔧 模块组合规则配置
 */
export const COMBINATION_RULES: Record<string, CombinationRule> = {
  // 基础组合(通用)
  'default': {
    requiredModules: ['content', 'format'],
    optionalModules: ['opening', 'brand', 'interaction', 'constraint'],
    moduleOrder: ['opening', 'content', 'brand', 'interaction', 'format', 'constraint'],
    maxModules: 6
  },

  // 教程类组合
  'tutorial': {
    requiredModules: ['content-step-by-step', 'format-visual', 'interaction-action'],
    optionalModules: ['opening-pain-point', 'brand-expert', 'constraint-anti-template'],
    moduleOrder: ['opening', 'content', 'brand', 'format', 'interaction', 'constraint'],
    maxModules: 6
  },

  // 种草类组合
  'planting': {
    requiredModules: ['content-case-driven', 'brand-friend', 'interaction-question'],
    optionalModules: ['opening-story', 'format-highlight', 'constraint-authenticity'],
    moduleOrder: ['opening', 'content', 'brand', 'format', 'interaction', 'constraint'],
    maxModules: 6
  },

  // 洞察类组合
  'insight': {
    requiredModules: ['content-principle', 'brand-expert', 'format-rhythm'],
    optionalModules: ['opening-data', 'interaction-value', 'constraint-originality'],
    moduleOrder: ['opening', 'content', 'brand', 'format', 'interaction', 'constraint'],
    maxModules: 6
  },

  // 视频脚本组合
  'video-script': {
    requiredModules: ['opening-story', 'content', 'brand-playful'],
    optionalModules: ['format-rhythm', 'interaction-action', 'constraint-anti-template'],
    moduleOrder: ['opening', 'content', 'brand', 'format', 'interaction', 'constraint'],
    maxModules: 5
  }
};

// ================== 模块选择引擎 ==================

/**
 * 🎲 智能模块选择器
 * 根据上下文和权重随机选择合适的变体
 */
export class ModularPromptEngine {
  /**
   * 从模块组中随机选择一个变体
   */
  selectVariant(module: PromptModule, context?: string[]): PromptVariant {
    let candidateVariants = module.variants;

    // 根据上下文过滤
    if (context && context.length > 0) {
      candidateVariants = candidateVariants.filter(v => {
        if (v.antiContext && v.antiContext.some(c => context.includes(c))) {
          return false;
        }
        if (v.context && v.context.length > 0) {
          return v.context.some(c => context.includes(c));
        }
        return true;
      });
    }

    // 如果过滤后没有候选项,使用原始列表
    if (candidateVariants.length === 0) {
      candidateVariants = module.variants;
    }

    // 基于权重的随机选择
    const totalWeight = candidateVariants.reduce((sum, v) => sum + (v.weight || 5), 0);
    let random = Math.random() * totalWeight;

    for (const variant of candidateVariants) {
      random -= (variant.weight || 5);
      if (random <= 0) {
        return variant;
      }
    }

    // 兜底返回第一个
    return candidateVariants[0];
  }

  /**
   * 根据类别随机选择模块
   */
  selectModuleByCategory(
    category: PromptModule['category'],
    allModules: PromptModule[],
    context?: string[]
  ): PromptVariant | null {
    const categoryModules = allModules.filter(m => m.category === category);
    if (categoryModules.length === 0) return null;

    // 随机选择一个模块
    const module = categoryModules[Math.floor(Math.random() * categoryModules.length)];
    return this.selectVariant(module, context);
  }

  /**
   * 构建组合提示词
   */
  buildCombinedPrompt(
    ruleId: string,
    context?: string[],
    customModules?: string[]
  ): string {
    const rule = COMBINATION_RULES[ruleId] || COMBINATION_RULES.default;
    const allModules = [
      ...OPENING_HOOK_MODULES,
      ...CONTENT_EXPRESSION_MODULES,
      ...BRAND_PERSONALITY_MODULES,
      ...INTERACTION_MODULES,
      ...FORMAT_MODULES,
      ...CONSTRAINT_MODULES
    ];

    const selectedVariants: Map<string, string> = new Map();

    // 1. 处理必需模块
    rule.requiredModules.forEach(moduleId => {
      const module = allModules.find(m => m.id === moduleId);
      if (module) {
        const variant = this.selectVariant(module, context);
        selectedVariants.set(module.category, variant.template);
      }
    });

    // 2. 处理自定义模块
    if (customModules && customModules.length > 0) {
      customModules.forEach(moduleId => {
        const module = allModules.find(m => m.id === moduleId);
        if (module && !selectedVariants.has(module.category)) {
          const variant = this.selectVariant(module, context);
          selectedVariants.set(module.category, variant.template);
        }
      });
    }

    // 3. 随机添加可选模块
    const remainingSlots = (rule.maxModules || 6) - selectedVariants.size;
    const unusedCategories = rule.optionalModules
      .map(mid => allModules.find(m => m.id === mid)?.category)
      .filter(c => c && !selectedVariants.has(c)) as PromptModule['category'][];

    for (let i = 0; i < Math.min(remainingSlots, unusedCategories.length); i++) {
      const category = unusedCategories[i];
      const variant = this.selectModuleByCategory(category, allModules, context);
      if (variant) {
        selectedVariants.set(category, variant.template);
      }
    }

    // 4. 按照模块顺序组装提示词
    const orderedPrompts: string[] = [];
    const categoryMap: Record<string, string> = {
      'opening': '【开头策略】',
      'content': '【内容组织】',
      'brand': '【品牌人设】',
      'interaction': '【互动引导】',
      'format': '【格式优化】',
      'constraint': '【约束条件】'
    };

    rule.moduleOrder.forEach(category => {
      const template = selectedVariants.get(category as PromptModule['category']);
      if (template) {
        orderedPrompts.push(`${categoryMap[category]}\n${template}`);
      }
    });

    return orderedPrompts.join('\n\n');
  }

  /**
   * 获取所有可用模块
   */
  getAllModules(): PromptModule[] {
    return [
      ...OPENING_HOOK_MODULES,
      ...CONTENT_EXPRESSION_MODULES,
      ...BRAND_PERSONALITY_MODULES,
      ...INTERACTION_MODULES,
      ...FORMAT_MODULES,
      ...CONSTRAINT_MODULES
    ];
  }
}

// 导出单例
export const modularPromptEngine = new ModularPromptEngine();

export default modularPromptEngine;
