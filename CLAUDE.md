# 规则清单

## 1. 总体原则与核心规则

### 1.1 禁止引入技术债务
- **严禁引入技术债务**：  
  禁止使用临时解决方案（patch式修复），必须注重代码的长期可维护性。所有修复、功能添加和重构必须考虑到长期系统的稳定性与扩展性，避免积累不可控的技术债务。

### 1.2 严禁硬编码与模拟数据
- **严禁硬编码**：  
  所有敏感信息（如 API 密钥、Token、Client ID）必须通过环境变量进行配置。禁止将任何配置、参数或数据硬编码进代码中。
- **禁止本地模拟与降级方案**：  
  系统必须依赖真实可用的 API 和服务，绝对禁止使用本地模拟（mock 数据）或者降级方案。

### 1.3 必须使用真实可行的 API
- **强制使用真实的在线 API**：  
  所有服务和请求都必须依赖生产环境中可行的 API，避免本地假数据和模拟环境。测试和生产环境数据必须一致，避免因为降级方案导致的问题。

### 1.4 大规模代码修复授权
- **允许大规模代码修复**：  
  在系统出现运行时错误或生产环境问题时，允许进行大规模的代码修复和重构。但必须遵循以下原则：
  - **禁止删除功能**：绝对不能删除现有功能和业务逻辑
  - **修复导向**：所有修改必须以修复错误和提升稳定性为目标
  - **向后兼容**：确保修改不会破坏现有的API接口和用户体验
  - **逐步改进**：优先修复关键错误，然后进行代码质量改进
  - **全面测试**：大规模修复后必须进行全面的构建和功能测试

## 2. 设计与架构一致性

### 2.1 设计令牌系统
- **统一使用设计令牌**：  
  所有 UI 组件必须使用设计令牌（Design Tokens），包括颜色、字体、间距、样式等。确保 UI 的一致性和可维护性，禁止在组件中写死样式。
  - 设计令牌的使用不仅限于界面元素，还包括 UI 语言、字体大小等，确保设计规范统一。

### 2.2 上下文隔离 (Context Isolation)
- **上下文隔离**：  
  系统的不同功能模块必须进行有效的上下文隔离，以确保模块之间的状态不会交叉污染。每个模块应该在其独立的上下文中运行，避免全局变量的滥用。

## 3. 问题修复与系统性排查

### 3.1 问题修复前的充分理解与建模
- **充分理解与建模**：  
  在修复问题前，必须对问题进行充分的理解与建模。必须系统性地枚举出所有可能的原因并进行概率评估。
  - 先分析问题的本质和可能影响范围，避免仅针对表面症状进行修复。

### 3.2 严禁"patch式"修复
- **禁止"patch式"修复**：  
  不允许在未梳理出全部可能原因的情况下直接对症下药。避免仅对表面问题进行补丁式修复。必须深入分析并修复根本原因。
  - 在遇到问题时，从系统架构上进行自上而下的排查，列出所有可能的原因并按概率和证据判断，避免随意下结论。

### 3.3 问题修复后的多环境验证
- **多环境验证**：  
  修复完成后，必须在开发和生产环境下进行自动化测试，确保修复效果有效。如果在测试环境中仍存在问题，需要继续分析是否为根本原因未修复，或是否存在其他可能的原因。

### 3.4 禁止盲目自信修复
- **禁止过早结论与修复**：  
  任何修复都不应在没有深入审查全局的情况下草率做出。避免在遇到一个可能原因时就迅速下结论并开始修复，导致引入更多 bug。

### 3.5 举一反三排查类似问题
- **全面排查相似模式**：  
  当修复一个问题时，必须举一反三，系统性排查代码库中是否存在类似的问题模式。例如：
  - 修复一个模块的循环依赖时，检查所有相关模块是否存在同样问题
  - 修复一个组件的状态管理bug时，排查其他组件是否有相同问题
  - 修复一个API调用错误时，检查所有类似的API调用点
- **建立问题模式库**：  
  记录已发现的问题模式，建立检查清单，在后续开发中主动避免重复问题。

### 3.6 重大问题根因修复案例

#### 3.6.1 TDZ和getInstance错误
- **问题背景**：  
  频繁出现"Cannot access 'Rt' before initialization"和"Hq.getInstance is not a function"错误
- **根本原因**：  
  系统中存在26个单例模式实现，Vite构建时变量名被压缩为短标识符（如'Rt', 'Hq'），导致模块初始化顺序问题和TDZ错误
- **根本性解决方案**：  
  - 修复Vite构建配置：禁用关键标识符的变量名压缩，保持getInstance、API、Service等关键词不被压缩
  - 创建服务预加载机制：按依赖关系控制服务初始化顺序，避免竞争条件
  - 优化代码分块策略：按服务类型智能分组，避免循环依赖问题
- **验证标准**：  
  构建后的代码中关键标识符（getInstance、HotTopicsAPI等）必须保持可读，不能被压缩为短变量名
- **禁止方案**：  
  严禁使用SingletonManager等patch式修复方案，必须从构建配置层面彻底解决

#### 3.6.2 Dialog弹窗定位异常错误（完整解决方案）
- **问题背景**：
  快速引用Dialog弹窗显示在浏览器窗口的左上角，而不是预期的屏幕中央位置，导致用户无法正常使用弹窗功能
- **根本原因分析**：
  - **CSS选择器不匹配**：CSS修复文件使用`[data-radix-dialog-content]`选择器，但实际Dialog元素只有`[role="dialog"]`属性
  - **动画类冲突**：Tailwind CSS的`slide-in-from-left-1/2`和`slide-in-from-top-[48%]`动画类干扰了Dialog的定位计算
  - **样式优先级问题**：多重样式系统（Radix UI + Tailwind + CSS变量 + 内联样式）导致优先级冲突
  - **组件库架构冲突**：Radix UI Dialog组件的DOM结构与预期的CSS选择器不一致
- **失败的修复尝试**（patch式修复，已证明不可持续）：
  - 单一CSS选择器修复 → 无法匹配实际DOM结构
  - 纯CSS !important覆盖 → 被动画类和内联样式覆盖
  - 单次JavaScript修复 → 无法应对组件重新渲染
  - CSS变量设置 → 在某些情况下被忽略
