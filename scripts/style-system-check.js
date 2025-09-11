#!/usr/bin/env node

/**
 * 样式系统合规性检查工具
 * 检查项目是否遵循统一样式系统规范
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查结果
const checkResults = {
  passed: [],
  warnings: [],
  errors: [],
  summary: {
    totalFiles: 0,
    checkedFiles: 0,
    passedChecks: 0,
    warningChecks: 0,
    errorChecks: 0
  }
};

// 检查规则配置
const CHECK_RULES = {
  // 硬编码颜色检查
  hardcodedColors: {
    pattern: /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\((?!var\(--)[^)]+\)|hsla\((?!var\(--)[^)]+\)/g,
    severity: 'error',
    message: '发现硬编码颜色值，应使用设计令牌',
    suggestion: '使用 hsl(var(--primary)) 等设计令牌'
  },
  
  // 硬编码尺寸检查
  hardcodedSizes: {
    pattern: /(?:width|height|margin|padding|top|left|right|bottom|font-size|border-radius):\s*\d+(px|rem|em)/g,
    severity: 'warning',
    message: '发现硬编码尺寸值，建议使用设计令牌',
    suggestion: '使用 var(--spacing-4) 等设计令牌'
  },
  
  // !important 过度使用检查
  importantOveruse: {
    pattern: /!important/g,
    severity: 'warning',
    message: '发现 !important 使用，请确认是否必要',
    suggestion: '仅在修复第三方组件冲突时使用'
  },
  
  // 内联样式检查
  inlineStyles: {
    pattern: /style\s*=\s*\{\{[^}]*(?:color|background|margin|padding|width|height):[^}]*\}\}/g,
    severity: 'error',
    message: '发现静态内联样式，应使用CSS类',
    suggestion: '使用 className 或 CSS 变量'
  },
  
  // CSS变量命名检查
  cssVariableNaming: {
    pattern: /--[a-zA-Z][a-zA-Z0-9]*(?:-[a-zA-Z0-9]+)*/g,
    severity: 'info',
    message: 'CSS变量命名检查',
    suggestion: '使用 kebab-case 命名'
  },
  
  // Tailwind硬编码类检查
  tailwindHardcoded: {
    pattern: /(?:bg|text|border)-(?:red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g,
    severity: 'error',
    message: '发现硬编码Tailwind颜色类，应使用语义化类',
    suggestion: '使用 bg-primary, text-foreground 等语义化类'
  }
};

/**
 * 获取所有需要检查的文件
 */
