#!/usr/bin/env node

/**
 * 统一Emoji系统国际化脚本
 * 处理 unifiedEmojiSystem.ts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const EMOJI_SYSTEM_PATH = 'src/services/unifiedEmojiSystem.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class EmojiSystemI18n {
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
    console.log('🎨 开始 Emoji 系统国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理 Emoji 系统文件
      await this.processEmojiSystemFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ Emoji 系统国际化完成！`);
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

    // 初始化 emojiSystem 翻译对象
    if (!this.zhTranslations.emojiSystem) {
      this.zhTranslations.emojiSystem = {};
    }
    if (!this.enTranslations.emojiSystem) {
      this.enTranslations.emojiSystem = {};
    }

    // 系统描述
    this.addTranslation('emojiSystem.description', '统一Emoji管理系统', 'Unified Emoji Management System');
    this.addTranslation('emojiSystem.integration', '整合所有模块的emoji功能，提供统一的数据管理和接口', 'Integrates emoji functionality from all modules, providing unified data management and interfaces');

    // 数据类型
    this.addTranslation('emojiSystem.types.basicData', '基础emoji数据类型', 'Basic Emoji Data Type');
    this.addTranslation('emojiSystem.types.usageContext', 'Emoji使用场景类型', 'Emoji Usage Context Type');
    this.addTranslation('emojiSystem.types.platformType', '平台类型', 'Platform Type');
    this.addTranslation('emojiSystem.types.sizeConfig', 'Emoji尺寸配置', 'Emoji Size Configuration');
    this.addTranslation('emojiSystem.types.sizeMapping', 'Emoji尺寸配置映射表', 'Emoji Size Configuration Mapping');

    // 使用场景
    this.addTranslation('emojiSystem.contexts.avatar', '头像', 'Avatar');
    this.addTranslation('emojiSystem.contexts.decoration', '装饰', 'Decoration');
    this.addTranslation('emojiSystem.contexts.button', '按钮', 'Button');
    this.addTranslation('emojiSystem.contexts.title', '标题', 'Title');
    this.addTranslation('emojiSystem.contexts.content', '正文内容', 'Content');
    this.addTranslation('emojiSystem.contexts.card', '卡片', 'Card');
    this.addTranslation('emojiSystem.contexts.icon', '图标', 'Icon');
    this.addTranslation('emojiSystem.contexts.badge', '徽章', 'Badge');
    this.addTranslation('emojiSystem.contexts.notification', '通知', 'Notification');
    this.addTranslation('emojiSystem.contexts.status', '状态指示', 'Status Indicator');
    this.addTranslation('emojiSystem.contexts.reaction', '反应/表情回应', 'Reaction/Emoji Response');
    this.addTranslation('emojiSystem.contexts.picker', '选择器', 'Picker');

    // 分类配置
    this.addTranslation('emojiSystem.categories.config', 'emoji分类配置', 'Emoji Category Configuration');
    this.addTranslation('emojiSystem.categories.animals', '动物类', 'Animals');
    this.addTranslation('emojiSystem.categories.food', '食物类', 'Food');
    this.addTranslation('emojiSystem.categories.objects', '物品类', 'Objects');
    this.addTranslation('emojiSystem.categories.emotions', '表情类', 'Emotions');
    this.addTranslation('emojiSystem.categories.nature', '自然类', 'Nature');

    // 分类描述
    this.addTranslation('emojiSystem.descriptions.animals', '可爱的动物朋友们', 'Cute Animal Friends');
    this.addTranslation('emojiSystem.descriptions.food', '美味的食物和饮品', 'Delicious Food and Drinks');
    this.addTranslation('emojiSystem.descriptions.objects', '日常用品和工具', 'Daily Items and Tools');
    this.addTranslation('emojiSystem.descriptions.emotions', '丰富的情感表达', 'Rich Emotional Expressions');
    this.addTranslation('emojiSystem.descriptions.nature', '大自然的美好', 'Beauty of Nature');

    // 颜色
    this.addTranslation('emojiSystem.colors.red', '红色', 'Red');
    this.addTranslation('emojiSystem.colors.blue', '蓝色', 'Blue');
    this.addTranslation('emojiSystem.colors.green', '绿色', 'Green');
    this.addTranslation('emojiSystem.colors.yellow', '黄色', 'Yellow');
    this.addTranslation('emojiSystem.colors.purple', '紫色', 'Purple');
    this.addTranslation('emojiSystem.colors.brown', '棕色', 'Brown');
    this.addTranslation('emojiSystem.colors.gray', '灰色', 'Gray');
    this.addTranslation('emojiSystem.colors.white', '白色', 'White');
    this.addTranslation('emojiSystem.colors.black', '黑色', 'Black');
    this.addTranslation('emojiSystem.colors.orange', '橙色', 'Orange');
    this.addTranslation('emojiSystem.colors.pink', '粉色', 'Pink');
    this.addTranslation('emojiSystem.colors.colorful', '彩色', 'Colorful');
    this.addTranslation('emojiSystem.colors.gold', '金色', 'Gold');
    this.addTranslation('emojiSystem.colors.silver', '银色', 'Silver');
    this.addTranslation('emojiSystem.colors.blackWhite', '黑白', 'Black & White');

    // 扩展分类
    this.addTranslation('emojiSystem.extended.animals', '扩展的动物类emoji', 'Extended Animal Emojis');
    this.addTranslation('emojiSystem.extended.food', '扩展的食物类emoji', 'Extended Food Emojis');
    this.addTranslation('emojiSystem.extended.objects', '扩展的物品类emoji', 'Extended Object Emojis');
    this.addTranslation('emojiSystem.extended.emotions', '扩展的表情类emoji', 'Extended Emotion Emojis');
    this.addTranslation('emojiSystem.extended.nature', '扩展的自然类emoji', 'Extended Nature Emojis');

    // 子分类
    this.addTranslation('emojiSystem.subcategories.original', '原有的', 'Original');
    this.addTranslation('emojiSystem.subcategories.newAdded', '新增', 'Newly Added');
    this.addTranslation('emojiSystem.subcategories.transport', '交通工具类', 'Transportation');
    this.addTranslation('emojiSystem.subcategories.electronics', '电子设备类', 'Electronic Devices');
    this.addTranslation('emojiSystem.subcategories.basic', '基础表情', 'Basic Expressions');
    this.addTranslation('emojiSystem.subcategories.weather', '天气现象', 'Weather Phenomena');

    // 功能描述
    this.addTranslation('emojiSystem.functions.platformDetection', '检测当前平台类型', 'Detect Current Platform Type');
    this.addTranslation('emojiSystem.functions.adaptiveSize', '获取自适应emoji尺寸配置', 'Get Adaptive Emoji Size Configuration');
    this.addTranslation('emojiSystem.functions.adaptiveStyle', '生成自适应emoji样式', 'Generate Adaptive Emoji Styles');
    this.addTranslation('emojiSystem.functions.svgGeneration', '生成emoji的SVG表示（用于头像生成）', 'Generate SVG Representation of Emoji (for Avatar Generation)');
    this.addTranslation('emojiSystem.functions.getAllEmojis', '获取所有emoji', 'Get All Emojis');
    this.addTranslation('emojiSystem.functions.getByCategory', '按分类获取emoji', 'Get Emojis by Category');
    this.addTranslation('emojiSystem.functions.searchEmojis', '搜索emoji', 'Search Emojis');
    this.addTranslation('emojiSystem.functions.randomEmojis', '随机获取emoji', 'Get Random Emojis');
    this.addTranslation('emojiSystem.functions.getCategories', '获取分类信息', 'Get Category Information');
    this.addTranslation('emojiSystem.functions.addCustom', '添加自定义emoji', 'Add Custom Emoji');
    this.addTranslation('emojiSystem.functions.updateData', '更新emoji数据', 'Update Emoji Data');
    this.addTranslation('emojiSystem.functions.getStats', '获取emoji统计信息', 'Get Emoji Statistics');

    // 子分类规则
    this.addTranslation('emojiSystem.subcategoryRules.title', '子分类规则：用于更细粒度的筛选', 'Subcategory Rules: For Fine-grained Filtering');
    this.addTranslation('emojiSystem.subcategoryRules.mammals', '哺乳', 'Mammals');
    this.addTranslation('emojiSystem.subcategoryRules.birds', '鸟类', 'Birds');
    this.addTranslation('emojiSystem.subcategoryRules.aquatic', '水生', 'Aquatic');
    this.addTranslation('emojiSystem.subcategoryRules.insects', '昆虫', 'Insects');
    this.addTranslation('emojiSystem.subcategoryRules.myth', '神话', 'Mythical');
    this.addTranslation('emojiSystem.subcategoryRules.other', '其他', 'Other');
    this.addTranslation('emojiSystem.subcategoryRules.fruit', '水果', 'Fruits');
    this.addTranslation('emojiSystem.subcategoryRules.dessert', '甜点', 'Desserts');
    this.addTranslation('emojiSystem.subcategoryRules.drink', '饮品', 'Drinks');
    this.addTranslation('emojiSystem.subcategoryRules.cooked', '熟食', 'Cooked Food');
    this.addTranslation('emojiSystem.subcategoryRules.vehicle', '交通', 'Vehicles');
    this.addTranslation('emojiSystem.subcategoryRules.device', '设备', 'Devices');
    this.addTranslation('emojiSystem.subcategoryRules.tool', '工具', 'Tools');
    this.addTranslation('emojiSystem.subcategoryRules.happy', '积极', 'Positive');
    this.addTranslation('emojiSystem.subcategoryRules.negative', '消极', 'Negative');
    this.addTranslation('emojiSystem.subcategoryRules.love', '爱情', 'Love');
    this.addTranslation('emojiSystem.subcategoryRules.weather', '天气', 'Weather');
    this.addTranslation('emojiSystem.subcategoryRules.plant', '植物', 'Plants');
    this.addTranslation('emojiSystem.subcategoryRules.astro', '天体', 'Celestial');

    // 质量检查
    this.addTranslation('emojiSystem.quality.dataQualityCheck', '数据质量检查与修复', 'Data Quality Check and Repair');
    this.addTranslation('emojiSystem.quality.removeDuplicates', '删除重复emoji（按 emoji 字符去重，保留首次）', 'Remove Duplicate Emojis (Deduplicate by Emoji Character, Keep First)');
    this.addTranslation('emojiSystem.quality.fixNameMismatch', '修正名称-字符错配', 'Fix Name-Character Mismatch');
    this.addTranslation('emojiSystem.quality.categoryOverride', '明确的分类覆写与规则性纠偏', 'Explicit Category Override and Rule-based Correction');
    this.addTranslation('emojiSystem.quality.removeAnomalies', '首项异常清理', 'Remove Initial Anomalies');

    // 注释和说明
    this.addTranslation('emojiSystem.comments.ensureMinimum', '确保每个主分类至少 minCount 个（去重补齐）', 'Ensure Each Main Category Has at Least minCount Items (Deduplicated and Supplemented)');
    this.addTranslation('emojiSystem.comments.existingSet', '现有集合：用"emoji字符"去重', 'Existing Set: Deduplicate by "Emoji Character"');
    this.addTranslation('emojiSystem.comments.mapRawData', '将原始数据映射进入候选池', 'Map Raw Data into Candidate Pool');
    this.addTranslation('emojiSystem.comments.supplementByCategory', '逐类补齐', 'Supplement by Category');
    this.addTranslation('emojiSystem.comments.qualityCheckAfter', '质检后再补齐一轮，确保去重后仍满足 >100', 'Supplement Again After Quality Check to Ensure >100 After Deduplication');
    this.addTranslation('emojiSystem.comments.colorMapping', '颜色描述到CSS颜色值的映射', 'Mapping from Color Descriptions to CSS Color Values');
    this.addTranslation('emojiSystem.comments.uniqueIdentifier', '为了确保每次生成的dataURL不同（避免缓存/重渲染问题），引入唯一标识', 'Introduce Unique Identifier to Ensure Different dataURL Each Time (Avoid Cache/Re-render Issues)');
    this.addTranslation('emojiSystem.comments.colorConversion', '将颜色描述转换为CSS颜色值', 'Convert Color Descriptions to CSS Color Values');
    this.addTranslation('emojiSystem.comments.unicodeHandling', '处理Unicode到Base64编码，避免btoa的Unicode问题', 'Handle Unicode to Base64 Encoding to Avoid btoa Unicode Issues');
    this.addTranslation('emojiSystem.comments.dynamicCounting', '动态根据数据源计算各分类数量，避免与静态配置不一致', 'Dynamically Calculate Category Counts Based on Data Source to Avoid Inconsistency with Static Configuration');
    this.addTranslation('emojiSystem.comments.auxiliaryMatching', '辅助匹配：仅按关键词匹配，避免名称子串误伤', 'Auxiliary Matching: Match Only by Keywords to Avoid Name Substring False Positives');
    this.addTranslation('emojiSystem.comments.otherCategory', '其他 = 不属于任何正向子类', 'Other = Does Not Belong to Any Positive Subcategory');

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
        search: /\/\*\*\s*\n\s*\* 统一Emoji管理系统\s*\n\s*\* 整合所有模块的emoji功能，提供统一的数据管理和接口\s*\n\s*\*\//g,
        replace: "/**\n * {t('emojiSystem.description')}\n * {t('emojiSystem.integration')}\n */"
      },
      {
        search: /\/\/ 基础emoji数据类型/g,
        replace: "// {t('emojiSystem.types.basicData')}"
      },
      {
        search: /\/\*\*\s*\n\s*\* Emoji使用场景类型\s*\n\s*\*\//g,
        replace: "/**\n * {t('emojiSystem.types.usageContext')}\n */"
      },
      {
        search: /\/\*\*\s*\n\s*\* 平台类型\s*\n\s*\*\//g,
        replace: "/**\n * {t('emojiSystem.types.platformType')}\n */"
      },
      {
        search: /\/\*\*\s*\n\s*\* Emoji尺寸配置\s*\n\s*\*\//g,
        replace: "/**\n * {t('emojiSystem.types.sizeConfig')}\n */"
      },

      // 使用场景注释
      {
        search: /\/\/ 头像/g,
        replace: "// {t('emojiSystem.contexts.avatar')}"
      },
      {
        search: /\/\/ 装饰/g,
        replace: "// {t('emojiSystem.contexts.decoration')}"
      },
      {
        search: /\/\/ 按钮/g,
        replace: "// {t('emojiSystem.contexts.button')}"
      },
      {
        search: /\/\/ 标题/g,
        replace: "// {t('emojiSystem.contexts.title')}"
      },
      {
        search: /\/\/ 正文内容/g,
        replace: "// {t('emojiSystem.contexts.content')}"
      },

      // 分类名称
      {
        search: /name: '动物类'/g,
        replace: "name: t('emojiSystem.categories.animals')"
      },
      {
        search: /name: '食物类'/g,
        replace: "name: t('emojiSystem.categories.food')"
      },
      {
        search: /name: '物品类'/g,
        replace: "name: t('emojiSystem.categories.objects')"
      },
      {
        search: /name: '表情类'/g,
        replace: "name: t('emojiSystem.categories.emotions')"
      },
      {
        search: /name: '自然类'/g,
        replace: "name: t('emojiSystem.categories.nature')"
      },

      // 分类描述
      {
        search: /description: '可爱的动物朋友们'/g,
        replace: "description: t('emojiSystem.descriptions.animals')"
      },
      {
        search: /description: '美味的食物和饮品'/g,
        replace: "description: t('emojiSystem.descriptions.food')"
      },
      {
        search: /description: '日常用品和工具'/g,
        replace: "description: t('emojiSystem.descriptions.objects')"
      },
      {
        search: /description: '丰富的情感表达'/g,
        replace: "description: t('emojiSystem.descriptions.emotions')"
      },
      {
        search: /description: '大自然的美好'/g,
        replace: "description: t('emojiSystem.descriptions.nature')"
      }
    ];
  }

  /**
   * 处理 Emoji 系统文件
   */
  async processEmojiSystemFile() {
    console.log('🔄 处理 Emoji 系统文件...');
    
    if (!fs.existsSync(EMOJI_SYSTEM_PATH)) {
      throw new Error(`Emoji 系统文件不存在: ${EMOJI_SYSTEM_PATH}`);
    }

    let content = fs.readFileSync(EMOJI_SYSTEM_PATH, 'utf8');
    
    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(EMOJI_SYSTEM_PATH, content);
    console.log(`✅ Emoji 系统文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new EmojiSystemI18n();
  processor.run().catch(console.error);
}

export default EmojiSystemI18n;
