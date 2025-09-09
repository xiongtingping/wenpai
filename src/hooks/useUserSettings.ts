/**
 * 用户设置管理 Hook
 * 提供便捷的用户设置读写功能
 */

import { useState, useEffect, useCallback, useContext } from 'react';
import { userSettingsService, SETTING_KEYS } from '@/services/userSettingsService';
import UnifiedAuthContext from '@/contexts/UnifiedAuthContext';

/**
 * 用户设置 Hook
 */
export function useUserSettings() {
  const authContext = useContext(UnifiedAuthContext);
  const { user, isAuthenticated } = authContext || {};
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Record<string, any>>({});


  // 设置用户ID
  useEffect(() => {
    userSettingsService.setUserId(user?.id || null);
  }, [user?.id]);

  // 预加载常用设置
  useEffect(() => {
    if (user?.id) {
      userSettingsService.preloadSettings();
    }
  }, [user?.id]);

  /**
   * 获取单个设置
   */
  const getSetting = useCallback(async <T = any>(key: string, defaultValue?: T): Promise<T | undefined> => {
    try {
      return await userSettingsService.getSetting(key, defaultValue);
    } catch (error) {
      console.error('获取设置失败:', error);
      return defaultValue;
    }
  }, []);

  /**
   * 保存单个设置
   */
  const saveSetting = useCallback(async (key: string, value: any, metadata: Record<string, any> = {}): Promise<boolean> => {
    console.log('📝 开始保存设置:', { key, user: user?.id, hasValue: !!value });
    
    if (!user?.id) {
      console.warn('⚠️ 用户未登录，无法保存设置');
      return false;
    }

    try {
      setLoading(true);
      await userSettingsService.saveSetting(key, value, metadata);
      
      // 更新本地状态
      setSettings(prev => ({ ...prev, [key]: value }));
      
      console.log('✅ 设置保存成功:', { key, userId: user.id });
      return true;
    } catch (error) {
      console.error('❌ 保存设置失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * 批量保存设置
   */
  const saveSettings = useCallback(async (newSettings: Record<string, any>, metadata: Record<string, any> = {}): Promise<boolean> => {
    if (!user?.id) {
      console.warn('用户未登录，无法保存设置');
      return false;
    }

    try {
      setLoading(true);
      await userSettingsService.saveSettings(newSettings, metadata);
      
      // 更新本地状态
      setSettings(prev => ({ ...prev, ...newSettings }));
      
      return true;
    } catch (error) {
      console.error('批量保存设置失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * 批量获取设置
   */
  const getSettings = useCallback(async (keys: string[]): Promise<Record<string, any>> => {
    try {
      const result = await userSettingsService.getSettings(keys);
      setSettings(prev => ({ ...prev, ...result }));
      return result;
    } catch (error) {
      console.error('批量获取设置失败:', error);
      return {};
    }
  }, []);

  /**
   * 删除设置
   */
  const deleteSetting = useCallback(async (key: string): Promise<boolean> => {
    if (!user?.id) {
      console.warn('用户未登录，无法删除设置');
      return false;
    }

    try {
      setLoading(true);
      await userSettingsService.deleteSetting(key);
      
      // 更新本地状态
      setSettings(prev => {
        const newSettings = { ...prev };
        delete newSettings[key];
        return newSettings;
      });
      
      return true;
    } catch (error) {
      console.error('删除设置失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    // 状态
    loading,
    settings,
    isLoggedIn: !!user?.id,
    
    // 方法
    getSetting,
    saveSetting,
    saveSettings,
    getSettings,
    deleteSetting,
    
    // 便捷方法
    clearCache: userSettingsService.clearCache.bind(userSettingsService),
  };
}

/**
 * 特定设置 Hook - 主题设置
 */
export function useThemeSettings() {
  const { getSetting, saveSetting, loading } = useUserSettings();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [themeColor, setThemeColor] = useState<string>('#3b82f6');

  useEffect(() => {
    const loadThemeSettings = async () => {
      const mode = await getSetting(SETTING_KEYS.THEME_MODE, 'auto');
      const color = await getSetting(SETTING_KEYS.THEME_COLOR, '#3b82f6');
      
      setThemeMode(mode);
      setThemeColor(color);
    };

    loadThemeSettings();
  }, [getSetting]);

  const updateThemeMode = useCallback(async (mode: 'light' | 'dark' | 'auto') => {
    const success = await saveSetting(SETTING_KEYS.THEME_MODE, mode, {
      updated_from: 'theme_settings'
    });
    if (success) {
      setThemeMode(mode);
    }
    return success;
  }, [saveSetting]);

  const updateThemeColor = useCallback(async (color: string) => {
    const success = await saveSetting(SETTING_KEYS.THEME_COLOR, color, {
      updated_from: 'theme_settings'
    });
    if (success) {
      setThemeColor(color);
    }
    return success;
  }, [saveSetting]);

  return {
    loading,
    themeMode,
    themeColor,
    updateThemeMode,
    updateThemeColor,
  };
}

/**
 * 特定设置 Hook - UI设置
 */
export function useUISettings() {
  const { getSetting, saveSetting, loading } = useUserSettings();
  const [language, setLanguage] = useState<string>('zh-CN');
  const [density, setDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [animations, setAnimations] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const loadUISettings = async () => {
      const lang = await getSetting(SETTING_KEYS.UI_LANGUAGE, 'zh-CN');
      const dens = await getSetting(SETTING_KEYS.UI_DENSITY, 'comfortable');
      const anim = await getSetting(SETTING_KEYS.UI_ANIMATIONS, true);
      const sidebar = await getSetting(SETTING_KEYS.UI_SIDEBAR_COLLAPSED, false);
      
      setLanguage(lang);
      setDensity(dens);
      setAnimations(anim);
      setSidebarCollapsed(sidebar);
    };

    loadUISettings();
  }, [getSetting]);

  const updateLanguage = useCallback(async (lang: string) => {
    const success = await saveSetting(SETTING_KEYS.UI_LANGUAGE, lang, {
      updated_from: 'ui_settings'
    });
    if (success) {
      setLanguage(lang);
    }
    return success;
  }, [saveSetting]);

  const updateDensity = useCallback(async (dens: 'compact' | 'comfortable' | 'spacious') => {
    const success = await saveSetting(SETTING_KEYS.UI_DENSITY, dens, {
      updated_from: 'ui_settings'
    });
    if (success) {
      setDensity(dens);
    }
    return success;
  }, [saveSetting]);

  const updateAnimations = useCallback(async (enabled: boolean) => {
    const success = await saveSetting(SETTING_KEYS.UI_ANIMATIONS, enabled, {
      updated_from: 'ui_settings'
    });
    if (success) {
      setAnimations(enabled);
    }
    return success;
  }, [saveSetting]);

  const updateSidebarCollapsed = useCallback(async (collapsed: boolean) => {
    const success = await saveSetting(SETTING_KEYS.UI_SIDEBAR_COLLAPSED, collapsed, {
      updated_from: 'ui_settings'
    });
    if (success) {
      setSidebarCollapsed(collapsed);
    }
    return success;
  }, [saveSetting]);

  return {
    loading,
    language,
    density,
    animations,
    sidebarCollapsed,
    updateLanguage,
    updateDensity,
    updateAnimations,
    updateSidebarCollapsed,
  };
}

/**
 * 特定设置 Hook - 内容适配器设置
 */
export function useContentAdapterSettings() {
  const { getSetting, saveSetting, loading } = useUserSettings();
  
  const saveGlobalSettings = useCallback(async (settings: any) => {
    return await saveSetting(SETTING_KEYS.CONTENT_ADAPTER_GLOBAL, settings, {
      updated_from: 'content_adapter',
      settings_type: 'global'
    });
  }, [saveSetting]);

  const savePlatformSettings = useCallback(async (settings: any) => {
    return await saveSetting(SETTING_KEYS.CONTENT_ADAPTER_PLATFORM, settings, {
      updated_from: 'content_adapter',
      settings_type: 'platform'
    });
  }, [saveSetting]);

  const getGlobalSettings = useCallback(async (defaultValue?: any) => {
    return await getSetting(SETTING_KEYS.CONTENT_ADAPTER_GLOBAL, defaultValue);
  }, [getSetting]);

  const getPlatformSettings = useCallback(async (defaultValue?: any) => {
    return await getSetting(SETTING_KEYS.CONTENT_ADAPTER_PLATFORM, defaultValue);
  }, [getSetting]);

  return {
    loading,
    saveGlobalSettings,
    savePlatformSettings,
    getGlobalSettings,
    getPlatformSettings,
  };
}