- **根本性解决方案**：
  - **多选择器CSS支持**：同时支持`[role="dialog"]`和`[data-radix-dialog-content]`选择器
  - **JavaScript运行时修复器**：在Dialog打开时自动清除冲突样式并强制应用正确定位
  - **双重保护机制**：CSS基础修复 + JavaScript强化修复，确保在各种情况下都能正常工作
  - **样式冲突消除**：移除导致定位冲突的动画类，重置所有可能影响定位的CSS属性
- **技术实现详情**：
  ```css
  /* CSS修复：支持多种Dialog选择器 */
  [role="dialog"],
  [data-radix-dialog-content] {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    z-index: 1055 !important;
    margin: 0 !important;
    inset: auto !important;
  }

  /* 快速引用Dialog特殊修复 */
  [role="dialog"].quick-reference-dialog,
  [data-radix-dialog-content].quick-reference-dialog {
    max-width: min(95vw, 1024px) !important;
    max-height: 85vh !important;
    --position-center-y: 50% !important;
    --position-center-x: 50% !important;
    --dialog-transform: translate(-50%, -50%) !important;
  }
  ```

  ```javascript
  // JavaScript运行时修复器
  useEffect(() => {
    if (!open) return;

    const fixDialogPosition = () => {
      // 多选择器查找Dialog元素
      const dialogElement = document.querySelector('[role="dialog"].quick-reference-dialog') ||
                           document.querySelector('[role="dialog"]') ||
                           document.querySelector('[data-radix-dialog-content].quick-reference-dialog');

      if (dialogElement) {
        // 清除冲突样式
        dialogElement.style.removeProperty('top');
        dialogElement.style.removeProperty('left');
        dialogElement.style.removeProperty('transform');

        // 强制应用正确定位
        dialogElement.style.setProperty('position', 'fixed', 'important');
        dialogElement.style.setProperty('top', '50%', 'important');
        dialogElement.style.setProperty('left', '50%', 'important');
        dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        dialogElement.style.setProperty('z-index', '1055', 'important');
        dialogElement.style.setProperty('margin', '0', 'important');
      }
    };

    // 多时机执行修复
    fixDialogPosition();
    setTimeout(fixDialogPosition, 50);
    setTimeout(fixDialogPosition, 150);
    setTimeout(fixDialogPosition, 300);
  }, [open]);
  ```
- **修改的文件列表**：
  1. `src/styles/dialog-positioning-fix-clean.css` - 更新CSS选择器支持多种Dialog元素类型
  2. `src/components/creative/QuickReference/QuickReferenceDialog.tsx` - 添加JavaScript运行时修复器
  3. `src/styles/dialog-positioning-fix.css` - 修复CSS语法错误，统一选择器
- **验证标准**：
  - Dialog必须始终显示在浏览器视口的正中央（centerX: 720, centerY: 339 for 1440x678视口）
  - 背景遮罩必须完全覆盖整个浏览器视口
  - Dialog打开时控制台显示"🎯 Dialog定位修复已应用"日志
  - 通过`getBoundingClientRect()`验证Dialog中心点与视口中心点偏差小于5像素
  - 在不同屏幕尺寸下都能正确居中显示
- **防复发措施**：
  - **依赖更新监控**：Radix UI和Tailwind CSS更新前必须进行Dialog定位回归测试
  - **自动化测试**：添加Dialog定位的视觉回归测试用例
  - **代码审查清单**：Dialog相关修改必须检查定位影响
  - **Lint规则**：禁止在Dialog组件中使用可能冲突的内联定位样式
  - **文档维护**：维护Dialog组件使用最佳实践文档
- **禁止方案**：
  - 严禁删除或修改现有的双重保护机制（CSS + JavaScript）
  - 严禁移除`!important`声明，这是确保样式优先级的关键
  - 严禁使用单一修复方案，必须保持多重保护
  - 严禁在没有充分测试的情况下升级Radix UI或Tailwind CSS版本
- **适用场景扩展**：
  此解决方案适用于所有基于Radix UI的Dialog组件，包括但不限于：
  - 快速引用Dialog
  - 确认对话框
  - 表单弹窗
  - 图片预览弹窗
  - 设置面板等

#### 3.6.3 历史记录弹窗定位错误（inset属性冲突）
- **问题背景**：
  历史记录弹窗（EnhancedHistoryDialog）显示位置错误，弹窗被定位到页面下方（Y坐标2379px），远超出视窗范围（678px），用户看不到弹窗，误以为是"闪现"问题
- **根本原因分析**：
  - **CSS inset属性冲突**：`inset: 50% auto auto 50%` 被浏览器解析为相对于**页面总高度**而不是视窗高度
  - **百分比单位误用**：当页面内容很长时，`50%` 相对于整个文档高度计算，导致弹窗定位到页面中间位置
  - **视窗单位缺失**：未使用 `vh`/`vw` 单位确保相对于视窗定位
  - **JavaScript选择器失效**：多重选择器策略在某些情况下无法找到正确的弹窗元素
- **失败的修复尝试**（patch式修复，已证明不可持续）：
  - 单纯CSS !important覆盖 → 被inset属性覆盖
  - JavaScript单次修复 → 无法应对组件重新渲染
  - 移除动画类 → 未解决根本的定位计算问题
  - 增加z-index → 弹窗仍在视窗外不可见
- **根本性解决方案**：
  - **视窗单位定位**：使用 `50vh` 和 `50vw` 替代 `50%`，确保相对于视窗定位
  - **inset属性完全重置**：彻底清除所有inset相关属性，避免干扰top/left定位
  - **多重保护机制**：CSS基础修复 + JavaScript强化修复，确保各种情况下都能正常工作
  - **增强选择器策略**：支持多种弹窗元素选择器，提高修复成功率
