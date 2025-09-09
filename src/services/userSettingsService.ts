/**
 * 用户设置管理服务
 * 提供统一的用户设置保存、加载和管理功能
 * 支持主题、偏好、个性化等各种用户自定义设置
 */

import { supabase } from '@/config/supabase';

// 设置类型定义
export interface UserSetting {
  id: string;
  user_id: string;
  data_key: string;
  data_value: any;
  data_category: 'preference' | 'theme' | 'ui' | 'feature' | 'content';
  sync_priority: number; // 1-10, 10最高
  metadata: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// 预定义的设置键
export const SETTING_KEYS = {
  // 主题设置
  THEME: 'user_theme',
  THEME_MODE: 'theme_mode', // light, dark, auto
  THEME_COLOR: 'theme_color',
  
  // UI设置
  UI_LANGUAGE: 'ui_language',
  UI_DENSITY: 'ui_density', // compact, comfortable, spacious
  UI_ANIMATIONS: 'ui_animations',
  UI_SIDEBAR_COLLAPSED: 'ui_sidebar_collapsed',
  
  // 内容适配器设置
  CONTENT_ADAPTER_GLOBAL: 'content_adapter_global_settings',
  CONTENT_ADAPTER_PLATFORM: 'content_adapter_platform_settings',
  
  // 个性化设置
  BRAND_PROFILES: 'user_brand_profiles',
  FAVORITE_PLATFORMS: 'favorite_platforms',
  DEFAULT_MODEL: 'default_ai_model',
  
  // 功能偏好
  AUTO_SAVE: 'auto_save_enabled',
  NOTIFICATIONS: 'notifications_settings',
  SHORTCUTS: 'keyboard_shortcuts',
  
  // 工作区设置
  WORKSPACE_LAYOUT: 'workspace_layout',
  PANEL_POSITIONS: 'panel_positions',
  EDITOR_SETTINGS: 'editor_settings'
} as const;

// 设置分类映射
export const SETTING_CATEGORIES = {
  [SETTING_KEYS.THEME]: 'theme',
  [SETTING_KEYS.THEME_MODE]: 'theme',
  [SETTING_KEYS.THEME_COLOR]: 'theme',
  [SETTING_KEYS.UI_LANGUAGE]: 'ui',
  [SETTING_KEYS.UI_DENSITY]: 'ui',
  [SETTING_KEYS.UI_ANIMATIONS]: 'ui',
  [SETTING_KEYS.UI_SIDEBAR_COLLAPSED]: 'ui',
  [SETTING_KEYS.CONTENT_ADAPTER_GLOBAL]: 'content',
  [SETTING_KEYS.CONTENT_ADAPTER_PLATFORM]: 'content',
  [SETTING_KEYS.BRAND_PROFILES]: 'preference',
  [SETTING_KEYS.FAVORITE_PLATFORMS]: 'preference',
  [SETTING_KEYS.DEFAULT_MODEL]: 'preference',
  [SETTING_KEYS.AUTO_SAVE]: 'feature',
  [SETTING_KEYS.NOTIFICATIONS]: 'feature',
  [SETTING_KEYS.SHORTCUTS]: 'feature',
  [SETTING_KEYS.WORKSPACE_LAYOUT]: 'ui',
  [SETTING_KEYS.PANEL_POSITIONS]: 'ui',
  [SETTING_KEYS.EDITOR_SETTINGS]: 'preference'
} as const;

// 优先级映射
export const SETTING_PRIORITIES = {
  [SETTING_KEYS.THEME]: 9,
  [SETTING_KEYS.THEME_MODE]: 9,
  [SETTING_KEYS.THEME_COLOR]: 8,
  [SETTING_KEYS.UI_LANGUAGE]: 10,
  [SETTING_KEYS.UI_DENSITY]: 7,
  [SETTING_KEYS.UI_ANIMATIONS]: 5,
  [SETTING_KEYS.UI_SIDEBAR_COLLAPSED]: 6,
  [SETTING_KEYS.CONTENT_ADAPTER_GLOBAL]: 8,
  [SETTING_KEYS.CONTENT_ADAPTER_PLATFORM]: 7,
  [SETTING_KEYS.BRAND_PROFILES]: 6,
  [SETTING_KEYS.FAVORITE_PLATFORMS]: 5,
  [SETTING_KEYS.DEFAULT_MODEL]: 7,
  [SETTING_KEYS.AUTO_SAVE]: 8,
  [SETTING_KEYS.NOTIFICATIONS]: 6,
  [SETTING_KEYS.SHORTCUTS]: 5,
  [SETTING_KEYS.WORKSPACE_LAYOUT]: 7,
  [SETTING_KEYS.PANEL_POSITIONS]: 6,
  [SETTING_KEYS.EDITOR_SETTINGS]: 6
} as const;

/**
 * 用户设置管理类
 */
export class UserSettingsService {
  private static instance: UserSettingsService;
  private cache = new Map<string, any>();
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  /**
   * 设置当前用户ID
   */
  setUserId(userId: string | null) {
    if (this.userId !== userId) {
      this.userId = userId;
      this.cache.clear(); // 清除缓存
    }
  }

  /**
   * 保存设置
   */
  async saveSetting(key: string, value: any, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.userId) {
      throw new Error('用户未登录，无法保存设置');
    }

