/**
 * 图像生成测试页面
 * 用于测试AI图像生成功能
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { 
  generateImage, 
  checkImageGenerationStatus, 
  downloadImage, 
  IMAGE_SIZES,
  validatePrompt,
  type ImageGenerationResponse 
} from '@/api/imageGenerationService';

export default function ImageGenerationTestPage() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'512x512'>('512x512');
  const [count, setCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [apiStatus, setApiStatus] = useState<boolean | null>(null);
  const [results, setResults] = useState<ImageGenerationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * 检查API状态
   */
  const checkStatus = async () => {
    setIsCheckingStatus(true);
    setError(null);
    
    try {
      const status = await checkImageGenerationStatus();
      setApiStatus(status);
    } catch (err) {
      setError('API状态检查失败');
      console.error('状态检查错误:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /**
   * 生成图像
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      setError(validation.error || '提示词验证失败');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResults([]);

    try {
      const result = await generateImage({
        prompt: prompt.trim(),
        size,
        n: count
      });

      setResults([result]);
      
      if (!result.success) {
        setError(result.error || '图像生成失败');
      }
    } catch (err) {
      setError('图像生成过程中发生错误');
      console.error('生成错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 下载图像
   */
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const filename = `generated-image-${index + 1}-${Date.now()}.png`;
      await downloadImage(imageUrl, filename);
    } catch (err) {
      setError('图像下载失败');
      console.error('下载错误:', err);
    }
  };

  /**
   * 清空结果
   */
  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  // 页面加载时检查API状态
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI图像生成测试</h1>
        <p className="text-muted-foreground">
          测试OpenAI DALL-E图像生成功能
        </p>
      </div>

      {/* API状态检查 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            API状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {apiStatus === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : apiStatus ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {apiStatus === null ? '检查中...' : 
                 apiStatus ? 'API可用' : 'API不可用'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkStatus}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              刷新状态
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 生成表单 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>图像生成</CardTitle>
          <CardDescription>
            输入提示词和参数来生成AI图像
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">提示词</label>
            <Textarea
              placeholder="描述您想要生成的图像，例如：一只可爱的小猫坐在花园里"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {prompt.length}/1000 字符
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">图像尺寸</label>
              <Select value={size} onValueChange={(value: any) => setSize(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IMAGE_SIZES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">生成数量</label>
              <Select value={count.toString()} onValueChange={(value) => setCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} 张
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !apiStatus}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  生成中...
                </>
              ) : (
                '生成图像'
              )}
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={clearResults}>
                清空结果
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 生成结果 */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成结果</CardTitle>
            <CardDescription>
              共生成 {results.length} 个结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, resultIndex) => (
                <div key={resultIndex} className="space-y-3">
                  {result.success ? (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          成功
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(result.timestamp || '').toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {result.data?.images.map((image, imageIndex) => (
                          <div key={imageIndex} className="space-y-2">
                            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                              <img
                                src={image.url}
                                alt={`生成的图像 ${imageIndex + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(image.url, imageIndex)}
                                className="flex-1"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                下载
                              </Button>
                            </div>
                            
                            {image.revised_prompt && (
                              <div className="text-xs text-muted-foreground">
                                <strong>优化提示词:</strong> {image.revised_prompt}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        {result.error || '生成失败'}
                        {result.message && (
                          <div className="text-xs mt-1">{result.message}</div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 