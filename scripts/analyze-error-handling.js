#!/usr/bin/env node

/**
 * 错误处理和日志记录分析脚本
 * 🔧 P1-2: 分析系统错误处理和日志记录状况
 * 
 * 分析内容：
 * 1. 错误处理模式和覆盖率
 * 2. 日志记录质量和一致性
 * 3. 异常处理的完整性
 * 4. 错误监控和告警机制
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔧 开始分析错误处理和日志记录...\n');

const analysis = {
  files: [],
  errorHandling: {
    tryBlocks: 0,
    catchBlocks: 0,
    finallyBlocks: 0,
    throwStatements: 0,
    errorTypes: new Set(),
    unhandledPromises: 0
  },
  logging: {
    consoleLog: 0,
    consoleError: 0,
    consoleWarn: 0,
    consoleInfo: 0,
    consoleDebug: 0,
    logLevels: new Set(),
    logContexts: new Set()
  },
  patterns: {
    goodPatterns: [],
    antiPatterns: [],
    missingErrorHandling: [],
    inconsistentLogging: []
  },
  recommendations: []
};

// 错误处理模式
const errorPatterns = {
  good: [
    /try\s*{[\s\S]*?}\s*catch\s*\([^)]*\)\s*{[\s\S]*?console\.error/,
    /catch\s*\([^)]*\)\s*{[\s\S]*?throw new Error/,
    /Promise\.catch\(\([^)]*\)\s*=>\s*{[\s\S]*?console\.error/,
    /async\s+function[\s\S]*?try[\s\S]*?catch/
  ],
  anti: [
    /catch\s*\([^)]*\)\s*{\s*}/,  // 空catch块
    /catch\s*\([^)]*\)\s*{\s*console\.log/,  // 用console.log记录错误
    /Promise\.catch\(\(\)\s*=>\s*{\s*}\)/,  // 空Promise catch
    /throw\s+['"`][^'"`]*['"`]/  // 抛出字符串而非Error对象
  ]
};

// 日志模式
const logPatterns = {
  good: [
    /console\.error\(['"`][^'"`]*['"`],\s*[^)]+\)/,  // 错误日志with context
    /console\.warn\(['"`]⚠️[^'"`]*['"`]/,  // 带emoji的警告
    /console\.log\(['"`][🎯🔐🔒✅❌🔄][^'"`]*['"`]/  // 带分类emoji的日志
  ],
  problematic: [
    /console\.log\(\)/,  // 空日志
    /console\.log\(['"`]\s*['"`]\)/,  // 空字符串日志
    /console\.log\([^,)]*\)$/  // 没有上下文的简单日志
  ]
};

/**
 * 分析单个文件
 */
