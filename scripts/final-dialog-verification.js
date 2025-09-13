#!/usr/bin/env node

/**
 * 🚨 历史记录弹窗最终验证脚本
 * 
 * 验证所有修复措施是否正确实施
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚨 历史记录弹窗最终验证\n');

// 验证结果
const verification = {
  cssFiles: [],
  componentFiles: [],
  fixes: [],
  issues: [],
  score: 0,
  maxScore: 0
};

/**
 * 验证CSS文件
 */
function verifyCSSFiles() {
  console.log('🔍 验证CSS修复文件...');
  
  const cssFiles = [
    'src/styles/enhanced-history-dialog-fix.css',
    'src/styles/emergency-dialog-fix.css',
    'src/styles/unified-dialog-positioning.css'
  ];
  
  cssFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查关键修复点
      const checks = [
        { pattern: 'position: fixed !important', name: '强制固定定位' },
        { pattern: 'top: 50% !important', name: '垂直居中' },
        { pattern: 'left: 50% !important', name: '水平居中' },
        { pattern: 'transform: translate(-50%, -50%) !important', name: '居中变换' },
        { pattern: 'z-index: 1055 !important', name: 'z-index层级' },
        { pattern: '.enhanced-history-dialog', name: 'CSS类选择器' }
      ];
      
      let fileScore = 0;
      checks.forEach(check => {
        verification.maxScore++;
        if (content.includes(check.pattern)) {
          verification.fixes.push(`✅ ${filePath}: ${check.name}`);
          verification.score++;
          fileScore++;
        } else {
          verification.issues.push(`❌ ${filePath}: 缺少 ${check.name}`);
        }
      });
      
      verification.cssFiles.push({
        path: filePath,
        exists: true,
        score: fileScore,
        maxScore: checks.length
      });
    } else {
      verification.issues.push(`❌ CSS文件不存在: ${filePath}`);
      verification.cssFiles.push({
        path: filePath,
        exists: false,
        score: 0,
        maxScore: 6
      });
    }
  });
}

/**
 * 验证CSS引入
 */
function verifyCSSImports() {
  console.log('🔍 验证CSS文件引入...');
  
  const indexCssPath = path.join(projectRoot, 'src/index.css');
  if (fs.existsSync(indexCssPath)) {
    const content = fs.readFileSync(indexCssPath, 'utf8');
    
    const imports = [
      "@import './styles/enhanced-history-dialog-fix.css'",
      "@import './styles/emergency-dialog-fix.css'",
      "@import './styles/unified-dialog-positioning.css'"
    ];
    
    imports.forEach(importStatement => {
      verification.maxScore++;
      if (content.includes(importStatement)) {
        verification.fixes.push(`✅ CSS引入: ${importStatement}`);
        verification.score++;
      } else {
        verification.issues.push(`❌ CSS引入缺失: ${importStatement}`);
      }
    });
  } else {
    verification.issues.push('❌ index.css文件不存在');
  }
}

/**
 * 验证组件修复
 */
function verifyComponentFixes() {
  console.log('🔍 验证组件修复...');
  
  const componentPath = path.join(projectRoot, 'src/features/content-adapter/components/EnhancedHistoryDialog.tsx');
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const componentChecks = [
      { pattern: "className=\"enhanced-history-dialog", name: 'CSS类名设置' },
      { pattern: "setProperty('position', 'fixed', 'important')", name: '内联固定定位' },
      { pattern: "setProperty('top', '50%', 'important')", name: '内联垂直居中' },
      { pattern: "setProperty('left', '50%', 'important')", name: '内联水平居中' },
      { pattern: "setProperty('transform', 'translate(-50%, -50%)', 'important')", name: '内联居中变换' },
      { pattern: "三重保护机制", name: '三重保护机制注释' },
      { pattern: "monitoringInterval", name: '实时监控功能' },
      { pattern: "clearInterval(monitoringInterval)", name: '监控清理功能' }
    ];
    
    componentChecks.forEach(check => {
      verification.maxScore++;
      if (content.includes(check.pattern)) {
        verification.fixes.push(`✅ 组件修复: ${check.name}`);
        verification.score++;
      } else {
        verification.issues.push(`❌ 组件修复缺失: ${check.name}`);
      }
    });
    
    verification.componentFiles.push({
      path: componentPath,
      exists: true,
      hasEnhancedFixes: content.includes('三重保护机制')
    });
  } else {
    verification.issues.push('❌ 历史记录弹窗组件不存在');
  }
}

/**
 * 验证诊断脚本
 */
