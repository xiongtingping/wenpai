/**
 * 生成控制组件
 * 负责内容生成的控制和配置
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Square,
  RefreshCw,
  Settings,
  Zap,
  Clock,
  Sparkles,
  Bot,
  Crown,
  Check,
  Save
} from 'lucide-react';
import ContentFormSelector from '@/components/creative/ContentFormSelector';
import type { StyleType } from '@/config/contentSchemes';
import { getModelInfo } from '@/config/aiModels';
import { useUserSettings } from '@/hooks/useUserSettings';
import { SETTING_KEYS } from '@/services/userSettingsService';
import { useToast } from '@/hooks/use-toast';

interface GenerationControlsProps {
  // 生成状态
  generating: boolean;
  queueRunning: boolean;
  
  // 内容配置
  selectedFormId?: string;
  selectedStyle?: StyleType;
  onFormChange: (formId?: string) => void;
  onStyleChange: (style?: StyleType) => void;
  
  // 模型配置
  selectedModel: string;
  availableModels: Array<{
    id: string;
    name: string;
    description: string;
    tier: string;
    company: string;
  }>;
  onModelChange: (model: string) => void;
  
  // 品牌库配置
  useBrandLibrary: boolean;
  brandProfile?: any;
  onBrandLibraryChange: (enabled: boolean, profile?: any) => void;
  
  // 自定义提示词
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  
  // 选择状态
  selectedPlatforms: string[];
  originalContent: string;
  
  // 操作回调
  onGenerate: () => void;
  onStopGeneration: () => void;
  onStartAutomation: () => void;
  onStopAutomation: () => void;
  onClearResults: () => void;
  onBatchPublish?: () => void;
  
  // 验证状态
  validationErrors: string[];
  
  // 国际化
  t: (key: string) => string;
}

/**
 * 生成控制组件
 */
