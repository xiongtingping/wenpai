/**
 * 内容适配器设置管理Hook
 * 管理全局设置、平台设置、模式切换等
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { GlobalSettings, PlatformSettings } from '../services/contentAdapterService';
import type { StyleType } from '@/config/contentSchemes';

// 设置模式
export type SettingsMode = 'global' | 'platform';

// 设置模式状态
export interface SettingsModeState {
  charCount: SettingsMode;
  emoji: SettingsMode;
  mdFormat: SettingsMode;
}

// Hook状态
export interface AdapterSettingsState {
  // 全局设置
  globalSettings: GlobalSettings;
  
  // 平台设置
  platformSettings: Record<string, PlatformSettings>;
  
  // 设置模式
  settingsMode: SettingsModeState;
  
  // 选择状态
  selectedPlatforms: string[];
  selectedFormId?: string;
  selectedStyle?: StyleType;
  
  // 品牌库
  useBrandLibrary: boolean;
  brandProfile?: any;
  
  // 自定义提示词
  customPrompt: string;
  
  // 模型设置
  selectedModel: string;
  
  // 加载状态
  loading: boolean;
  saving: boolean;
}

// Hook参数
export interface UseAdapterSettingsParams {
  defaultGlobalSettings?: Partial<GlobalSettings>;
  defaultPlatformSettings?: Record<string, Partial<PlatformSettings>>;
  autoSave?: boolean;
  storageKey?: string;
}

// Hook返回值
export interface UseAdapterSettingsReturn extends AdapterSettingsState {
  // 全局设置管理
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  resetGlobalSettings: () => void;
  
  // 平台设置管理
  updatePlatformSettings: (platformId: string, settings: Partial<PlatformSettings>) => void;
  resetPlatformSettings: (platformId: string) => void;
  resetAllPlatformSettings: () => void;
  
  // 设置模式管理
  updateSettingsMode: (key: keyof SettingsModeState, mode: SettingsMode) => void;
  resetSettingsMode: () => void;
  
  // 选择状态管理
  updateSelectedPlatforms: (platforms: string[]) => void;
  togglePlatform: (platformId: string) => void;
  updateSelectedForm: (formId?: string) => void;
  updateSelectedStyle: (style?: StyleType) => void;
  
  // 品牌库管理
  updateBrandLibrary: (enabled: boolean, profile?: any) => void;
  
  // 自定义提示词
  updateCustomPrompt: (prompt: string) => void;
  
  // 模型设置
  updateSelectedModel: (model: string) => void;
  
  // 数据持久化
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (data: string) => boolean;
  
  // 工具方法
  getEffectiveSettings: (platformId: string) => {
    charCount: number;
    useEmoji: boolean;
    useMdFormat: boolean;
    useAutoFormat: boolean;
  };
  
  validateSettings: () => {
    isValid: boolean;
    errors: string[];
  };
}

/**
 * 内容适配器设置管理Hook
 */
