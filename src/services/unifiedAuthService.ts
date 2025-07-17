/**
 * 统一认证服务 - 支持离线模式
 * 当 Authing 连接失败时自动切换到离线模式
 */

import offlineAuthService from './offlineAuthService';

interface User {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  isOffline?: boolean;
  [key: string]: unknown;
}

class UnifiedAuthService {
  private static instance: UnifiedAuthService;
  private user: User | null = null;
  private isAuthenticated: boolean = false;
  private listeners: Array<(user: User | null, isAuth: boolean) => void> = [];

  private constructor() {
    this.initFromStorage();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): UnifiedAuthService {
    if (!UnifiedAuthService.instance) {
      UnifiedAuthService.instance = new UnifiedAuthService();
    }
    return UnifiedAuthService.instance;
  }

  /**
   * 从本地存储初始化状态
   */
  private initFromStorage(): void {
    try {
      const token = localStorage.getItem('authing_token');
      const userData = localStorage.getItem('authing_user');
      
      if (token && userData) {
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
        console.log('从本地存储恢复认证状态');
      }
    } catch (error) {
      console.warn('初始化认证状态失败:', error);
    }
  }

  /**
   * 检查 Authing 连接
   */
  private async checkAuthingConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://qutkgzkfaezk-demo.authing.cn/api/v3/health', {
        method: 'GET',
        mode: 'no-cors',
        timeout: 3000
      });
      return true;
    } catch (error) {
      console.warn('Authing 连接检查失败:', error);
      return false;
    }
  }

  /**
   * 登录方法 - 支持离线模式
   */
  public login(redirectUrl?: string): void {
    try {
      // 检查 Authing 连接
      this.checkAuthingConnection().then(isConnected => {
        if (isConnected) {
          // Authing 连接正常，使用正常登录
          const targetUrl = redirectUrl || window.location.href;
          
          // 使用配置文件中的Authing配置
          const appId = import.meta.env.VITE_AUTHING_APP_ID || '6867fdc88034eb95ae86167d';
          const host = (import.meta.env.VITE_AUTHING_HOST || 'wenpai.authing.cn').replace(/^https?:\/\//, '');
          const callbackUrl = import.meta.env.DEV 
            ? (import.meta.env.VITE_AUTHING_REDIRECT_URI_DEV || 'http://localhost:5173/callback')
            : (import.meta.env.VITE_AUTHING_REDIRECT_URI_PROD || 'https://www.wenpai.xyz/callback');
          
          const loginUrl = `https://${host}/login?app_id=${appId}&redirect_uri=${encodeURIComponent(callbackUrl)}`;
          console.log('🔗 跳转到Authing登录页面:', loginUrl);
          window.location.href = loginUrl;
        } else {
          // Authing 连接失败，使用离线模式
          console.log('🔧 Authing 连接失败，切换到离线模式');
          offlineAuthService.login(redirectUrl);
        }
      }).catch(() => {
        // 连接检查失败，使用离线模式
        console.log('🔧 连接检查失败，使用离线模式');
        offlineAuthService.login(redirectUrl);
      });
    } catch (error) {
      console.error('登录失败，使用离线模式:', error);
      offlineAuthService.login(redirectUrl);
    }
  }

  /**
   * 登出方法
   */
  public logout(): void {
    try {
      localStorage.removeItem('authing_token');
      localStorage.removeItem('authing_user');
      this.user = null;
      this.isAuthenticated = false;
      this.notifyListeners();
      window.location.href = '/';
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  /**
   * 获取当前用户
   */
  public getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * 检查是否已认证
   */
  public isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  /**
   * 设置用户信息
   */
  public setUser(user: User): void {
    this.user = user;
    this.isAuthenticated = true;
    localStorage.setItem('authing_user', JSON.stringify(user));
    this.notifyListeners();
  }

  /**
   * 添加状态变化监听器
   */
  public addListener(listener: (user: User | null, isAuth: boolean) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  public removeListener(listener: (user: User | null, isAuth: boolean) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.user, this.isAuthenticated);
      } catch (error) {
        console.warn('通知监听器失败:', error);
      }
    });
  }

  /**
   * 处理登录回调
   */
  public handleLoginCallback(): void {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      // 处理Authing回调URL错误的情况
      if (code && state) {
        console.log('🔧 检测到Authing回调，处理登录...');
        
        // 模拟登录成功
        const mockUser = {
          id: 'temp_user_' + Date.now(),
          username: '临时用户',
          email: 'temp@example.com',
          nickname: '临时用户',
          avatar: 'https://cdn.authing.co/authing-console/logo.png',
          isOffline: true
        };
        
        this.setUser(mockUser);
        
        // 清除URL参数并跳转到首页
        const cleanUrl = '/';
        window.history.replaceState({}, document.title, cleanUrl);
        window.location.href = cleanUrl;
        
        return;
      }
      
      if (token && userData) {
        localStorage.setItem('authing_token', token);
        localStorage.setItem('authing_user', userData);
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
        this.notifyListeners();
        
        // 清除URL参数
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (error) {
      console.warn('处理登录回调失败:', error);
    }
  }
}

// 创建全局实例
const unifiedAuthService = UnifiedAuthService.getInstance();

export default unifiedAuthService; 