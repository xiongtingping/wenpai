# 🛡️ 开发规范 - undefined拼接防护指南

## 🚨 核心原则

### 绝对禁止的操作
```typescript
// 🚫 绝对禁止：直接拼接用户属性
user?.nickname || user?.username
user?.nickname + user?.username
`${user?.nickname}的头像`
user?.nickname?.charAt(0) || user?.username?.charAt(0)
```

### 强制使用的安全模式
```typescript
// ✅ 强制使用：安全工具函数
import { getUserDisplayName, getUserAvatar, getUserAltText } from '@/utils/userDisplayUtils';

const displayName = getUserDisplayName(user, '访客');
const avatarUrl = getUserAvatar(user);
const altText = getUserAltText(user, '头像');
```

## 📋 安全工具函数清单

### 用户信息显示
- `getUserDisplayName(user, fallback)` - 获取用户显示名称
- `getUserAvatar(user)` - 获取用户头像URL
- `getUserAvatarFallback(user, fallback)` - 获取头像fallback文字
- `getUserEmail(user, fallback)` - 获取用户邮箱
- `getUserPhone(user, fallback)` - 获取用户手机号
- `getUserId(user, fallback)` - 获取用户ID
- `getUserUsername(user, fallback)` - 获取用户名

### UI辅助函数
- `getUserAltText(user, context)` - 生成安全的alt文本
- `getUserPlaceholder(fieldName)` - 生成安全的placeholder文本
- `getUserTitle(user, context)` - 生成安全的title属性
- `getUserAriaLabel(user, element, action)` - 生成安全的aria-label

### 数据处理函数
- `formatUserForDisplay(user)` - 格式化用户信息用于显示
- `isUserInfoComplete(user)` - 检查用户信息完整性

## 🔧 使用规范

### 1. 用户名显示
```typescript
// ❌ 错误
const name = user?.nickname || user?.username || '未知用户';

// ✅ 正确
const name = getUserDisplayName(user, '未知用户');
```

### 2. 头像处理
```typescript
// ❌ 错误
<img 
  src={user?.avatar || user?.photo} 
  alt={`${user?.nickname}的头像`}
/>

// ✅ 正确
<img 
  src={getUserAvatar(user)} 
  alt={getUserAltText(user, '头像')}
/>
```

### 3. 表单初始化
```typescript
// ❌ 错误
const [form, setForm] = useState({
  nickname: user?.nickname || user?.username || ''
});

// ✅ 正确
const [form, setForm] = useState({
  nickname: getUserDisplayName(user, '')
});
```

### 4. 模板字符串
```typescript
// ❌ 错误
const greeting = `欢迎，${user?.nickname || user?.username}！`;

// ✅ 正确
const greeting = `欢迎，${getUserDisplayName(user, '用户')}！`;
```

### 5. 存储键名
```typescript
// ❌ 错误
const key = `user_${user?.id}_data`;

// ✅ 正确
const key = `user_${getUserId(user, 'anonymous')}_data`;
```

## 🛠️ 开发工具配置

### ESLint规则
在`eslint.config.js`中启用：
```javascript
'undefined-concat/no-unsafe-user-concat': 'error',
'undefined-concat/require-safe-user-access': 'warn'
```

### TypeScript配置
确保启用严格模式：
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true
  }
}
```

### 运行时检测
在开发环境中自动启用undefined拼接检测器：
```typescript
// main.tsx
if (import.meta.env.DEV) {
  import('./utils/undefinedConcatDetector');
}
```

## 📝 代码审查要求

### 必检项目
1. **用户属性访问**：是否使用安全工具函数
2. **fallback值**：是否提供合适的默认值
3. **模板字符串**：是否避免直接使用用户属性
4. **JSX属性**：alt、title、placeholder是否安全处理

### 审查清单
- [ ] 无直接用户属性拼接
- [ ] 所有用户信息显示使用安全工具函数
- [ ] 提供合适的fallback值
- [ ] ESLint检查无相关错误
- [ ] 运行时无undefined拼接警告

## 🚀 最佳实践示例

### 用户头像组件
```typescript
// src/components/auth/UserAvatar.tsx
import { getUserDisplayName, getUserAvatar, getUserAvatarFallback } from '@/utils/userDisplayUtils';

export function UserAvatar({ user, size = 'md' }) {
  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage
        src={getUserAvatar(user)}
        alt={getUserDisplayName(user, '用户头像')}
      />
      <AvatarFallback>
        {getUserAvatarFallback(user)}
      </AvatarFallback>
    </Avatar>
  );
}
```

### 用户信息表单
```typescript
// 表单初始化
const [profileForm, setProfileForm] = useState({
  nickname: getUserDisplayName(user, ''),
  email: getUserEmail(user, ''),
  phone: getUserPhone(user, '')
});

// 头像生成
const getAvatarUrl = () => {
  if (profileForm.avatar) return profileForm.avatar;
  const safeName = profileForm.nickname || getUserDisplayName(user, 'User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${safeName}`;
};
```

## ⚠️ 常见陷阱

### 1. 逻辑或运算符陷阱
```typescript
// ❌ 当两个都是undefined时返回undefined
user?.nickname || user?.username

// ✅ 安全处理
getUserDisplayName(user, '访客')
```

### 2. 模板字符串隐式转换
```typescript
// ❌ undefined会变成"undefined"
`${user?.nickname}的资料`

// ✅ 安全处理
getUserAltText(user, '资料')
```

### 3. 数组操作陷阱
```typescript
// ❌ 可能包含undefined
[user?.nickname, user?.username].join(' ')

// ✅ 过滤undefined
[user?.nickname, user?.username].filter(Boolean).join(' ')
// 或者使用安全函数
getUserDisplayName(user, '')
```

## 🔍 调试和监控

### 开发环境检测
```typescript
// 自动检测undefined拼接
import { checkUndefinedConcat } from '@/utils/undefinedConcatDetector';

// 在关键位置添加检查
const result = someUserOperation();
checkUndefinedConcat(result, 'someUserOperation');
```

### 生产环境监控
```typescript
// 在错误边界中捕获相关错误
if (error.message.includes('undefined')) {
  console.error('可能的undefined拼接问题:', error);
}
```

## 📚 参考资源

- **工具函数文档**: `src/utils/userDisplayUtils.ts`
- **检测器文档**: `src/utils/undefinedConcatDetector.ts`
- **代码审查清单**: `CODE_REVIEW_CHECKLIST.md`
- **ESLint规则**: `src/utils/eslint-undefined-concat-rules.js`

## 🎯 目标效果

遵循本规范后，项目应达到：
1. **零undefined拼接问题**
2. **统一的用户信息处理**
3. **可维护的代码结构**
4. **自动化的问题检测**
5. **完善的错误预防机制**
