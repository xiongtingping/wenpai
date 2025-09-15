#!/usr/bin/env node

/**
 * 智能标题生成器国际化脚本
 * 处理 TitleGeneratorIntelligent.tsx 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const TITLE_GENERATOR_PATH = 'src/components/TitleGeneratorIntelligent.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class TitleGeneratorIntelligentI18n {
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
    console.log('🎯 开始智能标题生成器国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理智能标题生成器文件
      await this.processTitleGeneratorFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ 智能标题生成器国际化完成！`);
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

    // 初始化 titleGenerator 翻译对象
    if (!this.zhTranslations.titleGenerator) {
      this.zhTranslations.titleGenerator = {};
    }
    if (!this.enTranslations.titleGenerator) {
      this.enTranslations.titleGenerator = {};
    }

    // 组件标题和描述
    this.addTranslation('titleGenerator.title', '智能标题生成器', 'Intelligent Title Generator');
    this.addTranslation('titleGenerator.description', '基于内容智能生成吸引人的标题', 'Generate attractive titles based on content intelligently');

    // 按钮文本
    this.addTranslation('titleGenerator.buttons.generate', '生成标题', 'Generate Title');
    this.addTranslation('titleGenerator.buttons.regenerate', '重新生成', 'Regenerate');
    this.addTranslation('titleGenerator.buttons.copy', '复制', 'Copy');
    this.addTranslation('titleGenerator.buttons.edit', '编辑', 'Edit');
    this.addTranslation('titleGenerator.buttons.save', '保存', 'Save');
    this.addTranslation('titleGenerator.buttons.cancel', '取消', 'Cancel');
    this.addTranslation('titleGenerator.buttons.refresh', '刷新', 'Refresh');
    this.addTranslation('titleGenerator.buttons.clear', '清空', 'Clear');

    // 输入提示
    this.addTranslation('titleGenerator.placeholders.content', '请输入您的内容...', 'Please enter your content...');
    this.addTranslation('titleGenerator.placeholders.title', '请输入标题...', 'Please enter title...');
    this.addTranslation('titleGenerator.placeholders.keywords', '请输入关键词...', 'Please enter keywords...');

    // 状态消息
    this.addTranslation('titleGenerator.status.generating', '正在生成标题...', 'Generating title...');
    this.addTranslation('titleGenerator.status.success', '标题生成成功', 'Title generated successfully');
    this.addTranslation('titleGenerator.status.error', '标题生成失败', 'Title generation failed');
    this.addTranslation('titleGenerator.status.copied', '已复制到剪贴板', 'Copied to clipboard');
    this.addTranslation('titleGenerator.status.saved', '标题已保存', 'Title saved');

    // 错误消息
    this.addTranslation('titleGenerator.errors.contentRequired', '请输入内容', 'Please enter content');
    this.addTranslation('titleGenerator.errors.contentTooShort', '内容太短，请输入更多内容', 'Content too short, please enter more content');
    this.addTranslation('titleGenerator.errors.generationFailed', '生成失败，请重试', 'Generation failed, please try again');
    this.addTranslation('titleGenerator.errors.networkError', '网络错误，请检查连接', 'Network error, please check connection');
    this.addTranslation('titleGenerator.errors.invalidResponse', '响应格式错误', 'Invalid response format');

    // 平台选择
    this.addTranslation('titleGenerator.platforms.xiaohongshu', '小红书', 'Xiaohongshu');
    this.addTranslation('titleGenerator.platforms.weibo', '微博', 'Weibo');
    this.addTranslation('titleGenerator.platforms.wechat', '微信公众号', 'WeChat Official Account');
    this.addTranslation('titleGenerator.platforms.douyin', '抖音', 'Douyin');
    this.addTranslation('titleGenerator.platforms.zhihu', '知乎', 'Zhihu');
    this.addTranslation('titleGenerator.platforms.bilibili', 'B站', 'Bilibili');

    // 风格选择
    this.addTranslation('titleGenerator.styles.professional', '专业', 'Professional');
    this.addTranslation('titleGenerator.styles.casual', '轻松', 'Casual');
    this.addTranslation('titleGenerator.styles.funny', '幽默', 'Funny');
    this.addTranslation('titleGenerator.styles.emotional', '情感', 'Emotional');
    this.addTranslation('titleGenerator.styles.clickbait', '吸引眼球', 'Clickbait');

    // 质量评分
    this.addTranslation('titleGenerator.quality.score', '质量评分', 'Quality Score');
    this.addTranslation('titleGenerator.quality.excellent', '优秀', 'Excellent');
    this.addTranslation('titleGenerator.quality.good', '良好', 'Good');
    this.addTranslation('titleGenerator.quality.average', '一般', 'Average');
    this.addTranslation('titleGenerator.quality.poor', '较差', 'Poor');

    // 字数统计
    this.addTranslation('titleGenerator.wordCount.current', '当前字数', 'Current Word Count');
    this.addTranslation('titleGenerator.wordCount.limit', '字数限制', 'Word Limit');
    this.addTranslation('titleGenerator.wordCount.exceeded', '超出字数限制', 'Exceeded word limit');
    this.addTranslation('titleGenerator.wordCount.characters', '字', 'characters');

    // 建议和提示
    this.addTranslation('titleGenerator.suggestions.title', '优化建议', 'Optimization Suggestions');
    this.addTranslation('titleGenerator.suggestions.tooLong', '标题过长，建议缩短', 'Title too long, suggest shortening');
    this.addTranslation('titleGenerator.suggestions.tooShort', '标题过短，建议增加内容', 'Title too short, suggest adding content');
    this.addTranslation('titleGenerator.suggestions.addKeywords', '建议添加关键词', 'Suggest adding keywords');
    this.addTranslation('titleGenerator.suggestions.improveClarity', '建议提高清晰度', 'Suggest improving clarity');

    // 历史记录
    this.addTranslation('titleGenerator.history.title', '历史记录', 'History');
    this.addTranslation('titleGenerator.history.empty', '暂无历史记录', 'No history records');
    this.addTranslation('titleGenerator.history.clear', '清空历史', 'Clear History');
    this.addTranslation('titleGenerator.history.restore', '恢复', 'Restore');

    // 设置选项
    this.addTranslation('titleGenerator.settings.title', '设置', 'Settings');
    this.addTranslation('titleGenerator.settings.autoSave', '自动保存', 'Auto Save');
    this.addTranslation('titleGenerator.settings.showScore', '显示评分', 'Show Score');
    this.addTranslation('titleGenerator.settings.enableHistory', '启用历史记录', 'Enable History');

    // 日志消息
    this.addTranslation('titleGenerator.logs.startGeneration', '开始生成标题', 'Start generating title');
    this.addTranslation('titleGenerator.logs.generationComplete', '标题生成完成', 'Title generation complete');
    this.addTranslation('titleGenerator.logs.fixingJson', '开始修复截断的JSON', 'Start fixing truncated JSON');
    this.addTranslation('titleGenerator.logs.jsonFixed', 'JSON修复成功', 'JSON fixed successfully');
    this.addTranslation('titleGenerator.logs.jsonFixFailed', 'JSON修复失败', 'JSON fix failed');

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
      // 日志消息
      {
        search: /logger\.debug\('🔧 开始修复截断的JSON\.\.\.'\);/g,
        replace: "logger.debug('🔧', t('titleGenerator.logs.fixingJson'));"
      },
      {
        search: /logger\.debug\('✅ JSON修复成功:', fixedJson\);/g,
        replace: "logger.debug('✅', t('titleGenerator.logs.jsonFixed'), fixedJson);"
      },
      {
        search: /logger\.debug\('❌ JSON修复失败:', error\);/g,
        replace: "logger.debug('❌', t('titleGenerator.logs.jsonFixFailed'), error);"
      },

      // Toast消息
      {
        search: /title: "生成成功"/g,
        replace: "title: t('titleGenerator.status.success')"
      },
      {
        search: /title: "复制成功"/g,
        replace: "title: t('titleGenerator.status.copied')"
      },
      {
        search: /title: "生成失败"/g,
        replace: "title: t('titleGenerator.status.error')"
      },
      {
        search: /description: "标题已复制到剪贴板"/g,
        replace: "description: t('titleGenerator.status.copied')"
      },

      // 错误消息
      {
        search: /'请输入内容'/g,
        replace: "t('titleGenerator.errors.contentRequired')"
      },
      {
        search: /'内容太短，请输入更多内容'/g,
        replace: "t('titleGenerator.errors.contentTooShort')"
      },
      {
        search: /'生成失败，请重试'/g,
        replace: "t('titleGenerator.errors.generationFailed')"
      },

      // 按钮文本
      {
        search: />生成标题</g,
        replace: ">{t('titleGenerator.buttons.generate')}<"
      },
      {
        search: />重新生成</g,
        replace: ">{t('titleGenerator.buttons.regenerate')}<"
      },
      {
        search: />复制</g,
        replace: ">{t('titleGenerator.buttons.copy')}<"
      },
      {
        search: />编辑</g,
        replace: ">{t('titleGenerator.buttons.edit')}<"
      },
      {
        search: />保存</g,
        replace: ">{t('titleGenerator.buttons.save')}<"
      },
      {
        search: />取消</g,
        replace: ">{t('titleGenerator.buttons.cancel')}<"
      },

      // 占位符文本
      {
        search: /placeholder="请输入您的内容\.\.\."/g,
        replace: "placeholder={t('titleGenerator.placeholders.content')}"
      },
      {
        search: /placeholder="请输入标题\.\.\."/g,
        replace: "placeholder={t('titleGenerator.placeholders.title')}"
      },

      // 状态文本
      {
        search: /'正在生成标题\.\.\.'/g,
        replace: "t('titleGenerator.status.generating')"
      },
      {
        search: /'当前字数'/g,
        replace: "t('titleGenerator.wordCount.current')"
      },
      {
        search: /'字数限制'/g,
        replace: "t('titleGenerator.wordCount.limit')"
      },
      {
        search: /'字'/g,
        replace: "t('titleGenerator.wordCount.characters')"
      }
    ];
  }

  /**
   * 处理智能标题生成器文件
   */
  async processTitleGeneratorFile() {
    console.log('🔄 处理智能标题生成器文件...');
    
    if (!fs.existsSync(TITLE_GENERATOR_PATH)) {
      throw new Error(`智能标题生成器文件不存在: ${TITLE_GENERATOR_PATH}`);
    }

    let content = fs.readFileSync(TITLE_GENERATOR_PATH, 'utf8');
    
    // 添加useTranslation导入
    if (!content.includes('useTranslation')) {
      content = content.replace(
        /import { useToast } from "@\/hooks\/use-toast";/,
        `import { useToast } from "@/hooks/use-toast";\nimport { useTranslation } from 'react-i18next';`
      );
      this.processedCount++;
    }

    // 在组件内添加t函数
    if (!content.includes('const { t } = useTranslation();')) {
      content = content.replace(
        /const { toast } = useToast\(\);/,
        `const { toast } = useToast();\n  const { t } = useTranslation();`
      );
      this.processedCount++;
    }

    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(TITLE_GENERATOR_PATH, content);
    console.log(`✅ 智能标题生成器文件处理完成，共替换 ${this.processedCount} 处文本`);
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
  const processor = new TitleGeneratorIntelligentI18n();
  processor.run().catch(console.error);
}

export default TitleGeneratorIntelligentI18n;
