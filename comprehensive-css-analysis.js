/**
 * 全面CSS系统分析脚本
 * 深度扫描整个代码库的CSS使用情况
 */

const fs = require('fs');
const path = require('path');

// 分析结果存储
const analysisResults = {
  inlineStyles: [],
  hardcodedColors: [],
  hardcodedSizes: [],
  cssFiles: [],
  componentStyles: [],
  tailwindUsage: [],
  designTokenUsage: [],
  themeInconsistencies: [],
  totalFiles: 0,
  totalLines: 0
};

// 硬编码模式检测
const PATTERNS = {
  inlineStyles: /style\s*=\s*\{\{([^}]+)\}\}/g,
  hardcodedColors: /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/g,
  hardcodedSizes: /\b\d+px\b|\b\d+rem\b|\b\d+em\b/g,
  cssVariables: /var\(--[^)]+\)/g,
  tailwindClasses: /className\s*=\s*["'`]([^"'`]+)["'`]/g,
  styledComponents: /styled\.[a-zA-Z]+`([^`]+)`/g
};

// 设计令牌映射
const DESIGN_TOKEN_MAPPING = {
  '#ffffff': 'hsl(var(--background))',
  '#000000': 'hsl(var(--foreground))',
  'white': 'hsl(var(--background))',
  'black': 'hsl(var(--foreground))',
  'rgb(37, 99, 235)': 'hsl(var(--primary))',
  'rgb(239, 68, 68)': 'hsl(var(--destructive))',
  '12px': 'var(--spacing-3)',
  '16px': 'var(--spacing-4)',
  '24px': 'var(--spacing-6)'
};

/**
 * 递归获取所有文件
 */
function getAllFiles(dirPath, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`无法读取目录: ${dirPath}`);
  }
  
  return files;
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    analysisResults.totalFiles++;
    analysisResults.totalLines += lines.length;
    
    // 分析内联样式
    analyzeInlineStyles(filePath, content);
    
    // 分析硬编码颜色
    analyzeHardcodedColors(filePath, content);
    
    // 分析硬编码尺寸
    analyzeHardcodedSizes(filePath, content);
    
    // 分析Tailwind使用
    analyzeTailwindUsage(filePath, content);
    
    // 分析设计令牌使用
    analyzeDesignTokenUsage(filePath, content);
    
    // 分析CSS文件
    if (path.extname(filePath) === '.css') {
      analyzeCSSFile(filePath, content);
    }
    
  } catch (error) {
    console.warn(`无法分析文件: ${filePath}`, error.message);
  }
}

/**
 * 分析内联样式
 */
function analyzeInlineStyles(filePath, content) {
  const matches = [...content.matchAll(PATTERNS.inlineStyles)];
  
  matches.forEach((match, index) => {
    const styleContent = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    analysisResults.inlineStyles.push({
      file: filePath,
      line: lineNumber,
      content: styleContent.trim(),
      fullMatch: match[0],
      severity: containsHardcodedValues(styleContent) ? 'error' : 'warning',
      suggestion: generateStyleSuggestion(styleContent)
    });
  });
}

/**
 * 分析硬编码颜色
 */
function analyzeHardcodedColors(filePath, content) {
  const matches = [...content.matchAll(PATTERNS.hardcodedColors)];
  
  matches.forEach((match) => {
    const color = match[0];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    analysisResults.hardcodedColors.push({
      file: filePath,
      line: lineNumber,
      color: color,
      suggestion: DESIGN_TOKEN_MAPPING[color] || 'hsl(var(--primary))',
      severity: 'error'
    });
  });
}

/**
 * 分析硬编码尺寸
 */
function analyzeHardcodedSizes(filePath, content) {
  const matches = [...content.matchAll(PATTERNS.hardcodedSizes)];
  
  matches.forEach((match) => {
    const size = match[0];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    analysisResults.hardcodedSizes.push({
      file: filePath,
      line: lineNumber,
      size: size,
      suggestion: DESIGN_TOKEN_MAPPING[size] || 'var(--spacing-4)',
      severity: 'warning'
    });
  });
}

/**
 * 分析Tailwind使用
 */
function analyzeTailwindUsage(filePath, content) {
  const matches = [...content.matchAll(PATTERNS.tailwindClasses)];
  
  matches.forEach((match) => {
    const classes = match[1];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    // 检查是否使用了硬编码的Tailwind类
    const hardcodedClasses = classes.match(/bg-\w+-\d+|text-\w+-\d+|border-\w+-\d+/g);
    
    if (hardcodedClasses) {
      analysisResults.tailwindUsage.push({
        file: filePath,
        line: lineNumber,
        classes: hardcodedClasses,
        suggestion: '使用设计令牌替换硬编码颜色类',
        severity: 'warning'
      });
    }
  });
}

/**
 * 分析设计令牌使用
 */
