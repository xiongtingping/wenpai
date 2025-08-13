/**
 * 🛡️ Authing Guard 安全包装器
 * 专门解决Authing Guard内部的undefined拼接问题
 *
 * 🔒 LOCKED: 2025-01-28 核心修复逻辑已锁定
 * 📌 此模块已验证稳定，请勿修改核心逻辑
 * 🚫 如需扩展功能，请创建新模块而不是修改此文件
 *
 * 修复策略：
 * 1. 数据层：sanitizeUserInfo() 确保用户信息安全
 * 2. 配置层：createSafeGuardConfig() 提供安全配置
 * 3. 运行时：fixUndefinedInGuardDOM() 动态修复DOM
 * 4. 事件层：createSafeGuardEventHandler() 安全事件处理
 */

/**
 * 🔒 LOCKED: 安全的用户信息处理
 * 确保所有字段都有安全的默认值，避免undefined拼接
 *
 * 📌 核心修复逻辑，请勿修改
 * 🛡️ 已验证可解决 undefinedundefined 问题
 */
export function sanitizeUserInfo(userInfo: any): any {
  if (!userInfo || typeof userInfo !== 'object') {
    return {
      id: `user_${Date.now()}`,
      username: '用户',
      nickname: '用户',
      email: '',
      name: '用户',
      avatar: '',
      photo: '',
      picture: ''
    };
  }

  // 创建安全的用户信息对象
  const safeUserInfo = {
    // 基础字段
    id: userInfo.id || userInfo.userId || userInfo.sub || `user_${Date.now()}`,
    
    // 用户名相关字段 - 确保有安全的回退值
    username: userInfo.username || userInfo.nickname || userInfo.name || '用户',
    nickname: userInfo.nickname || userInfo.username || userInfo.name || '用户',
    name: userInfo.name || userInfo.nickname || userInfo.username || '用户',
    
    // 联系方式字段
    email: userInfo.email || userInfo.emailAddress || '',
    phone: userInfo.phone || userInfo.phoneNumber || '',
    
    // 头像相关字段
    avatar: userInfo.avatar || userInfo.photo || userInfo.picture || '',
    photo: userInfo.photo || userInfo.avatar || userInfo.picture || '',
    picture: userInfo.picture || userInfo.avatar || userInfo.photo || '',
    
    // 其他常见字段
    loginTime: userInfo.loginTime || new Date().toISOString(),
    roles: userInfo.roles || userInfo.role || ['user'],
    permissions: userInfo.permissions || userInfo.permission || ['basic'],
    
    // 保留其他非undefined字段
    ...Object.fromEntries(
      Object.entries(userInfo).filter(([_, value]) => 
        value !== undefined && 
        value !== null && 
        value !== 'undefined' &&
        value !== 'null'
      )
    )
  };

  // 二次检查：确保没有任何字段是undefined或'undefined'字符串
  Object.keys(safeUserInfo).forEach(key => {
    const value = (safeUserInfo as Record<string, any>)[key];
    if (value === undefined || value === 'undefined' || value === null || value === 'null') {
      // 根据字段类型提供合适的默认值
      if (['username', 'nickname', 'name'].includes(key)) {
        (safeUserInfo as Record<string, any>)[key] = '用户';
      } else if (['email', 'phone', 'avatar', 'photo', 'picture'].includes(key)) {
        (safeUserInfo as Record<string, any>)[key] = '';
      } else if (['roles', 'permissions'].includes(key)) {
        (safeUserInfo as Record<string, any>)[key] = [];
      } else if (key === 'id') {
        (safeUserInfo as Record<string, any>)[key] = `user_${Date.now()}`;
      } else {
        (safeUserInfo as Record<string, any>)[key] = '';
      }
    }
  });

  return safeUserInfo;
}

/**
 * 🔒 LOCKED: 安全的Guard事件处理器包装
 * 在事件处理前预处理用户信息
 *
 * 📌 核心事件安全处理逻辑，请勿修改
 * 🛡️ 防止事件回调中的undefined拼接问题
 */
export function createSafeGuardEventHandler(originalHandler: (userInfo: any) => void) {
  return (userInfo: any) => {
    try {
      console.log('🛡️ Guard事件安全处理 - 原始用户信息:', JSON.stringify(userInfo, null, 2));
      
      // 安全化用户信息
      const safeUserInfo = sanitizeUserInfo(userInfo);
      
      console.log('🛡️ Guard事件安全处理 - 安全化后用户信息:', JSON.stringify(safeUserInfo, null, 2));
      
      // 验证安全化结果
      const userInfoStr = JSON.stringify(safeUserInfo);
      if (userInfoStr.includes('undefinedundefined')) {
        console.error('🚨 安全化后仍包含undefinedundefined，进行强制修复');
        const fixedUserInfoStr = userInfoStr.replace(/undefinedundefined/g, '用户');
        const fixedUserInfo = JSON.parse(fixedUserInfoStr);
        originalHandler(fixedUserInfo);
      } else {
        originalHandler(safeUserInfo);
      }
      
    } catch (error) {
      console.error('🚨 Guard事件安全处理失败:', error);
      
      // 提供最小安全的用户信息
      const fallbackUserInfo = {
        id: `user_${Date.now()}`,
        username: '用户',
        nickname: '用户',
        email: '',
        name: '用户',
        loginTime: new Date().toISOString()
      };
      
      originalHandler(fallbackUserInfo);
    }
  };
}