    const category = SETTING_CATEGORIES[key as keyof typeof SETTING_CATEGORIES] || 'preference';
    const priority = SETTING_PRIORITIES[key as keyof typeof SETTING_PRIORITIES] || 5;

    const settingData = {
      id: `${this.userId}_${key}`,
      user_id: this.userId,
      data_key: key,
      data_value: value,
      data_category: category,
      sync_priority: priority,
      metadata: {
        ...metadata,
        last_updated: new Date().toISOString(),
        setting_version: '1.0'
      }
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(settingData, {
        onConflict: 'user_id,data_key'
      });

    if (error) {
      throw new Error(`保存设置失败: ${error.message}`);
    }

    // 更新缓存
    this.cache.set(key, value);
  }

  /**
   * 批量保存设置
   */
  async saveSettings(settings: Record<string, any>, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.userId) {
      throw new Error('用户未登录，无法保存设置');
    }

    const settingsData = Object.entries(settings).map(([key, value]) => {
      const category = SETTING_CATEGORIES[key as keyof typeof SETTING_CATEGORIES] || 'preference';
      const priority = SETTING_PRIORITIES[key as keyof typeof SETTING_PRIORITIES] || 5;

      return {
        id: `${this.userId}_${key}`,
        user_id: this.userId,
        data_key: key,
        data_value: value,
        data_category: category,
        sync_priority: priority,
        metadata: {
          ...metadata,
          last_updated: new Date().toISOString(),
          setting_version: '1.0'
        }
      };
    });

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(settingsData, {
        onConflict: 'user_id,data_key'
      });

    if (error) {
      throw new Error(`批量保存设置失败: ${error.message}`);
    }

    // 更新缓存
    Object.entries(settings).forEach(([key, value]) => {
      this.cache.set(key, value);
    });
  }

  /**
   * 获取设置
   */
  async getSetting<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
    if (!this.userId) {
      return defaultValue;
    }

    // 先检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('data_value')
        .eq('user_id', this.userId)
        .eq('data_key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('获取设置失败:', error);
        return defaultValue;
      }

      const value = data?.data_value ?? defaultValue;
      
      // 缓存结果
      this.cache.set(key, value);
      
      return value;
    } catch (error) {
      console.error('获取设置异常:', error);
      return defaultValue;
    }
  }

  /**
   * 批量获取设置
   */
  async getSettings(keys: string[]): Promise<Record<string, any>> {
    if (!this.userId) {
      return {};
    }

    const result: Record<string, any> = {};
    const uncachedKeys = keys.filter(key => !this.cache.has(key));

    // 从缓存获取已有数据
    keys.forEach(key => {
      if (this.cache.has(key)) {
        result[key] = this.cache.get(key);
      }
    });

    // 批量获取未缓存的数据
    if (uncachedKeys.length > 0) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('data_key, data_value')
          .eq('user_id', this.userId)
          .in('data_key', uncachedKeys);

        if (error && error.code !== 'PGRST116') {
          console.error('批量获取设置失败:', error);
        } else if (data) {
          data.forEach(setting => {
            result[setting.data_key] = setting.data_value;
            this.cache.set(setting.data_key, setting.data_value);
          });
        }
      } catch (error) {
        console.error('批量获取设置异常:', error);
      }
    }

    return result;
  }

  /**
   * 获取所有设置
   */
  async getAllSettings(): Promise<Record<string, any>> {
    if (!this.userId) {
      return {};
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('data_key, data_value')
        .eq('user_id', this.userId);

      if (error) {
        console.error('获取所有设置失败:', error);
        return {};
      }

      const result: Record<string, any> = {};
      data.forEach(setting => {
        result[setting.data_key] = setting.data_value;
        this.cache.set(setting.data_key, setting.data_value);
      });

      return result;
    } catch (error) {
      console.error('获取所有设置异常:', error);
      return {};
    }
  }

  /**
   * 删除设置
   */
  async deleteSetting(key: string): Promise<void> {
    if (!this.userId) {
      throw new Error('用户未登录，无法删除设置');
    }

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', this.userId)
      .eq('data_key', key);

    if (error) {
      throw new Error(`删除设置失败: ${error.message}`);
    }

    // 清除缓存
    this.cache.delete(key);
  }

  /**
   * 清除所有设置
   */
  async clearAllSettings(): Promise<void> {
    if (!this.userId) {
      throw new Error('用户未登录，无法清除设置');
    }

    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`清除所有设置失败: ${error.message}`);
    }

    // 清除缓存
    this.cache.clear();
  }

  /**
   * 预加载常用设置
   */
  async preloadSettings(): Promise<void> {
    if (!this.userId) {
      return;
    }

    const commonKeys = [
      SETTING_KEYS.THEME_MODE,
      SETTING_KEYS.THEME_COLOR,
      SETTING_KEYS.UI_LANGUAGE,
      SETTING_KEYS.UI_DENSITY,
      SETTING_KEYS.DEFAULT_MODEL,
      SETTING_KEYS.AUTO_SAVE,
      SETTING_KEYS.NOTIFICATIONS
    ];

    await this.getSettings(commonKeys);
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// 导出单例实例
export const userSettingsService = UserSettingsService.getInstance();