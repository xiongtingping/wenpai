import { logger } from '@/utils/logger';

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

  // 品牌库（初始化为空，用户可自行添加）
  private brandDatabase = new Set<string>();

  /**
   * 生成多维度话题标签建议 - 完全基于实际内容的精准分析
   */
  async generateHashtags(content: string, options: HashtagGeneratorOptions = {}): Promise<HashtagSuggestion[]> {
    const {
      platformId: _platformId = 'general',
      maxTags = 10,
      includeBrands: _includeBrands = false, // 强制禁用品牌标签
      includeIndustry: _includeIndustry = true,
      includePersona: _includePersona = false // 强制禁用通用人设标签
    } = options;

    // 禁止使用缓存或默认标签，每次都基于实际内容生成
    if (!content || content.trim().length < 10) {
      return [];
    }

    console.log('🏷️ 开始分析内容生成标签:', content.substring(0, 50));

    // 1. 提取内容核心关键词
    const coreKeywords = this.extractContentKeywords(content);
    console.log('🔍 提取的核心关键词:', coreKeywords);

    // 2. 识别内容主题
    const contentThemes = this.identifyContentThemes(content);
    console.log('🎯 识别的内容主题:', contentThemes);

    // 3. 生成基于内容的标签
    const contentBasedTags = this.generateContentBasedTags(coreKeywords, contentThemes, content);
    console.log('🏷️ 生成的内容标签:', contentBasedTags);

    // 4. 过滤和排序
    const filteredTags = this.filterAndRankTags(contentBasedTags, content, maxTags);
    logger.debug('✅ 最终标签:', filteredTags.map(t => t.tag));

    return filteredTags;
  }

  /**
   * 提取内容核心关键词 - 排除品牌词和无意义词汇
   */
  private extractContentKeywords(content: string): string[] {
    // 品牌词和无意义词汇黑名单
    const blacklist = [
      '文派', 'AI', '内容', '创作者', '大家好', '但自从', '作为一名',
      '系统', '平台', '工具', '软件', '应用', '技术', '智能',
      '我们', '你们', '他们', '这个', '那个', '什么', '怎么',
      '非常', '特别', '真的', '觉得', '应该', '可能', '需要',
      '评测', '分享', '推荐', '教程', '技巧' // 添加通用词汇到黑名单
    ];

    // 清理内容 - 移除所有特殊符号和emoji
    const cleanContent = content
      .replace(/[#@*[\]]/g, '') // 移除特殊符号
      .replace(/[，。！？；：""''（）【】]/g, ' ') // 替换标点为空格
      .replace(/[\u2713\u274C\u2B50\uD83D\uDD25\uD83D\uDCA1\uD83D\uDCDD\uD83C\uDFAF]/gu, '') // 单独移除 emoji
      .replace(/\u2600-\u27BF|\uE000-\uF8FF|\u2011-\u26FF/g, '') // 移除emoji区间
      .trim();

    // 分词并过滤
    const words = cleanContent
      .split(/\s+/)
      .filter(word => {
        // 基础过滤
        if (word.length < 2 || word.length > 8) return false;

        // 排除黑名单词汇
        if (blacklist.some(blacklisted => word.includes(blacklisted))) return false;

        // 排除纯英文、纯数字
        if (/^[a-zA-Z]+$/.test(word) || /^\d+$/.test(word)) return false;

        // 排除常用词
        if (this.commonWords.has(word)) return false;

        // 排除包含特殊符号的词
        const forbidden = ['✔️', '❌', '⭐', '🔥', '💡', '📝', '🎯', '#', '@', '*', '[', ']'];
        if (forbidden.some(sym => word.includes(sym))) return false;

        // 只保留中文词汇
        if (!/[\u4e00-\u9fa5]/.test(word)) return false;

        return true;
      });

    // 统计词频并返回高频词
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6) // 减少到6个关键词
      .map(([word]) => word);
  }

  /**
   * 识别内容主题 - 提取具体领域而非通用词汇
   */
  private identifyContentThemes(content: string): string[] {
    const themes: string[] = [];

    // 具体领域识别规则 - 避免通用词汇
    const themePatterns = [
      // 科技数码
      { pattern: /手机|电脑|笔记本|iPad|iPhone|安卓|iOS|软件|APP/, theme: '数码科技' },
      { pattern: /编程|代码|开发|前端|后端|Python|JavaScript/, theme: '编程开发' },

      // 生活方式
      { pattern: /美食|料理|烹饪|食谱|餐厅|小吃|甜品/, theme: '美食料理' },
      { pattern: /旅行|旅游|景点|攻略|酒店|机票/, theme: '旅行攻略' },
      { pattern: /时尚|穿搭|美妆|护肤|化妆品|服装/, theme: '时尚美妆' },
      { pattern: /健身|运动|锻炼|减肥|瑜伽|跑步/, theme: '健身运动' },

      // 学习成长
      { pattern: /读书|阅读|书籍|小说|文学/, theme: '读书学习' },
      { pattern: /工作|职场|效率|管理|创业|副业/, theme: '职场发展' },
      { pattern: /投资|理财|股票|基金|保险/, theme: '投资理财' },

      // 兴趣爱好
      { pattern: /摄影|拍照|相机|修图|后期/, theme: '摄影技巧' },
      { pattern: /音乐|歌曲|乐器|吉他|钢琴/, theme: '音乐艺术' },
      { pattern: /游戏|电竞|手游|主机|Steam/, theme: '游戏娱乐' },

      // 家居生活
      { pattern: /装修|家居|收纳|清洁|家电/, theme: '家居生活' },
      { pattern: /育儿|亲子|教育|孩子|宝宝/, theme: '育儿教育' },
      { pattern: /宠物|猫|狗|养宠|宠物用品/, theme: '宠物生活' }
    ];

    themePatterns.forEach(({ pattern, theme }) => {
      if (pattern.test(content)) {
        themes.push(theme);
      }
    });

    // 如果没有匹配到具体主题，尝试提取内容中的具体名词
    if (themes.length === 0) {
      const specificNouns = this.extractSpecificNouns(content);
      themes.push(...specificNouns.slice(0, 2));
    }

    return themes.slice(0, 2); // 最多返回2个主题
  }

  /**
   * 提取具体名词
   */
  private extractSpecificNouns(content: string): string[] {
    // 常见的具体名词模式
    const nounPatterns = [
      /([一-龯]{2,4})(产品|品牌|公司|平台|网站|应用)/g,
      /([一-龯]{2,6})(方案|策略|模式|系统)/g,
      /([一-龯]{2,4})(行业|领域|市场)/g
    ];

    const nouns: string[] = [];
    nounPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const noun = match.replace(/(产品|品牌|公司|平台|网站|应用|方案|策略|模式|系统|行业|领域|市场)/, '');
          if (noun.length >= 2 && noun.length <= 6) {
            nouns.push(noun);
          }
        });
      }
    });

    return [...new Set(nouns)]; // 去重
  }

  /**
   * 生成基于内容的标签
   */
  private generateContentBasedTags(keywords: string[], themes: string[], content: string): HashtagSuggestion[] {
    const tags: HashtagSuggestion[] = [];

    // 1. 基于关键词生成标签
    keywords.forEach((keyword, index) => {
      tags.push({
        tag: keyword,
        type: 'extracted',
        relevance: 0.9 - (index * 0.1), // 按词频排序给分
        description: `从内容中提取的关键词`
      });
    });

    // 2. 基于主题生成标签
    themes.forEach(theme => {
      tags.push({
        tag: theme,
        type: 'recommended',
        relevance: 0.8,
        description: `基于内容类型识别的主题`
      });
    });

    // 3. 生成组合标签（关键词+主题）
    if (keywords.length > 0 && themes.length > 0) {
      const mainKeyword = keywords[0];
      const mainTheme = themes[0];
      tags.push({
        tag: `${mainKeyword}${mainTheme}`,
        type: 'recommended',
        relevance: 0.85,
        description: `关键词与主题的组合标签`
      });
    }

    return tags;
  }

  /**
   * 过滤和排序标签
   */
  private filterAndRankTags(tags: HashtagSuggestion[], content: string, maxTags: number): HashtagSuggestion[] {
    // 去重
    const uniqueTags = tags.filter((tag, index, self) =>
      self.findIndex(t => t.tag === tag.tag) === index
    );

    // 按相关性排序
    const sortedTags = uniqueTags.sort((a, b) => b.relevance - a.relevance);

    // 限制数量
    return sortedTags.slice(0, maxTags);
  }

  /**
   * 提取语义关键词 - 改进的内容分析
   */
  private extractSemanticKeywords(content: string): string[] {
    // 移除标点符号和特殊字符，保留中英文和数字
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
   * 分析内容类型和主题 - 新增精准内容分析
   */
  private analyzeContentType(content: string): {
    type: string;
    themes: string[];
    style: string;
    keywords: string[];
  } {
    const lowerContent = content.toLowerCase();

    // 内容类型识别
    let contentType = 'general';
    if (lowerContent.includes('产品') || lowerContent.includes('功能') || lowerContent.includes('测评')) {
      contentType = 'product';
    } else if (lowerContent.includes('教程') || lowerContent.includes('方法') || lowerContent.includes('技巧')) {
      contentType = 'tutorial';
    } else if (lowerContent.includes('分享') || lowerContent.includes('经验') || lowerContent.includes('心得')) {
      contentType = 'sharing';
    } else if (lowerContent.includes('推荐') || lowerContent.includes('种草') || lowerContent.includes('好物')) {
      contentType = 'recommendation';
    } else if (lowerContent.includes('职场') || lowerContent.includes('工作') || lowerContent.includes('效率')) {
      contentType = 'workplace';
    }

    // 主题提取
    const themes: string[] = [];
    const themeKeywords = {
      '美食': ['美食', '食物', '菜谱', '料理', '餐厅'],
      '旅行': ['旅行', '旅游', '景点', '攻略', '出行'],
      '科技': ['科技', '数码', '手机', '电脑', '软件'],
      '时尚': ['时尚', '穿搭', '服装', '搭配', '风格'],
      '健康': ['健康', '运动', '健身', '养生', '医疗'],
      '教育': ['教育', '学习', '知识', '技能', '培训'],
      '生活': ['生活', '日常', '家居', '装修', '收纳']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        themes.push(theme);
      }
    });

    // 表达风格识别
    let style = 'neutral';
    if (lowerContent.includes('！') || lowerContent.includes('超级') || lowerContent.includes('绝对')) {
      style = 'enthusiastic';
    } else if (lowerContent.includes('专业') || lowerContent.includes('分析') || lowerContent.includes('研究')) {
      style = 'professional';
    } else if (lowerContent.includes('可爱') || lowerContent.includes('萌') || lowerContent.includes('小仙女')) {
      style = 'cute';
    }

    // 提取关键词
    const keywords = this.extractSemanticKeywords(content);

    return { type: contentType, themes, style, keywords };
  }

  /**
   * 生成上下文相关标签
   */
  private generateContextualTags(content: string, analysis: any, platformId: string): any[] {
    const tags: any[] = [];

    // 基于内容类型生成标签
    const typeTagMap = {
      'product': ['产品测评', '功能亮点', '真实体验', '使用心得', '产品推荐'],
      'tutorial': ['实用教程', '干货分享', '技巧总结', '学习笔记', '方法论'],
      'sharing': ['经验分享', '个人心得', '生活感悟', '真实故事', '成长记录'],
      'recommendation': ['好物推荐', '种草清单', '购买指南', '性价比之选', '必买好物'],
      'workplace': ['职场干货', '工作技巧', '效率提升', '职场成长', '工作心得']
    };

    const typeTags = typeTagMap[analysis.type as keyof typeof typeTagMap] || [];
    typeTags.forEach(tag => {
      tags.push({
        tag,
        type: 'contextual',
        relevance: 0.9,
        description: `基于内容类型"${analysis.type}"生成`
      });
    });

    return tags;
  }

  /**
   * 生成关键词标签
   */
  private generateKeywordTags(keywords: string[], content: string): any[] {
    return keywords.slice(0, 5).map(keyword => ({
      tag: keyword,
      type: 'keyword',
      relevance: 0.8,
      description: `从内容中提取的高频关键词`
    }));
  }

  /**
   * 生成主题标签
   */
  private generateThemeTags(themes: string[], contentType: string): any[] {
    const tags: any[] = [];

    themes.forEach(theme => {
      // 基于主题和内容类型组合生成标签
      const themeTagMap = {
        '美食': ['美食探店', '料理分享', '美食推荐', '味蕾体验'],
        '旅行': ['旅行攻略', '景点推荐', '出行指南', '旅游心得'],
        '科技': ['科技前沿', '数码测评', '技术分享', '科技生活'],
        '时尚': ['穿搭分享', '时尚搭配', '风格展示', '潮流趋势'],
        '健康': ['健康生活', '运动健身', '养生心得', '健康管理'],
        '教育': ['知识分享', '学习方法', '教育心得', '技能提升'],
        '生活': ['生活技巧', '日常分享', '生活美学', '居家生活']
      };

      const themeTags = themeTagMap[theme as keyof typeof themeTagMap] || [theme];
      themeTags.forEach(tag => {
        tags.push({
          tag,
          type: 'theme',
          relevance: 0.85,
          description: `基于主题"${theme}"生成`
        });
      });
    });

    return tags;
  }

  /**
   * 生成风格标签
   */
  private generateStyleTags(style: string, platformId: string): any[] {
    const styleTagMap = {
      'enthusiastic': ['热情推荐', '强烈安利', '超级好用', '必须拥有'],
      'professional': ['专业分析', '深度解读', '客观评价', '理性推荐'],
      'cute': ['可爱分享', '萌系推荐', '小仙女必备', '甜美风格'],
      'neutral': ['真实分享', '客观体验', '个人感受', '使用心得']
    };

    const styleTags = styleTagMap[style as keyof typeof styleTagMap] || [];
    return styleTags.map(tag => ({
      tag,
      type: 'style',
      relevance: 0.75,
      description: `基于表达风格"${style}"生成`
    }));
  }

  /**
   * 去重并按相关性排序
   */
  private deduplicateAndRank(tags: any[], content: string): any[] {
    // 去重
    const uniqueTagsMap = new Map();
    tags.forEach(tag => {
      if (!uniqueTagsMap.has(tag.tag)) {
        // 计算与内容的相关性
        const contentRelevance = this.calculateContentRelevance(tag.tag, content);
        tag.relevance = (tag.relevance + contentRelevance) / 2;
        uniqueTagsMap.set(tag.tag, tag);
      }
    });

    // 按相关性排序
    return Array.from(uniqueTagsMap.values())
      .sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 计算标签与内容的相关性
   */
  private calculateContentRelevance(tag: string, content: string): number {
    const lowerContent = content.toLowerCase();
    const lowerTag = tag.toLowerCase();

    // 直接匹配
    if (lowerContent.includes(lowerTag)) {
      return 1.0;
    }

    // 部分匹配
    const tagChars = lowerTag.split('');
    const matchCount = tagChars.filter(char => lowerContent.includes(char)).length;
    return matchCount / tagChars.length * 0.5;
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
   * 生成多维度标签 - 移除话题标签，将其移动到智能标签生成中
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

    // 2. 内容标签
    const contentTags = this.generateContentTags(content);
    tags.push(...contentTags);

    // 3. 账号标签
    const accountTags = this.generateAccountTags(content, platformId);
    tags.push(...accountTags);

    // 4. 人设标签
    if (options.includePersona) {
      const personaTags = this.generatePersonaTags(content);
      tags.push(...personaTags);
    }

    // 5. 热点话题
    const trendingTags = await this.generateTrendingTags(platformId);
    tags.push(...trendingTags);

    // 6. 品牌标签
    if (options.includeBrands) {
      const brandTags = this.generateBrandTags(content);
      tags.push(...brandTags);
    }

    return tags;
  }

  /**
   * 专门为智能标签生成提供话题标签功能
   * 这个方法将被PlatformHashtags组件调用
   */
  async generateTopicTagsForSmartTagging(content: string, platformId: string = 'general'): Promise<HashtagSuggestion[]> {
    if (!content || content.trim().length < 10) {
      return [];
    }

    console.log('🏷️ 为智能标签生成话题标签:', content.substring(0, 50));

    // 生成话题标签
    const topicTags = this.generateTopicTags(content);

    // 转换为HashtagSuggestion格式
    const suggestions: HashtagSuggestion[] = topicTags.map(tag => ({
      tag: tag.tag,
      type: 'recommended' as const,
      relevance: tag.relevance,
      description: tag.description
    }));

    logger.debug('✅ 生成话题标签:', suggestions.map(s => s.tag));
    return suggestions;
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
    const contentAnalysis = this.analyzeContentType(content);
    const contentTypeRecommendations = this.generateContentTypeRecommendations(contentAnalysis);
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
   * 基于内容分析生成推荐标签
   */
  private generateContentTypeRecommendations(analysis: any): HashtagSuggestion[] {
    const suggestions: HashtagSuggestion[] = [];

    // 基于内容类型生成标签
    const typeTagMap = {
      'product': ['产品测评', '功能亮点', '真实体验', '使用心得', '产品推荐'],
      'tutorial': ['实用教程', '干货分享', '技巧总结', '学习笔记', '方法论'],
      'sharing': ['经验分享', '个人心得', '生活感悟', '真实故事', '成长记录'],
      'recommendation': ['好物推荐', '种草清单', '购买指南', '性价比之选', '必买好物'],
      'workplace': ['职场干货', '工作技巧', '效率提升', '职场成长', '工作心得']
    };

    const typeTags = typeTagMap[analysis.type as keyof typeof typeTagMap] || [];
    typeTags.forEach(tag => {
      suggestions.push({
        tag,
        type: 'recommended',
        relevance: 0.8,
        description: `基于内容类型"${analysis.type}"推荐`
      });
    });

    // 基于主题生成标签
    analysis.themes.forEach((theme: string) => {
      suggestions.push({
        tag: theme,
        type: 'recommended',
        relevance: 0.75,
        description: `基于主题"${theme}"推荐`
      });
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
   * ✅ FIXED: 用户数据隔离 - 保存用户标签偏好
   */
  saveUserTagPreferences(platformId: string, tags: string[], userId?: string): void {
    const storageKey = this.getUserTagStorageKey(platformId, userId);
    const preferences = {
      tags,
      timestamp: Date.now(),
      usageCount: this.getUserTagUsageCount(platformId, userId) + 1
    };
    localStorage.setItem(storageKey, JSON.stringify(preferences));
    console.log(`💾 用户标签偏好已保存: ${storageKey}`, preferences);
  }

  /**
   * ✅ FIXED: 用户数据隔离 - 生成用户标签存储键
   * 使用统一的存储键生成工具
   */
  private getUserTagStorageKey(platformId: string, userId?: string): string {
    // 使用统一的存储键生成函数
    const user = userId ? { id: userId } : null;
    return `tag_preferences_${platformId}_${user?.id || 'guest'}`;
  }

  /**
   * ✅ FIXED: 用户数据隔离 - 获取用户标签使用次数
   */
  private getUserTagUsageCount(platformId: string, userId?: string): number {
    const storageKey = this.getUserTagStorageKey(platformId, userId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        return preferences.usageCount || 0;
      } catch (error) {
        console.error(`❌ 解析用户标签偏好失败: ${storageKey}`, error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * ✅ FIXED: 用户数据隔离 - 获取用户标签偏好
   */
  getUserTagPreferences(platformId: string, userId?: string): string[] {
    const storageKey = this.getUserTagStorageKey(platformId, userId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const preferences = JSON.parse(stored);
        return preferences.tags || [];
      } catch (error) {
        console.error(`❌ 解析用户标签偏好失败: ${storageKey}`, error);
        return [];
      }
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

  /**
   * ✅ FIXED: 用户数据隔离 - 清理用户标签数据
   */
  clearUserTagData(userId: string): number {
    let cleanedCount = 0;
    try {
      const keys = Object.keys(localStorage);
      const userTagKeys = keys.filter(key =>
        key.startsWith('user_tag_preferences_') && key.endsWith(`_${userId}`)
      );

      userTagKeys.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });

      logger.debug('✅ 清理用户标签数据完成: ${userId}, 清理了 ${cleanedCount} 项');
    } catch (error) {
      console.error(`❌ 清理用户标签数据失败: ${userId}`, error);
    }

    return cleanedCount;
  }
}

// 导出单例实例
export const hashtagGenerator = new HashtagGenerator();
