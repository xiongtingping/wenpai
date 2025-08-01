/**
 * 标题生成器测试用例
 * 用于验证重构后的标题生成逻辑是否正确修复了语病问题
 */

// 测试内容样本
export const testContents = [
  {
    name: "AI工具推荐内容",
    content: `发现了5个超好用的AI工具，真的让我震惊了！这些工具不仅功能强大，而且使用简单。
    
第一个是ChatGPT，这个对话AI工具真的改变了我的工作方式。
第二个是Midjourney，生成的图片质量惊人。
第三个是Notion AI，写作助手功能很实用。
第四个是Grammarly，语法检查很准确。
第五个是Canva AI，设计模板丰富。

这些工具让我的效率提升了200%，强烈推荐给大家！`,
    expectedIssues: [
      "避免'X个的Y'语法错误",
      "确保标题完整性",
      "修复数字+产品组合的语法"
    ]
  },
  {
    name: "教程类内容",
    content: `今天分享一个超实用的视频剪辑方法，让你的视频制作效率翻倍！

核心方法就是使用快捷键和模板。重点是要掌握这3个技巧：
1. 快速剪切的方法
2. 音频同步的技巧  
3. 特效添加的流程

这个方法我用了半年，真的很有效果。`,
    expectedIssues: [
      "确保方法类标题的完整性",
      "避免'方法详解｜实用指南'等模板化表达"
    ]
  },
  {
    name: "情感分享内容", 
    content: `我最近体验了一款新的学习软件，感觉真的很棒！

刚开始我觉得可能和其他软件差不多，但是用了一周后，我发现它真的不一样。
界面设计很用心，功能也很实用。最重要的是，它让我重新找回了学习的乐趣。

那天我用它学完一个课程后，感觉特别有成就感。这种感受已经很久没有过了。`,
    expectedIssues: [
      "确保情感表达的完整性",
      "避免'让我真的'等不完整结尾"
    ]
  }
];

// 预期的语病模式（应该被修复）
export const grammarErrorPatterns = [
  /\d+[个种款项次倍人家]的[^，。！？]+/,  // "X个的..."模式
  /[工具软件平台应用]$/,                // 词汇截断
  /让我真的$/,                         // 不完整结尾
  /我超爱它让我真的$/,                 // 典型截断
  /推荐200%发现宝藏.*真的$/,           // 另一种截断
  /音脚本直接给到热方法详解/,          // 语序错误
];

// 测试函数
export const runTitleGenerationTest = (generateTitle: (content: string, platform: string, style: string) => string) => {
  const results: any[] = [];
  
  testContents.forEach(testCase => {
    console.log(`\n🧪 测试用例: ${testCase.name}`);
    console.log(`内容长度: ${testCase.content.length} 字符`);
    
    const styles = ['engaging', 'informative', 'emotional'];
    const platforms = ['xiaohongshu', 'weibo', 'zhihu'];
    
    styles.forEach(style => {
      platforms.forEach(platform => {
        try {
          const title = generateTitle(testCase.content, platform, style);
          
          // 检查语病
          const hasGrammarError = grammarErrorPatterns.some(pattern => pattern.test(title));
          
          // 检查完整性
          const isComplete = title.length >= 5 && !title.endsWith('真的') && !title.endsWith('让我');
          
          const result = {
            testCase: testCase.name,
            platform,
            style,
            title,
            hasGrammarError,
            isComplete,
            length: title.length,
            status: !hasGrammarError && isComplete ? '✅ 通过' : '❌ 失败'
          };
          
          results.push(result);
          
          console.log(`${style} (${platform}): ${title}`);
          console.log(`  状态: ${result.status}`);
          if (hasGrammarError) {
            console.log(`  ⚠️ 检测到语病`);
          }
          if (!isComplete) {
            console.log(`  ⚠️ 标题不完整`);
          }
          
        } catch (error) {
          console.error(`❌ 生成失败: ${error}`);
          results.push({
            testCase: testCase.name,
            platform,
            style,
            title: '',
            hasGrammarError: true,
            isComplete: false,
            length: 0,
            status: '❌ 错误',
            error: error instanceof Error ? error.message : String(error)
          });
        }
      });
    });
  });
  
  // 统计结果
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === '✅ 通过').length;
  const failedTests = totalTests - passedTests;
  
  console.log(`\n📊 测试结果统计:`);
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
  console.log(`失败: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);
  
  return results;
};

// 验证特定语病修复的测试
export const testSpecificGrammarFixes = (generateTitle: (content: string, platform: string, style: string) => string) => {
  console.log('\n🔧 特定语病修复测试:');
  
  const specificTests = [
    {
      name: "数字+产品语法修复",
      content: "推荐5个AI工具，真的很好用！",
      shouldAvoid: /\d+[个种款项次倍人家]的/,
      description: "应避免'5个的工具'语法"
    },
    {
      name: "截断问题修复", 
      content: "这个软件让我真的很喜欢，功能强大。",
      shouldAvoid: /让我真的$/,
      description: "应避免'让我真的'不完整结尾"
    },
    {
      name: "产品名称完整性",
      content: "分享一个视频编辑工具，效果很棒。",
      shouldAvoid: /[工具软件平台应用]$/,
      description: "应保持产品名称完整，不截断"
    }
  ];
  
  specificTests.forEach(test => {
    console.log(`\n测试: ${test.name}`);
    const title = generateTitle(test.content, 'xiaohongshu', 'engaging');
    const hasIssue = test.shouldAvoid.test(title);
    
    console.log(`生成标题: ${title}`);
    console.log(`${test.description}: ${hasIssue ? '❌ 仍有问题' : '✅ 已修复'}`);
  });
};
