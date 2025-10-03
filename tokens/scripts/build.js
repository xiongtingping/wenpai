#!/usr/bin/env node

/**
 * Design Token 构建脚本 v2.0
 * 将 tokens.json 转换为各种格式的配置文件
 * - 支持所有新增的 token 类型
 * - 完整的深色/浅色主题支持
 * - 层级化的 token 引用解析
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取设计令牌
const tokensPath = path.join(__dirname, '../tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

/**
 * 解析令牌引用 (如 {spacing.scale.1})
 */
function resolveTokenReference(value, tokens) {
  if (typeof value !== 'string' || !value.startsWith('{') || !value.endsWith('}')) {
    return value;
  }

  const path = value.slice(1, -1).split('.');
  let current = tokens;

  for (const segment of path) {
    if (current && current[segment]) {
      current = current[segment];
    } else {
      console.warn(`无法解析令牌引用: ${value}`);
      return value;
    }
  }

  return current.value || current;
}

/**
 * 递归解析所有令牌引用
 */
function resolveAllReferences(obj, tokens) {
  if (Array.isArray(obj)) {
    return obj.map(item => resolveAllReferences(item, tokens));
  }

  if (typeof obj === 'object' && obj !== null) {
    const resolved = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'value') {
        resolved[key] = resolveTokenReference(value, tokens);
      } else {
        resolved[key] = resolveAllReferences(value, tokens);
      }
    }
    return resolved;
  }

  return obj;
}

/**
 * 生成 CSS 变量文件 (增强版)
 */
