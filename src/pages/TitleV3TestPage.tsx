/**
 * 高吸引力标题结构生成（V3）测试页面
 * 验证V3规范的5种结构风格和吸引力要素
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import TitleGenerator from '../components/TitleGeneratorIntelligent';

const v3Styles = [
  {
    id: 'result-emotion',
    name: '✅ 结果+情绪型',
    description: '强调使用结果 + 情感评价',
    example: '只用1次，内容适配5个平台！太爽了！',
    keywords: ['结果', '情绪', '感叹', '效果']
  },
  {
    id: 'question-hook',
    name: '🤔 提问钩子型',
    description: '用好奇心驱动点击',
    example: '多平台怎么发内容最省事？我找到答案了！',
    keywords: ['提问', '好奇', '答案', '钩子']
  },
  {
    id: 'reason-action',
    name: '🎯 原因+行动型',
    description: '讲述为什么用 + 得到了什么',
    example: '因为用文派，我再也不用重复改写！',
    keywords: ['因为', '原因', '行动', '结果']
  },
  {
    id: 'experience-contrast',
    name: '💡 体验+反差型',
    description: '从"以前"到"现在"的转变',
    example: '以前要发3遍内容，现在1次就全平台搞定！',
    keywords: ['以前', '现在', '对比', '反差']
  },
  {
    id: 'tool-value',
    name: '🛠️ 工具+明确价值型',
    description: '工具名称 + 功能/收益',
    example: '文派：多平台适配神器，1次搞定5个平台文案！',
    keywords: ['工具名', '功能', '价值', '收益']
  }
];

const attractionElements = [
  { type: '💥 冲突词', examples: ['没想到', '居然', '1次搞定', '以前总要…现在只要…'] },
  { type: '🎯 场景/身份词', examples: ['小红书博主', '品牌方', '内容运营', '自媒体人'] },
  { type: '💡 明确收益', examples: ['节省时间', '涨粉3倍', '统一品牌调性', '转化率提升'] }
];

const testCases = [
  {
    id: 'case1',
    name: '多平台内容适配场景',
    content: `文派AI内容适配器是专为多平台内容创作设计的工具。

我是一名小红书博主，同时也在运营公众号和B站。以前每次发内容都要手动改写3遍：小红书需要种草语气，公众号要专业表达，B站要年轻化风格。

用了文派后，只需要输入一份基础内容，就能自动生成适合不同平台的版本。现在我发一篇内容到5个平台，从原来的3小时缩短到30分钟，效率提升了6倍。

特别是品牌调性保持一致这点，文派做得很好。不管在哪个平台，都能保持我的个人风格，粉丝认知度大大提升。`,
    expectedElements: {
      tools: ['文派AI内容适配器'],
      scenarios: ['小红书', '公众号', 'B站', '多平台内容创作'],
      benefits: ['效率提升6倍', '30分钟完成', '品牌调性一致'],
      emotions: ['太爽了', '惊艳', '没想到'],
      contrasts: ['以前3小时，现在30分钟', '手动改写vs自动生成']
    }
  },
  {
    id: 'case2',
    name: '职场内容营销场景',
    content: `作为内容运营，我每天要为不同渠道制作内容。

痛点很明显：微信群分享要简洁，朋友圈要有个人色彩，工作汇报要专业，客户沟通要亲和。以前我要准备4个版本，每个都要重新构思。

现在用内容风格调节器，输入基础内容就能生成适合不同场景的版本。最重要的是保持了核心信息一致性，只调整表达方式。

我的工作效率提升了200%，老板都夸我专业。`,
    expectedElements: {
      tools: ['内容风格调节器'],
      scenarios: ['微信群', '朋友圈', '工作汇报', '客户沟通'],
      benefits: ['效率提升200%', '保持信息一致性'],
      emotions: ['太好用', '惊喜'],
      contrasts: ['以前4个版本，现在一键生成']
    }
  }
];

export default function TitleV3TestPage() {
  const [selectedCase, setSelectedCase] = useState(testCases[0]);
  const [generatedTitles, setGeneratedTitles] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const handleCaseSelect = (testCase: typeof testCases[0]) => {
    setSelectedCase(testCase);
    setGeneratedTitles([]);
    setAnalysisResults([]);
  };

  const handleTitleChange = (title: string) => {
    if (!generatedTitles.some(t => t.title === title)) {
      const newTitle = {
        title,
        timestamp: Date.now(),
        style: detectTitleStyle(title),
        attractionElements: analyzeAttractionElements(title),
        v3Compliance: checkV3Compliance(title)
      };
      
      setGeneratedTitles(prev => [...prev, newTitle]);
      setAnalysisResults(prev => [...prev, newTitle]);
    }
  };

  const detectTitleStyle = (title: string) => {
    if (title.includes('！') && (title.includes('太') || title.includes('爽') || title.includes('惊艳'))) {
      return v3Styles[0]; // 结果+情绪型
    }
    if (title.includes('？') || title.includes('怎么') || title.includes('为什么')) {
      return v3Styles[1]; // 提问钩子型
    }
    if (title.includes('因为') || title.includes('用了') || title.includes('有了')) {
      return v3Styles[2]; // 原因+行动型
    }
    if (title.includes('以前') || title.includes('现在') || title.includes('对比')) {
      return v3Styles[3]; // 体验+反差型
    }
    if (title.includes('：') || title.includes('帮我') || title.includes('功能')) {
      return v3Styles[4]; // 工具+明确价值型
    }
    return v3Styles[0]; // 默认
  };

  const analyzeAttractionElements = (title: string) => {
    const elements: string[] = [];
    
    // 检查冲突词
    const conflictWords = ['没想到', '居然', '1次搞定', '以前', '现在'];
    conflictWords.forEach(word => {
      if (title.includes(word)) elements.push(`💥 ${word}`);
    });
    
    // 检查场景词
    const sceneWords = ['小红书', '公众号', 'B站', '博主', '运营'];
    sceneWords.forEach(word => {
      if (title.includes(word)) elements.push(`🎯 ${word}`);
    });
    
    // 检查收益词
    const benefitWords = ['效率', '时间', '提升', '翻倍', '搞定'];
    benefitWords.forEach(word => {
      if (title.includes(word)) elements.push(`💡 ${word}`);
    });
    
    return elements;
  };

  const checkV3Compliance = (title: string) => {
    const checks = {
      hasEmotion: /[！？]/.test(title) || ['太', '爽', '惊艳', '没想到'].some(word => title.includes(word)),
      hasAction: ['用', '搞定', '解决', '提升', '帮'].some(word => title.includes(word)),
      hasContrast: ['以前', '现在', '对比', '前后'].some(word => title.includes(word)),
      hasSpecific: selectedCase.expectedElements.tools.some(tool => title.includes(tool.split('AI')[0])),
      lengthOk: title.length >= 8 && title.length <= 20
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score, total: 5 };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 高吸引力标题结构生成（V3）测试
            <Badge variant="outline">V3规范</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* V3风格展示 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🧩 V3推荐结构风格</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {v3Styles.map(style => (
                <Card key={style.id} className="border-l-4 border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{style.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">{style.description}</p>
                    <p className="text-xs font-medium bg-accent p-2 rounded">{style.example}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {style.keywords.map(keyword => (
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

          {/* 吸引力要素 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">🎨 推荐表达策略</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {attractionElements.map(element => (
                <Card key={element.type}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{element.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {element.examples.map(example => (
                        <Badge key={example} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 测试用例选择 */}
          <div>
            <h3 className="text-lg font-semibold mb-3">选择测试用例</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      {testCase.content.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：测试内容和生成器 */}
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
                <h3 className="text-lg font-semibold mb-2">V3标题生成器</h3>
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

            {/* 右侧：V3规范分析 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">V3规范分析结果</h3>
              
              {analysisResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  点击生成标题开始V3规范测试
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisResults.map((result, index) => (
                    <Card key={index} className={`${result.v3Compliance.score >= 4 ? 'border-border bg-accent' : result.v3Compliance.score >= 3 ? 'border-border bg-accent' : 'border-border bg-accent'}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center justify-between">
                          标题 {index + 1}
                          <Badge variant={result.v3Compliance.score >= 4 ? 'default' : result.v3Compliance.score >= 3 ? 'secondary' : 'destructive'}>
                            V3得分: {result.v3Compliance.score}/5
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium mb-3">{result.title}</p>
                        
                        {/* 风格识别 */}
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">🧩 识别风格:</p>
                          <Badge variant="secondary" className="text-xs">
                            {result.style.name}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{result.style.description}</p>
                        </div>

                        {/* 吸引力要素 */}
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">🎨 吸引力要素:</p>
                          <div className="flex flex-wrap gap-1">
                            {result.attractionElements.map((element: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {element}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* V3规范检查 */}
                        <div>
                          <p className="text-sm font-medium mb-1">✅ V3规范检查:</p>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <span className={result.v3Compliance.checks.hasEmotion ? 'text-foreground' : 'text-destructive'}>
                              {result.v3Compliance.checks.hasEmotion ? '✅' : '❌'} 情绪要素
                            </span>
                            <span className={result.v3Compliance.checks.hasAction ? 'text-foreground' : 'text-destructive'}>
                              {result.v3Compliance.checks.hasAction ? '✅' : '❌'} 行动要素
                            </span>
                            <span className={result.v3Compliance.checks.hasContrast ? 'text-foreground' : 'text-destructive'}>
                              {result.v3Compliance.checks.hasContrast ? '✅' : '❌'} 反差要素
                            </span>
                            <span className={result.v3Compliance.checks.hasSpecific ? 'text-foreground' : 'text-destructive'}>
                              {result.v3Compliance.checks.hasSpecific ? '✅' : '❌'} 具体对象
                            </span>
                            <span className={result.v3Compliance.checks.lengthOk ? 'text-foreground' : 'text-destructive'}>
                              {result.v3Compliance.checks.lengthOk ? '✅' : '❌'} 长度适中
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* V3规范说明 */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 V3核心目标</h4>
            <ul className="text-sm text-primary space-y-1">
              <li>• <strong>与正文主旨强关联</strong>：不能跑题</li>
              <li>• <strong>表达自然流畅</strong>：语言完整</li>
              <li>• <strong>结构清晰有节奏</strong>：使用清晰的语言结构</li>
              <li>• <strong>包含吸引要素</strong>：情绪/场景/动作/转变等</li>
              <li>• <strong>多种表达结构</strong>：避免格式单一</li>
              <li>• <strong>符合字符限制</strong>：中文全角字数</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
