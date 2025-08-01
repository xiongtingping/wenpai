# 团队编码规范 - 字符串安全处理

## 🎯 目标
防止 `undefinedundefined` 等字符串拼接问题，确保用户信息显示的安全性和一致性。

## 📋 强制规范

### 1. 用户信息显示 🔒 CRITICAL
```typescript
// ✅ 必须使用
import { safeGetUserDisplayName } from '@/utils/undefinedProblemSolution';

// ❌ 禁止使用
const name = user.nickname || user.username;           // 可能返回 undefined
const name = `${user.nickname}${user.username}`;       // 可能产生 undefinedundefined
const name = user.nickname + user.username;            // 可能产生 undefinedundefined
```

### 2. 字符串拼接 🔒 CRITICAL
```typescript
// ✅ 安全拼接
const fullName = [user.firstName, user.lastName]
  .filter(name => name && name !== 'undefined')
  .join(' ') || '用户';

// ✅ 使用安全函数
const text = safeStringProcess(value, '默认值');

// ❌ 危险拼接
const fullName = `${user.firstName}${user.lastName}`;  // 禁止
const text = value + '';                                // 禁止
```

### 3. 模板字符串 🔒 CRITICAL
```typescript
// ✅ 安全使用
const message = `欢迎 ${safeGetUserDisplayName(user)} 回来！`;

// ❌ 直接使用
const message = `欢迎 ${user.nickname} 回来！`;         // 禁止
```

## 🛡️ 防护措施

### 1. 组件包装
```typescript
// ✅ 推荐：包装敏感组件
import UndefinedFixer from '@/components/UndefinedFixer';

const UserProfile = ({ user }) => (
  <UndefinedFixer>
    <div>{safeGetUserDisplayName(user)}</div>
  </UndefinedFixer>
);
```

### 2. 类型定义
```typescript
// ✅ 严格类型定义
interface SafeUserInfo {
  id: string;
  username: string;    // 非可选，确保有值
  nickname: string;    // 非可选，确保有值
  email?: string;      // 可选字段明确标记
}

// ❌ 松散类型定义
interface UserInfo {
  nickname?: string;   // 可能导致 undefined 拼接
  username?: string;   // 可能导致 undefined 拼接
}
```

## 🧪 测试要求

### 1. 单元测试 🔒 REQUIRED
```typescript
// 每个用户信息显示组件必须包含此测试
describe('UserComponent', () => {
  it('应该安全处理 undefined 用户字段', () => {
    const user = { nickname: undefined, username: undefined };
    const { getByText } = render(<UserComponent user={user} />);
    
    // 确保不包含 'undefined' 文本
    expect(document.body.textContent).not.toContain('undefined');
  });
});
```

### 2. 集成测试
```typescript
// 页面级测试必须验证字符串安全
it('页面不应包含 undefinedundefined', () => {
  render(<PageComponent />);
  expect(document.body.textContent).not.toContain('undefinedundefined');
});
```

## 🔍 代码审查清单

### 审查要点
- [ ] 是否使用了 `safeGetUserDisplayName()` 处理用户信息？
- [ ] 是否有直接的字符串拼接操作？
- [ ] 是否在模板字符串中直接使用用户字段？
- [ ] 是否为新的用户字段提供了默认值？
- [ ] 是否添加了相应的单元测试？

### 自动检查
```bash
# 在 CI/CD 中运行
npm run lint:undefined-check
npm run test:undefined-safety
```

## 🚨 违规处理

### 严重程度分级
1. **CRITICAL**: 直接拼接用户字段 → 必须立即修复
2. **HIGH**: 缺少安全检查 → 24小时内修复
3. **MEDIUM**: 缺少测试覆盖 → 一周内修复

### 处理流程
1. 自动检测工具标记问题
2. 代码审查阶段拦截
3. 强制要求修复后才能合并

## 📚 学习资源

### 必读文档
- [完整问题分析](./UNDEFINED_PROBLEM_COMPLETE_ANALYSIS.md)
- [防护系统指南](./UNDEFINED_PROTECTION_GUIDE.md)
- [修复总结](./UNDEFINED_FIX_SUMMARY.md)

### 培训材料
- 字符串安全处理最佳实践
- undefined 问题案例分析
- 防护工具使用教程

## 🔧 工具支持

### IDE 插件
```json
// .vscode/settings.json
{
  "eslint.rules": {
    "no-template-curly-in-string": "error",
    "no-undefined-concat": "error"
  }
}
```

### ESLint 规则
```javascript
// .eslintrc.js
module.exports = {
  rules: {
    // 禁止直接拼接可能为 undefined 的值
    'no-unsafe-string-concat': 'error',
    // 要求使用安全工具函数
    'require-safe-user-display': 'error'
  }
};
```

## 📊 监控指标

### 关键指标
- 页面 `undefined` 检测次数
- 修复器触发频率
- 用户反馈问题数量
- 代码审查通过率

### 告警阈值
- 单页面修复次数 > 5 → 警告
- 全站修复次数 > 50 → 严重警告
- 用户反馈问题 > 0 → 立即处理

## 🎯 目标和考核

### 团队目标
- 零 `undefinedundefined` 问题上线
- 100% 代码审查覆盖率
- 90% 以上测试覆盖率

### 个人考核
- 代码规范遵守率
- 问题修复及时性
- 测试用例完整性

## 📅 实施计划

### 第一阶段（已完成）
- [x] 建立防护系统
- [x] 制定编码规范
- [x] 创建工具函数

### 第二阶段（进行中）
- [ ] 团队培训
- [ ] 工具集成
- [ ] 自动化检查

### 第三阶段（计划中）
- [ ] 生产监控
- [ ] 持续优化
- [ ] 经验总结

---

## 🤝 团队承诺

我们承诺：
1. **严格遵守**字符串安全处理规范
2. **主动学习**相关最佳实践
3. **积极参与**代码审查和改进
4. **及时反馈**发现的问题和建议

**记住：每一行代码都关乎用户体验！** 🎯
