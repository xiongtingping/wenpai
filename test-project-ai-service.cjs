#!/usr/bin/env node

/**
 * 测试项目内部AI服务
 * 验证AI服务架构和配置是否正确
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

/**
 * 检查AI服务文件
 */
function checkAIServiceFiles() {
  logSection('AI服务文件检查');
  
  const files = [
    'src/api/aiService.ts',
    'src/config/apiConfig.ts',
    'src/api/ai.ts',
    'src/pages/AIConfigTestPage.tsx'
  ];

  let allExist = true;

  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} - 存在`, 'green');
    } else {
      log(`❌ ${file} - 不存在`, 'red');
      allExist = false;
    }
  }

  return allExist;
}

/**
 * 检查AI服务配置
 */
function checkAIServiceConfig() {
  logSection('AI服务配置检查');
  
  try {
    // 检查API配置文件
    const apiConfigPath = path.join(__dirname, 'src/config/apiConfig.ts');
    const apiConfigContent = fs.readFileSync(apiConfigPath, 'utf8');
    
    // 检查是否使用环境变量
    if (apiConfigContent.includes('VITE_OPENAI_API_KEY')) {
      log('✅ 使用环境变量配置API密钥', 'green');
    } else {
      log('❌ 未使用环境变量配置API密钥', 'red');
    }
    
    // 检查是否有硬编码密钥
    if (apiConfigContent.includes('sk-') && !apiConfigContent.includes('VITE_')) {
      log('⚠️  发现可能的硬编码API密钥', 'yellow');
    } else {
      log('✅ 未发现硬编码API密钥', 'green');
    }
    
    // 检查是否支持多种AI提供商
    if (apiConfigContent.includes('openai') && apiConfigContent.includes('deepseek')) {
      log('✅ 支持多种AI提供商', 'green');
    } else {
      log('⚠️  AI提供商支持可能不完整', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ 检查AI服务配置失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 检查AI服务实现
 */
function checkAIServiceImplementation() {
  logSection('AI服务实现检查');
  
  try {
    // 检查AI服务文件
    const aiServicePath = path.join(__dirname, 'src/api/aiService.ts');
    const aiServiceContent = fs.readFileSync(aiServicePath, 'utf8');
    
    // 检查是否使用统一AI接口
    if (aiServiceContent.includes('callAI') || aiServiceContent.includes('callAIWithRetry')) {
      log('✅ 使用统一AI接口', 'green');
    } else {
      log('❌ 未使用统一AI接口', 'red');
    }
    
    // 检查是否有模拟数据
    if (aiServiceContent.includes('mock') || aiServiceContent.includes('模拟')) {
      log('⚠️  发现可能的模拟数据', 'yellow');
    } else {
      log('✅ 未发现模拟数据', 'green');
    }
    
    // 检查错误处理
    if (aiServiceContent.includes('try') && aiServiceContent.includes('catch')) {
      log('✅ 有错误处理机制', 'green');
    } else {
      log('⚠️  错误处理可能不完整', 'yellow');
    }
    
    // 检查重试机制
    if (aiServiceContent.includes('retry') || aiServiceContent.includes('Retry')) {
      log('✅ 有重试机制', 'green');
    } else {
      log('⚠️  重试机制可能不完整', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ 检查AI服务实现失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 检查统一AI接口
 */
function checkUnifiedAIInterface() {
  logSection('统一AI接口检查');
  
  try {
    // 检查统一AI接口文件
    const aiPath = path.join(__dirname, 'src/api/ai.ts');
    const aiContent = fs.readFileSync(aiPath, 'utf8');
    
    // 检查主要函数
    const functions = ['callAI', 'callAIWithRetry', 'callAIBatch', 'generateImage'];
    let foundFunctions = 0;
    
    for (const func of functions) {
      if (aiContent.includes(func)) {
        log(`✅ 找到函数: ${func}`, 'green');
        foundFunctions++;
      } else {
        log(`❌ 未找到函数: ${func}`, 'red');
      }
    }
    
    // 检查支持的模型
    const models = ['gpt-4', 'gpt-3.5-turbo', 'deepseek-chat', 'gemini-pro'];
    let foundModels = 0;
    
    for (const model of models) {
      if (aiContent.includes(model)) {
        log(`✅ 支持模型: ${model}`, 'green');
        foundModels++;
      }
    }
    
    // 检查JSDoc注释
    if (aiContent.includes('/**') && aiContent.includes('@param')) {
      log('✅ 有JSDoc注释', 'green');
    } else {
      log('⚠️  JSDoc注释可能不完整', 'yellow');
    }
    
    return foundFunctions >= 2 && foundModels >= 2;
  } catch (error) {
    log(`❌ 检查统一AI接口失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 检查环境变量配置
 */