function getFilesToCheck() {
  const files = [];
  const extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
  
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !['node_modules', '.git', 'dist', 'build'].includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️ 无法扫描目录: ${dir}`);
    }
  }
  
  scanDirectory('./src');
  return files;
}

/**
 * 检查单个文件
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    checkResults.summary.totalFiles++;
    checkResults.summary.checkedFiles++;
    
    // 对每个规则进行检查
    Object.entries(CHECK_RULES).forEach(([ruleName, rule]) => {
      const matches = [...content.matchAll(rule.pattern)];
      
      matches.forEach(match => {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNumber - 1];
        
        // 跳过注释中的匹配
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
          return;
        }
        
        const issue = {
          file: filePath,
          line: lineNumber,
          column: match.index - content.lastIndexOf('\n', match.index - 1),
          rule: ruleName,
          severity: rule.severity,
          message: rule.message,
          suggestion: rule.suggestion,
          content: match[0],
          context: line.trim()
        };
        
        switch (rule.severity) {
          case 'error':
            checkResults.errors.push(issue);
            checkResults.summary.errorChecks++;
            break;
          case 'warning':
            checkResults.warnings.push(issue);
            checkResults.summary.warningChecks++;
            break;
          default:
            checkResults.passed.push(issue);
            checkResults.summary.passedChecks++;
        }
      });
    });
    
  } catch (error) {
    console.warn(`❌ 无法检查文件: ${filePath} - ${error.message}`);
  }
}

/**
 * 检查设计令牌使用情况
 */
function checkTokenUsage() {
  console.log('\n🎨 检查设计令牌使用情况...');
  
  try {
    // 检查是否存在设计令牌文件
    const tokenFiles = [
      'tokens/tokens.json',
      'tokens/build/css-vars.css',
      'src/styles/design-tokens.css'
    ];
    
    const existingTokenFiles = tokenFiles.filter(file => fs.existsSync(file));
    
    if (existingTokenFiles.length === 0) {
      checkResults.errors.push({
        file: 'project',
        rule: 'tokenSystem',
        severity: 'error',
        message: '未找到设计令牌文件',
        suggestion: '创建 tokens/tokens.json 和相关构建文件'
      });
    } else {
      checkResults.passed.push({
        file: 'project',
        rule: 'tokenSystem',
        severity: 'info',
        message: `找到 ${existingTokenFiles.length} 个设计令牌文件`,
        suggestion: '继续保持使用设计令牌'
      });
    }
    
  } catch (error) {
    console.warn('⚠️ 设计令牌检查失败:', error.message);
  }
}

/**
 * 检查Tailwind配置
 */
function checkTailwindConfig() {
  console.log('\n🎯 检查Tailwind配置...');
  
  try {
    const configPath = 'tailwind.config.js';
    
    if (!fs.existsSync(configPath)) {
      checkResults.warnings.push({
        file: 'project',
        rule: 'tailwindConfig',
        severity: 'warning',
        message: '未找到Tailwind配置文件',
        suggestion: '创建 tailwind.config.js 文件'
      });
      return;
    }
    
    const config = fs.readFileSync(configPath, 'utf8');
    
    // 检查是否使用了设计令牌
    if (config.includes('var(--') || config.includes('hsl(var(--')) {
      checkResults.passed.push({
        file: configPath,
        rule: 'tailwindTokens',
        severity: 'info',
        message: 'Tailwind配置使用了设计令牌',
        suggestion: '继续保持使用设计令牌'
      });
    } else {
      checkResults.warnings.push({
        file: configPath,
        rule: 'tailwindTokens',
        severity: 'warning',
        message: 'Tailwind配置未使用设计令牌',
        suggestion: '在Tailwind配置中引用CSS变量'
      });
    }
    
  } catch (error) {
    console.warn('⚠️ Tailwind配置检查失败:', error.message);
  }
}

/**
 * 运行Stylelint检查
 */
function runStylelintCheck() {
  console.log('\n🔍 运行Stylelint检查...');
  
  try {
    const result = execSync('npx stylelint "src/**/*.{css,scss}" --formatter json', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    const stylelintResults = JSON.parse(result);
    
    stylelintResults.forEach(fileResult => {
      fileResult.warnings.forEach(warning => {
        const issue = {
          file: fileResult.source,
          line: warning.line,
          column: warning.column,
          rule: 'stylelint',
          severity: warning.severity,
          message: warning.text,
          suggestion: '参考Stylelint规则文档'
        };
        
        if (warning.severity === 'error') {
          checkResults.errors.push(issue);
          checkResults.summary.errorChecks++;
        } else {
          checkResults.warnings.push(issue);
          checkResults.summary.warningChecks++;
        }
      });
    });
    
  } catch (error) {
    // Stylelint可能未安装或配置错误
    console.warn('⚠️ Stylelint检查跳过:', error.message.split('\n')[0]);
  }
}

/**
 * 生成检查报告
 */
function generateReport() {
  console.log('\n📊 样式系统合规性检查报告');
  console.log('='.repeat(60));
  
  // 总体统计
  console.log(`📁 检查文件: ${checkResults.summary.checkedFiles} 个`);
  console.log(`✅ 通过检查: ${checkResults.summary.passedChecks} 个`);
  console.log(`⚠️ 警告: ${checkResults.summary.warningChecks} 个`);
  console.log(`❌ 错误: ${checkResults.summary.errorChecks} 个`);
  
  // 错误详情
  if (checkResults.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    checkResults.errors.slice(0, 10).forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.file}:${error.line || 'N/A'}`);
      console.log(`     ${error.message}`);
      console.log(`     建议: ${error.suggestion}`);
      if (error.content) {
        console.log(`     内容: ${error.content}`);
      }
      console.log('');
    });
    
    if (checkResults.errors.length > 10) {
      console.log(`     ... 还有 ${checkResults.errors.length - 10} 个错误`);
    }
  }
  
  // 警告详情
  if (checkResults.warnings.length > 0) {
    console.log('\n⚠️ 警告详情:');
    checkResults.warnings.slice(0, 5).forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning.file}:${warning.line || 'N/A'}`);
      console.log(`     ${warning.message}`);
      console.log(`     建议: ${warning.suggestion}`);
      console.log('');
    });
    
    if (checkResults.warnings.length > 5) {
      console.log(`     ... 还有 ${checkResults.warnings.length - 5} 个警告`);
    }
  }
  
  // 合规性评分
  const totalIssues = checkResults.summary.errorChecks + checkResults.summary.warningChecks;
  const totalChecks = totalIssues + checkResults.summary.passedChecks;
  const complianceScore = totalChecks > 0 ? Math.round((checkResults.summary.passedChecks / totalChecks) * 100) : 100;
  
  console.log(`\n🎯 合规性评分: ${complianceScore}%`);
  
  if (complianceScore >= 90) {
    console.log('🎉 优秀！样式系统高度合规');
  } else if (complianceScore >= 70) {
    console.log('👍 良好，还有改进空间');
  } else if (complianceScore >= 50) {
    console.log('⚠️ 需要改进样式系统合规性');
  } else {
    console.log('❌ 样式系统需要重大改进');
  }
  
  // 保存详细报告
  fs.writeFileSync(
    'style-system-check-report.json',
    JSON.stringify(checkResults, null, 2)
  );
  
  console.log('\n✅ 详细报告已保存到 style-system-check-report.json');
}

/**
 * 主检查函数
 */
function runStyleSystemCheck() {
  console.log('🔍 开始样式系统合规性检查...');
  
  // 获取文件列表
  const files = getFilesToCheck();
  console.log(`📁 找到 ${files.length} 个文件`);
  
  // 检查每个文件
  files.forEach((file, index) => {
    if (index % 50 === 0) {
      console.log(`📊 检查进度: ${index}/${files.length} (${Math.round(index/files.length*100)}%)`);
    }
    checkFile(file);
  });
  
  // 额外检查
  checkTokenUsage();
  checkTailwindConfig();
  runStylelintCheck();
  
  // 生成报告
  generateReport();
  
  // 返回退出码
  const hasErrors = checkResults.errors.length > 0;
  process.exit(hasErrors ? 1 : 0);
}

// 运行检查
if (require.main === module) {
  runStyleSystemCheck();
}

module.exports = { runStyleSystemCheck, checkResults };
