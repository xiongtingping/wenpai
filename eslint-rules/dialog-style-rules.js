/**
 * ESLint规则：Dialog样式规范
 * 防止Dialog定位问题复发的代码检查规则
 */

module.exports = {
  rules: {
    // 禁止在Dialog组件中使用内联定位样式
    'no-inline-positioning-styles': {
      meta: {
        type: 'error',
        docs: {
          description: '禁止在Dialog组件中使用内联定位样式',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noInlinePositioning: '禁止在Dialog组件中使用内联定位样式 ({{property}})，请使用CSS类或设计令牌',
          noHardcodedValues: '禁止使用硬编码的定位值 ({{value}})，请使用设计令牌',
        },
      },
      create(context) {
        const prohibitedPositioningProps = [
          'position', 'top', 'left', 'right', 'bottom',
          'transform', 'translate', 'zIndex', 'z-index'
        ];

        const hardcodedValuePattern = /^(\d+px|\d+rem|\d+em|\d+%|fixed|absolute|relative)$/;

        return {
          JSXAttribute(node) {
            // 检查是否是style属性
            if (node.name.name === 'style' && node.value && node.value.type === 'JSXExpressionContainer') {
              const expression = node.value.expression;
              
              // 检查对象表达式中的定位属性
              if (expression.type === 'ObjectExpression') {
                expression.properties.forEach(prop => {
                  if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                    const propName = prop.key.name;
                    
                    // 检查是否是禁止的定位属性
                    if (prohibitedPositioningProps.includes(propName)) {
                      context.report({
                        node: prop,
                        messageId: 'noInlinePositioning',
                        data: { property: propName },
                        fix(fixer) {
                          // 建议移除该属性
                          return fixer.remove(prop);
                        },
                      });
                    }
                    
                    // 检查是否使用硬编码值
                    if (prop.value.type === 'Literal' && typeof prop.value.value === 'string') {
                      if (hardcodedValuePattern.test(prop.value.value)) {
                        context.report({
                          node: prop.value,
                          messageId: 'noHardcodedValues',
                          data: { value: prop.value.value },
                        });
                      }
                    }
                  }
                });
              }
            }
          },
        };
      },
    },

    // 强制使用统一的Dialog组件
    'enforce-unified-dialog': {
      meta: {
        type: 'warning',
        docs: {
          description: '强制使用统一的Dialog组件',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          useUnifiedDialog: '请使用UnifiedDialog组件替代 {{componentName}}',
          avoidRadixDialog: '避免直接使用Radix Dialog组件，请使用UnifiedDialog包装',
        },
      },
      create(context) {
        const prohibitedDialogComponents = [
          'Dialog',
          'DialogContent',
          'DialogOverlay',
          'Modal',
          'Popup'
        ];

        return {
          JSXOpeningElement(node) {
            const componentName = node.name.name;
            
            if (prohibitedDialogComponents.includes(componentName)) {
              // 检查是否已经是UnifiedDialog
              if (componentName !== 'UnifiedDialog') {
                context.report({
                  node,
                  messageId: 'useUnifiedDialog',
                  data: { componentName },
                  fix(fixer) {
                    return fixer.replaceText(node.name, 'UnifiedDialog');
                  },
                });
              }
            }
          },
          
          ImportDeclaration(node) {
            // 检查是否直接导入Radix Dialog组件
            if (node.source.value === '@radix-ui/react-dialog') {
              context.report({
                node,
                messageId: 'avoidRadixDialog',
              });
            }
          },
        };
      },
    },

    // 禁止混合样式系统
    'no-mixed-style-systems': {
      meta: {
        type: 'error',
        docs: {
          description: '禁止在同一组件中混合使用多种样式系统',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          noMixedStyles: '禁止同时使用className和style属性，请选择一种样式系统',
          preferDesignTokens: '建议使用设计令牌而非硬编码样式',
        },
      },
      create(context) {
        return {
          JSXOpeningElement(node) {
            let hasClassName = false;
            let hasStyle = false;
            
            node.attributes.forEach(attr => {
              if (attr.type === 'JSXAttribute') {
                if (attr.name.name === 'className') {
                  hasClassName = true;
                }
                if (attr.name.name === 'style') {
                  hasStyle = true;
                }
              }
            });
            
            // 如果同时使用了className和style，报告错误
            if (hasClassName && hasStyle) {
              context.report({
                node,
                messageId: 'noMixedStyles',
              });
            }
          },
        };
      },
    },

    // 强制使用设计令牌
    'enforce-design-tokens': {
      meta: {
        type: 'suggestion',
        docs: {
          description: '强制使用设计令牌而非硬编码值',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          useDesignToken: '使用设计令牌 {{token}} 替代硬编码值 {{value}}',
          avoidHardcodedColors: '避免使用硬编码颜色，请使用设计令牌',
        },
      },
      create(context) {
        const colorPattern = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/;
        const sizePattern = /\b\d+px\b|\b\d+rem\b|\b\d+em\b/;
        
        // 设计令牌映射
        const tokenMappings = {
          '#ffffff': 'var(--color-background)',
          '#000000': 'var(--color-foreground)',
          '16px': 'var(--spacing-md)',
          '8px': 'var(--spacing-sm)',
          '24px': 'var(--spacing-lg)',
          'fixed': 'var(--dialog-position-strategy)',
          '50%': 'var(--dialog-center-x) / var(--dialog-center-y)',
        };

        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              const value = node.value;
              
              // 检查颜色值
              if (colorPattern.test(value)) {
                const suggestedToken = tokenMappings[value] || 'var(--color-*)';
                context.report({
                  node,
                  messageId: 'useDesignToken',
                  data: { token: suggestedToken, value },
                });
              }
              
              // 检查尺寸值
              if (sizePattern.test(value)) {
                const suggestedToken = tokenMappings[value] || 'var(--spacing-*)';
                context.report({
                  node,
                  messageId: 'useDesignToken',
                  data: { token: suggestedToken, value },
                });
              }
            }
          },
        };
      },
    },
  },
};

// 预设配置
module.exports.configs = {
  recommended: {
    plugins: ['dialog-style'],
    rules: {
      'dialog-style/no-inline-positioning-styles': 'error',
      'dialog-style/enforce-unified-dialog': 'warn',
      'dialog-style/no-mixed-style-systems': 'error',
      'dialog-style/enforce-design-tokens': 'warn',
    },
  },
  strict: {
    plugins: ['dialog-style'],
    rules: {
      'dialog-style/no-inline-positioning-styles': 'error',
      'dialog-style/enforce-unified-dialog': 'error',
      'dialog-style/no-mixed-style-systems': 'error',
      'dialog-style/enforce-design-tokens': 'error',
    },
  },
};
