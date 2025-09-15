#!/usr/bin/env node

/**
 * AI提供者文件国际化脚本
 * 处理 AI providers 中的中文文本国际化
 */

import fs from 'fs';
import path from 'path';

const AI_PROVIDERS_PATHS = [
  'src/ai/providers/deepseek.ts',
  'src/ai/providers/openai.ts'
];
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class AIProvidersI18n {
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
    console.log('🤖 开始AI提供者文件国际化...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理AI提供者文件
      await this.processAIProviderFiles();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ AI提供者文件国际化完成！`);
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

    // 初始化 aiProviders 翻译对象
    if (!this.zhTranslations.aiProviders) {
      this.zhTranslations.aiProviders = {};
    }
    if (!this.enTranslations.aiProviders) {
      this.enTranslations.aiProviders = {};
    }

    // DeepSeek相关
    this.addTranslation('aiProviders.deepseek.keyNotConfigured', 'DeepSeek API密钥未配置', 'DeepSeek API key not configured');
    this.addTranslation('aiProviders.deepseek.contentGenerationFailed', '内容生成失败', 'Content generation failed');
    this.addTranslation('aiProviders.deepseek.callFailed', '调用失败', 'Call failed');
    this.addTranslation('aiProviders.deepseek.imageNotSupported', '暂不支持图像生成功能', 'Image generation not supported yet');
    this.addTranslation('aiProviders.deepseek.useOtherProviders', '请使用', 'Please use');
    this.addTranslation('aiProviders.deepseek.otherProviders', '等其他提供者', 'other providers');

    // OpenAI相关
    this.addTranslation('aiProviders.openai.keyNotConfigured', 'OpenAI API密钥未配置', 'OpenAI API key not configured');
    this.addTranslation('aiProviders.openai.contentGenerationFailed', '内容生成失败', 'Content generation failed');
    this.addTranslation('aiProviders.openai.callFailed', '调用失败', 'Call failed');
    this.addTranslation('aiProviders.openai.imageGenerationFailed', '图像生成失败', 'Image generation failed');

    // 通用错误消息
    this.addTranslation('aiProviders.errors.networkError', '网络错误', 'Network error');
    this.addTranslation('aiProviders.errors.timeout', '请求超时', 'Request timeout');
    this.addTranslation('aiProviders.errors.invalidResponse', '响应格式错误', 'Invalid response format');
    this.addTranslation('aiProviders.errors.rateLimitExceeded', '请求频率超限', 'Rate limit exceeded');
    this.addTranslation('aiProviders.errors.insufficientQuota', '配额不足', 'Insufficient quota');

    // 日志消息
    this.addTranslation('aiProviders.logs.generationStart', '内容生成开始', 'Content generation started');
    this.addTranslation('aiProviders.logs.generationComplete', '内容生成完成', 'Content generation completed');
    this.addTranslation('aiProviders.logs.imageGenerationStart', '图像生成开始', 'Image generation started');
    this.addTranslation('aiProviders.logs.imageGenerationComplete', '图像生成完成', 'Image generation completed');

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
      // DeepSeek错误消息
      {
        search: /'DeepSeek API密钥未配置'/g,
        replace: "t('aiProviders.deepseek.keyNotConfigured')"
      },
      {
        search: /'内容生成失败'/g,
        replace: "t('aiProviders.deepseek.contentGenerationFailed')"
      },
      {
        search: /'调用失败'/g,
        replace: "t('aiProviders.deepseek.callFailed')"
      },
      {
        search: /'暂不支持图像生成功能'/g,
        replace: "t('aiProviders.deepseek.imageNotSupported')"
      },
      {
        search: /'请使用'/g,
        replace: "t('aiProviders.deepseek.useOtherProviders')"
      },
      {
        search: /'等其他提供者'/g,
        replace: "t('aiProviders.deepseek.otherProviders')"
      },

      // OpenAI错误消息
      {
        search: /'OpenAI API密钥未配置'/g,
        replace: "t('aiProviders.openai.keyNotConfigured')"
      },
      {
        search: /'图像生成失败'/g,
        replace: "t('aiProviders.openai.imageGenerationFailed')"
      },

      // 日志消息
      {
        search: /'内容生成开始'/g,
        replace: "t('aiProviders.logs.generationStart')"
      },
      {
        search: /'内容生成完成'/g,
        replace: "t('aiProviders.logs.generationComplete')"
      },
      {
        search: /'图像生成开始'/g,
        replace: "t('aiProviders.logs.imageGenerationStart')"
      },
      {
        search: /'图像生成完成'/g,
        replace: "t('aiProviders.logs.imageGenerationComplete')"
      },

      // 通用错误
      {
        search: /'网络错误'/g,
        replace: "t('aiProviders.errors.networkError')"
      },
      {
        search: /'请求超时'/g,
        replace: "t('aiProviders.errors.timeout')"
      },
      {
        search: /'响应格式错误'/g,
        replace: "t('aiProviders.errors.invalidResponse')"
      },
      {
        search: /'请求频率超限'/g,
        replace: "t('aiProviders.errors.rateLimitExceeded')"
      },
      {
        search: /'配额不足'/g,
        replace: "t('aiProviders.errors.insufficientQuota')"
      }
    ];
  }

  /**
   * 处理AI提供者文件
   */
  async processAIProviderFiles() {
    console.log('🔄 处理AI提供者文件...');
    
    for (const filePath of AI_PROVIDERS_PATHS) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
        continue;
      }

      console.log(`📝 处理文件: ${filePath}`);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 添加i18n导入（如果是TypeScript文件且没有React组件）
      if (filePath.endsWith('.ts') && !content.includes('useTranslation')) {
        // 对于非React组件的TypeScript文件，我们需要使用i18next实例
        if (!content.includes('import i18n')) {
          content = content.replace(
            /import/,
            `import i18n from '@/i18n';\nimport`
          );
          this.processedCount++;
        }
      }

      // 应用替换规则，但使用i18n.t而不是t
      for (const replacement of this.replacements) {
        const beforeCount = (content.match(replacement.search) || []).length;
        const modifiedReplace = replacement.replace.replace(/t\(/g, 'i18n.t(');
        content = content.replace(replacement.search, modifiedReplace);
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
  const processor = new AIProvidersI18n();
  processor.run().catch(console.error);
}

export default AIProvidersI18n;
