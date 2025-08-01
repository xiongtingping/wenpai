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

  // 从版本A和B中提取关键词
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
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const keywords: string[] = [];

    // 提取常见词汇
    const commonWords = ['工具', '软件', '应用', '方法', '技巧', '攻略', '教程', '指南'];
    commonWords.forEach(word => {
      if (cleanText.includes(word)) {
        keywords.push(word);
      }
    });

    // 提取情感词
    const emotionWords = ['好用', '棒', '推荐', '必备', '实用', '赞', '爱了'];
    emotionWords.forEach(word => {
      if (cleanText.includes(word)) {
        keywords.push(word);
      }
    });

    // 提取2-4字高频词
    const words = cleanText.split(' ').filter(w => w.length >= 2 && w.length <= 4);
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const frequentWords = Object.entries(wordCount)
      .filter(([word, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([word]) => word);

    keywords.push(...frequentWords);

    const result = [...new Set(keywords)].slice(0, 5);
    console.log('✅ 关键词提取完成:', result);
    return result;
  };

  // 生成标题
  const generateTitle = (keywords: string[], style: string): string => {
    const keyword = keywords.length > 0 ? keywords[0] : '内容';

    const templates = {
      engaging: [
        `发现${keyword}！真的很棒`,
        `推荐${keyword}！必须安利`,
        `分享${keyword}！超级好用`
      ],
      informative: [
        `${keyword}详解｜实用指南`,
        `${keyword}完整教程｜干货分享`,
        `${keyword}实战指南｜建议收藏`
      ],
      emotional: [
        `${keyword}的真实感受`,
        `关于${keyword}的思考`,
        `${keyword}｜真心话分享`
      ]
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.engaging;
    const template = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];

    // 调整长度
    if (template.length <= titleLimit) {
      return template;
    }

    return template.substring(0, titleLimit - 1) + '…';
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