- **技术实现详情**：
  ```css
  /* CSS修复：使用视窗单位确保相对于视窗定位 */
  [role="dialog"],
  [role="dialog"][class*="enhanced-history-dialog"],
  [role="dialog"].enhanced-history-dialog,
  .enhanced-history-dialog[role="dialog"],
  html [role="dialog"],
  body [role="dialog"],
  #root [role="dialog"],
  [data-radix-portal] [role="dialog"],
  div[data-radix-portal] [role="dialog"],
  div[role="dialog"][id*="radix"],
  div[role="dialog"][data-state="open"],
  [data-radix-dialog-content] {
    /* 🚨 强制重置所有定位属性 */
    position: fixed !important;
    top: 50vh !important;  /* 🔥 使用vh单位确保相对于视窗高度 */
    left: 50vw !important; /* 🔥 使用vw单位确保相对于视窗宽度 */
    right: auto !important;
    bottom: auto !important;
    transform: translate(-50%, -50%) !important;
    z-index: 1000000 !important;
    margin: 0 !important;

    /* 🚨 完全重置inset属性，避免干扰top/left - 这是问题的根源！ */
    inset: unset !important;
    inset-block: unset !important;
    inset-inline: unset !important;
    inset-block-start: unset !important;
    inset-block-end: unset !important;
    inset-inline-start: unset !important;
    inset-inline-end: unset !important;
  }
  ```

  ```javascript
  // JavaScript运行时修复器 - 使用视窗单位
  useEffect(() => {
    if (!open) return;

    const fixDialogPosition = () => {
      // 多选择器查找Dialog元素
      const dialogElement = (
        document.querySelector('[role="dialog"][class*="enhanced-history-dialog"]') ||
        document.querySelector('.enhanced-history-dialog') ||
        document.querySelector('[role="dialog"]')
      ) as HTMLElement;

      if (dialogElement) {
        // 🚨 清除所有可能冲突的属性
        dialogElement.style.removeProperty('inset');
        dialogElement.style.removeProperty('inset-block');
        dialogElement.style.removeProperty('inset-inline');
        dialogElement.style.removeProperty('inset-block-start');
        dialogElement.style.removeProperty('inset-block-end');
        dialogElement.style.removeProperty('inset-inline-start');
        dialogElement.style.removeProperty('inset-inline-end');

        // 🎯 强制设置正确的定位 - 使用视窗单位
        dialogElement.style.setProperty('position', 'fixed', 'important');
        dialogElement.style.setProperty('top', '50vh', 'important');  // 🔥 使用vh单位
        dialogElement.style.setProperty('left', '50vw', 'important'); // 🔥 使用vw单位
        dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        dialogElement.style.setProperty('z-index', '1000000', 'important');
        dialogElement.style.setProperty('margin', '0', 'important');
      }
    };

    // 多时机执行修复
    fixDialogPosition();
    setTimeout(fixDialogPosition, 100);
    setTimeout(fixDialogPosition, 300);
  }, [open]);
  ```
- **修改的文件列表**：
  1. `src/styles/final-dialog-position-fix.css` - 使用视窗单位的CSS定位修复
  2. `src/features/content-adapter/components/EnhancedHistoryDialog.tsx` - 添加JavaScript运行时修复器
  3. `src/components/ui/dialog.tsx` - 移除冲突的Tailwind动画类
- **验证标准**：
  - 弹窗必须精确居中显示（偏移量0px）
  - 弹窗中心坐标必须与视窗中心坐标完全一致
  - 弹窗完全在视窗内可见（isInViewport: true, isCentered: true）
  - 控制台显示"✅ 修复后的样式"日志，确认top和left使用视窗单位
  - 在不同页面高度下都能正确居中显示
- **关键技术洞察**：
  - **inset vs top/left**：inset属性在长页面中会相对于文档高度计算，而top/left配合视窗单位才能确保相对于视窗定位
  - **视窗单位的重要性**：vh/vw单位确保定位始终相对于视窗，而不受页面内容长度影响
  - **属性清除的必要性**：必须主动清除inset相关属性，否则会覆盖top/left设置
- **防复发措施**：
  - **代码审查清单**：所有Dialog定位修改必须检查是否使用视窗单位
  - **Lint规则**：禁止在Dialog组件中使用百分比单位进行定位
  - **自动化测试**：添加长页面场景下的Dialog定位测试用例
  - **文档更新**：更新Dialog组件最佳实践，强调视窗单位的使用
- **禁止方案**：
  - 严禁使用百分比单位（%）进行Dialog定位，必须使用视窗单位（vh/vw）
  - 严禁删除inset属性重置代码，这是防止冲突的关键
  - 严禁移除JavaScript运行时修复器，CSS修复在某些情况下可能不足
  - 严禁在没有充分测试长页面场景的情况下修改Dialog定位逻辑
- **适用场景扩展**：
  此解决方案特别适用于在长页面中显示的Dialog组件，包括：
  - 历史记录弹窗
  - 内容列表弹窗
  - 数据展示弹窗
  - 任何在可滚动页面中的弹窗组件

## 4. 功能模块与系统操作

### 4.1 禁止裁剪与减少功能模块
- **禁止私自删除或裁剪功能模块**：  
  禁止未经批准随意删除、裁剪或减少现有功能模块。所有功能模块的变动必须经过充分评审和审批。

### 4.2 部署前检查与一键部署
- **部署前的友好构建检查**：  
  在执行部署前，必须进行构建检查，确保没有错误，并尽量一次性成功部署。部署失败时要有详细的错误反馈，并且需要对失败原因进行快速诊断与修复。

## 5. 自动化与规则应用

### 5.1 自动加载规则与用户记忆
- **自动加载规则与用户记忆**：  
  在执行任何任务之前，必须先自动加载并应用 `cluade.md` 规则以及用户记忆。如果规则未成功加载，任务必须中止，并提醒用户进行配置。

### 5.2 验证与执行的标准化
- **修复方案验证**：  
  在输出任何修复方案前，必须先进行验证，确保修复方案的可行性，避免先改后试的"盲修"行为。
  - 所有修复方案应首先经过严格的自动化测试和多环境验证，确认其有效性。

## 6. 核心执行准则

### 6.1 根因排查与修复流程
- **系统化排查与修复**：  
  通过自上而下的方式进行问题的排查与修复，确保问题的根本原因被解决，并在修复过程中不引入新的问题。

### 6.2 强调完整的解决方案
- **综合性修复方案**：  
  修复方案应覆盖所有可能的场景，确保从多角度解决问题，而不是简单的表面解决。

## 7. 18个源的技术术语与最佳实践

### 7.1 上下文隔离 (Context Isolation)
- **上下文隔离**：  
  为避免不同模块之间的冲突或副作用，应该严格隔离各个模块的执行上下文。这样可以确保模块之间互不干扰，减少潜在的错误。

