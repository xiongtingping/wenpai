#!/usr/bin/env node

/**
 * 🧪 命名规范验证脚本
 * 验证命名规范统一是否成功应用
 */

import fs from 'fs';
import path from 'path';

console.log('🧪 开始验证命名规范统一结果...\n');

const projectRoot = process.cwd();
const stylesDir = path.join(projectRoot, 'src/styles');

let verificationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

/**
 * 添加验证结果
 */
function addResult(type, message, status = 'info') {
  verificationResults.details.push({ type, message, status });
  if (status === 'pass') verificationResults.passed++;
  else if (status === 'fail') verificationResults.failed++;
  else if (status === 'warn') verificationResults.warnings++;
}

/**
 * 验证CSS文件清理
 */
function verifyCSSFileCleanup() {
  console.log('🗑️ 验证CSS文件清理...');
  
  const expectedDeletedFiles = [
    'dialog-basic-fix.css',
    'final-dialog-position-fix.css',
    'ultimate-dialog-position-fix.css',
    'emergency-dialog-fix.css',
    'dialog-position-fix-final.css',
    'dialog-ultimate-override.css',
    'dialog-viewport-fix.css',
    'quick-reference-dialog-only.css',
    'quick-reference-dialog-targeted-fix.css',
    'quick-reference-dialog-visible-fix.css',
    'authing-dialog-conflict-fix.css',
    'dialog-overlay-fix.css',
    'unified-dialog-system.css'
  ];
  
  expectedDeletedFiles.forEach(fileName => {
    const filePath = path.join(stylesDir, fileName);
    const backupPath = path.join(stylesDir, `${fileName}.backup`);
    
    if (!fs.existsSync(filePath) && fs.existsSync(backupPath)) {
      addResult('cleanup', `✅ ${fileName} 已删除并备份`, 'pass');
    } else if (fs.existsSync(filePath)) {
      addResult('cleanup', `❌ ${fileName} 仍然存在，应该被删除`, 'fail');
    } else {
      addResult('cleanup', `⚠️ ${fileName} 和备份都不存在`, 'warn');
    }
  });
}

/**
 * 验证文件重命名
 */
function verifyFileRenaming() {
  console.log('🔄 验证文件重命名...');
  
  const renameMap = {
    'enhanced-history-dialog-fix.css': 'fix-history-dialog-positioning.css',
    'quick-reference-dialog-emergency-fix.css': 'fix-quick-reference-dialog-positioning.css'
  };
  
  Object.entries(renameMap).forEach(([oldName, newName]) => {
    const oldPath = path.join(stylesDir, oldName);
    const newPath = path.join(stylesDir, newName);
    
    if (!fs.existsSync(oldPath) && fs.existsSync(newPath)) {
      addResult('rename', `✅ ${oldName} → ${newName}`, 'pass');
    } else if (fs.existsSync(oldPath)) {
      addResult('rename', `❌ ${oldName} 仍然存在，应该被重命名`, 'fail');
    } else if (!fs.existsSync(newPath)) {
      addResult('rename', `❌ ${newName} 不存在，重命名失败`, 'fail');
    }
  });
}

/**
 * 验证核心文件存在
 */
function verifyCoreFiles() {
  console.log('📁 验证核心文件存在...');
  
  const coreFiles = [
    'fix-history-dialog-positioning.css',
    'fix-quick-reference-dialog-positioning.css',
    'unified-dialog-positioning.css',
    'design-tokens-dialog.css'
  ];
  
  coreFiles.forEach(fileName => {
    const filePath = path.join(stylesDir, fileName);
    if (fs.existsSync(filePath)) {
      addResult('core', `✅ ${fileName} 存在`, 'pass');
    } else {
      addResult('core', `❌ ${fileName} 缺失`, 'fail');
    }
  });
}

/**
 * 验证设计令牌内容
 */
function verifyDesignTokens() {
  console.log('🎨 验证设计令牌内容...');
  
  const designTokensPath = path.join(stylesDir, 'design-tokens-dialog.css');
  
  if (fs.existsSync(designTokensPath)) {
    const content = fs.readFileSync(designTokensPath, 'utf8');
    
    const expectedTokens = [
      '--dialog-position-top',
      '--dialog-position-left',
      '--dialog-max-width',
      '--dialog-max-height',
      '--dialog-transition-duration',
      '--dialog-background',
      '--dialog-shadow'
    ];
    
    expectedTokens.forEach(token => {
      if (content.includes(token)) {
        addResult('tokens', `✅ 设计令牌 ${token} 存在`, 'pass');
      } else {
        addResult('tokens', `❌ 设计令牌 ${token} 缺失`, 'fail');
      }
    });
    
    // 验证BEM类名
    const bemClasses = ['.dialog', '.dialog__overlay', '.dialog__content'];
    bemClasses.forEach(className => {
      if (content.includes(className)) {
        addResult('bem', `✅ BEM类名 ${className} 存在`, 'pass');
      } else {
        addResult('bem', `❌ BEM类名 ${className} 缺失`, 'fail');
      }
    });
  } else {
    addResult('tokens', '❌ 设计令牌文件不存在', 'fail');
  }
}

/**
 * 验证index.css引用更新
 */
