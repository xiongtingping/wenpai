#!/usr/bin/env node

/**
 * Dialog健康检查脚本
 * 自动检查Dialog组件的使用规范和潜在问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查结果统计
const stats = {
  totalFiles: 0,
  scannedFiles: 0,
  issues: {
    critical: [],
    warning: [],
    info: []
  },
  compliance: {
    unifiedDialogUsage: 0,
    designTokenUsage: 0,
    typeCompliance: 0,
    testCoverage: 0
  }
};

// 问题类型定义
const IssueTypes = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info'
};

// 检查模式
const PATTERNS = {
  // 禁止的Radix UI直接使用
  radixDialogImport: /import.*from\s+['"]@radix-ui\/react-dialog['"]/g,
  radixDialogUsage: /<Dialog\.|<DialogContent|<DialogOverlay/g,
  
  // 内联定位样式
  inlinePositioning: /style\s*=\s*\{\{[^}]*(?:position|top|left|right|bottom|transform|zIndex)[^}]*\}\}/g,
  
  // 硬编码样式值
  hardcodedColors: /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g,
  hardcodedSizes: /\b\d+px\b|\b\d+rem\b|\b\d+em\b/g,
  
  // 设计令牌使用
  designTokens: /var\(--[^)]+\)/g,
  
  // UnifiedDialog使用
  unifiedDialogImport: /import.*UnifiedDialog.*from/g,
  unifiedDialogUsage: /<UnifiedDialog/g,
  
  // 测试文件
  testFiles: /\.test\.(ts|tsx|js|jsx)$/,
  dialogTests: /describe\s*\(\s*['"][^'"]*[Dd]ialog[^'"]*['"]/g
};

/**
 * 获取所有需要检查的文件
 */
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 跳过node_modules和其他不需要检查的目录
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * 添加问题到统计
 */
function addIssue(type, file, line, message, suggestion = '') {
  stats.issues[type].push({
    file: path.relative(process.cwd(), file),
    line,
    message,
    suggestion
  });
}

/**
 * 检查单个文件
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    stats.totalFiles++;
    
    // 检查Radix UI直接使用
    checkRadixUIUsage(filePath, content, lines);
    
    // 检查内联定位样式
    checkInlinePositioning(filePath, content, lines);
    
    // 检查硬编码样式
    checkHardcodedStyles(filePath, content, lines);
    
    // 检查设计令牌使用
    checkDesignTokenUsage(filePath, content, lines);
    
    // 检查UnifiedDialog使用
    checkUnifiedDialogUsage(filePath, content, lines);
    
    // 检查测试覆盖
    checkTestCoverage(filePath, content, lines);
    
    stats.scannedFiles++;
    
  } catch (error) {
    console.warn(`⚠️ 无法读取文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 检查Radix UI直接使用
 */
function checkRadixUIUsage(filePath, content, lines) {
  // 检查导入
  const importMatches = [...content.matchAll(PATTERNS.radixDialogImport)];
  importMatches.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    addIssue(
      IssueTypes.CRITICAL,
      filePath,
      lineNumber,
      '禁止直接导入Radix UI Dialog组件',
      '使用 import { UnifiedDialog } from "@/components/ui/UnifiedDialog/UnifiedDialog"'
    );
  });
  
  // 检查使用
  const usageMatches = [...content.matchAll(PATTERNS.radixDialogUsage)];
  usageMatches.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    addIssue(
      IssueTypes.CRITICAL,
      filePath,
      lineNumber,
      '禁止直接使用Radix UI Dialog组件',
      '使用 <UnifiedDialog> 组件替代'
    );
  });
}

/**
 * 检查内联定位样式
 */
function checkInlinePositioning(filePath, content, lines) {
  const matches = [...content.matchAll(PATTERNS.inlinePositioning)];
  matches.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    addIssue(
      IssueTypes.CRITICAL,
      filePath,
      lineNumber,
      '禁止使用内联定位样式',
      '使用CSS类或UnifiedDialog组件的预定义变体'
    );
  });
}

/**
 * 检查硬编码样式
 */
function checkHardcodedStyles(filePath, content, lines) {
  // 检查硬编码颜色
  const colorMatches = [...content.matchAll(PATTERNS.hardcodedColors)];
  colorMatches.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    addIssue(
      IssueTypes.WARNING,
      filePath,
      lineNumber,
      `硬编码颜色值: ${match[0]}`,
      '使用设计令牌 var(--color-*) 替代'
    );
  });
  
  // 检查硬编码尺寸
  const sizeMatches = [...content.matchAll(PATTERNS.hardcodedSizes)];
  sizeMatches.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    // 跳过一些常见的合理使用场景
    if (!['0px', '1px', '2px'].includes(match[0])) {
      addIssue(
        IssueTypes.WARNING,
        filePath,
        lineNumber,
        `硬编码尺寸值: ${match[0]}`,
        '使用设计令牌 var(--spacing-*) 或 var(--size-*) 替代'
      );
    }
  });
}

/**
 * 检查设计令牌使用
 */
function checkDesignTokenUsage(filePath, content, lines) {
  const matches = [...content.matchAll(PATTERNS.designTokens)];
  if (matches.length > 0) {
    stats.compliance.designTokenUsage++;
    addIssue(
      IssueTypes.INFO,
      filePath,
      0,
      `✅ 使用了 ${matches.length} 个设计令牌`,
      ''
    );
  }
}

/**
 * 检查UnifiedDialog使用
 */
