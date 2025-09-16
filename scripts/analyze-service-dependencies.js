#!/usr/bin/env node

/**
 * 服务层依赖分析脚本
 * 🔧 P1-1: 分析服务层架构，检测循环依赖和耦合问题
 * 
 * 分析内容：
 * 1. 服务间的导入依赖关系
 * 2. 检测循环依赖
 * 3. 分析耦合度和复杂度
 * 4. 生成重构建议
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const servicesDir = path.join(projectRoot, 'src/services');

console.log('🔧 开始分析服务层架构...\n');

const analysis = {
  files: [],
  dependencies: new Map(),
  circularDeps: [],
  complexityStats: {
    totalFiles: 0,
    avgDependencies: 0,
    maxDependencies: 0,
    highCouplingFiles: []
  },
  categories: new Map()
};

// 服务分类定义
const serviceCategories = {
  'auth': ['auth', 'login', 'token', 'permission', 'user'],
  'data': ['data', 'database', 'migration', 'sync', 'storage'],
  'payment': ['payment', 'order', 'subscription', 'upgrade'],
  'content': ['content', 'brand', 'emoji', 'template', 'md2'],
  'api': ['api', 'service', 'client', 'http'],
  'utils': ['util', 'helper', 'normalizer', 'extractor'],
  'monitoring': ['monitor', 'performance', 'log', 'notification'],
  'security': ['security', 'encryption', 'secure']
};

// 解析import语句
async function parseImports(content, fileName) {
  const imports = [];
  const importRegex = /import\s+(?:[^'"]*from\s+)?['"]([^'"]+)['"];?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // 只关注项目内的相对导入
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      let resolvedPath = path.resolve(path.dirname(fileName), importPath);
      
      // 处理没有扩展名的导入
      if (!path.extname(resolvedPath)) {
        if (await fileExists(resolvedPath + '.ts')) {
          resolvedPath += '.ts';
        } else if (await fileExists(resolvedPath + '.tsx')) {
          resolvedPath += '.tsx';
        } else if (await fileExists(path.join(resolvedPath, 'index.ts'))) {
          resolvedPath = path.join(resolvedPath, 'index.ts');
        }
      }
      
      imports.push({
        path: importPath,
        resolved: resolvedPath,
        isServiceImport: resolvedPath.includes('/services/')
      });
    }
  }
  
  return imports;
}

// 检查文件是否存在
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// 分类服务文件
function categorizeService(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName)).toLowerCase();
  
  for (const [category, keywords] of Object.entries(serviceCategories)) {
    if (keywords.some(keyword => baseName.includes(keyword))) {
      return category;
    }
  }
  
  return 'other';
}

// 检测循环依赖
function detectCircularDependencies() {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];

  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      // 找到循环依赖
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      cycles.push(cycle);
      return;
    }

    if (visited.has(node)) {
      return;
    }

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = analysis.dependencies.get(node) || [];
    for (const dep of deps) {
      if (analysis.dependencies.has(dep.resolved)) {
        dfs(dep.resolved, [...path]);
      }
    }

    recursionStack.delete(node);
    path.pop();
  }

  for (const node of analysis.dependencies.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }

  return cycles;
}

// 计算复杂度统计
function calculateComplexityStats() {
  const dependencyCounts = [];
  
  for (const [file, deps] of analysis.dependencies) {
    const serviceOnlyDeps = deps.filter(dep => dep.isServiceImport);
    dependencyCounts.push(serviceOnlyDeps.length);
    
    // 标记高耦合文件（超过5个服务依赖）
    if (serviceOnlyDeps.length > 5) {
      analysis.complexityStats.highCouplingFiles.push({
        file: path.relative(servicesDir, file),
        dependencies: serviceOnlyDeps.length,
        deps: serviceOnlyDeps.map(dep => path.relative(servicesDir, dep.resolved))
      });
    }
  }
  
  analysis.complexityStats.totalFiles = dependencyCounts.length;
  analysis.complexityStats.avgDependencies = dependencyCounts.length > 0 
    ? Math.round(dependencyCounts.reduce((a, b) => a + b, 0) / dependencyCounts.length * 100) / 100
    : 0;
  analysis.complexityStats.maxDependencies = Math.max(...dependencyCounts, 0);
}

// 生成重构建议
function generateRefactoringRecommendations() {
  const recommendations = [];
  
  // 1. 循环依赖建议
  if (analysis.circularDeps.length > 0) {
    recommendations.push({
      type: 'CRITICAL',
      title: '解决循环依赖',
      description: `发现${analysis.circularDeps.length}个循环依赖，需要立即重构`,
      actions: [
        '使用依赖注入模式',
        '引入接口抽象层',
        '拆分共享逻辑到独立模块',
        '考虑使用事件驱动架构'
      ]
    });
  }
  
  // 2. 高耦合建议
  if (analysis.complexityStats.highCouplingFiles.length > 0) {
    recommendations.push({
      type: 'HIGH',
      title: '降低服务耦合度',
      description: `${analysis.complexityStats.highCouplingFiles.length}个服务文件耦合度过高`,
      actions: [
        '应用单一职责原则拆分服务',
        '使用门面模式简化接口',
        '引入中介者模式协调服务',
        '考虑微服务架构'
      ]
    });
  }
  
  // 3. 架构组织建议
  const categoryStats = Array.from(analysis.categories.entries())
    .map(([cat, files]) => ({ category: cat, count: files.length }))
    .sort((a, b) => b.count - a.count);
    
  if (categoryStats.find(s => s.category === 'other' && s.count > 5)) {
    recommendations.push({
      type: 'MEDIUM',
      title: '改进服务分类和组织',
      description: '存在较多未分类的服务文件',
      actions: [
        '建立清晰的服务分层架构',
        '按业务域重新组织服务目录',
        '制定服务命名规范',
        '建立服务职责边界'
      ]
    });
  }
  
  // 4. 依赖管理建议
  if (analysis.complexityStats.avgDependencies > 3) {
    recommendations.push({
      type: 'MEDIUM',
      title: '优化依赖管理',
      description: `平均服务依赖数量${analysis.complexityStats.avgDependencies}较高`,
      actions: [
        '引入依赖注入容器',
        '使用工厂模式管理依赖',
        '建立服务注册中心',
        '实现延迟加载机制'
      ]
    });
  }
  
  return recommendations;
}

// 主分析函数
async function analyzeServices() {
  try {
    // 1. 扫描所有服务文件
    const serviceFiles = await fs.readdir(servicesDir);
    const tsFiles = serviceFiles.filter(file => file.endsWith('.ts') && !file.includes('.test.'));
    
    console.log(`📁 发现${tsFiles.length}个服务文件`);
    
    // 2. 分析每个文件的依赖
    for (const file of tsFiles) {
      const filePath = path.join(servicesDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      const imports = await parseImports(content, filePath);
      
      analysis.files.push(filePath);
      analysis.dependencies.set(filePath, imports);
      
      // 分类服务
      const category = categorizeService(file);
      if (!analysis.categories.has(category)) {
        analysis.categories.set(category, []);
      }
      analysis.categories.get(category).push(file);
    }
    
    // 3. 检测循环依赖
    console.log('🔍 检测循环依赖...');
    analysis.circularDeps = detectCircularDependencies();
    
    // 4. 计算复杂度统计
    console.log('📊 计算复杂度统计...');
    calculateComplexityStats();
    
    // 5. 生成重构建议
    console.log('💡 生成重构建议...');
    const recommendations = generateRefactoringRecommendations();
    
    // 6. 输出分析报告
    printAnalysisReport(recommendations);
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
    process.exit(1);
  }
}

// 打印分析报告
function printAnalysisReport(recommendations) {
  console.log('\n🔧 服务层架构分析报告');
  console.log('='.repeat(60));
  
  // 基础统计
  console.log(`\n📊 基础统计:`);
  console.log(`📁 总服务文件数: ${analysis.complexityStats.totalFiles}`);
  console.log(`🔗 平均依赖数: ${analysis.complexityStats.avgDependencies}`);
  console.log(`📈 最大依赖数: ${analysis.complexityStats.maxDependencies}`);
  console.log(`⚠️  高耦合文件数: ${analysis.complexityStats.highCouplingFiles.length}`);
  
  // 服务分类统计
  console.log(`\n📂 服务分类统计:`);
  const sortedCategories = Array.from(analysis.categories.entries())
    .sort((a, b) => b[1].length - a[1].length);
    
  sortedCategories.forEach(([category, files]) => {
    console.log(`  ${category}: ${files.length}个文件`);
    if (files.length <= 3) {
      console.log(`    ${files.map(f => path.basename(f, '.ts')).join(', ')}`);
    }
  });
  
  // 循环依赖
  if (analysis.circularDeps.length > 0) {
    console.log(`\n🔄 发现的循环依赖 (${analysis.circularDeps.length}个):`);
    analysis.circularDeps.forEach((cycle, index) => {
      console.log(`  ${index + 1}. ${cycle.map(f => path.basename(f, '.ts')).join(' → ')}`);
    });
  } else {
    console.log(`\n✅ 未发现循环依赖`);
  }
  
  // 高耦合文件
  if (analysis.complexityStats.highCouplingFiles.length > 0) {
    console.log(`\n⚠️  高耦合文件:`);
    analysis.complexityStats.highCouplingFiles.forEach(file => {
      console.log(`  📄 ${file.file} (${file.dependencies}个依赖)`);
      console.log(`     依赖: ${file.deps.slice(0, 3).join(', ')}${file.deps.length > 3 ? '...' : ''}`);
    });
  }
  
  // 重构建议
  if (recommendations.length > 0) {
    console.log(`\n💡 重构建议:`);
    recommendations.forEach((rec, index) => {
      const emoji = rec.type === 'CRITICAL' ? '🚨' : rec.type === 'HIGH' ? '⚠️' : '💡';
      console.log(`\n  ${index + 1}. ${emoji} ${rec.title} [${rec.type}]`);
      console.log(`     ${rec.description}`);
      console.log(`     建议措施:`);
      rec.actions.forEach(action => {
        console.log(`       • ${action}`);
      });
    });
  } else {
    console.log(`\n✅ 当前架构状况良好，无紧急重构需求`);
  }
  
  // 总体评估
  console.log(`\n🎯 总体评估:`);
  let score = 100;
  
  if (analysis.circularDeps.length > 0) {
    score -= analysis.circularDeps.length * 20;
    console.log(`❌ 循环依赖问题: -${analysis.circularDeps.length * 20}分`);
  }
  
  if (analysis.complexityStats.highCouplingFiles.length > 0) {
    score -= analysis.complexityStats.highCouplingFiles.length * 10;
    console.log(`⚠️  高耦合问题: -${analysis.complexityStats.highCouplingFiles.length * 10}分`);
  }
  
  if (analysis.complexityStats.avgDependencies > 3) {
    score -= Math.round((analysis.complexityStats.avgDependencies - 3) * 5);
    console.log(`📊 平均依赖过高: -${Math.round((analysis.complexityStats.avgDependencies - 3) * 5)}分`);
  }
  
  score = Math.max(0, score);
  
  console.log(`\n🏆 架构健康度评分: ${score}/100`);
  
  if (score >= 80) {
    console.log('✅ 架构状况良好，建议进行优化改进');
  } else if (score >= 60) {
    console.log('⚠️  架构存在一些问题，建议及时重构');
  } else {
    console.log('🚨 架构问题严重，需要立即重构');
  }
}


// 启动分析
analyzeServices();