function generateCSSVariables(tokens) {
  const resolvedTokens = resolveAllReferences(tokens, tokens);
  let css = `/*
 * 🎨 自动生成的CSS变量文件 v2.0
 * 来源: tokens.json
 * 生成时间: ${new Date().toISOString()}
 *
 * 架构说明:
 * - 使用 @layer tokens 确保正确的CSS层级
 * - 支持完整的浅色/深色主题
 * - 所有token从单一数据源生成
 */

@layer tokens {
  :root {
    /* ========================================
       🎨 颜色令牌 (Color Tokens)
       ======================================== */\n`;

  // 颜色令牌
  if (resolvedTokens.color?.semantic) {
    Object.entries(resolvedTokens.color.semantic).forEach(([name, token]) => {
      css += `    --${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📏 间距令牌 (Spacing Tokens)
       ======================================== */\n`;

  // 间距令牌 - scale
  if (resolvedTokens.spacing?.scale) {
    Object.entries(resolvedTokens.spacing.scale).forEach(([name, token]) => {
      css += `    --spacing-${name}: ${token.value};\n`;
    });
  }

  // 间距令牌 - semantic
  if (resolvedTokens.spacing?.semantic) {
    Object.entries(resolvedTokens.spacing.semantic).forEach(([name, token]) => {
      css += `    --spacing-${name}: ${resolveTokenReference(token.value, tokens)};\n`;
    });
  }

  css += `\n    /* ========================================
       📐 尺寸令牌 (Size Tokens)
       ======================================== */\n`;

  // 尺寸令牌
  if (resolvedTokens.size?.scale) {
    Object.entries(resolvedTokens.size.scale).forEach(([name, token]) => {
      css += `    --size-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📝 字体令牌 (Typography Tokens)
       ======================================== */\n`;

  // 字体家族
  if (resolvedTokens.typography?.fontFamily) {
    Object.entries(resolvedTokens.typography.fontFamily).forEach(([name, token]) => {
      const value = Array.isArray(token.value) ? token.value.join(', ') : token.value;
      css += `    --font-family-${name}: ${value};\n`;
    });
  }

  // 字体大小
  if (resolvedTokens.typography?.fontSize) {
    Object.entries(resolvedTokens.typography.fontSize).forEach(([name, token]) => {
      css += `    --font-size-${name}: ${token.value};\n`;
    });
  }

  // 字体粗细
  if (resolvedTokens.typography?.fontWeight) {
    Object.entries(resolvedTokens.typography.fontWeight).forEach(([name, token]) => {
      css += `    --font-weight-${name}: ${token.value};\n`;
    });
  }

  // 行高
  if (resolvedTokens.typography?.lineHeight) {
    Object.entries(resolvedTokens.typography.lineHeight).forEach(([name, token]) => {
      css += `    --line-height-${name}: ${token.value};\n`;
    });
  }

  // 字间距
  if (resolvedTokens.typography?.letterSpacing) {
    Object.entries(resolvedTokens.typography.letterSpacing).forEach(([name, token]) => {
      css += `    --letter-spacing-${name}: ${token.value};\n`;
    });
  }

  // 层级化字体
  if (resolvedTokens.typography?.hierarchy) {
    css += `\n    /* 层级化字体 (Hierarchical Typography) */\n`;
    Object.entries(resolvedTokens.typography.hierarchy).forEach(([name, token]) => {
      css += `    --font-size-${name}: ${resolveTokenReference(token.value, tokens)};\n`;
    });
  }

  css += `\n    /* ========================================
       🌟 圆角令牌 (Border Radius Tokens)
       ======================================== */\n`;

  // 圆角
  if (resolvedTokens.borderRadius) {
    Object.entries(resolvedTokens.borderRadius).forEach(([name, token]) => {
      css += `    --radius-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       🌫️ 阴影令牌 (Shadow Tokens)
       ======================================== */\n`;

  // 阴影
  if (resolvedTokens.shadow) {
    Object.entries(resolvedTokens.shadow).forEach(([name, token]) => {
      css += `    --shadow-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📚 层级令牌 (Z-Index Tokens)
       ======================================== */\n`;

  // z-index
  if (resolvedTokens.zIndex) {
    Object.entries(resolvedTokens.zIndex).forEach(([name, token]) => {
      css += `    --z-index-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       ⏱️ 动画令牌 (Animation Tokens)
       ======================================== */\n`;

  // 动画时长
  if (resolvedTokens.animation?.duration) {
    Object.entries(resolvedTokens.animation.duration).forEach(([name, token]) => {
      css += `    --duration-${name}: ${token.value};\n`;
    });
  }

  // 动画缓动
  if (resolvedTokens.animation?.easing) {
    Object.entries(resolvedTokens.animation.easing).forEach(([name, token]) => {
      css += `    --easing-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📱 断点令牌 (Breakpoint Tokens)
       ======================================== */\n`;

  // 断点
  if (resolvedTokens.breakpoint) {
    Object.entries(resolvedTokens.breakpoint).forEach(([name, token]) => {
      css += `    --breakpoint-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📦 容器令牌 (Container Tokens)
       ======================================== */\n`;

  // 容器最大宽度
  if (resolvedTokens.container?.['max-width']) {
    Object.entries(resolvedTokens.container['max-width']).forEach(([name, token]) => {
      css += `    --container-max-width-${name}: ${token.value};\n`;
    });
  }

  // 容器padding
  if (resolvedTokens.container?.padding) {
    Object.entries(resolvedTokens.container.padding).forEach(([name, token]) => {
      css += `    --container-padding-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       🏗️ 布局令牌 (Layout Tokens)
       ======================================== */\n`;

  // 布局令牌
  if (resolvedTokens.layout) {
    Object.entries(resolvedTokens.layout).forEach(([name, token]) => {
      css += `    --layout-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       📊 网格令牌 (Grid Tokens)
       ======================================== */\n`;

  // 网格列数
  if (resolvedTokens.grid?.columns) {
    Object.entries(resolvedTokens.grid.columns).forEach(([name, token]) => {
      css += `    --grid-columns-${name}: ${token.value};\n`;
    });
  }

  // 网格间距
  if (resolvedTokens.grid?.gap) {
    Object.entries(resolvedTokens.grid.gap).forEach(([name, token]) => {
      css += `    --grid-gap-${name}: ${resolveTokenReference(token.value, tokens)};\n`;
    });
  }

  css += `\n    /* ========================================
       🔲 边框令牌 (Border Tokens)
       ======================================== */\n`;

  // 边框宽度
  if (resolvedTokens.border?.width) {
    Object.entries(resolvedTokens.border.width).forEach(([name, token]) => {
      css += `    --border-width-${name}: ${token.value};\n`;
    });
  }

  css += `\n    /* ========================================
       👁️ 透明度令牌 (Opacity Tokens)
       ======================================== */\n`;

  // 透明度
  if (resolvedTokens.opacity) {
    Object.entries(resolvedTokens.opacity).forEach(([name, token]) => {
      css += `    --opacity-${name}: ${token.value};\n`;
    });
  }

  css += `  }\n\n`;

  // 浅色主题
  css += `  /* ========================================
     ☀️ 浅色主题 (Light Theme)
     手动切换优先级最高
     ======================================== */
  .light {\n`;

  if (resolvedTokens.color?.theme?.light) {
    Object.entries(resolvedTokens.color.theme.light).forEach(([name, token]) => {
      css += `    --${name}: ${token.value};\n`;
    });
  }

  css += `  }\n\n`;

  // 深色主题
  css += `  /* ========================================
     🌙 深色主题 (Dark Theme)
     手动切换优先级最高
     ======================================== */
  .dark {\n`;

  if (resolvedTokens.color?.theme?.dark) {
    Object.entries(resolvedTokens.color.theme.dark).forEach(([name, token]) => {
      css += `    --${name}: ${token.value};\n`;
    });
  }

  css += `  }\n\n`;

  // 系统偏好 - 深色模式
  css += `  /* ========================================
     🌓 系统偏好 - 深色模式
     优先级低于手动切换
     ======================================== */
  @media (prefers-color-scheme: dark) {
    :root:not(.light):not(.dark) {\n`;

  if (resolvedTokens.color?.theme?.dark) {
    Object.entries(resolvedTokens.color.theme.dark).forEach(([name, token]) => {
      css += `      --${name}: ${token.value};\n`;
    });
  }

  css += `    }
  }
}
`;

  return css;
}

/**
 * 生成 Tailwind 配置 (增强版)
 */
function generateTailwindConfig(tokens) {
  const resolvedTokens = resolveAllReferences(tokens, tokens);

  const config = {
    theme: {
      extend: {
        colors: {},
        spacing: {},
        fontSize: {},
        fontWeight: {},
        lineHeight: {},
        letterSpacing: {},
        borderRadius: {},
        boxShadow: {},
        zIndex: {},
        transitionDuration: {},
        transitionTimingFunction: {},
        maxWidth: {},
        opacity: {}
      }
    }
  };

  // 颜色 - 映射为 hsl(var(--name)) 格式
  if (resolvedTokens.color?.semantic) {
    Object.entries(resolvedTokens.color.semantic).forEach(([name, token]) => {
      config.theme.extend.colors[name] = `hsl(var(--${name}))`;
    });
  }

  // 间距 - 使用 CSS 变量
  if (resolvedTokens.spacing?.scale) {
    Object.entries(resolvedTokens.spacing.scale).forEach(([name, token]) => {
      config.theme.extend.spacing[name] = `var(--spacing-${name})`;
    });
  }

  // 字体大小 - 使用 CSS 变量
  if (resolvedTokens.typography?.fontSize) {
    Object.entries(resolvedTokens.typography.fontSize).forEach(([name, token]) => {
      config.theme.extend.fontSize[name] = `var(--font-size-${name})`;
    });
  }

  // 字体粗细
  if (resolvedTokens.typography?.fontWeight) {
    Object.entries(resolvedTokens.typography.fontWeight).forEach(([name, token]) => {
      config.theme.extend.fontWeight[name] = `var(--font-weight-${name})`;
    });
  }

  // 行高
  if (resolvedTokens.typography?.lineHeight) {
    Object.entries(resolvedTokens.typography.lineHeight).forEach(([name, token]) => {
      config.theme.extend.lineHeight[name] = `var(--line-height-${name})`;
    });
  }

  // 字间距
  if (resolvedTokens.typography?.letterSpacing) {
    Object.entries(resolvedTokens.typography.letterSpacing).forEach(([name, token]) => {
      config.theme.extend.letterSpacing[name] = `var(--letter-spacing-${name})`;
    });
  }

  // 圆角
  if (resolvedTokens.borderRadius) {
    Object.entries(resolvedTokens.borderRadius).forEach(([name, token]) => {
      config.theme.extend.borderRadius[name] = `var(--radius-${name})`;
    });
  }

  // 阴影
  if (resolvedTokens.shadow) {
    Object.entries(resolvedTokens.shadow).forEach(([name, token]) => {
      config.theme.extend.boxShadow[name] = `var(--shadow-${name})`;
    });
  }

  // z-index
  if (resolvedTokens.zIndex) {
    Object.entries(resolvedTokens.zIndex).forEach(([name, token]) => {
      config.theme.extend.zIndex[name] = `var(--z-index-${name})`;
    });
  }

  // 动画时长
  if (resolvedTokens.animation?.duration) {
    Object.entries(resolvedTokens.animation.duration).forEach(([name, token]) => {
      config.theme.extend.transitionDuration[name] = `var(--duration-${name})`;
    });
  }

  // 动画缓动
  if (resolvedTokens.animation?.easing) {
    Object.entries(resolvedTokens.animation.easing).forEach(([name, token]) => {
      config.theme.extend.transitionTimingFunction[name] = `var(--easing-${name})`;
    });
  }

  // 容器最大宽度
  if (resolvedTokens.container?.['max-width']) {
    Object.entries(resolvedTokens.container['max-width']).forEach(([name, token]) => {
      config.theme.extend.maxWidth[`container-${name}`] = `var(--container-max-width-${name})`;
    });
  }

  // 透明度
  if (resolvedTokens.opacity) {
    Object.entries(resolvedTokens.opacity).forEach(([name, token]) => {
      config.theme.extend.opacity[name] = `var(--opacity-${name})`;
    });
  }

  return `// 🎨 自动生成的 Tailwind 配置 v2.0
// 来源: tokens.json
// 生成时间: ${new Date().toISOString()}
//
// 📝 说明:
// - 所有值引用 CSS 变量,确保单一数据源
// - 与 tokens/build/css-vars.css 配合使用
// - 支持完整的主题系统

module.exports = ${JSON.stringify(config, null, 2)};
`;
}

/**
 * 主构建函数
 */
function build() {
  console.log('🔨 开始构建设计令牌 v2.0...\n');

  const buildDir = path.join(__dirname, '../build');

  // 确保构建目录存在
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  try {
    // 生成 CSS 变量
    console.log('📝 生成 CSS 变量文件...');
    const cssVariables = generateCSSVariables(tokens);
    fs.writeFileSync(path.join(buildDir, 'css-vars.css'), cssVariables);
    console.log('✅ CSS 变量文件已生成: tokens/build/css-vars.css\n');

    // 生成 Tailwind 配置
    console.log('📝 生成 Tailwind 配置文件...');
    const tailwindConfig = generateTailwindConfig(tokens);
    fs.writeFileSync(path.join(buildDir, 'tailwind.config.js'), tailwindConfig);
    console.log('✅ Tailwind 配置文件已生成: tokens/build/tailwind.config.js\n');

    console.log('🎉 设计令牌构建完成！\n');
    console.log('📊 统计信息:');
    console.log(`   - Token 类型: ${Object.keys(tokens).length - 1} 个 (排除 meta)`);
    console.log(`   - 颜色令牌: ${Object.keys(tokens.color?.semantic || {}).length} 个`);
    console.log(`   - 间距令牌: ${Object.keys(tokens.spacing?.scale || {}).length} 个`);
    console.log(`   - 字体令牌: ${Object.keys(tokens.typography?.fontSize || {}).length} 个`);
    console.log(`   - 断点令牌: ${Object.keys(tokens.breakpoint || {}).length} 个`);
    console.log(`   - 版本: ${tokens.meta?.version || 'N/A'}\n`);

  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行构建
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}

export { build, generateCSSVariables, generateTailwindConfig };
