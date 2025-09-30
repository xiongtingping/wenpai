/**
 * 🧠 智能标题生成 Prompt 系统
 * 
 * 基于优化的 Augment Title Prompt V2 规范
 * t('aiPrompts.systemPrompts.contentAlignmentConstraints')
 * 
 * 🎯 核心目标：
 * - 语义拟合：标题紧扣正文主旨，基于向量理解生成
 * - 多平台适配：根据平台限制调整字数
 * - 表达完整：不得语法中断、残句、或逻辑不清
 * - 多样表达：输出结果需涵盖多种风格，避免重复
 * - 强吸引力：具备'钩子效应'，激发用户点击兴趣
 * - 禁止模板句式、空泛用语、符号滥用
 */

// import i18n from '@/i18n'; // 改为动态导入避免TDZ
import { logModuleInit } from '@/utils/logger';

import type { PromptTemplate } from '../types';

/**
 * 🎯 标题类型映射表
 */
export const TITLE_TYPES = {
  'result-emotion': '✅ 结果+情绪型',
  'question-hook': '🤔 提问钩子型',
  'reason-action': '🎯 原因+行动型',
  'experience-contrast': '💡 体验+反差型',
  'tool-value': '🛠️ 工具+明确价值型'
};

/**
 * 🎨 标题风格映射表
 */
export const TITLE_STYLES = {
  'result-emotion': '✅ 结果+情绪型',
  'question-hook': '🤔 提问钩子型',
  'reason-action': '🎯 原因+行动型',
  'experience-contrast': '💡 体验+反差型',
  'tool-value': '🛠️ 工具+明确价值型'
};

/**
 * 📱 平台字数限制配置
 */
export const PLATFORM_LIMITS = {
  xiaohongshu: 20,
  weibo: 30,
  wechat: 64,
  douyin: 30,
  zhihu: 50,
  default: 30
};

/**
 * 🧠 高吸引力标题结构生成（V3）- 主系统提示词
 */
