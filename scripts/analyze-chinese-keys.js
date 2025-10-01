#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取语言文件
const zhCNPath = path.join(__dirname, '../src/i18n/locales/zh-CN.json');
const enUSPath = path.join(__dirname, '../src/i18n/locales/en-US.json');

const zhCN = JSON.parse(fs.readFileSync(zhCNPath, 'utf8'));
const enUS = JSON.parse(fs.readFileSync(enUSPath, 'utf8'));

// 检测是否包含中文字符
function hasChinese(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}

// 递归查找所有中文键名
function findChineseKeys(obj, prefix = '') {
  const chineseKeys = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (hasChinese(key)) {
      chineseKeys.push({
        path: fullKey,
        key: key,
        value: typeof obj[key] === 'string' ? obj[key] : '[Object]'
      });
    }

    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      chineseKeys.push(...findChineseKeys(obj[key], fullKey));
    }
  }

  return chineseKeys;
}

// 比较两个语言文件的键
function compareKeys(obj1, obj2, prefix = '') {
  const differences = {
    onlyInZh: [],
    onlyInEn: [],
    differentTypes: []
  };

  const keys1 = Object.keys(obj1 || {});
  const keys2 = Object.keys(obj2 || {});

  // 找出只在zh-CN中的键
  for (const key of keys1) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!keys2.includes(key)) {
      differences.onlyInZh.push(fullKey);
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      const nested = compareKeys(obj1[key], obj2[key], fullKey);
      differences.onlyInZh.push(...nested.onlyInZh);
      differences.onlyInEn.push(...nested.onlyInEn);
      differences.differentTypes.push(...nested.differentTypes);
    } else if (typeof obj1[key] !== typeof obj2[key]) {
      differences.differentTypes.push(fullKey);
    }
  }

  // 找出只在en-US中的键
  for (const key of keys2) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (!keys1.includes(key)) {
      differences.onlyInEn.push(fullKey);
    }
  }

  return differences;
}

