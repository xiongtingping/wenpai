#!/usr/bin/env node

/**
 * 🎯 命名规范统一脚本
 * 自动化执行CSS文件重命名、删除重复文件、更新引用
 */

import fs from 'fs';
import path from 'path';

console.log('🎯 开始执行命名规范统一...\n');

const projectRoot = process.cwd();
const stylesDir = path.join(projectRoot, 'src/styles');

let operations = {
  deleted: [],
  renamed: [],
  updated: [],
  errors: []
};

/**
 * 第一阶段：删除重复和冗余文件
 */
function deleteRedundantFiles() {
  console.log('🗑️ 阶段1: 删除重复和冗余文件...');
  
  const filesToDelete = [
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
  
  filesToDelete.forEach(fileName => {
    const filePath = path.join(stylesDir, fileName);
    if (fs.existsSync(filePath)) {
      try {
        // 先备份文件
        const backupPath = path.join(stylesDir, `${fileName}.backup`);
        fs.copyFileSync(filePath, backupPath);
        
        // 删除原文件
        fs.unlinkSync(filePath);
        operations.deleted.push(fileName);
        console.log(`  ✅ 删除: ${fileName}`);
      } catch (error) {
        operations.errors.push(`删除 ${fileName} 失败: ${error.message}`);
        console.log(`  ❌ 删除失败: ${fileName} - ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${fileName}`);
    }
  });
  
  console.log(`删除完成: ${operations.deleted.length} 个文件\n`);
}

/**
 * 第二阶段：重命名核心文件
 */
function renameCoreFiles() {
  console.log('🔄 阶段2: 重命名核心文件...');
  
  const renameMap = {
    'enhanced-history-dialog-fix.css': 'fix-history-dialog-positioning.css',
    'quick-reference-dialog-emergency-fix.css': 'fix-quick-reference-dialog-positioning.css'
  };
  
  Object.entries(renameMap).forEach(([oldName, newName]) => {
    const oldPath = path.join(stylesDir, oldName);
    const newPath = path.join(stylesDir, newName);
    
    if (fs.existsSync(oldPath)) {
      try {
        fs.renameSync(oldPath, newPath);
        operations.renamed.push({ oldName, newName });
        console.log(`  ✅ 重命名: ${oldName} → ${newName}`);
      } catch (error) {
        operations.errors.push(`重命名 ${oldName} 失败: ${error.message}`);
        console.log(`  ❌ 重命名失败: ${oldName} - ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${oldName}`);
    }
  });
  
  console.log(`重命名完成: ${operations.renamed.length} 个文件\n`);
}

/**
 * 第三阶段：更新import引用
 */
function updateImportReferences() {
  console.log('📝 阶段3: 更新import引用...');
  
  const filesToUpdate = [
    'src/index.css',
    'src/main.tsx',
    'src/App.tsx'
  ];
  
  const importUpdates = {
    'enhanced-history-dialog-fix.css': 'fix-history-dialog-positioning.css',
    'quick-reference-dialog-emergency-fix.css': 'fix-quick-reference-dialog-positioning.css'
  };
  
  filesToUpdate.forEach(relativePath => {
    const filePath = path.join(projectRoot, relativePath);
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;
        
        Object.entries(importUpdates).forEach(([oldName, newName]) => {
          const oldImport = `'./styles/${oldName}'`;
          const newImport = `'./styles/${newName}'`;
          
          if (content.includes(oldImport)) {
            content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
            updated = true;
          }
          
          // 也检查不带引号的情况
          if (content.includes(oldName)) {
            content = content.replace(new RegExp(oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newName);
            updated = true;
          }
        });
        
        if (updated) {
          fs.writeFileSync(filePath, content, 'utf8');
          operations.updated.push(relativePath);
          console.log(`  ✅ 更新引用: ${relativePath}`);
        }
      } catch (error) {
        operations.errors.push(`更新 ${relativePath} 失败: ${error.message}`);
        console.log(`  ❌ 更新失败: ${relativePath} - ${error.message}`);
      }
    } else {
      console.log(`  ⚠️ 文件不存在: ${relativePath}`);
    }
  });
  
  console.log(`引用更新完成: ${operations.updated.length} 个文件\n`);
}

/**
 * 第四阶段：创建设计令牌文件
 */
function createDesignTokens() {
  console.log('🎨 阶段4: 创建设计令牌文件...');
  
  const designTokensContent = `/**
 * 🎨 Dialog设计令牌系统
 * 统一的Dialog相关设计变量，避免硬编码值
 */

:root {
  /* ========================================
     🎯 Dialog定位令牌
     ======================================== */
  
  /* 基础定位 */
  --dialog-position-top: 50vh;
  --dialog-position-left: 50vw;
  --dialog-transform: translate(-50%, -50%);
  --dialog-z-index: 1055;
  
  /* ========================================
     📐 Dialog尺寸令牌
     ======================================== */
  
  /* 最大尺寸 */
  --dialog-max-width: min(95vw, 1024px);
  --dialog-max-height: 85vh;
  
  /* 快速引用Dialog */
  --quick-reference-dialog-max-width: min(95vw, 1024px);
  --quick-reference-dialog-max-height: 85vh;
  
  /* 历史记录Dialog */
  --history-dialog-max-width: min(95vw, 900px);
  --history-dialog-max-height: 85vh;
  
  /* ========================================
     🎭 Dialog动画令牌
     ======================================== */
  
  --dialog-transition-duration: 200ms;
  --dialog-transition-easing: cubic-bezier(0.16, 1, 0.3, 1);
  --dialog-scale-from: 0.95;
  --dialog-scale-to: 1;
  
  /* ========================================
     🎨 Dialog样式令牌
     ======================================== */
  
  /* 背景和边框 */
  --dialog-background: hsl(var(--background));
  --dialog-border: hsl(var(--border));
  --dialog-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.25);
  
  /* 遮罩层 */
  --dialog-overlay-background: rgba(0, 0, 0, 0.5);
  --dialog-overlay-backdrop-filter: blur(4px);
  
  /* ========================================
     📱 响应式令牌
     ======================================== */
  
  /* 移动端适配 */
  --dialog-mobile-max-width: calc(95vw - 16px);
  --dialog-mobile-max-height: calc(85vh - 16px);
  --dialog-mobile-padding: 16px;
  
  /* 桌面端适配 */
  --dialog-desktop-padding: 24px;
  --dialog-desktop-border-radius: 24px;
}

/* ========================================
   🎯 Dialog基础类名（BEM规范）
   ======================================== */

.dialog {
  position: fixed;
  top: var(--dialog-position-top);
  left: var(--dialog-position-left);
  transform: var(--dialog-transform);
  z-index: var(--dialog-z-index);
  max-width: var(--dialog-max-width);
  max-height: var(--dialog-max-height);
}

.dialog__overlay {
  position: fixed;
  inset: 0;
  background: var(--dialog-overlay-background);
  backdrop-filter: var(--dialog-overlay-backdrop-filter);
  z-index: calc(var(--dialog-z-index) - 1);
}

.dialog__content {
  background: var(--dialog-background);
  border: 1px solid var(--dialog-border);
  box-shadow: var(--dialog-shadow);
  border-radius: var(--dialog-desktop-border-radius);
}

.dialog__content--quick-reference {
  max-width: var(--quick-reference-dialog-max-width);
  max-height: var(--quick-reference-dialog-max-height);
}

.dialog__content--history {
  max-width: var(--history-dialog-max-width);
  max-height: var(--history-dialog-max-height);
}

/* ========================================
   📱 响应式适配
   ======================================== */

@media (max-width: 640px) {
  .dialog {
    max-width: var(--dialog-mobile-max-width);
    max-height: var(--dialog-mobile-max-height);
  }
  
  .dialog__content {
    border-radius: 16px;
    margin: var(--dialog-mobile-padding);
  }
}`;
  
  const designTokensPath = path.join(stylesDir, 'design-tokens-dialog.css');
  
  try {
    fs.writeFileSync(designTokensPath, designTokensContent, 'utf8');
    console.log(`  ✅ 创建设计令牌文件: design-tokens-dialog.css`);
  } catch (error) {
    operations.errors.push(`创建设计令牌文件失败: ${error.message}`);
    console.log(`  ❌ 创建失败: ${error.message}`);
  }
  
  console.log('');
}

/**
 * 第五阶段：验证操作结果
 */
function validateOperations() {
  console.log('🧪 阶段5: 验证操作结果...');
  
  // 检查核心文件是否存在
  const coreFiles = [
    'fix-history-dialog-positioning.css',
    'fix-quick-reference-dialog-positioning.css',
    'unified-dialog-positioning.css',
    'design-tokens-dialog.css'
  ];
  
  let allCoreFilesExist = true;
  coreFiles.forEach(fileName => {
    const filePath = path.join(stylesDir, fileName);
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ 核心文件存在: ${fileName}`);
    } else {
      console.log(`  ❌ 核心文件缺失: ${fileName}`);
      allCoreFilesExist = false;
    }
  });
  
  console.log(`\n验证完成: ${allCoreFilesExist ? '✅ 所有核心文件存在' : '❌ 存在缺失文件'}\n`);
  return allCoreFilesExist;
}

/**
 * 生成操作报告
 */
function generateReport() {
  console.log('📊 命名规范统一操作报告');
  console.log('==================================================');
  console.log(`🗑️ 删除文件: ${operations.deleted.length} 个`);
  console.log(`🔄 重命名文件: ${operations.renamed.length} 个`);
  console.log(`📝 更新引用: ${operations.updated.length} 个`);
  console.log(`❌ 错误: ${operations.errors.length} 个`);
  console.log('==================================================\n');
  
  if (operations.deleted.length > 0) {
    console.log('🗑️ 已删除的文件:');
    operations.deleted.forEach(file => console.log(`  • ${file}`));
    console.log('');
  }
  
  if (operations.renamed.length > 0) {
    console.log('🔄 已重命名的文件:');
    operations.renamed.forEach(({ oldName, newName }) => {
      console.log(`  • ${oldName} → ${newName}`);
    });
    console.log('');
  }
  
  if (operations.updated.length > 0) {
    console.log('📝 已更新引用的文件:');
    operations.updated.forEach(file => console.log(`  • ${file}`));
    console.log('');
  }
  
  if (operations.errors.length > 0) {
    console.log('❌ 错误列表:');
    operations.errors.forEach(error => console.log(`  • ${error}`));
    console.log('');
  }
  
  console.log('🎯 下一步操作:');
  console.log('1. 🧪 运行测试验证功能完整性');
  console.log('2. 🔍 检查Dialog弹窗是否正常显示');
  console.log('3. 📝 更新文档和注释');
  console.log('4. 🎨 应用BEM命名规范到组件');
}

// 执行所有阶段
try {
  deleteRedundantFiles();
  renameCoreFiles();
  updateImportReferences();
  createDesignTokens();
  const validationPassed = validateOperations();
  generateReport();
  
  if (validationPassed && operations.errors.length === 0) {
    console.log('\n🎉 命名规范统一完成！所有操作成功执行。');
  } else {
    console.log('\n⚠️ 命名规范统一完成，但存在一些问题需要手动处理。');
  }
} catch (error) {
  console.error('💥 执行过程中发生错误:', error);
  process.exit(1);
}