export function useAdapterSettings(params: UseAdapterSettingsParams = {}): UseAdapterSettingsReturn {
  const {
    defaultGlobalSettings = {},
    defaultPlatformSettings = {},
    autoSave = true,
    storageKey = 'content-adapter-settings'
  } = params;

  const { toast } = useToast();

  // 默认全局设置
  const defaultGlobal: GlobalSettings = {
    charCountPreset: 'standard',
    globalEmoji: false,
    globalMd: false,
    globalAutoFormat: true,
    ...defaultGlobalSettings
  };

  // 状态定义
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(defaultGlobal);
  const [platformSettings, setPlatformSettings] = useState<Record<string, PlatformSettings>>(defaultPlatformSettings);
  const [settingsMode, setSettingsMode] = useState<SettingsModeState>({
    charCount: 'global',
    emoji: 'global',
    mdFormat: 'global'
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>();
  const [selectedStyle, setSelectedStyle] = useState<StyleType>();
  const [useBrandLibrary, setUseBrandLibrary] = useState(false);
  const [brandProfile, setBrandProfile] = useState<any>();
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('deepseek-chat');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 更新全局设置
  const updateGlobalSettings = useCallback((settings: Partial<GlobalSettings>) => {
    setGlobalSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // 重置全局设置
  const resetGlobalSettings = useCallback(() => {
    setGlobalSettings(defaultGlobal);
  }, [defaultGlobal]);

  // 更新平台设置
  const updatePlatformSettings = useCallback((platformId: string, settings: Partial<PlatformSettings>) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platformId]: { ...prev[platformId], ...settings }
    }));
  }, []);

  // 重置平台设置
  const resetPlatformSettings = useCallback((platformId: string) => {
    setPlatformSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[platformId];
      return newSettings;
    });
  }, []);

  // 重置所有平台设置
  const resetAllPlatformSettings = useCallback(() => {
    setPlatformSettings({});
  }, []);

  // 更新设置模式
  const updateSettingsMode = useCallback((key: keyof SettingsModeState, mode: SettingsMode) => {
    setSettingsMode(prev => ({ ...prev, [key]: mode }));
  }, []);

  // 重置设置模式
  const resetSettingsMode = useCallback(() => {
    setSettingsMode({
      charCount: 'global',
      emoji: 'global',
      mdFormat: 'global'
    });
  }, []);

  // 更新选中平台
  const updateSelectedPlatforms = useCallback((platforms: string[]) => {
    setSelectedPlatforms(platforms);
  }, []);

  // 切换平台选择
  const togglePlatform = useCallback((platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  }, []);

  // 更新选中内容形式
  const updateSelectedForm = useCallback((formId?: string) => {
    setSelectedFormId(formId);
  }, []);

  // 更新选中风格
  const updateSelectedStyle = useCallback((style?: StyleType) => {
    setSelectedStyle(style);
  }, []);

  // 更新品牌库设置
  const updateBrandLibrary = useCallback((enabled: boolean, profile?: any) => {
    setUseBrandLibrary(enabled);
    if (profile !== undefined) {
      setBrandProfile(profile);
    }
  }, []);

  // 更新自定义提示词
  const updateCustomPrompt = useCallback((prompt: string) => {
    setCustomPrompt(prompt);
  }, []);

  // 更新选中模型
  const updateSelectedModel = useCallback((model: string) => {
    setSelectedModel(model);
  }, []);

  // 获取有效设置
  const getEffectiveSettings = useCallback((platformId: string) => {
    const platform = platformSettings[platformId] || {};
    
    return {
      charCount: settingsMode.charCount === 'platform' && platform.charCount !== undefined
        ? platform.charCount
        : 500, // 默认字符数
      
      useEmoji: settingsMode.emoji === 'platform' && platform.useEmoji !== undefined
        ? platform.useEmoji
        : globalSettings.globalEmoji,
      
      useMdFormat: settingsMode.mdFormat === 'platform' && platform.useMdFormat !== undefined
        ? platform.useMdFormat
        : globalSettings.globalMd,
      
      useAutoFormat: platform.useAutoFormat !== undefined
        ? platform.useAutoFormat
        : globalSettings.globalAutoFormat
    };
  }, [platformSettings, settingsMode, globalSettings]);

  // 验证设置
  const validateSettings = useCallback(() => {
    const errors: string[] = [];

    // 验证选中平台
    if (selectedPlatforms.length === 0) {
      errors.push('请至少选择一个目标平台');
    }

    // 验证字符数设置
    for (const platformId of selectedPlatforms) {
      const effective = getEffectiveSettings(platformId);
      if (effective.charCount <= 0) {
        errors.push(`${platformId} 的字符数设置无效`);
      }
    }

    // 验证品牌库设置
    if (useBrandLibrary && !brandProfile) {
      errors.push('启用品牌库时必须提供品牌档案');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [selectedPlatforms, getEffectiveSettings, useBrandLibrary, brandProfile]);

  // 保存设置
  const saveSettings = useCallback(async () => {
    setSaving(true);
    try {
      const settingsData = {
        globalSettings,
        platformSettings,
        settingsMode,
        selectedPlatforms,
        selectedFormId,
        selectedStyle,
        useBrandLibrary,
        brandProfile,
        customPrompt,
        selectedModel,
        timestamp: Date.now()
      };

      localStorage.setItem(storageKey, JSON.stringify(settingsData));
      
      toast({
        title: "设置已保存",
        description: "您的配置已成功保存",
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: "设置保存时发生错误",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [
    globalSettings, platformSettings, settingsMode, selectedPlatforms,
    selectedFormId, selectedStyle, useBrandLibrary, brandProfile,
    customPrompt, selectedModel, storageKey, toast
  ]);

  // 加载设置
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const settingsData = JSON.parse(savedData);
        
        setGlobalSettings(settingsData.globalSettings || defaultGlobal);
        setPlatformSettings(settingsData.platformSettings || {});
        setSettingsMode(settingsData.settingsMode || {
          charCount: 'global',
          emoji: 'global',
          mdFormat: 'global'
        });
        setSelectedPlatforms(settingsData.selectedPlatforms || []);
        setSelectedFormId(settingsData.selectedFormId);
        setSelectedStyle(settingsData.selectedStyle);
        setUseBrandLibrary(settingsData.useBrandLibrary || false);
        setBrandProfile(settingsData.brandProfile);
        setCustomPrompt(settingsData.customPrompt || '');
        setSelectedModel(settingsData.selectedModel || 'deepseek-chat');
      }
    } catch (error) {
      console.error('加载设置失败:', error);
      toast({
        title: "加载设置失败",
        description: "将使用默认设置",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [storageKey, defaultGlobal, toast]);

  // 导出设置
  const exportSettings = useCallback(() => {
    const settingsData = {
      globalSettings,
      platformSettings,
      settingsMode,
      selectedPlatforms,
      selectedFormId,
      selectedStyle,
      useBrandLibrary,
      brandProfile,
      customPrompt,
      selectedModel,
      exportedAt: new Date().toISOString()
    };

    return JSON.stringify(settingsData, null, 2);
  }, [
    globalSettings, platformSettings, settingsMode, selectedPlatforms,
    selectedFormId, selectedStyle, useBrandLibrary, brandProfile,
    customPrompt, selectedModel
  ]);

  // 导入设置
  const importSettings = useCallback((data: string) => {
    try {
      const settingsData = JSON.parse(data);
      
      if (settingsData.globalSettings) setGlobalSettings(settingsData.globalSettings);
      if (settingsData.platformSettings) setPlatformSettings(settingsData.platformSettings);
      if (settingsData.settingsMode) setSettingsMode(settingsData.settingsMode);
      if (settingsData.selectedPlatforms) setSelectedPlatforms(settingsData.selectedPlatforms);
      if (settingsData.selectedFormId !== undefined) setSelectedFormId(settingsData.selectedFormId);
      if (settingsData.selectedStyle !== undefined) setSelectedStyle(settingsData.selectedStyle);
      if (settingsData.useBrandLibrary !== undefined) setUseBrandLibrary(settingsData.useBrandLibrary);
      if (settingsData.brandProfile !== undefined) setBrandProfile(settingsData.brandProfile);
      if (settingsData.customPrompt !== undefined) setCustomPrompt(settingsData.customPrompt);
      if (settingsData.selectedModel) setSelectedModel(settingsData.selectedModel);

      toast({
        title: "设置导入成功",
        description: "配置已成功导入",
      });

      return true;
    } catch (error) {
      toast({
        title: "导入失败",
        description: "设置文件格式错误",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // 自动保存
  useEffect(() => {
    if (autoSave) {
      const timeoutId = setTimeout(() => {
        saveSettings();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [
    globalSettings, platformSettings, settingsMode, selectedPlatforms,
    selectedFormId, selectedStyle, useBrandLibrary, brandProfile,
    customPrompt, selectedModel, autoSave, saveSettings
  ]);

  // 初始化时加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // 状态
    globalSettings,
    platformSettings,
    settingsMode,
    selectedPlatforms,
    selectedFormId,
    selectedStyle,
    useBrandLibrary,
    brandProfile,
    customPrompt,
    selectedModel,
    loading,
    saving,
    
    // 全局设置管理
    updateGlobalSettings,
    resetGlobalSettings,
    
    // 平台设置管理
    updatePlatformSettings,
    resetPlatformSettings,
    resetAllPlatformSettings,
    
    // 设置模式管理
    updateSettingsMode,
    resetSettingsMode,
    
    // 选择状态管理
    updateSelectedPlatforms,
    togglePlatform,
    updateSelectedForm,
    updateSelectedStyle,
    
    // 品牌库管理
    updateBrandLibrary,
    
    // 自定义提示词
    updateCustomPrompt,
    
    // 模型设置
    updateSelectedModel,
    
    // 数据持久化
    saveSettings,
    loadSettings,
    exportSettings,
    importSettings,
    
    // 工具方法
    getEffectiveSettings,
    validateSettings
  };
}