export const getTitleGenerationSystemPrompt = (): string => {
  return `你是一个擅长生成'高吸引力内容标题'的AI助手，${i18n.t('aiPrompts.systemPrompts.generateBasedOnContent')}。

## 🚨 ${i18n.t('aiPrompts.systemPrompts.contentAlignmentConstraints')}

### ✅ ${i18n.t('aiPrompts.systemPrompts.semanticConstraints')}：
1. ${i18n.t('aiPrompts.systemPrompts.titleMustBeBased')}；
2. ${i18n.t('aiPrompts.systemPrompts.semanticCoverage')}：
   - ${i18n.t('aiPrompts.systemPrompts.coreObject')}
   - ${i18n.t('aiPrompts.systemPrompts.userBenefits')}
   - ${i18n.t('aiPrompts.systemPrompts.usageScenarios')}

## 🚫 禁止行为（V3规范）
- ❌ 固定结构模板，如：'盘点X个'、'X大技巧'、'XX合集'
- ❌ 套话式表达，如：'建议收藏'、'干货满满'、'超实用'
- ❌ 夸张宣传，如：'爆款神器'、'疯传'、"所有人都在用${i18n.t('ai.title.表达不_rj5')}内容适配器"、'平台风格调整工具'）
2. **使用场景**：具体应用场景（如'公众号发文'、'小红书写文案'）
3. **用户痛点**：具体问题（如'调性不一致'、'改写太累'、'运营效率低'）

## 🎯 核心目标（V3规范）
- ✅ 与正文主旨强关联，不能跑题
- ✅ 表达自然流畅、语言完整
- ✅ 使用结构清晰、有节奏的语言
- ✅ 包含情绪/场景/动作/转变等吸引要素
- ✅ 每轮生成中包含多种表达结构，避免格式单一
- ✅ 标题必须符合目标平台的字符数限制（中文全角字数）
- ❌ 不允许套模板、堆叠词、夸张宣传

## 🧩 推荐结构风格（鼓励混合生成）

### ✅ 1. 结果 + 情绪型
强调使用结果 + 情感评价
- 示例：只用1次，内容适配5个平台！太爽了！

### ✅ 2. 提问钩子型
用好奇心驱动点击
- 示例：多平台怎么发内容最省事？我找到答案了！

### ✅ 3. 原因 + 行动型
讲述为什么用 + 得到了什么
- 示例：因为用文派，我再也不用重复改写！

### ✅ 4. 体验 + 反差型
从'以前'到'现在'的转变
- 示例：以前要发3遍内容，现在1次就全平台搞定！

### ✅ 5. 工具 + 明确价值型
工具名称 + 功能/收益
- 示例：文派：多平台适配神器，1次搞定5个平台文案！

## 🎨 推荐表达策略（鼓励混搭）
- 💥 冲突词：'没想到'、'居然'、'1次搞定'、'以前总要…现在只要…'
- 🎯 场景/身份词：'小红书博主'、'品牌方'、'内容运营'、'自媒体人'
- 💡 明确收益：'节省时间'、'涨粉3倍'、'统一品牌调性'、"转化率提升${i18n.t('ai.title.风_g86')}AI的好处"、'AI的魅力'）
- **不得使用模板化结构**（如'盘点X个'、'X大技巧'、'建议收藏'）
- **不得使用滥情词语**（如'干货满满'、'效率拉满'）或无意义标点（如'！！！'、'｜'）

## ✂️ 表达完整性与长度控制（防截断）
每个标题必须为**表达完整的一句话**，不可为残句、半句、未结束短语；
禁止以'：'、'，'、'…'、'和'等非句末成分结尾；
标题长度**必须严格控制在对应平台的全角字符限制内**（如小红书 ≤20字）；
不要为了塞关键词而导致语义逻辑断裂。

## ⚖️ 标题排序机制（质量评估权重）
| 维度           | 权重 | 描述                                      |
|----------------|------|-------------------------------------------|
| 内容主旨相似度   | 50%  | 与正文内容向量匹配度（embedding 相似度）        |
| 情绪吸引力评分   | 30%  | 是否具备点击欲望（如使用钩子型语气、结论式表达）   |
| 表达结构多样性   | 15%  | 当前标题是否与上一条句式重复                   |
| 字符利用率       | 5%   | 字符数越接近上限越优（信息密度高）              |

请严格按照以上规范生成标题，确保每个标题都与原文内容高度相关，具备强吸引力，且表达自然完整。`;
};

/**
 * 标题生成用户提示词模板
 */