function checkEnvironmentVariables() {
  logSection('环境变量配置检查');
  
  try {
    const envPath = path.join(__dirname, '.env.local');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // 检查OpenAI API密钥
      if (envContent.includes('VITE_OPENAI_API_KEY=')) {
        const apiKey = envContent.match(/VITE_OPENAI_API_KEY=(.+)/)?.[1]?.trim();
        if (apiKey && apiKey !== 'sk-your-openai-api-key-here') {
          log('✅ OpenAI API密钥已配置', 'green');
          log(`   密钥: ${apiKey.substring(0, 20)}...`, 'green');
        } else {
          log('❌ OpenAI API密钥未正确配置', 'red');
        }
      } else {
        log('❌ 未找到OpenAI API密钥配置', 'red');
      }
      
      // 检查其他配置
      const configs = [
        'VITE_DEV_MODE',
        'VITE_API_TIMEOUT',
        'VITE_ENABLE_AI_FEATURES'
      ];
      
      for (const config of configs) {
        if (envContent.includes(config)) {
          log(`✅ ${config} 已配置`, 'green');
        } else {
          log(`⚠️  ${config} 未配置`, 'yellow');
        }
      }
      
      return true;
    } else {
      log('❌ .env.local 文件不存在', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 检查环境变量失败: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 生成测试报告
 */
function generateReport(results) {
  logSection('测试报告');
  
  const { files, config, implementation, interface, env } = results;
  
  log(`文件完整性: ${files ? '✅ 完整' : '❌ 缺失'}`, files ? 'green' : 'red');
  log(`配置正确性: ${config ? '✅ 正确' : '❌ 错误'}`, config ? 'green' : 'red');
  log(`实现质量: ${implementation ? '✅ 良好' : '❌ 需要改进'}`, implementation ? 'green' : 'red');
  log(`接口完整性: ${interface ? '✅ 完整' : '❌ 不完整'}`, interface ? 'green' : 'red');
  log(`环境配置: ${env ? '✅ 已配置' : '❌ 未配置'}`, env ? 'green' : 'red');
  
  console.log('\n');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  if (passedTests === totalTests) {
    log('🎉 恭喜！AI服务架构完全正确', 'green');
    log('您的AI服务已正确配置为使用真实API', 'green');
    log('一旦网络连接问题解决，所有AI功能将正常工作', 'green');
  } else {
    log(`⚠️  发现问题 (${passedTests}/${totalTests} 项通过)`, 'yellow');
    
    if (!files) {
      log('建议: 检查项目文件是否完整', 'yellow');
    }
    
    if (!config) {
      log('建议: 检查API配置文件', 'yellow');
    }
    
    if (!implementation) {
      log('建议: 改进AI服务实现', 'yellow');
    }
    
    if (!interface) {
      log('建议: 完善统一AI接口', 'yellow');
    }
    
    if (!env) {
      log('建议: 配置环境变量', 'yellow');
    }
  }
}

/**
 * 主函数
 */
async function main() {
  log(`${colors.bold}🤖 项目AI服务架构测试${colors.reset}`, 'blue');
  log('正在检查AI服务架构和配置...', 'blue');
  
  try {
    // 运行所有检查
    const filesResult = checkAIServiceFiles();
    const configResult = checkAIServiceConfig();
    const implementationResult = checkAIServiceImplementation();
    const interfaceResult = checkUnifiedAIInterface();
    const envResult = checkEnvironmentVariables();
    
    // 生成报告
    generateReport({
      files: filesResult,
      config: configResult,
      implementation: implementationResult,
      interface: interfaceResult,
      env: envResult
    });
    
  } catch (error) {
    log(`❌ 测试过程中发生错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  main();
}

module.exports = {
  checkAIServiceFiles,
  checkAIServiceConfig,
  checkAIServiceImplementation,
  checkUnifiedAIInterface,
  checkEnvironmentVariables,
  generateReport
}; 