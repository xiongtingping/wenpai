# 🚀 文派项目快速启动指南

## 📋 概述

本指南将帮助您在5分钟内快速启动文派项目，包括环境配置、依赖安装和功能验证。

## ⚡ 5分钟快速启动

### 1. 克隆项目 (1分钟)

```bash
# 克隆项目
git clone https://github.com/xiongtingping/wenpai.git
cd wenpai

# 安装依赖
npm install
```

### 2. 快速配置 (2分钟)

```bash
# 运行配置脚本
./setup-deployment-config.sh

# 选择 "5) 生成环境变量文件"
# 按照提示输入您的API密钥
```

### 3. 启动项目 (1分钟)

```bash
# 启动开发服务器
npm run dev
```

### 4. 验证配置 (1分钟)

1. 访问 `http://localhost:5173/api-config-test`
2. 检查配置状态
3. 确认所有必需配置已完成

## 🔧 详细配置步骤

### 必需API密钥获取

#### OpenAI API密钥
1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 登录或注册账户
3. 点击 "Create new secret key"
4. 复制生成的密钥（以 `sk-` 开头）

#### Authing配置
项目已预配置Authing测试环境，可直接使用：
- 应用ID: `6867fdc88034eb95ae86167d`
- 域名: `https://qutkgzkfaezk-demo.authing.cn`

### 环境变量配置

#### 方法1: 使用配置脚本（推荐）
```bash
./setup-deployment-config.sh
```

#### 方法2: 手动配置
```bash
# 复制环境变量示例文件
cp env.example .env.local

# 编辑环境变量文件
nano .env.local
```

添加以下配置：
```env
# 必需配置
VITE_OPENAI_API_KEY=sk-your-actual-openai-api-key
VITE_AUTHING_APP_ID=6867fdc88034eb95ae86167d
VITE_AUTHING_HOST=https://qutkgzkfaezk-demo.authing.cn
VITE_AUTHING_REDIRECT_URI_PROD=http://localhost:5173/callback

# 可选配置
VITE_DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key
VITE_GEMINI_API_KEY=your-actual-gemini-api-key
VITE_CREEM_API_KEY=creem_your-actual-creem-api-key
```

## 🎯 功能验证

### 1. 基础功能测试

访问以下页面验证功能：

- **首页**: `http://localhost:5173/`
- **配置测试**: `http://localhost:5173/api-config-test`
- **登录测试**: `http://localhost:5173/auth-test`

### 2. 核心功能测试

#### 用户认证
1. 点击任意需要登录的功能
2. 验证Authing登录弹窗正常显示
3. 完成登录流程
4. 验证登录状态正确

#### AI功能
1. 访问 `/adapt` 页面
2. 输入测试内容
3. 点击AI生成功能
4. 验证AI响应正常

#### 支付功能
1. 访问 `/vip` 页面
2. 点击升级按钮
3. 验证支付流程正常

### 3. 配置状态检查

```bash
# 运行配置检查脚本
./check-deployment-config.sh
```

确保所有必需配置显示为 ✅ 状态。

## 🚀 部署准备

### 开发环境验证

在部署到生产环境之前，确保：

- [ ] 所有必需配置已完成
- [ ] 基础功能测试通过
- [ ] AI功能响应正常
- [ ] 用户认证流程正常
- [ ] 支付功能测试通过

### 生产环境配置

#### Netlify部署
1. 运行 `./setup-deployment-config.sh` 选择Netlify
2. 在Netlify控制台设置环境变量
3. 连接GitHub仓库自动部署

#### Vercel部署
1. 运行 `./setup-deployment-config.sh` 选择Vercel
2. 在Vercel控制台设置环境变量
3. 导入GitHub仓库自动部署

## 🔍 故障排除

### 常见问题

#### 1. 依赖安装失败
```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. 环境变量未生效
```bash
# 检查环境变量文件
cat .env.local

# 重启开发服务器
npm run dev
```

#### 3. API密钥无效
- 验证API密钥格式
- 检查API密钥是否过期
- 确认API服务状态

#### 4. 网络连接问题
```bash
# 运行网络诊断
./check-deployment-config.sh
```

### 调试工具

#### 配置测试页面
访问 `/api-config-test` 获取详细诊断信息。

#### 控制台日志
打开浏览器开发者工具查看控制台日志。

#### 配置检查脚本
```bash
./check-deployment-config.sh
```

## 📚 相关资源

### 文档
- [部署环境API配置指南](DEPLOYMENT_API_CONFIG_GUIDE.md)
- [API配置最终总结](API_CONFIG_FINAL_SUMMARY.md)
- [项目README](README.md)

### 工具
- [配置脚本](setup-deployment-config.sh)
- [检查脚本](check-deployment-config.sh)
- [配置测试页面](/api-config-test)

### 支持
- [GitHub Issues](https://github.com/xiongtingping/wenpai/issues)
- [项目文档](https://github.com/xiongtingping/wenpai)

## 🎉 恭喜！

您已成功启动文派项目！现在可以开始使用各种功能：

- 🎨 **内容创作**: 多平台内容适配
- 🤖 **AI助手**: 智能内容生成
- 📚 **品牌管理**: 统一品牌资料
- 🔥 **热点分析**: 实时话题追踪
- 💰 **支付系统**: 会员升级服务

---

**提示**: 如果遇到任何问题，请查看相关文档或提交Issue获取帮助。 