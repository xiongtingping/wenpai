#!/usr/bin/env node

/**
 * 🔍 系统性CSS全面审查工具
 * 对551个文件进行逐一深度分析
 */

const fs = require('fs');
const path = require('path');

// 全局统计
const globalStats = {
  totalFiles: 0,
  totalLines: 0,
  scannedFiles: 0,
  issues: {
    inlineStyles: [],
    hardcodedColors: [],
    hardcodedSizes: [],
    hardcodedFonts: [],
    cssImportant: [],
    mixedSystems: [],
    missingTokens: [],
    themeInconsistencies: []
  },
  fileTypes: {
    tsx: 0,
    ts: 0,
    css: 0,
    scss: 0,
    js: 0,
    jsx: 0
  }
};

// 检测模式 - 更全面的正则表达式
const DETECTION_PATTERNS = {
  // 内联样式检测
  inlineStyles: {
    basic: /style\s*=\s*\{\{([^}]+)\}\}/g,
    complex: /style\s*=\s*\{([^}]*\{[^}]*\}[^}]*)\}/g,
    conditional: /style\s*=\s*\{[^}]*\?[^}]*:[^}]*\}/g
  },
  
  // 硬编码颜色检测
  hardcodedColors: {
    hex: /#[0-9a-fA-F]{3,8}/g,
    rgb: /rgba?\([^)]+\)/g,
    hsl: /hsla?\([^)]+\)/g,
    named: /\b(white|black|red|blue|green|yellow|purple|orange|pink|gray|grey)\b/g
  },
  
  // 硬编码尺寸检测
  hardcodedSizes: {
    pixels: /\b\d+px\b/g,
    rem: /\b\d+\.?\d*rem\b/g,
    em: /\b\d+\.?\d*em\b/g,
    percent: /\b\d+%\b/g,
    viewport: /\b\d+v[wh]\b/g
  },
  
  // 硬编码字体检测
  hardcodedFonts: {
    fontFamily: /font-family\s*:\s*['"'][^'"]+['"']/g,
    fontStack: /'[^']*',\s*[^;,}]+/g
  },
  
  // CSS !important 检测
  cssImportant: /!\s*important/g,
  
  // 混合样式系统检测
  mixedSystems: {
    tailwindAndInline: /className.*style\s*=/g,
    cssAndInline: /\.css.*style\s*=/g
  },
  
  // 设计令牌使用检测
  designTokens: {
    cssVars: /var\(--[^)]+\)/g,
    hslVars: /hsl\(var\(--[^)]+\)\)/g
  }
};

// 硬编码值映射表
const HARDCODED_MAPPINGS = {
  colors: {
    '#ffffff': 'hsl(var(--background))',
    '#000000': 'hsl(var(--foreground))',
    'white': 'hsl(var(--background))',
    'black': 'hsl(var(--foreground))',
    'rgb(255, 255, 255)': 'hsl(var(--background))',
    'rgb(0, 0, 0)': 'hsl(var(--foreground))',
    'rgba(0, 0, 0, 0.5)': 'hsl(var(--foreground) / 0.5)',
    'rgba(255, 255, 255, 0.9)': 'hsl(var(--background) / 0.9)',
    '#ef4444': 'hsl(var(--destructive))',
    '#22c55e': 'hsl(var(--success))',
    '#3b82f6': 'hsl(var(--primary))',
    '#f59e0b': 'hsl(var(--warning))'
  },
  sizes: {
    '4px': 'var(--spacing-1)',
    '8px': 'var(--spacing-2)',
    '12px': 'var(--spacing-3)',
    '16px': 'var(--spacing-4)',
    '20px': 'var(--spacing-5)',
    '24px': 'var(--spacing-6)',
    '32px': 'var(--spacing-8)',
    '48px': 'var(--spacing-12)',
    '64px': 'var(--spacing-16)'
  },
  fonts: {
    "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif": 'var(--font-family-ui)',
    "'Inter', sans-serif": 'var(--font-family-base)',
    "system-ui, -apple-system": 'var(--font-family-system)'
  }
};

