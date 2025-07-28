/**
 * 🔒 ESLint自定义规则：防止undefined字符串拼接
 * 
 * 🎯 目标：自动检测可能导致"undefinedundefined"的代码模式
 * 📋 检测范围：
 * 1. user?.property || user?.property 模式
 * 2. 模板字符串中的用户属性直接使用
 * 3. 字符串拼接中的用户属性
 * 4. JSX中的用户属性直接渲染
 */

module.exports = {
  rules: {
    /**
     * 禁止不安全的用户属性拼接
     */
    'no-unsafe-user-concat': {
      meta: {
        type: 'problem',
        docs: {
          description: '禁止直接拼接用户属性，防止"undefinedundefined"问题',
          category: 'Possible Errors',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      
      create(context) {
        const userProperties = ['nickname', 'username', 'email', 'phone', 'avatar', 'photo'];
        
        /**
         * 检查是否是用户属性访问
         */
        function isUserPropertyAccess(node) {
          return node.type === 'MemberExpression' &&
                 node.object && 
                 (node.object.name === 'user' || 
                  (node.object.type === 'OptionalMemberExpression' && node.object.object?.name === 'user')) &&
                 node.property && 
                 userProperties.includes(node.property.name);
        }
        
        /**
         * 检查是否是危险的逻辑或表达式
         */
        function isDangerousLogicalExpression(node) {
          return node.type === 'LogicalExpression' &&
                 node.operator === '||' &&
                 isUserPropertyAccess(node.left) &&
                 isUserPropertyAccess(node.right);
        }
        
        return {
          // 检测 user?.nickname || user?.username 模式
          LogicalExpression(node) {
            if (isDangerousLogicalExpression(node)) {
              context.report({
                node,
                message: '避免直接拼接用户属性，请使用 getUserDisplayName(user, fallback) 安全函数',
                fix(fixer) {
                  return fixer.replaceText(node, 'getUserDisplayName(user, \'\')');
                }
              });
            }
          },
          
          // 检测模板字符串中的用户属性
          TemplateLiteral(node) {
            node.expressions.forEach(expr => {
              if (isUserPropertyAccess(expr)) {
                context.report({
                  node: expr,
                  message: '模板字符串中避免直接使用用户属性，请使用 getUserDisplayName() 等安全函数',
                  fix(fixer) {
                    const propertyName = expr.property.name;
                    let replacement = 'getUserDisplayName(user, \'\')';
                    
                    if (propertyName === 'avatar' || propertyName === 'photo') {
                      replacement = 'getUserAvatar(user)';
                    }
                    
                    return fixer.replaceText(expr, replacement);
                  }
                });
              }
            });
          },
          
          // 检测二元表达式中的字符串拼接
          BinaryExpression(node) {
            if (node.operator === '+') {
              const hasUserProperty = isUserPropertyAccess(node.left) || isUserPropertyAccess(node.right);
              if (hasUserProperty) {
                context.report({
                  node,
                  message: '避免直接拼接用户属性到字符串，请使用安全的工具函数'
                });
              }
            }
          },
          
          // 检测JSX表达式中的用户属性
          JSXExpressionContainer(node) {
            if (node.expression.type === 'LogicalExpression' && 
                isDangerousLogicalExpression(node.expression)) {
              context.report({
                node: node.expression,
                message: 'JSX中避免直接使用用户属性拼接，请使用 getUserDisplayName(user, fallback)',
                fix(fixer) {
                  return fixer.replaceText(node.expression, 'getUserDisplayName(user, \'用户\')');
                }
              });
            }
          }
        };
      }
    },
    
    /**
     * 强制使用安全的用户信息访问函数
     */
    'require-safe-user-access': {
      meta: {
        type: 'suggestion',
        docs: {
          description: '强制使用安全的用户信息访问函数',
          category: 'Best Practices',
          recommended: true
        },
        schema: []
      },
      
      create(context) {
        const safeAccessors = [
          'getUserDisplayName',
          'getUserAvatar', 
          'getUserAvatarFallback',
          'getUserAltText',
          'getUserPlaceholder'
        ];
        
        return {
          MemberExpression(node) {
            if (node.object && node.object.name === 'user' && 
                node.property && ['nickname', 'username', 'email'].includes(node.property.name)) {
              
              // 检查是否在安全函数内部
              let parent = node.parent;
              let inSafeFunction = false;
              
              while (parent) {
                if (parent.type === 'CallExpression' && 
                    parent.callee && 
                    safeAccessors.includes(parent.callee.name)) {
                  inSafeFunction = true;
                  break;
                }
                parent = parent.parent;
              }
              
              if (!inSafeFunction) {
                context.report({
                  node,
                  message: `直接访问 user.${node.property.name} 不安全，请使用 getUserDisplayName(user, fallback)`
                });
              }
            }
          }
        };
      }
    }
  }
};

/**
 * 使用方法：
 * 
 * 1. 在 .eslintrc.js 中添加：
 * ```javascript
 * module.exports = {
 *   plugins: ['./src/utils/eslint-undefined-concat-rules'],
 *   rules: {
 *     'undefined-concat-rules/no-unsafe-user-concat': 'error',
 *     'undefined-concat-rules/require-safe-user-access': 'warn'
 *   }
 * };
 * ```
 * 
 * 2. 运行检查：
 * ```bash
 * npx eslint src/ --fix
 * ```
 * 
 * 3. 在CI/CD中集成：
 * ```yaml
 * - name: Lint check
 *   run: npx eslint src/ --max-warnings 0
 * ```
 */
