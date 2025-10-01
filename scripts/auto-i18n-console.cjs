#!/usr/bin/env node

/**
 * 自动将console中的中文转为英文
 * 这个脚本会批量处理所有源代码文件中的console.log/error/warn
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 中文到英文的常用映射
const translationMap = {
  // 服务相关
  '服务依赖初始化完成': 'Service dependencies initialized',
  '服务初始化失败': 'Service initialization failed',
  'i18n异步初始化完成': 'i18n async initialization completed',

  // 主题相关
  '加载持久化主题失败': 'Failed to load persisted theme',
  '加载持久化主题': 'Loaded persisted theme',

  // 认证相关
  'App层检测到恶意回调URL': 'App layer detected malicious callback URL',
  '解析认证码': 'Parsed auth code',
  'App层重定向到': 'App layer redirecting to',
  '立即处理重定向': 'handling redirect',

  // 错误相关
  '应用级错误详情': 'App-level error details',
  '应用级错误': 'App-level error',
  '简化': 'simplified',
  '这可能是网络连接或CORS配置问题': 'This may be a network connection or CORS configuration issue',
  '不影响Dialog修复功能': 'does not affect Dialog repair functionality',

  // 通用
  '失败': 'failed',
  '成功': 'success',
  '错误': 'error',
  '警告': 'warning',
  '完成': 'completed',
  '初始化': 'initialization',
  '加载': 'loading',
  '保存': 'saving',
  '删除': 'deleting',
  '更新': 'updating',
  '创建': 'creating',
  '获取': 'fetching',
  '发送': 'sending',
  '接收': 'receiving',
  '处理': 'processing',
  '解析': 'parsing',
  '验证': 'validating',
  '配置': 'configuration',
  '请求': 'request',
  '响应': 'response',
  '数据': 'data',
  '文件': 'file',
  '用户': 'user',
  '权限': 'permission',
  '登录': 'login',
  '注销': 'logout',
  '注册': 'register'
};

function replaceConsoleMessages(content) {
  let modified = content;
  let changes = 0;

  // 匹配console.log/error/warn中的中文字符串
  const consolePattern = /(console\.(log|error|warn|info|debug)\s*\(\s*[`'"])(.*?)([`'"])/g;

  modified = modified.replace(consolePattern, (match, prefix, method, message, quote) => {
    // 如果没有中文,跳过
    if (!/[\u4e00-\u9fa5]/.test(message)) {
      return match;
    }

    let translatedMessage = message;

    // 尝试使用映射表翻译
    for (const [cn, en] of Object.entries(translationMap)) {
      if (message.includes(cn)) {
        translatedMessage = translatedMessage.replace(new RegExp(cn, 'g'), en);
        changes++;
      }
    }

    // 如果还有中文未翻译,保持原样(需要手动处理)
    if (/[\u4e00-\u9fa5]/.test(translatedMessage)) {
      return match;
    }

    return prefix + translatedMessage + quote;
  });

  return { content: modified, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { content: newContent, changes } = replaceConsoleMessages(content);

    if (changes > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${filePath}: ${changes} changes`);
      return changes;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function main() {
  const srcPath = path.join(process.cwd(), 'src');

  // 找到所有TS/TSX文件
  const files = glob.sync('{src,scripts}/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts']
  });

  console.log(`Found ${files.length} files to process...\n`);

  let totalChanges = 0;
  let filesModified = 0;

  files.forEach(file => {
    const changes = processFile(file);
    if (changes > 0) {
      filesModified++;
      totalChanges += changes;
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`处理完成!`);
  console.log(`文件总数: ${files.length}`);
  console.log(`修改文件: ${filesModified}`);
  console.log(`总变更数: ${totalChanges}`);
  console.log('='.repeat(60));
}

if (require.main === module) {
  main();
}
