/**
 * 安全存储工具
 * 封装localStorage，后续可扩展加密等
 * @module secureStorage
 */
export const secureStorage = {
  /**
   * 获取存储内容
   * @param {string} key
   * @returns {any}
   */
  get(key: string) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  },
  /**
   * 设置存储内容
   * @param {string} key
   * @param {any} value
   */
  set(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  /**
   * 移除存储内容
   * @param {string} key
   */
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}; 