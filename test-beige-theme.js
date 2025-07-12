#!/usr/bin/env node

/**
 * 护眼米色主题配置测试脚本
 * 验证主题配置是否正确
 */

import fs from 'fs';
import path from 'path';

console.log('🎨 护眼米色主题配置测试\n');

// 测试文件列表
const testFiles = [
  'src/index.css',
  'src/hooks/useTheme.ts',
  'tailwind.config.js',
  'test-beige-theme.html'
];

// 检查文件是否存在
console.log('📁 检查文件完整性...');
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
  }
});

// 检查CSS变量配置
console.log('\n🎨 检查CSS变量配置...');
try {
  const cssContent = fs.readFileSync('src/index.css', 'utf8');
  
  // 检查默认主题配置
  if (cssContent.includes('--background: 45 25% 97%')) {
    console.log('✅ 默认主题已设置为护眼米色');
  } else {
    console.log('❌ 默认主题未设置为护眼米色');
  }
  
  // 检查米色主题配置
  if (cssContent.includes('[data-theme="beige"]')) {
    console.log('✅ 米色主题CSS变量已配置');
  } else {
    console.log('❌ 米色主题CSS变量未配置');
  }
  
  // 检查主题变量完整性
  const requiredVars = [
    '--background', '--foreground', '--primary', '--secondary',
    '--muted', '--accent', '--border', '--input', '--ring'
  ];
  
  const missingVars = requiredVars.filter(varName => 
    !cssContent.includes(`${varName}: 45`)
  );
  
  if (missingVars.length === 0) {
    console.log('✅ 所有必需的CSS变量已配置');
  } else {
    console.log(`❌ 缺失CSS变量: ${missingVars.join(', ')}`);
  }
  
} catch (error) {
  console.log('❌ 无法读取CSS文件:', error.message);
}

// 检查TypeScript配置
console.log('\n🔧 检查TypeScript配置...');
try {
  const tsContent = fs.readFileSync('src/hooks/useTheme.ts', 'utf8');
  
  // 检查主题类型
  if (tsContent.includes("'beige'")) {
    console.log('✅ 米色主题已添加到类型定义');
  } else {
    console.log('❌ 米色主题未添加到类型定义');
  }
  
  // 检查默认主题
  if (tsContent.includes("return saved || 'beige'")) {
    console.log('✅ 默认主题已设置为米色');
  } else {
    console.log('❌ 默认主题未设置为米色');
  }
  
  // 检查主题名称
  if (tsContent.includes("beige: '护眼米色'")) {
    console.log('✅ 米色主题名称已配置');
  } else {
    console.log('❌ 米色主题名称未配置');
  }
  
} catch (error) {
  console.log('❌ 无法读取TypeScript文件:', error.message);
}

// 检查Tailwind配置
console.log('\n🎯 检查Tailwind配置...');
try {
  const tailwindContent = fs.readFileSync('tailwind.config.js', 'utf8');
  
  if (tailwindContent.includes('beige: {')) {
    console.log('✅ 米色主题颜色已添加到Tailwind配置');
  } else {
    console.log('❌ 米色主题颜色未添加到Tailwind配置');
  }
  
  // 检查颜色配置完整性
  const colorLevels = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  const missingLevels = colorLevels.filter(level => 
    !tailwindContent.includes(`'${level}': 'hsl(45`)
  );
  
  if (missingLevels.length === 0) {
    console.log('✅ 所有米色主题颜色级别已配置');
  } else {
    console.log(`❌ 缺失颜色级别: ${missingLevels.join(', ')}`);
  }
  
} catch (error) {
  console.log('❌ 无法读取Tailwind配置文件:', error.message);
}

// 检查测试页面
console.log('\n🧪 检查测试页面...');
try {
  const testContent = fs.readFileSync('test-beige-theme.html', 'utf8');
  
  if (testContent.includes('护眼米色主题')) {
    console.log('✅ 测试页面标题正确');
  } else {
    console.log('❌ 测试页面标题不正确');
  }
  
  if (testContent.includes('data-theme="beige"')) {
    console.log('✅ 测试页面主题属性正确');
  } else {
    console.log('❌ 测试页面主题属性不正确');
  }
  
  if (testContent.includes('--background: 45 25% 97%')) {
    console.log('✅ 测试页面CSS变量正确');
  } else {
    console.log('❌ 测试页面CSS变量不正确');
  }
  
} catch (error) {
  console.log('❌ 无法读取测试页面:', error.message);
}

// 检查package.json中的脚本
console.log('\n📦 检查package.json...');
try {
  const packageContent = fs.readFileSync('package.json', 'utf8');
  const packageJson = JSON.parse(packageContent);
  
  if (packageJson.scripts && packageJson.scripts.dev) {
    console.log('✅ 开发脚本已配置');
  } else {
    console.log('❌ 开发脚本未配置');
  }
  
  console.log(`📋 项目名称: ${packageJson.name || '未设置'}`);
  console.log(`📋 项目版本: ${packageJson.version || '未设置'}`);
  
} catch (error) {
  console.log('❌ 无法读取package.json:', error.message);
}

// 总结
console.log('\n📊 测试总结');
console.log('='.repeat(50));

const summary = {
  files: testFiles.filter(file => fs.existsSync(file)).length,
  totalFiles: testFiles.length,
  cssConfigured: fs.existsSync('src/index.css') && fs.readFileSync('src/index.css', 'utf8').includes('[data-theme="beige"]'),
  tsConfigured: fs.existsSync('src/hooks/useTheme.ts') && fs.readFileSync('src/hooks/useTheme.ts', 'utf8').includes("'beige'"),
  tailwindConfigured: fs.existsSync('tailwind.config.js') && fs.readFileSync('tailwind.config.js', 'utf8').includes('beige: {'),
  testPageExists: fs.existsSync('test-beige-theme.html')
};

console.log(`📁 文件完整性: ${summary.files}/${summary.totalFiles}`);
console.log(`🎨 CSS配置: ${summary.cssConfigured ? '✅' : '❌'}`);
console.log(`🔧 TypeScript配置: ${summary.tsConfigured ? '✅' : '❌'}`);
console.log(`🎯 Tailwind配置: ${summary.tailwindConfigured ? '✅' : '❌'}`);
console.log(`🧪 测试页面: ${summary.testPageExists ? '✅' : '❌'}`);

if (summary.files === summary.totalFiles && 
    summary.cssConfigured && 
    summary.tsConfigured && 
    summary.tailwindConfigured && 
    summary.testPageExists) {
  console.log('\n🎉 护眼米色主题配置测试通过！');
  console.log('💡 建议: 访问 http://localhost:3000 查看效果');
  console.log('💡 建议: 访问 test-beige-theme.html 查看测试页面');
} else {
  console.log('\n⚠️  护眼米色主题配置测试未完全通过');
  console.log('💡 请检查上述错误并修复');
}

console.log('\n' + '='.repeat(50)); 