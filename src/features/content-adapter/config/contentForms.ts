/**
 * ✅ V2.1 内容形式(Format)配置系统
 * 🎯 区分于表达风格(Style/Tone),专注于内容呈现形式和结构
 *
 * 核心概念:
 * - 表达风格(tone) = 怎么说话 (幽默/专业/真实/钩子)
 * - 内容形式(format) = 怎么呈现内容 (图文/视频脚本/访谈/洞察)
 */

// ================== 类型定义 ==================

/**
 * 内容形式变体
 * 每种形式提供3-5个随机变体避免模板化
 */
export interface ContentFormVariant {
  structure: string;          // 结构说明
  openingHooks: string[];     // 开头钩子 (3-5个随机变体)
  contentModules: string[];   // 内容模块 (3-5个随机变体)
  closingActions: string[];   // 结尾行动 (3-5个随机变体)
  keyFeatures: string[];      // 关键特征
  bestPlatforms: string[];    // 最适合的平台
}

/**
 * 内容形式配置
 */
export interface ContentFormConfig {
  id: string;
  name: string;
  category: 'image-text' | 'video-script' | 'interview' | 'insight';
  description: string;
  variants: ContentFormVariant[];
  examples: string[];
  requirements: string[];
  antiPatterns: string[];     // 避免的模板化行为
}

// ================== 图文类 ==================

/**
 * 📸 图文种草型
 * 特点: 真实体验 + 产品展示 + 使用场景
 */
export const IMAGE_TEXT_PLANTING: ContentFormConfig = {
  id: 'image-text-planting',
  name: '图文种草',
  category: 'image-text',
  description: '真实体验分享,产品展示与使用场景结合',
  variants: [
    {
      structure: '【开头钩子】→ 【使用场景】→ 【产品亮点】→ 【真实反馈】→ 【行动引导】',
      openingHooks: [
        '最近发现了一个宝藏[产品],真的要分享给大家',
        '用了[时长]的[产品],终于可以来给大家反馈了',
        '朋友安利我的这个[产品],没想到真的这么好用',
        '之前一直在找[需求场景]的解决方案,直到遇到了它',
        '本来没抱太大期待,结果[产品]给了我大大的惊喜'
      ],
      contentModules: [
        '【场景描述】在[具体场景]下,我遇到了[痛点问题]',
        '【产品介绍】这个[产品]主打[核心功能],特别适合[目标人群]',
        '【使用体验】用下来最大的感受是[真实感受],比如[具体例子]',
        '【对比感受】相比之前用过的[竞品],这个[产品]在[维度]上提升明显',
        '【意外发现】除了[主要功能],我还发现它能[附加价值]'
      ],
      closingActions: [
        '如果你也有[痛点],强烈建议试试看',
        '评论区告诉我你的使用感受吧',
        '需要的姐妹可以去[渠道]看看',
        '分享给有需要的朋友,一起变美/变好',
        '有问题的话评论区见,我会一一回复'
      ],
      keyFeatures: ['真实感', '场景化', '产品细节', '个人体验'],
      bestPlatforms: ['xiaohongshu', 'wechat', 'douyin']
    }
  ],
  examples: [
    '用了这个AI写作工具3天,小红书文案效率提升3倍!真实分享我的使用心得...',
    '终于找到适合新手的视频剪辑工具!从0到1完整记录,附详细教程'
  ],
  requirements: [
    '必须包含真实使用场景',
    '突出产品具体功能而非空泛赞美',
    '提供可量化的效果对比',
    '语气要生活化、真诚'
  ],
  antiPatterns: [
    '避免: "这个产品太好了,强烈推荐"等空泛表达',
    '避免: 纯产品参数堆砌,缺少个人体验',
    '避免: 过度营销化语言,如"史上最强""必买清单"'
  ]
};

/**
 * 📚 干货拆解型
 * 特点: 知识传递 + 逻辑结构 + 可执行步骤
 */
export const IMAGE_TEXT_TUTORIAL: ContentFormConfig = {
  id: 'image-text-tutorial',
  name: '干货拆解',
  category: 'image-text',
  description: '系统化知识传递,提供可执行的步骤和方法',
  variants: [
    {
      structure: '【痛点引入】→ 【方法论框架】→ 【步骤拆解】→ 【案例说明】→ 【总结要点】',
      openingHooks: [
        '很多人在[领域]上踩坑,今天分享我总结的[数字]个避坑指南',
        '如何在[时长]内掌握[技能]? 我把方法拆解成了[数字]步',
        '关于[主题],这些底层逻辑你一定要知道',
        '做了[时长][事情],我发现了这[数字]个关键规律',
        '[领域]新手必看! 少走弯路的完整指南来了'
      ],
      contentModules: [
        '【框架介绍】整个[方法]可以分为[数字]个核心模块: [模块1][模块2][模块3]',
        '【步骤拆解】第一步: [具体行动]; 第二步: [具体行动]; 第三步: [具体行动]',
        '【要点说明】这里的关键是[核心原理],很多人容易忽略[细节]',
        '【案例展示】比如我最近做的[案例],就是用这个方法实现了[结果]',
        '【误区警示】特别注意避免[常见错误],否则会导致[负面后果]'
      ],
      closingActions: [
        '收藏起来慢慢看,实践过程中有问题随时来问我',
        '如果觉得有用,分享给更多需要的人',
        '评论区说说你在[领域]遇到的问题,我来帮你解答',
        '下期想看什么主题? 评论告诉我',
        '关注我,持续分享[领域]干货内容'
      ],
      keyFeatures: ['结构化', '可执行', '逻辑清晰', '有理有据'],
      bestPlatforms: ['xiaohongshu', 'zhihu', 'wechat']
    }
  ],
  examples: [
    '小红书涨粉的5个底层逻辑,掌握后3个月从0到1w粉(附完整方法论)',
    'AI工具使用指南 | 从选型到落地的完整流程,新手也能看懂'
  ],
  requirements: [
    '必须有清晰的结构框架',
    '提供可执行的具体步骤',
    '包含真实案例或数据支撑',
    '避免空洞的理论,要接地气'
  ],
  antiPatterns: [
    '避免: 纯理论堆砌,缺少实操指导',
    '避免: 结构混乱,逻辑跳跃',
    '避免: 使用大量专业术语不解释'
  ]
};

