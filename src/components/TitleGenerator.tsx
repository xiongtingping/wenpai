import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Copy, 
  Edit, 
  Check, 
  X,
  Sparkles 
} from "lucide-react";

interface TitleGeneratorProps {
  content: string;
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

// 平台标题字符限制
const PLATFORM_TITLE_LIMITS: Record<string, number> = {
  'xiaohongshu': 20,
  'weibo': 30,
  'zhihu': 50,
  'douyin': 25,
  'wechat': 64,
  'bilibili': 80,
  'twitter': 280,
  'video': 30,
  'baijia': 50,
  'kuaishou': 25,
  'wangyi': 40,
  'toutiao': 30
};

export const TitleGenerator: React.FC<TitleGeneratorProps> = ({
  content,
  platformId,
  platformName,
  onTitleChange
}) => {
  const { toast } = useToast();
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const titleLimit = PLATFORM_TITLE_LIMITS[platformId] || 50;

  // 生成标题的模拟函数
  const generateTitles = async () => {
    if (!content || content.trim().length < 10) {
      toast({
        title: "内容太短",
        description: "请提供更多内容以生成标题",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // 模拟AI生成标题
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTitles: GeneratedTitle[] = [
        {
          id: '1',
          title: generateMockTitle(content, platformId, 'engaging'),
          length: 0,
          style: '吸引眼球'
        },
        {
          id: '2', 
          title: generateMockTitle(content, platformId, 'informative'),
          length: 0,
          style: '信息丰富'
        },
        {
          id: '3',
          title: generateMockTitle(content, platformId, 'emotional'),
          length: 0,
          style: '情感共鸣'
        }
      ].map(title => ({
        ...title,
        length: title.title.length
      }));

      setTitles(mockTitles);
      if (mockTitles.length > 0) {
        setSelectedTitle(mockTitles[0].title);
        onTitleChange?.(mockTitles[0].title);
      }

      toast({
        title: "标题生成成功",
        description: `为${platformName}生成了${mockTitles.length}个标题选项`,
      });
    } catch (error) {
      toast({
        title: "生成失败",
        description: "标题生成失败，请重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 模拟标题生成逻辑
  const generateMockTitle = (content: string, platform: string, style: string): string => {
    const contentWords = content.substring(0, 100).split(/[，。！？\s]+/).filter(w => w.length > 1);
    const keywords = contentWords.slice(0, 3);
    
    const templates = {
      'engaging': [
        `🔥 ${keywords[0]}的秘密，你知道吗？`,
        `震惊！${keywords[0]}竟然可以这样`,
        `必看！${keywords[0]}的正确打开方式`,
        `${keywords[0]}：你不知道的那些事`
      ],
      'informative': [
        `${keywords[0]}完全指南：${keywords[1]}到${keywords[2]}`,
        `深度解析：${keywords[0]}的${keywords[1]}方法`,
        `${keywords[0]}实用技巧分享`,
        `关于${keywords[0]}，这些你必须知道`
      ],
      'emotional': [
        `${keywords[0]}让我重新认识了${keywords[1]}`,
        `那些年，我们一起追过的${keywords[0]}`,
        `${keywords[0]}：改变我生活的${keywords[1]}`,
        `感动！${keywords[0]}背后的故事`
      ]
    };

    const styleTemplates = templates[style as keyof typeof templates] || templates.informative;
    const randomTemplate = styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
    
    // 根据平台限制截断
    return randomTemplate.length > titleLimit 
      ? randomTemplate.substring(0, titleLimit - 3) + '...'
      : randomTemplate;
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
    onTitleChange?.(title);
  };

  const handleEditStart = () => {
    setEditingTitle(selectedTitle);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    if (editingTitle.trim()) {
      setSelectedTitle(editingTitle.trim());
      onTitleChange?.(editingTitle.trim());
      setIsEditing(false);
      toast({
        title: "标题已更新",
        description: "自定义标题已保存",
      });
    }
  };

  const handleEditCancel = () => {
    setEditingTitle(selectedTitle);
    setIsEditing(false);
  };

  const copyTitle = async () => {
    if (selectedTitle) {
      try {
        await navigator.clipboard.writeText(selectedTitle);
        toast({
          title: "复制成功",
          description: "标题已复制到剪贴板",
        });
      } catch (error) {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive"
        });
      }
    }
  };

  // 初始生成标题
  useEffect(() => {
    if (content && content.trim().length >= 10) {
      generateTitles();
    }
  }, [content, platformId]);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            智能标题生成
            <Badge variant="outline" className="text-xs">
              {platformName} (限{titleLimit}字)
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateTitles}
            disabled={isGenerating || !content}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? '生成中...' : '重新生成'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 当前选中的标题 */}
        {selectedTitle && (
          <div className="border rounded-lg p-3 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">当前标题</span>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={handleEditStart}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={copyTitle}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="min-h-[60px]"
                  maxLength={titleLimit}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {editingTitle.length}/{titleLimit} 字符
                  </span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      <X className="h-3 w-3" />
                    </Button>
                    <Button size="sm" onClick={handleEditSave}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm">{selectedTitle}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {selectedTitle.length}/{titleLimit} 字符
                  </span>
                  <Badge 
                    variant={selectedTitle.length > titleLimit ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {selectedTitle.length > titleLimit ? '超出限制' : '符合要求'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 标题选项 */}
        {titles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">选择标题风格：</h4>
            <div className="grid gap-2">
              {titles.map((title) => (
                <div
                  key={title.id}
                  className={`border rounded p-2 cursor-pointer transition-colors ${
                    selectedTitle === title.title
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleTitleSelect(title.title)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{title.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {title.style}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {title.length}/{titleLimit} 字符
                    </span>
                    <Badge 
                      variant={title.length > titleLimit ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {title.length > titleLimit ? '超出限制' : '符合要求'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生成状态 */}
        {isGenerating && (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <RefreshCw className="h-4 w-4 animate-spin" />
              正在为{platformName}生成专属标题...
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isGenerating && titles.length === 0 && content && (
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
