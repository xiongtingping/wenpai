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

  // 调试信息
  console.log('🔍 GenerationControls - 模型数据调试:', {
    availableModelsCount: availableModels.length,
    selectedModel,
    currentModel,
    lowTierModels: availableModels.filter(m => m?.tier === 'low').length,
    midTierModels: availableModels.filter(m => m?.tier === 'mid').length,
    highTierModels: availableModels.filter(m => m?.tier === 'high').length,
    sampleModel: availableModels[0],
    allModels: availableModels.map(m => ({ id: m?.id, name: m?.name, tier: m?.tier }))
  });

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
        description: error instanceof Error ? error.message : t('components.errors.保存过程中出现错误'),
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

      {/* AI模型选择 - 优化版本 */}
      <Card className="ai-model-selector-card">
        <CardHeader className="ai-model-selector-header">
          <div className="ai-model-header-layout">
            <div className="ai-model-title-section">
              <div className="ai-model-icon-container">
                <Sparkles className="ai-model-icon" />
              </div>
              <div className="ai-model-title-content">
                <h4 className="ai-model-title">AI模型选择</h4>
                <p className="ai-model-description">
                  基于订阅计划提供不同级别的AI模型，满足从基础到专业的各种创作需求
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ai-model-save-button"
              onClick={handleSaveModelPreference}
              disabled={!selectedModel || saving}
            >
              {saving ? (
                <>
                  <RefreshCw className="ai-model-save-icon animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="ai-model-save-icon" />
                  记住选择
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="ai-model-selector-content">

          {/* 按等级分组显示模型 */}
          <div className="ai-model-tiers-container">
            {/* 体验版模型 */}
            <div className="ai-model-tier-section">
              <div className="ai-model-tier-header">
                <div className="ai-model-tier-info">
                  <div className="ai-model-tier-indicator ai-model-tier-indicator--trial"></div>
                  <span className="ai-model-tier-name ai-model-tier-name--trial">体验版模型</span>
                  <Badge variant="outline" className="ai-model-tier-badge ai-model-tier-badge--trial">
                    基础功能
                  </Badge>
                </div>
                <span className="ai-model-tier-price">免费使用</span>
              </div>
              <div className="ai-model-grid">
                {availableModels.filter(m => m.tier === 'low').map((model) => {
                  console.log('🔍 渲染体验版模型:', model);
                  const disabled = generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`ai-model-card ai-model-card--trial ${
                        isSelected
                          ? 'ai-model-card--selected'
                          : disabled
                          ? 'ai-model-card--disabled'
                          : 'ai-model-card--available'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="ai-model-card-content">
                        <div className={`ai-model-radio ai-model-radio--trial ${
                          isSelected ? 'ai-model-radio--selected' : ''
                        }`}>
                          {isSelected && <Check className="ai-model-radio-check" />}
                        </div>
                        <div className="ai-model-info">
                          <h5 className="ai-model-name">
                            {model?.name || '测试模型名称'}
                          </h5>
                          <div className="ai-model-meta">
                            <Badge variant="outline" className="ai-model-company-badge ai-model-company-badge--trial">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="ai-model-description-text">
                            {model?.description || '测试模型描述'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 专业版模型 */}
            <div className="ai-model-tier-section">
              <div className="ai-model-tier-header">
                <div className="ai-model-tier-info">
                  <div className="ai-model-tier-indicator ai-model-tier-indicator--pro"></div>
                  <span className="ai-model-tier-name ai-model-tier-name--pro">专业版模型</span>
                  <Badge variant="outline" className="ai-model-tier-badge ai-model-tier-badge--pro">
                    专业功能
                  </Badge>
                </div>
                <span className="ai-model-tier-price">需要订阅</span>
              </div>
              <div className="ai-model-grid">
                {availableModels.filter(m => m.tier === 'mid').map((model) => {
                  const userCanUsePro = availableModels.some(m => m.id === model.id && m.tier === 'mid');
                  const disabled = !userCanUsePro || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`ai-model-card ai-model-card--pro ${
                        isSelected
                          ? 'ai-model-card--selected'
                          : disabled
                          ? 'ai-model-card--disabled'
                          : 'ai-model-card--available'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="ai-model-card-content">
                        <div className={`ai-model-radio ai-model-radio--pro ${
                          isSelected ? 'ai-model-radio--selected' : ''
                        }`}>
                          {isSelected ? <Check className="ai-model-radio-check" /> : disabled && <Crown className="ai-model-radio-crown" />}
                        </div>
                        <div className="ai-model-info">
                          <h5 className="ai-model-name">
                            {model?.name || '专业版模型'}
                          </h5>
                          <div className="ai-model-meta">
                            <Badge variant="outline" className="ai-model-company-badge ai-model-company-badge--pro">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="ai-model-description-text">
                            {model?.description || '专业级AI模型'}
                          </p>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="ai-model-upgrade-overlay">
                          <div className="ai-model-upgrade-content">
                            <Crown className="ai-model-upgrade-icon" />
                            <p className="ai-model-upgrade-text">需要专业版</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 高级版模型 */}
            <div className="ai-model-tier-section">
              <div className="ai-model-tier-header">
                <div className="ai-model-tier-info">
                  <div className="ai-model-tier-indicator ai-model-tier-indicator--premium"></div>
                  <span className="ai-model-tier-name ai-model-tier-name--premium">高级版模型</span>
                  <Badge variant="outline" className="ai-model-tier-badge ai-model-tier-badge--premium">
                    顶级功能
                  </Badge>
                </div>
                <span className="ai-model-tier-price">企业级</span>
              </div>
              <div className="ai-model-grid">
                {availableModels.filter(m => m.tier === 'high').map((model) => {
                  const userCanUsePremium = availableModels.some(m => m.id === model.id && m.tier === 'high');
                  const disabled = !userCanUsePremium || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`ai-model-card ai-model-card--premium ${
                        isSelected
                          ? 'ai-model-card--selected'
                          : disabled
                          ? 'ai-model-card--disabled'
                          : 'ai-model-card--available'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled && !generating) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="ai-model-card-content">
                        <div className={`ai-model-radio ai-model-radio--premium ${
                          isSelected ? 'ai-model-radio--selected' : ''
                        }`}>
                          {isSelected ? <Check className="ai-model-radio-check" /> : disabled && <Crown className="ai-model-radio-crown" />}
                        </div>
                        <div className="ai-model-info">
                          <h5 className="ai-model-name">
                            {model?.name || '高级版模型'}
                          </h5>
                          <div className="ai-model-meta">
                            <Badge variant="outline" className="ai-model-company-badge ai-model-company-badge--premium">
                              {model?.company || 'Unknown'}
                            </Badge>
                          </div>
                          <p className="ai-model-description-text">
                            {model?.description || '顶级AI模型'}
                          </p>
                        </div>
                      </div>
                      {disabled && !generating && (
                        <div className="ai-model-upgrade-overlay">
                          <div className="ai-model-upgrade-content">
                            <Crown className="ai-model-upgrade-icon" />
                            <p className="ai-model-upgrade-text">需要高级版</p>
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
            <div className="ai-model-current-selection">
              <div className="ai-model-current-header">
                <Bot className="ai-model-current-icon" />
                <span className="ai-model-current-title">
                  当前选择：{currentModel.name}
                </span>
                <Badge variant="secondary" className="ai-model-current-badge">
                  {currentModel.company}
                </Badge>
              </div>
              <p className="ai-model-current-description">
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