function analyzeDesignTokenUsage(filePath, content) {
  const matches = [...content.matchAll(PATTERNS.cssVariables)];
  
  matches.forEach((match) => {
    const variable = match[0];
    const lineNumber = content.substring(0, match.index).split('\n').length;
    
    analysisResults.designTokenUsage.push({
      file: filePath,
      line: lineNumber,
      variable: variable,
      type: 'good-practice'
    });
  });
}

/**
 * 分析CSS文件
 */
function analyzeCSSFile(filePath, content) {
  analysisResults.cssFiles.push({
    file: filePath,
    size: content.length,
    lines: content.split('\n').length,
    hasDesignTokens: content.includes('var(--'),
    hasHardcodedColors: PATTERNS.hardcodedColors.test(content),
    hasHardcodedSizes: PATTERNS.hardcodedSizes.test(content)
  });
}

/**
 * 检查是否包含硬编码值
 */
function containsHardcodedValues(styleContent) {
  return PATTERNS.hardcodedColors.test(styleContent) || 
         PATTERNS.hardcodedSizes.test(styleContent);
}

/**
 * 生成样式建议
 */
function generateStyleSuggestion(styleContent) {
  if (styleContent.includes('color:')) {
    return '使用 className="text-foreground" 替换';
  }
  if (styleContent.includes('background')) {
    return '使用 className="bg-background" 替换';
  }
  if (styleContent.includes('width:') || styleContent.includes('height:')) {
    return '使用 Tailwind 尺寸类替换';
  }
  return '使用 CSS 类替换内联样式';
}

/**
 * 生成分析报告
 */
function generateReport() {
  const report = {
    summary: {
      totalFiles: analysisResults.totalFiles,
      totalLines: analysisResults.totalLines,
      totalIssues: analysisResults.inlineStyles.length + 
                   analysisResults.hardcodedColors.length + 
                   analysisResults.hardcodedSizes.length,
      inlineStylesCount: analysisResults.inlineStyles.length,
      hardcodedColorsCount: analysisResults.hardcodedColors.length,
      hardcodedSizesCount: analysisResults.hardcodedSizes.length,
      cssFilesCount: analysisResults.cssFiles.length,
      designTokenUsageCount: analysisResults.designTokenUsage.length
    },
    details: analysisResults,
    recommendations: generateRecommendations()
  };
  
  return report;
}

/**
 * 生成修复建议
 */
function generateRecommendations() {
  const recommendations = [];
  
  if (analysisResults.inlineStyles.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'inline-styles',
      message: `发现 ${analysisResults.inlineStyles.length} 个内联样式，建议替换为CSS类`,
      action: '使用 className 替换 style={{}} 属性'
    });
  }
  
  if (analysisResults.hardcodedColors.length > 0) {
    recommendations.push({
      priority: 'high',
      type: 'hardcoded-colors',
      message: `发现 ${analysisResults.hardcodedColors.length} 个硬编码颜色，建议使用设计令牌`,
      action: '使用 hsl(var(--primary)) 等设计令牌替换硬编码颜色'
    });
  }
  
  if (analysisResults.hardcodedSizes.length > 0) {
    recommendations.push({
      priority: 'medium',
      type: 'hardcoded-sizes',
      message: `发现 ${analysisResults.hardcodedSizes.length} 个硬编码尺寸，建议使用设计令牌`,
      action: '使用 var(--spacing-*) 等设计令牌替换硬编码尺寸'
    });
  }
  
  return recommendations;
}

/**
 * 主分析函数
 */
function runComprehensiveAnalysis() {
  console.log('🔍 开始全面CSS系统分析...');
  
  const startTime = Date.now();
  const files = getAllFiles('./src');
  
  console.log(`📁 找到 ${files.length} 个文件`);
  
  files.forEach((file, index) => {
    if (index % 50 === 0) {
      console.log(`📊 分析进度: ${index}/${files.length} (${Math.round(index/files.length*100)}%)`);
    }
    analyzeFile(file);
  });
  
  const report = generateReport();
  const endTime = Date.now();
  
  console.log(`✅ 分析完成，耗时 ${endTime - startTime}ms`);
  
  // 保存报告
  fs.writeFileSync('css-analysis-report.json', JSON.stringify(report, null, 2));
  
  // 输出摘要
  console.log('\n📊 分析摘要:');
  console.log(`- 总文件数: ${report.summary.totalFiles}`);
  console.log(`- 总代码行数: ${report.summary.totalLines}`);
  console.log(`- 总问题数: ${report.summary.totalIssues}`);
  console.log(`- 内联样式: ${report.summary.inlineStylesCount}`);
  console.log(`- 硬编码颜色: ${report.summary.hardcodedColorsCount}`);
  console.log(`- 硬编码尺寸: ${report.summary.hardcodedSizesCount}`);
  console.log(`- CSS文件: ${report.summary.cssFilesCount}`);
  console.log(`- 设计令牌使用: ${report.summary.designTokenUsageCount}`);
  
  return report;
}

// 运行分析
if (require.main === module) {
  runComprehensiveAnalysis();
}

module.exports = { runComprehensiveAnalysis, analysisResults };
