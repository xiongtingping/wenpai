#!/usr/bin/env node

/**
 * App.tsx 国际化自动替换脚本
 * 处理主应用组件中的硬编码中文文本
 */

import fs from 'fs';
import path from 'path';

const APP_PATH = 'src/App.tsx';
const ZH_LOCALE_PATH = 'src/i18n/locales/zh-CN.json';
const EN_LOCALE_PATH = 'src/i18n/locales/en-US.json';

class AppI18n {
  constructor() {
    this.replacements = [];
    this.zhTranslations = {};
    this.enTranslations = {};
    this.processedCount = 0;
  }

  /**
   * 运行国际化处理
   */
  async run() {
    console.log('🚀 开始 App.tsx 国际化处理...\n');

    try {
      // 1. 加载现有翻译文件
      await this.loadExistingTranslations();
      
      // 2. 定义翻译映射
      this.defineTranslations();
      
      // 3. 处理App文件
      await this.processAppFile();
      
      // 4. 更新翻译文件
      await this.updateTranslationFiles();
      
      console.log(`\n✅ App.tsx 国际化完成！`);
      console.log(`📊 处理了 ${this.processedCount} 处文本替换`);
      
    } catch (error) {
      console.error('❌ 国际化处理失败:', error.message);
      process.exit(1);
    }
  }

  /**
   * 加载现有翻译文件
   */
  async loadExistingTranslations() {
    console.log('📖 加载现有翻译文件...');
    
    if (fs.existsSync(ZH_LOCALE_PATH)) {
      this.zhTranslations = JSON.parse(fs.readFileSync(ZH_LOCALE_PATH, 'utf8'));
    }
    
    if (fs.existsSync(EN_LOCALE_PATH)) {
      this.enTranslations = JSON.parse(fs.readFileSync(EN_LOCALE_PATH, 'utf8'));
    }
    
    console.log('✅ 翻译文件加载完成');
  }

