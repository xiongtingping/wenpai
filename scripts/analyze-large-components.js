#!/usr/bin/env node
/**
 * 🔍 超大组件分析工具
 * 
 * 🎯 目标：
 * - 识别项目中的超大组件文件
 * - 分析组件复杂度和职责
 * - 检测代码耦合度和可维护性问题
 * - 提供组件拆分建议
 * 
 * 📌 遵循CLAUDE.md规则：避免技术债务，提升可维护性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出
const colors = {
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`, 
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`,
  dim: (str) => `\x1b[2m${str}\x1b[0m`
};

// 分析结果
const analysisResults = {
  largeComponents: [],
  totalFiles: 0,
  totalLines: 0,
  averageSize: 0,
  issues: []
};

/**
 * 分析单个文件的复杂度
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // 基础统计
    const lineCount = lines.length;
    const isEmpty = lines.filter(line => line.trim().length > 0).length;
    
    // 复杂度指标
    const functionCount = (content.match(/function\s+\w+|const\s+\w+\s*=\s*\(|=>/g) || []).length;
    const componentCount = (content.match(/export\s+(default\s+)?function|export\s+const\s+\w+\s*=|function\s+\w+Component/g) || []).length;
    const hookCount = (content.match(/use[A-Z]\w+/g) || []).length;
    const jsxElementCount = (content.match(/<[A-Z]\w*|<div|<span|<p\b|<button|<input|<form/g) || []).length;
    const importCount = (content.match(/^import\s+/gm) || []).length;
    const stateCount = (content.match(/useState|useReducer|useRef/g) || []).length;
    const effectCount = (content.match(/useEffect|useLayoutEffect|useMemo|useCallback/g) || []).length;
    
    // 代码复杂度分析
    const cyclomaticComplexity = calculateCyclomaticComplexity(content);
    const nestingDepth = calculateNestingDepth(content);
    const duplicateCodeScore = calculateDuplicateCode(content);
    
    // 职责分析
    const responsibilities = analyzeResponsibilities(content);
    
    // 依赖分析
    const dependencies = analyzeDependencies(content);
    
    return {
      filePath: relativePath,
      fullPath: filePath,
      lineCount,
      emptyLines: lineCount - isEmpty,
      functionCount,
      componentCount,
      hookCount,
      jsxElementCount,
      importCount,
      stateCount,
      effectCount,
      cyclomaticComplexity,
      nestingDepth,
      duplicateCodeScore,
      responsibilities,
      dependencies,
      issues: identifyIssues({
        lineCount,
        functionCount,
        cyclomaticComplexity,
        nestingDepth,
        responsibilities,
        dependencies
      })
    };
  } catch (error) {
    return null;
  }
}

/**
 * 计算圈复杂度
 */
function calculateCyclomaticComplexity(content) {
  const controlStructures = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bwhile\s*\(/g,
    /\bfor\s*\(/g,
    /\bdo\s+{/g,
    /\bswitch\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?.*:/g  // 三元运算符
  ];
  
  let complexity = 1; // 基础复杂度
  controlStructures.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      complexity += matches.length;
    }
  });
  
  return complexity;
}

/**
 * 计算嵌套深度
 */
function calculateNestingDepth(content) {
  const lines = content.split('\n');
  let maxDepth = 0;
  let currentDepth = 0;
  
  lines.forEach(line => {
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    
    currentDepth += openBraces - closeBraces + openParens - closeParens;
    maxDepth = Math.max(maxDepth, currentDepth);
  });
  
  return maxDepth;
}

/**
 * 检测重复代码
 */
function calculateDuplicateCode(content) {
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 10); // 过滤短行
  
  const lineMap = {};
  let duplicates = 0;
  
  lines.forEach(line => {
    if (lineMap[line]) {
      duplicates++;
    } else {
      lineMap[line] = true;
    }
  });
  
  return Math.round((duplicates / lines.length) * 100) || 0;
}

/**
 * 分析组件职责
 */
