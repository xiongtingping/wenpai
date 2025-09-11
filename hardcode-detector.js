#!/usr/bin/env node

/**
 * 🚨 硬编码检测器 - 全面检查所有硬编码问题
 */

const fs = require('fs');
const path = require('path');

// 硬编码检测模式
const HARDCODE_PATTERNS = {
  // 内联样式
  inlineStyles: /style\s*=\s*\{[^}]*\}/g,
  
  // 硬编码颜色
  hexColors: /#[0-9a-fA-F]{3,8}/g,
  rgbColors: /rgba?\([^)]+\)/g,
  hslColors: /hsla?\([^)]+\)/g,
  namedColors: /\b(white|black|red|blue|green|yellow|purple|orange|pink|gray|grey)\b/g,
  
  // 硬编码尺寸
  pixelSizes: /\b\d+px\b/g,
  remSizes: /\b\d+\.?\d*rem\b/g,
  emSizes: /\b\d+\.?\d*em\b/g,
  percentSizes: /\b\d+%\b/g,
  viewportSizes: /\b\d+v[wh]\b/g,
  
  // 硬编码字体
  fontFamilies: /font-family\s*:\s*['"'][^'"]+['"']/g,
  fontStacks: /'[^']*',\s*[^;,}]+/g,
  
  // CSS !important
  importantRules: /!\s*important/g,
  
  // 硬编码z-index
  zIndexValues: /z-index\s*:\s*\d+/g,
  
  // 硬编码动画时间
  animationDurations: /\b\d+m?s\b/g
};

// 问题统计
const issues = {
  inlineStyles: [],
  hardcodedColors: [],
  hardcodedSizes: [],
  hardcodedFonts: [],
  importantRules: [],
  zIndexValues: [],
  animationDurations: []
};

let totalFiles = 0;
let scannedFiles = 0;

/**
 * 获取所有需要检查的文件
 */
function getAllFiles(dir = './src') {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js'];
  
  function scanDirectory(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  无法扫描目录: ${currentDir}`);
    }
  }
  
  scanDirectory(dir);
  return files;
}

/**
 * 检查单个文件的硬编码问题
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    totalFiles++;
    
    // 检查内联样式
    checkInlineStyles(filePath, content);
    
    // 检查硬编码颜色
    checkHardcodedColors(filePath, content);
    
    // 检查硬编码尺寸
    checkHardcodedSizes(filePath, content);
    
    // 检查硬编码字体
    checkHardcodedFonts(filePath, content);
    
    // 检查!important
    checkImportantRules(filePath, content);
    
    // 检查z-index
    checkZIndexValues(filePath, content);
    
    // 检查动画时间
    checkAnimationDurations(filePath, content);
    
    scannedFiles++;
    
    if (scannedFiles % 20 === 0) {
      console.log(`📊 进度: ${scannedFiles}/${totalFiles}`);
    }
    
  } catch (error) {
    console.warn(`❌ 无法检查文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 检查内联样式
 */
function checkInlineStyles(filePath, content) {
  const matches = [...content.matchAll(HARDCODE_PATTERNS.inlineStyles)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.inlineStyles.push({
      file: filePath,
      line: lineNumber,
      content: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : ''),
      severity: 'error'
    });
  });
}

/**
 * 检查硬编码颜色
 */
function checkHardcodedColors(filePath, content) {
  // 检查十六进制颜色
  const hexMatches = [...content.matchAll(HARDCODE_PATTERNS.hexColors)];
  hexMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // 跳过注释
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      return;
    }
    
    issues.hardcodedColors.push({
      file: filePath,
      line: lineNumber,
      color: match[0],
      type: 'hex',
      severity: 'error'
    });
  });
  
  // 检查RGB颜色
  const rgbMatches = [...content.matchAll(HARDCODE_PATTERNS.rgbColors)];
  rgbMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.hardcodedColors.push({
      file: filePath,
      line: lineNumber,
      color: match[0],
      type: 'rgb',
      severity: 'error'
    });
  });
  
  // 检查HSL颜色
  const hslMatches = [...content.matchAll(HARDCODE_PATTERNS.hslColors)];
  hslMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.hardcodedColors.push({
      file: filePath,
      line: lineNumber,
      color: match[0],
      type: 'hsl',
      severity: 'error'
    });
  });
}

/**
 * 检查硬编码尺寸
 */
function checkHardcodedSizes(filePath, content) {
  // 检查像素值
  const pxMatches = [...content.matchAll(HARDCODE_PATTERNS.pixelSizes)];
  pxMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.hardcodedSizes.push({
      file: filePath,
      line: lineNumber,
      size: match[0],
      type: 'px',
      severity: 'warning'
    });
  });
  
  // 检查rem值
  const remMatches = [...content.matchAll(HARDCODE_PATTERNS.remSizes)];
  remMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.hardcodedSizes.push({
      file: filePath,
      line: lineNumber,
      size: match[0],
      type: 'rem',
      severity: 'warning'
    });
  });
}