function checkUnifiedDialogUsage(filePath, content, lines) {
  const importMatches = [...content.matchAll(PATTERNS.unifiedDialogImport)];
  const usageMatches = [...content.matchAll(PATTERNS.unifiedDialogUsage)];
  
  if (importMatches.length > 0 && usageMatches.length > 0) {
    stats.compliance.unifiedDialogUsage++;
    addIssue(
      IssueTypes.INFO,
      filePath,
      0,
      '✅ 正确使用UnifiedDialog组件',
      ''
    );
  }
}

/**
 * 检查测试覆盖
 */
function checkTestCoverage(filePath, content, lines) {
  if (PATTERNS.testFiles.test(filePath)) {
    const dialogTestMatches = [...content.matchAll(PATTERNS.dialogTests)];
    if (dialogTestMatches.length > 0) {
      stats.compliance.testCoverage++;
      addIssue(
        IssueTypes.INFO,
        filePath,
        0,
        '✅ 包含Dialog相关测试',
        ''
      );
    }
  }
}

/**
 * 运行TypeScript类型检查
 */
function runTypeCheck() {
  try {
    console.log('🔍 运行TypeScript类型检查...');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    stats.compliance.typeCompliance = 1;
    console.log('✅ TypeScript类型检查通过');
  } catch (error) {
    addIssue(
      IssueTypes.CRITICAL,
      'TypeScript',
      0,
      'TypeScript类型检查失败',
      '修复类型错误后重新运行检查'
    );
    console.log('❌ TypeScript类型检查失败');
  }
}

/**
 * 运行Dialog定位测试
 */
function runDialogTests() {
  try {
    console.log('🧪 运行Dialog定位测试...');
    execSync('npm run test:dialog-positioning', { stdio: 'pipe' });
    console.log('✅ Dialog定位测试通过');
  } catch (error) {
    addIssue(
      IssueTypes.CRITICAL,
      'Tests',
      0,
      'Dialog定位测试失败',
      '检查Dialog组件的定位逻辑'
    );
    console.log('❌ Dialog定位测试失败');
  }
}

/**
 * 生成报告
 */
function generateReport() {
  console.log('\n📊 Dialog健康检查报告');
  console.log('='.repeat(50));
  
  // 基础统计
  console.log(`📁 扫描文件: ${stats.scannedFiles}/${stats.totalFiles}`);
  console.log(`🎯 合规性评分: ${calculateComplianceScore()}/100`);
  
  // 问题统计
  const totalIssues = stats.issues.critical.length + stats.issues.warning.length;
  console.log(`🚨 发现问题: ${totalIssues} 个`);
  console.log(`  - 严重: ${stats.issues.critical.length} 个`);
  console.log(`  - 警告: ${stats.issues.warning.length} 个`);
  console.log(`  - 信息: ${stats.issues.info.length} 个`);
  
  // 详细问题列表
  if (stats.issues.critical.length > 0) {
    console.log('\n🚨 严重问题:');
    stats.issues.critical.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.file}:${issue.line} - ${issue.message}`);
      if (issue.suggestion) {
        console.log(`     💡 建议: ${issue.suggestion}`);
      }
    });
  }
  
  if (stats.issues.warning.length > 0) {
    console.log('\n⚠️ 警告问题:');
    stats.issues.warning.slice(0, 10).forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.file}:${issue.line} - ${issue.message}`);
    });
    if (stats.issues.warning.length > 10) {
      console.log(`  ... 还有 ${stats.issues.warning.length - 10} 个警告`);
    }
  }
  
  // 合规性统计
  console.log('\n✅ 合规性统计:');
  console.log(`  - UnifiedDialog使用: ${stats.compliance.unifiedDialogUsage} 个文件`);
  console.log(`  - 设计令牌使用: ${stats.compliance.designTokenUsage} 个文件`);
  console.log(`  - 类型检查: ${stats.compliance.typeCompliance ? '通过' : '失败'}`);
  console.log(`  - 测试覆盖: ${stats.compliance.testCoverage} 个测试文件`);
  
  // 建议
  console.log('\n💡 改进建议:');
  if (stats.issues.critical.length > 0) {
    console.log('  1. 优先修复所有严重问题');
  }
  if (stats.compliance.unifiedDialogUsage === 0) {
    console.log('  2. 开始使用UnifiedDialog组件');
  }
  if (stats.compliance.designTokenUsage < stats.scannedFiles * 0.5) {
    console.log('  3. 增加设计令牌的使用');
  }
  if (stats.compliance.testCoverage === 0) {
    console.log('  4. 添加Dialog相关的测试用例');
  }
}

/**
 * 计算合规性评分
 */
function calculateComplianceScore() {
  let score = 100;
  
  // 严重问题扣分
  score -= stats.issues.critical.length * 10;
  
  // 警告问题扣分
  score -= stats.issues.warning.length * 2;
  
  // 合规性加分
  if (stats.compliance.typeCompliance) score += 10;
  if (stats.compliance.unifiedDialogUsage > 0) score += 10;
  if (stats.compliance.designTokenUsage > 0) score += 10;
  if (stats.compliance.testCoverage > 0) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始Dialog健康检查...');
  
  // 获取所有文件
  const files = getAllFiles('./src');
  console.log(`📁 找到 ${files.length} 个文件`);
  
  // 检查每个文件
  files.forEach(file => {
    checkFile(file);
  });
  
  // 运行额外检查
  runTypeCheck();
  runDialogTests();
  
  // 生成报告
  generateReport();
  
  // 退出码
  const hasErrors = stats.issues.critical.length > 0;
  process.exit(hasErrors ? 1 : 0);
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = {
  checkFile,
  generateReport,
  stats
};