export function GenerationControls({
  generating,
  queueRunning,
  selectedFormId,
  selectedStyle,
  onFormChange,
  onStyleChange,
  selectedModel,
  availableModels,
  onModelChange,
  useBrandLibrary,
  brandProfile,
  onBrandLibraryChange,
  customPrompt,
  onCustomPromptChange,
  selectedPlatforms,
  originalContent,
  onGenerate,
  onStopGeneration,
  onStartAutomation,
  onStopAutomation,
  onClearResults,
  onBatchPublish,
  validationErrors,
  t
}: GenerationControlsProps) {

  // 用户设置 Hook
  const { saveSetting, isLoggedIn } = useUserSettings();
  
  // Toast Hook
  const { toast } = useToast();

  // 保存状态
  const [saving, setSaving] = useState(false);

  // 检查是否可以开始生成
  const canGenerate = !generating && 
                     !queueRunning && 
                     selectedPlatforms.length > 0 && 
                     originalContent.trim().length > 0 &&
                     validationErrors.length === 0;

  // 获取模型信息
  const currentModel = availableModels.find(m => m.id === selectedModel);

  // 保存模型选择
  const handleSaveModelPreference = async () => {
    console.log('🔍 保存模型偏好 - 当前状态:', { selectedModel, isLoggedIn, saving });
    
    if (!selectedModel) {
      console.warn('没有选择模型，无法保存');
      return;
    }

    if (!isLoggedIn) {
      console.warn('用户未登录，无法保存模型偏好');
      return;
    }

    setSaving(true);
    try {
      const success = await saveSetting(
        SETTING_KEYS.DEFAULT_MODEL,
        selectedModel,
        {
          modelName: currentModel?.name,
          savedAt: new Date().toISOString(),
          source: 'content_adapter'
        }
      );
      
      if (success) {
        console.log('✅ 模型偏好已保存:', selectedModel);
        toast({
          title: "✅ 保存成功",
          description: `已记住模型选择：${currentModel?.name || selectedModel}`,
          duration: 3000,
        });
      } else {
        console.error('❌ 保存模型偏好失败');
        toast({
          title: "❌ 保存失败",
          description: "无法保存模型偏好设置，请重试",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('❌ 保存模型偏好失败:', error);
      toast({
        title: "❌ 保存失败",
        description: error instanceof Error ? error.message : "保存过程中出现错误",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 内容形式和风格选择 */}
      <Card className="pb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            内容形式与风格
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[120px]">
          <ContentFormSelector
            selectedFormId={selectedFormId}
            selectedStyle={selectedStyle}
            onFormChange={onFormChange}
            onStyleChange={onStyleChange}
          />
        </CardContent>
      </Card>

      {/* AI模型选择 - 精美分层版本（从原版完整迁移） */}
      <Card className="mb-6 rounded-xl bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                AI模型选择
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                基于订阅计划提供不同级别的AI模型，满足从基础到专业的各种创作需求
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs flex items-center gap-1"
              onClick={handleSaveModelPreference}
              disabled={!selectedModel || saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-3 w-3" />
                  记住选择
                </>
              )}
            </Button>
          </div>

          {/* 按等级分组显示模型 */}
          <div className="space-y-4">
            {/* 体验版模型 - 所有模型放一排 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700">体验版模型</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                  基础功能
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableModels.filter(m => m.tier === 'low').map((model) => {
                  const disabled = generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-green-400 bg-green-50/80 shadow-sm'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-green-200 bg-green-50/40 hover:border-green-300 hover:bg-green-50/60'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500 shadow-sm'
                            : 'border-green-300 bg-transparent group-hover:border-green-400'
                        }`}>
                          {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-xs text-foreground truncate">{model.name}</h5>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-green-100 text-green-700 border-green-300">
                              {model.company}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 专业版模型 - 所有模型放一排 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-yellow-700">专业版模型</span>
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                  专业功能
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableModels.filter(m => m.tier === 'mid').map((model) => {
                  const userCanUsePro = availableModels.some(m => m.id === model.id && m.tier === 'mid');
                  const disabled = !userCanUsePro || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-50/80 shadow-sm'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-yellow-200 bg-yellow-50/40 hover:border-yellow-300 hover:bg-yellow-50/60'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-500 shadow-sm'
                            : disabled 
                            ? 'border-yellow-300 bg-transparent'
                            : 'border-yellow-300 bg-transparent group-hover:border-yellow-400'
                        }`}>
                          {isSelected ? <Check className="h-2.5 w-2.5 text-white" /> : disabled && <Crown className="h-2.5 w-2.5 text-yellow-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-xs text-foreground truncate">{model.name}</h5>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-yellow-100 text-yellow-700 border-yellow-300">
                              {model.company}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Crown className="h-3 w-3 text-yellow-500 mx-auto mb-0.5" />
                            <p className="text-xs text-muted-foreground">需要专业版</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 高级版模型 - 所有模型放一排 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-700">高级版模型</span>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                  顶级功能
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {availableModels.filter(m => m.tier === 'high').map((model) => {
                  const userCanUsePremium = availableModels.some(m => m.id === model.id && m.tier === 'high');
                  const disabled = !userCanUsePremium || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-2 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-red-400 bg-red-50/80 shadow-sm'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50/60'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-500 shadow-sm'
                            : disabled 
                            ? 'border-red-300 bg-transparent'
                            : 'border-red-300 bg-transparent group-hover:border-red-400'
                        }`}>
                          {isSelected ? <Check className="h-2.5 w-2.5 text-white" /> : disabled && <Crown className="h-2.5 w-2.5 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-xs text-foreground truncate">{model.name}</h5>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-red-100 text-red-700 border-red-300">
                              {model.company}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="absolute inset-0 bg-background/60 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Crown className="h-3 w-3 text-red-500 mx-auto mb-0.5" />
                            <p className="text-xs text-muted-foreground">需要高级版</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 当前选择的模型信息 */}
          {selectedModel && currentModel && (
            <div className="mt-4 p-3 bg-accent/50 border border-border/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  当前选择：{currentModel.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {currentModel.company}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentModel.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>





      {/* 组合效果预览 - 参考原版 */}
      {(selectedPlatforms.length > 0 || selectedFormId || selectedStyle || useBrandLibrary) && (
        <Card variant="soft" className="mb-6 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">组合效果预览</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>当前配置：</strong>
              原始内容
              {useBrandLibrary && ' + 品牌库'}
              {selectedPlatforms.length > 0 && ` + ${selectedPlatforms.length}个平台`}
              {selectedFormId && ' + 内容形式'}
              {selectedStyle && ' + 表达风格'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 验证错误显示 */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                请解决以下问题后再开始生成：
              </p>
              <ul className="text-sm text-destructive space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={`validation-error-${index}-${error}`} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-destructive rounded-full" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 生成控制按钮 - 使用原版布局 */}
      <div className="flex justify-center mb-12">
        <Button
          size="lg"
          disabled={!canGenerate}
          onClick={onGenerate}
          className="w-full max-w-md theme-hero-button"
        >
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              正在生成中...
            </>
          ) : (
            <>
              开始生成
              <Play className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* 次要操作按钮 - 只有生成内容后才显示 */}
      {(originalContent.trim() && selectedPlatforms.length > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* 自动化和其他操作 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={onStartAutomation}
                  disabled={!canGenerate}
                  variant="outline"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {queueRunning ? (
                    <>
                      <Clock className="h-4 w-4 animate-pulse" />
                      自动化运行中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      批量自动化
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => {
                    // TODO: 实现一键转发弹窗
                    console.log('打开一键转发弹窗');
                  }}
                  variant="secondary"
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4" />
                  一键转发
                </Button>
              </div>

              {/* 控制按钮 */}
              <div className="flex gap-2">
                {(generating || queueRunning) && (
                  <Button
                    onClick={generating ? onStopGeneration : onStopAutomation}
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Square className="h-3 w-3" />
                    停止
                  </Button>
                )}

                <Button
                  onClick={onClearResults}
                  variant="outline"
                  size="sm"
                >
                  清空结果
                </Button>
              </div>

              {/* 生成信息 */}
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>目标平台:</span>
                  <Badge variant="outline">
                    {selectedPlatforms.length} 个平台
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>内容长度:</span>
                  <span>{originalContent.length} 字符</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>预计时间:</span>
                  <span>
                    {Math.ceil(selectedPlatforms.length * originalContent.length / 500)} 秒
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default GenerationControls;