/**
 * 🎴 知识卡片型
 * 特点: 简洁清晰 + 视觉化呈现 + 快速获取
 */
export const IMAGE_TEXT_KNOWLEDGE_CARD: ContentFormConfig = {
  id: 'image-text-knowledge-card',
  name: '知识卡片',
  category: 'image-text',
  description: '碎片化知识点,可视化呈现,快速消费',
  variants: [
    {
      structure: '【核心观点】→ 【要点罗列】→ 【记忆锚点】',
      openingHooks: [
        '[数字]个[领域]冷知识,第[数字]个你肯定不知道',
        '一张图看懂[概念],建议收藏',
        '[主题]速查表,用到的时候再也不用到处找了',
        '关于[话题]的[数字]个真相',
        '[领域]必知的[数字]条黄金法则'
      ],
      contentModules: [
        '✅ [要点1]: [简短说明]',
        '✅ [要点2]: [简短说明]',
        '✅ [要点3]: [简短说明]',
        '💡 重点记住: [核心结论]',
        '⚠️ 常见误区: [错误认知] → 正确做法: [正确方法]'
      ],
      closingActions: [
        '保存图片,需要时随时查看',
        '分享给需要的人,一起进步',
        '记住这[数字]点,你就超越了80%的人',
        '评论区补充你知道的相关知识',
        '想看更多[主题]内容记得关注'
      ],
      keyFeatures: ['简洁', '可视化', '易记忆', '快速获取'],
      bestPlatforms: ['xiaohongshu', 'weibo', 'douyin']
    }
  ],
  examples: [
    'AI写作工具对比清单 | 5款主流工具优缺点一目了然',
    '内容创作者必备的10个快捷键,效率提升200%(建议保存)'
  ],
  requirements: [
    '信息密度高但不复杂',
    '视觉化呈现,易于理解',
    '每个要点控制在1-2句话',
    '提供记忆锚点或口诀'
  ],
  antiPatterns: [
    '避免: 信息过载,一张卡片塞太多内容',
    '避免: 纯文字堆砌,缺少视觉层次',
    '避免: 概念抽象难懂,不接地气'
  ]
};

/**
 * 💼 案例解析型
 * 特点: 真实案例 + 过程拆解 + 经验提炼
 */
export const IMAGE_TEXT_CASE_STUDY: ContentFormConfig = {
  id: 'image-text-case-study',
  name: '案例解析',
  category: 'image-text',
  description: '通过真实案例拆解,提炼可复用的方法和经验',
  variants: [
    {
      structure: '【案例背景】→ 【执行过程】→ 【关键决策】→ 【结果数据】→ 【经验总结】',
      openingHooks: [
        '拆解一个[领域]的成功案例,看完你也能复制',
        '我是如何用[方法]在[时长]内实现[成果]的?',
        '复盘我的[项目],从[起点]到[终点]的完整过程',
        '这个[案例]的成功绝非偶然,背后的逻辑是这样的',
        '失败了[数字]次后,我终于找到了[领域]的正确打开方式'
      ],
      contentModules: [
        '【背景】当时的情况是[具体背景],面临的主要挑战是[痛点]',
        '【策略】针对这个问题,我采取了[具体策略],核心思路是[逻辑]',
        '【执行】具体执行中,[步骤1][步骤2][步骤3]',
        '【转折】遇到了[意外情况],我的应对方式是[解决方案]',
        '【结果】最终实现了[可量化结果],数据表现为[具体数据]'
      ],
      closingActions: [
        '这个案例给我最大的启发是[核心经验],希望对你有帮助',
        '如果你也在做[相关领域],可以参考这个思路',
        '评论区聊聊你的类似经历',
        '想看更多案例拆解就关注我',
        '有疑问的地方欢迎评论区讨论'
      ],
      keyFeatures: ['真实性', '过程详细', '可复用', '数据支撑'],
      bestPlatforms: ['zhihu', 'wechat', 'xiaohongshu']
    }
  ],
  examples: [
    '从0到10w粉的完整复盘 | 我在小红书做对了这5件事(附数据)',
    '用AI工具做内容创作的30天实验,效率提升3倍的背后逻辑'
  ],
  requirements: [
    '必须是真实可验证的案例',
    '提供具体的数据和时间节点',
    '拆解关键决策和背后逻辑',
    '提炼可复用的方法论'
  ],
  antiPatterns: [
    '避免: 只讲结果不讲过程',
    '避免: 数据模糊或夸大',
    '避免: 经验总结空泛不具体'
  ]
};

// ================== 视频脚本类 ==================

/**
 * 🎬 剧情脚本型
 * 特点: 故事化 + 情节设计 + 情绪起伏
 */
