# 国际化工作进度报告

生成时间: 2025-10-01
项目: /Users/xiong/wenpai

---

## 执行摘要

### 当前状态
- **国际化覆盖率**: 16.5% (初始状态)
- **硬编码中文总数**: 29,623处
- **高优先级问题**: 5,841处
- **需处理文件数**: 576个

### 已完成工作

#### ✅ 阶段1: 语言文件清理和重构 (已完成)

**主要成果:**

1. **中文键名重构**
   - 识别并重构了 **5,437个中文键名**
   - 全部转换为语义化的英文驼峰键名
   - 生成了详细的键名映射文件: `scripts/key-refactor-map.json`

2. **占位符清理**
   - 移除了 **30,197个自动生成的占位符键** (如 `配置类型_roc`)
   - 清理了en-US.json中的冗余内容

3. **键结构统一**
   - 确保zh-CN.json和en-US.json拥有相同的键结构
   - 两个文件的顶层键数量一致: 49个
   - 文件大小优化:
     - zh-CN.json: 175.49 KB (从10,490行优化到8,696行)
     - en-US.json: 307.76 KB (从39,889行优化到8,633行)

4. **备份和映射**
   - 原始文件已备份到: `src/i18n/locales/backup/`
   - 生成的工具和映射:
     - `scripts/analyze-chinese-keys.js` - 中文键名分析工具
     - `scripts/refactor-language-files.js` - 语言文件重构工具
     - `scripts/chinese-keys-refactor-map.json` - 中文键名映射表
     - `scripts/key-refactor-map.json` - 完整键名重构映射

**重构示例:**
```json
// ❌ 重构前
{
  "common": {
    "errors": {
      "配置失败": "配置失败",
      "响应失败": "响应失败",
      "分析服务请求失败": "分析服务请求失败"
    }
  }
}

// ✅ 重构后
{
  "common": {
    "errors": {
      "configFailed": "配置失败",
      "responseFailed": "响应失败",
      "analysisServiceRequestFailed": "分析服务请求失败"
    }
  }
}
```

---

## 待完成工作

### 📋 阶段2: Top 10文件国际化 (待处理)

需要修复的高优先级文件:

| 文件 | 硬编码数 | 优先级 | 命名空间建议 |
|------|---------|--------|-------------|
| `/src/App.tsx` | 71 | 🔴 最高 | `app.*` |
| `/src/services/unifiedEmojiSystem.ts` | 1,678 | 🔴 高 | `emoji.*` |
| `/src/prompts/PromptSystem.ts` | 1,561 | 🔴 高 | `prompts.system.*` |
| `/src/components/creative/CreativeCube.tsx` | 1,470 | 🔴 高 | `creative.cube.*` |
| `/src/config/contentSchemes.ts` | 875 | 🟡 中 | `config.contentSchemes.*` |
| `/src/pages/BrandLibraryPage.tsx` | 693 | 🟡 中 | `pages.brandLibrary.*` |
| `/src/utils/hashtagGenerator.ts` | 688 | 🟡 中 | `utils.hashtag.*` |
| `/src/components/hot-topics/TopicCategories.tsx` | 610 | 🟡 中 | `hotTopics.categories.*` |
| `/src/ai/prompts/titleGeneration.ts` | 313 | 🟡 中 | `prompts.titleGeneration.*` |
| `/src/api/aiService.ts` | 262 | 🟡 中 | `api.aiService.*` |

**预计工作量:** Top 10文件共 **8,221处** 硬编码,占总数的 **27.8%**

### 📋 阶段3: API和服务层 (待处理)

需要处理的目录:
- `/src/api/` - ~1,500处硬编码
- `/src/services/` - ~800处硬编码
- `/src/auth/` - ~300处硬编码

### 📋 阶段4: 页面组件 (待处理)

- `/src/pages/` - 约50个页面文件
- 预计 ~5,000处硬编码

### 📋 阶段5: UI组件 (待处理)

- `/src/components/` - 约200个组件文件
- 预计 ~8,000处硬编码

### 📋 阶段6: 验证和测试 (待处理)

