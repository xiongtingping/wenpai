// @ts-nocheck - 服务文件，允许类型检查宽松
// import i18n from '@/i18n'; // 改为动态导入避免TDZ
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
  key: string;
  value: any;
  created_at?: string;
  updated_at?: string;
}

// 预定义的设置键
export const SETTING_KEYS = {
  // 主题设置
  THEME: 'user_theme',
  THEME_MODE: 'theme_mode', // light, dark, system
  THEME_COLOR: 'theme_color',
  THEME_PREFERENCE: 'theme_preference', // 统一主题偏好设置
  
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
  private tableValidated = false;

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
      this.tableValidated = false; // 重置验证状态
    }
  }

  /**
   * 验证数据库表结构
   */
  private async validateTable(): Promise<boolean> {
    if (this.tableValidated) {
      return true;
    }

    try {
      // 🔧 FIX: 使用实际的表结构字段名
      const { data, error } = await supabase
        .from('user_preferences')
        .select('id, user_id, key, value')
        .limit(1);

      if (error) {
        console.log('user_preferences表not exists，尝试creating...');
        
        // 尝试创建表
        const created = await this.createUserPreferencesTable();
        if (created) {
          this.tableValidated = true;
          return true;
        } else {
          throw new Error('无法创建user_preferences表');
        }
      }

      this.tableValidated = true;
      console.log('✅ user_preferences 表validatingsuccess');
      return true;
    } catch (error) {
      console.error('database表validatingabnormal:', error);
      throw error;
    }
  }

  /**
   * 创建user_preferences表
   */
  private async createUserPreferencesTable(): Promise<boolean> {
    console.error('❌ user_preferences表not exists！');
    console.error('');
    console.error('📋 请在Supabase SQLeditormiddleexecuting以downSQLstatement：');
    console.error('');
    console.error(`CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  key VARCHAR(255) NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_key UNIQUE(user_id, key)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(key);

-- 启用RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
DROP POLICY IF EXISTS "Users can access own preferences" ON user_preferences;
CREATE POLICY "Users can access own preferences" ON user_preferences
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);`);
    
    console.error('');
    console.error('🔗 或者使用simplifiedversion: cat /Users/xiong/wenpai/supabase-setup-simple.sql');
    console.error('');
    
    throw new Error('请先在Supabase中创建user_preferences表，然后刷新页面');
  }



  /**
   * 保存设置
   */
  async saveSetting(key: string, value: any, metadata: Record<string, any> = {}): Promise<void> {
    // 优先使用当前会话的用户ID，确保通过RLS
    let sessionUserId = this.userId;
    if (!sessionUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUserId = session?.user?.id || null;
      if (!sessionUserId) {
        console.warn('saveSetting skipped: anonymous session');
        return;
      }
      // 若有外部设置的 userId，与会话不一致则以会话为准，避免RLS拒绝
      this.userId = sessionUserId;
    }

    // 🔧 FIX: 使用实际的表结构字段名，让数据库自动生成 UUID
    const settingData = {
      user_id: sessionUserId,
      key: key,
      value: value
    };

    try {
      // 🔧 FIX: 使用实际的表结构字段名
      const { error } = await supabase
        .from('user_preferences')
        .upsert(settingData, {
          onConflict: 'user_id,key'
        });

      if (error) {
        console.error('savingsettingfailed:', error);
        console.error('savingdata:', settingData);
        throw new Error(`savingsettingfailed: ${error.message}`);
      }

      // 更新缓存
      this.cache.set(key, value);
    } catch (error) {
      console.error('savingsettingabnormal:', error);
      console.error('savingdata:', settingData);
      throw error;
    }
  }

  /**
   * 批量保存设置
   */
  async saveSettings(settings: Record<string, any>, metadata: Record<string, any> = {}): Promise<void> {
    // 会话校验，确保RLS通过
    let sessionUserId = this.userId;
    if (!sessionUserId) {
      const { data: { session } } = await supabase.auth.getSession();
      sessionUserId = session?.user?.id || null;
      if (!sessionUserId) {
        console.warn('saveSettings skipped: anonymous session');
        return;
      }
      this.userId = sessionUserId;
    }

    // 🔧 FIX: 使用实际的表结构字段名，让数据库自动生成 UUID
    const settingsData = Object.entries(settings).map(([key, value]) => {
      return {
        user_id: sessionUserId,
        key: key,
        value: value
      };
    });

    const { error } = await supabase
      .from('user_preferences')
      .upsert(settingsData, {
        onConflict: 'user_id,key'
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

    // 🔧 FIX: 验证表结构
    const isTableValid = await this.validateTable();
    if (!isTableValid) {
      console.debug('database表unavailable，使用defaultvalue');
      return defaultValue;
    }

    try {
      // 🔧 FIX: 使用实际的表结构字段名
      const { data, error } = await supabase
        .from('user_preferences')
        .select('value')
        .eq('user_id', this.userId)
        .eq('key', key)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('gettingsettingfailed:', error);
        console.error('queryingparameter:', { userId: this.userId, key });
        console.error('errordetails:', { code: error.code, message: error.message, details: error.details });
        return defaultValue;
      }

      const value = data?.value ?? defaultValue;

      // 缓存结果
      this.cache.set(key, value);

      return value;
    } catch (error) {
      console.error('gettingsettingabnormal:', error);
      console.error('queryingparameter:', { userId: this.userId, key });
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
      // 🔧 FIX: 验证表结构
      const isTableValid = await this.validateTable();
      if (!isTableValid) {
        console.warn('database表validatingfailed，skipping批量getting');
        return result;
      }

      try {
        // 🔧 FIX: 使用实际的表结构字段名
        let query = supabase
          .from('user_preferences')
          .select('key, value')
          .eq('user_id', this.userId);

        // 🔧 FIX: 对于 in 操作符，确保数组格式正确
        if (uncachedKeys.length === 1) {
          // 单个键使用 eq 而不是 in
          query = query.eq('key', uncachedKeys[0]);
        } else {
          // 多个键使用 in，确保数组格式正确
          query = query.in('key', uncachedKeys);
        }

        const { data, error } = await query;

        if (error && error.code !== 'PGRST116') {
          console.error('批量gettingsettingfailed:', error);
          console.error('queryingparameter:', { userId: this.userId, keys: uncachedKeys });
        } else if (data) {
          data.forEach(setting => {
            result[setting.key] = setting.value;
            this.cache.set(setting.key, setting.value);
          });
        }
      } catch (error) {
        console.error('批量gettingsettingabnormal:', error);
        console.error('queryingparameter:', { userId: this.userId, keys: uncachedKeys });
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
      // 🔧 FIX: 使用实际的表结构字段名
      const { data, error } = await supabase
        .from('user_preferences')
        .select('key, value')
        .eq('user_id', this.userId);

      if (error) {
        console.error('getting所hassettingfailed:', error);
        return {};
      }

      const result: Record<string, any> = {};
      data.forEach(setting => {
        result[setting.key] = setting.value;
        this.cache.set(setting.key, setting.value);
      });

      return result;
    } catch (error) {
      console.error('getting所hassettingabnormal:', error);
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

    // 🔧 FIX: 使用实际的表结构字段名
    const { error } = await supabase
      .from('user_preferences')
      .delete()
      .eq('user_id', this.userId)
      .eq('key', key);

    if (error) {
      throw new Error(`deletingsettingfailed: ${error.message}`);
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

  // ==================== 主题设置专用方法 ====================

  /**
   * 获取用户主题设置
   */
  async getThemeSettings(): Promise<{
    mode: 'light' | 'dark' | 'system';
    color?: string;
    preference?: string;
  }> {
    const settings = await this.getSettings([
      SETTING_KEYS.THEME_MODE,
      SETTING_KEYS.THEME_COLOR,
      SETTING_KEYS.THEME_PREFERENCE
    ]);

    return {
      mode: settings[SETTING_KEYS.THEME_MODE] || 'system',
      color: settings[SETTING_KEYS.THEME_COLOR],
      preference: settings[SETTING_KEYS.THEME_PREFERENCE]
    };
  }

  /**
   * 保存用户主题设置
   */
  async saveThemeSettings(themeSettings: {
    mode?: 'light' | 'dark' | 'system';
    color?: string;
    preference?: string;
  }): Promise<void> {
    const settingsToSave: Record<string, any> = {};

    if (themeSettings.mode !== undefined) {
      settingsToSave[SETTING_KEYS.THEME_MODE] = themeSettings.mode;
    }
    if (themeSettings.color !== undefined) {
      settingsToSave[SETTING_KEYS.THEME_COLOR] = themeSettings.color;
    }
    if (themeSettings.preference !== undefined) {
      settingsToSave[SETTING_KEYS.THEME_PREFERENCE] = themeSettings.preference;
    }

    if (Object.keys(settingsToSave).length > 0) {
      await this.saveSettings(settingsToSave);
    }
  }

  /**
   * 获取主题模式
   */
  async getThemeMode(): Promise<'light' | 'dark' | 'system'> {
    const mode = await this.getSetting(SETTING_KEYS.THEME_MODE);
    return mode || 'system';
  }

  /**
   * 保存主题模式
   */
  async saveThemeMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    await this.saveSetting(SETTING_KEYS.THEME_MODE, mode);
  }
}

// 延迟初始化单例实例，避免TDZ错误
let _userSettingsServiceInstance: UserSettingsService | null = null;

export const userSettingsService = {
  // 使用代理模式延迟初始化
  get getSetting() { return this._getInstance().getSetting.bind(this._getInstance()); },
  get saveSetting() { return this._getInstance().saveSetting.bind(this._getInstance()); },
  get saveSettings() { return this._getInstance().saveSettings.bind(this._getInstance()); },
  get getSettings() { return this._getInstance().getSettings.bind(this._getInstance()); },
  get deleteSetting() { return this._getInstance().deleteSetting.bind(this._getInstance()); },
  get getAllSettings() { return this._getInstance().getAllSettings.bind(this._getInstance()); },
  get clearAllSettings() { return this._getInstance().clearAllSettings.bind(this._getInstance()); },
  get clearCache() { return this._getInstance().clearCache.bind(this._getInstance()); },
  get preloadSettings() { return this._getInstance().preloadSettings.bind(this._getInstance()); },
  get setUserId() { return this._getInstance().setUserId.bind(this._getInstance()); },
  get getThemeMode() { return this._getInstance().getThemeMode.bind(this._getInstance()); },
  get saveThemeMode() { return this._getInstance().saveThemeMode.bind(this._getInstance()); },
  get getThemeSettings() { return this._getInstance().getThemeSettings.bind(this._getInstance()); },
  get saveThemeSettings() { return this._getInstance().saveThemeSettings.bind(this._getInstance()); },
  
  _getInstance(): UserSettingsService {
    if (!_userSettingsServiceInstance) {
      _userSettingsServiceInstance = UserSettingsService.getInstance();
    }
    return _userSettingsServiceInstance;
  }
};
