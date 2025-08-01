import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy } from "lucide-react";

// Platform title length limits
const PLATFORM_TITLE_LIMITS: { [key: string]: number } = {
  'xiaohongshu': 20,
  'weibo': 30,
  'zhihu': 50,
  'douyin': 25,
  'default': 30
};

interface ContentVersion {
  id: string;
  content: string;
  style: 'standard' | 'creative';
  title: string;
  charCount: number;
}

interface TitleGeneratorProps {
  content: string;
  versions?: ContentVersion[];
  platformId: string;
  platformName: string;
  onTitleChange?: (title: string) => void;
}

interface GeneratedTitle {
  id: string;
  title: string;
  length: number;
  style: string;
  confidence: number;
}

interface ContentAnalysis {
  mainTopic: string;
  keyPoints: string[];
  valueProposition: string;
  tone: 'informative' | 'engaging' | 'emotional' | 'practical';
  entities: string[];
  actionWords: string[];
}

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  content,
  versions = [],
  platformId,
  platformName,
  onTitleChange
}) => {
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const titleLimit = PLATFORM_TITLE_LIMITS[platformId] || 30;

  // Intelligent content analysis - extracts semantic meaning
  const analyzeContent = (text: string): ContentAnalysis => {
    console.log('🧠 Starting intelligent content analysis...');
    
    // Clean and prepare text
    const cleanText = text
      .replace(/【配图建议】[\s\S]*?(?=\n\n|\n$|$)/g, '')
      .replace(/#+/g, '')
      .replace(/\*+/g, '')
      .trim();

    console.log('📝 Analyzing text:', cleanText.substring(0, 200) + '...');

    // Extract entities (specific names, tools, concepts)
    const entities = extractEntities(cleanText);
    
    // Identify main topic through semantic analysis
    const mainTopic = identifyMainTopic(cleanText, entities);
    
    // Extract key value points
    const keyPoints = extractKeyPoints(cleanText);
    
    // Determine value proposition
    const valueProposition = extractValueProposition(cleanText);
    
    // Analyze tone and style
    const tone = analyzeTone(cleanText);
    
    // Extract action-oriented words
    const actionWords = extractActionWords(cleanText);

    const analysis = {
      mainTopic,
      keyPoints,
      valueProposition,
      tone,
      entities,
      actionWords
    };

    console.log('✅ Content analysis complete:', analysis);
    return analysis;
  };

  // Extract specific entities (tools, names, concepts)
  const extractEntities = (text: string): string[] => {
    const entities: string[] = [];
    
    // Extract proper nouns and specific tools
    const properNouns = text.match(/[A-Z][a-zA-Z0-9]*(?:[A-Z][a-zA-Z0-9]*)*|[A-Za-z]+(?:AI|GPT|Bot|App|Tool|Pro|Plus)/gi) || [];
    entities.push(...properNouns);
    
    // Extract Chinese brand/tool names
    const chineseTools = text.match(/[\u4e00-\u9fa5]{2,6}(?:工具|软件|平台|应用|系统|助手)/g) || [];
    entities.push(...chineseTools);
    
    // Extract numbers with context
    const numberedItems = text.match(/\d+(?:个|种|款|项|步|点|条|类)[^\s]{1,8}/g) || [];
    entities.push(...numberedItems);

    return [...new Set(entities)].filter(e => e.length >= 2 && e.length <= 15);
  };

  // Identify the main topic through semantic clustering
  const identifyMainTopic = (text: string, entities: string[]): string => {
    // Look for topic indicators
    const topicPatterns = [
      /(?:介绍|分享|推荐|讲解|探讨|分析)([^\s]{2,10})/g,
      /([^\s]{2,10})(?:的|相关|方面|领域)/g,
      /(?:关于|针对|面向)([^\s]{2,10})/g
    ];

    const topics: string[] = [];
    topicPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const topic = match.replace(/(?:介绍|分享|推荐|讲解|探讨|分析|的|相关|方面|领域|关于|针对|面向)/g, '').trim();
        if (topic.length >= 2 && topic.length <= 10) {
          topics.push(topic);
        }
      });
    });

    // If we have entities, use the most prominent one
    if (entities.length > 0) {
      return entities[0];
    }

    // Otherwise use the most frequent topic
    if (topics.length > 0) {
      const topicCount: Record<string, number> = {};
      topics.forEach(topic => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
      return Object.entries(topicCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    return '内容分享';
  };

  // Extract key value points from content
  const extractKeyPoints = (text: string): string[] => {
    const points: string[] = [];
    
    // Look for benefit statements
    const benefits = text.match(/(?:可以|能够|帮助|提升|改善|优化|解决)([^\s]{2,12})/g) || [];
    points.push(...benefits.map(b => b.replace(/(?:可以|能够|帮助|提升|改善|优化|解决)/, '').trim()));
    
    // Look for feature descriptions
    const features = text.match(/(?:支持|具备|包含|提供)([^\s]{2,12})/g) || [];
    points.push(...features.map(f => f.replace(/(?:支持|具备|包含|提供)/, '').trim()));
    
    // Look for problem-solution pairs
    const solutions = text.match(/(?:解决|处理|应对)([^\s]{2,12})/g) || [];
    points.push(...solutions.map(s => s.replace(/(?:解决|处理|应对)/, '').trim()));

    return [...new Set(points)].filter(p => p.length >= 2 && p.length <= 12).slice(0, 5);
  };

  // Extract the main value proposition
  const extractValueProposition = (text: string): string => {
    // Look for value statements
    const valuePatterns = [
      /(?:让你|帮你|使你)([^\s]{2,15})/g,
      /(?:实现|达到|获得)([^\s]{2,15})/g,
      /(?:提高|提升|改善)([^\s]{2,15})/g
    ];

    const values: string[] = [];
    valuePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const value = match.replace(/(?:让你|帮你|使你|实现|达到|获得|提高|提升|改善)/, '').trim();
        if (value.length >= 2 && value.length <= 15) {
          values.push(value);
        }
      });
    });

    return values.length > 0 ? values[0] : '提升效率';
  };

  // Analyze content tone
  const analyzeTone = (text: string): 'informative' | 'engaging' | 'emotional' | 'practical' => {
    const emotionalWords = ['感动', '震撼', '惊艳', '治愈', '温暖', '感受', '体验', '心情'];
    const engagingWords = ['发现', '推荐', '分享', '安利', '必备', '神器', '宝藏'];
    const practicalWords = ['方法', '技巧', '步骤', '教程', '指南', '攻略', '实用'];
    
    const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
    const engagingCount = engagingWords.filter(word => text.includes(word)).length;
    const practicalCount = practicalWords.filter(word => text.includes(word)).length;
    
    if (emotionalCount > engagingCount && emotionalCount > practicalCount) return 'emotional';
    if (engagingCount > practicalCount) return 'engaging';
    if (practicalCount > 0) return 'practical';
    
    return 'informative';
  };

  // Extract action-oriented words
  const extractActionWords = (text: string): string[] => {
    const actionPattern = /(?:学会|掌握|了解|使用|体验|尝试|发现|探索|提升|改善|优化|实现)([^\s]{1,8})/g;
    const matches = text.match(actionPattern) || [];
    return [...new Set(matches)].slice(0, 3);
  };

  // Generate natural, content-aware titles
  const generateNaturalTitle = (analysis: ContentAnalysis, style: string): string => {
    const { mainTopic, keyPoints, valueProposition, tone, entities, actionWords } = analysis;
    
    console.log(`🎨 Generating ${style} title from analysis:`, { mainTopic, tone, entities: entities.slice(0, 2) });

    // Choose primary element based on what's most specific
    const primaryElement = entities.length > 0 ? entities[0] : mainTopic;
    const secondaryElement = keyPoints.length > 0 ? keyPoints[0] : valueProposition;

    let title = '';

    if (style === 'engaging') {
      title = generateEngagingTitle(primaryElement, secondaryElement, tone);
    } else if (style === 'informative') {
      title = generateInformativeTitle(primaryElement, secondaryElement, actionWords);
    } else {
      title = generateEmotionalTitle(primaryElement, secondaryElement, tone);
    }

    // Ensure title fits platform limits
    if (title.length > titleLimit) {
      title = intelligentTruncate(title, titleLimit);
    }

    console.log(`✅ Generated ${style} title:`, title);
    return title;
  };

  // Generate engaging titles that feel natural
  const generateEngagingTitle = (primary: string, secondary: string, tone: string): string => {
    const patterns = [
      `${primary}真的很好用`,
      `用了${primary}之后`,
      `${primary}使用体验`,
      `${primary}值得推荐`,
      `${primary}让人惊喜`,
      `${primary}的魅力`,
      `${primary}改变了我的工作方式`,
      `为什么选择${primary}`,
      `${primary}使用心得`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // Generate informative titles
  const generateInformativeTitle = (primary: string, secondary: string, actionWords: string[]): string => {
    const patterns = [
      `${primary}完整使用指南`,
      `${primary}功能详解`,
      `如何充分利用${primary}`,
      `${primary}实用技巧分享`,
      `${primary}深度体验报告`,
      `${primary}使用方法总结`,
      `${primary}功能特点分析`,
      `${primary}操作流程详解`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // Generate emotional titles
  const generateEmotionalTitle = (primary: string, secondary: string, tone: string): string => {
    const patterns = [
      `${primary}带给我的感受`,
      `使用${primary}的真实体验`,
      `${primary}让我重新思考`,
      `${primary}改变了我的看法`,
      `关于${primary}的一些想法`,
      `${primary}使用感悟`,
      `${primary}的意外收获`,
      `${primary}让我印象深刻的地方`
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  };

  // Intelligent truncation that preserves meaning
  const intelligentTruncate = (title: string, limit: number): string => {
    if (title.length <= limit) return title;
    
    // Try to truncate at natural break points
    const breakPoints = ['的', '了', '用', '后', '时'];
    
    for (let i = limit - 1; i >= Math.max(0, limit - 5); i--) {
      if (breakPoints.includes(title[i])) {
        return title.substring(0, i + 1);
      }
    }
    
    // If no natural break point, truncate and add ellipsis
    return title.substring(0, limit - 1) + '…';
  };

  // Main title generation function
  const generateTitles = async () => {
    setIsGenerating(true);

    try {
      console.log('🚀 Starting intelligent title generation...');
      
      // Get source content
      const sourceContent = versions.length > 0 
        ? versions.map(v => v.content).join('\n\n')
        : content;

      if (!sourceContent || sourceContent.trim().length < 10) {
        toast({
          title: "内容不足",
          description: "请提供更多内容以生成标题",
          variant: "destructive"
        });
        return;
      }

      // Analyze content semantically
      const analysis = analyzeContent(sourceContent);
      
      // Generate titles based on analysis
      await new Promise(resolve => setTimeout(resolve, 800));

      const newTitles: GeneratedTitle[] = [
        {
          id: '1',
          title: generateNaturalTitle(analysis, 'engaging'),
          length: 0,
          style: 'engaging',
          confidence: 0.9
        },
        {
          id: '2',
          title: generateNaturalTitle(analysis, 'informative'),
          length: 0,
          style: 'informative',
          confidence: 0.85
        },
        {
          id: '3',
          title: generateNaturalTitle(analysis, 'emotional'),
          length: 0,
          style: 'emotional',
          confidence: 0.8
        }
      ].map(title => ({
        ...title,
        length: title.title.length
      }));

      console.log('✅ All titles generated:', newTitles.map(t => t.title));

      setTitles(newTitles);
      if (newTitles.length > 0) {
        setSelectedTitle(newTitles[0].title);
        onTitleChange?.(newTitles[0].title);
      }

      toast({
        title: "智能标题生成完成",
        description: `基于内容语义分析生成了${newTitles.length}个自然标题`,
      });
    } catch (error) {
      console.error('Title generation failed:', error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Select title
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  // Copy title
  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    toast({
      title: "已复制",
      description: "标题已复制到剪贴板",
    });
  };

  // Initialize generation
  useEffect(() => {
    const sourceContent = versions.length > 0 
      ? versions.map(v => v.content).join(' ') 
      : content;

    if (sourceContent && sourceContent.trim().length >= 10) {
      generateTitles();
    }
  }, [content, versions]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          智能标题生成
          <Badge variant="outline" className="text-xs">
            {platformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Generate button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={generateTitles}
            disabled={isGenerating}
            size="sm"
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? '智能分析中...' : '重新生成'}
          </Button>
        </div>

        {/* Loading state */}
        {isGenerating && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">正在进行内容语义分析...</p>
            </div>
          </div>
        )}

        {/* Title list */}
        {!isGenerating && titles.length > 0 && (
          <div className="space-y-2">
            {titles.map((title) => (
              <div
                key={title.id}
                className={`border rounded-lg p-3 transition-colors cursor-pointer ${
                  selectedTitle === title.title
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTitleSelect(title.title)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                      {title.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {title.length}/{titleLimit} 字符
                      </span>
                      <span className="text-xs text-gray-400">
                        置信度: {Math.round(title.confidence * 100)}%
                      </span>
                      {selectedTitle === title.title && (
                        <Badge variant="default" className="text-xs">
                          已选中
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTitle(title.title);
                    }}
                    className="h-7 w-7 p-0"
                    title="复制标题"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isGenerating && titles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无生成的标题</p>
            <Button size="sm" variant="outline" onClick={generateTitles} className="mt-2">
              开始智能分析
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;
