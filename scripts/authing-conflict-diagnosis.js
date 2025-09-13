#!/usr/bin/env node

/**
 * 🚨 Authing Guard与历史记录弹窗冲突诊断脚本
 * 
 * 专门检测和修复Authing Guard对历史记录弹窗的影响
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚨 Authing Guard冲突诊断\n');

// 诊断结果
const diagnosis = {
  authingFiles: [],
  conflictFixes: [],
  cssImports: [],
  issues: [],
  score: 0,
  maxScore: 0
};

/**
 * 检查Authing相关CSS文件
 */
function checkAuthingCSSFiles() {
  console.log('🔍 检查Authing相关CSS文件...');
  
  const authingCSSFiles = [
    'src/styles/authing-modal-architecture-fix.css',
    'src/styles/authing-accessibility-fix.css',
    'src/styles/authing-dialog-conflict-fix.css'
  ];
  
  authingCSSFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    diagnosis.maxScore++;
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      diagnosis.authingFiles.push({
        path: filePath,
        exists: true,
        size: content.length,
        hasConflictFix: content.includes('enhanced-history-dialog')
      });
      
      diagnosis.conflictFixes.push(`✅ ${filePath} 存在`);
      diagnosis.score++;
      
      // 检查关键修复点
      if (content.includes('enhanced-history-dialog')) {
        diagnosis.conflictFixes.push(`✅ ${filePath} 包含历史记录弹窗修复`);
      }
      
      if (content.includes('z-index: 1000000')) {
        diagnosis.conflictFixes.push(`✅ ${filePath} 包含z-index冲突修复`);
      }
      
    } else {
      diagnosis.issues.push(`❌ ${filePath} 不存在`);
      diagnosis.authingFiles.push({
        path: filePath,
        exists: false,
        size: 0,
        hasConflictFix: false
      });
    }
  });
}

/**
 * 检查CSS文件引入
 */
function checkCSSImports() {
  console.log('🔍 检查CSS文件引入...');
  
  const indexCssPath = path.join(projectRoot, 'src/index.css');
  if (fs.existsSync(indexCssPath)) {
    const content = fs.readFileSync(indexCssPath, 'utf8');
    
    const requiredImports = [
      "@import './styles/authing-modal-architecture-fix.css'",
      "@import './styles/authing-accessibility-fix.css'",
      "@import './styles/authing-dialog-conflict-fix.css'"
    ];
    
    requiredImports.forEach(importStatement => {
      diagnosis.maxScore++;
      if (content.includes(importStatement)) {
        diagnosis.cssImports.push(`✅ ${importStatement}`);
        diagnosis.score++;
      } else {
        diagnosis.issues.push(`❌ 缺少引入: ${importStatement}`);
      }
    });
  } else {
    diagnosis.issues.push('❌ index.css文件不存在');
  }
}

/**
 * 检查组件中的Authing冲突处理
 */
function checkComponentConflictHandling() {
  console.log('🔍 检查组件中的Authing冲突处理...');
  
  const componentPath = path.join(projectRoot, 'src/features/content-adapter/components/EnhancedHistoryDialog.tsx');
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const conflictChecks = [
      { pattern: 'authingGuardExists', name: 'Authing Guard检测' },
      { pattern: 'authing-ant-modal-root', name: 'Authing元素查找' },
      { pattern: '1000000', name: '高优先级z-index设置' },
      { pattern: 'layout style paint', name: 'CSS隔离设置' },
      { pattern: 'isolation', name: 'CSS隔离保护' },
      { pattern: 'Authing冲突模式', name: '冲突模式日志' }
    ];
    
    conflictChecks.forEach(check => {
      diagnosis.maxScore++;
      if (content.includes(check.pattern)) {
        diagnosis.conflictFixes.push(`✅ 组件修复: ${check.name}`);
        diagnosis.score++;
      } else {
        diagnosis.issues.push(`❌ 组件修复缺失: ${check.name}`);
      }
    });
  } else {
    diagnosis.issues.push('❌ 历史记录弹窗组件不存在');
  }
}

/**
 * 检查z-index层级管理
 */
