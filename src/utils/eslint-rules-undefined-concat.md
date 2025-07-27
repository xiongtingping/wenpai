# ESLint Rules for Preventing Undefined String Concatenation

## 问题描述

在React/TypeScript项目中，经常会遇到用户信息显示时的undefined字符串拼接问题，例如：

```tsx
// ❌ 危险的模式 - 可能产生"undefinedundefined"
alt={user?.nickname || user?.username || ''}
{user?.nickname || user?.username}
`${user?.nickname || user?.username}`
```

当`user?.nickname`和`user?.username`都是undefined时，会产生"undefinedundefined"字符串。

## 推荐的ESLint规则配置

在`.eslintrc.js`中添加以下规则：

```javascript
module.exports = {
  rules: {
    // 禁止在模板字符串中使用可能为undefined的表达式
    'no-template-curly-in-string': 'error',
    
    // 自定义规则：检测危险的用户属性访问模式
    'no-unsafe-user-property-access': 'error',
    
    // 要求在逻辑OR表达式的最后提供非空默认值
    'require-fallback-in-or-expression': 'warn',
  },
  
  // 自定义规则实现
  overrides: [
    {
      files: ['**/*.tsx', '**/*.ts'],
      rules: {
        // 检测user?.property || user?.property模式
        'no-multiple-user-property-fallback': {
          create(context) {
            return {
              LogicalExpression(node) {
                if (node.operator === '||') {
                  const left = node.left;
                  const right = node.right;
                  
                  // 检测user?.nickname || user?.username模式
                  if (isUserPropertyAccess(left) && isUserPropertyAccess(right)) {
                    context.report({
                      node,
                      message: '使用getUserDisplayName()工具函数代替直接的用户属性访问链',
                      suggest: [{
                        desc: '使用安全的用户显示工具函数',
                        fix(fixer) {
                          return fixer.replaceText(node, 'getUserDisplayName(user)');
                        }
                      }]
                    });
                  }
                }
              }
            };
          }
        }
      }
    }
  ]
};

function isUserPropertyAccess(node) {
  return node.type === 'MemberExpression' &&
         node.object?.type === 'MemberExpression' &&
         node.object?.object?.name === 'user' &&
         ['nickname', 'username', 'name', 'email'].includes(node.property?.name);
}
```

## VS Code设置

在`.vscode/settings.json`中添加：

```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

## 推荐的代码模式

### ✅ 正确的做法

```tsx
import { getUserDisplayName, getUserAvatarAlt, getUserInitials } from '@/utils/userDisplayUtils';

// 安全的用户名显示
const displayName = getUserDisplayName(user, '默认用户');

// 安全的头像alt属性
<AvatarImage src={user?.avatar} alt={getUserAvatarAlt(user)} />

// 安全的头像首字母
<AvatarFallback>{getUserInitials(user)}</AvatarFallback>

// 安全的模板字符串
const greeting = `欢迎，${getUserDisplayName(user)}！`;
```

### ❌ 应该避免的模式

```tsx
// 危险：可能产生"undefinedundefined"
alt={user?.nickname || user?.username || ''}

// 危险：在JSX中直接使用
{user?.nickname || user?.username}

// 危险：在模板字符串中
`欢迎，${user?.nickname || user?.username}！`

// 危险：没有最终的非空默认值
const name = user?.nickname || user?.username;
```

## 团队规范

1. **强制使用工具函数**：所有用户信息显示必须使用`userDisplayUtils.ts`中的工具函数
2. **代码审查检查点**：在PR中重点检查用户信息显示相关的代码
3. **测试覆盖**：确保所有用户信息显示场景都有对应的测试用例
4. **文档更新**：新增用户信息字段时，同步更新工具函数

## 自动化检查

可以在CI/CD流程中添加以下检查：

```bash
# 检查是否存在危险的用户属性访问模式
grep -r "user\?\.\(nickname\|username\).*||.*||" src/ && exit 1

# 检查是否正确导入了工具函数
grep -r "getUserDisplayName\|getUserInitials\|getUserAvatarAlt" src/ --include="*.tsx" --include="*.ts"
```

通过这些规则和工具，可以有效防止"undefinedundefined"类型的字符串拼接问题。