async function analyzeFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(projectRoot, filePath);
    
    const fileAnalysis = {
      path: relativePath,
      errorHandling: {
        tryBlocks: 0,
        catchBlocks: 0,
        hasErrorHandling: false,
        goodPatterns: 0,
        antiPatterns: 0
      },
      logging: {
        totalLogs: 0,
        logTypes: {},
        hasStructuredLogs: false,
        inconsistencies: []
      },
      issues: []
    };

    // 分析错误处理
    analyzeErrorHandling(content, fileAnalysis);
    
    // 分析日志记录
    analyzeLogging(content, fileAnalysis);
    
    // 检查特定问题
    checkSpecificIssues(content, fileAnalysis);
    
    analysis.files.push(fileAnalysis);
    return fileAnalysis;
    
  } catch (error) {
    console.error(`❌ 分析文件失败 ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 分析错误处理
 */
function analyzeErrorHandling(content, fileAnalysis) {
  // Try-catch块
  const tryMatches = content.match(/try\s*{/g) || [];
  const catchMatches = content.match(/catch\s*\(/g) || [];
  const finallyMatches = content.match(/finally\s*{/g) || [];
  const throwMatches = content.match(/throw\s+/g) || [];
  
  fileAnalysis.errorHandling.tryBlocks = tryMatches.length;
  fileAnalysis.errorHandling.catchBlocks = catchMatches.length;
  analysis.errorHandling.tryBlocks += tryMatches.length;
  analysis.errorHandling.catchBlocks += catchMatches.length;
  analysis.errorHandling.finallyBlocks += finallyMatches.length;
  analysis.errorHandling.throwStatements += throwMatches.length;
  
  // 检查好的错误处理模式
  errorPatterns.good.forEach(pattern => {
    if (pattern.test(content)) {
      fileAnalysis.errorHandling.goodPatterns++;
    }
  });
  
  // 检查反模式
  errorPatterns.anti.forEach(pattern => {
    if (pattern.test(content)) {
      fileAnalysis.errorHandling.antiPatterns++;
      fileAnalysis.issues.push('发现错误处理反模式');
    }
  });
  
  // 检查未处理的Promise
  const asyncFunctions = content.match(/async\s+function|async\s+\w+\s*=>/g) || [];
  const awaitWithoutTry = content.match(/await\s+[^;]*(?!.*try)/g) || [];
  if (awaitWithoutTry.length > asyncFunctions.length) {
    analysis.errorHandling.unhandledPromises += awaitWithoutTry.length - asyncFunctions.length;
    fileAnalysis.issues.push('可能存在未处理的Promise rejection');
  }
  
  fileAnalysis.errorHandling.hasErrorHandling = 
    fileAnalysis.errorHandling.tryBlocks > 0 || fileAnalysis.errorHandling.goodPatterns > 0;
}

/**
 * 分析日志记录
 */
function analyzeLogging(content, fileAnalysis) {
  const logTypes = ['log', 'error', 'warn', 'info', 'debug'];
  
  logTypes.forEach(type => {
    const matches = content.match(new RegExp(`console\\.${type}\\(`, 'g')) || [];
    fileAnalysis.logging.logTypes[type] = matches.length;
    fileAnalysis.logging.totalLogs += matches.length;
    analysis.logging[`console${type.charAt(0).toUpperCase() + type.slice(1)}`] += matches.length;
  });
  
  // 检查结构化日志
  const structuredLogPatterns = [
    /console\.\w+\(['"`][^'"`]*['"`],\s*{/,  // 带对象的日志
    /console\.\w+\(['"`][🎯🔐🔒✅❌🔄⚠️]/  // 带emoji分类的日志
  ];
  
  fileAnalysis.logging.hasStructuredLogs = structuredLogPatterns.some(pattern => 
    pattern.test(content)
  );
  
  // 检查日志一致性
  checkLoggingConsistency(content, fileAnalysis);
}

/**
 * 检查日志一致性
 */
function checkLoggingConsistency(content, fileAnalysis) {
  const lines = content.split('\n');
  const logLines = lines.filter(line => /console\.\w+\(/.test(line));
  
  if (logLines.length === 0) return;
  
  // 检查错误日志是否使用console.error
  const errorContextLines = lines.filter(line => 
    /错误|失败|error|Error|Exception/.test(line) && /console\./.test(line)
  );
  
  const incorrectErrorLogs = errorContextLines.filter(line => 
    !/console\.error/.test(line)
  );
  
  if (incorrectErrorLogs.length > 0) {
    fileAnalysis.logging.inconsistencies.push('错误信息未使用console.error记录');
  }
  
  // 检查是否有无意义的日志
  const emptyLogs = logLines.filter(line => 
    /console\.\w+\(\s*['"`]\s*['"`]\s*\)/.test(line)
  );
  
  if (emptyLogs.length > 0) {
    fileAnalysis.logging.inconsistencies.push('发现空白或无意义的日志');
  }
}

/**
 * 检查特定问题
 */
function checkSpecificIssues(content, fileAnalysis) {
  // 检查是否有异步函数但缺少错误处理
  const asyncFuncRegex = /async\s+function\s+\w+|async\s+\w+\s*=>/g;
  const asyncFuncs = content.match(asyncFuncRegex) || [];
  
  if (asyncFuncs.length > 0 && fileAnalysis.errorHandling.tryBlocks === 0) {
    fileAnalysis.issues.push('异步函数缺少错误处理');
    analysis.patterns.missingErrorHandling.push(fileAnalysis.path);
  }
  
  // 检查是否有网络请求但缺少错误处理
  const networkPatterns = [
    /fetch\(/,
    /axios\./,
    /\.get\(|\.post\(|\.put\(|\.delete\(/
  ];
  
  const hasNetworkCalls = networkPatterns.some(pattern => pattern.test(content));
  if (hasNetworkCalls && fileAnalysis.errorHandling.tryBlocks === 0) {
    fileAnalysis.issues.push('网络请求缺少错误处理');
  }
  
  // 检查是否有文件操作但缺少错误处理
  const filePatterns = [
    /fs\.\w+/,
    /readFile|writeFile|mkdir|rmdir/
  ];
  
  const hasFileOps = filePatterns.some(pattern => pattern.test(content));
  if (hasFileOps && fileAnalysis.errorHandling.tryBlocks === 0) {
    fileAnalysis.issues.push('文件操作缺少错误处理');
  }
}

/**
 * 生成改进建议
 */
function generateRecommendations() {
  const recommendations = [];
  
  // 错误处理建议
  if (analysis.errorHandling.catchBlocks < analysis.errorHandling.tryBlocks) {
    recommendations.push({
      type: 'CRITICAL',
      category: 'Error Handling',
      title: '补充缺失的错误处理',
      description: `发现${analysis.errorHandling.tryBlocks - analysis.errorHandling.catchBlocks}个try块缺少对应的catch处理`,
      actions: [
        '为所有try块添加适当的catch处理',
        '确保错误信息记录完整的上下文',
        '实现优雅的错误降级机制',
        '添加用户友好的错误提示'
      ]
    });
  }
  
  if (analysis.errorHandling.unhandledPromises > 0) {
    recommendations.push({
      type: 'HIGH',
      category: 'Async Error Handling',
      title: '处理未捕获的Promise rejection',
      description: `发现${analysis.errorHandling.unhandledPromises}个可能未处理的Promise`,
      actions: [
        '为所有异步操作添加错误处理',
        '使用try-catch包装await调用',
        '添加全局unhandledRejection监听器',
        '实现Promise错误追踪机制'
      ]
    });
  }
  
  // 日志记录建议
  const totalLogs = Object.values(analysis.logging).reduce((sum, val) => 
    typeof val === 'number' ? sum + val : sum, 0
  );
  
  if (analysis.logging.consoleError < totalLogs * 0.1) {
    recommendations.push({
      type: 'MEDIUM',
      category: 'Logging',
      title: '改善错误日志记录',
      description: '错误日志比例过低，可能导致问题难以追踪',
      actions: [
        '增加关键操作的错误日志',
        '使用console.error记录所有异常',
        '添加错误码和分类信息',
        '实现日志级别管理'
      ]
    });
  }
  
  if (analysis.patterns.missingErrorHandling.length > 0) {
    recommendations.push({
      type: 'HIGH',
      category: 'Error Coverage',
      title: '提升错误处理覆盖率',
      description: `${analysis.patterns.missingErrorHandling.length}个文件缺少关键错误处理`,
      actions: [
        '为所有异步函数添加错误处理',
        '实现网络请求的统一错误处理',
        '添加文件操作的异常捕获',
        '建立错误处理的代码规范'
      ]
    });
  }
  
  // 监控和观测性建议
  recommendations.push({
    type: 'MEDIUM',
    category: 'Observability',
    title: '建立错误监控和告警系统',
    description: '缺少系统化的错误监控和告警机制',
    actions: [
      '集成错误追踪服务（如Sentry）',
      '实现结构化日志记录',
      '建立关键指标监控',
      '配置错误告警和通知'
    ]
  });
  
  return recommendations;
}

/**
 * 扫描项目文件
 */
async function scanProject() {
  const targetDirs = ['src', 'netlify/functions'];
  const files = [];
  
  for (const dir of targetDirs) {
    const dirPath = path.join(projectRoot, dir);
    try {
      await addFilesRecursively(dirPath, files);
    } catch (error) {
      console.warn(`⚠️ 无法扫描目录 ${dir}:`, error.message);
    }
  }
  
  return files.filter(file => 
    /\.(ts|tsx|js|jsx)$/.test(file) && 
    !file.includes('.test.') && 
    !file.includes('.spec.') &&
    !file.includes('node_modules')
  );
}

async function addFilesRecursively(dirPath, files) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      await addFilesRecursively(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
}

/**
 * 打印分析报告
 */
function printAnalysisReport(recommendations) {
  console.log('\n🔧 错误处理和日志记录分析报告');
  console.log('='.repeat(60));
  
  // 基础统计
  console.log(`\n📊 基础统计:`);
  console.log(`📁 分析文件数: ${analysis.files.length}`);
  console.log(`🔧 Try块数量: ${analysis.errorHandling.tryBlocks}`);
  console.log(`⚠️ Catch块数量: ${analysis.errorHandling.catchBlocks}`);
  console.log(`🚨 Throw语句: ${analysis.errorHandling.throwStatements}`);
  console.log(`💔 未处理Promise: ${analysis.errorHandling.unhandledPromises}`);
  
  // 日志统计
  console.log(`\n📝 日志记录统计:`);
  console.log(`🔍 console.log: ${analysis.logging.consoleLog}`);
  console.log(`❌ console.error: ${analysis.logging.consoleError}`);
  console.log(`⚠️ console.warn: ${analysis.logging.consoleWarn}`);
  console.log(`ℹ️ console.info: ${analysis.logging.consoleInfo}`);
  console.log(`🐛 console.debug: ${analysis.logging.consoleDebug}`);
  
  // 问题文件
  const problemFiles = analysis.files.filter(file => file.issues.length > 0);
  if (problemFiles.length > 0) {
    console.log(`\n🚨 发现问题的文件 (${problemFiles.length}个):`);
    problemFiles.forEach(file => {
      console.log(`  📄 ${file.path}`);
      file.issues.forEach(issue => {
        console.log(`     • ${issue}`);
      });
    });
  }
  
  // 错误处理覆盖率
  const filesWithErrorHandling = analysis.files.filter(file => 
    file.errorHandling.hasErrorHandling
  ).length;
  const errorHandlingCoverage = Math.round(filesWithErrorHandling / analysis.files.length * 100);
  
  console.log(`\n📈 错误处理覆盖率: ${errorHandlingCoverage}%`);
  
  // 日志质量评估
  const totalLogs = Object.values(analysis.logging).reduce((sum, val) => 
    typeof val === 'number' ? sum + val : sum, 0
  );
  const errorLogRatio = Math.round(analysis.logging.consoleError / totalLogs * 100);
  
  console.log(`📊 错误日志比例: ${errorLogRatio}%`);
  
  // 改进建议
  if (recommendations.length > 0) {
    console.log(`\n💡 改进建议:`);
    recommendations.forEach((rec, index) => {
      const emoji = rec.type === 'CRITICAL' ? '🚨' : rec.type === 'HIGH' ? '⚠️' : '💡';
      console.log(`\n  ${index + 1}. ${emoji} ${rec.title} [${rec.type}]`);
      console.log(`     类别: ${rec.category}`);
      console.log(`     描述: ${rec.description}`);
      console.log(`     建议措施:`);
      rec.actions.forEach(action => {
        console.log(`       • ${action}`);
      });
    });
  }
  
  // 总体评估
  console.log(`\n🎯 总体评估:`);
  let score = 100;
  
  if (errorHandlingCoverage < 80) {
    score -= (80 - errorHandlingCoverage);
    console.log(`❌ 错误处理覆盖率不足: -${80 - errorHandlingCoverage}分`);
  }
  
  if (analysis.errorHandling.unhandledPromises > 0) {
    score -= Math.min(analysis.errorHandling.unhandledPromises * 5, 20);
    console.log(`⚠️ 未处理Promise: -${Math.min(analysis.errorHandling.unhandledPromises * 5, 20)}分`);
  }
  
  if (errorLogRatio < 10) {
    score -= (10 - errorLogRatio);
    console.log(`📊 错误日志比例过低: -${10 - errorLogRatio}分`);
  }
  
  if (problemFiles.length > analysis.files.length * 0.1) {
    score -= Math.round((problemFiles.length / analysis.files.length - 0.1) * 100);
    console.log(`🚨 问题文件过多: -${Math.round((problemFiles.length / analysis.files.length - 0.1) * 100)}分`);
  }
  
  score = Math.max(0, score);
  
  console.log(`\n🏆 错误处理质量评分: ${score}/100`);
  
  if (score >= 90) {
    console.log('✅ 错误处理质量优秀，继续保持');
  } else if (score >= 70) {
    console.log('⚠️ 错误处理质量良好，有改进空间');
  } else if (score >= 50) {
    console.log('🚨 错误处理质量一般，需要重点改进');
  } else {
    console.log('🚨 错误处理质量较差，需要立即改进');
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🔍 扫描项目文件...');
    const files = await scanProject();
    console.log(`📁 发现${files.length}个文件`);
    
    console.log('🔧 分析错误处理和日志记录...');
    let processedCount = 0;
    
    for (const file of files) {
      await analyzeFile(file);
      processedCount++;
      
      if (processedCount % 20 === 0) {
        console.log(`📊 已处理 ${processedCount}/${files.length} 个文件...`);
      }
    }
    
    console.log('💡 生成改进建议...');
    const recommendations = generateRecommendations();
    
    printAnalysisReport(recommendations);
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
    process.exit(1);
  }
}

main();