# OpenAI API密钥修复指南

## 🔍 问题诊断

根据错误日志，Netlify Functions返回500错误：
```
Incorrect API key provided: sk-svcac**************
```

## 🎯 问题原因

1. **API密钥格式错误**：当前密钥 `sk-svcac` 不是有效的OpenAI API密钥格式
2. **密钥已过期或无效**：密钥可能已被撤销或账户余额不足
3. **环境变量配置错误**：Netlify环境变量中的密钥不正确

## 🔧 修复步骤

### 步骤1：检查OpenAI账户
1. 访问 [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. 检查API密钥是否有效
3. 确认账户余额充足
4. 如有需要，生成新的API密钥

### 步骤2：更新Netlify环境变量

#### 方法A：通过Netlify控制台
1. 登录 [Netlify控制台](https://app.netlify.com/)
2. 选择项目 `wenpai`
3. 进入 `Site settings` → `Environment variables`
4. 找到 `OPENAI_API_KEY`
5. 点击编辑，输入正确的API密钥
6. 保存更改

#### 方法B：通过Netlify CLI
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 登录Netlify
netlify login

# 查看当前环境变量
netlify env:list

# 设置正确的API密钥
netlify env:set OPENAI_API_KEY sk-your-actual-api-key-here

# 重新部署
netlify deploy --prod
```

### 步骤3：验证修复
1. 等待Netlify重新部署（通常1-2分钟）
2. 访问 `/ai-test` 页面测试AI功能
3. 检查浏览器控制台是否还有500错误

## 🛡️ 临时解决方案

当前系统已配置**本地模拟响应**，即使Netlify Functions失败，AI分析功能仍可正常工作：

### 功能状态
- ✅ **品牌资料分析**：使用模拟数据
- ✅ **文件解析**：支持多种格式
- ✅ **用户界面**：完全正常
- ✅ **开发体验**：不受影响

### 测试方法
访问 `http://localhost:3000/ai-test` 测试AI功能

## 📋 API密钥格式要求

### 正确的格式
```
sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 检查要点
1. 以 `sk-` 开头
2. 总长度约51个字符
3. 包含字母和数字
4. 无空格或特殊字符

## 🔄 部署流程

修复API密钥后，需要重新部署：

```bash
# 构建项目
npm run build

# 部署到Netlify
netlify deploy --prod
```

## 📞 技术支持

如果问题持续存在：

1. **检查OpenAI账户状态**
2. **验证API密钥权限**
3. **确认网络连接**
4. **查看Netlify函数日志**

## 🎉 成功标志

修复成功后，你应该看到：
- 浏览器控制台不再有500错误
- AI分析返回真实数据而非模拟数据
- 响应时间更快（真实API调用）

---

**注意**：当前本地模拟响应确保开发不受影响，可以继续正常使用所有功能。 