# 支付双重验证机制

## 📋 背景

在支付流程中，我们依赖Bufpay的webhook通知来更新订单状态和开通用户权限。但是webhook通知可能因为以下原因失败：

1. **网络问题** - Bufpay无法访问我们的服务器
2. **服务器故障** - Netlify Functions临时不可用
3. **配置错误** - Webhook URL配置错误
4. **签名验证失败** - 回调签名不匹配

当webhook失败时，即使用户已经支付成功，订单状态仍然是`pending`，用户无法获得订阅权限。

## 🔧 解决方案：双重验证机制

我们实现了**双保险机制**，确保即使webhook失败，订单状态也能正确更新：

### 方案1: Webhook通知（被动接收）
- Bufpay支付成功后主动推送通知到我们的服务器
- 接口：`/.netlify/functions/bufpay-notify`
- 优点：实时性好，无需轮询
- 缺点：依赖网络稳定性，可能失败

### 方案2: 主动查询（主动轮询）
- 前端定时查询Bufpay接口获取支付状态
- 接口：`https://bufpay.com/api/query/{aoid}`
- 优点：不依赖webhook，更可靠
- 缺点：有轮询延迟（3秒间隔）

## 🚀 实现细节

### 1. 前端轮询逻辑（PaymentModal.tsx）

```typescript
const pollPaymentStatus = async () => {
  // 方法1: 查询数据库订单状态（依赖webhook）
  const dbStatus = await BufPayService.checkOrderStatus(orderId);
  
  // 方法2: 主动查询Bufpay接口（双保险）
  const bufpayStatus = await BufPayService.queryBufPayStatus(aoid);
  
  // 如果Bufpay显示已支付，但数据库未更新
  if (bufpayStatus === 'payed' && !dbStatus.isPaid) {
    // 触发手动修复
    await fetch('/.netlify/functions/repair-order', {
      method: 'POST',
      body: JSON.stringify({ orderId, aoid })
    });
  }
};

// 每3秒轮询一次
setInterval(pollPaymentStatus, 3000);
```

### 2. Bufpay状态查询（BufPayService.ts）

```typescript
static async queryBufPayStatus(aoid: string): Promise<string | null> {
  // 通过代理查询
  const proxyUrl = PaymentConfigAccessor.getBufPayProxyURL(aoid);
  const response = await fetch(proxyUrl);
  const result = await response.json();
  
  // 返回状态：not_exist, new, payed, success, fee_error, expire
  return result.status;
}
```

### 3. 手动修复接口（repair-order.js）

```javascript
exports.handler = async (event) => {
  const { orderId, aoid } = JSON.parse(event.body);
  
  // 1. 验证Bufpay支付状态
  const bufpayStatus = await queryBufPayStatus(aoid);
  if (bufpayStatus !== 'payed' && bufpayStatus !== 'success') {
    return { error: 'Bufpay显示订单未支付' };
  }
  
  // 2. 更新订单状态
  await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('order_id', orderId);
  
  // 3. 开通订阅权限
  await processOrderPermissions(order);
  
  // 4. 标记订单为已处理
  await supabase
    .from('orders')
    .update({ status: 'processed' })
    .eq('order_id', orderId);
};
```

## 📊 Bufpay状态说明

| 状态 | 说明 | 处理方式 |
|------|------|----------|
| `not_exist` | 订单不存在 | 显示错误 |
| `new` | 新订单，未支付 | 继续等待 |
| `payed` | 已支付，未回调 | **触发手动修复** |
| `success` | 已支付，已回调 | 正常流程 |
| `fee_error` | 手续费扣除失败 | 显示错误 |
| `expire` | 订单已过期 | 显示超时 |

## 🔄 完整流程

```
用户扫码支付
    ↓
支付成功
    ↓
┌─────────────────────────────────────┐
│  方案1: Webhook通知（被动）          │
│  Bufpay → /.netlify/functions/      │
│           bufpay-notify             │
│  ✅ 成功 → 更新订单 → 开通权限       │
│  ❌ 失败 → 订单状态仍为pending       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  方案2: 主动查询（主动）             │
│  前端轮询 → 查询Bufpay接口           │
│  检测到已支付但订单未更新            │
│  ↓                                  │
│  调用 /.netlify/functions/          │
│       repair-order                  │
│  ↓                                  │
│  验证Bufpay状态 → 更新订单 → 开通权限│
└─────────────────────────────────────┘
    ↓
订单状态更新为processed
用户获得订阅权限
```

## 🛠️ 手动修复工具

如果需要手动修复订单，可以使用以下脚本：

```bash
# 查询订单详情
node scripts/queryOrderDetails.mjs <orderId>

# 手动修复订单
node scripts/repairOrder.mjs <orderId>
```

## 📝 注意事项

1. **轮询间隔**: 3秒一次，避免过于频繁
2. **最大重试**: 10次失败后停止轮询
3. **安全验证**: 修复前必须验证Bufpay状态
4. **幂等性**: 重复调用不会重复开通权限
5. **日志记录**: 所有操作都有详细日志

## 🔍 问题排查

### 问题1: 订单显示pending但用户已支付

**排查步骤**:
1. 查看Bufpay后台webhook通知状态
2. 检查Netlify Functions日志
3. 使用脚本查询订单详情
4. 手动修复订单

**命令**:
```bash
# 1. 查询订单详情
node scripts/queryOrderDetails.mjs WP17598219893961884

# 2. 查询Bufpay状态
curl https://bufpay.com/api/query/<aoid>

# 3. 手动修复
node scripts/repairOrder.mjs WP17598219893961884
```

### 问题2: 前端轮询不工作

**排查步骤**:
1. 检查浏览器控制台日志
2. 确认`aoid`是否正确传递
3. 检查网络请求是否成功
4. 验证Bufpay查询接口是否可访问

### 问题3: 手动修复失败

**可能原因**:
1. Bufpay显示订单未支付
2. 数据库连接失败
3. 订阅表结构不匹配
4. 权限不足

## 📈 监控指标

建议监控以下指标：

1. **Webhook成功率**: 成功通知数 / 总支付数
2. **手动修复次数**: 触发repair-order的次数
3. **订单修复延迟**: 支付成功到订单更新的时间
4. **轮询失败率**: 查询Bufpay接口失败的比例

## 🎯 未来优化

1. **实时通知**: 使用WebSocket实现实时状态推送
2. **智能重试**: 根据失败原因调整重试策略
3. **告警机制**: Webhook失败时发送告警通知
4. **数据分析**: 分析webhook失败的原因和模式

