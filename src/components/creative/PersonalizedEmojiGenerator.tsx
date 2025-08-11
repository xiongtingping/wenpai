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
    { id: 'upload', title: '上传素材', description: '上传品牌图片或输入描述' },
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
    <div className="w-full">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* 步骤指示器 */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-card to-card/90">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 shadow-md
                      ${index <= currentStepIndex
                        ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
                        : 'bg-muted/50 text-muted-foreground border-muted-foreground/20'
                      }
                    `}>
                      {index < currentStepIndex ? (
                        <CheckCircle className="w-7 h-7" />
                      ) : (
                        <span className="text-lg">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center space-y-1">
                      <div className={`text-sm font-semibold ${
                        index <= currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground max-w-24 leading-tight">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-1 mx-6 rounded-full transition-all duration-300
                      ${index < currentStepIndex ? 'bg-primary shadow-sm' : 'bg-muted-foreground/20'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            
            {/* 进度条 */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  步骤 {currentStepIndex + 1} / {steps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStepIndex / (steps.length - 1)) * 100)}% 完成
                </span>
              </div>
              <Progress
                value={(currentStepIndex / (steps.length - 1)) * 100}
                className="w-full h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* 主要内容区域 */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-8">
            <div className="min-h-[500px] flex flex-col">
              {renderCurrentStep()}
            </div>
          </CardContent>
        </Card>

        {/* 底部操作栏 */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-muted/30 to-muted/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    已生成 {generatedImages.length} 个个性化Emoji
                  </div>
                  {generationMode === 'batch' && batchPrompts.length > 0 && (
                    <div className="text-xs text-primary">
                      批量模式: {batchPrompts.length} 个情绪表情
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {currentStep !== 'upload' && (
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    size="sm"
                    className="px-4 py-2 font-medium hover:bg-primary/5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    重新开始
                  </Button>
                )}

                {generatedImages.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep('gallery')}
                    variant="default"
                    size="sm"
                    className="px-4 py-2 font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    查看作品集
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 