  /**
   * 定义翻译映射
   */
  defineTranslations() {
    console.log('🔤 定义翻译映射...');

    // 扩展app部分的翻译
    if (!this.zhTranslations.app) {
      this.zhTranslations.app = {};
    }
    if (!this.enTranslations.app) {
      this.enTranslations.app = {};
    }

    // 错误处理相关
    this.zhTranslations.app.errors = {
      ...this.zhTranslations.app.errors,
      loadThemeFailed: "加载持久化主题失败",
      unknownError: "未知错误",
      unknownErrorType: "未知错误类型",
      noStackTrace: "无堆栈信息",
      appLevelErrorDetails: "应用级错误详情",
      appLevelError: "应用级错误",
      simplified: "简化",
      removeRedundant: "移除冗余的",
      avoidNestedErrorBoundary: "避免嵌套错误边界混乱",
      removeRedundantEndTag: "移除冗余的结束标签"
    };

    this.enTranslations.app.errors = {
      ...this.enTranslations.app.errors,
      loadThemeFailed: "Failed to load persisted theme",
      unknownError: "Unknown error",
      unknownErrorType: "Unknown error type", 
      noStackTrace: "No stack trace",
      appLevelErrorDetails: "App-level error details",
      appLevelError: "App-level error",
      simplified: "simplified",
      removeRedundant: "Remove redundant",
      avoidNestedErrorBoundary: "Avoid nested error boundary confusion",
      removeRedundantEndTag: "Remove redundant end tag"
    };

    // 主题相关
    this.zhTranslations.app.theme = {
      loadPersistedTheme: "App启动时加载持久化主题",
      themeApplied: "主题已在App启动时应用",
      useDefaultLightTheme: "App启动时使用默认浅色主题",
      clearAllThemeClasses: "清除所有主题类，应用新主题",
      tailwindDarkCompatibility: "Tailwind dark类兼容性",
      loadThemeImmediately: "立即执行主题加载",
      fromLocalStorage: "从localStorage读取持久化主题"
    };

    this.enTranslations.app.theme = {
      loadPersistedTheme: "Load persisted theme on app startup",
      themeApplied: "Theme applied on app startup",
      useDefaultLightTheme: "Use default light theme on app startup", 
      clearAllThemeClasses: "Clear all theme classes, apply new theme",
      tailwindDarkCompatibility: "Tailwind dark class compatibility",
      loadThemeImmediately: "Execute theme loading immediately",
      fromLocalStorage: "Read persisted theme from localStorage"
    };

    // 应用启动相关
    this.zhTranslations.app.startup = {
      checkMaliciousCallback: "应用启动时检查是否为恶意回调URL",
      guardProviderRemoved: "GuardProvider 已移除 - 仅使用自定义登录表单",
      parseAuthCode: "App层解析到授权码",
      redirectToCorrect: "App层重定向到",
      detectMaliciousCallback: "App层检测到恶意回调URL，立即处理重定向...",
      safelySerializeError: "安全地序列化错误对象",
      useRealAuthState: "使用真实的认证状态"
    };

    this.enTranslations.app.startup = {
      checkMaliciousCallback: "Check for malicious callback URL on app startup",
      guardProviderRemoved: "GuardProvider removed - only use custom login form",
      parseAuthCode: "App layer parsed authorization code",
      redirectToCorrect: "App layer redirect to",
      detectMaliciousCallback: "App layer detected malicious callback URL, handling redirect immediately...",
      safelySerializeError: "Safely serialize error object", 
      useRealAuthState: "Use real authentication state"
    };

    // 注释和描述
    this.zhTranslations.app.comments = {
      mainAppComponent: "文派 - 主应用组件 (已清理测试代码)",
      unifiedAuthPermission: "统一的用户认证和权限控制",
      routeGuardAccess: "路由守卫和访问控制",
      secureStateManagement: "安全的状态管理",
      corePageComponents: "核心页面组件",
      businessFunctionPages: "业务功能页面",
      tempDebugPages: "临时调试页面",
      lazyLoadComponents: "懒加载组件，避免TDZ错误和循环依赖",
      errorBoundaryWrapper: "错误边界包装器，处理懒加载失败",
      conditionalNavComponent: "条件性导航组件",
      unifiedStateInit: "统一状态管理初始化组件 - 修复状态闪烁问题",
      mainAppComponentTitle: "主应用组件"
    };

    this.enTranslations.app.comments = {
      mainAppComponent: "WenPai - Main App Component (Test code cleaned)",
      unifiedAuthPermission: "Unified user authentication and permission control",
      routeGuardAccess: "Route guard and access control", 
      secureStateManagement: "Secure state management",
      corePageComponents: "Core page components",
      businessFunctionPages: "Business function pages",
      tempDebugPages: "Temporary debug pages",
      lazyLoadComponents: "Lazy load components, avoid TDZ errors and circular dependencies",
      errorBoundaryWrapper: "Error boundary wrapper, handle lazy loading failures",
      conditionalNavComponent: "Conditional navigation component",
      unifiedStateInit: "Unified state management initializer - fix state flashing issue",
      mainAppComponentTitle: "Main App Component"
    };

    // 路由相关
    this.zhTranslations.app.routes = {
      homePage: "首页",
      loginRegisterPages: "登录注册页面", 
      compatibleOldRoutes: "兼容旧路由",
      loginCallbackPage: "登录回调页面 - 支持各种回调URL格式",
      coreFunctionPages: "核心功能页面 - 需要登录",
      userRelatedPages: "用户相关页面 - 需要登录",
      paymentRelatedPages: "支付相关页面",
      infoPages: "信息页面",
      tempDebugPages: "临时调试页面 - 用于Token统计修复",
      dialogPositionTestPage: "Dialog定位测试页面",
      i18nTestPage: "国际化测试页面",
      errorPages: "错误页面",
      catchAllRoutes: "捕获所有未匹配路由，检查是否为恶意回调URL"
    };

    this.enTranslations.app.routes = {
      homePage: "Home Page",
      loginRegisterPages: "Login and Register Pages",
      compatibleOldRoutes: "Compatible Old Routes", 
      loginCallbackPage: "Login Callback Page - Support various callback URL formats",
      coreFunctionPages: "Core Function Pages - Login Required",
      userRelatedPages: "User Related Pages - Login Required",
      paymentRelatedPages: "Payment Related Pages",
      infoPages: "Information Pages",
      tempDebugPages: "Temporary Debug Pages - For Token Statistics Fix",
      dialogPositionTestPage: "Dialog Position Test Page",
      i18nTestPage: "Internationalization Test Page", 
      errorPages: "Error Pages",
      catchAllRoutes: "Catch all unmatched routes, check for malicious callback URLs"
    };

    // 全局组件
    this.zhTranslations.app.globalComponents = {
      globalNotification: "全局通知组件",
      customAuthModal: "自定义认证模态框", 
      sessionManagement: "会话管理",
      backToTopButton: "返回顶部按钮"
    };

    this.enTranslations.app.globalComponents = {
      globalNotification: "Global Notification Component",
      customAuthModal: "Custom Authentication Modal",
      sessionManagement: "Session Management", 
      backToTopButton: "Back to Top Button"
    };

    this.defineReplacements();
    console.log('✅ 翻译映射定义完成');
  }

