#!/usr/bin/env node

/**
 * 内容方案配置国际化脚本
 * 处理 contentSchemes.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const CONTENT_SCHEMES_PATH = 'src/config/contentSchemes.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class ContentSchemesI18n {
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
    console.log('📋 开始内容方案配置国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理内容方案文件
      await this.processContentSchemesFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 内容方案配置国际化完成！`);
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

    // 初始化 contentSchemes 翻译对象
    if (!this.zhTranslations.contentSchemes) {
      this.zhTranslations.contentSchemes = {};
    }
    if (!this.enTranslations.contentSchemes) {
      this.enTranslations.contentSchemes = {};
    }

    // 全域内容适配方案
    this.addTranslation('contentSchemes.globalAdaptation.name', '全域内容适配方案', 'Global Content Adaptation Scheme');
    this.addTranslation('contentSchemes.globalAdaptation.description', '针对小红书、微博、微信、抖音、知乎、B站等主流平台的专业内容适配方案，确保内容符合各平台特色和用户习惯', 'Professional content adaptation scheme for mainstream platforms including Xiaohongshu, Weibo, WeChat, Douyin, Zhihu, Bilibili, ensuring content matches platform characteristics and user habits');
    
    // 功能特性
    this.addTranslation('contentSchemes.features.multiPlatformAdaptation', '多平台风格适配', 'Multi-platform Style Adaptation');
    this.addTranslation('contentSchemes.features.professionalTemplates', '专业提示词模板', 'Professional Prompt Templates');
    this.addTranslation('contentSchemes.features.platformOptimization', '平台特色优化', 'Platform Feature Optimization');
    this.addTranslation('contentSchemes.features.userHabitMatching', '用户习惯匹配', 'User Habit Matching');
    this.addTranslation('contentSchemes.features.contentStructureStandards', '内容结构规范', 'Content Structure Standards');
    this.addTranslation('contentSchemes.features.interactionGuidanceDesign', '互动引导设计', 'Interaction Guidance Design');

    // 四大核心风格
    this.addTranslation('contentSchemes.styles.professional.name', '专业风格', 'Professional Style');
    this.addTranslation('contentSchemes.styles.professional.description', '专业 + 客观 + 洞察', 'Professional + Objective + Insightful');
    this.addTranslation('contentSchemes.styles.professional.characteristics.0', '使用专业术语和行业词汇', 'Use Professional Terms and Industry Vocabulary');
    this.addTranslation('contentSchemes.styles.professional.characteristics.1', '客观分析，避免主观情绪', 'Objective Analysis, Avoid Subjective Emotions');
    this.addTranslation('contentSchemes.styles.professional.characteristics.2', '提供深度洞察和独到见解', 'Provide Deep Insights and Unique Perspectives');
    this.addTranslation('contentSchemes.styles.professional.characteristics.3', '逻辑清晰，结构严谨', 'Clear Logic, Rigorous Structure');
    this.addTranslation('contentSchemes.styles.professional.characteristics.4', '引用权威数据和案例', 'Quote Authoritative Data and Cases');
    this.addTranslation('contentSchemes.styles.professional.characteristics.5', '保持专业权威性', 'Maintain Professional Authority');

    this.addTranslation('contentSchemes.styles.funny.name', '幽默风格', 'Humorous Style');
    this.addTranslation('contentSchemes.styles.funny.description', '幽默 + 自嘲 + 网络热词 + 惊叹 + 标题党', 'Humorous + Self-deprecating + Internet Buzzwords + Exclamation + Clickbait');
    this.addTranslation('contentSchemes.styles.funny.characteristics.0', '使用幽默风趣的表达', 'Use Humorous and Witty Expressions');
    this.addTranslation('contentSchemes.styles.funny.characteristics.1', '适当自嘲和调侃', 'Appropriate Self-deprecation and Teasing');
    this.addTranslation('contentSchemes.styles.funny.characteristics.2', '融入网络热词和流行语', 'Incorporate Internet Buzzwords and Popular Phrases');
    this.addTranslation('contentSchemes.styles.funny.characteristics.3', '使用惊叹号和夸张表达', 'Use Exclamation Marks and Exaggerated Expressions');
    this.addTranslation('contentSchemes.styles.funny.characteristics.4', '标题党风格吸引注意', 'Clickbait Style to Attract Attention');
    this.addTranslation('contentSchemes.styles.funny.characteristics.5', '轻松活泼的语调', 'Relaxed and Lively Tone');

    this.addTranslation('contentSchemes.styles.real.name', '真实风格', 'Authentic Style');
    this.addTranslation('contentSchemes.styles.real.description', '真实感 + 主观 + 分享型', 'Authentic + Subjective + Sharing-oriented');
    this.addTranslation('contentSchemes.styles.real.characteristics.0', '第一人称真实体验', 'First-person Authentic Experience');
    this.addTranslation('contentSchemes.styles.real.characteristics.1', '主观感受和情感表达', 'Subjective Feelings and Emotional Expression');
    this.addTranslation('contentSchemes.styles.real.characteristics.2', '分享个人经历和故事', 'Share Personal Experiences and Stories');
    this.addTranslation('contentSchemes.styles.real.characteristics.3', '真实可信的表达方式', 'Authentic and Credible Expression');
    this.addTranslation('contentSchemes.styles.real.characteristics.4', '避免过度包装和修饰', 'Avoid Over-packaging and Embellishment');
    this.addTranslation('contentSchemes.styles.real.characteristics.5', '贴近生活的语言', 'Life-oriented Language');

    this.addTranslation('contentSchemes.styles.hook.name', '钩子风格', 'Hook Style');
    this.addTranslation('contentSchemes.styles.hook.description', '钩子型 + 精准用户导向 + 高点击转化', 'Hook-oriented + Precise User Targeting + High Click Conversion');
    this.addTranslation('contentSchemes.styles.hook.characteristics.0', '开头设置强烈钩子', 'Set Strong Hook at the Beginning');
    this.addTranslation('contentSchemes.styles.hook.characteristics.1', '精准定位目标用户', 'Precisely Target Users');
    this.addTranslation('contentSchemes.styles.hook.characteristics.2', '高点击率和转化导向', 'High Click Rate and Conversion Oriented');
    this.addTranslation('contentSchemes.styles.hook.characteristics.3', '制造悬念和好奇心', 'Create Suspense and Curiosity');
    this.addTranslation('contentSchemes.styles.hook.characteristics.4', '突出核心卖点和价值', 'Highlight Core Selling Points and Value');
    this.addTranslation('contentSchemes.styles.hook.characteristics.5', '引导用户行动', 'Guide User Actions');

    // 平台名称
    this.addTranslation('contentSchemes.platforms.xiaohongshu', '小红书', 'Xiaohongshu');
    this.addTranslation('contentSchemes.platforms.weibo', '微博', 'Weibo');
    this.addTranslation('contentSchemes.platforms.wechat', '微信', 'WeChat');
    this.addTranslation('contentSchemes.platforms.douyin', '抖音', 'Douyin');
    this.addTranslation('contentSchemes.platforms.zhihu', '知乎', 'Zhihu');
    this.addTranslation('contentSchemes.platforms.bilibili', 'B站', 'Bilibili');

    // 平台特性
    this.addTranslation('contentSchemes.platformFeatures.xiaohongshu.0', '图文笔记', 'Image-Text Notes');
    this.addTranslation('contentSchemes.platformFeatures.xiaohongshu.1', '种草推荐', 'Product Recommendation');
    this.addTranslation('contentSchemes.platformFeatures.xiaohongshu.2', '生活分享', 'Lifestyle Sharing');
    this.addTranslation('contentSchemes.platformFeatures.xiaohongshu.3', '话题挑战', 'Topic Challenges');

    this.addTranslation('contentSchemes.platformFeatures.weibo.0', '实时动态', 'Real-time Updates');
    this.addTranslation('contentSchemes.platformFeatures.weibo.1', '话题讨论', 'Topic Discussions');
    this.addTranslation('contentSchemes.platformFeatures.weibo.2', '热点追踪', 'Trending Topics');
    this.addTranslation('contentSchemes.platformFeatures.weibo.3', '粉丝互动', 'Fan Interaction');

    this.addTranslation('contentSchemes.platformFeatures.wechat.0', '深度文章', 'In-depth Articles');
    this.addTranslation('contentSchemes.platformFeatures.wechat.1', '专业分析', 'Professional Analysis');
    this.addTranslation('contentSchemes.platformFeatures.wechat.2', '行业洞察', 'Industry Insights');
    this.addTranslation('contentSchemes.platformFeatures.wechat.3', '权威发布', 'Authoritative Publishing');

    this.addTranslation('contentSchemes.platformFeatures.douyin.0', '短视频', 'Short Videos');
    this.addTranslation('contentSchemes.platformFeatures.douyin.1', '音乐配乐', 'Music Soundtrack');
    this.addTranslation('contentSchemes.platformFeatures.douyin.2', '特效滤镜', 'Special Effects Filters');
    this.addTranslation('contentSchemes.platformFeatures.douyin.3', '直播带货', 'Live Streaming Commerce');

    this.addTranslation('contentSchemes.platformFeatures.zhihu.0', '问答社区', 'Q&A Community');
    this.addTranslation('contentSchemes.platformFeatures.zhihu.1', '专业讨论', 'Professional Discussions');
    this.addTranslation('contentSchemes.platformFeatures.zhihu.2', '知识分享', 'Knowledge Sharing');
    this.addTranslation('contentSchemes.platformFeatures.zhihu.3', '理性分析', 'Rational Analysis');

    this.addTranslation('contentSchemes.platformFeatures.bilibili.0', '视频平台', 'Video Platform');
    this.addTranslation('contentSchemes.platformFeatures.bilibili.1', '弹幕互动', 'Bullet Comment Interaction');
    this.addTranslation('contentSchemes.platformFeatures.bilibili.2', '二次元文化', 'ACG Culture');
    this.addTranslation('contentSchemes.platformFeatures.bilibili.3', '年轻群体', 'Young Demographics');

    // 最佳实践
    this.addTranslation('contentSchemes.bestPractices.xiaohongshu.0', '使用高质量图片', 'Use High-quality Images');
    this.addTranslation('contentSchemes.bestPractices.xiaohongshu.1', '添加相关话题标签', 'Add Relevant Topic Tags');
    this.addTranslation('contentSchemes.bestPractices.xiaohongshu.2', '分享真实使用体验', 'Share Authentic Usage Experience');
    this.addTranslation('contentSchemes.bestPractices.xiaohongshu.3', '与粉丝互动回复', 'Interact and Reply to Fans');

    this.addTranslation('contentSchemes.bestPractices.weibo.0', '抓住热点话题', 'Catch Trending Topics');
    this.addTranslation('contentSchemes.bestPractices.weibo.1', '使用话题标签', 'Use Topic Hashtags');
    this.addTranslation('contentSchemes.bestPractices.weibo.2', '配图增强表达', 'Use Images to Enhance Expression');
    this.addTranslation('contentSchemes.bestPractices.weibo.3', '引导用户互动', 'Guide User Interaction');

    this.addTranslation('contentSchemes.bestPractices.wechat.0', '内容结构清晰', 'Clear Content Structure');
    this.addTranslation('contentSchemes.bestPractices.wechat.1', '引用权威数据', 'Quote Authoritative Data');
    this.addTranslation('contentSchemes.bestPractices.wechat.2', '专业术语准确', 'Accurate Professional Terms');
    this.addTranslation('contentSchemes.bestPractices.wechat.3', '逻辑论证完整', 'Complete Logical Argumentation');

    this.addTranslation('contentSchemes.bestPractices.douyin.0', '开头3秒吸引注意', 'Attract Attention in First 3 Seconds');
    this.addTranslation('contentSchemes.bestPractices.douyin.1', '节奏感强', 'Strong Rhythm');
    this.addTranslation('contentSchemes.bestPractices.douyin.2', '情绪反转', 'Emotional Reversal');
    this.addTranslation('contentSchemes.bestPractices.douyin.3', '引导关注互动', 'Guide Follow and Interaction');

    this.addTranslation('contentSchemes.bestPractices.zhihu.0', '逻辑结构清晰', 'Clear Logical Structure');
    this.addTranslation('contentSchemes.bestPractices.zhihu.1', '引用可靠数据', 'Quote Reliable Data');
    this.addTranslation('contentSchemes.bestPractices.zhihu.2', '避免情绪化表达', 'Avoid Emotional Expression');
    this.addTranslation('contentSchemes.bestPractices.zhihu.3', '提供有价值观点', 'Provide Valuable Viewpoints');

    this.addTranslation('contentSchemes.bestPractices.bilibili.0', '标题有梗有趣', 'Interesting and Meme-worthy Titles');
    this.addTranslation('contentSchemes.bestPractices.bilibili.1', '内容接地气', 'Down-to-earth Content');
    this.addTranslation('contentSchemes.bestPractices.bilibili.2', '与弹幕互动', 'Interact with Bullet Comments');
    this.addTranslation('contentSchemes.bestPractices.bilibili.3', '保持年轻活力', 'Maintain Youthful Energy');

    // 内容方案
    this.addTranslation('contentSchemes.schemes.universal.name', '通用适配方案', 'Universal Adaptation Scheme');
    this.addTranslation('contentSchemes.schemes.universal.description', '适用于大多数平台的基础内容适配，保持内容核心价值的同时进行适度调整', 'Basic content adaptation suitable for most platforms, maintaining core content value while making moderate adjustments');

    this.addTranslation('contentSchemes.schemes.marketing.name', '营销推广方案', 'Marketing Promotion Scheme');
    this.addTranslation('contentSchemes.schemes.marketing.description', '专注于营销效果的内容适配，强调转化率和用户行动引导', 'Content adaptation focused on marketing effectiveness, emphasizing conversion rates and user action guidance');

    this.addTranslation('contentSchemes.schemes.creative.name', '创意写作方案', 'Creative Writing Scheme');
    this.addTranslation('contentSchemes.schemes.creative.description', '注重创意性和独特性的内容生成，适合需要差异化表达的场景', 'Content generation focused on creativity and uniqueness, suitable for scenarios requiring differentiated expression');

    // 方案特性
    this.addTranslation('contentSchemes.schemeFeatures.universal.0', '通用内容适配', 'Universal Content Adaptation');
    this.addTranslation('contentSchemes.schemeFeatures.universal.1', '保持核心价值', 'Maintain Core Value');
    this.addTranslation('contentSchemes.schemeFeatures.universal.2', '适度风格调整', 'Moderate Style Adjustment');
    this.addTranslation('contentSchemes.schemeFeatures.universal.3', '多平台兼容', 'Multi-platform Compatibility');

    this.addTranslation('contentSchemes.schemeFeatures.marketing.0', '营销导向', 'Marketing-oriented');
    this.addTranslation('contentSchemes.schemeFeatures.marketing.1', '转化优化', 'Conversion Optimization');
    this.addTranslation('contentSchemes.schemeFeatures.marketing.2', '行动引导', 'Action Guidance');
    this.addTranslation('contentSchemes.schemeFeatures.marketing.3', '效果追踪', 'Effect Tracking');

    this.addTranslation('contentSchemes.schemeFeatures.creative.0', '创意表达', 'Creative Expression');
    this.addTranslation('contentSchemes.schemeFeatures.creative.1', '差异化内容', 'Differentiated Content');
    this.addTranslation('contentSchemes.schemeFeatures.creative.2', '独特视角', 'Unique Perspective');
    this.addTranslation('contentSchemes.schemeFeatures.creative.3', '艺术性表达', 'Artistic Expression');

    // 注释和说明
    this.addTranslation('contentSchemes.comments.marketingNote', '注意：重点突出营销效果和转化引导，使用更具说服力的表达。', 'Note: Focus on marketing effectiveness and conversion guidance, use more persuasive expressions.');
    this.addTranslation('contentSchemes.comments.creativeNote', '注意：注重创意性和独特性，使用更有想象力的表达方式。', 'Note: Focus on creativity and uniqueness, use more imaginative expressions.');

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
      // 全域内容适配方案
      {
        search: /name: '全域内容适配方案'/g,
        replace: "name: t('contentSchemes.globalAdaptation.name')"
      },
      {
        search: /description: '针对小红书、微博、微信、抖音、知乎、B站等主流平台的专业内容适配方案，确保内容符合各平台特色和用户习惯'/g,
        replace: "description: t('contentSchemes.globalAdaptation.description')"
      },

      // 功能特性
      {
        search: /'多平台风格适配'/g,
        replace: "t('contentSchemes.features.multiPlatformAdaptation')"
      },
      {
        search: /'专业提示词模板'/g,
        replace: "t('contentSchemes.features.professionalTemplates')"
      },
      {
        search: /'平台特色优化'/g,
        replace: "t('contentSchemes.features.platformOptimization')"
      },
      {
        search: /'用户习惯匹配'/g,
        replace: "t('contentSchemes.features.userHabitMatching')"
      },
      {
        search: /'内容结构规范'/g,
        replace: "t('contentSchemes.features.contentStructureStandards')"
      },
      {
        search: /'互动引导设计'/g,
        replace: "t('contentSchemes.features.interactionGuidanceDesign')"
      },

      // 风格名称
      {
        search: /name: '专业风格'/g,
        replace: "name: t('contentSchemes.styles.professional.name')"
      },
      {
        search: /name: '幽默风格'/g,
        replace: "name: t('contentSchemes.styles.funny.name')"
      },
      {
        search: /name: '真实风格'/g,
        replace: "name: t('contentSchemes.styles.real.name')"
      },
      {
        search: /name: '钩子风格'/g,
        replace: "name: t('contentSchemes.styles.hook.name')"
      },

      // 风格描述
      {
        search: /description: '专业 \+ 客观 \+ 洞察'/g,
        replace: "description: t('contentSchemes.styles.professional.description')"
      },
      {
        search: /description: '幽默 \+ 自嘲 \+ 网络热词 \+ 惊叹 \+ 标题党'/g,
        replace: "description: t('contentSchemes.styles.funny.description')"
      },
      {
        search: /description: '真实感 \+ 主观 \+ 分享型'/g,
        replace: "description: t('contentSchemes.styles.real.description')"
      },
      {
        search: /description: '钩子型 \+ 精准用户导向 \+ 高点击转化'/g,
        replace: "description: t('contentSchemes.styles.hook.description')"
      },

      // 平台名称
      {
        search: /name: '小红书'/g,
        replace: "name: t('contentSchemes.platforms.xiaohongshu')"
      },
      {
        search: /name: '微博'/g,
        replace: "name: t('contentSchemes.platforms.weibo')"
      },
      {
        search: /name: '微信'/g,
        replace: "name: t('contentSchemes.platforms.wechat')"
      },
      {
        search: /name: '抖音'/g,
        replace: "name: t('contentSchemes.platforms.douyin')"
      },
      {
        search: /name: '知乎'/g,
        replace: "name: t('contentSchemes.platforms.zhihu')"
      },
      {
        search: /name: 'B站'/g,
        replace: "name: t('contentSchemes.platforms.bilibili')"
      },

      // 内容方案
      {
        search: /name: '通用适配方案'/g,
        replace: "name: t('contentSchemes.schemes.universal.name')"
      },
      {
        search: /name: '营销推广方案'/g,
        replace: "name: t('contentSchemes.schemes.marketing.name')"
      },
      {
        search: /name: '创意写作方案'/g,
        replace: "name: t('contentSchemes.schemes.creative.name')"
      },

      // 方案描述
      {
        search: /description: '适用于大多数平台的基础内容适配，保持内容核心价值的同时进行适度调整'/g,
        replace: "description: t('contentSchemes.schemes.universal.description')"
      },
      {
        search: /description: '专注于营销效果的内容适配，强调转化率和用户行动引导'/g,
        replace: "description: t('contentSchemes.schemes.marketing.description')"
      },
      {
        search: /description: '注重创意性和独特性的内容生成，适合需要差异化表达的场景'/g,
        replace: "description: t('contentSchemes.schemes.creative.description')"
      },

      // 注释
      {
        search: /'注意：重点突出营销效果和转化引导，使用更具说服力的表达。'/g,
        replace: "t('contentSchemes.comments.marketingNote')"
      },
      {
        search: /'注意：注重创意性和独特性，使用更有想象力的表达方式。'/g,
        replace: "t('contentSchemes.comments.creativeNote')"
      }
    ];
  }

  /**
   * 处理内容方案文件
   */
  async processContentSchemesFile() {
    console.log('🔄 处理内容方案配置文件...');
    
    if (!fs.existsSync(CONTENT_SCHEMES_PATH)) {
      throw new Error(`内容方案配置文件不存在: ${CONTENT_SCHEMES_PATH}`);
    }

    let content = fs.readFileSync(CONTENT_SCHEMES_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(CONTENT_SCHEMES_PATH, content);
    console.log(`✅ 内容方案配置文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new ContentSchemesI18n();
  processor.run().catch(console.error);
}

export default ContentSchemesI18n;
