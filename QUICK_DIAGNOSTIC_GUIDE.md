# Token使用量显示为0 - 快速诊断指南

## 🚀 立即诊断（3分钟）

### 方法1: 使用诊断页面（推荐）

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问诊断页面**
   ```
   http://localhost:5173/token-diagnostic
   ```

3. **查看诊断结果**
   - 🗄️ **数据库检查**: 查看是否有Token使用记录
   - 🏪 **Store状态检查**: 查看状态是否正确初始化
   - 💾 **localStorage检查**: 查看持久化数据
   - 💡 **诊断结论**: 自动分析问题根因

4. **根据诊断结论采取行动**

---

### 方法2: 使用浏览器控制台

1. **打开浏览器控制台** (F12)

2. **执行诊断命令**
   ```javascript
   // 获取当前用户ID
   const userId = JSON.parse(localStorage.getItem('wenpai-unified-store'))?.state?.user?.id;
   console.log('用户ID:', userId);
   
   // 执行诊断
   window.diagnoseTokenUsage(userId);
   ```

3. **查看诊断报告**
   - 控制台会打印详细的诊断信息
   - 包括数据库记录、Store状态、建议等

---

## 🔍 常见问题与解决方案

### 问题1: 数据库中无Token使用记录

**症状**: 诊断显示 "记录数: 0"

**可能原因**:
1. 还未进行任何AI调用
2. `recordTokenUsage` 写入失败
3. 用户ID不匹配

**解决方案**:
1. **执行一次AI调用**（如内容适配）
2. **检查控制台日志**，查找以下关键词：
   - "💾 开始Token使用量记录"
   - "✅ Supabase数据库保存成功"
   - "❌ Token使用量记录失败"
3. **检查Supabase连接**
   ```javascript
   // 在控制台执行
   import('@/services/supabaseDataService').then(async ({ getSupabaseClient, TABLE_NAMES }) => {
     const client = await getSupabaseClient();
     const { data, error } = await client.from('token_usage_records').select('count');
     console.log('Supabase连接测试:', { data, error });
   });
   ```

---

### 问题2: 数据库有记录但Store未初始化

**症状**: 诊断显示 "数据库记录数 > 0" 但 "Token统计: ❌ 未初始化"

**可能原因**:
1. `initializeUsageStats` 未被调用
2. `initializeUsageStats` 调用失败
3. 状态更新逻辑有问题

**解决方案**:
1. **检查初始化日志**，查找：
   - "🔄 Store.initializeUsageStats 开始"
   - "✅ Store 获取到统计数据"
   - "✅ Token统计已初始化"
2. **手动触发初始化**
   ```javascript
   // 在控制台执行
   import('@/stores/unified-state-store').then(({ useUnifiedStore }) => {
     const store = useUnifiedStore.getState();
     const userId = store.user.id;
     const userTier = store.user.subscription;
     store.initializeUsageStats(userId, userTier);
   });
   ```
3. **等待5秒后刷新页面**

---

### 问题3: 数据库有记录且Store已初始化，但统计为0

**症状**: 诊断显示 "monthlyUsed: 0" 但数据库 "总Token数 > 0"

**可能原因**:
1. 查询时间范围不匹配（跨月问题）
2. 字段名不匹配（`total_tokens` vs `totalTokens`）
3. 数据类型转换问题

**解决方案**:
1. **检查数据库记录的时间戳**
   ```javascript
   // 在诊断页面查看样本记录的timestamp字段
   // 确认是否在当前月份
   ```
2. **检查字段名**
   ```javascript
   // 在控制台执行
   import('@/services/supabaseDataService').then(async ({ getSupabaseClient }) => {
     const client = await getSupabaseClient();
     const { data } = await client.from('token_usage_records').select('*').limit(1);
     console.log('字段名:', Object.keys(data[0]));
   });
   ```
3. **手动刷新统计**
   ```javascript
   import('@/stores/unified-state-store').then(({ useUnifiedStore }) => {
     useUnifiedStore.getState().refreshUsageStats();
   });
   ```

---

## 📊 验证修复效果

### 步骤1: 清除缓存
```javascript
// 在控制台执行
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### 步骤2: 重新登录
- 访问 http://localhost:5173/login
- 登录你的账号

### 步骤3: 检查初始化
1. 打开控制台
2. 查找日志：
   - "🔄 Store.initializeUsageStats 开始"
   - "✅ Token统计已初始化"
3. 检查状态：
   ```javascript
   import('@/stores/unified-state-store').then(({ useUnifiedStore }) => {
     const state = useUnifiedStore.getState();
     console.log('Token统计:', state.tokenUsage.currentStats);
   });
   ```

### 步骤4: 执行AI调用
1. 访问内容适配器页面
2. 输入内容并生成
3. 等待生成完成

### 步骤5: 验证更新
1. 查找日志：
   - "📢 已触发Token使用量更新事件"
   - "🔄 自动刷新Token使用量统计..."
   - "✅ 统计数据刷新完成"
2. 访问诊断页面查看最新数据
3. 访问个人资料页面查看显示

---

## 🛠️ 高级诊断

### 检查完整数据流

```javascript
// 1. 检查数据库写入
import('@/services/tokenUsageService').then(async ({ tokenUsageService }) => {
  await tokenUsageService.recordTokenUsage({
    userId: 'YOUR_USER_ID',
    feature: 'test',
    model: 'gpt-4',
    inputTokens: 100,
    outputTokens: 200,
    totalTokens: 300,
    success: true
  });
  console.log('✅ 测试写入完成');
});

// 2. 检查数据库查询
import('@/services/tokenUsageService').then(async ({ tokenUsageService }) => {
  const stats = await tokenUsageService.getUserTokenStats('YOUR_USER_ID', 'trial');
  console.log('📊 查询结果:', stats);
});

// 3. 检查状态更新
import('@/stores/unified-state-store').then(({ useUnifiedStore }) => {
  const store = useUnifiedStore.getState();
  store.updateTokenStats({
    userId: 'YOUR_USER_ID',
    userTier: 'trial',
    monthlyLimit: 100000,
    monthlyUsed: 1000,
    monthlyRemaining: 99000,
    dailyUsed: 500,
    usagePercentage: 1,
    needUpgrade: false,
    lastUpdated: new Date().toISOString()
  });
  console.log('✅ 状态更新完成');
});

// 4. 检查UI显示
import('@/hooks/useUsage').then(({ useTokenStats }) => {
  // 需要在React组件中使用
  console.log('请在React组件中使用useTokenStats Hook');
});
```

---

## 📞 获取帮助

如果以上方法都无法解决问题，请提供以下信息：

1. **诊断页面截图** (http://localhost:5173/token-diagnostic)
2. **控制台日志** (包含错误信息)
3. **用户信息**
   ```javascript
   import('@/stores/unified-state-store').then(({ useUnifiedStore }) => {
     const user = useUnifiedStore.getState().user;
     console.log('用户信息:', {
       id: user.id,
       subscription: user.subscription,
       email: user.email
     });
   });
   ```
4. **数据库记录样本** (从诊断页面复制)

---

**最后更新**: 2025-10-05  
**诊断工具版本**: 1.0.0  
**修复状态**: 已实施核心修复，等待验证

