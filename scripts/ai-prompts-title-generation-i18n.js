#!/usr/bin/env node

/**
 * AI提示词标题生成文件国际化自动替换脚本
 * 处理titleGeneration.ts和titleGenerationSystemPrompt.ts的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const TITLE_GENERATION_PATH = 'src/ai/prompts/titleGeneration.ts';
const TITLE_GENERATION_SYSTEM_PATH = 'src/ai/prompts/titleGenerationSystemPrompt.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class AIPromptsTitleGenerationI18n {
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
    console.log('🎯 开始 AI提示词标题生成 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理文件
      await this.processFiles();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ AI提示词标题生成 国际化完成！`);
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

    // 确保aiPrompts部分存在
    if (!this.zhTranslations.aiPrompts) {
      this.zhTranslations.aiPrompts = {};
    }
    if (!this.enTranslations.aiPrompts) {
      this.enTranslations.aiPrompts = {};
    }

    // 标题生成相关
    this.zhTranslations.aiPrompts.titleGeneration = {
      targetPlatform: "目标平台",
      characterLimit: "字数限制",
      charactersWithin: "字以内",
      currentLength: "当前长度",
      character: "字",
      ifExceedsLimit: "如有超字数标题",
      pleaseCall: "请调用",
      truncateAtWordBoundary: "以词语边界截断并闭合语义",
      generateTitle: "生成标题",
      titleOptimization: "标题优化",
      contentAnalysis: "内容分析",
      platformAdaptation: "平台适配",
      qualityAssessment: "质量评估",
      userRequirements: "用户要求",
      outputFormat: "输出格式",
      generationRules: "生成规则",
      evaluationCriteria: "评估标准",
      bestPractices: "最佳实践",
      commonMistakes: "常见错误",
      improvementSuggestions: "改进建议"
    };

    this.enTranslations.aiPrompts.titleGeneration = {
      targetPlatform: "Target Platform",
      characterLimit: "Character Limit",
      charactersWithin: "characters within",
      currentLength: "Current Length",
      character: "characters",
      ifExceedsLimit: "If title exceeds limit",
      pleaseCall: "please call",
      truncateAtWordBoundary: "truncate at word boundary and close semantics",
      generateTitle: "Generate Title",
      titleOptimization: "Title Optimization",
      contentAnalysis: "Content Analysis",
      platformAdaptation: "Platform Adaptation",
      qualityAssessment: "Quality Assessment",
      userRequirements: "User Requirements",
      outputFormat: "Output Format",
      generationRules: "Generation Rules",
      evaluationCriteria: "Evaluation Criteria",
      bestPractices: "Best Practices",
      commonMistakes: "Common Mistakes",
      improvementSuggestions: "Improvement Suggestions"
    };

    // 系统提示词相关
    this.zhTranslations.aiPrompts.systemPrompts = {
      titleGenerationExpert: "你是一个擅长生成\"高吸引力内容标题\"的AI助手",
      generateBasedOnContent: "请根据用户提供的正文内容生成符合平台要求、表达自然完整、结构多样、主旨贴合、具备点击吸引力的标题",
      contentAlignmentConstraints: "强化内容主旨对齐（拟合）约束",
      semanticConstraints: "必须执行以下语义约束",
      titleMustBeBased: "标题必须基于用户提供的正文内容（版本A/B）生成，不允许脱离文本主旨",
      semanticCoverage: "标题语义应覆盖正文内容的",
      coreObject: "核心对象（如：文派工具、AI内容平台适配等）",
      userBenefits: "用户收益（如：多平台适配、省时间、省力、提升效率）",
      usageScenarios: "使用场景（如：小红书、公众号、抖音内容创作）",
      keyActions: "关键动作（如：一键生成、智能适配、批量处理）",
      quantifiedEffects: "量化效果（如：节省80%时间、支持10+平台）",
      prohibitedContent: "禁止内容",
      fabricatedData: "虚构数据：不得添加正文中未提及的具体数字、百分比、时间等",
      generalizedExpression: "泛化表达：避免\"AI神器\"、\"效率工具\"等模糊概念",
      deviateFromTheme: "偏离主旨：标题内容必须与正文核心信息高度一致",
      templateApplication: "模板套用：禁止使用\"盘点X个\"、\"X大技巧\"等模板化结构"
    };

    this.enTranslations.aiPrompts.systemPrompts = {
      titleGenerationExpert: "You are an AI assistant skilled at generating 'high-attraction content titles'",
      generateBasedOnContent: "Please generate titles based on the main content provided by users that meet platform requirements, are naturally and completely expressed, structurally diverse, thematically relevant, and have click appeal",
      contentAlignmentConstraints: "Enhanced content theme alignment (fitting) constraints",
      semanticConstraints: "Must execute the following semantic constraints",
      titleMustBeBased: "Titles must be generated based on the main content provided by users (version A/B), and must not deviate from the text theme",
      semanticCoverage: "Title semantics should cover the main content's",
      coreObject: "Core object (e.g., WenPai tools, AI content platform adaptation, etc.)",
      userBenefits: "User benefits (e.g., multi-platform adaptation, time-saving, effort-saving, efficiency improvement)",
      usageScenarios: "Usage scenarios (e.g., Xiaohongshu, WeChat official accounts, Douyin content creation)",
      keyActions: "Key actions (e.g., one-click generation, intelligent adaptation, batch processing)",
      quantifiedEffects: "Quantified effects (e.g., save 80% time, support 10+ platforms)",
      prohibitedContent: "Prohibited content",
      fabricatedData: "Fabricated data: Do not add specific numbers, percentages, times, etc. not mentioned in the main text",
      generalizedExpression: "Generalized expression: Avoid vague concepts like 'AI artifact', 'efficiency tool'",
      deviateFromTheme: "Deviate from theme: Title content must be highly consistent with core information in the main text",
      templateApplication: "Template application: Prohibit using templated structures like 'Top X', 'X Tips'"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // titleGeneration.ts 中的文本
      {
        search: /"目标平台"/g,
        replace: "t('aiPrompts.titleGeneration.targetPlatform')"
      },
      {
        search: /"字数限制"/g,
        replace: "t('aiPrompts.titleGeneration.characterLimit')"
      },
      {
        search: /"字以内"/g,
        replace: "t('aiPrompts.titleGeneration.charactersWithin')"
      },
      {
        search: /"当前长度"/g,
        replace: "t('aiPrompts.titleGeneration.currentLength')"
      },
      {
        search: /"字"/g,
        replace: "t('aiPrompts.titleGeneration.character')"
      },

      // titleGenerationSystemPrompt.ts 中的文本
      {
        search: /"如有超字数标题"/g,
        replace: "t('aiPrompts.titleGeneration.ifExceedsLimit')"
      },
      {
        search: /"请调用"/g,
        replace: "t('aiPrompts.titleGeneration.pleaseCall')"
      },
      {
        search: /"以词语边界截断并闭合语义"/g,
        replace: "t('aiPrompts.titleGeneration.truncateAtWordBoundary')"
      },

      // 系统提示词中的长文本
      {
        search: /你是一个擅长生成"高吸引力内容标题"的AI助手/g,
        replace: "t('aiPrompts.systemPrompts.titleGenerationExpert')"
      },
      {
        search: /请根据用户提供的正文内容生成符合平台要求、表达自然完整、结构多样、主旨贴合、具备点击吸引力的标题/g,
        replace: "t('aiPrompts.systemPrompts.generateBasedOnContent')"
      },
      {
        search: /强化内容主旨对齐（拟合）约束/g,
        replace: "t('aiPrompts.systemPrompts.contentAlignmentConstraints')"
      },
      {
        search: /必须执行以下语义约束/g,
        replace: "t('aiPrompts.systemPrompts.semanticConstraints')"
      },
      {
        search: /标题必须基于用户提供的正文内容（版本A\/B）生成，不允许脱离文本主旨/g,
        replace: "t('aiPrompts.systemPrompts.titleMustBeBased')"
      },
      {
        search: /标题语义应覆盖正文内容的/g,
        replace: "t('aiPrompts.systemPrompts.semanticCoverage')"
      },
      {
        search: /核心对象（如：文派工具、AI内容平台适配等）/g,
        replace: "t('aiPrompts.systemPrompts.coreObject')"
      },
      {
        search: /用户收益（如：多平台适配、省时间、省力、提升效率）/g,
        replace: "t('aiPrompts.systemPrompts.userBenefits')"
      },
      {
        search: /使用场景（如：小红书、公众号、抖音内容创作）/g,
        replace: "t('aiPrompts.systemPrompts.usageScenarios')"
      },
      {
        search: /关键动作（如：一键生成、智能适配、批量处理）/g,
        replace: "t('aiPrompts.systemPrompts.keyActions')"
      },
      {
        search: /量化效果（如：节省80%时间、支持10\+平台）/g,
        replace: "t('aiPrompts.systemPrompts.quantifiedEffects')"
      },
      {
        search: /虚构数据：不得添加正文中未提及的具体数字、百分比、时间等/g,
        replace: "t('aiPrompts.systemPrompts.fabricatedData')"
      },
      {
        search: /泛化表达：避免"AI神器"、"效率工具"等模糊概念/g,
        replace: "t('aiPrompts.systemPrompts.generalizedExpression')"
      },
      {
        search: /偏离主旨：标题内容必须与正文核心信息高度一致/g,
        replace: "t('aiPrompts.systemPrompts.deviateFromTheme')"
      },
      {
        search: /模板套用：禁止使用"盘点X个"、"X大技巧"等模板化结构/g,
        replace: "t('aiPrompts.systemPrompts.templateApplication')"
      }
    ];
  }

  /**
   * 处理文件
   */
  async processFiles() {
    console.log('📝 处理AI提示词文件...');
    
    const files = [TITLE_GENERATION_PATH, TITLE_GENERATION_SYSTEM_PATH];
    
    for (const filePath of files) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在: ${filePath}，跳过处理`);
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');
      let fileProcessedCount = 0;
      
      // 应用所有替换
      for (const replacement of this.replacements) {
        const matches = content.match(replacement.search);
        if (matches) {
          content = content.replace(replacement.search, replacement.replace);
          fileProcessedCount += matches.length;
        }
      }

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.basename(filePath)} 处理完成，替换了 ${fileProcessedCount} 处文本`);
      this.processedCount += fileProcessedCount;
    }
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('📄 更新翻译文件...');
    
    // 更新中文翻译文件
    fs.writeFileSync(
      ZH_LOCALE_PATH,
      JSON.stringify(this.zhTranslations, null, 2),
      'utf8'
    );
    
    // 更新英文翻译文件
    fs.writeFileSync(
      EN_LOCALE_PATH,
      JSON.stringify(this.enTranslations, null, 2),
      'utf8'
    );
    
    console.log('✅ 翻译文件更新完成');
  }
}

// 运行脚本
const processor = new AIPromptsTitleGenerationI18n();
processor.run().catch(console.error);
