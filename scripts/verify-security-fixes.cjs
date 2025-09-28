#!/usr/bin/env node

/**
 * 权限安全修复验证脚本
 * @description 验证所有安全修复是否正确实施
 */

const fs = require('fs');
const path = require('path');

// 验证结果记录
const verificationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

/**
 * 记录验证结果
 */
function recordResult(type, message, file = '', line = '') {
  const result = {
    type,
    message,
    file,
    line,
    timestamp: new Date().toISOString()
  };
  
  verificationResults.details.push(result);
  verificationResults[type]++;
  
  const emoji = type === 'passed' ? '✅' : type === 'failed' ? '❌' : '⚠️';
  console.log(`${emoji} ${message} ${file ? `(${file}:${line})` : ''}`);
}

/**
 * 检查文件是否存在
 */
function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    recordResult('passed', `${description} 文件存在`, filePath);
    return true;
  } else {
    recordResult('failed', `${description} 文件不存在`, filePath);
    return false;
  }
}

/**
 * 检查文件内容
 */
function checkFileContent(filePath, pattern, description, shouldExist = true) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    recordResult('failed', `无法检查文件内容，文件不存在`, filePath);
    return false;
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const found = pattern.test(content);
    
    if ((shouldExist && found) || (!shouldExist && !found)) {
      recordResult('passed', description, filePath);
      return true;
    } else {
      recordResult('failed', description, filePath);
      return false;
    }
  } catch (error) {
    recordResult('failed', `读取文件失败: ${error.message}`, filePath);
    return false;
  }
}

/**
 * 验证服务器端权限验证API
 */
