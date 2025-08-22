/**
 * 🚨 终极方案：如果前端传递的redirect_uri修复仍然不生效
 * 这个脚本将直接在Netlify Function中硬编码正确的redirect_uri
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 准备执行终极修复方案...');

const functionPath = path.join(__dirname, 'netlify/functions/authing-token-exchange.cjs');

// 读取当前文件内容
let content = fs.readFileSync(functionPath, 'utf8');

// 替换动态redirect_uri逻辑为硬编码
const hardcodedFix = `    // 🚨 终极修复：硬编码正确的redirect_uri
    let redirectUri = 'https://www.wenpai.xyz/callback'; // 强制使用正确值
    
    // 优先使用前端传递的redirect_uri（如果有的话）
    const body = event.body ? JSON.parse(event.body) : {};
    const originalRedirectUri = body.original_redirect_uri;
    
    if (originalRedirectUri) {
      redirectUri = originalRedirectUri;
      console.log('✅ 使用前端传递的redirect_uri:', redirectUri);
    } else {
      console.log('⚠️ 使用硬编码的redirect_uri:', redirectUri);
    }`;

// 查找并替换redirect_uri构建逻辑
const startMarker = '// 🔧 OAuth2关键修复：优先使用前端传递的redirect_uri确保一致性';
const endMarker = 'redirectUri = dynamicRedirectUri;';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + 
                    hardcodedFix + 
                    content.substring(endIndex);
  
  // 备份原文件
  fs.writeFileSync(functionPath + '.backup', content);
  
  // 写入修复后的内容
  fs.writeFileSync(functionPath, newContent);
  
  console.log('✅ 终极修复已应用');
  console.log('📁 原文件已备份为: authing-token-exchange.cjs.backup');
  console.log('');
  console.log('🚀 现在请运行以下命令部署：');
  console.log('git add -A');
  console.log('git commit -m "🚨 终极修复：硬编码redirect_uri"');
  console.log('netlify deploy --prod');
} else {
  console.log('❌ 未能找到目标代码段，请手动修复');
}