/**
 * 获取所有需要检查的文件
 */
function getAllFiles(dir = './src') {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
  
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
          globalStats.fileTypes[path.extname(fullPath).slice(1)]++;
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
 * 深度分析单个文件
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    globalStats.totalFiles++;
    globalStats.totalLines += lines.length;
    
    // 分析内联样式
    analyzeInlineStyles(filePath, content);
    
    // 分析硬编码颜色
    analyzeHardcodedColors(filePath, content);
    
    // 分析硬编码尺寸
    analyzeHardcodedSizes(filePath, content);
    
    // 分析硬编码字体
    analyzeHardcodedFonts(filePath, content);
    
    // 分析CSS !important
    analyzeCSSImportant(filePath, content);
    
    // 分析混合样式系统
    analyzeMixedSystems(filePath, content);
    
    // 分析设计令牌使用
    analyzeDesignTokenUsage(filePath, content);
    
    // 分析主题一致性
    analyzeThemeConsistency(filePath, content);
    
    globalStats.scannedFiles++;
    
    if (globalStats.scannedFiles % 50 === 0) {
      console.log(`📊 进度: ${globalStats.scannedFiles}/${globalStats.totalFiles} (${Math.round(globalStats.scannedFiles/globalStats.totalFiles*100)}%)`);
    }
    
  } catch (error) {
    console.warn(`❌ 无法分析文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 分析内联样式
 */
function analyzeInlineStyles(filePath, content) {
  // 基础内联样式
  const basicMatches = [...content.matchAll(DETECTION_PATTERNS.inlineStyles.basic)];
  // 复杂内联样式
  const complexMatches = [...content.matchAll(DETECTION_PATTERNS.inlineStyles.complex)];
  // 条件内联样式
  const conditionalMatches = [...content.matchAll(DETECTION_PATTERNS.inlineStyles.conditional)];
  
  const allMatches = [...basicMatches, ...complexMatches, ...conditionalMatches];
  
  allMatches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const styleContent = match[1] || match[0];
    
    globalStats.issues.inlineStyles.push({
      file: filePath,
      line: lineNumber,
      content: styleContent.trim(),
      type: detectInlineStyleType(styleContent),
      severity: calculateSeverity(styleContent),
      suggestion: generateInlineStyleSuggestion(styleContent)
    });
  });
}

/**
 * 分析硬编码颜色
 */
function analyzeHardcodedColors(filePath, content) {
  Object.entries(DETECTION_PATTERNS.hardcodedColors).forEach(([type, pattern]) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach((match) => {
      const color = match[0];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // 跳过注释中的颜色
      const line = content.split('\n')[lineNumber - 1];
      if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
        return;
      }
      
      globalStats.issues.hardcodedColors.push({
        file: filePath,
        line: lineNumber,
        color: color,
        type: type,
        suggestion: HARDCODED_MAPPINGS.colors[color] || 'hsl(var(--primary))',
        severity: 'error'
      });
    });
  });
}

/**
 * 分析硬编码尺寸
 */
function analyzeHardcodedSizes(filePath, content) {
  Object.entries(DETECTION_PATTERNS.hardcodedSizes).forEach(([type, pattern]) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach((match) => {
      const size = match[0];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      globalStats.issues.hardcodedSizes.push({
        file: filePath,
        line: lineNumber,
        size: size,
        type: type,
        suggestion: HARDCODED_MAPPINGS.sizes[size] || 'var(--spacing-4)',
        severity: 'warning'
      });
    });
  });
}

/**
 * 分析硬编码字体
 */
function analyzeHardcodedFonts(filePath, content) {
  Object.entries(DETECTION_PATTERNS.hardcodedFonts).forEach(([type, pattern]) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach((match) => {
      const font = match[0];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      globalStats.issues.hardcodedFonts.push({
        file: filePath,
        line: lineNumber,
        font: font,
        type: type,
        suggestion: HARDCODED_MAPPINGS.fonts[font] || 'var(--font-family-base)',
        severity: 'warning'
      });
    });
  });
}

/**
 * 分析CSS !important
 */
function analyzeCSSImportant(filePath, content) {
  const matches = [...content.matchAll(DETECTION_PATTERNS.cssImportant)];
  
  matches.forEach((match) => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    globalStats.issues.cssImportant.push({
      file: filePath,
      line: lineNumber,
      content: match[0],
      severity: 'warning',
      suggestion: '考虑使用CSS层级或更具体的选择器'
    });
  });
}

/**
 * 分析混合样式系统
 */
function analyzeMixedSystems(filePath, content) {
  Object.entries(DETECTION_PATTERNS.mixedSystems).forEach(([type, pattern]) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach((match) => {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      globalStats.issues.mixedSystems.push({
        file: filePath,
        line: lineNumber,
        type: type,
        content: match[0],
        severity: 'error',
        suggestion: '统一使用单一样式系统'
      });
    });
  });
}

/**
 * 分析设计令牌使用
 */
function analyzeDesignTokenUsage(filePath, content) {
  const cssVarMatches = [...content.matchAll(DETECTION_PATTERNS.designTokens.cssVars)];
  const hslVarMatches = [...content.matchAll(DETECTION_PATTERNS.designTokens.hslVars)];
  
  // 这里记录正确使用设计令牌的情况（用于统计）
  if (cssVarMatches.length > 0 || hslVarMatches.length > 0) {
    // 正面案例，不记录为问题
  }
}

/**
 * 分析主题一致性
 */
function analyzeThemeConsistency(filePath, content) {
  // 检查是否有可能破坏主题一致性的硬编码值
  const themeBreakers = [
    /background:\s*#[0-9a-fA-F]+/g,
    /color:\s*#[0-9a-fA-F]+/g,
    /border-color:\s*#[0-9a-fA-F]+/g
  ];
  
  themeBreakers.forEach((pattern, index) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach((match) => {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      globalStats.issues.themeInconsistencies.push({
        file: filePath,
        line: lineNumber,
        content: match[0],
        type: ['background', 'color', 'border'][index],
        severity: 'error',
        suggestion: '使用主题感知的设计令牌'
      });
    });
  });
}

/**
 * 辅助函数
 */
function detectInlineStyleType(styleContent) {
  if (styleContent.includes('position')) return 'layout';
  if (styleContent.includes('color') || styleContent.includes('background')) return 'color';
  if (styleContent.includes('font')) return 'typography';
  if (styleContent.includes('transform')) return 'animation';
  return 'other';
}

function calculateSeverity(styleContent) {
  if (styleContent.includes('#') || styleContent.includes('rgb')) return 'error';
  if (styleContent.includes('px') || styleContent.includes('rem')) return 'warning';
  return 'info';
}

function generateInlineStyleSuggestion(styleContent) {
  if (styleContent.includes('position')) return '创建布局相关的CSS类';
  if (styleContent.includes('color')) return '使用设计令牌颜色类';
  if (styleContent.includes('font')) return '使用字体系统类';
  return '创建对应的CSS类';
}

/**
 * 生成详细报告
 */
function generateDetailedReport() {
  const totalIssues = Object.values(globalStats.issues).reduce((sum, issues) => sum + issues.length, 0);
  
  const report = {
    summary: {
      totalFiles: globalStats.totalFiles,
      scannedFiles: globalStats.scannedFiles,
      totalLines: globalStats.totalLines,
      totalIssues: totalIssues,
      fileTypes: globalStats.fileTypes,
      issueBreakdown: {
        inlineStyles: globalStats.issues.inlineStyles.length,
        hardcodedColors: globalStats.issues.hardcodedColors.length,
        hardcodedSizes: globalStats.issues.hardcodedSizes.length,
        hardcodedFonts: globalStats.issues.hardcodedFonts.length,
        cssImportant: globalStats.issues.cssImportant.length,
        mixedSystems: globalStats.issues.mixedSystems.length,
        themeInconsistencies: globalStats.issues.themeInconsistencies.length
      }
    },
    details: globalStats.issues,
    topProblematicFiles: getTopProblematicFiles(),
    recommendations: generateSystemicRecommendations()
  };
  
  return report;
}

/**
 * 获取问题最多的文件
 */
function getTopProblematicFiles() {
  const fileIssueCount = {};
  
  Object.values(globalStats.issues).forEach(issueArray => {
    issueArray.forEach(issue => {
      fileIssueCount[issue.file] = (fileIssueCount[issue.file] || 0) + 1;
    });
  });
  
  return Object.entries(fileIssueCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([file, count]) => ({ file, issueCount: count }));
}

/**
 * 生成系统性建议
 */
function generateSystemicRecommendations() {
  const recommendations = [];
  
  if (globalStats.issues.inlineStyles.length > 0) {
    recommendations.push({
      priority: 'critical',
      type: 'inline-styles',
      count: globalStats.issues.inlineStyles.length,
      message: `发现 ${globalStats.issues.inlineStyles.length} 个内联样式问题`,
      action: '创建对应的CSS类，完全消除内联样式使用'
    });
  }
  
  if (globalStats.issues.hardcodedColors.length > 0) {
    recommendations.push({
      priority: 'critical',
      type: 'hardcoded-colors',
      count: globalStats.issues.hardcodedColors.length,
      message: `发现 ${globalStats.issues.hardcodedColors.length} 个硬编码颜色`,
      action: '使用设计令牌替换所有硬编码颜色值'
    });
  }
  
  if (globalStats.issues.mixedSystems.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'mixed-systems',
      count: globalStats.issues.mixedSystems.length,
      message: `发现 ${globalStats.issues.mixedSystems.length} 个混合样式系统问题`,
      action: '统一使用单一样式系统，避免混合使用'
    });
  }
  
  return recommendations;
}

/**
 * 主执行函数
 */
function runSystematicAudit() {
  console.log('🔍 开始系统性CSS全面审查...');
  console.log('📁 扫描目标: 551个文件');
  
  const startTime = Date.now();
  const files = getAllFiles('./src');
  
  console.log(`📊 实际找到 ${files.length} 个文件`);
  console.log('🚀 开始逐文件深度分析...\n');
  
  // 逐文件分析
  files.forEach((file, index) => {
    analyzeFile(file);
  });
  
  const endTime = Date.now();
  const report = generateDetailedReport();
  
  // 保存详细报告
  fs.writeFileSync('systematic-css-audit-report.json', JSON.stringify(report, null, 2));
  
  // 输出摘要
  console.log('\n🎯 系统性审查完成!');
  console.log(`⏱️  耗时: ${endTime - startTime}ms`);
  console.log(`📁 扫描文件: ${report.summary.scannedFiles}/${report.summary.totalFiles}`);
  console.log(`📝 总代码行: ${report.summary.totalLines.toLocaleString()}`);
  console.log(`🚨 总问题数: ${report.summary.totalIssues}`);
  
  console.log('\n📊 问题分布:');
  Object.entries(report.summary.issueBreakdown).forEach(([type, count]) => {
    if (count > 0) {
      console.log(`  ${type}: ${count}`);
    }
  });
  
  console.log('\n🔥 问题最多的文件:');
  report.topProblematicFiles.slice(0, 10).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.file} (${item.issueCount} 问题)`);
  });
  
  console.log('\n💡 关键建议:');
  report.recommendations.forEach(rec => {
    console.log(`  🔴 ${rec.message} - ${rec.action}`);
  });
  
  return report;
}

// 运行审查
if (require.main === module) {
  runSystematicAudit();
}

module.exports = { runSystematicAudit };
