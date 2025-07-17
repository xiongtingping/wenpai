# 环境变量配置指南

## 问题诊断

根据控制台日志，当前存在以下问题：

1. **缺少必需的 API 密钥**
   - OpenAI API 密钥未正确配置
   - Creem 支付 API 密钥未设置

2. **Netlify Functions 依赖问题**
   - creem 和 qrcode 依赖无法解析

## 解决方案

### 1. 创建环境变量配置文件

在项目根目录创建 `.env.local` 文件：

```bash
# 复制示例文件
cp env.example .env.local
```

### 2. 配置必需的 API 密钥

编辑 `.env.local` 文件，设置以下必需配置：

```env
# OpenAI API 配置（必需）
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Creem 支付 API 配置（必需）
VITE_CREEM_API_KEY=your-actual-creem-api-key-here

# 其他配置保持不变...
```

### 3. 获取 API 密钥

#### OpenAI API 密钥
1. 访问 https://platform.openai.com/api-keys
2. 登录或注册 OpenAI 账户
3. 创建新的 API 密钥
4. 复制密钥并替换 `sk-your-actual-openai-api-key-here`

#### Creem 支付 API 密钥
1. 访问 https://creem.io/
2. 注册并登录 Creem 账户
3. 在控制台获取 API 密钥
4. 复制密钥并替换 `your-actual-creem-api-key-here`

### 4. 安装依赖

确保所有依赖已正确安装：

```bash
# 安装主项目依赖
npm install

# 安装 Netlify Functions 依赖
cd netlify/functions
npm install
cd ../..
```

### 5. 重启开发服务器

配置完成后，重启开发服务器：

```bash
npm run dev
```

## 验证配置

配置完成后，控制台应该显示：

```
✅ [必需] VITE_OPENAI_API_KEY: sk-...
    OpenAI API密钥配置正确
✅ [必需] VITE_CREEM_API_KEY: ...
    Creem支付API密钥配置正确
```

## 常见问题

### 1. API 密钥无效
- 确保密钥格式正确
- 检查密钥是否已过期
- 确认账户有足够余额

### 2. 网络连接问题
- 检查网络连接
- 如果在中国大陆，可能需要配置代理

### 3. Netlify Functions 构建失败
- 确保 `netlify/functions` 目录下的依赖已安装
- 检查 `netlify.toml` 配置是否正确

## 安全注意事项

1. **不要提交 `.env.local` 文件到版本控制**
2. **定期轮换 API 密钥**
3. **使用强密码和加密密钥**
4. **监控 API 使用情况**

## 下一步

配置完成后，您可以：
1. 测试 AI 功能
2. 测试支付功能
3. 部署到生产环境

如有问题，请检查控制台日志并参考此指南。 