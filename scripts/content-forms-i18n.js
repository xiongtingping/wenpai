#!/usr/bin/env node

/**
 * ContentForms 国际化自动替换脚本
 * 处理内容形式配置的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const CONFIG_PATH = 'src/config/contentForms.ts';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class ContentFormsI18n {
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
    console.log('📋 开始 ContentForms 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理配置文件
      await this.processConfigFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ ContentForms 国际化完成！`);
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

    // 确保contentForms部分存在
    if (!this.zhTranslations.contentForms) {
      this.zhTranslations.contentForms = {};
    }
    if (!this.enTranslations.contentForms) {
      this.enTranslations.contentForms = {};
    }

    // 注释
    this.zhTranslations.contentForms.comments = {
      imageTextForms: "图文类内容形式",
      videoForms: "视频类内容形式", 
      interviewForms: "访谈/对话类内容形式",
      insightForms: "洞察类内容形式"
    };

    this.enTranslations.contentForms.comments = {
      imageTextForms: "Image-text content forms",
      videoForms: "Video content forms",
      interviewForms: "Interview/dialogue content forms", 
      insightForms: "Insight content forms"
    };

    // 内容形式名称
    this.zhTranslations.contentForms.names = {
      imageTextPlanting: "图文种草",
      imageTextInfo: "图文信息",
      comedyReversal: "段子/反转视频",
      unboxingReview: "开箱/测评",
      tutorialExplanation: "教程/讲解",
      knowledgeSharing: "知识分享",
      lifeVlog: "生活Vlog",
      roleplayDialogue: "角色扮演对话",
      virtualInterview: "虚拟采访",
      streetInterview: "街头采访",
      trendOpinion: "趋势观点表达",
      emotionalResonance: "情感共鸣",
      marketingCopy: "营销文案"
    };

    this.enTranslations.contentForms.names = {
      imageTextPlanting: "Image-text Planting",
      imageTextInfo: "Image-text Information",
      comedyReversal: "Comedy/Reversal Video",
      unboxingReview: "Unboxing/Review",
      tutorialExplanation: "Tutorial/Explanation",
      knowledgeSharing: "Knowledge Sharing",
      lifeVlog: "Life Vlog",
      roleplayDialogue: "Roleplay Dialogue",
      virtualInterview: "Virtual Interview",
      streetInterview: "Street Interview",
      trendOpinion: "Trend Opinion Expression",
      emotionalResonance: "Emotional Resonance",
      marketingCopy: "Marketing Copy"
    };

    // 分类名称
    this.zhTranslations.contentForms.categories = {
      imageText: "图文类",
      video: "视频类",
      interview: "访谈/对话类",
      insight: "洞察类"
    };

    this.enTranslations.contentForms.categories = {
      imageText: "Image-text",
      video: "Video",
      interview: "Interview/Dialogue",
      insight: "Insight"
    };

    // 输出类型
    this.zhTranslations.contentForms.outputTypes = {
      pureText: "纯文案，用户自配图",
      shortVideoScript: "短视频脚本",
      interviewScript: "访谈脚本",
      dialogueScript: "对话/访谈脚本",
      opinionArticle: "观点文章",
      emotionalContent: "情感内容",
      marketingContent: "营销内容",
      opinionEmotionalMarketing: "观点/情感/营销内容"
    };

    this.enTranslations.contentForms.outputTypes = {
      pureText: "Pure text, user provides images",
      shortVideoScript: "Short video script",
      interviewScript: "Interview script",
      dialogueScript: "Dialogue/interview script",
      opinionArticle: "Opinion article",
      emotionalContent: "Emotional content",
      marketingContent: "Marketing content",
      opinionEmotionalMarketing: "Opinion/emotional/marketing content"
    };

    // 描述
    this.zhTranslations.contentForms.descriptions = {
      imageTextPlanting: "第一人称视角，讲述真实使用体验，语言自然亲切，融合 emoji 表达与评论互动引导",
      imageTextInfo: "以信息传递为主，结构清晰，重点突出，适合知识科普和要点总结",
      comedyReversal: "突出笑点和意外反转，构建极简但高爆点内容结构",
      unboxingReview: "完整记录开箱过程，客观评价产品优缺点，提供购买建议",
      tutorialExplanation: "步骤清晰的教学内容，注重实用性和可操作性",
      knowledgeSharing: "深入浅出地分享专业知识，语言通俗易懂",
      lifeVlog: "记录真实生活片段，展现个人风格和生活态度",
      roleplayDialogue: "设定角色身份，通过对话形式展现不同观点或情境",
      virtualInterview: "主持人提问 + 嘉宾回答格式，模拟播客、直播访谈等场景",
      streetInterview: "模拟街头采访形式，收集不同人群的真实观点",
      trendOpinion: "以专家视角输出新趋势，采用\"观点→论据→总结/延伸\"结构",
      emotionalResonance: "触动用户情感共鸣，引发深度思考和情感连接",
      marketingCopy: "以转化为目标的营销内容，突出产品价值和用户获得感"
    };

    this.enTranslations.contentForms.descriptions = {
      imageTextPlanting: "First-person perspective, telling real usage experience, natural and friendly language, integrating emoji expression and comment interaction guidance",
      imageTextInfo: "Mainly for information delivery, clear structure, prominent focus, suitable for knowledge popularization and key point summary",
      comedyReversal: "Highlighting humor and unexpected reversals, building minimalist but high-impact content structure",
      unboxingReview: "Complete recording of unboxing process, objective evaluation of product pros and cons, providing purchase advice",
      tutorialExplanation: "Clear step-by-step teaching content, focusing on practicality and operability",
      knowledgeSharing: "In-depth and easy-to-understand sharing of professional knowledge, using accessible language",
      lifeVlog: "Recording real life moments, showing personal style and life attitude",
      roleplayDialogue: "Setting character identities, showing different viewpoints or situations through dialogue",
      virtualInterview: "Host questions + guest answers format, simulating podcast, live interview scenarios",
      streetInterview: "Simulating street interview format, collecting real opinions from different groups",
      trendOpinion: "Expert perspective on new trends, using 'opinion → evidence → summary/extension' structure",
      emotionalResonance: "Touching users' emotional resonance, triggering deep thinking and emotional connection",
      marketingCopy: "Conversion-targeted marketing content, highlighting product value and user benefits"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 注释
      {
        search: /\/\*\*\s*\n\s*\* 图文类内容形式\s*\n\s*\*\//g,
        replace: "/**\n * t('contentForms.comments.imageTextForms')\n */"
      },
      {
        search: /\/\*\*\s*\n\s*\* 视频类内容形式\s*\n\s*\*\//g,
        replace: "/**\n * t('contentForms.comments.videoForms')\n */"
      },
      {
        search: /\/\*\*\s*\n\s*\* 访谈\/对话类内容形式\s*\n\s*\*\//g,
        replace: "/**\n * t('contentForms.comments.interviewForms')\n */"
      },

      // 内容形式名称
      {
        search: /name: '图文种草'/g,
        replace: "name: t('contentForms.names.imageTextPlanting')"
      },
      {
        search: /name: '图文信息'/g,
        replace: "name: t('contentForms.names.imageTextInfo')"
      },
      {
        search: /name: '段子\/反转视频'/g,
        replace: "name: t('contentForms.names.comedyReversal')"
      },
      {
        search: /name: '开箱\/测评'/g,
        replace: "name: t('contentForms.names.unboxingReview')"
      },
      {
        search: /name: '教程\/讲解'/g,
        replace: "name: t('contentForms.names.tutorialExplanation')"
      },
      {
        search: /name: '知识分享'/g,
        replace: "name: t('contentForms.names.knowledgeSharing')"
      },
      {
        search: /name: '生活Vlog'/g,
        replace: "name: t('contentForms.names.lifeVlog')"
      },
      {
        search: /name: '角色扮演对话'/g,
        replace: "name: t('contentForms.names.roleplayDialogue')"
      },
      {
        search: /name: '虚拟采访'/g,
        replace: "name: t('contentForms.names.virtualInterview')"
      },
      {
        search: /name: '街头采访'/g,
        replace: "name: t('contentForms.names.streetInterview')"
      },
      {
        search: /name: '趋势观点表达'/g,
        replace: "name: t('contentForms.names.trendOpinion')"
      },
      {
        search: /name: '情感共鸣'/g,
        replace: "name: t('contentForms.names.emotionalResonance')"
      },
      {
        search: /name: '营销文案'/g,
        replace: "name: t('contentForms.names.marketingCopy')"
      },

      // 分类名称
      {
        search: /name: '图文类'/g,
        replace: "name: t('contentForms.categories.imageText')"
      },
      {
        search: /name: '视频类'/g,
        replace: "name: t('contentForms.categories.video')"
      },
      {
        search: /name: '访谈\/对话类'/g,
        replace: "name: t('contentForms.categories.interview')"
      },
      {
        search: /name: '洞察类'/g,
        replace: "name: t('contentForms.categories.insight')"
      },

      // 输出类型
      {
        search: /outputType: '纯文案，用户自配图'/g,
        replace: "outputType: t('contentForms.outputTypes.pureText')"
      },
      {
        search: /outputType: '短视频脚本'/g,
        replace: "outputType: t('contentForms.outputTypes.shortVideoScript')"
      },
      {
        search: /outputType: '访谈脚本'/g,
        replace: "outputType: t('contentForms.outputTypes.interviewScript')"
      },
      {
        search: /outputType: '观点文章'/g,
        replace: "outputType: t('contentForms.outputTypes.opinionArticle')"
      },
      {
        search: /outputType: '情感内容'/g,
        replace: "outputType: t('contentForms.outputTypes.emotionalContent')"
      },
      {
        search: /outputType: '营销内容'/g,
        replace: "outputType: t('contentForms.outputTypes.marketingContent')"
      },

      // 描述文本
      {
        search: /description: '第一人称视角，讲述真实使用体验，语言自然亲切，融合 emoji 表达与评论互动引导'/g,
        replace: "description: t('contentForms.descriptions.imageTextPlanting')"
      },
      {
        search: /description: '以信息传递为主，结构清晰，重点突出，适合知识科普和要点总结'/g,
        replace: "description: t('contentForms.descriptions.imageTextInfo')"
      },
      {
        search: /description: '突出笑点和意外反转，构建极简但高爆点内容结构'/g,
        replace: "description: t('contentForms.descriptions.comedyReversal')"
      },
      {
        search: /description: '完整记录开箱过程，客观评价产品优缺点，提供购买建议'/g,
        replace: "description: t('contentForms.descriptions.unboxingReview')"
      },
      {
        search: /description: '步骤清晰的教学内容，注重实用性和可操作性'/g,
        replace: "description: t('contentForms.descriptions.tutorialExplanation')"
      },
      {
        search: /description: '深入浅出地分享专业知识，语言通俗易懂'/g,
        replace: "description: t('contentForms.descriptions.knowledgeSharing')"
      },
      {
        search: /description: '记录真实生活片段，展现个人风格和生活态度'/g,
        replace: "description: t('contentForms.descriptions.lifeVlog')"
      },
      {
        search: /description: '设定角色身份，通过对话形式展现不同观点或情境'/g,
        replace: "description: t('contentForms.descriptions.roleplayDialogue')"
      },
      {
        search: /description: '主持人提问 \+ 嘉宾回答格式，模拟播客、直播访谈等场景'/g,
        replace: "description: t('contentForms.descriptions.virtualInterview')"
      },
      {
        search: /description: '模拟街头采访形式，收集不同人群的真实观点'/g,
        replace: "description: t('contentForms.descriptions.streetInterview')"
      },
      {
        search: /description: '以专家视角输出新趋势，采用"观点→论据→总结\/延伸"结构'/g,
        replace: "description: t('contentForms.descriptions.trendOpinion')"
      },
      {
        search: /description: '触动用户情感共鸣，引发深度思考和情感连接'/g,
        replace: "description: t('contentForms.descriptions.emotionalResonance')"
      },
      {
        search: /description: '以转化为目标的营销内容，突出产品价值和用户获得感'/g,
        replace: "description: t('contentForms.descriptions.marketingCopy')"
      },

      // 输出描述
      {
        search: /description: '输出：纯文案，用户自配图'/g,
        replace: "description: t('contentForms.outputTypes.pureText')"
      },
      {
        search: /description: '输出：短视频脚本'/g,
        replace: "description: t('contentForms.outputTypes.shortVideoScript')"
      },
      {
        search: /description: '输出：对话\/访谈脚本'/g,
        replace: "description: t('contentForms.outputTypes.dialogueScript')"
      },
      {
        search: /description: '输出：观点\/情感\/营销内容'/g,
        replace: "description: t('contentForms.outputTypes.opinionEmotionalMarketing')"
      },
      {
        search: /outputDescription: '短视频脚本'/g,
        replace: "outputDescription: t('contentForms.outputTypes.shortVideoScript')"
      },
      {
        search: /outputDescription: '对话\/访谈脚本'/g,
        replace: "outputDescription: t('contentForms.outputTypes.dialogueScript')"
      },
      {
        search: /outputDescription: '观点\/情感\/营销内容'/g,
        replace: "outputDescription: t('contentForms.outputTypes.opinionEmotionalMarketing')"
      }
    ];
  }

  /**
   * 处理配置文件
   */
  async processConfigFile() {
    console.log('📝 处理配置文件...');
    
    if (!fs.existsSync(CONFIG_PATH)) {
      throw new Error(`配置文件不存在: ${CONFIG_PATH}`);
    }

    let content = fs.readFileSync(CONFIG_PATH, 'utf8');
    
    // 应用所有替换
    for (const replacement of this.replacements) {
      const matches = content.match(replacement.search);
      if (matches) {
        content = content.replace(replacement.search, replacement.replace);
        this.processedCount += matches.length;
      }
    }

    fs.writeFileSync(CONFIG_PATH, content, 'utf8');
    console.log(`✅ 配置文件处理完成，替换了 ${this.processedCount} 处文本`);
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
const processor = new ContentFormsI18n();
processor.run().catch(console.error);
