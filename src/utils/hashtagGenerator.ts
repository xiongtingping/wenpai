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
}

export class HashtagGenerator {
  private commonWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没', '看', '好', '自己', '这', '那', '什么', '可以', '如果', '因为', '所以', '但是', '然后', '还是', '或者', '虽然', '而且', '不过', '只是', '已经', '现在', '时候', '地方', '问题', '方法', '内容', '文章', '分享', '推荐', '介绍', '今天', '大家', '非常', '特别', '真的', '觉得', '应该', '可能', '需要', '希望', '喜欢', '知道', '发现', '学习', '工作', '生活', '时间', '开始', '继续', '完成', '成功', '失败', '重要', '简单', '复杂', '容易', '困难', '快速', '慢慢', '突然', '马上', '立刻', '经常', '偶尔', '总是', '从来', '永远', '曾经', '以前', '现在', '将来', '未来', '过去', '当时', '那时', '这时', '同时', '首先', '然后', '最后', '总之', '因此', '所以', '不过', '但是', '虽然', '尽管', '即使', '如果', '假如', '除非', '只要', '无论', '不管', '无论如何', '总而言之'
  ]);

  /**
   * 生成话题标签建议
   */
  async generateHashtags(content: string, options: HashtagGeneratorOptions = {}): Promise<HashtagSuggestion[]> {
    const {
      maxTags = 10,
      includeExtracted = true,
      includeRecommended = true,
      includeTrending = true,
      platformId = 'general'
    } = options;

    const suggestions: HashtagSuggestion[] = [];

    // 1. 自动提取关键词
    if (includeExtracted) {
      const extractedTags = this.extractKeywords(content);
      suggestions.push(...extractedTags);
    }

    // 2. 系统推荐标签
    if (includeRecommended) {
      const recommendedTags = this.getRecommendedTags(content, platformId);
      suggestions.push(...recommendedTags);
    }

    // 3. 热点话题（模拟）
    if (includeTrending) {
      const trendingTags = await this.getTrendingTags(platformId);
      suggestions.push(...trendingTags);
    }

    // 去重并按相关度排序
    const uniqueTags = this.deduplicateAndSort(suggestions);

    return uniqueTags.slice(0, maxTags);
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
    const formatters: Record<string, (tags: string[]) => string> = {
      'xiaohongshu': (tags) => tags.map(tag => `#${tag}`).join(' '),
      'weibo': (tags) => tags.map(tag => `#${tag}#`).join(' '),
      'douyin': (tags) => tags.map(tag => `#${tag}`).join(' '),
      'zhihu': (tags) => tags.map(tag => `#${tag}`).join(' '),
      'bilibili': (tags) => tags.map(tag => `#${tag}`).join(' '),
      'wechat': (tags) => tags.map(tag => `#${tag}`).join(' ')
    };

    const formatter = formatters[platformId] || formatters['xiaohongshu'];
    return formatter(tags);
  }
}

// 导出单例实例
export const hashtagGenerator = new HashtagGenerator();