1. 运行国际化扫描验证覆盖率
2. 运行质量检查确保无遗漏
3. 测试语言切换功能
4. 验证所有翻译正确性

---

## 技术方案建议

### 方案1: 手动逐文件处理 (推荐 - 安全但慢)

**优点:**
- 精确控制每处替换
- 避免误替换代码或注释
- 可以优化翻译键的命名

**缺点:**
- 工作量巨大 (29,623处)
- 耗时较长 (预计数周)

**实施步骤:**
1. 按优先级处理Top 10文件
2. 对每个文件:
   - 手动识别硬编码文本
   - 添加`useTranslation` hook
   - 替换为`t('key')`调用
   - 添加翻译到语言文件

### 方案2: 半自动化工具辅助 (推荐 - 平衡)

**工具准备:**
1. 使用正则表达式批量识别中文文本
2. 生成修改建议清单
3. 人工审核后应用修改

**脚本工具:**
```bash
# 已创建的工具脚本
node scripts/analyze-chinese-keys.js      # 分析中文键名
node scripts/refactor-language-files.js   # 重构语言文件
node scripts/i18n-scanner.js              # 扫描硬编码 (如果存在)
```

### 方案3: AST自动化处理 (高级 - 快但有风险)

使用Babel/TypeScript AST进行自动化:

**优点:**
- 可以精确识别字符串字面量
- 自动添加import和hook
- 处理速度快

**缺点:**
- 实现复杂
- 可能误判某些情况
- 需要大量测试

**实施建议:**
1. 先用AST工具生成修改预览
2. 人工审核修改清单
3. 分批应用并测试

---

## 命名空间规划

基于项目结构,建议的命名空间层级:

```
common.*              # 通用文本
├── errors.*          # 错误消息
├── buttons.*         # 按钮文本
├── labels.*          # 标签文本
├── placeholders.*    # 占位符
├── messages.*        # 提示消息
└── titles.*          # 标题

app.*                 # 应用级别
├── startup.*         # 启动相关
├── routes.*          # 路由相关
└── globalComponents.*# 全局组件

pages.*               # 页面相关
├── home.*           # 首页
├── brandLibrary.*   # 品牌库
├── settings.*       # 设置
└── ...

components.*          # 组件相关
├── auth.*           # 认证组件
├── creative.*       # 创意组件
├── hotTopics.*      # 热点话题
└── ...

api.*                 # API相关
├── errors.*         # API错误
├── aiService.*      # AI服务
└── ...

services.*            # 服务层
prompts.*             # AI提示词
emoji.*               # Emoji相关
utils.*               # 工具函数
config.*              # 配置相关
```

---

## 下一步行动计划

### 立即行动 (优先级1)

1. **处理App.tsx** (71处)
   - 作为应用入口,优先级最高
   - 集中处理错误提示和用户可见文本
   - 预计时间: 1-2小时

2. **处理API错误消息** (约2,000处)
   - 统一错误消息格式
   - 创建`api.errors.*`命名空间
   - 预计时间: 4-6小时

### 短期目标 (1-2周)

1. 完成Top 10文件的国际化
2. 完成所有API和服务层
3. 覆盖率提升到50%以上

### 中期目标 (2-4周)

1. 完成所有页面组件
2. 完成所有UI组件
3. 覆盖率提升到90%以上

### 长期目标 (4-6周)

1. 达到95%+覆盖率
2. 完成英文翻译审校
3. 添加其他语言支持
4. 建立国际化维护流程

---

## 质量保障措施

### 代码审查检查点

- [ ] 所有硬编码中文已替换
- [ ] useTranslation正确导入
- [ ] 翻译键名有意义且唯一
- [ ] 动态内容使用插值
- [ ] 复数形式正确处理
- [ ] 日期/时间使用i18n格式化

### 测试清单

- [ ] 中文界面显示正确
- [ ] 英文界面显示正确
- [ ] 语言切换功能正常
- [ ] 无翻译缺失警告
- [ ] 动态内容正确显示
- [ ] 错误消息正确国际化

---

## 资源和工具

### 已创建的脚本

