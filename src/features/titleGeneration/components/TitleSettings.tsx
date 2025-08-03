/**
 * 标题设置组件
 * 管理平台选择、风格偏好、输出数量等配置
 */

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Target, Palette, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TitleGenerationConfig } from '../config/titleGeneration.config';
import type { TitleSettingsProps, PlatformId, TitleStyle } from '../types/titleGeneration.types';

export const TitleSettings = memo<TitleSettingsProps>(({
  platform,
  onPlatformChange,
  stylePreference,
  onStyleChange,
  outputCount,
  onOutputCountChange,
  className
}) => {
  const platformConfigs = TitleGenerationConfig.platforms;
  const styleConfigs = TitleGenerationConfig.styles;
  const generationConfig = TitleGenerationConfig.generation;

  const handleStyleToggle = (style: TitleStyle) => {
    const isSelected = stylePreference.includes(style);
    if (isSelected) {
      // 至少保留一个风格
      if (stylePreference.length > 1) {
        onStyleChange(stylePreference.filter(s => s !== style));
      }
    } else {
      onStyleChange([...stylePreference, style]);
    }
  };

  const resetToDefaults = () => {
    onPlatformChange('default');
    onStyleChange(['informative']);
    onOutputCountChange(generationConfig.defaultOutputCount);
  };

  const currentPlatformConfig = platformConfigs[platform];

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          生成设置
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 平台选择 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Target className="w-4 h-4" />
            目标平台
          </Label>
          <Select value={platform} onValueChange={onPlatformChange}>
            <SelectTrigger>
              <SelectValue placeholder="选择平台" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(platformConfigs).map(([id, config]) => (
                <SelectItem key={id} value={id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{config.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {config.maxLength}字符
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* 平台信息 */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>字符限制:</span>
              <span>{currentPlatformConfig.minLength}-{currentPlatformConfig.maxLength}</span>
            </div>
            <div className="flex justify-between">
              <span>推荐长度:</span>
              <span>{currentPlatformConfig.recommendedLength}字符</span>
            </div>
          </div>
        </div>

        {/* 风格偏好 */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Palette className="w-4 h-4" />
            风格偏好
            <Badge variant="secondary" className="text-xs">
              {stylePreference.length}个已选
            </Badge>
          </Label>
          
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(styleConfigs).map(([style, config]) => {
              const isSelected = stylePreference.includes(style as TitleStyle);
              const isRecommended = currentPlatformConfig.stylePreferences.includes(style as TitleStyle);
              
              return (
                <Button
                  key={style}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "justify-start text-xs h-auto py-2 px-3",
                    isRecommended && !isSelected && "border-blue-200 bg-blue-50"
                  )}
                  onClick={() => handleStyleToggle(style as TitleStyle)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{config.name}</span>
                      {isRecommended && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          推荐
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 text-left">
                      {config.description}
                    </span>
                  </div>
                </Button>
              );
            })}
          </div>
          
          <div className="text-xs text-gray-500">
            💡 选择多个风格可以增加标题多样性
          </div>
        </div>

        {/* 输出数量 */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Hash className="w-4 h-4" />
            输出数量
            <Badge variant="outline" className="text-xs">
              {outputCount}个
            </Badge>
          </Label>
          
          <div className="px-2">
            <Slider
              value={[outputCount]}
              onValueChange={(value) => onOutputCountChange(value[0])}
              min={generationConfig.minOutputCount}
              max={generationConfig.maxOutputCount}
              step={1}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{generationConfig.minOutputCount}个</span>
            <span>{generationConfig.maxOutputCount}个</span>
          </div>
          
          <div className="text-xs text-gray-500">
            💡 更多数量可以提供更多选择，但会增加生成时间
          </div>
        </div>

        {/* 平台特殊规则 */}
        {currentPlatformConfig.specialRules && currentPlatformConfig.specialRules.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-orange-600">
              平台特殊要求
            </Label>
            <div className="space-y-1">
              {currentPlatformConfig.specialRules.map((rule, index) => (
                <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 重置按钮 */}
        <div className="pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetToDefaults}
            className="w-full text-xs"
          >
            重置为默认设置
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

TitleSettings.displayName = 'TitleSettings';

export default TitleSettings;
