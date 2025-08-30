# 文派AI - Claude Code 开发文档

## 项目概述
文派AI是一个基于现代化技术栈的企业级智能内容创作平台，集成多AI模型、统一认证、实时热点追踪等功能。提供AI驱动的内容适配、创意生成、多平台发布和自动化工作流功能。

## 技术栈

### 前端技术
- **React**: 18.3.1 - 用户界面构建
- **TypeScript**: 5.7.2 - 类型安全的JavaScript
- **Vite**: 7.0.5 - 构建工具和开发服务器
- **Tailwind CSS**: 3.0 - 原子化CSS框架
- **shadcn/ui**: Latest - 现代化UI组件库
- **Radix UI**: Latest - 无障碍UI基础组件

### 状态管理与路由
- **Zustand** - 轻量级状态管理
- **React Router v6** - 客户端路由
- **React Hook Form** - 表单状态管理

### 认证与安全
- **Authing Guard**: v5.1.0 - 企业级身份认证服务
- **JWT** - 安全令牌认证
- **统一权限管理** - 基于角色的访问控制

### AI 服务集成
- **OpenAI GPT-4o** - 最新文本生成和对话模型
- **DeepSeek Chat** - 中文优化的AI模型
- **Google Gemini Pro** - 多模态AI能力
- **统一AI服务** - 环境感知的智能路由
- **智能提示词系统** - 模块化提示词管理

## 核心功能模块

### 1. 认证系统 (已稳定)
- **位置**: `/src/contexts/UnifiedAuthContext.tsx`
- **状态**: 🔒 LOCKED - 已验证稳定，禁止修改
- **技术**: Authing Guard React18官方SDK
- **配置**: 
  - AppId: `68a68a29d0c3341ae7a3df23`
  - Host: `https://rzcswqs4sq0f.authing.cn`
  - 模式: Modal模态框登录

### 2. 核心功能特性

#### 多平台内容适配
- 一键适配微信公众号、小红书、知乎、抖音等主流平台
- 智能风格转换和品牌调性保持
- 平台特性优化 (字数限制、格式要求等)

#### AI智能工具集
- **🎨 九宫格创意魔方**: AI驱动的创意内容生成，支持多维度创意组合
- **📄 内容提取智采器**: 支持URL、文件、文本多源内容提取和AI总结
- **😊 AI Emoji生成器**: 智能生成个性化Emoji图片和推荐
- **🔖 智能收藏管理**: 网络资源分类整理，支持标签和状态管理
- **📱 朋友圈文案模板**: 专业设计的社交媒体文案模板库
- **🧠 智能标题生成器**: 基于AI的多平台标题优化生成

#### 实时数据服务
- **📊 热点话题聚合**: 实时获取全网热点，支持平台筛选和趋势分析
- **🎯 智能内容推荐**: 基于用户偏好和热点趋势的内容推荐
- **📈 数据统计分析**: 内容创作效果分析和用户行为洞察

### 3. 主要页面
- **首页**: `/src/pages/HomePage.tsx` - 产品介绍和功能展示 (全屏Hero设计)
- **内容适配**: `/src/pages/AdaptPage.tsx` - AI内容平台适配功能 (5399行)
- **创意魔方**: `/src/pages/CreativeStudioPage.tsx` - 创意内容生成工具
- **全网雷达**: `/src/pages/HotTopicsPage.tsx` - 热点话题追踪 (2168行)
- **品牌库**: `/src/pages/BrandLibraryPage.tsx` - 品牌素材管理 (3723行)
- **用户设置**: `/src/pages/SettingsPage.tsx` - 个人设置和偏好
- **内容提取器**: `/src/pages/ContentExtractorPage.tsx` - 多源内容提取
- **Emoji生成器**: `/src/pages/EmojiPage.tsx` - AI Emoji创作工具
- **智能收藏**: `/src/pages/BookmarkPage.tsx` - 收藏夹管理
- **朋友圈模板**: `/src/pages/WechatTemplatePage.tsx` - 社交媒体模板

### 4. 项目结构概览
```
src/
├── 📁 ai/                    # 新一代AI服务架构
│   ├── 📁 providers/         # AI服务提供商 (OpenAI, DeepSeek, Gemini)
│   ├── 📁 prompts/           # 智能提示词系统
│   └── 📁 utils/             # AI工具函数
├── 📁 api/                   # API 服务层
│   ├── aiService.ts          # 统一AI服务核心
│   ├── unifiedAIService.ts   # 环境感知AI路由
│   ├── hotTopicsService.ts   # 热点话题API
│   └── contentAdapter.ts     # 内容适配服务
├── 📁 components/            # React 组件
│   ├── 📁 ui/               # 基础UI组件 (shadcn/ui)
│   ├── 📁 auth/             # 认证相关组件
│   ├── 📁 creative/         # 创意工具组件
│   ├── 📁 landing/          # 落地页组件
│   └── 📁 layout/           # 布局组件
├── 📁 contexts/             # React Context
├── 📁 stores/               # Zustand 状态管理
├── 📁 services/             # 业务服务
├── 📁 utils/                # 工具函数
└── 📁 config/               # 配置文件
```

