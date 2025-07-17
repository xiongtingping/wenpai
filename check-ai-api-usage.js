#!/usr/bin/env node

/**
 * AI API 使用检查脚本
 * 检查项目中是否有直接使用 fetch/axios 调用 AI API 的地方
 */

const fs = require('fs');
const path = require('path');

// 禁止的API调用模式
const FORBIDDEN_PATTERNS = [
  // OpenAI API
  /fetch.*openai/i,
  /fetch.*api\.openai/i,
  /fetch.*v1\/chat\/completions/i,
  /fetch.*v1\/images\/generations/i,
  /axios.*openai/i,
  /axios.*api\.openai/i,
  
  // Gemini API
  /fetch.*gemini/i,
  /fetch.*api\.gemini/i,
  /axios.*gemini/i,
  /axios.*api\.gemini/i,
  
  // Deepseek API
  /fetch.*deepseek/i,
  /fetch.*api\.deepseek/i,
  /axios.*deepseek/i,
  /axios.*api\.deepseek/i,
  
  // Claude API
  /fetch.*claude/i,
  /fetch.*api\.claude/i,
  /axios.*claude/i,
  /axios.*api\.claude/i,
  
  // 其他AI服务
  /fetch.*anthropic/i,
  /fetch.*api\.anthropic/i,
  /axios.*anthropic/i,
  /axios.*api\.anthropic/i,
];

// 允许的文件（这些文件可以包含AI API调用）
const ALLOWED_FILES = [
  'src/api/ai.ts', // 统一的AI API文件
  'src/api/ai-examples.ts', // 示例文件
  'src/api/README.md', // 文档文件
  'AI_API_UNIFICATION_SUMMARY.md', // 总结文档
  'check-ai-api-usage.js', // 本检查脚本
];

// 忽略的目录
const IGNORE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.nyc_output',
  '.vscode',
  '.idea',
  '*.log',
  '*.lock'
];

// 检查的文件扩展名
const CHECK_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

/**
 * 检查文件是否包含禁止的API调用
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations = [];

    lines.forEach((line, index) => {
      FORBIDDEN_PATTERNS.forEach(pattern => {
        if (pattern.test(line)) {
          violations.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString()
          });
        }
      });
    });

    return violations;
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error.message);
    return [];
  }
}

/**
 * 递归遍历目录
 */
function walkDir(dir) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 检查是否应该忽略此目录
        const shouldIgnore = IGNORE_DIRS.some(ignoreDir => {
          if (ignoreDir.includes('*')) {
            const pattern = new RegExp(ignoreDir.replace('*', '.*'));
            return pattern.test(item);
          }
          return item === ignoreDir;
        });
        
        if (!shouldIgnore) {
          files.push(...walkDir(fullPath));
        }
      } else if (stat.isFile()) {
        // 检查文件扩展名
        const ext = path.extname(item);
        if (CHECK_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`读取目录失败: ${dir}`, error.message);
  }
  
  return files;
}

/**
 * 主检查函数
 */
function main() {
  console.log('🔍 开始检查AI API使用情况...\n');
  
  const projectRoot = process.cwd();
  const allFiles = walkDir(projectRoot);
  
  console.log(`📁 找到 ${allFiles.length} 个文件需要检查\n`);
  
  let totalViolations = 0;
  let filesWithViolations = 0;
  
  for (const file of allFiles) {
    const relativePath = path.relative(projectRoot, file);
    
    // 检查是否是允许的文件
    const isAllowed = ALLOWED_FILES.some(allowed => relativePath.includes(allowed));
    
    if (isAllowed) {
      console.log(`✅ 跳过允许的文件: ${relativePath}`);
      continue;
    }
    
    const violations = checkFile(file);
    
    if (violations.length > 0) {
      filesWithViolations++;
      totalViolations += violations.length;
      
      console.log(`❌ 发现违规: ${relativePath}`);
      violations.forEach(violation => {
        console.log(`   第${violation.line}行: ${violation.content}`);
      });
      console.log('');
    }
  }
  
  console.log('📊 检查结果:');
  console.log(`   检查文件数: ${allFiles.length}`);
  console.log(`   违规文件数: ${filesWithViolations}`);
  console.log(`   违规总数: ${totalViolations}`);
  
  if (totalViolations === 0) {
    console.log('\n🎉 恭喜！没有发现任何违规的AI API调用。');
    console.log('✅ 所有AI调用都通过统一的 callAI() 函数进行。');
    process.exit(0);
  } else {
    console.log('\n❌ 发现违规的AI API调用！');
    console.log('🚫 请使用统一的 callAI() 函数替代直接的 fetch/axios 调用。');
    console.log('📖 参考 src/api/README.md 了解正确的使用方式。');
    process.exit(1);
  }
}

// 运行检查
if (require.main === module) {
  main();
}

module.exports = { checkFile, walkDir, main }; 