/**
 * 内容方案配置
 * 定义不同风格的内容生成方案
 */

/**
 * 内容方案接口
 */
export interface ContentScheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  platforms: string[];
  features: string[];
  isDefault?: boolean;
}

/**
 * 风格类型枚举
 */
export type StyleType = 'professional' | 'funny' | 'real' | 'hook';

/**
 * 平台提示词模板接口
 */
export interface PlatformPromptTemplate {
  name: string;
  styleGuide: string;
  prompt: (input: string) => string;
}

/**
 * 风格提示词模板接口
 */
export interface StylePromptTemplate {
  name: string;
  description: string;
  characteristics: string[];
  prompt: (input: string, platform: string) => string;
}

/**
 * 全域内容适配方案
 * 针对不同平台特点的内容生成方案
 */
export const globalContentAdaptationScheme: ContentScheme = {
  id: 'global-adaptation',
  name: '全域内容适配方案',
  description: '针对小红书、微博、微信、抖音、知乎、B站等主流平台的专业内容适配方案，确保内容符合各平台特色和用户习惯',
  icon: '🌐',
  color: 'from-hsl(var(--accent))-500 to-indigo-600',
  platforms: ['xiaohongshu', 'weibo', 'wechat', 'douyin', 'zhihu', 'bilibili'],
  features: [
    '多平台风格适配',
    '专业提示词模板',
    '平台特色优化',
    '用户习惯匹配',
    '内容结构规范',
    '互动引导设计'
  ],
  isDefault: true
};

/**
 * 四大核心风格体系
 */