function checkZIndexManagement() {
  console.log('🔍 检查z-index层级管理...');
  
  const conflictFixPath = path.join(projectRoot, 'src/styles/authing-dialog-conflict-fix.css');
  if (fs.existsSync(conflictFixPath)) {
    const content = fs.readFileSync(conflictFixPath, 'utf8');
    
    const zIndexChecks = [
      { pattern: 'z-index: 999999', name: 'Authing Guard z-index限制' },
      { pattern: 'z-index: 1000000', name: '历史记录弹窗高优先级' },
      { pattern: 'z-index: 1000001', name: '同时存在时的最高优先级' }
    ];
    
    zIndexChecks.forEach(check => {
      diagnosis.maxScore++;
      if (content.includes(check.pattern)) {
        diagnosis.conflictFixes.push(`✅ z-index管理: ${check.name}`);
        diagnosis.score++;
      } else {
        diagnosis.issues.push(`❌ z-index管理缺失: ${check.name}`);
      }
    });
  }
}

/**
 * 检查Portal隔离
 */
function checkPortalIsolation() {
  console.log('🔍 检查Portal隔离...');
  
  const conflictFixPath = path.join(projectRoot, 'src/styles/authing-dialog-conflict-fix.css');
  if (fs.existsSync(conflictFixPath)) {
    const content = fs.readFileSync(conflictFixPath, 'utf8');
    
    const portalChecks = [
      { pattern: '[data-radix-portal]', name: 'Radix Portal选择器' },
      { pattern: 'body:has(.authing-ant-modal-root)', name: 'Authing存在检测' },
      { pattern: 'contain: layout style paint', name: 'CSS containment' },
      { pattern: 'isolation: isolate', name: 'CSS isolation' }
    ];
    
    portalChecks.forEach(check => {
      diagnosis.maxScore++;
      if (content.includes(check.pattern)) {
        diagnosis.conflictFixes.push(`✅ Portal隔离: ${check.name}`);
        diagnosis.score++;
      } else {
        diagnosis.issues.push(`❌ Portal隔离缺失: ${check.name}`);
      }
    });
  }
}

/**
 * 生成诊断报告
 */
function generateReport() {
  const successRate = Math.round((diagnosis.score / diagnosis.maxScore) * 100);
  
  const report = {
    timestamp: new Date().toISOString(),
    successRate: successRate,
    score: diagnosis.score,
    maxScore: diagnosis.maxScore,
    status: successRate >= 95 ? 'EXCELLENT' : successRate >= 85 ? 'GOOD' : successRate >= 70 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
    authingFiles: diagnosis.authingFiles,
    conflictFixes: diagnosis.conflictFixes,
    cssImports: diagnosis.cssImports,
    issues: diagnosis.issues,
    recommendations: []
  };
  
  // 生成建议
  if (successRate < 100) {
    report.recommendations = [
      '1. 确保所有Authing相关CSS文件存在并正确引入',
      '2. 检查组件中的Authing冲突检测代码',
      '3. 验证z-index层级管理是否正确',
      '4. 测试Portal隔离是否有效'
    ];
  } else {
    report.recommendations = [
      '1. 在有Authing Guard的环境中测试历史记录弹窗',
      '2. 验证z-index层级是否正确',
      '3. 检查弹窗定位是否不受Authing影响',
      '4. 确认CSS隔离是否有效'
    ];
  }
  
  return report;
}

/**
 * 输出结果
 */
function printResults() {
  console.log('\n📊 Authing冲突诊断结果:');
  console.log('========================');
  
  const report = generateReport();
  
  console.log(`\n🎯 总体评分: ${report.score}/${report.maxScore} (${report.successRate}%)`);
  console.log(`📈 状态: ${report.status}`);
  
  if (diagnosis.conflictFixes.length > 0) {
    console.log('\n✅ 已实现的冲突修复:');
    diagnosis.conflictFixes.forEach(fix => console.log(`  ${fix}`));
  }
  
  if (diagnosis.issues.length > 0) {
    console.log('\n⚠️ 需要处理的问题:');
    diagnosis.issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  console.log('\n🎯 下一步建议:');
  report.recommendations.forEach(rec => console.log(`  ${rec}`));
  
  // 保存报告
  const reportPath = path.join(projectRoot, 'authing-conflict-diagnosis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
  // 返回状态
  if (report.successRate >= 95) {
    console.log('\n🎉 Authing冲突修复验证通过！');
    console.log('💡 历史记录弹窗应该不会再受到Authing Guard影响');
    process.exit(0);
  } else {
    console.log('\n⚠️ Authing冲突修复未完全通过，需要进一步处理');
    process.exit(1);
  }
}

// 执行诊断
console.log('🚀 开始Authing冲突诊断...\n');

checkAuthingCSSFiles();
checkCSSImports();
checkComponentConflictHandling();
checkZIndexManagement();
checkPortalIsolation();

printResults();
