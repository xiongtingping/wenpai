#!/usr/bin/env node

/**
 * 代码风格和命名约定分析器
 * 🎨 P1-3: 统一代码风格和命名约定
 * 
 * 功能：
 * 1. 分析变量命名风格一致性
 * 2. 检查函数命名约定
 * 3. 文件命名规范检查
 * 4. 注释风格统一性
 * 5. 代码格式化一致性
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置选项
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  excludeDirs: ['node_modules', '.git', 'dist', 'build', '__tests__', 'test'],
  targetExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  maxFilesToAnalyze: 100
};

// 分析结果统计
const stats = {
  filesAnalyzed: 0,
  namingIssues: [],
  styleIssues: [],
  commentIssues: [],
  fileNamingIssues: [],
  overallScore: 0
};

// 命名约定规则
const NAMING_RULES = {
  // 变量和函数：camelCase
  variableFunction: {
    pattern: /^[a-z][a-zA-Z0-9]*$/,
    description: '变量和函数应使用camelCase'
  },
  
  // 常量：SCREAMING_SNAKE_CASE
  constant: {
    pattern: /^[A-Z][A-Z0-9_]*$/,
    description: '常量应使用SCREAMING_SNAKE_CASE'
  },
  
  // 类名和接口：PascalCase
  classsInterface: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: '类名和接口应使用PascalCase'
  },
  
  // 类型：PascalCase
  type: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: '类型定义应使用PascalCase'
  },
  
  // 枚举：PascalCase
  enum: {
    pattern: /^[A-Z][a-zA-Z0-9]*$/,
    description: '枚举应使用PascalCase'
  }
};

// 文件命名规则
const FILE_NAMING_RULES = {
  // 组件文件：PascalCase.tsx
  component: {
    pattern: /^[A-Z][a-zA-Z0-9]*\.(tsx|jsx)$/,
    description: 'React组件文件应使用PascalCase.tsx'
  },
  
  // 工具函数：camelCase.ts
  utility: {
    pattern: /^[a-z][a-zA-Z0-9]*\.ts$/,
    description: '工具函数文件应使用camelCase.ts'
  },
  
  // 服务文件：camelCase.ts
  service: {
    pattern: /^[a-z][a-zA-Z0-9]*Service\.ts$/,
    description: '服务文件应使用camelCaseService.ts'
  },
  
  // 类型定义：camelCase.ts或types.ts
  types: {
    pattern: /^(types|[a-z][a-zA-Z0-9]*Types)\.ts$/,
    description: '类型文件应使用types.ts或camelCaseTypes.ts'
  }
};

// 代码风格规则
const STYLE_RULES = {
  // 函数长度检查
  functionLength: {
    maxLines: 50,
    description: '函数不应超过50行'
  },
  
  // 缩进一致性
  indentation: {
    pattern: /^( {2}|\t)+/,
    description: '应使用一致的缩进（2个空格或tab）'
  },
  
  // 分号使用
  semicolon: {
    pattern: /;$/,
    description: '应在语句末尾使用分号'
  },
  
  // 字符串引号
  quotes: {
    single: /'/g,
    double: /"/g,
    description: '应统一使用单引号或双引号'
  }
};

/**
 * 分析文件命名风格
 */
function analyzeFileName(filePath) {
  const fileName = path.basename(filePath);
  const issues = [];
  
  // 检查是否是组件文件
  if (fileName.includes('Component') || fileName.includes('Page') || 
      fileName.charAt(0) === fileName.charAt(0).toUpperCase()) {
    if (!FILE_NAMING_RULES.component.pattern.test(fileName)) {
      issues.push({
        type: 'file_naming',
        file: filePath,
        issue: `组件文件命名不规范: ${fileName}`,
        suggestion: `应使用PascalCase，如: ${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`
      });
    }
  }
  
  // 检查服务文件
  if (fileName.includes('service') || fileName.includes('Service')) {
    if (!FILE_NAMING_RULES.service.pattern.test(fileName)) {
      issues.push({
        type: 'file_naming',
        file: filePath,
        issue: `服务文件命名不规范: ${fileName}`,
        suggestion: '应使用camelCaseService.ts格式'
      });
    }
  }
  
  return issues;
}

