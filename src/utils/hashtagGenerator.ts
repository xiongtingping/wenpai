/**
 * 智能话题标签生成器
 * 支持自动提取、系统推荐、热点话题等功能
 */

export interface HashtagSuggestion {
  tag: string;
  type: 'extracted' | 'recommended' | 'trending';
  relevance: number; // 相关度评分 0-1
  description?: string;
}

export interface HashtagGeneratorOptions {
  maxTags?: number;
  includeExtracted?: boolean;
  includeRecommended?: boolean;
  includeTrending?: boolean;
  platformId?: string;
  includeBrands?: boolean;
  includeIndustry?: boolean;
  includePersona?: boolean;
}

export interface PlatformTagConfig {
  minTags: number;
  maxTags: number;
  preferredTags: number;
  tagFormat: string;
  dimensions: TagDimension[];
}

export interface TagDimension {
  name: string;
  weight: number; // 权重 0-1
  maxCount: number; // 该维度最大标签数
}

export interface MultiDimensionTag {
  tag: string;
  dimension: 'industry' | 'topic' | 'content' | 'account' | 'persona' | 'trending';
  type: 'extracted' | 'recommended' | 'trending' | 'brand';
  relevance: number;
  description?: string;
}

export class HashtagGenerator {
  private commonWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没', '看', '好', '自己', '这', '那', '什么', '可以', '如果', '因为', '所以', '但是', '然后', '还是', '或者', '虽然', '而且', '不过', '只是', '已经', '现在', '时候', '地方', '问题', '方法', '内容', '文章', '分享', '推荐', '介绍', '今天', '大家', '非常', '特别', '真的', '觉得', '应该', '可能', '需要', '希望', '喜欢', '知道', '发现', '学习', '工作', '生活', '时间', '开始', '继续', '完成', '成功', '失败', '重要', '简单', '复杂', '容易', '困难', '快速', '慢慢', '突然', '马上', '立刻', '经常', '偶尔', '总是', '从来', '永远', '曾经', '以前', '现在', '将来', '未来', '过去', '当时', '那时', '这时', '同时', '首先', '然后', '最后', '总之', '因此', '所以', '不过', '但是', '虽然', '尽管', '即使', '如果', '假如', '除非', '只要', '无论', '不管', '无论如何', '总而言之'
  ]);

  // 平台差异化配置
  private platformConfigs: Record<string, PlatformTagConfig> = {
    'douyin': {
      minTags: 3,
      maxTags: 5,
      preferredTags: 5,
      tagFormat: '#{}',
      dimensions: [
        { name: 'industry', weight: 0.25, maxCount: 1 },
        { name: 'topic', weight: 0.2, maxCount: 1 },
        { name: 'content', weight: 0.2, maxCount: 1 },
        { name: 'account', weight: 0.15, maxCount: 1 },
        { name: 'persona', weight: 0.1, maxCount: 1 },
        { name: 'trending', weight: 0.1, maxCount: 1 }
      ]
    },
    'xiaohongshu': {
      minTags: 6,
      maxTags: 10,
      preferredTags: 8,
      tagFormat: '#{}',
      dimensions: [
        { name: 'industry', weight: 0.2, maxCount: 2 },
        { name: 'topic', weight: 0.2, maxCount: 2 },
        { name: 'content', weight: 0.2, maxCount: 2 },
        { name: 'account', weight: 0.15, maxCount: 2 },
        { name: 'persona', weight: 0.15, maxCount: 1 },
        { name: 'trending', weight: 0.1, maxCount: 1 }
      ]
    },
    'weibo': {
      minTags: 3,
      maxTags: 5,
      preferredTags: 4,
      tagFormat: '#{}#',
      dimensions: [
        { name: 'industry', weight: 0.2, maxCount: 1 },
        { name: 'topic', weight: 0.3, maxCount: 2 },
        { name: 'content', weight: 0.2, maxCount: 1 },
        { name: 'trending', weight: 0.3, maxCount: 1 }
      ]
    },
    'zhihu': {
      minTags: 2,
      maxTags: 3,
      preferredTags: 3,
      tagFormat: '#{}',
      dimensions: [
        { name: 'industry', weight: 0.4, maxCount: 1 },
        { name: 'content', weight: 0.4, maxCount: 1 },
        { name: 'topic', weight: 0.2, maxCount: 1 }
      ]
    },
    'bilibili': {
      minTags: 4,
      maxTags: 8,
      preferredTags: 6,
      tagFormat: '#{}',
      dimensions: [
        { name: 'industry', weight: 0.25, maxCount: 2 },
        { name: 'content', weight: 0.25, maxCount: 2 },
        { name: 'topic', weight: 0.2, maxCount: 1 },
        { name: 'account', weight: 0.15, maxCount: 1 },
        { name: 'trending', weight: 0.15, maxCount: 1 }
      ]
    }
  };

  // 品牌库（示例数据）
  private brandDatabase = new Set([
    '苹果', 'Apple', 'iPhone', 'iPad', 'MacBook',
    '华为', 'Huawei', 'OPPO', 'vivo', '小米', 'Xiaomi',
    '特斯拉', 'Tesla', '比亚迪', 'BYD',
    '耐克', 'Nike', '阿迪达斯', 'Adidas', '优衣库', 'Uniqlo',
    '星巴克', 'Starbucks', '麦当劳', 'McDonald',
    '腾讯', '阿里巴巴', '百度', '字节跳动', '美团'
  ]);

  /**
   * 生成多维度话题标签建议 - 改进的语义分析
   */
  async generateHashtags(content: string, options: HashtagGeneratorOptions = {}): Promise<HashtagSuggestion[]> {
    const {
      platformId = 'general',
      includeBrands = true,
      includeIndustry = true,
      includePersona = true
    } = options;

    // 获取平台配置
    const platformConfig = this.platformConfigs[platformId] || this.platformConfigs['douyin'];

    // 改进的语义分析
    const semanticKeywords = this.extractSemanticKeywords(content);

    // 生成多维度标签
    const multiDimensionTags = await this.generateMultiDimensionTags(content, platformId, {
      includeBrands,
      includeIndustry,
      includePersona
    });

    // 基于语义关键词过滤和评分
    const relevantTags = this.filterBySemanticRelevance(multiDimensionTags, semanticKeywords, content);

    // 按维度分配标签
    const finalTags = this.allocateTagsByDimensions(relevantTags, platformConfig);

    // 转换为HashtagSuggestion格式
    return finalTags.map(tag => ({
      tag: tag.tag,
      type: tag.type,
      relevance: tag.relevance,
      description: `${tag.dimension}维度标签: ${tag.description || ''}`
    }));
  }

  /**
   * 提取语义关键词 - 改进的内容分析
   */
  private extractSemanticKeywords(content: string): string[] {
    // 移除标点符号和特殊字符
    const cleanContent = content.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');

    // 分词（简单实现）
    const words = cleanContent.split(/\s+/).filter(word =>
      word.length >= 2 &&
      !this.commonWords.has(word) &&
      !/^\d+$/.test(word) // 排除纯数字
    );

    // 计算词频
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // 提取高频关键词
    const keywords = Array.from(wordFreq.entries())
      .filter(([word, freq]) => freq >= 1 && word.length <= 10) // 过滤过长的词
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    return keywords;
  }

  /**
   * 基于语义相关性过滤标签
   */
  private filterBySemanticRelevance(
    tags: MultiDimensionTag[],
    semanticKeywords: string[],
    content: string
  ): MultiDimensionTag[] {
    return tags.map(tag => {
      // 计算标签与内容的相关性
      let relevanceScore = tag.relevance;

      // 检查标签是否包含语义关键词
      const tagLower = tag.tag.toLowerCase();
      const contentLower = content.toLowerCase();

      // 直接匹配加分
      if (contentLower.includes(tagLower)) {
        relevanceScore += 0.3;
      }

      // 语义关键词匹配加分
      const keywordMatches = semanticKeywords.filter(keyword =>
        tagLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(tagLower)
      ).length;

      relevanceScore += keywordMatches * 0.1;

      // 标签长度惩罚（过长的标签相关性降低）
      if (tag.tag.length > 8) {
        relevanceScore -= 0.1;
      }

      // 确保相关性在0-1范围内
      relevanceScore = Math.min(1, Math.max(0, relevanceScore));

      return {
        ...tag,
        relevance: relevanceScore
      };
    }).filter(tag => tag.relevance >= 0.3); // 只保留相关性>=0.3的标签
  }

  /**
   * 生成多维度标签
   */
  private async generateMultiDimensionTags(
    content: string,
    platformId: string,
    options: { includeBrands: boolean; includeIndustry: boolean; includePersona: boolean }
  ): Promise<MultiDimensionTag[]> {
    const tags: MultiDimensionTag[] = [];

    // 1. 行业标签
    if (options.includeIndustry) {
      const industryTags = this.generateIndustryTags(content);
      tags.push(...industryTags);
    }

    // 2. 话题标签
    const topicTags = this.generateTopicTags(content);
    tags.push(...topicTags);

    // 3. 内容标签
    const contentTags = this.generateContentTags(content);
    tags.push(...contentTags);

    // 4. 账号标签
    const accountTags = this.generateAccountTags(content, platformId);
    tags.push(...accountTags);

    // 5. 人设标签
    if (options.includePersona) {
      const personaTags = this.generatePersonaTags(content);
      tags.push(...personaTags);
    }

    // 6. 热点话题
    const trendingTags = await this.generateTrendingTags(platformId);
    tags.push(...trendingTags);

    // 7. 品牌标签
    if (options.includeBrands) {
      const brandTags = this.generateBrandTags(content);
      tags.push(...brandTags);
    }

    return tags;
  }

  /**
   * 按维度分配标签
   */
  private allocateTagsByDimensions(tags: MultiDimensionTag[], config: PlatformTagConfig): MultiDimensionTag[] {
    const result: MultiDimensionTag[] = [];
    const dimensionCounts: Record<string, number> = {};

    // 按相关度排序
    const sortedTags = tags.sort((a, b) => b.relevance - a.relevance);

    // 按维度权重分配标签
    for (const dimension of config.dimensions) {
      const dimensionTags = sortedTags.filter(tag => tag.dimension === dimension.name);
      const maxCount = Math.min(dimension.maxCount, dimensionTags.length);

      for (let i = 0; i < maxCount; i++) {
        if (result.length < config.preferredTags) {
          result.push(dimensionTags[i]);
          dimensionCounts[dimension.name] = (dimensionCounts[dimension.name] || 0) + 1;
        }
      }
    }

    // 如果还没达到目标数量，补充高相关度标签
    if (result.length < config.minTags) {
      const remainingTags = sortedTags.filter(tag => !result.includes(tag));
      const needed = config.minTags - result.length;
      result.push(...remainingTags.slice(0, needed));
    }

    return result.slice(0, config.maxTags);
  }

  /**
   * 生成行业标签
   */
  private generateIndustryTags(content: string): MultiDimensionTag[] {
    const industryKeywords = {
      '科技数码': ['科技', '数码', '手机', '电脑', '软件', 'app', '人工智能', 'AI', '互联网', '程序', '代码'],
      '美食料理': ['美食', '料理', '做菜', '菜谱', '烹饪', '食谱', '餐厅', '小吃', '甜品', '饮品'],
      '时尚穿搭': ['时尚', '穿搭', '搭配', '服装', '造型', '风格', '潮流', '品牌', '配饰'],
      '美妆护肤': ['美妆', '护肤', '化妆', '彩妆', '护肤品', '面膜', '口红', '粉底'],
      '健身运动': ['健身', '运动', '减肥', '瑜伽', '跑步', '锻炼', '肌肉', '训练'],
      '旅行出游': ['旅行', '旅游', '出行', '景点', '攻略', '游记', '酒店', '机票'],
      '教育学习': ['教育', '学习', '知识', '技能', '课程', '培训', '考试', '读书'],
      '职场办公': ['职场', '工作', '办公', '职业', '求职', '面试', '升职', '创业'],
      '家居生活': ['家居', '装修', '家具', '收纳', '清洁', '园艺', '宠物'],
      '娱乐影视': ['娱乐', '电影', '电视剧', '综艺', '明星', '音乐', '游戏']
    };

    const tags: MultiDimensionTag[] = [];

    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
      if (matchCount > 0) {
        const relevance = Math.min(matchCount / keywords.length * 2, 1);
        tags.push({
          tag: industry,
          dimension: 'industry',
          type: 'recommended',
          relevance,
          description: `基于${matchCount}个关键词匹配`
        });
      }
    });

    return tags.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 生成话题标签
   */
  private generateTopicTags(content: string): MultiDimensionTag[] {
    const topicPatterns = [
      { pattern: /今日|今天|最新|热门/, tag: '今日热点', relevance: 0.8 },
      { pattern: /分享|推荐|安利/, tag: '好物分享', relevance: 0.7 },
      { pattern: /教程|方法|技巧|攻略/, tag: '实用教程', relevance: 0.9 },
      { pattern: /测评|体验|使用/, tag: '产品测评', relevance: 0.8 },
      { pattern: /生活|日常|记录/, tag: '生活记录', relevance: 0.6 },
      { pattern: /创意|有趣|好玩/, tag: '创意内容', relevance: 0.7 },
      { pattern: /专业|深度|详细/, tag: '深度解析', relevance: 0.8 }
    ];

    const tags: MultiDimensionTag[] = [];

    topicPatterns.forEach(({ pattern, tag, relevance }) => {
      if (pattern.test(content)) {
        tags.push({
          tag,
          dimension: 'topic',
          type: 'recommended',
          relevance,
          description: '基于内容模式匹配'
        });
      }
    });

    return tags;
  }

  /**
   * 从内容中提取关键词
   */
  private extractKeywords(content: string): HashtagSuggestion[] {
    const suggestions: HashtagSuggestion[] = [];

    // 提取中文词汇（2-6个字符）
    const chineseWords = content.match(/[\u4e00-\u9fa5]{2,6}/g) || [];
    
    // 提取英文词汇
    const englishWords = content.match(/[a-zA-Z]{3,}/g) || [];

    // 处理中文词汇
    const chineseKeywords = chineseWords
      .filter(word => !this.commonWords.has(word))
      .filter(word => word.length >= 2 && word.length <= 6)
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 处理英文词汇
    const englishKeywords = englishWords
      .filter(word => word.length >= 3)
      .map(word => word.toLowerCase())
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    // 转换为建议格式
    Object.entries(chineseKeywords).forEach(([word, count]) => {
      const relevance = Math.min(count / 3, 1); // 出现3次以上为满分
      if (relevance >= 0.3) { // 只保留相关度较高的
        suggestions.push({
          tag: word,
          type: 'extracted',
          relevance,
          description: `从内容中提取的关键词（出现${count}次）`
        });
      }
    });

    Object.entries(englishKeywords).forEach(([word, count]) => {
      const relevance = Math.min(count / 2, 1);
      if (relevance >= 0.3) {
        suggestions.push({
          tag: word,
          type: 'extracted',
          relevance,
          description: `从内容中提取的英文关键词（出现${count}次）`
        });
      }
    });

    return suggestions;
  }

  /**
   * 获取系统推荐标签
   */
  private getRecommendedTags(content: string, platformId: string): HashtagSuggestion[] {
    const suggestions: HashtagSuggestion[] = [];

    // 基于内容类型的推荐
    const contentTypeRecommendations = this.analyzeContentType(content);
    suggestions.push(...contentTypeRecommendations);

    // 基于平台特性的推荐
    const platformRecommendations = this.getPlatformSpecificTags(platformId);
    suggestions.push(...platformRecommendations);

    return suggestions;
  }

  /**
   * 生成内容标签
   */
  private generateContentTags(content: string): MultiDimensionTag[] {
    const contentTypes = [
      { pattern: /教程|步骤|方法/, tag: '教程分享', relevance: 0.9 },
      { pattern: /测评|评测|体验/, tag: '产品测评', relevance: 0.8 },
      { pattern: /开箱|首发|新品/, tag: '开箱体验', relevance: 0.8 },
      { pattern: /对比|比较|选择/, tag: '对比分析', relevance: 0.7 },
      { pattern: /记录|日常|生活/, tag: '生活记录', relevance: 0.6 },
      { pattern: /总结|盘点|合集/, tag: '内容盘点', relevance: 0.7 },
      { pattern: /问答|解答|答疑/, tag: '问题解答', relevance: 0.8 }
    ];

    const tags: MultiDimensionTag[] = [];

    contentTypes.forEach(({ pattern, tag, relevance }) => {
      if (pattern.test(content)) {
        tags.push({
          tag,
          dimension: 'content',
          type: 'recommended',
          relevance,
          description: '基于内容类型识别'
        });
      }
    });

    return tags;
  }

  /**
   * 生成账号标签
   */
  private generateAccountTags(content: string, platformId: string): MultiDimensionTag[] {
    const accountTypes = [
      { pattern: /干货|实用|技巧/, tag: '干货分享', relevance: 0.8 },
      { pattern: /专业|深度|详细/, tag: '专业解析', relevance: 0.9 },
      { pattern: /简单|易懂|新手/, tag: '新手友好', relevance: 0.7 },
      { pattern: /创意|有趣|好玩/, tag: '创意达人', relevance: 0.7 },
      { pattern: /真实|亲测|体验/, tag: '真实体验', relevance: 0.8 }
    ];

    const tags: MultiDimensionTag[] = [];

    accountTypes.forEach(({ pattern, tag, relevance }) => {
      if (pattern.test(content)) {
        tags.push({
          tag,
          dimension: 'account',
          type: 'recommended',
          relevance,
          description: '基于账号定位识别'
        });
      }
    });

    return tags;
  }

  /**
   * 生成人设标签
   */
  private generatePersonaTags(content: string): MultiDimensionTag[] {
    const personaTypes = [
      { pattern: /职场|工作|办公/, tag: '职场达人', relevance: 0.8 },
      { pattern: /生活|日常|家居/, tag: '生活博主', relevance: 0.7 },
      { pattern: /科技|数码|技术/, tag: '科技博主', relevance: 0.9 },
      { pattern: /美食|料理|做菜/, tag: '美食达人', relevance: 0.8 },
      { pattern: /时尚|穿搭|美妆/, tag: '时尚博主', relevance: 0.8 },
      { pattern: /健身|运动|减肥/, tag: '健身达人', relevance: 0.8 },
      { pattern: /旅行|旅游|出行/, tag: '旅行博主', relevance: 0.8 },
      { pattern: /学习|教育|知识/, tag: '知识博主', relevance: 0.8 }
    ];

    const tags: MultiDimensionTag[] = [];

    personaTypes.forEach(({ pattern, tag, relevance }) => {
      if (pattern.test(content)) {
        tags.push({
          tag,
          dimension: 'persona',
          type: 'recommended',
          relevance,
          description: '基于人设定位识别'
        });
      }
    });

    return tags;
  }

  /**
   * 生成热点话题标签
   */
  private async generateTrendingTags(platformId: string): Promise<MultiDimensionTag[]> {
    // 模拟热点话题数据
    const trendingTopics = [
      '今日热点', '网络热梗', '流行趋势', '热门话题', '实时热搜',
      '社会热点', '科技前沿', '生活方式', '文化现象', '娱乐八卦'
    ];

    // 模拟异步获取
    await new Promise(resolve => setTimeout(resolve, 50));

    return trendingTopics.slice(0, 2).map(topic => ({
      tag: topic,
      dimension: 'trending' as const,
      type: 'trending' as const,
      relevance: 0.6,
      description: '当前热门话题'
    }));
  }

  /**
   * 生成品牌标签
   */
  private generateBrandTags(content: string): MultiDimensionTag[] {
    const tags: MultiDimensionTag[] = [];

    this.brandDatabase.forEach(brand => {
      if (content.includes(brand)) {
        tags.push({
          tag: brand,
          dimension: 'industry',
          type: 'brand',
          relevance: 0.9,
          description: `品牌标签: ${brand}`
        });

        // 添加品牌+产品类型标签
        const productTypes = ['测评', '体验', '推荐', '使用'];
        productTypes.forEach(type => {
          if (content.includes(type)) {
            tags.push({
              tag: `${brand}${type}`,
              dimension: 'content',
              type: 'brand',
              relevance: 0.8,
              description: `品牌产品标签: ${brand}${type}`
            });
          }
        });
      }
    });

    return tags;
  }

  /**
   * 分析内容类型并推荐相关标签
   */
  private analyzeContentType(content: string): HashtagSuggestion[] {
    const suggestions: HashtagSuggestion[] = [];

    const contentPatterns = [
      {
        pattern: /教程|方法|步骤|如何|怎么|技巧|攻略/,
        tags: ['教程', '方法', '技巧', '攻略', '学习', '干货'],
        type: '教程类内容'
      },
      {
        pattern: /分享|推荐|安利|种草|好物|测评|体验/,
        tags: ['分享', '推荐', '种草', '好物', '测评', '体验'],
        type: '分享推荐类'
      },
      {
        pattern: /生活|日常|记录|vlog|随拍|日记/,
        tags: ['生活', '日常', '记录', 'vlog', '随拍', '生活记录'],
        type: '生活记录类'
      },
      {
        pattern: /美食|做菜|菜谱|料理|烹饪|食谱/,
        tags: ['美食', '做菜', '菜谱', '料理', '烹饪', '美食分享'],
        type: '美食类内容'
      },
      {
        pattern: /旅行|旅游|出行|景点|攻略|游记/,
        tags: ['旅行', '旅游', '出行', '景点', '旅行攻略', '游记'],
        type: '旅行类内容'
      },
      {
        pattern: /科技|数码|手机|电脑|软件|app/,
        tags: ['科技', '数码', '手机', '电脑', '软件', '科技分享'],
        type: '科技数码类'
      },
      {
        pattern: /健身|运动|减肥|瑜伽|跑步|锻炼/,
        tags: ['健身', '运动', '减肥', '瑜伽', '跑步', '健康生活'],
        type: '健身运动类'
      },
      {
        pattern: /穿搭|时尚|搭配|服装|造型|风格/,
        tags: ['穿搭', '时尚', '搭配', '服装', '造型', '时尚穿搭'],
        type: '时尚穿搭类'
      }
    ];

    contentPatterns.forEach(({ pattern, tags, type }) => {
      if (pattern.test(content)) {
        tags.forEach(tag => {
          suggestions.push({
            tag,
            type: 'recommended',
            relevance: 0.8,
            description: `基于${type}推荐的标签`
          });
        });
      }
    });

    return suggestions;
  }

  /**
   * 获取平台特定的推荐标签
   */
  private getPlatformSpecificTags(platformId: string): HashtagSuggestion[] {
    const platformTags: Record<string, string[]> = {
      'xiaohongshu': ['小红书', '种草', '好物推荐', '生活分享', '日常', '美好生活'],
      'weibo': ['微博', '热门', '话题', '分享', '日常', '生活'],
      'douyin': ['抖音', '短视频', '创意', '有趣', '生活', '分享'],
      'zhihu': ['知乎', '干货', '分享', '学习', '思考', '专业'],
      'bilibili': ['B站', '视频', '分享', '学习', '有趣', '创作'],
      'wechat': ['微信', '公众号', '分享', '原创', '深度', '思考']
    };

    const tags = platformTags[platformId] || ['分享', '生活', '日常'];

    return tags.map(tag => ({
      tag,
      type: 'recommended' as const,
      relevance: 0.6,
      description: `${platformId}平台推荐标签`
    }));
  }

  /**
   * 获取热点话题（模拟实现）
   */
  private async getTrendingTags(platformId: string): Promise<HashtagSuggestion[]> {
    // 模拟热点话题数据
    const trendingTopics = [
      '今日热点', '热门话题', '实时热搜', '网络热梗', '流行趋势',
      '社会热点', '娱乐八卦', '科技前沿', '生活方式', '文化现象'
    ];

    // 模拟异步获取
    await new Promise(resolve => setTimeout(resolve, 100));

    return trendingTopics.slice(0, 3).map(topic => ({
      tag: topic,
      type: 'trending' as const,
      relevance: 0.7,
      description: '当前热门话题'
    }));
  }

  /**
   * 去重并按相关度排序
   */
  private deduplicateAndSort(suggestions: HashtagSuggestion[]): HashtagSuggestion[] {
    const tagMap = new Map<string, HashtagSuggestion>();

    suggestions.forEach(suggestion => {
      const existing = tagMap.get(suggestion.tag);
      if (!existing || suggestion.relevance > existing.relevance) {
        tagMap.set(suggestion.tag, suggestion);
      }
    });

    return Array.from(tagMap.values())
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 格式化标签为平台特定格式
   */
  formatTagsForPlatform(tags: string[], platformId: string): string {
    const config = this.platformConfigs[platformId] || this.platformConfigs['douyin'];

    return tags.map(tag => {
      // 移除标签中的#号，避免重复
      const cleanTag = tag.replace(/^#+/, '');
      return config.tagFormat.replace('{}', cleanTag);
    }).join(' ');
  }

  /**
   * 获取平台配置
   */
  getPlatformConfig(platformId: string): PlatformTagConfig {
    return this.platformConfigs[platformId] || this.platformConfigs['douyin'];
  }

  /**
   * 保存用户标签偏好
   */
  saveUserTagPreferences(platformId: string, tags: string[]): void {
    const key = `user_tag_preferences_${platformId}`;
    const preferences = {
      tags,
      timestamp: Date.now(),
      usageCount: this.getUserTagUsageCount(platformId) + 1
    };
    localStorage.setItem(key, JSON.stringify(preferences));
  }

  /**
   * 获取用户标签使用次数
   */
  private getUserTagUsageCount(platformId: string): number {
    const key = `user_tag_preferences_${platformId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const preferences = JSON.parse(stored);
      return preferences.usageCount || 0;
    }
    return 0;
  }

  /**
   * 获取用户标签偏好
   */
  getUserTagPreferences(platformId: string): string[] {
    const key = `user_tag_preferences_${platformId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const preferences = JSON.parse(stored);
      return preferences.tags || [];
    }
    return [];
  }

  /**
   * 批量生成多平台标签
   */
  async generateMultiPlatformHashtags(
    content: string,
    platformIds: string[]
  ): Promise<Record<string, HashtagSuggestion[]>> {
    const results: Record<string, HashtagSuggestion[]> = {};

    for (const platformId of platformIds) {
      try {
        const hashtags = await this.generateHashtags(content, {
          platformId,
          includeBrands: true,
          includeIndustry: true,
          includePersona: true
        });
        results[platformId] = hashtags;
      } catch (error) {
        console.error(`生成${platformId}标签失败:`, error);
        results[platformId] = [];
      }
    }

    return results;
  }
}

// 导出单例实例
export const hashtagGenerator = new HashtagGenerator();
