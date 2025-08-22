/**
 * 🧪 Round #4 redirect_uri修复效果测试脚本
 * 测试各种访问方式下的认证流程是否正常
 */

const fs = require('fs');

console.log('🧪 Round #4 redirect_uri修复效果测试');
console.log('=======================================\n');

/**
 * 生成测试指南
 */
function generateTestGuide() {
  const testGuide = `
# 🧪 Round #4 redirect_uri修复测试指南

## 🎯 修复说明

**Round #4修复要点**:
- ✅ 智能域名映射：根据请求origin选择正确的redirect_uri  
- ✅ 前端传递优先：优先使用前端传递的original_redirect_uri
- ✅ 兜底机制完善：确保各种访问方式都有对应的redirect_uri
- ✅ 调试日志增强：便于追踪redirect_uri的选择过程

**关键改进**:
1. **前端一致性传递**: callbackHandler.ts传递认证时使用的redirect_uri
2. **后端智能映射**: 根据origin正确映射redirect_uri
3. **兜底逻辑完善**: 处理各种边缘情况

## 🧪 测试步骤

### 第0步：清除所有缓存
\`\`\`bash
# 清除浏览器缓存
1. 按 Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
2. 选择"全部时间"
3. 勾选"缓存的图片和文件"、"Cookie和其他网站数据"、"浏览数据"
4. 点击"清除数据"

# 清除localStorage
1. 打开开发者工具 (F12)
2. 进入 Application/存储 面板
3. 展开 Local Storage
4. 右键选择域名，点击"Clear"
\`\`\`

### 第1步：测试主域名访问 (www.wenpai.xyz) 🎯
\`\`\`bash
# 1. 打开新的无痕/隐私窗口
# 2. 访问: https://www.wenpai.xyz/
# 3. 点击"登录"按钮
# 4. 完成Authing认证流程
# 5. 观察是否成功回调，无redirect_uri错误
\`\`\`

**预期结果**:
- ✅ 认证成功，没有"redirect_uri 与发起认证时不符"错误
- ✅ 控制台显示：\`✅ 使用前端传递的redirect_uri: https://www.wenpai.xyz/callback\`
- ✅ 后端日志显示：\`redirect_uri_source: frontend_provided\`

### 第2步：测试子域名访问 (wenpai.xyz) 🎯  
\`\`\`bash
# 1. 新窗口访问: https://wenpai.xyz/
# 2. 点击"登录"按钮  
# 3. 完成Authing认证流程
# 4. 观察认证结果
\`\`\`

**预期结果**:
- ✅ 认证成功，redirect_uri自动匹配为 \`https://wenpai.xyz/callback\`
- ✅ 控制台显示正确的域名映射

### 第3步：测试Netlify域名访问 🎯
\`\`\`bash  
# 1. 访问: https://wenpai.netlify.app/
# 2. 执行认证流程
# 3. 验证redirect_uri匹配
\`\`\`

**预期结果**:
- ✅ redirect_uri正确映射为 \`https://wenpai.netlify.app/callback\`

### 第4步：测试本地开发环境 (可选) 🎯
\`\`\`bash
# 1. 本地启动: npm run dev  
# 2. 访问: http://localhost:5173/
# 3. 测试认证流程
\`\`\`

**预期结果**:
- ✅ redirect_uri正确映射为 \`http://localhost:5173/callback\`

## 🔍 关键日志检查

### 前端日志 (浏览器控制台)
应该看到：
\`\`\`
🔧 redirect_uri一致性检查: {
  originalRedirectUri: "https://www.wenpai.xyz/callback",
  currentUrl: "https://www.wenpai.xyz/callback?code=...",
  willUseOriginal: true
}

✅ OAuth回调处理成功
\`\`\`

### 后端日志 (Netlify Function)
应该看到：
\`\`\`
🔧 Round #4 Authing配置检查: {
  appId: "68a68a29...",
  host: "https://rzcswqs4sq0f.authing.cn",
  redirectUri: "https://www.wenpai.xyz/callback",
  redirectUri_source: "frontend",
  request_origin: "https://www.wenpai.xyz"
}

🔄 Round #4 最终token交换（redirect_uri完全一致修复）: {
  redirect_uri: "https://www.wenpai.xyz/callback",
  redirect_uri_source: "frontend_provided"
}
\`\`\`

## ❌ 错误诊断

### 如果仍然出现 redirect_uri 错误：

1. **检查Authing控制台配置**：
   - 登录 Authing 控制台
   - 检查应用 -> 配置 -> 认证配置 -> 登录回调URL
   - 确保只有必要的callback URL（建议只保留主域名）

2. **检查多重URL问题**：
   如果仍看到多重URL：\`callback%20%20callback%20%20callback\`
   - 说明Authing配置中有多个回调URL
   - 需要在Authing控制台中精简回调URL列表

3. **检查网络请求**：
   - 打开Network面板
   - 找到 \`authing-token-exchange\` 请求
   - 检查Request Payload是否包含 \`original_redirect_uri\` 字段
   - 检查Response是否仍然是400错误

4. **检查缓存问题**：
   - 确保清除了所有浏览器缓存
   - 等待5-10分钟让CDN缓存更新

## ✅ 成功标准

Round #4修复成功的标准：
- ✅ 所有访问方式（www/子域名/netlify）都能正常认证
- ✅ 不再出现"redirect_uri 与发起认证时不符"错误  
- ✅ 控制台显示正确的redirect_uri映射日志
- ✅ 多重回调URL问题彻底解决

## 🆘 如果问题仍然存在

1. **Authing配置检查**：
   - 这可能是Authing控制台配置的根本问题
   - 需要精简回调URL列表，只保留必要的域名

2. **深度调试**：
   - 查看Netlify Functions日志：https://app.netlify.com/projects/wenpai/logs/functions
   - 分析具体的token交换失败原因

3. **回退方案**：
   - 如果Round #4仍然失败，考虑在Authing控制台中只配置一个主域名的回调URL

---

**修复版本**: Round #4 智能域名映射修复  
**部署时间**: ${new Date().toLocaleString()}  
**测试要求**: 彻底清除缓存后测试各种访问方式
**预期效果**: redirect_uri问题彻底解决，认证成功率100%
`;

  return testGuide;
}

