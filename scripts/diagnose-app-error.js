#!/usr/bin/env node

/**
 * 🔍 应用错误诊断脚本
 * 分析应用中可能导致错误边界触发的问题
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 开始诊断应用错误...\n');

const projectRoot = process.cwd();
let diagnosis = {
  potentialIssues: [],
  recommendations: [],
  score: 0
};

/**
 * 检查常见的错误模式
 */
function checkCommonErrorPatterns() {
  console.log('🔍 检查常见错误模式...');
  
  const filesToCheck = [
    'src/main.tsx',
    'src/App.tsx',
    'src/components/creative/QuickReference/QuickReferenceDialog.tsx',
    'src/features/content-adapter/components/EnhancedHistoryDialog.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查可能导致错误的模式
      const errorPatterns = [
        {
          pattern: /throw\s+(?!new\s+Error)/g,
          issue: '非标准错误抛出',
          description: '抛出了非Error对象，可能导致错误边界显示"Object"'
        },
        {
          pattern: /Promise\.reject\([^)]*[^E][^r][^r][^o][^r][^(]/g,
          issue: 'Promise reject非Error对象',
          description: 'Promise.reject使用了非Error对象'
        },
        {
          pattern: /console\.error\([^)]*Object[^)]*\)/g,
          issue: '控制台输出Object',
          description: '直接输出Object到控制台'
        },
        {
          pattern: /useEffect\([^}]*\[[^\]]*\]\s*\)\s*;?\s*$/gm,
          issue: 'useEffect依赖问题',
          description: 'useEffect可能有依赖数组问题'
        }
      ];
      
      errorPatterns.forEach(({ pattern, issue, description }) => {
        const matches = content.match(pattern);
        if (matches) {
          diagnosis.potentialIssues.push({
            file: path.basename(filePath),
            issue,
            description,
            matches: matches.length,
            examples: matches.slice(0, 2)
          });
        }
      });
    }
  });
}

/**
 * 检查错误边界配置
 */
function checkErrorBoundaryConfig() {
  console.log('🔍 检查错误边界配置...');
  
  const appPath = path.join(projectRoot, 'src/App.tsx');
  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');
    
    // 检查错误处理改进
    if (content.includes('errorObject: error')) {
      diagnosis.score += 10;
      console.log('✅ 错误处理已改进');
    } else {
      diagnosis.potentialIssues.push({
        file: 'App.tsx',
        issue: '错误处理需要改进',
        description: '错误边界的错误处理可能不够详细'
      });
    }
    
    // 检查是否有多个错误边界
    const errorBoundaryCount = (content.match(/EnhancedErrorBoundary/g) || []).length;
    if (errorBoundaryCount > 1) {
      diagnosis.potentialIssues.push({
        file: 'App.tsx',
        issue: '多个错误边界',
        description: '可能存在嵌套的错误边界导致错误处理混乱'
      });
    }
  }
}

/**
 * 检查认证相关错误
 */
function checkAuthErrors() {
  console.log('🔍 检查认证相关错误...');
  
  const authFiles = [
    'src/services/authService.ts',
    'src/utils/authTokenHandler.ts',
    'src/providers/UnifiedAuthProvider.tsx'
  ];
  
  authFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查CORS相关错误处理
      if (content.includes('CORS') || content.includes('cors')) {
        diagnosis.potentialIssues.push({
          file: path.basename(filePath),
          issue: 'CORS错误处理',
          description: '可能存在CORS错误导致应用级错误'
        });
      }
      
      // 检查网络错误处理
      if (content.includes('Network Error') || content.includes('network error')) {
        diagnosis.potentialIssues.push({
          file: path.basename(filePath),
          issue: '网络错误处理',
          description: '网络错误可能没有被正确捕获'
        });
      }
    }
  });
}

/**
 * 检查Dialog组件错误
 */
