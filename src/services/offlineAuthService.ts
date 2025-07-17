/**
 * 离线认证服务
 * 当 Authing 连接失败时提供备用认证方案
 */

interface OfflineUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  isOffline: boolean;
}

class OfflineAuthService {
  private currentUser: OfflineUser | null = null;
  private listeners: Array<(user: OfflineUser | null, isAuth: boolean) => void> = [];

  /**
   * 离线登录
   */
  login(redirectUrl?: string): void {
    // 创建离线用户
    const offlineUser: OfflineUser = {
      id: 'offline-user-' + Date.now(),
      username: '离线用户',
      email: 'offline@wenpai.xyz',
      nickname: '离线用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=offline',
      isOffline: true
    };

    this.currentUser = offlineUser;
    this.notifyListeners(offlineUser, true);

    // 如果有重定向地址，延迟跳转
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
    }

    console.log('🔧 使用离线模式登录成功');
  }

  /**
   * 离线登出
   */
  logout(): void {
    this.currentUser = null;
    this.notifyListeners(null, false);
    console.log('🔧 离线模式登出成功');
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): OfflineUser | null {
    return this.currentUser;
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * 添加状态变化监听器
   */
  addListener(listener: (user: OfflineUser | null, isAuth: boolean) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  removeListener(listener: (user: OfflineUser | null, isAuth: boolean) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(user: OfflineUser | null, isAuth: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(user, isAuth);
      } catch (error) {
        console.error('离线认证监听器错误:', error);
      }
    });
  }

  /**
   * 处理登录回调
   */
  handleLoginCallback(): void {
    // 离线模式不需要处理回调
    console.log('🔧 离线模式：跳过登录回调处理');
  }
}

// 创建单例实例
const offlineAuthService = new OfflineAuthService();

export default offlineAuthService; 