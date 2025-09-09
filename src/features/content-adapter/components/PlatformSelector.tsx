/**
 * 平台选择组件
 * 负责目标平台的选择和配置
 */

import React, { useContext } from 'react';
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
  Palette,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContentAdapterSettings } from '@/hooks/useUserSettings';

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
  onBatchSelect?: (platformIds: string[]) => void; // 可选的批量选择函数
  
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
  
  // 全局设置更新回调
  onGlobalSettingsUpdate?: {
    charCountPreset?: (value: string) => void;
    globalEmoji?: (value: boolean) => void;
    globalMd?: (value: boolean) => void;
    globalAutoFormat?: (value: boolean) => void;
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
  onBatchSelect,
  platformSettings,
  onPlatformSettingUpdate,
  settingsMode,
  onSettingsModeChange,
  globalSettings,
  onGlobalSettingsUpdate,
  getPlatformIcon,
  getPlatformName,
  getPlatformMaxCharCount,
  getPlatformRecommendedCharCount,
  t
}: PlatformSelectorProps) {
  const { toast } = useToast();
  const { 
    loading: settingsLoading,
    saveGlobalSettings,
    savePlatformSettings,
    getGlobalSettings,
    getPlatformSettings
  } = useContentAdapterSettings();
  
  // 加载用户保存的设置
  const loadUserSettings = React.useCallback(async () => {
    try {
      // 加载全局设置
      const globalSettings = await getGlobalSettings();
      if (globalSettings) {
        // 更新本地状态
        if (globalSettings.charCountPreset) setLocalCharCountPreset(globalSettings.charCountPreset);
        if (typeof globalSettings.globalEmoji === 'boolean') setLocalGlobalEmoji(globalSettings.globalEmoji);
        if (typeof globalSettings.globalMd === 'boolean') setLocalGlobalMd(globalSettings.globalMd);
        if (typeof globalSettings.globalAutoFormat === 'boolean') setLocalGlobalAutoFormat(globalSettings.globalAutoFormat);
        
        console.log('✅ 全局设置已加载:', globalSettings);
      }
      
      // 加载平台设置
      const platformSettings = await getPlatformSettings();
      if (platformSettings) {
        // 这里可以通过回调更新父组件的平台设置
        console.log('✅ 平台设置已加载:', platformSettings);
      }
      
    } catch (error) {
      console.error('加载用户设置失败:', error);
    }
  }, [getGlobalSettings, getPlatformSettings]);
  
  // 在组件加载时加载设置
  React.useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  // 设置面板状态
  const [showAdvancedSettings, setShowAdvancedSettings] = React.useState(true);
  const [settingsType, setSettingsType] = React.useState<'global' | 'platform'>('global');
  
  // 本地全局格式选项状态（如果父组件没有提供回调函数，使用本地状态）
  const [localGlobalEmoji, setLocalGlobalEmoji] = React.useState(globalSettings.globalEmoji || false);
  const [localGlobalMd, setLocalGlobalMd] = React.useState(globalSettings.globalMd || false);
  const [localGlobalAutoFormat, setLocalGlobalAutoFormat] = React.useState(globalSettings.globalAutoFormat || false);
  
  // 本地字符数预设状态（用于高亮显示）
  const [localCharCountPreset, setLocalCharCountPreset] = React.useState(globalSettings.charCountPreset || '');
  
  // 保存状态管理
  const [isSavingGlobal, setIsSavingGlobal] = React.useState(false);
  const [isSavingPlatform, setIsSavingPlatform] = React.useState(false);

  // 全选/取消全选
  const handleSelectAll = () => {
    const isAllSelected = selectedPlatforms.length === availablePlatforms.length;
    
    if (onBatchSelect) {
      // 使用批量选择函数（如果提供的话）
      if (isAllSelected) {
        // 取消全选 - 传空数组
        onBatchSelect([]);
      } else {
        // 全选 - 传所有平台ID
        const allPlatformIds = availablePlatforms.map(p => p.id);
        onBatchSelect(allPlatformIds);
      }
    } else {
      // 降级到逐个切换（兼容旧版本）- 使用改进的策略
      if (isAllSelected) {
        // 取消全选 - 批量处理，避免状态竞争
        const platformsToUnselect = [...selectedPlatforms];
        platformsToUnselect.forEach((platformId, index) => {
          // 使用requestAnimationFrame确保状态更新顺序
          requestAnimationFrame(() => {
            setTimeout(() => onPlatformToggle(platformId), index * 5);
          });
        });
      } else {
        // 全选 - 批量处理，避免状态竞争
        const platformsToSelect = availablePlatforms
          .filter(platform => !selectedPlatforms.includes(platform.id))
          .map(p => p.id);
          
        platformsToSelect.forEach((platformId, index) => {
          // 使用requestAnimationFrame确保状态更新顺序
          requestAnimationFrame(() => {
            setTimeout(() => onPlatformToggle(platformId), index * 5);
          });
        });
      }
    }
    
    console.log('全选操作完成:', {
      操作: isAllSelected ? '取消全选' : '全选',
      使用批量函数: !!onBatchSelect,
      当前选中: selectedPlatforms.length,
      可用平台: availablePlatforms.length
    });
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

  // 全局设置保存
  const handleSaveGlobalSettings = async () => {
    if (isSavingGlobal || settingsLoading) return; // 防止重复点击
    
    setIsSavingGlobal(true);
    
    try {
      // 构造全局设置数据
      const globalSettingsData = {
        selectedPlatforms,
        charCountPreset: localCharCountPreset,
        globalEmoji: localGlobalEmoji,
        globalMd: localGlobalMd,
        globalAutoFormat: localGlobalAutoFormat,
        settingsType: 'global'
      };
      
      // 使用新的设置服务保存
      const success = await saveGlobalSettings(globalSettingsData);
      
      if (success) {
        // 显示成功提示
        toast({
          title: "✅ 全局设置已保存",
          description: `已为${selectedPlatforms.length}个选中平台应用全局配置`,
          duration: 3000,
        });
        
        console.log('✅ 全局设置保存成功');
      } else {
        throw new Error('保存设置失败');
      }
      
    } catch (error) {
      console.error('❌ 保存全局设置失败:', error);
      
      // 显示错误提示
      toast({
        title: "❌ 保存失败",
        description: error instanceof Error ? error.message : "保存全局设置时出现错误",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSavingGlobal(false);
    }
  };

  // 平台个性化设置保存
  const handleSavePlatformSettings = async () => {
    if (isSavingPlatform || settingsLoading) return; // 防止重复点击
    
    setIsSavingPlatform(true);
    
    try {
      // 构造平台设置数据
      const platformSettingsData = {
        selectedPlatforms,
        platformSettings,
        settingsType: 'platform',
        individualPlatformConfigs: selectedPlatforms.reduce((acc, platformId) => {
          acc[platformId] = platformSettings[platformId] || {};
          return acc;
        }, {} as Record<string, any>)
      };
      
      // 使用新的设置服务保存
      const success = await savePlatformSettings(platformSettingsData);
      
      if (success) {
        // 显示成功提示
        toast({
          title: "✅ 平台设置已保存",
          description: `已保存${selectedPlatforms.length}个平台的个性化配置`,
          duration: 3000,
        });
        
        console.log('✅ 平台设置保存成功');
      } else {
        throw new Error('保存设置失败');
      }
      
    } catch (error) {
      console.error('❌ 保存平台设置失败:', error);
      
      // 显示错误提示
      toast({
        title: "❌ 保存失败", 
        description: error instanceof Error ? error.message : "保存平台设置时出现错误",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSavingPlatform(false);
    }
  };

  // 通用一键保存设置（保留原有功能）
  const handleSaveSettings = () => {
    console.log('Save all settings clicked', { selectedPlatforms: selectedPlatforms.length });
    
    // 显示成功提示
    if (toast) {
      try {
        toast({
          title: "✅ 设置已保存",
          description: `已成功保存 ${selectedPlatforms.length} 个平台的配置设置`,
          duration: 3000,
        });
      } catch (error) {
        console.error('Toast error:', error);
        alert(`✅ 设置已保存 - 已成功保存 ${selectedPlatforms.length} 个平台的配置设置`);
      }
    } else {
      alert(`✅ 设置已保存 - 已成功保存 ${selectedPlatforms.length} 个平台的配置设置`);
    }
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
            {/* 平台选择网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {availablePlatforms.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);

                return (
                  <Card
                    key={platform.id}
                    className={`
                      relative border cursor-pointer transition-all duration-200 h-36 flex flex-col rounded-xl overflow-hidden
                      ${isSelected
                        ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20'
                        : 'bg-card/90 backdrop-blur-sm hover:shadow-lg hover:border-border'
                      }
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      onPlatformToggle(platform.id);
                    }}
                  >
                    <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            {getPlatformIcon(platform.id)}
                          </div>
                          <CardTitle className="text-sm font-semibold truncate leading-tight text-foreground flex-1">
                            {getPlatformName(platform.id)}
                          </CardTitle>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => {
                              onPlatformToggle(platform.id);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-3 px-3 flex-1 flex flex-col justify-center">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 break-words">
                          {platform.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* 平台设置区域 */}
            <div className="space-y-6 mt-8 border-t border-border pt-6">
              {selectedPlatforms.length === 0 && (
                <div className="text-center py-4 text-muted-foreground bg-muted/20 rounded-lg">
                  <p className="text-sm">请选择至少一个目标平台开始内容适配</p>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">平台设置</h2>
                </div>
              </div>
              
              {/* 全局设置 */}
              <Card 
                className={`transition-all duration-300 ${
                  settingsType === 'global' 
                    ? 'bg-accent/50 ring-2 ring-primary/20 shadow-md' 
                    : 'bg-muted/20 opacity-60'
                }`}
                onClick={() => setSettingsType('global')}
              >
                <CardHeader 
                  className={`pb-4 cursor-pointer ${
                    settingsType === 'global' ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        settingsType === 'global' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Globe className={`h-5 w-5 ${
                          settingsType === 'global' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${
                          settingsType === 'global' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          全局设置
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          为所有选中平台应用统一配置
                        </p>
                      </div>
                      {settingsType === 'global' && (
                        <Button
                          onClick={handleSaveGlobalSettings}
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={selectedPlatforms.length === 0 || isSavingGlobal}
                        >
                          {isSavingGlobal ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}
                          {isSavingGlobal ? '保存中...' : '保存设置'}
                        </Button>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      settingsType === 'global' 
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {settingsType === 'global' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {settingsType === 'global' && (
                  <CardContent className="space-y-4 pt-0">
                    {/* 字符数预设 - 紧凑卡片布局 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">字符数预设</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div 
                          className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${
                            (onGlobalSettingsUpdate?.charCountPreset ? globalSettings.charCountPreset : localCharCountPreset) === 'concise'
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            selectedPlatforms.forEach(platformId => {
                              const maxCharCount = getPlatformMaxCharCount(platformId);
                              onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.3));
                            });
                            if (onGlobalSettingsUpdate?.charCountPreset) {
                              onGlobalSettingsUpdate.charCountPreset('concise');
                            } else {
                              setLocalCharCountPreset('concise');
                            }
                          }}
                        >
                          <div className="text-sm font-bold text-primary">30%</div>
                          <div className="text-xs">精简</div>
                        </div>
                        
                        <div 
                          className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${
                            (onGlobalSettingsUpdate?.charCountPreset ? globalSettings.charCountPreset : localCharCountPreset) === 'moderate'
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            selectedPlatforms.forEach(platformId => {
                              const maxCharCount = getPlatformMaxCharCount(platformId);
                              onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.6));
                            });
                            if (onGlobalSettingsUpdate?.charCountPreset) {
                              onGlobalSettingsUpdate.charCountPreset('moderate');
                            } else {
                              setLocalCharCountPreset('moderate');
                            }
                          }}
                        >
                          <div className="text-sm font-bold text-primary">60%</div>
                          <div className="text-xs">适中</div>
                        </div>
                        
                        <div 
                          className={`p-2 border rounded-lg cursor-pointer transition-all text-center ${
                            (onGlobalSettingsUpdate?.charCountPreset ? globalSettings.charCountPreset : localCharCountPreset) === 'rich'
                              ? 'border-primary bg-primary/10' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => {
                            selectedPlatforms.forEach(platformId => {
                              const maxCharCount = getPlatformMaxCharCount(platformId);
                              onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.9));
                            });
                            if (onGlobalSettingsUpdate?.charCountPreset) {
                              onGlobalSettingsUpdate.charCountPreset('rich');
                            } else {
                              setLocalCharCountPreset('rich');
                            }
                          }}
                        >
                          <div className="text-sm font-bold text-primary">90%</div>
                          <div className="text-xs">丰富</div>
                        </div>
                      </div>
                    </div>

                    {/* 格式选项 - 紧凑布局 */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">格式选项</Label>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="global-emoji"
                            checked={onGlobalSettingsUpdate?.globalEmoji ? globalSettings.globalEmoji : localGlobalEmoji}
                            onCheckedChange={(checked) => {
                              const checkedValue = checked as boolean;
                              if (onGlobalSettingsUpdate?.globalEmoji) {
                                onGlobalSettingsUpdate.globalEmoji(checkedValue);
                              } else {
                                setLocalGlobalEmoji(checkedValue);
                              }
                            }}
                          />
                          <Label htmlFor="global-emoji" className="text-sm flex items-center gap-1 cursor-pointer">
                            <Hash className="h-3 w-3" />
                            Emoji表情
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="global-markdown"
                            checked={onGlobalSettingsUpdate?.globalMd ? globalSettings.globalMd : localGlobalMd}
                            onCheckedChange={(checked) => {
                              const checkedValue = checked as boolean;
                              if (onGlobalSettingsUpdate?.globalMd) {
                                onGlobalSettingsUpdate.globalMd(checkedValue);
                              } else {
                                setLocalGlobalMd(checkedValue);
                              }
                            }}
                          />
                          <Label htmlFor="global-markdown" className="text-sm flex items-center gap-1 cursor-pointer">
                            <FileText className="h-3 w-3" />
                            Markdown格式
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="global-autoformat"
                            checked={onGlobalSettingsUpdate?.globalAutoFormat ? globalSettings.globalAutoFormat : localGlobalAutoFormat}
                            onCheckedChange={(checked) => {
                              const checkedValue = checked as boolean;
                              if (onGlobalSettingsUpdate?.globalAutoFormat) {
                                onGlobalSettingsUpdate.globalAutoFormat(checkedValue);
                              } else {
                                setLocalGlobalAutoFormat(checkedValue);
                              }
                            }}
                          />
                          <Label htmlFor="global-autoformat" className="text-sm flex items-center gap-1 cursor-pointer">
                            <Palette className="h-3 w-3" />
                            自动排版
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                  </CardContent>
                )}
              </Card>
              
              {/* 平台个性化设置 */}
              <Card 
                className={`transition-all duration-300 ${
                  settingsType === 'platform' 
                    ? 'bg-accent/50 ring-2 ring-primary/20 shadow-md' 
                    : 'bg-muted/20 opacity-60'
                }`}
                onClick={() => selectedPlatforms.length > 0 && setSettingsType('platform')}
              >
                <CardHeader 
                  className={`pb-4 cursor-pointer ${
                    settingsType === 'platform' ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        settingsType === 'platform' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Sliders className={`h-5 w-5 ${
                          settingsType === 'platform' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className={`text-lg ${
                          settingsType === 'platform' ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          平台个性化设置
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedPlatforms.length === 0 
                            ? '请先选择平台以启用个性化设置' 
                            : `为${selectedPlatforms.length}个选中平台定制专属设置`
                          }
                        </p>
                      </div>
                      {settingsType === 'platform' && selectedPlatforms.length > 0 && (
                        <Button
                          onClick={handleSavePlatformSettings}
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={selectedPlatforms.length === 0 || isSavingPlatform}
                        >
                          {isSavingPlatform ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sliders className="h-3 w-3" />
                          )}
                          {isSavingPlatform ? '保存中...' : '保存设置'}
                        </Button>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      settingsType === 'platform' && selectedPlatforms.length > 0
                        ? 'border-primary bg-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {settingsType === 'platform' && selectedPlatforms.length > 0 && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                {settingsType === 'platform' && selectedPlatforms.length > 0 && (
                  <CardContent className="space-y-6 pt-0">

                    {/* 平台详细设置 */}
                    <div>
                      <Label className="text-sm font-medium mb-4 block">平台详细设置</Label>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                          {selectedPlatforms.map(platformId => {
                            const platform = availablePlatforms.find(p => p.id === platformId);
                            if (!platform) return null;
                            
                            const settings = platformSettings[platformId] || {};
                            const maxCharCount = getPlatformMaxCharCount(platformId);
                            const recommendedCharCount = getPlatformRecommendedCharCount(platformId);
                            
                            return (
                              <div 
                                key={`settings-${platformId}`} 
                                className="border rounded-lg p-2 bg-primary/5 border-primary/20"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                      {getPlatformIcon(platformId)}
                                    </div>
                                    <h3 className="text-sm font-medium">{getPlatformName(platformId)}</h3>
                                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                                      {maxCharCount}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  {/* 字符数设置 - 紧凑布局 */}
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Label className="text-xs font-medium">字符数</Label>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 px-1.5 text-xs"
                                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.3))}
                                        >
                                          30%
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 px-1.5 text-xs"
                                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.6))}
                                        >
                                          60%
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-5 px-1.5 text-xs"
                                          onClick={() => onPlatformSettingUpdate(platformId, 'charCount', Math.floor(maxCharCount * 0.9))}
                                        >
                                          90%
                                        </Button>
                                      </div>
                                    </div>
                                    <Slider
                                      value={[settings.charCount || recommendedCharCount]}
                                      onValueChange={([value]) => onPlatformSettingUpdate(platformId, 'charCount', value)}
                                      max={maxCharCount}
                                      min={Math.floor(maxCharCount * 0.1)}
                                      step={10}
                                      className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>{Math.floor(maxCharCount * 0.1)}</span>
                                      <span className="text-primary font-medium">
                                        {settings.charCount || recommendedCharCount}
                                      </span>
                                      <span>{maxCharCount}</span>
                                    </div>
                                  </div>

                                  {/* 格式设置 - 水平紧凑布局 */}
                                  <div>
                                    <Label className="text-xs font-medium mb-1 block">格式选项</Label>
                                    <div className="flex flex-wrap gap-3">
                                      <div className="flex items-center space-x-1">
                                        <Checkbox
                                          id={`emoji-${platformId}`}
                                          checked={settings.useEmoji !== false}
                                          onCheckedChange={(checked) => 
                                            onPlatformSettingUpdate(platformId, 'useEmoji', checked)
                                          }
                                          className="h-3 w-3"
                                        />
                                        <Label htmlFor={`emoji-${platformId}`} className="text-xs cursor-pointer">
                                          Emoji
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-1">
                                        <Checkbox
                                          id={`markdown-${platformId}`}
                                          checked={settings.useMdFormat || false}
                                          onCheckedChange={(checked) => 
                                            onPlatformSettingUpdate(platformId, 'useMdFormat', checked)
                                          }
                                          className="h-3 w-3"
                                        />
                                        <Label htmlFor={`markdown-${platformId}`} className="text-xs cursor-pointer">
                                          Markdown
                                        </Label>
                                      </div>
                                      
                                      <div className="flex items-center space-x-1">
                                        <Checkbox
                                          id={`autoformat-${platformId}`}
                                          checked={settings.useAutoFormat !== false}
                                          onCheckedChange={(checked) => 
                                            onPlatformSettingUpdate(platformId, 'useAutoFormat', checked)
                                          }
                                          className="h-3 w-3"
                                        />
                                        <Label htmlFor={`autoformat-${platformId}`} className="text-xs cursor-pointer">
                                          自动排版
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                    </div>
                    
                  </CardContent>
                )}
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlatformSelector;
