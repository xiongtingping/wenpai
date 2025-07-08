# 🚀 文派手动部署指南

## 📋 当前状态
- ✅ 项目已构建完成
- ✅ 代码已本地提交
- ⚠️ 因网络问题暂时无法推送到GitHub
- 📦 构建文件位于 `dist/` 目录

## 🌐 方案1: Netlify 手动部署（推荐）

### 步骤1: 拖拽部署
1. 打开 [Netlify控制台](https://app.netlify.com/)
2. 点击 "Add new site" → "Deploy manually"
3. 直接拖拽 `dist` 文件夹到部署区域
4. 等待部署完成（通常1-2分钟）

### 步骤2: 配置环境变量
在 Site settings → Environment variables 中添加：
```
VITE_AUTHING_APP_ID=你的Authing应用ID
VITE_AUTHING_DOMAIN=你的Authing域名
VITE_OPENAI_API_KEY=你的OpenAI密钥
VITE_DEEPSEEK_API_KEY=你的DeepSeek密钥
VITE_GEMINI_API_KEY=你的Gemini密钥
```

### 步骤3: 配置自定义域名
1. 在 Domain settings → Custom domains
2. 添加域名：`www.wenpai.xyz`
3. 配置DNS记录（见下方DNS配置）

## 🔧 DNS 配置（Namecheap）

访问：https://ap.www.namecheap.com/domains/domaincontrolpanel/wenpai.xyz/advancedns

### 添加记录：
```
类型：A Record
主机：@
值：75.2.60.5（Netlify主IP）
TTL：Automatic

类型：CNAME Record
主机：www
值：你的站点名.netlify.app
TTL：Automatic
```

## 🚀 方案2: 等待网络恢复后自动部署

当网络恢复后，运行：
```bash
# 重新尝试推送
git push origin main

# 如果推送成功，Netlify会自动部署
```

## 🔄 方案3: 使用其他Git服务

如果GitHub持续有问题，可以：
1. 推送到Gitee或其他Git服务
2. 在Netlify连接新的仓库
3. 或使用拖拽部署方式

## 🧪 部署后验证

1. **访问网站**：https://www.wenpai.xyz
2. **测试登录**：确保Authing登录正常
3. **测试功能**：内容适配、热点话题等
4. **检查控制台**：确保无JavaScript错误

## 📞 支持

如需帮助，可以：
- 检查Netlify部署日志
- 验证DNS解析状态
- 测试API密钥配置

---

**注意：** 手动部署不会自动更新，如需更新请重新构建并拖拽部署。建议网络恢复后切换到Git集成部署。 