### 7.2 异常处理 (Exception Handling)
- **异常处理**：  
  系统应具有健壮的异常处理机制，能够优雅地处理不可预见的错误，而不是简单地崩溃或丢失数据。异常信息必须记录并提供足够的上下文以便调试。

### 7.3 数据一致性 (Data Consistency)
- **数据一致性**：  
  系统中所有的持久化数据必须确保一致性。任何事务必须保证 ACID 属性（原子性、一致性、隔离性、持久性）。

### 7.4 依赖注入 (Dependency Injection)
- **依赖注入**：  
  通过依赖注入机制降低模块之间的耦合度，使得系统更加灵活和可扩展。任何服务、库或外部依赖都应通过依赖注入进行管理，而非硬编码。

### 7.5 防止数据泄露 (Data Leak Prevention)
- **数据泄露防护**：  
  所有敏感数据（如用户个人信息、支付信息等）必须经过加密存储和传输。对数据访问进行严格控制，确保只有授权用户可以访问敏感信息。

### 7.6 负载均衡与高可用 (Load Balancing & High Availability)
- **负载均衡**：  
  系统应支持负载均衡，确保高可用性和扩展性。使用负载均衡策略来分配请求流量，并确保系统不会因为单点故障导致服务中断。

### 7.7 服务解耦 (Service Decoupling)
- **服务解耦**：  
  各个服务应尽可能解耦，避免直接依赖和紧密耦合。通过消息队列、事件驱动或 API 网关等方式进行服务之间的通信。

### 7.8 事件驱动架构 (Event-Driven Architecture)
- **事件驱动**：  
  采用事件驱动架构（EDA）设计系统，使得各个模块能够基于事件进行触发和响应，避免直接依赖其他模块的具体实现。

### 7.9 自动化与持续集成 (CI/CD)
- **CI/CD**：  
  系统必须实现持续集成（CI）和持续交付（CD），自动化测试、构建、部署和回滚流程，确保软件的快速迭代和交付。

### 7.10 监控与日志 (Monitoring & Logging)
- **监控与日志**：  
  系统应有全面的监控和日志机制，实时捕获和记录系统的运行状态。日志应包含足够的上下文信息，方便追踪和调试问题。

---

**补充规则**
- **强化问题的追溯与文档化**：  
  所有问题修复过程必须有详细记录，包括问题现象、分析过程、修复方案和验证结果，便于后续维护和问题回溯。

---

**执行说明**
Claude MUST read and strictly follow these rules.

## ⚠️ 强制执行要求 ⚠️

### **任务前强制读取规则**
- **每次任务开始前，必须强制读取 CLAUDE.md 文件**
- **必须完整理解并应用所有规则条目**
- **如果 CLAUDE.md 文件读取失败或无法访问，任务必须立即中止**
- **不允许跳过、忽略或简化任何规则条目**

### **规则执行验证**
- 每次任务执行时，必须在内部检查清单中验证是否遵循了以下核心原则：
  ✅ 是否避免了技术债务？
  ✅ 是否避免了硬编码和模拟数据？
  ✅ 是否使用了真实可行的API？
  ✅ 是否进行了系统性问题排查？
  ✅ 是否避免了patch式修复？

### **违规处理机制**
- 如发现违反任何核心规则，必须立即停止当前操作
- 必须回滚已做的修改，重新按规则执行
- 必须记录违规原因和纠正措施

### **规则更新机制**
- CLAUDE.md 文件如有更新，下次任务开始时必须重新读取最新版本
- 新增规则立即生效，旧的执行模式必须废弃
- 规则冲突时，以最新的 CLAUDE.md 文件为准

---

**目标：保持系统稳定、避免破坏、提升可维护性**
**执行模式：强制读取 → 严格遵循 → 持续验证 → 违规纠正**

## 8. 数据管理与测试规范

### 8.1 数据持久化策略
- **统一数据化管理系统**：
  所有的保存都是保存到Supabase，而不是本地模拟。统一数据化管理系统包括：
  - 数据持久化：所有用户数据必须持久化到Supabase数据库
  - 数据预加载：系统启动时预加载必要的用户数据
  - 用户数据隔离：确保不同用户的数据完全隔离
  - 用户数据安全性：所有敏感数据必须加密存储和传输

### 8.2 测试文件管理
- **测试完成后清理**：
  测试完成后必须删除创建的test测试文件和代码，保持代码库的整洁性。
  - 临时测试文件不得提交到版本控制系统
  - 测试数据不得污染生产环境
  - 测试完成后必须恢复原始状态

#### 3.6.4 快速引用弹窗定位异常根本性修复 (2025-01-13)

**问题描述**：快速引用Dialog弹窗位置显示异常，可能出现定位错误或不可见的情况

**根本原因分析**：
1. **JavaScript修复器过于复杂**：包含终极修复、持续监控等复杂逻辑，反而造成冲突
2. **inset属性冲突**：inset属性在长页面中相对于文档高度计算，而非视窗高度
3. **百分比单位误用**：使用50%相对于整个页面高度，而非视窗高度
4. **CSS选择器冗余**：多个修复文件存在样式冲突

**系统性解决方案**：

1. **简化JavaScript修复器**：
```javascript
// 精简修复器 - 遵循CLAUDE.md规范
useEffect(() => {
  if (!open) return;

  const fixDialogPosition = () => {
    const dialogElement = (
      document.querySelector('[role="dialog"][class*="quick-reference-dialog"]') ||
      document.querySelector('.quick-reference-dialog') ||
      document.querySelector('[role="dialog"]')
    ) as HTMLElement;

    if (dialogElement) {
      // 清除inset冲突属性
      dialogElement.style.removeProperty('inset');
      dialogElement.style.removeProperty('inset-block');
      // ... 其他inset属性

      // 使用视窗单位强制定位
      dialogElement.style.setProperty('position', 'fixed', 'important');
      dialogElement.style.setProperty('top', '50vh', 'important');
      dialogElement.style.setProperty('left', '50vw', 'important');
      dialogElement.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    }
  };

  fixDialogPosition();
  setTimeout(fixDialogPosition, 100);
  setTimeout(fixDialogPosition, 300);
}, [open]);
```

