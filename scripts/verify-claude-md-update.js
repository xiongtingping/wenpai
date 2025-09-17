#!/usr/bin/env node

/**
 * 🧪 CLAUDE.md文档更新验证脚本
 * 验证CSS命名规范统一系统是否成功写入CLAUDE.md
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 开始验证CLAUDE.md文档更新...\n');

const projectRoot = process.cwd();
const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');

let verificationResults = {
  passed: 0,
  failed: 0,
  details: []
};

/**
 * 添加验证结果
 */
function addResult(message, status = 'info') {
  verificationResults.details.push({ message, status });
  if (status === 'pass') verificationResults.passed++;
  else if (status === 'fail') verificationResults.failed++;
}

/**
 * 验证CLAUDE.md文件存在
 */
function verifyCLAUDEMdExists() {
  console.log('📄 验证CLAUDE.md文件存在...');
  
  if (fs.existsSync(claudeMdPath)) {
    addResult('✅ CLAUDE.md文件存在', 'pass');
    return true;
  } else {
    addResult('❌ CLAUDE.md文件不存在', 'fail');
    return false;
  }
}

/**
 * 验证CSS命名规范章节
 */
function verifyCSSNamingSection() {
  console.log('📝 验证CSS命名规范章节...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  // 验证主章节标题
  if (content.includes('## 3.8 CSS命名规范统一系统')) {
    addResult('✅ 主章节标题存在', 'pass');
  } else {
    addResult('❌ 主章节标题缺失', 'fail');
  }
  
  // 验证子章节
  const expectedSections = [
    '### 3.8.1 命名规范宪章',
    '### 3.8.2 CSS命名规范体系',
    '### 3.8.3 React组件命名规范体系',
    '### 3.8.4 文件组织规范体系',
    '### 3.8.5 自动化检查与强制执行',
    '### 3.8.6 违规处理与纠正机制',
    '### 3.8.7 成功案例与最佳实践',
    '### 3.8.8 持续改进与监控',
    '### 3.8.9 长期维护策略'
  ];
  
  expectedSections.forEach(section => {
    if (content.includes(section)) {
      addResult(`✅ 子章节存在: ${section}`, 'pass');
    } else {
      addResult(`❌ 子章节缺失: ${section}`, 'fail');
    }
  });
}

/**
 * 验证关键概念和规则
 */
function verifyKeyConceptsAndRules() {
  console.log('🎯 验证关键概念和规则...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  // 验证CSS命名规范关键概念
  const cssKeywords = [
    'kebab-case命名法',
    'BEM方法论',
    'design-tokens-',
    'fix-',
    'unified-',
    '块__元素--修饰符'
  ];
  
  cssKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      addResult(`✅ CSS关键概念存在: ${keyword}`, 'pass');
    } else {
      addResult(`❌ CSS关键概念缺失: ${keyword}`, 'fail');
    }
  });
  
  // 验证React命名规范关键概念
  const reactKeywords = [
    'PascalCase命名法',
    'use前缀',
    'useDialogPositioning',
    'QuickReferenceDialog',
    'EnhancedHistoryDialog'
  ];
  
  reactKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      addResult(`✅ React关键概念存在: ${keyword}`, 'pass');
    } else {
      addResult(`❌ React关键概念缺失: ${keyword}`, 'fail');
    }
  });
}

/**
 * 验证设计令牌系统
 */
function verifyDesignTokenSystem() {
  console.log('🎨 验证设计令牌系统...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  const designTokenKeywords = [
    '--dialog-position-top',
    '--dialog-position-left',
    '--dialog-max-width',
    '--dialog-background',
    '--dialog-transition-duration',
    'var(--color-background)',
    'var(--spacing-4)'
  ];
  
  designTokenKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      addResult(`✅ 设计令牌存在: ${keyword}`, 'pass');
    } else {
      addResult(`❌ 设计令牌缺失: ${keyword}`, 'fail');
    }
  });
}

/**
 * 验证自动化工具配置
 */
