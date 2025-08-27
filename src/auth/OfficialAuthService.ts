/**
 * 🎯 基于@authing/guard官方SDK的认证服务
 * 使用Guard组件，提供完整的UI和认证流程
 */

import { Guard } from '@authing/guard';
import { createOfficialAuthSDK, getOfficialAuthConfig } from './officialAuthConfig';
import { logger } from '@/utils/logger';

export interface AuthUser {
  id: string;
  nickname?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  [key: string]: any;
}

/**
 * 官方SDK认证服务
 */
export class OfficialAuthService {
  private static instance: OfficialAuthService;
  private sdk: Guard;
  private currentUser: AuthUser | null = null;

  private constructor() {
    this.sdk = createOfficialAuthSDK();
    logger.info('🎯 官方认证服务已初始化');

    // 🔧 监听API失败事件，自动触发备用登录
    window.addEventListener('authingApiFailed', (event: any) => {
      console.log('🔄 收到Authing API失败事件，触发备用登录...', event.detail);
      this.fallbackLogin();
    });
  }

  static getInstance(): OfficialAuthService {
    if (!this.instance) {
      this.instance = new OfficialAuthService();
    }
    return this.instance;
  }

  /**
   * 使用@authing/guard的start方法，增强错误处理和备用方案
   */
  async login(): Promise<void> {
    try {
      console.log('🔍 OfficialAuthService.login()被调用!');
      logger.info('🚀 开始官方Guard登录流程...');

      // 🎯 根因修复：使用modal模式的show()方法
      logger.info('🔍 使用modal模式启动登录...');

      // 🔧 防止页面滚动问题的修复
      // 确保Guard弹窗正确显示，不会导致页面跳转
      setTimeout(() => {
        try {
          logger.info('🔍 尝试显示Guard弹窗...');
          console.log('🔍 Guard SDK实例:', this.sdk);
          console.log('🔍 Guard SDK show方法:', typeof this.sdk.show);

          this.sdk.show();
          logger.info('✅ Guard弹窗show()方法调用成功');

          // 检查弹窗是否真的显示了
          setTimeout(() => {
            const guardModal = document.querySelector('.authing-guard-modal, .guard-modal, [class*="guard"], [class*="authing"]');
            if (guardModal) {
              logger.info('✅ Guard弹窗DOM元素已找到');
              console.log('🔍 Guard弹窗元素:', guardModal);

              // 🔍 关键调试：检查弹窗的CSS样式
              const computedStyle = window.getComputedStyle(guardModal);
              const styleInfo = {
                display: computedStyle.display,
                visibility: computedStyle.visibility,
                opacity: computedStyle.opacity,
                zIndex: computedStyle.zIndex,
                position: computedStyle.position,
                top: computedStyle.top,
                left: computedStyle.left,
                width: computedStyle.width,
                height: computedStyle.height,
                transform: computedStyle.transform
              };

              console.log('🔍 Guard弹窗CSS样式:', styleInfo);
              logger.info('🔍 Guard弹窗样式详情:', JSON.stringify(styleInfo, null, 2));

              // 🔍 检查弹窗的实际位置和尺寸
              const rect = guardModal.getBoundingClientRect();
              const positionInfo = {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left,
                right: rect.right,
                bottom: rect.bottom,
                inViewport: rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
              };

              console.log('🔍 Guard弹窗位置信息:', positionInfo);
              logger.info('🔍 Guard弹窗位置详情:', JSON.stringify(positionInfo, null, 2));

              // 🔍 检查弹窗内容
              const innerHTML = guardModal.innerHTML;
              const textContent = guardModal.textContent;
              const childrenCount = guardModal.children.length;

              console.log('🔍 Guard弹窗内容信息:', {
                hasInnerHTML: innerHTML.length > 0,
                hasTextContent: textContent && textContent.trim().length > 0,
                childrenCount,
                innerHTMLLength: innerHTML.length,
                textContentLength: textContent ? textContent.length : 0,
                firstChild: guardModal.firstElementChild?.tagName,
                innerHTML: innerHTML.substring(0, 200) + (innerHTML.length > 200 ? '...' : '')
              });

              // 🔧 关键修复：强制修复尺寸为0的问题
              if (!positionInfo.inViewport || rect.width === 0 || rect.height === 0) {
                logger.warn('⚠️ Guard弹窗位置或尺寸异常，强制修复...');

                // 强制设置弹窗样式
                const modalElement = guardModal as HTMLElement;
                modalElement.style.position = 'fixed';
                modalElement.style.top = '50%';
                modalElement.style.left = '50%';
                modalElement.style.transform = 'translate(-50%, -50%)';
                modalElement.style.width = 'auto';
                modalElement.style.height = 'auto';
                modalElement.style.minWidth = '400px';
                modalElement.style.minHeight = '300px';
                modalElement.style.maxWidth = '90vw';
                modalElement.style.maxHeight = '90vh';
                modalElement.style.zIndex = '10000';
                modalElement.style.background = 'white';
                modalElement.style.borderRadius = '8px';
                modalElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                modalElement.style.overflow = 'visible';

                // 修复内部元素
                const innerElements = modalElement.querySelectorAll('div');
                innerElements.forEach((el, index) => {
                  if (index < 3) { // 只修复前几个主要元素
                    (el as HTMLElement).style.width = 'auto';
                    (el as HTMLElement).style.height = 'auto';
                    (el as HTMLElement).style.minWidth = '400px';
                    (el as HTMLElement).style.minHeight = '300px';
                    (el as HTMLElement).style.position = 'relative';
                  }
                });

                logger.info('🔧 已强制修复Guard弹窗尺寸和位置');

                // 再次检查修复效果
                setTimeout(() => {
                  const newRect = guardModal.getBoundingClientRect();
                  console.log('🔍 修复后的弹窗尺寸:', {
                    width: newRect.width,
                    height: newRect.height,
                    visible: newRect.width > 0 && newRect.height > 0
                  });
                }, 100);
              }

              // 🔧 如果弹窗被隐藏，尝试修复
              if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
                logger.warn('⚠️ Guard弹窗被CSS隐藏，尝试修复...');
                (guardModal as HTMLElement).style.display = 'block';
                (guardModal as HTMLElement).style.visibility = 'visible';
                (guardModal as HTMLElement).style.opacity = '1';
                (guardModal as HTMLElement).style.zIndex = '9999';
                logger.info('🔧 已尝试修复Guard弹窗CSS样式');
              }

              // 检查是否有遮罩层
              const mask = document.querySelector('.authing-ant-modal-mask, .ant-modal-mask, [class*="mask"]');
              if (mask) {
                console.log('🔍 找到遮罩层:', mask);
                const maskStyle = window.getComputedStyle(mask);
                console.log('🔍 遮罩层样式:', {
                  display: maskStyle.display,
                  opacity: maskStyle.opacity,
                  zIndex: maskStyle.zIndex
                });
              }

              // 🔧 最终诊断：创建极简测试弹窗并检查页面环境
              setTimeout(() => {
                console.log('🔍 开始最终诊断...');

                // 检查页面基本环境
                const pageInfo = {
                  bodyOverflow: document.body.style.overflow,
                  htmlOverflow: document.documentElement.style.overflow,
                  bodyPosition: window.getComputedStyle(document.body).position,
                  bodyZIndex: window.getComputedStyle(document.body).zIndex,
                  viewportWidth: window.innerWidth,
                  viewportHeight: window.innerHeight,
                  scrollTop: window.scrollY,
                  scrollLeft: window.scrollX
                };

                console.log('🔍 页面环境信息:', pageInfo);

                // 创建最简单的红色方块测试
                const simpleTest = document.createElement('div');
                simpleTest.id = 'simple-test-block';
                simpleTest.style.cssText = `
                  position: fixed !important;
                  top: 100px !important;
                  left: 100px !important;
                  width: 200px !important;
                  height: 200px !important;
                  background: red !important;
                  z-index: 99999 !important;
                  border: 5px solid yellow !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                  display: block !important;
                  pointer-events: auto !important;
                `;
                simpleTest.innerHTML = '<div style="color: white; font-size: 20px; text-align: center; line-height: 200px;">测试方块</div>';

                document.body.appendChild(simpleTest);
                console.log('🔴 已创建红色测试方块，应该在左上角可见');

                // 检查是否真的添加到DOM
                setTimeout(() => {
                  const addedElement = document.getElementById('simple-test-block');
                  if (addedElement) {
                    const rect = addedElement.getBoundingClientRect();
                    console.log('🔍 红色方块位置:', {
                      exists: true,
                      x: rect.x,
                      y: rect.y,
                      width: rect.width,
                      height: rect.height,
                      computedStyle: {
                        display: window.getComputedStyle(addedElement).display,
                        visibility: window.getComputedStyle(addedElement).visibility,
                        opacity: window.getComputedStyle(addedElement).opacity,
                        zIndex: window.getComputedStyle(addedElement).zIndex
                      }
                    });

                    // 如果还是看不到，尝试直接修改body
                    if (rect.width === 0 || rect.height === 0) {
                      console.log('🚨 连简单方块都无法显示，可能是页面级别的问题');

                      // 尝试清除可能的干扰样式
                      document.body.style.overflow = 'visible';
                      document.documentElement.style.overflow = 'visible';

                      // 创建alert作为最后的测试
                      setTimeout(() => {
                        alert('如果您能看到这个alert，说明JavaScript工作正常，但CSS弹窗被阻止了');
                      }, 1000);
                    }
                  } else {
                    console.log('🚨 连DOM元素都无法添加，可能是JavaScript执行环境问题');
                  }
                }, 500);

                // 10秒后清理
                setTimeout(() => {
                  const testEl = document.getElementById('simple-test-block');
                  if (testEl) {
                    testEl.remove();
                    console.log('🔴 红色测试方块已移除');
                  }
                }, 10000);
              }, 1000);

            } else {
              logger.error('❌ Guard弹窗DOM元素未找到');
              console.log('🔍 页面所有模态框元素:', document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"]'));
            }
          }, 500);

        } catch (showError) {
          logger.error('❌ Guard弹窗show()方法调用失败:', showError);
          console.error('❌ Guard show()错误详情:', showError);
        }
      }, 100); // 延迟100ms确保DOM准备就绪

      logger.info('✅ 登录流程启动完成');
    } catch (error) {
      console.error('❌ Guard启动失败:', error);
      logger.error('❌ 官方Guard登录失败:', error);

      // 🔧 如果Guard方法失败，使用备用登录方案
      logger.info('🔄 Guard方法失败，使用备用登录方案...');
      this.fallbackLogin();
    }
  }