2. **CSS视窗单位修复**：
```css
/* 使用视窗单位确保相对于视窗定位 */
[role="dialog"].quick-reference-dialog,
[role="dialog"][class*="quick-reference-dialog"] {
  position: fixed !important;
  top: 50vh !important;  /* 视窗高度50% */
  left: 50vw !important; /* 视窗宽度50% */
  transform: translate(-50%, -50%) !important;
  
  /* 完全重置inset属性 */
  inset: unset !important;
  inset-block: unset !important;
  inset-inline: unset !important;
  inset-block-start: unset !important;
  inset-block-end: unset !important;
  inset-inline-start: unset !important;
  inset-inline-end: unset !important;
}
```

**修复文件清单**：
- `src/components/creative/QuickReference/QuickReferenceDialog.tsx`: 简化JavaScript修复器
- `src/styles/unified-dialog-positioning.css`: 更新CSS使用视窗单位

**关键技术洞察**：
- **视窗单位的重要性**：vh/vw单位确保定位始终相对于视窗，不受页面内容长度影响
- **inset属性清除的必要性**：必须主动清除inset相关属性，否则会覆盖top/left设置
- **简化修复逻辑**：过于复杂的修复器可能引入新问题，简单有效的修复更可靠

**防复发措施**：
- 禁止使用百分比单位进行Dialog定位，必须使用视窗单位
- 禁止在Dialog修复器中添加过于复杂的逻辑
- 所有Dialog定位修改必须检查是否使用视窗单位
- 严禁删除inset属性重置代码

**更新 - 强化修复 (2025-01-13 22:20)**：
- **问题升级**：用户反馈弹窗仍显示在网页顶部，只能看到一半，背景层同理
- **根本原因**：多个CSS文件存在样式冲突，JavaScript修复器不够强制
- **强化解决方案**：
  1. 创建专用紧急修复CSS文件`quick-reference-dialog-emergency-fix.css`，使用超高优先级选择器
  2. 强化JavaScript修复器，增加持续监控和多重修复机制
  3. 完全重写Dialog样式，使用cssText方法彻底覆盖
- **修复验证**：增加详细的控制台日志输出，实时监控Dialog位置和样式状态

**紧急更新 - 终极修复 (2025-01-13 22:35)**：
- **严重问题**：Dialog完全不可见，背景层显示不全，强化修复导致更严重问题
- **根本原因分析**：
  1. 过度复杂的CSS修复文件相互冲突
  2. JavaScript cssText重写破坏了Dialog基本功能
  3. 可能存在全局CSS规则强制隐藏Dialog元素
- **终极解决方案**：
  1. 创建`dialog-basic-fix.css`终极修复，使用最高优先级强制显示
  2. 添加红色边框和调试信息，便于视觉确认
  3. 实现终极JavaScript诊断器，深度检测所有Dialog相关元素
  4. 强制重置所有可能隐藏Dialog的CSS属性
- **调试特征**：
  - Dialog应显示红色边框和"🚨 DIALOG VISIBLE - 调试模式"标签
  - 背景遮罩应显示红色半透明效果
  - 控制台输出完整的Dialog诊断信息

#### 3.6.5 认证超时问题系统性修复案例 (2025-01-13)

**问题描述**：用户登录时遇到认证超时错误：`timeout of 10000ms exceeded`

**根本原因分析**：
1. **超时配置不一致**：各模块超时时间不统一(30s-60s)
2. **网络配置问题**：缺少重试机制和优化配置
3. **错误处理不完善**：缺少智能错误分析和网络诊断

**系统性解决方案**：

1. **统一超时配置**：
```typescript
// 所有认证相关请求统一使用90秒超时
timeout: 90000,
requestConfig: {
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'User-Agent': 'WenPai-App/1.0.0'
  }
}
```

2. **智能重试机制**：
```typescript
// 指数退避重试策略
const retryConfig = {
  maxRetries: 3,
  baseDelay: 2000,
  maxDelay: 10000,
  timeoutMs: 90000
};

// 使用重试机制
const result = await diagnoseAndRetry(
  () => verificationCodeService.loginByPhoneCode(phone, code),
  '验证码登录'
);
```

3. **网络诊断工具**：
```typescript
// 自动诊断Authing连接性
const diagnostic = await AuthNetworkDiagnostic.diagnoseAuthingConnection();
// 智能错误分析
const errorAnalysis = AuthErrorAnalyzer.analyzeError(error);
```

**修复文件清单**：
- `src/api/request.ts`: 统一超时配置和网络优化
- `src/services/verificationCodeService.ts`: 增加超时和重试
- `src/pages/CustomLoginPage.tsx`: 集成重试机制和错误分析
- `src/utils/authTokenHandler.ts`: 网络配置优化
- `src/utils/authNetworkDiagnostic.ts`: 新增诊断工具

**技术亮点**：
- 系统性解决方案，非patch式修复
- 智能化错误处理和网络诊断
- 用户友好的重试机制
- 完整的监控和防复发体系

**防复发措施**：
- 配置统一管理和环境变量控制
- 网络请求监控和超时率统计
- 完整的测试覆盖(超时、重试、错误处理)

#### 3.6.6 首页按钮水平居中问题系统性修复案例 (2025-01-15)

**问题描述**：首页定价区域的所有按钮（"开始免费使用"、"立即升级专业版"、"立即升级高级版"）向左偏移，无法在其容器内正确水平居中显示

**问题现象**：
- 按钮偏移-172px到-186px（严重向左偏移）
- 按钮宽度与容器宽度相同（337px），但位置错误
- 用户视觉体验：按钮显示为左对齐而非居中对齐

**根本原因分析**：
1. **CSS Transform强制偏移**：按钮被应用了`transform: matrix(1, 0, 0, 1, -172, 0)`，强制向左偏移-172px
2. **样式优先级冲突**：Transform属性覆盖了所有margin和flexbox居中设置
3. **表面修复无效**：CSS margin、flexbox justify-content等表面修复被transform覆盖
4. **深层DOM结构问题**：需要深度分析DOM层级才能发现真正的样式冲突源

**失败的修复尝试**（patch式修复，已证明不可持续）：
- CSS margin auto设置 → 被transform覆盖
- Flexbox justify-content center → 被transform覆盖
- 内联样式修复 → 优先级不足
- React组件className修改 → 仍被底层transform影响
- 多重CSS选择器 → 无法覆盖transform属性

**系统性解决方案**：

