/**
 * 标题反模板化测试页面
 * 验证避免生成内容偏离主旨的AI神器模板
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TitleGenerator from '../components/TitleGeneratorIntelligent';
import { detectTemplatePatterns, checkDimensionCoverage } from '@/utils/titleGenerationUtils';

const testCases = [
  {
    id: 'case1',
    name: '具体产品+场景+痛点',
    content: `文派内容适配器是专门为多平台内容创作设计的工具。

我之前在公众号发文时，总是为调性不一致而头疼。同一篇内容，在小红书需要活泼的语气，在知乎需要专业的表达，手动改写太累了，而且经常改得不伦不类。

用了文派后，它能自动识别平台特点，一键调整语言风格。现在我发一篇内容到5个平台，从原来的3小时缩短到30分钟，调性问题彻底解决了。

特别是在小红书种草笔记创作上，文派能够：
- 自动调整为种草语气
- 生成合适的话题标签
- 保持品牌调性一致
- 优化内容结构

这个工具真正解决了我多平台运营效率低的痛点。`,
    expectedDimensions: {
      coreObjects: ['文派内容适配器', '多平台内容创作工具'],
      useScenarios: ['公众号发文', '小红书种草笔记', '知乎专业表达'],
      userPainPoints: ['调性不一致', '手动改写太累', '运营效率低']
    }
  },
  {
    id: 'case2',
    name: '容易产生模板化的内容',
    content: `这个AI工具真的很好用，帮我提升了效率。朋友推荐给我的，现在我每天都在用。

功能很强大，界面也很简洁。用了之后工作轻松了很多，强烈推荐给大家。

真的是神器级别的工具，必须安利！`,
    expectedDimensions: {
      coreObjects: ['AI工具'],
      useScenarios: ['工作'],
      userPainPoints: ['效率问题']
    }
  },
  {
    id: 'case3',
    name: '职场具体场景',
    content: `在职场内容营销中，我经常需要为不同渠道制作内容。

痛点很明显：
1. 微信群分享需要简洁有力
2. 朋友圈发布要有个人色彩  
3. 工作汇报要专业严谨
4. 客户沟通要亲和友好

以前我要准备4个版本，每个版本都要重新构思和写作，耗时又费力。现在用内容风格调节器，输入一份基础内容，就能自动生成适合不同场景的版本。

最重要的是，它保持了核心信息的一致性，只是调整了表达方式，让我的职场沟通效率提升了200%。`,
    expectedDimensions: {
      coreObjects: ['内容风格调节器'],
      useScenarios: ['职场内容营销', '微信群分享', '朋友圈发布', '工作汇报', '客户沟通'],
      userPainPoints: ['耗时费力', '需要多个版本', '沟通效率低']
    }
  }
];

const prohibitedPatterns = [
  '写文案神器',
  'AI太好用了，救命',
  '朋友推荐了我这个工具',
  '现在我省了3小时',
  '这个工具拯救了我',
  '效率神器推荐',
  '必须安利给大家'
];

export default function TitleAntiTemplateTestPage() {
  const [selectedCase, setSelectedCase] = useState(testCases[0]);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleCaseSelect = (testCase: typeof testCases[0]) => {
    setSelectedCase(testCase);
    setGeneratedTitles([]);
    setTestResults([]);
  };

  const handleTitleChange = (title: string) => {
    if (!generatedTitles.includes(title)) {
      setGeneratedTitles(prev => [...prev, title]);
      
      // 立即进行反模板化检测
      const templateCheck = detectTemplatePatterns(title);
      const dimensionCheck = checkDimensionCoverage(
        title,
        selectedCase.expectedDimensions.coreObjects,
        selectedCase.expectedDimensions.useScenarios,
        selectedCase.expectedDimensions.userPainPoints
      );

      const result = {
        title,
        templateCheck,
        dimensionCheck,
        timestamp: Date.now()
      };

      setTestResults(prev => [...prev, result]);
    }
  };

  const getQualityScore = (result: any) => {
    let score = 100;
    
    // 模板化扣分
    if (result.templateCheck.isTemplatePattern) {
      score -= result.templateCheck.detectedPatterns.length * 20;
    }
    
    // 维度覆盖加分
    score += result.dimensionCheck.coveredDimensions.length * 10;
    
    return Math.max(0, Math.min(100, score));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚫 反模板化测试
            <Badge variant="outline">避免偏离主旨</Badge>
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
                    selectedCase.id === testCase.id ? 'ring-2 ring-blue-500 bg-accent' : 'hover:bg-accent'
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
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        核心对象: {testCase.expectedDimensions.coreObjects.length}个
                      </div>
                      <div className="text-xs text-muted-foreground">
                        使用场景: {testCase.expectedDimensions.useScenarios.length}个
                      </div>
                      <div className="text-xs text-muted-foreground">
                        用户痛点: {testCase.expectedDimensions.userPainPoints.length}个
                      </div>
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
                <h3 className="text-lg font-semibold mb-2">期望维度</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">核心对象:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCase.expectedDimensions.coreObjects.map(obj => (
                        <Badge key={obj} variant="outline" className="text-xs">
                          {obj}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">使用场景:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCase.expectedDimensions.useScenarios.map(scenario => (
                        <Badge key={scenario} variant="secondary" className="text-xs">
                          {scenario}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">用户痛点:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCase.expectedDimensions.userPainPoints.map(pain => (
                        <Badge key={pain} variant="destructive" className="text-xs">
                          {pain}
                        </Badge>
                      ))}
                    </div>
                  </div>
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

            {/* 右侧：检测结果 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">反模板化检测结果</h3>
              
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  点击生成标题开始检测
                </div>
              ) : (
                <div className="space-y-4">
                  {testResults.map((result, index) => {
                    const qualityScore = getQualityScore(result);
                    return (
                      <Card key={index} className={`${qualityScore >= 80 ? 'border-border bg-accent' : qualityScore >= 60 ? 'border-border bg-accent' : 'border-border bg-accent'}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center justify-between">
                            标题 {index + 1}
                            <Badge variant={qualityScore >= 80 ? 'default' : qualityScore >= 60 ? 'secondary' : 'destructive'}>
                              {qualityScore}分
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium mb-3">{result.title}</p>
                          
                          {/* 模板化检测 */}
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">🚫 模板化检测:</p>
                            {result.templateCheck.isTemplatePattern ? (
                              <div>
                                <Badge variant="destructive" className="text-xs mb-1">
                                  检测到{result.templateCheck.detectedPatterns.length}个模板化句型
                                </Badge>
                                <div className="text-xs text-destructive">
                                  {result.templateCheck.detectedPatterns.join('、')}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary" className="text-xs bg-accent text-green-700">
                                ✅ 无模板化行为
                              </Badge>
                            )}
                          </div>

                          {/* 维度覆盖检测 */}
                          <div>
                            <p className="text-sm font-medium mb-1">✅ 维度覆盖:</p>
                            <div className="flex flex-wrap gap-1 mb-1">
                              {result.dimensionCheck.coveredDimensions.map((dim: string) => (
                                <Badge key={dim} variant="secondary" className="text-xs bg-accent text-primary">
                                  {dim}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              覆盖率: {result.dimensionCheck.coverageScore * 100}% 
                              {result.dimensionCheck.isQualified ? ' ✅' : ' ❌ (需≥2个维度)'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 禁止模板说明 */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🚫 严禁模板化句型</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {prohibitedPatterns.map(pattern => (
                <Badge key={pattern} variant="destructive" className="text-xs">
                  {pattern}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-destructive mt-2">
              超过2处使用以上句型将被视为"偏离主旨模板化行为"并重新生成
            </p>
          </div>

          {/* 维度要求说明 */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">✅ 维度覆盖要求</h4>
            <p className="text-sm text-primary mb-2">
              生成的标题必须覆盖以下维度中的<strong>至少2个</strong>：
            </p>
            <ul className="text-sm text-primary space-y-1">
              <li>• <strong>核心对象</strong>：具体产品名（如"内容适配器"、"平台风格调整工具"）</li>
              <li>• <strong>使用场景</strong>：具体应用场景（如"公众号发文"、"小红书写文案"）</li>
              <li>• <strong>用户痛点</strong>：具体问题（如"调性不一致"、"改写太累"、"运营效率低"）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
