# 存储迁移测试指南

## 📋 测试概述

本文档提供存储架构迁移（auth-store → unified-store）的完整测试指南。

---

## 🧪 自动化测试

### 运行单元测试

```bash
npm test src/utils/__tests__/storageMigration.test.ts
```

### 测试覆盖范围

- ✅ 基本迁移功能
- ✅ AuthStatus枚举转换
- ✅ 会话状态迁移
- ✅ 边界情况处理
- ✅ 备份和回滚机制
- ✅ 数据验证
- ✅ 清理功能

---

## 🔍 手动测试

### 测试场景1：首次迁移（有旧数据）

**前置条件**：
- 用户之前使用过旧版auth-store
- localStorage中存在`wenpai-auth-store-v2`数据

**测试步骤**：

1. **准备测试数据**
   ```javascript
   // 在浏览器控制台执行
   const legacyData = {
     state: {
       user: {
         id: '6882df3f2f9efaa6e241dce5',
         username: 'testuser',
         email: 'test@example.com',
         subscription: { tier: 'pro' }
       },
       isAuthenticated: true,
       authStatus: 'authenticated',
       sessionWarning: false,
       sessionRemainingTime: 3600,
       sessionExpiresAt: Date.now() + 3600000
     },
     version: 1
   };
   
   localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));
   console.log('✅ 旧版数据已设置');
   ```

2. **刷新页面触发迁移**
   ```bash
   # 按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows) 强制刷新
   ```

3. **检查迁移日志**
   ```javascript
   // 在控制台查看日志
   // 应该看到：
   // 🔄 执行存储架构迁移...
   // 📖 读取到旧版数据: { hasUser: true, isAuthenticated: true, version: 1 }
   // 🔄 数据转换完成: { hasUser: true, hasSession: true }
   // 💾 旧数据已备份: wenpai-auth-store-v2-backup-[timestamp]
   // ✅ 数据已写入unified-store
   // ✅ 存储架构迁移完成: 迁移成功
   ```

4. **验证迁移结果**
   ```javascript
   // 检查unified-store数据
   const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store'));
   console.log('Unified Store数据:', unifiedData);
   
   // 验证用户信息
   console.assert(unifiedData.state.user.id === '6882df3f2f9efaa6e241dce5', '用户ID匹配');
   console.assert(unifiedData.state.user.authStatus === 'authenticated', 'AuthStatus正确');
   
   // 验证会话状态
   console.assert(unifiedData.state.session.sessionRemainingTime === 3600, '会话时间正确');
   
   // 检查备份
   const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('wenpai-auth-store-v2-backup-'));
   console.log('备份数量:', backupKeys.length);
   console.assert(backupKeys.length > 0, '已创建备份');
   
   console.log('✅ 所有验证通过');
   ```

**预期结果**：
- ✅ 迁移成功日志
- ✅ unified-store包含正确的用户数据
- ✅ 会话状态正确迁移
- ✅ 创建了备份数据

---

### 测试场景2：重复迁移（已有unified-store数据）

**前置条件**：
- unified-store已有用户数据

**测试步骤**：

1. **准备测试环境**
   ```javascript
   // 设置unified-store数据
   const unifiedData = {
     state: {
       user: { id: 'existing-user-123', username: 'existing' },
       session: { sessionWarning: false, sessionRemainingTime: 0, sessionExpiresAt: null }
     },
     version: 2
   };
   localStorage.setItem('wenpai-unified-store', JSON.stringify(unifiedData));
   
   // 设置旧版数据
   const legacyData = {
     state: {
       user: { id: 'old-user-456', username: 'old' },
       isAuthenticated: true
     },
     version: 1
   };
   localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));
   ```

2. **刷新页面**

3. **验证结果**
   ```javascript
   const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store'));
   console.assert(unifiedData.state.user.id === 'existing-user-123', 'unified-store数据未被覆盖');
   console.log('✅ 跳过迁移，保留现有数据');
   ```

**预期结果**：
- ✅ 日志显示"无需迁移"
- ✅ unified-store数据未被覆盖

---

### 测试场景3：无旧数据迁移

**前置条件**：
- localStorage中没有`wenpai-auth-store-v2`

**测试步骤**：

1. **清空旧数据**
   ```javascript
   localStorage.removeItem('wenpai-auth-store-v2');
   localStorage.removeItem('wenpai-unified-store');
   ```

2. **刷新页面**

3. **检查日志**
   ```javascript
   // 应该看到：
   // ℹ️ 未找到旧版auth-store数据，跳过迁移
   ```

**预期结果**：
- ✅ 日志显示"无需迁移"
- ✅ 应用正常启动

---

### 测试场景4：AuthStatus枚举转换

**测试步骤**：

