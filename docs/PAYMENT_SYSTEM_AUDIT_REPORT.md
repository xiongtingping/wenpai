# 统一支付系统审查报告

**审查日期**: 2025-10-03
**审查范围**: 支付流程统一管理、订单状态机、支付回调处理、异常订单清理
**审查方式**: 代码静态分析 + 架构评估

---

## 📊 执行摘要

### 审查结论
支付系统存在**17个关键问题**,涉及架构不统一、硬编码、国际化缺失、重复代码等多个维度。建议按优先级分3个阶段进行修复。

### 问题分级统计
- 🔴 **严重问题 (Critical)**: 5个 - 影响资金安全和系统稳定性
- 🟠 **高优先级 (High)**: 6个 - 影响用户体验和代码质量
- 🟡 **中优先级 (Medium)**: 4个 - 技术债务和优化机会
- 🔵 **低优先级 (Low)**: 2个 - 代码规范和文档完善

---

## 🏗️ 一、架构审查

### 1.1 当前架构概览

```
┌─────────────────────────────────────────────────────┐
│              前端支付页面层                          │
│  - PaymentPage.tsx                                  │
│  - PaymentQRCode.tsx                                │
│  - EnhancedPaymentStatusMonitor.tsx                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              支付服务层 (双轨制)                     │
│                                                      │
│  旧版: BufPayService (343行)                        │
│   - createPayment()                                 │
│   - queryPaymentStatus()                            │
│   - handlePaymentNotify()                           │
│                                                      │
│  新版: StandardBufPayService (307行)                │
│   - createPayment()                                 │
│   - queryPayment()                                  │
│   - verifyNotifySign()                              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              订单管理层 (双轨制)                     │
│                                                      │
│  旧版: OrderService (357行)                         │
│   - createOrder()                                   │
│   - markOrderAsPaid()                               │
│   - processOrderPermissions()                       │
│                                                      │
│  新版: StandardOrderService (352行)                 │
│   - createOrder()                                   │
│   - pollOrderStatus()                               │
│   - cancelOrder()                                   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              辅助服务层                              │
│  - OrderStatusService (236行) - 订单修复             │
│  - PaymentStatusService (449行) - 状态持久化         │
│  - PaymentDataCleanupService (365行) - 数据清理     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│              数据持久化层                            │
│  - Supabase (orders, user_subscriptions)           │
│  - LocalStorage (加密存储)                          │
└─────────────────────────────────────────────────────┘
```

### 1.2 架构问题

#### ❌ **C1: 支付服务双轨制** (严重)
**位置**:
- `src/services/bufpayService.ts` (旧版)
- `src/services/standardBufpayService.ts` (新版)

**问题描述**:
- 存在2套并行的支付服务实现,功能高度重叠
- 旧版使用自定义API (`/.netlify/functions/create-order`)
- 新版使用标准BufPay API (`https://api.bufpay.com`)
- 无明确的废弃计划和迁移路径

**影响**:
- 维护成本翻倍
- 容易出现功能不一致
- 开发者困惑选择哪个版本

#### ❌ **C2: 订单服务双轨制** (严重)
**位置**:
- `src/services/orderService.ts` (旧版)
- `src/services/standardOrderService.ts` (新版)

**问题描述**:
- 两套订单管理服务,数据模型略有差异
- 旧版订单状态: `pending | paid | failed | expired | processed`
- 新版订单状态: `pending | paid | failed | cancelled | refunded`
- 状态机不兼容,可能导致数据不一致

**影响**:
- 订单状态混乱
- 历史数据迁移困难
- 权限发放逻辑可能错误

#### ⚠️ **H1: 缺少统一入口服务** (高优先级)
**建议**: 参考AI服务架构,创建 `UnifiedPaymentService`:
```typescript
// 推荐架构
export class UnifiedPaymentService {
  async createPayment(params: PaymentRequest): Promise<PaymentResponse> {
    // 统一入口,内部根据配置选择provider
  }

  async handleCallback(data: CallbackData): Promise<void> {
    // 统一回调处理
  }

  async checkStatus(orderId: string): Promise<OrderStatus> {
    // 统一状态查询
  }
}
```

---

## 🔍 二、代码质量审查

### 2.1 硬编码问题

#### ❌ **C3: API端点硬编码** (严重)
**位置**: `bufpayService.ts:30, 323`

