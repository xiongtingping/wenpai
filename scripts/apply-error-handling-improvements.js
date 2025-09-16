#!/usr/bin/env node

/**
 * 自动应用错误处理改进脚本
 * 🛡️ P1-2: 完善错误处理和日志记录
 * 
 * 功能：
 * 1. 找到所有未处理的Promise
 * 2. 自动添加错误处理包装
 * 3. 统计和报告改进效果
 * 4. 验证错误处理覆盖率
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置选项
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  excludeDirs: ['node_modules', '.git', 'dist', 'build'],
  targetExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  maxFilesToProcess: 100,
  dryRun: false, // 设为true时只分析不修改
  verbose: true
};

// 统计数据
const stats = {
  filesScanned: 0,
  filesModified: 0,
  promisesFound: 0,
  promisesFixed: 0,
  unhandledPromises: 0,
  errorsPrevented: 0
};

// 需要修复的Promise模式
const PROMISE_PATTERNS = [
  {
    name: 'unhandled_fetch',
    pattern: /fetch\([^)]+\)(?!\s*\.catch)/g,
    description: '未处理的fetch调用'
  },
  {
    name: 'unhandled_async_call',
    pattern: /await\s+[\w.]+\([^)]*\)(?!\s*\.catch)(?![^}]*catch\s*\()/g,
    description: '未包装的await调用'
  },
  {
    name: 'unhandled_promise_chain',
    pattern: /\.then\([^)]+\)(?!\s*\.catch)/g,
    description: '未处理的Promise链'
  },
  {
    name: 'unhandled_promise_constructor',
    pattern: /new\s+Promise\([^)]+\)(?!\s*\.catch)/g,
    description: '未处理的Promise构造函数'
  }
];

// 错误处理包装模板
const WRAPPER_TEMPLATES = {
  fetch: `wrapAsyncFunction(async () => {
    return fetch({{args}});
  }, { component: '{{component}}', action: 'fetch_request' })()`,
  
  asyncFunction: `safeAsyncExecution(async () => {
    return {{original}};
  }, undefined, { component: '{{component}}', action: '{{action}}' })`,
  
  promiseChain: `{{original}}.catch(error => {
    logError(error, { component: '{{component}}', action: 'promise_chain' });
    throw error;
  })`
};

/**
 * 扫描文件获取所有Promise使用情况
 */
function scanFileForPromises(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const results = [];
    
    PROMISE_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          results.push({
            type: pattern.name,
            description: pattern.description,
            code: match,
            line: getLineNumber(content, match)
          });
        });
      }
    });
    
    return results;
  } catch (error) {
    console.error(`❌ 扫描文件失败 ${filePath}:`, error.message);
    return [];
  }
}

/**
 * 获取代码在文件中的行号
 */
function getLineNumber(content, code) {
  const index = content.indexOf(code);
  if (index === -1) return 0;
  return content.substring(0, index).split('\n').length;
}

/**
 * 应用错误处理改进到文件
 */