export const stylePromptTemplates: Record<StyleType, StylePromptTemplate> = {
  professional: {
    name: '专业风格',
    description: '专业 + 客观 + 洞察',
    characteristics: [
      '使用专业术语和行业词汇',
      '客观分析，避免主观情绪',
      '提供深度洞察和独到见解',
      '逻辑清晰，结构严谨',
      '引用权威数据和案例',
      '保持专业权威性'
    ],
    prompt: (input: string, platform: string) => {
      const platformPrompts = {
        xiaohongshu: `你是一位小红书平台的专业内容创作者，擅长撰写专业、客观、有洞察力的种草笔记。

请根据以下原始内容，生成一篇符合专业风格的小红书笔记：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

请输出格式如下：

标题：XXXXX（专业性强，准确表达主题）
内容：XXXX（专业分析，逻辑清晰，有深度洞察）`,

        weibo: `你是一位微博平台的专业内容创作者，擅长撰写专业、客观、有洞察力的微博内容。

请根据以下原始内容，生成一条符合专业风格的微博：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

请输出格式如下：

标题：#专业话题#
内容：XXXX（简洁表达专业观点，可使用专业术语）`,

        wechat: `你是一位微信公众号的专业内容编辑，擅长撰写专业、客观、有洞察力的深度文章。

请根据以下原始内容，撰写一篇专业文章，结构清晰，逻辑完整，用词严谨：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

输出格式如下：

标题：XXXXX（专业性强，准确表达主题）
内容：XXXX（不少于500字，具有深度与可读性）`,

        douyin: `你是一位抖音平台的专业内容创作者，擅长撰写专业、客观、有洞察力的短视频脚本。

请将以下原始内容改写为适合拍摄抖音短视频的专业脚本：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

输出格式如下：

标题：XXXXX（专业性强，准确表达主题）
脚本内容：
画面一：[专业分析脚本文案]
画面二：[深度洞察脚本文案]
画面三：[专业建议脚本文案]
结尾Call to Action：[专业引导话语]`,

        zhihu: `你是一位知乎平台的专业答主，擅长理性分析、逻辑表达。

请根据以下原始内容，撰写一篇知乎回答，逻辑清晰，有深度，引用例证数据更佳：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

输出格式如下：

标题：XXXXX（如"如何看待…"、"为什么…"）
内容：1）观点陈述 2）逻辑论证（含举例）3）总结归纳`,

        bilibili: `你是一位B站平台的专业内容创作者，擅长撰写专业、客观、有洞察力的视频简介。

请将以下原始内容改写为适合B站风格的专业视频简介：

原始内容：
${input}

专业风格要求：
- 使用专业术语和行业词汇
- 客观分析，避免主观情绪
- 提供深度洞察和独到见解
- 逻辑清晰，结构严谨
- 引用权威数据和案例
- 保持专业权威性

输出格式如下：

标题：【XXXX】（用【】包围，专业性强）
简介内容：XXXXX（语言专业严谨，有深度洞察）`
      };

      return platformPrompts[platform as keyof typeof platformPrompts] || platformPrompts.xiaohongshu;
    }
  },

  funny: {
    name: '幽默风格',
    description: '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党',
    characteristics: [
      '使用幽默风趣的表达',
      '适当自嘲和调侃',
      '融入网络热词和流行语',
      '使用惊叹号和夸张表达',
      '标题党风格吸引注意',
      '轻松活泼的语调'
    ],
    prompt: (input: string, platform: string) => {
      const platformPrompts = {
        xiaohongshu: `你是一位小红书平台的幽默内容创作者，擅长撰写有趣、有梗、吸引眼球的内容。

请根据以下原始内容，生成一篇符合幽默风格的小红书笔记：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

请输出格式如下：

标题：XXXXX（有趣吸引人，可以使用惊叹号）
内容：XXXX（幽默表达，有梗有趣，轻松活泼）`,

        weibo: `你是一位微博平台的幽默内容创作者，擅长撰写有趣、有梗、吸引眼球的微博内容。

请根据以下原始内容，生成一条符合幽默风格的微博：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

请输出格式如下：

标题：#幽默话题#
内容：XXXX（简洁幽默表达，可使用网络流行语）`,

        wechat: `你是一位微信公众号的幽默内容编辑，擅长撰写有趣、有梗、吸引眼球的文章。

请根据以下原始内容，撰写一篇幽默文章：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

输出格式如下：

标题：XXXXX（有趣吸引人，可以使用惊叹号）
内容：XXXX（幽默表达，有梗有趣，轻松活泼）`,

        douyin: `你是一位抖音平台的幽默内容创作者，擅长撰写有趣、有梗、吸引眼球的短视频脚本。

请将以下原始内容改写为适合拍摄抖音短视频的幽默脚本：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

输出格式如下：

标题：XXXXX（有趣吸引人，可以使用惊叹号）
脚本内容：
画面一：[幽默脚本文案]
画面二：[搞笑脚本文案]
画面三：[有趣脚本文案]
结尾Call to Action：[幽默引导话语]`,

        zhihu: `你是一位知乎平台的幽默答主，擅长幽默表达、轻松调侃。

请根据以下原始内容，撰写一篇知乎回答，幽默风趣，有梗有趣：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

输出格式如下：

标题：XXXXX（如"如何看待…"、"为什么…"）
内容：1）幽默观点陈述 2）轻松论证（含调侃）3）总结归纳`,

        bilibili: `你是一位B站平台的幽默内容创作者，擅长撰写有趣、有梗、吸引眼球的视频简介。

请将以下原始内容改写为适合B站风格的幽默视频简介：

原始内容：
${input}

幽默风格要求：
- 使用幽默风趣的表达
- 适当自嘲和调侃
- 融入网络热词和流行语
- 使用惊叹号和夸张表达
- 标题党风格吸引注意
- 轻松活泼的语调

输出格式如下：

标题：【XXXX】（用【】包围，有趣吸引人）
简介内容：XXXXX（语言幽默风趣，有梗有趣）`
      };

      return platformPrompts[platform as keyof typeof platformPrompts] || platformPrompts.xiaohongshu;
    }
  },

  real: {
    name: '真实风格',
    description: '真实感 + 主观 + 分享型',
    characteristics: [
      '第一人称真实体验',
      '主观感受和情感表达',
      '分享个人经历和故事',
      '真实可信的表达方式',
      '避免过度包装和修饰',
      '贴近生活的语言'
    ],
    prompt: (input: string, platform: string) => {
      const platformPrompts = {
        xiaohongshu: `你是一位小红书平台的真实内容创作者，擅长撰写真实、有温度、有共鸣的内容。

请根据以下原始内容，生成一篇符合真实风格的小红书笔记：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

请输出格式如下：

标题：XXXXX（真实感受，有温度）
内容：XXXX（个人体验，真实分享，有共鸣）`,

        weibo: `你是一位微博平台的真实内容创作者，擅长撰写真实、有温度、有共鸣的微博内容。

请根据以下原始内容，生成一条符合真实风格的微博：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

请输出格式如下：

标题：#真实话题#
内容：XXXX（简洁真实表达，分享个人感受）`,

        wechat: `你是一位微信公众号的真实内容编辑，擅长撰写真实、有温度、有共鸣的文章。

请根据以下原始内容，撰写一篇真实文章：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

输出格式如下：

标题：XXXXX（真实感受，有温度）
内容：XXXX（个人体验，真实分享，有共鸣）`,

        douyin: `你是一位抖音平台的真实内容创作者，擅长撰写真实、有温度、有共鸣的短视频脚本。

请将以下原始内容改写为适合拍摄抖音短视频的真实脚本：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

输出格式如下：

标题：XXXXX（真实感受，有温度）
脚本内容：
画面一：[真实体验脚本文案]
画面二：[个人感受脚本文案]
画面三：[真实分享脚本文案]
结尾Call to Action：[真实引导话语]`,

        zhihu: `你是一位知乎平台的真实答主，擅长真实表达、个人分享。

请根据以下原始内容，撰写一篇知乎回答，真实可信，有温度：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

输出格式如下：

标题：XXXXX（如"如何看待…"、"为什么…"）
内容：1）真实观点陈述 2）个人经历分享 3）总结归纳`,

        bilibili: `你是一位B站平台的真实内容创作者，擅长撰写真实、有温度、有共鸣的视频简介。

请将以下原始内容改写为适合B站风格的真实视频简介：

原始内容：
${input}

真实风格要求：
- 第一人称真实体验
- 主观感受和情感表达
- 分享个人经历和故事
- 真实可信的表达方式
- 避免过度包装和修饰
- 贴近生活的语言

输出格式如下：

标题：【XXXX】（用【】包围，真实感受）
简介内容：XXXXX（语言真实可信，有温度）`
      };

      return platformPrompts[platform as keyof typeof platformPrompts] || platformPrompts.xiaohongshu;
    }
  },

  hook: {
    name: '钩子风格',
    description: '钩子型 + 精准用户导向 + 高点击转化',
    characteristics: [
      '开头设置强烈钩子',
      '精准定位目标用户',
      '高点击率和转化导向',
      '制造悬念和好奇心',
      '突出核心卖点和价值',
      '引导用户行动'
    ],
    prompt: (input: string, platform: string) => {
      const platformPrompts = {
        xiaohongshu: `请将以下内容改写为小红书平台爆款钩子型笔记：
- 开头要强钩子（如"这件事99%的人都做错了"）
- 突出某类人群（如"30+女性必看"）
- 适合引发点击/点赞/收藏的结构

原始内容：
${input}`,

        weibo: `你是一位微博运营策划，请将以下内容改写为具有高话题性和引流钩子的文案：
- 使用强标题句 + #话题#
- 引导转发或提问结尾

原始内容：
${input}`,

        wechat: `请将以下内容撰写为微信公众号引流转化型文章：
- 开头用"你是否也有这种经历…"
- 标题引发共鸣（如"XX人群的通病，其实可以这样解决"）
- 中段结构：问题现象→痛点加深→建议解决方案

原始内容：
${input}`,

        douyin: `请将以下内容改写为抖音平台高转化率视频脚本：
- 3秒钩子吸引注意
- 明确目标人群（如"30岁上班族注意了！"）
- 结尾引导评论或点击CTA

原始内容：
${input}`,

        zhihu: `你是一位知乎作者，请将以下内容改写为带有"强钩子问题"的知乎风格回答：
- 可提出一句话引发争议（如"为什么90后更容易焦虑？"）
- 开头即设问，吸引读者往下看
- 针对某人群场景输出观点

原始内容：
${input}`,

        bilibili: `请将以下内容改写为B站风格强钩子标题+简介：
- 标题参考：【99%人都不知道的XX】
- 简介说明人设+诱因+冲突感

原始内容：
${input}`
      };

      return platformPrompts[platform as keyof typeof platformPrompts] || platformPrompts.xiaohongshu;
    }
  }
};