export const VIDEO_SCRIPT_STORY: ContentFormConfig = {
  id: 'video-script-story',
  name: '剧情脚本',
  category: 'video-script',
  description: '故事化叙事,有情节有冲突有转折',
  variants: [
    {
      structure: '【场景设定】→ 【冲突引入】→ 【情节发展】→ 【高潮转折】→ 【结局升华】',
      openingHooks: [
        '[场景描述],没想到接下来发生的事改变了一切',
        '那天[时间],我做了一个[决定],现在回想起来...',
        '如果不是[事件],我可能永远不会发现[真相]',
        '[角色A]对[角色B]说: [关键对话],故事从这里开始',
        '在[地点],我遇到了[人物/事件],这个相遇彻底改变了我对[话题]的看法'
      ],
      contentModules: [
        '【场景1】[时间][地点],[角色]正在[动作],突然[意外事件]',
        '【冲突】原本以为[预期],结果却[反转],这让[角色]陷入了[困境]',
        '【尝试】为了解决[问题],[角色]尝试了[方法1],但是[失败原因]',
        '【转折】就在[角色]快要放弃的时候,[关键线索/人物]出现了',
        '【结局】最终[角色]通过[方法]实现了[目标],更重要的是明白了[道理]'
      ],
      closingActions: [
        '这个故事告诉我们[核心道理],你怎么看?',
        '如果是你,你会怎么做? 评论区聊聊',
        '关注我,每天分享一个真实故事',
        '想听更多关于[主题]的故事吗? 点赞告诉我',
        '下期预告: [下一个故事主题]'
      ],
      keyFeatures: ['故事性', '冲突设计', '情绪曲线', '启发性'],
      bestPlatforms: ['douyin', 'bilibili', 'xiaohongshu']
    }
  ],
  examples: [
    '一个产品经理的转型故事: 从传统行业到AI领域,我经历了什么?',
    '凌晨3点的咖啡馆,我遇到了一个改变我创作理念的陌生人'
  ],
  requirements: [
    '必须有清晰的故事线',
    '设计冲突和转折点',
    '情绪有起伏有张力',
    '结尾要有启发或共鸣'
  ],
  antiPatterns: [
    '避免: 平铺直叙,缺少情节起伏',
    '避免: 为了反转而反转,逻辑不合理',
    '避免: 结尾生硬,缺少升华'
  ]
};

/**
 * 😄 段子/反转视频型
 * 特点: 快节奏 + 包袱设计 + 意外结局
 */
export const VIDEO_SCRIPT_COMEDY: ContentFormConfig = {
  id: 'video-script-comedy',
  name: '段子/反转视频',
  category: 'video-script',
  description: '幽默搞笑,快节奏,意外反转',
  variants: [
    {
      structure: '【常规开场】→ 【预期建立】→ 【反转铺垫】→ 【包袱抖出】',
      openingHooks: [
        '[常见场景]大家都是这样的吧? (建立预期)',
        '当[角色A]以为[预期]的时候...(反转前奏)',
        '正常人: [常规做法]; 我: [搞笑做法]',
        '听说[热点话题]很火,我也试了试,结果...',
        'POV: 当你[场景描述],没想到[意外]'
      ],
      contentModules: [
        '【预期】正常情况应该是[A],大家都会[常规反应]',
        '【铺垫】但是我这边的情况有点不一样,[暗示细节]',
        '【反转1】没想到[意外情况1],这还不是最离谱的',
        '【反转2】更离谱的是[意外情况2],我人傻了',
        '【包袱】最后[最大的反转/笑点],笑死我了'
      ],
      closingActions: [
        '你们遇到过这种情况吗? 哈哈哈哈',
        '评论区说说你的搞笑经历',
        '笑死的点个赞,让我看看有多少人',
        '关注我,每天更新沙雕内容',
        '下期更离谱,记得来看'
      ],
      keyFeatures: ['节奏快', '反转强', '共鸣感', '娱乐性'],
      bestPlatforms: ['douyin', 'bilibili', 'xiaohongshu']
    }
  ],
  examples: [
    'AI写作工具使用指南: 预期VS现实,最后一个笑死我了',
    'POV: 当新手第一次用视频剪辑软件...救命哈哈哈'
  ],
  requirements: [
    '节奏要快,3秒内抓住注意力',
    '反转要出人意料但合理',
    '包袱要集中,不要拖沓',
    '结合热点或普遍经历更容易共鸣'
  ],
  antiPatterns: [
    '避免: 铺垫太长,观众失去耐心',
    '避免: 反转生硬,强行搞笑',
    '避免: 过度依赖烂梗,缺少新意'
  ]
};

/**
 * 📦 开箱体验型
 * 特点: 第一视角 + 即时反应 + 真实评测
 */
