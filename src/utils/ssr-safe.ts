/**
 * SSR 安全工具函数
 * 确保在服务端渲染环境下不会报错
 */

/**
 * 检查是否在客户端环境
 */
export const isClient = typeof window !== 'undefined';

/**
 * 检查是否在服务端环境
 */
export const isServer = typeof window === 'undefined';

/**
 * 安全获取 window 对象
 */
export const getWindow = (): Window | null => {
  return isClient ? window : null;
};

/**
 * 安全获取 document 对象
 */
export const getDocument = (): Document | null => {
  return isClient ? document : null;
};

/**
 * 安全获取 localStorage
 */
export const getLocalStorage = (): Storage | null => {
  return isClient ? localStorage : null;
};

/**
 * 安全获取 sessionStorage
 */
export const getSessionStorage = (): Storage | null => {
  return isClient ? sessionStorage : null;
};

/**
 * 安全获取 navigator 对象
 */
export const getNavigator = (): Navigator | null => {
  return isClient ? navigator : null;
};

/**
 * 安全设置 localStorage
 */
export const setLocalStorage = (key: string, value: string): void => {
  const storage = getLocalStorage();
  if (storage) {
    storage.setItem(key, value);
  }
};

/**
 * 安全获取 localStorage
 */
export const getLocalStorageItem = (key: string): string | null => {
  const storage = getLocalStorage();
  return storage ? storage.getItem(key) : null;
};

/**
 * 安全删除 localStorage
 */
export const removeLocalStorage = (key: string): void => {
  const storage = getLocalStorage();
  if (storage) {
    storage.removeItem(key);
  }
};

/**
 * 安全清空 localStorage
 */
export const clearLocalStorage = (): void => {
  const storage = getLocalStorage();
  if (storage) {
    storage.clear();
  }
};

/**
 * 安全跳转页面
 */
export const safeNavigate = (url: string): void => {
  const win = getWindow();
  if (win) {
    win.location.href = url;
  }
};

/**
 * 安全打开新窗口
 */
export const safeOpenWindow = (url: string, target?: string): void => {
  const win = getWindow();
  if (win) {
    win.open(url, target || '_blank');
  }
};

/**
 * 安全复制到剪贴板
 */
export const safeCopyToClipboard = async (text: string): Promise<boolean> => {
  const nav = getNavigator();
  if (nav && nav.clipboard) {
    try {
      await nav.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      return false;
    }
  }
  return false;
};

/**
 * 安全获取当前 URL
 */
export const getCurrentUrl = (): string => {
  const win = getWindow();
  return win ? win.location.href : '';
};

/**
 * 安全获取当前路径
 */
export const getCurrentPath = (): string => {
  const win = getWindow();
  return win ? win.location.pathname : '';
};

/**
 * 安全获取当前域名
 */
export const getCurrentOrigin = (): string => {
  const win = getWindow();
  return win ? win.location.origin : '';
};

/**
 * 安全检查网络状态
 */
export const isOnline = (): boolean => {
  const nav = getNavigator();
  return nav ? nav.onLine : true;
};

/**
 * 安全获取用户代理
 */
export const getUserAgent = (): string => {
  const nav = getNavigator();
  return nav ? nav.userAgent : '';
}; 