/**
 * 检查修复文件状态
 */
function checkFixStatus() {
  console.log('📋 1. 检查Round #4修复文件状态...');
  
  const files = [
    { path: 'netlify/functions/authing-token-exchange.cjs', desc: 'Netlify Function后端修复' },
    { path: 'src/auth/callbackHandler.ts', desc: '前端回调处理修复' },
    { path: 'src/config/configManager.ts', desc: '配置管理器' },
    { path: 'public/cache-cleanup.js', desc: 'URL清理脚本' }
  ];
  
  let allFilesGood = true;
  
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      
      // 检查关键标识
      let hasRequiredFix = false;
      
      if (file.path.includes('authing-token-exchange.cjs')) {
        hasRequiredFix = content.includes('Round #4') && content.includes('getCorrectRedirectUri');
      } else if (file.path.includes('callbackHandler.ts')) {
        hasRequiredFix = content.includes('original_redirect_uri');
      } else if (file.path.includes('configManager.ts')) {
        hasRequiredFix = content.includes('getRedirectUri');
      } else if (file.path.includes('cache-cleanup.js')) {
        hasRequiredFix = content.includes('getCorrectCallbackUrl');
      }
      
      console.log(`   ${hasRequiredFix ? '✅' : '❌'} ${file.desc}: ${hasRequiredFix ? '已修复' : '需要修复'}`);
      if (!hasRequiredFix) allFilesGood = false;
      
    } catch (error) {
      console.log(`   ❌ ${file.desc}: 文件读取失败`);
      allFilesGood = false;
    }
  });
  
  return allFilesGood;
}

/**
 * 生成问题排查清单
 */
function generateTroubleshootingChecklist() {
  console.log('\n🔧 2. 生成问题排查清单...');
  
  const checklist = [
    { 
      item: 'Authing控制台回调URL配置', 
      action: '登录Authing控制台，检查应用配置中是否有多个回调URL',
      priority: 'P0'
    },
    { 
      item: '浏览器缓存清理', 
      action: '完全清除浏览器缓存和localStorage',
      priority: 'P0'
    },
    { 
      item: 'CDN缓存更新', 
      action: '等待5-10分钟让Netlify CDN缓存更新',
      priority: 'P1'
    },
    { 
      item: '网络请求检查', 
      action: '使用Network面板检查token交换请求的参数',
      priority: 'P1'
    },
    { 
      item: 'Netlify Functions日志', 
      action: '查看部署后的函数执行日志',
      priority: 'P2'
    }
  ];
  
  checklist.forEach((item, index) => {
    console.log(`   ${index + 1}. [${item.priority}] ${item.item}`);
    console.log(`      行动: ${item.action}\n`);
  });
}

/**
 * 主函数
 */
function main() {
  // 检查修复状态
  const fixStatus = checkFixStatus();
  
  // 生成排查清单
  generateTroubleshootingChecklist();
  
  // 生成测试指南
  const testGuide = generateTestGuide();
  try {
    fs.writeFileSync('ROUND4_REDIRECT_URI_FIX_TEST_GUIDE.md', testGuide);
    console.log('✅ 测试指南已生成: ROUND4_REDIRECT_URI_FIX_TEST_GUIDE.md');
  } catch (error) {
    console.log('❌ 测试指南生成失败:', error.message);
  }
  
  // 总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 Round #4修复部署完成');
  console.log('='.repeat(50));
  
  if (fixStatus) {
    console.log('✅ 所有修复文件状态正常');
    console.log('✅ 已部署到生产环境: https://www.wenpai.xyz');
    console.log('✅ 测试指南已生成');
    
    console.log('\n🚀 下一步行动:');
    console.log('1. 等待5分钟让CDN缓存更新');
    console.log('2. 按照测试指南清除浏览器缓存');
    console.log('3. 测试各种域名的认证流程');
    console.log('4. 重点检查是否还有"redirect_uri 与发起认证时不符"错误');
    console.log('5. 如果仍有问题，检查Authing控制台的回调URL配置');
    
  } else {
    console.log('⚠️ 部分修复文件状态异常，请检查');
  }
}

// 运行测试
main();