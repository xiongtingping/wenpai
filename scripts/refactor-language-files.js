#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取语言文件
const zhCNPath = path.join(__dirname, '../src/i18n/locales/zh-CN.json');
const enUSPath = path.join(__dirname, '../src/i18n/locales/en-US.json');
const backupDir = path.join(__dirname, '../src/i18n/locales/backup');

const zhCN = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
const enUS = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));

// 创建备份目录
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// 备份原文件
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.writeFileSync(
  path.join(backupDir, `zh-CN-${timestamp}.json`),
  JSON.stringify(zhCN, null, 2)
);
fs.writeFileSync(
  path.join(backupDir, `en-US-${timestamp}.json`),
  JSON.stringify(enUS, null, 2)
);

console.log('✓ 已备份原文件到:', backupDir);

// 检测是否包含中文字符
function hasChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 检测是否是自动生成的占位符键
function isPlaceholderKey(key) {
  // 匹配类似 "配置类型_roc" 的模式
  return /_[a-z0-9]{3}$/i.test(key);
}

// 生成驼峰式键名
function toCamelCase(str) {
  // 移除特殊字符,保留中文和字母数字
  const cleaned = str.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '');

  // 分词并转换
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'untranslated';

  // 使用拼音或英文映射
  return transliterate(str);
}

// 简单的中文到英文映射(基于语义)
function transliterate(chineseText) {
  const mappings = {
    // 通用动词
    '配置': 'config', '响应': 'response', '分析': 'analysis', '解析': 'parse',
    '生成': 'generate', '创建': 'create', '删除': 'delete', '更新': 'update',
    '获取': 'get', '保存': 'save', '加载': 'load', '提交': 'submit',
    '发送': 'send', '接收': 'receive', '上传': 'upload', '下载': 'download',
    '检查': 'check', '验证': 'verify', '修改': 'modify', '编辑': 'edit',
    '添加': 'add', '移除': 'remove', '清除': 'clear', '重置': 'reset',
    '初始化': 'initialize', '登录': 'login', '注销': 'logout', '注册': 'register',

    // 状态和结果
    '失败': 'Failed', '成功': 'Success', '错误': 'Error', '警告': 'Warning',
    '完成': 'Completed', '进行中': 'InProgress', '待处理': 'Pending',
    '已取消': 'Cancelled', '已暂停': 'Paused', '已启动': 'Started',

    // 数据和内容
    '数据': 'Data', '内容': 'Content', '信息': 'Info', '文件': 'File',
    '文档': 'Document', '图片': 'Image', '图像': 'Image', '视频': 'Video',
    '音频': 'Audio', '文本': 'Text', '标题': 'Title', '描述': 'Description',

    // 用户和权限
    '用户': 'User', '密码': 'Password', '邮箱': 'Email', '手机': 'Phone',
    '权限': 'Permission', '角色': 'Role', '账号': 'Account', '头像': 'Avatar',

    // 格式和类型
    '格式': 'Format', '类型': 'Type', '版本': 'Version', '大小': 'Size',
    '长度': 'Length', '数量': 'Count', '总数': 'Total',

    // 操作和服务
    '服务': 'Service', '请求': 'Request', '调用': 'Call', '处理': 'Process',
    '转换': 'Convert', '压缩': 'Compress', '解压': 'Decompress',

    // 品牌和内容相关
    '品牌': 'Brand', '档案': 'Profile', '资料': 'Profile', '调性': 'Tone',
    '风格': 'Style', '模板': 'Template', '主题': 'Theme', '话题': 'Topic',
    '标签': 'Tag', '书签': 'Bookmark', '分类': 'Category',

    // 位置和对象
    '页面': 'Page', '页': 'Page', '第': 'Page', '平台': 'Platform',
    '客户端': 'Client', '网络': 'Network', '数据库': 'Database',
    '缓存': 'Cache', '存储': 'Storage', '空间': 'Space',

    // 限制和条件
    '超限': 'Exceeded', '不足': 'Insufficient', '已满': 'Full',
    '已达上限': 'LimitReached', '频率过高': 'TooFrequent',
    '超过': 'Exceed', '不能': 'Cannot', '无法': 'Cannot',
    '未': 'Not', '不': 'Not', '非': 'Not',

    // 状态描述
    '为空': 'Empty', '异常': 'Abnormal', '有效': 'Valid', '无效': 'Invalid',
    '正确': 'Correct', '不正确': 'Incorrect', '已锁定': 'Locked',
    '已使用': 'InUse', '不存在': 'NotExists', '损坏': 'Corrupted',

    // 通用词汇
    '请': 'Please', '建议': 'Suggest', '推荐': 'Recommend', '备用': 'Backup',
    '原始': 'Original', '完整': 'Full', '部分': 'Partial', '全部': 'All',
    '当前': 'Current', '默认': 'Default', '自定义': 'Custom', '系统': 'System',
    '安全': 'Security', '策略': 'Policy', '规则': 'Rule', '限制': 'Limit',
    '选择': 'Select', '确认': 'Confirm', '取消': 'Cancel', '关闭': 'Close',
    '打开': 'Open', '保存': 'Save', '复制': 'Copy', '粘贴': 'Paste',

    // 特殊词组
    '稍后重试': 'TryAgainLater', '检查网络': 'CheckNetwork',
    '联系管理员': 'ContactAdmin', '查看详情': 'ViewDetails',
  };

  let result = '';
  let remainingText = chineseText;

  // 尝试匹配最长的词组
  const sortedKeys = Object.keys(mappings).sort((a, b) => b.length - a.length);

  while (remainingText.length > 0) {
    let matched = false;

    for (const key of sortedKeys) {
      if (remainingText.startsWith(key)) {
        result += mappings[key];
        remainingText = remainingText.slice(key.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // 跳过未匹配的字符
      remainingText = remainingText.slice(1);
    }
  }

  // 如果没有匹配到任何内容,返回默认值
  if (!result) {
    // 为中文文本生成一个基于内容的hash键名
    const hash = chineseText.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0);
    result = 'text_' + Math.abs(hash).toString(36);
  }

  // 确保首字母小写
  return result.charAt(0).toLowerCase() + result.slice(1);
}

// 递归重构对象,移除中文键名
function refactorObject(obj, keyMap = {}, prefix = '') {
  const newObj = {};

  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    let newKey = key;

    // 如果是中文键名,转换为英文
    if (hasChinese(key)) {
      newKey = transliterate(key);
      keyMap[fullPath] = { old: key, new: newKey, value: obj[key] };
      console.log(`  ${fullPath}: "${key}" → "${newKey}"`);
    }

    // 递归处理对象
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      newObj[newKey] = refactorObject(obj[key], keyMap, fullPath);
    } else {
      newObj[newKey] = obj[key];
    }
  }

  return newObj;
}