### 5. 权限和路由保护
- **路由守卫**: `/src/components/auth/RouteGuard.tsx`
- **权限系统**: 基于用户等级 (free/pro/premium) 的功能访问控制
- **升级提示**: 自动显示功能限制和升级引导
- **AuthGuard**: `/src/components/auth/AuthGuard.tsx` - 基础认证保护
- **角色守卫**: ProGuard, PremiumGuard, AdminGuard 等专用守卫组件

## 开发指南

### 启动开发服务器
```bash
npm run dev
# 访问: http://localhost:5173 (或5174)
```

### 构建生产版本
```bash
npm run build
npm run preview
```

### 代码规范
- 使用TypeScript严格模式
- 组件采用函数式组件 + Hooks
- CSS使用Tailwind utility类
- 文件命名采用PascalCase
- 导入路径使用`@/`别名

### 环境变量配置

#### 生产环境配置
关键配置在 `/dist/index.html` 中的 `window.__ENV__` 对象：
- `VITE_AUTHING_APP_ID`: Authing应用ID (当前: `68a68a29d0c3341ae7a3df23`)
- `VITE_AUTHING_HOST`: Authing服务主机 (当前: `https://rzcswqs4sq0f.authing.cn`)
- `VITE_API_BASE_URL`: 后端API地址

#### 开发环境配置 (.env.local)
```bash
# AI API Keys - AI服务密钥
VITE_OPENAI_API_KEY=sk-your-openai-api-key
VITE_OPENAI_MODEL=gpt-4o
VITE_DEEPSEEK_API_KEY=sk-your-deepseek-api-key
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_GEMINI_API_KEY=your-gemini-api-key

# Authing 认证配置 (已预配置)
VITE_AUTHING_APP_ID=68823897631e1ef8ff3720b2
VITE_AUTHING_DOMAIN=rzcswqs4sq0f.authing.cn
VITE_AUTHING_HOST=https://rzcswqs4sq0f.authing.cn
VITE_AUTHING_REDIRECT_URI_DEV=http://localhost:5174/callback

# 应用配置
VITE_API_BASE_URL=https://www.wenpai.xyz/api
VITE_DEBUG_MODE=false
VITE_ENABLE_AI_FEATURES=true
```

#### 环境感知AI路由
系统自动根据环境选择AI调用方式：
- **开发环境**: 直连AI服务商API，便于调试
- **生产环境**: 通过Netlify Functions代理，保护API密钥
- **智能降级**: API失败时自动切换到备用服务

## API 使用指南

### 统一AI服务 API
```typescript
import { callAI } from '@/api/aiService';

// 基础AI调用
const result = await callAI({
  prompt: "写一篇关于人工智能的文章",
  taskType: AITaskType.CONTENT_GENERATION,
  model: "gpt-4o",
  maxTokens: 1000
});

// 带系统提示词的调用
const result = await callAI({
  prompt: "分析这个品牌",
  systemPrompt: "你是一个专业的品牌分析师",
  taskType: AITaskType.BRAND_ANALYSIS,
  temperature: 0.3
});
```

### 热点话题 API
```typescript
import { fetchHotTopics } from '@/api/hotTopicsService';

// 获取所有平台热点
const allTopics = await fetchHotTopics();

// 获取指定平台热点
const weiboTopics = await fetchHotTopics('weibo');
```

### 统一请求封装
所有HTTP请求必须通过统一封装：
```typescript
import { request } from '@/api/request';

// GET请求
const data = await request.get('/api/endpoint');

// POST请求
const result = await request.post('/api/endpoint', {
  param1: 'value1',
  param2: 'value2'
});
```

## 代码质量与重构状态

### 大型组件重构计划
项目正在进行模块化重构，当前状态：

| 文件名 | 当前行数 | 状态 | 重构计划 |
|--------|----------|------|----------|
| **AdaptPage.tsx** | 5,399行 | 🔄 计划重构 | 拆分为6个模块 |
| **BrandLibraryPage.tsx** | 3,723行 | ✅ 已修复JSX错误 | 拆分为5个模块 |
| **HotTopicsPage.tsx** | 2,168行 | 🔄 监控中 | 逐步优化 |
| **CreativeCube.tsx** | 2,622行 | 🔄 监控中 | 组件拆分 |
| **PromptSystem.ts** | 2,245行 | ✅ 功能完整 | 模块化提示词 |

### 重构原则
- ✅ **原文件备份**: 保留原始文件作为回退方案
- ✅ **渐进式重构**: 逐步替换，确保功能完整性
- ✅ **向后兼容**: 新接口兼容旧调用方式
- ✅ **回归保护**: 每次变更都有测试覆盖

## 最近修复 (2025-08)

### 1. Authing认证系统完全重构
**问题**: 400 Bad Request `redirect_uri_mismatch`错误，Guard模态框不显示
**解决方案**: 
1. 从错误的SDK (`@authing/guard`) 迁移到官方 `@authing/guard-react18`
2. 实现正确的`<GuardProvider>` + `useGuard()` Hook模式  
3. 修复模态框CSS定位问题 (从`y:9695`修复到可视区域)
4. 解决aria-hidden accessibility警告