export const VIDEO_SCRIPT_UNBOXING: ContentFormConfig = {
  id: 'video-script-unboxing',
  name: '开箱体验',
  category: 'video-script',
  description: '第一视角展示,即时反应,真实评测',
  variants: [
    {
      structure: '【期待介绍】→ 【开箱过程】→ 【功能测试】→ 【真实反馈】→ 【购买建议】',
      openingHooks: [
        '期待了[时长]的[产品]终于到了,迫不及待开箱给大家看',
        '花了[价格]买的[产品],到底值不值? 一起来看',
        '网上说[产品]超好用,今天来验证一下是不是真的',
        '这个[产品]在[平台]爆火,我也入手了,来看看实际如何',
        '拆快递时间! 这次买的是[产品],据说可以[功能]'
      ],
      contentModules: [
        '【外观】第一眼的感觉是[印象],包装[评价],质感[评价]',
        '【配件】里面有[配件清单],这个[配件]挺实用/意外/鸡肋',
        '【功能1测试】先试试[功能],哇/额/嗯,[真实反应]+[具体表现]',
        '【功能2测试】再看看[功能],这个[优点/缺点],和我预期[对比]',
        '【综合感受】用下来[时长],总体感觉[评价],特别是[亮点/槽点]'
      ],
      closingActions: [
        '优点: [优点列表]; 缺点: [缺点列表]; 适合[人群]',
        '如果你[使用场景],建议入手; 如果你[场景],可能不太适合',
        '评论区说说你的使用感受或想问的问题',
        '想看更多[类别]测评就关注我',
        '下期测评[下一个产品],记得来看'
      ],
      keyFeatures: ['真实性', '即时性', '细节展示', '客观评价'],
      bestPlatforms: ['douyin', 'bilibili', 'xiaohongshu']
    }
  ],
  examples: [
    'AI写作工具深度测评 | 花了3天时间,给大家整理了这份真实报告',
    '小红书爆款剪辑软件开箱! 新手友好度vs专业度,实测给你看'
  ],
  requirements: [
    '必须是第一时间的真实反应',
    '展示细节,包括优缺点',
    '提供客观的购买建议',
    '避免纯夸或纯黑,要平衡'
  ],
  antiPatterns: [
    '避免: 明显的广告植入感',
    '避免: 只说优点不说缺点',
    '避免: 过度表演,不真实'
  ]
};

/**
 * 🎓 教程教学型
 * 特点: 步骤清晰 + 画面示范 + 可跟学
 */
export const VIDEO_SCRIPT_TUTORIAL: ContentFormConfig = {
  id: 'video-script-tutorial',
  name: '教程教学',
  category: 'video-script',
  description: '手把手教学,步骤清晰,可跟着操作',
  variants: [
    {
      structure: '【成果展示】→ 【工具准备】→ 【分步教学】→ 【常见问题】→ 【作业布置】',
      openingHooks: [
        '今天教大家如何用[工具]实现[效果],小白也能学会',
        '[数字]分钟学会[技能],我把步骤拆解得很细了',
        '很多人问我[问题]怎么做,今天统一出个教程',
        '手把手教你[技能],看完这个视频你就会了',
        '这个[方法]超简单,只需要[数字]步,跟我一起做'
      ],
      contentModules: [
        '【前期准备】需要准备[工具/材料],可以在[渠道]获取',
        '【第一步】首先[操作],注意[细节],像这样[演示]',
        '【第二步】然后[操作],这里容易出错的地方是[提醒],记得[注意事项]',
        '【第三步】接着[操作],看到[现象]就说明成功了',
        '【优化技巧】如果想要[更好效果],可以[进阶技巧]'
      ],
      closingActions: [
        '完整步骤我放在评论区置顶了,大家可以保存',
        '跟着做的话,做完了在评论区打卡展示',
        '有不懂的地方随时问我,我会回复',
        '学会的点个赞,让我看看有多少人',
        '下期教[下一个技能],想学的关注我'
      ],
      keyFeatures: ['可操作性', '步骤清晰', '细节提醒', '可跟学'],
      bestPlatforms: ['bilibili', 'douyin', 'xiaohongshu']
    }
  ],
  examples: [
    '5分钟学会用AI生成小红书爆款标题 | 完整操作流程,小白必看',
    '视频剪辑新手入门教程 | 从导入素材到导出成片,全程实操演示'
  ],
  requirements: [
    '步骤要细致,每步都要演示',
    '提醒常见错误和注意事项',
    '语速适中,给观众思考时间',
    '提供可下载的文字步骤'
  ],
  antiPatterns: [
    '避免: 跳步骤,假设观众有基础',
    '避免: 操作太快,观众跟不上',
    '避免: 专业术语过多不解释'
  ]
};

/**
 * 🧠 知识讲解型
 * 特点: 系统化 + 深度解析 + 概念阐释
 */
export const VIDEO_SCRIPT_KNOWLEDGE: ContentFormConfig = {
  id: 'video-script-knowledge',
  name: '知识讲解',
  category: 'video-script',
  description: '系统化知识传递,深度解析概念和原理',
  variants: [
    {
      structure: '【问题引入】→ 【概念解释】→ 【原理阐述】→ 【案例说明】→ 【总结延伸】',
      openingHooks: [
        '你知道[概念]背后的原理是什么吗? 今天给大家讲透',
        '关于[主题],网上很多说法都是错的,真相其实是这样的',
        '为什么[现象]? 这背后涉及到[原理],听我慢慢讲',
        '很多人对[概念]有误解,今天用最简单的方式给大家解释清楚',
        '[主题]系列第[数字]期: 深入理解[核心概念]'
      ],
      contentModules: [
        '【定义】简单来说,[概念]就是[通俗解释],专业定义是[正式定义]',
        '【原理】它的工作原理是[机制说明],可以类比为[生活案例]',
        '【拆解】具体可以分为[维度1][维度2][维度3],分别对应[作用]',
        '【案例】比如[实际案例],这里就用到了[概念],效果是[结果]',
        '【误区】很多人以为[错误认知],其实正确的是[正确认知]'
      ],
      closingActions: [
        '这期内容比较硬核,建议多看几遍,有问题评论区讨论',
        '理解了这个概念,你就超越了90%的人',
        '下期讲[相关主题],感兴趣的记得关注',
        '把这个分享给需要的朋友,一起学习进步',
        '想深入学习的可以看我往期的[相关内容]'
      ],
      keyFeatures: ['系统性', '深度', '逻辑清晰', '通俗易懂'],
      bestPlatforms: ['bilibili', 'zhihu', 'wechat']
    }
  ],
  examples: [
    '深度解析: AI是如何生成文本的? 从原理到应用完整讲解',
    '小红书算法机制揭秘 | 理解这3个核心逻辑,你的笔记才能爆'
  ],
  requirements: [
    '概念解释要通俗易懂',
    '提供类比和案例帮助理解',
    '逻辑严密,层层递进',
    '适当使用图表或动画辅助'
  ],
  antiPatterns: [
    '避免: 纯理论堆砌,晦涩难懂',
    '避免: 缺少案例,过于抽象',
    '避免: 逻辑跳跃,缺少铺垫'
  ]
};

