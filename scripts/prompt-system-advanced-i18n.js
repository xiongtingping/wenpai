#!/usr/bin/env node

/**
 * AI提示词系统高级国际化脚本
 * 处理 PromptSystem.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PROMPT_SYSTEM_PATH = 'src/prompts/PromptSystem.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class PromptSystemAdvancedI18n {
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
    console.log('🤖 开始AI提示词系统高级国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理提示词系统文件
      await this.processPromptSystemFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ AI提示词系统高级国际化完成！`);
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

    // 初始化 promptSystem 翻译对象
    if (!this.zhTranslations.promptSystem) {
      this.zhTranslations.promptSystem = {};
    }
    if (!this.enTranslations.promptSystem) {
      this.enTranslations.promptSystem = {};
    }

    // 平台特征
    this.addTranslation('promptSystem.platforms.xiaohongshu.tone', '真实分享、种草推荐', 'Authentic Sharing, Product Recommendation');
    this.addTranslation('promptSystem.platforms.xiaohongshu.contentStyle', '生活化、实用性、美学化表达', 'Lifestyle, Practical, Aesthetic Expression');
    this.addTranslation('promptSystem.platforms.xiaohongshu.interactionStyle', '鼓励收藏、分享，使用emoji和话题标签', 'Encourage Saving, Sharing, Use Emojis and Topic Tags');

    this.addTranslation('promptSystem.platforms.douyin.tone', '轻松有趣、节奏感强', 'Relaxed, Fun, Strong Rhythm');
    this.addTranslation('promptSystem.platforms.douyin.contentStyle', '快节奏、高密度信息、强视觉效果', 'Fast-paced, High-density Information, Strong Visual Effects');
    this.addTranslation('promptSystem.platforms.douyin.interactionStyle', '引导点赞、评论、转发，使用热门话题和挑战', 'Guide Likes, Comments, Shares, Use Trending Topics and Challenges');

    this.addTranslation('promptSystem.platforms.wechat.tone', '权威专业、深度解读', 'Authoritative, Professional, In-depth Analysis');
    this.addTranslation('promptSystem.platforms.wechat.contentStyle', '权威性、深度性、实用性', 'Authoritative, In-depth, Practical');
    this.addTranslation('promptSystem.platforms.wechat.interactionStyle', '引导关注、分享转发，建立专业形象', 'Guide Following, Sharing, Establish Professional Image');

    this.addTranslation('promptSystem.platforms.weibo.tone', '简洁有力、热点敏感', 'Concise, Powerful, Trend-sensitive');
    this.addTranslation('promptSystem.platforms.weibo.contentStyle', '新闻性、时效性、观点鲜明', 'News-oriented, Timely, Clear Viewpoints');
    this.addTranslation('promptSystem.platforms.weibo.interactionStyle', '引发讨论、转发传播，关注热点话题', 'Trigger Discussions, Retweet Spread, Focus on Hot Topics');

    this.addTranslation('promptSystem.platforms.zhihu.tone', '专业深度、逻辑清晰', 'Professional Depth, Clear Logic');
    this.addTranslation('promptSystem.platforms.zhihu.contentStyle', '知识性、专业性、思辨性强', 'Knowledge-based, Professional, Strong Critical Thinking');
    this.addTranslation('promptSystem.platforms.zhihu.interactionStyle', '引发思考、专业讨论，提供价值观点', 'Provoke Thinking, Professional Discussion, Provide Valuable Insights');

    this.addTranslation('promptSystem.platforms.bilibili.tone', '年轻活力、创意十足', 'Youthful Energy, Creative');
    this.addTranslation('promptSystem.platforms.bilibili.contentStyle', '娱乐性、创意性、互动性强', 'Entertaining, Creative, Highly Interactive');
    this.addTranslation('promptSystem.platforms.bilibili.interactionStyle', '引导三连、弹幕互动，融入B站文化', 'Guide Triple Actions, Bullet Comment Interaction, Integrate Bilibili Culture');

    // 内容形式
    this.addTranslation('promptSystem.contentForms.imagePlanting.name', '图文种草', 'Image-Text Product Recommendation');
    this.addTranslation('promptSystem.contentForms.imagePlanting.description', '第一人称视角，讲述真实使用体验，语言自然亲切，融合 emoji 表达与评论互动引导', 'First-person Perspective, Share Real Usage Experience, Natural and Friendly Language, Integrate Emoji Expression and Comment Interaction Guidance');
    this.addTranslation('promptSystem.contentForms.imagePlanting.outputType', '纯文案，用户自配图', 'Pure Copy, User Provides Images');

    this.addTranslation('promptSystem.contentForms.videoScript.name', '视频脚本', 'Video Script');
    this.addTranslation('promptSystem.contentForms.videoScript.description', '包含画面描述、文案、音效等完整视频制作要素', 'Contains Complete Video Production Elements Including Scene Description, Copy, Sound Effects');
    this.addTranslation('promptSystem.contentForms.videoScript.outputType', '结构化脚本', 'Structured Script');

    this.addTranslation('promptSystem.contentForms.professionalAnalysis.name', '专业解读', 'Professional Analysis');
    this.addTranslation('promptSystem.contentForms.professionalAnalysis.description', '深度分析某个话题或现象，提供专业见解和价值观点', 'In-depth Analysis of Topics or Phenomena, Provide Professional Insights and Valuable Viewpoints');
    this.addTranslation('promptSystem.contentForms.professionalAnalysis.outputType', '长文分析', 'Long-form Analysis');

    // 表达风格
    this.addTranslation('promptSystem.expressionStyles.professional.name', '专业权威', 'Professional Authoritative');
    this.addTranslation('promptSystem.expressionStyles.professional.description', '使用专业术语，逻辑清晰，权威可信', 'Use Professional Terms, Clear Logic, Authoritative and Credible');

    this.addTranslation('promptSystem.expressionStyles.casual.name', '轻松自然', 'Casual Natural');
    this.addTranslation('promptSystem.expressionStyles.casual.description', '语言亲切自然，贴近生活，易于理解', 'Friendly and Natural Language, Close to Life, Easy to Understand');

    this.addTranslation('promptSystem.expressionStyles.funny.name', '幽默风趣', 'Humorous');
    this.addTranslation('promptSystem.expressionStyles.funny.description', '使用幽默元素，增加趣味性和传播性', 'Use Humorous Elements, Increase Fun and Spreadability');

    this.addTranslation('promptSystem.expressionStyles.emotional.name', '情感化', 'Emotional');
    this.addTranslation('promptSystem.expressionStyles.emotional.description', '注重情感表达，引起共鸣和情感连接', 'Focus on Emotional Expression, Create Resonance and Emotional Connection');

    // 提示词描述
    this.addTranslation('promptSystem.prompts.titleGeneration.description', '标题生成AI系统提示词，包含完整的生成规范和评分机制', 'Title Generation AI System Prompt, Contains Complete Generation Specifications and Scoring Mechanism');
    this.addTranslation('promptSystem.prompts.titleGenerationUser.description', '标题生成用户提示词模板，支持平台定制和风格偏好', 'Title Generation User Prompt Template, Supports Platform Customization and Style Preferences');
    this.addTranslation('promptSystem.prompts.titleQualityCheck.description', 'V3版本标题质量检查提示词，5维度评分分析', 'V3 Version Title Quality Check Prompt, 5-Dimensional Scoring Analysis');

    this.addTranslation('promptSystem.prompts.brandCorpusExtraction.description', '品牌语料库AI提取提示词，支持9个维度的结构化提取', 'Brand Corpus AI Extraction Prompt, Supports 9-Dimensional Structured Extraction');
    this.addTranslation('promptSystem.prompts.brandCorpusConflict.description', '品牌语料库冲突解决提示词，智能合并多来源信息', 'Brand Corpus Conflict Resolution Prompt, Intelligently Merge Multi-source Information');

    this.addTranslation('promptSystem.prompts.creativeGeneration.description', '九宫格创意魔方系统提示词，专业的社交媒体文案创作', 'Nine-Grid Creative Cube System Prompt, Professional Social Media Copywriting');
    this.addTranslation('promptSystem.prompts.contentAdaptation.description', '内容适配系统提示词，支持多平台内容形式适配', 'Content Adaptation System Prompt, Supports Multi-platform Content Form Adaptation');
    this.addTranslation('promptSystem.prompts.brandAnalysis.description', '品牌分析系统提示词，专业的品牌调性和关键词分析', 'Brand Analysis System Prompt, Professional Brand Tone and Keyword Analysis');
    this.addTranslation('promptSystem.prompts.pdfChat.description', 'PDF文档对话系统提示词，专业的文档分析和问答', 'PDF Document Chat System Prompt, Professional Document Analysis and Q&A');
    this.addTranslation('promptSystem.prompts.emojiGeneration.description', 'Emoji生成描述提示词，创作生动的表情符号描述', 'Emoji Generation Description Prompt, Create Vivid Emoji Descriptions');

    // 功能描述
    this.addTranslation('promptSystem.functions.registerPrompt', '注册提示词模板', 'Register Prompt Template');
    this.addTranslation('promptSystem.functions.getPrompt', '获取提示词模板（增强版，支持平台和风格数据注入）', 'Get Prompt Template (Enhanced Version, Supports Platform and Style Data Injection)');
    this.addTranslation('promptSystem.functions.enhanceParameters', '增强参数处理：自动注入多维矩阵数据', 'Enhanced Parameter Processing: Automatically Inject Multi-dimensional Matrix Data');
    this.addTranslation('promptSystem.functions.extractBrandTone', '从品牌内容中提取品牌调性（简化版，实际可集成品牌分析AI）', 'Extract Brand Tone from Brand Content (Simplified Version, Can Integrate Brand Analysis AI)');
    this.addTranslation('promptSystem.functions.extractBrandKeywords', '从品牌内容中提取关键词', 'Extract Keywords from Brand Content');
    this.addTranslation('promptSystem.functions.extractBrandStyle', '从品牌内容中提取品牌风格', 'Extract Brand Style from Brand Content');
    this.addTranslation('promptSystem.functions.extractBrandValues', '从品牌内容中提取品牌价值观', 'Extract Brand Values from Brand Content');

    // 错误消息
    this.addTranslation('promptSystem.errors.templateNotFound', '提示词模板不存在: {{type}}', 'Prompt Template Not Found: {{type}}');
    this.addTranslation('promptSystem.errors.missingParams', '缺少提示词参数: {{params}}', 'Missing Prompt Parameters: {{params}}');
    this.addTranslation('promptSystem.errors.integrityCheckFailed', '提示词系统完整性验证失败: 缺少提示词类型', 'Prompt System Integrity Check Failed: Missing Prompt Types');
    this.addTranslation('promptSystem.errors.integrityCheckException', '提示词系统完整性验证异常:', 'Prompt System Integrity Check Exception:');

    // 成功消息
    this.addTranslation('promptSystem.success.moduleInit', '提示词系统', 'Prompt System');
    this.addTranslation('promptSystem.success.integrityCheckPassed', '提示词系统完整性验证通过', 'Prompt System Integrity Check Passed');

    // 九宫格创意魔方
    this.addTranslation('promptSystem.creativeCube.dimensions.targetAudience', '目标客群', 'Target Audience');
    this.addTranslation('promptSystem.creativeCube.dimensions.useCase', '使用场景', 'Use Case');
    this.addTranslation('promptSystem.creativeCube.dimensions.painPoint', '用户痛点', 'User Pain Point');
    this.addTranslation('promptSystem.creativeCube.dimensions.industry', '行业', 'Industry');
    this.addTranslation('promptSystem.creativeCube.dimensions.coreValue', '核心价值', 'Core Value');
    this.addTranslation('promptSystem.creativeCube.dimensions.toneStyle', '表达风格', 'Expression Style');
    this.addTranslation('promptSystem.creativeCube.dimensions.contentFormat', '内容形式', 'Content Format');
    this.addTranslation('promptSystem.creativeCube.dimensions.emotionalNeed', '情感诉求', 'Emotional Need');
    this.addTranslation('promptSystem.creativeCube.dimensions.platformTrend', '平台/趋势', 'Platform/Trend');

    // 维度描述
    this.addTranslation('promptSystem.creativeCube.descriptions.targetAudience', '选择目标用户群体（必选）', 'Select Target User Group (Required)');
    this.addTranslation('promptSystem.creativeCube.descriptions.useCase', '定义具体使用情境（必选）', 'Define Specific Usage Context (Required)');
    this.addTranslation('promptSystem.creativeCube.descriptions.painPoint', '识别核心问题（必选）', 'Identify Core Problem (Required)');
    this.addTranslation('promptSystem.creativeCube.descriptions.industry', '所属行业领域（必选）', 'Industry Domain (Required)');
    this.addTranslation('promptSystem.creativeCube.descriptions.coreValue', '产品/服务核心价值', 'Product/Service Core Value');
    this.addTranslation('promptSystem.creativeCube.descriptions.toneStyle', '内容表达调性', 'Content Expression Tone');
    this.addTranslation('promptSystem.creativeCube.descriptions.contentFormat', '输出内容格式', 'Output Content Format');
    this.addTranslation('promptSystem.creativeCube.descriptions.emotionalNeed', '用户情感需求', 'User Emotional Needs');
    this.addTranslation('promptSystem.creativeCube.descriptions.platformTrend', '平台特性或热点趋势', 'Platform Characteristics or Hot Trends');

    // 注释和说明
    this.addTranslation('promptSystem.comments.platformData', '平台维度数据注入', 'Platform Dimension Data Injection');
    this.addTranslation('promptSystem.comments.contentFormData', '内容形式维度数据注入', 'Content Form Dimension Data Injection');
    this.addTranslation('promptSystem.comments.expressionStyleData', '表达风格维度数据注入', 'Expression Style Dimension Data Injection');
    this.addTranslation('promptSystem.comments.contentTypeData', '内容类型维度数据注入', 'Content Type Dimension Data Injection');
    this.addTranslation('promptSystem.comments.charCountControl', '字符数控制维度数据注入', 'Character Count Control Dimension Data Injection');
    this.addTranslation('promptSystem.comments.brandDimension', '品牌维度数据注入（最高优先级）', 'Brand Dimension Data Injection (Highest Priority)');
    this.addTranslation('promptSystem.comments.brandAnalysisIntegration', '这里可以集成品牌库分析结果', 'Brand Library Analysis Results Can Be Integrated Here');
    this.addTranslation('promptSystem.comments.complexBrandAnalysis', '这里可以集成更复杂的品牌分析逻辑', 'More Complex Brand Analysis Logic Can Be Integrated Here');
    this.addTranslation('promptSystem.comments.simplifiedKeywordExtraction', '简化版关键词提取，实际可使用更复杂的NLP算法', 'Simplified Keyword Extraction, Can Use More Complex NLP Algorithms');

    // 品牌调性和风格
    this.addTranslation('promptSystem.brandTones.professional', '专业权威', 'Professional Authoritative');
    this.addTranslation('promptSystem.brandTones.youthful', '年轻活力', 'Youthful Energy');
    this.addTranslation('promptSystem.brandTones.warm', '温暖亲切', 'Warm and Friendly');
    this.addTranslation('promptSystem.brandTones.balanced', '平衡中性', 'Balanced Neutral');

    this.addTranslation('promptSystem.brandStyles.minimalist', '简约风格', 'Minimalist Style');
    this.addTranslation('promptSystem.brandStyles.fashionable', '时尚风格', 'Fashionable Style');
    this.addTranslation('promptSystem.brandStyles.classic', '经典风格', 'Classic Style');
    this.addTranslation('promptSystem.brandStyles.modern', '现代风格', 'Modern Style');

    this.addTranslation('promptSystem.brandValues.userFirst', '用户至上', 'User First');

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
      // 平台特征替换
      {
        search: /tone: '真实分享、种草推荐'/g,
        replace: "tone: t('promptSystem.platforms.xiaohongshu.tone')"
      },
      {
        search: /contentStyle: '生活化、实用性、美学化表达'/g,
        replace: "contentStyle: t('promptSystem.platforms.xiaohongshu.contentStyle')"
      },
      {
        search: /interactionStyle: '鼓励收藏、分享，使用emoji和话题标签'/g,
        replace: "interactionStyle: t('promptSystem.platforms.xiaohongshu.interactionStyle')"
      },

      // 抖音平台
      {
        search: /tone: '轻松有趣、节奏感强'/g,
        replace: "tone: t('promptSystem.platforms.douyin.tone')"
      },
      {
        search: /contentStyle: '快节奏、高密度信息、强视觉效果'/g,
        replace: "contentStyle: t('promptSystem.platforms.douyin.contentStyle')"
      },
      {
        search: /interactionStyle: '引导点赞、评论、转发，使用热门话题和挑战'/g,
        replace: "interactionStyle: t('promptSystem.platforms.douyin.interactionStyle')"
      },

      // 微信公众号
      {
        search: /tone: '权威专业、深度解读'/g,
        replace: "tone: t('promptSystem.platforms.wechat.tone')"
      },
      {
        search: /contentStyle: '权威性、深度性、实用性'/g,
        replace: "contentStyle: t('promptSystem.platforms.wechat.contentStyle')"
      },
      {
        search: /interactionStyle: '引导关注、分享转发，建立专业形象'/g,
        replace: "interactionStyle: t('promptSystem.platforms.wechat.interactionStyle')"
      },

      // 微博
      {
        search: /tone: '简洁有力、热点敏感'/g,
        replace: "tone: t('promptSystem.platforms.weibo.tone')"
      },
      {
        search: /contentStyle: '新闻性、时效性、观点鲜明'/g,
        replace: "contentStyle: t('promptSystem.platforms.weibo.contentStyle')"
      },
      {
        search: /interactionStyle: '引发讨论、转发传播，关注热点话题'/g,
        replace: "interactionStyle: t('promptSystem.platforms.weibo.interactionStyle')"
      },

      // 知乎
      {
        search: /tone: '专业深度、逻辑清晰'/g,
        replace: "tone: t('promptSystem.platforms.zhihu.tone')"
      },
      {
        search: /contentStyle: '知识性、专业性、思辨性强'/g,
        replace: "contentStyle: t('promptSystem.platforms.zhihu.contentStyle')"
      },
      {
        search: /interactionStyle: '引发思考、专业讨论，提供价值观点'/g,
        replace: "interactionStyle: t('promptSystem.platforms.zhihu.interactionStyle')"
      },

      // B站
      {
        search: /tone: '年轻活力、创意十足'/g,
        replace: "tone: t('promptSystem.platforms.bilibili.tone')"
      },
      {
        search: /contentStyle: '娱乐性、创意性、互动性强'/g,
        replace: "contentStyle: t('promptSystem.platforms.bilibili.contentStyle')"
      },
      {
        search: /interactionStyle: '引导三连、弹幕互动，融入B站文化'/g,
        replace: "interactionStyle: t('promptSystem.platforms.bilibili.interactionStyle')"
      },

      // 内容形式
      {
        search: /name: '图文种草'/g,
        replace: "name: t('promptSystem.contentForms.imagePlanting.name')"
      },
      {
        search: /name: '视频脚本'/g,
        replace: "name: t('promptSystem.contentForms.videoScript.name')"
      },
      {
        search: /name: '专业解读'/g,
        replace: "name: t('promptSystem.contentForms.professionalAnalysis.name')"
      },

      // 表达风格
      {
        search: /name: '专业权威'/g,
        replace: "name: t('promptSystem.expressionStyles.professional.name')"
      },
      {
        search: /name: '轻松自然'/g,
        replace: "name: t('promptSystem.expressionStyles.casual.name')"
      },
      {
        search: /name: '幽默风趣'/g,
        replace: "name: t('promptSystem.expressionStyles.funny.name')"
      },
      {
        search: /name: '情感化'/g,
        replace: "name: t('promptSystem.expressionStyles.emotional.name')"
      },

      // 错误消息
      {
        search: /`提示词模板不存在: \${type}`/g,
        replace: "t('promptSystem.errors.templateNotFound', { type })"
      },
      {
        search: /`缺少提示词参数: \${missingParams\.join\(', '\)}`/g,
        replace: "t('promptSystem.errors.missingParams', { params: missingParams.join(', ') })"
      },

      // 成功消息
      {
        search: /'提示词系统'/g,
        replace: "t('promptSystem.success.moduleInit')"
      },

      // 九宫格创意魔方维度
      {
        search: /name: '目标客群'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.targetAudience')"
      },
      {
        search: /name: '使用场景'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.useCase')"
      },
      {
        search: /name: '用户痛点'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.painPoint')"
      },
      {
        search: /name: '行业'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.industry')"
      },
      {
        search: /name: '核心价值'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.coreValue')"
      },
      {
        search: /name: '表达风格'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.toneStyle')"
      },
      {
        search: /name: '内容形式'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.contentFormat')"
      },
      {
        search: /name: '情感诉求'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.emotionalNeed')"
      },
      {
        search: /name: '平台\/趋势'/g,
        replace: "name: t('promptSystem.creativeCube.dimensions.platformTrend')"
      },

      // 品牌调性
      {
        search: /'专业权威'/g,
        replace: "t('promptSystem.brandTones.professional')"
      },
      {
        search: /'年轻活力'/g,
        replace: "t('promptSystem.brandTones.youthful')"
      },
      {
        search: /'温暖亲切'/g,
        replace: "t('promptSystem.brandTones.warm')"
      },
      {
        search: /'平衡中性'/g,
        replace: "t('promptSystem.brandTones.balanced')"
      },

      // 品牌风格
      {
        search: /'简约风格'/g,
        replace: "t('promptSystem.brandStyles.minimalist')"
      },
      {
        search: /'时尚风格'/g,
        replace: "t('promptSystem.brandStyles.fashionable')"
      },
      {
        search: /'经典风格'/g,
        replace: "t('promptSystem.brandStyles.classic')"
      },
      {
        search: /'现代风格'/g,
        replace: "t('promptSystem.brandStyles.modern')"
      },
      {
        search: /'用户至上'/g,
        replace: "t('promptSystem.brandValues.userFirst')"
      }
    ];
  }

  /**
   * 处理提示词系统文件
   */
  async processPromptSystemFile() {
    console.log('🔄 处理AI提示词系统文件...');
    
    if (!fs.existsSync(PROMPT_SYSTEM_PATH)) {
      throw new Error(`AI提示词系统文件不存在: ${PROMPT_SYSTEM_PATH}`);
    }

    let content = fs.readFileSync(PROMPT_SYSTEM_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(PROMPT_SYSTEM_PATH, content);
    console.log(`✅ AI提示词系统文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new PromptSystemAdvancedI18n();
  processor.run().catch(console.error);
}

export default PromptSystemAdvancedI18n;