**关键文件变更**:
- `src/App.tsx`: 添加GuardProvider包装
- `src/contexts/UnifiedAuthContext.tsx`: 完全重写使用useGuard Hook
- `src/styles/authing-guard-overrides.css`: 修复模态框定位和可见性
- `package.json`: 更新到正确的依赖包

### 2. UI/UX 全面优化 (2025-08-30)
**修复内容**:
1. **Header导航系统** - 修复z-index冲突，实现固定定位
2. **主题切换组件** - 优化下拉菜单z-index层级
3. **滚动到顶部功能** - 添加全局滚动控制组件
4. **实时预览优化** - 减少防抖延迟，提升响应性
5. **导航高亮修复** - 改进路径匹配逻辑
6. **登录表单优化** - 增强布局和用户体验
7. **首页Hero区域** - 优化为全屏显示设计
8. **权限守卫系统** - 全面审查和优化权限控制
9. **用户数据隔离** - 强化数据安全和ID绑定
10. **API降级机制** - 添加mock数据fallback系统

### 3. 数据安全审计完成
**审计结果**:
- ✅ 认证系统使用真实Authing API，无模拟数据
- ✅ 用户数据完全隔离，基于userId的存储体系
- ✅ 邀请奖励和使用统计正确绑定用户ID
- ✅ 权限守卫系统经过全面审查
- ✅ API请求统一封装，安全可控

## 核心开发规则

### 🚨 API调用规则 - 禁止本地模拟 (ERROR级别)

**规则名称**: `api_prohibit_local_mock_error`  
**严重程度**: ERROR  
**模块**: API

**规则描述**: 禁止使用本地模拟、降级方案，所有功能必须依赖真实可用的 API 模型服务（如 OpenAI、DeepSeek），确保调用结果与生产环境一致。

**强制要求**:
- ✅ 调用链必须连接至真实的在线 API 服务
- ❌ 禁止使用本地 mock 数据文件或硬编码 JSON 响应
- ❌ 禁止使用静态模板、占位内容、固定延迟模拟接口响应
- ❌ 禁止使用固定响应字符串或数据结构替代真实调用

**违规关键词监控**:
- `mock数据`, `本地mock`, `降级方案`, `静态模板`
- `占位内容`, `固定延迟`, `固定响应`, `硬编码响应`
- `假接口`, `fake API`, `stub`, `placeholder response`, `fake response`

**执行动作**: 检测到本地模拟或降级调用时，阻止任务执行并提示必须连接真实 API 服务。

**正确示例**:
```typescript
// ✅ 正确：使用真实API服务
import { callAI } from '@/api/aiService';
const result = await callAI({
  prompt: "用户输入内容",
  model: "gpt-4o" // 连接真实OpenAI服务
});
```

**错误示例**:
```typescript
// ❌ 错误：使用模拟数据
const mockResponse = "这是模拟的AI生成内容";
return { content: mockResponse, success: true };

// ❌ 错误：降级方案
if (apiCallFailed) {
  return { content: "默认模板内容", success: true };
}
```

### 🏗️ 构建部署规则 - 现代Web部署标准 (ERROR级别)

**规则名称**: `build_check_modern_web_deploy_standard_error`  
**严重程度**: ERROR  
**模块**: Build

**规则描述**: 检查当前项目是否符合现代 Web 项目的部署标准要求，全面排查可能导致构建失败、部署路径错误、环境变量缺失、浏览器访问失败、SSR 或静态部署不兼容的隐患。当执行 push 或部署操作时自动触发该检查，确保在上线前发现并修复问题。

**检查清单**:
1. **构建产物路径**: 构建命令是否正确（如 npm run build），输出目录是否标准（.next, dist, build），是否有 HTML、CSS、JS 等文件遗漏
2. **路径与资源访问**: 是否存在硬编码绝对路径（如 /static/img/logo.png），静态资源是否正确导入，路径写法是否适配部署平台
3. **环境变量**: .env 变量是否有 fallback/默认值，构建/部署时所需变量是否已设置，process.env 调用是否正确编译注入
4. **接口请求兼容性**: 是否存在写死的 localhost 请求，是否使用部署不安全方式获取地址，跨域支持是否完整
5. **SSR/静态部署兼容性**: 是否使用了仅浏览器可用对象导致 SSR 报错，动态导入是否正常，是否区分 SSR 与客户端渲染逻辑
6. **构建配置（Vite/Next.js）**: 是否正确配置 base 或 assetPrefix，构建目录是否适配部署平台
7. **动态路由与路由守卫**: 是否正确使用路由库，受保护页面是否正常跳转，404 fallback 是否生效

**执行动作**: 在 push 或部署命令执行时自动运行该规则，输出部署问题清单（按模块列出）、修复建议（代码或配置）并标注高危项（🔥）。禁止修改 UI 样式或重写业务组件，所有建议必须兼容构建与部署平台（如 Vercel、Netlify、静态服务器）。

