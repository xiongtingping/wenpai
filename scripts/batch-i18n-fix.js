#!/usr/bin/env node

/**
 * 批量国际化修复脚本
 *
 * 功能:
 * 1. 扫描所有源代码文件
 * 2. 识别硬编码中文
 * 3. 自动生成翻译键
 * 4. 自动修改源代码
 * 5. 自动更新语言文件
 */

const fs = require('fs');
const path = require('path');

// 中文字符正则
const CHINESE_REGEX = /[\u4e00-\u9fa5]/;

// 需要国际化的模式
const PATTERNS = [
  // throw new Error('中文')
  {
    pattern: /throw\s+new\s+Error\s*\(\s*[`'"](.*?[\u4e00-\u9fa5].*?)[`'"]\s*\)/g,
    type: 'error',
    priority: 'high'
  },
  // console.error('中文')
  {
    pattern: /console\.(error|warn|log)\s*\(\s*[`'"](.*?[\u4e00-\u9fa5].*?)[`'"]/g,
    type: 'console',
    priority: 'low'
  },
  // message: '中文'
  {
    pattern: /message\s*:\s*[`'"](.*?[\u4e00-\u9fa5].*?)[`'"]/g,
    type: 'message',
    priority: 'high'
  },
  // title: '中文'
  {
    pattern: /title\s*:\s*[`'"](.*?[\u4e00-\u9fa5].*?)[`'"]/g,
    type: 'title',
    priority: 'high'
  },
  // description: '中文'
  {
    pattern: /description\s*:\s*[`'"](.*?[\u4e00-\u9fa5].*?)[`'"]/g,
    type: 'description',
    priority: 'medium'
  },
  // JSX中的文本 <div>中文</div>
  {
    pattern: /<[a-zA-Z][^>]*>\s*([^<]*[\u4e00-\u9fa5][^<]*)\s*<\//g,
    type: 'jsx',
    priority: 'high'
  }
];

// 生成驼峰键名
function toCamelCase(text) {
  // 移除特殊字符
  text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '');

  // 中文转拼音(简化版 - 使用首字母)
  const pinyinMap = {
    '错误': 'error',
    '失败': 'failed',
    '成功': 'success',
    '警告': 'warning',
    '提示': 'message',
    '标题': 'title',
    '描述': 'description',
    '加载': 'loading',
    '保存': 'save',
    '删除': 'delete',
    '确认': 'confirm',
    '取消': 'cancel',
    '请求': 'request',
    '响应': 'response',
    '配置': 'config',
    '初始化': 'initialize',
    '服务': 'service',
    '数据': 'data',
    '用户': 'user',
    '登录': 'login',
    '注册': 'register',
    '密码': 'password',
    '邮箱': 'email',
    '手机': 'phone',
    '验证码': 'verifyCode',
    '文件': 'file',
    '图片': 'image',
    '上传': 'upload',
    '下载': 'download',
    '分析': 'analysis',
    '解析': 'parse',
    '不能为空': 'cannotBeEmpty',
    '格式不正确': 'formatIncorrect',
    '未配置': 'notConfigured',
    '超时': 'timeout',
    '网络': 'network',
    '无效': 'invalid',
    '权限不足': 'permissionDenied',
    '账户': 'account',
    '余额不足': 'insufficientBalance'
  };

  let result = '';
  for (const [cn, en] of Object.entries(pinyinMap)) {
    if (text.includes(cn)) {
      result += en + '_';
      text = text.replace(cn, '');
    }
  }

  // 如果没有匹配,使用简化版
  if (!result) {
    const words = text.trim().split(/\s+/);
    result = words.slice(0, 3).join('_');
  }

  // 转驼峰
  result = result.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
  result = result.replace(/^_|_$/g, '');

  return result || 'unknownKey';
}

// 生成统计报告
function generateReport(stats) {
  console.log('\n='.repeat(80));
  console.log('批量国际化修复统计报告');
  console.log('='.repeat(80));
  console.log(`处理文件数: ${stats.filesProcessed}`);
  console.log(`发现硬编码: ${stats.hardcodedFound}`);
  console.log(`已修复: ${stats.fixed}`);
  console.log(`需手动处理: ${stats.manual}`);
  console.log('='.repeat(80));

  if (stats.errors.length > 0) {
    console.log('\n错误列表:');
    stats.errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }
}

// 主函数
function main() {
  console.log('开始批量国际化修复...\n');

  const stats = {
    filesProcessed: 0,
    hardcodedFound: 0,
    fixed: 0,
    manual: 0,
    errors: []
  };

  // 这里只是演示框架,实际批量处理需要更复杂的逻辑
  console.log('提示: 此脚本为演示版本');
  console.log('建议: 使用i18n-scanner.js查看详细报告后,手动或半自动修复');

  generateReport(stats);
}

if (require.main === module) {
  main();
}

module.exports = { toCamelCase };