/**
 * 平台提示词模板配置
 */
export const platformPromptTemplates: Record<string, PlatformPromptTemplate> = {
  xiaohongshu: {
    name: '小红书',
    styleGuide: `风格：亲切、细腻、有生活美学。常用表达如"巨好用"、"闭眼入"、"姐妹们看过来！"。
写作结构建议：
1. 用钩子吸引点击（如"这玩意也太香了吧！"）
2. 分享亲身体验背景
3. 产品使用感受
4. 总结亮点+推荐理由

使用 emoji 表情，并以"第一人称"语气撰写，避免AI腔调，真实自然。`,
    prompt: (input: string) => `你是一位擅长撰写小红书爆款笔记的内容创作者。

请根据以下原始内容，生成一篇符合小红书风格的图文笔记内容，风格要有"闺蜜感"和"种草力"，加入真实体验描述和口语化表达：

原始内容：
${input}

请输出格式如下：

标题：XXXXX（有吸引力的笔记标题）
内容：XXXXX（正文内容，包含生活感受、细节体验、真实推荐，使用emoji）`,
  },

  weibo: {
    name: '微博',
    styleGuide: `风格：简洁、有观点、热点感强。适合蹭热度和互动。
建议加入话题标签（#XX#）、@用户，以及简短带情绪的句子。

语言要有"爽感"，结尾建议引导讨论或投票。`,
    prompt: (input: string) => `你是一位擅长撰写微博热评内容的用户。

请根据以下原始内容，生成一条微博内容：
- 语言要短小有力，最好控制在200字以内
- 带话题 #XX#
- 引导读者转发/讨论

原始内容：
${input}

输出格式如下：

标题：#关键词话题#
内容：XXXX（简洁表达观点，可使用网络流行语）`,
  },

  wechat: {
    name: '微信',
    styleGuide: `风格：专业、权威，适合职场人群阅读。
文章结构要清晰，有逻辑，有洞察，支持引用权威观点或数据。

语言正式、准确、避免AI腔和口语化表达。`,
    prompt: (input: string) => `你是一位专业内容编辑，负责撰写适合微信公众平台发布的深度内容文章。

请根据以下原始内容，撰写一篇专业文章，结构清晰，逻辑完整，用词严谨：

原始内容：
${input}

输出格式如下：

标题：XXXXX（专业性强，准确表达主题）
内容：XXXX（不少于500字，具有深度与可读性）`,
  },

  douyin: {
    name: '抖音',
    styleGuide: `风格：轻松、有趣、上头。适合配合视频节奏，具备情绪反转。
语气需具备"语音转文字感"，如"姐妹们，这也太离谱了吧！"

建议输出3段式脚本：开头吸引人→中段反转→结尾高能引导互动。`,
    prompt: (input: string) => `你是一位抖音短视频脚本创作者。

请将以下原始内容改写为适合拍摄抖音短视频的文字脚本，语气活泼，有情绪反转，适合配乐节奏：

原始内容：
${input}

输出格式如下：

标题：XXXXX（爆点标题）
脚本内容：
画面一：[脚本文案]
画面二：[脚本文案]
画面三：[脚本文案]
结尾Call to Action：[引导关注/评论的话语]`,
  },

  zhihu: {
    name: '知乎',
    styleGuide: `风格：理性、深度、结构化。建议"总-分-总"结构，内容逻辑要严谨，有证据或数据支持。

语气需克制、专业，避免情绪化或商业化表述。`,
    prompt: (input: string) => `你是一位知乎答主，擅长理性分析、逻辑表达。

请根据以下原始内容，撰写一篇知乎回答，逻辑清晰，有深度，引用例证数据更佳：

原始内容：
${input}

输出格式如下：

标题：XXXXX（如"如何看待…"、"为什么…"）
内容：1）观点陈述 2）逻辑论证（含举例）3）总结归纳`,
  },

  bilibili: {
    name: 'B站',
    styleGuide: `风格：年轻、活力、有梗。适合视频简介、开箱稿、搞笑吐槽、安利型内容。

语气要轻松、能玩梗，适合"弹幕场景"共鸣感。`,
    prompt: (input: string) => `你是一位B站视频up主，擅长撰写搞笑、有共鸣的内容简介。

请将以下原始内容改写为适合B站风格的视频简介，语气年轻、有梗、接地气：

原始内容：
${input}

输出格式如下：

标题：【XXXX】（用【】包围，带有梗或情绪）
简介内容：XXXXX（语言轻松活泼，可带调侃或二次元语气）`,
  },
};

