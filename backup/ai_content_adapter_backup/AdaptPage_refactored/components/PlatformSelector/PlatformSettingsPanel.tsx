/**
 * 平台设置面板组件
 * 负责单个平台的详细设置
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { SimpleSelect } from '@/components/ui/select';
import { 
  Type, 
  Hash, 
  MessageSquare, 
  RotateCcw,
  Info,
  Zap
} from 'lucide-react';
import { PlatformSettings } from '../../types';
import { cn } from '@/lib/utils';

// ========================================================================================
// 字符数限制预设
// ========================================================================================

const characterLimitPresets = [
  { value: 'auto', label: '自动适配', description: '根据平台特性自动调整' },
  { value: 'short', label: '简短版 (50-200字)', description: '适合微博、朋友圈' },
  { value: 'medium', label: '标准版 (200-800字)', description: '适合小红书、知乎' },
  { value: 'long', label: '详细版 (800-2000字)', description: '适合公众号、文章' },
  { value: 'custom', label: '自定义', description: '手动设置字符数范围' },
];

// ========================================================================================
// 平台默认设置
// ========================================================================================

const platformDefaults: Record<string, Partial<PlatformSettings>> = {
  xiaohongshu: {
    characterLimit: { min: 200, max: 800, preset: 'medium' },
    contentType: 'lifestyle',
  },
  weibo: {
    characterLimit: { min: 50, max: 280, preset: 'short' },
    contentType: 'social',
  },
  zhihu: {
    characterLimit: { min: 500, max: 2000, preset: 'long' },
    contentType: 'knowledge',
  },
  douyin: {
    characterLimit: { min: 50, max: 200, preset: 'short' },
    contentType: 'entertainment',
  },
  wechat: {
    characterLimit: { min: 800, max: 3000, preset: 'long' },
    contentType: 'article',
  },
  bilibili: {
    characterLimit: { min: 100, max: 500, preset: 'medium' },
    contentType: 'entertainment',
  },
};

// ========================================================================================
// 组件Props
// ========================================================================================

interface PlatformSettingsPanelProps {
  platformId: string;
  platformName: string;
  settings?: PlatformSettings;
  onSettingsChange: (settings: PlatformSettings) => void;
  disabled?: boolean;
  className?: string;
}

// ========================================================================================
// 主组件
// ========================================================================================

export function PlatformSettingsPanel({
  platformId,
  platformName,
  settings,
  onSettingsChange,
  disabled = false,
  className,
}: PlatformSettingsPanelProps) {
  // 获取默认设置
  const defaultSettings = platformDefaults[platformId] || {};
  
  // 合并当前设置和默认设置
  const currentSettings: PlatformSettings = {
    characterLimit: {
      min: 100,
      max: 1000,
      preset: 'auto',
      ...defaultSettings.characterLimit,
      ...settings?.characterLimit,
    },
    contentType: defaultSettings.contentType || 'general',
    tags: settings?.tags || [],
    customPrompt: settings?.customPrompt || '',
    ...settings,
  };

  const updateSettings = (updates: Partial<PlatformSettings>) => {
    onSettingsChange({ ...currentSettings, ...updates });
  };

  const updateCharacterLimit = (updates: Partial<PlatformSettings['characterLimit']>) => {
    updateSettings({
      characterLimit: { ...currentSettings.characterLimit, ...updates },
    });
  };

  const handlePresetChange = (preset: string) => {
    const presetData = characterLimitPresets.find(p => p.value === preset);
    if (!presetData) return;

    let limits = { min: 100, max: 1000 };
    
    switch (preset) {
      case 'short':
        limits = { min: 50, max: 200 };
        break;
      case 'medium':
        limits = { min: 200, max: 800 };
        break;
      case 'long':
        limits = { min: 800, max: 2000 };
        break;
      case 'auto':
        limits = defaultSettings.characterLimit || { min: 100, max: 1000 };
        break;
    }

    updateCharacterLimit({ preset, ...limits });
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(/[,，\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    updateSettings({ tags });
  };

  const resetToDefaults = () => {
    onSettingsChange(defaultSettings as PlatformSettings);
  };

  return (
    <div className={cn('p-4 space-y-4 bg-accent/20', className)}>
      {/* 字符数限制设置 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">字符数限制</Label>
        </div>

        {/* 预设选择 */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">预设模式</Label>
          <SimpleSelect
            value={currentSettings.characterLimit?.preset || 'auto'}
            options={characterLimitPresets}
            onValueChange={handlePresetChange}
            disabled={disabled}
            size="sm"
            className="w-full"
          />
        </div>

        {/* 自定义范围 */}
        {currentSettings.characterLimit?.preset === 'custom' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">最小字符数</Label>
                <Input
                  type="number"
                  value={currentSettings.characterLimit?.min || 100}
                  onChange={(e) => updateCharacterLimit({ min: parseInt(e.target.value) || 100 })}
                  disabled={disabled}
                  className="h-8 text-sm"
                  min={10}
                  max={5000}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">最大字符数</Label>
                <Input
                  type="number"
                  value={currentSettings.characterLimit?.max || 1000}
                  onChange={(e) => updateCharacterLimit({ max: parseInt(e.target.value) || 1000 })}
                  disabled={disabled}
                  className="h-8 text-sm"
                  min={50}
                  max={10000}
                />
              </div>
            </div>
          </div>
        )}

        {/* 当前范围显示 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3 w-3" />
          <span>
            当前范围: {currentSettings.characterLimit?.min}-{currentSettings.characterLimit?.max} 字符
          </span>
        </div>
      </div>

      {/* 标签设置 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">平台标签</Label>
        </div>
        <Input
          placeholder="输入标签，用逗号分隔 (如: 生活,美食,推荐)"
          value={currentSettings.tags?.join(', ') || ''}
          onChange={(e) => handleTagsChange(e.target.value)}
          disabled={disabled}
          className="text-sm"
        />
        {currentSettings.tags && currentSettings.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {currentSettings.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 自定义提示词 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">平台专属提示词</Label>
        </div>
        <Textarea
          placeholder={`为${platformName}定制特殊要求...`}
          value={currentSettings.customPrompt || ''}
          onChange={(e) => updateSettings({ customPrompt: e.target.value })}
          disabled={disabled}
          className="min-h-[60px] text-sm resize-none"
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefaults}
          disabled={disabled}
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          重置默认
        </Button>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3" />
          <span>专为{platformName}优化</span>
        </div>
      </div>
    </div>
  );
}

export default PlatformSettingsPanel;