**违规关键词监控**:
- 构建相关: `构建失败`, `部署失败`, `构建路径错误`, `部署路径错误`
- 环境配置: `环境变量缺失`, `.env缺失`, `process.env错误`
- 资源路径: `静态资源路径错误`, `assetPrefix错误`, `base路径错误`
- 渲染兼容: `SSR错误`, `静态部署不兼容`, `Next.js构建错误`, `Vite构建错误`
- 网络请求: `localhost请求`, `跨域问题`
- 路由问题: `动态路由错误`, `404未配置`, `路由守卫失效`, `打包配置错误`

**部署前必检项目**:
```bash
# ✅ 构建验证
npm run build
npm run type-check
npm run lint

# ✅ 预览测试
npm run preview

# ✅ 环境变量检查
echo "检查关键环境变量..."
```

**🔥 高危问题标识**:
- 🔥 硬编码localhost请求导致生产环境调用失败
- 🔥 缺失关键环境变量导致应用无法启动
- 🔥 SSR不兼容代码导致服务端渲染崩溃
- 🔥 路由守卫失效导致权限控制失效

### 🤖 核心模型信息规则 - 会话模型确认 (CRITICAL级别)

**规则名称**: `core_confirm_model_info_critical`  
**严重程度**: CRITICAL  
**模块**: Core

**规则描述**: 每次会话开始必须告知当前使用的 AI 模型名称。

**强制要求**:
- ✅ 必须输出模型名称

**执行动作**: 确保模型信息明确告知用户

**违规关键词监控**:
- `模型名称`, `当前模型`, `AI模型`, `使用模型`
- `model name`, `current model`, `gpt版本`
- `模型信息`, `模型标识`, `AI版本`

**当前会话模型**: **Claude Sonnet 4** (claude-sonnet-4-20250514)

### 🔧 调试分析规则 - 通用AI编程调试模板 (INFO级别)

**规则名称**: `debug_general_coding_template`  
**严重程度**: INFO  
**模块**: Debug

**规则描述**: 提供通用的 AI Coding 调试分析模板，确保调试过程系统化、可验证，而非一次性给出结论。

**强制调试流程**:
1. **第一步：问题梳理** - 梳理报错或异常现象，并用自然语言复述
2. **第二步：根因分析** - 列出可能根因（≥3），每个包含触发条件、证据、概率
3. **第三步：验证排除** - 执行验证与排除，标记假设与已验证部分
4. **第四步：修复检查清单** - 修复前给出checklist（调用链、配置、依赖、根因确认、副作用评估）
5. **第五步：修复方案** - 提出修复方案，先解释影响范围再给代码
6. **第六步：二次审查** - 扮演审查员进行二次验证

**执行动作**: 当用户请求调试时，强制使用此流程生成分析，而不是直接输出修复代码。

**违规关键词监控**:
- `Debug流程`, `候选根因`, `概率排序`, `症状`
- `验证步骤`, `Checklist`, `修复方案`  
- `二次审查`, `调试模板`

**调试模板示例**:
```
🔍 **第一步：问题现象**
- 错误描述：[自然语言复述]
- 触发条件：[何时发生]
- 影响范围：[哪些功能受影响]

🧠 **第二步：候选根因**
1. [根因A] - 概率70% - 证据：[具体证据]
2. [根因B] - 概率20% - 证据：[具体证据] 
3. [根因C] - 概率10% - 证据：[具体证据]

✅ **第三步：验证结果**
- [已验证] 根因A：[验证方法] → [结果]
- [已排除] 根因B：[排除依据]

📋 **第四步：修复检查清单**
- [ ] 调用链检查
- [ ] 配置验证
- [ ] 依赖确认
- [ ] 副作用评估

🛠️ **第五步：修复方案**
- 影响范围：[说明]
- 修复代码：[代码实现]

🔍 **第六步：审查验证**
- 修复是否彻底
- 是否引入新问题
- 测试验证结果
```

### 🚨 调试修复规则 - 禁止绕过隐藏错误 (CRITICAL级别)

**规则名称**: `debug_no_patch_hide_error`  
**严重程度**: CRITICAL  
**模块**: Debug

**规则描述**: 禁止通过绕过、隐藏或临时 patch 的方式处理问题，必须真正修复根因。

**强制要求**:
- ❌ 禁止在未确认根因前直接输出修复代码
- ❌ 禁止通过 try/catch 包裹或静默错误日志来掩盖问题
- ❌ 禁止通过条件判断跳过触发错误的逻辑而不修复
- ❌ 禁止使用临时 patch（如 return 空值、mock 数据）代替真实解决方案

**执行动作**: 在修复前必须输出根因候选清单，并验证后确认再修复。

**违规关键词监控**:
- `绕过错误`, `隐藏问题`, `patch`, `临时修复`, `静默错误`
- `掩盖根因`, `bypass`, `hack fix`, `quick patch`

### 🔍 调试根因规则 - 追溯解决根因 (ERROR级别)

**规则名称**: `debug_focus_on_root_cause_error`  
**严重程度**: ERROR  
**模块**: Debug

**规则描述**: 必须追溯并解决根因，而不是仅处理表层症状。

