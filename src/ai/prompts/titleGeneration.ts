/**
 * 🧠 智能标题生成 Prompt 系统
 * 
 * 基于优化的 Augment Title Prompt V2 规范
 * 强化内容主旨对齐（拟合）约束
 * 
 * 🎯 核心目标：
 * - 语义拟合：标题紧扣正文主旨，基于向量理解生成
 * - 多平台适配：根据平台限制调整字数
 * - 表达完整：不得语法中断、残句、或逻辑不清
 * - 多样表达：输出结果需涵盖多种风格，避免重复
 * - 强吸引力：具备"钩子效应"，激发用户点击兴趣
 * - 禁止模板句式、空泛用语、符号滥用
 */

import type { PromptTemplate } from '../types';

/**
 * 平台字数控制配置
 */
export const PLATFORM_LIMITS = {
  xiaohongshu: 20,  // 小红书：20字以内
  wechat: 28,       // 公众号：28字以内
  weibo: 25,        // 微博：25字以内
  douyin: 18,       // 抖音：18字以内
  bilibili: 30,     // B站：30字以内
  zhihu: 50,        // 知乎：50字以内
  default: 25
};

/**
 * 标题风格定义
 */
export const TITLE_STYLES = {
  'result-oriented': '🎯 结果导向型',
  'question-guided': '🤔 提问引导型', 
  'professional': '📘 专业理性型',
  'experience-based': '💡 经验总结型',
  'emotional-trigger': '📣 情绪钩子型'
};

/**
 * 主系统提示词 - 强化内容主旨对齐约束
 */
export const getTitleGenerationSystemPrompt = (): string => {
  return `你是一个高级 AI 标题生成助手，请根据提供的正文内容（如版本A/B），生成**贴合内容语义、表达自然完整、风格丰富、吸引力强**的标题。标题应适配目标平台长度要求，避免模板化表达、语法错误或内容截断。

## 🚨 强化内容主旨对齐（拟合）约束

### ✅ 必须执行以下语义约束：
1. 标题必须基于用户提供的正文内容（版本A/B）生成，不允许脱离文本主旨；
2. 标题语义应覆盖正文内容的：
   - 核心对象（如：文派工具、AI内容平台适配等）
   - 用户收益（如：多平台适配、省时间、省力、提升效率）
   - 使用场景（如：小红书、公众号、抖音内容创作）

### 🚫 禁止的生成行为（新增约束）
- 不得生成与原文无直接关系的空泛标题，如"AI真强"、"这神器必须推荐"等；
- 不得脱离版本内容虚构使用体验（如"涨粉3倍"、"强烈安利"等语气需正文真实支持）；
- 不得泛用"AI"、"神器"、"推荐"等无主旨指向性高频词，除非原文确实如此表达。

## 🎯 核心目标
- ✅ 语义拟合：标题紧扣正文主旨，基于向量理解（embedding）生成；
- ✅ 多平台适配：根据平台限制调整字数（中文全角）；
- ✅ 表达完整：不得语法中断、残句、或逻辑不清；
- ✅ 多样表达：输出结果需涵盖多种风格，避免重复；
- ✅ 强吸引力：具备"钩子效应"，激发用户点击兴趣；
- ❌ 禁止模板句式、空泛用语、符号滥用。

## ✨ 风格指令（每轮输出中需至少包含3种风格）
| 风格类型     | 示例标题                                      |
|--------------|-----------------------------------------------|
| 🎯 结果导向型   | 我用这工具后涨粉3倍，真的惊到我了！                    |
| 🤔 提问引导型   | 为什么大家都在用它写内容？                            |
| 📘 专业理性型   | 多平台文案改写工具优劣对比                          |
| 💡 经验总结型   | 我的AI写作3大技巧，效率翻倍                        |
| 📣 情绪钩子型   | 太好用了！AI文案工具简直救命                         |

## 🛠 标题质量要求
- **长度 ≥ 8 字**，建议 ≥ 平台上限 × 70%
- **不能语义残缺**（如"AI的好处"、"AI的魅力"）
- **不得使用模板化结构**（如"盘点X个"、"X大技巧"、"建议收藏"）
- **不得使用滥情词语**（如"干货满满"、"效率拉满"）或无意义标点（如"！！！"、"｜"）

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
    : '所有风格';

  return `请基于以下正文内容生成${outputCount}个高质量标题：

## 📝 正文内容（版本A/B）
${allContent}

## 🎯 生成要求
- **目标平台**: ${platform}（字数限制：${titleLimit}字以内）
- **输出数量**: ${outputCount}个标题
- **风格偏好**: ${preferredStyles}
- **确保多样性**: ${ensureDiversity ? '是' : '否'}

## 🔍 内容分析要求
请先分析正文内容的：
1. **核心对象**：具体提到的工具、产品、服务名称
2. **用户收益**：明确的价值主张和使用效果
3. **使用场景**：具体的应用场景和目标用户

## 📤 输出格式
请按以下JSON格式输出：

\`\`\`json
{
  "contentAnalysis": {
    "coreObjects": ["具体工具名称1", "具体工具名称2"],
    "userBenefits": ["具体收益1", "具体收益2"],
    "useScenarios": ["使用场景1", "使用场景2"],
    "mainTheme": "核心主题总结"
  },
  "titles": [
    {
      "title": "标题内容",
      "style": "🎯 结果导向型",
      "length": 18,
      "semanticFit": 0.85,
      "reasoning": "基于正文中提到的具体工具X，强调实际使用效果Y"
    }
  ]
}
\`\`\`

## ⚠️ 重要约束
1. **语义贴合度必须≥75%**：每个标题都必须与正文内容高度相关
2. **禁止虚构内容**：不得添加正文中未提及的具体数据或效果
3. **避免空泛表达**：必须包含具体的对象名称或明确的价值主张
4. **确保表达完整**：标题语法正确，逻辑清晰，无截断或残句

${debug ? '\n## 🔧 调试模式\n请提供详细的内容分析过程和标题生成推理。' : ''}

现在开始分析内容并生成标题：`;
};

/**
 * 标题质量检查提示词
 */
export const getTitleQualityCheckPrompt: PromptTemplate = (input: any, options = {}) => {
  const { title, originalContent, platform } = input;
  const { debug = false } = options;
  
  const titleLimit = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS] || PLATFORM_LIMITS.default;

  return `请对以下标题进行质量检查：

## 📝 原文内容
${originalContent}

## 🏷️ 待检查标题
"${title}"

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
  "overallScore": 85,
  "dimensions": {
    "semanticFit": 90,
    "emotionalAttraction": 80,
    "structuralIntegrity": 95,
    "characterUtilization": 75
  },
  "issues": ["具体问题1", "具体问题2"],
  "suggestions": ["改进建议1", "改进建议2"],
  "isQualified": true,
  "reasoning": "详细评估理由"
}
\`\`\`

${debug ? '\n## 🔧 调试模式\n请提供详细的评估过程和判断依据。' : ''}

现在开始质量检查：`;
};

console.log('🧠 智能标题生成 Prompt 系统已加载');
