#!/usr/bin/env node

/**
 * 修复错误放置的import语句
 */

const fs = require('fs');
const path = require('path');

// 需要处理的文件扩展名
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// 错误放置的import文件列表
const PROBLEMATIC_FILES = [
  'src/config/configManager.ts',
  'src/features/titleGeneration/hooks/useTitleGeneration.ts',
  'src/features/titleGeneration/services/TitleGenerationService.ts',
  'src/features/titleGeneration/services/AIService.ts',
  'src/utils/productionEnvChecker.ts',
  'src/utils/errorHandler.ts',
  'src/utils/env-validator.ts',
  'src/utils/configValidator.ts',
  'src/utils/tooltipSafetyWrapper.ts',
  'src/components/ui/dev-tools.tsx',
  'src/components/hot-topics/HotTopicsRadar.tsx',
  'src/components/creative/CreativeCube.tsx',
  'src/components/creative/PDFChatDialog.tsx',
  'src/ai/providers/deepseek.ts',
  'src/ai/providers/openai.ts',
  'src/ai/prompts/brand.ts',
  'src/hooks/usePermission.ts',
  'src/hooks/useUserDataIsolationInit.ts',
  'src/api/providers/deepseek.ts',
  'src/api/providers/openai.ts',
  'src/api/creemClientService.ts',
  'src/api/request.ts',
  'src/api/unifiedAIService.ts',
  'src/api/ai.ts',
  'src/api/topicSubscriptionService.ts',
  'src/pages/BrandLibraryPage.tsx',
  'src/pages/ProfilePage.tsx',
  'src/pages/AdaptPage.tsx',
  'src/services/supabaseDataService.ts',
  'src/services/aiAnalysisService.ts',
  'src/services/brandCorpusService.ts',
  'src/services/paymentStatusService.ts'
];

/**
 * 检查文件是否已经在顶部有logger导入
 */
function hasLoggerImportAtTop(content) {
  const lines = content.split('\n');
  for (let i = 0; i < Math.min(50, lines.length); i++) {
    const line = lines[i].trim();
    if (line.includes('import') && line.includes('logger') && line.includes('@/utils/logger')) {
      return true;
    }
    // 如果遇到非import/注释行，停止搜索
    if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('import') && !line.startsWith('export')) {
      break;
    }
  }
  return false;
}

/**
 * 添加logger导入到文件顶部
 */
function addLoggerImportAtTop(content) {
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // 找到最后一个import语句的位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('import ') && !line.includes('logger')) {
      insertIndex = i + 1;
    } else if (line && !line.startsWith('//') && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('import') && !line.startsWith('export')) {
      break;
    }
  }
  
  // 插入logger导入
  lines.splice(insertIndex, 0, "import { logger } from '@/utils/logger';");
  return lines.join('\n');
}

/**
 * 处理单个文件
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // 移除所有错误放置的logger导入
    const wrongImportPattern = /^(?!import\s).*import\s*{\s*logger\s*}\s*from\s*['"]@\/utils\/logger['"];?\s*$/gm;
    const cleanContent = content.replace(wrongImportPattern, '');
    
    if (cleanContent !== content) {
      content = cleanContent;
      hasChanges = true;
      console.log(`🧹 清理错误导入: ${path.relative(process.cwd(), filePath)}`);
    }
    
    // 检查是否需要在顶部添加logger导入
    if (!hasLoggerImportAtTop(content) && content.includes('logger.')) {
      content = addLoggerImportAtTop(content);
      hasChanges = true;
      console.log(`➕ 添加顶部导入: ${path.relative(process.cwd(), filePath)}`);
    }
    
    // 写回文件
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`处理文件失败: ${filePath} - ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔧 开始修复错误放置的import语句...\n');
  
  let processedCount = 0;
  
  PROBLEMATIC_FILES.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      if (processFile(filePath)) {
        processedCount++;
      }
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
    }
  });
  
  console.log(`\n📊 处理结果:`);
  console.log(`✅ 修复文件: ${processedCount} 个`);
  console.log('\n🎉 修复完成！');
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main };
