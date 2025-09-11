module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-css-modules'
  ],
  plugins: [
    'stylelint-declaration-block-no-ignored-properties',
    'stylelint-order'
  ],
  rules: {
    // 🚫 禁止硬编码颜色
    'color-no-hex': true,
    'function-disallowed-list': [
      'rgb',
      'rgba',
      'hsl',
      'hsla'
    ],
    
    // 🚫 禁止硬编码尺寸（除了特殊情况）
    'declaration-property-value-disallowed-list': {
      '/^(margin|padding|width|height|top|left|right|bottom|font-size|border-radius)$/': [
        '/^\\d+px$/',
        '/^\\d+rem$/',
        '/^\\d+em$/'
      ]
    },
    
    // ✅ 强制使用CSS变量
    'custom-property-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
    'function-allowed-list': [
      'var',
      'calc',
      'clamp',
      'min',
      'max',
      'url',
      'linear-gradient',
      'radial-gradient',
      'conic-gradient'
    ],
    
    // 🎯 CSS变量命名规范
    'custom-property-empty-line-before': 'never',
    'declaration-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment', 'after-declaration']
      }
    ],
    
    // 📋 属性顺序
    'order/properties-order': [
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
      'float',
      'clear',
      'width',
      'min-width',
      'max-width',
      'height',
      'min-height',
      'max-height',
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
      'border',
      'border-width',
      'border-style',
      'border-color',
      'border-radius',
      'box-sizing',
      'overflow',
      'overflow-x',
      'overflow-y',
      
      // 视觉
      'background',
      'background-color',
      'background-image',
      'background-position',
      'background-size',
      'background-repeat',
      'color',
      'font',
      'font-family',
      'font-size',
      'font-weight',
      'font-style',
      'line-height',
      'text-align',
      'text-decoration',
      'text-transform',
      'letter-spacing',
      'word-spacing',
      'white-space',
      'box-shadow',
      'opacity',
      'visibility',
      
      // 动画
      'transform',
      'transition',
      'animation'
    ],
    
    // 🚫 禁止!important（除了特殊情况）
    'declaration-no-important': [
      true,
      {
        severity: 'warning'
      }
    ],
    
    // ✅ 允许的!important使用场景
    'comment-pattern': [
      '^(?:TODO|FIXME|NOTE|HACK|XXX|BUG|TEMP|OVERRIDE):'
    ],
    
    // 🎨 颜色格式规范
    'color-function-notation': 'modern',
    'alpha-value-notation': 'percentage',
    
    // 📏 长度单位规范
    'length-zero-no-unit': true,
    'number-max-precision': 3,
    
    // 🔤 字符串规范
    'string-quotes': 'single',
    
    // 🏗️ 选择器规范
    'selector-class-pattern': [
      '^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      {
        message: 'Expected class selector to be BEM format'
      }
    ],
    
    // 🚫 禁止的CSS特性
    'property-disallowed-list': [
      'float',
      'clear'
    ],
    
    // ✅ 媒体查询规范
    'media-query-no-invalid': true,
    'custom-media-pattern': '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
    
    // 🎯 特定规则覆盖
    'rule-empty-line-before': [
      'always-multi-line',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      }
    ],
    
    // 🔧 修复建议
    'comment-whitespace-inside': 'always',
    'indentation': 2,
    'max-nesting-depth': 3,
    
    // 🚫 禁止的值
    'declaration-property-value-disallowed-list': {
      // 禁止硬编码颜色
      '/^(background|color|border|outline|box-shadow|text-shadow)$/': [
        '/^#[0-9a-fA-F]+$/',
        '/^rgb\\(/',
        '/^rgba\\(/',
        '/^hsl\\((?!var\\(--)',
        '/^hsla\\((?!var\\(--)'
      ],
      // 禁止硬编码字体
      'font-family': [
        '/^["\'](?!var\\(--)[^"\']+["\']$/'
      ]
    }
  },
  
  // 🎯 特定文件规则覆盖
  overrides: [
    {
      files: ['**/*.module.css', '**/*.css'],
      rules: {
        // CSS模块允许更灵活的类名
        'selector-class-pattern': null
      }
    },
    {
      files: ['**/tokens/**/*.css'],
      rules: {
        // 设计令牌文件允许硬编码值
        'color-no-hex': null,
        'function-disallowed-list': null,
        'declaration-property-value-disallowed-list': null
      }
    },
    {
      files: ['**/vendor/**/*.css', '**/node_modules/**/*.css'],
      rules: {
        // 第三方CSS文件跳过检查
        'all': null
      }
    }
  ],
  
  // 🚫 忽略的文件
  ignoreFiles: [
    'dist/**/*',
    'build/**/*',
    'coverage/**/*',
    '**/*.min.css'
  ]
};
