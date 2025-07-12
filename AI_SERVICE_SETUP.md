# AI服务设置说明

## 🚨 重要声明

**本项目已强制配置为使用真实的OpenAI API服务，不使用任何模拟数据！**

所有内容生成请求都将调用真实的OpenAI API，确保生成的内容是真实的AI生成结果。

## 当前状态

✅ **已强制启用真实AI服务**
- 所有图像生成请求调用OpenAI DALL-E API
- 所有文本生成请求调用OpenAI GPT API
- 已移除所有模拟数据逻辑
- 网络问题时会返回错误而不是模拟数据

## 网络诊断结果

根据网络测试，当前环境存在以下问题：
- ✅ 基础网络连接正常
- ❌ DNS解析异常
- ❌ OpenAI API连接超时
- ℹ️ 未配置代理

## 解决方案

### 方案1：使用VPN服务（推荐）

1. **商业VPN服务**：
   - ExpressVPN
   - NordVPN
   - Surfshark
   - CyberGhost

2. **自建VPN**：
   - V2Ray
   - Shadowsocks
   - WireGuard

3. **配置步骤**：
   ```bash
   # 1. 安装并配置VPN
   # 2. 连接VPN
   # 3. 测试连接
   ./setup-vpn-proxy.sh
   # 4. 启动API服务器
   OPENAI_API_KEY="your-api-key" node dev-api-server.js
   ```

### 方案2：使用代理服务器

1. **配置代理**：
   ```bash
   # 运行代理配置工具
   ./setup-vpn-proxy.sh
   ```

2. **设置环境变量**：
   ```bash
   export HTTP_PROXY="http://your-proxy-server:port"
   export HTTPS_PROXY="http://your-proxy-server:port"
   export http_proxy="http://your-proxy-server:port"
   export https_proxy="http://your-proxy-server:port"
   ```

3. **启动服务器**：
   ```bash
   OPENAI_API_KEY="your-api-key" node dev-api-server.js
   ```

### 方案3：临时解决方案

1. **使用手机热点**
2. **更换网络环境**
3. **使用公共WiFi**

## 网络诊断工具

### 自动诊断
```bash
# 运行网络诊断
OPENAI_API_KEY="your-api-key" node test-network-connection.js
```

### 手动诊断
```bash
# 测试基础连接
ping 8.8.8.8

# 测试DNS解析
ping api.openai.com

# 测试OpenAI API
curl -H "Authorization: Bearer your-api-key" https://api.openai.com/v1/models
```

## API测试

### 测试图像生成
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"provider":"openai","action":"generate-image","prompt":"一只可爱的小猫","n":1}' \
  http://localhost:8888/.netlify/functions/api
```

### 测试API状态
```bash
curl "http://localhost:8888/.netlify/functions/api?provider=openai&action=status"
```

## 错误处理

### 常见错误及解决方案

1. **请求超时**
   - 原因：网络连接慢或不稳定
   - 解决：使用VPN或代理

2. **连接被拒绝**
   - 原因：网络环境限制
   - 解决：更换网络环境

3. **DNS解析失败**
   - 原因：DNS服务器问题
   - 解决：使用公共DNS (8.8.8.8, 1.1.1.1)

4. **API密钥错误**
   - 原因：API密钥无效或过期
   - 解决：检查并更新API密钥

## 开发环境配置

### 环境变量
```bash
# 必需的环境变量
export OPENAI_API_KEY="your-openai-api-key"

# 可选的代理设置
export HTTP_PROXY="http://proxy-server:port"
export HTTPS_PROXY="http://proxy-server:port"
```

### 启动命令
```bash
# 标准启动
OPENAI_API_KEY="your-api-key" node dev-api-server.js

# 使用代理启动
HTTP_PROXY="http://proxy:port" HTTPS_PROXY="http://proxy:port" \
OPENAI_API_KEY="your-api-key" node dev-api-server.js
```

## 监控和日志

### 服务器日志
- API服务器会记录所有请求和错误
- 网络超时会自动记录
- 错误信息包含详细的诊断信息

### 性能监控
- 请求响应时间监控
- 错误率统计
- 网络连接状态检查

## 故障排除

### 检查清单
- [ ] 网络连接是否正常
- [ ] VPN/代理是否配置正确
- [ ] API密钥是否有效
- [ ] 防火墙设置是否正确
- [ ] DNS设置是否正确

### 联系支持
如果问题持续存在，请：
1. 运行网络诊断工具
2. 收集错误日志
3. 提供网络环境信息
4. 联系技术支持

## 更新日志

### v2.0.0 (当前版本)
- ✅ 强制使用真实OpenAI API
- ✅ 移除所有模拟数据逻辑
- ✅ 增强错误处理和诊断
- ✅ 添加网络诊断工具
- ✅ 提供VPN/代理配置指南

### v1.x.x (历史版本)
- 支持模拟模式（已移除）
- 基础API功能
- 简单错误处理 