/**
 * 🌐 国际化扫描工具
 * 扫描代码库中的硬编码中文文本，生成需要国际化的内容清单
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 中文字符正则表达式
const CHINESE_REGEX = /[\u4e00-\u9fff]+/g;

// 需要扫描的文件类型
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// 排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  'scripts',
  'public'
];

// 排除的文件
const EXCLUDE_FILES = [
  'i18n-scanner.js',
  'verify-auth-timeout-fix.js'
];

// 已经国际化的模式（跳过检查）
const I18N_PATTERNS = [
  /t\(['"`][^'"`]+['"`]\)/g,  // t('key')
  /useTranslation\(\)/g,      // useTranslation()
  /\{t\(['"`][^'"`]+['"`]\)\}/g, // {t('key')}
];

let totalFiles = 0;
let scannedFiles = 0;
let hardcodedTexts = [];

/**
 * 获取所有需要扫描的文件
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (SCAN_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(file)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

/**
 * 检查文本是否已经国际化
 */
function isAlreadyInternationalized(line) {
  return I18N_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * 提取中文文本的上下文
 */
function extractContext(lines, lineIndex, chineseText) {
  const contextBefore = lineIndex > 0 ? lines[lineIndex - 1].trim() : '';
  const contextAfter = lineIndex < lines.length - 1 ? lines[lineIndex + 1].trim() : '';
  
  return {
    before: contextBefore,
    current: lines[lineIndex].trim(),
    after: contextAfter,
    chineseText
  };
}

/**
 * 分析文本类型
 */
function analyzeTextType(context, chineseText) {
  const line = context.current.toLowerCase();
  
  if (line.includes('title') || line.includes('heading')) {
    return 'title';
  } else if (line.includes('button') || line.includes('btn')) {
    return 'button';
  } else if (line.includes('placeholder')) {
    return 'placeholder';
  } else if (line.includes('error') || line.includes('warning')) {
    return 'error';
  } else if (line.includes('toast') || line.includes('message')) {
    return 'message';
  } else if (line.includes('label')) {
    return 'label';
  } else if (line.includes('description') || line.includes('subtitle')) {
    return 'description';
  } else if (line.includes('nav') || line.includes('menu')) {
    return 'navigation';
  } else {
    return 'text';
  }
}

/**
 * 生成建议的翻译键
 */
function generateTranslationKey(textType, chineseText, filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const cleanText = chineseText.replace(/[^\u4e00-\u9fff\w]/g, '');
  
  // 根据文件名确定模块
  let module = 'common';
  if (fileName.includes('Page')) {
    module = fileName.replace('Page', '').toLowerCase();
  } else if (fileName.includes('Modal') || fileName.includes('Dialog')) {
    module = 'dialog';
  } else if (fileName.includes('Form')) {
    module = 'form';
  }
  
  // 生成键名
  const keyName = cleanText.length > 10 ? 
    cleanText.substring(0, 10) + 'Text' : 
    cleanText + 'Text';
  
  return `${module}.${textType}.${keyName}`;
}

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    totalFiles++;
    
    lines.forEach((line, lineIndex) => {
      // 跳过已经国际化的行
      if (isAlreadyInternationalized(line)) {
        return;
      }
      
      // 跳过注释行
      if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
        return;
      }
      
      // 查找中文文本
      const chineseMatches = line.match(CHINESE_REGEX);
      if (chineseMatches) {
        chineseMatches.forEach(chineseText => {
          const context = extractContext(lines, lineIndex, chineseText);
          const textType = analyzeTextType(context, chineseText);
          const suggestedKey = generateTranslationKey(textType, chineseText, filePath);
          
          hardcodedTexts.push({
            file: filePath.replace(process.cwd(), ''),
            line: lineIndex + 1,
            text: chineseText,
            context: context.current,
            type: textType,
            suggestedKey,
            priority: getPriority(textType, filePath)
          });
        });
      }
    });
    
    scannedFiles++;
    
    if (scannedFiles % 50 === 0) {
      console.log(`📊 进度: ${scannedFiles}/${totalFiles}`);
    }
    
  } catch (error) {
    console.warn(`❌ 无法扫描文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 获取优先级
 */
function getPriority(textType, filePath) {
  // 页面组件优先级最高
  if (filePath.includes('/pages/')) {
    return 'high';
  }
  
  // UI组件次之
  if (filePath.includes('/components/ui/')) {
    return 'high';
  }
  
  // 错误和消息类型优先级高
  if (['error', 'message', 'title', 'button'].includes(textType)) {
    return 'high';
  }
  
  // 导航和标签中等优先级
  if (['navigation', 'label'].includes(textType)) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * 生成报告
 */
function generateReport() {
  const report = {
    summary: {
      totalFiles: totalFiles,
      scannedFiles: scannedFiles,
      hardcodedTexts: hardcodedTexts.length,
      byType: {},
      byPriority: {},
      byFile: {}
    },
    details: hardcodedTexts
  };
  
  // 按类型统计
  hardcodedTexts.forEach(item => {
    report.summary.byType[item.type] = (report.summary.byType[item.type] || 0) + 1;
    report.summary.byPriority[item.priority] = (report.summary.byPriority[item.priority] || 0) + 1;
    report.summary.byFile[item.file] = (report.summary.byFile[item.file] || 0) + 1;
  });
  
  return report;
}

/**
 * 输出报告
 */
function outputReport(report) {
  console.log('\n📊 国际化扫描报告');
  console.log('='.repeat(50));
  
  console.log(`\n📁 文件统计:`);
  console.log(`  总文件数: ${report.summary.totalFiles}`);
  console.log(`  已扫描: ${report.summary.scannedFiles}`);
  console.log(`  发现硬编码文本: ${report.summary.hardcodedTexts} 处`);
  
  console.log(`\n📝 按类型分布:`);
  Object.entries(report.summary.byType)
    .sort(([,a], [,b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} 处`);
    });
  
  console.log(`\n⚡ 按优先级分布:`);
  Object.entries(report.summary.byPriority)
    .sort(([,a], [,b]) => b - a)
    .forEach(([priority, count]) => {
      console.log(`  ${priority}: ${count} 处`);
    });
  
  console.log(`\n📄 问题最多的文件 (前10):`);
  Object.entries(report.summary.byFile)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count]) => {
      console.log(`  ${file}: ${count} 处`);
    });
  
  // 保存详细报告
  const reportPath = path.join(__dirname, '../i18n-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 详细报告已保存到: ${reportPath}`);
  
  // 生成高优先级清单
  const highPriorityItems = report.details.filter(item => item.priority === 'high');
  if (highPriorityItems.length > 0) {
    console.log(`\n🔥 高优先级项目 (${highPriorityItems.length} 处):`);
    highPriorityItems.slice(0, 20).forEach(item => {
      console.log(`  ${item.file}:${item.line} - "${item.text}" (${item.type})`);
    });
    
    if (highPriorityItems.length > 20) {
      console.log(`  ... 还有 ${highPriorityItems.length - 20} 处高优先级项目`);
    }
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🌐 开始国际化扫描...');
  
  const srcDir = path.join(__dirname, '../src');
  const files = getAllFiles(srcDir);
  
  console.log(`📁 找到 ${files.length} 个文件需要扫描`);
  
  files.forEach(scanFile);
  
  const report = generateReport();
  outputReport(report);
  
  console.log('\n🎯 扫描完成!');
  
  if (report.summary.hardcodedTexts > 0) {
    console.log('🚨 发现硬编码中文文本，建议进行国际化处理!');
    return report;
  } else {
    console.log('✅ 未发现硬编码中文文本!');
    return null;
  }
}

// 运行扫描
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