```typescript
// ❌ 问题代码
const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:5173' : '';
const queryUrl = `https://bufpay.com/api/query/${aoid}`;
```

**应该**:
```typescript
// ✅ 修复后
import { PAYMENT_CONFIG } from '@/config/paymentEndpoints';

const apiBaseUrl = PAYMENT_CONFIG.getBaseURL();
const queryUrl = PAYMENT_CONFIG.getQueryURL(aoid);
```

#### ⚠️ **H2: 配置值硬编码** (高优先级)
**位置**: `standardBufpayService.ts:32-38`

```typescript
// ❌ 问题代码
private static readonly API_BASE_URL = 'https://api.bufpay.com';
private static readonly NOTIFY_URL = `${window.location.origin}/.netlify/functions/payment-notify`;
```

**问题**:
- 使用 `window.location.origin` 在SSR环境会失败
- 应从环境变量统一管理

#### ⚠️ **H3: MD5签名未实现** (高优先级)
**位置**: `standardBufpayService.ts:220-224`

```typescript
// ❌ 问题代码
private static md5(str: string): string {
  // 这里应该使用真实的 MD5 实现
  return 'placeholder_md5_hash';  // ← 占位符,未实现!
}
```

**影响**:
- 签名验证完全失效
- 可能导致支付回调被伪造
- **资金安全隐患**

**修复**:
```typescript
import CryptoJS from 'crypto-js';

private static md5(str: string): string {
  return CryptoJS.MD5(str).toString();
}
```

### 2.2 国际化问题

#### ❌ **C4: Unicode编码错误** (严重)
**位置**: 多个文件中的错误消息

```typescript
// ❌ 问题代码 - Unicode转义错误
throw new Error('u64cdu4f5cu5931u8d25');  // 应该是 \u64cd\u4f5c\u5931\u8d25

// 正确的Unicode:
throw new Error('\u64cd\u4f5c\u5931\u8d25'); // 解码为: "操作失败"
```

**受影响文件**:
- `bufpayService.ts`: 9处
- `orderService.ts`: 6处
- `standardOrderService.ts`: 1处

**修复方案**:
```typescript
// ✅ 使用i18n
const { t } = await import('@/i18n');
throw new Error(t('common.errors.operationFailed'));
```

#### ⚠️ **H4: i18n调用未导入** (高优先级)
**位置**: `standardBufpayService.ts:125,135,176,185,295,301`

```typescript
// ❌ 问题代码 - i18n未导入但直接使用
message: i18n.t('common.messages.支付订单创建成功')
```

**顶部注释**: `// import i18n from '@/i18n'; // 改为动态导入避免TDZ`

**问题**: 注释掉了导入,但代码中仍然使用,会导致运行时错误。

**修复**:
```typescript
// 文件顶部
const i18n = await import('@/i18n').then(m => m.default);

// 或在函数内动态导入
const { t } = await import('@/i18n');
message: t('common.messages.支付订单创建成功')
```

### 2.3 错误处理

#### ⚠️ **H5: 错误信息不一致** (高优先级)
**问题**: 同一错误场景,不同文件返回不同消息

**示例1 - 订单不存在**:
```typescript
// bufpayService.ts:136
return { success: false, message: 'u64cdu4f5cu5931u8d25' };

// orderStatusService.ts:33
throw new Error(`订单不存在: ${orderId}`);

// standardOrderService.ts:208
reject(new Error('u64cdu4f5cu5931u8d25'));
```

**建议**: 创建统一的错误码系统
```typescript
// @/config/paymentErrors.ts
export const PaymentErrors = {
  ORDER_NOT_FOUND: { code: 'E001', message: '订单不存在' },
  PAYMENT_FAILED: { code: 'E002', message: '支付失败' },
  SIGNATURE_INVALID: { code: 'E003', message: '签名验证失败' }
} as const;
```

#### 🟡 **M1: 错误日志不完整** (中优先级)
**位置**: 多处错误捕获块

```typescript
// ❌ 不完整
} catch (error) {
  logger.error('操作失败:', error);  // 缺少上下文
  throw error;
}

// ✅ 完整
} catch (error) {
  logger.error('创建支付订单失败:', {
    error,
    userId: params.userId,
    amount: params.amount,
    productType: params.productType,
    stack: error instanceof Error ? error.stack : undefined
  });
  throw error;
}
```

