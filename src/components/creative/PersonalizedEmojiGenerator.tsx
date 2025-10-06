/**
 * 个性化品牌Emoji生成器主控制器
 * 整合上传、构建、生成、展示等所有功能
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

interface PersonalizedEmojiGeneratorProps {
  onStepChange?: (step: Step) => void;
}

export default function PersonalizedEmojiGenerator({ onStepChange }: PersonalizedEmojiGeneratorProps = {}) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedData, setUploadedData] = useState<{ image?: File; description?: string  } | null>(null);

  // 步骤变化时通知父组件
  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);
  const [prompt, setPrompt] = useState('');
  const [batchPrompts, setBatchPrompts] = useState<Array<{ emotion: string; prompt: string }>>([]);
  const [generatedImages, setGeneratedImages] = useState<EmojiImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [character, setCharacter] = useState('');
  const [brand, setBrand] = useState('');

  // 步骤配置
  const steps = [
    { id: 'upload', title: t('components.labels.品牌信息'), description: t('components.labels.输入品牌角色和品牌名称') },
    { id: 'build', title: t('components.labels.构建提示词'), description: t('components.labels.生成个性化生成提示词') },
    { id: 'generate', title: '生成Emoji', description: 'AI生成个性化Emoji' },
    { id: 'gallery', title: t('components.labels.作品展示'), description: '查看和管理生成的Emoji' },
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
    <div className="space-y-6">
      {/* 主要内容区域 - 简化布局 */}
      <div className="relative min-h-[400px]">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 rounded-lg"></div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-lg"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-secondary/8 to-transparent rounded-full blur-xl"></div>
        
        {/* 主要内容 */}
        <div className="relative z-10">
          {renderCurrentStep()}
        </div>
      </div>

      {/* 底部状态栏 - 精美设计 */}
      {(generatedImages.length > 0 || currentStep !== 'upload') && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-md">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary/40 rounded-full animate-ping"></div>
                </div>
                <div>
                  <div className="text-base font-bold text-foreground">
                    已生成 <span className="text-primary">{generatedImages.length}</span> 个品牌Emoji
                  </div>
                  {generationMode === 'batch' && batchPrompts.length > 0 && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
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
                    size="default"
                    className="px-5 py-2.5 text-sm font-semibold bg-background/80 hover:bg-background border-2 border-border/50 hover:border-primary/30 transition-all duration-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    重新开始
                  </Button>
                )}

                {generatedImages.length > 0 && currentStep !== 'gallery' && (
                  <Button
                    onClick={() => setCurrentStep('gallery')}
                    variant="default"
                    size="default"
                    className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
                  >
                    查看作品集
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