// 生成英文键名建议
function suggestEnglishKey(chineseKey, chineseValue) {
  // 这里提供一些常见的映射
  const commonMappings = {
    '配置失败': 'configFailed',
    '响应失败': 'responseFailed',
    '分析服务请求失败': 'analysisServiceRequestFailed',
    '响应数据结构异常': 'responseDataStructureAbnormal',
    '完整响应': 'fullResponse',
    '分析服务返回数据格式异常': 'analysisServiceDataFormatAbnormal',
    '请稍后重试': 'pleaseTryAgainLater',
    '返回空内容': 'returnedEmptyContent',
    '解析失败': 'parseFailed',
    '原始内容': 'originalContent',
    '分析失败': 'analysisFailed',
    '品牌资料分析失败': 'brandProfileAnalysisFailed',
    '没有可分析的文件内容': 'noFileContentToAnalyze',
    '文件分析失败': 'fileAnalysisFailed',
    '内容检查失败': 'contentCheckFailed',
    '第': 'page',
    '页解析失败': 'pageParsingFailed',
    '内容为空': 'contentIsEmpty',
    '尝试备用方案': 'tryingBackupPlan',
    '文档解析失败': 'documentParsingFailed',
    '错误信息': 'errorMessage',
    '未知错误': 'unknownError',
    '建议解决方案': 'suggestedSolution',
    '检查文档是否损坏': 'checkDocumentCorruption',
    '尝试用': 'tryWith',
    '重新保存文档': 'resaveDocument',
    '另存为': 'saveAs',
    '格式': 'format',
    '推荐': 'recommended',
    '复制文档内容到文本文件': 'copyDocumentContentToTextFile',
    '转换为': 'convertTo',
    '格式后上传': 'formatAndUpload',
    '幻灯片': 'slideshow',
    '图片': 'image',
    '识别失败': 'recognitionFailed',
    '暂不支持该文件类型': 'fileTypeNotSupported',
    '文件解析失败': 'fileParsingFailed',
    '文件读取失败': 'fileReadFailed',
    '获取用户信息失败': 'getUserInfoFailed',
    '调用失败': 'callFailed',
    '初始化失败': 'initializationFailed',
    '认证客户端初始化失败': 'authClientInitFailed',
    '密码登录失败': 'passwordLoginFailed',
    '登录失败': 'loginFailed',
    '密码错误': 'incorrectPassword',
    '用户不存在': 'userNotExists',
    '账号已被锁定': 'accountLocked',
    '用户资料更新失败': 'userProfileUpdateFailed',
    '更新失败': 'updateFailed',
    '验证码': 'verificationCode',
    '验证码相关错误': 'verificationCodeError',
    '邮箱格式错误或已被使用': 'emailInvalidOrInUse',
    '手机号格式错误或已被使用': 'phoneInvalidOrInUse',
    '权限不足': 'insufficientPermissions',
    '未返回有效用户': 'noValidUserReturned',
    '密码修改失败': 'passwordChangeFailed',
    '原密码错误': 'incorrectOldPassword',
    '新密码不符合安全策略': 'newPasswordNotMeetPolicy',
    '邮箱地址不能为空': 'emailCannotBeEmpty',
    '邮箱格式不正确': 'invalidEmailFormat',
    '邮箱验证码发送失败': 'emailVerificationCodeSendFailed',
    '发送验证码失败': 'sendVerificationCodeFailed',
    '邮箱格式错误或不存在': 'emailInvalidOrNotExists',
    '发送频率过高': 'sendFrequencyTooHigh',
    '今日发送次数已达上限': 'dailySendLimitReached',
    '手机号不能为空': 'phoneCannotBeEmpty',
    '手机号格式不正确': 'invalidPhoneFormat',
    '手机验证码发送失败': 'phoneVerificationCodeSendFailed',
    '手机号格式错误或不存在': 'phoneInvalidOrNotExists',
    '邮箱和验证码不能为空': 'emailAndCodeCannotBeEmpty',
    '验证码长度不正确': 'incorrectCodeLength',
    '邮箱验证码验证失败': 'emailVerificationFailed',
    '验证码验证失败': 'verificationFailed',
    '手机号和验证码不能为空': 'phoneAndCodeCannotBeEmpty',
    '手机验证码验证失败': 'phoneVerificationFailed',
    '注销失败': 'logoutFailed',
    '文件大小不能超过': 'fileSizeCannotExceed',
    '不支持的文件格式': 'unsupportedFileFormat',
    '请使用': 'pleaseUse',
    '请选择有效的图片文件': 'pleaseSelectValidImageFile',
    '生成随机': 'generateRandom',
    '头像失败': 'avatarFailed',
    '回退到': 'fallbackTo',
    '头像上传失败': 'avatarUploadFailed',
    '头像上传': 'avatarUpload',
    '更新用户头像失败': 'updateUserAvatarFailed',
    '删除用户头像失败': 'deleteUserAvatarFailed',
    '用户': 'user',
    '不能为空': 'cannotBeEmpty',
    '缓存头像': 'cacheAvatar',
    '失败': 'failed',
    '获取缓存头像': 'getCachedAvatar',
    '清除头像缓存失败': 'clearAvatarCacheFailed',
    '图片压缩失败': 'imageCompressionFailed',
    '图片加载失败': 'imageLoadFailed',
    '获取书签失败': 'getBookmarksFailed',
    '旧数据迁移失败': 'oldDataMigrationFailed',
    '获取话题书签失败': 'getTopicBookmarksFailed',
    '保存书签失败': 'saveBookmarkFailed',
    '添加书签失败': 'addBookmarkFailed',
    '保存话题书签失败': 'saveTopicBookmarkFailed',
    '添加话题书签失败': 'addTopicBookmarkFailed',
    '移除书签失败': 'removeBookmarkFailed',
    '移除话题书签失败': 'removeTopicBookmarkFailed',
    '导入书签失败': 'importBookmarksFailed',
    '清空书签失败': 'clearBookmarksFailed',
    '尝试修复': 'tryingToFix',
    '修复也失败了': 'fixAlsoFailed',
    '提取的': 'extracted',
    '也无法解析': 'alsoCannotParse',
    '无法从响应中提取有效': 'cannotExtractValidFromResponse',
    '处理文档失败': 'documentProcessingFailed',
    '文档处理失败': 'documentHandlingFailed',
    '密钥': 'apiKey',
    '服务配置错误': 'serviceConfigError',
    '网络连接失败': 'networkConnectionFailed',
    '请检查网络连接或稍后重试': 'checkNetworkOrRetryLater',
    '响应格式错误': 'responseFormatError',
    '请重试': 'pleaseRetry',
    '处理失败': 'processingFailed',
    '提取结果解析失败': 'extractionResultParseFailed',
    '文档': 'document',
    '冲突解决结果解析失败': 'conflictResolutionResultParseFailed',
    '提取': 'extract',
    '修复失败': 'fixFailed',
    '无法修复': 'cannotFix',
    '批次处理失败': 'batchProcessingFailed',
    '数据库初始化失败': 'databaseInitFailed',
    '数据库连接失败': 'databaseConnectionFailed',
    '品牌档案保存失败': 'brandProfileSaveFailed',
    '获取品牌档案失败': 'getBrandProfileFailed',
    '获取所有品牌档案失败': 'getAllBrandProfilesFailed',
    '品牌档案删除失败': 'brandProfileDeleteFailed',
    '需要设置用户': 'needToSetUser',
    '才能访问品牌档案': 'toAccessBrandProfile',
    '设置当前品牌档案失败': 'setCurrentBrandProfileFailed',
    '解析品牌档案数据失败': 'parseBrandProfileDataFailed',
    '未设置品牌档案': 'brandProfileNotSet',
    '品牌调性分析失败': 'brandToneAnalysisFailed',
  };

  return commonMappings[chineseKey] || 'NEEDS_TRANSLATION';
}

