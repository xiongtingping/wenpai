import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Palette, Lightbulb, Zap, Star, Briefcase, Coffee, Target } from 'lucide-react';

/**
 * 创意魔方页面
 * 提供内容创作和创意生成功能
 */
const CreativeCubePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('creative');

  const contentStyles = [
    { id: 'creative', name: '创意文案', icon: Sparkles, description: '富有创意的营销文案' },
    { id: 'professional', name: '专业商务', icon: Briefcase, description: '正式商务风格' },
    { id: 'casual', name: '轻松日常', icon: Coffee, description: '轻松友好的语调' },
    { id: 'persuasive', name: '说服力强', icon: Target, description: '具有说服力的内容' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // 模拟AI生成过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const sampleContent = `基于"${prompt}"，我为您生成了以下创意内容：

🎯 核心卖点：
• 独特价值主张
• 用户痛点解决方案
• 竞争优势展示

💡 创意角度：
• 情感共鸣点
• 故事化表达
• 视觉化描述

🚀 行动号召：
• 明确的下一步
• 紧迫感营造
• 价值承诺

✨ 创意亮点：
• 新颖的表达方式
• 记忆点设计
• 传播价值`;

      setGeneratedContent(sampleContent);
    } catch (error) {
      console.log('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
          <Sparkles className="text-purple-500" />
          创意魔方
        </h1>
        <p className="text-lg text-muted-foreground">
          释放你的创意潜能，生成独特的内容创作
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="text-blue-500" />
              创意输入
            </CardTitle>
            <CardDescription>
              描述你的需求，AI将为你生成创意内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">内容描述</Label>
              <Textarea
                id="prompt"
                placeholder="例如：为我们的新产品写一段吸引人的营销文案..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
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

            <Button 
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
            </Button>
          </CardContent>
        </Card>

        {/* 输出区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="text-green-500" />
              生成结果
            </CardTitle>
            <CardDescription>
              AI生成的创意内容将在这里显示
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
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
          </CardContent>
        </Card>
      </div>

      {/* 功能特色 */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">功能特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="text-center pt-6">
              <Star className="w-8 h-8 mx-auto mb-4 text-yellow-500" />
              <h3 className="font-semibold mb-2">智能创意</h3>
              <p className="text-sm text-muted-foreground">
                基于AI技术，生成富有创意的内容
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center pt-6">
              <Zap className="w-8 h-8 mx-auto mb-4 text-blue-500" />
              <h3 className="font-semibold mb-2">快速生成</h3>
              <p className="text-sm text-muted-foreground">
                几秒钟内生成高质量创意内容
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center pt-6">
              <Palette className="w-8 h-8 mx-auto mb-4 text-purple-500" />
              <h3 className="font-semibold mb-2">多种风格</h3>
              <p className="text-sm text-muted-foreground">
                支持多种内容风格和语调
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreativeCubePage; 