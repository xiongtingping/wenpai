#!/usr/bin/env node

/**
 * AI 提示系统国际化脚本
 * 处理 PromptSystem.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const PROMPT_SYSTEM_PATH = 'src/prompts/PromptSystem.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class PromptSystemI18n {
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
    console.log('🤖 开始 AI 提示系统国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理提示系统文件
      await this.processPromptSystemFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ AI 提示系统国际化完成！`);
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

    // 模块相关
    this.addTranslation('promptSystem.module.lockConstant', '模块锁定常量', 'Module Lock Constants');
    this.addTranslation('promptSystem.module.titleGeneration', '标题生成相关', 'Title Generation Related');
    this.addTranslation('promptSystem.module.brandCorpus', '品牌语料库相关提示词', 'Brand Corpus Related Prompts');
    this.addTranslation('promptSystem.module.contentAdaptation', '内容适配相关', 'Content Adaptation Related');
    this.addTranslation('promptSystem.module.creativeGeneration', '创意生成相关', 'Creative Generation Related');
    this.addTranslation('promptSystem.module.brandAnalysis', '品牌分析相关', 'Brand Analysis Related');
    this.addTranslation('promptSystem.module.documentProcessing', '文档处理相关', 'Document Processing Related');
    this.addTranslation('promptSystem.module.otherFunctions', '其他功能', 'Other Functions');

    // 接口相关
    this.addTranslation('promptSystem.interfaces.promptParams', '提示词参数接口', 'Prompt Parameters Interface');
    this.addTranslation('promptSystem.interfaces.platformFeatures', '平台特征配置接口', 'Platform Features Configuration Interface');
    this.addTranslation('promptSystem.interfaces.contentForm', '内容形式配置接口', 'Content Form Configuration Interface');
    this.addTranslation('promptSystem.interfaces.expressionStyle', '表达风格配置接口', 'Expression Style Configuration Interface');
    this.addTranslation('promptSystem.interfaces.promptTemplate', '提示词模板接口', 'Prompt Template Interface');

    // 核心系统
    this.addTranslation('promptSystem.core.unifiedManager', '统一提示词管理器', 'Unified Prompt Manager');
    this.addTranslation('promptSystem.core.initializePlatformData', '初始化平台特征数据', 'Initialize Platform Data');
    this.addTranslation('promptSystem.core.initializeContentForms', '初始化内容形式配置', 'Initialize Content Forms');
    this.addTranslation('promptSystem.core.initializeExpressionStyles', '初始化表达风格配置', 'Initialize Expression Styles');
    this.addTranslation('promptSystem.core.initializePromptTemplates', '初始化所有提示词模板', 'Initialize All Prompt Templates');

    // 平台特征
    this.addTranslation('promptSystem.platforms.xiaohongshu.tone', '真实分享、种草推荐', 'Authentic sharing, product recommendations');
    this.addTranslation('promptSystem.platforms.xiaohongshu.contentStyle', '生活化、实用性、美学化表达', 'Lifestyle, practical, aesthetic expression');
    this.addTranslation('promptSystem.platforms.xiaohongshu.interactionStyle', '鼓励收藏、分享，使用emoji和话题标签', 'Encourage saving, sharing, use emojis and hashtags');

    this.addTranslation('promptSystem.platforms.douyin.tone', '轻松有趣、节奏感强', 'Light and fun, strong rhythm');
    this.addTranslation('promptSystem.platforms.douyin.contentStyle', '快节奏、高密度信息、强视觉效果', 'Fast-paced, high-density information, strong visual effects');
    this.addTranslation('promptSystem.platforms.douyin.interactionStyle', '引导点赞、评论、转发，使用热门话题和挑战', 'Guide likes, comments, shares, use trending topics and challenges');

    this.addTranslation('promptSystem.platforms.wechat.tone', '权威专业、深度解读', 'Authoritative, professional, in-depth analysis');
    this.addTranslation('promptSystem.platforms.wechat.contentStyle', '权威性、深度性、实用性', 'Authoritative, in-depth, practical');
    this.addTranslation('promptSystem.platforms.wechat.interactionStyle', '引导关注、分享转发，建立专业形象', 'Guide following, sharing, establish professional image');

    this.addTranslation('promptSystem.platforms.weibo.tone', '简洁有力、热点敏感', 'Concise and powerful, sensitive to trends');
    this.addTranslation('promptSystem.platforms.weibo.contentStyle', '新闻性、时效性、观点鲜明', 'News-oriented, timely, clear viewpoints');
    this.addTranslation('promptSystem.platforms.weibo.interactionStyle', '引发讨论、转发传播，关注热点话题', 'Trigger discussions, retweets, focus on trending topics');

    this.addTranslation('promptSystem.platforms.zhihu.tone', '专业深度、逻辑清晰', 'Professional depth, clear logic');
    this.addTranslation('promptSystem.platforms.zhihu.contentStyle', '知识性、专业性、思辨性强', 'Knowledge-based, professional, strong critical thinking');
    this.addTranslation('promptSystem.platforms.zhihu.interactionStyle', '引发思考、专业讨论，提供价值观点', 'Provoke thinking, professional discussions, provide valuable insights');

    this.addTranslation('promptSystem.platforms.bilibili.tone', '年轻活力、创意十足', 'Young and energetic, highly creative');
    this.addTranslation('promptSystem.platforms.bilibili.contentStyle', '娱乐性、创意性、互动性强', 'Entertaining, creative, highly interactive');
    this.addTranslation('promptSystem.platforms.bilibili.interactionStyle', '引导三连、弹幕互动，融入B站文化', 'Guide triple actions, bullet comment interaction, integrate B-site culture');

    // 内容形式
    this.addTranslation('promptSystem.contentForms.imagePlanting.name', '图文种草', 'Image-Text Planting');
    this.addTranslation('promptSystem.contentForms.imagePlanting.description', '第一人称视角，讲述真实使用体验，语言自然亲切，融合 emoji 表达与评论互动引导', 'First-person perspective, sharing authentic usage experience, natural and friendly language, integrating emoji expressions and comment interaction guidance');
    this.addTranslation('promptSystem.contentForms.imagePlanting.outputType', '纯文案，用户自配图', 'Pure copy, user-provided images');

    this.addTranslation('promptSystem.contentForms.videoScript.name', '视频脚本', 'Video Script');
    this.addTranslation('promptSystem.contentForms.videoScript.description', '包含画面描述、文案、音效等完整视频制作要素', 'Contains complete video production elements including scene descriptions, copy, sound effects');
    this.addTranslation('promptSystem.contentForms.videoScript.outputType', '结构化脚本', 'Structured Script');

    this.addTranslation('promptSystem.contentForms.professionalAnalysis.name', '专业解读', 'Professional Analysis');
    this.addTranslation('promptSystem.contentForms.professionalAnalysis.description', '深度分析某个话题或现象，提供专业见解和价值观点', 'In-depth analysis of topics or phenomena, providing professional insights and valuable viewpoints');
    this.addTranslation('promptSystem.contentForms.professionalAnalysis.outputType', '长文分析', 'Long-form Analysis');

    // 表达风格
    this.addTranslation('promptSystem.expressionStyles.professional.name', '专业权威', 'Professional Authority');
    this.addTranslation('promptSystem.expressionStyles.professional.description', '使用专业术语，逻辑清晰，权威可信', 'Use professional terminology, clear logic, authoritative and credible');

    this.addTranslation('promptSystem.expressionStyles.casual.name', '轻松自然', 'Casual and Natural');
    this.addTranslation('promptSystem.expressionStyles.casual.description', '语言亲切自然，贴近生活，易于理解', 'Language is friendly and natural, close to life, easy to understand');

    this.addTranslation('promptSystem.expressionStyles.funny.name', '幽默风趣', 'Humorous and Witty');
    this.addTranslation('promptSystem.expressionStyles.funny.description', '使用幽默元素，增加趣味性和传播性', 'Use humorous elements to increase fun and shareability');

    this.addTranslation('promptSystem.expressionStyles.emotional.name', '情感化', 'Emotional');
    this.addTranslation('promptSystem.expressionStyles.emotional.description', '注重情感表达，引起共鸣和情感连接', 'Focus on emotional expression, create resonance and emotional connection');

    // 提示词描述
    this.addTranslation('promptSystem.prompts.titleGeneration.description', '标题生成AI系统提示词，包含完整的生成规范和评分机制', 'Title generation AI system prompt, including complete generation specifications and scoring mechanism');
    this.addTranslation('promptSystem.prompts.titleGenerationUser.description', '标题生成用户提示词模板，支持平台定制和风格偏好', 'Title generation user prompt template, supporting platform customization and style preferences');
    this.addTranslation('promptSystem.prompts.titleQualityCheck.description', 'V3版本标题质量检查提示词，5维度评分分析', 'V3 version title quality check prompt, 5-dimension scoring analysis');

    // 错误和日志消息
    this.addTranslation('promptSystem.errors.templateNotFound', '提示词模板不存在', 'Prompt template does not exist');
    this.addTranslation('promptSystem.errors.missingParams', '缺少提示词参数', 'Missing prompt parameters');
    this.addTranslation('promptSystem.errors.integrityCheckFailed', '提示词系统完整性验证失败: 缺少提示词类型', 'Prompt system integrity check failed: missing prompt types');
    this.addTranslation('promptSystem.errors.integrityCheckException', '提示词系统完整性验证异常', 'Prompt system integrity check exception');

    this.addTranslation('promptSystem.logs.integrityCheckPassed', '提示词系统完整性验证通过', 'Prompt system integrity check passed');
    this.addTranslation('promptSystem.logs.moduleInit', '提示词系统', 'Prompt System');

    // 九宫格创意魔方相关
    this.addTranslation('promptSystem.creativeCube.dimensionDefinition', '九宫格创意魔方维度定义', 'Creative Cube Dimension Definition');
    this.addTranslation('promptSystem.creativeCube.selectionItems', '九宫格创意魔方选择项', 'Creative Cube Selection Items');
    this.addTranslation('promptSystem.creativeCube.configuration', '九宫格创意魔方配置', 'Creative Cube Configuration');

    // 维度名称
    this.addTranslation('promptSystem.dimensions.targetAudienceName', '目标客群', 'Target Audience');
    this.addTranslation('promptSystem.dimensions.useCaseName', '使用场景', 'Use Case');
    this.addTranslation('promptSystem.dimensions.painPointName', '用户痛点', 'Pain Point');
    this.addTranslation('promptSystem.dimensions.industryName', '行业', 'Industry');
    this.addTranslation('promptSystem.dimensions.coreValueName', '核心价值', 'Core Value');
    this.addTranslation('promptSystem.dimensions.toneStyleName', '表达风格', 'Tone Style');
    this.addTranslation('promptSystem.dimensions.contentFormatName', '内容形式', 'Content Format');
    this.addTranslation('promptSystem.dimensions.emotionalNeedName', '情感诉求', 'Emotional Need');
    this.addTranslation('promptSystem.dimensions.platformTrendName', '平台/趋势', 'Platform/Trend');

    // 维度描述
    this.addTranslation('promptSystem.dimensions.targetAudienceDesc', '选择目标用户群体（必选）', 'Select target user group (required)');
    this.addTranslation('promptSystem.dimensions.useCaseDesc', '定义具体使用情境（必选）', 'Define specific usage scenarios (required)');
    this.addTranslation('promptSystem.dimensions.painPointDesc', '识别核心问题（必选）', 'Identify core problems (required)');
    this.addTranslation('promptSystem.dimensions.industryDesc', '所属行业领域（必选）', 'Industry sector (required)');
    this.addTranslation('promptSystem.dimensions.coreValueDesc', '产品/服务核心价值', 'Product/service core value');
    this.addTranslation('promptSystem.dimensions.toneStyleDesc', '内容表达调性', 'Content expression tone');
    this.addTranslation('promptSystem.dimensions.contentFormatDesc', '输出内容格式', 'Output content format');
    this.addTranslation('promptSystem.dimensions.emotionalNeedDesc', '用户情感需求', 'User emotional needs');
    this.addTranslation('promptSystem.dimensions.platformTrendDesc', '平台特性或热点趋势', 'Platform characteristics or trending topics');

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
        search: /\/\/ 模块锁定常量/g,
        replace: "// {t('promptSystem.module.lockConstant')}"
      },
      {
        search: /\/\/ 标题生成相关/g,
        replace: "// {t('promptSystem.module.titleGeneration')}"
      },
      {
        search: /\/\/ 品牌语料库相关提示词/g,
        replace: "// {t('promptSystem.module.brandCorpus')}"
      },
      {
        search: /\/\/ 内容适配相关/g,
        replace: "// {t('promptSystem.module.contentAdaptation')}"
      },
      {
        search: /\/\/ 创意生成相关/g,
        replace: "// {t('promptSystem.module.creativeGeneration')}"
      },
      {
        search: /\/\/ 品牌分析相关/g,
        replace: "// {t('promptSystem.module.brandAnalysis')}"
      },
      {
        search: /\/\/ 文档处理相关/g,
        replace: "// {t('promptSystem.module.documentProcessing')}"
      },
      {
        search: /\/\/ 其他功能/g,
        replace: "// {t('promptSystem.module.otherFunctions')}"
      },

      // 接口注释
      {
        search: /\* 提示词参数接口/g,
        replace: "* {t('promptSystem.interfaces.promptParams')}"
      },
      {
        search: /\* 平台特征配置接口/g,
        replace: "* {t('promptSystem.interfaces.platformFeatures')}"
      },
      {
        search: /\* 内容形式配置接口/g,
        replace: "* {t('promptSystem.interfaces.contentForm')}"
      },
      {
        search: /\* 表达风格配置接口/g,
        replace: "* {t('promptSystem.interfaces.expressionStyle')}"
      },
      {
        search: /\* 提示词模板接口/g,
        replace: "* {t('promptSystem.interfaces.promptTemplate')}"
      },

      // 核心系统注释
      {
        search: /\* 🎯 统一提示词管理器/g,
        replace: "* 🎯 {t('promptSystem.core.unifiedManager')}"
      },
      {
        search: /\* 初始化平台特征数据/g,
        replace: "* {t('promptSystem.core.initializePlatformData')}"
      },
      {
        search: /\* 初始化内容形式配置/g,
        replace: "* {t('promptSystem.core.initializeContentForms')}"
      },
      {
        search: /\* 初始化表达风格配置/g,
        replace: "* {t('promptSystem.core.initializeExpressionStyles')}"
      },
      {
        search: /\* 初始化所有提示词模板/g,
        replace: "* {t('promptSystem.core.initializePromptTemplates')}"
      }
    ];
  }

  /**
   * 处理提示系统文件
   */
  async processPromptSystemFile() {
    console.log('🔄 处理提示系统文件...');
    
    if (!fs.existsSync(PROMPT_SYSTEM_PATH)) {
      throw new Error(`提示系统文件不存在: ${PROMPT_SYSTEM_PATH}`);
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
    console.log(`✅ 提示系统文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new PromptSystemI18n();
  processor.run().catch(console.error);
}

export default PromptSystemI18n;
