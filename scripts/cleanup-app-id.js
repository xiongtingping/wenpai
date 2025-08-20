#!/usr/bin/env node

/**
 * 彻底清理错误App ID的脚本
 * 扫描并修复所有可能包含错误App ID的文件
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

// 错误的App ID列表
const WRONG_APP_IDS = [
  '68823897631e1ef8ff3720b2',
  '68823897631e1ef8ff3720b2',
  'rzcswqs4sq0f.authing.cn'
];

// 正确的配置
const CORRECT_CONFIG = {
  APP_ID: '68823897631e1ef8ff3720b2',
  HOST: 'https://rzcswqs4sq0f.authing.cn',
  DOMAIN: 'rzcswqs4sq0f.authing.cn'
};

// 需要扫描的文件类型
const FILE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.json', '.html', '.md'];

// 排除的目录
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', '.netlify'];

/**
 * 递归扫描目录
 */
function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        scanDirectory(filePath, results);
      }
    } else {
      const ext = path.extname(file);
      if (FILE_EXTENSIONS.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

/**
 * 检查文件是否包含错误的App ID
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    for (const wrongId of WRONG_APP_IDS) {
      if (content.includes(wrongId)) {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(wrongId)) {
            issues.push({
              line: index + 1,
              content: line.trim(),
              wrongId: wrongId
            });
          }
        });
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`❌ 无法读取文件 ${filePath}:`, error.message);
    return [];
  }
}

/**
 * 修复文件中的错误App ID
 */
function fixFile(filePath, issues) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    for (const wrongId of WRONG_APP_IDS) {
      if (content.includes(wrongId)) {
        // 根据上下文选择正确的替换
        if (wrongId === 'rzcswqs4sq0f.authing.cn') {
          content = content.replace(new RegExp(wrongId, 'g'), CORRECT_CONFIG.DOMAIN);
        } else {
          content = content.replace(new RegExp(wrongId, 'g'), CORRECT_CONFIG.APP_ID);
        }
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ 已修复: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ 无法修复文件 ${filePath}:`, error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描错误的App ID...\n');
  
  const projectRoot = process.cwd();
  const allFiles = scanDirectory(projectRoot);
  
  console.log(`📁 扫描了 ${allFiles.length} 个文件\n`);
  
  const problemFiles = [];
  
  // 检查所有文件
  for (const filePath of allFiles) {
    const issues = checkFile(filePath);
    if (issues.length > 0) {
      problemFiles.push({ filePath, issues });
    }
  }
  
  if (problemFiles.length === 0) {
    console.log('✅ 没有发现错误的App ID！');
    return;
  }
  
  console.log(`🚨 发现 ${problemFiles.length} 个文件包含错误的App ID:\n`);
  
  // 显示问题
  for (const { filePath, issues } of problemFiles) {
    console.log(`📄 ${filePath}:`);
    for (const issue of issues) {
      console.log(`   第${issue.line}行: ${issue.content}`);
      console.log(`   错误ID: ${issue.wrongId}`);
    }
    console.log('');
  }
  
  // 询问是否修复
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('是否自动修复这些问题？(y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n🔧 开始修复...\n');
      
      let fixedCount = 0;
      for (const { filePath, issues } of problemFiles) {
        if (fixFile(filePath, issues)) {
          fixedCount++;
        }
      }
      
      console.log(`\n✅ 修复完成！共修复了 ${fixedCount} 个文件`);
      console.log('\n🎯 建议执行以下命令验证修复结果:');
      console.log('npm run build');
      console.log('npm run lint');
      
    } else {
      console.log('❌ 取消修复');
    }
    
    rl.close();
  });
}

// 运行脚本
main();