/**
 * 📹 Vlog型
 * 特点: 生活化 + 第一视角 + 真实记录
 */
export const VIDEO_SCRIPT_VLOG: ContentFormConfig = {
  id: 'video-script-vlog',
  name: 'Vlog',
  category: 'video-script',
  description: '生活化记录,第一视角,真实分享',
  variants: [
    {
      structure: '【日常引入】→ 【过程记录】→ 【感受分享】→ 【生活思考】',
      openingHooks: [
        '今天是[日期],[身份]的一天,带大家看看我的日常',
        '记录一下最近在做的[事情],分享一些真实感受',
        '[时间]的[地点],我正在[做什么],突然想和大家聊聊',
        '这周发生了一些事,想用vlog的形式记录下来',
        '日常vlog | [主题],顺便和大家分享[话题]'
      ],
      contentModules: [
        '【场景1】[时间],我在[地点]做[事情],[真实感受/想法]',
        '【过程】[具体过程描述],中间遇到了[小插曲],还挺有意思的',
        '【对话】[与谁]聊天,ta说[观点],我觉得[自己想法]',
        '【思考】做这个事情让我想到[延伸思考],其实[观点]',
        '【日常】顺便给大家看看[生活细节],这是我的[习惯/日常]'
      ],
      closingActions: [
        '今天就到这里,明天继续记录',
        '你们的日常是怎样的? 评论区聊聊',
        '喜欢这种vlog形式的话告诉我,我多拍点',
        '关注我,记录[身份]的真实生活',
        '下期想看什么主题的vlog? 留言告诉我'
      ],
      keyFeatures: ['生活化', '真实性', '第一视角', '情感联结'],
      bestPlatforms: ['bilibili', 'douyin', 'xiaohongshu']
    }
  ],
  examples: [
    '内容创作者的一天 | 从选题到成稿,我的工作日常vlog',
    '在家办公第30天 | 分享我的效率工具和时间管理方法'
  ],
  requirements: [
    '保持真实,不要过度表演',
    '展示生活细节,增加亲近感',
    '可以加入个人思考和观点',
    '节奏不要太慢,适当剪辑'
  ],
  antiPatterns: [
    '避免: 过度摆拍,失去真实感',
    '避免: 纯流水账,缺少重点',
    '避免: 隐私过度暴露'
  ]
};

// ================== 访谈对话类 ==================

/**
 * 🎭 角色对话体
 * 特点: 两个视角 + 观点碰撞 + 戏剧性
 */
export const INTERVIEW_DIALOGUE: ContentFormConfig = {
  id: 'interview-dialogue',
  name: '角色对话体',
  category: 'interview',
  description: '通过两个角色的对话,展现观点碰撞和信息传递',
  variants: [
    {
      structure: '【角色设定】→ 【话题引入】→ 【观点交锋】→ 【深度探讨】→ 【结论共识】',
      openingHooks: [
        '[角色A]: [问题/观点]; [角色B]: 这个问题有意思,我来说说我的看法',
        '新手 vs 老手,关于[话题]的不同理解',
        '[角色A]好奇: [问题]; [角色B]解答: 让我给你讲清楚',
        '乐观派 vs 现实派,我们对[话题]的看法竟然完全不同',
        '[角色A]: 大家都说[观点]; [角色B]: 等等,我有不同意见'
      ],
      contentModules: [
        'A: [提问/质疑]; B: [回应/解释]',
        'A: 但是[反驳]; B: 你说的有道理,不过[补充观点]',
        'A: 那[延伸问题]呢? B: 这就涉及到[深层原理]了',
        'A: 举个例子? B: 比如[具体案例],[解释说明]',
        'A: 所以结论是[总结]; B: 对,而且还要注意[补充要点]'
      ],
      closingActions: [
        'A: 今天学到了很多; B: 评论区说说你的看法',
        '你更认同哪个观点? A还是B?',
        '下期话题: [预告],欢迎来辩',
        '觉得有用的话点赞收藏,让更多人看到',
        '想听我们聊什么话题? 评论告诉我'
      ],
      keyFeatures: ['互动性', '观点碰撞', '信息密度', '趣味性'],
      bestPlatforms: ['douyin', 'bilibili', 'xiaohongshu']
    }
  ],
  examples: [
    '新手 vs 老手: 关于AI工具的10个争论,哪个观点你更认同?',
    '甲方 vs 乙方: 内容创作中的常见分歧,我们聊开了'
  ],
  requirements: [
    '角色设定要有差异性',
    '观点要有碰撞但不对立',
    '信息量要大但不枯燥',
    '节奏要快,避免冗长'
  ],
  antiPatterns: [
    '避免: 一方完全压制另一方',
    '避免: 对话过于生硬不自然',
    '避免: 为了争论而争论,缺少建设性'
  ]
};