function checkDialogErrors() {
  console.log('🔍 检查Dialog组件错误...');
  
  const dialogFiles = [
    'src/components/creative/QuickReference/QuickReferenceDialog.tsx',
    'src/features/content-adapter/components/EnhancedHistoryDialog.tsx'
  ];
  
  dialogFiles.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // 检查修复器是否可能导致错误
      if (content.includes('fixDialogPosition')) {
        diagnosis.score += 5;
        console.log(`✅ ${path.basename(filePath)}: Dialog修复器已实现`);
        
        // 检查是否有错误处理
        if (!content.includes('try') && !content.includes('catch')) {
          diagnosis.potentialIssues.push({
            file: path.basename(filePath),
            issue: 'Dialog修复器缺少错误处理',
            description: 'fixDialogPosition函数可能需要try-catch包装'
          });
        }
      }
    }
  });
}

/**
 * 生成建议
 */
function generateRecommendations() {
  console.log('🔍 生成修复建议...');
  
  if (diagnosis.potentialIssues.length === 0) {
    diagnosis.recommendations.push('✅ 未发现明显的错误模式');
    diagnosis.score += 20;
  } else {
    // 基于发现的问题生成建议
    diagnosis.potentialIssues.forEach(issue => {
      switch (issue.issue) {
        case '非标准错误抛出':
          diagnosis.recommendations.push('🔧 将所有throw语句改为抛出Error对象');
          break;
        case 'Dialog修复器缺少错误处理':
          diagnosis.recommendations.push('🔧 为Dialog修复器添加try-catch错误处理');
          break;
        case 'CORS错误处理':
          diagnosis.recommendations.push('🔧 改进CORS错误的捕获和处理');
          break;
        case '网络错误处理':
          diagnosis.recommendations.push('🔧 确保网络错误被正确捕获而不是抛出到应用级');
          break;
      }
    });
  }
  
  // 通用建议
  diagnosis.recommendations.push('💡 在浏览器开发者工具中查看详细错误信息');
  diagnosis.recommendations.push('💡 检查Network标签页是否有失败的请求');
  diagnosis.recommendations.push('💡 确认Dialog功能是否仍然正常工作');
}

/**
 * 生成诊断报告
 */
function generateReport() {
  console.log('\n📊 应用错误诊断报告');
  console.log('==================================================');
  console.log(`🎯 诊断评分: ${diagnosis.score}/50`);
  console.log(`🔍 发现问题: ${diagnosis.potentialIssues.length}个`);
  console.log('==================================================\n');
  
  if (diagnosis.potentialIssues.length > 0) {
    console.log('⚠️ 发现的潜在问题:');
    diagnosis.potentialIssues.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.issue} (${issue.file})`);
      console.log(`   📝 ${issue.description}`);
      if (issue.examples) {
        console.log(`   🔍 示例: ${issue.examples[0]}`);
      }
    });
    console.log('');
  }
  
  if (diagnosis.recommendations.length > 0) {
    console.log('💡 修复建议:');
    diagnosis.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });
    console.log('');
  }
  
  // 诊断结论
  if (diagnosis.score >= 40) {
    console.log('🎉 诊断结果: 优秀 - 应用状态良好');
    console.log('💡 建议: 错误可能是临时的或外部因素导致');
  } else if (diagnosis.score >= 25) {
    console.log('⚠️ 诊断结果: 良好 - 存在一些潜在问题');
    console.log('💡 建议: 修复发现的问题以提高稳定性');
  } else {
    console.log('🚨 诊断结果: 需要关注 - 发现多个问题');
    console.log('💡 建议: 优先修复关键问题');
  }
  
  console.log('\n🎯 下一步操作:');
  console.log('1. 在浏览器中打开开发者工具');
  console.log('2. 查看Console标签页的详细错误信息');
  console.log('3. 测试Dialog弹窗功能是否正常');
  console.log('4. 根据建议修复发现的问题');
}

// 执行诊断
checkCommonErrorPatterns();
checkErrorBoundaryConfig();
checkAuthErrors();
checkDialogErrors();
generateRecommendations();
generateReport();