---

## 🔄 三、支付流程审查

### 3.1 支付流程图

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant API as Netlify Functions
    participant BP as BufPay
    participant DB as Supabase

    U->>F: 1. 点击支付
    F->>DB: 2. 创建订单(status: pending)
    F->>API: 3. 调用create-order
    API->>BP: 4. 创建BufPay订单
    BP-->>API: 5. 返回二维码
    API-->>F: 6. 返回支付信息
    F->>U: 7. 显示二维码

    U->>BP: 8. 扫码支付
    BP->>API: 9. 支付回调(notify_url)
    API->>DB: 10. 更新订单(status: paid)
    API->>DB: 11. 创建/更新订阅
    API->>DB: 12. 标记订单(status: processed)
    API-->>BP: 13. 返回success

    F->>API: 14. 轮询订单状态
    API->>DB: 15. 查询订单
    DB-->>API: 16. 返回订单信息
    API-->>F: 17. 返回状态
    F->>U: 18. 显示支付结果
```

### 3.2 流程问题

#### ⚠️ **H6: 回调幂等性缺失** (高优先级)
**位置**: `bufpayService.ts:105-166`

**当前逻辑**:
```typescript
// 3. 检查订单状态
if (order.status === 'paid' || order.status === 'processed') {
  return { success: true, message: 'u64cdu4f5cu5931u8d25' };  // ← 错误消息!
}

// 4. 更新订单为已支付
await OrderService.markOrderAsPaid(...);

// 5. 处理权限开通
await OrderService.processOrderPermissions(updatedOrder);
```

**问题**:
1. 已处理订单返回成功但消息是"操作失败"(Unicode错误)
2. 未记录重复回调次数
3. 并发回调可能导致重复权限开通

**修复**:
```typescript
// 检查订单状态
if (order.status === 'paid' || order.status === 'processed') {
  await this.logDuplicateCallback(orderId, notifyData);
  return {
    success: true,
    message: t('payment.callback.alreadyProcessed')
  };
}

// 使用数据库事务确保原子性
const { data, error } = await supabase.rpc('process_payment_callback', {
  p_order_id: orderId,
  p_aoid: notifyData.aoid,
  p_pay_price: parseFloat(notifyData.pay_price)
});
```

#### 🟡 **M2: 缺少超时处理** (中优先级)
**位置**: `standardOrderService.ts:194-233`

**当前**: 轮询最多60秒 (30次 × 2秒),无超时后的fallback

**建议**:
```typescript
static async pollOrderStatus(
  orderId: string,
  options: {
    maxAttempts?: number;
    interval?: number;
    onTimeout?: () => void;  // ← 新增超时回调
  } = {}
): Promise<StandardOrder> {
  // ... 轮询逻辑

  if (attempts >= maxAttempts) {
    options.onTimeout?.();
    // 记录超时事件
    logger.warn('订单状态轮询超时', { orderId, attempts });
    resolve(order);  // 返回最后状态
  }
}
```

---

## 🔐 四、订单状态机审查

### 4.1 状态机定义对比

#### 旧版 OrderService
```typescript
type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'processed';
```

#### 新版 StandardOrderService
```typescript
type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
```

### 4.2 状态转换规则

#### ✅ **有效转换**:
```
pending → paid → processed  (旧版正常流程)
pending → paid              (新版正常流程)
pending → failed            (支付失败)
pending → expired           (旧版超时)
pending → cancelled         (新版用户取消)
```

#### ❌ **C5: 状态不兼容** (严重)
**问题**:
- 旧版有 `expired` 和 `processed`,新版没有
- 新版有 `cancelled` 和 `refunded`,旧版没有
- 数据库同一张表,状态定义不一致

**影响**:
- 历史订单状态无法正确识别
- 查询条件可能遗漏部分订单
- 状态迁移逻辑缺失

**修复方案**:
```typescript
// 1. 统一状态定义
export type UnifiedOrderStatus =
  | 'pending'    // 待支付
  | 'paid'       // 已支付
  | 'processed'  // 已处理(权限已发放)
  | 'failed'     // 支付失败
  | 'expired'    // 已过期
  | 'cancelled'  // 已取消
  | 'refunded';  // 已退款