/**
 * ❓ Q&A问答体
 * 特点: 问题驱动 + 针对性强 + 高效传递
 */
export const INTERVIEW_QA: ContentFormConfig = {
  id: 'interview-qa',
  name: 'Q&A问答体',
  category: 'interview',
  description: '问题驱动,快速解答用户关心的问题',
  variants: [
    {
      structure: '【高频问题收集】→ 【逐个解答】→ 【补充说明】→ 【延伸建议】',
      openingHooks: [
        '收集了大家问得最多的[数字]个问题,今天统一解答',
        'Q&A时间! 关于[主题],你们想知道的都在这里',
        '评论区高频问题合集,看看有没有你关心的',
        '[数字]个关于[话题]的灵魂拷问,我来认真回答',
        '粉丝提问: [问题]; 我的回答可能会颠覆你的认知'
      ],
      contentModules: [
        'Q1: [问题]? A: [简明回答]+[详细解释]',
        'Q2: [问题]? A: 这个问题很典型,[背景说明]+[答案]',
        'Q3: [问题]? A: 分情况,[情况1][答案1];[情况2][答案2]',
        'Q4: [问题]? A: [回答],补充一点: [额外信息]',
        'Q5: [问题]? A: [答案],相关的[延伸知识]也了解一下'
      ],
      closingActions: [
        '还有其他问题欢迎评论区继续提问',
        '这期解答了[数字]个问题,对你有帮助吗?',
        '收藏起来,需要的时候再来看',
        '下期Q&A征集问题,评论区留言',
        '想看更多[主题]内容就关注我'
      ],
      keyFeatures: ['针对性', '高效', '实用性', '覆盖面广'],
      bestPlatforms: ['xiaohongshu', 'zhihu', 'bilibili']
    }
  ],
  examples: [
    'AI工具使用Q&A | 新手最关心的15个问题,全部解答',
    '小红书运营避坑指南 | 100+私信问题精选回答'
  ],
  requirements: [
    '问题要具有代表性',
    '回答要简明扼要',
    '可以分类归纳相似问题',
    '提供可操作的建议'
  ],
  antiPatterns: [
    '避免: 问题太偏门缺少普适性',
    '避免: 回答模糊不具体',
    '避免: 问题太多,单个讲不透'
  ]
};

/**
 * 🎤 虚拟采访型
 * 特点: 专业性 + 深度挖掘 + 结构化
 */
export const INTERVIEW_VIRTUAL: ContentFormConfig = {
  id: 'interview-virtual',
  name: '虚拟采访',
  category: 'interview',
  description: '模拟采访形式,深度挖掘某个话题或人物',
  variants: [
    {
      structure: '【嘉宾介绍】→ 【背景故事】→ 【核心话题】→ 【深度提问】→ 【经验总结】',
      openingHooks: [
        '今天请到了[虚拟嘉宾],[身份背景],来和我们聊聊[话题]',
        '本期访谈嘉宾是[角色设定],ta在[领域]有着[成就],让我们听听ta的故事',
        '如果可以采访[名人/角色],我最想问的是[问题],今天模拟一下这个对话',
        '特别企划: 对话[虚拟角色],探讨[深度话题]',
        '这期我们换个形式,用采访的方式聊聊[主题]'
      ],
      contentModules: [
        '主持人: [嘉宾],先和大家介绍一下你自己吧; 嘉宾: [自我介绍]',
        '主持人: [背景提问]; 嘉宾: [背景故事/经历分享]',
        '主持人: 关于[核心话题],你的看法是? 嘉宾: [核心观点]',
        '主持人: [深度提问]; 嘉宾: [深度回答]+[案例/数据]',
        '主持人: 最后,[总结性提问]; 嘉宾: [经验总结/建议]'
      ],
      closingActions: [
        '感谢[嘉宾]的分享,今天的内容干货很多,建议收藏',
        '你对[嘉宾]的观点怎么看? 评论区聊聊',
        '下期想采访谁? 或者想聊什么话题? 留言告诉我',
        '更多深度访谈内容,记得关注',
        '本期金句: [嘉宾的某句话],你认同吗?'
      ],
      keyFeatures: ['专业性', '深度', '结构化', '启发性'],
      bestPlatforms: ['zhihu', 'wechat', 'bilibili']
    }
  ],
  examples: [
    '对话AI时代的内容创作者 | 我们该如何应对变化?',
    '如果可以采访小红书创始人,我会问这10个问题'
  ],
  requirements: [
    '嘉宾设定要清晰',
    '问题要有层次,由浅入深',
    '回答要有深度和见解',
    '保持访谈的专业感'
  ],
  antiPatterns: [
    '避免: 问题过于表面',
    '避免: 回答空洞缺少实质内容',
    '避免: 对话缺少逻辑线'
  ]
};

/**
 * 🎥 真实采访剪辑型
 * 特点: 真实素材 + 精华提炼 + 观点呈现
 */