function verifyIndexCSSUpdates() {
  console.log('📝 验证index.css引用更新...');
  
  const indexCSSPath = path.join(projectRoot, 'src/index.css');
  
  if (fs.existsSync(indexCSSPath)) {
    const content = fs.readFileSync(indexCSSPath, 'utf8');
    
    const expectedImports = [
      'design-tokens-dialog.css',
      'fix-history-dialog-positioning.css',
      'fix-quick-reference-dialog-positioning.css',
      'unified-dialog-positioning.css'
    ];
    
    expectedImports.forEach(importFile => {
      if (content.includes(importFile)) {
        addResult('imports', `✅ 引用 ${importFile} 存在`, 'pass');
      } else {
        addResult('imports', `❌ 引用 ${importFile} 缺失`, 'fail');
      }
    });
    
    // 验证旧引用已移除
    const oldImports = [
      'enhanced-history-dialog-fix.css',
      'quick-reference-dialog-emergency-fix.css',
      'dialog-position-fix-final.css'
    ];
    
    oldImports.forEach(oldImport => {
      if (!content.includes(oldImport)) {
        addResult('imports', `✅ 旧引用 ${oldImport} 已移除`, 'pass');
      } else {
        addResult('imports', `❌ 旧引用 ${oldImport} 仍然存在`, 'fail');
      }
    });
  } else {
    addResult('imports', '❌ index.css 文件不存在', 'fail');
  }
}

/**
 * 验证Hook文件
 */
function verifyHookFiles() {
  console.log('🪝 验证Hook文件...');
  
  const hookPath = path.join(projectRoot, 'src/hooks/useDialogPositioning.ts');
  
  if (fs.existsSync(hookPath)) {
    const content = fs.readFileSync(hookPath, 'utf8');
    
    const expectedHooks = [
      'useDialogPositioning',
      'useQuickReferenceDialogPositioning',
      'useHistoryDialogPositioning'
    ];
    
    expectedHooks.forEach(hookName => {
      if (content.includes(`export function ${hookName}`)) {
        addResult('hooks', `✅ Hook ${hookName} 存在`, 'pass');
      } else {
        addResult('hooks', `❌ Hook ${hookName} 缺失`, 'fail');
      }
    });
  } else {
    addResult('hooks', '❌ useDialogPositioning.ts 文件不存在', 'fail');
  }
}

/**
 * 验证组件更新
 */
function verifyComponentUpdates() {
  console.log('⚛️ 验证组件更新...');
  
  const components = [
    {
      path: 'src/components/creative/QuickReference/QuickReferenceDialog.tsx',
      hookImport: 'useQuickReferenceDialogPositioning',
      bemClass: 'dialog__content--quick-reference'
    },
    {
      path: 'src/features/content-adapter/components/EnhancedHistoryDialog.tsx',
      hookImport: 'useHistoryDialogPositioning',
      bemClass: 'dialog__content--history'
    }
  ];
  
  components.forEach(({ path: componentPath, hookImport, bemClass }) => {
    const fullPath = path.join(projectRoot, componentPath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes(hookImport)) {
        addResult('components', `✅ ${path.basename(componentPath)} 使用 ${hookImport}`, 'pass');
      } else {
        addResult('components', `❌ ${path.basename(componentPath)} 未使用 ${hookImport}`, 'fail');
      }
      
      if (content.includes(bemClass)) {
        addResult('components', `✅ ${path.basename(componentPath)} 包含BEM类名 ${bemClass}`, 'pass');
      } else {
        addResult('components', `⚠️ ${path.basename(componentPath)} 未包含BEM类名 ${bemClass}`, 'warn');
      }
    } else {
      addResult('components', `❌ ${componentPath} 文件不存在`, 'fail');
    }
  });
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('\n📊 命名规范验证报告');
  console.log('==================================================');
  console.log(`✅ 通过: ${verificationResults.passed}`);
  console.log(`❌ 失败: ${verificationResults.failed}`);
  console.log(`⚠️ 警告: ${verificationResults.warnings}`);
  console.log('==================================================\n');
  
  // 按类型分组显示结果
  const groupedResults = {};
  verificationResults.details.forEach(result => {
    if (!groupedResults[result.type]) {
      groupedResults[result.type] = [];
    }
    groupedResults[result.type].push(result);
  });
  
  Object.entries(groupedResults).forEach(([type, results]) => {
    console.log(`📋 ${type.toUpperCase()}:`);
    results.forEach(result => {
      console.log(`  ${result.message}`);
    });
    console.log('');
  });
  
  // 总体评估
  const totalChecks = verificationResults.passed + verificationResults.failed + verificationResults.warnings;
  const successRate = Math.round((verificationResults.passed / totalChecks) * 100);
  
  console.log('🎯 总体评估:');
  console.log(`成功率: ${successRate}%`);
  
  if (verificationResults.failed === 0) {
    console.log('🎉 命名规范统一验证完全通过！');
  } else if (verificationResults.failed <= 2) {
    console.log('⚠️ 命名规范统一基本成功，存在少量问题需要修复。');
  } else {
    console.log('❌ 命名规范统一存在较多问题，需要进一步修复。');
  }
  
  return verificationResults.failed === 0;
}

// 执行所有验证
try {
  verifyCSSFileCleanup();
  verifyFileRenaming();
  verifyCoreFiles();
  verifyDesignTokens();
  verifyIndexCSSUpdates();
  verifyHookFiles();
  verifyComponentUpdates();
  
  const allPassed = generateReport();
  
  if (allPassed) {
    console.log('\n🚀 下一步: 访问 http://localhost:5174 测试Dialog弹窗功能');
  }
  
  process.exit(allPassed ? 0 : 1);
} catch (error) {
  console.error('💥 验证过程中发生错误:', error);
  process.exit(1);
}
