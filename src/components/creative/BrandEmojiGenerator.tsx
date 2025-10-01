/**
 * 品牌Emoji生成器 - 第三步AI生成组件
 * 基于提示词调用AI接口生成品牌emoji图片
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
async function generateEmojiImage(prompt: string, referenceImage?: File | null, count: number = 1): Promise<string[]> { try {
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
        throw new Error(response.error || t('components.errors.图像生成失败'));
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
        throw new Error(response.error || t('components.errors.图像生成失败'));
      }
    }
  } catch (error) {
    console.error('graph像生成API调用failed:', error);
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
            title: t('components.labels.生成成功'),
            description: `${prompt.emotion} emoji 已生成 ${imageUrls.length} 个`,
          });
          
        } catch (error) {
          // 更新失败状态
          setResults(prev => prev.map((result, index) => 
            index === i ? { 
              ...result, 
              status: 'error', 
              error: error instanceof Error ? error.message : t('components.errors.生成失败')
            } : result
          ));
          
          toast({
            title: t('components.errors.生成失败'),
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
        title: t('components.labels.生成完成'),
        description: `已生成 ${totalGenerated} 个emoji图片`,
      });
      
    } catch (error) {
      toast({
        title: t('components.errors.生成失败'),
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
        title: t('components.labels.重新生成成功'),
        description: `${prompt.emotion} emoji 已重新生成 ${imageUrls.length} 个`,
      });
      
    } catch (error) {
      setResults(prev => prev.map((result, i) => 
        i === index ? { 
          ...result, 
          status: 'error', 
          error: error instanceof Error ? error.message : t('components.errors.生成失败')
        } : result
      ));
      
      toast({
        title: t('components.labels.重新生成失败'),
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
      title: t('components.labels.下载成功'),
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
        title: t('components.labels.没有可下载的图片'),
        description: "请先生成emoji图片",
        variant: "destructive"
      });
      return;
    }
    
    const totalImages = successfulResults.reduce((sum, result) => sum + result.urls.length, 0);
    
    toast({
      title: t('components.labels.批量下载'),
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
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="text-center space-y-3">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              品牌 Emoji 生成器
            </CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              基于您的品牌特色和角色描述，AI智能生成专属的品牌表情符号
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 px-6 sm:px-8">
        {/* 功能选择标签页 */}
        <div className="bg-muted/30 rounded-xl p-1">
          <Tabs defaultValue="standard" className="w-full">
            <TabsList className="unified-tabs-list grid w-full grid-cols-2">
              <TabsTrigger
                value="standard"
                className="unified-tab-trigger"
              >
                <Zap className="w-4 h-4" />
                <span className="font-medium">标准生成</span>
              </TabsTrigger>
              <TabsTrigger
                value="personalized"
                className="unified-tab-trigger"
              >
                <Palette className="w-4 h-4" />
                <span className="font-medium">个性化生成</span>
              </TabsTrigger>
            </TabsList>
          
          <TabsContent value="standard" className="space-y-8 mt-6">
            {/* 优化的标准生成功能 */}
              {/* 生成设置卡片 */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/80">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    生成配置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 基础信息展示 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">品牌名称</Label>
                      <Badge variant="secondary" className="w-full justify-center py-2 text-sm font-medium">
                        {brand || '未设置'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">角色描述</Label>
                      <Badge variant="secondary" className="w-full justify-center py-2 text-sm font-medium">
                        {character || '未设置'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">待生成表情</Label>
                      <Badge variant="outline" className="w-full justify-center py-2 text-sm font-medium border-primary/30 text-primary">
                        {selectedPrompts.length} 个
                      </Badge>
                    </div>
                  </div>

                  {/* 参考图片状态 */}
                  {uploadedImage && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">已上传参考图片，将基于图片风格生成</span>
                      </div>
                    </div>
                  )}

                  {/* 生成数量配置 */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Settings className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-foreground">每个表情生成数量</Label>
                        <p className="text-xs text-muted-foreground">选择每种表情生成的图片数量</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select value={emojiCount.toString()} onValueChange={(value) => setEmojiCount(parseInt(value))}>
                        <SelectTrigger className="w-24 h-10">
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
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">
                          预计生成 {selectedPrompts.length * emojiCount} 个图片
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedPrompts.length} 种表情 × {emojiCount} 个/种
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* 生成控制区域 */}
              <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-foreground">
                        准备生成 {selectedPrompts.length} 种表情
                      </div>
                      <div className="text-xs text-muted-foreground">
                        总计 {selectedPrompts.length * emojiCount} 个图片文件
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={handleGenerate}
                        disabled={isGenerating || selectedPrompts.length === 0}
                        size="lg"
                        className="px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        {isGenerating ? '生成中...' : t('components.text.开始生成_2li')}
                      </Button>

                      {totalImages > 0 && (
                        <Button
                          onClick={handleBatchDownload}
                          variant="outline"
                          size="lg"
                          className="px-6 py-3 font-semibold border-2 hover:bg-primary/5 transition-all duration-200"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          批量下载 ({totalImages})
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 进度条 */}
                  {isGenerating && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">生成进度</span>
                        <span className="text-muted-foreground">
                          {Math.round(progress)}% ({currentIndex + 1}/{selectedPrompts.length})
                        </span>
                      </div>
                      <Progress value={progress} className="w-full h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        正在生成第 {currentIndex + 1} 个表情...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 统计信息卡片 */}
              {results.length > 0 && (
                <Card className="border-0 shadow-sm bg-muted/20">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{successCount}</div>
                          <div className="text-xs text-muted-foreground">成功</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
                          <XCircle className="w-4 h-4 text-destructive dark:text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{errorCount}</div>
                          <div className="text-xs text-muted-foreground">失败</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{results.filter(r => r.status === 'pending').length}</div>
                          <div className="text-xs text-muted-foreground">等待</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <Image className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{totalImages}</div>
                          <div className="text-xs text-muted-foreground">图片</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 生成结果网格 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">生成结果</h3>
                  {results.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {results.length} 种表情
                    </Badge>
                  )}
                </div>
                <ScrollArea className="brand-emoji-scroll rounded-xl border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
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
              </div>

              {/* 使用提示卡片 */}
              <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-primary dark:text-blue-400" />
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">使用提示</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>AI生成需要一定时间，请耐心等待</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>每个表情可以生成1-5个不同的变体</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>生成失败的emoji可以单独重新生成</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>支持单独下载和批量下载功能</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>建议在网络稳定的环境下进行生成</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                          <span>生成PNG格式图片，支持透明背景</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="personalized" className="space-y-8 mt-6">
            {/* 个性化生成功能 */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5">
                  <Palette className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    个性化品牌 Emoji 生成器
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    上传品牌图片或输入详细描述，AI将基于您的品牌特色智能生成专属的Emoji表情符号
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <PersonalizedEmojiGenerator />
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
