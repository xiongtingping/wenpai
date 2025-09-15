#!/usr/bin/env node

/**
 * 话题标签生成器国际化脚本
 * 处理 hashtagGenerator.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const HASHTAG_GENERATOR_PATH = 'src/utils/hashtagGenerator.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class HashtagGeneratorI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('🏷️ 开始话题标签生成器国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理话题标签生成器文件
      await this.processHashtagGeneratorFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 话题标签生成器国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📁 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      const zhContent = fs.readFileSync(ZH_LOCALE_PATH, 'utf8');
      this.zhTranslations = JSON.parse(zhContent);
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      const enContent = fs.readFileSync(EN_LOCALE_PATH, 'utf8');
      this.enTranslations = JSON.parse(enContent);
    }
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 初始化 hashtagGenerator 翻译对象
    if (!this.zhTranslations.hashtagGenerator) {
      this.zhTranslations.hashtagGenerator = {};
    }
    if (!this.enTranslations.hashtagGenerator) {
      this.enTranslations.hashtagGenerator = {};
    }

    // 注释和描述
    this.addTranslation('hashtagGenerator.comments.intelligentGenerator', '智能话题标签生成器', 'Intelligent Hashtag Generator');
    this.addTranslation('hashtagGenerator.comments.supportFeatures', '支持自动提取、系统推荐、热点话题等功能', 'Supports automatic extraction, system recommendations, trending topics and other features');
    this.addTranslation('hashtagGenerator.comments.relevanceScore', '相关度评分 0-1', 'Relevance Score 0-1');
    this.addTranslation('hashtagGenerator.comments.weight', '权重 0-1', 'Weight 0-1');
    this.addTranslation('hashtagGenerator.comments.maxCountPerDimension', '该维度最大标签数', 'Maximum Tag Count for This Dimension');
    this.addTranslation('hashtagGenerator.comments.platformDifferentiation', '平台差异化配置', 'Platform Differentiation Configuration');
    this.addTranslation('hashtagGenerator.comments.brandDatabase', '品牌库（初始化为空，用户可自行添加）', 'Brand Database (Initially Empty, Users Can Add)');

    // 功能描述
    this.addTranslation('hashtagGenerator.functions.generateMultiDimensionTags', '生成多维度话题标签建议 - 完全基于实际内容的精准分析', 'Generate Multi-dimensional Hashtag Suggestions - Precise Analysis Based on Actual Content');
    this.addTranslation('hashtagGenerator.functions.extractContentKeywords', '提取内容核心关键词 - 排除品牌词和无意义词汇', 'Extract Core Content Keywords - Exclude Brand Words and Meaningless Vocabulary');
    this.addTranslation('hashtagGenerator.functions.identifyContentThemes', '识别内容主题 - 提取具体领域而非通用词汇', 'Identify Content Themes - Extract Specific Domains Rather Than Generic Terms');
    this.addTranslation('hashtagGenerator.functions.extractSpecificNouns', '提取具体名词', 'Extract Specific Nouns');
    this.addTranslation('hashtagGenerator.functions.generateContentBasedTags', '生成基于内容的标签', 'Generate Content-based Tags');
    this.addTranslation('hashtagGenerator.functions.filterAndRankTags', '过滤和排序标签', 'Filter and Rank Tags');

    // 日志消息
    this.addTranslation('hashtagGenerator.logs.startAnalyzing', '开始分析内容生成标签:', 'Start analyzing content to generate tags:');
    this.addTranslation('hashtagGenerator.logs.extractedKeywords', '提取的核心关键词:', 'Extracted core keywords:');
    this.addTranslation('hashtagGenerator.logs.identifiedThemes', '识别的内容主题:', 'Identified content themes:');
    this.addTranslation('hashtagGenerator.logs.generatedTags', '生成的内容标签:', 'Generated content tags:');
    this.addTranslation('hashtagGenerator.logs.finalTags', '最终标签:', 'Final tags:');
    this.addTranslation('hashtagGenerator.logs.generateTopicTags', '为智能标签生成话题标签:', 'Generate topic tags for intelligent tagging:');
    this.addTranslation('hashtagGenerator.logs.topicTagsGenerated', '生成话题标签:', 'Generated topic tags:');
    this.addTranslation('hashtagGenerator.logs.userPreferencesSaved', '用户标签偏好已保存:', 'User tag preferences saved:');
    this.addTranslation('hashtagGenerator.logs.parsePreferencesFailed', '解析用户标签偏好失败:', 'Failed to parse user tag preferences:');
    this.addTranslation('hashtagGenerator.logs.generatePlatformTagsFailed', '生成{{platform}}标签失败:', 'Failed to generate {{platform}} tags:');
    this.addTranslation('hashtagGenerator.logs.cleanupCompleted', '清理用户标签数据完成: {{userId}}, 清理了 {{count}} 项', 'User tag data cleanup completed: {{userId}}, cleaned {{count}} items');
    this.addTranslation('hashtagGenerator.logs.cleanupFailed', '清理用户标签数据失败: {{userId}}', 'Failed to clean user tag data: {{userId}}');

    // 错误消息
    this.addTranslation('hashtagGenerator.errors.contentTooShort', '内容过短，无法生成有效标签', 'Content too short to generate effective tags');
    this.addTranslation('hashtagGenerator.errors.storageKeyGeneration', '使用统一的存储键生成函数', 'Use unified storage key generation function');

    // 标签描述
    this.addTranslation('hashtagGenerator.descriptions.extractedKeyword', '从内容中提取的关键词', 'Keywords extracted from content');
    this.addTranslation('hashtagGenerator.descriptions.contentTheme', '基于内容类型识别的主题', 'Theme identified based on content type');
    this.addTranslation('hashtagGenerator.descriptions.combinedTag', '关键词与主题的组合标签', 'Combined tag of keywords and themes');
    this.addTranslation('hashtagGenerator.descriptions.highFrequencyKeyword', '从内容中提取的高频关键词', 'High-frequency keywords extracted from content');
    this.addTranslation('hashtagGenerator.descriptions.extractedKeywordWithCount', '从内容中提取的关键词（出现{{count}}次）', 'Keywords extracted from content (appeared {{count}} times)');
    this.addTranslation('hashtagGenerator.descriptions.englishKeywordWithCount', '从内容中提取的英文关键词（出现{{count}}次）', 'English keywords extracted from content (appeared {{count}} times)');
    this.addTranslation('hashtagGenerator.descriptions.contentTypeGenerated', '基于内容类型"{{type}}"生成', 'Generated based on content type "{{type}}"');
    this.addTranslation('hashtagGenerator.descriptions.themeGenerated', '基于主题"{{theme}}"生成', 'Generated based on theme "{{theme}}"');
    this.addTranslation('hashtagGenerator.descriptions.styleGenerated', '基于表达风格"{{style}}"生成', 'Generated based on expression style "{{style}}"');
    this.addTranslation('hashtagGenerator.descriptions.contentPatternMatch', '基于内容模式匹配', 'Based on content pattern matching');
    this.addTranslation('hashtagGenerator.descriptions.contentTypeIdentification', '基于内容类型识别', 'Based on content type identification');
    this.addTranslation('hashtagGenerator.descriptions.accountPositioning', '基于账号定位识别', 'Based on account positioning identification');
    this.addTranslation('hashtagGenerator.descriptions.personaPositioning', '基于人设定位识别', 'Based on persona positioning identification');
    this.addTranslation('hashtagGenerator.descriptions.currentTrending', '当前热门话题', 'Current trending topics');
    this.addTranslation('hashtagGenerator.descriptions.brandTag', '品牌标签: {{brand}}', 'Brand tag: {{brand}}');
    this.addTranslation('hashtagGenerator.descriptions.brandProductTag', '品牌产品标签: {{brand}}{{type}}', 'Brand product tag: {{brand}}{{type}}');
    this.addTranslation('hashtagGenerator.descriptions.contentTypeRecommendation', '基于内容类型"{{type}}"推荐', 'Recommended based on content type "{{type}}"');
    this.addTranslation('hashtagGenerator.descriptions.themeRecommendation', '基于主题"{{theme}}"推荐', 'Recommended based on theme "{{theme}}"');
    this.addTranslation('hashtagGenerator.descriptions.platformRecommendation', '{{platform}}平台推荐标签', '{{platform}} platform recommended tags');
    this.addTranslation('hashtagGenerator.descriptions.keywordMatch', '基于{{count}}个关键词匹配', 'Based on {{count}} keyword matches');

    // 行业关键词
    this.addTranslation('hashtagGenerator.industries.techDigital', '科技数码', 'Technology & Digital');
    this.addTranslation('hashtagGenerator.industries.foodCooking', '美食料理', 'Food & Cooking');
    this.addTranslation('hashtagGenerator.industries.fashionStyle', '时尚穿搭', 'Fashion & Style');
    this.addTranslation('hashtagGenerator.industries.beautyCosmetics', '美妆护肤', 'Beauty & Cosmetics');
    this.addTranslation('hashtagGenerator.industries.fitnessExercise', '健身运动', 'Fitness & Exercise');
    this.addTranslation('hashtagGenerator.industries.travelTourism', '旅行出游', 'Travel & Tourism');
    this.addTranslation('hashtagGenerator.industries.educationLearning', '教育学习', 'Education & Learning');
    this.addTranslation('hashtagGenerator.industries.workplaceOffice', '职场办公', 'Workplace & Office');
    this.addTranslation('hashtagGenerator.industries.homeLifestyle', '家居生活', 'Home & Lifestyle');
    this.addTranslation('hashtagGenerator.industries.entertainmentMedia', '娱乐影视', 'Entertainment & Media');

    // 主题标签
    this.addTranslation('hashtagGenerator.themes.digitalTech', '数码科技', 'Digital Technology');
    this.addTranslation('hashtagGenerator.themes.programmingDev', '编程开发', 'Programming Development');
    this.addTranslation('hashtagGenerator.themes.foodCuisine', '美食料理', 'Food Cuisine');
    this.addTranslation('hashtagGenerator.themes.travelGuide', '旅行攻略', 'Travel Guide');
    this.addTranslation('hashtagGenerator.themes.fashionBeauty', '时尚美妆', 'Fashion Beauty');
    this.addTranslation('hashtagGenerator.themes.fitnessWorkout', '健身运动', 'Fitness Workout');
    this.addTranslation('hashtagGenerator.themes.readingLearning', '读书学习', 'Reading Learning');
    this.addTranslation('hashtagGenerator.themes.careerDevelopment', '职场发展', 'Career Development');
    this.addTranslation('hashtagGenerator.themes.investmentFinance', '投资理财', 'Investment Finance');
    this.addTranslation('hashtagGenerator.themes.photographySkills', '摄影技巧', 'Photography Skills');
    this.addTranslation('hashtagGenerator.themes.musicArt', '音乐艺术', 'Music Art');
    this.addTranslation('hashtagGenerator.themes.gamingEntertainment', '游戏娱乐', 'Gaming Entertainment');
    this.addTranslation('hashtagGenerator.themes.homeLife', '家居生活', 'Home Life');
    this.addTranslation('hashtagGenerator.themes.parentingEducation', '育儿教育', 'Parenting Education');
    this.addTranslation('hashtagGenerator.themes.petLife', '宠物生活', 'Pet Life');

    // 内容类型标签
    this.addTranslation('hashtagGenerator.contentTypes.productReview', '产品测评', 'Product Review');
    this.addTranslation('hashtagGenerator.contentTypes.featureHighlight', '功能亮点', 'Feature Highlight');
    this.addTranslation('hashtagGenerator.contentTypes.realExperience', '真实体验', 'Real Experience');
    this.addTranslation('hashtagGenerator.contentTypes.usageExperience', '使用心得', 'Usage Experience');
    this.addTranslation('hashtagGenerator.contentTypes.productRecommendation', '产品推荐', 'Product Recommendation');
    this.addTranslation('hashtagGenerator.contentTypes.practicalTutorial', '实用教程', 'Practical Tutorial');
    this.addTranslation('hashtagGenerator.contentTypes.dryGoodsSharing', '干货分享', 'Dry Goods Sharing');
    this.addTranslation('hashtagGenerator.contentTypes.skillsSummary', '技巧总结', 'Skills Summary');
    this.addTranslation('hashtagGenerator.contentTypes.studyNotes', '学习笔记', 'Study Notes');
    this.addTranslation('hashtagGenerator.contentTypes.methodology', '方法论', 'Methodology');
    this.addTranslation('hashtagGenerator.contentTypes.experienceSharing', '经验分享', 'Experience Sharing');
    this.addTranslation('hashtagGenerator.contentTypes.personalInsights', '个人心得', 'Personal Insights');
    this.addTranslation('hashtagGenerator.contentTypes.lifeReflections', '生活感悟', 'Life Reflections');
    this.addTranslation('hashtagGenerator.contentTypes.realStory', '真实故事', 'Real Story');
    this.addTranslation('hashtagGenerator.contentTypes.growthRecord', '成长记录', 'Growth Record');
    this.addTranslation('hashtagGenerator.contentTypes.goodsRecommendation', '好物推荐', 'Good Products Recommendation');
    this.addTranslation('hashtagGenerator.contentTypes.plantingList', '种草清单', 'Planting List');
    this.addTranslation('hashtagGenerator.contentTypes.buyingGuide', '购买指南', 'Buying Guide');
    this.addTranslation('hashtagGenerator.contentTypes.costEffectiveChoice', '性价比之选', 'Cost-effective Choice');
    this.addTranslation('hashtagGenerator.contentTypes.mustBuyGoods', '必买好物', 'Must-buy Good Products');
    this.addTranslation('hashtagGenerator.contentTypes.workplaceDryGoods', '职场干货', 'Workplace Dry Goods');
    this.addTranslation('hashtagGenerator.contentTypes.workSkills', '工作技巧', 'Work Skills');
    this.addTranslation('hashtagGenerator.contentTypes.efficiencyImprovement', '效率提升', 'Efficiency Improvement');
    this.addTranslation('hashtagGenerator.contentTypes.careerGrowth', '职场成长', 'Career Growth');
    this.addTranslation('hashtagGenerator.contentTypes.workExperience', '工作心得', 'Work Experience');

    // 话题标签
    this.addTranslation('hashtagGenerator.topicTags.todayHotspot', '今日热点', 'Today\'s Hotspot');
    this.addTranslation('hashtagGenerator.topicTags.goodsSharing', '好物分享', 'Good Products Sharing');
    this.addTranslation('hashtagGenerator.topicTags.practicalTutorial', '实用教程', 'Practical Tutorial');
    this.addTranslation('hashtagGenerator.topicTags.productReview', '产品测评', 'Product Review');
    this.addTranslation('hashtagGenerator.topicTags.lifeRecord', '生活记录', 'Life Record');
    this.addTranslation('hashtagGenerator.topicTags.creativeContent', '创意内容', 'Creative Content');
    this.addTranslation('hashtagGenerator.topicTags.deepAnalysis', '深度解析', 'Deep Analysis');

    // 风格标签
    this.addTranslation('hashtagGenerator.styleTypes.enthusiasticRecommendation', '热情推荐', 'Enthusiastic Recommendation');
    this.addTranslation('hashtagGenerator.styleTypes.strongAmway', '强烈安利', 'Strong Amway');
    this.addTranslation('hashtagGenerator.styleTypes.superUseful', '超级好用', 'Super Useful');
    this.addTranslation('hashtagGenerator.styleTypes.mustHave', '必须拥有', 'Must Have');
    this.addTranslation('hashtagGenerator.styleTypes.professionalAnalysis', '专业分析', 'Professional Analysis');
    this.addTranslation('hashtagGenerator.styleTypes.deepInterpretation', '深度解读', 'Deep Interpretation');
    this.addTranslation('hashtagGenerator.styleTypes.objectiveEvaluation', '客观评价', 'Objective Evaluation');
    this.addTranslation('hashtagGenerator.styleTypes.rationalRecommendation', '理性推荐', 'Rational Recommendation');
    this.addTranslation('hashtagGenerator.styleTypes.cuteSharing', '可爱分享', 'Cute Sharing');
    this.addTranslation('hashtagGenerator.styleTypes.moeRecommendation', '萌系推荐', 'Moe Recommendation');
    this.addTranslation('hashtagGenerator.styleTypes.fairyMustHave', '小仙女必备', 'Fairy Must-have');
    this.addTranslation('hashtagGenerator.styleTypes.sweetStyle', '甜美风格', 'Sweet Style');
    this.addTranslation('hashtagGenerator.styleTypes.realSharing', '真实分享', 'Real Sharing');
    this.addTranslation('hashtagGenerator.styleTypes.objectiveExperience', '客观体验', 'Objective Experience');
    this.addTranslation('hashtagGenerator.styleTypes.personalFeeling', '个人感受', 'Personal Feeling');
    this.addTranslation('hashtagGenerator.styleTypes.usageExperience', '使用心得', 'Usage Experience');

    // 平台标签
    this.addTranslation('hashtagGenerator.platformTags.xiaohongshu', '小红书', 'Xiaohongshu');
    this.addTranslation('hashtagGenerator.platformTags.planting', '种草', 'Planting');
    this.addTranslation('hashtagGenerator.platformTags.goodsRecommendation', '好物推荐', 'Good Products Recommendation');
    this.addTranslation('hashtagGenerator.platformTags.lifeSharing', '生活分享', 'Life Sharing');
    this.addTranslation('hashtagGenerator.platformTags.daily', '日常', 'Daily');
    this.addTranslation('hashtagGenerator.platformTags.beautifulLife', '美好生活', 'Beautiful Life');

    this.addTranslation('hashtagGenerator.platformTags.weibo', '微博', 'Weibo');
    this.addTranslation('hashtagGenerator.platformTags.hot', '热门', 'Hot');
    this.addTranslation('hashtagGenerator.platformTags.topic', '话题', 'Topic');
    this.addTranslation('hashtagGenerator.platformTags.sharing', '分享', 'Sharing');
    this.addTranslation('hashtagGenerator.platformTags.life', '生活', 'Life');

    this.addTranslation('hashtagGenerator.platformTags.douyin', '抖音', 'Douyin');
    this.addTranslation('hashtagGenerator.platformTags.shortVideo', '短视频', 'Short Video');
    this.addTranslation('hashtagGenerator.platformTags.creative', '创意', 'Creative');
    this.addTranslation('hashtagGenerator.platformTags.interesting', '有趣', 'Interesting');

    this.addTranslation('hashtagGenerator.platformTags.zhihu', '知乎', 'Zhihu');
    this.addTranslation('hashtagGenerator.platformTags.dryGoods', '干货', 'Dry Goods');
    this.addTranslation('hashtagGenerator.platformTags.learning', '学习', 'Learning');
    this.addTranslation('hashtagGenerator.platformTags.thinking', '思考', 'Thinking');
    this.addTranslation('hashtagGenerator.platformTags.professional', '专业', 'Professional');

    this.addTranslation('hashtagGenerator.platformTags.bilibili', 'B站', 'Bilibili');
    this.addTranslation('hashtagGenerator.platformTags.video', '视频', 'Video');
    this.addTranslation('hashtagGenerator.platformTags.creation', '创作', 'Creation');

    this.addTranslation('hashtagGenerator.platformTags.wechat', '微信', 'WeChat');
    this.addTranslation('hashtagGenerator.platformTags.officialAccount', '公众号', 'Official Account');
    this.addTranslation('hashtagGenerator.platformTags.original', '原创', 'Original');
    this.addTranslation('hashtagGenerator.platformTags.depth', '深度', 'Depth');

    // 热门话题
    this.addTranslation('hashtagGenerator.trendingTopics.todayHotspot', '今日热点', 'Today\'s Hotspot');
    this.addTranslation('hashtagGenerator.trendingTopics.hotTopic', '热门话题', 'Hot Topic');
    this.addTranslation('hashtagGenerator.trendingTopics.realTimeHotSearch', '实时热搜', 'Real-time Hot Search');
    this.addTranslation('hashtagGenerator.trendingTopics.internetMeme', '网络热梗', 'Internet Meme');
    this.addTranslation('hashtagGenerator.trendingTopics.popularTrend', '流行趋势', 'Popular Trend');
    this.addTranslation('hashtagGenerator.trendingTopics.socialHotspot', '社会热点', 'Social Hotspot');
    this.addTranslation('hashtagGenerator.trendingTopics.entertainmentGossip', '娱乐八卦', 'Entertainment Gossip');
    this.addTranslation('hashtagGenerator.trendingTopics.techFrontier', '科技前沿', 'Tech Frontier');
    this.addTranslation('hashtagGenerator.trendingTopics.lifestyle', '生活方式', 'Lifestyle');
    this.addTranslation('hashtagGenerator.trendingTopics.culturalPhenomenon', '文化现象', 'Cultural Phenomenon');

    // 定义替换规则
    this.defineReplacements();
  }

  /**
   * 添加翻译
   */
  addTranslation(key, zhText, enText) {
    const keys = key.split('.');
    let zhCurrent = this.zhTranslations;
    let enCurrent = this.enTranslations;

    // 创建嵌套对象结构
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!zhCurrent[k]) zhCurrent[k] = {};
      if (!enCurrent[k]) enCurrent[k] = {};
      zhCurrent = zhCurrent[k];
      enCurrent = enCurrent[k];
    }

    // 设置最终值
    const finalKey = keys[keys.length - 1];
    zhCurrent[finalKey] = zhText;
    enCurrent[finalKey] = enText;
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 注释替换
      {
        search: /\/\*\*\s*\n\s*\* 智能话题标签生成器\s*\n\s*\* 支持自动提取、系统推荐、热点话题等功能\s*\n\s*\*\//g,
        replace: "/**\n * t('hashtagGenerator.comments.intelligentGenerator')\n * t('hashtagGenerator.comments.supportFeatures')\n */"
      },
      {
        search: /relevance: number; \/\/ 相关度评分 0-1/g,
        replace: "relevance: number; // t('hashtagGenerator.comments.relevanceScore')"
      },
      {
        search: /weight: number; \/\/ 权重 0-1/g,
        replace: "weight: number; // t('hashtagGenerator.comments.weight')"
      },
      {
        search: /maxCount: number; \/\/ 该维度最大标签数/g,
        replace: "maxCount: number; // t('hashtagGenerator.comments.maxCountPerDimension')"
      },

      // 日志消息替换
      {
        search: /console\.log\('🏷️ 开始分析内容生成标签:', content\.substring\(0, 50\)\);/g,
        replace: "console.log('🏷️', t('hashtagGenerator.logs.startAnalyzing'), content.substring(0, 50));"
      },
      {
        search: /console\.log\('🔍 提取的核心关键词:', coreKeywords\);/g,
        replace: "console.log('🔍', t('hashtagGenerator.logs.extractedKeywords'), coreKeywords);"
      },
      {
        search: /console\.log\('🎯 识别的内容主题:', contentThemes\);/g,
        replace: "console.log('🎯', t('hashtagGenerator.logs.identifiedThemes'), contentThemes);"
      },
      {
        search: /console\.log\('🏷️ 生成的内容标签:', contentBasedTags\);/g,
        replace: "console.log('🏷️', t('hashtagGenerator.logs.generatedTags'), contentBasedTags);"
      },

      // 错误消息替换
      {
        search: /throw new Error\('内容过短，无法生成有效标签'\);/g,
        replace: "throw new Error(t('hashtagGenerator.errors.contentTooShort'));"
      },

      // 描述文本替换
      {
        search: /description: `从内容中提取的关键词`/g,
        replace: "description: t('hashtagGenerator.descriptions.extractedKeyword')"
      },
      {
        search: /description: `基于内容类型识别的主题`/g,
        replace: "description: t('hashtagGenerator.descriptions.contentTheme')"
      },
      {
        search: /description: `关键词与主题的组合标签`/g,
        replace: "description: t('hashtagGenerator.descriptions.combinedTag')"
      },

      // 行业标签替换
      {
        search: /'科技数码'/g,
        replace: "t('hashtagGenerator.industries.techDigital')"
      },
      {
        search: /'美食料理'/g,
        replace: "t('hashtagGenerator.industries.foodCooking')"
      },
      {
        search: /'时尚穿搭'/g,
        replace: "t('hashtagGenerator.industries.fashionStyle')"
      },
      {
        search: /'美妆护肤'/g,
        replace: "t('hashtagGenerator.industries.beautyCosmetics')"
      },
      {
        search: /'健身运动'/g,
        replace: "t('hashtagGenerator.industries.fitnessExercise')"
      },
      {
        search: /'旅行出游'/g,
        replace: "t('hashtagGenerator.industries.travelTourism')"
      },
      {
        search: /'教育学习'/g,
        replace: "t('hashtagGenerator.industries.educationLearning')"
      },
      {
        search: /'职场办公'/g,
        replace: "t('hashtagGenerator.industries.workplaceOffice')"
      },
      {
        search: /'家居生活'/g,
        replace: "t('hashtagGenerator.industries.homeLifestyle')"
      },
      {
        search: /'娱乐影视'/g,
        replace: "t('hashtagGenerator.industries.entertainmentMedia')"
      },

      // 话题标签替换
      {
        search: /'今日热点'/g,
        replace: "t('hashtagGenerator.topicTags.todayHotspot')"
      },
      {
        search: /'好物分享'/g,
        replace: "t('hashtagGenerator.topicTags.goodsSharing')"
      },
      {
        search: /'实用教程'/g,
        replace: "t('hashtagGenerator.topicTags.practicalTutorial')"
      },
      {
        search: /'产品测评'/g,
        replace: "t('hashtagGenerator.topicTags.productReview')"
      },
      {
        search: /'生活记录'/g,
        replace: "t('hashtagGenerator.topicTags.lifeRecord')"
      },
      {
        search: /'创意内容'/g,
        replace: "t('hashtagGenerator.topicTags.creativeContent')"
      },
      {
        search: /'深度解析'/g,
        replace: "t('hashtagGenerator.topicTags.deepAnalysis')"
      }
    ];
  }

  /**
   * 处理话题标签生成器文件
   */
  async processHashtagGeneratorFile() {
    console.log('🔄 处理话题标签生成器文件...');
    
    if (!fs.existsSync(HASHTAG_GENERATOR_PATH)) {
      throw new Error(`话题标签生成器文件不存在: ${HASHTAG_GENERATOR_PATH}`);
    }

    let content = fs.readFileSync(HASHTAG_GENERATOR_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(HASHTAG_GENERATOR_PATH, content);
    console.log(`✅ 话题标签生成器文件处理完成，共替换 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('💾 更新翻译文件...');
    
    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');
    
    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }
}

// 运行国际化处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new HashtagGeneratorI18n();
  processor.run().catch(console.error);
}

export default HashtagGeneratorI18n;
