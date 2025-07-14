# 问派应用架构分离指南

## 概述

本文档详细说明了问派应用的架构设计，明确划分了Authing身份认证功能和自建后端业务逻辑功能的职责边界。

## 架构设计原则

### 1. 职责分离
- **Authing**: 专门负责用户身份认证、登录注册、Token管理
- **自建后端**: 专门负责业务逻辑、数据存储、业务规则处理

### 2. 数据流向
```
前端 → Authing (身份认证) → 自建后端 (业务逻辑) → 数据库
```

### 3. 安全原则
- 身份验证由Authing统一处理
- 业务数据由自建后端管理
- 通过Token进行身份验证和授权

## 功能划分详细说明

### Authing处理的功能

#### 身份认证
- ✅ 用户注册（邮箱/手机号）
- ✅ 用户登录（密码/验证码）
- ✅ 社交登录（微信/QQ等）
- ✅ 密码重置
- ✅ 邮箱/手机号验证

#### 用户身份信息
- ✅ 用户基本信息（用户名、邮箱、手机号、头像）
- ✅ 用户身份ID（唯一标识）
- ✅ 基础角色管理（管理员、普通用户等）

#### 安全功能
- ✅ Token生成和验证
- ✅ 会话管理
- ✅ 登出功能
- ✅ Token刷新

### 自建后端处理的功能

#### 用户业务数据
- ✅ 用户详细资料
- ✅ 用户偏好设置
- ✅ 用户行为记录
- ✅ 用户统计信息

#### 邀请系统
- ✅ 邀请链接生成
- ✅ 邀请关系绑定
- ✅ 邀请奖励发放
- ✅ 邀请记录查询

#### 使用次数管理
- ✅ 每月使用次数发放
- ✅ 使用次数消费
- ✅ 使用情况查询
- ✅ 使用限制检查

#### 余额/积分系统
- ✅ 余额查询和更新
- ✅ 积分管理
- ✅ 奖励发放
- ✅ 消费记录

#### 订阅/套餐管理
- ✅ 订阅信息查询
- ✅ 套餐升级
- ✅ 订阅状态管理
- ✅ 到期提醒

#### 支付系统
- ✅ 支付订单创建
- ✅ 支付验证
- ✅ 支付回调处理
- ✅ 订单状态管理

#### 业务行为记录
- ✅ 用户操作记录
- ✅ 功能使用统计
- ✅ 行为分析数据
- ✅ 审计日志

## 技术实现

### 前端架构

#### 统一认证服务 (`src/services/unifiedAuthService.ts`)
```typescript
interface AuthingIdentityFeatures {
  // Authing身份认证功能
  login: (method, credentials) => Promise<User>;
  register: (method, userInfo) => Promise<User>;
  getCurrentUser: () => Promise<User | null>;
  // ... 其他身份认证功能
}

interface BackendBusinessFeatures {
  // 自建后端业务功能
  getUserProfile: (userId) => Promise<any>;
  generateInviteLink: (userId) => Promise<string>;
  processInviteReward: (inviterId, inviteeId) => Promise<void>;
  // ... 其他业务功能
}
```

#### 认证流程
1. 用户在前端进行登录/注册
2. Authing处理身份验证
3. 获取Authing Token
4. 调用自建后端API，携带Token进行身份验证
5. 自建后端验证Token后处理业务逻辑

### 后端架构

#### Express API服务器 (`backend-api-server.js`)
```javascript
// 认证中间件
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization'];
  // 使用Authing SDK验证Token
  const userInfo = await authingClient.checkLoginStatus(token);
  req.user = userInfo;
  next();
};

// 业务API路由
app.post('/api/user/create', authenticateToken, async (req, res) => {
  // 处理用户创建业务逻辑
});

app.post('/api/invite/reward', authenticateToken, async (req, res) => {
  // 处理邀请奖励业务逻辑
});
```

#### 数据存储
- 当前使用内存存储（Map数据结构）
- 可扩展为MongoDB、MySQL等数据库
- 支持数据持久化和备份

## API接口设计

### 认证相关接口
```
POST /api/user/sync          # 同步用户信息到后端
POST /api/user/create        # 创建用户业务数据
GET  /api/user/profile/:id   # 获取用户业务资料
PUT  /api/user/profile/:id   # 更新用户业务资料
```

### 邀请系统接口
```
GET  /api/invite/link/:id    # 生成邀请链接
POST /api/invite/bind        # 绑定邀请关系
POST /api/invite/reward      # 处理邀请奖励
GET  /api/invite/relations/:id # 获取邀请关系
```

### 使用次数管理接口
```
GET  /api/user/usage/:id     # 获取使用情况
POST /api/usage/distribute   # 发放使用次数
POST /api/usage/consume      # 消费使用次数
```

### 余额管理接口
```
GET  /api/user/balance/:id   # 获取用户余额
PUT  /api/user/balance/:id   # 更新用户余额
```

### 订阅管理接口
```
GET  /api/user/subscription/:id    # 获取订阅信息
POST /api/user/subscription/upgrade # 升级订阅
```

### 支付相关接口
```
POST /api/payment/order      # 创建支付订单
POST /api/payment/verify     # 验证支付
```

### 行为记录接口
```
POST /api/user/action        # 记录用户行为
GET  /api/user/actions/:id   # 获取行为记录
```

## 部署和配置

### 环境变量配置
```bash
# Authing配置
AUTHING_APP_ID=your-app-id
AUTHING_SECRET=your-secret
AUTHING_HOST=https://your-domain.authing.cn

# 后端API配置
VITE_API_BASE_URL=https://www.wenpai.xyz/api
BACKEND_PORT=3001
FRONTEND_URL=https://www.wenpai.xyz
```

### 启动方式
```bash
# 使用启动脚本（推荐）
./start-full-stack.sh

# 或分别启动
# 后端
node backend-api-server.js

# 前端
npm run dev
```

## 安全考虑

### 身份验证安全
- 所有API请求都需要有效的Authing Token
- Token过期自动刷新
- 支持Token撤销和黑名单

### 数据安全
- 敏感数据加密存储
- API请求使用HTTPS
- 实现请求频率限制
- 记录安全审计日志

### 业务逻辑安全
- 邀请奖励防重复发放
- 使用次数防超量消费
- 支付验证防重复处理
- 用户权限验证

## 扩展性设计

### 数据库扩展
当前使用内存存储，可轻松扩展为：
- MongoDB（文档数据库）
- MySQL（关系数据库）
- Redis（缓存数据库）

### 功能扩展
- 支持更多支付方式
- 增加更多业务功能
- 支持多租户架构
- 实现微服务架构

### 性能优化
- 实现数据缓存
- 支持负载均衡
- 实现API限流
- 优化数据库查询

## 监控和日志

### 业务监控
- 用户注册/登录统计
- 功能使用情况统计
- 邀请转化率统计
- 支付成功率统计

### 系统监控
- API响应时间
- 错误率统计
- 服务器资源使用
- 数据库性能

### 日志记录
- 用户行为日志
- 系统错误日志
- 安全审计日志
- 业务操作日志

## 总结

通过这种架构设计，我们实现了：

1. **清晰的职责分离**: Authing专注身份认证，自建后端专注业务逻辑
2. **灵活的扩展性**: 可以独立扩展身份认证或业务功能
3. **良好的安全性**: 统一的身份验证，安全的业务处理
4. **易于维护**: 模块化设计，便于开发和维护
5. **成本优化**: 按需使用Authing服务，自建核心业务逻辑

这种架构既保证了身份认证的专业性和安全性，又保持了业务逻辑的灵活性和可控性，是一个平衡且实用的解决方案。 