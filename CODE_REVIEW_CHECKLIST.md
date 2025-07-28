# 🔍 代码审查清单 - undefined拼接防护

## 🚨 高优先级检查项

### 1. 用户信息显示安全检查
- [ ] **禁止直接拼接用户属性**
  ```typescript
  // ❌ 危险模式
  user?.nickname || user?.username
  user?.nickname + user?.username
  `${user?.nickname}的头像`
  
  // ✅ 安全模式
  getUserDisplayName(user, '访客')
  getUserAltText(user, '头像')
  ```

- [ ] **模板字符串安全检查**
  ```typescript
  // ❌ 危险：直接使用用户属性
  `欢迎，${user?.nickname}！`
  
  // ✅ 安全：使用工具函数
  `欢迎，${getUserDisplayName(user, '用户')}！`
  ```

- [ ] **JSX属性安全检查**
  ```typescript
  // ❌ 危险
  <img alt={user?.nickname || user?.username} />
  
  // ✅ 安全
  <img alt={getUserAltText(user, '头像')} />
  ```

### 2. 工具函数使用检查
- [ ] **必须使用安全工具函数**
  - `getUserDisplayName(user, fallback)` - 获取显示名称
  - `getUserAvatar(user)` - 获取头像URL
  - `getUserAvatarFallback(user)` - 获取头像fallback文字
  - `getUserAltText(user, context)` - 获取alt文本
  - `getUserPlaceholder(fieldName)` - 获取placeholder文本

- [ ] **fallback值必须提供**
  ```typescript
  // ❌ 缺少fallback
  getUserDisplayName(user)
  
  // ✅ 提供fallback
  getUserDisplayName(user, '访客')
  ```

### 3. 类型安全检查
- [ ] **用户对象类型检查**
  ```typescript
  // ✅ 使用统一的UserInfo类型
  import { UserInfo } from '@/utils/userDisplayUtils';
  
  function handleUser(user: UserInfo | null) {
    // 安全处理
  }
  ```

- [ ] **null/undefined处理**
  ```typescript
  // ✅ 正确的null检查
  if (!user) return fallback;
  
  // ✅ 可选链使用
  user?.roles?.includes('admin')
  ```

## 🛡️ 中优先级检查项

### 4. 字符串操作安全
- [ ] **避免直接字符串拼接**
  ```typescript
  // ❌ 危险
  const name = user.nickname + user.username;
  
  // ✅ 安全
  const name = getUserDisplayName(user, '');
  ```

- [ ] **数组join操作检查**
  ```typescript
  // ❌ 可能包含undefined
  [user.nickname, user.username].join(' ')
  
  // ✅ 过滤undefined
  [user.nickname, user.username].filter(Boolean).join(' ')
  ```

### 5. 表单和输入处理
- [ ] **表单初始值安全**
  ```typescript
  // ❌ 可能为undefined
  const [form, setForm] = useState({
    nickname: user?.nickname || user?.username
  });
  
  // ✅ 使用安全函数
  const [form, setForm] = useState({
    nickname: getUserDisplayName(user, '')
  });
  ```

- [ ] **placeholder和label安全**
  ```typescript
  // ✅ 使用专用函数
  <Input placeholder={getUserPlaceholder('nickname')} />
  ```

## 📋 低优先级检查项

### 6. 日志和调试
- [ ] **日志输出安全**
  ```typescript
  // ❌ 可能输出undefined
  console.log(`用户 ${user?.nickname} 执行了操作`);
  
  // ✅ 安全输出
  console.log(`用户 ${getUserDisplayName(user, '未知用户')} 执行了操作`);
  ```

### 7. 存储和缓存
- [ ] **localStorage键名安全**
  ```typescript
  // ❌ 可能包含undefined
  const key = `user_${user?.id}_data`;
  
  // ✅ 安全处理
  const key = `user_${getUserId(user, 'anonymous')}_data`;
  ```

## 🔧 自动化检查工具

### ESLint规则
确保启用以下ESLint规则：
```javascript
'undefined-concat/no-unsafe-user-concat': 'error',
'undefined-concat/require-safe-user-access': 'warn'
```

### 运行时检查
在开发环境中启用undefined拼接检测器：
```typescript
import { checkUndefinedConcat } from '@/utils/undefinedConcatDetector';
```

## 📚 参考资源

### 工具函数文档
- `src/utils/userDisplayUtils.ts` - 用户信息安全处理工具
- `src/utils/undefinedConcatDetector.ts` - 运行时检测工具

### 最佳实践示例
- `src/components/auth/UserAvatar.tsx` - 正确的用户头像组件
- `src/pages/ProfilePage.tsx` - 正确的用户信息显示

## ✅ 审查通过标准

代码审查通过需要满足：
1. 无直接用户属性拼接
2. 所有用户信息显示使用安全工具函数
3. 提供合适的fallback值
4. ESLint检查无相关错误
5. 运行时无undefined拼接警告

## 🚫 常见错误模式

### 绝对禁止的模式
```typescript
// 🚫 绝对禁止
user?.nickname || user?.username
user?.nickname + user?.username
`${user?.nickname}的资料`
user?.nickname?.charAt(0) || user?.username?.charAt(0)
```

### 推荐的替代方案
```typescript
// ✅ 推荐使用
getUserDisplayName(user, '访客')
getUserAvatarFallback(user, 'U')
getUserAltText(user, '资料')
```