// 2. 状态机验证
const VALID_TRANSITIONS: Record<UnifiedOrderStatus, UnifiedOrderStatus[]> = {
  pending: ['paid', 'failed', 'expired', 'cancelled'],
  paid: ['processed', 'refunded'],
  processed: ['refunded'],
  failed: [],
  expired: [],
  cancelled: [],
  refunded: []
};

export function validateTransition(
  from: UnifiedOrderStatus,
  to: UnifiedOrderStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
```

### 4.3 权限发放逻辑

#### ❌ **C6: 权限发放时机不明确** (严重)
**位置**: `orderService.ts:190-267`

**当前逻辑**:
```typescript
// paid状态 → 调用processOrderPermissions() → processed状态
```

**问题**:
1. 如果`processOrderPermissions()`失败,订单仍然是`paid`状态
2. 用户可能已支付但未获得权限
3. 缺少补偿机制

**修复**:
```typescript
static async processOrderPermissions(order: Order): Promise<UserSubscription> {
  try {
    // 1. 幂等性检查
    const existing = await this.getSubscriptionByOrderId(order.order_id);
    if (existing) {
      logger.info('订阅已存在,跳过创建', { orderId: order.order_id });
      return existing;
    }

    // 2. 开启事务
    const { data, error } = await supabase.rpc('create_subscription_atomic', {
      p_order_id: order.order_id,
      p_user_id: order.user_id,
      p_subscription_type: order.product_type,
      p_duration_type: order.duration_type
    });

    if (error) throw error;

    // 3. 成功后更新订单状态
    await this.updateOrderStatus(order.order_id, 'processed');

    return data;
  } catch (error) {
    // 4. 失败记录,不改变订单状态,等待修复服务处理
    await this.recordPermissionError(order.order_id, error);
    throw error;
  }
}
```

---

## 🧹 五、异常订单清理审查

### 5.1 清理服务概览

**核心文件**:
- `orderStatusService.ts` - 订单状态检查和修复
- `paymentDataCleanupService.ts` - LocalStorage数据清理

### 5.2 修复机制

#### ✅ **优点**:
1. **自动检测**: 已支付但未处理的订单自动识别
2. **批量修复**: 支持批量订单权限修复
3. **数据清理**: 清理localStorage中的脏数据

#### 🟡 **M3: 修复触发时机不明确** (中优先级)
**位置**: `orderStatusService.ts:199-232`

**当前**: 仅在用户主动查询时触发修复

```typescript
static async getOrdersNeedingRepair(): Promise<string[]> {
  // 查找已支付但未处理的订单
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('order_id')
    .eq('status', 'paid')
    .lt('paid_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  return paidOrders?.map(o => o.order_id) || [];
}
```

**问题**:
- 无定时任务自动扫描
- 依赖用户触发不可靠

**建议**: 添加Netlify Scheduled Function
```typescript
// netlify/functions/scheduled-order-repair.ts
export const handler: Handler = async (event) => {
  const needsRepair = await OrderStatusService.getOrdersNeedingRepair();

  for (const orderId of needsRepair) {
    await OrderStatusService.repairOrderPermissions(orderId);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ repaired: needsRepair.length })
  };
};
```

### 5.3 数据清理问题

#### 🟡 **M4: 清理逻辑过于激进** (中优先级)
**位置**: `paymentDataCleanupService.ts:14-67`

**当前**: 清理47个localStorage键,包括所有以特定前缀开头的

```typescript
const prefixesToClean = [
  'AMP_unsent',
  'payment_center_access_time_',
  'wenpai:guest:',
  '_authing_',
  'authing_'
];
```

**问题**:
- 可能误删有效的认证数据
- 与AuthService的状态管理冲突

**建议**: 仅清理确认无效的数据
```typescript
static cleanupPaymentData(userId?: string): void {
  const keysToClean = [
    // 仅清理支付相关的临时数据
    ...(userId ? [`payment_temp_${userId}`] : []),
    'payment_qr_cache',
    'payment_status_temp'
  ];

  // 保留认证数据,由AuthService统一管理
}
```

---

## 📦 六、依赖关系分析

### 6.1 服务依赖图

```
PaymentPage.tsx
  ├── BufPayService
  │     ├── OrderService
  │     │     ├── generateOrderId (utils/paymentUtils)
  │     │     ├── calculateExpiryDate (utils/paymentUtils)
  │     │     └── supabase
  │     ├── verifyNotifySign (utils/paymentUtils)
  │     └── OrderStatusService
  │           └── Netlify Functions (repair-order-permissions)
  │
  ├── StandardBufPayService
  │     ├── StandardOrderService
  │     │     ├── supabase.rpc('generate_order_id')
  │     │     └── supabase
  │     └── CryptoJS (缺失!)
  │
  ├── PaymentStatusService
  │     ├── secureStorage
  │     └── UnifiedStorageKeyManager
  │
  └── PaymentDataCleanupService
        └── logger
