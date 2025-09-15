#!/usr/bin/env node

/**
 * 智能分类服务国际化脚本
 * 处理 intelligentCategoryService.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const CATEGORY_SERVICE_PATH = 'src/services/intelligentCategoryService.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class IntelligentCategoryI18n {
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
    console.log('🧠 开始智能分类服务国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理分类服务文件
      await this.processCategoryServiceFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 智能分类服务国际化完成！`);
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

    // 初始化 intelligentCategory 翻译对象
    if (!this.zhTranslations.intelligentCategory) {
      this.zhTranslations.intelligentCategory = {};
    }
    if (!this.enTranslations.intelligentCategory) {
      this.enTranslations.intelligentCategory = {};
    }

    // 服务描述
    this.addTranslation('intelligentCategory.description', '智能分类标签提取优化服务', 'Intelligent Category Tag Extraction Optimization Service');
    this.addTranslation('intelligentCategory.problemSolved', '解决用户反馈的问题2：自动分类标签提取优化', 'Solves User Feedback Issue 2: Automatic Category Tag Extraction Optimization');

    // 配置选项
    this.addTranslation('intelligentCategory.config.enableMultiLabel', '是否启用多标签分类', 'Enable Multi-label Classification');
    this.addTranslation('intelligentCategory.config.confidenceThreshold', '置信度阈值', 'Confidence Threshold');
    this.addTranslation('intelligentCategory.config.maxLabelsPerItem', '每个项目最大标签数', 'Maximum Labels per Item');
    this.addTranslation('intelligentCategory.config.enableSemanticAnalysis', '是否启用语义分析', 'Enable Semantic Analysis');

    // 结果字段
    this.addTranslation('intelligentCategory.result.primary', '主要分类', 'Primary Category');
    this.addTranslation('intelligentCategory.result.secondary', '次要分类', 'Secondary Categories');
    this.addTranslation('intelligentCategory.result.confidence', '置信度', 'Confidence');
    this.addTranslation('intelligentCategory.result.tags', '提取的标签', 'Extracted Tags');
    this.addTranslation('intelligentCategory.result.reasoning', '分类理由', 'Classification Reasoning');

    // 分类名称
    this.addTranslation('intelligentCategory.categories.technology', '科技', 'Technology');
    this.addTranslation('intelligentCategory.categories.entertainment', '娱乐', 'Entertainment');
    this.addTranslation('intelligentCategory.categories.sports', '体育', 'Sports');
    this.addTranslation('intelligentCategory.categories.finance', '财经', 'Finance');
    this.addTranslation('intelligentCategory.categories.politics', '政治', 'Politics');
    this.addTranslation('intelligentCategory.categories.society', '社会', 'Society');
    this.addTranslation('intelligentCategory.categories.education', '教育', 'Education');
    this.addTranslation('intelligentCategory.categories.health', '健康', 'Health');
    this.addTranslation('intelligentCategory.categories.automotive', '汽车', 'Automotive');
    this.addTranslation('intelligentCategory.categories.food', '美食', 'Food');
    this.addTranslation('intelligentCategory.categories.travel', '旅游', 'Travel');
    this.addTranslation('intelligentCategory.categories.culture', '文化', 'Culture');
    this.addTranslation('intelligentCategory.categories.military', '军事', 'Military');
    this.addTranslation('intelligentCategory.categories.law', '法律', 'Law');
    this.addTranslation('intelligentCategory.categories.environment', '环境', 'Environment');
    this.addTranslation('intelligentCategory.categories.international', '国际', 'International');
    this.addTranslation('intelligentCategory.categories.livelihood', '民生', 'Livelihood');
    this.addTranslation('intelligentCategory.categories.religion', '宗教', 'Religion');
    this.addTranslation('intelligentCategory.categories.agriculture', '农业', 'Agriculture');
    this.addTranslation('intelligentCategory.categories.transportation', '交通', 'Transportation');
    this.addTranslation('intelligentCategory.categories.realEstate', '房产', 'Real Estate');
    this.addTranslation('intelligentCategory.categories.other', '其他', 'Other');

    // 子分类
    this.addTranslation('intelligentCategory.subcategories.ai', '人工智能', 'Artificial Intelligence');
    this.addTranslation('intelligentCategory.subcategories.internet', '互联网', 'Internet');
    this.addTranslation('intelligentCategory.subcategories.hardware', '硬件', 'Hardware');
    this.addTranslation('intelligentCategory.subcategories.software', '软件', 'Software');
    this.addTranslation('intelligentCategory.subcategories.communication', '通信技术', 'Communication Technology');
    this.addTranslation('intelligentCategory.subcategories.emerging', '新兴技术', 'Emerging Technology');

    // 功能描述
    this.addTranslation('intelligentCategory.functions.mainClassification', '智能分类主函数', 'Main Intelligent Classification Function');
    this.addTranslation('intelligentCategory.functions.batchClassification', '批量分类', 'Batch Classification');
    this.addTranslation('intelligentCategory.functions.calculateScore', '计算分类得分 - 优化版本，大幅提升置信度', 'Calculate Classification Score - Optimized Version, Significantly Improved Confidence');
    this.addTranslation('intelligentCategory.functions.escapeRegex', '转义正则表达式特殊字符', 'Escape Regular Expression Special Characters');
    this.addTranslation('intelligentCategory.functions.calculateRelevance', '计算内容相关性 - 基于语义和上下文', 'Calculate Content Relevance - Based on Semantics and Context');
    this.addTranslation('intelligentCategory.functions.fuzzyClassification', '模糊分类 - 当没有明确关键词匹配时的备用分类方法', 'Fuzzy Classification - Backup Classification Method When No Clear Keyword Matches');
    this.addTranslation('intelligentCategory.functions.extractTags', '提取标签', 'Extract Tags');
    this.addTranslation('intelligentCategory.functions.isStopWord', '判断是否为停用词', 'Determine if Word is Stop Word');
    this.addTranslation('intelligentCategory.functions.generateReasoning', '生成分类理由', 'Generate Classification Reasoning');
    this.addTranslation('intelligentCategory.functions.calculateStats', '计算统计信息', 'Calculate Statistics');
    this.addTranslation('intelligentCategory.functions.getSuggestions', '获取分类建议', 'Get Classification Suggestions');
    this.addTranslation('intelligentCategory.functions.updateDictionary', '更新分类词典', 'Update Classification Dictionary');
    this.addTranslation('intelligentCategory.functions.getCategoryStats', '获取分类统计', 'Get Category Statistics');
    this.addTranslation('intelligentCategory.functions.updateConfig', '更新配置', 'Update Configuration');

    // 错误和默认消息
    this.addTranslation('intelligentCategory.errors.incompleteData', '数据不完整，无法进行分类', 'Incomplete Data, Unable to Classify');
    this.addTranslation('intelligentCategory.errors.noMatches', '未找到明确的分类特征，归类为其他', 'No Clear Classification Features Found, Categorized as Other');
    this.addTranslation('intelligentCategory.errors.cannotDetermine', '无法确定分类', 'Cannot Determine Classification');

    // 分类理由模板
    this.addTranslation('intelligentCategory.reasoning.baseOnFeatures', '基于内容特征分析，归类为{{category}}', 'Based on Content Feature Analysis, Categorized as {{category}}');
    this.addTranslation('intelligentCategory.reasoning.baseOnPattern', '基于内容模式识别归类为{{category}}（模糊匹配）', 'Based on Content Pattern Recognition, Categorized as {{category}} (Fuzzy Match)');
    this.addTranslation('intelligentCategory.reasoning.highConfidence', '高度确信', 'Highly Confident');
    this.addTranslation('intelligentCategory.reasoning.moderateConfidence', '较为确信', 'Moderately Confident');
    this.addTranslation('intelligentCategory.reasoning.lowConfidence', '初步判断', 'Preliminary Assessment');
    this.addTranslation('intelligentCategory.reasoning.template', '{{confidence}}属于{{category}}分类，关键特征：{{keywords}}', '{{confidence}} belongs to {{category}} category, key features: {{keywords}}');

    // 注释和说明
    this.addTranslation('intelligentCategory.comments.enhancedDictionary', '增强的分类词典 - 优化版本，提升置信度', 'Enhanced Classification Dictionary - Optimized Version, Improved Confidence');
    this.addTranslation('intelligentCategory.comments.confidenceImprovement', '提升到80%置信度阈值', 'Improved to 80% Confidence Threshold');
    this.addTranslation('intelligentCategory.comments.calculateScores', '计算每个分类的得分', 'Calculate Score for Each Category');
    this.addTranslation('intelligentCategory.comments.sortScores', '排序得分', 'Sort Scores');
    this.addTranslation('intelligentCategory.comments.fuzzyFallback', '如果没有任何匹配，尝试基于内容长度和常见词汇进行模糊分类', 'If No Matches, Try Fuzzy Classification Based on Content Length and Common Vocabulary');
    this.addTranslation('intelligentCategory.comments.optimizeConfidence', '优化置信度计算 - 确保高质量分类达到80%+', 'Optimize Confidence Calculation - Ensure High-quality Classification Reaches 80%+');
    this.addTranslation('intelligentCategory.comments.boostLowScore', '如果原始分数较低，但有明确关键词匹配，提升置信度', 'If Original Score is Low but Has Clear Keyword Matches, Boost Confidence');
    this.addTranslation('intelligentCategory.comments.furtherBoost', '如果分数仍然较低，但内容相关性强，进一步提升', 'If Score is Still Low but Content Relevance is Strong, Further Boost');
    this.addTranslation('intelligentCategory.comments.secondaryThreshold', '确定次要分类 - 提升次要分类的阈值', 'Determine Secondary Categories - Raise Secondary Classification Threshold');
    this.addTranslation('intelligentCategory.comments.improvedThreshold', '提升次要分类阈值', 'Improved Secondary Classification Threshold');

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
      // 文件头部注释
      {
        search: /\/\*\*\s*\n\s*\* 智能分类标签提取优化服务\s*\n\s*\* 解决用户反馈的问题2：自动分类标签提取优化\s*\n\s*\*\//g,
        replace: "/**\n * {t('intelligentCategory.description')}\n * {t('intelligentCategory.problemSolved')}\n */"
      },

      // 配置注释
      {
        search: /\/\/ 是否启用多标签分类/g,
        replace: "// {t('intelligentCategory.config.enableMultiLabel')}"
      },
      {
        search: /\/\/ 置信度阈值/g,
        replace: "// {t('intelligentCategory.config.confidenceThreshold')}"
      },
      {
        search: /\/\/ 每个项目最大标签数/g,
        replace: "// {t('intelligentCategory.config.maxLabelsPerItem')}"
      },
      {
        search: /\/\/ 是否启用语义分析/g,
        replace: "// {t('intelligentCategory.config.enableSemanticAnalysis')}"
      },

      // 结果字段注释
      {
        search: /\/\/ 主要分类/g,
        replace: "// {t('intelligentCategory.result.primary')}"
      },
      {
        search: /\/\/ 次要分类/g,
        replace: "// {t('intelligentCategory.result.secondary')}"
      },
      {
        search: /\/\/ 置信度/g,
        replace: "// {t('intelligentCategory.result.confidence')}"
      },
      {
        search: /\/\/ 提取的标签/g,
        replace: "// {t('intelligentCategory.result.tags')}"
      },
      {
        search: /\/\/ 分类理由/g,
        replace: "// {t('intelligentCategory.result.reasoning')}"
      },

      // 功能注释
      {
        search: /\/\/ 增强的分类词典 - 优化版本，提升置信度/g,
        replace: "// {t('intelligentCategory.comments.enhancedDictionary')}"
      },
      {
        search: /\/\/ 提升到80%置信度阈值/g,
        replace: "// {t('intelligentCategory.comments.confidenceImprovement')}"
      },

      // 函数注释
      {
        search: /\/\*\*\s*\n\s*\* 智能分类主函数\s*\n\s*\*\//g,
        replace: "/**\n   * {t('intelligentCategory.functions.mainClassification')}\n   */"
      },
      {
        search: /\/\*\*\s*\n\s*\* 批量分类\s*\n\s*\*\//g,
        replace: "/**\n   * {t('intelligentCategory.functions.batchClassification')}\n   */"
      },

      // 错误消息
      {
        search: /'数据不完整，无法进行分类'/g,
        replace: "t('intelligentCategory.errors.incompleteData')"
      },
      {
        search: /'未找到明确的分类特征，归类为其他'/g,
        replace: "t('intelligentCategory.errors.noMatches')"
      },
      {
        search: /'无法确定分类'/g,
        replace: "t('intelligentCategory.errors.cannotDetermine')"
      },

      // 分类名称字符串
      {
        search: /'其他'/g,
        replace: "t('intelligentCategory.categories.other')"
      },

      // 分类理由模板
      {
        search: /`基于内容特征分析，归类为\${category}`/g,
        replace: "t('intelligentCategory.reasoning.baseOnFeatures', { category })"
      },
      {
        search: /`基于内容模式识别归类为\${bestMatch\.category}（模糊匹配）`/g,
        replace: "t('intelligentCategory.reasoning.baseOnPattern', { category: bestMatch.category })"
      },

      // 置信度描述
      {
        search: /'高度确信'/g,
        replace: "t('intelligentCategory.reasoning.highConfidence')"
      },
      {
        search: /'较为确信'/g,
        replace: "t('intelligentCategory.reasoning.moderateConfidence')"
      },
      {
        search: /'初步判断'/g,
        replace: "t('intelligentCategory.reasoning.lowConfidence')"
      }
    ];
  }

  /**
   * 处理分类服务文件
   */
  async processCategoryServiceFile() {
    console.log('🔄 处理智能分类服务文件...');
    
    if (!fs.existsSync(CATEGORY_SERVICE_PATH)) {
      throw new Error(`智能分类服务文件不存在: ${CATEGORY_SERVICE_PATH}`);
    }

    let content = fs.readFileSync(CATEGORY_SERVICE_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(CATEGORY_SERVICE_PATH, content);
    console.log(`✅ 智能分类服务文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new IntelligentCategoryI18n();
  processor.run().catch(console.error);
}

export default IntelligentCategoryI18n;
