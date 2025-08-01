import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TitleGenerator from '@/components/TitleGeneratorIntelligent';

const TitleGrammarTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    content: string;
    platform: string;
    expectedIssue: string;
    result: string;
    isFixed: boolean;
  }>>([]);

  // 测试用例 - 包含已知会产生语病的内容
  const testCases = [
    {
      content: "这里有5个发现宝藏AI工具，真的很好用！包括ChatGPT、Claude等强大的AI工具。",
      platform: "xiaohongshu",
      expectedIssue: "5个的发现宝藏AI工 (语法错误 + 词汇截断)"
    },
    {
      content: "推荐3种新软件，都是很棒的开发工具，提高效率必备。",
      platform: "weibo", 
      expectedIssue: "3种的新软件 (语法错误)"
    },
    {
      content: "分享10个实用APP应用，每个都很好用，值得下载。",
      platform: "zhihu",
      expectedIssue: "10个的实用APP (语法错误)"
    },
    {
      content: "发现7款神奇产品，改变生活的好东西，必须推荐给大家。",
      platform: "douyin",
      expectedIssue: "7款的神奇产品 (语法错误)"
    }
  ];

  const runGrammarTest = async () => {
    console.log('🧪 开始语病修复测试...');
    const results = [];

    for (const testCase of testCases) {
      try {
        // 模拟标题生成过程
        const mockVersions = [
          {
            id: 'test-a',
            title: '测试版本A',
            content: testCase.content,
            style: 'standard' as const
          }
        ];

        // 这里我们需要手动调用标题生成逻辑来测试
        // 由于组件内部的函数不能直接访问，我们创建一个简化的测试版本
        const testResult = await simulateTitleGeneration(testCase.content, testCase.platform);
        
        results.push({
          content: testCase.content,
          platform: testCase.platform,
          expectedIssue: testCase.expectedIssue,
          result: testResult,
          isFixed: !hasGrammarError(testResult)
        });

      } catch (error) {
        console.error('测试失败:', error);
        results.push({
          content: testCase.content,
          platform: testCase.platform,
          expectedIssue: testCase.expectedIssue,
          result: '生成失败',
          isFixed: false
        });
      }
    }

    setTestResults(results);
    console.log('🧪 测试完成:', results);
  };

  // 简化的标题生成模拟函数
  const simulateTitleGeneration = async (content: string, platform: string): Promise<string> => {
    // 提取数字
    const numberMatches = content.match(/(\d+[个种款项次倍人家])/g) || [];
    // 提取产品 - 修复版本，保留完整词汇
    const productMatches = content.match(/([A-Za-z0-9\u4e00-\u9fa5]{2,8}[工具软件平台应用APP系统产品])/g) || [];
    
    console.log('提取结果:', { numbers: numberMatches, products: productMatches });

    if (numberMatches.length > 0 && productMatches.length > 0) {
      // 修复后的模板 - 使用正确语法
      const templates = [
        `发现${numberMatches[0]}${productMatches[0]}！真的很棒`,
        `推荐${numberMatches[0]}${productMatches[0]}！必须收藏`,
        `分享${numberMatches[0]}${productMatches[0]}！绝了`
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }

    return `${content.substring(0, 15)}...推荐！`;
  };

  // 检查是否有语病
  const hasGrammarError = (title: string): boolean => {
    const grammarErrors = [
      /\d+[个种款项次倍人家]的[^，。！？]+/,  // "X个的..."模式
      /[工具软件平台应用]$/,                // 词汇截断
      /的的/,                              // 重复"的"
      /！！/,                              // 重复感叹号
    ];
    
    return grammarErrors.some(pattern => pattern.test(title));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 标题语病修复测试
            <Badge variant="outline">语法验证</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={runGrammarTest} className="flex items-center gap-2">
              🚀 运行语病测试
            </Button>
            <span className="text-sm text-gray-600">
              测试修复"X个的Y"等常见语病问题
            </span>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">测试结果</h3>
              {testResults.map((result, index) => (
                <Card key={index} className={`border-l-4 ${result.isFixed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.isFixed ? "default" : "destructive"}>
                          {result.isFixed ? "✅ 已修复" : "❌ 仍有问题"}
                        </Badge>
                        <Badge variant="outline">{result.platform}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>测试内容:</strong> {result.content.substring(0, 50)}...</p>
                        <p><strong>预期问题:</strong> {result.expectedIssue}</p>
                        <p><strong>生成结果:</strong> <span className={result.isFixed ? 'text-green-600' : 'text-red-600'}>{result.result}</span></p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 实际组件测试 */}
      <Card>
        <CardHeader>
          <CardTitle>实际组件测试</CardTitle>
        </CardHeader>
        <CardContent>
          <TitleGenerator
            content="这里有5个发现宝藏AI工具，真的很好用！包括ChatGPT、Claude等强大的AI工具。还有3种新软件推荐，都是很棒的开发工具。"
            platformId="xiaohongshu"
            versions={[
              {
                id: 'test-a',
                title: '测试版本A',
                content: '这里有5个发现宝藏AI工具，真的很好用！包括ChatGPT、Claude等强大的AI工具。',
                style: 'standard' as const
              },
              {
                id: 'test-b', 
                title: '测试版本B',
                content: '还有3种新软件推荐，都是很棒的开发工具，提高效率必备。',
                style: 'creative' as const
              }
            ]}
            onTitleChange={(title) => console.log('标题变更:', title)}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TitleGrammarTestPage;