function analyzeResponsibilities(content) {
  const responsibilities = [];
  
  // 数据管理
  if (content.match(/useState|useReducer|useContext/g)) {
    responsibilities.push('状态管理');
  }
  
  // API调用
  if (content.match(/fetch|axios|api\w*\(/g)) {
    responsibilities.push('API调用');
  }
  
  // 路由管理
  if (content.match(/useNavigate|useRouter|Link\s+to/g)) {
    responsibilities.push('路由管理');
  }
  
  // 表单处理
  if (content.match(/onSubmit|useForm|formData/g)) {
    responsibilities.push('表单处理');
  }
  
  // UI渲染
  if (content.match(/<\w+.*>|return\s*\(/g)) {
    responsibilities.push('UI渲染');
  }
  
  // 业务逻辑
  if (content.match(/calculate|validate|process|handle\w+/g)) {
    responsibilities.push('业务逻辑');
  }
  
  // 数据存储
  if (content.match(/localStorage|sessionStorage|indexedDB/g)) {
    responsibilities.push('数据存储');
  }
  
  // 权限控制
  if (content.match(/permission|auth|role|access/gi)) {
    responsibilities.push('权限控制');
  }
  
  return responsibilities;
}

/**
 * 分析依赖关系
 */
function analyzeDependencies(content) {
  const imports = content.match(/^import.*from\s+['"]([^'"]+)['"]/gm) || [];
  const dependencies = {
    external: [], // 外部包
    internal: [], // 内部模块
    ui: [],       // UI组件
    hooks: [],    // React Hooks
    utilities: [] // 工具函数
  };
  
  imports.forEach(importStatement => {
    const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      const dep = match[1];
      
      if (dep.startsWith('@/components/ui')) {
        dependencies.ui.push(dep);
      } else if (dep.startsWith('@/hooks')) {
        dependencies.hooks.push(dep);
      } else if (dep.startsWith('@/utils') || dep.startsWith('@/lib')) {
        dependencies.utilities.push(dep);
      } else if (dep.startsWith('@/')) {
        dependencies.internal.push(dep);
      } else {
        dependencies.external.push(dep);
      }
    }
  });
  
  return dependencies;
}

/**
 * 识别组件问题
 */
function identifyIssues(metrics) {
  const issues = [];
  
  // 文件过大
  if (metrics.lineCount > 1000) {
    issues.push({
      type: 'size',
      severity: 'high',
      message: `文件过大 (${metrics.lineCount} 行)，建议拆分`
    });
  } else if (metrics.lineCount > 500) {
    issues.push({
      type: 'size', 
      severity: 'medium',
      message: `文件偏大 (${metrics.lineCount} 行)，考虑重构`
    });
  }
  
  // 函数过多
  if (metrics.functionCount > 50) {
    issues.push({
      type: 'complexity',
      severity: 'high',
      message: `函数过多 (${metrics.functionCount} 个)，职责不清晰`
    });
  }
  
  // 圈复杂度过高
  if (metrics.cyclomaticComplexity > 20) {
    issues.push({
      type: 'complexity',
      severity: 'high',
      message: `圈复杂度过高 (${metrics.cyclomaticComplexity})，难以测试和维护`
    });
  }
  
  // 嵌套过深
  if (metrics.nestingDepth > 10) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: `嵌套层次过深 (${metrics.nestingDepth})，影响可读性`
    });
  }
  
  // 职责过多
  if (metrics.responsibilities.length > 4) {
    issues.push({
      type: 'responsibility',
      severity: 'high',
      message: `职责过多 (${metrics.responsibilities.length} 个)，违反单一职责原则`
    });
  }
  
  // 依赖过多
  const totalDeps = Object.values(metrics.dependencies).reduce((sum, deps) => sum + deps.length, 0);
  if (totalDeps > 20) {
    issues.push({
      type: 'dependency',
      severity: 'medium',
      message: `依赖过多 (${totalDeps} 个)，耦合度过高`
    });
  }
  
  return issues;
}

/**
 * 扫描所有组件文件
 */
function scanComponents() {
  const srcDir = path.join(process.cwd(), 'src');
  const componentFiles = [];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist'].includes(item)) {
          scanDirectory(fullPath);
        } else if (item.match(/\.(tsx|ts)$/) && !item.endsWith('.d.ts')) {
          componentFiles.push(fullPath);
        }
      });
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  scanDirectory(srcDir);
  return componentFiles;
}

