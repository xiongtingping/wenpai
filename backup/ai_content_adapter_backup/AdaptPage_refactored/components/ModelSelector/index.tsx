/**
 * AI模型选择器组件
 * 负责AI模型的选择和配置
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { SimpleSelect } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Zap, 
  DollarSign,
  Clock,
  Star,
  Info,
  Sparkles
} from 'lucide-react';
import { useAdaptPage } from '../../AdaptPageProvider';
import { cn } from '@/lib/utils';

// ========================================================================================
// AI模型选项
// ========================================================================================

const aiModels = [
  {
    value: 'gpt-4',
    label: 'GPT-4',
    provider: 'OpenAI',
    description: '最强大的通用AI模型，适合复杂内容创作',
    maxTokens: 8192,
    costPer1k: 0.03,
    speed: 'medium',
    quality: 95,
    features: ['创意写作', '逻辑推理', '多语言', '代码生成'],
    recommended: true,
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    description: '快速高效的AI模型，适合日常内容生成',
    maxTokens: 4096,
    costPer1k: 0.002,
    speed: 'fast',
    quality: 85,
    features: ['快速响应', '成本低廉', '稳定可靠'],
    recommended: false,
  },
  {
    value: 'claude-3',
    label: 'Claude-3',
    provider: 'Anthropic',
    description: '注重安全和准确性的AI模型',
    maxTokens: 100000,
    costPer1k: 0.015,
    speed: 'medium',
    quality: 90,
    features: ['长文本处理', '安全可靠', '逻辑清晰'],
    recommended: false,
  },
  {
    value: 'deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: '国产优秀AI模型，中文理解能力强',
    maxTokens: 4096,
    costPer1k: 0.001,
    speed: 'fast',
    quality: 80,
    features: ['中文优化', '成本极低', '响应快速'],
    recommended: false,
  },
];

// ========================================================================================
// 组件Props
// ========================================================================================

interface ModelSelectorProps {
  className?: string;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function ModelSelector({ className }: ModelSelectorProps) {
  const { state, events } = useAdaptPage();

  const {
    selectedAIModel,
    isGenerating,
  } = state;

  const {
    onAIModelChange,
  } = events;

  const selectedModel = aiModels.find(model => model.value === selectedAIModel);

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'fast': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'slow': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getSpeedLabel = (speed: string) => {
    switch (speed) {
      case 'fast': return '快速';
      case 'medium': return '中等';
      case 'slow': return '较慢';
      default: return '未知';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* 模型选择 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">AI模型选择</Label>
        </div>
        
        <SimpleSelect
          value={selectedAIModel}
          options={aiModels.map(model => ({
            value: model.value,
            label: `${model.label} (${model.provider})`,
            description: model.description,
          }))}
          onValueChange={onAIModelChange}
          disabled={isGenerating}
          placeholder="选择AI模型..."
          className="w-full"
        />
      </div>

      {/* 选中模型详情 */}
      {selectedModel && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* 模型基本信息 */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">{selectedModel.label}</h3>
                    {selectedModel.recommended && (
                      <Badge variant="default" className="text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        推荐
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedModel.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    提供商: {selectedModel.provider}
                  </div>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">响应速度</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm', getSpeedColor(selectedModel.speed))}>
                      {getSpeedLabel(selectedModel.speed)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">成本</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${selectedModel.costPer1k}/1K tokens
                  </div>
                </div>
              </div>

              {/* 质量评分 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">内容质量</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedModel.quality}/100
                  </span>
                </div>
                <Progress value={selectedModel.quality} className="h-2" />
              </div>

              {/* 特性标签 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">特性优势</div>
                <div className="flex flex-wrap gap-1">
                  {selectedModel.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 技术规格 */}
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">最大Token数:</span>
                    <span className="ml-1">{selectedModel.maxTokens.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium">适用场景:</span>
                    <span className="ml-1">内容创作</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 模型对比 */}
      <Card className="bg-accent/30">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-foreground">
              <div className="font-medium mb-1">💡 选择建议：</div>
              <ul className="space-y-1">
                <li>• <strong>GPT-4</strong>: 追求最高质量，复杂内容创作</li>
                <li>• <strong>GPT-3.5 Turbo</strong>: 日常使用，快速响应</li>
                <li>• <strong>Claude-3</strong>: 长文本处理，安全可靠</li>
                <li>• <strong>DeepSeek</strong>: 中文内容，成本敏感</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用统计（模拟数据） */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">本月使用统计</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-blue-700">
            <div>
              <div className="font-medium">生成次数</div>
              <div>156 次</div>
            </div>
            <div>
              <div className="font-medium">Token消耗</div>
              <div>45.2K tokens</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ModelSelector;