/**
 * 平台技术规格
 */
export const platformSpecifications = {
  xiaohongshu: {
    maxLength: 1000,
    hashtagCount: 20,
    features: ['图文笔记', '种草推荐', '生活分享', '话题挑战'],
    bestPractices: [
      '使用高质量图片',
      '添加相关话题标签',
      '分享真实使用体验',
      '与粉丝互动回复'
    ]
  },
  weibo: {
    maxLength: 200,
    hashtagCount: 10,
    features: ['实时动态', '话题讨论', '热点追踪', '粉丝互动'],
    bestPractices: [
      '抓住热点话题',
      '使用话题标签',
      '配图增强表达',
      '引导用户互动'
    ]
  },
  wechat: {
    maxLength: 5000,
    hashtagCount: 0,
    features: ['深度文章', '专业分析', '行业洞察', '权威发布'],
    bestPractices: [
      '内容结构清晰',
      '引用权威数据',
      '专业术语准确',
      '逻辑论证完整'
    ]
  },
  douyin: {
    maxLength: 300,
    hashtagCount: 15,
    features: ['短视频', '音乐配乐', '特效滤镜', '直播带货'],
    bestPractices: [
      '开头3秒吸引注意',
      '节奏感强',
      '情绪反转',
      '引导关注互动'
    ]
  },
  zhihu: {
    maxLength: 10000,
    hashtagCount: 0,
    features: ['问答社区', '专业讨论', '知识分享', '理性分析'],
    bestPractices: [
      '逻辑结构清晰',
      '引用可靠数据',
      '避免情绪化表达',
      '提供有价值观点'
    ]
  },
  bilibili: {
    maxLength: 2000,
    hashtagCount: 10,
    features: ['视频平台', '弹幕互动', '二次元文化', '年轻群体'],
    bestPractices: [
      '标题有梗有趣',
      '内容接地气',
      '与弹幕互动',
      '保持年轻活力'
    ]
  }
};

