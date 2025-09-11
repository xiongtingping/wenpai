#!/usr/bin/env node

/**
 * Design Token 构建脚本
 * 将 tokens.json 转换为各种格式的配置文件
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
 * 生成 CSS 变量文件
 */
function generateCSSVariables(tokens) {
  const resolvedTokens = resolveAllReferences(tokens, tokens);
  let css = `/* 
 * 自动生成的CSS变量文件
 * 来源: tokens.json
 * 生成时间: ${new Date().toISOString()}
 */

:root {
  /* 🎨 颜色令牌 */\n`;

  // 颜色令牌
  if (resolvedTokens.color?.semantic) {
    Object.entries(resolvedTokens.color.semantic).forEach(([name, token]) => {
      css += `  --${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* 📏 间距令牌 */\n`;
  
  // 间距令牌
  if (resolvedTokens.spacing?.scale) {
    Object.entries(resolvedTokens.spacing.scale).forEach(([name, token]) => {
      css += `  --spacing-${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* 📝 字体令牌 */\n`;
  
  // 字体大小
  if (resolvedTokens.typography?.fontSize) {
    Object.entries(resolvedTokens.typography.fontSize).forEach(([name, token]) => {
      css += `  --font-size-${name}: ${token.value};\n`;
    });
  }

  // 字体粗细
  if (resolvedTokens.typography?.fontWeight) {
    Object.entries(resolvedTokens.typography.fontWeight).forEach(([name, token]) => {
      css += `  --font-weight-${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* 🔄 圆角令牌 */\n`;
  
  // 圆角
  if (resolvedTokens.borderRadius) {
    Object.entries(resolvedTokens.borderRadius).forEach(([name, token]) => {
      css += `  --radius-${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* 🌫️ 阴影令牌 */\n`;
  
  // 阴影
  if (resolvedTokens.shadow) {
    Object.entries(resolvedTokens.shadow).forEach(([name, token]) => {
      css += `  --shadow-${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* 📚 层级令牌 */\n`;
  
  // z-index
  if (resolvedTokens.zIndex) {
    Object.entries(resolvedTokens.zIndex).forEach(([name, token]) => {
      css += `  --z-${name}: ${token.value};\n`;
    });
  }

  css += `\n  /* ⏱️ 动画令牌 */\n`;
  
  // 动画时长
  if (resolvedTokens.animation?.duration) {
    Object.entries(resolvedTokens.animation.duration).forEach(([name, token]) => {
      css += `  --duration-${name}: ${token.value};\n`;
    });
  }

  // 动画缓动
  if (resolvedTokens.animation?.easing) {
    Object.entries(resolvedTokens.animation.easing).forEach(([name, token]) => {
      css += `  --easing-${name}: ${token.value};\n`;
    });
  }

  css += `}

/* 🌙 深色主题 */
[data-theme="dark"] {
`;

  if (resolvedTokens.color?.theme?.dark) {
    Object.entries(resolvedTokens.color.theme.dark).forEach(([name, token]) => {
      css += `  --${name}: ${token.value};\n`;
    });
  }

  css += `}

/* ☀️ 浅色主题 */
[data-theme="light"] {
`;

  if (resolvedTokens.color?.theme?.light) {
    Object.entries(resolvedTokens.color.theme.light).forEach(([name, token]) => {
      css += `  --${name}: ${token.value};\n`;
    });
  }

  css += `}
`;

  return css;
}

/**
 * 生成 Tailwind 配置
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
        borderRadius: {},
        boxShadow: {},
        zIndex: {},
        transitionDuration: {},
        transitionTimingFunction: {}
      }
    }
  };

  // 颜色
  if (resolvedTokens.color?.semantic) {
    Object.entries(resolvedTokens.color.semantic).forEach(([name, token]) => {
      config.theme.extend.colors[name] = `hsl(var(--${name}))`;
    });
  }

  // 间距
  if (resolvedTokens.spacing?.scale) {
    Object.entries(resolvedTokens.spacing.scale).forEach(([name, token]) => {
      config.theme.extend.spacing[name] = token.value;
    });
  }

  // 字体大小
  if (resolvedTokens.typography?.fontSize) {
    Object.entries(resolvedTokens.typography.fontSize).forEach(([name, token]) => {
      config.theme.extend.fontSize[name] = token.value;
    });
  }

  // 字体粗细
  if (resolvedTokens.typography?.fontWeight) {
    Object.entries(resolvedTokens.typography.fontWeight).forEach(([name, token]) => {
      config.theme.extend.fontWeight[name] = token.value;
    });
  }

  // 圆角
  if (resolvedTokens.borderRadius) {
    Object.entries(resolvedTokens.borderRadius).forEach(([name, token]) => {
      config.theme.extend.borderRadius[name] = token.value;
    });
  }

  // 阴影
  if (resolvedTokens.shadow) {
    Object.entries(resolvedTokens.shadow).forEach(([name, token]) => {
      config.theme.extend.boxShadow[name] = token.value;
    });
  }

  // z-index
  if (resolvedTokens.zIndex) {
    Object.entries(resolvedTokens.zIndex).forEach(([name, token]) => {
      config.theme.extend.zIndex[name] = token.value;
    });
  }

  // 动画时长
  if (resolvedTokens.animation?.duration) {
    Object.entries(resolvedTokens.animation.duration).forEach(([name, token]) => {
      config.theme.extend.transitionDuration[name] = token.value;
    });
  }

  // 动画缓动
  if (resolvedTokens.animation?.easing) {
    Object.entries(resolvedTokens.animation.easing).forEach(([name, token]) => {
      config.theme.extend.transitionTimingFunction[name] = token.value;
    });
  }

  return `// 自动生成的 Tailwind 配置
// 来源: tokens.json
// 生成时间: ${new Date().toISOString()}

module.exports = ${JSON.stringify(config, null, 2)};
`;
}

/**
 * 生成 Radix 主题配置
 */
function generateRadixTheme(tokens) {
  const resolvedTokens = resolveAllReferences(tokens, tokens);
  
  const theme = {
    colors: {},
    space: {},
    fonts: {},
    fontSizes: {},
    fontWeights: {},
    radii: {},
    shadows: {}
  };

  // 颜色映射到 Radix 格式
  if (resolvedTokens.color?.semantic) {
    Object.entries(resolvedTokens.color.semantic).forEach(([name, token]) => {
      // Radix 使用不同的颜色命名约定
      const radixName = name === 'primary' ? 'accent' : 
                       name === 'destructive' ? 'red' :
                       name === 'warning' ? 'yellow' :
                       name === 'success' ? 'green' : name;
      theme.colors[radixName] = `hsl(${token.value})`;
    });
  }

  // 间距
  if (resolvedTokens.spacing?.scale) {
    Object.entries(resolvedTokens.spacing.scale).forEach(([name, token]) => {
      theme.space[name] = token.value;
    });
  }

  // 字体
  if (resolvedTokens.typography?.fontFamily) {
    Object.entries(resolvedTokens.typography.fontFamily).forEach(([name, token]) => {
      theme.fonts[name] = Array.isArray(token.value) ? token.value.join(', ') : token.value;
    });
  }

  // 字体大小
  if (resolvedTokens.typography?.fontSize) {
    Object.entries(resolvedTokens.typography.fontSize).forEach(([name, token]) => {
      theme.fontSizes[name] = token.value;
    });
  }

  // 字体粗细
  if (resolvedTokens.typography?.fontWeight) {
    Object.entries(resolvedTokens.typography.fontWeight).forEach(([name, token]) => {
      theme.fontWeights[name] = token.value;
    });
  }

  // 圆角
  if (resolvedTokens.borderRadius) {
    Object.entries(resolvedTokens.borderRadius).forEach(([name, token]) => {
      theme.radii[name] = token.value;
    });
  }

  // 阴影
  if (resolvedTokens.shadow) {
    Object.entries(resolvedTokens.shadow).forEach(([name, token]) => {
      theme.shadows[name] = token.value;
    });
  }

  return `// 自动生成的 Radix 主题配置
// 来源: tokens.json
// 生成时间: ${new Date().toISOString()}

export const radixTheme = ${JSON.stringify(theme, null, 2)};
`;
}

/**
 * 主构建函数
 */
function build() {
  console.log('🔨 开始构建设计令牌...');
  
  const buildDir = path.join(__dirname, '../build');
  
  // 确保构建目录存在
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  try {
    // 生成 CSS 变量
    const cssVariables = generateCSSVariables(tokens);
    fs.writeFileSync(path.join(buildDir, 'css-vars.css'), cssVariables);
    console.log('✅ CSS 变量文件已生成');

    // 生成 Tailwind 配置
    const tailwindConfig = generateTailwindConfig(tokens);
    fs.writeFileSync(path.join(buildDir, 'tailwind.config.js'), tailwindConfig);
    console.log('✅ Tailwind 配置文件已生成');

    // 生成 Radix 主题
    const radixTheme = generateRadixTheme(tokens);
    fs.writeFileSync(path.join(buildDir, 'radix-theme.js'), radixTheme);
    console.log('✅ Radix 主题文件已生成');

    console.log('🎉 设计令牌构建完成！');
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 运行构建
if (import.meta.url === `file://${process.argv[1]}`) {
  build();
}

export { build, generateCSSVariables, generateTailwindConfig, generateRadixTheme };
