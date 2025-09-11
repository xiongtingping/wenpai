#!/usr/bin/env node
/**
 * 🔐 AI配置安全检查脚本
 * 
 * 🎯 目标：
 * - 检查AI API配置完整性和安全性
 * - 验证环境变量配置状态
 * - 检测硬编码API密钥和端点
 * - 提供配置优化建议
 * 
 * 📌 遵循CLAUDE.md规则：严禁硬编码、统一管理
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 颜色输出函数
const colors = {
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`, 
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`
};

// 配置检查结果
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: []
};

/**
 * 添加检查结果
 */
function addResult(type, category, message, details = null) {
  const result = {
    type, // 'pass', 'fail', 'warning'
    category,
    message,
    details
  };
  
  results.issues.push(result);
  
  if (type === 'pass') results.passed++;
  else if (type === 'fail') results.failed++;
  else if (type === 'warning') results.warnings++;
}

/**
 * 检查环境变量配置
 */
function checkEnvironmentVariables() {
  console.log(colors.blue('\n🔍 检查环境变量配置...\n'));
  
  // 读取 .env.example 文件获取期望的配置
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envExamplePath)) {
    addResult('fail', 'env', '.env.example 文件不存在');
    return;
  }
  
  if (!fs.existsSync(envLocalPath)) {
    addResult('warning', 'env', '.env.local 文件不存在，建议创建本地环境配置');
  }
  
  // 必需的AI相关环境变量
  const requiredAIVars = [
    'VITE_AIMLAPI_KEY',
    'VITE_AIMLAPI_BASE_URL'
  ];
  
  const optionalAIVars = [
    'VITE_DEEPSEEK_API_KEY',
    'VITE_DEEPSEEK_BASE_URL'
  ];
  
  // 检查必需变量
  requiredAIVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_api_key_here' || value.includes('placeholder')) {
      addResult('fail', 'env', `必需环境变量 ${varName} 未正确配置`);
    } else {
      addResult('pass', 'env', `环境变量 ${varName} 已配置`);
    }
  });
  
  // 检查可选变量
  optionalAIVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      addResult('warning', 'env', `可选环境变量 ${varName} 未配置 - 对应功能将不可用`);
    } else {
      addResult('pass', 'env', `环境变量 ${varName} 已配置`);
    }
  });
  
  addResult('pass', 'env', '环境变量配置检查完成');
}

/**
 * 检查硬编码API密钥和端点
 */
function checkHardcodedSecrets() {
  console.log(colors.blue('\n🚨 检查硬编码API密钥和端点...\n'));
  
  const sourceFiles = [];
  
  // 递归搜索源文件
  function scanDirectory(dir) {
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // 跳过某些目录
          if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(item)) {
            scanDirectory(fullPath);
          }
        } else if (item.match(/\\.(ts|tsx|js|jsx)$/)) {
          sourceFiles.push(fullPath);
        }
      });
    } catch (error) {
      // 忽略权限错误
    }
  }
  
  scanDirectory(path.join(process.cwd(), 'src'));
  scanDirectory(path.join(process.cwd(), 'netlify'));
  
  let hardcodedCount = 0;
  
  // 危险模式：直接硬编码的API密钥
  const dangerousPatterns = [
    /sk-[a-zA-Z0-9]{20,}/g,  // OpenAI密钥模式
    /sk-ant-[a-zA-Z0-9\\-_]{30,}/g,  // Anthropic密钥模式
    /AIza[a-zA-Z0-9\\-_]{35}/g,  // Google API密钥模式
  ];
  
  // 硬编码端点模式
  const endpointPatterns = [
    /https:\/\/api\.openai\.com/g,
    /https:\/\/api\.deepseek\.com/g,
    /https:\/\/api\.anthropic\.com/g,
    /https:\/\/api\.aimlapi\.com/g,
    /https:\/\/generativelanguage\.googleapis\.com/g,
  ];
  
  sourceFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // 检查危险的硬编码密钥
      dangerousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!match.includes('your_api_key') && !match.includes('placeholder')) {
              addResult('fail', 'security', `发现硬编码API密钥`, {
                file: relativePath,
                pattern: match.substring(0, 10) + '...',
                type: ['OpenAI密钥', 'Anthropic密钥', 'Google密钥'][index]
              });
              hardcodedCount++;
            }
          });
        }
      });
      
      // 检查硬编码端点 (警告级别)
      endpointPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches && !relativePath.includes('.example') && !relativePath.includes('config/aiEndpoints.ts')) {
          matches.forEach(match => {
            // 排除注释和文档
            const lines = content.split('\n');
            let isInComment = false;
            for (let line of lines) {
              if (line.includes(match)) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
                  addResult('warning', 'hardcode', `发现硬编码API端点`, {
                    file: relativePath,
                    endpoint: match,
                    line: line.trim()
                  });
                }
                break;
              }
            }
          });
        }
      });
      
    } catch (error) {
      // 忽略读取错误
    }
  });
  
  if (hardcodedCount === 0) {
    addResult('pass', 'security', '未发现硬编码API密钥');
  }
}

/**
 * 检查配置文件架构
 */