/**
 * 内容方案列表
 */
export const contentSchemes: ContentScheme[] = [
  globalContentAdaptationScheme,
  {
    id: 'universal',
    name: '通用适配方案',
    description: '适用于大多数平台的基础内容适配，保持内容核心价值的同时进行适度调整',
    icon: '🔄',
    color: 'from-hsl(var(--primary))-500 to-cyan-500',
    platforms: ['general'],
    features: [
      '通用内容适配',
      '保持核心价值',
      '适度风格调整',
      '多平台兼容'
    ]
  },
  {
    id: 'marketing',
    name: '营销推广方案',
    description: '专注于营销效果的内容适配，强调转化率和用户行动引导',
    icon: '📈',
    color: 'from-hsl(var(--success))-500 to-emerald-500',
    platforms: ['marketing'],
    features: [
      '营销导向',
      '转化优化',
      '行动引导',
      '效果追踪'
    ]
  },
  {
    id: 'creative',
    name: '创意写作方案',
    description: '注重创意性和独特性的内容生成，适合需要差异化表达的场景',
    icon: '✨',
    color: 'from-hsl(var(--accent))-500 to-hsl(var(--accent))-500',
    platforms: ['creative'],
    features: [
      '创意表达',
      '差异化内容',
      '独特视角',
      '艺术性表达'
    ]
  }
];

/**
 * 获取方案配置
 */
export function getContentScheme(schemeId: string): ContentScheme | undefined {
  return contentSchemes.find(scheme => scheme.id === schemeId);
}

/**
 * 获取平台提示词模板
 */
export function getPlatformPromptTemplate(platform: string): PlatformPromptTemplate | undefined {
  return platformPromptTemplates[platform];
}

/**
 * 获取风格提示词模板
 */
export function getStylePromptTemplate(style: StyleType): StylePromptTemplate | undefined {
  return stylePromptTemplates[style];
}

/**
 * 获取平台技术规格
 */
export function getPlatformSpecification(platform: string) {
  return platformSpecifications[platform as keyof typeof platformSpecifications];
}

/**
 * 生成平台适配内容（带风格）
 */
export function generatePlatformContent(
  originalContent: string,
  platform: string,
  schemeId: string = 'global-adaptation',
  style: StyleType = 'professional'
): string {
  const template = getPlatformPromptTemplate(platform);
  const styleTemplate = getStylePromptTemplate(style);
  
  if (!template) {
    return originalContent;
  }

  // 如果指定了风格，使用风格模板
  if (styleTemplate) {
    return styleTemplate.prompt(originalContent, platform);
  }

  // 否则使用平台模板
  let adjustedPrompt = template.prompt(originalContent);
  
  if (schemeId === 'marketing') {
    adjustedPrompt += '\n\n注意：重点突出营销效果和转化引导，使用更具说服力的表达。';
  } else if (schemeId === 'creative') {
    adjustedPrompt += '\n\n注意：注重创意性和独特性，使用更有想象力的表达方式。';
  }

  return adjustedPrompt;
}

/**
 * 获取所有可用风格
 */
export function getAvailableStyles(): Array<{ id: StyleType; name: string; description: string; icon: string }> {
  return [
    {
      id: 'professional',
      name: '专业风格',
      description: '专业 + 客观 + 洞察',
      icon: '🎯'
    },
    {
      id: 'funny',
      name: '幽默风格',
      description: '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党',
      icon: '😄'
    },
    {
      id: 'real',
      name: '真实风格',
      description: '真实感 + 主观 + 分享型',
      icon: '💝'
    },
    {
      id: 'hook',
      name: '钩子风格',
      description: '钩子型 + 精准用户导向 + 高点击转化',
      icon: '🎣'
    }
  ];
}