**强制要求**:
- ❌ 禁止仅修改表层报错代码（如 UI 层提示、console.log）而忽略底层逻辑错误
- ❌ 禁止修复次生问题而不追溯来源
- ✅ 必须明确区分【症状】与【根因候选】

**执行动作**: 要求在修复前输出根因分析（≥3个候选，并附概率），确认源头后再修复。

**违规关键词监控**:
- `根因分析`, `症状 vs 根因`, `trace back`, `真正解决`
- `source issue`, `causal analysis`

### ⚠️ 调试禁止规则 - 禁止假修复 (WARNING级别)

**规则名称**: `debug_prohibit_fake_fix_warning`  
**严重程度**: WARNING  
**模块**: Debug

**规则描述**: 禁止通过删除、注释掉或屏蔽代码来规避问题。

**强制要求**:
- ❌ 不得通过注释/删除触发报错的代码行来掩盖问题
- ❌ 不得通过条件语句直接跳过问题代码
- ❌ 不得通过禁用功能绕过错误

**执行动作**: 必须保证原有功能可运行，并通过修复逻辑来解决问题，而不是移除功能。

**违规关键词监控**:
- `假修复`, `注释掉`, `删除绕过`, `skip logic`
- `disable feature`, `fake fix`

### 🔬 调试验证规则 - 修复方案验证 (WARNING级别)

**规则名称**: `debug_validate_fix_strategy_warning`  
**严重程度**: WARNING  
**模块**: Debug

**规则描述**: 在输出修复方案前必须进行验证，避免'先改后试'的盲修。

**强制要求**:
- ✅ 修复前必须解释修复思路与适用范围
- ✅ 必须说明可能副作用
- ✅ 必须经过至少一次逻辑自查，确保方案合理

**执行动作**: 在输出修复代码前，先扮演代码审查员，审视修复的正确性和副作用。

**违规关键词监控**:
- `修复验证`, `先分析后修复`, `自查`, `验证根因`
- `合理性检查`, `避免盲修`

### ⚠️ 调试过度自信规则 - 防止武断认定根因 (WARNING级别)

**规则名称**: `debug_prevent_overconfidence`  
**严重程度**: WARNING  
**模块**: Debug

**规则描述**: 禁止 AI 在调试时武断认定'已经找到根因'，必须列出多个可能性，并进行概率和验证分析。

**强制要求**:
- ❌ 禁止直接声称'已找到根因'
- ✅ 必须输出至少 3 个【根因候选】并附带概率评估
- ✅ 必须区分【症状】与【根因候选】，不可混淆
- ✅ 在修复前必须输出 checklist（调用链、配置、依赖、根因 vs 症状、副作用）
- ✅ 修复方案需经过二次自查，避免仅掩盖问题

**执行动作**: 若发现模型直接认定唯一根因，应阻止修复输出并提示重新生成包含多个候选的调试分析。

**违规关键词监控**:
- `根因`, `候选根因`, `症状`, `概率`, `多假设`
- `验证步骤`, `Checklist`, `二次自查`, `过度自信`, `debug`

### 🛡️ 调试技术债务规则 - 防止技术债务累积 (CRITICAL级别)

**规则名称**: `debug_prevent_technical_debt`  
**严重程度**: CRITICAL  
**模块**: Debug

**规则描述**: 在调试阶段必须提前识别潜在的技术债务与反模式，避免仅以Patch修复方式掩盖问题；必须输出根因候选及风险评估。

**强制要求**:
- ❌ 禁止直接声称'问题已解决'，必须列出至少 3 个【根因候选】并附带概率分析
- ✅ 必须区分【症状】与【根因候选】，不可混淆
- ✅ 调试报告中需标记：是否存在潜在技术债务风险

**反模式识别要求**:
在调试阶段需显式提示以下反模式：
- 🚫 **Patch式修复**（临时方案掩盖根因）
- 🚫 **降级方案**（降低安全或质量标准）
- 🚫 **绕过逻辑**（跳过流程避免错误）
- 🚫 **掩盖性修复**（仅改症状不改架构）

**根因分析强制要求**:
在调试阶段必须：
- 📊 对每个问题追溯到可能的架构缺陷
- 📋 输出'症状 vs 根因'对照表
- ⚠️ 评估临时修复的长期风险，是否会在 Development 阶段演化为技术债务
- 🎯 标注哪些候选根因若不解决，将演变为架构性问题

**执行动作**: 若调试报告未列出根因候选、未识别反模式、或未区分症状与根因，应阻止输出并提示重新生成完整的调试分析。

**违规关键词监控**:
- `debug`, `根因候选`, `症状 vs 根因`, `概率分析`, `反模式`
- `Patch修复`, `降级方案`, `绕过逻辑`, `掩盖性修复`, `技术债务风险`

