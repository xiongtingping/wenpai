/**
 * 生成控制组件
 * 负责内容生成的控制和配置
 */

import React from 'react';
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
  Check
} from 'lucide-react';
import ContentFormSelector from '@/components/creative/ContentFormSelector';
import type { StyleType } from '@/config/contentSchemes';
import { getModelInfo } from '@/config/aiModels';

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

  // 检查是否可以开始生成
  const canGenerate = !generating && 
                     !queueRunning && 
                     selectedPlatforms.length > 0 && 
                     originalContent.trim().length > 0 &&
                     validationErrors.length === 0;

  // 获取模型信息
  const currentModel = availableModels.find(m => m.id === selectedModel);

  return (
    <div className="space-y-6">
      {/* 内容形式和风格选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            内容形式与风格
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentFormSelector
            selectedFormId={selectedFormId}
            selectedStyle={selectedStyle}
            onFormChange={onFormChange}
            onStyleChange={onStyleChange}
            selectedPlatforms={selectedPlatforms}
            useBrandLibrary={useBrandLibrary}
            customPrompt={customPrompt}
            onCustomPromptChange={onCustomPromptChange}
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
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="px-2 py-1 bg-accent rounded-full">
                当前计划
              </span>
            </div>
          </div>

          {/* 按等级分组显示模型 */}
          <div className="space-y-4">
            {/* 体验版模型 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-700">体验版模型</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                  基础功能
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableModels.filter(m => m.tier === 'low').map((model) => {
                  const disabled = generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-green-400 bg-green-50/80 shadow-md'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-green-200 bg-green-50/40 hover:border-green-300 hover:bg-green-50/60 hover:shadow-sm'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-green-500 bg-green-500 shadow-sm'
                            : 'border-green-300 bg-transparent group-hover:border-green-400'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm text-foreground truncate">{model.name}</h5>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                              {model.company}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 专业版模型 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-sm font-medium text-yellow-700">专业版模型</span>
                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200">
                  专业功能
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableModels.filter(m => m.tier === 'mid').map((model) => {
                  // 🔧 FIX: 修复专业版模型权限判断
                  const userCanUsePro = availableModels.some(m => m.id === model.id && m.tier === 'mid');
                  const disabled = !userCanUsePro || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-50/80 shadow-md'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-yellow-200 bg-yellow-50/40 hover:border-yellow-300 hover:bg-yellow-50/60 hover:shadow-sm'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-500 shadow-sm'
                            : 'border-yellow-300 bg-transparent'
                        }`}>
                          {isSelected ? <Check className="h-3 w-3 text-white" /> : <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm text-foreground truncate">{model.name}</h5>
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700 border-yellow-300">
                              {model.company}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                        </div>
                      </div>
                      {disabled && (
                        <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Crown className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">需要专业版</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 高级版模型 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium text-red-700">高级版模型</span>
                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                  顶级功能
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableModels.filter(m => m.tier === 'high').map((model) => {
                  // 🔧 FIX: 修复高级版模型权限判断
                  const userCanUsePremium = availableModels.some(m => m.id === model.id && m.tier === 'high');
                  const disabled = !userCanUsePremium || generating;
                  const isSelected = selectedModel === model.id;

                  return (
                    <div
                      key={model.id}
                      className={`group relative p-3 border rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-red-400 bg-red-50/80 shadow-md'
                          : disabled
                          ? 'border-border bg-muted/40 opacity-60 cursor-not-allowed'
                          : 'border-red-200 bg-red-50/40 hover:border-red-300 hover:bg-red-50/60 hover:shadow-sm'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (!disabled) {
                          onModelChange(model.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-500 shadow-sm'
                            : 'border-red-300 bg-transparent'
                        }`}>
                          {isSelected ? <Check className="h-3 w-3 text-white" /> : <Crown className="h-3 w-3 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-sm text-foreground truncate">{model.name}</h5>
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                              {model.company}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{model.description}</p>
                        </div>
                      </div>
                      {disabled && (
                        <div className="absolute inset-0 bg-background/60 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Crown className="h-4 w-4 text-red-500 mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">需要高级版</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 升级提示 */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Crown className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    解锁更多强大AI模型
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    升级到专业版或高级版，获得更多顶级AI模型和专业功能
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  立即升级
                </Button>
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
