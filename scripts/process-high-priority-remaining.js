#!/usr/bin/env node

/**
 * 处理剩余高优先级文件的国际化脚本
 * 专注于处理5,368处高优先级文本
 */

import fs from 'fs';
import path from 'path';

class ProcessHighPriorityRemaining {
  constructor() {
    this.processedCount = 0;
    this.fileCount = 0;
    this.translations = {
      'zh-CN': {},
      'en-US': {}
    };
    this.scanReport = null;
  }

  /**
   * 运行高优先级处理
   */
  async run() {
    console.log('🔥 开始处理剩余高优先级文件...\n');

    try {
      // 加载扫描报告
      this.loadScanReport();
      
      // 加载现有翻译
      this.loadExistingTranslations();
      
      // 处理高优先级文件
      await this.processHighPriorityFiles();
      
      // 保存翻译文件
      this.saveTranslations();
      
      console.log(`\n🎉 高优先级处理完成！`);
      console.log(`📊 处理了 ${this.fileCount} 个文件，替换了 ${this.processedCount} 处文本`);
      
    } catch (error) {
      console.error('❌ 高优先级处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载扫描报告
   */
  loadScanReport() {
    const reportPath = 'i18n-scan-report.json';
    if (fs.existsSync(reportPath)) {
      this.scanReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      console.log(`📊 加载扫描报告: ${this.scanReport.summary.hardcodedTexts} 处文本待处理`);
      console.log(`🔥 高优先级文本: ${this.scanReport.summary.byPriority.high} 处`);
    } else {
      throw new Error('扫描报告不存在，请先运行 i18n-scanner.js');
    }
  }

  /**
   * 加载现有翻译
   */
  loadExistingTranslations() {
    const zhPath = 'src/i18n/locales/zh-CN.json';
    const enPath = 'src/i18n/locales/en-US.json';
    
    if (fs.existsSync(zhPath)) {
      this.translations['zh-CN'] = JSON.parse(fs.readFileSync(zhPath, 'utf8'));
    }
    
    if (fs.existsSync(enPath)) {
      this.translations['en-US'] = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    }
    
    console.log(`📚 加载现有翻译: ${Object.keys(this.translations['zh-CN']).length} 个分类`);
  }

  /**
   * 处理高优先级文件
   */
  async processHighPriorityFiles() {
    console.log('\n🔥 处理高优先级文件...');
    
    // 获取高优先级文件列表
    const highPriorityFiles = [
      'src/ai/prompts/brand.ts',
      'src/ai/prompts/titleGeneration.ts',
      'src/ai/prompts/titleGenerationSystemPrompt.ts',
      'src/ai/providers/deepseek.ts',
      'src/ai/providers/openai.ts',
      'src/components/auth/EnhancedAuthModal.tsx',
      'src/components/auth/UnifiedPermissionGuard.tsx',
      'src/components/creative/CreativeCube.tsx',
      'src/components/creative/MarketingCalendar.tsx',
      'src/components/creative/MomentsTextGenerator.tsx',
      'src/components/creative/PDFChatDialog.tsx',
      'src/components/landing/PricingSection.tsx',
      'src/components/TitleGeneratorIntelligent.tsx',
      'src/config/contentSchemes.ts',
      'src/pages/AboutPage.tsx',
      'src/pages/BrandLibraryPage.tsx',
      'src/pages/CreativeStudioPage.tsx',
      'src/pages/CustomLoginPage.tsx',
      'src/pages/ForgotPasswordPage.tsx',
      'src/pages/HotTopicsPage.tsx',
      'src/pages/ProfilePage.tsx',
      'src/pages/ShareManagerPage.tsx',
      'src/prompts/PromptSystem.ts',
      'src/services/intelligentCategoryService.ts',
      'src/services/unifiedEmojiSystem.ts',
      'src/utils/hashtagGenerator.ts'
    ];
    
    console.log(`📁 将处理 ${highPriorityFiles.length} 个高优先级文件`);
    
    for (const filePath of highPriorityFiles) {
      await this.processFile(filePath);
    }
  }

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ 文件不存在: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    let fileProcessedCount = 0;

    // 查找文件中的中文文本（高优先级模式）
    const highPriorityPatterns = [
      // 错误消息
      /['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*错误[^'"`]*|[^'"`]*失败[^'"`]*|[^'"`]*异常[^'"`]*)['"`]/g,
      // 用户界面文本
      /['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*按钮[^'"`]*|[^'"`]*标题[^'"`]*|[^'"`]*标签[^'"`]*)['"`]/g,
      // 提示消息
      /['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*提示[^'"`]*|[^'"`]*警告[^'"`]*|[^'"`]*通知[^'"`]*)['"`]/g,
      // 操作相关
      /['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*确定[^'"`]*|[^'"`]*取消[^'"`]*|[^'"`]*保存[^'"`]*|[^'"`]*删除[^'"`]*)['"`]/g,
      // 状态相关
      /['"`]([^'"`]*[\u4e00-\u9fa5][^'"`]*成功[^'"`]*|[^'"`]*完成[^'"`]*|[^'"`]*进行中[^'"`]*)['"`]/g
    ];
    
    const processedTexts = new Set();
    
    for (const pattern of highPriorityPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1];
        
        // 跳过已处理的文本
        if (processedTexts.has(text) || !this.shouldProcessText(text)) {
          continue;
        }
        
        processedTexts.add(text);
        
        // 生成翻译键
        const translationKey = this.generateTranslationKey(filePath, text, this.getTextType(text));
        
        // 生成英文翻译
        const englishText = this.generateEnglishTranslation(text, this.getTextType(text));
        
        // 添加到翻译文件
        this.addTranslation(translationKey, text, englishText);
        
        // 替换文件中的文本
        const newContent = this.replaceTextInFile(content, text, translationKey, filePath);
        if (newContent !== content) {
          content = newContent;
          fileProcessedCount++;
        }
      }
    }

    // 保存文件
    if (content !== originalContent) {
      // 确保导入语句存在
      content = this.ensureImports(content, filePath);
      
      fs.writeFileSync(fullPath, content);
      this.fileCount++;
      this.processedCount += fileProcessedCount;
      console.log(`✅ ${filePath} 处理了 ${fileProcessedCount} 处高优先级文本`);
    }
  }

  /**
   * 判断文本类型
   */
  getTextType(text) {
    if (text.includes('错误') || text.includes('失败') || text.includes('异常')) return 'error';
    if (text.includes('按钮')) return 'button';
    if (text.includes('标题')) return 'title';
    if (text.includes('标签')) return 'label';
    if (text.includes('提示') || text.includes('警告') || text.includes('通知')) return 'message';
    if (text.includes('成功') || text.includes('完成')) return 'status';
    return 'text';
  }

  /**
   * 判断是否应该处理文本
   */
  shouldProcessText(text) {
    // 跳过太短的文本
    if (text.length < 2) return false;
    
    // 必须包含中文字符
    if (!/[\u4e00-\u9fa5]/.test(text)) return false;
    
    // 跳过纯数字或符号
    if (/^[\d\s\-_.,;:!?()[\]{}'"]+$/.test(text)) return false;
    
    // 跳过URL或路径
    if (/^(https?:\/\/|\/|\.\/|\.\.\/)/.test(text)) return false;
    
    return true;
  }

  /**
   * 生成翻译键
   */
  generateTranslationKey(filePath, text, type) {
    const pathParts = filePath.split('/').filter(p => p !== 'src');
    const category = this.getCategoryFromPath(pathParts);
    const subCategory = type || 'text';
    
    // 生成简短的键名
    const shortText = text.length > 8 ? text.substring(0, 8) : text;
    const cleanText = shortText.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    
    return `${category}.${subCategory}.${cleanText}_${randomSuffix}`;
  }

  /**
   * 从路径获取分类
   */
  getCategoryFromPath(pathParts) {
    if (pathParts.includes('pages')) return 'pages';
    if (pathParts.includes('components')) return 'components';
    if (pathParts.includes('services')) return 'services';
    if (pathParts.includes('utils')) return 'utils';
    if (pathParts.includes('ai')) return 'ai';
    if (pathParts.includes('prompts')) return 'prompts';
    if (pathParts.includes('config')) return 'config';
    return 'common';
  }

  /**
   * 生成英文翻译
   */
  generateEnglishTranslation(text, type) {
    // 常用词汇映射
    const commonTranslations = {
      '确定': 'Confirm', '取消': 'Cancel', '保存': 'Save', '删除': 'Delete',
      '编辑': 'Edit', '添加': 'Add', '搜索': 'Search', '加载中': 'Loading',
      '请稍候': 'Please wait', '成功': 'Success', '失败': 'Failed',
      '错误': 'Error', '警告': 'Warning', '提示': 'Tips', '设置': 'Settings',
      '用户': 'User', '密码': 'Password', '登录': 'Login', '注册': 'Register',
      '退出': 'Logout', '返回': 'Back', '下一步': 'Next', '上一步': 'Previous',
      '完成': 'Complete', '开始': 'Start', '结束': 'End', '暂停': 'Pause',
      '继续': 'Continue', '重试': 'Retry', '刷新': 'Refresh', '更新': 'Update'
    };

    // 检查是否有直接映射
    if (commonTranslations[text]) {
      return commonTranslations[text];
    }

    // 根据类型生成翻译
    switch (type) {
      case 'error':
        return text.replace('错误', 'Error').replace('失败', 'Failed').replace('异常', 'Exception');
      case 'button':
        return text.replace('按钮', 'Button');
      case 'title':
        return text.replace('标题', 'Title');
      case 'label':
        return text.replace('标签', 'Label');
      case 'message':
        return text.replace('提示', 'Tips').replace('警告', 'Warning').replace('通知', 'Notification');
      case 'status':
        return text.replace('成功', 'Success').replace('完成', 'Complete');
      default:
        return text; // 保持原文
    }
  }

  /**
   * 添加翻译
   */
  addTranslation(key, zhText, enText) {
    const keyParts = key.split('.');
    
    // 添加中文翻译
    let zhObj = this.translations['zh-CN'];
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!zhObj[keyParts[i]]) {
        zhObj[keyParts[i]] = {};
      }
      zhObj = zhObj[keyParts[i]];
    }
    zhObj[keyParts[keyParts.length - 1]] = zhText;
    
    // 添加英文翻译
    let enObj = this.translations['en-US'];
    for (let i = 0; i < keyParts.length - 1; i++) {
      if (!enObj[keyParts[i]]) {
        enObj[keyParts[i]] = {};
      }
      enObj = enObj[keyParts[i]];
    }
    enObj[keyParts[keyParts.length - 1]] = enText;
  }

  /**
   * 在文件中替换文本
   */
  replaceTextInFile(content, text, key, filePath) {
    const isReactFile = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    const isTypeScriptFile = filePath.endsWith('.ts') && !filePath.endsWith('.tsx');
    
    // 转义特殊字符
    const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    if (isReactFile) {
      // React组件中使用 t() 函数
      const stringRegex = new RegExp(`(['"\`])${escapedText}\\1`, 'g');
      return content.replace(stringRegex, `{t('${key}')}`);
    } else if (isTypeScriptFile) {
      // TypeScript文件中使用 i18n.t() 函数
      const stringRegex = new RegExp(`(['"\`])${escapedText}\\1`, 'g');
      return content.replace(stringRegex, `i18n.t('${key}')`);
    }
    
    return content;
  }

  /**
   * 确保导入语句存在
   */
  ensureImports(content, filePath) {
    const isReactFile = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');
    const isTypeScriptFile = filePath.endsWith('.ts') && !filePath.endsWith('.tsx');
    
    if (isReactFile && content.includes("t('") && !content.includes('useTranslation')) {
      // 添加 useTranslation 导入
      if (!content.includes('import { useTranslation }')) {
        content = `import { useTranslation } from 'react-i18next';\n${content}`;
      }
      
      // 在组件中添加 hook
      if (!content.includes('const { t } = useTranslation()')) {
        content = content.replace(
          /(export (?:default )?(?:function|const) \w+[^{]*\{)/,
          `$1\n  const { t } = useTranslation();`
        );
      }
    } else if (isTypeScriptFile && content.includes("i18n.t('") && !content.includes('import i18n')) {
      // 添加 i18n 导入
      content = `import i18n from '@/i18n';\n${content}`;
    }
    
    return content;
  }

  /**
   * 保存翻译文件
   */
  saveTranslations() {
    const zhPath = 'src/i18n/locales/zh-CN.json';
    const enPath = 'src/i18n/locales/en-US.json';
    
    fs.writeFileSync(zhPath, JSON.stringify(this.translations['zh-CN'], null, 2));
    fs.writeFileSync(enPath, JSON.stringify(this.translations['en-US'], null, 2));
    
    console.log(`💾 翻译文件已保存`);
  }
}

// 运行高优先级处理
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new ProcessHighPriorityRemaining();
  processor.run().catch(console.error);
}

export default ProcessHighPriorityRemaining;
