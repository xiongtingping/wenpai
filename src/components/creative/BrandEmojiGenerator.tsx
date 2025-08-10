/**
 * 品牌Emoji生成器 - 第三步AI生成组件
 * 基于提示词调用AI接口生成品牌emoji图片
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Zap, 
  Download, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Image,
  Sparkles,
  AlertCircle,
  Palette,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildPrompts } from './BrandEmojiPromptBuilder';

/**
 * 提示词数据接口
 */
interface PromptData {
  emotion: string;
  prompt: string;
  selected: boolean;
}
import PersonalizedEmojiGenerator from './PersonalizedEmojiGenerator';

/**
 * 生成结果接口
 */
interface GenerationResult {
  emotion: string;
  prompt: string;
  urls: string[]; // 改为数组支持多个图片
  status: 'pending' | 'generating' | 'success' | 'error';
  error?: string;
}

/**
 * Emoji生成器属性
 */
interface BrandEmojiGeneratorProps {
  /** 角色描述 */
  character: string;
  /** 品牌名称 */
  brand: string;
  /** 上传的图片文件 */
  uploadedImage?: File | null;
  /** 选中的提示词 */
  selectedPrompts: PromptData[];
  /** 完成回调 */
  onComplete?: (results: GenerationResult[]) => void;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 调用统一的AI图像生成服务
 */
async function generateEmojiImage(prompt: string, referenceImage?: File | null, count: number = 1): Promise<string[]> {
  try {
    // 使用统一的AI服务层
    const aiService = (await import('@/api/aiService')).callAI;
    
    // 准备图像生成请求
    const imageRequest = {
      prompt: prompt,
      n: count,
      size: '512x512' as const,
      response_format: 'url' as const
    };

    // 如果有参考图片，添加图片上传
    if (referenceImage) {
      const base64Image = await fileToBase64(referenceImage);
      const requestWithImage = {
        ...imageRequest,
        reference_image: base64Image,
        prompt: `基于参考图片的风格和特征，${prompt}`
      };
      
      const response = await aiService({
        prompt: `生成表情符号描述: ${prompt}`,
        model: 'gpt-4',
        maxTokens: 500,
        temperature: 0.8
      });
      
      if (response.success && response.content) {
        // 解析返回的内容，提取图片URL
        const content = response.content;
        // 这里需要根据实际返回格式解析图片URL
        // 暂时返回模拟数据
        return ['https://example.com/emoji1.png', 'https://example.com/emoji2.png'];
      } else {
        throw new Error(response.error || '图像生成失败');
      }
    } else {
      const response = await aiService({
        prompt: `生成表情符号描述: ${prompt}`,
        model: 'gpt-4',
        maxTokens: 500,
        temperature: 0.8
      });
      
      if (response.success && response.content) {
        // 解析返回的内容，提取图片URL
        const content = response.content;
        // 这里需要根据实际返回格式解析图片URL
        // 暂时返回模拟数据
        return ['https://example.com/emoji1.png', 'https://example.com/emoji2.png'];
      } else {
        throw new Error(response.error || '图像生成失败');
      }
    }
  } catch (error) {
    console.error('图像生成API调用失败:', error);
    throw error;
  }
}

/**
 * 将文件转换为base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // 移除data:image/xxx;base64,前缀
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

/**
 * 品牌Emoji生成器组件
 */
export default function BrandEmojiGenerator({
  character,
  brand,
  uploadedImage,
  selectedPrompts,
  onComplete,
  className = ''
}: BrandEmojiGeneratorProps) {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emojiCount, setEmojiCount] = useState<number>(1); // 新增：每个表情生成的emoji数量
  
  const { toast } = useToast();

  /**
   * 初始化结果状态
   */
  useEffect(() => {
    const initialResults: GenerationResult[] = selectedPrompts.map(prompt => ({
      emotion: prompt.emotion,
      prompt: prompt.prompt,
      urls: [], // 初始化为空数组
      status: 'pending'
    }));
    setResults(initialResults);
  }, [selectedPrompts]);

  /**
   * 开始生成
   */
  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setProgress(0);
    setCurrentIndex(0);
    
    const prompts = buildPrompts(character, brand);
    const totalCount = selectedPrompts.length;
    