**标准调试报告格式**:
```
🔍 **症状描述**: [具体现象]
🧠 **根因候选**: 
   1. [候选A] - 概率60% - 架构风险：HIGH
   2. [候选B] - 概率30% - 架构风险：MEDIUM  
   3. [候选C] - 概率10% - 架构风险：LOW

🚫 **反模式风险评估**:
   - Patch修复风险：[评估]
   - 技术债务风险：[评估]
   - 长期维护风险：[评估]

📋 **症状 vs 根因对照表**:
   | 症状 | 对应根因候选 | 验证方法 |
   |------|-------------|----------|
   | [症状1] | [根因A] | [验证方法] |

✅ **修复方案**: [基于确认根因的彻底解决方案]
```

### 🏗️ 大型组件重构规则 - 超大型组件重构规范 (ERROR级别)

**规则名称**: `dev_large_component_refactor_guideline_error`  
**严重程度**: ERROR  
**模块**: Development

**规则描述**: 超大型组件（如超过 2000 行代码）在重构时必须遵循严格规范，确保不破坏原有功能，实现结构优化的同时保持业务逻辑、UI 展示、数据流程和依赖完整性。

**强制要求**:
1. **重构评估** - 仅在确有必要且经过评估时进行大型组件重构，优先考虑拆分或抽象复用模块
2. **安全备份** - 重构前必须备份原组件及相关依赖，确保可回滚
3. **功能保留** - 重构不得破坏原有功能和业务流程，UI 展示和逻辑必须完全保留
4. **结构优化** - 保证组件结构清晰，尽量拆分功能单元，保持可维护性
5. **依赖完整** - 所有依赖关系、状态管理、事件绑定和接口调用必须闭合完整
6. **测试验证** - 重构完成后必须通过完整测试，包括单元测试、E2E 测试、UI 渲染验证
7. **增量修改** - 禁止在重构过程中删除原有逻辑或直接替换核心功能，必须增量修改并保留可用代码
8. **变更记录** - 任何重构修改都应记录在变更日志中，并标注修改范围和目的

**执行动作**: 在检测到超大型组件修改时，阻止未按规范执行的重构任务，并提示拆分、备份及增量修改要求，确保业务功能和 UI 一致性。

**违规关键词监控**:
- `large component`, `超大型组件`, `重构规范`, `拆分模块`, `备份`
- `incremental refactor`, `增量修改`, `UI一致性`, `保留功能`
- `组件依赖闭合`, `maintain logic`, `maintain structure`, `component refactor`

**重构检查清单**:
```bash
# 📋 重构前检查
□ 确认重构必要性和收益评估
□ 创建原组件完整备份
□ 分析组件依赖关系图
□ 制定增量重构计划

# 🔧 重构过程中
□ 保持原有功能完整性
□ 逐步拆分，避免大幅替换
□ 保留所有业务逻辑和UI
□ 维护状态管理和事件绑定

# ✅ 重构后验证
□ 功能完整性测试
□ UI渲染一致性检查
□ 性能对比验证
□ 记录变更日志
```

**🔥 超大型组件识别**:
当前项目中的超大型组件：
- `AdaptPage.tsx` (5,399行) - 需要重构
- `BrandLibraryPage.tsx` (3,723行) - 需要重构
- `HotTopicsPage.tsx` (2,168行) - 需要监控
- `CreativeCube.tsx` (2,622行) - 需要监控

### 🛡️ 技术债务防范规则 - 可持续开发标准 (CRITICAL级别)

**规则名称**: `dev_prevent_technical_debt`  
**严重程度**: CRITICAL  
**模块**: Development

**规则描述**: 禁止为追求短期交付而牺牲长期可维护性，避免引入技术债务；必须识别反模式并进行根因分析，确保方案可持续。

**强制要求**:
1. **收益风险对比** - 实现方案必须提供【短期收益】与【长期风险】的对比说明
2. **避免权宜表述** - 禁止使用'临时解决'、'先这样用'等权宜表述而不做记录
3. **还债计划** - 必须给出【还债计划】（例如重构时间点、替代方案）
4. **债务分级** - 需要区分【合理债务】（有明确偿还计划）与【危险债务】（无偿还路径）
5. **架构评估** - 若涉及架构/依赖选型，必须说明未来可扩展性与维护成本
6. **跳过记录** - 所有绕过测试、跳过文档的行为必须显式记录并打标
7. **债务标注** - 输出修复/实现方案时需标注：是否引入新债务、还款计划、风险级别

**反模式识别强制要求**:
必须识别以下情况并标注：
- 🚫 **Patch式修复**: 通过临时方案掩盖根本问题而非解决根因
- 🚫 **降级方案**: 为了'解决问题'而降低安全或质量标准的实现
- 🚫 **绕过逻辑**: 通过跳过正常流程来避免错误的代码
- 🚫 **掩盖性修复**: 仅修改表层症状而不解决底层架构缺陷

**根因分析强制要求**:
必须满足：
- 📊 对发现的每个问题追溯到架构层面的根本原因
- 📋 区分【症状】与【根因】，避免仅处理表面现象
- ⚡ 评估修复方案的长期可维护性和可扩展性
- 🔒 确保修复不会引入新的安全风险或架构债务

**执行动作**: 若发现实现方案仅关注短期交付、未说明长期影响、未识别反模式或未进行根因分析，应阻止输出并提示补充完整的技术债务与架构分析。

