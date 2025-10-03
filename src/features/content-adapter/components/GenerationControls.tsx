/**
 * 生成控制组件
 * 负责内容生成的控制和配置
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    tier: 'low' | 'mid' | 'high';
    company: string;
    isAccessible: boolean;
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
}

/**
 * 生成控制组件
 */
export function GenerationControls({ generating,
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
  validationErrors
 }: GenerationControlsProps) {

  // Translation Hook
  const { t } = useTranslation();
  
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

  const accessibleModelIds = React.useMemo(() => {
    return new Set(availableModels.filter(model => model.isAccessible).map(model => model.id));
  }, [availableModels]);

  // 调试信息
  // console.log('🔍 GenerationControls - 模型datadebugging:', {
  //   availableModelsCount: availableModels.length,
  //   selectedModel,
  //   currentModel,
  //   lowTierModels: availableModels.filter(m => m?.tier === 'low').length,
  //   midTierModels: availableModels.filter(m => m?.tier === 'mid').length,
  //   highTierModels: availableModels.filter(m => m?.tier === 'high').length,
  //   sampleModel: availableModels[0],
  //   allModels: availableModels.map(m => ({ id: m?.id, name: m?.name, tier: m?.tier }))
  // });

  // 保存模型选择
  const handleSaveModelPreference = async () => {
    console.log('🔍 saving模型偏好 - currentstate:', { selectedModel, isLoggedIn, saving });
    
    if (!selectedModel) {
      console.warn('没has选择模型，none法saving');
      return;
    }

    if (!isLoggedIn) {
      console.warn('usernotlogin，none法saving模型偏好');
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
        console.log('✅ 模型偏好saved:', selectedModel);
        toast({
          title: "✅ 保存成功",
          description: `已记住模型选择：${currentModel?.name || selectedModel}`,
          duration: 3000,
        });
      } else {
        console.error('❌ saving模型偏好failed');
        toast({
          title: "❌ 保存失败",
          description: "无法保存模型偏好设置，请重试",
          variant: "destructive",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error('❌ saving模型偏好failed:', error);
      toast({
        title: "❌ 保存失败",
        description: error instanceof Error ? error.message : '保存过程中出现错误',
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

      {/* AI模型选择 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">AI模型选择</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  基于订阅计划提供不同级别的AI模型，满足从基础到专业的各种创作需求
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveModelPreference}
              disabled={!selectedModel || saving}
              className="ml-4"
            >
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  记住选择
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 按等级分组显示模型 */}
          <div className="space-y-6">
            {/* 体验版模型 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 dark:bg-green-600"></div>
                  <span className="font-medium text-green-700 dark:text-green-400">体验版模型</span>
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                    基础功能
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">免费使用</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableModels.filter(m => m.tier === 'low').map((model) => {
                  const isAccessible = model.isAccessible;
                  const disabled = !isAccessible || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`
                        relative p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected
                          ? 'border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-200 dark:ring-green-800'
                          : disabled
                          ? 'border-border bg-muted cursor-not-allowed opacity-60'
                          : 'border-border hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/20'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isSelected
                            ? 'border-green-500 dark:border-green-600 bg-green-500 dark:bg-green-600'
                            : 'border-border'
                          }
                        `}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0 w-full">
                          <h5 className="font-medium text-foreground text-sm truncate">
                            {model?.name || '测试模型名称'}
                          </h5>
                          <div className="flex justify-center mt-1">
                            <Badge variant="outline" className="text-xs h-4">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 专业版模型 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span className="font-medium text-primary">专业版模型</span>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    专业功能
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">需要订阅</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableModels.filter(m => m.tier === 'mid').map((model) => {
                  const isAccessible = accessibleModelIds.has(model.id);
                  const disabled = !isAccessible || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`
                        relative p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : disabled
                          ? 'border-border bg-muted cursor-not-allowed opacity-60'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isSelected
                            ? 'border-primary bg-primary'
                            : 'border-border'
                          }
                        `}>
                          {isSelected ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : disabled && (
                            <Crown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 w-full">
                          <h5 className="font-medium text-foreground text-sm truncate">
                            {model?.name || '专业版模型'}
                          </h5>
                          <div className="flex justify-center mt-1">
                            <Badge variant="outline" className="text-xs h-4">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="absolute inset-0 bg-muted/50 dark:bg-muted/60 rounded-lg flex items-center justify-center">
                          <div className="bg-background rounded-md px-2 py-1 shadow-sm border border-border flex items-center gap-1">
                            <Crown className="w-3 h-3 text-primary" />
                            <span className="text-xs font-medium text-foreground">需要专业版</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 高级版模型 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-600"></div>
                  <span className="font-medium text-purple-700 dark:text-purple-400">高级版模型</span>
                  <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700">
                    顶级功能
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">企业级</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableModels.filter(m => m.tier === 'high').map((model) => {
                  const isAccessible = accessibleModelIds.has(model.id);
                  const disabled = !isAccessible || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`
                        relative p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected
                          ? 'border-purple-500 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-200 dark:ring-purple-800'
                          : disabled
                          ? 'border-border bg-muted cursor-not-allowed opacity-60'
                          : 'border-border hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50/50 dark:hover:bg-purple-950/20'
                        }
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${isSelected
                            ? 'border-purple-500 dark:border-purple-600 bg-purple-500 dark:bg-purple-600'
                            : 'border-border'
                          }
                        `}>
                          {isSelected ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : disabled && (
                            <Crown className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 w-full">
                          <h5 className="font-medium text-foreground text-sm truncate">
                            {model?.name || '高级版模型'}
                          </h5>
                          <div className="flex justify-center mt-1">
                            <Badge variant="outline" className="text-xs h-4">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="absolute inset-0 bg-muted/50 dark:bg-muted/60 rounded-lg flex items-center justify-center">
                          <div className="bg-background rounded-md px-2 py-1 shadow-sm border border-border flex items-center gap-1">
                            <Crown className="w-3 h-3 text-purple-500 dark:text-purple-600" />
                            <span className="text-xs font-medium text-foreground">需要高级版</span>
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
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">
                  当前选择：{currentModel.name}
                </span>
                <Badge variant="secondary">
                  {currentModel.company}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
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
                    console.log('opening一key转发popup');
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
