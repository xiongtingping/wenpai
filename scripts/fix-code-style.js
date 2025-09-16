#!/usr/bin/env node

/**
 * 代码风格自动修复脚本
 * 🎨 P1-3: 统一代码风格和命名约定
 * 
 * 功能：
 * 1. 自动修复引号不一致问题
 * 2. 统一缩进风格
 * 3. 添加缺失的分号
 * 4. 修复简单的命名约定问题
 * 5. 格式化代码结构
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
  maxFilesToFix: 50,
  dryRun: false, // 设为true时只分析不修改
  preferSingleQuotes: true, // 统一使用单引号
  indentSize: 2, // 缩进大小
  verbose: true
};

// 修复统计
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  quotesFixed: 0,
  indentationFixed: 0,
  semicolonsAdded: 0,
  commentsFixed: 0,
  functionsRenamed: 0
};

/**
 * 修复字符串引号问题
 */
function fixQuotes(content) {
  let fixed = content;
  let count = 0;
  
  if (CONFIG.preferSingleQuotes) {
    // 将双引号改为单引号，但要避免模板字符串和特殊情况
    fixed = fixed.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, inner) => {
      // 跳过包含单引号的字符串
      if (inner.includes("'")) {
        return match;
      }
      // 跳过JSX属性
      if (match.includes('=')) {
        return match;
      }
      count++;
      return `'${inner}'`;
    });
  } else {
    // 将单引号改为双引号
    fixed = fixed.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (match, inner) => {
      // 跳过包含双引号的字符串
      if (inner.includes('"')) {
        return match;
      }
      count++;
      return `"${inner}"`;
    });
  }
  
  stats.quotesFixed += count;
  return fixed;
}

/**
 * 修复缩进问题
 */
function fixIndentation(content) {
  const lines = content.split('\n');
  let fixed = [];
  let count = 0;
  
  lines.forEach(line => {
    if (line.trim() === '') {
      fixed.push('');
      return;
    }
    
    // 检测当前缩进
    const match = line.match(/^(\s*)/);
    const currentIndent = match ? match[1] : '';
    
    // 如果混合使用tab和空格，统一为空格
    if (currentIndent.includes('\t') && currentIndent.includes(' ')) {
      const indentLevel = currentIndent.length;
      const newIndent = ' '.repeat(Math.round(indentLevel / CONFIG.indentSize) * CONFIG.indentSize);
      fixed.push(newIndent + line.trim());
      count++;
    } else if (currentIndent.includes('\t')) {
      // 将tab转换为空格
      const tabCount = (currentIndent.match(/\t/g) || []).length;
      const newIndent = ' '.repeat(tabCount * CONFIG.indentSize);
      fixed.push(newIndent + line.trim());
      count++;
    } else {
      fixed.push(line);
    }
  });
  
  stats.indentationFixed += count;
  return fixed.join('\n');
}

/**
 * 添加缺失的分号
 */
function addMissingSemicolons(content) {
  let fixed = content;
  let count = 0;
  
  const lines = fixed.split('\n');
  const fixedLines = lines.map(line => {
    const trimmed = line.trim();
    
    // 跳过注释、空行、已有分号的行
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || 
        trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}') ||
        trimmed.endsWith(',')) {
      return line;
    }
    
    // 检查是否是需要分号的语句
    if (trimmed.match(/^(const|let|var|return|throw|break|continue|import|export)\s/) ||
        trimmed.match(/\)$/) && !trimmed.includes('=>')) {
      count++;
      return line + ';';
    }
    
    return line;
  });
  
  stats.semicolonsAdded += count;
  return fixedLines.join('\n');
}

/**
 * 修复注释格式
 */
function fixComments(content) {
  let fixed = content;
  let count = 0;
  
  // 修复单行注释格式
  fixed = fixed.replace(/\/\/([^\s])/g, (match, char) => {
    count++;
    return `// ${char}`;
  });
  
  stats.commentsFixed += count;
  return fixed;
}

/**
 * 修复简单的命名约定问题（保守修复）
 */