```javascript
// 测试所有AuthStatus转换
const testCases = [
  { input: 'authenticated', expected: 'authenticated' },
  { input: 'authenticating', expected: 'authenticating' },
  { input: 'error', expected: 'error' },
  { input: 'unauthenticated', expected: 'unauthenticated' },
  { input: undefined, expected: 'unauthenticated' }
];

for (const testCase of testCases) {
  localStorage.clear();
  
  const legacyData = {
    state: {
      user: { id: 'test' },
      isAuthenticated: testCase.input === 'authenticated',
      authStatus: testCase.input
    },
    version: 1
  };
  
  localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));
  
  // 刷新页面
  location.reload();
  
  // 等待迁移完成后验证
  setTimeout(() => {
    const unifiedData = JSON.parse(localStorage.getItem('wenpai-unified-store'));
    console.assert(
      unifiedData.state.user.authStatus === testCase.expected,
      `AuthStatus转换正确: ${testCase.input} → ${testCase.expected}`
    );
  }, 1000);
}
```

**预期结果**：
- ✅ 所有AuthStatus正确转换

---

## 🔧 功能测试

### 测试1：用户登录后数据持久化

**测试步骤**：

1. 清空localStorage
2. 执行用户登录
3. 刷新页面
4. 验证用户状态保持登录

**验证点**：
- ✅ 用户信息保存到unified-store
- ✅ 会话状态正确
- ✅ 刷新后状态保持

### 测试2：会话管理功能

**测试步骤**：

1. 登录用户
2. 触发会话警告
3. 延长会话
4. 验证会话状态更新

**验证点**：
- ✅ sessionWarning正确设置
- ✅ sessionRemainingTime正确更新
- ✅ sessionExpiresAt正确计算

### 测试3：兼容层功能

**测试步骤**：

```javascript
// 使用旧的useAuthStore API
import { useAuthStore } from '@/stores/compatibility-layer';

const authStore = useAuthStore();

// 验证状态属性
console.log('User:', authStore.user);
console.log('IsAuthenticated:', authStore.isAuthenticated);
console.log('AuthStatus:', authStore.authStatus);
console.log('SessionWarning:', authStore.sessionWarning);

// 验证操作方法
authStore.setSessionWarning(true);
authStore.setSessionRemainingTime(1800);
authStore.extendSession();
```

**验证点**：
- ✅ 所有状态属性可访问
- ✅ 所有操作方法正常工作
- ✅ 显示废弃警告

---

## 📊 性能测试

### 测试迁移性能

```javascript
console.time('存储迁移');

// 准备大量数据
const legacyData = {
  state: {
    user: {
      id: 'test-user',
      // ... 大量用户数据
    },
    isAuthenticated: true,
    // ... 其他数据
  },
  version: 1
};

localStorage.setItem('wenpai-auth-store-v2', JSON.stringify(legacyData));

// 刷新页面触发迁移
location.reload();

// 在控制台查看时间
console.timeEnd('存储迁移');
```

**性能指标**：
- ✅ 迁移时间 < 100ms
- ✅ 不阻塞应用启动
- ✅ 异步执行

---

## ✅ 测试检查清单

### 基本功能
- [ ] 首次迁移成功
- [ ] 重复迁移跳过
- [ ] 无旧数据跳过
- [ ] AuthStatus正确转换
- [ ] 会话状态正确迁移
- [ ] 用户信息正确迁移

### 安全机制
- [ ] 自动备份旧数据
- [ ] 迁移失败回滚
- [ ] 数据验证通过
- [ ] 错误日志记录

### 兼容性
- [ ] 兼容层正常工作
- [ ] 旧代码无需修改
- [ ] 废弃警告显示

### 性能
- [ ] 迁移时间合理
- [ ] 不阻塞应用启动
- [ ] 异步执行

---

## 🐛 常见问题

### 问题1：迁移后用户未登录

**原因**：旧版数据格式不正确

**解决**：
```javascript
// 检查旧版数据格式
const legacyData = JSON.parse(localStorage.getItem('wenpai-auth-store-v2'));
console.log('旧版数据:', legacyData);

// 确保包含必要字段
console.assert(legacyData.state.user, '缺少user字段');
console.assert(legacyData.state.user.id, '缺少user.id字段');
```

### 问题2：迁移失败

**原因**：数据验证失败

**解决**：
```javascript
// 查看错误日志
// 检查备份数据
const backupKeys = Object.keys(localStorage).filter(k => k.startsWith('wenpai-auth-store-v2-backup-'));
console.log('备份:', backupKeys);

// 手动恢复
const latestBackup = backupKeys.sort().reverse()[0];
const backupData = localStorage.getItem(latestBackup);
localStorage.setItem('wenpai-auth-store-v2', backupData);
```

---

## 📝 测试报告模板

```markdown
# 存储迁移测试报告

## 测试环境
- 浏览器：Chrome 120
- 操作系统：macOS 14
- 测试日期：2024-01-XX

## 测试结果

### 自动化测试
- 单元测试：✅ 通过 (XX/XX)
- 覆盖率：XX%

### 手动测试
- 场景1：首次迁移 - ✅ 通过
- 场景2：重复迁移 - ✅ 通过
- 场景3：无旧数据 - ✅ 通过
- 场景4：枚举转换 - ✅ 通过

### 功能测试
- 用户登录 - ✅ 通过
- 会话管理 - ✅ 通过
- 兼容层 - ✅ 通过

### 性能测试
- 迁移时间：XX ms
- 应用启动：不受影响

## 问题记录
- 无

## 结论
✅ 所有测试通过，迁移功能正常
```

---

**测试完成后，请将测试报告提交到项目文档中。**

