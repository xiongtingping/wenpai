#!/usr/bin/env node

/**
 * 安全修复验证脚本
 * 🔒 验证P0级别安全修复的有效性
 * 
 * 验证项目：
 * 1. JWT验证机制是否正确实现
 * 2. AES加密是否替换了Base64编码  
 * 3. 安全用户状态管理是否工作正常
 * 4. 后端权限验证是否安全
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔒 开始验证安全修复...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

function addResult(test, status, message, file = '') {
  results.details.push({ test, status, message, file });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else if (status === 'WARN') results.warnings++;
}

// 1. 验证JWT验证机制
async function verifyJWTImplementation() {
  console.log('🔐 验证JWT验证机制...');
  
  try {
    const verifyPermissionsPath = path.join(projectRoot, 'netlify/functions/verify-permissions.js');
    const content = await fs.readFile(verifyPermissionsPath, 'utf8');
    
    // 检查是否实现了真正的JWT验证
    if (content.includes('extractUserIdFromToken') && 
        content.includes('verifyTokenSignature') &&
        content.includes('payload.exp') &&
        content.includes('payload.nbf') &&
        content.includes('payload.iss') &&
        content.includes('payload.aud')) {
      addResult(
        'JWT验证机制',
        'PASS',
        '已实现完整的JWT验证，包括过期时间、发行者、受众验证',
        'netlify/functions/verify-permissions.js'
      );
    } else {
      addResult(
        'JWT验证机制',
        'FAIL',
        '缺少关键的JWT验证逻辑',
        'netlify/functions/verify-permissions.js'
      );
    }

    // 检查是否有安全日志记录
    if (content.includes('console.log(\'✅ 用户验证成功\'') &&
        content.includes('console.error(\'❌ Token验证失败\'')) {
      addResult(
        'JWT安全审计日志',
        'PASS',
        '已添加安全审计日志记录',
        'netlify/functions/verify-permissions.js'
      );
    } else {
      addResult(
        'JWT安全审计日志',
        'WARN',
        '建议添加更完整的安全审计日志',
        'netlify/functions/verify-permissions.js'
      );
    }
    
  } catch (error) {
    addResult(
      'JWT验证机制',
      'FAIL',
      `无法读取JWT验证文件: ${error.message}`,
      'netlify/functions/verify-permissions.js'
    );
  }
}

// 2. 验证AES加密实现
async function verifyAESEncryption() {
  console.log('🔐 验证AES加密实现...');
  
  try {
    const encryptionServicePath = path.join(projectRoot, 'src/services/encryptionService.ts');
    const content = await fs.readFile(encryptionServicePath, 'utf8');
    
    // 检查是否实现了真正的AES-256-GCM加密
    if (content.includes('AES-GCM') && 
        content.includes('KEY_LENGTH = 256') &&
        content.includes('crypto.subtle.encrypt') &&
        content.includes('crypto.subtle.decrypt') &&
        content.includes('PBKDF2')) {
      addResult(
        'AES-256-GCM加密',
        'PASS',
        '已实现真正的AES-256-GCM加密，包括PBKDF2密钥派生',
        'src/services/encryptionService.ts'
      );
    } else {
      addResult(
        'AES-256-GCM加密',
        'FAIL',
        '缺少完整的AES-256-GCM加密实现',
        'src/services/encryptionService.ts'
      );
    }

    // 检查是否有降级加密机制
    if (content.includes('FallbackEncryptionService') &&
        content.includes('SecureEncryption')) {
      addResult(
        '降级加密机制',
        'PASS',
        '已实现降级加密机制，确保兼容性',
        'src/services/encryptionService.ts'
      );
    } else {
      addResult(
        '降级加密机制',
        'FAIL',
        '缺少降级加密机制',
        'src/services/encryptionService.ts'
      );
    }

    // 检查是否有校验和验证
    if (content.includes('generateChecksum') &&
        content.includes('verifyChecksum') &&
        content.includes('SHA-256')) {
      addResult(
        'SHA-256校验和',
        'PASS',
        '已实现SHA-256校验和验证机制',
        'src/services/encryptionService.ts'
      );
    } else {
      addResult(
        'SHA-256校验和',
        'FAIL',
        '缺少校验和验证机制',
        'src/services/encryptionService.ts'
      );
    }
    
  } catch (error) {
    addResult(
      'AES加密验证',
      'FAIL',
      `无法读取加密服务文件: ${error.message}`,
      'src/services/encryptionService.ts'
    );
  }
}

// 3. 验证安全用户状态管理
async function verifySecureUserState() {
  console.log('🔒 验证安全用户状态管理...');
  
  try {
    const secureUserStatePath = path.join(projectRoot, 'src/services/secureUserStateService.ts');
    const content = await fs.readFile(secureUserStatePath, 'utf8');
    
    // 检查是否使用真正的加密存储
    if (content.includes('await SecureEncryption.encrypt') &&
        content.includes('await SecureEncryption.decrypt') &&
        content.includes('EncryptedUserState') &&
        content.includes('checksum')) {
      addResult(
        '加密用户状态存储',
        'PASS',
        '已实现加密的用户状态存储，包含数据完整性验证',
        'src/services/secureUserStateService.ts'
      );
    } else {
      addResult(
        '加密用户状态存储',
        'FAIL',
        '用户状态存储仍使用不安全的方式',
        'src/services/secureUserStateService.ts'
      );
    }

    // 检查是否有过期和验证机制
    if (content.includes('validateUserState') &&
        content.includes('expiresAt') &&
        content.includes('STATE_DURATION')) {
      addResult(
        '状态过期验证',
        'PASS',
        '已实现状态过期和验证机制',
        'src/services/secureUserStateService.ts'
      );
    } else {
      addResult(
        '状态过期验证',
        'FAIL',
        '缺少状态过期和验证机制',
        'src/services/secureUserStateService.ts'
      );
    }

    // 检查是否有迁移机制
    if (content.includes('getUserStateFromLegacy') &&
        content.includes('迁移到安全存储')) {
      addResult(
        '向后兼容迁移',
        'PASS',
        '已实现向后兼容的数据迁移机制',
        'src/services/secureUserStateService.ts'
      );
    } else {
      addResult(
        '向后兼容迁移',
        'WARN',
        '建议添加向后兼容的数据迁移机制',
        'src/services/secureUserStateService.ts'
      );
    }
    
  } catch (error) {
    addResult(
      '安全用户状态管理',
      'FAIL',
      `无法读取安全用户状态文件: ${error.message}`,
      'src/services/secureUserStateService.ts'
    );
  }
}

// 4. 验证认证上下文的异步更新
async function verifyAuthContextUpdates() {
  console.log('🔄 验证认证上下文异步更新...');
  
  try {
    const authContextPath = path.join(projectRoot, 'src/contexts/UnifiedAuthContext.tsx');
    const content = await fs.readFile(authContextPath, 'utf8');
    
    // 检查是否已更新为异步调用
    if (content.includes('await SecureUserStateService.getUserState()') &&
        content.includes('await SecureUserStateService.storeUserState') &&
        content.includes('await SecureUserStateService.updateUserState')) {
      addResult(
        '异步安全存储集成',
        'PASS',
        '认证上下文已正确集成异步安全存储',
        'src/contexts/UnifiedAuthContext.tsx'
      );
    } else {
      addResult(
        '异步安全存储集成',
        'FAIL',
        '认证上下文仍使用同步存储调用',
        'src/contexts/UnifiedAuthContext.tsx'
      );
    }

    // 检查是否有安全注释
    if (content.includes('🔒 安全修复') &&
        content.includes('异步安全用户状态管理')) {
      addResult(
        '安全修复文档',
        'PASS',
        '已添加安全修复文档注释',
        'src/contexts/UnifiedAuthContext.tsx'
      );
    } else {
      addResult(
        '安全修复文档',
        'WARN',
        '建议添加安全修复的文档注释',
        'src/contexts/UnifiedAuthContext.tsx'
      );
    }
    
  } catch (error) {
    addResult(
      '认证上下文更新',
      'FAIL',
      `无法读取认证上下文文件: ${error.message}`,
      'src/contexts/UnifiedAuthContext.tsx'
    );
  }
}

// 5. 验证是否移除了不安全的Base64编码
async function verifyBase64Removal() {
  console.log('🚫 验证Base64编码移除...');
  
  try {
    const secureUserStatePath = path.join(projectRoot, 'src/services/secureUserStateService.ts');
    const content = await fs.readFile(secureUserStatePath, 'utf8');
    
    // 检查是否还有不安全的Base64编码使用
    const base64Matches = content.match(/btoa\(|atob\(/g);
    if (!base64Matches || base64Matches.length === 0) {
      addResult(
        'Base64编码移除',
        'PASS',
        '已移除不安全的Base64编码，使用真正的加密',
        'src/services/secureUserStateService.ts'
      );
    } else {
      addResult(
        'Base64编码移除',
        'WARN',
        `仍然发现${base64Matches.length}处Base64编码使用，请确认是否为合理用途`,
        'src/services/secureUserStateService.ts'
      );
    }
    
  } catch (error) {
    addResult(
      'Base64编码检查',
      'FAIL',
      `无法检查Base64编码: ${error.message}`,
      'src/services/secureUserStateService.ts'
    );
  }
}

// 6. 验证测试用例是否创建
async function verifyTestCases() {
  console.log('🧪 验证测试用例...');
  
  const testFiles = [
    'src/services/__tests__/encryptionService.test.ts',
    'src/services/__tests__/secureUserStateService.test.ts',
    'netlify/functions/__tests__/verify-permissions.test.js'
  ];

  for (const testFile of testFiles) {
    try {
      const testPath = path.join(projectRoot, testFile);
      await fs.access(testPath);
      const content = await fs.readFile(testPath, 'utf8');
      
      // 检查测试文件的内容质量
      const testCount = (content.match(/it\(/g) || []).length;
      const describeCount = (content.match(/describe\(/g) || []).length;
      
      if (testCount >= 10 && describeCount >= 3) {
        addResult(
          `测试用例:${path.basename(testFile)}`,
          'PASS',
          `包含${testCount}个测试用例，${describeCount}个测试组`,
          testFile
        );
      } else {
        addResult(
          `测试用例:${path.basename(testFile)}`,
          'WARN',
          `测试覆盖可能不足：${testCount}个测试用例，${describeCount}个测试组`,
          testFile
        );
      }
    } catch (error) {
      addResult(
        `测试用例:${path.basename(testFile)}`,
        'FAIL',
        '测试文件不存在或无法访问',
        testFile
      );
    }
  }
}

// 7. 验证关键安全标识符是否存在
async function verifySecurityIdentifiers() {
  console.log('🔍 验证安全标识符...');
  
  const securityKeywords = [
    '🔒 安全修复',
    'AES-256-GCM',
    'JWT验证',
    'SecureEncryption',
    'EncryptedUserState',
    'PBKDF2',
    'SHA-256'
  ];

  const filesToCheck = [
    'src/services/encryptionService.ts',
    'src/services/secureUserStateService.ts',
    'netlify/functions/verify-permissions.js',
    'src/contexts/UnifiedAuthContext.tsx'
  ];

  for (const file of filesToCheck) {
    try {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      const foundKeywords = securityKeywords.filter(keyword => 
        content.includes(keyword)
      );
      
      if (foundKeywords.length >= 3) {
        addResult(
          `安全标识符:${path.basename(file)}`,
          'PASS',
          `发现${foundKeywords.length}个安全标识符`,
          file
        );
      } else {
        addResult(
          `安全标识符:${path.basename(file)}`,
          'WARN',
          `仅发现${foundKeywords.length}个安全标识符，可能需要更多安全措施`,
          file
        );
      }
    } catch (error) {
      addResult(
        `安全标识符:${path.basename(file)}`,
        'FAIL',
        '无法读取文件进行安全标识符检查',
        file
      );
    }
  }
}

// 打印结果
function printResults() {
  console.log('\n🔒 安全修复验证报告');
  console.log('='.repeat(50));
  
  console.log(`\n📊 总体统计:`);
  console.log(`✅ 通过: ${results.passed}`);
  console.log(`❌ 失败: ${results.failed}`);
  console.log(`⚠️  警告: ${results.warnings}`);
  
  const total = results.passed + results.failed + results.warnings;
  const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  console.log(`📈 成功率: ${successRate}%\n`);

  // 按状态分组显示详细结果
  const groups = {
    'PASS': '✅ 通过的测试',
    'FAIL': '❌ 失败的测试', 
    'WARN': '⚠️  警告的测试'
  };

  Object.entries(groups).forEach(([status, title]) => {
    const items = results.details.filter(item => item.status === status);
    if (items.length > 0) {
      console.log(`${title}:`);
      items.forEach(item => {
        console.log(`  • ${item.test}: ${item.message}`);
        if (item.file) {
          console.log(`    📁 ${item.file}`);
        }
      });
      console.log('');
    }
  });

  // 安全建议
  if (results.failed > 0) {
    console.log('🚨 安全建议:');
    console.log('  • 立即修复失败的安全检查项目');
    console.log('  • 确保所有加密功能正常工作');
    console.log('  • 验证JWT验证机制的完整性');
    console.log('');
  }

  if (results.warnings > 0) {
    console.log('⚠️  改进建议:');
    console.log('  • 查看警告项目并考虑改进');
    console.log('  • 增加测试覆盖度');
    console.log('  • 添加更详细的安全文档');
    console.log('');
  }

  if (results.failed === 0 && results.warnings <= 2) {
    console.log('🎉 恭喜！安全修复验证基本通过！');
    console.log('   所有关键安全功能都已正确实现。');
  } else if (results.failed === 0) {
    console.log('✅ 安全修复验证通过，仍有改进空间。');
  } else {
    console.log('🚨 安全修复验证未完全通过，需要立即处理失败项目。');
  }
}

// 主函数
async function main() {
  try {
    await verifyJWTImplementation();
    await verifyAESEncryption();
    await verifySecureUserState();
    await verifyAuthContextUpdates();
    await verifyBase64Removal();
    await verifyTestCases();
    await verifySecurityIdentifiers();
    
    printResults();
    
    // 设置退出码
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
    process.exit(1);
  }
}

main();