```

### 6.2 重复代码

#### 🔵 **L1: 订单ID生成逻辑重复** (低优先级)
**位置**:
- `utils/paymentUtils.ts:generateOrderId()`
- `standardOrderService.ts:generateOrderIdFallback()`

**重复代码**:
```typescript
// paymentUtils.ts
export function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `WP${dateStr}${randomStr}`;
}

// standardOrderService.ts (几乎相同)
private static generateOrderIdFallback(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `WP${dateStr}${randomStr}`;
}
```

**修复**: 统一使用`paymentUtils.generateOrderId()`

#### 🔵 **L2: 状态映射重复** (低优先级)
**位置**:
- `bufpayService.ts:83-90`
- `types/payment.ts:130-137`

**重复定义**:
```typescript
// bufpayService.ts
const statusMap: Record<string, string> = {
  'not_exist': 'u64cdu4f5cu5931u8d25',
  'new': '等待支付',
  'payed': '支付成功，处理中',
  // ...
};

// types/payment.ts
export const PAYMENT_STATUS_MAP = {
  'not_exist': '订单不存在',
  'new': '新订单',
  'payed': '已支付未回调',
  // ...
};
```

**问题**: 同一个状态,两个文件映射不同的文本

**修复**: 统一使用`types/payment.ts`中的定义,并使用i18n

---

## 📋 七、问题汇总表

| ID | 问题 | 级别 | 位置 | 影响 |
|---|---|---|---|---|
| C1 | 支付服务双轨制 | 🔴严重 | bufpayService.ts + standardBufpayService.ts | 维护成本翻倍,功能不一致 |
| C2 | 订单服务双轨制 | 🔴严重 | orderService.ts + standardOrderService.ts | 状态不兼容,数据混乱 |
| C3 | API端点硬编码 | 🔴严重 | bufpayService.ts:30,323 | 环境切换困难,CORS问题 |
| C4 | Unicode编码错误 | 🔴严重 | 多个文件 | 错误消息乱码,用户体验差 |
| C5 | 订单状态不兼容 | 🔴严重 | 双订单服务 | 历史数据无法处理 |
| C6 | 权限发放时机不明确 | 🔴严重 | orderService.ts:190 | 支付成功但未获得权限 |
| H1 | 缺少统一入口服务 | 🟠高 | 架构层面 | 代码分散,难以维护 |
| H2 | 配置值硬编码 | 🟠高 | standardBufpayService.ts:32 | SSR失败,环境依赖 |
| H3 | MD5签名未实现 | 🟠高 | standardBufpayService.ts:220 | **资金安全隐患** |
| H4 | i18n调用未导入 | 🟠高 | standardBufpayService.ts:125+ | 运行时错误 |
| H5 | 错误信息不一致 | 🟠高 | 多个文件 | 排查问题困难 |
| H6 | 回调幂等性缺失 | 🟠高 | bufpayService.ts:140 | 重复权限开通风险 |
| M1 | 错误日志不完整 | 🟡中 | 多处catch块 | 调试困难 |
| M2 | 缺少超时处理 | 🟡中 | standardOrderService.ts:194 | 用户长时间等待 |
| M3 | 修复触发时机不明确 | 🟡中 | orderStatusService.ts:199 | 异常订单无法自动修复 |
| M4 | 清理逻辑过于激进 | 🟡中 | paymentDataCleanupService.ts:47 | 误删有效数据 |
| L1 | 订单ID生成重复 | 🔵低 | paymentUtils + standardOrderService | 代码冗余 |
| L2 | 状态映射重复 | 🔵低 | bufpayService + types/payment | 映射不一致 |

---

## 🛠️ 八、修复方案

### 阶段1: 紧急修复 (1-2天)

#### 1. 修复MD5签名 (H3)
```bash
npm install crypto-js
```

```typescript
// standardBufpayService.ts
import CryptoJS from 'crypto-js';

