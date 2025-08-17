#!/usr/bin/env node
// @ts-nocheck

/**
 * 🧹 批量清理控制台日志脚本
 * 
 * 功能：
 * 1. 查找所有包含emoji的console.log语句
 * 2. 替换为使用logger系统
 * 3. 保留错误日志，清理调试信息
 */

const fs = require('fs');
const path = require('path');

// 需要处理的文件扩展名
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// 需要替换的console.log模式
const CONSOLE_PATTERNS = [
  // 成功信息 ✅
  {
    pattern: /console\.log\(['"`]✅([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.debug('✅${message}', ${data});`;
      } else {
        return `logger.debug('✅${message}');`;
      }
    }
  },
  
  // 配置信息 🔧
  {
    pattern: /console\.log\(['"`]🔧([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.debug('🔧${message}', ${data});`;
      } else {
        return `logger.debug('🔧${message}');`;
      }
    }
  },
  
  // 启动信息 🚀
  {
    pattern: /console\.log\(['"`]🚀([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.system('🚀${message}', ${data});`;
      } else {
        return `logger.system('🚀${message}');`;
      }
    }
  },
  
  // 位置信息 📍
  {
    pattern: /console\.log\(['"`]📍([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.debug('📍${message}', ${data});`;
      } else {
        return `logger.debug('📍${message}');`;
      }
    }
  },
  
  // 错误信息 🚨 - 保留但使用logger
  {
    pattern: /console\.log\(['"`]🚨([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.warn('🚨${message}', ${data});`;
      } else {
        return `logger.warn('🚨${message}');`;
      }
    }
  },
  
  // 锁定信息 🔒
  {
    pattern: /console\.log\(['"`]🔒([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\);?/g,
    replacement: (match, message, data) => {
      if (data && data.trim()) {
        return `logger.lock('🔒${message}', ${data});`;
      } else {
        return `logger.lock('🔒${message}');`;
      }
    }
  }
];

// 需要添加logger导入的文件
const processedFiles = new Set();
let totalReplacements = 0;

/**
 * 递归获取所有文件
 */
function getAllFiles(dirPath, fileList = []) {
  try {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // 跳过 node_modules 等目录
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
          getAllFiles(filePath, fileList);
        }
      } else {
        const ext = path.extname(file);
        if (FILE_EXTENSIONS.includes(ext)) {
          fileList.push(filePath);
        }
      }
    });
  } catch (error) {
    console.error(`读取目录失败: ${dirPath} - ${error.message}`);
  }
  
  return fileList;
}

/**
 * 检查文件是否已经导入了logger
 */
function hasLoggerImport(content) {
  return /import.*logger.*from.*['"]@\/utils\/logger['"]/.test(content) ||
         /import.*\{.*logger.*\}.*from.*['"]@\/utils\/logger['"]/.test(content);
}

/**
 * 添加logger导入
 */
function addLoggerImport(content) {
  // 查找最后一个import语句的位置
  const importRegex = /import[^;]+;/g;
  let lastImportMatch;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    lastImportMatch = match;
  }
  
  if (lastImportMatch) {
    const insertPos = lastImportMatch.index + lastImportMatch[0].length;
    return content.slice(0, insertPos) + 
           '\nimport { logger } from \'@/utils/logger\';' + 
           content.slice(insertPos);
  } else {
    // 如果没有找到import语句，在文件开头添加
    return 'import { logger } from \'@/utils/logger\';\n\n' + content;
  }
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    let needsLoggerImport = false;
    
    // 应用所有替换模式
    CONSOLE_PATTERNS.forEach(({ pattern, replacement }) => {
      const originalContent = content;
      
      if (typeof replacement === 'function') {
        content = content.replace(pattern, (...args) => {
          needsLoggerImport = true;
          hasChanges = true;
          totalReplacements++;
          return replacement(...args);
        });
      } else {
        content = content.replace(pattern, replacement);
        if (content !== originalContent) {
          needsLoggerImport = true;
          hasChanges = true;
          totalReplacements++;
        }
      }
    });
    
    // 如果需要logger导入且文件中还没有
    if (needsLoggerImport && !hasLoggerImport(content)) {
      content = addLoggerImport(content);
      hasChanges = true;
    }
    
    // 写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      processedFiles.add(filePath);
      console.log(`✅ 处理完成: ${path.relative(process.cwd(), filePath)}`);
    }
    
  } catch (error) {
    console.error(`处理文件失败: ${filePath} - ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🧹 开始批量清理控制台日志...\n');
  
  const srcPath = path.join(process.cwd(), 'src');
  const allFiles = getAllFiles(srcPath);
  
  console.log(`📁 找到 ${allFiles.length} 个文件\n`);
  
  allFiles.forEach(processFile);
  
  console.log('\n📊 处理结果:');
  console.log(`✅ 处理文件: ${processedFiles.size} 个`);
  console.log(`🔄 替换次数: ${totalReplacements} 次`);
  
  if (processedFiles.size > 0) {
    console.log('\n📝 已处理的文件:');
    Array.from(processedFiles).forEach(file => {
      console.log(`  - ${path.relative(process.cwd(), file)}`);
    });
  }
  
  console.log('\n🎉 清理完成！');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main };