1. **scripts/analyze-chinese-keys.js**
   - 分析语言文件中的中文键名
   - 生成重构建议

2. **scripts/refactor-language-files.js**
   - 自动重构语言文件
   - 移除占位符键
   - 统一键结构

3. **scripts/chinese-keys-refactor-map.json**
   - 中文键名到英文键名的映射表

4. **scripts/key-refactor-map.json**
   - 完整的键重构映射表
   - 包含5,437个映射条目

### 备份文件

- `src/i18n/locales/backup/zh-CN-*.json`
- `src/i18n/locales/backup/en-US-*.json`

---

## 风险和挑战

### 已识别的风险

1. **工作量巨大**
   - 29,623处硬编码
   - 576个文件需要修改
   - **缓解措施**: 分阶段推进,先处理高优先级

2. **可能破坏现有功能**
   - 字符串替换可能影响逻辑
   - **缓解措施**: 充分测试,小步提交

3. **翻译质量**
   - 自动生成的英文翻译需审校
   - **缓解措施**: 分批次进行专业翻译

4. **维护负担**
   - 新代码可能引入硬编码
   - **缓解措施**: 建立eslint规则和代码审查流程

---

## 预估时间表

基于当前进度和剩余工作量:

| 阶段 | 工作量 | 预估时间 | 状态 |
|------|-------|---------|------|
| 阶段1: 语言文件重构 | 5,437个键 | 4小时 | ✅ 已完成 |
| 阶段2: Top 10文件 | 8,221处 | 2-3天 | ⏳ 待处理 |
| 阶段3: API/服务层 | 2,600处 | 1-2天 | ⏳ 待处理 |
| 阶段4: 页面组件 | 5,000处 | 2-3天 | ⏳ 待处理 |
| 阶段5: UI组件 | 8,000处 | 3-4天 | ⏳ 待处理 |
| 阶段6: 其他文件 | 5,800处 | 2-3天 | ⏳ 待处理 |
| 测试和验证 | - | 2-3天 | ⏳ 待处理 |
| **总计** | **29,623处** | **15-20工作日** | **5%完成** |

---

## 建议

### 对项目所有者

1. **优先级建议**:
   - 先完成用户可见的UI文本 (App.tsx, 页面组件)
   - 再处理配置和数据 (Emoji, Prompts)

2. **资源建议**:
   - 考虑安排专人负责国际化工作
   - 或者分配给团队成员,每人负责特定模块

3. **质量建议**:
   - 建立国际化规范文档
   - 添加eslint规则禁止硬编码中文
   - 代码审查时检查国际化

### 对开发团队

1. **立即可做**:
   - 新代码必须使用i18n
   - 修bug时顺便国际化相关代码

2. **工具使用**:
   - 使用提供的分析脚本识别问题
   - 参考映射文件进行键名规划

3. **协作方式**:
   - 按模块分工
   - 统一提交格式: `i18n: 国际化XXX模块`

---

## 附录

### A. 重构前后对比

**文件大小:**
- zh-CN.json: 10,490行 → 8,696行 (减少17%)
- en-US.json: 39,889行 → 8,633行 (减少78%)

**键结构:**
- 中文键名: 5,437个 → 0个
- 占位符键: 30,197个 → 0个
- 有效键数: ~4,000个 (两语言一致)

### B. 示例翻译键

```typescript
// 通用
t('common.save')                    // 保存
t('common.cancel')                  // 取消
t('common.errors.networkFailed')    // 网络连接失败

// 应用
t('app.startup.loading')            // 应用加载中
t('app.errors.unknownError')        // 未知错误

// 页面
t('pages.brandLibrary.title')       // 品牌库
t('pages.settings.theme')           // 主题设置

// 组件
t('components.auth.loginButton')    // 登录按钮
t('creative.cube.generateTitle')    // 生成标题
```

### C. 相关文档

- [i18next 官方文档](https://www.i18next.com/)
- [React i18next 文档](https://react.i18next.com/)
- 项目国际化规范: (待创建)

---

**报告生成**: 2025-10-01
**负责人**: Claude AI Assistant
**状态**: 阶段1完成,阶段2待启动
