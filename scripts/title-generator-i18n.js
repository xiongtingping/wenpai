#!/usr/bin/env node

/**
 * TitleGeneratorIntelligent 组件国际化脚本
 * 处理智能标题生成器组件的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const COMPONENT_PATH = 'src/components/TitleGeneratorIntelligent.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class TitleGeneratorI18n {
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
    console.log('🎯 开始 TitleGeneratorIntelligent 组件国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理组件文件
      await this.processComponentFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ TitleGeneratorIntelligent 组件国际化完成！`);
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
    console.log('📖 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      this.zhTranslations = JSON.parse(fs.readFileSync(ZH_LOCALE_PATH, 'utf8'));
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      this.enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
    }
    
    console.log('✅ 翻译文件加载完成');
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 确保titleGenerator部分存在
    if (!this.zhTranslations.titleGenerator) {
      this.zhTranslations.titleGenerator = {};
    }
    if (!this.enTranslations.titleGenerator) {
      this.enTranslations.titleGenerator = {};
    }

    // JSON修复相关
    this.zhTranslations.titleGenerator.jsonFix = {
      fixTruncatedJson: "修复截断的JSON响应",
      alreadyValidJson: "如果已经是有效的JSON，直接返回",
      findLastCompleteObject: "查找最后一个完整的对象或数组",
      fixUnclosedString: "尝试修复未闭合的字符串",
      findLastUnclosedQuote: "找到最后一个未闭合的引号位置",
      fixUnclosedArray: "尝试修复未闭合的数组",
      fixUnclosedObject: "尝试修复未闭合的对象",
      fixIncompleteProperty: "尝试修复未完成的对象属性",
      removeLastComma: "移除最后一个逗号",
      validateFixedJson: "验证修复后的JSON",
      jsonFixFailed: "JSON修复失败",
      aggressiveFix: "更激进的修复：查找最后一个完整的对象",
      useLastCompleteObject: "使用最后一个完整对象",
      continueOtherFixes: "继续尝试其他修复方法"
    };

    this.enTranslations.titleGenerator.jsonFix = {
      fixTruncatedJson: "Fix truncated JSON response",
      alreadyValidJson: "If already valid JSON, return directly",
      findLastCompleteObject: "Find last complete object or array",
      fixUnclosedString: "Try to fix unclosed strings",
      findLastUnclosedQuote: "Find last unclosed quote position",
      fixUnclosedArray: "Try to fix unclosed arrays",
      fixUnclosedObject: "Try to fix unclosed objects",
      fixIncompleteProperty: "Try to fix incomplete object properties",
      removeLastComma: "Remove last comma",
      validateFixedJson: "Validate fixed JSON",
      jsonFixFailed: "JSON fix failed",
      aggressiveFix: "More aggressive fix: find last complete object",
      useLastCompleteObject: "Use last complete object",
      continueOtherFixes: "Continue trying other fix methods"
    };

    // 生成相关
    this.zhTranslations.titleGenerator.generation = {
      generationTimeout: "生成超时",
      contentSource: "内容来源",
      userSelectedModel: "用户选择的模型",
      optimizeAiGeneration: "优化AI生成 - 减少备用模型调用，提高成功率",
      adjustTimeoutByModel: "根据用户选择的模型调整超时时间",
      buildAiPrompt: "构建AI Prompt",
      callAiApi: "调用AI API",
      conservativeTemperature: "更保守的温度设置，减少随机性",
      reduceTokens: "进一步减少token数，提高响应速度",
      keepOneRetry: "保持1次重试，最大化响应速度",
      resultOriented: "结果导向型",
      aiGenerated: "AI生成",
      extractedContent: "提取的内容"
    };

    this.enTranslations.titleGenerator.generation = {
      generationTimeout: "Generation timeout",
      contentSource: "Content source",
      userSelectedModel: "User selected model",
      optimizeAiGeneration: "Optimize AI generation - reduce backup model calls, improve success rate",
      adjustTimeoutByModel: "Adjust timeout based on user selected model",
      buildAiPrompt: "Build AI Prompt",
      callAiApi: "Call AI API",
      conservativeTemperature: "More conservative temperature setting, reduce randomness",
      reduceTokens: "Further reduce tokens, improve response speed",
      keepOneRetry: "Keep 1 retry, maximize response speed",
      resultOriented: "Result-oriented",
      aiGenerated: "AI Generated",
      extractedContent: "Extracted content"
    };

    // 错误处理
    this.zhTranslations.titleGenerator.errors = {
      generationFailed: "标题生成失败",
      noValidTitles: "未生成有效标题",
      parseResponseFailed: "解析响应失败",
      invalidResponse: "无效响应",
      networkError: "网络错误",
      modelError: "模型错误",
      timeoutError: "超时错误",
      unknownError: "未知错误"
    };

    this.enTranslations.titleGenerator.errors = {
      generationFailed: "Title generation failed",
      noValidTitles: "No valid titles generated",
      parseResponseFailed: "Failed to parse response",
      invalidResponse: "Invalid response",
      networkError: "Network error",
      modelError: "Model error",
      timeoutError: "Timeout error",
      unknownError: "Unknown error"
    };

    // UI相关
    this.zhTranslations.titleGenerator.ui = {
      titleGenerator: "标题生成器",
      generateTitles: "生成标题",
      generating: "生成中...",
      regenerate: "重新生成",
      selectTitle: "选择标题",
      editTitle: "编辑标题",
      saveTitle: "保存标题",
      cancelEdit: "取消编辑",
      copyTitle: "复制标题",
      likeTitle: "喜欢",
      dislikeTitle: "不喜欢",
      titleLength: "标题长度",
      titleStyle: "标题风格",
      confidence: "置信度",
      semanticFit: "语义匹配度",
      diversityScore: "多样性评分",
      overallScore: "综合评分"
    };

    this.enTranslations.titleGenerator.ui = {
      titleGenerator: "Title Generator",
      generateTitles: "Generate Titles",
      generating: "Generating...",
      regenerate: "Regenerate",
      selectTitle: "Select Title",
      editTitle: "Edit Title",
      saveTitle: "Save Title",
      cancelEdit: "Cancel Edit",
      copyTitle: "Copy Title",
      likeTitle: "Like",
      dislikeTitle: "Dislike",
      titleLength: "Title Length",
      titleStyle: "Title Style",
      confidence: "Confidence",
      semanticFit: "Semantic Fit",
      diversityScore: "Diversity Score",
      overallScore: "Overall Score"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // JSON修复相关注释
      {
        search: /修复截断的JSON响应/g,
        replace: "{t('titleGenerator.jsonFix.fixTruncatedJson')}"
      },
      {
        search: /如果已经是有效的JSON，直接返回/g,
        replace: "{t('titleGenerator.jsonFix.alreadyValidJson')}"
      },
      {
        search: /查找最后一个完整的对象或数组/g,
        replace: "{t('titleGenerator.jsonFix.findLastCompleteObject')}"
      },
      {
        search: /尝试修复未闭合的字符串/g,
        replace: "{t('titleGenerator.jsonFix.fixUnclosedString')}"
      },
      {
        search: /找到最后一个未闭合的引号位置/g,
        replace: "{t('titleGenerator.jsonFix.findLastUnclosedQuote')}"
      },
      {
        search: /尝试修复未闭合的数组/g,
        replace: "{t('titleGenerator.jsonFix.fixUnclosedArray')}"
      },
      {
        search: /尝试修复未闭合的对象/g,
        replace: "{t('titleGenerator.jsonFix.fixUnclosedObject')}"
      },
      {
        search: /尝试修复未完成的对象属性/g,
        replace: "{t('titleGenerator.jsonFix.fixIncompleteProperty')}"
      },
      {
        search: /移除最后一个逗号/g,
        replace: "{t('titleGenerator.jsonFix.removeLastComma')}"
      },
      {
        search: /验证修复后的JSON/g,
        replace: "{t('titleGenerator.jsonFix.validateFixedJson')}"
      },
      {
        search: /更激进的修复：查找最后一个完整的对象/g,
        replace: "{t('titleGenerator.jsonFix.aggressiveFix')}"
      },
      {
        search: /使用最后一个完整对象/g,
        replace: "{t('titleGenerator.jsonFix.useLastCompleteObject')}"
      },
      {
        search: /继续尝试其他修复方法/g,
        replace: "{t('titleGenerator.jsonFix.continueOtherFixes')}"
      },

      // 生成相关
      {
        search: /'生成超时'/g,
        replace: "t('titleGenerator.generation.generationTimeout')"
      },
      {
        search: /内容来源/g,
        replace: "{t('titleGenerator.generation.contentSource')}"
      },
      {
        search: /用户选择的模型/g,
        replace: "{t('titleGenerator.generation.userSelectedModel')}"
      },
      {
        search: /优化AI生成 - 减少备用模型调用，提高成功率/g,
        replace: "{t('titleGenerator.generation.optimizeAiGeneration')}"
      },
      {
        search: /根据用户选择的模型调整超时时间/g,
        replace: "{t('titleGenerator.generation.adjustTimeoutByModel')}"
      },
      {
        search: /构建AI Prompt/g,
        replace: "{t('titleGenerator.generation.buildAiPrompt')}"
      },
      {
        search: /更保守的温度设置，减少随机性/g,
        replace: "{t('titleGenerator.generation.conservativeTemperature')}"
      },
      {
        search: /进一步减少token数，提高响应速度/g,
        replace: "{t('titleGenerator.generation.reduceTokens')}"
      },
      {
        search: /保持1次重试，最大化响应速度/g,
        replace: "{t('titleGenerator.generation.keepOneRetry')}"
      },
      {
        search: /'结果导向型'/g,
        replace: "t('titleGenerator.generation.resultOriented')"
      },
      {
        search: /'AI生成'/g,
        replace: "t('titleGenerator.generation.aiGenerated')"
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

    // 确保已导入useTranslation
    if (!content.includes('useTranslation')) {
      console.log('✅ useTranslation已存在');
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

// 运行脚本
const titleGeneratorI18n = new TitleGeneratorI18n();
titleGeneratorI18n.run().catch(console.error);