private static md5(str: string): string {
  return CryptoJS.MD5(str).toString();
}
```

#### 2. 修复Unicode编码 (C4)
```bash
# 批量替换脚本
node scripts/fix-unicode-encoding.js
```

```javascript
// scripts/fix-unicode-encoding.js
const fs = require('fs');
const files = [
  'src/services/bufpayService.ts',
  'src/services/orderService.ts',
  'src/services/standardOrderService.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/u64cdu4f5cu5931u8d25/g, "t('common.errors.operationFailed')");
  fs.writeFileSync(file, content);
});
```

#### 3. 修复i18n导入 (H4)
```typescript
// standardBufpayService.ts 顶部
import { useTranslation } from 'react-i18next';

// 或动态导入
const { t } = await import('@/i18n').then(m => m.default.t);
```

### 阶段2: 架构统一 (3-5天)

#### 1. 创建统一支付服务
```typescript
// src/services/unifiedPaymentService.ts
export class UnifiedPaymentService {
  private provider: BufPayService | StandardBufPayService;

  constructor() {
    // 根据配置选择provider
    const useStandard = import.meta.env.VITE_USE_STANDARD_PAYMENT === 'true';
    this.provider = useStandard ? new StandardBufPayService() : BufPayService;
  }

  async createPayment(params: PaymentRequest): Promise<PaymentResponse> {
    const startTime = performance.now();

    try {
      const result = await this.provider.createPayment(params);

      // 统一监控
      performanceMetrics.record({
        action: 'createPayment',
        duration: performance.now() - startTime,
        success: true
      });

      return result;
    } catch (error) {
      performanceMetrics.record({
        action: 'createPayment',
        duration: performance.now() - startTime,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  // ... 其他统一接口
}
```

#### 2. 统一订单状态机
```typescript
// src/services/unifiedOrderService.ts
export type UnifiedOrderStatus =
  | 'pending' | 'paid' | 'processed'
  | 'failed' | 'expired' | 'cancelled' | 'refunded';

export class UnifiedOrderService {
  async transitionStatus(
    orderId: string,
    toStatus: UnifiedOrderStatus
  ): Promise<void> {
    const order = await this.getOrder(orderId);

    if (!validateTransition(order.status, toStatus)) {
      throw new Error(`无效的状态转换: ${order.status} → ${toStatus}`);
    }

    await this.updateStatus(orderId, toStatus);
    await this.auditLog(orderId, order.status, toStatus);
  }
}
```

#### 3. 配置统一管理
```typescript
// src/config/paymentEndpoints.ts
import { logger } from '@/utils/logger';

interface PaymentEndpointConfig {
  apiBaseURL: string;
  queryURL: string;
  notifyURL: string;
  returnURL: string;
}

function getPaymentEndpoints(): PaymentEndpointConfig {
  const required = {
    apiBaseURL: import.meta.env.VITE_BUFPAY_API_URL,
    queryURL: import.meta.env.VITE_BUFPAY_QUERY_URL,
    notifyURL: import.meta.env.VITE_BUFPAY_NOTIFY_URL,
    returnURL: import.meta.env.VITE_BUFPAY_RETURN_URL
  };

  // 验证必需配置
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    logger.error('缺少支付配置:', missing);
    throw new Error(`缺少支付配置: ${missing.join(', ')}`);
  }

  return required as PaymentEndpointConfig;
}

export const PAYMENT_CONFIG = getPaymentEndpoints();
```

### 阶段3: 优化完善 (1周)

#### 1. 添加定时修复任务
```typescript
// netlify/functions/scheduled-order-repair.ts
import { schedule } from '@netlify/functions';
import { OrderStatusService } from '@/services/orderStatusService';

export const handler = schedule('0 */5 * * *', async () => {
  // 每5分钟扫描一次
  const needsRepair = await OrderStatusService.getOrdersNeedingRepair();

  const results = await OrderStatusService.batchRepairOrders(needsRepair);

  logger.info('定时修复完成:', {
    total: results.total,
    repaired: results.repaired,
    failed: results.failed
  });

  return {
    statusCode: 200,
    body: JSON.stringify(results)
  };
});
```

#### 2. 优化回调幂等性
```typescript
// 数据库函数 (PostgreSQL)
CREATE OR REPLACE FUNCTION process_payment_callback(
  p_order_id TEXT,
  p_aoid TEXT,
  p_pay_price NUMERIC
) RETURNS JSON AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_subscription user_subscriptions%ROWTYPE;
  v_result JSON;
BEGIN
  -- 1. 加锁防止并发
  SELECT * INTO v_order FROM orders
  WHERE order_id = p_order_id FOR UPDATE;

  -- 2. 检查状态
  IF v_order.status IN ('paid', 'processed') THEN
    -- 记录重复回调
    INSERT INTO payment_callback_log (order_id, aoid, pay_price, duplicate)
    VALUES (p_order_id, p_aoid, p_pay_price, true);

    RETURN json_build_object('success', true, 'duplicate', true);
  END IF;

  -- 3. 更新订单
  UPDATE orders SET
    status = 'paid',
    aoid = p_aoid,
    pay_price = p_pay_price,
    paid_at = NOW()
  WHERE order_id = p_order_id;

  -- 4. 创建订阅
  INSERT INTO user_subscriptions (user_id, subscription_type, ...)
  VALUES (...) RETURNING * INTO v_subscription;

  -- 5. 标记已处理
  UPDATE orders SET status = 'processed', processed_at = NOW()
  WHERE order_id = p_order_id;

  RETURN json_build_object(
    'success', true,
    'duplicate', false,
    'subscription_id', v_subscription.id
  );
END;
$$ LANGUAGE plpgsql;
```

#### 3. 性能监控
```typescript
// src/services/paymentPerformanceMonitor.ts
class PaymentPerformanceMonitor {
  private metrics: Array<{
    action: string;
    duration: number;
    success: boolean;
    timestamp: number;
  }> = [];

  record(data: { action: string; duration: number; success: boolean }) {
    this.metrics.push({ ...data, timestamp: Date.now() });

    // 限制1000条
    if (this.metrics.length > 1000) this.metrics.shift();
  }

  getStats() {
    const grouped = this.metrics.reduce((acc, m) => {
      if (!acc[m.action]) acc[m.action] = [];
      acc[m.action].push(m);
      return acc;
    }, {} as Record<string, typeof this.metrics>);

    return Object.entries(grouped).map(([action, items]) => ({
      action,
      count: items.length,
      successRate: items.filter(i => i.success).length / items.length * 100,
      avgDuration: items.reduce((sum, i) => sum + i.duration, 0) / items.length,
      p95Duration: this.calculateP95(items.map(i => i.duration))
    }));
  }

  private calculateP95(durations: number[]): number {
    const sorted = [...durations].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] || 0;
  }
}

export const paymentMetrics = new PaymentPerformanceMonitor();
```

---

## 📊 九、迁移路径

### 9.1 新旧服务共存期 (2周)

```typescript
// 使用Feature Flag控制
const USE_NEW_PAYMENT = import.meta.env.VITE_USE_NEW_PAYMENT === 'true';

if (USE_NEW_PAYMENT) {
  // 新版标准支付流程
  const result = await UnifiedPaymentService.createPayment(params);
} else {
  // 旧版支付流程
  const result = await BufPayService.createPayment(params);
}
```

### 9.2 数据迁移

```sql
-- 1. 统一订单状态
UPDATE orders
SET status = 'processed'
WHERE status = 'paid'
  AND EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_subscriptions.order_id = orders.order_id
  );

-- 2. 迁移元数据
UPDATE orders
SET metadata = jsonb_build_object(
  'migration_date', NOW(),
  'migrated_from', 'legacy_system',
  'original_status', status
)
WHERE metadata IS NULL;
```

### 9.3 废弃时间表

| 时间 | 动作 |
|-----|------|
| Week 1-2 | 修复紧急问题,新老系统并行 |
| Week 3-4 | 架构统一,50%流量切新系统 |
| Week 5-6 | 100%流量切新系统,监控稳定性 |
| Week 7 | 标记旧代码为@deprecated |
| Week 8 | 删除旧代码,仅保留unifiedPaymentService |

---

## ✅ 十、验收标准

### 10.1 功能测试

- [ ] 新用户首次支付流程完整
- [ ] 老用户续费流程正常
- [ ] 支付回调幂等性验证 (重复3次回调,权限仅开通1次)
- [ ] 订单状态转换合法性检查
- [ ] 异常订单自动修复 (模拟5分钟未处理订单)
- [ ] 退款流程完整

### 10.2 性能测试

- [ ] 支付接口响应时间 < 500ms (P95)
- [ ] 回调处理时间 < 200ms (P95)
- [ ] 订单查询时间 < 100ms (P95)
- [ ] 并发支付 100 QPS 无丢单

### 10.3 安全测试

- [ ] MD5签名验证通过
- [ ] 伪造回调被拒绝
- [ ] SQL注入测试通过
- [ ] XSS测试通过
- [ ] 敏感数据加密存储

### 10.4 代码质量

- [ ] 无硬编码API端点
- [ ] 无Unicode编码错误
- [ ] 所有错误消息使用i18n
- [ ] ESLint 0 errors
- [ ] TypeScript strict模式通过
- [ ] 测试覆盖率 > 80%

---

## 📚 十一、相关文档

### 需要创建的文档

1. **支付系统架构文档**
   - 路径: `docs/architecture/payment-system.md`
   - 内容: 完整架构图、数据流、状态机

2. **支付API文档**
   - 路径: `docs/api/payment-api.md`
   - 内容: 所有支付相关API的接口文档

3. **支付回调处理指南**
   - 路径: `docs/guides/payment-callback-handling.md`
   - 内容: 回调处理流程、幂等性保证、异常处理

4. **订单状态机文档**
   - 路径: `docs/state-machines/order-status.md`
   - 内容: 状态定义、转换规则、Mermaid状态图

5. **支付故障排查手册**
   - 路径: `docs/troubleshooting/payment-issues.md`
   - 内容: 常见问题、排查步骤、解决方案

### 需要更新的文档

- [ ] README.md - 添加支付系统说明
- [ ] CONTRIBUTING.md - 添加支付代码规范
- [ ] .env.example - 添加所有支付相关环境变量

---

## 🎯 十二、行动计划

### 立即执行 (本周)

**负责人**: 技术负责人
**优先级**: P0

- [x] 完成本审查报告
- [ ] 团队评审会议,确认修复优先级
- [ ] 创建GitHub Issues (17个)
- [ ] 分配任务给开发人员

### 紧急修复 (1-2天)

**负责人**: 后端开发
**优先级**: P0

- [ ] 实现真实MD5签名 (H3) - **资金安全**
- [ ] 修复Unicode编码错误 (C4) - 17处
- [ ] 修复i18n导入问题 (H4) - 6处

### 架构重构 (1周)

**负责人**: 架构师 + 后端开发
**优先级**: P1

- [ ] 设计UnifiedPaymentService
- [ ] 实现统一订单状态机
- [ ] 配置统一管理
- [ ] 数据库事务优化

### 测试验收 (3天)

**负责人**: QA + 开发
**优先级**: P1

- [ ] 编写单元测试
- [ ] 集成测试
- [ ] 性能测试
- [ ] 安全测试

### 文档完善 (3天)

**负责人**: 技术文档工程师
**优先级**: P2

- [ ] 编写5份新文档
- [ ] 更新3份现有文档
- [ ] API文档生成

---

## 📈 十三、预期收益

### 代码质量提升
- **减少代码行数**: 700+ → 500 (统一后)
- **减少重复代码**: 30% → 5%
- **提升可维护性**: 维护时间减少50%

### 系统稳定性
- **消除资金安全隐患**: MD5签名修复
- **防止重复权限开通**: 回调幂等性
- **自动修复异常订单**: 定时任务

### 开发效率
- **新功能开发提速**: 统一入口,减少理解成本
- **Bug修复提速**: 错误日志完善,快速定位
- **测试提速**: 状态机清晰,测试用例明确

### 用户体验
- **错误提示友好**: 国际化完善
- **支付成功率提升**: 异常订单自动修复
- **响应速度提升**: 性能优化

---

## 🏁 总结

统一支付系统存在17个问题,其中6个为严重问题,需要立即修复。建议按照3个阶段进行:

1. **紧急修复** (1-2天): 修复MD5签名、Unicode编码、i18n导入
2. **架构统一** (1周): 创建UnifiedPaymentService,统一状态机,配置管理
3. **优化完善** (1周): 定时任务、性能监控、文档完善

预计2周内完成所有修复,系统稳定性和代码质量将显著提升。

---

**审查人**: AI Code Reviewer
**审查日期**: 2025-10-03
**下次审查**: 2025-11-03 (修复完成后)
