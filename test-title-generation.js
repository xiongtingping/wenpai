/**
 * 智能标题生成功能测试脚本
 * 测试修复后的智能标题生成功能
 */

const testContent = `
我发现了一个超级好用的AI工具，它可以帮助我快速生成各种内容。
这个工具支持多种平台，包括小红书、微博、抖音等。
使用后我的工作效率提升了3倍，真的很推荐给大家！
`;

const testTitleGeneration = async () => {
  console.log('🧪 开始智能标题生成功能测试...');
  console.log('📝 测试内容:', testContent.substring(0, 50) + '...');
  
  try {
    // 测试DeepSeek API的标题生成
    console.log('\n🔍 测试DeepSeek API标题生成...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-56c02f3de6fe4a04a346cc14f3c5d310'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `你是一个擅长生成"高吸引力内容标题"的AI助手，请根据用户提供的正文内容生成符合平台要求、表达自然完整、结构多样、主旨贴合、具备点击吸引力的标题。

## 🚨 强化内容主旨对齐（拟合）约束

### ✅ 必须执行以下语义约束：
1. 标题必须基于用户提供的正文内容生成，不允许脱离文本主旨；
2. 标题语义应覆盖正文内容的：
   - 核心对象（如：AI工具、内容生成平台等）
   - 用户收益（如：提升效率、节省时间、多平台支持）
   - 使用场景（如：小红书、微博、抖音内容创作）

## 🎯 核心目标
- ✅ 与正文主旨强关联，不能跑题
- ✅ 表达自然流畅、语言完整
- ✅ 使用结构清晰、有节奏的语言
- ✅ 包含情绪/场景/动作/转变等吸引要素
- ✅ 标题必须符合目标平台的字符数限制（中文全角字数）

## 🧩 推荐结构风格（鼓励混合生成）

### ✅ 1. 结果 + 情绪型
强调使用结果 + 情感评价
- 示例：只用1次，内容适配5个平台！太爽了！

### ✅ 2. 提问钩子型
用好奇心驱动点击
- 示例：多平台怎么发内容最省事？我找到答案了！

### ✅ 3. 原因 + 行动型
讲述为什么用 + 得到了什么
- 示例：因为用AI工具，我再也不用重复改写！

### ✅ 4. 体验 + 反差型
从"以前"到"现在"的转变
- 示例：以前要发3遍内容，现在1次就全平台搞定！

### ✅ 5. 工具 + 明确价值型
工具名称 + 功能/收益
- 示例：AI工具：多平台适配神器，1次搞定5个平台文案！

## 🛠 标题质量要求
- **长度 ≥ 8 字**，建议 ≤ 20字
- **不能语义残缺**
- **不得使用模板化结构**
- **不得使用滥情词语**

请严格按照以上规范生成标题，确保每个标题都与原文内容高度相关，具备强吸引力，且表达自然完整。`
          },
          {
            role: 'user',
            content: `请为以下内容生成3个不同风格的标题，要求：
1. 符合小红书平台风格
2. 不超过20字
3. 吸引眼球
4. 与内容主旨强相关

内容：${testContent}

请以JSON格式返回：
{
  "titles": [
    {
      "title": "标题1",
      "style": "风格描述",
      "reasoning": "生成理由"
    }
  ]
}`
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      console.log('✅ AI标题生成成功');
      console.log('📝 原始响应:', content);
      
      // 尝试解析JSON
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonContent = jsonMatch ? jsonMatch[1] : content;
        const result = JSON.parse(jsonContent);
        
        console.log('\n🎉 解析成功！生成的标题：');
        result.titles?.forEach((title, index) => {
          console.log(`${index + 1}. ${title.title} (${title.style})`);
          console.log(`   理由: ${title.reasoning}`);
        });
        
        return true;
      } catch (parseError) {
        console.log('⚠️ JSON解析失败，显示原始内容：');
        console.log(content);
        return false;
      }
    } else {
      console.log('❌ AI标题生成失败:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return false;
  }
};

// 运行测试
testTitleGeneration().then(success => {
  console.log(`\n${success ? '🎉 测试完成！智能标题生成功能正常' : '❌ 测试失败，需要进一步检查'}`);
}); 