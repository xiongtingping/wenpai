#!/usr/bin/env node

/**
 * 🔍 高级undefined拼接检测器
 * 深度扫描项目中所有可能导致"undefinedundefined"的代码模式
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 高级危险模式检测规则
const advancedPatterns = [
  {
    name: '用户属性逻辑或拼接',
    regex: /user\?\.\w+\s*\|\|\s*user\?\.\w+/g,
    severity: 'critical',
    category: 'user-data',
    description: '用户属性的逻辑或运算可能导致undefined拼接'
  },
  {
    name: '模板字符串中的用户属性',
    regex: /`[^`]*\$\{[^}]*user\?\.\w+[^}]*\}[^`]*`/g,
    severity: 'critical',
    category: 'template-string',
    description: '模板字符串中直接使用用户属性'
  },
  {
    name: 'JSX中的用户属性拼接',
    regex: /\{[^}]*user\?\.\w+\s*\|\|\s*[^}]*\}/g,
    severity: 'high',
    category: 'jsx',
    description: 'JSX中的用户属性逻辑或运算'
  },
  {
    name: 'API URL构建中的用户属性',
    regex: /`[^`]*\/\$\{[^}]*user\?\.\w+[^}]*\}[^`]*`/g,
    severity: 'critical',
    category: 'api-url',
    description: 'API URL构建中使用用户属性'
  },
  {
    name: 'alt属性中的用户信息',
    regex: /alt\s*=\s*\{[^}]*user\?\.\w+[^}]*\}/g,
    severity: 'medium',
    category: 'accessibility',
    description: 'img标签alt属性中使用用户信息'
  },
  {
    name: '字符串拼接用户属性',
    regex: /user\?\.\w+\s*\+\s*['"]/g,
    severity: 'high',
    category: 'string-concat',
    description: '直接字符串拼接用户属性'
  },
  {
    name: '对象属性深层访问',
    regex: /user\?\.\w+\?\.\w+\s*\|\|\s*user\?\.\w+\?\.\w+/g,
    severity: 'high',
    category: 'deep-access',
    description: '深层对象属性访问的逻辑或运算'
  },
  {
    name: '数组访问中的用户属性',
    regex: /user\?\.\w+\?\.\[\d+\]\s*\|\|\s*user\?\.\w+/g,
    severity: 'medium',
    category: 'array-access',
    description: '数组访问中的用户属性拼接'
  },
  {
    name: '函数调用中的用户属性拼接',
    regex: /\w+\([^)]*user\?\.\w+\s*\|\|\s*user\?\.\w+[^)]*\)/g,
    severity: 'medium',
    category: 'function-call',
    description: '函数调用参数中的用户属性拼接'
  },
  {
    name: '条件表达式中的用户属性',
    regex: /\?\s*user\?\.\w+\s*:\s*user\?\.\w+/g,
    severity: 'medium',
    category: 'ternary',
    description: '三元表达式中的用户属性选择'
  }
];

// 文件类型配置
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue'];
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

// 扫描结果统计
let scanStats = {
  filesScanned: 0,
  issuesFound: 0,
  criticalIssues: 0,
  highIssues: 0,
  mediumIssues: 0,
  lowIssues: 0
};

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    scanStats.filesScanned++;
    
    advancedPatterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        const lineContent = lines[lines.length - 1] + match[0];
        
        // 获取上下文（前后3行）
        const allLines = content.split('\n');
        const contextStart = Math.max(0, lineNumber - 3);
        const contextEnd = Math.min(allLines.length, lineNumber + 3);
        const context = allLines.slice(contextStart, contextEnd).join('\n');
        
        const issue = {
          file: filePath,
          line: lineNumber,
          column: lines[lines.length - 1].length + 1,
          pattern: pattern.name,
          severity: pattern.severity,
          category: pattern.category,
          description: pattern.description,
          match: match[0],
          context: context,
          suggestion: generateSuggestion(pattern.category, match[0])
        };
        
        results.push(issue);
        scanStats.issuesFound++;
        
        // 更新严重程度统计
        switch (pattern.severity) {
          case 'critical': scanStats.criticalIssues++; break;
          case 'high': scanStats.highIssues++; break;
          case 'medium': scanStats.mediumIssues++; break;
          case 'low': scanStats.lowIssues++; break;
        }
      }
    });
    
    return results;
  } catch (error) {
    console.error(`❌ 读取文件失败: ${filePath}`, error.message);
    return [];
  }
}

/**
 * 生成修复建议
 */