/**
 * 分析代码内容的命名和风格
 */
function analyzeCodeContent(filePath, content) {
  const issues = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // 检查变量声明
    const varMatch = line.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (varMatch) {
      const varName = varMatch[1];
      
      // 判断是否是常量（全大写或export const）
      const isConstant = line.includes('export const') && varName === varName.toUpperCase();
      
      if (isConstant) {
        if (!NAMING_RULES.constant.pattern.test(varName)) {
          issues.push({
            type: 'naming',
            file: filePath,
            line: lineNumber,
            issue: `常量命名不规范: ${varName}`,
            suggestion: NAMING_RULES.constant.description
          });
        }
      } else {
        if (!NAMING_RULES.variableFunction.pattern.test(varName)) {
          issues.push({
            type: 'naming',
            file: filePath,
            line: lineNumber,
            issue: `变量命名不规范: ${varName}`,
            suggestion: NAMING_RULES.variableFunction.description
          });
        }
      }
    }
    
    // 检查函数声明
    const funcMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]\s*(?:async\s+)?(?:function|\(.*?\)\s*=>)/);
    if (funcMatch) {
      const funcName = funcMatch[1] || funcMatch[2];
      if (funcName && !NAMING_RULES.variableFunction.pattern.test(funcName)) {
        issues.push({
          type: 'naming',
          file: filePath,
          line: lineNumber,
          issue: `函数命名不规范: ${funcName}`,
          suggestion: NAMING_RULES.variableFunction.description
        });
      }
    }
    
    // 检查类声明
    const classMatch = line.match(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (classMatch) {
      const className = classMatch[1];
      if (!NAMING_RULES.classsInterface.pattern.test(className)) {
        issues.push({
          type: 'naming',
          file: filePath,
          line: lineNumber,
          issue: `类名不规范: ${className}`,
          suggestion: NAMING_RULES.classsInterface.description
        });
      }
    }
    
    // 检查接口声明
    const interfaceMatch = line.match(/interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (interfaceMatch) {
      const interfaceName = interfaceMatch[1];
      if (!NAMING_RULES.classsInterface.pattern.test(interfaceName)) {
        issues.push({
          type: 'naming',
          file: filePath,
          line: lineNumber,
          issue: `接口名不规范: ${interfaceName}`,
          suggestion: NAMING_RULES.classsInterface.description
        });
      }
    }
    
    // 检查类型声明
    const typeMatch = line.match(/type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      if (!NAMING_RULES.type.pattern.test(typeName)) {
        issues.push({
          type: 'naming',
          file: filePath,
          line: lineNumber,
          issue: `类型名不规范: ${typeName}`,
          suggestion: NAMING_RULES.type.description
        });
      }
    }
    
    // 检查枚举声明
    const enumMatch = line.match(/enum\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (enumMatch) {
      const enumName = enumMatch[1];
      if (!NAMING_RULES.enum.pattern.test(enumName)) {
        issues.push({
          type: 'naming',
          file: filePath,
          line: lineNumber,
          issue: `枚举名不规范: ${enumName}`,
          suggestion: NAMING_RULES.enum.description
        });
      }
    }
    
    // 检查注释风格
    if (line.trim().startsWith('//')) {
      const comment = line.trim();
      if (!comment.startsWith('// ') && comment !== '//') {
        issues.push({
          type: 'comment',
          file: filePath,
          line: lineNumber,
          issue: '单行注释格式不规范',
          suggestion: '单行注释应使用 "// " 格式，注意空格'
        });
      }
    }
    
    // 检查缩进一致性（简化版）
    if (line.length > 0 && line.startsWith(' ')) {
      const indentMatch = line.match(/^(\s+)/);
      if (indentMatch) {
        const indent = indentMatch[1];
        if (indent.includes('\t') && indent.includes(' ')) {
          issues.push({
            type: 'style',
            file: filePath,
            line: lineNumber,
            issue: '混合使用tab和空格缩进',
            suggestion: '应统一使用空格或tab缩进'
          });
        }
      }
    }
    
    // 检查字符串引号一致性
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;
    if (singleQuotes > 0 && doubleQuotes > 0) {
      // 排除模板字符串和转义引号的情况
      if (!line.includes('`') && !line.includes('\\') && !line.includes('\\"')) {
        issues.push({
          type: 'style',
          file: filePath,
          line: lineNumber,
          issue: '混合使用单引号和双引号',
          suggestion: '应统一使用单引号或双引号'
        });
      }
    }
  });
  
  return issues;
}

