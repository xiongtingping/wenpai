#!/usr/bin/env node

/**
 * 完整国际化覆盖脚本
 * 目标：达到100%国际化覆盖率
 */

import fs from 'fs';
import path from 'path';

const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';
const SCAN_REPORT_PATH = 'i18n-scan-report.json';

class CompleteI18nCoverage {
  constructor() {
    this.zhTranslations = {};
    this.enTranslations = {};
    this.scanReport = null;
    this.processedCount = 0;
    this.totalFiles = 0;
    this.skippedFiles = 0;
  }

  /**
   * 运行完整国际化覆盖
   */
  async run() {
    console.log('🎯 开始完整国际化覆盖处理...\n');

    try {
      // 1. 加载扫描报告
      await this.loadScanReport();
      
      // 2. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 3. 批量处理所有文件
      await this.processAllFiles();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      // 5. 生成完成报告
      await this.generateCompletionReport();
      
      console.log(`\n🎉 完整国际化覆盖处理完成！`);
      console.log(`📊 处理了 ${this.totalFiles} 个文件，跳过 ${this.skippedFiles} 个文件`);
      console.log(`🔄 总共替换了 ${this.processedCount} 处文本`);
      
    } catch (error) {
      console.error('❌ 完整国际化覆盖处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载扫描报告
   */
  async loadScanReport() {
    console.log('📊 加载国际化扫描报告...');
    
    if (!fs.existsSync(SCAN_REPORT_PATH)) {
      throw new Error('扫描报告文件不存在，请先运行 i18n-scanner.js');
    }
    
    const reportContent = fs.readFileSync(SCAN_REPORT_PATH, 'utf8');
    this.scanReport = JSON.parse(reportContent);
    
    console.log(`📋 发现 ${this.scanReport.summary.totalFiles} 个文件，${this.scanReport.summary.hardcodedTexts} 处硬编码文本`);
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

    // 确保基础结构存在
    this.ensureBaseStructure();
  }

  /**
   * 确保基础翻译结构存在
   */
  ensureBaseStructure() {
    const baseStructure = {
      common: {
        errors: {},
        messages: {},
        status: {},
        actions: {},
        labels: {}
      },
      api: {
        errors: {},
        messages: {},
        status: {}
      },
      utils: {
        errors: {},
        messages: {},
        status: {}
      },
      components: {
        errors: {},
        messages: {},
        status: {}
      },
      pages: {
        errors: {},
        messages: {},
        status: {}
      }
    };

    // 确保中文翻译结构
    for (const [key, value] of Object.entries(baseStructure)) {
      if (!this.zhTranslations[key]) {
        this.zhTranslations[key] = JSON.parse(JSON.stringify(value));
      }
      if (!this.enTranslations[key]) {
        this.enTranslations[key] = JSON.parse(JSON.stringify(value));
      }
    }
  }

  /**
   * 处理所有文件
   */
  async processAllFiles() {
    console.log('🔄 开始处理所有文件...\n');
    
    // 按文件分组处理
    const fileGroups = this.groupFilesByType();
    
    for (const [groupName, files] of Object.entries(fileGroups)) {
      console.log(`📂 处理 ${groupName} 组 (${files.length} 个文件)...`);
      
      for (const filePath of files) {
        await this.processFile(filePath);
      }
    }
  }

  /**
   * 按文件类型分组
   */
  groupFilesByType() {
    const groups = {
      'API服务': [],
      '工具类': [],
      '组件': [],
      '页面': [],
      '服务': [],
      '其他': []
    };

    // 从扫描报告中获取所有文件
    const allFiles = Object.keys(this.scanReport.summary.byFile);
    
    for (const filePath of allFiles) {
      const cleanPath = filePath.replace(/^\//, '');
      
      if (cleanPath.startsWith('src/api/')) {
        groups['API服务'].push(cleanPath);
      } else if (cleanPath.startsWith('src/utils/')) {
        groups['工具类'].push(cleanPath);
      } else if (cleanPath.startsWith('src/components/')) {
        groups['组件'].push(cleanPath);
      } else if (cleanPath.startsWith('src/pages/')) {
        groups['页面'].push(cleanPath);
      } else if (cleanPath.startsWith('src/services/')) {
        groups['服务'].push(cleanPath);
      } else {
        groups['其他'].push(cleanPath);
      }
    }

    return groups;
  }

  /**
   * 处理单个文件
   */
  async processFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 文件不存在，跳过: ${filePath}`);
      this.skippedFiles++;
      return;
    }

    // 检查文件大小，跳过过大的文件
    const stats = fs.statSync(filePath);
    if (stats.size > 1024 * 1024) { // 1MB
      console.log(`⚠️ 文件过大，跳过: ${filePath}`);
      this.skippedFiles++;
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let fileProcessedCount = 0;

    // 获取该文件的硬编码文本
    const fileTexts = this.getFileTexts(filePath);
    
    if (fileTexts.length === 0) {
      this.skippedFiles++;
      return;
    }

    // 处理文件中的硬编码文本
    fileProcessedCount = this.processFileTexts(content, filePath, fileTexts);

    if (fileProcessedCount > 0) {
      this.processedCount += fileProcessedCount;
      this.totalFiles++;
      console.log(`✅ ${filePath} 处理完成，替换了 ${fileProcessedCount} 处文本`);
    } else {
      this.skippedFiles++;
    }
  }

  /**
   * 获取文件中的硬编码文本
   */
  getFileTexts(filePath) {
    const normalizedPath = '/' + filePath;
    return this.scanReport.details.filter(item => item.file === normalizedPath);
  }

  /**
   * 处理文件中的文本
   */
  processFileTexts(content, filePath, texts) {
    let processedCount = 0;
    let hasChanges = false;

    // 按优先级和类型处理文本
    const highPriorityTexts = texts.filter(t => t.priority === 'high');
    const mediumPriorityTexts = texts.filter(t => t.priority === 'medium');
    
    // 先处理高优先级文本
    for (const textItem of highPriorityTexts) {
      const result = this.processTextItem(content, filePath, textItem);
      content = result.content;
      processedCount += result.count;
      if (result.count > 0) hasChanges = true;
    }

    // 再处理中优先级文本
    for (const textItem of mediumPriorityTexts) {
      const result = this.processTextItem(content, filePath, textItem);
      content = result.content;
      processedCount += result.count;
      if (result.count > 0) hasChanges = true;
    }

    // 如果有变更，添加i18n导入并保存文件
    if (hasChanges) {
      content = this.addI18nImport(content, filePath);
      fs.writeFileSync(filePath, content);
    }

    return processedCount;
  }

  /**
   * 处理单个文本项
   */
  processTextItem(content, filePath, textItem) {
    const zhText = textItem.text;
    const textType = textItem.type;
    
    // 生成翻译键和英文翻译
    const { key, enText } = this.generateTranslation(zhText, textType, filePath);
    
    // 添加到翻译文件
    this.addTranslation(key, zhText, enText);
    
    // 替换文本
    const regex = new RegExp(`['"]${zhText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    const beforeCount = (content.match(regex) || []).length;
    
    if (beforeCount > 0) {
      const replacement = this.isReactComponent(filePath) ? `t('${key}')` : `i18n.t('${key}')`;
      content = content.replace(regex, replacement);
    }

    return { content, count: beforeCount };
  }

  /**
   * 生成翻译键和英文翻译
   */
  generateTranslation(zhText, textType, filePath) {
    // 根据文件路径和文本类型生成键
    let category = 'common';
    if (filePath.includes('api/')) category = 'api';
    else if (filePath.includes('utils/')) category = 'utils';
    else if (filePath.includes('components/')) category = 'components';
    else if (filePath.includes('pages/')) category = 'pages';

    let subCategory = 'messages';
    if (textType === 'error') subCategory = 'errors';
    else if (textType === 'title' || textType === 'label') subCategory = 'labels';
    else if (textType === 'button') subCategory = 'actions';

    // 生成简化的键名
    const keyName = this.generateKeyName(zhText);
    const key = `${category}.${subCategory}.${keyName}`;

    // 生成英文翻译
    const enText = this.generateEnglishTranslation(zhText, textType);

    return { key, enText };
  }

  /**
   * 生成键名
   */
  generateKeyName(zhText) {
    // 简化中文文本为键名
    let keyName = zhText
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '') // 移除特殊字符
      .substring(0, 20); // 限制长度

    if (!keyName) {
      keyName = 'text' + Math.random().toString(36).substr(2, 5);
    }

    return keyName;
  }

  /**
   * 生成英文翻译
   */
  generateEnglishTranslation(zhText, textType) {
    // 常用翻译映射
    const commonTranslations = {
      '错误': 'Error',
      '失败': 'Failed',
      '成功': 'Success',
      '警告': 'Warning',
      '确认': 'Confirm',
      '取消': 'Cancel',
      '保存': 'Save',
      '删除': 'Delete',
      '编辑': 'Edit',
      '添加': 'Add',
      '创建': 'Create',
      '更新': 'Update',
      '加载中': 'Loading',
      '处理中': 'Processing',
      '已完成': 'Completed',
      '未知错误': 'Unknown error',
      '网络错误': 'Network error',
      '请稍后重试': 'Please try again later',
      '操作成功': 'Operation successful',
      '操作失败': 'Operation failed'
    };

    // 如果有直接映射，使用它
    if (commonTranslations[zhText]) {
      return commonTranslations[zhText];
    }

    // 否则生成通用翻译
    return `${zhText} (EN)`;
  }

  /**
   * 判断是否为React组件
   */
  isReactComponent(filePath) {
    return filePath.includes('components/') || filePath.includes('pages/') || filePath.endsWith('.tsx');
  }

  /**
   * 添加i18n导入
   */
  addI18nImport(content, filePath) {
    if (this.isReactComponent(filePath)) {
      // React组件使用useTranslation
      if (!content.includes('useTranslation')) {
        content = content.replace(
          /import.*from ['"]react['"];?/,
          `$&\nimport { useTranslation } from 'react-i18next';`
        );
        
        // 添加useTranslation hook
        content = content.replace(
          /(function|const)\s+\w+.*?\{/,
          `$&\n  const { t } = useTranslation();`
        );
      }
    } else {
      // 非React文件使用i18n实例
      if (!content.includes('import i18n')) {
        content = content.replace(
          /^import/m,
          `import i18n from '@/i18n';\nimport`
        );
      }
    }
    
    return content;
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
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('\n💾 更新翻译文件...');
    
    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');
    
    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }

  /**
   * 生成完成报告
   */
  async generateCompletionReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFilesInScan: this.scanReport.summary.totalFiles,
        totalHardcodedTexts: this.scanReport.summary.hardcodedTexts,
        processedFiles: this.totalFiles,
        skippedFiles: this.skippedFiles,
        processedTexts: this.processedCount,
        coverageRate: ((this.processedCount / this.scanReport.summary.hardcodedTexts) * 100).toFixed(2) + '%'
      },
      details: {
        translationKeys: Object.keys(this.zhTranslations).length,
        categories: Object.keys(this.zhTranslations),
        completionStatus: this.processedCount >= this.scanReport.summary.hardcodedTexts * 0.95 ? '接近完成' : '进行中'
      }
    };

    fs.writeFileSync('I18N_COMPLETE_COVERAGE_REPORT.md', this.generateMarkdownReport(report));
    console.log('📋 完成报告已生成: I18N_COMPLETE_COVERAGE_REPORT.md');
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(report) {
    return `# 文派前端国际化完整覆盖报告

## 📊 处理概览

- **扫描文件总数**: ${report.summary.totalFilesInScan}
- **硬编码文本总数**: ${report.summary.totalHardcodedTexts}
- **已处理文件**: ${report.summary.processedFiles}
- **跳过文件**: ${report.summary.skippedFiles}
- **已处理文本**: ${report.summary.processedTexts}
- **覆盖率**: ${report.summary.coverageRate}

## 🎯 完成状态

**状态**: ${report.details.completionStatus}

## 📈 翻译统计

- **翻译键总数**: ${report.details.translationKeys}
- **翻译分类**: ${report.details.categories.join(', ')}

## 🕐 生成时间

${report.timestamp}

---

**🎉 文派前端国际化项目向100%覆盖率迈进！**
`;
  }
}

// 运行完整国际化覆盖
if (import.meta.url === `file://${process.argv[1]}`) {
  const processor = new CompleteI18nCoverage();
  processor.run().catch(console.error);
}

export default CompleteI18nCoverage;
