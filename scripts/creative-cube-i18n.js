#!/usr/bin/env node

/**
 * CreativeCube 组件国际化脚本
 * 处理九宫格创意魔方组件的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const COMPONENT_PATH = 'src/components/creative/CreativeCube.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class CreativeCubeI18n {
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
    console.log('🎨 开始 CreativeCube 组件国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理组件文件
      await this.processComponentFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ CreativeCube 组件国际化完成！`);
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

    // 初始化 creativeCube 翻译对象
    if (!this.zhTranslations.creativeCube) {
      this.zhTranslations.creativeCube = {};
    }
    if (!this.enTranslations.creativeCube) {
      this.enTranslations.creativeCube = {};
    }

    // 组件标题和描述
    this.addTranslation('creativeCube.title', '九宫格创意魔方', 'Creative Cube');
    this.addTranslation('creativeCube.description', '选择不同维度的元素，AI将为你生成可直接使用的创意内容', 'Select elements from different dimensions, and AI will generate ready-to-use creative content for you');

    // 维度相关
    this.addTranslation('creativeCube.dimensions.required', '必选', 'Required');
    this.addTranslation('creativeCube.dimensions.restore', '还原', 'Restore');
    this.addTranslation('creativeCube.dimensions.addCustom', '输入自定义选项...', 'Enter custom option...');

    // 当前选择
    this.addTranslation('creativeCube.currentSelection.title', '当前已选择的维度', 'Currently Selected Dimensions');
    this.addTranslation('creativeCube.currentSelection.count', '个维度', ' dimensions');

    // 控制按钮
    this.addTranslation('creativeCube.controls.dimensionCount', '控制维度数量为', 'Control dimension count to');
    this.addTranslation('creativeCube.controls.required', '必选', 'required');
    this.addTranslation('creativeCube.controls.random', '随机', 'random');
    this.addTranslation('creativeCube.controls.randomGenerate', '🎲 随机一键生成', '🎲 Random One-Click Generate');
    this.addTranslation('creativeCube.controls.clearSelection', '清空选择', 'Clear Selection');
    this.addTranslation('creativeCube.controls.generating', '生成中...', 'Generating...');
    this.addTranslation('creativeCube.controls.generateContent', '生成创意内容', 'Generate Creative Content');

    // 生成结果
    this.addTranslation('creativeCube.result.title', '生成结果', 'Generated Result');
    this.addTranslation('creativeCube.result.creativeTitle', '📝 创意标题', '📝 Creative Title');
    this.addTranslation('creativeCube.result.mainContent', '📄 主要内容', '📄 Main Content');
    this.addTranslation('creativeCube.result.creativeContent', '🎨 创意内容', '🎨 Creative Content');
    this.addTranslation('creativeCube.result.interaction', '💬 互动引导', '💬 Interaction Guide');

    // 操作按钮
    this.addTranslation('creativeCube.actions.edit', '编辑', 'Edit');
    this.addTranslation('creativeCube.actions.copy', '复制', 'Copy');
    this.addTranslation('creativeCube.actions.save', '保存', 'Save');
    this.addTranslation('creativeCube.actions.cancel', '取消', 'Cancel');
    this.addTranslation('creativeCube.actions.regenerate', '重新生成', 'Regenerate');
    this.addTranslation('creativeCube.actions.regenerating', '重新生成中...', 'Regenerating...');
    this.addTranslation('creativeCube.actions.copyToAdapter', '一键复制至AI内容适配器', 'One-Click Copy to AI Content Adapter');

    // 历史记录
    this.addTranslation('creativeCube.history.title', '历史生成记录', 'Generation History');

    // Toast 消息
    this.addTranslation('creativeCube.messages.customOptionSaved', '自定义选项已保存', 'Custom option saved');
    this.addTranslation('creativeCube.messages.optionSavedDesc', '"{{item}}" 已添加到 {{dimension}} 维度', '"{{item}}" has been added to {{dimension}} dimension');
    this.addTranslation('creativeCube.messages.randomComplete', '🎲 随机选择完成', '🎲 Random selection complete');
    this.addTranslation('creativeCube.messages.randomCompleteDesc', '已为{{count}}个维度生成随机选择', 'Random selection generated for {{count}} dimensions');
    this.addTranslation('creativeCube.messages.selectionCleared', '已清空选择', 'Selection cleared');
    this.addTranslation('creativeCube.messages.selectionClearedDesc', '所有维度选择已清空', 'All dimension selections cleared');
    this.addTranslation('creativeCube.messages.optionDeleted', '选项已删除', 'Option deleted');
    this.addTranslation('creativeCube.messages.optionDeletedDesc', '"{{item}}" 已从 {{dimension}} 维度中移除', '"{{item}}" has been removed from {{dimension}} dimension');
    this.addTranslation('creativeCube.messages.customOptionDeleted', '自定义选项已删除', 'Custom option deleted');
    this.addTranslation('creativeCube.messages.allCustomCleared', '已清空所有自定义选项', 'All custom options cleared');
    this.addTranslation('creativeCube.messages.allCustomClearedDesc', '所有自定义维度选项已清空，恢复为默认选项', 'All custom dimension options cleared, restored to default options');
    this.addTranslation('creativeCube.messages.allDeletedRestored', '已恢复所有删除的选项', 'All deleted options restored');
    this.addTranslation('creativeCube.messages.allDeletedRestoredDesc', '所有被删除的默认选项已恢复显示', 'All deleted default options have been restored');
    this.addTranslation('creativeCube.messages.defaultRestored', '已恢复默认选项', 'Default options restored');
    this.addTranslation('creativeCube.messages.defaultRestoredDesc', '"{{name}}" 的默认选项已恢复显示', 'Default options for "{{name}}" have been restored');
    this.addTranslation('creativeCube.messages.optionPinned', '选项已钉住', 'Option pinned');
    this.addTranslation('creativeCube.messages.optionPinnedDesc', '"{{item}}" 已标记为必用选项', '"{{item}}" has been marked as required option');
    this.addTranslation('creativeCube.messages.optionUnpinned', '取消钉住', 'Unpinned');
    this.addTranslation('creativeCube.messages.optionUnpinnedDesc', '"{{item}}" 已取消必用标记', '"{{item}}" has been unmarked as required');

    // 错误消息
    this.addTranslation('creativeCube.errors.missingDimensions', '关键维度缺失', 'Key dimensions missing');
    this.addTranslation('creativeCube.errors.missingDimensionsDesc', '请确保已选择【{{dimensions}}】后再生成内容', 'Please ensure you have selected [{{dimensions}}] before generating content');
    this.addTranslation('creativeCube.errors.generateFailed', '生成失败', 'Generation failed');
    this.addTranslation('creativeCube.errors.generateFailedDesc', 'AI生成内容失败', 'AI content generation failed');
    this.addTranslation('creativeCube.errors.cannotRegenerate', '无法重新生成', 'Cannot regenerate');
    this.addTranslation('creativeCube.errors.cannotRegenerateDesc', '请先生成内容', 'Please generate content first');
    this.addTranslation('creativeCube.errors.cannotRegenerateNoSelection', '请先选择维度', 'Please select dimensions first');
    this.addTranslation('creativeCube.errors.cannotExport', '无法导出', 'Cannot export');
    this.addTranslation('creativeCube.errors.cannotExportDesc', '只有短视频脚本才能导出Excel', 'Only video scripts can be exported to Excel');
    this.addTranslation('creativeCube.errors.noContentToSave', '无内容可保存', 'No content to save');
    this.addTranslation('creativeCube.errors.noContentToSaveDesc', '请先生成创意内容', 'Please generate creative content first');

    // 成功消息
    this.addTranslation('creativeCube.success.generateSuccess', '生成成功', 'Generation successful');
    this.addTranslation('creativeCube.success.generateSuccessDesc', '已生成{{type}}', '{{type}} generated');
    this.addTranslation('creativeCube.success.exportSuccess', '导出成功', 'Export successful');
    this.addTranslation('creativeCube.success.exportSuccessDesc', '短视频脚本已导出为CSV文件', 'Video script exported as CSV file');
    this.addTranslation('creativeCube.success.copiedToClipboard', '已复制到剪贴板', 'Copied to clipboard');
    this.addTranslation('creativeCube.success.copiedToClipboardDesc', '创意内容已复制', 'Creative content copied');
    this.addTranslation('creativeCube.success.titleCopied', '标题已复制', 'Title copied');
    this.addTranslation('creativeCube.success.titleCopiedDesc', '创意标题已复制到剪贴板', 'Creative title copied to clipboard');
    this.addTranslation('creativeCube.success.contentCopied', '内容已复制', 'Content copied');
    this.addTranslation('creativeCube.success.contentCopiedDesc', '创意内容已复制到剪贴板', 'Creative content copied to clipboard');
    this.addTranslation('creativeCube.success.savedToLibrary', '已保存到创意库', 'Saved to creative library');
    this.addTranslation('creativeCube.success.savedToLibraryDesc', '创意已保存到您的专属历史记录 ({{mode}}模式)', 'Creative saved to your exclusive history ({{mode}} mode)');
    this.addTranslation('creativeCube.success.jumpingToAdapter', '正在跳转至AI内容适配器', 'Jumping to AI Content Adapter');
    this.addTranslation('creativeCube.success.jumpingToAdapterDesc', '内容已准备好，即将自动填入适配器', 'Content ready, will be automatically filled into adapter');

    // 占位符和提示
    this.addTranslation('creativeCube.placeholders.editContent', '编辑内容... (Ctrl+Enter保存，Escape取消，失去焦点自动保存)', 'Edit content... (Ctrl+Enter to save, Escape to cancel, auto-save on blur)');

    // 内容类型
    this.addTranslation('creativeCube.contentTypes.text', '图文内容', 'Text Content');
    this.addTranslation('creativeCube.contentTypes.video', '短视频脚本', 'Video Script');

    // 用户模式
    this.addTranslation('creativeCube.userModes.user', '用户', 'User');
    this.addTranslation('creativeCube.userModes.guest', '访客', 'Guest');

    // 添加更多翻译
    this.addMoreTranslations();

    // 定义替换规则
    this.defineReplacements();
  }

  /**
   * 添加更多翻译
   */
  addMoreTranslations() {
    // 维度选项数量
    this.addTranslation('creativeCube.dimensionCounts.4', '4个', '4');
    this.addTranslation('creativeCube.dimensionCounts.5', '5个', '5');
    this.addTranslation('creativeCube.dimensionCounts.6', '6个', '6');
    this.addTranslation('creativeCube.dimensionCounts.7', '7个', '7');
    this.addTranslation('creativeCube.dimensionCounts.8', '8个', '8');
    this.addTranslation('creativeCube.dimensionCounts.9', '9个', '9');

    // 权限功能名称
    this.addTranslation('creativeCube.permissions.dimensionControl', '维度数量控制', 'Dimension Count Control');
    this.addTranslation('creativeCube.permissions.randomGenerate', '随机一键生成', 'Random One-Click Generate');
    this.addTranslation('creativeCube.permissions.clearSelection', '清空维度选择', 'Clear Dimension Selection');

    // 生成结果相关
    this.addTranslation('creativeCube.result.creativeTitle', '创意标题', 'Creative Title');
    this.addTranslation('creativeCube.result.mainContent', '主要内容', 'Main Content');
    this.addTranslation('creativeCube.result.creativeContent', '创意内容', 'Creative Content');
    this.addTranslation('creativeCube.result.interactionGuide', '互动引导', 'Interaction Guide');

    // 编辑相关
    this.addTranslation('creativeCube.editing.editPlaceholder', '编辑内容... (Ctrl+Enter保存，Escape取消，失去焦点自动保存)', 'Edit content... (Ctrl+Enter to save, Escape to cancel, auto-save on blur)');

    // 历史记录
    this.addTranslation('creativeCube.history.title', '历史生成记录', 'Generation History');

    // 注释和说明
    this.addTranslation('creativeCube.comments.headerArea', '头部区域 - 维度标题和描述', 'Header Area - Dimension Title and Description');
    this.addTranslation('creativeCube.comments.contentArea', '内容区域 - 选项按钮', 'Content Area - Option Buttons');
    this.addTranslation('creativeCube.comments.showDefaultItems', '显示默认项（过滤隐藏项）', 'Show Default Items (Filter Hidden Items)');
    this.addTranslation('creativeCube.comments.showCustomItems', '显示自定义项', 'Show Custom Items');
    this.addTranslation('creativeCube.comments.addCustomOption', '添加自定义选项按钮 - 放在网格的最后', 'Add Custom Option Button - Place at End of Grid');
    this.addTranslation('creativeCube.comments.addCustomInput', '添加自定义选项输入框 - 显示在网格下方', 'Add Custom Option Input - Display Below Grid');
    this.addTranslation('creativeCube.comments.managementButtons', '管理按钮', 'Management Buttons');
    this.addTranslation('creativeCube.comments.defaultItemButtons', '管理按钮 - 默认项显示钉住和删除按钮', 'Management Buttons - Default Items Show Pin and Delete Buttons');
    this.addTranslation('creativeCube.comments.oneClickRestore', '一键还原按钮 - 替换钉图标', 'One-Click Restore Button - Replace Pin Icon');
    this.addTranslation('creativeCube.comments.permissionMask', '权限遮罩', 'Permission Mask');
    this.addTranslation('creativeCube.comments.randomSelectionControl', '随机选择控制', 'Random Selection Control');
    this.addTranslation('creativeCube.comments.generateContentDisplay', '生成内容展示', 'Generated Content Display');
    this.addTranslation('creativeCube.comments.regenerateButton', '重新生成按钮', 'Regenerate Button');
    this.addTranslation('creativeCube.comments.titleSection', '标题部分', 'Title Section');
    this.addTranslation('creativeCube.comments.mainContentSection', '主要内容', 'Main Content');
    this.addTranslation('creativeCube.comments.interactionSection', '互动引导部分', 'Interaction Guide Section');

    // 系统消息和日志
    this.addTranslation('creativeCube.logs.loadedHistory', '已加载{{count}}条创意历史记录', 'Loaded {{count}} creative history records');
    this.addTranslation('creativeCube.logs.loadedCustomOptions', '已加载用户自定义维度选项', 'Loaded user custom dimension options');
    this.addTranslation('creativeCube.logs.loadedHiddenOptions', '已加载用户隐藏的选项', 'Loaded user hidden options');
    this.addTranslation('creativeCube.logs.loadedPinnedOptions', '已加载用户钉住的选项', 'Loaded user pinned options');
    this.addTranslation('creativeCube.logs.savedCustomOption', '已保存自定义维度选项', 'Saved custom dimension option');
    this.addTranslation('creativeCube.logs.hiddenDefaultOption', '已隐藏默认选项', 'Hidden default option');
    this.addTranslation('creativeCube.logs.deletedCustomOption', '已删除自定义选项', 'Deleted custom option');
    this.addTranslation('creativeCube.logs.pinnedOption', '已钉住选项', 'Pinned option');
    this.addTranslation('creativeCube.logs.unpinnedOption', '已取消钉住选项', 'Unpinned option');
    this.addTranslation('creativeCube.logs.savedCreativeRecord', '已保存创意记录到用户存储', 'Saved creative record to user storage');

    // 维度类型和分类
    this.addTranslation('creativeCube.dimensions.ageGroups', '年龄分层', 'Age Groups');
    this.addTranslation('creativeCube.dimensions.identityRoles', '身份角色', 'Identity Roles');
    this.addTranslation('creativeCube.dimensions.interestTags', '兴趣标签', 'Interest Tags');
    this.addTranslation('creativeCube.dimensions.consumerTraits', '消费特征', 'Consumer Traits');
    this.addTranslation('creativeCube.dimensions.lifestyleStatus', '生活状态', 'Lifestyle Status');
    this.addTranslation('creativeCube.dimensions.timeScenarios', '时间场景', 'Time Scenarios');
    this.addTranslation('creativeCube.dimensions.locationScenarios', '地点场景', 'Location Scenarios');
    this.addTranslation('creativeCube.dimensions.activityScenarios', '活动场景', 'Activity Scenarios');
    this.addTranslation('creativeCube.dimensions.specialScenarios', '特殊场景', 'Special Scenarios');

    // 更多维度分类
    this.addTranslation('creativeCube.dimensions.timeRelated', '时间相关', 'Time Related');
    this.addTranslation('creativeCube.dimensions.moneyRelated', '金钱相关', 'Money Related');
    this.addTranslation('creativeCube.dimensions.choiceRelated', '选择相关', 'Choice Related');
    this.addTranslation('creativeCube.dimensions.skillRelated', '技能相关', 'Skill Related');
    this.addTranslation('creativeCube.dimensions.emotionalRelated', '情感相关', 'Emotional Related');
    this.addTranslation('creativeCube.dimensions.serviceRelated', '服务相关', 'Service Related');

    // 行业分类
    this.addTranslation('creativeCube.industries.lifeServices', '生活服务', 'Life Services');
    this.addTranslation('creativeCube.industries.healthMedical', '健康医疗', 'Health & Medical');
    this.addTranslation('creativeCube.industries.educationTraining', '教育培训', 'Education & Training');
    this.addTranslation('creativeCube.industries.techDigital', '科技数码', 'Technology & Digital');
    this.addTranslation('creativeCube.industries.financialServices', '金融服务', 'Financial Services');
    this.addTranslation('creativeCube.industries.travelTourism', '出行旅游', 'Travel & Tourism');
    this.addTranslation('creativeCube.industries.businessServices', '商业服务', 'Business Services');

    // 核心价值分类
    this.addTranslation('creativeCube.values.efficiencyImprovement', '效率提升', 'Efficiency Improvement');
    this.addTranslation('creativeCube.values.experienceImprovement', '体验改善', 'Experience Improvement');
    this.addTranslation('creativeCube.values.costControl', '成本控制', 'Cost Control');
    this.addTranslation('creativeCube.values.qualityAssurance', '品质保障', 'Quality Assurance');
    this.addTranslation('creativeCube.values.emotionalValue', '情感价值', 'Emotional Value');
    this.addTranslation('creativeCube.values.growthDevelopment', '成长发展', 'Growth & Development');
    this.addTranslation('creativeCube.values.innovationBreakthrough', '创新突破', 'Innovation & Breakthrough');

    // 表达风格分类
    this.addTranslation('creativeCube.tones.emotionalTone', '情感调性', 'Emotional Tone');
    this.addTranslation('creativeCube.tones.professionalTone', '专业调性', 'Professional Tone');
    this.addTranslation('creativeCube.tones.expressionStyle', '表达方式', 'Expression Style');
    this.addTranslation('creativeCube.tones.creativeStyle', '创意风格', 'Creative Style');
    this.addTranslation('creativeCube.tones.interactionStyle', '互动风格', 'Interaction Style');
    this.addTranslation('creativeCube.tones.platformFeatures', '平台特色', 'Platform Features');

    // 内容形式分类
    this.addTranslation('creativeCube.formats.imageText', '图文类', 'Image & Text');
    this.addTranslation('creativeCube.formats.video', '视频类', 'Video');
    this.addTranslation('creativeCube.formats.interactive', '互动类', 'Interactive');
    this.addTranslation('creativeCube.formats.contentForms', '内容形式', 'Content Forms');
    this.addTranslation('creativeCube.formats.creativeForms', '创意形式', 'Creative Forms');
    this.addTranslation('creativeCube.formats.toolTypes', '工具类', 'Tool Types');

    // 情感需求分类
    this.addTranslation('creativeCube.emotions.basicNeeds', '基础需求', 'Basic Needs');
    this.addTranslation('creativeCube.emotions.achievementNeeds', '成就需求', 'Achievement Needs');
    this.addTranslation('creativeCube.emotions.socialNeeds', '社交需求', 'Social Needs');
    this.addTranslation('creativeCube.emotions.emotionalExperience', '情感体验', 'Emotional Experience');
    this.addTranslation('creativeCube.emotions.mentalState', '心理状态', 'Mental State');
    this.addTranslation('creativeCube.emotions.lifeAttitude', '生活态度', 'Life Attitude');

    // 平台和趋势分类
    this.addTranslation('creativeCube.platforms.mainstream', '主流平台', 'Mainstream Platforms');
    this.addTranslation('creativeCube.platforms.emerging', '新兴平台', 'Emerging Platforms');
    this.addTranslation('creativeCube.platforms.hotTrends', '热门趋势', 'Hot Trends');
    this.addTranslation('creativeCube.platforms.lifestyle', '生活方式', 'Lifestyle');
    this.addTranslation('creativeCube.platforms.techTrends', '科技趋势', 'Tech Trends');
    this.addTranslation('creativeCube.platforms.consumerTrends', '消费趋势', 'Consumer Trends');
    this.addTranslation('creativeCube.platforms.socialPhenomena', '社会现象', 'Social Phenomena');
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
      // 组件标题和描述
      {
        search: /九宫格创意魔方/g,
        replace: "{t('creativeCube.title')}"
      },
      {
        search: /选择不同维度的元素，AI将为你生成可直接使用的创意内容/g,
        replace: "{t('creativeCube.description')}"
      },
      
      // 必选标签
      {
        search: /<Badge[^>]*>必选<\/Badge>/g,
        replace: "<Badge variant=\"destructive\" className=\"creative-module-label px-1.5 py-0.5\">{t('creativeCube.dimensions.required')}</Badge>"
      },
      
      // 还原按钮
      {
        search: /还原/g,
        replace: "{t('creativeCube.dimensions.restore')}"
      },
      
      // 输入框占位符
      {
        search: /placeholder="输入自定义选项\.\.\."/g,
        replace: "placeholder={t('creativeCube.dimensions.addCustom')}"
      },
      
      // 当前选择标题
      {
        search: /当前已选择的维度/g,
        replace: "{t('creativeCube.currentSelection.title')}"
      },
      {
        search: /个维度/g,
        replace: "{t('creativeCube.currentSelection.count')}"
      },
      
      // 控制按钮文本
      {
        search: /控制维度数量为/g,
        replace: "{t('creativeCube.controls.dimensionCount')}"
      },
      {
        search: /必选\+/g,
        replace: "{t('creativeCube.controls.required')}+"
      },
      {
        search: /随机/g,
        replace: "{t('creativeCube.controls.random')}"
      },
      {
        search: /🎲 随机一键生成/g,
        replace: "{t('creativeCube.controls.randomGenerate')}"
      },
      {
        search: /清空选择/g,
        replace: "{t('creativeCube.controls.clearSelection')}"
      },
      {
        search: /生成中\.\.\./g,
        replace: "{t('creativeCube.controls.generating')}"
      },
      {
        search: /生成创意内容/g,
        replace: "{t('creativeCube.controls.generateContent')}"
      },

      // 维度数量选项
      {
        search: /<SelectItem value="4">4个<\/SelectItem>/g,
        replace: "<SelectItem value=\"4\">{t('creativeCube.dimensionCounts.4')}</SelectItem>"
      },
      {
        search: /<SelectItem value="5">5个<\/SelectItem>/g,
        replace: "<SelectItem value=\"5\">{t('creativeCube.dimensionCounts.5')}</SelectItem>"
      },
      {
        search: /<SelectItem value="6">6个<\/SelectItem>/g,
        replace: "<SelectItem value=\"6\">{t('creativeCube.dimensionCounts.6')}</SelectItem>"
      },
      {
        search: /<SelectItem value="7">7个<\/SelectItem>/g,
        replace: "<SelectItem value=\"7\">{t('creativeCube.dimensionCounts.7')}</SelectItem>"
      },
      {
        search: /<SelectItem value="8">8个<\/SelectItem>/g,
        replace: "<SelectItem value=\"8\">{t('creativeCube.dimensionCounts.8')}</SelectItem>"
      },
      {
        search: /<SelectItem value="9">9个<\/SelectItem>/g,
        replace: "<SelectItem value=\"9\">{t('creativeCube.dimensionCounts.9')}</SelectItem>"
      },

      // 权限功能名称
      {
        search: /featureName="维度数量控制"/g,
        replace: "featureName={t('creativeCube.permissions.dimensionControl')}"
      },
      {
        search: /featureName="{t\('creativeCube\.controls\.random'\)}一键生成"/g,
        replace: "featureName={t('creativeCube.permissions.randomGenerate')}"
      },
      {
        search: /featureName="清空维度选择"/g,
        replace: "featureName={t('creativeCube.permissions.clearSelection')}"
      },

      // 生成结果相关
      {
        search: /生成结果/g,
        replace: "{t('creativeCube.result.title')}"
      },
      {
        search: /📝 创意标题/g,
        replace: "{t('creativeCube.result.creativeTitle')}"
      },
      {
        search: /📄 主要内容/g,
        replace: "{t('creativeCube.result.mainContent')}"
      },
      {
        search: /🎨 创意内容/g,
        replace: "{t('creativeCube.result.creativeContent')}"
      },
      {
        search: /💬 互动引导/g,
        replace: "{t('creativeCube.result.interactionGuide')}"
      },

      // 编辑和操作按钮
      {
        search: /编辑/g,
        replace: "{t('creativeCube.actions.edit')}"
      },
      {
        search: /复制/g,
        replace: "{t('creativeCube.actions.copy')}"
      },
      {
        search: /保存/g,
        replace: "{t('creativeCube.actions.save')}"
      },
      {
        search: /取消/g,
        replace: "{t('creativeCube.actions.cancel')}"
      },
      {
        search: /重新生成/g,
        replace: "{t('creativeCube.actions.regenerate')}"
      },
      {
        search: /重新{t\('creativeCube\.controls\.generating'\)}/g,
        replace: "{t('creativeCube.actions.regenerating')}"
      },
      {
        search: /一键复制至AI内容适配器/g,
        replace: "{t('creativeCube.actions.copyToAdapter')}"
      },

      // 历史记录
      {
        search: /历史生成记录/g,
        replace: "{t('creativeCube.history.title')}"
      },

      // 注释文本
      {
        search: /\/\* 头部区域 - 维度标题和描述 \*\//g,
        replace: "/* {t('creativeCube.comments.headerArea')} */"
      },
      {
        search: /\/\* 内容区域 - 选项按钮 \*\//g,
        replace: "/* {t('creativeCube.comments.contentArea')} */"
      },
      {
        search: /\/\* 显示默认项（过滤隐藏项） \*\//g,
        replace: "/* {t('creativeCube.comments.showDefaultItems')} */"
      },
      {
        search: /\/\* 显示自定义项 \*\//g,
        replace: "/* {t('creativeCube.comments.showCustomItems')} */"
      },
      {
        search: /\/\* 添加自定义选项按钮 - 放在网格的最后 \*\//g,
        replace: "/* {t('creativeCube.comments.addCustomOption')} */"
      },
      {
        search: /\/\* 添加自定义选项输入框 - 显示在网格下方 \*\//g,
        replace: "/* {t('creativeCube.comments.addCustomInput')} */"
      },
      {
        search: /\/\* 管理按钮 \*\//g,
        replace: "/* {t('creativeCube.comments.managementButtons')} */"
      },
      {
        search: /\/\* 管理按钮 - 默认项显示钉住和删除按钮 \*\//g,
        replace: "/* {t('creativeCube.comments.defaultItemButtons')} */"
      },
      {
        search: /\/\* 一键{t\('creativeCube\.dimensions\.restore'\)}按钮 - 替换钉图标 \*\//g,
        replace: "/* {t('creativeCube.comments.oneClickRestore')} */"
      },
      {
        search: /\/\* 权限遮罩 \*\//g,
        replace: "/* {t('creativeCube.comments.permissionMask')} */"
      },
      {
        search: /\/\* {t\('creativeCube\.controls\.random'\)}选择控制 \*\//g,
        replace: "/* {t('creativeCube.comments.randomSelectionControl')} */"
      },
      {
        search: /\/\* 生成内容展示 \*\//g,
        replace: "/* {t('creativeCube.comments.generateContentDisplay')} */"
      },
      {
        search: /\/\* 重新生成按钮 \*\//g,
        replace: "/* {t('creativeCube.comments.regenerateButton')} */"
      },
      {
        search: /\/\* 标题部分 \*\//g,
        replace: "/* {t('creativeCube.comments.titleSection')} */"
      },
      {
        search: /\/\* 主要内容 \*\//g,
        replace: "/* {t('creativeCube.comments.mainContentSection')} */"
      },
      {
        search: /\/\* 互动引导部分 \*\//g,
        replace: "/* {t('creativeCube.comments.interactionSection')} */"
      }
    ];
  }

  /**
   * 处理组件文件
   */
  async processComponentFile() {
    console.log('🔄 处理组件文件...');
    
    if (!fs.existsSync(COMPONENT_PATH)) {
      throw new Error(`组件文件不存在: ${COMPONENT_PATH}`);
    }

    let content = fs.readFileSync(COMPONENT_PATH, 'utf8');
    
    // 添加 useTranslation 导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        /import.*from 'react';/,
        `import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';`
      );
    }

    // 在组件开始处添加 useTranslation hook
    if (!content.includes('const { t } = useTranslation()')) {
      content = content.replace(
        /export default function CreativeCube\(\) \{/,
        `export default function CreativeCube() {
  const { t } = useTranslation();`
      );
    }

    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(COMPONENT_PATH, content);
    console.log(`✅ 组件文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new CreativeCubeI18n();
  processor.run().catch(console.error);
}

export default CreativeCubeI18n;