  /**
   * 定义替换规则
   */
  defineReplacements() {
    this.replacements = [
      // 注释替换
      {
        search: /文派 - 主应用组件 \(已清理测试代码\)/g,
        replace: "{t('app.comments.mainAppComponent')}"
      },
      {
        search: /统一的用户认证和权限控制/g,
        replace: "{t('app.comments.unifiedAuthPermission')}"
      },
      {
        search: /路由守卫和访问控制/g,
        replace: "{t('app.comments.routeGuardAccess')}"
      },
      {
        search: /安全的状态管理/g,
        replace: "{t('app.comments.secureStateManagement')}"
      },

      // 错误处理替换
      {
        search: /'加载持久化主题失败'/g,
        replace: "t('app.errors.loadThemeFailed')"
      },
      {
        search: /'未知错误'/g,
        replace: "t('app.errors.unknownError')"
      },
      {
        search: /'未知错误类型'/g,
        replace: "t('app.errors.unknownErrorType')"
      },
      {
        search: /'无堆栈信息'/g,
        replace: "t('app.errors.noStackTrace')"
      },
      {
        search: /'应用级错误详情'/g,
        replace: "t('app.errors.appLevelErrorDetails')"
      },
      {
        search: /'应用级错误'/g,
        replace: "t('app.errors.appLevelError')"
      },

      // 主题相关替换
      {
        search: /App启动时加载持久化主题/g,
        replace: "{t('app.theme.loadPersistedTheme')}"
      },
      {
        search: /主题已在App启动时应用/g,
        replace: "{t('app.theme.themeApplied')}"
      },
      {
        search: /App启动时使用默认浅色主题/g,
        replace: "{t('app.theme.useDefaultLightTheme')}"
      },

      // 启动相关替换
      {
        search: /应用启动时检查是否为恶意回调URL/g,
        replace: "{t('app.startup.checkMaliciousCallback')}"
      },
      {
        search: /App层解析到授权码/g,
        replace: "{t('app.startup.parseAuthCode')}"
      },

      // 路由注释替换
      {
        search: /首页/g,
        replace: "{t('app.routes.homePage')}"
      },
      {
        search: /登录注册页面/g,
        replace: "{t('app.routes.loginRegisterPages')}"
      },
      {
        search: /核心功能页面 - 需要登录/g,
        replace: "{t('app.routes.coreFunctionPages')}"
      },
      {
        search: /用户相关页面 - 需要登录/g,
        replace: "{t('app.routes.userRelatedPages')}"
      },
      {
        search: /支付相关页面/g,
        replace: "{t('app.routes.paymentRelatedPages')}"
      },
      {
        search: /信息页面/g,
        replace: "{t('app.routes.infoPages')}"
      },
      {
        search: /错误页面/g,
        replace: "{t('app.routes.errorPages')}"
      },

      // 全局组件替换
      {
        search: /全局通知组件/g,
        replace: "{t('app.globalComponents.globalNotification')}"
      },
      {
        search: /自定义认证模态框/g,
        replace: "{t('app.globalComponents.customAuthModal')}"
      },
      {
        search: /会话管理/g,
        replace: "{t('app.globalComponents.sessionManagement')}"
      },
      {
        search: /返回顶部按钮/g,
        replace: "{t('app.globalComponents.backToTopButton')}"
      }
    ];
  }

  /**
   * 处理App文件
   */
  async processAppFile() {
    console.log('🔄 处理App文件...');

    if (!fs.existsSync(APP_PATH)) {
      throw new Error(`App文件不存在: ${APP_PATH}`);
    }

    let content = fs.readFileSync(APP_PATH, 'utf8');

    // 确保已导入useTranslation
    if (!content.includes('useTranslation')) {
      console.log('✅ useTranslation已存在');
    }

    // 在App组件中添加useTranslation hook
    if (!content.includes('const { t } = useTranslation()')) {
      content = content.replace(
        /const App: React\.FC = \(\) => \{/,
        `const App: React.FC = () => {
  const { t } = useTranslation();`
      );
      console.log('✅ 添加useTranslation hook到App组件');
    }

    // 应用替换规则
    for (const replacement of this.replacements) {
      const beforeCount = (content.match(replacement.search) || []).length;
      content = content.replace(replacement.search, replacement.replace);
      const afterCount = (content.match(replacement.search) || []).length;
      this.processedCount += beforeCount - afterCount;
    }

    // 保存修改后的文件
    fs.writeFileSync(APP_PATH, content);
    console.log(`✅ App文件处理完成，共替换 ${this.processedCount} 处文本`);
  }

  /**
   * 更新翻译文件
   */
  async updateTranslationFiles() {
    console.log('💾 更新翻译文件...');

    // 保存中文翻译
    fs.writeFileSync(ZH_LOCALE_PATH, JSON.stringify(this.zhTranslations, null, 2));
    console.log('✅ 中文翻译文件已更新');

    // 保存英文翻译
    fs.writeFileSync(EN_LOCALE_PATH, JSON.stringify(this.enTranslations, null, 2));
    console.log('✅ 英文翻译文件已更新');
  }
}

// 运行脚本
const appI18n = new AppI18n();
appI18n.run().catch(console.error);
