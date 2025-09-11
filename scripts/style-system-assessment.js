#!/usr/bin/env node

/**
 * 样式系统全面盘点与分析工具
 * 生成样式体系冲突地图和治理建议
 */

const fs = require('fs');
const path = require('path');

// 分析结果存储
const assessmentResults = {
  cssVariables: {
    definitions: [],
    usages: [],
    conflicts: []
  },
  tailwindUsage: {
    hardcodedColors: [],
    hardcodedSizes: [],
    semanticClasses: [],
    customClasses: []
  },
  radixComponents: {
    components: [],
    styleOverrides: [],
    conflicts: []
  },
  inlineStyles: {
    positioning: [],
    colors: [],
    sizes: [],
    others: []
  },
  conflicts: {
    high: [],
    medium: [],
    low: []
  },
  statistics: {
    totalFiles: 0,
    totalLines: 0,
    cssFiles: 0,
    componentFiles: 0
  }
};

// 检测模式
const PATTERNS = {
  cssVariables: {
    definition: /:root\s*\{[^}]*--[^}]*\}/gs,
    usage: /var\(--[^)]+\)/g,
    hslVar: /hsl\(var\(--[^)]+\)\)/g
  },
  tailwind: {
    hardcodedColors: /(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g,
    hardcodedSizes: /(?:w|h|p|m|gap|space)-\d+/g,
    semanticClasses: /(?:bg|text|border)-(?:primary|secondary|accent|muted|destructive|background|foreground|card)/g
  },
  radix: {
    imports: /import.*from\s+['"]@radix-ui\/[^'"]+['"]/g,
    components: /<[A-Z][a-zA-Z]*\./g
  },
  inline: {
    styles: /style\s*=\s*\{\{([^}]+)\}\}/g,
    positioning: /(?:position|top|left|right|bottom|transform|translate|z-index):\s*[^,}]+/g,
    colors: /(?:background|color|border-color):\s*(?:#[0-9a-fA-F]+|rgb|hsl)/g
  }
};

/**
 * 获取所有需要分析的文件
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
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法扫描目录: ${currentDir}`);
    }
  }
  
  scanDirectory(dir);
  return files;
}

/**
 * 分析CSS变量
 */
function analyzeCSSVariables(filePath, content) {
  // 分析变量定义
  const definitions = [...content.matchAll(PATTERNS.cssVariables.definition)];
  definitions.forEach(match => {
    const block = match[0];
    const variables = [...block.matchAll(/--([^:]+):\s*([^;]+);/g)];
    
    variables.forEach(varMatch => {
      assessmentResults.cssVariables.definitions.push({
        file: filePath,
        name: `--${varMatch[1].trim()}`,
        value: varMatch[2].trim(),
        context: block.includes('[data-theme') ? 'theme' : 'global'
      });
    });
  });
  
  // 分析变量使用
  const usages = [...content.matchAll(PATTERNS.cssVariables.usage)];
  usages.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    assessmentResults.cssVariables.usages.push({
      file: filePath,
      line: lineNumber,
      variable: match[0],
      context: 'usage'
    });
  });
}

/**
 * 分析Tailwind使用
 */
function analyzeTailwindUsage(filePath, content) {
  // 硬编码颜色
  const hardcodedColors = [...content.matchAll(PATTERNS.tailwind.hardcodedColors)];
  hardcodedColors.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    assessmentResults.tailwindUsage.hardcodedColors.push({
      file: filePath,
      line: lineNumber,
      class: match[0],
      severity: 'high',
      suggestion: '使用语义化颜色类如 bg-primary, text-foreground'
    });
  });
  
  // 硬编码尺寸
  const hardcodedSizes = [...content.matchAll(PATTERNS.tailwind.hardcodedSizes)];
  hardcodedSizes.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    // 跳过一些常见的合理使用
    if (!['w-4', 'h-4', 'w-6', 'h-6', 'p-0', 'm-0'].includes(match[0])) {
      assessmentResults.tailwindUsage.hardcodedSizes.push({
        file: filePath,
        line: lineNumber,
        class: match[0],
        severity: 'medium',
        suggestion: '考虑使用设计令牌或语义化尺寸'
      });
    }
  });
  
  // 语义化类
  const semanticClasses = [...content.matchAll(PATTERNS.tailwind.semanticClasses)];
  semanticClasses.forEach(match => {
    assessmentResults.tailwindUsage.semanticClasses.push({
      file: filePath,
      class: match[0],
      type: 'good-practice'
    });
  });
}

