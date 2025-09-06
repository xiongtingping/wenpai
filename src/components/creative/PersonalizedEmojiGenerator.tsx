/**
 * 个性化品牌Emoji生成器主控制器
 * 整合上传、构建、生成、展示等所有功能
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import UploadForm from './UploadForm';
import PromptBuilder from './PromptBuilder';
import EmojiGenerator from './EmojiGenerator';
import EmojiGallery from './EmojiGallery';

interface EmojiImage {
  id: string;
  url: string;
  prompt: string;
  emotion?: string;
  createdAt: string;
  size: string;
  tags: string[];
}

type Step = 'upload' | 'build' | 'generate' | 'gallery';

export default function PersonalizedEmojiGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedData, setUploadedData] = useState<{ image?: File; description?: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [batchPrompts, setBatchPrompts] = useState<Array<{ emotion: string; prompt: string }>>([]);
  const [generatedImages, setGeneratedImages] = useState<EmojiImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [character, setCharacter] = useState('');
  const [brand, setBrand] = useState('');

  // 步骤配置
  const steps = [
    { id: 'upload', title: '品牌信息', description: '输入品牌角色和品牌名称' },
    { id: 'build', title: '构建提示词', description: '生成个性化生成提示词' },
    { id: 'generate', title: '生成Emoji', description: 'AI生成个性化Emoji' },
    { id: 'gallery', title: '作品展示', description: '查看和管理生成的Emoji' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  /**
   * 处理上传完成
   */
  const handleUploadComplete = (data: { image?: File; description?: string }) => {
    setUploadedData(data);
    // 从描述中提取角色信息
    if (data.description) {
      setCharacter(data.description);
    }
    setCurrentStep('build');
  };

  /**
   * 处理单个提示词准备完成
   */
  const handlePromptReady = (finalPrompt: string) => {
    setPrompt(finalPrompt);
    setGenerationMode('single');
    setCurrentStep('generate');
  };

  /**
   * 处理批量提示词准备完成
   */
  const handleBatchPromptsReady = (prompts: Array<{ emotion: string; prompt: string }>) => {
    setBatchPrompts(prompts);
    setGenerationMode('batch');
    setCurrentStep('generate');
  };

  /**
   * 处理品牌名称改变
   */
  const handleBrandChange = (brandName: string) => {
    setBrand(brandName);
  };

  /**
   * 处理生成完成
   */
  const handleGenerationComplete = (images: string[]) => {
    // 转换为标准格式
    const emojiImages: EmojiImage[] = images.map((url, index) => {
      if (generationMode === 'single') {
        return {
          id: `emoji_${Date.now()}_${index}`,
          url,
          prompt,
          createdAt: new Date().toISOString(),
          size: '1024x1024',
          tags: extractTags(prompt),
        };
      } else {
        const batchPrompt = batchPrompts[index];
        return {
          id: `emoji_${Date.now()}_${index}`,
          url,
          prompt: batchPrompt.prompt,
          emotion: batchPrompt.emotion,
          createdAt: new Date().toISOString(),
          size: '1024x1024',
          tags: extractTags(batchPrompt.prompt),
        };
      }
    });
    
    setGeneratedImages(prev => [...prev, ...emojiImages]);
    setCurrentStep('gallery');
  };

  /**
   * 处理图片下载
   */
  const handleDownload = (image: EmojiImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    const fileName = image.emotion 
      ? `brand-emoji-${image.emotion}-${image.id}.png`
      : `brand-emoji-${image.id}.png`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * 处理图片删除
   */
  const handleDelete = (imageId: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== imageId));
  };

  /**
   * 处理重新生成
   */
  const handleRegenerate = () => {
    setCurrentStep('generate');
  };

  /**
   * 处理返回上一步
   */
  const handleBack = () => {
    switch (currentStep) {
      case 'build':
        setCurrentStep('upload');
        break;
      case 'generate':
        setCurrentStep('build');
        break;
      case 'gallery':
        setCurrentStep('generate');
        break;
    }
  };

  /**
   * 处理重新开始
   */
  const handleRestart = () => {
    setCurrentStep('upload');
    setUploadedData(null);
    setPrompt('');
    setBatchPrompts([]);
    setGeneratedImages([]);
    setGenerationMode('single');
    setCharacter('');
    setBrand('');
  };

  /**
   * 从提示词中提取标签
   */
  const extractTags = (prompt: string): string[] => {
    const tags: string[] = [];
    
    const styleKeywords = ['可爱', '现代', '复古', '卡通', '极简', '3D', '立体'];
    const complexityKeywords = ['简单', '适中', '复杂', '非常复杂', '极度复杂'];
    const otherKeywords = ['Emoji', '表情', '品牌', '个性化'];

    [...styleKeywords, ...complexityKeywords, ...otherKeywords].forEach(keyword => {
      if (prompt.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags;
  };

  /**
   * 渲染当前步骤的组件
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <UploadForm
            onUploadComplete={handleUploadComplete}
            onReset={handleRestart}
          />
        );
      case 'build':
        return (
          <PromptBuilder
            uploadedData={uploadedData}
            onPromptReady={handlePromptReady}
            onBatchPromptsReady={handleBatchPromptsReady}
            onBack={handleBack}
            onBrandChange={handleBrandChange}
          />
        );
      case 'generate':
        return (
          <EmojiGenerator
            character={character || '卡通形象'}
            brand={brand || '品牌'}
            uploadedImage={uploadedData?.image}
          />
        );
      case 'gallery':
        return (
          <EmojiGallery
            emojis={generatedImages.map(img => ({
              emotion: img.emotion || '未知',
              url: img.url
            }))}
            onDelete={(emotion) => {
              const imageToDelete = generatedImages.find(img => img.emotion === emotion);
              if (imageToDelete) {
                handleDelete(imageToDelete.id);
              }
            }}
            onRegenerate={(emotion) => {
              // 重新生成特定情绪的Emoji
              setCurrentStep('generate');
              // 这里可以添加重新生成特定情绪的逻辑
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* 步骤指示器 - 优化布局 */}
        <Card className="border border-border/50 shadow-sm bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center justify-between flex-1">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`
                        w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                        ${index <= currentStepIndex
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-muted-foreground/30'
                        }
                      `}>
                        {index < currentStepIndex ? (
                          <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                        ) : (
                          <span className="text-sm lg:text-base">{index + 1}</span>
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <div className={`text-xs lg:text-sm font-medium ${
                          index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground max-w-20 lg:max-w-24 leading-tight hidden lg:block">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`
                        flex-1 h-0.5 mx-3 lg:mx-4 rounded-full transition-all duration-300
                        ${index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/20'}
                      `} />
                    )}
                  </div>
                ))}
              </div>
              
              {/* 进度信息 */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:min-w-[200px]">
                <div className="flex justify-between lg:justify-end items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {Math.round((currentStepIndex / (steps.length - 1)) * 100)}% 完成
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {currentStepIndex + 1}/{steps.length}
                  </Badge>
                </div>
                <Progress
                  value={(currentStepIndex / (steps.length - 1)) * 100}
                  className="w-full lg:w-32 h-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 - 优化响应式布局 */}
        <Card className="border border-border/50 shadow-sm bg-card/95 backdrop-blur-sm">
          <CardContent className="p-4 lg:p-8">
            <div className="min-h-[400px] lg:min-h-[500px]">
              {renderCurrentStep()}
            </div>
          </CardContent>
        </Card>

        {/* 底部状态栏 - 简化布局 */}
        {(generatedImages.length > 0 || currentStep !== 'upload') && (
          <Card className="border border-border/30 shadow-sm bg-muted/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      已生成 {generatedImages.length} 个品牌Emoji
                    </div>
                    {generationMode === 'batch' && batchPrompts.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        批量模式: {batchPrompts.length} 个情绪表情
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {currentStep !== 'upload' && (
                    <Button
                      onClick={handleRestart}
                      variant="outline"
                      size="sm"
                      className="px-3 py-1.5 text-sm font-medium"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      重新开始
                    </Button>
                  )}

                  {generatedImages.length > 0 && currentStep !== 'gallery' && (
                    <Button
                      onClick={() => setCurrentStep('gallery')}
                      variant="default"
                      size="sm"
                      className="px-3 py-1.5 text-sm font-medium"
                    >
                      查看作品集
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