function checkConfigArchitecture() {
  console.log(colors.blue('\n🏗️ 检查配置架构..\n'));
  
  const configFiles = [
    'src/config/aiEndpoints.ts',
    'src/config/apiKeyManager.ts', 
    'src/config/aiModels.ts',
    'src/api/unifiedAIManager.ts'
  ];
  
  configFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      addResult('pass', 'architecture', `配置文件存在: ${filePath}`);
    } else {
      addResult('fail', 'architecture', `缺少配置文件: ${filePath}`);
    }
  });
  
  // 检查旧的硬编码文件是否已更新
  const oldFiles = [
    'src/api/unifiedAIService.ts'
  ];
  
  oldFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('已迁移到统一AI管理器') || content.includes('统一管理器')) {
        addResult('pass', 'migration', `文件已迁移到统一管理: ${filePath}`);
      } else {
        addResult('warning', 'migration', `文件可能需要迁移: ${filePath}`);
      }
    }
  });
}

/**
 * 检查类型安全性
 */
function checkTypeSafety() {
  console.log(colors.blue('\n🔒 检查类型安全性..\n'));
  
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsConfigPath)) {
    addResult('pass', 'types', 'TypeScript配置存在');
    
    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
      const strict = tsConfig.compilerOptions?.strict;
      if (strict) {
        addResult('pass', 'types', 'TypeScript严格模式已启用');
      } else {
        addResult('warning', 'types', '建议启用TypeScript严格模式');
      }
    } catch (error) {
      addResult('warning', 'types', 'TypeScript配置解析失败');
    }
  } else {
    addResult('warning', 'types', 'TypeScript配置不存在');
  }
}

/**
 * 生成配置报告
 */
function generateReport() {
  console.log(colors.bold('\n📊 AI配置安全检查报告\n'));
  console.log('='.repeat(50));
  
  // 总览
  console.log(colors.bold('\n📈 检查总览:'));
  console.log(`✅ 通过: ${colors.green(results.passed)}`);
  console.log(`⚠️  警告: ${colors.yellow(results.warnings)}`);
  console.log(`❌ 失败: ${colors.red(results.failed)}`);
  
  // 分类统计
  const categories = {};
  results.issues.forEach(issue => {
    if (!categories[issue.category]) {
      categories[issue.category] = { pass: 0, fail: 0, warning: 0 };
    }
    categories[issue.category][issue.type]++;
  });
  
  console.log(colors.bold('\n📋 分类统计:'));
  Object.entries(categories).forEach(([category, stats]) => {
    console.log(`${category}: 通过 ${stats.pass} | 警告 ${stats.warning} | 失败 ${stats.fail}`);
  });
  
  // 详细问题
  const failures = results.issues.filter(i => i.type === 'fail');
  if (failures.length > 0) {
    console.log(colors.bold(colors.red('\n❌ 严重问题:')));
    failures.forEach(issue => {
      console.log(`  - ${issue.message}`);
      if (issue.details) {
        Object.entries(issue.details).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });
  }
  
  const warnings = results.issues.filter(i => i.type === 'warning');
  if (warnings.length > 0) {
    console.log(colors.bold(colors.yellow('\n⚠️ 警告项目:')));
    warnings.forEach(issue => {
      console.log(`  - ${issue.message}`);
      if (issue.details) {
        Object.entries(issue.details).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });
  }
  
  // 建议
  console.log(colors.bold(colors.cyan('\n💡 优化建议:')));
  
  if (results.failed > 0) {
    console.log('  1. 🔥 立即修复失败项目 - 这些是安全和功能的关键问题');
  }
  
  if (warnings.some(w => w.category === 'env')) {
    console.log('  2. 🔧 完善环境变量配置 - 复制 .env.example 为 .env.local 并填入真实配置');
  }
  
  if (warnings.some(w => w.category === 'hardcode')) {
    console.log('  3. 🧹 清理硬编码端点 - 迁移到统一配置管理系统');
  }
  
  console.log('  4. ✅ 定期运行此检查脚本确保配置安全性');
  console.log('  5. 📚 参考 CLAUDE.md 规则进行配置管理');
  
  // 最终结论
  console.log(colors.bold('\n🎯 最终结论:'));
  if (results.failed === 0) {
    console.log(colors.green('✅ AI配置安全检查通过！系统配置符合安全要求。'));
  } else {
    console.log(colors.red(`❌ 发现 ${results.failed} 个严重问题需要立即修复。`));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(colors.cyan('🔐 AI API统一管理系统 - 配置检查完成'));
  console.log(colors.cyan('📌 遵循 CLAUDE.md 规则：严禁硬编码、统一管理'));
}

/**
 * 主函数
 */
function main() {
  console.log(colors.bold(colors.cyan('🔐 AI配置安全检查工具')));
  console.log(colors.cyan('📌 检查AI API配置的安全性和完整性\n'));
  
  try {
    checkEnvironmentVariables();
    checkHardcodedSecrets();
    checkConfigArchitecture();
    checkTypeSafety();
    generateReport();
    
    // 退出码
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(colors.red('❌ 检查过程出现错误:'), error.message);
    process.exit(1);
  }
}

// 运行检查
if (import.meta.url === `file://${__filename}`) {
  main();
}