export const INTERVIEW_REAL: ContentFormConfig = {
  id: 'interview-real',
  name: '真实采访剪辑',
  category: 'interview',
  description: '真实采访素材剪辑,提炼精华观点',
  variants: [
    {
      structure: '【采访背景】→ 【受访者介绍】→ 【核心观点】→ 【细节展开】→ 【总结升华】',
      openingHooks: [
        '我采访了[数字]位[身份],问了他们同一个问题: [问题]',
        '街头采访: 关于[话题],路人的回答出乎意料',
        '这次采访了[受访者],[身份背景],ta的观点很值得思考',
        '[地点]随机采访,看看大家对[话题]的真实看法',
        '我问了[受访者群体]一个问题,答案五花八门,一起来看'
      ],
      contentModules: [
        '【受访者1】[身份]: [核心观点]+[理由]',
        '【受访者2】[身份]: 我的看法不太一样,[不同观点]',
        '【受访者3】[身份]: [观点]+[个人经历/案例]',
        '【共同点】虽然大家看法不同,但都提到了[共性]',
        '【差异点】[群体A]倾向于[观点],[群体B]更认同[观点]'
      ],
      closingActions: [
        '听完这些观点,你怎么看? 评论区说说',
        '如果是你,你会怎么回答这个问题?',
        '感谢所有受访者的真诚分享',
        '下期采访话题: [预告],期待你的参与',
        '想看更多街头采访就关注我'
      ],
      keyFeatures: ['真实性', '多元视角', '共鸣感', '社会性'],
      bestPlatforms: ['bilibili', 'douyin', 'xiaohongshu']
    }
  ],
  examples: [
    '我采访了10位内容创作者: 你为什么选择这个职业?',
    '街头采访: 大家每天会花多少时间在AI工具上?'
  ],
  requirements: [
    '采访要真实,不要摆拍',
    '剪辑要提炼精华,控制节奏',
    '呈现多元观点,避免单一视角',
    '可以加入数据统计或总结'
  ],
  antiPatterns: [
    '避免: 明显的导向性问题',
    '避免: 剪辑断章取义',
    '避免: 只展示极端观点'
  ]
};

// ================== 洞察观点类 ==================

/**
 * 📈 趋势观点表达型
 * 特点: 前瞻性 + 数据支撑 + 行业洞察
 */
export const INSIGHT_TREND: ContentFormConfig = {
  id: 'insight-trend',
  name: '趋势观点表达',
  category: 'insight',
  description: '行业趋势分析,前瞻性观点,数据支撑',
  variants: [
    {
      structure: '【现象观察】→ 【数据佐证】→ 【趋势分析】→ 【影响预测】→ 【应对建议】',
      openingHooks: [
        '最近观察到一个现象: [现象],这可能预示着[趋势]',
        '数据显示,[数据],这背后反映了[趋势变化]',
        '[领域]正在发生一个重要转变,很多人还没意识到',
        '我预测[时间]内,[趋势]会成为主流,理由如下',
        '关于[话题],我有一个可能不太主流的观点'
      ],
      contentModules: [
        '【现象】我注意到[具体现象],[数据/案例]可以证明',
        '【原因】为什么会这样? 因为[底层逻辑/驱动因素]',
        '【趋势】基于这个判断,我认为[未来趋势]',
        '【影响】这会带来[积极影响]和[潜在挑战]',
        '【建议】对于[目标人群],我的建议是[行动建议]'
      ],
      closingActions: [
        '你认同这个判断吗? 评论区说说你的观察',
        '时间会验证这个观点,我们[时间]后再来回顾',
        '想了解更多行业洞察就关注我',
        '分享给你的[身份]朋友,一起讨论',
        '下期聊聊[相关话题],记得来看'
      ],
      keyFeatures: ['前瞻性', '洞察力', '数据驱动', '专业性'],
      bestPlatforms: ['zhihu', 'wechat', 'weibo']
    }
  ],
  examples: [
    'AI内容创作的3个趋势,2025年可能彻底改变行业格局',
    '我观察到一个现象: 小红书的内容生态正在发生这样的变化'
  ],
  requirements: [
    '观点要有数据或案例支撑',
    '分析要有逻辑性',
    '提供可验证的预测',
    '给出可操作的建议'
  ],
  antiPatterns: [
    '避免: 纯主观臆断,缺少依据',
    '避免: 过度绝对化的预测',
    '避免: 只说趋势不说应对'
  ]
};

/**
 * 💭 情绪共鸣故事型
 * 特点: 情感联结 + 真实经历 + 价值观输出
 */
export const INSIGHT_EMOTIONAL: ContentFormConfig = {
  id: 'insight-emotional',
  name: '情绪共鸣故事',
  category: 'insight',
  description: '通过真实经历引发情感共鸣,传递价值观',
  variants: [
    {
      structure: '【情绪引入】→ 【经历叙述】→ 【感受表达】→ 【思考升华】→ 【价值输出】',
      openingHooks: [
        '[情绪词],每次[场景]的时候,我都会想起[经历]',
        '说实话,[情绪],因为[原因],但我慢慢理解了[道理]',
        '今天想和大家聊聊[情绪话题],因为我知道很多人和我一样[感受]',
        '[时间]的一个[事件],让我对[话题]有了全新的认识',
        '如果你也曾经[经历],希望我的故事能给你一些安慰/启发'
      ],
      contentModules: [
        '【经历】[时间/场景],我经历了[事件],[当时的感受]',
        '【困境】那段时间我一直在[挣扎/思考],[具体表现]',
        '【转变】直到[转折点],我突然明白了[道理]',
        '【感悟】现在回想起来,[深层感悟],[对当下的影响]',
        '【共鸣】我想很多人也有类似的经历,[普遍情绪]对吗?'
      ],
      closingActions: [
        '如果你也有类似的经历,评论区聊聊,我们互相治愈',
        '希望这个故事能给正在[困境]的你一些力量',
        '分享给需要听到这些话的朋友',
        '你的故事我也想听,评论区等你',
        '我们都在慢慢变好,一起加油'
      ],
      keyFeatures: ['真实性', '情感共鸣', '治愈性', '价值观'],
      bestPlatforms: ['xiaohongshu', 'wechat', 'weibo']
    }
  ],
  examples: [
    '从焦虑到接纳: 我和AI工具的相处之道,也是我和自己的和解',
    '做内容创作的第100天,我想和你聊聊那些没说出口的话'
  ],
  requirements: [
    '情感要真挚,不要煽情',
    '经历要真实,细节要具体',
    '要有思考和升华',
    '传递正向的价值观'
  ],
  antiPatterns: [
    '避免: 过度煽情,情绪化',
    '避免: 贩卖焦虑或负能量',
    '避免: 空洞的鸡汤,缺少实质'
  ]
};

