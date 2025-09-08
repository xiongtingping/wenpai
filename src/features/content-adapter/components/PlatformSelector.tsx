/**
 * 平台选择组件
 * 负责目标平台的选择和配置
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Sliders,
  Hash,
  FileText,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// 平台信息接口
interface Platform {
  id: string;
  name: string;
  icon?: React.ReactNode;
  description?: string;
  maxCharCount?: number;
  recommendedCharCount?: number;
}

// 平台设置接口
interface PlatformSettings {
  charCount?: number;
  useEmoji?: boolean;
  useMdFormat?: boolean;
  useAutoFormat?: boolean;
}

// 设置模式
type SettingsMode = 'global' | 'platform';

interface SettingsModeState {
  charCount: SettingsMode;
  emoji: SettingsMode;
  mdFormat: SettingsMode;
}

interface PlatformSelectorProps {
  // 平台数据
  availablePlatforms: Platform[];
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
  
  // 平台设置
  platformSettings: Record<string, PlatformSettings>;
  onPlatformSettingUpdate: (platformId: string, key: keyof PlatformSettings, value: any) => void;
  
  // 设置模式
  settingsMode: SettingsModeState;
  onSettingsModeChange: (key: keyof SettingsModeState, mode: SettingsMode) => void;
  
  // 全局设置
  globalSettings: {
    charCountPreset: string;
    globalEmoji: boolean;
    globalMd: boolean;
    globalAutoFormat: boolean;
  };
  
  // 工具函数
  getPlatformIcon: (platformId: string) => React.ReactNode;
  getPlatformName: (platformId: string) => string;
  getPlatformMaxCharCount: (platformId: string) => number;
  getPlatformRecommendedCharCount: (platformId: string) => number;
  
  // 国际化
  t: (key: string) => string;
}

/**
 * 平台选择组件
 */
export function PlatformSelector({
  availablePlatforms,
  selectedPlatforms,
  onPlatformToggle,
  platformSettings,
  onPlatformSettingUpdate,
  settingsMode,
  onSettingsModeChange,
  globalSettings,
  getPlatformIcon,
  getPlatformName,
  getPlatformMaxCharCount,
  getPlatformRecommendedCharCount,
  t
}: PlatformSelectorProps) {
  const { toast } = useToast();

  // 设置面板状态 - 从原版完整迁移
  const [showSettings, setShowSettings] = React.useState<Record<string, boolean>>({});
  const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(false);

  // 切换设置面板显示
  const toggleSettings = (platformId: string) => {
    setShowSettings(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedPlatforms.length === availablePlatforms.length) {
      // 取消全选
      selectedPlatforms.forEach(platformId => onPlatformToggle(platformId));
    } else {
      // 全选
      availablePlatforms.forEach(platform => {
        if (!selectedPlatforms.includes(platform.id)) {
          onPlatformToggle(platform.id);
        }
      });
    }
  };

  // 应用推荐设置
  const applyRecommendedSettings = (platformId: string) => {
    const recommended = getPlatformRecommendedCharCount(platformId);
    onPlatformSettingUpdate(platformId, 'charCount', recommended);
    
    toast({
      title: "已应用推荐设置",
      description: `${getPlatformName(platformId)}字符数已设置为推荐值：${recommended}字符`,
    });
  };

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              选择目标平台
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                已选择 {selectedPlatforms.length} / {availablePlatforms.length}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedPlatforms.length === availablePlatforms.length ? '取消全选' : '全选'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* 平台选择网格 - 使用原版样式 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 auto-rows-fr">
              {availablePlatforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);

                return (
                  <Card
                    key={platform.id}
                    className={`
                      relative border cursor-pointer transition-all duration-200 h-36 flex flex-col rounded-xl
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                        : 'bg-card/90 backdrop-blur-sm hover:shadow-lg hover:border-border'
                      }
                    `}
                    onClick={() => onPlatformToggle(platform.id)}
                  >
                    <CardHeader className="pb-1 pt-4 flex-shrink-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2 min-w-0">
                          <div className="flex-shrink-0">
                            {getPlatformIcon(platform.id)}
                          </div>
                          <CardTitle className="text-sm font-semibold truncate leading-tight text-primary">
                            {getPlatformName(platform.id)}
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              // 🔧 FIX: 修复checkbox事件处理，阻止事件冒泡
                              onPlatformToggle(platform.id);
                            }}
                            onClick={(e) => {
                              // 🔧 FIX: 阻止事件冒泡，避免重复触发
                              e.stopPropagation();
                            }}
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {platform.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {getPlatformMaxCharCount(platform.id)} 字符
                        </Badge>
                        {isSelected && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSettings(platform.id);
                            }}
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 平台设置面板 - 从原版完整迁移 */}
            {selectedPlatforms.map((platformId) => {
              if (!showSettings[platformId]) return null;
              
              const settings = platformSettings[platformId] || {};
              const maxCharCount = getPlatformMaxCharCount(platformId);
              const recommendedCharCount = getPlatformRecommendedCharCount(platformId);
              
              return (
                <div key={`settings-${platformId}`} className="mt-4 border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(platformId)}
                      <h3 className="font-medium">{getPlatformName(platformId)} 设置</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSettings(platformId)}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* 字符数设置 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          字符数限制
                        </Label>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>推荐：{recommendedCharCount}</span>
                          <span>•</span>
                          <span>最大：{maxCharCount}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[settings.charCount || recommendedCharCount]}
                          onValueChange={([value]) => onPlatformSettingUpdate(platformId, 'charCount', value)}
                          max={maxCharCount}
                          min={Math.min(50, recommendedCharCount)}
                          step={10}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.min(50, recommendedCharCount)}</span>
                          <span className="font-medium">
                            当前：{settings.charCount || recommendedCharCount} 字符
                          </span>
                          <span>{maxCharCount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', recommendedCharCount)}
                        >
                          推荐值
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.8))}
                        >
                          80%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', maxCharCount)}
                        >
                          最大值
                        </Button>
                      </div>
                    </div>

                    {/* 格式设置 */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">格式设置</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`emoji-${platformId}`}
                            checked={settings.useEmoji || false}
                            onCheckedChange={(checked) => 
                              onPlatformSettingUpdate(platformId, 'useEmoji', checked)
                            }
                          />
                          <Label htmlFor={`emoji-${platformId}`} className="text-sm flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            使用表情符号
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`markdown-${platformId}`}
                            checked={settings.useMdFormat || false}
                            onCheckedChange={(checked) => 
                              onPlatformSettingUpdate(platformId, 'useMdFormat', checked)
                            }
                          />
                          <Label htmlFor={`markdown-${platformId}`} className="text-sm flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            使用Markdown格式
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`autoformat-${platformId}`}
                            checked={settings.useAutoFormat !== false}
                            onCheckedChange={(checked) => 
                              onPlatformSettingUpdate(platformId, 'useAutoFormat', checked)
                            }
                          />
                          <Label htmlFor={`autoformat-${platformId}`} className="text-sm flex items-center gap-1">
                            <Palette className="h-3 w-3" />
                            自动格式化
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 选择提示 */}
            {selectedPlatforms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">请选择至少一个目标平台开始内容适配</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlatformSelector;
