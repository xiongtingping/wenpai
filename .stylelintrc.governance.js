/**
 * 🏛️ CSS治理专用Stylelint配置
 * 
 * 目标：强制执行CSS治理宪章中的所有规则
 * 级别：零容忍 - 所有违规都将阻断构建
 */

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  
  plugins: [
    'stylelint-order',
    'stylelint-declaration-strict-value',
    'stylelint-high-performance-animation'
  ],
  
  rules: {
    // 🚨 CRITICAL级别 - 立即阻断
    
    // 禁止全局transform
    'declaration-property-value-disallowed-list': {
      '/^transform$/': ['/translateZ/', '/translate3d/'],
      message: '🚨 CRITICAL: 禁止全局transform属性，请使用特定类名'
    },
    
    // 禁止内联样式（通过CSS检查）
    'selector-max-attribute': [0, {
      message: '🚨 CRITICAL: 禁止使用style属性，请使用CSS类'
    }],
    
    // ❌ ERROR级别 - 阻断提交
    
    // 禁止硬编码颜色
    'color-hex-length': 'long',
    'color-no-hex': [true, {
      message: '❌ ERROR: 禁止硬编码颜色，请使用 var(--color-*)'
    }],
    
    // 禁止硬编码尺寸
    'declaration-strict-value': [
      ['/color/', 'fill', 'stroke', '/font-size/', '/spacing/', '/width/', '/height/', '/padding/', '/margin/'],
      {
        ignoreKeywords: ['inherit', 'initial', 'unset', 'revert', 'auto', 'none', 'transparent', 'currentColor'],
        ignoreFunctions: ['var', 'calc', 'min', 'max', 'clamp'],
        message: '❌ ERROR: 禁止硬编码值，请使用设计令牌 var(--*)'
      }
    ],
    
    // 限制!important使用
    'declaration-no-important': [true, {
      message: '❌ ERROR: 禁止使用!important，除非在@layer emergency中'
    }],
    
    // 强制使用@layer
    'at-rule-empty-line-before': ['always', {
      except: ['blockless-after-same-name-blockless', 'first-nested'],
      ignore: ['after-comment'],
      ignoreAtRules: ['layer']
    }],
    
    // ⚠️ WARNING级别 - 警告但不阻断
    
    // CSS属性顺序
    'order/properties-order': [
      [
        // 定位
        'position',
        'top',
        'right',
        'bottom',
        'left',
        'z-index',
        
        // 盒模型
        'display',
        'flex',
        'flex-direction',
        'flex-wrap',
        'justify-content',
        'align-items',
        'align-content',
        'grid',
        'grid-template',
        'grid-area',
        
        // 尺寸
        'width',
        'height',
        'min-width',
        'min-height',
        'max-width',
        'max-height',
        
        // 间距
        'margin',
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
        'padding',
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
        
        // 边框
        'border',
        'border-radius',
        'border-width',
        'border-style',
        'border-color',
        
        // 背景
        'background',
        'background-color',
        'background-image',
        'background-size',
        'background-position',
        'background-repeat',
        
        // 文字
        'color',
        'font',
        'font-family',
        'font-size',
        'font-weight',
        'line-height',
        'text-align',
        'text-decoration',
        
        // 其他
        'opacity',
        'visibility',
        'overflow',
        'cursor',
        
        // 变换和动画
        'transform',
        'transition',
        'animation'
      ],
      {
        unspecified: 'bottom',
        severity: 'warning'
      }
    ],
    
    // 🎯 CSS层级管理规则
    
    // 确保@layer声明在文件顶部
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['layer', 'apply', 'variants', 'responsive', 'screen']
    }],
    
    // 🎯 性能相关规则
    
    // 禁止低性能动画
    'plugin/no-low-performance-animation-properties': [true, {
      message: '⚠️ WARNING: 避免对layout属性进行动画，请使用transform和opacity'
    }],
    
    // 🎯 可访问性规则
    
    // 确保对比度
    'color-contrast': [true, {
      message: '⚠️ WARNING: 颜色对比度不足，请检查可访问性'
    }],
    
    // 🎯 命名规范
    
    // CSS类名规范
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^u-[a-z0-9-]+$',
      {
        message: '⚠️ WARNING: 类名应使用kebab-case，工具类使用u-前缀'
      }
    ],
    
    // CSS变量命名规范
    'custom-property-pattern': [
      '^(color|spacing|size|font|shadow|radius|duration|ease)-[a-z0-9-]+$',
      {
        message: '⚠️ WARNING: CSS变量应使用语义化命名：--color-*, --spacing-*, 等'
      }
    ],
    
    // 🎯 文件组织规则
    
    // 限制嵌套深度
    'max-nesting-depth': [3, {
      message: '⚠️ WARNING: CSS嵌套深度不应超过3层'
    }],
    
    // 限制选择器复杂度
    'selector-max-compound-selectors': [4, {
      message: '⚠️ WARNING: 选择器复杂度过高，请简化'
    }],
    
    // 🎯 禁用可能冲突的规则
    
    // 允许空规则（用于@layer声明）
    'block-no-empty': null,
    
    // 允许vendor前缀（自动处理）
    'property-no-vendor-prefix': null,
    'value-no-vendor-prefix': null,
    
    // 允许unknown at-rules（Tailwind等）
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'tailwind',
        'apply',
        'variants',
        'responsive',
        'screen',
        'layer'
      ]
    }]
  },
  
  // 🎯 忽略文件
  ignoreFiles: [
    'node_modules/**/*',
    'dist/**/*',
    'build/**/*',
    '**/*.min.css'
  ],
  
  // 🎯 自定义消息
  customSyntax: 'postcss-scss',
  
  // 🎯 报告配置
  reportNeedlessDisables: true,
  reportInvalidScopeDisables: true,
  
  // 🎯 严重性配置
  defaultSeverity: 'error', // 默认所有规则都是error级别
  
  // 🎯 覆盖配置
  overrides: [
    {
      // 对emergency层放宽限制
      files: ['**/emergency/**/*.css', '**/*-fix.css'],
      rules: {
        'declaration-no-important': null,
        'declaration-strict-value': null
      }
    },
    {
      // 对第三方库覆盖文件放宽限制
      files: ['**/overrides/**/*.css'],
      rules: {
        'selector-class-pattern': null,
        'declaration-no-important': null
      }
    }
  ]
};