/**
 * 分析函数长度
 */
function analyzeFunctionLength(content) {
  const issues = [];
  const lines = content.split('\n');
  let currentFunction = null;
  let functionStartLine = 0;
  let braceCount = 0;
  
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // 检测函数开始
    const funcMatch = line.match(/(?:function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[=:]\s*(?:async\s+)?(?:function|\(.*?\)\s*=>))/);
    if (funcMatch && line.includes('{')) {
      currentFunction = funcMatch[1] || funcMatch[2];
      functionStartLine = lineNumber;
      braceCount = 1;
    } else if (currentFunction) {
      // 计算大括号
      braceCount += (line.match(/{/g) || []).length;
      braceCount -= (line.match(/}/g) || []).length;
      
      // 函数结束
      if (braceCount === 0) {
        const functionLength = lineNumber - functionStartLine + 1;
        if (functionLength > STYLE_RULES.functionLength.maxLines) {
          issues.push({
            type: 'style',
            file: 'current',
            line: functionStartLine,
            issue: `函数 ${currentFunction} 过长 (${functionLength} 行)`,
            suggestion: `${STYLE_RULES.functionLength.description}，建议拆分为多个小函数`
          });
        }
        currentFunction = null;
      }
    }
  });
  
  return issues;
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !CONFIG.excludeDirs.includes(item)) {
        results.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && CONFIG.targetExtensions.includes(path.extname(item))) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ 扫描目录失败 ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * 分析单个文件
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // 文件命名分析
    issues.push(...analyzeFileName(filePath));
    
    // 代码内容分析
    issues.push(...analyzeCodeContent(filePath, content));
    
    // 函数长度分析
    issues.push(...analyzeFunctionLength(content));
    
    return issues;
  } catch (error) {
    console.error(`❌ 分析文件失败 ${filePath}:`, error.message);
    return [];
  }
}

/**
 * 计算整体评分
 */
function calculateOverallScore() {
  const totalIssues = stats.namingIssues.length + stats.styleIssues.length + 
                     stats.commentIssues.length + stats.fileNamingIssues.length;
  
  const maxScore = 100;
  const penaltyPerIssue = 2;
  
  const score = Math.max(0, maxScore - (totalIssues * penaltyPerIssue));
  return score;
}

/**
 * 生成改进建议
 */
function generateImprovementSuggestions() {
  const suggestions = [];
  
  if (stats.namingIssues.length > 0) {
    suggestions.push({
      category: '命名规范',
      priority: 'high',
      description: `发现 ${stats.namingIssues.length} 个命名不规范问题`,
      actions: [
        '统一使用camelCase命名变量和函数',
        '使用PascalCase命名类、接口和类型',
        '使用SCREAMING_SNAKE_CASE命名常量',
        '考虑使用ESLint规则自动检查命名约定'
      ]
    });
  }
  
  if (stats.styleIssues.length > 0) {
    suggestions.push({
      category: '代码风格',
      priority: 'medium',
      description: `发现 ${stats.styleIssues.length} 个代码风格问题`,
      actions: [
        '配置Prettier进行代码格式化',
        '统一缩进方式（建议使用2个空格）',
        '统一字符串引号使用',
        '限制函数长度，及时重构过长函数'
      ]
    });
  }
  
  if (stats.commentIssues.length > 0) {
    suggestions.push({
      category: '注释规范',
      priority: 'low',
      description: `发现 ${stats.commentIssues.length} 个注释格式问题`,
      actions: [
        '统一注释格式，使用 "// " 开头',
        '添加JSDoc注释为函数和类',
        '确保注释内容有意义且及时更新'
      ]
    });
  }
  
  if (stats.fileNamingIssues.length > 0) {
    suggestions.push({
      category: '文件命名',
      priority: 'medium',
      description: `发现 ${stats.fileNamingIssues.length} 个文件命名问题`,
      actions: [
        '组件文件使用PascalCase.tsx',
        '服务文件使用camelCaseService.ts',
        '工具函数文件使用camelCase.ts',
        '类型文件使用types.ts或camelCaseTypes.ts'
      ]
    });
  }
  
  return suggestions;
}

