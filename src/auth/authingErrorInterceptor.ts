/**
 * 🛡️ Authing前端错误拦截器
 * 专门处理来自cdn.authing.co的前端错误
 */

export class AuthingErrorInterceptor {
  private static instance: AuthingErrorInterceptor;
  private isActive = false;
  
  static getInstance(): AuthingErrorInterceptor {
    if (!this.instance) {
      this.instance = new AuthingErrorInterceptor();
    }
    return this.instance;
  }
  
  /**
   * 启动错误拦截
   */
  start(): void {
    if (this.isActive || typeof window === 'undefined') return;
    
    console.log('🛡️ 启动Authing前端错误拦截器');
    this.isActive = true;
    
    // 拦截全局错误
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleRejection.bind(this));
    
    // 监听页面跳转
    this.monitorNavigation();
  }
  
  /**
   * 处理JavaScript错误
   */
  private handleError(event: ErrorEvent): void {
    const { message, filename, lineno, colno } = event;
    
    // 检查是否是Authing相关错误
    if (this.isAuthingError(message, filename)) {
      console.error('🚨 捕获Authing前端错误:', {
        message,
        filename,
        lineno,
        colno,
        timestamp: new Date().toISOString()
      });
      
      // 如果是redirect错误，尝试修复
      if (message.includes('redirect')) {
        this.handleRedirectError(event);
      }
      
      // 阻止错误继续传播，避免影响用户体验
      event.preventDefault();
    }
  }
  
  /**
   * 处理Promise拒绝
   */
  private handleRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason;
    
    if (reason && typeof reason === 'object' && 'message' in reason) {
      const message = String(reason.message);
      
      if (this.isAuthingError(message)) {
        console.error('🚨 捕获Authing Promise拒绝:', {
          reason,
          timestamp: new Date().toISOString()
        });
        
        // 阻止未处理的拒绝报告
        event.preventDefault();
      }
    }
  }
  
  /**
   * 判断是否是Authing相关错误
   */
  private isAuthingError(message?: string, filename?: string): boolean {
    const authingKeywords = [
      'authing.co',
      'authing.cn', 
      'authing-fe-user-portal',
      'redirect',
      'authentication'
    ];
    
    const messageCheck = message && authingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const filenameCheck = filename && authingKeywords.some(keyword =>
      filename.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return messageCheck || filenameCheck;
  }
  
  /**
   * 处理重定向错误
   */
  private handleRedirectError(event: ErrorEvent): void {
    console.log('🔧 处理Authing重定向错误...');
    
    // 检查当前URL是否有问题
    const currentUrl = window.location.href;
    const hasMultipleUrls = currentUrl.includes('%20http') || currentUrl.includes(' http');
    
    if (hasMultipleUrls) {
      console.log('🔧 检测到多重URL问题，尝试清理...');
      this.cleanupMultipleUrls();
      return;
    }
    
    // 检查是否在回调页面但参数有问题
    if (currentUrl.includes('/callback')) {
      const urlParams = new URLSearchParams(window.location.search);
      const hasError = urlParams.has('error');
      
      if (hasError) {
        console.log('🔧 回调页面包含错误参数，返回主页...');
        this.redirectToHome();
        return;
      }
    }
    
    // 其他情况：延迟返回主页
    console.log('🔧 未知重定向问题，3秒后返回主页...');
    setTimeout(() => {
      this.redirectToHome();
    }, 3000);
  }
  
  /**
   * 清理多重URL问题
   */
  private cleanupMultipleUrls(): void {
    const currentUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    
    // 提取有效参数
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    // 构建清理后的URL
    const cleanBaseUrl = `${window.location.origin}/callback`;
    const cleanParams = new URLSearchParams();
    
    if (code) cleanParams.set('code', code);
    if (state) cleanParams.set('state', state);
    if (error) cleanParams.set('error', error);
    if (errorDescription) cleanParams.set('error_description', errorDescription);
    
    const cleanUrl = cleanParams.toString() 
      ? `${cleanBaseUrl}?${cleanParams.toString()}`
      : cleanBaseUrl;
    
    console.log('🔄 重定向到清理后的URL:', cleanUrl);
    window.location.replace(cleanUrl);
  }
  
  /**
   * 返回主页
   */
  private redirectToHome(): void {
    const homeUrl = window.location.origin;
    console.log('🏠 返回主页:', homeUrl);
    window.location.href = homeUrl;
  }
  
  /**
   * 监听页面导航
   */
  private monitorNavigation(): void {
    // 监听popstate事件
    window.addEventListener('popstate', () => {
      console.log('📍 页面导航事件:', window.location.href);
    });
    
    // 监听hashchange事件
    window.addEventListener('hashchange', () => {
      console.log('🔗 Hash变化:', window.location.hash);
    });
  }
  
  /**
   * 停止错误拦截
   */
  stop(): void {
    if (!this.isActive) return;
    
    console.log('🛑 停止Authing前端错误拦截器');
    this.isActive = false;
    
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handleRejection.bind(this));
  }
}

// 自动启动拦截器
if (typeof window !== 'undefined') {
  const interceptor = AuthingErrorInterceptor.getInstance();
  interceptor.start();
  
  // 暴露到全局供调试使用
  (window as any).AuthingErrorInterceptor = AuthingErrorInterceptor;
}