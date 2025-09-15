#!/usr/bin/env node

/**
 * 品牌库页面高级国际化脚本
 * 处理 BrandLibraryPage.tsx 中剩余的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const BRAND_LIBRARY_PATH = 'src/pages/BrandLibraryPage.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class BrandLibraryPageAdvancedI18n {
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
    console.log('📚 开始品牌库页面高级国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理品牌库页面文件
      await this.processBrandLibraryFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 品牌库页面高级国际化完成！`);
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

    // 确保 brandLibraryPage 翻译对象存在
    if (!this.zhTranslations.brandLibraryPage) {
      this.zhTranslations.brandLibraryPage = {};
    }
    if (!this.enTranslations.brandLibraryPage) {
      this.enTranslations.brandLibraryPage = {};
    }

    // 系统分类
    this.addTranslation('brandLibraryPage.categories.brandMaterial.label', '品牌资料', 'Brand Material');
    this.addTranslation('brandLibraryPage.categories.brandMaterial.description', '品牌手册、VI规范、品牌指南等', 'Brand manuals, VI specifications, brand guidelines, etc.');
    this.addTranslation('brandLibraryPage.categories.webContent.label', '网页内容', 'Web Content');
    this.addTranslation('brandLibraryPage.categories.webContent.description', '官网内容、落地页、在线资料等', 'Official website content, landing pages, online materials, etc.');
    this.addTranslation('brandLibraryPage.categories.document.label', '文档资料', 'Document Materials');
    this.addTranslation('brandLibraryPage.categories.document.description', 'PDF、Word、PPT等文档文件', 'PDF, Word, PPT and other document files');
    this.addTranslation('brandLibraryPage.categories.image.label', '图片资料', 'Image Materials');
    this.addTranslation('brandLibraryPage.categories.image.description', '产品图片、宣传图、设计素材等', 'Product images, promotional images, design materials, etc.');
    this.addTranslation('brandLibraryPage.categories.marketing.label', '营销资料', 'Marketing Materials');
    this.addTranslation('brandLibraryPage.categories.marketing.description', '广告文案、营销方案、推广素材等', 'Advertising copy, marketing plans, promotional materials, etc.');
    this.addTranslation('brandLibraryPage.categories.product.label', '产品资料', 'Product Materials');
    this.addTranslation('brandLibraryPage.categories.product.description', '产品介绍、功能说明、技术文档等', 'Product introduction, feature description, technical documentation, etc.');
    this.addTranslation('brandLibraryPage.categories.legal.label', '法务资料', 'Legal Materials');
    this.addTranslation('brandLibraryPage.categories.legal.description', '合同模板、法律条款、合规文件等', 'Contract templates, legal terms, compliance documents, etc.');
    this.addTranslation('brandLibraryPage.categories.internal.label', '内部资料', 'Internal Materials');
    this.addTranslation('brandLibraryPage.categories.internal.description', '内部培训、流程文档、管理制度等', 'Internal training, process documentation, management systems, etc.');

    // 品牌维度
    this.addTranslation('brandLibraryPage.dimensions.brandName.title', '品牌名称', 'Brand Name');
    this.addTranslation('brandLibraryPage.dimensions.brandName.description', '品牌的正式名称、简称、英文名等', 'Official brand name, abbreviation, English name, etc.');
    this.addTranslation('brandLibraryPage.dimensions.brandName.placeholder', '请输入品牌的正式名称、简称、英文名等...', 'Please enter the official brand name, abbreviation, English name, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandDescription.title', '品牌描述', 'Brand Description');
    this.addTranslation('brandLibraryPage.dimensions.brandDescription.description', '品牌的基本介绍和核心定位', 'Basic introduction and core positioning of the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandDescription.placeholder', '请描述品牌的基本情况、核心定位、主要业务等...', 'Please describe the basic situation, core positioning, main business of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.brandTone.title', '品牌语调/语气', 'Brand Tone/Voice');
    this.addTranslation('brandLibraryPage.dimensions.brandTone.description', '品牌的沟通语调和表达风格', 'Brand communication tone and expression style');
    this.addTranslation('brandLibraryPage.dimensions.brandTone.placeholder', '请描述品牌的语调特点，如：专业严谨、亲切友好、活泼幽默等...', 'Please describe the brand tone characteristics, such as: professional and rigorous, friendly, lively and humorous, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandPersonality.title', '品牌个性', 'Brand Personality');
    this.addTranslation('brandLibraryPage.dimensions.brandPersonality.description', '品牌的性格特征和人格化特点', 'Brand character traits and personification features');
    this.addTranslation('brandLibraryPage.dimensions.brandPersonality.placeholder', '请描述品牌的个性特征，如：创新进取、稳重可靠、年轻时尚等...', 'Please describe the brand personality traits, such as: innovative and enterprising, stable and reliable, young and fashionable, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandSlogan.title', '品牌Slogan', 'Brand Slogan');
    this.addTranslation('brandLibraryPage.dimensions.brandSlogan.description', '品牌的核心口号和标语', 'Core slogans and taglines of the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandSlogan.placeholder', '请输入品牌的主要Slogan、口号、标语等...', 'Please enter the main slogans, mottos, taglines of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.brandValues.title', '品牌价值观', 'Brand Values');
    this.addTranslation('brandLibraryPage.dimensions.brandValues.description', '品牌坚持的核心价值观念', 'Core values that the brand adheres to');
    this.addTranslation('brandLibraryPage.dimensions.brandValues.placeholder', '请描述品牌的核心价值观、理念、原则等...', 'Please describe the core values, concepts, principles of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.brandVisionMission.title', '品牌愿景与使命', 'Brand Vision & Mission');
    this.addTranslation('brandLibraryPage.dimensions.brandVisionMission.description', '品牌的长远愿景和使命目标', 'Long-term vision and mission goals of the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandVisionMission.placeholder', '请描述品牌的愿景目标、使命责任、发展方向等...', 'Please describe the vision goals, mission responsibilities, development direction of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.brandStory.title', '品牌故事', 'Brand Story');
    this.addTranslation('brandLibraryPage.dimensions.brandStory.description', '品牌的发展历程和核心故事', 'Development history and core stories of the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandStory.placeholder', '请描述品牌的创立背景、发展历程、重要里程碑、创始人故事等...', 'Please describe the founding background, development history, important milestones, founder stories of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.advertisingSlogans.title', '广告语集', 'Advertising Slogans');
    this.addTranslation('brandLibraryPage.dimensions.advertisingSlogans.description', '品牌的各类广告语和宣传语', 'Various advertising slogans and promotional phrases of the brand');
    this.addTranslation('brandLibraryPage.dimensions.advertisingSlogans.placeholder', '请输入品牌的广告语、宣传语、营销文案等...', 'Please enter advertising slogans, promotional phrases, marketing copy of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.productDescriptions.title', '产品描述词库', 'Product Description Library');
    this.addTranslation('brandLibraryPage.dimensions.productDescriptions.description', '产品介绍和描述的常用词汇', 'Common vocabulary for product introduction and description');
    this.addTranslation('brandLibraryPage.dimensions.productDescriptions.placeholder', '请输入产品描述的常用词汇、特色描述、功能介绍等...', 'Please enter common vocabulary for product description, feature descriptions, function introductions, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandTopics.title', '品牌核心话题', 'Brand Core Topics');
    this.addTranslation('brandLibraryPage.dimensions.brandTopics.description', '品牌经常讨论的核心主题', 'Core themes frequently discussed by the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandTopics.placeholder', '请输入品牌的核心话题、讨论主题、内容方向等...', 'Please enter core topics, discussion themes, content directions of the brand...');

    this.addTranslation('brandLibraryPage.dimensions.brandHashtags.title', '品牌Hashtags', 'Brand Hashtags');
    this.addTranslation('brandLibraryPage.dimensions.brandHashtags.description', '品牌的标签和话题标签', 'Brand tags and topic hashtags');
    this.addTranslation('brandLibraryPage.dimensions.brandHashtags.placeholder', '请输入品牌的Hashtags、话题标签、社交媒体标签等...', 'Please enter brand hashtags, topic tags, social media tags, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandKeywords.title', '品牌关键词', 'Brand Keywords');
    this.addTranslation('brandLibraryPage.dimensions.brandKeywords.description', '品牌的核心关键词和搜索词', 'Core keywords and search terms of the brand');
    this.addTranslation('brandLibraryPage.dimensions.brandKeywords.placeholder', '请输入品牌的关键词、搜索词、SEO词汇等...', 'Please enter brand keywords, search terms, SEO vocabulary, etc...');

    this.addTranslation('brandLibraryPage.dimensions.brandForbiddenWords.title', '品牌禁用词', 'Brand Forbidden Words');
    this.addTranslation('brandLibraryPage.dimensions.brandForbiddenWords.description', '品牌不应使用的词汇和表达', 'Words and expressions that the brand should not use');
    this.addTranslation('brandLibraryPage.dimensions.brandForbiddenWords.placeholder', '请输入品牌应避免使用的词汇、禁用表达、敏感词汇等...', 'Please enter words to avoid, forbidden expressions, sensitive vocabulary, etc...');

    // 状态和操作
    this.addTranslation('brandLibraryPage.status.manualAdd', '手动添加', 'Manual Add');
    this.addTranslation('brandLibraryPage.status.pending', '待分析', 'Pending');
    this.addTranslation('brandLibraryPage.status.analyzed', '已分析', 'Analyzed');
    this.addTranslation('brandLibraryPage.status.error', '错误', 'Error');
    this.addTranslation('brandLibraryPage.status.completed', '已完成', 'Completed');
    this.addTranslation('brandLibraryPage.status.processing', '处理中', 'Processing');
    this.addTranslation('brandLibraryPage.status.extracting', '提取中...', 'Extracting...');
    this.addTranslation('brandLibraryPage.status.extractContent', '提取内容', 'Extract Content');

    this.addTranslation('brandLibraryPage.actions.pinned', '已钉住', 'Pinned');
    this.addTranslation('brandLibraryPage.actions.blocked', '已屏蔽', 'Blocked');
    this.addTranslation('brandLibraryPage.actions.unpin', '取消钉住', 'Unpin');
    this.addTranslation('brandLibraryPage.actions.unblock', '取消屏蔽', 'Unblock');
    this.addTranslation('brandLibraryPage.actions.pin', '📌 钉住', '📌 Pin');
    this.addTranslation('brandLibraryPage.actions.block', '🚫 屏蔽', '🚫 Block');
    this.addTranslation('brandLibraryPage.actions.pinDescription', '固定此条信息，不再改动', 'Pin this information, no more changes');
    this.addTranslation('brandLibraryPage.actions.unpinDescription', '取消固定，允许修改此信息', 'Unpin, allow modification of this information');
    this.addTranslation('brandLibraryPage.actions.blockDescription', '隐藏此信息，不再显示', 'Hide this information, no longer display');
    this.addTranslation('brandLibraryPage.actions.unblockDescription', '重新显示此信息', 'Show this information again');
    this.addTranslation('brandLibraryPage.actions.deleteWarning', '需要先取消钉住/屏蔽状态才能删除', 'Need to unpin/unblock before deletion');
    this.addTranslation('brandLibraryPage.actions.deleteConfirm', '永久删除此信息，无法恢复', 'Permanently delete this information, cannot be recovered');

    // 错误和日志消息
    this.addTranslation('brandLibraryPage.errors.unknownError', '未知错误', 'Unknown error');
    this.addTranslation('brandLibraryPage.errors.fileReadFailed', '文件读取失败', 'File read failed');
    this.addTranslation('brandLibraryPage.errors.invalidUrlFormat', '无效的URL格式，请输入有效的网页地址', 'Invalid URL format, please enter a valid web address');
    this.addTranslation('brandLibraryPage.errors.webExtractorUnavailable', '网页提取服务暂未可用，请稍后再试', 'Web extraction service is temporarily unavailable, please try again later');
    this.addTranslation('brandLibraryPage.errors.contentExtractionFailed', '内容提取失败', 'Content extraction failed');
    this.addTranslation('brandLibraryPage.errors.documentContentNotExtracted', '文档内容暂未提取', 'Document content not extracted yet');

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
      // 系统分类标签
      {
        search: /label: '品牌资料'/g,
        replace: "label: t('brandLibraryPage.categories.brandMaterial.label')"
      },
      {
        search: /description: '品牌手册、VI规范、品牌指南等'/g,
        replace: "description: t('brandLibraryPage.categories.brandMaterial.description')"
      },
      {
        search: /label: '网页内容'/g,
        replace: "label: t('brandLibraryPage.categories.webContent.label')"
      },
      {
        search: /description: '官网内容、落地页、在线资料等'/g,
        replace: "description: t('brandLibraryPage.categories.webContent.description')"
      },
      {
        search: /label: '文档资料'/g,
        replace: "label: t('brandLibraryPage.categories.document.label')"
      },
      {
        search: /description: 'PDF、Word、PPT等文档文件'/g,
        replace: "description: t('brandLibraryPage.categories.document.description')"
      },
      {
        search: /label: '图片资料'/g,
        replace: "label: t('brandLibraryPage.categories.image.label')"
      },
      {
        search: /description: '产品图片、宣传图、设计素材等'/g,
        replace: "description: t('brandLibraryPage.categories.image.description')"
      },
      {
        search: /label: '营销资料'/g,
        replace: "label: t('brandLibraryPage.categories.marketing.label')"
      },
      {
        search: /description: '广告文案、营销方案、推广素材等'/g,
        replace: "description: t('brandLibraryPage.categories.marketing.description')"
      },
      {
        search: /label: '产品资料'/g,
        replace: "label: t('brandLibraryPage.categories.product.label')"
      },
      {
        search: /description: '产品介绍、功能说明、技术文档等'/g,
        replace: "description: t('brandLibraryPage.categories.product.description')"
      },
      {
        search: /label: '法务资料'/g,
        replace: "label: t('brandLibraryPage.categories.legal.label')"
      },
      {
        search: /description: '合同模板、法律条款、合规文件等'/g,
        replace: "description: t('brandLibraryPage.categories.legal.description')"
      },
      {
        search: /label: '内部资料'/g,
        replace: "label: t('brandLibraryPage.categories.internal.label')"
      },
      {
        search: /description: '内部培训、流程文档、管理制度等'/g,
        replace: "description: t('brandLibraryPage.categories.internal.description')"
      },

      // 状态文本
      {
        search: /'手动添加'/g,
        replace: "t('brandLibraryPage.status.manualAdd')"
      },
      {
        search: /'待分析'/g,
        replace: "t('brandLibraryPage.status.pending')"
      },
      {
        search: /'已分析'/g,
        replace: "t('brandLibraryPage.status.analyzed')"
      },
      {
        search: /'错误'/g,
        replace: "t('brandLibraryPage.status.error')"
      },
      {
        search: /'已完成'/g,
        replace: "t('brandLibraryPage.status.completed')"
      },
      {
        search: /'处理中'/g,
        replace: "t('brandLibraryPage.status.processing')"
      },
      {
        search: /'提取中\.\.\.'/g,
        replace: "t('brandLibraryPage.status.extracting')"
      },
      {
        search: /'提取内容'/g,
        replace: "t('brandLibraryPage.status.extractContent')"
      },

      // 操作文本
      {
        search: /'已钉住'/g,
        replace: "t('brandLibraryPage.actions.pinned')"
      },
      {
        search: /'已屏蔽'/g,
        replace: "t('brandLibraryPage.actions.blocked')"
      },
      {
        search: /'取消钉住'/g,
        replace: "t('brandLibraryPage.actions.unpin')"
      },
      {
        search: /'取消屏蔽'/g,
        replace: "t('brandLibraryPage.actions.unblock')"
      },
      {
        search: /'📌 钉住'/g,
        replace: "t('brandLibraryPage.actions.pin')"
      },
      {
        search: /'🚫 屏蔽'/g,
        replace: "t('brandLibraryPage.actions.block')"
      },

      // 错误消息
      {
        search: /'未知错误'/g,
        replace: "t('brandLibraryPage.errors.unknownError')"
      },
      {
        search: /'文件读取失败'/g,
        replace: "t('brandLibraryPage.errors.fileReadFailed')"
      },
      {
        search: /'无效的URL格式，请输入有效的网页地址'/g,
        replace: "t('brandLibraryPage.errors.invalidUrlFormat')"
      },
      {
        search: /'网页提取服务暂未可用，请稍后再试'/g,
        replace: "t('brandLibraryPage.errors.webExtractorUnavailable')"
      },
      {
        search: /'内容提取失败'/g,
        replace: "t('brandLibraryPage.errors.contentExtractionFailed')"
      },
      {
        search: /'文档内容暂未提取'/g,
        replace: "t('brandLibraryPage.errors.documentContentNotExtracted')"
      }
    ];
  }

  /**
   * 处理品牌库页面文件
   */
  async processBrandLibraryFile() {
    console.log('🔄 处理品牌库页面文件...');
    
    if (!fs.existsSync(BRAND_LIBRARY_PATH)) {
      throw new Error(`品牌库页面文件不存在: ${BRAND_LIBRARY_PATH}`);
    }

    let content = fs.readFileSync(BRAND_LIBRARY_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(BRAND_LIBRARY_PATH, content);
    console.log(`✅ 品牌库页面文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new BrandLibraryPageAdvancedI18n();
  processor.run().catch(console.error);
}

export default BrandLibraryPageAdvancedI18n;