/**
 * 检查硬编码字体
 */
function checkHardcodedFonts(filePath, content) {
  const matches = [...content.matchAll(HARDCODE_PATTERNS.fontFamilies)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.hardcodedFonts.push({
      file: filePath,
      line: lineNumber,
      font: match[0],
      severity: 'warning'
    });
  });
}

/**
 * 检查!important规则
 */
function checkImportantRules(filePath, content) {
  const matches = [...content.matchAll(HARDCODE_PATTERNS.importantRules)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.importantRules.push({
      file: filePath,
      line: lineNumber,
      content: match[0],
      severity: 'warning'
    });
  });
}

/**
 * 检查z-index值
 */
function checkZIndexValues(filePath, content) {
  const matches = [...content.matchAll(HARDCODE_PATTERNS.zIndexValues)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    issues.zIndexValues.push({
      file: filePath,
      line: lineNumber,
      zIndex: match[0],
      severity: 'info'
    });
  });
}

/**
 * 检查动画时间
 */
function checkAnimationDurations(filePath, content) {
  const matches = [...content.matchAll(HARDCODE_PATTERNS.animationDurations)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = content.split('\n')[lineNumber - 1];
    
    // 只检查CSS相关的时间值
    if (line.includes('transition') || line.includes('animation') || line.includes('duration')) {
      issues.animationDurations.push({
        file: filePath,
        line: lineNumber,
        duration: match[0],
        severity: 'info'
      });
    }
  });
}

/**
 * 生成报告
 */
function generateReport() {
  const totalIssues = Object.values(issues).reduce((sum, issueArray) => sum + issueArray.length, 0);
  
  console.log('\n🚨 硬编码检测报告');
  console.log('='.repeat(50));
  console.log(`📁 扫描文件: ${scannedFiles}`);
  console.log(`🚨 总问题数: ${totalIssues}`);
  
  console.log('\n📊 问题分布:');
  Object.entries(issues).forEach(([type, issueArray]) => {
    if (issueArray.length > 0) {
      console.log(`  ${type}: ${issueArray.length}`);
    }
  });
  
  // 显示最严重的问题
  console.log('\n🔥 最严重的问题 (前10个):');
  const allIssues = [];
  Object.entries(issues).forEach(([type, issueArray]) => {
    issueArray.forEach(issue => {
      allIssues.push({ ...issue, type });
    });
  });
  
  // 按严重程度排序
  const severityOrder = { error: 3, warning: 2, info: 1 };
  allIssues.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  
  allIssues.slice(0, 10).forEach((issue, index) => {
    const icon = issue.severity === 'error' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
    console.log(`  ${index + 1}. ${icon} ${issue.file}:${issue.line} - ${issue.type}`);
    if (issue.content) {
      console.log(`     ${issue.content.substring(0, 80)}...`);
    }
  });
  
  // 问题最多的文件
  console.log('\n📁 问题最多的文件:');
  const fileIssueCount = {};
  allIssues.forEach(issue => {
    fileIssueCount[issue.file] = (fileIssueCount[issue.file] || 0) + 1;
  });
  
  Object.entries(fileIssueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([file, count], index) => {
      console.log(`  ${index + 1}. ${file} (${count} 问题)`);
    });
  
  // 保存详细报告
  const report = {
    summary: {
      totalFiles: scannedFiles,
      totalIssues: totalIssues,
      issueBreakdown: Object.fromEntries(
        Object.entries(issues).map(([type, issueArray]) => [type, issueArray.length])
      )
    },
    issues: issues,
    topProblematicFiles: Object.entries(fileIssueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([file, count]) => ({ file, count }))
  };
  
  fs.writeFileSync('hardcode-detection-report.json', JSON.stringify(report, null, 2));
  console.log('\n💾 详细报告已保存到: hardcode-detection-report.json');
  
  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始全面硬编码检测...');
  
  const files = getAllFiles('./src');
  console.log(`📁 找到 ${files.length} 个文件需要检查`);
  
  files.forEach(checkFile);
  
  const report = generateReport();
  
  console.log('\n🎯 检测完成!');
  
  if (report.summary.totalIssues > 0) {
    console.log('🚨 发现硬编码问题，需要修复!');
    process.exit(1);
  } else {
    console.log('✅ 未发现硬编码问题!');
    process.exit(0);
  }
}

// 运行检测
if (require.main === module) {
  main();
}

module.exports = { main };