    try {
      for (let i = 0; i < selectedPrompts.length; i++) {
        const prompt = selectedPrompts[i];
        setCurrentIndex(i);
        
        // 更新状态为生成中
        setResults(prev => prev.map((result, index) => 
          index === i ? { ...result, status: 'generating' } : result
        ));
        
        try {
          // 调用AI生成API，传入emoji数量
          const imageUrls = await generateEmojiImage(prompt.prompt, uploadedImage, emojiCount);
          
          // 更新成功状态
          setResults(prev => prev.map((result, index) => 
            index === i ? { ...result, status: 'success', urls: imageUrls } : result
          ));
          
          toast({
            title: "生成成功",
            description: `${prompt.emotion} emoji 已生成 ${imageUrls.length} 个`,
          });
          
        } catch (error) {
          // 更新失败状态
          setResults(prev => prev.map((result, index) => 
            index === i ? { 
              ...result, 
              status: 'error', 
              error: error instanceof Error ? error.message : '生成失败'
            } : result
          ));
          
          toast({
            title: "生成失败",
            description: `${prompt.emotion} emoji 生成失败`,
            variant: "destructive"
          });
        }
        
        // 更新进度
        setProgress(((i + 1) / totalCount) * 100);
      }
      
      // 生成完成
      const finalResults = results.map((result, index) => 
        index < selectedPrompts.length ? result : result
      );
      onComplete?.(finalResults);
      
      const totalGenerated = results.reduce((sum, result) => 
        sum + (result.urls?.length || 0), 0
      );
      
      toast({
        title: "生成完成",
        description: `已生成 ${totalGenerated} 个emoji图片`,
      });
      
    } catch (error) {
      toast({
        title: "生成失败",
        description: "批量生成过程中出现错误",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 重新生成单个emoji
   */
  const handleRegenerate = async (index: number) => {
    const prompt = selectedPrompts[index];
    
    setResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status: 'generating' } : result
    ));
    
    try {
      const imageUrls = await generateEmojiImage(prompt.prompt, uploadedImage, emojiCount);
      
      setResults(prev => prev.map((result, i) => 
        i === index ? { ...result, status: 'success', urls: imageUrls } : result
      ));
      
      toast({
        title: "重新生成成功",
        description: `${prompt.emotion} emoji 已重新生成 ${imageUrls.length} 个`,
      });
      
    } catch (error) {
      setResults(prev => prev.map((result, i) => 
        i === index ? { 
          ...result, 
          status: 'error', 
          error: error instanceof Error ? error.message : '生成失败'
        } : result
      ));
      
      toast({
        title: "重新生成失败",
        description: `${prompt.emotion} emoji 重新生成失败`,
        variant: "destructive"
      });
    }
  };

