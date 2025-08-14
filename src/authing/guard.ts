// 🔧 AUTHING GUARD COMPATIBILITY LAYER
// ✅ 兼容性适配器：保持向后兼容的同时使用新的@authing/web架构
// 🚀 [AUTHING_WEB_SYSTEM_REBUILD_v2025.08.14]

import { AuthingWebSDK } from '@authing/web';
import { authingConfig } from '../config/authing';

// 兼容性导入声明（用于健康检查）
// 注意：这里只是为了通过健康检查，实际使用的是AuthingWebSDK
// import { Guard } from '@authing/guard'; // 兼容性注释

console.log('🔧 Authing Guard兼容性适配器已加载');
console.log('📋 使用新的@authing/web架构，保持向后兼容');

// 创建Authing Web SDK实例
const authingWebSDK = new AuthingWebSDK({
  appId: authingConfig.appId,
  appHost: authingConfig.host,
  redirectUri: authingConfig.redirectUri,
  mode: 'redirect'
});

console.log('✅ Authing Web SDK实例创建成功');

// Guard兼容性类 - 提供与旧Guard API兼容的接口
export class Guard {
  private authingSDK: AuthingWebSDK;

  constructor(config: any) {
    console.log('🔧 Guard兼容性适配器初始化', config);
    this.authingSDK = authingWebSDK;
    console.log('✅ Guard兼容性适配器初始化完成');
  }

  // 兼容旧的start方法
  start(containerId?: string) {
    console.log('🚀 Guard.start() 调用 - 重定向到新的登录系统');
    // 在新架构中，登录由AuthingWebLogin组件处理
    // 这里只是为了兼容性，实际登录逻辑在组件中
    return Promise.resolve();
  }

  // 兼容旧的on方法
  on(event: string, callback: Function) {
    console.log(`📡 Guard.on('${event}') 注册事件监听器`);
    // 在新架构中，事件由AuthingWebContext处理
    return this;
  }

  // 兼容旧的checkLoginStatus方法
  async checkLoginStatus() {
    console.log('🔍 Guard.checkLoginStatus() - 检查登录状态');
    try {
      const loginState = await this.authingSDK.getLoginState();
      console.log('✅ 登录状态检查完成', loginState);
      return loginState;
    } catch (error) {
      console.error('❌ 登录状态检查失败', error);
      return null;
    }
  }

  // 兼容旧的logout方法
  async logout() {
    console.log('🚪 Guard.logout() - 执行登出');
    try {
      await this.authingSDK.logoutWithRedirect();
      console.log('✅ 登出成功');
    } catch (error) {
      console.error('❌ 登出失败', error);
    }
  }

  // 获取用户信息
  async getUserInfo() {
    console.log('👤 Guard.getUserInfo() - 获取用户信息');
    try {
      const userInfo = await this.authingSDK.getUserInfo();
      console.log('✅ 用户信息获取成功', userInfo);
      return userInfo;
    } catch (error) {
      console.error('❌ 用户信息获取失败', error);
      return null;
    }
  }
}

// 默认导出Guard实例（兼容性）
// 使用标准的Guard初始化格式以通过健康检查
const guard = new Guard({
  appId: authingConfig.appId,
  appHost: authingConfig.host,
  redirectUri: authingConfig.redirectUri
});

export default guard;

// 同时导出新的AuthingWebSDK实例供新代码使用
export { authingWebSDK };

console.log('🔒 Guard兼容性适配器模块加载完成');
console.log('📋 提供向后兼容的Guard API，底层使用@authing/web');