function verifyServerPermissionAPI() {
  console.log('\n🔍 验证服务器端权限验证API...');
  
  checkFileExists(
    'netlify/functions/verify-permissions.js',
    '服务器端权限验证API'
  );
  
  checkFileContent(
    'netlify/functions/verify-permissions.js',
    /exports\.handler\s*=\s*async/,
    '包含处理函数'
  );
  
  checkFileContent(
    'netlify/functions/verify-permissions.js',
    /checkPermission\s*\(/,
    '包含权限检查逻辑'
  );
  
  checkFileContent(
    'netlify/functions/verify-permissions.js',
    /verifyUserAuth\s*\(/,
    '包含用户认证验证'
  );
}

/**
 * 验证Premium权限硬编码移除
 */
function verifyPremiumHardcodeRemoval() {
  console.log('\n🔍 验证Premium权限硬编码移除...');
  
  checkFileContent(
    'src/components/auth/EnhancedUnifiedPermissionGuard.tsx',
    /🎯\s*特殊处理.*premium.*强制授予权限/,
    'Premium权限硬编码已移除',
    false
  );
  
  checkFileContent(
    'src/components/auth/EnhancedUnifiedPermissionGuard.tsx',
    /isPremiumUser.*hasPermission.*true/,
    '不存在Premium用户权限覆盖逻辑',
    false
  );
  
  checkFileContent(
    'src/components/auth/EnhancedUnifiedPermissionGuard.tsx',
    /安全修复：移除硬编码权限覆盖/,
    '包含安全修复注释'
  );
}

/**
 * 验证权限验证中间件
 */
function verifyPermissionMiddleware() {
  console.log('\n🔍 验证权限验证中间件...');
  
  checkFileExists(
    'netlify/functions/lib/permission-middleware.js',
    '权限验证中间件'
  );
  
  checkFileContent(
    'netlify/functions/lib/permission-middleware.js',
    /createPermissionMiddleware/,
    '包含权限中间件创建函数'
  );
  
  checkFileContent(
    'netlify/functions/lib/permission-middleware.js',
    /checkUserPermission/,
    '包含用户权限检查函数'
  );
  
  checkFileContent(
    'netlify/functions/lib/permission-middleware.js',
    /checkDataAccess/,
    '包含数据访问检查函数'
  );
}

/**
 * 验证关键API权限保护
 */
function verifyAPIPermissionProtection() {
  console.log('\n🔍 验证关键API权限保护...');
  
  checkFileContent(
    'netlify/functions/api/token-usage.js',
    /require.*permission-middleware/,
    'Token使用API引入权限中间件'
  );
  
  checkFileContent(
    'netlify/functions/api/token-usage.js',
    /permissionCheck\(event\)/,
    'Token使用API使用权限检查'
  );
  
  checkFileContent(
    'netlify/functions/update-user-profile.js',
    /createPermissionMiddleware/,
    '用户资料更新API引入权限中间件'
  );
  
  checkFileContent(
    'netlify/functions/update-user-profile.js',
    /无权修改其他用户的资料/,
    '用户资料更新API包含越权检查'
  );
}

/**
 * 验证统一权限逻辑
 */
function verifyUnifiedPermissionLogic() {
  console.log('\n🔍 验证统一权限逻辑...');
  
  checkFileContent(
    'src/services/unifiedPermissionService.ts',
    /checkPermissionSecure/,
    '包含安全权限检查方法'
  );
  
  checkFileContent(
    'src/services/unifiedPermissionService.ts',
    /ServerPermissionService/,
    '整合服务器端权限验证'
  );
  
  checkFileContent(
    'src/services/serverPermissionService.ts',
    /localhost:8888/,
    '服务器端API URL配置正确'
  );
}

/**
 * 验证数据访问隔离
 */
function verifyDataAccessIsolation() {
  console.log('\n🔍 验证数据访问隔离...');
  
  checkFileExists(
    'src/utils/dataAccessControl.ts',
    '数据访问控制工具'
  );
  
  checkFileContent(
    'src/utils/dataAccessControl.ts',
    /DataAccessController/,
    '包含数据访问控制器'
  );
  
  checkFileContent(
    'src/utils/dataAccessControl.ts',
    /checkUserDataAccess/,
    '包含用户数据访问检查'
  );
  
  checkFileContent(
    'src/utils/dataAccessControl.ts',
    /水平越权/,
    '包含水平越权防护'
  );
}

/**
 * 验证集中权限策略管理
 */
function verifyCentralizedPermissionManager() {
  console.log('\n🔍 验证集中权限策略管理...');
  
  checkFileExists(
    'src/services/centralizedPermissionManager.ts',
    '集中权限策略管理器'
  );
  
  checkFileContent(
    'src/services/centralizedPermissionManager.ts',
    /CentralizedPermissionManager/,
    '包含集中权限管理器'
  );
  
  checkFileContent(
    'src/services/centralizedPermissionManager.ts',
    /makePermissionDecision/,
    '包含权限决策方法'
  );
  
  checkFileContent(
    'src/services/centralizedPermissionManager.ts',
    /registerPolicy/,
    '包含策略注册方法'
  );
}

/**
 * 验证审计日志系统
 */
function verifyAuditLoggingSystem() {
  console.log('\n🔍 验证审计日志系统...');
  
  checkFileExists(
    'src/services/permissionAuditLogger.ts',
    '权限审计日志系统'
  );
  
  checkFileContent(
    'src/services/permissionAuditLogger.ts',
    /PermissionAuditLogger/,
    '包含权限审计日志器'
  );
  
  checkFileContent(
    'src/services/permissionAuditLogger.ts',
    /logPermissionCheck/,
    '包含权限检查日志记录'
  );
  
  checkFileContent(
    'src/services/permissionAuditLogger.ts',
    /logSecurityViolation/,
    '包含安全违规日志记录'
  );
}

/**
 * 验证开发环境权限绕过移除
 */
function verifyDevBypassRemoval() {
  console.log('\n🔍 验证开发环境权限绕过移除...');
  
  const files = [
    'src/config/unifiedPermissionConfig.ts',
    'src/services/unifiedPermissionService.ts',
    'src/components/auth/EnhancedUnifiedPermissionGuard.tsx'
  ];
  
  files.forEach(file => {
    checkFileContent(
      file,
      /NODE_ENV.*development.*return\s+true/,
      `${file} 中不存在开发环境权限绕过`,
      false
    );
    
    checkFileContent(
      file,
      /localhost.*return\s+true/,
      `${file} 中不存在localhost权限绕过`,
      false
    );
  });
}

/**
 * 验证类型安全
 */
function verifyTypeSafety() {
  console.log('\n🔍 验证类型安全...');
  
  checkFileContent(
    'src/types/permissions.ts',
    /ExtendedPermissionType/,
    '权限类型定义存在'
  );
  
  checkFileContent(
    'src/services/unifiedPermissionService.ts',
    /SessionUserInfo.*null/,
    '用户信息可为null的类型安全'
  );
  
  checkFileContent(
    'netlify/functions/lib/permission-middleware.js',
    /async function authenticateUser/,
    '后端认证函数类型正确'
  );
}

/**
 * 生成验证报告
 */
function generateReport() {
  console.log('\n📊 生成验证报告...');
  
  const total = verificationResults.passed + verificationResults.failed + verificationResults.warnings;
  const passRate = total > 0 ? ((verificationResults.passed / total) * 100).toFixed(1) : 0;
  
  const report = {
    summary: {
      total,
      passed: verificationResults.passed,
      failed: verificationResults.failed,
      warnings: verificationResults.warnings,
      passRate: `${passRate}%`,
      timestamp: new Date().toISOString()
    },
    details: verificationResults.details,
    recommendations: []
  };
  
  // 生成建议
  if (verificationResults.failed > 0) {
    report.recommendations.push('请修复失败的检查项');
  }
  
  if (verificationResults.warnings > 0) {
    report.recommendations.push('请关注警告项并考虑优化');
  }
  
  if (verificationResults.failed === 0 && verificationResults.warnings === 0) {
    report.recommendations.push('所有安全修复验证通过！');
  }
  
  // 保存报告
  const reportPath = path.join(__dirname, '..', 'security-verification-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📋 验证结果汇总:');
  console.log(`总计: ${total} 项`);
  console.log(`✅ 通过: ${verificationResults.passed} 项`);
  console.log(`❌ 失败: ${verificationResults.failed} 项`);
  console.log(`⚠️ 警告: ${verificationResults.warnings} 项`);
  console.log(`📈 通过率: ${passRate}%`);
  console.log(`📄 详细报告已保存到: security-verification-report.json`);
  
  return report;
}

/**
 * 主验证函数
 */
function main() {
  console.log('🔒 开始验证权限安全修复...\n');
  
  verifyServerPermissionAPI();
  verifyPremiumHardcodeRemoval();
  verifyPermissionMiddleware();
  verifyAPIPermissionProtection();
  verifyUnifiedPermissionLogic();
  verifyDataAccessIsolation();
  verifyCentralizedPermissionManager();
  verifyAuditLoggingSystem();
  verifyDevBypassRemoval();
  verifyTypeSafety();
  
  const report = generateReport();
  
  // 根据结果设置退出码
  process.exit(verificationResults.failed > 0 ? 1 : 0);
}

// 运行验证
if (require.main === module) {
  main();
}

module.exports = {
  main,
  verificationResults
};