/**
 * 分析Radix组件使用
 */
function analyzeRadixUsage(filePath, content) {
  // Radix导入
  const imports = [...content.matchAll(PATTERNS.radix.imports)];
  imports.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    assessmentResults.radixComponents.components.push({
      file: filePath,
      line: lineNumber,
      import: match[0],
      package: match[0].match(/@radix-ui\/([^'"]+)/)?.[1] || 'unknown'
    });
  });
}

/**
 * 分析内联样式
 */
function analyzeInlineStyles(filePath, content) {
  const inlineStyles = [...content.matchAll(PATTERNS.inline.styles)];
  
  inlineStyles.forEach(match => {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const styleContent = match[1];
    
    // 检查定位样式
    if (PATTERNS.inline.positioning.test(styleContent)) {
      assessmentResults.inlineStyles.positioning.push({
        file: filePath,
        line: lineNumber,
        content: styleContent,
        severity: 'high',
        suggestion: '使用CSS类或Tailwind工具类替代内联定位样式'
      });
    }
    
    // 检查颜色样式
    if (PATTERNS.inline.colors.test(styleContent)) {
      assessmentResults.inlineStyles.colors.push({
        file: filePath,
        line: lineNumber,
        content: styleContent,
        severity: 'medium',
        suggestion: '使用设计令牌或Tailwind颜色类'
      });
    }
  });
}

/**
 * 检测样式冲突
 */
function detectConflicts() {
  // 检测CSS变量重复定义
  const variableGroups = {};
  assessmentResults.cssVariables.definitions.forEach(def => {
    if (!variableGroups[def.name]) {
      variableGroups[def.name] = [];
    }
    variableGroups[def.name].push(def);
  });
  
  Object.entries(variableGroups).forEach(([name, definitions]) => {
    if (definitions.length > 1) {
      assessmentResults.conflicts.medium.push({
        type: 'css-variable-conflict',
        variable: name,
        definitions: definitions,
        severity: 'medium',
        message: `CSS变量 ${name} 在多个位置定义`,
        suggestion: '统一变量定义位置，避免重复定义'
      });
    }
  });
  
  // 检测混合样式系统使用
  assessmentResults.tailwindUsage.hardcodedColors.forEach(item => {
    assessmentResults.conflicts.high.push({
      type: 'hardcoded-tailwind-color',
      file: item.file,
      line: item.line,
      class: item.class,
      severity: 'high',
      message: '使用硬编码Tailwind颜色类',
      suggestion: item.suggestion
    });
  });
  
  assessmentResults.inlineStyles.positioning.forEach(item => {
    assessmentResults.conflicts.high.push({
      type: 'inline-positioning',
      file: item.file,
      line: item.line,
      content: item.content,
      severity: 'high',
      message: '使用内联定位样式',
      suggestion: item.suggestion
    });
  });
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    assessmentResults.statistics.totalFiles++;
    assessmentResults.statistics.totalLines += lines.length;
    
    if (path.extname(filePath) === '.css') {
      assessmentResults.statistics.cssFiles++;
    } else {
      assessmentResults.statistics.componentFiles++;
    }
    
    // 执行各种分析
    analyzeCSSVariables(filePath, content);
    analyzeTailwindUsage(filePath, content);
    analyzeRadixUsage(filePath, content);
    analyzeInlineStyles(filePath, content);
    
  } catch (error) {
    console.warn(`❌ 无法分析文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 生成冲突地图报告
 */
function generateConflictMap() {
  console.log('\n📊 样式体系冲突地图');
  console.log('='.repeat(60));
  
  // 统计表格
  const conflictTable = [
    ['样式来源', '覆盖范围', '冲突类型', '优先级', '修复难度'],
    ['CSS变量', `${assessmentResults.cssVariables.definitions.length}个定义`, '重复定义', '中', '低'],
    ['Tailwind硬编码', `${assessmentResults.tailwindUsage.hardcodedColors.length}个颜色类`, '语义冲突', '高', '中'],
    ['内联样式', `${assessmentResults.inlineStyles.positioning.length}个定位样式`, '优先级冲突', '高', '高'],
    ['Radix组件', `${assessmentResults.radixComponents.components.length}个组件`, '默认样式冲突', '中', '中']
  ];
  
  conflictTable.forEach((row, index) => {
    if (index === 0) {
      console.log(`| ${row.join(' | ')} |`);
      console.log(`|${row.map(() => '---').join('|')}|`);
    } else {
      console.log(`| ${row.join(' | ')} |`);
    }
  });
  
  // 高风险区域
  console.log('\n🚨 高风险区域:');
  const highRiskFiles = new Set();
  
  assessmentResults.conflicts.high.forEach(conflict => {
    if (conflict.file) {
      highRiskFiles.add(conflict.file);
    }
  });
  
  Array.from(highRiskFiles).slice(0, 10).forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  
  if (highRiskFiles.size > 10) {
    console.log(`  ... 还有 ${highRiskFiles.size - 10} 个文件`);
  }
}

/**
 * 生成详细报告
 */
function generateDetailedReport() {
  console.log('\n📋 详细分析报告');
  console.log('='.repeat(60));
  
  console.log(`📁 扫描文件: ${assessmentResults.statistics.totalFiles} 个`);
  console.log(`📄 代码行数: ${assessmentResults.statistics.totalLines.toLocaleString()} 行`);
  console.log(`🎨 CSS文件: ${assessmentResults.statistics.cssFiles} 个`);
  console.log(`⚛️ 组件文件: ${assessmentResults.statistics.componentFiles} 个`);
  
  console.log('\n🎯 CSS变量分析:');
  console.log(`  - 变量定义: ${assessmentResults.cssVariables.definitions.length} 个`);
  console.log(`  - 变量使用: ${assessmentResults.cssVariables.usages.length} 次`);
  
  console.log('\n🎨 Tailwind使用分析:');
  console.log(`  - 硬编码颜色: ${assessmentResults.tailwindUsage.hardcodedColors.length} 个`);
  console.log(`  - 硬编码尺寸: ${assessmentResults.tailwindUsage.hardcodedSizes.length} 个`);
  console.log(`  - 语义化类: ${assessmentResults.tailwindUsage.semanticClasses.length} 个`);
  
  console.log('\n⚛️ Radix组件分析:');
  console.log(`  - 组件导入: ${assessmentResults.radixComponents.components.length} 个`);
  
  console.log('\n🚨 冲突统计:');
  console.log(`  - 高优先级: ${assessmentResults.conflicts.high.length} 个`);
  console.log(`  - 中优先级: ${assessmentResults.conflicts.medium.length} 个`);
  console.log(`  - 低优先级: ${assessmentResults.conflicts.low.length} 个`);
}

/**
 * 主执行函数
 */
function runAssessment() {
  console.log('🔍 开始样式系统全面盘点...');
  
  const files = getAllFiles('./src');
  console.log(`📁 找到 ${files.length} 个文件`);
  
  // 分析所有文件
  files.forEach((file, index) => {
    if (index % 50 === 0) {
      console.log(`📊 分析进度: ${index}/${files.length} (${Math.round(index/files.length*100)}%)`);
    }
    analyzeFile(file);
  });
  
  // 检测冲突
  detectConflicts();
  
  // 生成报告
  generateDetailedReport();
  generateConflictMap();
  
  // 保存结果到文件
  fs.writeFileSync(
    'style-system-assessment.json',
    JSON.stringify(assessmentResults, null, 2)
  );
  
  console.log('\n✅ 分析完成！结果已保存到 style-system-assessment.json');
  
  // 返回退出码
  const hasHighPriorityIssues = assessmentResults.conflicts.high.length > 0;
  process.exit(hasHighPriorityIssues ? 1 : 0);
}

// 运行分析
if (require.main === module) {
  runAssessment();
}

module.exports = { runAssessment, assessmentResults };