export const getTitleGenerationPrompt: PromptTemplate = (input: any, options = {}) => {
  const { 
    content, 
    versions = [], 
    platform = 'xiaohongshu', 
    stylePreference = [], 
    outputCount = 5,
    ensureDiversity = true 
  } = input;

  const { debug = false } = options;

  // 获取平台字数限制
  const titleLimit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] || PLATFORM_LIMITS.default;

  // 合并所有内容用于分析
  const allContent = versions.length > 0 
    ? versions.map((v: any) => v.content).join('\n\n') 
    : content;

  // 风格偏好处理
  const preferredStyles = stylePreference.length > 0 
    ? stylePreference.map((style: string) => TITLE_STYLES[style as keyof typeof TITLE_STYLES] || style).join('、')
    : i18n.t('aiPrompts.status.allStyles');

  return `请基于以下正文内容生成${outputCount}个高吸引力标题（V3规范）：

## 📝 正文内容（版本A/B）
${allContent}

## 🎯 生成要求（V3规范）
- **目标平台**: ${platform}（字数限制：${titleLimit}字以内）
- **输出数量**: ${outputCount}个标题
- **风格要求**: 必须包含多种结构风格，避免格式单一
- **吸引力要素**: 包含情绪/场景/动作/转变等要素
- **确保多样性**: ${ensureDiversity ? i18n.t('aiPrompts.status.yes') : i18n.t('aiPrompts.status.no')}

## 🔍 内容分析要求（强化语义提取）
请先深度分析正文内容的：
1. **核心对象**：具体提到的工具、产品、服务名称（如'文派AI工具'、'内容适配器'）
2. **用户收益**：明确的价值主张和使用效果（如'节省80%时间'、'效率翻倍'、'涨粉3倍'）
3. **使用场景**：具体的应用场景和目标用户（如'小红书种草'、'公众号发文'、'职场内容改写'）
4. **关键动作**：用户具体做了什么（如'一键适配'、'自动生成'、'批量改写'）
5. **量化效果**：具体的数据或效果（如'80%时间'、'3倍效率'、${i18n.t('ai.status.aistatu_235')}）

## 📤 输出格式
请按以下JSON格式输出：

\`\`\`json
{
  'contentAnalysis': {
    'coreObjects': ['文派AI工具', '内容适配器'],
    'userBenefits': ['节省80%时间', '效率翻倍', '一键适配'],
    'useScenarios': ['小红书种草笔记', '公众号发文', '职场内容改写'],
    'keyActions': ['一键适配', '自动生成', '批量改写'],
    'quantifiedEffects': ['80%时间节省', '3倍效率提升', ${i18n.t('ai.status.aistatu_235')}],
    'mainTheme': 'AI工具提升内容创作效率'
  },
  'titles': [
    {
      'title': '${i18n.t('aiPrompts.titleGeneration.titleContent')}',
      'style': '✅ 结果+情绪型',
      'length': 18,
      'semanticFit': 0.85,
      'emotionalScore': 0.90,
      'structuralDiversity': 0.85,
      'characterUtilization': 0.90,
      'reasoning': '基于正文中提到的具体工具X，采用结果+情绪型结构，强调使用效果Y'
    }
  ]
}
\`\`\`

## ⚠️ 重要约束（强化语义完整性）
1. **语义贴合度必须≥75%**：每个标题都必须与正文内容高度相关
2. **禁止虚构内容**：不得添加正文中未提及的具体数据或效果
3. **避免空泛表达**：必须包含具体的对象名称或明确的价值主张
4. **确保表达完整**：标题语法正确，逻辑清晰，无截断或残句
5. **主谓搭配完整**：如'我用X后Y'必须明确Y是什么（效率、涨粉、时间等）
6. **量化信息具体**：如'提升200%'必须说明提升的是什么
7. **场景信息明确**：必须包含具体的使用场景或平台信息
8. **禁止模板套用**：不得直接套用模板而忽略内容上下文

${debug ? `## 🔧 ${i18n.t('ai.title.n_86o')}` : ''}

现在开始分析内容并生成标题：`;
};

/**
 * 标题质量检查提示词模板
 */
export const getTitleQualityCheckPrompt: PromptTemplate = (input: any, options = {}) => {
  const { title, originalContent, platform = 'xiaohongshu' } = input;
  const { debug = false } = options;

  // 获取平台字数限制
  const titleLimit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] || PLATFORM_LIMITS.default;

  return `${i18n.t('ai.title._btk')}请对以下标题进行质量检查：

## 📝 原文内容
${originalContent}

## 🏷️ 待检查标题
'${title}'

## 📏 平台要求
- 平台：${platform}
- 字数限制：${titleLimit}字以内
- 当前长度：${title.length}字

## 🔍 检查维度
请从以下维度评估标题质量（0-100分）：

1. **内容主旨相似度**（权重50%）
   - 标题是否紧扣原文核心内容
   - 是否包含原文中的具体对象/工具
   - 是否体现原文的价值主张

2. **情绪吸引力评分**（权重30%）
   - 是否具备点击欲望和钩子效应
   - 语言表达是否生动有趣
   - 是否能激发用户兴趣

3. **表达结构完整性**（权重15%）
   - 语法是否正确完整
   - 逻辑是否清晰
   - 是否有截断或残句

4. **字符利用率**（权重5%）
   - 字符数是否合理利用平台限制
   - 信息密度是否适中

## 📤 输出格式
\`\`\`json
{
  'overallScore': 85,
  'dimensions': {
    'semanticFit': 90,
    'emotionalAttraction': 80,
    'structuralIntegrity': 95,
    'characterUtilization': 75
  },
  'issues': ['具体问题1', '具体问题2'],
  'suggestions': ['改进建议1', '改进建议2'],
  'isQualified': true,
  'reasoning': '详细评估理由'
}
\`\`\`

${debug ? '\n## 🔧 调试模式\n请提供详细的评估过程和判断依据。' : ''}

现在开始质量检查：`;
};

logModuleInit(`${i18n.t('ai.title.智能标题生成P_h35')}`);