**违规关键词监控**:
- `技术债务`, `长期维护`, `还债计划`, `风险级别`, `架构演进`
- `短期 vs 长期`, `合理债务`, `危险债务`, `文档`, `测试覆盖率`
- `反模式`, `Patch修复`, `降级方案`, `绕过逻辑`, `掩盖性修复`
- `根因分析`, `症状 vs 根因`

**技术债务评估模板**:
```
📊 **短期 vs 长期分析**:
   - 短期收益: [具体收益]
   - 长期风险: [潜在风险]
   - 风险级别: 🔥HIGH/🟡MEDIUM/🟢LOW

💳 **技术债务评估**:
   - 债务类型: 合理债务/危险债务
   - 还债计划: [具体时间点和方案]
   - 维护成本: [人力/时间评估]

🚫 **反模式检查**:
   - Patch修复风险: [是/否]
   - 降级方案风险: [是/否]  
   - 绕过逻辑风险: [是/否]
   - 掩盖性修复风险: [是/否]

🔍 **根因分析**:
   | 症状 | 根因候选 | 概率 | 架构影响 |
   |------|----------|------|----------|
   | [症状1] | [根因A] | 60% | HIGH |
```

### 🔒 安全配置规则 - 禁止硬编码敏感信息 (ERROR级别)

**规则名称**: `security_prohibit_hardcoded_config_error`  
**严重程度**: ERROR  
**模块**: Security

**规则描述**: 禁止硬编码配置项，所有 API 地址、密钥、redirectUri、模型参数等必须从 .env 或环境变量中读取。严禁在代码中直接写死平台域名、token、ID 等敏感配置。

**强制要求**:
1. **API地址检查** - 检测代码中是否存在硬编码的 API 地址或域名
2. **敏感信息检查** - 检测代码中是否存在直接写死的密钥、token、client ID 等敏感信息
3. **配置文件读取** - 检测模型参数、redirectUri 等配置是否从环境变量或配置文件中读取
4. **绕过检测** - 禁止任何绕过环境变量直接使用敏感配置的写法

**执行动作**: 在检测到硬编码配置项时阻止执行任务，并提示开发者改用环境变量或配置文件读取。

**违规关键词监控**:
- `硬编码`, `敏感信息`, `环境变量`, `.env`, `API 地址`
- `密钥`, `redirectUri`, `安全配置`, `安全策略`

**正确配置示例**:
```typescript
// ✅ 正确：使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTHING_APP_ID = import.meta.env.VITE_AUTHING_APP_ID;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// ✅ 正确：从配置文件读取
import { getAuthingConfig } from '@/config/authing';
const config = getAuthingConfig();
```

**错误配置示例**:
```typescript
// ❌ 错误：硬编码API地址
const apiUrl = "https://api.openai.com/v1/chat/completions";

// ❌ 错误：硬编码密钥
const apiKey = "sk-1234567890abcdef";

// ❌ 错误：硬编码配置
const authingConfig = {
  appId: "68a68a29d0c3341ae7a3df23",
  host: "https://rzcswqs4sq0f.authing.cn"
};
```

**安全配置检查清单**:
```bash
# 🔍 安全配置审查
□ 检查.env.local文件是否包含所有必要配置
□ 验证生产环境变量是否正确设置
□ 确认代码中无硬编码API地址
□ 确认代码中无硬编码密钥或token
□ 验证redirectUri从环境变量读取
□ 检查敏感配置是否正确注入
```

### 🎨 UI设计令牌规则 - 统一设计系统 (CRITICAL级别)

**规则名称**: `ui_enforce_design_tokens_critical`  
**严重程度**: CRITICAL  
**模块**: UI

**规则描述**: 所有 UI 组件必须统一使用设计令牌系统（Design Tokens）来控制颜色、字体、间距等样式，禁止在组件中硬编码样式，以保证整体设计一致性。

**强制要求**:
1. **设计令牌统一** - 所有颜色、字体、间距等样式必须从设计令牌系统读取
2. **禁止硬编码样式** - 禁止在组件中直接写死样式值（如 color: '#FF0000'、margin: '12px'）
3. **单一样式来源** - 禁止同时存在多套样式来源，必须统一通过 Design Tokens 进行管理
4. **样式检测** - 检测到硬编码样式时阻止任务执行，并提示使用设计令牌替代

**执行动作**: 自动扫描组件样式，发现硬编码值时阻止提交，并提示开发者使用设计令牌系统统一样式。

**违规关键词监控**:
- `设计令牌`, `统一样式`, `硬编码禁止`, `UI 组件`
- `风格一致性`, `可维护性`

**正确样式示例**:
```typescript
// ✅ 正确：使用Tailwind CSS设计令牌
<div className="bg-primary text-primary-foreground p-4 rounded-lg">
  <h1 className="text-2xl font-bold mb-4">标题</h1>
  <p className="text-muted-foreground">内容</p>
</div>

// ✅ 正确：使用CSS变量
<div style={{ 
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  padding: 'var(--spacing-4)'
}}>
```