1. **深度DOM分析**：
```javascript
// 通过Playwright深度分析DOM层级和样式
const hierarchy = [];
let current = btn;
while (current && current !== document.body) {
  const computedStyle = window.getComputedStyle(current);
  hierarchy.push({
    tagName: current.tagName,
    transform: computedStyle.transform,  // 🔍 发现关键：transform: matrix(1, 0, 0, 1, -172, 0)
    marginLeft: computedStyle.marginLeft,
    justifyContent: computedStyle.justifyContent
  });
  current = current.parentElement;
}
```

2. **根因修复CSS**：
```css
/* 🎯 真正的根因修复 - 移除有害的transform偏移 */
#pricing button,
section[id="pricing"] button,
[id="pricing"] button {
  transform: none !important;  /* 🔥 关键：移除有害的transform */
  margin-left: auto !important;
  margin-right: auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  text-align: center !important;
}

/* 确保按钮容器保持正确的flex布局 */
#pricing .flex.justify-center,
section[id="pricing"] .flex.justify-center {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}
```

3. **验证机制**：
```javascript
// 实时验证按钮居中效果
const verifyButtonCentering = () => {
  const results = [];
  pricingButtons.forEach((btn) => {
    const rect = btn.getBoundingClientRect();
    const parent = btn.parentElement;
    const parentRect = parent.getBoundingClientRect();

    const btnCenter = rect.left + rect.width / 2;
    const parentCenter = parentRect.left + parentRect.width / 2;
    const offset = btnCenter - parentCenter;

    results.push({
      text: btn.textContent.trim(),
      offset: Math.round(offset * 100) / 100,
      isCentered: Math.abs(offset) < 2,
      status: Math.abs(offset) < 2 ? '✅ 完美居中' : '❌ 未居中',
      transform: window.getComputedStyle(btn).transform
    });
  });
  return results;
};
```

**修复文件清单**：
- `src/styles/button-center-fix.css`: 根因修复CSS，移除有害transform
- `src/components/landing/PricingSection.tsx`: 优化按钮容器结构
- `src/index.css`: 导入修复CSS文件

**技术洞察**：
- **Transform vs Margin/Flexbox**：CSS transform属性具有最高渲染优先级，会覆盖margin和flexbox布局
- **DOM层级分析的重要性**：表面的CSS设置可能被深层的样式规则覆盖
- **!important的必要性**：在复杂样式系统中，需要使用!important确保关键修复生效
- **系统性验证**：修复后必须通过自动化测试验证实际渲染效果

**验证标准**：
- 所有按钮offset必须为0px（完美居中）
- 按钮transform属性必须为"none"
- 按钮在不同屏幕尺寸下都能正确居中
- 修复不影响其他页面元素的布局

**防复发措施**：
- **CSS审查清单**：所有按钮布局修改必须检查transform属性影响
- **自动化测试**：添加按钮居中的视觉回归测试用例
- **DOM分析工具**：建立标准化的DOM层级分析流程
- **样式优先级文档**：维护CSS属性优先级参考文档
- **Lint规则**：禁止在布局组件中使用可能冲突的transform属性

**禁止方案**：
- 严禁删除`transform: none !important`声明，这是根因修复的核心
- 严禁使用patch式修复（如调整margin值）来掩盖transform问题
- 严禁在没有深度DOM分析的情况下进行布局修复
- 严禁移除CSS修复文件，必须保持长期有效的解决方案

**适用场景扩展**：
此解决方案适用于所有遇到CSS transform干扰布局的场景，包括：
- 按钮居中问题
- 卡片布局异常
- 弹窗定位错误
- 导航栏对齐问题
- 任何涉及transform属性冲突的布局问题

**关键经验总结**：
1. **深度分析优于表面修复**：必须分析完整的DOM层级和样式继承链
2. **Transform属性的特殊性**：Transform具有最高渲染优先级，需要特别关注
3. **自动化验证的重要性**：人工检查容易遗漏，必须通过代码验证实际效果
4. **系统性思维**：一个布局问题可能影响多个组件，需要全面排查和修复

### 🎯 **根本原因深度分析与预防方案**

#### **真正的根本原因**：

**1. CSS架构治理失控**
- **多套样式系统并存**：Tailwind CSS + CSS变量 + 内联样式 + 组件样式混用
- **性能优化与布局冲突**：全局`transform: translateZ(0)`GPU加速优化意外影响按钮定位
- **CSS层叠顺序混乱**：修复文件导入顺序不当，被后续样式覆盖
- **缺乏统一样式治理**：虽有设计令牌系统，但执行不严格

**2. 问题源头定位**：
```css
/* src/index.css 中的性能优化代码是问题源头 */
.loading-indicator, .animation-element {
  transform: translateZ(0); /* 🚨 GPU加速优化意外影响按钮布局 */
}

input, textarea, select, button {
  contain: layout style;
  /* transform: translateZ(0); 🚨 已移除但曾经影响所有按钮 */
}
```

#### **系统性预防方案**：

**1. 建立严格的CSS架构治理**
```css
/* 正确的CSS层级管理 */
@layer reset, tokens, base, components, utilities, overrides;

@layer tokens {
  /* 设计令牌层 - 最高优先级 */
}

@layer base {
  /* 基础样式层 */
}

@layer components {
  /* 组件样式层 */
}

@layer utilities {
  /* 工具类层 */
}

@layer overrides {
  /* 修复和覆盖层 - 最低优先级 */
}
```

**2. CSS性能优化规范**
- **禁止全局transform**：性能优化不得影响布局定位
- **精确选择器**：GPU加速只应用于特定动画元素
- **影响评估**：任何性能优化必须评估对布局的影响

**3. 样式冲突检测机制**
```javascript
// 自动化检测样式冲突
const detectStyleConflicts = () => {
  // 检测意外的transform属性
  // 验证按钮居中状态
  // 监控CSS优先级冲突
};
```

**4. 强制性代码审查清单**
- ✅ 是否使用了设计令牌而非硬编码？
- ✅ 是否避免了全局transform属性？
- ✅ 是否遵循了CSS层级管理？
- ✅ 是否进行了布局影响评估？
- ✅ 是否添加了自动化测试验证？

#### **长期解决方案**：

**1. CSS系统重构**
- 统一所有样式到设计令牌系统
- 建立严格的CSS层级管理
- 移除所有冲突的样式系统

