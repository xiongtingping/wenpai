/**
 * 构建prompt组件
 * 根据上传的图片或描述生成个性化的prompt用于Emoji生成
 */

import React, { useState, useEffect } from 'react';
import { Wand2, Copy, RefreshCw, Sparkles, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  baseEmotions, 
  styleOptions, 
  complexityLabels, 
  generateFullPrompt, 
  generateBatchPrompts 
} from '@/lib/emoji-prompts';

interface PromptBuilderProps {
  uploadedData: { image?: File; description?: string } | null;
  onPromptReady: (prompt: string) => void;
  onBatchPromptsReady?: (prompts: Array<{ emotion: string; prompt: string }>) => void;
  onBrandChange?: (brand: string) => void;
  onBack: () => void;
}

export default function PromptBuilder({ 
  uploadedData, 
  onPromptReady, 
  onBatchPromptsReady,
  onBrandChange,
  onBack 
}: PromptBuilderProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('cute');
  const [complexity, setComplexity] = useState([3]);
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [generationMode, setGenerationMode] = useState<'single' | 'batch'>('single');
  const [batchPrompts, setBatchPrompts] = useState<Array<{ emotion: string; prompt: string }>>([]);
  const { toast } = useToast();

  /**
   * 自动生成prompt
   */
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    
    // 模拟AI生成过程
    setTimeout(() => {
      if (generationMode === 'single') {
        const prompt = generateFullPrompt(uploadedData, style, complexity[0]);
        setGeneratedPrompt(prompt);
        setCustomPrompt(prompt);
      } else {
        const prompts = generateBatchPrompts(uploadedData, style, complexity[0], brandName);
        setBatchPrompts(prompts);
      }
      
      setIsGenerating(false);
      toast({
        title: "Prompt生成完成",
        description: generationMode === 'single' 
          ? "已为您生成个性化的Emoji生成提示词"
          : `已生成${batchPrompts.length}个情绪提示词`,
      });
    }, 2000);
  };

  /**
   * 复制prompt到剪贴板
   */
  const handleCopyPrompt = async () => {
    const promptToCopy = useCustomPrompt ? customPrompt : generatedPrompt;
    try {
      await navigator.clipboard.writeText(promptToCopy);
      toast({
        title: "复制成功",
        description: "Prompt已复制到剪贴板",
      });
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制文本",
        variant: "destructive",
      });
    }
  };

  /**
   * 复制批量prompts到剪贴板
   */
  const handleCopyBatchPrompts = async () => {
    const promptsText = batchPrompts.map(p => `${p.emotion}: ${p.prompt}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(promptsText);
      toast({
        title: "复制成功",
        description: "批量提示词已复制到剪贴板",
      });
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制文本",
        variant: "destructive",
      });
    }
  };

  /**
   * 确认使用当前prompt
   */
  const handleConfirmPrompt = () => {
    if (generationMode === 'single') {
      const finalPrompt = useCustomPrompt ? customPrompt : generatedPrompt;
      if (!finalPrompt.trim()) {
        toast({
          title: "提示词不能为空",
          description: "请先生成或输入提示词",
          variant: "destructive",
        });
        return;
      }
      onPromptReady(finalPrompt);
    } else {
      if (batchPrompts.length === 0) {
        toast({
          title: "批量提示词为空",
          description: "请先生成批量提示词",
          variant: "destructive",
        });
        return;
      }
      onBatchPromptsReady?.(batchPrompts);
    }
  };

  // 当上传数据或风格改变时，自动更新prompt
  useEffect(() => {
    if (uploadedData && generationMode === 'single') {
      const prompt = generateFullPrompt(uploadedData, style, complexity[0]);
      setGeneratedPrompt(prompt);
      if (!useCustomPrompt) {
        setCustomPrompt(prompt);
      }
    }
  }, [uploadedData, style, complexity, generationMode, useCustomPrompt]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          构建生成提示词
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 生成模式选择 */}
        <div className="space-y-2">
          <Label>生成模式</Label>
          <div className="flex gap-2">
            <Button
              variant={generationMode === 'single' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('single')}
              className="flex-1"
            >
              <List className="w-4 h-4 mr-2" />
              单个提示词
            </Button>
            <Button
              variant={generationMode === 'batch' ? 'default' : 'outline'}
              onClick={() => setGenerationMode('batch')}
              className="flex-1"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              批量情绪
            </Button>
          </div>
        </div>

        {/* 品牌名称输入 */}
        <div className="space-y-2">
          <Label htmlFor="brand-name">品牌名称</Label>
          <Input
            id="brand-name"
            placeholder="请输入您的品牌名称"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              onBrandChange?.(e.target.value);
            }}
          />
        </div>

        {/* 风格选择 */}
        <div className="space-y-2">
          <Label>选择风格</Label>
          <div className="grid grid-cols-3 gap-2">
            {styleOptions.map((option) => (
              <Button
                key={option.value}
                variant={style === option.value ? 'default' : 'outline'}
                onClick={() => setStyle(option.value)}
                className="flex flex-col items-center gap-1 h-auto py-3"
              >
                <span className="text-lg">{option.emoji}</span>
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 复杂度调节 */}
        <div className="space-y-2">
          <Label>设计复杂度: {complexityLabels[complexity[0] - 1]}</Label>
          <Slider
            value={complexity}
            onValueChange={setComplexity}
            max={5}
            min={1}
            step={1}
            className="w-full"
          />
        </div>

        {/* 自动生成按钮 */}
        <Button
          onClick={handleAutoGenerate}
          disabled={isGenerating || !uploadedData || (generationMode === 'batch' && !brandName.trim())}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {generationMode === 'single' ? '自动生成Prompt' : '生成批量情绪Prompt'}
            </>
          )}
        </Button>

        {/* 单个提示词模式 */}
        {generationMode === 'single' && (
          <>
            {/* 自定义Prompt开关 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="custom-prompt">自定义Prompt</Label>
              <Switch
                id="custom-prompt"
                checked={useCustomPrompt}
                onCheckedChange={setUseCustomPrompt}
              />
            </div>

            {/* Prompt显示区域 */}
            <div className="space-y-2">
              <Label>生成提示词</Label>
              <div className="relative">
                <Textarea
                  value={useCustomPrompt ? customPrompt : generatedPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="正在生成个性化提示词..."
                  rows={4}
                  className="resize-none pr-12"
                  disabled={!useCustomPrompt}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPrompt}
                  className="absolute top-2 right-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* 批量提示词模式 */}
        {generationMode === 'batch' && batchPrompts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>批量情绪提示词 ({batchPrompts.length}个)</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyBatchPrompts}
              >
                <Copy className="w-4 h-4 mr-1" />
                复制全部
              </Button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
              {batchPrompts.map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">{item.emotion}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(item.prompt)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button onClick={onBack} variant="outline" className="flex-1">
            返回
          </Button>
          <Button
            onClick={handleConfirmPrompt}
            disabled={
              generationMode === 'single' 
                ? (!generatedPrompt.trim() && !customPrompt.trim())
                : batchPrompts.length === 0
            }
            className="flex-1"
          >
            {generationMode === 'single' ? '确认使用' : '开始批量生成'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 