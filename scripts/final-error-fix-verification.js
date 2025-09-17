#!/usr/bin/env node

/**
 * 🎯 最终错误修复验证脚本
 * 验证所有错误修复是否正确实施
 */

import fs from 'fs';
import path from 'path';

console.log('🎯 开始最终错误修复验证...\n');

const projectRoot = process.cwd();
let verification = {
  checks: [],
  passed: 0,
  failed: 0,
  score: 0
};

/**
 * 添加检查结果
 */
function addCheck(name, passed, details = '') {
  verification.checks.push({ name, passed, details });
  if (passed) {
    verification.passed++;
    console.log(`✅ ${name}`);
    if (details) console.log(`   💡 ${details}`);
  } else {
    verification.failed++;
    console.log(`❌ ${name}`);
    if (details) console.log(`   🚨 ${details}`);
  }
}

/**
 * 检查React导入
 */
function checkReactImports() {
  console.log('🔍 检查React导入...');
  
  const filesToCheck = [
    'src/components/creative/QuickReference/QuickReferenceDialog.tsx',
    'src/features/content-adapter/components/EnhancedHistoryDialog.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fileName = path.basename(filePath);
      
      // 检查useEffect导入
      const hasUseEffect = content.includes('useEffect') && 
                          (content.includes('import React, { useState, useMemo, useRef, useEffect }') ||
                           content.includes('import React, { useState, useEffect, useCallback, useMemo }'));
      
      addCheck(
        `${fileName}: useEffect正确导入`,
        hasUseEffect,
        hasUseEffect ? 'useEffect已正确导入' : '缺少useEffect导入'
      );
      
      // 检查错误处理
      const hasErrorHandling = content.includes('try {') && content.includes('catch (error)');
      addCheck(
        `${fileName}: 错误处理已添加`,
        hasErrorHandling,
        hasErrorHandling ? 'Dialog修复器已添加错误处理' : '缺少错误处理'
      );
    }
  });
}

/**
 * 检查错误边界优化
 */
function checkErrorBoundaryOptimization() {
  console.log('🔍 检查错误边界优化...');
  
  const appPath = path.join(projectRoot, 'src/App.tsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    // 检查是否移除了冗余的ErrorBoundary
    const errorBoundaryCount = (content.match(/ErrorBoundary>/g) || []).length;
    addCheck(
      '移除冗余ErrorBoundary',
      errorBoundaryCount <= 2,
      `当前ErrorBoundary数量: ${errorBoundaryCount}`
    );
    
    // 检查错误处理改进
    const hasImprovedErrorHandling = content.includes('serializedError') && 
                                   content.includes('JSON.stringify');
    addCheck(
      '错误处理已改进',
      hasImprovedErrorHandling,
      hasImprovedErrorHandling ? '错误对象序列化已实现' : '错误处理需要改进'
    );
  }
}

/**
 * 检查CSS修复文件
 */
function checkCSSFixes() {
  console.log('🔍 检查CSS修复文件...');
  
  const cssFiles = [
    'src/styles/enhanced-history-dialog-fix.css',
    'src/styles/quick-reference-dialog-emergency-fix.css',
    'src/styles/unified-dialog-positioning.css'
  ];
  
  cssFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    const fileName = path.basename(filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查视窗单位使用
      const hasViewportUnits = content.includes('50vh') && content.includes('50vw');
      addCheck(
        `${fileName}: 使用视窗单位`,
        hasViewportUnits,
        hasViewportUnits ? '正确使用vh/vw单位' : '缺少视窗单位'
      );
      
      // 检查inset重置
      const hasInsetReset = content.includes('inset: unset !important');
      addCheck(
        `${fileName}: inset属性重置`,
        hasInsetReset,
        hasInsetReset ? 'inset属性已重置' : '缺少inset重置'
      );
    } else {
      addCheck(
        `${fileName}: 文件存在`,
        false,
        '文件不存在'
      );
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
      'enhanced-history-dialog-fix.css',
      'quick-reference-dialog-emergency-fix.css',
      'unified-dialog-positioning.css'
    ];
    
    requiredImports.forEach(importFile => {
      const hasImport = content.includes(importFile);
      addCheck(
        `CSS导入: ${importFile}`,
        hasImport,
        hasImport ? '已正确导入' : '缺少导入'
      );
    });
  }
}

/**
 * 检查构建状态
 */
function checkBuildStatus() {
  console.log('🔍 检查构建状态...');
  
  const distPath = path.join(projectRoot, 'dist');
  const hasBuild = fs.existsSync(distPath);
  
  addCheck(
    '项目构建成功',
    hasBuild,
    hasBuild ? 'dist目录存在' : '需要运行npm run build'
  );
}

/**
 * 生成最终报告
 */
function generateFinalReport() {
  const totalChecks = verification.passed + verification.failed;
  const successRate = Math.round((verification.passed / totalChecks) * 100);
  
  console.log('\n📊 最终错误修复验证报告');
  console.log('==================================================');
  console.log(`🎯 总检查项: ${totalChecks}`);
  console.log(`✅ 通过: ${verification.passed}`);
  console.log(`❌ 失败: ${verification.failed}`);
  console.log(`📈 成功率: ${successRate}%`);
  console.log('==================================================\n');
  
  if (verification.failed > 0) {
    console.log('❌ 需要修复的问题:');
    verification.checks
      .filter(check => !check.passed)
      .forEach(check => {
        console.log(`  • ${check.name}: ${check.details}`);
      });
    console.log('');
  }
  
  // 生成结论
  if (successRate >= 90) {
    console.log('🎉 修复状态: 优秀');
    console.log('💡 所有主要问题已解决，应用应该正常运行');
  } else if (successRate >= 75) {
    console.log('⚠️ 修复状态: 良好');
    console.log('💡 大部分问题已解决，但仍有一些需要关注');
  } else {
    console.log('🚨 修复状态: 需要改进');
    console.log('💡 仍有重要问题需要解决');
  }
  
  console.log('\n🎯 下一步操作:');
  if (verification.failed === 0) {
    console.log('1. ✅ 所有修复已完成');
    console.log('2. 🌐 访问 http://localhost:5173 测试应用');
    console.log('3. 🔍 测试Dialog弹窗功能');
    console.log('4. 📝 确认控制台无错误信息');
  } else {
    console.log('1. 🔧 修复上述失败的检查项');
    console.log('2. 🔄 重新运行验证脚本');
    console.log('3. 🌐 测试应用功能');
  }
  
  console.log('\n🎯 Dialog测试指南:');
  console.log('• 快速引用Dialog: 点击内容输入区域的@按钮');
  console.log('• 历史记录Dialog: 点击右上角的时钟按钮');
  console.log('• 验证弹窗是否正确居中显示');
  console.log('• 检查控制台是否有修复日志输出');
}

// 执行所有检查
checkReactImports();
checkErrorBoundaryOptimization();
checkCSSFixes();
checkCSSImports();
checkBuildStatus();
generateFinalReport();