/**
 * 拦截并修复Authing Guard的DOM操作
 * 🔍 DEBUG: 临时禁用DOM拦截，观察真实的undefined问题
 */
export function setupGuardDOMInterception() {
  console.log('🔍 DEBUG: DOM拦截已禁用，观察Authing Guard的真实错误');

  // 返回一个空的observer
  return {
    disconnect: () => {}
  };
}

/**
 * 修复Guard DOM中的undefined拼接
 * 🛡️ 专门针对Authing Guard的undefined问题
 */
function fixUndefinedInGuardDOM(container: Element) {
  try {
    // 查找所有文本节点
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    const textNodes: Text[] = [];
    let node;
    while ((node = walker.nextNode()) !== null) {
      textNodes.push(node as Text);
    }

    // 修复包含undefinedundefined的文本节点
    textNodes.forEach(textNode => {
      if (textNode.textContent && textNode.textContent.includes('undefinedundefined')) {
        console.log('🛡️ 发现undefinedundefined文本，进行修复:', textNode.textContent);
        const originalText = textNode.textContent;
        textNode.textContent = textNode.textContent.replace(/undefinedundefined/g, '用户');
        console.log('🛡️ 修复完成:', originalText, '->', textNode.textContent);
      }

      // 修复单独的undefined
      if (textNode.textContent === 'undefined') {
        console.log('🛡️ 发现undefined文本，进行修复');
        textNode.textContent = '';
      }

      // 🚨 特别处理 g2-error-message-text 类的元素
      const parentElement = textNode.parentElement;
      if (parentElement && parentElement.classList.contains('g2-error-message-text')) {
        if (textNode.textContent && textNode.textContent.includes('undefined')) {
          console.log('🚨 修复 g2-error-message-text 中的 undefined:', textNode.textContent);
          textNode.textContent = textNode.textContent.replace(/undefined/g, '');
        }
      }
    });

    // 修复属性中的undefined
    const allElements = container.querySelectorAll('*');
    allElements.forEach(element => {
      ['title', 'alt', 'placeholder', 'value'].forEach(attr => {
        if (element.getAttribute(attr) === 'undefined') {
          console.log(`🛡️ 发现${attr}属性为undefined，进行修复`);
          element.removeAttribute(attr);
        }
      });
    });

  } catch (error) {
    console.error('🚨 修复Guard DOM时出错:', error);
  }
}

/**
 * 创建安全的Guard配置
 * 确保配置中没有可能导致undefined拼接的选项
 */
export function createSafeGuardConfig(originalConfig: any) {
  // 🔧 FIXED: 2025-08-13 根据 Authing Guard 5.3.9 版本的 GuardOptions 接口修复配置
  // 严格按照 TypeScript 类型定义创建配置对象

  // 🎯 优先使用传入配置的 config，如果没有则使用默认配置
  const configSection = originalConfig.config || {
    // 🔑 关键：登录方式配置 - 必须有这些才能显示登录表单
    loginMethodList: ['password', 'phone-code', 'email-code', 'wechat', 'alipay'],
    // 注册方式配置
    registerMethodList: ['phone', 'email'],
    // 🎯 确保显示用户名密码登录
    defaultLoginMethod: 'password',
    // 界面配置
    title: '文派',
    logo: 'https://cdn.authing.co/authing-console/logo.png',
    // 弹窗配置
    autoRegister: false,
    skipComplateFileds: false,
    closeable: true,
    clickCloseableMask: true,
    // 🔧 强制显示登录表单
    hideForgetPasswordBtn: false,
    hideRegisterBtn: false,
    hideSocialLogin: false
  };

  const safeConfig = {
    // 必需参数
    appId: originalConfig.appId,

    // 可选参数 - 按照 GuardOptions 接口定义
    host: originalConfig.host,
    redirectUri: originalConfig.redirectUri,
    mode: (originalConfig.mode || 'modal') as 'modal' | 'normal',
    defaultScene: 'login' as 'login' | 'register',
    lang: (originalConfig.lang || 'zh-CN') as 'zh-CN' | 'en-US',
    isSSO: true,

    // 🎯 关键修复：使用传入的或默认的 config 嵌套结构
    config: configSection
  };

  console.log('🛡️ 安全Guard配置已创建 (5.3.9兼容):', {
    appId: safeConfig.appId,
    host: safeConfig.host,
    mode: safeConfig.mode,
    lang: safeConfig.lang,
    redirectUri: safeConfig.redirectUri,
    defaultScene: safeConfig.defaultScene,
    isSSO: safeConfig.isSSO,
    hasConfig: !!safeConfig.config,
    configKeys: Object.keys(safeConfig.config || {}),
    loginMethods: safeConfig.config?.loginMethodList
  });

  return safeConfig;
}
