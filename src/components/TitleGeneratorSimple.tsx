import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, RefreshCw, Copy } from "lucide-react";

// 平台标题长度限制
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

  // 从版本A和B中提取关键词 - 改进版本
  const extractKeywords = (): string[] => {
    let sourceText = '';

    if (versions && versions.length > 0) {
      sourceText = versions.map(v => v.content).join(' ');
      console.log('🔍 从版本A/B提取关键词:', { 版本数量: versions.length });
    } else {
      sourceText = content || '';
      console.log('🔍 从原始内容提取关键词');
    }

    if (!sourceText.trim()) return [];

    // 清理文本
    const cleanText = sourceText
      .replace(/【配图建议】[\s\S]*?(?=\n\n|\n$|$)/g, '')
      .replace(/#[^#\s]+#/g, '')
      .trim();

    console.log('📝 清理后的文本:', cleanText.substring(0, 200) + '...');

    const keywords: string[] = [];

    // 1. 提取具体的产品/工具名称（优先级最高）
    const productPatterns = [
      /([A-Za-z][A-Za-z0-9]*(?:[A-Za-z][A-Za-z0-9]*)*)/g, // 英文产品名
      /([A-Za-z]+[工具软件平台应用])/g, // 英文+中文组合
      /([^\s]{2,8}[工具软件平台应用])/g, // 具体工具名
    ];

    productPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern) || [];
      matches.forEach(match => {
        if (match.length >= 3 && match.length <= 10) {
          keywords.push(match);
        }
      });
    });

    // 2. 提取数字+名词组合
    const numberMatches = cleanText.match(/\d+[个种款项次倍][^\s]{2,8}/g) || [];
    numberMatches.forEach(match => {
      keywords.push(match);
    });

    // 3. 提取主题词汇
    const topicPatterns = [
      /([^\s]{2,6}[方法技巧秘诀攻略指南教程])/g,
      /([^\s]{2,6}[测评评测体验分享推荐])/g,
      /([^\s]{2,6}[问题解决方案思路])/g,
    ];

    topicPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern) || [];
      matches.forEach(match => {
        if (match.length >= 3 && match.length <= 8) {
          keywords.push(match);
        }
      });
    });

    // 4. 提取高频有意义词汇（2-5字）
    const words = cleanText.match(/[\u4e00-\u9fa5a-zA-Z0-9]{2,5}/g) || [];
    const wordCount: Record<string, number> = {};

    // 过滤掉通用词汇
    const stopWords = ['工具', '软件', '应用', '平台', '方法', '技巧', '这个', '一个', '可以', '非常', '真的', '很好', '不错'];

    words.forEach(word => {
      if (!stopWords.includes(word) && word.length >= 2 && word.length <= 5) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    const frequentWords = Object.entries(wordCount)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    keywords.push(...frequentWords);

    // 去重并优先选择更具体的关键词
    const uniqueKeywords = [...new Set(keywords)]
      .filter(keyword => keyword.length >= 2)
      .sort((a, b) => {
        // 优先选择包含英文或数字的关键词（更具体）
        const aHasSpecific = /[A-Za-z0-9]/.test(a);
        const bHasSpecific = /[A-Za-z0-9]/.test(b);
        if (aHasSpecific && !bHasSpecific) return -1;
        if (!aHasSpecific && bHasSpecific) return 1;
        return b.length - a.length; // 长度优先
      })
      .slice(0, 5);

    console.log('✅ 关键词提取完成:', uniqueKeywords);
    return uniqueKeywords;
  };

  // 生成标题 - 改进版本
  const generateTitle = (keywords: string[], style: string): string => {
    // 如果没有关键词，使用默认标题
    if (keywords.length === 0) {
      const defaultTitles = {
        engaging: ['发现好内容！值得分享', '推荐给大家！真的不错', '分享一个好东西！'],
        informative: ['实用指南｜干货分享', '详细教程｜建议收藏', '完整攻略｜新手必看'],
        emotional: ['真实感受｜想和你分享', '我的经历｜真心话', '内心独白｜值得思考']
      };
      const defaults = defaultTitles[style as keyof typeof defaultTitles] || defaultTitles.engaging;
      return defaults[Math.floor(Math.random() * defaults.length)];
    }

    // 选择最佳关键词
    const primaryKeyword = keywords[0];
    const secondaryKeyword = keywords.length > 1 ? keywords[1] : '';

    console.log(`🎯 生成${style}风格标题，主关键词: ${primaryKeyword}, 次关键词: ${secondaryKeyword}`);

    const templates = {
      engaging: [
        `发现${primaryKeyword}！真的很棒`,
        `推荐${primaryKeyword}！必须安利`,
        `分享${primaryKeyword}！超级好用`,
        `${primaryKeyword}合集！值得收藏`,
        `盘点${primaryKeyword}！干货满满`,
        secondaryKeyword ? `${primaryKeyword}+${secondaryKeyword}！绝了` : `${primaryKeyword}！绝了`
      ],
      informative: [
        `${primaryKeyword}详解｜实用指南`,
        `${primaryKeyword}完整教程｜干货分享`,
        `${primaryKeyword}实战指南｜建议收藏`,
        `掌握${primaryKeyword}的正确方法`,
        `${primaryKeyword}全攻略｜新手必看`,
        secondaryKeyword ? `${primaryKeyword}vs${secondaryKeyword}｜对比分析` : `${primaryKeyword}深度解析`
      ],
      emotional: [
        `${primaryKeyword}让我很感动`,
        `${primaryKeyword}的真实感受`,
        `关于${primaryKeyword}的思考`,
        `${primaryKeyword}｜真心话分享`,
        `${primaryKeyword}｜我的经历`,
        secondaryKeyword ? `从${primaryKeyword}到${secondaryKeyword}的感悟` : `${primaryKeyword}改变了我`
      ]
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.engaging;
    const template = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];

    // 智能调整长度
    let finalTitle = template;
    if (template.length > titleLimit) {
      // 如果太长，尝试简化
      if (template.includes('｜')) {
        finalTitle = template.split('｜')[0]; // 只保留主要部分
      } else if (template.includes('！')) {
        finalTitle = template.split('！')[0] + '！'; // 保留感叹号
      } else {
        finalTitle = template.substring(0, titleLimit - 1) + '…';
      }
    }

    console.log(`✅ ${style}风格标题生成:`, {
      原始: template,
      最终: finalTitle,
      长度: finalTitle.length,
      限制: titleLimit
    });

    return finalTitle;
  };

  // 生成标题列表
  const generateTitles = async () => {
    setIsGenerating(true);

    try {
      console.log('🚀 开始生成标题');
      
      const keywords = extractKeywords();
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTitles: GeneratedTitle[] = [
        {
          id: '1',
          title: generateTitle(keywords, 'engaging'),
          length: 0,
          style: 'engaging'
        },
        {
          id: '2',
          title: generateTitle(keywords, 'informative'),
          length: 0,
          style: 'informative'
        },
        {
          id: '3',
          title: generateTitle(keywords, 'emotional'),
          length: 0,
          style: 'emotional'
        }
      ].map(title => ({
        ...title,
        length: title.title.length
      }));

      console.log('✅ 标题生成完成:', newTitles.map(t => t.title));

      setTitles(newTitles);
      if (newTitles.length > 0) {
        setSelectedTitle(newTitles[0].title);
        onTitleChange?.(newTitles[0].title);
      }

      toast({
        title: "标题生成成功",
        description: `基于版本A/B内容生成了${newTitles.length}个标题选项`,
      });
    } catch (error) {
      console.error('标题生成失败:', error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 选择标题
  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  // 复制标题
  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    toast({
      title: "已复制",
      description: "标题已复制到剪贴板",
    });
  };

  // 初始化生成
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
          标题生成
          <Badge variant="outline" className="text-xs">
            {platformName} (限{titleLimit}字)
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 生成按钮 */}
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
            {isGenerating ? '生成中...' : '重新生成'}
          </Button>
        </div>

        {/* 加载状态 */}
        {isGenerating && (
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-gray-600">正在生成标题...</p>
            </div>
          </div>
        )}

        {/* 标题列表 */}
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

        {/* 空状态 */}
        {!isGenerating && titles.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无生成的标题</p>
            <Button size="sm" variant="outline" onClick={generateTitles} className="mt-2">
              开始生成标题
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TitleGenerator;