/**
 * 生成拆分建议
 */
function generateSplitSuggestions(analysis) {
  const suggestions = [];
  
  // 基于职责的拆分建议
  if (analysis.responsibilities.length > 3) {
    suggestions.push({
      type: 'responsibility',
      title: '基于职责拆分',
      description: '将不同职责拆分为独立组件',
      responsibilities: analysis.responsibilities,
      estimatedComponents: Math.ceil(analysis.responsibilities.length / 2)
    });
  }
  
  // 基于功能的拆分建议
  if (analysis.functionCount > 30) {
    suggestions.push({
      type: 'function',
      title: '基于功能拆分',
      description: '将相关功能提取为自定义Hook或工具函数',
      estimatedExtractions: Math.floor(analysis.functionCount * 0.3)
    });
  }
  
  // 基于UI的拆分建议
  if (analysis.jsxElementCount > 50) {
    suggestions.push({
      type: 'ui',
      title: '基于UI拆分', 
      description: '将复杂UI结构拆分为子组件',
      estimatedSubComponents: Math.ceil(analysis.jsxElementCount / 20)
    });
  }
  
  return suggestions;
}

/**
 * 生成分析报告
 */
function generateReport() {
  console.log(colors.bold(colors.cyan('🔍 超大组件分析报告\n')));
  console.log('='.repeat(60));
  
  // 总览统计
  console.log(colors.bold('\n📊 项目总览:'));
  console.log(`📁 总文件数: ${analysisResults.totalFiles}`);
  console.log(`📝 总代码行数: ${analysisResults.totalLines.toLocaleString()}`);
  console.log(`📏 平均文件大小: ${Math.round(analysisResults.averageSize)} 行`);
  
  // 超大组件列表
  const largeComponents = analysisResults.largeComponents
    .filter(comp => comp.lineCount > 1000)
    .sort((a, b) => b.lineCount - a.lineCount);
  
  if (largeComponents.length > 0) {
    console.log(colors.bold(colors.red(`\n🚨 超大组件 (${largeComponents.length} 个):`)));
    
    largeComponents.forEach((comp, index) => {
      console.log(colors.bold(`\n${index + 1}. ${comp.filePath}`));
      console.log(`   📏 代码行数: ${colors.red(comp.lineCount)} 行`);
      console.log(`   🔧 函数数量: ${comp.functionCount} 个`);
      console.log(`   ⚙️  圈复杂度: ${comp.cyclomaticComplexity}`);
      console.log(`   🎯 职责范围: ${comp.responsibilities.join(', ')}`);
      console.log(`   📦 依赖数量: ${Object.values(comp.dependencies).reduce((sum, deps) => sum + deps.length, 0)} 个`);
      
      // 显示问题
      const criticalIssues = comp.issues.filter(issue => issue.severity === 'high');
      if (criticalIssues.length > 0) {
        console.log(`   ⚠️  严重问题: ${colors.red(criticalIssues.length)} 个`);
        criticalIssues.forEach(issue => {
          console.log(`     - ${issue.message}`);
        });
      }
    });
  }
  
  // 问题统计
  const allIssues = analysisResults.largeComponents.flatMap(comp => comp.issues);
  const issuesByType = {};
  const issuesBySeverity = { high: 0, medium: 0, low: 0 };
  
  allIssues.forEach(issue => {
    issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
    issuesBySeverity[issue.severity]++;
  });
  
  console.log(colors.bold('\n📋 问题统计:'));
  console.log(`🔴 严重问题: ${colors.red(issuesBySeverity.high)} 个`);
  console.log(`🟡 中等问题: ${colors.yellow(issuesBySeverity.medium)} 个`);
  console.log(`🔵 轻微问题: ${colors.blue(issuesBySeverity.low || 0)} 个`);
  
  console.log(colors.bold('\n📈 问题类型分布:'));
  Object.entries(issuesByType).forEach(([type, count]) => {
    const typeNames = {
      size: '文件大小',
      complexity: '复杂度',
      structure: '代码结构', 
      responsibility: '职责分离',
      dependency: '依赖管理'
    };
    console.log(`${typeNames[type] || type}: ${count} 个`);
  });
  
  // Top 5 需要重构的组件
  console.log(colors.bold(colors.red('\n🎯 急需重构的组件 (Top 5):')));
  
  const topComponents = analysisResults.largeComponents
    .sort((a, b) => {
      const scoreA = a.lineCount + a.functionCount * 10 + a.cyclomaticComplexity * 5;
      const scoreB = b.lineCount + b.functionCount * 10 + b.cyclomaticComplexity * 5;
      return scoreB - scoreA;
    })
    .slice(0, 5);
  
  topComponents.forEach((comp, index) => {
    console.log(`\n${index + 1}. ${colors.bold(comp.filePath)}`);
    
    // 拆分建议
    const suggestions = generateSplitSuggestions(comp);
    if (suggestions.length > 0) {
      console.log('   💡 拆分建议:');
      suggestions.forEach(suggestion => {
        console.log(`     📌 ${suggestion.title}: ${suggestion.description}`);
      });
    }
    
    // 优先级评估
    const priority = comp.lineCount > 2000 || comp.issues.some(i => i.severity === 'high') ? '🔥 紧急' : '⚡ 重要';
    console.log(`   🚩 重构优先级: ${priority}`);
  });
  
  // 重构建议
  console.log(colors.bold(colors.cyan('\n💡 重构策略建议:')));
  console.log('1. 🎯 优先重构超过2000行的超大组件');
  console.log('2. 📦 按职责拆分：将不同职责提取为独立组件');
  console.log('3. ⚙️  提取业务逻辑：将复杂逻辑提取为自定义Hook');
  console.log('4. 🧩 拆分UI结构：将复杂UI拆分为可复用的子组件');
  console.log('5. 🔧 优化依赖关系：减少不必要的依赖和耦合');
  console.log('6. 📝 添加类型定义：提高代码的类型安全性');
  console.log('7. 🧪 编写单元测试：确保重构过程的安全性');
  
  console.log(colors.bold('\n⚡ 立即行动计划:'));
  if (largeComponents.length > 0) {
    const top3 = largeComponents.slice(0, 3);
    top3.forEach((comp, index) => {
      console.log(`${index + 1}. 重构 ${colors.bold(comp.filePath)}`);
      console.log(`   - 目标：减少到 <500 行`);
      console.log(`   - 方法：${generateSplitSuggestions(comp).map(s => s.title).join('、')}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(colors.cyan('🔍 超大组件分析完成'));
  console.log(colors.cyan('📌 遵循 CLAUDE.md 规则：避免技术债务，提升可维护性'));
}

/**
 * 主函数
 */
function main() {
  console.log(colors.bold(colors.cyan('🔍 超大组件分析工具')));
  console.log(colors.cyan('📌 识别和分析项目中的超大组件\n'));
  
  try {
    const componentFiles = scanComponents();
    console.log(`📊 扫描到 ${componentFiles.length} 个组件文件...\n`);
    
    let totalLines = 0;
    const components = [];
    
    componentFiles.forEach((file, index) => {
      const analysis = analyzeFile(file);
      if (analysis) {
        components.push(analysis);
        totalLines += analysis.lineCount;
        
        // 显示进度
        if (index % 50 === 0) {
          console.log(`分析进度: ${index + 1}/${componentFiles.length}`);
        }
      }
    });
    
    analysisResults.largeComponents = components;
    analysisResults.totalFiles = components.length;
    analysisResults.totalLines = totalLines;
    analysisResults.averageSize = totalLines / components.length;
    
    generateReport();
    
    // 根据问题数量决定退出码
    const criticalIssues = components
      .flatMap(comp => comp.issues)
      .filter(issue => issue.severity === 'high').length;
    
    process.exit(criticalIssues > 10 ? 1 : 0);
    
  } catch (error) {
    console.error(colors.red('❌ 分析过程出现错误:'), error.message);
    process.exit(1);
  }
}

// 运行分析
if (import.meta.url === `file://${__filename}`) {
  main();
}