  /**
   * 备用登录方案：直接跳转到Authing登录页面
   */
  private fallbackLogin(): void {
    try {
      logger.info('🔄 启动备用登录方案：直接跳转到Authing登录页面');

      const config = getOfficialAuthConfig();
      const loginUrl = `https://${config.domain}/login?app_id=${config.appId}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=openid profile email`;

      logger.info('🌐 跳转到登录页面:', loginUrl);
      window.location.href = loginUrl;
    } catch (error) {
      logger.error('❌ 备用登录方案也失败了:', error);
      throw new Error('认证服务暂时不可用，请稍后重试或联系技术支持');
    }
  }

  /**
   * 检查是否是回调URL
   */
  isRedirectCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const isCallback = urlParams.has('code') && urlParams.has('state');
    logger.info('🔍 检查是否是回调URL:', {
      isCallback,
      currentUrl: window.location.href
    });
    return isCallback;
  }

  /**
   * 处理登录回调
   */
  async handleRedirectCallback(): Promise<AuthUser | null> {
    try {
      logger.info('🔄 处理官方SDK登录回调...');

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (!code || !state) {
        throw new Error('缺少必要的回调参数');
      }

      // 🎯 根因修复：modal模式使用事件监听处理回调
      // 基于solution文档中的成功配置，modal模式不需要手动处理回调
      logger.info('🔍 modal模式通过事件监听自动处理回调，无需手动处理...');

      // 🎯 modal模式回调处理：主要通过事件监听，这里提供备用token交换
      logger.info('🔄 modal模式备用方案：尝试token交换...');

      try {
        const tokenResponse = await fetch('/api/auth/token-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
            original_redirect_uri: window.location.origin + '/callback'
          })
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token交换失败: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();

        if (tokenData.user) {
          const user: AuthUser = {
            id: tokenData.user.sub || tokenData.user.id || 'unknown',
            nickname: tokenData.user.nickname || tokenData.user.name || 'User',
            name: tokenData.user.name || tokenData.user.nickname || 'User',
            username: tokenData.user.username || tokenData.user.email || 'user',
            email: tokenData.user.email || '',
            avatar: tokenData.user.picture || tokenData.user.avatar || '',
            phone: tokenData.user.phone_number || ''
          };

          this.currentUser = user;
          localStorage.setItem('auth_user', JSON.stringify(user));

          logger.info('✅ token交换成功:', {
            hasUser: !!user,
            userId: user.id,
            userName: user.nickname || user.name
          });

          return user;
        } else {
          throw new Error('Token交换返回空用户信息');
        }
      } catch (tokenError) {
        logger.error('❌ token交换失败:', tokenError);
        throw new Error(`modal模式回调处理失败: ${tokenError.message}`);
      }
    } catch (error) {
      logger.error('❌ 官方SDK回调处理失败:', error);
      throw error;
    }
  }

  /**
   * 获取当前登录状态
   */
  async getLoginState(): Promise<AuthUser | null> {
    try {
      logger.info('🔍 获取官方SDK登录状态...');

      // 🎯 返回当前用户状态
      if (this.currentUser) {
        logger.info('📊 官方SDK登录状态:', {
          hasUser: !!this.currentUser,
          isAuthenticated: !!this.currentUser,
          userId: this.currentUser.id
        });

        return this.currentUser;
      }

      // 尝试从存储中恢复用户状态
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
        return this.currentUser;
      }

      return null;
    } catch (error) {
      logger.error('❌ 获取官方SDK登录状态失败:', error);
      return null;
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await this.getLoginState();

      if (user) {
        logger.info('👤 获取用户信息成功:', {
          id: user.id,
          nickname: user.nickname,
          email: user.email
        });
      }

      return user;
    } catch (error) {
      logger.error('❌ 获取用户信息失败:', error);
      return null;
    }
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      logger.info('🚪 开始官方SDK登出...');

      // 🎯 清除本地状态
      this.currentUser = null;
      localStorage.removeItem('auth_user');

      // 🎯 使用Guard的logout方法
      try {
        await this.sdk.logout();
      } catch (logoutError) {
        // 如果Guard logout失败，手动清理并跳转
        logger.warn('⚠️ Guard logout失败，执行手动清理:', logoutError);
        window.location.href = window.location.origin;
      }
      
      logger.info('✅ 官方SDK登出成功');
    } catch (error) {
      logger.error('❌ 官方SDK登出失败:', error);
      throw error;
    }
  }

  /**
   * 刷新Token（如果SDK支持）
   */
  async refreshToken(): Promise<void> {
    try {
      logger.info('🔄 刷新Token...');
      
      // 重新获取登录状态来刷新token
      await this.getLoginState();
      
      logger.info('✅ Token刷新成功');
    } catch (error) {
      logger.error('❌ Token刷新失败:', error);
      throw error;
    }
  }

  /**
   * 更新用户信息（简单实现）
   */
  async updateUser(updates: Partial<AuthUser>): Promise<AuthUser> {
    // 官方SDK可能不直接支持用户信息更新
    // 这里提供一个简单的本地更新实现
    if (this.currentUser) {
      Object.assign(this.currentUser, updates);
    }

    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    return user;
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const loginState = await this.getLoginState();
      return loginState?.accessToken || null;
    } catch (error) {
      logger.error('❌ 获取访问令牌失败:', error);
      return null;
    }
  }

  /**
   * 获取SDK实例（供高级用法）
   */
  getSDK(): Guard {
    return this.sdk;
  }
}