#!/usr/bin/env node

/**
 * API文档自动生成器
 * 📋 P2-1: 补充API文档
 * 
 * 功能：
 * 1. 扫描所有API函数和服务
 * 2. 提取函数签名和注释
 * 3. 分析参数和返回值类型
 * 4. 生成结构化API文档
 * 5. 创建交互式API文档
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置选项
const CONFIG = {
  srcDir: path.join(__dirname, '../src'),
  outputDir: path.join(__dirname, '../docs/api'),
  excludeDirs: ['node_modules', '.git', 'dist', 'build', '__tests__', 'test'],
  targetExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  apiPatterns: {
    functions: /export\s+(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
    methods: /(?:async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*:\s*[^{]*\{/g,
    exports: /export\s+(?:const|let)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g,
    classes: /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    interfaces: /export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
    types: /export\s+type\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g
  }
};

// 分析统计
const stats = {
  filesScanned: 0,
  apisFound: 0,
  functionsDocumented: 0,
  servicesDocumented: 0,
  endpointsDocumented: 0
};

// API 信息收集
const apiCollection = {
  services: [],
  functions: [],
  endpoints: [],
  types: [],
  interfaces: []
};

/**
 * 提取函数注释
 */
function extractComments(content, functionName, startIndex) {
  // 查找函数前的注释
  const lines = content.substring(0, startIndex).split('\n');
  const comments = [];
  
  // 从函数位置向上查找注释
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    
    if (line === '') continue;
    
    if (line.startsWith('*') || line.startsWith('/*') || line.startsWith('*/')) {
      comments.unshift(line.replace(/^\*+\s*/, '').replace(/^\/\*+\s*/, '').replace(/\*+\/$/, ''));
    } else if (line.startsWith('//')) {
      comments.unshift(line.replace(/^\/\/\s*/, ''));
    } else {
      break; // 遇到非注释行，停止
    }
  }
  
  return comments.join('\n').trim();
}

/**
 * 提取函数参数
 */
function extractParameters(functionSignature) {
  const paramMatch = functionSignature.match(/\(([^)]*)\)/);
  if (!paramMatch) return [];
  
  const paramString = paramMatch[1].trim();
  if (!paramString) return [];
  
  // 简单的参数解析
  const params = paramString.split(',').map(param => {
    const cleaned = param.trim();
    const colonIndex = cleaned.indexOf(':');
    
    if (colonIndex > 0) {
      const name = cleaned.substring(0, colonIndex).trim();
      const type = cleaned.substring(colonIndex + 1).trim();
      const optional = name.includes('?');
      
      return {
        name: name.replace('?', ''),
        type: type,
        optional: optional,
        description: ''
      };
    } else {
      return {
        name: cleaned,
        type: 'any',
        optional: false,
        description: ''
      };
    }
  });
  
  return params;
}

/**
 * 提取返回值类型
 */