function generateSuggestion(category, match) {
  const suggestions = {
    'user-data': 'import { getUserDisplayName } from "@/utils/userDisplayUtils"; 使用 getUserDisplayName(user, "默认值")',
    'template-string': '在模板字符串中添加默认值: ${user?.property || "默认值"}',
    'jsx': '使用安全的JSX表达式: {getUserDisplayName(user) || "默认值"}',
    'api-url': '在API URL中添加验证: ${user?.id || "unknown"}',
    'accessibility': '使用 getUserAltText(user, "上下文") 生成alt文本',
    'string-concat': '使用模板字符串和默认值替代直接拼接',
    'deep-access': '添加多层级的安全检查或使用lodash.get',
    'array-access': '添加数组长度检查和默认值',
    'function-call': '在函数调用前验证参数的有效性',
    'ternary': '使用更明确的条件判断和默认值'
  };
  
  return suggestions[category] || '添加适当的默认值处理';
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
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          results.push(...scanDirectory(fullPath));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (fileExtensions.includes(ext)) {
          results.push(...scanFile(fullPath));
        }
      }
    }
  } catch (error) {
    console.error(`❌ 扫描目录失败: ${dir}`, error.message);
  }
  
  return results;
}

/**
 * 生成详细报告
 */
function generateReport(results) {
  console.log('\n📊 扫描统计:');
  console.log(`   文件总数: ${scanStats.filesScanned}`);
  console.log(`   问题总数: ${scanStats.issuesFound}`);
  console.log(`   🔴 严重: ${scanStats.criticalIssues}`);
  console.log(`   🟠 高危: ${scanStats.highIssues}`);
  console.log(`   🟡 中等: ${scanStats.mediumIssues}`);
  console.log(`   🟢 低危: ${scanStats.lowIssues}`);
  
  if (results.length === 0) {
    console.log('\n✅ 未发现undefined拼接问题！');
    return;
  }
  
  // 按严重程度分组
  const grouped = results.reduce((acc, result) => {
    if (!acc[result.severity]) acc[result.severity] = [];
    acc[result.severity].push(result);
    return acc;
  }, {});
  
  // 按类别分组统计
  const byCategory = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = 0;
    acc[result.category]++;
    return acc;
  }, {});
  
  console.log('\n📋 问题分类统计:');
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`   ${category}: ${count}个`);
  });
  
  // 输出详细结果
  ['critical', 'high', 'medium', 'low'].forEach(severity => {
    if (grouped[severity]) {
      const icon = {
        critical: '🔴',
        high: '🟠', 
        medium: '🟡',
        low: '🟢'
      }[severity];
      
      console.log(`\n${icon} ${severity.toUpperCase()} 严重程度 (${grouped[severity].length}个):`);
      
      grouped[severity].forEach((result, index) => {
        console.log(`\n  ${index + 1}. ${result.file}:${result.line}:${result.column}`);
        console.log(`     类别: ${result.category}`);
        console.log(`     模式: ${result.pattern}`);
        console.log(`     描述: ${result.description}`);
        console.log(`     匹配: ${result.match}`);
        console.log(`     建议: ${result.suggestion}`);
        
        // 显示代码上下文
        console.log('     上下文:');
        result.context.split('\n').forEach((line, i) => {
          const lineNum = result.line - 3 + i;
          const marker = lineNum === result.line ? '>>>' : '   ';
          console.log(`     ${marker} ${lineNum}: ${line}`);
        });
      });
    }
  });
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 启动高级undefined拼接检测器...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('❌ src目录不存在');
    process.exit(1);
  }
  
  console.log(`📂 扫描目录: ${srcDir}`);
  console.log(`📄 文件类型: ${fileExtensions.join(', ')}`);
  console.log(`🚫 排除目录: ${excludeDirs.join(', ')}\n`);
  
  const results = scanDirectory(srcDir);
  generateReport(results);
  
  // 生成JSON报告
  const reportPath = path.join(process.cwd(), 'undefined-concat-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats: scanStats,
    results: results
  }, null, 2));
  
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
  // 返回退出码
  process.exit(scanStats.criticalIssues > 0 ? 1 : 0);
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scanFile, scanDirectory, advancedPatterns };