function verifyDiagnosisScripts() {
  console.log('🔍 验证诊断脚本...');
  
  const scripts = [
    'scripts/emergency-dialog-diagnosis.js',
    'public/emergency-dialog-diagnosis.js'
  ];
  
  scripts.forEach(scriptPath => {
    const fullPath = path.join(projectRoot, scriptPath);
    verification.maxScore++;
    if (fs.existsSync(fullPath)) {
      verification.fixes.push(`✅ 诊断脚本存在: ${scriptPath}`);
      verification.score++;
    } else {
      verification.issues.push(`❌ 诊断脚本缺失: ${scriptPath}`);
    }
  });
}

/**
 * 验证响应式适配
 */
function verifyResponsiveDesign() {
  console.log('🔍 验证响应式适配...');
  
  const emergencyFixPath = path.join(projectRoot, 'src/styles/emergency-dialog-fix.css');
  if (fs.existsSync(emergencyFixPath)) {
    const content = fs.readFileSync(emergencyFixPath, 'utf8');
    
    const responsiveChecks = [
      { pattern: '@media (max-width: 640px)', name: '移动端断点' },
      { pattern: '@media (min-width: 641px) and (max-width: 1024px)', name: '平板端断点' },
      { pattern: 'calc(100vw - 1rem)', name: '移动端宽度计算' },
      { pattern: 'calc(100vh - 1rem)', name: '移动端高度计算' }
    ];
    
    responsiveChecks.forEach(check => {
      verification.maxScore++;
      if (content.includes(check.pattern)) {
        verification.fixes.push(`✅ 响应式: ${check.name}`);
        verification.score++;
      } else {
        verification.issues.push(`❌ 响应式缺失: ${check.name}`);
      }
    });
  }
}

/**
 * 生成验证报告
 */
function generateReport() {
  const successRate = Math.round((verification.score / verification.maxScore) * 100);
  
  const report = {
    timestamp: new Date().toISOString(),
    successRate: successRate,
    score: verification.score,
    maxScore: verification.maxScore,
    status: successRate >= 90 ? 'EXCELLENT' : successRate >= 80 ? 'GOOD' : successRate >= 70 ? 'ACCEPTABLE' : 'NEEDS_IMPROVEMENT',
    fixes: verification.fixes,
    issues: verification.issues,
    cssFiles: verification.cssFiles,
    componentFiles: verification.componentFiles,
    recommendations: []
  };
  
  // 生成建议
  if (successRate < 100) {
    report.recommendations = [
      '1. 检查缺失的CSS规则和组件修复',
      '2. 确保所有CSS文件正确引入',
      '3. 验证组件中的内联样式设置',
      '4. 测试响应式适配在不同设备上的表现'
    ];
  } else {
    report.recommendations = [
      '1. 在浏览器中测试历史记录弹窗功能',
      '2. 验证不同屏幕尺寸下的表现',
      '3. 检查弹窗内容是否完整显示',
      '4. 确认弹窗居中定位正确'
    ];
  }
  
  return report;
}

/**
 * 输出结果
 */
function printResults() {
  console.log('\n📊 最终验证结果:');
  console.log('========================');
  
  const report = generateReport();
  
  console.log(`\n🎯 总体评分: ${report.score}/${report.maxScore} (${report.successRate}%)`);
  console.log(`📈 状态: ${report.status}`);
  
  if (verification.fixes.length > 0) {
    console.log('\n✅ 已完成的修复:');
    verification.fixes.forEach(fix => console.log(`  ${fix}`));
  }
  
  if (verification.issues.length > 0) {
    console.log('\n⚠️ 需要处理的问题:');
    verification.issues.forEach(issue => console.log(`  ${issue}`));
  }
  
  console.log('\n🎯 下一步建议:');
  report.recommendations.forEach(rec => console.log(`  ${rec}`));
  
  // 保存报告
  const reportPath = path.join(projectRoot, 'final-dialog-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 详细报告已保存到: ${reportPath}`);
  
  // 返回状态
  if (report.successRate >= 90) {
    console.log('\n🎉 历史记录弹窗修复验证通过！');
    console.log('💡 可以在浏览器中测试弹窗功能');
    process.exit(0);
  } else {
    console.log('\n⚠️ 修复验证未完全通过，需要进一步处理');
    process.exit(1);
  }
}

// 执行验证
console.log('🚀 开始最终验证...\n');

verifyCSSFiles();
verifyCSSImports();
verifyComponentFixes();
verifyDiagnosisScripts();
verifyResponsiveDesign();

printResults();
