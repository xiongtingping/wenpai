#!/usr/bin/env node
/**
 * 合并国际化key到语言文件
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');
const PATCH_FILE = path.join(LOCALES_DIR, 'patches/missing-keys-2025-10-03.json');

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function main() {
  console.log('📝 开始合并国际化key...\n');

  // 读取补丁文件
  const patch = JSON.parse(fs.readFileSync(PATCH_FILE, 'utf8'));

  // 处理每个语言
  for (const lang of ['zh-CN', 'en-US']) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);

    console.log(`处理 ${lang}...`);

    // 读取现有文件
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // 统计新增key数量
    const beforeKeys = Object.keys(existing.common?.errors || {}).length;

    // 合并
    deepMerge(existing, patch[lang]);

    // 统计合并后
    const afterKeys = Object.keys(existing.common?.errors || {}).length;
    const addedKeys = afterKeys - beforeKeys;

    // 备份原文件
    const backupPath = path.join(LOCALES_DIR, 'backup', `${lang}-${new Date().toISOString()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.copyFileSync(filePath, backupPath);
    console.log(`  ✓ 备份到: ${path.relative(LOCALES_DIR, backupPath)}`);

    // 写入新文件
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
    console.log(`  ✓ 新增 ${addedKeys} 个key`);
    console.log(`  ✓ 已更新: ${lang}.json\n`);
  }

  console.log('✅ 合并完成!\n');
  console.log('新增的错误key:');
  const zhPatch = patch['zh-CN'];
  Object.entries(zhPatch.common.errors).forEach(([key, value]) => {
    console.log(`  - common.errors.${key}: "${value}"`);
  });
}

main();
