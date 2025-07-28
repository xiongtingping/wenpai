# ESLint 规则：防止 undefined 字符串拼接

## 概述

为了防止在代码中出现 "undefinedundefined" 或类似的字符串拼接问题，建议添加以下 ESLint 规则和最佳实践。

## 推荐的 ESLint 规则

### 1. 禁止直接拼接可能为 undefined 的值

```json
{
  "rules": {
    "no-implicit-coercion": ["error", {
      "boolean": false,
      "number": false,
      "string": true
    }],
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error"
  }
}
```

### 2. 自定义规则：检测用户属性拼接

```javascript
// .eslintrc.js 中的自定义规则
module.exports = {
  rules: {
    'no-unsafe-user-concat': {
      create(context) {
        return {
          BinaryExpression(node) {
            if (node.operator === '+') {
              // 检测 user?.property || user?.property 模式
              const left = node.left;
              const right = node.right;
              
              if (isUserPropertyAccess(left) || isUserPropertyAccess(right)) {
                context.report({
                  node,
                  message: '避免直接拼接用户属性，请使用 getUserDisplayName() 等安全函数'
                });
              }
            }
          },
          TemplateLiteral(node) {
            node.expressions.forEach(expr => {
              if (isUserPropertyAccess(expr)) {
                context.report({
                  node: expr,
                  message: '模板字符串中避免直接使用用户属性，请使用 getUserDisplayName() 等安全函数'
                });
              }
            });
          }
        };
        
        function isUserPropertyAccess(node) {
          // 检测 user?.nickname, user?.username 等模式
          return node.type === 'MemberExpression' &&
                 node.object && node.object.name === 'user' &&
                 ['nickname', 'username', 'email', 'phone', 'avatar'].includes(node.property.name);
        }
      }
    }
  }
};
```

## 推荐的代码模式

### ✅ 正确的做法

```typescript
// 使用安全的工具函数
import { getUserDisplayName, getUserAvatar, getUserAltText } from '@/utils/userDisplayUtils';

// 显示用户名
const displayName = getUserDisplayName(user, '访客');

// 头像 alt 文本
<img src={getUserAvatar(user)} alt={getUserAltText(user, '头像')} />

// 模板字符串
const greeting = `欢迎，${getUserDisplayName(user, '用户')}！`;
```

### ❌ 错误的做法

```typescript
// 可能导致 "undefinedundefined"
const displayName = user?.nickname || user?.username;

// 可能导致 "undefined的头像"
<img src={user?.avatar} alt={`${user?.nickname}的头像`} />

// 可能导致 "欢迎，undefined！"
const greeting = `欢迎，${user?.nickname || user?.username}！`;
```

## TypeScript 配置建议

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 代码审查检查清单

在代码审查时，请检查以下模式：

1. **字符串拼接**：
   - [ ] 是否使用了 `user?.property || user?.property` 模式
   - [ ] 是否直接拼接用户属性到字符串中
   - [ ] 是否在模板字符串中直接使用用户属性

2. **JSX 属性**：
   - [ ] `alt` 属性是否安全处理用户信息
   - [ ] `title` 属性是否安全处理用户信息
   - [ ] `placeholder` 是否使用了安全的默认值

3. **函数调用**：
   - [ ] 是否使用了推荐的工具函数
   - [ ] 是否提供了合适的 fallback 值

## 自动修复建议

可以创建一个 codemod 脚本来自动修复常见的模式：

```javascript
// codemod-fix-user-concat.js
module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  
  return j(fileInfo.source)
    .find(j.LogicalExpression, {
      operator: '||',
      left: {
        type: 'MemberExpression',
        object: { name: 'user' },
        property: { name: 'nickname' }
      },
      right: {
        type: 'MemberExpression', 
        object: { name: 'user' },
        property: { name: 'username' }
      }
    })
    .replaceWith(
      j.callExpression(
        j.identifier('getUserDisplayName'),
        [j.identifier('user')]
      )
    )
    .toSource();
};
```

## 团队约定

1. **强制使用工具函数**：所有用户信息显示必须使用 `userDisplayUtils` 中的函数
2. **代码审查重点**：重点检查用户信息相关的字符串操作
3. **测试覆盖**：确保所有用户信息显示场景都有测试覆盖
4. **文档更新**：及时更新开发文档，说明正确的使用方式

## 监控和预防

1. **CI/CD 集成**：在构建流程中集成 ESLint 检查
2. **Pre-commit Hook**：使用 husky 在提交前运行检查
3. **IDE 集成**：配置 IDE 实时显示 ESLint 警告
4. **定期审查**：定期审查代码库，查找潜在问题

通过这些规则和最佳实践，可以有效防止 "undefinedundefined" 等字符串拼接问题的再次出现。