// 清理en-US中的占位符键
function cleanPlaceholders(obj, prefix = '') {
  const newObj = {};
  let removedCount = 0;

  for (const key in obj) {
    const fullPath = prefix ? `${prefix}.${key}` : key;

    // 跳过占位符键
    if (isPlaceholderKey(key)) {
      removedCount++;
      continue;
    }

    // 递归处理对象
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      const result = cleanPlaceholders(obj[key], fullPath);
      newObj[key] = result.obj;
      removedCount += result.count;
    } else {
      newObj[key] = obj[key];
    }
  }

  return { obj: newObj, count: removedCount };
}

// 同步两个语言文件的键结构
function syncKeys(source, target) {
  const synced = {};

  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      synced[key] = syncKeys(source[key], target[key] || {});
    } else {
      // 如果target中没有这个键,添加待翻译标记
      synced[key] = target[key] || `[TO BE TRANSLATED] ${source[key]}`;
    }
  }

  return synced;
}

console.log('\n开始重构语言文件...\n');

// 1. 重构zh-CN.json中的中文键名
console.log('1. 重构 zh-CN.json 中的中文键名:');
console.log('-'.repeat(80));
const keyMap = {};
const newZhCN = refactorObject(zhCN, keyMap);
console.log(`✓ 完成,共重构 ${Object.keys(keyMap).length} 个中文键名\n`);

// 2. 清理en-US.json中的占位符
console.log('2. 清理 en-US.json 中的占位符键:');
console.log('-'.repeat(80));
const { obj: cleanedEnUS, count: placeholderCount } = cleanPlaceholders(enUS);
console.log(`✓ 完成,共移除 ${placeholderCount} 个占位符键\n`);

// 3. 同步两个文件的键结构
console.log('3. 同步两个文件的键结构:');
console.log('-'.repeat(80));
const syncedEnUS = syncKeys(newZhCN, cleanedEnUS);
console.log(`✓ 完成\n`);

// 4. 保存重构后的文件
const newZhCNPath = path.join(__dirname, '../src/i18n/locales/zh-CN.new.json');
const newEnUSPath = path.join(__dirname, '../src/i18n/locales/en-US.new.json');
const keyMapPath = path.join(__dirname, 'key-refactor-map.json');

fs.writeFileSync(newZhCNPath, JSON.stringify(newZhCN, null, 2), 'utf8');
fs.writeFileSync(newEnUSPath, JSON.stringify(syncedEnUS, null, 2), 'utf8');
fs.writeFileSync(keyMapPath, JSON.stringify(keyMap, null, 2), 'utf8');

console.log('4. 生成的文件:');
console.log('-'.repeat(80));
console.log(`  ✓ 新的 zh-CN.json: ${newZhCNPath}`);
console.log(`  ✓ 新的 en-US.json: ${newEnUSPath}`);
console.log(`  ✓ 键映射文件: ${keyMapPath}`);
console.log(`  ✓ 备份文件: ${backupDir}\n`);

console.log('5. 统计信息:');
console.log('-'.repeat(80));
console.log(`  - 重构的中文键名: ${Object.keys(keyMap).length}`);
console.log(`  - 移除的占位符键: ${placeholderCount}`);
console.log(`  - zh-CN 文件大小: ${(JSON.stringify(newZhCN).length / 1024).toFixed(2)} KB`);
console.log(`  - en-US 文件大小: ${(JSON.stringify(syncedEnUS).length / 1024).toFixed(2)} KB`);

console.log('\n下一步:');
console.log('1. 检查生成的 .new.json 文件');
console.log('2. 确认无误后,替换原文件:');
console.log('   mv src/i18n/locales/zh-CN.new.json src/i18n/locales/zh-CN.json');
console.log('   mv src/i18n/locales/en-US.new.json src/i18n/locales/en-US.json');
console.log('3. 使用 key-refactor-map.json 更新代码中的引用');