**错误样式示例**:
```typescript
// ❌ 错误：硬编码颜色值
<div style={{ backgroundColor: '#3B82F6', color: '#FFFFFF' }}>

// ❌ 错误：硬编码间距
<div className="px-[16px] py-[12px]">

// ❌ 错误：内联硬编码样式
<p style={{ fontSize: '14px', lineHeight: '1.5', margin: '8px 0' }}>
```

**设计令牌检查清单**:
```bash
# 🎨 设计令牌合规检查
□ 颜色使用Tailwind色彩系统（primary, secondary, muted等）
□ 间距使用标准spacing scale（p-4, m-2, gap-6等）
□ 字体使用typography系统（text-lg, font-bold等）
□ 圆角使用统一radius系统（rounded-lg, rounded-xl等）
□ 阴影使用shadow系统（shadow-sm, shadow-lg等）
□ 断点使用responsive前缀（sm:, md:, lg:等）
```

**当前项目设计令牌系统**:
- **颜色系统**: Tailwind CSS + shadcn/ui色彩令牌
- **间距系统**: Tailwind spacing scale
- **字体系统**: Typography utility classes
- **主题系统**: CSS变量 + 明暗主题切换
- **组件令牌**: shadcn/ui组件设计令牌

## 重要提醒

### 🔒 禁止修改的文件
- `/src/contexts/UnifiedAuthContext.tsx` - 认证系统已锁定，修改可能导致登录崩溃

### 🚨 安全注意事项  
- API密钥已从客户端移除，仅保留公开配置
- 用户认证通过Authing官方服务处理
- 敏感操作需要服务端验证

### 🧪 调试工具
- 开发环境下可使用权限测试按钮 (访问 `/ai-test`, `/auth-test`)
- Console中有详细的认证流程日志
- HMR热重载支持快速开发迭代
- 性能分析: `npm run build:analyze`
- 调试模式: `VITE_DEBUG_MODE=true npm run dev`

## 测试与验证

### 功能验证命令
```bash
# 构建验证
npm run build
npm run type-check

# 代码质量检查
npm run lint
npm run lint:fix

# 开发服务器
npm run dev

# 生产预览
npm run preview
```

### 核心功能测试路径
| 功能模块 | 测试页面 | 验证内容 |
|---------|----------|----------|
| **AI服务** | `/ai-test` | AI模型调用、响应解析 |
| **认证系统** | `/auth-test` | 登录流程、权限验证 |
| **热点数据** | `/hot-topics` | 数据获取、实时更新 |
| **品牌库** | `/brand-library` | 数据管理、智能分析 |
| **内容提取** | `/extractor` | 多源提取、AI总结 |

## 故障排除

### 常见问题解决

#### 1. Guard模态框不显示
1. 检查Console是否有Guard对象初始化日志
2. 确认`guard.show()`被正确调用
3. 检查DOM中是否存在`.authing-ant-modal-root`元素
4. 验证CSS样式没有冲突(特别是z-index)

#### 2. AI API调用失败
```bash
# 检查环境变量
echo $VITE_OPENAI_API_KEY | head -c 10

# 测试API连接
curl -H "Authorization: Bearer $VITE_OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```
**解决方案**:
- 确保API密钥格式正确（OpenAI: `sk-`开头）
- 检查API密钥余额和权限
- 验证网络连接和代理设置

#### 3. 热点数据获取失败
```bash
# 测试热点API
curl https://api-hot.imsyy.top/weibo
```
**解决方案**:
- 检查网络连接，使用VPN或代理（如需要）
- 系统内置降级方案，会自动使用mock数据

#### 4. 构建失败
1. 检查TypeScript类型错误: `npm run typecheck`
2. 运行linting检查: `npm run lint` 
3. 清理并重新安装依赖: `rm -rf node_modules && npm install`

## 部署指南

### Netlify 部署（推荐）
1. **准备部署**
   ```bash
   git clone https://github.com/xiongtingping/wenpai.git
   cd wenpai
   ```

2. **Netlify 配置**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **环境变量配置**: 在Netlify控制台配置所有必要的环境变量

## 项目亮点

### 技术创新
- **🔄 环境感知AI路由**: 自动根据环境选择最优AI调用方式
- **🛡️ 统一安全封装**: 所有API调用通过统一封装，确保安全性
- **⚡ 智能缓存机制**: 多层缓存策略，提升响应速度
- **🔍 实时性能监控**: 内置性能监控和自动优化建议
- **🎯 模块化架构**: 高度模块化设计，易于扩展和维护
- **🔒 用户数据隔离**: 企业级数据安全和隐私保护

### 用户体验
- **🎨 现代化UI**: 基于shadcn/ui的精美界面设计
- **📱 响应式设计**: 完美适配桌面端和移动端
- **🚀 快速加载**: 优化的构建配置，首屏加载时间<2秒
- **🌙 主题切换**: 支持明暗主题自动切换

## 联系方式
- **在线体验**: [www.wenpai.xyz](https://www.wenpai.xyz)
- **问题反馈**: [GitHub Issues](https://github.com/xiongtingping/wenpai/issues)
- **项目文档**: 详见本文档和README.md
- **商务合作**: support@wenpai.xyz