**2. 自动化治理工具**
- Stylelint规则强制执行设计令牌使用
- 自动化检测硬编码样式和冲突
- CI/CD集成样式合规性检查

**3. 团队培训与规范**
- CSS架构最佳实践培训
- 样式系统使用规范文档
- 定期代码审查和重构

**结论**：这个问题的根本原因不是缺乏统一CSS系统（实际上项目已有完善的设计令牌系统），而是**CSS架构治理失控**导致的样式冲突。解决方案需要从治理层面入手，建立严格的CSS层级管理和冲突检测机制。

---

## 3.7 CSS架构治理体系

### 3.7.1 治理宪章与核心原则

#### **治理目标**
建立零容忍的CSS治理体系，从根本上消除样式冲突、硬编码值和架构混乱问题。

#### **核心原则**
1. **单一真相源（SSOT）**：所有样式必须来源于统一的设计令牌系统
2. **严格层级管理**：使用@layer确保样式优先级可控
3. **零容忍硬编码**：禁止任何形式的硬编码样式值
4. **自动化优先**：所有治理规则必须通过自动化工具强制执行
5. **影响评估强制**：任何样式修改必须评估对全局的影响

#### **治理架构**
```
🏛️ CSS治理体系
├── 📜 治理宪章 (CSS_GOVERNANCE_CHARTER.md)
├── 🔧 自动化工具 (css-governance-enforcer.js)
├── 📋 审查清单 (CSS_CODE_REVIEW_CHECKLIST.md)
├── 🎓 培训体系 (CSS_GOVERNANCE_TRAINING.md)
└── 🚀 CI/CD集成 (.github/workflows/css-governance.yml)
```

### 3.7.2 CSS层级管理系统

#### **强制性层级顺序**
```css
@layer reset, tokens, base, components, utilities, overrides, emergency;
```

#### **层级定义与职责**

**1. Reset Layer（重置层）**
- **职责**：浏览器默认样式重置
- **优先级**：最低
- **允许内容**：normalize.css、reset.css
- **禁止内容**：任何业务逻辑样式

**2. Tokens Layer（令牌层）**
- **职责**：设计令牌定义
- **优先级**：第二低
- **允许内容**：CSS变量定义、主题切换
- **禁止内容**：具体样式实现

**3. Base Layer（基础层）**
- **职责**：全局基础样式
- **优先级**：中低
- **允许内容**：html、body、全局字体
- **禁止内容**：组件特定样式

**4. Components Layer（组件层）**
- **职责**：组件样式定义
- **优先级**：中等
- **允许内容**：.button、.card等组件样式
- **禁止内容**：工具类、修复样式

**5. Utilities Layer（工具层）**
- **职责**：工具类样式
- **优先级**：中高
- **允许内容**：.u-center、.u-hidden等工具类
- **禁止内容**：组件特定样式

**6. Overrides Layer（覆盖层）**
- **职责**：第三方库样式覆盖
- **优先级**：高
- **允许内容**：Radix UI、Tailwind覆盖
- **禁止内容**：业务逻辑样式

**7. Emergency Layer（紧急层）**
- **职责**：紧急修复样式
- **优先级**：最高
- **允许内容**：临时修复、hotfix
- **禁止内容**：长期业务样式
- **特殊要求**：必须有移除计划和时间表

### 3.7.3 严格禁止清单

#### **CRITICAL级别 - 立即阻断**

**1. 全局Transform属性**
```css
/* ❌ 绝对禁止 */
* { transform: translateZ(0); }
button { transform: translateZ(0); }

/* ✅ 正确做法 */
.gpu-accelerated { transform: translateZ(0); }
```

**2. 内联样式**
```jsx
{/* ❌ 绝对禁止 */}
<div style={{color: 'red', width: '200px'}} />

{/* ✅ 正确做法 */}
<div className="text-error w-button" />
```

#### **ERROR级别 - 阻断提交**

**1. 硬编码颜色值**
```css
/* ❌ 错误 */
color: #FF0000;
background: rgb(255, 0, 0);

/* ✅ 正确 */
color: var(--color-error);
background: var(--color-error-bg);
```

**2. 硬编码尺寸值**
```css
/* ❌ 错误 */
width: 200px;
margin: 16px;

/* ✅ 正确 */
width: var(--size-button-width);
margin: var(--spacing-4);
```

**3. !important滥用**
```css
/* ❌ 错误 */
.my-style { color: red !important; }

/* ✅ 正确 - 仅在emergency层使用 */
@layer emergency {
  .hotfix { color: var(--color-error) !important; }
}
```

**4. 跨层级样式定义**
```css
/* ❌ 错误 - 在base层定义组件样式 */
@layer base {
  .button { padding: 1rem; }
}

/* ✅ 正确 */
@layer components {
  .button { padding: var(--spacing-4); }
}
```

### 3.7.4 自动化治理工具

#### **CSS治理强制执行器**
```bash
# 检查模式 - 发现违规但不修复
npm run css:governance:check

# 修复模式 - 自动修复可修复的违规
npm run css:governance:fix

# 报告模式 - 生成详细的治理报告
npm run css:governance:report

# 完整治理审计
npm run css:governance:audit

# 强制执行所有治理规则
npm run css:governance:enforce
```

#### **Stylelint治理规则**
```bash
# 运行治理级别的Stylelint检查
npm run css:governance:lint

# 自动修复Stylelint发现的问题
npm run css:governance:lint:fix
```

#### **治理检测规则**

**CRITICAL级别检测**
- 全局transform属性检测
- 内联样式检测
- 布局破坏性样式检测

**ERROR级别检测**
- 硬编码颜色值检测：`/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g`
- 硬编码尺寸值检测：`/\b\d+px\b(?![^{]*var\()/g`
- !important滥用检测：`/!\s*important(?![^{]*@layer\s+emergency)/g`
- CSS层级顺序验证

**WARNING级别检测**
- 缺少@layer包装检测
- 设计令牌使用检测
- CSS属性顺序检测

### 3.7.5 强制性代码审查机制

#### **审查前自动化检查**
- [ ] ✅ CSS治理强制执行器检查通过
- [ ] ✅ Stylelint治理规则检查通过
- [ ] ✅ CI/CD管道所有检查通过
- [ ] ✅ 无阻断级别违规（CRITICAL/ERROR）

#### **手动审查清单**