function fixSimpleNamingIssues(content) {
  let fixed = content;
  let count = 0;
  
  // 只修复明显的常量命名问题
  fixed = fixed.replace(/export const ([a-z][a-zA-Z0-9_]*) = /g, (match, varName) => {
    // 如果变量值是字符串常量或数字，转换为大写
    const nextPart = fixed.substr(fixed.indexOf(match) + match.length, 50);
    if (nextPart.match(/^['\"]/)) { // 字符串常量
      const newName = varName.replace(/([A-Z])/g, '_$1').toUpperCase();
      count++;
      return `export const ${newName} = `;
    }
    return match;
  });
  
  stats.functionsRenamed += count;
  return fixed;
}

/**
 * 应用所有修复
 */
function applyFixes(content) {
  let fixed = content;
  
  // 按顺序应用修复
  fixed = fixQuotes(fixed);
  fixed = fixIndentation(fixed);
  fixed = addMissingSemicolons(fixed);
  fixed = fixComments(fixed);
  // fixed = fixSimpleNamingIssues(fixed); // 暂时注释，避免破坏代码
  
  return fixed;
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const fixedContent = applyFixes(originalContent);
    
    if (originalContent !== fixedContent) {
      if (!CONFIG.dryRun) {
        fs.writeFileSync(filePath, fixedContent);
        if (CONFIG.verbose) {
          console.log(`✅ 修复文件: ${path.relative(CONFIG.srcDir, filePath)}`);
        }
      } else {
        console.log(`🔍 [DRY RUN] 需要修复: ${path.relative(CONFIG.srcDir, filePath)}`);
      }
      stats.filesModified++;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 处理文件失败 ${filePath}:`, error.message);
    return false;
  }
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
 * 生成修复报告
 */
function generateReport() {
  const report = `
🎨 代码风格自动修复报告
==================================================
📁 处理文件数: ${stats.filesProcessed}
📝 修改文件数: ${stats.filesModified}
🔧 修复统计:
  📝 引号统一: ${stats.quotesFixed}
  📐 缩进修复: ${stats.indentationFixed}
  ; 分号添加: ${stats.semicolonsAdded}
  💬 注释格式: ${stats.commentsFixed}
  🏷️ 命名修复: ${stats.functionsRenamed}

📊 修复效果
--------------------------------------------------
文件修复率: ${stats.filesProcessed > 0 ? ((stats.filesModified / stats.filesProcessed) * 100).toFixed(1) : 0}%
总修复项目: ${stats.quotesFixed + stats.indentationFixed + stats.semicolonsAdded + stats.commentsFixed + stats.functionsRenamed}

🎯 后续建议
--------------------------------------------------
${stats.filesModified > 0 ? '✅ 已完成基础代码风格修复' : 'ℹ️ 代码风格已符合规范'}
📋 建议配置Prettier进行持续格式化
🔧 建议配置ESLint规则防止风格问题
🧪 建议运行测试确保修复未破坏功能
==================================================
`;
  
  console.log(report);
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, 'code-style-fix-report.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 报告已保存到: ${reportPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始代码风格自动修复...\n');
  
  if (CONFIG.dryRun) {
    console.log('⚠️ 运行在DRY RUN模式，不会修改文件\n');
  }
  
  // 1. 扫描所有文件
  console.log('🔍 扫描源代码文件...');
  const files = scanDirectory(CONFIG.srcDir).slice(0, CONFIG.maxFilesToFix);
  stats.filesProcessed = files.length;
  console.log(`📁 找到 ${files.length} 个文件\n`);
  
  // 2. 处理每个文件
  console.log('🛠️ 开始修复代码风格...');
  files.forEach(file => {
    processFile(file);
  });
  
  // 3. 生成报告
  generateReport();
  
  // 4. 总结
  console.log('\n🎉 代码风格修复完成！');
  
  if (stats.filesModified > 0) {
    console.log(`✅ 成功修复 ${stats.filesModified} 个文件`);
    console.log('💡 建议运行测试确保所有修复都正确工作');
    
    if (!CONFIG.dryRun) {
      console.log('🔄 建议重新运行代码风格分析查看改进效果');
    }
  } else {
    console.log('ℹ️ 当前代码风格已符合基本规范');
  }
}

// 处理命令行参数
if (process.argv.includes('--dry-run')) {
  CONFIG.dryRun = true;
}

if (process.argv.includes('--quiet')) {
  CONFIG.verbose = false;
}

if (process.argv.includes('--double-quotes')) {
  CONFIG.preferSingleQuotes = false;
}

const maxFilesArg = process.argv.find(arg => arg.startsWith('--max-files='));
if (maxFilesArg) {
  CONFIG.maxFilesToFix = parseInt(maxFilesArg.split('=')[1]) || 50;
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});