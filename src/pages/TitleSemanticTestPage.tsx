/**
 * 标题语义完整性测试页面
 * 用于验证修复后的标题生成质量
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TitleGenerator from '../components/TitleGeneratorIntelligent';

const testCases = [
  {
    id: 'case1',
    name: '具体工具+量化效果',
    content: `文派AI工具是一款强大的内容适配器，能够一键适配小红书、公众号等多个平台。

使用文派后，我的内容创作效率提升了80%，每天节省2小时的改写时间。特别是在小红书种草笔记的创作上，文派能够自动调整语言风格和话题标签，让我的发文效率翻倍。

主要功能：
1. 智能内容分析和语义理解
2. 多平台风格自动适配  
3. 一键生成话题标签
4. 批量内容改写

现在我每天用文派处理10篇内容，从原来的4小时缩短到1小时，真的是内容创作者的神器。`,
    expectedKeywords: ['文派AI工具', '80%效率提升', '小红书种草', '2小时节省', '一键适配']
  },
  {
    id: 'case2', 
    name: '职场场景+具体收益',
    content: `在职场中，我经常需要为不同平台写内容。以前写一篇公众号文章需要2小时，改写成小红书版本又要1小时。

自从用了AI内容适配器，现在只需要30分钟就能完成所有平台的内容。这个工具能够：
- 自动识别内容主题
- 智能调整语言风格
- 生成平台专属话题标签
- 保持品牌调性一致

最重要的是，它帮我在职场内容营销上取得了突破，我的文章阅读量提升了3倍，老板都夸我工作效率高。`,
    expectedKeywords: ['AI内容适配器', '30分钟完成', '职场内容营销', '3倍阅读量', '工作效率']
  },
  {
    id: 'case3',
    name: '简短内容测试',
    content: `AI工具很好用，提升效率。`,
    expectedKeywords: ['AI工具', '提升效率']
  }
];

export default function TitleSemanticTestPage() {
  const [selectedCase, setSelectedCase] = useState(testCases[0]);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleCaseSelect = (testCase: typeof testCases[0]) => {
    setSelectedCase(testCase);
    setGeneratedTitles([]);
    setAnalysisResults(null);
  };

  const handleTitleChange = (title: string) => {
    if (!generatedTitles.includes(title)) {
      setGeneratedTitles(prev => [...prev, title]);
    }
  };

  const analyzeSemanticCompleteness = (title: string) => {
    const issues: string[] = [];
    const strengths: string[] = [];

    // 检查主谓搭配完整性
    if (title.includes('我用') && title.includes('后')) {
      const afterMatch = title.match(/我用([^后]+)后(.+)/);
      if (afterMatch) {
        const effect = afterMatch[2];
        if (/^[\d%🚀！\s]*$/u.test(effect)) {
          issues.push('效果描述不完整：只有数字或符号');
        } else {
          strengths.push('主谓搭配完整');
        }
      }
    }

    // 检查是否包含具体对象
    const hasSpecificObject = selectedCase.expectedKeywords.some(keyword => 
      title.includes(keyword.replace(/\d+%?/, '').replace(/[效率提升节省]/g, ''))
    );
    if (hasSpecificObject) {
      strengths.push('包含具体对象名称');
    } else {
      issues.push('缺少具体对象名称');
    }

    // 检查是否包含量化效果
    const hasQuantifiedEffect = /\d+[%倍]/.test(title) || 
      selectedCase.expectedKeywords.some(keyword => title.includes(keyword));
    if (hasQuantifiedEffect) {
      strengths.push('包含量化效果');
    } else {
      issues.push('缺少量化效果描述');
    }

    return { issues, strengths };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 标题语义完整性测试
            <Badge variant="outline">修复验证</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 测试用例选择 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">选择测试用例</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testCases.map(testCase => (
                <Card 
                  key={testCase.id} 
                  className={`cursor-pointer transition-all ${
                    selectedCase.id === testCase.id ? 'ring-2 ring-hsl(var(--primary))-500 bg-accent' : 'hover:bg-accent'
                  }`}
                  onClick={() => handleCaseSelect(testCase)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{testCase.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">
                      {testCase.content.substring(0, 100)}...
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {testCase.expectedKeywords.slice(0, 3).map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：测试内容和标题生成器 */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">测试内容</h3>
                <Textarea
                  value={selectedCase.content}
                  readOnly
                  className="min-h-[200px] bg-accent"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">期望关键词</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.expectedKeywords.map(keyword => (
                    <Badge key={keyword} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">标题生成器</h3>
                <TitleGenerator
                  content={selectedCase.content}
                  platformId="xiaohongshu"
                  platformName="小红书"
                  onTitleChange={handleTitleChange}
                  versions={[{
                    id: 'test',
                    title: '测试版本',
                    content: selectedCase.content,
                    style: 'standard' as const,
                    charCount: selectedCase.content.length
                  }]}
                />
              </div>
            </div>

            {/* 右侧：生成结果分析 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">生成结果分析</h3>
              
              {generatedTitles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  点击生成标题开始测试
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedTitles.map((title, index) => {
                    const analysis = analyzeSemanticCompleteness(title);
                    return (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            标题 {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium mb-3">{title}</p>
                          
                          {analysis.strengths.length > 0 && (
                            <div className="mb-2">
                              <p className="text-sm font-medium text-foreground mb-1">✅ 优点：</p>
                              <div className="flex flex-wrap gap-1">
                                {analysis.strengths.map(strength => (
                                  <Badge key={strength} variant="secondary" className="text-xs bg-accent text-foreground">
                                    {strength}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {analysis.issues.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-destructive mb-1">❌ 问题：</p>
                              <div className="flex flex-wrap gap-1">
                                {analysis.issues.map(issue => (
                                  <Badge key={issue} variant="destructive" className="text-xs">
                                    {issue}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 修复说明 */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">🔧 修复内容说明</h4>
            <ul className="text-sm text-primary space-y-1">
              <li>• <strong>语义完整性检查</strong>：确保"我用X后Y"的Y部分完整</li>
              <li>• <strong>具体对象提取</strong>：优先使用具体工具名而非泛化词汇</li>
              <li>• <strong>量化效果保留</strong>：保持具体的数据和效果描述</li>
              <li>• <strong>场景信息融合</strong>：结合具体使用场景生成标题</li>
              <li>• <strong>模板智能匹配</strong>：基于内容上下文选择合适模板</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
