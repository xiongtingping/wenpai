import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Palette, Lightbulb, Zap, Star, Briefcase, Coffee, Target } from 'lucide-react';
import { PermissionLockedButton } from '@/components/auth/PermissionLockedButton';
import { PermissionProtectedInput } from '@/components/auth/PermissionProtectedInput';
import { Header } from '@/components/landing/Header';
import PageNavigation from '@/components/layout/PageNavigation';
import { RoleBasedUpgradePrompt } from '@/components/ui/RoleBasedUpgradePrompt';

/**
 * 创意魔方页面
 * 提供内容创作和创意生成功能
 */
const CreativeCubePage: React.FC = () => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('creative');

  // 🔧 移除整页权限检查，改为按钮级权限控制

  const contentStyles = [
    { id: 'creative', name: t('creative.styles.creative'), icon: Sparkles, description: t('creative.styleDescriptions.creative') },
    { id: 'professional', name: t('creative.styles.professional'), icon: Briefcase, description: t('creative.styleDescriptions.professional') },
    { id: 'casual', name: t('creative.styles.casual'), icon: Coffee, description: t('creative.styleDescriptions.casual') },
    { id: 'persuasive', name: t('creative.styles.persuasive'), icon: Target, description: t('creative.styleDescriptions.persuasive') },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // 调用真实AI服务进行创意内容生成
      const { callAIWithTokenTracking, AITaskType } = await import('@/services/aiWithTokenTracking');

      const aiPrompt = `请基于以下需求生成创意内容：${prompt}

请按照以下格式输出：

🎯 核心卖点：
• [具体的价值主张]
• [用户痛点解决方案]
• [竞争优势展示]

💡 创意角度：
• [情感共鸣点]
• [故事化表达]
• [视觉化描述]

🚀 行动号召：
• [明确的下一步]
• [紧迫感营造]
• [价值承诺]

✨ 创意亮点：
• [新颖的表达方式]
• [记忆点设计]
• [传播价值]

请确保内容具体、实用且富有创意。`;

      const result = await callAIWithTokenTracking({
        prompt: aiPrompt,
        taskType: AITaskType.CREATIVE_GENERATION,
        maxTokens: 1000,
        context: { style: selectedStyle },
        feature: '创意魔方'
      });

      if (result && result.content) {
        setGeneratedContent(result.content);
      } else {
        throw new Error('AI服务返回空结果');
      }
    } catch (error) {
      console.error('创意生成失败:', error);
      setGeneratedContent(t('creative.generateFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 主导航栏 */}
      <Header />

      {/* 页面导航 */}
      <PageNavigation
        title={t('creative.title')}
        description={t('creative.description')}
        showAdaptButton={false}
        showUpgradeButton={false}
        actions={
          <RoleBasedUpgradePrompt
            requiredTier="pro"
            featureName={t('creative.title')}
            description={t('creative.upgradeRequired')}
            mode="compact"
          />
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 🔧 移除整页权限遮罩，改为按钮级权限控制 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <Card variant="enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Wand2 className="text-primary" />
                创意输入
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                描述你的需求，AI将为你生成创意内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-foreground">内容描述</Label>
                <PermissionProtectedInput
                  requiredTier="pro"
                  featureName="创意魔方内容输入"
                >
                  <Textarea
                    id="prompt"
                    variant="enhanced"
                    placeholder={t('creative.contentPlaceholder')}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                  />
                </PermissionProtectedInput>
              </div>

              <div>
                <Label>内容风格</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {contentStyles.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(style.id)}
                      className="justify-start"
                    >
                      <style.icon className="w-4 h-4 mr-2" />
                      {style.name}
                    </Button>
                  ))}
                </div>
              </div>

              <PermissionLockedButton
                requiredTier="pro"
                featureName={t('creative.title')}
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    生成创意内容
                  </>
                )}
              </PermissionLockedButton>
            </CardContent>
          </Card>

          {/* 输出区域 */}
          <Card variant="enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="text-primary" />
                生成结果
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI生成的创意内容将在这里显示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionProtectedInput
                requiredTier="pro"
                featureName="创意魔方内容输出"
              >
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="surface-2 p-4 rounded-lg whitespace-pre-wrap text-sm text-foreground">
                      {generatedContent}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopy} variant="outline" size="sm">
                        复制内容
                      </Button>
                      <Button onClick={() => setGeneratedContent('')} variant="outline" size="sm">
                        清空
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>输入内容描述并点击生成按钮</p>
                    <p className="text-sm">AI将为您创建独特的创意内容</p>
                  </div>
                )}
              </PermissionProtectedInput>
            </CardContent>
          </Card>
        </div>

        {/* 功能特色 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">功能特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="text-center pt-6">
                <Star className="w-8 h-8 mx-auto mb-4 text-foreground" />
                <h3 className="font-semibold mb-2">智能创意</h3>
                <p className="text-sm text-muted-foreground">
                  基于AI技术，生成富有创意的内容
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center pt-6">
                <Zap className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">快速生成</h3>
                <p className="text-sm text-muted-foreground">
                  几秒钟内生成高质量创意内容
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center pt-6">
                <Palette className="w-8 h-8 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">多种风格</h3>
                <p className="text-sm text-muted-foreground">
                  支持多种内容风格和语调
                </p>
              </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeCubePage;