console.log('===== 语言文件分析报告 =====\n');

// 1. 查找中文键名
console.log('1. 中文键名分析');
console.log('-'.repeat(80));
const chineseKeys = findChineseKeys(zhCN);
console.log(`发现 ${chineseKeys.length} 个中文键名:\n`);

if (chineseKeys.length > 0) {
  console.log('前20个中文键名示例:');
  chineseKeys.slice(0, 20).forEach((item, index) => {
    const suggestion = suggestEnglishKey(item.key, item.value);
    console.log(`${index + 1}. ${item.path}`);
    console.log(`   键名: "${item.key}"`);
    console.log(`   值: "${item.value}"`);
    console.log(`   建议: "${suggestion}"`);
    console.log('');
  });

  if (chineseKeys.length > 20) {
    console.log(`... 还有 ${chineseKeys.length - 20} 个中文键名\n`);
  }
}

// 2. 比较键的差异
console.log('\n2. 键结构差异分析');
console.log('-'.repeat(80));
const differences = compareKeys(zhCN, enUS);

console.log(`只在 zh-CN 中存在的键: ${differences.onlyInZh.length}`);
if (differences.onlyInZh.length > 0) {
  console.log('示例:');
  differences.onlyInZh.slice(0, 10).forEach(key => console.log(`  - ${key}`));
  if (differences.onlyInZh.length > 10) {
    console.log(`  ... 还有 ${differences.onlyInZh.length - 10} 个`);
  }
}

console.log(`\n只在 en-US 中存在的键: ${differences.onlyInEn.length}`);
if (differences.onlyInEn.length > 0) {
  console.log('示例:');
  differences.onlyInEn.slice(0, 10).forEach(key => console.log(`  - ${key}`));
  if (differences.onlyInEn.length > 10) {
    console.log(`  ... 还有 ${differences.onlyInEn.length - 10} 个`);
  }
}

console.log(`\n类型不一致的键: ${differences.differentTypes.length}`);
if (differences.differentTypes.length > 0) {
  console.log('示例:');
  differences.differentTypes.slice(0, 10).forEach(key => console.log(`  - ${key}`));
}

// 3. 生成重构映射文件
const refactorMap = {};
chineseKeys.forEach(item => {
  const suggestion = suggestEnglishKey(item.key, item.value);
  refactorMap[item.path] = {
    oldKey: item.key,
    newKey: suggestion,
    value: item.value,
    fullPath: item.path
  };
});

fs.writeFileSync(
  path.join(__dirname, 'chinese-keys-refactor-map.json'),
  JSON.stringify(refactorMap, null, 2),
  'utf8'
);

console.log('\n===== 分析完成 =====');
console.log(`生成重构映射文件: scripts/chinese-keys-refactor-map.json`);
console.log(`\n总结:`);
console.log(`  - 中文键名数量: ${chineseKeys.length}`);
console.log(`  - zh-CN独有键: ${differences.onlyInZh.length}`);
console.log(`  - en-US独有键: ${differences.onlyInEn.length}`);
console.log(`  - 类型不一致: ${differences.differentTypes.length}`);