function extractReturnType(functionSignature) {
  const returnMatch = functionSignature.match(/:\s*([^{]+)/);
  if (returnMatch) {
    return returnMatch[1].trim();
  }
  return 'void';
}

/**
 * 分析单个文件的API
 */
function analyzeFileAPIs(filePath, content) {
  const apis = [];
  const relativePath = path.relative(CONFIG.srcDir, filePath);
  
  // 分析导出函数
  let match;
  const functionPattern = /export\s+(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*:\s*[^{]*|export\s+(async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
  
  while ((match = functionPattern.exec(content)) !== null) {
    const isAsync = !!match[1] || !!match[3];
    const functionName = match[2] || match[4];
    const startIndex = match.index;
    
    // 提取完整的函数签名
    const lineStart = content.lastIndexOf('\n', startIndex);
    const functionStart = content.indexOf(functionName, startIndex);
    const nextBrace = content.indexOf('{', functionStart);
    const functionSignature = content.substring(functionStart, nextBrace).trim();
    
    const comments = extractComments(content, functionName, startIndex);
    const parameters = extractParameters(functionSignature);
    const returnType = extractReturnType(functionSignature);
    
    apis.push({
      type: 'function',
      name: functionName,
      file: relativePath,
      signature: functionSignature,
      isAsync: isAsync,
      parameters: parameters,
      returnType: returnType,
      description: comments,
      category: determineCategory(filePath, functionName)
    });
  }
  
  // 分析导出常量（可能是API端点或配置）
  const exportPattern = /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*([^;]+)/g;
  while ((match = exportPattern.exec(content)) !== null) {
    const constName = match[1];
    const constValue = match[2].trim();
    
    if (constName.includes('API') || constName.includes('ENDPOINT') || constName.includes('URL')) {
      const comments = extractComments(content, constName, match.index);
      
      apis.push({
        type: 'endpoint',
        name: constName,
        file: relativePath,
        value: constValue,
        description: comments,
        category: 'endpoint'
      });
    }
  }
  
  // 分析类
  const classPattern = /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = classPattern.exec(content)) !== null) {
    const className = match[1];
    const comments = extractComments(content, className, match.index);
    
    apis.push({
      type: 'class',
      name: className,
      file: relativePath,
      description: comments,
      category: determineCategory(filePath, className),
      methods: extractClassMethods(content, className)
    });
  }
  
  // 分析接口
  const interfacePattern = /export\s+interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  while ((match = interfacePattern.exec(content)) !== null) {
    const interfaceName = match[1];
    const comments = extractComments(content, interfaceName, match.index);
    
    apis.push({
      type: 'interface',
      name: interfaceName,
      file: relativePath,
      description: comments,
      category: 'type'
    });
  }
  
  return apis;
}

/**
 * 提取类方法
 */
function extractClassMethods(content, className) {
  const methods = [];
  
  // 查找类的开始和结束
  const classStart = content.indexOf(`class ${className}`);
  if (classStart === -1) return methods;
  
  const classOpenBrace = content.indexOf('{', classStart);
  let braceCount = 1;
  let classEnd = classOpenBrace + 1;
  
  // 找到类的结束位置
  while (classEnd < content.length && braceCount > 0) {
    if (content[classEnd] === '{') braceCount++;
    if (content[classEnd] === '}') braceCount--;
    classEnd++;
  }
  
  const classContent = content.substring(classOpenBrace, classEnd - 1);
  
  // 提取方法
  const methodPattern = /(static\s+)?(async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*:\s*[^{]*\{|(static\s+)?(async\s+)?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/g;
  let match;
  
  while ((match = methodPattern.exec(classContent)) !== null) {
    const isStatic = !!(match[1] || match[4]);
    const isAsync = !!(match[2] || match[5]);
    const methodName = match[3] || match[6];
    
    if (methodName && !methodName.startsWith('_') && methodName !== 'constructor') {
      const comments = extractComments(classContent, methodName, match.index);
      
      methods.push({
        name: methodName,
        isStatic: isStatic,
        isAsync: isAsync,
        description: comments
      });
    }
  }
  
  return methods;
}

/**
 * 确定API类别
 */
function determineCategory(filePath, apiName) {
  const path_lower = filePath.toLowerCase();
  const name_lower = apiName.toLowerCase();
  
  if (path_lower.includes('service') || name_lower.includes('service')) {
    return 'service';
  } else if (path_lower.includes('api') || name_lower.includes('api')) {
    return 'api';
  } else if (path_lower.includes('util') || name_lower.includes('util')) {
    return 'utility';
  } else if (path_lower.includes('auth') || name_lower.includes('auth')) {
    return 'auth';
  } else if (path_lower.includes('ai') || name_lower.includes('ai')) {
    return 'ai';
  } else if (path_lower.includes('payment') || name_lower.includes('payment')) {
    return 'payment';
  } else {
    return 'general';
  }
}

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !CONFIG.excludeDirs.includes(item)) {
        results.push(...scanDirectory(fullPath));
      } else if (stat.isFile() && CONFIG.targetExtensions.includes(path.extname(item))) {
        results.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ 扫描目录失败 ${dir}:`, error.message);
  }
  
  return results;
}

/**
 * 生成Markdown文档
 */
function generateMarkdownDocs() {
  // 确保输出目录存在
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  // 按类别分组API
  const groupedAPIs = {
    service: [],
    api: [],
    utility: [],
    auth: [],
    ai: [],
    payment: [],
    general: []
  };
  
  apiCollection.functions.forEach(api => {
    groupedAPIs[api.category].push(api);
  });
  
  apiCollection.services.forEach(api => {
    groupedAPIs[api.category].push(api);
  });
  
  // 生成主文档
  let mainDoc = `# API 文档

> 自动生成于 ${new Date().toLocaleString()}

## 概览

📊 **统计信息**
- 📁 扫描文件: ${stats.filesScanned}
- 🔧 发现API: ${stats.apisFound}
- 📝 已文档化函数: ${stats.functionsDocumented}
- 🏗️ 已文档化服务: ${stats.servicesDocumented}
- 🌐 已文档化端点: ${stats.endpointsDocumented}

## 目录

`;

  // 为每个类别生成文档
  Object.keys(groupedAPIs).forEach(category => {
    const apis = groupedAPIs[category];
    if (apis.length === 0) return;
    
    const categoryName = getCategoryDisplayName(category);
    mainDoc += `- [${categoryName}](#${category.toLowerCase()})\n`;
    
    // 生成类别详细文档
    let categoryDoc = `# ${categoryName}\n\n`;
    
    apis.forEach(api => {
      categoryDoc += generateAPIDocSection(api);
    });
    
    // 保存类别文档
    const categoryFile = path.join(CONFIG.outputDir, `${category}.md`);
    fs.writeFileSync(categoryFile, categoryDoc);
    
    // 添加到主文档
    mainDoc += `\n## ${categoryName}\n\n`;
    apis.slice(0, 5).forEach(api => {
      mainDoc += `### ${api.name}\n\n`;
      mainDoc += `${api.description || '暂无描述'}\n\n`;
      mainDoc += `**文件:** \`${api.file}\`\n\n`;
      
      if (api.parameters && api.parameters.length > 0) {
        mainDoc += `**参数:**\n`;
        api.parameters.forEach(param => {
          mainDoc += `- \`${param.name}\` (\`${param.type}\`)${param.optional ? ' - 可选' : ''}\n`;
        });
        mainDoc += '\n';
      }
      
      if (api.returnType) {
        mainDoc += `**返回值:** \`${api.returnType}\`\n\n`;
      }
    });
    
    if (apis.length > 5) {
      mainDoc += `*查看更多 [${apis.length - 5}] 个API：[${categoryName} 完整文档](${category}.md)*\n\n`;
    }
  });
  
  // 添加使用示例
  mainDoc += generateUsageExamples();
  
  // 保存主文档
  const mainFile = path.join(CONFIG.outputDir, 'README.md');
  fs.writeFileSync(mainFile, mainDoc);
  
  console.log(`📄 API文档已生成到: ${CONFIG.outputDir}`);
}

/**
 * 生成API文档段落
 */
function generateAPIDocSection(api) {
  let doc = `## ${api.name}\n\n`;
  
  doc += `${api.description || '暂无描述'}\n\n`;
  
  doc += `**文件:** \`${api.file}\`\n\n`;
  
  if (api.type === 'function') {
    doc += `**类型:** ${api.isAsync ? '异步' : '同步'}函数\n\n`;
    
    if (api.parameters && api.parameters.length > 0) {
      doc += `### 参数\n\n`;
      api.parameters.forEach(param => {
        doc += `- **\`${param.name}\`** (\`${param.type}\`)${param.optional ? ' - 可选' : ''}\n`;
        if (param.description) {
          doc += `  ${param.description}\n`;
        }
      });
      doc += '\n';
    }
    
    if (api.returnType && api.returnType !== 'void') {
      doc += `### 返回值\n\n`;
      doc += `\`${api.returnType}\`\n\n`;
    }
    
    doc += `### 使用示例\n\n`;
    doc += generateUsageExample(api);
  } else if (api.type === 'class') {
    doc += `**类型:** 类\n\n`;
    
    if (api.methods && api.methods.length > 0) {
      doc += `### 方法\n\n`;
      api.methods.forEach(method => {
        doc += `- **\`${method.name}\`** ${method.isStatic ? '(静态)' : ''} ${method.isAsync ? '(异步)' : ''}\n`;
        if (method.description) {
          doc += `  ${method.description}\n`;
        }
      });
      doc += '\n';
    }
  }
  
  doc += '---\n\n';
  return doc;
}

/**
 * 生成使用示例
 */
function generateUsageExample(api) {
  let example = '```typescript\n';
  
  if (api.type === 'function') {
    const params = api.parameters.map(p => {
      if (p.type.includes('string')) return `'example'`;
      if (p.type.includes('number')) return `123`;
      if (p.type.includes('boolean')) return `true`;
      if (p.type.includes('object') || p.type.includes('{')) return `{}`;
      return `value`;
    }).join(', ');
    
    if (api.isAsync) {
      example += `const result = await ${api.name}(${params});\n`;
    } else {
      example += `const result = ${api.name}(${params});\n`;
    }
  }
  
  example += '```\n\n';
  return example;
}

/**
 * 生成使用示例章节
 */
function generateUsageExamples() {
  return `
## 快速开始

### AI 服务调用示例

\`\`\`typescript
import { callAI } from '@/api/ai';

// 基础AI调用
const result = await callAI({
  prompt: '请帮我生成一篇关于React的文章',
  model: 'gpt-3.5-turbo'
});

console.log(result.text);
\`\`\`

### 用户认证示例

\`\`\`typescript
import { verifyPermission } from '@/services/serverPermissionService';

// 权限验证
const hasPermission = await verifyPermission('ai_generation');
if (hasPermission) {
  // 执行需要权限的操作
}
\`\`\`

### 错误处理示例

\`\`\`typescript
import { logError } from '@/utils/errorHandler';

try {
  await someAsyncOperation();
} catch (error) {
  logError(error, { component: 'MyComponent', action: 'operation' });
}
\`\`\`

## 贡献指南

如果你发现API文档有误或需要补充，请：

1. 在代码中添加JSDoc注释
2. 运行 \`npm run docs:generate\` 重新生成文档
3. 提交PR

## 更新日志

查看 [CHANGELOG.md](../CHANGELOG.md) 了解API变更历史。
`;
}

/**
 * 获取类别显示名称
 */
function getCategoryDisplayName(category) {
  const displayNames = {
    service: '🏗️ 服务层',
    api: '🌐 API接口',
    utility: '🔧 工具函数',
    auth: '🔒 认证授权',
    ai: '🤖 AI服务',
    payment: '💰 支付服务',
    general: '📦 通用功能'
  };
  
  return displayNames[category] || category;
}

/**
 * 生成分析报告
 */
function generateReport() {
  const report = `
📋 API文档生成报告
==================================================
📁 扫描文件数: ${stats.filesScanned}
🔧 发现API数: ${stats.apisFound}
📝 函数文档化: ${stats.functionsDocumented}
🏗️ 服务文档化: ${stats.servicesDocumented}
🌐 端点文档化: ${stats.endpointsDocumented}

📊 API分布
--------------------------------------------------
`;

  // 统计各类别的API数量
  const categoryCounts = {};
  [...apiCollection.functions, ...apiCollection.services].forEach(api => {
    categoryCounts[api.category] = (categoryCounts[api.category] || 0) + 1;
  });

  Object.keys(categoryCounts).forEach(category => {
    const displayName = getCategoryDisplayName(category);
    // report += `${displayName}: ${categoryCounts[category]}\n`;
  });

  report += `
📄 生成的文档文件
--------------------------------------------------
- docs/api/README.md - 主文档
`;

  Object.keys(categoryCounts).forEach(category => {
    report += `- docs/api/${category}.md - ${getCategoryDisplayName(category)}\n`;
  });

  report += `
🎯 后续建议
--------------------------------------------------
✅ 已生成基础API文档结构
📝 建议为关键API添加更详细的JSDoc注释
🔄 建议设置自动文档更新流程
📚 建议添加更多使用示例和最佳实践
==================================================
`;

  console.log(report);
  
  // 保存报告到文件
  const reportPath = path.join(__dirname, 'api-docs-generation-report.txt');
  fs.writeFileSync(reportPath, report);
  console.log(`📄 报告已保存到: ${reportPath}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始生成API文档...\n');
  
  // 1. 扫描所有文件
  console.log('🔍 扫描源代码文件...');
  const files = scanDirectory(CONFIG.srcDir);
  stats.filesScanned = files.length;
  console.log(`📁 找到 ${files.length} 个文件\n`);
  
  // 2. 分析每个文件的API
  console.log('📊 分析API定义...');
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const apis = analyzeFileAPIs(file, content);
      
      apis.forEach(api => {
        if (api.type === 'function') {
          apiCollection.functions.push(api);
          stats.functionsDocumented++;
        } else if (api.type === 'class') {
          apiCollection.services.push(api);
          stats.servicesDocumented++;
        } else if (api.type === 'endpoint') {
          apiCollection.endpoints.push(api);
          stats.endpointsDocumented++;
        } else if (api.type === 'interface') {
          apiCollection.interfaces.push(api);
        }
        
        stats.apisFound++;
      });
    } catch (error) {
      console.warn(`⚠️ 分析文件失败 ${file}:`, error.message);
    }
  });
  
  console.log(`🔍 分析完成，发现 ${stats.apisFound} 个API\n`);
  
  // 3. 生成文档
  console.log('📝 生成API文档...');
  generateMarkdownDocs();
  
  // 4. 生成报告
  generateReport();
  
  // 5. 总结
  console.log('\n🎉 API文档生成完成！');
  console.log(`📚 文档位置: ${CONFIG.outputDir}`);
  console.log('💡 建议查看生成的文档并添加更详细的描述');
}

// 运行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});