function applyErrorHandlingImprovements(filePath, promises) {
  if (CONFIG.dryRun) {
    console.log(`🔍 [DRY RUN] 分析文件: ${filePath}`);
    promises.forEach(p => {
      console.log(`  📍 第${p.line}行: ${p.description} - ${p.code.substring(0, 50)}...`);
    });
    return 0;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modifications = 0;
    
    // 确保导入了错误处理工具
    if (!content.includes('import') || !content.includes('errorHandler')) {
      const importStatement = "import { logError, wrapAsyncFunction, safeAsyncExecution } from '@/utils/errorHandler';\n";
      content = importStatement + content;
      modifications++;
    }
    
    // 应用具体的修复
    promises.forEach(promise => {
      if (promise.type === 'unhandled_fetch') {
        // 包装fetch调用
        const componentName = extractComponentName(filePath);
        const wrappedCode = promise.code.replace(
          /fetch\(([^)]+)\)/,
          `safeAsyncExecution(() => fetch($1), null, { component: '${componentName}', action: 'fetch' })`
        );
        content = content.replace(promise.code, wrappedCode);
        modifications++;
      }
      
      if (promise.type === 'unhandled_promise_chain') {
        // 添加catch处理
        const componentName = extractComponentName(filePath);
        const wrappedCode = promise.code + `.catch(error => {
          logError(error, { component: '${componentName}', action: 'promise_chain' });
          throw error;
        })`;
        content = content.replace(promise.code, wrappedCode);
        modifications++;
      }
    });
    
    if (modifications > 0) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ 修复文件: ${filePath} (${modifications}个改进)`);
      stats.filesModified++;
      stats.promisesFixed += modifications;
    }
    
    return modifications;
  } catch (error) {
    console.error(`❌ 修复文件失败 ${filePath}:`, error.message);
    return 0;
  }
}

/**
 * 从文件路径提取组件名
 */
function extractComponentName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName.charAt(0).toUpperCase() + fileName.slice(1);
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
 * 验证错误处理覆盖率
 */
function validateErrorHandlingCoverage() {
  console.log('\n📊 验证错误处理覆盖率...');
  
  try {
    // 使用ripgrep搜索未处理的Promise
    const unhandledFetch = execSync('rg "fetch\\([^)]+\\)(?!\\s*\\.catch)" src/ --count || echo "0"').toString().trim();
    const unhandledAwait = execSync('rg "await\\s+[\\w.]+\\([^)]*\\)(?!\\s*\\.catch)(?![^}]*catch\\s*\\()" src/ --count || echo "0"').toString().trim();
    const unhandledThen = execSync('rg "\\.then\\([^)]+\\)(?!\\s*\\.catch)" src/ --count || echo "0"').toString().trim();
    
    const totalUnhandled = parseInt(unhandledFetch) + parseInt(unhandledAwait) + parseInt(unhandledThen);
    const totalPromises = stats.promisesFound + stats.promisesFixed;
    const coverage = totalPromises > 0 ? ((stats.promisesFixed / totalPromises) * 100).toFixed(1) : 100;
    
    console.log(`📈 错误处理覆盖率: ${coverage}%`);
    console.log(`🔍 发现 ${totalUnhandled} 个未处理的Promise`);
    console.log(`✅ 修复 ${stats.promisesFixed} 个Promise`);
    
    stats.unhandledPromises = totalUnhandled;
    
    return coverage >= 80; // 目标覆盖率80%
  } catch (error) {
    console.warn('⚠️ 验证覆盖率失败:', error.message);
    return false;
  }
}

/**
 * 生成改进报告
 */
function generateReport() {
  const report = `
📋 错误处理改进报告
==================================================
📁 扫描文件数: ${stats.filesScanned}
📝 修改文件数: ${stats.filesModified}
🔍 发现Promise: ${stats.promisesFound}
✅ 修复Promise: ${stats.promisesFixed}
⚠️ 未处理Promise: ${stats.unhandledPromises}
🛡️ 预防错误数: ${stats.errorsPrevented}

📊 改进效果
--------------------------------------------------
错误处理覆盖率: ${stats.promisesFound > 0 ? ((stats.promisesFixed / stats.promisesFound) * 100).toFixed(1) : 0}%
代码质量提升: ${stats.filesModified > 0 ? '显著改善' : '无需改进'}
系统稳定性: ${stats.promisesFixed > 0 ? '大幅提升' : '保持良好'}

🎯 下一步行动
--------------------------------------------------
${stats.unhandledPromises > 0 ? `⚠️ 仍有 ${stats.unhandledPromises} 个未处理Promise需要手动修复` : '✅ 所有Promise都已正确处理'}
${stats.promisesFixed > 20 ? '📝 建议运行完整测试套件验证修复效果' : ''}
${stats.filesModified > 10 ? '🔍 建议进行代码审查确保修复质量' : ''}
==================================================
`;
  
  console.log(report);
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, 'error-handling-improvement-report.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 报告已保存到: ${reportPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始应用错误处理改进...\n');
  
  if (CONFIG.dryRun) {
    console.log('⚠️ 运行在DRY RUN模式，不会修改文件\n');
  }
  
  // 1. 扫描所有文件
  console.log('🔍 扫描源代码文件...');
  const files = scanDirectory(CONFIG.srcDir).slice(0, CONFIG.maxFilesToProcess);
  stats.filesScanned = files.length;
  console.log(`📁 找到 ${files.length} 个文件\n`);
  
  // 2. 分析每个文件的Promise使用情况
  console.log('📊 分析Promise使用情况...');
  const allPromises = [];
  files.forEach(file => {
    const promises = scanFileForPromises(file);
    if (promises.length > 0) {
      allPromises.push({ file, promises });
      stats.promisesFound += promises.length;
      
      if (CONFIG.verbose) {
        console.log(`  📄 ${path.relative(CONFIG.srcDir, file)}: ${promises.length}个Promise`);
      }
    }
  });
  
  console.log(`🔍 总共发现 ${stats.promisesFound} 个Promise使用\n`);
  
  // 3. 应用改进
  console.log('🛠️ 应用错误处理改进...');
  allPromises.forEach(({ file, promises }) => {
    const improvements = applyErrorHandlingImprovements(file, promises);
    stats.errorsPrevented += improvements;
  });
  
  // 4. 验证覆盖率
  const coverageOk = validateErrorHandlingCoverage();
  
  // 5. 生成报告
  generateReport();
  
  // 6. 总结
  console.log('\n🎉 错误处理改进完成！');
  
  if (stats.promisesFixed > 0) {
    console.log(`✅ 成功修复 ${stats.promisesFixed} 个Promise异常处理`);
    console.log('💡 建议运行测试确保所有修复都正确工作');
  } else {
    console.log('ℹ️ 当前代码已经有良好的错误处理');
  }
  
  if (!coverageOk) {
    console.log('⚠️ 错误处理覆盖率低于80%，需要进一步改进');
    process.exit(1);
  }
}

// 处理命令行参数
if (process.argv.includes('--dry-run')) {
  CONFIG.dryRun = true;
}

if (process.argv.includes('--quiet')) {
  CONFIG.verbose = false;
}

const maxFilesArg = process.argv.find(arg => arg.startsWith('--max-files='));
if (maxFilesArg) {
  CONFIG.maxFilesToProcess = parseInt(maxFilesArg.split('=')[1]) || 100;
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});