/**
 * 📣 营销活动推广型
 * 特点: 价值主张 + 利益驱动 + 行动引导
 */
export const INSIGHT_MARKETING: ContentFormConfig = {
  id: 'insight-marketing',
  name: '营销活动推广',
  category: 'insight',
  description: '产品/活动推广,突出价值主张,引导行动',
  variants: [
    {
      structure: '【痛点切入】→ 【解决方案】→ 【价值主张】→ 【信任背书】→ 【行动引导】',
      openingHooks: [
        '还在为[痛点]烦恼吗? [产品/活动]可以帮你解决',
        '[时间]限定! [活动],错过等一年',
        '发现了一个宝藏[产品/活动],[核心价值],必须分享给你们',
        '如果你有[需求],[产品/活动]绝对值得一试',
        '好消息! [品牌]推出了[活动],[核心利益点]'
      ],
      contentModules: [
        '【痛点】很多[目标人群]都面临[痛点问题],比如[具体场景]',
        '【方案】[产品/活动]专门针对这个问题,[解决方式]',
        '【价值】核心亮点有[亮点1][亮点2][亮点3],特别是[最大卖点]',
        '【证明】我自己用了[时长],[真实反馈],[可量化结果]',
        '【优惠】现在[活动详情],[优惠力度],[截止时间]'
      ],
      closingActions: [
        '感兴趣的话,[行动指引],先到先得',
        '评论区扣[关键词],我发给你详细信息',
        '限时[时间],抓紧时间不要错过',
        '已经有[数字]人参加了,反馈都很好',
        '有疑问的话评论区问我,我会一一解答'
      ],
      keyFeatures: ['痛点明确', '价值清晰', '信任背书', '行动引导'],
      bestPlatforms: ['xiaohongshu', 'wechat', 'douyin']
    }
  ],
  examples: [
    'AI写作训练营开营! 7天带你从小白到高手,限时早鸟价',
    '小红书爆款训练营 | 30天陪跑计划,已帮助500+博主涨粉'
  ],
  requirements: [
    '痛点要精准',
    '价值主张要清晰',
    '提供信任背书(数据/案例)',
    '行动指引要明确'
  ],
  antiPatterns: [
    '避免: 过度夸大,虚假宣传',
    '避免: 只讲产品不讲用户利益',
    '避免: 缺少信任背书,难以转化'
  ]
};

// ================== 导出配置 ==================

/**
 * 所有内容形式配置
 */
export const ALL_CONTENT_FORMS: Record<string, ContentFormConfig> = {
  // 图文类
  'image-text-planting': IMAGE_TEXT_PLANTING,
  'image-text-tutorial': IMAGE_TEXT_TUTORIAL,
  'image-text-knowledge-card': IMAGE_TEXT_KNOWLEDGE_CARD,
  'image-text-case-study': IMAGE_TEXT_CASE_STUDY,

  // 视频脚本类
  'video-script-story': VIDEO_SCRIPT_STORY,
  'video-script-comedy': VIDEO_SCRIPT_COMEDY,
  'video-script-unboxing': VIDEO_SCRIPT_UNBOXING,
  'video-script-tutorial': VIDEO_SCRIPT_TUTORIAL,
  'video-script-knowledge': VIDEO_SCRIPT_KNOWLEDGE,
  'video-script-vlog': VIDEO_SCRIPT_VLOG,

  // 访谈对话类
  'interview-dialogue': INTERVIEW_DIALOGUE,
  'interview-qa': INTERVIEW_QA,
  'interview-virtual': INTERVIEW_VIRTUAL,
  'interview-real': INTERVIEW_REAL,

  // 洞察观点类
  'insight-trend': INSIGHT_TREND,
  'insight-emotional': INSIGHT_EMOTIONAL,
  'insight-marketing': INSIGHT_MARKETING
};

/**
 * 按类别获取内容形式
 */
export const getFormsByCategory = (
  category: 'image-text' | 'video-script' | 'interview' | 'insight'
): ContentFormConfig[] => {
  return Object.values(ALL_CONTENT_FORMS).filter(form => form.category === category);
};

/**
 * 随机选择变体(避免模板化)
 */
export const selectRandomVariant = (variants: any[], field: keyof ContentFormVariant): string => {
  if (variants.length === 0) return '';
  const variant = variants[Math.floor(Math.random() * variants.length)];
  const options = variant[field];
  if (Array.isArray(options)) {
    return options[Math.floor(Math.random() * options.length)];
  }
  return options || '';
};

/**
 * 内容形式类型
 */
export type ContentFormId = keyof typeof ALL_CONTENT_FORMS;
export type ContentFormCategory = 'image-text' | 'video-script' | 'interview' | 'insight';

/**
 * 内容形式名称映射
 */
export const CONTENT_FORM_NAMES: Record<ContentFormCategory, string> = {
  'image-text': '图文类',
  'video-script': '视频脚本类',
  'interview': '访谈对话类',
  'insight': '洞察观点类'
};

export default ALL_CONTENT_FORMS;
