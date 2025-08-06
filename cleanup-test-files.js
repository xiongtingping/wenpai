#!/usr/bin/env node

/**
 * 🧹 批量清理多余的测试文件
 * 按照用户确认的清单删除所有测试文件
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 开始批量清理多余的测试文件...\n');

// 要删除的文件清单
const filesToDelete = [
  // 根目录AI相关测试文件
  'test-ai-api-connection.html',
  'test-ai-api.cjs',
  'test-ai-api.js',
  'test-ai-comprehensive.html',
  'test-ai-connection.js',
  'test-ai-fix.js',
  'test-ai-functionality.js',
  'test-ai-only-mode.cjs',
  'test-ai-real-api.cjs',
  'test-ai-real-api.js',
  'test-ai-response.html',
  'test-ai-service-real.html',
  'test-ai-service-simple.cjs',
  'test-ai-service.html',
  'test-ai-status.js',
  'test-project-ai-service.cjs',

  // API测试文件
  'test-api-connection.cjs',
  'test-api-debug.html',
  'test-api-debug.js',
  'test-api-fix-final.html',
  'test-api-flow.js',
  'test-api-keys.js',
  'test-api-optimization.cjs',
  'test-api-simple.html',
  'test-api-update.cjs',
  'test-api.js',
  'test-dailyhot-api.js',
  'test-deepseek-api.js',
  'test-deepseek-fix.cjs',
  'test-deepseek-timeout-fix.cjs',
  'test-openai-api.js',
  'test-openai-direct.cjs',
  'test-openai-fix.html',

  // Authing认证测试文件
  'test-auth-flow.cjs',
  'test-authing-auto-close.html',
  'test-authing-backup-check.html',
  'test-authing-cdn-fix.html',
  'test-authing-cdn.html',
  'test-authing-complete.cjs',
  'test-authing-connection.cjs',
  'test-authing-core.html',
  'test-authing-correct.html',
  'test-authing-debug.html',
  'test-authing-different-format.cjs',
  'test-authing-direct.cjs',
  'test-authing-final-verification.html',
  'test-authing-final.html',
  'test-authing-fix-verification.html',
  'test-authing-fixed.html',
  'test-authing-init.html',
  'test-authing-inspect.html',
  'test-authing-local-esm.html',
  'test-authing-local-file.html',
  'test-authing-local-files.html',
  'test-authing-local.html',
  'test-authing-local.sh',
  'test-authing-login-fix.html',
  'test-authing-login.cjs',
  'test-authing-login.html',
  'test-authing-modal.html',
  'test-authing-new-config.js',
  'test-authing-new.html',
  'test-authing-official.html',
  'test-authing-oidc-endpoints.cjs',
  'test-authing-quick-fix.html',
  'test-authing-sdk.cjs',
  'test-authing-sdk.js',
  'test-authing-sdk.mjs',
  'test-authing-simple-fix.html',
  'test-authing-simple.html',
  'test-authing-specific.html',
  'test-authing-umd.html',
  'test-authing-working.html',
  'test-authing.html',
  'test-authing.js',

  // UI/功能测试文件
  'test-alignment-fix.html',
  'test-beige-theme.html',
  'test-beige-theme.js',
  'test-brand-library-fixes.html',
  'test-brand-library-ui-removal.html',
  'test-button-alignment.js',
  'test-dropdown-functionality.html',
  'test-emoji-api.html',
  'test-emoji-cdn.html',
  'test-emoji-cdn.js',
  'test-emoji-count-simple.html',
  'test-emoji-count.html',
  'test-emoji-display.html',
  'test-emoji-font.html',
  'test-homepage-layout.html',
  'test-homepage-ui.js',
  'test-icon-fix.html',
  'test-login-fix.html',
  'test-login-modal-fix.html',
  'test-login-pages.html',
  'test-login-redirect-fix.html',
  'test-modal-dom-structure.html',
  'test-navigation.html',
  'test-profile-page-fix.html',
  'test-routes.html',
  'test-theme-simple.html',
  'test-theme.html',

  // 其他测试文件
  'test-core-features.js',
  'test-env-vars.cjs',
  'test-env.html',
  'test-file.txt',
  'test-fix-summary.cjs',
  'test-fix.html',
  'test-fixes-verification.html',
  'test-image-generation.html',
  'test-image-generation.js',
  'test-local-functions.html',
  'test-module-fix-verification.html',
  'test-module-fix.html',
  'test-netlify-functions.html',
  'test-network-connection.js',
  'test-optimization-success.cjs',
  'test-payment-fix.js',
  'test-payment-timer.html',
  'test-personalized-emoji.html',
  'test-queue-fix.cjs',
  'test-queue-result-fix.cjs',
  'test-queue-return-fix.cjs',
  'test-rate-limit-fix.cjs',
  'test-real-api.js',
  'test-retry-mechanism.js',
  'test-retry.html',
  'test-simple-api.html',
  'test-simple-emoji.html',
  'test-simple-gallery.html',
  'test-simple-login-fix.html',
  'test-smart-mock-images.html',
  'test-subtitle-layout.js',
  'test-suspense-fix.js',
  'test-timeout-optimization.cjs',
  'test-timeout-optimization.js',
  'test-title-generation.js',
  'test-title-generator-fix.html',
  'test-title-generator-optimization.cjs',
  'test-title-generator.html',
  'test-tooltip-removal.js',
  'test-topic-subscription.html',
  'test-topic-tags.mjs',
  'test-unified-char-control.js',
  'test-user-profile.cjs',
  'test-web-format.cjs',
  'test-wenpai-domain.cjs',

  // src/test目录
  'src/test/fileFormatEnhancementTest.ts',
  'src/test/titleGeneratorTest.ts',
  'src/test/webExtractorTest.ts',
  'src/test-undefined-fix.js',

  // tests目录
  'tests/batch-forward.spec.ts',

  // tools目录测试工具
  'tools/advanced-undefined-detector.js',
  'tools/final-undefined-verification.js',
  'tools/live-undefined-check.js',
  'tools/real-undefined-test.js',
  'tools/simulate-user-interaction.js',
  'tools/unlock-all-files.js',
  'tools/relock-all-files.js',
  'tools/verify-undefined-fix.js',

  // public目录测试文件
  'public/test-authing-login.html',
  'public/test-login-clean.html',
  'public/test-login-simple.html',
  'public/test-modal-visibility.html',
  'public/test-simple.html',
  'public/test.html',
  'public/simple-authing-test.html',
  'public/hashtag-test.html',
  'public/diagnose-modal-issue.html',
  'public/authing-regression-test.html',

  // 测试相关文档
  'test-improvements.md',
  'test-brand-document.txt',
  'test-brand-material.txt',

  // 检查脚本
  'check-ai-api-usage.cjs',
  'check-ai-api-usage.js'
];

// 要删除的目录
const dirsToDelete = [
  'src/test',
  'tests',
  '__tests__'
];

let deletedFiles = 0;
let deletedDirs = 0;
let errors = 0;

// 删除文件
console.log('📁 删除测试文件...');
filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ 删除文件: ${file}`);
      deletedFiles++;
    } else {
      console.log(`⚠️ 文件不存在: ${file}`);
    }
  } catch (error) {
    console.log(`❌ 删除失败: ${file} - ${error.message}`);
    errors++;
  }
});

// 删除目录
console.log('\n📂 删除测试目录...');
dirsToDelete.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ 删除目录: ${dir}`);
      deletedDirs++;
    } else {
      console.log(`⚠️ 目录不存在: ${dir}`);
    }
  } catch (error) {
    console.log(`❌ 删除失败: ${dir} - ${error.message}`);
    errors++;
  }
});

console.log('\n📊 清理统计:');
console.log(`✅ 删除文件: ${deletedFiles} 个`);
console.log(`✅ 删除目录: ${deletedDirs} 个`);
console.log(`❌ 错误: ${errors} 个`);

if (errors === 0) {
  console.log('\n🎉 测试文件清理完成！');
} else {
  console.log('\n⚠️ 清理完成，但有部分错误');
}

console.log('\n💡 建议: 运行 git status 检查删除结果');
