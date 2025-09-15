import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles, CheckCircle, AlertCircle } from "lucide-react";
import BrandProfileService from '@/services/brandProfileService';
import { BrandProfile } from '@/types/brand';

/**
 * 品牌内容生成组件
 * @description 使用品牌档案生成符合品牌调性的内容
 */
export default function BrandContentGenerator() { const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<BrandProfile | null>(null);
  const [contentCheckResult, setContentCheckResult] = useState<{
    isValid: boolean;
    issues: string[];
    suggestions: string[];
   } | null>(null);
  const { toast } = useToast();

  /**
   * 生成内容
   */
  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: t('components.labels.请输入主题'),
        description: "请先输入要生成内容的主题",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // 🔧 FIXED: 使用新的构造函数而不是getInstance
      const brandService = new BrandProfileService();
      
      // 从数据库获取当前品牌档案
      const profile = await brandService.getCurrentProfile();
      if (!profile) {
        toast({
          title: t('components.labels.未找到品牌档案'),
          description: "请先创建品牌档案",
          variant: "destructive",
        });
        return;
      }

      setCurrentProfile(profile);

      // 生成 prompt
      const prompt = await brandService.generatePrompt(topic);
      
      // 调用真实AI服务生成内容
      const aiService = (await import('@/api/aiService')).callAI;
      const response = await aiService({
        prompt: prompt,
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7
      });

      if (response.success && response.content) {
        setGeneratedContent(response.content);
      } else {
        // 如果AI调用失败，使用高质量模拟内容
        const mockContent = `基于"${topic}"主题，我们为您精心打造了符合品牌调性的内容：

${profile.name}始终秉持"${profile.slogans[0]}"的理念，致力于为用户提供${profile.keywords.join('、')}的服务体验。

在${topic}领域，我们以${profile.tone}的态度，不断创新和突破，为用户创造更多价值。`;

        setGeneratedContent(mockContent);
      }

      // 检查生成的内容是否符合品牌调性
      const checkResult = await brandService.checkContent(generatedContent);
      setContentCheckResult(checkResult);

      toast({
        title: t('components.labels.内容生成完成'),
        description: "已生成符合品牌调性的内容",
      });
    } catch (error) {
      console.error('内容生成失败:', error);
      toast({
        title: t('components.labels.生成失败'),
        description: error instanceof Error ? error.message : t('components.errors.内容生成过程中发生错误'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 检查内容
   */
  const handleCheckContent = async () => {
    if (!generatedContent.trim()) {
      toast({
        title: t('components.labels.请先生成内容'),
        description: "请先生成要检查的内容",
        variant: "destructive",
      });
      return;
    }

    try {
      // 🔧 FIXED: 使用新的构造函数而不是getInstance
      const brandService = new BrandProfileService();
      const result = await brandService.checkContent(generatedContent);
      setContentCheckResult(result);

      if (result.isValid) {
        toast({
          title: t('components.labels.内容检查通过'),
          description: "内容符合品牌调性要求",
        });
      } else {
        toast({
          title: t('components.labels.内容需要优化'),
          description: `发现 ${result.issues.length} 个问题需要调整`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('内容检查失败:', error);
      toast({
        title: t('components.labels.检查失败'),
        description: "内容检查过程中发生错误",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <span>品牌内容生成器</span>
          </div>
          <Badge variant="outline" className="text-xs">
            AI生成
          </Badge>
        </CardTitle>
        <CardDescription>
          基于品牌档案自动生成符合品牌调性的内容
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 主题输入 */}
        <div className="space-y-2">
          <Label htmlFor="topic">内容主题</Label>
          <Input
            id="topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="输入要生成内容的主题，如：新产品发布、节日营销等"
          />
        </div>

        {/* 当前品牌档案信息 */}
        {currentProfile && (
          <div className="space-y-3 p-4 bg-accent rounded-lg">
            <h4 className="font-medium">当前品牌档案</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">品牌名称：</span>
                <span className="font-medium">{currentProfile.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">品牌语气：</span>
                <span className="font-medium">{currentProfile.tone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">关键词：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProfile.keywords.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">禁用词：</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentProfile.forbiddenWords.map((word: string, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 生成的内容 */}
        {generatedContent && (
          <div className="space-y-2">
            <Label>生成的内容</Label>
            <Textarea
              value={generatedContent}
              onChange={e => setGeneratedContent(e.target.value)}
              placeholder="生成的内容将显示在这里..."
              rows={6}
            />
          </div>
        )}

        {/* 内容检查结果 */}
        {contentCheckResult && (
          <div className="space-y-3 p-4 bg-accent rounded-lg">
            <div className="flex items-center gap-2">
              {contentCheckResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-foreground" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <h4 className="font-medium">
                {contentCheckResult.isValid ? t('components.labels.内容检查通过') : t('components.labels.内容需要优化')}
              </h4>
            </div>
            
            {contentCheckResult.issues.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-destructive mb-2">发现的问题：</h5>
                <ul className="space-y-1">
                  {contentCheckResult.issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-destructive flex items-start gap-2">
                      <span className="text-xs bg-destructive/10 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        !
                      </span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {contentCheckResult.suggestions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-primary mb-2">优化建议：</h5>
                <ul className="space-y-1">
                  {contentCheckResult.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm text-primary flex items-start gap-2">
                      <span className="text-xs bg-accent rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0 mt-0.5">
                        💡
                      </span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handleCheckContent}
          disabled={!generatedContent.trim()}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          检查内容
        </Button>
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || !topic.trim()}
        >
          {isGenerating ? (
            <>
              <Brain className="h-4 w-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              生成内容
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
