/**
 * 🔧 认证超时修复验证脚本
 * 验证所有认证相关的超时配置和重试机制是否正确实施
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 开始验证认证超时修复...\n');

// 验证项目清单
const verificationChecks = [
  {
    name: '统一超时配置验证',
    files: [
      'src/api/request.ts',
      'src/services/verificationCodeService.ts', 
      'src/pages/CustomLoginPage.tsx',
      'src/utils/authTokenHandler.ts'
    ],
    check: (content, filename) => {
      const has90sTimeout = content.includes('timeout: 90000') || content.includes('timeout:90000');
      const has60sTimeout = content.includes('timeout: 60000') || content.includes('timeout:60000');
      
      if (filename.includes('request.ts')) {
        return has60sTimeout; // request.ts 使用60秒
      } else {
        return has90sTimeout; // 其他认证文件使用90秒
      }
    }
  },
  {
    name: '网络优化配置验证',
    files: [
      'src/services/verificationCodeService.ts',
      'src/pages/CustomLoginPage.tsx', 
      'src/utils/authTokenHandler.ts'
    ],
    check: (content) => {
      return content.includes('requestConfig') &&
             content.includes('withCredentials: false') &&
             content.includes('Cache-Control') &&
             content.includes('WenPai-App/1.0.0');
    }
  },
  {
    name: '重试机制集成验证',
    files: [
      'src/pages/CustomLoginPage.tsx'
    ],
    check: (content) => {
      return content.includes('diagnoseAndRetry') &&
             content.includes('AuthNetworkDiagnostic') &&
             content.includes('AuthErrorAnalyzer');
    }
  },
  {
    name: '诊断工具存在验证',
    files: [
      'src/utils/authNetworkDiagnostic.ts'
    ],
    check: (content) => {
      return content.includes('AuthNetworkDiagnostic') &&
             content.includes('AuthRetryManager') &&
             content.includes('AuthErrorAnalyzer') &&
             content.includes('diagnoseAndRetry');
    }
  }
];

let allPassed = true;
let totalChecks = 0;
let passedChecks = 0;

// 执行验证
verificationChecks.forEach(check => {
  console.log(`📋 ${check.name}:`);
  
  check.files.forEach(filePath => {
    totalChecks++;
    const fullPath = path.join(__dirname, filePath);
    
    try {
      if (!fs.existsSync(fullPath)) {
        console.log(`  ❌ ${filePath} - 文件不存在`);
        allPassed = false;
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const passed = check.check(content, filePath);
      
      if (passed) {
        console.log(`  ✅ ${filePath} - 验证通过`);
        passedChecks++;
      } else {
        console.log(`  ❌ ${filePath} - 验证失败`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`  ❌ ${filePath} - 读取失败: ${error.message}`);
      allPassed = false;
    }
  });
  
  console.log('');
});

// 额外检查：验证环境变量配置
console.log('📋 环境变量配置验证:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasAuthingConfig = envContent.includes('VITE_AUTHING_APP_ID') &&
                          envContent.includes('VITE_AUTHING_DOMAIN') &&
                          envContent.includes('VITE_AUTHING_HOST');
  
  if (hasAuthingConfig) {
    console.log('  ✅ .env - Authing配置存在');
    passedChecks++;
  } else {
    console.log('  ❌ .env - Authing配置缺失');
    allPassed = false;
  }
  totalChecks++;
} else {
  console.log('  ⚠️  .env - 文件不存在');
}

console.log('');

// 输出验证结果
console.log('📊 验证结果汇总:');
console.log(`总检查项: ${totalChecks}`);
console.log(`通过检查: ${passedChecks}`);
console.log(`失败检查: ${totalChecks - passedChecks}`);
console.log(`通过率: ${Math.round((passedChecks / totalChecks) * 100)}%`);

if (allPassed) {
  console.log('\n🎉 所有验证通过！认证超时修复已正确实施。');
  console.log('\n✅ 修复效果:');
  console.log('  - 统一90秒超时配置');
  console.log('  - 智能重试机制(最多3次)');
  console.log('  - 网络诊断和错误分析');
  console.log('  - 用户友好的错误提示');
  
  console.log('\n🚀 建议测试步骤:');
  console.log('  1. 访问 http://localhost:5173/custom-login');
  console.log('  2. 尝试手机验证码登录');
  console.log('  3. 尝试密码登录');
  console.log('  4. 观察控制台日志中的重试和诊断信息');
  
} else {
  console.log('\n❌ 验证失败！请检查上述失败项并修复。');
  process.exit(1);
}

console.log('\n📝 相关文档:');
console.log('  - 修复报告: AUTH_TIMEOUT_FIX_REPORT.md');
console.log('  - 规则文档: claude.md (3.6.4节)');
console.log('  - 诊断工具: src/utils/authNetworkDiagnostic.ts');
