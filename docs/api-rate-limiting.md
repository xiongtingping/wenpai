# 📊 API速率限制系统

## 🎯 概述

文派API系统现已集成IP级别速率限制功能，有效防止单IP过度请求，提升API服务的稳定性和安全性。

## 🏗️ 系统架构

### 核心组件

1. **速率限制中间件** (`netlify/functions/lib/rate-limiter.js`)
   - 滑动窗口算法实现
   - 支持不同端点的独立限制
   - VIP用户倍率支持
   - 内存缓存存储

2. **管理监控端点** (`netlify/functions/rate-limit-admin.js`)
   - 实时统计查看
   - 缓存管理操作
   - 权限控制保护

3. **数据库日志** (`database/rate_limit_logs.sql`)
   - 请求行为记录
   - 安全分析支持
   - 自动清理机制

4. **前端监控界面** (`src/components/admin/RateLimitMonitor.tsx`)
   - 可视化监控
   - 管理员操作界面
   - 实时数据展示

## ⚙️ 配置规则

### 默认限制
- **时间窗口**: 60秒
- **最大请求**: 60次
- **错误消息**: "请求过于频繁，请稍后再试"

### 端点特定限制

| 端点 | 窗口(秒) | 最大请求 | 说明 |
|------|----------|----------|------|
| `/ai/chat` | 60 | 20 | AI聊天请求，消耗较多资源 |
| `/config` | 60 | 10 | 配置请求，访问频率较低 |
| `/hot-topics` | 60 | 30 | 热点话题，中等频率 |
| `/generate-image` | 60 | 5 | 图像生成，最严格限制 |

### VIP用户倍率

| 用户等级 | 倍率 | 说明 |
|----------|------|------|
| Trial | 1x | 基础用户 |
| Pro | 2x | 专业用户，双倍限制 |
| Premium | 3x | 高级用户，三倍限制 |

## 🚀 使用方法

### 1. 自动集成
速率限制已自动集成到主API入口 (`netlify/functions/api.cjs`)，无需额外配置即可生效。

### 2. 响应头信息
API响应包含速率限制信息：

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1672531200
Retry-After: 30
```

### 3. 错误响应格式
当触发速率限制时，返回HTTP 429状态码：

```json
{
  "error": "Too Many Requests",
  "message": "AI请求过于频繁，请稍后再试",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 30,
  "details": {
    "limit": 20,
    "current": 21,
    "windowMs": 60000,
    "userTier": "trial"
  },
  "timestamp": "2025-09-28T13:00:00.000Z"
}
```

## 🛠️ 管理员功能

### 访问监控界面
```bash
# 获取速率限制统计
GET /.netlify/functions/rate-limit-admin

# 清理内存缓存
POST /.netlify/functions/rate-limit-admin
{
  "action": "clear-cache"
}

# 重置特定IP限制
POST /.netlify/functions/rate-limit-admin
{
  "action": "reset-ip",
  "ip": "192.168.1.100"
}
```

### 前端监控组件
```tsx
import { RateLimitMonitor } from '@/components/admin/RateLimitMonitor';

// 在管理员页面中使用
<RateLimitMonitor />
```

## 📊 数据库配置

### 创建日志表
```sql
-- 执行SQL文件创建必要的表和索引
\i database/rate_limit_logs.sql
```

### 环境变量配置
```env
# 必需的Supabase配置
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔧 自定义配置

### 修改限制规则
编辑 `netlify/functions/lib/rate-limiter.js` 中的配置：

```javascript
const RATE_LIMIT_CONFIG = {
  // 修改默认限制
  default: {
    windowMs: 60 * 1000,
    maxRequests: 100, // 增加到100次
    message: '自定义错误消息'
  },
  
  // 添加新端点
  endpoints: {
    '/my-endpoint': {
      windowMs: 30 * 1000, // 30秒窗口
      maxRequests: 50,
      message: '自定义端点限制'
    }
  }
};
```

### 添加白名单IP
在中间件中添加IP白名单逻辑：

```javascript
function createRateLimitMiddleware(options = {}) {
  const { whitelistIPs = [] } = options;
  
  return async function rateLimitMiddleware(event) {
    const clientIP = getClientIP(event);
    
    // 检查白名单
    if (whitelistIPs.includes(clientIP)) {
      return { allowed: true, whitelisted: true };
    }
    
    // 正常速率限制检查
    return await checkRateLimit(event);
  };
}
```

## 🧪 测试验证

### 单元测试
```bash
# 运行核心逻辑测试
node scripts/rate-limit-unit-test.cjs
```

### 压力测试
```bash
# 运行完整的压力测试（需要服务器运行）
node scripts/test-rate-limit.js
```

### 测试覆盖范围
- ✅ 基本速率限制功能
- ✅ 不同端点独立限制
- ✅ VIP用户倍率计算
- ✅ 时间窗口重置机制
- ✅ 不同IP独立计数

## 📈 监控指标

### 关键指标
- **请求总数**: 时间段内的总API请求数
- **阻止率**: 被速率限制阻止的请求比例
- **平均响应时间**: API响应时间统计
- **活跃IP数**: 当前时间窗口内的唯一IP数量

### 告警阈值建议
- 阻止率 > 10%: 可能需要调整限制规则
- 活跃IP > 1000: 可能遭受DDoS攻击
- 内存使用 > 100MB: 考虑启用Redis缓存

## 🚨 故障排除

### 常见问题

1. **速率限制不生效**
   - 检查中间件是否正确集成
   - 验证环境变量配置
   - 查看控制台错误日志

2. **VIP用户限制不正确**
   - 确认用户认证正常
   - 检查用户等级获取逻辑
   - 验证倍率计算

3. **数据库日志不记录**
   - 检查Supabase连接
   - 验证表结构是否创建
   - 查看权限设置

### 性能优化

1. **启用Redis缓存**
   ```javascript
   // 替换内存Map为Redis
   const redis = require('redis');
   const client = redis.createClient();
   ```

2. **缓存清理策略**
   ```javascript
   // 定期清理过期记录
   setInterval(cleanupExpiredRecords, 60000);
   ```

3. **异步日志记录**
   ```javascript
   // 使用队列避免阻塞主流程
   setImmediate(() => logRateLimitEvent(...));
   ```

## 🔮 未来改进

### 计划功能
- [ ] Redis分布式缓存支持
- [ ] 动态配置热更新
- [ ] 更精细的地理位置限制
- [ ] 机器学习异常检测
- [ ] 实时告警系统

### 性能提升
- [ ] 分层缓存架构
- [ ] 批量日志写入
- [ ] 连接池优化
- [ ] 内存泄漏监控

---

## 📚 相关文档

- [API安全审查报告](./api-security-audit.md)
- [Netlify Functions文档](https://docs.netlify.com/functions/overview/)
- [Supabase数据库管理](https://supabase.com/docs/guides/database)

## 💬 支持

如有问题或建议，请联系开发团队或提交GitHub Issue。

---

*最后更新: 2025-09-28*