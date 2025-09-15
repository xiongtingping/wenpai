#!/usr/bin/env node

/**
 * AI提示词文件国际化脚本
 * 处理 AI prompts 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const AI_PROMPTS_PATHS = [
  'src/ai/prompts/titleGeneration.ts',
  'src/ai/prompts/titleGenerationSystemPrompt.ts',
  'src/ai/prompts/brand.ts'
];
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class AIPromptsI18n {
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
    console.log('📝 开始AI提示词文件国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理AI提示词文件
      await this.processAIPromptFiles();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ AI提示词文件国际化完成！`);
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

    // 初始化 aiPrompts 翻译对象
    if (!this.zhTranslations.aiPrompts) {
      this.zhTranslations.aiPrompts = {};
    }
    if (!this.enTranslations.aiPrompts) {
      this.enTranslations.aiPrompts = {};
    }

    // 标题生成相关
    this.addTranslation('aiPrompts.titleGeneration.targetPlatform', '目标平台', 'Target Platform');
    this.addTranslation('aiPrompts.titleGeneration.wordLimit', '字数限制', 'Word Limit');
    this.addTranslation('aiPrompts.titleGeneration.wordsWithin', '字以内', 'words within');
    this.addTranslation('aiPrompts.titleGeneration.titleContent', '标题内容', 'Title Content');
    this.addTranslation('aiPrompts.titleGeneration.currentLength', '当前长度', 'Current Length');
    this.addTranslation('aiPrompts.titleGeneration.words', '字', 'words');
    this.addTranslation('aiPrompts.titleGeneration.ifExceedsLimit', '如有超字数标题', 'If title exceeds limit');
    this.addTranslation('aiPrompts.titleGeneration.pleaseCall', '请调用', 'please call');
    this.addTranslation('aiPrompts.titleGeneration.truncateAtWordBoundary', '以词语边界截断并闭合语义', 'truncate at word boundary and close semantics');

    // 品牌相关
    this.addTranslation('aiPrompts.brand.riskReminder', '潜在风险提醒', 'Potential Risk Reminder');

    // 通用提示词元素
    this.addTranslation('aiPrompts.common.requirements', '生成要求', 'Generation Requirements');
    this.addTranslation('aiPrompts.common.outputCount', '输出数量', 'Output Count');
    this.addTranslation('aiPrompts.common.styleRequirements', '风格要求', 'Style Requirements');
    this.addTranslation('aiPrompts.common.attractivenessElements', '吸引力要素', 'Attractiveness Elements');
    this.addTranslation('aiPrompts.common.ensureDiversity', '确保多样性', 'Ensure Diversity');
    this.addTranslation('aiPrompts.common.contentAnalysis', '内容分析要求', 'Content Analysis Requirements');
    this.addTranslation('aiPrompts.common.coreObjects', '核心对象', 'Core Objects');
    this.addTranslation('aiPrompts.common.userBenefits', '用户收益', 'User Benefits');
    this.addTranslation('aiPrompts.common.usageScenarios', '使用场景', 'Usage Scenarios');
    this.addTranslation('aiPrompts.common.keyActions', '关键动作', 'Key Actions');

    // 平台相关
    this.addTranslation('aiPrompts.platforms.xiaohongshu', '小红书', 'Xiaohongshu');
    this.addTranslation('aiPrompts.platforms.weibo', '微博', 'Weibo');
    this.addTranslation('aiPrompts.platforms.wechat', '微信公众号', 'WeChat Official Account');
    this.addTranslation('aiPrompts.platforms.douyin', '抖音', 'Douyin');
    this.addTranslation('aiPrompts.platforms.zhihu', '知乎', 'Zhihu');

    // 风格相关
    this.addTranslation('aiPrompts.styles.professional', '专业', 'Professional');
    this.addTranslation('aiPrompts.styles.casual', '轻松', 'Casual');
    this.addTranslation('aiPrompts.styles.humorous', '幽默', 'Humorous');
    this.addTranslation('aiPrompts.styles.emotional', '情感', 'Emotional');
    this.addTranslation('aiPrompts.styles.clickbait', '吸引眼球', 'Clickbait');

    // 状态相关
    this.addTranslation('aiPrompts.status.yes', '是', 'Yes');
    this.addTranslation('aiPrompts.status.no', '否', 'No');
    this.addTranslation('aiPrompts.status.allStyles', '所有风格', 'All Styles');

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
      // 标题生成相关
      {
        search: /"目标平台"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.targetPlatform')"
      },
      {
        search: /"字数限制"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.wordLimit')"
      },
      {
        search: /"字以内"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.wordsWithin')"
      },
      {
        search: /"标题内容"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.titleContent')"
      },
      {
        search: /"当前长度"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.currentLength')"
      },
      {
        search: /"字"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.words')"
      },
      {
        search: /"如有超字数标题"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.ifExceedsLimit')"
      },
      {
        search: /"请调用"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.pleaseCall')"
      },
      {
        search: /"以词语边界截断并闭合语义"/g,
        replace: "i18n.t('aiPrompts.titleGeneration.truncateAtWordBoundary')"
      },

      // 品牌相关
      {
        search: /"潜在风险提醒"/g,
        replace: "i18n.t('aiPrompts.brand.riskReminder')"
      },

      // 状态相关
      {
        search: /'是'/g,
        replace: "i18n.t('aiPrompts.status.yes')"
      },
      {
        search: /'否'/g,
        replace: "i18n.t('aiPrompts.status.no')"
      },
      {
        search: /'所有风格'/g,
        replace: "i18n.t('aiPrompts.status.allStyles')"
      }
    ];
  }

  /**
   * 处理AI提示词文件
   */
  async processAIPromptFiles() {
    console.log('🔄 处理AI提示词文件...');
    
    for (const filePath of AI_PROMPTS_PATHS) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
        continue;
      }

      console.log(`📝 处理文件: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 添加i18n导入（如果是TypeScript文件且没有React组件）
      if (filePath.endsWith('.ts') && !content.includes('import i18n')) {
        content = content.replace(
          /import/,
          `import i18n from '@/i18n';\nimport`
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
      fs.writeFileSync(filePath, content);
      console.log(`✅ ${filePath} 处理完成`);
    }
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
  const processor = new AIPromptsI18n();
  processor.run().catch(console.error);
}

export default AIPromptsI18n;