/**
 * 生成分析报告
 */
function generateReport() {
  const score = calculateOverallScore();
  const suggestions = generateImprovementSuggestions();
  
  const report = `
🎨 代码风格和命名约定分析报告
==================================================
📁 分析文件数: ${stats.filesAnalyzed}
📊 整体评分: ${score}/100 ${score >= 80 ? '✅ 优秀' : score >= 60 ? '⚠️ 良好' : '❌ 需改进'}

📋 问题统计
--------------------------------------------------
🏷️ 命名问题: ${stats.namingIssues.length}
🎨 风格问题: ${stats.styleIssues.length}
💬 注释问题: ${stats.commentIssues.length}
📁 文件命名问题: ${stats.fileNamingIssues.length}

${suggestions.length > 0 ? `🎯 改进建议
--------------------------------------------------` : ''}
${suggestions.map(s => `
${s.priority === 'high' ? '🚨' : s.priority === 'medium' ? '⚠️' : 'ℹ️'} ${s.category} (${s.priority})
${s.description}
${s.actions.map(action => `  • ${action}`).join('\n')}
`).join('\n')}

${score < 80 ? `📝 建议优先处理
--------------------------------------------------
1. 配置并运行ESLint和Prettier
2. 制定团队编码规范文档
3. 设置pre-commit钩子确保代码质量
4. 进行代码审查时重点检查命名和格式` : ''}
==================================================
`;
  
  console.log(report);
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, 'code-style-analysis-report.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 报告已保存到: ${reportPath}`);
  
  return score;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始代码风格和命名约定分析...\n');
  
  // 1. 扫描所有文件
  console.log('🔍 扫描源代码文件...');
  const files = scanDirectory(CONFIG.srcDir).slice(0, CONFIG.maxFilesToAnalyze);
  stats.filesAnalyzed = files.length;
  console.log(`📁 找到 ${files.length} 个文件\n`);
  
  // 2. 分析每个文件
  console.log('📊 分析代码风格和命名约定...');
  files.forEach(file => {
    const issues = analyzeFile(file);
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'naming':
          stats.namingIssues.push(issue);
          break;
        case 'style':
          stats.styleIssues.push(issue);
          break;
        case 'comment':
          stats.commentIssues.push(issue);
          break;
        case 'file_naming':
          stats.fileNamingIssues.push(issue);
          break;
      }
    });
  });
  
  console.log(`🔍 分析完成，发现 ${stats.namingIssues.length + stats.styleIssues.length + stats.commentIssues.length + stats.fileNamingIssues.length} 个问题\n`);
  
  // 3. 生成报告
  const score = generateReport();
  
  // 4. 显示具体问题（前10个）
  if (stats.namingIssues.length > 0) {
    console.log('\n🏷️ 命名问题示例（前10个）:');
    stats.namingIssues.slice(0, 10).forEach(issue => {
      const relativePath = path.relative(CONFIG.srcDir, issue.file);
      console.log(`  📄 ${relativePath}:${issue.line} - ${issue.issue}`);
      console.log(`     💡 ${issue.suggestion}`);
    });
  }
  
  if (stats.styleIssues.length > 0) {
    console.log('\n🎨 风格问题示例（前10个）:');
    stats.styleIssues.slice(0, 10).forEach(issue => {
      const relativePath = path.relative(CONFIG.srcDir, issue.file);
      console.log(`  📄 ${relativePath}:${issue.line} - ${issue.issue}`);
      console.log(`     💡 ${issue.suggestion}`);
    });
  }
  
  // 5. 总结
  console.log('\n🎉 代码风格分析完成！');
  
  if (score >= 80) {
    console.log('✅ 代码风格整体良好，继续保持！');
  } else if (score >= 60) {
    console.log('⚠️ 代码风格有改进空间，建议按优先级逐步优化');
  } else {
    console.log('❌ 代码风格需要显著改进，建议立即采取行动');
  }
  
  return score;
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});