**CRITICAL级别检查（必须100%通过）**
- [ ] 🚨 无全局transform属性
- [ ] 🚨 无内联样式使用
- [ ] 🚨 无可能导致按钮居中问题的样式
- [ ] 🚨 无可能影响弹窗定位的样式

**ERROR级别检查（必须通过）**
- [ ] ❌ 无硬编码颜色值
- [ ] ❌ 无硬编码尺寸值
- [ ] ❌ 所有样式都在正确的@layer中
- [ ] ❌ !important仅在emergency层使用

**WARNING级别检查（建议通过）**
- [ ] ⚠️ CSS属性顺序符合规范
- [ ] ⚠️ 选择器复杂度合理（≤4层）
- [ ] ⚠️ 嵌套深度合理（≤3层）

#### **CI/CD集成检查**
```yaml
# .github/workflows/css-governance.yml
- name: 🏛️ CSS治理合规性检查
  run: node scripts/css-governance-enforcer.js check

- name: 🎯 Stylelint治理检查
  run: npx stylelint "src/**/*.{css,scss}" --config .stylelintrc.governance.js

- name: 🔍 设计令牌使用检查
  run: |
    if grep -r "#[0-9a-fA-F]\{3,6\}" src/ --include="*.css"; then
      echo "❌ 发现硬编码颜色值！"
      exit 1
    fi

- name: 🚨 Transform属性冲突检查
  run: |
    if grep -r "^\s*\*\s*{[^}]*transform" src/ --include="*.css"; then
      echo "❌ 发现全局transform属性！"
      exit 1
    fi
```

### 3.7.6 违规处理机制

#### **违规等级与处理**

**Level 4 - CRITICAL（立即阻断）**
- 全局transform属性
- 内联样式使用
- 布局破坏性修改
- **处理**：立即阻断提交，必须修复后才能继续

**Level 3 - ERROR（阻断提交）**
- 硬编码颜色和尺寸值
- !important滥用
- 跨层级样式定义
- **处理**：阻断代码提交，提供自动修复建议

**Level 2 - WARNING（警告）**
- 缺少@layer包装
- 未使用设计令牌
- 代码质量问题
- **处理**：警告提示，不阻断提交

**Level 1 - INFO（信息）**
- 性能优化建议
- 最佳实践提醒
- **处理**：仅记录，不影响流程

#### **自动修复机制**
```javascript
// 自动修复示例
switch (violation.rule) {
  case 'HARDCODED_COLORS':
    fixedContent = content.replace(
      violation.pattern,
      'var(--color-primary) /* TODO: 使用正确的设计令牌 */'
    );
    break;

  case 'HARDCODED_SIZES':
    fixedContent = content.replace(
      violation.pattern,
      'var(--spacing-4) /* TODO: 使用正确的间距令牌 */'
    );
    break;
}
```

### 3.7.7 治理效果监控

#### **关键指标**
- **样式冲突数量**：目标为0
- **硬编码样式数量**：目标为0
- **设计令牌覆盖率**：目标为100%
- **层级合规率**：目标为100%
- **自动化检查通过率**：目标为100%

#### **定期审查**
- **每周**：样式冲突检测报告
- **每月**：设计系统合规性审查
- **每季度**：CSS架构健康度评估
- **每年**：治理体系优化升级

#### **治理报告示例**
```
📊 CSS治理合规性报告
==================================================
📁 检查文件数：334
🚨 发现违规数：599
🔧 自动修复数：0
🚫 阻断提交数：183
==================================================

🚨 CRITICAL 级别违规 (34个):
  📄 src/index.css
     🚨 严重违规：禁止全局transform属性

❌ ERROR 级别违规 (150个):
  📄 src/styles/theme.css
     ❌ 错误：禁止硬编码颜色值
     💡 建议：使用 var(--color-primary)

⚠️ WARNING 级别违规 (416个):
  📄 src/components/Button.tsx
     ⚠️ 警告：样式应该在@layer中定义
```

### 3.7.8 团队培训与规范

#### **培训目标**
- ✅ 理解CSS治理的重要性和必要性
- ✅ 掌握CSS层级管理系统的使用
- ✅ 学会使用设计令牌系统
- ✅ 了解自动化治理工具的使用
- ✅ 能够进行有效的CSS代码审查

#### **培训内容**
1. **CSS治理重要性**：基于真实案例（按钮居中问题）
2. **层级管理系统**：7层架构的使用方法
3. **设计令牌系统**：硬编码转换实践
4. **自动化工具**：治理工具的使用指南
5. **代码审查实践**：审查流程和反馈模板

#### **考核标准**
- **理论考核**：≥80分
- **实践考核**：≥80分
- **能够独立使用所有治理工具**
- **能够进行有效的代码审查**

### 3.7.9 紧急情况处理

#### **生产环境问题**
```css
/* 使用emergency层进行hotfix */
@layer emergency {
  .hotfix-button-center {
    transform: none !important;
    margin: 0 auto !important;
    /* TODO: 移除时间 - 2024-12-31 */
    /* TODO: 负责人 - 开发者姓名 */
  }
}
```

#### **技术债务管理**
- 🗓️ 为emergency层样式设置移除时间表
- 🗓️ 定期审查和重构emergency层
- 🗓️ 将临时修复转换为系统性解决方案

#### **回滚机制**
- 🔄 自动检测异常后立即回滚
- 🔄 保留修复前的代码状态
- 🔄 生成详细的回滚报告

### 3.7.10 长期维护策略

#### **持续优化**
- **工具升级**：定期更新治理工具和规则
- **规范完善**：根据实际使用情况优化规范
- **培训更新**：持续更新培训材料和案例

#### **扩展计划**
- **多项目支持**：将治理体系扩展到其他项目
- **工具开源**：将治理工具开源供社区使用
- **最佳实践分享**：总结经验分享给开发社区

#### **成功标准**
- ✅ 零样式冲突
- ✅ 100%设计令牌覆盖
- ✅ 100%层级合规
- ✅ 自动化检查通过率100%
- ✅ 团队开发效率提升

---

**⚠️ 重要提醒：CSS治理体系具有最高优先级，所有CSS相关工作必须严格遵守。违反治理规则的代码将被自动阻断，不得合并到主分支。这套体系确保了类似按钮居中问题永远不会再发生，从根本上保障代码库的长期健康和可维护性。**