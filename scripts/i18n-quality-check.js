#!/usr/bin/env node

/**
 * 国际化质量检查工具
 * 检查翻译文件的完整性、一致性和质量
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  localesDir: 'src/i18n/locales',
  baseLanguage: 'zh-CN',
  targetLanguages: ['en-US'],
  outputFile: 'i18n-quality-report.json'
};

class I18nQualityChecker {
  constructor() {
    this.issues = [];
    this.stats = {
      totalKeys: 0,
      translatedKeys: 0,
      missingKeys: 0,
      inconsistentKeys: 0,
      duplicateKeys: 0
    };
  }

  /**
   * 运行完整的质量检查
   */
  async runQualityCheck() {
    console.log('🔍 开始国际化质量检查...\n');

    try {
      // 1. 加载翻译文件
      const translations = await this.loadTranslations();
      
      // 2. 检查翻译完整性
      this.checkTranslationCompleteness(translations);
      
      // 3. 检查键值一致性
      this.checkKeyConsistency(translations);
      
      // 4. 检查重复键
      this.checkDuplicateKeys(translations);
      
      // 5. 检查翻译质量
      this.checkTranslationQuality(translations);
      
      // 6. 生成报告
      this.generateReport();
      
      console.log('✅ 质量检查完成！');
      
    } catch (error) {
      console.error('❌ 质量检查失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载所有翻译文件
   */
  async loadTranslations() {
    const translations = {};
    
    for (const lang of [CONFIG.baseLanguage, ...CONFIG.targetLanguages]) {
      const filePath = path.join(CONFIG.localesDir, `${lang}.json`);
      
      if (!fs.existsSync(filePath)) {
        this.addIssue('missing_file', `翻译文件不存在: ${filePath}`, 'error');
        continue;
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        translations[lang] = JSON.parse(content);
        console.log(`📁 已加载 ${lang} 翻译文件`);
      } catch (error) {
        this.addIssue('invalid_json', `翻译文件JSON格式错误: ${filePath}`, 'error');
      }
    }
    
    return translations;
  }

  /**
   * 检查翻译完整性
   */
  checkTranslationCompleteness(translations) {
    console.log('🔍 检查翻译完整性...');
    
    const baseKeys = this.getAllKeys(translations[CONFIG.baseLanguage] || {});
    this.stats.totalKeys = baseKeys.length;
    
    for (const lang of CONFIG.targetLanguages) {
      if (!translations[lang]) continue;
      
      const targetKeys = this.getAllKeys(translations[lang]);
      const missingKeys = baseKeys.filter(key => !this.hasKey(translations[lang], key));
      const extraKeys = targetKeys.filter(key => !this.hasKey(translations[CONFIG.baseLanguage], key));
      
      // 记录缺失的键
      missingKeys.forEach(key => {
        this.addIssue('missing_translation', `${lang} 缺少翻译键: ${key}`, 'warning');
        this.stats.missingKeys++;
      });
      
      // 记录多余的键
      extraKeys.forEach(key => {
        this.addIssue('extra_key', `${lang} 存在多余键: ${key}`, 'info');
      });
      
      this.stats.translatedKeys += targetKeys.length - missingKeys.length;
      
      console.log(`  ${lang}: ${targetKeys.length - missingKeys.length}/${baseKeys.length} 已翻译`);
    }
  }

  /**
   * 检查键值一致性
   */
  checkKeyConsistency(translations) {
    console.log('🔍 检查键值一致性...');
    
    const baseKeys = this.getAllKeys(translations[CONFIG.baseLanguage] || {});
    
    for (const key of baseKeys) {
      const baseValue = this.getValueByKey(translations[CONFIG.baseLanguage], key);
      
      for (const lang of CONFIG.targetLanguages) {
        if (!translations[lang]) continue;
        
        const targetValue = this.getValueByKey(translations[lang], key);
        
        if (targetValue && this.isInconsistent(baseValue, targetValue, key)) {
          this.addIssue('inconsistent_translation', 
            `${lang} 键 ${key} 翻译不一致: "${baseValue}" -> "${targetValue}"`, 'warning');
          this.stats.inconsistentKeys++;
        }
      }
    }
  }

  /**
   * 检查重复键
   */
  checkDuplicateKeys(translations) {
    console.log('🔍 检查重复键...');
    
    for (const [lang, data] of Object.entries(translations)) {
      const duplicates = this.findDuplicateKeys(data);
      
      duplicates.forEach(({ key, paths }) => {
        this.addIssue('duplicate_key', 
          `${lang} 存在重复键: ${key} (路径: ${paths.join(', ')})`, 'error');
        this.stats.duplicateKeys++;
      });
    }
  }

  /**
   * 检查翻译质量
   */
  checkTranslationQuality(translations) {
    console.log('🔍 检查翻译质量...');
    
    const baseKeys = this.getAllKeys(translations[CONFIG.baseLanguage] || {});
    
    for (const key of baseKeys) {
      const baseValue = this.getValueByKey(translations[CONFIG.baseLanguage], key);
      
      for (const lang of CONFIG.targetLanguages) {
        if (!translations[lang]) continue;
        
        const targetValue = this.getValueByKey(translations[lang], key);
        
        if (targetValue) {
          // 检查是否为机器翻译痕迹
          if (this.hasMachineTranslationSigns(targetValue)) {
            this.addIssue('machine_translation', 
              `${lang} 键 ${key} 可能是机器翻译: "${targetValue}"`, 'warning');
          }
          
          // 检查是否保留了中文字符
          if (lang === 'en-US' && this.hasChineseCharacters(targetValue)) {
            this.addIssue('chinese_in_english', 
              `${lang} 键 ${key} 包含中文字符: "${targetValue}"`, 'error');
          }
          
          // 检查参数占位符是否一致
          if (!this.hasConsistentPlaceholders(baseValue, targetValue)) {
            this.addIssue('inconsistent_placeholders', 
              `${lang} 键 ${key} 参数占位符不一致: "${baseValue}" -> "${targetValue}"`, 'error');
          }
        }
      }
    }
  }

  /**
   * 获取对象的所有键（扁平化）
   */
  getAllKeys(obj, prefix = '') {
    const keys = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        keys.push(...this.getAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  }

  /**
   * 检查对象是否包含指定键
   */
  hasKey(obj, key) {
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
      if (!current || typeof current !== 'object' || !(k in current)) {
        return false;
      }
      current = current[k];
    }
    
    return true;
  }

  /**
   * 根据键获取值
   */
  getValueByKey(obj, key) {
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
      if (!current || typeof current !== 'object' || !(k in current)) {
        return undefined;
      }
      current = current[k];
    }
    
    return current;
  }

  /**
   * 检查翻译是否不一致
   */
  isInconsistent(baseValue, targetValue, key) {
    // 如果是相同的值，可能是未翻译
    if (baseValue === targetValue && typeof baseValue === 'string') {
      return this.hasChineseCharacters(baseValue);
    }
    
    return false;
  }

  /**
   * 查找重复键
   */
  findDuplicateKeys(obj, prefix = '', seen = new Map()) {
    const duplicates = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        duplicates.push(...this.findDuplicateKeys(value, fullKey, seen));
      } else {
        const valueStr = String(value);
        if (seen.has(valueStr)) {
          duplicates.push({
            key: valueStr,
            paths: [seen.get(valueStr), fullKey]
          });
        } else {
          seen.set(valueStr, fullKey);
        }
      }
    }
    
    return duplicates;
  }

  /**
   * 检查是否有机器翻译痕迹
   */
  hasMachineTranslationSigns(text) {
    const signs = [
      /\b(the|a|an)\s+\1\b/i, // 重复冠词
      /\b(is|are|was|were)\s+\1\b/i, // 重复be动词
      /[A-Z]{2,}\s+[A-Z]{2,}/, // 连续大写单词
    ];
    
    return signs.some(pattern => pattern.test(text));
  }

  /**
   * 检查是否包含中文字符
   */
  hasChineseCharacters(text) {
    return /[\u4e00-\u9fff]/.test(text);
  }

  /**
   * 检查参数占位符是否一致
   */
  hasConsistentPlaceholders(baseValue, targetValue) {
    if (typeof baseValue !== 'string' || typeof targetValue !== 'string') {
      return true; // 非字符串类型不检查占位符
    }

    const basePlaceholders = (baseValue.match(/\{\{[^}]+\}\}/g) || []).sort();
    const targetPlaceholders = (targetValue.match(/\{\{[^}]+\}\}/g) || []).sort();

    return JSON.stringify(basePlaceholders) === JSON.stringify(targetPlaceholders);
  }

  /**
   * 添加问题记录
   */
  addIssue(type, message, severity) {
    this.issues.push({
      type,
      message,
      severity,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成质量报告
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        errorCount: this.issues.filter(i => i.severity === 'error').length,
        warningCount: this.issues.filter(i => i.severity === 'warning').length,
        infoCount: this.issues.filter(i => i.severity === 'info').length
      },
      statistics: this.stats,
      completeness: {
        percentage: this.stats.totalKeys > 0 ? 
          Math.round((this.stats.translatedKeys / (this.stats.totalKeys * CONFIG.targetLanguages.length)) * 100) : 0
      },
      issues: this.issues
    };

    // 保存报告
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    
    // 打印摘要
    console.log('\n📊 质量检查报告:');
    console.log(`  总问题数: ${report.summary.totalIssues}`);
    console.log(`  错误: ${report.summary.errorCount}`);
    console.log(`  警告: ${report.summary.warningCount}`);
    console.log(`  信息: ${report.summary.infoCount}`);
    console.log(`  翻译完成度: ${report.completeness.percentage}%`);
    console.log(`\n📄 详细报告已保存到: ${CONFIG.outputFile}`);
    
    // 如果有错误，退出码为1
    if (report.summary.errorCount > 0) {
      console.log('\n❌ 发现严重错误，请修复后重试');
      process.exit(1);
    }
  }
}

// 运行质量检查
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new I18nQualityChecker();
  checker.runQualityCheck().catch(console.error);
}

export default I18nQualityChecker;