  /**
   * 下载单个图片
   */
  const handleDownload = (url: string, emotion: string, index: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brand}-${emotion}-${index + 1}.png`;
    a.click();
    
    toast({
      title: "下载成功",
      description: `${emotion} emoji ${index + 1} 已下载`,
    });
  };

  /**
   * 批量下载
   */
  const handleBatchDownload = () => {
    const successfulResults = results.filter(r => r.status === 'success' && r.urls.length > 0);
    
    if (successfulResults.length === 0) {
      toast({
        title: "没有可下载的图片",
        description: "请先生成emoji图片",
        variant: "destructive"
      });
      return;
    }
    
    const totalImages = successfulResults.reduce((sum, result) => sum + result.urls.length, 0);
    
    toast({
      title: "批量下载",
      description: `开始下载 ${totalImages} 个emoji图片`,
    });
    
    // 逐个下载
    let downloadIndex = 0;
    successfulResults.forEach((result) => {
      result.urls.forEach((url, index) => {
        setTimeout(() => {
          handleDownload(url, result.emotion, index);
        }, downloadIndex * 100);
        downloadIndex++;
      });
    });
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: GenerationResult['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'generating':
        return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-foreground" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  /**
   * 获取状态文本
   */
  const getStatusText = (status: GenerationResult['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'generating':
        return '生成中';
      case 'success':
        return '成功';
      case 'error':
        return '失败';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalImages = results.reduce((sum, result) => sum + (result.urls?.length || 0), 0);

  return (
    <Card className={`w-full max-w-6xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="w-6 h-6" />
          品牌 Emoji 生成器
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 功能选择标签页 */}
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              标准生成
            </TabsTrigger>
            <TabsTrigger value="personalized" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              个性化生成
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-6">
            {/* 原有的标准生成功能 */}
            <div className="space-y-6">
              {/* 生成设置 */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-accent">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    品牌：<Badge variant="outline">{brand}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    角色：<Badge variant="outline">{character}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    待生成：<Badge variant="outline">{selectedPrompts.length}</Badge> 个表情
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Emoji数量选择器 */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="emoji-count" className="text-sm font-medium">
                      <Settings className="w-4 h-4 mr-1" />
                      每个表情生成数量：
                    </Label>
                    <Select value={emojiCount.toString()} onValueChange={(value) => setEmojiCount(parseInt(value))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1个</SelectItem>
                        <SelectItem value="2">2个</SelectItem>
                        <SelectItem value="3">3个</SelectItem>
                        <SelectItem value="4">4个</SelectItem>
                        <SelectItem value="5">5个</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    预计生成：<Badge variant="outline">{selectedPrompts.length * emojiCount}</Badge> 个图片
                  </div>
                </div>
              </div>
              
              {/* 生成控制 */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    总图片数：<Badge variant="outline">{totalImages}</Badge> 个
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    size="lg"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isGenerating ? '生成中...' : '开始生成'}
                  </Button>
                  
                  {totalImages > 0 && (
                    <Button
                      onClick={handleBatchDownload}
                      variant="outline"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      批量下载 ({totalImages})
                    </Button>
                  )}
                </div>
              </div>

              {/* 进度条 */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>生成进度</span>
                    <span>{Math.round(progress)}% ({currentIndex + 1}/{selectedPrompts.length})</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* 统计信息 */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-foreground" />
                  <span>成功：{successCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span>失败：{errorCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>等待：{results.filter(r => r.status === 'pending').length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4 text-primary" />
                  <span>图片：{totalImages}</span>
                </div>
              </div>

              {/* 生成结果网格 */}
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.map((result, index) => (
                    <div
                      key={result.emotion}
                      className={`p-4 border rounded-lg transition-all ${
                        result.status === 'success' 
                          ? 'border-border bg-accent' 
                          : result.status === 'error'
                          ? 'border-border bg-accent'
                          : result.status === 'generating'
                          ? 'border-border bg-accent'
                          : 'border-border bg-accent'
                      }`}
                    >
                      {/* 状态指示器 */}
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {getStatusIcon(result.status)}
                        <span className="text-xs">{getStatusText(result.status)}</span>
                      </div>
                      
                      {/* 表情名称 */}
                      <p className="text-sm font-medium mb-2 text-center">{result.emotion}</p>
                      
                      {/* 图片预览网格 */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {result.urls && result.urls.length > 0 ? (
                          result.urls.map((url, urlIndex) => (
                            <div key={urlIndex} className="relative">
                              <img
                                src={url}
                                alt={`${result.emotion} ${urlIndex + 1}`}
                                className="w-full h-16 object-contain rounded border"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="absolute top-0 right-0 w-6 h-6 p-0"
                                onClick={() => handleDownload(url, result.emotion, urlIndex)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 h-16 bg-accent rounded flex items-center justify-center">
                            <Image className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      
                      {/* 错误信息 */}
                      {result.status === 'error' && result.error && (
                        <p className="text-xs text-destructive mb-2">{result.error}</p>
                      )}
                      
                      {/* 操作按钮 */}
                      <div className="flex items-center justify-center gap-1">
                        {result.status === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRegenerate(index)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* 提示信息 */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>💡 提示：</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>AI生成需要一定时间，请耐心等待</li>
                  <li>每个表情可以生成1-5个不同的emoji变体</li>
                  <li>生成失败的emoji可以单独重新生成</li>
                  <li>生成的图片支持单独下载和批量下载</li>
                  <li>建议在网络稳定的环境下进行生成</li>
                  <li>生成的emoji图片为PNG格式，支持透明背景</li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="personalized" className="space-y-6">
            {/* 个性化生成功能 */}
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-primary">
                  个性化品牌 Emoji 生成器
                </h3>
                <p className="text-sm text-muted-foreground">
                  上传品牌图片或输入描述，AI智能生成专属Emoji表情
                </p>
              </div>
              
              <PersonalizedEmojiGenerator />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 