function verifyAutomationTools() {
  console.log('🔧 验证自动化工具配置...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  const toolKeywords = [
    'ESLint规则配置',
    'Stylelint规则配置',
    'selector-class-pattern',
    'custom-property-pattern',
    'react/function-component-definition',
    'unicorn/filename-case'
  ];
  
  toolKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      addResult(`✅ 自动化工具配置存在: ${keyword}`, 'pass');
    } else {
      addResult(`❌ 自动化工具配置缺失: ${keyword}`, 'fail');
    }
  });
}

/**
 * 验证成功案例
 */
function verifySuccessCase() {
  console.log('📈 验证成功案例...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  const successCaseKeywords = [
    '命名规范统一成功案例 (2025-01-17)',
    '16个Dialog相关CSS文件',
    '94KB减少到30KB',
    'useDialogPositioning',
    'design-tokens-dialog.css'
  ];
  
  successCaseKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      addResult(`✅ 成功案例内容存在: ${keyword}`, 'pass');
    } else {
      addResult(`❌ 成功案例内容缺失: ${keyword}`, 'fail');
    }
  });
}

/**
 * 验证强制执行要求
 */
function verifyEnforcementRequirements() {
  console.log('⚠️ 验证强制执行要求...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  
  if (content.includes('CSS命名规范统一系统具有强制性')) {
    addResult('✅ 强制执行要求存在', 'pass');
  } else {
    addResult('❌ 强制执行要求缺失', 'fail');
  }
  
  if (content.includes('违反规范的代码将被自动阻断')) {
    addResult('✅ 自动阻断机制说明存在', 'pass');
  } else {
    addResult('❌ 自动阻断机制说明缺失', 'fail');
  }
}

/**
 * 验证文档结构完整性
 */
function verifyDocumentStructure() {
  console.log('📋 验证文档结构完整性...');
  
  const content = fs.readFileSync(claudeMdPath, 'utf8');
  const lines = content.split('\n');
  
  // 统计章节数量
  const mainSections = lines.filter(line => line.match(/^## \d+\./)).length;
  const subSections = lines.filter(line => line.match(/^### \d+\.\d+/)).length;
  
  addResult(`✅ 主章节数量: ${mainSections}`, 'pass');
  addResult(`✅ 子章节数量: ${subSections}`, 'pass');
  
  // 验证文档长度
  const totalLines = lines.length;
  if (totalLines > 1600) {
    addResult(`✅ 文档长度合理: ${totalLines} 行`, 'pass');
  } else {
    addResult(`❌ 文档长度可能不足: ${totalLines} 行`, 'fail');
  }
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('\n📊 CLAUDE.md文档更新验证报告');
  console.log('==================================================');
  console.log(`✅ 通过: ${verificationResults.passed}`);
  console.log(`❌ 失败: ${verificationResults.failed}`);
  console.log('==================================================\n');
  
  // 显示所有结果
  verificationResults.details.forEach(result => {
    console.log(`  ${result.message}`);
  });
  
  // 总体评估
  const totalChecks = verificationResults.passed + verificationResults.failed;
  const successRate = Math.round((verificationResults.passed / totalChecks) * 100);
  
  console.log(`\n🎯 总体评估:`);
  console.log(`成功率: ${successRate}%`);
  
  if (verificationResults.failed === 0) {
    console.log('🎉 CLAUDE.md文档更新验证完全通过！');
    console.log('📚 CSS命名规范统一系统已成功写入CLAUDE.md文档');
  } else if (verificationResults.failed <= 3) {
    console.log('⚠️ CLAUDE.md文档更新基本成功，存在少量问题。');
  } else {
    console.log('❌ CLAUDE.md文档更新存在较多问题，需要进一步检查。');
  }
  
  return verificationResults.failed === 0;
}

// 执行所有验证
try {
  if (!verifyCLAUDEMdExists()) {
    process.exit(1);
  }
  
  verifyCSSNamingSection();
  verifyKeyConceptsAndRules();
  verifyDesignTokenSystem();
  verifyAutomationTools();
  verifySuccessCase();
  verifyEnforcementRequirements();
  verifyDocumentStructure();
  
  const allPassed = generateReport();
  
  if (allPassed) {
    console.log('\n🚀 下一步: CLAUDE.md文档已更新，团队可以开始使用新的命名规范');
  }
  
  process.exit(allPassed ? 0 : 1);
} catch (error) {
  console.error('💥 验证过程中发生错误:', error);
  process.exit(1);
}
